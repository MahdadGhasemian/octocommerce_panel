import React from 'react'
import { Box, BoxProps, styled } from '@mui/material'
import { Editor, EditorState, convertFromRaw, CompositeDecorator } from 'draft-js'
import 'draft-js/dist/Draft.css'

const BoxStyled = styled(Box)<BoxProps>(({ theme }) => ({
  borderColor: '#ccc',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '300px',
    width: '300px',
    borderColor: theme.palette.secondary.light,
    borderRadius: 2,
    fontWeight: 600
  },
  [theme.breakpoints.up('xs')]: {
    borderColor: theme.palette.secondary.light,
    borderRadius: 6,
    fontWeight: 600
  }
}))

interface RenderedTextProps {
  content: string
  sx: any
  controlImage?: string
}

function parseJson(jsonString: string) {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    return null
  }
}

function getUrlFromString(text: string): string {
  const pattern = /(http[s]?:\/\/[^\s)]+)/g
  const urls = text.match(pattern)

  return urls ? urls[0] : ''
}

const RenderedText: React.FC<RenderedTextProps> = ({ content, sx, controlImage }) => {
  const parsedContent = parseJson(content)

  if (parsedContent === null) {
    return <></>
  }

  const contentState = convertFromRaw(parsedContent)

  const linkDecorator = new CompositeDecorator([
    {
      strategy: (contentBlock, callback, contentState) => {
        contentBlock.findEntityRanges(character => {
          const entityKey = character.getEntity()

          return entityKey !== null && contentState.getEntity(entityKey).getType() === 'LINK'
        }, callback)
      },
      component: props => {
        const { contentState, entityKey, children } = props
        const { url, targetOption } = contentState.getEntity(entityKey).getData()

        return (
          <a href={url} target={targetOption} rel='noopener noreferrer'>
            {children}
          </a>
        )
      }
    },
    {
      strategy: (contentBlock, callback) => {
        const text = contentBlock.getText()
        const imageRegex = /!\[([^\]]+)\]\((https?:\/\/[^\s]+(?:jpe?g|png|bmp|tiff|gif|webp))\)/g
        const fileRegex = /!\[([^\]]+)\]\((https?:\/\/[^\s]+(?:pdf|docx|doc|xls|xlsx))\)/g
        const mediaRegex = /!\[([^\]]+)\]\((https?:\/\/[^\s]+(?:mp3|wav|mp4|avi|mkv))\)/g
        const compressedRegex = /!\[([^\]]+)\]\((https?:\/\/[^\s]+(?:zip|rar|tar|7z|gz))\)/g

        let match
        while ((match = imageRegex.exec(text)) !== null) {
          const start = match.index
          const end = match.index + match[0].length
          callback(start, end)
        }

        while ((match = fileRegex.exec(text)) !== null) {
          const start = match.index
          const end = match.index + match[0].length
          callback(start, end)
        }

        while ((match = mediaRegex.exec(text)) !== null) {
          const start = match.index
          const end = match.index + match[0].length
          callback(start, end)
        }

        while ((match = compressedRegex.exec(text)) !== null) {
          const start = match.index
          const end = match.index + match[0].length
          callback(start, end)
        }
      },
      component: props => {
        const url = getUrlFromString(props.decoratedText)
        const isImage = /\.(jpg|jpeg|png|bmp|tiff|gif|webp)$/.test(url)
        const isDocument = /\.(pdf|docx|doc|xls|xlsx)$/.test(url)
        const isMedia = /\.(mp3|wav|mp4|avi|mkv)$/.test(url)
        const isCompressed = /\.(zip|rar|tar|7z|gz)$/.test(url)
        if (isImage) {
          return (
            <a href={url} target='_blank' rel='noopener noreferrer'>
              <img
                src={url}
                alt='Link Detected'
                style={{ maxWidth: '100%', marginTop: 10 }}
                crossOrigin='use-credentials'
              />
            </a>
          )
        } else if (isDocument) {
          return (
            <a href={url} target='_blank' rel='noopener noreferrer'>
              فایل
            </a>
          )
        } else if (isMedia) {
          return (
            <a href={url} target='_blank' rel='noopener noreferrer'>
              مدیا
            </a>
          )
        } else if (isCompressed) {
          return (
            <a href={url} target='_blank' rel='noopener noreferrer'>
              فایل فشرده
            </a>
          )
        }
      }
    }
  ])

  const url = getUrlFromString(parsedContent?.blocks[0]?.text)
  const isImage = /\.(jpg|jpeg|png|bmp)$/.test(url)

  const editorState = EditorState.createWithContent(contentState, linkDecorator)

  return (
    <BoxStyled sx={sx}>
      <Box sx={{ maxWidth: controlImage && isImage ? controlImage : '100%' }}>
        <Editor
          editorState={editorState}
          readOnly
          onChange={() => {
            //
          }}
        />
      </Box>
    </BoxStyled>
  )
}

export default RenderedText
