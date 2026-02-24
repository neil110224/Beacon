import { Box } from '@mui/material'
import React from 'react'
import { useGetRolesQuery } from '../../features/api/role/roleApi'

const practice = () => {
  const { data } = useGetRolesQuery({ status: 'active' });
  return (
    <Box>
        practice
    </Box>
  )
}

export default practice
