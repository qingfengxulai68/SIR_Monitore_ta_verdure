import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Field, FieldGroup, FieldError, FieldLabel } from "~/components/ui/field"
import { Spinner } from "~/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { useUpdatePlant } from "~/lib/hooks/use-plants"
import type { Module, Plant } from "~/lib/types"
import { plantUpdateInfoRequestSchema, type PlantUpdateInfoRequest } from "~/lib/types"

interface GeneralInformationProps {
  plant: Plant
  modules: Module[]
}

export function GeneralInformation({ plant, modules }: GeneralInformationProps) {
  const updateMutation = useUpdatePlant()

  const generalForm = useForm<PlantUpdateInfoRequest>({
    resolver: zodResolver(plantUpdateInfoRequestSchema),
    defaultValues: {
      name: plant.name,
      moduleId: plant.module.id
    }
  })

  // Filter modules to include uncoupled modules plus the current module
  const filteredModules = modules.filter((module) => !module.coupled || module.id === plant.module.id)

  const handleSubmit = (formData: PlantUpdateInfoRequest) => {
    updateMutation.mutate(
      {
        plantId: plant.id,
        data: {
          name: formData.name,
          moduleId: formData.moduleId,
          thresholds: plant.thresholds
        }
      },
      {
        onSuccess: () => {
          generalForm.reset({ name: formData.name, moduleId: formData.moduleId })
        }
      }
    )
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
              <Button type="submit" disabled={updateMutation.isPending || !generalForm.formState.isDirty} size="sm">
                {updateMutation.isPending ? <Spinner /> : "Update"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
