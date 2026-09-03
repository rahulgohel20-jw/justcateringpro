import { useEffect, useState, useMemo, useCallback } from "react";
import InputToTextLang from "@/components/form-inputs/InputToTextLang";
import {
  AddUnitdata,
  EditUnit,
  Translateapi,
  GetUnitData,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";
// Add this import at the top
import MultiLangInputBox from "@/components/form-inputs/MultiLangInputBox";
// Move RangeTable OUTSIDE the component
const RangeTable = ({ ranges, onRangeChange, onRangeRemove }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm text-black">
        <thead className="bg-[#F7FAFF]">
          <tr>
            {[
              "#",
              "Minimum Value*",
              "Maximum Value*",
              "Round Off Value*",
              "Action",
            ].map((header) => (
              <th
                key={header}
                className={`py-2 px-3 ${header === "Action" ? "text-center" : "text-left"}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ranges.map((range, index) => {
            const prevMax =
              index > 0 ? parseFloat(ranges[index - 1].maxValue) : null;

            const currMin = parseFloat(range.minValue);

            const validationError =
              prevMax !== null && !isNaN(currMin) && currMin < prevMax;
            return (
              <tr key={index} className="border-t align-top">
                <td className="py-2 px-3">{index + 1}</td>
                <td className="py-2 px-3">
                  <input
                    type="tel"
                    className="w-full border rounded-md px-2 py-1 h-10 text-gray-600"
                    value={range.minValue}
                    onChange={(e) =>
                      onRangeChange(index, "minValue", e.target.value)
                    }
                  />
                  {validationError && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationError}
                    </p>
                  )}
                </td>
                <td className="py-2 px-3">
                  <input
                    type="tel"
                    step="any"
                    className="w-full border text-gray-600 rounded-md px-2 py-1 h-10"
                    value={range.maxValue}
                    onChange={(e) =>
                      onRangeChange(index, "maxValue", e.target.value)
                    }
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="tel"
                    step="any"
                    className="w-full border text-gray-600 rounded-md px-2 py-1 h-10 bg-gray-50"
                    value={range.roundOffValue}
                    onChange={(e) =>
                      onRangeChange(index, "roundOffValue", e.target.value)
                    }
                    readOnly
                  />
                </td>
                <td className="text-center align-middle">
                  <button
                    type="button"
                    onClick={() => onRangeRemove(index)}
                    className="text-red-500 hover:text-red-700 text-lg"
                  >
                    <i className="ki-filled ki-trash text-danger"></i>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const AddUnit = ({
  isModalOpen,
  setIsModalOpen,
  selectedUnit,
  refreshData,
}) => {
  if (!isModalOpen) return null;
  const langConfig = getLangConfig();

  const [debounceTimer, setDebounceTimer] = useState(null);
  const [unitOptions, setUnitOptions] = useState([]);
  let userId = localStorage.getItem("userId");
  if (!userId) return null;

  useEffect(() => {
    fetchUnits();
  }, []);

  const validationSchema = Yup.object({
    nameEnglish: Yup.string().required("Name is required"),
    symbolEnglish: Yup.string().required("Symbol is required"),
    decimalLimit: Yup.string().required(
      "Decimal Limit For Quantity is required",
    ),
  });


const handleTranslate = (text, fields) => {
  if (!text?.trim()) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  const timer = setTimeout(() => {
    Translateapi(text)
      .then((res) => {
        const { regional, hindi } = extractTranslations(res.data);
        formik.setFieldValue(fields.gujarati, regional);
        formik.setFieldValue(fields.hindi, hindi);
      })
      .catch((err) => console.error("Translation error:", err));
  }, 500);
  setDebounceTimer(timer);
};

  const initialValues = useMemo(
    () => ({
      nameEnglish: "",
      nameGujarati: "",
      nameHindi: "",
      symbolEnglish: "",
      symbolGujarati: "",
      symbolHindi: "",
      isParentUnit: false,
      decimalLimit: "",
      parentUnit: "",
      equivalent: "",
      rangeType: "RANGE",
      ranges: [{ minValue: "", maxValue: "", roundOffValue: "" }],
      stepValue: "",
    }),
    [],
  );

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      if (!userId) return Swal.fire("Error", "User data not found", "error");

      const payload = {
        nameEnglish: values.nameEnglish,
        nameGujarati: values.nameGujarati,
        nameHindi: values.nameHindi,
        symbolEnglish: values.symbolEnglish,
        symbolGujarati: values.symbolGujarati,
        symbolHindi: values.symbolHindi,
        isParentUnit: values.isParentUnit,
        decimalLimit: parseInt(values.decimalLimit),
        parent_unit_id: values.isParentUnit
          ? 0
          : parseInt(values.parentUnit) || 0,
        equivalentValue: values.isParentUnit
          ? 0
          : parseFloat(values.equivalent) || 0,
        rangeType: values.rangeType,
        ranges:
          values.rangeType === "STEPWISE"
            ? []
            : values.ranges.map((range) => ({
                minValue: parseFloat(range.minValue) || 0,
                maxValue: parseFloat(range.maxValue) || 0,
                roundOffValue: parseFloat(range.roundOffValue) || 0,
              })),
        stepValue:
          values.rangeType === "STEPWISE"
            ? parseFloat(values.stepValue) || 0
            : 0,
        userId: userId,
      };

      try {
        const res = selectedUnit
          ? await EditUnit(selectedUnit.unitId, payload)
          : await AddUnitdata(payload);

        if (res?.data.success === false)
          return Swal.fire(
            "Error",
            res.data.msg || "Something went wrong",
            "error",
          );

        Swal.fire(
          "Success",
          selectedUnit
            ? "Unit updated successfully"
            : "Unit added successfully",
          "success",
        );
        refreshData();
        setIsModalOpen(false);
      } catch (error) {
        Swal.fire(
          "Error",
          error.response?.data?.msg || "Something went wrong",
          "error",
        );
      }
    },
    enableReinitialize: true,
  });

  const fetchUnits = async () => {
    const res = await GetUnitData(userId);
    if (res?.data.success === true) {
      setUnitOptions(res?.data?.data["Unit Details"] || []);
    }
  };

  const parentUnitOptions = useMemo(() => {
    return unitOptions.filter(
      (u) =>
        u.isParentUnit === true &&
        (!selectedUnit || u.id !== selectedUnit.unitId),
    );
  }, [unitOptions, selectedUnit]);

  useEffect(() => {
    if (formik.values.nameEnglish)
      handleTranslate(formik.values.nameEnglish, {
        gujarati: "nameGujarati",
        hindi: "nameHindi",
      });
  }, [formik.values.nameEnglish]);

  useEffect(() => {
    if (formik.values.symbolEnglish)
      handleTranslate(formik.values.symbolEnglish, {
        gujarati: "symbolGujarati",
        hindi: "symbolHindi",
      });
  }, [formik.values.symbolEnglish]);

  useEffect(() => {
    if (selectedUnit && isModalOpen) {
      const mappedRanges =
        selectedUnit.ranges?.length > 0
          ? selectedUnit.ranges.map((r) => ({
              minValue: r.minValue?.toString() || "",
              maxValue: r.maxValue?.toString() || "",
              roundOffValue: r.roundOffValue?.toString() || "",
            }))
          : [{ minValue: "", maxValue: "", roundOffValue: "" }];

      formik.setValues({
        ...initialValues,
        nameEnglish: selectedUnit.nameEnglish || "",
        nameGujarati: selectedUnit.nameGujarati || "",
        nameHindi: selectedUnit.nameHindi || "",
        symbolEnglish: selectedUnit.symbolEnglish || "",
        symbolGujarati: selectedUnit.symbolGujarati || "",
        symbolHindi: selectedUnit.symbolHindi || "",
        isParentUnit: selectedUnit.isParentUnit || false,
        decimalLimit: selectedUnit.decimalLimit?.toString() || "",
        parentUnit: selectedUnit.parentUnit?.id
          ? selectedUnit.parentUnit.id.toString()
          : "",
        equivalent: selectedUnit.equivalentValue?.toString() || "",
        rangeType: selectedUnit.rangeType || "RANGE",
        ranges: mappedRanges,
        stepValue: selectedUnit.stepValue?.toString() || "",
      });
    }
  }, [selectedUnit, isModalOpen]);

  // Use useCallback to prevent function recreation
  const handleRangeChange = useCallback((index, field, value) => {
    formik.setFieldValue(`ranges[${index}].${field}`, value);
    if (field === "maxValue" && value) {
      formik.setFieldValue(`ranges[${index}].roundOffValue`, value);
    }
  }, []);

  const handleRangeRemove = useCallback(
    (index) => {
      const newRanges = formik.values.ranges.filter((_, i) => i !== index);
      formik.setFieldValue("ranges", newRanges);
    },
    [formik.values.ranges],
  );

  const addRangeRow = () =>
    formik.setFieldValue("ranges", [
      ...formik.values.ranges,
      { minValue: "", maxValue: "", roundOffValue: "" },
    ]);

  const renderSelect = (name, label, options) => (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">{label}</label>
      <select
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className="w-full border text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">Select</option>
        {options?.map((opt) => {
          if (typeof opt === "string" || typeof opt === "number") {
            return (
              <option key={opt} value={opt}>
                {opt}
              </option>
            );
          }
          return (
            <option key={opt.id} value={opt.id}>
              {opt.nameEnglish}
            </option>
          );
        })}
      </select>
      {formik.touched[name] && formik.errors[name] && (
        <p className="text-red-500 text-sm mt-1">{formik.errors[name]}</p>
      )}
    </div>
  );

  const RangeInfoSection = () => {
    const type = formik.values.rangeType;
    if (type === "PRECISION") {
      return (
        <div className="bg-[#F7FAFF] border rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
          <p className="text-black font-medium">
            This range works on the child unit (decimal part) of the
            measurement. If it falls between Minimum and Maximum, it is rounded
            to the Round Value.
          </p>
          <p className="mt-2">
            <strong className="text-black">Example:</strong> If the measurement
            value is 1.150, and the minimum value is 100, and the maximum value
            is 200, and the round off value is 200, then the measurement value
            will be rounded to 1.200.
          </p>
        </div>
      );
    }

    if (type === "STEPWISE") {
      return (
        <div className="bg-[#F7FAFF] border rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
          <p className="text-black font-medium">
            This range adjusts values in fixed steps based on the defined step
            size. Values are rounded to the nearest step.
          </p>
          <p className="mt-2">
            <strong className="text-black">Example:</strong> If the step size is
            0.5, then values from 0.1–0.5 round to 0.5, and 0.6–1.0 round to
            1.0.
          </p>
          <div className="mt-4">
            <label className="block text-gray-700 text-sm mb-1">
              Step Wise Range*
            </label>
            <input
              type="tel"
              step="any"
              name="stepValue"
              value={formik.values.stepValue}
              onChange={formik.handleChange}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter Step Wise Range"
            />
            {!formik.values.stepValue && (
              <p className="text-red-500 text-sm mt-1">
                Step Wise Range is required.
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-[#F7FAFF] border rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
        <p className="text-black font-medium">
          This range checks the full measurement value. If it falls between
          Minimum and Maximum, it is rounded to the Round Value.
        </p>
        <p className="mt-2">
          <strong className="text-black">Example:</strong> If the measurement
          value is 150, and the minimum value is 100, and the maximum value is
          200, and the round off value is 200, then the measurement value will
          be rounded to 200.
        </p>
      </div>
    );
  };

  const RangeTypeRadios = () => (
    <div className="flex gap-6">
      {[
        { label: "Range", value: "RANGE" },
        { label: "Precision Range", value: "PRECISION" },
        { label: "Step Wise Range", value: "STEPWISE" },
      ].map((type) => (
        <label key={type.value} className="flex items-center gap-2">
          <input
            type="radio"
            name="rangeType"
            value={type.value}
            checked={formik.values.rangeType === type.value}
            onChange={formik.handleChange}
            className="accent-blue-600"
          />
          <span className="text-gray-700">{type.label}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-6xl p-8 relative overflow-y-auto max-h-[90vh] border border-gray-100">
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {selectedUnit ? "Edit Unit" : "Create New Unit"}
          </h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-2xl text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-8">
        <MultiLangInputBox
  label="Name"
  formData={{
    nameEnglish: formik.values.nameEnglish,
    nameGujarati: formik.values.nameGujarati,
    nameHindi: formik.values.nameHindi,
  }}
  setFormData={(updated) => {
    if (updated.nameEnglish !== formik.values.nameEnglish)
      formik.setFieldValue("nameEnglish", updated.nameEnglish);
    if (updated.nameGujarati !== formik.values.nameGujarati)
      formik.setFieldValue("nameGujarati", updated.nameGujarati);
    if (updated.nameHindi !== formik.values.nameHindi)
      formik.setFieldValue("nameHindi", updated.nameHindi);
  }}
  cols={3}
  keys={{
    english: "nameEnglish",
    regional: "nameGujarati",
    hindi: "nameHindi",
  }}
  error={formik.touched.nameEnglish && formik.errors.nameEnglish}
/>

       <MultiLangInputBox
  label="Symbol"
  formData={{
    symbolEnglish: formik.values.symbolEnglish,
    symbolGujarati: formik.values.symbolGujarati,
    symbolHindi: formik.values.symbolHindi,
  }}
  setFormData={(updated) => {
    if (updated.symbolEnglish !== formik.values.symbolEnglish)
      formik.setFieldValue("symbolEnglish", updated.symbolEnglish);
    if (updated.symbolGujarati !== formik.values.symbolGujarati)
      formik.setFieldValue("symbolGujarati", updated.symbolGujarati);
    if (updated.symbolHindi !== formik.values.symbolHindi)
      formik.setFieldValue("symbolHindi", updated.symbolHindi);
  }}
  cols={3}
  keys={{
    english: "symbolEnglish",
    regional: "symbolGujarati",
    hindi: "symbolHindi",
  }}
  error={formik.touched.symbolEnglish && formik.errors.symbolEnglish}
/>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isParentUnit"
                checked={formik.values.isParentUnit}
                onChange={formik.handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
            </label>
            <span className="text-gray-700 font-medium">Is Parent Unit</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderSelect("decimalLimit", "Decimal Limit For Quantity*", [
              "-1",
              "0",
              "1",
              "2",
            ])}
            {!formik.values.isParentUnit && (
              <>
                {renderSelect("parentUnit", "Parent Unit", parentUnitOptions)}
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Equivalent
                  </label>
                  <input
                    name="equivalent"
                    type="tel"
                    step="any"
                    value={formik.values.equivalent}
                    onChange={formik.handleChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter Equivalent"
                  />
                </div>
              </>
            )}
          </div>

          <RangeTypeRadios />
          <RangeInfoSection />

          {formik.values.rangeType !== "STEPWISE" && (
            <RangeTable
              ranges={formik.values.ranges}
              onRangeChange={handleRangeChange}
              onRangeRemove={handleRangeRemove}
            />
          )}

          {formik.values.rangeType !== "STEPWISE" && (
            <button
              type="button"
              onClick={addRangeRow}
              className="p-2 rounded-lg flex items-center gap-2 bg-primary text-white font-medium mt-2"
            >
              <span className="text-xl">＋</span> Add Range
            </button>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bg-danger hover:bg-red-600 text-white px-6 py-2.5 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUnit;
