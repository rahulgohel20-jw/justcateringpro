import { Select } from "antd";

const FunctionTypeDropdown = ({ value, onChange, options, ...rest }) => {
  return (
    <Select
      showSearch
      allowClear
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Please select function"
      filterOption={(input, option) =>
        option?.label?.toLowerCase().includes(input.toLowerCase())
      }
      style={{ width: "100%" }}
      {...rest}
    />
  );
};

export default FunctionTypeDropdown;
