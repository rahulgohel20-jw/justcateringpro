import { Steps, theme } from "antd";
import useStyles from "./style";
import { FormattedMessage } from "react-intl";
import { useLanguage } from "@/i18n";
import { useMemo, useState } from "react";

const StepsComponent = ({ steps, current, onNext, onPrev, onFinish, finishDisabled = false, nextDisabled = false }) => {  const classes = useStyles();
  const { direction } = useLanguage();

 const isPro = useMemo(() => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth-storage"));
    return ["jcxpro", "justbanq"].includes(auth?.state?.user?.softType); 
  } catch {
    return false;
  }
}, []);
  

  const contentStyle = {
    // padding: 24,
    // color: token.colorTextTertiary,
    // borderRadius: token.borderRadiusLG,
    // border: `1px dashed ${token.colorBorder}`,
    // marginTop: 16,
  };

  // ── Shared footer buttons (used by both layouts) ───────────────────────
  const footerButtons = (
    <div className="flex justify-end gap-3">
      {current > 0 && (
        <button
          className={isPro
            ? "px-6 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
            : "btn btn-light justify-center w-24 sm:w-28 text-sm sm:text-base"}
          onClick={onPrev}
        >
          {!isPro && <i className="ki-filled ki-arrow-left text-xs sm:text-sm mr-1" />}
          <FormattedMessage id="COMMON.PREVIOUS" defaultMessage="Previous" />
        </button>
      )}
      {current < steps.length - 1 && (
  <button
    type="button"
    disabled={nextDisabled}
    className={isPro
      ? `px-6 py-2 rounded-lg bg-primary text-white text-sm font-medium transition ${
          nextDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-primaryActive"
        }`
      : `btn btn-primary justify-center w-24 sm:w-28 text-sm sm:text-base ${
          nextDisabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
    onClick={onNext}
  >
    <FormattedMessage id="COMMON.NEXT" defaultMessage="Next" />
    {!isPro && !nextDisabled && <i className="ki-filled ki-arrow-right text-xs sm:text-sm ml-1" />}
  </button>
)}
     {current === steps.length - 1 && (
  <button
    type="button"
    disabled={finishDisabled}
    className={isPro
      ? `px-6 py-2 rounded-lg bg-green-600 text-white text-sm font-medium transition ${
          finishDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
        }`
      : `btn btn-success justify-center w-24 sm:w-28 text-sm sm:text-base ${
          finishDisabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
    onClick={onFinish}
  >
    {finishDisabled
      ? <FormattedMessage id="COMMON.SAVING" defaultMessage="Saving..." />
      : <FormattedMessage id="COMMON.FINISH" defaultMessage="Finish" />
    }
    {!isPro && !finishDisabled && <i className="ki-filled ki-save-2 text-xs sm:text-sm ml-1" />}
  </button>
)}
    </div>
  );

  // ── PRO layout ────────────────────────────────────────────────────────
  if (isPro) {

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const stepDescriptions = [
      "Keep your Event planning seamless from start to finish.",
      "Manage your venue details here.",
      "Keep every client's information organized and accessible.",
      "Organize function-specific information in one unified view.",
      "Keep guest and staff room allocations organized effortlessly.",
      "Keep your Event planning seamless from start to finish.",
    ];

   return (
      <div className="flex min-h-[600px] bg-white rounded-xl shadow-sm border border-gray-400 overflow-hidden">

        {/* ── Sidebar ── */}
        <div className={`flex-shrink-0 border-r border-gray-400 bg-white transition-all duration-300 ${
          sidebarOpen ? "w-[200px]" : "w-[52px]"
        }`}>
          
          {/* Toggle button */}
          <div className={`flex items-center py-4 px-3 border-b border-gray-100 ${
            sidebarOpen ? "justify-between" : "justify-center"
          }`}>
            {sidebarOpen && (
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Steps
              </span>
            )}
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <i className={`ki-filled text-sm transition-transform duration-300 ${
                sidebarOpen ? "ki-arrow-left" : "ki-arrow-right"
              }`} />
            </button>
          </div>

          {/* Step items */}
          <div className="py-4 px-2 flex flex-col gap-1">
            {steps.map((step, index) => {
              const isCompleted = index < current;
              const isActive = index === current;
              return (
                <div key={index}>
                  <div className={`flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all ${
                    isActive ? "bg-red-50" : ""
                  } ${!sidebarOpen ? "justify-center" : ""}`}>

                    {/* Icon circle — always visible */}
                    <div
                      title={!sidebarOpen ? String(step.title) : undefined}
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? "bg-primary text-white"
                          : isCompleted
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isCompleted
                        ? <i className="ki-filled ki-check text-sm" />
                        : step.icon
                          ? <span className={isActive ? "text-white" : "text-gray-400"}>{step.icon}</span>
                          : <span className="text-xs font-bold">{index + 1}</span>
                      }
                    </div>

                    {/* Label — only when open */}
                    {sidebarOpen && (
                      <span className={`text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis ${
                        isActive ? "text-primary font-semibold" : isCompleted ? "text-green-700" : "text-gray-400"
                      }`}>
                        {step.title}
                      </span>
                    )}
                  </div>

                  {/* Vertical connector */}
                  {index < steps.length - 1 && (
                    <div className={`w-px h-4 bg-gray-400 my-0.5 ${
                      sidebarOpen ? "ml-7" : "mx-auto"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Main content area — unchanged ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="px-4 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {steps[current]?.title}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {stepDescriptions[current] || ""}
              </p>
            </div>
            
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {steps[current].content}
          </div>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-100">
            {footerButtons}
          </div>
        </div>
      </div>
    );
  }

  // ── BASIC layout (your existing code, unchanged) ───────────────────────
  return (
    <div className={`${classes.customSteps} customStepsCommon`}>
      <div className="hidden lg:block">
        <Steps current={current} items={steps} type="navigation" />
      </div>

      <div className="lg:hidden mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            <FormattedMessage
              id="COMMON.STEP_INDICATOR"
              defaultMessage="Step {current} of {total}"
              values={{ current: current + 1, total: steps.length }}
            />
          </span>
          <span className="text-sm font-semibold text-primary">
            {steps[current]?.title}
          </span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((current + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="ant-content">
        <div className="ant-body">{steps[current].content}</div>
        <div className="ant-foot mt-4 px-3 sm:px-0">
          {footerButtons}
        </div>
      </div>
    </div>
  );
};

export default StepsComponent;