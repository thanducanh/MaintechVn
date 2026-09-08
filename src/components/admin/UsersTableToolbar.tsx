"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, PlusCircle, Settings2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDebounce } from "@/hooks/use-debounce";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { useAdminSettings } from "@/context/AdminSettingsContext";
import { translateDepartment, translateStatus } from "@/lib/i18n-utils";

interface UsersTableToolbarProps {
    q?: string;
    status?: string[];
    dept?: string[];
    statuses: { label: string; value: string }[];
    departments: { label: string; value: string }[];
    renderViewOptions?: React.ReactNode;
    allUsers: any[]; // To calculate counts
}

export default function UsersTableToolbar({ 
    q: initialQ, 
    status = [], 
    dept = [], 
    statuses, 
    departments,
    renderViewOptions,
    allUsers
}: UsersTableToolbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { t } = useAdminSettings();

    const [searchValue, setSearchValue] = useState(initialQ || "");
    const debouncedSearch = useDebounce(searchValue, 500);

    const createQueryString = useCallback(
        (name: string, value: string | string[]) => {
            const params = new URLSearchParams(searchParams.toString());
            
            // Clear existing values for this name
            params.delete(name);
            
            // Add new values
            if (Array.isArray(value)) {
                value.forEach(v => {
                    if (v) params.append(name, v);
                });
            } else if (value) {
                params.set(name, value);
            }
            
            return params.toString();
        },
        [searchParams]
    );

    // Auto-search on debounce
    useEffect(() => {
        if (debouncedSearch !== (searchParams.get("q") || "")) {
            router.push(`${pathname}?${createQueryString("q", debouncedSearch)}`);
        }
    }, [debouncedSearch, pathname, router, createQueryString, searchParams]);

    const onFilterChange = (name: string, value: string) => {
        let currentValues = name === "status" ? [...status] : [...dept];
        if (currentValues.includes(value)) {
            currentValues = currentValues.filter(v => v !== value);
        } else {
            currentValues.push(value);
        }
        router.push(`${pathname}?${createQueryString(name, currentValues)}`);
    };

    const onClearFilter = (name: string) => {
        router.push(`${pathname}?${createQueryString(name, [])}`);
    };

    const onReset = () => {
        router.push(pathname);
        setSearchValue("");
    };

    const isFiltered = searchParams.get("q") || searchParams.get("status") || searchParams.get("dept");

    // Calculate counts
    const statusCounts = statuses.reduce((acc, s) => {
        acc[s.value] = allUsers.filter(u => u.status === s.value).length;
        return acc;
    }, {} as Record<string, number>);

    const deptCounts = departments.reduce((acc, d) => {
        acc[d.value] = allUsers.filter(u => u.department === d.value).length;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2 w-full">
            <div className="flex flex-1 flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:max-w-sm w-full">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <input 
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder={t?.common?.search || "Tìm nhân sự..."} 
                        className="h-8 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-200/50"
                    />
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    {/* Status Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className={`h-8 border-dashed flex px-3 text-[12px] font-medium transition-all focus-visible:ring-1 focus-visible:ring-slate-200 ${status.length > 0 ? "bg-primary/5 text-primary" : ""}`}>
                                <PlusCircle className="mr-2 h-3.5 w-3.5 opacity-60" />
                                {t?.common?.status || "Trạng thái"}
                                {status.length > 0 && (
                                    <>
                                        <Separator orientation="vertical" className="mx-2 h-4 bg-primary/20" />
                                        <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">{status.length}</Badge>
                                        <div className="hidden space-x-1 lg:flex">
                                            {status.length > 2 ? (
                                                <Badge variant="secondary" className="rounded-sm px-1 font-normal text-[10px] bg-primary/10 text-primary border-none">
                                                    {t?.common?.selected || "Đã chọn"} {status.length}
                                                </Badge>
                                            ) : (
                                                statuses
                                                    .filter(s => status.includes(s.value))
                                                    .map(s => (
                                                        <Badge key={s.value} variant="secondary" className="rounded-sm px-1 font-normal text-[10px] bg-primary/10 text-primary border-none">
                                                            {translateStatus(s.value, t)}
                                                        </Badge>
                                                    ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px] bg-white dark:bg-slate-950 border-border/60 shadow-lg rounded-xl p-1 animate-in fade-in zoom-in-95 duration-100">
                            <div className="p-2 flex flex-col gap-1">
                                {statuses.filter(s => s.value !== "").map((s) => (
                                    <div 
                                        key={s.value}
                                        onClick={() => onFilterChange("status", s.value)}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer group transition-colors"
                                    >
                                        <div className={`size-3.5 rounded border flex items-center justify-center transition-colors ${status.includes(s.value) ? "bg-primary border-primary text-white" : "border-muted-foreground/30"}`}>
                                            {status.includes(s.value) && <Check size={10} strokeWidth={3} />}
                                        </div>
                                        <span className="text-[13px] font-medium flex-1 text-foreground/80 group-hover:text-foreground">{translateStatus(s.value, t)}</span>
                                        <span className="text-[11px] font-mono text-muted-foreground/60">{statusCounts[s.value] || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Department Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className={`h-8 border-dashed flex px-3 text-[12px] font-medium transition-all focus-visible:ring-1 focus-visible:ring-slate-200 ${dept.length > 0 ? "bg-primary/5 text-primary" : ""}`}>
                                <PlusCircle className="mr-2 h-3.5 w-3.5 opacity-60" />
                                {t?.sidebar?.personnel || "Nhân sự"}
                                {dept.length > 0 && (
                                    <>
                                        <Separator orientation="vertical" className="mx-2 h-4 bg-primary/20" />
                                        <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">{dept.length}</Badge>
                                        <div className="hidden space-x-1 lg:flex">
                                            {dept.length > 2 ? (
                                                <Badge variant="secondary" className="rounded-sm px-1 font-normal text-[10px] bg-primary/10 text-primary border-none">
                                                    {t?.common?.selected || "Đã chọn"} {dept.length}
                                                </Badge>
                                            ) : (
                                                departments
                                                    .filter(d => dept.includes(d.value))
                                                    .map(d => (
                                                        <Badge key={d.value} variant="secondary" className="rounded-sm px-1 font-normal text-[10px] bg-primary/10 text-primary border-none">
                                                            {translateDepartment(d.value, t)}
                                                        </Badge>
                                                    ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[240px] bg-white dark:bg-slate-950 border-border/60 shadow-lg rounded-xl p-0 animate-in fade-in zoom-in-95 duration-100">
                            <div className="p-2 border-b border-border/40">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                                    <input 
                                        placeholder={t?.common?.search || "Tìm phòng ban..."}
                                        className="h-7 w-full bg-slate-50 dark:bg-slate-900 border-none rounded-md pl-7 pr-2 text-[12px] outline-none focus:ring-1 focus:ring-slate-200/50 transition-all"
                                        onChange={(e) => {
                                            const val = e.target.value.toLowerCase();
                                            const items = document.querySelectorAll('.dept-item');
                                            items.forEach((item: any) => {
                                                const text = item.getAttribute('data-label').toLowerCase();
                                                item.style.display = text.includes(val) ? 'flex' : 'none';
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="p-1 flex flex-col gap-0.5 overflow-y-auto max-h-[300px]">
                                {departments.filter(d => d.value !== "").map((d) => (
                                    <div 
                                        key={d.value}
                                        data-label={d.label}
                                        onClick={() => onFilterChange("dept", d.value)}
                                        className="dept-item flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer group transition-colors"
                                    >
                                        <div className={`size-3.5 rounded border flex items-center justify-center transition-colors ${dept.includes(d.value) ? "bg-primary border-primary text-white" : "border-muted-foreground/30"}`}>
                                            {dept.includes(d.value) && <Check size={10} strokeWidth={3} />}
                                        </div>
                                        <span className="text-[13px] font-medium flex-1 text-foreground/80 group-hover:text-foreground">{translateDepartment(d.value, t)}</span>
                                        <span className="text-[11px] font-mono text-muted-foreground/60">{deptCounts[d.value] || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {isFiltered && (
                        <Button 
                            variant="ghost" 
                            onClick={onReset} 
                            className="h-8 px-2 lg:px-3 text-[12px] font-medium text-muted-foreground hover:text-foreground"
                        >
                            {t?.common?.reset || "Đặt lại"}
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
                {renderViewOptions}
            </div>
        </div>
    );
}
