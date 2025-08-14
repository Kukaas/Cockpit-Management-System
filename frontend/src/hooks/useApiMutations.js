import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/services/api'

// Generic API mutation hook
export const useApiMutation = ({
  mutationFn,
  queryKey,
  successMessage,
  errorMessage,
  onSuccess,
  onError,
  invalidateQueries = true,
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Show success message if provided
      if (successMessage) {
        toast.success(typeof successMessage === 'function' ? successMessage(data, variables) : successMessage)
      }

      // Invalidate queries if queryKey is provided
      if (invalidateQueries && queryKey) {
        queryClient.invalidateQueries({ queryKey })
      }

      // Call custom onSuccess if provided
      if (onSuccess) {
        onSuccess(data, variables, context)
      }
    },
    onError: (error, variables, context) => {
      // Show error message
      const message = errorMessage ||
        error.response?.data?.message ||
        'An error occurred'

      toast.error(typeof message === 'function' ? message(error, variables) : message)

      // Call custom onError if provided
      if (onError) {
        onError(error, variables, context)
      }
    },
  })
}

// Predefined mutations for common operations
export const useCreateMutation = (endpoint, options = {}) => {
  return useApiMutation({
    mutationFn: async (data) => {
      const response = await api.post(endpoint, data)
      return response.data
    },
    successMessage: options.successMessage || 'Created successfully',
    errorMessage: options.errorMessage || 'Failed to create',
    queryKey: options.queryKey,
    onSuccess: options.onSuccess,
    onError: options.onError,
    invalidateQueries: options.invalidateQueries ?? true,
  })
}

export const useUpdateMutation = (endpoint, options = {}) => {
  return useApiMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`${endpoint}/${id}`, data)
      return response.data
    },
    successMessage: options.successMessage || 'Updated successfully',
    errorMessage: options.errorMessage || 'Failed to update',
    queryKey: options.queryKey,
    onSuccess: options.onSuccess,
    onError: options.onError,
    invalidateQueries: options.invalidateQueries ?? true,
  })
}

export const useDeleteMutation = (endpoint, options = {}) => {
  return useApiMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`${endpoint}/${id}`)
      return response.data
    },
    successMessage: options.successMessage || 'Deleted successfully',
    errorMessage: options.errorMessage || 'Failed to delete',
    queryKey: options.queryKey,
    onSuccess: options.onSuccess,
    onError: options.onError,
    invalidateQueries: options.invalidateQueries ?? true,
  })
}

export const usePutMutation = (endpoint, options = {}) => {
  return useApiMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`${endpoint}/${id}`, data)
      return response.data
    },
    successMessage: options.successMessage || 'Updated successfully',
    errorMessage: options.errorMessage || 'Failed to update',
    queryKey: options.queryKey,
    onSuccess: options.onSuccess,
    onError: options.onError,
    invalidateQueries: options.invalidateQueries ?? true,
  })
}

// Custom mutation for specific endpoints
export const useCustomMutation = (mutationFn, options = {}) => {
  return useApiMutation({
    mutationFn,
    successMessage: options.successMessage,
    errorMessage: options.errorMessage,
    queryKey: options.queryKey,
    onSuccess: options.onSuccess,
    onError: options.onError,
    invalidateQueries: options.invalidateQueries ?? true,
  })
}
