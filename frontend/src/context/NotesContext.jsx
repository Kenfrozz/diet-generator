import { createContext, useContext, useState, useEffect } from 'react';

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

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  
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

  // Save (Filter out empty notes)
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
  const handleCreateNote = () => {
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
    return newNote.id;
  };

  const handleUpdateNoteLocal = (id, key, value) => {
    setNotes(prev => prev.map(n => 
      n.id.toString() === id.toString() 
        ? { ...n, [key]: value } 
        : n
    ));
  };
  
  // Helper specifically for handling the active note update easily
  const handleUpdateActiveNote = (key, value) => {
     if (activeNoteId) handleUpdateNoteLocal(activeNoteId, key, value);
  };

  const updateNoteById = (id, updates) => {
    setNotes(prev => prev.map(n => 
      n.id.toString() === id.toString()
        ? { ...n, ...updates }
        : n
    ));
  };

  const handleDeleteNote = (id) => {
      const newNotes = notes.filter(n => n.id.toString() !== id.toString());
      setNotes(newNotes);
      localStorage.setItem('finrise_notes', JSON.stringify(newNotes));
      if (activeNoteId?.toString() === id.toString()) {
        setActiveNoteId(null);
      }
  };

  const handleNoteSelect = (id) => {
    const activeNote = notes.find(n => n.id === activeNoteId);
    // If we are leaving an empty note, delete it
    if (activeNote && !activeNote.title.trim() && !activeNote.content.trim() && activeNote.id !== id) {
        setNotes(prev => prev.filter(n => n.id !== activeNote.id));
    }
    setActiveNoteId(id);
  };

  const value = {
    notes,
    setNotes, // In case we need raw access
    activeNoteId,
    setActiveNoteId,
    activeAlert,
    setActiveAlert,
    handleCreateNote,
    handleDeleteNote,
    handleUpdateActiveNote,
    updateNoteById,
    handleNoteSelect,
    requestNotificationPermission
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}
