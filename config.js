// 説明会の差し替え設定。日時・申込URLが確定したら、ここだけ書き換える。
// 空欄のあいだは「未確定」と表示し、学校サイトの最新案内へ案内する。
window.BAIKO_EVENTS = {
  online: { date: '', url: '' }, // オンライン説明会 例：date:'11月3日（月）10:00〜', url:'https://…'
  visit: { date: '', url: '' },  // 来校する入試説明会
  fallbackUrl: 'https://www.baiko.ac.jp/highschool/openschool/'
};
// オンライン説明会の参加者特典。公式LINEで受け取る。itemsを空にするとカードごと消える。
window.BAIKO_PERK = {
  items: [
    { name: '豪華50分の学校説明動画', note: '家族で、好きな時間に見返せる。' },
    { name: '英語動画特典', note: '梅光の英語にふれる、参加者限定の動画。' }
  ],
  how: ['説明会に参加', '最後の合言葉をメモ', '公式LINEに送る'],
  line: 'https://lin.ee/xZlPS00'
};
