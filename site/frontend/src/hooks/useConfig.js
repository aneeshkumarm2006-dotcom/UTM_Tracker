import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * React Query hook for GET /api/dashboard/config.
 * Returns the user's current configuration (triggerPage, buttonId, fields[]).
 */
export function useConfig(options = {}) {
  return useQuery({
    queryKey: ['config'],
    queryFn: async () => {
      const { data } = await api.get('/api/dashboard/config');
      return data; // { triggerPage, buttonId, fields[] }
    },
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * React Query mutation for POST /api/dashboard/config.
 * Saves a new configuration and invalidates the config cache on success.
 *
 * @param {Object} options — additional useMutation options (onSuccess, onError, etc.)
 */
export function useSaveConfig(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config) => {
      const { data } = await api.post('/api/dashboard/config', config);
      return data; // { ok, message }
    },
    onSuccess: (...args) => {
      // Invalidate so the next read reflects the saved config
      queryClient.invalidateQueries({ queryKey: ['config'] });
      // Also invalidate snippet since it depends on config
      queryClient.invalidateQueries({ queryKey: ['snippet'] });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}
