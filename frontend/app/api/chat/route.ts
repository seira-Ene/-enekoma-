import { NextRequest, NextResponse } from 'next/server';
import {
  GAKUBU_YORAN_DEPARTMENTS,
  GAKUBU_YORAN_CAP_RULES,
  GAKUBU_YORAN_GPA_RULES,
  GAKUBU_YORAN_COURSES,
  GAKUBU_YORAN_ALL_24_MINORS,
  analyzeAcademicDeficiency,
  simulateGpaEngine,
  UserProfileData
} from '@/app/data/gakubuYoran';
import {
  findFreeRooms,
  checkCourseConflicts,
  suggestCoursesForFreePeriod,
  proposeAutomaticSchedule,
  calculateTransitOptimization,
  getRoomDailySchedule,
  getLectureDatabase,
  getCompactRoomLabel
} from '@/app/data/courses';
import { parseProfileUpdateFromText } from '@/app/data/studentAccounts';

const SYSTEM_PROMPT = `
# 公式ナレッジベース：日本大学文理学部『学部要覧（令和7年度/2025年度）』完全準拠

## 役割と公式行動原則（厳格順守）
あなたは日本大学文理学部（CHS）公式ナレッジベース『学部要覧（令和7年度）』に完全準拠した総合キャンパスAIアシスタント「EneKoma（エネコマ）」です。
1つのチャットボックスを通して、学生からの問い合わせに対し、以下の【公式動作ルール】および【学部要覧公式ナレッジベース】に基づいて回答してください。

---

## 【重要動作ルール】
1. **要覧準拠の回答義務**
   今後、履修・単位・卒業要件・学科科目ルールに関する質問を受けた場合は、**必ずこの添付要覧の記述に基づいて回答**してください。
2. **推測・一般知識による助言の禁止**
   要覧に記載がない一般的な大学の知識や推測・あいまいな記憶で履修アドバイスを絶対にしないでください。
3. **該当ページ・項目の優先参照・引用**
   学科ごとの必修科目や選択必修、単位上限ルール、先修条件判定時は、添付要覧の該当ページ（例：『学部要覧』p.31、p.35、p.39等）・該当項目を優先参照し、根拠ページ番号を明記して回答してください。
4. **言い回しの柔軟な意図解釈（API活用）**
   「図書室あいてる？」「421ってどこ」「単位足りてる？」「目標GPA3.0にするにはどうすればいい？」「この成績表読んで」など、どのような言い回しやファイル添付で入力されても、ユーザーの意図を正しく汲み取って回答してください。
5. **画像（時間割表・成績通知書）のマルチモーダルOCR解析と自動プロフィール反映**
   ユーザーが時間割表や成績表の画像をアップロードした場合、画像の種別（今期の時間割表・過去の時間割表・成績通知書）を自動判別し（またはユーザーからの指示に従い）、以下を実行してください：
   * **【種別A：今期の時間割表】（受講中の時間割を登録する場合）**：
     - 画像から曜日・時限・科目名・教室・担当教員・単位数をOCR読み取り。
     - 「今期履修中」として登録し、今期履修単位数合計（各科目原則2単位、実習・演習1単位等）を算出。
     - 出力末尾に以下の更新JSONを埋め込んでください：
     \`\`\`profile_update
     {
       "action": "enroll_current_timetable",
       "semesterCredits": 16,
       "enrolledCourses": [
         { "name": "科目名A", "day": "月", "period": 2, "room": "3306", "credits": 2 },
         { "name": "科目名B", "day": "火", "period": 3, "room": "421", "credits": 2 }
       ]
     }
     \`\`\`
   * **【種別B：過去の時間割表】（前学期・過年度の履修済み科目を追加する場合）**：
     - 過去の時間割画像またはファイル（PDF/CSV/文書等）から科目名・単位数を読み取り。
     - ※時間割表には成績評価（S/A/B/C等）は記載されていないため、勝手に成績を推測・捏造せず、評価は「修得」または「-」として「修得済み科目」に登録してください（GPAを不当に歪めないため）。
     - 出力末尾に以下の更新JSONを埋め込んでください：
     \`\`\`profile_update
     {
       "action": "add_completed_timetable",
       "totalEarnedCredits": 56,
       "addCompletedCourses": [
         { "name": "自主創造の基礎", "credits": 2, "grade": "修得" },
         { "name": "情報リテラシー", "credits": 2, "grade": "修得" }
       ]
     }
     \`\`\`
   * **【種別C：成績通知書・成績表】（成績やGPAを反映する場合）**：
     - 履修済み科目名、修得単位数、各科目の評価（S〜F）、現在GPA、総修得単位数を読み取り要約を出力。
     - 出力末尾に以下の更新JSONを埋め込んでください：
     \`\`\`profile_update
     {
       "action": "transcript",
       "totalEarnedCredits": 42,
       "currentGpa": 2.85,
       "completedCourses": [
         { "name": "基礎プログラミング", "credits": 2, "grade": "S" },
         { "name": "線形代数1", "credits": 2, "grade": "A" }
       ]
     }
     \`\`\`
6. **単位・講義不足判定の優先順位（厳格）**
   不足講義や必要単位数を分析・回答する際は、以下の優先順位に従って判定してください：
   * **優先度 1（最優先）**：所属学科の**必修科目**（および選択必修科目）の未履修チェック
   * **優先度 2**：選択している**コース**（複数選択可）および**副専攻**（複数選択可）の到達要件・不足講義チェック *(※選択がある場合のみ判定)*
   * **優先度 3**：卒業に必要なその他単位（自由選択区分等・計124単位基準）の不足算出
   * **出力フォーマット**：
   > **【履修達成状況・不足講義案内】**
   > **1. 学科必修科目（最優先）**：
   > * ［未修得の必修科目名］（〇単位 / 〇年配当）がまだ残っています（『学部要覧』p.〇〇）。優先して履修登録してください。
   > 
   > **2. 選択コース・副専攻要件**：
   > * **［コース名］**：あと〇単位（［推奨科目名］など）が必要です（『学部要覧』p.〇〇）。
   > * **［副専攻名］**：要件達成まであと〇単位です（『学部要覧』p.〇〇）。
   > 
   > **3. 卒業単位合計**：
   > * 卒業要件（全学科共通124単位・『学部要覧』p.31）まで、あと〇〇単位です。
7. **GPA達成シミュレーション（S〜F評価判定）**
   『学部要覧』p.38-39の計算式 \`(4×S + 3×A + 2×B + 1×C) / 総履修単位(D,E含む)\` に基づき、目標GPA到達に必要な今期の評価目安（パターンA: 科目数、パターンB: 平均ポイント）を算出提示してください。
8. **4桁教室番号の正確な保持（省略厳禁）**
   「3306」「3505」等の4桁教室番号は、数字を省略せず必ず「3号館 3306教室」と入力通りの番号で表記してください。
9. **表示領域での文字途切れ防止**
   構内ナビの回答では「表示用：[12文字以内ラベル]」と「詳細案内：[詳細メッセージ]」を分けて出力してください。
10. **入学年度・カリキュラム体系の区別（令和7年度以降 vs 令和6年度以前）**
   ユーザープロフィールの「入学年度（admissionYear）」設定（令和7年度以降／令和6年度以前）に基づき、該当する時間割データベースおよび要覧規則を参照して回答してください。
11. **指定日時（曜日・時限・時間帯）および現在の空き教室・自習スポット検索**
   学生から「月曜2限の空き教室は？」「火曜14時空いてる教室」「金曜4限どこ空いてる？」「3号館の空き教室」などの問い合わせを受けた場合、指定された曜日および時限（または時刻から該当する時限を自動換算：1限 09:00〜10:30, 2限 10:40〜12:10, 昼休み 12:10〜13:00, 3限 13:00〜14:30, 4限 14:40〜16:10, 5限 16:20〜17:50）の時間割データに基づき、授業が開講されていない空き講義室を号館別（3号館、4号館、1号館、2号館）に整理して分かりやすく提示してください。指定がない場合は現在日時の空き教室を提示してください。昼休み（12:10〜13:00）の場合は全教室が開放される利用マナー（飲食ゴミ持ち帰り、次限受講生への席譲り）も案内してください。
12. **履修登録サポート＆「空きコマ」活用提案**
   学生が挙げた科目同士の時間割重複（バッティング）を即座に検出し警告してください。また「火曜3限が空いているから埋めたい」等の要望に対し、該当コマに開講される総合教育科目・外国語・基礎科目を提案してください。
13. **必修組み込み済みの自動スケジュール提案**
   所属学科の配当年次必修科目を時間割にまず配置し、時間の重ならない空きスロットに教養科目（総合教育科目など）を組み込んだ最適な時間割パターンを自動生成してください。
14. **キャンパス移動・10分休みの最適化ナビ**
   「3号館から1号館へ10分で移動できる？」等の問い合わせに対し、移動実現性（所要時間目安、階段とエレベーターの使い分け、混雑回避ルート）を判定案内してください。目的地の教室が前のコマで空き教室であれば早めに入室して自習できることも案内してください。
15. **科目・教員・教室の逆引き検索**
   「〇〇先生の授業はいつ？」「421教室は何限に使われている？」などの逆引き質問に、曜日・時限・教室・対象学年を即答してください。

---

## 【『学部要覧（令和7年度）』公式カリキュラム要約】

### 1. 卒業に必要な最低単位数（全学科共通 124単位・要覧 p.31）
全学科共通で以下の6区分から124単位を修得します：
1. **全学共通教育科目**（2単位必修・要覧 p.31）：
   「自主創造の基礎」（2単位・1年次必修）。所属学科で開講されているものを履修。
2. **総合教育科目**（12単位必修・要覧 p.31-32, p.40-43）：
   人文系2単位、社会系2単位、理学系2単位をそれぞれ含む必要あり。12単位を超えて修得した単位のうち28単位（合計40単位）までは「自由選択区分」に算入可能（40単位を超えた分は卒業単位に算入不可）。
3. **外国語教育科目**（要覧 p.31, p.44-63）：
   ・中国語中国文化学科：中国語1〜14（14単位必修）＋ 選択外国語4単位＝計18単位
   ・英文学科：英語1〜12（12単位必修）＋ 選択外国語4単位＝計16単位
   ・ドイツ文学科：ドイツ語1〜12（12単位必修）＋ 選択外国語4単位＝計16単位
   ・その他15学科：一言語のみ8単位 または 二言語（各言語4単位以上）計8単位
4. **基礎教育科目**（5単位・要覧 p.32, p.64-67）：
   ・健康・スポーツ教育科目：健康・スポーツ教育論（2単位）＋ 健康・スポーツ教育実習1（1単位）＝計3単位必修
   ・コンピュータ科目：「情報リテラシー」（2単位）必修。「データ処理基礎」（2単位）及び「ビッグデータサイエンス」（2単位）は必履修。
5. **学科専門科目**（全18学科・要覧 p.31, p.68-139）：
   哲(68), 史(66), 国文(60), 中(58), 英(62), 独(60), 社(70), 社福(63), 教(56), 体(64), 心(66), 地理(74), 地球(73), 数(65), 情報(60), 物(78), 生(77), 化(76)
6. **自由選択区分**（要覧 p.32）：
   ①〜⑤の超過単位、他学科専門科目、コース科目（一部実習除く）を算入。

### 2. 履修登録単位数の上限（CAP制・要覧 p.35-36）
・原則：年間 40単位を上限とする（履修登録できる単位数であり修得単位数ではない）。
・40単位上限に含まれない科目：
  中国語(逆)再履修、休暇中集中授業、海外語学研修、海外文化交流、コース科目（司書教諭、司書、学芸員、社会教育主事、教職指定科目）、教職履修上の他学科開講専門科目、学科一覧でアンダーラインと＊が付いた科目。
・上限加算の特別措置（要覧 p.36）：
  - 1年前期16単位以上修得＋GPA 2.5以上：後期4単位加算（年間44単位）
  - 前年20単位以上修得＋GPA 3.0以上：年間8単位加算（年間48単位）
  - 前年20単位以上修得＋GPA 2.5以上：年間6単位加算（年間46単位）
  - 前年20単位以上修得＋GPA 2.0以上：年間4単位加算（年間44単位）
  - 再履修科目：年間上限10単位まで加算

### 3. 成績評価とGPA計算（要覧 p.38-39）
・S (100〜90点, 係数4.0) / A (89〜80点, 係数3.0) / B (79〜70点, 係数2.0) / C (69〜60点, 係数1.0) / D (59点以下, 係数0.0, 不合格) / E (成績不提示, 係数0.0, 不合格) / P (履修中止, GPA除外) / N (認定, GPA除外)
・計算式：(4×S + 3×A + 2×B + 1×C) / 総履修単位(D,E含む)。小数第3位四捨五入。
・再履修時は最後の履修による成績・単位数のみを累積GPAに算入。

### 4. コース科目（全6コース・要覧 p.140-177）
・教職コース（教職センター / p.140-163）
・司書教諭コース（教職センター / 必修10単位 / p.164）
・司書コース（教務課 / 必修22単位＋選択必修4単位＝26単位 / p.165）
・学芸員コース（教務課 / 必修22単位＋選択16単位＝38単位 / p.166-167）
・社会教育主事コース（教務課 / 必修17単位＋選択必修8単位＝25単位 / p.168-169）
・日本語教育コース（教務課 / 必修11単位＋選択必修2単位含む計26単位 / p.170-171）

### 5. 副専攻（全24種・要覧 p.180-192）
指定科目16単位以上修得で修了証書。所属学科と同一の学科副専攻は修了認定不可。理系学科生は科学リテラシー副専攻不可。

---

## 【校舎・教室配置ナレッジベース】
### 1. 4号館
- 1階: 411教室（正面入って左側・男子トイレ側 / 給水所［冷水機］あり / トイレ前ゴミ箱あり）、412教室（正面入って右側・女子トイレ側 / 給水所［冷水機］あり / トイレ前ゴミ箱あり）
- 2階: 421教室（階段登って左側・男子トイレ側 / トイレ前ゴミ箱あり ※給水所は1階のみ）、422教室（階段登って右側・女子トイレ側 / トイレ前ゴミ箱あり ※給水所は1階のみ）
- 3階: 431教室（階段登って右側・男子トイレ側 / トイレ前ゴミ箱あり ※給水所は1階のみ）、432教室（階段登って左側・女子トイレ側 / トイレ前ゴミ箱あり ※給水所は1階のみ）
- 4階: 441教室（階段登って右側奥・男子側奥）、442教室（階段登って右側手前・男子側手前）、443教室（階段登って左側手前・女子側手前）、444教室（階段登って左側奥・女子側奥）。トイレ前ゴミ箱あり。※給水所は1階のみ。

### 2. 3号館
- 1階〜5階: 4桁教室番号（例: 3101〜3510）。「3306」「3505」等の数字は省略厳禁。
- フロア配置: 下2桁が01〜05はエスカレーターを出て右側（エレベーター出て左側・男子トイレ側）。下2桁が06〜10はエスカレーターを出て左側（エレベーター出て右側・女子トイレ側）。
- ゴミ箱: 各階に設置。
- 注意点: 上層階（4F/5F）は10分休みにエレベーター前に長い列ができるため、エスカレーターまたは中央階段の利用を推奨。

### 3. 1号館
- 2階: 122〜124教室（階段登って左側・奥に女子トイレ）、125〜127B教室（階段登って右側・手前に男子トイレ/奥に女子トイレ）。各階ゴミ箱あり。
- 3階: 130教室（階段正面・左奥男子/右奥女子）、131〜134/138教室（階段登って左側・奥に男子トイレ）、135〜137B/139教室（階段登って右側・奥に女子トイレ）。各階ゴミ箱あり。
- 4階・5階: 141教室（4階正面）、151教室（5階正面）。※重要注意：1号館の4階・5階にはトイレが設置されていません。2階または3階のトイレをご利用ください。

### 4. 2号館
- 2201〜2402教室。※重要注意：2号館内には自動販売機およびゴミ箱は設置されていません。他号館の設備をご利用ください。

---

## 【学内自動販売機・商品・価格・決済アプリ完全ナレッジベース】
### 1. 4号館 1階（給水所横・サントリー自販機）
- アプリ: ジハンピ
- 決済方法: PayPay〇、交通系IC（モバイル）〇、現金〇（※物理交通系IC直接タッチ×、クレカ直タッチ×）
- 主な商品・価格:
  - サントリー天然水 550ml: 80円（学内最安値！）
  - ZONe スカッと透明: 80円（激安エナジードリンク！）
  - GREEN DA・KA・RA やさしい麦茶 600ml: 90円
  - レッドブル（Red Bull）: 170円（コンビニよりお得！）
  - 伊右衛門 特茶/焙じ茶: 100〜110円
  - プレミアムボス 微糖: 130円

### 2. 3号館 1階（食堂側・自販機コーナー計4台）
- ①サントリー白（水メイン）/ アプリ: ジハンピ
  - サントリー天然水: 80円（学内最安値！）
  - GREEN DA・KA・RA やさしい麦茶: 90円
  - ぷるぷるプリン缶: 100円（大人気デザート飲料！）
  - 伊右衛門 特茶/焙じ茶: 100〜110円
  - リプトン 白の贅沢ミルクティー: 110円
  - BOSS各種（ブラック・アイスコーヒー等）: 90〜140円
- ②サントリー白（スポーツ/エナジー系）/ アプリ: ジハンピ
  - レモン強炭酸水: 90円
  - やさしい麦茶: 90円
  - ぷるぷるプリン缶: 100円
  - レッドブル: 170円（格安！）
  - モンスターエナジー（白・青等）: 180〜190円
- ③サントリー青 / アプリ: ジハンピ
  - ペプシコーラ生 600ml: 100円（炭酸最安！）
  - ZONe NOPE: 80円
  - レッドブル: 170円
  - BOSS 贅沢微糖: 90円
  - リプトン レモンティー: 110円
- ④コカ・コーラ赤 / アプリ: Coke ON（Coke ON Pay）
  - ★決済特徴: クレジットカードタッチ決済（Visa / Mastercard）対応！ PayPay〇、モバイル交通系IC〇、現金〇
  - コカ・コーラ 500ml: 140円
  - い・ろ・は・す: 100〜110円
  - 綾鷹 / やかんの麦茶: 110円
  - ジョージア 各種: 90〜110円
  - 紅茶花伝 ミルクティー / アロエ＆白ぶどう: 110円
  - ファンタ グレープ / ドクターペッパー: 120円
  - アクエリアス 500ml: 130円

---

## 【キャンパス施設 営業時間完全ナレッジベース】
- **日本大学文理学部図書館（図書館棟）**:
  - 月〜金（平日）: 09:00 - 20:00
  - 土曜日: 09:00 - 19:00
  - 日曜・祝日: 休館（授業実施日を除く）
  - ※地下書庫への入庫および図書貸出手続きは閉館30分前まで。
- **コンピュータセンター受付（3号館）**:
  - 月〜金（平日）: 09:00 - 18:00
  - 土曜日: 09:00 - 13:00
  - 日曜・祝日: 休業
  - ※学内Wi-Fi（CHS-Wi-Fi）設定・トラブル対応、PCアカウント発行窓口。
- **ラーニング・コモンズ（本館1階）**:
  - 月〜金（平日）: 08:00 - 18:00（サポートデスク対応 10:00 - 18:00）
  - 土曜日: 08:00 - 17:00（サポートデスク対応 09:00 - 13:00）
  - 日曜・祝日: 休館
  - ※グループ学習、自習、プレゼン準備、PC利用可能。
- **教務課窓口（本館1階）**:
  - 月〜金（平日）: 09:00 - 17:00
  - 土曜日: 09:00 - 13:00
  - 日曜・祝日: 窓口休業
  - ※履修登録相談、資格コース届出（司書・学芸員・社会教育主事）、副専攻申請、単位照会など。
- **資料館**:
  - 月〜金（平日）: 10:00 - 17:00
  - 土曜日: 10:00 - 13:00
`;

// ローカルGPAシミュレーション計算（要覧 p.38-39準拠）
function simulateGpaLocally(currentGpa: number, targetGpa: number, earnedCredits: number, semesterCredits: number): string {
  const result = simulateGpaEngine(earnedCredits, currentGpa, targetGpa, semesterCredits);
  const lines: string[] = [
    `**【目標GPA達成シミュレーション（『学部要覧』p.38-39準拠）】**`,
    `* **現在GPA**：${currentGpa.toFixed(2)} ➔ **目標GPA**：${targetGpa.toFixed(2)}`,
    `* **今期履修中**：${result.semesterCredits}単位（約${result.courseCount}科目）`,
    ``
  ];

  if (!result.isAchievable) {
    lines.push(`⚠️ **【判定：今期単独での到達は数理的に不可能】**`);
    lines.push(result.explanation);
  } else {
    lines.push(`**【達成に必要な評価目安】**`);
    lines.push(result.explanation);
    lines.push(``);
    lines.push(`* **パターンA（科目別評価）**：今期${result.courseCount}科目のうち、**S評価を ${result.patternA.sCourses}科目（${result.patternA.sCredits}単位）**、**A評価を ${result.patternA.aCourses}科目（${result.patternA.aCredits}単位）** 以上修得（B評価以下は不可）。`);
    lines.push(`* **パターンB（全体平均）**：今期全科目で ${result.patternB.avgPointText}（判定：**${result.patternB.difficulty}**）が必要です。`);
    lines.push(``);
    lines.push(`※『学部要覧』p.38-39の計算式 \`(4×S + 3×A + 2×B + 1×C) / 総履修単位(D,E含む)\` に基づき算出しています。再履修科目は最新成績のみ累積GPAに算入されます。`);
  }

  return lines.join('\n');
}

// ローカル履修・不足判定（要覧 p.31-36, 各学科ページ準拠）
function checkRequirementsLocally(profile: UserProfileData): string {
  const analysis = analyzeAcademicDeficiency(profile || ({} as UserProfileData));
  const deptData = GAKUBU_YORAN_DEPARTMENTS[analysis.department] || GAKUBU_YORAN_DEPARTMENTS['情報科学科'];

  const lines: string[] = [
    `**【履修達成状況・不足講義案内（『学部要覧』公式準拠）】**`,
    `🎓 **対象学科**: **${analysis.department}**（${analysis.grade}年次 / 要覧 p.${analysis.deptPage}）`,
    ``,
    `**1. 学科必修科目・先修条件（最優先・要覧 p.${analysis.deptPage}）**：`
  ];

  if (analysis.missingMajorReqs.length > 0) {
    lines.push(`* 以下の必修科目が未修得です。次期優先して履修登録してください：`);
    analysis.missingMajorReqs.forEach((req) => {
      lines.push(`  - **${req.name}**（${req.credits}単位 / ${req.year}年配当${req.semester ? `・${req.semester}` : ''}）${req.note ? ` ※${req.note}` : ''}`);
    });
  } else {
    lines.push(`* 主要必修科目はすべて修得済みです！`);
  }

  // 進級・着手要件マイルストーン警告
  if (analysis.milestonesStatus.length > 0) {
    lines.push(``);
    lines.push(`* **進級・研究室・卒論着手条件（要覧 p.${analysis.deptPage}）**:`);
    analysis.milestonesStatus.forEach((ms) => {
      const warnIcon = ms.isWarning ? '⚠️ 【警告】' : '・';
      lines.push(`  ${warnIcon}**${ms.timing}**: ${ms.condition} ➔ ${ms.consequence}（要覧 p.${ms.page}）`);
    });
  }

  lines.push(``);
  lines.push(`**2. 選択コース・副専攻要件**：`);
  if (analysis.coursesAnalysis.length > 0 || analysis.minorsAnalysis.length > 0) {
    analysis.coursesAnalysis.forEach((c) => {
      lines.push(`* **［${c.name}］**（要覧 ${c.page} / 窓口：**${c.window}**）：必要単位 **${c.reqCredits}単位**。${c.note}`);
    });
    analysis.minorsAnalysis.forEach((m) => {
      if (m.warning) {
        lines.push(`* **［${m.name}］**：${m.warning}`);
      } else {
        lines.push(`* **［${m.name}］**（要覧 ${m.page}）：修了要件 **16単位以上**。${m.note}`);
      }
    });
  } else {
    lines.push(`* 現在コース・副専攻の登録はありません。（教職・司書・学芸員等の受講には学期始めの届出が必要です・要覧 p.33）`);
  }

  lines.push(``);
  lines.push(`**3. 卒業単位合計（要覧 p.31）**：`);
  lines.push(`* ${analysis.generalFormatted}（修得済: **${analysis.earnedCredits}単位** / 124単位基準）`);
  lines.push(`* 区分別最低修得要件：`);
  lines.push(`  - 全学共通教育: 2単位（自主創造の基礎）`);
  lines.push(`  - 総合教育科目: 12単位（人文2単位、社会2単位、理学2単位を必ず含む・自由選択算入は最大28単位まで）`);
  lines.push(`  - 外国語教育科目: ${deptData.gaikokugoReq}単位（${deptData.gaikokugoDetail}）`);
  lines.push(`  - 基礎教育科目: 5単位（健康スポーツ3単位［論2+実習1］、情報リテラシー2単位、データ処理基礎・ビッグデータサイエンス必履修）`);
  lines.push(`  - 学科専門科目: 専門必修 **${deptData.majorReq}単位**、専門選択 **${deptData.majorOpt}単位**（計 **${deptData.majorTotal}単位**）`);
  lines.push(`  - 自由選択区分: ${deptData.freeOpt}単位（各区分超過単位、他学科専門、コース単位等）`);

  return lines.join('\n');
}

// ローカルエンジン（オフライン・API未設定時の高精度フォールバック）
function answerLocally(query: string, userProfile?: UserProfileData): string {
  const q = query.trim();
  const qLower = q.toLowerCase();

  // 1. CAP制・年間履修上限についての質問
  if (['上限', 'cap', '何単位まで履修', '年間単位', '履修登録上限', '40単位'].some((k) => qLower.includes(k))) {
    const rules = GAKUBU_YORAN_CAP_RULES;
    let res = `**【履修科目登録単位数の上限（CAP制・『学部要覧』p.35-36準拠）】**\n\n`;
    res += `文理学部では、学習効果向上のため**年間履修登録単位数の上限を40単位**と定めています（※修得単位数ではなく履修登録単位数です）。\n\n`;
    res += `■ **40単位の上限に含まれない科目（要覧 p.35）**：\n`;
    rules.exemptions.forEach((e: string) => {
      res += `・${e}\n`;
    });
    res += `\n■ **成績優秀者等に対する上限加算の特別措置（要覧 p.36）**：\n`;
    rules.specialRelief.forEach((r: { condition: string; bonus: string }) => {
      res += `・${r.condition} ➔ **${r.bonus}**\n`;
    });
    return res;
  }

  // 2. GPAシミュレーション要求判定
  if (qLower.includes('gpa') && (qLower.includes('目標') || qLower.includes('シミュレーション') || qLower.includes('届く') || qLower.includes('3.0') || qLower.includes('計算'))) {
    const curGpa = userProfile?.currentGpa ?? 2.40;
    const tgtGpa = userProfile?.targetGpa ?? 3.00;
    const earned = userProfile?.currentCredits ?? 40;
    const sem = userProfile?.semesterCredits ?? 16;
    return simulateGpaLocally(curGpa, tgtGpa, earned, sem);
  }

  // 3. 履修達成状況・不足講義判定
  if (['単位足りてる', '不足', '履修チェック', '要件チェック', 'あと何単位', '卒業要件', '必修'].some((k) => q.includes(k))) {
    return checkRequirementsLocally(userProfile || ({} as UserProfileData));
  }

  // 4. 成績表画像・OCR言及時
  if (['成績表', '通知書', '画像', 'ocr', '読み取'].some((k) => qLower.includes(k))) {
    return (
      `**【成績表データの解析案内（『学部要覧』連携）】**\n\n` +
      `画像の直接解析・自動読み取りには、画面右上の「⚙️ API設定」から無料の **Google Gemini APIキー** をご設定いただくと、マルチモーダルAIが画像内の科目名・修得単位・S〜F評価（要覧 p.38基準）・現在GPAを瞬時に読み取り、プロフィールへ自動反映します！\n\n` +
      `※APIキー未設定でも、画面右上の「👤 プロフィール」から修得単位数やGPA、必修履修状況を手動設定・保存することで、『学部要覧』公式基準に基づいた不足判定やGPAシミュレーションが即座に利用可能です。`
    );
  }

  // 5. 指定日時・時限・現在の空き教室・自習スポット検索
  const isRoomFreeQuery =
    ['空き教室', '空いてる教室', '空いている教室', '自習室', '自習スポット', '自習できる', 'いま空い', '今空い', 'どこ空い', '教室空い', '空き部屋', '空いてる場所', '使える教室'].some((k) => qLower.includes(k)) ||
    (/(月|火|水|木|金|土)曜?[^。、！？\n]*([1-5]限|[1-5]コマ|\d{1,2}時)/.test(qLower));

  if (isRoomFreeQuery) {
    let dayMatch: string | undefined = undefined;
    for (const d of ['月', '火', '水', '木', '金', '土']) {
      if (q.includes(`${d}曜`) || q.includes(`${d}曜日`)) {
        dayMatch = d;
        break;
      }
    }
    if (!dayMatch) {
      const dm = q.match(/(月|火|水|木|金|土)(?=[の\s\d限])/);
      if (dm) dayMatch = dm[1];
    }

    let periodMatch: number | undefined = undefined;
    const pm = q.match(/([1-5])\s*(?:限|コマ)/);
    if (pm) {
      periodMatch = parseInt(pm[1], 10);
    } else {
      const tm = q.match(/(\d{1,2})(?:[:：](\d{2}))?\s*(?:時|分|頃|から)?/);
      if (tm) {
        const h = parseInt(tm[1], 10);
        const m = tm[2] ? parseInt(tm[2], 10) : 0;
        const total = h * 60 + m;
        if (h >= 8 && h <= 19) {
          if (total < 10 * 60 + 35) periodMatch = 1;
          else if (total < 12 * 60 + 10) periodMatch = 2;
          else if (total < 13 * 60) periodMatch = 2; // lunch
          else if (total < 14 * 60 + 35) periodMatch = 3;
          else if (total < 16 * 60 + 15) periodMatch = 4;
          else periodMatch = 5;
        }
      }
    }

    let buildingMatch: string | undefined = undefined;
    const bm = q.match(/([1-4])\s*号館/);
    if (bm) {
      buildingMatch = `${bm[1]}号館`;
    }

    return findFreeRooms(dayMatch, periodMatch, buildingMatch, userProfile?.admissionYear).formattedReport;
  }

  // 6. キャンパス移動・10分休みの最適化ナビ
  if (['移動', '10分休み', '間に合う', 'から', 'ルート', '行き方'].some((k) => qLower.includes(k))) {
    const rooms = q.match(/([1-4]\d{2,3}[a-zA-Z]?)/g);
    if (rooms && rooms.length >= 2) {
      return calculateTransitOptimization(rooms[0], rooms[1]);
    }
  }

  // 7. 教室の利用スケジュール・何限に使われているか
  if (['何限に使われ', '何限', '教室の予定', '教室の利用', '利用状況', '使われてる', '使用スケジュール'].some((k) => qLower.includes(k))) {
    const mRoom = q.match(/([1-4]\d{2,3}[a-zA-Z]?)/);
    if (mRoom) {
      const dayMatch = ['月', '火', '水', '木', '金', '土'].find((d) => q.includes(`${d}曜`) || q.includes(d));
      return getRoomDailySchedule(mRoom[1], dayMatch, userProfile?.admissionYear);
    }
  }

  // 8. 履修登録サポート＆「空きコマ」活用提案
  if (['空きコマ', '空いてるコマ', 'コマを埋め', '埋めたい', 'おすすめの総合', 'コマに入る'].some((k) => qLower.includes(k))) {
    const dayMatch = ['月', '火', '水', '木', '金', '土'].find((d) => q.includes(`${d}曜`) || q.includes(d)) || '火';
    const periodMatch = [1, 2, 3, 4, 5].find((p) => q.includes(`${p}限`) || q.includes(`${p}コマ`)) || 3;
    const cat = q.includes('総合') ? '総合' : q.includes('外国語') ? '外国語' : q.includes('基礎') ? '基礎' : '';
    return suggestCoursesForFreePeriod(dayMatch, periodMatch, cat, userProfile?.admissionYear);
  }

  // 9. 時間割重複（バッティング）チェック
  if (['被っ', '重複', 'バッティング', '重なって'].some((k) => qLower.includes(k))) {
    const db = getLectureDatabase(userProfile?.admissionYear);
    const candidateCourses: string[] = [];
    db.forEach((c) => {
      if (q.includes(c.name) && !candidateCourses.includes(c.name)) {
        candidateCourses.push(c.name);
      }
    });
    if (candidateCourses.length >= 2) {
      return checkCourseConflicts(candidateCourses, userProfile?.admissionYear).formattedReport;
    }
  }

  // 10. 学部要覧連動「必修組み込み済みの自動スケジュール提案」
  if (['時間割作って', '時間割提案', 'スケジュール作って', 'おすすめの時間割', '必修時間割', '基本時間割', '時間割を組んで'].some((k) => qLower.includes(k))) {
    const dept = userProfile?.department || '情報科学科';
    const grade = userProfile?.grade || 1;
    const reqs = GAKUBU_YORAN_DEPARTMENTS[dept]?.requiredCourses.map((c) => c.name) || [];
    return proposeAutomaticSchedule(dept, grade, userProfile?.admissionYear, reqs);
  }

  // 11. 講義・教員名の逆引き検索
  const db = getLectureDatabase(userProfile?.admissionYear);
  if (q.length >= 2 && ['先生', '教授', '講義', '授業', '開講', '何曜'].some((k) => q.includes(k))) {
    const cleanQ = q.replace(/(先生|教授|講義|授業|って|何曜|何限|いつ|どこ|教えて|の)/g, '').trim();
    if (cleanQ.length >= 2) {
      const hits = db.filter((c) => c.name.includes(cleanQ) || c.teacher.includes(cleanQ));
      if (hits.length > 0) {
        const curLabel = userProfile?.admissionYear === 'reiwa6_or_earlier' ? '（令和6年度以前入学者向け）' : '（令和7年度以降入学者向け）';
        const lines = [`🔍 **【講義・教員 逆引き検索結果: 『${cleanQ}』】** ${curLabel}`, ''];
        hits.slice(0, 8).forEach((h) => {
          lines.push(`・**${h.name}**（担当：${h.teacher} 先生）`);
          lines.push(`  時間: **${h.day}曜 ${h.period}限** | 教室: **${getCompactRoomLabel(h.room)}** | 所属: ${h.department}`);
        });
        return lines.join('\n');
      }
    }
  }

  // 12. 教室番号直接入力判定（「3306」「3505」「421」「124」等の直打ち・質問）
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
        shortLabel = `3号館${r}(${side})`;
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

  // 6. 施設営業時間案内
  if (['図書館', '図書室', '本を借りる', '地下書庫'].some((k) => qLower.includes(k))) {
    return (
      '【日本大学文理学部図書館（図書館棟）営業時間・要覧 p.213】\n' +
      '・月〜金（平日）：09:00 - 20:00\n' +
      '・土曜日：09:00 - 19:00\n' +
      '・日曜・祝日：休館（授業実施日を除く）\n' +
      '※地下書庫への入庫および貸出手続きは閉館30分前までです。'
    );
  }

  if (['コンピュータセンター', 'コンセ', 'cc', 'wifi', 'wi-fi', '学内pc', 'パソコン室'].some((k) => qLower.includes(k))) {
    return (
      '【コンピュータセンター受付（3号館）営業時間・要覧 p.215-216】\n' +
      '・月〜金（平日）：09:00 - 18:00\n' +
      '・土曜日：09:00 - 13:00\n' +
      '・日曜・祝日：休業\n' +
      '※アカウント発行や学内Wi-Fi（CHS-Wi-Fi）の問い合わせ・トラブル対応を行っています。'
    );
  }

  if (['ラーニングコモンズ', 'ラーニング・コモンズ', 'コモンズ', 'lc'].some((k) => qLower.includes(k))) {
    return (
      '【ラーニング・コモンズ（本館1階）営業時間・要覧 p.214】\n' +
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
      '【日本大学文理学部資料館（8号館）開館時間・要覧 p.218】\n' +
      '・月〜金（平日）：10:00 - 17:00\n' +
      '・土曜日：10:00 - 13:00\n' +
      '・日曜・祝日：休館（入館無料）\n' +
      '※考古・歴史・民俗・学術資料等の展示を行っています。'
    );
  }

  // 7. コース科目案内（要覧 p.140-177）
  const courseHit = GAKUBU_YORAN_COURSES.find(
    (c) => q.includes(c.name) || (c.name === '教職コース' && q.includes('教職'))
  );
  if (courseHit) {
    return (
      `【${courseHit.name}（『学部要覧』${courseHit.page}準拠）】\n` +
      `・対象資格・目的: ${courseHit.target}\n` +
      `・相談・申請窓口: **${courseHit.window}**\n` +
      `・単位取扱: ${courseHit.creditsRule}\n` +
      (courseHit.practicalRequirements ? `・実習要件: ${courseHit.practicalRequirements}\n` : '') +
      `・主な開設科目: ${courseHit.keyRequiredCourses.join(', ')}`
    );
  }

  // 8. 副専攻案内（全24種・要覧 p.180-192）
  const minorHit = GAKUBU_YORAN_ALL_24_MINORS.find(
    (m) => q.includes(m.name) || (q.includes('副専攻') && q.includes(m.name.replace('副専攻', '')))
  );
  if (minorHit) {
    return (
      `【${minorHit.name}（『学部要覧』${minorHit.page}準拠）】\n` +
      `・区分: ${minorHit.type === 'academic' ? '学際副専攻' : '学科副専攻'}\n` +
      `・担当窓口: **${minorHit.window}**\n` +
      `・修了要件: 指定科目 **16単位以上** 修得で卒業時に修了証書授与（事前登録不要）\n` +
      `・注意事項: ${minorHit.ruleNotice}\n` +
      `・推奨科目例: ${minorHit.recommendedCourses.join(', ')}`
    );
  }

  if (q.includes('副専攻')) {
    return (
      `**【文理学部の副専攻制度（全24種・要覧 p.180-192）】**\n\n` +
      `主専攻に加えて指定された科目を**16単位以上修得**し、卒業時に申請することで修了証書が授与されます（事前届出不要）。\n\n` +
      `■ **5つの学際副専攻（全学科対象）**:\n` +
      `1. グローバル・コミュニケーション副専攻 (p.190)\n` +
      `2. ダイバーシティ副専攻 (p.191)\n` +
      `3. データサイエンス副専攻 (p.191)\n` +
      `4. 科学リテラシー副専攻 (※理系6学科は不可・p.192)\n` +
      `5. 地域デザイン副専攻 (p.192)\n\n` +
      `■ **19の学科副専攻**:\n` +
      `哲学、史学、日本語日本文学、現代文化、中国言語文化、英語英文学、ドイツ語ヨーロッパ文化、社会学、福祉社会システム、特別ニーズ教育、体育学、心理学、地理学、地球科学、数学、情報科学、物理学、生命科学、化学の各副専攻。\n` +
      `※注意：所属学科と同一の学科副専攻は修了認定を受けられません（要覧 p.180）。`
    );
  }

  // 9. 自販機・設備
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

  if (q.includes('80円') || ['水', '天然水', 'ミネラルウォーター'].some((k) => qLower.includes(k))) {
    return (
      '【サントリー天然水（80円）/ ZONe（80円）】\n' +
      '・**場所**: 4号館 1階自販機、3号館 1階食堂側（白水メイン自販機、青自販機）\n' +
      '・**決済**: ジハンピ（PayPay、モバイル交通系IC、現金）\n' +
      '※学内最安値の80円ドリンクです！'
    );
  }

  // デフォルト案内
  return (
    `【EneKoma AIアシスタント（『学部要覧』公式準拠）】\n` +
    `日本大学文理学部『学部要覧（令和7年度）』に基づき、卒業要件（全学科124単位）、学科専門必修、CAP制（年間40単位制限）、目標GPAシミュレーション、全24副専攻、教室・自販機・営業時間について正確にお答えします。\n\n` +
    `質問例:\n` +
    `• 「目標GPA3.0にするにはどうすればいい？」\n` +
    `• 「単位足りてる？不足講義を教えて」\n` +
    `• 「年間で何単位まで履修登録できる？（CAP制）」\n` +
    `• 「データサイエンス副専攻の要件は？」\n` +
    `• 「教職コースの要件と窓口は？」\n` +
    `• 「3306教室はどこ？」`
  );
}

export async function GET() {
  const serverKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();
  return NextResponse.json({
    hasServerKey: serverKey.length > 0,
    serverKeyPrefix: serverKey.length > 8 ? `${serverKey.slice(0, 6)}...` : undefined,
    availableModels: ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = (body.query || '').trim();
    const apiKey = (body.apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();
    const history = body.history || [];
    const image = body.image || null;
    const userProfile: UserProfileData = body.userProfile || null;

    if (!query && !image) {
      return NextResponse.json({ reply: '質問内容または画像を入力してください。' }, { status: 400 });
    }

    // Google Gemini API呼び出し（APIキー設定時）
    if (apiKey) {
      const imageType = body.imageType || null;
      let userPromptText = query;
      if (image) {
        const isPast = imageType === 'past_timetable' || query.includes('過去') || query.includes('修得済み') || query.includes('前学期');
        const isTranscript = imageType === 'transcript' || query.includes('成績') || query.includes('通知書') || query.includes('GPA') || query.includes('評価');

        let imageInstruction = '';
        if (isPast) {
          imageInstruction = `【最重要：過去の時間割表OCR・ファイル解析】
添付された過去の時間割表（画像またはPDF/ファイル）から、履修した科目名と単位数をすべて抽出してください。
※重要ルール：時間割表には成績評価（S〜C等）は記載されていないため、勝手に成績を推測・捏造せず、評価は「修得」（または「-」）として登録してください。
回答本文で読み取った科目一覧（科目名・単位数）を分かりやすく案内した上で、必ず回答末尾に以下のJSONブロックを出力してください：
\`\`\`profile_update
{
  "action": "add_completed_timetable",
  "totalEarnedCredits": <加算後の総修得単位数(数値)>,
  "addCompletedCourses": [
    { "name": "<科目名>", "credits": <単位数>, "grade": "修得", "year": 1 }
  ]
}
\`\`\``;
        } else if (isTranscript) {
          imageInstruction = `【最重要：成績通知書OCR解析】
添付された成績通知書画像をOCR解析し、履修済み科目、評価、GPA、総修得単位数を読み取ってください。
回答本文で結果を要約した上で、必ず回答末尾に以下のJSONブロックを出力してください：
\`\`\`profile_update
{
  "action": "transcript",
  "totalEarnedCredits": <総修得単位数(数値)>,
  "currentGpa": <現在GPA(数値)>,
  "completedCourses": [
    { "name": "<科目名>", "credits": <単位数>, "grade": "<S/A/B/C/D>" }
  ]
}
\`\`\``;
        } else {
          // デフォルト：今期の時間割表（履修中科目）
          imageInstruction = `【最重要：今期の時間割表OCR解析・履修中科目登録】
添付された【今期の時間割表】画像をマルチモーダルOCR解析し、画像内に記載されている全ての開講科目（曜日・時限・教室・科目名・担当教員名・単位数）を漏れなく読み取ってください。
回答本文で「月曜2限：3306 基礎プログラミング（2単位・山田先生）」のように曜日時限順に整理して分かりやすく案内した上で、**必ず回答の末尾に以下のJSONコードブロックを完全な形式で出力してください（厳守）**：
\`\`\`profile_update
{
  "action": "enroll_current_timetable",
  "semesterCredits": <今期の登録単位数合計(全科目の単位数の合算数値)>,
  "enrolledCourses": [
    { "name": "<正確な科目名>", "day": "<月/火/水/木/金/土>", "period": <1-5の時限数値>, "room": "<教室番号>", "teacher": "<教員名>", "credits": <単位数(講義2, 実習演習1)> }
  ]
}
\`\`\`
※学生が履修登録した全コマを1つ残らず enrolledCourses 配列に含めてください。`;
        }

        userPromptText = query ? `学生のメッセージ: ${query}\n\n${imageInstruction}` : imageInstruction;
      }

      const profileContext = userProfile
        ? `【ユーザープロフィール（『学部要覧』基準）】\n` +
          `・カリキュラム体系: ${userProfile.admissionYear === 'reiwa6_or_earlier' ? '令和6年度以前入学者（旧カリキュラム）' : '令和7年度以降入学者（新カリキュラム）'}\n` +
          `・所属学科: ${userProfile.department || '未設定'}\n` +
          `・学年: ${userProfile.grade || 1}年\n` +
          `・現在のGPA: ${userProfile.currentGpa ?? 2.40}\n` +
          `・目標GPA: ${userProfile.targetGpa ?? 3.00}\n` +
          `・修得済み総単位数: ${userProfile.currentCredits ?? 40}単位\n` +
          `・今期履修中単位数: ${userProfile.semesterCredits ?? 16}単位\n` +
          `・選択コース: ${(userProfile.selectedCourses || []).join(', ') || '未選択'}\n` +
          `・選択副専攻: ${(userProfile.selectedMinors || []).join(', ') || '未選択'}\n` +
          `・修得済み科目数: ${(userProfile.completedCourses || []).length}科目\n\n`
        : '';

      const currentTurnParts: any[] = [
        { text: `${profileContext}${userPromptText}` }
      ];

      if (image && image.data) {
        const cleanBase64 = image.data.replace(/^data:[^;]+;base64,/, '');
        // Google Gemini REST API standard is inlineData (camelCase)
        currentTurnParts.push({
          inlineData: {
            mimeType: image.mimeType || 'image/jpeg',
            data: cleanBase64
          }
        });
      }

      // Gemini APIは最初のターンが必ずrole: "user"である必要があり、かつ交互（user ➔ model ➔ user）でなければならない
      const contents: any[] = [];
      let lastRole: string | null = null;

      for (const h of history) {
        const text = (h.text || '').trim();
        if (!text) continue;
        const role = h.sender === 'user' ? 'user' : 'model';

        // 先頭のウェルカム文（assistant/model）はスキップして必ずuserから開始する
        if (!lastRole && role === 'model') {
          continue;
        }

        if (role === lastRole) {
          // 同一roleが連続する場合はpartsにテキストを追加
          const prevItem = contents[contents.length - 1];
          if (prevItem && Array.isArray(prevItem.parts)) {
            prevItem.parts.push({ text });
          }
        } else {
          contents.push({
            role,
            parts: [{ text }]
          });
          lastRole = role;
        }
      }

      // 現在のユーザーターンを追加（直前がuserの場合は統合）
      if (lastRole === 'user' && contents.length > 0) {
        contents[contents.length - 1].parts.push(...currentTurnParts);
      } else {
        contents.push({
          role: 'user',
          parts: currentTurnParts
        });
      }

      const CANDIDATE_MODELS = [
        'gemini-3.8-flash',
        'gemini-flash-latest',
        'gemini-3.5-flash',
        'gemini-3.7-flash',
        'gemini-3.1-flash-lite',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
      ];

      let lastErrorStatus: number | null = null;
      let lastErrorMessage: string | null = null;

      for (const model of CANDIDATE_MODELS) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const res = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT.trim() }]
              },
              contents,
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2048
              }
            })
          });

          if (res.ok) {
            const data = await res.json();
            const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText) {
              const profileUpdate = parseProfileUpdateFromText(candidateText, !!image);

              return NextResponse.json({
                reply: candidateText,
                source: 'gemini',
                model,
                profileUpdate
              });
            }
          } else {
            lastErrorStatus = res.status;
            try {
              const errJson = await res.json();
              lastErrorMessage = errJson?.error?.message || `HTTP ${res.status}`;
            } catch {
              lastErrorMessage = `HTTP ${res.status}`;
            }
            console.warn(`Gemini API call to ${model} failed with status:`, res.status, lastErrorMessage);
            // APIキー自体の不備や認証拒否の場合は別モデルを試行せず即座に抜ける
            if (res.status === 400 && lastErrorMessage?.toLowerCase().includes('api_key')) {
              break;
            }
            if (res.status === 403) {
              break;
            }
          }
        } catch (err: any) {
          lastErrorMessage = err?.message || String(err);
          console.warn(`Gemini API call to ${model} threw error:`, err);
        }
      }

      // APIキーが設定されたがGeminiがエラーになった場合のエラーメッセージ整形
      let friendlyError = lastErrorMessage || '接続エラー';
      if (lastErrorMessage?.toLowerCase().includes('api_key') || lastErrorStatus === 400) {
        friendlyError = 'APIキーが無効であるか、形式が正しくありません。Google AI Studio（aistudio.google.com）で取得した有効なキー（AIzaSy...）をご確認ください。';
      } else if (lastErrorStatus === 429) {
        friendlyError = 'Gemini APIの無料枠利用上限（レートリミット）に達しました。1〜2分お待ちいただくか、別のキーをお試しください。';
      } else if (lastErrorStatus === 403) {
        friendlyError = 'APIアクセス権限がありません。Gemini APIが有効化されているGoogleアカウントのキーかご確認ください。';
      }

      const localReply = answerLocally(query || (image ? '成績表画像' : ''), userProfile);
      return NextResponse.json({
        reply: `⚠️ 【Gemini API接続エラー: ${friendlyError}】\n画面右上の「⚙️ API設定」からキーをご確認・再入力できます。\n\n（※要覧ナレッジエンジンにより即座に回答します）\n\n${localReply}`,
        source: 'local',
        error: friendlyError
      });
    }

    // ローカルエンジンによる即時フォールバック（公式要覧準拠）
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
