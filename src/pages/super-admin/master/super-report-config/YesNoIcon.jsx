import { CheckCircle, XCircle } from "lucide-react";

export const YesNoIcon = ({ value }) => {
  const isYes =
    value === 1 ||
    value === true ||
    value === "A6" ||
    value === "A4" ||
    value === "A5";

  return isYes ? (
    <CheckCircle size={18} className="text-green-600" />
  ) : (
    <XCircle size={18} className="text-red-500" />
  );
};
