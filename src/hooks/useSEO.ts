import { useEffect } from 'react'

type SEOProps = {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  noIndex?: boolean
}

const SITE_NAME = 'LeaksHaven'
const BASE_URL = typeof window !== 'undefined' ? window.location.origin : ''
const DEFAULT_DESC = 'Premium content directory. Browse exclusive creator collections and discover top models.'

export function useSEO({
  title,
  description = DEFAULT_DESC,
  keywords = 'creators, models, content, collections, exclusive',
  image,
  url,
  type = 'website',
  noIndex = false,
}: SEOProps = {}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : BASE_URL)

  useEffect(() => {
    document.title = fullTitle

    setMeta('description', description)
    setMeta('keywords', keywords)
    if (noIndex) setMeta('robots', 'noindex, nofollow')
    else setMeta('robots', 'index, follow')

    // Open Graph
    setOgMeta('og:title', fullTitle)
    setOgMeta('og:description', description)
    setOgMeta('og:type', type)
    setOgMeta('og:url', canonicalUrl)
    setOgMeta('og:site_name', SITE_NAME)
    if (image) setOgMeta('og:image', image)

    // Twitter Cards
    setMeta('twitter:card', image ? 'summary_large_image' : 'summary')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', description)
    if (image) setMeta('twitter:image', image)

    // Canonical URL
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl
  }, [fullTitle, description, keywords, image, canonicalUrl, type, noIndex])
}

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.name = name
    document.head.appendChild(el)
  }
  el.content = content
}

function setOgMeta(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.content = content
}
