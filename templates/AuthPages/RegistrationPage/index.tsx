

"use client"
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SignUpSchema, SignUpFormValues } from "../../../lib/validation";
import Step1Account from "./steps/Step1Account";
import Step2CreatorDetails from "./steps/Step2CreatorDetails";
import Step3Category from "./steps/Step3Category";
import Step4Socials from "./steps/Step4Socials";
import { RedirectIfAuthenticated } from "@/stores/auth";

const STEPS = {
    ACCOUNT: 1,
    DETAILS: 2,
    CATEGORY: 3,
    SOCIALS: 4,
};

const RegistrationPage = () => {
    const [step, setStep] = useState<number>(STEPS.ACCOUNT);

    const methods = useForm<SignUpFormValues>({
        resolver: zodResolver(SignUpSchema),
        defaultValues: {
            email: "",
            displayName: "",
            password: "",
            creatorName: "",
            pageSlug: "",
            category: [],
            socialLinks: [{ value: "" }],
        },
        mode: "onChange"
    });

    const onNext = () => setStep((prev) => prev + 1);
    const onBack = () => setStep((prev) => prev - 1);

    return (
        <div className="w-full max-w-120 mx-auto">

            <FormProvider {...methods}>
                <form onSubmit={(e) => e.preventDefault()}>
                    {step === STEPS.ACCOUNT && <Step1Account onNext={onNext} />}
                    {step === STEPS.DETAILS && <Step2CreatorDetails onNext={onNext} onBack={onBack} />}
                    {step === STEPS.CATEGORY && <Step3Category onNext={onNext} onBack={onBack} />}
                    {step === STEPS.SOCIALS && <Step4Socials onBack={onBack} />}
                </form>
            </FormProvider>
        </div>
    );
};

export default RegistrationPage;
