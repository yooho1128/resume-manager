import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

// GET /api/resume/:id
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: '이력서를 찾을 수 없습니다.' }, { status: 404 })
  return NextResponse.json(data)
}

// PUT /api/resume/:id
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const body = await req.json()

  const { data, error } = await supabase
    .from('resumes')
    .update({
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      github: body.github,
      blog: body.blog,
      summary: body.summary,
      work_experiences: body.workExperiences,
      projects: body.projects,
      educations: body.educations,
      certificates: body.certificates,
      skills: body.skills,
      languages: body.languages,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/resume/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
