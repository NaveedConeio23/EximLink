"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AnalyticsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [user] = useState({ firstName: "Coneio", lastName: "Global" });
  const initials = user.firstName[0] + user.lastName[0];
  const COLORS = ["bg-[#FF8C42]", "bg-[#48CAE4]", "bg-[#99D98C]", "bg-[#9B5DE5]", "bg-[#F72585]", "bg-[#4361EE]"];
  const getColor = (n: string) => COLORS[(n?.charCodeAt(0) || 0) % COLORS.length];

  useEffect(() => {
    fetch("/api/conversations", { credentials: "include" })
      .then((r) => r.json())
      .then(async (convs) => {
        setConversations(convs);
        // Load messages for first 10 conversations
        const allMsgs: any[] = [];
        for (const c of convs.slice(0, 10)) {
          const res = await fetch(`/api/messages?conversationId=${c.cr89e_crmconversationid}`, { credentials: "include" });
          const data = await res.json();
          allMsgs.push(...data);
        }
        setMessages(allMsgs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalConvs = conversations.length;
  const totalMsgs = messages.length;
  const incoming = messages.filter((m) => m.cr89e_direction === 833680000).length;
  const outgoing = messages.filter((m) => m.cr89e_direction === 833680001).length;
  // Bot messages are stored with sender name containing "bot" in cr89e_name
  const botMsgs = messages.filter((m) => m.cr89e_direction === 833680001 && (m.cr89e_name || "").toLowerCase().includes("bot")).length;
  const agentMsgs = outgoing - botMsgs;

  // Messages by day (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
  });
  const msgsByDay = last7.map((label, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const count = messages.filter((m) => new Date(m.cr89e_timestamp).toDateString() === d.toDateString()).length;
    return { label, count };
  });
  const maxDay = Math.max(...msgsByDay.map((d) => d.count), 1);

  // Top contacts — incoming messages grouped by sender name (cr89e_name)
  const contactCounts: Record<string, { name: string; count: number }> = {};
  messages.forEach((m) => {
    if (m.cr89e_direction === 833680000) {
      const name = (m.cr89e_name || "Unknown").trim();
      if (!contactCounts[name]) contactCounts[name] = { name, count: 0 };
      contactCounts[name].count++;
    }
  });
  const topContacts = Object.values(contactCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="flex h-screen bg-[#F5F5DC] font-sans overflow-hidden">

      {/* ── Left Nav ── */}
      <aside className="w-16 flex flex-col items-center py-5 bg-white border-r-2 border-[#FF8C42]/10 shadow-sm z-10">
        <div className="w-10 h-10 rounded-2xl bg-[#FF8C42] flex items-center justify-center shadow-lg shadow-[#FF8C42]/30 mb-6">
          <span className="text-white font-black text-base">C</span>
        </div>
        <div className="flex flex-col gap-4 flex-1 items-center pt-2">
          <Link href="/dashboard" title="Chats"
            className="w-10 h-10 rounded-2xl bg-[#F5F5DC] text-[#4A4E69]/40 flex items-center justify-center hover:bg-[#48CAE4]/10 hover:text-[#48CAE4] transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.105-3.134 2-7 2s-7-.895-7-2m14 0V8c0-1.105-3.134-2-7-2S3 6.895 3 8v8m14 0c0 1.105-3.134 2-7 2s-7-.895-7-2" /></svg>
          </Link>
          <Link href="/analytics" title="Analytics"
            className="w-10 h-10 rounded-2xl bg-[#FF8C42]/10 text-[#FF8C42] flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </Link>
        </div>
        <div className={`w-10 h-10 rounded-full ${getColor(user.firstName)} flex items-center justify-center text-white font-black text-xs shadow-md`}>
          {initials}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-black text-[#4A4E69]">Analytics</h1>
          <p className="text-xs text-[#4A4E69]/50 font-medium mt-0.5">Overview of your WhatsApp CRM performance</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FF8C42]/10 flex items-center justify-center animate-pulse">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-xs font-bold text-[#4A4E69]/40">Loading analytics...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">

            {/* Stat Cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Conversations", value: totalConvs, icon: "💬", color: "border-[#48CAE4]/20 bg-[#48CAE4]/5", textColor: "text-[#48CAE4]" },
                { label: "Total Messages", value: totalMsgs, icon: "📨", color: "border-[#FF8C42]/20 bg-[#FF8C42]/5", textColor: "text-[#FF8C42]" },
                { label: "Bot Replies", value: botMsgs, icon: "🤖", color: "border-[#9B5DE5]/20 bg-[#9B5DE5]/5", textColor: "text-[#9B5DE5]" },
                { label: "Agent Replies", value: agentMsgs, icon: "👤", color: "border-[#99D98C]/20 bg-[#99D98C]/5", textColor: "text-[#5a9e4e]" },
              ].map((s) => (
                <div key={s.label} className={`bg-white rounded-3xl p-5 border-2 shadow-sm ${s.color}`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{s.icon}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${s.textColor}`}>This Month</span>
                  </div>
                  <p className={`text-3xl font-black ${s.textColor}`}>{s.value}</p>
                  <p className="text-xs font-bold text-[#4A4E69]/50 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Bar Chart - Messages by Day */}
              <div className="col-span-2 bg-white rounded-3xl p-5 border-2 border-[#4A4E69]/5 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-black text-[#4A4E69]">Messages This Week</h3>
                    <p className="text-[10px] text-[#4A4E69]/40 font-medium mt-0.5">Daily message volume</p>
                  </div>
                  <span className="text-[10px] font-black bg-[#FF8C42]/10 text-[#FF8C42] px-3 py-1.5 rounded-full">Last 7 days</span>
                </div>
                <div className="flex items-end gap-3 h-36">
                  {msgsByDay.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black text-[#4A4E69]/50">{d.count > 0 ? d.count : ""}</span>
                      <div className="w-full rounded-t-xl transition-all" style={{
                        height: `${Math.max((d.count / maxDay) * 120, d.count > 0 ? 8 : 4)}px`,
                        background: d.count > 0 ? "linear-gradient(to top, #FF8C42, #ffb380)" : "#F5F5DC"
                      }} />
                      <span className="text-[9px] font-bold text-[#4A4E69]/40 text-center leading-tight">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Donut - Incoming vs Outgoing */}
              <div className="bg-white rounded-3xl p-5 border-2 border-[#4A4E69]/5 shadow-sm">
                <h3 className="text-sm font-black text-[#4A4E69] mb-1">Message Direction</h3>
                <p className="text-[10px] text-[#4A4E69]/40 font-medium mb-5">Incoming vs Outgoing</p>
                <div className="flex flex-col items-center">
                  {/* Simple visual donut */}
                  <div className="relative w-28 h-28 mb-4">
                    <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F5F5DC" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#48CAE4" strokeWidth="3"
                        strokeDasharray={`${totalMsgs > 0 ? (incoming / totalMsgs) * 100 : 50} 100`} strokeLinecap="round" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#FF8C42" strokeWidth="3"
                        strokeDasharray={`${totalMsgs > 0 ? (outgoing / totalMsgs) * 100 : 50} 100`}
                        strokeDashoffset={`${-(totalMsgs > 0 ? (incoming / totalMsgs) * 100 : 50)}`}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-black text-[#4A4E69]">{totalMsgs}</span>
                      <span className="text-[8px] font-bold text-[#4A4E69]/40">total</span>
                    </div>
                  </div>
                  <div className="space-y-2 w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#48CAE4]" />
                        <span className="text-[10px] font-bold text-[#4A4E69]/60">Incoming</span>
                      </div>
                      <span className="text-[10px] font-black text-[#4A4E69]">{incoming}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF8C42]" />
                        <span className="text-[10px] font-bold text-[#4A4E69]/60">Outgoing</span>
                      </div>
                      <span className="text-[10px] font-black text-[#4A4E69]">{outgoing}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Top Contacts */}
              <div className="col-span-2 bg-white rounded-3xl p-5 border-2 border-[#4A4E69]/5 shadow-sm">
                <h3 className="text-sm font-black text-[#4A4E69] mb-1">Most Active Contacts</h3>
                <p className="text-[10px] text-[#4A4E69]/40 font-medium mb-4">Ranked by messages sent</p>
                {topContacts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-24 text-[#4A4E69]/30">
                    <span className="text-2xl mb-1">👥</span>
                    <p className="text-xs font-bold">No data yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topContacts.map((c, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-black text-[#4A4E69]/30 w-4">{i + 1}</span>
                        <div className={`w-8 h-8 rounded-xl ${getColor(c.name)} flex items-center justify-center text-white font-black text-xs flex-shrink-0`}>
                          {c.name[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-[#4A4E69] truncate">{c.name}</p>
                          <div className="w-full bg-[#F5F5DC] rounded-full h-1.5 mt-1">
                            <div className="h-1.5 rounded-full bg-[#FF8C42]" style={{ width: `${(c.count / (topContacts[0]?.count || 1)) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-xs font-black text-[#4A4E69]/50">{c.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bot vs Agent breakdown */}
              <div className="bg-white rounded-3xl p-5 border-2 border-[#4A4E69]/5 shadow-sm">
                <h3 className="text-sm font-black text-[#4A4E69] mb-1">Response Breakdown</h3>
                <p className="text-[10px] text-[#4A4E69]/40 font-medium mb-4">Bot vs Agent replies</p>
                <div className="space-y-4">
                  {[
                    { label: "🤖 Bot", value: botMsgs, total: outgoing, color: "#48CAE4" },
                    { label: "👤 Agent", value: agentMsgs, total: outgoing, color: "#FF8C42" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#4A4E69]/70">{item.label}</span>
                        <span className="text-xs font-black text-[#4A4E69]">{item.value} <span className="text-[#4A4E69]/40 font-medium">({item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}%)</span></span>
                      </div>
                      <div className="w-full bg-[#F5F5DC] rounded-full h-2.5">
                        <div className="h-2.5 rounded-full transition-all" style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t-2 border-[#4A4E69]/5">
                    <div className="p-3 bg-[#99D98C]/5 rounded-2xl border border-[#99D98C]/20 text-center">
                      <p className="text-[10px] font-bold text-[#5a9e4e]">Bot Automation Rate</p>
                      <p className="text-2xl font-black text-[#5a9e4e]">{outgoing > 0 ? Math.round((botMsgs / outgoing) * 100) : 0}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform coverage */}
            <div className="bg-white rounded-3xl p-5 border-2 border-[#4A4E69]/5 shadow-sm">
              <h3 className="text-sm font-black text-[#4A4E69] mb-1">Platform Coverage</h3>
              <p className="text-[10px] text-[#4A4E69]/40 font-medium mb-4">SeaOne Global Trade Ecosystem</p>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { name: "coneio.com", label: "Corporate", icon: "🟢", color: "bg-[#99D98C]/10 border-[#99D98C]/20 text-[#5a9e4e]" },
                  { name: "seaone.io", label: "Freight Engine", icon: "🔵", color: "bg-[#48CAE4]/10 border-[#48CAE4]/20 text-[#48CAE4]" },
                  { name: "seaonedigital.com", label: "Partner Network", icon: "🟣", color: "bg-[#9B5DE5]/10 border-[#9B5DE5]/20 text-[#9B5DE5]" },
                  { name: "dollarexim.com", label: "Granite Trade", icon: "🟠", color: "bg-[#FF8C42]/10 border-[#FF8C42]/20 text-[#FF8C42]" },
                  { name: "silkroutex.com", label: "HSN & Compliance", icon: "🟡", color: "bg-yellow-50 border-yellow-200 text-yellow-600" },
                ].map((p) => (
                  <div key={p.name} className={`rounded-2xl p-4 border-2 ${p.color} text-center`}>
                    <div className="text-2xl mb-2">{p.icon}</div>
                    <p className="text-[10px] font-black">{p.name}</p>
                    <p className="text-[9px] font-medium opacity-60 mt-0.5">{p.label}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}