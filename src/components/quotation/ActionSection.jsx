// ActionsSection.jsx

const ActionsSection = () => {
  return (
<div className="actions bg-white p-4 rounded-xl mt-4 border border-gray-200">
      <h3 className="font-semibold mb-2">Actions</h3>
  <div className="flex gap-2 flex-wrap">
    <button className="btn border border-gray-300 rounded-md px-3 py-2">
      <i className="ki-filled ki-copy"></i> Clone
    </button>
    <button className="btn border border-gray-300 rounded-md px-3 py-2">
      <i className="ki-filled ki-grid"></i> Layout
    </button>
    <button className="btn border border-gray-300 rounded-md px-3 py-2">
      <i className="ki-filled ki-barcode"></i> Presentation
    </button>
    <button className="btn border border-green-400 bg-green-100 text-green-700 rounded-md px-3 py-2">
      <i className="ki-filled ki-like"></i> Approval
    </button>
    <button className="btn border border-gray-300 rounded-md px-3 py-2">
      Save
    </button>
  </div>
    {/* <div>
<label className="block text-sm font-medium text-gray-700 mt-4 mb-2">Function</label>
      <div className="flex gap-3">

        <select className="select w-1/3">
          <option value="0">Select Action</option>
          <option value="1">lunch</option>
          <option value="2">Dinner</option>
          <option value="3">Breakfast</option>
        </select>
      
        </div>
    </div> */}
    </div>
  );
};

export default ActionsSection;
