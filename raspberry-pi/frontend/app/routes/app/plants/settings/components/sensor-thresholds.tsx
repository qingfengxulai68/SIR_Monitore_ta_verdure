import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Droplets, Cloud, Thermometer, Sun } from "lucide-react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Field, FieldGroup, FieldError, FieldLabel } from "~/components/ui/field"
import { Spinner } from "~/components/ui/spinner"
import {
  updatePlantThresholds,
  type Plant,
  plantUpdateThresholdsRequestSchema,
  type PlantUpdateThresholdsRequest,
  type ThresholdRange
} from "~/lib/api/plants"

interface SensorThresholdsProps {
  plant: Plant
  onPlantUpdate?: (plant: Plant) => void
}

export function SensorThresholds({ plant, onPlantUpdate }: SensorThresholdsProps) {
  const [isSaving, setIsSaving] = useState(false)

  const thresholdsForm = useForm<PlantUpdateThresholdsRequest>({
    resolver: zodResolver(plantUpdateThresholdsRequestSchema),
    defaultValues: {
      thresholds: plant.thresholds
    }
  })

  const handleNumberChange =
    (onChange: (value: number | string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      onChange(value === "" ? "" : parseFloat(value))
    }

  const handleSubmit = async (data: PlantUpdateThresholdsRequest) => {
    setIsSaving(true)

    try {
      await updatePlantThresholds(plant.id, data)
      toast.success("Sensor thresholds updated successfully.")
      thresholdsForm.reset(data)
      onPlantUpdate?.({ ...plant, thresholds: data.thresholds })
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sensor Thresholds</CardTitle>
        <CardDescription>Configure acceptable ranges for each sensor</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={thresholdsForm.handleSubmit(handleSubmit)}>
          <FieldGroup>
            {/* Moisture */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-moisture" />
                <h4 className="text-sm font-medium">Moisture (%)</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="thresholds.soilMoist.min"
                  control={thresholdsForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} className="text-xs">
                        Min
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        aria-invalid={fieldState.invalid}
                        onChange={handleNumberChange(field.onChange)}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="thresholds.soilMoist.max"
                  control={thresholdsForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} className="text-xs">
                        Max
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        aria-invalid={fieldState.invalid}
                        onChange={handleNumberChange(field.onChange)}
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
                <h4 className="text-sm font-medium">Humidity (%)</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="thresholds.humidity.min"
                  control={thresholdsForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} className="text-xs">
                        Min
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        aria-invalid={fieldState.invalid}
                        onChange={handleNumberChange(field.onChange)}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="thresholds.humidity.max"
                  control={thresholdsForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} className="text-xs">
                        Max
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        aria-invalid={fieldState.invalid}
                        onChange={handleNumberChange(field.onChange)}
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
                <h4 className="text-sm font-medium">Temperature (°C)</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="thresholds.temp.min"
                  control={thresholdsForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} className="text-xs">
                        Min
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        aria-invalid={fieldState.invalid}
                        onChange={handleNumberChange(field.onChange)}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="thresholds.temp.max"
                  control={thresholdsForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} className="text-xs">
                        Max
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        aria-invalid={fieldState.invalid}
                        onChange={handleNumberChange(field.onChange)}
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
                <h4 className="text-sm font-medium">Light (lux)</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="thresholds.light.min"
                  control={thresholdsForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} className="text-xs">
                        Min
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        aria-invalid={fieldState.invalid}
                        onChange={handleNumberChange(field.onChange)}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="thresholds.light.max"
                  control={thresholdsForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} className="text-xs">
                        Max
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        aria-invalid={fieldState.invalid}
                        onChange={handleNumberChange(field.onChange)}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={isSaving || !thresholdsForm.formState.isDirty}
                size="sm"
                className="gap-2"
              >
                {isSaving ? <Spinner /> : "Update"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
