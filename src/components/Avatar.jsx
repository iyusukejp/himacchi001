export function Avatar({ user, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: user.color + '18',
      border: `2px solid ${user.color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.44,
    }}>
      {user.emoji}
    </div>
  )
}
