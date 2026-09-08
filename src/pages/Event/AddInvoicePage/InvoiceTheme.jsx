import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Modal, Spin, Select } from "antd";
import { FormattedMessage } from "react-intl";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { PDFDocument } from "pdf-lib";
import {
  GettemplatebyuserId,
  GetAllCustomThemeByUserIdAndModuleId,
  GetQuotationReport,
  AddExclusiveReport,
  GetReportConfiguration,
  GetActiveFonts,
  GetUtility,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { useReportPermission } from "@/hooks/useReportPermission";

const EXCLUSIVE_MODULE_NAMES = ["Exclusive Theme", "Back Office Theme"];


const WhatsAppModal = ({ isOpen, onClose, onSend }) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  const handleSend = () => {
    const cleaned = mobile.replace(/\D/g, "");
    if (!cleaned || cleaned.length < 10) {
      setError("Please enter a valid mobile number (min 10 digits).");
      return;
    }
    const fullNumber = `+91${cleaned}`;
    setError("");
    onSend(fullNumber, name.trim());
    setName("");
    setMobile("");
  };

  const handleClose = () => {
    setName("");
    setMobile("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="bg-green-600 px-6 py-4 flex items-center gap-3">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <h2 className="text-white font-semibold text-lg">Share via WhatsApp</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-gray-600 text-sm">
            Enter the recipient's WhatsApp number to share the report PDF.
          </p>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="e.g. Rahul"
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Mobile Number</label>
            <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-green-500 transition">
              <span className="px-3 py-2.5 bg-gray-50 text-gray-500 text-sm border-r border-gray-200">+91</span>
              <input
                type="tel"
                value={mobile}
                maxLength={10}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setMobile(value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="9876543210"
                className="flex-1 px-3 py-2.5 text-sm outline-none bg-white"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            <p className="text-gray-400 text-xs mt-1">Enter 10 digit mobile number</p>
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="px-5 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c..." />
            </svg>
            Send
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const ConfigModal = ({
  open,
  onClose,
  onGenerate,
  selectedModules,
  loading,
  isExclusiveFlow,
  isQuotationFlow,
}) => {
    const userId = localStorage.getItem("userId");

  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [isQrcode, setIsQrcode] = useState(false);
  const [isTermsCond, setIsTermsCond] = useState(false);
  const [fonts, setFonts] = useState([]);
  const [catFontId, setCatFontId] = useState(null);
  const [itemFontId, setItemFontId] = useState(null);
  const [sloganFontId, setSloganFontId] = useState(null);
  const [catFontSize, setCatFontSize] = useState(null);
  const [itemFontSize, setItemFontSize] = useState(null);
  const [sloganFontSize, setSloganFontSize] = useState(null);
  const [isAdvance, setIsAdvance] = useState(false);
const [isShowLastPage, setIsShowLastPage] = useState(
  () => String(userId) === "376" && isQuotationFlow,
);
  // Per-module config: { [moduleId]: { visibleOptions, options, reportType, mappingId } }
  const [moduleConfigs, setModuleConfigs] = useState({});
  const [configLoading, setConfigLoading] = useState(false);
  const [isDecor, setIsDecor] = useState(false);
  const FONT_SIZES = [
    "9",
    "10",
    "11",
    "12",
    "14",
    "16",
    "18",
    "20",
    "22",
    "23",
    "24",
    "26",
  ];
  const showAdvancePay = React.useMemo(
    () =>
      selectedModules.some(
        (mod) => moduleConfigs[mod.moduleId]?.isAdvancedPay === true,
      ),
    [selectedModules, moduleConfigs],
  );
  useEffect(() => {
    if (!open) return;
    fetchFontsAndDefaults();
    fetchAllModuleConfigs();
  }, [open]);

  const fetchFontsAndDefaults = async () => {
    try {
      const [fontRes, utilityRes] = await Promise.all([
        GetActiveFonts(),
        GetUtility(userId),
      ]);
      setFonts(fontRes?.data?.data || []);
      const d = utilityRes?.data?.data;
      if (d) {
        setCatFontId((p) => p ?? d.catFontId ?? null);
        setItemFontId((p) => p ?? d.itemFontId ?? null);
        setSloganFontId((p) => p ?? d.sloganFontId ?? null);
        setCatFontSize((p) => p ?? d.catFontSize ?? null);
        setItemFontSize((p) => p ?? d.itemFontSize ?? null);
        setSloganFontSize((p) => p ?? d.sloganFontSize ?? null);
      }
    } catch (e) {
      console.error("Error fetching fonts/utility:", e);
    }
  };

  const fetchAllModuleConfigs = async () => {
    setConfigLoading(true);
    const configs = {};
    await Promise.all(
      selectedModules.map(async (mod) => {
        try {
          const res = await GetReportConfiguration(mod.mappingId, mod.moduleId);
          const config = res?.data?.data?.[0];
          if (!config) return;

          const visibleOptions = Object.entries({
            CompanyInfo: config.isCompanyDetails,
            categorySlogan: config.isCategorySlogan,
            categoryInstruction: config.isCategoryInstruction,
            categoryImage: config.isCategoryImage,
            isAddDecoration:config.isAddDecoration,
            itemSlogan: config.isItemSlogan,
            itemInstruction: config.isItemInstruction,
            companyLogo: config.isCompanyLogo,
            itemImage: config.isItemImage,
            isCombo: config.isCombo,
            partyDetails: config.isPartyDetails,
            isWithQty: config.isWithQty,
            size1: !!config.size1,
            size2: !!config.size2,
            size3: !!config.size3,
            isWithPrice: config.isWithPrice,
            isTermsCond: config.isTermsCond,
            isExtraCharges: config.isExtraCharges,
            isDoc: !!config.isDoc,
            isExcel: !!config.isExcel, 
            isHalfPax: config.isHalfPax,
            isOnePage:config.isOnePage,
            isShowEventRemarks: config.isShowEventRemarks,
            showAdditional:config.showAdditional,
            isAgencyNextPage:config.isAgencyNextPage,
            storeIssueWise:config.storeIssueWise, 
            isAddStoreIssue:config.isAddStoreIssue,
            is5Column:config.is5Column,
            isContactNoVisible: config.isContactNoVisible,
            isSignatureVisible:config.isSignatureVisible,
            isAddMenu : config.isAddMenu,
            isAdvancePayment: config.isAdvancePayment,
            isNotes : config.isNotes,
            showAddOnLabel: config.showAddOnLabel,
          })
            .filter(([, v]) => v)
            .map(([k]) => k);

          configs[mod.moduleId] = {
            reportType: config.type,
            mappingId: mod.mappingId,
            isAdvancedPay: config.isAdvancedPay === 1,
            visibleOptions,
            options: {
              categorySlogan: config.isCategorySlogan === 0,
              categoryInstruction: config.isCategoryInstruction === 1,
              categoryImage: config.isCategoryImage === 0,
              itemSlogan: config.isItemSlogan === 0,
              itemInstruction: config.isItemInstruction === 1,
              CompanyInfo: config.isCompanyDetails === 1,
              companyLogo: config.isCompanyLogo === 1,
              itemImage: config.isItemImage === 0,
              isCombo: config.isCombo === 0,
              partyDetails: config.isPartyDetails === 1,
              isWithQty: config.isWithQty === 1,
              size1: { label: config.size1, enabled: config.size1 === 1 },
              size2: { label: config.size2, enabled: config.size2 === 0 },
              size3: { label: config.size3, enabled: config.size3 === 0 },
              isWithPrice: config.isWithPrice === 1,
              isExtraCharges: config.isExtraCharges === 0,
              isTermsCond: config.isTermsCond === 0,
              isDoc: config.isDoc === 1,
              isExcel: config.isExcel === 1,
              isHalfPax: config.isHalfPax === 0,
              isOnePage:config.isOnePage === 0,
                          isAdvancedPay: config.isAdvancedPay === 1,
              isAddDecoration:config.isAddDecoration === 0,
              isShowEventRemarks: config.isShowEventRemarks === 1,
              showAdditional:config.showAdditional === 0 ,
              isAgencyNextPage:config.isAgencyNextPage === 0 ,
              storeIssueWise:config.storeIssueWise === 0, 
              isAddStoreIssue:config.isAddStoreIssue === 0,
              is5Column:config.is5Column === 0 ,
              isContactNoVisible: config.isContactNoVisible === 0,
              isSignatureVisible:config.isSignatureVisible === 0,
              isAddMenu:config.isAddMenu === 0,
              isAdvancePayment:config.isAdvancePayment === 0,
              isNotes: config.isNotes === 0,
              showAddOnLabel: config.showAddOnLabel === 0
            },
          };
        } catch (e) {
          console.error(`Config fetch error for module ${mod.moduleId}:`, e);
        }
      }),
    );
    setModuleConfigs(configs);
    setConfigLoading(false);
  };

  const toggleOption = (moduleId, key) => {
    setModuleConfigs((prev) => {
      const mod = prev[moduleId];
      if (!mod) return prev;
      const opts = { ...mod.options };

      if (key === "size1")
        Object.assign(opts, {
          size1: { ...opts.size1, enabled: true },
          size2: { ...opts.size2, enabled: false },
          size3: opts.size3 ? { ...opts.size3, enabled: false } : opts.size3,
        });
      else if (key === "size2")
        Object.assign(opts, {
          size1: { ...opts.size1, enabled: false },
          size2: { ...opts.size2, enabled: true },
          size3: opts.size3 ? { ...opts.size3, enabled: false } : opts.size3,
        });
      else if (key === "size3")
        Object.assign(opts, {
          size1: { ...opts.size1, enabled: false },
          size2: { ...opts.size2, enabled: false },
          size3: { ...opts.size3, enabled: true },
        });
      else opts[key] = !opts[key];

      return { ...prev, [moduleId]: { ...mod, options: opts } };
    });
  };

  const toggleAll = (moduleId, checked) => {
    setModuleConfigs((prev) => {
      const mod = prev[moduleId];
      if (!mod) return prev;
      const opts = { ...mod.options };
      mod.visibleOptions.forEach((key) => {
        if (!["size1", "size2", "size3"].includes(key)) opts[key] = checked;
      });
      return { ...prev, [moduleId]: { ...mod, options: opts } };
    });
  };

  const Toggle = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );

  const handleGenerate = () => {
    const lang =
      selectedLanguage === "english" ? 0 : selectedLanguage === "hindi" ? 1 : 2;
    onGenerate({
      lang,
      catFontId: catFontId || -1,
      itemFontId: itemFontId || -1,
      sloganFontId: sloganFontId || -1,
      catFontSize: catFontSize || -1,
      itemFontSize: itemFontSize || -1,
      sloganFontSize: sloganFontSize || -1,
      moduleConfigs,
      isQrcode: isQrcode ? 1 : 0,
      isTermsCond: isTermsCond ? 1 : 0,
      isAdvance: isAdvance ? 1 : 0,
       isShowLastPage: String(userId) === "376" ? (isShowLastPage ? 1 : 0) : 0,
    });
  };

  const fontOptions = fonts.map((f) => ({
    value: f.fontId,
    label: f.fontName,
  }));
  const sizeOptions = FONT_SIZES.map((s) => ({ value: s, label: s }));

  const SectionLabel = ({ children }) => (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
      {children}
    </p>
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span className="text-base font-semibold text-gray-800">
          Report Configuration
        </span>
      }
      width={800}
      style={{ top: 20 }}
      footer={
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
            style={{ backgroundColor: loading ? "#93c5fd" : "#005BA8" }}
            onClick={handleGenerate}
            disabled={loading || configLoading}
          >
            {loading && <Spin size="small" />}
            Generate Preview
          </button>
        </div>
      }
    >
      {configLoading ? (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Language */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{ backgroundColor: "#F8FAFC", border: "1px solid #E8ECF0" }}
          >
            <SectionLabel>Report Settings</SectionLabel>

            {/* Language */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Language
              </label>
              <div className="flex border rounded-lg overflow-hidden shadow-sm">
                {["english", "hindi", "gujarati"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`flex-1 py-2 font-medium text-sm transition ${
                      selectedLanguage === lang
                        ? "bg-[#005BA8] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop: "1px dashed #E2E8F0" }} />

            {/* QR Code + Terms & Conditions toggles */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">
                  Include QR Code
                </span>
                <button
                  type="button"
                  onClick={() => setIsQrcode((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    isQrcode ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      isQrcode ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">
                  Include Terms &amp; Conditions
                </span>
                <button
                  type="button"
                  onClick={() => setIsTermsCond((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    isTermsCond ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      isTermsCond ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
          {String(userId) === "376" && (
  <div className="flex items-center justify-between">
    <span className="text-xs font-semibold text-gray-500">
      Show Last Page
    </span>
    <button
      type="button"
      onClick={() => setIsShowLastPage((prev) => !prev)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        isShowLastPage ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
          isShowLastPage ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  </div>
)}
              {showAdvancePay && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    Include Advance Pay
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAdvance((prev) => !prev)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      isAdvance ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                        isAdvance ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Font Settings ─────────────────────────────────────────────── */}
          {isExclusiveFlow && (
            <div>
              <SectionLabel>Font Settings</SectionLabel>

              <div
                className="rounded-xl p-5 space-y-4"
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E8ECF0",
                }}
              >
                {/* Font Family Row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    ["Category Font", catFontId, setCatFontId],
                    ["Item Font", itemFontId, setItemFontId],
                    ["Slogan Font", sloganFontId, setSloganFontId],
                  ].map(([label, val, setter]) => (
                    <div key={label}>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                        {label}
                      </label>
                      <Select
                        className="w-full"
                        value={val}
                        onChange={setter}
                        options={fontOptions}
                        placeholder="Select font"
                        size="middle"
                        style={{ height: 38 }}
                        showSearch
                        optionFilterProp="label"
                      />
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px dashed #E2E8F0" }} />

                {/* Font Size Row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    ["Category Size", catFontSize, setCatFontSize],
                    ["Item Size", itemFontSize, setItemFontSize],
                    ["Slogan Size", sloganFontSize, setSloganFontSize],
                  ].map(([label, val, setter]) => (
                    <div key={label}>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                        {label}
                      </label>
                      <Select
                        className="w-full"
                        value={val}
                        onChange={setter}
                        options={sizeOptions}
                        placeholder="Select size"
                        size="middle"
                        style={{ height: 38 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Per-module toggle options */}
          {selectedModules.map((mod) => {
            const cfg = moduleConfigs[mod.moduleId];
            if (!cfg || cfg.visibleOptions.length === 0) return null;

            const allChecked = cfg.visibleOptions.every((k) =>
              k === "size1" || k === "size2" || k === "size3"
                ? cfg.options[k]?.enabled
                : cfg.options[k],
            );

            return (
              <div key={mod.moduleId} className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-700 text-sm">
                    {mod.moduleName} — Options
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Check All</span>
                    <Toggle
                      checked={allChecked}
                      size="medium"
                      onChange={() => toggleAll(mod.moduleId, !allChecked)}
                    />
                  </div>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {cfg.visibleOptions.map((key) => (
                    <div
                      key={key}
                      className="flex justify-between items-center py-1.5 px-2 rounded-lg hover:bg-gray-50"
                    >
                      <span className="capitalize text-gray-700 text-sm">
                        {["size1", "size2", "size3"].includes(key)
                          ? `Size ${cfg.options[key]?.label}`
                          : key.replace(/([A-Z])/g, " $1")}
                      </span>
                      <Toggle
                        checked={
                          ["size1", "size2", "size3"].includes(key)
                            ? cfg.options[key]?.enabled
                            : cfg.options[key]
                        }
                        onChange={() => toggleOption(mod.moduleId, key)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const InvoiceTheme = ({ open, onClose, eventId, isinvoice, isDecor = false }) => {
  const [selectedThemes, setSelectedThemes] = useState({}); // { [moduleId]: themeId }
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Config modal (for exclusive/back-office modules)
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);  // ✅ added
  const pdfPlugin = defaultLayoutPlugin();
  const userId = localStorage.getItem("userId");
  const lang = localStorage.getItem("lang");
  const language =
    lang === "en" ? 0 : lang === "hi" ? 1 : lang === "gu" ? 2 : 0;
  const { allowedTemplateIds } = useReportPermission();











  useEffect(() => {
    if (open) fetchAllModulesWithThemes();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSelectedThemes({});
      setModules([]);
      setError(null);
    }
  }, [open]);

  

  const fetchAllModulesWithThemes = async () => {
    setLoading(true);
    setError(null);
    setModules([]);
    setSelectedThemes({});

    try {
      const templateRes = await GettemplatebyuserId();
      const templates = Array.isArray(templateRes)
        ? templateRes
        : Array.isArray(templateRes?.data?.data)
          ? templateRes.data.data
          : [];

      if (!templates.length) {
        setError("No modules found.");
        setLoading(false);
        return;
      }

      // ── FILTER: only these 3-4 modules, in this exact display order ──────
      const ALLOWED_MODULES_ORDERED =
        isinvoice === 0
          ? [
              "INVOICE REPORTS", // 3rd
              "Exclusive Theme", // 1st
              "Back Office Theme", // 2nd
            ]
          : [
              "QUOTATION REPORTS", // 3rd
              "Exclusive Theme", // 1st
              "Back Office Theme", // 2nd
            ];

      // Filter + sort in the defined order above
      const filteredTemplates = ALLOWED_MODULES_ORDERED.map((name) =>
        templates.find(
          (t) =>
            t.nameEnglish?.trim().toUpperCase() === name.trim().toUpperCase() &&
            t.isActive &&
            !t.isDelete,
        ),
      ).filter(Boolean); // remove any not found

      if (!filteredTemplates.length) {
        setError("No relevant modules found.");
        setLoading(false);
        return;
      }

      // ── Fetch themes only for these filtered modules (3 API calls max) ───
      const modulesWithThemes = await Promise.all(
        filteredTemplates.map(async (template) => {
          const moduleId = template.id;
          const nameEnglish = template.nameEnglish || "";
          try {
            const themeRes = await GetAllCustomThemeByUserIdAndModuleId(
              userId,
              moduleId,
            );
            const themes = themeRes?.data?.data || [];
            return {
              id: moduleId,
              name: nameEnglish,
              nameEnglish,
              isExclusive: EXCLUSIVE_MODULE_NAMES.includes(nameEnglish),
              themes: Array.isArray(themes) ? themes : [],
            };
          } catch {
            return {
              id: moduleId,
              name: nameEnglish,
              nameEnglish,
              isExclusive: EXCLUSIVE_MODULE_NAMES.includes(nameEnglish),
              themes: [],
            };
          }
        }),
      );

      // Only show modules that actually have themes
      const validModules = modulesWithThemes.filter((m) => m.themes.length > 0);
      if (!validModules.length) setError("No themes available.");
      setModules(validModules);
    } catch (err) {
      console.error("Error fetching modules/themes:", err);
      setError("Failed to load themes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTheme = (moduleId, themeId) => {
    setSelectedThemes((prev) => {
      if (prev[moduleId] === themeId) {
        const updated = { ...prev };
        delete updated[moduleId];
        return updated;
      }
      return { ...prev, [moduleId]: themeId };
    });
  };

  const hasAnySelection = Object.keys(selectedThemes).length > 0;

  // Check if any selected module is Exclusive/BackOffice type
  const hasExclusiveSelected = Object.keys(selectedThemes).some((moduleId) => {
    const mod = modules.find((m) => String(m.id) === String(moduleId));
    return mod?.isExclusive;
  });

  const handleGenerateClick = () => {
    if (!hasAnySelection) return;
    setIsConfigOpen(true);
  };

 const generateQuotationPdfs = async ({
  isQrcode = 0,
  isTermsCond = 0,
  lang = language,
  isAdvance = 0,
    showLastPage = 0,  
  isWithPrice = 0,
  isCompanyDetails = 0,
  isDecor = false,
  isOnePage = 0,
  isCombo = 0,
  isNotes = 0,
  exclusiveThemeId = -1, 
  backOfficeId = -1,  
} = {}) => {
  setLoadingPdf(true);
  try {
    const nonExclusiveEntries = Object.entries(selectedThemes).filter(
      ([moduleId]) => {
        const mod = modules.find((m) => String(m.id) === String(moduleId));
        return !mod?.isExclusive;
      },
    );

    if (!nonExclusiveEntries.length) return [];

    const results = await Promise.allSettled(
      nonExclusiveEntries.map(([, themeId]) =>
        GetQuotationReport(
          themeId,
          eventId,
          lang,
          userId,
          isinvoice === 0 ? 1 : 0,
          isQrcode,
          isTermsCond,
          isAdvance,
                
          isWithPrice,
          isCompanyDetails,
          isDecor,
          isOnePage,
          isCombo,
          isNotes,          
          exclusiveThemeId,
          backOfficeId, 
            showLastPage,
        ),
      ),
    );
    return results
      .filter((r) => r.status === "fulfilled" && r.value?.data?.report_path)
      .map((r) => r.value.data.report_path);
  } catch (e) {
    console.error("Quotation PDF error:", e);
    return [];
  } finally {
    setLoadingPdf(false);
  }
};

  // Generate PDFs for exclusive modules (AddExclusiveReport)
  const generateExclusivePdfs = async (configData) => {
    const {
      lang,
      catFontId,
      itemFontId,
      sloganFontId,
      catFontSize,
      itemFontSize,
      sloganFontSize,
      moduleConfigs,
      isAdvance,
    } = configData;

    const exclusiveEntries = Object.entries(selectedThemes).filter(
      ([moduleId]) => {
        const mod = modules.find((m) => String(m.id) === String(moduleId));
        return mod?.isExclusive;
      },
    );

    const results = await Promise.allSettled(
      exclusiveEntries.map(async ([moduleId, themeId]) => {
        const cfg = moduleConfigs[moduleId];
        const opts = cfg?.options || {};
        const reportType = cfg?.reportType || null;

        const pageSize = opts.size1?.enabled
          ? opts.size1.label
          : opts.size2?.enabled
            ? opts.size2.label
            : opts.size3?.enabled
              ? opts.size3.label
              : "";

        const payload = {
  eventId,
  partyId: -1,
  eventFunctionId: -1,
  eventFunctionIds: [],
  adminTemplateModuleId: themeId,
  type: reportType || null,
  userId,
  lang,
  
  isCategoryImage: opts.categoryImage,
  isCategoryInstruction: opts.categoryInstruction,
  isCategorySlogan: opts.categorySlogan,
  isItemImage: opts.itemImage,
  isCombo: opts.isCombo,
  isOnePage: opts.isOnePage ?? false,
  isItemInstruction: opts.itemInstruction,
  isItemSlogan: opts.itemSlogan,
  isCompanyDetails: opts.CompanyInfo,
  isCompanyLogo: opts.companyLogo,
  isPartyDetails: opts.partyDetails,
  isWithQty: opts.isWithQty,
  pageSize,
  isWithPrice: opts.isWithPrice,
  agencyId: [],
  managerIds: [],
  itemId: [],
  rawMaterialCatIds: [],
  catFontId: catFontId || -1,
  itemFontId: itemFontId || -1,
  sloganFontId: sloganFontId || -1,
  catFontSize: catFontSize || -1,
  itemFontSize: itemFontSize || -1,
  sloganFontSize: sloganFontSize || -1,
  isTermsCond: opts.isTermsCond ?? false,
  isExtraCharges: opts.isExtraCharges ?? false,
  isAdvance: configData.isAdvance ?? 0,
  isHalfPax: opts.isHalfPax ?? false,
  isDoc: opts.isDoc ?? false,
  isExcel: opts.isExcel ?? false, 
isAdvancedPay:opts.isAdvancedPay ?? false,
          isContactNoVisible: opts.isContactNoVisible ?? false,
          isSignatureVisible:opts.isSignatureVisible ?? false,
          isAddMenu:opts.isAddMenu ?? false,
          isAdvancePayment:opts.isAdvancePayment ?? false,
          showAddOnLabel:opts.showAddOnLabel ?? false,
          isNotes:opts.isNotes ?? false,
  is3Column: opts.is3Column ?? false,
  isFunctionNextPage: opts.isFunctionNextPage ?? false,
  isAddDecoration: opts.isAddDecoration ?? false,
  isShowEventRemarks: opts.isShowEventRemarks ?? false,
 showLastPage: String(userId) === "376" ? 0 : 1, 
  showAdditional:opts.showAdditional ?? false,
  isAgencyNextPage:opts.isAgencyNextPage ?? false,
  storeIssueWise:opts.storeIssueWise ?? false, 
  isAddStoreIssue:opts.isAddStoreIssue ?? false,
  is5Column:opts.is5Column ?? false,
  startDate: "",
  endDate: "",
  eventStatus: [],
    leadAssignId: 0,
  priority: "",
  sourceId: 0,
  statusId: 0,
};



        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => formData.append(`${key}[]`, v));
          } else {
            formData.append(
              key,
              value === true ? "1" : value === false ? "0" : (value ?? ""),
            );
          }
        });

        const { data } = await AddExclusiveReport(formData);
        if (data?.success && data?.report_path) return data.report_path;
        throw new Error(data?.msg || "Failed");
      }),
    );

    return results.filter((r) => r.status === "fulfilled").map((r) => r.value);
  };

  // Merge multiple PDF URLs into one blob URL using pdf-lib
  const mergePdfUrls = async (urls) => {
    if (urls.length === 1) return urls[0];

    const merged = await PDFDocument.create();
    for (const url of urls) {
      try {
        const res = await fetch(url);
        const bytes = await res.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      } catch (e) {
        console.warn("Failed to merge PDF:", url, e);
      }
    }
    const mergedBytes = await merged.save();
    const blob = new Blob([mergedBytes], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  };

const handleConfigGenerate = async (configData) => {
  setGeneratingPdf(true);
  try {
    const nonExclusiveModuleId = Object.keys(selectedThemes).find((moduleId) => {
      const mod = modules.find((m) => String(m.id) === String(moduleId));
      return !mod?.isExclusive;
    });

    const nonExclusiveConfig = nonExclusiveModuleId
      ? configData.moduleConfigs[nonExclusiveModuleId]?.options
      : null;

    const isWithPrice = nonExclusiveConfig?.isWithPrice ? 1 : 0;
    const isCompanyDetails = nonExclusiveConfig?.CompanyInfo ? 1 : 0;
    const isOnePage = nonExclusiveConfig?.isOnePage ? 1 : 0;
    const isCombo = nonExclusiveConfig?.isCombo ? 1 : 0;
    const isContactNoVisible = nonExclusiveConfig?.isContactNoVisible ? 1 : 0;
    const isAddMenu = nonExclusiveConfig?.isAddMenu ? 1 : 0;
    const isAdvancePayment = nonExclusiveConfig?.isAdvancePayment ? 1 : 0;
    const isNotes = nonExclusiveConfig?.isNotes ? 1 : 0;
    const showAddOnLabel = nonExclusiveConfig?.showAddOnLabel ? 1 : 0;

    // ⬅ Exclusive Theme module — pass the theme record's OWN id (e.g. 18402),
    // not templateMaster.id (e.g. 183). Matched by nameEnglish so it can't be
    // confused with the Back Office module below.
    const exclusiveModuleId = Object.keys(selectedThemes).find((moduleId) => {
      const mod = modules.find((m) => String(m.id) === String(moduleId));
      return mod?.nameEnglish === "Exclusive Theme";
    });

    const exclusiveThemeId = exclusiveModuleId
      ? (modules
          .find((m) => String(m.id) === String(exclusiveModuleId))
          ?.themes.find((t) => t.id === selectedThemes[exclusiveModuleId])
          ?.id ?? -1)
      : -1;

    // ⬅ Back Office Theme module — same idea, separately resolved.
    // This was previously undefined and would have thrown at call time.
    const backOfficeModuleId = Object.keys(selectedThemes).find((moduleId) => {
      const mod = modules.find((m) => String(m.id) === String(moduleId));
      return mod?.nameEnglish === "Back Office Theme";
    });

    const backOfficeId = backOfficeModuleId
      ? (modules
          .find((m) => String(m.id) === String(backOfficeModuleId))
          ?.themes.find((t) => t.id === selectedThemes[backOfficeModuleId])
          ?.id ?? -1)
      : -1;
      const generateQuotationPdfs_showLastPage = configData.isShowLastPage ?? 0;

    const urlResults = await Promise.all([
      hasExclusiveSelected
        ? generateExclusivePdfs(configData)
        : Promise.resolve([]),
      generateQuotationPdfs({
        isQrcode: configData.isQrcode,
        isTermsCond: configData.isTermsCond,
        lang: configData.lang,
        isAdvance: configData.isAdvance ?? 0,
        showLastPage: generateQuotationPdfs_showLastPage,   
        isWithPrice,
        isCompanyDetails,
        isDecor,
        isOnePage,
        isCombo,
        isNotes,
        exclusiveThemeId,
        backOfficeId,
      }),
    ]);

    const allUrls = urlResults.flat();
    if (!allUrls.length)
      throw new Error("No reports generated successfully.");

    const finalUrl = await mergePdfUrls(allUrls);
    setPdfUrl(finalUrl);
    setIsConfigOpen(false);
    onClose();
    setIsPdfModalVisible(true);
  } catch (err) {
    Swal.fire({
      title: "Error",
      text: "Failed to generate preview. Please try again.",
      icon: "error",
      confirmButtonColor: "#005BA8",
    });
  } finally {
    setGeneratingPdf(false);
  }
};

 const handleWhatsAppClick = () => {
    setShowWhatsAppModal(true);
  };

  const handleWhatsAppSend = (mobile, recipientName) => {
    const greeting = recipientName || "there";
    const message = `Hi ${greeting},\nPlease find the attached PDF.\n\n${pdfUrl}`;
    window.open(
      `https://web.whatsapp.com/send?phone=${mobile}&text=${encodeURIComponent(message)}`,
      "_blank",
    );
    setShowWhatsAppModal(false);
  };

  const exclusiveModulesSelected = modules
    .filter((m) => selectedThemes[m.id] !== undefined)
    .map((m) => ({
      moduleId: m.id,
      moduleName: m.name,
      themeId: selectedThemes[m.id],
      isExclusive: m.isExclusive,
      mappingId:
        m.themes.find((t) => t.id === selectedThemes[m.id])
          ?.templateMappingResponseDto?.id || selectedThemes[m.id],
    }));

  return (
    <>
      <WhatsAppModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        onSend={handleWhatsAppSend}
      />

      <Modal
        title={
          <span className="text-lg font-semibold text-gray-900">
            <FormattedMessage
              id={
                isinvoice === 0
                  ? "INVOICE.SELECT_THEME"
                  : "QUOTATION.SELECT_THEME"
              }
              defaultMessage={
                isinvoice === 0
                  ? "Select Invoice Theme"
                  : "Select Quotation Theme"
              }
            />
          </span>
        }
        open={open}
        onCancel={onClose}
        width={900}
        style={{ top: 20 }}
        footer={
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-400">
              {hasAnySelection
                ? `${Object.keys(selectedThemes).length} module(s) selected${
                    hasExclusiveSelected
                      ? " — configuration required before preview"
                      : ""
                  }`
                : "Select at least one theme to generate preview"}
            </span>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
                style={{
                  backgroundColor:
                    hasAnySelection && !loadingPdf ? "#005BA8" : "#93c5fd",
                  cursor:
                    hasAnySelection && !loadingPdf ? "pointer" : "not-allowed",
                }}
                onClick={handleGenerateClick}
                disabled={!hasAnySelection || loadingPdf}
              >
                {loadingPdf && <Spin size="small" />}
                Configure & Preview
              </button>
            </div>
          </div>
        }
      >
        <p className="text-sm text-gray-500 mb-5">
          Select one theme per module. All selected themes will be merged into a
          single preview PDF.
        </p>

        {loading && (
          <div className="flex justify-center items-center py-16">
            <Spin size="large" />
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button
              onClick={fetchAllModulesWithThemes}
              className="px-4 py-2 text-sm rounded-lg text-white"
              style={{ backgroundColor: "#005BA8" }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && modules.length === 0 && (
          <div className="flex justify-center items-center py-12 text-gray-400 text-sm">
            No themes available.
          </div>
        )}

        {!loading && !error && modules.length > 0 && (
          <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1">
            {modules.map((module) => {
              const selectedThemeId = selectedThemes[module.id];

      const visibleThemes = module.themes.filter((theme) => {
  if (allowedTemplateIds === null) {
    // superuser path — still apply the Aroma (userId 359) exclusion below
  } else if (allowedTemplateIds.size === 0) {
    return false; // no permissions
  } else if (!allowedTemplateIds.has(theme.templateMaster?.id)) {
    return false;
  }

  // Aroma Caterers (userId 359): hide Type 19 / Type 20 templates here —
  // those are handled exclusively through the Custom Package flow, not Invoice/Quotation.
  const themeType = theme?.templateMappingResponseDto?.nameEnglish;
  if (String(userId) === "359" && (themeType === "Type 19" || themeType === "Type 20")) {
    return false;
  }

  return true;
});

  if (visibleThemes.length === 0) return null;

              return (
                <div key={module.id}>
                  {/* Module Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-sm font-semibold text-gray-800 capitalize">
                      {module.name}
                    </h3>
                    {module.isExclusive && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
                      >
                        Config required
                      </span>
                    )}
                    {selectedThemeId && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: "#e8f0fe", color: "#005BA8" }}
                      >
                        1 selected
                      </span>
                    )}
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Themes Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {visibleThemes.map((theme) => {
                      const isSelected = selectedThemeId === theme.id;
                      const themeName =
                        theme?.templateMaster?.name || "Unnamed Theme";
                      const themeDesc =
                        theme?.templateMaster?.description || "";
                      const themeImage = theme?.templateMaster?.frontPage || "";

                      return (
                        <div
                          key={theme.id}
                          onClick={() => handleSelectTheme(module.id, theme.id)}
                          className="cursor-pointer rounded-xl overflow-hidden transition-all duration-200"
                          style={{
                            border: isSelected
                              ? "2px solid #005BA8"
                              : "2px solid #e5e7eb",
                            boxShadow: isSelected
                              ? "0 0 0 3px #005BA822"
                              : "none",
                            transform: isSelected ? "scale(1.02)" : "scale(1)",
                          }}
                        >
                          <div
                            className="relative w-full bg-gray-100"
                            style={{ height: 140 }}
                          >
                            {themeImage ? (
                              <>
                                <img
                                  src={themeImage}
                                  alt={themeName}
                                  className="w-full h-full object-cover object-top"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                                <div
                                  className="absolute inset-0 items-center justify-center bg-gray-100 text-gray-400 text-xs"
                                  style={{ display: "none" }}
                                >
                                  No Preview
                                </div>
                              </>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                                No Preview
                              </div>
                            )}
                            {isSelected && (
                              <div
                                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow"
                                style={{ backgroundColor: "#005BA8" }}
                              >
                                ✓
                              </div>
                            )}
                          </div>
                          <div
                            className="px-3 py-2"
                            style={{
                              backgroundColor: isSelected
                                ? "#e8f0fe"
                                : "#f9fafb",
                            }}
                          >
                            <div className="text-xs font-semibold text-gray-800 truncate">
                              {themeName}
                            </div>
                            {themeDesc && (
                              <div className="text-xs text-gray-500 mt-0.5 truncate">
                                {themeDesc}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* ── Config Modal (only when exclusive modules selected) ──────────── */}
      {isConfigOpen && (
        <ConfigModal
          open={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          onGenerate={handleConfigGenerate}
          selectedModules={exclusiveModulesSelected}
          loading={generatingPdf}
          isExclusiveFlow={hasExclusiveSelected}
           isQuotationFlow={isinvoice !== 0} 
        />
      )}

      {/* ── PDF Viewer Modal ─────────────────────────────────────────────── */}
      <Modal
        title={
          <FormattedMessage
            id={
              isinvoice === 0
                ? "INVOICE.INVOICE_REPORT"
                : "QUOTATION.QUOTATION_REPORT"
            }
            defaultMessage={
              isinvoice === 0 ? "Invoice Report" : "Quotation Report"
            }
          />
        }
        open={isPdfModalVisible}
        onCancel={() => {
          setIsPdfModalVisible(false);
          setPdfUrl("");
        }}
        width="70%"
        style={{ top: 20, maxWidth: "1200px" }}
        footer={
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <button
              onClick={handleWhatsAppClick}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span className="hidden sm:inline">Share on WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </button>
            <button
              className="btn btn-light w-full sm:w-auto"
              onClick={() => {
                setIsPdfModalVisible(false);
                setPdfUrl("");
              }}
            >
              <FormattedMessage id="COMMON.CLOSE" defaultMessage="Close" />
            </button>
          </div>
        }
      >
        <div style={{ height: "70vh" }}>
          {pdfUrl && (
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer
                fileUrl={pdfUrl}
                plugins={[pdfPlugin]}
                defaultScale={1.0}
              />
            </Worker>
          )}
        </div>
      </Modal>
    </>
  );
};

export default InvoiceTheme;
