import SpeechToText from "@/components/form-inputs/SpeechToText";

const InputToTextLang = ({
  label,
  name,
  value,
  onChange,
  required,
  lang,
  className,
  error,
}) => {
  // FIX: Convert placeholder safely to a string
  const safePlaceholder =
    typeof label === "string"
      ? label
      : label?.props?.defaultMessage
        ? label.props.defaultMessage
        : "";

  return (
    <div className="select__grp">
      <label className="block text-gray-600 mb-1">
        {label}
        {required && (
          <span className="mandatory ms-0.5 text-base text-red-500 font-medium ml-1">
            *
          </span>
        )}
      </label>

      <SpeechToText
        type="text"
        name={name}
        placeholder={safePlaceholder} // ← FIX APPLIED HERE
        value={value}
        className={className}
        onChange={onChange}
        required={required}
        lang={lang}
      />

      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
};

export default InputToTextLang;
