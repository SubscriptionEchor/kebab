interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  title = 'Error',
  message = 'Something went wrong. Please try again.',
  onRetry,
  className = ''
}: ErrorStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="text-red-500 font-medium">{title}</div>
        <p className="text-gray-600 text-sm max-w-md text-center">
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all duration-200 hover:scale-[1.02]"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}