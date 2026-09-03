import { useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { Textarea } from "../../../components/ui/textarea";

const AddProduct = ({ isModalOpen, setIsModalOpen }) => {
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const [activeTab, setActiveTab] = useState("tab_1");
  // const [productImage, setProductImage] = useState(null);
  // const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "tab_1":
        return (
          <div id="tab_1" className="tab-content active">
            <div className="flex flex-col gap-y-2">
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div className="flex flex-col">
                  <label className="form-label ">
                    Product Name
                  </label>
                  <div className="input">
                    <i className="ki-filled ki-bookmark"></i>
                    <input
                      className="h-full"
                      type="text"
                      placeholder="Product Name"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">HSN Code</label>
                  <div className="input">
                    <i className="ki-filled ki-bill"></i>
                    <input
                      className="h-full"
                      type="text"
                      placeholder="HSN Code"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Category</label>
                  <div className="input">
                    <i className="ki-filled ki-lots-shopping"></i>
                    <input
                      className="h-full"
                      type="text"
                      placeholder="Category"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Units</label>
                  <div className="input">
                    <i className="ki-filled ki-dropbox"></i>
                    <input
                      className="h-full"
                      type="text"
                      placeholder="Enter Units"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Price</label>
                  <div className="input">
                    <i className="ki-filled ki-price-tag"></i>
                    <input className="h-full" type="text" placeholder="Price" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Max-Discount</label>
                  <div className="input">
                    <i className="ki-filled ki-discount"></i>
                    <input
                      className="h-full"
                      type="text"
                      placeholder="Max-Discount"
                    />
                  </div>
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
              
            </div>
          </div>
        );

      // case "tab_2":
      //   return (
      //     <div id="tab_2" className="tab-content">
      //       <div className="grid grid-cols-2 gap-y-2 gap-x-4">
      //         <div className="flex flex-col">
      //           <label className="form-label">Country</label>
      //           <div className="input">
      //             <i className="ki-filled ki-airplane"></i>
      //             <input className="h-full" type="text" placeholder="Country" />
      //           </div>
      //         </div>
      //         <div className="flex flex-col">
      //           <label className="form-label">State</label>
      //           <div className="input">
      //             <i className="ki-filled ki-bank"></i>
      //             <input className="h-full" type="text" placeholder="State" />
      //           </div>
      //         </div>
      //         <div className="flex flex-col">
      //           <label className="form-label">City</label>
      //           <div className="input">
      //             <i className="ki-filled ki-pointers"></i>
      //             <input className="h-full" type="text" placeholder="City" />
      //           </div>
      //         </div>
      //         <div className="flex flex-col">
      //           <label className="form-label">Pincode</label>
      //           <div className="input">
      //             <i className="ki-filled ki-geolocation"></i>
      //             <input className="h-full" type="text" placeholder="Pincode" />
      //           </div>
      //         </div>
      //         <div className="flex flex-col">
      //           <label className="form-label">Billing Address</label>
      //           <div className="input">
      //             <i className="ki-filled ki-geolocation"></i>
      //             <input
      //               className="h-full"
      //               type="text"
      //               placeholder="Billing Address"
      //             />
      //           </div>
      //         </div>
      //         <div className="flex flex-col">
      //           <label className="form-label">Shipping Address</label>
      //           <div className="input">
      //             <i className="ki-filled ki-geolocation"></i>
      //             <input
      //               className="h-full"
      //               type="text"
      //               placeholder="Shipping Address"
      //             />
      //           </div>
      //         </div>
      //       </div>
      //     </div>
      //   );

      default:
        return null;
    }
  };

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title="Add Product"
        width={650}
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
            <button key="save" className="btn btn-success" title="Save">
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
            className={`btn w-full flex justify-center items-center gap-2 border-b-2 pb-2 transition-colors ${
              activeTab === "tab_1"
                ? "text-blue-600 border-blue-600 font-semibold"
                : "text-gray-500 border-transparent hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("tab_1")}
          >
            <i className="ki-filled ki-bookmark"></i>
            Product Details
          </a>
          
        </div>

        {renderTabContent()}
      </CustomModal>
    )
  );
};

export default AddProduct;
