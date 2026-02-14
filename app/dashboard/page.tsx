"use client";

import { useEffect, useRef, useState } from "react";
import ProfileModal from "../components/ProfileModal";

export default function ChatDashboard() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState({
    firstName: "Coneio",
    lastName: "Exim",
    email: "admin@eximlink.com",
  });

  // ================= AUTO SCROLL =================
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ================= LOAD CONVERSATIONS =================
  useEffect(() => {
    fetch("/api/conversations", { credentials: "include" })
      .then((res) => res.json())
      .then(setConversations);
  }, []);

  // ================= LOAD MESSAGES =================
  const loadMessages = async (conversation: any) => {
    setSelected(conversation);

    const res = await fetch(
      `/api/messages?conversationId=${conversation.cr89e_crmconversationid}`,
      { credentials: "include" },
    );

    const data = await res.json();

    const sorted = data.sort(
      (a: any, b: any) =>
        new Date(a.cr89e_timestamp).getTime() -
        new Date(b.cr89e_timestamp).getTime(),
    );

    setMessages(sorted);
  };

  // ================= SEND MESSAGE =================
  const sendMessage = async () => {
    if (!selected || (!text.trim() && !selectedFile)) return;

    const formData = new FormData();
    formData.append("to", selected.cr89e_phonenumber.replace(/\s+/g, ""));

    if (text.trim()) {
      formData.append("message", text);
    }

    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    await fetch("/api/send-message", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    setText("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    loadMessages(selected);
  };

  // ================= FORMAT DATE =================
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB");
  };

  const initials =
    user.firstName.charAt(0).toUpperCase() +
    user.lastName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-[#0f1e17] text-white">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-16 flex flex-col items-center py-6 bg-gradient-to-b from-[#163328] via-[#102216] to-[#0b1712] border-r border-[#1f2f28]">
        <div className="mb-2">
          <img src="/coneio2.png" className="w-12 h-12 object-contain" />
        </div>

        <div className="flex-1 flex flex-col justify-center gap-6 text-[#21c766] font-extrabold text-lg tracking-widest items-center">
          {"EXIMLINK".split("").map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>

        <div
          onClick={() => setProfileOpen(true)}
          className="mt-auto cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-[#6ee7a0] text-black flex items-center justify-center font-bold hover:scale-110 transition">
            {initials}
          </div>
        </div>
      </aside>

      {/* ================= CONVERSATION LIST ================= */}
      <section className="w-[340px] bg-[#12251d] border-r border-[#1f2f28] flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Chats</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
          {conversations.map((c) => (
            <div
              key={c.cr89e_crmconversationid}
              onClick={() => loadMessages(c)}
              className={`p-4 rounded-xl cursor-pointer transition ${
                selected?.cr89e_crmconversationid === c.cr89e_crmconversationid
                  ? "bg-[#1c3b25] border-l-4 border-[#6ee7a0]"
                  : "hover:bg-[#182e24]"
              }`}
            >
              <div className="font-medium">{c.cr89e_name}</div>
              <div className="text-xs text-gray-400">{c.cr89e_phonenumber}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= MAIN CHAT ================= */}
      <main className="flex-1 flex flex-col bg-[#0f1e17]">
        {selected ? (
          <>
            {/* HEADER */}
            <header className="h-20 flex items-center px-8 border-b border-[#1f2f28] bg-[#12251d]/60 backdrop-blur-md">
              <div>
                <div className="font-semibold text-lg">
                  {selected.cr89e_name}
                </div>
                <div className="text-xs text-gray-400">
                  {selected.cr89e_phonenumber}
                </div>
              </div>
            </header>

            {/* ================= MESSAGES ================= */}
            <div className="flex-1 overflow-y-auto p-8 space-y-4 flex flex-col">
              {messages.map((m, index) => {
                const currentDate = new Date(m.cr89e_timestamp);
                const previousDate =
                  index > 0
                    ? new Date(messages[index - 1].cr89e_timestamp)
                    : null;

                const showDate =
                  !previousDate ||
                  currentDate.toDateString() !== previousDate.toDateString();

                const isIncoming = m.cr89e_direction === 833680000;

                return (
                  <div key={m.cr89e_crmwhatsappid}>
                    {showDate && (
                      <div className="flex justify-center my-6">
                        <span className="px-4 py-1 text-xs bg-[#1c3b25] text-gray-300 rounded-full border border-[#244635]">
                          {formatDate(currentDate)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex ${
                        isIncoming ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm shadow
                        ${
                          isIncoming
                            ? "bg-[#1c3b25] rounded-bl-none"
                            : "bg-[#6ee7a0] text-black rounded-br-none"
                        }
                          max-w-[70%] w-fit`}
                      >
                        {/* TEXT MESSAGE */}
                        {m.cr89e_messagetext && (
                          <p className="break-words whitespace-pre-wrap">
                            {m.cr89e_messagetext}
                          </p>
                        )}

                        {/* FILE MESSAGE */}
                        {m.cr89e_fileurl && (
                          <div className="mt-2">
                            <div
                              className={`flex items-center justify-between gap-4 p-3 rounded-xl ${
                                isIncoming
                                  ? "bg-[#244635]"
                                  : "bg-white text-black"
                              }`}
                            >
                              {/* File Info */}
                              <div className="flex flex-col">
                                <span className="font-medium text-sm break-all">
                                  {decodeURIComponent(
                                    m.cr89e_fileurl
                                      .split("/")
                                      .pop()
                                      ?.split("?")[0] || "File",
                                  )}
                                </span>
                                <span className="text-xs opacity-70">
                                  File Attachment
                                </span>
                              </div>

                              {/* Download Button */}
                              <a
                                href={m.cr89e_fileurl}
                                target="_blank"
                                download={m.cr89e_filename}
                                className={`text-xs px-3 py-1 rounded-md font-medium transition ${
                                  isIncoming
                                    ? "bg-[#6ee7a0] text-black hover:opacity-90"
                                    : "bg-[#1c3b25] text-white hover:opacity-90"
                                }`}
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className={`text-[11px] mt-1 text-gray-400 ${
                        isIncoming ? "text-left" : "text-right"
                      }`}
                    >
                      {currentDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                );
              })}

              <div ref={messageEndRef} />
            </div>

            {/* ================= FILE PREVIEW ================= */}
            {selectedFile && (
              <div className="px-8 pb-2">
                <div className="bg-[#1c3b25] px-4 py-2 rounded-lg flex justify-between items-center text-sm">
                  <span>📎 {selectedFile.name}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-400 text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* ================= INPUT ================= */}
            <div className="p-6 border-t border-[#1f2f28] bg-[#12251d]">
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-12 h-12 bg-[#1c3b25] text-[#6ee7a0] rounded-xl flex items-center justify-center hover:scale-105 transition"
                >
                  +
                </button>

                <input
                  className="flex-1 bg-[#1c3b25] px-6 py-3 rounded-xl outline-none text-sm"
                  placeholder="Type a message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />

                <button
                  onClick={sendMessage}
                  className="w-12 h-12 bg-[#6ee7a0] text-black rounded-xl flex items-center justify-center hover:scale-105 transition"
                >
                  ➤
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation
          </div>
        )}
      </main>

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
