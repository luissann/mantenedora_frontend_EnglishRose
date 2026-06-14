import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-page text-text-primary">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <Topbar />
          <main className="mt-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
