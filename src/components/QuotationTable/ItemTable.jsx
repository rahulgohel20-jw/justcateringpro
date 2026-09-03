import React from "react";
import { Table, Input, Button, Upload, Tooltip } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const ItemTable = ({ rows, onInputChange, onAddRow, onDeleteRow }) => {
  const columns = [
    {
      title: "#",
      dataIndex: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <span className="font-semibold">{index + 1}</span>
      ),
    },
    {
      title: "Image",
      dataIndex: "image",
      width: 90,
      align: "center",
      render: (_, record, index) => (
        <Upload
          showUploadList={false}
          onChange={(info) => {
            const file = info.file.originFileObj;
            onInputChange(
              index,
              "image",
              file ? URL.createObjectURL(file) : ""
            );
          }}
        >
          {record.image ? (
            <img
              src={record.image}
              alt="item"
              className="w-10 h-10 rounded-full object-cover cursor-pointer border border-gray-200"
            />
          ) : (
            <Button
              icon={<UploadOutlined />}
              size="small"
              className="text-[#005BA8] border-[#005BA8]"
            >
              Upload
            </Button>
          )}
        </Upload>
      ),
    },
    {
      title: "Name & Description",
      dataIndex: "item",
      width: 300,
      render: (text, record, index) => (
        <div className="flex flex-col">
          <Input
            placeholder="Item Name"
            value={record.item}
            onChange={(e) => onInputChange(index, "item", e.target.value)}
            className="border-none shadow-none font-medium mb-1"
          />
          <Input.TextArea
            placeholder="Description"
            value={record.desc}
            onChange={(e) => onInputChange(index, "desc", e.target.value)}
            className="border-none shadow-none text-gray-500 text-xs resize-none"
            autoSize
          />
        </div>
      ),
    },
    {
      title: "Size / Sq.ft.",
      dataIndex: "size",
      width: 120,
      align: "center",
      render: (text, record, index) => (
        <Input
          placeholder="Size"
          value={record.size}
          onChange={(e) => onInputChange(index, "size", e.target.value)}
          className="text-center border-none shadow-none"
        />
      ),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      width: 100,
      align: "center",
      render: (text, record, index) => (
        <Input
          type="tel"
          value={record.qty}
          onChange={(e) => onInputChange(index, "qty", e.target.value)}
          className="text-center border-none shadow-none"
        />
      ),
    },
    {
      title: "Rate",
      dataIndex: "rate",
      width: 100,
      align: "center",
      render: (text, record, index) => (
        <Input
          type="tel"
          value={record.rate}
          onChange={(e) => onInputChange(index, "rate", e.target.value)}
          className="text-center border-none shadow-none"
        />
      ),
    },
    {
      title: "Total Price",
      dataIndex: "amount",
      width: 120,
      align: "center",
      render: (_, record) => {
        const total = Number(record.qty || 0) * Number(record.rate || 0) || 0;
        // Show .00 only if there are decimals
        const formattedTotal = total % 1 === 0 ? total : total.toFixed(2);
        return (
          <span className="font-semibold text-[#005BA8]">
            ₹ {formattedTotal}
          </span>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 80,
      render: (_, record) => (
        <Tooltip title="Delete Item">
          <Button
            type="text"
            icon={<DeleteOutlined className="text-red-500" />}
            onClick={() => onDeleteRow(record.key)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="card border border-gray-200 rounded-xl overflow-hidden mb-6">
      <div className="flex justify-between items-center px-5 py-3 bg-[#E8F3FF] border-b border-gray-200">
        <h3 className="text-[#005BA8] font-semibold text-base">Item Table</h3>
        <Button
          icon={<PlusOutlined />}
          onClick={onAddRow}
          className="bg-[#005BA8] text-white rounded-md hover:opacity-90"
        >
          Add Item
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={rows}
        pagination={false}
        bordered
        className="[&_.ant-table-thead>tr>th]:bg-white [&_.ant-table-cell]:align-middle"
      />
    </div>
  );
};

export default ItemTable;
