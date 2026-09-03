import { Tooltip, Popconfirm, message } from "antd";
import { YesNoIcon } from "./YesNoIcon";

export const columns = (
  setSelectedRow,
  setIsModalOpen,
  onDelete,
  permissions,
) => [
  {
    accessorKey: "sr_no",
    header: "Sr No",
  },
  {
    accessorKey: "mappingName",
    header: "Template Name",
  },
  {
    accessorKey: "moduleName",
    header: "Module Name",
  },

  {
    accessorKey: "isCategorySlogan",
    header: "Category Slogan",
    cell: ({ row }) => <YesNoIcon value={row.original.isCategorySlogan} />,
  },
  {
    accessorKey: "isCategoryInstruction",
    header: "Category Instruction",
    cell: ({ row }) => <YesNoIcon value={row.original.isCategoryInstruction} />,
  },
  {
    accessorKey: "isCategoryImage",
    header: "Category Image",
    cell: ({ row }) => <YesNoIcon value={row.original.isCategoryImage} />,
  },
  {
    accessorKey: "isItemSlogan",
    header: "Item Slogan",
    cell: ({ row }) => <YesNoIcon value={row.original.isItemSlogan} />,
  },
  {
    accessorKey: "isItemInstruction",
    header: "Item Instruction",
    cell: ({ row }) => <YesNoIcon value={row.original.isItemInstruction} />,
  },
  {
    accessorKey: "isItemImage",
    header: "Item Image",
    cell: ({ row }) => <YesNoIcon value={row.original.isItemImage} />,
  },
  {
    accessorKey: "isCompanyLogo",
    header: "Company Logo",
    cell: ({ row }) => <YesNoIcon value={row.original.isCompanyLogo} />,
  },
  {
    accessorKey: "isCompanyDetails",
    header: "Company Details",
    cell: ({ row }) => <YesNoIcon value={row.original.isCompanyDetails} />,
  },
  {
    accessorKey: "isPartyDetails",
    header: "Party Details",
    cell: ({ row }) => <YesNoIcon value={row.original.isPartyDetails} />,
  },
  {
    accessorKey: "isWithQuantity",
    header: "With Quantity",
    cell: ({ row }) => <YesNoIcon value={row.original.isWithQuantity} />,
  },
  {
    accessorKey: "labourType",
    header: "Vendor Type",
    cell: ({ row }) => <span>{row.original.labourType || "-"}</span>,
  },
  {
    accessorKey: "size1",
    header: "Size1 (A4)",
    cell: ({ row }) => <YesNoIcon value={row.original.size1} />,
  },
  {
    accessorKey: "size2",
    header: "Size2 (A6)",
    cell: ({ row }) => <YesNoIcon value={row.original.size2} />,
  },

  {
    accessorKey: "dropdown",
    header: "Dropdown",
    cell: ({ row }) => <YesNoIcon value={row.original.dropdown} />,
  },
  {
    accessorKey: "WithPrice",
    header: "With Price",
    cell: ({ row }) => <YesNoIcon value={row.original.WithPrice} />,
  },
  {
    accessorKey: "isAgency",
    header: "Is Agency",
    cell: ({ row }) => <YesNoIcon value={row.original.isAgency} />,
  },
  {
    accessorKey: "isItem",
    header: "Is Item",
    cell: ({ row }) => <YesNoIcon value={row.original.isItem} />,
  },
  {
    accessorKey: "isItemColumn",
    header: "Is Item Column",
    cell: ({ row }) => <YesNoIcon value={row.original.isItemColumn} />,
  },
  {
    accessorKey: "isItemPage",
    header: "Is Item Page",
    cell: ({ row }) => <YesNoIcon value={row.original.isItemPage} />,
  },
  {
    accessorKey: "isCombo",
    header: "Is Combo",
    cell: ({ row }) => <YesNoIcon value={row.original.isCombo} />,
  },
  {
    accessorKey: "isRawMaterialCat",
    header: "Is Raw Material Category",
    cell: ({ row }) => <YesNoIcon value={row.original.isRawMaterialCat} />,
  },
  {
    accessorKey: "IsAdvancePay",
    header: "Is Advance Pay",
    cell: ({ row }) => <YesNoIcon value={row.original.isAdvancedPay} />,
  },
  {
    accessorKey: "size3",
    header: "Size3 (A5)",
    cell: ({ row }) => {
      return <YesNoIcon value={row.original.size3} />;
    },
  },
  {
    accessorKey: "isHalfPax",
    header: "isHalf Pax",
    cell: ({ row }) => {
      return <YesNoIcon value={row.original.isHalfPax} />;
    },
  },
  {
    accessorKey: "is3Column",
    header: "is3Column",
    cell: ({ row }) => {
      return <YesNoIcon value={row.original.is3Column} />;
    },
  },
  {
    accessorKey:"isFunctionNextPage" , 
    header :" is Function Next Page ",
    cell :({row }) => {
      return <YesNoIcon value={row.original.isFunctionNextPage} />;
    },
  },
  {
    accessorKey:"isAddDecoration" , 
    header :" is Add Decoration ",
    cell :({row }) => {
      return <YesNoIcon value={row.original.isAddDecoration} />;
    },
  },
   {
    accessorKey:"isOnePage" , 
    header :" is One Page ",
    cell :({row }) => {
      return <YesNoIcon value={row.original.isOnePage} />;
    },
  },
    {
    accessorKey:"isShowEventRemarks" , 
    header :" is Show Event Remarks ",
    cell :({row }) => {
      return <YesNoIcon value={row.original.isShowEventRemarks} />;
    },
  },
   {
    accessorKey:"showAdditional" , 
    header :" Show Additional ",
    cell :({row }) => {
      return <YesNoIcon value={row.original.showAdditional} />;
    },
  },
   {
    accessorKey:"isAgencyNextPage" , 
    header :" is Agency Next Page ",
    cell :({row }) => {
      return <YesNoIcon value={row.original.isAgencyNextPage} />;
    },
  },
    {
    accessorKey:"storeIssueWise" , 
    header :" Store Issue Wise ",
    cell :({row }) => {
      return <YesNoIcon value={row.original.storeIssueWise} />;
    },
  },
  {
    accessorKey:"isAddStoreIssue" ,
    header :"Add Store Issue ", 
    cell:({row}) => {
      return <YesNoIcon value={row.original.isAddStoreIssue}/>;
    },
  },
{
  accessorKey:"is5Column",
  header:"is5Column",
  cell:({row}) => {
    return <YesNoIcon value={row.original.is3Column}/>;
    },
},
{
  accessorKey:"showLastPage" , 
  header:"showLastPage",
  cell:({row}) => {
    return <YesNoIcon value={row.original.showlagepage}/>;

  },
},
 {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {/* EDIT */}
        {permissions.edit && (
          <Tooltip title="Edit">
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => {
                setSelectedRow(row.original);
                setIsModalOpen(true);
              }}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>
        )}

        {/* DELETE */}
        {permissions.delete && (
          <Popconfirm
            title="Are you sure you want to delete this configuration?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => {
              onDelete(row.original.rawid); // ✅ FIXED
              message.success("Deleted successfully");
            }}
          >
            <Tooltip title="Delete">
              <button className="btn btn-sm btn-icon btn-clear">
                <i className="ki-filled ki-trash text-danger"></i>
              </button>
            </Tooltip>
          </Popconfirm>
        )}
      </div>
    ),
  },
];
