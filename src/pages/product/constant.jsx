import { DataGridColumnHeader } from "@/components";
import { Tooltip } from "antd";
import { Link } from "react-router-dom";
export const columns = [
  {
    accessorKey: "product_name",
    header: ({ column }) => (
      <DataGridColumnHeader title="Product Name" column={column} />
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataGridColumnHeader title="Category" column={column} />
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataGridColumnHeader title="Price" column={column} />
    ),
    
  },
  {
    accessorKey: "unit",
    header: ({ column }) => (
      <DataGridColumnHeader title="Unit" column={column} />
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ cell }) => {
      return (
        <div className="flex items-center justify-center gap-1">
          <Tooltip title="View">
            <Link
              to={`/product/detail/`}
              className="btn btn-sm btn-icon btn-clear"
              title="View"
            >
              <i className="ki-filled ki-eye text-success"></i>
            </Link>
          </Tooltip>
          <Tooltip title="Edit">
            <button
              className="btn btn-sm btn-icon btn-clear"
              title="Edit"
              onClick={() => cell.row.original.handleModalOpen()}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>
          <Tooltip title="Delete">
            <button className="btn btn-sm btn-icon btn-clear" title="Delete">
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          </Tooltip>
        </div>
      );
    },
  },
];
export const defaultData = [
  {
    product_name: "Wireless Mouse",
    category: "Electronics",
    price: 25.99,
    unit: "piece",
  },
  {
    product_name: "Notebook",
    category: "Stationery",
    price: 3.5,
    unit: "piece",
  },
  {
    product_name: "Coffee Mug",
    category: "Kitchen",
    price: 7.25,
    unit: "piece",
  },
  {
    product_name: "USB Cable",
    category: "Electronics",
    price: 5.99,
    unit: "piece",
  },
  {
    product_name: "Desk Lamp",
    category: "Furniture",
    price: 18.75,
    unit: "piece",
  },
  {
    product_name: "Office Chair",
    category: "Furniture",
    price: 129.99,
    unit: "piece",
  },
  {
    product_name: "Water Bottle",
    category: "Kitchen",
    price: 12.49,
    unit: "piece",
  },
  {
    product_name: "Ballpoint Pen",
    category: "Stationery",
    price: 0.99,
    unit: "piece",
  },
  {
    product_name: "Bluetooth Speaker",
    category: "Electronics",
    price: 45.0,
    unit: "piece",
  },
  {
    product_name: "File Cabinet",
    category: "Furniture",
    price: 89.99,
    unit: "piece",
  },
  {
    product_name: "Sticky Notes",
    category: "Stationery",
    price: 2.49,
    unit: "pack",
  },
  {
    product_name: "Laptop Stand",
    category: "Electronics",
    price: 39.95,
    unit: "piece",
  },
  {
    product_name: "Cutlery Set",
    category: "Kitchen",
    price: 22.0,
    unit: "set",
  },
  {
    product_name: "Monitor 24 inch",
    category: "Electronics",
    price: 149.99,
    unit: "piece",
  },
  {
    product_name: "Desk Organizer",
    category: "Stationery",
    price: 14.95,
    unit: "piece",
  },
];
