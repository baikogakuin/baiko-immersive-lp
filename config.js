// 説明会の差し替え設定。日時・申込URLが確定したら、ここだけ書き換える。
// 空欄のあいだは「未確定」と表示し、学校サイトの最新案内へ案内する。
window.BAIKO_EVENTS = {
  online: { date: '', url: '' }, // オンライン説明会 例：date:'11月3日（月）10:00〜', url:'https://…'
  visit: { date: '', url: '' },  // 来校する入試説明会
  fallbackUrl: 'https://www.baiko.ac.jp/highschool/openschool/'
};
// オンライン説明会の参加者特典。公式LINEで受け取る。nameを空にするとカードごと消える。
window.BAIKO_PERK = {
  name: '学費まるごとガイド（スマホで読めるPDF）',
  note: '説明会の最後にお伝えする合言葉を、梅光の公式LINEに送ると届きます。',
  line: 'https://lin.ee/xZlPS00'
};
