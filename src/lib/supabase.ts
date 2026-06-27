import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient | null {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase credentials not configured')
      return null
    }
    try {
      _supabase = createClient(supabaseUrl, supabaseAnonKey)
    } catch (e) {
      console.error('Failed to initialize Supabase:', e)
      return null
    }
  }
  return _supabase
}

// Safe accessor — returns null instead of crashing on Safari/older browsers
// Avoids Proxy which has Safari compatibility issues
export const supabase = {
  get client(): SupabaseClient | null {
    return getSupabase()
  },
  from(table: string) {
    const client = getSupabase()
    if (!client) {
      // Return a dummy query builder that won't crash
      return createNoopQueryBuilder()
    }
    try {
      return client.from(table)
    } catch (e) {
      console.error(`Supabase from(${table}) error:`, e)
      return createNoopQueryBuilder()
    }
  },
}

// No-op query builder that safely returns empty results instead of crashing
function createNoopQueryBuilder() {
  const noop = () => noopBuilder
  const noopBuilder = {
    select: noop,
    insert: noop,
    update: noop,
    delete: noop,
    upsert: noop,
    eq: noop,
    neq: noop,
    ilike: noop,
    order: noop,
    range: noop,
    limit: noop,
    single: noop,
    then: (resolve: (value: unknown) => void) => resolve({ data: null, error: { message: 'Supabase not available' }, count: 0 }),
    catch: (resolve: (value: unknown) => void) => resolve({ data: null, error: { message: 'Supabase not available' }, count: 0 }),
  }
  return noopBuilder
}
