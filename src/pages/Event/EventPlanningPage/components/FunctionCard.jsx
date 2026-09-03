const FunctionCard = ({ functionData, isSelected }) => {
  const extractDate = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    return dateTimeString.split(" ")[0];
  };

  const extractTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const parts = dateTimeString.split(" ");
    return parts.length >= 3 ? `${parts[1]} ${parts[2]}` : "N/A";
  };

  return (
    <div
      className={`shadow-sm rounded-xl p-2 min-w-[140px] ${
        isSelected ? "bg-primary text-white" : "bg-white text-gray-500"
      }`}
    >
      <div className="flex items-center gap-2 justify-center">
        <i
          className={`ki-filled ki-disk ${isSelected ? "text-white" : "text-primary"} text-xl`}
        ></i>
        <h3 className="font-semibold text-sm">{functionData?.function?.nameEnglish}</h3>
      </div>

      {/* ✅ Add Pax below function name */}
      {functionData?.pax > 0 && (
        <div className={`text-center text-md font-bold mt-0.5 ${isSelected ? "text-white/90" : "text-primary"}`}>
          Pax: {functionData.pax}
        </div>
      )}

      <div className={`text-center text-xs mt-1 ${isSelected ? "text-white/80" : "text-gray-500"}`}>
        <p>Time: {extractTime(functionData?.functionStartDateTime)}</p>
        <p>Date: {extractDate(functionData?.functionStartDateTime)}</p>
      </div>
    </div>
  );
};

export default FunctionCard;