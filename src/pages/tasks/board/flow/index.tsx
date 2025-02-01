// ** React Imports
import { useEffect, useState } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Imports
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Pagination,
  Stack,
  Typography,
  TypographyProps,
  styled,
  useMediaQuery,
  useTheme
} from '@mui/material'

// ** Services Import
import TaskService, { Board, ContentType } from '@/services/task.service'

// ** Import libraries
import moment from 'moment-jalaali'
import ShowText from '@/components/TextEditor/ShowText'
import { SelectGroup } from 'mdi-material-ui'

const TextSubtitle = styled(Typography)<TypographyProps>({
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis'
})

const Tasks = () => {
  // ** Hook
  const theme = useTheme()

  // ** States
  const [boards, setBoards] = useState<Array<Board>>()
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  // const filters = JSON.stringify([])
  const sortingValue = [{ id: 'created_at', desc: true }]

  const isColorDark = (hexColor: string) => {
    // Remove the '#' symbol if it exists
    if (hexColor.startsWith('#')) {
      hexColor = hexColor.slice(1)
    }

    // Convert hex to RGB values
    const red = parseInt(hexColor.substr(0, 2), 16)
    const green = parseInt(hexColor.substr(2, 2), 16)
    const blue = parseInt(hexColor.substr(4, 2), 16)

    // Calculate luminance
    const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255

    // Decide whether the color is dark or light based on luminance
    return luminance <= 0.5
  }

  useEffect(() => {
    loadTasks()
  }, [currentPage])

  const loadTasks = () => {
    setLoading(true)
    TaskService.getAllFlowListBoard(10, currentPage, undefined, undefined, sortingValue)
      .then(response => {
        setBoards(response.data)
        setTotalPages(response.meta.totalPages)
      })
      .catch(e => {
        e
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    // Show loading indicator while data is being fetched
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
        <CircularProgress color='primary' />
      </Box>
    )
  }

  if (!boards?.length) return <Box></Box>

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }}>
      <Box sx={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {boards?.map((board: Board) => (
          <Link key={board?.id} passHref href={`/tasks/board/view?id=${board?.id}`}>
            <Card sx={{ my: 2, cursor: 'pointer' }}>
              <CardContent>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={4}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={12}>
                        <Stack direction='row' justifyContent='start' alignItems='center' spacing={2}>
                          <IconButton color='secondary' size='small'>
                            <SelectGroup />
                          </IconButton>
                          <TextSubtitle sx={{ marginX: 1 }}>{board.project?.title}</TextSubtitle>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={12}>
                        <Stack direction='row' justifyContent='start' alignItems='center' spacing={2}>
                          <Avatar
                            alt={board?.assigned_to?.first_name}
                            src={`${board?.assigned_to?.avatar}?width=120`}
                            imgProps={{ crossOrigin: 'use-credentials' }}
                            sx={{ width: '2.5rem', height: '2.5rem' }}
                          />
                          <Typography variant='h6'>{board?.title}</Typography>
                        </Stack>
                      </Grid>
                      {/* <Grid item xs={12} sm={12}>
                      <Stack direction='row'>
                        <TextDetail sx={{ marginX: 1 }}>{fromNow(board.created_at)}</TextDetail>
                        <TextSubtitle sx={{ marginX: 1 }}>توسط</TextSubtitle>
                        <TextDetail sx={{ marginX: 1 }}>
                          {board?.created_by?.first_name || ''} {board?.created_by?.last_name || ''}
                        </TextDetail>
                        <TextSubtitle sx={{ marginX: 1 }}>ایجاد شده است.</TextSubtitle>
                      </Stack>
                    </Grid> */}
                    </Grid>
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    <Grid container xs={12} spacing={0}>
                      {board.comments.filter(comment => comment.content.content_type === ContentType.UserComment)
                        ?.length ? (
                        <Divider orientation='vertical' flexItem sx={{ mx: 2 }}></Divider>
                      ) : (
                        <></>
                      )}
                      {board.comments.filter(comment => comment.content.content_type === ContentType.UserComment)
                        ?.length ? (
                        <Grid item xs>
                          <Typography variant='body1' sx={{ mb: 2 }}>
                            آخرین یادداشت:
                          </Typography>
                          <span>
                            {board.comments
                              .filter(comment => comment.content.content_type === ContentType.UserComment)
                              .sort((a, b) => a.id - b.id)
                              .slice(-1)
                              .map(comment => (
                                <Box key={comment.id}>
                                  <span>{moment(comment.created_at).format('HH:mm jMM/jDD')}</span>
                                  <span>
                                    {comment?.content?.content && (
                                      <ShowText
                                        content={comment.content.content}
                                        sx={{
                                          overflow: 'hidden',
                                          whiteSpace: 'nowrap',
                                          textOverflow: 'ellipsis',
                                          color: theme.palette.text.primary
                                        }}
                                        controlImage={isSmallScreen ? undefined : '40%'}
                                      />
                                    )}
                                  </span>
                                </Box>
                              ))}
                          </span>
                        </Grid>
                      ) : isSmallScreen ? (
                        <></>
                      ) : (
                        <Grid item xs></Grid>
                      )}
                      <Grid item>
                        <Stack direction='row' justifyContent='end' alignItems='center' spacing={2}>
                          {board.group?.label && (
                            <Chip
                              label={board.group.label?.title}
                              style={{ backgroundColor: `${board.group.label?.background_color}` }}
                              color={isColorDark(board.group.label?.background_color) ? 'primary' : 'default'}
                            />
                          )}
                          <Typography>{moment(board.created_at).format('jYYYY/jMM/jDD')}</Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant='body1' sx={{ mb: 2 }}>
                        کاربرهای روند:
                      </Typography>
                      <Stack direction='row' divider={<Divider orientation='vertical' flexItem />} spacing={4}>
                        {board?.flow_users?.map(user => (
                          <Chip
                            key={`flow_${user.id}`}
                            avatar={
                              <Avatar
                                alt={user?.last_name}
                                src={`${user.avatar}?width=120`}
                                imgProps={{ crossOrigin: 'use-credentials' }}
                                sx={{ width: '2.5rem', height: '2.5rem' }}
                              />
                            }
                            label={`${user?.first_name || ''} ${user?.last_name || ''}`}
                            variant='outlined'
                          />
                        ))}
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Link>
        ))}
      </Box>
      {/* Pagination Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <Pagination count={totalPages} color='primary' page={currentPage} onChange={handlePageChange} />
      </Box>
    </Box>
  )
}

export default Tasks
