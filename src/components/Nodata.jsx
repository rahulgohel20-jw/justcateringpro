import React, { useMemo } from "react";
import { toAbsoluteUrl } from "@/utils";

const NoData = ({ text = "No data found" }) => {
  const isPro = useMemo(() => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth-storage"));
      return auth?.state?.user?.softType === "jcxpro";  
    } catch {
      return false;
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-gray-500">
      <img
        src={toAbsoluteUrl(
          isPro
            ? "/media/placeholders/pro-placeholder.png"
            : "/media/placeholders/placeholder.png"
        )}
        className="max-h-[330px] mb-4 dark:hidden"
        alt="No data"
      />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
};

export default NoData;