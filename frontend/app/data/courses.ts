// 日本大学文理学部 講義データベース（検索・ワンタップ登録用）
import { LECTURE_DATABASE_REIWA6 } from './coursesReiwa6';

export interface LectureCourse {
  day: string; // "月", "火", "水", "木", "金", "土", "集中"
  period: number; // 1〜5, 集中は0
  name: string;
  teacher: string;
  room: string;
  department: string;
  semester?: string;
  grade?: string;
  curriculum?: string;
}

/**
 * 教室番号から表示エリア（最大12文字以内）に収まるコンパクト表記を生成
 * 例: 3403 -> 3号館403(男子側), 411 -> 4号館411(男子側), 8B203/8B210 -> 8B203他
 */
export function getCompactRoomLabel(room: string | undefined): string {
  if (!room) return '未定';
  const r = room.trim().replace(/88203/g, '8B203').replace(/88210/g, '8B210');

  // 複合教室表記の短縮（例: 8B203/8B210, 3409／3408／3304）
  if (r.includes('／') || r.includes('/')) {
    const first = r.split(/[／/]/)[0].trim();
    return `${getCompactRoomLabel(first)}他`;
  }

  // 8号館 (8B203, 8B210, 8AB, 8号館資料館)
  if (r.startsWith('8B') || r.startsWith('8A')) {
    return `8号館${r}`;
  }

  // 3号館: 4桁（3〇〇〇）※番号を省略せず「3号館3306(女子側)」とする
  if (/^3\d{3}$/.test(r)) {
    const sub = parseInt(r.slice(2), 10);
    const side = (sub >= 1 && sub <= 5) ? '男子側' : (sub >= 6 && sub <= 10 ? '女子側' : '');
    return side ? `3号館${r}(${side})` : `3号館${r}`;
  }

  // 4号館: 3桁（4〇〇）
  if (/^4\d{2}$/.test(r)) {
    const sub = r.slice(1);
    let side = '';
    if (['11', '21', '31', '41'].includes(sub)) side = '男子側';
    else if (['12', '22', '32', '42'].includes(sub)) side = '女子側';
    return side ? `4号館${r}(${side})` : `4号館${r}`;
  }

  // 1号館: 3桁（1〇〇）
  if (/^1\d{2}[A-Za-z]?$/.test(r)) {
    let side = '';
    if (['122', '123', '124', '131', '132', '133', '134'].includes(r)) side = '左';
    else if (['125', '126', '127A', '127B', '135', '136', '137A', '137B'].includes(r)) side = '右';
    else if (r === '130') side = '正面';
    return side ? `1号館${r}(${side})` : `1号館${r}`;
  }

  // 2号館: 4桁（2〇〇〇）※番号を省略せず「2号館2301」とする
  if (/^2\d{3}$/.test(r)) {
    return `2号館${r}`;
  }

  // 特殊教室の短縮
  if (r.includes('学芸員')) return '学芸員演習室';
  if (r.includes('情報分析')) return '情報分析室';
  if (r.includes('遠隔')) return '遠隔授業';
  if (r.includes('研究室')) return '各教員研究室';
  if (r.includes('第1学生実験室')) return '第1実験室';
  if (r.includes('第2学生実験室')) return '第2実験室';
  if (r.includes('第3・4学生実験室')) return '第3・4実験室';
  if (r.includes('1・2年実験室')) return '1・2年実験室';
  if (r.includes('生命科')) return '生命科実験室';

  if (r.length > 12) {
    return r.slice(0, 11) + '…';
  }

  return r;
}

export const LECTURE_DATABASE: LectureCourse[] = [
  {
    "day": "月",
    "period": 1,
    "name": "細胞生物学1",
    "teacher": "安原 徳子",
    "room": "3306",
    "department": "生命科学科"
  },
  {
    "day": "月",
    "period": 1,
    "name": "発達と学習",
    "teacher": "大森 馨子",
    "room": "411",
    "department": "教育学科/教職"
  },
  {
    "day": "月",
    "period": 1,
    "name": "日本文学入門",
    "teacher": "小林 茂美",
    "room": "122",
    "department": "国文学科"
  },
  {
    "day": "月",
    "period": 1,
    "name": "英語1（オーラル）",
    "teacher": "スミス J",
    "room": "3203",
    "department": "外国語教育科目"
  },
  {
    "day": "月",
    "period": 1,
    "name": "自然地理学の基礎",
    "teacher": "高橋 和博",
    "room": "3401",
    "department": "地理学科"
  },
  {
    "day": "月",
    "period": 2,
    "name": "力学2",
    "teacher": "玉岡 幸太郎",
    "room": "3403",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 2,
    "name": "量子力学1",
    "teacher": "山本 大輔",
    "room": "3403",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 2,
    "name": "心理学実験",
    "teacher": "佐藤 健一",
    "room": "421",
    "department": "心理学科"
  },
  {
    "day": "月",
    "period": 2,
    "name": "史学概論",
    "teacher": "鈴木 孝治",
    "room": "131",
    "department": "史学科"
  },
  {
    "day": "月",
    "period": 2,
    "name": "中国社会論",
    "teacher": "張 偉",
    "room": "3302",
    "department": "中国語中国文化学科"
  },
  {
    "day": "月",
    "period": 3,
    "name": "教育原論",
    "teacher": "原 圭寛",
    "room": "431",
    "department": "教育学科/教職"
  },
  {
    "day": "月",
    "period": 3,
    "name": "固体地球科学基礎実験",
    "teacher": "田中 秀樹",
    "room": "3506",
    "department": "地球科学科"
  },
  {
    "day": "月",
    "period": 3,
    "name": "英文法",
    "teacher": "ジョンソン M",
    "room": "124",
    "department": "英文学科"
  },
  {
    "day": "月",
    "period": 3,
    "name": "ドイツ語1",
    "teacher": "ミュラー K",
    "room": "3205",
    "department": "外国語教育科目"
  },
  {
    "day": "月",
    "period": 4,
    "name": "基礎物理実験A",
    "teacher": "上岡 隼人",
    "room": "125",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 4,
    "name": "社会学史",
    "teacher": "中村 陽一",
    "room": "441",
    "department": "社会学科"
  },
  {
    "day": "月",
    "period": 4,
    "name": "運動生理学",
    "teacher": "渡辺 学",
    "room": "3206",
    "department": "体育学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "情報ネットワーク論",
    "teacher": "伊藤 賢治",
    "room": "3304",
    "department": "情報科学科"
  },
  {
    "day": "火",
    "period": 1,
    "name": "生徒指導・進路指導論",
    "teacher": "土屋 弥生",
    "room": "3500",
    "department": "教育学科/教職"
  },
  {
    "day": "火",
    "period": 1,
    "name": "古文書学",
    "teacher": "加藤 秀雄",
    "room": "132",
    "department": "史学科"
  },
  {
    "day": "火",
    "period": 1,
    "name": "地球科学概論",
    "teacher": "小林 誠",
    "room": "3402",
    "department": "地球科学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "特別支援教育概論",
    "teacher": "田部 絢子",
    "room": "3506",
    "department": "教育学科/教職"
  },
  {
    "day": "火",
    "period": 2,
    "name": "データ構造とアルゴリズム",
    "teacher": "森田 浩司",
    "room": "3305",
    "department": "情報科学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "哲学基礎講義",
    "teacher": "吉田 聡",
    "room": "412",
    "department": "哲学科"
  },
  {
    "day": "火",
    "period": 3,
    "name": "物理数学1",
    "teacher": "千葉 剛",
    "room": "3404",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 3,
    "name": "教育課程論",
    "teacher": "野内 頼一",
    "room": "131",
    "department": "教育学科/教職"
  },
  {
    "day": "火",
    "period": 3,
    "name": "ソーシャルワーク演習",
    "teacher": "松本 恵子",
    "room": "422",
    "department": "社会福祉学科"
  },
  {
    "day": "火",
    "period": 4,
    "name": "現代家族論",
    "teacher": "斉藤 直子",
    "room": "3204",
    "department": "社会学科"
  },
  {
    "day": "火",
    "period": 4,
    "name": "スポーツバイオメカニクス",
    "teacher": "木村 剛",
    "room": "3303",
    "department": "体育学科"
  },
  {
    "day": "火",
    "period": 5,
    "name": "フランス語初級",
    "teacher": "デュポン P",
    "room": "135",
    "department": "外国語教育科目"
  },
  {
    "day": "水",
    "period": 1,
    "name": "基礎線形代数1",
    "teacher": "柳田 昌宏",
    "room": "3302",
    "department": "数学科"
  },
  {
    "day": "水",
    "period": 1,
    "name": "アカデミックICT基礎",
    "teacher": "清水 達也",
    "room": "3401",
    "department": "基礎教育科目"
  },
  {
    "day": "水",
    "period": 1,
    "name": "中国語1",
    "teacher": "李 芳",
    "room": "123",
    "department": "外国語教育科目"
  },
  {
    "day": "水",
    "period": 2,
    "name": "教育相談",
    "teacher": "西本 和月",
    "room": "3305",
    "department": "教育学科/教職"
  },
  {
    "day": "水",
    "period": 2,
    "name": "地形学",
    "teacher": "宮崎 慎一",
    "room": "3403",
    "department": "地理学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "障害者福祉施策",
    "teacher": "井上 敏",
    "room": "411",
    "department": "社会福祉学科"
  },
  {
    "day": "水",
    "period": 3,
    "name": "情報理論1",
    "teacher": "古市 茂",
    "room": "3308",
    "department": "情報科学科"
  },
  {
    "day": "水",
    "period": 3,
    "name": "アメリカ文学史",
    "teacher": "ベーカー R",
    "room": "126",
    "department": "英文学科"
  },
  {
    "day": "水",
    "period": 3,
    "name": "日本語学入門",
    "teacher": "橋本 健",
    "room": "130",
    "department": "国文学科"
  },
  {
    "day": "水",
    "period": 4,
    "name": "地震学",
    "teacher": "岡田 浩一",
    "room": "3500",
    "department": "地球科学科"
  },
  {
    "day": "水",
    "period": 4,
    "name": "認知心理学特講",
    "teacher": "西村 誠司",
    "room": "432",
    "department": "心理学科"
  },
  {
    "day": "水",
    "period": 5,
    "name": "スペイン語会話",
    "teacher": "ガルシア M",
    "room": "3203",
    "department": "外国語教育科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "道徳教育の理論と方法",
    "teacher": "河野 桃子",
    "room": "3305",
    "department": "教育学科/教職"
  },
  {
    "day": "木",
    "period": 1,
    "name": "有機化学基礎",
    "teacher": "竹内 亮",
    "room": "3402",
    "department": "化学科"
  },
  {
    "day": "木",
    "period": 2,
    "name": "データベース論",
    "teacher": "杉本 雅弘",
    "room": "3306",
    "department": "情報科学科"
  },
  {
    "day": "木",
    "period": 2,
    "name": "都市地理学",
    "teacher": "野村 貴行",
    "room": "3404",
    "department": "地理学科"
  },
  {
    "day": "木",
    "period": 2,
    "name": "東洋史特講",
    "teacher": "島田 英樹",
    "room": "131",
    "department": "史学科"
  },
  {
    "day": "木",
    "period": 3,
    "name": "教育原論",
    "teacher": "小野 雅章",
    "room": "3303",
    "department": "教育学科/教職"
  },
  {
    "day": "木",
    "period": 3,
    "name": "気圏科学実習",
    "teacher": "大野 健太",
    "room": "3506",
    "department": "地球科学科"
  },
  {
    "day": "木",
    "period": 3,
    "name": "韓国・朝鮮語1",
    "teacher": "金 秀賢",
    "room": "124",
    "department": "外国語教育科目"
  },
  {
    "day": "木",
    "period": 4,
    "name": "電磁気学3",
    "teacher": "鈴木 優樹",
    "room": "3401",
    "department": "物理学科"
  },
  {
    "day": "木",
    "period": 4,
    "name": "マス・コミュニケーション論",
    "teacher": "藤田 剛",
    "room": "442",
    "department": "社会学科"
  },
  {
    "day": "木",
    "period": 5,
    "name": "ロシア語初級",
    "teacher": "イワノフ D",
    "room": "127A",
    "department": "外国語教育科目"
  },
  {
    "day": "金",
    "period": 1,
    "name": "微分・積分1",
    "teacher": "石部 正",
    "room": "412",
    "department": "数学科"
  },
  {
    "day": "金",
    "period": 1,
    "name": "近代文学研究",
    "teacher": "安田 正人",
    "room": "122",
    "department": "国文学科"
  },
  {
    "day": "金",
    "period": 1,
    "name": "英語プレゼンテーション",
    "teacher": "クラーク S",
    "room": "3204",
    "department": "外国語教育科目"
  },
  {
    "day": "金",
    "period": 2,
    "name": "教育原論",
    "teacher": "佐野 良介",
    "room": "3204",
    "department": "教育学科/教職"
  },
  {
    "day": "金",
    "period": 2,
    "name": "健康・スポーツ教育実習",
    "teacher": "本田 孝文",
    "room": "体育館",
    "department": "基礎教育科目/体育"
  },
  {
    "day": "金",
    "period": 2,
    "name": "心理調査法実習",
    "teacher": "工藤 由美",
    "room": "421",
    "department": "心理学科"
  },
  {
    "day": "金",
    "period": 3,
    "name": "Webプログラミング",
    "teacher": "藤本 一平",
    "room": "3308",
    "department": "情報科学科"
  },
  {
    "day": "金",
    "period": 3,
    "name": "倫理学概論",
    "teacher": "中川 徹",
    "room": "132",
    "department": "哲学科"
  },
  {
    "day": "金",
    "period": 3,
    "name": "高齢者福祉論",
    "teacher": "西川 和恵",
    "room": "431",
    "department": "社会福祉学科"
  },
  {
    "day": "金",
    "period": 4,
    "name": "地理情報科学(GIS)",
    "teacher": "山崎 俊",
    "room": "3403",
    "department": "地理学科"
  },
  {
    "day": "金",
    "period": 4,
    "name": "同位体地球科学",
    "teacher": "池田 雅之",
    "room": "3500",
    "department": "地球科学科"
  },
  {
    "day": "金",
    "period": 5,
    "name": "中国語スピーキング",
    "teacher": "王 俊",
    "room": "125",
    "department": "中国語中国文化学科"
  },
  {
    "day": "土",
    "period": 1,
    "name": "教職総合演習",
    "teacher": "教職担当班",
    "room": "411",
    "department": "教職コース"
  },
  {
    "day": "土",
    "period": 2,
    "name": "学校図書館メディアの構成",
    "teacher": "図書館学担当",
    "room": "3203",
    "department": "司書教諭コース"
  },
  {
    "day": "土",
    "period": 3,
    "name": "博物館展示論",
    "teacher": "学芸員担当",
    "room": "3302",
    "department": "学芸員コース"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "データサイエンスの世界",
    "teacher": "オンデマンド",
    "room": "遠隔",
    "department": "情報科学科/副専攻"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "ヨーロッパの教育思想",
    "teacher": "横田 みどり",
    "room": "3402",
    "department": "教育学科"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "野外教育論(含実習)",
    "teacher": "西島 大祐",
    "room": "学外",
    "department": "体育学科"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "恐竜学",
    "teacher": "藤原 慎一",
    "room": "3410",
    "department": "地球科学科"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "キャリアデザイン特講",
    "teacher": "峯岸 久枝",
    "room": "3500",
    "department": "全学科共通"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "教育実習事前・事後指導",
    "teacher": "教職指導委員会",
    "room": "131",
    "department": "教職コース"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "博物館実習",
    "teacher": "資料館担当教授",
    "room": "8号館資料館",
    "department": "学芸員コース"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "野外調査法（含実習）",
    "teacher": "地理学科スタッフ",
    "room": "学外巡検",
    "department": "地理学科"
  },
  {
    "day": "月",
    "period": 1,
    "name": "図書館基礎特論（2〜4年）",
    "teacher": "大場博幸",
    "room": "ML3",
    "department": "コース科目"
  },
  {
    "day": "月",
    "period": 2,
    "name": "図書館基礎特論（2〜4年）",
    "teacher": "大場博幸",
    "room": "ML3",
    "department": "コース科目"
  },
  {
    "day": "月",
    "period": 4,
    "name": "情報資源組織演習2（3〜4年）",
    "teacher": "三日市紀子",
    "room": "3406",
    "department": "コース科目"
  },
  {
    "day": "月",
    "period": 5,
    "name": "情報資源組織演習2（3〜4年）",
    "teacher": "三日市紀子",
    "room": "3406",
    "department": "コース科目"
  },
  {
    "day": "月",
    "period": 3,
    "name": "博物館実習1（学内・3年）",
    "teacher": "斎藤あや",
    "room": "学芸員研究演習室",
    "department": "学芸員コース"
  },
  {
    "day": "月",
    "period": 3,
    "name": "博物館資料保存論1（3年）",
    "teacher": "田中真奈子",
    "room": "3306",
    "department": "学芸員コース"
  },
  {
    "day": "月",
    "period": 1,
    "name": "情報資源組織演習1（3〜4年）",
    "teacher": "大場博幸",
    "room": "ML3",
    "department": "コース科目"
  },
  {
    "day": "月",
    "period": 2,
    "name": "情報資源組織演習1（3〜4年）",
    "teacher": "大場博幸",
    "room": "ML3",
    "department": "コース科目"
  },
  {
    "day": "月",
    "period": 5,
    "name": "博物館実習2（学内・3年）",
    "teacher": "斎藤あや",
    "room": "学芸員研究演習室",
    "department": "学芸員コース"
  },
  {
    "day": "月",
    "period": 2,
    "name": "学校図書館メディアの構成（2〜4年）",
    "teacher": "須永和之",
    "room": "3509",
    "department": "コース科目"
  },
  {
    "day": "月",
    "period": 2,
    "name": "博物館教育論（2〜3年）",
    "teacher": "望月一樹",
    "room": "3306",
    "department": "学芸員コース"
  },
  {
    "day": "火",
    "period": 3,
    "name": "日本語教育学入門（1〜4年）",
    "teacher": "松崎寛",
    "room": "3406",
    "department": "日本語教育コース"
  },
  {
    "day": "水",
    "period": 5,
    "name": "日本語教育実習（2〜4年）",
    "teacher": "松崎寛",
    "room": "7202",
    "department": "日本語教育コース"
  },
  {
    "day": "水",
    "period": 1,
    "name": "図書館情報学概論（2〜4年）",
    "teacher": "大場博幸",
    "room": "444",
    "department": "コース科目"
  },
  {
    "day": "水",
    "period": 2,
    "name": "図書館情報学概論（2〜4年）",
    "teacher": "大場博幸",
    "room": "444",
    "department": "コース科目"
  },
  {
    "day": "水",
    "period": 1,
    "name": "図書館情報資源概論（2〜4年）",
    "teacher": "大場博幸",
    "room": "3304",
    "department": "コース科目"
  },
  {
    "day": "水",
    "period": 2,
    "name": "図書館情報資源概論（2〜4年）",
    "teacher": "大場博幸",
    "room": "3304",
    "department": "コース科目"
  },
  {
    "day": "水",
    "period": 3,
    "name": "情報サービス演習2（3〜4年）",
    "teacher": "中島玲子",
    "room": "ML3",
    "department": "コース科目"
  },
  {
    "day": "水",
    "period": 3,
    "name": "博物館資料保存論2（3年）",
    "teacher": "田中真奈子",
    "room": "3306",
    "department": "学芸員コース"
  },
  {
    "day": "木",
    "period": 1,
    "name": "学校経営と学校図書館（2〜4年）",
    "teacher": "大場博幸",
    "room": "3309",
    "department": "コース科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "博物館実習1（学内・3年）",
    "teacher": "田中裕二",
    "room": "学芸員研究演習室",
    "department": "学芸員コース"
  },
  {
    "day": "木",
    "period": 2,
    "name": "情報サービス論（2〜3年）",
    "teacher": "大曲薫",
    "room": "ML5",
    "department": "コース科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "社会教育課題研究1（2〜4年）",
    "teacher": "佐藤晴雄",
    "room": "ML4",
    "department": "社会教育主事コース"
  },
  {
    "day": "木",
    "period": 3,
    "name": "情報サービス論（2〜3年）",
    "teacher": "大曲薫",
    "room": "ML5",
    "department": "コース科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "社会教育演習1（2〜4年）",
    "teacher": "梶野光信",
    "room": "441",
    "department": "社会教育主事コース"
  },
  {
    "day": "木",
    "period": 2,
    "name": "博物館概論（1〜2年）",
    "teacher": "田中裕二",
    "room": "3407",
    "department": "学芸員コース"
  },
  {
    "day": "木",
    "period": 2,
    "name": "読書と豊かな人間性（2〜4年）",
    "teacher": "佐川祐子",
    "room": "3408",
    "department": "コース科目"
  },
  {
    "day": "木",
    "period": 3,
    "name": "社会教育課題研究1（2〜4年）",
    "teacher": "内海美由紀",
    "room": "3309",
    "department": "社会教育主事コース"
  },
  {
    "day": "木",
    "period": 4,
    "name": "教材・教具論（1〜4年）",
    "teacher": "保坂敏子",
    "room": "3204",
    "department": "コース科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "社会教育演習2（2〜4年）",
    "teacher": "梶野光信",
    "room": "2302",
    "department": "社会教育主事コース"
  },
  {
    "day": "木",
    "period": 2,
    "name": "図書館情報技術論（2〜4年）",
    "teacher": "中島玲子",
    "room": "3208",
    "department": "コース科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "社会教育課題研究2（2〜4年）",
    "teacher": "佐藤晴雄",
    "room": "ML4",
    "department": "社会教育主事コース"
  },
  {
    "day": "木",
    "period": 3,
    "name": "図書館サービス特論（3〜4年）",
    "teacher": "佐川祐子",
    "room": "3301",
    "department": "コース科目"
  },
  {
    "day": "木",
    "period": 3,
    "name": "読書と豊かな人間性（2〜4年）",
    "teacher": "佐川祐子",
    "room": "3501",
    "department": "コース科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "博物館経営論（1〜2年）",
    "teacher": "田中裕二",
    "room": "3408",
    "department": "学芸員コース"
  },
  {
    "day": "木",
    "period": 1,
    "name": "社会教育課題研究2（2〜4年）",
    "teacher": "内海美由紀",
    "room": "3301",
    "department": "社会教育主事コース"
  },
  {
    "day": "金",
    "period": 1,
    "name": "博物館実習1（学内・3年）",
    "teacher": "勝木言一郎",
    "room": "学芸員研究演習室",
    "department": "学芸員コース"
  },
  {
    "day": "金",
    "period": 2,
    "name": "学習指導と学校図書館（2〜4年）",
    "teacher": "内海美由紀",
    "room": "3401",
    "department": "コース科目"
  },
  {
    "day": "金",
    "period": 2,
    "name": "情報資源組織論（2〜3年）",
    "teacher": "村上郷子",
    "room": "134",
    "department": "コース科目"
  },
  {
    "day": "金",
    "period": 3,
    "name": "情報資源組織論（2〜3年）",
    "teacher": "村上郷子",
    "room": "134",
    "department": "コース科目"
  },
  {
    "day": "金",
    "period": 3,
    "name": "博物館資料論（3年）",
    "teacher": "小酒井大悟",
    "room": "135",
    "department": "学芸員コース"
  },
  {
    "day": "金",
    "period": 2,
    "name": "博物館実習1（学内・3年）",
    "teacher": "清田馨",
    "room": "学芸員研究演習室",
    "department": "学芸員コース"
  },
  {
    "day": "金",
    "period": 3,
    "name": "情報サービス演習1（3〜4年）",
    "teacher": "川瀬康子",
    "room": "ML2",
    "department": "コース科目"
  },
  {
    "day": "金",
    "period": 1,
    "name": "博物館実習2（学内・3年）",
    "teacher": "勝木言一郎",
    "room": "学芸員研究演習室",
    "department": "学芸員コース"
  },
  {
    "day": "金",
    "period": 3,
    "name": "図書館情報資源特論（3〜4年）",
    "teacher": "久保木秀夫",
    "room": "ML2",
    "department": "コース科目"
  },
  {
    "day": "金",
    "period": 3,
    "name": "博物館情報・メディア論（3年）",
    "teacher": "村井良子",
    "room": "123",
    "department": "学芸員コース"
  },
  {
    "day": "金",
    "period": 2,
    "name": "博物館実習2（学内・3年）",
    "teacher": "清田馨",
    "room": "学芸員研究演習室",
    "department": "学芸員コース"
  },
  {
    "day": "金",
    "period": 2,
    "name": "生涯学習支援論2（2〜4年）",
    "teacher": "梶野光信",
    "room": "3503",
    "department": "コース科目"
  },
  {
    "day": "金",
    "period": 2,
    "name": "日本語教育のための文法（1〜4年）",
    "teacher": "牧原功",
    "room": "3409",
    "department": "日本語教育コース"
  },
  {
    "day": "土",
    "period": 1,
    "name": "図書館サービス概論（2〜4年）",
    "teacher": "吉井潤",
    "room": "3205",
    "department": "コース科目"
  },
  {
    "day": "土",
    "period": 2,
    "name": "図書館制度・経営論（2〜4年）",
    "teacher": "吉井潤",
    "room": "3205",
    "department": "コース科目"
  },
  {
    "day": "土",
    "period": 2,
    "name": "情報メディアの活用（2〜4年）",
    "teacher": "須永和之",
    "room": "ML3",
    "department": "コース科目"
  },
  {
    "day": "土",
    "period": 3,
    "name": "博物館展示論（2〜3年）",
    "teacher": "望月一樹",
    "room": "3308",
    "department": "学芸員コース"
  },
  {
    "day": "土",
    "period": 2,
    "name": "博物館実習2（学内・3年）",
    "teacher": "湯川紅美",
    "room": "学芸員研究演習室",
    "department": "学芸員コース"
  },
  {
    "day": "土",
    "period": 2,
    "name": "博物館実習3（見学・4年）",
    "teacher": "田中裕二",
    "room": "未定",
    "department": "学芸員コース"
  },
  {
    "day": "土",
    "period": 2,
    "name": "博物館実習4（館務・3〜4年）",
    "teacher": "古川隆久",
    "room": "未定",
    "department": "学芸員コース"
  },
  {
    "day": "土",
    "period": 2,
    "name": "社会教育実習（3〜4年）",
    "teacher": "梶野光信",
    "room": "未定",
    "department": "社会教育主事コース"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "データサイエンスの世界（※令和7年度以降入学者のみ）",
    "teacher": "集中開講",
    "room": "遠隔授業",
    "department": "総合教育/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "総合研究1〜8（スポーツ文化実習：ヨーロッパのスポーツ文化とスポーツダイバーシティ）",
    "teacher": "大嶽真人",
    "room": "ドイツ（ヘッセン州・ノルトライン＝ヴェストファーレン州）",
    "department": "総合教育/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "総合研究1〜8（北海道中川町：人と自然共生による地域づくり）",
    "teacher": "中岡裕章",
    "room": "情報分析室／北海道中川町",
    "department": "総合教育/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "総合研究1〜8（南九州から学ぶ地球の恵みとSDGs）",
    "teacher": "金丸龍夫",
    "room": "学内／鹿児島県（詳細別途）",
    "department": "総合教育/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "総合研究1〜8（アルゴリズムによる問題解決）",
    "teacher": "村上雅彦",
    "room": "8B203・8B210",
    "department": "総合教育/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "総合研究1〜8（教育産業概論）",
    "teacher": "佐久間邦友",
    "room": "3404",
    "department": "総合教育/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "海外語学研修（ドイツ語）",
    "teacher": "シュヴァルツ・トーマス",
    "room": "ドイツ（ベルリン）",
    "department": "外国語教育/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "フィールドワーク",
    "teacher": "田中ゆかり",
    "room": "3207／万世橋区民館（予定）",
    "department": "学科専門（国文）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "精神保健学",
    "teacher": "陶嘉イ",
    "room": "3309",
    "department": "学科専門（社会福祉）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "ソーシャルワーク実習21／22／2",
    "teacher": "太田由加里／上田美香",
    "room": "学外",
    "department": "学科専門（社会福祉）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "特別支援教育演習",
    "teacher": "西牧謙吾",
    "room": "別途指示",
    "department": "学科専門（教育）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "地域教育論",
    "teacher": "丹間康仁",
    "room": "3401",
    "department": "学科専門（教育）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "ヨーロッパの教育思想",
    "teacher": "植田みどり",
    "room": "3402",
    "department": "学科専門（教育）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "視覚障害教育総論",
    "teacher": "星祐子",
    "room": "7202",
    "department": "学科専門（教育）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "聴覚障害教育総論",
    "teacher": "澤隆史",
    "room": "7202",
    "department": "学科専門（教育）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "野外教育論（含実習）",
    "teacher": "西島大祐",
    "room": "学外",
    "department": "学科専門（教育）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "教育学特殊講義2",
    "teacher": "田部絢子",
    "room": "3305／学外",
    "department": "学科専門（教育）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "野外実習（オーシャンスポーツ）",
    "teacher": "野口智博",
    "room": "千葉県岩井海岸",
    "department": "学科専門（体育）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "野外実習（キャンプ）",
    "teacher": "伊佐野龍司",
    "room": "山梨県北杜市",
    "department": "学科専門（体育）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "コーチング論（原論）",
    "teacher": "青山清英",
    "room": "3206",
    "department": "学科専門（体育）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "関係行政論B",
    "teacher": "芳賀通匡",
    "room": "3302",
    "department": "学科専門（心理）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "自然地理学実験",
    "teacher": "森島済",
    "room": "未定",
    "department": "学科専門（地理）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "地理海外実地研究",
    "teacher": "落合康浩",
    "room": "ドイツ",
    "department": "学科専門（地理）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "農山村再生論",
    "teacher": "飯塚遼",
    "room": "3404",
    "department": "学科専門（地理）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "恐竜学",
    "teacher": "藤原慎一",
    "room": "3410",
    "department": "学科専門（地球科）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "堆積学",
    "teacher": "藤原治",
    "room": "3510",
    "department": "学科専門（地球科）/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "情報可視化",
    "teacher": "矢崎裕一",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "国語科教育法Ⅲ",
    "teacher": "小澤純",
    "room": "3204",
    "department": "教職コース/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "教育課程論",
    "teacher": "田中光晴",
    "room": "3308",
    "department": "教職コース/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "特別活動・総合的な学習の時間の指導法",
    "teacher": "藤平敦",
    "room": "3308",
    "department": "教職コース/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "教職実践演習",
    "teacher": "仲野由佳理／藤平敦／峯岸久枝／水上晃実",
    "room": "3409／3408／3304",
    "department": "総合教育/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "データサイエンスの世界",
    "teacher": "後学期版",
    "room": "遠隔授業",
    "department": "総合教育/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "キャリアデザイン",
    "teacher": "峯岸久枝",
    "room": "学内",
    "department": "総合教育/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "インターンシップ",
    "teacher": "2種",
    "room": "学内／聖パウロ学園／未定",
    "department": "総合教育/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "Intensive English Workshop",
    "teacher": "集中開講",
    "room": "学内",
    "department": "総合教育/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "総合研究",
    "teacher": "世田谷区商店街調査",
    "room": "学内／学外",
    "department": "総合教育/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "健康スポーツ教育実習",
    "teacher": "スノーボード",
    "room": "長野県志賀高原",
    "department": "総合教育/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "社会福祉系実習",
    "teacher": "複数",
    "room": "学外",
    "department": "総合教育/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "体育／情報／教職系の集中授業",
    "teacher": "海外スポーツ実地研究、スノースポーツ、アイススポーツ、コーチング論、暗号理論",
    "room": "志賀高原／富士吉田／遠隔＋対面／海外など",
    "department": "総合教育/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "教職実践演習",
    "teacher": "複数",
    "room": "学内",
    "department": "総合教育/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "道徳教育の理論と方法",
    "teacher": "岸本智典",
    "room": "学内",
    "department": "総合教育/集中"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "博物館実習3（見学）／田中裕二",
    "teacher": "集中開講",
    "room": "学内／学外（博物館）",
    "department": "総合教育/集中"
  },
  {
    "day": "木",
    "period": 3,
    "name": "教育原論",
    "teacher": "小野雅章",
    "room": "3500",
    "department": "教職(中国語中国文化・英文・物理)"
  },
  {
    "day": "木",
    "period": 4,
    "name": "教育原論",
    "teacher": "小野雅章",
    "room": "3500",
    "department": "教職(体育(28)・情報科・化)"
  },
  {
    "day": "木",
    "period": 1,
    "name": "教育原論",
    "teacher": "日暮トモ子",
    "room": "3500",
    "department": "教職(体育(31・32)・地理)"
  },
  {
    "day": "金",
    "period": 1,
    "name": "教育原論",
    "teacher": "佐野良介",
    "room": "3500",
    "department": "教職(史・社会福祉・生命科)"
  },
  {
    "day": "金",
    "period": 2,
    "name": "教育原論",
    "teacher": "佐野良介",
    "room": "3500",
    "department": "教職(社会)"
  },
  {
    "day": "火",
    "period": 3,
    "name": "教育原論",
    "teacher": "長戸光",
    "room": "3500",
    "department": "教職(哲・ドイツ文・体育(29))"
  },
  {
    "day": "月",
    "period": 3,
    "name": "教育原論",
    "teacher": "原圭寛",
    "room": "3500",
    "department": "教職(国文・体育(30))"
  },
  {
    "day": "水",
    "period": 3,
    "name": "教育原論",
    "teacher": "佐久間邦友",
    "room": "3500",
    "department": "教職(心理・地球科・数)"
  },
  {
    "day": "水",
    "period": 3,
    "name": "発達と学習",
    "teacher": "池見正剛",
    "room": "3500",
    "department": "教職(中国語中国文化・英文・心理)"
  },
  {
    "day": "月",
    "period": 1,
    "name": "発達と学習",
    "teacher": "大森馨子",
    "room": "3500",
    "department": "教職(国文・ドイツ文・体育(28))"
  },
  {
    "day": "月",
    "period": 2,
    "name": "発達と学習",
    "teacher": "大森馨子",
    "room": "3500",
    "department": "教職(史・物理)"
  },
  {
    "day": "火",
    "period": 3,
    "name": "発達と学習",
    "teacher": "須永範明",
    "room": "3500",
    "department": "教職(体育(29・30)・情報科)"
  },
  {
    "day": "火",
    "period": 4,
    "name": "発達と学習",
    "teacher": "須永範明",
    "room": "3500",
    "department": "教職(哲・体育(31)・化)"
  },
  {
    "day": "金",
    "period": 4,
    "name": "発達と学習",
    "teacher": "則近千尋",
    "room": "3500",
    "department": "教職(数・生命科)"
  },
  {
    "day": "金",
    "period": 5,
    "name": "発達と学習",
    "teacher": "則近千尋",
    "room": "3500",
    "department": "教職(社会福祉・体育(32)・地理・地球科)"
  },
  {
    "day": "火",
    "period": 2,
    "name": "特別支援教育概論",
    "teacher": "田部絢子",
    "room": "3500",
    "department": "教職(哲・ドイツ文・教育(25))"
  },
  {
    "day": "火",
    "period": 3,
    "name": "特別支援教育概論",
    "teacher": "田部絢子",
    "room": "3500",
    "department": "教職(化)"
  },
  {
    "day": "火",
    "period": 4,
    "name": "特別支援教育概論",
    "teacher": "田部絢子",
    "room": "3500",
    "department": "教職(教育(26・27))"
  },
  {
    "day": "木",
    "period": 1,
    "name": "特別支援教育概論",
    "teacher": "西牧謙吾",
    "room": "3500",
    "department": "教職(体育(29・30)・物理)"
  },
  {
    "day": "木",
    "period": 2,
    "name": "特別支援教育概論",
    "teacher": "西牧謙吾",
    "room": "3500",
    "department": "教職(英文・数)"
  },
  {
    "day": "木",
    "period": 2,
    "name": "教育課程論",
    "teacher": "小野まどか",
    "room": "3500",
    "department": "教職(中国語中国文化・地理)"
  },
  {
    "day": "金",
    "period": 2,
    "name": "教育課程論",
    "teacher": "小野まどか",
    "room": "3500",
    "department": "教職(体育(28・29)・物理)"
  },
  {
    "day": "金",
    "period": 4,
    "name": "教育課程論",
    "teacher": "小野まどか",
    "room": "3500",
    "department": "教職(史・英文・社会福祉)"
  },
  {
    "day": "月",
    "period": 3,
    "name": "教育課程論",
    "teacher": "栗原幸正",
    "room": "3500",
    "department": "教職(国文・心理)"
  },
  {
    "day": "月",
    "period": 4,
    "name": "教育課程論",
    "teacher": "栗原幸正",
    "room": "3500",
    "department": "教職(哲・数)"
  },
  {
    "day": "火",
    "period": 3,
    "name": "教育課程論",
    "teacher": "野内頼一",
    "room": "3500",
    "department": "教職(社会・生命科)"
  },
  {
    "day": "火",
    "period": 4,
    "name": "教育課程論",
    "teacher": "野内頼一",
    "room": "3500",
    "department": "教職(ドイツ文・体育(30・31))"
  },
  {
    "day": "木",
    "period": 1,
    "name": "道徳教育の理論と方法",
    "teacher": "河野桃子",
    "room": "3500",
    "department": "教職(国文・体育(28))"
  },
  {
    "day": "木",
    "period": 1,
    "name": "道徳教育の理論と方法",
    "teacher": "日暮トモ子",
    "room": "3500",
    "department": "教職(社会福祉・心理・数・生命科)"
  },
  {
    "day": "火",
    "period": 2,
    "name": "道徳教育の理論と方法",
    "teacher": "長谷川千恵美",
    "room": "3500",
    "department": "教職(中国語中国文化・社会)"
  },
  {
    "day": "月",
    "period": 1,
    "name": "道徳教育の理論と方法",
    "teacher": "藤平敦",
    "room": "3500",
    "department": "教職(体育(31・32)・化)"
  },
  {
    "day": "月",
    "period": 2,
    "name": "道徳教育の理論と方法",
    "teacher": "藤平敦",
    "room": "3500",
    "department": "教職(哲・史・情報科・物理)"
  },
  {
    "day": "金",
    "period": 5,
    "name": "特別活動・総合的な学習の時間の指導法",
    "teacher": "望月由起",
    "room": "3500",
    "department": "教職(中国語中国文化・体育(28・29・32))"
  },
  {
    "day": "金",
    "period": 1,
    "name": "特別活動・総合的な学習の時間の指導法",
    "teacher": "山田智之",
    "room": "3500",
    "department": "教職(ドイツ文・社会福祉・体育(30)・生命科・化)"
  },
  {
    "day": "金",
    "period": 2,
    "name": "特別活動・総合的な学習の時間の指導法",
    "teacher": "山田智之",
    "room": "3500",
    "department": "教職(史)"
  },
  {
    "day": "火",
    "period": 1,
    "name": "特別活動・総合的な学習の時間の指導法",
    "teacher": "中村豊",
    "room": "3500",
    "department": "教職(地理・地球科・数)"
  },
  {
    "day": "火",
    "period": 2,
    "name": "特別活動・総合的な学習の時間の指導法",
    "teacher": "中村豊",
    "room": "3500",
    "department": "教職(英文)"
  },
  {
    "day": "木",
    "period": 1,
    "name": "特別活動・総合的な学習の時間の指導法",
    "teacher": "藤平敦",
    "room": "3500",
    "department": "教職(国文・情報科)"
  },
  {
    "day": "金",
    "period": 4,
    "name": "生徒指導・進路指導論",
    "teacher": "望月由起",
    "room": "3500",
    "department": "教職(国文・生命科)"
  },
  {
    "day": "火",
    "period": 3,
    "name": "生徒指導・進路指導論",
    "teacher": "野内頼一",
    "room": "3500",
    "department": "教職(社会)"
  },
  {
    "day": "火",
    "period": 4,
    "name": "生徒指導・進路指導論",
    "teacher": "野内頼一",
    "room": "3500",
    "department": "教職(ドイツ文・体育(28・29)・心理)"
  },
  {
    "day": "月",
    "period": 1,
    "name": "生徒指導・進路指導論",
    "teacher": "藤平敦",
    "room": "3500",
    "department": "教職(数・情報科・化)"
  },
  {
    "day": "月",
    "period": 2,
    "name": "生徒指導・進路指導論",
    "teacher": "藤平敦",
    "room": "3500",
    "department": "教職(社会福祉・地理)"
  },
  {
    "day": "火",
    "period": 1,
    "name": "生徒指導・進路指導論",
    "teacher": "土屋弥生",
    "room": "3500",
    "department": "教職(体育(30・31・32)・物理)"
  },
  {
    "day": "水",
    "period": 1,
    "name": "生徒指導・進路指導論",
    "teacher": "土屋弥生",
    "room": "3500",
    "department": "教職(哲・史・地球科)"
  },
  {
    "day": "木",
    "period": 1,
    "name": "生徒指導・進路指導論",
    "teacher": "土屋弥生",
    "room": "3500",
    "department": "教職(英文・中国語中国文化)"
  },
  {
    "day": "水",
    "period": 2,
    "name": "教育相談",
    "teacher": "西本和月",
    "room": "3500",
    "department": "教職(哲・国文・ドイツ文)"
  },
  {
    "day": "水",
    "period": 3,
    "name": "教育相談",
    "teacher": "西本和月",
    "room": "3500",
    "department": "教職(社会・社会福祉)"
  },
  {
    "day": "木",
    "period": 3,
    "name": "教育相談",
    "teacher": "西本和月",
    "room": "3500",
    "department": "教職(体育(28・29)・化)"
  },
  {
    "day": "木",
    "period": 4,
    "name": "教育相談",
    "teacher": "西本和月",
    "room": "3500",
    "department": "教職(中国語中国文化・体育(32)・心理・物理・生命科)"
  },
  {
    "day": "木",
    "period": 2,
    "name": "教育相談",
    "teacher": "小川真理",
    "room": "3500",
    "department": "教職(体育(31・30)・地理)"
  },
  {
    "day": "火",
    "period": 3,
    "name": "教育相談",
    "teacher": "伊藤葉",
    "room": "3500",
    "department": "教職(史・地球科)"
  },
  {
    "day": "火",
    "period": 2,
    "name": "教育相談",
    "teacher": "伊藤葉",
    "room": "3500",
    "department": "教職(数)"
  },
  {
    "day": "月",
    "period": 2,
    "name": "情報リテラシー",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(社会(19·20·21))"
  },
  {
    "day": "月",
    "period": 3,
    "name": "情報リテラシー",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(体育(30)・物理)"
  },
  {
    "day": "月",
    "period": 4,
    "name": "情報リテラシー",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(史)"
  },
  {
    "day": "月",
    "period": 5,
    "name": "健康・スポーツ教育論",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(中文・教育・地理)"
  },
  {
    "day": "火",
    "period": 2,
    "name": "情報リテラシー",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(体育(29)・化)"
  },
  {
    "day": "火",
    "period": 3,
    "name": "情報リテラシー",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(心理)"
  },
  {
    "day": "火",
    "period": 4,
    "name": "情報リテラシー",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(英文)"
  },
  {
    "day": "火",
    "period": 5,
    "name": "健康・スポーツ教育論",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(体育)"
  },
  {
    "day": "火",
    "period": 5,
    "name": "情報リテラシー",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(哲・社会(22))"
  },
  {
    "day": "水",
    "period": 2,
    "name": "情報リテラシー",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(国文)"
  },
  {
    "day": "水",
    "period": 3,
    "name": "情報リテラシー",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(体育(28)・地球科)"
  },
  {
    "day": "水",
    "period": 4,
    "name": "情報リテラシー",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(社会(18)・地理)"
  },
  {
    "day": "水",
    "period": 1,
    "name": "健康・スポーツ教育論",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(社会・物理)"
  },
  {
    "day": "水",
    "period": 2,
    "name": "健康・スポーツ教育論",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(国文)"
  },
  {
    "day": "水",
    "period": 3,
    "name": "健康・スポーツ教育論",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(史)"
  },
  {
    "day": "木",
    "period": 2,
    "name": "情報リテラシー",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(体育(31)・生命科)"
  },
  {
    "day": "木",
    "period": 3,
    "name": "情報リテラシー",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(体育(32)・情報科)"
  },
  {
    "day": "木",
    "period": 4,
    "name": "情報リテラシー",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(中国語中国文化・数)"
  },
  {
    "day": "木",
    "period": 1,
    "name": "健康・スポーツ教育論",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(社会福祉・心理・2年生以上)"
  },
  {
    "day": "金",
    "period": 4,
    "name": "情報リテラシー",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(ドイツ文・社会福祉)"
  },
  {
    "day": "金",
    "period": 5,
    "name": "情報リテラシー",
    "teacher": "クラス指定",
    "room": "情報分析室",
    "department": "基礎教育(教育)"
  },
  {
    "day": "月",
    "period": 1,
    "name": "社会科・公民科教育法Ⅰ",
    "teacher": "宇内一文",
    "room": "3204",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 1,
    "name": "国語科教育法Ⅲ",
    "teacher": "野中潤",
    "room": "3309",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 1,
    "name": "教育原論",
    "teacher": "原圭寛",
    "room": "431",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 1,
    "name": "現代教職論",
    "teacher": "野内頼一",
    "room": "3408",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 2,
    "name": "社会科・公民科教育法Ⅰ",
    "teacher": "宇内一文",
    "room": "3204",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 2,
    "name": "現代教職論",
    "teacher": "野内頼一",
    "room": "3204",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 2,
    "name": "教育方法・ICT活用論／教育の方法・技術論",
    "teacher": "小野澤美明子",
    "room": "3508",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 3,
    "name": "生徒指導・進路指導論",
    "teacher": "藤平敦",
    "room": "3508",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 3,
    "name": "発達と学習",
    "teacher": "大森馨子",
    "room": "411",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 4,
    "name": "経済学概論",
    "teacher": "永田長生",
    "room": "412",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "理科実験（生物）",
    "teacher": "澤田博司",
    "room": "生命科第1実験室",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 1,
    "name": "国語科教育法Ⅱ",
    "teacher": "永吉寛行",
    "room": "3307",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 1,
    "name": "国語科教育法Ⅱ",
    "teacher": "野中潤",
    "room": "3307",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 1,
    "name": "社会科・公民科教育法Ⅱ",
    "teacher": "宇内一文",
    "room": "3504",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 1,
    "name": "現代教職論",
    "teacher": "大西圭介",
    "room": "3408",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 1,
    "name": "理科実験（生物）",
    "teacher": "澤田博司",
    "room": "生命科第1実験室",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 2,
    "name": "社会科・地理歴史科教育法Ⅰ",
    "teacher": "宇内一文",
    "room": "3504",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 2,
    "name": "現代教職論",
    "teacher": "大西圭介",
    "room": "3408",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 2,
    "name": "教育課程論",
    "teacher": "栗原幸正",
    "room": "3505",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 3,
    "name": "道徳教育の理論と方法",
    "teacher": "藤平敦",
    "room": "3510",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 3,
    "name": "教職実践演習（中・高）",
    "teacher": "野内頼一",
    "room": "127B",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 4,
    "name": "教職実践演習（中・高）",
    "teacher": "野内頼一",
    "room": "127B",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "政治学概論",
    "teacher": "西尾理",
    "room": "422",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 1,
    "name": "化学概論Ⅰ",
    "teacher": "木屋幸蔵",
    "room": "3206",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "教育の社会学",
    "teacher": "末冨芳",
    "room": "3509",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "社会科・公民科教育法Ⅰ",
    "teacher": "梶輝行",
    "room": "3404",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "教育原論",
    "teacher": "長戸光",
    "room": "3509",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "現代教職論",
    "teacher": "芦田祐佳",
    "room": "3406",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "書道科教育法Ⅰ",
    "teacher": "山下由季",
    "room": "書道教室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "人文地理学概論",
    "teacher": "吉野裕",
    "room": "3305",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "生徒指導・進路指導論",
    "teacher": "土屋弥生",
    "room": "412",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "教育課程論",
    "teacher": "野内頼一",
    "room": "131",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 3,
    "name": "書道（創作）",
    "teacher": "山下由季",
    "room": "書道教室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 3,
    "name": "教育方法・ICT活用論",
    "teacher": "芦田祐佳",
    "room": "3503",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 3,
    "name": "書道（漢字）",
    "teacher": "城間圭太",
    "room": "書道教室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 4,
    "name": "政治学概論",
    "teacher": "西尾理",
    "room": "444",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 4,
    "name": "書法Ⅰ",
    "teacher": "山下由季",
    "room": "書道教室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 5,
    "name": "文章表現法",
    "teacher": "渡寛法",
    "room": "127B",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 1,
    "name": "理科教育法Ⅳ",
    "teacher": "山口晃弘",
    "room": "3306",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "理科教育法Ⅱ",
    "teacher": "山口晃弘",
    "room": "3306",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "発達と学習",
    "teacher": "須永範明",
    "room": "3507",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "社会科・地理歴史科教育法Ⅱ",
    "teacher": "荒井雅子",
    "room": "2304",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 3,
    "name": "宗教科教育法Ⅳ",
    "teacher": "合田秀行",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 4,
    "name": "教職実践演習（中・高）",
    "teacher": "土屋弥生",
    "room": "3501",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 4,
    "name": "書道科教育法Ⅱ",
    "teacher": "山下由季",
    "room": "書道教室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 4,
    "name": "数学科教育法Ⅳ",
    "teacher": "山崎浩二",
    "room": "3410",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 4,
    "name": "人文地理学詳論",
    "teacher": "吉野裕",
    "room": "3204",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 1,
    "name": "数学科教育法Ⅰ",
    "teacher": "山崎浩二",
    "room": "3408",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 1,
    "name": "ドイツ語科教育法Ⅲ",
    "teacher": "保阪靖人",
    "room": "2203",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 1,
    "name": "数学科教育法Ⅲ",
    "teacher": "市原一裕",
    "room": "131",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 1,
    "name": "現代教職論",
    "teacher": "太田知実",
    "room": "3509",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "英語科教育法Ⅰ",
    "teacher": "隅田朗彦",
    "room": "3506",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "発達と学習",
    "teacher": "池見正剛",
    "room": "3510",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "教育制度論",
    "teacher": "小野まどか",
    "room": "131",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "教育と福祉",
    "teacher": "田中謙",
    "room": "3402",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 3,
    "name": "生徒指導・進路指導論",
    "teacher": "土屋弥生",
    "room": "3505",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 3,
    "name": "自然地理学概論",
    "teacher": "八木令子",
    "room": "3205",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 3,
    "name": "文章表現法",
    "teacher": "鹿野しのぶ",
    "room": "3303",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 4,
    "name": "書法Ⅱ",
    "teacher": "徳泉さち",
    "room": "書道教室",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 1,
    "name": "数学科教育法Ⅱ",
    "teacher": "市原一裕",
    "room": "3507",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 1,
    "name": "社会科・公民科教育法Ⅱ",
    "teacher": "杉森知也",
    "room": "3307",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 1,
    "name": "教育原論",
    "teacher": "佐久間邦友",
    "room": "3203",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 1,
    "name": "教育制度論",
    "teacher": "小野まどか",
    "room": "3409",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 1,
    "name": "国語科教育法Ⅳ",
    "teacher": "門脇大",
    "room": "3404",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "教育方法・ICT活用論",
    "teacher": "渡辺雄貴",
    "room": "3410",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "ドイツ語科教育法Ⅳ",
    "teacher": "保阪靖人",
    "room": "2203",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "文章表現法",
    "teacher": "しのぶ",
    "room": "3303",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 3,
    "name": "教職実践演習（中・高）",
    "teacher": "土屋弥生",
    "room": "3501",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 3,
    "name": "教育方法・ICT活用論",
    "teacher": "渡辺雄貴",
    "room": "3410",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 3,
    "name": "書法Ⅱ",
    "teacher": "徳泉さち",
    "room": "書道教室",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 3,
    "name": "書道史",
    "teacher": "徳泉さち",
    "room": "書道教室",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 4,
    "name": "自然地理学詳論",
    "teacher": "薬谷哲也",
    "room": "ML6",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 5,
    "name": "保健体育科教育法甲",
    "teacher": "鈴木理",
    "room": "432",
    "department": "物理学科"
  },
  {
    "day": "木",
    "period": 1,
    "name": "保健体育科教育法Ⅲ",
    "teacher": "鈴木理",
    "room": "432",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "国語科教育法Ⅰ",
    "teacher": "鈴木雅裕",
    "room": "3406",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "教育原論",
    "teacher": "小野雅章",
    "room": "3405",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "地誌学",
    "teacher": "小堀昇",
    "room": "431",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "現代教職論",
    "teacher": "佐久間邦友",
    "room": "3406",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "保健体育科教育法Ⅲ",
    "teacher": "伊佐野龍司",
    "room": "3507",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "中国語科教育法Ⅱ",
    "teacher": "平井和之",
    "room": "122",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "教育相談",
    "teacher": "西本和月",
    "room": "3205",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "理科実験",
    "teacher": "物理",
    "room": "（日高千晴）1・2年実験室",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "宗教科教育法Ⅰ",
    "teacher": "磯部笑子",
    "room": "2202",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "ドイツ語科教育法Ⅰ",
    "teacher": "保阪靖人",
    "room": "研究室",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "法学通論",
    "teacher": "松井丈晴",
    "room": "3206",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "道徳教育の理論と方法",
    "teacher": "河野桃子",
    "room": "3305",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "教育制度論",
    "teacher": "田中謙",
    "room": "3510",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "教育原論",
    "teacher": "小野雅章",
    "room": "3303",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "書道",
    "teacher": "篆刻",
    "room": "（滑田一輝）書道教室",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "教育相談",
    "teacher": "西本和月",
    "room": "3405",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "理科実験",
    "teacher": "物理",
    "room": "（日高千晴）1・2年実験室",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "生徒指導・進路指導論",
    "teacher": "土屋弥生",
    "room": "3308",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "教育方法・ICT活用論",
    "teacher": "藤平敦",
    "room": "3503",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "地学概論1",
    "teacher": "山中勝",
    "room": "3507（※1〜4限通し科目）",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 3,
    "name": "保健体育科教育法Ⅲ",
    "teacher": "鈴木理",
    "room": "432",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 3,
    "name": "保健体育科教育法Ⅲ",
    "teacher": "伊佐野龍司",
    "room": "3507",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 3,
    "name": "理科実験",
    "teacher": "物理",
    "room": "（日高千晴）1・2年実験室",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 3,
    "name": "教職特別講義",
    "teacher": "小野まどか",
    "room": "422",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 3,
    "name": "書論",
    "teacher": "徳泉さち",
    "room": "書道教室（※2〜4限）",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 3,
    "name": "物理学概論1",
    "teacher": "川上隆輝",
    "room": "444（※1〜4限）",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 4,
    "name": "書論",
    "teacher": "徳泉さち",
    "room": "書道教室",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 4,
    "name": "物理学概論1",
    "teacher": "川上隆輝",
    "room": "444",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 4,
    "name": "地学概論1",
    "teacher": "山中勝",
    "room": "3507（通し）",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "英語科教育法Ⅳ",
    "teacher": "小林和歌子",
    "room": "3207",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "保健体育科教育法Ⅳ",
    "teacher": "鈴木理",
    "room": "432",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "国語科教育法Ⅳ",
    "teacher": "鈴木雅裕",
    "room": "3402",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "中国語科教育法Ⅳ",
    "teacher": "平井和之",
    "room": "119",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "保健体育科教育法Ⅳ",
    "teacher": "伊佐野龍司",
    "room": "3507",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 1,
    "name": "中国語科教育法Ⅲ",
    "teacher": "平井和之",
    "room": "119",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "道徳教育の理論と方法",
    "teacher": "日暮トモ子",
    "room": "3407",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "宗教科教育法Ⅱ",
    "teacher": "磯部笑子",
    "room": "2202",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "ドイツ語科教育法Ⅱ",
    "teacher": "保阪靖人",
    "room": "2601",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "特別活動・総合的な学習の時間の指導法",
    "teacher": "藤平敦",
    "room": "3403",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "法学通論",
    "teacher": "松井丈晴",
    "room": "3206",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "地理学詳論",
    "teacher": "中岡裕章",
    "room": "3202",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "教育と福祉",
    "teacher": "田中謙",
    "room": "3506",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 2,
    "name": "地学概論2",
    "teacher": "山中勝",
    "room": "3507（通し）",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 3,
    "name": "保健体育科教育法Ⅳ",
    "teacher": "鈴木理",
    "room": "432",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 3,
    "name": "保健体育科教育法Ⅳ",
    "teacher": "伊佐野龍司",
    "room": "3507",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 3,
    "name": "中国語科教育法Ⅲ",
    "teacher": "平井和之",
    "room": "119",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 3,
    "name": "相対性理論",
    "teacher": "千葉剛",
    "room": "3401",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 3,
    "name": "物性物理学入門",
    "teacher": "上岡隼人",
    "room": "3303",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 4,
    "name": "原子核と素粒子",
    "teacher": "村田佳樹",
    "room": "443",
    "department": "基礎教育科目"
  },
  {
    "day": "木",
    "period": 4,
    "name": "地学概論2",
    "teacher": "山中勝",
    "room": "3507（通し）",
    "department": "基礎教育科目"
  },
  {
    "day": "金",
    "period": 1,
    "name": "微分・積分1",
    "teacher": "石部正",
    "room": "412",
    "department": "基礎教育科目"
  },
  {
    "day": "金",
    "period": 1,
    "name": "生物学概論1",
    "teacher": "池田真理",
    "room": "3503",
    "department": "基礎教育科目"
  },
  {
    "day": "金",
    "period": 1,
    "name": "特別研究A",
    "teacher": "阿部伸行",
    "room": "研究室",
    "department": "基礎教育科目"
  },
  {
    "day": "金",
    "period": 1,
    "name": "物理実験A",
    "teacher": "川上隆輝",
    "room": "1・2年実験室",
    "department": "基礎教育科目"
  },
  {
    "day": "金",
    "period": 2,
    "name": "数値計算入門1",
    "teacher": "中島基樹",
    "room": "ML3",
    "department": "基礎教育科目"
  },
  {
    "day": "金",
    "period": 2,
    "name": "特別研究A",
    "teacher": "阿部伸行",
    "room": "研究室",
    "department": "基礎教育科目"
  },
  {
    "day": "金",
    "period": 1,
    "name": "化学概論2",
    "teacher": "木屋幸蔵",
    "room": "3304",
    "department": "基礎教育科目"
  },
  {
    "day": "金",
    "period": 1,
    "name": "生物学概論2",
    "teacher": "池田真理",
    "room": "3503",
    "department": "基礎教育科目"
  },
  {
    "day": "金",
    "period": 1,
    "name": "量子力学入門",
    "teacher": "十代健",
    "room": "3305",
    "department": "基礎教育科目"
  },
  {
    "day": "金",
    "period": 1,
    "name": "物理実験B",
    "teacher": "川上隆輝",
    "room": "1・2年実験室",
    "department": "基礎教育科目"
  },
  {
    "day": "金",
    "period": 2,
    "name": "数値計算入門2",
    "teacher": "中島基樹",
    "room": "ML5",
    "department": "基礎教育科目"
  },
  {
    "day": "金",
    "period": 2,
    "name": "特別研究B",
    "teacher": "阿部伸行",
    "room": "研究室",
    "department": "基礎教育科目"
  },
  {
    "day": "月",
    "period": 1,
    "name": "力学2",
    "teacher": "玉岡幸太郎",
    "room": "3403",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 1,
    "name": "量子力学1",
    "teacher": "山本大輔",
    "room": "3403",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 1,
    "name": "量子力学1演習",
    "teacher": "山本大輔",
    "room": "3403",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 1,
    "name": "基礎物理実験A",
    "teacher": "上岡隼人",
    "room": "1・2年実験室",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 3,
    "name": "発展物理実験A",
    "teacher": "阿部伸行",
    "room": "3年実験室",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 4,
    "name": "特別研究A",
    "teacher": "十代健",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 4,
    "name": "特別研究A",
    "teacher": "石田浩",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 4,
    "name": "特別研究A",
    "teacher": "橋本拓也",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 2,
    "name": "量子力学2",
    "teacher": "村田佳樹",
    "room": "3410",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 2,
    "name": "量子力学2演習",
    "teacher": "村田佳樹",
    "room": "3410",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 2,
    "name": "基礎物理実験B",
    "teacher": "上岡隼人",
    "room": "1・2年実験室",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 3,
    "name": "発展物理実験B",
    "teacher": "阿部伸行",
    "room": "3年実験室",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 4,
    "name": "特別研究B",
    "teacher": "十代健",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 4,
    "name": "特別研究B",
    "teacher": "石田浩",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 4,
    "name": "特別研究B",
    "teacher": "橋本拓也",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 1,
    "name": "化学概論1",
    "teacher": "木屋幸蔵",
    "room": "3206",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 1,
    "name": "物理学概論1",
    "teacher": "石田浩",
    "room": "432",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 1,
    "name": "物理数学1",
    "teacher": "千葉剛",
    "room": "3404",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 1,
    "name": "物理実験A",
    "teacher": "高橋博樹",
    "room": "1・2年実験室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 1,
    "name": "力学入門",
    "teacher": "玉岡幸太郎",
    "room": "3403",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "宇宙物理学",
    "teacher": "千葉剛",
    "room": "3401",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "電磁気学1演習",
    "teacher": "高橋博樹",
    "room": "3504",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "特別研究A",
    "teacher": "山本大輔",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "統計力学1",
    "teacher": "石田浩",
    "room": "3508",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "物理実験A",
    "teacher": "高橋博樹",
    "room": "1・2年実験室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 3,
    "name": "特別研究A",
    "teacher": "高橋博樹",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 3,
    "name": "量子光学",
    "teacher": "上岡隼人",
    "room": "141",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 3,
    "name": "特別研究A",
    "teacher": "玉岡幸太郎",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 3,
    "name": "統計力学1演習",
    "teacher": "石田浩",
    "room": "3508",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 4,
    "name": "特別研究A",
    "teacher": "山本大輔",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 4,
    "name": "特別研究A",
    "teacher": "村田佳樹",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 4,
    "name": "特別研究A",
    "teacher": "千葉剛",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 1,
    "name": "電磁気学入門",
    "teacher": "上岡隼人",
    "room": "3505",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 1,
    "name": "物理学概論2",
    "teacher": "石田浩",
    "room": "3508",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 1,
    "name": "物理数学2",
    "teacher": "千葉剛",
    "room": "3410",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 1,
    "name": "物理実験B",
    "teacher": "高橋博樹",
    "room": "1・2年実験室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 1,
    "name": "力学1",
    "teacher": "玉岡幸太郎",
    "room": "3403",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "特別研究B",
    "teacher": "高橋博樹",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "特別研究B",
    "teacher": "山本大輔",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "超伝導の科学",
    "teacher": "高橋博樹",
    "room": "132",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "統計力学2",
    "teacher": "石田浩",
    "room": "3508",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "物理実験B",
    "teacher": "高橋博樹",
    "room": "1・2年実験室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 3,
    "name": "特別研究B",
    "teacher": "村田佳樹",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 3,
    "name": "特別研究B",
    "teacher": "山本大輔",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 3,
    "name": "特別研究B",
    "teacher": "玉岡幸太郎",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 3,
    "name": "統計力学2演習",
    "teacher": "石田浩",
    "room": "3508",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 4,
    "name": "特別研究B",
    "teacher": "玉岡幸太郎",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "火",
    "period": 4,
    "name": "特別研究B",
    "teacher": "千葉剛",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 1,
    "name": "線形代数1",
    "teacher": "村田佳樹",
    "room": "3410",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 1,
    "name": "電磁気学1",
    "teacher": "高橋博樹",
    "room": "3507",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 1,
    "name": "物性物理学1",
    "teacher": "橋本拓也",
    "room": "119",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 1,
    "name": "基礎物理実験A",
    "teacher": "十代健",
    "room": "1・2年実験室",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "連続体力学",
    "teacher": "川上隆輝",
    "room": "3503",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "解析力学",
    "teacher": "千葉剛",
    "room": "3202",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "特別研究A",
    "teacher": "高橋博樹",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "物理学演習1",
    "teacher": "阿部伸行",
    "room": "3403",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 3,
    "name": "発展物理実験A",
    "teacher": "橋本拓也",
    "room": "3年実験室",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 4,
    "name": "生物物理学",
    "teacher": "斎藤稔",
    "room": "3503",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 4,
    "name": "特別研究A",
    "teacher": "千葉剛",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 5,
    "name": "特別研究A",
    "teacher": "上岡隼人",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 1,
    "name": "熱力学",
    "teacher": "橋本拓也",
    "room": "3305",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 1,
    "name": "線形代数2",
    "teacher": "石部正",
    "room": "3305",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 1,
    "name": "物性物理学2",
    "teacher": "橋本拓也",
    "room": "3302",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 1,
    "name": "基礎物理実験B",
    "teacher": "十代健",
    "room": "1・2年実験室",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "物理数学3",
    "teacher": "植田高啓",
    "room": "3202",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "特別研究B",
    "teacher": "高橋博樹",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "物理学演習2",
    "teacher": "玉岡幸太郎",
    "room": "3510",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 3,
    "name": "発展物理実験B",
    "teacher": "橋本拓也",
    "room": "3年実験室",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 4,
    "name": "特別研究B",
    "teacher": "上岡隼人",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "水",
    "period": 4,
    "name": "特別研究B",
    "teacher": "千葉剛",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "木",
    "period": 1,
    "name": "地学概論1",
    "teacher": "山中勝",
    "room": "3507",
    "department": "物理学科"
  },
  {
    "day": "木",
    "period": 2,
    "name": "振動と波動",
    "teacher": "三村与士文",
    "room": "3406",
    "department": "物理学科"
  },
  {
    "day": "木",
    "period": 3,
    "name": "電磁気学3",
    "teacher": "鈴木優樹",
    "room": "3401",
    "department": "物理学科"
  },
  {
    "day": "木",
    "period": 3,
    "name": "計算物理学",
    "teacher": "山本大輔",
    "room": "3208",
    "department": "物理学科"
  },
  {
    "day": "木",
    "period": 4,
    "name": "量子力学3",
    "teacher": "村田佳樹",
    "room": "443",
    "department": "物理学科"
  },
  {
    "day": "木",
    "period": 1,
    "name": "地学概論2",
    "teacher": "山中勝",
    "room": "3507",
    "department": "物理学科"
  },
  {
    "day": "木",
    "period": 2,
    "name": "電磁気学2",
    "teacher": "山本大輔",
    "room": "3403",
    "department": "物理学科"
  },
  {
    "day": "木",
    "period": 2,
    "name": "電磁気学2演習",
    "teacher": "山本大輔",
    "room": "3403",
    "department": "物理学科"
  },
  {
    "day": "木",
    "period": 2,
    "name": "微分・積分2",
    "teacher": "高西康敬",
    "room": "3303",
    "department": "物理学科"
  },
  {
    "day": "木",
    "period": 2,
    "name": "生化学1",
    "teacher": "澤田博司",
    "room": "3308",
    "department": "物理学科"
  },
  {
    "day": "木",
    "period": 3,
    "name": "保全生態学",
    "teacher": "中川さやか",
    "room": "3401",
    "department": "物理学科"
  },
  {
    "day": "木",
    "period": 1,
    "name": "学問の扉",
    "teacher": "澤田博司",
    "room": "3505",
    "department": "物理学科"
  },
  {
    "day": "木",
    "period": 2,
    "name": "生化学2",
    "teacher": "澤田博司",
    "room": "3308",
    "department": "物理学科"
  },
  {
    "day": "金",
    "period": 1,
    "name": "特別研究1／生命科学専門実験1",
    "teacher": "岩本政明",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "金",
    "period": 1,
    "name": "生命科学特別講義3",
    "teacher": "健康美容科学",
    "room": "（濱田和人）138",
    "department": "物理学科"
  },
  {
    "day": "金",
    "period": 1,
    "name": "特別研究1／生命科学専門実験1",
    "teacher": "外川微",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "金",
    "period": 1,
    "name": "基礎科学実験1",
    "teacher": "澤田博司",
    "room": "生命科第1実験室",
    "department": "生命科学科"
  },
  {
    "day": "金",
    "period": 2,
    "name": "特別研究1／生命科学専門実験1",
    "teacher": "黒田大祐",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "金",
    "period": 2,
    "name": "特別研究1／生命科学専門実験1",
    "teacher": "岩本政明",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "金",
    "period": 2,
    "name": "基礎科学実験2",
    "teacher": "斎藤稔",
    "room": "生命科第2実験室",
    "department": "生命科学科"
  },
  {
    "day": "金",
    "period": 3,
    "name": "特別研究1／生命科学専門実験1",
    "teacher": "外川徹",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "金",
    "period": 4,
    "name": "特別研究1／生命科学専門実験1",
    "teacher": "黒田大祐",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "金",
    "period": 1,
    "name": "特別研究2／生命科学専門実験2",
    "teacher": "岩本政明",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "金",
    "period": 1,
    "name": "遺伝学2",
    "teacher": "間瀬啓介",
    "room": "3403",
    "department": "物理学科"
  },
  {
    "day": "金",
    "period": 1,
    "name": "生命科学特別講義1",
    "teacher": "バイオテクノロジー",
    "room": "（金恩哲）3504",
    "department": "物理学科"
  },
  {
    "day": "金",
    "period": 1,
    "name": "生命科学特別講義2",
    "teacher": "食品科学",
    "room": "（大倉哲也）3301",
    "department": "物理学科"
  },
  {
    "day": "金",
    "period": 2,
    "name": "特別研究2／生命科学専門実験2",
    "teacher": "黒田大祐",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "金",
    "period": 2,
    "name": "特別研究2／生命科学専門実験2",
    "teacher": "岩本政明",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "金",
    "period": 2,
    "name": "特別研究2／生命科学専門実験2",
    "teacher": "外川徹",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "金",
    "period": 2,
    "name": "基礎科学実験1",
    "teacher": "澤田博司",
    "room": "生命科第1実験室",
    "department": "生命科学科"
  },
  {
    "day": "金",
    "period": 3,
    "name": "特別研究2／生命科学専門実験2",
    "teacher": "外川徹",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "金",
    "period": 4,
    "name": "特別研究2／生命科学専門実験2",
    "teacher": "黒田大祐",
    "room": "研究室",
    "department": "物理学科"
  },
  {
    "day": "土",
    "period": 1,
    "name": "基礎化学1",
    "teacher": "笠原康利",
    "room": "3204",
    "department": "物理学科"
  },
  {
    "day": "土",
    "period": 1,
    "name": "基礎化学2",
    "teacher": "笠原康利",
    "room": "3310",
    "department": "物理学科"
  },
  {
    "day": "土",
    "period": 3,
    "name": "免疫学",
    "teacher": "伊藤聡美",
    "room": "131",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 1,
    "name": "化学特別研究1（卒業研究）",
    "teacher": "早川一郎",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 2,
    "name": "物理化学2（反応速度論）",
    "teacher": "周彪",
    "room": "3206",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 3,
    "name": "無機化学3（酸塩基と結体化学）",
    "teacher": "尾関智二",
    "room": "412",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 4,
    "name": "基礎化学",
    "teacher": "吉田純",
    "room": "3308",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "有機化学1（有機分子の基礎と構造）",
    "teacher": "嶋田修之",
    "room": "3503",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "化学特別研究1（卒業研究）",
    "teacher": "尾関智二",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "化学特別研究1（卒業研究）",
    "teacher": "垣田浩孝",
    "room": "130",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "化学特別研究1（卒業研究）",
    "teacher": "周彪",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "化学特別研究1（卒業研究）",
    "teacher": "吉田純",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "化学特別研究1（卒業研究）",
    "teacher": "藤森裕基",
    "room": "3502",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "化学特別研究1（卒業研究）",
    "teacher": "岩堀史靖",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "物質代謝学",
    "teacher": "門屋利彦",
    "room": "3408",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "展開物理化学特論",
    "teacher": "野口真理子",
    "room": "3503",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "有機構造化学",
    "teacher": "早川一郎",
    "room": "3303",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "環境化学",
    "teacher": "長谷川哲也",
    "room": "3304",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "基礎分析化学特論",
    "teacher": "橋本伸哉",
    "room": "3508",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "資源化学",
    "teacher": "木屋幸蔵",
    "room": "3310",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "発展無機化学特論",
    "teacher": "岩堀史靖",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 1,
    "name": "最前線の化学",
    "teacher": "嶋田修之",
    "room": "3205",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 2,
    "name": "物理化学1（量子論入門）",
    "teacher": "野口真理子",
    "room": "3508",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 3,
    "name": "分析化学1（データ処理・化学平衡・能離）",
    "teacher": "橋本伸哉",
    "room": "3505",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "有機化学2（有機分子の反応性）",
    "teacher": "早川一郎",
    "room": "3407",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "学問の扉",
    "teacher": "藤森裕基",
    "room": "3308",
    "department": "物理学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "化学特別研究2（卒業研究）",
    "teacher": "尾関智二",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "化学特別研究2（卒業研究）",
    "teacher": "垣田浩孝",
    "room": "130",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "化学特別研究2（卒業研究）",
    "teacher": "藤森裕基",
    "room": "3502",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "化学特別研究2（卒業研究）",
    "teacher": "吉田純",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "化学特別研究2（卒業研究）",
    "teacher": "岩堀史靖",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "発展無機化学",
    "teacher": "岩堀史靖",
    "room": "3503",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "有機合成化学",
    "teacher": "大崎愛弓",
    "room": "3509",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "機器分析化学",
    "teacher": "橋本伸哉",
    "room": "3206",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "応用有機化学特論",
    "teacher": "早川一郎",
    "room": "3508",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "固体化学",
    "teacher": "周彪",
    "room": "3503",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 5,
    "name": "応用物理化学特論",
    "teacher": "藤森裕基",
    "room": "3502",
    "department": "化学科"
  },
  {
    "day": "火",
    "period": 1,
    "name": "生物化学1（基礎）",
    "teacher": "垣田浩孝",
    "room": "3203",
    "department": "化学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "有機化学3（官能基と変換）",
    "teacher": "大崎愛弓",
    "room": "3307",
    "department": "化学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "有機化学実験（含演習）",
    "teacher": "嶋田修之",
    "room": "第1学生実験室（3コマ連続）",
    "department": "化学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "分光化学",
    "teacher": "名越篤史",
    "room": "3404",
    "department": "化学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "周期表の化学",
    "teacher": "尾関智二",
    "room": "3408",
    "department": "化学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "機器・物理化学実験（含演習）",
    "teacher": "岩堀史靖",
    "room": "第3・4学生実験室",
    "department": "化学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "応用無機化学特論",
    "teacher": "吉田純",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "生物化学特論",
    "teacher": "垣田浩孝",
    "room": "3402",
    "department": "化学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "化学特別研究1（卒業研究）",
    "teacher": "橋本伸哉",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "発展物理化学特論",
    "teacher": "周彪",
    "room": "2203",
    "department": "化学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "展開無機化学特論",
    "teacher": "尾関智二",
    "room": "3503",
    "department": "化学科"
  },
  {
    "day": "火",
    "period": 1,
    "name": "有機反応化学",
    "teacher": "嶋田修之",
    "room": "3403",
    "department": "化学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "元素の化学",
    "teacher": "尾関智二",
    "room": "3408",
    "department": "化学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "無機・分析化学実験（含演習）",
    "teacher": "尾関智二",
    "room": "第3・4学生実験室",
    "department": "化学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "生物化学実験（含演習）",
    "teacher": "垣田浩孝",
    "room": "第1学生実験室",
    "department": "化学科"
  },
  {
    "day": "火",
    "period": 2,
    "name": "化学特別研究2（卒業研究）",
    "teacher": "早川一郎",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "基礎化学実験",
    "teacher": "藤森裕基",
    "room": "第2学生実験室",
    "department": "化学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "化学特別研究1（卒業研究）",
    "teacher": "野口真理子",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "機器・物理化学実験（含演習）",
    "teacher": "岩堀史靖",
    "room": "第3・4学生実験室",
    "department": "化学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "分析化学2（分離・検出の基礎）",
    "teacher": "葉原正靖",
    "room": "3206",
    "department": "化学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "化学英語",
    "teacher": "葉原正靖",
    "room": "3310",
    "department": "化学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "化学特別研究1（卒業研究）",
    "teacher": "嶋田修之",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "応用無機化学",
    "teacher": "吉田純",
    "room": "441",
    "department": "化学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "展開有機化学特論",
    "teacher": "大崎愛弓",
    "room": "3501",
    "department": "化学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "化学特別研究1（卒業研究）",
    "teacher": "葉原正靖",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "化学実験",
    "teacher": "柳川昭久",
    "room": "第2学生実験室",
    "department": "化学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "生物化学2（生体分子の構造と機能）",
    "teacher": "垣田浩孝",
    "room": "3405",
    "department": "化学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "化学の情報技術",
    "teacher": "小林貴之",
    "room": "ML1",
    "department": "化学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "生物化学実験（含演習）",
    "teacher": "垣田浩孝",
    "room": "第1学生実験室",
    "department": "化学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "分析化学3（バイオ分析・無機分析の基礎）",
    "teacher": "葉原正靖",
    "room": "3206",
    "department": "化学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "量子化学",
    "teacher": "野口真理子",
    "room": "3510",
    "department": "化学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "化学特別研究2（卒業研究）",
    "teacher": "橋本伸哉",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "化学特別研究2（卒業研究）",
    "teacher": "周彪",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "水",
    "period": 2,
    "name": "応用分析化学特論",
    "teacher": "葉原正靖",
    "room": "3401",
    "department": "化学科"
  },
  {
    "day": "木",
    "period": 1,
    "name": "化学数学",
    "teacher": "藤森裕基",
    "room": "3405",
    "department": "化学科"
  },
  {
    "day": "木",
    "period": 1,
    "name": "基礎化学実験",
    "teacher": "柳川昭久",
    "room": "第2学生実験室",
    "department": "化学科"
  },
  {
    "day": "木",
    "period": 1,
    "name": "有機応用化学",
    "teacher": "萩原俊紀",
    "room": "3504",
    "department": "化学科"
  },
  {
    "day": "木",
    "period": 1,
    "name": "機器・物理化学実験（含演習）",
    "teacher": "周彪",
    "room": "第3・4学生実験室",
    "department": "化学科"
  },
  {
    "day": "木",
    "period": 1,
    "name": "化学特別研究1（卒業研究）",
    "teacher": "大崎愛弓",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "木",
    "period": 1,
    "name": "化学特別研究1（卒業研究）",
    "teacher": "藤森裕基",
    "room": "3502",
    "department": "化学科"
  },
  {
    "day": "木",
    "period": 1,
    "name": "化学実験",
    "teacher": "柳川昭久",
    "room": "第2学生実験室",
    "department": "化学科"
  },
  {
    "day": "木",
    "period": 1,
    "name": "エネルギー代謝学",
    "teacher": "丸山厚",
    "room": "411",
    "department": "物理学科"
  },
  {
    "day": "木",
    "period": 1,
    "name": "化学特別研究2（卒業研究）",
    "teacher": "大崎愛弓",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "木",
    "period": 1,
    "name": "化学特別研究2（卒業研究）",
    "teacher": "藤森裕基",
    "room": "3502",
    "department": "化学科"
  },
  {
    "day": "金",
    "period": 2,
    "name": "無機化学1（原子・分子の構造と性質）",
    "teacher": "岩堀史靖",
    "room": "3303",
    "department": "化学科"
  },
  {
    "day": "金",
    "period": 2,
    "name": "有機化学実験（含演習）",
    "teacher": "早川一郎",
    "room": "第1学生実験室",
    "department": "化学科"
  },
  {
    "day": "金",
    "period": 2,
    "name": "無機分析化学",
    "teacher": "長谷川哲也",
    "room": "3408",
    "department": "化学科"
  },
  {
    "day": "金",
    "period": 2,
    "name": "機器・物理化学実験（含演習）",
    "teacher": "周彪",
    "room": "第3・4学生実験室",
    "department": "化学科"
  },
  {
    "day": "金",
    "period": 2,
    "name": "化学特別研究1（卒業研究）",
    "teacher": "葉原正靖",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "金",
    "period": 1,
    "name": "無機化学2（金属・イオン固体と酸化還元）",
    "teacher": "吉田純",
    "room": "3308",
    "department": "化学科"
  },
  {
    "day": "金",
    "period": 1,
    "name": "無機・分析化学実験（含演習）",
    "teacher": "葉原正靖",
    "room": "第3・4学生実験室",
    "department": "化学科"
  },
  {
    "day": "金",
    "period": 1,
    "name": "化学特別研究2（卒業研究）",
    "teacher": "葉原正靖",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "金",
    "period": 1,
    "name": "発展有機化学特論",
    "teacher": "嶋田修之",
    "room": "3409",
    "department": "化学科"
  },
  {
    "day": "金",
    "period": 1,
    "name": "化学特別研究2（卒業研究）",
    "teacher": "嶋田修之",
    "room": "研究室",
    "department": "化学科"
  },
  {
    "day": "月",
    "period": 1,
    "name": "基礎微分積分2【再】",
    "teacher": "竹内司",
    "room": "3206",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "月",
    "period": 1,
    "name": "データ構造",
    "teacher": "谷聖一",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "月",
    "period": 1,
    "name": "線形代数1",
    "teacher": "古市茂",
    "room": "411",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "月",
    "period": 1,
    "name": "情報科学研究1",
    "teacher": "谷聖一",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "月",
    "period": 1,
    "name": "情報科学講究1",
    "teacher": "谷聖一",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "月",
    "period": 2,
    "name": "オブジェクト指向プログラミング",
    "teacher": "尾上洋介",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "月",
    "period": 2,
    "name": "情報科学研究1",
    "teacher": "古市茂",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "月",
    "period": 1,
    "name": "基礎微分積分1【再】",
    "teacher": "竹内司",
    "room": "3303",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "月",
    "period": 1,
    "name": "アルゴリズム",
    "teacher": "谷聖一",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "月",
    "period": 1,
    "name": "線形代数2",
    "teacher": "古市茂",
    "room": "411",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "月",
    "period": 1,
    "name": "情報科学研究2",
    "teacher": "谷聖一",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "月",
    "period": 1,
    "name": "情報科学講究2",
    "teacher": "谷聖一",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "月",
    "period": 2,
    "name": "コンピューティング2",
    "teacher": "中原泳青",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "月",
    "period": 2,
    "name": "情報科学研究2",
    "teacher": "古市茂",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "月",
    "period": 5,
    "name": "Webプログラミング",
    "teacher": "尾上洋介",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "火",
    "period": 1,
    "name": "情報科学講究1",
    "teacher": "宮田章裕",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "火",
    "period": 1,
    "name": "離散数学",
    "teacher": "森山園子",
    "room": "3507",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "火",
    "period": 1,
    "name": "マルチメディア表現",
    "teacher": "藤堂英樹",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "火",
    "period": 1,
    "name": "解析学1",
    "teacher": "前澤俊一",
    "room": "3403",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "火",
    "period": 1,
    "name": "情報科学実習3",
    "teacher": "宮田章裕",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "火",
    "period": 2,
    "name": "情報科学研究1",
    "teacher": "尾崎知伸",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "火",
    "period": 2,
    "name": "ヒューマンインタフェース",
    "teacher": "宮田章裕",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "火",
    "period": 2,
    "name": "情報科学研究1",
    "teacher": "前澤俊一",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "火",
    "period": 2,
    "name": "マルチメディア情報処理",
    "teacher": "辻野雄大",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "火",
    "period": 3,
    "name": "情報科学研究1",
    "teacher": "大澤正彦",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "火",
    "period": 4,
    "name": "情報科学研究1",
    "teacher": "尾上洋介",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "火",
    "period": 5,
    "name": "情報科学研究1",
    "teacher": "宮田章裕",
    "room": "8AB",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "火",
    "period": 1,
    "name": "実践プログラミング2",
    "teacher": "尾崎知伸",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "火",
    "period": 1,
    "name": "基礎プログラミング1【再】",
    "teacher": "森山園子",
    "room": "8B203",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "火",
    "period": 1,
    "name": "幾何学",
    "teacher": "森山園子",
    "room": "3505",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "火",
    "period": 1,
    "name": "情報科学実習1【再】",
    "teacher": "森山園子",
    "room": "8B203",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "火",
    "period": 1,
    "name": "論理と計算",
    "teacher": "尾崎知伸",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "火",
    "period": 2,
    "name": "情報科学講究2",
    "teacher": "宮田章裕",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "火",
    "period": 2,
    "name": "データベース",
    "teacher": "尾上洋介",
    "room": "8B210",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "火",
    "period": 2,
    "name": "情報科学研究2",
    "teacher": "前澤俊一",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "火",
    "period": 2,
    "name": "解析学2",
    "teacher": "前澤俊一",
    "room": "3403",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "火",
    "period": 2,
    "name": "情報科学研究2",
    "teacher": "大澤正彦",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "火",
    "period": 3,
    "name": "情報科学研究2",
    "teacher": "前澤俊一",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "火",
    "period": 3,
    "name": "情報科学研究2",
    "teacher": "大澤正彦",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "火",
    "period": 3,
    "name": "情報科学研究2",
    "teacher": "尾上洋介",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "火",
    "period": 4,
    "name": "情報科学研究2",
    "teacher": "尾上洋介",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "火",
    "period": 5,
    "name": "情報科学研究2",
    "teacher": "宮田章裕",
    "room": "8AB",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "水",
    "period": 1,
    "name": "基礎線形代数1",
    "teacher": "柳田昌宏",
    "room": "3303",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "水",
    "period": 1,
    "name": "確率論",
    "teacher": "柳田昌宏",
    "room": "3303",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "水",
    "period": 1,
    "name": "情報理論1",
    "teacher": "古市茂",
    "room": "3308",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "水",
    "period": 1,
    "name": "情報科学実習1（40組）",
    "teacher": "中原泳青",
    "room": "8B203",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "水",
    "period": 1,
    "name": "情報処理入門1",
    "teacher": "尾上洋介",
    "room": "3308",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "水",
    "period": 2,
    "name": "情報科学実習1（41組）",
    "teacher": "田和辻可昌",
    "room": "8B210",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "水",
    "period": 2,
    "name": "情報科学講究1",
    "teacher": "中原泳青",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "水",
    "period": 3,
    "name": "情報科学講究1",
    "teacher": "古市茂",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "水",
    "period": 1,
    "name": "基礎線形代数2",
    "teacher": "柳田昌宏",
    "room": "3303",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "水",
    "period": 1,
    "name": "学問の扉",
    "teacher": "大澤正彦",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "水",
    "period": 1,
    "name": "情報処理入門2",
    "teacher": "河合未夢",
    "room": "3308",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "水",
    "period": 1,
    "name": "情報科学実習2（40組）",
    "teacher": "河合未夢",
    "room": "8B203",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "水",
    "period": 1,
    "name": "情報科学研究2",
    "teacher": "中原泳青",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "水",
    "period": 2,
    "name": "情報科学研究2",
    "teacher": "中原泳青",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "水",
    "period": 2,
    "name": "情報科学講究2",
    "teacher": "中原泳青",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "水",
    "period": 2,
    "name": "情報理論2",
    "teacher": "古市茂",
    "room": "3406",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "水",
    "period": 2,
    "name": "情報科学実習2（41組）",
    "teacher": "中原泳青",
    "room": "8B210",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "水",
    "period": 3,
    "name": "情報科学講究2",
    "teacher": "古市茂",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "水",
    "period": 3,
    "name": "コンピューティング1",
    "teacher": "大澤正彦",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "木",
    "period": 1,
    "name": "数理計画",
    "teacher": "森山園子",
    "room": "3307",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "木",
    "period": 1,
    "name": "情報科学講究1",
    "teacher": "大澤正彦",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "木",
    "period": 2,
    "name": "情報科学講究1",
    "teacher": "尾上洋介",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "木",
    "period": 3,
    "name": "情報科学講究1",
    "teacher": "前澤俊一",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "木",
    "period": 4,
    "name": "情報科学講究1",
    "teacher": "森山園子",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "木",
    "period": 1,
    "name": "発展プログラミング",
    "teacher": "大澤正彦",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "木",
    "period": 1,
    "name": "情報科学講究2",
    "teacher": "大澤正彦",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "木",
    "period": 2,
    "name": "情報科学講究2",
    "teacher": "尾上洋介",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "木",
    "period": 3,
    "name": "情報科学講究2",
    "teacher": "前澤俊一",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "木",
    "period": 4,
    "name": "情報科学講究2",
    "teacher": "森山園子",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "金",
    "period": 1,
    "name": "データ科学2",
    "teacher": "尾崎知伸",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "金",
    "period": 1,
    "name": "基礎プログラミング1（40組）",
    "teacher": "宮田章裕",
    "room": "8B203",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "金",
    "period": 1,
    "name": "基礎プログラミング2【再】",
    "teacher": "中原泳青",
    "room": "8B203",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "金",
    "period": 1,
    "name": "実践プログラミング1",
    "teacher": "尾崎知伸",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "金",
    "period": 1,
    "name": "情報科学実習2【再】",
    "teacher": "中原泳青",
    "room": "8B203",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "金",
    "period": 2,
    "name": "基礎プログラミング1（41組）",
    "teacher": "宮城優里",
    "room": "8B210",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "金",
    "period": 2,
    "name": "情報科学研究1",
    "teacher": "植村あい子",
    "room": "8AB",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "金",
    "period": 2,
    "name": "基礎微分積分1",
    "teacher": "前澤俊一",
    "room": "3505",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "金",
    "period": 3,
    "name": "代数学",
    "teacher": "前澤俊一",
    "room": "431",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "金",
    "period": 3,
    "name": "オートマトンと形式言語",
    "teacher": "東条敏",
    "room": "3406",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "金",
    "period": 4,
    "name": "情報科学講究1",
    "teacher": "尾崎知伸",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "金",
    "period": 4,
    "name": "情報科学研究1",
    "teacher": "中原泳青",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "金",
    "period": 5,
    "name": "情報科学講究1",
    "teacher": "植村あい子",
    "room": "8AB",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "金",
    "period": 5,
    "name": "情報科学研究1",
    "teacher": "森山園子",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "前期"
  },
  {
    "day": "金",
    "period": 1,
    "name": "デジタルコンテンツ",
    "teacher": "須田拓也",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "金",
    "period": 1,
    "name": "情報科学実習4",
    "teacher": "宮田章裕",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "金",
    "period": 1,
    "name": "基礎プログラミング2（40組）",
    "teacher": "峯岸朋弥",
    "room": "8B203",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "金",
    "period": 1,
    "name": "基礎微分積分2",
    "teacher": "前澤俊一",
    "room": "3206",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "金",
    "period": 1,
    "name": "データ科学1",
    "teacher": "尾崎知伸",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "金",
    "period": 2,
    "name": "情報科学講究2",
    "teacher": "尾崎知伸",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "金",
    "period": 2,
    "name": "基礎プログラミング2（41組）",
    "teacher": "宮田章裕",
    "room": "8B210",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "金",
    "period": 2,
    "name": "オブジェクト指向プログラミング入門",
    "teacher": "尾上洋介",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "金",
    "period": 3,
    "name": "情報科学講究2",
    "teacher": "植村あい子",
    "room": "8AB",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "金",
    "period": 3,
    "name": "情報科学研究2",
    "teacher": "尾崎知伸",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "金",
    "period": 4,
    "name": "情報科学研究2",
    "teacher": "植村あい子",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "金",
    "period": 5,
    "name": "情報科学研究2",
    "teacher": "谷聖一",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "金",
    "period": 5,
    "name": "情報科学研究2",
    "teacher": "宮田章裕",
    "room": "8AB",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "集中",
    "period": 0,
    "name": "暗号理論",
    "teacher": "定兼邦彦",
    "room": "8B203/8B210",
    "department": "情報科学科",
    "semester": "後期"
  },
  {
    "day": "土",
    "period": 1,
    "name": "情報科学研究2",
    "teacher": "森山園子",
    "room": "研究室",
    "department": "情報科学科",
    "semester": "後期"
  }
];

// =========================================================================
// 講義データベース取得（入学年度・カリキュラム体系連動）
// =========================================================================
export function getLectureDatabase(curriculum?: string): LectureCourse[] {
  if (curriculum === 'reiwa6_or_earlier') {
    return LECTURE_DATABASE_REIWA6;
  }
  return LECTURE_DATABASE;
}

// キャンパス主要講義室マスターリスト
export const ALL_CAMPUS_ROOMS = [
  "122", "123", "124", "125", "126", "130", "131", "132", "133", "134", "135", "136", "137A", "137B", "138", "139", "141", "151",
  "2201", "2202", "2203", "2204", "2301", "2302", "2304",
  "3202", "3203", "3204", "3205", "3206", "3207", "3208", "3209",
  "3301", "3302", "3303", "3304", "3305", "3306", "3307", "3308", "3309", "3310",
  "3401", "3402", "3403", "3404", "3405", "3406", "3407", "3408", "3409", "3410",
  "3501", "3502", "3503", "3504", "3505", "3506", "3507", "3508", "3509", "3510",
  "411", "412", "421", "422", "431", "432", "441", "442", "443", "444"
];

// =========================================================================
// 1. リアルタイム空き教室・自習スポット検索
// =========================================================================
export interface FreeRoomsResult {
  day: string;
  period: number;
  isLunchBreak: boolean;
  totalFreeCount: number;
  freeRooms: string[];
  byBuilding: { [bld: string]: string[] };
  formattedReport: string;
}

export function findFreeRooms(
  targetDay?: string,
  targetPeriod?: number,
  targetBuilding?: string,
  curriculum?: string
): FreeRoomsResult {
  const db = getLectureDatabase(curriculum);
  const now = new Date();
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const curDay = targetDay || (dayNames[now.getDay()] === '日' ? '月' : dayNames[now.getDay()]);

  let curPeriod = targetPeriod;
  let isLunch = false;

  if (curPeriod === undefined) {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMin = hours * 60 + minutes;

    if (totalMin < 10 * 60 + 35) {
      curPeriod = 1; // 09:00〜10:30
    } else if (totalMin < 12 * 60 + 10) {
      curPeriod = 2; // 10:40〜12:10
    } else if (totalMin < 13 * 60) {
      curPeriod = 2; // 昼休み
      isLunch = true;
    } else if (totalMin < 14 * 60 + 35) {
      curPeriod = 3; // 13:00〜14:30
    } else if (totalMin < 16 * 60 + 15) {
      curPeriod = 4; // 14:40〜16:10
    } else {
      curPeriod = 5; // 16:20〜17:50
    }
  }

  // 該当曜日・時限に使用中の教室を抽出
  const occupiedSet = new Set<string>();
  if (!isLunch) {
    db.forEach((c) => {
      if (c.day === curDay && c.period === curPeriod) {
        const rooms = c.room.split(/[/／,\s]+/);
        rooms.forEach((r) => {
          const clean = r.trim().toUpperCase();
          if (clean) occupiedSet.add(clean);
        });
      }
    });
  }

  const freeRooms = ALL_CAMPUS_ROOMS.filter((r) => !occupiedSet.has(r));

  const byBuilding: { [bld: string]: string[] } = {
    '1号館': freeRooms.filter((r) => r.startsWith('1')),
    '2号館': freeRooms.filter((r) => r.startsWith('2')),
    '3号館': freeRooms.filter((r) => r.startsWith('3')),
    '4号館': freeRooms.filter((r) => r.startsWith('4'))
  };

  const periodTimeMap: Record<number, string> = {
    1: '09:00〜10:30',
    2: isLunch ? '12:10〜13:00（昼休み）' : '10:40〜12:10',
    3: '13:00〜14:30',
    4: '14:40〜16:10',
    5: '16:20〜17:50'
  };

  const lines: string[] = [];
  const timeDesc = periodTimeMap[curPeriod] ? `（${periodTimeMap[curPeriod]}）` : '';
  lines.push(`${curDay}曜日の${curPeriod}限${timeDesc}に使える空き教室をお調べしました！`);
  lines.push('');

  if (isLunch) {
    lines.push('文理学部ではお昼休み時間中（12時10分から13時）、授業の入っていない一般講義室が休憩や昼食、自習用に開放されていますよ。飲食した後のゴミは各階のゴミ箱へ分別して捨てるか持ち帰るようにしてくださいね。また、3限の受講生が入ってきたら席を譲るように配慮しましょう。');
    lines.push('');
  }

  if (targetBuilding) {
    const bldRooms = byBuilding[targetBuilding] || [];
    if (bldRooms.length > 0) {
      lines.push(`${targetBuilding}では ${bldRooms.slice(0, 10).map(getCompactRoomLabel).join('、')} などが利用できますよ。`);
    } else {
      lines.push(`現在、${targetBuilding}には利用できる空き教室がありませんでした。`);
    }
  } else {
    const b3 = byBuilding['3号館'].length > 0 ? `3号館は ${byBuilding['3号館'].slice(0, 5).map(getCompactRoomLabel).join('、')} など、` : '';
    const b4 = byBuilding['4号館'].length > 0 ? `4号館は ${byBuilding['4号館'].slice(0, 4).map(getCompactRoomLabel).join('、')} など、` : '';
    const b1 = byBuilding['1号館'].length > 0 ? `1号館は ${byBuilding['1号館'].slice(0, 4).map(getCompactRoomLabel).join('、')} など、` : '';
    lines.push(`${b3}${b4}${b1}キャンパス全体で合計${freeRooms.length}室が空いていますよ。`);
  }

  lines.push('');
  lines.push('もし静かに自習やPC作業をしたいときは、本館1階のラーニングコモンズ（18時まで開館）や図書館（20時まで開館）を利用するのもおすすめです！');

  return {
    day: curDay,
    period: curPeriod,
    isLunchBreak: isLunch,
    totalFreeCount: freeRooms.length,
    freeRooms,
    byBuilding,
    formattedReport: lines.join('\n')
  };
}

// =========================================================================
// 2. 履修登録サポート＆「空きコマ」活用提案
// =========================================================================
export interface ConflictCheckResult {
  hasConflict: boolean;
  conflicts: { day: string; period: number; courses: string[] }[];
  formattedReport: string;
}

export function checkCourseConflicts(courseNames: string[], curriculum?: string): ConflictCheckResult {
  const db = getLectureDatabase(curriculum);
  const slotMap: { [slot: string]: string[] } = {};

  courseNames.forEach((target) => {
    const clean = target.trim();
    const hit = db.find((c) => c.name.includes(clean) || clean.includes(c.name));
    if (hit && hit.day && hit.period) {
      const slot = `${hit.day}曜${hit.period}限`;
      if (!slotMap[slot]) slotMap[slot] = [];
      slotMap[slot].push(`${hit.name}（${hit.teacher} / ${hit.room}）`);
    }
  });

  const conflicts: { day: string; period: number; courses: string[] }[] = [];
  const lines: string[] = ['時間割の重複をチェックしてみました！', ''];

  let hasConflict = false;
  Object.entries(slotMap).forEach(([slot, list]) => {
    if (list.length > 1) {
      hasConflict = true;
      const m = slot.match(/([月火水木金土])曜(\d)限/);
      const d = m ? m[1] : '月';
      const p = m ? parseInt(m[2], 10) : 1;
      conflicts.push({ day: d, period: p, courses: list });
      lines.push(`${slot} で ${list.join(' と ')} の時間が重なってしまっています。同じコマには1科目しか登録できないので、どちらか一方を選んでみてくださいね。`);
    }
  });

  if (!hasConflict) {
    lines.push(`チェックした科目の中で時間の重複はありませんでした！すべて重ならずに登録できますよ。`);
  }

  return {
    hasConflict,
    conflicts,
    formattedReport: lines.join('\n')
  };
}

export function suggestCoursesForFreePeriod(
  day: string,
  period: number,
  categoryFilter?: string,
  curriculum?: string
): string {
  const db = getLectureDatabase(curriculum);
  const matches = db.filter((c) => {
    if (c.day !== day || c.period !== period) return false;
    if (categoryFilter) {
      return (
        c.department.includes(categoryFilter) ||
        c.name.includes(categoryFilter)
      );
    }
    // デフォルトは総合教育科目・外国語・基礎科目などを優先
    return (
      c.department.includes('総合') ||
      c.department.includes('外国語') ||
      c.department.includes('基礎') ||
      c.department.includes('全学')
    );
  });

  const lines: string[] = [
    `${day}曜${period}限の空きコマに履修できるおすすめの科目をピックアップしました！`,
    ''
  ];

  if (matches.length > 0) {
    const listText = matches.slice(0, 5).map((c) => `${c.name}（${c.teacher}先生 / ${getCompactRoomLabel(c.room)} / ${c.department}）`).join('、');
    lines.push(`たとえば、${listText} などが開講されていますよ。`);
  } else {
    const allMatches = db.filter((c) => c.day === day && c.period === period);
    const listText = allMatches.slice(0, 5).map((c) => `${c.name}（${c.teacher}先生 / ${getCompactRoomLabel(c.room)}）`).join('、');
    lines.push(`該当コマでは ${listText} などが開講されていますよ。`);
  }

  lines.push('');
  lines.push('総合教育科目は人文、社会、理学からそれぞれ2単位ずつ取る必要があるので、空きコマを上手に活用して計画的に進めてみてくださいね。');
  return lines.join('\n');
}

// =========================================================================
// 3. 学部要覧連動「必修組み込み済みの自動スケジュール提案」
// =========================================================================
export function proposeAutomaticSchedule(
  department: string,
  grade: number,
  curriculum?: string,
  requiredCourseNames?: string[]
): string {
  const db = getLectureDatabase(curriculum);
  const curLabel = curriculum === 'reiwa6_or_earlier' ? '（令和6年度以前入学者・旧カリキュラム）' : '（令和7年度以降入学者・新カリキュラム）';

  const lines: string[] = [
    `${department}の${grade}年次向けに、おすすめの時間割の組み合わせを考えてみました！学科の必修科目を優先して配置しています。`,
    ''
  ];

  // 曜日ごとのグリッド作成 (月1〜金5)
  const grid: { [slot: string]: string } = {};

  // 1. 学科必修科目スロット埋め
  const targetReqs = requiredCourseNames && requiredCourseNames.length > 0 ? requiredCourseNames : [
    '自主創造の基礎', '情報リテラシー', 'プログラミング基礎', 'データ構造', 'アルゴリズム', '線形代数1', '基礎微分積分1'
  ];

  targetReqs.forEach((rName) => {
    const hit = db.find((c) => (c.name.includes(rName) || rName.includes(c.name)) && c.period > 0);
    if (hit) {
      const slot = `${hit.day}曜${hit.period}限`;
      if (!grid[slot]) {
        grid[slot] = `${hit.name}（必修 / ${hit.teacher}先生 / ${getCompactRoomLabel(hit.room)}）`;
      }
    }
  });

  // 2. 空きスロットに総合教育科目をサジェスト
  const days = ['月', '火', '水', '木', '金'];
  days.forEach((d) => {
    for (let p = 1; p <= 5; p++) {
      const slot = `${d}曜${p}限`;
      if (!grid[slot]) {
        const sogoHit = db.find(
          (c) => c.day === d && c.period === p && (c.department.includes('総合') || c.department.includes('教養'))
        );
        if (sogoHit) {
          grid[slot] = `${sogoHit.name}（総合 / ${sogoHit.teacher}先生 / ${getCompactRoomLabel(sogoHit.room)}）`;
        }
      }
    }
  });

  // 出力生成
  days.forEach((d) => {
    const dayClasses: string[] = [];
    for (let p = 1; p <= 5; p++) {
      const slot = `${d}曜${p}限`;
      if (grid[slot]) {
        dayClasses.push(`${p}限に${grid[slot]}`);
      }
    }
    if (dayClasses.length > 0) {
      lines.push(`${d}曜日は、${dayClasses.join('、')} を入れています。`);
    } else {
      lines.push(`${d}曜日は授業を入れていないので、自習や課題に充てられますよ。`);
    }
  });

  lines.push('');
  lines.push('年間の履修上限は40単位なので、1学期あたり20単位前後を目安にして、自分の受講したい科目や外国語のクラス指定に合わせて調整してみてくださいね。');

  return lines.join('\n');
}

// =========================================================================
// 4. キャンパス移動・10分休みの最適化ナビ
// =========================================================================
export function calculateTransitOptimization(fromRoomRaw: string, toRoomRaw: string): string {
  const parseRoom = (r: string) => {
    const clean = r.trim().toUpperCase();
    let bld = '他';
    let floor = 1;
    if (clean.startsWith('1')) {
      bld = '1号館';
      floor = clean.length >= 3 ? parseInt(clean[1], 10) : 1;
    } else if (clean.startsWith('2')) {
      bld = '2号館';
      floor = clean.length >= 4 ? parseInt(clean[1], 10) : 2;
    } else if (clean.startsWith('3')) {
      bld = '3号館';
      floor = clean.length >= 4 ? parseInt(clean[1], 10) : 3;
    } else if (clean.startsWith('4')) {
      bld = '4号館';
      floor = clean.length >= 3 ? parseInt(clean[1], 10) : 1;
    } else if (clean.startsWith('8')) {
      bld = '8号館';
      floor = 2;
    }
    return { name: clean, bld, floor };
  };

  const from = parseRoom(fromRoomRaw);
  const to = parseRoom(toRoomRaw);

  const lines: string[] = [
    `${getCompactRoomLabel(from.name)}から${getCompactRoomLabel(to.name)}への移動ですね！`,
    ''
  ];

  let estMinutes = 3;
  let feasibility = '余裕をもって移動できますよ';
  let routeAdvice = '';

  if (from.bld === to.bld) {
    const floorDiff = Math.abs(from.floor - to.floor);
    estMinutes = Math.max(2, floorDiff * 1 + 1);
    feasibility = '同じ棟の中なのでスムーズに移動できます';
    routeAdvice = `同じ${from.bld}内の移動（${from.floor}階から${to.floor}階）です。休み時間はエレベーターが並びやすいので、中央階段を使うと約${estMinutes}分でスムーズに移動できますよ。`;
  } else {
    // 号館間移動
    if ((from.bld === '3号館' && to.bld === '1号館') || (from.bld === '1号館' && to.bld === '3号館')) {
      estMinutes = 5 + (from.floor >= 4 ? 2 : 0);
      feasibility = estMinutes <= 7 ? '10分以内で十分間に合います' : '少し早めに移動するのが安心です';
      routeAdvice = `3号館と1号館は中庭（サクラプロムナード）を挟んで向かい合っています。3号館の上層階から降りる時はエレベーターが混むので、階段で1階に降りて中庭通路を抜けるルートが一番早くておすすめです（移動目安：約${estMinutes}分）。`;
    } else if ((from.bld === '4号館' && to.bld === '1号館') || (from.bld === '1号館' && to.bld === '4号館')) {
      estMinutes = 4;
      routeAdvice = `1号館と4号館はお隣の建物です。1階のエントランス通路を通って約${estMinutes}分で移動できますよ。4号館1階の給水所で水分補給するのにもちょうど良いルートです。`;
    } else if ((from.bld === '3号館' && to.bld === '4号館') || (from.bld === '4号館' && to.bld === '3号館')) {
      estMinutes = 3;
      routeAdvice = `3号館と4号館は隣接しているので、渡り通路を使って約${estMinutes}分で到着できます。`;
    } else {
      estMinutes = 5;
      routeAdvice = `${from.bld}から${to.bld}へは、屋外通路を歩いて約${estMinutes}分ほどで到着できますよ。`;
    }
  }

  lines.push(`移動にかかる時間は約${estMinutes}分が目安で、${feasibility}。`);
  lines.push(routeAdvice);
  lines.push('もし移動先の教室が前のコマで空いていれば、少し早めに入って好きな席をとっておくのもおすすめです！');

  return lines.join('\n');
}

// =========================================================================
// 5. 科目・教員・教室の逆引き検索 & 教室使用スケジュール
// =========================================================================
export function getRoomDailySchedule(roomNumber: string, targetDay?: string, curriculum?: string): string {
  const db = getLectureDatabase(curriculum);
  const now = new Date();
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const curDay = targetDay || (dayNames[now.getDay()] === '日' ? '月' : dayNames[now.getDay()]);
  const cleanRoom = roomNumber.trim().toUpperCase();

  const lines: string[] = [
    `${curDay}曜日の${getCompactRoomLabel(cleanRoom)}（${cleanRoom}教室）の予定を確認しました！`,
    ''
  ];

  for (let p = 1; p <= 5; p++) {
    const hits = db.filter((c) => {
      if (c.day !== curDay || c.period !== p) return false;
      const rooms = c.room.split(/[/／,\s]+/);
      return rooms.some((r) => r.trim().toUpperCase() === cleanRoom);
    });

    if (hits.length > 0) {
      const h = hits[0];
      lines.push(`${p}限は授業で使用中です（${h.name} / ${h.teacher}先生）。`);
    } else {
      lines.push(`${p}限は空き教室なので、自習などに利用できますよ。`);
    }
  }

  lines.push('');
  lines.push('お昼休み（12時10分から13時）はすべての教室が自習や休憩用に開放されています！');
  return lines.join('\n');
}

