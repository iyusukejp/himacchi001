export function BottomNav({ screen, onChange }) {
  const items = [
    {
      id: 'calendar', label: 'カレンダー',
      icon: active => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={active ? '#4F86F7' : '#9BA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="3"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
    {
      id: 'group', label: 'グループ',
      icon: active => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={active ? '#4F86F7' : '#9BA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="7" r="4"/>
          <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          <path d="M21 21v-2a4 4 0 0 0-3-3.87"/>
        </svg>
      ),
    },
    {
      id: 'profile', label: 'マイページ',
      icon: active => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={active ? '#4F86F7' : '#9BA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      ),
    },
  ]

  return (
    <div style={{
      display: 'flex',
      background: '#fff',
      borderTop: '1px solid #F0F2F5',
      paddingBottom: 'env(safe-area-inset-bottom)',
      flexShrink: 0,
    }}>
      {items.map(item => {
        const active = screen === item.id
        return (
          <button
            key={item.id}
            className="tap"
            onClick={() => onChange(item.id)}
            style={{
              flex: 1, padding: '10px 0 8px',
              border: 'none', background: 'transparent',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4,
            }}
          >
            {item.icon(active)}
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 500,
              color: active ? '#4F86F7' : '#9BA3AF',
            }}>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
