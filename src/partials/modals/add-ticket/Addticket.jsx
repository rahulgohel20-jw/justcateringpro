import { useEffect, useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import AddProduct from "../add-product/AddProduct";
import { FileUp } from "lucide-react"; // <-- Make sure you import this

const Addticket = ({ isModalOpen, setIsModalOpen, editData }) => {
  const [formData, setFormData] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tab_1");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const saveData = () => {
    // Save ticket data logic here
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "tab_1":
        return (
          <div className="tab-content active">
            <div className="flex flex-col gap-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start">
                <div className="flex flex-col">
                  <label className="form-label mb-1">Select Category</label>
                  <select
                    name="category"
                    value={formData?.category || ""}
                    onChange={handleInputChange}
                    required
                    className="select w-full"
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    <option>Report An Issue</option>
                    <option>Give Feedback</option>
                    <option>Issue on Billing</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="form-label mb-1">Sub-category</label>
                  <select
                    name="sub_category"
                    value={formData?.sub_category || ""}
                    onChange={handleInputChange}
                    required
                    className="select w-full"
                  >
                    <option value="" disabled>
                      Select Sub Category
                    </option>
                    <option>Leads</option>
                    <option>Contact</option>
                    <option>Follow Up</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="form-label mb-1">Subject</label>
                <input
                  className="textarea"
                  type="text"
                  placeholder="Subject"
                  name="subject"
                  value={formData?.subject || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex flex-col">
                <label className="form-label mb-1">Description</label>
                <textarea
                  className="textarea h-full"
                  placeholder="Description"
                  rows={3}
                  name="description"
                  value={formData?.description || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        );

      case "tab_2":
        return (
          <div className="tab-content mb-2">
            <div className="flex flex-col space-y-4">
              <label className="form-label">Upload Screenshot</label>
              <div className="border border-dashed border-gray-400 p-4 rounded-lg text-center bg-gray-50">
                <FileUp className="text-gray-500 mx-auto mb-2" size={28} />
                <p className="text-gray-600 text-sm mb-2">
                  Drag & drop your image or click below
                </p>
                <input
                  type="file"
                  accept="image/*"
                  id="image-upload"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="image-upload"
                  className="btn btn-light cursor-pointer"
                >
                  Browse Files
                </label>
                {formData?.image && (
                  <>
                    <div className="mt-2 text-sm text-green-600">
                      File selected: {formData.image.name}
                    </div>
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Preview"
                      className="mt-2 mx-auto max-h-40 rounded border"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      setFormData({
        ...editData,
        product_data: editData?.product_data || [
          { productId: "", quantity: "" },
        ],
      });
    } else {
      setFormData(null);
    }
  }, [isModalOpen, editData]);

  return (
    isModalOpen && (
      <>
        <CustomModal
          open={isModalOpen}
          onClose={handleModalClose}
          title="Add Ticket"
          width={640}
          footer={[
            <div className="flex justify-between" key={"footer-buttons"}>
              <button className="btn btn-light" onClick={handleModalClose}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={saveData}>
                Save
              </button>
            </div>,
          ]}
        >
          <div className="btn-tabs btn-tabs-lg flex justify-between mb-3 w-full">
            <a
              className={`btn btn-clear w-full flex justify-center ${
                activeTab === "tab_1" ? "active" : ""
              }`}
              onClick={() => setActiveTab("tab_1")}
            >
              <i className="ki-filled ki-autobrightness"></i>
              Ticket Details
            </a>
            <a
              className={`btn btn-clear w-full flex justify-center ${
                activeTab === "tab_2" ? "active" : ""
              }`}
              onClick={() => setActiveTab("tab_2")}
            >
              <i className="ki-filled ki-bookmark"></i>
              Attachments
            </a>
          </div>
          {renderTabContent()}
        </CustomModal>

        <AddProduct
          isModalOpen={isProductModalOpen}
          setIsModalOpen={setIsProductModalOpen}
        />
      </>
    )
  );
};

export default Addticket;
