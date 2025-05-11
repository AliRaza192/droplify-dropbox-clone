import * as z from "zod";

export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "Email is required!" })
      .email({ message: "Please enter valid password" }),

    password: z
      .string()
      .min(1, { message: "Password is required!" })
      .min(8, { message: "Password should be minumum of 8 characters" }),

    confirmPassword: z
      .string()
      .min(1, { message: "Please Confirm your password!" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
