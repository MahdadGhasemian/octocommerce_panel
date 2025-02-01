// ** MUI Imports
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

const FooterContent = () => {
  // ** Var
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}
    >
      <Typography sx={{ mr: 2 }}>
        {`ساخته شده با `}
        <Box component='span' sx={{ color: 'error.main' }}>
          ❤️
        </Box>
        {` توسط `}
        <Link target='_blank' href='https://mahdad.me'>
          Mahdad.me
        </Link>
      </Typography>
      {hidden ? null : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', '& :not(:last-child)': { mr: 4 } }}></Box>
      )}
    </Box>
  )
}

export default FooterContent
