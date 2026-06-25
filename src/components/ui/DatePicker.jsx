import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import DatePickerLib from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export function DatePicker({ value, onChange, label, error, placeholder = 'DD/MM/YYYY' }) {
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);

  useEffect(() => {
    setSelectedDate(value ? new Date(value) : null);
  }, [value]);

  const handleChange = (date) => {
    setSelectedDate(date);
    onChange(date);
  };

  const DatePickerComponent = DatePickerLib.default || DatePickerLib;

  return (
    <div className="space-y-2">
      {label && <span className="text-sm text-text-secondary">{label}</span>}
      <div className="relative">
        <DatePickerComponent
          selected={selectedDate}
          onChange={handleChange}
          dateFormat="dd/MM/yyyy"
          className={`w-full rounded-2xl border border-border-input bg-white px-4 py-3 pr-12 text-sm text-text-primary outline-none focus:border-rose focus:ring-2 focus:ring-rose/20`}
          placeholderText={placeholder}
        />
        <Calendar className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default DatePicker;
