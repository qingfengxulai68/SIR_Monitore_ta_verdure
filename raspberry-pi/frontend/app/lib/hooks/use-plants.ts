import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "~/lib/api-client"
import type { Plant, PlantCreateRequest, PlantUpdateRequest } from "~/lib/types"
import { QueryKeys } from "~/lib/types"

// Hook to fetch the list of plants
export function usePlants() {
  return useQuery({
    queryKey: QueryKeys.plants,
    queryFn: () => apiClient.get<Plant[]>("/plants"),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
}

// Hook to fetch a single plant by ID
export function usePlant(plantId: number) {
  return useQuery({
    queryKey: QueryKeys.plant(plantId),
    queryFn: () => apiClient.get<Plant>(`/plants/${plantId}`),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
}

// Hook to create a new plant
export function useCreatePlant() {
  return useMutation({
    mutationFn: (data: PlantCreateRequest) => apiClient.post<void, PlantCreateRequest>("/plants", data),

    onSuccess: () => {
      toast.success("Plant created")
    },

    onError: (error) => {
      toast.error(error.message)
    }
  })
}

// Hook to update an existing plant
export function useUpdatePlant() {
  return useMutation({
    mutationFn: ({ plantId, data }: { plantId: number; data: PlantUpdateRequest }) =>
      apiClient.put<void, PlantUpdateRequest>(`/plants/${plantId}`, data),

    onSuccess: () => {
      toast.success("Plant updated")
    },

    onError: (error) => {
      toast.error(error.message)
    }
  })
}

// Hook to delete a plant
export function useDeletePlant() {
  return useMutation({
    mutationFn: (plantId: number) => apiClient.delete<void>(`/plants/${plantId}`),

    onSuccess: () => {
      toast.success("Plant deleted")
    },

    onError: (error) => {
      toast.error(error.message)
    }
  })
}
