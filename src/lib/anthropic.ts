import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function parseResumeWithAI(rawText: string) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `다음 이력서 텍스트를 분석하여 구조화된 JSON 형식으로 변환해주세요.
각 경력/프로젝트에서 사용된 기술 스택을 추론하여 techStacks 배열에 추가해주세요.
명시되지 않았더라도 업무 내용으로 추론 가능한 기술은 포함해주세요.

이력서 내용:
${rawText}

다음 JSON 형식으로만 응답해주세요 (설명 없이):
{
  "name": "",
  "email": "",
  "phone": "",
  "address": "",
  "github": "",
  "blog": "",
  "summary": "",
  "workExperiences": [
    {
      "company": "",
      "position": "",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "isCurrent": false,
      "description": "",
      "techStacks": []
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "role": "",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "techStacks": [],
      "url": ""
    }
  ],
  "educations": [
    {
      "school": "",
      "major": "",
      "degree": "",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "isCurrent": false
    }
  ],
  "certificates": [
    {
      "name": "",
      "issuer": "",
      "date": "YYYY-MM"
    }
  ],
  "skills": [],
  "languages": []
}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('AI 응답 오류')

  const jsonText = content.text.replace(/```json\n?|\n?```/g, '').trim()
  return JSON.parse(jsonText)
}

export async function generateCoverLetter(
  resumeData: object,
  prompt: string,
  company?: string,
  position?: string
) {
  const systemPrompt = `당신은 전문 취업 컨설턴트입니다. 주어진 이력서 정보를 바탕으로 자기소개서를 작성합니다.
- 자연스럽고 진정성 있는 문체를 사용하세요
- 이력서의 실제 경험을 구체적으로 언급하세요
- 지원 회사/직무에 맞게 강점을 부각시키세요
- 한국어로 작성하세요`

  const userPrompt = `이력서 정보:
${JSON.stringify(resumeData, null, 2)}

${company ? `지원 회사: ${company}` : ''}
${position ? `지원 직무: ${position}` : ''}

요청사항: ${prompt}

자기소개서를 작성해주세요.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('AI 응답 오류')
  return content.text
}

export async function suggestSkills(resumeData: object) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `다음 이력서를 분석하여 추가할 수 있는 기술 스택을 추천해주세요.
현재 경력과 프로젝트 내용을 보고 명시되지 않았지만 사용했을 가능성이 높은 기술들을 추론해주세요.

이력서:
${JSON.stringify(resumeData, null, 2)}

JSON 배열 형식으로만 응답해주세요:
["기술1", "기술2", ...]`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('AI 응답 오류')
  const jsonText = content.text.replace(/```json\n?|\n?```/g, '').trim()
  return JSON.parse(jsonText) as string[]
}
