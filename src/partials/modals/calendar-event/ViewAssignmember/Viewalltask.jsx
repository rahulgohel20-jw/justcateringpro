import { useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import AddTask from "../../../../partials/modals/add-task/AddTask";
import { Translateapi } from "@/services/apiServices";

const RESOURCE_TYPE_LABELS = {
  LABOUR: "Labour",
  OUTSIDE: "Outside",
  CHEF: "Chef",
  INSIDE: "Inside",
};

const ViewAllTask = ({
  isModalOpen,
  setIsModalOpen,
  tasks = [],
  completedIds = new Set(),
  onToggleComplete,
  onDeleteTask,
  onTaskRemarksChange,
  resourceType,
  quickTaskName,
  setQuickTaskName,
  isQuickAddOpen,
  setIsQuickAddOpen,
  onQuickAdd,
}) => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const total    = tasks.length;
  const done     = tasks.filter((t) => completedIds.has(t.id)).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleModalClose = () => setIsModalOpen(false);

  const handleQuickAddTask = async () => {
    const name = quickTaskName.trim();
    if (!name) return;

    let nameGujarati = "";
    let nameHindi    = "";
    try {
      const res          = await Translateapi(name);
      const translations = res?.data || res;
      nameGujarati = translations?.gujarati || "";
      nameHindi    = translations?.hindi    || "";
    } catch (err) {
      console.error("Translation failed:", err);
    }

    const newTask = {
      id: -Date.now(),
      nameEnglish: name,
      nameGujarati,
      nameHindi,
      resourceType: resourceType || "",
      remarks: "",
    };
    onQuickAdd?.(newTask);
    setQuickTaskName("");
    setIsQuickAddOpen(false);
  };

  return (
    <>
      {isModalOpen && (
        <CustomModal
          open={isModalOpen}
          onClose={handleModalClose}
          title="All Tasks"
          width={560}
          footer={[
            <div className="flex justify-between items-center" key="footer-buttons">
              <span className="text-xs font-semibold text-gray-500">
                {done}/{total} completed · {progress}%
              </span>
              <div className="flex gap-2">
                <button
                  className="btn btn-light"
                  onClick={() => setIsQuickAddOpen((prev) => !prev)}
                  title="Add Task"
                >
                  + Add Task
                </button>
                <button className="btn btn-success" onClick={handleModalClose} title="Done">
                  Done
                </button>
              </div>
            </div>,
          ]}
        >
          <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">

            {/* Quick add input */}
            {isQuickAddOpen && (
              <div className="flex items-center gap-2 mb-1 p-4">
                <input
                  type="text"
                  value={quickTaskName}
                  onChange={(e) => setQuickTaskName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")  { e.preventDefault(); handleQuickAddTask(); }
                    if (e.key === "Escape") { setIsQuickAddOpen(false); setQuickTaskName(""); }
                  }}
                  placeholder="Type a task name and press Enter..."
                  autoFocus
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={handleQuickAddTask}
                  disabled={!quickTaskName.trim()}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  title="Add task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsQuickAddOpen(false); setQuickTaskName(""); }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 flex-shrink-0"
                  title="Cancel"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Task list */}
            {tasks.length === 0 ? (
              <div className="py-6 px-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 text-center">
                <p className="text-xs text-gray-400">No tasks yet for this resource type.</p>
              </div>
            ) : (
              tasks.map((task) => {
                const isComplete = completedIds.has(task.id);
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      isComplete ? "bg-green-50" : "bg-gray-50"
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => onToggleComplete?.(task.id)}
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        isComplete
                          ? "bg-green-500"
                          : "border-2 border-gray-300 hover:border-green-400"
                      }`}
                      title={isComplete ? "Mark as not done" : "Mark as done"}
                    >
                      {isComplete && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Task name — strikethrough when complete */}
                      <p className={`text-sm font-medium truncate transition-all ${
                        isComplete
                          ? "text-green-700 line-through decoration-green-400"
                          : "text-gray-800"
                      }`}>
                        {task.nameEnglish}
                      </p>

                      {/* Badges */}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-semibold uppercase tracking-wide ${
                          isComplete ? "text-green-600" : "text-blue-500"
                        }`}>
                          {RESOURCE_TYPE_LABELS[task.resourceType] || task.resourceType}
                        </span>
                        {!task.isCommonTask && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-500">
                            Custom
                          </span>
                        )}
                      </div>

                      {/* Remarks */}
                      <input
                        type="text"
                        value={task.remarks || ""}
                        onChange={(e) => onTaskRemarksChange?.(task.id, e.target.value, task.isCommonTask)}
                        placeholder="Add remark..."
                        className="mt-1 w-full text-xs text-gray-600 bg-white border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </div>

                    {/* Status badge */}
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 ${
                      isComplete
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-200 text-gray-400"
                    }`}>
                      {isComplete ? "✓ Done" : "Pending"}
                    </span>

                    {/* Delete — frontend only */}
                    <button
                      onClick={() => onDeleteTask?.(task._uid ?? task.id, task.isCommonTask)}
                      className="w-6 h-6 flex items-center justify-center rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 flex-shrink-0 transition-colors"
                      title="Remove task"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </CustomModal>
      )}
    </>
  );
};

export default ViewAllTask;