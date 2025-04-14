import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  blur?: boolean;
}

export default function LoadingOverlay({ 
  isLoading, 
  text = 'Loading...', 
  blur = true 
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        blur ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/50'
      }`}
    >
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4 text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-700">{text}</p>
      </div>
    </div>
  );
}