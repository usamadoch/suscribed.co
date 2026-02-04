import { forwardRef } from "react";
import Icon from "@/components/Icon";

type CheckboxProps = {
    className?: string;
    label?: string;
    value?: boolean;
    onChange?: any;
    checked?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'checked'>;

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, value, onChange, checked, ...props }, ref) => {
        const isChecked = value || checked;

        return (
            <label
                className={`group relative inline-flex items-start select-none cursor-pointer tap-highlight-color ${className}`}
            >
                <input
                    className="absolute top-0 left-0 opacity-0 invisible"
                    type="checkbox"
                    value={undefined} // Checkbox value attribute is usually a string, but here we control checked state.
                    checked={isChecked}
                    onChange={onChange}
                    ref={ref}
                    {...props}
                />
                <span
                    className={`relative flex justify-center items-center shrink-0 w-5 h-5 border transition-colors dark:border-white group-hover:border-green-1 ${isChecked
                        ? "bg-green-1 border-green-1 dark:border-green-1!"
                        : "bg-transparent border-n-1 dark:border-white"
                        }`}
                >
                    <Icon
                        className={`fill-white transition-opacity ${isChecked ? "opacity-100" : "opacity-0"
                            }`}
                        name="check"
                    />
                </span>
                {label && (
                    <span className="ml-2.5 pt-0.75 text-xs font-bold text-n-1 dark:text-white">
                        {label}
                    </span>
                )}
            </label>
        );
    }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
