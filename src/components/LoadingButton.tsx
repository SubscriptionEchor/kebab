import LoadingSpinner from './LoadingSpinner';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export default function LoadingButton({
  children,
  isLoading = false,
  loadingText = 'Loading...',
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}: LoadingButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'text-black bg-brand-primary hover:bg-brand-primary/90',
    secondary: 'text-gray-700 bg-gray-100 hover:bg-gray-200',
    danger: 'text-white bg-red-600 hover:bg-red-700',
    success: 'text-white bg-green-600 hover:bg-green-700',
    warning: 'text-white bg-yellow-600 hover:bg-yellow-700'
  };

  const spinnerColors = {
    primary: 'black',
    secondary: 'primary',
    danger: 'white',
    success: 'white',
    warning: 'white'
  } as const;

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner 
            size={size} 
            color={spinnerColors[variant]}
            className="mr-2"
          />
          {loadingText}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
  
          {children}
        </>
      )}
    </button>
  );
}