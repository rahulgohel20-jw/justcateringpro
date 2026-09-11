import { useRef, useEffect } from "react";

export const trimPayloadWhitespace = (value = "") =>
  String(value)
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/<b>\s+/gi, "<b>")
    .replace(/\s+<\/b>/gi, "</b>")
    .replace(/<\/b>\s+/gi, "</b>")
    .replace(/[ \t]{2,}/g, " ");

// Hard whitelist: only bare <b>, </b>, and <br> ever survive. Now exported
// so callers loading legacy saved values (which may predate this lockdown)
// can run the same sanitizer before ever displaying/re-saving them.
export const sanitizeToAllowedTags = (html = "") =>
  html.replace(/<(\/?)(\w+)([^>]*)>/gi, (match, closingSlash, tag) => {
    const lower = tag.toLowerCase();
    if (lower === "b") return closingSlash ? "</b>" : "<b>";
    if (lower === "br") return "<br>";
    return "";
  });

// Now sanitizes too — previously this only handled whitespace/newlines,
// which meant a legacy value like "<i>text</i>" loaded straight into the
// editor's visible DOM untouched, since this is what sets ref.current.innerHTML.
export const payloadToDisplayHtml = (text = "") =>
  sanitizeToAllowedTags(trimPayloadWhitespace(text)).replace(/\n/g, "<br>");
// editable div's raw innerHTML -> payload (only <b> survives, everything else -> \n or plain text)
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
  return trimPayloadWhitespace(doc.body.innerHTML);
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
};

const handleKeyDown = (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
    e.preventDefault();
    document.execCommand("bold", false, null);
    emitChange();
    return;
  }

  // ← ADD THIS BLOCK: block native italic/underline shortcuts entirely,
  // so the browser never inserts <i>/<u> into the DOM in the first place.
  // Only bold is an allowed style in this editor.
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

  return (
    <div
      ref={ref}
      name={name}
      contentEditable
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={`${minHeight} w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:ring-2 focus:ring-primary bg-white empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none ${className}`}
      onInput={emitChange}
    />
  );
}
