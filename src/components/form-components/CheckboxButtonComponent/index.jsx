import React from "react";

const CheckboxButtonComponent = ({
  options = [],
  value,
  onChange,
  className = "",
  buttonClassName = "",
  checkedIcon = <i className="ki-filled ki-check me-1"></i>,
}) => {
  return (
    <div className={`flex space-x-2 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`btn btn-md rounded-full ${
            value === option.value
              ? "bg-success text-white"
              : "bg-gray-200 text-gray-700"
          } hover:bg-success hover:text-white transition-colors duration-200 flex items-center space-x-2 ${buttonClassName}`}
          title={option.label}
          type="button"
        >
          {value === option.value && checkedIcon}
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default CheckboxButtonComponent;
