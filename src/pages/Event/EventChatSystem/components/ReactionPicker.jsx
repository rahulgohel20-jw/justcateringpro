import React from "react";

export const EMOJI_MAP = {
  LIKE: "👍",
  LOVE: "❤️",
  LAUGH: "😂",
  CELEBRATE: "🎉",
  THUMBS_UP: "🙌",
  QUESTION: "❓",
};

export default function ReactionPicker({ onSelect, onClose }) {
  const reactions = [
    { type: "LIKE", emoji: "👍", label: "Like" },
    { type: "LOVE", emoji: "❤️", label: "Love" },
    { type: "LAUGH", emoji: "😂", label: "Laugh" },
    { type: "CELEBRATE", emoji: "🎉", label: "Celebrate" },
    { type: "THUMBS_UP", emoji: "🙌", label: "Applause" },
    { type: "QUESTION", emoji: "❓", label: "Question" },
  ];

  return (
    <div className="echat-reaction-picker" onClick={(e) => e.stopPropagation()}>
      {reactions.map((r) => (
        <button
          key={r.type}
          type="button"
          className="echat-reaction-btn"
          title={r.label}
          onClick={() => {
            onSelect(r.type);
            if (onClose) onClose();
          }}
        >
          {r.emoji}
        </button>
      ))}
    </div>
  );
}
