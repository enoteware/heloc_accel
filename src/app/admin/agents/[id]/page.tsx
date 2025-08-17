"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import AgentForm from "../../_components/AgentForm";
import type { Agent } from "@/lib/company-data";

export default function EditAgentPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = parseInt(params.id as string);

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load agent data
  useEffect(() => {
    const loadAgent = async () => {
      try {
        // Fetch from API
        const response = await fetch(`/api/agents/${agentId}`);
        if (response.ok) {
          const data = await response.json();
          setAgent(data.data);
        }
      } catch (error) {
        console.error("Error loading agent:", error);
        alert("Failed to load agent");
        router.push("/admin/agents");
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      loadAgent();
    }
  }, [agentId, router]);

  const handleSubmit = async (data: Partial<Agent>) => {
    setSaving(true);

    try {
      // Update via API
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Agent updated successfully!");
        router.push("/admin/agents");
      } else {
        throw new Error("Failed to update agent");
      }
    } catch (error) {
      console.error("Error updating agent:", error);
      alert("Failed to update agent");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Agent not found</p>
        <Link
          href="/admin/agents"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Agents
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/agents"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Agents
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Agent: {agent.firstName} {agent.lastName}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Update agent information and settings
        </p>
      </div>

      {/* Form */}
      <AgentForm
        agent={agent}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/agents")}
        loading={saving}
      />
    </div>
  );
}
