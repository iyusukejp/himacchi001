export function HelpScreen({ onClose }) {
  const section = (title, emoji) => (
    <div style={{ fontSize: 13, fontWeight: 700, color: '#4F86F7', letterSpacing: '0.5px', margin: '24px 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
      <span>{emoji}</span>{title}
    </div>
  )

  const step = (num, text) => (
    <div style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#4F86F7', color: '#fff', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        {num}
      </div>
      <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{text}</div>
    </div>
  )

  const tip = (text) => (
    <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#92400E', lineHeight: 1.6, marginBottom: 8 }}>
      💡 {text}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F7F8FA' }}>
      <div style={{ height: 'env(safe-area-inset-top)', background: '#fff' }} />

      <div style={{ padding: '14px 20px', background: '#fff', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1D23' }}>使い方ガイド</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 14, color: '#9BA3AF', fontWeight: 600 }}>閉じる</button>
      </div>

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '0 16px 32px' }}>

        {/* 基本の使い方 */}
        {section('基本の使い方', '📅')}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', border: '1px solid #ECEEF2' }}>
          {step(1, 'はじめてアクセスしたら名前とアイコンを選んで設定します')}
          {step(2, '「グループ管理」からグループを作成します')}
          {step(3, '招待リンクをコピーして友達に送ります（LINEやメッセージで共有OK）')}
          {step(4, '友達が招待リンクを開くとグループに参加できます')}
          {step(5, 'カレンダーの日付をタップして「この日を空きにする」を押すと登録されます')}
          {step(6, '友達の空き日がカレンダーに色のドットで表示されます')}
        </div>

        {/* ホーム画面への追加（iPhone） */}
        {section('iPhoneのホーム画面に追加', '📱')}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', border: '1px solid #ECEEF2' }}>
          {tip('Safariで開いた場合のみ追加できます。ChromeやLINEブラウザでは追加できません。')}
          {step(1, 'Safariでこのアプリを開く')}
          {step(2, '画面下部の共有ボタン（四角から矢印が出るアイコン）をタップ')}
          {step(3, '「ホーム画面に追加」をタップ')}
          {step(4, '「追加」をタップして完了')}
          <div style={{ fontSize: 13, color: '#9BA3AF', marginTop: 8, lineHeight: 1.6 }}>
            ホーム画面から起動するとアプリのように全画面で表示されます。
            初回は名前の設定が必要です（2回目以降は不要）。
          </div>
        </div>

        {/* ホーム画面への追加（Android） */}
        {section('Androidのホーム画面に追加', '🤖')}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', border: '1px solid #ECEEF2' }}>
          {step(1, 'Chromeでこのアプリを開く')}
          {step(2, '右上の「⋮」（メニュー）をタップ')}
          {step(3, '「ホーム画面に追加」をタップ')}
          {step(4, '「追加」をタップして完了')}
          <div style={{ fontSize: 13, color: '#9BA3AF', marginTop: 8, lineHeight: 1.6 }}>
            機種によってメニューの名称が異なる場合があります。
          </div>
        </div>

        {/* 復元コード */}
        {section('復元コードの使い方', '🔑')}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', border: '1px solid #ECEEF2' }}>
          <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 12 }}>
            復元コードを使うと、別のブラウザや端末でも同じユーザーとして続けて使えます。
          </div>
          {tip('復元コードはマイページに表示されています。スクリーンショットを撮るか、メモしておくと安心です。')}
          {step(1, 'マイページを開き「🔑 復元コード」の「コピー」をタップ')}
          {step(2, 'コードをメモまたはスクリーンショットで保存')}
          {step(3, '別のブラウザ・端末でアプリを開く')}
          {step(4, '「復元コードで引き継ぐ」を選択してコードを入力')}
          {step(5, '参加していたグループも含めて引き継がれます')}
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#B91C1C', lineHeight: 1.6, marginTop: 8 }}>
            ⚠️ 復元コードを他人に教えると、その人があなたとして操作できてしまいます。取り扱いにご注意ください。
          </div>
        </div>

        {/* 予定の追加 */}
        {section('グループ予定の追加', '📌')}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', border: '1px solid #ECEEF2' }}>
          <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 12 }}>
            グループ全員に共有したい予定をカレンダーに追加できます。
          </div>
          {step(1, 'カレンダーの日付をタップ')}
          {step(2, '「予定」セクションの「＋ 追加」をタップ')}
          {step(3, '予定のタイトルを入力して「追加」をタップ')}
          <div style={{ fontSize: 13, color: '#9BA3AF', marginTop: 8, lineHeight: 1.6 }}>
            予定がある日はカレンダーに黄色のドット（🟡）が表示されます。
            グループメンバー全員がリアルタイムで確認できます。
          </div>
        </div>

      </div>
    </div>
  )
}
