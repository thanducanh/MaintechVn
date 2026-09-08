// src/app/admin/cms/homepage/HomeForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Save, Loader2, Image as ImageIcon, LayoutTemplate, 
    Star, Settings2, Search, CheckCircle2, Globe, MonitorPlay,
    Zap, ListFilter, Layout, MessageSquare, Monitor, Type, 
    ShieldCheck, ArrowUp, ArrowDown, ChevronRight, FileText,
    ExternalLink, Check, Trash, Clock3, Users, Workflow, Globe2, PanelBottom
} from "lucide-react";
import { updateHomepageConfigAction } from "@/actions/home";
import toast from "react-hot-toast";

interface HomeFormProps {
    initialConfig: any;
    articles: any[];
    services: any[];
}

export default function HomeForm({ initialConfig, articles, services }: HomeFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("hero");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Initial parsing of Content JSON
    let parsedContent: any = {};
    try {
        if (initialConfig?.content) {
            parsedContent = JSON.parse(initialConfig.content);
        }
    } catch (e) {
        console.error("Failed to parse initial homepage content:", e);
    }

    // Default configuration objects
    const defaultHero = {
        active: true,
        badge_vi: "Giải pháp kỹ thuật công nghiệp",
        badge_en: "Maintech Industrial Solutions",
        title1_vi: "Kỹ thuật chuyên biệt",
        title1_en: "Specialized Engineering",
        title2_vi: "Hiệu suất tối ưu",
        title2_en: "Optimal Performance",
        desc_vi: "Đơn vị cung cấp giải pháp dịch vụ kỹ thuật công nghiệp hàng đầu...",
        desc_en: "Leading provider of industrial engineering services and solutions...",
        btn1_text_vi: "Dịch vụ của chúng tôi",
        btn1_text_en: "Our Services",
        btn1_link: "/services",
        btn2_text_vi: "Về chúng tôi",
        btn2_text_en: "About Us",
        btn2_link: "/about",
        videoUrl: "",
        sliderImages: [] as string[]
    };

    const defaultTopbar = {
        email: "sales@maintech.vn",
        hotline: "+84 918 458 399",
        address: "TP. Hồ Chí Minh",
        navLinks: [
            { label_vi: "Trang chủ", label_en: "Home", href: "/" },
            { label_vi: "Về chúng tôi", label_en: "About us", href: "/about" },
            { label_vi: "Dịch vụ", label_en: "Services", href: "/services" },
            { label_vi: "Tin tức", label_en: "News", href: "/news" },
            { label_vi: "Liên hệ", label_en: "Contact", href: "/contact" },
        ],
        twitter: "",
        whatsapp: "",
        zalo: ""
    };
    const defaultHeader = { logoUrl: "", brandName: "maintech vietnam.", fontFamily: "sans" };

    const defaultIntro = {
        active: true,
        main_image: "",
        badge_image: "",
        director_name: "Savannah Nguyen",
        director_name_en: "Savannah Nguyen",
        director_role: "CEO & Founder of Manit",
        director_role_en: "CEO & Founder of Manit",
        signature_text: "Savannah Nguyen",
        badge_vi: "VỀ CHÚNG TÔI",
        badge_en: "ABOUT US",
        title_vi: "Đội ngũ Kỹ sư Chuyên nghiệp & Tận tâm",
        title_en: "Professional & Dedicated Engineering Team",
        subtitle_vi: "Hơn 10 năm đồng hành cùng hiệu suất công nghiệp Việt Nam",
        subtitle_en: "Over 10 years accompanying industrial performance in Vietnam",
        lead_vi: "Maintech cung cấp trọn gói dịch vụ từ lắp đặt, bảo trì định kỳ, sửa chữa khẩn cấp đến cải tiến nâng cấp hệ thống máy móc nhà xưởng.",
        lead_en: "Maintech provides full package services from installation, regular maintenance, emergency repair to machinery upgrade.",
        desc_vi: "Chúng tôi sở hữu đội ngũ chuyên gia giàu kinh nghiệm thực chiến trong các ngành cảng biển, sản xuất thép, xi măng, kho bãi logistics, luôn sẵn sàng ứng cứu kỹ thuật 24/7.",
        desc_en: "We own a team of seasoned experts with hands-on experience in maritime, steel manufacturing, cement, and logistics.",
        exp_value: "10+",
        exp_label_vi: "Năm kinh nghiệm thực tế",
        exp_label_en: "Years of Practical Experience",
        proj_value: "500+",
        proj_label_vi: "Dự án hoàn thành quy mô",
        proj_label_en: "Large Scale Projects Completed",
        badges_vi: ["Đạt ISO 9001:2015", "Kỹ sư Kalmar", "Kỹ sư Gottwald"],
        badges_en: ["ISO 9001:2015 Certified", "Kalmar Engineers", "Gottwald Certified"]
    };

    const defaultHighlights = {
        active: true,
        title_vi: "Cam kết Chất lượng từ Maintech",
        title_en: "Quality Commitment from Maintech",
        desc_vi: "Chúng tôi luôn nỗ lực mang lại những dịch vụ tối ưu với tính an toàn cao nhất.",
        desc_en: "We always strive to deliver optimal services with the highest safety.",
        stats: [
            { value: "10+", label_vi: "Kinh nghiệm", label_en: "Experience" },
            { value: "500+", label_vi: "Dự án", label_en: "Projects" },
            { value: "98%", label_vi: "Hài lòng", label_en: "Satisfied" },
            { value: "24/7", label_vi: "Hỗ trợ", label_en: "Support" }
        ],
        cards: [
            { icon: "Users", title_vi: "Đội ngũ chuyên môn", title_en: "Professional Team", desc_vi: "Các kỹ sư được đào tạo chính hãng.", desc_en: "Engineers trained by global brands." },
            { icon: "ShieldCheck", title_vi: "Tiêu chuẩn quốc tế", title_en: "International Standard", desc_vi: "Mọi quy trình đạt kiểm định nghiêm ngặt.", desc_en: "All processes meet strict inspections." },
            { icon: "Target", title_vi: "Mục tiêu hiệu suất", title_en: "Performance Focus", desc_vi: "Giảm thiểu tối đa thời gian dừng máy.", desc_en: "Minimize machinery downtime." },
            { icon: "Award", title_vi: "Uy tín hàng đầu", title_en: "Top Prestige", desc_vi: "Đối tác chiến lược của nhiều tập đoàn lớn.", desc_en: "Strategic partner of major corporations." }
        ]
    };

    const defaultServices = {
        active: true,
        badge_vi: "DỊCH VỤ KỸ THUẬT",
        badge_en: "ENGINEERING SERVICES",
        title_vi: "Dịch vụ kỹ thuật nổi bật",
        title_en: "Featured Engineering Services",
        desc_vi: "Cung cấp các giải pháp tối ưu cho hệ thống thiết bị nâng hạ cảng biển và công nghiệp nặng.",
        desc_en: "Providing optimal solutions for maritime cranes and heavy industrial systems.",
        limit: 10,
        selected_ids: [],
        cards: [
            { order: "01", title_vi: "Bảo trì thiết bị nâng hạ", title_en: "Lifting Equipment Maintenance", desc_vi: "Bảo trì và sửa chữa hệ thống cầu trục an toàn, ổn định.", desc_en: "Safe and reliable crane maintenance and repair.", imageUrl: "", icon: "Wrench" },
            { order: "02", title_vi: "Hệ thống điện điều khiển", title_en: "Electrical Control Systems", desc_vi: "Thiết kế, lắp đặt và nâng cấp tủ điện điều khiển công nghiệp.", desc_en: "Design and upgrade industrial control panels.", imageUrl: "", icon: "Cog" },
            { order: "03", title_vi: "Thiết bị F&B", title_en: "F&B Machinery", desc_vi: "Cung cấp máy móc và giải pháp tự động hóa cho ngành F&B.", desc_en: "Machinery and automation solutions for F&B.", imageUrl: "", icon: "Factory" },
            { order: "04", title_vi: "Tư vấn & Chuyển giao công nghệ", title_en: "Technology Consulting & Transfer", desc_vi: "Hỗ trợ kỹ thuật, đào tạo vận hành và chuyển giao công nghệ tự động hóa tiên tiến cho nhà máy.", desc_en: "Technical support, training, and advanced automation technology transfer.", imageUrl: "", icon: "Gauge" },
        ]
    };

    const defaultProcess = {
        steps: [
            { image: "", title_vi: "Khảo sát & Tư vấn", title_en: "Survey & Consulting", desc_vi: "Khảo sát hiện trạng và tư vấn giải pháp phù hợp.", desc_en: "Survey the site and recommend the right solution." },
            { image: "", title_vi: "Thiết kế kỹ thuật", title_en: "Technical Design", desc_vi: "Lập bản vẽ, cấu hình thiết bị và phương án thi công.", desc_en: "Prepare drawings, equipment specifications and execution plans." },
            { image: "", title_vi: "Thi công & Lắp đặt", title_en: "Construction & Installation", desc_vi: "Thi công an toàn, đúng tiến độ và tiêu chuẩn kỹ thuật.", desc_en: "Execute safely, on schedule and to technical standards." },
            { image: "", title_vi: "Kiểm định & Bàn giao", title_en: "Inspection & Handover", desc_vi: "Kiểm định, hướng dẫn vận hành và bàn giao hệ thống.", desc_en: "Inspect, train operators and hand over the system." },
        ]
    };
    const defaultFooter = {
        slogan_vi: "Cung cấp giải pháp kỹ thuật và thiết bị công nghiệp hàng đầu tại Việt Nam.", slogan_en: "Leading industrial engineering and equipment solutions in Vietnam.",
        facebook: "", linkedin: "", youtube: "", twitter: "", whatsapp: "", zalo: "",
        nav_title_vi: "Điều hướng", nav_title_en: "Navigation",
        office: "TP. Hồ Chí Minh, Việt Nam", factory: "Khu vực phía Nam", phone: "+84 918 458 399", email: "mtv@maintechvn.com.vn",
        copyright_year: "2026", tax_id: "3702888448", representative_vi: "Nguyễn Đình Thanh", representative_en: "Nguyen Dinh Thanh",
    };

    const defaultProducts = {
        active: true,
        badge_vi: "THIẾT BỊ CHÍNH HÃNG",
        badge_en: "GENUINE EQUIPMENT",
        title_vi: "Thiết bị công nghiệp tiêu biểu",
        title_en: "Featured Industrial Equipment",
        desc_vi: "Các dòng sản phẩm nâng hạ, phụ tùng thay thế chính hãng chất lượng cao.",
        desc_en: "Genuine high-quality maritime lifting products and replacement parts.",
        limit: 4,
        selected_ids: []
    };

    const defaultNews = {
        active: true,
        badge_vi: "TIN TỨC - DỰ ÁN",
        badge_en: "NEWS - PROJECTS",
        title_vi: "Tin tức nổi bật từ Maintech",
        title_en: "Featured News & Projects",
        limit: 3,
        selected_ids: []
    };

    const defaultPartners = {
        active: true,
        badge_vi: "HỢP TÁC CHIẾN LƯỢC",
        badge_en: "STRATEGIC PARTNERSHIP",
        desc_vi: "Đồng hành lâu dài cùng những tập đoàn công nghiệp và logistics hàng đầu thế giới.",
        desc_en: "Long-term partnership with leading global industrial and logistics corporations."
    };

    const defaultCta = {
        active: true,
        badge_vi: "Sẵn sàng hợp tác",
        badge_en: "Ready to partner",
        title_vi: "Bạn đã sẵn sàng nâng tầm hiệu suất hệ thống?",
        title_en: "Are you ready to optimize system performance?",
        desc_vi: "Hãy liên hệ ngay với đội ngũ kỹ sư chuyên gia của chúng tôi để nhận tư vấn và báo giá tối ưu nhất.",
        desc_en: "Contact our expert engineering team now to receive the most optimal consultation and quote.",
        btn1_text_vi: "Gửi Email",
        btn1_text_en: "Send Email",
        btn1_link: "mailto:mtv@maintechvn.com.vn",
        btn2_text_vi: "Hotline Tư Vấn",
        btn2_text_en: "Call Hotline",
        btn2_link: "tel:0918458399",
        trust_items_vi: ["Báo giá miễn phí", "Hỗ trợ 24/7", "Kỹ sư chứng chỉ", "Bảo hành chính hãng"],
        trust_items_en: ["Free Quotation", "24/7 Support", "Certified Engineers", "Genuine Warranty"]
    };

    const defaultHistory = {
        videoUrl: "",
        badge_vi: "LỊCH SỬ CÔNG TY", badge_en: "OUR HISTORY",
        title_vi: "Hành trình phát triển, hiện tại và tương lai", title_en: "Company history, present and the future",
        desc_vi: "Maintech Vietnam không ngừng phát triển cùng các giải pháp kỹ thuật công nghiệp đáng tin cậy.", desc_en: "Maintech Vietnam continues to grow with reliable industrial engineering solutions.",
        button_vi: "KHÁM PHÁ THÊM", button_en: "DISCOVER MORE", button_link: "/about", image: "", backgroundImage: "", overlayOpacity: 85
    };
    const defaultTeam = {
        badge_vi: "ĐỘI NGŨ CHUYÊN GIA", badge_en: "EXPERT TEAM",
        title_vi: "Đội ngũ chuyên gia của chúng tôi", title_en: "Our Expert Team",
        members: [
            { image: "", name: "Robert Fox", role_vi: "Trưởng nhóm kỹ thuật", role_en: "Technical Leader" },
            { image: "", name: "Kristin Watson", role_vi: "Quản lý dự án", role_en: "Project Manager" },
            { image: "", name: "Savannah Nguyen", role_vi: "Giám đốc điều hành", role_en: "Executive Director" },
            { image: "", name: "Courtney Henry", role_vi: "Kỹ sư trưởng", role_en: "Lead Engineer" },
        ]
    };

    // --- Dynamic Controlled States ---
    const [hero, setHero] = useState({ ...defaultHero, ...parsedContent.hero });
    const [topbar, setTopbar] = useState({ ...defaultTopbar, ...parsedContent.topbar });
    const [headerConf, setHeaderConf] = useState({ ...defaultHeader, ...parsedContent.header });
    const [headerLogoFile, setHeaderLogoFile] = useState<File | null>(null);
    const [headerLogoPreview, setHeaderLogoPreview] = useState<string>(parsedContent.header?.logoUrl || "");
    const [intro, setIntro] = useState({ ...defaultIntro, ...parsedContent.intro });
    const [highlights, setHighlights] = useState({ ...defaultHighlights, ...parsedContent.highlights });
    const [servicesConf, setServicesConf] = useState({ ...defaultServices, ...parsedContent.services });
    const [processConf, setProcessConf] = useState({ ...defaultProcess, ...parsedContent.process, steps: (() => { const current = parsedContent.process?.steps || defaultProcess.steps; return current.length >= 6 ? current : [...current, { image: "", title_vi: "Nghiệm thu & Bàn giao", title_en: "Acceptance & Handover", desc_vi: "Nghiệm thu chất lượng và hoàn tất bàn giao cho khách hàng.", desc_en: "Complete quality acceptance and deliver the project." }, { image: "", title_vi: "Bảo trì & Đồng hành", title_en: "Maintenance & Support", desc_vi: "Tiếp tục bảo trì, hỗ trợ và đồng hành lâu dài.", desc_en: "Continue maintenance, support and long-term partnership." }].slice(0, 6); })() });
    const [footerConf, setFooterConf] = useState({ ...defaultFooter, ...parsedContent.footer });
    const [history, setHistory] = useState({ ...defaultHistory, ...parsedContent.history });
    const [historyVideoFile, setHistoryVideoFile] = useState<File | null>(null);
    const [historyMediaRemoved, setHistoryMediaRemoved] = useState(false);
    const [historyBackgroundRemoved, setHistoryBackgroundRemoved] = useState(false);
    const [team, setTeam] = useState({ ...defaultTeam, ...parsedContent.team, members: parsedContent.team?.members || defaultTeam.members });
    const [productsConf, setProductsConf] = useState({ ...defaultProducts, ...parsedContent.products });
    const [newsConf, setNewsConf] = useState({ ...defaultNews, ...parsedContent.news });
    const [partners, setPartners] = useState({ ...defaultPartners, ...parsedContent.partners });
    const [cta, setCta] = useState({ ...defaultCta, ...parsedContent.cta });

    // File Preview state
    const [imagePreview, setImagePreview] = useState<string | null>(initialConfig?.imageUrl || null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Hero Background image & Overlay states
    const [heroBgPreview, setHeroBgPreview] = useState<string | null>(hero.backgroundImage || null);
    const [heroBgFile, setHeroBgFile] = useState<File | null>(null);
    const [heroBgDeleted, setHeroBgDeleted] = useState<boolean>(false);
    // Hero Background Video states
    const [heroVideoPreview, setHeroVideoPreview] = useState<string | null>(hero.videoUrl || null);
    const [heroVideoFile, setHeroVideoFile] = useState<File | null>(null);
    const [heroVideoDeleted, setHeroVideoDeleted] = useState<boolean>(false);
    const [heroSliderImages, setHeroSliderImages] = useState<string[]>(Array.isArray(hero.sliderImages) ? hero.sliderImages.slice(0, 5) : []);
    const [heroSliderFiles, setHeroSliderFiles] = useState<File[]>([]);
    const [heroOverlayOpacity, setHeroOverlayOpacity] = useState<number>(
        typeof hero.overlayOpacity === 'number' ? hero.overlayOpacity : 0.4
    );
    const [mockupLang, setMockupLang] = useState<"VI" | "EN">("VI");

    // Active Selection Logic (auto/latest vs manual)
    const [servicesMode, setServicesMode] = useState<"auto" | "manual">(
        parsedContent.services?.selected_ids && parsedContent.services.selected_ids.length > 0 ? "manual" : "auto"
    );
    const [productsMode, setProductsMode] = useState<"auto" | "manual">(
        parsedContent.products?.selected_ids && parsedContent.products.selected_ids.length > 0 ? "manual" : "auto"
    );
    const [newsMode, setNewsMode] = useState<"auto" | "manual">(
        parsedContent.news?.selected_ids && parsedContent.news.selected_ids.length > 0 ? "manual" : "auto"
    );

    // Selected array states for manual checkbox click-to-reorder list
    const [selectedServices, setSelectedServices] = useState<number[]>(servicesConf.selected_ids || []);
    const [selectedProducts, setSelectedProducts] = useState<number[]>(productsConf.selected_ids || []);
    const [selectedNews, setSelectedNews] = useState<number[]>(newsConf.selected_ids || []);

    // Filter services lists
    // Match the Services CMS/public page exactly: every active service record,
    // in the same order, regardless of its display category label.
    const activeDbServices = services;
    const activeDbProducts = services.filter(s => s.category?.includes("THIET_BI") || s.category?.includes("SAN_PHAM") || s.category?.includes("THIET_BI_NANG_HA"));

    // Real-time Bilingual Validation Status Checked List (15 key English fields)
    const [enFields, setEnFields] = useState({
        hero_title1_en: hero.title1_en || "",
        hero_title2_en: hero.title2_en || "",
        hero_desc_en: hero.desc_en || "",
        intro_title_en: intro.title_en || "",
        intro_lead_en: intro.lead_en || "",
        intro_desc_en: intro.desc_en || "",
        highlights_title_en: highlights.title_en || "",
        highlights_desc_en: highlights.desc_en || "",
        services_title_en: servicesConf.title_en || "",
        services_desc_en: servicesConf.desc_en || "",
        products_title_en: productsConf.title_en || "",
        products_desc_en: productsConf.desc_en || "",
        news_title_en: newsConf.title_en || "",
        cta_title_en: cta.title_en || "",
        cta_desc_en: cta.desc_en || ""
    });

    // Handle updates to key English input fields in real-time
    const handleEnChange = (key: string, val: string) => {
        setEnFields(prev => ({ ...prev, [key]: val }));
        setHasUnsavedChanges(true);
    };

    // Calculate dynamic bilingual validation state
    const isBilingualComplete = 
        enFields.hero_title1_en.trim() !== "" &&
        enFields.hero_title2_en.trim() !== "" &&
        enFields.hero_desc_en.trim() !== "" &&
        enFields.intro_title_en.trim() !== "" &&
        enFields.intro_lead_en.trim() !== "" &&
        enFields.intro_desc_en.trim() !== "" &&
        enFields.highlights_title_en.trim() !== "" &&
        enFields.highlights_desc_en.trim() !== "" &&
        enFields.services_title_en.trim() !== "" &&
        enFields.services_desc_en.trim() !== "" &&
        enFields.products_title_en.trim() !== "" &&
        enFields.products_desc_en.trim() !== "" &&
        enFields.news_title_en.trim() !== "" &&
        enFields.cta_title_en.trim() !== "" &&
        enFields.cta_desc_en.trim() !== "";

    // Image upload handler
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.currentTarget?.files?.[0];
        if (!file || file.size <= 0) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setHasUnsavedChanges(true);
        e.currentTarget.value = "";
    };

    // Move Selected Items Up/Down helper
    const moveItem = (listType: "services" | "products" | "news", index: number, direction: "up" | "down") => {
        const targetList = listType === "services" ? [...selectedServices] : listType === "products" ? [...selectedProducts] : [...selectedNews];
        const newIndex = direction === "up" ? index - 1 : index + 1;
        
        if (newIndex < 0 || newIndex >= targetList.length) return;
        
        // Swap items
        const temp = targetList[index];
        targetList[index] = targetList[newIndex];
        targetList[newIndex] = temp;

        if (listType === "services") setSelectedServices(targetList);
        else if (listType === "products") setSelectedProducts(targetList);
        else setSelectedNews(targetList);

        setHasUnsavedChanges(true);
    };

    // Toggle Checkbox selection helper
    const toggleSelectItem = (listType: "services" | "products" | "news", id: number) => {
        const targetList = listType === "services" ? [...selectedServices] : listType === "products" ? [...selectedProducts] : [...selectedNews];
        let newList;
        if (targetList.includes(id)) {
            newList = targetList.filter(item => item !== id);
        } else {
            newList = [...targetList, id];
        }

        if (listType === "services") setSelectedServices(newList);
        else if (listType === "products") setSelectedProducts(newList);
        else setSelectedNews(newList);

        setHasUnsavedChanges(true);
    };

    // Form Submission Action
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading("Đang lưu cấu hình trang chủ...");

        try {
            const formData = new FormData();
            
            // File append if any
            if (imageFile) {
                formData.append("image_file", imageFile);
            }
            if (initialConfig?.imageUrl) {
                formData.append("imageUrl", initialConfig.imageUrl);
            }

            // Toggles
            formData.append("topbar_email", topbar.email);
            formData.append("topbar_hotline", topbar.hotline);
            formData.append("topbar_address", topbar.address);
            formData.append("topbar_twitter", topbar.twitter);
            formData.append("topbar_whatsapp", topbar.whatsapp);
            formData.append("topbar_zalo", topbar.zalo);
            formData.append("topbar_nav_links", JSON.stringify(topbar.navLinks || []));
            if (headerLogoFile) formData.append("header_logo_file", headerLogoFile);
            formData.append("header_logo_url", headerLogoPreview || headerConf.logoUrl || "");
            formData.append("header_brand_name", headerConf.brandName || "");
            formData.append("header_font_family", headerConf.fontFamily || "sans");
            formData.append("process_steps", JSON.stringify(processConf.steps));
            Object.entries(footerConf).forEach(([key, value]) => formData.append(`footer_${key}`, String(value ?? "")));
            formData.append("intro_active", intro.active ? "true" : "false");
            formData.append("intro_main_image", intro.main_image || "");
            formData.append("intro_badge_image", intro.badge_image || "");
            formData.append("intro_director_name", intro.director_name || "");
            formData.append("intro_director_name_en", intro.director_name_en || "");
            formData.append("intro_director_role", intro.director_role || "");
            formData.append("intro_director_role_en", intro.director_role_en || "");
            formData.append("intro_signature_text", intro.signature_text || "");
            formData.append("highlights_active", highlights.active ? "true" : "false");
            formData.append("products_active", "false");
            formData.append("news_active", newsConf.active ? "true" : "false");
            formData.append("partners_active", partners.active ? "true" : "false");
            formData.append("cta_active", cta.active ? "true" : "false");

            // Hero values
            formData.append("hero_badge_vi", hero.badge_vi || "");
            formData.append("hero_badge_en", hero.badge_en || "");
            formData.append("hero_title1_vi", hero.title1_vi || "");
            formData.append("hero_title1_en", enFields.hero_title1_en || "");
            formData.append("hero_title2_vi", hero.title2_vi || "");
            formData.append("hero_title2_en", enFields.hero_title2_en || "");
            formData.append("hero_desc_vi", hero.desc_vi || "");
            formData.append("hero_desc_en", enFields.hero_desc_en || "");
            
            // Hero Background image & overlay opacity
            if (heroBgFile) {
                formData.append("hero_bg_file", heroBgFile);
            }
            formData.append("hero_bg_deleted", heroBgDeleted ? "true" : "false");
            formData.append("hero_background_image", heroBgPreview || "");
            
            // Hero Background video
            if (heroVideoFile) {
                formData.append("hero_video_file", heroVideoFile);
            }
            formData.append("hero_video_deleted", heroVideoDeleted ? "true" : "false");
            formData.append("hero_video_url", heroVideoPreview || "");
            formData.append("hero_slider_existing", JSON.stringify(heroSliderImages.filter((url) => !url.startsWith("blob:"))));
            heroSliderFiles.slice(0, 5).forEach((file) => formData.append("hero_slider_files", file));
            
            formData.append("hero_overlay_opacity", String(heroOverlayOpacity));
            formData.append("hero_btn1_text_vi", hero.btn1_text_vi || "");
            formData.append("hero_btn1_text_en", hero.btn1_text_en || "");
            formData.append("hero_btn1_link", hero.btn1_link || "");
            formData.append("hero_btn2_text_vi", hero.btn2_text_vi || "");
            formData.append("hero_btn2_text_en", hero.btn2_text_en || "");
            formData.append("hero_btn2_link", hero.btn2_link || "");

            // Intro values
            formData.append("intro_badge_vi", intro.badge_vi || "");
            formData.append("intro_badge_en", intro.badge_en || "");
            formData.append("intro_title_vi", intro.title_vi || "");
            formData.append("intro_title_en", enFields.intro_title_en || "");
            formData.append("intro_subtitle_vi", intro.subtitle_vi || "");
            formData.append("intro_subtitle_en", intro.subtitle_en || "");
            formData.append("intro_lead_vi", intro.lead_vi || "");
            formData.append("intro_lead_en", enFields.intro_lead_en || "");
            formData.append("intro_desc_vi", intro.desc_vi || "");
            formData.append("intro_desc_en", enFields.intro_desc_en || "");
            formData.append("intro_exp_value", intro.exp_value || "");
            formData.append("intro_exp_label_vi", intro.exp_label_vi || "");
            formData.append("intro_exp_label_en", intro.exp_label_en || "");
            formData.append("intro_proj_value", intro.proj_value || "");
            formData.append("intro_proj_label_vi", intro.proj_label_vi || "");
            formData.append("intro_proj_label_en", intro.proj_label_en || "");
            formData.append("intro_badges_vi", JSON.stringify(intro.badges_vi || []));
            formData.append("intro_badges_en", JSON.stringify(intro.badges_en || []));

            // Highlights
            formData.append("highlights_title_vi", highlights.title_vi || "");
            formData.append("highlights_title_en", enFields.highlights_title_en || "");
            formData.append("highlights_desc_vi", highlights.desc_vi || "");
            formData.append("highlights_desc_en", enFields.highlights_desc_en || "");
            formData.append("highlights_stats", JSON.stringify(highlights.stats || []));
            formData.append("highlights_cards", JSON.stringify(highlights.cards || []));

            // Services
            formData.append("services_badge_vi", servicesConf.badge_vi || "");
            formData.append("services_badge_en", servicesConf.badge_en || "");
            formData.append("services_title_vi", servicesConf.title_vi || "");
            formData.append("services_title_en", enFields.services_title_en || "");
            formData.append("services_desc_vi", servicesConf.desc_vi || "");
            formData.append("services_desc_en", enFields.services_desc_en || "");
            formData.append("services_cards", JSON.stringify(servicesConf.cards || []));
            formData.append("history_badge_vi", history.badge_vi || "");
            formData.append("history_badge_en", history.badge_en || "");
            formData.append("history_title_vi", history.title_vi || "");
            formData.append("history_title_en", history.title_en || "");
            formData.append("history_desc_vi", history.desc_vi || "");
            formData.append("history_desc_en", history.desc_en || "");
            formData.append("history_button_vi", history.button_vi || "");
            formData.append("history_button_en", history.button_en || "");
            formData.append("history_button_link", history.button_link || "");
            formData.append("history_image", history.image || "");
            if (historyVideoFile) formData.append("history_video_file", historyVideoFile);
            formData.append("history_video_url", history.videoUrl || "");
            formData.append("history_media_removed", historyMediaRemoved ? "true" : "false");
            formData.append("history_background_image", history.backgroundImage || "");
            formData.append("history_background_removed", historyBackgroundRemoved ? "true" : "false");
            formData.append("history_overlay_opacity", String(history.overlayOpacity ?? 85));
            formData.append("team_badge_vi", team.badge_vi || "");
            formData.append("team_badge_en", team.badge_en || "");
            formData.append("team_title_vi", team.title_vi || "");
            formData.append("team_title_en", team.title_en || "");
            formData.append("team_members", JSON.stringify(team.members || []));

            // Products
            formData.append("products_badge_vi", productsConf.badge_vi || "");
            formData.append("products_badge_en", productsConf.badge_en || "");
            formData.append("products_title_vi", productsConf.title_vi || "");
            formData.append("products_title_en", enFields.products_title_en || "");
            formData.append("products_desc_vi", productsConf.desc_vi || "");
            formData.append("products_desc_en", enFields.products_desc_en || "");
            formData.append("products_limit", String(productsConf.limit || 4));
            formData.append("products_selected_ids", JSON.stringify(productsMode === "manual" ? selectedProducts : []));

            // News
            formData.append("news_badge_vi", newsConf.badge_vi || "");
            formData.append("news_badge_en", newsConf.badge_en || "");
            formData.append("news_title_vi", newsConf.title_vi || "");
            formData.append("news_title_en", enFields.news_title_en || "");
            formData.append("news_limit", String(newsConf.limit || 3));
            formData.append("news_selected_ids", JSON.stringify(newsMode === "manual" ? selectedNews : []));

            // Partners
            formData.append("partners_badge_vi", partners.badge_vi || "");
            formData.append("partners_badge_en", partners.badge_en || "");
            formData.append("partners_desc_vi", partners.desc_vi || "");
            formData.append("partners_desc_en", partners.desc_en || "");

            // CTA
            formData.append("cta_badge_vi", cta.badge_vi || "");
            formData.append("cta_badge_en", cta.badge_en || "");
            formData.append("cta_title_vi", cta.title_vi || "");
            formData.append("cta_title_en", enFields.cta_title_en || "");
            formData.append("cta_desc_vi", cta.desc_vi || "");
            formData.append("cta_desc_en", enFields.cta_desc_en || "");
            formData.append("cta_btn1_text_vi", cta.btn1_text_vi || "");
            formData.append("cta_btn1_text_en", cta.btn1_text_en || "");
            formData.append("cta_btn1_link", cta.btn1_link || "");
            formData.append("cta_btn2_text_vi", cta.btn2_text_vi || "");
            formData.append("cta_btn2_text_en", cta.btn2_text_en || "");
            formData.append("cta_btn2_link", cta.btn2_link || "");
            formData.append("cta_trust_items_vi", JSON.stringify(cta.trust_items_vi || []));
            formData.append("cta_trust_items_en", JSON.stringify(cta.trust_items_en || []));

            const res = await updateHomepageConfigAction(formData);
            if (res?.success) {
                toast.success("✅ Đã lưu cấu hình Trang chủ thành công!", { id: toastId });
                setHasUnsavedChanges(false);
                setHeroBgFile(null);
                setHeroBgDeleted(false);
                setHeroVideoFile(null);
                setHeroVideoDeleted(false);
                
                // Sync client previews with server uploaded paths to avoid blob URL stale states
                if (res.heroBgPath !== undefined) {
                    setHeroBgPreview(res.heroBgPath || null);
                }
                if (res.heroVideoPath !== undefined) {
                    setHeroVideoPreview(res.heroVideoPath || null);
                }
                if (res.imagePath !== undefined) {
                    setImagePreview(res.imagePath || null);
                    setImageFile(null);
                }

                router.refresh();
            } else {
                toast.error("❌ Lỗi: " + (res?.error || "Không rõ nguyên nhân"), { id: toastId });
            }
        } catch (e: any) {
            toast.error("❌ Lỗi kết nối hệ thống: " + e.message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    // Sidebar navigation tabs structure
    const tabs = [
        { id: "topbar", name: "Top Bar & Header", icon: <Globe className="h-4 w-4 stroke-[1.5]" /> },
        { id: "hero", name: "Banner & Hero", icon: <MonitorPlay className="h-4 w-4 stroke-[1.5]" /> },
        { id: "intro", name: "Giới thiệu nhanh", icon: <Type className="h-4 w-4 stroke-[1.5]" /> },
        { id: "services", name: "Dịch vụ nổi bật", icon: <Settings2 className="h-4 w-4 stroke-[1.5]" /> },
        { id: "history", name: "Lịch sử công ty", icon: <Clock3 className="h-4 w-4 stroke-[1.5]" /> },
        { id: "team", name: "Đội ngũ chuyên gia", icon: <Users className="h-4 w-4 stroke-[1.5]" /> },
        { id: "news", name: "Tin tức", icon: <ListFilter className="h-4 w-4 stroke-[1.5]" /> },
        { id: "partners", name: "Đối tác chiến lược", icon: <ShieldCheck className="h-4 w-4 stroke-[1.5]" /> },
        { id: "cta", name: "Nút kêu gọi (CTA)", icon: <Layout className="h-4 w-4 stroke-[1.5]" /> },
    ];

    const cmsTabs = [
        { id: "topbar", name: "Top Bar & Header", icon: <Globe className="h-4 w-4 stroke-[1.5]" /> },
        { id: "hero", name: "Banner & Hero", icon: <MonitorPlay className="h-4 w-4 stroke-[1.5]" /> },
        { id: "intro", name: "Giới thiệu nhanh", icon: <Type className="h-4 w-4 stroke-[1.5]" /> },
        { id: "services", name: "Dịch vụ nổi bật", icon: <Settings2 className="h-4 w-4 stroke-[1.5]" /> },
        { id: "history", name: "Lịch sử công ty", icon: <Clock3 className="h-4 w-4 stroke-[1.5]" /> },
        { id: "team", name: "Đội ngũ chuyên gia", icon: <Users className="h-4 w-4 stroke-[1.5]" /> },
        { id: "news", name: "Tin tức", icon: <ListFilter className="h-4 w-4 stroke-[1.5]" /> },
        { id: "process", name: "Quy trình làm việc", icon: <Workflow className="h-4 w-4 stroke-[1.5]" /> },
        { id: "footer", name: "Chân trang (Footer)", icon: <PanelBottom className="h-4 w-4 stroke-[1.5]" /> },
    ];

    // Total elements counters for actual live status checking
    const totalSelectedServices = servicesMode === "manual" ? selectedServices.length : activeDbServices.length;
    const totalSelectedProducts = productsMode === "manual" ? selectedProducts.length : activeDbProducts.slice(0, productsConf.limit).length;
    const totalSelectedNews = newsMode === "manual" ? selectedNews.length : articles.slice(0, newsConf.limit).length;

    return (
        <div className="h-full flex flex-col overflow-hidden space-y-5 flex-1 min-h-0">
            <div className="hidden">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm transition-colors">
                        <LayoutTemplate className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            Quản trị Trang chủ
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="submit"
                        form="homepage-form"
                        disabled={loading}
                        className="inline-flex items-center justify-center whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 py-2 h-10 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-bold shadow-sm gap-2 active:scale-98"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {loading ? "Đang lưu..." : "Lưu cấu hình"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-6 xl:gap-8 items-start flex-1 min-h-0 overflow-hidden">
                
                {/* Left Sidebar Menu Column */}
                <aside className="self-start flex flex-col space-y-4 w-full shrink-0">
                    {/* Vertical Tabs List */}
                    <div className="flex flex-col space-y-1 p-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden shrink-0">
                        {cmsTabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-all duration-200 rounded-xl text-left border-l-4 ${
                                        isActive
                                            ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-premium-red rounded-l-none pl-3 shadow-sm"
                                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white border-transparent pl-4"
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.name}
                                </button>
                            );
                        })}
                    </div>


                    <button type="submit" form="homepage-form" disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:pointer-events-none disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {loading ? "Đang lưu..." : "Lưu cấu hình"}
                    </button>
                </aside>

                {/* Right Pane Config Areas */}
                <div className="relative h-full flex flex-col bg-white dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-4 md:p-6 overflow-hidden shadow-sm">
                    
                    {/* Global Unsaved Changes Warning Badge */}
                    {hasUnsavedChanges && (
                        <div className="mb-4 py-1.5 px-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-semibold rounded-lg flex items-center gap-2 animate-fadeIn shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Bạn có thay đổi chưa lưu. Hãy nhớ bấm &quot;Lưu cấu hình&quot; ở góc trên bên phải để cập nhật.
                        </div>
                    )}

                    <form id="homepage-form" onSubmit={handleSave} onChange={() => setHasUnsavedChanges(true)} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className="flex-1 overflow-y-auto pr-1.5 scrollbar-thin space-y-5 pb-6">

                    {activeTab === "topbar" && (
                        <div className="space-y-5 pt-1">
                            <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><Globe className="h-4 w-4 text-red-600" /> Thông tin liên hệ</h3>
                                <div className="grid gap-4 md:grid-cols-4">
                                    {([['email', 'Email'], ['hotline', 'Hotline'], ['address', 'Địa chỉ']] as const).map(([key, label]) => (
                                        <label key={key} className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            {label}
                                            <input value={topbar[key]} onChange={(e) => setTopbar({ ...topbar, [key]: e.target.value })} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
                                        </label>
                                    ))}
                                </div>
                            </section>
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                                <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Mạng xã hội</h3>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {([['twitter', 'Twitter (X) URL'], ['whatsapp', 'WhatsApp URL / Phone'], ['zalo', 'Zalo Link / Hotline']] as const).map(([key, label]) => (
                                        <label key={key} className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            {label}
                                            <input value={topbar[key]} onChange={(e) => setTopbar({ ...topbar, [key]: e.target.value })} placeholder="https://" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
                                        </label>
                                    ))}
                                </div>
                            </section>
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                                <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Header / Logo</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300"><span>Logo thương hiệu</span><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(e) => { const file = e.currentTarget.files?.[0]; if (!file) return; setHeaderLogoFile(file); setHeaderLogoPreview(URL.createObjectURL(file)); setHasUnsavedChanges(true); }} className="block w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300" />{headerLogoPreview && <div className="relative h-20 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700"><img src={headerLogoPreview} alt="Logo preview" className="h-full w-full object-contain" /><button type="button" onClick={() => { setHeaderLogoFile(null); setHeaderLogoPreview(""); setHeaderConf({ ...headerConf, logoUrl: "" }); setHasUnsavedChanges(true); }} className="absolute right-1 top-1 rounded-full bg-[#C8102E] px-1.5 text-xs text-white">×</button></div>}</div>
                                    <label className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">Tên thương hiệu<input value={headerConf.brandName} onChange={(e) => setHeaderConf({ ...headerConf, brandName: e.target.value })} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white" /></label>
                                    <label className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">Font chữ logo<select value={headerConf.fontFamily} onChange={(e) => setHeaderConf({ ...headerConf, fontFamily: e.target.value })} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"><option value="sans">Minimal Sans</option><option value="montserrat">Montserrat</option><option value="inter">Inter</option><option value="roboto">Roboto</option><option value="playfair">Playfair Display</option><option value="oswald">Oswald</option><option value="bangers">Bangers</option><option value="pacifico">Pacifico / Sailo Script</option><option value="great-vibes">Great Vibes</option><option value="be-vietnam">Be Vietnam Pro</option><option value="space-grotesk">Space Grotesk</option></select></label>
                                </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* --- TAB 1: HERO & QUICK LINKS --- */}
                    {activeTab === "hero" && (
                        <div className="flex flex-col space-y-6 pt-1">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Mã nhãn VI (Badge)</label>
                                        <input 
                                            value={hero.badge_vi} 
                                            onChange={e => setHero(prev => ({ ...prev, badge_vi: e.target.value }))}
                                            className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Tiêu đề dòng 1 VI</label>
                                        <input 
                                            value={hero.title1_vi} 
                                            onChange={e => setHero(prev => ({ ...prev, title1_vi: e.target.value }))}
                                            className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Tiêu đề dòng 2 VI</label>
                                        <input 
                                            value={hero.title2_vi} 
                                            onChange={e => setHero(prev => ({ ...prev, title2_vi: e.target.value }))}
                                            className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Mô tả chi tiết VI</label>
                                        <textarea 
                                            value={hero.desc_vi} 
                                            onChange={e => setHero(prev => ({ ...prev, desc_vi: e.target.value }))}
                                            rows={3}
                                            className="w-full h-28 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650 resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5">Mã nhãn EN (Badge)</label>
                                        <input 
                                            value={hero.badge_en} 
                                            onChange={e => setHero(prev => ({ ...prev, badge_en: e.target.value }))}
                                            className="w-full h-10 px-4 bg-amber-500/[0.03] dark:bg-amber-500/[0.01] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5 flex justify-between items-center">
                                            Tiêu đề dòng 1 EN
                                            {enFields.hero_title1_en.trim() === "" && <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded font-black">YÊU CẦU EN</span>}
                                        </label>
                                        <input 
                                            value={enFields.hero_title1_en} 
                                            onChange={e => handleEnChange("hero_title1_en", e.target.value)}
                                            className="w-full h-10 px-4 bg-amber-500/[0.03] dark:bg-amber-500/[0.01] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5 flex justify-between items-center">
                                            Tiêu đề dòng 2 EN
                                            {enFields.hero_title2_en.trim() === "" && <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded font-black">YÊU CẦU EN</span>}
                                        </label>
                                        <input 
                                            value={enFields.hero_title2_en} 
                                            onChange={e => handleEnChange("hero_title2_en", e.target.value)}
                                            className="w-full h-10 px-4 bg-amber-500/[0.03] dark:bg-amber-500/[0.01] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5 flex justify-between items-center">
                                            Mô tả chi tiết EN
                                            {enFields.hero_desc_en.trim() === "" && <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded font-black">YÊU CẦU EN</span>}
                                        </label>
                                        <textarea 
                                            value={enFields.hero_desc_en} 
                                            onChange={e => handleEnChange("hero_desc_en", e.target.value)}
                                            rows={3}
                                            className="w-full h-28 px-4 py-2.5 bg-amber-500/[0.03] dark:bg-amber-500/[0.01] border border-[#f59e0b]/30 rounded-xl text-sm font-medium text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Buttons actions configs */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Nút Hành động 1 (Primary CTA)</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-slate-500 mb-1 block">Tên nút (VI)</label>
                                            <input value={hero.btn1_text_vi} onChange={e => setHero(prev => ({ ...prev, btn1_text_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 mb-1 block">Tên nút (EN)</label>
                                            <input value={hero.btn1_text_en} onChange={e => setHero(prev => ({ ...prev, btn1_text_en: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 mb-1 block">Đường dẫn liên kết</label>
                                        <input value={hero.btn1_link} onChange={e => setHero(prev => ({ ...prev, btn1_link: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-800 dark:text-white outline-none focus:border-red-650" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Nút Hành động 2 (Secondary CTA)</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-slate-500 mb-1 block">Tên nút (VI)</label>
                                            <input value={hero.btn2_text_vi} onChange={e => setHero(prev => ({ ...prev, btn2_text_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 mb-1 block">Tên nút (EN)</label>
                                            <input value={hero.btn2_text_en} onChange={e => setHero(prev => ({ ...prev, btn2_text_en: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 mb-1 block">Đường dẫn liên kết</label>
                                        <input value={hero.btn2_link} onChange={e => setHero(prev => ({ ...prev, btn2_link: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-800 dark:text-white outline-none focus:border-red-650" />
                                    </div>
                                </div>
                            </div>

                            {/* BACKGROUND & OVERLAY MOCKUP */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-850 dark:text-white">Hình nền & Hiệu ứng lớp phủ</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cấu hình hình ảnh nền phía sau và lớp phủ mờ tối ưu hóa tương phản văn bản.</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Control panel */}
                                    <div className="lg:col-span-1 space-y-5">
                                        {/* Background Upload Frame */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block">Ảnh nền Banner</label>
                                            
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                multiple
                                                id="hero-bg-file" 
                                                onChange={(e) => {
                                                    const files = Array.from(e.currentTarget.files || []).slice(0, 5);
                                                    if (files.length) {
                                                        setHeroBgFile(files[0]);
                                                        setHeroBgPreview(URL.createObjectURL(files[0]));
                                                        setHeroSliderFiles(files);
                                                        setHeroSliderImages(files.map((file) => URL.createObjectURL(file)).slice(0, 5));
                                                        setHeroBgDeleted(false);
                                                        setHasUnsavedChanges(true);
                                                    }
                                                }} 
                                                className="hidden" 
                                            /> 
                                            
                                            <div className="relative group">
                                                <label 
                                                    htmlFor="hero-bg-file" 
                                                    className="aspect-[16/9] bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 hover:border-red-600 dark:hover:border-red-650 rounded-xl flex flex-col items-center justify-center overflow-hidden relative cursor-pointer transition-all duration-200 block shadow-xs"
                                                >
                                                    {heroBgPreview ? (
                                                        <>
                                                            <img src={heroBgPreview} className="w-full h-full object-cover" alt="Hero Background Preview" />
                                                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-all text-white text-[11px] font-bold">
                                                                <ImageIcon size={18} className="animate-bounce" />
                                                                <span>Thay đổi ảnh nền</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-600 group-hover:text-red-650 dark:group-hover:text-red-500 transition-colors duration-200 p-4 text-center">
                                                            <ImageIcon size={28} strokeWidth={1.5} />
                                                            <span className="text-[10px] font-bold">Click để tải ảnh nền lên</span>
                                                        </div>
                                                    )}
                                                </label>

                                                {heroBgPreview && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setHeroBgFile(null);
                                                            setHeroBgPreview(null);
                                                            setHeroBgDeleted(true);
                                                            setHasUnsavedChanges(true);
                                                        }}
                                                        className="absolute -top-2 -right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition-transform hover:scale-105"
                                                        title="Xóa hình ảnh"
                                                    >
                                                        <Trash size={12} strokeWidth={2.5} />
                                                    </button>
                                                )}
                                            </div>
                                            {heroSliderImages.length > 0 && <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">{heroSliderImages.map((image, index) => <div key={`${image}-${index}`} className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"><img src={image} alt={`Banner ${index + 1}`} className="h-full w-full object-cover" /><button type="button" onClick={() => { setHeroSliderImages((items) => items.filter((_, itemIndex) => itemIndex !== index)); setHasUnsavedChanges(true); }} className="absolute right-1 top-1 rounded-full bg-[#C8102E] px-1.5 py-0.5 text-[10px] font-bold text-white">×</button></div>)}</div>}
                                            <p className="text-[9px] text-slate-400 dark:text-slate-500 italic">Chọn từ 1–5 ảnh. Một ảnh hiển thị tĩnh; từ hai ảnh sẽ tự động chuyển cảnh mỗi 5 giây.</p>
                                        </div>

                                        {/* Background Video Upload Frame */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block">Video nền Banner (Tùy chọn)</label>
                                            
                                            <input 
                                                type="file" 
                                                accept="video/mp4,video/webm" 
                                                id="hero-video-file" 
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 20 * 1024 * 1024) {
                                                            toast.error("Dung lượng video không được vượt quá 20MB!");
                                                            return;
                                                        }
                                                        setHeroVideoFile(file);
                                                        setHeroVideoPreview(URL.createObjectURL(file));
                                                        setHeroVideoDeleted(false);
                                                        setHasUnsavedChanges(true);
                                                    }
                                                }} 
                                                className="hidden" 
                                            /> 
                                            
                                            <div className="relative group">
                                                <label 
                                                    htmlFor="hero-video-file" 
                                                    className="aspect-[16/9] bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 hover:border-red-600 dark:hover:border-red-650 rounded-xl flex flex-col items-center justify-center overflow-hidden relative cursor-pointer transition-all duration-200 block shadow-xs"
                                                >
                                                    {heroVideoPreview ? (
                                                        <>
                                                            <video 
                                                                src={heroVideoPreview} 
                                                                className="w-full h-full object-cover" 
                                                                muted 
                                                                loop 
                                                                autoPlay 
                                                                playsInline 
                                                            />
                                                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-all text-white text-[11px] font-bold">
                                                                <MonitorPlay size={18} className="animate-bounce" />
                                                                <span>Thay đổi video nền</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-600 group-hover:text-red-650 dark:group-hover:text-red-500 transition-colors duration-200 p-4 text-center">
                                                            <MonitorPlay size={28} strokeWidth={1.5} />
                                                            <span className="text-[10px] font-bold">Click để tải video nền lên</span>
                                                        </div>
                                                    )}
                                                </label>

                                                {heroVideoPreview && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setHeroVideoFile(null);
                                                            setHeroVideoPreview(null);
                                                            setHeroVideoDeleted(true);
                                                            setHasUnsavedChanges(true);
                                                        }}
                                                        className="absolute -top-2 -right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition-transform hover:scale-105"
                                                        title="Xóa video"
                                                    >
                                                        <Trash size={12} strokeWidth={2.5} />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-[9px] text-slate-400 dark:text-slate-500 italic">Hỗ trợ định dạng mp4/webm, dung lượng tối đa 20MB.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Slider hình nền (tối đa 5 ảnh)</label>
                                            <input type="file" accept="image/*" multiple onChange={(e) => {
                                                const files = Array.from(e.currentTarget.files || []).slice(0, 5);
                                                if (!files.length) return;
                                                setHeroSliderFiles(files);
                                                setHeroSliderImages(files.map((file) => URL.createObjectURL(file)).slice(0, 5));
                                                setHasUnsavedChanges(true);
                                            }} className="block w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-600 hover:border-[#C8102E] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" />
                                            {heroSliderImages.length > 0 && <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{heroSliderImages.map((image, index) => <div key={`${image}-${index}`} className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"><img src={image} alt={`Slider ${index + 1}`} className="h-full w-full object-cover" /><button type="button" onClick={() => { setHeroSliderImages((items) => items.filter((_, itemIndex) => itemIndex !== index)); setHasUnsavedChanges(true); }} className="absolute right-1 top-1 rounded-full bg-[#C8102E] px-1.5 py-0.5 text-[10px] font-bold text-white">×</button></div>)}</div>}
                                            <p className="text-[10px] text-slate-400">Một ảnh sẽ đứng yên; từ hai ảnh sẽ tự động crossfade mỗi 5 giây. Video nền luôn được ưu tiên.</p>
                                        </div>

                                        {/* Slider for overlay opacity */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">Độ mờ lớp phủ (Overlay)</label>
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                    {Math.round(heroOverlayOpacity * 100)}%
                                                </span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="0" 
                                                max="1" 
                                                step="0.05"
                                                value={heroOverlayOpacity} 
                                                onChange={(e) => {
                                                    setHeroOverlayOpacity(parseFloat(e.target.value));
                                                    setHasUnsavedChanges(true);
                                                }}
                                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#ff4d4f]"
                                            />
                                            <div className="flex justify-between text-[9px] text-slate-400">
                                                <span>Sáng (0%)</span>
                                                <span>Mặc định (40%)</span>
                                                <span>Tối (100%)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mockup Preview Area */}
                                    <div className="lg:col-span-2 space-y-2">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block">Xem trước thời gian thực (Mockup Hero)</label>
                                        <div className="relative aspect-[21/9] w-full bg-slate-950 rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-850 flex flex-col justify-center px-6 text-white select-none">
                                            {/* BG Layer */}
                                            {heroVideoPreview ? (
                                                <video
                                                    src={heroVideoPreview}
                                                    className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                                                    muted
                                                    loop
                                                    autoPlay
                                                    playsInline
                                                />
                                            ) : heroBgPreview ? (
                                                <img 
                                                    src={heroBgPreview} 
                                                    className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" 
                                                    alt="Mockup BG"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-slate-900 z-0" />
                                            )}

                                            {/* Solid dark layer controlled by opacity slider */}
                                            <div 
                                                className="absolute inset-0 bg-black transition-opacity duration-200 z-10"
                                                style={{ opacity: heroOverlayOpacity }}
                                            />

                                            {/* Gradient direction overlay layer for text readability */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent z-11 pointer-events-none" />

                                            {/* Language Toggle in Mockup */}
                                            <div className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-1 rounded-md border border-white/10 text-[9px] font-bold">
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setMockupLang("VI"); }}
                                                    className={`px-1.5 py-0.5 rounded-sm transition-all ${mockupLang === "VI" ? "bg-red-650 text-white" : "text-white/60 hover:text-white"}`}
                                                >
                                                    VI
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setMockupLang("EN"); }}
                                                    className={`px-1.5 py-0.5 rounded-sm transition-all ${mockupLang === "EN" ? "bg-red-650 text-white" : "text-white/60 hover:text-white"}`}
                                                >
                                                    EN
                                                </button>
                                            </div>

                                            {/* Text Content Overlay */}
                                            <div className="relative z-20 max-w-md space-y-1.5 text-left">
                                                {(mockupLang === "VI" ? hero.badge_vi : hero.badge_en) && (
                                                    <span contentEditable suppressContentEditableWarning onBlur={(e) => {
                                                        const value = e.currentTarget.textContent || "";
                                                        if (mockupLang === "VI") setHero(prev => ({ ...prev, badge_vi: value }));
                                                        else setHero(prev => ({ ...prev, badge_en: value }));
                                                        setHasUnsavedChanges(true);
                                                    }} className="inline-block border border-dashed border-red-400/50 px-1 text-[7px] text-[#FF4D4D] font-black uppercase tracking-[0.2em] outline-none hover:bg-white/10">
                                                        {mockupLang === "VI" ? hero.badge_vi : hero.badge_en}
                                                    </span>
                                                )}
                                                <h4 className="text-[12px] md:text-[15px] font-black leading-tight tracking-tight text-white uppercase">
                                                    <span contentEditable suppressContentEditableWarning onBlur={(e) => {
                                                        const value = e.currentTarget.textContent || "";
                                                        if (mockupLang === "VI") setHero(prev => ({ ...prev, title1_vi: value }));
                                                        else handleEnChange("hero_title1_en", value);
                                                        setHasUnsavedChanges(true);
                                                    }} className="border border-dashed border-white/30 outline-none hover:bg-white/10">{mockupLang === "VI" ? hero.title1_vi : enFields.hero_title1_en}</span><br />
                                                    <span contentEditable suppressContentEditableWarning onBlur={(e) => {
                                                        const value = e.currentTarget.textContent || "";
                                                        if (mockupLang === "VI") setHero(prev => ({ ...prev, title2_vi: value }));
                                                        else handleEnChange("hero_title2_en", value);
                                                        setHasUnsavedChanges(true);
                                                    }} className="border border-dashed border-red-400/60 text-[#FF4D4D] outline-none hover:bg-white/10">{mockupLang === "VI" ? hero.title2_vi : enFields.hero_title2_en}</span>
                                                </h4>
                                                {(mockupLang === "VI" ? hero.desc_vi : enFields.hero_desc_en) && (
                                                    <p contentEditable suppressContentEditableWarning onBlur={(e) => {
                                                        const value = e.currentTarget.textContent || "";
                                                        if (mockupLang === "VI") setHero(prev => ({ ...prev, desc_vi: value }));
                                                        else handleEnChange("hero_desc_en", value);
                                                        setHasUnsavedChanges(true);
                                                    }} className="max-w-[280px] border border-dashed border-white/20 text-[8px] text-white/70 outline-none hover:bg-white/10 line-clamp-2 leading-relaxed">
                                                        {mockupLang === "VI" ? hero.desc_vi : enFields.hero_desc_en}
                                                    </p>
                                                )}
                                                <div className="flex gap-2 pt-1">
                                                    {(mockupLang === "VI" ? hero.btn1_text_vi : hero.btn1_text_en) && (
                                                        <span contentEditable suppressContentEditableWarning onBlur={(e) => {
                                                            const value = e.currentTarget.textContent || "";
                                                            if (mockupLang === "VI") setHero(prev => ({ ...prev, btn1_text_vi: value }));
                                                            else setHero(prev => ({ ...prev, btn1_text_en: value }));
                                                            setHasUnsavedChanges(true);
                                                        }} className="border border-dashed border-white/50 text-[7px] font-bold bg-red-650 px-2.5 py-1 rounded-xs outline-none">
                                                            {mockupLang === "VI" ? hero.btn1_text_vi : hero.btn1_text_en}
                                                        </span>
                                                    )}
                                                    {(mockupLang === "VI" ? hero.btn2_text_vi : hero.btn2_text_en) && (
                                                        <span contentEditable suppressContentEditableWarning onBlur={(e) => {
                                                            const value = e.currentTarget.textContent || "";
                                                            if (mockupLang === "VI") setHero(prev => ({ ...prev, btn2_text_vi: value }));
                                                            else setHero(prev => ({ ...prev, btn2_text_en: value }));
                                                            setHasUnsavedChanges(true);
                                                        }} className="border border-dashed border-white/50 text-[7px] font-bold bg-white/10 px-2.5 py-1 rounded-xs outline-none">
                                                            {mockupLang === "VI" ? hero.btn2_text_vi : hero.btn2_text_en}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 2: GIỚI THIỆU NHANH (MISSION) --- */}
                    {activeTab === "intro" && (
                        <div className="flex flex-col space-y-6">
                            <div className="hidden">
                                <div>
                                    <h2 className="text-base font-bold text-slate-800 dark:text-white">Giới thiệu nhanh</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cấu hình thông tin giới thiệu chung kèm hình ảnh</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={intro.active} 
                                        onChange={e => setIntro(prev => ({ ...prev, active: e.target.checked }))} 
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    <span className="ml-2.5 text-xs font-bold text-slate-600 dark:text-slate-450">{intro.active ? "ĐANG BẬT" : "ĐÃ TẮT"}</span>
                                </label>
                            </div>

                            <section className="order-1 mb-6">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <label className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">Ảnh chính
                                        <input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { setIntro(prev => ({ ...prev, main_image: String(reader.result || "") })); setHasUnsavedChanges(true); }; reader.readAsDataURL(file); }} className="block w-full cursor-pointer text-[11px] text-slate-600 file:mr-2 file:cursor-pointer file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-red-50 hover:file:text-red-700 dark:text-slate-300 dark:file:border-slate-700 dark:file:bg-slate-800 dark:file:text-slate-100" />
                                        {intro.main_image && <img src={intro.main_image} alt="Xem trước ảnh chính" className="mt-2 h-28 w-full rounded-xl border border-slate-200 object-cover shadow-sm dark:border-slate-700" />}
                                    </label>
                                    <label className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">Ảnh badge tròn
                                        <input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { setIntro(prev => ({ ...prev, badge_image: String(reader.result || "") })); setHasUnsavedChanges(true); }; reader.readAsDataURL(file); }} className="block w-full cursor-pointer text-[11px] text-slate-600 file:mr-2 file:cursor-pointer file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-red-50 hover:file:text-red-700 dark:text-slate-300 dark:file:border-slate-700 dark:file:bg-slate-800 dark:file:text-slate-100" />
                                        {intro.badge_image && <div className="mt-2 flex justify-center"><img src={intro.badge_image} alt="Xem trước ảnh badge" className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg ring-1 ring-slate-200 dark:ring-slate-700" /></div>}
                                    </label>
                                </div>
                                {false && <div className="mt-6 grid gap-4 pt-5 md:grid-cols-3">
                                    <label className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">Tên đại diện (VI)<input value={intro.director_name} onChange={e => setIntro(prev => ({ ...prev, director_name: e.target.value }))} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white" /></label>
                                    <label className="space-y-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">Tên đại diện (EN)<input value={intro.director_name_en} onChange={e => setIntro(prev => ({ ...prev, director_name_en: e.target.value }))} className="h-10 w-full rounded-xl border border-amber-200 bg-amber-50/30 px-3 text-sm outline-none focus:border-amber-500 dark:border-amber-900 dark:bg-amber-950/20 dark:text-white" /></label>
                                    <label className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">Chức vụ (VI)<input value={intro.director_role} onChange={e => setIntro(prev => ({ ...prev, director_role: e.target.value }))} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white" /></label>
                                    <label className="space-y-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">Chức vụ (EN)<input value={intro.director_role_en} onChange={e => setIntro(prev => ({ ...prev, director_role_en: e.target.value }))} className="h-10 w-full rounded-xl border border-amber-200 bg-amber-50/30 px-3 text-sm outline-none focus:border-amber-500 dark:border-amber-900 dark:bg-amber-950/20 dark:text-white" /></label>
                                    <label className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">Chữ ký<input value={intro.signature_text} onChange={e => setIntro(prev => ({ ...prev, signature_text: e.target.value }))} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white" /></label>
                                </div>}
                            </section>

                            <div className="order-2 grid grid-cols-1 gap-8 lg:grid-cols-12">
                                <div className="lg:col-span-12 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Mã Nhãn VI</label>
                                            <input value={intro.badge_vi} onChange={e => setIntro(prev => ({ ...prev, badge_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5">Mã Nhãn EN</label>
                                            <input value={intro.badge_en} onChange={e => setIntro(prev => ({ ...prev, badge_en: e.target.value }))} className="w-full h-10 px-3.5 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Tiêu đề chính VI</label>
                                            <input value={intro.title_vi} onChange={e => setIntro(prev => ({ ...prev, title_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5 flex justify-between items-center">
                                                Tiêu đề chính EN
                                                {enFields.intro_title_en.trim() === "" && <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded font-black">YÊU CẦU EN</span>}
                                            </label>
                                            <input value={enFields.intro_title_en} onChange={e => handleEnChange("intro_title_en", e.target.value)} className="w-full h-10 px-3.5 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Dòng đỏ highlight (Subtitle) VI</label>
                                            <input value={intro.subtitle_vi} onChange={e => setIntro(prev => ({ ...prev, subtitle_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5">Dòng đỏ highlight (Subtitle) EN</label>
                                            <input value={intro.subtitle_en} onChange={e => setIntro(prev => ({ ...prev, subtitle_en: e.target.value }))} className="w-full h-10 px-3.5 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Dẫn nhập (Lead Paragraph) VI</label>
                                            <textarea value={intro.lead_vi} onChange={e => setIntro(prev => ({ ...prev, lead_vi: e.target.value }))} className="w-full min-h-[112px] h-auto px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650 resize-y" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5 flex justify-between items-center">
                                                Dẫn nhập (Lead Paragraph) EN
                                                {enFields.intro_lead_en.trim() === "" && <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded font-black">YÊU CẦU EN</span>}
                                            </label>
                                            <textarea value={enFields.intro_lead_en} onChange={e => handleEnChange("intro_lead_en", e.target.value)} className="w-full min-h-[112px] h-auto px-3.5 py-2.5 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] resize-y" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Nội dung bổ sung VI</label>
                                            <textarea value={intro.desc_vi} onChange={e => setIntro(prev => ({ ...prev, desc_vi: e.target.value }))} className="w-full min-h-[112px] h-auto px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650 resize-y" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5 flex justify-between items-center">
                                                Nội dung bổ sung EN
                                                {enFields.intro_desc_en.trim() === "" && <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded font-black">YÊU CẦU EN</span>}
                                            </label>
                                            <textarea value={enFields.intro_desc_en} onChange={e => handleEnChange("intro_desc_en", e.target.value)} className="w-full min-h-[112px] h-auto px-3.5 py-2.5 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] resize-y" />
                                        </div>
                                    </div>

                                    {false && <>
                                    {/* Legacy stats disabled: Experience / Projects */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-3 border border-slate-100 dark:border-slate-850">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Khối chỉ số 1 (Experience)</span>
                                            <input placeholder="VD: 10+" value={intro.exp_value} onChange={e => setIntro(prev => ({ ...prev, exp_value: e.target.value }))} className="w-full h-10 px-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-red-650" />
                                            <input placeholder="Nhãn VI" value={intro.exp_label_vi} onChange={e => setIntro(prev => ({ ...prev, exp_label_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-red-650" />
                                            <input placeholder="Nhãn EN" value={intro.exp_label_en} onChange={e => setIntro(prev => ({ ...prev, exp_label_en: e.target.value }))} className="w-full h-10 px-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-red-650" />
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-3 border border-slate-100 dark:border-slate-850">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Khối chỉ số 2 (Projects)</span>
                                            <input placeholder="VD: 500+" value={intro.proj_value} onChange={e => setIntro(prev => ({ ...prev, proj_value: e.target.value }))} className="w-full h-10 px-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-red-650" />
                                            <input placeholder="Nhãn VI" value={intro.proj_label_vi} onChange={e => setIntro(prev => ({ ...prev, proj_label_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-red-650" />
                                            <input placeholder="Nhãn EN" value={intro.proj_label_en} onChange={e => setIntro(prev => ({ ...prev, proj_label_en: e.target.value }))} className="w-full h-10 px-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-red-650" />
                                        </div>
                                    </div>
                                    </>}
                                </div>

                                {false && <div className="lg:col-span-4 space-y-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4">
                                        <span className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-widest block flex items-center gap-2">
                                            <ImageIcon size={14} /> Ảnh đại diện khối
                                        </span>
                                        
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            id="intro-image-file" 
                                            onChange={handleImageChange} 
                                            className="hidden" 
                                        /> 
                                        
                                        <label 
                                            htmlFor="intro-image-file" 
                                            className="aspect-[4/3] bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/80 rounded-xl flex flex-col items-center justify-center overflow-hidden relative group cursor-pointer transition-all duration-200 block"
                                            onDragOver={e => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onDrop={e => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                const file = e.dataTransfer.files?.[0];
                                                if (file && file.type.startsWith("image/")) {
                                                    setImageFile(file);
                                                    setImagePreview(URL.createObjectURL(file));
                                                    setHasUnsavedChanges(true);
                                                }
                                            }}
                                        >
                                            {imagePreview ? (
                                                <>
                                                    <img src={imagePreview || undefined} className="w-full h-full object-cover" alt="Intro Preview" />
                                                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-all text-white text-[11px] font-bold">
                                                        <ImageIcon size={18} className="animate-bounce" />
                                                        <span>Thay đổi hình ảnh mới</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center gap-2 text-slate-350 dark:text-slate-650 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors duration-200">
                                                    <ImageIcon size={32} strokeWidth={1.5} />
                                                    <span className="text-[10px] font-bold">Click hoặc kéo thả ảnh vào đây</span>
                                                </div>
                                            )}
                                        </label>
                                        
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center">Hỗ trợ định dạng PNG, JPG. Dung lượng tối đa 5MB.</p>
                                    </div>
                                </div>}
                            </div>
                            <div className="order-3 grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
                                <label className="space-y-1.5 text-xs font-semibold text-slate-600">Tên đại diện (VI)<input value={intro.director_name} onChange={e => setIntro(prev => ({ ...prev, director_name: e.target.value }))} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></label>
                                <label className="space-y-1.5 text-xs font-semibold text-amber-700">Tên đại diện (EN)<input value={intro.director_name_en} onChange={e => setIntro(prev => ({ ...prev, director_name_en: e.target.value }))} className="h-10 w-full rounded-xl border border-amber-200 bg-amber-50/30 px-3 text-sm" /></label>
                                <label className="space-y-1.5 text-xs font-semibold text-slate-600">Chức vụ (VI)<input value={intro.director_role} onChange={e => setIntro(prev => ({ ...prev, director_role: e.target.value }))} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></label>
                                <label className="space-y-1.5 text-xs font-semibold text-amber-700">Chức vụ (EN)<input value={intro.director_role_en} onChange={e => setIntro(prev => ({ ...prev, director_role_en: e.target.value }))} className="h-10 w-full rounded-xl border border-amber-200 bg-amber-50/30 px-3 text-sm" /></label>
                                <label className="space-y-1.5 text-xs font-semibold text-slate-600">Chữ ký<input value={intro.signature_text} onChange={e => setIntro(prev => ({ ...prev, signature_text: e.target.value }))} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></label>
                            </div>
                        </div>
                    )}

                    {false && (<>
                    {/* --- TAB 3: CAM KẾT & CHỈ SỐ (HIGHLIGHTS) --- */}
                    {activeTab === "highlights" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div>
                                    <h2 className="text-base font-bold text-slate-800 dark:text-white">Cam kết & Chỉ số (Highlights)</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cấu hình các tiêu chí cốt lõi, giá trị và số liệu tại sao nên chọn Maintech</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={highlights.active} 
                                        onChange={e => setHighlights(prev => ({ ...prev, active: e.target.checked }))} 
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    <span className="ml-2.5 text-xs font-bold text-slate-600 dark:text-slate-450">{highlights.active ? "ĐANG BẬT" : "ĐÃ TẮT"}</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Tiêu đề chính VI</label>
                                        <input value={highlights.title_vi} onChange={e => setHighlights(prev => ({ ...prev, title_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Mô tả ngắn VI</label>
                                        <textarea value={highlights.desc_vi} onChange={e => setHighlights(prev => ({ ...prev, desc_vi: e.target.value }))} rows={2} className="w-full h-20 px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650 resize-none" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5 flex justify-between items-center">
                                            Tiêu đề chính EN
                                            {enFields.highlights_title_en.trim() === "" && <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded font-black">YÊU CẦU EN</span>}
                                        </label>
                                        <input value={enFields.highlights_title_en} onChange={e => handleEnChange("highlights_title_en", e.target.value)} className="w-full h-10 px-3.5 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-850 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5 flex justify-between items-center">
                                            Mô tả ngắn EN
                                            {enFields.highlights_desc_en.trim() === "" && <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded font-black">YÊU CẦU EN</span>}
                                        </label>
                                        <textarea value={enFields.highlights_desc_en} onChange={e => handleEnChange("highlights_desc_en", e.target.value)} rows={2} className="w-full h-20 px-3.5 py-2 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-850 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] resize-none" />
                                    </div>
                                </div>
                            </div>

                            {/* 4 Cards settings */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">CẤU HÌNH 4 CAM KẾT (FEATURES CARDS)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(highlights.cards || defaultHighlights.cards).map((card: any, idx: number) => (
                                        <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-sm">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200/50 dark:border-slate-800 pb-2 mb-1">
                                                <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black text-xs flex items-center justify-center font-bold shadow-sm shrink-0">{idx + 1}</span>
                                                <span>Cam kết {idx + 1} ({card.icon})</span>
                                            </div>
                                            
                                            {/* Row 1: Side-by-side titles */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-650 dark:text-slate-400 block mb-1">Tiêu đề VI</label>
                                                    <input 
                                                        value={card.title_vi} 
                                                        onChange={e => {
                                                            const newCards = [...highlights.cards];
                                                            newCards[idx].title_vi = e.target.value;
                                                            setHighlights(prev => ({ ...prev, cards: newCards }));
                                                            setHasUnsavedChanges(true);
                                                        }}
                                                        className="w-full h-10 px-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white focus:border-red-650 focus:ring-1 focus:ring-red-650 outline-none" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-650 dark:text-slate-400 block mb-1">Tiêu đề EN</label>
                                                    <input 
                                                        value={card.title_en} 
                                                        onChange={e => {
                                                            const newCards = [...highlights.cards];
                                                            newCards[idx].title_en = e.target.value;
                                                            setHighlights(prev => ({ ...prev, cards: newCards }));
                                                            setHasUnsavedChanges(true);
                                                        }}
                                                        className="w-full h-10 px-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white focus:border-red-650 focus:ring-1 focus:ring-red-650 outline-none" 
                                                    />
                                                </div>
                                            </div>
                                            
                                            {/* Row 2: Full width Mô tả VI */}
                                            <div>
                                                <label className="text-xs font-semibold text-slate-650 dark:text-slate-400 block mb-1">Mô tả VI</label>
                                                <textarea 
                                                    value={card.desc_vi} 
                                                    onChange={e => {
                                                        const newCards = [...highlights.cards];
                                                        newCards[idx].desc_vi = e.target.value;
                                                        setHighlights(prev => ({ ...prev, cards: newCards }));
                                                        setHasUnsavedChanges(true);
                                                    }}
                                                    rows={3}
                                                    className="w-full h-20 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:border-red-650 focus:ring-1 focus:ring-red-650 outline-none resize-none" 
                                                />
                                            </div>
                                            
                                            {/* Row 3: Full width Mô tả EN */}
                                            <div>
                                                <label className="text-xs font-semibold text-slate-650 dark:text-slate-400 block mb-1">Mô tả EN</label>
                                                <textarea 
                                                    value={card.desc_en} 
                                                    onChange={e => {
                                                        const newCards = [...highlights.cards];
                                                        newCards[idx].desc_en = e.target.value;
                                                        setHighlights(prev => ({ ...prev, cards: newCards }));
                                                        setHasUnsavedChanges(true);
                                                    }}
                                                    rows={3}
                                                    className="w-full h-20 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:border-red-650 focus:ring-1 focus:ring-red-650 outline-none resize-none" 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    </>)}

                    {/* --- TAB 4: DỊCH VỤ NỔI BẬT (SERVICES) --- */}
                    {activeTab === "services" && (
                        <>
                        {false && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div>
                                    <h2 className="text-base font-bold text-slate-800 dark:text-white">Dịch vụ nổi bật</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Quản lý cách hiển thị dịch vụ tại trang chủ</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={servicesConf.active} 
                                        onChange={e => setServicesConf(prev => ({ ...prev, active: e.target.checked }))} 
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    <span className="ml-2.5 text-xs font-bold text-slate-600 dark:text-slate-450">{servicesConf.active ? "ĐANG BẬT" : "ĐÃ TẮT"}</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Mã nhãn VI (Badge)</label>
                                        <input value={servicesConf.badge_vi} onChange={e => setServicesConf(prev => ({ ...prev, badge_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Tiêu đề chính VI</label>
                                        <input value={servicesConf.title_vi} onChange={e => setServicesConf(prev => ({ ...prev, title_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Mô tả chi tiết VI</label>
                                        <textarea value={servicesConf.desc_vi} onChange={e => setServicesConf(prev => ({ ...prev, desc_vi: e.target.value }))} rows={2} className="w-full h-20 px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650 resize-none" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5">Mã nhãn EN (Badge)</label>
                                        <input value={servicesConf.badge_en} onChange={e => setServicesConf(prev => ({ ...prev, badge_en: e.target.value }))} className="w-full h-10 px-3.5 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5 flex justify-between items-center">
                                            Tiêu đề chính EN
                                            {enFields.services_title_en.trim() === "" && <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded font-black">YÊU CẦU EN</span>}
                                        </label>
                                        <input value={enFields.services_title_en} onChange={e => handleEnChange("services_title_en", e.target.value)} className="w-full h-10 px-3.5 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5 flex justify-between items-center">
                                            Mô tả chi tiết EN
                                            {enFields.services_desc_en.trim() === "" && <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded font-black">YÊU CẦU EN</span>}
                                        </label>
                                        <textarea value={enFields.services_desc_en} onChange={e => handleEnChange("services_desc_en", e.target.value)} rows={2} className="w-full h-20 px-3.5 py-2 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] resize-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Auto vs Manual Section selection */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Chế độ hiển thị danh sách</h3>
                                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border p-1 rounded-xl shadow-xs">
                                        <button
                                            type="button"
                                            onClick={() => { setServicesMode("auto"); setHasUnsavedChanges(true); }}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${servicesMode === "auto" ? "bg-slate-900 text-white dark:bg-slate-800" : "text-slate-500 hover:text-slate-800"}`}
                                        >
                                            Hiển thị tự động (Mới nhất)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setServicesMode("manual"); setHasUnsavedChanges(true); }}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${servicesMode === "manual" ? "bg-slate-900 text-white dark:bg-slate-800" : "text-slate-500 hover:text-slate-800"}`}
                                        >
                                            Chọn thủ công & Sắp xếp
                                        </button>
                                    </div>
                                </div>

                                {servicesMode === "auto" ? (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Số lượng hiển thị tối đa</label>
                                        <input 
                                            type="number" 
                                            value={servicesConf.limit} 
                                            onChange={e => { setServicesConf(prev => ({ ...prev, limit: parseInt(e.target.value) || 10 })); setHasUnsavedChanges(true); }}
                                            className="w-24 px-3 py-1.5 bg-white dark:bg-slate-900 border rounded text-xs font-bold" 
                                        />
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 italic">Hệ thống sẽ tự động hiển thị {servicesConf.limit} Dịch vụ mới nhất đang được bật ở mục Quản lý Dịch vụ.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Selection checklists */}
                                        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                                            <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 text-xs font-bold border-b dark:border-slate-800 text-slate-700 dark:text-slate-350">
                                                Chọn dịch vụ hiển thị
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto divide-y dark:divide-slate-800">
                                                {activeDbServices.map(s => {
                                                    const isChecked = selectedServices.includes(s.id);
                                                    return (
                                                        <div 
                                                            key={s.id}
                                                            onClick={() => toggleSelectItem("services", s.id)}
                                                            className="flex items-center gap-3 p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                                                        >
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isChecked ? "bg-slate-900 border-slate-900 text-white" : "border-slate-300 dark:border-slate-700"}`}>
                                                                {isChecked && <Check size={10} strokeWidth={3} />}
                                                            </div>
                                                            <span className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{s.title_vi}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Ordering drag/click list */}
                                        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 flex flex-col">
                                            <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 text-xs font-bold border-b dark:border-slate-800 text-slate-700 dark:text-slate-350">
                                                Thứ tự hiển thị ngoài website
                                            </div>
                                            <div className="flex-1 max-h-[300px] overflow-y-auto divide-y dark:divide-slate-800">
                                                {selectedServices.length === 0 ? (
                                                    <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                                                        Chưa chọn dịch vụ nào. Hãy đánh dấu chọn ở bảng bên trái.
                                                    </div>
                                                ) : (
                                                    selectedServices.map((id, idx) => {
                                                        const item = services.find(s => s.id === id);
                                                        if (!item) return null;
                                                        return (
                                                            <div key={id} className="flex items-center justify-between p-3 text-xs">
                                                                <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                                                                    {idx + 1}. {item.title_vi}
                                                                </span>
                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => moveItem("services", idx, "up")}
                                                                        disabled={idx === 0}
                                                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30"
                                                                    >
                                                                        <ArrowUp size={12} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => moveItem("services", idx, "down")}
                                                                        disabled={idx === selectedServices.length - 1}
                                                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30"
                                                                    >
                                                                        <ArrowDown size={12} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        )}
                        <div className="space-y-5 pt-1">
                            {(servicesConf.cards || []).map((card: any, index: number) => (
                                <section key={index} className="border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                                    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                                        <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white">Dịch vụ {card.order || String(index + 1).padStart(2, "0")}</h3>
                                        <button type="button" onClick={() => { setServicesConf(prev => ({ ...prev, cards: prev.cards.filter((_: any, i: number) => i !== index) })); setHasUnsavedChanges(true); }} className="rounded-md px-2 py-1 text-xs font-bold text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 hover:shadow-sm active:scale-95">Xóa dịch vụ</button>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tiêu đề VI<input value={card.title_vi || ""} onChange={e => setServicesConf(prev => ({ ...prev, cards: prev.cards.map((item: any, i: number) => i === index ? { ...item, title_vi: e.target.value } : item) }))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" /></label>
                                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tiêu đề EN<input value={card.title_en || ""} onChange={e => setServicesConf(prev => ({ ...prev, cards: prev.cards.map((item: any, i: number) => i === index ? { ...item, title_en: e.target.value } : item) }))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" /></label>
                                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Mô tả VI<textarea value={card.desc_vi || ""} onChange={e => setServicesConf(prev => ({ ...prev, cards: prev.cards.map((item: any, i: number) => i === index ? { ...item, desc_vi: e.target.value } : item) }))} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" /></label>
                                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Mô tả EN<textarea value={card.desc_en || ""} onChange={e => setServicesConf(prev => ({ ...prev, cards: prev.cards.map((item: any, i: number) => i === index ? { ...item, desc_en: e.target.value } : item) }))} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" /></label>
                                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Hình ảnh
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => {
                                                    const file = e.currentTarget.files?.[0];
                                                    if (!file) return;
                                                    const reader = new FileReader();
                                                    reader.onload = () => setServicesConf(prev => ({
                                                        ...prev,
                                                        cards: prev.cards.map((item: any, i: number) => i === index ? { ...item, imageUrl: String(reader.result || "") } : item),
                                                    }));
                                                    reader.readAsDataURL(file);
                                                    setHasUnsavedChanges(true);
                                                }}
                                                className="mt-1 block w-full cursor-pointer text-[11px] text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-red-50 hover:file:text-red-700 dark:text-slate-300 dark:file:border-slate-700 dark:file:bg-slate-800 dark:file:text-slate-100"
                                            />
                                            {card.imageUrl && <img src={card.imageUrl} alt={`Xem trước ảnh dịch vụ ${index + 1}`} className="mt-3 h-28 w-full border border-slate-200 object-cover shadow-sm dark:border-slate-700" />}
                                        </label>
                                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Icon<input value={card.icon || ""} onChange={e => setServicesConf(prev => ({ ...prev, cards: prev.cards.map((item: any, i: number) => i === index ? { ...item, icon: e.target.value } : item) }))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" /></label>
                                    </div>
                                </section>
                            ))}
                            <button type="button" onClick={() => { setServicesConf(prev => ({ ...prev, cards: [...(prev.cards || []), { order: String((prev.cards?.length || 0) + 1).padStart(2, "0"), title_vi: "", title_en: "", desc_vi: "", desc_en: "", imageUrl: "", icon: "" }] })); setHasUnsavedChanges(true); }} className="w-full rounded-xl border border-dashed border-[#C8102E] px-4 py-3 text-sm font-bold text-[#C8102E] hover:bg-red-50">+ Thêm dịch vụ</button>
                        </div>
                        </>
                    )}

                    {activeTab === "history" && (
                        <div className="history-cms-fields flex flex-col space-y-5 pt-1">
                            <div className="grid gap-4 md:grid-cols-2">
                                {([['badge_vi', 'Mã nhãn VI'], ['badge_en', 'Badge EN'], ['title_vi', 'Tiêu đề VI'], ['title_en', 'Main Title EN'], ['desc_vi', 'Mô tả VI'], ['desc_en', 'Description EN'], ['button_vi', 'Nút CTA VI'], ['button_en', 'CTA Button EN'], ['button_link', 'Link CTA']] as const).map(([key, label]) => (
                                    <label key={key} className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        {label}
                                        {key.startsWith('desc') ? <textarea value={history[key]} onChange={e => setHistory(prev => ({ ...prev, [key]: e.target.value }))} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" /> : <input value={history[key]} onChange={e => setHistory(prev => ({ ...prev, [key]: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />}
                                    </label>
                                ))}
                            </div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Ảnh Poster / Thumbnail cho Video
                                <input type="file" accept="image/*" onChange={e => { const file = e.currentTarget.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setHistory(prev => ({ ...prev, image: String(reader.result || '') })); reader.readAsDataURL(file); setHasUnsavedChanges(true); }} className="mt-1 block w-full cursor-pointer text-[11px] text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-red-50 dark:text-slate-300 dark:file:border-slate-700 dark:file:bg-slate-800 dark:file:text-slate-100" />
                                {history.image && <div className="relative mt-3 max-w-xl"><img src={history.image} alt="Xem trước Our History" className="h-48 w-full object-cover" /><span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-red-600 shadow-xl">▶</span></div>}
                            </label>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Hình nền (Background Image)
                                <input type="file" accept="image/*" onChange={e => { const file = e.currentTarget.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setHistory(prev => ({ ...prev, backgroundImage: String(reader.result || '') })); reader.readAsDataURL(file); setHasUnsavedChanges(true); }} className="mt-1 block w-full cursor-pointer text-[11px] text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-red-50 dark:text-slate-300 dark:file:border-slate-700 dark:file:bg-slate-800 dark:file:text-slate-100" />
                                {history.backgroundImage && <div className="relative mt-3 max-w-xl"><img src={history.backgroundImage} alt="Xem trước hình nền Our History" className="h-32 w-full object-cover" /><button type="button" onClick={() => { setHistory(prev => ({ ...prev, backgroundImage: "" })); setHistoryBackgroundRemoved(true); setHasUnsavedChanges(true); }} className="absolute right-2 top-2 rounded-lg bg-[#C8102E] px-3 py-1 text-xs font-bold text-white">Gỡ bỏ</button></div>}
                            </label>
                            {history.image && <button type="button" onClick={() => { setHistory(prev => ({ ...prev, image: "", videoUrl: "" })); setHistoryVideoFile(null); setHistoryMediaRemoved(true); setHasUnsavedChanges(true); }} className="w-fit rounded-lg bg-[#C8102E] px-3 py-1 text-xs font-bold text-white">Gỡ bỏ ảnh bìa</button>}
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Tệp Video (MP4, WebM)
                                <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={async e => { const inputElement = e.currentTarget; const file = inputElement.files?.[0]; if (!file) return; const payload = new FormData(); payload.append("file", file); try { setHasUnsavedChanges(true); const response = await fetch("/api/upload", { method: "POST", body: payload }); const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.error || "Upload failed"); setHistoryVideoFile(null); setHistory(prev => ({ ...prev, videoUrl: result.url, image: "" })); setHistoryMediaRemoved(false); } catch (error: any) { toast.error(error?.message || "Không thể upload video"); } finally { if (inputElement) inputElement.value = ""; } }} className="mt-1 block w-full cursor-pointer text-[11px] text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-red-50 dark:text-slate-300 dark:file:border-slate-700 dark:file:bg-slate-800 dark:file:text-slate-100" />
                                {history.videoUrl && <div className="relative mt-3 max-w-xl"><video src={history.videoUrl} controls className="h-48 w-full object-cover" /><button type="button" onClick={() => { setHistory(prev => ({ ...prev, videoUrl: "", image: "" })); setHistoryVideoFile(null); setHistoryMediaRemoved(true); setHasUnsavedChanges(true); }} className="absolute right-2 top-2 rounded-lg bg-[#C8102E] px-3 py-1 text-xs font-bold text-white">Gỡ bỏ</button></div>}
                            </label>
                            <label className="block max-w-xl text-xs font-semibold text-slate-600 dark:text-slate-300">Độ mờ lớp phủ: {history.overlayOpacity}%
                                <input type="range" min="0" max="100" value={history.overlayOpacity ?? 85} onChange={e => { setHistory(prev => ({ ...prev, overlayOpacity: Number(e.target.value) })); setHasUnsavedChanges(true); }} className="mt-3 w-full accent-red-600" />
                                <span className="mt-1 flex justify-between text-[10px] font-normal text-slate-400"><span>Trong</span><span>Tối</span></span>
                            </label>
                        </div>
                    )}

                    {activeTab === "team" && (
                        <div className="space-y-5 pt-1">
                            <div className="grid gap-4 md:grid-cols-2">
                                {([['badge_vi', 'Mã nhãn VI'], ['badge_en', 'Badge EN'], ['title_vi', 'Tiêu đề VI'], ['title_en', 'Title EN']] as const).map(([key, label]) => (
                                    <label key={key} className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}<input value={team[key]} onChange={e => setTeam(prev => ({ ...prev, [key]: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" /></label>
                                ))}
                            </div>
                            <div className="grid gap-5 md:grid-cols-2">
                                {team.members.slice(0, 4).map((member: any, index: number) => (
                                    <section key={index} className="border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                                        <h3 className="mb-4 text-sm font-black uppercase text-slate-800 dark:text-white">Thành viên {index + 1}</h3>
                                        <input type="file" accept="image/*" onChange={e => { const file = e.currentTarget.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setTeam(prev => ({ ...prev, members: prev.members.map((item: any, i: number) => i === index ? { ...item, image: String(reader.result || '') } : item) })); reader.readAsDataURL(file); setHasUnsavedChanges(true); }} className="block w-full cursor-pointer text-[11px] text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold dark:text-slate-300 dark:file:border-slate-700 dark:file:bg-slate-800" />
                                        {member.image && <img src={member.image} alt={`Preview thành viên ${index + 1}`} className="mt-3 h-40 w-full object-cover" />}
                                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                                            <input placeholder="Họ tên" value={member.name || ""} onChange={e => setTeam(prev => ({ ...prev, members: prev.members.map((item: any, i: number) => i === index ? { ...item, name: e.target.value } : item) }))} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
                                            <input placeholder="Chức vụ VI" value={member.role_vi || ""} onChange={e => setTeam(prev => ({ ...prev, members: prev.members.map((item: any, i: number) => i === index ? { ...item, role_vi: e.target.value } : item) }))} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
                                            <input placeholder="Position EN" value={member.role_en || ""} onChange={e => setTeam(prev => ({ ...prev, members: prev.members.map((item: any, i: number) => i === index ? { ...item, role_en: e.target.value } : item) }))} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bằng cấp / chứng chỉ cá nhân</label>
                                                <textarea placeholder='JSON: [{"name":"ISO 9001","year":2024,"image":"/uploads/cert.jpg"}]' value={typeof member.credentials === "string" ? member.credentials : JSON.stringify(member.credentials || [])} onChange={e => setTeam(prev => ({ ...prev, members: prev.members.map((item: any, i: number) => i === index ? { ...item, credentials: e.target.value } : item) }))} className="min-h-20 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-red-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
                                                <label className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#C8102E]">
                                                    <span>Thêm ảnh bằng cấp</span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                                                        const file = e.currentTarget.files?.[0];
                                                        if (!file) return;
                                                        const input = e.currentTarget;
                                                        const reader = new FileReader();
                                                        reader.onload = () => {
                                                            let credentials: any[] = [];
                                                            try { credentials = JSON.parse(typeof member.credentials === "string" ? member.credentials : JSON.stringify(member.credentials || [])); } catch { credentials = []; }
                                                            credentials.push({ name: file.name.replace(/\.[^.]+$/, ""), year: new Date().getFullYear(), image: String(reader.result || "") });
                                                            setTeam(prev => ({ ...prev, members: prev.members.map((item: any, i: number) => i === index ? { ...item, credentials: JSON.stringify(credentials) } : item) }));
                                                            setHasUnsavedChanges(true);
                                                            input.value = "";
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }} />
                                                </label>
                                            </div>
                                        </div>
                                    </section>
                                ))}
                            </div>
                        </div>
                    )}

                    {(activeTab === "process" || activeTab === "network" || activeTab === "footer") && (
                        <section className="space-y-3 pt-1">
                            <h2 className="text-base font-black uppercase text-slate-900 dark:text-white">{activeTab === "process" ? "Quy trình làm việc" : activeTab === "network" ? "Mạng lưới hoạt động" : "Chân trang"}</h2>
                            <p className="text-sm text-slate-500">Khu vực cấu hình đang được chuẩn bị theo cấu trúc nội dung mới của website.</p>
                            {activeTab === "process" ? (
                                <div className="space-y-4">
                                    <div className="flex justify-end"><button type="button" onClick={() => { setProcessConf((prev) => ({ ...prev, steps: [...prev.steps, { image: "", title_vi: "", title_en: "", desc_vi: "", desc_en: "" }] })); setHasUnsavedChanges(true); }} className="rounded-lg bg-[#C8102E] px-4 py-2 text-xs font-bold text-white hover:bg-[#a80d27]">+ Thêm giai đoạn</button></div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                    {processConf.steps.map((step, index) => (
                                        <div key={index} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                                            <div className="flex items-center justify-between"><span className="text-sm font-black text-[#C8102E]">{String(index + 1).padStart(2, "0")}</span><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nội dung bước</span></div>
                                            <input value={step.title_vi} placeholder="Tiêu đề VI" onChange={(e) => setProcessConf((prev) => ({ ...prev, steps: prev.steps.map((item, itemIndex) => itemIndex === index ? { ...item, title_vi: e.target.value } : item) }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
                                            <input value={step.title_en} placeholder="Title EN" onChange={(e) => setProcessConf((prev) => ({ ...prev, steps: prev.steps.map((item, itemIndex) => itemIndex === index ? { ...item, title_en: e.target.value } : item) }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
                                            <textarea value={step.desc_vi} placeholder="Mô tả VI" onChange={(e) => setProcessConf((prev) => ({ ...prev, steps: prev.steps.map((item, itemIndex) => itemIndex === index ? { ...item, desc_vi: e.target.value } : item) }))} className="min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950" />
                                            <textarea value={step.desc_en ?? ""} placeholder="Description EN" onChange={(e) => { setProcessConf((prev) => ({ ...prev, steps: prev.steps.map((item, itemIndex) => itemIndex === index ? { ...item, desc_en: e.target.value } : item) })); setHasUnsavedChanges(true); }} className="min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950" />
                                            <button type="button" onClick={() => { setProcessConf((prev) => ({ ...prev, steps: prev.steps.filter((_, itemIndex) => itemIndex !== index) })); setHasUnsavedChanges(true); }} className="rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 hover:shadow-sm active:scale-95">Xóa giai đoạn</button>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            ) : activeTab === "footer" ? (
                                <div className="grid gap-5 lg:grid-cols-2">
                                    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="text-sm font-bold">Brand Info</h3><textarea value={footerConf.slogan_vi} onChange={(e) => setFooterConf({ ...footerConf, slogan_vi: e.target.value })} placeholder="Slogan VI" className="min-h-20 w-full rounded-lg border p-3 text-sm dark:border-slate-700 dark:bg-slate-950" /><textarea value={footerConf.slogan_en} onChange={(e) => setFooterConf({ ...footerConf, slogan_en: e.target.value })} placeholder="Slogan EN" className="min-h-20 w-full rounded-lg border p-3 text-sm dark:border-slate-700 dark:bg-slate-950" />{(["zalo", "whatsapp", "twitter"] as const).map((key) => <input key={key} value={footerConf[key]} onChange={(e) => setFooterConf({ ...footerConf, [key]: e.target.value })} placeholder={`${key} URL / Phone`} className="w-full rounded-lg border p-3 text-sm dark:border-slate-700 dark:bg-slate-950" />)}</div>
                                    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="text-sm font-bold">Contact Info</h3>{(["office", "factory", "phone", "email"] as const).map((key) => <input key={key} value={footerConf[key]} onChange={(e) => setFooterConf({ ...footerConf, [key]: e.target.value })} placeholder={key} className="w-full rounded-lg border p-3 text-sm dark:border-slate-700 dark:bg-slate-950" />)}</div>
                                    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="text-sm font-bold">Bottom Bar</h3>{(["copyright_year", "tax_id", "representative_vi", "representative_en"] as const).map((key) => <input key={key} value={footerConf[key]} onChange={(e) => setFooterConf({ ...footerConf, [key]: e.target.value })} placeholder={key} className="w-full rounded-lg border p-3 text-sm dark:border-slate-700 dark:bg-slate-950" />)}</div>
                                </div>
                            ) : <div className="border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/50">Chưa có dữ liệu cấu hình.</div>}
                        </section>
                    )}

                    {/* --- TAB 5: SẢN PHẨM NỔI BẬT (PRODUCTS) --- */}
                    {false && activeTab === "products" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div>
                                    <h2 className="text-base font-bold text-slate-800 dark:text-white">Sản phẩm nổi bật</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cấu hình hiển thị sản phẩm và thiết bị tiêu biểu ngoài trang chủ</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={productsConf.active} 
                                        onChange={e => setProductsConf(prev => ({ ...prev, active: e.target.checked }))} 
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    <span className="ml-2.5 text-xs font-bold text-slate-600 dark:text-slate-450">{productsConf.active ? "ĐANG BẬT" : "ĐÃ TẮT"}</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Mã nhãn VI (Badge)</label>
                                        <input value={productsConf.badge_vi} onChange={e => setProductsConf(prev => ({ ...prev, badge_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Tiêu đề chính VI</label>
                                        <input value={productsConf.title_vi} onChange={e => setProductsConf(prev => ({ ...prev, title_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Mô tả chi tiết VI</label>
                                        <textarea value={productsConf.desc_vi} onChange={e => setProductsConf(prev => ({ ...prev, desc_vi: e.target.value }))} rows={2} className="w-full h-20 px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650 resize-none" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5">Mã nhãn EN (Badge)</label>
                                        <input value={productsConf.badge_en} onChange={e => setProductsConf(prev => ({ ...prev, badge_en: e.target.value }))} className="w-full h-10 px-3.5 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5 flex justify-between items-center">
                                            Tiêu đề chính EN
                                            {enFields.products_title_en.trim() === "" && <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded font-black">YÊU CẦU EN</span>}
                                        </label>
                                        <input value={enFields.products_title_en} onChange={e => handleEnChange("products_title_en", e.target.value)} className="w-full h-10 px-3.5 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5 flex justify-between items-center">
                                            Mô tả chi tiết EN
                                            {enFields.products_desc_en.trim() === "" && <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded font-black">YÊU CẦU EN</span>}
                                        </label>
                                        <textarea value={enFields.products_desc_en} onChange={e => handleEnChange("products_desc_en", e.target.value)} rows={2} className="w-full h-20 px-3.5 py-2 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] resize-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Products mode list selectors */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Chế độ hiển thị danh sách</h3>
                                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border p-1 rounded-xl shadow-xs">
                                        <button
                                            type="button"
                                            onClick={() => { setProductsMode("auto"); setHasUnsavedChanges(true); }}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${productsMode === "auto" ? "bg-slate-900 text-white dark:bg-slate-800" : "text-slate-500 hover:text-slate-800"}`}
                                        >
                                            Hiển thị tự động (Mới nhất)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setProductsMode("manual"); setHasUnsavedChanges(true); }}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${productsMode === "manual" ? "bg-slate-900 text-white dark:bg-slate-800" : "text-slate-500 hover:text-slate-800"}`}
                                        >
                                            Chọn thủ công & Sắp xếp
                                        </button>
                                    </div>
                                </div>

                                {productsMode === "auto" ? (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Số lượng hiển thị tối đa</label>
                                        <input 
                                            type="number" 
                                            value={productsConf.limit} 
                                            onChange={e => { setProductsConf(prev => ({ ...prev, limit: parseInt(e.target.value) || 4 })); setHasUnsavedChanges(true); }}
                                            className="w-24 px-3 py-1.5 bg-white dark:bg-slate-900 border rounded text-xs font-bold" 
                                        />
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 italic">Hệ thống sẽ hiển thị tối đa {productsConf.limit} thiết bị mới nhất đang hoạt động.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Checklist */}
                                        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                                            <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 text-xs font-bold border-b dark:border-slate-800 text-slate-700 dark:text-slate-350">
                                                Chọn thiết bị hiển thị
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto divide-y dark:divide-slate-800">
                                                {activeDbProducts.map(p => {
                                                    const isChecked = selectedProducts.includes(p.id);
                                                    return (
                                                        <div 
                                                            key={p.id}
                                                            onClick={() => toggleSelectItem("products", p.id)}
                                                            className="flex items-center gap-3 p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                                                        >
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isChecked ? "bg-slate-900 border-slate-900 text-white" : "border-slate-300 dark:border-slate-700"}`}>
                                                                {isChecked && <Check size={10} strokeWidth={3} />}
                                                            </div>
                                                            <span className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{p.title_vi}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Selected lists and reordering */}
                                        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 flex flex-col">
                                            <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 text-xs font-bold border-b dark:border-slate-800 text-slate-700 dark:text-slate-350">
                                                Thứ tự hiển thị ngoài website
                                            </div>
                                            <div className="flex-1 max-h-[300px] overflow-y-auto divide-y dark:divide-slate-800">
                                                {selectedProducts.length === 0 ? (
                                                    <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                                                        Chưa chọn thiết bị nào. Hãy đánh dấu chọn ở bảng bên trái.
                                                    </div>
                                                ) : (
                                                    selectedProducts.map((id, idx) => {
                                                        const item = services.find(s => s.id === id);
                                                        if (!item) return null;
                                                        return (
                                                            <div key={id} className="flex items-center justify-between p-3 text-xs">
                                                                <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                                                                    {idx + 1}. {item.title_vi}
                                                                </span>
                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => moveItem("products", idx, "up")}
                                                                        disabled={idx === 0}
                                                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30"
                                                                    >
                                                                        <ArrowUp size={12} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => moveItem("products", idx, "down")}
                                                                        disabled={idx === selectedProducts.length - 1}
                                                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30"
                                                                    >
                                                                        <ArrowDown size={12} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- TAB 6: TIN TỨC & DỰ ÁN (NEWS) --- */}
                    {activeTab === "news" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div>
                                    <h2 className="text-base font-bold text-slate-800 dark:text-white">Tin tức</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cấu hình tiêu đề và hiển thị tiêu điểm tin tức, dự án ngoài trang chủ</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Mã nhãn VI (Badge)</label>
                                        <input value={newsConf.badge_vi} onChange={e => setNewsConf(prev => ({ ...prev, badge_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Tiêu đề chính VI</label>
                                        <input value={newsConf.title_vi} onChange={e => setNewsConf(prev => ({ ...prev, title_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5">Mã nhãn EN (Badge)</label>
                                        <input value={newsConf.badge_en} onChange={e => setNewsConf(prev => ({ ...prev, badge_en: e.target.value }))} className="w-full h-10 px-3.5 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5 flex justify-between items-center">
                                            Tiêu đề chính EN
                                            {enFields.news_title_en.trim() === "" && <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded font-black">YÊU CẦU EN</span>}
                                        </label>
                                        <input value={enFields.news_title_en} onChange={e => handleEnChange("news_title_en", e.target.value)} className="w-full h-10 px-3.5 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]" />
                                    </div>
                                </div>
                            </div>

                            {/* News selections */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Chế độ hiển thị danh sách</h3>
                                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border p-1 rounded-xl shadow-xs">
                                        <button
                                            type="button"
                                            onClick={() => { setNewsMode("auto"); setHasUnsavedChanges(true); }}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${newsMode === "auto" ? "bg-slate-900 text-white dark:bg-slate-800" : "text-slate-500 hover:text-slate-800"}`}
                                        >
                                            Hiển thị tự động (Mới nhất)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setNewsMode("manual"); setHasUnsavedChanges(true); }}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${newsMode === "manual" ? "bg-slate-900 text-white dark:bg-slate-800" : "text-slate-500 hover:text-slate-800"}`}
                                        >
                                            Chọn thủ công & Sắp xếp
                                        </button>
                                    </div>
                                </div>

                                {newsMode === "auto" ? (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Số lượng hiển thị tối đa</label>
                                        <input 
                                            type="number" 
                                            value={newsConf.limit} 
                                            onChange={e => { setNewsConf(prev => ({ ...prev, limit: parseInt(e.target.value) || 3 })); setHasUnsavedChanges(true); }}
                                            className="w-24 px-3 py-1.5 bg-white dark:bg-slate-900 border rounded text-xs font-bold" 
                                        />
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 italic">Hệ thống sẽ hiển thị tối đa {newsConf.limit} tin bài, dự án mới nhất xuất bản.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Checklist */}
                                        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                                            <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 text-xs font-bold border-b dark:border-slate-800 text-slate-700 dark:text-slate-350">
                                                Chọn tin tức hiển thị
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto divide-y dark:divide-slate-800">
                                                {articles.map(art => {
                                                    const isChecked = selectedNews.includes(art.id);
                                                    return (
                                                        <div 
                                                            key={art.id}
                                                            onClick={() => toggleSelectItem("news", art.id)}
                                                            className="flex items-center gap-3 p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                                                        >
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isChecked ? "bg-slate-900 border-slate-900 text-white" : "border-slate-300 dark:border-slate-700"}`}>
                                                                {isChecked && <Check size={10} strokeWidth={3} />}
                                                            </div>
                                                            <span className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{art.title}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Reordering */}
                                        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 flex flex-col">
                                            <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 text-xs font-bold border-b dark:border-slate-800 text-slate-700 dark:text-slate-350">
                                                Thứ tự hiển thị ngoài website
                                            </div>
                                            <div className="flex-1 max-h-[300px] overflow-y-auto divide-y dark:divide-slate-800">
                                                {selectedNews.length === 0 ? (
                                                    <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                                                        Chưa chọn tin tức nào. Hãy đánh dấu chọn ở bảng bên trái.
                                                    </div>
                                                ) : (
                                                    selectedNews.map((id, idx) => {
                                                        const item = articles.find(art => art.id === id);
                                                        if (!item) return null;
                                                        return (
                                                            <div key={id} className="flex items-center justify-between p-3 text-xs">
                                                                <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                                                                    {idx + 1}. {item.title}
                                                                </span>
                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => moveItem("news", idx, "up")}
                                                                        disabled={idx === 0}
                                                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30"
                                                                    >
                                                                        <ArrowUp size={12} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => moveItem("news", idx, "down")}
                                                                        disabled={idx === selectedNews.length - 1}
                                                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30"
                                                                    >
                                                                        <ArrowDown size={12} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- TAB 7: ĐỐI TÁC CHIẾN LƯỢC (PARTNERS) --- */}
                    {activeTab === "partners" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div>
                                    <h2 className="text-base font-bold text-slate-800 dark:text-white">Đối tác chiến lược</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cấu hình thông tin mô tả khối logo đối tác ngoài trang chủ</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={partners.active} 
                                        onChange={e => setPartners(prev => ({ ...prev, active: e.target.checked }))} 
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    <span className="ml-2.5 text-xs font-bold text-slate-600 dark:text-slate-450">{partners.active ? "ĐANG BẬT" : "ĐÃ TẮT"}</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Mã nhãn VI (Badge)</label>
                                        <input value={partners.badge_vi} onChange={e => setPartners(prev => ({ ...prev, badge_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Mô tả ngắn VI</label>
                                        <textarea value={partners.desc_vi} onChange={e => setPartners(prev => ({ ...prev, desc_vi: e.target.value }))} rows={3} className="w-full h-28 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650 resize-none" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5">Mã nhãn EN (Badge)</label>
                                        <input value={partners.badge_en} onChange={e => setPartners(prev => ({ ...prev, badge_en: e.target.value }))} className="w-full h-10 px-3.5 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5">Mô tả ngắn EN</label>
                                        <textarea value={partners.desc_en} onChange={e => setPartners(prev => ({ ...prev, desc_en: e.target.value }))} rows={3} className="w-full h-28 px-3.5 py-2.5 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] resize-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 8: KÊU GỌI HÀNH ĐỘNG (CTA) --- */}
                    {activeTab === "cta" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div>
                                    <h2 className="text-base font-bold text-slate-800 dark:text-white">Nút Kêu gọi cuối trang (CTA)</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cấu hình tiêu đề, nút bấm liên hệ khẩn cấp ở khối cuối trang</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={cta.active} 
                                        onChange={e => setCta(prev => ({ ...prev, active: e.target.checked }))} 
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    <span className="ml-2.5 text-xs font-bold text-slate-600 dark:text-slate-450">{cta.active ? "ĐANG BẬT" : "ĐÃ TẮT"}</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Mã nhãn VI (Badge)</label>
                                        <input value={cta.badge_vi} onChange={e => setCta(prev => ({ ...prev, badge_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Tiêu đề chính VI</label>
                                        <input value={cta.title_vi} onChange={e => setCta(prev => ({ ...prev, title_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 block mb-1.5">Mô tả chi tiết VI</label>
                                        <textarea value={cta.desc_vi} onChange={e => setCta(prev => ({ ...prev, desc_vi: e.target.value }))} rows={2} className="w-full h-20 px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650 resize-none" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5">Mã nhãn EN (Badge)</label>
                                        <input value={cta.badge_en} onChange={e => setCta(prev => ({ ...prev, badge_en: e.target.value }))} className="w-full h-10 px-3.5 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5 flex justify-between items-center">
                                            Tiêu đề chính EN
                                            {enFields.cta_title_en.trim() === "" && <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded font-black">YÊU CẦU EN</span>}
                                        </label>
                                        <input value={enFields.cta_title_en} onChange={e => handleEnChange("cta_title_en", e.target.value)} className="w-full h-10 px-3.5 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-850 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1.5 flex justify-between items-center">
                                            Mô tả chi tiết EN
                                            {enFields.cta_desc_en.trim() === "" && <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded font-black">YÊU CẦU EN</span>}
                                        </label>
                                        <textarea value={enFields.cta_desc_en} onChange={e => handleEnChange("cta_desc_en", e.target.value)} rows={2} className="w-full h-20 px-3.5 py-2 bg-amber-500/[0.03] border border-[#f59e0b]/30 rounded-xl text-sm font-semibold text-slate-850 dark:text-white outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] resize-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Buttons and Trust items */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Nút Liên Hệ 1 (Email)</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 mb-1 block">Tên nút (VI)</label>
                                            <input value={cta.btn1_text_vi} onChange={e => setCta(prev => ({ ...prev, btn1_text_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-550 mb-1 block">Tên nút (EN)</label>
                                            <input value={cta.btn1_text_en} onChange={e => setCta(prev => ({ ...prev, btn1_text_en: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Địa chỉ Email / Link</label>
                                        <input value={cta.btn1_link} onChange={e => setCta(prev => ({ ...prev, btn1_link: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-800 dark:text-white outline-none focus:border-red-650" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Nút Liên Hệ 2 (Hotline)</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 mb-1 block">Tên nút (VI)</label>
                                            <input value={cta.btn2_text_vi} onChange={e => setCta(prev => ({ ...prev, btn2_text_vi: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-550 mb-1 block">Tên nút (EN)</label>
                                            <input value={cta.btn2_text_en} onChange={e => setCta(prev => ({ ...prev, btn2_text_en: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-red-650" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Số điện thoại / Link</label>
                                        <input value={cta.btn2_link} onChange={e => setCta(prev => ({ ...prev, btn2_link: e.target.value }))} className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-800 dark:text-white outline-none focus:border-red-650" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                        </div>
                </form>
            </div>
        </div>
    </div>
    );
}

