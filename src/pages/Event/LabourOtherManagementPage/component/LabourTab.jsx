import LabourDetailSidebar from "../LabourSidebar/LabourDetailSidebar";

const LabourTab = ({ eventId }) => {
  return (
    <div className="flex gap-4">
      <LabourDetailSidebar eventId={eventId} />
      <div className="flex-1 bg-white rounded-lg shadow p-4">
        {/* Your labour table + filters go here */}
        Labour Table Section
      </div>
    </div>
  );
};

export default LabourTab;
