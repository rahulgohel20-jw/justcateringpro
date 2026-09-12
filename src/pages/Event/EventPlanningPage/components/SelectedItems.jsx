import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toAbsoluteUrl } from "@/utils";
import { GetCategoryImg } from "@/services/apiServices";
import { ArrowUpNarrowWide, Plus, Space, UploadCloud, CaseUpper, Heading } from "lucide-react";import { Translateapi } from "../../../../services/apiServices";
import { ChevronDown } from "lucide-react";
import MultiLangInputBox from "../../../../components/form-inputs/MultiLangInputbox";
import { getLangConfig } from "@/utils/langConfig";
import RenameItemCat from "../../../../partials/modals/menu-notes/RenameItemscat";
import VendorPickerModal from "./VendorPickerModal";



const getStatusClasses = (status, kind = "category") => {
  if (status === "ADDED") {
    return kind === "category"
      ? "bg-yellow-50 border-yellow-300"
      : "bg-yellow-100";
  }
  if (status === "CANCELLED") {
    return kind === "category"
      ? "bg-red-50 border-red-300"
      : "bg-red-100";
  }
  // "Normal" or anything else → unchanged / default
  return kind === "category" ? "bg-white border-gray-200" : "bg-[#EEF3F7]";
};
// ─────────────────────────────────────────
// SPACE MODAL (shared for both category and item)
// ─────────────────────────────────────────
const SpaceModal = ({ label, onClose, onSave, initialSpace = 0 }) => {
  const [space, setSpace] = useState(
    initialSpace > 0 ? String(initialSpace) : "",
  ); // ← pre-fill

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Set Space — <span className="text-primary font-bold">{label}</span>
        </h2>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Space <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          min={1}
          placeholder="e.g. 1, 2, 3 ..."
          value={space}
          onChange={(e) => setSpace(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!space}
            onClick={() => {
              onSave(Number(space));
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};


const ItemImageModal = ({ itemName, currentImages = [], onClose, onUpload, uploading = false }) => {
  const [keptImages, setKeptImages] = useState(currentImages); // existing images the user wants to keep
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
    setPreviews((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))]);
  };

  const removeExisting = (idx) => {
    setKeptImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeNew = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const arraysEqual = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  const canSave = !uploading && (files.length > 0 || !arraysEqual(keptImages, currentImages));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Item Image — <span className="text-primary font-bold">{itemName}</span>
        </h2>

        {keptImages.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Images ({keptImages.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {keptImages.map((src, i) => (
                <div key={src} className="relative">
                  <img
                    src={src}
                    alt={`${itemName}-${i}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeExisting(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload New Image(s)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="border border-gray-300 rounded-lg p-2 w-full text-sm"
        />

        {previews.length > 0 && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              New (not yet saved)
            </label>
            <div className="flex flex-wrap gap-2">
              {previews.map((src, i) => (
                <div key={src} className="relative">
                  <img
                    src={src}
                    alt={`preview-${i}`}
                    className="w-20 h-20 object-cover rounded-lg border border-blue-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeNew(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => onUpload({ keptImageUrls: keptImages, newFiles: files })}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

const MenuItemImageModal = ({ itemName, currentImage, onClose, onUpload, uploading = false }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Item Image — <span className="text-primary font-bold">{itemName}</span>
        </h2>

        <label className="block text-sm font-medium text-gray-700 mb-1">Current Image</label>
        <div className="mb-4 flex justify-center">
          <img
            src={preview || (currentImage && currentImage !== "null" ? currentImage : toAbsoluteUrl("/media/menu/noImage.jpg"))}
            alt={itemName}
            className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
          />
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="border border-gray-300 rounded-lg p-2 w-full text-sm"
        />

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!file || uploading}
            onClick={() => onUpload(file)}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};



const ImagePickerModal = ({
  catName,
  isCatImg,
  onClose,
  onSave,
  currentImgId = 0,
}) => {
  const userId = localStorage.getItem("userId");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    GetCategoryImg(userId, isCatImg)
      .then((res) => {
        const data = res?.data?.data || [];
        setList(data);
        if (currentImgId) {
          const preSelected = data.find(
            (i) => Number(i.id) === Number(currentImgId),
          );
          if (preSelected) setSelected(preSelected);
        }
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [isCatImg, currentImgId]);

  const title = isCatImg ? "Category Front Page" : "Background Image";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          {title} — <span className="text-primary font-bold">{catName}</span>
        </h2>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select {title} <span className="text-red-500">*</span>
        </label>
        {loading ? (
          <div className="text-sm text-gray-400 py-3 text-center">
            Loading...
          </div>
        ) : (
          <select
            value={selected?.id ?? ""}
            onChange={(e) => {
              const found = list.find((i) => String(i.id) === e.target.value);
              setSelected(found || null);
            }}
            className="border border-gray-300 rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">-- Select {title} --</option>
            {list.map((item) => (
              <option key={item.id} value={item.id}>
                {item.categoryName}
              </option>
            ))}
          </select>
        )}
        {selected?.imageUrl && (
          <div className="mt-3 flex justify-center">
            <img
              src={selected.imageUrl}
              alt={selected.categoryName}
              className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
            />
          </div>
        )}
        {!selected && currentImgId > 0 && !loading && (
          <p className="text-xs text-amber-600 mt-2">
            Previously saved ID: {currentImgId} (not found in current list)
          </p>
        )}
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={() => {
              onSave(catName, selected, isCatImg);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// ItemRow — with item-level Space button
// ─────────────────────────────────────────
const ItemRow = ({
  rowRef,
  item,
  idx,
  catName,
  functionId,
  showRates,
  showImage,
  onRateChange,
  onOpenItemNotes,
  onRemove,
  displayItemName,
  sequenceNumber,
  onOpenItemIns,
  isItemAddons,
  onToggleItemAddon,
  onItemSpaceSave,
  onItemSubSave,
  onItemHeadingSave = () => {},
  instruction = "",
  onInstructionsChange = () => {},
  isPrimary = false,
  onSelectPrimaryItem = () => {},
  onRenameItemSave = () => {},
  onOpenItemImage = () => {},
   mode = "menu",
   canAccessDecor = false,
   onQtyChange = () => {}, 
    itemStatus = "NORMAL",
     onVendorSave = () => {},
}) => {

  const isDeleted = itemStatus === "CANCELLED"; // ← locked state

const [showSubItemModal, setShowSubItemModal] = useState(false);
 const [showHeadingModal, setShowHeadingModal] = useState(false); 
const [showItemSpaceModal, setShowItemSpaceModal] = useState(false);
const [showRenameModal, setShowRenameModal] = useState(false);
const [showInstructions, setShowInstructions] = useState(!!instruction); 
const [localInstruction, setLocalInstruction] = useState(instruction);
const [translatingItems, setTranslatingItems] = useState({});
const prevItemIdRef = useRef(item.id);
const isTypingRef = useRef(false);
const instructionRef = useRef(null);              // ← NEW
const isInternalInstructionChange = useRef(false);
 const [showVendorModal, setShowVendorModal] = useState(false);

 const vendorBtnRef = useRef(null);

useEffect(() => {
  if (isInternalInstructionChange.current) {
    isInternalInstructionChange.current = false;
    return;
  }
  if (instructionRef.current && instructionRef.current.innerHTML !== (localInstruction || "")) {
    instructionRef.current.innerHTML = localInstruction || "";
  }
}, [localInstruction]);

useEffect(() => {
  if (item.id !== prevItemIdRef.current) {
    prevItemIdRef.current = item.id;
    setLocalInstruction(instruction);
    setShowInstructions(!!instruction);
    return;
  }
  if (!isTypingRef.current || instruction === "") {
    setLocalInstruction(instruction);
    if (instruction) {
      setShowInstructions(true);  
    } else {
      setShowInstructions(false); 
    }
  }
}, [instruction, item.id]);

  const subItem = item.subItem || "";

  return (
    <>
      {!isDeleted && showItemSpaceModal && (
        <SpaceModal
          label={displayItemName}
          onClose={() => setShowItemSpaceModal(false)}
          onSave={(val) => onItemSpaceSave(catName, item.id, val)}
          initialSpace={item.itemSpace || 0}
        />
      )}
 {!isDeleted && showRenameModal && (
  <RenameItemCat
    label={displayItemName}
    initialValues={{
      english: item.nicknames?.english || item.nameEnglish || "",
      hindi: item.nicknames?.hindi || item.nameHindi || "",
      gujarati: item.nicknames?.gujarati || item.nameGujarati || "",
    }}
    onClose={() => setShowRenameModal(false)}
    onLiveChange={(val) => onRenameItemSave(catName, item.id, val)}
    onSave={(val) => { onRenameItemSave(catName, item.id, val); setShowRenameModal(false); }}
  />
)}

      {!isDeleted && showSubItemModal && (
  <SubTextModal
    label={`Sub Category — ${displayItemName}`}
    mode={mode}
    onClose={() => setShowSubItemModal(false)}
    onSave={(val) => onItemSubSave(catName, item.id, val)}
    initialValues={{
      english: item.subItem || "",
      hindi: item.subItemHindi || "",
      gujarati: item.subItemGujarati || "",
    }}
  />
)}
{!isDeleted && showVendorModal && (
  <VendorPickerModal
    itemName={displayItemName}
    currentVendorId={item.vendorId || 0}
    currentVendorName={item.vendorName || ""}
    onClose={() => setShowVendorModal(false)}
    onSave={(vendor) => onVendorSave(catName, item.id, vendor)}
  />
)}
      {!isDeleted && showHeadingModal && (
  <SubTextModal
    label={`Item Heading — ${displayItemName}`}
    mode={mode}
    onClose={() => setShowHeadingModal(false)}
    onSave={(val) => onItemHeadingSave(catName, item.id, val)}
    initialValues={{
      english: item.itemHeading || "",
      hindi: item.itemHeadingHindi || "",
      gujarati: item.itemHeadingGujarati || "",
    }}
  />
)}

     <Draggable
        key={item.id}
        draggableId={`item-${item.id}`}
        index={idx}
        isDragDisabled={isDeleted}
      >
        {(provItem, snap) => (
          <div
            ref={(el) => {
              provItem.innerRef(el);
              if (rowRef) rowRef(el);
            }}
            {...provItem.draggableProps}
            className={`relative p-2 rounded-lg transition-shadow ${getStatusClasses(itemStatus, "item")} ${snap.isDragging ? "shadow-lg ring-2 ring-blue-400" : ""}`}
          >
            {/* TOP: drag handle + image + name + badges — full width, nothing competing for space */}
            <div
              {...(isDeleted ? {} : provItem.dragHandleProps)}
              className="flex items-start gap-2"
            >
              <span className="text-[#94A3B8] text-[16px] cursor-grab flex-shrink-0 mt-0.5 select-none">
                ⋮⋮
              </span>

             {(showImage || mode === "decor") && (
  <div
    className={`w-9 h-9 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden ${
      !isDeleted ? "cursor-pointer hover:ring-2 hover:ring-primary" : ""
    }`}
    title="Click to view/upload image"
    onClick={(e) => {
      if (isDeleted) return;
      e.stopPropagation();
      onOpenItemImage(catName, item);
    }}
  >
    <img
      src={
        mode === "decor"
          ? (Array.isArray(item.images) && item.images.length > 0
              ? item.images[0]
              : toAbsoluteUrl("/media/menu/noImage.jpg"))
          : (item?.imagePath &&
             typeof item.imagePath === "string" &&
             item.imagePath.trim() !== "" &&
             item.imagePath !== "null" &&
             item.imagePath !== "undefined" &&
             !item.imagePath.toLowerCase().includes("/null") &&
             /\.(jpg|jpeg|png|webp|gif)$/i.test(item.imagePath)
              ? item.imagePath
              : toAbsoluteUrl("/media/menu/noImage.jpg"))
      }
      alt="Images"
      className="w-full h-full object-cover"
    />
  </div>
)}
              <div className="flex flex-col min-w-0 flex-1">
                <span
                  className={`text-sm font-semibold ${itemStatus === "CANCELLED" ? "line-through text-gray-400" : isItemAddons ? "text-primary" : "text-gray-900"}`}
                >
                  {sequenceNumber}. {displayItemName}
                </span>

                {/* Badges — wrap freely on their own line, never push the name around */}
                {(isItemAddons || item.itemSpace > 0 || subItem || item.itemHeading || isDeleted || item.vendorName) && (
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    {isItemAddons && (
                      <span className="text-[9px] font-semibold bg-blue-100 text-primary border border-blue-300 px-1.5 py-0.5 rounded-full leading-none">
                        Add-on
                      </span>
                    )}
                    {item.itemSpace > 0 && (
                      <span className="text-[9px] font-semibold bg-indigo-100 text-indigo-600 border border-indigo-300 px-1.5 py-0.5 rounded-full leading-none">
                        Space: {item.itemSpace}
                      </span>
                    )}
                    {subItem && (
                      <span
                        className="text-[9px] font-semibold bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded-full leading-none"
                        dangerouslySetInnerHTML={{ __html: `Sub: ${subItem}` }}
                      />
                    )}
                    {item.itemHeading && (
                      <span
                        className="text-[9px] font-semibold bg-teal-100 text-teal-700 border border-teal-300 px-1.5 py-0.5 rounded-full leading-none"
                        dangerouslySetInnerHTML={{ __html: item.itemHeading }}
                      />
                    )}
                    {isDeleted && (
                      <span className="text-[9px] font-semibold bg-red-100 text-red-600 border border-red-300 px-1.5 py-0.5 rounded-full leading-none">
                        Deleted
                      </span>
                    )}
                    {item.vendorName && (
  <span className="text-[9px] font-semibold bg-orange-100 text-orange-700 border border-orange-300 px-1.5 py-0.5 rounded-full leading-none">
    Vendor: {item.vendorName}
  </span>
)}
                  </div>
                )}

                {/* Rates / Qty — own row, doesn't compete with name */}
                {showRates && (
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {mode === "decor" && (
                      <label className="flex items-center gap-1">
                        <span className="text-gray-500 text-xs">Qty:</span>
                        <input
                          type="tel"
                          min={0}
                          value={item.itemQty ?? ""}
                          placeholder="—"
                          disabled={isDeleted}
                          onChange={(e) =>
                            onQtyChange(functionId, catName, item.id, e.target.value === "" ? null : Number(e.target.value))
                          }
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          className={`w-16 h-6 rounded border border-gray-300 bg-white text-xs p-1 ${isDeleted ? "opacity-50 cursor-not-allowed bg-gray-100" : ""}`}
                        />
                      </label>
                    )}
                    <label className="flex items-center gap-1">
                      <span className="text-gray-500 text-xs">Rate:</span>
                      <input
                        type="text"
                        value={item.rate}
                        min={0}
                        disabled={isDeleted}
                        onChange={(e) => onRateChange(functionId, catName, item.id, Number(e.target.value))}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className={`w-16 h-6 rounded border border-gray-300 bg-white text-xs p-1 ${isDeleted ? "opacity-50 cursor-not-allowed bg-gray-100" : ""}`}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* BOTTOM: action toolbar — its own row, wraps freely, never touches the name */}
            <div
              className={`flex items-center justify-end gap-0.5 flex-wrap mt-1.5 pt-1.5 border-t border-black/5 text-gray-600 ${isDeleted ? "opacity-50 pointer-events-none" : ""}`}
            >
              <label
                className="flex items-center cursor-pointer px-1"
                title="Mark as Addon"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={!!isItemAddons}
                    disabled={isDeleted}
                    onChange={() => onToggleItemAddon(catName, item.id)}
                  />
                  <div className={`w-8 h-4 rounded-full transition-colors ${isItemAddons ? "bg-primary" : "bg-gray-300"}`} />
                  <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${isItemAddons ? "translate-x-4" : ""}`} />
                </div>
              </label>

              {mode === "menu" && (
                <button
                  type="button"
                  title="Select as primary Image"
                  className="p-1 rounded hover:bg-gray-100"
                  disabled={isDeleted}
                  onClick={(e) => { e.stopPropagation(); onSelectPrimaryItem(catName, item.id, isPrimary); }}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isPrimary ? "border-primary" : "border-gray-400"}`}>
                    <span className={`w-2 h-2 rounded-full ${isPrimary ? "bg-primary" : "bg-transparent"}`} />
                  </span>
                </button>
              )}

              {mode === "menu" && (
                <button
                  type="button"
                  title="Rename item"
                  className="p-1 rounded hover:bg-gray-100"
                  disabled={isDeleted}
                  onClick={(e) => { e.stopPropagation(); setShowRenameModal(true); }}
                >
                  <i className="ki-filled ki-pencil text-[16px] text-gray-500" />
                </button>
              )}

{mode === "decor" && (
  <button
    ref={vendorBtnRef}
    type="button"
    title="Assign Vendor"
    className="p-1 rounded hover:bg-gray-100"
    disabled={isDeleted}
    onClick={(e) => { e.stopPropagation(); setShowVendorModal(true); }}
  >
    <i className="ki-filled ki-briefcase text-[16px] text-orange-600 bg-orange-50 rounded-md p-0.5" />
  </button>
)}

              <button
                type="button"
                title="Set Item Space"
                className="p-1 rounded hover:bg-gray-100"
                disabled={isDeleted}
                onClick={(e) => { e.stopPropagation(); setShowItemSpaceModal(true); }}
              >
                <Space size={16} className="text-indigo-600 bg-gray-200 rounded-md p-0.5" />
              </button>

              <button
                type="button"
                title="Set Sub Item"
                className="p-1 rounded hover:bg-gray-100"
                disabled={isDeleted}
                onClick={(e) => { e.stopPropagation(); setShowSubItemModal(true); }}
              >
                <span className="w-5 h-5 flex items-center justify-center text-amber-700 bg-amber-100 rounded-full text-sm font-extrabold border border-amber-300">
                  <Plus size={12} />
                </span>
              </button>

              {mode === "menu" && (
                <button
                  type="button"
                  title="Set Item Heading"
                  className="p-1 rounded hover:bg-gray-100"
                  disabled={isDeleted}
                  onClick={(e) => { e.stopPropagation(); setShowHeadingModal(true); }}
                >
                  <Heading size={16} className="text-teal-800 bg-teal-100 rounded-full p-0.5" />
                </button>
              )}

              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100"
                title="Notes"
                onClick={(e) => {
                  if (isDeleted) return;
                  e.stopPropagation();
                  onOpenItemNotes(item.id);
                }}
              >
                <img className="w-4 h-4" src={toAbsoluteUrl("/media/menu/notes.png")} alt="notes" />
              </button>

              <button
                type="button"
                className="hover:bg-gray-200 rounded p-1"
                title="Instructions"
                disabled={isDeleted}
                onClick={(e) => { e.stopPropagation(); onOpenItemIns(item.id); }}
              >
                <img className="w-4 h-4" src={toAbsoluteUrl("/media/icons/info.png")} alt="ins" />
              </button>

              <button
                type="button"
                title="Toggle Instructions"
                className="p-1 rounded hover:bg-gray-100"
                disabled={isDeleted}
                onClick={(e) => { e.stopPropagation(); setShowInstructions((v) => !v); }}
              >
                <ChevronDown size={16} />
              </button>

              <button
                type="button"
                className="text-red-500 hover:bg-gray-200 rounded p-1"
                onClick={(e) => { e.stopPropagation(); onRemove(functionId, catName, item.id); }}
              >
                <i className="ki-filled ki-trash text-[16px]" />
              </button>
            </div>

            {showInstructions && !isDeleted && (
  <div
    ref={instructionRef}
    contentEditable
    suppressContentEditableWarning
    data-placeholder="Add instructions..."
    onInput={(e) => {
      isTypingRef.current = true;
      isInternalInstructionChange.current = true;
      const html = e.currentTarget.innerHTML;
      setLocalInstruction(html);
      onInstructionsChange(functionId, catName, item.id, html);
    }}
    onBlur={() => { isTypingRef.current = false; }}
    onClick={(e) => e.stopPropagation()}
    onMouseDown={(e) => e.stopPropagation()}
    className="item-instruction-editable w-full mt-1.5 min-h-[42px] overflow-visible whitespace-pre-wrap break-words bg-white border border-gray-200 rounded-md p-1.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
  />
)}
{showInstructions && isDeleted && localInstruction && (
  <div
    className="w-full mt-1.5 bg-gray-100 border border-gray-200 rounded-md p-1.5 text-sm text-gray-500 italic"
    dangerouslySetInnerHTML={{ __html: localInstruction }}
  />
)}
          </div>
        )}
      </Draggable>
    </>
  );
};

const SubTextModal = ({ label, onClose, onSave, initialValues = {}, mode = "menu" }) => {
  const [formData, setFormData] = useState({
    english: initialValues.english || "",
    gujarati: initialValues.gujarati || "",
    hindi: initialValues.hindi || "",
  });

   const [isTranslating, setIsTranslating] = useState(false);
  const debounceRef = useRef(null);

  // ── Translation ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const div = document.createElement("div");
    div.innerHTML = formData.english || "";
    const plainEnglish = (div.textContent || div.innerText || "").trim();

    if (!plainEnglish) {
      setFormData((prev) => ({ ...prev, gujarati: "", hindi: "" }));
      setIsTranslating(false);
      return;
    }
    setIsTranslating(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await Translateapi(plainEnglish);
        const data = res?.data || {};
        setFormData((prev) => ({
          ...prev,
          gujarati: data.gujarati || "",
          hindi: data.hindi || "",
        }));
      } catch (err) {
        console.error("Translation error:", err);
      }
      finally {
        setIsTranslating(false); 
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [formData.english]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Set {label}
        </h2>

        <MultiLangInputBox
          formData={formData}
          setFormData={setFormData}
          enableFormatting={mode === "decor"}
          label="Sub Text"
          cols={1}
          keys={{ english: "english", regional: "gujarati", hindi: "hindi" }}
        />

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isTranslating} 
            onClick={() => {
              onSave({ english: formData.english, hindi: formData.hindi, gujarati: formData.gujarati });
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" 
          >
            {isTranslating ? "Translating..." : "Save"} 
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// SelectedItems
// ─────────────────────────────────────────────────────────────────
const SelectedItems = ({
  functionId,
  data = { categoriesOrder: [], categories: {} },
  loading = false,          
  onRemove = () => {},
  onDragEndNewState = () => {},
  showRates = false,
  showImage = false,
  onRateChange = () => {},
  onOpenItemNotes = () => {},
  onOpenCategoryNotes = () => {},
  onInstructionsChange = () => {},
  onOpenItemIns = () => {},
  addonState = {},
  onToggleCategoryAddon = () => {},
  onToggleItemAddon = () => {},
  packageCategoryLimits = {},
  onSpaceSave = () => {},
  onItemSpaceSave = () => {},
  onImageSave = () => {},
  categoryImages = {},
  onSubCatSave = () => {},
  onItemSubSave = () => {},
  onCategoryHeadingSave = () => {},
  onItemHeadingSave = () => {}, 
  primaryItems = {},
  onSelectPrimaryItem = () => {},
  onRenameItemSave = () => {},
  onRenameCatSave = () => {},
   mode = "menu",
   canAccessDecor = false,
   onQtyChange = () => {},
   functionRate = 0,
   packageInfo = null,
   onItemImageUpload = () => {},
   onMenuItemImageUpload = () => {},
   onCategoryInstructionsChange = () => {}, 
    onVendorSave = () => {},
}) => {

  const { categoriesOrder = [], categories = {} } = data;

 const [expandedCategories, setExpandedCategories] = useState({});
const [expandedCategoryInstructions, setExpandedCategoryInstructions] = useState({});
const [categoryInstructionsMap, setCategoryInstructionsMap] = useState({});
const [itemInstructions, setItemInstructions] = useState({});
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem("lang") || "en",
  );

  const [spaceModal, setSpaceModal] = useState(null);
  const [imageModal, setImageModal] = useState(null);

  const isDraggingRef = useRef(false);
  const previousItemIdsRef = useRef(new Set());
  const hasLoadedInitialDataRef = useRef(false);

  const [subCatModal, setSubCatModal] = useState(null);
 const [renameCatModal, setRenameCatModal] = useState(null);
  const itemRowRefs = useRef({});
  const scrollContainerRef = useRef(null);
  const [itemImageModal, setItemImageModal] = useState(null); // { catName, item }
const [itemImageUploading, setItemImageUploading] = useState(false);
const [headingCatModal, setHeadingCatModal] = useState(null);





useEffect(() => {
  const map = {};
  Object.keys(categories).forEach((catName) => {
    const note = data.categoryNotes?.[catName];
    if (note && typeof note === "object") {
      map[catName] =
        currentLanguage === "hi"
          ? note.hindi || note.english || ""
          : currentLanguage === "gu"
            ? note.gujarati || note.english || ""
            : note.english || "";
    } else {
      map[catName] = note || "";
    }
  });
  setCategoryInstructionsMap(map);
}, [data.categoryNotes, categories, currentLanguage]);






useEffect(() => {
  const instructions = {};
  Object.keys(categories).forEach((catName) => {
    (categories[catName] || []).forEach((item) => {
      const lang = localStorage.getItem("lang") || "en";
     
      const itemNotes = item.itemInstruction || item.itemNotes;

      if (typeof itemNotes === "object" && itemNotes !== null) {
        instructions[item.id] =
          lang === "hi"
            ? itemNotes.hindi || itemNotes.english || ""
            : lang === "gu"
              ? itemNotes.gujarati || itemNotes.english || ""
              : itemNotes.english || "";
      } else {
        // plain string from API (itemNotes field)
        instructions[item.id] = itemNotes || "";
      }
    });
  });
  setItemInstructions(instructions);
}, [categories, currentLanguage]);

  useEffect(() => {
    previousItemIdsRef.current = new Set();
    hasLoadedInitialDataRef.current = false;
  }, [functionId]);

  useEffect(() => {
    const currentIds = new Set();
    let newItemId = null,
      newCat = null;

    categoriesOrder.forEach((cat) => {
      (categories[cat] || []).forEach((item) => {
        currentIds.add(item.id);
        if (!previousItemIdsRef.current.has(item.id)) {
          newItemId = item.id;
          newCat = cat;
        }
      });
    });

    if (newItemId && newCat && hasLoadedInitialDataRef.current) {
      setExpandedCategories((prev) => ({ ...prev, [newCat]: true }));

      // ← NEW: scroll to the newly added row
      setTimeout(() => {
        const key = `${newCat}__${newItemId}`;
        const el = itemRowRefs.current[key];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 80); // small delay so the category expands first
    }

    if (!hasLoadedInitialDataRef.current && currentIds.size > 0)
      hasLoadedInitialDataRef.current = true;

    previousItemIdsRef.current = currentIds;
  }, [categories, categoriesOrder]);

  useEffect(() => {
    const handleLanguageChange = () =>
      setCurrentLanguage(localStorage.getItem("lang") || "en");
    window.addEventListener("languageChange", handleLanguageChange);
    window.addEventListener("storage", handleLanguageChange);
    const intervalId = setInterval(() => {
      const currentLang = localStorage.getItem("lang") || "en";
      if (currentLang !== currentLanguage) setCurrentLanguage(currentLang);
    }, 500);
    return () => {
      window.removeEventListener("languageChange", handleLanguageChange);
      window.removeEventListener("storage", handleLanguageChange);
      clearInterval(intervalId);
    };
  }, [currentLanguage]);

  useEffect(() => {
    if (categoriesOrder.length > 0) {
      setExpandedCategories((prev) => {
        const defaults = { ...prev };
        categoriesOrder.forEach((cat) => {
          if (!(cat in defaults)) defaults[cat] = true;
        });
        return defaults;
      });
    }
  }, [categoriesOrder]);

  const handleToggleItemAddon = useCallback(
    (catName, itemId) => {
      const isCurrentlyAddon = !!addonState[catName]?.items?.[itemId];

      // if (!isCurrentlyAddon && !addonState[catName]?.cat) {
      //   onToggleCategoryAddon(catName);
      // }

      onToggleItemAddon(catName, itemId);
    },
    [addonState, onToggleCategoryAddon, onToggleItemAddon],
  );

  const getLocalizedItemName = useMemo(
  () => (item) => {
    const field =
      { en: "nameEnglish", hi: "nameHindi", gu: "nameGujarati" }[
        currentLanguage
      ] || "nameEnglish";
    return (
      item[field] ||
      item.nameEnglish ||
      item.menuItemName ||
      item.menuItemNameEnglish ||
      ""
    );
  },
  [currentLanguage],
);


//  const getLocalizedCategoryName = useMemo(
//   () => (categoryName) => {
//     const renameKey = { en: "english", hi: "hindi", gu: "gujarati" }[currentLanguage] || "english";

//     // 1) Saved/edited 11 — works with 0 items
//     const rename = data.categoryRenames?.[categoryName]?.[renameKey];
//     if (rename) return rename;

//     // 2) Package report-name fallback — works with 0 items ("Any N" categories)
//     const reportFallback = data.categoryReportNames?.[categoryName]?.[renameKey];
//     if (reportFallback) return reportFallback;

//     const items = categories[categoryName] || [];
//     if (items.length === 0) return categoryName;
//     const f = items[0];
//     return (
//       {
//         en: f.reportNameEnglish || f.menuCategoryName || categoryName,
//         hi: f.reportNameHindi || f.menuCategoryNameHindi || f.menuCategoryName || categoryName,
//         gu: f.reportNameGujarati || f.menuCategoryNameGujarati || f.menuCategoryName || categoryName,
//       }[currentLanguage] || categoryName
//     );
//   },
//   [currentLanguage, categories, data.categoryRenames, data.categoryReportNames],
// );

const getLocalizedCategoryName = useMemo(
  () => (categoryName) => {
    const items = categories[categoryName] || [];
    if (items.length === 0) return categoryName;
    const f = items[0];
    return (
      {
        en: f.menuCategoryName || categoryName,
        hi: f.menuCategoryNameHindi || f.menuCategoryName || categoryName,
        gu: f.menuCategoryNameGujarati || f.menuCategoryName || categoryName,
      }[currentLanguage] || categoryName
    );
  },
  [currentLanguage, categories],
);


  const toggleCategory = useCallback((catName) => {
    setExpandedCategories((prev) => ({ ...prev, [catName]: !prev[catName] }));
  }, []);

  const sequenceMap = useMemo(() => {
    const map = {};
    let counter = 0;
    categoriesOrder.forEach((catName) => {
      (categories[catName] || []).forEach((item) => {
        map[`${catName}__${item.id}`] = ++counter;
      });
    });
    return map;
  }, [categoriesOrder, categories]);

  const internalOnDragEnd = useCallback(
    (result) => {
      isDraggingRef.current = false;
      const { destination, source, type, draggableId } = result;
      if (!destination) return;
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )
        return;

      if (type === "CATEGORY") {
        const newCategoriesOrder = [...categoriesOrder];
        const [moved] = newCategoriesOrder.splice(source.index, 1);
        newCategoriesOrder.splice(destination.index, 0, moved);
        onDragEndNewState({
          categoriesOrder: newCategoriesOrder,
          categories: { ...categories },
          categoryNotes: data.categoryNotes,
          categorySlogans: data.categorySlogans,
        });
        return;
      }

      const srcCat = source.droppableId.startsWith("cat-")
        ? source.droppableId.slice(4)
        : source.droppableId;
      const destCat = destination.droppableId.startsWith("cat-")
        ? destination.droppableId.slice(4)
        : destination.droppableId;
      const itemIdStr = draggableId.startsWith("item-")
        ? draggableId.slice(5)
        : draggableId;
      const srcList = (categories[srcCat] || []).map((i) => ({ ...i }));
      const itemIndex = srcList.findIndex(
        (it) => String(it.id) === String(itemIdStr),
      );
      if (itemIndex === -1) return;
      const [movedItem] = srcList.splice(itemIndex, 1);

      if (srcCat === destCat) {
        srcList.splice(destination.index, 0, movedItem);
        onDragEndNewState({
          categoriesOrder: [...categoriesOrder],
          categories: { ...categories, [srcCat]: srcList },
          categoryNotes: data.categoryNotes,
          categorySlogans: data.categorySlogans,
        });
        return;
      }


       const destList = (categories[destCat] || []).map((i) => ({ ...i }));
const destRef = destList[0]; // existing item already in destCat = source of truth

const destCatId = data.categoryIds?.[destCat] ?? destRef?.catId ?? 0;
const updatedItem = {
  ...movedItem,
  menuCategoryName: destRef?.menuCategoryName || destCat,
  menuCategoryNameHindi: destRef?.menuCategoryNameHindi || destCat,
  menuCategoryNameGujarati: destRef?.menuCategoryNameGujarati || destCat,
  // catId: destRef?.catId ?? movedItem.catId,
  catId: destCatId,
  reportNameEnglish: destRef?.reportNameEnglish || destCat,
  reportNameHindi: destRef?.reportNameHindi || destCat,
  reportNameGujarati: destRef?.reportNameGujarati || destCat,
};
destList.splice(destination.index, 0, updatedItem);
      const newCategories = { ...categories };
      if (srcList.length === 0) delete newCategories[srcCat];
      else newCategories[srcCat] = srcList;
      newCategories[destCat] = destList;
      let newCategoriesOrder = categoriesOrder.filter(
        (c) => newCategories[c] !== undefined,
      );
      if (!newCategoriesOrder.includes(destCat))
        newCategoriesOrder = [...newCategoriesOrder, destCat];
      onDragEndNewState({
        categoriesOrder: newCategoriesOrder,
        categories: newCategories,
        categoryNotes: data.categoryNotes,
        categorySlogans: data.categorySlogans,
      });
    },
    [categoriesOrder, categories, data, onDragEndNewState],
  );

  const internalOnDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

const { totalItems, totalRate, addonRate } = useMemo(() => {
  let itemCount = 0, rateSum = 0, addonSum = 0;
  categoriesOrder.forEach((catName) => {
    const items = categories[catName] || [];
    itemCount += items.length;
    items.forEach((item) => {
      const qty = item.itemQty != null ? Number(item.itemQty) : 1;
      const lineTotal = (Number(item.rate) || 0) * qty;
      rateSum += lineTotal;
      if (!!addonState[catName]?.items?.[item.id]) {
        addonSum += lineTotal;
      }
    });
  });
  return { totalItems: itemCount, totalRate: rateSum, addonRate: addonSum };
}, [categoriesOrder, categories, addonState]);


if (loading) {
  return (
   <div className="flex justify-center items-center h-40">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-primary" />
      </div>
  );
}

  if (!categoriesOrder || categoriesOrder.length === 0) {
    return (
      <div className="w-full flex flex-col h-full overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto no-scrollbar"
        >
          <div className="p-4 text-center text-sm text-gray-500">
            No items selected for this function.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Category Space Modal */}
      {spaceModal && (
        <SpaceModal
          label={spaceModal}
          onClose={() => setSpaceModal(null)}
          onSave={(val) => onSpaceSave(spaceModal, val)}
          initialSpace={data.categorySpaces?.[spaceModal] || 0}
        />
      )}

      {/* Image Picker Modal */}
      {imageModal && (
        <ImagePickerModal
          catName={imageModal.catName}
          isCatImg={imageModal.isCatImg}
          onClose={() => setImageModal(null)}
          onSave={onImageSave}
          currentImgId={
            imageModal.isCatImg
              ? categoryImages[imageModal.catName]?.catImgId || 0
              : categoryImages[imageModal.catName]?.bgImgId || 0
          }
        />
      )}
      {renameCatModal && (() => {
  const catItems = categories[renameCatModal] || [];
  const first = catItems[0] || {};
  const existingRename = data.categoryRenames?.[renameCatModal] || {};
  const reportFromData = data.categoryReportNames?.[renameCatModal] || {};

  // const initialValues = {
  //   english: existingRename.english 
  //     || first.reportNameEnglish 
  //     || reportFromData.english 
  //     || first.menuCategoryName 
  //     || renameCatModal,
  //   hindi: existingRename.hindi 
  //     || first.reportNameHindi 
  //     || reportFromData.hindi 
  //     || first.menuCategoryNameHindi 
  //     || first.menuCategoryName 
  //     || renameCatModal,
  //   gujarati: existingRename.gujarati 
  //     || first.reportNameGujarati 
  //     || reportFromData.gujarati 
  //     || first.menuCategoryNameGujarati 
  //     || first.menuCategoryName 
  //     || renameCatModal,
  // };

  const initialValues = {
  english: existingRename.english 
    || reportFromData.english 
    || renameCatModal, // ← category key first, not first.reportNameEnglish
  hindi: existingRename.hindi 
    || reportFromData.hindi 
    || renameCatModal,
  gujarati: existingRename.gujarati 
    || reportFromData.gujarati 
    || renameCatModal,
};


  return (
    <RenameItemCat
      label={renameCatModal}
      initialValues={initialValues}
      onClose={() => setRenameCatModal(null)}
      onLiveChange={(val) => onRenameCatSave(renameCatModal, val)}
      onSave={(val) => { onRenameCatSave(renameCatModal, val); setRenameCatModal(null); }}
    />
  );
})()}
      {subCatModal && (
  <SubTextModal
    label={`Sub Category — ${subCatModal}`}
    mode={mode}
    onClose={() => setSubCatModal(null)}
    onSave={(val) => {
      onSubCatSave(subCatModal, val);
    }}
    initialValues={data.categorySubTexts?.[subCatModal] || {}}
  />
)}
      {headingCatModal && (
        <SubTextModal
          label={`Category Heading — ${headingCatModal}`}
          onClose={() => setHeadingCatModal(null)}
          onSave={(val) => { onCategoryHeadingSave(headingCatModal, val); setHeadingCatModal(null); }}
          initialValues={data.categoryHeadings?.[headingCatModal] || {}}
        />
      )}
  {itemImageModal && mode === "decor" && (
  <ItemImageModal
    itemName={getLocalizedItemName(itemImageModal.item)}
    currentImages={itemImageModal.item.images || []}
    uploading={itemImageUploading}
    onClose={() => setItemImageModal(null)}
    onUpload={async (payload) => {
      setItemImageUploading(true);
      const ok = await onItemImageUpload(itemImageModal.catName, itemImageModal.item.id, payload);
      setItemImageUploading(false);
      if (ok) setItemImageModal(null);
    }}
  />
)}

{itemImageModal && mode !== "decor" && (
  <MenuItemImageModal
    itemName={getLocalizedItemName(itemImageModal.item)}
    currentImage={itemImageModal.item.imagePath}
    uploading={itemImageUploading}
    onClose={() => setItemImageModal(null)}
    onUpload={async (file) => {
      setItemImageUploading(true);
      const ok = await onMenuItemImageUpload(itemImageModal.catName, itemImageModal.item.id, file);
      setItemImageUploading(false);
      if (ok) setItemImageModal(null);
    }}
  />
)}

      <div className="w-full flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <DragDropContext
            onDragStart={internalOnDragStart}
            onDragEnd={internalOnDragEnd}
          >
            <Droppable droppableId="categories-droppable" type="CATEGORY">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3 p-3"
                >
                  {categoriesOrder.map((catName, catIdx) => {
                  const items = categories[catName] || [];
const displayCategoryName = catName;
const anyCount = packageCategoryLimits[catName] || 0;
const subLangKey = { en: "english", hi: "hindi", gu: "gujarati" }[currentLanguage] || "english";

const catSubText = data.categorySubTexts?.[catName]?.[subLangKey] || "";
const catHeadingText = data.categoryHeadings?.[catName]?.[subLangKey] || "";

const catSpace = data.categorySpaces?.[catName] || 0;
const catStatus = items[0]?.categoryStatus || "NORMAL";  

return (
  <Draggable
    key={catName}
    draggableId={`cat-${catName}`}
    index={catIdx}
  >
    {(provCat) => (
      <div
        ref={provCat.innerRef}
        {...provCat.draggableProps}
        className={`border rounded-xl shadow-sm p-3 ${getStatusClasses(catStatus, "category")}`}
      >
                            <div className="mb-3">
                              <div className="flex items-center justify-end gap-1 text-gray-500 mt-2">
                                {/* Addon toggle */}
                                <label
                                  className="flex items-center cursor-pointer"
                                  title="Mark category as Addon"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="relative">
                                    <input
                                      type="checkbox"
                                      className="sr-only"
                                      checked={!!addonState[catName]?.cat}
                                      onChange={() =>
                                        onToggleCategoryAddon(catName)
                                      }
                                    />
                                    <div
                                      className={`w-8 h-4 rounded-full transition-colors ${addonState[catName]?.cat ? "bg-primary" : "bg-gray-300"}`}
                                    />
                                    <div
                                      className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${addonState[catName]?.cat ? "translate-x-4" : ""}`}
                                    />
                                  </div>
                                </label>

                                {/* Category Space button */}
                                <button
                                  type="button"
                                  title="Set Category Space"
                                  className="p-1 rounded hover:bg-gray-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSpaceModal(catName);
                                  }}
                                >
                                  <Space
                                    size={20}
                                    className="text-indigo-600 bg-gray-200 rounded-md p-1"
                                  />
                                </button>
                                {mode === "menu" && (
                                 <button
                                  type="button"
                                  title="Rename item"
                                  className="p-1 rounded hover:bg-gray-100"
                                  onClick={(e) => { e.stopPropagation(); setRenameCatModal(catName); }}
                                >
                                  <i className="ki-filled ki-pencil text-[18px] text-gray-500" />
                                </button>
                                )}
                                <button
                                  type="button"
                                  title="Set Sub Category"
                                  className="p-1 rounded hover:bg-gray-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSubCatModal(catName);
                                  }}
                                >
                                  <span className="w-6 h-6 flex items-center justify-center text-amber-700 bg-amber-100 rounded-2xl text-sm font-extrabold border border-amber-300">
                                    <Plus size={14} />
                                  </span>
                                </button>

                                {mode === "menu" && (
                                  <button
                                    type="button"
                                    title="Set Category Heading"
                                    className="p-1 rounded hover:bg-gray-100"
                                    onClick={(e) => { e.stopPropagation(); setHeadingCatModal(catName); }}
                                  >
                                    <Heading size={18} className="text-teal-800 bg-teal-100 rounded-full p-0.5" />
                                  </button>
                                )}

                                {/* Background Image */}
                                <button
                                  type="button"
                                  title="Background Image"
                                  className="p-1 rounded hover:bg-gray-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImageModal({ catName, isCatImg: false });
                                  }}
                                >
                                  <i className="ki-filled ki-picture text-[18px] text-primary" />
                                </button>

                                {/* Category Image */}
                                <button
                                  type="button"
                                  title="Category Front Page"
                                  className="p-1 rounded hover:bg-gray-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImageModal({ catName, isCatImg: true });
                                  }}
                                >
                                  <UploadCloud
                                    size={20}
                                    className="text-emerald-600"
                                  />
                                </button>

                                {/* Notes */}
                                <img
                                  className="w-4 h-4 cursor-pointer"
                                  src={toAbsoluteUrl("/media/menu/notes.png")}
                                  alt="notes"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenCategoryNotes(catName);
                                  }}
                                />

                                <button
  type="button"
  title="Toggle Instructions"
  className="p-1 rounded hover:bg-gray-100"
  disabled={catStatus === "CANCELLED"}
  onClick={(e) => {
    e.stopPropagation();
    setExpandedCategoryInstructions((prev) => ({
      ...prev,
      [catName]: !(prev[catName] ?? !!categoryInstructionsMap[catName]),
    }));
  }}
>
  <ChevronDown size={18} />
</button>

                                {/* Delete category */}
                                <button
                                  type="button"
                                  className="text-red-500 hover:bg-gray-200 rounded p-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newCategories = { ...categories };
                                    delete newCategories[catName];
                                    const newCategoriesOrder =
                                      categoriesOrder.filter(
                                        (c) => c !== catName,
                                      );
                                    onDragEndNewState({
                                      categoriesOrder: newCategoriesOrder,
                                      categories: newCategories,
                                      categoryNotes: data.categoryNotes,
                                      categorySlogans: data.categorySlogans,
                                    });
                                  }}
                                >
                                  <i className="ki-filled ki-trash text-[18px]" />
                                </button>

                                {/* Collapse */}
                                <button
                                  type="button"
                                  onClick={() => toggleCategory(catName)}
                                  className="p-1 rounded hover:bg-gray-100"
                                >
                                  {expandedCategories[catName] ? (
                                    <i className="ki-filled ki-down text-[18px]" />
                                  ) : (
                                    <i className="ki-filled ki-up text-[18px]" />
                                  )}
                                </button>
                              </div>

                              <div className="flex items-start gap-2 min-w-0">
                                <span
                                  {...provCat.dragHandleProps}
                                  className="text-[#64748B] text-[22px] cursor-grab flex-shrink-0 mt-0.5"
                                >
                                  ⋮⋮
                                </span>
                                <p
                                  className={`font-medium flex flex-wrap items-center gap-1.5 ${addonState[catName]?.cat ? "text-primary" : "text-gray-800"}`}
                                >
                                  {catIdx + 1}.{" "}
                                 <span className={`text-sm font-bold uppercase tracking-widest text-red-800 px-2.5 py-1 rounded-md ${catStatus === "CANCELLED" ? "line-through" : ""}`}>
  {displayCategoryName}
</span>
                                  {anyCount > 0 && (
                                    <span className="text-[10px] font-semibold bg-orange-100 text-orange-600 border border-orange-300 px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap">
                                      Any {anyCount}
                                    </span>
                                  )}
                                  {addonState[catName]?.cat && (
                                    <span className="text-[10px] font-semibold bg-blue-100 text-primary border border-blue-300 px-1.5 py-0.5 rounded-full leading-none">
                                      Add-on
                                    </span>
                                  )}
                                  {catSpace > 0 && (
                                    <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-600 border border-indigo-300 px-1.5 py-0.5 rounded-full leading-none">
                                      Space: {catSpace}
                                    </span>
                                  )}
                                  {catSubText && (
                                    <span
                                      className="text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded-full leading-none"
                                      dangerouslySetInnerHTML={{ __html: `Sub: ${catSubText}` }}
                                    />
                                  )}
                                  {catHeadingText && (
                                    <span
                                      className="text-[10px] font-semibold bg-teal-100 text-teal-700 border border-teal-300 px-1.5 py-0.5 rounded-full leading-none"
                                      dangerouslySetInnerHTML={{ __html: catHeadingText }}
                                    />
                                  )}
                                </p>
                              </div>

                              {(expandedCategoryInstructions[catName] ?? !!categoryInstructionsMap[catName]) &&
  catStatus !== "CANCELLED" && (
    <textarea
      rows={2}
      placeholder="Add category instructions..."
      value={categoryInstructionsMap[catName] || ""}
      onChange={(e) => {
        onCategoryInstructionsChange(functionId, catName, e.target.value);
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="w-full mt-2 bg-white border border-gray-200 rounded-md p-1.5 text-sm text-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
    />
)}
{expandedCategoryInstructions[catName] && catStatus === "CANCELLED" && categoryInstructionsMap[catName] && (
  <div className="w-full mt-2 bg-gray-100 border border-gray-200 rounded-md p-1.5 text-sm text-gray-500 italic">
    {categoryInstructionsMap[catName]}
  </div>
)}

                              {/* ROW 2: all action buttons, right-aligned */}
                            </div>

                            {expandedCategories[catName] && (
                              <Droppable
                                droppableId={`cat-${catName}`}
                                type="ITEM"
                              >
                                {(provItems, snapshot) => (
                                  <div
                                    ref={provItems.innerRef}
                                    {...provItems.droppableProps}
                                    className={`space-y-2 rounded-lg transition-all duration-300 overflow-hidden ${snapshot.isDraggingOver ? "bg-blue-50" : ""} ${items.length === 0 ? "min-h-[56px] border-2 border-dashed border-gray-200 flex items-center justify-center" : "min-h-[40px]"}`}
                                  >
                                    {items.length === 0 ? (
                                      <p className="text-xs text-gray-400 text-center py-2 select-none pointer-events-none">
                                        {anyCount > 0
                                          ? `Select any ${anyCount} item${anyCount !== 1 ? "s" : ""}`
                                          : "No items yet — drag or select items here"}
                                      </p>
                                    ) : (
                                      items.map((item, idx) => (
                                        <ItemRow
                                           isPrimary={!!primaryItems[catName]?.[item.id]}
                                           onSelectPrimaryItem={onSelectPrimaryItem}
                                           onRenameItemSave={onRenameItemSave}
                                             mode={mode}
                                          rowRef={(el) => {
                                            itemRowRefs.current[
                                              `${catName}__${item.id}`
                                            ] = el;
                                          }}
                                          key={`${catName}__${item.id}`}
                                          item={item}
                                          idx={idx}
                                          catName={catName}
                                          functionId={functionId}
                                          showRates={showRates}
                                          showImage={showImage}
                                          onRateChange={onRateChange}
                                          onOpenItemNotes={onOpenItemNotes}
                                          onOpenItemIns={onOpenItemIns}
                                          onRemove={onRemove}
                                          onInstructionsChange={
                                            onInstructionsChange
                                          }
                                          displayItemName={getLocalizedItemName(
                                            item,
                                          )}
                                          sequenceNumber={
                                            sequenceMap[
                                              `${catName}__${item.id}`
                                            ] ?? idx + 1
                                          }
                                          
                                          isItemAddons={
                                            !!addonState[catName]?.items?.[
                                              item.id
                                            ]
                                          }
                                          onItemSpaceSave={onItemSpaceSave}
                                          onToggleItemAddon={
                                            handleToggleItemAddon
                                          }
                                          onItemSubSave={onItemSubSave}
                                            onItemHeadingSave={onItemHeadingSave}   
                                           instruction={itemInstructions[item.id] || ""} 
                                            onQtyChange={onQtyChange}
                                            itemStatus={item.itemStatus} 
                                            onOpenItemImage={(catName, item) => setItemImageModal({ catName, item })}
                                             onVendorSave={onVendorSave}
                                        />
                                      ))
                                    )}
                                    {provItems.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
 
     <div className="border-t bg-white p-3 mt-auto">
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-700 font-medium">
      Total Items: <span className="font-semibold text-gray-900">{totalItems}</span>
    </span>
    <span className="text-gray-700 font-medium">
      Total Rate: <span className="font-semibold text-gray-900">₹ {totalRate.toFixed(2)}</span>
    </span>
  </div>

  {addonRate > 0 && (() => {
    const isPackage = !!packageInfo;
    const baseRate = isPackage ? Number(packageInfo.packagePrice) : Number(functionRate);
    const label = isPackage ? "Package Rate" : "Function Rate";
    return (
      <div className="flex items-center justify-between text-sm mt-1 pt-1 border-t border-gray-100">
        <span className="text-gray-700 font-medium">{label} + Addon:</span>
        <span className="font-semibold text-primary">
          ₹ {baseRate.toFixed(2)} + ₹ {addonRate.toFixed(2)}{" "}
          <span className="text-gray-700 font-semibold text-sm">
            = ₹ {(baseRate + addonRate).toFixed(2)}
          </span>
        </span>
      </div>
    );
  })()}
</div>
      </div>
    </>
  );
};

export default SelectedItems;


