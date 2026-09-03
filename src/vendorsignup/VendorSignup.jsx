import React, { useState } from "react";
import bgImage from "/images/vendor.png";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toAbsoluteUrl } from "@/utils";

function VendorSignup() {
  const [phone, setPhone] = useState("");
  return (
    <div
      className="min-h-screen bg-cover bg-center flex  justify-end px-4 mt-[-20px]"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="p-5">
        {/* RIGHT CARD */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md mx-auto ">
          <h2 className="text-lg font-semibold mb-6 text-[#000000]">
            Register your Business with Just Vendor!
          </h2>

          <form className="space-y-4">
            <input
              type="text"
              placeholder="Enter Company Name"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />

            <input
              type="email"
              placeholder="Enter Company Email Address"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />

            <input
              type="text"
              placeholder="Enter Your Full Name"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />

            <PhoneInput
              country={"in"}
              value={phone}
              onChange={(phone) => setPhone(phone)}
              enableSearch={true}
              inputClass="!w-full !h-11 !pl-14 !rounded-lg !border !border-gray-300 focus:!ring-2 focus:!ring-green-500"
              containerClass="!w-full"
              buttonClass="!border-gray-300 !rounded-l-lg"
            />
            <div className="flex flex-col gap-1">
              <label className="text-[#000000]">Business Category type</label>
              <input
                type="text"
                placeholder="Business Category type"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* Company Size */}
            <div>
              <p className="text-sm font-medium text-[#000000] mb-2">
                Company Size
              </p>

              <div className="flex justify-between text-sm text-gray-600 border p-3 rounded-lg">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="size"
                    className="accent-green-600"
                  />
                  &lt;5 Employees
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="size"
                    className="accent-green-600"
                  />
                  5-10 Employees
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="size"
                    className="accent-green-600"
                  />
                  &gt;10 Employees
                </label>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex gap-2">
              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="accent-green-600" />
                <span>Is one of your Business Attach with</span>
              </div>
              <div>
                <img
                  src={toAbsoluteUrl("/images/logo.svg")}
                  className="w-[120px]"
                  alt=""
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-[#2F945A] hover:bg-green-700 transition text-white font-medium py-3 rounded-lg"
            >
              Register →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VendorSignup;
