/**
 * Hermes Session Sync
 * Syncs messages between Hermes local sessions (on VPS) and our Supabase DB
 */

import { createClient } from '@supabase/supabase-js'
import { Client } from 'ssh2'

const VPS_HOST = process.env.VPS_HOST || '178.238.232.52'
const VPS_USER = process.env.VPS_USER || 'root'
const VPS_PASSWORD = process.env.VPS_PASSWORD || 'NewRootPass2026!'

interface HermesMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface HermesSession {
  id: string
  file: string
  messages: HermesMessage[]
  createdAt: string
}

export interface ChatThread {
  id: string
  title: string
  created_at: string
  messages: HermesMessage[]
}

/**
 * Fetch session files from VPS via SSH
 */
async function fetchHermesSessionFiles(): Promise<{ files: Array<{ path: string; content: string; mtime: number }> }> {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    const files: Array<{ path: string; content: string; mtime: number }> = []

    conn.on('ready', () => {
      // List recent session files
      conn.exec('ls -t ~/.hermes/sessions/*.jsonl 2>/dev/null | head -20', (err, stream) => {
        if (err) {
          conn.end()
          reject(err)
          return
        }

        let output = ''
        stream.on('data', (data: Buffer) => { output += data.toString() })
        stream.on('close', async () => {
          const filePaths = output.trim().split('\n').filter(Boolean)
          
          if (filePaths.length === 0) {
            conn.end()
            resolve({ files: [] })
            return
          }

          // Fetch content of each file
          for (const filePath of filePaths) {
            try {
              const content = await new Promise<string>((res, rej) => {
                conn.exec(`cat "${filePath}"`, (err2, s) => {
                  if (err2) { rej(err2); return }
                  let c = ''
                  s.on('data', (d: Buffer) => { c += d.toString() })
                  s.on('close', () => { res(c) })
                })
              })
              
              // Get file modification time
              const mtimeStr = await new Promise<string>((res, rej) => {
                conn.exec(`stat -c %Y "${filePath}" 2>/dev/null || echo 0`, (err3, s) => {
                  if (err3) { rej(err3); return }
                  let t = ''
                  s.on('data', (d: Buffer) => { t += d.toString() })
                  s.on('close', () => { res(t.trim()) })
                })
              })

              files.push({
                path: filePath,
                content,
                mtime: parseInt(mtimeStr) * 1000,
              })
            } catch (e) {
              console.warn(`Failed to fetch ${filePath}:`, e)
            }
          }

          conn.end()
          resolve({ files })
        })
      })
    })

    conn.on('error', (err) => {
      console.error('SSH connection error:', err)
      reject(err)
    })

    conn.connect({
      host: VPS_HOST,
      port: 22,
      username: VPS_USER,
      password: VPS_PASSWORD,
      readyTimeout: 10000,
    })
  })
}

/**
 * Get Hermes session files from VPS
 */
export async function getHermesSessions(): Promise<HermesSession[]> {
  try {
    const { files } = await fetchHermesSessionFiles()
    const sessions: HermesSession[] = []

    for (const file of files) {
      const messages = parseHermesSession(file.content)
      if (messages.length > 0) {
        // Extract session ID from filename (e.g., session-abc123.jsonl -> abc123)
        const fileName = file.path.split('/').pop() || 'unknown'
        const sessionId = fileName.replace(/^session-|\.jsonl$/g, '')
        
        sessions.push({
          id: sessionId,
          file: fileName,
          messages,
          createdAt: new Date(file.mtime).toISOString(),
        })
      }
    }

    return sessions
  } catch (error) {
    console.error('Failed to get Hermes sessions:', error)
    return []
  }
}

/**
 * Parse Hermes session JSONL file
 */
export function parseHermesSession(content: string): HermesMessage[] {
  const messages: HermesMessage[] = []
  const lines = content.split('\n').filter(Boolean)
  
  for (const line of lines) {
    try {
      const entry = JSON.parse(line)
      // Hermes stores messages with 'role' and 'content' fields
      if (entry.role === 'user' || entry.role === 'assistant') {
        messages.push({
          role: entry.role,
          content: entry.content || entry.reasoning || '',
          timestamp: entry.timestamp || new Date().toISOString()
        })
      }
    } catch {
      // Skip malformed lines
    }
  }
  
  return messages
}

/**
 * Get Hermes sessions as chat threads (for frontend compatibility)
 */
export async function getHermesThreads(): Promise<ChatThread[]> {
  const sessions = await getHermesSessions()
  
  return sessions.map(session => ({
    id: `hermes-${session.id}`,
    title: `Session ${session.id.substring(0, 8)}`,
    created_at: session.createdAt,
    messages: session.messages,
  }))
}

/**
 * Sync Hermes sessions to Supabase
 */
export async function syncHermesSessionsToSupabase(
  supabaseUrl: string,
  supabaseKey: string,
  workspaceId: string
): Promise<{ synced: number; errors: string[] }> {
  const supabase = createClient(supabaseUrl, supabaseKey)
  const sessions = await getHermesSessions()
  let synced = 0
  const errors: string[] = []

  // Get existing thread IDs to avoid duplicates
  const { data: existingThreads } = await supabase
    .from('chat_threads')
    .select('id, title')
    .eq('workspace_id', workspaceId)

  const existingTitles = new Set((existingThreads || []).map(t => t.title))

  for (const session of sessions) {
    const threadTitle = `Session ${session.id.substring(0, 8)}`
    
    try {
      // Check if thread already exists
      let threadId: string | null = null
      
      if (existingTitles.has(threadTitle)) {
        const existing = (existingThreads || []).find(t => t.title === threadTitle)
        threadId = existing?.id || null
      }

      if (!threadId) {
        // Create new thread
        const { data: thread } = await supabase
          .from('chat_threads')
          .insert({
            workspace_id: workspaceId,
            title: threadTitle,
            agent_id: '00000000-0000-0000-0000-000000000000',
            created_at: session.createdAt,
          })
          .select('id')
          .single()
        
        threadId = thread?.id
      }

      if (!threadId) {
        errors.push(`Session ${session.id}: Could not create/find thread`)
        continue
      }

      // Insert messages (skip if already exists - dedupe by timestamp)
      for (const msg of session.messages) {
        // Check if message already exists
        const { data: existing } = await supabase
          .from('chat_messages')
          .select('id')
          .eq('thread_id', threadId)
          .eq('content', msg.content)
          .eq('created_at', msg.timestamp)
          .limit(1)

        if (existing && existing.length > 0) continue

        const { error: insertError } = await supabase.from('chat_messages').insert({
          workspace_id: workspaceId,
          thread_id: threadId,
          agent_id: '00000000-0000-0000-0000-000000000000',
          role: msg.role,
          content: msg.content,
          created_at: msg.timestamp,
        })

        if (!insertError) synced++
      }
    } catch (error: any) {
      errors.push(`Session ${session.id}: ${error.message}`)
    }
  }

  return { synced, errors }
}

/**
 * Get chat history for a workspace
 * Priority: Supabase first, then Hermes sessions
 */
export async function getChatHistory(
  supabaseUrl: string,
  supabaseKey: string,
  workspaceId: string,
  limit = 50
) {
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // First try Supabase
  const { data: threads, error } = await supabase
    .from('chat_threads')
    .select(`
      id,
      title,
      created_at,
      chat_messages (
        id,
        role,
        content,
        created_at
      )
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!error && threads && threads.length > 0) {
    return { source: 'supabase', threads }
  }
  
  // Fallback to Hermes sessions
  const sessions = await getHermesSessions()
  return { source: 'hermes', sessions }
}
