import { Select } from "antd";

const VenueDropdown = ({ value, onChange, options, ...rest }) => {
  const handleChange = (val) => {
   
    onChange({ target: { name: "venueId", value: val } });
  };

  return (
    <Select
      value={value || undefined}
      onChange={handleChange}
      placeholder="Select Venue"
      options={options}
      showSearch
      allowClear
      {...rest}
      className="w-full border-none shadow-none focus:outline-none"
      style={{
        border: "none",
        boxShadow: "none",
      }}
      filterOption={(input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
    />
  );
};

export default VenueDropdown;
