export function BottomSheet({ onClose, children, maxHeight = '88vh' }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10,14,28,0.4)',
        display: 'flex', alignItems: 'flex-end',
        backdropFilter: 'blur(3px)',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', background: '#fff',
          borderRadius: '20px 20px 0 0',
          maxHeight, overflowY: 'auto',
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
          animation: 'sheetUp 0.22s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E0E3EA' }} />
        </div>
        {children}
      </div>
    </div>
  )
}
