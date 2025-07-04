interface InputFieldProps {
  label?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  noLabel?: boolean;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function InputField({
  label,
  type = "text",
  placeholder,
  className = "",
  noLabel = false,
  error,
  value,
  onChange,
}: InputFieldProps) {
  return (
    <div className="w-full">
      {!noLabel && (
        <label className="text-sm font-medium leading-[100%] block">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full mt-2 px-4 py-[10px] rounded-full text-sm font-medium leading-[100%] text-white !placeholder-[#8C8CA6]
           bg-[var(--surface-l3)] border-[1.5px] border-transparent focus:border-[var(--color-blue)] focus:outline-none focus:ring-0 ${className} ${
          error ? "border border-red-500" : ""
        }`}
      />
      {error && <p className="text-red-500 text-[10px] mt-1">{error}</p>}
    </div>
  );
}
