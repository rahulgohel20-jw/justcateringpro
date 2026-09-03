import { Select } from "antd";

const CustomerDropdown = ({ value, onChange, options = [], ...rest }) => {
  const handleChange = (val) => {
    const selectedCustomer = options.find((opt) => opt.value === val);

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
      value={value || undefined}  
      className="w-full border-none shadow-none focus:outline-none"
      onChange={handleChange}
      placeholder="Please select"
      style={{ width: "100%" }}
      options={options}
      filterOption={(input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
      {...rest}
    />
  );
};

export default CustomerDropdown;
