import { useState, useRef, useEffect } from "react";

const FromCategoryDropdown = ({ value = [], onChange, options = [] }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleValue = (id) => {
    if (id === "all") {
      if (value.includes("all")) {
        onChange([]);
      } else {
        onChange([
          "all",
          ...options.filter((o) => o.id !== "all").map((o) => o.id),
        ]);
      }
      return;
    }

    let newValue = value.includes(id)
      ? value.filter((v) => v !== id && v !== "all")
      : [...value.filter((v) => v !== "all"), id];

    // auto add "all" if everything selected
    const allCategoryIds = options
      .filter((o) => o.id !== "all")
      .map((o) => o.id);
    if (allCategoryIds.every((cid) => newValue.includes(cid))) {
      newValue = ["all", ...newValue];
    }

    onChange(newValue);
  };
  const selectedLabel =
    value.length === 0
      ? "Select category"
      : value.includes("all")
        ? "All Categories"
        : value.length === 1
          ? options.find((o) => o.id === value[0])?.name
          : `${value.length} categories selected`;

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      {/* Input */}
      <div
        className="input flex items-center justify-between cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span
          className={value.length ? "text-black truncate" : "text-gray-400"}
        >
          {selectedLabel}
        </span>

        <i
          className={`ki-filled ki-down text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        ></i>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg">
          {/* Search */}
          <div className="p-2 border-b">
            <input
              className="input"
              placeholder="Search category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="max-h-52 overflow-y-auto">
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">
                No records found
              </div>
            )}

            {filteredOptions.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={value.includes(cat.id)}
                  onChange={() => toggleValue(cat.id)}
                />
                <span className="text-sm">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FromCategoryDropdown;
