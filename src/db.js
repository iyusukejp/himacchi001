import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

// グループ一覧取得（IDの配列から）
export async function fetchGroups(groupIds) {
  if (!groupIds.length) return []
  const { data, error } = await supabase
    .from('groups')
    .select('*, members(*)')
    .in('id', groupIds)
    .order('created_at')
  if (error) throw error
  return data ?? []
}

// グループ作成（自分をメンバーとして追加）
export async function createGroup(name, user) {
  const { data: group, error: ge } = await supabase
    .from('groups')
    .insert({ name })
    .select()
    .single()
  if (ge) throw ge

  const { error: me } = await supabase
    .from('members')
    .insert({ group_id: group.id, user_id: user.id, name: user.name, emoji: user.emoji, color: user.color })
  if (me) throw me

  return { ...group, members: [{ user_id: user.id, name: user.name, emoji: user.emoji, color: user.color }] }
}

// 招待コードでグループをプレビュー（参加なし）
export async function previewGroup(code) {
  const { data, error } = await supabase
    .from('groups')
    .select('id, name, invite_code')
    .eq('invite_code', code.toLowerCase())
    .single()
  if (error) throw new Error('招待リンクが無効または期限切れです')
  return data
}

// 招待コードでグループに参加
export async function joinByCode(code, user) {
  const group = await previewGroup(code)

  // 既に参加済みでも upsert でエラーにならない
  await supabase
    .from('members')
    .upsert({ group_id: group.id, user_id: user.id, name: user.name, emoji: user.emoji, color: user.color },
             { onConflict: 'group_id,user_id' })

  // メンバー付きで返す
  const { data, error } = await supabase
    .from('groups')
    .select('*, members(*)')
    .eq('id', group.id)
    .single()
  if (error) throw error
  return data
}

// 月の空き日取得
export async function fetchAvailability(groupId, year, month) {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const last = new Date(year, month, 0).getDate()
  const to   = `${year}-${String(month).padStart(2, '0')}-${String(last).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('availability')
    .select('user_id, date')
    .eq('group_id', groupId)
    .gte('date', from)
    .lte('date', to)
  if (error) throw error
  return data ?? []
}

// 空き日トグル（楽観的更新 → 呼び出し元で処理）
export async function toggleAvailability(groupId, userId, dateStr) {
  const { data: existing } = await supabase
    .from('availability')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .eq('date', dateStr)
    .maybeSingle()

  if (existing) {
    await supabase.from('availability').delete()
      .eq('group_id', groupId).eq('user_id', userId).eq('date', dateStr)
    return false
  } else {
    await supabase.from('availability')
      .insert({ group_id: groupId, user_id: userId, date: dateStr })
    return true
  }
}
