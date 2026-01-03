import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
  };
  rowKey?: string | ((record: T) => string);
  emptyText?: string;
  onRowClick?: (record: T) => void;
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  rowKey = 'id',
  emptyText = '暂无数据',
  onRowClick,
}: DataTableProps<T>) {
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || String(index);
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;

  const renderPagination = () => {
    if (!pagination || pagination.total <= pagination.pageSize) return null;

    const { current, total, pageSize, onChange } = pagination;
    const startItem = (current - 1) * pageSize + 1;
    const endItem = Math.min(current * pageSize, total);

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          显示 {startItem}-{endItem} 共 {total} 条
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange(1)}
            disabled={current === 1}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            onClick={() => onChange(current - 1)}
            disabled={current === 1}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 py-1 text-sm">
            {current} / {totalPages}
          </span>
          <button
            onClick={() => onChange(current + 1)}
            disabled={current === totalPages}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => onChange(totalPages)}
            disabled={current === totalPages}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-100 border-b border-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 border-b border-gray-100 flex items-center px-4 gap-4">
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                    column.align === 'center'
                      ? 'text-center'
                      : column.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                  }`}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr
                  key={getRowKey(record, index)}
                  className={`border-b border-gray-100 last:border-0 ${
                    onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                  }`}
                  onClick={() => onRowClick?.(record)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 text-sm ${
                        column.align === 'center'
                          ? 'text-center'
                          : column.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                      }`}
                    >
                      {column.render
                        ? column.render(record[column.key], record, index)
                        : record[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
}

export default DataTable;
