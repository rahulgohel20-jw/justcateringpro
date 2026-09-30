export const resolveOptionValue = (value, options = [], empty = undefined) => {
  if (value === "" || value == null || !options.length) return empty;
  const match = options.find((o) => String(o.value) === String(value));
  return match ? match.value : empty;
};