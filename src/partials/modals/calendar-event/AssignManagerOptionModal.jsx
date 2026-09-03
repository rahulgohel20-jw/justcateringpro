import { CustomModal } from "@/components/custom-modal/CustomModal";
import { FormattedMessage } from "react-intl";


const OPTIONS = [
  {
    key: "assignTask",
    labelId: "USER.DASHBOARD.EVENT_VIEW.ASSIGN_TASK",
    labelDefault: "Assign Task",
    icon: "ki-notepad-edit",
    bg: "bg-indigo-50 text-indigo-600",
  },
  {
    key: "chefLabour",
    labelId: "USER.DASHBOARD.EVENT_VIEW.CHEF_LABOUR",
    labelDefault: "Chef, Labour & Labour",
    icon: "ki-people",
    bg: "bg-green-50 text-green-600",
  },
  {
    key: "specialNotes",
    labelId: "USER.DASHBOARD.EVENT_VIEW.SPECIAL_NOTES",
    labelDefault: "Special Notes",
    icon: "ki-note",
    bg: "bg-amber-50 text-amber-600",
  },
];

const AssignManagerOptionsModal = ({
  isModalOpen,
  setIsModalOpen,
  eventId,
  eventFunctionId,
  managerId,
  managerName,
  functionName,
  navigate,
}) => {
  const handleSelect = (key) => {
    setIsModalOpen(false);

    switch (key) {
      case "assignTask":
        navigate(`/event-view/eventassignmanagertask/${eventId}`);
        break;
      case "chefLabour":
        navigate(`/event-view/eventassignmember/${eventId}`);
        break;
      case "specialNotes":
  navigate(`/event-view/special-notes-manager/${eventId}`, {
    state: { eventFunctionId, managerId, managerName, functionName, eventId },
  });
  break;
      default:
        break;
    }
  };

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <FormattedMessage
            id="USER.DASHBOARD.EVENT_VIEW.MANAGER_VIEW_ALL_TASK"
            defaultMessage="Manager View & Task"
          />
        }
        width={560}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleSelect(opt.key)}
              className="flex flex-col items-center justify-center gap-3 bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-primary/40 transition-all"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${opt.bg} flex items-center justify-center`}
              >
                <i className={`ki-filled ${opt.icon} text-2xl`} />
              </div>
              <span className="text-sm font-semibold text-gray-800 text-center">
                <FormattedMessage
                  id={opt.labelId}
                  defaultMessage={opt.labelDefault}
                />
              </span>
            </button>
          ))}
        </div>
      </CustomModal>
    )
  );
};

export default AssignManagerOptionsModal;