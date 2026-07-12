import { useQuery } from '@tanstack/react-query';
import { buscarGlobal } from '../api/buscar';

export function useBuscarGlobal(q) {
  const term = (q || '').trim();
  return useQuery({
    queryKey: ['buscar-global', term],
    queryFn: () => buscarGlobal(term),
    enabled: term.length >= 2,
    staleTime: 10_000,
  });
}
