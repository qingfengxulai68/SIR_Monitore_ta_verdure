// Metrics type definition
export type Metrics = {
  timestamp: string
  soilMoist: number
  humidity: number
  light: number
  temp: number
}

// History types
export type HistoryMetrics = {
  timestamp: string
  soilMoist: number | null
  humidity: number | null
  light: number | null
  temp: number | null
}

export type HistoryMeta = {
  range: "hour" | "day" | "week" | "month"
  aggregation: string
  from: string
  to: string
}

export type HistoryResponse = {
  meta: HistoryMeta
  data: HistoryMetrics[]
}
