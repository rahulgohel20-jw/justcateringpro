          import {
          Fragment,
          useEffect,
          useState,
          useCallback,
          useMemo,
          useRef,
          } from "react";
          import { toAbsoluteUrl } from "@/utils";
          import MenuItemGrid from "./components/MenuItemGrid";
          import SelectedItems from "./components/SelectedItems";
          import FunctionCard from "./components/FunctionCard";
          import CategoryList from "./components/CategoryList";
          import SearchInput from "./components/SearchInput";
          import {
          Mic,
          Eye,
          EyeOff,
          Menu,
          MenuIcon,
          NotebookPen,
          CaseUpper,
          IndianRupee,
          Calendar,
          Sparkles,
          Wand2,
          Loader2,
          CheckCircle2,
          X,
          ChevronDown,
          Search,
          UtensilsCrossed,
          Palette,
          ChefHat,
          FileText 
          } from "lucide-react";
          import Swal from "sweetalert2";
          import { Tooltip } from "antd";
          import {
          GetEventMasterById,
          Getmenuprep,
          AddMenuprep,
          GetCustomPackageapibyID,
          Translateapi,
          GetExtraCharges,
          GenerateMenuAi,
          GetAllAiTemplates,
          GetCustomPackageapi,
          getbymenucategorywithtype,
          SearchCategoryformenu,
          GenerateMenuLink,
          GetPreparationStatus ,
          ChangePreparationStatus,
          GetDecorPackageById, 
          GetAllRawMaterial,
          GetRawMaterialcategory,
          GetPermissableNonPermissable,
          UploadDecorImagePlanning ,
          UploadMenuItemImage,
          } from "@/services/apiServices";
          import AddMenuItem from "@/partials/modals/add-menu-item/AddMenuItem";
          import AddMenuCategory from "@/partials/modals/add-menu-category/AddMenuCategory";
          import { useParams, useNavigate, useBlocker } from "react-router-dom";
          import SelectMenureport from "../../../partials/modals/menu-report/SelectMenureport";
          import CustomPackageModal from "@/partials/modals/customepackagemodal/CustomPackageModal";
          import MenuNotes from "@/partials/modals/menu-notes/MenuNotes";
          import CategoryNotes from "@/partials/modals/category-note/CategoryNotes";
          import AllCustomerToogle from "@/components/modal/AllCustomerToggle";
          import EditPaxModal from "./components/EditFunctionDetailsModal";
          import CopyMenuPlanning from "../../../partials/modals/copy-menuplanning/CopyMenuPlanning";
          import { AddLogs, GetCopyMenuPlanning, GetCopyDecorPlanning  } from "../../../services/apiServices";
          import { ChevronLeft, ChevronRight } from "lucide-react";
          import MenuIns from "../../../partials/modals/menu-notes/MenuIns";
          import ExtraCharge from "../../../partials/modals/add-extra-charge/ExtraCharge";
          import { usePermission } from "../../../hooks/usePermission";
          import DatePicker from "react-datepicker";
          import "react-datepicker/dist/react-datepicker.css";
          import { useModuleAccess } from "../../../hooks/useModuleAccess";
          import FoodFestivalModal from "../../../partials/modals/food-festival/FoodFestivalModal";
          import RevisionHistoryModal from "../../../partials/modals/revision-history/RevisionHistoryModal";
          import { getPlanningConfig } from "./planningConfig";
          import AdvancePaymentModal from "../../../partials/modals/advance-payment-status/AdvancePaymentModal";
          import AddDecorItemModal from "../../../partials/modals/add-decor-item/AddDecorItem";
          import AddDecorCategoryModal from "../../../partials/modals/add-decor-category/AddDecorCategory";
          import EventWiseTermsCondition from "../../../components/usertermscondition/EventWiseTermsCondition";
          import { useNetworkSpeed } from "../../../hooks/useNetworkSpeed";
          import { FormattedMessage, useIntl } from "react-intl";
          import PermissableNonPermissableModal from "../../../partials/modals/permissable-nonpermissable/PermissableNonPermissableModal";
          import EditFunctionDetailsModal from "./components/EditFunctionDetailsModal";
import { QRCodeCanvas } from "qrcode.react";


          const SearchWithSuggestions = ({
          value,
          onChange,
          allMenuItems,
          selectedIdsSet,
          onToggleSelect,
          category,
          getLocalizedCategoryName,
          selectedFunctionId,
          userId,
          }) => {
          const itemRefs = useRef([]);
          const [showDropdown, setShowDropdown] = useState(false);
          const [activeIdx, setActiveIdx] = useState(-1);

          const suggestions = useMemo(() => {
          if (!value.trim()) return [];
          const lower = value.trim().toLowerCase();

          const score = (item) => {
          const name = (item.menuItemName || "").toLowerCase();
          const nameHi = (item.menuItemNameHindi || "").toLowerCase();
          const nameGu = (item.menuItemNameGujarati || "").toLowerCase();
          if (name === lower || nameHi === lower || nameGu === lower) return 0;
          if (name.startsWith(lower) || nameHi.startsWith(lower) || nameGu.startsWith(lower)) return 1;
          return 2;
          };

          return [...allMenuItems]
          .sort((a, b) => score(a) - score(b))
          .slice(0, 50);
          }, [value, allMenuItems]);

          const grouped = suggestions.reduce((acc, item) => {
          const cat =
            (getLocalizedCategoryName ? getLocalizedCategoryName(item) : null) ||
            item.menuCategoryName ||
            "Uncategorized";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(item);
          return acc;
          }, {});

          const flatSuggestions = Object.values(grouped).flat();

          const highlight = (text, query, isActive) => {
          if (!query || !text) return text;

          const parts = text.split(
            new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
          );

          return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ? (
              <mark
                key={i}
                className={`rounded px-0.5 ${
                  isActive ? "bg-white/20 text-white" : "bg-blue-100 text-blue-800"
                }`}
              >
                {part}
              </mark>
            ) : (
              part
            ),
          );
          };
          const numericId = (item) => Number(item.menuItemId || item.id);
          const isSelected = (item) =>
          selectedIdsSet.has(numericId(item)) ||
          selectedIdsSet.has(String(numericId(item)));

          const handleSelect = (item) => {
          const catName =
            category !== "All"
              ? category
              : (getLocalizedCategoryName ? getLocalizedCategoryName(item) : null) ||
                item.menuCategoryName ||
                "Uncategorized";
          onToggleSelect(item, catName);
          onChange("");
          setShowDropdown(false);
          setActiveIdx(-1);
          };

          const handleKeyDown = (e) => {
          if (!showDropdown || !flatSuggestions.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIdx((prev) => Math.min(prev + 1, flatSuggestions.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIdx((prev) => Math.max(prev - 1, -1));
          } else if (e.key === "Enter" && activeIdx >= 0) {
            handleSelect(flatSuggestions[activeIdx]);
          } else if (e.key === "Escape") {
            setShowDropdown(false);
          }
          };

          useEffect(() => {
          if (activeIdx >= 0 && itemRefs.current[activeIdx]) {
            itemRefs.current[activeIdx].scrollIntoView({
              block: "nearest",
            });
          }
          }, [activeIdx]);
          return (
          <div className="relative flex items-center gap-1 flex-1">
            <div className="relative flex-1">
              <input
                type="text"
                className="input input-md w-full pr-7"
                placeholder="Search items"
                value={value}
                autoComplete="off"
                onChange={(e) => {
                  onChange(e.target.value);
                  setShowDropdown(true);
                  setActiveIdx(-1);
                }}
                onFocus={() => {
                  if (value) setShowDropdown(true);
                }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                onKeyDown={handleKeyDown}
              />
              {value && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-base leading-none"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange("");
                    setShowDropdown(false);
                  }}
                >
                  ×
                </button>
              )}

              {showDropdown && value.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-72 overflow-y-auto">
                  {flatSuggestions.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No items found
                    </div>
                  ) : (
                    Object.entries(grouped).map(([catName, items]) => (
                      <div key={catName}>
                        <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                          {catName}
                        </div>
                        {items.map((item) => {
                          const flatIdx = flatSuggestions.indexOf(item);
                          const selected = isSelected(item);
                          return (
                            <div
                              ref={(el) => (itemRefs.current[flatIdx] = el)}
                              key={item.menuItemId || item.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelect(item);
                              }}
                              onMouseEnter={() => setActiveIdx(flatIdx)}
                              className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-gray-50 last:border-0 
                                ${activeIdx === flatIdx ? "bg-primary" : "hover:bg-gray-50"}`}
                            >
                              <div className="w-8 h-8 rounded-md bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {item.imagePath &&
                                item.imagePath !== "null" &&
                                /\.(jpg|jpeg|png|webp|gif)$/i.test(item.imagePath) ? (
                                  <img
                                    src={item.imagePath}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    {(item.menuItemName || "").slice(0, 2)}
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div
                                  className={`text-sm truncate ${
                                    activeIdx === flatIdx
                                      ? "text-white"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {highlight(
                                    item.menuItemName || "",
                                    value,
                                    activeIdx === flatIdx,
                                  )}
                                </div>
                                <div className="text-xs text-white">{catName}</div>
                              </div>

                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0
                                ${selected ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-600"}`}
                              >
                                {selected ? "✓ Added" : "+ Add"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          );
          };

          const getUserEmail = () => {
          try {
          const authStorage = localStorage.getItem("auth-storage");
          if (!authStorage) return "";
          const parsed = JSON.parse(authStorage);
          return parsed?.state?.user?.email || "";
          } catch {
          return "";
          }
          };

          const SearchWithCategorySuggestions = ({
          value,
          onChange,
          onAdd,
          selectedCategoryId,
          onCategoryChange,
          refreshKey,
          packageCategories,
          savedCategoriesOrder,
          isDisabled,
          userId,
          searchCategoriesFn = null,
          }) => {
          const [showDropdown, setShowDropdown] = useState(false);
          const [categories, setCategories] = useState([]);
          const [loading, setLoading] = useState(false);
          const [activeIdx, setActiveIdx] = useState(-1);
          const dropdownRef = useRef(null);
          const itemRefs = useRef([]);

          useEffect(() => {
          const fetchCats = async () => {
            if (!userId) return;
            setLoading(true);
            try {
              // ── USE searchCategoriesFn IF PROVIDED ──
              const raw = searchCategoriesFn
                ? await searchCategoriesFn(userId, value)
                : (await SearchCategoryformenu(userId, value))?.data?.data?.["Menu Category Details"] || [];
              setCategories(raw);
            } catch (err) {
              console.error("Category fetch error:", err);
              setCategories([]);
            } finally {
              setLoading(false);
            }
          };
          const timer = setTimeout(fetchCats, 250);
          return () => clearTimeout(timer);
          }, [value, refreshKey, userId, searchCategoriesFn]); 

          // close on outside click
          useEffect(() => {
          const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
              setShowDropdown(false);
          };
          document.addEventListener("mousedown", handler);
          return () => document.removeEventListener("mousedown", handler);
          }, []);

          // scroll active into view
          useEffect(() => {
          if (activeIdx >= 0 && itemRefs.current[activeIdx]) {
            itemRefs.current[activeIdx].scrollIntoView({ block: "nearest" });
          }
          }, [activeIdx]);

          const filtered = categories;

          const highlight = (text, query) => {
          if (!query || !text) return text;
          const parts = text.split(
            new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
          );
          return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ? (
              <mark key={i} className="rounded px-0.5 bg-blue-100 text-blue-800">
                {part}
              </mark>
            ) : (
              part
            ),
          );
          };

          const handleSelect = (cat) => {
          onCategoryChange(cat.nameEnglish, cat.id, cat);
          onChange("");
          setShowDropdown(false);
          setActiveIdx(-1);
          };

          const handleKeyDown = (e) => {
          if (!showDropdown) return;
          const total = filtered.length + 1; // +1 for "All"
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIdx((p) => Math.min(p + 1, total - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIdx((p) => Math.max(p - 1, -1));
          } else if (e.key === "Enter" && activeIdx === 0) {
            onCategoryChange("All", 0, {
              id: 0,
              nameEnglish: "All",
              nameHindi: "सभी",
              nameGujarati: "બધા",
            });
            onChange("");
            setShowDropdown(false);
            setActiveIdx(-1);
          } else if (e.key === "Enter" && activeIdx > 0) {
            handleSelect(filtered[activeIdx - 1]);
          } else if (e.key === "Escape") {
            setShowDropdown(false);
          }
          };

          return (
          <div className="relative" ref={dropdownRef}>
            {/* Search bar */}
            <div className="flex items-center gap-1 p-3 border-b">
              <div className="relative flex-1">
                <input
                  type="text"
                  className="input input-md w-full pr-7"
                  placeholder="Search categories"
                  value={value}
                  autoComplete="off"
                  disabled={isDisabled}
                  onChange={(e) => {
                    onChange(e.target.value);
                    setShowDropdown(true);
                    setActiveIdx(-1);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  onKeyDown={handleKeyDown}
                />
                {value && (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-base leading-none"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChange("");
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
              {onAdd && (
                <button
                  type="button"
                  onClick={onAdd}
                  className="btn btn-primary w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
                >
                  <i className="ki-filled ki-plus text-md" />
                </button>
              )}
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <div
                className="absolute left-0 right-0 z-50 bg-white border border-gray-200 rounded-b-lg shadow-lg overflow-hidden"
                style={{ top: "100%", maxHeight: 280, overflowY: "auto" }}
              >
                {/* All option */}
                <div
                  ref={(el) => (itemRefs.current[0] = el)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onCategoryChange("All", 0, {
                      id: 0,
                      nameEnglish: "All",
                      nameHindi: "सभी",
                      nameGujarati: "બધા",
                    });
                    onChange("");
                    setShowDropdown(false);
                    setActiveIdx(-1);
                  }}
                  onMouseEnter={() => setActiveIdx(0)}
                  className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer border-b border-gray-100
                    ${activeIdx === 0 ? "bg-primary" : selectedCategoryId === 0 ? "bg-primary/10" : "hover:bg-gray-50"}`}
                >
                  <span
                    className={`text-sm font-semibold ${activeIdx === 0 ? "text-white" : selectedCategoryId === 0 ? "text-primary" : "text-gray-700"}`}
                  >
                    All Categories
                  </span>
                  {selectedCategoryId === 0 && activeIdx !== 0 && (
                    <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      Active
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="px-3 py-4 text-sm text-gray-400 text-center flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                    Loading…
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="px-3 py-3 text-sm text-gray-400 text-center">
                    No categories found
                  </div>
                ) : (
                  filtered.map((cat, idx) => {
                    const flatIdx = idx + 1; // offset by 1 for "All"
                    const isActive = activeIdx === flatIdx;
                    const isSelected = selectedCategoryId === cat.id;
                    const isAdded = savedCategoriesOrder.includes(cat.nameEnglish);
                    const isPkg = packageCategories.includes(cat.nameEnglish);

                    return (
                      <div
                        key={cat.id}
                        ref={(el) => (itemRefs.current[flatIdx] = el)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelect(cat);
                        }}
                        onMouseEnter={() => setActiveIdx(flatIdx)}
                        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer border-b border-gray-50 last:border-0
                          ${isActive ? "bg-primary" : isSelected ? "bg-primary/10" : "hover:bg-gray-50"}`}
                      >
                        {/* Category image or initials */}
                        <div className="w-7 h-7 rounded-md bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {cat.imagePath && cat.imagePath !== "" ? (
                            <img
                              src={cat.imagePath}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span
                              className={`text-xs font-bold ${isActive ? "text-primary" : "text-gray-400"}`}
                            >
                              {cat.nameEnglish?.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Names */}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-sm truncate font-medium ${isActive ? "text-white" : isSelected ? "text-primary" : "text-gray-900"}`}
                          >
                            {highlight(cat.nameEnglish, value)}
                          </div>
                          {cat.nameHindi && (
                            <div
                              className={`text-xs truncate ${isActive ? "text-white/70" : "text-gray-400"}`}
                            >
                              {cat.nameHindi}
                            </div>
                          )}
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* {isAdded && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold
                              ${isActive ? "bg-white/20 text-white" : "bg-green-100 text-green-700"}`}>
                              ✓ Added
                            </span>
                          )} */}
                          {isPkg && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold
                              ${isActive ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"}`}
                            >
                              Pkg
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
          );
          };

          const EventPlanningPage = ({ mode = "menu" }) => {
          useNetworkSpeed({ enabled: true });
          const intl = useIntl();

          const scrollRef = useRef(null);
          const selectedItemsPanelRef = useRef(null);
          let { eventId } = useParams();
          const navigate = useNavigate();
          const [eventData, setEventData] = useState(null);
          const [loading, setLoading] = useState(true);
          const [error, setError] = useState(null);
          const [personCount, setPersonCount] = useState("");
          const [defaultRate, setDefaultRate] = useState("");
          const [selectedFunction, setSelectedFunction] = useState(null);
          const [isSaving, setIsSaving] = useState(false);
          const [hasExistingData, setHasExistingData] = useState(false);
          const [isSelectMenuReport, setIsSelectMenuReport] = useState(false);
          const [isMenuReport, setIsMenuReport] = useState(false);
          const [menuReportEventId, setMenuReportEventId] = useState(null);
          const [showCustomPackageModal, setShowCustomPackageModal] = useState(false);
          const [packageAppliedForFunction, setPackageAppliedForFunction] = useState(
          {},
          );
          const [selectedByFunction, setSelectedByFunction] = useState({});
          const [packageCategoriesByFunction, setPackageCategoriesByFunction] =
          useState({});
          const [packageItemsByFunction, setPackageItemsByFunction] = useState({});
          const [isItemModalOpen, setIsItemModalOpen] = useState(false);
          const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
          const [selectedCategory, setSelectedCategory] = useState("All");
          const [selectedCategoryId, setSelectedCategoryId] = useState(0);
          const [categorySearchTerm, setCategorySearchTerm] = useState("");
          const [itemSearchTerm, setItemSearchTerm] = useState("");

          const [showRates, setShowRates] = useState(false);
          const [showImage, setShowImage] = useState(false);
          const [packageInfoByFunction, setPackageInfoByFunction] = useState({});

          const [packageCategoryLimitsByFunction, setPackageCategoryLimitsByFunction] =
          useState({});

          const [showNoteModal, setShowNoteModal] = useState(false);
          const [showInsModal, setShowInsModal] = useState(false);
          const [showCategoryNoteModal, setShowCategoryNoteModal] = useState(false);
          const [refreshList, setRefreshList] = useState(false);
          const [currentItemForNotes, setCurrentItemForNotes] = useState(null);
          const [currentCategoryForNotes, setCurrentCategoryForNotes] = useState(null);
          const [itemNotes, setItemNotes] = useState("");
          const [categoryNotes, setCategoryNotes] = useState("");
          const userId = localStorage.getItem("userId");
          const [editPax, setEditPax] = useState(false);
          const [isDirty, setIsDirty] = useState(false);
          const [isCopyMenuModalOpen, setIsCopyMenuModalOpen] = useState(false);
          const [addonState, setAddonState] = useState({});
          const [allMenuItemsForSuggestion, setAllMenuItemsForSuggestion] = useState(
          [],
          );
          const allMenuItemsRef = useRef([]);
          const [extraChargesData, setExtraChargesData] = useState(null);
          const [extraChargesLoading, setExtraChargesLoading] = useState(false);
          const [showExtraChargesModal, setShowExtraChargesModal] = useState(false);
          const [isMenuItemLoading, setIsMenuItemLoading] = useState(false);
          const [categoryImagesByFunction, setCategoryImagesByFunction] = useState({});

          const permMenuExecution = usePermission("Menu Execution");
          const permRawMaterial = usePermission("Raw Material Distribution");
          const permAgencyDistribution = usePermission("Labour Agency Order");
          const permPerDishCosting = usePermission("Per Dish Costing");

          const permMenuPlanning = usePermission("Menu Planning");
          const canEdit = permMenuPlanning.edit;

          const permQuotation = usePermission("Quotation");

          const [categorySpacesByFunction, setCategorySpacesByFunction] = useState({});
          const [itemSpacesByFunction, setItemSpacesByFunction] = useState({});
          const isSavingRef = useRef(false);
          const saveClickCountRef = useRef(0);
          const [saveProgress, setSaveProgress] = useState(0);
          const saveProgressRef = useRef(0);
          const progressAnimRef = useRef(null);
          const [isSubmitting, setIsSubmitting] = useState(false);

          const [showAiModal, setShowAiModal] = useState(false);
          const [aiTemplates, setAiTemplates] = useState([]);
          const [aiPackages, setAiPackages] = useState([]);
          const [aiTemplateId, setAiTemplateId] = useState(null);
          const [aiFunctionName, setAiFunctionName] = useState("");
          const [aiPackageId, setAiPackageId] = useState(null);
          const [aiGenerating, setAiGenerating] = useState(false);
          const [aiDone, setAiDone] = useState(false);
          const [aiTplLoading, setAiTplLoading] = useState(false);
          const [aiPkgLoading, setAiPkgLoading] = useState(false);
          const [aiTemplateSearch, setAiTemplateSearch] = useState("");
          const [aiPackageSearch, setAiPackageSearch] = useState("");
          const [aiTplOpen, setAiTplOpen] = useState(false);
          const [aiPkgOpen, setAiPkgOpen] = useState(false);
          const [aiLoadingMessage, setAiLoadingMessage] = useState("");
          const [aiProgress, setAiProgress] = useState(0);

          const [showShareModal, setShowShareModal] = useState(false);

          const [shareAccessCode, setShareAccessCode] = useState("");

          const [shareLoading, setShareLoading] = useState(false);
          const [shareLink, setShareLink] = useState("");
          const [showFoodFestivalModal, setShowFoodFestivalModal] = useState(false);
          const [prepStatus, setPrepStatus] = useState(null);
          const [prepStatusLoading, setPrepStatusLoading] = useState(false);

          const { hasModuleAccess } = useModuleAccess();

          const canAccessStock = hasModuleAccess("AI Menu")
          const canAccessMenuLink = hasModuleAccess("Menu Share Link");
          const canAccessFoodFestival = hasModuleAccess("Food Taste Festival")
          const canAccessDecor = hasModuleAccess("Decor");
          const canAccessMenuExtraFeature = hasModuleAccess("Menu Extra Features")
          const canAccessBanquet = hasModuleAccess("Banquet")
          const currentUserId = Number(localStorage.getItem("userId"));
          const isHighlightUser = currentUserId === 195;
          const [showRevisionHistory, setShowRevisionHistory] = useState(false);
          const [showTermsModal, setShowTermsModal] = useState(false);
          const isComplete = ["COMPLETED", "Complete", "Completed", "2", 2].includes(prepStatus);
          const [primaryItemsByFunction, setPrimaryItemsByFunction] = useState({});
          const [catalogItems, setCatalogItems] = useState([]); 
          const [isPrepLoading, setIsPrepLoading] = useState(false);
          const shouldDisableNavButtons = canAccessMenuExtraFeature && !isComplete;

          const cfg = getPlanningConfig(mode);
          const [showAdvancePayment, setShowAdvancePayment] = useState(false);
          const [showSelectedSheet, setShowSelectedSheet] = useState(false);
          const [permissionRawMaterials, setPermissionRawMaterials] = useState(null);
          const [showPermissableModal, setShowPermissableModal] = useState(false);
          const [rawMaterials, setRawMaterials] = useState([]);
          const [rawMaterialCategories, setRawMaterialCategories] = useState([]);
          const [rawMaterialPage, setRawMaterialPage] = useState(1);
          const [rawMaterialHasMore, setRawMaterialHasMore] = useState(true);
          const [rawMaterialLoading, setRawMaterialLoading] = useState(false);
          const [rawMaterialCategoryFilter, setRawMaterialCategoryFilter] = useState(0);
          const [rawMaterialNameMap, setRawMaterialNameMap] = useState({});
          const lastSavedPermissionRawMaterialsRef = useRef(null);



          const totalSelectedCount = useMemo(() => {
          const bucket = selectedByFunction[selectedFunction];
          if (!bucket || !bucket.categories) return 0;
          return Object.values(bucket.categories).reduce((sum, items) => sum + items.length, 0);
          }, [selectedByFunction, selectedFunction]);


          const AI_LOADING_MESSAGES = [
          " Analyzing your event details...",
          " AI is thinking about the perfect menu...",
          " Selecting the finest dishes for you...",
          " Balancing flavors and categories...",
          " Almost there, crafting your menu...",
          " Applying culinary expertise...",
          " Organizing categories and items...",
          " Finalizing your AI-generated menu...",
          ];


          const blocker = useBlocker(
          ({ currentLocation, nextLocation }) =>
            isDirty && canEdit && currentLocation.pathname !== nextLocation.pathname,
          );




          const copyToClipboard = (text, label = "Copied!") => {
          const showSuccess = () =>
          Swal.fire({ icon: "success", title: label, timer: 1200, showConfirmButton: false });


          if (navigator?.clipboard?.writeText) {
          navigator.clipboard.writeText(text).then(showSuccess).catch(() => fallback(text, showSuccess));
          return;
          }
          fallback(text, showSuccess);
          };

          const fallback = (text, cb) => {
          try {
          const el = document.createElement("textarea");
          el.value = text;
          el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
          document.body.appendChild(el);
          el.focus();
          el.select();
          document.execCommand("copy");
          document.body.removeChild(el);
          cb?.();
          } catch {
          Swal.fire({ icon: "error", title: "Copy failed", text: "Please copy manually." });
          }
          };

          const handleSubCatSave = useCallback(
          (catName, value) => {
            if (!selectedFunction) return;
            setIsDirty(true);
            setSelectedByFunction((prev) => {
              const bucket = prev[selectedFunction];
              if (!bucket) return prev;
              return {
                ...prev,
                [selectedFunction]: {
                  ...bucket,
                  categorySubTexts: {
                    ...(bucket.categorySubTexts || {}),
                    [catName]: value,
                  },
                },
              };
            });
          },
          [selectedFunction],
          );
          const handleCategoryHeadingSave = useCallback(
  (catName, value) => {
    if (!selectedFunction) return;
    setIsDirty(true);
    setSelectedByFunction((prev) => {
      const bucket = prev[selectedFunction];
      if (!bucket) return prev;
      return {
        ...prev,
        [selectedFunction]: {
          ...bucket,
          categoryHeadings: {
            ...(bucket.categoryHeadings || {}),
            [catName]: value,
          },
        },
      };
    });
  },
  [selectedFunction],
);

          const handleItemSubSave = useCallback(
          (catName, itemId, value) => {
            if (!selectedFunction) return;
            setIsDirty(true);
            setSelectedByFunction((prev) => {
              const bucket = prev[selectedFunction];
              if (!bucket) return prev;
              const categories = { ...bucket.categories };
              categories[catName] = (categories[catName] || []).map((item) =>
                Number(item.id) === Number(itemId)
                  ? {
                      ...item,
                      subItem: value.english,
                      subItemHindi: value.hindi,
                      subItemGujarati: value.gujarati,
                    }
                  : item,
              );
              return { ...prev, [selectedFunction]: { ...bucket, categories } };
            });
          },
          [selectedFunction],
          );

          const handleItemHeadingSave = useCallback(
          (catName, itemId, value) => {
          if (!selectedFunction) return;
          setIsDirty(true);
          setSelectedByFunction((prev) => {
            const bucket = prev[selectedFunction];
            if (!bucket) return prev;
            const categories = { ...bucket.categories };
            categories[catName] = (categories[catName] || []).map((item) =>
              Number(item.id) === Number(itemId)
                ? {
                    ...item,
                    itemHeading: value.english,
                    itemHeadingHindi: value.hindi,
                    itemHeadingGujarati: value.gujarati,
                  }
                : item,
            );
            return { ...prev, [selectedFunction]: { ...bucket, categories } };
          });
          },
          [selectedFunction],
          );

          const handleGenerateShareLink = async () => {
          const payload = {
          eventFunctionId: Number(selectedFunction),
          eventId: Number(eventId),
          packageId: Number(packageInfoByFunction[selectedFunction]?.packageId || 0),
          userId: Number(userId),
          };

          try {
          setShareLoading(true);
          const res = await GenerateMenuLink(payload);
          if (res?.data?.success) {
            const shareToken = res.data.data.token;
            const accessCode = res.data.data.accessCode || "";


            const currentUserToken = localStorage.getItem("userToken");

            
            const frontendLink = `${window.location.origin}/menu-share/verify?token=${shareToken}&ut=${encodeURIComponent(currentUserToken)}`;
            
            setShareLink(frontendLink);
            setShareAccessCode(accessCode);
          } else {
            Swal.fire({ icon: "error", title: res?.data?.msg || "Failed to generate link" });
          }
          } catch (err) {
          Swal.fire({ icon: "error", title: err?.response?.data?.msg || "Something went wrong" });
          } finally {
          setShareLoading(false);
          }
          };

          const handleCategorySpaceSave = useCallback(
          (catName, spaceValue) => {
            if (!selectedFunction || !catName) return;
            setIsDirty(true);
            setCategorySpacesByFunction((prev) => ({
              ...prev,
              [selectedFunction]: {
                ...(prev[selectedFunction] || {}),
                [catName]: Number(spaceValue),
              },
            }));
          },
          [selectedFunction],
          );

          const handleItemSpaceSave = useCallback(
          (catName, itemId, spaceValue) => {
            if (!selectedFunction) return;
            setIsDirty(true);
            setSelectedByFunction((prev) => {
              const bucket = prev[selectedFunction];
              if (!bucket) return prev;
              const categories = { ...bucket.categories };
              categories[catName] = (categories[catName] || []).map((item) =>
                Number(item.id) === Number(itemId)
                  ? { ...item, itemSpace: Number(spaceValue) }
                  : item,
              );
              return { ...prev, [selectedFunction]: { ...bucket, categories } };
            });
          },
          [selectedFunction],
          );

          const handleVendorSave = useCallback(
  (catName, itemId, vendor) => {
    if (!selectedFunction) return;
    setIsDirty(true);
    setSelectedByFunction((prev) => {
      const bucket = prev[selectedFunction];
      if (!bucket) return prev;
      const categories = { ...bucket.categories };
      categories[catName] = (categories[catName] || []).map((item) =>
        Number(item.id) === Number(itemId)
          ? { ...item, vendorId: vendor.vendorId, vendorName: vendor.vendorName }
          : item,
      );
      return { ...prev, [selectedFunction]: { ...bucket, categories } };
    });
  },
  [selectedFunction],
);

          const handleRenameItem = useCallback((catName, itemId, val) => {
          setIsDirty(true);
          setSelectedByFunction((prev) => {
          const bucket = prev[selectedFunction];
          if (!bucket) return prev;
          // Store rename separately — do NOT overwrite nameEnglish
          return {
            ...prev,
            [selectedFunction]: {
              ...bucket,
              itemRenames: {
                ...(bucket.itemRenames || {}),
                [itemId]: val,
              },
            },
          };
          });
          }, [selectedFunction]);


          const handleRenameCat = useCallback((catName, val) => {
          console.log("Renaming", catName, "to", val);
          setIsDirty(true);
          setSelectedByFunction((prev) => {
          const bucket = prev[selectedFunction];
          if (!bucket) return prev;
          return {
            ...prev,
            [selectedFunction]: {
              ...bucket,
              categoryRenames: { ...(bucket.categoryRenames || {}), [catName]: val },
            },
          };
          });
          }, [selectedFunction]);

          const handleQtyChange = useCallback(
          (functionId, categoryName, itemId, newQty) => {
          setIsDirty(true);
          setSelectedByFunction((prev) => {
            const bucket = prev[functionId];
            if (!bucket) return prev;
            const categories = { ...bucket.categories };
            categories[categoryName] = (categories[categoryName] || []).map((item) =>
              Number(item.id) === Number(itemId)
                ? { ...item, itemQty: newQty }
                : item,
            );
            return { ...prev, [functionId]: { ...bucket, categories } };
          });
          },
          [],
          );
          const scroll = (direction) => {
          if (scrollRef.current) {
            const scrollAmount = 250;
            scrollRef.current.scrollBy({
              left: direction === "left" ? -scrollAmount : scrollAmount,
              behavior: "smooth",
            });
          }
          };

          const openAiModal = async () => {
          setShowAiModal(true);
          setAiDone(false);
          setAiGenerating(false);
          setAiTemplateId(null);
          setAiPackageId(null);
          setAiTemplateSearch("");
          setAiPackageSearch("");


          const fn = eventData?.eventFunctions?.find(
            (f) => f.id === selectedFunction,
          );
          setAiFunctionName(fn?.function?.nameEnglish || fn?.nameEnglish || "");


          setAiTplLoading(true);
          try {
            const r = await GetAllAiTemplates(userId);

            setAiTemplates(r?.data?.data?.AITemplates || []);
          } finally {
            setAiTplLoading(false);
          }


          setAiPkgLoading(true);
          try {
            const r = await GetCustomPackageapi(userId);
            setAiPackages(r?.data?.data?.["Package Details"] || []);
          } finally {
            setAiPkgLoading(false);
          }
          };

          const handleAiGenerate = async () => {
          if (!aiTemplateId) return;
          setAiGenerating(true);
          setAiProgress(0);
          setShowAiModal(false);


          let msgIdx = 0;
          setAiLoadingMessage(AI_LOADING_MESSAGES[0]);
          const msgInterval = setInterval(() => {
            msgIdx = (msgIdx + 1) % AI_LOADING_MESSAGES.length;
            setAiLoadingMessage(AI_LOADING_MESSAGES[msgIdx]);
          }, 1800);

          let currentProgress = 0;
          const progressInterval = setInterval(() => {
            currentProgress += 1;
            if (currentProgress <= 85) {
              setAiProgress(currentProgress);
            } else {
              clearInterval(progressInterval);
            }
          }, 120); 

          try {
            const resp = await GenerateMenuAi({
              aiTemplateId: aiTemplateId,
              functionName: aiFunctionName,
              packageId: aiPackageId || 0,
              userId: Number(userId) || 0,
            });

            
            clearInterval(progressInterval);
            setAiProgress(100);

            const aiData = resp?.data?.data;
            const isSuccess = resp?.data?.success;

            if (isSuccess && Array.isArray(aiData) && aiData.length > 0) {
              const categories = {};
              const order = [];

              aiData.forEach((cat) => {
                const catName = cat.menuCategoryName || "Uncategorized";
                const catNameHindi = cat.menuCategoryNameHindi || catName;
                const catNameGujarati = cat.menuCategoryNameGujarati || catName;
                const catId = Number(cat.menuCategoryId || 0);

                const items = (cat.selectedMenuPreparationItems || []).map(
                  (item) => ({
                    id: Number(item.menuItemId),
                    nameEnglish: item.menuItemName || "",
                    nameHindi: item.menuItemNameHindi || item.menuItemName || "",
                    nameGujarati:
                      item.menuItemNameGujarati || item.menuItemName || "",
                    imagePath: "",
                    rate: 0,
                    menuCategoryName: catName,
                    menuCategoryNameHindi: catNameHindi,
                    menuCategoryNameGujarati: catNameGujarati,
                    catId,
                    itemSlogan: item.itemSlogan || "",
                    itemNotes: { english: "", hindi: "", gujarati: "" },
                    itemSpace: 0,
                  }),
                );

                if (items.length > 0) {
                  categories[catName] = items;
                  order.push(catName);
                }
              });

              const categorySlogans = {};
              aiData.forEach((cat) => {
                const catName = cat.menuCategoryName || "Uncategorized";
                categorySlogans[catName] = cat.menuSlogan || "";
              });

              setSelectedByFunction((prev) => ({
                ...prev,
                [selectedFunction]: {
                  categoriesOrder: order,
                  categories,
                  categoryNotes: {},
                  categorySlogans,
                },
              }));

              setHasExistingData(true);
              setIsDirty(true);
              setAiDone(true);

              setTimeout(() => {
                setShowAiModal(false);
                setAiDone(false);
                setAiProgress(0);
              }, 1000);

              Swal.fire({
                icon: "success",
                title: "AI Menu Generated!",
                text: `${order.length} categories with ${Object.values(categories).flat().length} items added.`,
                timer: 2000,
                showConfirmButton: false,
              });
            } else {
              clearInterval(progressInterval);
              setAiProgress(0);
              Swal.fire({
                icon: "error",
                title: "Generation Failed",
                text:
                  resp?.data?.message ||
                  "AI could not generate a menu. Try a different template or package.",
              });
            }
          } catch (err) {
            clearInterval(progressInterval);
            setAiProgress(0);
            console.error("AI generation failed", err);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: err?.response?.data?.msg || "Something went wrong.",
            });
          } finally {
            clearInterval(msgInterval);
            clearInterval(progressInterval);
            setAiGenerating(false);
            setAiLoadingMessage("");
          }
          };

          const fetchExtraCharges = useCallback(async () => {
          if (!eventId || !selectedFunction) return;
          const userIdLocal = localStorage.getItem("userId");
          try {
            setExtraChargesLoading(true);
            const resp = await GetExtraCharges(
              selectedFunction,
              userIdLocal,
              eventId,
            ); 
            const data = resp?.data?.data || null;
            setExtraChargesData(data);
          } catch (err) {
            console.error("Failed to load extra charges:", err);
            setExtraChargesData(null);
          } finally {
            setExtraChargesLoading(false);
          }
          }, [eventId, selectedFunction]);



         const fetchPermissableData = useCallback(async () => {
  if (!selectedFunction || !eventId) return;
  try {
    const res = await GetPermissableNonPermissable(selectedFunction, eventId, userId);
    const data = res?.data?.data;
    if (data) {
      const enrich = (list = []) =>
        list.map((item) => ({
          rawMaterialId: item.rawMaterialId,
          rawMaterialName: item.rawMaterialNameEnglish || `RM #${item.rawMaterialId}`,
          categoryName: item.categoryName || "—",
        }));
      const enriched = {
        permissables: enrich(data.permissables),
        notPermissables: enrich(data.notPermissables),
        userId: Number(userId),
      };
      setPermissionRawMaterials(enriched);
      lastSavedPermissionRawMaterialsRef.current = enriched; // ← baseline for next diff
    } else {
      setPermissionRawMaterials(null);
      lastSavedPermissionRawMaterialsRef.current = null;
    }
  } catch (err) {
    console.error("Failed to fetch permissable data:", err);
  }
}, [selectedFunction, eventId, userId]);



          


          const ITEMS_PER_PAGE = 100;

          const fetchRawMaterials = useCallback(async (page = 1, categoryId = 0, append = false) => {
          if (rawMaterialLoading) return;
          setRawMaterialLoading(true);
          try {
          const res = await GetAllRawMaterial("", page, ITEMS_PER_PAGE, categoryId, userId);
          const data = res?.data?.data || {};
          const items = data["Raw Material Details"] || [];
          const total = data.totalItems || 0;

          if (append) {
            setRawMaterials((prev) => [...prev, ...items]);
          } else {
            setRawMaterials(items);
          }

          setRawMaterialHasMore(page * ITEMS_PER_PAGE < total);
          setRawMaterialPage(page);
          } catch (err) {
          console.error("Failed to fetch raw materials:", err);
          } finally {
          setRawMaterialLoading(false);
          }
          }, [userId, rawMaterialLoading]);

          const fetchRawMaterialCategories = useCallback(async () => {
          try {
          const res = await GetRawMaterialcategory(userId);
          setRawMaterialCategories(res?.data?.data?.["Raw Material Category Details"] || []);
          } catch (err) {
          console.error("Failed to fetch raw material categories:", err);
          }
          }, [userId]);


          const handleRawMaterialLoadMore = () => {
          if (!rawMaterialHasMore || rawMaterialLoading) return;
          fetchRawMaterials(rawMaterialPage + 1, rawMaterialCategoryFilter, true);
          };


          const handleRawMaterialCategoryChange = (categoryId) => {
          setRawMaterialCategoryFilter(Number(categoryId));
          fetchRawMaterials(1, Number(categoryId), false);
          };

          useEffect(() => {
          if (userId) {
          fetchRawMaterials(1, 0, false);
          fetchRawMaterialCategories();
          }
          }, [userId]);



          useEffect(() => {
          fetchExtraCharges();
          }, [fetchExtraCharges]);

          const [selectedCategoryInfo, setSelectedCategoryInfo] = useState({
          id: 0,
          nameEnglish: "All",
          nameHindi: "सभी",
          nameGujarati: "બધા",
          });

          const handleImageSave = useCallback(
          (catName, selectedItem, isCatImg) => {
            if (!selectedFunction || !catName || !selectedItem) return;
            setIsDirty(true);
            setCategoryImagesByFunction((prev) => ({
              ...prev,
              [selectedFunction]: {
                ...(prev[selectedFunction] || {}),
                [catName]: {
                  ...(prev[selectedFunction]?.[catName] || {}),
                  ...(isCatImg
                    ? { catImgId: Number(selectedItem.id) }
                    : { bgImgId: Number(selectedItem.id) }),
                },
              },
            }));
          },
          [selectedFunction],
          );

          const ALL_FUNCTIONS = -1;
          const [isAllCustomerToogleOpen, setIsAllCustomerToogleOpen] = useState(false);
          const [selectedEventId, setSelectedEventId] = useState(null);

          const hasSelectedItems = useMemo(() => {
          const bucket = selectedByFunction[selectedFunction];
          if (!bucket || !bucket.categories) return false;
          const totalItems = Object.values(bucket.categories).reduce(
            (sum, items) => sum + items.length,
            0,
          );
          return totalItems > 0;
          }, [selectedByFunction, selectedFunction]);

          const [groomPhoto, setGroomPhoto] = useState(null);
          const [bridePhoto, setBridePhoto] = useState(null);

          const handlePhotoUpload = (setter) => (e) => {
          const file = e.target.files[0];
          if (file) {
            const url = URL.createObjectURL(file);
            setter(url);
          }
          };

          const normalizeItemNotes = (notes) => {
          if (!notes) return { english: "", hindi: "", gujarati: "" };
          if (typeof notes === "string")
            return { english: notes, hindi: "", gujarati: "" };
          return {
            english: notes.english || "",
            hindi: notes.hindi || "",
            gujarati: notes.gujarati || "",
          };
          };

          // ✅ Fetch live suggestions from API based on current search term
          // const fetchAllItemsForSuggestion = useCallback(
          //   async (searchQuery = "") => {
          //     if (!selectedFunction) return;
          //     const userIdLocal = localStorage.getItem("userId");
          //     try {
          //       const resp = await Getmenuprep(
          //         selectedFunction,
          //         searchQuery, // ✅ pass search term live
          //         selectedCategoryId, // ✅ same category as grid
          //         1,
          //         9999,
          //         userIdLocal,
          //       );
          //       const items = resp?.data?.data?.menuPreparationItems || [];
          //       setAllMenuItemsForSuggestion(items);
          //     } catch (err) {
          //       console.error("Failed to load suggestion items", err);
          //     }
          //   },
          //   [selectedFunction, selectedCategoryId],
          // );

          // Initial load (empty search = all items)
          // useEffect(() => {
          //   fetchAllItemsForSuggestion("");
          // }, [selectedFunction, selectedCategoryId]);

          // ✅ Re-fetch from API whenever user types in search
          // useEffect(() => {
          //   if (!itemSearchTerm.trim()) {
          //     fetchAllItemsForSuggestion("");
          //     return;
          //   }
          //   const timer = setTimeout(() => {
          //     fetchAllItemsForSuggestion(itemSearchTerm);
          //   }, 300); // debounce
          //   return () => clearTimeout(timer);
          // }, [itemSearchTerm, selectedFunction, selectedCategoryId]);
          // useEffect(() => {
          //   fetchAllItemsForSuggestion();
          // }, [selectedFunction, fetchAllItemsForSuggestion]);

          const handleCopyMenuFromFunction = async (selectedFunctionData) => {
          try {
          const oldEventFunctionId = selectedFunctionData.id;
          const activeEventFunctionId = selectedFunction;

          Swal.fire({
            title: "Copying...",
            text: `Please wait while we copy the ${mode === "decor" ? "decor" : "menu"} preparation`,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
          });

          const copyApi = mode === "decor" ? GetCopyDecorPlanning : GetCopyMenuPlanning;
          const copyResp = await copyApi(activeEventFunctionId, oldEventFunctionId);

          if (!copyResp?.data?.success) {
            Swal.fire({
              icon: "error",
              title: "Copy Failed",
              text: copyResp?.data?.msg || "Failed to copy preparation.",
            });
            return;
          }

          setSelectedByFunction((prev) => ({
            ...prev,
            [activeEventFunctionId]: undefined,
          }));

          setSelectedFunction(null);
          setTimeout(() => {
            setSelectedFunction(activeEventFunctionId);
          }, 0);

          setHasExistingData(true);
          setIsDirty(false);
          setIsCopyMenuModalOpen(false);

          Swal.fire({
            icon: "success",
            title: `${mode === "decor" ? "Decor" : "Menu"} Copied Successfully!`,
            timer: 1500,
            showConfirmButton: false,
          });
          } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Failed to Copy",
            text: err?.response?.data?.msg || "Something went wrong while copying.",
          });
          }
          };


          // useEffect(() => {
          //   console.log("🟢 selectedByFunction changed:", {
          //     selectedFunction,
          //     hasData: !!selectedByFunction[selectedFunction],
          //     categories: selectedByFunction[selectedFunction]?.categoriesOrder || [],
          //     itemCount: Object.values(
          //       selectedByFunction[selectedFunction]?.categories || {},
          //     ).flat().length,
          //   });
          // }, [selectedByFunction, selectedFunction]);

          const handleFunctionChange = async (newFunctionId) => {
          if (isDirty && canEdit) {
            const result = await Swal.fire({
              title: "Unsaved Changes",
              text: "You have unsaved changes. Do you want to save before switching functions?",
              icon: "warning",
              showCancelButton: true,
              showDenyButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              denyButtonColor: "#6c757d",
              confirmButtonText: "Save & Switch",
              denyButtonText: "Switch Without Saving",
              cancelButtonText: "Cancel",
            });

            if (result.isConfirmed) {
              await handleSaveOrUpdate();
              setSelectedFunction(newFunctionId);
              setIsDirty(false);
              resetViewState();
            } else if (result.isDenied) {
              setSelectedFunction(newFunctionId);
              setIsDirty(false);
              resetViewState();
            }
          } else {
            setSelectedFunction(newFunctionId);
            resetViewState();
          }
          };

          const resetViewState = () => {
          setTimeout(() => {
            if (selectedItemsPanelRef.current) {
              selectedItemsPanelRef.current.scrollTop = 0;
            }
            const activeElement = document.activeElement;
            if (
              activeElement &&
              (activeElement.tagName === "INPUT" ||
                activeElement.tagName === "TEXTAREA")
            ) {
              activeElement.blur();
            }
          }, 0);
          };

          const translateItemNotes = async (englishText) => {
          if (!englishText) return { english: "", hindi: "", gujarati: "" };
          try {
            const resp = await Translateapi(englishText);
            return {
              english: englishText,
              hindi: resp?.data?.hindi || "",
              gujarati: resp?.data?.gujarati || "",
            };
          } catch (err) {
            console.error("Translation failed", err);
            return { english: englishText, hindi: "", gujarati: "" };
          }
          };

          const fetchEventData = async () => {
          try {
            setLoading(true);
            const response = await GetEventMasterById(eventId);
            const eventDetails = response?.data?.data?.["Event Details"]?.[0] || null;
            
            setEventData(eventDetails);
            if (eventDetails?.eventFunctions?.[0]) {
              setPersonCount(eventDetails.eventFunctions[0].pax);
              setDefaultRate(eventDetails.eventFunctions[0].rate ?? "");
              setSelectedFunction(eventDetails.eventFunctions[0].id);
            }
          } catch (err) {
            setError("Failed to load event details");
          } finally {
            setLoading(false);
          }
          };


          const fetchPrepStatus = useCallback(async () => {
          if (!eventId) return;
          try {
          setPrepStatusLoading(true);
          const res = await GetPreparationStatus(eventId);
          setPrepStatus(res?.data?.data ?? null);


          } catch (err) {
          console.error("Failed to fetch prep status:", err);
          } finally {
          setPrepStatusLoading(false);
          }
          }, [eventId]);

          useEffect(() => {
          fetchPrepStatus();
          }, [fetchPrepStatus]);




          const handlePrepStatusChange = async (newStatus) => {
          try {
          setPrepStatusLoading(true);
          await ChangePreparationStatus(eventId, newStatus);
          setPrepStatus(newStatus);
          Swal.fire({
            icon: "success",
            title: "Status updated!",
            timer: 1200,
            showConfirmButton: false,
          });

          } catch (err) {
          Swal.fire({ icon: "error", title: err?.response?.data?.msg || "Failed to update status" });
          } finally {
          setPrepStatusLoading(false);
          }
          };

          useEffect(() => {
          fetchEventData();
          }, [eventId]);

          useEffect(() => {
          if (!eventData || !selectedFunction) return;
          const func = eventData.eventFunctions.find(
            (f) => f.id === selectedFunction,
          );
          if (func) {
            setPersonCount(func.pax || "");
            setDefaultRate(func.rate || "");
          }
          }, [selectedFunction, eventData]);

         const loadSavedMenuPrep = useCallback(async () => {
if (!selectedFunction) return;

// Guard against duplicate concurrent calls for the same function
if (loadSavedMenuPrepInFlightRef.current === selectedFunction) {
  console.log("⏭️ Skipping duplicate loadSavedMenuPrep for function:", selectedFunction);
  return;
}
loadSavedMenuPrepInFlightRef.current = selectedFunction;

const userIdLocal = localStorage.getItem("userId");
setIsPrepLoading(true);

try {

          const { rawItems, rawSelectedCats, prepMeta } =
            await cfg.api.getItems(selectedFunction, "", 0, 1, 200, userIdLocal);

          // if (prepMeta?.permissionRawMaterials) {
          // setPermissionRawMaterials({
          // ...prepMeta.permissionRawMaterials,
          // userId: Number(userId),
          // });
          // } else {
          // setPermissionRawMaterials(null);
          // }


          let allItemsForPrice = rawItems;

          const categories = {};
          const order = [];
          const categoryNotesMap = {};
          const categorySlogansMap = {};
          const categoryImagesMap = {};
          const categorySpacesMap = {};
          const subCatTextMap = {};
          const categoryHeadingsMap = {}; 
          const loadedAddonState = {};
            const categoryIdsMap = {};    


          setDefaultRate(prepMeta?.eventFunction?.rate ?? "");

          const categoryRenamesMap = {};

          rawSelectedCats.forEach((rawCat) => {
            const norm = cfg.normaliseCategory(rawCat, allItemsForPrice, prepMeta);

            // const isPackageCat = Number(rawCat.anyItem || 0) > 0;
            // if (norm.items.length === 0 && !isPackageCat) return;

              if (!order.includes(norm.catName)) order.push(norm.catName);
          categories[norm.catName] = norm.items;
          categoryNotesMap[norm.catName] = norm.notes;
          categorySlogansMap[norm.catName] = norm.slogan;
          categoryImagesMap[norm.catName] = norm.images;
          categorySpacesMap[norm.catName] = norm.space;
          subCatTextMap[norm.catName] = norm.subCat;
          categoryIdsMap[norm.catName] = norm.catId;
          categoryHeadingsMap[norm.catName] = norm.catHeading;


            if (
          norm.nicknames?.english?.trim() ||
          norm.nicknames?.hindi?.trim() ||
          norm.nicknames?.gujarati?.trim()
          ) {
          categoryRenamesMap[norm.catName] = { ...norm.nicknames };
          }

            const itemAddons = {};
            (rawCat.selectedMenuPreparationItems || rawCat.selectedItems || []).forEach((it) => {
              if (it.isItemAddons || it.isDecoreItemAddons) {
                itemAddons[Number(it.menuItemId ?? it.decoreItemId ?? it.id)] = true;
              }
            });
            loadedAddonState[norm.catName] = {
              cat: norm.isAddon,
              items: itemAddons,
            };
          });

          const loadedPrimaryItems = {};
Object.entries(categories).forEach(([catName, items]) => {
  items.forEach((item) => {
    if (item.isCatImage) {
      loadedPrimaryItems[catName] = { ...(loadedPrimaryItems[catName] || {}), [item.id]: true };
    }
  });
});
setPrimaryItemsByFunction((prev) => ({ ...prev, [selectedFunction]: loadedPrimaryItems }));

          setCategoryImagesByFunction((prev) => ({ ...prev, [selectedFunction]: categoryImagesMap }));
          setCategorySpacesByFunction((prev) => ({ ...prev, [selectedFunction]: categorySpacesMap }));

          const menuPrepId = prepMeta?.id || 0;

          savedMenuPrepCacheRef.current[selectedFunction] = {
            categoriesOrder: order,
            categories,
            categoryNotes: categoryNotesMap,
            categorySlogans: categorySlogansMap,
            categorySubTexts: subCatTextMap,
            categoryHeadings: categoryHeadingsMap,   
            categoryRenames: categoryRenamesMap,
            categoryIds: categoryIdsMap,
          };

          setSelectedByFunction((prev) => ({
            ...prev,
            [selectedFunction]: {
              categoriesOrder: order,
              categories,
              categoryNotes: categoryNotesMap,
              categorySlogans: categorySlogansMap,
              categorySubTexts: subCatTextMap,
              categoryHeadings: categoryHeadingsMap,
              categoryRenames: categoryRenamesMap,
              categoryIds: categoryIdsMap,
            },
            _menuPrepId: menuPrepId,
          }));
          setAddonState((prev) => ({ ...prev, [selectedFunction]: loadedAddonState }));

          const isPkg = prepMeta?.isPackage || false;
          const pkgId = prepMeta?.packageId || 0;
          // const hasPackageCats = rawSelectedCats.some((c) => Number(c.anyItem || 0) > 0);

          if (isPkg && pkgId > 0 ) {
            const pkgName = prepMeta?.packageName || "";
            const pkgPrice = prepMeta?.packagePrice || 0;

            // Rebuild per-category limits from anyItem field
            const limits = {};
            rawSelectedCats.forEach((c) => {
              if (c.menuCategoryName) limits[c.menuCategoryName] = Number(c.anyItem || 0);
            });

            setPackageInfoByFunction((prev) => ({
              ...prev,
              [selectedFunction]: { packageId: pkgId, packageName: pkgName, packagePrice: pkgPrice },
            }));
            setPackageAppliedForFunction((prev) => ({ ...prev, [selectedFunction]: true }));
            setPackageCategoriesByFunction((prev) => ({ ...prev, [selectedFunction]: order }));
            setPackageCategoryLimitsByFunction((prev) => ({ ...prev, [selectedFunction]: limits }));

            // ✅ FIXED: build pkgItems from already-normalised `categories` (derived from
            // rawSelectedCats via normaliseCategory), NOT from rawItems — which is only
            // page-1 (200 items) and would silently truncate packages with >200 items.
            const pkgItems = Object.values(categories)
              .flat()
              .map((item) => ({
                ...item,
                isPackageItem: true,
              }));
            setPackageItemsByFunction((prev) => ({ ...prev, [selectedFunction]: pkgItems }));
          } else {

          setPackageAppliedForFunction((prev) => ({ ...prev, [selectedFunction]: false }));
          setPackageInfoByFunction((prev) => ({ ...prev, [selectedFunction]: null }));
          setPackageCategoriesByFunction((prev) => ({ ...prev, [selectedFunction]: [] }));
          setPackageCategoryLimitsByFunction((prev) => ({ ...prev, [selectedFunction]: {} }));
          setPackageItemsByFunction((prev) => ({ ...prev, [selectedFunction]: [] }));
          }

          if (order.length > 0) setHasExistingData(true);
          } catch (err) {
console.error("❌ Error loading menu prep:", err);
} finally {
setIsPrepLoading(false);
loadSavedMenuPrepInFlightRef.current = null;
}
}, [selectedFunction, cfg]);

useEffect(() => {
 
  if (!isPrepLoading && selectedFunction) {
    lastFullSnapshotRef.current = buildFullSnapshot();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isPrepLoading, selectedFunction]);

useEffect(() => {
  loadSavedMenuPrep();
  fetchPermissableData();
}, [selectedFunction, loadSavedMenuPrep, fetchPermissableData]);

          async function urlToFile(url, filename) {
  const res = await fetch(url); // requires the image host to allow CORS
  if (!res.ok) throw new Error(`Fetch failed (${res.status}) for ${url}`);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

const handleItemImageUpload = useCallback(
  async (catName, itemId, { keptImageUrls = [], newFiles = [] } = {}) => {
    if (!selectedFunction || !eventId) return false;

    try {
      
      const results = await Promise.allSettled(
        keptImageUrls.map((url, idx) =>
          urlToFile(url, url.split("/").pop() || `image-${idx}.png`),
        ),
      );

      const convertedExisting = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);

      const failedCount = results.length - convertedExisting.length;
      if (failedCount > 0) {
        console.warn(
          `${failedCount} existing image(s) could not be re-fetched (likely CORS) and will be dropped from this save.`,
        );
      }

      const allFiles = [...convertedExisting, ...newFiles];

      const formData = new FormData();
      formData.append("decorItemId", itemId);
      formData.append("eventFunctionId", selectedFunction);
      formData.append("eventId", eventId);
      formData.append("userId", userId);
      allFiles.forEach((file) => formData.append("images", file));

      const resp = await UploadDecorImagePlanning(formData);
      if (resp?.data?.success) {
        setIsDirty(true);

       
        const updatedImages = Array.isArray(resp?.data?.data) ? resp.data.data : [];

        setSelectedByFunction((prev) => {
          const bucket = prev[selectedFunction];
          if (!bucket) return prev;
          const categories = { ...bucket.categories };
          categories[catName] = (categories[catName] || []).map((item) =>
            Number(item.id) === Number(itemId)
              ? { ...item, images: updatedImages }
              : item,
          );
          return { ...prev, [selectedFunction]: { ...bucket, categories } };
        });
        Swal.fire({ icon: "success", title: "Image uploaded", timer: 1200, showConfirmButton: false });
        // if (failedCount > 0) {
        //   Swal.fire({
        //     icon: "warning",
        //     title: "Uploaded with a warning",
        //     text: `${failedCount} existing image(s) couldn't be retained (network/CORS issue) and were dropped.`,
        //   });
        // } else {
        //   Swal.fire({ icon: "success", title: "Image updated", timer: 1200, showConfirmButton: false });
        // }
        return true;
      }
      Swal.fire({ icon: "error", title: resp?.data?.msg || "Upload failed" });
      return false;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Upload failed",
        text: err?.response?.data?.msg || "Something went wrong.",
      });
      return false;
    }
  },
  [selectedFunction, eventId, userId], // ← loadSavedMenuPrep removed from deps
);


const handleMenuItemImageUpload = useCallback(
  async (catName, itemId, file) => {
    if (!file || !userId) return false;
    try {
      const formData = new FormData();
      formData.append("image", file);

      const resp = await UploadMenuItemImage(itemId, userId, formData);
      if (resp?.data?.success) {
        setIsDirty(true);

        let updatedImagePath =
          resp?.data?.data?.imagePath ||
          (typeof resp?.data?.data === "string" ? resp.data.data : "") ||
          "";

        // If backend returns a relative path, make it absolute
        if (updatedImagePath && !/^https?:\/\//i.test(updatedImagePath)) {
          updatedImagePath = toAbsoluteUrl(updatedImagePath);
        }

        setSelectedByFunction((prev) => {
          const bucket = prev[selectedFunction];
          if (!bucket) return prev;
          const categories = { ...bucket.categories };
          categories[catName] = (categories[catName] || []).map((item) =>
            Number(item.id) === Number(itemId)
              ? { ...item, imagePath: updatedImagePath }
              : item,
          );
          return { ...prev, [selectedFunction]: { ...bucket, categories } };
        });

        Swal.fire({ icon: "success", title: "Image uploaded", timer: 1200, showConfirmButton: false });
        return true;
      }
      Swal.fire({ icon: "error", title: resp?.data?.msg || "Upload failed" });
      return false;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Upload failed",
        text: err?.response?.data?.msg || "Something went wrong.",
      });
      return false;
    }
  },
  [selectedFunction, userId],
);




          const getSelectedIdsForFunction = useCallback(
          (functionId) => {
            const bucket = selectedByFunction[functionId];
            if (!bucket) return new Set();
            const ids = Object.values(bucket.categories)
              .flat()
              .map((i) => Number(i.id));
            return new Set([...ids, ...ids.map(String)]);
          },
          [selectedByFunction],
          );

          const onToggleSelectItem = useCallback(
          (menuItem, overrideCategoryName) => {
            const functionId = selectedFunction;
            if (!functionId) return;

            const itemId = Number(menuItem.id ?? menuItem.menuItemId);

            let categoryName,
              categoryNameHindi,
              categoryNameGujarati,
              categoryIdToUse;

            if (selectedCategoryId !== 0 && selectedCategory !== "All") {
              categoryName = selectedCategoryInfo.nameEnglish;
              categoryNameHindi =
                selectedCategoryInfo.nameHindi || selectedCategoryInfo.nameEnglish;
              categoryNameGujarati =
                selectedCategoryInfo.nameGujarati || selectedCategoryInfo.nameEnglish;
              categoryIdToUse = selectedCategoryInfo.id;
            } else {
              categoryName =
                overrideCategoryName ||
                menuItem.menuCategory?.nameEnglish ||
                menuItem.menuCategory?.name ||
                menuItem.menuCategoryName ||
                "Uncategorized";
              categoryNameHindi =
                menuItem.menuCategory?.nameHindi ||
                menuItem.menuCategoryNameHindi ||
                categoryName;
              categoryNameGujarati =
                menuItem.menuCategory?.nameGujarati ||
                menuItem.menuCategoryNameGujarati ||
                categoryName;
              categoryIdToUse = Number(
                menuItem.menuCategory?.id || menuItem.menuCategoryId || 0,
              );
            }

            const bucket = selectedByFunction[functionId] || {
              categoriesOrder: [],
              categories: {},
            };

            let existingCategoryName = null;
            for (const [catKey, catItems] of Object.entries(bucket.categories)) {
              const found = catItems.some((i) => Number(i.id) === itemId);
              if (found) {
                existingCategoryName = catKey;
                break;
              }
            }

            const isInSameCategory = existingCategoryName === categoryName;
            const isInDifferentCategory =
              existingCategoryName !== null && existingCategoryName !== categoryName;

            if (isInDifferentCategory) {
              setIsDirty(true);
              setSelectedByFunction((prev) => {
                const b = prev[functionId] || { categoriesOrder: [], categories: {} };
                const cats = { ...b.categories };

              
                const oldList = (cats[existingCategoryName] || []).filter(
                  (i) => Number(i.id) !== itemId,
                );

                const isOldPackageCategory =
                  packageAppliedForFunction[functionId] &&
                  (packageCategoriesByFunction[functionId] || []).includes(
                    existingCategoryName,
                  );

                if (oldList.length === 0 && !isOldPackageCategory) {
                  delete cats[existingCategoryName];
                } else {
                  cats[existingCategoryName] = oldList;
                }

                
                const newList = cats[categoryName] ? [...cats[categoryName]] : [];
                const appliedRate = Number(menuItem.itemPrice ?? menuItem.rate ?? 0);

                newList.push({
                  id: itemId,
                  nameEnglish: menuItem.nameEnglish || menuItem.menuItemName || "",
                  nameHindi:
                    menuItem.nameHindi ||
                    menuItem.menuItemNameHindi ||
                    menuItem.nameEnglish ||
                    menuItem.menuItemName ||
                    "",
                  nameGujarati:
                    menuItem.nameGujarati ||
                    menuItem.menuItemNameGujarati ||
                    menuItem.nameEnglish ||
                    menuItem.menuItemName ||
                    "",
                    itemHeading: "",
          itemHeadingHindi: "",
          itemHeadingGujarati: "",
                  imagePath: menuItem.imagePath || "",
                  rate: appliedRate,
                    menuCategoryName: categoryName || menuItem.menuCategoryName || menuItem.menuCategory?.nameEnglish || categoryName,
          menuCategoryNameHindi: categoryNameHindi ||menuItem.menuCategoryNameHindi || menuItem.menuCategory?.nameHindi || categoryNameHindi,
          menuCategoryNameGujarati: categoryNameGujarati || menuItem.menuCategoryNameGujarati || menuItem.menuCategory?.nameGujarati || categoryNameGujarati,
          // catId: Number(menuItem.menuCategoryId || menuItem.menuCategory?.id || categoryIdToUse),
          catId: Number(categoryIdToUse || menuItem.menuCategoryId || menuItem.menuCategory?.id || 0),
                  itemSlogan: menuItem.itemSlogan || "",
                  itemNotes: normalizeItemNotes(menuItem.itemNotes),
                  itemInstruction: {
                    english:
                      menuItem.instructionEnglish ||
                      menuItem.itemInstruction?.english ||
                      "",
                    hindi:
                      menuItem.instructionHindi ||
                      menuItem.itemInstruction?.hindi ||
                      "",
                    gujarati:
                      menuItem.instructionGujarati ||
                      menuItem.itemInstruction?.gujarati ||
                      "",
                  },
                  reportNameEnglish: categoryName || selectedCategoryInfo.reportNameEnglish || categoryName,
reportNameHindi: categoryNameHindi || selectedCategoryInfo.reportNameHindi || categoryNameHindi,
reportNameGujarati: categoryNameGujarati || selectedCategoryInfo.reportNameGujarati || categoryNameGujarati,



          //         reportNameEnglish: selectedCategoryInfo.reportNameEnglish || categoryName || menuItem.reportNameEnglish || menuItem.menuCategoryName || menuItem.menuCategory?.nameEnglish || "",
          // reportNameHindi: selectedCategoryInfo.reportNameHindi || categoryNameHindi || menuItem.reportNameHindi || menuItem.menuCategoryNameHindi || menuItem.menuCategory?.nameHindi || "",
          // reportNameGujarati: selectedCategoryInfo.reportNameGujarati || categoryNameGujarati || menuItem.reportNameGujarati || menuItem.menuCategoryNameGujarati || menuItem.menuCategory?.nameGujarati || "",



          //           reportNameEnglish: menuItem.reportNameEnglish || menuItem.menuCategoryName || menuItem.menuCategory?.nameEnglish || categoryName,
          // reportNameHindi: menuItem.reportNameHindi || menuItem.menuCategoryNameHindi || menuItem.menuCategory?.nameHindi || categoryNameHindi,
          // reportNameGujarati: menuItem.reportNameGujarati || menuItem.menuCategoryNameGujarati || menuItem.menuCategory?.nameGujarati || categoryNameGujarati,
                });

                cats[categoryName] = newList;

            
                const isNewPackageCategory =
                  packageAppliedForFunction[functionId] &&
                  (packageCategoriesByFunction[functionId] || []).includes(
                    categoryName,
                  );

                let newOrder = b.categoriesOrder.filter(
                  (c) =>
                    cats[c] !== undefined ||
                    (packageCategoriesByFunction[functionId] || []).includes(c),
                );

                if (!newOrder.includes(categoryName)) {
                  newOrder = [...newOrder, categoryName];
                }

                const updatedCategoryIds = { ...(b.categoryIds || {}) };
          Object.entries(cats).forEach(([cat, items]) => {
          if (items.length > 0 && items[0].catId) {
          updatedCategoryIds[cat] = items[0].catId;
          }
          });

          return {
          ...prev,
          [functionId]: {
          ...b,
          categoriesOrder: newOrder,
          categories: cats,
          categoryIds: updatedCategoryIds,
          },
          };
              });
              return;
            }

            if (isInSameCategory) {
              setIsDirty(true);
              setSelectedByFunction((prev) => {
                const b = prev[functionId] || { categoriesOrder: [], categories: {} };
                const cats = { ...b.categories };
                const list = (cats[categoryName] || []).filter(
                  (i) => Number(i.id) !== itemId,
                );

                const isPackageCategory =
                  packageAppliedForFunction[functionId] &&
                  (packageCategoriesByFunction[functionId] || []).includes(
                    categoryName,
                  );

                if (list.length === 0 && !isPackageCategory) {
                  delete cats[categoryName];
                } else {
                  cats[categoryName] = list;
                }

                const updatedCategoryIds = { ...(b.categoryIds || {}) };
          Object.entries(cats).forEach(([cat, items]) => {
          if (items.length > 0 && items[0].catId) {
          updatedCategoryIds[cat] = items[0].catId;
          }
          });

          return {
          ...prev,
          [functionId]: {
          ...b,
          categoriesOrder: isPackageCategory
            ? b.categoriesOrder
            : b.categoriesOrder.filter((c) => cats[c]),
          categories: cats,
          categoryIds: updatedCategoryIds,
          },
          };
              });
              return;
            }

            setIsDirty(true);
            setSelectedByFunction((prev) => {
              const b = prev[functionId] || { categoriesOrder: [], categories: {} };
              const cats = { ...b.categories };
              const list = cats[categoryName] ? [...cats[categoryName]] : [];

              const appliedRate = Number(menuItem.itemPrice ?? menuItem.rate ?? 0);

              list.push({
                id: itemId,
                nameEnglish: menuItem.nameEnglish || menuItem.menuItemName || "",
                nameHindi:
                  menuItem.nameHindi ||
                  menuItem.menuItemNameHindi ||
                  menuItem.nameEnglish ||
                  menuItem.menuItemName ||
                  "",
                nameGujarati:
                  menuItem.nameGujarati ||
                  menuItem.menuItemNameGujarati ||
                  menuItem.nameEnglish ||
                  menuItem.menuItemName ||
                  "",
                imagePath: menuItem.imagePath || "",
                rate: appliedRate,
                  menuCategoryName: categoryName ||menuItem.menuCategoryName || menuItem.menuCategory?.nameEnglish || categoryName,
          menuCategoryNameHindi: categoryNameHindi ||menuItem.menuCategoryNameHindi || menuItem.menuCategory?.nameHindi || categoryNameHindi,
          menuCategoryNameGujarati: categoryNameGujarati || menuItem.menuCategoryNameGujarati || menuItem.menuCategory?.nameGujarati || categoryNameGujarati,
          // catId: Number(menuItem.menuCategoryId || menuItem.menuCategory?.id || categoryIdToUse),
          catId: Number(categoryIdToUse || menuItem.menuCategoryId || menuItem.menuCategory?.id || 0),
                itemSlogan: menuItem.itemSlogan || "",
                itemNotes: normalizeItemNotes(menuItem.itemNotes),
                itemInstruction: {
                  english:
                    menuItem.instructionEnglish ||
                    menuItem.itemInstruction?.english ||
                    "",
                  hindi:
                    menuItem.instructionHindi ||
                    menuItem.itemInstruction?.hindi ||
                    "",
                  gujarati:
                    menuItem.instructionGujarati ||
                    menuItem.itemInstruction?.gujarati ||
                    "",
                },
                reportNameEnglish: selectedCategoryInfo.reportNameEnglish || categoryName ||menuItem.reportNameEnglish || menuItem.menuCategoryName || menuItem.menuCategory?.nameEnglish || categoryName,
          reportNameHindi: selectedCategoryInfo.reportNameHindi || categoryNameHindi ||menuItem.reportNameHindi || menuItem.menuCategoryNameHindi || menuItem.menuCategory?.nameHindi || categoryNameHindi,
          reportNameGujarati: selectedCategoryInfo.reportNameGujarati || categoryNameGujarati || menuItem.reportNameGujarati || menuItem.menuCategoryNameGujarati || menuItem.menuCategory?.nameGujarati || categoryNameGujarati,
                //  reportNameEnglish: menuItem.reportNameEnglish || menuItem.menuCategoryName || menuItem.menuCategory?.nameEnglish || categoryName,
                //   reportNameHindi: menuItem.reportNameHindi || menuItem.menuCategoryNameHindi || menuItem.menuCategory?.nameHindi || categoryNameHindi,
                //   reportNameGujarati: menuItem.reportNameGujarati || menuItem.menuCategoryNameGujarati || menuItem.menuCategory?.nameGujarati || categoryNameGujarati,
              });

              cats[categoryName] = list;

              const newOrder = b.categoriesOrder.includes(categoryName)
                ? b.categoriesOrder
                : [...b.categoriesOrder, categoryName];

              const updatedCategorySlogans = { ...(b.categorySlogans || {}) };
              if (!updatedCategorySlogans[categoryName] && menuItem.categorySlogan) {
                updatedCategorySlogans[categoryName] = menuItem.categorySlogan;
              }

              const updatedCategoryIds = { ...(b.categoryIds || {}) };
          Object.entries(cats).forEach(([cat, items]) => {
          if (items.length > 0 && items[0].catId) {
          updatedCategoryIds[cat] = items[0].catId;
          }
          });

          return {
            ...prev,
            [functionId]: {
              ...b,
              categoriesOrder: newOrder,
              categories: cats,
              categoryNotes: b.categoryNotes || {},
              categorySlogans: updatedCategorySlogans,
              categoryIds: updatedCategoryIds,
            },
          };

            });
          },
          [
            canEdit,
            selectedFunction,
            selectedByFunction,
            selectedCategoryId,
            selectedCategory,
            selectedCategoryInfo,
            packageAppliedForFunction,
            packageCategoriesByFunction,
          ],
          );

          const bulkSelectByPackageType = useCallback(
          async (type) => {
            if (!selectedFunction || !userId || selectedCategoryId === 0) return;
            try {
              const pkgResp = await getbymenucategorywithtype(
                selectedCategoryId,
                type,
                userId,
              );
              const packageItems = pkgResp?.data?.data || [];

              if (packageItems.length === 0) {
                Swal.fire({
                  toast: true,
                  position: "top-end",
                  icon: "info",
                  title: `No ${type === "BASIC" ? "Basic" : "Premium"} items found`,
                  showConfirmButton: false,
                  timer: 1500,
                });
                return;
              }

              setIsDirty(true);
              setSelectedByFunction((prev) => {
                const b = prev[selectedFunction] || {
                  categoriesOrder: [],
                  categories: {},
                };
                const cats = { ...b.categories };


             const newItems = packageItems.map((item) => ({
  id: Number(item.menuItemId),
  nameEnglish: item.menuItemName || "",
  nameHindi: item.menuItemNameHindi || item.menuItemName || "",
  nameGujarati: item.menuItemNameGujarati || item.menuItemName || "",
  imagePath: item.imagePath || "",
  rate: Number(item.itemPrice ?? item.rate ?? 0),
  menuCategoryName: selectedCategory,
  menuCategoryNameHindi: item.menuCategoryNameHindi || selectedCategory,
  menuCategoryNameGujarati: item.menuCategoryNameGujarati || selectedCategory,
  catId: Number(selectedCategoryId),
  itemSlogan: item.itemSlogan || "",
  itemNotes: {
    english: item.instructionEnglish || item.itemInstruction?.english || item.instruction || "",
    hindi: item.instructionHindi || item.itemInstruction?.hindi || "",
    gujarati: item.instructionGujarati || item.itemInstruction?.gujarati || "",
  },
  itemInstruction: {
    english: item.instructionEnglish || item.itemInstruction?.english || item.instruction || "",
    hindi: item.instructionHindi || item.itemInstruction?.hindi || "",
    gujarati: item.instructionGujarati || item.itemInstruction?.gujarati || "",
  },
  itemSpace: 0,
}));
                cats[selectedCategory] = newItems;

                const newOrder = b.categoriesOrder.includes(selectedCategory)
                  ? b.categoriesOrder
                  : [...b.categoriesOrder, selectedCategory];

                return {
          ...prev,
          [selectedFunction]: {
          ...b,
          categoriesOrder: newOrder,
          categories: cats,
          categorySlogans: b.categorySlogans || {},
          },
          };
              });

              const label = type === "BASIC" ? "Basic" : "Premium";
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: `✓ ${packageItems.length} ${label} items loaded in "${selectedCategory}"`,
                showConfirmButton: false,
                timer: 2000,
              });
            } catch (err) {
              console.error("Bulk select failed:", err);
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "Failed to load items",
                showConfirmButton: false,
                timer: 1500,
              });
            }
          },
          [
            selectedFunction,
            userId,
            selectedCategoryId,
            selectedCategory,
            setSelectedByFunction,
          ],
          );

          useEffect(() => {
          const handleKeyDown = (e) => {
            const tag = document.activeElement?.tagName?.toLowerCase();
            if (tag === "input" || tag === "textarea" || tag === "select") return;
            if (document.activeElement?.isContentEditable) return;
            if (selectedCategoryId === 0) return;
            if (e.key === "b" || e.key === "B") {
              e.preventDefault();
              bulkSelectByPackageType("BASIC");
            } else if (e.key === "p" || e.key === "P") {
              e.preventDefault();
              bulkSelectByPackageType("PREMIUM");
            }
          };
          window.addEventListener("keydown", handleKeyDown);
          return () => window.removeEventListener("keydown", handleKeyDown);
          }, [selectedCategoryId, bulkSelectByPackageType]);

        const onRemoveSelectedItem = useCallback(
  (functionId, categoryName, itemId) => {
    setIsDirty(true);
    setSelectedByFunction((prev) => {
      const bucket = prev[functionId];
      if (!bucket) return prev;

      const categories = { ...bucket.categories };
      const updated = (categories[categoryName] || []).filter(
        (i) => Number(i.id) !== Number(itemId),
      );

      const isPackageCategory =
        packageAppliedForFunction[functionId] &&
        (packageCategoriesByFunction[functionId] || []).includes(
          categoryName,
        );

      if (updated.length === 0 && !isPackageCategory) {
        delete categories[categoryName];
      } else {
        categories[categoryName] = updated;
      }

      return {
        ...prev,
        [functionId]: {
          ...bucket,
          categoriesOrder: isPackageCategory
            ? bucket.categoriesOrder
            : bucket.categoriesOrder.filter((c) => categories[c]),
          categories,
        },
      };
    });
  },
  [packageAppliedForFunction, packageCategoriesByFunction],
);
          const onDragEndSelected = useCallback((functionId, newState) => {
          setIsDirty(true);
          setSelectedByFunction((prev) => {
            const existing = prev[functionId] || {};
            return {
              ...prev,
              [functionId]: {
                ...existing,
                ...newState,
                
                categoryRenames: existing.categoryRenames,
                itemRenames: existing.itemRenames,
                categoryReportNames: existing.categoryReportNames,
                categorySubTexts: existing.categorySubTexts,
              },
            };
          });
          }, []);

          const onRateChange = useCallback(
          (functionId, categoryName, itemId, newRate) => {
            setIsDirty(true);
            setSelectedByFunction((prev) => {
              const bucket = prev[functionId];
              if (!bucket) return prev;

              const categories = { ...bucket.categories };
              const items = categories[categoryName] || [];

              const updatedItems = items.map((item) =>
                Number(item.id) === Number(itemId)
                  ? { ...item, rate: newRate }
                  : item,
              );

              return {
                ...prev,
                [functionId]: {
                  ...bucket,
                  categories: { ...categories, [categoryName]: updatedItems },
                },
              };
            });
          },
          [],
          );

          const handlePackageSelect = async (packageId) => {
          if (!selectedFunction) {
          Swal.fire({
            icon: "warning",
            title: "Select function first",
            text: "Please select a function before applying a package.",
          });
          return;
          }

          try {
          setLoading(true);

          if (mode === "decor") {
            // ── DECOR PACKAGE ──
            const resp = await GetDecorPackageById(packageId);
            const pkg = resp?.data?.data?.["Decore Package Details"]?.[0];

            if (!pkg) {
              Swal.fire({ icon: "error", title: "Decor Package not found" });
              setLoading(false);
              return;
            }

            const categories = {};
            const order = [];
            const packageItemsFlat = [];
            const categoryLimits = {};
            const categoryReportNamesMap = {}; 
              const categoryIdsMap = {};
            (pkg.decorePackageDetails || []).forEach((decor) => {
              const catName = decor.categoryName || `Category ${decor.decoreMainCategoryId}`;
              const catId = Number(decor.decoreMainCategoryId || 0);
                categoryIdsMap[catName] = catId;
              const anyCount = Number(decor.anyItem || 0);

              categoryLimits[catName] = anyCount;

              categoryReportNamesMap[catName] = {
          english: decor.reportNameEnglish || catName,
          hindi: decor.reportNameHindi || catName,
          gujarati: decor.reportNameGujarati || catName,
          };

              const items = (decor.items || []).map((it) => ({
                id: Number(it.decoreItemId || it.id || 0),
                nameEnglish: it.itemName || "",
                nameHindi: it.itemNameHindi || it.itemName || "",
                nameGujarati: it.itemNameGujarati || it.itemName || "",
                imagePath: it.imagePath || "",
                rate: Number(it.itemPrice || 0),
                menuCategoryName: catName,
                menuCategoryNameHindi: catName,
                menuCategoryNameGujarati: catName,
                catId,
                isPackageItem: true,
                packageId: pkg.id,
                packageName: pkg.nameEnglish,
                reportNameEnglish: it.reportNameEnglish || catName,
          reportNameHindi: it.reportNameHindi || catName,
          reportNameGujarati: it.reportNameGujarati || catName,
              }));

              packageItemsFlat.push(...items);
                categories[catName] = items;
                order.push(catName);
            });

            setPackageAppliedForFunction((prev) => ({
              ...prev,
              [selectedFunction]: true,
            }));
            setPackageCategoriesByFunction((prev) => ({
              ...prev,
              [selectedFunction]: order,
            }));
            setPackageItemsByFunction((prev) => ({
              ...prev,
              [selectedFunction]: packageItemsFlat,
            }));
            setPackageInfoByFunction((prev) => ({
              ...prev,
              [selectedFunction]: {
                packageId: pkg.id,
                packageName: pkg.nameEnglish,
                packagePrice: pkg.price || 0,
              },
            }));
            setPackageCategoryLimitsByFunction((prev) => ({
              ...prev,
              [selectedFunction]: categoryLimits,
            }));

            // setSelectedByFunction((prev) => ({
            //   ...prev,
            //   [selectedFunction]: {
            //     categoriesOrder: order,
            //     categories,
            //     categoryNotes: prev[selectedFunction]?.categoryNotes || {},
            //     categorySlogans: prev[selectedFunction]?.categorySlogans || {},
                
            //   },
            //   _menuPrepId: prev?._menuPrepId || 0,
            // }));


            setSelectedByFunction((prev) => ({
          ...prev,
          [selectedFunction]: {
          categoriesOrder: order,
          categories,
          categoryNotes: prev[selectedFunction]?.categoryNotes || {},
          categorySlogans: prev[selectedFunction]?.categorySlogans || {},
          categoryReportNames: categoryReportNamesMap,
          categoryRenames: prev[selectedFunction]?.categoryRenames || {}, 
          itemRenames: prev[selectedFunction]?.itemRenames || {},   
            categoryIds: categoryIdsMap,      
          },
          _menuPrepId: prev?._menuPrepId || 0,
          }));

            setHasExistingData(true);
            setIsDirty(true);
            setShowCustomPackageModal(false);

            Swal.fire({
              icon: "success",
              title: "Decor Package applied",
              text: `${pkg.nameEnglish || "Package"} applied to selected function.`,
              timer: 1400,
              showConfirmButton: false,
            });

          } else {
            // ── MENU PACKAGE (original) ──
            const resp = await GetCustomPackageapibyID(packageId);
            const pkg = resp?.data?.data?.["Package Details"]?.[0];
            
            if (!pkg) {
              Swal.fire({ icon: "error", title: "Package not found" });
              setLoading(false);
              return;
            }

            const categories = {};
            const order = [];
            const packageItemsFlat = [];
            const categoryLimits = {};
              const categoryIdsMap = {}; 
              const itemReportNamesMap = {};
            (pkg.customPackageDetails || []).forEach((menu) => {
          const catName = menu.menuName || `Menu ${menu.menuId || ""}`;
          const catNameHindi = menu.menuNameHindi || catName;
          const catNameGujarati = menu.menuNameGujarati || catName;
          const catId = Number(menu.menuId || 0);
          categoryIdsMap[catName] = catId;
          const anyCount = Number(menu.anyItem || 0);

          //         const catName = menu.menuName || `Menu ${menu.menuId || ""}`;
          // const catReportName = menu.reportNameEnglish || catName;
          // const catReportNameHindi = menu.reportNameHindi || catNameHindi;
          // const catReportNameGujarati = menu.reportNameGujarati || catNameGujarati;

              categoryLimits[catName] = anyCount;

              const items = (menu.customPackageMenuItemDetails || []).map((it) => {
  const itemId = Number(it.menuItemId || it.id || 0);
  const itemNickE = (it.itemNickNameEnglish || "").trim();
  const itemNickH = (it.itemNickNameHindi || "").trim();
  const itemNickG = (it.itemNickNameGujarati || "").trim();

  return {
    id: itemId,
    nameEnglish: it.itemName || "",
    nameHindi: it.itemNameHindi || it.itemName || "",
    nameGujarati: it.itemNameGujarati || it.itemName || "",
    nicknames: { english: itemNickE, hindi: itemNickH, gujarati: itemNickG }, // still kept for rename modal prefill
    imagePath: "",
    rate: Number(it.itemPrice || 0),
    menuCategoryName: catName,
    menuCategoryNameHindi: catNameHindi,
    menuCategoryNameGujarati: catNameGujarati,
    catId,
    isPackageItem: true,
    packageId: pkg.id,
    packageName: pkg.nameEnglish,
    reportNameEnglish: menu.reportNameEnglish || catName,
    reportNameHindi: menu.reportNameHindi || catNameHindi,
    reportNameGujarati: menu.reportNameGujarati || catNameGujarati,
  };
});

              packageItemsFlat.push(...items);

              categories[catName] = items;
          order.push(catName);
            });

            setPackageAppliedForFunction((prev) => ({
              ...prev,
              [selectedFunction]: true,
            }));
            setPackageCategoriesByFunction((prev) => ({
              ...prev,
              [selectedFunction]: order,
            }));
            setPackageItemsByFunction((prev) => ({
              ...prev,
              [selectedFunction]: packageItemsFlat,
            }));
            setPackageInfoByFunction((prev) => ({
              ...prev,
              [selectedFunction]: {
                packageId: pkg.id,
                packageName: pkg.nameEnglish,
                packagePrice: pkg.price || pkg.packagePrice || 0,
              },
            }));
            setPackageCategoryLimitsByFunction((prev) => ({
              ...prev,
              [selectedFunction]: categoryLimits,
            }));

            const categoryReportNamesMap = {};
          (pkg.customPackageDetails || []).forEach((menu) => {
          const catName = menu.menuName || `Menu ${menu.menuId || ""}`;
          const catNameHindi = menu.menuNameHindi || catName;
          const catNameGujarati = menu.menuNameGujarati || catName;
          categoryReportNamesMap[catName] = {
          english: menu.reportNameEnglish || catName,
          hindi: menu.reportNameHindi || catNameHindi,
          gujarati: menu.reportNameGujarati || catNameGujarati,
          };
          });


          const categoryRenamesMap = {};
          (pkg.customPackageDetails || []).forEach((menu) => {
          const catName = menu.menuName || `Menu ${menu.menuId || ""}`;
          const nickE = (menu.catNickNameEnglish || "").trim();
          const nickH = (menu.catNickNameHindi || "").trim();
          const nickG = (menu.catNickNameGujarati || "").trim();
          if (nickE || nickH || nickG) {
          categoryRenamesMap[catName] = { english: nickE, hindi: nickH, gujarati: nickG };
          }
          });

          const itemRenamesMap = {};
(pkg.customPackageDetails || []).forEach((menu) => {
  (menu.customPackageMenuItemDetails || []).forEach((it) => {
    const itemId = Number(it.menuItemId || it.id || 0);
    const nickE = (it.itemNickNameEnglish || "").trim();
    const nickH = (it.itemNickNameHindi || "").trim();
    const nickG = (it.itemNickNameGujarati || "").trim();
    if (itemId && (nickE || nickH || nickG)) {
      itemRenamesMap[itemId] = { english: nickE, hindi: nickH, gujarati: nickG };
    }
  });
});


            setSelectedByFunction((prev) => ({
          ...prev,
          [selectedFunction]: {
    categoriesOrder: order,
    categories,
    categoryNotes: prev[selectedFunction]?.categoryNotes || {},
    categorySlogans: prev[selectedFunction]?.categorySlogans || {},
    categoryReportNames: categoryReportNamesMap,
    categoryRenames: categoryRenamesMap,
    itemRenames: prev[selectedFunction]?.itemRenames || {},   // ← unchanged, no nickname seeding
    itemReportNames: itemReportNamesMap,                      // ← NEW
    categorySubTexts: prev[selectedFunction]?.categorySubTexts || {},
    categoryIds: categoryIdsMap,
  },
  _menuPrepId: prev?._menuPrepId || 0,
}));

            setHasExistingData(true);
            setIsDirty(true);
            setShowCustomPackageModal(false);

            Swal.fire({
              icon: "success",
              title: "Package applied",
              text: `${pkg.nameEnglish || "Package"} applied to selected function.`,
              timer: 1400,
              showConfirmButton: false,
            });
          }
          } catch (err) {
          console.error("Apply package failed", err);
          Swal.fire({
            icon: "error",
            title: "Failed to apply package",
            text: "Something went wrong while loading package.",
          });
          } finally {
          setLoading(false);
          }
          };


          const handleToggleCategoryAddon = useCallback(
          (catName) => {
            setIsDirty(true);
            setAddonState((prev) => {
              const funcState = prev[selectedFunction] || {};
              const catState = funcState[catName] || { cat: false, items: {} };
              return {
                ...prev,
                [selectedFunction]: {
                  ...funcState,
                  [catName]: { ...catState, cat: !catState.cat },
                },
              };
            });
          },
          [selectedFunction],
          );

          const handleToggleItemAddon = useCallback(
          (catName, itemId) => {
            setIsDirty(true);
            setAddonState((prev) => {
              const funcState = prev[selectedFunction] || {};
              const catState = funcState[catName] || { cat: false, items: {} };
              return {
                ...prev,
                [selectedFunction]: {
                  ...funcState,
                  [catName]: {
                    ...catState,
                    items: {
                      ...catState.items,
                      [itemId]: !catState.items?.[itemId],
                    },
                  },
                },
              };
            });
          },
          [selectedFunction],
          );
          const handleSelectPrimaryItem = useCallback(
          (catName, itemId, isAlreadyPrimary) => {
          setIsDirty(true);
          setPrimaryItemsByFunction((prev) => {
            const funcState = prev[selectedFunction] || {};
            if (isAlreadyPrimary) {
              // Deselect — remove primary for this category
              const updated = { ...funcState };
              delete updated[catName];
              return { ...prev, [selectedFunction]: updated };
            }
            return {
              ...prev,
              [selectedFunction]: {
                ...funcState,
                [catName]: {
                  ...Object.fromEntries(
                    Object.keys(funcState[catName] || {}).map((id) => [id, false])
                  ),
                  [itemId]: true,
                },
              },
            };
          });
          },
          [selectedFunction],
          );

          const handlePermissableSave = (data) => {
  setPermissionRawMaterials({
    permissables: data.permissables,
    notPermissables: data.notPermissables,
    userId: Number(userId),
  });
  setIsDirty(true);
  setShowPermissableModal(false);
};



          const buildRequestPayload = () => {
          const bucket = selectedByFunction[selectedFunction];
          if (!bucket) return null;

          const categoriesPayload = bucket.categoriesOrder.map(
            (catName, catIndex) => {
              const items = bucket.categories[catName] || [];
              const firstItem = items[0] || {};
              const catNameEnglish = firstItem.menuCategoryName || catName;
              const catNameHindi = firstItem.menuCategoryNameHindi || catName;
              const catNameGujarati = firstItem.menuCategoryNameGujarati || catName;
              const categoryNoteObj = bucket.categoryNotes?.[catName] || {};
              const categorySlogan = bucket.categorySlogans?.[catName] || "";
              const imgData =
                categoryImagesByFunction[selectedFunction]?.[catName] || {};
              const catSpace =
                categorySpacesByFunction[selectedFunction]?.[catName] || 0;
              const subCatData = bucket.categorySubTexts?.[catName] || {};
              return {
                menuCategoryId: items[0]?.catId || 0,
                menuCategoryName: catNameEnglish,
                menuCategoryNameHindi: catNameHindi,
                menuCategoryNameGujarati: catNameGujarati,
                menuNotes: categoryNoteObj.english || "",
                menuNotesHindi: categoryNoteObj.hindi || "",
                menuNotesGujarati: categoryNoteObj.gujarati || "",
                menuSlogan: categorySlogan,
                menuSortOrder: catIndex,
                startTime: "",
                isMenuCatAddons: !!addonState[selectedFunction]?.[catName]?.cat,
                bgImgId: imgData.bgImgId || 0,
                catImgId: imgData.catImgId || 0,
                catSpace,
                subCat: subCatData.english || "",
                subCatHindi: subCatData.hindi || "",
                subCatGujarati: subCatData.gujarati || "",
                selectedMenuPreparationItems: items.map((item, itemIndex) => ({
                  id: 0,
                  // itemNotes: item.itemNotes?.english || "",
                  // itemNotesHindi: item.itemNotes?.hindi || "",
                  // itemNotesGujarati: item.itemNotes?.gujarati || "",
          itemNotes: item.itemInstruction?.english || "",
          itemNotesHindi: item.itemInstruction?.hindi || "",
          itemNotesGujarati: item.itemInstruction?.gujarati || "",
                  itemSlogan: item.itemSlogan || "",
                  itemSortOrder: itemIndex,
                  itemPrice: Number(item.rate),
                  menuItemId: Number(item.id),
                  menuItemName: item.nameEnglish || "",
                  menuItemNameHindi: item.nameHindi || item.nameEnglish || "",
                  menuItemNameGujarati: item.nameGujarati || item.nameEnglish || "",
                  isItemAddons:
                    !!addonState[selectedFunction]?.[catName]?.items?.[item.id],
                  itemSpace: Number(item.itemSpace) || 0,
                  subItem: item.subItem || "",
                  subItemHindi: item.subItemHindi || "",
                  subItemGujarati: item.subItemGujarati || "",
                    
                })),
              };
            },
          );

          const isPackageApplied =
            packageAppliedForFunction[selectedFunction] || false;
          const selectedPkgItems = packageItemsByFunction[selectedFunction] || [];
          const pkgInfoFromState = packageInfoByFunction[selectedFunction] || null;

          const inferredPkgFromItems =
            selectedPkgItems.length > 0
              ? {
                  packageId: selectedPkgItems[0].packageId || 0,
                  packageName: selectedPkgItems[0].packageName || "",
                  packagePrice:
                    selectedPkgItems[0].packagePrice ??
                    selectedPkgItems[0].package_price ??
                    selectedPkgItems[0].rate ??
                    0,
                }
              : null;

          const finalPkg = pkgInfoFromState ||
            inferredPkgFromItems || {
              packageId: 0,
              packageName: "",
              packagePrice: 0,
            };
          console.log("categoryRenames at save time:", selectedByFunction[selectedFunction]?.categoryRenames);


          const payload = cfg.buildPayload({
          menuPrepId:       selectedByFunction._menuPrepId || 0,
          eventFunctionId:  selectedFunction,
          personCount,
          defaultRate,
          categoriesOrder:  bucket.categoriesOrder,
          categories:       bucket.categories,
          categoryNotes:    bucket.categoryNotes,
          categorySlogans:  bucket.categorySlogans,
          categorySubTexts: bucket.categorySubTexts,
          categoryHeadings: bucket.categoryHeadings, 
          categoryImages:   categoryImagesByFunction[selectedFunction] || {},
          categorySpaces:   categorySpacesByFunction[selectedFunction] || {},
          categoryRenames:  selectedByFunction[selectedFunction]?.categoryRenames || {},
          categoryIds:      bucket.categoryIds || {},
          primaryItems:     primaryItemsByFunction[selectedFunction] || {},
          itemRenames:      selectedByFunction[selectedFunction]?.itemRenames || {},
          itemReportNames:  selectedByFunction[selectedFunction]?.itemReportNames || {}, 
          addonState:       addonState[selectedFunction] || {},
          packageApplied:   packageAppliedForFunction[selectedFunction] || false,
          packageInfo:      packageInfoByFunction[selectedFunction]     || null,
          packageItems:     packageItemsByFunction[selectedFunction]    || [],
          permissionRawMaterials,
          userId,
          });
          return payload; 
          };

          const animateProgress = (from, to, duration = 600) => {
          return new Promise((resolve) => {
            if (progressAnimRef.current) clearInterval(progressAnimRef.current);

            const steps = to - from;
            if (steps <= 0) {
              setSaveProgress(to);
              saveProgressRef.current = to;
              resolve();
              return;
            }

            const intervalMs = Math.floor(duration / steps);
            let current = from;

            progressAnimRef.current = setInterval(() => {
              current += 1;
              setSaveProgress(current);
              saveProgressRef.current = current;

              if (current >= to) {
                clearInterval(progressAnimRef.current);
                progressAnimRef.current = null;
                resolve();
              }
            }, intervalMs);
          });
          };


          

          const buildFullSnapshot = useCallback(() => {
  if (!selectedFunction) return null;
  const bucket = selectedByFunction[selectedFunction] || { categoriesOrder: [], categories: {} };

  return {
    personCount,
    defaultRate,
    categoriesOrder: [...(bucket.categoriesOrder || [])],
    categories: JSON.parse(JSON.stringify(bucket.categories || {})),
    categoryNotes: JSON.parse(JSON.stringify(bucket.categoryNotes || {})),
    categorySlogans: JSON.parse(JSON.stringify(bucket.categorySlogans || {})),
    categoryRenames: JSON.parse(JSON.stringify(bucket.categoryRenames || {})),
    itemRenames: JSON.parse(JSON.stringify(bucket.itemRenames || {})),
    categorySubTexts: JSON.parse(JSON.stringify(bucket.categorySubTexts || {})),
    addonState: JSON.parse(JSON.stringify(addonState[selectedFunction] || {})),
    primaryItems: JSON.parse(JSON.stringify(primaryItemsByFunction[selectedFunction] || {})),
    categoryImages: JSON.parse(JSON.stringify(categoryImagesByFunction[selectedFunction] || {})),
    categorySpaces: JSON.parse(JSON.stringify(categorySpacesByFunction[selectedFunction] || {})),
    packageApplied: !!packageAppliedForFunction[selectedFunction],
    packageInfo: packageInfoByFunction[selectedFunction]
      ? { ...packageInfoByFunction[selectedFunction] }
      : null,
    permissionRawMaterials: permissionRawMaterials
      ? JSON.parse(JSON.stringify(permissionRawMaterials))
      : null,
  };
}, [
  selectedFunction, selectedByFunction, addonState, primaryItemsByFunction,
  categoryImagesByFunction, categorySpacesByFunction, packageAppliedForFunction,
  packageInfoByFunction, permissionRawMaterials, personCount, defaultRate,
]);

          const nameOf = (item) => item?.nameEnglish || `Item#${item?.id}`;

const buildFullChangeSummary = (prev, next) => {
  if (!prev) return "Initial save — no prior data to compare.";
  if (!next) return "No changes detected.";

  const parts = [];

  if (String(prev.personCount) !== String(next.personCount)) {
    parts.push(`Pax: ${prev.personCount || 0} → ${next.personCount || 0}`);
  }
  if (String(prev.defaultRate) !== String(next.defaultRate)) {
    parts.push(`Rate: ₹${prev.defaultRate || 0} → ₹${next.defaultRate || 0}`);
  }

  const prevCats = prev.categories || {};
  const nextCats = next.categories || {};
  const prevCatNames = new Set(Object.keys(prevCats));
  const nextCatNames = new Set(Object.keys(nextCats));

  const addedCategories   = [...nextCatNames].filter((c) => !prevCatNames.has(c));
  const removedCategories = [...prevCatNames].filter((c) => !nextCatNames.has(c));
  if (addedCategories.length)   parts.push(`Categories Added: ${addedCategories.join(", ")}`);
  if (removedCategories.length) parts.push(`Categories Removed: ${removedCategories.join(", ")}`);

  const addedItems = [];
  const removedItems = [];
  const rateChanges = [];
  const qtyChanges = [];

  nextCatNames.forEach((catName) => {
    const nextItems = nextCats[catName] || [];
    const prevItems = prevCats[catName] || [];
    const prevMap = new Map(prevItems.map((i) => [Number(i.id), i]));
    const nextMap = new Map(nextItems.map((i) => [Number(i.id), i]));

    nextItems.forEach((item) => {
      const p = prevMap.get(Number(item.id));
      if (!p) {
        addedItems.push(`${nameOf(item)} (in ${catName})`);
        return;
      }
      if (Number(p.rate || 0) !== Number(item.rate || 0)) {
        rateChanges.push(`${nameOf(item)}: ₹${p.rate || 0} → ₹${item.rate || 0}`);
      }
      if (Number(p.itemQty || 0) !== Number(item.itemQty || 0)) {
        qtyChanges.push(`${nameOf(item)}: Qty ${p.itemQty || 0} → ${item.itemQty || 0}`);
      }
    });

    prevItems.forEach((item) => {
      if (!nextMap.has(Number(item.id))) removedItems.push(`${nameOf(item)} (from ${catName})`);
    });
  });

  removedCategories.forEach((catName) => {
    (prevCats[catName] || []).forEach((item) => removedItems.push(`${nameOf(item)} (from ${catName})`));
  });

  if (addedItems.length)   parts.push(`Items Added: ${addedItems.join(", ")}`);
  if (removedItems.length) parts.push(`Items Removed: ${removedItems.join(", ")}`);
  if (rateChanges.length)  parts.push(`Rate Changes: ${rateChanges.join(", ")}`);
  if (qtyChanges.length)   parts.push(`Qty Changes: ${qtyChanges.join(", ")}`);

  const renamedCats = [];
  Object.keys(next.categoryRenames || {}).forEach((cat) => {
    const p = prev.categoryRenames?.[cat]?.english || "";
    const n = next.categoryRenames?.[cat]?.english || "";
    if (n && p !== n) renamedCats.push(`${cat} → "${n}"`);
  });
  if (renamedCats.length) parts.push(`Category Renamed: ${renamedCats.join(", ")}`);

  const renamedItems = [];
  Object.keys(next.itemRenames || {}).forEach((id) => {
    const p = prev.itemRenames?.[id]?.english || "";
    const n = next.itemRenames?.[id]?.english || "";
    if (n && p !== n) renamedItems.push(`Item#${id} → "${n}"`);
  });
  if (renamedItems.length) parts.push(`Item Renamed: ${renamedItems.join(", ")}`);

  const noteChangedCats = [];
  Object.keys(nextCats).forEach((cat) => {
    const p = prev.categoryNotes?.[cat]?.english || "";
    const n = next.categoryNotes?.[cat]?.english || "";
    if (p !== n) noteChangedCats.push(cat);
  });
  if (noteChangedCats.length) parts.push(`Category Notes Changed: ${noteChangedCats.join(", ")}`);

  if (!!prev.packageApplied !== !!next.packageApplied) {
    parts.push(next.packageApplied
      ? `Switched to Package: ${next.packageInfo?.packageName || ""}`
      : `Switched to A La Carte`);
  } else if (prev.packageApplied && next.packageApplied && prev.packageInfo?.packageId !== next.packageInfo?.packageId) {
    parts.push(`Package Changed: ${prev.packageInfo?.packageName || ""} → ${next.packageInfo?.packageName || ""}`);
  }

  const addonChanges = [];
  new Set([...Object.keys(prev.addonState || {}), ...Object.keys(next.addonState || {})]).forEach((cat) => {
    const p = prev.addonState?.[cat]?.cat || false;
    const n = next.addonState?.[cat]?.cat || false;
    if (p !== n) addonChanges.push(`${cat} addon ${n ? "enabled" : "disabled"}`);
  });
  if (addonChanges.length) parts.push(`Addon Changes: ${addonChanges.join(", ")}`);

  const prevPerm = new Set((prev.permissionRawMaterials?.permissables || []).map((i) => Number(i.rawMaterialId)));
  const nextPerm = new Set((next.permissionRawMaterials?.permissables || []).map((i) => Number(i.rawMaterialId)));
  const prevNotPerm = new Set((prev.permissionRawMaterials?.notPermissables || []).map((i) => Number(i.rawMaterialId)));
  const nextNotPerm = new Set((next.permissionRawMaterials?.notPermissables || []).map((i) => Number(i.rawMaterialId)));

  const rmNameLookup = new Map();
  [
    ...(prev.permissionRawMaterials?.permissables || []),
    ...(prev.permissionRawMaterials?.notPermissables || []),
    ...(next.permissionRawMaterials?.permissables || []),
    ...(next.permissionRawMaterials?.notPermissables || []),
  ].forEach((i) => rmNameLookup.set(Number(i.rawMaterialId), i.rawMaterialName || `RM #${i.rawMaterialId}`));

  const permAdded      = [...nextPerm].filter((id) => !prevPerm.has(id)).map((id) => rmNameLookup.get(id));
  const permRemoved    = [...prevPerm].filter((id) => !nextPerm.has(id)).map((id) => rmNameLookup.get(id));
  const notPermAdded   = [...nextNotPerm].filter((id) => !prevNotPerm.has(id)).map((id) => rmNameLookup.get(id));
  const notPermRemoved = [...prevNotPerm].filter((id) => !nextNotPerm.has(id)).map((id) => rmNameLookup.get(id));

  if (permAdded.length)      parts.push(`Permissable Added: ${permAdded.join(", ")}`);
  if (permRemoved.length)    parts.push(`Permissable Removed: ${permRemoved.join(", ")}`);
  if (notPermAdded.length)   parts.push(`Non-Permissable Added: ${notPermAdded.join(", ")}`);
  if (notPermRemoved.length) parts.push(`Non-Permissable Removed: ${notPermRemoved.join(", ")}`);

  return parts.length > 0 ? parts.join(" | ") : "No changes detected.";
};

          const handleSaveOrUpdate = async () => {
          setIsSubmitting(true);
          saveClickCountRef.current += 1;

          if (isSavingRef.current) return;
          isSavingRef.current = true;
          setIsSaving(true);
          setIsSubmitting(true);
          setSaveProgress(0);

          try {
            const bucket = selectedByFunction[selectedFunction];
            if (bucket) {
              const emptyCatNames = bucket.categoriesOrder.filter((catName) => {
                const items = bucket.categories[catName] || [];
                const catId = bucket.categoryIds?.[catName] || items[0]?.catId || items.find(i => i.catId)?.catId;
                return items.length === 0 && !catId;
              });

              if (emptyCatNames.length > 0) {
                Swal.fire({
                  icon: "warning",
                  title: "Empty Categories",
                  html: `The following categories have no items:<br/><strong>${emptyCatNames.join(", ")}</strong><br/><br/>Please add items or remove these categories before saving.`,
                  confirmButtonColor: "#005BA8",
                });
                isSavingRef.current = false;
                setIsSaving(false);
                setIsSubmitting(false);
                setSaveProgress(0);
                return;
              }
            }

          
           const prevBucketSnapshot = savedMenuPrepCacheRef.current[selectedFunction]
  ? {
      ...savedMenuPrepCacheRef.current[selectedFunction],
      permissionRawMaterials: lastSavedPermissionRawMaterialsRef.current,
    }
  : null;
            const nextFullSnapshot = buildFullSnapshot();
            const payload = buildRequestPayload();

            if (!payload) {
              alert("Nothing to save");
              isSavingRef.current = false;
              return;
            }
            animateProgress(0, 60, 800);
            const resp = await cfg.api.saveOrUpdate(payload);

            if (resp?.data?.success === true) {
              setIsDirty(false);
              const newId = resp?.data?.data?.id || payload.id;
              setSelectedByFunction((prev) => ({ ...prev, _menuPrepId: newId }));
              setHasExistingData(true);

              await loadSavedMenuPrep();
              fetchPermissableData();

              const funcData = eventData?.eventFunctions?.find(
                (f) => f.id === selectedFunction,
              );
              const functionName =
                funcData?.function?.nameEnglish || `Function #${selectedFunction}`;
              const eventNo = eventData?.eventNo || eventId;
              const customerName = eventData?.party?.nameEnglish || "N/A";
              const venueName = eventData?.venue?.nameEnglish || "N/A";
              const eventType = eventData?.eventType?.nameEnglish || "N/A";
              const eventStart =
                eventData?.eventStartDateTime?.split(" ")[0] || "N/A";
              const eventEnd = eventData?.eventEndDateTime?.split(" ")[0] || "N/A";
              const totalCategories =
                selectedByFunction[selectedFunction]?.categoriesOrder?.length || 0;
              const totalItems = Object.values(
                selectedByFunction[selectedFunction]?.categories || {},
              ).flat().length;
              const isUpdate = payload.id !== 0;
              const pkgInfo = packageInfoByFunction[selectedFunction];
              const packageText =
                packageAppliedForFunction[selectedFunction] && pkgInfo
                  ? ` | Package: ${pkgInfo.packageName} (₹${pkgInfo.packagePrice})`
                  : " | Type: A La Carte";

              // ── Build the detailed change summary against the pre-save snapshot ──
           
                const changeSummary = buildFullChangeSummary(prevBucketSnapshot, nextFullSnapshot);
                  const description =
  `Menu ${isUpdate ? "Updated" : "Saved"} — ` +
  `Event No: ${eventNo} | Customer: ${customerName} | ` +
  `Event Type: ${eventType} | Venue: ${venueName} | ` +
  `Date: ${eventStart} to ${eventEnd} | ` +
  `Function: ${functionName} | Pax: ${personCount} | Rate: ${defaultRate}` +
  ` | Categories: ${totalCategories} | Items: ${totalItems}` +
  packageText +
  ` | Changes: ${changeSummary}`;

  lastFullSnapshotRef.current = nextFullSnapshot;

              AddLogs({
                description,
                eventType: isUpdate ? cfg.labels.logEventUpdate : cfg.labels.logEventSave,
                id: Number(eventId) || 0,
                eventId: Number(eventId) || 0,
                user: getUserEmail(),
              }).catch((err) => console.error("Failed to save log:", err));

              await animateProgress(85, 100, 500);

              Swal.fire({
                icon: "success",
                title: isUpdate
                  ? "Menu updated successfully!"
                  : "Menu saved successfully!",
                showConfirmButton: false,
                timer: 1500,
              });
            } else if (resp?.data?.msg === "Menu Category not found with id: 0") {
              Swal.fire({
                icon: "error",
                title:
                  "Category doesn't have any items. Please add items to category or Delete the category.",
                showConfirmButton: true,
              });
            }
          } catch (err) {
            Swal.fire({
              icon: "error",
              title: "Failed to save menu!",
              text: err?.response?.data?.msg,
            });
          } finally {
            setTimeout(() => {
              isSavingRef.current = false;
              setIsSaving(false);
              setIsSubmitting(false);
              setSaveProgress(0);
            }, 600);
          }
          };




          const instructionDebounceRef = useRef({});
          const instructionLatestValueRef = useRef({}); 
          const savedMenuPrepCacheRef = useRef({});
          const loadSavedMenuPrepInFlightRef = useRef(null);
        ;
          const lastFullSnapshotRef = useRef(null);

          const onInstructionsChange = useCallback(
          (functionId, categoryName, itemId, englishNote) => {
          setIsDirty(true);

          const debounceKey = `${functionId}_${categoryName}_${itemId}`;

          // Always track the latest value for this item
          instructionLatestValueRef.current[debounceKey] = englishNote;

          // Save English immediately
          setSelectedByFunction((prev) => {
            const bucket = prev[functionId];
            if (!bucket) return prev;
            const categories = { ...bucket.categories };
            categories[categoryName] = (categories[categoryName] || []).map((item) =>
              Number(item.id) === Number(itemId)
                ? {
                    ...item,
                    itemInstruction: {
                      english: englishNote,
                      hindi: englishNote ? item.itemInstruction?.hindi || "" : "",
                      gujarati: englishNote ? item.itemInstruction?.gujarati || "" : "",
                    },
                  }
                : item,
            );
            return { ...prev, [functionId]: { ...bucket, categories } };
          });

          if (instructionDebounceRef.current[debounceKey]) {
            clearTimeout(instructionDebounceRef.current[debounceKey]);
          }

          if (!englishNote.trim()) return;

          instructionDebounceRef.current[debounceKey] = setTimeout(async () => {

            const latestValue = instructionLatestValueRef.current[debounceKey];
            if (!latestValue?.trim()) return;

            try {
              const translated = await Translateapi(latestValue);
              
              setSelectedByFunction((prev) => {
                const bucket = prev[functionId];
                if (!bucket) return prev;
                const categories = { ...bucket.categories };
                categories[categoryName] = (categories[categoryName] || []).map((item) => {
                  if (Number(item.id) !== Number(itemId)) return item;
                  // Only update if english still matches what we translated
                  if (item.itemInstruction?.english !== latestValue) return item;
                  return {
                    ...item,
                    itemInstruction: {
                      english: latestValue,
                      hindi: translated?.data?.hindi || "",
                      gujarati: translated?.data?.gujarati || "",
                    },
                  };
                });
                return { ...prev, [functionId]: { ...bucket, categories } };
              });
            } catch (err) {
              console.error("Translation failed", err);
            }
            finally {
          delete instructionDebounceRef.current[debounceKey]; 
          setInsTranslating(false);
          }
          }, 700);
          },
          [],
          );

          const onCategoryInstructionsChange = useCallback(
  (functionId, categoryName, englishNote) => {
    setIsDirty(true);

    const debounceKey = `${functionId}_${categoryName}___CATEGORY__`;
    instructionLatestValueRef.current[debounceKey] = englishNote;

    // Save English immediately
    setSelectedByFunction((prev) => {
      const bucket = prev[functionId];
      if (!bucket) return prev;
      const prevNote = bucket.categoryNotes?.[categoryName] || {};
      return {
        ...prev,
        [functionId]: {
          ...bucket,
          categoryNotes: {
            ...(bucket.categoryNotes || {}),
            [categoryName]: {
              english: englishNote,
              hindi: englishNote ? prevNote.hindi || "" : "",
              gujarati: englishNote ? prevNote.gujarati || "" : "",
            },
          },
        },
      };
    });

    if (instructionDebounceRef.current[debounceKey]) {
      clearTimeout(instructionDebounceRef.current[debounceKey]);
    }

    if (!englishNote.trim()) return;

    instructionDebounceRef.current[debounceKey] = setTimeout(async () => {
      const latestValue = instructionLatestValueRef.current[debounceKey];
      if (!latestValue?.trim()) return;

      try {
        const translated = await Translateapi(latestValue);

        setSelectedByFunction((prev) => {
          const bucket = prev[functionId];
          if (!bucket) return prev;
          const existing = bucket.categoryNotes?.[categoryName];
          // only apply translation if the English text hasn't changed since we sent it
          if (!existing || existing.english !== latestValue) return prev;
          return {
            ...prev,
            [functionId]: {
              ...bucket,
              categoryNotes: {
                ...(bucket.categoryNotes || {}),
                [categoryName]: {
                  english: latestValue,
                  hindi: translated?.data?.hindi || "",
                  gujarati: translated?.data?.gujarati || "",
                },
              },
            },
          };
        });
      } catch (err) {
        console.error("Category instruction translation failed", err);
      } finally {
        delete instructionDebounceRef.current[debounceKey];
      }
    }, 700);
  },
  [],
);

          const handleCategoryChange = (categoryName, categoryId, categoryInfo) => {
          setSelectedCategory(categoryName);
          setSelectedCategoryId(categoryId);
          if (categoryInfo) {
            setSelectedCategoryInfo(categoryInfo);
          } else {
            setSelectedCategoryInfo({
              id: 0,
              nameEnglish: "All",
              nameHindi: "सभी",
              nameGujarati: "બધા",
            });
          }
          };

          const openItemNotesModal = (itemId) => {
          const bucket = selectedByFunction[selectedFunction];
          let foundSlogan = "";
          if (bucket && bucket.categories) {
            Object.values(bucket.categories).forEach((items) => {
              const item = items.find((it) => Number(it.id) === Number(itemId));
              if (item) foundSlogan = item.itemSlogan || "";
            });
          }
          setCurrentItemForNotes(itemId);
          setItemNotes(foundSlogan);
          setShowNoteModal(true);
          };
          const instructionTranslatingRef = useRef({});
          const [insTranslating, setInsTranslating] = useState(false);

          const openInsModal = useCallback((itemId) => {
          setSelectedByFunction((prev) => {
          const bucket = prev[selectedFunction];
          let foundInstruction = { english: "", hindi: "", gujarati: "" };
          if (bucket?.categories) {
            Object.values(bucket.categories).forEach((items) => {
              const item = items.find((it) => Number(it.id) === Number(itemId));
              if (item) {
                foundInstruction = item.itemInstruction || { english: "", hindi: "", gujarati: "" };
              }
            });
          }
          setTimeout(() => {
            setCurrentItemForNotes(itemId);
            setItemNotes({ ...foundInstruction });
            const key = Object.keys(instructionDebounceRef.current).find(k => 
              k.endsWith(`_${itemId}`)
            );
            setInsTranslating(!!key && !!instructionDebounceRef.current[key]);
            setShowInsModal(true);
          }, 0);
          return prev;
          });
          }, [selectedFunction]);


          const openCategoryNotesModal = (categoryName) => {
          const bucket = selectedByFunction[selectedFunction] || {};
          const note = bucket.categoryNotes?.[categoryName];
          const hasEnglish = note?.english?.trim();
          setCategoryNotes({
            notesEnglish: note?.english || "",
            notesHindi: hasEnglish ? note?.hindi || "" : "", 
            notesGujarati: hasEnglish ? note?.gujarati || "" : "",
            slogan: bucket?.categorySlogans?.[categoryName] || "",
          });
          setCurrentCategoryForNotes(categoryName);
          setShowCategoryNoteModal(true);
          };

          const handleNoteSave = (updatedSlogan) => {
          if (!selectedFunction || !currentItemForNotes) return;
          setIsDirty(true);
          setSelectedByFunction((prev) => {
            const bucket = prev[selectedFunction];
            if (!bucket) return prev;
            const updatedCategories = {};
            Object.keys(bucket.categories).forEach((cat) => {
              updatedCategories[cat] = bucket.categories[cat].map((item) =>
                Number(item.id) === Number(currentItemForNotes)
                  ? { ...item, itemSlogan: updatedSlogan }
                  : item,
              );
            });
            return {
              ...prev,
              [selectedFunction]: { ...bucket, categories: updatedCategories },
            };
          });
          setShowNoteModal(false);
          setCurrentItemForNotes(null);
          };

          const handleInsSave = (instructionObj) => {
          if (!selectedFunction || !currentItemForNotes) return;
          setIsDirty(true);

          setShowInsModal(false);
          setCurrentItemForNotes(null);

          const itemIdToUpdate = currentItemForNotes;

          setSelectedByFunction((prev) => {
          const bucket = prev[selectedFunction];
          if (!bucket) return prev;
          const updatedCategories = {};
          Object.keys(bucket.categories).forEach((cat) => {
            updatedCategories[cat] = bucket.categories[cat].map((item) =>
              Number(item.id) === Number(itemIdToUpdate)
                ? { ...item, itemInstruction: instructionObj }
                : item,
            );
          });
          return { ...prev, [selectedFunction]: { ...bucket, categories: updatedCategories } };
          });
          };


          const handleCategoryNoteSave = ({
          notesEnglish,
          notesHindi,
          notesGujarati,
          slogan,
          }) => {
          if (!selectedFunction || !currentCategoryForNotes) return;
          const targetCat = currentCategoryForNotes;
          setIsDirty(true);
          setSelectedByFunction((prev) => {
            const bucket = prev[selectedFunction] || {};
            return {
              ...prev,
              [selectedFunction]: {
                ...bucket,
                categoryNotes: {
                  ...(bucket.categoryNotes || {}),
                  [targetCat]: {
                    english: notesEnglish || "",
                    hindi: notesHindi || "",
                    gujarati: notesGujarati || "",
                  },
                },
                categorySlogans: {
                  ...(bucket.categorySlogans || {}),
                  [targetCat]: slogan || "",
                },
              },
            };
          });
          setShowCategoryNoteModal(false);
          setCurrentCategoryForNotes(null);
          };

          const handleEventSelect = async (newEventId) => {
          if (isDirty && canEdit) {
            const result = await Swal.fire({
              title: "Unsaved Changes",
              text: "You have unsaved changes. Do you want to save before switching events?",
              icon: "warning",
              showCancelButton: true,
              showDenyButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              denyButtonColor: "#6c757d",
              confirmButtonText: "Save & Switch",
              denyButtonText: "Switch Without Saving",
              cancelButtonText: "Cancel",
            });

            if (result.isConfirmed) {
              await handleSaveOrUpdate();
              setSelectedEventId(newEventId);
              setIsAllCustomerToogleOpen(false);
              navigate(`/menu-preparation/${newEventId}`);
            } else if (result.isDenied) {
              setSelectedEventId(newEventId);
              setIsAllCustomerToogleOpen(false);
              navigate(`/menu-preparation/${newEventId}`);
            }
          } else {
            setSelectedEventId(newEventId);
            setIsAllCustomerToogleOpen(false);
            navigate(`/menu-preparation/${newEventId}`);
          }
          };
          const handleOpenEditFunction = async () => {
  if (isDirty && canEdit) {
    const result = await Swal.fire({
      title: "Unsaved Changes",
      text: "You have unsaved changes. Please save your changes first before editing function details.",
      icon: "warning",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      denyButtonColor: "#6c757d",
      confirmButtonText: "Save & Continue",
      denyButtonText: "Continue Without Saving",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await handleSaveOrUpdate();
      setEditPax(true);
    } else if (result.isDenied) {
      setEditPax(true);
    }
    // if cancelled, do nothing — modal stays closed
  } else {
    setEditPax(true);
  }
};

          const currentPackageCategories =
          packageCategoriesByFunction[selectedFunction] || [];
          const currentPackageItems = packageItemsByFunction[selectedFunction] || [];

          if (loading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading event data...</p>
              </div>
            </div>
          );
          }

          if (error) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="bg-red-50 border border-red-200 rounded p-4 max-w-md">
                <p className="text-red-800 font-semibold mb-2">Error loading event</p>
                <p className="text-[#863232]">{error}</p>
              </div>
            </div>
          );
          }

          const selectedPkgInfo = packageInfoByFunction[selectedFunction] || null;

          return (
          <Fragment>
            {/* Unsaved Changes Warning Modal */}
            {blocker.state === "blocked" && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                      <i className="ki-filled ki-information-2 text-yellow-500 text-lg" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Unsaved Changes
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-5">
                    You have unsaved changes. Do you want to save before leaving?
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn btn-sm btn-light"
                      onClick={() => blocker.reset()}
                    >
                      Stay
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => blocker.proceed()}
                    >
                      Leave Without Saving
                    </button>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={async () => {
                        await handleSaveOrUpdate();
                        blocker.proceed();
                      }}
                    >
                      Save & Leave
                    </button>
                  </div>
                </div>
              </div>
            )}
          <div className="flex flex-col w-full custom-scrollbar" style={{ height: "100vh", overflow: "hidden" }}>
          <div className="flex-1 px-4 py-2 overflow-y-auto ">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-6  ">
                    <h2 className="text-lg text-black font-semibold">
          <FormattedMessage id="USER.EVENT_PLANNING.STEP_TITLE" defaultMessage="2. Menu Planning" />
          </h2>

                    <div className="flex gap-2 flex-wrap">
                    {canEdit && (
  <button
    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors"
    onClick={handleOpenEditFunction}
  >
    <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
      <i className="ki-filled ki-user text-[11px] text-white"></i>
    </span>
    <FormattedMessage id="USER.EVENT_PLANNING.EDIT_PERSON" defaultMessage="Edit Function" />
  </button>
)}
                      

          {mode === "menu" && permMenuExecution.view && (
          <button
          onClick={() => navigate(`/menu-allocation/${eventId}`)}
          disabled={shouldDisableNavButtons}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold shadow-sm hover:border-primary hover:text-primary transition-colors ${shouldDisableNavButtons ? "opacity-40 cursor-not-allowed hover:border-gray-300 hover:text-gray-700" : ""}`}
          >
          <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <i className="ki-filled ki-menu text-[16px] text-primary"></i>
          </span>
          <FormattedMessage id="USER.EVENT_PLANNING.MENU_EXECUTION_STEP" defaultMessage="3. Menu Execution" />
          </button>
          )}

          {mode === "menu" && permRawMaterial.view && (
          <button
          disabled={shouldDisableNavButtons}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold shadow-sm hover:border-primary hover:text-primary transition-colors ${shouldDisableNavButtons ? "opacity-40 cursor-not-allowed hover:border-gray-300 hover:text-gray-700" : ""}`}
          onClick={() => navigate(`/raw-material-allocation/${eventId}`)}
          >
          <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <i className="ki-filled ki-gift text-[16px] text-primary"></i>
          </span>
            <FormattedMessage id="USER.EVENT_PLANNING.RAW_MATERIAL_STEP" defaultMessage="4. Raw Material Distribution" />
          </button>
          )}

          {mode === "menu" && permRawMaterial.view && (
          <button
          disabled={shouldDisableNavButtons}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold shadow-sm hover:border-primary hover:text-primary transition-colors ${shouldDisableNavButtons ? "opacity-40 cursor-not-allowed hover:border-gray-300 hover:text-gray-700" : ""}`}
          onClick={() => navigate(`/labour-and-other-management/${eventId}`)}
          >
          <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <i className="ki-filled ki-users text-[16px] text-primary"></i>
          </span>
            <FormattedMessage id="USER.EVENT_PLANNING.AGENCY_STEP" defaultMessage="5. Agency Distribution" />
          </button>
          )}

          {permQuotation.view && (
          <button
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold shadow-sm hover:border-primary hover:text-primary transition-colors"
          onClick={() => navigate(`/quotation/${eventId}?type=${mode}`)}
          >
          <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <i className="ki-filled ki-note text-[16px] text-primary"></i>
          </span>
          <FormattedMessage id="USER.EVENT_PLANNING.QUOTATION_STEP" defaultMessage="6. Quotation" />
          </button>
          )}
                    </div>

                    <button
                      onClick={() => navigate("/")} 
                      className="btn border border-gray-300 text-gray-700 bg-white font-semibold hover:bg-gray-100"
                    >
                      <Calendar size={16} />  <FormattedMessage id="USER.EVENT_PLANNING.GO_TO_CALENDAR" defaultMessage="Go to Calendar" />
                    </button>

                  
                  </div>
                </div>

                <div className={`border rounded mb-4 w-full `}>
          <div className="card w-full">
          <div className={`w-full border-b p-3 `}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-2">
              <div className="flex items-center gap-2">
                <img className="w-5 h-5" src={toAbsoluteUrl("/media/menu/eventno.png")} alt="event no" />
                <span className="text-sm font-semibold text-gray-900"> <FormattedMessage id="USER.EVENT_PLANNING.EVENT_NO_LABEL" defaultMessage="Event No:" /></span>
                <span
                  className={`  underline cursor-pointer ${isHighlightUser ? "font-extrabold text-lg px-1 rounded text-[#863232]" : "font-semibold text-sm text-primary"}`}
                  onClick={() => setIsAllCustomerToogleOpen(true)}
                >
                  {eventData?.eventNo}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <img className="w-5 h-5" src={toAbsoluteUrl("/media/menu/person.png")} alt="person" />
                <span className="text-sm font-semibold text-gray-900"><FormattedMessage id="USER.EVENT_PLANNING.PERSON_LABEL" defaultMessage="Person:" /></span>
                <input
                  type="tel" min={1} readOnly
                  className={`input input-sm w-28 ${isHighlightUser ? "font-extrabold text-primary text-base" : "text-gray-800"}`}
                  value={personCount}
                  onChange={(e) => setPersonCount(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <img className="w-5 h-5" src={toAbsoluteUrl("/media/menu/eventname.png")} alt="event name" />
                <span className="text-sm font-semibold text-gray-900">  <FormattedMessage id="USER.EVENT_PLANNING.EVENT_NAME_LABEL" defaultMessage="Event Name:" />
          </span>
                <span className={` ${isHighlightUser ? "font-extrabold text-lg text-[#863232]" : " text-primary text-sm font-semibold"}`}>
                  {eventData?.eventType?.nameEnglish}
                </span>
              </div>
            </div>

            <hr className="border-t-2 border-gray-300 my-3" />

            <div>
              <div className="flex items-center gap-2">
                <img className="w-5 h-5" src={toAbsoluteUrl("/media/menu/partyname.png")} alt="party" />
                <span className="text-sm font-semibold text-gray-900"> <FormattedMessage id="USER.EVENT_PLANNING.CUSTOMER_LABEL" defaultMessage="Customer:" /></span>
                <span className={` ${isHighlightUser ? "font-extrabold text-lg text-[#863232]" : "text-sm text-primary font-semibold"}`}>
                  {eventData?.party?.nameEnglish}
                </span>
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <img className="w-5 h-5" src={toAbsoluteUrl("/media/menu/venue.png")} alt="venue" />
                  <span className="text-sm font-semibold text-gray-900"><FormattedMessage id="USER.EVENT_PLANNING.VENUE_LABEL" defaultMessage="Venue:" /></span>
                  <span className={` ${isHighlightUser ? "font-extrabold text-lg text-[#863232]" : "text-sm text-primary font-semibold"}`}>
                    {eventData?.venue?.nameEnglish || ""}
                  </span>
                </div>
                
              </div>

            


                {/* Preparation Status Dropdown */}
          <div className="flex felx-col justify-end gap-2 mt-5">
          {canAccessDecor  && (
          <button
          type="button"
          onClick={() => navigate(`/menu-preparation/${eventId}`)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
          <ChefHat size={18} />
          <FormattedMessage id="USER.EVENT_PLANNING.MENU_PLANNING_BTN" defaultMessage="Menu Planning" />
          </button>
          )}

          {canAccessDecor  && (
          <button
          type="button"
          onClick={() => navigate(`/decor-preparation/${eventId}`)}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
          <Sparkles size={18} />
          <FormattedMessage id="USER.EVENT_PLANNING.DECOR_PLANNING_BTN" defaultMessage="Decor Planning" />
          </button>

          )}

          <button
          type="button"
          onClick={() => {
          fetchRawMaterials();
          fetchRawMaterialCategories();
          setShowPermissableModal(true);
          }}
          className="btn w-auto flex items-center justify-center gap-2 bg-white hover:bg-rose-50 text-rose-600 font-semibold border border-rose-500"
          >
          <FileText size={16} />
          Permissable / Non Permissable
          </button>


          {canAccessMenuExtraFeature && (
          <button
          type="button"
          onClick={() => setShowAdvancePayment(true)}
          className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-500 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors"
          >
          <IndianRupee size={16} />
          <FormattedMessage id="USER.EVENT_PLANNING.PAYMENT_RECEIPT_BTN" defaultMessage="Payment Receipt" />
          </button>
          )}


          {/* Existing Revision History button */}

          {canAccessMenuExtraFeature && (
          <button
          type="button"
          onClick={() => setShowRevisionHistory(true)}
          className="bg-white hover:bg-violet-50 text-violet-600 border border-violet-500 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors"
          >
          <NotebookPen size={16} />
          <FormattedMessage id="USER.EVENT_PLANNING.REVISION_HISTORY_BTN" defaultMessage="Revision History" />
          </button>
          )}



          {canAccessMenuExtraFeature && (
          <>
          <label className="flex items-center font-semibold"> <FormattedMessage id="USER.EVENT_PLANNING.STATUS_LABEL" defaultMessage="Status:" /></label>
          <select
            value={prepStatus ?? ""}
            disabled={prepStatusLoading}
            onChange={(e) => handlePrepStatusChange(e.target.value)}
            className={`border rounded-lg px-3 py-1.5 text-sm font-semibold outline-none transition
              ${prepStatus === "PENDING"   ? "border-yellow-400 bg-yellow-50 text-yellow-700"
              : prepStatus === "RUNNING"   ? "border-blue-400 bg-blue-50 text-blue-700"
              : prepStatus === "COMPLETED" ? "border-green-400 bg-green-50 text-green-700"
              : "border-gray-300 bg-white text-gray-600"}`}
          >
              <option value="">
              {intl.formatMessage({ id: "USER.EVENT_PLANNING.SELECT_STATUS_OPTION", defaultMessage: "— Select Status —" })}
            </option>
            <option value="PENDING">
              {intl.formatMessage({ id: "USER.EVENT_PLANNING.STATUS_PENDING", defaultMessage: "Pending" })}
            </option>
            <option value="RUNNING">
              {intl.formatMessage({ id: "USER.EVENT_PLANNING.STATUS_RUNNING", defaultMessage: "Running" })}
            </option>
            <option value="COMPLETED">
              {intl.formatMessage({ id: "USER.EVENT_PLANNING.STATUS_COMPLETE", defaultMessage: "Complete" })}
            </option>
          </select>
          {prepStatusLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
          )}
          </>
          )}
          </div>
            </div>

            <hr className="border-t-2 border-gray-300 my-3" />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
              <div className="flex items-center gap-2">
                <img className="w-5 h-5" src={toAbsoluteUrl("/media/menu/eventdate.png")} alt="date" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900"> <FormattedMessage id="USER.EVENT_PLANNING.EVENT_START_DATE_LABEL" defaultMessage="Event Start Date :" /></span>
                  <span className={` ${isHighlightUser ? "font-extrabold text-lg text-[#863232]" : "text-sm text-primary font-semibold"}`}>
                    {eventData?.eventStartDateTime?.split(" ")[0]}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <img className="w-5 h-5" src={toAbsoluteUrl("/media/menu/eventdate.png")} alt="date" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900"><FormattedMessage id="USER.EVENT_PLANNING.EVENT_END_DATE_LABEL" defaultMessage="Event End Date :" /></span>
                  <span className={` ${isHighlightUser ? "font-extrabold text-lg text-[#863232]" : "text-sm text-primary font-semibold"}`}>
                    {eventData?.eventEndDateTime?.split(" ")[0]}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <img className="w-5 h-5" src={toAbsoluteUrl("/media/menu/rate.png")} alt="rate" />
                <span className="text-sm font-semibold text-gray-900"><FormattedMessage id="USER.EVENT_PLANNING.RATE_LABEL" defaultMessage="Rate:" /></span>
                <input
                  type="text" min={0} readOnly
                  className={`input input-sm w-28 ${isHighlightUser ? "font-extrabold text-primary border-primary" : "text-gray-800"}`}
                  value={defaultRate}
                  onChange={(e) => { setDefaultRate(e.target.value); setIsDirty(true); }}
                />
              </div>

            <div className="flex items-center gap-2">
          <button
          className="btn w-[160px] flex items-center justify-center gap-2 bg-white hover:bg-amber-50 text-amber-600 font-semibold border border-amber-500"
          onClick={() => {
            setExtraChargesData(null);
            fetchExtraCharges();
            setShowExtraChargesModal(true);
          }}
          >
          <IndianRupee size={16} />
            <FormattedMessage id="USER.EVENT_PLANNING.EXTRA_CHARGE_BTN" defaultMessage="Extra Charge" />
          </button>




          <Tooltip title={intl.formatMessage({ id: "USER.EVENT_PLANNING.TERMS_TOOLTIP", defaultMessage: "Terms & Conditions" })}>
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="w-10 h-10 rounded-lg bg-white hover:bg-teal-50 border border-teal-500 text-teal-600 flex items-center justify-center transition-colors"
          >
            <FileText size={18} strokeWidth={2.5} />
          </button>
          </Tooltip>
          </div>

          {canEdit && (
          <button
          className="btn w-48 flex items-center justify-center gap-2 bg-white hover:bg-indigo-50 text-indigo-600 font-semibold border border-indigo-500"
          onClick={() => setIsCopyMenuModalOpen(true)}
          >
          <NotebookPen className="w-4 h-4" /> {mode === "decor"
            ? intl.formatMessage({ id: "USER.EVENT_PLANNING.COPY_DECOR_PLANNING_BTN", defaultMessage: "Copy Decor Planning" })
            : intl.formatMessage({ id: "USER.EVENT_PLANNING.COPY_MENU_PLANNING_BTN", defaultMessage: "Copy Menu Planning" })}
          </button>
          )}

                            

            </div>


          </div>
          </div>
          </div>

                {/* functions + package controls */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-1">
                  <div className="lg:col-span-2 relative">
                    <button
                      onClick={() => scroll("left")}
                      className="absolute left-1 top-1/2 -translate-y-1/2 z-999 bg-primary shadow-md rounded-full p-1 hover:bg-gray-100"
                    >
                      <ChevronLeft
                        size={18}
                        className="text-white hover:text-primary"
                      />
                    </button>
                    <div
                      ref={scrollRef}
                      className="flex gap-3 border rounded overflow-x-auto no-scrollbar py-2 px-8 text-gray-500 bg-gray-200 scroll-smooth"
                    >
                      {eventData?.eventFunctions?.map((func) => (
                        <div
                          key={func.id}
                          onClick={() => handleFunctionChange(func.id)}
                          className="cursor-pointer flex-shrink-0"
                        >
                          <FunctionCard
                            functionData={func}
                            isSelected={selectedFunction === func.id}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => scroll("right")}
                      className="absolute right-1 top-1/2 -translate-y-1/2 z-999 bg-primary shadow-md rounded-full p-1 hover:bg-gray-100"
                    >
                      <ChevronRight
                        size={18}
                        className="text-white hover:text-primary"
                      />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 p-2 border rounded bg-gray-200">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveOrUpdate}
                        disabled={isSubmitting || isSaving || !isDirty || !canEdit}
                        className="btn bg-success text-white px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {hasExistingData
          ? intl.formatMessage({ id: "USER.EVENT_PLANNING.UPDATE_MENU_BTN", defaultMessage: "Update Menu" })
          : intl.formatMessage({ id: "USER.EVENT_PLANNING.SAVE_MENU_BTN", defaultMessage: "Save Menu" })}
          </button>
                      {canEdit && (
                        <button
                          className={`btn text-sm px-3 py-1 ${
                            packageAppliedForFunction[selectedFunction]
                              ? "bg-white text-primary border border-primary"
                              : "bg-primary text-white"
                          }`}
          onClick={() => {
          setPackageAppliedForFunction((prev) => ({ ...prev, [selectedFunction]: false }));
          setPackageCategoryLimitsByFunction((prev) => ({ ...prev, [selectedFunction]: {} }));
          setPackageCategoriesByFunction((prev) => ({ ...prev, [selectedFunction]: [] }));
          setPackageItemsByFunction((prev) => ({ ...prev, [selectedFunction]: [] }));
          setPackageInfoByFunction((prev) => ({ ...prev, [selectedFunction]: null }));

          const cached = savedMenuPrepCacheRef.current[selectedFunction];
          setSelectedByFunction((prev) => ({
          ...prev,
          [selectedFunction]: cached || {
            categoriesOrder: [],
            categories: {},
            categoryNotes: {},
            categorySlogans: {},
            categorySubTexts: {},
          },
          }));

          setIsDirty(false);
          }}
                        >
                          <FormattedMessage id="USER.EVENT_PLANNING.A_LA_CARTE_BTN" defaultMessage="A La Carte" />
                        </button>
                      )}

                      {canEdit && (
                        <button
                          className={`btn text-sm px-3 py-1 ${
                            packageAppliedForFunction[selectedFunction]
                              ? "bg-primary text-white"
                              : "bg-white text-primary border border-primary"
                          }`}
                          onClick={() => setShowCustomPackageModal(true)}
                        >
                          <FormattedMessage id="USER.EVENT_PLANNING.MENU_PACKAGE_BTN" defaultMessage="Menu Package" />
                        </button>
                      )}
                      <button
                        className="btn bg-primary text-white text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          setMenuReportEventId(eventId);
                          setIsSelectMenuReport(true);
                        }}
                        disabled={!hasSelectedItems || isDirty}
                      >
                        <FormattedMessage id="USER.EVENT_PLANNING.REPORT_BTN" defaultMessage="Report" />
                      </button>
                      {canAccessMenuLink && packageAppliedForFunction[selectedFunction] && (
          <button
          className="btn bg-blue-600 text-white text-sm px-3 py-1"
          onClick={() => {
            setShareLink("");
            setShowShareModal(true);
            handleGenerateShareLink();
          }}
          >
          <FormattedMessage id="USER.EVENT_PLANNING.SHARE_MENU_BTN" defaultMessage="Share Menu" />
          </button>
          )}


          {canAccessFoodFestival && (
          <button
          className="btn bg-orange-500 text-white text-sm px-3 py-1"
          onClick={() => setShowFoodFestivalModal(true)}
          >
          <FormattedMessage id="USER.EVENT_PLANNING.FOOD_FESTIVAL_BTN" defaultMessage="Food Festival" />
          </button>
          )}
                      
                    </div>

                    {packageAppliedForFunction[selectedFunction] &&
                      selectedPkgInfo && (
                        <div className="flex w-full bg-blue-50 border border-blue-300 rounded-lg p-2 justify-between">
                          <p className="text-sm font-semibold text-primary">
                            <FormattedMessage id="USER.EVENT_PLANNING.PACKAGE_NAME_LABEL" defaultMessage="Name:" /> {selectedPkgInfo.packageName}
                          </p>
                          {/* <p className="text-sm font-semibold text-primary">
                            <FormattedMessage id="USER.EVENT_PLANNING.PACKAGE_PRICE_LABEL" defaultMessage="Price:ff" /> ₹{selectedPkgInfo.packagePrice}
                          </p> */}
                        </div>
                      )}
                  </div>
                </div>


              <div className="grid grid-cols-1 lg:grid-cols-5 gap-2" style={{ height: "calc(100vh - 220px)" }}>
          {/* LEFT: Categories + Items */}
          <div className="lg:col-span-3 border rounded overflow-hidden flex flex-col lg:flex-row" style={{ height: "100%" }}>

          {/* Category column */}
          <div className="w-full lg:w-[30%] border-b lg:border-b-0 lg:border-r flex flex-col flex-shrink-0 lg:min-h-0">
            <SearchWithCategorySuggestions
              searchCategoriesFn={cfg.api.searchCategories}
              value={categorySearchTerm}
              onChange={(v) => setCategorySearchTerm(v)}
              onAdd={canEdit ? () => setIsCategoryModalOpen(true) : undefined}
              selectedCategoryId={selectedCategoryId}
              onCategoryChange={handleCategoryChange}
              refreshKey={refreshList}
              packageCategories={currentPackageCategories}
              savedCategoriesOrder={selectedByFunction[selectedFunction]?.categoriesOrder || []}
              isDisabled={isMenuItemLoading}
              userId={userId}
            />

            <div className="overflow-x-auto no-scrollbar p-2 flex-shrink-0
                            lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:custom-scrollbar lg:p-3">
              <CategoryList
                fetchCategoriesFn={cfg.api.getAllCategories}
                refreshKey={refreshList}
                selectedCategoryId={selectedCategoryId}
                onCategoryChange={handleCategoryChange}
                searchTerm={categorySearchTerm}
                packageCategories={currentPackageCategories}
                savedCategoriesOrder={selectedByFunction[selectedFunction]?.categoriesOrder || []}
                isDisabled={isMenuItemLoading}
              />
            </div>
          </div>

          {/* Item grid column */}
            <div className="w-full lg:w-[70%] flex flex-col min-h-0 flex-1">
            <div className="border-b p-3 bg-light flex items-center gap-3 flex-shrink-0">
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <SearchWithSuggestions
                    value={itemSearchTerm}
                    onChange={(v) => setItemSearchTerm(v)}
                    allMenuItems={allMenuItemsForSuggestion}
                    selectedIdsSet={getSelectedIdsForFunction(selectedFunction)}
                    onToggleSelect={onToggleSelectItem}
                    category={selectedCategory}
                    getLocalizedName={(item) => item.menuItemName || ""}
                    getLocalizedCategoryName={(item) =>
                      item.menuCategoryName || item.menuCategory?.nameEnglish || "Uncategorized"
                    }
                    selectedFunctionId={selectedFunction}
                    userId={userId}
                    placeholder={intl.formatMessage({ id: "USER.EVENT_PLANNING.SEARCH_ITEMS_PLACEHOLDER", defaultMessage: "Search items" })}
                  />

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setIsItemModalOpen(true)}
                      className="btn btn-primary w-8 h-8 flex items-center justify-center rounded-full"
                    >
                      <i className="ki-filled ki-plus text-md"></i>
                    </button>
                  )}

                  <Tooltip title={intl.formatMessage({ id: "USER.EVENT_PLANNING.SPEECH_TO_TEXT_TOOLTIP", defaultMessage: "Start speech to text" })}>
                    <button
                      type="button"
                      className="btn btn-primary flex items-center justify-center rounded-full p-0 w-8 h-8"
                    >
                      <Mic size={18} />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3">
              <MenuItemGrid
          fetchItemsFn={cfg.api.getItems}    
          fields={cfg.fields}
          refreshKey={refreshList}
          category={selectedCategory}
          categoryId={itemSearchTerm.trim() ? 0 : selectedCategoryId}
          searchTerm={itemSearchTerm}
          selectedIdsSet={getSelectedIdsForFunction(selectedFunction)}
          onToggleSelect={onToggleSelectItem}
          selectedFunctionId={selectedFunction}
          packageItems={currentPackageItems}
          selectedItemsData={selectedByFunction[selectedFunction]}
          packageCategoryLimits={
          packageAppliedForFunction[selectedFunction]
            ? packageCategoryLimitsByFunction[selectedFunction] || {}
            : {}
          }
          onLoadingChange={setIsMenuItemLoading}
          onItemsLoaded={(items) => {
          setAllMenuItemsForSuggestion(items);
          allMenuItemsRef.current = items;
          }}
          />
            </div>
          </div>
          </div>

          {/* RIGHT: Selected Items */}
          <div
          ref={selectedItemsPanelRef}
          className="hidden lg:flex lg:col-span-2 border rounded flex-col bg-gray-100 overflow-hidden"
          style={{ height: "100%" }}
          >
          <div className="flex items-center justify-between border-b p-3 h-[69px] flex-shrink-0">
            <p className="font-semibold text-gray-700"><FormattedMessage id="USER.EVENT_PLANNING.SELECTED_ITEMS_TITLE" defaultMessage="Selected Items" /></p>
            
            <div>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                aria-label="Toggle image visibility"
                onClick={() => setShowImage(!showImage)}
              >
                {showImage ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                aria-label="Toggle rate visibility"
                onClick={() => setShowRates(!showRates)}
              >
                {showRates ? <Eye className="text-primary" size={20} /> : <EyeOff className="text-primary" size={20} />}
              </button>
            </div>
          </div>

          {/* SelectedItems already has its own internal overflow-y-auto.no-scrollbar wrapper —
              this outer div just needs to be the flexed, sized container that constrains it */}
          <div className="flex-1 min-h-0 flex flex-col ">
            <SelectedItems
            loading={isPrepLoading}
            functionRate={Number(defaultRate) || 0}
            packageInfo={packageInfoByFunction[selectedFunction] || null} 
              onQtyChange={handleQtyChange}
              mode={mode}
              key={selectedFunction}
              readOnly={!canEdit}
              functionId={selectedFunction}
              onSubCatSave={handleSubCatSave}
              onItemSubSave={handleItemSubSave}
              onCategoryHeadingSave={handleCategoryHeadingSave} 
              onItemHeadingSave={handleItemHeadingSave} 
              data={{
                ...(selectedByFunction[selectedFunction] || { categoriesOrder: [], categories: {} }),
                categorySpaces: categorySpacesByFunction[selectedFunction] || {},
              }}
              onRemove={(f, c, i) => onRemoveSelectedItem(f || selectedFunction, c, i)}
              onDragEndNewState={(state) => onDragEndSelected(selectedFunction, state)}
              showRates={showRates}
              showImage={showImage}
              onRateChange={onRateChange}
              onOpenItemNotes={openItemNotesModal}
              onOpenCategoryNotes={openCategoryNotesModal}
              onInstructionsChange={onInstructionsChange}
              onOpenItemIns={openInsModal}
              addonState={addonState[selectedFunction] || {}}
              onToggleCategoryAddon={handleToggleCategoryAddon}
              onToggleItemAddon={handleToggleItemAddon}
              packageCategoryLimits={
                packageAppliedForFunction[selectedFunction]
                  ? packageCategoryLimitsByFunction[selectedFunction] || {}
                  : {}
              }
              onSpaceSave={handleCategorySpaceSave}
              onItemSpaceSave={handleItemSpaceSave}
              onImageSave={handleImageSave}
              categoryImages={categoryImagesByFunction[selectedFunction] || {}}
              onRenameItemSave={handleRenameItem}
              onRenameCatSave={handleRenameCat}
              primaryItems={primaryItemsByFunction[selectedFunction] || {}}
              onSelectPrimaryItem={handleSelectPrimaryItem}
              onItemImageUpload={handleItemImageUpload} 
                onCategoryInstructionsChange={onCategoryInstructionsChange}
                onMenuItemImageUpload={handleMenuItemImageUpload}
                onVendorSave={handleVendorSave}
            />
          </div>
          </div>
          </div>

          <button
          type="button"
          onClick={() => setShowSelectedSheet(true)}
          className="lg:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2
                    bg-primary text-white px-5 py-3 rounded-full shadow-lg font-semibold text-sm"
          >
          <UtensilsCrossed size={18} />
          Selected Items
          {totalSelectedCount > 0 && (
          <span className="bg-white text-primary rounded-full min-w-5 h-5 px-1 flex items-center justify-center text-xs font-bold">
            {totalSelectedCount}
          </span>
          )}
          </button>

          {/* Bottom-sheet overlay — mobile/tablet only */}
          {showSelectedSheet && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSelectedSheet(false)}
          />
          <div
            className="relative bg-gray-100 rounded-t-2xl shadow-2xl flex flex-col"
            style={{ height: "85vh", animation: "eventSheetSlideUp .28s ease-out" }}
          >
            <div className="relative flex items-center justify-between border-b p-3 flex-shrink-0 bg-white rounded-t-2xl">
              <span className="absolute left-1/2 -translate-x-1/2 top-1.5 w-10 h-1.5 bg-gray-300 rounded-full" />
              <p className="font-semibold text-gray-700 mt-2">Selected Items</p>
              <div className="flex items-center gap-1 mt-2">
                <button type="button" className="p-1 rounded hover:bg-gray-100" onClick={() => setShowImage(!showImage)}>
                  {showImage ? <Eye size={20} className="text-primary" /> : <EyeOff size={20} className="text-primary" />}
                </button>
                <button type="button" className="p-1 rounded hover:bg-gray-100" onClick={() => setShowRates(!showRates)}>
                  {showRates ? <Eye className="text-primary" size={20} /> : <EyeOff className="text-primary" size={20} />}
                </button>
                <button type="button" className="p-1 rounded hover:bg-gray-100" onClick={() => setShowSelectedSheet(false)}>
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
              <SelectedItems
                loading={isPrepLoading}
                functionRate={Number(defaultRate) || 0}
                packageInfo={packageInfoByFunction[selectedFunction] || null}
                onQtyChange={handleQtyChange}
                mode={mode}
                key={`sheet-${selectedFunction}`}
                readOnly={!canEdit}
                functionId={selectedFunction}
                onSubCatSave={handleSubCatSave}
                onItemSubSave={handleItemSubSave}
                data={{
                  ...(selectedByFunction[selectedFunction] || { categoriesOrder: [], categories: {} }),
                  categorySpaces: categorySpacesByFunction[selectedFunction] || {},
                }}
                onRemove={(f, c, i) => onRemoveSelectedItem(f || selectedFunction, c, i)}
                onDragEndNewState={(state) => onDragEndSelected(selectedFunction, state)}
                showRates={showRates}
                showImage={showImage}
                onRateChange={onRateChange}
                onOpenItemNotes={openItemNotesModal}
                onOpenCategoryNotes={openCategoryNotesModal}
                onInstructionsChange={onInstructionsChange}
                onOpenItemIns={openInsModal}
                addonState={addonState[selectedFunction] || {}}
                onToggleCategoryAddon={handleToggleCategoryAddon}
                onToggleItemAddon={handleToggleItemAddon}
                packageCategoryLimits={
                  packageAppliedForFunction[selectedFunction]
                    ? packageCategoryLimitsByFunction[selectedFunction] || {}
                    : {}
                }
                onSpaceSave={handleCategorySpaceSave}
                onItemSpaceSave={handleItemSpaceSave}
                onImageSave={handleImageSave}
                categoryImages={categoryImagesByFunction[selectedFunction] || {}}
                onRenameItemSave={handleRenameItem}
                onRenameCatSave={handleRenameCat}
                primaryItems={primaryItemsByFunction[selectedFunction] || {}}
                onSelectPrimaryItem={handleSelectPrimaryItem}
                  onCategoryInstructionsChange={onCategoryInstructionsChange}
              />
            </div>
          </div>
          <style>{`
            @keyframes eventSheetSlideUp {
              from { transform: translateY(100%); }
              to   { transform: translateY(0); }
            }
          `}</style>
          </div>
          )}



            </div>      
              <div className="fixed bottom-20 right-6 z-40">
                {canAccessStock && (
          <button
            onClick={openAiModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7)", boxShadow: "0 4px 18px rgba(99,102,241,.5)" }}
          >
            <Wand2 size={15} />
            <FormattedMessage id="USER.EVENT_PLANNING.AI_GENERATE_MENU_BTN" defaultMessage="AI Generate Menu" />
          </button>
                )}
          </div>

              {/* <div className="bg-white">
                <div className="flex items-center justify-end px-2 py-3">
                  <button
                    type="button"
                    onClick={handleSaveOrUpdate}
                    disabled={isSubmitting || isSaving || !isDirty || !canEdit}
                    className="btn bg-success text-white px-8 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{hasExistingData ? "Update Menu" : "Save Menu"}</span>
                    )}
                  </button>
                </div>
              </div> */}
            </div>
            <CustomPackageModal
              isOpen={showCustomPackageModal}
              onClose={() => setShowCustomPackageModal(false)}
              userId={userId}
                mode={mode} 
              onSelectPackage={(payload) => {
                if (payload && typeof payload === "object" && payload.packageInfo) {
                  handlePackageSelect(payload.packageInfo.id);
                } else {
                  handlePackageSelect(payload);
                }
              }}
            />
            <SelectMenureport
              isSelectMenureport={isSelectMenuReport}
              setEventFunctionId={ALL_FUNCTIONS}
              setIsSelectMenuReport={setIsSelectMenuReport}
              onConfirm={() => {
                setIsMenuReport(true);
              }}
              disabled={!hasSelectedItems || isDirty}
              mode={mode}
            />
            {mode === "decor" ? (
          <>
          <AddDecorItemModal
            isModalOpen={isItemModalOpen}
            setIsModalOpen={setIsItemModalOpen}
            refreshData={() => setRefreshList((prev) => !prev)}
          />
          <AddDecorCategoryModal
            isModalOpen={isCategoryModalOpen}
            setIsModalOpen={setIsCategoryModalOpen}
            refreshData={() => setRefreshList((prev) => !prev)}
          />
          </>
          ) : (
          <>
          <AddMenuItem
            isModalOpen={isItemModalOpen}
            setIsModalOpen={setIsItemModalOpen}
            refreshData={() => setRefreshList((prev) => !prev)}
          />
          <AddMenuCategory
            isModalOpen={isCategoryModalOpen}
            setIsModalOpen={setIsCategoryModalOpen}
            refreshData={() => setRefreshList((prev) => !prev)}
          />
          </>
          )}
            <MenuIns
              isOpen={showInsModal}
              onClose={() => {
                setShowInsModal(false);
                setCurrentItemForNotes(null);
              }}
              itemId={currentItemForNotes}
              notes={itemNotes}
              onSave={handleInsSave}
              initialTranslating={insTranslating} 
              mode={mode}
            />
            <MenuNotes
              isOpen={showNoteModal}
              onClose={() => {
                setShowNoteModal(false);
                setCurrentItemForNotes(null);
              }}
              itemId={currentItemForNotes}
              notes={itemNotes}
              onSave={handleNoteSave}
            />
            <CategoryNotes
              isOpen={showCategoryNoteModal}
              onClose={() => {
                setShowCategoryNoteModal(false);
                setCurrentCategoryForNotes(null);
              }}
              categoryId={currentCategoryForNotes}
              notes={categoryNotes}
              onSave={handleCategoryNoteSave}
            />
            
            <EditFunctionDetailsModal
          isOpen={editPax}
          onClose={() => setEditPax(false)}
          eventId={eventId}
         onRefreshEvent={() => window.location.reload()}
          />
            <AllCustomerToogle
              isModalOpen={isAllCustomerToogleOpen}
              setIsModalOpen={setIsAllCustomerToogleOpen}
              onEventSelect={handleEventSelect}
            />
            <CopyMenuPlanning
          isOpen={isCopyMenuModalOpen}
          onClose={() => setIsCopyMenuModalOpen(false)}
          onCopyFunction={handleCopyMenuFromFunction}
          currentEventId={eventId}
          currentFunctionId={selectedFunction}
          mode={mode}
          />
            <ExtraCharge
              isOpen={showExtraChargesModal}
              onClose={() => setShowExtraChargesModal(false)}
              eventData={eventData}
              selectedFunction={selectedFunction}
              eventId={eventId}
              extraChargesData={extraChargesData}
              extraChargesLoading={extraChargesLoading}
              onRefresh={fetchExtraCharges}
            />
            <FoodFestivalModal
          isOpen={showFoodFestivalModal}
          onClose={() => setShowFoodFestivalModal(false)}
          eventId={eventId}
          selectedFunction={selectedFunction}
          />

            {/* AI Generating Full Screen Loader */}
            {aiGenerating && (
              <div
                className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
                style={{
                  background: "rgba(15,10,40,0.85)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {/* Animated orb with progress ring */}
                <div className="relative mb-8">
                  {/* SVG progress ring */}
                  <svg
                    className="absolute inset-0 -rotate-90"
                    width="112"
                    height="112"
                    viewBox="0 0 112 112"
                  >
                    <circle
                      cx="56"
                      cy="56"
                      r="50"
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="5"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r="50"
                      fill="none"
                      stroke="white"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - aiProgress / 100)}`}
                      style={{ transition: "stroke-dashoffset 0.4s ease" }}
                    />
                  </svg>

                  {/* Orb */}
                  <div
                    className="w-28 h-28 rounded-full flex flex-col items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7)",
                      boxShadow: "0 0 60px rgba(139,92,246,.6)",
                      animation: "aiPulse 2s ease-in-out infinite",
                    }}
                  >
                    <Sparkles size={28} color="#fff" />
                    <span className="text-white font-bold text-sm mt-1">
                      {aiProgress}%
                    </span>
                  </div>

                  {/* Orbiting dot */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ animation: "aiOrbit 2s linear infinite" }}
                  >
                    <div
                      className="absolute -top-1 left-1/2 w-3 h-3 rounded-full bg-white shadow-lg"
                      style={{
                        transform: "translateX(-50%)",
                        boxShadow: "0 0 10px rgba(255,255,255,.8)",
                      }}
                    />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-white font-bold text-2xl mb-3 tracking-wide">
                  <FormattedMessage id="USER.EVENT_PLANNING.AI_GENERATING_TITLE" defaultMessage="AI Generating Menu" />
                </h2>

                {/* Cycling message */}
                <p
                  className="text-purple-200 text-base font-medium mb-6 text-center px-8"
                  style={{ minHeight: 28, transition: "all .3s ease" }}
                >
                  {aiLoadingMessage}
                </p>

                {/* Progress bar */}
                <div className="w-64 h-1.5 bg-white/20 rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${aiProgress}%`,
                      background: "linear-gradient(90deg,#818cf8,#c084fc)",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>

                {/* Bouncing dots */}
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-purple-400"
                      style={{
                        animation: `aiDot 1.4s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>

                <p className="text-purple-300 text-xs mt-8 opacity-70">
                  <FormattedMessage id="USER.EVENT_PLANNING.AI_WAIT_TEXT" defaultMessage="This may take a few seconds..." />
                </p>

                <style>{`
            @keyframes aiPulse {
              0%,100% { transform: scale(1); box-shadow: 0 0 60px rgba(139,92,246,.6); }
              50%      { transform: scale(1.06); box-shadow: 0 0 90px rgba(139,92,246,.9); }
            }
            @keyframes aiOrbit {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
            @keyframes aiDot {
              0%,80%,100% { transform: scale(0.6); opacity: .4; }
              40%          { transform: scale(1.4); opacity: 1; }
            }
          `}</style>
              </div>
            )}
            {isSaving && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
                onClickCapture={(e) => e.stopPropagation()}
                style={{ cursor: "not-allowed" }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="6"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        fill="none"
                        stroke="white"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 34}`}
                        strokeDashoffset={`${2 * Math.PI * 34 * (1 - saveProgress / 100)}`}
                        style={{ transition: "stroke-dashoffset 0.4s ease" }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                      {saveProgress}%
                    </span>
                  </div>
                  <span className="text-white text-sm font-medium tracking-wide">
                    {saveProgress < 30
                      ? "Preparing..."
                      : saveProgress < 70
                        ? "Saving..."
                        : saveProgress < 100
                          ? "Finishing..."
                          : "Done!"}
                  </span>
                </div>
              </div>
            )}

            {/* AI Generate Menu Modal */}
            {showAiModal && (
              <>
                <div
                  className="fixed inset-0 z-50"
                  style={{
                    background: "rgba(0,0,0,.45)",
                    backdropFilter: "blur(4px)",
                  }}
                  onClick={() => setShowAiModal(false)}
                />
                <div
                  className="fixed top-1/2 left-1/2 z-50 bg-white rounded-2xl"
                  style={{
                    transform: "translate(-50%,-50%)",
                    width: "min(460px,95vw)",
                    boxShadow: "0 32px 64px rgba(0,0,0,.18)",
                    overflow: "visible",
                  }}
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between px-6 py-5 rounded-t-2xl"
                    style={{
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,.2)" }}
                      >
                        <Sparkles size={18} color="#fff" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-base leading-tight">
                          AI Menu Generator
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "rgba(255,255,255,.75)" }}
                        >
                          Let AI craft the perfect menu
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAiModal(false)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ background: "rgba(255,255,255,.15)" }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-5 flex flex-col gap-4">
                    {/* Template Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Template *
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          className="w-full h-10 px-3 rounded-lg border text-sm flex items-center justify-between"
                          style={{
                            borderColor: aiTplOpen ? "#6366f1" : "#e5e7eb",
                            background: "#fafafa",
                          }}
                          onClick={() => {
                            setAiTplOpen((o) => !o);
                            setAiPkgOpen(false);
                          }}
                        >
                          <span
                            style={{ color: aiTemplateId ? "#111827" : "#9ca3af" }}
                          >
                            {aiTplLoading
                              ? "Loading…"
                              : (Array.isArray(aiTemplates)
                                  ? aiTemplates.find((t) => t.id === aiTemplateId)
                                      ?.nameEnglish
                                  : null) || "Select a template…"}
                          </span>
                          <ChevronDown
                            size={14}
                            className="text-gray-400"
                            style={{
                              transform: aiTplOpen ? "rotate(180deg)" : "none",
                              transition: "transform .2s",
                            }}
                          />
                        </button>
                        {aiTplOpen && (
                          <div
                            className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                            style={{ zIndex: 9999 }}
                          >
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                              <Search size={13} className="text-gray-400" />
                              <input
                                autoFocus
                                className="flex-1 text-sm outline-none bg-transparent"
                                placeholder="Search templates…"
                                value={aiTemplateSearch}
                                onChange={(e) => setAiTemplateSearch(e.target.value)}
                              />
                            </div>
                            <div style={{ maxHeight: 180, overflowY: "auto" }}>
                              {aiTemplates.filter((t) =>
                                t.nameEnglish
                                  ?.toLowerCase()
                                  .includes(aiTemplateSearch.toLowerCase()),
                              ).length === 0 ? (
                                <div className="px-3 py-3 text-sm text-gray-400">
                                  No templates found
                                </div>
                              ) : (
                                aiTemplates
                                  .filter((t) =>
                                    t.nameEnglish
                                      ?.toLowerCase()
                                      .includes(aiTemplateSearch.toLowerCase()),
                                  )
                                  .map((t) => (
                                    <div
                                      key={t.id}
                                      className="px-3 py-2.5 text-sm cursor-pointer flex items-center justify-between"
                                      style={{
                                        background:
                                          t.id === aiTemplateId ? "#ede9fe" : "",
                                        color:
                                          t.id === aiTemplateId
                                            ? "#5b21b6"
                                            : "#374151",
                                        fontWeight: t.id === aiTemplateId ? 600 : 400,
                                      }}
                                      onMouseEnter={(e) => {
                                        if (t.id !== aiTemplateId)
                                          e.currentTarget.style.background =
                                            "#f5f3ff";
                                      }}
                                      onMouseLeave={(e) => {
                                        if (t.id !== aiTemplateId)
                                          e.currentTarget.style.background = "";
                                      }}
                                      onClick={() => {
                                        setAiTemplateId(t.id);
                                        setAiTplOpen(false);
                                        setAiTemplateSearch("");
                                      }}
                                    >
                                      {t.nameEnglish}
                                      {t.id === aiTemplateId && (
                                        <CheckCircle2 size={13} color="#7c3aed" />
                                      )}
                                    </div>
                                  ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Function Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Function Name
                      </label>
                      <input
                        className="h-10 px-3 rounded-lg border text-sm outline-none"
                        style={{ borderColor: "#e5e7eb", background: "#fafafa" }}
                        placeholder="e.g. Breakfast, Dinner…"
                        value={aiFunctionName}
                        onChange={(e) => setAiFunctionName(e.target.value)}
                        onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                      />
                    </div>

                    {/* Package Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Package{" "}
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          className="w-full h-10 px-3 rounded-lg border text-sm flex items-center justify-between"
                          style={{
                            borderColor: aiPkgOpen ? "#6366f1" : "#e5e7eb",
                            background: "#fafafa",
                          }}
                          onClick={() => {
                            setAiPkgOpen((o) => !o);
                            setAiTplOpen(false);
                          }}
                        >
                          <span
                            style={{ color: aiPackageId ? "#111827" : "#9ca3af" }}
                          >
                            {aiPkgLoading
                              ? "Loading…"
                              : (Array.isArray(aiPackages)
                                  ? aiPackages.find((p) => p.id === aiPackageId)
                                      ?.nameEnglish
                                  : null) || "No package selected"}{" "}
                          </span>
                          <ChevronDown
                            size={14}
                            className="text-gray-400"
                            style={{
                              transform: aiPkgOpen ? "rotate(180deg)" : "none",
                              transition: "transform .2s",
                            }}
                          />
                        </button>
                        {aiPkgOpen && (
                          <div
                            className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                            style={{ zIndex: 9999 }}
                          >
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                              <Search size={13} className="text-gray-400" />
                              <input
                                autoFocus
                                className="flex-1 text-sm outline-none bg-transparent"
                                placeholder="Search packages…"
                                value={aiPackageSearch}
                                onChange={(e) => setAiPackageSearch(e.target.value)}
                              />
                            </div>
                            <div style={{ maxHeight: 180, overflowY: "auto" }}>
                              <div
                                className="px-3 py-2.5 text-sm cursor-pointer"
                                style={{ color: "#9ca3af" }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background = "#f9fafb")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background = "")
                                }
                                onClick={() => {
                                  setAiPackageId(null);
                                  setAiPkgOpen(false);
                                  setAiPackageSearch("");
                                }}
                              >
                                No package
                              </div>
                              {aiPackages
                                .filter((p) =>
                                  p.nameEnglish
                                    ?.toLowerCase()
                                    .includes(aiPackageSearch.toLowerCase()),
                                )
                                .map((p) => (
                                  <div
                                    key={p.id}
                                    className="px-3 py-2.5 text-sm cursor-pointer flex items-center justify-between"
                                    style={{
                                      background:
                                        p.id === aiPackageId ? "#ede9fe" : "",
                                      color:
                                        p.id === aiPackageId ? "#5b21b6" : "#374151",
                                      fontWeight: p.id === aiPackageId ? 600 : 400,
                                    }}
                                    onMouseEnter={(e) => {
                                      if (p.id !== aiPackageId)
                                        e.currentTarget.style.background = "#f5f3ff";
                                    }}
                                    onMouseLeave={(e) => {
                                      if (p.id !== aiPackageId)
                                        e.currentTarget.style.background = "";
                                    }}
                                    onClick={() => {
                                      setAiPackageId(p.id);
                                      setAiPkgOpen(false);
                                      setAiPackageSearch("");
                                    }}
                                  >
                                    <span>{p.nameEnglish}</span>
                                    <span className="flex items-center gap-2">
                                      {/* {p.price && <span className="text-xs text-gray-400">₹{p.price}</span>} */}
                                      {p.id === aiPackageId && (
                                        <CheckCircle2 size={13} color="#7c3aed" />
                                      )}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                      className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-500 hover:text-gray-700"
                      onClick={() => setShowAiModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!aiTemplateId || aiGenerating}
                      onClick={handleAiGenerate}
                      className="h-9 px-5 rounded-lg text-white text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: aiDone
                          ? "linear-gradient(135deg,#10b981,#059669)"
                          : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        boxShadow: "0 4px 14px rgba(99,102,241,.35)",
                      }}
                    >
                      {aiDone ? (
                        <>
                          <CheckCircle2 size={15} /> Generated!
                        </>
                      ) : aiGenerating ? (
                        <>
                          <Loader2 size={15} className="animate-spin" /> Generating…
                        </>
                      ) : (
                        <>
                          <Sparkles size={15} /> Generate Menu
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          {/* Share Menu Modal */}
          {showShareModal && (
          <>
          <div
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)" }}
            onClick={() => { setShowShareModal(false); setShareLink(""); setShareAccessCode(""); }}
          />
          <div
            className="fixed top-1/2 left-1/2 z-50 bg-white rounded-2xl"
            style={{
              transform: "translate(-50%,-50%)",
              width: "min(480px,95vw)",
              boxShadow: "0 32px 64px rgba(0,0,0,.18)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between bg-primary px-6 py-5 rounded-t-2xl"
              
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.2)" }}>
                  <i className="ki-filled ki-share text-white text-lg" />
                </div>
                <div>
                  <p className="text-white font-bold text-base leading-tight">Share Menu</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,.75)" }}>
                    Share this menu with your client
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowShareModal(false); setShareLink(""); setShareAccessCode(""); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ background: "rgba(255,255,255,.15)" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-4">
              {shareLoading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                  <p className="text-sm text-gray-500">Generating link...</p>
                </div>
              ) : shareLink ? (
                <>
                  {/* Share Link */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Share Link
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        className="h-10 px-3 rounded-lg border border-gray-200 text-sm bg-gray-50 flex-1 outline-none truncate"
                        value={shareLink}
                      />
                      <button
                        className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold whitespace-nowrap"
                        onClick={() => copyToClipboard(shareLink, "Link copied!")}
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Access Code */}
                  {shareAccessCode && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Access Code
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          readOnly
                          className="h-10 px-3 rounded-lg border border-gray-200 text-sm bg-gray-50 flex-1 outline-none font-mono font-bold text-primary tracking-widest"
                          value={shareAccessCode}
                        />
                        <button
                          className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold whitespace-nowrap"
                          onClick={() => copyToClipboard(shareAccessCode, "Code copied!")}
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">
                        Share this code with your client to access the menu.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-2 pt-2">
  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide self-start">
    QR Code
  </label>
  <div className="p-3 bg-white border border-gray-200 rounded-lg">
    <QRCodeCanvas
      id="share-menu-qr-canvas"
      value={shareLink}
      size={160}
      level="M"
      includeMargin
    />
  </div>
  <button
    type="button"
    className="text-xs font-semibold text-primary hover:underline"
    onClick={() => {
      const canvas = document.getElementById("share-menu-qr-canvas");
      if (!canvas) return;
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `menu-qr-${eventId}.png`;
      a.click();
    }}
  >
    Download QR Code
  </button>
</div>

                  {/* Expiry info if needed */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700 font-medium">
                      <i className="ki-filled ki-information-2 mr-1" />
                      This link is active and ready to share with your client.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <p className="text-sm text-red-500">Failed to generate link. Please try again.</p>
                  <button
                    className="btn btn-primary text-sm"
                    onClick={handleGenerateShareLink}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-500 hover:text-gray-700"
                onClick={() => { setShowShareModal(false); setShareLink(""); setShareAccessCode(""); }}
              >
                Close
              </button>
            </div>
          </div>


          </>
          )}
          <RevisionHistoryModal
          isOpen={showRevisionHistory}
          onClose={() => setShowRevisionHistory(false)}
          eventId={eventId}
          userId={userId}
          canEdit={canEdit}
          />

          <AdvancePaymentModal
          isOpen={showAdvancePayment}
          onClose={() => setShowAdvancePayment(false)}
          eventId={eventId}
          userId={userId}
          canEdit={canEdit}
          />

          <EventWiseTermsCondition
          isModalOpen={showTermsModal}
          setIsModalOpen={setShowTermsModal}
          refreshData={() => {}}
          selectedEvent={null}
          eventId={eventId}
          />
          <PermissableNonPermissableModal
          isOpen={showPermissableModal}
          onClose={() => setShowPermissableModal(false)}
          rawMaterials={rawMaterials}
          categories={rawMaterialCategories}
          onSave={handlePermissableSave}
          onLoadMore={handleRawMaterialLoadMore}
          hasMore={rawMaterialHasMore}
          loading={rawMaterialLoading}
          onCategoryChange={handleRawMaterialCategoryChange}
          selectedCategoryId={rawMaterialCategoryFilter}
          userId={userId}
          eventFunctionId={selectedFunction}
          eventId={eventId}
          initialData={permissionRawMaterials}
          />


          </Fragment>
          );
          };

          export default EventPlanningPage;
