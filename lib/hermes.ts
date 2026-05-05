/**
 * Hermes API Client
 * Handles all communication with Hermes Gateway on user VPS instances
 */

export interface HermesStatus {
  version: string;
  release_date: string;
  hermes_home: string;
  config_path: string;
  env_path: string;
  config_version: number;
  latest_config_version: number;
  gateway_running: boolean;
  gateway_pid: number;
  gateway_health_url: string | null;
  gateway_state: string;
  gateway_platforms: {
    telegram?: {
      state: string;
      updated_at: string;
      error_code: string | null;
      error_message: string | null;
    };
    whatsapp?: {
      state: string;
      updated_at: string;
      error_code: string | null;
      error_message: string | null;
    };
  };
  gateway_exit_reason: string | null;
  gateway_updated_at: string;
  active_sessions: number;
}

export interface HermesSession {
  id: string;
  title: string;
  preview: string;
  last_active: string;
  source: 'cli' | 'telegram' | 'whatsapp' | 'dashboard';
  message_count: number;
}

export interface HermesChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface HermesChatResponse {
  message: HermesChatMessage;
  session_id: string;
}

/**
 * Hermes API Client class
 */
export class HermesClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    // Ensure URL doesn't have trailing slash
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;
  }

  /**
   * Get the session token from the dashboard HTML
   * Used when token is not explicitly provided
   */
  async getSessionToken(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/`);
    const html = await response.text();
    const match = html.match(/window\.__HERMES_SESSION_TOKEN__="([^"]+)"/);
    if (!match) {
      throw new Error('Could not extract session token from dashboard');
    }
    return match[1];
  }

  /**
   * Get Hermes status and health
   */
  async getStatus(): Promise<HermesStatus> {
    const response = await fetch(`${this.baseUrl}/api/status`, {
      headers: {
        'X-Session-Token': this.token,
      },
    });

    if (!response.ok) {
      throw new Error(`Hermes status check failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Check if Hermes is running and healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      const status = await this.getStatus();
      return status.gateway_running && status.gateway_state === 'running';
    } catch {
      return false;
    }
  }

  /**
   * Get list of sessions
   */
  async getSessions(): Promise<HermesSession[]> {
    // Note: The actual API may require different endpoints
    // This is based on hermes sessions list command output
    const response = await fetch(`${this.baseUrl}/api/sessions`, {
      headers: {
        'X-Session-Token': this.token,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get sessions: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Send a chat message and get response (streaming)
   */
  async sendChat(message: string, sessionId?: string): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': this.token,
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat failed: ${response.status}`);
    }

    return response;
  }

  /**
   * Send a chat message and get streaming response
   */
  async sendChatStream(
    message: string,
    onChunk: (text: string) => void,
    sessionId?: string
  ): Promise<string> {
    const response = await this.sendChat(message, sessionId);
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let sessionIdResponse = '';

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
      onChunk(chunk);

      // Try to extract session ID from chunk if available
      const sessionMatch = chunk.match(/"session_id"\s*:\s*"([^"]+)"/);
      if (sessionMatch) {
        sessionIdResponse = sessionMatch[1];
      }
    }

    return sessionIdResponse;
  }

  /**
   * Get chat history for a session
   */
  async getChatHistory(sessionId: string): Promise<HermesChatMessage[]> {
    const response = await fetch(
      `${this.baseUrl}/api/sessions/${sessionId}/messages`,
      {
        headers: {
          'X-Session-Token': this.token,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get chat history: ${response.status}`);
    }

    return response.json();
  }
}

/**
 * Create a Hermes client from VPS instance record
 */
export function createHermesClient(vpsUrl: string, token?: string): HermesClient {
  // Ensure URL has protocol
  const baseUrl = vpsUrl.startsWith('http') ? vpsUrl : `http://${vpsUrl}`;
  return new HermesClient(baseUrl, token || '');
}

/**
 * Factory function for creating Hermes client from database record
 */
export async function createHermesClientFromDB(
  hermesUrl: string,
  token?: string | null
): Promise<HermesClient> {
  const client = createHermesClient(hermesUrl, token || undefined);

  // If no token provided, try to get from dashboard
  if (!token) {
    try {
      const sessionToken = await client.getSessionToken();
      return new HermesClient(hermesUrl, sessionToken);
    } catch (error) {
      console.error('Failed to get session token:', error);
      throw new Error('No Hermes session token available');
    }
  }

  return client;
}

/**
 * Check VPS health and update status
 */
export async function checkVPSHealth(
  hermesUrl: string,
  token?: string
): Promise<{ online: boolean; status: HermesStatus | null; error?: string }> {
  try {
    const client = createHermesClient(hermesUrl, token);
    const status = await client.getStatus();
    return {
      online: status.gateway_running,
      status,
    };
  } catch (error) {
    return {
      online: false,
      status: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Parse Hermes session list from text output
 */
export function parseSessionsList(output: string): HermesSession[] {
  const lines = output.trim().split('\n');
  const sessions: HermesSession[] = [];

  // Skip header and separator lines
  for (const line of lines) {
    if (line.startsWith('─') || line.startsWith('Title')) continue;

    // Parse: Title | Preview | Last Active | ID
    const parts = line.split(/\s{2,}/);
    if (parts.length >= 4) {
      sessions.push({
        id: parts[parts.length - 1].trim(),
        title: parts[0].trim(),
        preview: parts[1].trim(),
        last_active: parts[2].trim(),
        source: 'cli', // Default, would need to parse from session data
        message_count: 0,
      });
    }
  }

  return sessions;
}
