const tableColumns = useMemo(() => {
  const baseColumns = [
    {
      accessorKey: "itemName",
      header: "Menu Item",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.itemName}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "Menu Item Category",
      cell: ({ row }) => (
        <span className="badge badge-light">{row.original.category}</span>
      ),
    },
  ];

  // When Chef Labour is selected in toCategory
  if (toCategory === "Chef Labour") {
    return [
      ...baseColumns,
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <select className="input w-full">
            <option value="">Select Type</option>
            <option value="counter">Counter Price</option>
            <option value="plate">Plate Wise</option>
          </select>
        ),
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm">Counter No:</span>
              <input className="input w-20" type="tel" placeholder="0" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Helper N:</span>
              <input className="input w-20" type="tel" placeholder="0" />
            </div>
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm">Counter NP:</span>
              <input className="input w-20" type="tel" placeholder="0" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Price:</span>
              <input className="input w-20" type="tel" placeholder="0" />
            </div>
          </div>
        ),
      },
    ];
  }
  // When Outside is selected in toCategory
  else if (toCategory === "Outside") {
    return [
      ...baseColumns,
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => (
          <input
            className="input w-full"
            type="tel"
            placeholder="Enter quantity"
          />
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
          <input
            className="input w-full"
            type="tel"
            placeholder="Enter price"
          />
        ),
      },
      {
        accessorKey: "unit",
        header: "Unit",
        cell: ({ row }) => (
          <select className="input w-full">
            <option value="">Select Unit</option>
            <option value="kg">KG</option>
            <option value="ltr">Liter</option>
            <option value="pcs">Pieces</option>
            <option value="plate">Plate</option>
          </select>
        ),
      },
    ];
  }

  return [
    ...baseColumns,
    {
      accessorKey: "quantity",
      header: "Quantity",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.price}</span>
      ),
    },
  ];
}, [toCategory]);
