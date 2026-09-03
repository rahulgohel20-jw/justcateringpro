import { useState, useEffect, useRef } from "react";
import { Modal, Select, Checkbox, Input, Button, Spin, Empty } from "antd";
import {
  GetRawmaterialItemByRecipe,
  GetCopyItem,
  getMenuItemCaptainReceipeByMenuId,
} from "@/services/apiServices";

const unitOptions = ["Gram", "Kilogram", "Litre"];

const CopyRecipe = ({ isOpen, onClose, onCopy, isCaptainRecipe = false }) => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [allRecipes, setAllRecipes] = useState([]);
  const [recipeOptions, setRecipeOptions] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [loadingMoreRecipes, setLoadingMoreRecipes] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [items, setItems] = useState([]);
  const [searchText, setSearchText] = useState("");

  const recipePageRef = useRef(1);
  const loadingMoreRef = useRef(false);
  const searchTextRef = useRef("");
  const allRecipesRef = useRef([]);

  const pageSize = 1000;
  const userId = localStorage.getItem("userId") || "0";

  const fetchRecipes = async ({ page = 1, reset = false } = {}) => {
    if (reset) {
      setLoadingRecipes(true);
    } else {
      loadingMoreRef.current = true;
      setLoadingMoreRecipes(true);
    }

    try {
      const res = await GetCopyItem(userId, isCaptainRecipe);
      const list = res?.data?.data?.ItemDetails || [];

      const mapped = list.map((r) => ({
        label: r.menuName,
        value: r.menuItemId,
      }));

      const updated = reset ? mapped : [...allRecipesRef.current, ...mapped];
      allRecipesRef.current = updated;
      setAllRecipes(updated);

      const currentSearch = searchTextRef.current;
      setRecipeOptions(
        currentSearch
          ? updated.filter((r) =>
              r.label.toLowerCase().includes(currentSearch.toLowerCase()),
            )
          : updated,
      );

      recipePageRef.current = page;
    } catch (err) {
      console.error("Error fetching recipes:", err);
    } finally {
      setLoadingRecipes(false);
      loadingMoreRef.current = false;
      setLoadingMoreRecipes(false);
    }
  };

  const fetchRecipeItems = async (recipeId) => {
    setLoadingItems(true);
    try {
      if (isCaptainRecipe) {
        // Reuse the same endpoint as "Sync Captain Recipe", but isSync = false
        const res = await getMenuItemCaptainReceipeByMenuId(
          recipeId,
          userId,
          false,
        );
        const list = res?.data?.data?.menuItemRawMaterials || [];

        const formatted = list.map((i) => ({
          id: i.id,
          name: i.captainReceipeMaster?.name || "",
          captainReceipeId: i.captainReceipeMaster?.id || "",
          weight: i.weight || "",
          unit: i.unitName || i.unitHierarchy?.nameEnglish || "Gram",
          unitId: i.unitId || "",
          rate: i.rate ?? 0,
          checked: false,
        }));

        setItems(formatted);
      } else {
        const res = await GetRawmaterialItemByRecipe(recipeId, userId, false);
        const list = res?.data?.data?.menuItemRawMaterials || [];

        const formatted = list.map((i) => ({
          id: i.id,
          name: i.rawMaterial?.nameEnglish || "",
          rawmatrialId: i.rawMaterial.id || "",
          weight: i.weight || "",
          supplierRate: i.rawMaterial?.supplierRate || 0,
          unit: i.unit?.nameEnglish || "Gram",
          unitId: i.unit?.id || "",
          category: i.rawMaterial?.rawMaterialCat?.nameEnglish || "",
          checked: false,
          rate: i.rate,
        }));

        setItems(formatted);
      }
    } catch (error) {
      console.error("Error fetching recipe items:", error);
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  // Initial load when modal opens
  useEffect(() => {
    if (isOpen) {
      searchTextRef.current = "";
      allRecipesRef.current = [];
      recipePageRef.current = 1;
      loadingMoreRef.current = false;

      setSearchText("");
      setAllRecipes([]);
      setRecipeOptions([]);
      setSelectedRecipe(null);
      setItems([]);

      fetchRecipes({ page: 1, reset: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isCaptainRecipe]);

  const handleSearch = (value) => {
    searchTextRef.current = value;
    setSearchText(value);
    setRecipeOptions(
      value
        ? allRecipesRef.current.filter((r) =>
            r.label.toLowerCase().includes(value.toLowerCase()),
          )
        : allRecipesRef.current,
    );
  };

  const toggleSelectAll = (value) => {
    setItems(items.map((i) => ({ ...i, checked: value })));
  };

  const toggleItem = (id) => {
    setItems(
      items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
    );
  };

  const handleCopy = () => {
    const selectedItems = items.filter((i) => i.checked);
    onCopy(selectedItems);
    onClose(false);
  };

  const dropdownOptions = loadingMoreRecipes
    ? [
        ...recipeOptions,
        {
          label: (
            <div className="flex justify-center py-1">
              <Spin size="small" />
            </div>
          ),
          value: "__loading__",
          disabled: true,
        },
      ]
    : recipeOptions;

  return (
    <Modal
      title={isCaptainRecipe ? "Copy Captain Recipe" : "Copy Recipe"}
      width={820}
      open={isOpen}
      footer={null}
      onCancel={() => onClose(false)}
    >
      {loadingRecipes ? (
        <Spin className="mb-4" />
      ) : (
        <Select
          showSearch
          placeholder="Select recipe"
          value={selectedRecipe}
          searchValue={searchText}
          onSearch={handleSearch}
          filterOption={false}
          onChange={(v) => {
            if (v === "__loading__") return;
            setSelectedRecipe(v);
            fetchRecipeItems(v);
          }}
          className="!w-64 mb-4"
          options={dropdownOptions}
          notFoundContent={
            loadingRecipes ? (
              <Spin size="small" />
            ) : (
              <Empty description="No Recipes Found" />
            )
          }
        />
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[45px_1fr_150px_150px] items-center bg-primary text-white font-semibold py-2 px-3 text-[14px]">
          <Checkbox
            checked={items.length > 0 && items.every((i) => i.checked)}
            indeterminate={
              items.some((i) => i.checked) && !items.every((i) => i.checked)
            }
            onChange={(e) => toggleSelectAll(e.target.checked)}
          />
          <span className="uppercase">Name</span>
          <span className="uppercase text-center">Weight</span>
          <span className="uppercase text-center">Unit</span>
        </div>

        {loadingItems ? (
          <div className="py-8 flex justify-center">
            <Spin />
          </div>
        ) : items.length === 0 ? (
          <Empty description="No Items Found" className="py-8" />
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[45px_1fr_150px_150px] items-center py-3 px-3 border-b border-gray-200 bg-white"
            >
              <Checkbox
                checked={item.checked}
                onChange={() => toggleItem(item.id)}
              />
              <span className="text-[13px] uppercase">{item.name}</span>
              <Input
                className="!w-28 text-center"
                value={item.weight}
                onChange={(e) =>
                  setItems(
                    items.map((i) =>
                      i.id === item.id ? { ...i, weight: e.target.value } : i,
                    ),
                  )
                }
              />
              <Select
                value={item.unit}
                className="!w-32"
                onChange={(v) =>
                  setItems(
                    items.map((i) =>
                      i.id === item.id ? { ...i, unit: v } : i,
                    ),
                  )
                }
                options={unitOptions.map((u) => ({ label: u, value: u }))}
              />
            </div>
          ))
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-center gap-5 mt-6">
        <Button
          type="primary"
          className="!w-28 !font-semibold bg-primary"
          onClick={handleCopy}
          disabled={!items.some((i) => i.checked)}
        >
          Copy
        </Button>
        <Button
          danger
          className="!w-28 !font-semibold"
          onClick={() => onClose(false)}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default CopyRecipe;