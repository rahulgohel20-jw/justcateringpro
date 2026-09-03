import { useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
const AddBalance = ({ isModalOpen, setIsModalOpen }) => {
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const [activeTab, setActiveTab] = useState("tab_1");
  const renderTabContent = () => {
    switch (activeTab) {
      case "tab_1":
        return <div id="tab_1" className="tab-content active"></div>;
      default:
        return null;
    }
  };
  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        width={400}
        title={"Recharge Wallet"}
        footer={null}
      >
        <div className="flex flex-col">
          <div className="flex flex-col">
            <div className="flex flex-col items-center bg-primary rounded-t-lg border-t py-3">
              <h4 className="text-2xl font-semibold text-white">&#8377;100</h4>
              <span className="text-sm text-white">Current Balance</span>
            </div>
            <div className="flex flex-col bg-gray-200 border py-6 px-7 mb-5 rounded-b-lg">
              <div className="flex flex-col mb-2">
                <label className="form-label">Amount To Recharge</label>
                <label className="input input-lg">
                  <span className="text-lg text-success">&#8377;</span>
                  <input
                    className="text-lg"
                    placeholder="Enter amount"
                    type="tel"
                    value={5000}
                  />
                </label>
              </div>
              <div className="flex flex-col mb-3">
                <div className="flex flex-wrap justify-center gap-1">
                  <span
                    className="bg-white hover:bg-gray-200 border border-gray-300 h-6 rounded-full text-xs px-2.5 flex justify-between items-center cursor-pointer font-semibold"
                    title="Add 100"
                  >
                    +100
                  </span>
                  <span
                    className="bg-white hover:bg-gray-200 border border-gray-300 h-6 rounded-full text-xs px-2.5 flex justify-between items-center cursor-pointer font-semibold"
                    title="Add 500"
                  >
                    +500
                  </span>
                  <span
                    className="bg-white hover:bg-gray-200 border border-gray-300 h-6 rounded-full text-xs px-2.5 flex justify-between items-center cursor-pointer font-semibold"
                    title="Add 1000"
                  >
                    +1,000
                  </span>
                  <span
                    className="bg-white hover:bg-gray-200 border border-gray-300 h-6 rounded-full text-xs px-2.5 flex justify-between items-center cursor-pointer font-semibold"
                    title="Add 2000"
                  >
                    +2,000
                  </span>
                </div>
              </div>
              <div className="flex flex-col mb-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">GST (18%)</span>
                  <span className="text-base font-bold text-gray-900">
                    &#8377;12.55
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">TOTAL</span>
                  <span className="text-base font-bold text-gray-900">
                    &#8377;55,500
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2.5 justify-between items-center">
              <button className="btn btn-success w-full justify-center">
                Recharge to &#8377;55,500
              </button>
            </div>
          </div>
        </div>
        {renderTabContent()}
      </CustomModal>
    )
  );
};
export default AddBalance;
