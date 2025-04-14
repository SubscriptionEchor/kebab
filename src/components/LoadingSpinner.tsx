interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'black' | 'red' | 'green' | 'yellow';
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-5 w-5 border-2',
    lg: 'h-8 w-8 border-4'
  };

  const colorClasses = {
    primary: 'border-brand-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    black: 'border-black border-t-transparent',
    red: 'border-red-500 border-t-transparent',
    green: 'border-green-500 border-t-transparent',
    yellow: 'border-yellow-500 border-t-transparent'
  };

  return (
    <div 
      className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}