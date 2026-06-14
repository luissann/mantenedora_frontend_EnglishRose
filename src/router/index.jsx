import { Navigate, createBrowserRouter } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import AppLayout from '../components/layout/AppLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
import Configuracion from '../pages/Configuracion';
import Notificaciones from '../pages/Notificaciones';
import Perfil from '../pages/Perfil';

// Alumnos
import AlumnosIndexPage from '../pages/Alumnos';
import AlumnoNuevoPage from '../pages/Alumnos/AlumnoNuevo';
import AlumnoPerfilPage from '../pages/Alumnos/AlumnoPerfil';
import AlumnoEditarPage from '../pages/Alumnos/AlumnoEditar';

// Planes
import PlanesIndexPage from '../pages/Planes';
import PlanNuevoPage from '../pages/Planes/PlanNuevo';
import PlanEditarPage from '../pages/Planes/PlanEditar';

// Pagos
import PagosIndexPage from '../pages/Pagos';
import PagoNuevoPage from '../pages/Pagos/PagoNuevo';
import PagoEditarPage from '../pages/Pagos/PagoEditar';

// Horarios
import HorariosIndexPage from '../pages/Horarios';
import HorarioNuevoPage from '../pages/Horarios/HorarioNuevo';
import HorarioEditarPage from '../pages/Horarios/HorarioEditar';

// WhatsApp
import WhatsappIndexPage from '../pages/Whatsapp';
import WhatsappNuevoPage from '../pages/Whatsapp/WhatsappNuevo';
import WhatsappEditarPage from '../pages/Whatsapp/WhatsappEditar';

// Usuarios
import UsuariosIndexPage from '../pages/Usuarios';
import UsuarioNuevoPage from '../pages/Usuarios/UsuarioNuevo';
import UsuarioPerfilPage from '../pages/Usuarios/UsuarioPerfil';
import UsuarioEditarPage from '../pages/Usuarios/UsuarioEditar';

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PrivateRoute>
        <AppLayout />
      </PrivateRoute>
    ),
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      
      // Alumnos
      { path: 'alumnos', element: <AlumnosIndexPage /> },
      { path: 'alumnos/nuevo', element: <AlumnoNuevoPage /> },
      { path: 'alumnos/:id', element: <AlumnoPerfilPage /> },
      { path: 'alumnos/:id/editar', element: <AlumnoEditarPage /> },
      
      // Planes
      { path: 'planes', element: <PlanesIndexPage /> },
      { path: 'planes/nuevo', element: <PlanNuevoPage /> },
      { path: 'planes/:id/editar', element: <PlanEditarPage /> },
      
      // Pagos
      { path: 'pagos', element: <PagosIndexPage /> },
      { path: 'pagos/nuevo', element: <PagoNuevoPage /> },
      { path: 'pagos/:id/editar', element: <PagoEditarPage /> },
      
      // Horarios
      { path: 'horarios', element: <HorariosIndexPage /> },
      { path: 'horarios/nuevo', element: <HorarioNuevoPage /> },
      { path: 'horarios/:id/editar', element: <HorarioEditarPage /> },
      
      // WhatsApp
      { path: 'whatsapp', element: <WhatsappIndexPage /> },
      { path: 'whatsapp/nuevo', element: <WhatsappNuevoPage /> },
      { path: 'whatsapp/:id/editar', element: <WhatsappEditarPage /> },
      
      // Usuarios
      { path: 'usuarios', element: <UsuariosIndexPage /> },
      { path: 'usuarios/nuevo', element: <UsuarioNuevoPage /> },
      { path: 'usuarios/:id', element: <UsuarioPerfilPage /> },
      { path: 'usuarios/:id/editar', element: <UsuarioEditarPage /> },
      
      // Other pages
      { path: 'configuracion', element: <Configuracion /> },
      { path: 'notificaciones', element: <Notificaciones /> },
      { path: 'perfil', element: <Perfil /> },
      
      { path: '404', element: <NotFound /> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

export default router;
