import { z } from "zod"

// Threshold ranges (hardcoded)
export const SOIL_MOIST_MIN = 0
export const SOIL_MOIST_MAX = 100
export const HUMIDITY_MIN = 0
export const HUMIDITY_MAX = 100
export const LIGHT_MIN = 0
export const LIGHT_MAX = 50000
export const TEMP_MIN = 0
export const TEMP_MAX = 50

// Local threshold range
export type ThresholdRange = {
  min: number
  max: number
}

// Local thresholds type
export type Thresholds = {
  soilMoist: ThresholdRange
  humidity: ThresholdRange
  light: ThresholdRange
  temp: ThresholdRange
}

// Local latest values type
export type LatestValues = {
  soilMoist: number
  humidity: number
  light: number
  temp: number
}

// Local plant status type
export type PlantStatus = "ok" | "alert" | "offline"

// Local plant type
export type Plant = {
  id: number
  name: string
  moduleId: string
  status: PlantStatus
  latestValues: LatestValues | null
  thresholds: Thresholds
}

// Base threshold range schema - validates min < max
const thresholdRangeBaseSchema = z
  .object({
    min: z.number(),
    max: z.number()
  })
  .refine((data) => data.min < data.max, {
    message: "Min must be less than max",
    path: ["min"] // Show error on min field
  })

// Soil moisture threshold with range validation
const soilMoistThresholdSchema = thresholdRangeBaseSchema
  .refine((data) => data.min >= SOIL_MOIST_MIN, {
    message: `Min must be at least ${SOIL_MOIST_MIN}`,
    path: ["min"]
  })
  .refine((data) => data.max <= SOIL_MOIST_MAX, {
    message: `Max must be at most ${SOIL_MOIST_MAX}`,
    path: ["max"]
  })

// Humidity threshold with range validation
const humidityThresholdSchema = thresholdRangeBaseSchema
  .refine((data) => data.min >= HUMIDITY_MIN, {
    message: `Min must be at least ${HUMIDITY_MIN}`,
    path: ["min"]
  })
  .refine((data) => data.max <= HUMIDITY_MAX, {
    message: `Max must be at most ${HUMIDITY_MAX}`,
    path: ["max"]
  })

// Light threshold with range validation
const lightThresholdSchema = thresholdRangeBaseSchema
  .refine((data) => data.min >= LIGHT_MIN, {
    message: `Min must be at least ${LIGHT_MIN}`,
    path: ["min"]
  })
  .refine((data) => data.max <= LIGHT_MAX, {
    message: `Max must be at most ${LIGHT_MAX}`,
    path: ["max"]
  })

// Temperature threshold with range validation
const tempThresholdSchema = thresholdRangeBaseSchema
  .refine((data) => data.min >= TEMP_MIN, {
    message: `Min must be at least ${TEMP_MIN}`,
    path: ["min"]
  })
  .refine((data) => data.max <= TEMP_MAX, {
    message: `Max must be at most ${TEMP_MAX}`,
    path: ["max"]
  })

// Request schema for thresholds validation
const thresholdsRequestSchema = z.object({
  soilMoist: soilMoistThresholdSchema,
  humidity: humidityThresholdSchema,
  light: lightThresholdSchema,
  temp: tempThresholdSchema
})

// Request schema and type for creating a plant
export const plantCreateRequestSchema = z.object({
  name: z.string().trim().min(1, "Plant name is required").max(100),
  moduleId: z.string().trim().min(1, "Module is required").max(50),
  thresholds: thresholdsRequestSchema
})

export type PlantCreateRequest = z.infer<typeof plantCreateRequestSchema>

// Request schema for updating plant general info
export const plantUpdateInfoRequestSchema = z.object({
  name: z.string().trim().min(1, "Plant name is required").max(100),
  moduleId: z.string().trim().min(1, "Module is required").max(50).optional()
})

export type PlantUpdateInfoRequest = z.infer<typeof plantUpdateInfoRequestSchema>

// Request schema for updating plant thresholds
export const plantUpdateThresholdsRequestSchema = z.object({
  thresholds: thresholdsRequestSchema
})

export type PlantUpdateThresholdsRequest = z.infer<typeof plantUpdateThresholdsRequestSchema>
