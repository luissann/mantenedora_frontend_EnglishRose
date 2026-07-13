export function Toggle({ label, value, onChange, trueLabel = 'Activo', falseLabel = 'Inactivo' }) {
  const options = [
    { value: true, label: trueLabel },
    { value: false, label: falseLabel },
  ];

  return (
    <div>
      {label && <p className="mb-2 text-sm text-text-secondary">{label}</p>}
      <div className="inline-flex rounded-2xl border border-border-input bg-white p-1">
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              value === option.value
                ? 'bg-rose-light text-rose'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Toggle;
