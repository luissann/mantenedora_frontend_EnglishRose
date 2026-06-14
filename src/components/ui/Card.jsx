export function Card({ children, relative = false, watermark = true, className }) {
  return (
    <div className={`rounded-3xl border border-border bg-white p-6 shadow-sm ${relative ? 'relative' : ''} ${className || ''}`}>
      {watermark && (
        <span className="pointer-events-none absolute bottom-3 right-4 text-6xl font-playfair text-rose/10 select-none">
          SR
        </span>
      )}
      {children}
    </div>
  );
}

export default Card;
