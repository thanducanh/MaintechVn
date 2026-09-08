"use client";

import { Trash2 } from "lucide-react";
import { deleteServiceAction } from "@/actions/services";
import { useState } from "react";

export default function DeleteServiceButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (confirm("Anh có chắc chắn muốn xóa dịch vụ này không?")) {
            setLoading(true);
            await deleteServiceAction(id);
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-premium-red drop-shadow-md transition-colors disabled:opacity-50"
        >
            <Trash2 size={18} />
        </button>
    );
}