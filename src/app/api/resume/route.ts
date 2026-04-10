import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/resume - 내 이력서 목록
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/resume - 이력서 생성
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const body = await req.json()

  const { data, error } = await supabase
    .from('resumes')
    .insert({
      user_id: user.id,
      name: body.name || '',
      email: body.email || '',
      phone: body.phone || '',
      address: body.address,
      github: body.github,
      blog: body.blog,
      summary: body.summary || '',
      work_experiences: body.workExperiences || [],
      projects: body.projects || [],
      educations: body.educations || [],
      certificates: body.certificates || [],
      skills: body.skills || [],
      languages: body.languages || [],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
