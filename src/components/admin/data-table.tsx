/* eslint-disable @typescript-eslint/no-explicit-any */
import { flexRender } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useLegacyTable,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Search…",
  emptyTitle = "Nothing to show",
  emptyBody = "Records will appear here once they exist.",
  page,
  pageSize,
  total,
  onPageChange,
}: {
  data: T[];
  columns: LegacyColumnDef<T, any>[];
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyBody?: string;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const serverPaginated = Boolean(onPageChange && page && pageSize && total !== undefined);

  const table = useLegacyTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(serverPaginated ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
  });

  return (
    <div>
      <input
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder={searchPlaceholder}
        className="mb-4 w-full max-w-xs border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive"
      />

      <div className="overflow-x-auto border border-border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-surface-2">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-border px-3 py-2 text-left font-medium"
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        className="label-caps flex items-center gap-1 text-muted-foreground hover:text-foreground"
                        onClick={header.column.getToggleSortingHandler()}
                        type="button"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() &&
                          ({
                            asc: <ArrowUp className="h-3 w-3" />,
                            desc: <ArrowDown className="h-3 w-3" />,
                          }[header.column.getIsSorted() as string] ?? (
                            <ChevronsUpDown className="h-3 w-3 opacity-40" />
                          ))}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-surface">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2.5 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {table.getRowModel().rows.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="font-display text-2xl">{emptyTitle}</p>
            <p className="mt-2 text-sm text-muted-foreground">{emptyBody}</p>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Page {serverPaginated ? page : table.getState().pagination.pageIndex + 1} of{" "}
          {serverPaginated
            ? Math.max(1, Math.ceil((total ?? 0) / (pageSize ?? 1)))
            : Math.max(1, table.getPageCount())}{" "}
          · {serverPaginated ? total : table.getFilteredRowModel().rows.length} records
        </span>
        <div className="flex gap-2">
          <button
            onClick={() =>
              serverPaginated ? onPageChange?.(Math.max(1, (page ?? 1) - 1)) : table.previousPage()
            }
            disabled={serverPaginated ? (page ?? 1) <= 1 : !table.getCanPreviousPage()}
            className="border border-border px-3 py-1 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={() => (serverPaginated ? onPageChange?.((page ?? 1) + 1) : table.nextPage())}
            disabled={
              serverPaginated
                ? (page ?? 1) >= Math.ceil((total ?? 0) / (pageSize ?? 1))
                : !table.getCanNextPage()
            }
            className="border border-border px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
