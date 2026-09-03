import { Tooltip } from "antd";

const SearchInput = ({ placeholder, value, onChange, onAdd, addTooltip }) => (
  <div className="sg__inner relative w-full">
    <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute left-2 top-1/2 -translate-y-1/2"></i>
    <input
      type="text"
      className={`input ${onAdd ? "pl-8 pr-12" : "pl-8 "} w-full `}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {onAdd && (
      <Tooltip title={addTooltip}>
        <button
          type="button"
          onClick={onAdd}
          className="absolute top-1/2 right-4 -translate-y-1/2 btn btn-primary w-8 h-8 flex items-center justify-center rounded-full"
        >
          <i className="ki-filled ki-plus text-md"></i>
        </button>
      </Tooltip>
    )}
  </div>
);
export default SearchInput;
