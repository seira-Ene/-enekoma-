import { UserProfileData, EnrolledCourseItem } from './gakubuYoran';

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  shortLabel?: string;
  source?: 'gemini' | 'local';
  model?: string;
  timestamp: string;
  imagePreview?: string;
  imageTypeLabel?: string;
}

export interface StudentAccount {
  id: string;             // 学籍番号またはログインID
  name: string;           // 氏名・ニックネーム
  password: string;       // パスワード
  department: string;     // 所属学科（文理学部18学科）
  grade: number;          // 1〜4年
  admissionYear: 'reiwa7_or_later' | 'reiwa6_or_earlier';
  profile: UserProfileData;
  chatHistory: ChatMessageItem[];
  createdAt: string;
  lastLoginAt: string;
}

// 初期シードデモアカウント（即座に複数学生の切り替え体験が可能）
export const INITIAL_DEMO_ACCOUNTS: Record<string, StudentAccount> = {
  '5424001': {
    id: '5424001',
    name: '日大 文太',
    password: '1234',
    department: '情報科学科',
    grade: 2,
    admissionYear: 'reiwa7_or_later',
    createdAt: '2025-04-01T09:00:00Z',
    lastLoginAt: '2026-10-20T10:00:00Z',
    profile: {
      department: '情報科学科',
      grade: 2,
      admissionYear: 'reiwa7_or_later',
      currentCredits: 38,
      currentGpa: 2.92,
      targetGpa: 3.20,
      semesterCredits: 16,
      selectedCourses: [],
      selectedMinors: ['データサイエンス副専攻'],
      completedCourses: [
        { name: '自主創造の基礎', credits: 2, grade: 'S', year: 1 },
        { name: '情報リテラシー', credits: 2, grade: 'A', year: 1 },
        { name: '健康・スポーツ教育論', credits: 2, grade: 'A', year: 1 },
        { name: '健康・スポーツ教育実習1', credits: 1, grade: 'S', year: 1 },
        { name: '基礎プログラミング', credits: 2, grade: 'S', year: 1 },
        { name: 'コンピュータシステム基礎', credits: 2, grade: 'A', year: 1 },
        { name: '線形代数1', credits: 2, grade: 'B', year: 1 },
        { name: '微分積分1', credits: 2, grade: 'A', year: 1 }
      ],
      enrolledCourses: [
        { name: 'プログラミング演習', day: '月', period: 2, room: '3306', teacher: '高橋 先生', credits: 2 },
        { name: '離散数学', day: '火', period: 3, room: '3405', teacher: '佐藤 先生', credits: 2 },
        { name: 'データ構造とアルゴリズム', day: '水', period: 2, room: '3301', teacher: '鈴木 先生', credits: 2 },
        { name: 'コンピュータネットワーク', day: '木', period: 4, room: '3505', teacher: '伊藤 先生', credits: 2 }
      ]
    },
    chatHistory: [
      {
        id: 'init_bunta',
        sender: 'assistant',
        text: 'こんにちは、文太さん（情報科学科 2年）。今期はプログラミング演習や離散数学など16単位を履修中ですね。空き教室検索や単位・GPAの相談など何でも聞いてください。',
        shortLabel: 'おかえりなさい',
        source: 'local',
        timestamp: '10:00'
      }
    ]
  },
  '5123042': {
    id: '5123042',
    name: '桜上水 花子',
    password: '1234',
    department: '国文学科',
    grade: 3,
    admissionYear: 'reiwa6_or_earlier',
    createdAt: '2024-04-01T09:00:00Z',
    lastLoginAt: '2026-10-20T11:00:00Z',
    profile: {
      department: '国文学科',
      grade: 3,
      admissionYear: 'reiwa6_or_earlier',
      currentCredits: 76,
      currentGpa: 3.25,
      targetGpa: 3.40,
      semesterCredits: 18,
      selectedCourses: ['教職コース（中高免許）', '司書教諭コース'],
      selectedMinors: ['グローバル・コミュニケーション副専攻'],
      completedCourses: [
        { name: '自主創造の基礎', credits: 2, grade: 'S', year: 1 },
        { name: '国語学概論', credits: 2, grade: 'S', year: 1 },
        { name: '日本文学史概論', credits: 2, grade: 'A', year: 1 },
        { name: '漢文学概論', credits: 2, grade: 'A', year: 1 },
        { name: '教育原理', credits: 2, grade: 'A', year: 2 },
        { name: '教育心理学', credits: 2, grade: 'S', year: 2 }
      ],
      enrolledCourses: [
        { name: '日本古典文学演習', day: '月', period: 3, room: '421', teacher: '渡辺 先生', credits: 2 },
        { name: '近代文学演習', day: '水', period: 2, room: '431', teacher: '小林 先生', credits: 2 },
        { name: '道徳教育の指導法', day: '木', period: 3, room: '130', teacher: '加藤 先生', credits: 2 }
      ]
    },
    chatHistory: [
      {
        id: 'init_hanako',
        sender: 'assistant',
        text: 'こんにちは、花子さん（国文学科 3年）。教職課程・司書教諭コースの単位要件達成に向けて順調に進んでいます。4年次の教育実習や卒論着手条件（要覧 p.69）の確認も可能です。',
        shortLabel: 'おかえりなさい',
        source: 'local',
        timestamp: '11:00'
      }
    ]
  }
};

const STORAGE_KEY_ACCOUNTS = 'enekoma_accounts_db';
const STORAGE_KEY_CURRENT_ID = 'enekoma_current_student_id';

// アカウント一覧の取得（未初期化時はデモアカウントを投入）
export function loadAllAccounts(): Record<string, StudentAccount> {
  if (typeof window === 'undefined') return INITIAL_DEMO_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(INITIAL_DEMO_ACCOUNTS));
      return INITIAL_DEMO_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || Object.keys(parsed).length === 0) {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(INITIAL_DEMO_ACCOUNTS));
      return INITIAL_DEMO_ACCOUNTS;
    }
    return parsed;
  } catch {
    return INITIAL_DEMO_ACCOUNTS;
  }
}

// アカウント情報の保存・更新
export function saveStudentAccount(account: StudentAccount): void {
  if (typeof window === 'undefined') return;
  try {
    const all = loadAllAccounts();
    all[account.id] = {
      ...account,
      lastLoginAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save student account:', e);
  }
}

// 現在ログイン中のアカウントID
export function getCurrentStudentId(): string | null {
  if (typeof window === 'undefined') return null;
  // セッション単位でのみログインを保持（再アクセス・他者のアクセス時は必ず初期ゲスト状態）
  return sessionStorage.getItem(STORAGE_KEY_CURRENT_ID) || null;
}

export function setCurrentStudentId(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (id) {
    sessionStorage.setItem(STORAGE_KEY_CURRENT_ID, id);
    // 旧バージョンのlocalStorage永続キーがあれば削除
    localStorage.removeItem(STORAGE_KEY_CURRENT_ID);
  } else {
    sessionStorage.removeItem(STORAGE_KEY_CURRENT_ID);
    localStorage.removeItem(STORAGE_KEY_CURRENT_ID);
  }
}

// 現在のアカウントを取得
export function getCurrentStudent(): StudentAccount | null {
  const currentId = getCurrentStudentId();
  if (!currentId) return null;
  const accounts = loadAllAccounts();
  return accounts[currentId] || null;
}

// 認証（ログイン）
export function authenticateStudent(id: string, password?: string): StudentAccount | null {
  const accounts = loadAllAccounts();
  const acc = accounts[id.trim()];
  if (!acc) return null;
  if (password && acc.password && acc.password !== password.trim()) {
    return null;
  }
  setCurrentStudentId(acc.id);
  saveStudentAccount(acc);
  return acc;
}

// 新規学生アカウント登録
export function registerNewStudent(data: {
  id: string;
  name: string;
  password?: string;
  department: string;
  grade?: number;
  admissionYear?: 'reiwa7_or_later' | 'reiwa6_or_earlier';
  selectedCourses?: string[];
  selectedMinors?: string[];
  initialProfile?: Partial<UserProfileData>;
}): StudentAccount {
  const accounts = loadAllAccounts();
  const studentId = data.id.trim();
  const name = data.name.trim() || `学生(${studentId})`;
  const department = data.department || '情報科学科';
  const grade = data.grade || 1;
  const admissionYear = data.admissionYear || 'reiwa7_or_later';
  const password = (data.password || '1234').trim();
  const selectedCourses = data.selectedCourses || [];
  const selectedMinors = data.selectedMinors || [];

  const enrolledCourses = data.initialProfile?.enrolledCourses || [];
  const completedCourses = data.initialProfile?.completedCourses || [];
  const semCredits = data.initialProfile?.semesterCredits ?? enrolledCourses.reduce((sum, c) => sum + (c.credits || 2), 0);
  const earnedCredits = data.initialProfile?.currentCredits ?? (completedCourses.length > 0 ? completedCourses.reduce((sum, c) => sum + (c.credits || 2), 0) : (grade === 1 ? 0 : grade === 2 ? 30 : grade === 3 ? 64 : 96));
  const gpa = data.initialProfile?.currentGpa ?? 2.80;

  const timetableCount = enrolledCourses.length;
  const completedCount = completedCourses.length;

  let welcomeDetail = '';
  if (timetableCount > 0 && earnedCredits > 0) {
    welcomeDetail = `\n\n【登録時に自動反映されたカルテ】\n・**今期履修中**: ${timetableCount}科目（${semCredits}単位）を登録しました。\n・**修得済み**: ${earnedCredits}単位（GPA: ${gpa.toFixed(2)}）を反映しました。`;
  } else if (timetableCount > 0) {
    welcomeDetail = `\n\n【登録時に自動反映されたカルテ】\n・**今期履修中**: ${timetableCount}科目（${semCredits}単位）を登録しました。`;
  } else if (earnedCredits > 0) {
    welcomeDetail = `\n\n【登録時に自動反映されたカルテ】\n・**修得済み**: ${earnedCredits}単位（GPA: ${gpa.toFixed(2)}）を反映しました。`;
  }

  const courseNotice = selectedCourses.length > 0 ? `\n・選択コース: ${selectedCourses.join(', ')}` : '';
  const minorNotice = selectedMinors.length > 0 ? `\n・選択副専攻: ${selectedMinors.join(', ')}` : '';

  const newAccount: StudentAccount = {
    id: studentId,
    name,
    password,
    department,
    grade,
    admissionYear,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    profile: {
      department,
      grade,
      admissionYear,
      currentCredits: earnedCredits,
      currentGpa: gpa,
      targetGpa: data.initialProfile?.targetGpa ?? 3.20,
      semesterCredits: semCredits,
      selectedCourses,
      selectedMinors,
      completedCourses,
      enrolledCourses
    },
    chatHistory: [
      {
        id: `welcome_${Date.now()}`,
        sender: 'assistant',
        text: `日本大学文理学部（${department}）の学生ポータル「EneKoma」へようこそ、${name}さん。\n\nあなた専用の履修カルテが作成されました。${welcomeDetail}${courseNotice}${minorNotice}\n\n空き教室検索や単位・GPAの相談、要覧ルールの確認など何でも聞いてください。`,
        shortLabel: '登録完了',
        source: 'local',
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      }
    ]
  };

  accounts[studentId] = newAccount;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    setCurrentStudentId(studentId);
  }
  return newAccount;
}

// JSON文字列のクリーニング・修復ユーティリティ
function tryCleanAndParseJson(raw: string): any {
  if (!raw) return null;
  // コメント削除、末尾カンマ削除
  let clean = raw
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/,\s*([}\]])/g, '$1')
    .trim();

  // 1. そのままパース
  try {
    return JSON.parse(clean);
  } catch (e) {}

  // 2. 最も外側の { ... } を抽出
  const braceMatch = clean.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      const fixed = braceMatch[0].replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(fixed);
    } catch (e) {}
  }

  // 3. トークン上限等で末尾が切れている場合の閉じ括弧自動補完
  if (clean.includes('{') && !clean.endsWith('}')) {
    const attempts = [
      clean + ']}',
      clean + '"}]}',
      clean + '}',
      clean + '"}'
    ];
    for (const att of attempts) {
      try {
        const fixed = att.replace(/,\s*([}\]])/g, '$1');
        const parsed = JSON.parse(fixed);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {}
    }
  }

  return null;
}

// テキスト・OCR出力からのプロフィール更新JSON抽出ユーティリティ（クライアント・サーバー両用）
export function parseProfileUpdateFromText(text: string, isImage: boolean = false): any {
  if (!text) return null;

  // 1. ```profile_update ... ```
  const matchUpdate = text.match(/```(?:profile_update|profileupdate)\s*([\s\S]*?)(?:```|$)/i);
  if (matchUpdate) {
    const parsed = tryCleanAndParseJson(matchUpdate[1]);
    if (parsed && (parsed.enrolledCourses || parsed.action || parsed.addCompletedCourses || parsed.completedCourses || parsed.totalEarnedCredits !== undefined)) {
      return parsed;
    }
  }

  // 2. ```json ... ``` または ``` ... ``` 内のJSONブロック
  const codeBlocks = Array.from(text.matchAll(/```(?:json)?\s*([\s\S]*?)(?:```|$)/gi));
  for (const blk of codeBlocks) {
    const parsed = tryCleanAndParseJson(blk[1]);
    if (parsed && (parsed.enrolledCourses || parsed.action || parsed.addCompletedCourses || parsed.completedCourses || parsed.totalEarnedCredits !== undefined)) {
      return parsed;
    }
  }

  // 3. raw JSON
  const rawMatch = text.match(/\{[\s\S]*?"(?:enrolledCourses|addCompletedCourses|completedCourses|action|totalEarnedCredits)"[\s\S]*?\}/);
  if (rawMatch) {
    const parsed = tryCleanAndParseJson(rawMatch[0]);
    if (parsed && (parsed.enrolledCourses || parsed.action || parsed.addCompletedCourses || parsed.completedCourses || parsed.totalEarnedCredits !== undefined)) {
      return parsed;
    }
  }

  // 4. 成績通知書のテキスト解析救済（単位数、GPA、修得科目の正規表現抽出）
  const isTranscriptContext = isImage || text.includes('成績') || text.includes('GPA') || text.includes('修得単位') || text.includes('通知書');
  if (isTranscriptContext) {
    let extractedCredits: number | undefined = undefined;
    let extractedGpa: number | undefined = undefined;
    const completedCourses: any[] = [];

    // 総修得単位の抽出
    const creditsMatch = text.match(/(?:総修得単位|修得単位数|修得単位合計|修得単位|合計単位|単位合計|卒業要件対象単位)[:：\s]*([0-9]{1,3})\s*(?:単位)?/i)
      || text.match(/([0-9]{1,3})\s*単位(?:修得|取得|完修)/);
    if (creditsMatch) {
      const val = parseInt(creditsMatch[1], 10);
      if (!isNaN(val) && val >= 0 && val <= 160) {
        extractedCredits = val;
      }
    }

    // GPAの抽出
    const gpaMatch = text.match(/(?:通算|累積|現在|累積GPA|通算GPA)?GPA[:：\s]*([0-4]\.[0-9]{1,3})/i);
    if (gpaMatch) {
      const val = parseFloat(gpaMatch[1]);
      if (!isNaN(val) && val >= 0 && val <= 4.0) {
        extractedGpa = Math.round(val * 100) / 100;
      }
    }

    // 科目行の抽出 (例: "| 英語1 | 2 | A |" または "- 心理学概論 (S) 2単位" または "線形代数 2単位 A")
    const lines = text.split('\n');
    for (const line of lines) {
      // パターンA: マークダウン表 "| 科目名 | 2 | S/A/B/C |"
      const tableMatch = line.match(/\|\s*([^\|]+?)\s*\|\s*([1-4])\s*(?:単位)?\s*\|\s*([SABCDsabc]|修得|合格)\s*\|/);
      if (tableMatch) {
        const name = tableMatch[1].trim();
        const cr = parseInt(tableMatch[2], 10);
        const gr = tableMatch[3].toUpperCase().trim();
        if (name && !['科目名', '授業名', '---'].includes(name)) {
          completedCourses.push({ name, credits: cr || 2, grade: gr, year: 1 });
          continue;
        }
      }

      // パターンB: リスト "- 科目名 2単位 (A)" または "・科目名 (S) 2単位"
      const listMatch = line.match(/^[・\-\*]\s*([^\(（:：\d]+?)(?:[\(（]([SABCDsabc]|修得|合格)[\)）])?\s*([1-4])\s*単位/);
      if (listMatch) {
        const name = listMatch[1].trim();
        const gr = (listMatch[2] || '修得').toUpperCase().trim();
        const cr = parseInt(listMatch[3], 10) || 2;
        if (name && name.length >= 2 && !['修得科目', '成績', '単位'].includes(name)) {
          completedCourses.push({ name, credits: cr, grade: gr, year: 1 });
        }
      }
    }

    if (extractedCredits !== undefined || extractedGpa !== undefined || completedCourses.length > 0) {
      return {
        action: 'transcript',
        totalEarnedCredits: extractedCredits ?? (completedCourses.length > 0 ? completedCourses.reduce((sum, c) => sum + (c.credits || 2), 0) : 30),
        currentGpa: extractedGpa ?? 2.80,
        completedCourses
      };
    }
  }

  // 5. 時間割表のテキスト行・表解析救済（曜日・時限・科目名）
  if (isImage || text.includes('限') || text.includes('時間割') || text.includes('履修')) {
    const courses: any[] = [];
    const lines = text.split('\n');
    for (const line of lines) {
      // パターンA: マークダウン表 "| 月 | 2 | 科目名 | 教室 |"
      const tableMatch = line.match(/\|\s*(月|火|水|木|金|土)曜?\s*\|\s*([1-5])(?:限)?\s*\|\s*([^\|]+)(?:\|\s*([^\|]*))?/);
      if (tableMatch) {
        const day = tableMatch[1];
        const period = parseInt(tableMatch[2], 10);
        const name = tableMatch[3].replace(/[（\(][^)\n]*[）\)]/g, '').trim();
        const room = tableMatch[4] ? tableMatch[4].trim() : '';
        if (name && name.length >= 2 && !['科目名', '授業名', '開講科目', '---'].includes(name)) {
          courses.push({ name, day, period, room, credits: 2 });
          continue;
        }
      }

      // パターンB: 通常テキスト "月曜2限: 科目名 (3306)" または "月2 3306 科目名" または "【月曜】2限 科目名"
      const dayPeriodMatch = line.match(/(?:【)?(月|火|水|木|金|土)曜?(?:】)?\s*([1-5])(?:限|コマ)?/);
      if (dayPeriodMatch) {
        const day = dayPeriodMatch[1];
        const period = parseInt(dayPeriodMatch[2], 10);
        const roomMatch = line.match(/([1-4]\d{2,3}[a-zA-Z]?)/);
        const room = roomMatch ? roomMatch[1] : '';
        const clean = line
          .replace(/^[・\-\*\s\d\.]+/, '')
          .replace(/(?:【)?(月|火|水|木|金|土)曜?(?:】)?\s*[1-5](?:限|コマ)?[:：\s|｜]*/, '')
          .replace(/[（\(][^)\n]*[）\)]/g, '')
          .trim();
        const name = clean.split(/[:：\s|｜]/)[0].trim();
        if (name && name.length >= 2 && !['時間割', '開講科目', '授業', '教室', '担当', '科目名'].includes(name)) {
          courses.push({
            name,
            day,
            period,
            room,
            credits: 2
          });
        }
      }
    }
    if (courses.length > 0) {
      return {
        action: 'enroll_current_timetable',
        semesterCredits: courses.reduce((sum, c) => sum + (c.credits || 2), 0),
        enrolledCourses: courses
      };
    }
  }

  return null;
}

