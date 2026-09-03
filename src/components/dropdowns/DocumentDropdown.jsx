import { useState } from "react";
import { SelectDropdown } from "@/components/form-components/SelectDropdown";

const DocumentDropdown = ({ value, onChange, ...rest }) => {
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
        { label: "Pan Card", value: "pan_card" },
        { label: "Addhar Card", value: "addhar_card" },
        { label: "Voter Id", value: "Voter_id" },
      ]}
      placeholder={"Please select"}
      {...rest}
    />
  );
};

export default DocumentDropdown;
