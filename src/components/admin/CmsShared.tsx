// 📍 File: src/components/admin/CmsShared.tsx
"use client";

import React from 'react';
import { LucideIcon, Search, X, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

// ==========================================
// 1. StatusBadge (EXACT Shared Style)
// ==========================================
interface StatusBadgeProps {
  status: string;
  activeLabel?: string;
  hiddenLabel?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function StatusBadge({ 
  status, 
  activeLabel = "HIỂN THỊ", 
  hiddenLabel = "ẨN", 
  onClick, 
  disabled 
}: StatusBadgeProps) {
  const isShow = status === "HIỂN THỊ";
  return (
    <button 
      onClick={onClick} 
      disabled={disabled || !onClick}
      className={`transition-colors select-none whitespace-nowrap inline-flex items-center justify-center ${
        isShow 
          ? 'h-6 rounded-full text-[11px] font-medium px-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200' 
          : 'h-6 rounded-full text-[11px] font-medium px-2.5 bg-amber-50 text-amber-600 border border-amber-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : onClick ? 'cursor-pointer' : ''}`}
    >
      {isShow ? activeLabel : hiddenLabel}
    </button>
  );
}

// ==========================================
// 2. TablePagination
// ==========================================
interface TablePaginationProps {
  totalItems: number;
  itemsLabel?: string;
  rowsPerPage: number;
  onRowsPerPageChange: (rows: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  language?: 'vi' | 'en';
  rowsPerPageLabel?: string;
  variant?: 'inside' | 'outside';
}

export function TablePagination({
  totalItems,
  itemsLabel = "items",
  rowsPerPage,
  onRowsPerPageChange,
  currentPage,
  totalPages,
  onPageChange,
  language = "vi",
  rowsPerPageLabel = "Dòng mỗi trang",
  variant = "outside"
}: TablePaginationProps) {
  const isEn = language === "en";
  const isOutside = variant === "outside";
  
  const containerClasses = isOutside
    ? "flex items-center justify-between px-2 pt-4 select-none flex-wrap gap-4 w-full"
    : "flex items-center justify-between px-4 py-3 select-none border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 flex-wrap gap-4 w-full";
    
  const textClass = isOutside ? "text-sm" : "text-xs";
  
  return (
    <div className={containerClasses}>
      <div className={`flex-1 ${textClass} text-slate-500 dark:text-slate-400 min-w-[200px]`}>
        {isEn ? "Total" : "Tổng cộng"}: <strong className="font-semibold text-slate-900 dark:text-slate-100">{totalItems}</strong> {itemsLabel}
      </div>
      
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className={`${textClass} font-medium text-slate-500 dark:text-slate-400`}>
            {rowsPerPageLabel}
          </p>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              onRowsPerPageChange(Number(e.target.value));
            }}
            className="h-8 w-16 rounded-md border border-slate-200 bg-white px-1 text-sm text-slate-900 shadow-sm outline-none cursor-pointer focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 transition-colors"
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        
        <div className={`flex w-[80px] items-center justify-center ${textClass} font-medium text-slate-700 dark:text-slate-300`}>
          {currentPage} / {totalPages}
        </div>
        
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => onPageChange(1)} 
            disabled={currentPage === 1} 
            title={isEn ? 'First page' : 'Trang đầu'}
            className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
          >
            <ChevronsLeft size={14} />
          </button>
          <button 
            onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
            disabled={currentPage === 1} 
            title={isEn ? 'Previous page' : 'Trang trước'}
            className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
          >
            <ChevronLeft size={14} />
          </button>
          <button 
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
            disabled={currentPage === totalPages} 
            title={isEn ? 'Next page' : 'Trang sau'}
            className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
          >
            <ChevronRight size={14} />
          </button>
          <button 
            onClick={() => onPageChange(totalPages)} 
            disabled={currentPage === totalPages} 
            title={isEn ? 'Last page' : 'Trang cuối'}
            className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. CmsHeader
// ==========================================
interface CmsHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  noDivider?: boolean;
}

export function CmsHeader({ 
  icon: Icon, 
  title, 
  subtitle, 
  rightElement,
  noDivider
 
}: CmsHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0 pb-4 ${noDivider ? "" : "border-b border-slate-200 dark:border-slate-800/80"}`}>
      <div className="flex items-center gap-3">
        {Icon && <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
          <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </div>}
        {(title || subtitle) && <div>
          {title && <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors">
            {title}
          </h1>}
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
              {subtitle}
            </p>
          )}
        </div>}
      </div>
      {rightElement && (
        <div className="flex items-center gap-2">
          {rightElement}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. CmsFilters
// ==========================================
interface CmsFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  onReset?: () => void;
  showReset?: boolean;
  resetLabel?: string;
}

export function CmsFilters({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  children,
  onReset,
  showReset = false,
  resetLabel = "Đặt lại"
}: CmsFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm select-none transition-colors">
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <div className="relative w-full sm:w-[250px] lg:w-[300px] shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
          <input 
            type="text" 
            placeholder={searchPlaceholder} 
            value={searchTerm} 
            onChange={(e) => onSearchChange(e.target.value)} 
            className="h-8 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-3 py-1 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm outline-none focus:border-slate-300 dark:focus:border-slate-700 transition-colors" 
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {children}
          
          {showReset && onReset && (
            <button 
              onClick={onReset} 
              className="h-8 px-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
            >
              {resetLabel}
              <X size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
