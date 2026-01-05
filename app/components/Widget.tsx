import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface WidgetProps {
  id: string;
  children: React.ReactNode;
  size?: "1x1" | "2x1" | "1x2" | "2x2";
  customizeMode?: boolean;
  onRemove?: () => void;
}

export default function Widget({ id, children, size = "1x1", customizeMode = false, onRemove }: WidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sizeClasses = {
    "1x1": "",
    "2x1": "lg:col-span-2",
    "1x2": "lg:row-span-2",
    "2x2": "lg:col-span-2 lg:row-span-2",
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...(customizeMode ? { ...attributes, ...listeners } : {})}
      className={`group/widget relative ${sizeClasses[size]} ${customizeMode ? 'cursor-move' : ''}`}
    >
      {customizeMode && onRemove && (
        <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover/widget:opacity-100 transition-opacity">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="w-7 h-7 bg-red-500/90 hover:bg-red-500 rounded-lg flex items-center justify-center text-white shadow-lg transition-all"
          >
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
      )}
      {children}
    </div>
  );
}
