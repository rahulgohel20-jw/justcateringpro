import { Breadcrumbs } from "@mui/material";

const Location = () => {
  return (
    <div>
      {/* Breadcrumbs */}
      <div className="gap-2 mb-3">
        <Breadcrumbs items={[{ title: "Register Face" }]} />
      </div>
      <div className="p-6 max-w-lg mx-auto bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-gray-700 font-bold">Office Location</h2>
        </div>
        <div className="">
          <div className="relative w-full h-96" id="map"></div>
          <button className="mt-4 w-full bg-primary hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export { Location };
