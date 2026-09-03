import { Form, Input, Select } from "antd";
import { useEffect, useState } from "react";

const RenderAllocationFields = ({ fields, onAddClick, form, watchValues = {} }) => {
  const orderType = watchValues["counter wise"] || "plate_wise";

  return (
    <>
      {fields.map((f) => {
        // showWhen visibility check
        if (f.showWhen) {
          if (!f.showWhen.includes(orderType)) return null;
        }

        // Dynamic label based on order type
        const label = f.labelPlateWise
          ? (orderType === "counter_wise" ? f.labelCounterWise : f.labelPlateWise)
          : f.label;

        return (
          <Form.Item
            key={f.name + (f.labelPlateWise ? orderType : "")}
            label={
              <span className="text-[#6A7C94] text-base font-medium mt-3">
                {label}
                {f.required && (
                  <span style={{ color: "red", marginLeft: 4 }}>*</span>
                )}
              </span>
            }
            name={f.name}
            rules={
              f.required
                ? [{ required: true, message: `${label} is required` }]
                : []
            }
            required={false}
          >
            {f.type === "input" ? (
              <Input
                placeholder={f.placeholder || label}
                className="bg-[#F8FAFC] h-10 hover:border-[#d9d9d9]"
              />
            ) : (
              <SelectWithRefresh field={{ ...f, label }} form={form} onAddClick={onAddClick} />
            )}
          </Form.Item>
        );
      })}
    </>
  );
};

const SelectWithRefresh = ({ field, form, onAddClick }) => {
  const [selectKey, setSelectKey] = useState(0);
  const formValue = Form.useWatch(field.name, form);

  useEffect(() => {
    if (field.options && field.options.length > 0 && formValue) {
      setSelectKey((prev) => prev + 1);
    }
  }, [field.options?.length, formValue]);

  return (
    <div className="flex">
      <Select
        key={selectKey}
        showSearch
        optionFilterProp="label"
        value={formValue}
        placeholder={field.placeholder || field.label}
        className="bg-[#F8FAFC] h-10 hover:border-[#d9d9d9] w-full"
        options={field.options || []}
        onChange={(value) => {
          form.setFieldsValue({ [field.name]: value });
          if (field.onChange) field.onChange(value);
        }}
      />
      {field.showAddButton && (
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-r-xl shadow hover:scale-105 transition"
          onClick={() => onAddClick(field.name)}
        >
          <i className="ki-filled ki-plus"></i>
        </button>
      )}
    </div>
  );
};

export default RenderAllocationFields;