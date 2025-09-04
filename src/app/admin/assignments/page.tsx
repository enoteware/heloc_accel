"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, Search, Filter, Users, AlertCircle } from "lucide-react";
import type { Agent } from "@/lib/company-data";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface Assignment {
  userId: string;
  userName: string;
  userEmail: string;
  agentId: number | null;
  agentName: string | null;
  assignedAt: Date | null;
}

export default function UserAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "assigned" | "unassigned"
  >("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch from API
        const [assignmentsRes, agentsRes] = await Promise.all([
          fetch("/api/admin/assignments"),
          fetch("/api/agents?active=true"),
        ]);

        if (assignmentsRes.ok && agentsRes.ok) {
          const assignmentsData = await assignmentsRes.json();
          const agentsData = await agentsRes.json();

          setAssignments(assignmentsData.data || []);
          setAgents(agentsData.data || []);
        }
      } catch (error) {
        console.error("Error loading assignments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter assignments
  const filteredAssignments = assignments.filter((assignment) => {
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (
        !assignment.userName.toLowerCase().includes(search) &&
        !assignment.userEmail.toLowerCase().includes(search) &&
        !(
          assignment.agentName &&
          assignment.agentName.toLowerCase().includes(search)
        )
      ) {
        return false;
      }
    }

    // Apply status filter
    if (filterType === "assigned" && !assignment.agentId) return false;
    if (filterType === "unassigned" && assignment.agentId) return false;

    return true;
  });

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredAssignments.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredAssignments.map((a) => a.userId));
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedAgentId || selectedUsers.length === 0) {
      alert("Please select users and an agent");
      return;
    }

    setAssigning(true);

    try {
      // Update via API
      const response = await fetch("/api/admin/assignments/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          agentId: selectedAgentId,
        }),
      });

      if (response.ok) {
        // Reload assignments
        window.location.reload();
      } else {
        throw new Error("Failed to assign users");
      }
    } catch (error) {
      console.error("Error assigning users:", error);
      alert("Failed to assign users");
    } finally {
      setAssigning(false);
    }
  };

  const unassignedCount = assignments.filter((a) => !a.agentId).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <UserCheck className="h-6 w-6 text-foreground-secondary" />
          <h1 className="text-2xl font-bold text-foreground">
            User Assignments
          </h1>
        </div>
        <p className="text-sm text-foreground-secondary">
          Manage agent assignments for all users
        </p>
      </div>

      {/* Alert for unassigned users */}
      {unassignedCount > 0 && (
        <div className="mb-6 alert-warning">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            <p className="text-sm text-warning">
              <strong>{unassignedCount} users</strong> are not assigned to any
              agent. Use the bulk assign feature below to assign them.
            </p>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-card border border-border rounded-lg mb-6">
        <div className="p-4 border-b border-border">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users or agents..."
                  className="input-default pl-10"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(
                    e.target.value as "all" | "assigned" | "unassigned",
                  )
                }
                className="input-default"
              >
                <option value="all">All Users</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <p className="text-sm text-foreground-secondary">
                {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""}{" "}
                selected
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={selectedAgentId || ""}
                  onChange={(e) =>
                    setSelectedAgentId(parseInt(e.target.value) || null)
                  }
                  className="input-default"
                >
                  <option value="">Select Agent</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.firstName} {agent.lastName}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkAssign}
                  disabled={!selectedAgentId || assigning}
                  className="btn-primary"
                >
                  {assigning ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="px-4 py-2 bg-muted text-sm text-foreground-secondary">
          Showing {filteredAssignments.length} of {assignments.length} users
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-foreground-secondary">
              Loading assignments...
            </p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground-secondary">
              No users found matching your criteria
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.length === filteredAssignments.length
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Assigned Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Assigned Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.userId} className="hover:bg-muted">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(assignment.userId)}
                      onChange={() => handleSelectUser(assignment.userId)}
                      className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {assignment.userName}
                      </div>
                      <div className="text-sm text-foreground-muted">
                        {assignment.userEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {assignment.agentName ? (
                      <span className="text-sm text-foreground">
                        {assignment.agentName}
                      </span>
                    ) : (
                      <span className="text-sm text-destructive">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-muted">
                    {assignment.assignedAt
                      ? new Date(assignment.assignedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <select
                      value={assignment.agentId || ""}
                      onChange={async (e) => {
                        const newAgentId = parseInt(e.target.value) || null;
                        if (newAgentId !== assignment.agentId) {
                          setSelectedUsers([assignment.userId]);
                          setSelectedAgentId(newAgentId);
                          await handleBulkAssign();
                        }
                      }}
                      className="text-sm input-default px-2 py-1"
                    >
                      <option value="">Unassigned</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.firstName} {agent.lastName}
                        </option>
                      ))}
                    </select>
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
