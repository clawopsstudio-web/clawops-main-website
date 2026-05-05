import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Create Supabase client for server-side operations
 * Uses SERVICE_ROLE key for admin operations
 */
export function createServerClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Create Supabase client for authenticated user operations
 * Uses the user's session from cookies
 */
export async function createServerClientWithAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value;

  if (!accessToken) {
    return null;
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}

/**
 * Get current user from request
 */
export async function getUser() {
  const supabase = await createServerClientWithAuth();
  if (!supabase) {
    return null;
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Get workspace for current user
 */
export async function getUserWorkspace() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const supabase = createServerClient();
  
  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (error || !workspace) {
    return null;
  }

  return workspace;
}

/**
 * Get VPS instance for workspace
 */
export async function getWorkspaceVPS(workspaceId: string) {
  const supabase = createServerClient();
  
  const { data: vps, error } = await supabase
    .from('vps_instances')
    .select('*')
    .eq('workspace_id', workspaceId)
    .limit(1)
    .single();

  if (error || !vps) {
    return null;
  }

  return vps;
}
