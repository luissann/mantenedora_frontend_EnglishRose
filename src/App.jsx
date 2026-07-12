import { RouterProvider } from 'react-router-dom';
import router from './router';
import { SistemaCaido } from './components/shared/SistemaCaido';

export default function App() {
  return (
    <>
      <SistemaCaido />
      <RouterProvider router={router} />
    </>
  );
}
