import type { Agent } from './company-data'

/**
 * Convert array of objects to CSV format
 */
export function arrayToCSV<T extends Record<string, any>>(
  data: T[],
  columns?: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) return ''

  // If no columns specified, use all keys from first object
  const headers = columns 
    ? columns.map(col => col.label)
    : Object.keys(data[0])

  const headerRow = headers.join(',')

  const rows = data.map(item => {
    const values = columns
      ? columns.map(col => {
          const value = item[col.key]
          // Handle special cases
          if (value === null || value === undefined) return ''
          if (typeof value === 'boolean') return value ? 'Yes' : 'No'
          if (Array.isArray(value)) return `"${value.join(', ')}"`
          if (typeof value === 'string' && value.includes(',')) return `"${value}"`
          if (value && typeof value === 'object' && 'toISOString' in value) return (value as Date).toISOString()
          return String(value)
        })
      : Object.values(item).map(value => {
          if (value === null || value === undefined) return ''
          if (typeof value === 'boolean') return value ? 'Yes' : 'No'
          if (Array.isArray(value)) return `"${value.join(', ')}"`
          if (typeof value === 'string' && value.includes(',')) return `"${value}"`
          if (value && typeof value === 'object' && 'toISOString' in value) return (value as Date).toISOString()
          return String(value)
        })
    
    return values.join(',')
  })

  return [headerRow, ...rows].join('\n')
}

/**
 * Download data as CSV file
 */
export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if ((navigator as any).msSaveBlob) {
    // IE 10+
    (navigator as any).msSaveBlob(blob, filename)
  } else {
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }
}

/**
 * Export agents to CSV
 */
export function exportAgentsToCSV(agents: Agent[]) {
  const columns = [
    { key: 'id' as keyof Agent, label: 'ID' },
    { key: 'firstName' as keyof Agent, label: 'First Name' },
    { key: 'lastName' as keyof Agent, label: 'Last Name' },
    { key: 'title' as keyof Agent, label: 'Title' },
    { key: 'email' as keyof Agent, label: 'Email' },
    { key: 'phone' as keyof Agent, label: 'Phone' },
    { key: 'phoneExtension' as keyof Agent, label: 'Extension' },
    { key: 'mobilePhone' as keyof Agent, label: 'Mobile' },
    { key: 'nmlsNumber' as keyof Agent, label: 'NMLS #' },
    { key: 'licenseStates' as keyof Agent, label: 'Licensed States' },
    { key: 'specialties' as keyof Agent, label: 'Specialties' },
    { key: 'yearsExperience' as keyof Agent, label: 'Years Experience' },
    { key: 'isActive' as keyof Agent, label: 'Active' },
    { key: 'bio' as keyof Agent, label: 'Bio' }
  ]

  const csv = arrayToCSV(agents, columns)
  const filename = `agents-export-${new Date().toISOString().split('T')[0]}.csv`
  
  downloadCSV(filename, csv)
}

/**
 * Export user assignments to CSV
 */
export function exportAssignmentsToCSV(assignments: any[]) {
  const columns = [
    { key: 'userId', label: 'User ID' },
    { key: 'userName', label: 'User Name' },
    { key: 'userEmail', label: 'User Email' },
    { key: 'agentId', label: 'Agent ID' },
    { key: 'agentName', label: 'Agent Name' },
    { key: 'assignedAt', label: 'Assigned Date' }
  ]

  const csv = arrayToCSV(assignments, columns)
  const filename = `user-assignments-${new Date().toISOString().split('T')[0]}.csv`
  
  downloadCSV(filename, csv)
}

/**
 * Parse CSV file to array of objects
 */
export function parseCSV(csvText: string): Record<string, any>[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  
  // Parse rows
  const data = []
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i]
    if (!row.trim()) continue

    // Simple CSV parsing (doesn't handle all edge cases)
    const values: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let j = 0; j < row.length; j++) {
      const char = row[j]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    // Create object from headers and values
    const obj: Record<string, any> = {}
    headers.forEach((header, index) => {
      let value = values[index] || ''
      
      // Remove quotes
      value = value.replace(/^"|"$/g, '')
      
      // Convert special values
      if (value === 'Yes') value = 'true'
      if (value === 'No') value = 'false'
      if (value === 'true') obj[header] = true
      else if (value === 'false') obj[header] = false
      else if (value && !isNaN(Number(value))) obj[header] = Number(value)
      else obj[header] = value
    })
    
    data.push(obj)
  }

  return data
}

/**
 * Import agents from CSV file
 */
export async function importAgentsFromCSV(file: File): Promise<Partial<Agent>[]> {
  const text = await file.text()
  const data = parseCSV(text)
  
  // Map CSV data to Agent format
  return data.map(row => ({
    firstName: row['First Name'] || row.firstName || '',
    lastName: row['Last Name'] || row.lastName || '',
    title: row['Title'] || row.title || '',
    email: row['Email'] || row.email || '',
    phone: row['Phone'] || row.phone || '',
    phoneExtension: row['Extension'] || row.phoneExtension || '',
    mobilePhone: row['Mobile'] || row.mobilePhone || '',
    nmlsNumber: row['NMLS #'] || row.nmlsNumber || '',
    licenseStates: row['Licensed States'] 
      ? String(row['Licensed States']).split(',').map(s => s.trim())
      : row.licenseStates || [],
    specialties: row['Specialties']
      ? String(row['Specialties']).split(',').map(s => s.trim())
      : row.specialties || [],
    yearsExperience: Number(row['Years Experience'] || row.yearsExperience || 0),
    isActive: row['Active'] !== undefined ? row['Active'] : (row.isActive ?? true),
    bio: row['Bio'] || row.bio || ''
  }))
}