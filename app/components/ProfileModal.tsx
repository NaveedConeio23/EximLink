"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  user: any;
  setUser: any;
  onClose: () => void;
}

export default function ProfileModal({
  user,
  setUser,
  onClose,
}: Props) {
  const router = useRouter();

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);

  const initials =
    firstName.charAt(0).toUpperCase() +
    lastName.charAt(0).toUpperCase();

  const handleSave = () => {
    setUser({
      ...user,
      firstName,
      lastName,
    });

    onClose();
  };

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    router.push("/login");
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border-2 border-[#9B5DE5]/10 relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#4A4E69]/40 hover:text-[#9B5DE5] transition"
        >
          ✕
        </button>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-[#9B5DE5] text-white flex items-center justify-center text-xl font-semibold shadow-lg shadow-[#9B5DE5]/30">
            {initials}
          </div>

          <p className="mt-4 text-xs font-semibold text-[#4A4E69]/50 uppercase tracking-wider">
            Profile Information
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            className="w-full bg-[#F5F5DC]/50 border-2 border-[#4A4E69]/5 px-4 py-3 rounded-2xl outline-none text-sm font-medium text-[#4A4E69] placeholder-[#4A4E69]/30 focus:border-[#9B5DE5]/30 transition"
          />

          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            className="w-full bg-[#F5F5DC]/50 border-2 border-[#4A4E69]/5 px-4 py-3 rounded-2xl outline-none text-sm font-medium text-[#4A4E69] placeholder-[#4A4E69]/30 focus:border-[#9B5DE5]/30 transition"
          />

          <input
            value={user.email}
            disabled
            className="w-full bg-[#F5F5DC]/30 border-2 border-[#4A4E69]/5 px-4 py-3 rounded-2xl outline-none text-sm text-[#4A4E69]/40 cursor-not-allowed"
          />
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-3">

          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full bg-[#9B5DE5] text-white py-3 rounded-2xl text-sm font-semibold hover:scale-[1.02] transition shadow-lg shadow-[#9B5DE5]/30"
          >
            Save Changes
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-100 text-red-600 py-3 rounded-2xl text-sm font-semibold hover:bg-red-200 transition border border-red-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}