const CardList = ({ leftContent, rightContent }) => {
  return (
    <div className="py-2.5 border-b last:border-0">
      <div className="flex justify-between">
        <div className="text-sm text-gray-900">{leftContent}</div>
        <div className="flex items-center gap-3">{rightContent}</div>
      </div>
    </div>
  );
};
export default CardList;
