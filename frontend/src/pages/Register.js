import React, { useState, useContext } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Link as MuiLink,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Fade,
  Slide,
  Avatar,
  useTheme
} from '@mui/material';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const { register, isAuthenticated, loading, error } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when field is edited
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      await register(formData.name, formData.email, formData.password);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          animation: 'pulse 4s ease-in-out infinite'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          right: -150,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          animation: 'pulse 6s ease-in-out infinite'
        }}
      />
      
      <Fade in timeout={800}>
        <Slide direction="up" in timeout={600}>
          <Paper 
            elevation={24} 
            sx={{
              p: 5,
              maxWidth: 500,
              width: '100%',
              borderRadius: 4,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              position: 'relative',
              zIndex: 1
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                }}
              >
                <PersonAddIcon sx={{ fontSize: 40, color: 'white' }} />
              </Avatar>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                  mb: 1
                }}
              >
                SYMBI Synergy
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                Join the future of AI collaboration
              </Typography>
            </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
               <TextField
                 margin="normal"
                 required
                 fullWidth
                 id="name"
                 label="Full Name"
                 name="name"
                 autoComplete="name"
                 autoFocus
                 value={formData.name}
                 onChange={handleChange}
                 error={!!formErrors.name}
                 helperText={formErrors.name}
                 variant="outlined"
                 InputProps={{
                   startAdornment: (
                     <InputAdornment position="start">
                       <PersonIcon sx={{ color: 'primary.main' }} />
                     </InputAdornment>
                   ),
                 }}
                 sx={{
                   mb: 2,
                   '& .MuiOutlinedInput-root': {
                     borderRadius: 2,
                     backgroundColor: 'rgba(255,255,255,0.8)',
                     transition: 'all 0.3s ease',
                     '&:hover': {
                       backgroundColor: 'rgba(255,255,255,0.9)',
                       transform: 'translateY(-1px)',
                       boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                     },
                     '&.Mui-focused': {
                       backgroundColor: 'rgba(255,255,255,1)',
                       transform: 'translateY(-1px)',
                       boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)'
                     }
                   },
                   '& .MuiInputLabel-root': {
                     fontWeight: 500
                   }
                 }}
               />
               <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255,255,255,1)',
                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                      },
                    },
                  }}
                />
               <TextField
                 margin="normal"
                 required
                 fullWidth
                 name="password"
                 label="Password"
                 type={showPassword ? 'text' : 'password'}
                 id="password"
                 autoComplete="new-password"
                 value={formData.password}
                 onChange={handleChange}
                 error={!!formErrors.password}
                 helperText={formErrors.password}
                 variant="outlined"
                 sx={{
                   mb: 2,
                   '& .MuiOutlinedInput-root': {
                     borderRadius: 2,
                     backgroundColor: 'rgba(255,255,255,0.8)',
                     transition: 'all 0.3s ease',
                     '&:hover': {
                       backgroundColor: 'rgba(255,255,255,0.9)',
                       transform: 'translateY(-1px)',
                       boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                     },
                     '&.Mui-focused': {
                       backgroundColor: 'rgba(255,255,255,1)',
                       transform: 'translateY(-1px)',
                       boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)'
                     }
                   },
                   '& .MuiInputLabel-root': {
                     fontWeight: 500
                   }
                 }}
                 InputProps={{
                   endAdornment: (
                     <InputAdornment position="end">
                       <IconButton
                         aria-label="toggle password visibility"
                         onClick={toggleShowPassword}
                         edge="end"
                         sx={{
                           color: 'primary.main',
                           '&:hover': {
                             backgroundColor: 'rgba(102, 126, 234, 0.1)'
                           }
                         }}
                       >
                         {showPassword ? <VisibilityOff /> : <Visibility />}
                       </IconButton>
                     </InputAdornment>
                   ),
                 }}
               />
               <TextField
                 margin="normal"
                 required
                 fullWidth
                 name="confirmPassword"
                 label="Confirm Password"
                 type={showPassword ? 'text' : 'password'}
                 id="confirmPassword"
                 autoComplete="new-password"
                 value={formData.confirmPassword}
                 onChange={handleChange}
                 error={!!formErrors.confirmPassword}
                 helperText={formErrors.confirmPassword}
                 variant="outlined"
                 sx={{
                   mb: 2,
                   '& .MuiOutlinedInput-root': {
                     borderRadius: 2,
                     backgroundColor: 'rgba(255,255,255,0.8)',
                     transition: 'all 0.3s ease',
                     '&:hover': {
                       backgroundColor: 'rgba(255,255,255,0.9)',
                       transform: 'translateY(-1px)',
                       boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                     },
                     '&.Mui-focused': {
                       backgroundColor: 'rgba(255,255,255,1)',
                       transform: 'translateY(-1px)',
                       boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)'
                     }
                   },
                   '& .MuiInputLabel-root': {
                     fontWeight: 500
                   }
                 }}
               />
               <Button
                 type="submit"
                 fullWidth
                 variant="contained"
                 disabled={loading}
                 sx={{ 
                   mt: 2, 
                   mb: 3,
                   py: 1.5,
                   borderRadius: 2,
                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                   fontWeight: 600,
                   fontSize: '1.1rem',
                   textTransform: 'none',
                   boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                   transition: 'all 0.3s ease',
                   '&:hover': {
                     background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                     transform: 'translateY(-2px)',
                     boxShadow: '0 8px 25px rgba(102, 126, 234, 0.6)'
                   },
                   '&:active': {
                     transform: 'translateY(0px)'
                   },
                   '&:disabled': {
                     background: 'linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%)',
                     transform: 'none',
                     boxShadow: 'none'
                   }
                 }}
               >
                 {loading ? (
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <CircularProgress size={20} sx={{ color: 'white' }} />
                     <span>Creating Account...</span>
                   </Box>
                 ) : (
                   'Create Account'
                 )}
               </Button>
               <Box sx={{ textAlign: 'center', mt: 3 }}>
                 <Typography variant="body2" color="text.secondary">
                   Already have an account?{' '}
                   <MuiLink 
                     component={Link} 
                     to="/login" 
                     sx={{
                       color: 'primary.main',
                       textDecoration: 'none',
                       fontWeight: 600,
                       '&:hover': {
                         textDecoration: 'underline'
                       }
                     }}
                   >
                     Sign In
                   </MuiLink>
                 </Typography>
               </Box>
             </Box>
           </Paper>
         </Slide>
       </Fade>
       
       {/* CSS Animations */}
       <style jsx global>{`
         @keyframes pulse {
           0%, 100% {
             transform: scale(1);
             opacity: 0.7;
           }
           50% {
             transform: scale(1.05);
             opacity: 0.9;
           }
         }
       `}</style>
     </Box>
   );
};

export default Register;