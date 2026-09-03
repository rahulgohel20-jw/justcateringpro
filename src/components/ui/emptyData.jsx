const EmptyData = () => {
  <div className="flex flex-col py-5">
    <div className="flex justify-center">
      <img
        src={toAbsoluteUrl("/media/illustrations/3.svg")}
        className="dark:hidden max-h-[100px]"
        alt="image"
      />
      <img
        src={toAbsoluteUrl("/media/illustrations/3-dark.svg")}
        className="light:hidden max-h-[100px]"
        alt="image"
      />
    </div>
    <p className="text-sm text-gray-400 font-light text-center py-3">
      Template is not available
    </p>
  </div>;
};
export default EmptyData;
