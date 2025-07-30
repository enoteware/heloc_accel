'use client';

import { useState, useEffect } from 'react';
import { useDebugFlag } from '@/hooks/useDebugFlag';

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  level: 'info' | 'error' | 'warn';
}

let logId = 0;
const logs: LogEntry[] = [];
const logListeners: ((logs: LogEntry[]) => void)[] = [];

// Override console methods to capture logs
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

const addLog = (message: string, level: 'info' | 'error' | 'warn') => {
  const entry: LogEntry = {
    id: ++logId,
    timestamp: new Date().toLocaleTimeString(),
    message,
    level
  };
  
  logs.push(entry);
  if (logs.length > 50) logs.shift(); // Keep only last 50 logs
  
  logListeners.forEach(listener => listener([...logs]));
};

console.log = (...args) => {
  const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
  if (message.includes('[LocaleLayout]') || message.includes('[LanguageSwitcher]') || message.includes('HomePageContent')) {
    addLog(message, 'info');
  }
  originalLog(...args);
};

console.error = (...args) => {
  const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
  addLog(`ERROR: ${message}`, 'error');  
  originalError(...args);
};

console.warn = (...args) => {
  const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
  addLog(`WARN: ${message}`, 'warn');
  originalWarn(...args);
};

export default function LiveDebugLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const isDebugMode = useDebugFlag();

  useEffect(() => {
    const listener = (newLogs: LogEntry[]) => setLogs(newLogs);
    logListeners.push(listener);
    
    return () => {
      const index = logListeners.indexOf(listener);
      if (index > -1) logListeners.splice(index, 1);
    };
  }, []);

  // Only render if debug flag is present in URL
  if (!isDebugMode) {
    return null;
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded text-sm z-50"
      >
        Show Debug Logs
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg max-w-md w-80 max-h-96 overflow-hidden z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold">Live Debug Logs</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-300 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1 text-xs font-mono overflow-y-auto max-h-80">
        {logs.length === 0 ? (
          <div className="text-gray-400">No debug logs yet...</div>
        ) : (
          logs.map(log => (
            <div 
              key={log.id}
              className={`p-1 rounded text-xs ${
                log.level === 'error' ? 'bg-red-900 text-red-200' :
                log.level === 'warn' ? 'bg-yellow-900 text-yellow-200' :
                'bg-gray-800 text-gray-200'
              }`}
            >
              <div className="text-gray-400">{log.timestamp}</div>
              <div className="break-words">{log.message}</div>
            </div>
          ))
        )}
      </div>
      
      <button 
        onClick={() => setLogs([])}
        className="mt-2 text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
      >
        Clear Logs
      </button>
    </div>
  );
}