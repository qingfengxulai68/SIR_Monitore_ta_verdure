// Local coupled plant response type
export type CoupledPlant = {
  id: number
  name: string
}

// Local module type
export type Module = {
  id: string
  coupled: boolean
  coupledPlant: CoupledPlant | null
  isOnline: boolean
}
