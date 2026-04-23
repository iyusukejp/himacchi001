import { useState } from 'react'
import { createUser } from '../user'

const EMOJIS = ['😊','😎','🌸','⚡','❄️','🌈','🎯','🦊','🐧','🎸','🌺','🍀','🦁','🐸','🦋','🎪']

export function SetupScreen({ onComplete }) {
  const [name, setName]   = useState('')
  const [emoji, setEmoji] = useState('😊')

  function handleSubmit() {
    if (!name.trim()) return
    const user = createUser(name.trim(), emoji)
    onComplete(user)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#fff', padding: '0 24px',
    }}>
      <div style={{ height: 'env(safe-area-inset-top)' }} />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', paddingBottom: 32,
      }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>👋</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A1D23', marginBottom: 6 }}>
          暇っちへようこそ
        </h1>
        <p style={{ fontSize: 14, color: '#9BA3AF', marginBottom: 36, lineHeight: 1.6 }}>
          まず、あなたのプロフィールを設定しましょう
        </p>

        {/* 絵文字選択 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#B0B4BE', letterSpacing: '0.8px', marginBottom: 10 }}>
            アイコンを選択
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6,
            padding: '12px', background: '#F7F8FA', borderRadius: 14,
          }}>
            {EMOJIS.map(e => (
              <button
                key={e}
                className="tap"
                onClick={() => setEmoji(e)}
                style={{
                  fontSize: 26, padding: '6px 0',
                  background: emoji === e ? '#EFF4FF' : 'transparent',
                  border: `2px solid ${emoji === e ? '#4F86F7' : 'transparent'}`,
                  borderRadius: 10,
                }}
              >{e}</button>
            ))}
          </div>
        </div>

        {/* ニックネーム */}
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
            style={{
              width: '100%', padding: '14px 16px',
              border: '1.5px solid #E4E6EB', borderRadius: 14,
              fontSize: 16, color: '#1A1D23', outline: 'none',
              background: '#FAFAFA',
            }}
          />
        </div>

        <button
          className="tap"
          onClick={handleSubmit}
          disabled={!name.trim()}
          style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none',
            background: name.trim() ? '#4F86F7' : '#E4E6EB',
            color: name.trim() ? '#fff' : '#B0B4BE',
            fontWeight: 700, fontSize: 16,
          }}
        >
          はじめる →
        </button>
      </div>
    </div>
  )
}
