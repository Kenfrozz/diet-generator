import { Sidebar } from './Sidebar';
import { TitleBar } from './TitleBar';
import { Outlet, useNavigate } from 'react-router-dom';
import { useNotes } from '../context/NotesContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useEffect } from 'react';

export default function Layout() {
  const { activeAlert, setActiveAlert, handleNoteSelect } = useNotes();
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="h-screen bg-finrise-dark flex overflow-hidden relative">
        {/* Global Alarm Alert Modal */}
        <AnimatePresence>
        {activeAlert && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
             <div className="bg-finrise-panel border border-finrise-accent shadow-2xl rounded-2xl p-6 max-w-sm w-full relative">
                <div className="flex flex-col items-center text-center gap-4">
                   <div className="w-16 h-16 bg-finrise-accent/20 rounded-full flex items-center justify-center animate-bounce">
                      <Bell size={32} className="text-finrise-accent" />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-finrise-text mb-1">{activeAlert.title}</h3>
                      <p className="text-sm text-finrise-muted line-clamp-3">{activeAlert.content || 'Not içeriği yok...'}</p>
                   </div>
                   <div className="text-xs text-finrise-muted bg-finrise-input px-3 py-1 rounded-full">
                      {new Date(activeAlert.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                   </div>
                   
                   <div className="flex gap-2 w-full mt-2">
                      <button 
                        onClick={() => {
                           // Navigate to note if needed?
                           handleNoteSelect(activeAlert.noteId);
                           setActiveAlert(null);
                           navigate('/notes');
                        }}
                        className="flex-1 bg-finrise-accent text-white py-2 rounded-xl font-medium hover:bg-finrise-accent/90 transition-colors"
                      >
                         Notu Aç
                      </button>
                      <button 
                        onClick={() => setActiveAlert(null)}
                        className="flex-1 bg-finrise-input text-finrise-text py-2 rounded-xl font-medium hover:bg-finrise-border transition-colors border border-transparent hover:border-finrise-border"
                      >
                         Kapat
                      </button>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Sidebar full height on the left */}
        <Sidebar />
        
        {/* Right side: TitleBar + Content */}
        <div className="flex flex-col flex-1 min-w-0">
            <TitleBar />
            <main className="flex-1 overflow-auto relative custom-scrollbar">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    </div>
  );
}
