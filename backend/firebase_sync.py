"""
Firebase Sync API endpoints for DetoksBot
Handles synchronization between Firebase and local SQLite database
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import json

# Firebase Admin SDK
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    print("Warning: firebase-admin not installed. Run: pip install firebase-admin")

from database import Database

router = APIRouter(prefix="/api/sync", tags=["sync"])

# Firebase initialization
db_firestore = None

def init_firebase():
    """Initialize Firebase Admin SDK"""
    global db_firestore
    
    if not FIREBASE_AVAILABLE:
        return False
    
    if db_firestore is not None:
        return True
    
    try:
        # Check if already initialized
        firebase_admin.get_app()
    except ValueError:
        # Initialize with service account or default credentials
        # For now, use application default credentials
        try:
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred, {
                'projectId': 'diyetkent-6560d'
            })
        except Exception as e:
            print(f"Firebase initialization failed: {e}")
            return False
    
    db_firestore = firestore.client()
    return True


# ==================== MODELS ====================

class SyncStatus(BaseModel):
    collection: str
    lastSyncTime: Optional[str] = None
    localCount: int = 0
    remoteCount: int = 0
    pendingPush: int = 0
    pendingPull: int = 0

class SyncRequest(BaseModel):
    collection: str
    dietitianId: str
    lastSyncTime: Optional[str] = None

class AppointmentSync(BaseModel):
    id: Optional[str] = None
    firebaseId: Optional[str] = None
    clientName: str
    phone: Optional[str] = None
    date: str
    time: str
    types: Optional[List[str]] = []
    note: Optional[str] = None
    status: str = "pending"
    dietitianId: str
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    syncedAt: Optional[str] = None
    needsSync: bool = False


# ==================== SYNC ENDPOINTS ====================

@router.get("/status")
async def get_sync_status():
    """Get overall sync status"""
    with Database() as db:
        # Get last sync times from settings
        appointments_sync = db.get_setting("lastSync_appointments", None)
        
        # Count local records
        conn = db.connect()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM appointments")
        local_appointments = cursor.fetchone()[0]
        
        return {
            "firebase_available": FIREBASE_AVAILABLE,
            "firebase_initialized": db_firestore is not None,
            "collections": {
                "appointments": {
                    "lastSyncTime": appointments_sync,
                    "localCount": local_appointments
                }
            }
        }


@router.post("/appointments/pull")
async def pull_appointments(request: SyncRequest):
    """
    Pull new/updated appointments from Firebase to local DB.
    Only fetches records updated after lastSyncTime.
    """
    if not init_firebase():
        raise HTTPException(status_code=503, detail="Firebase not available")
    
    try:
        # Build query
        appointments_ref = db_firestore.collection('appointments')
        query = appointments_ref.where('dietitianId', '==', request.dietitianId)
        
        # If we have a lastSyncTime, only get records updated after that
        if request.lastSyncTime:
            last_sync = datetime.fromisoformat(request.lastSyncTime.replace('Z', '+00:00'))
            query = query.where('updatedAt', '>', last_sync)
        
        # Execute query
        docs = query.stream()
        
        pulled = 0
        with Database() as db:
            conn = db.connect()
            cursor = conn.cursor()
            
            for doc in docs:
                data = doc.to_dict()
                firebase_id = doc.id
                
                # Check if exists locally by firebase_id
                cursor.execute(
                    "SELECT id FROM appointments WHERE firebase_id = ?", 
                    (firebase_id,)
                )
                existing = cursor.fetchone()
                
                types_json = json.dumps(data.get('types', []))
                
                if existing:
                    # Update existing
                    cursor.execute("""
                        UPDATE appointments 
                        SET client_name = ?, phone = ?, date = ?, time = ?,
                            types = ?, note = ?, status = ?, synced_at = ?
                        WHERE firebase_id = ?
                    """, (
                        data.get('clientName'),
                        data.get('phone'),
                        data.get('date'),
                        data.get('time'),
                        types_json,
                        data.get('note'),
                        data.get('status', 'pending'),
                        datetime.now().isoformat(),
                        firebase_id
                    ))
                else:
                    # Insert new
                    cursor.execute("""
                        INSERT INTO appointments 
                        (firebase_id, client_name, phone, date, time, types, note, status, synced_at, needs_sync)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                    """, (
                        firebase_id,
                        data.get('clientName'),
                        data.get('phone'),
                        data.get('date'),
                        data.get('time'),
                        types_json,
                        data.get('note'),
                        data.get('status', 'pending'),
                        datetime.now().isoformat()
                    ))
                
                pulled += 1
            
            conn.commit()
            
            # Update last sync time
            db.set_setting("lastSync_appointments", datetime.now().isoformat())
        
        return {"pulled": pulled, "lastSyncTime": datetime.now().isoformat()}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/appointments/push")
async def push_appointments(request: SyncRequest):
    """
    Push local appointments that need sync to Firebase.
    Only pushes records with needs_sync = true.
    """
    if not init_firebase():
        raise HTTPException(status_code=503, detail="Firebase not available")
    
    try:
        pushed = 0
        
        with Database() as db:
            conn = db.connect()
            cursor = conn.cursor()
            
            # Get all appointments that need sync
            cursor.execute("""
                SELECT * FROM appointments WHERE needs_sync = 1
            """)
            rows = cursor.fetchall()
            
            for row in rows:
                appointment_data = {
                    'clientName': row['client_name'],
                    'phone': row['phone'],
                    'date': row['date'],
                    'time': row['time'],
                    'types': json.loads(row['types']) if row['types'] else [],
                    'note': row['note'],
                    'status': row['status'],
                    'dietitianId': request.dietitianId,
                    'updatedAt': firestore.SERVER_TIMESTAMP
                }
                
                if row['firebase_id']:
                    # Update existing in Firebase
                    db_firestore.collection('appointments').document(row['firebase_id']).update(appointment_data)
                else:
                    # Create new in Firebase
                    appointment_data['createdAt'] = firestore.SERVER_TIMESTAMP
                    doc_ref = db_firestore.collection('appointments').add(appointment_data)
                    firebase_id = doc_ref[1].id
                    
                    # Update local record with firebase_id
                    cursor.execute(
                        "UPDATE appointments SET firebase_id = ? WHERE id = ?",
                        (firebase_id, row['id'])
                    )
                
                # Mark as synced
                cursor.execute("""
                    UPDATE appointments 
                    SET needs_sync = 0, synced_at = ? 
                    WHERE id = ?
                """, (datetime.now().isoformat(), row['id']))
                
                pushed += 1
            
            conn.commit()
        
        return {"pushed": pushed}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/appointments/full")
async def full_sync_appointments(request: SyncRequest, background_tasks: BackgroundTasks):
    """
    Perform full bidirectional sync:
    1. Push local changes to Firebase
    2. Pull new changes from Firebase
    """
    push_result = await push_appointments(request)
    pull_result = await pull_appointments(request)
    
    return {
        "pushed": push_result["pushed"],
        "pulled": pull_result["pulled"],
        "lastSyncTime": pull_result["lastSyncTime"]
    }


@router.delete("/appointments/{appointment_id}")
async def delete_appointment_sync(appointment_id: int, dietitian_id: str):
    """Delete appointment from both local and Firebase"""
    with Database() as db:
        conn = db.connect()
        cursor = conn.cursor()
        
        # Get firebase_id before deleting
        cursor.execute("SELECT firebase_id FROM appointments WHERE id = ?", (appointment_id,))
        row = cursor.fetchone()
        
        if row and row['firebase_id'] and init_firebase():
            try:
                db_firestore.collection('appointments').document(row['firebase_id']).delete()
            except Exception as e:
                print(f"Failed to delete from Firebase: {e}")
        
        # Delete locally
        cursor.execute("DELETE FROM appointments WHERE id = ?", (appointment_id,))
        conn.commit()
    
    return {"deleted": True}
