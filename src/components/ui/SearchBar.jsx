import { Search } from 'lucide-react';

export function SearchBar({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <label className="relative block w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border-input bg-white py-3 pl-12 pr-4 text-sm text-text-primary outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/20"
      />
    </label>
  );
}

export default SearchBar;
