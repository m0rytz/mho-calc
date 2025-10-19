import React, { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface ImageTooltipProps {
    content: any;
    children: ReactNode;
    className?: string;
}

const ImageTooltip: React.FC<ImageTooltipProps> = ({ content, children, className }) => {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const ref = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: MouseEvent) => {
        setPosition({
            top: e.clientY + 12,
            left: e.clientX + 12,
        });
    };

    useEffect(() => {
        const target = ref.current;
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
                ref={ref}
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
                className={`relative inline-flex items-center ${className || ""}`}
            >
                {children}
            </div>

            {visible &&
                createPortal(
                    <div
                        className="fixed z-50 pointer-events-none"
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

export default ImageTooltip;
