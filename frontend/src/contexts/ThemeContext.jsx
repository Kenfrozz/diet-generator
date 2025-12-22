import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize from localStorage or check system preference/existing class
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored;
    return "dark"; 
  });

  // Season state (Global) - Now read-only from backend mostly
  const [season, setSeason] = useState("yaz");

  // Custom color overrides - Split by mode
  const [customColors, setCustomColors] = useState(() => {
    const stored = localStorage.getItem("customColors");
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (!parsed.light && !parsed.dark) {
                return { light: {}, dark: parsed };
            }
            return parsed;
        } catch (e) {
            return { light: {}, dark: {} };
        }
    }
    return { light: {}, dark: {} };
  });

  // Fetch true season from backend
  useEffect(() => {
    const fetchSeason = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/settings');
            if (res.ok) {
                const data = await res.json();
                if (data.season) setSeason(data.season);
            }
        } catch (e) {
            console.error("Season fetch error", e);
        }
    };
    fetchSeason();
    // Poll occasionally or just once on mount? Once on mount + when window regains focus is good practice, but simpler here.
    const interval = setInterval(fetchSeason, 60000); // Check every minute just in case date changes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove old classes first
    root.classList.remove("light", "dark");

    let effectiveTheme = theme;
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    
    root.classList.add(effectiveTheme);
    
    // Apply custom colors
    const colors = customColors[effectiveTheme] || {};
    
    [
      '--color-accent', '--bg-app', '--bg-panel', '--bg-sidebar', '--text-main'
    ].forEach(k => root.style.removeProperty(k));

    Object.entries(colors).forEach(([key, value]) => {
      if (value) root.style.setProperty(key, value);
    });
    
    // Save
    localStorage.setItem("theme", theme);
    localStorage.setItem("customColors", JSON.stringify(customColors));
    // localStorage.setItem("season", season); // No need to save season locally anymore

  }, [theme, customColors]); // Removed season from deps as it doesn't affect theme directly unless we want it to

  const updateCustomColor = (mode, key, value) => {
    setCustomColors(prev => ({
        ...prev,
        [mode]: {
            ...prev[mode],
            [key]: value
        }
    }));
  };

  const resetColors = () => {
    setCustomColors({ light: {}, dark: {} });
    const root = window.document.documentElement;
    [
      '--color-accent', 
      '--bg-app', 
      '--bg-panel', 
      '--bg-sidebar', 
      '--text-main',
      '--text-muted'
    ].forEach(k => root.style.removeProperty(k));
    
    // Set default accent immediately as inline style until page reload or if context handles it? 
    // Actually our previous logic removes props so CSS defaults take over. 
    // If we want new default #e91d7c to apply when "Reset", we should rely on CSS or set it here.
    // Let's set it here to be safe if CSS isn't updated.
    // root.style.setProperty('--color-accent', '#e91d7c');
    // But wait, if we removeProperty, it uses index.css. I should update index.css to have new default too? 
    // Or just set it here.
  };

  const value = {
    theme,
    setTheme,
    season,
    setSeason,
    customColors,
    updateCustomColor,
    resetColors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
