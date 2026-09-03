// components/modals/RegisterFace.jsx
import { useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";

const AddRegisterFace = ({ isModalOpen, setIsModalOpen }) => {
  const [images, setImages] = useState([]);

  const handleClose = () => setIsModalOpen(false);

  const handleImageChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length + images.length > 3) return; // Max 3 images
    setImages((prev) => [...prev, ...selected]);
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleClose}
        title="Register Face - Upload 3 Images of Employee"
        footer={[
          <div className="flex justify-between" key={"footer-buttons"}>
            <button className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button className="btn btn-success" onClick={handleClose}>
              Submit
            </button>
          </div>,
        ]}
      >
        <div className="flex flex-col gap-y-4">
          {/* Upload Label */}
          

          {/* Upload Input */}
          
          
            <select className="select pe-7.5" defaultValue="all">
                <option disabled selected>Select User</option>
              <option value="Manan Gandhi ">Manan Gandhi</option>
              <option value="Kaushik">Kaushik</option>
              <option value="Rahul">Rahul</option>
              <option value="aarya">Aarya</option>
              <option value="zainab">Zainab</option>
            </select>
            
            
          
          <div className="input w-100 flex items-center justify-between px-2 py-2 border border-gray-600 rounded-md">
          <label
              htmlFor="face-upload"
              className="cursor-pointer w-100  text-sm font-medium"
            >
            <i className="ki-filled ki-picture ms-2"></i>  Select Images 
            </label>
          <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden w-100"
              id="face-upload"
            />
            
          </div>

          {/* Image Preview */}
          {images.length > 0 && (
            <div className="flex gap-3 mt-3 flex-wrap">
              {images.map((img, index) => (
                <div key={index} className="relative w-24 h-24">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`face-${index}`}
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-red-500 underline"
                    onClick={() => handleRemoveImage(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CustomModal>
    )
  );
};

export default AddRegisterFace;
