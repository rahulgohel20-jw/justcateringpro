import { Fragment, useState, useEffect, useRef } from "react";
import { Tabs, Form } from "antd";
import { Container } from "@/components/container";
import { FormattedMessage } from "react-intl";
import MenuDetailsForm from "./components/MenuDetailsForm";
import AllocationConfig from "./components/AllocationConfig";
import { useLocation } from "react-router-dom";
import { Tooltip } from "antd";

const MenuItemMaster = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("details");
  const [form] = Form.useForm();
  const [allocationForm] = Form.useForm();
  const [menuDetails, setMenuDetails] = useState({});
  const [allocationConfig, setAllocationConfig] = useState({});
  const editData = location.state?.editData || null;
  const isEdit = !!editData;
  const tabsContainerRef = useRef(null);
  const scrollRef = useRef(null); // scrollable content area

  useEffect(() => {
    if (isEdit && editData?.menuItemAllocationConfigs) {
    }
  }, [isEdit, editData]);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTabChange = (key) => {
    if (key === "allocation") {
      // Stay on the details tab and scroll down to the "Next" button
      // (allocationRef was never defined before, which caused an error)
      const el = scrollRef.current;
      el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      return;
    }

    // Normal behavior for other tabs
    setActiveTab(key);
    scrollToTop();
  };

  const handleNextToAllocation = () => {
    setActiveTab("allocation");
    scrollToTop();
  };

  const handleBackToDetails = () => {
    setActiveTab("details");
    scrollToTop();
  };

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            {isEdit ? (
              <FormattedMessage
                id="MENU.EDIT_ITEM"
                defaultMessage="Edit Menu Item"
              />
            ) : (
              <FormattedMessage
                id="MENU.CREATE_ITEM"
                defaultMessage="Create Menu Item & Recipe"
              />
            )}
          </h1>
        </div>

        {/* Scrollable area with a visible, styled scrollbar */}
        <div
          ref={scrollRef}
          className="overflow-y-auto overflow-x-hidden pr-2
          no-scrollbar"
          style={{
            maxHeight: "calc(100vh - 160px)",
            scrollbarWidth: "thin", // Firefox
           // Firefox thumb / track
          }}
        >
          <Tabs
            ref={tabsContainerRef}
            activeKey={activeTab}
            onChange={handleTabChange}
            className="[&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-tab-btn]:text-sm custom-tabs"
            items={[
              {
                key: "details",
                label: "Menu Item Details",
                children: (
                  <MenuDetailsForm
                    form={form}
                    onNext={handleNextToAllocation}
                    setMenuDetails={setMenuDetails}
                    editData={editData}
                    isEdit={isEdit}
                  />
                ),
              },

              {
                key: "allocation",
                label: (
                  <div className="flex items-center gap-2">
                    <span>Allocation Configuration</span>

                    <Tooltip
                      placement="bottom"
                      color="#1f2937"
                      overlayInnerStyle={{
                        fontSize: "12px",
                        lineHeight: "1.4",
                      }}
                      title={
                        <div>
                          <div className="font-medium mb-1">
                            Allocation Setup
                          </div>
                          <div className="text-xs text-gray-300">
                            scroll down to Next to access Allocation
                            Configuration
                          </div>
                        </div>
                      }
                    >
                      <i className="ki-filled ki-information text-[#6A7C94] cursor-pointer" />
                    </Tooltip>
                  </div>
                ),
                children: (
                  <AllocationConfig
                    form={allocationForm}
                    onPrev={handleBackToDetails}
                    menuDetails={menuDetails}
                    allocationConfig={allocationConfig}
                    setAllocationConfig={setAllocationConfig}
                    editData={editData}
                    isEdit={isEdit}
                  />
                ),
              },
            ]}
          />
        </div>
      </Container>
    </Fragment>
  );
};

export default MenuItemMaster;