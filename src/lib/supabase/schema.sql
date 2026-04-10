-- 이력서 테이블
create table if not exists resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  address text,
  github text,
  blog text,
  summary text not null default '',
  work_experiences jsonb not null default '[]'::jsonb,
  projects jsonb not null default '[]'::jsonb,
  educations jsonb not null default '[]'::jsonb,
  certificates jsonb not null default '[]'::jsonb,
  skills text[] not null default '{}',
  languages text[] not null default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 자기소개서 테이블
create table if not exists cover_letters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  resume_id uuid references resumes(id) on delete set null,
  title text not null,
  company text,
  position text,
  content text not null default '',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS 활성화
alter table resumes enable row level security;
alter table cover_letters enable row level security;

-- 이력서 RLS 정책 (본인 데이터만 접근)
drop policy if exists "Users can view own resumes" on resumes;
create policy "Users can view own resumes"
  on resumes for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own resumes" on resumes;
create policy "Users can insert own resumes"
  on resumes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own resumes" on resumes;
create policy "Users can update own resumes"
  on resumes for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own resumes" on resumes;
create policy "Users can delete own resumes"
  on resumes for delete
  using (auth.uid() = user_id);

-- 자기소개서 RLS 정책
drop policy if exists "Users can view own cover letters" on cover_letters;
create policy "Users can view own cover letters"
  on cover_letters for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own cover letters" on cover_letters;
create policy "Users can insert own cover letters"
  on cover_letters for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own cover letters" on cover_letters;
create policy "Users can update own cover letters"
  on cover_letters for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own cover letters" on cover_letters;
create policy "Users can delete own cover letters"
  on cover_letters for delete
  using (auth.uid() = user_id);

-- updated_at 자동 업데이트 함수
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_resumes_updated_at on resumes;
create trigger update_resumes_updated_at
  before update on resumes
  for each row execute function update_updated_at();

drop trigger if exists update_cover_letters_updated_at on cover_letters;
create trigger update_cover_letters_updated_at
  before update on cover_letters
  for each row execute function update_updated_at();

-- 파일 업로드용 Storage 버킷 (Supabase 대시보드에서 직접 생성 필요)
-- 버킷명: resume-files
-- 공개 여부: false (비공개)
