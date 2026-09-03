import InvoiceList from "@/components/InvoiceTable/InvoiceList";
import InvoiceDetail from "@/components/InvoiceTable/InvoiceDetail";
import { Button, Dropdown, Menu, Upload } from "antd";

import {
  EditOutlined,
  ShareAltOutlined,
  SendOutlined,
  PrinterOutlined,
  DollarCircleOutlined,
  MoreOutlined,
  UploadOutlined,
} from "@ant-design/icons";

export default function InvoiceViewPage() {
  const menu = (
    <Menu
      items={[
        { key: "1", label: "Delete" },
        { key: "2", label: "save" },
      ]}
    />
  );
  return (
    <div className="p-4 flex">
      <InvoiceList />
      <div className="p-4 flex flex-col gap-4 items-center w-full">
        <div className="flex items-center justify-between gap-2 w-full">
          <span className="text-lg font-bold text-[#004986]">INV – 0001</span>
        </div>

        <div className="flex items-center  w-full gap-2  ps-4">
          <Button
            icon={<ShareAltOutlined className="text-[#00447A]" />}
            className="rounded-lg border font-bold  shadow-[4px_4px_17px_2px_rgba(0,0,0,0.15)] text-[#00447A] w-[110px]"
          >
            Share
          </Button>
          <Button
            icon={<SendOutlined className="text-[#8B5300]" />}
            className="rounded-lg border font-bold  shadow-[4px_4px_17px_2px_rgba(0,0,0,0.15)] text-[#8B5300] w-[110px]"
          >
            Send
          </Button>
          <Button
            icon={<PrinterOutlined className="text-[#5D006D]" />}
            className="rounded-lg border font-bold  shadow-[4px_4px_17px_2px_rgba(0,0,0,0.15)] text-[#5D006D] w-[110px]"
          >
            Print
          </Button>
          <Button
            icon={<DollarCircleOutlined className="text-[#00534B]" />}
            className="rounded-lg border font-bold  shadow-[4px_4px_17px_2px_rgba(0,0,0,0.15)] text-[#00534B]  w-[170px]"
          >
            Record Payment
          </Button>
        </div>

        <div className="border border-dashed mb-4 border-[#0000001A] w-full mt-4"></div>

        <div>
          <InvoiceDetail />
        </div>
      </div>
    </div>
  );
}
