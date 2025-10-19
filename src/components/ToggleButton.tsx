import React, { useState, useCallback } from "react";

interface ToggleButtonProps {
  initial?: boolean;
  onToggle?: (state: boolean) => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  initial = false,
  onToggle,
}) => {
  const [isToggled, setIsToggled] = useState(initial);

  const handleToggle = useCallback(() => {
    setIsToggled((prev) => {
      const newState = !prev;
      return newState;
    });
  }, []);

  React.useEffect(() => {
    if (onToggle) onToggle(isToggled);
  }, [isToggled, onToggle]);

  return (
    <button
      onClick={handleToggle}
      className={`relative w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
        isToggled ? "bg-blue-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
          isToggled ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
};

export default ToggleButton;
