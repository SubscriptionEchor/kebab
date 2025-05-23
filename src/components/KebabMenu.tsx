// src/components/KebabMenu.tsx
import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface KebabMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  menuItems?: Array<{
    label: string;
    icon: React.ElementType;
    onClick: () => void;
  }>;
}

const KebabMenu: React.FC<KebabMenuProps> = ({ onEdit, onDelete, menuItems }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 120 // Position to the left of the button
      });
    }
    
    setIsOpen(!isOpen);
  };

  return (
    <div ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={handleToggleMenu}
        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        title="More options"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {isOpen && (
        <div 
          className="fixed w-48 bg-white rounded-md shadow-lg py-1 z-50"
          style={{ 
            top: `${menuPosition.top}px`, 
            left: `${menuPosition.left}px` 
          }}
        >
          {menuItems ? (
            menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Pencil className="h-4 w-4" />
                {t('common.edit')}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Trash2 className="h-4 w-4" />
                {t('common.delete')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default KebabMenu;