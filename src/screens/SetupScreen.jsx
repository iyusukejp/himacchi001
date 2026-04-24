import { useState } from 'react'
import { createUser, restoreUser, saveGroupId } from '../user'
import { getUserByRestoreCode, fetchUserGroupIds, fetchGroups } from '../db'

const EMOJIS = ['😊','😎','🌸','⚡','❄️','🌈','🎯','🦊','🐧','🎸','🌺','🍀','🦁','🐸','🦋','🎪']

export function SetupScreen({ onComplete }) {
  const [mode, setMode]   = useState('new') // 'new' | 'restore'
  const [name, setName]   = useState('')
  const [emoji, setEmoji] = useState('😊')
  const [code, setCode]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!name.trim()) return
    const user = createUser(name.trim(), emoji)
    onComplete(user, null)
  }

  async function handleRestore() {
    if (!code.trim()) return
    setLoading(true); setError('')
    try {
      const user = await getUserByRestoreCode(code.trim())
      restoreUser(user)
      const groupIds = await fetchUserGroupIds(user.id)
      groupIds.forEach(saveGroupId)
      const groups = groupIds.length ? await fetchGroups(groupIds) : []
      onComplete(user, groups)
    } catch (e) {
      setError(e.message || '復元コードが正しくありません')
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', padding: '0 24px' }}>
      <div style={{ height: 'env(safe-area-inset-top)' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 32 }}>

        {mode === 'new' ? (
          <>
            <div style={{ fontSize: 40, marginBottom: 10 }}>👋</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A1D23', marginBottom: 6 }}>暇っちへようこそ</h1>
            <p style={{ fontSize: 14, color: '#9BA3AF', marginBottom: 36, lineHeight: 1.6 }}>
              まず、あなたのプロフィールを設定しましょう
            </p>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#B0B4BE', letterSpacing: '0.8px', marginBottom: 10 }}>
                アイコンを選択
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, padding: '12px', background: '#F7F8FA', borderRadius: 14 }}>
                {EMOJIS.map(e => (
                  <button key={e} className="tap" onClick={() => setEmoji(e)} style={{
                    fontSize: 26, padding: '6px 0',
                    background: emoji === e ? '#EFF4FF' : 'transparent',
                    border: `2px solid ${emoji === e ? '#4F86F7' : 'transparent'}`,
                    borderRadius: 10,
                  }}>{e}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#B0B4BE', letterSpacing: '0.8px', marginBottom: 10 }}>
                ニックネーム
              </div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="例: 田中太郎"
                maxLength={20}
                style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E4E6EB', borderRadius: 14, fontSize: 16, color: '#1A1D23', outline: 'none', background: '#FAFAFA' }}
              />
            </div>

            <button className="tap" onClick={handleSubmit} disabled={!name.trim()} style={{
              width: '100%', padding: '16px', borderRadius: 14, border: 'none',
              background: name.trim() ? '#4F86F7' : '#E4E6EB',
              color: name.trim() ? '#fff' : '#B0B4BE',
              fontWeight: 700, fontSize: 16, marginBottom: 16,
            }}>
              はじめる →
            </button>

            <button onClick={() => { setMode('restore'); setError('') }} style={{ background: 'none', border: 'none', fontSize: 14, color: '#9BA3AF', padding: '8px', textAlign: 'center' }}>
              以前使っていた？復元コードで引き継ぐ
            </button>
          </>
        ) : (
          <>
            <button onClick={() => { setMode('new'); setError('') }} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', fontSize: 14, color: '#9BA3AF', padding: '4px 0', fontWeight: 600, marginBottom: 20 }}>← 戻る</button>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔑</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1D23', marginBottom: 6 }}>データを引き継ぐ</h1>
            <p style={{ fontSize: 14, color: '#9BA3AF', marginBottom: 32, lineHeight: 1.6 }}>
              マイページに表示されている6桁の復元コードを入力してください
            </p>

            <input
              autoFocus
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleRestore()}
              placeholder="例: AB12CD"
              maxLength={6}
              style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E4E6EB', borderRadius: 14, fontSize: 24, letterSpacing: '6px', textAlign: 'center', outline: 'none', background: '#FAFAFA', marginBottom: 12 }}
            />
            {error && <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</div>}

            <button className="tap" onClick={handleRestore} disabled={loading || code.length < 6} style={{
              width: '100%', padding: '16px', borderRadius: 14, border: 'none',
              background: code.length === 6 ? '#4F86F7' : '#E4E6EB',
              color: code.length === 6 ? '#fff' : '#B0B4BE',
              fontWeight: 700, fontSize: 16, opacity: loading ? 0.6 : 1,
            }}>
              {loading ? '確認中...' : 'データを引き継ぐ'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
