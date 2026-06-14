export function Spinner({ size = 'md', color = 'rose' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8',
  };

  const colorMap = {
    rose: 'text-rose',
    white: 'text-white',
    gray: 'text-slate-400',
  };

  return (
    <svg
      className={`animate-spin ${sizes[size]} ${colorMap[color]}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export default Spinner;
