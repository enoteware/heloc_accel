"use client";

import React, { useState } from "react";
import { Modal, ModalBody, ModalFooter } from "./design-system/Modal";
import { Button } from "./design-system/Button";
import { Input } from "./design-system/Input";

export interface FirstConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export const FirstConfirmationModal: React.FC<FirstConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Continue",
  cancelText = "Cancel",
}) => {
  // Focus management
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      // Focus the cancel button by default for safety
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      closeOnOverlayClick={false}
      closeOnEscape={true}
    >
      <ModalBody>
        <div className="flex items-start space-x-4">
          {/* Warning Icon */}
          <div className="flex-shrink-0" aria-hidden="true">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          {/* Message Content */}
          <div className="flex-1">
            <p
              className="text-body text-neutral-700 leading-relaxed"
              id="confirmation-message"
              role="alert"
              aria-live="polite"
            >
              {message}
            </p>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button
          ref={cancelButtonRef}
          variant="ghost"
          onClick={onClose}
          aria-describedby="confirmation-message"
        >
          {cancelText}
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          aria-describedby="confirmation-message"
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export interface SecondConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmationText?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export const SecondConfirmationModal: React.FC<
  SecondConfirmationModalProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Final Confirmation",
  message = "This action cannot be undone. Please type the confirmation text below:",
  confirmationText = "DELETE ALL DATA",
  placeholder = "Type confirmation text here...",
  confirmText = "Confirm Deletion",
  cancelText = "Cancel",
  loading = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  // Refs for focus management
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null);

  const isValid = inputValue.trim() === confirmationText;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Clear error when user starts typing correctly
    if (error && value.trim() === confirmationText) {
      setError("");
    }
  };

  const handleConfirm = () => {
    if (!isValid) {
      setError(`Please type "${confirmationText}" exactly as shown`);
      return;
    }

    setError("");
    onConfirm();
  };

  const handleClose = () => {
    setInputValue("");
    setError("");
    onClose();
  };

  // Reset state when modal opens/closes and manage focus
  React.useEffect(() => {
    if (isOpen) {
      // Focus the input when modal opens
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } else {
      setInputValue("");
      setError("");
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isValid && !loading) {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
      closeOnOverlayClick={false}
      closeOnEscape={true}
    >
      <ModalBody>
        <div className="space-y-4">
          {/* Warning Icon and Message */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0" aria-hidden="true">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <p
                className="text-body text-neutral-700 leading-relaxed mb-4"
                id="confirmation-instructions"
                role="alert"
                aria-live="polite"
              >
                {message}
              </p>
            </div>
          </div>

          {/* Confirmation Text Display */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
            <p
              className="text-body-sm text-neutral-600 mb-1"
              id="confirmation-label"
            >
              Type this text exactly:
            </p>
            <p
              className="font-mono text-body font-semibold text-red-600 bg-white border border-neutral-300 rounded px-2 py-1"
              id="confirmation-text"
              aria-label={`Required confirmation text: ${confirmationText}`}
            >
              {confirmationText}
            </p>
          </div>

          {/* Input Field */}
          <div>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              error={error}
              className="font-mono"
              autoComplete="off"
              aria-labelledby="confirmation-label"
              aria-describedby="confirmation-text confirmation-instructions"
              aria-required="true"
              aria-invalid={!!error}
            />
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button
          ref={cancelButtonRef}
          variant="ghost"
          onClick={handleClose}
          disabled={loading}
          aria-describedby="confirmation-instructions"
        >
          {cancelText}
        </Button>
        <Button
          variant="danger"
          onClick={handleConfirm}
          disabled={!isValid || loading}
          loading={loading}
          aria-describedby="confirmation-instructions"
          aria-label={
            isValid
              ? confirmText
              : `${confirmText} (requires typing "${confirmationText}")`
          }
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerateData?: () => void;
  title?: string;
  message?: string;
  showRegenerateOption?: boolean;
  regenerateText?: string;
  closeText?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  onRegenerateData,
  title = "Success",
  message = "Operation completed successfully.",
  showRegenerateOption = false,
  regenerateText = "Generate Sample Data",
  closeText = "Close",
}) => {
  // Focus management
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      closeOnOverlayClick={true}
      closeOnEscape={true}
    >
      <ModalBody>
        <div className="flex items-start space-x-4">
          {/* Success Icon */}
          <div className="flex-shrink-0" aria-hidden="true">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Message Content */}
          <div className="flex-1">
            <p
              className="text-body text-neutral-700 leading-relaxed"
              id="success-message"
              role="status"
              aria-live="polite"
            >
              {message}
            </p>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        {showRegenerateOption && onRegenerateData && (
          <Button
            variant="outline"
            onClick={onRegenerateData}
            aria-describedby="success-message"
          >
            {regenerateText}
          </Button>
        )}
        <Button
          ref={closeButtonRef}
          variant="primary"
          onClick={onClose}
          aria-describedby="success-message"
        >
          {closeText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
