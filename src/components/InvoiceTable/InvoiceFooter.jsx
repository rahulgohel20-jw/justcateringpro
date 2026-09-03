import React, { useState, useEffect , useRef} from "react";
import {
  CloseOutlined,
  SaveOutlined,
  SendOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Select, Radio, Input } from "antd";
import { Download } from "lucide-react";
import { FormattedMessage, useIntl } from "react-intl";

const { TextArea } = Input;

const InvoiceFooter = ({
  invoiceData,
  rows,
  footerData,
  onFooterDataChange,
  onSave,
  isEdited,
  isNewInvoice,
  bankDetails,
  permissionInvoice,
   extraTaxTotal = 0,
}) => {
  const [notes, setNotes] = useState("");
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [igst, setIgst] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [roundOff, setRoundOff] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [cgstAmnt, setCgstAmnt] = useState(0);
  const [sgstAmnt, setSgstAmnt] = useState(0);
  const [igstAmnt, setIgstAmnt] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [cashPayment, setCashPayment] = useState(0);     
const [chequePayment, setChequePayment] = useState(0);
const [isDiscountPercentage, setIsDiscountPercentage] = useState(false);
const [discountPercentage, setDiscountPercentage] = useState(0);
  console.log("permisiion", permissionInvoice);
  const initializedRef = useRef(false);

  const intl = useIntl();

  // Calculate subtotal from rows
  useEffect(() => {
    if (rows && rows.length > 0) {
      const calculatedSubTotal = rows.reduce((sum, row) => {
        const person = Number(row.person) || 0;
        const rate = Number(row.rate) || 0;
        const extra = Number(row.extra) || 0;
        const amount = row.amount ? Number(row.amount) : person * rate + extra;
        return sum + amount;
      }, 0);
      setSubTotal(calculatedSubTotal);
    } else {
      setSubTotal(0);
    }
  }, [rows]);

  // Calculate all amounts when values change - CORRECTED LOGIC with manual round off
useEffect(() => {
  const discountAmount = Number(discount) || 0;
  const taxableAmt = subTotal - discountAmount;

  // If cash has a value, GST is based only on the cheque portion — never falls back to the full taxable amount
  const gstBase =
    parseFloat(cashPayment) > 0
      ? parseFloat(chequePayment) || 0
      : chequePayment > 0
        ? chequePayment
        : taxableAmt;

  const cgstAmount = (gstBase * Number(cgst)) / 100;
  const sgstAmount = (gstBase * Number(sgst)) / 100;
  const igstAmount = (gstBase * Number(igst)) / 100;

  const totalBeforeRounding = taxableAmt + cgstAmount + sgstAmount + igstAmount;
  const roundOffAmount = Number(roundOff) || 0;
const finalTotal = totalBeforeRounding + roundOffAmount + (Number(extraTaxTotal) || 0);

  setCgstAmnt(cgstAmount);
  setSgstAmnt(sgstAmount);
  setIgstAmnt(igstAmount);
  setTotalAmount(totalBeforeRounding);
  setGrandTotal(finalTotal);
}, [subTotal, cgst, sgst, igst, discount, roundOff, cashPayment, chequePayment, extraTaxTotal]);

useEffect(() => {
  if (!initializedRef.current) return;

  const base = subTotal - (Number(discount) || 0);
  const cash = Number(cashPayment) || 0;
  const cheque = Number(chequePayment) || 0;

  if (cheque === 0 && cash !== 0) {
    // cash is the value the user set — cheque was 0, keep it 0-driven? 
    // no: they want cash to absorb the taxable amount when cheque is 0
    setCashPayment(parseFloat(Math.max(0, base).toFixed(2)));
  } else {
    // default: cheque follows taxable - cash
    setChequePayment(parseFloat(Math.max(0, base - cash).toFixed(2)));
  }
}, [subTotal, discount]);
const calcGstOnAmount = (chequeAmt) => {
  const totalGstPct = Number(cgst) + Number(sgst) + Number(igst);
  const gstOnCheque = (chequeAmt * totalGstPct) / 100;
  return parseFloat((chequeAmt + gstOnCheque).toFixed(2));
};

const handleCashChange = (value) => {
  const cash = parseFloat(value) || 0;
  const base = subTotal - (Number(discount) || 0);
  const cheque = parseFloat(Math.max(0, base - cash).toFixed(2));
  setCashPayment(cash);
  setChequePayment(cheque);
};

const handleChequeChange = (value) => {
  const cheque = parseFloat(value) || 0;
  const base = subTotal - (Number(discount) || 0);
  const cash = parseFloat(Math.max(0, base - cheque).toFixed(2));
  setChequePayment(cheque);
  setCashPayment(cash);
};

useEffect(() => {
  if (initializedRef.current || !footerData) return;
  if (!rows || rows.length === 0) return;

  const computedSubTotal = rows.reduce((sum, row) => {
    const person = Number(row.person) || 0;
    const rate = Number(row.rate) || 0;
    const extra = Number(row.extra) || 0;
    const amount = row.amount ? Number(row.amount) : person * rate + extra;
    return sum + amount;
  }, 0);

  // Guard against the parent's placeholder row ({person:"", rate:"", amount:""})
  // which passes rows.length > 0 but yields subtotal 0 — don't lock in on that.
  if (computedSubTotal <= 0) return;

  setNotes(footerData.notes || "Thanks for your Business...");
  setCgst(footerData.cgst || 2.5);
  setSgst(footerData.sgst || 2.5);
  setIgst(footerData.igst || 0);
  setDiscount(footerData.discount || 0);
  setRoundOff(footerData.roundOff || 0);

  const discountAmt = Number(footerData.discount) || 0;
  const taxableAmt = computedSubTotal - discountAmt;

const initCash = Number(footerData.cashPayment) || 0;
const initCheque = initCash === 0 ? taxableAmt : (Number(footerData.chequePayment) || 0);

setCashPayment(initCash);
setChequePayment(initCheque);

  setIsDiscountPercentage(footerData.isDiscountPercentage ?? false);
  setDiscountPercentage(Number(footerData.discountPercentage) || 0);

  initializedRef.current = true; // only locks after a real load
}, [footerData, rows]);

  // Sync local state changes back to parent
 useEffect(() => {
  if (onFooterDataChange) {
    onFooterDataChange({
      notes,
      gst: cgst + sgst + igst,
      cgst, sgst, igst, discount, roundOff,
      subTotal, totalAmount, cgstAmnt, sgstAmnt, igstAmnt, grandTotal,
      cashPayment, chequePayment, 
      discountPercentage,       
      isDiscountPercentage,
    });
  }
}, [
  notes, cgst, sgst, igst, discount, roundOff, subTotal, totalAmount,
  cgstAmnt, sgstAmnt, igstAmnt, grandTotal, cashPayment, chequePayment,  discountPercentage, isDiscountPercentage,
]);

const handleCgstChange = (e) => {
  const value = e.target.value;
  // allow empty, digits, and at most one decimal point with up to 2 decimal places
  if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
    setCgst(value);
  }
};

const handleSgstChange = (e) => {
  const value = e.target.value;
  if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
    setSgst(value);
  }
};

const handleIgstChange = (e) => {
  const value = e.target.value;
  if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
    setIgst(value);
  }
};
const handleDiscountChange = (e) => {
  const value = e.target.value;
  if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
    setDiscount(value); // keep as string
    if (isDiscountPercentage && subTotal > 0) {
      const amt = parseFloat(value) || 0;
      const pct = (amt / subTotal) * 100;
      setDiscountPercentage(pct.toFixed(2));
    }
  }
};

const handleDiscountPercentageChange = (e) => {
  const value = e.target.value;
  // allow empty, digits, and up to 2 decimal places while typing
  if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
    setDiscountPercentage(value); // keep as string
    const pct = parseFloat(value) || 0;
    const amount = (subTotal * pct) / 100;
    setDiscount(amount.toFixed(2));
  }
};
const handleToggleDiscountMode = () => {
  const turningOn = !isDiscountPercentage;
  setIsDiscountPercentage(turningOn);

  if (turningOn && subTotal > 0) {
    // back-calculate percentage from the existing discount amount
    const pct = (Number(discount) / subTotal) * 100;
    setDiscountPercentage(pct);
  }
};

  const handleRoundOffChange = (e) => {
    const value = e.target.value;
    const numValue = value === "" ? 0 : parseFloat(value);
    setRoundOff(isNaN(numValue) ? 0 : numValue);
  };

  // Calculate taxable amount for display
  const taxableAmount = subTotal - (Number(discount) || 0);

  return (
    <>
      <div className="grid md:grid-cols-2 gap-3 mb-5">
        <div className="min-w-full">
          <h4 className="text-base font-semibold leading-none text-gray-900 mb-2">
            <FormattedMessage id="COMMON.NOTES" defaultMessage="Notes" />
          </h4>
          <TextArea
            placeholder="Thanks for your Business..."
            autoSize={{ minRows: 18 }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="min-w-full">
          <h4 className="text-base font-semibold leading-none text-gray-900 mb-2">
            <FormattedMessage id="COMMON.SUMMARY" defaultMessage="Summary" />
          </h4>
          <div className="border rounded-lg min-w-full p-4">
            {/* Subtotal */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-900">
                <FormattedMessage
                  id="COMMON.SUBTOTAL"
                  defaultMessage="Subtotal"
                />
              </span>
              <span className="font-semibold">₹{subTotal.toFixed(2)}</span>
            </div>

            {/* Discount */}
          {/* Discount */}
            <div className="flex flex-col mb-2 pb-2 border-b gap-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900">
                    <FormattedMessage
                      id="COMMON.DISCOUNT"
                      defaultMessage="Discount"
                    />
                  </span>

                  {/* Toggle: % vs ₹ */}
                  <div className="flex items-center gap-1">
                   {/* <span
                      className={`text-xs font-medium cursor-pointer ${!isDiscountPercentage ? "text-primary font-bold" : "text-gray-400"}`}
                      onClick={() => {
                        if (isDiscountPercentage) handleToggleDiscountMode();
                      }}
                    > 
                      ₹
                    </span> */}
                    <div
                      onClick={handleToggleDiscountMode}
                      className={`relative w-8 h-4 rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer
                        ${isDiscountPercentage ? "bg-primary" : "bg-gray-300"}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200
                          ${isDiscountPercentage ? "translate-x-4" : "translate-x-0"}`}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium cursor-pointer ${isDiscountPercentage ? "text-primary font-bold" : "text-gray-400"}`}
                      onClick={() => {
                        if (!isDiscountPercentage) handleToggleDiscountMode();
                      }}
                    >
                      %
                    </span>
                  </div>
                </div>
                  {isDiscountPercentage ? (
                <div className="flex justify-end items-center gap-2">
                  <Input
                    className="w-20 text-right"
                    type="tel"
                    value={discountPercentage}
                    onChange={handleDiscountPercentageChange}
                    min={0}
                    placeholder="0.00"
                    max={100}
                    step="0.01"
                    suffix="%"
                  />
                  <Input
                    className="w-28 text-right"
                    type="tel"
                    value={discount}
                    onChange={handleDiscountChange}
                    min={0}
                    step="0.01"
                    prefix="₹"
                  />
                </div>
              ) : (
                <div className="flex justify-end">
                  <Input
                    className="w-24 text-right"
                    placeholder="0.00"
                    type="tel"
                    value={discount}
                    onChange={handleDiscountChange}
                    min={0}
                    step="0.01"
                    prefix="₹"
                  />
                </div>
              )}
                {/* <span className="font-semibold text-red-600">
                  -₹{Number(discount).toFixed(2)}
                </span> */}
              </div>

            

              <span className="text-[10px] text-gray-400 text-right">
                Click <b>%</b> to add discount by percentage, or <b>₹</b> for amount.
              </span>
            </div>

            {/* Taxable Amount */}
            <div className="flex justify-between items-center mb-2 pb-2 border-b bg-blue-50 px-2 py-1 rounded">
              <span className="text-sm font-semibold text-gray-900">
                <FormattedMessage
                  id="COMMON.TAXABLE_AMOUNT"
                  defaultMessage="Taxable Amount"
                />
              </span>
              <span className="font-bold text-blue-700">
                ₹{taxableAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col gap-2 mb-2 pb-2 border-b">
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-700">Cash Payment</span>
    <Input
      className="w-32 text-right"
      type="tel"
      value={cashPayment}
      onChange={(e) => handleCashChange(e.target.value)}
      prefix="₹"
    />
  </div>
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-700">Cheque Amount</span>
    <Input
      className="w-32 text-right"
      type="tel"
      value={chequePayment}
      onChange={(e) => handleChequeChange(e.target.value)}
      prefix="₹"
    />
  </div>
  
</div>

            {/* CGST - Calculated on taxable amount */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">CGST</span>
                <Input
                  className="w-20 text-right"
                  type="tel"
                  value={cgst}
                  onChange={handleCgstChange}
                  min={0}
                  max={100}
                  step="0.01"
                  suffix="%"
                />
              </div>
              <span className="font-semibold text-gray-700">
                ₹{cgstAmnt.toFixed(2)}
              </span>
            </div>

            {/* SGST - Calculated on taxable amount */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">SGST</span>
                <Input
                  className="w-20 text-right"
                  type="tel"
                  value={sgst}
                  onChange={handleSgstChange}
                  min={0}
                  max={100}
                  step="0.01"
                  suffix="%"
                />
              </div>
              <span className="font-semibold text-gray-700">
                ₹{sgstAmnt.toFixed(2)}
              </span>
            </div>

            {/* IGST - Calculated on taxable amount */}
            <div className="flex justify-between items-center mb-2 pb-2 border-b">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">IGST</span>
                <Input
                  className="w-20 text-right"
                  type="tel"
                  value={igst}
                  onChange={handleIgstChange}
                  min={0}
                  max={100}
                  step="0.01"
                  suffix="%"
                />
              </div>
              <span className="font-semibold text-gray-700">
                ₹{igstAmnt.toFixed(2)}
              </span>
            </div>
            {chequePayment > 0 && (
    <div className="flex justify-between items-center bg-green-50 px-2 py-1 rounded">
      <span className="text-sm font-semibold text-green-700">
        Cheque Amt (incl. GST)
      </span>
      <span className="font-bold text-green-700">
        ₹{calcGstOnAmount(chequePayment).toFixed(2)}
      </span>
    </div>
  )}

            {/* Total Amount (before round off) */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-900">
                <FormattedMessage
                  id="COMMON.TOTAL_AMOUNT"
                  defaultMessage="Total Amount"
                />
              </span>
              <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
            </div>

            {/* Round Off - Manual input, adds to grand total */}
            <div className="flex justify-between items-center mb-2 pb-2 border-b">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  <FormattedMessage
                    id="COMMON.ROUND_OFF"
                    defaultMessage="Round Off"
                  />
                </span>
                <Input
                  className="w-20 text-right"
                  type="tel"
                  value={roundOff}
                  onChange={handleRoundOffChange}
                  step="0.01"
                  prefix="₹"
                />
              </div>
              <span
                className={`font-semibold ${roundOff >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {roundOff >= 0 ? "+" : ""}₹{Number(roundOff).toFixed(2)}
              </span>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between pt-2 font-semibold">
              <span className="text-base text-primary">
                <FormattedMessage
                  id="COMMON.GRAND_TOTAL"
                  defaultMessage="Grand Total"
                />
              </span>
              <span className="text-lg text-primary font-bold">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>
            {extraTaxTotal > 0 && (
  <div className="text-xs text-gray-500 text-right -mt-1">
    (incl. ₹{Number(extraTaxTotal).toFixed(2)} Food/Service/VAT Tax)
  </div>
)}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-5">
        <div className="min-w-full">
          <div className="p-3 border rounded-lg whitespace-pre-line text-sm">
  <h4 className="text-base font-semibold leading-none text-gray-900 mb-2">
    <FormattedMessage
      id="COMMON.TERMS_AND_CONDITIONS"
      defaultMessage="Terms & Conditions"
    />
    <span className="mandatory ms-0.5 text-base text-red-500 font-medium">
      *
    </span>
  </h4>

  {invoiceData?.termsAndConditions ? (
    invoiceData.termsAndConditions
  ) : bankDetails ? (
    <div>
      
      <em className="block">
        {"\n"}Bank Name :- {bankDetails.bankName}
        {"\n"}AC NO. :- {bankDetails.accountNo}
        {"\n"}BRANCH :- {bankDetails.branchName}
        {"\n"}IFSC CODE :- {bankDetails.ifscCode}
        {"\n"}AC NAME :- {bankDetails.accountHolderName}
        {bankDetails.upiId && `\nUPI :- ${bankDetails.upiId}`}
      </em>
    </div>
  ) : (
    "No Bank Details Available"
  )}
</div>
        </div>
        <div className="min-w-full">
          <div className="border rounded-lg min-w-full h-full p-4">
            <h4 className="text-base font-semibold leading-none text-gray-900 mb-2">
              <FormattedMessage
                id="COMMON.ATTACH_FILES_TO_INVOICE"
                defaultMessage="Attach Files to Invoice"
              />
            </h4>
            <Button
              icon={<UploadOutlined />}
              className="mb-1 border-gray-300 text-primary"
            >
              <FormattedMessage
                id="COMMON.UPLOAD_FILE"
                defaultMessage="Upload File"
              />
            </Button>
            <p className="text-xs text-gray-500">
              <FormattedMessage
                id="COMMON.UPLOAD_MAX_FILE_SIZE"
                defaultMessage="You can upload maximum 10mb file"
              />
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
          {/* <button className="btn btn-light">
            <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
          </button> */}
        {permissionInvoice.view  && (
        <button className="btn btn-primary" onClick={onSave}>
          <i className="ki-outline ki-paper-plane"></i>

          <FormattedMessage id="COMMON.SAVE_AND_SEND" defaultMessage="Save " />
        </button>
        )}
      </div>
    </>
  );
};

export default InvoiceFooter;
