import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotesProvider } from './context/NotesContext';
import { AppProvider } from './contexts/AppContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Recipes from './pages/Recipes';
import Templates from './pages/Templates';
import DietGenerator from './pages/DietGenerator';
import Settings from './pages/Settings';
import Notes from './pages/Notes';
import Clients from './pages/Clients';
import Appointments from './pages/Appointments';
import DietPackages from './pages/DietPackages';
import DietCombinations from './pages/DietCombinations';
import DetoksBot from './pages/DetoksBot';
import Profile from './pages/Profile';

function App() {
  return (
    <AppProvider>
      <NotesProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/generate" element={<DietGenerator />} />
              
              <Route path="/packages" element={<DietPackages />} />
            <Route path="/combinations" element={<DietCombinations />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/detox-bot" element={<DetoksBot />} />
              <Route path="/profile" element={<Profile />} />

              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </NotesProvider>
    </AppProvider>
  );
}

export default App;
