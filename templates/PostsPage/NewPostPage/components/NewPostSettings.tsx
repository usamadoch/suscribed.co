import { Radio, RadioGroup } from "@headlessui/react";
import Switch from "@/components/Switch";
import { PostVisibility } from "@/types";
import Loader from "@/components/Loader";

type DetailsProps = {
    visibility: PostVisibility;
    setVisibility: (value: PostVisibility) => void;
    allowComments: boolean;
    setAllowComments: (value: boolean) => void;
    onPublish: () => void;
    isSubmitting: boolean;
};

const plans = [
    {
        id: "public",
        label: "Public",
        description: "Anyone can see this publication",
    },
    {
        id: "members",
        label: "Members only",
        description: "Only members can see this publication",
    },
];

const NewPostSettings = ({
    visibility,
    setVisibility,
    allowComments,
    setAllowComments,
    onPublish,
    isSubmitting,
}: DetailsProps) => {

    return (
        <div className="shrink-0 w-[20rem] ml-26.5 4xl:w-[14.7rem] 2xl:ml-16 lg:w-full lg:ml-0">

            <button
                className={`btn-purple w-full mb-12 btn-medium px-5 md:bg-transparent! md:border-none md:w-6 md:h-6 md:p-0 md:text-0 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={onPublish}
                disabled={isSubmitting}
            >
                {isSubmitting ? <Loader /> : <span>Publish</span>}
            </button>

            <div className="mb-5 text-h5">Settings</div>
            <div className="mb-3 text-xs">Who can see this?</div>
            <RadioGroup
                value={plans.find(p => p.id === visibility) || plans[0]}
                onChange={(plan) => setVisibility(plan.id as PostVisibility)}
                className="flex flex-col mb-5"
            >
                {plans.map((plan) => (
                    <Radio
                        key={plan.id}
                        value={plan}
                        className={({ checked }) =>
                            `group border border-n-1 p-4 dark:border-white relative flex items-start mb-4 last:mb-0 cursor-pointer select-none transition-colors ${checked ? "bg-purple-1" : "bg-transparent"
                            }`
                        }
                    >
                        {({ checked }) => (
                            <>
                                <div
                                    className={`flex justify-center items-center w-5 h-5 mt-0.5 mr-3 rounded-full border transition-colors ${checked
                                        ? "border-n-1"
                                        : "bg-transparent border-n-3 dark:border-white"
                                        }`}
                                >
                                    {checked && (
                                        <div className="w-2 h-2 rounded-full bg-n-1" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div
                                        className={`text-sm font-bold transition-colors ${checked
                                            ? "text-n-1"
                                            : "text-n-3 dark:text-white/50"
                                            }`}
                                    >
                                        {plan.label}
                                    </div>
                                    <div
                                        className={`text-xs transition-colors ${checked
                                            ? "text-n-1"
                                            : "text-n-3 dark:text-white/50"
                                            }`}
                                    >
                                        {plan.description}
                                    </div>
                                </div>
                            </>
                        )}
                    </Radio>
                ))}
            </RadioGroup>

            <div className="mt-5 pt-5 border-t border-dashed border-n-1 dark:border-white">
                <div className="flex justify-between items-center mb-5">
                    <div className="text-sm font-bold">Allow comments</div>
                    <Switch value={allowComments} setValue={setAllowComments} />
                </div>

            </div>
        </div>
    );
};

export default NewPostSettings;
