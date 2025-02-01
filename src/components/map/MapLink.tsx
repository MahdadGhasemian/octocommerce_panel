import { Box, Button } from '@mui/material'

interface MapLinkProps {
  lat: number
  lng: number
}

const MapLink: React.FC<MapLinkProps> = ({ lat, lng }) => {
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Button variant='contained' color='primary' href={googleMapsUrl} target='_blank' rel='noopener noreferrer'>
        مشاهده مکان روی نقشه گوگل
      </Button>
    </Box>
  )
}

export default MapLink
