import { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useTranslation } from 'react-i18next';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
}

export default function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      // Add escape key handler
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setShowPicker(false);
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, []);

  const handleDone = () => {
    setShowPicker(false);
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setShowPicker(true)}
        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <div
          className="w-6 h-6 rounded border border-gray-300"
          style={{ backgroundColor: color }}
        />
        <span>{label}</span>
      </button>

      {showPicker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg p-4">
            <HexColorPicker color={color} onChange={onChange} />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowPicker(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                {t('delete.close')}
              </button>
              <button
                onClick={handleDone}
                className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors"
              >
                {t('delete.done')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}