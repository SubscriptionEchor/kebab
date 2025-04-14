interface StepProps {
  title: string;
  children: React.ReactNode;
}

export function Step({ title, children }: StepProps) {
  return (
    <div className="bg-white rounded-[20px] p-8">
      <h2 className="text-[24px] font-semibold text-[#1D1E20] mb-6">{title}</h2>
      {children}
    </div>
  );
}