import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

// グループ一覧取得
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

// グループ作成
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

// 招待コードでグループをプレビュー
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

  await supabase
    .from('members')
    .upsert({ group_id: group.id, user_id: user.id, name: user.name, emoji: user.emoji, color: user.color },
             { onConflict: 'group_id,user_id' })

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

// 空き日トグル
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

// ユーザープロフィールをSupabaseに保存（復元コード用）
export async function saveUserProfile(user) {
  await supabase.from('users').upsert({
    id: user.id,
    name: user.name,
    emoji: user.emoji,
    color: user.color,
    restore_code: user.restoreCode,
  }, { onConflict: 'id' })
}

// 復元コードでユーザーを検索
export async function getUserByRestoreCode(code) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('restore_code', code.toUpperCase().trim())
    .single()
  if (error) throw new Error('復元コードが見つかりません')
  return { id: data.id, name: data.name, emoji: data.emoji, color: data.color, restoreCode: data.restore_code }
}

// ユーザーが参加しているグループIDを取得
export async function fetchUserGroupIds(userId) {
  const { data, error } = await supabase
    .from('members')
    .select('group_id')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []).map(m => m.group_id)
}

// メンバーテーブルのプロフィールを更新
export async function updateMemberProfile(user) {
  await supabase
    .from('members')
    .update({ name: user.name, emoji: user.emoji })
    .eq('user_id', user.id)
}

// グループから退出
export async function leaveGroup(groupId, userId) {
  await supabase.from('availability').delete()
    .eq('group_id', groupId).eq('user_id', userId)
  await supabase.from('members').delete()
    .eq('group_id', groupId).eq('user_id', userId)
}
