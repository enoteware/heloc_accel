import { redirect } from "next/navigation"
import { signIn } from "@/auth"
import { Card } from "../../components/design-system/Card"
import { Button } from "../../components/design-system/Button"
import { Input } from "../../components/design-system/Input"
import { Logo } from "@/components/Logo"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}) {
  const params = await searchParams
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo className="mx-auto" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Demo accounts: demo@helocaccel.com / DemoUser123!
          </p>
        </div>
        
        <Card className="mt-8 p-8">
          {params?.error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">
                Invalid email or password. Please try again.
              </p>
            </div>
          )}
          
          <form
            action={async (formData) => {
              "use server"
              try {
                await signIn("credentials", {
                  email: formData.get("email"),
                  password: formData.get("password"),
                  redirectTo: params?.callbackUrl ?? "/dashboard",
                })
              } catch (error) {
                // Redirect to login with error
                redirect("/login?error=CredentialsSignin")
              }
            }}
            className="space-y-6"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1"
                placeholder="demo@helocaccel.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1"
                placeholder="DemoUser123!"
              />
            </div>

            <div>
              <Button type="submit" variant="primary" className="w-full">
                Sign in
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}