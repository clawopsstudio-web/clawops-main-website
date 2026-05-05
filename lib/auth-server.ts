import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * Get user ID from request using Supabase auth
 */
export async function getUserIdFromRequest(
  request: NextRequest
): Promise<string | null> {
  try {
    // Try to get from cookie first
    const accessToken = request.cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      // Try Authorization header
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        
        // Verify the token
        const supabase = createServerClient();
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
          return null;
        }
        
        return user.id;
      }
      
      return null;
    }

    // Verify the access token
    const supabase = createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return null;
    }

    return user.id;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

/**
 * Require authentication - returns error response if not authenticated
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ userId: string } | NextResponse> {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  return { userId };
}

/**
 * Get workspace for authenticated user
 */
export async function getUserWorkspace(userId: string) {
  const supabase = createServerClient();

  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (error || !workspace) {
    return null;
  }

  return workspace;
}

/**
 * Verify workspace access for user
 */
export async function verifyWorkspaceAccess(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  const supabase = createServerClient();

  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select('id')
    .eq('user_id', userId)
    .eq('id', workspaceId)
    .single();

  return !error && !!workspace;
}

/**
 * Create slug from string
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

/**
 * Generate random string for API keys
 */
export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'sk_';
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Hash API key (for storage)
 */
export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
