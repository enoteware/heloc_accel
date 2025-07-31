import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  console.log('=== DATABASE TEST ENDPOINT ===')
  
  try {
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL prefix:', process.env.DATABASE_URL?.substring(0, 30))
    
    console.log('Attempting to connect to database...')
    const client = await pool.connect()
    
    try {
      console.log('Connected! Running test query...')
      const result = await client.query('SELECT NOW() as current_time, current_database() as db_name')
      console.log('Query successful:', result.rows[0])
      
      // Check if scenarios table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'scenarios'
        );
      `)
      console.log('Scenarios table exists:', tableCheck.rows[0].exists)
      
      // Check users table
      const usersCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `)
      console.log('Users table exists:', usersCheck.rows[0].exists)
      
      // Get column info for scenarios table if it exists
      if (tableCheck.rows[0].exists) {
        const columnsResult = await client.query(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'scenarios' 
          ORDER BY ordinal_position
          LIMIT 10;
        `)
        console.log('Scenarios table columns:', columnsResult.rows)
      }
      
      return NextResponse.json({
        success: true,
        database: {
          connected: true,
          currentTime: result.rows[0].current_time,
          databaseName: result.rows[0].db_name,
          tables: {
            scenarios: tableCheck.rows[0].exists,
            users: usersCheck.rows[0].exists
          }
        }
      })
    } finally {
      client.release()
      console.log('Database client released')
    }
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Error',
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5).join('\n') : undefined
      }
    }, { status: 500 })
  }
}