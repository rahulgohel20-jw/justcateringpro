import { Fragment } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { toAbsoluteUrl } from "@/utils";
const QuickCustomPackage = () => {
  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={[{ title: "Customise Package" }]} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow ">
            <h2 className="font-semibold mb-6">User Details</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full bg-[#F8FAFC] border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="w-full bg-[#F8FAFC] border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="tel"
                  placeholder="0.00"
                  className="w-full bg-[#F8FAFC] border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">
                  Choose Package Option
                </label>
                <select className="w-full bg-[#F8FAFC] border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>Starter</option>
                  <option>Premium</option>
                  <option>Deluxe</option>
                </select>
              </div>
              <div className=" w-full flex justify-center">
                <button
                  type="submit"
                  className=" w-[60%] flex justify-center bg-primary text-white py-2 rounded hover:bg-blue-700 transition "
                >
                  Submit
                </button>
              </div>
            </form>
          </div>

          <div className="bg-blue-100 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-700 mb-4">
                Available Packages
              </h2>
              <span className="inline-flex h-7 text-[25px] text-black cursor-pointer">
                ⋮
              </span>
            </div>

            <div className="bg-[#005AA733] rounded-lg shadow relative w-full h-80 md:h-[360px] overflow-hidden flex items-center justify-center">
              <img
                src={toAbsoluteUrl("/media/illustrations/30.svg")}
                alt="Packages"
                className="object-cover w-full h-full opacity-60 blur-sm scale-105"
              />

              <button className="absolute bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Choose Packages
              </button>
            </div>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export default QuickCustomPackage;
