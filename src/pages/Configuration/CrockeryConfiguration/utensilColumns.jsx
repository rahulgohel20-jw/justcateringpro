// utensilColumns.js
// Uses TanStack Table v8 syntax (lowercase "cell", "header", "accessorKey")
// to match gasBatlaColumns which works correctly on the GAS tab.

const inputClassName =
  "w-full px-3 py-3 text-center border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all";

const inputStyle = {
  minWidth: "110px",
  minHeight: "48px",
  fontSize: "15px",
};

const makeRangeColumn = (field, header, onValueChange) => ({
  id: field,
  header, // lowercase — TanStack v8
  accessorKey: field, // lowercase — TanStack v8
  minWidth: 130,
  size: 130,
  cell: (
    { row }, // lowercase — TanStack v8
  ) => (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      className={inputClassName}
      style={inputStyle}
      value={row.original[field] ?? ""}
      onChange={(e) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        onValueChange(row.original.id, field, value);
      }}
      onFocus={(e) => e.target.select()}
    />
  ),
});

export const utensilColumns = ({ onValueChange }) => [
  {
    id: "rawMaterial",
    header: "Name", // lowercase
    accessorKey: "rawMaterialNameEnglish", // lowercase
    minWidth: 200,
    size: 200,
  },
  makeRangeColumn("r_0_to_100", "0-100", onValueChange),
  makeRangeColumn("r_101_to_200", "101-200", onValueChange),
  makeRangeColumn("r_201_to_300", "201-300", onValueChange),
  makeRangeColumn("r_301_to_400", "301-400", onValueChange),
  makeRangeColumn("r_401_to_500", "401-500", onValueChange),
  makeRangeColumn("r_501_to_600", "501-600", onValueChange),
  makeRangeColumn("r_601_to_700", "601-700", onValueChange),
  makeRangeColumn("r_701_to_800", "701-800", onValueChange),
  makeRangeColumn("r_801_to_900", "801-900", onValueChange),
  makeRangeColumn("r_901_to_1000", "901-1000", onValueChange),
  makeRangeColumn("r_1001_to_1100", "1001-1100", onValueChange),
  makeRangeColumn("r_1101_to_1200", "1101-1200", onValueChange),
  makeRangeColumn("r_1201_to_1300", "1201-1300", onValueChange),
  makeRangeColumn("r_1301_to_1400", "1301-1400", onValueChange),
  makeRangeColumn("r_1401_to_1500", "1401-1500", onValueChange),
  makeRangeColumn("r_1501_to_1600", "1501-1600", onValueChange),
  makeRangeColumn("r_1601_to_1700", "1601-1700", onValueChange),
  makeRangeColumn("r_1701_to_1800", "1701-1800", onValueChange),
  makeRangeColumn("r_1801_to_1900", "1801-1900", onValueChange),
  makeRangeColumn("r_1901_to_2000", "1901-2000", onValueChange),
];
