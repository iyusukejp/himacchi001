import { useState } from 'react'
import { Avatar } from '../components/Avatar'
import { createGroup, joinByCode, leaveGroup } from '../db'
import { saveGroupId } from '../user'

export function GroupScreen({ user, groups, currentGroupId, onGroupAdded, onSwitchGroup }) {
  const [mode, setMode]         = useState('list')
  const [groupName, setGroupName] = useState('')
  const [code, setCode]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [copied, setCopied]     = useState(null) // group id
  const [removing, setRemoving] = useState(null) // { groupId, userId }

  function getInviteUrl(group) {
    return `${window.location.origin}${window.location.pathname}?code=${group.invite_code}`
  }

  async function handleRemoveMember(groupId, memberId, memberName) {
    if (!confirm(`「${memberName}」をグループから削除しますか？`)) return
    setRemoving({ groupId, userId: memberId })
    try {
      await leaveGroup(groupId, memberId)
      onGroupAdded({ ...groups.find(g => g.id === groupId), members: groups.find(g => g.id === groupId)?.members.filter(m => m.user_id !== memberId) })
    } catch { alert('削除に失敗しました') }
    setRemoving(null)
  }

  function copyInvite(group) {
    navigator.clipboard.writeText(getInviteUrl(group)).then(() => {
      setCopied(group.id)
      setTimeout(() => setCopied(null), 2500)
    })
  }

  async function handleCreate() {
    if (!groupName.trim()) return
    setLoading(true); setError('')
    try {
      const group = await createGroup(groupName.trim(), user)
      saveGroupId(group.id)
      onGroupAdded(group)
      setGroupName(''); setMode('list')
    } catch { setError('グループの作成に失敗しました') }
    setLoading(false)
  }

  async function handleJoin() {
    if (!code.trim()) return
    setLoading(true); setError('')
    try {
      const group = await joinByCode(code.trim(), user)
      saveGroupId(group.id)
      onGroupAdded(group)
      setCode(''); setMode('list')
    } catch (e) { setError(e.message || '招待コードが見つかりませんでした') }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F7F8FA' }}>
      <div style={{ height: 'env(safe-area-inset-top)', background: '#fff' }} />

      {/* ヘッダー */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderBottom: '1px solid #F0F2F5' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1D23' }}>グループ管理</div>
        {mode === 'list' ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="tap" onClick={() => setMode('join')} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #E4E6EB', background: '#fff', fontSize: 13, fontWeight: 600, color: '#6B7280' }}>
              コードで参加
            </button>
            <button className="tap" onClick={() => setMode('create')} style={{ padding: '8px 12px', borderRadius: 10, border: 'none', background: '#4F86F7', fontSize: 13, fontWeight: 700, color: '#fff' }}>
              + 作成
            </button>
          </div>
        ) : (
          <button onClick={() => { setMode('list'); setError('') }} style={{ background: 'none', border: 'none', fontSize: 14, color: '#9BA3AF', fontWeight: 600 }}>
            キャンセル
          </button>
        )}
      </div>

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>

        {/* グループ一覧 */}
        {mode === 'list' && (
          <>
            {groups.map(g => {
              const isActive = g.id === currentGroupId
              const isCopied = copied === g.id
              return (
                <div key={g.id} style={{
                  background: '#fff', borderRadius: 16,
                  border: isActive ? '2px solid #4F86F730' : '1px solid #ECEEF2',
                  marginBottom: 12, overflow: 'hidden',
                }}>
                  {/* グループヘッダー */}
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1D23' }}>{g.name}</div>
                      <div style={{ fontSize: 12, color: '#9BA3AF', marginTop: 2 }}>{g.members?.length ?? 0}人のメンバー</div>
                    </div>
                    {isActive
                      ? <span style={{ fontSize: 11, fontWeight: 700, color: '#4F86F7', background: '#EFF4FF', borderRadius: 8, padding: '4px 8px' }}>表示中</span>
                      : <button className="tap" onClick={() => onSwitchGroup(g.id)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #E4E6EB', background: '#F7F8FA', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>表示</button>
                    }
                  </div>

                  {/* メンバー一覧 */}
                  {g.members?.map(m => {
                    const isRemoving = removing?.groupId === g.id && removing?.userId === m.user_id
                    return (
                      <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderTop: '1px solid #F7F8FA' }}>
                        <Avatar user={m} size={32} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1D23', flex: 1 }}>{m.name}</span>
                        {m.user_id === user.id
                          ? <span style={{ fontSize: 10, color: '#9BA3AF', background: '#F0F2F5', borderRadius: 6, padding: '2px 6px' }}>あなた</span>
                          : <button className="tap" onClick={() => handleRemoveMember(g.id, m.user_id, m.name)} disabled={isRemoving} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #FECACA', background: '#FFF5F5', fontSize: 11, fontWeight: 600, color: '#EF4444', opacity: isRemoving ? 0.5 : 1 }}>
                              {isRemoving ? '...' : '削除'}
                            </button>
                        }
                      </div>
                    )
                  })}

                  {/* 招待ボタン */}
                  <div style={{ padding: '12px 16px', borderTop: '1px solid #F7F8FA', background: '#F7F8FA' }}>
                    <div style={{ fontSize: 11, color: '#B0B4BE', marginBottom: 8 }}>招待リンクを共有してメンバーを追加</div>
                    <button
                      className="tap"
                      onClick={() => copyInvite(g)}
                      style={{
                        width: '100%', padding: '11px',
                        borderRadius: 10, border: 'none',
                        background: isCopied ? '#DCFCE7' : '#4F86F7',
                        color: isCopied ? '#16A34A' : '#fff',
                        fontWeight: 700, fontSize: 13,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      {isCopied ? '✓ コピーしました!' : '🔗 招待リンクをコピー'}
                    </button>
                  </div>
                </div>
              )
            })}

            {groups.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 24px', color: '#C8CDD8' }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>👥</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>グループがありません</div>
                <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>グループを作成して友達を招待しよう</div>
              </div>
            )}
          </>
        )}

        {/* グループ作成フォーム */}
        {mode === 'create' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D23' }}>グループを作成</h2>
            <input
              autoFocus
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="グループ名を入力"
              style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E4E6EB', borderRadius: 14, fontSize: 15, outline: 'none', background: '#fff' }}
            />
            {error && <div style={{ color: '#EF4444', fontSize: 13 }}>{error}</div>}
            <button className="tap" onClick={handleCreate} disabled={loading || !groupName.trim()} style={{
              padding: '15px', borderRadius: 14, border: 'none',
              background: groupName.trim() ? '#4F86F7' : '#E4E6EB',
              color: groupName.trim() ? '#fff' : '#B0B4BE',
              fontWeight: 700, fontSize: 15,
            }}>
              {loading ? '作成中...' : '作成する'}
            </button>
          </div>
        )}

        {/* 招待コード入力フォーム */}
        {mode === 'join' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D23' }}>招待コードで参加</h2>
            <p style={{ fontSize: 14, color: '#9BA3AF', lineHeight: 1.6 }}>友達から受け取った招待リンクのコードを入力してください</p>
            <input
              autoFocus
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              placeholder="例: ab12cd34"
              maxLength={8}
              style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E4E6EB', borderRadius: 14, fontSize: 18, outline: 'none', letterSpacing: '3px', textAlign: 'center', background: '#fff' }}
            />
            {error && <div style={{ color: '#EF4444', fontSize: 13 }}>{error}</div>}
            <button className="tap" onClick={handleJoin} disabled={loading || !code.trim()} style={{
              padding: '15px', borderRadius: 14, border: 'none',
              background: code.trim() ? '#4F86F7' : '#E4E6EB',
              color: code.trim() ? '#fff' : '#B0B4BE',
              fontWeight: 700, fontSize: 15,
            }}>
              {loading ? '参加中...' : '参加する'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
