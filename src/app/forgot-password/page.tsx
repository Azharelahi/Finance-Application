import { AuthCard } from "@/features/auth/auth-card";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Let’s get you back in."
      description="Enter the email address linked to your account."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
