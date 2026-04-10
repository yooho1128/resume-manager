import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { suggestSkills } from '@/lib/anthropic'

// POST /api/ai/skills - AI 기술 스택 추천
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const { resumeId } = await req.json()
  if (!resumeId) return NextResponse.json({ error: '이력서 ID가 필요합니다.' }, { status: 400 })

  const { data: resume } = await supabase.from('resumes').select('*').eq('id', resumeId).single()
  if (!resume) return NextResponse.json({ error: '이력서를 찾을 수 없습니다.' }, { status: 404 })

  const skills = await suggestSkills(resume)
  return NextResponse.json({ skills })
}
