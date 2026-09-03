const HeaderSection = ({ details }) => {
  return (
    <div className="flex justify-between items-center border-b pb-3 mb-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Party: {details?.partyName || "-"}
        </h2>
        <p className="text-sm text-gray-600">
          To: {details?.toPerson || "-"}
        </p>
      </div>
      <div className="text-right text-sm text-gray-500">
        <p>Event No: {details?.eventNo || "-"}</p>
        <p>Date: {details?.date || "-"}</p>
      </div>
    </div>
  );
};

export default HeaderSection;
