import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'

// Generic API query hook
export const useApiQuery = (queryKey, queryFn, options = {}) => {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes default
    ...options,
  })
}

// Predefined queries for common operations
export const useGetAll = (endpoint, options = {}) => {
  return useApiQuery(
    [endpoint],
    async () => {
      const response = await api.get(endpoint)
      return response.data.data || response.data || []
    },
    options
  )
}

export const useGetById = (endpoint, id, options = {}) => {
  return useApiQuery(
    [endpoint, id],
    async () => {
      const response = await api.get(`${endpoint}/${id}`)
      return response.data.data || response.data
    },
    {
      enabled: !!id, // Only run query if id exists
      ...options,
    }
  )
}

export const useGetWithFilters = (endpoint, filters = {}, options = {}) => {
  const { page, limit, search, ...otherFilters } = filters

  return useApiQuery(
    [endpoint, 'filtered', filters],
    async () => {
      const params = new URLSearchParams()

      // Add pagination params
      if (page) params.append('page', page)
      if (limit) params.append('limit', limit)
      if (search) params.append('search', search)

      // Add other filters
      Object.entries(otherFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value)
        }
      })

      const response = await api.get(`${endpoint}?${params.toString()}`)
      return response.data
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes for filtered results
      ...options,
    }
  )
}

// Custom query for specific endpoints
export const useCustomQuery = (queryKey, queryFn, options = {}) => {
  return useApiQuery(queryKey, queryFn, options)
}
