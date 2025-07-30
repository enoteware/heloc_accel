'use client'

import React from 'react'

export default function Disclaimer() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-700">
            Important Disclaimer
          </h3>
          <div className="mt-2 text-sm text-gray-600">
            <p>
              This calculator is for <strong>informational and educational purposes only</strong>. 
              The results are estimates based on the information you provide and should not be considered as financial advice.
            </p>
            
            <div className="mt-3 space-y-2">
              <p>
                <strong>Please note:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>HELOC rates are typically variable and can change over time</li>
                <li>Actual results may vary based on your specific financial situation</li>
                <li>The HELOC acceleration strategy involves risks including potential loss of home equity</li>
                <li>This strategy requires disciplined financial management and positive cash flow</li>
                <li>Tax implications are not considered in these calculations</li>
              </ul>
              <p className="mt-2">
                <strong>We strongly recommend consulting with a qualified financial advisor, tax professional, 
                and mortgage specialist before making any decisions about mortgage acceleration strategies.</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CompactDisclaimer() {
  return (
    <div className="text-xs text-gray-500 text-center mt-4">
      <p>
        <svg className="inline h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        For informational purposes only. Not financial advice. 
        <a href="#disclaimer" className="underline hover:text-gray-700">See full disclaimer</a>
      </p>
    </div>
  )
}