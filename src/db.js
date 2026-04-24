import { createClient } from '@supabase/supabase-js'
import { COLORS } from './constants'

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

// グループ作成（作成者は最初の色）
export async function createGroup(name, user) {
  const { data: group, error: ge } = await supabase
    .from('groups')
    .insert({ name })
    .select()
    .single()
  if (ge) throw ge

  const memberColor = COLORS[0]
  const { error: me } = await supabase
    .from('members')
    .insert({ group_id: group.id, user_id: user.id, name: user.name, emoji: user.emoji, color: memberColor })
  if (me) throw me

  return { ...group, members: [{ user_id: user.id, name: user.name, emoji: user.emoji, color: memberColor }] }
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

// 招待コードでグループに参加（色が被らないよう割り当て）
export async function joinByCode(code, user) {
  const group = await previewGroup(code)

  // 既存メンバーを取得して色の重複を避ける
  const { data: existingMembers } = await supabase
    .from('members')
    .select('user_id, color')
    .eq('group_id', group.id)

  const existing = existingMembers ?? []
  const isAlreadyMember = existing.some(m => m.user_id === user.id)

  let memberColor = user.color
  if (!isAlreadyMember) {
    const usedColors = existing.map(m => m.color)
    memberColor = COLORS.find(c => !usedColors.includes(c)) ?? COLORS[existing.length % COLORS.length]
  }

  await supabase
    .from('members')
    .upsert({ group_id: group.id, user_id: user.id, name: user.name, emoji: user.emoji, color: memberColor },
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

// 月の予定取得
export async function fetchEvents(groupId, year, month) {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const last = new Date(year, month, 0).getDate()
  const to   = `${year}-${String(month).padStart(2, '0')}-${String(last).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('group_id', groupId)
    .gte('date', from)
    .lte('date', to)
    .order('created_at')
  if (error) throw error
  return data ?? []
}

// 予定追加
export async function addEvent(groupId, userId, dateStr, title) {
  const { data, error } = await supabase
    .from('events')
    .insert({ group_id: groupId, created_by: userId, date: dateStr, title })
    .select()
    .single()
  if (error) throw error
  return data
}

// 予定削除
export async function deleteEvent(eventId) {
  await supabase.from('events').delete().eq('id', eventId)
}

// ユーザープロフィールをSupabaseに保存
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

// グループのメンバー色を重複なく再割り当て
export async function reassignGroupColors(groupId) {
  const { data: members, error } = await supabase
    .from('members')
    .select('user_id')
    .eq('group_id', groupId)
    .order('joined_at')
  if (error) throw error

  for (let i = 0; i < members.length; i++) {
    await supabase.from('members')
      .update({ color: COLORS[i % COLORS.length] })
      .eq('group_id', groupId)
      .eq('user_id', members[i].user_id)
  }
}
