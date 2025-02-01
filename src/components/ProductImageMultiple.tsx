// ** MUI Imports
import { Add, Delete, ExpandMore } from '@mui/icons-material'
import { Accordion, AccordionDetails, AccordionSummary, Badge, Box, Button } from '@mui/material'
import ProductImage from './ProductImage'
import { useState } from 'react'

export type Props = {
  initialImages?: string[]
  onChange: (value: string[]) => void
}

const ProductImageMultiple = (props: Props) => {
  // ** Props
  const { initialImages, onChange } = props

  // ** State
  const [images, setImages] = useState<string[] | undefined>(initialImages)

  // ** Functions
  const onSelectChangeImageHandler = (index: number, newImageUrl: string) => {
    setImages(prevImages => {
      const updatedImages = [...(prevImages || [])]
      updatedImages[index] = newImageUrl

      onChange(updatedImages)

      return updatedImages
    })
  }

  const onAddingImageHandler = () => {
    setImages(prevImages => {
      const updatedImages = [...(prevImages || []), '']

      onChange(updatedImages)

      return updatedImages
    })
  }

  const onDeletingImageHandler = (index: number) => {
    setImages(prevImages => {
      if (!prevImages) return []

      const updatedImages = prevImages.filter((_, i) => i !== index)

      onChange(updatedImages)

      return updatedImages
    })
  }

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />} aria-controls='panel1-content' id='panel1-header'>
        <Box display='flex' alignItems='center' justifyContent='center' gap={4}>
          <span>عکس های بیشتر</span>
          <Badge
            overlap='circular'
            badgeContent={images?.length || 0}
            color='info'
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          ></Badge>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' gap={2}>
          {images?.map((image, index) => (
            <Box key={`${image}-${index}`} display='flex' alignItems='center' justifyContent='center' gap={2}>
              <ProductImage
                componentId={`product-images-${index}`}
                initialImage={image}
                onChange={newImageUrl => onSelectChangeImageHandler(index, newImageUrl)}
              />
              <Button variant='text' color='error' size='small' onClick={() => onDeletingImageHandler(index)}>
                <Delete />
              </Button>
            </Box>
          ))}
          <Button variant='outlined' color='success' fullWidth onClick={() => onAddingImageHandler()}>
            افزودن
            <Add />
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

export default ProductImageMultiple
