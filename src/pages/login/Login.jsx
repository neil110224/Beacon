import { Box, TextField, Button, Snackbar, Slide } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import reindeer from "../../assets/reindeer.jpg";
import mis from "../../assets/mis.png";
import { schema } from '../schema/LoginSchema';
import { useUserLoginMutation } from '../../features/api/login/loginApi';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/api/slice/authSlice';
import React from 'react';

function SlideTransition(props) {
  return <Slide {...props} direction="left" />; // Slide in from the right
}

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userLogin] = useUserLoginMutation();

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  // React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { username: '', password: '' }
  });

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      const response = await userLogin(data).unwrap();

      const user = response.data.user;
      const token = response.data.access_token;

      dispatch(setCredentials({ user, token }));
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Show success snackbar
      setSnackbarOpen(true);

      // Navigate after a short delay so user sees the snackbar
      setTimeout(() => navigate("/home"), 1200);
    } catch (error) {
      console.log(error);
      // Optionally show error snackbar
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', md: 900 },
          height: { xs: 'auto', md: 520 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          bgcolor: '#fff',
          borderRadius: 2,
          boxShadow: '0 10px 30px rgba(51, 47, 47, 0.15)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* LEFT PANEL - Form */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            mt: { xs: 'auto', md: 'auto' },
            mb: { xs: 4, md: 8 },
            flex: { xs: 1, md: 1 },
            p: { xs: 3, md: 10 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Box
              component="h2"
              sx={{
                m: 4,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                letterSpacing: 1,
                textAlign: 'center',
                fontSize: { xs: 24, md: 28 }
              }}
            >
              SIGN <Box component="span" sx={{ color: '#2bb0e6' }}>IN</Box>
            </Box>
          </Box>

          <TextField
            {...register('username')}
            placeholder="Username"
            fullWidth
            error={!!errors.username}
            helperText={errors.username?.message}
            sx={{
              mb: 2.5,
              '& .MuiInputBase-input': {
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: { xs: 12, md: 14 },
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
                fontSize: { xs: 12, md: 14 },
              }
            }}
          />

          <Button
            type="submit"
            fullWidth
            sx={{
              py: { xs: 1, md: 1.3 },
              bgcolor: '#2bb0e6',
              color: '#fff',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: { xs: 12, md: 14 },
              mb: 3,
              '&:hover': { bgcolor: '#1a97c9' },
              boxShadow: '0px 5px 5px rgba(0,0,0,0.5)',
            }}
          >
            SIGN IN
          </Button>
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
              top: 16,
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
          >
            <img src={mis} alt="MIS Logo" style={{ width: 50, height: 'auto', objectFit: 'contain' }} />
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 12 }}>
              Powered By <strong>MIS</strong>
            </div>
            <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
              All rights reserved © 2021
            </div>
          </Box>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        autoHideDuration={1200}
        message="Login Successful!"
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Bottom-right
        sx={{ '& .MuiSnackbarContent-root': { bgcolor: 'green' } }} // Green background
      />
    </Box>
  );
};

export default Login;
