import { formatDateLong } from '../../utils/formatters';

export function PageHeader({ title }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm border border-border">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-playfair text-text-primary">{title}</h1>
        <span className="text-sm text-text-secondary">{formatDateLong(new Date())}</span>
      </div>
    </div>
  );
}

export default PageHeader;
