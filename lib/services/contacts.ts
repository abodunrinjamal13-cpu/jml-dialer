import { createClient } from '@/lib/supabase/client'

export async function getContacts(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createContact(contactData: {
  name: string
  phone: string
  email?: string
  company?: string
  notes?: string
  user_id: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('contacts')
    .insert([contactData])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateContact(id: string, updates: Partial<{
  name: string
  phone: string
  email: string
  company: string
  favorite: boolean
  notes: string
}>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('contacts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteContact(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}