import Select, { components } from "react-select";

export default function FloatingSelect({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  icon,
  iconColor = "text-gray-400",
  error,
}) {
  // Custom Control to include icon
  const CustomControl = ({ children, ...props }) => {
    return (
      <components.Control {...props}>
        {icon && (
          <span
            className={`absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none ${iconColor}`}
          >
            <i className={`ki-filled ${icon}`} />
          </span>
        )}
        {children}
      </components.Control>
    );
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: error ? "#EF4444" : state.isFocused ? "#3B82F6" : "#E5E7EB",
      boxShadow: "none",
      borderRadius: "8px",
      minHeight: "48px",
      fontSize: "14px",
      paddingLeft: icon ? "40px" : "12px", // leave space for icon
      position: "relative", // important
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 8px",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#EFF6FF" : "white",
      color: state.isFocused ? "#2563EB" : "#111827",
      fontSize: "14px",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9CA3AF",
      fontSize: "14px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#111827",
      fontSize: "14px",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#9CA3AF",
      "&:hover": { color: "#2563EB" },
    }),
    indicatorSeparator: () => ({ display: "none" }),
  };

  return (
    <div className="relative w-full">
      {label && (
        <label
          className={`block  text-sm font-medium ${
            error ? "text-red-500" : "text-gray-700"
          }`}
        >
          {label}
        </label>
      )}

      <Select
        name={name}
        options={options}
        value={options.find((opt) => opt.value === value) || null}
        onChange={(selectedOption) =>
          onChange({
            target: { name, value: selectedOption ? selectedOption.value : "" },
          })
        }
        onBlur={onBlur}
        placeholder=""
        isClearable
        styles={customStyles}
        components={{
          Control: CustomControl,
          IndicatorSeparator: () => null,
        }}
      />

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
