import { Spinner } from './Spinner';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  disabled = false,
  className,
  ...props
}) {
  const variantStyles = {
    primary: 'bg-rose text-white hover:bg-rose-hover',
    secondary: 'border border-border bg-white text-text-primary hover:bg-rose-light',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-text-primary hover:bg-rose-light',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus:outline-none focus:ring-2 focus:ring-rose/20 disabled:cursor-not-allowed disabled:opacity-60 ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size={size === 'lg' ? 'md' : 'sm'} color={variant === 'primary' ? 'white' : 'rose'} />}
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </button>
  );
}

export default Button;
