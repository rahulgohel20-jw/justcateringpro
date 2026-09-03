import { useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
const AddLeaveType = ({ isModalOpen, setIsModalOpen }) => {
  const [taskAccess, setTaskAccess] = useState(true);
  const [leaveAccess, setLeaveAccess] = useState(true);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const [activeTab, setActiveTab] = useState("tab_1");

  const [selectedType, setSelectedType] = useState('paid');
      const [includeHolidays, setIncludeHolidays] = useState(false);
      const [includeWeekOffs, setIncludeWeekOffs] = useState(false);
      const [selectedUnits, setSelectedUnits] = useState(['Full Day']);

      const handleSelectType = (type) => {
        setSelectedType(type);
      };

      const handleSelectUnit = (unit) => {
        setSelectedUnits((prev) =>
          prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]
        );
      };

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title="New Leave Type"
        footer={[
          <div className="flex justify-between" key={"footer-buttons"}>
            <button
              key="cancel"
              className="btn btn-light"
              onClick={handleModalClose}
              title="Cancel"
            >
              Cancel
            </button>
            <button key="save" className="btn btn-success w-100" title="Add">
              Add Leave
            </button>
          </div>,
        ]}
      >
        <div className="">
         
          <div className="space-y-4 max-h-[500px] overflow-auto scrollable-y">
            <div>
              <label className="block text-gray-700">Leave Type</label>
              <input type="text" className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-gray-700">Description</label>
              <textarea className="w-full p-2 border rounded"></textarea>
            </div>
            <div>
              <label className="block text-gray-700">Alloted Leaves</label>
              <input type="tel"  className="w-full p-2 border rounded"></input>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium">Type</h3>
              
              <div className="flex space-x-4 mt-2">
                <button
                  onClick={() => handleSelectType('paid')}
                  className={`px-4 py-2 rounded flex items-center ${selectedType === 'paid' ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                >
                  Paid
                  {selectedType === 'paid' && (
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => handleSelectType('unpaid')}
                  className={`px-4 py-2 rounded flex items-center ${selectedType === 'unpaid' ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                >
                  Unpaid
                  {selectedType === 'unpaid' && (
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-gray-700">Backdated Leave</label>
                  <input type="tel" defaultValue="30" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-gray-700">Advance Leave</label>
                  <input type="tel" defaultValue="90" className="w-full p-2 border rounded" />
                </div>
              </div>
              <div className="flex space-x-4 mt-4">
                <label className="flex items-center">
                  Include Holidays
                </label>
                  <button
                    onClick={() => setIncludeHolidays(!includeHolidays)}
                    className={`w-12 h-6 rounded-full ${includeHolidays ? 'bg-primary' : 'bg-gray-300'} flex items-center p-1`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transform ${includeHolidays ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                <label className="flex items-center">
                  Include Week Offs
                </label>
                  <button
                    onClick={() => setIncludeWeekOffs(!includeWeekOffs)}
                    className={`w-12 h-6 rounded-full ${includeWeekOffs ? 'bg-primary' : 'bg-gray-300'} flex items-center p-1`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transform ${includeWeekOffs ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
              </div>
              <div className="mt-4">
                <label className="block text-gray-700">Unit :</label>
                <div className="flex space-x-4 mt-2">
                  <button
                    onClick={() => handleSelectUnit('Full Day')}
                    className={`px-4 py-2 rounded flex items-center ${selectedUnits.includes('Full Day') ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                  >
                    Full Day
                    {selectedUnits.includes('Full Day') && (
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleSelectUnit('Half Day')}
                    className={`px-4 py-2 rounded flex items-center ${selectedUnits.includes('Half Day') ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                  >
                    Half Day
                    {selectedUnits.includes('Half Day') && (
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleSelectUnit('Short Leave')}
                    className={`px-4 py-2 rounded flex items-center ${selectedUnits.includes('Short Leave') ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                  >
                    Short Leave
                    {selectedUnits.includes('Short Leave') && (
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Deduction(in Days): Full Day - 1, Half Day - 0.5, Short Leave - 0.25</p>
              </div>
              <div className="mt-4">
                <label className="block text-gray-700">Carry Forward</label>
                <select className="w-full p-2 border rounded">
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-gray-700">Leave Carry Forward</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700">Count Forward in Percentage :</label>
                    <input type="tel" defaultValue="10" className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-gray-700">maximum Count Forward :</label>
                    <input type="tel" defaultValue="10" className="w-full p-2 border rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 
        <label className="text-black">LTask Access</label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={taskAccess}
            onChange={() => setTaskAccess(!taskAccess)}
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-rose-500 transition duration-300"></div>
          <div
            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
              taskAccess ? "translate-x-5" : ""
            }`}
          ></div>
        </label>

        <label className="text-black">Leave & Attendance Access</label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={leaveAccess}
            onChange={() => setLeaveAccess(!leaveAccess)}
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-rose-500 transition duration-300"></div>
          <div
            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
              leaveAccess ? "translate-x-5" : ""
            }`}
          ></div>
        </label> */}
      </CustomModal>
    )
  );
};
export default AddLeaveType;
