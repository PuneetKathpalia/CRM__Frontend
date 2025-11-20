/**
 * Loading Skeleton Components
 * Reusable skeleton placeholders for loading states
 */

// Card Skeleton
export const CardSkeleton = () => (
  <div className="bg-black border border-white/10 rounded-2xl p-6 shadow-xl animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-4 bg-white/10 rounded w-24 mb-4"></div>
        <div className="h-10 bg-white/10 rounded w-32"></div>
      </div>
      <div className="w-16 h-16 bg-white/10 rounded-xl"></div>
    </div>
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, index) => (
      <td key={index} className="px-6 py-5">
        <div className="h-4 bg-white/10 rounded w-full"></div>
      </td>
    ))}
  </tr>
);

// List Item Skeleton
export const ListItemSkeleton = () => (
  <div className="bg-black border border-white/10 rounded-xl p-6 mb-4 animate-pulse">
    <div className="h-5 bg-white/10 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-white/10 rounded w-1/2"></div>
  </div>
);

// Chart Skeleton
export const ChartSkeleton = () => (
  <div className="bg-black border border-white/10 rounded-2xl p-8 shadow-xl animate-pulse">
    <div className="h-8 bg-white/10 rounded w-48 mb-8"></div>
    <div className="h-64 bg-white/10 rounded"></div>
  </div>
);







