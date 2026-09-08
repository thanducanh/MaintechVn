import PageBanner from "@/components/PageBanner";

const metrics = [
  ["10+", "Năm kinh nghiệm"],
  ["500+", "Dự án hoàn thành"],
  ["24/7", "Hỗ trợ kỹ thuật"],
  ["ISO", "Quy trình kiểm soát chất lượng"],
];

const competencies = [
  "Bảo trì và cải tạo thiết bị nâng hạ cảng biển",
  "Tích hợp điện, điều khiển và tự động hóa công nghiệp",
  "Cung cấp phụ tùng, thiết bị và giải pháp F&B",
  "Khảo sát, thiết kế, lắp đặt và chuyển giao công nghệ",
];

const equipment = ["Cầu trục và cổng trục", "Thiết bị cảng và reach stacker", "Motor, gearbox và tủ điện", "Hệ thống điều khiển và cảm biến"];
const standards = ["ISO 9001:2015", "An toàn thiết bị nâng", "Quy trình nghiệm thu FAT/SAT", "Đào tạo vận hành và bảo trì"];

export default function CapabilitiesPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <PageBanner
        pageKey={"BANNER_CAPABILITIES" as any}
        vi={{ title: "Năng lực Maintech", breadcrumb: "Trang chủ / Năng lực", badge: "Năng lực", desc: "Maintech Vietnam - Chuyên gia trong lĩnh vực" }}
        en={{ title: "Our Capabilities", breadcrumb: "Home / Capabilities", badge: "Capabilities", desc: "Maintech Vietnam - Experts in our field" }}
      />
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {metrics.map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-4xl font-black text-[#C8102E]">{value}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-20 grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#C8102E]">Năng lực cốt lõi</p>
            <h1 className="mt-4 text-4xl font-black uppercase tracking-tight md:text-5xl">Giải pháp kỹ thuật công nghiệp toàn diện</h1>
            <div className="mt-8 space-y-4">
              {competencies.map((item) => <p key={item} className="border-l-4 border-[#C8102E] bg-slate-50 px-5 py-4 font-semibold text-slate-700">{item}</p>)}
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#0B1221] p-8 text-white"><h2 className="text-xl font-black uppercase">Hồ sơ thiết bị</h2><ul className="mt-6 space-y-3 text-sm leading-6 text-slate-300">{equipment.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div className="rounded-2xl border border-slate-200 p-8"><h2 className="text-xl font-black uppercase">Tiêu chuẩn kỹ thuật</h2><ul className="mt-6 space-y-3 text-sm leading-6 text-slate-600">{standards.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </div>
        </div>
      </section>
    </main>
  );
}
