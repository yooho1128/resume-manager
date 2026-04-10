'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FormValues {
  title: string
  resumeId: string
  company: string
  position: string
  prompt: string
  content: string
}

interface ResumeOption {
  id: string
  name: string
}

export default function NewCoverLetterPage() {
  const router = useRouter()
  const [resumes, setResumes] = useState<ResumeOption[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')

  const { register, handleSubmit, watch, setValue, getValues } = useForm<FormValues>({
    defaultValues: {
      title: '',
      resumeId: '',
      company: '',
      position: '',
      prompt: '',
      content: '',
    }
  })

  useEffect(() => {
    fetch('/api/resume')
      .then(r => r.json())
      .then((data: { id: string; name: string }[]) => setResumes(data || []))
      .catch(() => {})
  }, [])

  // 회사/직무 입력 시 제목 자동 완성
  const company = watch('company')
  const position = watch('position')
  useEffect(() => {
    const title = getValues('title')
    if (!title && (company || position)) {
      const auto = [company, position].filter(Boolean).join(' ')
      setValue('title', `${auto} 자기소개서`)
    }
  }, [company, position, setValue, getValues])

  async function handleGenerate() {
    const resumeId = getValues('resumeId')
    const prompt = getValues('prompt')

    if (!resumeId) {
      toast.error('이력서를 선택해주세요.')
      return
    }
    if (!prompt.trim()) {
      toast.error('요청사항을 입력해주세요.')
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId,
          prompt,
          company: getValues('company'),
          position: getValues('position'),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setGeneratedContent(data.content)
      setValue('content', data.content)
      toast.success('AI 자기소개서 생성 완료! 내용을 확인하고 수정해주세요.')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'AI 생성 실패')
    } finally {
      setIsGenerating(false)
    }
  }

  async function onSubmit(values: FormValues) {
    if (!values.content.trim()) {
      toast.error('자기소개서 내용을 입력해주세요.')
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title || `${values.company || ''} 자기소개서`.trim() || '자기소개서',
          resumeId: values.resumeId || null,
          company: values.company,
          position: values.position,
          content: values.content,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      toast.success('자기소개서가 저장되었습니다!')
      router.push('/dashboard')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '저장 실패')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <h1 className="text-2xl font-bold text-white">자기소개서 작성</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* 기본 정보 */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">지원 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">기반 이력서 선택</Label>
              <Select onValueChange={(v) => setValue('resumeId', v as string)}>
                <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                  <SelectValue placeholder="이력서를 선택해주세요" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {resumes.length === 0 ? (
                    <SelectItem value="__none__" disabled className="text-slate-500">
                      등록된 이력서가 없습니다
                    </SelectItem>
                  ) : (
                    resumes.map((r) => (
                      <SelectItem key={r.id} value={r.id} className="text-white">
                        {r.name || '이름 없음'}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">지원 회사</Label>
                <Input
                  {...register('company')}
                  placeholder="네이버, 카카오, ..."
                  className="bg-slate-900/50 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">지원 직무</Label>
                <Input
                  {...register('position')}
                  placeholder="백엔드 개발자"
                  className="bg-slate-900/50 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">제목</Label>
              <Input
                {...register('title')}
                placeholder="자기소개서 제목"
                className="bg-slate-900/50 border-slate-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* AI 생성 */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              AI 자기소개서 생성
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">요청사항</Label>
              <Textarea
                {...register('prompt')}
                placeholder="예) 성장 가능성과 협업 능력을 강조해주세요. 최근 프로젝트 경험을 중심으로 작성해주세요."
                className="min-h-24 bg-slate-900/50 border-slate-700 text-slate-300 text-sm resize-none"
              />
            </div>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />생성 중...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />AI로 자기소개서 생성</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 자기소개서 내용 */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">자기소개서 내용</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register('content')}
              value={generatedContent}
              onChange={(e) => {
                setGeneratedContent(e.target.value)
                setValue('content', e.target.value)
              }}
              placeholder="AI 생성 버튼을 누르거나 직접 작성해주세요..."
              className="min-h-96 bg-slate-900/50 border-slate-700 text-white resize-none text-sm leading-relaxed"
            />
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" />저장 중...</>
          ) : '자기소개서 저장'}
        </Button>
      </form>
    </div>
  )
}
