import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })

  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    const text = await file.text()
    return NextResponse.json({ text })
  }

  if (fileName.endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse')
      const result = await pdfParse(buffer)
      return NextResponse.json({ text: result.text })
    } catch {
      return NextResponse.json(
        { error: 'PDF 파싱 실패. 텍스트를 직접 붙여넣어 주세요.' },
        { status: 500 }
      )
    }
  }

  if (fileName.endsWith('.docx')) {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      return NextResponse.json({ text: result.value })
    } catch {
      return NextResponse.json(
        { error: 'DOCX 파싱 실패. 텍스트를 직접 붙여넣어 주세요.' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json(
    { error: '지원하지 않는 파일 형식입니다. (.txt, .pdf, .docx 지원)' },
    { status: 400 }
  )
}
