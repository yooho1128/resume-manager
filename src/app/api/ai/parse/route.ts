import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseResumeWithAI } from '@/lib/anthropic'

// POST /api/ai/parse - 이력서 텍스트를 AI로 파싱
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const { text } = await req.json()
  if (!text) return NextResponse.json({ error: '텍스트가 필요합니다.' }, { status: 400 })

  const parsed = await parseResumeWithAI(text)
  return NextResponse.json(parsed)
}
