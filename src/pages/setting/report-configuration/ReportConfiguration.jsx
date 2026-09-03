import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { ChevronDown } from "lucide-react";
import {
  GetAllExclusiveThemes,
  GetActiveFonts,
  UpdateFonts,
} from "../../../services/apiServices";
import Swal from "sweetalert2";

const ROWS = [
  { key: "category", label: "Category Font" },
  { key: "item", label: "Item Font" },
  { key: "slogan", label: "Slogan Font" },
];

const DEFAULT_SIZES = { category: 16, item: 14, slogan: 12 };

const buildConfig = (reportIds, fonts) =>
  Object.fromEntries(
    reportIds.map((id) => [
      id,
      Object.fromEntries(
        ROWS.map((row) => [
          row.key,
          { font: fonts[0]?.name ?? "", size: DEFAULT_SIZES[row.key] },
        ]),
      ),
    ]),
  );

const ReportConfiguration = () => {
  const userId = localStorage.getItem("userId");
  const [exclusiveThemes, setExclusiveThemes] = useState([]);
  const [fonts, setFonts] = useState([]);
  const [open, setOpen] = useState({});
  const [config, setConfig] = useState({});
  const [saved, setSaved] = useState(false);

  // Replace your useEffect and buildConfig with this:

  const buildConfigFromThemes = (themes, fontList) =>
    Object.fromEntries(
      themes.map((report) => {
        const findFontName = (fontId) =>
          fontList.find((f) => f.fontId === fontId)?.name ??
          fontList[0]?.name ??
          "";

        return [
          report.id,
          {
            category: {
              font: findFontName(report.catFontId),
              size: report.catFontSize ?? DEFAULT_SIZES.category,
            },
            item: {
              font: findFontName(report.itemFontId),
              size: report.itemFontSize ?? DEFAULT_SIZES.item,
            },
            slogan: {
              font: findFontName(report.sloganFontId),
              size: report.sloganFontSize ?? DEFAULT_SIZES.slogan,
            },
          },
        ];
      }),
    );

  const fetchThemes = async (fontList) => {
    const themesRes = await GetAllExclusiveThemes(true, userId);
    const themesData = themesRes.data.data || [];
    const formatted = themesData.map((item) => ({
      id: item.id,
      name: item?.templateMaster?.name || "Report",
      catFontId: item.catFontId,
      catFontSize: item.catFontSize,
      itemFontId: item.itemFontId,
      itemFontSize: item.itemFontSize,
      sloganFontId: item.sloganFontId,
      sloganFontSize: item.sloganFontSize,
    }));

    setExclusiveThemes(formatted);
    setOpen(Object.fromEntries(formatted.map((r) => [r.id, true])));
    setConfig(buildConfigFromThemes(formatted, fontList));
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const fontsRes = await GetActiveFonts();
        const fontsData = fontsRes.data.data || [];
        const fontList = fontsData.map((f) => ({
          fontId: f.fontId,
          name: f.fontName,
        }));
        setFonts(fontList);

        await fetchThemes(fontList);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchAll();
  }, []);

  const update = (reportId, rowKey, field, value) =>
    setConfig((prev) => ({
      ...prev,
      [reportId]: {
        ...prev[reportId],
        [rowKey]: {
          ...prev[reportId][rowKey],
          [field]: value,
        },
      },
    }));

  const toggleCard = (id) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSave = async () => {
    try {
      const payload = exclusiveThemes.map((report) => {
        const reportConfig = config[report.id];
        const getFontId = (fontName) =>
          fonts.find((f) => f.name === fontName)?.fontId ?? 0;

        return {
          adminTemplateModuleId: report.id,
          catFontId: getFontId(reportConfig.category.font),
          catFontSize: reportConfig.category.size,
          itemFontId: getFontId(reportConfig.item.font),
          itemFontSize: reportConfig.item.size,
          sloganFontId: getFontId(reportConfig.slogan.font),
          sloganFontSize: reportConfig.slogan.size,
        };
      });

      const res = await UpdateFonts(payload);
      if (res.data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);

        await fetchThemes(fonts);

        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Font configuration updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: "Something went wrong while saving. Please try again.",
        });
      }
    } catch (err) {
      console.error("Error saving fonts:", err);
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Something went wrong while saving. Please try again.",
      });
    }
  };

  return (
    <Fragment>
      <Container>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-black">
                
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage font families and sizes per report
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className={`text-sm font-semibold px-6 py-2.5 rounded-lg transition-all ${
              saved ? "bg-green-600 text-white" : "bg-primary text-white"
            }`}
          >
            {saved ? "Saved ✓" : "Save Changes"}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {exclusiveThemes.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-shadow hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => toggleCard(report.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-primary border-b border-gray-100 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-white inline-block" />
                  <span className="text-md font-semibold text-white">
                    {report.name}
                  </span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-white transition-transform duration-200 ${open[report.id] ? "rotate-180" : ""}`}
                />
              </button>

              {open[report.id] && config[report.id] && (
                <div className="px-4 py-4">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left text-[13px] font-semibold uppercase tracking-widest text-black pb-3 w-40">
                          Field
                        </th>
                        <th className="text-left text-[13px] font-semibold uppercase tracking-widest text-black pb-3 pl-3">
                          Font Family
                        </th>
                        <th className="text-left text-[13px] font-semibold uppercase tracking-widest text-black pb-3 pl-3 w-24">
                          Size (px)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ROWS.map((row, idx) => (
                        <tr
                          key={row.key}
                          className={
                            idx !== 0 ? "border-t border-gray-100" : ""
                          }
                        >
                          <td className="py-2.5">
                            <span className="text-md font-medium text-gray-700">
                              {row.label}
                            </span>
                          </td>

                          <td className="py-2.5 pl-3">
                            <div className="relative">
                              <select
                                value={config[report.id][row.key].font}
                                onChange={(e) =>
                                  update(
                                    report.id,
                                    row.key,
                                    "font",
                                    e.target.value,
                                  )
                                }
                                className="appearance-none text-md bg-gray-50 border border-gray-200 rounded-lg px-3 pr-7 py-1.5 text-gray-800 cursor-pointer focus:outline-none focus:border-primary focus:ring-2 w-full"
                              >
                                {fonts.map((f) => (
                                  <option key={f.fontId} value={f.name}>
                                    {f.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown
                                size={12}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                              />
                            </div>
                          </td>

                          <td className="py-2.5 pl-3">
                            <input
                              type="text"
                              value={config[report.id][row.key].size}
                              onChange={(e) =>
                                update(
                                  report.id,
                                  row.key,
                                  "size",
                                  Number(e.target.value),
                                )
                              }
                              className="w-20 text-center font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-gray-800 focus:outline-none focus:border-primary focus:ring-2"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between">
          <span className="text-sm text-black">
            Changes apply to all report prints
          </span>
          <button
            type="button"
            onClick={handleSave}
            className={`text-sm font-semibold px-6 py-2.5 rounded-lg transition-all ${
              saved ? "bg-green-600 text-white" : "bg-primary text-white"
            }`}
          >
            {saved ? "Saved ✓" : "Save Changes"}
          </button>
        </div>
      </Container>
    </Fragment>
  );
};

export { ReportConfiguration };
