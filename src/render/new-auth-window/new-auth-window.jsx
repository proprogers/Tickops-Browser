import { render } from "react-dom";
import { useState } from "react";
import { ipcRenderer } from "electron";
import '@/../css/auth.css';
import visibilityOffIcon from '@/../img/visibility_off.svg';
import errorIcon from '@/../img/error_icon.svg';
import { useStore } from './new-auth-window.store';

function NewAuthWindow() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    email,
    password,
    loading,
    isError,
    errorMessage,
    setEmail,
    setPassword,
    handleSubmit
  } = useStore();

  const onSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await handleSubmit();
  };

  const handleForgotCode = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await ipcRenderer.invoke('auth:navigate', 'reset-password-window.html');
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <h1>
          Welcome to <span className="brand-text">TickOps</span> Browser
        </h1>
        <p className="subtitle">
          Secure the hottest concert tickets fast with our browser
        </p>

        <form onSubmit={onSubmit} noValidate>
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

          <div className="form-group2">
            <div className="label-group">
              <label htmlFor="password" style={{ marginBottom: '0px' }}>Passcode</label>
              <button 
                className="forgot-code" 
                onClick={handleForgotCode}
                type="button"
              >
                Forgot Passcode?
              </button>
            </div>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                className={isError ? "input-error" : ""}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <img 
                  src={visibilityOffIcon} 
                  alt="Toggle password visibility"
                  className={showPassword ? "eye-open" : ""}
                />
              </button>
            </div>
          </div>

          {isError && errorMessage && (
            <div className="flex items-center gap-2" style={{ marginTop: '16px' }}>
              <img src={errorIcon} alt="Error" className="w-4 h-4" />
              <span className="text-[#EF4444] text-sm font-regular">{errorMessage}</span>
            </div>
          )}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Loading..." : "Get Started"}
          </button>

        </form>
      </div>
      <div className="terms-container">
        <div className="terms-border"/>
        <div className="terms">
          <span className="terms-text">By using TickOps Browser, you agree to our</span>{" "}
          <a href="#" className="font-medium text-[#E4E4E7] no-underline hover:underline">Terms of Use</a>{" "}
          <span className="terms-text">and</span>{" "}
          <a href="#" className="font-medium text-[#E4E4E7] no-underline hover:underline">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);

render(<NewAuthWindow />, document.getElementById("root"));
