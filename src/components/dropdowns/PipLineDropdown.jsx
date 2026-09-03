import { useState } from "react";
import { SelectDropdown } from "@/components/form-components/SelectDropdown";

const PipLineDropdown = ({ value, onChange, ...rest }) => {
  const [selectedCompanies, setSelectedCompanies] = useState(value || []);

  const handleChange = (event) => {
    setSelectedCompanies(event.target.value);
    onChange(event);
  };
  return (
    <>
      <SelectDropdown
        value={selectedCompanies}
        onChange={handleChange}
        staticOptions={[
          { label: "Company A", value: "companyA" },
          { label: "Company B", value: "companyB" },
          { label: "Company C", value: "companyC" },
        ]}
        mode="multiple"
        {...rest}
      />
    </>
  );
};

export default PipLineDropdown;
