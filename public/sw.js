const CACHE_NAME = 'resume-manager-v1'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/icon.svg',
]

// 설치: 핵심 에셋 캐시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// 활성화: 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: 네트워크 우선, 실패 시 캐시
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API 요청은 항상 네트워크
  if (url.pathname.startsWith('/api/')) return

  // GET 요청만 캐싱
  if (request.method !== 'GET') return

  event.respondWith(
    fetch(request)
      .then((response) => {
        // 성공한 응답은 캐시에 저장
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => {
        // 오프라인일 때 캐시에서 반환
        return caches.match(request).then((cached) => {
          if (cached) return cached
          // 캐시도 없으면 오프라인 페이지 (대시보드 캐시)
          return caches.match('/dashboard')
        })
      })
  )
})
