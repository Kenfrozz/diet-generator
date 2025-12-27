import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const NotesContext = createContext();

export function useNotes() {
  return useContext(NotesContext);
}

// Defined colors for notes, shared across the app
export const NOTE_COLORS = [
  { id: 'default', bg: 'bg-finrise-input/30', border: 'border-transparent', name: 'Varsayılan' },
  { id: 'red', bg: 'bg-red-500/10', border: 'border-red-500/50', name: 'Kırmızı' },
  { id: 'orange', bg: 'bg-orange-500/10', border: 'border-orange-500/50', name: 'Turuncu' },
  { id: 'yellow', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', name: 'Sarı' },
  { id: 'green', bg: 'bg-green-500/10', border: 'border-green-500/50', name: 'Yeşil' },
  { id: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500/50', name: 'Mavi' },
  { id: 'purple', bg: 'bg-purple-500/10', border: 'border-purple-500/50', name: 'Mor' },
  { id: 'pink', bg: 'bg-pink-500/10', border: 'border-pink-500/50', name: 'Pembe' },
];

// Helper: Get dietitianId
const getDietitianId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.id ? `user-${user.id}` : 'default-dietitian';
};

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false); // Track if there are unsaved changes
  
  // State for active alarm alert (Global)
  const [activeAlert, setActiveAlert] = useState(null);
  const notifiedRef = useState(new Set())[0]; // Track fired alarms in this session

  // Notification permission
  useEffect(() => {
    if (Notification.permission !== 'granted') {
        // We do not auto-request here to avoid spam, we rely on user action in UI
    }
  }, []);

  const requestNotificationPermission = () => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  // Initialize & Migration
  useEffect(() => {
    const savedNotes = localStorage.getItem('finrise_notes');
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        const normalized = parsed.map(n => ({
          ...n, 
          id: n.id.toString(),
          color: n.color || 'default',
          pinned: n.pinned || false,
          reminder: n.reminder || null,
          tags: n.tags || []
        }));
        setNotes(normalized);
      } catch (e) {
        console.error("Failed to parse notes", e);
        setNotes([]);
      }
    } else {
      const initial = [{
        id: Date.now().toString(),
        title: 'Hoş Geldiniz! 📝',
        content: 'DetoksBot notlar bölümüne hoş geldiniz.',
        date: new Date().toISOString(),
        color: 'default',
        pinned: true
      }];
      setNotes(initial);
      setActiveNoteId(initial[0].id);
    }
  }, []);

  // Save to localStorage (Filter out empty notes) - LOCAL ONLY, no Firebase
  useEffect(() => {
    if (notes.length > 0) {
      const validNotes = notes.filter(n => n.title.trim() || n.content.trim());
      localStorage.setItem('finrise_notes', JSON.stringify(validNotes));
    }
  }, [notes]);

  // Alarm Check Interval - Global Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      notes.forEach(note => {
        if (note.reminder) {
          const reminderTime = new Date(note.reminder);
          const timeDiff = now - reminderTime;
          
          // Check if it's time (within last 5 minutes to catch up) and not already fired
          if (timeDiff >= 0 && timeDiff < 300000 && !notifiedRef.has(note.id + note.reminder)) {
             notifiedRef.add(note.id + note.reminder);
             
             // 1. Play Sound
             try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); 
                audio.play().catch(e => console.log('Audio play failed', e));
             } catch (e) {}

             // 2. System Notification
             if (Notification.permission === 'granted') {
                new Notification(`🔔 Hatırlatıcı: ${note.title || 'İsimsiz Not'}`, {
                  body: note.content.substring(0, 100),
                  icon: '/vite.svg',
                  requireInteraction: true
                });
             }

             // 3. In-App Alert (Global Modal)
             setActiveAlert({
                title: note.title || 'İsimsiz Not',
                content: note.content,
                date: reminderTime,
                noteId: note.id
             });
          }
        }
      });
    }, 5000); 
    return () => clearInterval(interval);
  }, [notes]);


  // Actions
  const handleCreateNote = useCallback(() => {
    // Prevent multiple empty notes
    const existingEmpty = notes.find(n => !n.title.trim() && !n.content.trim());
    if (existingEmpty) {
        setActiveNoteId(existingEmpty.id);
        return existingEmpty.id;
    }

    const newNote = {
      id: Date.now().toString(),
      title: '',
      content: '',
      date: new Date().toISOString(),
      color: 'default',
      pinned: false
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setUnsavedChanges(false); // New note starts clean
    
    return newNote.id;
  }, [notes]);

  // Update note locally (NO Firebase sync - just local)
  const handleUpdateNoteLocal = useCallback((id, key, value) => {
    setNotes(prev => prev.map(n => 
      n.id.toString() === id.toString() 
        ? { ...n, [key]: value } 
        : n
    ));
    setUnsavedChanges(true); // Mark as unsaved
  }, []);
  
  // Helper specifically for handling the active note update easily
  const handleUpdateActiveNote = useCallback((key, value) => {
     if (activeNoteId) handleUpdateNoteLocal(activeNoteId, key, value);
  }, [activeNoteId, handleUpdateNoteLocal]);

  const updateNoteById = useCallback((id, updates) => {
    setNotes(prev => prev.map(n => 
      n.id.toString() === id.toString()
        ? { ...n, ...updates }
        : n
    ));
    setUnsavedChanges(true);
  }, []);

  // MANUAL SAVE: Save current note to Firebase
  const saveNoteToFirebase = useCallback(async (noteId) => {
    const noteToSave = notes.find(n => n.id.toString() === (noteId || activeNoteId)?.toString());
    
    if (!noteToSave || (!noteToSave.title.trim() && !noteToSave.content.trim())) {
      return { success: false, error: 'Boş not kaydedilemez' };
    }
    
    try {
      const { addDoc, updateDoc, doc, collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      const { serverTimestamp } = await import('firebase/firestore');
      
      const dietitianId = getDietitianId();
      
      // Check if note exists in Firebase
      const q = query(
        collection(db, 'notes'),
        where('dietitianId', '==', dietitianId),
        where('localId', '==', noteToSave.id)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Update existing
        const docSnap = snapshot.docs[0];
        await updateDoc(doc(db, 'notes', docSnap.id), {
          title: noteToSave.title || '',
          content: noteToSave.content || '',
          color: noteToSave.color || 'default',
          pinned: noteToSave.pinned || false,
          reminder: noteToSave.reminder || null,
          updatedAt: serverTimestamp()
        });
        console.log('✓ Firebase: Not güncellendi');
      } else {
        // Create new
        await addDoc(collection(db, 'notes'), {
          title: noteToSave.title || '',
          content: noteToSave.content || '',
          date: noteToSave.date,
          color: noteToSave.color || 'default',
          pinned: noteToSave.pinned || false,
          reminder: noteToSave.reminder || null,
          localId: noteToSave.id,
          dietitianId: dietitianId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log('✓ Firebase: Not eklendi');
      }
      
      setUnsavedChanges(false);
      return { success: true };
      
    } catch (error) {
      console.error('Firebase save error:', error);
      return { success: false, error: error.message };
    }
  }, [notes, activeNoteId]);

  const handleDeleteNote = useCallback(async (id) => {
      const noteToDelete = notes.find(n => n.id.toString() === id.toString());
      const newNotes = notes.filter(n => n.id.toString() !== id.toString());
      setNotes(newNotes);
      localStorage.setItem('finrise_notes', JSON.stringify(newNotes));
      
      // Delete from Firebase
      if (noteToDelete) {
        try {
          const { deleteDoc, doc, collection, query, where, getDocs } = await import('firebase/firestore');
          const { db } = await import('../lib/firebase');
          
          const dietitianId = getDietitianId();
          const q = query(
            collection(db, 'notes'),
            where('dietitianId', '==', dietitianId),
            where('localId', '==', noteToDelete.id)
          );
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            await deleteDoc(doc(db, 'notes', snapshot.docs[0].id));
            console.log('✓ Firebase: Not silindi');
          }
        } catch (error) {
          console.error('Firebase delete error:', error);
        }
      }
      
      if (activeNoteId?.toString() === id.toString()) {
        setActiveNoteId(null);
      }
      setUnsavedChanges(false);
  }, [notes, activeNoteId]);

  const handleNoteSelect = useCallback((id) => {
    const activeNote = notes.find(n => n.id === activeNoteId);
    // If we are leaving an empty note, delete it
    if (activeNote && !activeNote.title.trim() && !activeNote.content.trim() && activeNote.id !== id) {
        setNotes(prev => prev.filter(n => n.id !== activeNote.id));
    }
    setActiveNoteId(id);
    setUnsavedChanges(false); // Reset when switching notes
  }, [notes, activeNoteId]);

  // Manual sync function (for Senkronize button) - Pull all from Firebase
  const syncNotesWithFirebase = useCallback(async () => {
    const results = { pushed: 0, pulled: 0, errors: [] };
    
    try {
      const { collection, query, where, getDocs, addDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      const { serverTimestamp } = await import('firebase/firestore');
      
      const dietitianId = getDietitianId();
      
      // Get Firebase notes
      const q = query(
        collection(db, 'notes'),
        where('dietitianId', '==', dietitianId)
      );
      const snapshot = await getDocs(q);
      
      const firebaseNotes = new Map();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        firebaseNotes.set(data.localId, { firebaseId: doc.id, ...data });
      });
      
      // Push local notes that don't exist in Firebase
      for (const note of notes) {
        if (!note.title.trim() && !note.content.trim()) continue; // Skip empty
        
        if (!firebaseNotes.has(note.id)) {
          await addDoc(collection(db, 'notes'), {
            title: note.title || '',
            content: note.content || '',
            date: note.date,
            color: note.color || 'default',
            pinned: note.pinned || false,
            reminder: note.reminder || null,
            localId: note.id,
            dietitianId: dietitianId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          results.pushed++;
        }
      }
      
      // Pull Firebase notes that don't exist locally
      const localIds = new Set(notes.map(n => n.id));
      const newNotes = [...notes];
      
      for (const [localId, fbNote] of firebaseNotes) {
        if (!localIds.has(localId)) {
          newNotes.push({
            id: localId || Date.now().toString(),
            title: fbNote.title || '',
            content: fbNote.content || '',
            date: fbNote.date || new Date().toISOString(),
            color: fbNote.color || 'default',
            pinned: fbNote.pinned || false,
            reminder: fbNote.reminder || null
          });
          results.pulled++;
        }
      }
      
      if (results.pulled > 0) {
        setNotes(newNotes);
        localStorage.setItem('finrise_notes', JSON.stringify(newNotes));
      }
      
    } catch (error) {
      results.errors.push(error.message);
    }
    
    return results;
  }, [notes]);

  const value = {
    notes,
    setNotes, // In case we need raw access
    activeNoteId,
    setActiveNoteId,
    activeAlert,
    setActiveAlert,
    unsavedChanges,          // NEW: Track unsaved state
    handleCreateNote,
    handleDeleteNote,
    handleUpdateActiveNote,
    updateNoteById,
    handleNoteSelect,
    requestNotificationPermission,
    saveNoteToFirebase,      // NEW: Manual save function
    syncNotesWithFirebase
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}
