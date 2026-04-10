'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Sparkles, Loader2, Trash2 } from 'lucide-react'
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

export default function EditCoverLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [resumes, setResumes] = useState<ResumeOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedResumeId, setSelectedResumeId] = useState('')

  const { register, handleSubmit, setValue, getValues } = useForm<FormValues>({
    defaultValues: { title: '', resumeId: '', company: '', position: '', prompt: '', content: '' }
  })

  useEffect(() => {
    async function load() {
      try {
        const [clRes, resumesRes] = await Promise.all([
          fetch(`/api/cover-letter/${id}`),
          fetch('/api/resume'),
        ])
        const [cl, resumeList] = await Promise.all([clRes.json(), resumesRes.json()])

        if (!clRes.ok) {
          toast.error('자기소개서를 불러올 수 없습니다.')
          router.push('/dashboard')
          return
        }

        setResumes(resumeList || [])
        setValue('title', cl.title || '')
        setValue('company', cl.company || '')
        setValue('position', cl.position || '')
        setValue('content', cl.content || '')
        setValue('resumeId', cl.resume_id || '')
        setSelectedResumeId(cl.resume_id || '')
      } catch {
        toast.error('불러오기 실패')
        router.push('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id, setValue, router])

  async function handleGenerate() {
    const resumeId = selectedResumeId
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
      setValue('content', data.content)
      toast.success('AI 자기소개서 생성 완료!')
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
      const res = await fetch(`/api/cover-letter/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          company: values.company,
          position: values.position,
          content: values.content,
          resumeId: selectedResumeId || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      toast.success('저장되었습니다!')
      router.push('/dashboard')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '저장 실패')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('자기소개서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/cover-letter/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('삭제 실패')
      toast.success('삭제되었습니다.')
      router.push('/dashboard')
    } catch {
      toast.error('삭제에 실패했습니다.')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">자기소개서 수정</h1>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
          삭제
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* 기본 정보 */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">지원 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">기반 이력서</Label>
              <Select value={selectedResumeId} onValueChange={(v) => setSelectedResumeId(v ?? '')}>
                <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                  <SelectValue placeholder="이력서를 선택해주세요" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {resumes.map((r) => (
                    <SelectItem key={r.id} value={r.id} className="text-white">
                      {r.name || '이름 없음'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">지원 회사</Label>
                <Input {...register('company')} placeholder="네이버, 카카오, ..." className="bg-slate-900/50 border-slate-700 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">지원 직무</Label>
                <Input {...register('position')} placeholder="백엔드 개발자" className="bg-slate-900/50 border-slate-700 text-white" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">제목</Label>
              <Input {...register('title')} placeholder="자기소개서 제목" className="bg-slate-900/50 border-slate-700 text-white" />
            </div>
          </CardContent>
        </Card>

        {/* AI 재생성 */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              AI 재생성
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">요청사항</Label>
              <Textarea
                {...register('prompt')}
                placeholder="예) 더 간결하게 다시 써줘 / 협업 역량을 더 강조해줘"
                className="min-h-20 bg-slate-900/50 border-slate-700 text-slate-300 text-sm resize-none"
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
                <><Sparkles className="w-4 h-4 mr-2" />AI로 다시 생성</>
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
              placeholder="자기소개서 내용을 입력해주세요..."
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
          ) : '저장'}
        </Button>
      </form>
    </div>
  )
}
