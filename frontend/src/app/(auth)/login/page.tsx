"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { loginSchema, type LoginFormValues } from "@/validators/task.schema";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { ar } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "demo@todo.app", password: "Password123!" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await authService.login(data);
      const { user, tokens } = res.data.data;
      setTokens(tokens.accessToken, tokens.refreshToken);
      setUser(user);
      toast.success(ar.auth.welcomeToast);
      router.push("/dashboard");
    } catch {
      toast.error(ar.auth.loginError);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl">{ar.auth.welcomeBack}</CardTitle>
        <CardDescription>{ar.auth.signInSubtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{ar.auth.email}</Label>
            <Input id="email" type="email" dir="ltr" className="text-end" {...form.register("email")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{ar.auth.password}</Label>
            <Input id="password" type="password" dir="ltr" {...form.register("password")} />
          </div>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? ar.auth.signingIn : ar.auth.signIn}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {ar.auth.noAccount}{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            {ar.auth.register}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
