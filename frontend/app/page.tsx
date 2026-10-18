'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  GAKUBU_YORAN_DEPARTMENTS,
  GAKUBU_YORAN_COURSES,
  GAKUBU_YORAN_ALL_24_MINORS,
  GAKUBU_YORAN_CAP_RULES,
  GAKUBU_YORAN_GPA_RULES,
  analyzeAcademicDeficiency,
  simulateGpaEngine,
  CourseRecord,
  UserProfileData
} from '@/app/data/gakubuYoran';

// メッセージ型定義
interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  shortLabel?: string;
  imagePreview?: string;
  source?: 'gemini' | 'local';
  timestamp: string;
}

// ユーザープロフィール型定義
export interface UserProfile extends UserProfileData {
  completedCourses: CourseRecord[];
}

const DEFAULT_PROFILE: UserProfile = {
  department: '情報科学科',
  grade: 2,
  currentCredits: 42,
  currentGpa: 2.40,
  targetGpa: 3.00,
  semesterCredits: 16,
  selectedCourses: ['教職コース'],
  selectedMinors: [],
  completedCourses: [
    { name: '自主創造の基礎', credits: 2, grade: 'S', year: 1 },
    { name: '健康・スポーツ教育論', credits: 2, grade: 'A', year: 1 },
    { name: '健康・スポーツ教育実習1', credits: 1, grade: 'S', year: 1 },
    { name: '情報リテラシー', credits: 2, grade: 'A', year: 1 },
    { name: '基礎プログラミング', credits: 2, grade: 'S', year: 1 },
    { name: '基礎プログラミング演習', credits: 1, grade: 'A', year: 1 },
    { name: '実践プログラミング', credits: 2, grade: 'B', year: 1 },
    { name: '実践プログラミング演習', credits: 1, grade: 'A', year: 1 },
    { name: '線形代数1', credits: 2, grade: 'B', year: 1 },
    { name: '基礎微分積分1', credits: 2, grade: 'C', year: 1 },
    { name: 'コンピューティング1', credits: 2, grade: 'A', year: 1 },
    { name: '離散数学', credits: 2, grade: 'B', year: 1 }
  ]
};

const CHS_DEPARTMENTS = Object.keys(GAKUBU_YORAN_DEPARTMENTS);

// 質問クイックチップの定義
interface QuickChip {
  label: string;
  query: string;
  category: 'academic' | 'navi' | 'hours';
}

const QUICK_CHIPS: QuickChip[] = [
  // 履修・卒業・GPA
  { label: '📊 目標GPA3.0シミュレーション', query: '目標GPA3.0にするには今期どうすればいい？', category: 'academic' },
  { label: '📑 不足講義・単位チェック', query: '単位足りてる？不足講義を教えて', category: 'academic' },
  { label: '📖 年間履修上限（CAP制・40単位）', query: '年間で何単位まで履修登録できる？（CAP制ルール）', category: 'academic' },
  { label: '🌐 データサイエンス副専攻の要件', query: 'データサイエンス副専攻の要件と科目は？', category: 'academic' },
  { label: '📷 成績表を解析', query: 'この成績表画像を解析して、修得単位と現在GPAを読み取って', category: 'academic' },
  { label: '🍎 教職コースの要件', query: '教職コースの要件と申請窓口は？', category: 'academic' },
  { label: '🎓 卒業に必要な総単位数', query: '卒業に必要な総単位数は？', category: 'academic' },
  { label: '🏛️ 司書・学芸員の窓口', query: '司書と学芸員コースの窓口はどこ？', category: 'academic' },

  // 構内ナビ
  { label: '📍 3306教室', query: '3306', category: 'navi' },
  { label: '📍 421教室', query: '421', category: 'navi' },
  { label: '🥤 コーラ自販機', query: 'コーラ', category: 'navi' },
  { label: '🪙 80円の飲み物', query: '80円', category: 'navi' },
  { label: '💧 給水所はどこ？', query: '給水所', category: 'navi' },
  { label: '🗑️ ゴミ箱の場所', query: 'ゴミ箱', category: 'navi' },
  { label: '💳 クレカ対応自販機', query: 'クレジットカード', category: 'navi' },

  // 施設営業時間
  { label: '📚 図書館の営業時間', query: '図書館の営業時間は？', category: 'hours' },
  { label: '💻 コンピュータセンター', query: 'コンピュータセンターは何時まで？', category: 'hours' },
  { label: '🏛️ 教務課の受付時間', query: '教務課の受付時間は？', category: 'hours' },
  { label: '📖 ラーニングコモンズ', query: 'ラーニングコモンズの開館時間は？', category: 'hours' },
  { label: '🏺 資料館の開館時間', query: '資料館は何時まで？', category: 'hours' },
];

export default function UnifiedAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 添付画像（成績表画像等）
  const [attachedImage, setAttachedImage] = useState<{
    mimeType: string;
    data: string; // base64
    previewUrl: string;
  } | null>(null);

  // ユーザープロフィール
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTab, setProfileTab] = useState<'basic' | 'reqCourses' | 'courses' | 'minors'>('basic');
  const [profileNotification, setProfileNotification] = useState<string | null>(null);

  // API設定モーダル
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiSaveStatus, setApiSaveStatus] = useState<string | null>(null);

  // 学内早見表モーダル
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'credits' | 'courses' | 'minors' | 'rooms' | 'vending' | 'hours'>('credits');

  // カテゴリフィルター（チップ）
  const [activeChipCategory, setActiveChipCategory] = useState<'all' | 'academic' | 'navi' | 'hours'>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初期化：localStorageからキー、プロフィール、メッセージを復元
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('enekoma_gemini_api_key') || '';
      setApiKey(savedKey);

      const savedProfile = localStorage.getItem('enekoma_user_profile');
      if (savedProfile) {
        try {
          const parsedProf = JSON.parse(savedProfile);
          setUserProfile({ ...DEFAULT_PROFILE, ...parsedProf });
        } catch {
          // ignore
        }
      }

      const savedChat = localStorage.getItem('enekoma_chat_history');
      if (savedChat) {
        try {
          const parsed = JSON.parse(savedChat);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        } catch {
          // ignore
        }
      }

      // デフォルトウェルカムメッセージ
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `こんにちは！日本大学文理学部（CHS）公式『学部要覧（令和7年度）』完全準拠のAIアシスタント**「EneKoma（エネコマ）」**です 🌿\n\n1つのチャットボックスで、以下の質問・ご相談にリアルタイムでお応えします：\n\n・**📑 単位・不足講義チェック**: 優先度順（①所属学科の必修科目 ➔ ②選択コース/副専攻 ➔ ③卒業124単位）で未修得講義を厳格判定！\n・**📊 目標GPAシミュレーション**: 「目標GPA3.0にするには？」と入力すると、今期受けるべき評価（S/A）の内訳を具体的パターンで算出！\n・**📷 成績表画像の自動解析**: 📎ボタンから成績通知書の写真を送ると、修得単位・GPA・評価（S〜F）を自動読み取り＆プロフィールへ即座に反映！\n・**📖 CAP制（年間40単位上限）**: 成績優秀者の上限加算措置（GPA2.5以上で+6単位、3.0以上で+8単位等）や除外科目を正確に案内！\n・**🏢 構内ナビ＆自販機**: 4桁教室番号（例: 「3306」「421」）、80円飲料・コーラ・クレカ決済対応自販機、給水所・ゴミ箱の場所\n・**🕒 施設営業時間**: 図書館（平日20時/土19時）、コンピュータセンター、ラーニング・コモンズ、教務課窓口\n\n💡 右上の「👤 プロフィール」から所属学科（全18学科）やコース、必修履修状況をいつでもカスタマイズできます！`,
          shortLabel: 'EneKoma要覧AI',
          source: 'local',
          timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, []);

  // チャット履歴の自動保存
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem('enekoma_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // プロフィール更新の保存
  const saveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('enekoma_user_profile', JSON.stringify(newProfile));
    }
  };

  // 最新メッセージへ自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 画像ファイル選択ハンドラ
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('画像ファイル（PNG, JPEG, WebP等）を選択してください。');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAttachedImage({
        mimeType: file.type,
        data: result,
        previewUrl: result
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // レスポンスから「表示用：...」ラベルと本文を分離し、```profile_update``` を除去
  const parseResponse = (raw: string) => {
    let shortLabel: string | undefined = undefined;
    let mainText = raw;

    mainText = mainText.replace(/```profile_update\s*[\s\S]*?```/g, '').trim();

    const labelMatch = mainText.match(/表示用[：:]\s*([^\n\r]+)/);
    if (labelMatch) {
      shortLabel = labelMatch[1].trim();
      mainText = mainText.replace(/表示用[：:]\s*[^\n\r]+(\r?\n)?/, '').replace(/詳細案内[：:]\s*/, '').trim();
    }
    return { shortLabel, mainText };
  };

  // メッセージ送信ハンドラ
  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend ?? inputText).trim();
    const currentImg = attachedImage;

    if ((!text && !currentImg) || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: text || (currentImg ? '（成績表画像を送信しました）' : ''),
      imagePreview: currentImg?.previewUrl,
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryToSend) setInputText('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          apiKey: apiKey.trim(),
          history: historyPayload,
          image: currentImg ? { mimeType: currentImg.mimeType, data: currentImg.data } : null,
          userProfile
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }

      const data = await res.json();
      const rawReply = data.reply || '回答を取得できませんでした。';
      const { shortLabel, mainText } = parseResponse(rawReply);

      // プロフィール自動更新の反映（成績表OCR解析等）
      if (data.profileUpdate) {
        const update = data.profileUpdate;
        const newCredits = update.totalEarnedCredits ?? userProfile.currentCredits;
        const newGpa = update.currentGpa ?? userProfile.currentGpa;
        let newCompleted = userProfile.completedCourses;
        if (Array.isArray(update.completedCourses) && update.completedCourses.length > 0) {
          newCompleted = update.completedCourses;
        }

        const updatedProf: UserProfile = {
          ...userProfile,
          currentCredits: newCredits,
          currentGpa: newGpa,
          completedCourses: newCompleted
        };
        saveProfile(updatedProf);
        setProfileNotification(
          `✨ 成績表から自動反映: 修得 ${newCredits}単位 / GPA ${newGpa.toFixed(2)}${
            update.completedCourses ? ` / 読取科目 ${update.completedCourses.length}件` : ''
          }`
        );
        setTimeout(() => setProfileNotification(null), 5000);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: mainText,
        shortLabel,
        source: data.source || (apiKey.trim() ? 'gemini' : 'local'),
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: `assistant_err_${Date.now()}`,
        sender: 'assistant',
        text: '⚠️ エラーが発生しました。通信環境をご確認いただくか、もう一度お試しください。',
        shortLabel: 'エラー',
        source: 'local',
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // テキストエリアの高さ自動調整 & Enterキー送信
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  // クリップボードへコピー
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // チャット履歴クリア
  const handleClearHistory = () => {
    if (confirm('チャットの会話履歴をクリアしますか？')) {
      localStorage.removeItem('enekoma_chat_history');
      setMessages([
        {
          id: 'welcome_cleared',
          sender: 'assistant',
          text: '履歴をクリアしました。成績表の写真、目標GPA、不足講義、教室場所、自販機など何でもお気軽に質問してください！',
          shortLabel: '準備完了',
          source: 'local',
          timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // APIキーの保存
  const handleSaveApiKey = () => {
    const cleaned = apiKey.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem('enekoma_gemini_api_key', cleaned);
    }
    setApiSaveStatus('設定を保存しました！');
    setTimeout(() => {
      setApiSaveStatus(null);
      setShowApiModal(false);
    }, 1200);
  };

  // リアルタイム履修不足計算結果
  const liveDeficiency = analyzeAcademicDeficiency(userProfile);
  const liveDeptData = GAKUBU_YORAN_DEPARTMENTS[userProfile.department] || GAKUBU_YORAN_DEPARTMENTS['情報科学科'];
  const liveGpaSim = simulateGpaEngine(
    userProfile.currentCredits,
    userProfile.currentGpa,
    userProfile.targetGpa,
    userProfile.semesterCredits
  );

  // 必修科目のトグルハンドラ
  const toggleCourseCompleted = (courseName: string, credits: number, year: number) => {
    const exists = userProfile.completedCourses.some((c) => c.name === courseName);
    let updated: CourseRecord[];
    let deltaCredits = 0;

    if (exists) {
      updated = userProfile.completedCourses.filter((c) => c.name !== courseName);
      deltaCredits = -credits;
    } else {
      updated = [...userProfile.completedCourses, { name: courseName, credits, grade: 'S', year }];
      deltaCredits = credits;
    }

    const newCredits = Math.max(0, userProfile.currentCredits + deltaCredits);
    saveProfile({
      ...userProfile,
      currentCredits: newCredits,
      completedCourses: updated
    });
  };

  // 表示するクイックチップのフィルタリング
  const filteredChips = QUICK_CHIPS.filter(
    (chip) => activeChipCategory === 'all' || chip.category === activeChipCategory
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* ==========================================
          ヘッダー
      ========================================== */}
      <header className="bg-white border-b border-slate-200 shadow-xs px-3 sm:px-4 py-2.5 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md text-lg font-bold">
            🌿
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">EneKoma</h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                『学部要覧』公式AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              日本大学文理学部 公式カリキュラム・GPA・卒業判定・構内ナビ
            </p>
          </div>
        </div>

        {/* ヘッダー右側ボタン群 */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* プロフィールボタン（現在の学科・単位・GPAを表示） */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition shadow-2xs"
            title="履修プロフィール・必修チェック設定"
          >
            <span>👤</span>
            <span className="hidden md:inline font-bold">{userProfile.department} {userProfile.grade}年</span>
            <span className="hidden lg:inline text-emerald-600 text-[11px]">| {userProfile.currentCredits}/124単位 (GPA {userProfile.currentGpa.toFixed(2)})</span>
            <span className="md:hidden">プロフィール</span>
          </button>

          {/* 早見表ボタン */}
          <button
            onClick={() => setShowDrawer(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <span>📋</span>
            <span className="hidden sm:inline">要覧早見表</span>
          </button>

          {/* API設定ボタン */}
          <button
            onClick={() => setShowApiModal(true)}
            className={`flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition ${
              apiKey.trim()
                ? 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-300'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
            }`}
            title="Google Gemini API設定"
          >
            <span className={`w-2 h-2 rounded-full ${apiKey.trim() ? 'bg-teal-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{apiKey.trim() ? 'Gemini AI' : 'API設定'}</span>
          </button>

          {/* 履歴削除ボタン */}
          <button
            onClick={handleClearHistory}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            title="チャット履歴をクリア"
          >
            🗑️
          </button>
        </div>
      </header>

      {/* プロフィール自動反映トースト通知 */}
      {profileNotification && (
        <div className="bg-emerald-600 text-white text-xs sm:text-sm py-2 px-4 shadow-md text-center font-medium animate-in fade-in slide-in-from-top-2">
          {profileNotification}
        </div>
      )}

      {/* ==========================================
          メインコンテンツ：チャット画面
      ========================================== */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 max-w-4xl w-full mx-auto flex flex-col space-y-4">
        {/* メッセージ一覧 */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 shadow-sm relative ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
              }`}
            >
              {/* アシスタントヘッダー */}
              {msg.sender === 'assistant' && (
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-emerald-800">EneKoma（学部要覧公式準拠）</span>
                    {msg.source === 'gemini' ? (
                      <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 text-[10px] font-semibold">
                        Gemini AI
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        公式要覧エンジン
                      </span>
                    )}
                  </div>
                  {msg.shortLabel && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 max-w-[140px] truncate">
                      {msg.shortLabel}
                    </span>
                  )}
                </div>
              )}

              {/* 画像プレビュー */}
              {msg.imagePreview && (
                <div className="mb-2.5 rounded-lg overflow-hidden border border-black/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={msg.imagePreview} alt="送信画像" className="max-h-60 rounded-lg object-contain bg-black/5" />
                </div>
              )}

              {/* メッセージ本文 */}
              <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                {msg.text}
              </div>

              {/* フッター（時刻・コピーボタン） */}
              <div
                className={`mt-2 flex items-center justify-between text-[11px] pt-1 border-t ${
                  msg.sender === 'user'
                    ? 'border-emerald-500/40 text-emerald-100'
                    : 'border-slate-100 text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.sender === 'assistant' && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="hover:text-slate-700 flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-slate-100 transition"
                  >
                    <span>{copiedId === msg.id ? '✓ コピー完了' : '📋 コピー'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* 回答生成中ローディング */}
        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2.5 h-2.5 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-slate-500 ml-1">EneKomaが要覧基準で不足分析・回答を作成中...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* ==========================================
          クイックサジェストチップ ＆ 入力エリア
      ========================================== */}
      <div className="bg-white border-t border-slate-200 px-3 sm:px-6 py-3 max-w-4xl w-full mx-auto shadow-md">
        {/* カテゴリ切り替えタブ */}
        <div className="flex items-center space-x-1 pb-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 whitespace-nowrap">よくある質問:</span>
          <button
            onClick={() => setActiveChipCategory('all')}
            className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition ${
              activeChipCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setActiveChipCategory('academic')}
            className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition ${
              activeChipCategory === 'academic'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            🎓 GPA・履修・副専攻
          </button>
          <button
            onClick={() => setActiveChipCategory('navi')}
            className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition ${
              activeChipCategory === 'navi'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            🏢 構内ナビ・自販機
          </button>
          <button
            onClick={() => setActiveChipCategory('hours')}
            className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition ${
              activeChipCategory === 'hours'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            🕒 施設営業時間
          </button>
        </div>

        {/* クイックチップ一覧 */}
        <div className="flex items-center space-x-2 py-1 overflow-x-auto no-scrollbar pb-2">
          {filteredChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.query)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 text-slate-700 whitespace-nowrap transition shadow-2xs flex-shrink-0"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* 添付画像プレビューバナー */}
        {attachedImage && (
          <div className="mb-2 p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={attachedImage.previewUrl} alt="添付画像" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
              <div className="text-xs">
                <div className="font-bold text-slate-800">成績表画像が添付されました</div>
                <div className="text-slate-500 text-[11px]">送信するとAIが修得単位・GPA・評価を自動読み取りします</div>
              </div>
            </div>
            <button
              onClick={() => setAttachedImage(null)}
              className="text-slate-400 hover:text-slate-700 text-sm px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* 入力フォーム */}
        <div className="flex items-end space-x-2">
          {/* 画像添付ボタン */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 transition"
            title="成績表の写真を添付して自動読み取り"
          >
            📷
          </button>

          {/* テキスト入力 */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleInputTextChange}
              onKeyDown={handleKeyDown}
              placeholder="質問を入力（例: 単位足りてる？ / 目標GPA3.0 / 3306 / コーラ / 図書館）"
              className="w-full resize-none px-4 py-2.5 text-sm sm:text-base border border-slate-300 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white shadow-2xs"
            />
          </div>

          {/* 送信ボタン */}
          <button
            onClick={() => handleSend()}
            disabled={(!inputText.trim() && !attachedImage) || isLoading}
            className="p-2.5 sm:px-5 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-2xl font-bold transition shadow-sm flex items-center justify-center"
          >
            <span>送信</span>
          </button>
        </div>
      </div>

      {/* ==========================================
          プロフィール編集モーダル（全18学科・24副専攻・必修チェック）
      ========================================== */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95">
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-xl">👤</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">学生履修プロフィール設定</h3>
                  <p className="text-xs text-slate-500">『学部要覧（令和7年度）』基準データと完全連動</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-lg"
              >
                ✕
              </button>
            </div>

            {/* モーダル内タブ切り替え */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-3 pt-2 space-x-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setProfileTab('basic')}
                className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                  profileTab === 'basic'
                    ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. 学科・GPA基本設定
              </button>
              <button
                onClick={() => setProfileTab('reqCourses')}
                className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                  profileTab === 'reqCourses'
                    ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                2. 📌 必修科目チェック ({liveDeficiency.missingMajorReqs.length === 0 ? '完修' : `残${liveDeficiency.missingMajorReqs.length}`})
              </button>
              <button
                onClick={() => setProfileTab('courses')}
                className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                  profileTab === 'courses'
                    ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                3. 🏅 資格コース ({userProfile.selectedCourses.length})
              </button>
              <button
                onClick={() => setProfileTab('minors')}
                className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                  profileTab === 'minors'
                    ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                4. 🌐 副専攻選択 (全24種)
              </button>
            </div>

            {/* モーダルコンテンツ */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
              {/* TAB 1: 基本情報 */}
              {profileTab === 'basic' && (
                <div className="space-y-4">
                  {/* 学科・学年 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 text-xs mb-1">所属学科（全18学科）:</label>
                      <select
                        value={userProfile.department}
                        onChange={(e) => saveProfile({ ...userProfile, department: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs sm:text-sm font-semibold"
                      >
                        {CHS_DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 text-xs mb-1">学年:</label>
                      <select
                        value={userProfile.grade}
                        onChange={(e) => saveProfile({ ...userProfile, grade: parseInt(e.target.value, 10) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs sm:text-sm font-medium"
                      >
                        {[1, 2, 3, 4].map((g) => (
                          <option key={g} value={g}>{g}年</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 学科要件バナー */}
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center justify-between">
                      <span>📖 {liveDeptData.department} の要覧基準（要覧 p.{liveDeptData.page}）</span>
                      <span className="text-[11px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">卒業要件 124単位</span>
                    </div>
                    <div className="text-emerald-800">
                      専門必修: <strong>{liveDeptData.majorReq}単位</strong> / 専門選択: <strong>{liveDeptData.majorOpt}単位</strong>（専門計: {liveDeptData.majorTotal}単位） / 自由選択: {liveDeptData.freeOpt}単位
                    </div>
                    <div className="text-emerald-700 text-[11px] pt-1">
                      {liveDeptData.prerequisitesNotice}
                    </div>
                  </div>

                  {/* 単位数・GPA入力 */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <label className="block font-bold text-slate-800 text-xs mb-1">現在の総修得単位数:</label>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min={0}
                          max={160}
                          value={userProfile.currentCredits}
                          onChange={(e) => saveProfile({ ...userProfile, currentCredits: parseInt(e.target.value || '0', 10) })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs sm:text-sm font-bold text-slate-900"
                        />
                        <span className="text-xs text-slate-500 whitespace-nowrap">/ 124</span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 text-xs mb-1">今期履修中の単位数:</label>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={userProfile.semesterCredits}
                          onChange={(e) => saveProfile({ ...userProfile, semesterCredits: parseInt(e.target.value || '0', 10) })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs sm:text-sm"
                        />
                        <span className="text-xs text-slate-500 whitespace-nowrap">単位</span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 text-xs mb-1">現在のGPA:</label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={4.0}
                        value={userProfile.currentGpa}
                        onChange={(e) => saveProfile({ ...userProfile, currentGpa: parseFloat(e.target.value || '0') })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs sm:text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 text-xs mb-1">目標GPA:</label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={4.0}
                        value={userProfile.targetGpa}
                        onChange={(e) => saveProfile({ ...userProfile, targetGpa: parseFloat(e.target.value || '0') })}
                        className="w-full px-3 py-1.5 border border-emerald-400 bg-emerald-50 text-emerald-900 rounded-lg text-xs sm:text-sm font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: 必修科目チェックリスト */}
              {profileTab === 'reqCourses' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        【{liveDeptData.department}】主要必修科目（要覧 p.{liveDeptData.page}）
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        修得済みの科目にチェックを入れると、未修得科目が自動で再計算されます。
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        未修得: {liveDeficiency.missingMajorReqs.length}科目
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                    {liveDeptData.requiredCourses.map((req) => {
                      const isCompleted = userProfile.completedCourses.some((c) => c.name === req.name);
                      return (
                        <label
                          key={req.name}
                          className={`flex items-start justify-between p-2.5 cursor-pointer transition ${
                            isCompleted ? 'bg-emerald-50/60' : 'bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start space-x-2.5">
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() => toggleCourseCompleted(req.name, req.credits, req.year)}
                              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <div className={`font-bold text-xs ${isCompleted ? 'text-emerald-900 line-through opacity-75' : 'text-slate-800'}`}>
                                {req.name}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {req.year}年配当 {req.semester ? `・${req.semester}` : ''} | {req.credits}単位
                                {req.note ? `（${req.note}）` : ''}
                              </div>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isCompleted ? '修得済' : '未修得'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: 資格コース選択 */}
              {profileTab === 'courses' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-600">
                    履修中のコースを選択してください（複数選択可）。修得単位は原則「自由選択区分」に算入可能です。
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {GAKUBU_YORAN_COURSES.map((c) => {
                      const isChecked = userProfile.selectedCourses.includes(c.name);
                      return (
                        <label
                          key={c.name}
                          className={`flex items-start space-x-2.5 p-3 rounded-xl border cursor-pointer transition ${
                            isChecked
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...userProfile.selectedCourses, c.name]
                                : userProfile.selectedCourses.filter((x) => x !== c.name);
                              saveProfile({ ...userProfile, selectedCourses: updated });
                            }}
                            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="text-xs space-y-0.5">
                            <div className="font-bold flex items-center space-x-1">
                              <span>{c.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal">({c.page})</span>
                            </div>
                            <div className="text-[11px] text-slate-500">{c.target}</div>
                            <div className="text-[10px] text-emerald-700 font-medium">
                              窓口: {c.window} | 必要: {c.requiredCredits}単位
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: 副専攻選択 (全24種) */}
              {profileTab === 'minors' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-600">
                    副専攻（全24種）から選択してください。指定科目から<strong>16単位以上</strong>修得で修了証書が授与されます。
                  </div>

                  {/* 5つの学際副専攻 */}
                  <div>
                    <div className="font-bold text-xs text-teal-900 mb-1.5 flex items-center space-x-1">
                      <span>🌐 5つの学際副専攻（全学科対象）</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {GAKUBU_YORAN_ALL_24_MINORS.filter((m) => m.type === 'academic').map((m) => {
                        const isChecked = userProfile.selectedMinors.includes(m.name);
                        const isForbidden =
                          m.name === '科学リテラシー副専攻' &&
                          ['地理学科', '地球科学科', '数学科', '情報科学科', '物理学科', '生命科学科', '化学科'].includes(userProfile.department);

                        return (
                          <label
                            key={m.name}
                            className={`flex items-start space-x-2 p-2.5 rounded-xl border text-xs transition ${
                              isForbidden
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                : isChecked
                                ? 'bg-teal-50 border-teal-400 text-teal-900 shadow-2xs cursor-pointer'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
                            }`}
                          >
                            <input
                              type="checkbox"
                              disabled={isForbidden}
                              checked={isChecked}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...userProfile.selectedMinors, m.name]
                                  : userProfile.selectedMinors.filter((x) => x !== m.name);
                                saveProfile({ ...userProfile, selectedMinors: updated });
                              }}
                              className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                            />
                            <div>
                              <div className="font-bold flex items-center space-x-1">
                                <span>{m.name}</span>
                                <span className="text-[10px] text-slate-400">({m.page})</span>
                              </div>
                              <div className="text-[10px] text-slate-500">{m.description}</div>
                              {isForbidden && (
                                <div className="text-[10px] text-rose-500 font-bold">※理系6学科生は修了不可</div>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* 19の学科副専攻 */}
                  <div>
                    <div className="font-bold text-xs text-slate-800 mb-1.5 flex items-center space-x-1">
                      <span>🏛️ 19の学科副専攻（所属学科と同一の副専攻は修了不可）</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-slate-100 p-1.5 rounded-xl">
                      {GAKUBU_YORAN_ALL_24_MINORS.filter((m) => m.type === 'department').map((m) => {
                        const isChecked = userProfile.selectedMinors.includes(m.name);
                        const isOwnDept = m.targetDept === userProfile.department;

                        return (
                          <label
                            key={m.name}
                            className={`flex items-start space-x-2 p-2 rounded-lg border text-xs transition ${
                              isOwnDept
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                : isChecked
                                ? 'bg-teal-50 border-teal-400 text-teal-900 shadow-2xs cursor-pointer'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
                            }`}
                          >
                            <input
                              type="checkbox"
                              disabled={isOwnDept}
                              checked={isChecked}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...userProfile.selectedMinors, m.name]
                                  : userProfile.selectedMinors.filter((x) => x !== m.name);
                                saveProfile({ ...userProfile, selectedMinors: updated });
                              }}
                              className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                            />
                            <div>
                              <div className="font-bold flex items-center space-x-1">
                                <span>{m.name}</span>
                                <span className="text-[10px] text-slate-400">({m.page})</span>
                              </div>
                              {isOwnDept ? (
                                <div className="text-[10px] text-rose-500 font-bold">※所属学科のため修了認定不可</div>
                              ) : (
                                <div className="text-[10px] text-slate-500">{m.description}</div>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* リアルタイム要約バー */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <span>🎓 卒業まで: <strong className="text-emerald-700">残り {liveDeficiency.remainingCredits}単位</strong></span>
                  <span>📌 未修得必修: <strong className="text-rose-600">{liveDeficiency.missingMajorReqs.length}科目</strong></span>
                  <span>📊 今期目標GPA: <strong className={liveGpaSim.isAchievable ? 'text-teal-700' : 'text-amber-600'}>
                    {liveGpaSim.isAchievable ? '達成可能' : '今期到達困難'}
                  </strong></span>
                </div>
              </div>
            </div>

            {/* フッター */}
            <div className="p-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm"
              >
                保存して閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          API設定モーダル (Google Gemini API)
      ========================================== */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚙️</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Google Gemini API設定</h3>
                  <p className="text-xs text-slate-500">無料・クレジットカード不要で取得可能</p>
                </div>
              </div>
              <button
                onClick={() => setShowApiModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs sm:text-sm text-slate-600">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-900 space-y-2">
                <div className="font-bold flex items-center space-x-1.5 text-emerald-800">
                  <span>💡 先生おすすめの無料APIについて</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Google AI Studioで発行できる <strong>Gemini APIキー</strong> は、完全無料で1日1,500リクエストまで利用できます。
                </p>
                <p className="text-xs leading-relaxed">
                  APIを連携すると、<strong>成績表写真のマルチモーダルOCR解析</strong>、目標GPAに向けた詳細な条件シミュレーション、くだけた言い回しにもAIが柔軟にお答えします。
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-slate-800">キーの取得手順（1分で完了）:</div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600">
                  <li>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 font-bold underline hover:text-teal-800"
                    >
                      Google AI Studio (aistudio.google.com)
                    </a>{' '}
                    を開きGoogleアカウントでログイン
                  </li>
                  <li>画面右上の「Create API Key」を押してキーをコピー</li>
                  <li>以下の入力欄に貼り付けて「保存する」を押す</li>
                </ol>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-800 text-xs">
                  Gemini API Key:
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 pr-16 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-teal-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 px-1 py-0.5"
                  >
                    {showApiKey ? '隠す' : '表示'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  ※APIキーはお使いのブラウザ内（localStorage）に安全に保存され、第三者へ送信されません。
                </p>
              </div>

              {apiSaveStatus && (
                <div className="p-2.5 rounded-lg bg-teal-100 text-teal-800 text-xs font-semibold text-center animate-fade-in">
                  ✓ {apiSaveStatus}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setApiKey('');
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('enekoma_gemini_api_key');
                  }
                  setApiSaveStatus('キーを削除しました（ローカルエンジンに戻ります）');
                  setTimeout(() => setApiSaveStatus(null), 1500);
                }}
                className="text-xs text-rose-600 hover:text-rose-800 hover:underline"
              >
                キーをクリア
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowApiModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  閉じる
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-5 py-2 text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 rounded-xl transition shadow-sm"
                >
                  保存する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          学内早見表ドロワーモーダル
      ========================================== */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-slate-200">
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📋</span>
                <h3 className="font-bold text-slate-900 text-base">文理学部 学部要覧 公式早見表</h3>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* モーダル内タブ */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-3 pt-2 space-x-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setDrawerTab('credits')}
                className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                  drawerTab === 'credits'
                    ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                🎓 全18学科 卒業単位表
              </button>
              <button
                onClick={() => setDrawerTab('courses')}
                className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                  drawerTab === 'courses'
                    ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                🏅 6コース科目・窓口
              </button>
              <button
                onClick={() => setDrawerTab('minors')}
                className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                  drawerTab === 'minors'
                    ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                🌐 全24副専攻一覧
              </button>
              <button
                onClick={() => setDrawerTab('rooms')}
                className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                  drawerTab === 'rooms'
                    ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                🏢 教室の場所・規則
              </button>
              <button
                onClick={() => setDrawerTab('vending')}
                className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                  drawerTab === 'vending'
                    ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                🥤 自販機・設備
              </button>
              <button
                onClick={() => setDrawerTab('hours')}
                className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                  drawerTab === 'hours'
                    ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                🕒 施設営業時間
              </button>
            </div>

            {/* モーダル内コンテンツ */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {drawerTab === 'credits' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">■ 卒業に必要な最低単位数（全18学科共通 124単位・要覧 p.31）</div>
                    <p className="text-slate-600 text-xs mb-2">
                      全学科共通で「全学共通(2)」「総合教育(12・人文/社会/理学各2)」「外国語教育(8〜18)」「基礎教育(5・健スポ3/情報2)」「学科専門」「自由選択」の6区分から計124単位を修得します。
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px] border-collapse bg-white">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 border-b">
                            <th className="p-1.5 text-left">学科</th>
                            <th className="p-1.5 text-center">外国語</th>
                            <th className="p-1.5 text-center">専門必修</th>
                            <th className="p-1.5 text-center">専門選択</th>
                            <th className="p-1.5 text-center">専門計</th>
                            <th className="p-1.5 text-center">自由選択</th>
                            <th className="p-1.5 text-center">要覧頁</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {Object.values(GAKUBU_YORAN_DEPARTMENTS).map((d) => (
                            <tr key={d.department} className="hover:bg-slate-50">
                              <td className="p-1.5 font-bold">{d.department}</td>
                              <td className="p-1.5 text-center">{d.gaikokugoReq}</td>
                              <td className="p-1.5 text-center font-semibold text-emerald-800">{d.majorReq}</td>
                              <td className="p-1.5 text-center">{d.majorOpt}</td>
                              <td className="p-1.5 text-center font-bold">{d.majorTotal}</td>
                              <td className="p-1.5 text-center text-slate-500">{d.freeOpt}</td>
                              <td className="p-1.5 text-center text-slate-400">p.{d.page}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">■ 履修科目登録単位数の上限（CAP制・要覧 p.35-36）</div>
                    <p className="text-slate-600 text-xs mb-1.5">
                      年間で履修登録できる単位数の上限は<strong>年間40単位</strong>です（修得単位数ではなく登録単位数）。
                    </p>
                    <div className="text-[11px] text-slate-500 space-y-1">
                      <div>・<strong>上限に含まれない科目</strong>：中国語(逆)再履修、集中授業、海外語学研修、コース科目（教職・司書等）、学科専門科目のアンダーライン＊付科目。</div>
                      <div>・<strong>成績優秀者の特別加算</strong>：</div>
                      <div className="ml-2">
                        - 1年前期16単位以上修得＋GPA 2.5以上 ➔ 1年後期に<strong>+4単位</strong>（年44単位）<br />
                        - 前年度20単位以上修得＋GPA 3.0以上 ➔ 年間<strong>+8単位</strong>（年48単位）<br />
                        - 前年度20単位以上修得＋GPA 2.5以上 ➔ 年間<strong>+6単位</strong>（年46単位）<br />
                        - 前年度20単位以上修得＋GPA 2.0以上 ➔ 年間<strong>+4単位</strong>（年44単位）<br />
                        - 前年度再履修となった科目 ➔ 年間上限<strong>+10単位</strong>まで加算
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">■ GPA算出方法と成績評価（要覧 p.38-39）</div>
                    <p className="text-xs text-slate-600 mb-1">
                      GPA = (4×S + 3×A + 2×B + 1×C) / 総履修単位（D, E含む）。小数第3位四捨五入。
                    </p>
                    <div className="p-2 bg-white rounded-lg border border-slate-200 font-mono text-xs text-slate-800 flex justify-around">
                      <span>S: 100〜90点 (4.0)</span>
                      <span>A: 89〜80点 (3.0)</span>
                      <span>B: 79〜70点 (2.0)</span>
                      <span>C: 69〜60点 (1.0)</span>
                      <span>D/E: 59点以下 (0.0)</span>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'courses' && (
                <div className="space-y-3">
                  <div className="font-bold text-slate-900 text-xs">
                    ■ 全学科共通 6コース科目と申請窓口（要覧 p.140-177）
                  </div>
                  <div className="space-y-2">
                    {GAKUBU_YORAN_COURSES.map((c) => (
                      <div key={c.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{c.name}</span>
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            窓口: {c.window}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">資格・目的: {c.target}（要覧 {c.page}）</div>
                        <div className="text-[11px] text-slate-500">単位取扱: {c.creditsRule}</div>
                        {c.practicalRequirements && (
                          <div className="text-[11px] text-amber-800">実習要件: {c.practicalRequirements}</div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          主要科目: {c.keyRequiredCourses.slice(0, 5).join(', ')} ...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerTab === 'minors' && (
                <div className="space-y-3">
                  <div className="font-bold text-slate-900 text-xs">
                    ■ 文理学部の副専攻（全24種・要覧 p.180-192）
                  </div>
                  <p className="text-xs text-slate-600">
                    指定科目から16単位以上修得で卒業時に修了証書が発行されます。事前届出は不要です。
                  </p>

                  <div className="font-bold text-xs text-teal-900 mt-2">【5つの学際副専攻】</div>
                  <div className="space-y-1.5">
                    {GAKUBU_YORAN_ALL_24_MINORS.filter((m) => m.type === 'academic').map((m) => (
                      <div key={m.name} className="p-2.5 bg-teal-50/60 rounded-lg border border-teal-200 text-xs">
                        <div className="font-bold text-teal-950 flex justify-between">
                          <span>{m.name}</span>
                          <span className="text-[11px] text-slate-500">{m.window}（{m.page}）</span>
                        </div>
                        <div className="text-[11px] text-teal-900">{m.description}</div>
                        <div className="text-[10px] text-slate-500">{m.ruleNotice}</div>
                      </div>
                    ))}
                  </div>

                  <div className="font-bold text-xs text-slate-900 mt-3">【19の学科副専攻】</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {GAKUBU_YORAN_ALL_24_MINORS.filter((m) => m.type === 'department').map((m) => (
                      <div key={m.name} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="font-bold text-slate-900">{m.name}</div>
                        <div className="text-[10px] text-slate-500">{m.description}（{m.page}）</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerTab === 'rooms' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">■ 教室番号のルール</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li><strong>1号館（3桁：1〇〇）</strong>: 1桁目=1号館、2桁目=階数、3桁目=番号</li>
                      <li><strong>2号館（4桁：2〇〇〇）</strong>: 1桁目=2号館、2桁目=階数、3・4桁目=番号</li>
                      <li>
                        <strong>3号館（4桁：3〇〇〇）</strong>: 1桁目=3号館、2桁目=階数
                        <div className="ml-4 mt-1 text-slate-500">
                          ・下2桁 <strong>01〜05</strong>: 男子トイレ側（エスカレーター右 / エレベーター左）<br />
                          ・下2桁 <strong>06〜10</strong>: 女子トイレ側（エスカレーター左 / エレベーター右）
                        </div>
                      </li>
                      <li><strong>4号館（3桁：4〇〇）</strong>: 1桁目=4号館、2桁目=階数、3桁目=番号</li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">■ 4号館の教室配置</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>1階: 正面入って左=<strong>411(男子側)</strong>、右=<strong>412(女子側)</strong></li>
                      <li>2階: 階段登って左=<strong>421(男子側)</strong>、右=<strong>422(女子側)</strong></li>
                      <li>3階: 階段登って右=<strong>431(男子側)</strong>、左=<strong>432(女子側)</strong></li>
                      <li>4階: 右側手前=<strong>442</strong>、奥=<strong>441(男子側)</strong> / 左側手前=<strong>443</strong>、奥=<strong>444(女子側)</strong></li>
                    </ul>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                    <strong>⚠️ 注意事項:</strong> 1号館4F/5Fにトイレはありません。2号館には自販機・ゴミ箱はありません。
                  </div>
                </div>
              )}

              {drawerTab === 'vending' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">■ 4号館 1階 自販機（サントリー）</div>
                    <p className="text-slate-600 mb-1">決済: ジハンピ（PayPay、モバイル交通系IC、現金）</p>
                    <p className="text-slate-500 text-xs">
                      サントリー天然水(80円)、ZONe スカッと透明(80円)、やさしい麦茶(90円)、マウンテンデュー(100円)、デカビタC(100円)、伊右衛門(110円)、レッドブル(170円)
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">■ 3号館 1階 食堂側 自販機（計4台）</div>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-600 text-xs">
                      <li><strong>白（水メイン）</strong>: 天然水(80円)、麦茶(90円)、プリン缶(100円)、BOSS各種</li>
                      <li><strong>白（スポーツ/エナジー）</strong>: 強炭酸水(90円)、ポカリ(110円〜)、レッドブル(170円)、モンスター(180〜190円)</li>
                      <li><strong>青自販機</strong>: ZONe NOPE(80円)、ペプシ生(100円)</li>
                      <li><strong>赤コカ・コーラ</strong>: <strong>クレジットカードタッチ決済対応！</strong> コーラ(140円)、いろはす(100〜110円)、綾鷹(110円)</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-900 text-xs">
                    <strong>💧 給水所（冷水機）:</strong> 4号館 1階エントランスのみ利用可能（2〜4階は使用不可）。
                  </div>
                </div>
              )}

              {drawerTab === 'hours' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900">日本大学文理学部図書館（図書館棟）</div>
                    <div className="text-xs text-slate-600 mt-1">平日: 09:00 - 20:00 / 土曜: 09:00 - 19:00 / 日祝: 休館</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">※地下書庫・貸出は閉館30分前まで</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900">コンピュータセンター受付（3号館）</div>
                    <div className="text-xs text-slate-600 mt-1">平日: 09:00 - 18:00 / 土曜: 09:00 - 13:00 / 日祝: 休業</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900">ラーニング・コモンズ（本館1階）</div>
                    <div className="text-xs text-slate-600 mt-1">平日: 08:00 - 18:00 / 土曜: 08:00 - 17:00 / 日祝: 休館</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900">事務窓口・教務課等（本館1階事務室）</div>
                    <div className="text-xs text-slate-600 mt-1">平日: 09:00 - 17:00 / 土曜: 09:00 - 13:00 / 日祝: 休み</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900">文理学部資料館（8号館）</div>
                    <div className="text-xs text-slate-600 mt-1">平日: 10:00 - 17:00 / 土曜: 10:00 - 13:00 / 日祝: 休館（入館無料）</div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowDrawer(false)}
                className="px-4 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
