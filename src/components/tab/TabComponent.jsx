import { Segmented } from "antd";
import { useState, useEffect, useRef } from "react";

const TabComponent = ({ tabs, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.value || "");
  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const scrollRef = useRef(null);

  const onChange = (newActiveKey) => {
    setActiveTab(newActiveKey);
    setCurrentTab(tabs.find((tab) => tab.value === newActiveKey));
  };

  useEffect(() => {
    if (tabs?.length) {
      setActiveTab(tabs[0].value);
      setCurrentTab(tabs[0]);
    }
  }, [tabs]);

  // Drag-to-scroll logic
  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const mouseDownHandler = (e) => {
      isDown = true;
      slider.classList.add("cursor-grabbing");
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const mouseLeaveHandler = () => {
      isDown = false;
      slider.classList.remove("cursor-grabbing");
    };

    const mouseUpHandler = () => {
      isDown = false;
      slider.classList.remove("cursor-grabbing");
    };

    const mouseMoveHandler = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1; // speed factor
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener("mousedown", mouseDownHandler);
    slider.addEventListener("mouseleave", mouseLeaveHandler);
    slider.addEventListener("mouseup", mouseUpHandler);
    slider.addEventListener("mousemove", mouseMoveHandler);

    return () => {
      slider.removeEventListener("mousedown", mouseDownHandler);
      slider.removeEventListener("mouseleave", mouseLeaveHandler);
      slider.removeEventListener("mouseup", mouseUpHandler);
      slider.removeEventListener("mousemove", mouseMoveHandler);
    };
  }, []);

  return (
    <div className="custTabs w-full">
      <div className="custtNav mb-3">
        <div
          ref={scrollRef}
          className="segmentedTabs flex gap-2 overflow-x-auto no-scrollbar cursor-grab select-none"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <Segmented
            size="large"
            value={activeTab}
            onChange={onChange}
            options={tabs.map((tab) => ({
              label: (
                <span className="text-sm font-medium whitespace-nowrap flex items-center gap-2">
                  {tab.label}
                </span>
              ),
              value: tab.value,
            }))}
          />
        </div>
      </div>
      <div className="custtContent tab-conten">
        {currentTab?.children ?? (
          <div className="text-center text-gray-400 py-10">No content</div>
        )}
      </div>
    </div>
  );
};

export default TabComponent;
