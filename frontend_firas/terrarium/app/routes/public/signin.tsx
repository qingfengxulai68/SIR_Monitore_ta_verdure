import type { Route } from "./+types/signin"
import { useState } from "react"
import { redirect, useNavigate } from "react-router"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Leaf, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldError } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { mockLogin } from "~/lib/mocks"
import { loginSchema, type LoginFormData } from "~/lib/validation"

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const isLoggedIn = false // Replace with real authentication check
  if (isLoggedIn) {
    return redirect("/app/")
  }

  return null
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Sign In - Terrarium" }, { name: "description", content: "Log in to access your dashboard." }]
}

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const result = await mockLogin(data.username, data.password)

      if (result.success) {
        toast.success("Welcome back!")
        navigate("/app/")
      } else {
        toast.error(result.error || "Invalid credentials")
        form.reset()
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
      form.reset()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Leaf className="size-4" />
          </div>
          Terrarium
        </a>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>Login with your username and password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Controller
                    name="username"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="text"
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <div className="flex items-center">
                          <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                          <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline text-foreground">
                            Forgot your password?
                          </a>
                        </div>
                        <Input
                          {...field}
                          id={field.name}
                          type="password"
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Field>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Spinner /> : "Sign In"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
