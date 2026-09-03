import { useState } from "react";
import { useLanguage } from "@/i18n";
import {
  ArrowLeftOutlined,
  MoreOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Tabs, Select, Avatar, Input, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import {
  KeenIcon,
  MenuIcon,
  MenuItem,
  MenuSeparator,
  MenuToggle,
  MenuLink,
  MenuSub,
  MenuTitle,
  Menu,
} from "@/components";

const { TextArea } = Input;
const { Option } = Select;

const LeadQuickView = ({ onClose, dropdown }) => {
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("details");
  const [notes, setNotes] = useState("");

  const tabItems = [
    {
      key: "details",
      label: "Lead Details",
    },
    {
      key: "followup",
      label: (
        <span className="flex items-center space-x-1">
          <span>Follow-Up</span>
          <span className="bg-[#A57353] text-white text-xs px-1.5 py-0.5 rounded ml-1">
            0
          </span>
        </span>
      ),
    },
    {
      key: "products",
      label: (
        <span className="flex items-center space-x-1">
          <span>Products</span>
          <span className="bg-[#A57353] text-white text-xs px-1.5 py-0.5 rounded ml-1">
            1
          </span>
        </span>
      ),
    },
  ];

  return (
    <div className="w-96 bg-white border-l border-gray-200 h-screen flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <ArrowLeftOutlined className="text-lg" />
          </button>
          <div>
            <h2 className="text-lg font-medium text-gray-900">L-174</h2>
            <p className="text-sm text-gray-500">demo</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {dropdown && (
            <Menu className="items-stretch">
              <MenuItem
                toggle="dropdown"
                trigger="click"
                dropdownProps={{
                  placement: isRTL() ? "bottom-start" : "bottom-end",
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: isRTL() ? [0, -10] : [0, 10], // [skid, distance]
                      },
                    },
                  ],
                }}
              >
                <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                  <KeenIcon icon="dots-vertical" />
                </MenuToggle>
                <MenuSub
                  className="menu-default"
                  rootClassName="w-full max-w-[200px]"
                >
                  <MenuItem onClick={() => setIsLeadModalOpen(true)}>
                    <MenuLink>
                      <MenuIcon>
                        <KeenIcon icon="ki-filled ki-notepad-edit" />
                      </MenuIcon>
                      <MenuTitle>Edit</MenuTitle>
                    </MenuLink>
                  </MenuItem>
                  <MenuItem>
                    <MenuLink>
                      <MenuIcon>
                        <KeenIcon icon="ki-filled ki-mouse-square" />
                      </MenuIcon>
                      <MenuTitle>Move To</MenuTitle>
                    </MenuLink>
                  </MenuItem>
                  <MenuItem onClick={() => setIsFollowUpModalOpen(true)}>
                    <MenuLink>
                      <MenuIcon>
                        <KeenIcon icon="ki-filled ki-share" />
                      </MenuIcon>
                      <MenuTitle>Add Follow Up</MenuTitle>
                    </MenuLink>
                  </MenuItem>
                  {/* <MenuItem>
                    <MenuLink>
                      <MenuIcon>
                        <KeenIcon icon="ki-filled ki-whatsapp" />
                      </MenuIcon>
                      <MenuTitle>Send Whatsapp</MenuTitle>
                    </MenuLink>
                  </MenuItem> */}
                  {/* <MenuItem>
                    <MenuLink>
                      <MenuIcon>
                        <KeenIcon icon="ki-filled ki-sms" />
                      </MenuIcon>
                      <MenuTitle>Send Email</MenuTitle>
                    </MenuLink>
                  </MenuItem> */}
                  <MenuItem onClick={() => setIsNoteModalOpen(true)}>
                    <MenuLink>
                      <MenuIcon>
                        <KeenIcon icon="ki-filled ki-note-2" />
                      </MenuIcon>
                      <MenuTitle>Add Notes</MenuTitle>
                    </MenuLink>
                  </MenuItem>
                  <MenuItem>
                    <MenuLink>
                      <MenuIcon>
                        <KeenIcon icon="ki-filled ki-copy" />
                      </MenuIcon>
                      <MenuTitle>Clone Lead</MenuTitle>
                    </MenuLink>
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem>
                    <MenuLink path="">
                      <MenuIcon>
                        <KeenIcon icon="ki-filled ki-trash" />
                      </MenuIcon>
                      <MenuTitle>Delete</MenuTitle>
                    </MenuLink>
                  </MenuItem>
                </MenuSub>
              </MenuItem>
            </Menu>
          )}
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="p-4"
      />

      <div className="flex-1 overflow-y-auto">
        {activeTab === "details" && (
          <div className="p-4 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Pipeline</span>
                <span className="text-sm text-black font-medium">
                  Sales Pipeline
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Stage</span>
                <Select
                  defaultValue="new-inquiry"
                  className="w-32"
                  size="small"
                  suffixIcon={<span className="text-gray-400">▼</span>}
                >
                  <Option value="new-inquiry">New Inquiry</Option>
                </Select>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Assigned To</span>
                <div className="flex items-center space-x-2">
                  <Avatar
                    size={24}
                    className="bg-blue-100 text-blue-600 text-xs"
                  >
                    M
                  </Avatar>
                  <span className="text-sm text-gray-900">Manan Gandhi</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Amount</span>
                <span className="text-sm text-gray-900">10000</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Source</span>
                <span className="text-sm text-gray-900">Referral</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Closing at</span>
                <span className="text-sm text-gray-900">13/8/2025</span>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium text-[#A57353] mb-4">
                Contact Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-black">Name</span>
                  <span className="text-sm text-gray-900">Ravi</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-black">Email</span>
                  <span className="text-sm text-gray-900">Email</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-black">Contact No</span>
                  <span className="text-sm text-gray-900">9978744704</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-black">Created at</span>
                  <span className="text-sm text-gray-900">a day ago</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-black">Updated at</span>
                  <span className="text-sm text-gray-900">a day ago</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium text-[#A57353] mb-4">
                Notes
              </h3>
              <div className="border border-gray-200 rounded-lg p-3 min-h-32 bg-gray-50">
                <TextArea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add Notes..."
                  className="bg-transparent resize-none"
                  rows={6}
                  style={{
                    padding: 0,
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "followup" && (
          <div className="p-4">
            <div className="text-center text-gray-500 mt-8">
              <CalendarOutlined className="text-5xl text-gray-300 mb-4" />
              <p className="text-sm">No follow-ups scheduled</p>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="flex items-center gap-4 p-4">
            <div className="w-full bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Product 1
                </span>
                <span className="text-sm text-black">₹10,000</span>
              </div>
              <p className="text-xs text-gray-500">Added a day ago</p>
            </div>
            <span>
              <DeleteOutlined className="text-[#FF4141]" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export { LeadQuickView };
