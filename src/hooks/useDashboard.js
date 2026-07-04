import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../api/dashboard';
import useAuthStore from '../store/authStore';

export function useDashboard() {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    enabled: isAuthenticated,
  });
}