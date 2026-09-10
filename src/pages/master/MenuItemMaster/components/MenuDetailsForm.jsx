import { useEffect, useRef, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  message,
} from "antd";
import {
  InboxOutlined,
  ReloadOutlined,
  DeleteOutlined,
  PlusOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { defaultData } from "../constant";
import useMenuApi from "../hooks/useMenuApi";
import useRecipe from "../hooks/useRecipe";
import RawMaterialTable from "./RawMaterialTable";
import { Spin } from "antd";
import { buildPayload } from "../utils/buildMenuPayload";
import {
  AddMenuItems,
  Translateapi,
  UpdateMenuItem,
  deleteRawmatrialcatidInmenuitem,
  GetRawmaterialItemByRecipe,
  GETallGodown,
  getallcaptainrecipe,
  getCaptainReceipeById,
  Getunit,
  getMenuItemCaptainReceipeByMenuId,
} from "@/services/apiServices";
import AddMenuCategory from "@/partials/modals/add-menu-category/AddMenuCategory";
import AddMenuSubCategory from "@/partials/modals/add-menu-sub-category/AddMenuSubCategory";
import AddRawMaterial from "@/partials/modals/add-raw-material/AddRawMaterial";
import { useNavigate } from "react-router-dom";
import CopyRecipe from "../../../../partials/modals/CopyRecipe/CopyRecipe";
import Swal from "sweetalert2";
import useCaptainRecipe from "../hooks/useCaptainRecipe";
import MultiLangInputBox from "@/components/form-inputs/MultiLangInputBox";
import { useModuleAccess } from "@/hooks/useModuleAccess";
const { Dragger } = Upload;
const { TextArea } = Input;

const MenuDetailsForm = ({
  form,
  onNext,
  setMenuDetails,
  isEdit,
  editData,
}) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [englishName, setEnglishName] = useState("");
  const translateTimerRef = useRef(null);
  const [godownsLoaded, setGodownsLoaded] = useState(false);
  const [rawSearchText, setRawSearchText] = useState("");
  const getLangConfig = () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth-storage"));
      const lang = auth?.state?.user?.lang || "Gujarati";
      const langMap = {
        Gujarati: { label: "Name (ગુજરાતી)", apiKey: "gujarati" },
        Tamil: { label: "Name (தமிழ்)", apiKey: "ta" },
        Telugu: { label: "Name (తెలుగు)", apiKey: "te" },
        Malayalam: { label: "Name (മലയാളം)", apiKey: "ml" },
        Marathi: { label: "Name (मराठी)", apiKey: "mr" },
      };
      return langMap[lang] || langMap["Gujarati"];
    } catch {
      return { label: "Name (ગુજરાતી)", apiKey: "gujarati" };
    }
  };

  const langConfig = getLangConfig();
const { hasModuleAccess } = useModuleAccess();
  const canAccesscaptainRecipe = hasModuleAccess("Captain Recipe");
  const { getRawMaterial, getCategories, getSubCategories } =
    useMenuApi(userId);

  const [fileList, setFileList] = useState([]);
  const [menuCategory, setMenuCategory] = useState([]);
  const [menuSubCategory, setMenuSubCategory] = useState([]);
  const [rawmaterialList, setRawmaterialList] = useState([]);
  const [isSaveOnly, setIsSaveOnly] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [isRawMaterialModalOpen, setIsRawMaterialModalOpen] = useState(false);
  const [isCopyRecipe, setIsCopyRecipe] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [godownOptions, setGodownOptions] = useState([]);
  const [rawMaterialLoading, setRawMaterialLoading] = useState(false);
  const {
    captainTableData,
    setCaptainTableData,
    filteredCaptainData,
    captainSearchTerm,
    setCaptainSearchTerm,
    selectedCaptainRows,
    setSelectedCaptainRows,
    selectedCaptainRecipe,
    setSelectedCaptainRecipe,
    captainWeight,
    setCaptainWeight,
    captainUnit,
    setCaptainUnit,
    handleAddCaptainItems,
    handleDeleteCaptainRow,
    handleEditCaptainRow,
    editingCaptainRow,
    handleCancelCaptainEdit,
  } = useCaptainRecipe();
  const [captainRecipeOptions, setCaptainRecipeOptions] = useState([]);
  const [captainRecipeLoading, setCaptainRecipeLoading] = useState(false);
  const {
    tableData,
    setTableData,
    filteredTableData,
    searchTerm,
    setSearchTerm,
    selectedRaw,
    setSelectedRaw,
    weight,
    setWeight,
    unit,
    setUnit,
    unitOptions,
    setUnitOptions,
    totalRate,
    dishCosting,
    handleAddRecipe,
    handleDeleteRow,
    handleEditRow,
  } = useRecipe(rawmaterialList, defaultData, captainTableData);
  const [captainUnitOptions, setCaptainUnitOptions] = useState([]);
  const [englishInstruction, setEnglishInstruction] = useState("");
  // add these two states
const [nameGujarati, setNameGujarati] = useState("");
const [nameHindi, setNameHindi] = useState("");
const [instructionGujarati, setInstructionGujarati] = useState("");
const [instructionHindi, setInstructionHindi] = useState("");
  const instructionTimerRef = useRef(null);
  const hasLoadedEditData = useRef(false);


const [isCopyCaptainRecipe, setIsCopyCaptainRecipe] = useState(false); 

  useEffect(() => {
    setIsSaveOnly(false);
  }, [onNext]);

  useEffect(() => {
    if (!userId) return; 
    const loadCaptainRecipes = async () => {
      try {
        setCaptainRecipeLoading(true);
        const res = await getallcaptainrecipe(userId, true);
        const list = res?.data?.data || [];
        setCaptainRecipeOptions(
          list.map((c) => ({
            value: c.id,
            label: c.name,
            raw: c,
          })),
        );
      } catch (err) {
        console.error("Failed to load captain recipes:", err);
        message.error("Failed to load captain recipes");
      } finally {
        setCaptainRecipeLoading(false);
      }
    };

    loadCaptainRecipes();
  }, [userId]);

  useEffect(() => {
    if (!userId) return; 
    const loadInitial = async () => {
      setRawMaterialLoading(true);
      try {
        const [rawRes, catRes, godownRes] = await Promise.all([
          getRawMaterial(),
          getCategories(),
          GETallGodown(userId),
        ]);

        const rawData =
          rawRes?.data?.data?.["Raw Material Details"]?.map((item) => ({
            rawMaterialId: item?.id,
            category: item?.rawMaterialCat?.nameEnglish,
            name: item?.nameEnglish,
            unitId: item.unit?.id,
            unit: item.unit?.nameEnglish,
            supplierRate: item.supplierRate,
            unitHierarchy: item.unitHierarchy,
          })) || [];
        setRawmaterialList(rawData);

        const catData =
          catRes?.data?.data?.["Menu Category Details"]?.map((item) => ({
            menuid: item.id,
            menuName: item.nameEnglish,
          })) || [];
        setMenuCategory(catData);

        const godownData = [
          { value: 0, label: "At Venue" },
          ...(godownRes?.data?.data?.map((item) => ({
            value: item.id,
            label: item.nameEnglish,
          })) || []),
        ];
        setGodownOptions(godownData);
        setGodownsLoaded(true);
      } catch (error) {
        console.error(error);
        message.error("Failed to load initial data");
      }

      finally {
      setRawMaterialLoading(false);
       }
    };

    loadInitial();
  }, [getRawMaterial, getCategories]);

  useEffect(() => {
    if (!editData?.menuCategory?.id) return;
if (!userId) return; 
    const loadSubCategories = async () => {
      try {
        const res = await getSubCategories(editData.menuCategory.id);
        const data =
          res?.data?.data?.["Menu Sub Category Details"]?.map((item) => ({
            subid: item.id,
            subname: item.nameEnglish,
          })) || [];
        setMenuSubCategory(data);
      } catch (error) {
        console.error(error);
        message.error("Failed to load sub categories");
      }
    };

    loadSubCategories();
  }, [editData?.menuCategory?.id, getSubCategories]);

  useEffect(() => {
    if (!editData) return;
    // if (!godownsLoaded) return;
    // if (hasLoadedEditData.current) return;
    hasLoadedEditData.current = true;

    setEnglishName(editData.nameEnglish || "");
    setNameGujarati(editData.nameGujarati || "");           
setNameHindi(editData.nameHindi || "");                 
setEnglishInstruction(editData.instructionEnglish || "");
setInstructionGujarati(editData.instructionGujarati || ""); 
setInstructionHindi(editData.instructionHindi || ""); 
    form.setFieldsValue({
      nameEnglish: editData.nameEnglish,
      nameGujarati: editData.nameGujarati,
      nameHindi: editData.nameHindi,
      slogan: editData.slogan,
      price: editData.price,
      sequence: editData.sequence,
      category: Number(editData.menuCategory?.id),
      subCategory: editData.menuSubCategory?.id,
      remarks: editData.remarks,
      instructionEnglish: editData.instructionEnglish || "",
      instructionGujarati: editData.instructionGujarati || "",
      instructionHindi: editData.instructionHindi || "",
      imageUrl: editData.url || "",
    });
    setEnglishInstruction(editData.instructionEnglish || "");

    if (editData.imagePath) {
      const fileName = editData.imagePath.split("/").pop();
      setFileList([
        {
          uid: "-1",
          name: fileName,
          status: "done",
          url: editData.imagePath,
          thumbUrl: editData.imagePath,
        },
      ]);
    }

    if (editData.menuItemRawMaterials?.length > 0) {
      const mapped = editData.menuItemRawMaterials.map((rm, idx) => {
        const rawVenueId = rm?.godown?.id ?? rm?.venue ?? rm?.venueId;
        const resolvedVenueId =
          rawVenueId === "0" || rawVenueId === 0 || rawVenueId === null
            ? 0
            : Number(rawVenueId) || 0;
        const matchedGodown = godownOptions.find(
          (g) => g.value === resolvedVenueId,
        );
        const resolvedVenueName =
          resolvedVenueId === 0
            ? "At Venue"
            : matchedGodown?.label || rm?.godown?.nameEnglish || "";
        return {
          sr_no: idx + 1,
          menuRmId: rm?.id,
          category: rm.rawMaterial?.rawMaterialCat?.nameEnglish,
          rawMaterialId: rm?.rawMaterial?.id,
          name: rm?.rawMaterial?.nameEnglish,
          weight: rm?.weight,
          unitId: rm?.unit?.id,
          unit: rm?.unit?.nameEnglish,
          supplierRate: rm.rawMaterial.supplierRate,
          rate: rm.rate,
          venueId: resolvedVenueId,
          venue: resolvedVenueName,
           isVisible: rm?.isVisible !== false,
        };
      });
      setTableData(mapped);
    }

    if (editData.menuItemCaptainReceipe?.length > 0) {
      const mappedCaptain = editData.menuItemCaptainReceipe.map((cr, idx) => {
        const rawVenueId = cr?.venue ?? cr?.venueId;
        const resolvedVenueId =
          rawVenueId === "0" ||
          rawVenueId === 0 ||
          rawVenueId === "At venue" ||
          rawVenueId === null
            ? 0
            : Number(rawVenueId) || 0;
        const matchedGodown = godownOptions.find(
          (g) => g.value === resolvedVenueId,
        );
        const resolvedVenueName =
          resolvedVenueId === 0
            ? "At Venue"
            : matchedGodown?.label || `Godown ${resolvedVenueId}`;

        return {
          sr_no: idx + 1,
          id: cr.id,
          captainReceipeId: cr.captainReceipeMaster?.id,
          name: cr.captainReceipeMaster?.name,
          category: "Gravy",
          weight: cr.weight,
          unitId: cr.unitId,
          unit: cr.unitName || cr.unitHierarchy?.nameEnglish || "", // ← fix
          rate: cr.rate ?? 0,
          venueId: resolvedVenueId,
          venue: resolvedVenueName,
          isVisible: cr?.isVisible !== false,
        };
      });
      setCaptainTableData(mappedCaptain);
    }
  }, [
    editData,
    form,
    setTableData,
    setCaptainTableData,
    godownOptions,
    godownsLoaded,
  ]);
  const SyncRawMaterial = async () => {
    if (!editData?.id) {
      message.warning("No menu item selected for sync");
      return;
    }

    setLoadingItems(true);
    try {
      const res = await GetRawmaterialItemByRecipe(editData.id, userId, true);

      if (!res?.data?.success) {
        throw new Error(res?.data?.msg || "Failed to sync raw materials");
      }

      const rawMaterials = res?.data?.data?.menuItemRawMaterials || [];

      const syncedItems = rawMaterials.map((rm, idx) => ({
        sr_no: idx + 1,
        menuRmId: rm.id,
        rawMaterialId: rm.rawMaterial?.id,
        name: rm.rawMaterial?.nameEnglish,
        category: rm.rawMaterial?.rawMaterialCat?.nameEnglish,
        weight: rm.weight,
        unitId: rm.unit?.id,
        unit: rm.unit?.nameEnglish,
        supplierRate: rm.rawMaterial?.supplierRate,
        rate: rm.rate,
        venueId: rm?.godown?.id ?? null,
        venue: rm?.godown?.nameEnglish ?? "",
      }));

      if (syncedItems.length > 0) {
        setTableData(syncedItems);
        message.success(`Successfully Synced Raw Materials`);
      } else {
        message.info("No raw materials found to sync");
      }
    } catch (error) {
      console.error("Error syncing raw materials:", error);
      message.error(error.message || "Failed to sync raw materials");
    } finally {
      setLoadingItems(false);
    }
  };

  const SyncCaptainRecipe = async () => {
    if (!editData?.id) {
      message.warning("No menu item selected for sync");
      return;
    }

    setLoadingItems(true);
    try {
      const res = await getMenuItemCaptainReceipeByMenuId(
        editData.id,
        userId,
        true,
      );

      if (!res?.data?.success) {
        throw new Error(res?.data?.msg || "Failed to sync captain recipes");
      }

      const syncedItems = res?.data?.data?.menuItemRawMaterials || [];

      if (syncedItems.length === 0) {
        message.info("No data returned from sync");
        return;
      }

      // Build rate map keyed by record id
      const rateMapById = Object.fromEntries(
        syncedItems.map((item) => [item.id, item.rate ?? 0]),
      );

      setCaptainTableData((prev) =>
        prev.map((row) =>
          row.id in rateMapById ? { ...row, rate: rateMapById[row.id] } : row,
        ),
      );

      message.success("Captain recipe rates synced successfully");
    } catch (error) {
      console.error("Error syncing captain recipes:", error);
      message.error(error.message || "Failed to sync captain recipes");
    } finally {
      setLoadingItems(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    setRawMaterialLoading(true);
    try {
      const [rawRes, catRes, godownRes] = await Promise.all([
        getRawMaterial(),
        getCategories(),
        GETallGodown(userId),
      ]);

      const rawData =
        rawRes?.data?.data?.["Raw Material Details"]?.map((item) => ({
          rawMaterialId: item.id,
          category: item?.rawMaterialCat?.nameEnglish,
          name: item.nameEnglish,
          unitId: item.unit?.id,
          unit: item.unit?.nameEnglish,
          supplierRate: item.supplierRate,
          unitHierarchy: item.unitHierarchy,
        })) || [];
      setRawmaterialList(rawData);

      const catData =
        catRes?.data?.data?.["Menu Category Details"]?.map((item) => ({
          menuid: item.id,
          menuName: item.nameEnglish,
        })) || [];
      setMenuCategory(catData);

      const godownData = [
        { value: 0, label: "At Venue" },
        ...(godownRes?.data?.data?.map((item) => ({
          value: item.id,
          label: item.nameEnglish,
        })) || []),
      ];
      setGodownOptions(godownData);
      setGodownsLoaded(true);

      const selectedCategory = form.getFieldValue("category");
      if (selectedCategory) {
        handleCategoryChange(selectedCategory);
      }

      message.success("Data updated");
    } catch (error) {
      console.error("error");
      message.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
      setRawMaterialLoading(false);
    }
  };

  const handleVenueChange = (srNo, venueId, venueName) => {
    setTableData((prev) =>
      prev.map((row) =>
        row.sr_no === srNo ? { ...row, venueId, venue: venueName } : row,
      ),
    );
  };

  const handleVisibleChange = (srNo, isVisible) => {
    setTableData((prev) =>
      prev.map((row) =>
        row.sr_no === srNo ? { ...row, isVisible } : row,
      ),
    );
  };

  const handleCaptainVisibleChange = (srNo, isVisible) => {
  setCaptainTableData((prev) =>
    prev.map((row) =>
      row.sr_no === srNo ? { ...row, isVisible } : row,
    ),
  );
};

 const handleTranslate = async (value) => {
  if (!value?.trim()) {
    form.setFieldsValue({ nameGujarati: "", nameHindi: "" });
    setNameGujarati("");
    setNameHindi("");
    return;
  }
  try {
    const res = await Translateapi(value);
    const data = res?.data;
    const guj = data?.[langConfig.apiKey] || "";
    const hin = data?.hindi || "";
    form.setFieldsValue({ nameGujarati: guj, nameHindi: hin });
    setNameGujarati(guj);  // ← triggers re-render
    setNameHindi(hin);
  } catch (error) {
    message.error("Translation failed");
  }
};
  const handleTranslateInstruction = async (value) => {
  if (!value?.trim()) {
    form.setFieldsValue({ instructionGujarati: "", instructionHindi: "" });
    setInstructionGujarati("");
    setInstructionHindi("");
    return;
  }
  try {
    const res = await Translateapi(value);
    const data = res?.data;
    const guj = data?.[langConfig.apiKey] || "";
    const hin = data?.hindi || "";
    form.setFieldsValue({ instructionGujarati: guj, instructionHindi: hin });
    setInstructionGujarati(guj);
    setInstructionHindi(hin);
  } catch (error) {
    message.error("Instruction translation failed");
  }
};
  const handleCategoryChange = async (value) => {
    form.setFieldsValue({ subCategory: undefined });
    try {
      const res = await getSubCategories(value);
      const data =
        res?.data?.data?.["Menu Sub Category Details"]?.map((item) => ({
          subid: item.id,
          subname: item.nameEnglish,
        })) || [];
      setMenuSubCategory(data);
    } catch (error) {
      console.error("error");
      message.error("Failed to load sub categories");
    }
  };

  const handleUploadChange = ({ fileList: newList }) => {
    if (newList.length > 1) {
      const hasUploaded = newList.some((f) => f.originFileObj);
      if (hasUploaded) {
        newList = newList.filter((f) => f.originFileObj);
      }
    }
    setFileList(newList);
  };

  const handleRemoveFile = (file) => {
    setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  const handleRetry = () => {
    message.info("Retry upload logic can be added here.");
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      message.warning("Please select items to delete");
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete ${selectedRows.length} item(s)`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete!",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      const itemsWithId = selectedRows.filter((row) => row.menuRmId);

      if (itemsWithId.length > 0) {
        const menuRmIds = itemsWithId.map((row) => row.menuRmId);
        const payload = {
          id: menuRmIds,
        };

        await deleteRawmatrialcatidInmenuitem(payload);
      }

      // Remove all selected items from table
      const selectedSrNos = selectedRows.map((row) => row.sr_no);
      setTableData((prev) =>
        prev.filter((item) => !selectedSrNos.includes(item.sr_no)),
      );

      setSelectedRows([]);
      message.success(`Successfully deleted ${selectedRows.length} item(s)`);
    } catch (error) {
      console.error("error");
      message.error("Failed to delete items");
    }
  };

  const handleNext = () => {
    // Collect data without validation
    const newUpload = fileList.find((f) => f.originFileObj);
    const file = newUpload?.originFileObj || null;
    const shouldUploadImage = !!file;
    const allValues = form.getFieldsValue(true);
    const details = {
      ...allValues,
      recipes: tableData,
      captainRecipes: captainTableData,
      totalRate,
      dishCosting,
      file,
      shouldUploadImage,
    };

    if (isEdit && !file && editData?.imagePath) {
      details.removeImage = true;
    }

    setMenuDetails(details);
    onNext();
  };

  const onFinish = async (values) => {
    const newUpload = fileList.find((f) => f.originFileObj);
    const file = newUpload?.originFileObj || null;
    const shouldUploadImage = !!file;
    const allValues = form.getFieldsValue(true);
    const details = {
      ...allValues,
      recipes: tableData,
      captainRecipes: captainTableData,
      totalRate,
      dishCosting,
      file,
      shouldUploadImage,
    };

    if (isEdit && !file && editData?.imagePath) {
      details.removeImage = true;
    }

    setMenuDetails(details);

    try {
      // Now buildPayload returns FormData with file included
      const formData = buildPayload(details, {});
      let res;

      if (isEdit) {
        const id = editData.id;
        res = await UpdateMenuItem(id, formData);
      } else {
        res = await AddMenuItems(formData);
      }

      const data = res?.data;
      const success = data?.success === true;

      // No need for separate file upload anymore - it's already in FormData

      Swal.fire({
        title: success ? "Success!" : "Failed",
        text: data?.msg,
        icon: success ? "success" : "error",
      });

      if (success) navigate("/master/menu-item");
    } catch (error) {
      console.error("error");
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const handleCopyRecipe = (copiedItems) => {
    if (!copiedItems || copiedItems.length === 0) return;

    const newRows = copiedItems.map((rm, idx) => ({
      sr_no: tableData.length + idx + 1,
      menuRmId: 0,
      rawMaterialId: rm.rawmatrialId,
      name: rm.name,
      category: rm.category,
      weight: rm.weight,
      unitId: rm.unitId,
      unit: rm.unit,
      supplierRate: rm.supplierRate,
      rate: rm.rate,
      isVisible: true,
    }));

    setTableData((prev) => {
      const updated = [...newRows, ...prev];
      return updated.map((row, idx) => ({ ...row, sr_no: idx + 1 }));
    });
    message.success(`${newRows.length} item(s) copied`);
  };

  const handleCopyCaptainRecipe = (copiedItems) => {
  if (!copiedItems || copiedItems.length === 0) return;

  const newRows = copiedItems.map((rm, idx) => ({
    sr_no: captainTableData.length + idx + 1,
    id: 0,
    captainReceipeId: rm.captainReceipeId,
    name: rm.name,
    category: "Gravy",
    weight: rm.weight,
    unitId: rm.unitId,
    unit: rm.unit,
    rate: rm.rate ?? 0,
  }));

  setCaptainTableData((prev) => {
    const updated = [...newRows, ...prev];
    return updated.map((row, idx) => ({ ...row, sr_no: idx + 1 }));
  });
  message.success(`${newRows.length} item(s) copied`);
};

  const handleCancel = () => {
    navigate("/master/menu-item");
    form.resetFields();
    setFileList([]);
  };

  // In MenuDetailsForm.jsx — add this wrapper function near the captain section
  const handleEditCaptainRowWithFetch = async (row) => {
    // First set the basic edit state via the hook
    handleEditCaptainRow(row);

    // Then fetch the full recipe to rebuild captainUnitOptions properly
    try {
      setCaptainRecipeLoading(true);
      const res = await getCaptainReceipeById(row.captainReceipeId, false);
      const fullData = res?.data?.data;

      const hierarchy = fullData?.unitHierarchy;
      const unitList = hierarchy
        ? [
            { value: hierarchy.unitId, label: hierarchy.nameEnglish },
            ...(hierarchy.children?.map((child) => ({
              value: child.unitId,
              label: child.nameEnglish,
            })) || []),
          ]
        : [{ value: fullData.unitId, label: fullData.unitName || "" }];

      setCaptainUnitOptions(unitList);

      // Re-set captainUnit so the label resolves correctly from the fresh options
      const matchedUnit = unitList.find((u) => u.value === row.unitId);
      setCaptainUnit({ id: row.unitId, name: matchedUnit?.label || row.unit });
    } catch (err) {
      console.error("Failed to fetch captain recipe for edit:", err);
      // Fallback: build a minimal unit option from the row's own data
      const fallbackList = [{ value: row.unitId, label: row.unit }];
      setCaptainUnitOptions(fallbackList);
      setCaptainUnit({ id: row.unitId, name: row.unit });
    } finally {
      setCaptainRecipeLoading(false);
    }
  };

  return (
    <>
      {isRefreshing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col items-center gap-4">
            <Spin size="large" />
            <p className="text-white text-lg font-medium">Refreshing data...</p>
          </div>
        </div>
      )}
      <Form form={form} layout="vertical" onFinish={onFinish} className="mt-4">
        {/* Names */}
        {/* Names */}
<div className="mb-4">
  <MultiLangInputBox
    label="Name"
    formData={{
     nameEnglish: englishName,        // ← was form.getFieldValue("nameEnglish") || englishName
  nameGujarati: nameGujarati,      // ← was form.getFieldValue("nameGujarati") || ""
  nameHindi: nameHindi,    
    }}
    setFormData={(updated) => {
  const englishChanged = updated.nameEnglish !== englishName;
  setEnglishName(updated.nameEnglish);
  setNameGujarati(updated.nameGujarati);
  setNameHindi(updated.nameHindi);
  form.setFieldsValue({
    nameEnglish: updated.nameEnglish,
    nameGujarati: updated.nameGujarati,
    nameHindi: updated.nameHindi,
  });
  if (englishChanged) {
    clearTimeout(translateTimerRef.current);
    if (!updated.nameEnglish.trim()) {
      setNameGujarati("");
      setNameHindi("");
      form.setFieldsValue({ nameGujarati: "", nameHindi: "" });
      return;
    }
    // ← DON'T clear gujarati/hindi here, let translation overwrite when ready
    translateTimerRef.current = setTimeout(() => {
      handleTranslate(updated.nameEnglish);
    }, 600);
  }
}}
    cols={3}
    keys={{
      english: "nameEnglish",
      regional: "nameGujarati",
      hindi: "nameHindi",
    }}
  />
</div>
        {/* Slogan */}
        <div className="grid gap-4 md:grid-cols-3">
          <Form.Item
            label={
              <span className="text-[#6A7C94] text-base font-medium">
                Slogan
              </span>
            }
            name="slogan"
            className="md:col-span-3"
          >
            <Input className="bg-[#F8FAFC] h-10 hover:border-[#d9d9d9] focus:border-[#d9d9d9]" />
          </Form.Item>
        </div>
        {/* Price & Priority */}
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item
            label={
              <span className="text-[#6A7C94] text-base font-medium">
                Price
              </span>
            }
            name="price"
          >
            <InputNumber
              min={0}
              className="w-full bg-[#F8FAFC] h-10 hover:border-[#d9d9d9] focus:border-[#d9d9d9]"
              controls={false}
              placeholder="Enter price"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-[#6A7C94] text-base font-medium">
                Sequence
              </span>
            }
            name="sequence"
          >
            <InputNumber
              min={0}
              className="w-full bg-[#F8FAFC] h-10 hover:border-[#d9d9d9] focus:border-[#d9d9d9]"
              controls={false}
              placeholder="Enter Sequence"
            />
          </Form.Item>
        </div>
        {/* Categories */}
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item
            label={
              <span className="text-[#6A7C94] text-base font-medium">
                Category <span className="text-red-500">*</span>
              </span>
            }
            name="category"
          >
            <div className="flex ">
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Select Category"
                value={form.getFieldValue("category") || undefined}
                options={menuCategory.map((c) => ({
                  value: Number(c.menuid),
                  label: c.menuName,
                }))}
                onChange={(v) => {
                  form.setFieldsValue({ category: Number(v) });
                  handleCategoryChange(Number(v));
                }}
                className="bg-[#F8FAFC] h-10 border-r-0 hover:border-[#d9d9d9] focus:border-[#d9d9d9]"
              />
              <button
                type="button"
                className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-r-xl shadow hover:scale-105 transition"
                onClick={() => {
                  setIsCategoryModalOpen(true);
                }}
              >
                <i className="ki-filled ki-plus"></i>
              </button>
            </div>
          </Form.Item>

          <Form.Item
            label={
              <span className="text-[#6A7C94] text-base font-medium">
                Sub Category
              </span>
            }
            name="subCategory"
          >
            <div className="flex ">
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Select Sub Category"
                value={form.getFieldValue("subCategory")}
                options={menuSubCategory.map((item) => ({
                  value: Number(item.subid),
                  label: item.subname,
                }))}
                onChange={(v) =>
                  form.setFieldsValue({ subCategory: Number(v) })
                }
                className="bg-[#F8FAFC] h-10 border-r-0 hover:border-[#d9d9d9] focus:border-[#d9d9d9]"
              />

              <button
                type="button"
                className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-r-xl shadow hover:scale-105 transition"
                onClick={() => {
                  setIsSubCategoryModalOpen(true);
                }}
              >
                <i className="ki-filled ki-plus"></i>
              </button>
            </div>
          </Form.Item>
        </div>
        {/* Remarks */}
        <Form.Item
          label={
            <span className="text-[#6A7C94] text-base font-medium">
              Remarks
            </span>
          }
          name="remarks"
        >
          <TextArea
            rows={3}
            className="bg-[#F8FAFC] hover:border-[#d9d9d9] focus:border-[#d9d9d9]"
          />
        </Form.Item>
        {/* Instructions */}
       {/* Instructions */}
<div className="mb-4">
  <MultiLangInputBox
    label="Instruction"
    type="textarea"
    inputProps={{ rows: 3 }}
    formData={{

  instructionEnglish: englishInstruction,
  instructionGujarati: instructionGujarati,  
  instructionHindi: instructionHindi,       
    }}
    setFormData={(updated) => {
  const englishChanged = updated.instructionEnglish !== englishInstruction;
  setEnglishInstruction(updated.instructionEnglish);
  setInstructionGujarati(updated.instructionGujarati);  // ← add
  setInstructionHindi(updated.instructionHindi);        // ← add
  form.setFieldsValue({
    instructionEnglish: updated.instructionEnglish,
    instructionGujarati: updated.instructionGujarati,
    instructionHindi: updated.instructionHindi,
  });
  if (englishChanged) {
    clearTimeout(instructionTimerRef.current);
    if (!updated.instructionEnglish.trim()) {
      setInstructionGujarati("");  // ← add
      setInstructionHindi("");     // ← add
      form.setFieldsValue({ instructionGujarati: "", instructionHindi: "" });
      return;
    }
    instructionTimerRef.current = setTimeout(() => {
      handleTranslateInstruction(updated.instructionEnglish);
    }, 600);
  }
}}
    cols={3}
    keys={{
      english: "instructionEnglish",
      regional: "instructionGujarati",
      hindi: "instructionHindi",
    }}
  />
</div>
        {/* Image Upload */}
        <Form.Item
          label={
            <span className="text-[#6A7C94] text-base font-medium">Image</span>
          }
          name="image"
        >
          <Dragger
            multiple={false}
            beforeUpload={() => false}
            fileList={fileList}
            onChange={handleUploadChange}
            accept=".jpg,.jpeg,.png,.svg,.zip"
            className="!border-dashed !border-gray-300 bg-[#F8FAFC] hover:border-[#d9d9d9] focus:border-[#d9d9d9]"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="text-gray-600">
              Drag your files or{" "}
              <span className="text-primary cursor-pointer">browse</span>
            </p>
            <p className="text-xs text-gray-400">
              Only support .jpg, .png, .svg and .zip files. Max 10 MB files are
              allowed.
            </p>
          </Dragger>
        </Form.Item>
        {/* Custom file list */}
        {fileList.length > 0 && (
          <div className="space-y-2 mb-4">
            {fileList.map((file) => (
              <div
                key={file.uid}
                className="flex items-center justify-between rounded-md border px-3 py-2 bg-white"
              >
                <div className="flex items-center gap-3">
                  {file.url || file.thumbUrl ? (
                    <img
                      src={file.url || file.thumbUrl}
                      alt={file.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs">
                      {file.name.split(".").pop()?.toUpperCase() || "FILE"}
                    </div>
                  )}
                  <div className="flex flex-col text-xs sm:text-sm">
                    <span className="font-medium text-gray-800">
                      {file.name}
                    </span>
                    <span className="text-green-600">
                      Uploaded Successfully
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="hover:text-blue-600"
                  >
                    <ReloadOutlined />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file)}
                    className="hover:text-red-600"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* URL */}
        <Form.Item
          label={
            <span className="text-[#6A7C94] text-base font-medium">URL</span>
          }
          name="imageUrl"
        >
          <Input
            placeholder="Insert URL"
            className="bg-[#F8FAFC] h-10 hover:border-[#d9d9d9] focus:border-[#d9d9d9]"
          />
        </Form.Item>
        {/* Raw Material List */}
        <div className="w-full">
          <div className="flex justify-between items-center">
            <h1 className="text-black text-xl font-medium mb-4">
              Raw Material Items For (100 Pax) :
            </h1>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsCopyRecipe(true);
              }}
              className="bg-primary h-10 px-6 rounded-md hover:bg-primary mt-7"
            >
              Copy Recipe
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-end flex-wrap">
              <div className="flex flex-col w-[300px]">
                <label className="text-[#6A7C94] text-base font-medium mb-2">
                  Raw Material Item
                </label>
                <div className="flex">
                  <Select
                    showSearch
                    optionFilterProp="label"
                    placeholder="Select Raw Material"
                    className="bg-[#F8FAFC] h-10 w-full"
                    loading={rawMaterialLoading}
                  notFoundContent={
                    rawMaterialLoading ? "Loading raw materials…" : "No items found"
                  }
                    value={selectedRaw}
                    onSearch={(val) => setRawSearchText(val)}
                    onBlur={() => setRawSearchText("")}
                    options={rawmaterialList
                      .filter((item) => {
                        const isAdded = tableData.some(
                          (row) => row.rawMaterialId === item.rawMaterialId,
                        );
                        const isCurrentlySelected =
                          item.rawMaterialId === selectedRaw;
                        
                        return rawSearchText || isCurrentlySelected
                          ? true
                          : !isAdded;
                      })
                      .map((item) => ({
                        label: item.name,
                        value: item.rawMaterialId,
                      }))}
                    onChange={(value) => {
                      setSelectedRaw(value);
                      setRawSearchText(""); // ← reset search after selection
                      const found = rawmaterialList.find(
                        (r) => r.rawMaterialId === value,
                      );
                      if (found) {
                        const parent = found.unitHierarchy;
                        const unitList = [
                          { label: parent.nameEnglish, value: parent.unitId },
                          ...(parent.children?.map((child) => ({
                            label: child.nameEnglish,
                            value: child.unitId,
                          })) || []),
                        ];
                        setUnitOptions(unitList);
                        setUnit(parent.unitId);
                      }
                    }}
                  />

                  <button
                    type="button"
                    className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-r-xl shadow hover:scale-105 transition"
                    onClick={() => {
                      setIsRawMaterialModalOpen(true);
                    }}
                  >
                    <i className="ki-filled ki-plus"></i>
                  </button>
                </div>
              </div>

              <div className="flex flex-col w-[300px]">
                <label className="text-[#6A7C94] text-base font-medium mb-2">
                  Weight
                </label>
                <Input
                  placeholder="Enter weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-[#F8FAFC] h-10"
                />
              </div>

              <div className="flex flex-col w-[300px]">
                <label className="text-[#6A7C94] text-base font-medium mb-2">
                  Unit
                </label>
                <Select
                  placeholder="Select Unit"
                  className="bg-[#F8FAFC] h-10"
                  value={unit}
                  onChange={(value) => setUnit(value)}
                  options={unitOptions}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddRecipe}
                className="bg-primary h-10 px-6 rounded-md hover:bg-primary mt-7"
              >
                Add Recipe
              </Button>
            </div>
          </div>

          {/* Search & Delete */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 mb-3">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8 w-[300px]"
                placeholder="Search Rawmaterial"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              {selectedRows.length > 0 && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleBulkDelete}
                  className="h-10 px-6 rounded-md"
                >
                  Delete Selected ({selectedRows.length})
                </Button>
              )}

              {isEdit && (
                <Button
                  loading={loadingItems}
                  type="primary"
                  icon={<SyncOutlined />}
                  onClick={SyncRawMaterial}
                  className="bg-primary h-10 px-6 rounded-md hover:bg-blue-700"
                >
                  Sync Raw Material
                </Button>
              )}
            </div>
          </div>
        </div>
      </Form>

      <RawMaterialTable
        data={filteredTableData}
        onEditRow={handleEditRow}
        onDeleteRow={handleDeleteRow}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        godownOptions={godownOptions}
        onVenueChange={handleVenueChange}
         onVisibleChange={handleVisibleChange}
      />
{canAccesscaptainRecipe && (
       <div className="w-full mt-12">
        <div className="flex justify-between items-center">
          <h1 className="text-black text-xl font-medium mb-4">
            Captain Recipe For (100 Pax) :
          </h1>
           <Button
    type="primary"
    icon={<PlusOutlined />}
    onClick={() => setIsCopyCaptainRecipe(true)}
    className="bg-primary h-10 px-6 rounded-md hover:bg-primary mt-[-16px]"
  >
    Copy Captain Recipe
  </Button>
        </div>

  <div className="flex justify-between items-end mb-4 overflow-x-auto pb-1">
  {/* Left: inputs */}
  <div className="flex gap-3 items-end flex-wrap">
    <div className="flex flex-col w-[300px] flex-shrink-0">
      <label className="text-[#6A7C94] text-base font-medium mb-2">
        Captain Recipe <span className="text-red-500">*</span>
      </label>
      <Select
        showSearch
        optionFilterProp="label"
        placeholder="Select Captain Recipe"
        className="bg-[#F8FAFC] h-10 w-full"
        value={
          selectedCaptainRecipe?.id ??
          selectedCaptainRecipe?.captainReceipeId ??
          null
        }
        options={captainRecipeOptions}
        loading={captainRecipeLoading}
        allowClear
        onChange={async (value) => {
          if (!value) {
            setSelectedCaptainRecipe(null);
            setCaptainWeight("");
            setCaptainUnit(null);
            setCaptainUnitOptions([]);
            return;
          }
          try {
            setCaptainRecipeLoading(true);
            const res = await getCaptainReceipeById(value, false);
            const fullData = res?.data?.data;
            setSelectedCaptainRecipe(fullData);
            const hierarchy = fullData?.unitHierarchy;
            const unitList = hierarchy
              ? [
                  { value: hierarchy.unitId, label: hierarchy.nameEnglish },
                  ...(hierarchy.children?.map((child) => ({
                    value: child.unitId,
                    label: child.nameEnglish,
                  })) || []),
                ]
              : [{ value: fullData.unitId, label: fullData.unitName || "" }];
            setCaptainUnitOptions(unitList);
            if (fullData?.weight) setCaptainWeight(String(fullData.weight));
            if (fullData?.unitId) {
              const matchedUnit = unitList.find((u) => u.value === fullData.unitId);
              setCaptainUnit({
                id: fullData.unitId,
                name: matchedUnit?.label || fullData.unitName || "",
              });
            }
          } catch (err) {
            console.error("Failed to fetch captain recipe:", err);
            message.error("Failed to fetch recipe details");
          } finally {
            setCaptainRecipeLoading(false);
          }
        }}
      />
    </div>

    <div className="flex flex-col w-[200px] flex-shrink-0">
      <label className="text-[#6A7C94] text-base font-medium mb-2">
        Weight <span className="text-red-500">*</span>
      </label>
      <Input
        placeholder="Enter weight"
        value={captainWeight}
        onChange={(e) => setCaptainWeight(e.target.value)}
        className="bg-[#F8FAFC] h-10"
      />
    </div>

    <div className="flex flex-col w-[200px] flex-shrink-0">
      <label className="text-[#6A7C94] text-base font-medium mb-2">
        Unit <span className="text-red-500">*</span>
      </label>
      <Select
        showSearch
        optionFilterProp="label"
        placeholder="Select Unit"
        className="bg-[#F8FAFC] h-10"
        value={captainUnit?.id ?? null}
        onChange={(value, option) =>
          setCaptainUnit({ id: value, name: option.label })
        }
        options={captainUnitOptions}
      />
    </div>
  </div>

  {/* Right: buttons */}
  <div className="flex items-center gap-2 flex-shrink-0 flex-nowrap">
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() =>
        handleAddCaptainItems(
          selectedCaptainRecipe,
          captainWeight,
          captainUnit?.id,
          captainUnit?.name,
        )
      }
      className="bg-primary h-10 px-3 rounded-md whitespace-nowrap"
    >
      {editingCaptainRow !== null ? "Update Recipe" : "Add Recipe"}
    </Button>

    {editingCaptainRow !== null && (
      <Button
        onClick={handleCancelCaptainEdit}
        className="h-10 px-3 rounded-md whitespace-nowrap"
      >
        Cancel
      </Button>
    )}

    <button
      type="button"
      onClick={SyncCaptainRecipe}
      disabled={loadingItems || !editData?.id}
      className="bg-primary h-10 px-3 rounded-md text-white whitespace-nowrap disabled:opacity-50 flex items-center gap-2"
    >
      {loadingItems ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : (
        <SyncOutlined />
      )}
      Sync Captain Recipe
    </button>
  </div>
</div>

        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 mb-3">
          <div className="filItems relative">
            <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3" />
            <input
              className="input pl-8 w-[300px]"
              placeholder="Search Captain Recipe Items"
              type="text"
              value={captainSearchTerm}
              onChange={(e) => setCaptainSearchTerm(e.target.value)}
            />
          </div>
          {selectedCaptainRows.length > 0 && (
            <Button
              dangerc
              icon={<DeleteOutlined />}
              onClick={() => {
                const srNos = selectedCaptainRows.map((r) => r.sr_no);
                setCaptainTableData((prev) =>
                  prev.filter((r) => !srNos.includes(r.sr_no)),
                );
                setSelectedCaptainRows([]);
                message.success(
                  `Deleted ${selectedCaptainRows.length} item(s)`,
                );
              }}
              className="h-10 px-6 rounded-md"
            >
              Delete Selected ({selectedCaptainRows.length})
            </Button>
          )}
        </div>

        <RawMaterialTable
  data={filteredCaptainData}
  onEditRow={handleEditCaptainRowWithFetch}
  onDeleteRow={handleDeleteCaptainRow}
  selectedRows={selectedCaptainRows}
  setSelectedRows={setSelectedCaptainRows}
  godownOptions={godownOptions}
  onVenueChange={(srNo, venueId, venueName) => {
    setCaptainTableData((prev) =>
      prev.map((row) =>
        row.sr_no === srNo
          ? { ...row, venueId, venue: venueName }
          : row,
      ),
    );
  }}
  showVisibleColumn={false}
/>
      </div> 
)}
      <div className="flex justify-between mt-4 text-lg font-medium text-[#6A7C94]">
        <p>
          Dish Costing :
          <span className="text-primary ml-2">{dishCosting.toFixed(2)}</span>
        </p>
        <p>
          Total Rate :
          <span className="text-primary ml-2">{totalRate.toFixed(2)}</span>
        </p>
      </div>

      <div className="flex justify-between gap-4 pt-4">
        <Button
          type="default"
          onClick={handleCancel}
          className="bg-white h-10 px-6 rounded-md hover:bg-primary"
        >
          Cancel
        </Button>

        <div className="flex gap-4">
          <Button
            type="primary"
            onClick={handleNext}
            className="bg-primary h-10 px-6 rounded-md hover:bg-primary"
          >
            Next
          </Button>

          <Button
            type="primary"
            className="bg-primary h-10 px-6 rounded-md hover:bg-primary w-[120px]"
            onClick={() => {
              setIsSaveOnly(true);
              form.submit();
            }}
          >
            {isEdit ? "Update" : "Save"}
          </Button>
        </div>
      </div>

      <AddMenuCategory
        isModalOpen={isCategoryModalOpen}
        setIsModalOpen={setIsCategoryModalOpen}
        refreshData={refreshData}
      />
      <AddMenuSubCategory
        isModalOpen={isSubCategoryModalOpen}
        setIsModalOpen={setIsSubCategoryModalOpen}
        refreshData={refreshData}
      />
      <AddRawMaterial
        isOpen={isRawMaterialModalOpen}
        onClose={setIsRawMaterialModalOpen}
        refreshData={refreshData}
      />
      <CopyRecipe
        isOpen={isCopyRecipe}
        onClose={setIsCopyRecipe}
        onCopy={(data) => handleCopyRecipe(data)}
      />
      <CopyRecipe
  isOpen={isCopyCaptainRecipe}
  onClose={setIsCopyCaptainRecipe}
  onCopy={(data) => handleCopyCaptainRecipe(data)}
  isCaptainRecipe
/>
    </>
  );
};

export default MenuDetailsForm;
