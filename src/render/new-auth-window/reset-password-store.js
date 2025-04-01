import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';
import { ipcRenderer } from 'electron';
const PasswordReset  = require('../../API/password-reset');
const crypto = require('crypto');

const initialState = {
  email: '',
  code: '',
  newPasscode: '',
  loading: false,
  isError: false,
  errorMessage: '',
  isCodeSent: false,
  isCodeVerified: false,
  showNewPasscode: false,
  isGenerating: false,
  resendTimer: 0,
  canResend: false,
  timerInterval: null
};

const actions = {
  setEmail: (email) => ({ email }),
  setCode: (code) => ({ code }),
  setNewPasscode: (passcode) => ({ newPasscode: passcode }),
  setLoading: (loading) => ({ loading }),
  setIsError: (isError) => ({ isError }),
  setErrorMessage: (message) => ({ errorMessage: message }),
  setIsCodeSent: (isCodeSent) => ({ isCodeSent }),
  setIsCodeVerified: (isCodeVerified) => ({ isCodeVerified }),
  setShowNewPasscode: (show) => ({ showNewPasscode: show }),
  setIsGenerating: (isGenerating) => ({ isGenerating: isGenerating }),
  setResendTimer: (timer) => ({ resendTimer: timer }),
  setCanResend: (canResend) => ({ canResend: canResend }),
  resetForm: () => initialState
};

const store = create((set, get) => ({
  ...initialState,
  ...Object.keys(actions).reduce((acc, actionName) => {
    acc[actionName] = (...args) => set(actions[actionName](...args));
    return acc;
  }, {}),

  generateSecurePassword: () => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // Ensure at least one of each character type
    password += charset.match(/[a-z]/)[0];
    password += charset.match(/[A-Z]/)[0];
    password += charset.match(/[0-9]/)[0];
    password += charset.match(/[^a-zA-Z0-9]/)[0];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        const randomIndex = crypto.randomInt(0, charset.length);
        password += charset[randomIndex];
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  },

  handleGeneratePasscode: async () => {
    const { setLoading, setIsError, setNewPasscode, setIsGenerating, generateSecurePassword } = get();

    setLoading(true);
    setIsError(false);
    setIsGenerating(true);

    try {
      // Generate password locally
      const generatedPassword = generateSecurePassword();
      
      // Simulate generation animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setNewPasscode(generatedPassword);
      
      return true;
    } catch (e) {
      setIsError(true);
      console.error(e);
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }

    return false;
  },

  startResendTimer: () => {
    const { setResendTimer, setCanResend, timerInterval } = get();
    
    // Clear existing interval if any
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    let timeLeft = 30;
    setCanResend(false);
    setResendTimer(timeLeft);

    const interval = setInterval(() => {
      timeLeft--;
      setResendTimer(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(interval);
        setCanResend(true);
      }
    }, 1000);

    // Store the interval ID
    set({ timerInterval: interval });
  },

  cleanupTimer: () => {
    const { timerInterval } = get();
    if (timerInterval) {
      clearInterval(timerInterval);
      set({ timerInterval: null, resendTimer: 0, canResend: true });
    }
  },

  handleResendCode: async () => {
    const { email, setLoading, setIsError, setErrorMessage, startResendTimer } = get();

    setLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      await PasswordReset.requestResetCode(email);
      startResendTimer();
      return true;
    } catch (e) {
      setIsError(true);
      if (e.response?.status === 404) {
        setErrorMessage(e.response?.data?.message || 'Email not found. Try again');
      } else {
        console.error(e);
        setErrorMessage(e.response?.data?.message || 'Failed to resend reset code. Please try again');
      }
    } finally {
      setLoading(false);
    }

    return false;
  },

  handleResetPassword: async () => {
    const { email, setLoading, setIsError, setErrorMessage, setIsCodeSent, startResendTimer } = get();

    setLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      await PasswordReset.requestResetCode(email);
      setIsCodeSent(true);
      startResendTimer();
      return true;
    } catch (e) {
      setIsError(true);
      if (e.response?.status === 404) {
        setErrorMessage(e.response?.data?.message || 'Email not found. Try again');
      } else {
        console.error(e);
        setErrorMessage(e.response?.data?.message || 'Failed to send reset code. Please try again');
      }
    } finally {
      setLoading(false);
    }

    return false;
  },

  handleVerifyCode: async () => {
    const { email, code, setLoading, setIsError, setErrorMessage, setIsCodeVerified } = get();

    setLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      await PasswordReset.verifyResetCode(email, code);
      setIsCodeVerified(true);
      return true;
    } catch (e) {
      setIsError(true);
      if (e.response?.status === 400) {
        setErrorMessage(e.response?.data?.message || 'Invalid code. Please try again');
      } else {
        console.error(e);
        setErrorMessage(e.response?.data?.message || 'Failed to verify code. Please try again');
      }
    } finally {
      setLoading(false);
    }

    return false;
  },

  handleSetNewPasscode: async () => {
    const { email, newPasscode, setLoading, setIsError, setErrorMessage } = get();

    setLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      await PasswordReset.setNewPasscode(email, newPasscode);
      await ipcRenderer.invoke('auth:navigate', 'new-auth-window.html');
      return true;
    } catch (e) {
      setIsError(true);
      console.error(e);
      setErrorMessage(e.response?.data?.message || 'Failed to set new passcode. Please try again');
    } finally {
      setLoading(false);
    }

    return false;
  }
}));

const useStore = getUseStore(store);
const { getState, setState, subscribe, destroy } = store;

export { useStore, getState, setState, subscribe, destroy }; 