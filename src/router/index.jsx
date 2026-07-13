import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import AppLayout from '../components/layout/AppLayout';
import Login from '../pages/Login';
import ErrorPage from '../pages/ErrorPage';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const NotFound = lazy(() => import('../pages/NotFound'));
const Configuracion = lazy(() => import('../pages/Configuracion'));
const Notificaciones = lazy(() => import('../pages/Notificaciones'));
const Perfil = lazy(() => import('../pages/Perfil'));

// Alumnos
const AlumnosIndexPage = lazy(() => import('../pages/Alumnos'));
const AlumnoNuevoPage = lazy(() => import('../pages/Alumnos/AlumnoNuevo'));
const AlumnoPerfilPage = lazy(() => import('../pages/Alumnos/AlumnoPerfil'));
const AlumnoEditarPage = lazy(() => import('../pages/Alumnos/AlumnoEditar'));

// Planes
const PlanesIndexPage = lazy(() => import('../pages/Planes'));
const PlanNuevoPage = lazy(() => import('../pages/Planes/PlanNuevo'));
const PlanEditarPage = lazy(() => import('../pages/Planes/PlanEditar'));

// Pagos
const PagosIndexPage = lazy(() => import('../pages/Pagos'));
const PagoNuevoPage = lazy(() => import('../pages/Pagos/PagoNuevo'));
const PagoEditarPage = lazy(() => import('../pages/Pagos/PagoEditar'));

// Horarios
const HorariosIndexPage = lazy(() => import('../pages/Horarios'));
const HorarioNuevoPage = lazy(() => import('../pages/Horarios/HorarioNuevo'));
const HorarioEditarPage = lazy(() => import('../pages/Horarios/HorarioEditar'));
const HorarioSemanalPage = lazy(() => import('../pages/Horarios/HorarioSemanal'));

// Profesores
const ProfesoresIndexPage = lazy(() => import('../pages/Profesores'));
const ProfesorNuevoPage = lazy(() => import('../pages/Profesores/ProfesorNuevo'));
const ProfesorPerfilPage = lazy(() => import('../pages/Profesores/ProfesorPerfil'));
const ProfesorEditarPage = lazy(() => import('../pages/Profesores/ProfesorEditar'));

// Boletas
const BoletasIndexPage = lazy(() => import('../pages/Boletas'));

// Pagos a Profesores
const PagosProfesoresIndexPage = lazy(() => import('../pages/PagosProfesores'));

// WhatsApp
const WhatsappIndexPage = lazy(() => import('../pages/Whatsapp'));
const WhatsappNuevoPage = lazy(() => import('../pages/Whatsapp/WhatsappNuevo'));
const WhatsappEditarPage = lazy(() => import('../pages/Whatsapp/WhatsappEditar'));

// Usuarios
const UsuariosIndexPage = lazy(() => import('../pages/Usuarios'));
const UsuarioNuevoPage = lazy(() => import('../pages/Usuarios/UsuarioNuevo'));
const UsuarioPerfilPage = lazy(() => import('../pages/Usuarios/UsuarioPerfil'));
const UsuarioEditarPage = lazy(() => import('../pages/Usuarios/UsuarioEditar'));

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
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },

      // Alumnos
      { path: 'alumnos', element: <AlumnosIndexPage /> },
      { path: 'alumnos/nuevo', element: <AlumnoNuevoPage /> },
      { path: 'alumnos/:id', element: <AlumnoPerfilPage /> },
      { path: 'alumnos/:id/editar', element: <AlumnoEditarPage /> },

      // Planes — módulo desarrollado pero fuera de la 1ra etapa (ver Sidebar.jsx)
      { path: 'planes', element: <Navigate to="/dashboard" replace /> },
      { path: 'planes/nuevo', element: <Navigate to="/dashboard" replace /> },
      { path: 'planes/:id/editar', element: <Navigate to="/dashboard" replace /> },

      // Pagos — se deja accesible solo el flujo de registrar/editar pago desde
      // el perfil de un Alumno; el listado independiente queda bloqueado.
      { path: 'pagos', element: <Navigate to="/dashboard" replace /> },
      { path: 'pagos/nuevo', element: <PagoNuevoPage /> },
      { path: 'pagos/:id/editar', element: <PagoEditarPage /> },

      // Horarios
      { path: 'horarios', element: <HorariosIndexPage /> },
      { path: 'horarios/nuevo', element: <HorarioNuevoPage /> },
      { path: 'horarios/semana', element: <HorarioSemanalPage /> },
      { path: 'horarios/:id/editar', element: <HorarioEditarPage /> },

      // Profesores
      { path: 'profesores', element: <ProfesoresIndexPage /> },
      { path: 'profesores/nuevo', element: <ProfesorNuevoPage /> },
      { path: 'profesores/:id', element: <ProfesorPerfilPage /> },
      { path: 'profesores/:id/editar', element: <ProfesorEditarPage /> },

      // Boletas — módulo desarrollado pero fuera de la 1ra etapa (ver Sidebar.jsx)
      { path: 'boletas', element: <Navigate to="/dashboard" replace /> },

      // Pagos a Profesores — ídem
      { path: 'pagos-profesores', element: <Navigate to="/dashboard" replace /> },

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
    errorElement: <ErrorPage />,
  },
]);

export default router;
