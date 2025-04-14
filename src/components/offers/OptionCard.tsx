import { motion } from 'framer-motion';

interface OptionCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

export function OptionCard({
  title,
  description,
  icon,
  isSelected,
  onClick,
}: OptionCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        p-6 rounded-[20px] cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'bg-[#FFFBEB] border-2 border-[#FFD541]' 
          : 'bg-white border border-gray-200 hover:border-[#FFD541]'}
      `}
    >
      <div className={`
        w-[72px] h-[72px] rounded-full flex items-center justify-center mb-4
        ${isSelected ? 'bg-[#FFE171]' : 'bg-[#FFF8E7]'}
      `}>
        {icon}
      </div>
      <h3 className="text-[18px] font-semibold text-[#1D1E20] mb-2">{title}</h3>
      {description && (
        <p className="text-[#667085] text-sm">{description}</p>
      )}
    </motion.div>
  );
}