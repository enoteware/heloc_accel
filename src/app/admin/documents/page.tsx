"use client";

import React, { useState } from "react";
import { FileText, Download, Upload, Plus } from "lucide-react";
import {
  exportAgentsToCSV,
  exportAssignmentsToCSV,
  importAgentsFromCSV,
} from "@/lib/export-utils";

export default function DocumentsPage() {
  const [importing, setImporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExportAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      if (response.ok) {
        const data = await response.json();
        exportAgentsToCSV(data.data || []);
      } else {
        alert("Failed to fetch agents for export");
      }
    } catch (error) {
      console.error("Error exporting agents:", error);
      alert("Failed to export agents");
    }
  };

  const handleExportAssignments = async () => {
    try {
      // Fetch assignments from API
      const response = await fetch("/api/admin/assignments");
      if (response.ok) {
        const data = await response.json();
        exportAssignmentsToCSV(data.data || []);
      } else {
        alert("Failed to fetch assignments for export");
      }
    } catch (error) {
      console.error("Error exporting assignments:", error);
      alert("Failed to export assignments");
    }
  };

  const handleImportAgents = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      const importedAgents = await importAgentsFromCSV(file);

      // Import agents via API
      const response = await fetch("/api/agents/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agents: importedAgents }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          `Successfully imported ${result.count || importedAgents.length} agents!`,
        );
      } else {
        throw new Error("Failed to import agents via API");
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error importing agents:", error);
      alert("Failed to import agents. Please check the CSV format.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Documents & Data Export
          </h1>
        </div>
        <p className="text-sm text-gray-600">
          Export your data or manage company documents
        </p>
      </div>

      {/* Export Section */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Data Export</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Agents</h3>
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Export all agent information including contact details and
                specialties
              </p>
              <button
                onClick={handleExportAgents}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Agents CSV
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">User Assignments</h3>
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Export all user-agent assignments for record keeping
              </p>
              <button
                onClick={handleExportAssignments}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Assignments CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Data Import</h2>
        </div>
        <div className="p-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Import Agents</h3>
              <Upload className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Upload a CSV file to bulk import agents. The CSV should include
              columns for: First Name, Last Name, Title, Email, Phone, etc.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportAgents}
              className="hidden"
              id="agent-import"
            />
            <label
              htmlFor="agent-import"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              {importing ? "Importing..." : "Import Agents CSV"}
            </label>
          </div>
        </div>
      </div>

      {/* Document Templates */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Document Templates
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    Agent Import Template
                  </p>
                  <p className="text-sm text-gray-600">
                    CSV template for bulk agent import
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  // Download template
                  const template =
                    "First Name,Last Name,Title,Email,Phone,Extension,Mobile,NMLS #,Licensed States,Specialties,Years Experience,Active,Bio\n" +
                    'John,Doe,Senior Loan Officer,john.doe@example.com,555-0100,101,555-555-0100,123456,"CA, TX, FL","HELOC, FHA, VA",10,Yes,Experienced loan officer specializing in HELOC strategies';

                  const blob = new Blob([template], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "agent-import-template.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                Download
              </button>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Privacy Policy</p>
                  <p className="text-sm text-gray-600">
                    Company privacy policy document
                  </p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700">
                Edit
              </button>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Terms of Service</p>
                  <p className="text-sm text-gray-600">
                    Company terms and conditions
                  </p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700">
                Edit
              </button>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">HELOC Disclosure</p>
                  <p className="text-sm text-gray-600">
                    Required HELOC disclosure statement
                  </p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700">
                Edit
              </button>
            </div>
          </div>

          <button className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <Plus className="h-4 w-4" />
            Add New Document
          </button>
        </div>
      </div>
    </div>
  );
}
