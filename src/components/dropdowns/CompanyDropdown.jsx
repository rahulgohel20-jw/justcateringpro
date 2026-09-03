import { useState } from "react";
import { SelectDropdown } from "@/components/form-components/SelectDropdown";

const CompanyDropdown = () => {
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  const handleChange = (event) => {
    setSelectedCompanies(event.target.value);
  };

  return (
    <SelectDropdown
      value={selectedCompanies}
      onChange={handleChange}
      staticOptions={[
        { label: "Company A", value: "companyA" },
        { label: "Company B", value: "companyB" },
        { label: "Company C", value: "companyC" },
      ]}
      mode="multiple"
    />
  );
};

export default CompanyDropdown;
