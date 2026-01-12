// Module connectivity type definition
export type ModuleConnectivity =
  | {
      isOnline: true
      lastSeen: string
    }
  | {
      isOnline: false
      lastSeen: string | null
    }

// Module type definition
export type Module = {
  id: string
  connectivity: ModuleConnectivity
  coupled: boolean
  coupledPlantId: number | null
}
