import { useEffect, useState } from "react"
import type { Route } from "./+types/settings"
import { useParams, useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Droplets, Cloud, Thermometer, Sun } from "lucide-react"
import { z } from "zod"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Field, FieldContent, FieldError, FieldLabel } from "~/components/ui/field"
import { Skeleton } from "~/components/ui/skeleton"
import { toast } from "sonner"
import { mockGetPlant, mockUpdatePlant, type Plant } from "~/lib/mocks"
import { useHeader } from "~/hooks/use-header"

// Schemas for individual sections
const generalInfoSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long")
})

const thresholdSchema = z.object({
  min: z.number().min(0),
  max: z.number().min(0)
})

type GeneralInfoFormData = z.infer<typeof generalInfoSchema>
type ThresholdFormData = z.infer<typeof thresholdSchema>

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Plant: ${params.id} - Terrarium` }, { name: "description", content: "Edit plant configuration." }]
}

export default function PlantSettings() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setHeaderContent } = useHeader()

  const [plant, setPlant] = useState<Plant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [savingSection, setSavingSection] = useState<string | null>(null)

  // Form for general information
  const generalForm = useForm<GeneralInfoFormData>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: {
      name: ""
    }
  })

  // Forms for each threshold section
  const moistureForm = useForm<ThresholdFormData>({
    resolver: zodResolver(thresholdSchema),
    defaultValues: { min: 30, max: 70 }
  })

  const humidityForm = useForm<ThresholdFormData>({
    resolver: zodResolver(thresholdSchema),
    defaultValues: { min: 40, max: 80 }
  })

  const temperatureForm = useForm<ThresholdFormData>({
    resolver: zodResolver(thresholdSchema),
    defaultValues: { min: 15, max: 30 }
  })

  const lightForm = useForm<ThresholdFormData>({
    resolver: zodResolver(thresholdSchema),
    defaultValues: { min: 1000, max: 10000 }
  })

  useEffect(() => {
    const loadData = async () => {
      if (!id) return

      const plantData = await mockGetPlant(parseInt(id))

      if (!plantData) {
        toast.error("Plant not found")
        navigate("/app/plants")
        return
      }

      setPlant(plantData)

      setHeaderContent({
        breadcrumbs: [{ label: "Plants", href: "/app/plants" }, { label: plantData.name }]
      })

      generalForm.reset({
        name: plantData.name
      })

      moistureForm.reset(plantData.thresholds.moisture)
      humidityForm.reset(plantData.thresholds.humidity)
      temperatureForm.reset(plantData.thresholds.temperature)
      lightForm.reset(plantData.thresholds.light)

      setIsLoading(false)
    }

    loadData()
  }, [id, navigate, setHeaderContent])

  const saveGeneralInfo = async (data: GeneralInfoFormData) => {
    if (!plant) return

    setSavingSection("general")

    try {
      await mockUpdatePlant(plant.id, {
        name: data.name,
        moduleId: plant.moduleId,
        thresholds: plant.thresholds
      })

      toast.success("General information updated successfully.")

      const updatedPlant = { ...plant, name: data.name }
      setPlant(updatedPlant)

      setHeaderContent({
        breadcrumbs: [{ label: "Plants", href: "/app/plants" }, { label: data.name }]
      })
    } catch {
      toast.error("Failed to save changes.")
    } finally {
      setSavingSection(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto py-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl mx-auto py-6 space-y-6">
      {/* General Information */}
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>Basic plant details and module assignment</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={generalForm.handleSubmit(saveGeneralInfo)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">Plant Name</FieldLabel>
                <FieldContent>
                  <Input id="name" placeholder="e.g., Monstera Deliciosa" {...generalForm.register("name")} />
                  <FieldError errors={[generalForm.formState.errors.name]} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="module">Module</FieldLabel>
                <FieldContent>
                  <Input id="module" value={plant?.moduleId || ""} disabled />
                </FieldContent>
              </Field>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={savingSection === "general" || !generalForm.formState.isDirty} size="sm">
                {savingSection === "general" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Sensor Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle>Sensor Thresholds</CardTitle>
          <CardDescription>Configure acceptable ranges for each sensor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Moisture */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-moisture" />
                <h4 className="font-medium">Moisture (%)</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="moisture-min">Min</FieldLabel>
                  <FieldContent>
                    <Input id="moisture-min" type="number" {...moistureForm.register("min")} />
                    <FieldError errors={[moistureForm.formState.errors.min]} />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="moisture-max">Max</FieldLabel>
                  <FieldContent>
                    <Input id="moisture-max" type="number" {...moistureForm.register("max")} />
                    <FieldError errors={[moistureForm.formState.errors.max]} />
                  </FieldContent>
                </Field>
              </div>
            </div>

            {/* Humidity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-humidity" />
                <h4 className="font-medium">Humidity (%)</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="humidity-min">Min</FieldLabel>
                  <FieldContent>
                    <Input id="humidity-min" type="number" {...humidityForm.register("min")} />
                    <FieldError errors={[humidityForm.formState.errors.min]} />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="humidity-max">Max</FieldLabel>
                  <FieldContent>
                    <Input id="humidity-max" type="number" {...humidityForm.register("max")} />
                    <FieldError errors={[humidityForm.formState.errors.max]} />
                  </FieldContent>
                </Field>
              </div>
            </div>

            {/* Temperature */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-temperature" />
                <h4 className="font-medium">Temperature (°C)</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="temperature-min">Min</FieldLabel>
                  <FieldContent>
                    <Input id="temperature-min" type="number" {...temperatureForm.register("min")} />
                    <FieldError errors={[temperatureForm.formState.errors.min]} />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="temperature-max">Max</FieldLabel>
                  <FieldContent>
                    <Input id="temperature-max" type="number" {...temperatureForm.register("max")} />
                    <FieldError errors={[temperatureForm.formState.errors.max]} />
                  </FieldContent>
                </Field>
              </div>
            </div>

            {/* Light */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-light" />
                <h4 className="font-medium">Light (lux)</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="light-min">Min</FieldLabel>
                  <FieldContent>
                    <Input id="light-min" type="number" {...lightForm.register("min")} />
                    <FieldError errors={[lightForm.formState.errors.min]} />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="light-max">Max</FieldLabel>
                  <FieldContent>
                    <Input id="light-max" type="number" {...lightForm.register("max")} />
                    <FieldError errors={[lightForm.formState.errors.max]} />
                  </FieldContent>
                </Field>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button
              onClick={async () => {
                const isValid = await Promise.all([
                  moistureForm.trigger(),
                  humidityForm.trigger(),
                  temperatureForm.trigger(),
                  lightForm.trigger()
                ])

                if (isValid.every((v) => v)) {
                  setSavingSection("thresholds")
                  try {
                    if (!plant) return

                    const updatedThresholds = {
                      moisture: moistureForm.getValues() as ThresholdFormData,
                      humidity: humidityForm.getValues() as ThresholdFormData,
                      temperature: temperatureForm.getValues() as ThresholdFormData,
                      light: lightForm.getValues() as ThresholdFormData
                    }

                    await mockUpdatePlant(plant.id, {
                      name: plant.name,
                      moduleId: plant.moduleId,
                      thresholds: updatedThresholds as any
                    })

                    toast.success("Sensor thresholds updated successfully.")

                    setPlant({ ...plant, thresholds: updatedThresholds as any })
                  } catch {
                    toast.error("Failed to save thresholds.")
                  } finally {
                    setSavingSection(null)
                  }
                }
              }}
              disabled={
                savingSection === "thresholds" ||
                !(
                  moistureForm.formState.isDirty ||
                  humidityForm.formState.isDirty ||
                  temperatureForm.formState.isDirty ||
                  lightForm.formState.isDirty
                )
              }
              size="sm"
              className="gap-2"
            >
              {savingSection === "thresholds" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
