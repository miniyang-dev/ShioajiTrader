import "./LoadingSkeleton.css";

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({ className = "", width, height, variant = "rectangular" }: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
      style={style}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[#13161f] rounded-lg p-4 border border-gray-800">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width="40px" height="40px" />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" height="16px" className="mb-2" />
          <Skeleton variant="text" width="40%" height="12px" />
        </div>
      </div>
      <Skeleton variant="rectangular" height="100px" className="mb-3" />
      <div className="flex gap-2">
        <Skeleton variant="text" width="30%" height="12px" />
        <Skeleton variant="text" width="30%" height="12px" />
        <Skeleton variant="text" width="30%" height="12px" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-800">
      <td className="p-3">
        <Skeleton variant="text" width="60px" height="16px" />
      </td>
      <td className="p-3">
        <Skeleton variant="text" width="40px" height="16px" />
      </td>
      <td className="p-3">
        <Skeleton variant="text" width="60px" height="16px" />
      </td>
      <td className="p-3">
        <Skeleton variant="text" width="80px" height="16px" />
      </td>
      <td className="p-3">
        <Skeleton variant="rectangular" width="60px" height="24px" className="rounded" />
      </td>
    </tr>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-[#13161f] rounded-lg p-4 border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <Skeleton variant="text" width="120px" height="20px" />
        <div className="flex gap-2">
          <Skeleton variant="rectangular" width="40px" height="24px" className="rounded" />
          <Skeleton variant="rectangular" width="40px" height="24px" className="rounded" />
        </div>
      </div>
      <Skeleton variant="rectangular" height="180px" />
    </div>
  );
}
