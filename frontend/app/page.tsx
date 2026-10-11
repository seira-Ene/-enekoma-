'use client';

import React, { useState, useEffect, useRef } from 'react';

// メッセージ型定義
interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  shortLabel?: string;
  source?: 'gemini' | 'local';
  timestamp: string;
}

// 質問クイックチップの定義
interface QuickChip {
  label: string;
  query: string;
  category: 'navi' | 'hours' | 'academic';
}

const QUICK_CHIPS: QuickChip[] = [
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

  // 履修・卒業ナビ
  { label: '🎓 卒業に必要な単位数', query: '卒業に必要な単位数を教えて', category: 'academic' },
  { label: '🍎 教職コースの窓口', query: '教職コースの申請窓口はどこ？', category: 'academic' },
  { label: '📑 司書コースについて', query: '司書コースの単位と窓口は？', category: 'academic' },
  { label: '🧮 単位の相談', query: '情報科学科で現在80単位修得しています。あと何単位必要？', category: 'academic' },
];

export default function UnifiedAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // API設定モーダル
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiSaveStatus, setApiSaveStatus] = useState<string | null>(null);

  // 学内早見表モーダル
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'rooms' | 'vending' | 'hours' | 'credits'>('rooms');

  // カテゴリフィルター（チップ）
  const [activeChipCategory, setActiveChipCategory] = useState<'all' | 'navi' | 'hours' | 'academic'>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 初期化：localStorageからキーとメッセージを復元
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('enekoma_gemini_api_key') || '';
      setApiKey(savedKey);

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
          text: `こんにちは！日本大学文理学部（CHS）総合キャンパスAIアシスタント**「EneKoma（エネコマ）」**です 🌿\n\n1つのチャットボックスで、以下のあらゆる質問にお答えします：\n\n・**🏢 構内ナビ**: 教室の場所（例: 「3306」「421」）、自販機の商品・価格・決済（例: 「コーラ」「80円」「クレカ」）、給水所・トイレ・ゴミ箱\n・**🕒 施設営業時間**: 図書館、コンピュータセンター、ラーニング・コモンズ、教務課窓口、資料館\n・**🎓 履修・卒業ナビ**: 全18学科の卒業124単位要件、6つのコース科目（教職・司書等）や申請窓口、単位相談\n\n💡 **Google Gemini API（無料）連携に対応**: 右上の「⚙️ API設定」からキーを設定すると、自由な言い回しや略語にもさらに賢くお答えします！（未設定でも高精度ローカルエンジンが即座に回答します）`,
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

  // 最新メッセージへ自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // レスポンスから「表示用：...」ラベルと本文を分離
  const parseResponse = (raw: string) => {
    let shortLabel: string | undefined = undefined;
    let mainText = raw;

    const labelMatch = raw.match(/表示用[：:]\s*([^\n\r]+)/);
    if (labelMatch) {
      shortLabel = labelMatch[1].trim();
      mainText = raw.replace(/表示用[：:]\s*[^\n\r]+(\r?\n)?/, '').replace(/詳細案内[：:]\s*/, '').trim();
    }
    return { shortLabel, mainText };
  };

  // メッセージ送信ハンドラ
  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend ?? inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryToSend) setInputText('');
    setIsLoading(true);

    try {
      // 過去3往復分の履歴を抽出
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
          history: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }

      const data = await res.json();
      const rawReply = data.reply || '回答を取得できませんでした。';
      const { shortLabel, mainText } = parseResponse(rawReply);

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
          text: '履歴をクリアしました。教室・自販機・施設時間・単位のことなど、何でもお気軽にどうぞ！',
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
      <header className="bg-white border-b border-slate-200 shadow-sm px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md text-xl font-bold">
            🌿
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">EneKoma</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                文理学部 AI統合アシスタント
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              構内ナビ・施設営業時間・履修卒業ナビを1つのチャットで解決
            </p>
          </div>
        </div>

        {/* ヘッダー右側ボタン群 */}
        <div className="flex items-center space-x-2">
          {/* API状態バッジ */}
          <button
            onClick={() => setShowApiModal(true)}
            className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              apiKey.trim()
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            }`}
            title="Google Gemini API設定"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiKey.trim() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>{apiKey.trim() ? '✨ Gemini AI 連動中' : '⚡ 高精度ローカルエンジン'}</span>
          </button>

          {/* 早見表ボタン */}
          <button
            onClick={() => setShowDrawer(true)}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <span>📋</span>
            <span className="hidden sm:inline">学内早見表</span>
          </button>

          {/* 設定ボタン */}
          <button
            onClick={() => setShowApiModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition"
          >
            <span>⚙️</span>
            <span>API設定</span>
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
              className={`relative max-w-[92%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
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
              <span className="text-xs text-slate-500 ml-1">EneKomaが考えています...</span>
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
            onClick={() => setActiveChipCategory('navi')}
            className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition ${
              activeChipCategory === 'navi'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            🏢 構内ナビ
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
          <button
            onClick={() => setActiveChipCategory('academic')}
            className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition ${
              activeChipCategory === 'academic'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            🎓 履修・卒業ナビ
          </button>
        </div>

        {/* クイックチップ一覧 */}
        <div className="flex items-center space-x-2 py-1 overflow-x-auto no-scrollbar pb-2">
          {filteredChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.query)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 text-slate-700 whitespace-nowrap transition shadow-xs flex-shrink-0"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* チャット入力フォーム */}
        <div className="flex items-end space-x-2 mt-1">
          <div className="flex-1 relative bg-slate-50 border border-slate-300 rounded-2xl focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleInputTextChange}
              onKeyDown={handleKeyDown}
              placeholder="教室番号（例: 3306, 421）、自販機、営業時間、単位の相談など..."
              disabled={isLoading}
              className="w-full bg-transparent px-4 py-3 text-sm sm:text-base outline-none resize-none max-h-40 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            className={`h-11 px-5 rounded-2xl font-bold flex items-center justify-center transition shadow-md ${
              inputText.trim() && !isLoading
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
          <span>4桁教室番号（3306等）や単語直打ちにも即時回答</span>
        </div>
      </div>

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
                  Google AI Studioで発行できる <strong>Gemini APIキー</strong> は、クレジットカードの登録不要で、完全無料で1日1,500リクエストまで利用できます（学生課題・個人利用なら実質無制限）。
                </p>
                <p className="text-xs leading-relaxed">
                  APIを連携すると、あいまいな言い回しや略語、複雑な履修相談にもLLMが柔軟に文脈を読み取って回答してくれます。
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
            <div className="flex border-b border-slate-200 bg-slate-50 px-3 pt-2 space-x-1">
              <button
                onClick={() => setDrawerTab('rooms')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition ${
                  drawerTab === 'rooms'
                    ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                🏢 教室の場所・規則
              </button>
              <button
                onClick={() => setDrawerTab('vending')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition ${
                  drawerTab === 'vending'
                    ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                🥤 自販機・設備
              </button>
              <button
                onClick={() => setDrawerTab('hours')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition ${
                  drawerTab === 'hours'
                    ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                🕒 施設営業時間
              </button>
              <button
                onClick={() => setDrawerTab('credits')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition ${
                  drawerTab === 'credits'
                    ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                🎓 卒業要件・6コース
              </button>
            </div>

            {/* モーダル内コンテンツ */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {drawerTab === 'rooms' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">■ 教室番号のルール</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li><strong>1号館（3桁：1〇〇）</strong>: 1桁目=1号館、2桁目=階数、3桁目=番号（例: 124＝1号館2F）</li>
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

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                    <strong>⚠️ 注意事項:</strong>
                    <p className="mt-1">
                      ・1号館の4階・5階にはトイレがありません（2階または3階を利用）。<br />
                      ・2号館内には自動販売機およびゴミ箱は設置されていません。
                    </p>
                  </div>
                </div>
              )}

              {drawerTab === 'vending' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">■ 4号館 1階 自販機（サントリー）</div>
                    <p className="text-slate-600 mb-1">決済: ジハンピ（PayPay、モバイル交通系IC、現金）※物理カード直タッチ不可</p>
                    <p className="text-slate-500 text-xs">
                      主な商品: サントリー天然水(80円)、ZONe スカッと透明(80円)、やさしい麦茶(90円)、マウンテンデュー(100円)、デカビタC GABA(100円)、伊右衛門 緑茶(110円)、リプトン ミルクティー(110円)、プレミアムボス(130円)、レッドブル(170円)
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">■ 3号館 1階 食堂側 自販機（計4台）</div>
                    <ul className="list-disc list-inside space-y-2 text-slate-600">
                      <li>
                        <strong>サントリー白（水メイン）</strong>: 天然水(80円)、やさしい麦茶(90円)、ぷるぷるプリン缶(100円)、BOSS各種(90〜140円)
                      </li>
                      <li>
                        <strong>サントリー白（スポーツ/エナジー）</strong>: レモンスカッシュ(100円)、MATCH(120円)、ダカラ(110円)、レッドブル(170円)、モンスターエナジー(180〜190円)
                      </li>
                      <li>
                        <strong>サントリー青</strong>: ZONe NOPE(80円)、ペプシ生(100円)、京都レモネード(140円)
                      </li>
                      <li>
                        <strong>コカ・コーラ赤（Coke ON）</strong>: <strong>クレジットカードタッチ決済対応！</strong> コカ・コーラ(140円)、ファンタ(120円)、アクエリアス(130円)、綾鷹(110円)、い・ろ・は・す(100〜110円)
                      </li>
                    </ul>
                  </div>

                  <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-900">
                    <strong>💧 給水所（冷水機）:</strong>
                    <p className="mt-1">
                      <strong>4号館 1階エントランスのみ利用可能</strong>（マイボトル給水可）。※2〜4階は使用不可です。
                    </p>
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
                    <div className="text-[11px] text-slate-500 mt-0.5">※アカウント発行、学内Wi-Fi問い合わせ対応</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900">ラーニング・コモンズ（本館1階）</div>
                    <div className="text-xs text-slate-600 mt-1">平日: 08:00 - 18:00（サポートデスク 10:00 - 18:00） / 土曜: 08:00 - 17:00 / 日祝: 休館</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">※グループ学習スペース・PC利用可能</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900">事務窓口・教務課等（本館1階事務室）</div>
                    <div className="text-xs text-slate-600 mt-1">平日: 09:00 - 17:00 / 土曜: 09:00 - 13:00 / 日祝: 休み</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">※証明書自動発行機は閉口15分前まで利用可</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900">文理学部資料館（8号館）</div>
                    <div className="text-xs text-slate-600 mt-1">平日: 10:00 - 17:00 / 土曜: 10:00 - 13:00 / 日祝: 休館</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">※入館無料、企画展随時開催</div>
                  </div>
                </div>
              )}

              {drawerTab === 'credits' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">■ 卒業要件の基本</div>
                    <p className="text-slate-600">全学科共通で <strong>124単位</strong> の修得が必要です。</p>
                    <p className="text-xs text-slate-500 mt-1">
                      全学共通（2単位）、総合教育（12単位）、外国語教育（8〜18単位）、基礎教育（5単位）、学科専門必修・選択、自由選択区分の配分基準を満たす必要があります。
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">■ 全学科共通 6つのコース科目と申請窓口</div>
                    <ul className="divide-y divide-slate-200 text-xs">
                      <li className="py-2">
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded mr-2">教職センター</span>
                        <strong>教職コース</strong>（中学・高校教諭一種免許）
                      </li>
                      <li className="py-2">
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded mr-2">教職センター</span>
                        <strong>司書教諭コース</strong>（学校図書館司書教諭資格）
                      </li>
                      <li className="py-2">
                        <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded mr-2">教務課窓口</span>
                        <strong>司書コース</strong>（公共図書館等の司書資格）
                      </li>
                      <li className="py-2">
                        <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded mr-2">教務課窓口</span>
                        <strong>学芸員コース</strong>（博物館・資料館等の学芸員資格）
                      </li>
                      <li className="py-2">
                        <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded mr-2">教務課窓口</span>
                        <strong>社会教育主事コース</strong>（地域学習指導員・社会教育士）
                      </li>
                      <li className="py-2">
                        <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded mr-2">教務課窓口</span>
                        <strong>日本語教育コース</strong>（日本語教員養成）
                      </li>
                    </ul>
                    <p className="text-[11px] text-slate-500 mt-2">
                      ※コース科目の修得単位は原則「自由選択区分」に算入され、GPA算出対象に含まれます（実習系科目除く）。
                    </p>
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
