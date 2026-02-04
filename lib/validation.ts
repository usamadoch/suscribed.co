




import { z } from "zod";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

export const Step1Schema = z.object({
    email: z.string().min(1, { message: "Email is required" }).regex(EMAIL_REGEX, { message: "Invalid email address" }),
    displayName: z.string().min(1, "Name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const Step2Schema = z.object({
    creatorName: z.string().min(3, "Creator name is required"),
    pageSlug: z
        .string()
        .min(3, "Slug must be at least 3 characters")
        .regex(/^[a-z0-9-_]+$/, "Only lowercase letters, numbers, hyphens, and underscores")
        .or(z.literal("")),
});

export const Step3Schema = z.object({
    category: z.array(z.string()).min(1, "Please select at least one category"),
});

// Step 4 (Socials) is optional/array
export const Step4Schema = z.object({
    socialLinks: z.array(z.object({
        value: z.string()
            .regex(URL_REGEX, { message: "Invalid URL" })
            .optional()
            .or(z.literal(""))
    })),
});

export const SignUpSchema = z.object({
    ...Step1Schema.shape,
    ...Step2Schema.shape,
    ...Step3Schema.shape,
    ...Step4Schema.shape, // Use expanded shape or just include the key if it was simple
});

export type SignUpFormValues = z.infer<typeof SignUpSchema>;




export const LoginSchema = z.object({
    email: z.string().min(1, { message: "Email is required" }).regex(EMAIL_REGEX, { message: "Invalid email address" }),
    password: z.string().min(1, "Password is required"),
    remember: z.boolean().optional(),
});

export const ForgotPasswordSchema = z.object({
    email: z.string().min(1, { message: "Email is required" }).regex(EMAIL_REGEX, { message: "Invalid email address" }),
});
