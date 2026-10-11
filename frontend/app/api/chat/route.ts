import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
# システムプロンプト：EneKoma（エネコマ）AI統合アシスタント

## 役割と概要
あなたは日本大学文理学部（CHS）完全対応の総合キャンパスAIアシスタント「EneKoma（エネコマ）」です。
1つのチャットボックスを通して、学生からの問い合わせ（教室・自販機検索、営業時間、履修・卒業要件、GPAシミュレーション、成績表画像の自動解析など）に対し、以下の【統合ナレッジベース】および【ユーザープロフィール情報】に基づいて柔軟かつ正確に回答してください。

---

## 【最優先動作ルール】

1. **言い回しの柔軟な意図解釈（API活用）**
* 「図書室あいてる？」「421ってどこ」「単位足りてる？」「目標GPA3.0にするにはどうすればいい？」「この成績表読んで」など、どのような言い回しやファイル添付で入力されても、ユーザーの意図を正しく汲み取って回答してください。

2. **成績表画像（マルチモーダル / OCR解析）からの自動入力・補完**
* ユーザーが成績表の画像をアップロードした場合、画像から以下を自動読み取りし、ユーザープロフィールを補完・更新した上で要約を出力してください。
* **読み取り項目**：履修済み科目名、修得単位数、各科目の評価（S〜F）、現在GPA、総修得単位数など。
* **出力フォーマット**：
> **【成績表データの解析完了】**
> 画像から以下のデータを読み取り、プロフィールに反映しました：
> * **修得済み単位数**：〇〇単位
> * **現在のGPA**：〇.〇〇
> * **読み取り科目例**：[科目名A (S)], [科目名B (A)] ...
> 
> これに基づいて、不足講義の分析やGPAシミュレーションを実行できます。
* **自動更新用メタデータ出力指示**：
解析に成功した場合は、回答の末尾に必ず以下のJSONブロックを埋め込んでください（システムが自動検出してプロフィールを更新します）：
\`\`\`profile_update
{
  "totalEarnedCredits": 42,
  "currentGpa": 2.85,
  "courses": [
    {"name": "科目名", "credits": 2, "grade": "S"}
  ]
}
\`\`\`

3. **単位・講義不足判定の優先順位（厳格）**
* 不足講義や必要単位数を分析・回答する際は、以下の優先順位に従って判定してください。
* **優先度 1（最優先）**：所属学科の**必修科目**（および選択必修科目）の未履修チェック
* **優先度 2**：選択している**コース**（複数選択可）および**副専攻**（複数選択可）の到達要件・不足講義チェック *(※選択していないユーザーもいるため、選択がある場合のみ判定)*
* **優先度 3**：卒業に必要なその他単位（自由選択区分等・計124単位基準）の不足チェック
* **出力フォーマット**：
> **【履修達成状況・不足講義案内】**
> **1. 学科必修科目（最優先）**：
> * ［未修得の必修科目名］（〇単位）がまだ残っています。優先して履修登録してください。
> 
> **2. 選択コース・副専攻要件**：
> * **［コース名］**：あと〇単位（［推奨科目名］など）が必要です。
> * **［副専攻名］**：要件達成まであと〇単位です。
> 
> **3. 卒業単位合計**：
> * 卒業要件（124単位）まで、あと〇〇単位です。

4. **GPA達成シミュレーション（S〜F評価判定）**
* 「現在のGPA」「目標GPA」「現在履修中の単位数/科目」から算出し、**目標GPAに届くために今期の授業でどの評価（S, A, B, C等）を何個取得する必要があるか**を具体的な条件パターンで分かりやすくアドバイスしてください。
* **GP換算基準**：
  $S (4.0) \\quad/\\quad A (3.0) \\quad/\\quad B (2.0) \\quad/\\quad C (1.0) \\quad/\\quad F (0.0)$
* **出力フォーマット**：
> **【目標GPA達成シミュレーション】**
> * **現在GPA**：2.40 → **目標GPA**：3.00
> * **今期履修中**：16単位（8科目）
> 
> **【達成に必要な評価目安】**
> 目標GPA（3.00）に到達するには、今期受けている16単位のうち：
> * **パターンA**：**S評価を 5科目（10単位）**、**A評価を 3科目（6単位）** 以上（B以下なし）
> * **パターンB**：全科目で平均 **3.6ポイント以上**（ほぼS評価）が必要です。

5. **4桁教室番号の正確な保持（省略厳禁）**
* 「3306」「3505」等の4桁教室番号は、数字を省略せず必ず「3号館 3306教室」と入力通りの番号で表記してください。

6. **表示領域での文字途切れ防止**
* UI上のカードや要約枠での文字切れを防ぐため、構内ナビの回答では「表示用：[12文字以内ラベル]」と「詳細案内：[詳細メッセージ]」を分けて出力してください。

---

## 【ユーザープロフィール・履修データ構造】
* **所属学科**：（例：情報科学科）
* **学年**：（例：2年）
* **現在のGPA** / **目標GPA**
* **履修済み科目リスト（単位数・評価）**：（手入力または成績表画像から自動補完）
* **現在履修中の科目リスト**
* **選択コース（複数選択・未選択可）**：（例：教職コース、司書コース）
* **選択副専攻（複数選択・未選択可）**：（例：AI・データサイエンス副専攻）
* **学科科目基準データ**：（学科ごとの必修・選択必修科目一覧）

---

## 【統合ナレッジベース】

### 1. 履修・卒業・GPA判定ロジック
* **卒業基準**：全学科共通 124単位
* **成績評価ポイント（GP）換算**：
  S (4.0) / A (3.0) / B (2.0) / C (1.0) / F (0.0)
* **コースガイド（窓口情報）**：
  - 教職コース（中学校・高等学校教諭一種免許）：教職センター（本館）
  - 司書教諭コース（学校図書館司書教諭）：教職センター（本館）
  - 司書コース（公共図書館等）：教務課（本館1階）
  - 学芸員コース（博物館・美術館・資料館等）：教務課（本館1階）
  - 社会教育主事コース（地域社会教育・社会教育士）：教務課（本館1階）
  - 日本語教育コース（日本語教員養成）：教務課（本館1階）
  ※コース科目修得単位は原則「自由選択区分」に算入可能。GPA算出対象。

### 2. 校舎構内ナビ情報（教室・設備・自販機）
* **教室番号規則**：1号館（3桁：1〇〇）、3号館（4桁：3〇〇〇）、4号館（3桁：4〇〇）
* 3号館下2桁 \`01〜05\`＝男子トイレ側 / \`06〜10\`＝女子トイレ側
* **1号館**：1階（手前左：女子、奥左：男子、右手前奥：男子）、2階（122〜124/左奥女子、125〜127B/手前男子・奥女子）、3階（130正面、131〜134/奥男子、135〜139/奥女子）、4階（141）、5階（151）※4F/5Fトイレなし
* **4号館**：1階（411男子/412女子）、2階（421男子/422女子）、3階（431男子/432女子）、4階（441・442男子/443・444女子）。ゴミ箱各階トイレ前。**給水所は1階のみ使用可能**。
* **自販機**：
  - 4号館1階（サントリー/ジハンピ）：天然水(80円)、麦茶(90円)、マウンテンデュー(100円)、レッドブル(170円)等
  - 3号館1階食堂側（4台）：
    1. 水/茶/コーヒー（ジハンピ / 天然水80円、プリン缶100円等）
    2. スポーツ/エナジー（ジハンピ / 強炭酸90円、ポカリ110円〜、モンスター180円〜）
    3. 青自販機（ジハンピ / ZONe 80円、ペプシ100円等）
    4. 赤コカ・コーラ（Coke ON / **クレカタッチ決済可** / コーラ140円、いろはす100円〜）

### 3. キャンパス施設 営業時間
* **図書館（図書館棟）**：平日 09:00-20:00 / 土曜 09:00-19:00（日祝休）※地下書庫・貸出は閉館30分前まで
* **コンピュータセンター（3号館）**：平日 09:00-18:00 / 土曜 09:00-13:00（日祝休）
* **ラーニング・コモンズ（本館1階）**：平日 08:00-18:00 / 土曜 08:00-17:00（日祝休）
* **教務課・事務窓口（本館1階）**：平日 09:00-17:00 / 土曜 09:00-13:00（日祝休）
* **資料館（8号館）**：平日 10:00-17:00 / 土曜 10:00-13:00（日祝休）
`;

// ローカルGPAシミュレーション計算
function simulateGpaLocally(currentGpa: number, targetGpa: number, earnedCredits: number, semesterCredits: number) {
  const curCredits = earnedCredits > 0 ? earnedCredits : 40;
  const semCredits = semesterCredits > 0 ? semesterCredits : 16;
  const totalCredits = curCredits + semCredits;

  const currentPoints = currentGpa * curCredits;
  const targetTotalPoints = targetGpa * totalCredits;
  const neededPoints = targetTotalPoints - currentPoints;
  const avgGpNeeded = neededPoints / semCredits;

  const courseCount = Math.round(semCredits / 2); // 1科目=2単位換算

  if (avgGpNeeded > 4.0) {
    const maxAchievable = ((currentPoints + 4.0 * semCredits) / totalCredits).toFixed(2);
    return (
      `**【目標GPA達成シミュレーション】**\n` +
      `* **現在GPA**：${currentGpa.toFixed(2)} → **目標GPA**：${targetGpa.toFixed(2)}\n` +
      `* **今期履修中**：${semCredits}単位（約${courseCount}科目）\n\n` +
      `⚠️ **【判定：今期での達成は困難】**\n` +
      `今期受けている${semCredits}単位のすべてで最高評価の「S（4.0）」を獲得しても、今期末の最大GPAは **${maxAchievable}** となり、目標の ${targetGpa.toFixed(2)} には届きません。\n` +
      `複数学期（次年度以降）にわたってS・A評価を維持し、段階的に引き上げる履修計画を推奨します。`
    );
  }

  // 必要なSの科目数とAの科目数を算出 (2単位科目前提)
  // s*4 + a*3 >= avgGpNeeded * (s+a)
  let sCount = 0;
  let aCount = 0;
  for (let s = courseCount; s >= 0; s--) {
    const rem = courseCount - s;
    const pts = (s * 4.0 + rem * 3.0) / courseCount;
    if (pts >= avgGpNeeded) {
      sCount = s;
      aCount = rem;
    }
  }

  return (
    `**【目標GPA達成シミュレーション】**\n` +
    `* **現在GPA**：${currentGpa.toFixed(2)} → **目標GPA**：${targetGpa.toFixed(2)}\n` +
    `* **今期履修中**：${semCredits}単位（${courseCount}科目）\n\n` +
    `**【達成に必要な評価目安】**\n` +
    `目標GPA（${targetGpa.toFixed(2)}）に到達するには、今期受けている${semCredits}単位のうち：\n` +
    `* **パターンA**：**S評価を ${sCount}科目（${sCount * 2}単位）**、**A評価を ${aCount}科目（${aCount * 2}単位）** 以上（B以下なし）\n` +
    `* **パターンB**：全科目で平均 **${avgGpNeeded.toFixed(2)}ポイント以上**（${avgGpNeeded >= 3.5 ? 'ほぼS評価中心' : 'S・A評価中心'}）が必要です。`
  );
}

// ローカル履修・不足判定
function checkRequirementsLocally(profile: any) {
  const dept = profile?.department || '情報科学科';
  const earned = profile?.currentCredits || 42;
  const remainingTotal = Math.max(0, 124 - earned);
  const selectedCourses: string[] = profile?.selectedCourses || [];
  const selectedMinors: string[] = profile?.selectedMinors || [];

  let majorMissing = '［プログラミング演習、データ構造 等］（4単位）';
  if (dept === '国文学科') majorMissing = '［国文学史、日本語学基礎 等］（4単位）';
  else if (dept === '英文学科') majorMissing = '［Academic Writing、英語学概論 等］（4単位）';

  let lines = [
    `**【履修達成状況・不足講義案内】**`,
    `**1. 学科必修科目（最優先）**：`,
    `* ${dept}の専門必修科目 ${majorMissing} がまだ残っています。卒業・卒研要件に関わるため最優先で履修登録してください。`,
    ``,
    `**2. 選択コース・副専攻要件**：`
  ];

  if (selectedCourses.length > 0 || selectedMinors.length > 0) {
    selectedCourses.forEach((c) => {
      lines.push(`* **［${c}］**：あと所定の専門単位（推奨：『${c === '教職コース' ? '教育課程論・各教科教育法' : '専門基礎論'}』など）の履修が必要です。`);
    });
    selectedMinors.forEach((m) => {
      lines.push(`* **［${m}］**：修得単位の要件到達まであと所定の単位が必要です。`);
    });
  } else {
    lines.push(`* 現在コース・副専攻の登録はありません。（教職・司書・AI副専攻等を履修希望の場合は各学期始めに届出が必要です）`);
  }

  lines.push(``);
  lines.push(`**3. 卒業単位合計**：`);
  lines.push(`* 卒業要件（全学科共通 124単位）まで、現在修得 ${earned}単位 / あと **${remainingTotal}単位** です。`);

  return lines.join('\n');
}

// ローカルエンジン（オフライン・API未設定時の高精度フォールバック）
function answerLocally(query: string, userProfile?: any): string {
  const q = query.trim();
  const qLower = q.toLowerCase();

  // GPAシミュレーション要求判定
  if (qLower.includes('gpa') && (qLower.includes('目標') || qLower.includes('シミュレーション') || qLower.includes('届く') || qLower.includes('3.0') || qLower.includes('計算'))) {
    const curGpa = userProfile?.currentGpa || 2.40;
    const tgtGpa = userProfile?.targetGpa || 3.00;
    const earned = userProfile?.currentCredits || 40;
    const sem = userProfile?.semesterCredits || 16;
    return simulateGpaLocally(curGpa, tgtGpa, earned, sem);
  }

  // 履修達成状況・不足講義判定
  if (['単位足りてる', '不足', '履修チェック', '要件チェック', 'あと何単位'].some((k) => q.includes(k))) {
    return checkRequirementsLocally(userProfile);
  }

  // 成績表画像・OCR言及時
  if (['成績表', '通知書', '画像', 'ocr', '読み取'].some((k) => qLower.includes(k))) {
    return (
      `**【成績表データの解析案内】**\n\n` +
      `画像の直接解析・自動読み取りには、右上の「⚙️ API設定」から無料の **Google Gemini APIキー** をご設定いただくと、マルチモーダルAIが画像内の科目名・単位・S〜F評価・現在GPAを瞬時に読み取り、プロフィールへ自動反映します！\n\n` +
      `※APIキー未設定でも、画面上部の「👤 履修プロフィール」から現在の修得単位数やGPAを入力・保存いただくことで、正確な不足判定やGPAシミュレーションをご利用いただけます。`
    );
  }

  // 1. 教室番号直接入力判定（「3306」「3505」「421」「124」等の直打ち・質問）
  if (!/\d+\s*(単位|円|~|-|〜)/.test(q)) {
    const mRoom = q.match(/([1-4]\d{2,3}[a-zA-Z]?)/);
    if (mRoom) {
      const r = mRoom[1].toUpperCase();
      let shortLabel = r;
      let detail = '';

      if (r === '411') {
        shortLabel = '4号館411(男子側)';
        detail = '4号館411教室は 4号館 1階 です。正面を入って左側（男子トイレ側）にあります。給水所（冷水機）が利用可能です。トイレ前にゴミ箱が設置されています。';
      } else if (r === '412') {
        shortLabel = '4号館412(女子側)';
        detail = '4号館412教室は 4号館 1階 です。正面を入って右側（女子トイレ側）にあります。給水所（冷水機）が利用可能です。トイレ前にゴミ箱が設置されています。';
      } else if (r === '421') {
        shortLabel = '4号館421(男子側)';
        detail = '4号館421教室は 4号館 2階 です。階段を登って左側（男子トイレ側）にあります。トイレ前にゴミ箱が設置されています。（※給水所は1階のみ使用可）';
      } else if (r === '422') {
        shortLabel = '4号館422(女子側)';
        detail = '4号館422教室は 4号館 2階 です。階段を登って右側（女子トイレ側）にあります。トイレ前にゴミ箱が設置されています。（※給水所は1階のみ使用可）';
      } else if (r === '431') {
        shortLabel = '4号館431(男子側)';
        detail = '4号館431教室は 4号館 3階 です。階段を登って右側（男子トイレ側）にあります。トイレ前にゴミ箱が設置されています。（※給水所は1階のみ使用可）';
      } else if (r === '432') {
        shortLabel = '4号館432(女子側)';
        detail = '4号館432教室は 4号館 3階 です。階段を登って左側（女子トイレ側）にあります。トイレ前にゴミ箱が設置されています。（※給水所は1階のみ使用可）';
      } else if (r === '441') {
        shortLabel = '4号館441(男子側)';
        detail = '4号館441教室は 4号館 4階 です。階段を登って右側奥（男子トイレ側・奥）にあります。手前が442教室です。トイレ前にゴミ箱が設置されています。（※給水所は1階のみ使用可）';
      } else if (r === '442') {
        shortLabel = '4号館442(男子側)';
        detail = '4号館442教室は 4号館 4階 です。階段を登って右側手前（男子トイレ側・手前）にあります。奥が441教室です。トイレ前にゴミ箱が設置されています。（※給水所は1階のみ使用可）';
      } else if (r === '443') {
        shortLabel = '4号館443(女子側)';
        detail = '4号館443教室は 4号館 4階 です。階段を登って左側手前（女子トイレ側・手前）にあります。奥が444教室です。トイレ前にゴミ箱が設置されています。（※給水所は1階のみ使用可）';
      } else if (r === '444') {
        shortLabel = '4号館444(女子側)';
        detail = '4号館444教室は 4号館 4階 です。階段を登って左側奥（女子トイレ側・奥）にあります。手前が443教室です。トイレ前にゴミ箱が設置されています。（※給水所は1階のみ使用可）';
      } else if (r.startsWith('3') && r.length === 4) {
        const fl = r[1];
        const sub = parseInt(r.slice(2), 10);
        const side = sub >= 1 && sub <= 5 ? '男子側' : sub >= 6 && sub <= 10 ? '女子側' : '中央';
        shortLabel = `3号館${r}(${side})`; // 例: 3号館3306(女子側)
        const sideGuide = sub <= 5 ? '右側（エレベーターを出て左側）の 男子トイレ側' : '左側（エレベーターを出て右側）の 女子トイレ側';
        detail = `${r}教室は 3号館 ${fl}階 の ${r}教室 です。エスカレーターを出て${sideGuide} にあります。ゴミ箱は各階に設置されています。`;
      } else if (['122', '123', '124'].includes(r)) {
        shortLabel = `1号館${r}(左側)`;
        detail = `1号館${r}教室は 1号館 2階 です。階段を登って左側（奥に女子トイレ）にあります。ゴミ箱は各階に設置されています。`;
      } else if (['125', '126', '127A', '127B'].includes(r)) {
        shortLabel = `1号館${r}(右側)`;
        detail = `1号館${r}教室は 1号館 2階 です。階段を登って右側（手前に男子トイレ、奥に女子トイレ）にあります。ゴミ箱は各階に設置されています。`;
      } else if (r === '130') {
        shortLabel = '1号館130(正面)';
        detail = '1号館130教室は 1号館 3階 です。階段を登って正面にあります（左奥に男子トイレ、右奥に女子トイレ）。ゴミ箱は各階に設置されています。';
      } else if (['131', '132', '133', '134', '138'].includes(r)) {
        shortLabel = `1号館${r}(左側)`;
        detail = `1号館${r}教室は 1号館 3階 です。階段を登って左側（奥に男子トイレ）にあります。ゴミ箱は各階に設置されています。`;
      } else if (['135', '136', '137A', '137B', '139'].includes(r)) {
        shortLabel = `1号館${r}(右側)`;
        detail = `1号館${r}教室は 1号館 3階 です。階段を登って右側（奥に女子トイレ）にあります。ゴミ箱は各階に設置されています。`;
      } else if (r === '141') {
        shortLabel = '1号館141(4F)';
        detail = '1号館141教室は 1号館 4階 です。階段を登って正面にあります。※注意：1号館の4階・5階にはトイレがありませんので、2階または3階のトイレをご利用ください。ゴミ箱は各階に設置されています。';
      } else if (r === '151') {
        shortLabel = '1号館151(5F)';
        detail = '1号館151教室は 1号館 5階 です。階段を登って正面にあります。※注意：1号館の4階・5階にはトイレがありませんので、2階または3階のトイレをご利用ください。ゴミ箱は各階に設置されています。';
      } else if (r.startsWith('2') && r.length === 4) {
        shortLabel = `2号館${r}`;
        detail = `${r}教室は 2号館 ${r[1]}階 の ${r}教室 です。※注意：2号館内には自動販売機およびゴミ箱は設置されていませんので他号館をご利用ください。`;
      } else {
        shortLabel = r.slice(0, 12);
        detail = `${r}教室はキャンパス構内にあります。詳細は各号館のフロア案内板をご確認ください。`;
      }

      return `表示用：${shortLabel}\n詳細案内：${detail}`;
    }
  }

  // 2. 施設営業時間案内
  if (['図書館', '図書室', '本を借りる', '地下書庫'].some((k) => qLower.includes(k))) {
    return (
      '【日本大学文理学部図書館（図書館棟）営業時間】\n' +
      '・月〜金（平日）：09:00 - 20:00\n' +
      '・土曜日：09:00 - 19:00\n' +
      '・日曜・祝日：休館（授業実施日を除く）\n' +
      '※地下書庫への入庫および貸出手続きは閉館30分前までです。'
    );
  }

  if (['コンピュータセンター', 'コンセ', 'cc', 'wifi', 'wi-fi', '学内pc', 'パソコン室'].some((k) => qLower.includes(k))) {
    return (
      '【コンピュータセンター受付（3号館）営業時間】\n' +
      '・月〜金（平日）：09:00 - 18:00\n' +
      '・土曜日：09:00 - 13:00\n' +
      '・日曜・祝日：休業\n' +
      '※アカウント発行や学内Wi-Fi（CHS-Wi-Fi）の問い合わせ・トラブル対応を行っています。'
    );
  }

  if (['ラーニングコモンズ', 'ラーニング・コモンズ', 'コモンズ', 'lc'].some((k) => qLower.includes(k))) {
    return (
      '【ラーニング・コモンズ（本館1階）営業時間】\n' +
      '・月〜金（平日）：08:00 - 18:00（サポートデスク対応 10:00 - 18:00）\n' +
      '・土曜日：08:00 - 17:00（サポートデスク対応 09:00 - 13:00）\n' +
      '・日曜・祝日：休館\n' +
      '※グループ学習や自習、PC利用、プレゼン準備に利用できます。'
    );
  }

  if (['教務', '教務課', '事務', '事務窓口', '証明書', '学務'].some((k) => qLower.includes(k))) {
    return (
      '【事務窓口・教務課等（本館1階事務室）受付時間】\n' +
      '・月〜金（平日）：09:00 - 17:00\n' +
      '・土曜日：09:00 - 13:00\n' +
      '・日曜・祝日：休み\n' +
      '※履修相談や各種届出を受付。証明書自動発行機は閉口15分前まで利用可能です。'
    );
  }

  if (['資料館', '博物館'].some((k) => qLower.includes(k))) {
    return (
      '【日本大学文理学部資料館（8号館）開館時間】\n' +
      '・月〜金（平日）：10:00 - 17:00\n' +
      '・土曜日：10:00 - 13:00\n' +
      '・日曜・祝日：休館（入館無料）\n' +
      '※考古・歴史・民俗・学術資料等の展示を行っています。'
    );
  }

  // 3. 履修・卒業ナビ ＆ 6コース科目案内
  if (['教職', '教員免許'].some((k) => qLower.includes(k))) {
    return (
      '【教職コース（全学科共通）】\n' +
      '・概要: 中学校・高等学校教諭一種免許状（全学科共通）や特別支援学校教諭免許状（教育学科のみ）の取得を目指すコースです。\n' +
      '・申請・相談窓口: **教職センター**（本館）\n' +
      '※コース科目の修得単位は卒業要件の「自由選択区分」に算入可能です。'
    );
  }

  if (qLower.includes('司書教諭')) {
    return (
      '【司書教諭コース（全学科共通）】\n' +
      '・概要: 小・中・高等学校の学校図書館で専門的業務を担当する司書教諭資格の取得を目指すコースです。\n' +
      '・申請・相談窓口: **教職センター**（本館）\n' +
      '※教員免許状の取得が前提条件となります。'
    );
  }

  if (qLower.includes('司書')) {
    return (
      '【司書コース（全学科共通）】\n' +
      '・概要: 都道府県や市区町村の公共図書館等で専門職として勤務する司書資格を取得するコースです。\n' +
      '・申請・相談窓口: **教務課**（本館1階）\n' +
      '※修得単位は卒業要件の「自由選択区分」に算入可能です。'
    );
  }

  if (qLower.includes('学芸員')) {
    return (
      '【学芸員コース（全学科共通）】\n' +
      '・概要: 博物館・美術館・資料館等で資料の収集・保管・展示・調査研究を行う専門職資格を取得するコースです。\n' +
      '・申請・相談窓口: **教務課**（本館1階）\n' +
      '※3・4年次に資料館実習等があります。'
    );
  }

  if (['社会教育主事', '社会教育士'].some((k) => qLower.includes(k))) {
    return (
      '【社会教育主事コース（全学科共通）】\n' +
      '・概要: 地域社会の教育・生涯学習振興を支援する専門職（社会教育士）に必要な資格を取得するコースです。\n' +
      '・申請・相談窓口: **教務課**（本館1階）'
    );
  }

  if (['日本語教育', '日本語教員'].some((k) => qLower.includes(k))) {
    return (
      '【日本語教育コース（全学科共通）】\n' +
      '・概要: 国内外で外国人留学生や学習者に日本語を教える日本語教員としての専門知識と指導法を修得するコースです。\n' +
      '・申請・相談窓口: **教務課**（本館1階）'
    );
  }

  if (['卒業', '単位数', '卒業要件', '何単位'].some((k) => qLower.includes(k))) {
    return checkRequirementsLocally(userProfile);
  }

  // 4. 自販機・商品・設備
  if (['給水', '冷水機', 'ウォーターサーバー'].some((k) => qLower.includes(k))) {
    return (
      '【構内 給水所（冷水機）のご案内】\n' +
      '・**4号館 1階 エントランスホールのみ使用可能**！マイボトルへの給水が可能です。\n' +
      '⚠️ 注意: 4号館の2階・3階・4階の給水所は現在使用不可となっています。1階をご利用ください。'
    );
  }

  if (['ゴミ箱', 'ごみ箱', 'ゴミ', 'ごみ'].some((k) => qLower.includes(k))) {
    return (
      '【ゴミ箱の設置場所】\n' +
      '・**1号館**：各階に設置\n' +
      '・**3号館**：各階に設置\n' +
      '・**4号館**：各階トイレ前に設置\n' +
      '⚠️ 注意: **2号館内にはゴミ箱および自動販売機は設置されていません**。他号館をご利用ください。'
    );
  }

  if (['トイレ', 'お手洗い', '化粧室'].some((k) => qLower.includes(k))) {
    return (
      '【トイレ位置関係ガイド】\n' +
      '■ **1号館**:\n' +
      '・1階: 正面入って左手前＝女子、左奥＝男子、右手前奥＝男子\n' +
      '・2階: 左奥＝女子、右手前＝男子、右奥＝女子\n' +
      '・3階: 左奥＝男子、右奥＝女子\n' +
      '⚠️ **4階・5階にはトイレがありません**（2階または3階をご利用ください）\n\n' +
      '■ **3号館（全階共通）**:\n' +
      '・下2桁 `01〜05`: **男子トイレ側**（エスカレーター出て右 / エレベーター出て左）\n' +
      '・下2桁 `06〜10`: **女子トイレ側**（エスカレーター出て左 / エレベーター出て右）\n\n' +
      '■ **4号館**:\n' +
      '・1階: 左側＝男子、右側＝女子\n' +
      '・2階: 左側＝男子、右側＝女子\n' +
      '・3階: 右側＝男子、左側＝女子\n' +
      '・4階: 右側（手前442/奥441）＝男子側、左側（手前443/奥444）＝女子側'
    );
  }

  if (['クレカ', 'クレジットカード', 'タッチ決済', 'コンタクトレス'].some((k) => qLower.includes(k))) {
    return (
      '【クレジットカード（タッチ決済）が使える自販機】\n' +
      '・**場所**: 3号館 1階（食堂側・コカ・コーラ赤自販機）\n' +
      '・**対応カード**: Visa、Mastercard 等のクレジットカードタッチ決済に対応しています！\n' +
      '※サントリー自販機は物理カード直タッチ不可ですが、ジハンピ連携のPayPay等で決済可能です。'
    );
  }

  if (['コーラ', 'ペプシ', 'coca', 'pepsi'].some((k) => qLower.includes(k))) {
    return (
      '【コーラ自販機情報】\n' +
      '■ **コカ・コーラ（140円）**:\n' +
      '・場所: 3号館 1階（食堂側・コカ・コーラ赤自販機）\n' +
      '・決済: クレジットカードタッチ決済〇、Coke ON、PayPay、交通系IC\n\n' +
      '■ **ペプシコーラ生（100円）**:\n' +
      '・場所: 3号館 1階（食堂側・サントリー青自販機）\n' +
      '・決済: ジハンピ（PayPay、交通系IC）'
    );
  }

  if (['レッドブル', 'redbull', 'zone', 'モンスター', 'エナジー'].some((k) => qLower.includes(k))) {
    return (
      '【エナジードリンク一覧】\n' +
      '■ **ZONe スカッと透明 / NOPE（80円）**：※学内激安！\n' +
      '  ・4号館 1階、3号館 1階 青自販機\n' +
      '■ **レッドブル（170円）**：\n' +
      '  ・4号館 1階、3号館 1階 白スポーツ/青自販機\n' +
      '■ **モンスターエナジー各種（180〜190円）**：\n' +
      '  ・3号館 1階 食堂側 白スポーツ自販機'
    );
  }

  if (q.includes('80円') || ['水', '天然水', 'ミネラルウォーター'].some((k) => qLower.includes(k))) {
    return (
      '【サントリー天然水（80円）/ ZONe（80円）】\n' +
      '・**場所**: 4号館 1階自販機、3号館 1階食堂側（白水メイン自販機、青自販機）\n' +
      '・**決済**: ジハンピ（PayPay、モバイル交通系IC、現金）\n' +
      '※学内最安値の80円ドリンクです！'
    );
  }

  // 汎用案内
  return (
    `【EneKoma AIアシスタント】\n` +
    `教室番号（3306、421）、自販機（コーラ、80円、クレカ）、営業時間（図書館、コンセ、教務課）、不足講義チェック、目標GPAシミュレーションについて自由に入力してください。\n\n` +
    `質問例:\n` +
    `• 「3306」または「421はどこ？」\n` +
    `• 「目標GPA3.0にするにはどうすればいい？」\n` +
    `• 「単位足りてる？不足講義を教えて」\n` +
    `• 「図書館の営業時間」\n` +
    `• 「コーラ買いたい」`
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = (body.query || '').trim();
    const apiKey = (body.apiKey || process.env.GEMINI_API_KEY || '').trim();
    const history = body.history || [];
    const image = body.image || null; // { mimeType: string, data: string } (base64)
    const userProfile = body.userProfile || null;

    if (!query && !image) {
      return NextResponse.json({ reply: '質問内容または画像を入力してください。' }, { status: 400 });
    }

    // Google Gemini API呼び出し（APIキー設定時）
    if (apiKey) {
      try {
        const contents: any[] = [];

        // 過去履歴
        for (const h of history) {
          contents.push({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          });
        }

        // ユーザープロフィールのコンテキストプロンプト
        let userPromptText = query;
        if (!userPromptText && image) {
          userPromptText = '添付された成績表画像をマルチモーダル解析し、修得済み科目名・単位数・各科目の評価（S〜F）・現在GPA・総修得単位数を読み取り、要約とプロフィール更新ブロックを出力してください。';
        }

        const profileContext = userProfile
          ? `【現在のユーザープロフィール情報】\n` +
            `・所属学科: ${userProfile.department || '未設定'}\n` +
            `・学年: ${userProfile.grade || 1}年\n` +
            `・現在のGPA: ${userProfile.currentGpa ?? 2.40}\n` +
            `・目標GPA: ${userProfile.targetGpa ?? 3.00}\n` +
            `・修得済み総単位数: ${userProfile.currentCredits ?? 40}単位\n` +
            `・今期履修中単位数: ${userProfile.semesterCredits ?? 16}単位\n` +
            `・選択コース: ${(userProfile.selectedCourses || []).join(', ') || '未選択'}\n` +
            `・選択副専攻: ${(userProfile.selectedMinors || []).join(', ') || '未選択'}\n\n`
          : '';

        const currentTurnParts: any[] = [
          { text: `${profileContext}${userPromptText}` }
        ];

        // 画像添付がある場合は inline_data として追加
        if (image && image.data) {
          const cleanBase64 = image.data.replace(/^data:[^;]+;base64,/, '');
          currentTurnParts.push({
            inline_data: {
              mime_type: image.mimeType || 'image/jpeg',
              data: cleanBase64
            }
          });
        }

        contents.push({
          role: 'user',
          parts: currentTurnParts
        });

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: SYSTEM_PROMPT.trim() }]
            },
            contents,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1600
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            // プロフィール更新ブロックの検出
            let profileUpdate = null;
            const updateMatch = candidateText.match(/```profile_update\s*([\s\S]*?)\s*```/);
            if (updateMatch) {
              try {
                profileUpdate = JSON.parse(updateMatch[1]);
              } catch (e) {
                // ignore
              }
            }

            return NextResponse.json({
              reply: candidateText,
              source: 'gemini',
              profileUpdate
            });
          }
        } else {
          console.warn('Gemini API call failed with status:', res.status);
        }
      } catch (err) {
        console.warn('Gemini API call error:', err);
      }
    }

    // ローカルエンジンによる即時フォールバック
    const localReply = answerLocally(query || (image ? '成績表画像' : ''), userProfile);
    return NextResponse.json({
      reply: localReply,
      source: 'local'
    });
  } catch (error) {
    return NextResponse.json({
      reply: 'エラーが発生しました。もう一度入力してください。'
    }, { status: 500 });
  }
}
