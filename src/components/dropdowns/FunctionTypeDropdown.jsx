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
      popupClassName="function-type-popup"
      dropdownClassName="function-type-popup" // keep both — v4 uses dropdownClassName, v5 uses popupClassName
      dropdownMatchSelectWidth={false} // let popup width grow independent of the input's width
      {...rest}
    />
  );
};

export default FunctionTypeDropdown;