'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import AgentForm from '../../_components/AgentForm'
import type { Agent } from '@/lib/company-data'

export default function NewAgentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: Partial<Agent>) => {
    setLoading(true)

    try {
      const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

      if (isDemoMode) {
        // In demo mode, save to localStorage
        const agents = JSON.parse(localStorage.getItem('heloc_demo_agents') || '[]')
        const newAgent: Agent = {
          ...data as Agent,
          id: Date.now(), // Generate temporary ID
          createdAt: new Date(),
          updatedAt: new Date()
        }
        agents.push(newAgent)
        localStorage.setItem('heloc_demo_agents', JSON.stringify(agents))
        
        alert('Agent created successfully!')
        router.push('/admin/agents')
      } else {
        // In production, save via API
        const response = await fetch('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (response.ok) {
          alert('Agent created successfully!')
          router.push('/admin/agents')
        } else {
          throw new Error('Failed to create agent')
        }
      }
    } catch (error) {
      console.error('Error creating agent:', error)
      alert('Failed to create agent')
    } finally {
      setLoading(false)
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Add New Agent</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create a new loan officer or mortgage specialist
        </p>
      </div>

      {/* Form */}
      <AgentForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/agents')}
        loading={loading}
      />
    </div>
  )
}