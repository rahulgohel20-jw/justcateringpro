import React, { useState } from "react";
import {
  CloseOutlined,
  SaveOutlined,
  SendOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Select, Radio, Input } from "antd";
import { Download } from "lucide-react";

const { TextArea } = Input;

const QuotationFooter = () => {
  const [taxType, setTaxType] = useState("TDS");

  return (
    <>
      <div className="grid md:grid-cols-2 gap-3 mb-5">
        <div className="min-w-full">
          <h4 class="text-base font-semibold leading-none text-gray-900 mb-2">
            Customers Notes
            <span className="mandatory ms-0.5 text-base text-red-500 font-medium">
              *
            </span>
          </h4>
          <TextArea
            placeholder="Thanks for your Business..."
            autoSize={{ minRows: 7 }}
          />
        </div>
        <div className="min-w-full">
          <h4 class="text-base font-semibold leading-none text-gray-900 mb-2">
            Total Amount
          </h4>
          <div className="border rounded-lg min-w-full p-4">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-10 mb-2">
                <Radio.Group
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value)}
                >
                  <Radio value="TDS">TDS</Radio>
                  <Radio value="TCS">TCS</Radio>
                </Radio.Group>
                <Select
                  placeholder="Select Tax"
                  className="w-32"
                  options={[
                    { value: "gst5", label: "GST 5%" },
                    { value: "gst12", label: "GST 12%" },
                  ]}
                />
              </div>
              <span className="font-semibold">0.0</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-sm text-gray-900">Adjustment Amount</span>
                <Input className="w-28 text-right" defaultValue="0.0" />
              </div>
              <span className="font-semibold">0.0</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span className="text-base text-primary">Total Amount</span>
              <span className="text-base text-primary">0.0</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3 mb-5">
        <div className="min-w-full">
          <div className="p-3 border rounded-lg whitespace-pre-line text-sm">
            <h4 class="text-base font-semibold leading-none text-gray-900 mb-2">
              Terms & Conditions
              <span className="mandatory ms-0.5 text-base text-red-500 font-medium">
                *
              </span>
            </h4>
            HDFC BANK
            <em className="text-sm">
              {"\n"}AC NO. :- 50200013422306
              {"\n"}BRANCH :- DARPAN SIX ROAD
              {"\n"}IFSC CODE :- HDFC0001678
              {"\n"}AC NAME :- SHREE INFOTECH
            </em>
          </div>
        </div>
        <div className="min-w-full">
          <div className="border rounded-lg min-w-full h-full p-4">
            <h4 class="text-base font-semibold leading-none text-gray-900 mb-2">
              Attach File(s) to Invoice
            </h4>
            <Button
              icon={<UploadOutlined />}
              className="mb-1 border-gray-300 text-primary"
            >
              Upload File
            </Button>
            <p className="text-xs text-gray-500">
              You can upload maximum 10mb file
            </p>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <button class="btn btn-light" title="Cancel">
          Cancel
        </button>
        <button class="btn btn-primary" title="Save & Send">
          <i class="ki-outline ki-paper-plane"></i>
          Save & Send
        </button>
        <button class="btn btn-success" title="Save as Draft">
          <i class="ki-outline ki-printer"></i> Save as Draft
        </button>
      </div>
      {/* <div className="space-y-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
        <div className="p-4 mt-5 flex items-center justify-between gap-8 w-fit shadow-[4px_4px_17px_2px_rgba(0,0,0,0.25)] rounded-lg bg-white">
          <div className="w-full">
            <label className="block font-semibold mb-1">
              Terms & Conditions
              <span className="mandatory ms-0.5 text-base text-red-500 font-medium">
                *
              </span>
            </label>
          </div>
          <div className="flex flex-col gap-12 w-full">
            <div>
              <label className="block font-semibold mb-1"></label>
            </div>
            <div className="flex gap-8">
              <Button
                icon={<CloseOutlined />}
                className="border border-danger text-danger font-semibold rounded-lg 
                hover:!text-[#EF4444] hover:!border-[#DC2626] 
               flex items-center gap-2 shadow-md"
              >
                Cancel
              </Button>
              <Button
                icon={<SendOutlined />}
                className="bg-[#2563EB] text-white font-semibold rounded-lg 
               hover:!bg-[#1E40AF] flex items-center gap-2 shadow-md"
              >
                Save & Send
              </Button>
              <Button
                icon={<SaveOutlined />}
                className="bg-[#003366] text-white font-semibold rounded-lg 
               hover:!bg-[#2563EB] flex items-center gap-2 shadow-md"
              >
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default QuotationFooter;
