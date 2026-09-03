import { useState } from "react";
import PreviewPane from "./PreviewPane";
import ControlPanel from "./ControlsPanel";
import EditorHeader from "./EditorHeader";

export default function ReportEditor() {
  const [design, setDesign] = useState({
    heading: "Heading",
    subHeading: "Sub Heading",
    body: "Body",
    watermark: "Watermark",
    logo: "",
    image: "",

    typography: {
      headingFont: "Montserrat",
      headingWeight: "700",
      headingSize: 32,
      headingLineHeight: 1.2,
      headingTextAlign: "left",

      subHeadingFont: "Lato",
      subHeadingWeight: "600",
      subHeadingSize: 20,
      subHeadingLineHeight: 1.4,
      subHeadingTextAlign: "left",

      bodyFont: "Open Sans",
      bodyWeight: "400",
      bodySize: 14,
      bodyLineHeight: 1.6,
      bodyTextAlign: "left",
    },

    colors: {
      heading: "#222222",
      subHeading: "#444444",
      body: "#666666",
    },

    imageSettings: {
      radius: 6,
      size: 100,
    },
  });

  const handleSave = () => {
    alert("Design saved successfully!");
  };

  const scrollbarStyle = {
    scrollbarWidth: "thin",
    scrollbarColor: "#3b82f6 transparent",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
      <div className="flex-1 flex justify-center items-start">
        <div className="w-full max-w-[1400px] bg-white shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <EditorHeader onSave={handleSave} />

          {/* Main Workspace */}
          <div className="flex flex-1 overflow-hidden">
            {/* ✅ Preview Section */}
            <div
              className="flex-[0.68] bg-gradient-to-br from-gray-50 to-gray-100 p-8 overflow-y-auto flex justify-center"
              style={{
                height: "calc(100vh - 120px)",
                ...scrollbarStyle,
              }}
            >
              <style>
                {`
                  .flex-[0.68]::-webkit-scrollbar {
                    width: 6px;
                  }
                  .flex-[0.68]::-webkit-scrollbar-thumb {
                    background-color: #3b82f6;
                    border-radius: 10px;
                  }
                  .flex-[0.68]::-webkit-scrollbar-thumb:hover {
                    background-color: #2563eb;
                  }
                `}
              </style>

              <div className="w-full flex justify-center">
                <PreviewPane design={design} />
              </div>
            </div>

            {/* ✅ Control Panel */}
            <div
              className="flex-[0.32] border-l border-gray-200 bg-white px-6  overflow-y-auto"
              style={{
                height: "calc(100vh - 120px)",
                ...scrollbarStyle,
              }}
            >
              <style>
                {`
                  .flex-[0.32]::-webkit-scrollbar {
                    width: 6px;
                  }
                  .flex-[0.32]::-webkit-scrollbar-thumb {
                    background-color: #3b82f6;
                    border-radius: 10px;
                  }
                  .flex-[0.32]::-webkit-scrollbar-thumb:hover {
                    background-color: #2563eb;
                  }
                `}
              </style>

              <ControlPanel design={design} setDesign={setDesign} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
