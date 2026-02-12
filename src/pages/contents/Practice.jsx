import { Box } from '@mui/material'
import React from 'react'
import { useGetRolesQuery } from '../../features/api/role/roleApi'

const { data } = useGetRolesQuery();
const practice = () => {
  return (
    <Box>
        practice
    </Box>
  )
}

export default practice
