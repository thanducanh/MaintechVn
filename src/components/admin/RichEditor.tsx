// 📍 File: src/components/admin/RichEditor.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ClipboardCopy, Code, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// Style sheets for Quill loaded safely
import "react-quill-new/dist/quill.snow.css";

// Dynamically import ReactQuill to prevent SSR and hydration warnings
const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import("react-quill-new");
        return RQ;
    },
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse min-h-[120px]">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500 dark:text-indigo-400" />
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">Loading rich editor...</span>
            </div>
        )
    }
);

interface RichEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    height?: string; // Custom height like "240px" or "92px"
    label?: string;
    language?: "vi" | "en";
}

export default function RichEditor({
    value,
    onChange,
    placeholder = "",
    height = "150px",
    label,
    language = "vi"
}: RichEditorProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleCopyHTML = () => {
        if (!value) {
            toast.error(language === "en" ? "Editor is empty!" : "Trình soạn thảo chưa có nội dung!");
            return;
        }
        navigator.clipboard.writeText(value);
        toast.success(
            language === "en" ? "Copied raw HTML to clipboard!" : "Đã sao chép mã nguồn HTML thành công!"
        );
    };

    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"]
        ]
    };

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "code-block",
        "list",
        "indent",
        "link",
        "image",
        "align",
        "color",
        "background"
    ];

    if (!mounted) {
        return (
            <div 
                style={{ minHeight: height }}
                className="w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl min-h-[120px]"
            >
                <Loader2 className="h-5 w-5 animate-spin text-indigo-500 dark:text-indigo-400" />
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col min-h-0">
            {/* Mini Header control bar */}
            {label && (
                <div className="flex items-center justify-between mb-1.5 shrink-0 select-none">
                    <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                        {label}
                    </label>
                    <button
                        type="button"
                        onClick={handleCopyHTML}
                        className="flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                        title={language === "en" ? "Copy Raw HTML Source" : "Sao chép mã nguồn HTML"}
                    >
                        <Code size={11} />
                        <span>HTML</span>
                    </button>
                </div>
            )}

            {/* Premium Theme Wrapped Rich Editor Canvas Container */}
            <div 
                style={{ "--editor-height": height } as React.CSSProperties}
                className="rich-editor-container flex-1 min-h-0 flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors shadow-sm
                    [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-200 dark:[&_.ql-toolbar]:border-slate-800 [&_.ql-toolbar]:bg-slate-50 dark:[&_.ql-toolbar]:bg-slate-950 [&_.ql-toolbar]:px-3 [&_.ql-toolbar]:py-2 [&_.ql-toolbar]:rounded-t-xl
                    [&_.ql-container]:border-none [&_.ql-container]:bg-white dark:[&_.ql-container]:bg-slate-900 [&_.ql-container]:rounded-b-xl [&_.ql-container]:font-sans [&_.ql-container]:text-sm flex-1 min-h-0 flex flex-col
                    [&_.ql-editor]:px-3.5 [&_.ql-editor]:py-3 [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:min-h-[var(--editor-height)] [&_.ql-editor]:max-h-[var(--editor-height)] [&_.ql-editor]:text-slate-800 dark:[&_.ql-editor]:text-slate-200 [&_.ql-editor]:leading-relaxed [&_.ql-editor]:outline-none [&_.ql-editor]:flex-1
                    
                    /* Dark Mode toolbar strokes & colors overrides */
                    dark:[&_.ql-stroke]:stroke-slate-400 dark:[&_.ql-fill]:fill-slate-400
                    hover:dark:[&_.ql-stroke]:stroke-indigo-400 hover:dark:[&_.ql-fill]:fill-indigo-400
                    [&_.ql-active_.ql-stroke]:stroke-indigo-500 dark:[&_.ql-active_.ql-stroke]:stroke-indigo-400
                    [&_.ql-active_.ql-fill]:fill-indigo-500 dark:[&_.ql-active_.ql-fill]:fill-indigo-400
                    
                    /* Pickers background/text elements standard dark styling */
                    dark:[&_.ql-picker]:text-slate-350 dark:[&_.ql-picker-label]:text-slate-350
                    dark:[&_.ql-picker-options]:bg-slate-950 dark:[&_.ql-picker-options]:border-slate-800
                    dark:[&_.ql-picker-item]:text-slate-400 dark:hover:[&_.ql-picker-item]:text-indigo-400
                "
            >
                <ReactQuill
                    theme="snow"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    modules={modules}
                    formats={formats}
                    className="flex-1 min-h-0 flex flex-col"
                />
            </div>
        </div>
    );
}
