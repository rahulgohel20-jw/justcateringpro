import { useState, useEffect } from "react";
import { X, Sun, Loader2 } from "lucide-react";
import { GetCustomPackageapi, GetAllDecorPackage } from "@/services/apiServices";

export default function CustomPackageModal({
  isOpen,
  onClose,
  userId,
  onSelectPackage,
  mode = "menu",
}) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchPackages();
    }
  }, [isOpen, userId, mode]);

  const SelectPackage = (pkg) => {
    onSelectPackage(pkg.id);
    onClose();
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      if (mode === "decor") {
        const response = await GetAllDecorPackage(userId);
        const packageList =
          response?.data?.data?.["Decore Package Details"] ||
          response?.data?.data ||
          [];

        const mappedPackages = packageList.map((pkg, index) => ({
          id: pkg.id,
          name: pkg.nameEnglish,
          nameGujarati: pkg.nameGujarati,
          nameHindi: pkg.nameHindi,
          price: pkg.price,
          color: getColorByIndex(index),
          categories: extractDecorCategoriesFromPackage(pkg),
        }));

        setPackages(mappedPackages);
      } else {
        const response = await GetCustomPackageapi(userId);
        const packageList = response.data?.data?.["Package Details"] || [];

        const mappedPackages = packageList.map((pkg, index) => ({
          id: pkg.id,
          name: pkg.nameEnglish,
          nameGujarati: pkg.nameGujarati,
          nameHindi: pkg.nameHindi,
          price: pkg.price,
          color: getColorByIndex(index),
          categories: extractCategoriesFromPackage(pkg),
        }));

        setPackages(mappedPackages);
      }
    } catch (err) {
      setError("Failed to load packages. Please try again.");
      console.error("Error fetching packages:", err);
    } finally {
      setLoading(false);
    }
  };

  const getColorByIndex = (index) => {
    const colors = ["red", "green", "blue"];
    return colors[index % colors.length];
  };

  // ── MENU categories ──
  const extractCategoriesFromPackage = (pkg) => {
    const categories = [];

    if (pkg.customPackageDetails && Array.isArray(pkg.customPackageDetails)) {
      pkg.customPackageDetails.forEach((menu) => {
        const categoryItems = [];

        if (
          menu.customPackageMenuItemDetails &&
          Array.isArray(menu.customPackageMenuItemDetails)
        ) {
          menu.customPackageMenuItemDetails.forEach((item) => {
            categoryItems.push({
              menuItemId: item.menuItemId || item.id,
              name: item.itemName,
              price: item.itemPrice,
              instruction: item.itemInstruction,
              image: item.imagePath || item.image || "",
            });
          });
        }

        categories.push({
          menuName: menu.menuName,
          items: categoryItems,
          anyItem: menu.anyItem,
        });
      });
    }

    return categories;
  };

  // ── DECOR categories ──
  const extractDecorCategoriesFromPackage = (pkg) => {
    const categories = [];

    if (pkg.decorePackageDetails && Array.isArray(pkg.decorePackageDetails)) {
      pkg.decorePackageDetails.forEach((decor) => {
        const categoryItems = [];

        if (decor.items && Array.isArray(decor.items)) {
          decor.items.forEach((item) => {
            categoryItems.push({
              decorItemId: item.decoreItemId || item.id,
              name: item.itemName,
              price: item.itemPrice,
              instruction: "",
              image: "",
            });
          });
        }

        categories.push({
          menuName: decor.categoryName || `Category ${decor.decoreMainCategoryId}`,
          items: categoryItems,
          anyItem: decor.anyItem || 0,
        });
      });
    }

    return categories;
  };

  if (!isOpen) return null;

  const title = mode === "decor" ? "Decor Package" : "Custom Package";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 bg-primary rounded-t-2xl shadow-lg relative">
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white hover:bg-white/20 transition-all rounded-full p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-gray-600">Loading packages...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchPackages}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No packages available</p>
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4 px-2">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="min-w-[260px] max-w-[260px] bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex-shrink-0 border border-gray-200"
                >
                  {/* CARD HEADER */}
                  <div className="bg-primary text-white text-center py-6 rounded-t-2xl">
                    <div>
                      <div className="w-14 h-14 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <Sun className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold">{pkg.name}</h3>
                      <p className="text-xs opacity-80 mt-0.5">{title}</p>
                       <h3 className="text-lg font-semibold">{pkg.price}</h3>
                    </div>
                  </div>

                  {/* CATEGORY LIST */}
                  <div className="p-5 space-y-4">
                    {pkg.categories &&
                      pkg.categories.length > 0 &&
                      pkg.categories.map((category, catIndex) => {
                        const bgColors = [
                          "from-blue-50 via-sky-50 to-blue-100",
                          "from-indigo-50 via-blue-50 to-sky-100",
                          "from-sky-50 via-cyan-50 to-blue-100",
                        ];
                        const bg = bgColors[catIndex % bgColors.length];

                        return (
                          <div
                            key={catIndex}
                            className={`rounded-xl p-3 border border-blue-100 bg-gradient-to-br ${bg}`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-blue-700 font-medium text-sm">
                                {category.menuName}
                              </h4>

                              {category.anyItem > 0 && (
                                <span className="text-xs text-blue-700 bg-white/60 px-2 py-0.5 rounded-full border border-blue-100">
                                  Any {category.anyItem}
                                </span>
                              )}
                            </div>

                            {category.items.length > 0 && (
                              <ul className="space-y-1.5 pl-2">
                                {category.items.map((item, itemIndex) => (
                                  <li
                                    key={itemIndex}
                                    className="text-xs text-gray-600 flex items-start"
                                  >
                                    • {item.name}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                  </div>

                  {/* SELECT BUTTON */}
                  <div className="p-5 flex justify-center border-t border-gray-100">
                    <button
                      onClick={() => SelectPackage(pkg)}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md"
                    >
                      Select Package
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
