import { Select } from "antd";
import { usePlaceOptions } from "@/hooks/usePlaceOptions";

const PlaceSelect = ({
  value,
  onChange,
  className,
  // Optional: allow overriding with custom options if needed
  customOptions = null,
  customLoading = null,
}) => {
  // Use the custom hook
  const { options: hookOptions, loading: hookLoading } = usePlaceOptions();

  // Allow override with custom options (for special cases)
  const options = customOptions || hookOptions;
  const loading = customLoading !== null ? customLoading : hookLoading;

  const handleChange = (selectedValue, option) => {
    onChange(selectedValue, option?.id);
  };

  return (
    <Select
      size="medium"
      value={value}
      onChange={handleChange}
      className={className || "w-full h-10"}
      options={options}
      loading={loading}
      placeholder="Select place"
    />
  );
};

export default PlaceSelect;
