import { AuthCard } from "@/features/auth/auth-card";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;
  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Choose a new password."
      description="Use at least 12 characters to keep your account protected."
    >
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
