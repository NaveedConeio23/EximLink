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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#12251d] border border-[#1f2f28] w-full max-w-md rounded-2xl p-8 shadow-2xl relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#6ee7a0] text-black flex items-center justify-center text-2xl font-bold shadow-lg">
            {initials}
          </div>

          <p className="mt-3 text-sm text-gray-400">
            Profile Information
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            className="w-full bg-[#1c3b25] px-4 py-3 rounded-lg outline-none text-sm"
          />

          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            className="w-full bg-[#1c3b25] px-4 py-3 rounded-lg outline-none text-sm"
          />

          <input
            value={user.email}
            disabled
            className="w-full bg-[#0f1e17] px-4 py-3 rounded-lg outline-none text-sm text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-3">

          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full bg-[#6ee7a0] text-black py-3 rounded-lg font-semibold hover:scale-[1.02] transition"
          >
            Save Changes
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/20 border border-red-500/40 text-red-400 py-3 rounded-lg font-semibold hover:bg-red-500/30 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
