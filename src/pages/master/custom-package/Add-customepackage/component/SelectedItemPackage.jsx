import { Eye, EyeOff, Trash2, GripVertical, Package, Tag } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function SelectedItemPackage({
  selectedItems,
  onRemoveItem,
  onUpdateRate,
  categoryMap = {},
  onReorder,
  categoryItemCounts,
    categoryReportNames = {},
  onOpenNotes,
  categoryOrder: externalCategoryOrder,
  onReorderCategories,
  onOpenCategoryNotes,
  selectedCategories = new Set(),
  onRemoveCategory,
  categoryNicknames = {},
  onOpenCategoryNickname,
  onOpenItemNickname,
}) {
  const [showRates, setShowRates] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [categoryOrder, setCategoryOrder] = useState([]);

  // Group selectedItems by category
  const groupedItems = useMemo(() => {
    return selectedItems.reduce((acc, item, index) => {
      const catId = String(item.category);
      if (!acc[catId]) acc[catId] = [];
      acc[catId].push({ ...item, currentIndex: index });
      return acc;
    }, {});
  }, [selectedItems]);

  // Merge: categories from selectedItems + explicitly selected (empty) categories
  const allCategoryIds = useMemo(() => {
    const fromItems = new Set(selectedItems.map((i) => String(i.category)));
    const merged = new Set([...selectedCategories].map(String));
    fromItems.forEach((id) => merged.add(id));
    return [...merged];
  }, [selectedItems, selectedCategories]);

  // Sync internal categoryOrder
  useEffect(() => {
    if (categoryOrder.length === 0 && allCategoryIds.length > 0) {
      setCategoryOrder(allCategoryIds);
      return;
    }
    const newOnes = allCategoryIds.filter((id) => !categoryOrder.includes(id));
    if (newOnes.length > 0) setCategoryOrder((prev) => [...prev, ...newOnes]);
    const valid = categoryOrder.filter((id) => allCategoryIds.includes(id));
    if (valid.length !== categoryOrder.length) setCategoryOrder(valid);
  }, [allCategoryIds]);

  // Auto-expand new categories
  useEffect(() => {
    setExpandedCategories((prev) => {
      const next = { ...prev };
      allCategoryIds.forEach((id) => { if (next[id] === undefined) next[id] = true; });
      return next;
    });
  }, [allCategoryIds]);

  const total = selectedItems.reduce((sum, item) => sum + (item.rate || 0), 0);
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const handleDragEnd = (result) => {
    const { destination, source, type } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

   if (type === "CATEGORY") {
  const newCategoryOrder = Array.from(categoryOrder);
  const [movedCategory] = newCategoryOrder.splice(source.index, 1);
  newCategoryOrder.splice(destination.index, 0, movedCategory);

  setCategoryOrder(newCategoryOrder);

  // IMPORTANT
  onReorderCategories?.(newCategoryOrder);

  const reorderedItems = [];
  newCategoryOrder.forEach((catId) => {
    (groupedItems[catId] || []).forEach((item) => {
      const { currentIndex, ...cleanItem } = item;
      reorderedItems.push(cleanItem);
    });
  });

  onReorder(reorderedItems);
  return;
} 

    if (type === "ITEM") {
      const sourceCatId = source.droppableId.replace("cat-", "");
      const destCatId = destination.droppableId.replace("cat-", "");
      const newGroupedItems = {};
      Object.keys(groupedItems).forEach((catId) => { newGroupedItems[catId] = [...groupedItems[catId]]; });
      const [draggedItem] = newGroupedItems[sourceCatId].splice(source.index, 1);
      if (sourceCatId === destCatId) {
        newGroupedItems[sourceCatId].splice(destination.index, 0, draggedItem);
      } else {
        const updatedItem = { ...draggedItem, category: destCatId };
        if (!newGroupedItems[destCatId]) newGroupedItems[destCatId] = [];
        newGroupedItems[destCatId].splice(destination.index, 0, updatedItem);
      }
      const reorderedItems = [];
      categoryOrder.forEach((catId) => {
        (newGroupedItems[catId] || []).forEach((item) => {
          const { currentIndex, ...cleanItem } = item;
          reorderedItems.push(cleanItem);
        });
      });
      onReorder(reorderedItems);
    }
  };

  const isEmpty = categoryOrder.length === 0;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-gray-100 bg-white flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-gray-700">
            Selected
            {selectedItems.length > 0 && (
              <span className="ml-1.5 text-xs bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full">
                {selectedItems.length}
              </span>
            )}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowRates(!showRates)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500"
          title={showRates ? "Hide rates" : "Show rates"}
        >
          {showRates
            ? <Eye className="w-4 h-4 text-primary" />
            : <EyeOff className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <Package className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No items yet</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Check a category on the left,<br />then click items to add them
            </p>
          </div>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories" type="CATEGORY">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="p-2 space-y-2"
              >
                {categoryOrder.map((catId, catIndex) => {
                  const items = groupedItems[catId] || [];
                  const catName =
                    categoryMap[catId] ||
                    items[0]?.menuCategory?.nameEnglish ||
                    "Uncategorized";
                  const countEntry = categoryItemCounts[catId];
                  const count =
                    typeof countEntry === "object" ? countEntry?.anyItem : countEntry || null;
                  const isExpanded = expandedCategories[catId] ?? true;
                  const catNickname = categoryNicknames[catId];
                 const catReport = categoryReportNames[catId];
const displayNickname = catNickname?.nickNameEnglish || catReport?.english || "";
const hasCatNickname = !!displayNickname;

                  return (
                    <Draggable
                      key={`cat-${catId}`}
                      draggableId={`category-${catId}`}
                      index={catIndex}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`rounded-xl border transition-all
                            ${snapshot.isDragging
                              ? "shadow-xl ring-2 ring-primary/40 opacity-95 bg-white"
                              : "bg-white border-gray-150 shadow-sm"
                            }`}
                        >
                          {/* Category header */}
                          <div
                            {...provided.dragHandleProps}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-t-xl bg-gray-50 border-b border-gray-100 cursor-move hover:bg-gray-100 transition-colors"
                          >
                            <GripVertical className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide truncate">
                                  {catName}
                                </span>
                                {hasCatNickname && (
                                  <span className="text-[10px] font-semibold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full leading-none flex-shrink-0 truncate max-w-[100px]">
                                    {displayNickname}
                                  </span>
                                )}
                                  {count > 0 && (
                                  <span className="text-[10px] font-semibold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full leading-none flex-shrink-0">
                                    Any {count}
                                  </span>
                                )}
                                {items.length > 0 && (
                                  <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full leading-none flex-shrink-0">
                                    {items.length} {items.length === 1 ? "item" : "items"}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              {/* Nick name */}
                              <button
                                onClick={(e) => { e.stopPropagation(); onOpenCategoryNickname?.(catId); }}
                                onMouseDown={(e) => e.stopPropagation()}
                                title={hasCatNickname ? "Edit nick name" : "Add nick name"}
                                className={`p-1 rounded-lg transition-colors
                                  ${hasCatNickname
                                    ? "text-purple-500 hover:bg-purple-100"
                                    : "text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                                  }`}
                              >
                                <Tag className="w-3.5 h-3.5" />
                              </button>

                              {/* Remove category */}
                              <button
                                onClick={(e) => { e.stopPropagation(); onRemoveCategory?.(catId); }}
                                title="Remove category"
                                className="p-1 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Expand/Collapse */}
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleCategory(catId); }}
                                className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-400"
                              >
                                <span className="text-base font-bold leading-none">
                                  {isExpanded ? "−" : "+"}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Items */}
                          {isExpanded && (
                            <Droppable droppableId={`cat-${catId}`} type="ITEM">
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className={`min-h-[44px] rounded-b-xl transition-colors
                                    ${snapshot.isDraggingOver ? "bg-primary/5" : ""}`}
                                >
                                  {/* Empty drop zone */}
                                  {items.length === 0 && !snapshot.isDraggingOver && (
                                    <div className="flex items-center justify-center h-11 text-xs text-gray-400 italic">
                                      Drop items here or select from menu
                                    </div>
                                  )}

                                  {items.map((item, itemIndex) => {
                                    const hasItemNickname = !!item.itemNickNameEnglish;
                                    return (
                                    <Draggable
                                      key={`item-${item.id}-${item.currentIndex}`}
                                      draggableId={`item-${item.id}-${item.currentIndex}`}
                                      index={itemIndex}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`flex items-center gap-2.5 px-3 py-2 border-b border-gray-50 last:border-b-0 cursor-move transition-all
                                            ${snapshot.isDragging
                                              ? "bg-white shadow-lg ring-1 ring-primary/30 rounded-lg"
                                              : "hover:bg-gray-50"
                                            }`}
                                        >
                                          <GripVertical className="w-3 h-3 text-gray-300 flex-shrink-0" />

                                          {/* Item image */}
                                          <div className="w-9 h-9 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                            {item.image ? (
                                              <img src={item.image} alt={item.nameEnglish || item.name} className="w-full h-full object-cover" />
                                            ) : (
                                              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                                <span className="text-[9px] text-gray-500 font-bold">
                                                  {(item.nameEnglish || "").slice(0, 2).toUpperCase()}
                                                </span>
                                              </div>
                                            )}
                                          </div>

                                          {/* Item info */}
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 truncate leading-tight">
                                              {item.nameEnglish || item.name}
                                            </p>
                                            {hasItemNickname && (
                                              <p className="text-[10px] text-purple-500 truncate leading-tight mt-0.5">
                                                {item.itemNickNameEnglish}
                                              </p>
                                            )}

                                            {showRates && (
                                              <div className="flex items-center gap-1.5 mt-1">
                                                <span className="text-[10px] text-gray-400">₹</span>
                                                <input
                                                  type="tel"
                                                  value={item.rate || 0}
                                                  onChange={(e) => onUpdateRate(item.currentIndex, parseInt(e.target.value) || 0)}
                                                  onClick={(e) => e.stopPropagation()}
                                                  onMouseDown={(e) => e.stopPropagation()}
                                                  className="w-16 px-1.5 py-0.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary/40"
                                                />
                                              </div>
                                            )}
                                          </div>

                                          {/* Nick name */}
                                          <button
                                            onClick={(e) => { e.stopPropagation(); onOpenItemNickname?.(item.currentIndex); }}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            title={hasItemNickname ? "Edit nick name" : "Add nick name"}
                                            className={`p-1 rounded-lg flex-shrink-0 transition-colors
                                              ${hasItemNickname
                                                ? "text-purple-500 hover:bg-purple-100"
                                                : "text-gray-300 hover:bg-gray-100 hover:text-gray-500"
                                              }`}
                                          >
                                            <Tag className="w-3.5 h-3.5" />
                                          </button>

                                          {/* Remove */}
                                          <button
                                            onClick={(e) => { e.stopPropagation(); onRemoveItem(item.currentIndex); }}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            className="p-1 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0 transition-colors"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      )}
                                    </Draggable>
                                    );
                                  })}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Footer totals */}
      {!isEmpty && (
        <div className="border-t border-gray-100 px-3 py-2.5 bg-white flex items-center justify-between">
          <span className="text-xs text-gray-500">
            <span className="font-semibold text-gray-800">{categoryOrder.length}</span> categories ·{" "}
            <span className="font-semibold text-gray-800">{selectedItems.length}</span> items
          </span>
          {showRates && (
            <span className="text-xs font-semibold text-primary">
              ₹ {total.toFixed(2)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}