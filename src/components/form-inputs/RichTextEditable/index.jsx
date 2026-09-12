import { useRef, useEffect, useState } from "react";

export const trimPayloadWhitespace = (value = "") =>
  String(value)
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/<b>\s+/gi, " <b>")
    .replace(/\s+<\/b>/gi, "</b> ")
    .replace(/<b>\s*<\/b>/gi, "")
    .replace(/[ \t]{2,}/g, " ");

export const sanitizeToAllowedTags = (html = "") =>
  html.replace(/<(\/?)(\w+)([^>]*)>/gi, (match, closingSlash, tag) => {
    const lower = tag.toLowerCase();
    if (lower === "b") return closingSlash ? "</b>" : "<b>";
    if (lower === "br") return "<br>";
    return "";
  });

export const payloadToDisplayHtml = (text = "") =>
  sanitizeToAllowedTags(trimPayloadWhitespace(text)).replace(/\n/g, "<br>");

export const displayHtmlToPayload = (html) => {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  const blockTags = new Set(["div", "p", "li"]);

  const walk = (node) => {
    if (node.nodeType === 8) {
      node.parentNode?.removeChild(node);
      return;
    }

    Array.from(node.childNodes).forEach(walk);
    if (node.nodeType !== 1) return;

    const tag = node.tagName.toLowerCase();
    const parent = node.parentNode;

    if (tag === "br") {
      node.replaceWith(document.createTextNode("\n"));
      return;
    }

    const isBold =
      tag === "b" ||
      tag === "strong" ||
      node.style?.fontWeight === "bold" ||
      Number(node.style?.fontWeight) >= 600;

    if (isBold) {
      const b = document.createElement("b");
      while (node.firstChild) b.appendChild(node.firstChild);
      node.replaceWith(b);
      return;
    }

    if (blockTags.has(tag) && node.nextSibling) {
      parent.insertBefore(document.createTextNode("\n"), node.nextSibling);
    }
    while (node.firstChild) parent.insertBefore(node.firstChild, node);
    parent.removeChild(node);
  };

  Array.from(doc.body.childNodes).forEach(walk);
  return trimPayloadWhitespace(doc.body.innerHTML).replace(/&amp;/gi, "&");
};

export default function RichTextEditable({
  name,
  placeholder,
  value,
  onChange,
  className = "",
  minHeight = "min-h-[42px]",
}) {
  const ref = useRef(null);
  const isInternalChange = useRef(false);
  // const [isBold, setIsBold] = useState(false);
  // const [isFocused, setIsFocused] = useState(false);
  // const [toast, setToast] = useState(null); // { message: string, type: 'active' | 'inactive' }
  // const toastTimerRef = useRef(null);

  // const showToast = (message, type = "active") => {
  //   if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  //   setToast({ message, type });
  //   toastTimerRef.current = setTimeout(() => {
  //     setToast(null);
  //   }, 2200);
  // };

  // useEffect(() => {
  //   return () => {
  //     if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  //   };
  // }, []);

 const updateBoldState = () => {
  if (!ref.current) return false;
  try {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !ref.current.contains(sel.anchorNode)) {
      return false;
    }
    return Boolean(document.queryCommandState("bold"));
  } catch {
    return false;
  }
};

  const toggleBold = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (ref.current) {
      ref.current.focus();
    }
    document.execCommand("bold", false, null);
    emitChange();
    const active = updateBoldState();
    // showToast(active ? "Bold Active" : "Bold Inactive", active ? "active" : "inactive");
  };

  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (ref.current && document.activeElement === ref.current) {
      return;
    }
    if (ref.current) {
      const display = payloadToDisplayHtml(value || "");
      if (ref.current.innerHTML !== display) {
        ref.current.innerHTML = display;
      }
    }
  }, [value]);

  const emitChange = () => {
    isInternalChange.current = true;
    if (onChange) {
      onChange(displayHtmlToPayload(ref.current.innerHTML));
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const plain = e.clipboardData.getData("text/plain");

  if (html) {
    const cleanPayload = displayHtmlToPayload(html)
      .replace(/\n{2,}/g, "\n")   // ← collapse runs of blank lines from pasted blocks
      .replace(/^\n+|\n+$/g, ""); // ← drop leading/trailing blank lines too
    document.execCommand("insertHTML", false, payloadToDisplayHtml(cleanPayload));
  } else {
    document.execCommand("insertText", false, plain);
  }
  emitChange();
  updateBoldState();
};

 const applyBoldPerLine = () => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);

  if (range.collapsed) {
    document.execCommand("bold", false, null);
    emitChange();
    updateBoldState();
    return;
  }

  const allBold = document.queryCommandState("bold");

  const fragment = range.cloneContents();
  const container = document.createElement("div");
  container.appendChild(fragment);

  const lines = container.innerHTML.split(/<br\s*\/?>/i);

  const processedLines = lines.map((lineHtml) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = lineHtml;
    if (!(tmp.textContent || "").trim()) return lineHtml;

    const stripped = lineHtml.replace(/<\/?b>/gi, "");
    return allBold ? stripped : `<b>${stripped}</b>`;
  });

  const newHtml = processedLines.join("<br>");

  range.deleteContents();

  // deleteContents() can leave a now-empty <b>/<strong> wrapper behind at the
  // collapsed insertion point (e.g. after removing all the text that was
  // entirely inside a single <b>...</b>). If we insert into that spot as-is,
  // the new (unbolded) content lands right back inside the empty tag,
  // silently re-bolding it. Walk up and remove any empty formatting
  // ancestors before inserting, so the new content lands as a plain sibling.
  let node = range.startContainer;
while (node && node !== ref.current) {
  const parent = node.parentNode;
  if (!parent) break;
  if (
    node.nodeType === 1 &&
    (node.tagName === "B" || node.tagName === "STRONG") &&
    (node.textContent || "").length === 0
  ) {
    const idx = Array.from(parent.childNodes).indexOf(node);
    parent.removeChild(node);
    range.setStart(parent, idx);
    range.setEnd(parent, idx);
    node = parent;
  } else {
    node = parent;
  }
}

  const wrapper = document.createElement("div");
  wrapper.innerHTML = newHtml;
  const frag = document.createDocumentFragment();
  let lastNode = null;
  while (wrapper.firstChild) {
    lastNode = wrapper.firstChild;
    frag.appendChild(lastNode);
  }
  range.insertNode(frag);

  if (lastNode) {
    const newRange = document.createRange();
    newRange.setStartAfter(lastNode);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }

  emitChange();
  const active = updateBoldState();
  showToast(active ? "Bold Active" : "Bold Inactive", active ? "active" : "inactive");
};

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
      e.preventDefault();
      applyBoldPerLine();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === "i" || e.key === "I" || e.key === "u" || e.key === "U")) {
      e.preventDefault();
      return;
    }

    if (e.key !== "Enter") return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const preRange = range.cloneRange();
    preRange.selectNodeContents(ref.current);
    preRange.setEnd(range.startContainer, range.startOffset);

    const tempDiv = document.createElement("div");
    tempDiv.appendChild(preRange.cloneContents());
    tempDiv.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
    tempDiv.querySelectorAll("div, p, li").forEach((block) => {
      if (block.nextSibling) block.insertAdjacentText("afterend", "\n");
    });
    const textBefore = tempDiv.textContent || tempDiv.innerText || "";

    const lineStart = textBefore.lastIndexOf("\n") + 1;
    const currentLine = textBefore.slice(lineStart);

    const bulletMatch = currentLine.match(/^(\s*)(•|·|▪|-|\*)(\s*)/);
    if (!bulletMatch) return;

    e.preventDefault();

    const indent = bulletMatch[1];
    const bulletSymbol = bulletMatch[2];
    const spacing = bulletMatch[3];
    const bulletPrefix = `${indent}${bulletSymbol}${spacing || " "}`;

    if (currentLine.trim() === bulletSymbol) {
      try {
        const selRange = sel.getRangeAt(0);
        if (selRange.startContainer && selRange.startContainer.nodeType === Node.TEXT_NODE) {
          const offset = selRange.startOffset;
          const deleteLength = currentLine.length;
          const deleteRange = document.createRange();
          deleteRange.setStart(selRange.startContainer, Math.max(0, offset - deleteLength));
          deleteRange.setEnd(selRange.startContainer, offset);
          deleteRange.deleteContents();
        } else {
          selRange.deleteContents();
        }
      } catch (err) {
        console.error("Error removing bullet:", err);
      }

      emitChange();
      return;
    }

    range.deleteContents();
    const fragment = document.createDocumentFragment();
    const lineBreak = document.createElement("br");
    const bulletText = document.createTextNode(bulletPrefix);
    fragment.append(lineBreak, bulletText);
    range.insertNode(fragment);

    const cursor = document.createRange();
    cursor.setStart(bulletText, bulletText.length);
    cursor.collapse(true);
    sel.removeAllRanges();
    sel.addRange(cursor);

    emitChange();
  };

  // const badgePosition = "bottom-full mb-1.5 right-0";

  return (
    <div className={`relative ${className}`}>
      {/* Toast / Status indicator cleanly positioned outside the input box on top-right */}
      {/* {toast && (
        <div
          className={`absolute ${badgePosition} z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold shadow-xs pointer-events-none select-none transition-all duration-200 ${
            toast.type === "active"
              ? "bg-primary/10 text-primary border border-primary/30"
              : "bg-gray-100 text-gray-500 border border-gray-300"
          }`}
        >
          <span className={`font-black text-[11px] ${toast.type === "active" ? "text-primary" : "text-gray-400 line-through"}`}>
            B
          </span>
          <span>{toast.message}</span>
        </div>
      )} */}

      {/* Persistent indicator badge when Bold is Active (if no toast is showing) */}
      {/* {!toast && isBold && isFocused && (
        <button
          type="button"
          onMouseDown={toggleBold}
          title="Bold is active. Click or press Ctrl+B to turn off."
          className={`absolute ${badgePosition} z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/30 cursor-pointer select-none hover:bg-primary/20 transition-all`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-black text-[11px]">B</span>
          <span>Bold Active</span>
        </button>
      )} */}

      <div
        ref={ref}
        name={name}
        contentEditable
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={() => {
  setTimeout(updateBoldState, 20);
}}
        onKeyUp={updateBoldState}
        onMouseUp={updateBoldState}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className={`${minHeight} w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:ring-2 focus:ring-primary bg-white whitespace-pre-wrap break-words empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none`}
        onInput={emitChange}
      />
    </div>
  );
}