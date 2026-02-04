import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { pageApi } from "@/lib/api";
import { SignUpFormValues } from "../../../../lib/validation";
import StepActions from "./StepActions";

const CATEGORIES = [
    "Gaming",
    "Art & Design",
    "Music",
    "Technology",
    "Education",
    "Entertainment",
    "Other",
];

type Step3Props = {
    onNext: () => void;
    onBack: () => void;
};

const Step3Category = ({ onNext, onBack }: Step3Props) => {
    const { watch, setValue, trigger, getValues, formState: { errors } } = useFormContext<SignUpFormValues>();
    const selectedCategory = watch("category");
    const [isLoading, setIsLoading] = useState(false);

    const handleNext = async () => {
        setIsLoading(true);
        const valid = await trigger("category");

        if (valid) {
            const { category } = getValues();
            try {
                await pageApi.updateMyPage({ category });
                onNext();
            } catch (error) {
                console.error("Failed to update category", error);
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="mb-5 text-h3">Choose a category</div>
            <div className="flex flex-wrap gap-3">
                {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory?.includes(cat);
                    return (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => {
                                const newCategories = isSelected
                                    ? selectedCategory.filter((c: string) => c !== cat)
                                    : [...(selectedCategory || []), cat];
                                setValue("category", newCategories, { shouldValidate: true });
                            }}
                            className={`btn-stroke btn-small h-10 px-8 
                            ${isSelected
                                    ? "bg-black text-white dark:bg-white dark:text-black"
                                    : ""
                                }`}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>
            {errors.category && (
                <div className="mt-2 text-xs text-pink-1">{errors.category.message}</div>
            )}
            <StepActions
                onNext={handleNext}
                onBack={onBack}
                isLoading={isLoading}
            />
        </div>
    );
};

export default Step3Category;