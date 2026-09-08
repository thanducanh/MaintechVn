// 📍 File: src/components/admin/DocumentTemplate.tsx
import React, { forwardRef } from "react";

interface Props {
    type: "QUOTE" | "CONTRACT";
    data: any;
}

const DocumentTemplate = forwardRef<HTMLDivElement, Props>(({ type, data }, ref) => {
    const isQuote = type === "QUOTE";
    
    // Formatting helpers
    const fmt = (n: number) => (n || 0).toLocaleString("vi-VN") + " VNĐ";
    const date = (d: any) => d ? new Date(d).toLocaleDateString("vi-VN") : ".../.../20...";

    return (
        <div ref={ref} className="p-10 bg-white text-slate-900 font-serif leading-relaxed" style={{ width: "210mm", minHeight: "297mm", margin: "auto" }}>
            {/* HEADER - ADMINISTRATIVE STYLE */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-2xl">M</div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tighter text-slate-900">Maintech Vietnam</h1>
                        <p className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest">Engineering & Maintenance Solution</p>
                        <p className="text-[9px] font-sans text-slate-400 mt-1 italic">Địa chỉ: 123 Đường số 4, TP. Thủ Đức, TP. Hồ Chí Minh</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Mã số văn bản</p>
                    <p className="text-sm font-mono font-bold bg-slate-100 px-3 py-1 rounded border border-slate-200">{data.code}</p>
                </div>
            </div>

            {/* DOCUMENT TITLE */}
            <div className="text-center mb-10">
                <h2 className="text-3xl font-black uppercase tracking-[0.2em] mb-2">
                    {isQuote ? "Báo Giá Dịch Vụ" : "Hợp Đồng Kinh Tế"}
                </h2>
                <div className="w-24 h-1 bg-slate-900 mx-auto"></div>
                <p className="mt-4 text-sm italic">Ngày lập: {date(new Date())}</p>
            </div>

            {/* PARTIES INFO */}
            <div className="grid grid-cols-1 gap-6 mb-10 text-sm">
                <div className="space-y-2">
                    <p className="font-black uppercase tracking-widest text-xs text-slate-500 mb-2 border-b border-slate-100 pb-1">Đơn vị yêu cầu / Đối tác (Bên A)</p>
                    <div className="grid grid-cols-3 gap-2">
                        <span className="font-bold">Tên đơn vị:</span>
                        <span className="col-span-2 uppercase font-black">{data.companyName || "......................................................."}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <span className="font-bold">Mã số thuế:</span>
                        <span className="col-span-2 font-mono">{data.taxCode || "......................................................."}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <span className="font-bold">Địa chỉ:</span>
                        <span className="col-span-2 italic">{data.address || "......................................................."}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <span className="font-bold">Người đại diện:</span>
                        <span className="col-span-2">{data.contactName} {data.contactRole ? `(${data.contactRole})` : ""}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="font-black uppercase tracking-widest text-xs text-slate-500 mb-2 border-b border-slate-100 pb-1">Đơn vị cung cấp (Bên B)</p>
                    <div className="grid grid-cols-3 gap-2">
                        <span className="font-bold">Tên đơn vị:</span>
                        <span className="col-span-2 uppercase font-black">CÔNG TY TNHH CÔNG NGHỆ MAINTECH</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <span className="font-bold">Mã số thuế:</span>
                        <span className="col-span-2 font-mono">0312345678</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <span className="font-bold">Người đại diện:</span>
                        <span className="col-span-2">Ông. Nguyễn Văn Admin (Giám đốc)</span>
                    </div>
                </div>
            </div>

            {/* CONTENT SECTION */}
            <div className="mb-8">
                <h3 className="font-black uppercase text-sm mb-4 border-l-4 border-slate-900 pl-3">
                    {isQuote ? "I. Chi tiết hạng mục báo giá" : "I. Nội dung thỏa thuận & Hạng mục"}
                </h3>
                
                {isQuote ? (
                    <table className="w-full text-xs border-collapse border border-slate-300">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="border border-slate-300 p-2 text-center w-10">STT</th>
                                <th className="border border-slate-300 p-2 text-left">Hạng mục / Thiết bị / Dịch vụ</th>
                                <th className="border border-slate-300 p-2 text-center w-16">ĐVT</th>
                                <th className="border border-slate-300 p-2 text-center w-16">SL</th>
                                <th className="border border-slate-300 p-2 text-right">Đơn giá</th>
                                <th className="border border-slate-300 p-2 text-right">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items?.map((item: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                                    <td className="border border-slate-300 p-2 font-bold">{item.name}</td>
                                    <td className="border border-slate-300 p-2 text-center">{item.unit}</td>
                                    <td className="border border-slate-300 p-2 text-center">{item.quantity}</td>
                                    <td className="border border-slate-300 p-2 text-right">{fmt(item.unitPrice)}</td>
                                    <td className="border border-slate-300 p-2 text-right font-bold">{fmt(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold">
                            <tr>
                                <td colSpan={5} className="border border-slate-300 p-2 text-right">Cộng tiền hàng hóa, dịch vụ (chưa VAT):</td>
                                <td className="border border-slate-300 p-2 text-right">{fmt(data.totalAmount)}</td>
                            </tr>
                            <tr>
                                <td colSpan={5} className="border border-slate-300 p-2 text-right">Thuế giá trị gia tăng (VAT {data.vatPercent}%):</td>
                                <td className="border border-slate-300 p-2 text-right">{fmt(data.totalAmount * (data.vatPercent / 100))}</td>
                            </tr>
                            {data.discount > 0 && (
                                <tr>
                                    <td colSpan={5} className="border border-slate-300 p-2 text-right text-premium-red drop-shadow-md">Chiết khấu / Giảm giá:</td>
                                    <td className="border border-slate-300 p-2 text-right text-premium-red drop-shadow-md">-{fmt(data.discount)}</td>
                                </tr>
                            )}
                            <tr className="bg-slate-200 text-sm">
                                <td colSpan={5} className="border border-slate-300 p-2 text-right uppercase">Tổng cộng tiền thanh toán:</td>
                                <td className="border border-slate-300 p-2 text-right font-black">{fmt(data.finalAmount)}</td>
                            </tr>
                        </tfoot>
                    </table>
                ) : (
                    <div className="text-sm space-y-4">
                        <div className="bg-slate-50 p-4 rounded border border-slate-200">
                            <p className="font-bold mb-2">1.1. Giá trị hợp đồng:</p>
                            <p className="text-lg font-black text-slate-800">{fmt(data.contractValue)}</p>
                            <p className="text-[10px] italic mt-1">(Bằng chữ: ........................................................................................)</p>
                        </div>
                        <div className="whitespace-pre-wrap leading-relaxed italic border-l-2 border-slate-200 pl-4">
                            {data.description || "Nội dung chi tiết đang được cập nhật theo phụ lục đính kèm..."}
                        </div>
                    </div>
                )}
            </div>

            {/* TERMS & CONDITIONS */}
            <div className="mb-10 text-xs space-y-4">
                <h3 className="font-black uppercase text-sm border-l-4 border-slate-900 pl-3">II. Các điều khoản thương mại</h3>
                
                <div className="grid grid-cols-1 gap-4">
                    <div className="p-3 border border-slate-100 rounded">
                        <p className="font-bold underline mb-1 uppercase tracking-tighter">Điều 1: Điều khoản thanh toán</p>
                        <p className="italic">{data.paymentTerms || "Thanh toán bằng hình thức chuyển khoản hoặc tiền mặt theo thỏa thuận giữa hai bên."}</p>
                    </div>
                    
                    <div className="p-3 border border-slate-100 rounded">
                        <p className="font-bold underline mb-1 uppercase tracking-tighter">Điều 2: Thời hạn thực hiện</p>
                        <p className="italic">
                            {isQuote 
                                ? (data.deliveryTerms || `Báo giá có hiệu lực đến ngày ${date(data.validUntil)}.`)
                                : `Từ ngày ${date(data.startDate)} đến ngày ${date(data.endDate)}.`
                            }
                        </p>
                    </div>

                    <div className="p-3 border border-slate-100 rounded">
                        <p className="font-bold underline mb-1 uppercase tracking-tighter">Điều 3: Chế độ bảo hành & Cam kết</p>
                        <p className="italic">{data.warrantyTerms || "Bảo hành theo tiêu chuẩn nhà sản xuất hoặc thỏa thuận kỹ thuật đi kèm."}</p>
                    </div>
                </div>
            </div>

            {/* SIGNATURE AREA */}
            <div className="mt-auto pt-10">
                <div className="flex justify-between text-center">
                    <div className="w-64">
                        <p className="font-black uppercase text-xs mb-1">Đại diện Bên A</p>
                        <p className="text-[9px] text-slate-400 italic mb-12">(Ký, ghi rõ họ tên và đóng dấu)</p>
                        <div className="h-1 bg-slate-100 w-32 mx-auto mb-2"></div>
                        <p className="font-bold text-sm">{data.contactName}</p>
                        <p className="text-[10px] uppercase text-slate-500">{data.contactRole}</p>
                    </div>
                    <div className="w-64">
                        <p className="font-black uppercase text-xs mb-1">Đại diện Bên B</p>
                        <p className="text-[9px] text-slate-400 italic mb-12">(Ký, ghi rõ họ tên và đóng dấu)</p>
                        <div className="h-1 bg-slate-100 w-32 mx-auto mb-2"></div>
                        <p className="font-bold text-sm">NGUYỄN VĂN ADMIN</p>
                        <p className="text-[10px] uppercase text-slate-500">Giám đốc điều hành</p>
                    </div>
                </div>
            </div>

            {/* FOOTER WATERMARK */}
            <div className="mt-20 border-t border-slate-100 pt-4 flex justify-between items-center opacity-30 pointer-events-none">
                <p className="text-[8px] font-sans font-bold uppercase tracking-[0.3em]">Maintech ERP System - Confidential Document</p>
                <p className="text-[8px] font-sans font-bold uppercase tracking-[0.3em]">Trang 1 / 1</p>
            </div>
        </div>
    );
});

DocumentTemplate.displayName = "DocumentTemplate";

export default DocumentTemplate;
