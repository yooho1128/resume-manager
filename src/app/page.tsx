import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Sparkles, Download, PenLine, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Upload,
    title: '이력서 업로드 & AI 파싱',
    description: '기존 이력서 파일을 업로드하면 AI가 자동으로 내용을 분석하고 구조화합니다.',
  },
  {
    icon: Sparkles,
    title: '기술 스택 자동 추천',
    description: '경력 내용을 분석하여 명시되지 않은 기술 스택도 AI가 추론하여 추가합니다.',
  },
  {
    icon: PenLine,
    title: 'AI 자기소개서 생성',
    description: '이력서 기반으로 지원 회사와 직무에 맞는 자기소개서를 자동 생성합니다.',
  },
  {
    icon: Download,
    title: 'PDF / DOCX 다운로드',
    description: '완성된 이력서를 PDF 또는 Word 파일로 다운로드할 수 있습니다.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* 헤더 */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-white">이력 관리</span>
          </div>
          <div className="flex gap-2">
            <Link
              href="/auth/login"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-slate-300 hover:text-white')}
            >
              로그인
            </Link>
            <Link
              href="/auth/signup"
              className={cn(buttonVariants({ size: 'sm' }), 'bg-blue-600 hover:bg-blue-700 text-white')}
            >
              시작하기
            </Link>
          </div>
        </div>
      </header>

      {/* 히어로 */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-sm mb-6">
          <Sparkles className="w-4 h-4" />
          AI 기반 이력 관리 시스템
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
          이력서 관리의 번거로움,<br />AI가 해결해 드립니다
        </h1>
        <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
          프리랜서 개발자를 위한 스마트 이력 관리 시스템.<br />
          업로드만 하면 AI가 정리하고, 자기소개서도 써드립니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/signup"
            className={cn(buttonVariants({ size: 'lg' }), 'bg-blue-600 hover:bg-blue-700 text-white')}
          >
            무료로 시작하기
          </Link>
          <Link
            href="/auth/login"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'border-slate-600 text-slate-300 hover:bg-slate-800')}
          >
            로그인
          </Link>
        </div>
      </section>

      {/* 기능 카드 */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/30 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <CardTitle className="text-white text-base">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
