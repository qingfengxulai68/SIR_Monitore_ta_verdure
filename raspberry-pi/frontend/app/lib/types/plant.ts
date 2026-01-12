import { z } from "zod"
import { SENSOR_THRESHOLDS } from "../constants"
import type { Metrics } from "./metrics"
import type { ModuleConnectivity } from "./module"

// Read threshold ranges from constants
const SOIL_MOIST_MIN = SENSOR_THRESHOLDS.SOIL_MOIST.MIN
const SOIL_MOIST_MAX = SENSOR_THRESHOLDS.SOIL_MOIST.MAX
const HUMIDITY_MIN = SENSOR_THRESHOLDS.HUMIDITY.MIN
const HUMIDITY_MAX = SENSOR_THRESHOLDS.HUMIDITY.MAX
const LIGHT_MIN = SENSOR_THRESHOLDS.LIGHT.MIN
const LIGHT_MAX = SENSOR_THRESHOLDS.LIGHT.MAX
const TEMP_MIN = SENSOR_THRESHOLDS.TEMP.MIN
const TEMP_MAX = SENSOR_THRESHOLDS.TEMP.MAX

// Thresholds type definition
export type ThresholdRange = {
  min: number
  max: number
}

export type PlantThresholds = {
  soilMoist: ThresholdRange
  humidity: ThresholdRange
  light: ThresholdRange
  temp: ThresholdRange
}

// Last metrics update type definition
export type LastMetricsUpdate = {
  timestamp: string
  metrics: Metrics
  isHealthy: boolean
}

// Plant type definition
export type Plant = {
  id: number
  name: string
  module: {
    id: string
    connectivity: ModuleConnectivity
  }
  lastMetricsUpdate: LastMetricsUpdate | null
  thresholds: PlantThresholds
}

// Request schema for thresholds validation
const thresholdRangeBaseSchema = z
  .object({
    min: z.number(),
    max: z.number()
  })
  .refine((data) => data.min < data.max, {
    message: "Min must be less than max",
    path: ["min"]
  })

const thresholdsRequestSchema = z.object({
  soilMoist: thresholdRangeBaseSchema
    .refine((data) => data.min >= SOIL_MOIST_MIN, {
      message: `Min must be at least ${SOIL_MOIST_MIN}`,
      path: ["min"]
    })
    .refine((data) => data.max <= SOIL_MOIST_MAX, {
      message: `Max must be at most ${SOIL_MOIST_MAX}`,
      path: ["max"]
    }),
  humidity: thresholdRangeBaseSchema
    .refine((data) => data.min >= HUMIDITY_MIN, {
      message: `Min must be at least ${HUMIDITY_MIN}`,
      path: ["min"]
    })
    .refine((data) => data.max <= HUMIDITY_MAX, {
      message: `Max must be at most ${HUMIDITY_MAX}`,
      path: ["max"]
    }),
  light: thresholdRangeBaseSchema
    .refine((data) => data.min >= LIGHT_MIN, {
      message: `Min must be at least ${LIGHT_MIN}`,
      path: ["min"]
    })
    .refine((data) => data.max <= LIGHT_MAX, {
      message: `Max must be at most ${LIGHT_MAX}`,
      path: ["max"]
    }),
  temp: thresholdRangeBaseSchema
    .refine((data) => data.min >= TEMP_MIN, {
      message: `Min must be at least ${TEMP_MIN}`,
      path: ["min"]
    })
    .refine((data) => data.max <= TEMP_MAX, {
      message: `Max must be at most ${TEMP_MAX}`,
      path: ["max"]
    })
})

// Schema and type for creating a plant
export const plantCreateRequestSchema = z.object({
  name: z.string().trim().min(1, "Plant name is required").max(100),
  moduleId: z.string().trim().min(1, "Module is required").max(50),
  thresholds: thresholdsRequestSchema
})

export type PlantCreateRequest = z.infer<typeof plantCreateRequestSchema>

// Schema and type for updating plant general info
export const plantUpdateInfoRequestSchema = z.object({
  name: z.string().trim().min(1, "Plant name is required").max(100),
  moduleId: z.string().trim().min(1, "Module is required").max(50).optional()
})

export type PlantUpdateInfoRequest = z.infer<typeof plantUpdateInfoRequestSchema>

// Schema and type for updating plant thresholds
export const plantUpdateThresholdsRequestSchema = z.object({
  thresholds: thresholdsRequestSchema
})

export type PlantUpdateThresholdsRequest = z.infer<typeof plantUpdateThresholdsRequestSchema>

// Plant update request type definition
export type PlantUpdateRequest = PlantUpdateInfoRequest | PlantUpdateThresholdsRequest
