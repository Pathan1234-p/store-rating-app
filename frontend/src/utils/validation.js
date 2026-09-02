export const validateName = (name) => {
  if (!name || name.length < 20 || name.length > 60) {
    return 'Name must be between 20 and 60 characters';
  }
  return '';
};

export const validateAddress = (address) => {
  if (!address) return 'Address is required';
  if (address.length > 400) return 'Address must be at most 400 characters';
  return '';
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !re.test(email)) return 'Invalid email format';
  return '';
};

export const validatePassword = (password) => {
  if (!password || password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return '';
};

export const parseApiErrors = (error) => {
  if (error.response?.data?.errors) {
    return error.response.data.errors.map((e) => e.msg).join(', ');
  }
  return error.response?.data?.message || 'An error occurred';
};
