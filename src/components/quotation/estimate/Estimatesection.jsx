const OrderDetail = () => {
  return (
    <div className=" mx-auto bg-white shadow rounded p-6">
      <h2 className="text-lg font-semibold mb-4">Estimate Summary</h2>

      <div className="space-y-3">
        <div className="flex justify-between p-2">
          <span>Haldi Carnival Total</span>
          <span>₹15,000.00</span>
        </div>
        <hr className="border-t border-gray-300 my-2" />
        <div className="flex justify-between p-2">
          <span>Mayra Groom Side</span>
          <span>₹25,000.00</span>
        </div>
        <hr className="border-t border-gray-300 my-2" />
        <div className="flex justify-between p-2">
          <span>Wedding Reception Total</span>
          <span>₹60,000.00</span>
        </div>

        <hr className="border-t border-dashed border-gray-300 my-2" />

        <div className="flex justify-between">
          <span className="font-medium">Subtotal</span>
          <span className="font-medium">₹1,00,000.00</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>Discount</span>
          </div>

          <span className="text-red-500 font-medium">
            <input
              type="tel"
              readonly
              className="w-14 text-center border rounded bg-gray-100 text-xs py-1 me-2"
            />
            <input
              type="tel"
              className="w-24 border rounded text-sm px-2 py-1"
            />
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>CGST</span>
          </div>
          <span>
            {" "}
            <input
              type="tel"
              readonly
              className="w-14 text-center border rounded bg-gray-100 text-xs py-1 me-2"
            />
            <input
              type="tel"
              placeholder="0"
              className="w-24 border rounded text-sm px-2 py-1"
            />
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>SGST</span>
          </div>
          <span className="flex items-center gap-2">
            <input
              type="tel    "
              readonly
              className="w-14 text-center border rounded bg-gray-100 text-xs py-1"
            />

            <input
              type="tel"
              placeholder="0"
              className="w-24 border rounded text-sm px-2 py-1"
            />
          </span>
        </div>
      </div>

      <div className="mt-6 bg-orange-50 p-3 flex justify-between font-semibold text-orange-700 rounded">
        <span>Grand Total</span>
        <span>₹1,06,200.00</span>
      </div>
    </div>
  );
};

export default OrderDetail;
