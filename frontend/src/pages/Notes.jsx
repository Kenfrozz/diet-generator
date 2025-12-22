import { useState } from 'react';
import {
  NotebookPen, Plus, Trash2, Search, Save, Calendar, Clock,
  Edit2, Bell, Palette, Pin, Check, X, AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion'; // Removed AnimatePresence since it's global now
import { useNotes, NOTE_COLORS } from '../context/NotesContext';

export default function Notes() {
  const {
      notes,
      activeNoteId,
      handleCreateNote,
      handleDeleteNote: contextDeleteNote, // Alias to avoid conflict with local wrapper
      handleUpdateActiveNote,
      updateNoteById,
      handleNoteSelect: contextNoteSelect, // Alias to avoid conflict with local wrapper
      requestNotificationPermission,
      activeAlert, // From context
      setActiveAlert // From context
  } = useNotes();

  const [searchTerm, setSearchTerm] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const activeNote = notes.find(n => n.id.toString() === activeNoteId?.toString());

  // Local wrapper for update
  const handleUpdateNote = (key, value) => {
    handleUpdateActiveNote(key, value);
  };

  const handleDeleteNote = (id, e) => {
    e?.stopPropagation();
    contextDeleteNote(id);
  };

  const handleNoteSelect = (id) => {
    contextNoteSelect(id);
  };

  const togglePin = (id, e) => {
    e?.stopPropagation();
    const note = notes.find(n => n.id.toString() === id.toString());
    if (note) {
        updateNoteById(id, { pinned: !note.pinned });
    }
  };

  const handleAlarmClick = (id, e) => {
     e?.stopPropagation();
     handleNoteSelect(id);
     setShowDatePicker(true);
     requestNotificationPermission();
  };

  const filteredNotes = notes.filter(n =>
    (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (n.content || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const otherNotes = filteredNotes.filter(n => !n.pinned);

  // Helper to get color styles
  const getColorStyle = (colorId) => NOTE_COLORS.find(c => c.id === colorId) || NOTE_COLORS[0];

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6 overflow-hidden relative">
      
      {/* Sidebar List */}
      <div className="w-80 flex flex-col bg-finrise-panel border border-finrise-border rounded-2xl shadow-xl overflow-hidden shrink-0">
        
        {/* Header */}
        <div className="p-4 border-b border-finrise-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-finrise-text flex items-center gap-2">
              <NotebookPen className="text-finrise-accent" />
              Notlar
            </h2>
            <button 
              onClick={handleCreateNote}
              className="p-2 bg-finrise-accent text-white rounded-lg hover:bg-finrise-accent/90 transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted w-4 h-4" />
            <input 
              type="text" 
              placeholder="Ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-finrise-input border-finrise-border border rounded-xl pl-10 pr-4 py-2 text-sm text-finrise-text focus:border-finrise-accent outline-none transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
          
          {/* Pinned Section */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-finrise-muted px-2 uppercase tracking-wider flex items-center gap-1">
                <Pin size={10} /> Sabitlenenler
              </h3>
              {pinnedNotes.map(note => (
                <NoteItem 
                    key={note.id} 
                    note={note} 
                    activeId={activeNoteId} 
                    onClick={handleNoteSelect} 
                    onDelete={handleDeleteNote}
                    onPin={togglePin}
                    onAlarm={handleAlarmClick}
                />
              ))}
            </div>
          )}

          {/* Others Section */}
          <div className="space-y-2">
             {pinnedNotes.length > 0 && otherNotes.length > 0 && (
                <h3 className="text-xs font-semibold text-finrise-muted px-2 uppercase tracking-wider mt-4">Diğer Notlar</h3>
             )}
             {otherNotes.map(note => (
                <NoteItem 
                    key={note.id} 
                    note={note} 
                    activeId={activeNoteId} 
                    onClick={handleNoteSelect} 
                    onDelete={handleDeleteNote}
                    onPin={togglePin}
                    onAlarm={handleAlarmClick}
                />
             ))}
          </div>

          {filteredNotes.length === 0 && (
            <div className="text-center py-12 text-finrise-muted opacity-50">
              <p>Not yok.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 bg-finrise-panel border border-finrise-border rounded-2xl shadow-xl overflow-hidden flex flex-col relative">
        {activeNote ? (
          <>
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-finrise-border flex items-center justify-between bg-finrise-input/10">
               <div className="text-xs text-finrise-muted flex items-center gap-3">
                  <span className="flex items-center gap-1 bg-finrise-input px-2 py-1 rounded border border-finrise-border">
                    <Calendar size={12} /> {new Date(activeNote.date).toLocaleDateString()}
                  </span>
                  {activeNote.reminder && (
                    <span className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded border", 
                        new Date(activeNote.reminder) < new Date() ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-finrise-accent/10 border-finrise-accent/30 text-finrise-accent"
                    )}>
                        <Bell size={12} /> {new Date(activeNote.reminder).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </span>
                  )}
               </div>

               <div className="flex items-center gap-2">
                  {/* Pin Toggle */}
                  <button 
                    onClick={(e) => togglePin(activeNote.id, e)}
                    className={cn(
                        "p-2 rounded-lg transition-colors",
                        activeNote.pinned ? "text-finrise-accent bg-finrise-accent/10" : "text-finrise-muted hover:bg-finrise-input hover:text-finrise-text"
                    )}
                    title={activeNote.pinned ? "Sabitlemeyi Kaldır" : "Sabitle"}
                  >
                    <Pin size={18} className={activeNote.pinned ? "fill-current" : ""} />
                  </button>

                  {/* Reminder Toggle */}
                  <div className="relative">
                      <button 
                        onClick={() => {
                            setShowDatePicker(!showDatePicker);
                            requestNotificationPermission();
                        }}
                        className={cn("p-2 rounded-lg hover:bg-finrise-input transition-colors", activeNote.reminder ? "text-finrise-accent" : "text-finrise-muted")}
                        title="Hatırlatıcı Ayarla"
                      >
                         <Bell size={18} />
                      </button>
                      {showDatePicker && (
                        <div className="absolute top-full right-0 mt-2 p-3 bg-finrise-panel border border-finrise-border rounded-xl shadow-xl z-50 w-64 animate-in fade-in slide-in-from-top-2">
                           <h4 className="text-sm font-medium text-finrise-text mb-2">Hatırlatıcı Zamanı</h4>
                           <input 
                             type="datetime-local" 
                             className="w-full bg-finrise-input border border-finrise-border rounded-lg px-3 py-2 text-sm text-finrise-text outline-none focus:border-finrise-accent mb-2"
                             onChange={(e) => {
                                handleUpdateNote('reminder', e.target.value);
                             }}
                             value={activeNote.reminder || ''}
                           />
                           <div className="flex justify-end gap-2">
                              {activeNote.reminder && (
                                <button onClick={() => { handleUpdateNote('reminder', null); setShowDatePicker(false); }} className="text-xs text-red-400 hover:text-red-300">Temizle</button>
                              )}
                              <button onClick={() => setShowDatePicker(false)} className="text-xs text-finrise-accent hover:text-finrise-accent/80">Tamam</button>
                           </div>
                        </div>
                      )}
                  </div>

                  {/* Color Picker */}
                  <div className="relative">
                      <button 
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="p-2 rounded-lg hover:bg-finrise-input text-finrise-muted hover:text-finrise-text transition-colors"
                        title="Renk Değiştir"
                      >
                         <Palette size={18} />
                      </button>
                      
                      {showColorPicker && (
                          <div className="absolute top-full right-0 mt-2 p-3 bg-finrise-panel border border-finrise-border rounded-xl shadow-xl z-50 grid grid-cols-4 gap-2 w-48 animate-in fade-in slide-in-from-top-2">
                             {NOTE_COLORS.map(c => (
                                 <button
                                    key={c.id}
                                    onClick={() => { handleUpdateNote('color', c.id); setShowColorPicker(false); }}
                                    className={cn(
                                        "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                                        c.bg,
                                        activeNote.color === c.id ? "border-finrise-accent scale-110" : "border-transparent"
                                    )}
                                    title={c.name}
                                 />
                             ))}
                          </div>
                      )}
                  </div>

                  <div className="w-px h-6 bg-finrise-border mx-1" />

                  <button 
                    onClick={(e) => handleDeleteNote(activeNote.id, e)}
                    className="p-2 rounded-lg hover:bg-finrise-red/10 text-finrise-muted hover:text-finrise-red transition-colors"
                    title="Notu Sil"
                  >
                     <Trash2 size={18} />
                  </button>
               </div>
            </div>

            {/* Note Canvas -> uses note specific color only for this area if desired, or just generic */}
            <div className={cn("flex-1 flex flex-col relative z-10 transition-colors duration-500", getColorStyle(activeNote.color).bg)}>
               
               {/* Title Input */}
               <input 
                 name="title"
                 type="text" 
                 value={activeNote.title}
                 onChange={(e) => handleUpdateNote('title', e.target.value)}
                 className="w-full bg-transparent px-8 pt-8 pb-4 text-3xl font-bold border-none outline-none text-finrise-text placeholder-finrise-muted/40"
                 placeholder="Başlık..."
               />

               {/* Content */}
               <textarea 
                  name="content"
                  value={activeNote.content}
                  onChange={(e) => handleUpdateNote('content', e.target.value)}
                  className="flex-1 w-full bg-transparent px-8 py-4 text-finrise-text text-lg leading-relaxed outline-none resize-none custom-scrollbar placeholder-finrise-muted/30 font-sans"
                  placeholder="Notunuzu buraya yazın..."
               />
            </div>
            
            {/* Footer Status */}
            <div className="px-6 py-2 bg-finrise-panel border-t border-finrise-border text-[10px] text-finrise-muted flex justify-between items-center z-10">
                <span>{activeNote.id}</span>
                <span className="flex items-center gap-1 text-finrise-green">
                    <Check size={10} /> Kaydedildi
                </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-finrise-muted space-y-6 animate-in fade-in duration-500">
            <div className="relative group cursor-pointer" onClick={handleCreateNote}>
                <div className="w-24 h-24 bg-finrise-input rounded-full flex items-center justify-center border-2 border-dashed border-finrise-border group-hover:border-finrise-accent group-hover:bg-finrise-accent/5 transition-all">
                    <Plus size={40} className="text-finrise-muted group-hover:text-finrise-accent transition-colors" />
                </div>
            </div>
            <p className="text-lg font-medium">Bir not seçin veya oluşturun</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponent for list item
function NoteItem({ note, activeId, onClick, onDelete, onPin, onAlarm }) {
    const isActive = activeId?.toString() === note.id.toString();
    const style = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => onClick(note.id)}
            className={cn(
                "p-4 rounded-xl cursor-pointer transition-all border group relative hover:shadow-md",
                isActive 
                    ? `border-finrise-accent bg-finrise-panel shadow-lg ring-1 ring-finrise-accent/20` 
                    : `${style.bg} ${style.border} hover:border-finrise-border/50`
            )}
        >
            <div className="flex justify-between items-start mb-1.5">
                <h3 className={cn("font-semibold truncate pr-6 text-sm", isActive ? "text-finrise-accent" : "text-finrise-text")}>
                    {note.title || 'Başlıksız'}
                </h3>
                {note.pinned && <Pin size={12} className="text-finrise-accent rotate-45 shrink-0 group-hover:opacity-0 transition-opacity" />}
            </div>
            
            <p className="text-xs text-finrise-muted line-clamp-2 mb-2 font-medium leading-relaxed opacity-80">
                {note.content || 'Boş...'}
            </p>
            
            <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-finrise-muted opacity-60 flex items-center gap-1">
                    {new Date(note.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                </span>
                
                {note.reminder && (
                     <div className={cn("flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full", 
                        new Date(note.reminder) < new Date() ? "text-red-500 bg-red-500/10" : "text-finrise-accent bg-finrise-accent/10"
                     )}>
                        <Clock size={10} />
                        {new Date(note.reminder) < new Date() ? "Süresi Doldu" : new Date(note.reminder).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                     </div>
                )}
            </div>
            
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Pin Button */}
                <button 
                    onClick={(e) => onPin(note.id, e)}
                    className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        note.pinned 
                            ? "bg-finrise-accent text-white" 
                            : "bg-finrise-panel text-finrise-muted hover:text-finrise-accent shadow-sm"
                    )}
                    title={note.pinned ? "Sabitlemeyi Kaldır" : "Sabitle"}
                >
                    <Pin size={14} className={note.pinned ? "fill-current" : ""} />
                </button>

                {/* Alarm Button */}
                <button 
                    onClick={(e) => onAlarm(note.id, e)}
                    className={cn(
                        "p-1.5 rounded-lg transition-colors",
                         note.reminder
                            ? "bg-finrise-accent text-white" 
                            : "bg-finrise-panel text-finrise-muted hover:text-finrise-accent shadow-sm"
                    )}
                    title="Hatırlatıcı"
                >
                    <Bell size={14} className={note.reminder ? "fill-current" : ""} />
                </button>

                {/* Delete Button */}
                <button 
                    onClick={(e) => onDelete(note.id, e)}
                    className="p-1.5 bg-finrise-panel text-finrise-muted hover:text-finrise-red hover:bg-finrise-red/10 rounded-lg transition-colors shadow-sm"
                    title="Sil"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </motion.div>
    );
}
