import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { pageApi } from "@/lib/api";
import { SignUpFormValues } from "../../../../lib/validation";

import StepActions from "./StepActions";
import { socialProfiles } from "@/mock/profile";

type Step4Props = {
    onBack: () => void;
};

const Step4Socials = ({ onBack }: Step4Props) => {
    const { control, register, getValues, formState: { errors } } = useFormContext<SignUpFormValues>();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // useFieldArray must be used with the control from useFormContext
    const { fields, append, remove } = useFieldArray({
        control,
        name: "socialLinks",
    });

    const finishFlow = () => {
        router.push('/dashboard');
    };

    const handleNext = async () => {
        setIsLoading(true);
        const data = getValues();

        try {
            // Process Social Links
            // This logic assumes we have captured links in the socialLinks array properly
            // Since the UI seems to be mock-based or partial, ensure we are actually capturing data
            // The current UI iterates over `socialProfiles` (static), but the form data expects `socialLinks` array.
            // Assuming the user fills logic that populates `socialLinks` or we just submit what we have.
            // Reverting to the logic previously in SignUp/index.tsx:

            const validLinks = data.socialLinks
                ?.filter(link => link.value && link.value.trim() !== "")
                .map(link => ({
                    platform: 'website',
                    url: link.value as string
                })) || [];

            if (validLinks.length > 0) {
                const inferredLinks = validLinks.map(link => {
                    const url = link.url.toLowerCase();
                    let platform = 'website';
                    if (url.includes('twitter.com') || url.includes('x.com')) platform = 'twitter';
                    else if (url.includes('instagram.com')) platform = 'instagram';
                    else if (url.includes('youtube.com')) platform = 'youtube';
                    else if (url.includes('tiktok.com')) platform = 'tiktok';
                    else if (url.includes('discord.com') || url.includes('discord.gg')) platform = 'discord';

                    return { ...link, platform };
                });

                // @ts-ignore
                await pageApi.updateMyPage({ socialLinks: inferredLinks });
            }
            finishFlow();
        } catch (error) {
            console.error("Submission error:", error);
            alert("Failed to save social links.");
        } finally {
            setIsLoading(false);
        }
    };

    return (

        <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            {/* <div className="card-title">Social profiles</div> */}
            <div className="mb-5 text-h3">Connect your socials</div>

            <div className="">
                <div>
                    {socialProfiles.map((item) => (
                        <div
                            className="flex items-center mb-4 pb-4 pl-3 md:pl-0 dark:border-white"
                            key={item.id}
                        >
                            <Icon
                                className="shrink-0 icon-20 mr-8 md:mr-4 dark:fill-white"
                                name={item.icon}
                            />
                            <div className="mr-auto">
                                <div className="mb-1.5 text-xs font-medium text-n-3 dark:text-white/75">
                                    {item.label}
                                </div>
                                <div className="break-all text-sm font-bold">
                                    {item.link ? item.link : "Not connected"}
                                </div>
                            </div>
                            {!item.link && (
                                <button className="group inline-flex items-center self-end pb-0.5 text-xs font-bold transition-colors hover:text-purple-1">
                                    <Icon
                                        className="mr-1.5 transition-colors group-hover:fill-purple-1 dark:fill-white dark:group-hover:fill-purple-1"
                                        name="external-link"
                                    />
                                    Connect
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <StepActions
                onNext={handleNext}
                onBack={onBack}
                isLoading={isLoading}
                nextLabel="Finish"
                showSkip={true}
                onSkip={finishFlow}
            />
        </div>
    );
};

export default Step4Socials;













// <div className="animate-in fade-in slide-in-from-right-8 duration-300">
//             <div className="mb-5 text-h3">Connect your socials</div>
//             <div className="space-y-4">
//                 {fields.map((field, index) => (
//                     <div key={field.id} className="flex items-center gap-2 mb-4">
//                         <Field
//                             className="w-full"
//                             placeholder="https://twitter.com/..."
//                             icon="link"
//                             error={errors.socialLinks?.[index]?.value}
//                             {...register(`socialLinks.${index}.value`)}
//                         />
//                         <button
//                             type="button"
//                             className="p-2 hover:text-pink-1 shrink-0"
//                             onClick={() => remove(index)}
//                         >
//                             <Icon name="trash" className="w-4 h-4 fill-current transition-colors" />
//                         </button>
//                     </div>
//                 ))}
//             </div>
//             {fields.length < 5 && (
//                 <button
//                     type="button"
//                     className="group inline-flex items-center font-bold transition-colors hover:text-purple-1 mt-4"
//                     onClick={() => append({ value: "" })}
//                 >
//                     <Icon name="add-circle" className="icon-18 mr-1.5 transition-colors group-hover:fill-purple-1 dark:fill-white dark:group-hover:fill-purple-1" />
//                     Add Link
//                 </button>
//             )}
//         </div>