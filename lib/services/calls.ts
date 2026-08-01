import { supabase } from '@/lib/supabase/client'

export async function getCallHistory(userId: string) {
  const { data, error } = await supabase
    .from('call_history')
    .select('*, contacts(name, company)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createCallRecord(callData: {
  user_id: string
  contact_id?: string
  phone_number: string
  direction: 'inbound' | 'outbound'
  status: string
  twilio_sid?: string
}) {
  const { data, error } = await supabase
    .from('call_history')
    .insert([{ ...callData, started_at: new Date().toISOString() }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCallDuration(id: string, duration: number, status: string) {
  const { data, error } = await supabase
    .from('call_history')
    .update({ 
      duration, 
      status, 
      ended_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCallRecord(id: string) {
  const { error } = await supabase
    .from('call_history')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}