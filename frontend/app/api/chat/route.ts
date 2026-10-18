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
5. **成績表画像（マルチモーダル / OCR解析）からの自動入力・補完**
   ユーザーが成績表の画像をアップロードした場合、画像から以下を自動読み取りし、ユーザープロフィールを補完・更新した上で要約を出力してください：
   * **読み取り項目**：履修済み科目名、修得単位数、各科目の評価（S〜F）、現在GPA、総修得単位数など。
   * **出力フォーマット**：
   > **【成績表データの解析完了】**
   > 画像から以下のデータを読み取り、プロフィールに反映しました：
   > * **修得済み単位数**：〇〇単位
   > * **現在のGPA**：〇.〇〇
   > * **読み取り科目例**：[科目名A (S)], [科目名B (A)] ...
   > 
   > これに基づいて、不足講義の分析やGPAシミュレーションを実行できます。
   * 解析成功時は末尾に以下の更新JSONを埋め込んでください：
   \`\`\`profile_update
   {
     "totalEarnedCredits": 42,
     "currentGpa": 2.85,
     "completedCourses": [
       {"name": "基礎プログラミング", "credits": 2, "grade": "S"},
       {"name": "線形代数1", "credits": 2, "grade": "A"}
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

  // 5. 教室番号直接入力判定（「3306」「3505」「421」「124」等の直打ち・質問）
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = (body.query || '').trim();
    const apiKey = (body.apiKey || process.env.GEMINI_API_KEY || '').trim();
    const history = body.history || [];
    const image = body.image || null;
    const userProfile: UserProfileData = body.userProfile || null;

    if (!query && !image) {
      return NextResponse.json({ reply: '質問内容または画像を入力してください。' }, { status: 400 });
    }

    // Google Gemini API呼び出し（APIキー設定時）
    if (apiKey) {
      try {
        const contents: any[] = [];

        for (const h of history) {
          contents.push({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          });
        }

        let userPromptText = query;
        if (!userPromptText && image) {
          userPromptText = '添付された成績表画像をマルチモーダル解析し、『学部要覧』p.38-39の評価基準（S〜F）に従って修得済み科目名・単位数・評価・現在GPA・総修得単位数を読み取り、要約とプロフィール更新ブロックを出力してください。';
        }

        const profileContext = userProfile
          ? `【ユーザープロフィール（『学部要覧』基準）】\n` +
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
