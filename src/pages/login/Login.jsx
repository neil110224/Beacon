import { Box, TextField, Button, Slide } from '@mui/material';
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
import { Alert } from '@mui/material';
import Snackbar from '../../component/reuseable/snackbar';




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



const [snackbarMessage, setSnackbarMessage] = React.useState('');
const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');



  const onSubmit = async (data) => {
  try {
    const response = await userLogin(data).unwrap();

    const user = response.data.user;
    const token = response.data.access_token;

    dispatch(setCredentials({ user, token }));
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setSnackbarSeverity('success');
    setSnackbarMessage('Login Successful!');
    setSnackbarOpen(true);

    setTimeout(() => navigate("/Dashboard"), 1); // Navigate after 1.5 seconds

  } catch (error) {
    console.log(error);

    setSnackbarSeverity('error');
    setSnackbarMessage(
      error?.data?.message || "Invalid username or password"
    );
    setSnackbarOpen(true);
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
    width: '75%',                // slightly smaller width
    maxWidth: { xs: '100%', md: 750 },  // reduced from 900
    height: { xs: 'auto', md: 450 },    // reduced from 520
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    bgcolor: '#ffffff',
    borderRadius: 2,
    boxShadow: '0 8px 25px rgba(51, 47, 47, 0.12)', // softer shadow
    overflow: 'hidden',
    position: 'relative',
  }}
>

        {/* LEFT PANEL - Form */}
        <Box
  component="form"
  onSubmit={handleSubmit(onSubmit)}
  sx={{
    flex: 1,
    p: { xs: 3, md: 6 }, // reduced from 10
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }}
>

          <Box sx={{ mb: 5 }}>
            <Box
  component="h2"
  sx={{
    m: 2, // reduced from 4
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 500,
    letterSpacing: 1,
    textAlign: 'center',
    fontSize: { xs: 18, md: 22 } // slightly smaller
  }}
>

              Welcome to  <Box component="span" sx={{ color: '#005a7e', fontWeight: 900, fontSize: { xs: 25, md: 30 } }}>Beacon!</Box>
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
                height: 8, // slightly smaller height
              }
            }}
          />

          <Button
  type="submit"
  fullWidth
  sx={{
    py: { xs: 0.9, md: 1.1 }, // smaller height
    bgcolor: '#2bb0e6',
    color: '#ffffff',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 700,
    fontSize: { xs: 12, md: 13 },
    mb: 2,
    '&:hover': { bgcolor: '#1a97c9' },
    boxShadow: '0px 4px 4px rgba(0,0,0,0.4)',
  }}
>
  SIGN IN
</Button>
<Box sx={{display:'flex', flexDirection:'column', alignItems:'center', gap:0.5, mt: 3}}>
<img src={mis} alt="MIS Logo" style={{ width: 50, height: 'auto', objectFit: 'contain' }} />
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 200, fontSize: 9 }}>
              Powered By <strong>MIS</strong>
            </div>
            <div style={{ fontFamily: 'Montserrat, sans-serif',fontWeight: 300, fontSize: 9 }}>
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
          >
            
          </Box>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
  open={snackbarOpen}
  message={snackbarMessage}
  severity={snackbarSeverity}
  onClose={() => setSnackbarOpen(false)}
/>


    </Box>
  );
};

export default Login;
