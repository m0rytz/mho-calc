import React, { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    const offset = 12; // space from cursor
    let top = e.clientY + offset;
    let left = e.clientX + offset;

    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl?.offsetWidth || 0;
    const tooltipHeight = tooltipEl?.offsetHeight || 0;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Prevent tooltip from going off the right edge
    if (left + tooltipWidth > windowWidth) {
      left = e.clientX - tooltipWidth - offset;
    }

    // Prevent tooltip from going off the bottom edge
    if (top + tooltipHeight > windowHeight) {
      top = e.clientY - tooltipHeight - offset;
    }

    // Prevent tooltip from going off the left/top edge
    top = Math.max(0, top);
    left = Math.max(0, left);

    setPosition({ top, left });
  };

  useEffect(() => {
    const target = targetRef.current;
    if (target && visible) {
      target.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (target) {
        target.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [visible]);

  return (
    <>
      <div
        ref={targetRef}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className={`relative inline-flex items-center ${className || ""}`}
      >
        {children}
      </div>

      {visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed border border-blue-400 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-pre-line z-50 pointer-events-none"
            style={{
              top: position.top,
              left: position.left,
              transform: "translate(0, 0)",
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
};

export default Tooltip;
