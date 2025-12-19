import { useState, useEffect } from "react"
import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Sprout, Droplets, Thermometer, Sun, Cloud, Loader2 } from "lucide-react"

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
import { toast } from "sonner"
import { mockCreatePlant, mockGetModules, type Module } from "~/lib/mocks"
import { plantSchema, type PlantFormData } from "~/lib/validation"
import { Spinner } from "~/components/ui/spinner"

interface CreatePlantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function CreatePlantDialog({ open, onOpenChange, onCreated }: CreatePlantDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [availableModules, setAvailableModules] = useState<Module[]>([])

  const form = useForm({
    resolver: zodResolver(plantSchema),
    defaultValues: {
      name: "",
      moduleId: "",
      thresholds: {
        moisture: { min: 30, max: 70 },
        humidity: { min: 40, max: 80 },
        temperature: { min: 15, max: 30 },
        light: { min: 1000, max: 10000 }
      }
    }
  })

  useEffect(() => {
    if (open) {
      const loadModules = async () => {
        const modules = await mockGetModules(true)
        setAvailableModules(modules)
      }
      loadModules()
      form.reset()
    }
  }, [open, form])

  const onSubmit = async (data: PlantFormData) => {
    setIsLoading(true)

    try {
      await mockCreatePlant({
        name: data.name,
        moduleId: data.moduleId,
        thresholds: data.thresholds
      })

      toast.success(`${data.name} has been added successfully.`)
      onOpenChange(false)
      onCreated()
    } catch {
      toast.error("Failed to create plant.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl gap-7">
        <DialogHeader>
          <DialogTitle>Add New Plant</DialogTitle>
          <DialogDescription>Create a new plant and connect it to a module for monitoring.</DialogDescription>
        </DialogHeader>

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
                    Moisture
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Controller
                      name="thresholds.moisture.min"
                      control={form.control}
                      render={({ field: { value, onChange, ...field }, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name} className="text-xs">
                            Min (%)
                          </FieldLabel>
                          <Input
                            {...field}
                            id={field.name}
                            type="number"
                            value={value as number}
                            aria-invalid={fieldState.invalid}
                            onChange={(e) => onChange(Number(e.target.value))}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                    <Controller
                      name="thresholds.moisture.max"
                      control={form.control}
                      render={({ field: { value, onChange, ...field }, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name} className="text-xs">
                            Max (%)
                          </FieldLabel>
                          <Input
                            {...field}
                            id={field.name}
                            type="number"
                            value={value as number}
                            aria-invalid={fieldState.invalid}
                            onChange={(e) => onChange(Number(e.target.value))}
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
                      render={({ field: { value, onChange, ...field }, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name} className="text-xs">
                            Min (%)
                          </FieldLabel>
                          <Input
                            {...field}
                            id={field.name}
                            type="number"
                            value={value as number}
                            aria-invalid={fieldState.invalid}
                            onChange={(e) => onChange(Number(e.target.value))}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                    <Controller
                      name="thresholds.humidity.max"
                      control={form.control}
                      render={({ field: { value, onChange, ...field }, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name} className="text-xs">
                            Max (%)
                          </FieldLabel>
                          <Input
                            {...field}
                            id={field.name}
                            type="number"
                            value={value as number}
                            aria-invalid={fieldState.invalid}
                            onChange={(e) => onChange(Number(e.target.value))}
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
                      name="thresholds.temperature.min"
                      control={form.control}
                      render={({ field: { value, onChange, ...field }, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name} className="text-xs">
                            Min (°C)
                          </FieldLabel>
                          <Input
                            {...field}
                            id={field.name}
                            type="number"
                            value={value as number}
                            aria-invalid={fieldState.invalid}
                            onChange={(e) => onChange(Number(e.target.value))}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                    <Controller
                      name="thresholds.temperature.max"
                      control={form.control}
                      render={({ field: { value, onChange, ...field }, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name} className="text-xs">
                            Max (°C)
                          </FieldLabel>
                          <Input
                            {...field}
                            id={field.name}
                            type="number"
                            value={value as number}
                            aria-invalid={fieldState.invalid}
                            onChange={(e) => onChange(Number(e.target.value))}
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
                      render={({ field: { value, onChange, ...field }, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name} className="text-xs">
                            Min (lux)
                          </FieldLabel>
                          <Input
                            {...field}
                            id={field.name}
                            type="number"
                            value={value as number}
                            aria-invalid={fieldState.invalid}
                            onChange={(e) => onChange(Number(e.target.value))}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                    <Controller
                      name="thresholds.light.max"
                      control={form.control}
                      render={({ field: { value, onChange, ...field }, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name} className="text-xs">
                            Max (lux)
                          </FieldLabel>
                          <Input
                            {...field}
                            id={field.name}
                            type="number"
                            value={value as number}
                            aria-invalid={fieldState.invalid}
                            onChange={(e) => onChange(Number(e.target.value))}
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
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" form="create-plant-form" disabled={isLoading}>
            {isLoading ? <Spinner /> : "Create Plant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
