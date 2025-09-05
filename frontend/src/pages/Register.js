import React, { useState } from 'react';
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
  Avatar,
  useTheme
} from '@mui/material';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';

const Register = () => {
  const theme = useTheme();
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
        backgroundColor: theme.palette.background.default,
        p: 2
      }}
    >
      
      <Paper 
        elevation={3} 
        sx={{
          p: 5,
          maxWidth: 500,
          width: '100%',
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[3]
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                 sx={{
                   width: 80,
                   height: 80,
                   margin: '0 auto 24px',
                   backgroundColor: theme.palette.primary.main,
                   boxShadow: theme.shadows[4]
                 }}
               >
                 <PersonAddIcon sx={{ fontSize: 40, color: 'white' }} />
               </Avatar>
               <Typography 
                 variant="h4" 
                 component="h1" 
                 gutterBottom
                 sx={{
                   color: theme.palette.text.primary,
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
                     backgroundColor: theme.palette.background.default,
                     '&:hover': {
                       borderColor: theme.palette.primary.main
                     },
                     '&.Mui-focused': {
                       backgroundColor: theme.palette.background.paper
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
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.default,
                      '&:hover': {
                        borderColor: theme.palette.primary.main
                      },
                      '&.Mui-focused': {
                        backgroundColor: theme.palette.background.paper
                      }
                    }
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
                     backgroundColor: theme.palette.background.default,
                     '&:hover': {
                       borderColor: theme.palette.primary.main
                     },
                     '&.Mui-focused': {
                       backgroundColor: theme.palette.background.paper
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
                     backgroundColor: theme.palette.background.default,
                     '&:hover': {
                       borderColor: theme.palette.primary.main
                     },
                     '&.Mui-focused': {
                       backgroundColor: theme.palette.background.paper
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
                   backgroundColor: theme.palette.primary.main,
                   color: theme.palette.primary.contrastText,
                   fontWeight: 600,
                   fontSize: '1.1rem',
                   textTransform: 'none',
                   '&:hover': {
                     backgroundColor: theme.palette.primary.dark
                   },
                   '&:disabled': {
                     backgroundColor: theme.palette.action.disabled
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
                       color: theme.palette.primary.main,
                       textDecoration: 'none',
                       fontWeight: 600,
                       '&:hover': {
                         textDecoration: 'underline',
                         color: theme.palette.primary.dark
                       }
                     }}
                   >
                     Sign In
                   </MuiLink>
                 </Typography>
               </Box>
             </Box>
           </Paper>
     </Box>
   );
};

export default Register;