import { Box } from '@mui/material'
import logo from '../../assets/logo.png'
import React from 'react'

const LogoutAnimation = () => {
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
      }}
    >
      <img
        src={logo}
        alt="Logo"
        style={{
          width: 120,
          height: 120,
          animation: 'logout-spin-scale 1.5s infinite cubic-bezier(0.4,0,0.2,1)',
        }}
      />
      <style>
        {`
          @keyframes logout-spin-scale {
            0% {
              transform: rotate(0deg) scale(1);
            }
            25% {
              transform: rotate(90deg) scale(1.2);
            }
            50% {
              transform: rotate(180deg) scale(0.8);
            }
            75% {
              transform: rotate(270deg) scale(1.2);
            }
            100% {
              transform: rotate(360deg) scale(1);
            }
          }
        `}
      </style>
    </Box>
  )
}

export default LogoutAnimation
