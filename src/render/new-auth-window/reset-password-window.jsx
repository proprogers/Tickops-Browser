import { render } from "react-dom";
import { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import '@/../css/auth.css';
import { useStore } from './reset-password-store';
import visibilityOffIcon from '@/../img/visibility_off.svg';
import backIcon from '@/../img/back_icon.svg';
import errorIcon from '@/../img/error_icon.svg';

function ResetPasswordWindow() {
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const { 
    email, 
    code,
    newPasscode,
    loading, 
    isError,
    errorMessage,
    isCodeSent,
    isCodeVerified,
    showNewPasscode,
    isGenerating,
    resendTimer,
    canResend,
    setEmail, 
    setCode,
    setNewPasscode,
    setShowNewPasscode,
    setIsCodeVerified,
    setIsCodeSent,
    setErrorMessage,
    setIsError,
    handleResetPassword,
    handleVerifyCode,
    handleSetNewPasscode,
    handleGeneratePasscode,
    handleResendCode,
    cleanupTimer
  } = useStore();

  useEffect(() => {
    return () => {
      cleanupTimer();
    };
  }, [cleanupTimer]);

  const validateForm = () => {
    if (!email) {
      setErrorMessage("Email cannot be empty");
      setIsError(true);
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address");
      setIsError(true);
      return false;
    }
    setErrorMessage("");
    setIsError(false);
    return true;
  };

  const validateCodeForm = () => {
    if (!code) {
      setErrorMessage("Code cannot be empty");
      setIsError(true);
      return false;
    }
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setErrorMessage("Code must be exactly 6 digits");
      setIsError(true);
      return false;
    }
    setErrorMessage("");
    setIsError(false);
    return true;
  };

  const validatePasscodeForm = () => {
    if (!newPasscode) {
      setPasscodeError("Please enter a passcode");
      return false;
    }
    if (newPasscode.length < 8) {
      setPasscodeError("Passcode must be at least 8 characters");
      return false;
    }
    if (!/[A-Z]/.test(newPasscode)) {
      setPasscodeError("Passcode must contain at least 1 uppercase letter");
      return false;
    }
    if (!/[a-z]/.test(newPasscode)) {
      setPasscodeError("Passcode must contain at least 1 lowercase letter");
      return false;
    }
    if (!/[0-9]/.test(newPasscode)) {
      setPasscodeError("Passcode must contain at least 1 number");
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPasscode)) {
      setPasscodeError("Passcode must contain at least 1 special character");
      return false;
    }
    setPasscodeError("");
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isCodeVerified) {
      if (!validatePasscodeForm()) {
        return;
      }
      await handleSetNewPasscode();
    } else if (isCodeSent) {
      if (!validateCodeForm()) {
        return;
      }
      await handleVerifyCode();
    } else {
      if (!validateForm()) {
        return;
      }
      await handleResetPassword();
    }
  };

  const handleBack = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCodeVerified) {
      setIsCodeVerified(false);
      setIsCodeSent(false);
      setNewPasscode('');
      setCode('');
      setPasscodeError('');
      setCodeError('');
    } else if (isCodeSent) {
      setIsCodeSent(false);
      setCode('');
      setCodeError('');
    } else {
      cleanupTimer();
      await ipcRenderer.invoke('auth:navigate', 'new-auth-window.html');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <h1>{isCodeVerified ? "Set New Passcode" : isCodeSent ? "Enter Code" : "Lost Your Passcode?"}</h1>
        <p className="subtitle">
          {isCodeVerified 
            ? "You can set your own passcode or generate it for you"
            : isCodeSent 
              ? `Enter the verification code we sent to ${email}`
              : <>
                  We'll send you a code to reset your passcode.
                  <br />
                  Just enter your email below
                </>
          }
        </p>

        <form onSubmit={onSubmit} noValidate>
          {isCodeVerified ? (
            <div className="form-group">
              <div className="label-group">
                <label htmlFor="newPasscode" style={{ marginBottom: '0px' }}>New Passcode</label>
                <button 
                  type="button"
                  className={`generate-passcode ${isGenerating ? 'generating' : ''}`}
                  onClick={handleGeneratePasscode}
                  disabled={loading || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="generating-dots">
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                      </span>
                      Generating
                    </>
                  ) : (
                    'Generate Passcode'
                  )}
                </button>
              </div>
              <div className={`password-input ${isGenerating ? 'generating' : ''}`}>
                <input
                  type={showNewPasscode ? "text" : "password"}
                  id="newPasscode"
                  value={newPasscode}
                  onChange={(e) => {
                    setNewPasscode(e.target.value);
                    setPasscodeError("");
                  }}
                  className={passcodeError ? "input-error" : ""}
                  disabled={loading || isGenerating}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowNewPasscode(!showNewPasscode)}
                  aria-label={showNewPasscode ? "Hide passcode" : "Show passcode"}
                  disabled={isGenerating}
                >
                  <img 
                    src={visibilityOffIcon} 
                    alt="Toggle passcode visibility"
                    className={showNewPasscode ? "eye-open" : ""}
                  />
                </button>
              </div>
              {passcodeError && <div className="field-error">{passcodeError}</div>}
              <div className="passcode-requirements">
                <p>You passcode must have:</p>
                <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <li className={newPasscode.length >= 8 ? "met" : ""}>at least 8 characters</li>
                  <li className={/[0-9]/.test(newPasscode) ? "met" : ""}>at least 1 number</li>
                  <li className={(/[A-Z]/.test(newPasscode) && /[a-z]/.test(newPasscode)) ? "met" : ""}>upper and lower letters</li>
                  <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPasscode) ? "met" : ""}>at least 1 special symbol</li>
                </ul>
              </div>
            </div>
          ) : isCodeSent ? (
            <div className="form-group">
              <div className="label-group">
                <label htmlFor="code" style={{ marginBottom: '0px' }}>Code</label>
                <div className="resend-container">
                  {canResend ? (
                    <button
                      type="button"
                      className="resend-button"
                      onClick={handleResendCode}
                      disabled={loading}
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span className="resend-timer">
                      Resend code in {resendTimer}s
                    </span>
                  )}
                </div>
              </div>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setCodeError("");
                }}
                className={codeError ? "input-error" : ""}
                disabled={loading}
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className={isError ? "input-error" : ""}
                disabled={loading}
              />
            </div>
          )}

          {isError && errorMessage && (
            <div className="flex items-center gap-2" style={{ marginTop: '16px' }}>
              <img src={errorIcon} alt="Error" className="w-4 h-4" />
              <span className="text-[#EF4444] text-sm font-regular">{errorMessage}</span>
            </div>
          )}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Processing..." : (isCodeVerified ? "Set New Passcode" : isCodeSent ? "Submit Code" : "Send Code")}
          </button>
        </form>

        <button onClick={handleBack} className="back-button">
          <img src={backIcon} alt="Back" className="w-5 h-5" />
          {isCodeVerified ? "Back" : isCodeSent ? "Back" : "Back to Login"}
        </button>
      </div>
    </div>
  );
}

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);

render(<ResetPasswordWindow />, document.getElementById("root")); 