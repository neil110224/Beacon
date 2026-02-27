import { Box, TextField, Button, Slide, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import reindeer from "../../assets/reindeer.jpg";
import mis from "../../assets/mis.png";
import { schema } from '../schema/LoginSchema';
import { useUserLoginMutation } from '../../features/api/login/loginApi';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/api/slice/authSlice';
import React, { useState } from 'react';
import Snackbar from '../../component/reuseable/Snackbar';

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userLogin] = useUserLoginMutation();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { username: '', password: '' }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await userLogin(data).unwrap();

      const user = response.data.user;
      const token = response.data.access_token;

      dispatch(setCredentials({ user, token }));
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("loginSuccess", "true");

      // Navigate immediately
      navigate("/Dashboard");

    } catch (error) {
      console.log(error);
      setSnackbarSeverity('error');
      setSnackbarMessage(error?.data?.message || "Invalid username or password");
      setSnackbarOpen(true);
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#27374D',
      }}
    >
      <Box
        sx={{
          width: '75%',
          maxWidth: { xs: '100%', md: 750 },
          height: { xs: 'auto', md: 450 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          bgcolor: '#1a1a2e',
          borderRadius: 2,
          boxShadow: '0 8px 25px rgba(51, 47, 47, 0.12)',
          overflow: 'hidden',
          position: 'relative',
          color: '#f4f4f4'
        }}
      >
        {/* LEFT PANEL - Form */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            flex: 1,
            p: { xs: 3, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ mb: 5 }}>
            <Box
              component="h2"
              sx={{
                m: 2,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 500,
                letterSpacing: 1,
                textAlign: 'center',
                fontSize: { xs: 18, md: 22 }
              }}
            >
              Welcome to{' '}
              <Box component="span" sx={{ color: '#0387bb', fontWeight: 900, fontSize: { xs: 25, md: 30 } }}>
                Beacon!
              </Box>
            </Box>
          </Box>

          <TextField
            {...register('username')}
            placeholder="Username"
            fullWidth
            error={!!errors.username}
            helperText={errors.username?.message}
            sx={{
              mb: 1,
              '& .MuiInputBase-input': {
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: { xs: 9, md: 11 },
                height: 8,
                color: '#f4f4f4'
              }
            }}
          />

          <TextField
            {...register('password')}
            placeholder="Password"
            type="password"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{
              mb: 1.5,
              '& .MuiInputBase-input': {
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: { xs: 9, md: 11 },
                height: 8,
                color: '#f4f4f4'
              }
            }}
          />

          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
            sx={{
              py: { xs: 0.6, md: 0.8 },
              bgcolor: '#0397d1',
              color: '#ffffff',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              fontSize: { xs: 12, md: 13 },
              mb: 2,
              '&:hover': { bgcolor: '#027baa' },
              '&:disabled': { bgcolor: '#0397d1', opacity: 0.7 },
              boxShadow: '0px 4px 4px rgba(0,0,0,0.4)',
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} sx={{ color: '#ffffff' }} />
                <span>Signing In...</span>
              </Box>
            ) : (
              'SIGN IN'
            )}
          </Button>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, mt: 3 }}>
            <img src={mis} alt="MIS Logo" style={{ width: 50, height: 'auto', objectFit: 'contain' }} />
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 200, fontSize: 9 }}>
              Powered By <strong>MIS</strong>
            </div>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300, fontSize: 9 }}>
              All rights reserved © 2026
            </div>
          </Box>
        </Box>

        {/* RIGHT PANEL */}
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <img
            src={reindeer}
            alt="Work Illustration"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              textAlign: 'center',
              color: '#fff',
              textShadow: '0 0 5px rgba(0,0,0,0.5)',
            }}
          />
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ marginTop: '20px' }}
      />
    </Box>
  );
};

export default Login;