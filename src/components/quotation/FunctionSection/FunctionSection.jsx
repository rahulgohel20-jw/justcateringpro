import { useState } from "react";
import { DatePicker, TimePicker, Select, Button } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

export default function FunctionTable() {
  const [rows, setRows] = useState([{ id: 1 }]);

  const addRow = () => {
    setRows([...rows, { id: Date.now() }]);
  };

  const removeRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };
  const [activeSection, setActiveSection] = useState("function");
  const handleFunctionChange = (value, rowId) => {
    // When user selects function type in the last row, auto-add new row
    if (rowId === rows[rows.length - 1].id) {
      addRow();
    }
  };

  return (
    <div className="p-4 border rounded">
      <div className="flex justify-between items-center mb-3">
        <input
          placeholder="Quick Search"
          className="border px-3 py-2 rounded w-1/3"
        />
        <div className="flex items-center gap-2">
          <Button>Estimate Summary</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={addRow}>
            Add Function
          </Button>
        </div>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 font-inter font-medium text-gray-700">
              Function Name & Description{" "}
            </th>
            <th className="p-2  font-inter font-medium text-gray-700">
              Person
            </th>
            <th className="p-2 font-inter font-medium text-gray-700">Extra</th>
            <th className="p-2  font-inter font-medium text-gray-700">
              Rate (Per Plate)
            </th>
            <th className="p-2  font-inter font-medium text-gray-700">
              Total price
            </th>
            <th className="p-2 font-inter font-medium text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t">
              <td className="p-2">
                <div className="flex gap-3">
                  <select className="select w-60">
                    <option value="0">Select Action</option>
                    <option value="1">lunch</option>
                    <option value="2">Dinner</option>
                    <option value="3">Breakfast</option>
                  </select>
                </div>
              </td>
              <td className="p-2">
                <input
                  type="tel"
                  className="w-full border border-gray-300 text-xs px-1 py-1 rounded-sm"
                />
              </td>
              <td className="p-2">
                <input
                  type="tel"
                  className="w-full border border-gray-300 text-xs px-1 py-1 rounded-sm"
                />
              </td>
              <td className="p-2">
                <input
                  type="tel"
                  className="w-full border border-gray-300 text-xs px-1 py-1 rounded-sm"
                />
              </td>
              <td className="p-2">
                <input
                  type="tel"
                  className="w-full border border-gray-300 text-xs px-1 py-1 rounded-sm"
                />
              </td>
              <td className="p-2 text-center">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeRow(row.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
