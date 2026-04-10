import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, PenLine, Plus, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: resumes }, { data: coverLetters }] = await Promise.all([
    supabase.from('resumes').select('id, name, updated_at').order('updated_at', { ascending: false }),
    supabase.from('cover_letters').select('id, title, company, updated_at').order('updated_at', { ascending: false }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">안녕하세요 👋</h1>
        <p className="text-slate-400 mt-1">{user?.email}</p>
      </div>

      {/* 빠른 액션 */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/resume/new"
          className="h-auto py-4 flex flex-col items-center gap-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 text-blue-400 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm">새 이력서</span>
        </Link>
        <Link
          href="/cover-letter/new"
          className="h-auto py-4 flex flex-col items-center gap-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/20 text-purple-400 transition-colors"
        >
          <PenLine className="w-5 h-5" />
          <span className="text-sm">자기소개서 작성</span>
        </Link>
      </div>

      {/* 이력서 목록 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            내 이력서
          </h2>
          <Link
            href="/resume/new"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-slate-400 text-xs')}
          >
            + 새로 만들기
          </Link>
        </div>
        {resumes && resumes.length > 0 ? (
          <div className="space-y-2">
            {resumes.map((resume) => (
              <Link key={resume.id} href={`/resume/${resume.id}`}>
                <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/30 transition-colors cursor-pointer">
                  <CardContent className="py-3 px-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">{resume.name || '이름 없음'}</p>
                      <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(resume.updated_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <FileText className="w-4 h-4 text-slate-500" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800/30 border-slate-700/30 border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-slate-500 text-sm">아직 이력서가 없습니다</p>
              <Link
                href="/resume/new"
                className={cn(buttonVariants({ size: 'sm' }), 'mt-3 bg-blue-600 hover:bg-blue-700 text-white')}
              >
                첫 이력서 만들기
              </Link>
            </CardContent>
          </Card>
        )}
      </section>

      {/* 자기소개서 목록 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <PenLine className="w-4 h-4 text-purple-400" />
            자기소개서
          </h2>
          <Link
            href="/cover-letter/new"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-slate-400 text-xs')}
          >
            + 새로 만들기
          </Link>
        </div>
        {coverLetters && coverLetters.length > 0 ? (
          <div className="space-y-2">
            {coverLetters.map((cl) => (
              <Link key={cl.id} href={`/cover-letter/${cl.id}`}>
                <Card className="bg-slate-800/50 border-slate-700/50 hover:border-purple-500/30 transition-colors cursor-pointer">
                  <CardContent className="py-3 px-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">{cl.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {cl.company ? `${cl.company} · ` : ''}
                        {new Date(cl.updated_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <PenLine className="w-4 h-4 text-slate-500" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800/30 border-slate-700/30 border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-slate-500 text-sm">작성된 자기소개서가 없습니다</p>
              <Link
                href="/cover-letter/new"
                className={cn(buttonVariants({ size: 'sm' }), 'mt-3 bg-purple-600 hover:bg-purple-700 text-white')}
              >
                자기소개서 작성하기
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
