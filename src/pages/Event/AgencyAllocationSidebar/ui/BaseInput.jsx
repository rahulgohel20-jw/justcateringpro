export default function BaseInput(props) {
  return (
    <input
      {...props}
      className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500/40 disabled:bg-gray-100"
    />
  );
}
