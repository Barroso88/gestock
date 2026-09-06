"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";

export function UserHeaderBadge() {
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const displayName = currentUser?.name || "André Barroso";
  const userInitials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Link
      href="/profile"
      className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-[#241b2c] border border-transparent hover:border-[#3d2c49] transition-all group cursor-pointer shrink-0"
      title={`Perfil & Administração (${displayName})`}
    >
      {currentUser?.image ? (
        <img
          src={currentUser.image}
          alt={displayName}
          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1.5 ring-[#f59e0b]/40 group-hover:ring-[#f59e0b] transition-all"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f59e0b] to-[#fbbf24] text-[#151016] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ring-1 ring-amber-400/50">
          {userInitials || <User className="w-4 h-4" />}
        </div>
      )}
      <span className="hidden sm:inline text-sm font-semibold text-[#f3f0f5] group-hover:text-[#f59e0b] transition-colors max-w-[130px] truncate leading-tight">
        {displayName}
      </span>
    </Link>
  );
}
