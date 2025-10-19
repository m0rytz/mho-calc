type CardProps = {
  children: React.ReactNode;
  className?: string;
};

function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-lg border bg-[#081f39] shadow-md p-4 ${className}`}>
      {children}
    </div>
  );
}

export default Card;
