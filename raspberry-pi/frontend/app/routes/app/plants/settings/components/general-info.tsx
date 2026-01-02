import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Field, FieldGroup, FieldError, FieldLabel } from "~/components/ui/field"
import { Spinner } from "~/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import type { Module } from "~/lib/api/modules"
import {
  updatePlantInfo,
  type Plant,
  plantUpdateInfoRequestSchema,
  type PlantUpdateInfoRequest
} from "~/lib/api/plants"

interface GeneralInformationProps {
  plant: Plant
  onPlantUpdate?: (plant: Plant) => void
  modules: Module[]
}

export function GeneralInformation({ plant, onPlantUpdate, modules }: GeneralInformationProps) {
  const [isSaving, setIsSaving] = useState(false)

  const generalForm = useForm<PlantUpdateInfoRequest>({
    resolver: zodResolver(plantUpdateInfoRequestSchema),
    defaultValues: {
      name: plant.name,
      moduleId: plant.moduleId
    }
  })

  // Filter modules to include uncoupled modules plus the current module
  const filteredModules = modules.filter((module) => !module.coupled || module.id === plant.moduleId)

  const handleSubmit = async (data: PlantUpdateInfoRequest) => {
    setIsSaving(true)

    try {
      const updatedPlant = await updatePlantInfo(plant.id, data)
      toast.success("General information updated successfully.")
      generalForm.reset({ name: data.name, moduleId: data.moduleId })
      onPlantUpdate?.(updatedPlant)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Information</CardTitle>
        <CardDescription>Basic plant details and module assignment</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={generalForm.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="name"
                control={generalForm.control}
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
                control={generalForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Module</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select a module" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredModules.map((module) => (
                          <SelectItem key={module.id} value={module.id.toString()}>
                            Module #{module.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSaving || !generalForm.formState.isDirty} size="sm">
                {isSaving ? <Spinner /> : "Update"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
