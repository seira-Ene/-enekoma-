import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_DEMO_ACCOUNTS } from '@/app/data/studentAccounts';

export async function GET() {
  // デモアカウント一覧（公開プロパティのみ）
  const demoList = Object.values(INITIAL_DEMO_ACCOUNTS).map((acc) => ({
    id: acc.id,
    name: acc.name,
    department: acc.department,
    grade: acc.grade,
    admissionYear: acc.admissionYear
  }));

  return NextResponse.json({
    status: 'ok',
    demoAccounts: demoList
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, password, name, department, grade, admissionYear } = body;

    if (action === 'login') {
      const targetId = (id || '').trim();
      const demo = INITIAL_DEMO_ACCOUNTS[targetId];
      if (demo) {
        if (password && demo.password && demo.password !== password.trim()) {
          return NextResponse.json({ error: 'パスワードが正しくありません。' }, { status: 401 });
        }
        return NextResponse.json({
          status: 'ok',
          student: demo
        });
      }
      return NextResponse.json({ error: '該当する学生アカウントが見つかりません。' }, { status: 404 });
    }

    if (action === 'register') {
      const studentId = (id || '').trim();
      if (!studentId) {
        return NextResponse.json({ error: '学籍番号またはIDを入力してください。' }, { status: 400 });
      }

      const { selectedCourses, selectedMinors, initialProfile } = body;

      const newStudent = {
        id: studentId,
        name: (name || `学生(${studentId})`).trim(),
        department: department || '情報科学科',
        grade: Number(grade) || 1,
        admissionYear: admissionYear || 'reiwa7_or_later',
        password: (password || '1234').trim(),
        selectedCourses: selectedCourses || [],
        selectedMinors: selectedMinors || [],
        initialProfile: initialProfile || null,
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        status: 'ok',
        student: newStudent
      });
    }

    return NextResponse.json({ error: '無効なリクエストです。' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}

