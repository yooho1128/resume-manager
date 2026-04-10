export interface WorkExperience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string | null
  isCurrent: boolean
  description: string
  techStacks: string[]
}

export interface Project {
  id: string
  name: string
  description: string
  role: string
  startDate: string
  endDate: string | null
  techStacks: string[]
  url?: string
}

export interface Education {
  id: string
  school: string
  major: string
  degree: string
  startDate: string
  endDate: string | null
  isCurrent: boolean
}

export interface Certificate {
  id: string
  name: string
  issuer: string
  date: string
}

export interface Resume {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  address?: string
  github?: string
  blog?: string
  summary: string
  workExperiences: WorkExperience[]
  projects: Project[]
  educations: Education[]
  certificates: Certificate[]
  skills: string[]
  languages: string[]
  createdAt: string
  updatedAt: string
}

export interface CoverLetter {
  id: string
  userId: string
  resumeId: string
  title: string
  company?: string
  position?: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name?: string
}
