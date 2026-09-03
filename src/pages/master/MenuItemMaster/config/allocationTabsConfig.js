const allocationTabsConfig = {
  outside: [
    {
      type: "input",
      label: "Quantity Per 100 Person",
      name: "qty",
      placeholder: "Helper",
      required: true,
    },
    {
      type: "select",
      label: "Select Unit",
      name: "unit",
      options: [],
      required: true,
    },
    {
      type: "input",
      label: "Price (Price Per 1 Unit)",
      name: "outside_price",
      required: true,
    },
    {
      type: "select",
      label: "Vendor Category",
      name: "contactCategory",
      options: [],
      required: true,
    },
    {
      type: "select",
      label: "Vendor Name",
      name: "outside_contactName",
      options: [],
      showAddButton: true,
      required: true,
    },
    {
      type: "input",
      label: "Remarks",
      name: "outside_remarks",
    },
  ],
 chef: [
  {
    type: "select",
    label: "Order Type",
    name: "counter wise",
    options: [
      { label: "Counter Wise", value: "counter_wise" },
      { label: "Plate Wise",   value: "plate_wise"   },
    ],
    required: true,
  },
 
  {
    type: "input",
    // label overridden dynamically in RenderAllocationFields
    labelPlateWise: "Pax",
    labelCounterWise: "Counter No",
    name: "counterno",
    required: true,
  },
  {
    type: "input",
    label: "Helper No",
    name: "helperNo",
    required: false,
    showWhen: ["counter_wise"],
  },
  {
    type: "input",
    label: "Price Per Helper",
    name: "pricePerHelper",
    required: false,
    showWhen: ["counter_wise"],
  },
  {
    type: "input",
    labelPlateWise: "Price",
    labelCounterWise: "Price Per Labour",
    name: "chef_price",
    required: true,
  },
  {
    type: "select",
    label: "Select Contactor Name",
    name: "chef_contactName",
    options: [],
    showAddButton: true,
    required: true,
  },
  {
    type: "input",
    label: "Remarks",
    name: "chef_remarks",
  },
],
  inside: [
    {
      type: "select",
      label: "Chef / Kitchen",
      name: "chef_name",
      options: [],
      showAddButton: true,
      required: true,
    },
    {
      type: "input",
      label: "Remarks",
      name: "remarks",
    },
    {
      type: "input",
      label: "Number",
      name: "chef_number",
    },
  ],
};

export default allocationTabsConfig;
