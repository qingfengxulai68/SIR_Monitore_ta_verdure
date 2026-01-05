import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "~/lib/api-client"
import type { ModuleResponse } from "~/lib/types"
import { QueryKeys } from "~/lib/types"

// Hook to fetch the list of modules
export function useModules(coupled?: boolean) {
  return useQuery({
    queryKey: QueryKeys.modules(coupled),
    queryFn: () => {
      const endpoint = coupled === undefined ? "/modules" : `/modules?coupled=${coupled}`
      return apiClient.get<ModuleResponse[]>(endpoint)
    },
    staleTime: Infinity
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
