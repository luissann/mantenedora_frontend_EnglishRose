import { formatDateLong } from '../../utils/formatters';

export function PageHeader({ title }) {
  return (
    <div className="flex flex-col gap-2 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
      <h1 className="font-playfair text-3xl text-text-primary md:text-4xl">{title}</h1>
      <span className="text-sm text-text-secondary">{formatDateLong(new Date())}</span>
    </div>
  );
}

export default PageHeader;
