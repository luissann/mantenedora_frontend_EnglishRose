import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Spinner } from '../ui/Spinner';

function RouteFallback() {
  return (
    <div className="flex h-96 items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-page text-text-primary">
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="min-w-0 flex-1 p-4 sm:p-6">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="mt-6">
            <Suspense fallback={<RouteFallback />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
