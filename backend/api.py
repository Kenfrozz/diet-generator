from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import os
import sys
import shutil
import uuid

# Add current directory to path to allow importing local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import Database, get_data_dir

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("--- API RELOADED: Using Popen for Bot ---")
    db = Database()
    db.initialize()
    
    # Ensure avatars directory exists
    avatars_dir = os.path.join(get_data_dir(), "avatars")
    os.makedirs(avatars_dir, exist_ok=True)
    
    yield
    # Shutdown (if needed)

app = FastAPI(title="DetoksBot API", lifespan=lifespan)

# Configure CORS for Electron/React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the Electron app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (avatars)
# Ensure data dir exists first (it should via database init)
app.mount("/static", StaticFiles(directory=get_data_dir()), name="static")


# Initialize Database
def get_db():
    db = Database()
    return db

@app.get("/")
def read_root():
    return {"status": "ok", "message": "DetoksBot Backend is running"}

# --- Auth Models ---
class LoginRequest(BaseModel):
    username: str
    password: str

class PasswordResetRequest(BaseModel):
    username: str
    security_answer: str
    new_password: str

class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    old_password: Optional[str] = None # Optional for validation if needed
    security_question: Optional[str] = None
    security_answer: Optional[str] = None

# --- Recipe Models ---
class RecipeRequest(BaseModel):
    name: str
    meal_type: str
    pool_type: str
    bki_21_25: str
    bki_26_29: Optional[str] = None
    bki_30_33: Optional[str] = None
    bki_34_plus: Optional[str] = None

# --- API Endpoints ---

@app.post("/api/login")
def login(request: LoginRequest):
    db = get_db()
    user = db.verify_user(request.username, request.password)
    if user:
        # Remove sensitive data
        user.pop("password_hash", None)
        user.pop("security_answer_hash", None)
        return {"status": "success", "user": user}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/auth/security-question/{username}")
def get_security_question_endpoint(username: str):
    db = get_db()
    user = db.get_user_by_username(username)
    
    if not user:
        # User enumeration protection: return a generic error or fake logic? 
        # For this internal app, returning 404 is fine or simply "User not found".
        # But to be user friendly for "Forgot Password", we need to tell if user exists.
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
    if not user.get('security_question'):
        raise HTTPException(status_code=400, detail="Bu kullanıcı için güvenlik sorusu ayarlanmamış.")
        
    # Map key to readable text if needed, or return raw. The frontend can map.
    # But database stores what user selected.
    # If user selected 'custom', the question text is stored too? 
    # Wait, my Profile.jsx logic: if 'custom', it stored 'custom' in security_question?
    # Let's check `Profile.jsx`: 
    # if (finalQuestion === 'custom') finalQuestion = customQuestion;
    # So the DB stores the ACTUAL question text if custom. 
    # If standard, it stores the key (e.g. 'first_pet').
    # We should return what is stored. The frontend will decide if it needs mapping.
    
    return {"status": "success", "question": user['security_question']}

@app.post("/api/auth/reset-password")
def reset_password_endpoint(request: PasswordResetRequest):
    db = get_db()
    success = db.reset_password_with_security_answer(
        request.username, 
        request.security_answer, 
        request.new_password
    )
    
    if success:
        return {"status": "success", "message": "Şifre başarıyla sıfırlandı."}
    else:
        raise HTTPException(status_code=400, detail="Güvenlik cevabı hatalı veya kullanıcı bulunamadı.")

@app.post("/api/users/{user_id}/avatar")
async def upload_avatar(user_id: int, file: UploadFile = File(...)):
    try:
        data_dir = get_data_dir()
        avatars_dir = os.path.join(data_dir, "avatars")
        os.makedirs(avatars_dir, exist_ok=True)
        
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1]
        filename = f"avatar_{user_id}_{uuid.uuid4().hex}{file_ext}"
        file_path = os.path.join(avatars_dir, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Update user in DB
        db = get_db()
        # Relative path for serving via static
        relative_path = f"/static/avatars/{filename}"
        
        # We need to call update_user_profile but we only have avatar_path to update
        success = db.update_user_profile(user_id, avatar_path=relative_path)
        
        if success:
             return {"status": "success", "avatar_path": relative_path}
        else:
             raise HTTPException(status_code=500, detail="Database update failed")
             
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/users/{user_id}/profile")
def update_profile(user_id: int, profile: UserProfileUpdate):
    db = get_db()
    
    # If password change requested, maybe verify old password?
    # For now simplicity: just update if provided
    
    success = db.update_user_profile(
        user_id, 
        username=profile.username, 
        password=profile.password, 
        security_question=profile.security_question,
        security_answer=profile.security_answer
    )
    
    if success:
        # Fetch updated user to return
        user = db.get_user(user_id)
        if user:
            user.pop("password_hash", None)
            user.pop("security_answer_hash", None)
            return {"status": "success", "user": user}
        return {"status": "success"}
    else:
        raise HTTPException(status_code=400, detail="Update failed")

@app.get("/api/users/{user_id}")
def get_user(user_id: int):
    db = get_db()
    user = db.get_user(user_id)
    if user:
        user.pop("password_hash", None)
        user.pop("security_answer_hash", None)
        return {"status": "success", "user": user}
    raise HTTPException(status_code=404, detail="User not found")

@app.get("/api/recipes")
def get_recipes(pool_type: Optional[str] = None):
    db = get_db()
    recipes = db.get_all_recipes(pool_type=pool_type)
    # Map bki_21_25 to content for frontend compatibility
    for recipe in recipes:
        recipe['content'] = recipe.get('bki_21_25', '')
    return recipes

@app.post("/api/recipes")
def create_recipe(recipe: RecipeRequest):
    db = get_db()
    try:
        # Use BMI-specific fields, fallback to bki_21_25 if not provided
        db.add_recipe(
            recipe.name, 
            recipe.meal_type, 
            recipe.pool_type, 
            recipe.bki_21_25,
            recipe.bki_26_29 or recipe.bki_21_25,
            recipe.bki_30_33 or recipe.bki_21_25,
            recipe.bki_34_plus or recipe.bki_21_25
        )
        return {"status": "success", "message": "Recipe added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/recipes/{recipe_id}")
def update_recipe(recipe_id: int, recipe: RecipeRequest):
    db = get_db()
    try:
        # Use BMI-specific fields, fallback to bki_21_25 if not provided
        db.update_recipe(
            recipe_id,
            recipe.name, 
            recipe.meal_type, 
            recipe.pool_type, 
            recipe.bki_21_25,
            recipe.bki_26_29 or recipe.bki_21_25,
            recipe.bki_30_33 or recipe.bki_21_25,
            recipe.bki_34_plus or recipe.bki_21_25
        )
        return {"status": "success", "message": "Recipe updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/recipes/{recipe_id}")
def delete_recipe(recipe_id: int):
    db = get_db()
    try:
        db.delete_recipe(recipe_id)
        return {"status": "success", "message": "Recipe deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Settings Endpoints ---

class SettingsRequest(BaseModel):
    season: Optional[str] = None # Deprecated but kept for compatibility
    summer_start: Optional[str] = None
    summer_end: Optional[str] = None
    days_count: Optional[str] = None
    save_path: Optional[str] = None
    app_title: Optional[str] = None
    app_description: Optional[str] = None
    app_logo_path: Optional[str] = None

@app.get("/api/settings")
def get_settings():
    db = get_db()
    settings = db.get_all_settings()
    
    # Add season config info
    from database import get_current_season, get_season_config
    settings['season'] = get_current_season()
    
    config = get_season_config()
    settings['summer_start'] = config.get('summer_start', '04-01')
    settings['summer_end'] = config.get('summer_end', '10-01')
    
    return settings

@app.post("/api/settings")
def update_settings(settings: SettingsRequest):
    db = get_db()
    try:
        if settings.days_count:
            db.set_setting('days_count', settings.days_count)
        if settings.save_path:
            db.set_setting('save_path', settings.save_path)
            
        if settings.app_title is not None:
            db.set_setting('app_title', settings.app_title)
        if settings.app_description is not None:
             db.set_setting('app_description', settings.app_description)
        if settings.app_logo_path is not None:
             db.set_setting('app_logo_path', settings.app_logo_path)

        # Update season dates if provided
        if settings.summer_start and settings.summer_end:
            from database import save_season_config
            save_season_config(settings.summer_start, settings.summer_end)
            
        return {"status": "success", "message": "Settings updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/settings/logo")
async def upload_app_logo(file: UploadFile = File(...)):
    try:
        data_dir = get_data_dir()
        app_dir = os.path.join(data_dir, "app")
        os.makedirs(app_dir, exist_ok=True)
        
        file_ext = os.path.splitext(file.filename)[1]
        # Use unique name to ensure cache busting on frontend
        filename = f"logo_{uuid.uuid4().hex[:8]}{file_ext}"
        
        file_path = os.path.join(app_dir, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return relative path
        relative_path = f"/static/app/{filename}"
        return {"status": "success", "path": relative_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Template Models ---

class MealRequest(BaseModel):
    time: str
    meal_name: str
    meal_type: str

class TemplateRequest(BaseModel):
    name: str
    meals: List[MealRequest]

# --- Template Endpoints ---

@app.get("/api/templates")
def get_templates():
    db = get_db()
    templates = db.get_all_templates()
    return templates

@app.get("/api/templates/{template_id}")
def get_template(template_id: int):
    db = get_db()
    template = db.get_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@app.post("/api/templates")
def create_template(template: TemplateRequest):
    db = get_db()
    try:
        # Convert Pydantic models back to tuple list expected by database.py
        meals_data = [
            (m.time, m.meal_name, m.meal_type) for m in template.meals
        ]
        
        template_id = db.add_template(template.name, meals_data)
        return {"status": "success", "id": template_id, "message": "Template created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/templates/{template_id}")
def update_template(template_id: int, template: TemplateRequest):
    db = get_db()
    try:
        meals_data = [
            (m.time, m.meal_name, m.meal_type) for m in template.meals
        ]
        
        db.update_template(template_id, template.name, meals_data)
        return {"status": "success", "message": "Template updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/templates/{template_id}")
def delete_template(template_id: int):
    db = get_db()
    try:
        db.delete_template(template_id)
        return {"status": "success", "message": "Template deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Package Models ---

class PackageRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    save_path: str
    list_count: int = 1
    days_per_list: int = 7
    weight_change_per_list: float = 0

class RecipePackagesRequest(BaseModel):
    package_ids: List[int]

# --- Package Endpoints ---

@app.get("/api/packages")
def get_packages():
    db = get_db()
    packages = db.get_all_packages()
    return packages

@app.get("/api/packages/{package_id}")
def get_package(package_id: int):
    db = get_db()
    package = db.get_package(package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    return package

@app.post("/api/packages")
def create_package(package: PackageRequest):
    db = get_db()
    try:
        package_id = db.add_package(
            name=package.name,
            save_path=package.save_path,
            list_count=package.list_count,
            days_per_list=package.days_per_list,
            weight_change_per_list=package.weight_change_per_list,
            description=package.description
        )
        return {"status": "success", "id": package_id, "message": "Package created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/packages/{package_id}")
def update_package(package_id: int, package: PackageRequest):
    db = get_db()
    try:
        db.update_package(
            package_id=package_id,
            name=package.name,
            save_path=package.save_path,
            list_count=package.list_count,
            days_per_list=package.days_per_list,
            weight_change_per_list=package.weight_change_per_list,
            description=package.description
        )
        return {"status": "success", "message": "Package updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/packages/{package_id}")
def delete_package(package_id: int):
    db = get_db()
    try:
        db.delete_package(package_id)
        return {"status": "success", "message": "Package deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Recipe-Package Relationship Endpoints ---

@app.get("/api/recipes/{recipe_id}/packages")
def get_recipe_packages(recipe_id: int):
    db = get_db()
    packages = db.get_recipe_packages(recipe_id)
    return packages

@app.post("/api/recipes/{recipe_id}/packages")
def set_recipe_packages(recipe_id: int, request: RecipePackagesRequest):
    db = get_db()
    try:
        db.add_recipe_to_packages(recipe_id, request.package_ids)
        return {"status": "success", "message": "Recipe packages updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/recipes/{recipe_id}/packages/{package_id}")
def remove_recipe_from_package(recipe_id: int, package_id: int):
    db = get_db()
    try:
        db.remove_recipe_from_package(recipe_id, package_id)
        return {"status": "success", "message": "Recipe removed from package successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Appointment Endpoints ---

class AppointmentRequest(BaseModel):
    clientName: str
    phone: Optional[str] = None
    date: str
    time: str
    types: list = []
    note: Optional[str] = None
    status: Optional[str] = 'pending'

@app.get("/api/appointments")
def get_appointments(date: Optional[str] = None):
    db = get_db()
    appointments = db.get_all_appointments(date)
    # Convert snake_case to camelCase for frontend
    result = []
    for app in appointments:
        result.append({
            "id": app["id"],
            "clientName": app["client_name"],
            "phone": app["phone"],
            "date": app["date"],
            "time": app["time"],
            "types": app["types"],
            "note": app["note"],
            "status": app["status"]
        })
    return result

@app.post("/api/appointments")
def create_appointment(request: AppointmentRequest):
    db = get_db()
    try:
        appointment_id = db.add_appointment(
            request.clientName,
            request.phone,
            request.date,
            request.time,
            request.types,
            request.note,
            request.status
        )
        return {"status": "success", "id": appointment_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/appointments/{appointment_id}")
def update_appointment(appointment_id: int, request: AppointmentRequest):
    db = get_db()
    try:
        db.update_appointment(
            appointment_id,
            request.clientName,
            request.phone,
            request.date,
            request.time,
            request.types,
            request.note,
            request.status
        )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/appointments/{appointment_id}/status")
def update_appointment_status(appointment_id: int, status: str):
    db = get_db()
    try:
        db.update_appointment_status(appointment_id, status)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/appointments/{appointment_id}")
def delete_appointment(appointment_id: int):
    db = get_db()
    try:
        db.delete_appointment(appointment_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Generator Models ---

class GenerateDietRequest(BaseModel):
    patient_name: str
    weight: float
    height: float
    birth_year: int
    gender: str
    template_id: int
    package_id: int  # Yeni sistem: pool_type yerine package_id
    start_date: str
    excluded_foods: Optional[str] = ""
    combination_code: Optional[str] = ""
    output_format: str = "pdf"  # pdf, docx, both

# --- Generator Utils ---

def calculate_bmi_group(weight: float, height: float) -> str:
    # height in cm, convert to meters
    h_m = height / 100.0
    bmi = weight / (h_m * h_m)
    
    if bmi < 26:
        return "21_25"
    elif bmi < 30:
        return "26_29"
    elif bmi < 34:
        return "30_33"
    else:
        return "34_plus"

def create_single_list(db, template: dict, package_id: int, bki_group: str, 
                       days: int, exclude_words: list) -> list:
    """Tek bir liste için diyet programı oluştur."""
    import random
    
    diet_program = []
    
    for day in range(1, days + 1):
        day_meals = []
        
        for meal_tuple in template['meals']:
            meal_time, meal_name, meal_type = meal_tuple
            
            # Pakete ait tarifleri getir
            recipes = db.get_recipes_for_diet_by_package(package_id, meal_type, exclude_words)
            
            # BKİ grubuna göre içerik seç
            candidates = []
            for r in recipes:
                content_key = f"bki_{bki_group}"
                recipe_content = r.get(content_key, r.get('bki_21_25', ''))
                
                if recipe_content:
                    candidates.append({
                        "id": r['id'],
                        "name": r['name'],
                        "content": recipe_content
                    })
            
            # Rastgele seç
            if candidates:
                selected = random.choice(candidates)
                recipe_text = selected['content']
            else:
                recipe_text = "Uygun tarif bulunamadı."
            
            day_meals.append({
                "time": meal_time,
                "meal_name": meal_name,
                "meal_type": meal_type,
                "recipe_text": recipe_text
            })
        
        diet_program.append({
            "day": day,
            "meals": day_meals
        })
    
    return diet_program

# --- Generator Endpoints ---

@app.post("/api/generate")
def generate_diet(request: GenerateDietRequest):
    import random
    import datetime
    from pdf_generator import PDFGenerator
    from docx_generator import DOCXGenerator
    
    db = get_db()
    try:
        # 1. Paketi getir
        package = db.get_package(request.package_id)
        if not package:
            raise HTTPException(status_code=404, detail="Package not found")
        
        # 2. Şablonu getir
        template = db.get_template(request.template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        # 3. Hariç tutulacak kelimeleri hazırla
        exclude_words = [w.strip().lower() for w in request.excluded_foods.split(",") if w.strip()]
        
        # 4. Footer bilgilerini al
        footer_info = {
            "phone": db.get_setting("footer_phone", ""),
            "website": db.get_setting("footer_website", ""),
            "instagram": db.get_setting("footer_instagram", "")
        }
        
        # 5. Kayıt dizinini hazırla
        save_dir = package['save_path']
        if not save_dir or not os.path.exists(save_dir):
            # Dizin yoksa oluştur
            try:
                os.makedirs(save_dir, exist_ok=True)
            except:
                save_dir = os.path.join(os.path.expanduser("~"), "Desktop")
        
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M')
        patient_name_upper = request.patient_name.upper()
        
        # Türkçe ay isimleri
        turkish_months = {
            1: 'OCAK', 2: 'ŞUBAT', 3: 'MART', 4: 'NİSAN',
            5: 'MAYIS', 6: 'HAZİRAN', 7: 'TEMMUZ', 8: 'AĞUSTOS',
            9: 'EYLÜL', 10: 'EKİM', 11: 'KASIM', 12: 'ARALIK'
        }
        
        # Başlangıç tarihini parse et
        start_date = datetime.datetime.strptime(request.start_date, '%Y-%m-%d')
        
        generated_files = []
        current_weight = request.weight
        list_count = package['list_count']
        days_per_list = package['days_per_list']
        weight_change = package['weight_change_per_list']
        
        # 6. Her liste için döngü
        for list_num in range(1, list_count + 1):
            # Bu listenin başlangıç ve bitiş tarihlerini hesapla
            list_start_date = start_date + datetime.timedelta(days=(list_num - 1) * days_per_list)
            list_end_date = list_start_date + datetime.timedelta(days=days_per_list - 1)
            
            # Türkçe tarih formatı oluştur
            start_day = list_start_date.day
            start_month = turkish_months[list_start_date.month]
            end_day = list_end_date.day
            end_month = turkish_months[list_end_date.month]
            
            # Dosya adını oluştur: İSİM (BAŞLANGIÇ - BİTİŞ)
            date_range = f"{start_day} {start_month} - {end_day} {end_month}"
            base_filename = f"{patient_name_upper} ({date_range})"
            
            # Güncel BKİ grubunu hesapla
            bki_group = calculate_bmi_group(current_weight, request.height)
            
            # Bu liste için program oluştur
            diet_program = create_single_list(
                db=db,
                template=template,
                package_id=request.package_id,
                bki_group=bki_group,
                days=days_per_list,
                exclude_words=exclude_words
            )
            
            # PDF oluştur
            if request.output_format in ["pdf", "both"]:
                pdf_path = os.path.join(save_dir, f"{base_filename}.pdf")
                pdf_gen = PDFGenerator(footer_info=footer_info)
                pdf_gen.create_diet_pdf(
                    file_path=pdf_path,
                    diet_program=diet_program,
                    template_name=template['name'],
                    pool_type=package['name'],
                    bki_group=bki_group,
                    patient_info={
                        'patient_name': request.patient_name,
                        'weight': current_weight,
                        'height': request.height,
                        'birth_year': request.birth_year,
                        'end_date': f"{end_day} {end_month}"
                    },
                    start_date=f"{start_day} {start_month}"
                )
                generated_files.append(pdf_path)
            
            # DOCX oluştur
            if request.output_format in ["docx", "both"]:
                docx_path = os.path.join(save_dir, f"{base_filename}.docx")
                docx_gen = DOCXGenerator(footer_info=footer_info)
                
                # Kontrol tarihi (liste bitiş tarihi) formatla
                end_date_formatted = f"{end_day} {end_month}"
                
                docx_gen.create_diet_docx(
                    file_path=docx_path,
                    diet_program=diet_program,
                    patient_name=request.patient_name,
                    start_date=f"{start_day} {start_month}",
                    template_name=template['name'],
                    bki_group=bki_group,
                    excluded_foods=request.excluded_foods,
                    combination_code=request.combination_code,
                    patient_info={
                        'weight': current_weight,
                        'height': request.height,
                        'birth_year': request.birth_year,
                        'end_date': end_date_formatted
                    }
                )
                generated_files.append(docx_path)
            
            # Bir sonraki liste için kiloyu güncelle
            current_weight += weight_change
        
        return {
            "status": "success",
            "message": f"{list_count} liste başarıyla oluşturuldu",
            "files": generated_files,
            "lists_generated": list_count,
            "initial_bki_group": calculate_bmi_group(request.weight, request.height),
            "final_bki_group": calculate_bmi_group(current_weight, request.height)
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/pools")
def get_pools():
    db = get_db()
    pools = db.get_all_pools()
    return pools

# Global variable to store process
bot_process = None

class DetoksBotRequest(BaseModel):
    count: int

@app.post("/api/run-detoks-bot")
def run_detoks_bot(request: DetoksBotRequest):
    global bot_process
    import subprocess
    
    # Check if already running
    if bot_process and bot_process.poll() is None:
        raise HTTPException(status_code=400, detail="Bot is already running")

    try:
        script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "detoks-liste-gonder.py")
        # Use Popen for non-blocking execution
        bot_process = subprocess.Popen([sys.executable, script_path, str(request.count)])
        return {"status": "success", "message": "Bot started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stop-detoks-bot")
def stop_detoks_bot():
    global bot_process
    if bot_process and bot_process.poll() is None:
        bot_process.terminate()
        return {"status": "success", "message": "Bot stopped"}
    return {"status": "info", "message": "Bot is not running"}

@app.get("/api/detoks-bot-status")
def get_detoks_bot_status():
    global bot_process
    if bot_process and bot_process.poll() is None:
        return {"status": "running"}
    return {"status": "stopped"}

if __name__ == "__main__":
    import uvicorn
    # Run on a specific port, e.g., 8000
    uvicorn.run(app, host="127.0.0.1", port=8000)
