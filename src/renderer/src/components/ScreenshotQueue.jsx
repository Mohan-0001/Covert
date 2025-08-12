// components/ScreenshotQueue.jsx
import React from 'react';
import { IoCloseCircleOutline } from 'react-icons/io5';

const ScreenshotQueue = ({ screenshots, onRemove }) => {
  if (screenshots.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 p-4 overflow-x-scroll scrollbar-none">
      {screenshots.map((screenshot, index) => (
        <div 
          key={index} 
          className="relative group w-28 h-20 rounded-lg overflow-hidden shadow-md flex-shrink-0"
        >
          <img src={screenshot} alt={`Screenshot ${index}`} className="w-full h-full object-cover" />
          <button
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 p-1 text-white bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <IoCloseCircleOutline size={20} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ScreenshotQueue