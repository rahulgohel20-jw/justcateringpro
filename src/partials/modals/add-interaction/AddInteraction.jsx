import {
  AddInteraction as AddInteractionAPI,
  EditInteraction as EditInteractionAPI,
} from "@/services/apiServices";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";

const AddInteraction = ({ isOpen, onClose, interaction, refreshData }) => {
  // ❗ REQUIRED FIX
  if (!isOpen) return null;

  const initialFormState = {
    interactionname: "",
    interactiontype: "Call",
    isActive: true,
  };

  const validationSchema = Yup.object().shape({
    interactionname: Yup.string().required("Interaction name is required"),
    interactiontype: Yup.string().required("Interaction type is required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        id: values.id,
        interactionname: values.interactionname,
        interactiontype: values.interactiontype,
        isActive: values.isActive,
      };

      if (interaction) {
        await EditInteractionAPI(interaction.interactionId, payload);
        Swal.fire("Updated!", "Interaction updated successfully.", "success");
      } else {
        await AddInteractionAPI(payload);
        Swal.fire("Saved!", "Interaction added successfully.", "success");
      }

      refreshData();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error saving:", error);
      Swal.fire("Error", "Something went wrong!", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const interactionTypes = ["Call", "Email", "Web"];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {interaction ? "Edit Interaction" : "New Interaction"}
          </h2>
          <button className="text-2xl" onClick={onClose}>
            &times;
          </button>
        </div>

        <Formik
          initialValues={
            interaction
              ? {
                  id: interaction.interactionId,
                  interactionname: interaction.interaction_name,
                  interactiontype: interaction.interactiontype,
                  isActive: interaction.isActive,
                }
              : initialFormState
          }
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputWithFormik
                  label="Interaction Name"
                  name="interactionname"
                />

                <SelectWithFormik
                  label="Interaction Type"
                  name="interactiontype"
                  options={interactionTypes}
                />
              </div>

              <div className="flex justify-end mt-6 gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="border px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-white px-5 py-2 rounded-lg"
                >
                  {interaction ? "Update" : "Save"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

const InputWithFormik = ({ label, name }) => (
  <div className="flex flex-col">
    <label className="mb-1">{label}</label>
    <Field className="border p-2 rounded-lg" name={name} />
    <ErrorMessage
      name={name}
      component="div"
      className="text-red-500 text-sm"
    />
  </div>
);

const SelectWithFormik = ({ label, name, options }) => (
  <div className="flex flex-col">
    <label className="mb-1">{label}</label>
    <Field as="select" name={name} className="border p-2 rounded-lg">
      {options.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </Field>
  </div>
);

export default AddInteraction;
