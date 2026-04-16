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
import './login.scss';

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

const fieldSx = {
  mb: 1,
  '& .MuiInputBase-input': {
    fontFamily: 'Oswald, sans-serif',
    fontWeight: 700,
    fontSize: { xs: 9, md: 11 },
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
      className="login-container"
    >
      <Box
        className="login-card"
      >
        {/* LEFT PANEL */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          className="login-left-panel"
        >
          <Box className="login-header">
            <Box
              component="h2"
              className="login-title"
            >
              Welcome to{' '}
              <Box component="span" className="login-title-highlight">
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
                className="login-textfield"
                sx={fieldSx}
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
                className="login-textfield"
                sx={fieldSx}
              />
            )}
          />

          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
            className="login-button"
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

          <Box className="login-footer">
            <img src={mis} alt="MIS Logo" style={{ width: 50, height: 'auto', objectFit: 'contain' }} />
            <div className="login-mis-text" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 200, fontSize: 9 }}>
              Powered By <strong>MIS</strong>
            </div>
            <div className="login-mis-text" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 300, fontSize: 9 }}>
              All rights reserved © 2026
            </div>
          </Box>
        </Box>

        {/* RIGHT PANEL */}
        <Box
          className="login-right-panel"
        >
          <img
            src={reindeer}
            alt="Work Illustration"
            className="login-image"
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