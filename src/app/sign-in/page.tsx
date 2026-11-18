import { AuthCard } from "@/features/auth/auth-card";
import { SignInForm } from "@/features/auth/sign-in-form";

export default function SignInPage() {
  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Good to see you."
      description="Sign in to pick up where you left off."
    >
      <SignInForm />
    </AuthCard>
  );
}
