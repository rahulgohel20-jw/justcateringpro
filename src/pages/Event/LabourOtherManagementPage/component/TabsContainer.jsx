import { Tabs } from "antd";
import LabourTab from "./LabourTab";
import ExtraExpenseTab from "./ExtraExpenseTab";
import MainTab from "./../component/MainTab";

const TabsContainer = ({ eventId }) => {
  const items = [
    { key: "labour", label: "Labour", children: <LabourTab eventId={eventId} /> },
    { key: "expense", label: "Extra Expense", children: <ExtraExpenseTab eventId={eventId} /> },
    { key: "main", label: "Main", children: <MainTab eventId={eventId} /> },
  ];

  return <Tabs defaultActiveKey="labour" items={items} />;
};

export default TabsContainer;
