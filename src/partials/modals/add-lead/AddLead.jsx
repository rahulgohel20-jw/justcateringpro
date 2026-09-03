import { useEffect, useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import DatePicker from "@/components/form-inputs/DatePicker/DatePicker";
import AddProduct from "../add-product/AddProduct";
import AddContact from "@/partials/modals/add-contact/AddContact";
import AddSource from "@/partials/modals/add-source/AddSource";

const AddLead = ({ isModalOpen, setIsModalOpen, editData }) => {
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [issourceModalOpen, setIssourceModalOpen] = useState(false);
  const [dateOfAnniversary, setDateOfAnniversary] = useState(null);
  const [formData, setFormData] = useState();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const handInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMultiInputChange = (data) => {
    setFormData({ ...formData, ...data });
  };

  const saveData = () => {
    // Save data logic here

    setIsModalOpen(false);
  };
  const handleOpenContactModal = () => {
    setIsModalOpen(false);
    setIsContactModalOpen(true);
  };

  const handleOpenSourceModal = () => {
    setIssourceModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const [activeTab, setActiveTab] = useState("tab_1");

  const renderTabContent = (formData) => {
    switch (activeTab) {
      case "tab_1":
        return (
          <div id="tab_1" className="tab-content active">
            <div className="flex flex-col gap-y-2 gap-x-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                <div className="flex flex-col">
                  <label className="form-label">Pipeline</label>
                  <select
                    className="select pe-7.5"
                    data-control="select2"
                    data-placeholder="Contact"
                  >
                    <option value="">Sales Pipeline</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Stage</label>
                  <select
                    className="select pe-7.5"
                    data-control="select2"
                    data-placeholder="Contact"
                  >
                    <option value="">Select Stage</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Lead Title</label>
                  <div className="input">
                    <i className="ki-filled ki-autobrightness"></i>
                    <input
                      className="h-full"
                      type="text"
                      placeholder="Lead title"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Lead close date</label>
                  <DatePicker date={dateOfBirth} setDate={setDateOfBirth} />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="form-label">Description</label>
                <textarea
                  className="textarea h-full"
                  placeholder="Description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                <div className="flex flex-col">
                  <div className="flex flex-row items-center gap-3">
                    <label className="form-label w-fit">Contact</label>
                    <span
                      className="text-blue-500 underline cursor-pointer"
                      onClick={handleOpenContactModal}
                    >
                      Add Contact
                    </span>
                  </div>
                  <select
                    className="select pe-7.5"
                    data-control="select2"
                    data-placeholder="Contact"
                  >
                    <option value="">Select Contact</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Assigned To</label>
                  <select
                    className="select pe-7.5"
                    data-control="select2"
                    data-placeholder="Assigned"
                  >
                    <option value="">Select Assigned</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <div className="flex flex-row items-center gap-3">
                    <label className="form-label w-fit">Source</label>
                    <span
                      className="text-blue-500 underline cursor-pointer"
                      onClick={handleOpenSourceModal}
                    >
                      Add Source
                    </span>
                  </div>
                  <select
                    className="select pe-7.5"
                    data-control="select2"
                    data-placeholder="Source"
                  >
                    <option value="">Select Source</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Estimate Amount</label>
                  <div className="input">
                    <i className="ki-filled ki-tag"></i>
                    <input
                      className="h-full"
                      type="text"
                      placeholder="Estimate Amount"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "tab_2":
        return (
          <div id="tab_2" className="tab-content mb-2">
            <div className="text-end mb-2 mt-4">
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setIsProductModalOpen(true)}
                title="Add New Product"
              >
                <i className="text-sm ki-filled ki-plus"></i> Add New Product
              </button>
            </div>
            <div className="flex flex-col max-h-80 overflow-auto scrollable-y">
              {formData &&
                formData.product_data.map((product, index) => {
                  return (
                    <div className="flex flex-col gap-y-2 mb-2" key={index}>
                      <div className="flex items-end gap-3">
                        <div className="w-full flex flex-col">
                          <label className="form-label">Product</label>
                          <select
                            className="select pe-7.5"
                            data-control="select2"
                            data-placeholder="Product"
                            value={product.productId}
                            onChange={(e) => {
                              const newProductData = [...formData.product_data];
                              newProductData[index].productId = e.target.value;
                              handleMultiInputChange({
                                product_data: newProductData,
                              });
                            }}
                          >
                            <option value="">Select Product</option>
                          </select>
                        </div>
                        <div className="w-full flex flex-col">
                          <label className="form-label">Quantity</label>
                          <div className="input">
                            <i className="ki-filled ki-bookmark"></i>
                            <input
                              className="h-full"
                              type="tel"
                              placeholder="Quantity"
                              value={product.quantity}
                              onChange={(e) => {
                                const newProductData = [
                                  ...formData.product_data,
                                ];
                                newProductData[index].quantity = e.target.value;
                                handleMultiInputChange({
                                  product_data: newProductData,
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex mb-1">
                          {index === 0 ? (
                            <button
                              className="btn btn-success w-8 h-8 p-0 inline-flex items-center justify-center rounded-full"
                              onClick={() => {
                                const newProductData = [
                                  ...formData.product_data,
                                ];
                                newProductData.push({
                                  productId: "",
                                  quantity: "",
                                });
                                handleMultiInputChange({
                                  product_data: newProductData,
                                });
                              }}
                              title="Add"
                            >
                              <i className="ki-filled ki-plus"></i>
                            </button>
                          ) : (
                            <button
                              className="btn btn-danger w-8 h-8 p-0 inline-flex items-center justify-center rounded-full"
                              onClick={() => {
                                const newProductData = [
                                  ...formData.product_data,
                                ];
                                newProductData.splice(index, 1);
                                handleMultiInputChange({
                                  product_data: newProductData,
                                });
                              }}
                              title="Remove"
                            >
                              <i className="ki-filled ki-cross"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );

      case "tab_3":
        return (
          <div id="tab_3" className="tab-content">
            <div className="flex flex-col gap-y-2 gap-x-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                <div className="flex flex-col">
                  <label className="form-label">Text Field</label>
                  <div className="input">
                    <input
                      className="h-full"
                      type="text"
                      placeholder="Text Field"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Number</label>
                  <div className="input">
                    <input
                      className="h-full"
                      type="tel"
                      placeholder="Number"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Drop Down</label>
                  <select
                    className="select pe-7.5"
                    data-control="select2"
                    data-placeholder="Drop Down"
                  >
                    <option value="">Drop Down</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      setFormData({
        ...editData,
        product_data: [
          {
            productId: "",
            quantity: "",
          },
        ],
      });
    } else {
      setFormData(null);
    }
  }, [isModalOpen]);

  return (
    <>
      {isModalOpen && (
        <>
          <CustomModal
            open={isModalOpen}
            onClose={handleModalClose}
            title="Add Lead"
            width={640}
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
                <button
                  key="save"
                  className="btn btn-success"
                  title="Save"
                  onClick={saveData}
                >
                  Save
                </button>
              </div>,
            ]}
          >
            <div
              className="btn-tabs btn-tabs-lg flex justify-between mb-3 w-full"
              data-tabs="true"
            >
              <a
                className={`btn btn-clear w-full flex justify-center ${
                  activeTab === "tab_1" ? "active" : ""
                }`}
                onClick={() => setActiveTab("tab_1")}
              >
                <i className="ki-filled ki-autobrightness"></i>
                Lead Details
              </a>
              <a
                className={`btn btn-clear w-full flex justify-center ${
                  activeTab === "tab_2" ? "active" : ""
                }`}
                onClick={() => setActiveTab("tab_2")}
              >
                <i className="ki-filled ki-bookmark"></i>
                Product Details
              </a>
              <a
                className={`btn btn-clear w-full flex justify-center ${
                  activeTab === "tab_3" ? "active" : ""
                }`}
                onClick={() => setActiveTab("tab_3")}
              >
                <i className="ki-filled ki-bookmark"></i>
                Custom Fields
              </a>
            </div>
            {renderTabContent(formData)}
          </CustomModal>
          <AddProduct
            isModalOpen={isProductModalOpen}
            setIsModalOpen={setIsProductModalOpen}
          />
        </>
      )}
      <AddContact
        isModalOpen={isContactModalOpen}
        setIsModalOpen={(val) => {
          setIsContactModalOpen(val);
          if (!val) {
            setIsModalOpen(true);
          }
        }}
        // editData={editData}
      />
      <CustomModal
        open={issourceModalOpen}
        onClose={() => setIssourceModalOpen(false)}
        title="Add Source"
        width={500}
      >
        <AddSource
          isModalOpen={issourceModalOpen}
          setIsModalOpen={setIssourceModalOpen}
        />
      </CustomModal>
    </>
  );
};
export default AddLead;
