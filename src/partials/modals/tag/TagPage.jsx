import { useState } from "react";

const TagPage = ({ onClose, tags, setTags }) => {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim() === "") return;
    if (tags.find(tag => tag.label === newTag)) return; // avoid duplicates

    setTags([...tags, { label: newTag, color: "blue" }]);
    setNewTag("");
  };

  const removeTag = (label) => {
    setTags(tags.filter(tag => tag.label !== label));
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Tag Manager</h2>

      {/* Tag List */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, index) => (
          <span
            key={index}
            className={`flex items-center text-white text-xs rounded-full px-3 py-1 ${
              tag.color === "green"
                ? "bg-green-500"
                : tag.color === "red"
                ? "bg-red-500"
                : "bg-blue-500"
            }`}
          >
            {tag.label}
            <button onClick={() => removeTag(tag.label)} className="ml-2 text-white">×</button>
          </span>
        ))}
      </div>

      {/* Add New Tag */}
      <div className="flex items-center gap-2 mb-4">
        <input
          className="input border p-2 rounded w-full"
          placeholder="Add new tag..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
        />
        <button className="btn btn-primary text-sm" onClick={addTag}>
          Add
        </button>
      </div>

      <button className="btn btn-light" onClick={onClose}>
        Close
      </button>
    </div>
  );
};

export default TagPage;
