import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import Field from "@/components/Field";
import { pageApi } from "@/lib/api";
import { SignUpFormValues } from "../../../../lib/validation";
import StepActions from "./StepActions";
import { slugify } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";



type Step2Props = {
    onNext: () => void;
    onBack: () => void;
};

const Step2CreatorDetails = ({ onNext, onBack }: Step2Props) => {
    const { register, watch, setValue, trigger, getValues, formState: { errors } } = useFormContext<SignUpFormValues>();
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();

    const creatorName = watch("creatorName");

    // Auto-generate slug when creator name changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (creatorName) {
                const slug = slugify(creatorName);
                setValue("pageSlug", slug, { shouldValidate: true });
            }
        }, 500); // 500ms debounce delay

        return () => clearTimeout(timer);
    }, [creatorName, setValue]);

    const handleNext = async () => {
        setIsLoading(true);
        const valid = await trigger(["creatorName", "pageSlug"]);

        if (valid) {
            const { creatorName, pageSlug } = getValues();
            try {
                await pageApi.updateMyPage({
                    displayName: creatorName,
                    pageSlug
                });
                // Invalidate cache to reflect new slug elsewhere
                await queryClient.invalidateQueries({ queryKey: ['my-creation-page'] });
                onNext();
            } catch (error: any) {
                console.error("Failed to update page details", error);

                // If the error suggests page not found, it means the page wasn't created during signup.
                // We could try to create it here or just show an error.
                // For this quick fix, let's show an error.
                if (error.status === 404) {
                    alert("Your creator page could not be found. Please try refreshing or logging in again.");
                } else {
                    alert("Failed to save details. Please try again.");
                }
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="mb-5 text-h3">Creator Profile</div>
            <Field
                className="mb-4"
                label="Creator Name"
                placeholder="Creator Name"
                icon="profile"
                error={errors.creatorName}
                {...register("creatorName")}
                autoFocus
            />
            <Field
                className="mb-4"
                label="Profile URL"
                placeholder="my-page"
                prefix="example.com/"
                classInput="pl-[7.5rem]"
                icon="link"
                error={errors.pageSlug}
                {...register("pageSlug")}
            />
            <StepActions
                onNext={handleNext}
                onBack={onBack}
                isLoading={isLoading}
            />
        </div>
    );
};

export default Step2CreatorDetails;










