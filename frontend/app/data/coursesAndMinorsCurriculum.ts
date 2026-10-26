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
        "name": "美学史1",
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
        "name": "記号論理1",
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
        "name": "哲学講読1",
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
        "name": "美学講読1",
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
        "name": "哲学特殊講義1",
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
    "page": "p.180",
    "description": "指定科目から16単位以上修得。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "日本史研究法入門",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "東洋史研究法入門",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "西洋史研究法入門",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "考古学研究法入門",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "日本史講究",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "東洋史講究",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "西洋史講究",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "日本史特講1",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "東洋史特講1",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "西洋史特講1",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "考古学特講1",
        "credits": 2,
        "category": "選択必修"
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
    "description": "必修8単位を含め、計16単位以上修得。",
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
        "category": "選択必修"
      },
      {
        "name": "日本語文法史",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "上代文学史",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "中古文学史",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "近代文学史",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "文字文化研究",
        "credits": 2,
        "category": "選択必修"
      }
    ]
  },
  "現代文化副専攻": {
    "name": "現代文化副専攻",
    "type": "department",
    "targetDept": "国文学科",
    "creditsReq": 16,
    "window": "国文学科事務室 / 教務課",
    "page": "p.181",
    "description": "必修4単位を含め、計16単位以上修得。",
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
        "category": "選択必修"
      },
      {
        "name": "大衆文化論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "アダプテーション研究",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "出版文化研究",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "児童文学・ライトノベル研究",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "批評理論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "メディア論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "ジェンダー論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "映像文化論",
        "credits": 2,
        "category": "選択必修"
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
    "description": "a群から6単位以上、b群から4単位以上を含め、計16単位以上修得。",
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
        "name": "中国学入門1",
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
        "name": "中国社会論1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "中国ジェンダー論",
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
    "page": "p.182",
    "description": "a群・b群・c群からそれぞれ4単位以上を含め、計16単位以上修得。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "異文化間コミュニケーション概論1",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "イギリス社会論",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "アメリカ社会論",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（4単位以上）"
      },
      {
        "name": "英語学概説1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "英文法1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "英語音声学1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（4単位以上）"
      },
      {
        "name": "英語文学概説1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（4単位以上）"
      },
      {
        "name": "イギリス文学史1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（4単位以上）"
      },
      {
        "name": "アメリカ文学史1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（4単位以上）"
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
    "description": "必修4単位を含み、計16単位以上修得。",
    "requiredCourses": [
      {
        "name": "ドイツ文学史講義3",
        "credits": 2,
        "category": "必修"
      },
      {
        "name": "ヨーロッパ・ドイツ文化講義3",
        "credits": 2,
        "category": "必修"
      }
    ],
    "electiveRequiredCourses": [
      {
        "name": "ドイツ語1",
        "credits": 1,
        "category": "選択必修"
      },
      {
        "name": "ドイツ語コミュニケーション1",
        "credits": 1,
        "category": "選択必修"
      },
      {
        "name": "ヨーロッパ・ドイツ語圏の文化と社会1",
        "credits": 2,
        "category": "選択必修"
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
    "description": "指定科目から計16単位以上修得。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "社会変動論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "マス・コミュニケーション論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "文化人類学",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "現代家族論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "都市と地域の社会学",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "企業と働き方の社会学",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "社会問題論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "データサイエンス入門",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "スポーツの社会学",
        "credits": 2,
        "category": "選択必修"
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
    "description": "必修2単位を含め、計16単位以上修得。",
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
        "category": "選択必修"
      },
      {
        "name": "障害者の理解",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "社会福祉法制",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "福祉政策論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "家庭支援論",
        "credits": 2,
        "category": "選択必修"
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
    "description": "必修2単位を含め、計16単位以上修得。",
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
        "category": "選択必修"
      },
      {
        "name": "肢体不自由者の心理・生理・病理",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "病弱者の心理・生理・病理",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "知的障害教育論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "発達障害教育論",
        "credits": 2,
        "category": "選択必修"
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
    "description": "指定科目から計16単位以上修得。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "体育学概論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "保健学概論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "解剖学",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "生理学",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "スポーツ心理学",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "運動生理学(基礎)",
        "credits": 2,
        "category": "選択必修"
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
    "description": "必修4単位を含め、a群4単位、b群8単位を含み計16単位以上修得。",
    "requiredCourses": [
      {
        "name": "心理学",
        "credits": 2,
        "category": "必修",
        "group": "必修（4単位）"
      },
      {
        "name": "心の健康",
        "credits": 2,
        "category": "必修",
        "group": "必修（4単位）"
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
        "name": "知覚・認知心理学",
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
        "name": "健康心理学特講",
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
    "description": "必修10単位を含め、a群2単位、b群4単位以上を含み計16単位以上修得。",
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
    "description": "a群・b群からそれぞれ4単位以上を含み、計16単位以上修得。",
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
    "description": "必修6単位を含め、計16単位以上修得。",
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
        "category": "選択必修"
      },
      {
        "name": "微分積分学2(含演習)",
        "credits": 3,
        "category": "選択必修"
      },
      {
        "name": "初等整数論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "数理統計",
        "credits": 2,
        "category": "選択必修"
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
    "description": "必修6単位を含め、計16単位以上修得。",
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
        "name": "実践プログラミング1",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "データ科学",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "情報処理入門1",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "データベース",
        "credits": 2,
        "category": "選択必修"
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
    "description": "必修8単位を含め、計16単位以上修得。",
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
        "category": "選択必修"
      },
      {
        "name": "熱力学",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "物性物理学入門",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "統計力学1",
        "credits": 2,
        "category": "選択必修"
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
    "description": "選択必修2単位を含み、計16単位以上修得。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "生命科学",
        "credits": 2,
        "category": "選択必修",
        "group": "選択必修（2単位）"
      },
      {
        "name": "生物学概論1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択必修（2単位）"
      },
      {
        "name": "生命科学概論1",
        "credits": 2,
        "category": "選択必修",
        "group": "選択必修（2単位）"
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
        "name": "細胞生物学1",
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
    "description": "a群及びb群から各8単位以上を含め、計16単位以上修得。",
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
        "name": "無機化学1",
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
      }
    ]
  },
  "グローバル・コミュニケーション副専攻": {
    "name": "グローバル・コミュニケーション副専攻",
    "type": "interdisciplinary",
    "targetDept": "全学科生",
    "creditsReq": 16,
    "window": "教務課（国際交流委員会）",
    "page": "p.190",
    "description": "a群6単位、b群2単位、c群2単位、d群2単位を含み、計16単位以上修得。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "Frontier of Knowledge 1",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位）"
      },
      {
        "name": "多言語・多文化社会と日本語教育",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位）"
      },
      {
        "name": "異文化理解と日本語学習",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位）"
      },
      {
        "name": "国際情勢",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（6単位）"
      },
      {
        "name": "多読多聴英語1",
        "credits": 1,
        "category": "選択必修",
        "group": "b群（2単位）"
      },
      {
        "name": "Japanese Culture 1",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（2単位）"
      },
      {
        "name": "海外語学研修",
        "credits": 2,
        "category": "選択必修",
        "group": "d群（2単位）"
      }
    ]
  },
  "ダイバーシティ副専攻": {
    "name": "ダイバーシティ副専攻",
    "type": "interdisciplinary",
    "targetDept": "全学科生",
    "creditsReq": 16,
    "window": "教務課（ダイバーシティ推進委員会）",
    "page": "p.190",
    "description": "必修8単位を含み、計16単位以上修得。",
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
        "category": "選択必修"
      },
      {
        "name": "国際社会論",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "ジェンダーと教育",
        "credits": 2,
        "category": "選択必修"
      }
    ]
  },
  "データサイエンス副専攻": {
    "name": "データサイエンス副専攻",
    "type": "interdisciplinary",
    "targetDept": "全学科生",
    "creditsReq": 16,
    "window": "教務課（コンピュータセンター運営委員会）",
    "page": "p.191",
    "description": "必修8単位、a〜c群からそれぞれ1科目以上を含み、計16単位以上修得。",
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
        "group": "a群（1科目以上）"
      },
      {
        "name": "データ科学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（1科目以上）"
      },
      {
        "name": "情報処理入門1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（1科目以上）"
      },
      {
        "name": "数値計算入門1",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（1科目以上）"
      },
      {
        "name": "地理情報システム(含実習)",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（1科目以上）"
      },
      {
        "name": "情報倫理・情報セキュリティ",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（1科目以上）"
      }
    ]
  },
  "科学リテラシー副専攻": {
    "name": "科学リテラシー副専攻",
    "type": "interdisciplinary",
    "targetDept": "文系学科生対象（理系6学科は修了認定不可）",
    "creditsReq": 16,
    "window": "教務課（理系6学科）",
    "page": "p.192",
    "description": "a〜d群から各2単位以上を含み、計16単位以上修得（理系6学科所属生は修了不可）。",
    "requiredCourses": [],
    "electiveRequiredCourses": [
      {
        "name": "気象と環境変化",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（地球科学/2単位）"
      },
      {
        "name": "宇宙科学",
        "credits": 2,
        "category": "選択必修",
        "group": "a群（地球科学/2単位）"
      },
      {
        "name": "原子の世界",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（物質科学/2単位）"
      },
      {
        "name": "化学",
        "credits": 2,
        "category": "選択必修",
        "group": "b群（物質科学/2単位）"
      },
      {
        "name": "生命科学",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（生命科学/2単位）"
      },
      {
        "name": "身のまわりの生命現象",
        "credits": 2,
        "category": "選択必修",
        "group": "c群（生命科学/2単位）"
      },
      {
        "name": "数学",
        "credits": 2,
        "category": "選択必修",
        "group": "d群（数学・情報/2単位）"
      },
      {
        "name": "プログラミング入門",
        "credits": 2,
        "category": "選択必修",
        "group": "d群（数学・情報/2単位）"
      }
    ]
  },
  "地域デザイン副専攻": {
    "name": "地域デザイン副専攻",
    "type": "interdisciplinary",
    "targetDept": "全学科生",
    "creditsReq": 16,
    "window": "教務課（地域連携推進委員会）",
    "page": "p.192",
    "description": "必修6単位を含め、計16単位以上修得。",
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
        "category": "選択必修"
      },
      {
        "name": "日本の自然と災害",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "都市と地域の社会学",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "地域福祉の理論と方法2",
        "credits": 2,
        "category": "選択必修"
      },
      {
        "name": "地域政策論",
        "credits": 2,
        "category": "選択必修"
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
