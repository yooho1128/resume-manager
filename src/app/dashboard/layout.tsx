import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FileText, LayoutDashboard, PenLine, LogOut } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { href: '/resume/new', icon: FileText, label: '이력서 작성' },
  { href: '/cover-letter/new', icon: PenLine, label: '자기소개서' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* 상단 네비게이션 */}
      <header className="border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-white hidden sm:block">이력 관리</span>
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-slate-400 hover:text-white')}
                >
                  <item.icon className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm hidden sm:block">{user.email}</span>
            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-slate-400 hover:text-white')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  )
}
