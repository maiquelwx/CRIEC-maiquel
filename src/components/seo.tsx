import { Helmet } from "react-helmet-async"
import { useLocation, useMatches } from "react-router-dom"
import type { UIMatch } from "react-router-dom"

const SITE_URL = import.meta.env.VITE_SITE_URL

export type SEOProps = {
  title?: string
  description?: string
  canonPath?: string
  noIndex?: boolean
}

function SEO(props: SEOProps) {
  const location = useLocation()
  const matches = useMatches() as UIMatch<unknown, { seo?: SEOProps }>[]

  const seo = matches.reduce((acc, match) => ({
    ...acc,
    ...match.handle?.seo,
  }), {})

  const { title, description, canonPath, noIndex } = { ...seo, ...props }

  const canonical = `${SITE_URL}${canonPath ?? location.pathname}`
  const ogImage = `${SITE_URL}/hero.webp`

  return (
    <Helmet>
      <title>{title ?? "CRIEC"}</title>
      <meta property="og:title" content={title ?? "CRIEC"} />

      {description && (
        <>
          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
        </>
      )}

      <link rel="canonical" href={canonical} />
      <meta property="og:url" content={canonical} />

      {noIndex && <meta name="robots" content="noindex" />}

      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
    </Helmet>
  )
}

export default SEO