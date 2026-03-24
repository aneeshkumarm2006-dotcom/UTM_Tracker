import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * React Query hook wrapping GET /api/dashboard/conversions.
 *
 * @param {Object} filters — optional filter params
 * @param {string}  [filters.source]  — filter by utm_source
 * @param {string}  [filters.from]    — ISO date string, start of range
 * @param {string}  [filters.to]      — ISO date string, end of range
 * @param {number}  [filters.limit]   — records per page (default 50, max 500)
 * @param {number}  [filters.page]    — page number (default 1)
 * @param {Object}  options — additional React Query options
 */
export function useConversions(filters = {}, options = {}) {
  return useQuery({
    queryKey: ['conversions', filters],
    queryFn: async () => {
      // Strip undefined/empty values so they don't appear as query params
      const params = {};
      if (filters.source) params.source = filters.source;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.limit) params.limit = filters.limit;
      if (filters.page) params.page = filters.page;

      const { data } = await api.get('/api/dashboard/conversions', { params });
      return data; // { total, page, limit, conversions[] }
    },
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}
