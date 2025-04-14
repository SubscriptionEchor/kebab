interface LoadingStateProps {
  rows?: number;
  className?: string;
}

export default function LoadingState({ rows = 5, className = '' }: LoadingStateProps) {
  return (
    <div className={`space-y-4 animate-fade-in ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="relative h-16 rounded-lg bg-gray-200 overflow-hidden"
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          <div className="absolute inset-0 shimmer-wave" />
        </div>
      ))}
    </div>
  );
}