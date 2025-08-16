"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import {
  Home,
  Building,
  Users,
  UserCheck,
  FileText,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Company Settings", href: "/admin/company", icon: Building },
  { name: "Agents", href: "/admin/agents", icon: Users },
  { name: "User Assignments", href: "/admin/assignments", icon: UserCheck },
  { name: "Documents", href: "/admin/documents", icon: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 bg-white shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span className="sr-only">Open sidebar</span>
          {sidebarOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Exit Admin
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href as any}
                  className={`
                    group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`h-5 w-5 ${
                      isActive
                        ? "text-blue-700"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="text-xs text-gray-500">
              <p>HELOC Accelerator Admin</p>
              <p className="mt-1">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
