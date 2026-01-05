// Module response type definition
export interface ModuleResponse {
  id: string
  isOnline: boolean
  coupled: boolean
  coupledPlant: {
    id: number
    name: string
  } | null
}
