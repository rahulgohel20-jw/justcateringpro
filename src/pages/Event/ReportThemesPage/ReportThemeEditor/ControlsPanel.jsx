import { useState } from "react";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react"

export default function ControlPanel({ design, setDesign }) {
  const [activeTab, setActiveTab] = useState("heading");

  const updateTypography = (section, key, value) => {
    setDesign((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        [`${section}${key}`]: value, // e.g., headingSize, bodyWeight
      },
    }));
  };

  const updateColor = (key, value) => {
    setDesign((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  };

  const updateImageSetting = (key, value) => {
    setDesign((prev) => ({
      ...prev,
      imageSettings: { ...prev.imageSettings, [key]: value },
    }));
  };

  const typographyTabs = ["heading", "subHeading", "body"];

  return (
<div className="bg-white min-h-screen flex flex-col border border-gray-200 shadow-md rounded-xl px-3 py-4">      {/* TYPOGRAPHY BOX */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#E6EFFF] px-4 py-2 border-b flex items-center gap-2">
       <span className="text-blue-600">
  <img src={`${import.meta.env.BASE_URL}images/typoicon.png`} alt="icon" className="inline-block w-5 h-5" />
</span>

          <h3 className="font-semibold text-gray-800 text-md"   style={{ fontWeight: 800 }}>Typography</h3>
        </div>

        <div className="p-2 bg-[#FAFDFF]">
          {/* Tabs */}
      <div className="flex justify-center border-b mb-4 bg-[#FAFDFF]">
  {typographyTabs.map((tab) => (
    <button
  key={tab}
  className={`px-4 py-2 text-sm font-semibold capitalize transition-all ${
    activeTab === tab
      ? "border-b-2 border-blue-500 text-blue-800 font-bold"
      : "text-gray-500 hover:text-blue-500"
  }`}
  onClick={() => setActiveTab(tab)}
>
  {tab === "subHeading" ? "Sub-Heading" : tab}
</button>

  ))}
</div>


          {/* Inner Gray Box */}
          <div className=" rounded-md p-3 space-y-4">
            {/* Font Family + Font Weight */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm text-black mb-1">Font Family</label>
                 <select
                  value={design.typography[`${activeTab}Weight`] || "normal"}
                  onChange={(e) =>
                    updateTypography(activeTab, "Weight", e.target.value)
                  }
                  className="w-full border rounded-lg px-3 py-1 text-xs"
                >
                  <option value="normal">Normal</option>
                  <option value="Popping">Popping</option>
                  <option value="600">Semi-Bold</option>
                  <option value="300">Light</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-black mb-1">Font Weight</label>
                <select
                  value={design.typography[`${activeTab}Weight`] || "normal"}
                  onChange={(e) =>
                    updateTypography(activeTab, "Weight", e.target.value)
                  }
                  className="w-full border rounded-lg px-2 py-1 text-xs"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="600">Semi-Bold</option>
                  <option value="300">Light</option>
                </select>
              </div>
            </div>

            {/* Font Size + Line Height */}
            <div className="flex gap-3">
              <div className="flex-1">
  <label className="block text-sm text-black mb-1">Font Size</label>
  <div className="relative">
    <input
      type="tel"
      value={design.typography[`${activeTab}Size`] || ""}
      onChange={(e) =>
        updateTypography(activeTab, "Size", +e.target.value)
      }
      className="w-full border rounded px-2 py-1 text-xs pr-8 focus:outline-none focus:ring-1 focus:ring-blue-400"
    />
    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
      px
    </span>
  </div>
</div>


              <div className="flex-1">
                <label className="block text-sm text-black mb-1">Line Height</label>
                <div className="relative">
                  <input
                    type="text"
                    value={design.typography[`${activeTab}LineHeight`] || ""}
                    onChange={(e) =>
                      updateTypography(activeTab, "LineHeight", e.target.value)
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
                </div>
              </div>
            </div>

            {/* Text Alignment */}

<div>
  <label className="block text-sm text-black mb-1">Text Alignment</label>
  <div className="flex gap-2">
    {[
      { align: "left", icon: <AlignLeft size={18} /> },
      { align: "center", icon: <AlignCenter size={18} /> },
      { align: "right", icon: <AlignRight size={18} /> },
    ].map(({ align, icon }) => (
      <button
        key={align}
        className={`flex-1 flex justify-center items-center border rounded py-2 text-sm transition-all ${
          design.typography.textAlign === align
            ? "bg-blue-100 border-blue-500 text-blue-600"
            : "text-gray-600 hover:bg-gray-50"
        }`}
        onClick={() =>
          setDesign((prev) => ({
            ...prev,
            typography: { ...prev.typography, textAlign: align },
          }))
        }
      >
        {icon}
      </button>
    ))}
  </div>
</div>

          </div>
        </div>
      </div>

      {/* COLORS BOX */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden mt-8 ">
        <div className="bg-blue-50 px-4 py-2 border-b flex items-center gap-2">
          <span className="text-blue-600"> 
             <img src={`${import.meta.env.BASE_URL}images/coloricon.png`} alt="icon" className="inline-block w-5 h-5" />
</span>
          <h3 className="font-semibold text-gray-800 text-md"   style={{ fontWeight: 800 }}>Colors</h3>
        </div>

        <div className="p-4 space-y-3 bg-[#FAFDFF]">
          {Object.entries(design.colors).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-sm capitalize text-black " >
                {key === "background" ? "Background Color" : `${key} Text Color`}
              </span>
              <input
                type="color"
                value={value}
                onChange={(e) => updateColor(key, e.target.value)}
                className="w-20 h-8 rounded border cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* IMAGES BOX */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden mt-8">
        <div className="bg-blue-50 px-4 py-2 border-b flex items-center gap-2">
          <span className="text-blue-600">         
             <img src={`${import.meta.env.BASE_URL}images/imgicon.png`} alt="icon" className="inline-block w-5 h-5" />
</span>
          <h3 className="font-semibold text-gray-800 text-md"   style={{ fontWeight: 800 }}>Images Setting</h3>
        </div>

        <div className="p-4 space-y-4 bg-[#FAFDFF]">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Image Radius ({design.imageSettings.radius}px)
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={design.imageSettings.radius}
              onChange={(e) =>
                updateImageSetting("radius", +e.target.value)
              }
              className="w-full"
            />
          </div>

    <div>
  <label className="block text-sm text-gray-700 mb-2">Image Size</label>
  <div className="flex items-center gap-3">
    {/* Width */}
    <div className="flex-1">
      <label className="block text-xs text-gray-600 mb-1">Width</label>
      <div className="relative">
        <input
          type="tel"
          min="20"
          max="100"
          value={design.imageSettings.width || 100}
          onChange={(e) => updateImageSetting("width", +e.target.value)}
          className="w-full border rounded-md px-2 py-1 text-xs pr-6 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
      </div>
    </div>

    {/* Height */}
    <div className="flex-1">
      <label className="block text-xs text-gray-600 mb-1">Height</label>
      <div className="relative">
        <input
          type="tel"
          min="20"
          max="100"
          value={design.imageSettings.height || 100}
          onChange={(e) => updateImageSetting("height", +e.target.value)}
          className="w-full border rounded-md px-2 py-1 text-xs pr-6 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
      </div>
    </div>
  </div>
</div>


        </div>
      </div>

      {/* BRANDING BOX */}
<div className="bg-white border rounded-lg shadow-sm overflow-hidden  mt-8">
  <div className="bg-[#E6EFFF] px-4 py-2 border-b flex items-center gap-2">
    <span className="text-blue-600">
      <img
        src={`${import.meta.env.BASE_URL}images/brandingicon.png`}
        alt="icon"
        className="inline-block w-5 h-5"
      />
    </span>
    <h3 className="font-semibold text-gray-800 text-md"   style={{ fontWeight: 800 }}>Branding</h3>
  </div>

  <div className="p-4 bg-[#FAFDFF] space-y-5">
    {/* Upload Logo */}
    <div>
      <label className="block text-sm text-black mb-1">Upload Logo</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg py-6 text-center text-sm text-black cursor-pointer hover:border-blue-400 transition">
        <p>
          Drag your file(s) or{" "}
          <span className="text-blue-600 cursor-pointer hover:underline">browse</span>
        </p>
        <p className="text-xs text-black mt-1">Max 10 MB files are allowed</p>
      </div>
      <p className="text-xs text-black mt-1">
        Only support .jpg, .png and .svg and .zip files
      </p>
      <div className="mt-3 text-right">
        <button className="bg-[#005BA8] hover:bg-blue-700 text-white text-sm font-medium px-8 py-2 rounded-md shadow">
          Replace
        </button>
      </div>
    </div>

    {/* Logo Size */}
      <div>
  <label className="block text-sm text-black  mb-2">Logo Size</label>
  <div className="flex items-center gap-3">
    {/* Width */}
    <div className="flex-1">
      <label className="block text-xs text-gray-600 mb-1">Width</label>
      <div className="relative">
        <input
          type="tel"
          min="20"
          max="100"
          value={design.imageSettings.width || 100}
          onChange={(e) => updateImageSetting("width", +e.target.value)}
          className="w-full border rounded-md px-2 py-1 text-xs pr-6 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
      </div>
    </div>

    {/* Height */}
    <div className="flex-1">
      <label className="block text-xs text-gray-600 mb-1">Height</label>
      <div className="relative">
        <input
          type="tel"
          min="20"
          max="100"
          value={design.imageSettings.height || 100}
          onChange={(e) => updateImageSetting("height", +e.target.value)}
          className="w-full border rounded-md px-2 py-1 text-xs pr-6 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
      </div>
    </div>
  </div>
</div>

    {/* Text Alignment */}
    <div>
      <label className="block text-sm text-gray-700 mb-1">Text Alignment</label>
      <div className="flex gap-2">
        {[
          { align: "left", icon: <AlignLeft size={18} /> },
          { align: "center", icon: <AlignCenter size={18} /> },
          { align: "right", icon: <AlignRight size={18} /> },
        ].map(({ align, icon }) => (
          <button
            key={align}
            className={`flex-1 flex justify-center items-center border rounded py-2 text-sm transition-all ${
              design.typography.textAlign === align
                ? "bg-blue-100 border-blue-500 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() =>
              setDesign((prev) => ({
                ...prev,
                typography: { ...prev.typography, textAlign: align },
              }))
            }
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  </div>
</div>
{/* ACTION BUTTONS */}
<div className="flex justify-center items-center gap-4 mt-8 pb-6">
  <button
    className="border border-blue-600 text-blue-600 font-semibold px-8 py-2 rounded-md hover:bg-blue-50 transition"
    onClick={() => console.log("❌ Cancel clicked")}
  >
    Cancel
  </button>
  <button
    className="bg-[#005BA8] hover:bg-blue-700 text-white font-semibold px-8 py-2 rounded-md shadow transition"
    onClick={() => console.log("💾 Save clicked")}
  >
    Save
  </button>
</div>

    </div>
  );
}
