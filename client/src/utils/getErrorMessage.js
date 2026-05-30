const FRIENDLY_MESSAGES = {
  401: 'Invalid credentials. Please check your email and password.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  500: 'Something went wrong on our end. Please try again later.',
};

const isUserFacingMessage = (message) => {
  if (!message || typeof message !== 'string') return false;
  if (message.includes('stack') || message.includes('Error:')) return false;
  return message.length <= 200;
};

const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error) return fallback;

  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;

  if (isUserFacingMessage(serverMessage)) {
    return serverMessage;
  }

  if (status && FRIENDLY_MESSAGES[status]) {
    return FRIENDLY_MESSAGES[status];
  }

  if (error.message === 'Network Error') {
    return 'Unable to reach the server. Check your connection and try again.';
  }

  return fallback;
};

export default getErrorMessage;
