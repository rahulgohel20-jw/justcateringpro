import { Select } from "antd";

const CustomerDropdown = ({ value, onChange, options = [], ...rest }) => {
  // Normalize values so Ant Design always compares strings
  const normalizedOptions = options.map((opt) => ({
    ...opt,
    value: String(opt.value),
    label: opt.label || opt.customername || "",
  }));

  const handleChange = (val) => {
    const selectedCustomer = normalizedOptions.find(
      (opt) => opt.value === String(val)
    );

    onChange({
      target: {
        name: "customer_name",
        value: val,
      },
      customer: selectedCustomer,
    });
  };

  return (
    <Select
      showSearch
      allowClear

      // IMPORTANT: normalize selected ID
      value={value !== null && value !== undefined ? String(value) : undefined}

      onChange={handleChange}
      placeholder="Please select"
      className="w-full border-none shadow-none focus:outline-none"
      style={{ width: "100%" }}

      // Use customer name as displayed selected text
      optionLabelProp="label"

      options={normalizedOptions}

      filterOption={(input, option) =>
        String(option?.label || "")
          .toLowerCase()
          .includes(input.toLowerCase())
      }

      {...rest}
    />
  );
};

export default CustomerDropdown;