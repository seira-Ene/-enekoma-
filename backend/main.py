import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import re

try:
    from chs_courses import CHS_LECTURE_DATABASE
except ImportError:
    CHS_LECTURE_DATABASE = []

try:
    from chs_courses_reiwa6 import CHS_LECTURE_DATABASE_REIWA6
except ImportError:
    CHS_LECTURE_DATABASE_REIWA6 = []

def get_lecture_database(curriculum: Optional[str] = None) -> List[Dict[str, Any]]:
    if curriculum == "reiwa6_or_earlier":
        return CHS_LECTURE_DATABASE_REIWA6 if CHS_LECTURE_DATABASE_REIWA6 else CHS_LECTURE_DATABASE
    return CHS_LECTURE_DATABASE if CHS_LECTURE_DATABASE else CHS_LECTURE_DATABASE_REIWA6

app = FastAPI(
    title="EneKoma Campus Navigator API",
    version="2.1.0",
    description="日本大学文理学部向け時間割・履修卒業判定・コース科目・施設案内・スケジュール・フレンド共有・空き教室案内API"
)

# CORS許可設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 1. 授業時間設定 (時限データモデル)
# ==========================================
PERIODS = [
    {"period": 1, "name": "1限", "start": "09:00", "end": "10:30"},
    {"period": 2, "name": "2限", "start": "10:40", "end": "12:10"},
    {"period": "lunch", "name": "昼休み", "start": "12:10", "end": "13:00"},
    {"period": 3, "name": "3限", "start": "13:00", "end": "14:30"},
    {"period": 4, "name": "4限", "start": "14:40", "end": "16:10"},
    {"period": 5, "name": "5限", "start": "16:20", "end": "17:50"},
]

@app.get("/")
@app.get("/api")
def read_root():
    return {"message": "EneKoma Campus Navigator API v2.1 is running", "university": "Nihon University CHS"}

@app.get("/api/periods")
def get_periods():
    return {"periods": PERIODS}

# ==========================================
# 2. 日本大学文理学部 (CHS) 学部要覧基準データ
# ==========================================
# 全学科卒業必要単位数: 124単位
CHS_GRADUATION_REQUIREMENTS = {
    "情報科学科": {"zengaku": 2, "sogo": 12, "gaikokugo": 8, "kisho": 5, "major_req": 38, "major_opt": 22, "free_opt": 37, "total": 124},
    "国文学科": {"zengaku": 2, "sogo": 12, "gaikokugo": 8, "kisho": 5, "major_req": 30, "major_opt": 30, "free_opt": 37, "total": 124},
    "英文学科": {"zengaku": 2, "sogo": 12, "gaikokugo": 16, "kisho": 5, "major_req": 48, "major_opt": 14, "free_opt": 27, "total": 124},
    "哲学科": {"zengaku": 2, "sogo": 12, "gaikokugo": 8, "kisho": 5, "major_req": 28, "major_opt": 40, "free_opt": 29, "total": 124},
    "史学科": {"zengaku": 2, "sogo": 12, "gaikokugo": 8, "kisho": 5, "major_req": 12, "major_opt": 54, "free_opt": 31, "total": 124},
    "中国語中国文化学科": {"zengaku": 2, "sogo": 12, "gaikokugo": 18, "kisho": 5, "major_req": 10, "major_opt": 48, "free_opt": 29, "total": 124},
    "ドイツ文学科": {"zengaku": 2, "sogo": 12, "gaikokugo": 16, "kisho": 5, "major_req": 20, "major_opt": 40, "free_opt": 29, "total": 124},
    "社会学科": {"zengaku": 2, "sogo": 12, "gaikokugo": 8, "kisho": 5, "major_req": 18, "major_opt": 52, "free_opt": 27, "total": 124},
    "社会福祉学科": {"zengaku": 2, "sogo": 12, "gaikokugo": 8, "kisho": 5, "major_req": 32, "major_opt": 31, "free_opt": 34, "total": 124},
    "教育学科": {"zengaku": 2, "sogo": 12, "gaikokugo": 8, "kisho": 5, "major_req": 20, "major_opt": 36, "free_opt": 41, "total": 124},
    "体育学科": {"zengaku": 2, "sogo": 12, "gaikokugo": 8, "kisho": 5, "major_req": 12, "major_opt": 52, "free_opt": 33, "total": 124},
    "心理学科": {"zengaku": 2, "sogo": 12, "gaikokugo": 8, "kisho": 5, "major_req": 32, "major_opt": 34, "free_opt": 31, "total": 124},
    "地理学科": {"zengaku": 2, "sogo": 12, "gaikokugo": 8, "kisho": 5, "major_req": 40, "major_opt": 34, "free_opt": 23, "total": 124},
    "地球科学科": {"zengaku": 2, "sogo": 12, "gaikokugo": 8, "kisho": 5, "major_req": 20, "major_opt": 53, "free_opt": 24, "total": 124},
    "数学科": {"zengaku": 2, "sogo": 12, "gaikokugo": 8, "kisho": 5, "major_req": 30, "major_opt": 35, "free_opt": 32, "total": 124},
    "物理学科": {"zengaku": 2, "sogo": 12, "gaikokugo": 8, "kisho": 5, "major_req": 66, "major_opt": 12, "free_opt": 19, "total": 124},
    "生命科学科": {"zengaku": 2, "sogo": 12, "gaikokugo": 8, "kisho": 5, "major_req": 55, "major_opt": 22, "free_opt": 20, "total": 124},
    "化学科": {"zengaku": 2, "sogo": 12, "gaikokugo": 8, "kisho": 5, "major_req": 52, "major_opt": 24, "free_opt": 21, "total": 124}
}

# 全学科共通6つのコース科目 ＆ 副専攻データ
COURSE_AND_MINOR_INFO = {
    "教職コース（中高免許）": {
        "type": "コース科目",
        "target": "全学科共通（中学校・高等学校教諭一種免許状）、特別支援学校教諭免許状（教育学科のみ）",
        "window": "教職センター",
        "required_credits": 32,
        "key_courses": ["教育原理", "教育心理学", "教育課程論", "道徳教育の理論と方法", "各教科教育法Ⅰ・Ⅱ", "教育実習事前事後指導", "教職実践演習（中・高）"],
        "credit_rule": "修得単位は卒業に必要な「自由選択区分」に算入可能。ただし『各教科教育法Ⅰ〜Ⅳ』『教育実習事前・事後指導』『教育実習Ⅰ・Ⅱ』『教職実践演習（中・高）』等の実習・実践系科目は自由選択区分に算入不可。",
        "gpa_rule": "自由選択区分に算入可能なコース科目はすべてGPA算出対象に含まれます。"
    },
    "司書教諭コース": {
        "type": "コース科目",
        "target": "学校図書館司書教諭資格の取得",
        "window": "教職センター",
        "required_credits": 10,
        "key_courses": ["学校図書館メディアの構成", "読書課程論", "学習指導と学校図書館", "学校経営と学校図書館"],
        "credit_rule": "正規の手続きを経て修得した単位は卒業に必要な「自由選択区分」に算入可能。",
        "gpa_rule": "自由選択区分に算入可能なコース科目はすべてGPA算出対象に含まれます。"
    },
    "司書コース": {
        "type": "コース科目",
        "target": "公共図書館等で勤務する司書資格の取得",
        "window": "教務課",
        "required_credits": 20,
        "key_courses": ["図書館概論", "図書館情報技術論", "図書館サービス概論", "情報資源組織論", "情報資源組織演習"],
        "credit_rule": "修得単位は卒業に必要な「自由選択区分」に算入可能。",
        "gpa_rule": "自由選択区分に算入可能なコース科目はすべてGPA算出対象に含まれます。"
    },
    "学芸員コース": {
        "type": "コース科目",
        "target": "博物館・美術館等で勤務する学芸員資格の取得",
        "window": "教務課",
        "required_credits": 19,
        "key_courses": ["博物館概論", "博物館経営論", "博物館資料保存論", "博物館展示論", "博物館実習"],
        "credit_rule": "修得単位は卒業に必要な「自由選択区分」に算入可能。",
        "gpa_rule": "自由選択区分に算入可能なコース科目はすべてGPA算出対象に含まれます。"
    },
    "社会教育主事コース": {
        "type": "コース科目",
        "target": "地域社会教育の指導者（社会教育士等）に必要な資格取得",
        "window": "教務課",
        "required_credits": 24,
        "key_courses": ["社会教育経営論", "生涯学習論", "社会教育課題研究", "地域教育支援論"],
        "credit_rule": "修得単位は卒業に必要な「自由選択区分」に算入可能。",
        "gpa_rule": "自由選択区分に算入可能なコース科目はすべてGPA算出対象に含まれます。"
    },
    "日本語教育コース": {
        "type": "コース科目",
        "target": "国内外で日本語を教える日本語教員としての専門知識・技能習得",
        "window": "教務課",
        "required_credits": 26,
        "key_courses": ["日本語学概論", "日本語教授法", "対照言語学", "日本語教育実習", "第二言語習得論"],
        "credit_rule": "修得単位は卒業に必要な「自由選択区分」に算入可能。",
        "gpa_rule": "自由選択区分に算入可能なコース科目はすべてGPA算出対象に含まれます。"
    },
    "AI・データサイエンス副専攻": {
        "type": "副専攻",
        "target": "文理融合型データサイエンティスト育成",
        "window": "教務課",
        "required_credits": 16,
        "key_courses": ["データ処理基礎", "ビッグデータサイエンス", "人工知能概論", "データサイエンス演習"],
        "credit_rule": "副専攻指定科目の単位は要覧規定に基づき卒業単位（自由選択等）に算入。",
        "gpa_rule": "GPA算出対象に含まれます。"
    },
    "グローバル主専攻・副専攻": {
        "type": "副専攻",
        "target": "高度な国際教養・外国語コミュニケーション能力の習得",
        "window": "教務課",
        "required_credits": 16,
        "key_courses": ["国際教養A", "Cross-Cultural Communication", "異文化理解演習"],
        "credit_rule": "副専攻指定科目の単位は卒業要件区分に算入。",
        "gpa_rule": "GPA算出対象に含まれます。"
    },
    "環境・サステナビリティ副専攻": {
        "type": "副専攻",
        "target": "SDGs・地球環境科学と共生社会の理解",
        "window": "教務課",
        "required_credits": 16,
        "key_courses": ["環境科学概論", "地球環境学", "サステナビリティ論"],
        "credit_rule": "副専攻指定科目の単位は卒業要件区分に算入。",
        "gpa_rule": "GPA算出対象に含まれます。"
    },
    "心身ウェルネス副専攻": {
        "type": "副専攻",
        "target": "健康・スポーツ科学とメンタルヘルスマネジメント",
        "window": "教務課",
        "required_credits": 16,
        "key_courses": ["健康・スポーツ教育論", "ストレスマネジメント", "メンタルヘルス論"],
        "credit_rule": "副専攻指定科目の単位は卒業要件区分に算入。",
        "gpa_rule": "GPA算出対象に含まれます。"
    }
}

class CreditStatus(BaseModel):
    zengaku: int = 0
    sogo: int = 0
    gaikokugo: int = 0
    kisho: int = 0
    major_req: int = 0
    major_opt: int = 0
    free_opt: int = 0

class DegreeCheckRequest(BaseModel):
    department: str = "情報科学科"
    grade: int = 2
    earned_credits: CreditStatus
    selected_minor: Optional[str] = "AI・データサイエンス副専攻"
    taken_courses: List[str] = []

@app.get("/api/academic/courses")
def get_courses_info():
    """全学科共通の6つのコース科目および副専攻の詳細情報（提出窓口、単位認定ルール等）"""
    return {"courses_and_minors": COURSE_AND_MINOR_INFO}

@app.post("/api/academic/degree-check")
def degree_check(req: DegreeCheckRequest):
    reqs = CHS_GRADUATION_REQUIREMENTS.get(req.department, CHS_GRADUATION_REQUIREMENTS["情報科学科"])
    earned = req.earned_credits
    
    rem_zengaku = max(0, reqs["zengaku"] - earned.zengaku)
    rem_sogo = max(0, reqs["sogo"] - earned.sogo)
    rem_gaikokugo = max(0, reqs["gaikokugo"] - earned.gaikokugo)
    rem_kisho = max(0, reqs["kisho"] - earned.kisho)
    rem_major_req = max(0, reqs["major_req"] - earned.major_req)
    rem_major_opt = max(0, reqs["major_opt"] - earned.major_opt)
    
    total_earned = (earned.zengaku + earned.sogo + earned.gaikokugo + 
                    earned.kisho + earned.major_req + earned.major_opt + earned.free_opt)
    rem_total = max(0, reqs["total"] - total_earned)
    
    # 副専攻 / コース判定
    minor_info = COURSE_AND_MINOR_INFO.get(req.selected_minor or "", {"required_credits": 16, "key_courses": [], "window": "教務課", "credit_rule": "", "gpa_rule": ""})
    minor_taken = [c for c in req.taken_courses if c in minor_info.get("key_courses", [])]
    minor_earned = len(minor_taken) * 2
    minor_rem = max(0, minor_info.get("required_credits", 16) - minor_earned)
    
    missing_items = []
    if rem_zengaku > 0:
        missing_items.append("全学共通: 「自主創造の基礎」(2単位・1年次必修)")
    if rem_sogo > 0:
        missing_items.append(f"総合教育科目: 残り{rem_sogo}単位 (人文系・社会系・理学系各2単位必修含む)")
    if rem_gaikokugo > 0:
        missing_items.append(f"外国語教育科目: 残り{rem_gaikokugo}単位")
    if rem_kisho > 0:
        missing_items.append("基礎教育科目: 「情報リテラシー」(2単位) ＆ 「健康・スポーツ教育」(3単位)")
    if rem_major_req > 0:
        missing_items.append(f"学科専門必修: 残り{rem_major_req}単位 (優先登録推奨)")
    if rem_major_opt > 0:
        missing_items.append(f"学科専門選択: 残り{rem_major_opt}単位")
        
    # 情報科学科の専門必修・卒業研究要件判定
    if req.department == "情報科学科":
        cs_required = [
            "基礎微分積分1", "基礎微分積分2", "線形代数1", "線形代数2",
            "基礎プログラミング1", "基礎プログラミング2", "情報科学実習1", "情報科学実習2",
            "データ構造", "アルゴリズム", "情報理論1", "情報科学研究1", "情報科学研究2"
        ]
        missing_cs = [c for c in cs_required if not any(c in t for t in req.taken_courses)]
        if missing_cs and rem_major_req > 0:
            missing_items.append(f"情報科学科 必修指定残存: {', '.join(missing_cs[:3])}{' など' if len(missing_cs) > 3 else ''}")
        if req.grade >= 3:
            advice.append("🔬 【情報科学科・卒研着手要件】4年次の「情報科学研究1・2（卒業研究）」着手には、3年次終了時までに所定の専門必修単位修得が必須です。データ構造・アルゴリズム・情報科学実習等の未修得科目がないか確認してください。")

    progress_rate = round((total_earned / reqs["total"]) * 100, 1)
    
    advice = []
    if progress_rate >= 80:
        advice.append(f"🎉 卒業条件の達成率は{progress_rate}%です！非常に順調です。卒業論文・ゼミナールと残りの専門必修科目を中心に履修をまとめましょう。")
    elif progress_rate >= 50:
        advice.append(f"👍 卒業条件の達成率は{progress_rate}%です。順調な進捗です。次学期は学科専門必修（残り{rem_major_req}単位）を優先して登録してください。")
    else:
        advice.append(f"⚠️ 卒業条件の達成率は{progress_rate}%です。{req.grade}年次としては取得ペースを上げる必要があります。履修登録上限数（CAP制）を活用しましょう。")
        
    if req.selected_minor and req.selected_minor in COURSE_AND_MINOR_INFO:
        recom_courses = [c for c in minor_info.get("key_courses", []) if c not in minor_taken]
        window_notice = f"（申請先窓口: {minor_info.get('window', '教務課')}）"
        advice.append(f"🎓 [{req.selected_minor}] {window_notice} 進捗: {minor_earned}/{minor_info.get('required_credits', 16)}単位。未履修おすすめ科目: {', '.join(recom_courses) or '要件充足中'}")
        if "教職" in req.selected_minor:
            advice.append("⚠️ 【教職コース注意事項】各教科教育法・実習・実践演習等の実習科目は『自由選択区分』に算入できません。履修計画の単位数計算にご注意ください。")

    return {
        "department": req.department,
        "total_earned": total_earned,
        "total_required": reqs["total"],
        "progress_rate": min(100.0, progress_rate),
        "remaining_credits": {
            "zengaku": rem_zengaku, "sogo": rem_sogo, "gaikokugo": rem_gaikokugo,
            "kisho": rem_kisho, "major_req": rem_major_req, "major_opt": rem_major_opt, "total": rem_total
        },
        "minor_status": {
            "name": req.selected_minor,
            "earned_credits": minor_earned,
            "required_credits": minor_info.get("required_credits", 16),
            "remaining_credits": minor_rem,
            "window": minor_info.get("window", "教務課"),
            "credit_rule": minor_info.get("credit_rule", ""),
            "gpa_rule": minor_info.get("gpa_rule", ""),
            "recommended_courses": [c for c in minor_info.get("key_courses", []) if c not in minor_taken]
        },
        "missing_requirements": missing_items,
        "ai_advice": "\n".join(advice)
    }

# ==========================================
# 3. 講義データベース & 空き教室判定 API
# ==========================================
try:
    from chs_courses import CHS_LECTURE_DATABASE
except ImportError:
    try:
        from backend.chs_courses import CHS_LECTURE_DATABASE
    except ImportError:
        CHS_LECTURE_DATABASE = []

# キャンパスの主要教室一覧
ALL_CAMPUS_ROOMS = [
    "122", "123", "124", "125", "126", "130", "131", "132", "135", "141", "151",
    "3203", "3204", "3205", "3206",
    "3302", "3303", "3304", "3305", "3306", "3308",
    "3401", "3402", "3403", "3404", "3410",
    "3500", "3506",
    "411", "412", "421", "422", "431", "432", "441", "442", "443", "444"
]

@app.get("/api/courses/search")
def search_courses(
    day: Optional[str] = Query(None, description="曜日 (月, 火, 水, 木, 金, 土, 集中)"),
    period: Optional[int] = Query(None, description="時限 (1〜5, 集中は0)"),
    q: Optional[str] = Query("", description="講義名・教員名・学科キーワード")
):
    query = (q or "").strip().lower()
    results = []
    for c in CHS_LECTURE_DATABASE:
        match_day = (day is None or c["day"] == day)
        match_period = (period is None or c["period"] == period)
        match_q = (
            not query or
            query in c["name"].lower() or
            query in c["teacher"].lower() or
            query in c["room"].lower() or
            query in c["department"].lower()
        )
        if match_day and match_period and match_q:
            results.append(c)
    return {"count": len(results), "courses": results}

@app.get("/api/rooms/free")
def get_free_rooms(
    day: Optional[str] = Query(None, description="曜日 (月〜土)"),
    period: Optional[int] = Query(None, description="時限 (1〜5)")
):
    """現在の時刻または指定された曜日・時限における空き教室を判定・案内"""
    now = datetime.datetime.now()
    weekday_map = {0: "月", 1: "火", 2: "水", 3: "木", 4: "金", 5: "土", 6: "日"}
    
    current_day = day or weekday_map.get(now.weekday(), "月")
    if current_day == "日":
        current_day = "月" # 休日は月曜をデフォルト参考
        
    current_period = period
    if current_period is None:
        # 現在時刻から判定
        now_time = now.strftime("%H:%M")
        if now_time < "10:35":
            current_period = 1
        elif now_time < "12:15":
            current_period = 2
        elif now_time < "13:00":
            current_period = 2 # 昼休み
        elif now_time < "14:35":
            current_period = 3
        elif now_time < "16:15":
            current_period = 4
        else:
            current_period = 5

    # 該当コマで使用されている教室
    occupied_rooms = [
        c["room"] for c in CHS_LECTURE_DATABASE 
        if c["day"] == current_day and c["period"] == current_period
    ]
    
    free_rooms = [r for r in ALL_CAMPUS_ROOMS if r not in occupied_rooms]
    
    # 建物ごとに分類
    building_1 = [r for r in free_rooms if r.startswith("1")]
    building_3 = [r for r in free_rooms if r.startswith("3")]
    building_4 = [r for r in free_rooms if r.startswith("4")]
    
    bubble_message = (
        f"ただいま（{current_day}曜 {current_period}限）の空き教室は、"
        f"{', '.join(free_rooms[:5])} など全{len(free_rooms)}室が利用可能です。"
    )
    
    return {
        "day": current_day,
        "period": current_period,
        "occupied_count": len(occupied_rooms),
        "occupied_rooms": occupied_rooms,
        "free_count": len(free_rooms),
        "free_rooms": free_rooms,
        "by_building": {
            "1号館": building_1,
            "3号館": building_3,
            "4号館": building_4
        },
        "bubble_message": bubble_message
    }

# ==========================================
# 4. 施設営業時間案内AI API
# ==========================================
FACILITIES_DB = [
    {
        "id": "library",
        "name": "日本大学文理学部図書館",
        "category": "図書・資料",
        "weekday": "09:00 - 20:00",
        "saturday": "09:00 - 19:00",
        "sunday_holiday": "休館（授業なし日）",
        "note": "地下書庫・貸出手続きは閉館30分前まで",
        "location": "図書館棟"
    },
    {
        "id": "comp_center",
        "name": "コンピュータセンター（受付）",
        "category": "ICT・端末",
        "weekday": "09:00 - 18:00",
        "saturday": "09:00 - 13:00",
        "sunday_holiday": "休業",
        "note": "アカウント・学内Wi-Fi問い合わせ対応",
        "location": "3号館"
    },
    {
        "id": "museum",
        "name": "日本大学文理学部資料館",
        "category": "展示・文化",
        "weekday": "10:00 - 17:00",
        "saturday": "10:00 - 13:00",
        "sunday_holiday": "休館",
        "note": "入館無料 / 企画展示開催中",
        "location": "8号館"
    },
    {
        "id": "learning_commons",
        "name": "ラーニング・コモンズ",
        "category": "学習スペース",
        "weekday": "08:00 - 18:00 (サポートデスク 10:00 - 18:00)",
        "saturday": "08:00 - 17:00 (サポートデスク 09:00 - 13:00)",
        "sunday_holiday": "休館",
        "note": "グループ学習・PC貸出・アカデミックコモンズ併設",
        "location": "本館1階"
    },
    {
        "id": "academic_affairs",
        "name": "事務窓口・教務課等",
        "category": "各種手続き",
        "weekday": "09:00 - 17:00",
        "saturday": "09:00 - 13:00",
        "sunday_holiday": "休み",
        "note": "証明書自動発行機利用は閉口15分前まで / 教職コース届出は教職センターへ",
        "location": "本館1階事務室"
    }
]

class FacilityQueryRequest(BaseModel):
    query: Optional[str] = None

@app.get("/api/facilities/hours")
@app.post("/api/facilities/hours")
def facility_hours(req: Optional[FacilityQueryRequest] = None, q: Optional[str] = Query(None)):
    search_q = (req.query if req and req.query else q) or ""
    
    results = []
    for f in FACILITIES_DB:
        if not search_q or (search_q.lower() in f["name"].lower() or search_q.lower() in f["category"].lower() or search_q.lower() in f["location"].lower()):
            results.append(f)
            
    if not results:
        results = FACILITIES_DB
        
    ai_response = f"【文理学部 施設営業時間案内AI】\n検索条件: 「{search_q or '全施設'}」の回答結果です。\n\n"
    for r in results:
        ai_response += f"🏛 **{r['name']}** ({r['location']})\n"
        ai_response += f"  • 平日: {r['weekday']}\n"
        ai_response += f"  • 土曜: {r['saturday']}\n"
        ai_response += f"  • 日祝: {r['sunday_holiday']}\n"
        ai_response += f"  • 案内: {r['note']}\n\n"
        
    return {
        "query": search_q,
        "facilities": results,
        "ai_response": ai_response.strip()
    }

# ==========================================
# 5. スケジュール ＆ 課題管理 API
# ==========================================
class ScheduleItem(BaseModel):
    id: str
    title: str
    date: str
    period: Optional[str] = None
    course_name: Optional[str] = None
    type: str = "task"  # "task", "exam", "event"
    push_notify: bool = True
    completed: bool = False

MOCK_SCHEDULES: List[Dict[str, Any]] = [
    {"id": "1", "title": "情報科学演習 レポート提出", "date": "2026-10-09", "period": "3限", "course_name": "情報科学演習", "type": "task", "push_notify": True, "completed": False},
    {"id": "2", "title": "データ構造 中間小テスト", "date": "2026-10-15", "period": "2限", "course_name": "データ構造", "type": "exam", "push_notify": True, "completed": False}
]

@app.get("/api/schedules")
def get_schedules():
    return {"schedules": MOCK_SCHEDULES}

@app.post("/api/schedules")
def add_schedule(item: ScheduleItem):
    MOCK_SCHEDULES.append(item.dict())
    return {"status": "success", "schedule": item}

@app.delete("/api/schedules/{schedule_id}")
def delete_schedule(schedule_id: str):
    global MOCK_SCHEDULES
    MOCK_SCHEDULES = [s for s in MOCK_SCHEDULES if s["id"] != schedule_id]
    return {"status": "deleted", "id": schedule_id}

# ==========================================
# 6. マイページ ＆ フレンド時間割共有 API
# ==========================================
class FriendCompareRequest(BaseModel):
    friend_code: str
    my_timetable: Dict[str, Any]

@app.post("/api/friends/compare")
def compare_friends(req: FriendCompareRequest):
    dummy_friend_db = {
        "ENE-1001": {
            "name": "サクラ (情報科学科 2年)",
            "timetable": {
                "mon_1": "情報科学概論", "mon_3": "英語3",
                "tue_2": "データ構造", "wed_1": "自修",
                "thu_1": "Webプログラミング", "thu_3": "線形代数",
                "fri_3": "健康・スポーツ実習"
            }
        },
        "ENE-2002": {
            "name": "ケンタ (国文学科 3年)",
            "timetable": {
                "mon_2": "日本文学史", "tue_1": "古文書学",
                "tue_3": "国語学演習", "thu_2": "漢文学特別講義",
                "fri_1": "近代文学研究"
            }
        }
    }
    
    friend_data = dummy_friend_db.get(
        req.friend_code.upper(),
        {
            "name": f"フレンド ({req.friend_code})",
            "timetable": {"mon_1": "総合教養", "tue_2": "専門演習", "thu_4": "外国語"}
        }
    )
    
    common_free_slots = []
    days = ["mon", "tue", "wed", "thu", "fri", "sat"]
    periods = [1, 2, 3, 4, 5]
    day_names = {"mon": "月曜", "tue": "火曜", "wed": "水曜", "thu": "木曜", "fri": "金曜", "sat": "土曜"}
    
    for d in days:
        for p in periods:
            slot_key = f"{d}_{p}"
            my_slot = req.my_timetable.get(slot_key, "")
            friend_slot = friend_data["timetable"].get(slot_key, "")
            
            if not my_slot and not friend_slot:
                common_free_slots.append({
                    "key": slot_key,
                    "day": day_names.get(d, d),
                    "period": f"{p}限"
                })
                
    return {
        "friend_name": friend_data["name"],
        "friend_code": req.friend_code,
        "friend_timetable": friend_data["timetable"],
        "common_free_slots": common_free_slots,
        "common_free_count": len(common_free_slots)
    }

# ==========================================
# 7. 教室・キャンパスナビゲーター互換API（100%保持）
# ==========================================
class TimetableItem(BaseModel):
    subject: str
    room_number: str

def get_room_short_label(room: str) -> str:
    r = room.strip().upper()
    if not r:
        return "教室未指定"
    if r == "411": return "4号館411(男子側)"
    if r == "412": return "4号館412(女子側)"
    if r == "421": return "4号館421(男子側)"
    if r == "422": return "4号館422(女子側)"
    if r == "431": return "4号館431(男子側)"
    if r == "432": return "4号館432(女子側)"
    if r == "441": return "4号館441(男子側)"
    if r == "442": return "4号館442(男子側)"
    if r == "443": return "4号館443(女子側)"
    if r == "444": return "4号館444(女子側)"
    m3 = re.match(r"^3([1-5])(\d{2})$", r)
    if m3:
        sub = int(m3.group(2))
        side = "男子側" if 1 <= sub <= 5 else "女子側" if 6 <= sub <= 10 else "中央"
        return f"3号館{r}({side})"
    if r in ["122", "123", "124"]: return f"1号館{r}(左側)"
    if r in ["125", "126", "127A", "127B"]: return f"1号館{r}(右側)"
    if r == "130": return "1号館130(正面)"
    if r in ["131", "132", "133", "134", "138"]: return f"1号館{r}(左側)"
    if r in ["135", "136", "137A", "137B", "139"]: return f"1号館{r}(右側)"
    if r == "141": return "1号館141(4F)"
    if r == "151": return "1号館151(5F)"
    if r.startswith("1") and len(r) == 3: return f"1号館{r}"
    if r.startswith("2") and len(r) == 4: return f"2号館{r}"
    if "8B" in r or "88" in r:
        clean = r.replace("88", "8B")
        return f"8号館{clean.replace('8号館', '')[:4]}"
    return r[:12]

def parse_room_detail(room: str) -> str:
    r = room.strip().upper()
    if not r:
        return "詳細場所未登録"
    if r == "411":
        return "4号館1階・正面入って左側（男子トイレ側 / 給水所利用可能）"
    if r == "412":
        return "4号館1階・正面入って右側（女子トイレ側 / 給水所利用可能）"
    if r == "421":
        return "4号館2階・階段登って左側（男子トイレ側 ※給水所使用不可）"
    if r == "422":
        return "4号館2階・階段登って右側（女子トイレ側 ※給水所使用不可）"
    if r == "431":
        return "4号館3階・階段登って右側（男子トイレ側 ※給水所使用不可）"
    if r == "432":
        return "4号館3階・階段登って左側（女子トイレ側 ※給水所使用不可）"
    if r == "441":
        return "4号館4階・階段登って右側奥（男子トイレ側・奥 ※給水所使用不可）"
    if r == "442":
        return "4号館4階・階段登って右側手前（男子トイレ側・手前 ※給水所使用不可）"
    if r == "443":
        return "4号館4階・階段登って左側手前（女子トイレ側・手前 ※給水所使用不可）"
    if r == "444":
        return "4号館4階・階段登って左側奥（女子トイレ側・奥 ※給水所使用不可）"
    m3 = re.match(r"^3([1-5])(\d{2})$", r)
    if m3:
        fl = m3.group(1)
        sub = int(m3.group(2))
        if 1 <= sub <= 5:
            return f"3号館{fl}階・エスカレーター出て右 / エレベーター出て左（男子トイレ側）"
        elif 6 <= sub <= 10:
            return f"3号館{fl}階・エスカレーター出て左 / エレベーター出て右（女子トイレ側）"
        return f"3号館{fl}階（フロア中央エリア）"
    if r in ["122", "123", "124"]:
        return "1号館2階・階段登って左側（奥に女子トイレ）"
    if r in ["125", "126", "127A", "127B"]:
        return "1号館2階・階段登って右側（手前に男子トイレ、奥に女子トイレ）"
    if r == "130":
        return "1号館3階・階段登って正面（左奥に男子トイレ、右奥に女子トイレ）"
    if r in ["131", "132", "133", "134", "138"]:
        return "1号館3階・階段登って左側（奥に男子トイレ）"
    if r in ["135", "136", "137A", "137B", "139"]:
        return "1号館3階・階段登って右側（奥に女子トイレ）"
    if r == "141":
        return "1号館4階・階段登って正面（※4階・5階はトイレなし、2F/3Fを利用）"
    if r == "151":
        return "1号館5階・階段登って正面（※4階・5階はトイレなし、2F/3Fを利用）"
    m2 = re.match(r"^2([1-5])(\d{2})$", r)
    if m2:
        fl = m2.group(1)
        return f"2号館{fl}階（※2号館は自動販売機・ゴミ箱未設置）"
    return f"{room}教室（キャンパス構内）"

@app.post("/api/timetable/parse")
def parse_timetable_room(item: TimetableItem):
    short_label = get_room_short_label(item.room_number)
    detail = parse_room_detail(item.room_number)
    return {
        "subject": item.subject,
        "room_number": item.room_number,
        "short_label": short_label,
        "room_detail": detail
    }

# ==========================================
# 7.5. 時間割・空き教室・移動ナビゲーション支援関数
# ==========================================
ALL_CAMPUS_ROOMS = [
    # 1号館 (13室)
    "122", "123", "124", "125", "126", "127A", "127B", "130", "131", "132", "133", "134", "135", "136", "137A", "137B", "138", "139", "141", "151",
    # 2号館 (6室)
    "2201", "2202", "2301", "2302", "2401", "2402",
    # 3号館 (35室)
    "3101", "3102", "3103", "3104", "3105", "3106", "3107", "3108", "3109", "3110",
    "3201", "3202", "3203", "3204", "3205", "3206", "3207", "3208", "3209", "3210",
    "3301", "3302", "3303", "3304", "3305", "3306", "3307", "3308", "3309", "3310",
    "3401", "3402", "3403", "3404", "3405", "3406", "3407", "3408", "3409", "3410",
    "3501", "3502", "3503", "3504", "3505", "3506", "3507", "3508", "3509", "3510",
    # 4号館 (10室)
    "411", "412", "421", "422", "431", "432", "441", "442", "443", "444"
]

def py_find_free_rooms(target_day: Optional[str] = None, target_period: Optional[int] = None, target_building: Optional[str] = None, curriculum: Optional[str] = None) -> str:
    now = datetime.datetime.now()
    day_names = ["月", "火", "水", "木", "金", "土", "日"]
    current_day = day_names[now.weekday()]
    
    current_hour = now.hour
    current_minute = now.minute
    is_lunch_time = (current_hour == 12 and current_minute >= 10) or (current_hour == 13 and current_minute == 0)
    
    if (not target_period and is_lunch_time) or (target_day == "昼" or "昼" in str(target_period)):
        return (
            "🔔 **【昼休み（12:10〜13:00）の講義室開放ルール】**\n\n"
            "文理学部では、昼休みの時間帯は**原則としてすべての普通講義室（1号館・2号館・3号館・4号館）が自習・飲食・休憩のために開放**されています！\n\n"
            "【昼休みの利用マナー・注意事項】\n"
            "・飲食後はゴミを必ず分別してゴミ箱に捨て、机をきれいに保ちましょう。\n"
            "・次の3限（13:00開始）の授業で使用する学生・教員が入室してきた場合は、速やかに席をお譲りください。\n"
            "・大声での会話や騒音は控え、静かな学習環境の維持にご協力ください。"
        )
    
    calc_day = target_day or (current_day if current_day in ["月", "火", "水", "木", "金", "土"] else "月")
    calc_period = target_period or 2
    
    db = get_lecture_database(curriculum)
    occupied_rooms = set()
    for c in db:
        if c.get("day") == calc_day and c.get("period") == calc_period:
            r = c.get("room", "")
            for p in re.findall(r"[1-4]\d{2,3}[a-zA-Z]?", r):
                occupied_rooms.add(p.upper())
                
    free_rooms = [r for r in ALL_CAMPUS_ROOMS if r not in occupied_rooms]
    if target_building:
        b_num = target_building[0]
        free_rooms = [r for r in free_rooms if r.startswith(b_num)]
        
    cur_label = "（令和6年度以前入学者向け旧カリDB参照）" if curriculum == "reiwa6_or_earlier" else "（令和7年度以降入学者向け新カリDB参照）"
    lines = [
        f"📍 **【空き教室・自習スポット検索結果】** {cur_label}",
        f"📅 **検索対象**: **{calc_day}曜日 {calc_period}限**" + (f"（{target_building}）" if target_building else ""),
        f"✨ **利用可能な空き教室数**: **{len(free_rooms)}室**",
        ""
    ]
    
    b1 = [r for r in free_rooms if r.startswith("1")]
    b2 = [r for r in free_rooms if r.startswith("2")]
    b3 = [r for r in free_rooms if r.startswith("3")]
    b4 = [r for r in free_rooms if r.startswith("4")]
    
    if b3:
        lines.append(f"■ **3号館（{len(b3)}室）**:")
        lines.append("  " + ", ".join([get_room_short_label(r) for r in b3[:10]]) + (" など" if len(b3) > 10 else ""))
    if b4:
        lines.append(f"■ **4号館（{len(b4)}室）**:")
        lines.append("  " + ", ".join([get_room_short_label(r) for r in b4]))
    if b1:
        lines.append(f"■ **1号館（{len(b1)}室）**:")
        lines.append("  " + ", ".join([get_room_short_label(r) for r in b1[:8]]) + (" など" if len(b1) > 8 else ""))
    if b2:
        lines.append(f"■ **2号館（{len(b2)}室）**:")
        lines.append("  " + ", ".join([get_room_short_label(r) for r in b2]))
        
    lines.append("")
    lines.append("💡 **自習時のワンポイント**:")
    lines.append("・自販機・給水所が充実しているのは **3号館1階** および **4号館1階** です。")
    lines.append("・静かに自習したい場合は **日本大学文理学部図書館（平日20時まで）** や **ラーニングコモンズ** も併せてご利用ください。")
    return "\n".join(lines)

def py_calculate_transit(room_from_raw: str, room_to_raw: str) -> str:
    m_from = re.search(r"[1-4]\d{2,3}[a-zA-Z]?", room_from_raw)
    m_to = re.search(r"[1-4]\d{2,3}[a-zA-Z]?", room_to_raw)
    if not m_from or not m_to:
        return f"{room_from_raw}から{room_to_raw}への移動案内：教室番号をご確認ください。"
    
    r_from = m_from.group(0).upper()
    r_to = m_to.group(0).upper()
    b_from = int(r_from[0])
    b_to = int(r_to[0])
    lbl_from = get_room_short_label(r_from)
    lbl_to = get_room_short_label(r_to)
    
    same_b = (b_from == b_to)
    is_elevator_warning = (b_from == 3 and int(r_from[1]) >= 4) or (b_to == 3 and int(r_to[1]) >= 4)
    
    if same_b:
        estimated_min = 3
        feasibility = "余裕で間に合います（通常移動時間：約2〜3分）"
        color = "🟢"
    elif (b_from == 3 and b_to == 4) or (b_from == 4 and b_to == 3):
        estimated_min = 5
        feasibility = "移動可能です（通常移動時間：約4〜5分）"
        color = "🟢"
    elif (b_from == 3 and b_to == 1) or (b_from == 1 and b_to == 3):
        estimated_min = 6
        feasibility = "10分休み内で移動可能です（通常移動時間：約5〜6分）"
        color = "🟡"
    else:
        estimated_min = 7
        feasibility = "少し急ぎ足での移動を推奨します（通常移動時間：約6〜7分）"
        color = "🟡"
        
    lines = [
        f"⚡ **【キャンパス移動ナビ・10分休み最適化】**",
        f"🚶 **ルート**: **{lbl_from}** ➔ **{lbl_to}**",
        f"{color} **移動判定**: **{feasibility}**",
        f"⏱️ **想定所要時間**: 約 **{estimated_min}分**（10分休み残り約{10 - estimated_min}分）",
        ""
    ]
    if is_elevator_warning:
        lines.append("⚠️ **【エレベーター混雑警告】** 3号館4階・5階への移動時は、休み時間にエレベーター前に長い列ができるため、**エスカレーターまたは中央階段**を優先して利用すると遅刻を防げます。")
    if b_to == 1 and int(r_to[1]) >= 4:
        lines.append("ℹ️ **【トイレ案内】** 1号館4階・5階にはお手洗いがありません。移動途中の2階または3階のお手洗いを事前にご利用ください。")
    if b_to == 4 and r_to != "411" and r_to != "412":
        lines.append("💧 **【給水所案内】** 4号館の給水所（冷水機）は1階のみ利用可能です。上階に登る前に水分補給をお済ませください。")
    lines.append("💡 **移動アドバイス**: チャイムが鳴ったら速やかに移動を開始し、教室に到着したら席を確保して次の準備をしましょう！")
    return "\n".join(lines)

def py_get_room_daily_schedule(room_raw: str, target_day: Optional[str] = None, curriculum: Optional[str] = None) -> str:
    m = re.search(r"[1-4]\d{2,3}[a-zA-Z]?", room_raw)
    if not m:
        return f"{room_raw}教室の番号をご確認ください。"
    r = m.group(0).upper()
    lbl = get_room_short_label(r)
    now = datetime.datetime.now()
    day_names = ["月", "火", "水", "木", "金", "土", "日"]
    calc_day = target_day or (day_names[now.weekday()] if now.weekday() < 6 else "月")
    
    db = get_lecture_database(curriculum)
    cur_label = "（令和6年度以前入学者向け旧カリDB参照）" if curriculum == "reiwa6_or_earlier" else "（令和7年度以降入学者向け新カリDB参照）"
    
    lines = [
        f"📅 **【教室利用スケジュール: {lbl}】** {cur_label}",
        f"🗓️ **対象曜日**: **{calc_day}曜日**",
        ""
    ]
    for p in range(1, 6):
        hits = [c for c in db if c.get("day") == calc_day and c.get("period") == p and r in c.get("room", "").upper()]
        if hits:
            course = hits[0]
            lines.append(f"・**{p}限**: 🔴 **{course['name']}**（{course.get('teacher', '担当教員')} 先生 / {course.get('department', 'CHS')}）")
        else:
            lines.append(f"・**{p}限**: 🟢 **空きコマ（自習・休憩利用可能）**")
            
    lines.append("")
    lines.append("💡 昼休み（12:10〜13:00）は全講義室が食事・自習スペースとして開放されています。")
    return "\n".join(lines)

def py_suggest_courses_for_free_period(day: str, period: int, category: str = "", curriculum: Optional[str] = None) -> str:
    db = get_lecture_database(curriculum)
    candidates = [c for c in db if c.get("day") == day and c.get("period") == period]
    if category:
        candidates = [c for c in candidates if category in c.get("department", "") or category in c.get("name", "")]
        
    cur_label = "（令和6年度以前入学者向け旧カリDB参照）" if curriculum == "reiwa6_or_earlier" else "（令和7年度以降入学者向け新カリDB参照）"
    lines = [
        f"💡 **【空きコマ活用・おすすめ履修科目提案】** {cur_label}",
        f"🕒 **対象時間帯**: **{day}曜 {period}限**" + (f"（希望区分: {category}）" if category else ""),
        "開講科目のうち、総合教育・外国語・教養系のおすすめ講義です：",
        ""
    ]
    for c in candidates[:6]:
        room_lbl = get_room_short_label(c.get("room", ""))
        lines.append(f"・**{c['name']}**（{c.get('teacher', '')} 先生）")
        lines.append(f"  教室: **{room_lbl}** | 所属区分: {c.get('department', '教養')} | 配当: {c.get('grade', '全学年')}")
        
    lines.append("")
    lines.append("📌 履修登録時はシラバスで講義概要と評価基準、年間履修登録上限（CAP制40単位・要覧 p.35）を必ず確認してください。")
    return "\n".join(lines)

def py_check_course_conflicts(course_names: List[str], curriculum: Optional[str] = None) -> str:
    db = get_lecture_database(curriculum)
    found_courses = []
    for name in course_names:
        for c in db:
            if name.lower() in c.get("name", "").lower():
                found_courses.append(c)
                break
                
    slots: Dict[str, List[Dict[str, Any]]] = {}
    for c in found_courses:
        key = f"{c['day']}_{c['period']}"
        if key not in slots:
            slots[key] = []
        slots[key].append(c)
        
    conflicts = {k: v for k, v in slots.items() if len(v) > 1}
    lines = ["⚠️ **【時間割重複（バッティング）チェック結果】**", ""]
    if conflicts:
        lines.append("🚨 **【重複が検知されました！】** 以下の科目が同一時限に開講されているため、同時に履修登録できません：")
        lines.append("")
        for k, clist in conflicts.items():
            d, p = k.split("_")
            lines.append(f"■ **{d}曜 {p}限**（{len(clist)}科目衝突）:")
            for c in clist:
                lines.append(f"  ・『{c['name']}』（担当：{c['teacher']} 先生 / 教室：{get_room_short_label(c['room'])}）")
        lines.append("")
        lines.append("💡 **解決策**: 片方の科目を別の曜日・時限の開講クラス（または別科目）に変更してください。")
    else:
        lines.append("✅ **【重複なし】** 指定された科目はすべて異なる時限に開講されており、正常に同時履修登録可能です！")
        for c in found_courses:
            lines.append(f"・『{c['name']}』: {c['day']}曜 {c['period']}限（{get_room_short_label(c['room'])}）")
    return "\n".join(lines)

def py_propose_automatic_schedule(dept: str, grade: int, curriculum: Optional[str] = None, reqs: Optional[List[str]] = None) -> str:
    db = get_lecture_database(curriculum)
    cur_label = "（令和6年度以前入学者向け旧カリDB参照）" if curriculum == "reiwa6_or_earlier" else "（令和7年度以降入学者向け新カリDB参照）"
    
    dept_courses = [c for c in db if dept in c.get("department", "") or (reqs and any(r in c.get("name", "") for r in reqs))]
    
    schedule_grid = {}
    for c in dept_courses:
        slot = f"{c['day']}_{c['period']}"
        if slot not in schedule_grid:
            schedule_grid[slot] = c
            
    lines = [
        f"📅 **【学部要覧公式連動・必修組み込み自動時間割提案】** {cur_label}",
        f"🎓 **対象**: **{dept}**（{grade}年次モデル）",
        "公式『学部要覧』の学科必修科目・全学共通科目を優先配置し、空きコマに教養科目をバランスよく配分したモデル時間割です：",
        ""
    ]
    days = ["月", "火", "水", "木", "金"]
    for d in days:
        day_items = []
        for p in range(1, 6):
            slot = f"{d}_{p}"
            if slot in schedule_grid:
                item = schedule_grid[slot]
                day_items.append(f"  ・{p}限: **{item['name']}**（{get_room_short_label(item['room'])}）")
        if day_items:
            lines.append(f"■ **{d}曜日**:")
            lines.extend(day_items)
            
    lines.append("")
    lines.append("💡 **履修設計のポイント**:")
    lines.append("・学科必修科目を最優先で時間割に固定し、空いたコマに総合教育（人文・社会・理学）や外国語科目を配置しています。")
    lines.append("・文理学部の年間履修上限は**40単位（CAP制・要覧 p.35）**です。無理のないペース配分を心がけてください。")
    return "\n".join(lines)

# ==========================================
# 8. 自販機・構内ナビゲーターチャット（校舎ナレッジ完全準拠）
# ==========================================
VENDING_MACHINES_DB = [
    {
        "id": "bldg4_1f_suntory",
        "building": "4号館",
        "floor": "1階",
        "brand": "サントリー",
        "app": "ジハンピ",
        "location": "4号館 1階 エントランスホール（給水所横）",
        "payment": "PayPay〇、交通系IC（モバイル）〇、※物理交通系IC直接タッチ×、現金〇",
        "items": [
            {"name": "サントリー天然水", "price": 80, "pos": "上段"},
            {"name": "ZONe スカッと透明", "price": 80, "pos": "中段"},
            {"name": "やさしい麦茶", "price": 90, "pos": "上段"},
            {"name": "マウンテンデュー", "price": 100, "pos": "中段"},
            {"name": "デカビタC GABA", "price": 100, "pos": "中段"},
            {"name": "伊右衛門 焙じ茶", "price": 100, "pos": "下段"},
            {"name": "伊右衛門 緑茶", "price": 110, "pos": "上段/下段"},
            {"name": "果汁飲料 赤パッケージ", "price": 110, "pos": "下段"},
            {"name": "リプトン 白の贅沢ミルクティー", "price": 110, "pos": "下段"},
            {"name": "プレミアムボス", "price": 130, "pos": "下段"},
            {"name": "amino VITAL", "price": 140, "pos": "上段"},
            {"name": "PREMIUM GREEN DA・KA・RA マスカット", "price": 150, "pos": "中段"},
            {"name": "レッドブル", "price": 170, "pos": "中段"},
        ]
    },
    {
        "id": "bldg3_1f_suntory_white_water",
        "building": "3号館",
        "floor": "1階",
        "brand": "サントリー（白・水メイン）",
        "app": "ジハンピ",
        "location": "3号館 1階（食堂側・サントリー白・水メイン）",
        "payment": "PayPay〇、交通系IC（モバイル）〇、※物理カード直タッチ×、現金〇",
        "items": [
            {"name": "サントリー天然水", "price": 80},
            {"name": "GREEN DA・KA・RA やさしい麦茶 600ml", "price": 90},
            {"name": "ぷるぷるプリン缶", "price": 100},
            {"name": "伊右衛門 特茶/焙じ茶", "price": 100, "price_max": 110, "price_display": "100〜110円"},
            {"name": "リプトン 白の贅沢ミルクティー", "price": 110},
            {"name": "BOSS各種（ブラック・アイスコーヒー・クラフトボス等）", "price": 90, "price_max": 140, "price_display": "90〜140円"},
        ]
    },
    {
        "id": "bldg3_1f_suntory_white_sports",
        "building": "3号館",
        "floor": "1階",
        "brand": "サントリー（白・スポーツ/エナジー系）",
        "app": "ジハンピ",
        "location": "3号館 1階（食堂側・サントリー白・スポーツ/エナジー系）",
        "payment": "PayPay〇、交通系IC（モバイル）〇、※物理カード直タッチ×、現金〇",
        "items": [
            {"name": "レモン強炭酸水", "price": 90},
            {"name": "やさしい麦茶", "price": 90},
            {"name": "レモンスカッシュ", "price": 100},
            {"name": "アイスティー", "price": 100},
            {"name": "プリン缶/MATCH", "price": 100},
            {"name": "デカビタC", "price": 100},
            {"name": "ダカラ (DAKARA)", "price": 110},
            {"name": "ポカリスエット/ポカリウォーター", "price": 110, "price_max": 130, "price_display": "110〜130円"},
            {"name": "MATCH", "price": 120},
            {"name": "ライムソルト", "price": 120},
            {"name": "T&S果汁系", "price": 130},
            {"name": "レッドブル", "price": 170},
            {"name": "モンスターエナジー各種", "price": 180, "price_max": 190, "price_display": "180〜190円"},
        ]
    },
    {
        "id": "bldg3_1f_suntory_blue",
        "building": "3号館",
        "floor": "1階",
        "brand": "サントリー（青）",
        "app": "ジハンピ",
        "location": "3号館 1階（食堂側・サントリー青）",
        "payment": "PayPay〇、交通系IC（モバイル）〇、※物理カード直タッチ×、現金〇",
        "items": [
            {"name": "ZONe NOPE", "price": 80},
            {"name": "BOSS いちごミルク/贅沢微糖", "price": 90, "price_max": 100, "price_display": "90〜100円"},
            {"name": "缶コーヒー微糖/プレミアムボス", "price": 100},
            {"name": "デカビタC GABA", "price": 100},
            {"name": "ペプシコーラ生", "price": 100},
            {"name": "マウンテンデュー", "price": 100},
            {"name": "塩分補給ドリンク", "price": 120},
            {"name": "京都レモネード", "price": 140},
            {"name": "果汁系ドリンク", "price": 140},
            {"name": "レッドブル", "price": 170},
        ]
    },
    {
        "id": "bldg3_1f_coca_cola_red",
        "building": "3号館",
        "floor": "1階",
        "brand": "コカ・コーラ（赤）",
        "app": "Coke ON（Coke ON Pay）",
        "location": "3号館 1階（食堂側・コカ・コーラ赤自販機）",
        "payment": "クレジットカードタッチ決済（Visa/Mastercard等）〇、PayPay〇、交通系IC（モバイル）〇、※物理カード直タッチ×、現金〇",
        "items": [
            {"name": "ジョージア各種", "price": 90, "price_max": 110, "price_display": "90〜110円"},
            {"name": "い・ろ・は・す", "price": 100, "price_max": 110, "price_display": "100〜110円"},
            {"name": "リアルゴールド", "price": 110, "price_max": 120, "price_display": "110〜120円"},
            {"name": "綾鷹", "price": 110},
            {"name": "やかんの麦茶", "price": 110},
            {"name": "アロエ＆白ぶどう", "price": 110},
            {"name": "紅茶花伝 ミルクティー", "price": 110},
            {"name": "ファンタ グレープ/ドクターペッパー", "price": 120},
            {"name": "アクエリアス", "price": 130},
            {"name": "コカ・コーラ", "price": 140},
        ]
    }
]

VENDING_MACHINES = VENDING_MACHINES_DB

import json
import urllib.request
import os

SYSTEM_PROMPT = """
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
     ```profile_update
     {
       "action": "enroll_current_timetable",
       "semesterCredits": 16,
       "enrolledCourses": [
         { "name": "科目名A", "day": "月", "period": 2, "room": "3306", "credits": 2 },
         { "name": "科目名B", "day": "火", "period": 3, "room": "421", "credits": 2 }
       ]
     }
     ```
   * **【種別B：過去の時間割表】（前学期・過年度の履修済み科目を追加する場合）**：
     - 過去の時間割画像から科目名・単位数をOCR読み取り。
     - 「修得済み科目」に一括追加し、総修得単位数に加算。
     - 出力末尾に以下の更新JSONを埋め込んでください：
     ```profile_update
     {
       "action": "add_completed_timetable",
       "totalEarnedCredits": 56,
       "addCompletedCourses": [
         { "name": "自主創造の基礎", "credits": 2, "grade": "A" },
         { "name": "情報リテラシー", "credits": 2, "grade": "A" }
       ]
     }
     ```
   * **【種別C：成績通知書・成績表】（成績やGPAを反映する場合）**：
     - 履修済み科目名、修得単位数、各科目の評価（S〜F）、現在GPA、総修得単位数を読み取り要約を出力。
     - 出力末尾に以下の更新JSONを埋め込んでください：
     ```profile_update
     {
       "action": "transcript",
       "totalEarnedCredits": 42,
       "currentGpa": 2.85,
       "completedCourses": [
         { "name": "基礎プログラミング", "credits": 2, "grade": "S" },
         { "name": "線形代数1", "credits": 2, "grade": "A" }
       ]
     }
     ```
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
   『学部要覧』p.38-39の計算式 `(4×S + 3×A + 2×B + 1×C) / 総履修単位(D,E含む)` に基づき、目標GPA到達に必要な今期の評価目安（パターンA: 科目数、パターンB: 平均ポイント）を算出提示してください。
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
"""

def call_gemini_api(query: str, history: List[Dict[str, Any]], api_key: str, image: Optional[Dict[str, Any]] = None, user_profile: Optional[Dict[str, Any]] = None, image_type: Optional[str] = None):
    candidate_models = [
        "gemini-1.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro"
    ]
    last_error = None
    for model in candidate_models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            contents = []
            for h in history:
                role = "user" if h.get("sender") == "user" else "model"
                contents.append({"role": role, "parts": [{"text": h.get("text", "")}]})
            
            user_parts: List[Dict[str, Any]] = []
            profile_context = ""
            if user_profile:
                curriculum_desc = "令和6年度以前入学者（旧カリキュラム）" if user_profile.get("admissionYear") == "reiwa6_or_earlier" else "令和7年度以降入学者（新カリキュラム）"
                profile_context = (
                    f"【ユーザープロフィール（『学部要覧』基準）】\\n"
                    f"・カリキュラム体系: {curriculum_desc}\\n"
                    f"・所属学科: {user_profile.get('department', '未設定')}\\n"
                    f"・学年: {user_profile.get('grade', 1)}年\\n"
                    f"・現在のGPA: {user_profile.get('currentGpa', 2.40)}\\n"
                    f"・目標GPA: {user_profile.get('targetGpa', 3.00)}\\n"
                    f"・修得済み総単位数: {user_profile.get('currentCredits', 40)}単位\\n"
                    f"・今期履修中単位数: {user_profile.get('semesterCredits', 16)}単位\\n"
                    f"・選択コース: {', '.join(user_profile.get('selectedCourses', [])) or '未選択'}\\n"
                    f"・選択副専攻: {', '.join(user_profile.get('selectedMinors', [])) or '未選択'}\\n"
                    f"・修得済み科目数: {len(user_profile.get('completedCourses', []))}科目\\n\\n"
                )
            
            user_prompt_text = query
            if image:
                if image_type == "current_timetable" or (not user_prompt_text and ("時間割" in query or "履修中" in query)):
                    user_prompt_text = f"【添付画像：今期の時間割表】\\n{user_prompt_text}" if user_prompt_text else "添付された【今期の時間割表】画像をマルチモーダルOCR解析し、開講曜日・時限・教室・科目名・単位数・担当教員を読み取ってください。「今期履修中」として登録し、今期履修単位数合計を算出して、要約とプロフィール更新ブロック（action: 'enroll_current_timetable'）を出力してください。"
                elif image_type == "past_timetable" or (not user_prompt_text and ("過去" in query or "修得済み" in query or "前学期" in query)):
                    user_prompt_text = f"【添付画像：過去の時間割表】\\n{user_prompt_text}" if user_prompt_text else "添付された【過去の時間割表】画像をマルチモーダルOCR解析し、開講されていた科目名・単位数を読み取ってください。「修得済み科目」に追加登録し、総修得単位数に加算して、要約とプロフィール更新ブロック（action: 'add_completed_timetable'）を出力してください。"
                elif not user_prompt_text:
                    user_prompt_text = "添付された画像（時間割表または成績表）をマルチモーダルOCR解析し、今期時間割であれば「今期履修中」登録、過去時間割であれば「修得済み科目」追加、成績表であれば修得単位・GPA・評価を読み取って要約とプロフィール更新ブロックを出力してください。"

            prompt_text = f"{profile_context}{user_prompt_text}"
            user_parts.append({"text": prompt_text})
            
            if image and image.get("data"):
                clean_b64 = re.sub(r"^data:[^;]+;base64,", "", image["data"])
                user_parts.append({
                    "inline_data": {
                        "mime_type": image.get("mimeType", "image/jpeg"),
                        "data": clean_b64
                    }
                })
                
            contents.append({"role": "user", "parts": user_parts})
            
            payload = {
                "system_instruction": {"parts": [{"text": SYSTEM_PROMPT.strip()}]},
                "contents": contents,
                "generationConfig": {"temperature": 0.3, "maxOutputTokens": 2048}
            }
            req_data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(url, data=req_data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                cand = data.get("candidates", [])
                if cand:
                    cand_text = cand[0].get("content", {}).get("parts", [{}])[0].get("text")
                    if cand_text:
                        return cand_text, model, None
        except urllib.error.HTTPError as e:
            try:
                err_body = json.loads(e.read().decode("utf-8"))
                last_error = err_body.get("error", {}).get("message", f"HTTP {e.code}")
            except Exception:
                last_error = f"HTTP {e.code}"
            print(f"Gemini API error ({model}): {last_error}")
            if e.code == 400 and "api_key" in str(last_error).lower():
                break
        except Exception as e:
            last_error = str(e)
            print(f"Gemini API error ({model}): {e}")
    return None, None, last_error

class ChatRequest(BaseModel):
    query: Optional[str] = ""
    history: Optional[List[Dict[str, Any]]] = []
    apiKey: Optional[str] = None
    image: Optional[Dict[str, Any]] = None
    imageType: Optional[str] = None
    userProfile: Optional[Dict[str, Any]] = None

def answer_navigator_query(q: str, user_profile: Optional[Dict[str, Any]] = None) -> str:
    query = q.strip()
    q_lower = query.lower()

    # 0.1. CAP制（履修登録上限・要覧 p.35-36）
    if any(k in q_lower for k in ["上限", "cap", "何単位まで履修", "年間単位", "履修登録上限", "40単位"]):
        return (
            "**【履修科目登録単位数の上限（CAP制・『学部要覧』p.35-36準拠）】**\n\n"
            "文理学部では、学習効果向上のため**年間履修登録単位数の上限を40単位**と定めています（※修得単位数ではなく履修登録単位数です）。\n\n"
            "■ **40単位の上限に含まれない科目（要覧 p.35）**：\n"
            "・外国語教育科目の「中国語(逆)」再履修科目\n"
            "・不定期に開講する授業（休暇中に行われる集中授業等）\n"
            "・海外語学研修、海外文化交流\n"
            "・コース科目（司書教諭、司書、学芸員、社会教育主事、教職指定科目）\n"
            "・教職コース履修上の他学科開講専門科目・他学科聴講科目\n"
            "・その他所属学科が必要と認めた科目（学科専門科目一覧表でアンダーラインと＊が付いた科目）\n\n"
            "■ **成績優秀者等に対する上限加算の特別措置（要覧 p.36）**：\n"
            "・1年次前学期に16単位以上修得し、GPAが2.5以上 ➔ **1年次後学期において4単位加算（年間44単位）**\n"
            "・前年度に20単位以上修得し、前年度のGPAが3.0以上 ➔ **年間で8単位の加算（年間48単位）**\n"
            "・前年度に20単位以上修得し、前年度のGPAが2.5以上 ➔ **年間で6単位の加算（年間46単位）**\n"
            "・前年度に20単位以上修得し、前年度のGPAが2.0以上 ➔ **年間で4単位の加算（年間44単位）**\n"
            "・前年度に履修し再履修となった科目 ➔ **年間で上限10単位まで加算**"
        )

    # 0.2. GPAシミュレーション
    if "gpa" in q_lower and any(k in q_lower for k in ["目標", "シミュレーション", "届く", "3.0", "計算"]):
        cur_gpa = float(user_profile.get("currentGpa", 2.40)) if user_profile else 2.40
        tgt_gpa = float(user_profile.get("targetGpa", 3.00)) if user_profile else 3.00
        cur_cr = int(user_profile.get("currentCredits", 40)) if user_profile else 40
        sem_cr = int(user_profile.get("semesterCredits", 16)) if user_profile else 16
        tot_cr = cur_cr + sem_cr
        needed_pts = (tot_cr * tgt_gpa) - (cur_cr * cur_gpa)
        avg_gp = needed_pts / sem_cr if sem_cr > 0 else 0
        num_courses = round(sem_cr / 2)
        
        if avg_gp > 4.0:
            max_achievable = (cur_cr * cur_gpa + sem_cr * 4.0) / tot_cr if tot_cr > 0 else 0
            return (
                f"**【目標GPA達成シミュレーション（『学部要覧』p.38-39準拠）】**\n"
                f"* **現在GPA**：{cur_gpa:.2f} ➔ **目標GPA**：{tgt_gpa:.2f}\n"
                f"* **今期履修中**：{sem_cr}単位（約{num_courses}科目）\n\n"
                f"⚠️ **【判定：今期単独での到達は数理的に不可能】**\n"
                f"『学部要覧』p.39のGPA換算基準（S:4.0, A:3.0, B:2.0, C:1.0, D/E:0.0）に基づくと、今期履修中の{sem_cr}単位すべてで最高評価「S（4.0）」を獲得しても、今期末の最大GPAは **{max_achievable:.2f}** となり、目標の {tgt_gpa:.2f} には届きません。\n"
                f"次年度以降の学期を含め、計画的にS・A評価を積み重ねる長期的な履修設計が必要です。"
            )
        
        best_s = num_courses
        best_a = 0
        for s in range(num_courses, -1, -1):
            a = num_courses - s
            pts = s * 2 * 4.0 + a * 2 * 3.0
            if pts >= needed_pts:
                best_s = s
                best_a = a
                
        diff = "S評価中心" if avg_gp >= 3.5 else "S・A評価中心" if avg_gp >= 2.5 else "B以上"
        return (
            f"**【目標GPA達成シミュレーション（『学部要覧』p.38-39準拠）】**\n"
            f"* **現在GPA**：{cur_gpa:.2f} ➔ **目標GPA**：{tgt_gpa:.2f}\n"
            f"* **今期履修中**：{sem_cr}単位（約{num_courses}科目）\n\n"
            f"**【達成に必要な評価目安】**\n"
            f"目標GPA（{tgt_gpa:.2f}）に到達するには、今期受けている{sem_cr}単位のうち：\n"
            f"* **パターンA**：**S評価を {best_s}科目（{best_s * 2}単位）**、**A評価を {best_a}科目（{best_a * 2}単位）** 以上修得（B評価以下は不可）\n"
            f"* **パターンB**：全科目で平均 **{max(1.0, avg_gp):.2f}ポイント以上**（判定：**{diff}**）が必要です。\n\n"
            f"※『学部要覧』p.38-39の計算式 (4×S + 3×A + 2×B + 1×C) / 総履修単位(D,E含む) に基づき算出しています。"
        )

    # 0.3. 履修・不足講義チェック
    if any(k in query for k in ["単位足りてる", "不足", "履修チェック", "要件チェック", "あと何単位", "必修"]):
        dept = user_profile.get("department", "情報科学科") if user_profile else "情報科学科"
        grade = user_profile.get("grade", 2) if user_profile else 2
        earned = int(user_profile.get("currentCredits", 42)) if user_profile else 42
        rem_tot = max(0, 124 - earned)
        dept_info = CHS_GRADUATION_REQUIREMENTS.get(dept, CHS_GRADUATION_REQUIREMENTS["情報科学科"])
        selected_courses = user_profile.get("selectedCourses", []) if user_profile else []
        selected_minors = user_profile.get("selectedMinors", []) if user_profile else []
        
        lines = [
            f"**【履修達成状況・不足講義案内（『学部要覧』公式準拠）】**",
            f"🎓 **対象学科**: **{dept}**（{grade}年次）",
            f"",
            f"**1. 学科必修科目・先修条件（最優先）**：",
            f"* **{dept}** の専門要件：専門必修 **{dept_info['major_req']}単位**、専門選択 **{dept_info['major_opt']}単位** が必要です。",
            f"* 2年次終了時までに50単位以上、3年次終了時までに進級・ゼミ・卒論着手要件（所定単位数）を必ず満たしてください。",
            f"",
            f"**2. 選択コース・副専攻要件**："
        ]
        if selected_courses or selected_minors:
            for c in selected_courses:
                lines.append(f"* **［{c}］**：所定の指定科目修得が必要です。修得単位は卒業要件の「自由選択区分」に算入可能です（一部実習除く）。")
            for m in selected_minors:
                lines.append(f"* **［{m}］**：修了要件である16単位以上の指定科目修得に向けて計画的に履修してください。")
        else:
            lines.append("* 現在コース・副専攻の登録はありません。")
        
        lines.append(f"")
        lines.append(f"**3. 卒業単位合計（要覧 p.31）**：")
        lines.append(f"* 卒業要件（全18学科共通124単位・要覧 p.31）まで、残り **{rem_tot}単位** です（修得済: **{earned}単位**）。")
        lines.append(f"* 全学共通（2単位）、総合教育（12単位・人文/社会/理学各2含む）、外国語（{dept_info['gaikokugo']}単位）、基礎教育（5単位）の各区分も充足させてください。")
        return "\n".join(lines)

    # 0.4. 副専攻全般
    if "副専攻" in query:
        return (
            "**【文理学部の副専攻制度（全24種・要覧 p.180-192）】**\n\n"
            "主専攻に加えて指定された科目を**16単位以上修得**し、卒業時に申請することで修了証書が授与されます（事前届出不要）。\n\n"
            "■ **5つの学際副専攻（全学科対象）**:\n"
            "1. グローバル・コミュニケーション副専攻 (p.190)\n"
            "2. ダイバーシティ副専攻 (p.191)\n"
            "3. データサイエンス副専攻 (p.191)\n"
            "4. 科学リテラシー副専攻 (※理系6学科は不可・p.192)\n"
            "5. 地域デザイン副専攻 (p.192)\n\n"
            "■ **19の学科副専攻**:\n"
            "哲学、史学、日本語日本文学、現代文化、中国言語文化、英語英文学、ドイツ語ヨーロッパ文化、社会学、福祉社会システム、特別ニーズ教育、体育学、心理学、地理学、地球科学、数学、情報科学、物理学、生命科学、化学の各副専攻。\n"
            "※注意：所属学科と同一の学科副専攻は修了認定を受けられません（要覧 p.180）。"
        )

    # 1. 価格帯検索判定（「80円」「100~110円」「100円以下」など）を最優先判定
    range_match = re.search(r"(\d{2,3})\s*[-~〜]\s*(\d{2,3})\s*円?", query)
    exact_match = re.search(r"(\d{2,3})\s*円", query)
    under_match = re.search(r"(\d{2,3})\s*円?\s*(以下|未満)", query)
    
    min_p, max_p = None, None
    if range_match:
        min_p = int(range_match.group(1))
        max_p = int(range_match.group(2))
    elif under_match:
        min_p = 0
        max_p = int(under_match.group(1))
    elif exact_match:
        val = int(exact_match.group(1))
        min_p, max_p = val, val
    elif any(k in query for k in ["安い", "最安", "格安"]):
        min_p, max_p = 0, 100
    elif query.isdigit() and int(query) in [80, 90, 100, 110, 120, 130, 140, 150, 170, 180, 190]:
        val = int(query)
        min_p, max_p = val, val

    if min_p is not None and max_p is not None:
        results_by_vm: Dict[str, List[Dict[str, Any]]] = {}
        for vm in VENDING_MACHINES_DB:
            for it in vm["items"]:
                it_min = it["price"]
                it_max = it.get("price_max", it_min)
                if not (it_max < min_p or it_min > max_p):
                    vm_title = f"{vm['building']} {vm['floor']}（{vm['brand']}）"
                    if vm_title not in results_by_vm:
                        results_by_vm[vm_title] = []
                    results_by_vm[vm_title].append(it)

        title = f"【{min_p}〜{max_p}円で買える商品】" if min_p != max_p else f"【{min_p}円で買える商品】"
        if not results_by_vm:
            return f"{title}\n該当する商品は見つかりませんでした。"

        lines = [title]
        for vm_title, items in results_by_vm.items():
            lines.append(f"\n■ {vm_title}:")
            for it in items:
                p_str = it.get("price_display", f"{it['price']}円")
                pos_info = f" ({it['pos']})" if "pos" in it else ""
                lines.append(f"・{it['name']} ({p_str}){pos_info}")
        return "\n".join(lines).strip()

    # 1.5. キャンパス施設 営業時間案内
    if any(k in q_lower for k in ["図書館", "図書室", "本を借りる", "地下書庫"]):
        return (
            "【日本大学文理学部図書館（図書館棟）営業時間】\n"
            "・月〜金（平日）：09:00 - 20:00\n"
            "・土曜日：09:00 - 19:00\n"
            "・日曜・祝日：休館（授業実施日を除く）\n"
            "※地下書庫への入庫および貸出手続きは閉館30分前までです。"
        )

    if any(k in q_lower for k in ["コンピュータセンター", "コンセ", "cc", "wifi", "wi-fi", "学内pc", "パソコン室"]):
        return (
            "【コンピュータセンター受付（3号館）営業時間】\n"
            "・月〜金（平日）：09:00 - 18:00\n"
            "・土曜日：09:00 - 13:00\n"
            "・日曜・祝日：休業\n"
            "※アカウント発行や学内Wi-Fi（CHS-Wi-Fi）の問い合わせ・トラブル対応を行っています。"
        )

    if any(k in q_lower for k in ["ラーニングコモンズ", "ラーニング・コモンズ", "コモンズ", "lc"]):
        return (
            "【ラーニング・コモンズ（本館1階）営業時間】\n"
            "・月〜金（平日）：08:00 - 18:00（サポートデスク対応 10:00 - 18:00）\n"
            "・土曜日：08:00 - 17:00（サポートデスク対応 09:00 - 13:00）\n"
            "・日曜・祝日：休館\n"
            "※グループ学習や自習、PC利用、プレゼン準備に利用できます。"
        )

    if any(k in q_lower for k in ["教務", "教務課", "事務", "事務窓口", "証明書", "学務"]):
        return (
            "【事務窓口・教務課等（本館1階事務室）受付時間】\n"
            "・月〜金（平日）：09:00 - 17:00\n"
            "・土曜日：09:00 - 13:00\n"
            "・日曜・祝日：休み\n"
            "※履修相談や各種届出を受付。証明書自動発行機は閉口15分前まで利用可能です。"
        )

    if any(k in q_lower for k in ["資料館", "博物館"]):
        return (
            "【日本大学文理学部資料館（8号館）開館時間】\n"
            "・月〜金（平日）：10:00 - 17:00\n"
            "・土曜日：10:00 - 13:00\n"
            "・日曜・祝日：休館（入館無料）\n"
            "※考古・歴史・民俗・学術資料等の展示を行っています。"
        )

    # 1.6. 履修・卒業ナビ ＆ 6コース科目案内
    if any(k in q_lower for k in ["教職", "教員免許"]):
        return (
            "【教職コース（全学科共通）】\n"
            "・概要: 中学校・高等学校教諭一種免許状（全学科共通）や特別支援学校教諭免許状（教育学科のみ）の取得を目指すコースです。\n"
            "・申請・相談窓口: **教職センター**（本館）\n"
            "※コース科目の修得単位は卒業要件の「自由選択区分」に算入可能です（各教科教育法・実習・実践演習等の一部実習科目を除く）。"
        )

    if "司書教諭" in q_lower:
        return (
            "【司書教諭コース（全学科共通）】\n"
            "・概要: 小・中・高等学校等の学校図書館で専門業務に従事する教諭資格です。\n"
            "・申請・相談窓口: **教職センター**（本館）\n"
            "※教員免許状の取得が前提となります。修得単位は「自由選択区分」に算入可能です。"
        )

    if any(k in q_lower for k in ["司書コース", "司書資格", "図書館司書"]):
        return (
            "【司書コース（全学科共通）】\n"
            "・概要: 公共図書館や専門機関で図書・資料の収集・分類・情報サービスを行う専門資格です。\n"
            "・申請・相談窓口: **教務課**（本館1階事務室）\n"
            "※修得単位は「自由選択区分」に算入可能です。GPA算出対象に含まれます。"
        )

    if any(k in q_lower for k in ["学芸員", "博物館学芸員"]):
        return (
            "【学芸員コース（全学科共通）】\n"
            "・概要: 博物館・美術館・資料館などで資料の収集・保管・展示・調査研究を行う国家資格です。\n"
            "・申請・相談窓口: **教務課**（本館1階事務室）\n"
            "※修得単位は「自由選択区分」に算入可能。3・4年次に資料館実習等があります。"
        )

    if any(k in q_lower for k in ["社会教育", "社会教育主事", "社会教育士"]):
        return (
            "【社会教育主事コース（全学科共通）】\n"
            "・概要: 公民館や生涯学習施設で市民の学習活動支援や地域コミュニティ形成を支援する指導者資格です。\n"
            "・申請・相談窓口: **教務課**（本館1階事務室）\n"
            "※修得単位は「自由選択区分」に算入可能です。"
        )

    if any(k in q_lower for k in ["日本語教育", "日本語教員"]):
        return (
            "【日本語教育コース（全学科共通）】\n"
            "・概要: 国内外で外国人留学生や学習者に日本語を教える専門知識・指導法を修得するコースです。\n"
            "・申請・相談窓口: **教務課**（本館1階事務室）\n"
            "※修得単位は「自由選択区分」に算入可能です。"
        )

    if any(k in q_lower for k in ["卒業要件", "卒業要件単位", "卒業単位", "何単位で卒業"]):
        return (
            "【日本大学文理学部 卒業要件単位】\n"
            "・卒業必要単位数: 全18学科共通で **124単位** です。\n"
            "・主要科目区分:\n"
            "  - 全学共通（総合体育等）：2単位必修\n"
            "  - 総合教育科目：12単位必修\n"
            "  - 外国語教育科目：8〜18単位（学科により異なる）\n"
            "  - 基礎教育科目：5単位必修\n"
            "  - 学科専門教育科目（必修・選択）\n"
            "  - 自由選択区分（6コース科目等の単位算入可能）\n\n"
            "現在の修得単位数を「情報科学科 80単位」のように入力していただければ、残り必要単位数とアドバイスを回答します！"
        )

    # 2. 給水所・ゴミ箱・トイレ・決済等の設備検索
    if any(k in q_lower for k in ["給水", "冷水機", "ウォーターサーバー"]):
        return (
            "【構内 給水所（冷水機）のご案内】\n"
            "・**4号館 1階 エントランスホールのみ使用可能**！マイボトルへの給水が可能です。\n"
            "⚠️ 注意: 4号館の2階・3階・4階の給水所は現在使用不可となっています。1階をご利用ください。"
        )

    if any(k in q_lower for k in ["ゴミ箱", "ごみ箱", "ゴミ", "ごみ"]):
        return (
            "【ゴミ箱の設置場所】\n"
            "・**1号館**：各階に設置\n"
            "・**3号館**：各階に設置\n"
            "・**4号館**：各階トイレ前に設置\n"
            "⚠️ 注意: **2号館内にはゴミ箱および自動販売機は設置されていません**。他号館をご利用ください。"
        )

    if any(k in q_lower for k in ["トイレ", "お手洗い", "化粧室", "便所"]):
        return (
            "【トイレ位置関係ガイド】\n"
            "■ **1号館**:\n"
            "・1階: 正面入って左手前＝女子トイレ、左奥＝男子トイレ、右手前奥＝男子トイレ\n"
            "・2階: 左奥＝女子トイレ、右手前＝男子トイレ、右奥＝女子トイレ\n"
            "・3階: 左奥＝男子トイレ、右奥＝女子トイレ\n"
            "⚠️ **4階・5階にはトイレがありません**（2階または3階をご利用ください）\n\n"
            "■ **3号館（全階共通）**:\n"
            "・下2桁 `01〜05`: **男子トイレ側**（エスカレーター出て右 / エレベーター出て左）\n"
            "・下2桁 `06〜10`: **女子トイレ側**（エスカレーター出て左 / エレベーター出て右）\n\n"
            "■ **4号館**:\n"
            "・1階: 左側＝男子トイレ、右側＝女子トイレ\n"
            "・2階: 左側＝男子トイレ、右側＝女子トイレ\n"
            "・3階: 右側＝男子トイレ、左側＝女子トイレ\n"
            "・4階: 右側（手前442/奥441）＝男子側、左側（手前443/奥444）＝女子側\n"
            "※4号館は各階トイレ前にゴミ箱が設置されています。"
        )

    if any(k in q_lower for k in ["クレカ", "クレジットカード", "タッチ決済", "コンタクトレス", "カード"]):
        return (
            "【クレジットカード（タッチ決済）が使える自販機】\n"
            "・**場所**: 3号館 1階（食堂側・コカ・コーラ赤自販機）\n"
            "・**決済アプリ**: Coke ON（Coke ON Pay）\n"
            "・**対応カード**: Visa、Mastercard 等のクレジットカードタッチ決済に対応しています！\n"
            "※サントリー自販機は物理カード直タッチ不可ですが、ジハンピ連携のPayPay等で決済可能です。"
        )

    if any(k in q_lower for k in ["paypay", "ペイペイ", "交通系ic", "suica", "pasmo", "ジハンピ", "coke on", "決済", "支払い"]):
        return (
            "【自動販売機の決済方法・対応アプリ一覧】\n"
            "■ **4号館 1階 サントリー自販機**:\n"
            "・アプリ: ジハンピ\n"
            "・決済: PayPay〇、交通系IC（モバイル）〇、※物理カード直タッチ×（現金〇）\n\n"
            "■ **3号館 1階 サントリー自販機（計3台: 白水メイン、白スポーツ/エナジー、青）**:\n"
            "・アプリ: ジハンピ\n"
            "・決済: PayPay〇、交通系IC（モバイル）〇、※物理カード直タッチ×（現金〇）\n\n"
            "■ **3号館 1階 コカ・コーラ赤自販機**:\n"
            "・アプリ: Coke ON（Coke ON Pay）\n"
            "・決済: クレジットカードタッチ決済（Visa/Mastercard）〇、PayPay〇、交通系IC（モバイル）〇、※物理交通系IC直タッチ×（現金〇）"
        )

    curriculum = user_profile.get("admissionYear") if user_profile else None

    # 2.1. リアルタイム空き教室・自習スポット検索
    if any(k in q_lower for k in ["空き教室", "空いてる教室", "空いている教室", "自習室", "自習スポット", "自習できる", "いま空い", "今空い", "教室空い"]):
        day_match = None
        for d in ["月", "火", "水", "木", "金", "土"]:
            if f"{d}曜" in query or d in query:
                day_match = d
                break
        period_match = None
        for p in range(1, 6):
            if f"{p}限" in query or f"{p}コマ" in query:
                period_match = p
                break
        building_match = None
        for b in ["1号館", "2号館", "3号館", "4号館"]:
            if b in query or b[0] + "号館" in query:
                building_match = b
                break
        return py_find_free_rooms(day_match, period_match, building_match, curriculum)

    # 2.2. キャンパス移動・10分休みの最適化ナビ
    if any(k in q_lower for k in ["移動", "10分休み", "間に合う", "から", "ルート", "行き方"]):
        rooms_found = re.findall(r"([1-4]\d{2,3}[a-zA-Z]?)", query)
        if len(rooms_found) >= 2:
            return py_calculate_transit(rooms_found[0], rooms_found[1])

    # 2.3. 教室の利用スケジュール
    if any(k in q_lower for k in ["何限に使われ", "何限", "教室の予定", "教室の利用", "利用状況", "使われてる", "使用スケジュール"]):
        m_r = re.search(r"([1-4]\d{2,3}[a-zA-Z]?)", query)
        if m_r:
            day_match = None
            for d in ["月", "火", "水", "木", "金", "土"]:
                if f"{d}曜" in query or d in query:
                    day_match = d
                    break
            return py_get_room_daily_schedule(m_r.group(1), day_match, curriculum)

    # 2.4. 履修登録サポート＆「空きコマ」活用提案
    if any(k in q_lower for k in ["空きコマ", "空いてるコマ", "コマを埋め", "埋めたい", "おすすめの総合", "コマに入る"]):
        day_match = "火"
        for d in ["月", "火", "水", "木", "金", "土"]:
            if f"{d}曜" in query or d in query:
                day_match = d
                break
        period_match = 3
        for p in range(1, 6):
            if f"{p}限" in query or f"{p}コマ" in query:
                period_match = p
                break
        cat = "総合" if "総合" in query else "外国語" if "外国語" in query else "基礎" if "基礎" in query else ""
        return py_suggest_courses_for_free_period(day_match, period_match, cat, curriculum)

    # 2.5. 時間割重複（バッティング）チェック
    if any(k in q_lower for k in ["被っ", "重複", "バッティング", "重なって"]):
        db = get_lecture_database(curriculum)
        candidate_courses = []
        for c in db:
            c_name = c.get("name", "")
            if c_name and c_name in query and c_name not in candidate_courses:
                candidate_courses.append(c_name)
        if len(candidate_courses) >= 2:
            return py_check_course_conflicts(candidate_courses, curriculum)

    # 2.6. 学部要覧連動「必修組み込み済みの自動スケジュール提案」
    if any(k in q_lower for k in ["時間割作って", "時間割提案", "スケジュール作って", "おすすめの時間割", "必修時間割", "基本時間割", "時間割を組んで"]):
        dept = user_profile.get("department", "情報科学科") if user_profile else "情報科学科"
        grade = user_profile.get("grade", 1) if user_profile else 1
        return py_propose_automatic_schedule(dept, grade, curriculum)

    # 2.7. 講義・教員名の逆引き検索
    if len(query) >= 2 and any(k in query for k in ["先生", "教授", "講義", "授業", "開講", "何曜"]):
        clean_q = re.sub(r"(先生|教授|講義|授業|って|何曜|何限|いつ|どこ|教えて|の)", "", query).strip()
        if len(clean_q) >= 2:
            db = get_lecture_database(curriculum)
            hits = [c for c in db if clean_q in c.get("name", "") or clean_q in c.get("teacher", "")]
            if hits:
                cur_label = "（令和6年度以前入学者向け旧カリDB参照）" if curriculum == "reiwa6_or_earlier" else "（令和7年度以降入学者向け新カリDB参照）"
                lines = [f"🔍 **【講義・教員 逆引き検索結果: 『{clean_q}』】** {cur_label}", ""]
                for h in hits[:8]:
                    room_lbl = get_room_short_label(h.get("room", ""))
                    lines.append(f"・**{h['name']}**（担当：{h['teacher']} 先生）")
                    lines.append(f"  時間: **{h['day']}曜 {h['period']}限** | 教室: **{room_lbl}** | 所属: {h.get('department', 'CHS')}")
                return "\n".join(lines).strip()

    # 3. 教室番号直接入力判定（「421」「3505」「124」等の直打ち・質問）
    m_room = re.search(r"([1-4]\d{2,3}[a-zA-Z]?)", query)
    if m_room:
        r = m_room.group(1).upper()
        short_label = get_room_short_label(r)
        
        # 4号館
        if r == "411":
            detail = "4号館411教室は 4号館 1階 です。正面を入って左側（男子トイレ側）にあります。給水所（冷水機）が利用可能です。トイレ前にゴミ箱が設置されています。"
        elif r == "412":
            detail = "4号館412教室は 4号館 1階 です。正面を入って右側（女子トイレ側）にあります。給水所（冷水機）が利用可能です。トイレ前にゴミ箱が設置されています。"
        elif r == "421":
            detail = "4号館421教室は 4号館 2階 です。階段を登って左側（男子トイレ側）にあります。トイレ前にゴミ箱が設置されています。（※給水所は1階のみ使用可）"
        elif r == "422":
            detail = "4号館422教室は 4号館 2階 です。階段を登って右側（女子トイレ側）にあります。トイレ前にゴミ箱が設置されています。（※給水所は1階のみ使用可）"
        elif r == "431":
            detail = "4号館431教室は 4号館 3階 です。階段を登って右側（男子トイレ側）にあります。トイレ前にゴミ箱が設置されています。（※給水所は1階のみ使用可）"
        elif r == "432":
            detail = "4号館432教室は 4号館 3階 です。階段を登って左側（女子トイレ側）にあります。トイレ前にゴミ箱が設置されています。（※給水所は1階のみ使用可）"
        elif r == "441":
            detail = "4号館441教室は 4号館 4階 です。階段を登って右側奥（男子トイレ側・奥）にあります。手前が442教室です。トイレ前にゴミ箱が設置されています。（※給水所は1階のみ使用可）"
        elif r == "442":
            detail = "4号館442教室は 4号館 4階 です。階段を登って右側手前（男子トイレ側・手前）にあります。奥が441教室です。トイレ前にゴミ箱が設置されています。（※給水所は1階のみ使用可）"
        elif r == "443":
            detail = "4号館443教室は 4号館 4階 です。階段を登って左側手前（女子トイレ側・手前）にあります。奥が444教室です。トイレ前にゴミ箱が設置されています。（※給水所は1階のみ使用可）"
        elif r == "444":
            detail = "4号館444教室は 4号館 4階 です。階段を登って左側奥（女子トイレ側・奥）にあります。手前が443教室です。トイレ前にゴミ箱が設置されています。（※給水所は1階のみ使用可）"
        elif r.startswith("3") and len(r) == 4:
            fl = r[1]
            sub = int(r[2:])
            if 1 <= sub <= 5:
                detail = f"{r}教室は 3号館 {fl}階 の {r}教室 です。エスカレーターを出て右側（エレベーターを出て左側）の 男子トイレ側 にあります。ゴミ箱は各階に設置されています。"
            elif 6 <= sub <= 10:
                detail = f"{r}教室は 3号館 {fl}階 の {r}教室 です。エスカレーターを出て左側（エレベーターを出て右側）の 女子トイレ側 にあります。ゴミ箱は各階に設置されています。"
            else:
                detail = f"{r}教室は 3号館 {fl}階 の {r}教室 です。ゴミ箱は各階に設置されています。"
        elif r in ["122", "123", "124"]:
            detail = f"1号館{r}教室は 1号館 2階 です。階段を登って左側（奥に女子トイレ）にあります。ゴミ箱は各階に設置されています。"
        elif r in ["125", "126", "127A", "127B"]:
            detail = f"1号館{r}教室は 1号館 2階 です。階段を登って右側（手前に男子トイレ、奥に女子トイレ）にあります。ゴミ箱は各階に設置されています。"
        elif r == "130":
            detail = "1号館130教室は 1号館 3階 です。階段を登って正面にあります（左奥に男子トイレ、右奥に女子トイレ）。ゴミ箱は各階に設置されています。"
        elif r in ["131", "132", "133", "134", "138"]:
            detail = f"1号館{r}教室は 1号館 3階 です。階段を登って左側（奥に男子トイレ）にあります。ゴミ箱は各階に設置されています。"
        elif r in ["135", "136", "137A", "137B", "139"]:
            detail = f"1号館{r}教室は 1号館 3階 です。階段を登って右側（奥に女子トイレ）にあります。ゴミ箱は各階に設置されています。"
        elif r == "141":
            detail = "1号館141教室は 1号館 4階 です。階段を登って正面にあります。※注意：1号館の4階・5階にはトイレがありませんので、2階または3階のトイレをご利用ください。ゴミ箱は各階に設置されています。"
        elif r == "151":
            detail = "1号館151教室は 1号館 5階 です。階段を登って正面にあります。※注意：1号館の4階・5階にはトイレがありませんので、2階または3階のトイレをご利用ください。ゴミ箱は各階に設置されています。"
        elif r.startswith("2") and len(r) == 4:
            detail = f"2号館{r}教室は 2号館 {r[1]}階 です。※注意：2号館内には自動販売機およびゴミ箱は設置されていませんので他号館をご利用ください。"
        else:
            detail = f"{r}教室はキャンパス構内にあります。詳細は各号館のフロア案内板をご確認ください。"

        return f"表示用：{short_label}\n詳細案内：{detail}"

    # 4. 商品名・ドリンク検索（「コーラ」「レッドブル」「天然水」など）
    if any(k in q_lower for k in ["コーラ", "ペプシ", "coca", "pepsi"]):
        return (
            "【コカ・コーラ（140円）】\n"
            "場所：3号館 1階（食堂側・コカ・コーラ赤自販機）\n"
            "決済：Coke ON（PayPay、交通系IC）、クレジットカードタッチ決済\n\n"
            "【ペプシコーラ生（100円）】\n"
            "場所：3号館 1階（食堂側・サントリー青自販機）\n"
            "決済：ジハンピ（PayPay、交通系IC）"
        )

    if any(k in q_lower for k in ["レッドブル", "red bull", "redbull"]):
        return (
            "【レッドブル（170円）】※学内格安！\n"
            "・4号館 1階（サントリー自販機 中段）/ アプリ：ジハンピ\n"
            "・3号館 1階（食堂側・白スポーツ/エナジー系自販機）/ アプリ：ジハンピ\n"
            "・3号館 1階（食堂側・青自販機）/ アプリ：ジハンピ\n"
            "決済：PayPay〇、交通系IC（モバイル）〇、※物理カード直タッチ×、現金〇"
        )

    if any(k in q_lower for k in ["天然水", "いろはす", "い・ろ・は・す", "ミネラルウォーター"]) or (q_lower == "水" or "お水" in q_lower):
        return (
            "【サントリー天然水（80円）】※学内最安値！\n"
            "場所：\n"
            "・4号館 1階（サントリー自販機 上段）\n"
            "・3号館 1階（食堂側・サントリー白・水メイン自販機）\n"
            "決済：アプリ「ジハンピ」連携（PayPay、モバイル交通系IC、現金）\n\n"
            "【い・ろ・は・す（100〜110円）】\n"
            "場所：3号館 1階（食堂側・コカ・コーラ赤自販機）\n"
            "決済：Coke ON（PayPay、モバイル交通系IC）、クレジットカードタッチ決済"
        )

    if any(k in q_lower for k in ["モンスター", "monster", "zone", "ゾーン", "エナジー"]):
        return (
            "【エナジードリンク一覧】\n"
            "■ ZONe スカッと透明 / NOPE（80円）：※激安エナジー！\n"
            "  ・4号館 1階（スカッと透明 / ジハンピ）\n"
            "  ・3号館 1階 青自販機（NOPE / ジハンピ）\n"
            "■ レッドブル（170円）：※コンビニよりお得！\n"
            "  ・4号館 1階、3号館 1階（白スポーツ、青自販機）\n"
            "■ モンスターエナジー各種（180〜190円）：\n"
            "  ・3号館 1階 食堂側（白・スポーツ/エナジー系自販機）"
        )

    if any(k in q_lower for k in ["麦茶", "緑茶", "お茶", "伊右衛門", "綾鷹", "ほうじ茶", "焙じ茶"]):
        return (
            "【お茶・麦茶ラインナップ】\n"
            "■ やさしい麦茶（90円）：4号館1階（上段）、3号館1階（白水・白スポーツ）\n"
            "■ サントリー緑茶 伊右衛門（100〜110円）：4号館1階、3号館1階（白水）\n"
            "■ 綾鷹 / やかんの麦茶（110円）：3号館1階（コカ・コーラ赤自販機・クレカ決済可）\n"
            "■ 伊右衛門 焙じ茶（100円）：4号館1階、3号館1階"
        )

    if any(k in q_lower for k in ["コーヒー", "珈琲", "ボス", "boss", "ジョージア", "カフェオレ"]):
        return (
            "【コーヒー・カフェ飲料】\n"
            "■ BOSS各種（90〜140円）：3号館1階（白水、青自販機）、4号館1階（プレミアムボス130円）\n"
            "■ ジョージア各種（90〜110円）：3号館1階（コカ・コーラ赤自販機）\n"
            "■ リプトン 白の贅沢ミルクティー（110円）：4号館1階、3号館1階（白水）\n"
            "■ 紅茶花伝 ミルクティー（110円）：3号館1階（赤自販機）"
        )

    if any(k in q_lower for k in ["プリン", "プリン缶"]):
        return (
            "【ぷるぷるプリン缶（100円）】\n"
            "場所：3号館 1階 食堂側（サントリー白・水メイン、白・スポーツ系）\n"
            "決済：アプリ「ジハンピ」連携（PayPay、モバイル交通系IC、現金）"
        )

    # 5. 講義検索（科目名・教員名）
    if CHS_LECTURE_DATABASE and len(query) >= 2:
        user_day = None
        user_period = None
        for d in ["月", "火", "水", "木", "金", "土"]:
            if f"{d}曜" in query or d in query:
                user_day = d
                break
        for p in range(1, 6):
            if f"{p}限" in query or f"{p}コマ" in query:
                user_period = p
                break

        clean_q = re.sub(r"(月|火|水|木|金|土)曜?(日)?", "", query)
        clean_q = re.sub(r"[1-5]限(目|コマ)?", "", clean_q)
        clean_q = re.sub(r"(教室|どこ|何限|いつ|教えて|誰|先生|講義|授業)", "", clean_q)
        clean_q = re.sub(r"^[の\s]+|[の\s]+$", "", clean_q).strip()

        if len(clean_q) >= 2:
            matches = [
                c for c in CHS_LECTURE_DATABASE
                if clean_q.lower() in c.get("name", "").lower() or clean_q.lower() in c.get("teacher", "").lower()
            ]

            if matches:
                suggestion = ""
                if user_day or user_period:
                    exact = [
                        c for c in matches
                        if (not user_day or c["day"] == user_day) and (not user_period or c["period"] == user_period)
                    ]
                    if not exact:
                        best = matches[0]
                        suggestion = f"⚠️ もしかして {best['day']}曜{best['period']}限 の『{best['name']}』（担当：{best['teacher']} 先生）ですか？\n\n"

                lines = []
                if suggestion:
                    lines.append(suggestion)
                lines.append(f"【講義検索結果: {clean_q}】")
                for c in matches[:6]:
                    room_lbl = get_room_short_label(c.get("room", ""))
                    lines.append(f"・{c['name']}（{c['teacher']}）| {c['day']}曜{c['period']}限 | {room_lbl}")
                return "\n".join(lines).strip()

    # 6. 定型案内
    return (
        "【キャンパス構内ナビゲーターAI】\n"
        "教室番号（3505、421、124等）、自販機商品（コーラ、レッドブル、天然水等）、価格帯（80円、100~110円等）、設備（給水所、ゴミ箱、トイレ、クレカ決済）について直接入力すると即座にご案内します。\n\n"
        "質問例:\n"
        "• 「3505」または「421」\n"
        "• 「コーラ」または「レッドブル」\n"
        "• 「80円」または「100~110円」\n"
        "• 「給水所」または「ゴミ箱」\n"
        "• 「クレカ」または「PayPay」"
    )

@app.get("/api/chat")
def get_chat_status():
    server_key = os.environ.get("GEMINI_API_KEY", "").strip()
    return {
        "hasServerKey": bool(server_key),
        "availableModels": [
            "gemini-1.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro"
        ]
    }

@app.post("/api/chat")
def unified_chat(req: ChatRequest):
    q = (req.query or "").strip()
    api_k = (req.apiKey or os.environ.get("GEMINI_API_KEY", "")).strip()
    if api_k:
        gemini_reply, model_name, err_msg = call_gemini_api(q, req.history or [], api_k, req.image, req.userProfile, req.imageType)
        if gemini_reply:
            profile_update = None
            m = re.search(r"```profile_update\s*([\s\S]*?)\s*```", gemini_reply)
            if m:
                try:
                    profile_update = json.loads(m.group(1))
                except Exception:
                    pass
            return {
                "reply": gemini_reply,
                "source": "gemini",
                "model": model_name,
                "profileUpdate": profile_update
            }
        else:
            local_reply = answer_navigator_query(q, req.userProfile)
            return {
                "reply": f"⚠️ 【Gemini API接続エラー: {err_msg or '応答なし'}】\nAPIキーの有効性をご確認ください。画面右上の「⚙️ API設定」からキーを再入力・更新できます。\n\n（※公式要覧ナレッジエンジンにより即時回答します）\n\n{local_reply}",
                "source": "local"
            }

    reply = answer_navigator_query(q, req.userProfile)
    return {"reply": reply, "source": "local"}

@app.post("/api/navigator/chat")
def navigator_chat(req: ChatRequest):
    return unified_chat(req)