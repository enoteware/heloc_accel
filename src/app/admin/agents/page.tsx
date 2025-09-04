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
              <Users className="h-6 w-6 text-foreground-secondary" />
              <h1 className="text-2xl font-bold text-foreground">Agents</h1>
            </div>
            <p className="text-sm text-foreground-secondary">
              Manage your loan officers and mortgage specialists
            </p>
          </div>
          <Link href="/admin/agents/new" className="btn btn-primary">
            <Plus className="h-5 w-5" />
            Add New Agent
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card shadow rounded-lg mb-6">
        <div className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search agents by name, email, or phone..."
                  className="input-default w-full pl-10 pr-3 py-2"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <select
                value={filterActive}
                onChange={(e) =>
                  setFilterActive(
                    e.target.value as "all" | "active" | "inactive",
                  )
                }
                className="input-default px-3 py-2"
              >
                <option value="all">All Agents</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="px-4 py-2 bg-muted text-sm text-foreground-secondary">
          Showing {filteredAgents.length} of {agents.length} agents
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-card shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-foreground-secondary">Loading agents...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground-secondary">
              {searchTerm || filterActive !== "all"
                ? "No agents found matching your criteria"
                : "No agents added yet"}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  NMLS #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-muted">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {agent.firstName} {agent.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {agent.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">{agent.email}</div>
                    <div className="text-sm text-muted-foreground">
                      {agent.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {agent.nmlsNumber || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`badge ${
                        agent.isActive ? "badge-success" : "badge-secondary"
                      }`}
                    >
                      {agent.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/agents/${agent.id}`}
                        className="safe-link"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(agent.id!)}
                        className="text-destructive"
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
