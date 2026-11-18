import { AuthCard } from "@/features/auth/auth-card";
import { SignUpForm } from "@/features/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthCard
      eyebrow="A fresh start"
      title="Make room for clarity."
      description="Create your private account to start organizing your finances."
    >
      <SignUpForm />
    </AuthCard>
  );
}
