import { Input, DatePicker, Radio, Select } from "antd";
import dayjs from "dayjs";

export const columns = [
  {
    accessorKey: "sr_no",
    header: "#",
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
  {
    accessorKey: "item_name",
    header: "Menu Item Name",
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
  {
    accessorKey: "agency_order",
    header: "Inside/Agency Order",
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
  {
    accessorKey: "date_time",
    header: "Date & Time",
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
  {
    accessorKey: "person",
    header: "Person",
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
  {
    accessorKey: "place",
    header: "Place",
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
];

export const defaultData = [
  {
    sr_no: "1",
    item_name: "STRAWBERRY BLACK GRAPES",
    agency_order: (
      <Radio.Group defaultValue="Outside Food">
        <Radio value="Chef Labour">Chef Labour</Radio>
        <Radio value="Outside Food">Outside Food</Radio>
        <Radio value="Inside">Inside</Radio>
      </Radio.Group>
    ),
    date_time: (
      <DatePicker
        showTime
        defaultValue={dayjs("2025-07-30 06:00", "YYYY-MM-DD HH:mm")}
        format="DD/MM/YYYY HH:mm"
      />
    ),
    person: <Input defaultValue={400} />,
    place: (
      <Select defaultValue="At Ven" style={{ width: 100 }}>
        <Option value="At Ven">At Ven</Option>
        <Option value="Other">Other</Option>
      </Select>
    ),
  },
];
