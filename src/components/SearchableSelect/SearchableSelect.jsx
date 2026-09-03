import { useState, useEffect, useRef } from "react";

const SearchableSelect = ({ value, name, onChange, options }) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const ref = useRef();

  const filteredOptions = options.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleSelect = (val) => {
    const fakeEvent = {
      target: { name, value: val },
    };

    onChange(fakeEvent);
    setSearch("");
    setOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      {/* Input Box */}
      <input
        type="text"
        placeholder="Search..."
        value={search || options.find((o) => o.value === value)?.label || ""}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full border rounded-md px-3 py-2"
      />

      {/* Dropdown List */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-md shadow max-h-48 overflow-y-auto z-50">
          {filteredOptions.length ? (
            filteredOptions.map((item) => (
              <div
                key={item.value}
                onClick={() => handleSelect(item.value)}
                className="px-3 py-2 cursor-pointer hover:bg-blue-100"
              >
                {item.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500">No match found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
