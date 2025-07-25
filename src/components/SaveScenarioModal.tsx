'use client'

import { useState } from 'react'
import { Modal } from '@/components/design-system/Modal'
import { Button } from '@/components/design-system/Button'
import { FormField } from '@/components/design-system/FormField'
import { ValidatedInput } from '@/components/design-system/ValidatedInput'

interface SaveScenarioModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (scenarioName: string, description: string) => Promise<void>
  isLoading?: boolean
}

export default function SaveScenarioModal({
  isOpen,
  onClose,
  onSave,
  isLoading = false
}: SaveScenarioModalProps) {
  const [scenarioName, setScenarioName] = useState('')
  const [description, setDescription] = useState('')
  const [nameError, setNameError] = useState('')

  const handleSave = async () => {
    if (!scenarioName.trim()) {
      setNameError('Scenario name is required')
      return
    }

    if (scenarioName.trim().length < 3) {
      setNameError('Scenario name must be at least 3 characters')
      return
    }

    try {
      await onSave(scenarioName.trim(), description.trim())
      setScenarioName('')
      setDescription('')
      setNameError('')
      onClose()
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        setNameError('A scenario with this name already exists')
      } else {
        setNameError('Failed to save scenario. Please try again.')
      }
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setScenarioName('')
      setDescription('')
      setNameError('')
      onClose()
    }
  }

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setScenarioName(value)
    if (nameError) {
      setNameError('')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Save Scenario"
      size="md"
    >
      <div className="space-y-6">
        <div className="text-sm text-neutral-600">
          Save your calculation results as a scenario for future reference and comparison.
        </div>

        <ValidatedInput
          id="scenario-name"
          type="text"
          label="Scenario Name"
          required
          value={scenarioName}
          onChange={handleNameChange}
          placeholder="e.g., Current Home - HELOC Strategy"
          maxLength={100}
          disabled={isLoading}
          error={nameError}
          aria-describedby={nameError ? 'scenario-name-error' : undefined}
        />

        <FormField
          label="Description (Optional)"
        >
          <textarea
            id="scenario-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes about this scenario..."
            rows={3}
            maxLength={500}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 disabled:bg-neutral-50 disabled:cursor-not-allowed"
          />
          <div className="mt-1 text-xs text-neutral-500">
            {description.length}/500 characters
          </div>
        </FormField>

        <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isLoading || !scenarioName.trim()}
            loading={isLoading}
          >
            Save Scenario
          </Button>
        </div>
      </div>
    </Modal>
  )
}