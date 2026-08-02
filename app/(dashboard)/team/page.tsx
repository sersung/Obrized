"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, Plus, Phone, Mail, Wrench, Star,
  Trash2, Edit2, DollarSign, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  speciality: string;
  hourly_rate: number;
  status: "active" | "inactive";
}

const ROLE_COLORS: Record<string, string> = {
  owner:       "bg-purple-50 text-purple-700",
  supervisor:  "bg-blue-50 text-blue-700",
  technician:  "bg-emerald-50 text-emerald-700",
  apprentice:  "bg-amber-50 text-amber-700",
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((d) => { setMembers(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { toast.error("Failed to load team"); setLoading(false); });
  }, []);

  async function toggleStatus(member: TeamMember) {
    const newStatus = member.status === "active" ? "inactive" : "active";
    const res = await fetch("/api/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: member.id, status: newStatus }),
    });
    if (res.ok) {
      setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, status: newStatus } : m));
      toast.success(`${member.name} is now ${newStatus}`);
    }
  }

  async function deleteMember(id: string, name: string) {
    if (!confirm(`Remove ${name} from the team?`)) return;
    const res = await fetch("/api/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Team member removed");
    }
  }

  const active = members.filter((m) => m.status === "active");
  const roles = [...new Set(members.map((m) => m.role))];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your crew and assign jobs</p>
        </div>
        <Link
          href="/team/new"
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Member
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{loading ? "—" : members.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">{loading ? "—" : active.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Active</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-2xl font-bold text-brand-600">{loading ? "—" : roles.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Roles</p>
        </div>
      </div>

      {/* Team list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-20" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">No team members yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first crew member to start assigning jobs</p>
          <Link
            href="/team/new"
            className="inline-flex items-center gap-2 mt-4 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Member
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 sm:gap-4 p-4 hover:bg-gray-50/60 group transition-colors">
                {/* Avatar */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0",
                  member.status === "active" ? "bg-brand-600/10 text-brand-700" : "bg-gray-100 text-gray-400"
                )}>
                  {member.name.slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", ROLE_COLORS[member.role] ?? "bg-gray-100 text-gray-600")}>
                      {member.role}
                    </span>
                    {member.status === "inactive" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium">Inactive</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    {member.speciality && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Wrench className="w-3 h-3" /> {member.speciality}
                      </span>
                    )}
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="hidden sm:flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600">
                        <Mail className="w-3 h-3" /> {member.email}
                      </a>
                    )}
                    {member.phone && (
                      <a href={`tel:${member.phone}`} className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600">
                        <Phone className="w-3 h-3" /> {member.phone}
                      </a>
                    )}
                    {member.hourly_rate > 0 && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-gray-600">
                        <DollarSign className="w-3 h-3" /> ${member.hourly_rate}/hr
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleStatus(member)}
                    className={cn(
                      "text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors",
                      member.status === "active"
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    )}
                  >
                    {member.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => deleteMember(member.id, member.name)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
