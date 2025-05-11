"use client";

import { useForm } from "react-hook-form";
import { useSignIn } from "@clerk/nextjs";
import { z } from "zod";
import { signInSchema } from "@/schemas/signInSchema";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";

import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import Link from "next/link";

export default function SignInForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, isLoaded, setActive } = useSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      indentifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    if (!isLoaded) return;
    setSubmitting(true);
    setAuthError(null);

    try {
      const result = await signIn.create({
        identifier: data.indentifier,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setAuthError("Sign in failed. Please try again.");
      }
    } catch (error: any) {
      console.error("SignIn Error", error);
      setAuthError(
        error.errors?.[0]?.message ||
          "An error occurred during the sign-in process!"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
      <CardHeader className="flex flex-col gap-1 items-center pb-2">
        <h1 className="text-2xl font-bold text-default-900">Welcome Back</h1>
        <p className="text-default-500 text-center">
          Enter your credentials to sign in
        </p>
      </CardHeader>

      <Divider />

      <CardBody className="pb-6">
        {authError && (
          <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="indentifier"
              className="text-sm font-medium text-default-900"
            >
              Email or Username
            </label>
            <Input
              id="indentifier"
              type="text"
              placeholder="your.email@example.com"
              startContent={<Mail className="h-4 w-4 text-default-500" />}
              isInvalid={!!errors.indentifier}
              errorMessage={errors.indentifier?.message}
              {...register("indentifier")}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-default-900"
            >
              Password
            </label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              startContent={<Lock className="w-4 h-4 text-default-500" />}
              endContent={
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-default-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-default-500" />
                  )}
                </Button>
              }
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              {...register("password")}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={submitting}
          >
            {submitting ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </CardBody>

      <Divider />

      <CardFooter className="flex justify-center py-4">
        <p className="text-sm text-default-600">
          Don’t have an account?{" "}
          <Link
            href={"/sign-up"}
            className="text-primary hover:underline font-medium"
          >
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
