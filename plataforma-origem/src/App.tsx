import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/authStore';
import { AppShell } from '@/components/AppShell';
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Boards from '@/pages/Boards';
import BoardView from '@/pages/BoardView';
import Finance from '@/pages/Finance';
import Posts from '@/pages/Posts';
import Clients from '@/pages/Clients';
import Settings from '@/pages/Settings';

function Protected({ children }: { children: React.ReactNode }) {
  const currentId = useAuth((s) => s.currentId);
  const location = useLocation();
  if (!currentId) return <Navigate to="/entrar" replace state={{ from: location }} />;
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  const location = useLocation();
  const currentId = useAuth((s) => s.currentId);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname.split('/')[1] || 'root'}>
        <Route path="/" element={currentId ? <Navigate to="/app" replace /> : <Landing />} />
        <Route path="/entrar" element={currentId ? <Navigate to="/app" replace /> : <Auth />} />

        <Route path="/app" element={<Protected><Dashboard /></Protected>} />
        <Route path="/app/quadros" element={<Protected><Boards /></Protected>} />
        <Route path="/app/quadros/:boardId" element={<Protected><BoardView /></Protected>} />
        <Route path="/app/financeiro" element={<Protected><Finance /></Protected>} />
        <Route path="/app/posts" element={<Protected><Posts /></Protected>} />
        <Route path="/app/clientes" element={<Protected><Clients /></Protected>} />
        <Route path="/app/config" element={<Protected><Settings /></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
