import { CredentialSignIn, CredentialSignUp } from "@stackframe/stack";
import { stackServerApp } from "@/stack";
import LoginDemoBanner from "@/components/LoginDemoBanner";

export default function Handler(props: any) {
  // Extract the route from the URL to determine which component to show
  const route = props.params?.stack?.[0] || 'sign-in';

  // Common wrapper styling for full-page layout
  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gray-50">
      <LoginDemoBanner />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {route === 'sign-up' ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {route === 'sign-up' ? (
              <>
                Already have an account?{' '}
                <a href="/handler/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </a>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <a href="/handler/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </a>
              </>
            )}
          </p>
        </div>
          <div className="bg-white py-8 px-6 shadow rounded-lg text-gray-900">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  // Route to appropriate component
  switch (route) {
    case 'sign-up':
      return (
        <PageWrapper>
          <CredentialSignUp />
        </PageWrapper>
      );
    case 'sign-in':
    default:
      return (
        <PageWrapper>
          <CredentialSignIn />
        </PageWrapper>
      );
  }
}
