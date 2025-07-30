'use client'

import React, { useState, useEffect } from 'react'
import { debugLogger, copyDebugLogs, exportDebugData } from '@/lib/debug-utils'
import { errorMonitor } from '@/lib/error-monitoring'
import type { DebugLog } from '@/lib/debug-utils'
import type { ErrorReport } from '@/lib/error-monitoring'
import { useDebugFlag } from '@/hooks/useDebugFlag'

interface DebugPanelProps {
  isVisible?: boolean
  onToggle?: () => void
}

export default function DebugPanel({ isVisible = false, onToggle }: DebugPanelProps) {
  const [logs, setLogs] = useState<DebugLog[]>([])
  const [errors, setErrors] = useState<ErrorReport[]>([])
  const [activeTab, setActiveTab] = useState<'logs' | 'errors' | 'ltv' | 'summary'>('logs')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const isDebugMode = useDebugFlag()

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setLogs(debugLogger.getLogs())
        setErrors(errorMonitor.getErrors())
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isVisible])

  const filteredLogs = logs.filter(log => {
    if (filterCategory !== 'all' && log.category !== filterCategory) return false
    if (filterLevel !== 'all' && log.level !== filterLevel) return false
    return true
  })

  const handleCopyLogs = () => {
    const category = filterCategory === 'all' ? undefined : filterCategory as any
    copyDebugLogs(category)
  }

  const handleExportData = () => {
    const data = exportDebugData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `heloc-debug-${new Date().toISOString().slice(0, 19)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const errorSummary = errorMonitor.getErrorSummary()

  // Only render if debug flag is present in URL
  if (!isDebugMode) {
    return null;
  }

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Open Debug Panel"
      >
        🐛 Debug
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 right-0 w-full max-w-4xl h-96 bg-white border-t-2 border-gray-300 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
        <h3 className="font-bold">HELOC Calculator Debug Panel</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
            title="Copy logs to clipboard"
          >
            📋 Copy
          </button>
          <button
            onClick={handleExportData}
            className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
            title="Export debug data"
          >
            💾 Export
          </button>
          <button
            onClick={() => {
              debugLogger.clear()
              errorMonitor.clearErrors()
            }}
            className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
            title="Clear all logs"
          >
            🗑️ Clear
          </button>
          <button
            onClick={onToggle}
            className="bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded text-xs"
            title="Close debug panel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-100 px-4 py-2 flex gap-2">
        {['logs', 'errors', 'ltv', 'summary'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-3 py-1 rounded text-sm font-medium ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'errors' && errors.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-1 rounded-full">
                {errors.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      {activeTab === 'logs' && (
        <div className="bg-gray-50 px-4 py-2 flex gap-4 text-sm">
          <div>
            <label className="mr-2">Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="all">All</option>
              <option value="ltv">LTV</option>
              <option value="pmi">PMI</option>
              <option value="validation">Validation</option>
              <option value="form">Form</option>
              <option value="calculation">Calculation</option>
            </select>
          </div>
          <div>
            <label className="mr-2">Level:</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="all">All</option>
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'logs' && (
          <div className="space-y-2">
            {filteredLogs.length === 0 ? (
              <p className="text-gray-500 italic">No logs to display</p>
            ) : (
              filteredLogs.slice(-50).reverse().map((log, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-xs font-mono border-l-4 ${
                    log.level === 'error'
                      ? 'bg-red-50 border-red-500'
                      : log.level === 'warn'
                      ? 'bg-yellow-50 border-yellow-500'
                      : log.level === 'info'
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-500">{log.timestamp}</span>
                    <span className={`px-1 rounded text-xs font-bold ${
                      log.level === 'error' ? 'bg-red-200 text-red-800' :
                      log.level === 'warn' ? 'bg-yellow-200 text-yellow-800' :
                      log.level === 'info' ? 'bg-blue-200 text-blue-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="bg-gray-200 text-gray-800 px-1 rounded text-xs">
                      {log.category.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-gray-800">{log.message}</div>
                  {log.data && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                        Data
                      </summary>
                      <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="space-y-2">
            {errors.length === 0 ? (
              <p className="text-gray-500 italic">No errors to display</p>
            ) : (
              errors.slice(0, 20).map((error, index) => (
                <div
                  key={error.id}
                  className={`p-3 rounded border-l-4 ${
                    error.severity === 'critical'
                      ? 'bg-red-100 border-red-600'
                      : error.severity === 'high'
                      ? 'bg-red-50 border-red-400'
                      : error.severity === 'medium'
                      ? 'bg-yellow-50 border-yellow-400'
                      : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500">{error.timestamp}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      error.severity === 'critical' ? 'bg-red-200 text-red-800' :
                      error.severity === 'high' ? 'bg-red-100 text-red-700' :
                      error.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {error.severity.toUpperCase()}
                    </span>
                    <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">
                      {error.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="font-medium text-gray-800 mb-1">{error.message}</div>
                  {error.context && (
                    <details>
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-800 text-sm">
                        Context
                      </summary>
                      <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(error.context, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <h4 className="font-bold text-blue-800 mb-2">Debug Logs</h4>
                <p className="text-2xl font-bold text-blue-600">{logs.length}</p>
                <p className="text-sm text-blue-600">Total logs captured</p>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <h4 className="font-bold text-red-800 mb-2">Errors</h4>
                <p className="text-2xl font-bold text-red-600">{errorSummary.total}</p>
                <p className="text-sm text-red-600">Total errors reported</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-bold text-gray-800 mb-2">Error Breakdown</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-1">By Type:</h5>
                  {Object.entries(errorSummary.byType).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span>{type}:</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h5 className="font-medium mb-1">By Severity:</h5>
                  {Object.entries(errorSummary.bySeverity).map(([severity, count]) => (
                    <div key={severity} className="flex justify-between">
                      <span>{severity}:</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
