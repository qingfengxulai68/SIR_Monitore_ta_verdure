import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Field, FieldGroup, FieldError, FieldLabel } from "~/components/ui/field"
import { Spinner } from "~/components/ui/spinner"
import { mockUpdatePlant, type Plant } from "~/lib/mocks"

const generalInfoSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long")
})

type GeneralInfoFormData = z.infer<typeof generalInfoSchema>

interface GeneralInformationProps {
  plant: Plant
  onPlantUpdate?: (plant: Plant) => void
}

export function GeneralInformation({ plant, onPlantUpdate }: GeneralInformationProps) {
  const [isSaving, setIsSaving] = useState(false)

  const generalForm = useForm<GeneralInfoFormData>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: {
      name: plant.name
    }
  })

  const handleSubmit = async (data: GeneralInfoFormData) => {
    setIsSaving(true)

    try {
      await mockUpdatePlant(plant.id, {
        name: data.name,
        moduleId: plant.moduleId,
        thresholds: plant.thresholds
      })

      toast.success("General information updated successfully.")

      generalForm.reset({ name: data.name })

      onPlantUpdate?.({ ...plant, name: data.name })
    } catch {
      toast.error("Failed to save changes.")
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

              <Field>
                <FieldLabel htmlFor="module">Module</FieldLabel>
                <Input id="module" value={plant.moduleId || ""} disabled />
              </Field>
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
