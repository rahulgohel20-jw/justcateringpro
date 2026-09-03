import { useState } from "react";
import { SelectDropdown } from "@/components/form-components/SelectDropdown";

const SubVenueDropdown = ({ value, onChange, ...rest }) => {
  const [selectedCompanies, setSelectedCompanies] = useState(value || []);

  const handleChange = (event) => {
    setSelectedCompanies(event.target.value);
    onChange(event);
  };

  return (
    <SelectDropdown
      value={selectedCompanies}
      onChange={handleChange}
      staticOptions={[
        { label: "Venue 1", value: "UserA" },
        { label: "Venue 2", value: "UserB" },
        { label: "Venue 3", value: "UserC" },
      ]}
      mode="multiple"
      placeholder={"Please select"}
      {...rest}
    />
  );
};

export default SubVenueDropdown;
