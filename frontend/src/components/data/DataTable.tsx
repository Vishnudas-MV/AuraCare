import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/feedback/Skeleton';
import { cn } from '@/utils/cn';

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No clinical records found.',
  onRowClick,
  className,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-line bg-surface shadow-xs', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-line bg-surface-subtle/60 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3.5 whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
                {onRowClick && <th className="w-10 px-4 py-3.5" />}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-line">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`loading-row-${idx}`}>
                  {columns.map((_, colIdx) => (
                    <td key={`loading-cell-${colIdx}`} className="px-4 py-4">
                      <Skeleton variant="text" className="h-4 w-4/5" />
                    </td>
                  ))}
                  {onRowClick && <td className="px-4 py-4"><Skeleton className="h-4 w-4" /></td>}
                </tr>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-interactive={Boolean(onRowClick)}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className={cn(
                    'transition-colors duration-150',
                    onRowClick && 'cursor-pointer hover:bg-surface-subtle/80'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5 text-ink whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                  {onRowClick && (
                    <td className="px-4 py-3.5 text-ink-muted text-right">
                      <ChevronRight className="h-4 w-4 inline-block" />
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (onRowClick ? 1 : 0)}
                  className="px-6 py-12 text-center text-sm text-ink-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
