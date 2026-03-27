import { Box, TextField, Button, Slide, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
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

const fieldSx = {
  mb: 1,
  '& .MuiInputLabel-root': {
    color: '#03346E',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#03346E',
  },
  // ✅ When label floats up, give it the same bg as the panel so it masks the border cleanly
  '& .MuiInputLabel-shrink': {
    backgroundColor: '#f4f4f4',
    px: 0.5,
    borderRadius: '4px',
    left: '-4px',
    paddingLeft: '4px',
    paddingRight: '4px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#03346E',
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#03346E',
  },
  '& .MuiInputBase-input': {
    fontFamily: 'Oswald, sans-serif',
    fontWeight: 700,
    fontSize: { xs: 9, md: 11 },
    color: '#03346E',
  },
}

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userLogin] = useUserLoginMutation();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
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

      if (data.username === data.password) {
        localStorage.setItem("forceChangePassword", "true");
      }

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
        bgcolor: '#dadada',
      }}
    >
      <Box
        sx={{
          width: '75%',
          maxWidth: { xs: '100%', md: 750 },
          height: { xs: 'auto', md: 450 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          bgcolor: '#f4f4f4',
          borderRadius: 2,
          boxShadow: '0 8px 25px rgba(51, 47, 47, 0.12)',
          overflow: 'hidden',
          position: 'relative',
          color: '#03346E',
        }}
      >
        {/* LEFT PANEL */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            flex: 1,
            p: { xs: 3, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: '#03346E',
          }}
        >
          <Box sx={{ mb: 5 }}>
            <Box
              component="h2"
              sx={{
                m: 2,
                fontFamily: 'Oswald, sans-serif',
                fontWeight: 500,
                letterSpacing: 1,
                textAlign: 'center',
                fontSize: { xs: 18, md: 22 },
                color: '#03346E',
              }}
            >
              Welcome to{' '}
              <Box component="span" sx={{ color: '#0387bb', fontWeight: 900, fontFamily: 'Oswald, sans-serif', fontSize: { xs: 25, md: 30 } }}>
                Beacon!
              </Box>
            </Box>
          </Box>

          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Username"
                variant="outlined"
                fullWidth
                error={!!errors.username}
                helperText={errors.username?.message}
                disabled={isLoading}
                sx={{
                  ...fieldSx,
                  mb: 2,
                  color: '#03346E',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#03346E',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#03346E',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#03346E',
                  },
                }}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoading}
                sx={{
                  ...fieldSx,
                  mb: 2,
                  color: '#03346E',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#03346E',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#03346E',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#03346E',
                  },
                }}
              />
            )}
          />

          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
            sx={{
              py: { xs: 0.6, md: 0.8 },
              bgcolor: '#0397d1',
              color: '#03346E',
              fontFamily: 'Oswald, sans-serif',
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
            <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 200, fontSize: 9 }}>
              Powered By <strong>MIS</strong>
            </div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 300, fontSize: 9 }}>
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