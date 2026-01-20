import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "~/lib/api-client"
import type { Module } from "~/lib/types"
import { QueryKeys } from "~/lib/types"

// Hook to fetch the list of modules
export function useModules() {
  return useQuery({
    queryKey: QueryKeys.modules(),
    queryFn: () => apiClient.get<Module[]>("/modules"),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    gcTime: Infinity
  })
}

// Hook to uncouple a module
export function useUncoupleModule() {
  return useMutation({
    mutationFn: (moduleId: string) => apiClient.delete<void>(`/modules/${moduleId}/coupling`),

    onSuccess: () => {
      toast.success("Module released")
    },

    onError: (error) => {
      toast.error(error.message)
    }
  })
}
