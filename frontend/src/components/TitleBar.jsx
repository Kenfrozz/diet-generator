import { useState, useEffect } from 'react';
import { Minus, X, Sun, Moon, Square } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

const { ipcRenderer } = window.require('electron');

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const { theme, setTheme, season } = useTheme();
  
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  useEffect(() => {
    // Listen for maximize events from main process
    const onMaximized = () => setIsMaximized(true);
    const onRestored = () => setIsMaximized(false);

    ipcRenderer.on('window-maximized', onMaximized);
    ipcRenderer.on('window-restored', onRestored);

    return () => {
      ipcRenderer.removeListener('window-maximized', onMaximized);
      ipcRenderer.removeListener('window-restored', onRestored);
    };
  }, []);

  const handleMaximize = () => {
    // Send toggle command
    ipcRenderer.send('window-maximize');
    // Optimistic update - although the event will correct it shortly
    // setIsMaximized(!isMaximized); 
  };

  // Custom Icons
  const RestoreIcon = () => (
    <svg width="10" height="10" viewBox="0 0 10 10" className="fill-none stroke-current stroke-[1.5]">
      <rect x="2.5" y="2.5" width="7" height="7" />
      <path d="M7.5 2.5V0.5H0.5V7.5H2.5" />
    </svg>
  );

  const MaximizeIcon = () => (
    <div className="w-[10px] h-[10px] border-[1.5px] border-current" />
  );

  return (
    <div className="h-[32px] bg-finrise-input flex items-center justify-between select-none z-50 border-b border-finrise-border w-full relative" style={{ WebkitAppRegion: 'drag' }}>
      
      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Window Controls (No Drag) */}
      <div className="flex h-full z-10" style={{ WebkitAppRegion: 'no-drag' }}>
        
        {/* Theme Toggle */}
        <button 
            onClick={toggleTheme}
            className="w-[46px] h-full flex items-center justify-center hover:bg-white/10 text-finrise-muted hover:text-finrise-accent transition-colors outline-none border-l border-r border-finrise-border"
            title={isDarkMode ? "Aydınlık Moda Geç" : "Karanlık Moda Geç"}
        >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        <button 
          onClick={() => ipcRenderer.send('window-minimize')}
          className="w-[46px] h-full flex items-center justify-center hover:bg-white/10 text-finrise-muted hover:text-finrise-text transition-colors outline-none"
        >
          <Minus size={14} />
        </button>
        <button 
          onClick={handleMaximize}
          className="w-[46px] h-full flex items-center justify-center hover:bg-white/10 text-finrise-muted hover:text-finrise-text transition-colors outline-none"
        >
          {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
        </button>
        <button 
          onClick={() => ipcRenderer.send('window-close')}
          className="w-[46px] h-full flex items-center justify-center hover:bg-finrise-red hover:text-white text-finrise-muted transition-colors outline-none group"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
