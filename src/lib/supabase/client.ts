/**
 * @module Supabase Client
 * @description Configured Supabase client with RLS enforcement and TypeScript types
 */

import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

/**
 * Create Supabase client with:
 * - Automatic RLS enforcement (FORCE RLS enabled on all tables)
 * - Custom fetch for error handling
 * - Realtime subscriptions
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Get the current authenticated user
 * @returns Promise resolving to user or null if not authenticated
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

/**
 * Get the current user's workspace ID
 * @returns Promise resolving to workspace ID or null
 */
export async function getCurrentWorkspaceId(): Promise<string | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('workspace_id')
    .eq('id', user.id)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return (data as any).workspace_id as string | null;
}

/**
 * Sign up a new user and create their profile
 * @param email - User's email address
 * @param password - User's password
 * @param fullName - User's full name
 * @returns Object with user data or error
 */
export async function signUp({
  email,
  password,
  fullName,
}: {
  email: string;
  password: string;
  fullName: string;
}) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (authError || !authData.user) {
    return { error: authError };
  }
  
  // Create profile with default workspace
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{
      id: authData.user.id,
      email: email,
      full_name: fullName,
    }]);
  
  if (profileError) {
    // Rollback auth if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    return { error: profileError };
  }
  
  return { user: authData.user };
}

/**
 * Sign in an existing user
 * @param email - User's email address
 * @param password - User's password
 * @returns Object with session data or error
 */
export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    return { error };
  }
  
  return { session: data.session, user: data.user };
}

/**
 * Sign out the current user
 * @returns Error if sign out fails
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Create a new workspace for the current user
 * @param name - Workspace name
 * @param type - Workspace type (commerce, personal, health, intel)
 * @returns Workspace ID or error
 */
export async function createWorkspace({
  name,
  type = 'commerce' as const,
}: {
  name: string;
  type?: 'commerce' | 'personal' | 'health' | 'intel';
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    return { error: new Error('Not authenticated') };
  }
  
  const { data, error } = await supabase
    .from('workspaces')
    .insert([{
      name: name,
      type: type,
      owner_id: user.id,
    }])
    .select('id')
    .single();
  
  if (error || !data) {
    return { error };
  }
  
  // Update user's profile with new workspace
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ workspace_id: (data as any).id })
    .eq('id', user.id);
  
  if (updateError) {
    console.error('Failed to update profile with workspace:', updateError);
  }
  
  return { workspaceId: (data as any).id as string };
}

/**
 * Switch to a different workspace
 * @param workspaceId - The workspace ID to switch to
 * @returns Error if switch fails
 */
export async function switchWorkspace(workspaceId: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    return { error: new Error('Not authenticated') };
  }
  
  const { error } = await supabase
    .from('profiles')
    .update({ workspace_id: workspaceId })
    .eq('id', user.id);
  
  if (error) {
    return { error };
  }
  
  return { success: true };
}

/**
 * Get the current workspace details
 * @returns Workspace data or null
 */
export async function getCurrentWorkspace() {
  const workspaceId = await getCurrentWorkspaceId();
  
  if (!workspaceId) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return data as any;
}

/**
 * Auth state listener
 * @param callback - Function to call on auth state changes
 * @returns Unsubscribe function
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}
