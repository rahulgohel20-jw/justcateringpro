import { useState } from "react";
import { SelectDropdown } from "@/components/form-components/SelectDropdown";

const TaskCategoryDropdown = () => {
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  const handleChange = (event) => {
    setSelectedCompanies(event.target.value);
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
    />
  );
};

export default TaskCategoryDropdown;
