import React, { useState, useRef, useEffect } from "react";

interface StatCategoryProps {
  title: string;
  children: React.ReactNode;
  foldVersion?: number;
  foldState?: boolean | null;
}

const StatCategory: React.FC<StatCategoryProps> = ({ title, children, foldVersion, foldState }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [height, setHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen, children]);

  useEffect(() => {
    if (foldState !== undefined && foldState !== null) {
      setIsOpen(foldState);
    }
  }, [foldVersion]);

  return (
    <div className="border rounded-md my-1">
      <button
        className="w-full cursor-pointer flex justify-between text-sm items-center bg-gray-100 px-4 py-2 text-left font-medium hover:bg-gray-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <span className="ml-2">{isOpen ? "▲" : "▼"}</span>
      </button>

      <div
        ref={contentRef}
        style={{ maxHeight: `${height}px` }}
        className="overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div className="px-4 py-2 space-y-2">{children}</div>
      </div>
    </div>
  );
};

export default StatCategory;
