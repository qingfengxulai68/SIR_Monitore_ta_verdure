import type { Route } from "./+types/signin"
import { redirect } from "react-router"

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const isLoggedIn = true // Replace with real authentication check
  if (isLoggedIn) {
    return redirect("/app/")
  }

  return null
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Sign In - Terrarium" }, { name: "description", content: "Log in to access your dashboard." }]
}

export default function SignInPage() {
  return (
    <div className="p-4 border-2 border-green-500 m-4">
      <h1 className="text-xl font-bold">Sign In Page</h1>
      <p>Public Entry Point (Index)</p>
    </div>
  )
}
