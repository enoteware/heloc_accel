import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        {/* Animated spinner */}
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-2 border-primary-200 mx-auto"></div>
        </div>

        {/* Loading text */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading HELOC Accelerator
          </h2>
          <p className="text-gray-600">
            Please wait while we prepare your financial tools...
          </p>
        </div>

        {/* Loading dots animation */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
