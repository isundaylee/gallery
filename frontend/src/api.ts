// Typed client for the Django JSON API. All requests are same-origin in dev
// thanks to the Vite proxy (see vite.config.ts).

export interface ImageSummary {
  id: number
  filename: string
  views: number
}

export interface TagOnImage {
  id: number
  name: string
  applied: boolean
}

export interface TagWithCount {
  id: number
  name: string
  count: number
}

export interface ReviewImage {
  id: number
  filename: string
  tag_ids: number[]
}

export interface NamedTag {
  id: number
  name: string
}

export interface DuplicateImage {
  id: number
  filename: string
  views: number
  is_keeper: boolean
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    throw new Error(`${init?.method ?? 'GET'} ${path} failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

// The raw URL for an image's bytes (used directly as <img src>).
export const imageDataUrl = (id: number) => `/api/images/${id}/data`

export const listImages = (params: {
  mode?: 'random' | 'recent'
  page?: number
  tag?: number
}) => {
  const q = new URLSearchParams()
  if (params.tag !== undefined) q.set('tag', String(params.tag))
  if (params.mode) q.set('mode', params.mode)
  if (params.page !== undefined) q.set('page', String(params.page))
  return request<{ title: string; images: ImageSummary[] }>(
    `/api/images?${q.toString()}`,
  )
}

export const getImage = (id: number) =>
  request<{ image: ImageSummary; tags: TagOnImage[] }>(`/api/images/${id}`)

export const addTag = (imageId: number, tag: { tag_id?: number; name?: string }) =>
  request<NamedTag>(`/api/images/${imageId}/tags`, {
    method: 'POST',
    body: JSON.stringify(tag),
  })

export const removeTag = (imageId: number, tagId: number) =>
  request<{ ok: boolean }>(`/api/images/${imageId}/tags/${tagId}`, {
    method: 'DELETE',
  })

export const listTags = () =>
  request<{ tags: TagWithCount[] }>('/api/tags')

export const getReview = () =>
  request<{ images: ReviewImage[]; tags: NamedTag[] }>('/api/review')

export const markReviewed = (imageIds: number[]) =>
  request<{ ok: boolean }>('/api/review/mark', {
    method: 'POST',
    body: JSON.stringify({ image_ids: imageIds }),
  })

// Each cluster is keeper-first (earliest import); the keeper has is_keeper=true.
export const getDuplicates = (threshold?: number) => {
  const q = threshold !== undefined ? `?threshold=${threshold}` : ''
  return request<{ threshold: number; clusters: DuplicateImage[][] }>(
    `/api/duplicates${q}`,
  )
}

export const mergeDuplicates = (imageIds: number[]) =>
  request<{ ok: boolean; keeper_id: number; views: number }>(
    '/api/duplicates/merge',
    { method: 'POST', body: JSON.stringify({ image_ids: imageIds }) },
  )

// Mark a cluster as not-duplicates so it stops appearing.
export const dismissDuplicates = (imageIds: number[]) =>
  request<{ ok: boolean }>('/api/duplicates/dismiss', {
    method: 'POST',
    body: JSON.stringify({ image_ids: imageIds }),
  })
