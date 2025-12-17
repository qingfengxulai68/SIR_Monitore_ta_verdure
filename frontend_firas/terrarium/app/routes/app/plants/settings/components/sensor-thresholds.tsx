import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Droplets, Cloud, Thermometer, Sun } from "lucide-react"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Field, FieldGroup, FieldError, FieldLabel } from "~/components/ui/field"
import { Spinner } from "~/components/ui/spinner"
import { mockUpdatePlant, type Plant } from "~/lib/mocks"

const thresholdSchema = z.object({
  min: z.number().min(0),
  max: z.number().min(0)
})

type ThresholdFormData = z.infer<typeof thresholdSchema>

export type ThresholdsData = {
  moisture: ThresholdFormData
  humidity: ThresholdFormData
  temperature: ThresholdFormData
  light: ThresholdFormData
}

interface SensorThresholdsProps {
  plant: Plant
  onPlantUpdate?: (plant: Plant) => void
}

export function SensorThresholds({ plant, onPlantUpdate }: SensorThresholdsProps) {
  const [isSaving, setIsSaving] = useState(false)

  const moistureForm = useForm<ThresholdFormData>({
    resolver: zodResolver(thresholdSchema),
    defaultValues: plant.thresholds.moisture
  })

  const humidityForm = useForm<ThresholdFormData>({
    resolver: zodResolver(thresholdSchema),
    defaultValues: plant.thresholds.humidity
  })

  const temperatureForm = useForm<ThresholdFormData>({
    resolver: zodResolver(thresholdSchema),
    defaultValues: plant.thresholds.temperature
  })

  const lightForm = useForm<ThresholdFormData>({
    resolver: zodResolver(thresholdSchema),
    defaultValues: plant.thresholds.light
  })

  const handleUpdate = async () => {
    const isValid = await Promise.all([
      moistureForm.trigger(),
      humidityForm.trigger(),
      temperatureForm.trigger(),
      lightForm.trigger()
    ])

    if (isValid.every((v) => v)) {
      setIsSaving(true)

      try {
        const updatedThresholds = {
          moisture: moistureForm.getValues(),
          humidity: humidityForm.getValues(),
          temperature: temperatureForm.getValues(),
          light: lightForm.getValues()
        }

        await mockUpdatePlant(plant.id, {
          name: plant.name,
          moduleId: plant.moduleId,
          thresholds: updatedThresholds as any
        })

        toast.success("Sensor thresholds updated successfully.")

        // Reset all forms to mark them as clean after successful save
        moistureForm.reset(updatedThresholds.moisture)
        humidityForm.reset(updatedThresholds.humidity)
        temperatureForm.reset(updatedThresholds.temperature)
        lightForm.reset(updatedThresholds.light)

        onPlantUpdate?.({ ...plant, thresholds: updatedThresholds as any })
      } catch {
        toast.error("Failed to save thresholds.")
      } finally {
        setIsSaving(false)
      }
    }
  }

  const isDirty =
    moistureForm.formState.isDirty ||
    humidityForm.formState.isDirty ||
    temperatureForm.formState.isDirty ||
    lightForm.formState.isDirty

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sensor Thresholds</CardTitle>
        <CardDescription>Configure acceptable ranges for each sensor</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          {/* Moisture */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-moisture" />
              <h4 className="font-medium">Moisture (%)</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="min"
                control={moistureForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="moisture-min">Min</FieldLabel>
                    <Input
                      {...field}
                      id="moisture-min"
                      type="number"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="max"
                control={moistureForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="moisture-max">Max</FieldLabel>
                    <Input
                      {...field}
                      id="moisture-max"
                      type="number"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </div>

          {/* Humidity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-humidity" />
              <h4 className="font-medium">Humidity (%)</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="min"
                control={humidityForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="humidity-min">Min</FieldLabel>
                    <Input
                      {...field}
                      id="humidity-min"
                      type="number"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="max"
                control={humidityForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="humidity-max">Max</FieldLabel>
                    <Input
                      {...field}
                      id="humidity-max"
                      type="number"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </div>

          {/* Temperature */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-temperature" />
              <h4 className="font-medium">Temperature (°C)</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="min"
                control={temperatureForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="temperature-min">Min</FieldLabel>
                    <Input
                      {...field}
                      id="temperature-min"
                      type="number"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="max"
                control={temperatureForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="temperature-max">Max</FieldLabel>
                    <Input
                      {...field}
                      id="temperature-max"
                      type="number"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </div>

          {/* Light */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-light" />
              <h4 className="font-medium">Light (lux)</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="min"
                control={lightForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="light-min">Min</FieldLabel>
                    <Input
                      {...field}
                      id="light-min"
                      type="number"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="max"
                control={lightForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="light-max">Max</FieldLabel>
                    <Input
                      {...field}
                      id="light-max"
                      type="number"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button onClick={handleUpdate} disabled={isSaving || !isDirty} size="sm" className="gap-2">
              {isSaving ? <Spinner /> : "Update"}
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
