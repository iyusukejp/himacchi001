const USER_KEY   = 'himacchi_user'
const GROUPS_KEY = 'himacchi_groups'

const COLORS = [
  '#4F86F7','#F4645F','#E066A8','#F0A500',
  '#3ABCA8','#8B5CF6','#10B981','#F97316',
]

function colorFromId(id) {
  const n = parseInt(id.replace(/-/g, '').slice(0, 8), 16)
  return COLORS[n % COLORS.length]
}

function genRestoreCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function createUser(name, emoji) {
  const id = crypto.randomUUID()
  const user = { id, name, emoji, color: colorFromId(id), restoreCode: genRestoreCode() }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

export function updateUser(updates) {
  const user = getUser()
  if (!user) return null
  const updated = { ...user, ...updates }
  localStorage.setItem(USER_KEY, JSON.stringify(updated))
  return updated
}

export function restoreUser(userData) {
  localStorage.setItem(USER_KEY, JSON.stringify(userData))
  return userData
}

export function getSavedGroupIds() {
  try {
    const raw = localStorage.getItem(GROUPS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveGroupId(groupId) {
  const ids = getSavedGroupIds()
  if (!ids.includes(groupId)) {
    localStorage.setItem(GROUPS_KEY, JSON.stringify([...ids, groupId]))
  }
}

export function removeGroupId(groupId) {
  const ids = getSavedGroupIds().filter(id => id !== groupId)
  localStorage.setItem(GROUPS_KEY, JSON.stringify(ids))
}
