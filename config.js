// 説明会の差し替え設定。日時・申込URLが確定したら、ここだけ書き換える。
// 空欄のあいだは「未確定」と表示し、学校サイトの最新案内へ案内する。
window.BAIKO_EVENTS = {
  online: { date: '11月28日（土）9:30〜12:30（中学生・保護者／来校）', url: 'https://www.baiko.ac.jp/highschool/openschool/#events' }, // 11/28 入試説明会（2026-11-14 オンライン説明会から切替） 例：date:'11月3日（月）10:00〜', url:'https://…'
  visit: { date: '11月28日（土）9:30〜12:30（中学生・保護者）', url: 'https://www.baiko.ac.jp/highschool/openschool/#events' },  // 来校する入試説明会（2026-10-25 公式サイトで確認）
  fallbackUrl: 'https://www.baiko.ac.jp/highschool/openschool/'
};
// 公式LINEの特典（説明会参加者向けの4つは2026-11-14に外した）。公式LINEで受け取る。itemsを空にするとカードごと消える。
// after:true は、説明会に参加した人だけに渡す特典（合言葉と引き換え）。それ以外は、公式LINEを友だち追加すると順番に届く（2日おきに1つ）。
// top:true の特典だけを申込ボタンの下に見せる（3つまで）。残りは「特典9つをすべて見る」を開くと出る。
window.BAIKO_PERK = {
  items: [
    { name: '50分で全部わかる学校説明動画', note: '下関まで来なくていい。家族で好きな時に。', top: true },
    { name: '在校生のホンネ集（PDF）', note: '先生の前では言えない「ぶっちゃけ」を1冊に。', top: true },
    { name: 'スマホで梅光の1日体験', note: '登校から放課後まで、生徒の目線で。' },
    { name: '梅光で生徒が“化ける”理由', note: '入学してから何が変わるのか、13枚のスライドで。' },
    { name: '1対1のLINE相談', note: '人には聞きにくいことも、こっそり聞ける。' }
  ],
  how: ['公式LINEを友だち追加', '特典5つが順番に届く'],
  line: 'https://lin.ee/xZlPS00'
};
