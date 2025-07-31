'use client'

import React, { useState, useEffect } from 'react'
import { debugLogger, DebugLog } from '@/lib/debug-logger'
import { Button } from '@/components/design-system/Button'

export default function DebugLogViewer() {
  const [logs, setLogs] = useState<DebugLog[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState({
    level: '',
    category: '',
    limit: 100
  })
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (!isOpen) return

    const loadLogs = () => {
      const filteredLogs = debugLogger.getLogs({
        level: filter.level as any || undefined,
        category: filter.category || undefined,
        limit: filter.limit
      })
      setLogs(filteredLogs)
    }

    loadLogs()

    // Auto refresh logs
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(loadLogs, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isOpen, filter, autoRefresh])

  const handleExport = () => {
    const data = debugLogger.export()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `heloc-debug-logs-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all debug logs?')) {
      debugLogger.clear()
      setLogs([])
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50'
      case 'warn': return 'text-yellow-600 bg-yellow-50'
      case 'info': return 'text-blue-600 bg-blue-50'
      case 'debug': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600'
    }
  }

  const categories = Array.from(new Set(logs.map(log => log.category))).sort()

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-gray-700 z-50 flex items-center space-x-2"
        title="Open Debug Logs"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span>Debug Logs</span>
        {logs.length > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {logs.filter(l => l.level === 'error').length}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Debug Logs</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-200 flex items-center space-x-4">
          <select
            value={filter.level}
            onChange={(e) => setFilter({ ...filter, level: e.target.value })}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Levels</option>
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>

          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input
            type="number"
            value={filter.limit}
            onChange={(e) => setFilter({ ...filter, limit: parseInt(e.target.value) || 100 })}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm w-20"
            placeholder="Limit"
            min="1"
            max="1000"
          />

          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span>Auto Refresh</span>
          </label>

          <div className="flex-1"></div>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleExport}
          >
            Export
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No logs to display
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border ${
                    log.level === 'error' ? 'border-red-200' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 text-gray-600">
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className="font-medium text-gray-800">[{log.category}]</span>
                        {log.userId && <span className="text-xs">User: {log.userId}</span>}
                      </div>
                      <div className="mt-1 text-gray-800">{log.message}</div>
                      {log.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                            Data
                          </summary>
                          <pre className="mt-1 p-2 bg-gray-50 rounded overflow-auto text-xs">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                      {log.stack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-red-600 hover:text-red-800">
                            Stack Trace
                          </summary>
                          <pre className="mt-1 p-2 bg-red-50 rounded overflow-auto text-xs text-red-800">
                            {log.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="px-6 py-2 border-t border-gray-200 text-sm text-gray-600">
          Showing {logs.length} logs
        </div>
      </div>
    </div>
  )
}