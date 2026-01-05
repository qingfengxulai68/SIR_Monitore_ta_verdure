import type { Route } from "./+types/signin"
import { redirect } from "react-router"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Sprout } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldError } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { isAuthenticated } from "~/hooks/use-auth"
import { Spinner } from "~/components/ui/spinner"
import { useLogin } from "~/hooks/use-auth"
import { loginRequestSchema, type LoginRequest } from "~/lib/types"

// Client-side loader to redirect authenticated users
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  if (isAuthenticated()) {
    return redirect("/app/")
  }
  return null
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Sign In - Terrarium" }, { name: "description", content: "Log in to access your dashboard." }]
}

export default function SignInPage() {
  const loginMutation = useLogin()

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  })

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data)
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Sprout className="size-4" />
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
                          <a
                            href="#"
                            className="ml-auto text-sm underline-offset-4 hover:underline text-foreground"
                            tabIndex={-1}
                          >
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
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? <Spinner /> : "Sign In"}
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
