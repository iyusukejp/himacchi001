import { useState, useEffect } from 'react'
import { Avatar } from '../components/Avatar'
import { BottomSheet } from '../components/BottomSheet'
import { fetchAvailability, toggleAvailability, supabase } from '../db'
import { HOLIDAYS } from '../holidays'

const TODAY = new Date()
const MN = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
const DN = ['日','月','火','水','木','金','土']
const DOW_NAMES = ['日','月','火','水','木','金','土']

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function buildDays(y, m) {
  const first = new Date(y, m, 1), last = new Date(y, m+1, 0)
  const dow = first.getDay(), days = []
  for (let i = dow-1; i >= 0; i--) days.push({ date: new Date(y, m, -i), in: false })
  for (let d = 1; d <= last.getDate(); d++) days.push({ date: new Date(y, m, d), in: true })
  while (days.length < 42) days.push({ date: new Date(y, m+1, days.length-dow-last.getDate()+1), in: false })
  return days
}

// ─── 日付詳細シート ───────────────────────────────
function DaySheet({ date, av, user, members, onClose, onToggle }) {
  const dstr        = toDateStr(date)
  const freeMembers = members.filter(m => av[m.user_id]?.has(dstr))
  const isMeFree    = av[user.id]?.has(dstr)
  const holidayName = HOLIDAYS[dstr]
  const [loading, setLoading] = useState(false)

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ padding: '8px 22px' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1A1D23', letterSpacing: '-1px' }}>
            {date.getMonth()+1}月{date.getDate()}日
          </div>
          <div style={{ fontSize: 13, color: '#9BA3AF', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
            {DOW_NAMES[date.getDay()]}曜日
            {holidayName && (
              <span style={{ fontSize: 12, fontWeight: 700, color: '#EF4444', background: '#FEF2F2', borderRadius: 6, padding: '2px 8px' }}>
                🎌 {holidayName}
              </span>
            )}
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: '#B0B4BE', letterSpacing: '0.8px', marginBottom: 10 }}>
          空いている人 {freeMembers.length > 0 ? `(${freeMembers.length}人)` : ''}
        </div>

        {freeMembers.length === 0 ? (
          <div style={{ fontSize: 14, color: '#C8CDD8', padding: '12px 0 20px' }}>
            まだ誰も登録していません
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {freeMembers.map(m => (
              <div key={m.user_id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 12,
                background: '#F7F8FA', border: '1px solid #ECEEF2',
              }}>
                <Avatar user={m} size={32} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1D23' }}>{m.name}</span>
                <div style={{ marginLeft: 'auto', width: 9, height: 9, borderRadius: '50%', background: m.color }} />
              </div>
            ))}
          </div>
        )}

        <button
          className="tap"
          onClick={async () => { setLoading(true); await onToggle(date); onClose() }}
          disabled={loading}
          style={{
            width: '100%', padding: '15px', borderRadius: 14, border: 'none',
            background: isMeFree ? '#FEE2E2' : '#4F86F7',
            color: isMeFree ? '#EF4444' : '#fff',
            fontWeight: 700, fontSize: 15, opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '更新中...' : isMeFree ? '空きをキャンセルする' : 'この日を空きにする'}
        </button>
      </div>
    </BottomSheet>
  )
}

// ─── カレンダー画面 ──────────────────────────────
export function CalendarScreen({ user, group, groups, onSwitchGroup }) {
  const [month, setMonth]   = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1))
  const [av, setAv]         = useState({})
  const [selDay, setSelDay] = useState(null)
  const [loading, setLoading] = useState(true)

  const members       = group?.members ?? []
  const friendMembers = members.filter(m => m.user_id !== user.id)

  useEffect(() => {
    if (!group) return
    load(month.getFullYear(), month.getMonth())
  }, [group?.id, month])

  async function load(y, m) {
    setLoading(true)
    try {
      const rows = await fetchAvailability(group.id, y, m + 1)
      const map = {}
      rows.forEach(r => {
        if (!map[r.user_id]) map[r.user_id] = new Set()
        map[r.user_id].add(r.date)
      })
      setAv(map)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => {
    if (!group) return
    const ch = supabase
      .channel(`av-${group.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'availability',
        filter: `group_id=eq.${group.id}`,
      }, payload => {
        if (payload.eventType === 'INSERT') {
          const { user_id, date } = payload.new
          const d = new Date(date)
          if (d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth()) {
            setAv(prev => ({ ...prev, [user_id]: new Set([...(prev[user_id] ?? []), date]) }))
          }
        } else if (payload.eventType === 'DELETE') {
          const { user_id, date } = payload.old
          setAv(prev => {
            const s = new Set(prev[user_id] ?? [])
            s.delete(date)
            return { ...prev, [user_id]: s }
          })
        }
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [group?.id, month])

  async function handleToggle(date) {
    const dstr = toDateStr(date)
    setAv(prev => {
      const s = new Set(prev[user.id] ?? [])
      s.has(dstr) ? s.delete(dstr) : s.add(dstr)
      return { ...prev, [user.id]: s }
    })
    try {
      await toggleAvailability(group.id, user.id, dstr)
    } catch {
      load(month.getFullYear(), month.getMonth())
    }
  }

  if (!group) return null

  const ym     = `${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}`
  const todStr = toDateStr(TODAY)
  const days   = buildDays(month.getFullYear(), month.getMonth())
  const myCount = Array.from(av[user.id] ?? []).filter(d => d.startsWith(ym)).length

  const dim  = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate()
  const best = []
  for (let d = 1; d <= dim; d++) {
    const dstr = `${ym}-${String(d).padStart(2,'0')}`
    const free = members.filter(m => av[m.user_id]?.has(dstr))
    if (free.length >= Math.min(2, members.length)) best.push({ d, dstr, free })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      <div style={{ height: 'env(safe-area-inset-top)', background: '#fff' }} />

      <div style={{ padding: '14px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1D23', letterSpacing: '-0.5px' }}>暇っち</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4F86F7', background: '#EFF4FF', borderRadius: 20, padding: '4px 10px' }}>
            今月 {myCount}日空き
          </div>
          <Avatar user={user} size={34} />
        </div>
      </div>

      {groups.length > 1 && (
        <div className="scroll" style={{ display: 'flex', gap: 8, padding: '0 20px 10px', overflowX: 'auto', flexShrink: 0 }}>
          {groups.map(g => (
            <button key={g.id} className="tap" onClick={() => onSwitchGroup(g.id)} style={{
              padding: '7px 14px', borderRadius: 20, border: 'none', flexShrink: 0,
              background: group.id === g.id ? '#1A1D23' : '#F0F2F5',
              color: group.id === g.id ? '#fff' : '#6B7280',
              fontSize: 13, fontWeight: 600,
            }}>{g.name}</button>
          ))}
        </div>
      )}

      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 20px 10px' }}>
          <button className="tap" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()-1, 1))} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #E4E6EB', background: '#F7F8FA', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#1A1D23' }}>
            {month.getFullYear()}年 {MN[month.getMonth()]}
          </div>
          <button className="tap" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()+1, 1))} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #E4E6EB', background: '#F7F8FA', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, padding: '0 12px 3px' }}>
          {DN.map((d, i) => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, padding: '2px 0', color: i===0?'#EF4444':i===6?'#3B82F6':'#9BA3AF' }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, padding: '0 12px' }}>
          {days.map((d, i) => {
            const dstr        = toDateStr(d.date)
            const isMeFree    = av[user.id]?.has(dstr)
            const friendsFree = friendMembers.filter(m => av[m.user_id]?.has(dstr))
            const hasOverlap  = isMeFree && friendsFree.length > 0
            const dow         = d.date.getDay()
            const isToday     = dstr === todStr
            const holidayName = d.in ? HOLIDAYS[dstr] : null
            const isHoliday   = !!holidayName

            // 祝日は日曜扱いで赤に
            const textColor = isToday ? '#4F86F7'
              : !d.in ? '#C8CDD8'
              : (dow === 0 || isHoliday) ? '#EF4444'
              : dow === 6 ? '#3B82F6'
              : '#1A1D23'

            const bgColor = !d.in ? 'transparent'
              : hasOverlap ? '#EBF4FF'
              : isMeFree ? '#F0F9FF'
              : isHoliday ? '#FFF5F5'
              : '#F7F8FA'

            return (
              <div key={i} className={d.in ? 'tap' : ''} onClick={() => d.in && setSelDay(d.date)} style={{
                aspectRatio: '1', padding: '4px 3px',
                background: bgColor,
                border: isToday ? '2px solid #4F86F7' : '1px solid #ECEEF2',
                borderRadius: 10, opacity: d.in ? 1 : 0.3,
                display: 'flex', flexDirection: 'column',
                cursor: d.in ? 'pointer' : 'default',
                overflow: 'hidden',
              }}>
                <div style={{ fontSize: 13, fontWeight: isToday ? 800 : 500, lineHeight: 1, color: textColor }}>
                  {d.date.getDate()}
                </div>
                {isHoliday && d.in && (
                  <div style={{ fontSize: 5.5, color: '#EF4444', fontWeight: 700, lineHeight: 1.1, marginTop: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {holidayName}
                  </div>
                )}
                {isMeFree && d.in && !isHoliday && (
                  <div style={{ fontSize: 8, fontWeight: 700, color: hasOverlap ? '#4F86F7' : '#93C5FD', marginTop: 1 }}>空き</div>
                )}
                {isMeFree && d.in && isHoliday && (
                  <div style={{ fontSize: 7, fontWeight: 700, color: hasOverlap ? '#4F86F7' : '#93C5FD' }}>空き</div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 'auto' }}>
                  {friendsFree.slice(0, 4).map(m => (
                    <div key={m.user_id} style={{ width: 6, height: 6, borderRadius: '50%', background: m.color }} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 12, margin: '12px 12px 0', padding: '10px 12px', background: '#F7F8FA', borderRadius: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 22, height: 11, borderRadius: 3, background: '#EBF4FF', border: '1px solid #BFDBFE' }}/>
            <span style={{ fontSize: 10, color: '#6B7280' }}>友達と重なる日</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 22, height: 11, borderRadius: 3, background: '#FFF5F5', border: '1px solid #FECACA' }}/>
            <span style={{ fontSize: 10, color: '#6B7280' }}>祝日</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {friendMembers.slice(0,4).map(m => (
              <div key={m.user_id} style={{ width: 7, height: 7, borderRadius: '50%', background: m.color }}/>
            ))}
            {friendMembers.length > 0 && <span style={{ fontSize: 10, color: '#6B7280' }}>友達の空き</span>}
          </div>
        </div>

        {best.length > 0 && (
          <div style={{ padding: '16px 16px 12px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#B0B4BE', letterSpacing: '0.8px', marginBottom: 10 }}>
              みんなの空き日
            </div>
            <div className="scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {best.slice(0, 10).map(({ d, dstr, free }) => {
                const hName = HOLIDAYS[dstr]
                return (
                  <div key={dstr} className="tap"
                    onClick={() => setSelDay(new Date(month.getFullYear(), month.getMonth(), d))}
                    style={{
                      flexShrink: 0, padding: '10px 14px', borderRadius: 13,
                      background: hName ? '#FFF5F5' : '#fff',
                      border: `1px solid ${hName ? '#FECACA' : '#ECEEF2'}`,
                      display: 'flex', flexDirection: 'column', gap: 4, minWidth: 72,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 800, color: hName ? '#EF4444' : '#1A1D23' }}>
                      {month.getMonth()+1}/{d}
                    </div>
                    {hName && <div style={{ fontSize: 9, color: '#EF4444', fontWeight: 600 }}>{hName}</div>}
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      {free.map(m => (
                        <div key={m.user_id} style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: m.color + '20', border: `1.5px solid ${m.color}60`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
                        }}>{m.emoji}</div>
                      ))}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#9BA3AF' }}>{free.length}人◎</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ height: 16 }} />
      </div>

      {selDay && (
        <DaySheet
          date={selDay} av={av} user={user} members={members}
          onClose={() => setSelDay(null)}
          onToggle={handleToggle}
        />
      )}
    </div>
  )
}
