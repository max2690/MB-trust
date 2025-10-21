import Head from 'next/head'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
}

export default function SEO({
  title = "MB-TRUST — платформа честных заданий и выплат для создателей",
  description = "Размещай задания, выбирай исполнителей, фиксируй результаты и получай оплату. KYC, антифрод, аналитика кликов. Лимиты 3/6/9 размещений по доверию.",
  keywords = "задания для блогеров, платформа амбассадоров, маркетинг в соцсетях, честные выплаты, антифрод, KYC, размещение сторис, UTM-аналитика, заработок создателям",
  image = "/og/cover.jpg",
  url = "https://mb-trust.app",
  type = "website"
}: SEOProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="MB-TRUST" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="MB-TRUST" />
      <meta name="theme-color" content="#00E1B4" />
      
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "MB-TRUST",
            "url": "https://mb-trust.app",
            "logo": "https://mb-trust.app/logo.svg",
            "description": "Платформа честных заданий и выплат для создателей",
            "sameAs": [
              "https://t.me/mbtrust",
              "https://vk.com/mbtrust"
            ]
          })
        }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "MB-TRUST",
            "operatingSystem": "Web",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "RUB"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "120"
            }
          })
        }}
      />
    </Head>
  )
}

