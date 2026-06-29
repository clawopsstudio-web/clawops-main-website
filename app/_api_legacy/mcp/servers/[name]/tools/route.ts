import { NextResponse } from 'next/server'

// Known MCP server tool schemas (pre-configured for servers we know about)
const KNOWN_SERVERS: Record<string, any> = {
  'n8n-google': {
    tools: [
      { name: 'Get_many_messages_in_Gmail', description: 'List recent Gmail messages', inputSchema: { properties: { Simplify: { type: 'boolean' } } } },
      { name: 'Send_a_message_in_Gmail', description: 'Send an email', inputSchema: { properties: { To: { type: 'string' }, Subject: { type: 'string' }, Message: { type: 'string' } } } },
      { name: 'Get_many_events_in_Google_Calendar', description: 'List calendar events', inputSchema: { properties: {} } },
      { name: 'Create_an_event_in_Google_Calendar', description: 'Create a calendar event', inputSchema: { properties: {} } },
      { name: 'Search_files_and_folders_in_Google_Drive', description: 'Search files in Google Drive', inputSchema: { properties: { Search_Query: { type: 'string' }, Return_All: { type: 'boolean' } } } },
      { name: 'Upload_file_in_Google_Drive', description: 'Upload a file to Google Drive', inputSchema: { properties: { Input_Data_Field_Name: { type: 'string' }, Parent_Drive: { type: 'string' }, Parent_Folder: { type: 'string' } } } },
      { name: 'Create_a_document_in_Google_Docs', description: 'Create a Google Doc', inputSchema: { properties: { Title: { type: 'string' } } } },
      { name: 'Get_a_document_in_Google_Docs', description: 'Read a Google Doc', inputSchema: { properties: { Doc_ID_or_URL: { type: 'string' } } } },
      { name: 'Create_sheet_in_Google_Sheets', description: 'Create a Google Sheet', inputSchema: { properties: { Document: { type: 'string' }, Title: { type: 'string' } } } },
      { name: 'Get_many_tasks_in_Google_Tasks', description: 'List Google Tasks', inputSchema: { properties: { Limit: { type: 'number' } } } },
      { name: 'Create_a_task_in_Google_Tasks', description: 'Create a Google Task', inputSchema: { properties: { Title: { type: 'string' } } } },
      { name: 'Get_many_videos_in_YouTube', description: 'List YouTube videos', inputSchema: { properties: { Return_All: { type: 'boolean' } } } },
    ],
  },
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params

  // Return known tools if available
  if (KNOWN_SERVERS[name]) {
    return NextResponse.json({ tools: KNOWN_SERVERS[name].tools })
  }

  // Try to load from config
  try {
    const { searchParams } = new URL(request.url)
    const baseUrl = searchParams.get('url')

    if (baseUrl) {
      // Attempt to call the MCP server's tools/list endpoint
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list',
          params: {},
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({ tools: data.result?.tools || [] })
      }
    }
  } catch {
    // Server unreachable
  }

  return NextResponse.json({ tools: [], warning: `No tool schema available for ${name}` })
}
