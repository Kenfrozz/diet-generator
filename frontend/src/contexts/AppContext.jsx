import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const API_URL = 'http://127.0.0.1:8000';

export function AppProvider({ children }) {
  const [appSettings, setAppSettings] = useState({
    app_title: 'DiyetKent',
    app_description: 'Beslenme ve Diyet Yönetim Sistemi',
    app_logo_path: '',
    // defaults
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
        const res = await fetch(`${API_URL}/api/settings`);
        if (res.ok) {
            const data = await res.json();
            setAppSettings(prev => ({ ...prev, ...data }));
        }
    } catch (err) {
        console.error("Failed to load app settings", err);
    }
  };

  return (
    <AppContext.Provider value={{ appSettings, fetchSettings }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
