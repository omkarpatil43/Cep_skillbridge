import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteButtonProps {
  onDelete: () => void;
  label?: string;
  size?: 'sm' | 'md';
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ onDelete, label = 'Remove', size = 'sm' }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to ${label.toLowerCase()} this item?`)) {
      onDelete();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn btn-danger ${size === 'sm' ? 'btn-sm' : ''}`}
      title={label}
    >
      <Trash2 size={size === 'sm' ? 14 : 16} />
      {label}
    </button>
  );
};
