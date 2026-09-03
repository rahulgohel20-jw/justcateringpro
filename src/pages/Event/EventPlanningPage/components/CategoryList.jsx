import { useState, useEffect, useMemo } from "react";
import { GetAllCategoryformenu } from "@/services/apiServices";

const CategoryList = ({
  refreshKey,
  selectedCategoryId = 0,
  onCategoryChange = () => {},
  searchTerm = "",
  packageCategories = [],
  savedCategoriesOrder = [],
  isDisabled = false,
  fetchCategoriesFn = null,
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem("lang") || "en",
  );
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const handleLanguageChange = (e) => {
      const newLang =
        e.detail?.newLanguage || localStorage.getItem("lang") || "en";
      setCurrentLanguage(newLang);
    };

    const handleStorage = () => {
      const newLang = localStorage.getItem("lang") || "en";
      if (newLang !== currentLanguage) {
        setCurrentLanguage(newLang);
      }
    };

    window.addEventListener("languageChange", handleLanguageChange);
    window.addEventListener("storage", handleStorage);

    // Polling fallback
    const intervalId = setInterval(() => {
      const currentLang = localStorage.getItem("lang") || "en";
      if (currentLang !== currentLanguage) {
        setCurrentLanguage(currentLang);
      }
    }, 500);

    return () => {
      window.removeEventListener("languageChange", handleLanguageChange);
      window.removeEventListener("storage", handleStorage);
      clearInterval(intervalId);
    };
  }, [currentLanguage]);

 const getLocalizedCategoryName = useMemo(() => {
    return (cat) => {
      const languageMap = {
        en: "nameEnglish",
        hi: "nameHindi",
        gu: "nameGujarati",
      };
      const field = languageMap[currentLanguage] || "nameEnglish";
      return cat[field] || cat.nameEnglish || cat.name || "";
    };
  }, [currentLanguage]);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      let categoryData = [];

      if (fetchCategoriesFn) {
        const raw = await fetchCategoriesFn(userId);
        categoryData = Array.isArray(raw) ? raw : [];
      } else {
        const response = await GetAllCategoryformenu(userId);
        categoryData = response?.data?.data?.["Menu Category Details"] || [];
      }

      const categoryList = [
        {
          id: 0,
          nameEnglish: "All",
          nameHindi: "सभी",
          nameGujarati: "બધા",
        },
        ...categoryData.map((cat) => ({
          id: cat.id,
          nameEnglish: cat.nameEnglish || cat.name || "",
          nameHindi: cat.nameHindi || cat.nameEnglish || cat.name || "",
          nameGujarati: cat.nameGujarati || cat.nameEnglish || cat.name || "",
          ...cat,
        })),
      ];

      setCategories(categoryList);

      const found = categoryList.find((c) => c.id === selectedCategoryId);
      if (!found) onCategoryChange("All", 0);
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([
        { id: 0, nameEnglish: "All", nameHindi: "सभी", nameGujarati: "બધા" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [refreshKey, fetchCategoriesFn]);

  // Sort categories based on saved order and package categories
  const sortedCategories = useMemo(() => {
    const cats = [...categories];
    const allCat = cats.find((c) => c.id === 0);
    const getDisplayName = (cat) => getLocalizedCategoryName(cat);

    const savedOrderedCats = savedCategoriesOrder
      .map((catName) => cats.find((c) => getDisplayName(c) === catName))
      .filter(Boolean);

    const remaining = cats.filter(
      (c) => c.id !== 0 && !savedCategoriesOrder.includes(getDisplayName(c)),
    );

    const packageCats = remaining.filter((c) =>
      packageCategories.includes(getDisplayName(c)),
    );

    const normalCats = remaining.filter(
      (c) => !packageCategories.includes(getDisplayName(c)),
    );

    return [allCat, ...savedOrderedCats, ...packageCats, ...normalCats].filter(
      Boolean,
    );
  }, [
    categories,
    savedCategoriesOrder,
    packageCategories,
    getLocalizedCategoryName,
    currentLanguage,
  ]);

  // 🔥 ENHANCED MULTI-LANGUAGE SEARCH
  const filteredCategories = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) return sortedCategories;

    const searchLower = searchTerm.toLowerCase().trim();

    return sortedCategories.filter((cat) => {
      // Search across ALL language fields
      const searchableText = [
        cat.nameEnglish,
        cat.nameHindi,
        cat.nameGujarati,
        cat.name,
      ]
        .filter(Boolean) // Remove null/undefined
        .map((text) => text.toLowerCase())
        .join(" "); // Combine all text

      return searchableText.includes(searchLower);
    });
  }, [sortedCategories, searchTerm]);

  // Show message when no results found
  const showNoResults =
    !loading && filteredCategories.length === 0 && searchTerm.trim();

  if (loading) {
    return (
      <div className="w-full p-3 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {selectedCategoryId !== 0 && (
  <div className="px-3 pb-2 flex items-center gap-2 text-[11px] text-gray-400">
    <kbd className="bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5 font-mono text-[10px] text-gray-500">B</kbd>
    <span>Basic</span>
    <kbd className="bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5 font-mono text-[10px] text-gray-500">P</kbd>
    <span>Premium</span>
  </div>
)}
      {showNoResults ? (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="text-gray-400 mb-2">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-sm font-medium">
            No categories found
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Try searching with different keywords
          </p>
        </div>
      ) : (
        <div className="flex flex-row gap-2 overflow-x-auto no-scrollbar pb-1
                 lg:flex-col lg:gap-2 lg:overflow-visible lg:pb-0">
  {filteredCategories.map((cat) => {
    const displayName = getLocalizedCategoryName(cat);
    const isPkgCat = packageCategories.includes(displayName);
    return (
      <div
        key={cat.id}
        onClick={() => !isDisabled && onCategoryChange(displayName, cat.id, cat)}
        className={`flex-shrink-0 whitespace-nowrap min-w-[100px] text-center
          lg:whitespace-normal lg:min-w-0 lg:text-left
          px-3 py-2 rounded transition-all relative
          ${isDisabled && selectedCategoryId !== cat.id ? "cursor-not-allowed opacity-40" : "cursor-pointer"}
          ${selectedCategoryId === cat.id
            ? "bg-blue-100 text-blue-700 border border-blue-400 font-semibold"
            : isPkgCat ? "bg-blue-50 text-primary border border-primary"
            : "text-gray-700 hover:bg-gray-100 border border-transparent"}
        `}
      >
                {isPkgCat && (
                  <span className="absolute top-1 right-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    PKG
                  </span>
                )}
                <span className="block truncate pr-8">{displayName}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Optional: Show search result count */}
      {searchTerm.trim() && filteredCategories.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Found {filteredCategories.length}{" "}
            {filteredCategories.length === 1 ? "category" : "categories"}
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
