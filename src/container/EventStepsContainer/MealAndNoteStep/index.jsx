import { DatePicker } from "antd";
import MealTypeDropdown from "@/components/dropdowns/MealTypeDropdown";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import AddMeal from "@/partials/modals/add-meal/AddMeal";
import useStyles from "./style";

const MealAndNoteStep = ({
  formData,
  setFormData,
  onInputChange,
  handleInputChange,
}) => {
  const classes = useStyles();

  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const handleAddClick = () => {
    setShowCustomerModal(true);
  };

  return (
    <div>
      <div className={`flex flex-col gap-y-2 gap-x-4 ${classes.MealAndNote}`}>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-y-2">
          <div className="grid grid-cols-9 gap-3 lg:gap-4 mt-5">
            <div className="col-span-3 col-start-4">
              <div className="card min-w-full py-5 px-6 flex flex-col gap-y-3">
                <div className="select__grp flex flex-col">
                  <label className="form-label">Prefrence</label>
                  <div className="sg__inner flex items-center gap-1 relative">
                    <MealTypeDropdown
                      name={"customer_id"}
                      onChange={handleInputChange}
                      // value={formData.meal_type}
                      createBtn={true}
                      className="w-full"
                      setCreateModalOpen={setShowCustomerModal}
                    />
                    <button
                      type="button"
                      onClick={handleAddClick}
                      title="Add"
                      className="sga__btn me-1 btn btn-primary flex items-center justify-center rounded-full p-0 w-8 h-8"
                    >
                      <i className="ki-filled ki-plus"></i>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="form-label">Meal Notes</label>
                  <Textarea
                    className="textarea h-full"
                    placeholder="Description"
                    rows={3}
                    // value={formData.meal_notes}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddMeal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
      />
    </div>
  );
};

export default MealAndNoteStep;
