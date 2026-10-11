'use client';

import React, { useState, useEffect, useRef } from 'react';

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
export interface UserProfile {
  department: string;
  grade: number;
  currentCredits: number;
  currentGpa: number;
  targetGpa: number;
  semesterCredits: number;
  selectedCourses: string[];
  selectedMinors: string[];
}

const DEFAULT_PROFILE: UserProfile = {
  department: '情報科学科',
  grade: 2,
  currentCredits: 42,
  currentGpa: 2.40,
  targetGpa: 3.00,
  semesterCredits: 16,
  selectedCourses: ['教職コース'],
  selectedMinors: []
};

const CHS_DEPARTMENTS = [
  '情報科学科', '国文学科', '英文学科', '哲学科', '史学科', '中国語中国文化学科',
  'ドイツ文学科', '社会学科', '社会福祉学科', '教育学科', '体育学科', '心理学科',
  '地理学科', '地球科学科', '数学科', '物理学科', '生命科学科', '化学科'
];

const ALL_COURSES = [
  { name: '教職コース', window: '教職センター', desc: '中高教諭一種免許' },
  { name: '司書教諭コース', window: '教職センター', desc: '学校図書館司書教諭' },
  { name: '司書コース', window: '教務課', desc: '公共図書館司書資格' },
  { name: '学芸員コース', window: '教務課', desc: '博物館・美術館学芸員' },
  { name: '社会教育主事コース', window: '教務課', desc: '社会教育士' },
  { name: '日本語教育コース', window: '教務課', desc: '日本語教員養成' },
];

const ALL_MINORS = [
  'AI・データサイエンス副専攻',
  'グローバル主専攻・副専攻',
  '環境・サステナビリティ副専攻',
  '心身ウェルネス副専攻'
];

// 質問クイックチップの定義
interface QuickChip {
  label: string;
  query: string;
  category: 'academic' | 'navi' | 'hours';
}

const QUICK_CHIPS: QuickChip[] = [
  // 履修・卒業・GPA（新着＆重要）
  { label: '📊 目標GPA3.0シミュレーション', query: '目標GPA3.0にするには今期どうすればいい？', category: 'academic' },
  { label: '📑 不足講義・単位チェック', query: '単位足りてる？不足講義を教えて', category: 'academic' },
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
  const [profileNotification, setProfileNotification] = useState<string | null>(null);

  // API設定モーダル
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiSaveStatus, setApiSaveStatus] = useState<string | null>(null);

  // 学内早見表モーダル
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'credits' | 'rooms' | 'vending' | 'hours'>('credits');

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
          text: `こんにちは！日本大学文理学部（CHS）総合キャンパスAIアシスタント**「EneKoma（エネコマ）」**です 🌿\n\n1つのチャットボックスで、以下の質問・ご相談に横断対応します：\n\n・**📷 成績表画像の自動解析**: 📎から成績表の写真を送ると、修得単位・GPA・評価（S〜F）を自動読み取り＆プロフィールへ反映！\n・**📊 目標GPAシミュレーション**: 「目標GPA3.0にするには？」と聞くと、今期どの評価（S/A）を何科目取るべきかを具体的パターンで算出！\n・**📑 単位・不足講義チェック**: 優先度順（①学科必修 ➔ ②選択コース/副専攻 ➔ ③卒業124単位）で未修得科目を厳格診断！\n・**🏢 構内ナビ＆自販機**: 教室の場所（例: 「3306」「421」）、自販機商品（80円飲料、コーラ、クレカ決済）、給水所・トイレ・ゴミ箱\n・**🕒 施設営業時間**: 図書館、コンピュータセンター、ラーニング・コモンズ、教務課窓口、資料館\n\n💡 **Google Gemini API（無料）連携**: 右上の「⚙️ API設定」からキーを設定すると、画像のマルチモーダル読み取りや自由な言い回しにも強力に対応します！`,
          shortLabel: 'EneKoma統合AI',
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
    // リセット
    e.target.value = '';
  };

  // レスポンスから「表示用：...」ラベルと本文を分離し、```profile_update``` を除去
  const parseResponse = (raw: string) => {
    let shortLabel: string | undefined = undefined;
    let mainText = raw;

    // profile_update JSONブロックの除去（画面表示をクリーンに保つ）
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

      // プロフィール自動更新の反映
      if (data.profileUpdate) {
        const update = data.profileUpdate;
        const newCredits = update.totalEarnedCredits ?? userProfile.currentCredits;
        const newGpa = update.currentGpa ?? userProfile.currentGpa;
        const updatedProf: UserProfile = {
          ...userProfile,
          currentCredits: newCredits,
          currentGpa: newGpa
        };
        saveProfile(updatedProf);
        setProfileNotification(`✨ 成績表から自動反映: 修得 ${newCredits}単位 / GPA ${newGpa.toFixed(2)}`);
        setTimeout(() => setProfileNotification(null), 4000);
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
          text: '履歴をクリアしました。成績表の画像、GPAシミュレーション、不足講義、教室、自販機など何でもお気軽にどうぞ！',
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
                文理学部 AI統合アシスタント
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              構内ナビ・施設営業時間・GPA・履修卒業判定（成績表OCR対応）
            </p>
          </div>
        </div>

        {/* ヘッダー右側ボタン群 */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* プロフィールボタン（現在の設定を表示） */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition"
            title="履修プロフィール・GPA設定"
          >
            <span>👤</span>
            <span className="hidden md:inline font-bold">{userProfile.department} {userProfile.grade}年</span>
            <span className="hidden lg:inline text-emerald-600 text-[11px]">| {userProfile.currentCredits}単位 (GPA {userProfile.currentGpa.toFixed(2)})</span>
            <span className="md:hidden">プロフィール</span>
          </button>

          {/* 早見表ボタン */}
          <button
            onClick={() => setShowDrawer(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <span>📋</span>
            <span className="hidden sm:inline">学内早見表</span>
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
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* メッセージ吹き出し */}
            <div
              className={`relative max-w-[92%] sm:max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
              }`}
            >
              {/* アシスタント側：表示用12文字ラベルの強調バッジ */}
              {msg.sender === 'assistant' && msg.shortLabel && (
                <div className="mb-2 flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    📍 {msg.shortLabel}
                  </span>
                  {msg.source === 'gemini' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                      ✨ Gemini AI
                    </span>
                  )}
                  {msg.source === 'local' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                      ⚡ 高精度エンジン
                    </span>
                  )}
                </div>
              )}

              {/* 添付画像のプレビュー（ユーザー送信時） */}
              {msg.imagePreview && (
                <div className="mb-2 rounded-xl overflow-hidden border border-white/20 max-w-xs shadow-xs">
                  <img src={msg.imagePreview} alt="送信した画像" className="w-full h-auto max-h-48 object-cover" />
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
              <span className="text-xs text-slate-500 ml-1">EneKomaが分析・回答を作成中...</span>
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
            🎓 GPA・履修・成績表
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

        {/* 添付画像のプレビュー（送信前） */}
        {attachedImage && (
          <div className="mb-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2.5">
              <img
                src={attachedImage.previewUrl}
                alt="成績表プレビュー"
                className="w-10 h-10 object-cover rounded-lg border border-emerald-300"
              />
              <div>
                <div className="text-xs font-bold text-emerald-900">📷 成績表画像が選択されました</div>
                <div className="text-[11px] text-emerald-700">送信するとAIが単位・GPA・科目を自動解析します</div>
              </div>
            </div>
            <button
              onClick={() => setAttachedImage(null)}
              className="text-slate-400 hover:text-rose-600 p-1 text-sm font-bold"
              title="添付を解除"
            >
              ✕
            </button>
          </div>
        )}

        {/* チャット入力フォーム */}
        <div className="flex items-end space-x-2 mt-1">
          {/* 画像アップロードボタン */}
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
            disabled={isLoading}
            className="h-11 px-3 rounded-2xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition shadow-xs flex-shrink-0"
            title="成績表や通知書の写真を添付して自動読み取り"
          >
            <span className="text-base">📷</span>
            <span className="hidden sm:inline text-xs ml-1 font-semibold text-slate-700">成績表添付</span>
          </button>

          <div className="flex-1 relative bg-slate-50 border border-slate-300 rounded-2xl focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleInputTextChange}
              onKeyDown={handleKeyDown}
              placeholder="目標GPA3.0にするには？ / 単位足りてる？ / 3306 / 図書館営業時間..."
              disabled={isLoading}
              className="w-full bg-transparent px-4 py-3 text-sm sm:text-base outline-none resize-none max-h-40 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={() => handleSend()}
            disabled={(!inputText.trim() && !attachedImage) || isLoading}
            className={`h-11 px-5 rounded-2xl font-bold flex items-center justify-center transition shadow-md ${
              (inputText.trim() || attachedImage) && !isLoading
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span className="text-sm">送信</span>
            <span className="ml-1 text-xs">🚀</span>
          </button>
        </div>

        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>Enterキーで送信 / Shift + Enterで改行</span>
          <span>成績表の写真添付（マルチモーダルOCR解析）対応</span>
        </div>
      </div>

      {/* ==========================================
          ユーザープロフィール ＆ GPA設定モーダル
      ========================================== */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-xl">👤</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">履修プロフィール ＆ GPAシミュレーター設定</h3>
                  <p className="text-xs text-slate-500">不足講義の分析やGPA達成目安の計算基準になります</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
              {/* 成績表画像の直接アップロード誘導 */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-900 text-xs flex items-center space-x-1">
                    <span>📷 成績表画像から自動入力できます</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    チャット画面の「📷 成績表添付」ボタンから通知書を送るだけで自動入力されます！
                  </p>
                </div>
              </div>

              {/* 学科・学年 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1">所属学科:</label>
                  <select
                    value={userProfile.department}
                    onChange={(e) => saveProfile({ ...userProfile, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs sm:text-sm font-medium"
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

              {/* 単位数・GPA */}
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
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs sm:text-sm"
                    />
                    <span className="text-xs text-slate-500 whitespace-nowrap">/ 124単位</span>
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

              {/* 選択コース（複数選択可） */}
              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1.5">
                  選択コース（複数選択・未選択可）:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_COURSES.map((c) => {
                    const isChecked = userProfile.selectedCourses.includes(c.name);
                    return (
                      <label
                        key={c.name}
                        className={`flex items-start space-x-2 p-2 rounded-lg border cursor-pointer transition ${
                          isChecked ? 'bg-emerald-50 border-emerald-400 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'
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
                        <div className="text-xs">
                          <div className="font-bold">{c.name}</div>
                          <div className="text-[10px] text-slate-500">窓口: {c.window}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 選択副専攻（複数選択可） */}
              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1.5">
                  選択副専攻（複数選択・未選択可）:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_MINORS.map((m) => {
                    const isChecked = userProfile.selectedMinors.includes(m);
                    return (
                      <label
                        key={m}
                        className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition ${
                          isChecked ? 'bg-teal-50 border-teal-400 text-teal-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...userProfile.selectedMinors, m]
                              : userProfile.selectedMinors.filter((x) => x !== m);
                            saveProfile({ ...userProfile, selectedMinors: updated });
                          }}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-xs font-semibold">{m}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

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
                  <p className="text-xs text-slate-500">無料公開・クレジットカード不要で取得可能</p>
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
                  Google AI Studioで発行できる <strong>Gemini APIキー</strong> は、クレジットカード登録不要・完全無料で1日1,500リクエストまで利用できます。
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
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200">
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📋</span>
                <h3 className="font-bold text-slate-900 text-base">文理学部 学内早見表</h3>
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
                🎓 卒業要件・GPA・コース
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
                    <div className="font-bold text-slate-900 mb-1">■ 卒業要件 ＆ 成績評価ポイント（GP）</div>
                    <p className="text-slate-600">全学科共通で <strong>124単位</strong> の修得が必要です。</p>
                    <div className="mt-2 p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-xs text-slate-800 flex justify-around">
                      <span>S: 4.0</span>
                      <span>A: 3.0</span>
                      <span>B: 2.0</span>
                      <span>C: 1.0</span>
                      <span>F: 0.0</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">■ 不足講義判定の優先順位ルール</div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 text-xs">
                      <li><strong>優先度 1（最優先）</strong>: 所属学科の専門必修科目の未履修チェック</li>
                      <li><strong>優先度 2</strong>: 選択コース（複数可）および副専攻の到達要件チェック</li>
                      <li><strong>優先度 3</strong>: 卒業に必要なその他単位（自由選択等・計124単位）のチェック</li>
                    </ol>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">■ 全学科共通 6コース科目と申請窓口</div>
                    <ul className="divide-y divide-slate-200 text-xs">
                      <li className="py-1.5 flex items-center justify-between">
                        <span><strong>教職コース</strong>（中学・高校教諭一種免許）</span>
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">教職センター</span>
                      </li>
                      <li className="py-1.5 flex items-center justify-between">
                        <span><strong>司書教諭コース</strong>（学校図書館司書教諭）</span>
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">教職センター</span>
                      </li>
                      <li className="py-1.5 flex items-center justify-between">
                        <span><strong>司書コース</strong>（公共図書館等の司書資格）</span>
                        <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">教務課窓口</span>
                      </li>
                      <li className="py-1.5 flex items-center justify-between">
                        <span><strong>学芸員コース</strong>（博物館・美術館等の学芸員資格）</span>
                        <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">教務課窓口</span>
                      </li>
                      <li className="py-1.5 flex items-center justify-between">
                        <span><strong>社会教育主事コース</strong>（社会教育士）</span>
                        <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">教務課窓口</span>
                      </li>
                      <li className="py-1.5 flex items-center justify-between">
                        <span><strong>日本語教育コース</strong>（日本語教員養成）</span>
                        <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">教務課窓口</span>
                      </li>
                    </ul>
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
