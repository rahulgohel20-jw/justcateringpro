import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formValidation = (requiredFields, formData) => {
  const errors = {};
  if (requiredFields && requiredFields.length > 0) {
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = "This field is required";
      }
    });
  }
  return errors;
};
