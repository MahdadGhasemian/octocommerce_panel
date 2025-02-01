// ** React Imports
import { useEffect, useRef, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import { Autocomplete, Box, Button, Grid, TextField, useMediaQuery, useTheme } from '@mui/material'

// ** Icons Imports
import { Pencil, PencilOff, Plus } from 'mdi-material-ui'

// ** Component Imports
import KanbanApp, { KanbanAppRef } from '@/components/kanban/KanbanApp'

// ** Services Import
import TaskService, { Project } from '@/services/task.service'

const Default_Project = {
  id: 0,
  title: 'تمامی گروه های کاری'
}

const Tasks = () => {
  // ** States
  const [editMode, setEditMode] = useState<boolean>(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsData, setProjectsData] = useState<Project[]>([])
  const [project, setProject] = useState<Project | null>(Default_Project)

  // ** Hook
  const router = useRouter()
  const theme = useTheme()

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  // Kanban Ref
  const kanbanAppRef = useRef<KanbanAppRef>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = () => {
    TaskService.getAllProject()
      .then(response => {
        const updatedProjects = [Default_Project, ...response.data]
        setProjects(updatedProjects)
        setProjectsData(response.data)
      })
      .catch(e => {
        e
      })
  }

  const handleGoToLabel = () => {
    router.push('/tasks/label')
  }

  const handleProjectSelect = (project: Project | null) => {
    setProject(project)
  }

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', overflowX: 'auto', overflowY: 'hidden' }}>
      <Grid container spacing={4} alignItems={'center'} sx={{ py: 1 }}>
        <Grid item xs={12} sm={3}>
          <Box
            sx={{
              minHeight: 64,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Autocomplete
              id='project_selector_board'
              value={project}
              options={projects || []}
              getOptionLabel={project => `${project.title}`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText={'هیچ آیتمی موجود نیست'}
              renderOption={(props, project) => (
                <Box
                  component='li'
                  {...props}
                  key={project.title}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: theme => theme.palette.divider
                    }
                  }}
                >
                  {project.title}
                </Box>
              )}
              renderInput={params => <TextField {...params} label='گروه کاری' />}
              onChange={(_, value) => handleProjectSelect(value)}
              size='small'
              sx={{ marginX: 2 }}
              fullWidth
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Box
            sx={{
              minHeight: 64,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'end'
            }}
          >
            <Button
              type='submit'
              size='small'
              variant='outlined'
              color={editMode ? 'info' : 'primary'}
              onClick={() => setEditMode(!editMode)}
              sx={{ marginX: 2 }}
            >
              {editMode ? <Pencil /> : <PencilOff />}
            </Button>
            <Button
              type='submit'
              size='small'
              variant='outlined'
              onClick={() => kanbanAppRef.current?.triggerNewGroup()}
              sx={{ marginX: 2 }}
            >
              {!isSmallScreen && <span>ایجاد لیست جدید</span>}
              <Plus />
            </Button>
            <Button type='submit' size='small' variant='outlined' sx={{ marginX: 2 }} onClick={handleGoToLabel}>
              برچسب ها
            </Button>
          </Box>
        </Grid>
      </Grid>

      <KanbanApp
        editMode={editMode}
        projects={projectsData}
        project_filter={project?.id !== 0 ? project : null}
        ref={kanbanAppRef}
      ></KanbanApp>
    </Box>
  )
}

export default Tasks
