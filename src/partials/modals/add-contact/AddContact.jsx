import { useEffect, useState } from "react";
import PhoneNumber from "@/components/form-inputs/PhoneNumber/PhoneNumber";
import { CustomModal } from "@/components/custom-modal/CustomModal";
// import DatePicker from "@/components/form-inputs/DatePicker/DatePicker";
import { DatePicker as AntDatePicker } from "antd"; 
import dayjs from "dayjs";
import { Linkedin } from "lucide-react";
import AddCompany from "@/partials/modals/add-company/AddCompany";

import TagPage from "../tag/TagPage";

const AddContact = ({ isModalOpen, setIsModalOpen, editData }) => {
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [dateOfAnniversary, setDateOfAnniversary] = useState(null);
  const [formData, setFormData] = useState();
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);

  const [tags, setTags] = useState([
    { label: "wdd", color: "green" },
    { label: "s", color: "red" },
    { label: "test", color: "blue" },
  ]);
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

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const [activeTab, setActiveTab] = useState("tab_1");

  const renderTabContent = () => {
    switch (activeTab) {
      case "tab_1":
        return (
          <div id="tab_1" className="tab-content active">
            <div className="flex flex-col gap-y-2">
              <div className="grid grid-cols-2 gap-x-4">
                <div className="flex flex-col">
  <label className="form-label flex items-center gap-2">
    Company Name
    {/* Link to open modal */}
    <button
  type="button"
  className="text-blue-500 underline hover:text-blue-700"
  onClick={() => setIsAddCompanyOpen(true)}
>
  + Add Company
</button>

  </label>

  <div className="input">
    <i className="ki-filled ki-user"></i>
    <input
      className="h-full"
      type="text"
      placeholder="company name"
    />
  </div>
</div>

                <div className="flex flex-col">
                  <label className="form-label">Email</label>
                  <div className="input">
                    <i className="ki-filled ki-sms"></i>
                    <input
                      className="h-full"
                      type="text"
                      placeholder="Enter email"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4">
                <div className="flex flex-col">
                  <label className="form-label">First Name</label>
                  <div className="input">
                    <i className="ki-filled ki-user"></i>
                    <input
                      className="h-full"
                      type="text"
                      placeholder="Enter first name"
                      value={formData?.first_name}
                      name="first_name"
                      onChange={handInputChange}
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Last Name</label>
                  <div className="input">
                    <i className="ki-filled ki-user"></i>
                    <input
                      className="h-full"
                      type="text"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
              </div>
              <PhoneNumber
                value={formData?.mobile}
                name="mobile"
                handleMultiInputChange={handleMultiInputChange}
              />
              <div className="grid grid-cols-2 gap-x-4">
                <div className="flex flex-col">
                  <label className="form-label">Date of Birth</label>
                <AntDatePicker
      className="input w-full"
      value={dateOfBirth ? dayjs(dateOfBirth) : null}
      onChange={(date) => setDateOfBirth(date ? date.toISOString() : null)}
      getPopupContainer={() => document.body} />
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Date of Anniversary</label>
                    <AntDatePicker
      className="input w-full"
      value={dateOfAnniversary ? dayjs(dateOfAnniversary) : null}
      onChange={(date) =>
        setDateOfAnniversary(date ? date.toISOString() : null)
      }
      getPopupContainer={() => document.body}
    />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="form-label">Tags</label>
                <button
                  className="btn btn-success text-sm w-28 px-2 py-1 text-center"
                  onClick={() => setIsTagModalOpen(true)}
                >
                  Manage Tags
                </button>

                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`flex items-center text-white text-xs rounded-full px-3 py-1 ${
                        tag.color === "green"
                          ? "bg-green-500"
                          : tag.color === "red"
                            ? "bg-red-500"
                            : "bg-blue-500"
                      }`}
                    >
                      {tag.label}
                      <i className="ki-filled ki-check ml-1"></i>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex flex-col">
                  <h3 className="fw-bold">Custom Field</h3>
                  <label className="form-label">test</label>
                  <div className="input">
                    <i className="ki-filled ki-user"></i>
                    <input
                      className="h-half "
                      type="text"
                      placeholder="Enter custom field"
                    />
                  </div>
                </div>
              </div>
              <CustomModal
                open={isTagModalOpen}
                onClose={() => setIsTagModalOpen(false)}
                title="Manage Tags"
                width={500}
              >
                <TagPage
                  onClose={() => setIsTagModalOpen(false)}
                  tags={tags}
                  setTags={setTags}
                />
              </CustomModal>
            </div>
          </div>
        );
      case "tab_2":
        return (
          <div id="tab_2" className="tab-content mb-2">
            <div className="flex flex-col gap-y-2">
              <div className="grid grid-cols-2 gap-x-4">
                <div className="flex flex-col">
                  <label className="form-label">State</label>
                  <div className="input">
                    <i className="ki-filled ki-bank"></i>
                    <input type="text" placeholder="State" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">City</label>
                  <div className="input">
                    <i className="ki-filled ki-pointers"></i>
                    <input type="text" placeholder="City" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4">
                <div className="flex flex-col">
                  <label className="form-label">Pincode</label>
                  <div className="input">
                    <i className="ki-filled ki-geolocation"></i>
                    <input type="text" placeholder="Pincode" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Address</label>
                  <div className="input">
                    <i className="ki-filled ki-geolocation"></i>
                    <input type="text" placeholder="Address" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "tab_3":
        return (
          <div id="tab_3" className="tab-content mb-2">
            <div className="flex flex-col gap-y-2">
              <div className="flex flex-col">
                <label className="form-label">Linkedin</label>
                <div className="input">
                  <Linkedin className="size-4" />
                  <input
                    type="text"
                    placeholder="Enter valid URL starting with https://"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="form-label">Twitter</label>
                <div className="input">
                  <i className="ki-filled ki-twitter"></i>
                  <input
                    type="text"
                    placeholder="Enter valid URL starting with https://"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="form-label">Youtube</label>
                <div className="input">
                  <i className="ki-filled ki-youtube"></i>
                  <input
                    type="text"
                    placeholder="Enter valid URL starting with https://"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="form-label">Facebook</label>
                <div className="input">
                  <i className="ki-filled ki-facebook"></i>
                  <input
                    type="text"
                    placeholder="Enter valid URL starting with https://"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="form-label">Instagram</label>
                <div className="input">
                  <i className="ki-filled ki-instagram"></i>
                  <input
                    type="text"
                    placeholder="Enter valid URL starting with https://"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case "tab_4":
        return (
          <div id="tab_2" className="tab-content mb-2">
            <div className="flex flex-col gap-y-2">
              <div className="grid grid-cols-2 gap-x-4">
                <div className="flex flex-col">
                  <label className="form-label">State</label>
                  <div className="input">
                    <i className="ki-filled ki-bank"></i>
                    <input type="text" placeholder="State" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">City</label>
                  <div className="input">
                    <i className="ki-filled ki-pointers"></i>
                    <input type="text" placeholder="City" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4">
                <div className="flex flex-col">
                  <label className="form-label">Pincode</label>
                  <div className="input">
                    <i className="ki-filled ki-geolocation"></i>
                    <input type="text" placeholder="Pincode" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Address</label>
                  <div className="input">
                    <i className="ki-filled ki-geolocation"></i>
                    <input type="text" placeholder="Address" />
                  </div>
                </div>
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
      setFormData(editData);
    } else {
      setFormData(null);
    }
  }, [isModalOpen]);

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title="Add Contact"
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
       <div className="btn-tabs btn-tabs-lg flex justify-between mb-3 w-full">
  <button
    type="button"
    className={`btn btn-clear w-full flex justify-center ${activeTab === "tab_1" ? "active" : ""}`}
    onClick={() => setActiveTab("tab_1")}
  >
    <i className="ki-filled ki-book-open"></i>
    Contact Details
  </button>

  <button
    type="button"
    className={`btn btn-clear w-full flex justify-center ${activeTab === "tab_2" ? "active" : ""}`}
    onClick={() => setActiveTab("tab_2")}
  >
    <i className="ki-filled ki-geolocation-home"></i>
    Address Details
  </button>

  <button
    type="button"
    className={`btn btn-clear w-full flex justify-center ${activeTab === "tab_3" ? "active" : ""}`}
    onClick={() => setActiveTab("tab_3")}
  >
    <i className="ki-filled ki-user-square"></i>
    Social Profile
  </button>
</div>

        <AddCompany
  isModalOpen={isAddCompanyOpen}
  setIsModalOpen={setIsAddCompanyOpen}
/>

        {renderTabContent(formData)}
      </CustomModal>
    )
  );
};

export default AddContact;
