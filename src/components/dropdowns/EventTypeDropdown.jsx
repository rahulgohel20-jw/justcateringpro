import { useState } from "react";
import { SelectDropdown } from "@/components/form-components/SelectDropdown";

const EventTypeDropdown = ({ value, onChange, ...rest }) => {
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
        { label: "User A", value: "UserA" },
        { label: "User B", value: "UserB" },
        { label: "User C", value: "UserC" },
      ]}
      placeholder={"Please select"}
      {...rest}
    />
  );
};

export default EventTypeDropdown;
