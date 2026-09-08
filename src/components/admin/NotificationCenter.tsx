import { useState, useRef, useEffect } from "react";
import { 
    Bell, CheckCheck, Clock, X, Info, AlertTriangle, CheckCircle2, 
    ShieldAlert, Package, FileText, User, AtSign, MessageSquare, 
    CheckSquare, Settings, Trash2, Loader2 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    getNotificationsAction, 
    getUnreadNotificationsCountAction, 
    markAllAsReadAction, 
    markAsReadAction,
    clearOldNotificationsAction,
    checkEntityExistsAction
} from "@/actions/notifications";
import { getSocket } from "@/lib/socket";
import { getSessionAction } from "@/actions/auth";
import toast from "react-hot-toast";

export default function NotificationCenter() {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [clearing, setClearing] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<any[]>([]);
    const router = useRouter();

    const fetchUnreadCount = async () => {
        try {
            const count = await getUnreadNotificationsCountAction();
            setUnreadCount(count ?? 0);
        } catch (err) {
            console.error("Lỗi poll unread count:", err);
        }
    };

    const fetchFullList = async () => {
        try {
            const data = await getNotificationsAction();
            setNotifications(data ?? []);
            notificationsRef.current = data ?? [];
        } catch (err) {
            console.error("Lỗi lấy danh sách thông báo:", err);
        }
    };

    const previousUnreadRef = useRef(0);

    useEffect(() => {
        if (unreadCount > previousUnreadRef.current && previousUnreadRef.current !== 0) {
            const notisEnabled = localStorage.getItem("notifications_enabled") !== "false";
            if (notisEnabled) {
                const audio = new Audio("/sounds/notification.mp3");
                audio.volume = 0.3;
                audio.play().catch(() => {});
                
                toast.success("Bạn có thông báo mới", {
                    icon: '🔔',
                    duration: 5000,
                    style: { 
                        background: '#0f172a', 
                        color: '#fff', 
                        fontSize: '11px', 
                        fontWeight: 'bold', 
                        border: '1px solid rgba(255,255,255,0.1)' 
                    }
                });
                
                // Refresh list if dropdown is open
                if (isOpen) {
                    fetchFullList();
                }
            }
        }
        previousUnreadRef.current = unreadCount;
    }, [unreadCount, isOpen]);

    useEffect(() => {
        setMounted(true);
        fetchUnreadCount();

        // Realtime Socket.IO
        const socket = getSocket();
        socket.connect();
        
        const joinRoom = async () => {
            try {
                const session = await getSessionAction();
                if (session?.userId) {
                    socket.emit("join_user", { userId: session.userId, role: session.role });
                }
            } catch (e) {
                console.error(e);
            }
        };

        socket.on("connect", joinRoom);
        // If already connected before the listener was added
        if (socket.connected) {
            joinRoom();
        }

        const handleNotification = () => {
            // Fetch unread count, which will trigger the sound and list refresh (if open)
            // in the other useEffect when count increases
            fetchUnreadCount();
        };

        socket.on("notification", handleNotification);

        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            socket.off("connect", joinRoom);
            socket.off("notification", handleNotification);
        };
    }, []);

    // Fetch the list immediately when dropdown is opened to keep it up-to-date
    useEffect(() => {
        if (isOpen) {
            fetchFullList();
        }
    }, [isOpen]);

    const handleToggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const markAllRead = async () => {
        const res = await markAllAsReadAction();
        if (res.success) {
            toast.success("Đã đánh dấu tất cả là đã đọc", { style: { fontSize: '11px' } });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            notificationsRef.current = notificationsRef.current.map(n => ({ ...n, isRead: true }));
        }
    };

    const handleClearOld = async () => {
        setClearing(true);
        const res = await clearOldNotificationsAction();
        if (res.success) {
            toast.success("Đã dọn dẹp các thông báo đã đọc!");
            await fetchFullList();
            await fetchUnreadCount();
        } else {
            toast.error("Không thể dọn dẹp thông báo cũ.");
        }
        setClearing(false);
    };

    const handleNotificationClick = async (n: any) => {
        setIsOpen(false);
        
        // 1. Đánh dấu đã đọc ngay lập tức trên UI và DB
        if (!n.isRead) {
            await markAsReadAction(n.id);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
        }

        // 2. Kiểm tra thực thể liên kết (Safety Checks - Conforms to Requirement #8)
        if (n.entityId && n.entityType) {
            toast.loading("Đang kiểm tra liên kết...", { id: "notif-check" });
            const exists = await checkEntityExistsAction(n.entityType, n.entityId);
            toast.dismiss("notif-check");
            
            if (!exists) {
                toast.error("Dữ liệu không còn tồn tại", {
                    icon: '⚠️',
                    style: { background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 'bold' }
                });
                return;
            }
        }

        // 3. Điều hướng thông minh (Conforms to Requirement #8)
        const t = n.type;
        let meta = n.metadata;
        if (typeof meta === 'string') {
            try { meta = JSON.parse(meta); } catch(e) {}
        }

        if (t === "CHAT_MESSAGE" || t === "CHAT_MENTION" || t === "CHAT_GROUP") {
            const cid = meta?.conversationId || n.entityId;
            router.push("/admin");
        } else if (t === "IT_SUPPORT") {
            const ticketId = meta?.ticketId || n.entityId;
            router.push("/admin");
        } else if (t === "SYSTEM_LOG") {
            router.push("/admin");
        } else if (t.startsWith("PRODUCT")) {
            router.push("/admin/cms/products");
        } else if (t.startsWith("ARTICLE")) {
            router.push("/admin/cms/articles");
        } else if (t.startsWith("USER")) {
            router.push("/admin");
        } else if (t.startsWith("TASK")) {
            router.push("/admin");
        } else {
            router.push("/admin");
        }
    };

    // Styling based on notification severity (Conforms to Requirement #3)
    const getSeverityStyles = (severity: string, isRead: boolean) => {
        const sev = severity?.toLowerCase();
        switch (sev) {
            case "success":
                return {
                    borderLeft: isRead ? "border-l-4 border-emerald-500/35" : "border-l-4 border-emerald-500",
                    bgAccent: isRead ? "" : "bg-emerald-50/30 dark:bg-emerald-950/10",
                    iconColor: "text-emerald-500",
                    badgeColor: "bg-emerald-500",
                    iconBg: "bg-emerald-50 dark:bg-emerald-950/30"
                };
            case "warning":
                return {
                    borderLeft: isRead ? "border-l-4 border-amber-500/35" : "border-l-4 border-amber-500",
                    bgAccent: isRead ? "" : "bg-amber-50/20 dark:bg-amber-950/10",
                    iconColor: "text-amber-500",
                    badgeColor: "bg-amber-500",
                    iconBg: "bg-amber-50 dark:bg-amber-950/30"
                };
            case "error":
                return {
                    borderLeft: isRead ? "border-l-4 border-rose-500/35" : "border-l-4 border-rose-500",
                    bgAccent: isRead ? "" : "bg-rose-50/20 dark:bg-rose-950/10",
                    iconColor: "text-rose-500",
                    badgeColor: "bg-rose-500",
                    iconBg: "bg-rose-50 dark:bg-rose-950/30"
                };
            case "info":
            default:
                return {
                    borderLeft: isRead ? "" : "border-l-4 border-blue-500",
                    bgAccent: isRead ? "" : "bg-blue-50/30 dark:bg-blue-950/10",
                    iconColor: "text-blue-500",
                    badgeColor: "bg-blue-500",
                    iconBg: "bg-blue-50 dark:bg-blue-950/30"
                };
        }
    };

    // Modern icon mapping based on module and type
    const getNotificationIcon = (type: string, sevStyles: any) => {
        const size = 16;
        const className = sevStyles.iconColor;
        
        switch (type) {
            case "PRODUCT_CREATED":
            case "PRODUCT_UPDATED":
            case "PRODUCT_DELETED":
                return <Package size={size} className={className} />;
            case "ARTICLE_CREATED":
            case "ARTICLE_UPDATED":
            case "ARTICLE_DELETED":
                return <FileText size={size} className={className} />;
            case "USER_CREATED":
            case "USER_UPDATED":
            case "USER_DISABLED":
                return <User size={size} className={className} />;
            case "CHAT_MENTION":
                return <AtSign size={size} className={className} />;
            case "CHAT_GROUP":
                return <MessageSquare size={size} className={className} />;
            case "TASK_ASSIGNED":
            case "TASK_UPDATED":
                return <CheckSquare size={size} className={className} />;
            case "SYSTEM_LOG":
            default:
                return <Settings size={size} className={className} />;
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return "Vừa xong";
        if (minutes < 60) return `${minutes} phút trước`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} giờ trước`;
        return new Date(date).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // Grouping helper (Conforms to Requirement #6 - Today, Yesterday, Earlier)
    const groupNotifications = (list: any[]) => {
        const today: any[] = [];
        const yesterday: any[] = [];
        const earlier: any[] = [];
        
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
        
        list.forEach(n => {
            const created = new Date(n.createdAt);
            if (created >= startOfToday) {
                today.push(n);
            } else if (created >= startOfYesterday) {
                yesterday.push(n);
            } else {
                earlier.push(n);
            }
        });
        
        return { today, yesterday, earlier };
    };

    const { today, yesterday, earlier } = groupNotifications(notifications);

    if (!mounted) {
        return (
            <div className="relative">
                <button className="p-2.5 rounded-xl text-slate-500 hover:text-premium-red hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Bell size={22} />
                </button>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell trigger button */}
            <button 
                onClick={handleToggleDropdown} 
                className={`p-2.5 rounded-xl transition-all relative ${
                    isOpen 
                        ? "bg-red-50 text-[#E60000] shadow-inner dark:bg-slate-800 dark:text-red-400" 
                        : "text-slate-500 hover:text-premium-red dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
            >
                <Bell size={22} className={unreadCount > 0 ? "animate-pulse" : ""} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-[#E60000] text-white text-[9px] font-black rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center animate-bounce shadow-md">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <>
                <div 
                    className="fixed inset-0 z-[9998] bg-slate-950/40 md:hidden animate-in fade-in" 
                    onClick={() => setIsOpen(false)}
                />
                
                <div className="fixed inset-x-0 bottom-0 z-[9999] max-h-[82vh] flex flex-col rounded-t-3xl bg-white dark:bg-slate-950 shadow-[0_-20px_50px_rgba(0,0,0,0.15)] md:absolute md:left-1/2 md:-translate-x-1/2 md:top-full md:bottom-auto md:mt-4 md:w-[420px] md:bg-white md:dark:bg-[#0f172a] md:rounded-3xl md:shadow-[0_20px_50px_rgba(0,0,0,0.15)] md:border md:border-slate-100 md:dark:border-slate-800 overflow-hidden transition-all animate-in slide-in-from-bottom-full md:fade-in md:slide-in-from-top-2 duration-200">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                        <div>
                            <h3 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-[0.15em] font-sans">
                                Thông báo hệ thống
                            </h3>
                            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                                Bạn có {unreadCount} tin chưa đọc
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllRead} 
                                    className="text-[9px] font-black text-premium-red dark:text-red-400 drop-shadow-sm uppercase tracking-wider hover:underline flex items-center gap-1 transition-all"
                                >
                                    <CheckCheck size={12} /> Đọc hết
                                </button>
                            )}
                            {notifications.some(n => n.isRead) && (
                                <button 
                                    onClick={handleClearOld}
                                    disabled={clearing}
                                    className="text-[9px] font-black text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400 uppercase tracking-wider hover:underline flex items-center gap-1 transition-all disabled:opacity-50"
                                >
                                    {clearing ? (
                                        <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={12} />
                                    )}
                                    Dọn dẹp
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Scrollable List */}
                    <div className="max-h-[420px] overflow-y-auto custom-scrollbar font-sans">
                        {notifications.length === 0 ? (
                            <div className="py-16 px-6 text-center">
                                <Bell size={36} className="mx-auto text-slate-200 dark:text-slate-800 mb-3 animate-bounce" />
                                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                                    Không có thông báo nào
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50 dark:divide-slate-800/40">
                                
                                {/* Section: Today */}
                                {today.length > 0 && (
                                    <div>
                                        <div className="px-5 py-2.5 bg-slate-50/70 dark:bg-slate-900/40 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest border-b border-slate-50/30">
                                            Hôm nay
                                        </div>
                                        {today.map(n => renderCard(n))}
                                    </div>
                                )}

                                {/* Section: Yesterday */}
                                {yesterday.length > 0 && (
                                    <div>
                                        <div className="px-5 py-2.5 bg-slate-50/70 dark:bg-slate-900/40 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest border-b border-slate-50/30">
                                            Hôm qua
                                        </div>
                                        {yesterday.map(n => renderCard(n))}
                                    </div>
                                )}

                                {/* Section: Earlier */}
                                {earlier.length > 0 && (
                                    <div>
                                        <div className="px-5 py-2.5 bg-slate-50/70 dark:bg-slate-900/40 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest border-b border-slate-50/30">
                                            Cũ hơn
                                        </div>
                                        {earlier.map(n => renderCard(n))}
                                    </div>
                                )}

                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-center">
                        <Link 
                            href="/admin" 
                            className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest hover:text-premium-red dark:hover:text-red-400 transition-colors block"
                        >
                            Xem nhật ký hệ thống toàn cục →
                        </Link>
                    </div>
                </div>
                </>
            )}
        </div>
    );

    // Individual notification card renderer
    function renderCard(n: any) {
        const sevStyles = getSeverityStyles(n.severity, n.isRead);
        
        return (
            <div 
                key={n.id} 
                onClick={() => handleNotificationClick(n)} 
                className={`p-5 flex gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all cursor-pointer relative group ${
                    !n.isRead 
                        ? "bg-red-50/10 dark:bg-red-500/5 " + sevStyles.bgAccent 
                        : "opacity-85 hover:opacity-100"
                } ${sevStyles.borderLeft}`}
            >
                {/* Module Icon container */}
                <div className={`w-9 h-9 border rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:scale-105 ${
                    !n.isRead 
                        ? "bg-white dark:bg-slate-900 border-red-100 dark:border-red-950/40" 
                        : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800"
                } ${sevStyles.iconBg}`}>
                    {getNotificationIcon(n.type, sevStyles)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            !n.isRead 
                                ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400" 
                                : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                        }`}>
                            {n.module || "HỆ THỐNG"}
                        </span>
                        {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                        )}
                    </div>
                    
                    <h4 className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 mb-0.5 ${
                        !n.isRead ? "text-slate-950 dark:text-white" : "text-slate-400 dark:text-slate-500"
                    }`}>
                        {n.title}
                    </h4>
                    
                    <p className={`text-[11px] leading-relaxed transition-colors break-words whitespace-pre-wrap ${
                        !n.isRead 
                            ? "font-extrabold text-slate-800 dark:text-slate-200" 
                            : "font-semibold text-slate-500 dark:text-slate-500"
                    }`}>
                        {n.message}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                        <Clock size={10} className="text-slate-300 dark:text-slate-700" />
                        <span className="text-[8px] font-bold text-slate-300 dark:text-slate-700 uppercase font-mono italic">
                            {formatTime(n.createdAt)}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}
