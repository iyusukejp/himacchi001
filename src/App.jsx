import { useState, useEffect } from 'react'
import { getUser, getSavedGroupIds, saveGroupId, updateUser, removeGroupId, restoreUser } from './user'
import { fetchGroups, joinByCode, previewGroup, saveUserProfile, updateMemberProfile, leaveGroup } from './db'
import { SetupScreen } from './screens/SetupScreen'
import { CalendarScreen } from './screens/CalendarScreen'
import { GroupScreen } from './screens/GroupScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { HelpScreen } from './screens/HelpScreen'
import { BottomNav } from './components/BottomNav'

// ─── 招待リンク確認画面 ───────────────────────────
function JoinScreen({ user, code, onJoined, onSkip }) {
  const [groupName, setGroupName] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [joining, setJoining]     = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    previewGroup(code)
      .then(g => { setGroupName(g.name); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [code])

  async function handleJoin() {
    setJoining(true)
    try {
      const group = await joinByCode(code, user)
      saveGroupId(group.id)
      onJoined(group)
    } catch (e) {
      setError(e.message)
      setJoining(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', padding: '0 28px' }}>
      <div style={{ height: 'env(safe-area-inset-top)' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
        {loading ? (
          <div style={{ fontSize: 14, color: '#9BA3AF' }}>読み込み中...</div>
        ) : error ? (
          <>
            <div style={{ fontSize: 44 }}>😔</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1D23' }}>{error}</div>
            <button className="tap" onClick={onSkip} style={{ padding: '14px 28px', borderRadius: 14, border: 'none', background: '#F0F2F5', color: '#6B7280', fontWeight: 700, fontSize: 14 }}>
              ホームへ戻る
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48 }}>🎉</div>
            <div style={{ fontSize: 14, color: '#9BA3AF' }}>グループへの招待が届いています</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1A1D23', lineHeight: 1.3 }}>{groupName}</div>
            <button className="tap" onClick={handleJoin} disabled={joining} style={{
              width: '100%', padding: '16px', borderRadius: 14, border: 'none',
              background: '#4F86F7', color: '#fff', fontWeight: 700, fontSize: 16,
              opacity: joining ? 0.6 : 1, marginTop: 8,
            }}>
              {joining ? '参加中...' : '参加する'}
            </button>
            <button onClick={onSkip} style={{ background: 'none', border: 'none', fontSize: 14, color: '#9BA3AF', padding: '8px' }}>
              スキップ
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── グループ未所属のホーム画面 ───────────────────
function HomeScreen({ user, onGroupJoined }) {
  const [mode, setMode]           = useState('home')
  const [groupName, setGroupName] = useState('')
  const [code, setCode]           = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  async function handleCreate() {
    if (!groupName.trim()) return
    setLoading(true); setError('')
    try {
      const { createGroup } = await import('./db')
      const group = await createGroup(groupName.trim(), user)
      saveGroupId(group.id)
      onGroupJoined(group)
    } catch { setError('グループの作成に失敗しました') }
    setLoading(false)
  }

  async function handleJoin() {
    if (!code.trim()) return
    setLoading(true); setError('')
    try {
      const { joinByCode } = await import('./db')
      const group = await joinByCode(code.trim(), user)
      saveGroupId(group.id)
      onGroupJoined(group)
    } catch (e) { setError(e.message || '招待コードが見つかりませんでした') }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      <div style={{ height: 'env(safe-area-inset-top)' }} />
      <div style={{ padding: '24px 24px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1D23' }}>暇っち</div>
      </div>

      {mode === 'home' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>📅</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1D23', marginBottom: 8 }}>グループがありません</h2>
            <p style={{ fontSize: 14, color: '#9BA3AF', lineHeight: 1.7 }}>
              グループを作って友達に招待リンクを送るか、<br/>友達から招待コードをもらって参加しよう！
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 32 }}>
            <button className="tap" onClick={() => setMode('create')} style={{ padding: '16px', borderRadius: 14, border: 'none', background: '#4F86F7', color: '#fff', fontWeight: 700, fontSize: 16 }}>
              ＋ グループを作成する
            </button>
            <button className="tap" onClick={() => setMode('join')} style={{ padding: '16px', borderRadius: 14, border: '1.5px solid #E4E6EB', background: '#fff', color: '#1A1D23', fontWeight: 700, fontSize: 16 }}>
              招待コードで参加する
            </button>
          </div>
        </div>
      )}

      {mode === 'create' && (
        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button onClick={() => { setMode('home'); setError('') }} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', fontSize: 14, color: '#9BA3AF', padding: '4px 0', fontWeight: 600 }}>← 戻る</button>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1D23' }}>グループを作成</h2>
          <input autoFocus value={groupName} onChange={e => setGroupName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} placeholder="グループ名を入力" style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E4E6EB', borderRadius: 14, fontSize: 16, outline: 'none' }} />
          {error && <div style={{ color: '#EF4444', fontSize: 13 }}>{error}</div>}
          <button className="tap" onClick={handleCreate} disabled={loading || !groupName.trim()} style={{ padding: '16px', borderRadius: 14, border: 'none', background: groupName.trim() ? '#4F86F7' : '#E4E6EB', color: groupName.trim() ? '#fff' : '#B0B4BE', fontWeight: 700, fontSize: 16 }}>
            {loading ? '作成中...' : '作成する'}
          </button>
        </div>
      )}

      {mode === 'join' && (
        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button onClick={() => { setMode('home'); setError('') }} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', fontSize: 14, color: '#9BA3AF', padding: '4px 0', fontWeight: 600 }}>← 戻る</button>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1D23' }}>招待コードで参加</h2>
          <p style={{ fontSize: 14, color: '#9BA3AF' }}>友達から受け取った招待リンクのコードを入力</p>
          <input autoFocus value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleJoin()} placeholder="例: ab12cd34" maxLength={8} style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E4E6EB', borderRadius: 14, fontSize: 18, outline: 'none', letterSpacing: '3px', textAlign: 'center' }} />
          {error && <div style={{ color: '#EF4444', fontSize: 13 }}>{error}</div>}
          <button className="tap" onClick={handleJoin} disabled={loading || !code.trim()} style={{ padding: '16px', borderRadius: 14, border: 'none', background: code.trim() ? '#4F86F7' : '#E4E6EB', color: code.trim() ? '#fff' : '#B0B4BE', fontWeight: 700, fontSize: 16 }}>
            {loading ? '参加中...' : '参加する'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── メインアプリ ────────────────────────────────
export default function App() {
  const [user, setUser]             = useState(null)
  const [screen, setScreen]         = useState('loading')
  const [tab, setTab]               = useState('calendar')
  const [groups, setGroups]         = useState([])
  const [currentGroupId, setCurrentGroupId] = useState(null)
  const [pendingCode, setPendingCode] = useState(null)
  const [showHelp, setShowHelp]     = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code   = params.get('code')
    if (code) setPendingCode(code)

    let u = getUser()
    if (!u) { setScreen('setup'); return }
    // 旧ユーザーに復元コードがない場合は自動生成
    if (!u.restoreCode) {
      const rc = Math.random().toString(36).slice(2, 8).toUpperCase()
      u = { ...u, restoreCode: rc }
      restoreUser(u)
      saveUserProfile(u)
    }
    setUser(u)
    init(u, code)
  }, [])

  async function init(u, code) {
    if (code) { setScreen('join'); return }
    const ids = getSavedGroupIds()
    if (!ids.length) { setScreen('home'); return }
    try {
      const loaded = await fetchGroups(ids)
      setGroups(loaded)
      setCurrentGroupId(loaded[0]?.id ?? null)
      setScreen('main')
    } catch { setScreen('home') }
  }

  async function handleSetupComplete(newUser, restoredGroups = null) {
    setUser(newUser)
    saveUserProfile(newUser)  // 復元コード保存（fire & forget）
    if (restoredGroups !== null) {
      setGroups(restoredGroups)
      setCurrentGroupId(restoredGroups[0]?.id ?? null)
      setScreen(pendingCode ? 'join' : restoredGroups.length ? 'main' : 'home')
    } else {
      setScreen(pendingCode ? 'join' : 'home')
    }
  }

  async function handleGroupJoined(group) {
    setGroups(prev => {
      const exists = prev.find(g => g.id === group.id)
      return exists ? prev.map(g => g.id === group.id ? group : g) : [...prev, group]
    })
    setCurrentGroupId(group.id)
    setScreen('main')
    window.history.replaceState({}, '', window.location.pathname)
  }

  function handleGroupAdded(group) {
    setGroups(prev => {
      const exists = prev.find(g => g.id === group.id)
      return exists ? prev.map(g => g.id === group.id ? group : g) : [...prev, group]
    })
    setCurrentGroupId(group.id)
  }

  async function handleUserUpdate(updatedUser) {
    updateUser({ name: updatedUser.name, emoji: updatedUser.emoji })
    setUser(updatedUser)
    await Promise.all([
      updateMemberProfile(updatedUser),
      saveUserProfile(updatedUser),
    ])
    // グループのメンバー情報を再取得
    const ids = getSavedGroupIds()
    if (ids.length) {
      const loaded = await fetchGroups(ids)
      setGroups(loaded)
    }
  }

  async function handleLeaveGroup(groupId) {
    try {
      await leaveGroup(groupId, user.id)
      removeGroupId(groupId)
      const remaining = groups.filter(g => g.id !== groupId)
      setGroups(remaining)
      if (currentGroupId === groupId) {
        setCurrentGroupId(remaining[0]?.id ?? null)
        if (!remaining.length) setScreen('home')
      }
    } catch {
      alert('退出に失敗しました')
    }
  }

  async function handleReloadGroups() {
    const ids = getSavedGroupIds()
    if (!ids.length) return
    const loaded = await fetchGroups(ids)
    setGroups(loaded)
  }

  const currentGroup = groups.find(g => g.id === currentGroupId)

  const wrapper = children => (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', maxWidth: 480, margin: '0 auto',
      background: '#fff', boxShadow: '0 0 40px rgba(0,0,0,0.08)',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  )

  if (screen === 'loading') return wrapper(
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/icon-192.png" alt="" style={{ width: 80, height: 80, borderRadius: 20 }} />
    </div>
  )

  if (screen === 'setup') return wrapper(<SetupScreen onComplete={handleSetupComplete} />)

  if (screen === 'home') return wrapper(<HomeScreen user={user} onGroupJoined={handleGroupJoined} />)

  if (screen === 'join') return wrapper(
    <JoinScreen
      user={user} code={pendingCode}
      onJoined={handleGroupJoined}
      onSkip={() => setScreen(groups.length ? 'main' : 'home')}
    />
  )

  return wrapper(
    <>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'calendar' && (
          <CalendarScreen
            user={user}
            group={currentGroup}
            groups={groups}
            onSwitchGroup={setCurrentGroupId}
          />
        )}
        {tab === 'group' && (
          <GroupScreen
            user={user}
            groups={groups}
            currentGroupId={currentGroupId}
            onGroupAdded={handleGroupAdded}
            onSwitchGroup={id => { setCurrentGroupId(id); setTab('calendar') }}
            onReloadGroups={handleReloadGroups}
          />
        )}
        {tab === 'profile' && (
          <ProfileScreen
            user={user}
            groups={groups}
            onUserUpdate={handleUserUpdate}
            onLeaveGroup={handleLeaveGroup}
            onShowHelp={() => setShowHelp(true)}
          />
        )}
      </div>
      <BottomNav screen={tab} onChange={setTab} />
      {showHelp && <HelpScreen onClose={() => setShowHelp(false)} />}
    </>
  )
}
