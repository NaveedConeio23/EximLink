// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";
// import Link from "next/link";
// import ProfileModal from "../components/ProfileModal";

// // ─── Types ───────────────────────────────────────────────
// type Conversation = {
//   cr89e_crmconversationid: string;
//   cr89e_name: string;
//   cr89e_phonenumber: string;
// };
// type Message = {
//   cr89e_crmwhatsappid: string;
//   cr89e_messagetext: string;
//   cr89e_fileurl?: string;
//   cr89e_filename?: string;
//   cr89e_direction: number;
//   cr89e_timestamp: string;
//   cr89e_sender?: string;
//   cr89e_name?: string;
// };
// type Tag = { id: string; label: string; color: string };

// const TAG_OPTIONS: Tag[] = [
//   {
//     id: "granite",
//     label: "🪨 Granite",
//     color: "bg-[#FF8C42]/10 text-[#FF8C42]",
//   },
//   {
//     id: "freight",
//     label: "🚢 Freight",
//     color: "bg-[#48CAE4]/10 text-[#48CAE4]",
//   },
//   { id: "hsn", label: "📋 HSN", color: "bg-[#9B5DE5]/10 text-[#9B5DE5]" },
//   {
//     id: "partnership",
//     label: "🤝 Partnership",
//     color: "bg-[#99D98C]/10 text-[#5a9e4e]",
//   },
//   { id: "urgent", label: "🔥 Urgent", color: "bg-red-100 text-red-500" },
//   {
//     id: "followup",
//     label: "📌 Follow Up",
//     color: "bg-yellow-100 text-yellow-600",
//   },
// ];

// export default function ChatDashboard() {
//   const [conversations, setConversations] = useState<Conversation[]>([]);
//   const [selected, setSelected] = useState<Conversation | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [text, setText] = useState("");
//   const [profileOpen, setProfileOpen] = useState(false);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [search, setSearch] = useState("");

//   // Per-conversation state stored as maps keyed by conversationId
//   const [agentModes, setAgentModes] = useState<Record<string, boolean>>({});
//   const [resolvedConvs, setResolvedConvs] = useState<Record<string, boolean>>(
//     {},
//   );
//   const [convTags, setConvTags] = useState<Record<string, string[]>>({});
//   const [showTagMenu, setShowTagMenu] = useState(false);
//   const [showResolveConfirm, setShowResolveConfirm] = useState(false);
//   const [toast, setToast] = useState<{
//     msg: string;
//     type: "success" | "info" | "error";
//   } | null>(null);
//   const [notes, setNotes] = useState<Record<string, string>>({});

//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const messageEndRef = useRef<HTMLDivElement>(null);
//   const tagMenuRef = useRef<HTMLDivElement>(null);

//   const [user, setUser] = useState({
//     firstName: "Coneio",
//     lastName: "Global",
//     email: "admin@coneio.com",
//   });

//   const showToast = (
//     msg: string,
//     type: "success" | "info" | "error" = "success",
//   ) => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3000);
//   };

//   useEffect(() => {
//     messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//     fetch("/api/conversations", { credentials: "include" })
//       .then((r) => r.json())
//       .then(setConversations);
//   }, []);

//   // Close tag menu when clicking outside
//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (
//         tagMenuRef.current &&
//         !tagMenuRef.current.contains(e.target as Node)
//       ) {
//         setShowTagMenu(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const loadMessages = async (conv: Conversation) => {
//     setSelected(conv);
//     setShowTagMenu(false);
//     setShowResolveConfirm(false);
//     const res = await fetch(
//       `/api/messages?conversationId=${conv.cr89e_crmconversationid}`,
//       { credentials: "include" },
//     );
//     const data = await res.json();
//     setMessages(
//       data.sort(
//         (a: Message, b: Message) =>
//           new Date(a.cr89e_timestamp).getTime() -
//           new Date(b.cr89e_timestamp).getTime(),
//       ),
//     );

//     // Sync agent mode from server
//     const phone = conv.cr89e_phonenumber.replace(/\s+/g, "");
//     const modeRes = await fetch(`/api/agent-mode?phone=${phone}`, {
//       credentials: "include",
//     });
//     const modeData = await modeRes.json();
//     setAgentModes((prev) => ({
//       ...prev,
//       [conv.cr89e_crmconversationid]: modeData.agentMode,
//     }));
//   };

//   const toggleAgentMode = async (toAgent: boolean) => {
//     if (!selected) return;
//     const phone = selected.cr89e_phonenumber.replace(/\s+/g, "");
//     await fetch("/api/agent-mode", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({ phone, agentMode: toAgent }),
//     });
//     setAgentModes((prev) => ({
//       ...prev,
//       [selected.cr89e_crmconversationid]: toAgent,
//     }));
//     showToast(
//       toAgent
//         ? "🧑‍💼 Agent mode ON — you're in control. Bot is silent."
//         : "🤖 Bot mode ON — AI is handling the chat.",
//       "info",
//     );
//   };

//   const sendMessage = async () => {
//     if (!selected || (!text.trim() && !selectedFile)) return;
//     const formData = new FormData();
//     formData.append("to", selected.cr89e_phonenumber.replace(/\s+/g, ""));
//     if (text.trim()) formData.append("message", text);
//     if (selectedFile) formData.append("file", selectedFile);
//     await fetch("/api/send-message", {
//       method: "POST",
//       credentials: "include",
//       body: formData,
//     });
//     setText("");
//     setSelectedFile(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//     loadMessages(selected);
//     showToast("✅ Message sent!");
//   };

//   const toggleTag = (convId: string, tagId: string) => {
//     setConvTags((prev) => {
//       const current = prev[convId] || [];
//       const updated = current.includes(tagId)
//         ? current.filter((t) => t !== tagId)
//         : [...current, tagId];
//       showToast(current.includes(tagId) ? "🏷️ Tag removed" : "🏷️ Tag added!");
//       return { ...prev, [convId]: updated };
//     });
//   };

//   const resolveConversation = () => {
//     if (!selected) return;
//     setResolvedConvs((prev) => ({
//       ...prev,
//       [selected.cr89e_crmconversationid]: true,
//     }));
//     setShowResolveConfirm(false);
//     showToast("✅ Conversation marked as resolved!");
//   };

//   const reopenConversation = () => {
//     if (!selected) return;
//     setResolvedConvs((prev) => ({
//       ...prev,
//       [selected.cr89e_crmconversationid]: false,
//     }));
//     showToast("🔄 Conversation reopened", "info");
//   };

//   const formatTime = (d: Date) =>
//     d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   const formatDate = (d: Date) => {
//     const today = new Date();
//     const yest = new Date(today);
//     yest.setDate(yest.getDate() - 1);
//     if (d.toDateString() === today.toDateString()) return "Today";
//     if (d.toDateString() === yest.toDateString()) return "Yesterday";
//     return d.toLocaleDateString("en-GB", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const initials =
//     user.firstName[0].toUpperCase() + user.lastName[0].toUpperCase();
//   const getInitials = (n: string) =>
//     n
//       ?.split(" ")
//       .map((x) => x[0])
//       .join("")
//       .substring(0, 2)
//       .toUpperCase() || "??";
//   const COLORS = [
//     "bg-[#FF8C42]",
//     "bg-[#48CAE4]",
//     "bg-[#99D98C]",
//     "bg-[#9B5DE5]",
//     "bg-[#F72585]",
//     "bg-[#4361EE]",
//   ];
//   const getColor = (n: string) =>
//     COLORS[(n?.charCodeAt(0) || 0) % COLORS.length];

//   const filteredConvs = conversations.filter(
//     (c) =>
//       c.cr89e_name?.toLowerCase().includes(search.toLowerCase()) ||
//       c.cr89e_phonenumber?.includes(search),
//   );

//   const isAgentMode = selected
//     ? agentModes[selected.cr89e_crmconversationid] || false
//     : false;
//   const isResolved = selected
//     ? resolvedConvs[selected.cr89e_crmconversationid] || false
//     : false;
//   const currentTags = selected
//     ? convTags[selected.cr89e_crmconversationid] || []
//     : [];

//   return (
//     <div className="flex h-screen bg-[#F5F5DC] font-sans overflow-hidden">
//       {/* ── Toast ── */}
//       {toast && (
//         <div
//           className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm transition-all
//           ${toast.type === "success" ? "bg-[#99D98C] text-[#1a4a1a]" : toast.type === "error" ? "bg-red-400 text-white" : "bg-[#48CAE4] text-white"}`}
//         >
//           {toast.msg}
//         </div>
//       )}

//       {/* ── Resolve Confirm Modal ── */}
//       {showResolveConfirm && (
//         <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
//           <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-[#4A4E69]/10 w-80">
//             <div className="text-center mb-6">
//               <div className="text-4xl mb-3">✅</div>
//               <h3 className="font-black text-[#4A4E69] text-lg">
//                 Mark as Resolved?
//               </h3>
//               <p className="text-sm text-[#4A4E69]/50 font-medium mt-2">
//                 This will mark the conversation as completed. The chat history
//                 will be preserved.
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setShowResolveConfirm(false)}
//                 className="flex-1 py-3 rounded-2xl border-2 border-[#4A4E69]/10 text-sm font-black text-[#4A4E69] hover:bg-[#F5F5DC] transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={resolveConversation}
//                 className="flex-1 py-3 rounded-2xl bg-[#4A4E69] text-white text-sm font-black hover:opacity-90 transition shadow-lg"
//               >
//                 Resolve ✓
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Left Nav ── */}
//       <aside className="w-16 flex flex-col items-center py-5 bg-white border-r-2 border-[#FF8C42]/10 shadow-sm z-10">
//         <div className="w-10 h-10 rounded-2xl bg-[#FF8C42] flex items-center justify-center shadow-lg shadow-[#FF8C42]/30 mb-6">
//           <img src="/coneio5.png" alt="Logo" className="w-9 h-9 object-contain" />
//         </div>
//         <div className="flex flex-col gap-4 flex-1 items-center pt-2">
//           <Link
//             href="/dashboard"
//             title="Chats"
//             className="w-10 h-10 rounded-2xl bg-[#48CAE4]/10 text-[#48CAE4] flex items-center justify-center hover:bg-[#48CAE4]/20 transition"
//           >
//             <svg
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.105-3.134 2-7 2s-7-.895-7-2m14 0V8c0-1.105-3.134-2-7-2S3 6.895 3 8v8m14 0c0 1.105-3.134 2-7 2s-7-.895-7-2"
//               />
//             </svg>
//           </Link>
//           <Link
//             href="/analytics"
//             title="Analytics"
//             className="w-10 h-10 rounded-2xl bg-[#F5F5DC] text-[#4A4E69]/40 flex items-center justify-center hover:bg-[#FF8C42]/10 hover:text-[#FF8C42] transition"
//           >
//             <svg
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
//               />
//             </svg>
//           </Link>
//         </div>
//         <div
//           onClick={() => setProfileOpen(true)}
//           className={`w-10 h-10 rounded-full ${getColor(user.firstName)} flex items-center justify-center text-white font-black text-xs cursor-pointer hover:scale-110 transition shadow-md`}
//         >
//           {initials}
//         </div>
//       </aside>

//       {/* ── Conversation List ── */}
//       <section className="w-80 flex flex-col bg-white border-r-2 border-[#FF8C42]/10 shadow-sm">
//         <div className="p-5 border-b-2 border-[#FF8C42]/5">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h1 className="text-sm font-black text-[#4A4E69]">
//                 Conversations
//               </h1>
//               <div className="flex items-center gap-1.5 mt-0.5">
//                 <span className="w-2 h-2 rounded-full bg-[#99D98C] animate-pulse" />
//                 <span className="text-[10px] font-black text-[#99D98C] uppercase tracking-widest">
//                   Live
//                 </span>
//               </div>
//             </div>
//             <span className="bg-[#FF8C42]/10 text-[#FF8C42] font-black text-xs px-3 py-1.5 rounded-full">
//               {conversations.length}
//             </span>
//           </div>
//           <div className="relative">
//             <svg
//               className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4E69]/30"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//               />
//             </svg>
//             <input
//               type="text"
//               placeholder="Search chats..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full pl-9 pr-4 py-2.5 bg-[#F5F5DC]/70 border-2 border-[#4A4E69]/5 rounded-2xl text-xs font-medium text-[#4A4E69] placeholder-[#4A4E69]/30 outline-none focus:border-[#FF8C42]/30 transition"
//             />
//           </div>
//         </div>

//         <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
//           {filteredConvs.length === 0 && (
//             <div className="flex flex-col items-center justify-center h-40 text-[#4A4E69]/30">
//               <span className="text-3xl mb-2">💬</span>
//               <p className="text-xs font-bold">No conversations yet</p>
//             </div>
//           )}
//           {filteredConvs.map((c) => {
//             const active =
//               selected?.cr89e_crmconversationid === c.cr89e_crmconversationid;
//             const isAgt = agentModes[c.cr89e_crmconversationid];
//             const isRes = resolvedConvs[c.cr89e_crmconversationid];
//             const tags = convTags[c.cr89e_crmconversationid] || [];
//             return (
//               <div
//                 key={c.cr89e_crmconversationid}
//                 onClick={() => loadMessages(c)}
//                 className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${active ? "bg-[#FF8C42]/10 border-2 border-[#FF8C42]/20" : "hover:bg-[#F5F5DC]/80 border-2 border-transparent"}`}
//               >
//                 <div className="relative flex-shrink-0">
//                   <div
//                     className={`w-11 h-11 rounded-2xl ${getColor(c.cr89e_name)} flex items-center justify-center text-white font-black text-sm shadow-md`}
//                   >
//                     {getInitials(c.cr89e_name)}
//                   </div>
//                   {isRes && (
//                     <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#99D98C] rounded-full flex items-center justify-center text-[8px]">
//                       ✓
//                     </div>
//                   )}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p
//                     className={`text-sm font-black truncate ${active ? "text-[#FF8C42]" : "text-[#4A4E69]"}`}
//                   >
//                     {c.cr89e_name}
//                   </p>
//                   <p className="text-[11px] text-[#4A4E69]/40 font-medium truncate mt-0.5">
//                     {c.cr89e_phonenumber}
//                   </p>
//                   {tags.length > 0 && (
//                     <div className="flex gap-1 mt-1 flex-wrap">
//                       {tags.slice(0, 2).map((tid) => {
//                         const t = TAG_OPTIONS.find((x) => x.id === tid);
//                         return t ? (
//                           <span
//                             key={tid}
//                             className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${t.color}`}
//                           >
//                             {t.label}
//                           </span>
//                         ) : null;
//                       })}
//                     </div>
//                   )}
//                 </div>
//                 <span
//                   className={`text-[9px] font-black px-2 py-1 rounded-full flex-shrink-0 ${isAgt ? "bg-[#FF8C42]/10 text-[#FF8C42]" : "bg-[#48CAE4]/10 text-[#48CAE4]"}`}
//                 >
//                   {isAgt ? "👤" : "🤖"}
//                 </span>
//               </div>
//             );
//           })}
//         </div>

//         <div className="p-4 border-t-2 border-[#FF8C42]/5 bg-[#F5F5DC]/30">
//           <div className="flex items-center gap-2">
//             <div
//               className={`w-8 h-8 rounded-xl ${getColor(user.firstName)} flex items-center justify-center text-white font-black text-xs`}
//             >
//               {initials}
//             </div>
//             <div>
//               <p className="text-xs font-black text-[#4A4E69]">
//                 {user.firstName} {user.lastName}
//               </p>
//               <p className="text-[10px] text-[#4A4E69]/40 font-medium">
//                 Coneio Exim Pvt Ltd.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── Main Chat ── */}
//       <main className="flex-1 flex flex-col overflow-hidden">
//         {selected ? (
//           <>
//             {/* Chat Header */}
//             <header className="h-20 flex items-center justify-between px-6 bg-white border-b-2 border-[#FF8C42]/10 shadow-sm flex-shrink-0">
//               <div className="flex items-center gap-4">
//                 <div
//                   className={`w-12 h-12 rounded-2xl ${getColor(selected.cr89e_name)} flex items-center justify-center text-white font-black text-sm shadow-lg`}
//                 >
//                   {getInitials(selected.cr89e_name)}
//                 </div>
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <h2 className="text-sm font-black text-[#4A4E69]">
//                       {selected.cr89e_name}
//                     </h2>
//                     {isResolved && (
//                       <span className="text-[10px] font-black bg-[#99D98C]/20 text-[#5a9e4e] px-2 py-0.5 rounded-full">
//                         ✓ Resolved
//                       </span>
//                     )}
//                   </div>
//                   <div className="flex items-center gap-1.5">
//                     <span
//                       className={`w-2 h-2 rounded-full animate-pulse ${isAgentMode ? "bg-[#FF8C42]" : "bg-[#99D98C]"}`}
//                     />
//                     <span
//                       className={`text-[10px] font-black uppercase tracking-wider ${isAgentMode ? "text-[#FF8C42]" : "text-[#99D98C]"}`}
//                     >
//                       {isAgentMode ? "Agent Mode" : "Bot Active"}
//                     </span>
//                     <span className="text-[#4A4E69]/30 text-[10px] font-bold">
//                       • {selected.cr89e_phonenumber}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Bot / Agent Toggle */}
//               <div className="flex items-center gap-3">
//                 <div className="flex bg-[#F5F5DC] p-1 rounded-2xl border-2 border-[#4A4E69]/5">
//                   <button
//                     onClick={() => toggleAgentMode(false)}
//                     className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${!isAgentMode ? "bg-white shadow-sm text-[#48CAE4]" : "text-[#4A4E69]/30 hover:text-[#4A4E69]/60"}`}
//                   >
//                     🤖 Bot
//                   </button>
//                   <button
//                     onClick={() => toggleAgentMode(true)}
//                     className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${isAgentMode ? "bg-white shadow-sm text-[#FF8C42]" : "text-[#4A4E69]/30 hover:text-[#4A4E69]/60"}`}
//                   >
//                     👤 Agent
//                   </button>
//                 </div>
//               </div>
//             </header>

//             {/* Agent mode banner */}
//             {isAgentMode && (
//               <div className="bg-[#FF8C42]/10 border-b-2 border-[#FF8C42]/20 px-6 py-2.5 flex items-center justify-between flex-shrink-0">
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm">👤</span>
//                   <span className="text-xs font-black text-[#FF8C42]">
//                     Agent mode active — bot is silent. You are now handling this
//                     conversation directly.
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => toggleAgentMode(false)}
//                   className="text-[10px] font-black text-[#FF8C42] hover:underline"
//                 >
//                   Hand back to bot
//                 </button>
//               </div>
//             )}

//             {/* Resolved banner */}
//             {isResolved && (
//               <div className="bg-[#99D98C]/10 border-b-2 border-[#99D98C]/20 px-6 py-2.5 flex items-center justify-between flex-shrink-0">
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm">✅</span>
//                   <span className="text-xs font-black text-[#5a9e4e]">
//                     This conversation has been resolved.
//                   </span>
//                 </div>
//                 <button
//                   onClick={reopenConversation}
//                   className="text-[10px] font-black text-[#5a9e4e] hover:underline"
//                 >
//                   Reopen
//                 </button>
//               </div>
//             )}

//             {/* Messages */}
//             <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#F5F5DC]/40">
//               {messages.map((m, i) => {
//                 const d = new Date(m.cr89e_timestamp);
//                 const prev =
//                   i > 0 ? new Date(messages[i - 1].cr89e_timestamp) : null;
//                 const showDate =
//                   !prev || d.toDateString() !== prev.toDateString();
//                 const isIn = m.cr89e_direction === 833680000;
//                 // Detect sender from cr89e_name stored in CRM
//                 const senderName: string = m.cr89e_name || "";
//                 const isFromBot =
//                   !isIn && senderName.toLowerCase().includes("bot");

//                 return (
//                   <div key={m.cr89e_crmwhatsappid}>
//                     {showDate && (
//                       <div className="flex justify-center my-4">
//                         <span className="text-[10px] font-black text-[#4A4E69]/40 uppercase tracking-[0.2em] bg-white px-4 py-1.5 rounded-full border border-[#4A4E69]/5 shadow-sm">
//                           {formatDate(d)}
//                         </span>
//                       </div>
//                     )}
//                     <div
//                       className={`flex ${isIn ? "justify-start" : "justify-end"}`}
//                     >
//                       <div className="max-w-[72%]">
//                         {!isIn && (
//                           <div className="flex justify-end mb-1">
//                             <span
//                               className={`text-[9px] font-black uppercase tracking-widest ${isFromBot ? "text-[#48CAE4]" : "text-[#9B5DE5]"}`}
//                             >
//                               {isFromBot
//                                 ? "🤖 Coneio Bot"
//                                 : `👤 ${senderName || "Agent"}`}
//                             </span>
//                           </div>
//                         )}
//                         <div
//                           className={`px-5 py-3 rounded-3xl text-base font-medium leading-relaxed
//                           ${
//                             isIn
//                               ? "bg-white rounded-tl-none border-2 border-[#4A4E69]/5 text-[#4A4E69]"
//                               : isFromBot
//                                 ? "bg-[#48CAE4] rounded-tr-none text-white shadow-lg shadow-[#48CAE4]/20"
//                                 : "bg-[#9B5DE5] rounded-tr-none text-white shadow-lg shadow-[#9B5DE5]/20"
//                           }`}
//                           style={
//                             isIn
//                               ? { boxShadow: "4px 4px 0px rgba(0,0,0,0.04)" }
//                               : undefined
//                           }
//                         >
//                           {m.cr89e_messagetext && (
//                             <p className="break-words whitespace-pre-wrap">
//                               {m.cr89e_messagetext}
//                             </p>
//                           )}
//                           {m.cr89e_fileurl && (
//                             <div
//                               className={`mt-2 flex items-center justify-between gap-4 p-3 rounded-2xl ${isIn ? "bg-[#F5F5DC]" : "bg-white/20"}`}
//                             >
//                               <div className="flex flex-col">
//                                 <span className="font-bold text-xs break-all">
//                                   {decodeURIComponent(
//                                     m.cr89e_fileurl
//                                       .split("/")
//                                       .pop()
//                                       ?.split("?")[0] || "File",
//                                   )}
//                                 </span>
//                                 <span className="text-xs opacity-60">
//                                   📎 Attachment
//                                 </span>
//                               </div>
//                               <a
//                                 href={m.cr89e_fileurl}
//                                 target="_blank"
//                                 download={m.cr89e_filename}
//                                 className={`text-xs px-3 py-1.5 rounded-xl font-black ${isIn ? "bg-[#FF8C42] text-white" : isFromBot ? "bg-white text-[#48CAE4]" : "bg-white text-[#9B5DE5]"}`}
//                               >
//                                 Download
//                               </a>
//                             </div>
//                           )}
//                         </div>
//                         <div
//                           className={`text-[10px] mt-1.5 font-bold text-[#4A4E69]/40 ${isIn ? "text-left pl-1" : "text-right pr-1"}`}
//                         >
//                           {formatTime(d)}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//               <div ref={messageEndRef} />
//             </div>

//             {/* File preview */}
//             {selectedFile && (
//               <div className="px-6 pb-2 bg-white flex-shrink-0">
//                 <div className="bg-[#F5F5DC] px-4 py-2.5 rounded-2xl flex justify-between items-center border-2 border-[#FF8C42]/20">
//                   <span className="text-sm font-bold text-[#4A4E69]">
//                     📎 {selectedFile.name}
//                   </span>
//                   <button
//                     onClick={() => setSelectedFile(null)}
//                     className="text-xs font-black text-red-400"
//                   >
//                     ✕ Remove
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Input area */}
//             <div className="p-5 bg-white border-t-2 border-[#FF8C42]/10 flex-shrink-0">
//               {!isAgentMode ? (
//                 <div className="flex items-center gap-3 bg-[#F5F5DC]/50 p-3 rounded-2xl border-2 border-dashed border-[#4A4E69]/10">
//                   <span className="text-base">🤖</span>
//                   <p className="text-xs font-black text-[#4A4E69]/50 flex-1">
//                     Bot is handling this conversation. Switch to{" "}
//                     <strong>Agent mode</strong> to type.
//                   </p>
//                   <button
//                     onClick={() => toggleAgentMode(true)}
//                     className="text-xs font-black bg-[#FF8C42] text-white px-4 py-2 rounded-xl hover:scale-105 transition shadow-md"
//                   >
//                     Take Over
//                   </button>
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-3 bg-[#F5F5DC]/50 p-2 rounded-3xl border-2 border-[#4A4E69]/5">
//                   <input
//                     ref={fileInputRef}
//                     type="file"
//                     hidden
//                     onChange={(e) => {
//                       const f = e.target.files?.[0];
//                       if (f) setSelectedFile(f);
//                     }}
//                   />
//                   <button
//                     onClick={() => fileInputRef.current?.click()}
//                     className="w-11 h-11 rounded-2xl bg-white text-[#FF8C42] flex items-center justify-center hover:scale-110 transition shadow-sm border-2 border-[#FF8C42]/10 font-black text-xl flex-shrink-0"
//                   >
//                     +
//                   </button>
//                   <input
//                     className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-[#4A4E69] placeholder-[#4A4E69]/30 py-3"
//                     placeholder="Type your reply as agent..."
//                     value={text}
//                     onChange={(e) => setText(e.target.value)}
//                     onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//                     autoFocus
//                   />
//                   <button
//                     onClick={sendMessage}
//                     className="w-11 h-11 rounded-2xl bg-[#FF8C42] text-white flex items-center justify-center hover:scale-110 transition shadow-lg shadow-[#FF8C42]/30 flex-shrink-0"
//                   >
//                     <svg
//                       className="w-5 h-5"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2.5}
//                         d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
//                       />
//                     </svg>
//                   </button>
//                 </div>
//               )}
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex flex-col items-center justify-center bg-[#F5F5DC]/40">
//             <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center shadow-xl border-2 border-[#FF8C42]/10 mb-6">
//               <span className="text-5xl">💬</span>
//             </div>
//             <h3 className="text-lg font-black text-[#4A4E69]/40">
//               Select a conversation
//             </h3>
//             <p className="text-sm font-medium mt-2 text-[#4A4E69]/25">
//               Pick a chat from the left to get started!
//             </p>
//             <div className="flex gap-2 mt-8 flex-wrap justify-center">
//               {[
//                 { name: "seaone.io", c: "bg-[#48CAE4]/10 text-[#48CAE4]" },
//                 { name: "dollarexim.com", c: "bg-[#FF8C42]/10 text-[#FF8C42]" },
//                 { name: "silkroutex.com", c: "bg-[#99D98C]/10 text-[#5a9e4e]" },
//                 { name: "coneio.com", c: "bg-[#9B5DE5]/10 text-[#9B5DE5]" },
//               ].map((p) => (
//                 <span
//                   key={p.name}
//                   className={`text-[11px] font-black px-3 py-1.5 rounded-full ${p.c}`}
//                 >
//                   {p.name}
//                 </span>
//               ))}
//             </div>
//           </div>
//         )}
//       </main>

//       {/* ── Right Panel ── */}
//       {selected && (
//         <aside className="w-72 flex flex-col gap-4 p-4 bg-[#F5F5DC]/60 border-l-2 border-[#FF8C42]/10 overflow-y-auto flex-shrink-0">
//           {/* Contact card */}
//           <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-[#FF8C42]/10 flex flex-col items-center text-center">
//             <div
//               className={`w-16 h-16 rounded-2xl ${getColor(selected.cr89e_name)} flex items-center justify-center text-white font-black text-xl shadow-lg mb-3`}
//             >
//               {getInitials(selected.cr89e_name)}
//             </div>
//             <h3 className="font-black text-[#4A4E69] text-base">
//               {selected.cr89e_name}
//             </h3>
//             <p className="text-xs text-[#4A4E69]/40 font-medium mt-1">
//               {selected.cr89e_phonenumber}
//             </p>
//             <div className="flex items-center gap-1.5 mt-2">
//               <span
//                 className={`w-2 h-2 rounded-full animate-pulse ${isAgentMode ? "bg-[#FF8C42]" : "bg-[#99D98C]"}`}
//               />
//               <span
//                 className={`text-[10px] font-black uppercase tracking-wider ${isAgentMode ? "text-[#FF8C42]" : "text-[#99D98C]"}`}
//               >
//                 {isResolved
//                   ? "✓ Resolved"
//                   : isAgentMode
//                     ? "Agent Handling"
//                     : "Bot Active"}
//               </span>
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-[#48CAE4]/10">
//             <h4 className="text-[10px] font-black text-[#4A4E69] uppercase tracking-widest mb-4">
//               Quick Insights
//             </h4>
//             <div className="space-y-3">
//               <div className="p-3.5 bg-[#48CAE4]/5 rounded-2xl border border-[#48CAE4]/10">
//                 <div className="flex justify-between items-center mb-1">
//                   <span className="text-[10px] font-black text-[#48CAE4] uppercase">
//                     Messages
//                   </span>
//                   <span>💬</span>
//                 </div>
//                 <p className="text-2xl font-black text-[#4A4E69]">
//                   {messages.length}
//                 </p>
//               </div>
//               <div className="p-3.5 bg-[#FF8C42]/5 rounded-2xl border border-[#FF8C42]/10">
//                 <div className="flex justify-between items-center mb-1">
//                   <span className="text-[10px] font-black text-[#FF8C42] uppercase">
//                     Handled By
//                   </span>
//                   <span>{isAgentMode ? "👤" : "🤖"}</span>
//                 </div>
//                 <p className="text-sm font-black text-[#4A4E69]">
//                   {isAgentMode ? "Agent" : "AI Bot"}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Tags */}
//           <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-[#9B5DE5]/10">
//             <div className="flex items-center justify-between mb-3">
//               <h4 className="text-[10px] font-black text-[#4A4E69] uppercase tracking-widest">
//                 Tags
//               </h4>
//               <div className="relative" ref={tagMenuRef}>
//                 <button
//                   onClick={() => setShowTagMenu((v) => !v)}
//                   className="text-[10px] font-black bg-[#9B5DE5]/10 text-[#9B5DE5] px-2.5 py-1.5 rounded-full hover:bg-[#9B5DE5]/20 transition"
//                 >
//                   + Add Tag
//                 </button>
//                 {showTagMenu && (
//                   <div className="absolute right-0 top-8 bg-white rounded-2xl shadow-xl border-2 border-[#4A4E69]/10 p-2 z-20 w-52">
//                     {TAG_OPTIONS.map((t) => {
//                       const isActive = currentTags.includes(t.id);

//                       return (
//                         <button
//                           key={t.id}
//                           onClick={() =>
//                             toggleTag(selected.cr89e_crmconversationid, t.id)
//                           }
//                           className="w-full flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-[#F5F5DC] transition"
//                         >
//                           {/* 👇 USE SAME COLOR STYLE */}
//                           <span
//                             className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${t.color}`}
//                           >
//                             {t.label}
//                           </span>

//                           {isActive && (
//                             <span className="text-[#99D98C] text-xs font-semibold">
//                               ✓
//                             </span>
//                           )}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {currentTags.length === 0 && (
//                 <p className="text-[10px] text-[#4A4E69]/30 font-bold">
//                   No tags yet. Click + Add Tag.
//                 </p>
//               )}
//               {currentTags.map((tid) => {
//                 const t = TAG_OPTIONS.find((x) => x.id === tid);
//                 return t ? (
//                   <button
//                     key={tid}
//                     onClick={() =>
//                       toggleTag(selected.cr89e_crmconversationid, tid)
//                     }
//                     className={`text-[11px] font-semibold px-3 py-1.5 rounded-full ${t.color} hover:opacity-80 transition`}
//                   >
//                     {t.label} ✕
//                   </button>
//                 ) : null;
//               })}
//             </div>
//           </div>

//           {/* Notes */}
//           <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-[#FF8C42]/10">
//             <h4 className="text-[10px] font-black text-[#4A4E69] uppercase tracking-widest mb-3">
//               Agent Notes
//             </h4>
//             <textarea
//               value={notes[selected.cr89e_crmconversationid] || ""}
//               onChange={(e) =>
//                 setNotes((prev) => ({
//                   ...prev,
//                   [selected.cr89e_crmconversationid]: e.target.value,
//                 }))
//               }
//               placeholder="Add private notes about this customer..."
//               rows={3}
//               className="w-full bg-[#F5F5DC]/50 border-2 border-[#4A4E69]/5 rounded-2xl p-3 text-xs font-medium text-[#4A4E69] placeholder-[#4A4E69]/30 outline-none focus:border-[#FF8C42]/30 resize-none transition"
//             />
//             <button
//               onClick={() => showToast("📝 Notes saved!")}
//               className="w-full mt-2 py-2 bg-[#F5F5DC] rounded-xl text-xs font-black text-[#4A4E69] hover:bg-[#FF8C42]/10 hover:text-[#FF8C42] transition"
//             >
//               Save Notes
//             </button>
//           </div>

//           {/* Actions */}
//           <div className="space-y-3">
//             {!isResolved ? (
//               <button
//                 onClick={() => setShowResolveConfirm(true)}
//                 className="w-full py-3.5 bg-[#4A4E69] text-white rounded-2xl text-xs font-black hover:opacity-90 transition shadow-lg shadow-[#4A4E69]/20"
//               >
//                 ✅ Mark as Resolved
//               </button>
//             ) : (
//               <button
//                 onClick={reopenConversation}
//                 className="w-full py-3.5 bg-[#99D98C] text-[#1a4a1a] rounded-2xl text-xs font-black hover:opacity-90 transition shadow-lg"
//               >
//                 🔄 Reopen Conversation
//               </button>
//             )}
//             <button
//               onClick={() => {
//                 toggleAgentMode(!isAgentMode);
//               }}
//               className={`w-full py-3.5 rounded-2xl text-xs font-black transition shadow-md ${isAgentMode ? "bg-[#48CAE4]/10 text-[#48CAE4] hover:bg-[#48CAE4]/20" : "bg-[#FF8C42]/10 text-[#FF8C42] hover:bg-[#FF8C42]/20"}`}
//             >
//               {isAgentMode ? "🤖 Hand Back to Bot" : "👤 Take Over as Agent"}
//             </button>
//           </div>
//         </aside>
//       )}

//       {profileOpen && (
//         <ProfileModal
//           user={user}
//           setUser={setUser}
//           onClose={() => setProfileOpen(false)}
//         />
//       )}
//     </div>
//   );
// }














"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import ProfileModal from "../components/ProfileModal";

// ─── Types ───────────────────────────────────────────────
type Conversation = {
  cr89e_crmconversationid: string;
  cr89e_name: string;
  cr89e_phonenumber: string;
};
type Message = {
  cr89e_crmwhatsappid: string;
  cr89e_messagetext: string;
  cr89e_fileurl?: string;
  cr89e_filename?: string;
  cr89e_direction: number;
  cr89e_timestamp: string;
  cr89e_sender?: string;
  cr89e_name?: string;
};
type Tag = { id: string; label: string; color: string };

const TAG_OPTIONS: Tag[] = [
  {
    id: "granite",
    label: "🪨 Granite",
    color: "bg-[#FF8C42]/10 text-[#FF8C42]",
  },
  {
    id: "freight",
    label: "🚢 Freight",
    color: "bg-[#48CAE4]/10 text-[#48CAE4]",
  },
  { id: "hsn", label: "📋 HSN", color: "bg-[#9B5DE5]/10 text-[#9B5DE5]" },
  {
    id: "partnership",
    label: "🤝 Partnership",
    color: "bg-[#99D98C]/10 text-[#5a9e4e]",
  },
  { id: "urgent", label: "🔥 Urgent", color: "bg-red-100 text-red-500" },
  {
    id: "followup",
    label: "📌 Follow Up",
    color: "bg-yellow-100 text-yellow-600",
  },
];

export default function ChatDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");

  // UI state for mobile panels - chat is always visible
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);

  // Per-conversation state stored as maps keyed by conversationId
  const [agentModes, setAgentModes] = useState<Record<string, boolean>>({});
  const [resolvedConvs, setResolvedConvs] = useState<Record<string, boolean>>(
    {},
  );
  const [convTags, setConvTags] = useState<Record<string, string[]>>({});
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "info" | "error";
  } | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const tagMenuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState({
    firstName: "Coneio",
    lastName: "Global",
    email: "admin@eximlink.com",
  });

  const showToast = (
    msg: string,
    type: "success" | "info" | "error" = "success",
  ) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetch("/api/conversations", { credentials: "include" })
      .then((r) => r.json())
      .then(setConversations);
  }, []);

  // Close tag menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        tagMenuRef.current &&
        !tagMenuRef.current.contains(e.target as Node)
      ) {
        setShowTagMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close panels when selecting a conversation on mobile
  const handleSelectConversation = async (conv: Conversation) => {
    setSelected(conv);
    setShowTagMenu(false);
    setShowResolveConfirm(false);
    setShowLeftPanel(false); // Auto-close left panel on mobile after selection
    
    const res = await fetch(
      `/api/messages?conversationId=${conv.cr89e_crmconversationid}`,
      { credentials: "include" },
    );
    const data = await res.json();
    setMessages(
      data.sort(
        (a: Message, b: Message) =>
          new Date(a.cr89e_timestamp).getTime() -
          new Date(b.cr89e_timestamp).getTime(),
      ),
    );

    // Sync agent mode from server
    const phone = conv.cr89e_phonenumber.replace(/\s+/g, "");
    const modeRes = await fetch(`/api/agent-mode?phone=${phone}`, {
      credentials: "include",
    });
    const modeData = await modeRes.json();
    setAgentModes((prev) => ({
      ...prev,
      [conv.cr89e_crmconversationid]: modeData.agentMode,
    }));
  };

  const toggleAgentMode = async (toAgent: boolean) => {
    if (!selected) return;
    const phone = selected.cr89e_phonenumber.replace(/\s+/g, "");
    await fetch("/api/agent-mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ phone, agentMode: toAgent }),
    });
    setAgentModes((prev) => ({
      ...prev,
      [selected.cr89e_crmconversationid]: toAgent,
    }));
    showToast(
      toAgent
        ? "🧑‍💼 Agent mode ON — you're in control. Bot is silent."
        : "🤖 Bot mode ON — AI is handling the chat.",
      "info",
    );
  };

  const sendMessage = async () => {
    if (!selected || (!text.trim() && !selectedFile)) return;
    const formData = new FormData();
    formData.append("to", selected.cr89e_phonenumber.replace(/\s+/g, ""));
    if (text.trim()) formData.append("message", text);
    if (selectedFile) formData.append("file", selectedFile);
    await fetch("/api/send-message", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    setText("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    loadMessages(selected);
    showToast("✅ Message sent!");
  };

  const loadMessages = async (conv: Conversation) => {
    setSelected(conv);
    setShowTagMenu(false);
    setShowResolveConfirm(false);
    
    const res = await fetch(
      `/api/messages?conversationId=${conv.cr89e_crmconversationid}`,
      { credentials: "include" },
    );
    const data = await res.json();
    setMessages(
      data.sort(
        (a: Message, b: Message) =>
          new Date(a.cr89e_timestamp).getTime() -
          new Date(b.cr89e_timestamp).getTime(),
      ),
    );

    // Sync agent mode from server
    const phone = conv.cr89e_phonenumber.replace(/\s+/g, "");
    const modeRes = await fetch(`/api/agent-mode?phone=${phone}`, {
      credentials: "include",
    });
    const modeData = await modeRes.json();
    setAgentModes((prev) => ({
      ...prev,
      [conv.cr89e_crmconversationid]: modeData.agentMode,
    }));
  };

  const toggleTag = (convId: string, tagId: string) => {
    setConvTags((prev) => {
      const current = prev[convId] || [];
      const updated = current.includes(tagId)
        ? current.filter((t) => t !== tagId)
        : [...current, tagId];
      showToast(current.includes(tagId) ? "🏷️ Tag removed" : "🏷️ Tag added!");
      return { ...prev, [convId]: updated };
    });
  };

  const resolveConversation = () => {
    if (!selected) return;
    setResolvedConvs((prev) => ({
      ...prev,
      [selected.cr89e_crmconversationid]: true,
    }));
    setShowResolveConfirm(false);
    showToast("✅ Conversation marked as resolved!");
  };

  const reopenConversation = () => {
    if (!selected) return;
    setResolvedConvs((prev) => ({
      ...prev,
      [selected.cr89e_crmconversationid]: false,
    }));
    showToast("🔄 Conversation reopened", "info");
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: Date) => {
    const today = new Date();
    const yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yest.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const initials =
    user.firstName[0].toUpperCase() + user.lastName[0].toUpperCase();
  const getInitials = (n: string) =>
    n
      ?.split(" ")
      .map((x) => x[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "??";
  const COLORS = [
    "bg-[#FF8C42]",
    "bg-[#48CAE4]",
    "bg-[#99D98C]",
    "bg-[#9B5DE5]",
    "bg-[#F72585]",
    "bg-[#4361EE]",
  ];
  const getColor = (n: string) =>
    COLORS[(n?.charCodeAt(0) || 0) % COLORS.length];

  const filteredConvs = conversations.filter(
    (c) =>
      c.cr89e_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.cr89e_phonenumber?.includes(search),
  );

  const isAgentMode = selected
    ? agentModes[selected.cr89e_crmconversationid] || false
    : false;
  const isResolved = selected
    ? resolvedConvs[selected.cr89e_crmconversationid] || false
    : false;
  const currentTags = selected
    ? convTags[selected.cr89e_crmconversationid] || []
    : [];

  return (
    <div className="flex h-screen bg-[#F5F5DC] font-sans overflow-hidden relative">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-2xl shadow-xl font-bold text-sm transition-all max-w-[90vw] sm:max-w-md
          ${toast.type === "success" ? "bg-[#99D98C] text-[#1a4a1a]" : toast.type === "error" ? "bg-red-400 text-white" : "bg-[#48CAE4] text-white"}`}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Resolve Confirm Modal ── */}
      {showResolveConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-[#4A4E69]/10 w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-black text-[#4A4E69] text-lg">
                Mark as Resolved?
              </h3>
              <p className="text-sm text-[#4A4E69]/50 font-medium mt-2">
                This will mark the conversation as completed. The chat history
                will be preserved.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResolveConfirm(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-[#4A4E69]/10 text-sm font-black text-[#4A4E69] hover:bg-[#F5F5DC] transition"
              >
                Cancel
              </button>
              <button
                onClick={resolveConversation}
                className="flex-1 py-3 rounded-2xl bg-[#4A4E69] text-white text-sm font-black hover:opacity-90 transition shadow-lg"
              >
                Resolve ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Left Panel Overlay (Mobile) ── */}
      {showLeftPanel && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setShowLeftPanel(false)}
        />
      )}

      {/* ── Right Panel Overlay (Mobile) ── */}
      {showRightPanel && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setShowRightPanel(false)}
        />
      )}

      {/* ── Left Nav (Always visible with highest z-index) ── */}
      <aside className="w-16 sm:w-16 flex flex-col items-center py-5 bg-white border-r-2 border-[#FF8C42]/10 shadow-sm z-50 flex-shrink-0 relative">
        <div className="w-10 h-10 rounded-2xl bg-[#FF8C42] flex items-center justify-center shadow-lg shadow-[#FF8C42]/30 mb-6">
          <img src="/coneio5.png" alt="Logo" className="w-9 h-9 object-contain" />
        </div>
        <div className="flex flex-col gap-4 flex-1 items-center pt-2">
          <Link
            href="/dashboard"
            title="Chats"
            className="w-10 h-10 rounded-2xl bg-[#48CAE4]/10 text-[#48CAE4] flex items-center justify-center hover:bg-[#48CAE4]/20 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.105-3.134 2-7 2s-7-.895-7-2m14 0V8c0-1.105-3.134-2-7-2S3 6.895 3 8v8m14 0c0 1.105-3.134 2-7 2s-7-.895-7-2"
              />
            </svg>
          </Link>
          <Link
            href="/analytics"
            title="Analytics"
            className="w-10 h-10 rounded-2xl bg-[#F5F5DC] text-[#4A4E69]/40 flex items-center justify-center hover:bg-[#FF8C42]/10 hover:text-[#FF8C42] transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </Link>
        </div>
        <div
          onClick={() => setProfileOpen(true)}
          className={`w-10 h-10 rounded-full ${getColor(user.firstName)} flex items-center justify-center text-white font-black text-xs cursor-pointer hover:scale-110 transition shadow-md`}
        >
          {initials}
        </div>
      </aside>

      {/* ── Left Panel (Conversations) - Slide in on mobile, always visible on desktop ── */}
      <section className={`
        fixed lg:relative inset-y-0 left-0 lg:left-0 w-80 bg-white border-r-2 border-[#FF8C42]/10 shadow-sm z-40
        transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${showLeftPanel ? 'translate-x-16' : '-translate-x-full lg:translate-x-0'}
        lg:ml-0
      `}>
        {/* Mobile header with close button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b-2 border-[#FF8C42]/5">
          <h2 className="text-sm font-black text-[#4A4E69]">Conversations</h2>
          <button
            onClick={() => setShowLeftPanel(false)}
            className="w-8 h-8 rounded-full bg-[#F5F5DC] flex items-center justify-center text-[#4A4E69]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Fixed Header Section */}
        <div className="flex-shrink-0">
          <div className="p-5 border-b-2 border-[#FF8C42]/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-sm font-black text-[#4A4E69]">
                  Conversations
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#99D98C] animate-pulse" />
                  <span className="text-[10px] font-black text-[#99D98C] uppercase tracking-widest">
                    Live
                  </span>
                </div>
              </div>
              <span className="bg-[#FF8C42]/10 text-[#FF8C42] font-black text-xs px-3 py-1.5 rounded-full">
                {conversations.length}
              </span>
            </div>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4E69]/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search chats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#F5F5DC]/70 border-2 border-[#4A4E69]/5 rounded-2xl text-xs font-medium text-[#4A4E69] placeholder-[#4A4E69]/30 outline-none focus:border-[#FF8C42]/30 transition"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Conversations List */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 min-h-0">
          {filteredConvs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-[#4A4E69]/30">
              <span className="text-3xl mb-2">💬</span>
              <p className="text-xs font-bold">No conversations yet</p>
            </div>
          )}
          {filteredConvs.map((c) => {
            const active =
              selected?.cr89e_crmconversationid === c.cr89e_crmconversationid;
            const isAgt = agentModes[c.cr89e_crmconversationid];
            const isRes = resolvedConvs[c.cr89e_crmconversationid];
            const tags = convTags[c.cr89e_crmconversationid] || [];
            return (
              <div
                key={c.cr89e_crmconversationid}
                onClick={() => handleSelectConversation(c)}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${active ? "bg-[#FF8C42]/10 border-2 border-[#FF8C42]/20" : "hover:bg-[#F5F5DC]/80 border-2 border-transparent"}`}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-11 h-11 rounded-2xl ${getColor(c.cr89e_name)} flex items-center justify-center text-white font-black text-sm shadow-md`}
                  >
                    {getInitials(c.cr89e_name)}
                  </div>
                  {isRes && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#99D98C] rounded-full flex items-center justify-center text-[8px]">
                      ✓
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-black truncate ${active ? "text-[#FF8C42]" : "text-[#4A4E69]"}`}
                  >
                    {c.cr89e_name}
                  </p>
                  <p className="text-[11px] text-[#4A4E69]/40 font-medium truncate mt-0.5">
                    {c.cr89e_phonenumber}
                  </p>
                  {tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {tags.slice(0, 2).map((tid) => {
                        const t = TAG_OPTIONS.find((x) => x.id === tid);
                        return t ? (
                          <span
                            key={tid}
                            className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${t.color}`}
                          >
                            {t.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <span
                  className={`text-[9px] font-black px-2 py-1 rounded-full flex-shrink-0 ${isAgt ? "bg-[#FF8C42]/10 text-[#FF8C42]" : "bg-[#48CAE4]/10 text-[#48CAE4]"}`}
                >
                  {isAgt ? "👤" : "🤖"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Fixed Footer with User Profile - Always at bottom */}
        <div className="flex-shrink-0 p-4 border-t-2 border-[#FF8C42]/5 bg-[#F5F5DC]/30">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl ${getColor(user.firstName)} flex items-center justify-center text-white font-black text-xs`}
            >
              {initials}
            </div>
            <div>
              <p className="text-xs font-black text-[#4A4E69]">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-[#4A4E69]/40 font-medium">
                Coneio Exim Pvt Ltd.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Chat (Always visible) ── */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Chat Header with mobile controls */}
        <header className="h-20 flex items-center justify-between px-3 sm:px-6 bg-white border-b-2 border-[#FF8C42]/10 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Mobile menu button - left panel */}
            <button
              onClick={() => setShowLeftPanel(true)}
              className="lg:hidden w-10 h-10 rounded-full bg-[#F5F5DC] flex items-center justify-center text-[#4A4E69] flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {selected ? (
              <>
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${getColor(selected.cr89e_name)} flex items-center justify-center text-white font-black text-sm shadow-lg flex-shrink-0`}
                >
                  {getInitials(selected.cr89e_name)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-[#4A4E69] truncate">
                      {selected.cr89e_name}
                    </h2>
                    {isResolved && (
                      <span className="text-[10px] font-black bg-[#99D98C]/20 text-[#5a9e4e] px-2 py-0.5 rounded-full hidden xs:inline">
                        ✓ Resolved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full animate-pulse ${isAgentMode ? "bg-[#FF8C42]" : "bg-[#99D98C]"}`}
                    />
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider hidden xs:inline ${isAgentMode ? "text-[#FF8C42]" : "text-[#99D98C]"}`}
                    >
                      {isAgentMode ? "Agent Mode" : "Bot Active"}
                    </span>
                    <span className="text-[#4A4E69]/30 text-[10px] font-bold truncate hidden sm:inline">
                      • {selected.cr89e_phonenumber}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center">
                <h2 className="text-sm font-black text-[#4A4E69]">Select a conversation</h2>
              </div>
            )}
          </div>

          {/* Right panel toggle for mobile - only show when conversation selected */}
          {selected && (
            <button
              onClick={() => setShowRightPanel(true)}
              className="lg:hidden w-10 h-10 rounded-full bg-[#F5F5DC] flex items-center justify-center text-[#4A4E69]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          )}

          {/* Desktop toggle */}
          {selected && (
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex bg-[#F5F5DC] p-1 rounded-2xl border-2 border-[#4A4E69]/5">
                <button
                  onClick={() => toggleAgentMode(false)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${!isAgentMode ? "bg-white shadow-sm text-[#48CAE4]" : "text-[#4A4E69]/30 hover:text-[#4A4E69]/60"}`}
                >
                  🤖 Bot
                </button>
                <button
                  onClick={() => toggleAgentMode(true)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${isAgentMode ? "bg-white shadow-sm text-[#FF8C42]" : "text-[#4A4E69]/30 hover:text-[#4A4E69]/60"}`}
                >
                  👤 Agent
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Agent mode banner */}
        {selected && isAgentMode && (
          <div className="bg-[#FF8C42]/10 border-b-2 border-[#FF8C42]/20 px-3 sm:px-6 py-2.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm flex-shrink-0">👤</span>
              <span className="text-xs font-black text-[#FF8C42] truncate">
                Agent mode active
              </span>
            </div>
            <button
              onClick={() => toggleAgentMode(false)}
              className="text-[10px] font-black text-[#FF8C42] hover:underline flex-shrink-0"
            >
              Hand back to bot
            </button>
          </div>
        )}

        {/* Resolved banner */}
        {selected && isResolved && (
          <div className="bg-[#99D98C]/10 border-b-2 border-[#99D98C]/20 px-3 sm:px-6 py-2.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm flex-shrink-0">✅</span>
              <span className="text-xs font-black text-[#5a9e4e] truncate">
                Resolved
              </span>
            </div>
            <button
              onClick={reopenConversation}
              className="text-[10px] font-black text-[#5a9e4e] hover:underline flex-shrink-0"
            >
              Reopen
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 bg-[#F5F5DC]/40">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center shadow-xl border-2 border-[#FF8C42]/10 mb-6">
                <span className="text-5xl">💬</span>
              </div>
              <h3 className="text-lg font-black text-[#4A4E69]/40 text-center">
                Select a conversation
              </h3>
              <p className="text-sm font-medium mt-2 text-[#4A4E69]/25 text-center">
                Pick a chat to start messaging!
              </p>
              <button
                onClick={() => setShowLeftPanel(true)}
                className="lg:hidden mt-8 bg-[#FF8C42] text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg"
              >
                View Conversations
              </button>
            </div>
          ) : (
            messages.map((m, i) => {
              const d = new Date(m.cr89e_timestamp);
              const prev =
                i > 0 ? new Date(messages[i - 1].cr89e_timestamp) : null;
              const showDate =
                !prev || d.toDateString() !== prev.toDateString();
              const isIn = m.cr89e_direction === 833680000;
              const senderName: string = m.cr89e_name || "";
              const isFromBot =
                !isIn && senderName.toLowerCase().includes("bot");

              return (
                <div key={m.cr89e_crmwhatsappid}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="text-[10px] font-black text-[#4A4E69]/40 uppercase tracking-[0.2em] bg-white px-4 py-1.5 rounded-full border border-[#4A4E69]/5 shadow-sm">
                        {formatDate(d)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex ${isIn ? "justify-start" : "justify-end"}`}
                  >
                    <div className="max-w-[85%] sm:max-w-[72%]">
                      {!isIn && (
                        <div className="flex justify-end mb-1">
                          <span
                            className={`text-[9px] font-black uppercase tracking-widest ${isFromBot ? "text-[#48CAE4]" : "text-[#9B5DE5]"}`}
                          >
                            {isFromBot
                              ? "🤖 Coneio Bot"
                              : `👤 ${senderName || "Agent"}`}
                          </span>
                        </div>
                      )}
                      <div
                        className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-3xl text-sm sm:text-base font-medium leading-relaxed
                        ${
                          isIn
                            ? "bg-white rounded-tl-none border-2 border-[#4A4E69]/5 text-[#4A4E69]"
                            : isFromBot
                              ? "bg-[#48CAE4] rounded-tr-none text-white shadow-lg shadow-[#48CAE4]/20"
                              : "bg-[#9B5DE5] rounded-tr-none text-white shadow-lg shadow-[#9B5DE5]/20"
                        }`}
                        style={
                          isIn
                            ? { boxShadow: "4px 4px 0px rgba(0,0,0,0.04)" }
                            : undefined
                        }
                      >
                        {m.cr89e_messagetext && (
                          <p className="break-words whitespace-pre-wrap">
                            {m.cr89e_messagetext}
                          </p>
                        )}
                        {m.cr89e_fileurl && (
                          <div
                            className={`mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2 sm:p-3 rounded-2xl ${isIn ? "bg-[#F5F5DC]" : "bg-white/20"}`}
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-xs break-all">
                                {decodeURIComponent(
                                  m.cr89e_fileurl
                                    .split("/")
                                    .pop()
                                    ?.split("?")[0] || "File",
                                )}
                              </span>
                              <span className="text-xs opacity-60">
                                📎 Attachment
                              </span>
                            </div>
                            <a
                              href={m.cr89e_fileurl}
                              target="_blank"
                              download={m.cr89e_filename}
                              className={`text-xs px-3 py-1.5 rounded-xl font-black whitespace-nowrap ${isIn ? "bg-[#FF8C42] text-white" : isFromBot ? "bg-white text-[#48CAE4]" : "bg-white text-[#9B5DE5]"}`}
                            >
                              Download
                            </a>
                          </div>
                        )}
                      </div>
                      <div
                        className={`text-[10px] mt-1.5 font-bold text-[#4A4E69]/40 ${isIn ? "text-left pl-1" : "text-right pr-1"}`}
                      >
                        {formatTime(d)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messageEndRef} />
        </div>

        {/* File preview */}
        {selected && selectedFile && (
          <div className="px-3 sm:px-6 pb-2 bg-white flex-shrink-0">
            <div className="bg-[#F5F5DC] px-4 py-2.5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-2 border-[#FF8C42]/20">
              <span className="text-sm font-bold text-[#4A4E69] break-all">
                📎 {selectedFile.name}
              </span>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-xs font-black text-red-400 self-end sm:self-auto"
              >
                ✕ Remove
              </button>
            </div>
          </div>
        )}

        {/* Input area */}
        {selected && (
          <div className="p-3 sm:p-5 bg-white border-t-2 border-[#FF8C42]/10 flex-shrink-0">
            {!isAgentMode ? (
              <div className="flex items-center gap-3 bg-[#F5F5DC]/50 p-3 rounded-2xl border-2 border-dashed border-[#4A4E69]/10">
                <span className="text-base flex-shrink-0">🤖</span>
                <p className="text-xs font-black text-[#4A4E69]/50 flex-1 min-w-0">
                  <span className="hidden xs:inline">Bot is handling this conversation.</span>
                  <span className="xs:hidden">Bot active</span>
                </p>
                <button
                  onClick={() => toggleAgentMode(true)}
                  className="text-xs font-black bg-[#FF8C42] text-white px-4 py-2 rounded-xl hover:scale-105 transition shadow-md whitespace-nowrap flex-shrink-0"
                >
                  Take Over
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3 bg-[#F5F5DC]/50 p-2 rounded-3xl border-2 border-[#4A4E69]/5">
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setSelectedFile(f);
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white text-[#FF8C42] flex items-center justify-center hover:scale-110 transition shadow-sm border-2 border-[#FF8C42]/10 font-black text-xl flex-shrink-0"
                >
                  +
                </button>
                <input
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-[#4A4E69] placeholder-[#4A4E69]/30 py-3 min-w-0"
                  placeholder="Type your reply..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  autoFocus
                />
                <button
                  onClick={sendMessage}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#FF8C42] text-white flex items-center justify-center hover:scale-110 transition shadow-lg shadow-[#FF8C42]/30 flex-shrink-0"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Right Panel (Details) - Slide in on mobile, always visible on desktop ── */}
      {selected && (
        <aside className={`
          fixed lg:relative inset-y-0 right-0 w-80 bg-[#F5F5DC]/60 border-l-2 border-[#FF8C42]/10 shadow-sm z-40
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${showRightPanel ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          {/* Mobile header with close button */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b-2 border-[#FF8C42]/5 bg-white sticky top-0 z-10">
            <h3 className="font-black text-[#4A4E69]">Conversation Details</h3>
            <button
              onClick={() => setShowRightPanel(false)}
              className="w-8 h-8 rounded-full bg-[#F5F5DC] flex items-center justify-center text-[#4A4E69]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Contact card */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-[#FF8C42]/10 flex flex-col items-center text-center">
              <div
                className={`w-16 h-16 rounded-2xl ${getColor(selected.cr89e_name)} flex items-center justify-center text-white font-black text-xl shadow-lg mb-3`}
              >
                {getInitials(selected.cr89e_name)}
              </div>
              <h3 className="font-black text-[#4A4E69] text-base break-all">
                {selected.cr89e_name}
              </h3>
              <p className="text-xs text-[#4A4E69]/40 font-medium mt-1 break-all">
                {selected.cr89e_phonenumber}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${isAgentMode ? "bg-[#FF8C42]" : "bg-[#99D98C]"}`}
                />
                <span
                  className={`text-[10px] font-black uppercase tracking-wider ${isAgentMode ? "text-[#FF8C42]" : "text-[#99D98C]"}`}
                >
                  {isResolved
                    ? "✓ Resolved"
                    : isAgentMode
                      ? "Agent Handling"
                      : "Bot Active"}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-[#48CAE4]/10">
              <h4 className="text-[10px] font-black text-[#4A4E69] uppercase tracking-widest mb-4">
                Quick Insights
              </h4>
              <div className="space-y-3">
                <div className="p-3.5 bg-[#48CAE4]/5 rounded-2xl border border-[#48CAE4]/10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-[#48CAE4] uppercase">
                      Messages
                    </span>
                    <span>💬</span>
                  </div>
                  <p className="text-2xl font-black text-[#4A4E69]">
                    {messages.length}
                  </p>
                </div>
                <div className="p-3.5 bg-[#FF8C42]/5 rounded-2xl border border-[#FF8C42]/10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-[#FF8C42] uppercase">
                      Handled By
                    </span>
                    <span>{isAgentMode ? "👤" : "🤖"}</span>
                  </div>
                  <p className="text-sm font-black text-[#4A4E69]">
                    {isAgentMode ? "Agent" : "AI Bot"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-[#9B5DE5]/10">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-black text-[#4A4E69] uppercase tracking-widest">
                  Tags
                </h4>
                <div className="relative" ref={tagMenuRef}>
                  <button
                    onClick={() => setShowTagMenu((v) => !v)}
                    className="text-[10px] font-black bg-[#9B5DE5]/10 text-[#9B5DE5] px-2.5 py-1.5 rounded-full hover:bg-[#9B5DE5]/20 transition"
                  >
                    + Add Tag
                  </button>
                  {showTagMenu && (
                    <div className="absolute right-0 top-8 bg-white rounded-2xl shadow-xl border-2 border-[#4A4E69]/10 p-2 z-20 w-52">
                      {TAG_OPTIONS.map((t) => {
                        const isActive = currentTags.includes(t.id);

                        return (
                          <button
                            key={t.id}
                            onClick={() =>
                              toggleTag(selected.cr89e_crmconversationid, t.id)
                            }
                            className="w-full flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-[#F5F5DC] transition"
                          >
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${t.color}`}
                            >
                              {t.label}
                            </span>

                            {isActive && (
                              <span className="text-[#99D98C] text-xs font-semibold">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentTags.length === 0 && (
                  <p className="text-[10px] text-[#4A4E69]/30 font-bold">
                    No tags yet. Click + Add Tag.
                  </p>
                )}
                {currentTags.map((tid) => {
                  const t = TAG_OPTIONS.find((x) => x.id === tid);
                  return t ? (
                    <button
                      key={tid}
                      onClick={() =>
                        toggleTag(selected.cr89e_crmconversationid, tid)
                      }
                      className={`text-[11px] font-semibold px-3 py-1.5 rounded-full ${t.color} hover:opacity-80 transition`}
                    >
                      {t.label} ✕
                    </button>
                  ) : null;
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-[#FF8C42]/10">
              <h4 className="text-[10px] font-black text-[#4A4E69] uppercase tracking-widest mb-3">
                Agent Notes
              </h4>
              <textarea
                value={notes[selected.cr89e_crmconversationid] || ""}
                onChange={(e) =>
                  setNotes((prev) => ({
                    ...prev,
                    [selected.cr89e_crmconversationid]: e.target.value,
                  }))
                }
                placeholder="Add private notes about this customer..."
                rows={3}
                className="w-full bg-[#F5F5DC]/50 border-2 border-[#4A4E69]/5 rounded-2xl p-3 text-xs font-medium text-[#4A4E69] placeholder-[#4A4E69]/30 outline-none focus:border-[#FF8C42]/30 resize-none transition"
              />
              <button
                onClick={() => showToast("📝 Notes saved!")}
                className="w-full mt-2 py-2 bg-[#F5F5DC] rounded-xl text-xs font-black text-[#4A4E69] hover:bg-[#FF8C42]/10 hover:text-[#FF8C42] transition"
              >
                Save Notes
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-3 pb-4">
              {!isResolved ? (
                <button
                  onClick={() => setShowResolveConfirm(true)}
                  className="w-full py-3.5 bg-[#4A4E69] text-white rounded-2xl text-xs font-black hover:opacity-90 transition shadow-lg shadow-[#4A4E69]/20"
                >
                  ✅ Mark as Resolved
                </button>
              ) : (
                <button
                  onClick={reopenConversation}
                  className="w-full py-3.5 bg-[#99D98C] text-[#1a4a1a] rounded-2xl text-xs font-black hover:opacity-90 transition shadow-lg"
                >
                  🔄 Reopen Conversation
                </button>
              )}
              <button
                onClick={() => {
                  toggleAgentMode(!isAgentMode);
                }}
                className={`w-full py-3.5 rounded-2xl text-xs font-black transition shadow-md ${isAgentMode ? "bg-[#48CAE4]/10 text-[#48CAE4] hover:bg-[#48CAE4]/20" : "bg-[#FF8C42]/10 text-[#FF8C42] hover:bg-[#FF8C42]/20"}`}
              >
                {isAgentMode ? "🤖 Hand Back to Bot" : "👤 Take Over as Agent"}
              </button>
            </div>
          </div>
        </aside>
      )}

      {profileOpen && (
        <ProfileModal
          user={user}
          setUser={setUser}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}