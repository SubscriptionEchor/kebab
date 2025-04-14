import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface CopyableIdProps {
  label: string;
  value: string;
  truncateLength?: number;
}

export default function CopyableId({ label, value, truncateLength }: CopyableIdProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied to clipboard`);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const displayValue = truncateLength ? `${value.slice(0, truncateLength)}...` : value;

  return (
    <button
      onClick={handleCopy}
      className="group inline-flex items-center gap-2 hover:text-brand-primary transition-colors"
    >
      <span className="text-sm text-gray-500 font-mono">{displayValue}</span>
      <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}