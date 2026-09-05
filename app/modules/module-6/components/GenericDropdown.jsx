"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Reusable dropdown component for Module 6.
 * Used by both Wilayah (Provinsi) and Komponen (Provinsi + Kabupaten) tabs.
 */
export default function GenericDropdown({ id, value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find((p) => p.value === value);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="m6-dropdown" ref={ref}>
      <button
        className="m6-dropdown__button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        id={id}
      >
        <span>{selected?.label ?? placeholder}</span>
        <span className={`m6-dropdown__icon ${open ? "m6-dropdown__icon--open" : ""}`}>
          ▼
        </span>
      </button>

      {open && (
        <div className="m6-dropdown__menu" role="listbox">
          {options.map((p) => (
            <button
              key={p.value}
              className={`m6-dropdown__item ${
                p.value === value ? "m6-dropdown__item--active" : ""
              }`}
              role="option"
              aria-selected={p.value === value}
              onClick={() => {
                onChange(p.value);
                setOpen(false);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
