// 日本大学文理学部 資格6コース・全24副専攻 公式必修・選択必修科目完全ナレッジベース

export interface CourseOrMinorItem {
  name: string;
  credits: number;
  category: '必修' | '選択必修';
  group?: string;
  note?: string;
}

export interface CourseCurriculumDef {
  name: string;
  requiredCredits: number;
  target: string;
  window: string;
  page: string;
  description: string;
  requiredCourses: CourseOrMinorItem[];
  electiveRequiredCourses: CourseOrMinorItem[];
}

export interface MinorCurriculumDef {
  name: string;
  type: 'department' | 'interdisciplinary';
  targetDept: string;
  creditsReq: number;
  window: string;
  page: string;
  description: string;
  requiredCourses: CourseOrMinorItem[];
  electiveRequiredCourses: CourseOrMinorItem[];
}

export const VERIFIED_COURSES_CURRICULUM: Record<string, CourseCurriculumDef> = {
  "司書教諭コース": {
    "name": "司書教諭コース",
    "requiredCredits": 10,
    "target": "全学科生（教職課程履修者が対象）",
    "window": "教務課 資格窓口",
    "page": "p.142",
    "description": "5科目・計10単位すべて必修です。",
    "requiredCourses": [
      {
        "name": "学校経営と学校図書館",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "学校図書館メディアの構成",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "学習指導と学校図書館",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "読書と豊かな人間性",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "情報メディアの活用",
        "credits": 2,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": []
  },
  "司書コース": {
    "name": "司書コース",
    "requiredCredits": 26,
    "target": "全学科生",
    "window": "教務課 資格窓口",
    "page": "p.146",
    "description": "必修22単位＋選択必修4単位＝計26単位以上が必要です。",
    "requiredCourses": [
      {
        "name": "生涯学習論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "読書と豊かな人間性",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "図書館情報学概論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "図書館制度・経営論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "図書館情報技術論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "図書館サービス概論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "図書館情報資源概論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "情報サービス論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "情報資源組織論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "図書館基礎特論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "情報サービス演習1",
        "credits": 1,
        "category": "必修"
      },
      {
        "name": "情報サービス演習2",
        "credits": 1,
        "category": "必修"
      },
      {
        "name": "情報資源組織演習1",
        "credits": 1,
        "category": "必修"
      },
      {
        "name": "情報資源組織演習2",
        "credits": 1,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": [
      {
        "name": "図書館サービス特論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "図書館情報資源特論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "児童サービス論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "情報検索演習",
        "credits": 2,
        "category": "選択必修"
      }
    ]
  },
  "学芸員コース": {
    "name": "学芸員コース",
    "requiredCredits": 38,
    "target": "全学科生",
    "window": "教務課 資格窓口 / 史学科事務室",
    "page": "p.150",
    "description": "必修22単位＋選択科目16単位以上＝計38単位以上が必要です。",
    "requiredCourses": [
      {
        "name": "博物館概論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "博物館経営論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "博物館資料論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "博物館資料保存論1",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "博物館資料保存論2",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "博物館情報・メディア論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "博物館展示論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "博物館教育論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "博物館実習1（学内）",
        "credits": 1,
        "category": "必修"
      },
      {
        "name": "博物館実習2（学内）",
        "credits": 1,
        "category": "必修"
      },
      {
        "name": "博物館実習3（見学）",
        "credits": 1,
        "category": "必修"
      },
      {
        "name": "博物館実習4（館務）",
        "credits": 1,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": [
      {
        "name": "考古学概論1",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "考古学概論2",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "美術史概論1",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "美術史概論2",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "文化人類学概論1",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "文化人類学概論2",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "自然科学史",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "民俗学概論1",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "民俗学概論2",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "保存科学概論",
        "credits": 2,
        "category": "選択必修"
      }
    ]
  },
  "社会教育主事コース": {
    "name": "社会教育主事コース",
    "requiredCredits": 25,
    "target": "全学科生（社会教育士称号取得）",
    "window": "教務課 資格窓口 / 教育学科事務室",
    "page": "p.156",
    "description": "必修17単位＋選択科目8単位以上＝計25単位以上が必要です。",
    "requiredCourses": [
      {
        "name": "生涯学習論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "生涯学習支援論1",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "生涯学習支援論2",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "社会教育経営論1",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "社会教育経営論2",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "社会教育演習1",
        "credits": 1,
        "category": "必修"
      },
      {
        "name": "社会教育演習2",
        "credits": 1,
        "category": "必修"
      },
      {
        "name": "社会教育実習",
        "credits": 1,
        "category": "必修"
      },
      {
        "name": "社会教育論",
        "credits": 2,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": [
      {
        "name": "地域社会論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "行政学",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "福祉社会論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "情報社会論",
        "credits": 2,
        "category": "選択必修"
      }
    ]
  },
  "日本語教育コース": {
    "name": "日本語教育コース",
    "requiredCredits": 26,
    "target": "全学科生",
    "window": "国文学科事務室 / 教務課",
    "page": "p.162",
    "description": "必修11単位＋選択必修2単位＋選択科目13単位以上＝計26単位以上が必要です。",
    "requiredCourses": [
      {
        "name": "日本語教育学概論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "日本語教育のための日本語学",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "日本語教授法",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "社会言語学",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "日本語教育実習",
        "credits": 3,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": [
      {
        "name": "多言語・多文化社会と日本語教育",
        "credits": 2,
        "category": "選択必修",
        "group": "選択必修（2単位）"
      },
      {
        "name": "異文化理解と日本語学習",
        "credits": 2,
        "category": "選択必修",
        "group": "選択必修（2単位）"
      },
      {
        "name": "日本語文法論1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "日本語文法論2",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "日本語音声学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "対照言語学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "第二言語習得論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      }
    ]
  },
  "特別支援学校教諭免許状": {
    "name": "特別支援学校教諭免許状",
    "requiredCredits": 30,
    "target": "教育学科生対象",
    "window": "教育学科事務室 / 教務課",
    "page": "p.170",
    "description": "必修科目30単位が必要です。",
    "requiredCourses": [
      {
        "name": "特別支援教育総論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "特別ニーズ教育の原理と歴史",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "知的障害者の心理・生理・病理",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "肢体不自由者の心理・生理・病理",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "病弱者の心理・生理・病理",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "知的障害教育論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "肢体不自由教育論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "病弱教育論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "特別支援教育演習",
        "credits": 1,
        "category": "必修"
      },
      {
        "name": "教育実習（特別支援学校）事前・事後指導",
        "credits": 1,
        "category": "必修"
      },
      {
        "name": "教育実習（特別支援学校）",
        "credits": 2,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": []
  }
};

export const VERIFIED_MINORS_CURRICULUM: Record<string, MinorCurriculumDef> = {
  "哲学副専攻": {
    "name": "哲学副専攻",
    "type": "department",
    "targetDept": "哲学科",
    "creditsReq": 16,
    "window": "哲学科事務室 / 教務課",
    "page": "p.180",
    "description": "a群から4単位以上、b群から2単位以上を含み、計16単位以上修得。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "思想史1",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "思想史2",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "思想史3",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "思想史4",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "思想史5",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "思想史6",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "思想史7",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "思想史8",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "美学史1",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "美学史2",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "美学史3",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "美学史4",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "宗教史1",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "宗教史2",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "宗教史3",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "宗教史4",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "記号論理1",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "記号論理2",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "古典語・古典学1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "古典語・古典学2",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "古典語・古典学3",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "古典語・古典学4",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "古典語・古典学5",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "古典語・古典学6",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "古典語・古典学7",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "古典語・古典学8",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "哲学講読1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "哲学講読2",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "哲学講読3",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "哲学講読4",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "哲学講読5",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "哲学講読6",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "哲学講読7",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "哲学講読8",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "倫理学講読1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "倫理学講読2",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "倫理学講読3",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "倫理学講読4",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "美学講読1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "美学講読2",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "美学講読3",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "美学講読4",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "美学講読5",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "美学講読6",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "美学講読7",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "美学講読8",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "宗教学講読1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "宗教学講読2",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "宗教学講読3",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "宗教学講読4",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "哲学特殊講義1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "哲学特殊講義2",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "哲学特殊講義3",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "哲学特殊講義4",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "哲学特殊講義5",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "哲学特殊講義6",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "哲学特殊講義7",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "哲学特殊講義8",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "倫理学特殊講義1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "倫理学特殊講義2",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "倫理学特殊講義3",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "倫理学特殊講義4",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "倫理学特殊講義5",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "倫理学特殊講義6",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "倫理学特殊講義7",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "倫理学特殊講義8",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "美学特殊講義1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "美学特殊講義2",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "美学特殊講義3",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "美学特殊講義4",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "美学特殊講義5",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "美学特殊講義6",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "美学特殊講義7",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "美学特殊講義8",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "宗教学特殊講義1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "宗教学特殊講義2",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "宗教学特殊講義3",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "宗教学特殊講義4",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "宗教学特殊講義5",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "宗教学特殊講義6",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "宗教学特殊講義7",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "宗教学特殊講義8",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "教理学1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      },
      {
        "name": "教理学2",
        "credits": 2,
        "category": "選択必修",
        "group": "c群"
      }
    ]
  },
  "史学副専攻": {
    "name": "史学副専攻",
    "type": "department",
    "targetDept": "史学科",
    "creditsReq": 16,
    "window": "史学科事務室 / 教務課",
    "page": "p.181",
    "description": "研究法入門・講究・特講などの指定科目から計16単位以上修得。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "日本史研究法入門",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "東洋史研究法入門",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "西洋史研究法入門",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "考古学研究法入門",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "日本史講究",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "東洋史講究",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "西洋史講究",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "日本史特講1",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "日本史特講2",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "日本史特講3",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "日本史特講4",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "東洋史特講1",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "東洋史特講2",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "東洋史特講3",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "東洋史特講4",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "西洋史特講1",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "西洋史特講2",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "西洋史特講3",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "西洋史特講4",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "考古学特講1",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "考古学特講2",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "考古学特講3",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "考古学特講4",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      }
    ]
  },
  "日本語日本文学副専攻": {
    "name": "日本語日本文学副専攻",
    "type": "department",
    "targetDept": "国文学科",
    "creditsReq": 16,
    "window": "国文学科事務室 / 教務課",
    "page": "p.181",
    "description": "必修4科目8単位＋選択8単位以上＝計16単位以上修得。",
    "requiredCourses": [
      {
        "name": "日本語学入門1",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "日本語学入門2",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "日本文学入門1",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "日本文学入門2",
        "credits": 2,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": [
      {
        "name": "日本語文法論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "日本語文法史",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "日本語表記・音韻史",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "日本語語彙・文体史",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "日本語音声学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "社会言語学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "日本語の意味と語彙",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "日本語学史",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "上代文学史",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "中古文学史",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "中世文学史",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "近世文学史",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "近代文学史",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "現代文学史",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "上代文学講義",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "中古文学講義",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "中世文学講義",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "近世文学講義",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "近代文学講義",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "現代文学講義",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "書学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "文字文化研究",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      }
    ]
  },
  "現代文化副専攻": {
    "name": "現代文化副専攻",
    "type": "department",
    "targetDept": "国文学科",
    "creditsReq": 16,
    "window": "国文学科事務室 / 教務課",
    "page": "p.182",
    "description": "必修2科目4単位＋選択12単位以上＝計16単位以上修得。",
    "requiredCourses": [
      {
        "name": "文学とサブカルチャー",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "現代文学講義",
        "credits": 2,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": [
      {
        "name": "日本マンガ文化研究",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "大衆文化論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "アダプテーション研究",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "出版文化研究",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "芸能文化研究",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "児童文学・ライトノベル研究",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "ホラー・ミステリ研究",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "批評理論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "社会言語学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "言語学から見た世界",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "メディア論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "ジェンダー論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "演劇論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "映像文化論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "文学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "文化人類学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      }
    ]
  },
  "中国言語文化副専攻": {
    "name": "中国言語文化副専攻",
    "type": "department",
    "targetDept": "中国語中国文化学科",
    "creditsReq": 16,
    "window": "中国語中国文化学科事務室 / 教務課",
    "page": "p.182",
    "description": "a群から6単位以上、b群から4単位以上を含み、計16単位以上修得。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "中国語1",
        "credits": 1,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "中国語2",
        "credits": 1,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "中国語3",
        "credits": 1,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "中国語4",
        "credits": 1,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "中国語5",
        "credits": 1,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "中国語6",
        "credits": 1,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "中国語7",
        "credits": 1,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "中国語8",
        "credits": 1,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "中国語9",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "中国語10",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "中国語11",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "中国語12",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "中国語13",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "中国語14",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "中国学入門1",
        "credits": 1,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "中国学入門2",
        "credits": 1,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "中国学入門3",
        "credits": 1,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "中国学入門4",
        "credits": 1,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "中国文化論1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "中国文化論2",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "中国社会論1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "中国社会論2",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "中国ジェンダー論",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "アジアの文化と社会1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "アジアの文化と社会2",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "アジアの表象文化1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "アジアの表象文化2",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "映像文化論",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "アジアの歴史・社会・文化",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "異文化間コミュニケーション論",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "海外語学研修(中国語)",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      }
    ]
  },
  "英語英文学副専攻": {
    "name": "英語英文学副専攻",
    "type": "department",
    "targetDept": "英文学科",
    "creditsReq": 16,
    "window": "英文学科事務室 / 教務課",
    "page": "p.183",
    "description": "a群から4単位、b群から4単位、c群から4単位を含み、計16単位以上修得。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "異文化間コミュニケーション概論1",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位）"
      },
      {
        "name": "異文化間コミュニケーション概論2",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位）"
      },
      {
        "name": "イギリス社会論",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位）"
      },
      {
        "name": "アメリカ社会論",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位）"
      },
      {
        "name": "英語プレゼンテーション1",
        "credits": 1,
        "category": "選択必修",
        "group": "a群（4単位）"
      },
      {
        "name": "英語プレゼンテーション2",
        "credits": 1,
        "category": "選択必修",
        "group": "a群（4単位）"
      },
      {
        "name": "多読多聴英語1",
        "credits": 1,
        "category": "選択必修",
        "group": "a群（4単位）"
      },
      {
        "name": "多読多聴英語2",
        "credits": 1,
        "category": "選択必修",
        "group": "a群（4単位）"
      },
      {
        "name": "英語学概説1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位）"
      },
      {
        "name": "英語学概説2",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位）"
      },
      {
        "name": "英文法1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位）"
      },
      {
        "name": "英文法2",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位）"
      },
      {
        "name": "英語音声学1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位）"
      },
      {
        "name": "英語音声学2",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位）"
      },
      {
        "name": "英語史1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位）"
      },
      {
        "name": "英語史2",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位）"
      },
      {
        "name": "英語文学概説1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（4単位）"
      },
      {
        "name": "英語文学概説2",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（4単位）"
      },
      {
        "name": "イギリス文学史1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（4単位）"
      },
      {
        "name": "イギリス文学史2",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（4単位）"
      },
      {
        "name": "イギリス文学史3",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（4単位）"
      },
      {
        "name": "イギリス文学史4",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（4単位）"
      },
      {
        "name": "アメリカ文学史1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（4単位）"
      },
      {
        "name": "アメリカ文学史2",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（4単位）"
      },
      {
        "name": "文学・文化批評理論1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（4単位）"
      },
      {
        "name": "文学・文化批評理論2",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（4単位）"
      }
    ]
  },
  "ドイツ語ヨーロッパ文化副専攻": {
    "name": "ドイツ語ヨーロッパ文化副専攻",
    "type": "department",
    "targetDept": "ドイツ文学科",
    "creditsReq": 16,
    "window": "ドイツ文学科事務室 / 教務課",
    "page": "p.183",
    "description": "外国語教育科目から4単位、ドイツ文学科専門科目から12単位を含み、計16単位以上修得。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "ドイツ語1",
        "credits": 1,
        "category": "選択必修",
        "group": "外国語教育科目（4単位以上）"
      },
      {
        "name": "ドイツ語2",
        "credits": 1,
        "category": "選択必修",
        "group": "外国語教育科目（4単位以上）"
      },
      {
        "name": "ドイツ語3",
        "credits": 1,
        "category": "選択必修",
        "group": "外国語教育科目（4単位以上）"
      },
      {
        "name": "ドイツ語4",
        "credits": 1,
        "category": "選択必修",
        "group": "外国語教育科目（4単位以上）"
      },
      {
        "name": "ドイツ語5",
        "credits": 1,
        "category": "選択必修",
        "group": "外国語教育科目（4単位以上）"
      },
      {
        "name": "ドイツ語6",
        "credits": 1,
        "category": "選択必修",
        "group": "外国語教育科目（4単位以上）"
      },
      {
        "name": "ドイツ語7",
        "credits": 1,
        "category": "選択必修",
        "group": "外国語教育科目（4単位以上）"
      },
      {
        "name": "ドイツ語8",
        "credits": 1,
        "category": "選択必修",
        "group": "外国語教育科目（4単位以上）"
      },
      {
        "name": "ドイツ語9",
        "credits": 1,
        "category": "選択必修",
        "group": "外国語教育科目（4単位以上）"
      },
      {
        "name": "ドイツ語10",
        "credits": 1,
        "category": "選択必修",
        "group": "外国語教育科目（4単位以上）"
      },
      {
        "name": "ドイツ語コミュニケーション1",
        "credits": 1,
        "category": "選択必修",
        "group": "外国語教育科目（4単位以上）"
      },
      {
        "name": "ドイツ語コミュニケーション2",
        "credits": 1,
        "category": "選択必修",
        "group": "外国語教育科目（4単位以上）"
      },
      {
        "name": "ドイツ語コミュニケーション3",
        "credits": 1,
        "category": "選択必修",
        "group": "外国語教育科目（4単位以上）"
      },
      {
        "name": "ドイツ語コミュニケーション4",
        "credits": 1,
        "category": "選択必修",
        "group": "外国語教育科目（4単位以上）"
      },
      {
        "name": "海外語学研修(ドイツ語)",
        "credits": 2,
        "category": "選択必修",
        "group": "外国語教育科目（4単位以上）"
      },
      {
        "name": "ドイツ文学史講義3",
        "credits": 2,
        "category": "選択必修",
        "group": "専門科目（12単位以上）"
      },
      {
        "name": "ドイツ文学史講義4",
        "credits": 2,
        "category": "選択必修",
        "group": "専門科目（12単位以上）"
      },
      {
        "name": "ドイツ語学講義3",
        "credits": 2,
        "category": "選択必修",
        "group": "専門科目（12単位以上）"
      },
      {
        "name": "ドイツ語学講義4",
        "credits": 2,
        "category": "選択必修",
        "group": "専門科目（12単位以上）"
      },
      {
        "name": "ヨーロッパ・ドイツ文化講義3",
        "credits": 2,
        "category": "選択必修",
        "group": "専門科目（12単位以上）"
      },
      {
        "name": "ヨーロッパ・ドイツ文化講義4",
        "credits": 2,
        "category": "選択必修",
        "group": "専門科目（12単位以上）"
      },
      {
        "name": "時事ドイツ語リーディング1",
        "credits": 2,
        "category": "選択必修",
        "group": "専門科目（12単位以上）"
      },
      {
        "name": "時事ドイツ語リーディング2",
        "credits": 2,
        "category": "選択必修",
        "group": "専門科目（12単位以上）"
      },
      {
        "name": "ドイツ文学専門講義1",
        "credits": 2,
        "category": "選択必修",
        "group": "専門科目（12単位以上）"
      },
      {
        "name": "ドイツ文学専門講義2",
        "credits": 2,
        "category": "選択必修",
        "group": "専門科目（12単位以上）"
      },
      {
        "name": "ドイツ語学専門講義1",
        "credits": 2,
        "category": "選択必修",
        "group": "専門科目（12単位以上）"
      },
      {
        "name": "ドイツ語学専門講義2",
        "credits": 2,
        "category": "選択必修",
        "group": "専門科目（12単位以上）"
      },
      {
        "name": "ヨーロッパ・ドイツ語圏の文化と社会1",
        "credits": 2,
        "category": "選択必修",
        "group": "専門科目（12単位以上）"
      },
      {
        "name": "ヨーロッパ・ドイツ語圏の文化と社会2",
        "credits": 2,
        "category": "選択必修",
        "group": "専門科目（12単位以上）"
      },
      {
        "name": "ドイツ語表現演習インテンシヴ1",
        "credits": 2,
        "category": "選択必修",
        "group": "専門科目（12単位以上）"
      },
      {
        "name": "ドイツ語表現演習インテンシヴ2",
        "credits": 2,
        "category": "選択必修",
        "group": "専門科目（12単位以上）"
      }
    ]
  },
  "社会学副専攻": {
    "name": "社会学副専攻",
    "type": "department",
    "targetDept": "社会学科",
    "creditsReq": 16,
    "window": "社会学科事務室 / 教務課",
    "page": "p.184",
    "description": "基本科目・展開科目などの指定科目から計16単位以上修得。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "社会変動論",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "マス・コミュニケーション論",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "文化人類学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "現代家族論",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "都市と地域の社会学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "企業と働き方の社会学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "社会問題論",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "国際社会論",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "社会病理学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "ジャーナリズム論",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "流行の社会学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "メディアとファッションの社会学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "産業社会学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "経営戦略とビジネスモデルの社会学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "東京と東京人の社会学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "福祉社会学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "データサイエンス入門",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "スポーツの社会学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      }
    ]
  },
  "福祉社会システム副専攻": {
    "name": "福祉社会システム副専攻",
    "type": "department",
    "targetDept": "社会福祉学科",
    "creditsReq": 16,
    "window": "社会福祉学科事務室 / 教務課",
    "page": "p.184",
    "description": "必修1科目2単位＋選択14単位以上＝計16単位以上修得。",
    "requiredCourses": [
      {
        "name": "ソーシャルワークの理論と方法1",
        "credits": 2,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": [
      {
        "name": "ソーシャルワークの理論と方法2",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "障害者の理解",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "社会福祉法制",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "貧困に対する支援",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "スクールソーシャルワーク論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "国際社会福祉1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "国際社会福祉2",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "地域福祉の理論と方法1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "福祉政策論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "社会事業史",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "市民社会組織論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "家庭支援論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      }
    ]
  },
  "特別ニーズ教育副専攻": {
    "name": "特別ニーズ教育副専攻",
    "type": "department",
    "targetDept": "教育学科",
    "creditsReq": 16,
    "window": "教育学科事務室 / 教務課",
    "page": "p.185",
    "description": "必修1科目2単位＋選択14単位以上＝計16単位以上修得。",
    "requiredCourses": [
      {
        "name": "特別ニーズ教育の原理と歴史",
        "credits": 2,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": [
      {
        "name": "知的障害者の心理・生理・病理",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "肢体不自由者の心理・生理・病理",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "病弱者の心理・生理・病理",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "知的障害教育論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "肢体不自由教育論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "病弱教育論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "発達障害教育論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "発達障害者の心理・生理・病理",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "視覚障害教育総論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "聴覚障害教育総論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      }
    ]
  },
  "体育学副専攻": {
    "name": "体育学副専攻",
    "type": "department",
    "targetDept": "体育学科",
    "creditsReq": 16,
    "window": "体育学科事務室 / 教務課",
    "page": "p.185",
    "description": "体育学科専門指定科目から計16単位以上修得。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "体育学概論",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "保健学概論",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "トレーニング理論",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "スポーツバイオメカニクス",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "スポーツ運動学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "解剖学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "生理学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "衛生学及び公衆衛生学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "コーチ論",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "スポーツ教育学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "スポーツ社会学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "体育・スポーツ史",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "オリンピック・パラリンピック",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "スポーツ心理学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "機能解剖学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "運動生理学(基礎)",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "スポーツリハビリテーション",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "スポーツ栄養学",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "救急処置",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "測定評価",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "体育・スポーツ制度及び行政",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "体育経営管理",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "スポーツ医学(内科)",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      },
      {
        "name": "スポーツ医学(外科)",
        "credits": 2,
        "category": "選択必修",
        "group": "指定科目"
      }
    ]
  },
  "心理学副専攻": {
    "name": "心理学副専攻",
    "type": "department",
    "targetDept": "心理学科",
    "creditsReq": 16,
    "window": "心理学科事務室 / 教務課",
    "page": "p.186",
    "description": "必修4単位＋a群から4単位以上＋b群から8単位以上＝計16単位以上修得。",
    "requiredCourses": [
      {
        "name": "心理学",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "心の健康",
        "credits": 2,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": [
      {
        "name": "発達心理学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "社会・集団・家族心理学A",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "社会・集団・家族心理学B",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "感情・人格心理学A",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "感情・人格心理学B",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "知覚・認知心理学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "学習・言語心理学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "神経・生理心理学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "司法・犯罪心理学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "産業・組織心理学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "教育・学校心理学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "精神疾患とその治療",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "臨床心理学特講",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "カウンセリング特講",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "心理面接特講",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "認知心理学特講",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "社会心理学特講",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "生理心理学特講",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "環境心理学特講",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "健康心理学特講",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "臨床社会心理学特講",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "老年心理学特講",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      }
    ]
  },
  "地理学副専攻": {
    "name": "地理学副専攻",
    "type": "department",
    "targetDept": "地理学科",
    "creditsReq": 16,
    "window": "地理学科事務室 / 教務課",
    "page": "p.186",
    "description": "必修10単位＋a群から2単位以上＋b群から4単位以上＝計16単位以上修得。",
    "requiredCourses": [
      {
        "name": "自然地理学の基礎1",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "自然地理学の基礎2",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "人文地理学の基礎1",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "人文地理学の基礎2",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "地図学",
        "credits": 2,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": [
      {
        "name": "地理学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（2単位以上）"
      },
      {
        "name": "気象と環境変化",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（2単位以上）"
      },
      {
        "name": "日本の自然と災害",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（2単位以上）"
      },
      {
        "name": "経済地理学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "社会地理学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "文化地理学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "地形学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "気候学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "生物地理学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      }
    ]
  },
  "地球科学副専攻": {
    "name": "地球科学副専攻",
    "type": "department",
    "targetDept": "地球科学科",
    "creditsReq": 16,
    "window": "地球科学科事務室 / 教務課",
    "page": "p.187",
    "description": "a群から4単位以上、b群から4単位以上を含み、計16単位以上修得。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "地球科学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "宇宙科学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "地球環境の変動と生命史",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "地学概論1",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "地学概論2",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "古生物・古生態学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "水圏科学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "環境化学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "環境地球科学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "地球科学特講2",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "地圏科学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "地球物理学1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "地球物理学2",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "火山学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "岩石・鉱物学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "気圏科学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      }
    ]
  },
  "数学副専攻": {
    "name": "数学副専攻",
    "type": "department",
    "targetDept": "数学科",
    "creditsReq": 16,
    "window": "数学科事務室 / 教務課",
    "page": "p.187",
    "description": "必修2科目6単位＋選択10単位以上＝計16単位以上修得。",
    "requiredCourses": [
      {
        "name": "線形代数1(含演習)",
        "credits": 3,
        "category": "必修"
      },
      {
        "name": "微分積分学1(含演習)",
        "credits": 3,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": [
      {
        "name": "線形代数2(含演習)",
        "credits": 3,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "微分積分学2(含演習)",
        "credits": 3,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "常微分方程式入門",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "初等整数論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "距離と位相",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "微分積分学続論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "群論入門",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "環論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "ガロア理論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "曲線と曲面",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "幾何構造",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "離散構造",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "複素解析学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "数理統計",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "数学教育学概論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "数学教育実践論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "統計学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "数学を楽しむ",
        "credits": 1,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "生活の中の数学",
        "credits": 1,
        "category": "選択必修",
        "group": "選択科目"
      }
    ]
  },
  "情報科学副専攻": {
    "name": "情報科学副専攻",
    "type": "department",
    "targetDept": "情報科学科",
    "creditsReq": 16,
    "window": "情報科学科事務室 / 教務課",
    "page": "p.188",
    "description": "必修4科目6単位＋選択10単位以上＝計16単位以上修得。",
    "requiredCourses": [
      {
        "name": "基礎プログラミング1",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "基礎プログラミング2",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "情報科学実習1",
        "credits": 1,
        "category": "必修"
      },
      {
        "name": "情報科学実習2",
        "credits": 1,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": [
      {
        "name": "情報科学実習3",
        "credits": 1,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "情報科学実習4",
        "credits": 1,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "実践プログラミング1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "実践プログラミング2",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "ソフトウェアクリエイション1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "ソフトウェアクリエイション2",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "マルチメディア表現",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "データ科学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "次世代社会コミュニティ情報科学1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "情報処理入門1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "情報処理入門2",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "データベース",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "情報と社会",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "情報と数理",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "地域振興と情報発信",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      }
    ]
  },
  "物理学副専攻": {
    "name": "物理学副専攻",
    "type": "department",
    "targetDept": "物理学科",
    "creditsReq": 16,
    "window": "物理学科事務室 / 教務課",
    "page": "p.188",
    "description": "必修4科目8単位＋選択8単位以上＝計16単位以上修得。",
    "requiredCourses": [
      {
        "name": "力学入門",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "電磁気学入門",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "力学1",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "力学2",
        "credits": 2,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": [
      {
        "name": "量子力学入門",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "熱力学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "振動と波動",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "電磁気学1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "電磁気学2",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "物性物理学入門",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "量子力学1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "統計力学1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "物性物理学1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "相対性理論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "量子光学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "宇宙物理学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "超伝導の科学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "物理学概論1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "物理学概論2",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      }
    ]
  },
  "生命科学副専攻": {
    "name": "生命科学副専攻",
    "type": "department",
    "targetDept": "生命科学科",
    "creditsReq": 16,
    "window": "生命科学科事務室 / 教務課",
    "page": "p.189",
    "description": "選択必修2単位＋選択14単位以上＝計16単位以上修得。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "生命科学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択必修（いずれか1科目）"
      },
      {
        "name": "生物学概論1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択必修（いずれか1科目）"
      },
      {
        "name": "生命科学概論1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択必修（いずれか1科目）"
      },
      {
        "name": "身のまわりの生命現象",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "環境と生命のつながり",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "ゲノム改変と私たちの生活",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "生命科学概論2",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "進化系統学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "生化学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "分子生物学1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "分子生物学2",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "細胞生物学1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "細胞生物学2",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "生体エネルギー科学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "遺伝学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "微生物学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "生態学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "植物生態学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "植物機能学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "ゲノム科学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "代謝生理学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "細胞内ダイナミクス",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "構造生物学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "バイオインフォマティクス1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "バイオインフォマティクス2",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "発生生物学1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "発生生物学2",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "植物生理学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "生物物理学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "脳神経科学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "生命医科学1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "生命医科学2",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "免疫学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "環境保全生態学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "生命科学特別講義1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "生命科学特別講義2",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "生命科学特別講義3",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "生命科学特別講義4",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      }
    ]
  },
  "化学副専攻": {
    "name": "化学副専攻",
    "type": "department",
    "targetDept": "化学科",
    "creditsReq": 16,
    "window": "化学科事務室 / 教務課",
    "page": "p.189",
    "description": "a群から8単位以上、b群から8単位以上を含み、計16単位以上修得。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "基礎化学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（8単位以上）"
      },
      {
        "name": "有機化学1",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（8単位以上）"
      },
      {
        "name": "有機化学2",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（8単位以上）"
      },
      {
        "name": "無機化学1",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（8単位以上）"
      },
      {
        "name": "無機化学2",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（8単位以上）"
      },
      {
        "name": "分析化学1",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（8単位以上）"
      },
      {
        "name": "分析化学2",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（8単位以上）"
      },
      {
        "name": "物理化学1",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（8単位以上）"
      },
      {
        "name": "物理化学2",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（8単位以上）"
      },
      {
        "name": "有機化学3",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "無機化学3",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "分析化学3",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "物理化学3",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "化学数学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "周期表の化学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "発展無機化学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "応用無機化学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "有機反応化学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "有機構造化学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "最前線の化学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      },
      {
        "name": "現代社会を支える化学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（8単位以上）"
      }
    ]
  },
  "グローバル・コミュニケーション副専攻": {
    "name": "グローバル・コミュニケーション副専攻",
    "type": "interdisciplinary",
    "targetDept": "学際",
    "creditsReq": 16,
    "window": "教務課・国際交流委員会",
    "page": "p.190",
    "description": "a群6単位以上、b群2単位以上、c群2単位以上、d群2単位以上を含み、計16単位以上修得。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "Frontier of Knowledge 1",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "Frontier of Knowledge 2",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "多言語・多文化社会と日本語教育",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "異文化理解と日本語学習",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "欧米の歴史・社会・文化",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "アジアの歴史・社会・文化",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "イスラム圏の歴史・社会・文化",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "国際情勢",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "国際経済論",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "アジアの文化と社会2",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "イギリス社会論",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "アメリカ社会論",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "ヨーロッパ・ドイツ文化講義3",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "国際社会論",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "国際社会福祉1",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位以上）"
      },
      {
        "name": "多読多聴英語1",
        "credits": 1,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "多読多聴英語2",
        "credits": 1,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "ドイツ語コミュニケーション1",
        "credits": 1,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "ドイツ語コミュニケーション2",
        "credits": 1,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "フランス語コミュニカティフ1",
        "credits": 1,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "フランス語コミュニカティフ2",
        "credits": 1,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "中国語7",
        "credits": 1,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "中国語8",
        "credits": 1,
        "category": "選択必修",
        "group": "b群（2単位以上）"
      },
      {
        "name": "History of Japan 1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（2単位以上）"
      },
      {
        "name": "Japanese Society 1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（2単位以上）"
      },
      {
        "name": "Japanese Literature 1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（2単位以上）"
      },
      {
        "name": "Japanese Culture 1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（2単位以上）"
      },
      {
        "name": "Japan in the World 1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（2単位以上）"
      },
      {
        "name": "World Literature and Japan 1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（2単位以上）"
      },
      {
        "name": "海外語学研修",
        "credits": 2,
        "category": "選択必修",
        "group": "d群（2単位以上）"
      },
      {
        "name": "海外文化交流",
        "credits": 2,
        "category": "選択必修",
        "group": "d群（2単位以上）"
      },
      {
        "name": "総合研究1",
        "credits": 2,
        "category": "選択必修",
        "group": "d群（2単位以上）"
      },
      {
        "name": "総合研究2",
        "credits": 2,
        "category": "選択必修",
        "group": "d群（2単位以上）"
      },
      {
        "name": "総合研究3",
        "credits": 2,
        "category": "選択必修",
        "group": "d群（2単位以上）"
      },
      {
        "name": "総合研究4",
        "credits": 2,
        "category": "選択必修",
        "group": "d群（2単位以上）"
      },
      {
        "name": "総合研究5",
        "credits": 2,
        "category": "選択必修",
        "group": "d群（2単位以上）"
      },
      {
        "name": "総合研究6",
        "credits": 2,
        "category": "選択必修",
        "group": "d群（2単位以上）"
      },
      {
        "name": "総合研究7",
        "credits": 2,
        "category": "選択必修",
        "group": "d群（2単位以上）"
      },
      {
        "name": "総合研究8",
        "credits": 2,
        "category": "選択必修",
        "group": "d群（2単位以上）"
      }
    ]
  },
  "ダイバーシティ副専攻": {
    "name": "ダイバーシティ副専攻",
    "type": "interdisciplinary",
    "targetDept": "学際",
    "creditsReq": 16,
    "window": "教務課・ダイバーシティ推進委員会",
    "page": "p.191",
    "description": "必修4科目8単位＋選択8単位以上＝計16単位以上修得。",
    "requiredCourses": [
      {
        "name": "ジェンダー論",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "ダイバーシティ＆インクルージョン",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "「障害」の科学",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "多文化共生社会を生きる",
        "credits": 2,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": [
      {
        "name": "LGBTQを知る",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "Japanese Culture 1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "Japanese Culture 2",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "Japanese Society 1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "Japanese Society 2",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "国際社会論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "東京と東京人の社会学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "差別の社会学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "中国ジェンダー論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "国際社会福祉1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "ジェンダーと教育",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "教育と開発",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      }
    ]
  },
  "データサイエンス副専攻": {
    "name": "データサイエンス副専攻",
    "type": "interdisciplinary",
    "targetDept": "学際",
    "creditsReq": 16,
    "window": "教務課・データサイエンス教育委員会",
    "page": "p.191",
    "description": "必修4科目8単位＋a群1科目以上＋b群1科目以上＋c群1科目以上を含み、計16単位以上修得。",
    "requiredCourses": [
      {
        "name": "情報リテラシー",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "データ処理基礎",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "ビッグデータサイエンス",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "アルゴリズムとデータ構造",
        "credits": 2,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": [
      {
        "name": "統計学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（統計・数理/1科目以上）"
      },
      {
        "name": "データアナリティクス",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（統計・数理/1科目以上）"
      },
      {
        "name": "データと対話するための統計学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（統計・数理/1科目以上）"
      },
      {
        "name": "地理統計の基礎",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（統計・数理/1科目以上）"
      },
      {
        "name": "地球環境統計学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（統計・数理/1科目以上）"
      },
      {
        "name": "データ科学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（統計・数理/1科目以上）"
      },
      {
        "name": "確率論",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（統計・数理/1科目以上）"
      },
      {
        "name": "生物統計学基礎",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（統計・数理/1科目以上）"
      },
      {
        "name": "生物統計学実践",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（統計・数理/1科目以上）"
      },
      {
        "name": "数理統計",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（統計・数理/1科目以上）"
      },
      {
        "name": "応用空間分析法(含実習)",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（計算・プログラミング/1科目以上）"
      },
      {
        "name": "情報処理入門1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（計算・プログラミング/1科目以上）"
      },
      {
        "name": "情報処理入門2",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（計算・プログラミング/1科目以上）"
      },
      {
        "name": "数値計算入門1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（計算・プログラミング/1科目以上）"
      },
      {
        "name": "数値計算入門2",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（計算・プログラミング/1科目以上）"
      },
      {
        "name": "物理学における情報処理",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（計算・プログラミング/1科目以上）"
      },
      {
        "name": "生命科学のためのプログラミングと計算",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（計算・プログラミング/1科目以上）"
      },
      {
        "name": "デジタル産業革命と社会の変容",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（基盤・社会応用/1科目以上）"
      },
      {
        "name": "情報倫理・情報セキュリティ",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（基盤・社会応用/1科目以上）"
      },
      {
        "name": "次世代情報基盤構築応用",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（基盤・社会応用/1科目以上）"
      },
      {
        "name": "仮想情報基盤構築基礎",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（基盤・社会応用/1科目以上）"
      },
      {
        "name": "地理情報システム(含実習)",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（基盤・社会応用/1科目以上）"
      },
      {
        "name": "マルチメディア表現",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（基盤・社会応用/1科目以上）"
      }
    ]
  },
  "科学リテラシー副専攻": {
    "name": "科学リテラシー副専攻",
    "type": "interdisciplinary",
    "targetDept": "学際",
    "creditsReq": 16,
    "window": "教務課・自然科学教育委員会",
    "page": "p.192",
    "description": "a群〜d群各分野から各2単位以上を含み、計16単位以上修得。※理系6学科所属生は修了認定不可。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "気象と環境変化",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（地球科学/2単位以上）"
      },
      {
        "name": "日本の自然と災害",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（地球科学/2単位以上）"
      },
      {
        "name": "宇宙科学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（地球科学/2単位以上）"
      },
      {
        "name": "地球環境の変動と生命史",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（地球科学/2単位以上）"
      },
      {
        "name": "原子の世界",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（物質科学/2単位以上）"
      },
      {
        "name": "現代社会を支える科学技術",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（物質科学/2単位以上）"
      },
      {
        "name": "化学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（物質科学/2単位以上）"
      },
      {
        "name": "現代社会を支える化学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（物質科学/2単位以上）"
      },
      {
        "name": "生命科学",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（生命科学/2単位以上）"
      },
      {
        "name": "身のまわりの生命現象",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（生命科学/2単位以上）"
      },
      {
        "name": "環境と生命のつながり",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（生命科学/2単位以上）"
      },
      {
        "name": "ゲノム改変と私たちの生活",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（生命科学/2単位以上）"
      },
      {
        "name": "数学",
        "credits": 2,
        "category": "選択必修",
        "group": "d群（数学・情報/2単位以上）"
      },
      {
        "name": "データと対話するための統計学",
        "credits": 2,
        "category": "選択必修",
        "group": "d群（数学・情報/2単位以上）"
      },
      {
        "name": "プログラミング入門",
        "credits": 2,
        "category": "選択必修",
        "group": "d群（数学・情報/2単位以上）"
      }
    ]
  },
  "地域デザイン副専攻": {
    "name": "地域デザイン副専攻",
    "type": "interdisciplinary",
    "targetDept": "学際",
    "creditsReq": 16,
    "window": "教務課・地域連携教育委員会",
    "page": "p.192",
    "description": "必修3科目6単位＋選択10単位以上＝計16単位以上修得。",
    "requiredCourses": [
      {
        "name": "地域資源の活用と地域連携",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "多文化共生社会を生きる",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "現代社会におけるケア",
        "credits": 2,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": [
      {
        "name": "法学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "憲法",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "経済学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "地理学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "日本の自然と災害",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "キャリアデザイン(公務員志望者)",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "インターンシップ(公務員志望者)",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "日本考古学概説1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "文化財学1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "社会言語学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "方言の研究",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "中国文化1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "ヨーロッパ・ドイツ語圏の文化と社会1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "都市と地域の社会学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "東京と東京人の社会学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "福祉政策運営管理",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "地域福祉の理論と方法2",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "教育経営論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "地域教育論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "社会教育論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "体育・スポーツ制度及び行政",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "産業・組織心理学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "老年心理学特講",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "地域政策論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "ツーリズム論",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "環境保全生態学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      },
      {
        "name": "生命医科学1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択科目"
      }
    ]
  }
};

export function getCourseCurriculum(courseName: string): CourseCurriculumDef | undefined {
  return VERIFIED_COURSES_CURRICULUM[courseName];
}

export function getMinorCurriculum(minorName: string): MinorCurriculumDef | undefined {
  return VERIFIED_MINORS_CURRICULUM[minorName];
}
