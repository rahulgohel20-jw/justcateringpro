import { useEffect, useRef, useState } from "react";
import { getHeight } from "@/utils";
import { useViewport } from "@/hooks";
import { DropdownNotificationsItem1 } from "./items";

const DropdownNotificationsAll = () => {
  const footerRef = useRef(null);
  const [listHeight, setListHeight] = useState(0);
  const [viewportHeight] = useViewport();
  const offset = 190;

  useEffect(() => {
    if (footerRef.current) {
      const footerHeight = getHeight(footerRef.current);
      const availableHeight = viewportHeight - footerHeight - offset;
      setListHeight(availableHeight);
    }
  }, [viewportHeight]);

  return (
    <div className="grow flex flex-col">
      <div
        className="scrollable-y-auto flex flex-col"
        style={{ maxHeight: `${listHeight}px` }}
      >
        {/* ── No extra wrapper — item owns its own tabs + list ── */}
        <DropdownNotificationsItem1 />
      </div>
      <div ref={footerRef} />
    </div>
  );
};

export { DropdownNotificationsAll };
