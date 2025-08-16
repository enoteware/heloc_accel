"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import type { Agent } from "@/lib/company-data";

export default function AgentsListPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Load agents
  useEffect(() => {
    const loadAgents = async () => {
      try {
        // Fetch from API
        const response = await fetch("/api/agents");
        if (response.ok) {
          const data = await response.json();
          setAgents(data.data || []);
          setFilteredAgents(data.data || []);
        }
      } catch (error) {
        console.error("Error loading agents:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  // Filter agents based on search and status
  useEffect(() => {
    let filtered = agents;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (agent) =>
          agent.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (agent.phone && agent.phone.includes(searchTerm)),
      );
    }

    // Apply status filter
    if (filterActive !== "all") {
      filtered = filtered.filter((agent) =>
        filterActive === "active" ? agent.isActive : !agent.isActive,
      );
    }

    setFilteredAgents(filtered);
  }, [searchTerm, filterActive, agents]);

  const handleDelete = async (agentId: number) => {
    if (!confirm("Are you sure you want to delete this agent?")) {
      return;
    }

    try {
      // Delete via API
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAgents((prev) => prev.filter((a) => a.id !== agentId));
        alert("Agent deleted successfully!");
      } else {
        throw new Error("Failed to delete agent");
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      alert("Failed to delete agent");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-6 w-6 text-gray-600" />
              <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
            </div>
            <p className="text-sm text-gray-600">
              Manage your loan officers and mortgage specialists
            </p>
          </div>
          <Link
            href="/admin/agents/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add New Agent
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search agents by name, email, or phone..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterActive}
                onChange={(e) =>
                  setFilterActive(
                    e.target.value as "all" | "active" | "inactive",
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Agents</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600">
          Showing {filteredAgents.length} of {agents.length} agents
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading agents...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm || filterActive !== "all"
                ? "No agents found matching your criteria"
                : "No agents added yet"}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NMLS #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {agent.firstName} {agent.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{agent.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{agent.email}</div>
                    <div className="text-sm text-gray-500">{agent.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agent.nmlsNumber || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        agent.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {agent.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/agents/${agent.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(agent.id!)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
