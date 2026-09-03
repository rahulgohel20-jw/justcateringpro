import { useEffect, useState } from "react";
import { Tabs, Form, Button, message } from "antd";
import useMenuApi from "../hooks/useMenuApi";
import allocationTabsConfig from "../config/allocationTabsConfig";
import RenderAllocationFields from "./RenderAllocationFields";
import { AddMenuItems, UpdateMenuItem } from "@/services/apiServices";
import { buildPayload } from "../utils/buildMenuPayload";
import AddContactName from "../components/AddContactName";
import PlaceSelect from "../../../../components/PlaceSelect/PlaceSelect";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AllocationConfig = ({ form, onPrev, menuDetails, isEdit, editData }) => {
  const userId = localStorage.getItem("userId");
  const { getUnits, getContactCategory, getContactNames, getPartyByCategory } =
    useMenuApi(userId);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chef");
  const [isSaveOnly, setIsSaveOnly] = useState(false);

  const [chefunit, setChefunit] = useState([]);
  const [contact, setContact] = useState([]);
  const [chefNames, setChefNames] = useState([]);
  const [outsideName, setOutsideName] = useState([]);
  const [insideCookNames, setInsideCookNames] = useState([]);
  const [concatId, setConcatId] = useState(null);
  const [pendingEditValues, setPendingEditValues] = useState(null);
  const orderType = Form.useWatch("counter wise", form);

  // 1️⃣ Load all dropdown options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const unitRes = await getUnits();
        const units =
          unitRes?.data?.data?.["Unit Details"]?.map((i) => ({
            unitid: i.id,
            unitname: i.nameEnglish,
          })) || [];
        
        setChefunit(units);
      } catch (e) {
        console.error("❌ [Units failed]", e);
      }

      try {
        const contactRes = await getContactCategory();
        const contacts =
          contactRes?.data?.data?.["Contact Category Details"]?.map((i) => ({
            contactid: i.id,
            contactName: i.nameEnglish,
          })) || [];
       
        setContact(contacts);
      } catch (e) {
        console.error("❌ [Contact Categories failed]", e);
      }

      try {
        const chefRes = await getContactNames(5);
        const names =
          chefRes?.data?.data?.["Party Details"]?.map((i) => ({
            id: i.id,
            name: i.nameEnglish,
             price: i.price,
      helperPrice: i.helperPrice,
      counterPrice: i.counterPrice,
          })) || [];
        
        setChefNames(names);
      } catch (e) {
        console.error("❌ [Chef Names failed]", e);
      }

      try {
        const insideRes = await getContactNames(7);
        const names =
          insideRes?.data?.data?.["Party Details"]?.map((i) => ({
            id: i.id,
            name: i.nameEnglish,
            number: i.mobileno,
          })) || [];
        
        setInsideCookNames(names);
      } catch (e) {
        console.error("❌ [Inside Cook Names failed]", e);
      }
    };

    loadOptions();
  }, [getUnits, getContactCategory, getContactNames]);

  // 2️⃣ Set correct active tab from editData
  useEffect(() => {
    if (!isEdit || !editData) return;
    const alloc = editData.menuItemAllocationConfigs;
    if (!alloc) return;

    if (alloc.selectOutsideAgency) {
     
      setActiveTab("outside");
    } else if (alloc.selectChefLabourAgency) {
      
      setActiveTab("chef");
    } else if (alloc.selectInsideAgency) {
      
      setActiveTab("inside");
    } else {
      console.warn("⚠️ [Tab] No agency selected in editData alloc:", alloc);
    }
  }, [isEdit, editData]);

  // 3️⃣ Fetch outside party names + inject saved party if missing
  useEffect(() => {
    if (!isEdit || !editData) return;
    const alloc = editData.menuItemAllocationConfigs;
    if (!alloc?.outsideItem?.contactCategory?.id) return;

    const fetchAndMerge = async () => {
      try {
        const catId = alloc.outsideItem.contactCategory.id;
      

        const res = await getPartyByCategory(catId);
        const parties =
          res?.data?.data?.["Party Details"]?.map((i) => ({
            partyId: i.id,
            partyName: i.nameEnglish,
          })) || [];

        

        const savedParty = alloc.party;
        const alreadyInList = parties.some((p) => p.partyId === savedParty?.id);
       

        if (savedParty && !alreadyInList) {
          parties.push({
            partyId: savedParty.id,
            partyName: savedParty.nameEnglish,
          });
         
        }

        setOutsideName(parties);
      } catch (e) {
        console.error("❌ [Outside] fetchAndMerge failed", e);
        message.error("Failed to load contact names");
      }
    };

    fetchAndMerge();
  }, [isEdit, editData]);

useEffect(() => {
  if (!isEdit || !editData) return;
  const alloc = editData.menuItemAllocationConfigs;
  if (!alloc) return;

  const values = {};

  // Venue
  if (alloc.godownLocation === "AT VENUE") {
    values.venue = "venue";
  } else {
    values.venue = alloc.godownId || alloc.godownLocation;
  }

  if (alloc.selectChefLabourAgency && alloc.chefLabourItem) {
  values["counter wise"]    = alloc.chefLabourItem.allocation_type;
  values.counterno          = alloc.chefLabourItem.counterNo;
  values.chef_price         = alloc.chefLabourItem.pricePerLabour;
  values.pricePerHelper     = alloc.chefLabourItem.pricePerHelper;
  values.helperNo           = alloc.chefLabourItem.helperNo;       
          
  values.chef_contactName   = alloc.party?.id;
  values.chef_remarks       = alloc.remarks;
}

  // Outside Agency
  if (alloc.selectOutsideAgency && alloc.outsideItem) {
    values.qty                  = alloc.outsideItem.quantityPer100Person;
    values.unit                 = alloc.outsideItem.unit?.id;
    values.outside_price        = alloc.outsideItem.pricePerHelper;
    values.contactCategory      = alloc.outsideItem.contactCategory?.id;
    values.outside_contactName  = alloc.party?.id;
    values.outside_remarks      = alloc.remarks;
  }

  // Inside Agency
  if (alloc.selectInsideAgency && alloc.insideItem) {
    values.chef_name   = alloc.party?.id;
    values.chef_number = alloc.party?.mobileno;
    values.remarks     = alloc.remarks;
  }

  setPendingEditValues(values);
}, [isEdit, editData, menuDetails]);

  // 5️⃣ Apply form values only when all required options are loaded
  useEffect(() => {
    if (!pendingEditValues) return;
    const alloc = editData?.menuItemAllocationConfigs;
    if (!alloc) return;

   

    if (alloc.selectOutsideAgency) {
      if (chefunit.length === 0) {
      
        return;
      }
      if (contact.length === 0) {
    
        return;
      }
      if (alloc.outsideItem?.contactCategory?.id && outsideName.length === 0) {
       
        return;
      }
    }
    if (alloc.selectChefLabourAgency && chefNames.length === 0) {
      
      return;
    }
    if (alloc.selectInsideAgency && insideCookNames.length === 0) {
      
      return;
    }

   

    setTimeout(() => {
      form.setFieldsValue(pendingEditValues);
      const set = form.getFieldsValue();
      
      setPendingEditValues(null);
    }, 100);
  }, [
    pendingEditValues,
    chefunit,
    contact,
    outsideName,
    chefNames,
    insideCookNames,
  ]);

  const fetchChefcontactname = async (catTypeId) => {
    try {
      const res = await getPartyByCategory(catTypeId);
      const parties =
        res?.data?.data?.["Party Details"]?.map((i) => ({
          partyId: i.id,
          partyName: i.nameEnglish,
        })) || [];
     
      setOutsideName(parties);
    } catch {
      message.error("Failed to load contact names");
    }
  };

  const refreshData = async () => {
    try {
      const [unitRes, contactRes, chefRes, insideRes] = await Promise.all([
        getUnits(),
        getContactCategory(),
        getContactNames(5),
        getContactNames(7),
      ]);
      setChefunit(
        unitRes?.data?.data?.["Unit Details"]?.map((item) => ({
          unitid: item.id,
          unitname: item.nameEnglish,
        })) || [],
      );
      setContact(
        contactRes?.data?.data?.["Contact Category Details"]?.map((item) => ({
          contactid: item.id,
          contactName: item.nameEnglish,
        })) || [],
      );
      setChefNames(
        chefRes?.data?.data?.["Party Details"]?.map((item) => ({
          id: item.id,
          name: item.nameEnglish,
          number: item.mobileno,
           price: item.price,
    helperPrice: item.helperPrice,
    counterPrice: item.counterPrice,
        })) || [],
      );
      setInsideCookNames(
        insideRes?.data?.data?.["Party Details"]?.map((item) => ({
          id: item.id,
          name: item.nameEnglish,
          number: item.mobileno,
        })) || [],
      );
    } catch (error) {
      console.error(error);
      message.error("Failed to refresh data");
    }
  };

  const handleAddContact = (fieldName) => {
    switch (fieldName) {
      case "chef_contactName":
        setConcatId(5);
        break;
      case "outside_contactName":
        setConcatId(6);
        break;
      case "chef_name":
        setConcatId(7);
        break;
      default:
        return;
    }
    setIsMemberModalOpen(true);
  };

  
  const formatAllocationFields = (v) => {
   

    const allocation = {
      id:
        isEdit && editData?.menuItemAllocationConfigs?.id
          ? editData.menuItemAllocationConfigs.id
          : 0,
      godownLocation: v.venue === "venue" ? "AT VENUE" : "GO DOWN",
      godownId: v.venue !== "venue" ? v.venue : null,

      
      selectChefLabourAgency: false,
      selectOutsideAgency: false,
      selectInsideAgency: false,

      
      remarks: "",
      partyId: null,

      
      chefLabourItem: null,
      outsideItem: null,
      insideItem: null,
    };

if (activeTab === "chef") {
  allocation.selectChefLabourAgency = true;
  allocation.partyId = v.chef_contactName || null;
  allocation.remarks = v.chef_remarks || "";
  allocation.chefLabourItem = {
    id: isEdit && editData?.menuItemAllocationConfigs?.chefLabourItem?.id
      ? editData.menuItemAllocationConfigs.chefLabourItem.id : 0,
    allocation_type: v["counter wise"] || "plate_wise",
    counterNo:       Number(v.counterno) || 0,       // Pax in plate_wise
    pricePerLabour:  Number(v.chef_price) || 0,      // Price in plate_wise
    pricePerHelper:  v["counter wise"] === "counter_wise"
      ? Number(v.pricePerHelper) || 0 : 0,
    helperNo:        v["counter wise"] === "counter_wise"
      ? Number(v.helperNo) || 0 : 0,
    
  };
} else if (activeTab === "outside") {
 
      allocation.selectOutsideAgency = true;
      allocation.partyId = v.outside_contactName || null;
      allocation.remarks = v.outside_remarks || "";
      allocation.outsideItem = {
        id:
          isEdit && editData?.menuItemAllocationConfigs?.outsideItem?.id
            ? editData.menuItemAllocationConfigs.outsideItem.id
            : 0,
        quantityPer100Person: Number(v.qty) || 0,
        unitId: v.unit,
        pricePerHelper: Number(v.outside_price) || 0,
        contactCategoryId: v.contactCategory,
      };
   
    } else if (activeTab === "inside") {
    
      allocation.selectInsideAgency = true;
      allocation.partyId = v.chef_name || null;
      allocation.remarks = v.remarks || "";
      allocation.insideItem = {
        id:
          isEdit && editData?.menuItemAllocationConfigs?.insideItem?.id
            ? editData.menuItemAllocationConfigs.insideItem.id
            : 0,
        number: v.chef_number || null,
      };
      
    }

    

    return allocation;
  };

  const handlePrevious = () => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    onPrev();
  };

  const onFinish = async (values) => {
    
    try {
      const allocationObject = formatAllocationFields(values);
      const formData = buildPayload(menuDetails, allocationObject);
      

      let apiRes = isEdit
        ? await UpdateMenuItem(editData.id, formData)
        : await AddMenuItems(formData);

      const data = apiRes?.data;
      const success = data?.success;

      

      Swal.fire({
        title: success ? "Success!" : "Failed",
        icon: success ? "success" : "error",
        text: data?.msg,
      });
      if (success) navigate("/master/menu-item");
    } catch (error) {
      console.error("❌ [onFinish] Save error:", error);
      Swal.fire({
        title: "Error",
        icon: "error",
        text: error?.response?.data?.message || "Failed to save",
      });
    }
  };


const chefFields = allocationTabsConfig.chef.map((f) => {
  if (f.name === "chef_contactName") {
    return {
      ...f,
      options: chefNames.map((i) => ({ label: i.name, value: i.id })),
      onChange: (val) => {
        const selected = chefNames.find((i) => i.id === val);
        if (!selected) return;

        const orderTypeVal = form.getFieldValue("counter wise");
        // Plate-wise → "Price" (party.price); Counter-wise → "Price Per Labour" (party.counterPrice)
        const chefPriceValue =
          orderTypeVal === "counter_wise" ? selected.counterPrice : selected.price;

        form.setFieldsValue({
          chef_contactName: val,
          chef_price: chefPriceValue ?? 0,
          pricePerHelper: selected.helperPrice ?? 0,
        });
      },
    };
  }
  return f;
});

  const outsideFields = allocationTabsConfig.outside.map((f) => {
    if (f.name === "unit") {
      return {
        ...f,
        options: chefunit.map((u) => ({ label: u.unitname, value: u.unitid })),
      };
    }
    if (f.name === "contactCategory") {
      return {
        ...f,
        options: contact.map((c) => ({
          label: c.contactName,
          value: c.contactid,
        })),
        onChange: (val) => {
          fetchChefcontactname(val);
          form.setFieldsValue({
            contactCategory: val,
            outside_contactName: undefined,
          });
        },
      };
    }
    if (f.name === "outside_contactName") {
      return {
        ...f,
        options: outsideName.map((i) => ({
          label: i.partyName,
          value: i.partyId,
        })),
      };
    }
    return f;
  });

  const insideFields = allocationTabsConfig.inside.map((f) =>
    f.name === "chef_name"
      ? {
          ...f,
          options: insideCookNames.map((i) => ({ label: i.name, value: i.id })),
          onChange: (val) => {
            const selected = insideCookNames.find((i) => i.id === val);
            if (selected)
              form.setFieldsValue({
                chef_name: val,
                chef_number: selected.number,
              });
          },
        }
      : f,
  );
  const getActiveTabFieldNames = () => {
    const alwaysInclude = ["venue"];


if (activeTab === "chef") {
  const fields = [...alwaysInclude, "counter wise", "counterno", "chef_price",
    "chef_contactName", "chef_remarks"];
  const orderType = form.getFieldValue("counter wise");
  if (orderType === "counter_wise") {
    fields.push("pricePerHelper", "helperNo");
  }
  
  return fields;
}
    if (activeTab === "outside") {
      return [
        ...alwaysInclude,
        "qty",
        "unit",
        "outside_price",
        "contactCategory",
        "outside_contactName",
        "outside_remarks",
      ];
    }
    if (activeTab === "inside") {
      return [...alwaysInclude, "chef_name", "chef_number", "remarks"];
    }
    return alwaysInclude;
  };

  return (
    <div className="mt-6">
      <Form layout="vertical" form={form}>
        <Form.Item
          label={<span className="text-[#6A7C94] font-medium">Venue</span>}
          name="venue"
        >
          <PlaceSelect
            value={form.getFieldValue("venue")}
            onChange={(value) => form.setFieldsValue({ venue: value })}
          />
        </Form.Item>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            
            setActiveTab(key);
          }}
        >
          <Tabs.TabPane tab="Chef Agency" key="chef">
            <RenderAllocationFields
              fields={chefFields}
              onAddClick={handleAddContact}
              form={form}
              watchValues={{ "counter wise": orderType }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Outsource Agency" key="outside">
            <RenderAllocationFields
              fields={outsideFields}
              onAddClick={handleAddContact}
              form={form}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Inside Chef / Kitchen" key="inside">
            <RenderAllocationFields
              fields={insideFields}
              onAddClick={handleAddContact}
              form={form}
            />
          </Tabs.TabPane>
        </Tabs>

        <div className="flex justify-between pt-4 mb-6">
          <Button onClick={handlePrevious}>Previous</Button>
          <Button
            type="primary"
            onClick={async () => {
              
              setIsSaveOnly(true);

              try {
                // ✅ Only validate the active tab's fields, not all fields
                const activeFields = getActiveTabFieldNames();
               

                const values = await form.validateFields(activeFields);
             

                // Also grab venue which is always needed
                const allValues = form.getFieldsValue();
                await onFinish({ ...allValues, ...values });
              } catch (err) {
                console.warn("❌ [Save] Validation failed:", err);
              }
            }}
          >
            {isEdit ? "Update" : "Save"}
          </Button>
        </div>
      </Form>

      <AddContactName
        isModalOpen={isMemberModalOpen}
        setIsModalOpen={setIsMemberModalOpen}
        concatId={concatId}
        refreshData={refreshData}
      />
    </div>
  );
};

export default AllocationConfig;
