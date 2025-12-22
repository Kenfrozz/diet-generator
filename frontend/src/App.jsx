import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotesProvider } from './context/NotesContext';
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
import DetoksBot from './pages/DetoksBot';

const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-4">
    <div className="text-4xl">🚧</div>
    <h2 className="text-2xl font-bold text-white">{title}</h2>
    <p>Bu özellik yapım aşamasındadır.</p>
  </div>
);

function App() {
  return (
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
            <Route path="/clients" element={<Clients />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/detox-bot" element={<DetoksBot />} />
            <Route path="/profile" element={<ComingSoon title="Profil" />} />

            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </NotesProvider>
  );
}

export default App;
