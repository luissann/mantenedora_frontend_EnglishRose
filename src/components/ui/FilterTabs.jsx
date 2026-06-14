export function FilterTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? 'bg-rose text-white' : 'border-border bg-white text-text-secondary hover:bg-rose-light'}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default FilterTabs;
