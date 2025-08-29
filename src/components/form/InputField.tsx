// src/components/form/InputField.tsx
"use client";

import React, { useState, forwardRef } from "react";

interface InputFieldProps {
  id?: string;
  label?: string;
  type?: string;
  inputMode?:
    | "text"
    | "search"
    | "email"
    | "tel"
    | "url"
    | "none"
    | "numeric"
    | "decimal";
  placeholder?: string;
  className?: string;
  noLabel?: boolean;
  error?: string;

  /** Controlled value (omit for uncontrolled) */
  value?: string;
  /** Uncontrolled default value */
  defaultValue?: string;

  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;

  readOnly?: boolean;
  maxLength?: number;
  name?: string;
  autoComplete?: string;

  /** If true, do not pass `value` down (prevents React from clobbering Chrome autofill) */
  uncontrolled?: boolean;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField(
    {
      id,
      label,
      type = "text",
      inputMode = "text",
      placeholder,
      className = "",
      noLabel = false,
      error,
      value,
      defaultValue,
      onChange,
      onInput,
      onFocus,
      onBlur,
      readOnly = false,
      maxLength,
      name,
      autoComplete,
      uncontrolled = false,
    },
    ref
  ) {
    const [touched, setTouched] = useState(false);

    const required = !!label && label.includes("*");
    const isControlled = !uncontrolled && value !== undefined;
    const isEmpty = isControlled ? !value || value.trim() === "" : false;

    const localError =
      error ||
      (isControlled && required && touched && isEmpty
        ? `${label?.replace("*", "").trim()} is required`
        : undefined);

    return (
      <div className="w-full">
        {!noLabel && (
          <label
            className="block text-xs font-medium leading-[100%]"
            htmlFor={id}
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={id}
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          {...(uncontrolled
            ? { defaultValue }
            : value !== undefined
            ? { value }
            : {})}
          onChange={onChange}
          onInput={onInput}
          onFocus={onFocus}
          onBlur={(e) => {
            setTouched(true);
            onBlur?.(e);
          }}
          readOnly={readOnly}
          maxLength={maxLength}
          name={name}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={`w-full mt-2 px-4 py-[10px] autofill:bg-surface rounded-full text-sm font-medium leading-[100%] text-white !placeholder-[#8C8CA6]
  bg-[var(--surface-l3)] border-1 
  ${
    localError
      ? "border-red-500 focus:border-[var(--color-blue)]"
      : "border-transparent focus:border-[var(--color-blue)]"
  }
  focus:outline-none focus:ring-0
  ${className}`}
        />

        {localError && (
          <p className="mt-1 text-[10px] text-red-500">{localError}</p>
        )}
      </div>
    );
  }
);

export default InputField;
