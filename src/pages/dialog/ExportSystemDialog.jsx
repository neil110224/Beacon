import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Card,
  CardContent,
} from '@mui/material'
import { useGetSystemsListQuery } from '../../features/api/system/systemApi'
import { useGetCategoriesListQuery } from '../../features/api/category/categoryApi'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

const OSWALD = '"Oswald", sans-serif'

const oswaldInputSx = {
  '& input, & textarea, & .MuiSelect-select': { fontFamily: OSWALD },
  '& .MuiInputLabel-root': { fontFamily: OSWALD },
  '& .MuiFormLabel-root': { fontFamily: OSWALD },
}

const ExportSystemDialog = ({ open, onClose, selectedTeam, filteredTeamSystems }) => {
  const [selectedSystems, setSelectedSystems] = React.useState({})
  const [selectedTeamId, setSelectedTeamId] = React.useState('all')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [selectedCategories, setSelectedCategories] = React.useState([])
  const [startDate, setStartDate] = React.useState('')
  const [endDate, setEndDate] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

  // ── Controlled open state for each DatePicker ──────────────────────────────
  const [startPickerOpen, setStartPickerOpen] = React.useState(false)
  const [endPickerOpen, setEndPickerOpen] = React.useState(false)

  const { data: allSystemsData, isLoading: allSystemsLoading } = useGetSystemsListQuery({
    status: 'active',
    scope: 'global',
    paginate: 'none',
    pagination: 'none',
  })

  const { data: categories = [], isLoading: loadingCategories } = useGetCategoriesListQuery({
    status: 'active',
    pagination: 'none',
  })

  const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'on hold', label: 'On Hold' },
    { value: 'done', label: 'Done' },
  ]

  const systemsData = React.useMemo(() => {
    if (!Array.isArray(allSystemsData)) {
      if (allSystemsData?.data?.data && Array.isArray(allSystemsData.data.data)) return allSystemsData.data.data
      if (allSystemsData?.data && Array.isArray(allSystemsData.data)) return allSystemsData.data
      return []
    }
    return allSystemsData || []
  }, [allSystemsData])

  React.useEffect(() => {
    if (categories.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories(categories.map((cat) => cat.id))
    }
  }, [categories])

  const allTeams = React.useMemo(() => {
    const teamsMap = new Map()
    systemsData?.forEach((system) => {
      system.team?.forEach((team) => {
        if (!teamsMap.has(team.id)) teamsMap.set(team.id, team)
      })
    })
    return Array.from(teamsMap.values())
  }, [systemsData])

  React.useEffect(() => {
    if (open) {
      if (selectedTeam?.id && filteredTeamSystems && filteredTeamSystems.length > 0) {
        setSelectedTeamId(selectedTeam.id)
      } else {
        setSelectedTeamId('all')
      }
    }
  }, [open, selectedTeam?.id, filteredTeamSystems])

  const selectedCategoriesKey = selectedCategories.join(',')
  const isAllCategories = selectedCategories.length === categories.length || selectedCategories.length === 0

  const systemCategoryMatches = React.useCallback(
    (sysCat) => {
      const selectedIds = selectedCategoriesKey.split(',').map(Number)
      const selectedNames = categories
        .filter((c) => selectedIds.includes(c.id))
        .map((c) => c.name?.toLowerCase())
      return selectedNames.includes(sysCat.categoryName?.toLowerCase())
    },
    [selectedCategoriesKey, categories]
  )

  const isWithinDateRange = React.useCallback(
    (raisedDate) => {
      if (!startDate && !endDate) return true
      const d = new Date(raisedDate)
      if (startDate && d < new Date(startDate)) return false
      if (endDate && d > new Date(endDate)) return false
      return true
    },
    [startDate, endDate]
  )

  const systemsForSelectedTeam = React.useMemo(() => {
    if (!systemsData || systemsData.length === 0) return []
    return systemsData.filter((system) => {
      if (selectedTeamId !== 'all' && selectedTeamId !== '') {
        const hasTeam = system.team.some((team) => team.id === parseInt(selectedTeamId))
        if (!hasTeam) return false
      }
      return true
    })
  }, [selectedTeamId, systemsData])

  const filteredSystemsByStatus = React.useMemo(() => {
    return systemsForSelectedTeam.filter((system) => {
      const relevantCats = isAllCategories
        ? system.categories
        : system.categories?.filter((cat) => systemCategoryMatches(cat))

      if (!relevantCats || relevantCats.length === 0) return false

      const hasMatchingProgress = relevantCats.some((cat) =>
        cat.progress?.some((item) => {
          if (statusFilter !== 'all' && item.status.toLowerCase() !== statusFilter.toLowerCase()) return false
          if (!isWithinDateRange(item.raised_date)) return false
          return true
        })
      )

      return hasMatchingProgress
    })
  }, [systemsForSelectedTeam, statusFilter, selectedCategoriesKey, isAllCategories, systemCategoryMatches, isWithinDateRange])

  const canExportSystem = React.useCallback(
    (system) => {
      if (!system.categories || system.categories.length === 0) return false
      const relevantCategories = isAllCategories
        ? system.categories
        : system.categories.filter((cat) => systemCategoryMatches(cat))
      if (relevantCategories.length === 0) return false

      return relevantCategories.some((cat) =>
        cat.progress?.some((item) => {
          if (statusFilter !== 'all' && item.status.toLowerCase() !== statusFilter.toLowerCase()) return false
          if (!isWithinDateRange(item.raised_date)) return false
          return true
        })
      )
    },
    [statusFilter, isAllCategories, systemCategoryMatches, isWithinDateRange]
  )

  const handleSelectAll = (checked) => {
    const newSelection = {}
    filteredSystemsByStatus?.forEach((system) => {
      if (canExportSystem(system)) newSelection[system.id] = checked
    })
    setSelectedSystems(newSelection)
  }

  const handleSelectSystem = (systemId, checked) => {
    setSelectedSystems((prev) => ({ ...prev, [systemId]: checked }))
  }

  // ─── Export helpers ────────────────────────────────────────────────────────

  const buildParams = (system) => {
    const params = new URLSearchParams()
    params.append('system_id', system.id)
    system.team?.forEach((team) => params.append('team_id', team.id))
    if (isAllCategories) {
      system.categories?.forEach((sysCat) => {
        const match = categories.find((c) => c.name?.toLowerCase() === sysCat.categoryName?.toLowerCase())
        if (match) params.append('category_id', match.id)
      })
    } else {
      selectedCategories.forEach((id) => params.append('category_id', id))
    }
    params.append('year', new Date().getFullYear().toString())
    if (statusFilter !== 'all') params.append('status', statusFilter)
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return params
  }

  const fetchBlob = async (system, token) => {
    const url = `http://10.10.14.61:8000/api/export?${buildParams(system).toString()}`
    console.log(`🔍 [${system.systemName}] Export URL:`, url)
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
    if (!res.ok) throw new Error(`Export failed for ${system.systemName} (status ${res.status})`)
    const blob = await res.blob()
    if (blob.size === 0) throw new Error(`Empty response for ${system.systemName}`)
    return blob
  }

  const mergeXlsxBlobs = async (blobs) => {
    const JSZip = (await import('jszip')).default

    const zips = await Promise.all(
      blobs.map(async (blob) => JSZip.loadAsync(await blob.arrayBuffer()))
    )

    const baseZip = zips[0]
    let baseSheetXml = await baseZip.file('xl/worksheets/sheet1.xml').async('string')
    let baseSSXml = await baseZip.file('xl/sharedStrings.xml').async('string')

    const parseSharedStrings = (xml) => {
      const matches = [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)]
      return matches.map((m) => m[0])
    }

    const mergedStrings = parseSharedStrings(baseSSXml)

    const rowNums = [...baseSheetXml.matchAll(/<row\b[^>]*\br="(\d+)"/g)].map((m) => parseInt(m[1]))
    let maxRow = rowNums.length ? Math.max(...rowNums) : 1

    for (let i = 1; i < zips.length; i++) {
      const sheetXml = await zips[i].file('xl/worksheets/sheet1.xml').async('string')
      const ssXml = await zips[i].file('xl/sharedStrings.xml').async('string')

      const zipStrings = parseSharedStrings(ssXml)

      const remap = {}
      zipStrings.forEach((si, oldIdx) => {
        const existingIdx = mergedStrings.findIndex((s) => s === si)
        if (existingIdx !== -1) {
          remap[oldIdx] = existingIdx
        } else {
          remap[oldIdx] = mergedStrings.length
          mergedStrings.push(si)
        }
      })

      const sdMatch = sheetXml.match(/<sheetData[^>]*>([\s\S]*?)<\/sheetData>/)
      if (!sdMatch || !sdMatch[1].trim()) continue

      const rowRegex = /<row\b[^>]*\br="(\d+)"[^>]*>[\s\S]*?<\/row>/g
      const allMatches = [...sdMatch[1].matchAll(rowRegex)]
      const dataRows = allMatches.filter((m) => parseInt(m[1]) >= 2)

      for (const match of dataRows) {
        maxRow++
        const newR = maxRow
        let row = match[0]

        row = row.replace(/^(<row\b[^>]*\b)r="\d+"/, `$1r="${newR}"`)
        row = row.replace(/(<c\b[^>]*\b)r="([A-Z]+)\d+"/g, `$1r="$2${newR}"`)
        row = row.replace(/(<c\b[^>]*\bt="s"[^>]*>[\s\S]*?<v>)(\d+)(<\/v>)/g, (_, pre, idx, post) => {
          const newIdx = remap[parseInt(idx)] ?? parseInt(idx)
          return `${pre}${newIdx}${post}`
        })

        baseSheetXml = baseSheetXml.replace('</sheetData>', `${row}</sheetData>`)
      }
    }

    const totalCount = mergedStrings.length
    const newSSXml = baseSSXml
      .replace(/count="\d+"/, `count="${totalCount}"`)
      .replace(/uniqueCount="\d+"/, `uniqueCount="${totalCount}"`)
      .replace(/<si>[\s\S]*?<\/si>/g, '')
      .replace('</sst>', `${mergedStrings.join('')}</sst>`)

    baseZip.file('xl/worksheets/sheet1.xml', baseSheetXml)
    baseZip.file('xl/sharedStrings.xml', newSSXml)

    return baseZip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
  }

  // ─── Main export handler ───────────────────────────────────────────────────

  const handleExport = async () => {
    const selectedSystemIds = Object.keys(selectedSystems).filter((id) => selectedSystems[id])
    const systemsToExport = filteredSystemsByStatus?.filter(
      (system) => selectedSystemIds.includes(system.id.toString()) && canExportSystem(system)
    )

    if (systemsToExport.length === 0) {
      setSnackbar({ open: true, message: 'Please select at least one system with items to export', severity: 'error' })
      return
    }
    if (selectedCategories.length === 0) {
      setSnackbar({ open: true, message: 'Please select at least one category to export', severity: 'error' })
      return
    }

    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')

      const blobs = await Promise.all(systemsToExport.map((s) => fetchBlob(s, token)))

      const teamNameSuffix = selectedTeamId === 'all'
        ? 'all-teams'
        : allTeams.find((t) => t.id === parseInt(selectedTeamId))?.name || 'export'
      const statusSuffix = statusFilter === 'all' ? '' : `-${statusFilter}`
      const dateSuffix = startDate || endDate ? `-${startDate || 'start'}_to_${endDate || 'end'}` : ''
      const fileName = `systems-export-${teamNameSuffix}${statusSuffix}${dateSuffix}.xlsx`

      const finalBlob = blobs.length === 1 ? blobs[0] : await mergeXlsxBlobs(blobs)

      const url_obj = URL.createObjectURL(finalBlob)
      const link = document.createElement('a')
      link.href = url_obj
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url_obj)

      setSnackbar({ open: true, message: `Successfully exported ${systemsToExport.length} system(s) to Excel`, severity: 'success' })
      onClose()
    } catch (error) {
      console.error('Export error:', error)
      setSnackbar({ open: true, message: error.message || 'Failed to export systems to Excel', severity: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }))
  const selectedCount = Object.values(selectedSystems).filter(Boolean).length

  React.useEffect(() => { setSelectedSystems({}) }, [selectedTeamId])
  React.useEffect(() => { setSelectedSystems({}) }, [selectedCategories])
  React.useEffect(() => { setSelectedSystems({}) }, [startDate, endDate])

  const resetForm = React.useCallback(() => {
    setSelectedSystems({})
    setSelectedTeamId('all')
    setStatusFilter('all')
    setSelectedCategories(categories.map((cat) => cat.id))
    setStartDate('')
    setEndDate('')
    setStartPickerOpen(false)
    setEndPickerOpen(false)
    setIsLoading(false)
    setSnackbar({ open: false, message: '', severity: 'success' })
  }, [categories])

  React.useEffect(() => {
    if (open) resetForm()
  }, [open, resetForm])

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: OSWALD, fontWeight: 600, color: '#2c3e50' }}>
          Export Systems
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>

            {/* Team Selector */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: OSWALD }}>Select Team</InputLabel>
              <Select
                value={selectedTeamId}
                label="Select Team"
                onChange={(e) => { setSelectedTeamId(e.target.value); setSelectedSystems({}) }}
                disabled={allSystemsLoading || (allTeams.length === 0 && selectedTeamId !== 'all')}
                sx={{ fontFamily: OSWALD }}
              >
                <MenuItem value="all" sx={{ fontFamily: OSWALD }}>All Teams</MenuItem>
                {allTeams.map((team) => (
                  <MenuItem key={team.id} value={team.id} sx={{ fontFamily: OSWALD }}>
                    {team.name} ({team.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Category Selector */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: OSWALD }}>Select Category</InputLabel>
              <Select
                value={isAllCategories ? 'all' : selectedCategories[0]}
                label="Select Category"
                onChange={(e) => {
                  const val = e.target.value
                  setSelectedCategories(val === 'all' ? categories.map((c) => c.id) : [val])
                }}
                disabled={isLoading || loadingCategories}
                sx={{ fontFamily: OSWALD }}
              >
                <MenuItem value="all" sx={{ fontFamily: OSWALD }}>All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id} sx={{ fontFamily: OSWALD }}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Status Filter */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: OSWALD }}>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={isLoading}
                sx={{ fontFamily: OSWALD }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value} sx={{ fontFamily: OSWALD }}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Date Range — filters by raised_date */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, fontFamily: OSWALD }}>
                  Raised Date From
                </Typography>
                <DatePicker
                  value={startDate ? dayjs(startDate) : null}
                  onChange={(newValue) => {
                    setStartDate(newValue ? newValue.format('YYYY-MM-DD') : '')
                    setStartPickerOpen(false)
                  }}
                  open={startPickerOpen}
                  onOpen={() => setStartPickerOpen(true)}
                  onClose={() => setStartPickerOpen(false)}
                  disabled={isLoading}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      sx: oswaldInputSx,
                      inputProps: { readOnly: true },
                      onClick: () => !isLoading && setStartPickerOpen(true),
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, fontFamily: OSWALD }}>
                  Raised Date To
                </Typography>
                <DatePicker
                  value={endDate ? dayjs(endDate) : null}
                  onChange={(newValue) => {
                    setEndDate(newValue ? newValue.format('YYYY-MM-DD') : '')
                    setEndPickerOpen(false)
                  }}
                  open={endPickerOpen}
                  onOpen={() => setEndPickerOpen(true)}
                  onClose={() => setEndPickerOpen(false)}
                  disabled={isLoading}
                  minDate={startDate ? dayjs(startDate) : undefined}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      sx: oswaldInputSx,
                      inputProps: { readOnly: true },
                      onClick: () => !isLoading && setEndPickerOpen(true),
                    },
                  }}
                />
              </Box>
            </Box>

            {(startDate || endDate) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontFamily: OSWALD, fontSize: '0.8rem', color: '#666' }}>
                  Filtering by raised date: {startDate || '...'} → {endDate || '...'}
                </Typography>
                <Button
                  size="small"
                  onClick={() => { setStartDate(''); setEndDate('') }}
                  sx={{ fontFamily: OSWALD, fontSize: '0.75rem', minWidth: 'auto', color: '#e74c3c' }}
                >
                  Clear
                </Button>
              </Box>
            )}

            <Divider />

            {/* Select All */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    filteredSystemsByStatus.length > 0 &&
                    selectedCount === filteredSystemsByStatus.filter((s) => canExportSystem(s)).length &&
                    selectedCount > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  disabled={isLoading || filteredSystemsByStatus.length === 0}
                />
              }
              label={
                <Typography sx={{ fontFamily: OSWALD }}>
                  Select All ({selectedCount}/{filteredSystemsByStatus.filter((s) => canExportSystem(s)).length})
                </Typography>
              }
            />

            {/* Systems List */}
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {allSystemsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
                  <CircularProgress />
                </Box>
              ) : filteredSystemsByStatus && filteredSystemsByStatus.length > 0 ? (
                filteredSystemsByStatus.map((system) => (
                  <Card
                    key={system.id}
                    sx={{
                      mb: 2,
                      backgroundColor: canExportSystem(system) ? '#f8f9fa' : '#f5f5f5',
                      opacity: canExportSystem(system) ? 1 : 0.6,
                    }}
                  >
                    <CardContent sx={{ pb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Checkbox
                          checked={selectedSystems[system.id] || false}
                          onChange={(e) => handleSelectSystem(system.id, e.target.checked)}
                          disabled={isLoading || !canExportSystem(system)}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontFamily: OSWALD, fontWeight: 600, fontSize: '1rem', color: !canExportSystem(system) ? '#999' : '#000' }}>
                            {system.systemName}
                          </Typography>
                          <Typography sx={{ fontFamily: OSWALD, fontSize: '0.85rem', color: '#666', mt: 0.5 }}>
                            Teams: {system.team.map((t) => t.name).join(', ')}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography sx={{ fontFamily: OSWALD, textAlign: 'center', color: '#999', py: 3 }}>
                  {systemsForSelectedTeam.length === 0
                    ? 'No systems available for this team'
                    : 'No systems match the selected filters'}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isLoading} sx={{ fontFamily: OSWALD }}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={selectedCount === 0 || isLoading || selectedCategories.length === 0}
            startIcon={isLoading && <CircularProgress size={20} />}
            sx={{ backgroundColor: '#2c3e50', fontFamily: OSWALD, '&:hover': { backgroundColor: '#34495e' } }}
          >
            {isLoading ? 'Exporting...' : `Export (${selectedCount})`}
          </Button>
        </DialogActions>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} variant="filled" onClose={handleCloseSnackbar} sx={{ fontFamily: OSWALD }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Dialog>
    </LocalizationProvider>
  )
}

export default ExportSystemDialog