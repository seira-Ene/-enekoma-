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
  EnrolledCourseItem,
  UserProfileData
} from '@/app/data/gakubuYoran';
import {
  findFreeRooms,
  getCompactRoomLabel
} from '@/app/data/courses';

// メッセージ型定義
interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  shortLabel?: string;
  imagePreview?: string;
  imageTypeLabel?: string;
  source?: 'gemini' | 'local';
  model?: string;
  timestamp: string;
}

// ユーザープロフィール型定義
export interface UserProfile extends UserProfileData {
  completedCourses: CourseRecord[];
  enrolledCourses: EnrolledCourseItem[];
}

const DEFAULT_PROFILE: UserProfile = {
  admissionYear: 'reiwa7_or_later',
  department: '情報科学科',
  grade: 2,
  currentCredits: 42,
  currentGpa: 2.40,
  targetGpa: 3.00,
  semesterCredits: 16,
  selectedCourses: ['教職コース'],
  selectedMinors: [],
  enrolledCourses: [
    { name: 'アルゴリズムとデータ構造', day: '月', period: 2, room: '3306', credits: 2, teacher: '大澤 裕' },
    { name: 'コンピュータシステム', day: '火', period: 3, room: '421', credits: 2, teacher: '北原 鉄朗' },
    { name: 'データサイエンス概論', day: '水', period: 2, room: '3201', credits: 2, teacher: '谷 聖一' },
    { name: '情報社会と倫理', day: '木', period: 1, room: '411', credits: 2, teacher: '尾崎 知伸' },
    { name: '英語3（Reading）', day: '木', period: 3, room: '124', credits: 2, teacher: 'Smith J.' },
    { name: '総合教育科目（心理学）', day: '金', period: 2, room: '3405', credits: 2, teacher: '共通教育' },
    { name: '数学演習', day: '金', period: 4, room: '3302', credits: 2, teacher: '数学科兼担' },
    { name: '教職概論', day: '土', period: 2, room: '131', credits: 2, teacher: '教職センター' }
  ],
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

// 質問クイックチップ
interface QuickChip {
  label: string;
  query: string;
  category: 'rooms' | 'timetable' | 'academic' | 'campus';
}

const QUICK_CHIPS: QuickChip[] = [
  // 空き教室（曜日・時限別）
  { label: '月曜2限の空き教室', query: '月曜2限の空き教室を教えて', category: 'rooms' },
  { label: '火曜3限 3号館の空き教室', query: '火曜3限 3号館で空いている教室は？', category: 'rooms' },
  { label: '水曜4限の空き教室', query: '水曜4限の空き教室を教えて', category: 'rooms' },
  { label: '木曜の14:00〜空いてる教室', query: '木曜14時頃に使える空き教室は？', category: 'rooms' },
  { label: '金曜5限の空き教室', query: '金曜5限の空き教室を教えて', category: 'rooms' },
  { label: '421教室の利用状況', query: '421教室は何限に使われている？', category: 'rooms' },

  // 時間割・履修サポート
  { label: '時間割画像から履修中登録', query: '今期の時間割画像を読み取って、履修中科目に登録してください。', category: 'timetable' },
  { label: '過去の時間割から修得済み追加', query: '過去の時間割画像を読み取って、修得済み科目に追加してください。', category: 'timetable' },
  { label: '火曜3限の空きコマ科目', query: '火曜3限の空きコマにおすすめの科目は？', category: 'timetable' },
  { label: '必修を組んだ時間割作成', query: '必修科目を組み込んだおすすめ時間割を作って', category: 'timetable' },
  { label: '履修の重複チェック', query: '英語と情報リテラシーの時間が重複していないかチェックして', category: 'timetable' },
  { label: '3505→122教室（10分移動）', query: '3505教室から122教室へ10分で移動できる？', category: 'timetable' },

  // 履修要綱・単位・GPA
  { label: '卒業要件・不足科目の確認', query: '単位足りてる？不足している科目を教えて', category: 'academic' },
  { label: '目標GPA 3.0の目安計算', query: '目標GPA3.0にするには今期どうすればいい？', category: 'academic' },
  { label: '成績表を画像解析', query: '添付した成績通知書を読み取って、修得単位とGPAを反映してください。', category: 'academic' },
  { label: 'CAP制（年間40単位上限）', query: '年間で何単位まで履修登録できる？（CAP制ルール）', category: 'academic' },
  { label: '教職コースの要件・窓口', query: '教職コースの要件と申請窓口は？', category: 'academic' },
  { label: 'データサイエンス副専攻', query: 'データサイエンス副専攻の要件と科目は？', category: 'academic' },

  // キャンパス・施設・自販機
  { label: '3306教室の場所', query: '3306', category: 'campus' },
  { label: '421教室の場所', query: '421', category: 'campus' },
  { label: 'クレカ対応の自販機', query: 'クレジットカードが使える自販機はどこ？', category: 'campus' },
  { label: '学内最安80円ドリンク', query: '80円の飲み物', category: 'campus' },
  { label: '図書館の開館時間', query: '図書館の営業時間は？', category: 'campus' },
  { label: 'コンピュータセンター', query: 'コンピュータセンターは何時まで？', category: 'campus' },
  { label: '教務課窓口の受付時間', query: '教務課の受付時間は？', category: 'campus' },
  { label: '給水所・ゴミ箱の場所', query: '給水所とゴミ箱の場所を教えて', category: 'campus' },
];

export default function UnifiedAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 添付画像
  const [attachedImage, setAttachedImage] = useState<{
    mimeType: string;
    data: string; // base64
    previewUrl: string;
    imageType: 'current_timetable' | 'past_timetable' | 'transcript' | 'auto';
  } | null>(null);

  // ユーザープロフィール
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTab, setProfileTab] = useState<'timetable' | 'completed' | 'reqCourses' | 'basic' | 'courses' | 'minors'>('timetable');
  const [profileNotification, setProfileNotification] = useState<string | null>(null);

  // 空き教室検索ツール（人間が使うための直感的なUI）
  const [showRoomSearchTool, setShowRoomSearchTool] = useState(false);
  const [searchDay, setSearchDay] = useState<string>('月');
  const [searchPeriod, setSearchPeriod] = useState<number>(2);
  const [searchBuilding, setSearchBuilding] = useState<string>('all');

  // API設定モーダル
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiSaveStatus, setApiSaveStatus] = useState<string | null>(null);
  const [hasServerKey, setHasServerKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // 要覧早見表モーダル
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'credits' | 'courses' | 'minors' | 'rooms' | 'vending' | 'hours'>('credits');

  // カテゴリチップフィルター
  const [activeChipCategory, setActiveChipCategory] = useState<'all' | 'rooms' | 'timetable' | 'academic' | 'campus'>('all');

  // 手動科目追加ステート（プロフィールモーダル内）
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDay, setNewCourseDay] = useState('月');
  const [newCoursePeriod, setNewCoursePeriod] = useState(1);
  const [newCourseRoom, setNewCourseRoom] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState(2);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初期化：localStorageと環境キーの取得
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('enekoma_gemini_api_key') || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
      if (savedKey) setApiKey(savedKey);

      fetch('/api/chat')
        .then((res) => res.json())
        .then((data) => {
          if (data?.hasServerKey) {
            setHasServerKey(true);
          }
        })
        .catch(() => {});

      const savedProfile = localStorage.getItem('enekoma_user_profile');
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          setUserProfile({
            ...DEFAULT_PROFILE,
            ...parsed,
            enrolledCourses: parsed.enrolledCourses || DEFAULT_PROFILE.enrolledCourses,
            completedCourses: parsed.completedCourses || DEFAULT_PROFILE.completedCourses
          });
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

      // デフォルトウェルカムメッセージ（学生ポータルとして自然なトーン）
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `日本大学文理学部（CHS）学生ポータル「EneKoma（エネコマ）」へようこそ。\n\n本システムでは、文理学部公式『学部要覧』および開講時間割データに基づいて、以下のサポートを提供しています：\n\n・**曜日・時限別の空き教室検索**：指定したコマ・時間帯に空いている講義室（3号館、4号館、1号館、2号館）を即時案内します。\n・**時間割表・成績表の画像読取（Gemini連携）**：時間割の写真を送ると「今期履修中」または「修得済み」として登録。成績通知書からは修得単位・GPA・評価を読み取ります。\n・**単位・卒業要件判定**：学科必修科目・コース科目・124単位までの残り状況を公式要覧基準で厳格チェック。\n・**キャンパス設備・構内案内**：4桁教室番号の場所、クレジットカード対応自販機、80円飲料、図書館等の営業時間。\n\n画面上部の検索バーや下の質問ボタンから、知りたい内容をお気軽に入力してください。`,
          shortLabel: 'EneKomaポータル',
          source: 'local',
          timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, []);

  // 履歴保存
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem('enekoma_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // プロフィール保存
  const saveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('enekoma_user_profile', JSON.stringify(newProfile));
    }
  };

  // スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 画像ファイル選択
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
        previewUrl: result,
        imageType: 'current_timetable' // 初期値は今期の時間割
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // レスポンス整形
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

  // メッセージ送信
  const handleSend = async (queryToSend?: string, overrideImageType?: 'current_timetable' | 'past_timetable' | 'transcript' | 'auto') => {
    const text = (queryToSend ?? inputText).trim();
    const currentImg = attachedImage;
    const finalImageType = overrideImageType || currentImg?.imageType || 'auto';

    if ((!text && !currentImg) || isLoading) return;

    let userDisplayText = text;
    if (!userDisplayText && currentImg) {
      if (finalImageType === 'current_timetable') {
        userDisplayText = '今期の時間割表画像を送信しました（履修中科目に登録）';
      } else if (finalImageType === 'past_timetable') {
        userDisplayText = '過去の時間割表画像を送信しました（修得済み科目に追加）';
      } else if (finalImageType === 'transcript') {
        userDisplayText = '成績通知書画像を送信しました（単位・GPA・評価を反映）';
      } else {
        userDisplayText = '画像を送信しました（時間割・成績表）';
      }
    }

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: userDisplayText,
      imagePreview: currentImg?.previewUrl,
      imageTypeLabel: currentImg
        ? finalImageType === 'current_timetable'
          ? '今期の時間割'
          : finalImageType === 'past_timetable'
          ? '過去の時間割'
          : finalImageType === 'transcript'
          ? '成績通知書'
          : '画像解析'
        : undefined,
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
          imageType: currentImg ? finalImageType : null,
          userProfile
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }

      const data = await res.json();
      const rawReply = data.reply || '回答を取得できませんでした。';
      const { shortLabel, mainText } = parseResponse(rawReply);

      // プロフィール自動更新の処理（今期時間割・過去時間割・成績表の3パターン）
      if (data.profileUpdate) {
        const update = data.profileUpdate;
        let updatedProf = { ...userProfile };
        const notifs: string[] = [];

        // 1. 今期の時間割（履修中）
        if (update.action === 'enroll_current_timetable' || Array.isArray(update.enrolledCourses)) {
          const courses: EnrolledCourseItem[] = update.enrolledCourses || [];
          const semCr = update.semesterCredits ?? courses.reduce((sum, c) => sum + (c.credits || 2), 0);
          updatedProf = {
            ...updatedProf,
            enrolledCourses: courses,
            semesterCredits: semCr
          };
          notifs.push(`今期時間割を登録しました（${courses.length}科目 / ${semCr}単位を履修中に反映）`);
        }

        // 2. 過去の時間割（修得済みに加算）
        if (update.action === 'add_completed_timetable' || Array.isArray(update.addCompletedCourses)) {
          const toAdd: CourseRecord[] = (update.addCompletedCourses || []).map((c: any) => ({
            name: c.name,
            credits: c.credits || 2,
            grade: c.grade || 'A',
            year: c.year || 1
          }));
          const existingNames = new Set(updatedProf.completedCourses.map((c) => c.name));
          const newlyAdded = toAdd.filter((c) => !existingNames.has(c.name));
          const addedCredits = newlyAdded.reduce((sum, c) => sum + c.credits, 0);
          const newCompleted = [...updatedProf.completedCourses, ...newlyAdded];
          const newTotal = update.totalEarnedCredits ?? (updatedProf.currentCredits + addedCredits);
          updatedProf = {
            ...updatedProf,
            completedCourses: newCompleted,
            currentCredits: newTotal
          };
          notifs.push(`過去の時間割から${newlyAdded.length}科目を修得済みに登録（+${addedCredits}単位）`);
        }

        // 3. 成績表・成績通知書
        if (update.action === 'transcript' || (update.totalEarnedCredits !== undefined && update.currentGpa !== undefined)) {
          const newCredits = update.totalEarnedCredits ?? updatedProf.currentCredits;
          const newGpa = update.currentGpa ?? updatedProf.currentGpa;
          let newCompleted = updatedProf.completedCourses;
          if (Array.isArray(update.completedCourses) && update.completedCourses.length > 0) {
            newCompleted = update.completedCourses;
          }
          updatedProf = {
            ...updatedProf,
            currentCredits: newCredits,
            currentGpa: newGpa,
            completedCourses: newCompleted
          };
          notifs.push(`成績表から反映しました（修得 ${newCredits}単位 / GPA ${newGpa.toFixed(2)}）`);
        }

        saveProfile(updatedProf);
        if (notifs.length > 0) {
          setProfileNotification(`✓ ${notifs.join(' ｜ ')}`);
          setTimeout(() => setProfileNotification(null), 6000);
        }
      }

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: mainText,
        shortLabel,
        source: data.source || (apiKey.trim() || hasServerKey ? 'gemini' : 'local'),
        model: data.model,
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      // サーバー通信でエラーが発生した場合、APIキーがあればブラウザから直接Geminiを試行
      const cleanedKey = apiKey.trim();
      let recovered = false;

      if (cleanedKey) {
        try {
          const directRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${cleanedKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: 'あなたは日本大学文理学部（CHS）公式アシスタント「EneKoma」です。学部要覧（卒業要件124単位、年間CAP制40単位、学科必修）および校舎施設データに基づき、丁寧かつ正確に回答してください。' }]
                },
                contents: [{
                  role: 'user',
                  parts: [
                    { text: `【ユーザープロフィール】学科: ${userProfile.department}、学年: ${userProfile.grade}年、現在GPA: ${userProfile.currentGpa}、修得単位: ${userProfile.currentCredits}単位\n\n質問: ${text}` },
                    ...(currentImg?.data ? [{
                      inlineData: {
                        mimeType: currentImg.mimeType || 'image/jpeg',
                        data: currentImg.data.replace(/^data:[^;]+;base64,/, '')
                      }
                    }] : [])
                  ]
                }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
              })
            }
          );
          if (directRes.ok) {
            const directData = await directRes.json();
            const candText = directData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candText) {
              const { shortLabel, mainText } = parseResponse(candText);
              const assistantMessage: ChatMessage = {
                id: `assistant_${Date.now()}`,
                sender: 'assistant',
                text: mainText,
                shortLabel,
                source: 'gemini',
                model: 'gemini-1.5-flash',
                timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
              };
              setMessages((prev) => [...prev, assistantMessage]);
              recovered = true;
            }
          }
        } catch (e) {
          // fallback to error message below
        }
      }

      if (!recovered) {
        const errorMessage: ChatMessage = {
          id: `assistant_err_${Date.now()}`,
          sender: 'assistant',
          text: `通信エラーが発生しました。（${err?.message || '接続できませんでした'}）\n画面右上の「⚙️ API設定」より接続テストをお試しいただくか、APIキーをご確認ください。`,
          shortLabel: '通信エラー',
          source: 'local',
          timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 空き教室検索バーからの直接実行
  const handleDirectRoomSearch = () => {
    const bldText = searchBuilding !== 'all' ? `${searchBuilding}の` : '';
    const query = `${searchDay}曜 ${searchPeriod}限 ${bldText}空き教室`;
    handleSend(query);
  };

  // テキストエリア自動調整
  const handleInputTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('チャットの会話履歴をクリアしますか？')) {
      localStorage.removeItem('enekoma_chat_history');
      setMessages([
        {
          id: 'welcome_cleared',
          sender: 'assistant',
          text: '履歴をクリアしました。空き教室検索、時間割の登録、不足単位の確認など、お気軽に入力してください。',
          shortLabel: '準備完了',
          source: 'local',
          timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleSaveApiKey = () => {
    const cleaned = apiKey.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem('enekoma_gemini_api_key', cleaned);
    }
    setApiSaveStatus('設定を保存しました。Gemini連携が有効になりました。');
    if (cleaned) {
      handleTestApiKey();
    }
    setTimeout(() => {
      setApiSaveStatus(null);
    }, 3000);
  };

  const handleTestApiKey = async () => {
    const keyToTest = apiKey.trim();
    if (!keyToTest && !hasServerKey) {
      setKeyTestResult({ success: false, message: 'APIキーを入力してください。' });
      return;
    }
    setIsTestingKey(true);
    setKeyTestResult(null);

    let testSucceeded = false;
    let replyModel = '1.5 Flash';
    let errorMessage = '';

    // 1. サーバー側（/api/chat）のテスト
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '日大文理学部の魅力を1行で教えてください。',
          apiKey: keyToTest,
          userProfile
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.source === 'gemini') {
          testSucceeded = true;
          replyModel = data.model || 'Gemini Flash';
        } else if (data?.error) {
          errorMessage = data.error;
        } else if (data?.reply?.startsWith('⚠️')) {
          errorMessage = data.reply;
        }
      } else {
        errorMessage = `HTTP ${res.status}`;
      }
    } catch (e: any) {
      errorMessage = e?.message || 'サーバー未接続';
    }

    // 2. サーバー側でエラーだった場合、ブラウザからGoogle APIへ直接テスト
    if (!testSucceeded && keyToTest) {
      try {
        let directRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${keyToTest}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: '日大文理' }] }]
            })
          }
        );
        if (!directRes.ok) {
          directRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${keyToTest}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: '日大文理' }] }]
              })
            }
          );
        }
        if (directRes.ok) {
          testSucceeded = true;
          replyModel = 'gemini-3.8-flash';
        } else {
          const errData = await directRes.json().catch(() => ({}));
          const googleMsg = errData?.error?.message || `HTTP ${directRes.status}`;
          if (directRes.status === 400) {
            errorMessage = `APIキーが無効です（${googleMsg}）。Google AI Studioで作成されたキー（AIzaSy...）をもう一度ご確認ください。`;
          } else if (directRes.status === 429) {
            errorMessage = 'Gemini APIの利用制限（レートリミット）に達しています。数分お待ちいただくか別のキーをお試しください。';
          } else {
            errorMessage = `Google APIエラー: ${googleMsg}`;
          }
        }
      } catch (e: any) {
        errorMessage = `通信エラー: Google APIサーバーに接続できませんでした（${e?.message || 'オフライン'}）`;
      }
    }

    if (testSucceeded) {
      setKeyTestResult({
        success: true,
        message: `✓ 接続成功：Gemini API（${replyModel}）が正常に応答しました。自然言語対話および時間割・成績表の画像読取が利用可能です。`
      });
    } else {
      setKeyTestResult({
        success: false,
        message: errorMessage || 'Geminiへの接続テストに失敗しました。APIキーをご確認ください。'
      });
    }
    setIsTestingKey(false);
  };

  // 手動で履修中科目を追加
  const handleAddEnrolledCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    const newItem: EnrolledCourseItem = {
      name: newCourseName.trim(),
      day: newCourseDay,
      period: newCoursePeriod,
      room: newCourseRoom.trim() || '未定',
      credits: Number(newCourseCredits) || 2
    };

    const updatedCourses = [...userProfile.enrolledCourses, newItem];
    const updatedSemCredits = updatedCourses.reduce((sum, c) => sum + c.credits, 0);

    saveProfile({
      ...userProfile,
      enrolledCourses: updatedCourses,
      semesterCredits: updatedSemCredits
    });

    setNewCourseName('');
    setNewCourseRoom('');
  };

  // 履修中科目の削除
  const handleDeleteEnrolledCourse = (index: number) => {
    const updatedCourses = userProfile.enrolledCourses.filter((_, i) => i !== index);
    const updatedSemCredits = updatedCourses.reduce((sum, c) => sum + c.credits, 0);
    saveProfile({
      ...userProfile,
      enrolledCourses: updatedCourses,
      semesterCredits: updatedSemCredits
    });
  };

  // 修得済み科目のトグル
  const toggleCourseCompleted = (courseName: string, credits: number, year: number) => {
    const isCompleted = userProfile.completedCourses.some((c) => c.name === courseName);
    let updated: CourseRecord[];
    let deltaCredits = 0;

    if (isCompleted) {
      updated = userProfile.completedCourses.filter((c) => c.name !== courseName);
      deltaCredits = -credits;
    } else {
      updated = [
        ...userProfile.completedCourses,
        { name: courseName, credits, grade: 'A', year }
      ];
      deltaCredits = credits;
    }

    const newCredits = Math.max(0, userProfile.currentCredits + deltaCredits);
    saveProfile({
      ...userProfile,
      currentCredits: newCredits,
      completedCourses: updated
    });
  };

  const liveDeficiency = analyzeAcademicDeficiency(userProfile);
  const liveDeptData = GAKUBU_YORAN_DEPARTMENTS[userProfile.department] || GAKUBU_YORAN_DEPARTMENTS['情報科学科'];
  const liveGpaSim = simulateGpaEngine(
    userProfile.currentCredits,
    userProfile.currentGpa,
    userProfile.targetGpa,
    userProfile.semesterCredits
  );

  const filteredChips = QUICK_CHIPS.filter(
    (chip) => activeChipCategory === 'all' || chip.category === activeChipCategory
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* ========================================================
          ヘッダー：落ち着いた大学ポータルデザイン
      ======================================================== */}
      <header className="bg-white border-b border-slate-200 px-4 py-2.5 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          {/* 学章・ポータルアイコン */}
          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white font-serif font-bold text-sm tracking-widest shadow-xs">
            CHS
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-semibold text-slate-900 tracking-tight">EneKoma</h1>
              <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700 border border-slate-200">
                日本大学文理学部ポータル
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              時間割・空き教室案内 ｜ 履修要綱・卒業判定 ｜ キャンパス施設
            </p>
          </div>
        </div>

        {/* ヘッダー右側：実用的なステータスとナビゲーション */}
        <div className="flex items-center space-x-2">
          {/* 今期履修中単位バッジ */}
          <button
            onClick={() => {
              setProfileTab('timetable');
              setShowProfileModal(true);
            }}
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition"
            title="今期の履修中科目を確認・編集"
          >
            <span className="text-slate-400">📅</span>
            <span>今期: <strong>{userProfile.semesterCredits}単位</strong></span>
            <span className="text-[11px] text-slate-400">({userProfile.enrolledCourses.length}科目)</span>
          </button>

          {/* 総単位進捗バッジ */}
          <button
            onClick={() => {
              setProfileTab('completed');
              setShowProfileModal(true);
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition"
            title="修得済み単位と卒業要件を確認"
          >
            <span className="text-slate-400">🎓</span>
            <span>修得: <strong>{userProfile.currentCredits}</strong> / 124単位</span>
          </button>

          {/* API連携ステータス */}
          <button
            onClick={() => setShowApiModal(true)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition ${
              apiKey.trim() || hasServerKey
                ? 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
            title="Google Gemini API設定"
          >
            <span className={`w-2 h-2 rounded-full ${apiKey.trim() || hasServerKey ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="hidden sm:inline">{apiKey.trim() || hasServerKey ? 'Gemini連携中' : 'API未設定'}</span>
          </button>

          {/* プロフィール設定ボタン */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
            title="学生履修プロフィールの編集"
          >
            👤
          </button>

          {/* 要覧早見表 */}
          <button
            onClick={() => setShowDrawer(true)}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
            title="学部要覧の早見表を開く"
          >
            📋
          </button>

          {/* 会話履歴クリア */}
          <button
            onClick={handleClearHistory}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition"
            title="チャット履歴を消去"
          >
            🗑️
          </button>
        </div>
      </header>

      {/* プロフィール自動反映時の通知トースト */}
      {profileNotification && (
        <div className="bg-slate-800 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium shadow-sm transition">
          {profileNotification}
        </div>
      )}

      {/* ========================================================
          空き教室クイック検索ツールバー（人間が使うための直感UI）
      ======================================================== */}
      <section className="bg-white border-b border-slate-200 px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-900 flex items-center space-x-1">
              <span>🏫</span>
              <span>空き教室検索:</span>
            </span>
            {/* 曜日選択 */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-md border border-slate-200">
              {['月', '火', '水', '木', '金', '土'].map((d) => (
                <button
                  key={d}
                  onClick={() => setSearchDay(d)}
                  className={`px-2 py-1 rounded font-medium transition ${
                    searchDay === d ? 'bg-slate-800 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* 時限選択 */}
            <select
              value={searchPeriod}
              onChange={(e) => setSearchPeriod(Number(e.target.value))}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-md font-medium text-slate-700"
            >
              <option value={1}>1限 (09:00〜10:30)</option>
              <option value={2}>2限 (10:40〜12:10)</option>
              <option value={3}>3限 (13:00〜14:30)</option>
              <option value={4}>4限 (14:40〜16:10)</option>
              <option value={5}>5限 (16:20〜17:50)</option>
            </select>

            {/* 号館選択 */}
            <select
              value={searchBuilding}
              onChange={(e) => setSearchBuilding(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-md font-medium text-slate-700 hidden sm:block"
            >
              <option value="all">全号館</option>
              <option value="3号館">3号館</option>
              <option value="4号館">4号館</option>
              <option value="1号館">1号館</option>
              <option value="2号館">2号館</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDirectRoomSearch}
              disabled={isLoading}
              className="px-3.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-md font-medium transition flex items-center space-x-1 disabled:opacity-50"
            >
              <span>🔍</span>
              <span>空き教室を表示</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          メインコンテンツ：チャット表示エリア
      ======================================================== */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 max-w-4xl w-full mx-auto flex flex-col space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[92%] sm:max-w-[85%] rounded-xl p-4 shadow-2xs relative ${
                msg.sender === 'user'
                  ? 'bg-slate-800 text-slate-100 rounded-tr-xs'
                  : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
              }`}
            >
              {/* アシスタントヘッダー */}
              {msg.sender === 'assistant' && (
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-900">EneKoma</span>
                    {msg.source === 'gemini' ? (
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                        Gemini {msg.model || '1.5 Flash'}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                        要覧ナレッジ
                      </span>
                    )}
                  </div>
                  {msg.shortLabel && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
                      {msg.shortLabel}
                    </span>
                  )}
                </div>
              )}

              {/* 添付画像プレビュー（ユーザー側） */}
              {msg.imagePreview && (
                <div className="mb-2 rounded-lg overflow-hidden border border-slate-300 max-w-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={msg.imagePreview} alt="送信画像" className="max-h-56 w-auto object-contain bg-slate-900/5" />
                  {msg.imageTypeLabel && (
                    <div className="text-[11px] py-1 px-2 bg-slate-700 text-slate-200">
                      種別：{msg.imageTypeLabel}
                    </div>
                  )}
                </div>
              )}

              {/* メッセージ本文 */}
              <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {msg.text}
              </div>

              {/* フッター */}
              <div
                className={`mt-2.5 flex items-center justify-between text-[11px] pt-1.5 border-t ${
                  msg.sender === 'user' ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.sender === 'assistant' && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="hover:text-slate-800 flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-slate-100 transition"
                  >
                    <span>{copiedId === msg.id ? '✓ コピー済み' : 'コピー'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* 思考中ローディング */}
        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="bg-white border border-slate-200 rounded-xl rounded-tl-xs px-4 py-3 shadow-2xs flex items-center space-x-2.5">
              <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-slate-500 ml-1">要覧データおよび時間割を照合中...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* ========================================================
          入力ツールバー ＆ クイックサジェスト
      ======================================================== */}
      <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 max-w-4xl w-full mx-auto">
        {/* カテゴリフィルターチップ */}
        <div className="flex items-center space-x-1.5 pb-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-medium text-slate-400 mr-1 whitespace-nowrap">おすすめ質問:</span>
          <button
            onClick={() => setActiveChipCategory('all')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${
              activeChipCategory === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setActiveChipCategory('rooms')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${
              activeChipCategory === 'rooms' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🏫 空き教室
          </button>
          <button
            onClick={() => setActiveChipCategory('timetable')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${
              activeChipCategory === 'timetable' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📅 時間割・空きコマ
          </button>
          <button
            onClick={() => setActiveChipCategory('academic')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${
              activeChipCategory === 'academic' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🎓 履修・卒業・GPA
          </button>
          <button
            onClick={() => setActiveChipCategory('campus')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${
              activeChipCategory === 'campus' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🏢 施設・自販機
          </button>
        </div>

        {/* チップボタン一覧 */}
        <div className="flex items-center space-x-2 py-1 overflow-x-auto no-scrollbar pb-2">
          {filteredChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.query)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 whitespace-nowrap transition flex-shrink-0"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* 添付画像プレビュー＆読み取り種別セレクター */}
        {attachedImage && (
          <div className="mb-2 p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={attachedImage.previewUrl} alt="添付画像" className="w-12 h-12 object-cover rounded border border-slate-300" />
              <div>
                <div className="text-xs font-semibold text-slate-900">画像を添付しました（解析種別を選択してください）</div>
                {/* 種別切り替えタブ */}
                <div className="flex flex-wrap gap-1 mt-1">
                  <button
                    type="button"
                    onClick={() => setAttachedImage({ ...attachedImage, imageType: 'current_timetable' })}
                    className={`text-[11px] px-2 py-0.5 rounded border transition ${
                      attachedImage.imageType === 'current_timetable'
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    📅 今期の時間割（履修中に登録）
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttachedImage({ ...attachedImage, imageType: 'past_timetable' })}
                    className={`text-[11px] px-2 py-0.5 rounded border transition ${
                      attachedImage.imageType === 'past_timetable'
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    📜 過去の時間割（修得済みに追加）
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttachedImage({ ...attachedImage, imageType: 'transcript' })}
                    className={`text-[11px] px-2 py-0.5 rounded border transition ${
                      attachedImage.imageType === 'transcript'
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    📊 成績通知書（GPA・単位）
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setAttachedImage(null)}
              className="self-end sm:self-center text-slate-400 hover:text-slate-700 text-sm px-2 py-1"
              title="添付を解除"
            >
              ✕ 解除
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
            className="p-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 transition"
            title="時間割表または成績表の画像を添付"
          >
            📎
          </button>

          {/* テキスト入力エリア */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleInputTextChange}
              onKeyDown={handleKeyDown}
              placeholder="質問を入力（例: 月曜2限の空き教室 / 単位足りてる？ / 目標GPA3.0 / 3306教室）"
              className="w-full resize-none px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 bg-white"
            />
          </div>

          {/* 送信ボタン */}
          <button
            onClick={() => handleSend()}
            disabled={(!inputText.trim() && !attachedImage) || isLoading}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white rounded-lg font-medium text-sm transition flex items-center justify-center shrink-0"
          >
            送信
          </button>
        </div>
      </footer>

      {/* ========================================================
          学生履修プロフィールモーダル（Web履修ポータル風）
      ======================================================== */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200">
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">学生履修プロフィール</h3>
                <p className="text-xs text-slate-500">
                  {userProfile.department} {userProfile.grade}年 ｜ {userProfile.admissionYear === 'reiwa6_or_earlier' ? '令和6年度以前入学者（旧カリ）' : '令和7年度以降入学者（新カリ）'}
                </p>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg px-2"
              >
                ✕
              </button>
            </div>

            {/* タブ切り替え */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-3 pt-2 space-x-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setProfileTab('timetable')}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
                  profileTab === 'timetable'
                    ? 'border-slate-800 text-slate-900 bg-white rounded-t'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                📅 今期履修中 ({userProfile.semesterCredits}単位)
              </button>
              <button
                onClick={() => setProfileTab('completed')}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
                  profileTab === 'completed'
                    ? 'border-slate-800 text-slate-900 bg-white rounded-t'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                📜 修得済み科目 ({userProfile.completedCourses.length}件)
              </button>
              <button
                onClick={() => setProfileTab('reqCourses')}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
                  profileTab === 'reqCourses'
                    ? 'border-slate-800 text-slate-900 bg-white rounded-t'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                📌 学科必修チェック ({liveDeficiency.missingMajorReqs.length === 0 ? '完修' : `残${liveDeficiency.missingMajorReqs.length}`})
              </button>
              <button
                onClick={() => setProfileTab('basic')}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
                  profileTab === 'basic'
                    ? 'border-slate-800 text-slate-900 bg-white rounded-t'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                ⚙️ 基本設定・GPA
              </button>
              <button
                onClick={() => setProfileTab('courses')}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
                  profileTab === 'courses'
                    ? 'border-slate-800 text-slate-900 bg-white rounded-t'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                🏅 資格コース
              </button>
              <button
                onClick={() => setProfileTab('minors')}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
                  profileTab === 'minors'
                    ? 'border-slate-800 text-slate-900 bg-white rounded-t'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                🌐 副専攻 (24種)
              </button>
            </div>

            {/* モーダル本文 */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
              {/* TAB 1: 今期履修中（時間割） */}
              {profileTab === 'timetable' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">今学期の履修中科目一覧</h4>
                      <p className="text-[11px] text-slate-500">
                        時間割画像を送ることで自動登録されるほか、手動での追加・削除も可能です。
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        今期登録単位数: {userProfile.semesterCredits}単位
                      </span>
                    </div>
                  </div>

                  {/* 登録科目一覧テーブル */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-2.5">曜日・時限</th>
                          <th className="py-2 px-2.5">科目名</th>
                          <th className="py-2 px-2.5">教室</th>
                          <th className="py-2 px-2.5">単位</th>
                          <th className="py-2 px-2.5 text-center">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {userProfile.enrolledCourses.length > 0 ? (
                          userProfile.enrolledCourses.map((c, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-2 px-2.5 font-medium whitespace-nowrap">
                                {c.day}曜 {c.period}限
                              </td>
                              <td className="py-2 px-2.5 font-semibold text-slate-900">
                                {c.name}
                                {c.teacher && <span className="ml-1 text-[11px] font-normal text-slate-500">({c.teacher})</span>}
                              </td>
                              <td className="py-2 px-2.5 text-slate-600 whitespace-nowrap">{c.room || '-'}</td>
                              <td className="py-2 px-2.5 text-slate-600 whitespace-nowrap">{c.credits}単位</td>
                              <td className="py-2 px-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEnrolledCourse(i)}
                                  className="text-rose-600 hover:text-rose-800 text-[11px]"
                                >
                                  削除
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-slate-400">
                              今期の履修中科目はまだ登録されていません。時間割画像を送信するか、下のフォームから追加してください。
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* 手動追加フォーム */}
                  <form onSubmit={handleAddEnrolledCourse} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="font-semibold text-slate-800 text-xs">＋ 科目を手動で追加</div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <select
                        value={newCourseDay}
                        onChange={(e) => setNewCourseDay(e.target.value)}
                        className="px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                      >
                        {['月', '火', '水', '木', '金', '土'].map((d) => (
                          <option key={d} value={d}>{d}曜日</option>
                        ))}
                      </select>
                      <select
                        value={newCoursePeriod}
                        onChange={(e) => setNewCoursePeriod(Number(e.target.value))}
                        className="px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                      >
                        {[1, 2, 3, 4, 5].map((p) => (
                          <option key={p} value={p}>{p}限</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="科目名"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        className="col-span-2 px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                      <input
                        type="text"
                        placeholder="教室 (例: 3306)"
                        value={newCourseRoom}
                        onChange={(e) => setNewCourseRoom(e.target.value)}
                        className="px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-3 py-1 bg-slate-800 text-white rounded text-xs font-medium hover:bg-slate-900"
                      >
                        時間割に追加
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: 修得済み科目一覧 */}
              {profileTab === 'completed' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">修得済み科目一覧（計 {userProfile.currentCredits}単位）</h4>
                      <p className="text-[11px] text-slate-500">
                        卒業要件（全学科共通124単位）までの進捗：あと {Math.max(0, 124 - userProfile.currentCredits)}単位
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                        達成率: {Math.min(100, Math.round((userProfile.currentCredits / 124) * 100))}%
                      </span>
                    </div>
                  </div>

                  {/* 進捗バー */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-slate-800 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (userProfile.currentCredits / 124) * 100)}%` }}
                    />
                  </div>

                  {/* 科目テーブル */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-72 overflow-y-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-2.5">科目名</th>
                          <th className="py-2 px-2.5">単位数</th>
                          <th className="py-2 px-2.5">評価</th>
                          <th className="py-2 px-2.5 text-center">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {userProfile.completedCourses.map((c, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-2 px-2.5 font-medium text-slate-900">{c.name}</td>
                            <td className="py-2 px-2.5 text-slate-600">{c.credits}単位</td>
                            <td className="py-2 px-2.5 font-bold text-slate-700">{c.grade}</td>
                            <td className="py-2 px-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = userProfile.completedCourses.filter((_, idx) => idx !== i);
                                  const newCredits = Math.max(0, userProfile.currentCredits - c.credits);
                                  saveProfile({ ...userProfile, completedCourses: updated, currentCredits: newCredits });
                                }}
                                className="text-rose-600 hover:text-rose-800 text-[11px]"
                              >
                                削除
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: 必修科目チェックリスト */}
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
                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        未修得: {liveDeficiency.missingMajorReqs.length}科目
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                    {liveDeptData.requiredCourses.map((req) => {
                      const isCompleted = userProfile.completedCourses.some((c) => c.name === req.name);
                      return (
                        <label
                          key={req.name}
                          className={`flex items-start justify-between p-2.5 cursor-pointer transition ${
                            isCompleted ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start space-x-2.5">
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() => toggleCourseCompleted(req.name, req.credits, req.year)}
                              className="mt-0.5 rounded text-slate-800 focus:ring-slate-500"
                            />
                            <div>
                              <div className={`font-semibold text-xs ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                {req.name}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {req.year}年配当 {req.semester ? `・${req.semester}` : ''} ｜ {req.credits}単位
                                {req.note ? `（${req.note}）` : ''}
                              </div>
                            </div>
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                            isCompleted ? 'bg-slate-200 text-slate-700' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isCompleted ? '修得済' : '未修得'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: 基本情報・GPA目標 */}
              {profileTab === 'basic' && (
                <div className="space-y-4">
                  {/* カリキュラム体系 */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="block font-semibold text-slate-800 text-xs mb-1.5 flex items-center justify-between">
                      <span>入学年度 / カリキュラム体系:</span>
                      <span className="text-[10px] text-slate-500">時間割・履修要綱の判定基準</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => saveProfile({ ...userProfile, admissionYear: 'reiwa7_or_later' })}
                        className={`px-3 py-2 rounded text-xs font-semibold border text-center transition ${
                          (userProfile.admissionYear || 'reiwa7_or_later') === 'reiwa7_or_later'
                            ? 'bg-slate-800 text-white border-slate-800 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        令和7年度以降入学者（新カリキュラム / 2025〜）
                      </button>
                      <button
                        type="button"
                        onClick={() => saveProfile({ ...userProfile, admissionYear: 'reiwa6_or_earlier' })}
                        className={`px-3 py-2 rounded text-xs font-semibold border text-center transition ${
                          userProfile.admissionYear === 'reiwa6_or_earlier'
                            ? 'bg-slate-800 text-white border-slate-800 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        令和6年度以前入学者（旧カリキュラム / 〜2024）
                      </button>
                    </div>
                  </div>

                  {/* 学科・学年 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-800 text-xs mb-1">所属学科（全18学科）:</label>
                      <select
                        value={userProfile.department}
                        onChange={(e) => saveProfile({ ...userProfile, department: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-xs sm:text-sm font-medium"
                      >
                        {CHS_DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-800 text-xs mb-1">学年:</label>
                      <select
                        value={userProfile.grade}
                        onChange={(e) => saveProfile({ ...userProfile, grade: parseInt(e.target.value, 10) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-xs sm:text-sm font-medium"
                      >
                        {[1, 2, 3, 4].map((g) => (
                          <option key={g} value={g}>{g}年</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 単位・GPA */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div>
                      <label className="block font-semibold text-slate-800 text-xs mb-1">現在の総修得単位数:</label>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min={0}
                          max={160}
                          value={userProfile.currentCredits}
                          onChange={(e) => saveProfile({ ...userProfile, currentCredits: parseInt(e.target.value || '0', 10) })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-xs sm:text-sm font-bold text-slate-900"
                        />
                        <span className="text-xs text-slate-500 whitespace-nowrap">/ 124</span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-800 text-xs mb-1">今期履修中の単位数:</label>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={userProfile.semesterCredits}
                          onChange={(e) => saveProfile({ ...userProfile, semesterCredits: parseInt(e.target.value || '0', 10) })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-xs sm:text-sm"
                        />
                        <span className="text-xs text-slate-500 whitespace-nowrap">単位</span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-800 text-xs mb-1">現在のGPA:</label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={4.0}
                        value={userProfile.currentGpa}
                        onChange={(e) => saveProfile({ ...userProfile, currentGpa: parseFloat(e.target.value || '0') })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-xs sm:text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-800 text-xs mb-1">目標GPA:</label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={4.0}
                        value={userProfile.targetGpa}
                        onChange={(e) => saveProfile({ ...userProfile, targetGpa: parseFloat(e.target.value || '0') })}
                        className="w-full px-3 py-1.5 border border-slate-400 bg-white text-slate-900 rounded text-xs sm:text-sm font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: 資格コース選択 */}
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
                          className={`flex items-start space-x-2.5 p-3 rounded-lg border cursor-pointer transition ${
                            isChecked
                              ? 'bg-slate-100 border-slate-400 text-slate-900 shadow-2xs'
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
                            className="mt-0.5 rounded text-slate-800 focus:ring-slate-500"
                          />
                          <div className="text-xs space-y-0.5">
                            <div className="font-semibold flex items-center space-x-1">
                              <span>{c.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal">({c.page})</span>
                            </div>
                            <div className="text-[11px] text-slate-500">{c.target}</div>
                            <div className="text-[10px] text-slate-600 font-medium">
                              窓口: {c.window} ｜ 必要: {c.requiredCredits}単位
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 6: 副専攻選択 */}
              {profileTab === 'minors' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-600">
                    修了を目指す副専攻を選択してください（16単位修得で修了証書。所属学科と同一の副専攻は選択不可）。
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                    {GAKUBU_YORAN_ALL_24_MINORS.map((m) => {
                      const isChecked = userProfile.selectedMinors.includes(m.name);
                      return (
                        <label
                          key={m.name}
                          className={`flex items-start space-x-2 p-2.5 rounded-lg border cursor-pointer transition text-xs ${
                            isChecked
                              ? 'bg-slate-100 border-slate-400 text-slate-900 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...userProfile.selectedMinors, m.name]
                                : userProfile.selectedMinors.filter((x) => x !== m.name);
                              saveProfile({ ...userProfile, selectedMinors: updated });
                            }}
                            className="mt-0.5 rounded text-slate-800 focus:ring-slate-500"
                          />
                          <div>
                            <div className="font-semibold">{m.name}</div>
                            <div className="text-[10px] text-slate-500">{(m.targetDept || '全学科対象')} ｜ {m.creditsReq}単位必要</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* フッター */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500">変更内容は自動保存されます</span>
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-md font-medium hover:bg-slate-900 transition"
              >
                完了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          API設定モーダル（Google Gemini APIキー）
      ======================================================== */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Google Gemini API設定</h3>
                <p className="text-xs text-slate-500">無料枠で利用可能・自然な回答と時間割/成績表のOCR解析を有効化</p>
              </div>
              <button onClick={() => setShowApiModal(false)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                APIキーを設定すると、時間割表や成績表の写真解析、柔軟な言い回しでの質問受付が有効になります。
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] space-y-1">
                <div className="font-semibold text-slate-800">🔑 APIキーの取得手順（無料・約1分）:</div>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                  <li>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline font-medium hover:text-blue-800"
                    >
                      Google AI Studio（外部サイト）
                    </a>
                    にアクセス
                  </li>
                  <li>Googleアカウントでログインし「Create API key」をクリック</li>
                  <li>生成されたキー（AIzaSy...）を下の入力欄に貼り付け</li>
                </ol>
              </div>
            </div>

            {hasServerKey && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                ✓ サーバー環境変数に <code>GEMINI_API_KEY</code> が設定されています。ブラウザでの入力を行わなくても即時利用可能です。
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Gemini APIキー:</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-mono focus:outline-none focus:border-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  {showApiKey ? '非表示' : '表示'}
                </button>
              </div>
            </div>

            {/* 接続テスト結果 */}
            {keyTestResult && (
              <div className={`p-2.5 rounded-md text-xs border ${
                keyTestResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {keyTestResult.message}
              </div>
            )}

            {apiSaveStatus && (
              <div className="text-xs text-emerald-700 font-semibold text-center">
                ✓ {apiSaveStatus}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleTestApiKey}
                disabled={isTestingKey}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition disabled:opacity-50"
              >
                {isTestingKey ? 'テスト中...' : '接続テスト'}
              </button>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowApiModal(false)}
                  className="px-3 py-2 border border-slate-300 rounded-md text-xs text-slate-600 hover:bg-slate-50"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-4 py-2 bg-slate-800 text-white rounded-md text-xs font-medium hover:bg-slate-900 transition"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          要覧早見表ドロワーモーダル
      ======================================================== */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">日本大学文理学部『学部要覧』早見表</h3>
                <p className="text-xs text-slate-500">令和7年度公式カリキュラム・施設・設備データ</p>
              </div>
              <button onClick={() => setShowDrawer(false)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>

            <div className="flex border-b border-slate-200 bg-slate-50 px-3 pt-2 space-x-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setDrawerTab('credits')}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
                  drawerTab === 'credits' ? 'border-slate-800 text-slate-900 bg-white rounded-t' : 'border-transparent text-slate-500'
                }`}
              >
                単位・CAP制
              </button>
              <button
                onClick={() => setDrawerTab('courses')}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
                  drawerTab === 'courses' ? 'border-slate-800 text-slate-900 bg-white rounded-t' : 'border-transparent text-slate-500'
                }`}
              >
                資格コース
              </button>
              <button
                onClick={() => setDrawerTab('minors')}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
                  drawerTab === 'minors' ? 'border-slate-800 text-slate-900 bg-white rounded-t' : 'border-transparent text-slate-500'
                }`}
              >
                副専攻一覧
              </button>
              <button
                onClick={() => setDrawerTab('rooms')}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
                  drawerTab === 'rooms' ? 'border-slate-800 text-slate-900 bg-white rounded-t' : 'border-transparent text-slate-500'
                }`}
              >
                校舎・教室配置
              </button>
              <button
                onClick={() => setDrawerTab('vending')}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
                  drawerTab === 'vending' ? 'border-slate-800 text-slate-900 bg-white rounded-t' : 'border-transparent text-slate-500'
                }`}
              >
                自動販売機
              </button>
              <button
                onClick={() => setDrawerTab('hours')}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
                  drawerTab === 'hours' ? 'border-slate-800 text-slate-900 bg-white rounded-t' : 'border-transparent text-slate-500'
                }`}
              >
                営業時間
              </button>
            </div>

            <div className="p-4 overflow-y-auto text-xs sm:text-sm text-slate-700 space-y-3">
              {drawerTab === 'credits' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900">卒業に必要な124単位の区分内訳（要覧 p.31）</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>全学共通教育科目：自主創造の基礎（2単位必修・1年次）</li>
                    <li>総合教育科目：12単位必修（人文2, 社会2, 理学2を含む）。40単位まで自由選択算入可。</li>
                    <li>外国語教育科目：中国語(18), 英文(16), 独文(16), 他15学科(8単位)</li>
                    <li>基礎教育科目：健康スポーツ(3単位) ＋ 情報リテラシー(2単位)＝計5単位</li>
                    <li>学科専門科目：各学科指定（60〜78単位）</li>
                    <li>自由選択区分：各区分超過単位、他学科科目、コース科目</li>
                  </ul>
                  <h4 className="font-bold text-slate-900 pt-2">CAP制（年間40単位上限・要覧 p.35-36）</h4>
                  <p className="text-slate-600 text-xs">
                    前年度GPA3.0以上で年間+8単位（48単位）、GPA2.5以上で+6単位（46単位）、GPA2.0以上で+4単位（44単位）の加算措置があります。
                  </p>
                </div>
              )}

              {drawerTab === 'rooms' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900">校舎・教室配置ルール</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>3号館</strong>：下2桁が01〜05は男子トイレ側、06〜10は女子トイレ側。エレベーター混雑時はエスカレーター推奨。</li>
                    <li><strong>4号館</strong>：給水所（冷水機）は1階のみ利用可能。トイレ前にゴミ箱あり。</li>
                    <li><strong>1号館</strong>：4階・5階にはトイレがありません（2階または3階を利用）。</li>
                    <li><strong>2号館</strong>：自動販売機およびゴミ箱は館内に設置されていません。</li>
                  </ul>
                </div>
              )}

              {drawerTab === 'hours' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900">主要施設・窓口の営業時間</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>文理学部図書館</strong>：月〜金 09:00〜20:00 ｜ 土曜 09:00〜19:00</li>
                    <li><strong>コンピュータセンター</strong>：月〜金 09:00〜18:00 ｜ 土曜 09:00〜13:00</li>
                    <li><strong>ラーニング・コモンズ</strong>：月〜金 08:00〜18:00 ｜ 土曜 08:00〜17:00</li>
                    <li><strong>教務課窓口</strong>：月〜金 09:00〜17:00 ｜ 土曜 09:00〜13:00</li>
                  </ul>
                </div>
              )}

              {drawerTab === 'vending' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900">自動販売機・決済方法</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>3号館 1階（赤コカ・コーラ自販機）</strong>：Visa/Mastercard クレジットカードタッチ決済対応、PayPay、モバイルSuica、現金</li>
                    <li><strong>4号館 1階（サントリー自販機）</strong>：ジハンピアプリ、天然水80円、ZONe80円、レッドブル170円</li>
                  </ul>
                </div>
              )}

              {drawerTab === 'courses' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900">資格コース窓口一覧</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>教職コース・司書教諭コース ➔ 教職センター</li>
                    <li>司書・学芸員・社会教育主事・日本語教育コース ➔ 教務課</li>
                  </ul>
                </div>
              )}

              {drawerTab === 'minors' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900">全24副専攻</h4>
                  <p className="text-slate-600 text-xs">
                    各副専攻の指定科目から16単位以上を修得することで修了認定証書が授与されます。
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowDrawer(false)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-md text-xs font-medium hover:bg-slate-900"
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
