'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WorkExperienceForm {
  company: string
  position: string
  startDate: string
  endDate: string
  isCurrent: boolean
  description: string
  techStacks: string
}

interface ProjectForm {
  name: string
  description: string
  role: string
  startDate: string
  endDate: string
  techStacks: string
  url: string
}

interface EducationForm {
  school: string
  major: string
  degree: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

interface CertificateForm {
  name: string
  issuer: string
  date: string
}

interface FormValues {
  name: string
  email: string
  phone: string
  address: string
  github: string
  blog: string
  summary: string
  skills: string
  languages: string
  workExperiences: WorkExperienceForm[]
  projects: ProjectForm[]
  educations: EducationForm[]
  certificates: CertificateForm[]
}

function toArr(s: string) {
  return s.split(',').map(x => x.trim()).filter(Boolean)
}

function toStr(arr: string[] | null | undefined) {
  return (arr || []).join(', ')
}

export default function EditResumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { register, control, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: {
      name: '', email: '', phone: '', address: '', github: '', blog: '',
      summary: '', skills: '', languages: '',
      workExperiences: [], projects: [], educations: [], certificates: [],
    }
  })

  const workFields = useFieldArray({ control, name: 'workExperiences' })
  const projectFields = useFieldArray({ control, name: 'projects' })
  const eduFields = useFieldArray({ control, name: 'educations' })
  const certFields = useFieldArray({ control, name: 'certificates' })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/resume/${id}`)
        if (!res.ok) {
          toast.error('이력서를 불러올 수 없습니다.')
          router.push('/dashboard')
          return
        }
        const d = await res.json()
        reset({
          name: d.name || '',
          email: d.email || '',
          phone: d.phone || '',
          address: d.address || '',
          github: d.github || '',
          blog: d.blog || '',
          summary: d.summary || '',
          skills: toStr(d.skills),
          languages: toStr(d.languages),
          workExperiences: (d.work_experiences || []).map((w: { company?: string; position?: string; startDate?: string; endDate?: string; isCurrent?: boolean; description?: string; techStacks?: string[] }) => ({
            company: w.company || '',
            position: w.position || '',
            startDate: w.startDate || '',
            endDate: w.endDate || '',
            isCurrent: w.isCurrent || false,
            description: w.description || '',
            techStacks: toStr(w.techStacks),
          })),
          projects: (d.projects || []).map((p: { name?: string; description?: string; role?: string; startDate?: string; endDate?: string; techStacks?: string[]; url?: string }) => ({
            name: p.name || '',
            description: p.description || '',
            role: p.role || '',
            startDate: p.startDate || '',
            endDate: p.endDate || '',
            techStacks: toStr(p.techStacks),
            url: p.url || '',
          })),
          educations: (d.educations || []).map((e: { school?: string; major?: string; degree?: string; startDate?: string; endDate?: string; isCurrent?: boolean }) => ({
            school: e.school || '',
            major: e.major || '',
            degree: e.degree || '',
            startDate: e.startDate || '',
            endDate: e.endDate || '',
            isCurrent: e.isCurrent || false,
          })),
          certificates: (d.certificates || []).map((c: { name?: string; issuer?: string; date?: string }) => ({
            name: c.name || '',
            issuer: c.issuer || '',
            date: c.date || '',
          })),
        })
      } catch {
        toast.error('불러오기 실패')
        router.push('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id, reset, router])

  async function onSubmit(values: FormValues) {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/resume/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          skills: toArr(values.skills),
          languages: toArr(values.languages),
          workExperiences: values.workExperiences.map(w => ({
            ...w,
            id: crypto.randomUUID(),
            techStacks: toArr(w.techStacks),
          })),
          projects: values.projects.map(p => ({
            ...p,
            id: crypto.randomUUID(),
            techStacks: toArr(p.techStacks),
          })),
          educations: values.educations.map(e => ({ ...e, id: crypto.randomUUID() })),
          certificates: values.certificates.map(c => ({ ...c, id: crypto.randomUUID() })),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      toast.success('이력서가 수정되었습니다!')
      router.push('/dashboard')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '저장 실패')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('이력서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/resume/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('삭제 실패')
      toast.success('이력서가 삭제되었습니다.')
      router.push('/dashboard')
    } catch {
      toast.error('삭제에 실패했습니다.')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">이력서 수정</h1>
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
            <CardTitle className="text-white text-base">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">이름</Label>
                <Input {...register('name')} placeholder="홍길동" className="bg-slate-900/50 border-slate-700 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">이메일</Label>
                <Input {...register('email')} type="email" placeholder="hong@example.com" className="bg-slate-900/50 border-slate-700 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">전화번호</Label>
                <Input {...register('phone')} placeholder="010-0000-0000" className="bg-slate-900/50 border-slate-700 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">주소</Label>
                <Input {...register('address')} placeholder="서울시 강남구" className="bg-slate-900/50 border-slate-700 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">GitHub</Label>
                <Input {...register('github')} placeholder="https://github.com/username" className="bg-slate-900/50 border-slate-700 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">블로그</Label>
                <Input {...register('blog')} placeholder="https://blog.example.com" className="bg-slate-900/50 border-slate-700 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 자기소개 */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">자기소개</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register('summary')}
              placeholder="간단한 자기소개를 입력해주세요..."
              className="min-h-28 bg-slate-900/50 border-slate-700 text-white resize-none"
            />
          </CardContent>
        </Card>

        {/* 경력사항 */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-white text-base">경력사항</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => workFields.append({ company: '', position: '', startDate: '', endDate: '', isCurrent: false, description: '', techStacks: '' })}
              className="text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-4 h-4 mr-1" />추가
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {workFields.fields.length === 0 && (
              <p className="text-slate-600 text-sm text-center py-4">경력을 추가해주세요</p>
            )}
            {workFields.fields.map((field, i) => (
              <div key={field.id} className="space-y-3 p-3 bg-slate-900/50 rounded-lg relative">
                <button type="button" onClick={() => workFields.remove(i)} className="absolute top-3 right-3 text-slate-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs">회사명</Label>
                    <Input {...register(`workExperiences.${i}.company`)} placeholder="(주)회사" className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs">직책/직무</Label>
                    <Input {...register(`workExperiences.${i}.position`)} placeholder="백엔드 개발자" className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs">시작일 (YYYY-MM)</Label>
                    <Input {...register(`workExperiences.${i}.startDate`)} placeholder="2022-03" className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs">종료일</Label>
                    <Input
                      {...register(`workExperiences.${i}.endDate`)}
                      placeholder="2024-02"
                      disabled={watch(`workExperiences.${i}.isCurrent`)}
                      className="bg-slate-800 border-slate-700 text-white disabled:opacity-40"
                    />
                    <label className="flex items-center gap-1.5 text-slate-400 text-xs cursor-pointer mt-1">
                      <input type="checkbox" {...register(`workExperiences.${i}.isCurrent`)} />
                      재직중
                    </label>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">업무 내용</Label>
                  <Textarea {...register(`workExperiences.${i}.description`)} placeholder="주요 업무 내용" className="min-h-20 bg-slate-800 border-slate-700 text-white resize-none text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">기술 스택 (쉼표로 구분)</Label>
                  <Input {...register(`workExperiences.${i}.techStacks`)} placeholder="React, TypeScript, Node.js" className="bg-slate-800 border-slate-700 text-white" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 프로젝트 */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-white text-base">프로젝트</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => projectFields.append({ name: '', description: '', role: '', startDate: '', endDate: '', techStacks: '', url: '' })}
              className="text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-4 h-4 mr-1" />추가
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {projectFields.fields.length === 0 && (
              <p className="text-slate-600 text-sm text-center py-4">프로젝트를 추가해주세요</p>
            )}
            {projectFields.fields.map((field, i) => (
              <div key={field.id} className="space-y-3 p-3 bg-slate-900/50 rounded-lg relative">
                <button type="button" onClick={() => projectFields.remove(i)} className="absolute top-3 right-3 text-slate-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs">프로젝트명</Label>
                    <Input {...register(`projects.${i}.name`)} placeholder="프로젝트 이름" className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs">역할</Label>
                    <Input {...register(`projects.${i}.role`)} placeholder="팀장 / 백엔드 개발" className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs">시작일</Label>
                    <Input {...register(`projects.${i}.startDate`)} placeholder="2023-01" className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs">종료일</Label>
                    <Input {...register(`projects.${i}.endDate`)} placeholder="2023-06" className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">URL</Label>
                  <Input {...register(`projects.${i}.url`)} placeholder="https://github.com/..." className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">설명</Label>
                  <Textarea {...register(`projects.${i}.description`)} placeholder="프로젝트 설명" className="min-h-20 bg-slate-800 border-slate-700 text-white resize-none text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">기술 스택 (쉼표로 구분)</Label>
                  <Input {...register(`projects.${i}.techStacks`)} placeholder="React, TypeScript" className="bg-slate-800 border-slate-700 text-white" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 학력 */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-white text-base">학력</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => eduFields.append({ school: '', major: '', degree: '', startDate: '', endDate: '', isCurrent: false })}
              className="text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-4 h-4 mr-1" />추가
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {eduFields.fields.length === 0 && (
              <p className="text-slate-600 text-sm text-center py-4">학력을 추가해주세요</p>
            )}
            {eduFields.fields.map((field, i) => (
              <div key={field.id} className="space-y-3 p-3 bg-slate-900/50 rounded-lg relative">
                <button type="button" onClick={() => eduFields.remove(i)} className="absolute top-3 right-3 text-slate-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs">학교명</Label>
                    <Input {...register(`educations.${i}.school`)} placeholder="○○대학교" className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs">전공</Label>
                    <Input {...register(`educations.${i}.major`)} placeholder="컴퓨터공학과" className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs">학위</Label>
                    <Input {...register(`educations.${i}.degree`)} placeholder="학사 / 석사" className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs">시작일</Label>
                    <Input {...register(`educations.${i}.startDate`)} placeholder="2018-03" className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-slate-400 text-xs">종료일</Label>
                    <Input
                      {...register(`educations.${i}.endDate`)}
                      placeholder="2022-02"
                      disabled={watch(`educations.${i}.isCurrent`)}
                      className="bg-slate-800 border-slate-700 text-white disabled:opacity-40"
                    />
                    <label className="flex items-center gap-1.5 text-slate-400 text-xs cursor-pointer mt-1">
                      <input type="checkbox" {...register(`educations.${i}.isCurrent`)} />
                      재학중
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 자격증 */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-white text-base">자격증</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => certFields.append({ name: '', issuer: '', date: '' })}
              className="text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-4 h-4 mr-1" />추가
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {certFields.fields.length === 0 && (
              <p className="text-slate-600 text-sm text-center py-4">자격증을 추가해주세요</p>
            )}
            {certFields.fields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-3 gap-3 p-3 bg-slate-900/50 rounded-lg relative">
                <button type="button" onClick={() => certFields.remove(i)} className="absolute top-3 right-3 text-slate-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">자격증명</Label>
                  <Input {...register(`certificates.${i}.name`)} placeholder="정보처리기사" className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">발급기관</Label>
                  <Input {...register(`certificates.${i}.issuer`)} placeholder="한국산업인력공단" className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">취득일</Label>
                  <Input {...register(`certificates.${i}.date`)} placeholder="2023-05" className="bg-slate-800 border-slate-700 text-white" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 기술 & 언어 */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">기술 스택 & 언어</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">기술 스택 (쉼표로 구분)</Label>
              <Input {...register('skills')} placeholder="React, TypeScript, Node.js, PostgreSQL" className="bg-slate-900/50 border-slate-700 text-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">언어 (쉼표로 구분)</Label>
              <Input {...register('languages')} placeholder="한국어 (원어민), 영어 (비즈니스)" className="bg-slate-900/50 border-slate-700 text-white" />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" />저장 중...</>
          ) : '이력서 저장'}
        </Button>
      </form>
    </div>
  )
}
