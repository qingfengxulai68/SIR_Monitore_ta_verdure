import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Sprout, Thermometer, Sun, Cloud } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "~/components/ui/dialog"
import { Field, FieldGroup, FieldLabel, FieldError } from "~/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Spinner } from "~/components/ui/spinner"
import { ErrorWithRetry } from "~/components/other/error-with-retry"
import { useCreatePlant } from "~/lib/hooks/use-plants"
import { useModules } from "~/lib/hooks/use-modules"
import { plantCreateRequestSchema, type PlantCreateRequest } from "~/lib/types"
import { SENSOR_THRESHOLDS } from "~/lib/constants"

// Read threshold ranges from constants
const SOIL_MOIST_MIN = SENSOR_THRESHOLDS.SOIL_MOIST.MIN
const SOIL_MOIST_MAX = SENSOR_THRESHOLDS.SOIL_MOIST.MAX
const HUMIDITY_MIN = SENSOR_THRESHOLDS.HUMIDITY.MIN
const HUMIDITY_MAX = SENSOR_THRESHOLDS.HUMIDITY.MAX
const LIGHT_MIN = SENSOR_THRESHOLDS.LIGHT.MIN
const LIGHT_MAX = SENSOR_THRESHOLDS.LIGHT.MAX
const TEMP_MIN = SENSOR_THRESHOLDS.TEMP.MIN
const TEMP_MAX = SENSOR_THRESHOLDS.TEMP.MAX

interface CreatePlantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePlantDialog({ open, onOpenChange }: CreatePlantDialogProps) {
  const { data: availableModules = [], isLoading: modulesLoading, error: modulesError } = useModules(false)
  const createMutation = useCreatePlant()

  const form = useForm<PlantCreateRequest>({
    resolver: zodResolver(plantCreateRequestSchema),
    defaultValues: {
      name: "",
      moduleId: "",
      thresholds: {
        soilMoist: { min: SOIL_MOIST_MIN, max: SOIL_MOIST_MAX },
        humidity: { min: HUMIDITY_MIN, max: HUMIDITY_MAX },
        light: { min: LIGHT_MIN, max: LIGHT_MAX },
        temp: { min: TEMP_MIN, max: TEMP_MAX }
      }
    }
  })

  const handleNumberChange =
    (onChange: (value: number | string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      onChange(value === "" ? "" : parseFloat(value))
    }

  const onSubmit = (data: PlantCreateRequest) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        form.reset()
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl gap-7">
        <DialogHeader>
          <DialogTitle>Add New Plant</DialogTitle>
          <DialogDescription>Create a new plant and connect it to a module for monitoring.</DialogDescription>
        </DialogHeader>

        {modulesLoading ? (
          <div className="flex items-center justify-center h-40">
            <Spinner />
          </div>
        ) : modulesError ? (
          <ErrorWithRetry error={modulesError.message} onRetry={() => {}} />
        ) : (
          <>
            <ScrollArea className="max-h-[60vh] pr-4">
              <form id="create-plant-form" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Plant Name</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="text"
                          placeholder="e.g., Monstera Deliciosa"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="moduleId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Module</FieldLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                            <SelectValue placeholder="Select a module" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableModules.length === 0 ? (
                              <div className="p-2 text-sm text-muted-foreground text-center">No available modules</div>
                            ) : (
                              availableModules.map((module) => (
                                <SelectItem key={module.id} value={module.id.toString()}>
                                  Module #{module.id}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="text-sm font-medium">Sensor Thresholds</div>

                    {/* Moisture Thresholds */}
                    <div className="space-y-3 rounded-lg border p-4">
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <Sprout className="h-4 w-4 text-moisture" />
                        Soil Moisture
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Controller
                          name="thresholds.soilMoist.min"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={field.name} className="text-xs">
                                Min (%)
                              </FieldLabel>
                              <Input
                                {...field}
                                id={field.name}
                                type="number"
                                aria-invalid={fieldState.invalid}
                                onChange={(e) =>
                                  field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))
                                }
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                        <Controller
                          name="thresholds.soilMoist.max"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={field.name} className="text-xs">
                                Max (%)
                              </FieldLabel>
                              <Input
                                {...field}
                                id={field.name}
                                type="number"
                                aria-invalid={fieldState.invalid}
                                onChange={(e) =>
                                  field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))
                                }
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                      </div>
                    </div>

                    {/* Humidity Thresholds */}
                    <div className="space-y-3 rounded-lg border p-4">
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <Cloud className="h-4 w-4 text-humidity" />
                        Humidity
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Controller
                          name="thresholds.humidity.min"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={field.name} className="text-xs">
                                Min (%)
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
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={field.name} className="text-xs">
                                Max (%)
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

                    {/* Temperature Thresholds */}
                    <div className="space-y-3 rounded-lg border p-4">
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <Thermometer className="h-4 w-4 text-temperature" />
                        Temperature
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Controller
                          name="thresholds.temp.min"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={field.name} className="text-xs">
                                Min (°C)
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
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={field.name} className="text-xs">
                                Max (°C)
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

                    {/* Light Thresholds */}
                    <div className="space-y-3 rounded-lg border p-4">
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <Sun className="h-4 w-4 text-light" />
                        Light
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Controller
                          name="thresholds.light.min"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={field.name} className="text-xs">
                                Min (lux)
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
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={field.name} className="text-xs">
                                Max (lux)
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
                  </div>
                </FieldGroup>
              </form>
            </ScrollArea>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" form="create-plant-form" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Spinner /> : "Create"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
