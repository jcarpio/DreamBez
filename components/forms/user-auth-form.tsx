"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { userAuthSchema } from "@/lib/validations/auth";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Icons } from "@/components/shared/icons";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: string;
}

type FormData = z.infer<typeof userAuthSchema>;

export function UserAuthForm({ className, type, ...props }: UserAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const [isLinkedInLoading, setIsLinkedInLoading] = React.useState<boolean>(false);
  const searchParams = useSearchParams();

  // Invitation code state
  const [inviteCode, setInviteCode] = React.useState<string>("");
  const [isCodeValid, setIsCodeValid] = React.useState<boolean>(false); // Track if code is valid

  // Valid invitation code (you can fetch this from the server or env variables)
  const VALID_CODE = process.env.NEXT_PUBLIC_VALID_CODE || "";

  // Function to handle code validation
  const handleCodeValidation = () => {
    if (inviteCode === VALID_CODE) {
      setIsCodeValid(true); // Code is valid, allow sign-in
    } else {
      toast.error("Invalid invitation code");
    }
  };

  async function onSubmit(data: FormData) {
    if (!isCodeValid) {
      return toast.error("Please enter a valid invitation code.");
    }

    setIsLoading(true);

    const signInResult = await signIn("resend", {
      email: data.email.toLowerCase(),
      redirect: false,
      callbackUrl: searchParams?.get("from") || "/dashboard",
    });

    setIsLoading(false);

    if (!signInResult?.ok) {
      return toast.error("Something went wrong.", {
        description: "Your sign-in request failed. Please try again.",
      });
    }

    return toast.success("Check your email", {
      description: "We sent you a login link. Be sure to check your spam too.",
    });
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {!isCodeValid ? (
        // Invitation Code Form
        <div className="flex flex-col items-center justify-center space-y-3">
          <Icons.logo className="size-10" />
          <h3 className="font-urban text-2xl font-bold">Enter Invitation Code</h3>
          <p className="text-sm text-gray-500">
            Please enter your invitation code to access the sign-in options.
          </p>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Enter your invitation code"
            className="p-2 border rounded-md"
          />
          <Button onClick={handleCodeValidation} variant="default">
            Submit Code
          </Button>
        </div>
      ) : (
        // Sign-in Form (after code validation)
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading || isGoogleLoading || isLinkedInLoading}
              {...register("email")}
            />
            {errors?.email && (
              <p className="px-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
          <button
            type="submit"
            className={cn(buttonVariants())}
            disabled={isLoading}
          >
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Sign In with Email
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline" }))}
            onClick={() => {
              setIsGoogleLoading(true);
              signIn("google");
            }}
            disabled={isLoading || isGoogleLoading || isLinkedInLoading}
          >
            {isGoogleLoading ? (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 size-4" />
            )}{" "}
            Continue with Google
          </button>
        </form>
      )}
    </div>
  );
}
