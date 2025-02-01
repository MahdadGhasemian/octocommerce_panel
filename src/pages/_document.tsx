// ** React Import
import { Children } from 'react'

// ** Next Import
import Document, { Html, Head, Main, NextScript } from 'next/document'

// ** Emotion Imports
import createEmotionServer from '@emotion/server/create-instance'

// ** Utils Imports
import { createEmotionCache } from '@/utils/create-emotion-cache'

// ** Header Imports
import Headers from 'src/headers'

class CustomDocument extends Document {
  // ** Header Data
  headerData = Headers(
    process.env.NEXT_PUBLIC_DOMAIN_NAME,
    process.env.NEXT_PUBLIC_TWITTER_ID,
    process.env.NEXT_PUBLIC_OG_TITLE,
    process.env.NEXT_PUBLIC_OG_DESCRIPTION,
    process.env.NEXT_PUBLIC_OG_IMAGE_URL
  ).generalMeta

  render() {
    return (
      <Html lang='fa' dir='rtl'>
        <Head>
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link rel='preconnect' href='https://fonts.gstatic.com' />
          <link
            rel='stylesheet'
            href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
          />
          <link rel='apple-touch-icon' sizes='180x180' href='/images/apple-touch-icon.png' />
          <link rel='shortcut icon' href='/images/favicon.png' />
          <link rel='icon' sizes='192x192' href='/images/favicon-192x192.png' />
          <link rel='mask-icon' href='/images/favicon.png' color='#000000' />

          <link rel='sitemap' href='/sitemap.xml' type='application/xml' />

          {this.headerData?.map((header, index) => (
            <meta {...header} key={`header-key-${index}`} />
          ))}

          <link rel='stylesheet' href='/fonts/font.css' />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

CustomDocument.getInitialProps = async ctx => {
  const originalRenderPage = ctx.renderPage
  const cache = createEmotionCache()
  const { extractCriticalToChunks } = createEmotionServer(cache)

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: App => props =>
        (
          <App
            {...props} // @ts-ignore
            emotionCache={cache}
          />
        )
    })

  const initialProps = await Document.getInitialProps(ctx)
  const emotionStyles = extractCriticalToChunks(initialProps.html)
  const emotionStyleTags = emotionStyles.styles.map(style => {
    return (
      <style
        key={style.key}
        dangerouslySetInnerHTML={{ __html: style.css }}
        data-emotion={`${style.key} ${style.ids.join(' ')}`}
      />
    )
  })

  return {
    ...initialProps,
    styles: [...Children.toArray(initialProps.styles), ...emotionStyleTags]
  }
}

export default CustomDocument
