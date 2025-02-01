// ** MUI Imports
import { Box, Button, CircularProgress, styled, TextField, Typography } from '@mui/material'
import { ChangeEvent, useEffect, useState } from 'react'

// ** Services Import
import StorageService from '@/services/storage.service'
import { Import } from 'mdi-material-ui'

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}))

export type Props = {
  componentId: string
  initialImage?: string
  onChange: (value: string) => void
}

const ProductImage = (props: Props) => {
  // ** Props
  const { componentId, initialImage, onChange } = props

  // ** State
  const [image, setImage] = useState<string | undefined>(initialImage)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>('')

  useEffect(() => {
    if (initialImage) {
      setImage(initialImage)
    }
  }, [initialImage])

  // ** Functions
  const onChangeHandler = async (file: ChangeEvent) => {
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      const file = files[0]

      if (file) {
        try {
          setImageLoading(true)
          StorageService.uploadFile(file)
            .then(response => {
              onChange(response?.url)

              setImage(response.url)
            })
            .catch(e => {
              e
            })
            .finally(() => {
              setImageLoading(false)
            })
        } catch (error) {}
      }
    }
  }

  const handleUrlPaste = async () => {
    if (!imageUrl) return

    setImageLoading(true)
    try {
      // Call the existing upload function
      const uploadResponse = await StorageService.uploadFileWithUrl(imageUrl)
      onChange(uploadResponse?.url)
      setImage(uploadResponse.url)
    } catch (error) {
    } finally {
      setImageLoading(false)
    }
  }

  return (
    <Box position='relative' width='100%'>
      <Box sx={{ border: 1, borderRadius: 1, display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            variant='outlined'
            size='small'
            sx={{ flexGrow: 1 }}
            disabled={imageLoading}
          />
          <Button variant='outlined' onClick={handleUrlPaste} disabled={imageLoading} size='small'>
            <Import style={{ transform: 'scaleX(-1)' }} />
          </Button>
        </Box>
        <Button
          component='label'
          variant='outlined'
          htmlFor={componentId}
          disabled={imageLoading}
          sx={{
            height: '100%',
            minHeight: '100%',
            width: '100%'
          }}
          color='secondary'
        >
          <Box display='flex' flexDirection='row' gap={8} justifyContent='center' alignItems='center'>
            <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
              {/* <Typography>عکس محصول</Typography> */}
              <Typography variant='body2'>برای تغییر کلیک کنید</Typography>
            </Box>
            <Box maxWidth={120} maxHeight={120}>
              <ImgStyled
                src={`${image}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                alt='تصویر محصول'
              />
            </Box>
          </Box>
          <input hidden type='file' onChange={onChangeHandler} accept='image/png, image/jpeg' id={componentId} />
        </Button>
      </Box>

      {imageLoading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <CircularProgress color='primary' />
        </Box>
      )}
    </Box>
  )
}

export default ProductImage
