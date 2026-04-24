import { useState } from 'react'
import { Avatar } from '../components/Avatar'

const EMOJIS = ['😊','😎','🌸','⚡','❄️','🌈','🎯','🦊','🐧','🎸','🌺','🍀','🦁','🐸','🦋','🎪']

export function ProfileScreen({ user, groups, onUserUpdate, onLeaveGroup, onShowHelp }) {
  const [editing, setEditing] = useState(false)
  const [name, setName]       = useState(user.name)
  const [emoji, setEmoji]     = useState(user.emoji)
  const [saving, setSaving]   = useState(false)
  const [copied, setCopied]   = useState(false)
  const [leavingId, setLeavingId] = useState(null)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await onUserUpdate({ ...user, name: name.trim(), emoji })
    setSaving(false)
    setEditing(false)
  }

  function handleCancelEdit() {
    setName(user.name)
    setEmoji(user.emoji)
    setEditing(false)
  }

  function copyRestoreCode() {
    navigator.clipboard.writeText(user.restoreCode ?? '').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  async function handleLeave(groupId, groupName) {
    if (!confirm(`「${groupName}」から退出しますか？\n登録した空き日も削除されます。`)) return
    setLeavingId(groupId)
    await onLeaveGroup(groupId)
    setLeavingId(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F7F8FA' }}>
      <div style={{ height: 'env(safe-area-inset-top)', background: '#fff' }} />

      {/* ヘッダー */}
      <div style={{ padding: '14px 20px', background: '#fff', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1D23' }}>マイページ</div>
        {!editing
          ? <button className="tap" onClick={() => setEditing(true)} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #E4E6EB', background: '#F7F8FA', fontSize: 13, fontWeight: 600, color: '#6B7280' }}>編集</button>
          : <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCancelEdit} style={{ background: 'none', border: 'none', fontSize: 14, color: '#9BA3AF', fontWeight: 600 }}>キャンセル</button>
              <button className="tap" onClick={handleSave} disabled={saving || !name.trim()} style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: '#4F86F7', fontSize: 13, fontWeight: 700, color: '#fff', opacity: saving ? 0.6 : 1 }}>
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
        }
      </div>

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '16px' }}>

        {/* プロフィールカード */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 12, border: '1px solid #ECEEF2' }}>
          {!editing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar user={user} size={56} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1D23' }}>{user.name}</div>
                <div style={{ fontSize: 13, color: '#9BA3AF', marginTop: 2 }}>ニックネーム</div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#B0B4BE', letterSpacing: '0.8px', marginBottom: 10 }}>アイコンを選択</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, padding: '12px', background: '#F7F8FA', borderRadius: 14, marginBottom: 16 }}>
                {EMOJIS.map(e => (
                  <button key={e} className="tap" onClick={() => setEmoji(e)} style={{
                    fontSize: 26, padding: '6px 0',
                    background: emoji === e ? '#EFF4FF' : 'transparent',
                    border: `2px solid ${emoji === e ? '#4F86F7' : 'transparent'}`,
                    borderRadius: 10,
                  }}>{e}</button>
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#B0B4BE', letterSpacing: '0.8px', marginBottom: 8 }}>ニックネーム</div>
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={20}
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E4E6EB', borderRadius: 12, fontSize: 16, outline: 'none', background: '#FAFAFA' }}
              />
            </>
          )}
        </div>

        {/* 復元コード */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', marginBottom: 12, border: '1px solid #ECEEF2' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D23', marginBottom: 4 }}>🔑 復元コード</div>
          <div style={{ fontSize: 12, color: '#9BA3AF', marginBottom: 12, lineHeight: 1.6 }}>
            別のブラウザや端末でデータを引き継ぐ時に使います。大切に保管してください。
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, background: '#F7F8FA', borderRadius: 10, padding: '12px 16px', fontSize: 22, fontWeight: 800, letterSpacing: '6px', color: '#1A1D23', textAlign: 'center', border: '1px solid #ECEEF2' }}>
              {user.restoreCode ?? '------'}
            </div>
            <button className="tap" onClick={copyRestoreCode} style={{
              padding: '12px 16px', borderRadius: 10, border: 'none',
              background: copied ? '#DCFCE7' : '#4F86F7',
              color: copied ? '#16A34A' : '#fff',
              fontWeight: 700, fontSize: 13, flexShrink: 0,
            }}>
              {copied ? '✓ コピー' : 'コピー'}
            </button>
          </div>
        </div>

        {/* 使い方ガイド */}
        <button className="tap" onClick={onShowHelp} style={{
          width: '100%', padding: '16px 20px', borderRadius: 16,
          border: '1px solid #ECEEF2', background: '#fff',
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 12, cursor: 'pointer',
        }}>
          <span style={{ fontSize: 22 }}>📖</span>
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D23' }}>使い方ガイド</div>
            <div style={{ fontSize: 12, color: '#9BA3AF', marginTop: 2 }}>ホーム画面への追加・復元コードの使い方など</div>
          </div>
          <span style={{ color: '#C8CDD8', fontSize: 18 }}>›</span>
        </button>

        {/* 参加グループ */}
        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #ECEEF2', marginBottom: 12 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F7F8FA' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D23' }}>参加中のグループ</div>
          </div>
          {groups.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#C8CDD8', fontSize: 14 }}>
              グループがありません
            </div>
          ) : (
            groups.map(g => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid #F7F8FA' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1D23' }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: '#9BA3AF', marginTop: 2 }}>{g.members?.length ?? 0}人のメンバー</div>
                </div>
                <button
                  className="tap"
                  onClick={() => handleLeave(g.id, g.name)}
                  disabled={leavingId === g.id}
                  style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #FECACA', background: '#FFF5F5', fontSize: 12, fontWeight: 600, color: '#EF4444', opacity: leavingId === g.id ? 0.5 : 1 }}
                >
                  {leavingId === g.id ? '退出中...' : '退出'}
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
