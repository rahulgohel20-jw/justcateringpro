import React, { useState, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { toAbsoluteUrl } from "@/utils/Assets";
import { Fragment } from "react";
import { Task } from "./Task";

const SortableItem = ({
  task,
  column, // ✅ receive column
  onViewLead,

  onEditLead, // ✅ make sure received
  onDeleteLead,
  onFollowUp,
  onLeadDropped, // ✅ receive onLeadDropped
  columns, // ✅ receive columns
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : "none",
    transition,
    touchAction: "manipulation",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="mb-2 w-full box-border max-w-[100%]"
    >
      <Task
        item={task}
        index={task.id}
        dropdown={true}
        onViewLead={onViewLead}
        onEditLead={onEditLead}
        onDeleteLead={onDeleteLead}
        onFollowUp={onFollowUp}
        onMoveLead={(lead) => {
          // ✅ properly use column and onLeadDropped from closure
          onLeadDropped?.({
            lead,
            fromColumn: column,
            toColumn: column, // user picks destination in modal
            pendingColumns: columns,
          });
        }}
      />
    </div>
  );
};

const SortableColumn = ({
  column,
  columns, // ✅ receive all columns
  onViewLead,
  onEditLead,
  onDeleteLead,
  onFollowUp,
  onLeadDropped, // ✅ receive onLeadDropped
}) => {
  const { setNodeRef, attributes, listeners } = useSortable({ id: column.id });

  const leadCount = column.children?.length || 0;

  const totalAmount = (column.children || []).reduce((sum, lead) => {
    const amt = Number(lead.estimateAmount || lead.amount || 0);
    return sum + amt;
  }, 0);
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="border rounded-lg bg-gray-100 w-64 transition-all duration-200 min-w-[450px] flex-shrink-0 flex flex-col"
      id={column.id}
      style={{ maxHeight: "calc(100vh - 150px)" }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b rounded-t-lg w-full py-2 px-3 bg-white flex-shrink-0">
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-gray-900">{column.name}</p>
          <small className="text-xs">
            {leadCount} leads{" "}
            <span className="font-semibold text-success">
              {/* ✅ Format with Indian locale */}
              &#8377;{Number(totalAmount).toLocaleString("en-IN")}/-
            </span>
          </small>
        </div>
      </div>

      {/* Cards List - scrollable */}
      <div className="overflow-y-auto flex-1 scrollbar-hide p-3">
        {column.children && column.children.length > 0 ? (
          <SortableContext
            items={column.children.map((task) => task.id)}
            strategy={rectSortingStrategy}
          >
            {column.children.map((task) => (
              <SortableItem
                key={`${column.id}_${task.id}`}
                task={task}
                column={column} // ✅ pass column
                columns={columns} // ✅ pass all columns
                onViewLead={onViewLead}
                onEditLead={onEditLead}
                onDeleteLead={onDeleteLead}
                onFollowUp={onFollowUp}
                onLeadDropped={onLeadDropped} // ✅ pass onLeadDropped
              />
            ))}
          </SortableContext>
        ) : (
          <div className="p-4 flex flex-col items-center">
            <img
              src={toAbsoluteUrl(`/images/empty_icn.svg`)}
              className="dark:hidden max-h-[120px]"
              alt=""
            />
            <img
              src={toAbsoluteUrl(`/images/empty_icn_dark.svg`)}
              className="light:hidden max-h-[120px]"
              alt=""
            />
            <p className="text-sm text-gray-900 opacity-50 mt-3">
              No data available!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const DragAndDrop = ({
  columns,
  setColumns,
  setDndActive,
  onViewLead,
  onEditLead,
  onDeleteLead,
  onFollowUp,
  onLeadDropped,
}) => {
  const [activeTask, setActiveTask] = useState(null);
  const dragSourceColumnRef = useRef(null);
  const snapshotColumnsRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
  );

  const findColumnByTaskId = (taskId) =>
    columns.find((col) => col.children?.some((task) => task.id === taskId));

  const findColumnById = (id) =>
    columns.find(
      (col) => col.id === id || col.children?.some((task) => task.id === id),
    );

  const handleDragStart = (event) => {
    const { active } = event;
    const sourceCol = findColumnByTaskId(active.id);
    dragSourceColumnRef.current = sourceCol ? { ...sourceCol } : null;
    snapshotColumnsRef.current = columns.map((col) => ({
      ...col,
      children: [...(col.children || [])],
    }));
    const task = columns
      .flatMap((col) => col.children || [])
      .find((task) => task.id === active.id);
    setActiveTask(task);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;
    const activeCol = findColumnByTaskId(active.id);
    if (!activeCol) return;
    const overCol = findColumnById(over.id);
    if (!overCol) return;
    const activeIndex = activeCol.children.findIndex((i) => i.id === active.id);
    const task = activeCol.children[activeIndex];

    if (activeCol.id === overCol.id) {
      const overIndex = overCol.children.findIndex((i) => i.id === over.id);
      if (overIndex !== -1 && activeIndex !== overIndex) {
        const newChildren = arrayMove(
          activeCol.children,
          activeIndex,
          overIndex,
        );
        setColumns(
          columns.map((col) =>
            col.id === activeCol.id ? { ...col, children: newChildren } : col,
          ),
        );
      }
      return;
    }

    const newActiveChildren = [...activeCol.children];
    newActiveChildren.splice(activeIndex, 1);
    const newOverChildren = [...overCol.children, task];
    setColumns(
      columns.map((col) => {
        if (col.id === activeCol.id)
          return { ...col, children: newActiveChildren };
        if (col.id === overCol.id) return { ...col, children: newOverChildren };
        return col;
      }),
    );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);
    setDndActive(false);

    if (!over) {
      if (snapshotColumnsRef.current) setColumns(snapshotColumnsRef.current);
      dragSourceColumnRef.current = null;
      snapshotColumnsRef.current = null;
      return;
    }

    const sourceColumn = dragSourceColumnRef.current;
    const destColumn = findColumnById(over.id);

    if (
      sourceColumn &&
      destColumn &&
      sourceColumn.id !== destColumn.id &&
      onLeadDropped
    ) {
      const droppedTask = columns
        .flatMap((col) => col.children || [])
        .find((t) => t.id === active.id);

      const pendingColumns = columns.map((col) => ({
        ...col,
        children: [...(col.children || [])],
      }));

      if (snapshotColumnsRef.current) setColumns(snapshotColumnsRef.current);

      onLeadDropped({
        lead: droppedTask,
        fromColumn: { id: sourceColumn.id, name: sourceColumn.name },
        toColumn: { id: destColumn.id, name: destColumn.name },
        pendingColumns,
      });
    }

    dragSourceColumnRef.current = null;
    snapshotColumnsRef.current = null;
  };

  const handleDragCancel = () => {
    if (snapshotColumnsRef.current) setColumns(snapshotColumnsRef.current);
    setActiveTask(null);
    setDndActive(false);
    dragSourceColumnRef.current = null;
    snapshotColumnsRef.current = null;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => {
        handleDragStart(event);
        setDndActive(true);
      }}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      onDragOver={handleDragOver}
    >
      <div className="flex gap-4 overflow-x-auto">
        {columns.map((column) => (
          <SortableColumn
            key={column.id}
            column={column}
            columns={columns} // ✅ pass all columns
            onViewLead={onViewLead}
            onEditLead={onEditLead}
            onDeleteLead={onDeleteLead}
            onFollowUp={onFollowUp}
            onLeadDropped={onLeadDropped} // ✅ pass onLeadDropped
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div
            className="border rounded p-2 bg-gray-100"
            style={{
              width: "90%",
              transform: "none",
              opacity: 0.9,
              zIndex: 1000,
              pointerEvents: "none",
            }}
          >
            <Task item={activeTask} index={0} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
