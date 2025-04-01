/* global document */
import { render } from 'react-dom';
import { useStore as useMasterPasswordWindowStore } from './master-password-window-store';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { ipcRenderer } from 'electron';
import { messages } from '@/common/consts';

function CheckMasterPasswordWindow() {
  const {
    onCheck,
    password,
    setPassword,
    setPasswordHash,
    setPasswordSalt,
    isPasswordShown,
    setIsPasswordShown,
    isError,
    setIsError,
  } = useMasterPasswordWindowStore([
    'onCheck',
    'password',
    'setPassword',
    'setPasswordHash',
    'setPasswordSalt',
    'isPasswordShown',
    'setIsPasswordShown',
    'isError',
    'setIsError',
  ]);

  ipcRenderer.invoke(messages.GET_USER).then(({ masterPasswordDoubleHash, masterPasswordSalt }) => {
    setPasswordHash(masterPasswordDoubleHash);
    setPasswordSalt(masterPasswordSalt);
  });

  const handleLogoutClick = () => {
    ipcRenderer.invoke('on-logout');
    ipcRenderer.invoke('close-master-password-window');
  };

  const endAdornment = (
    <InputAdornment position="end">
      <IconButton color="primary"
                  onClick={() => setIsPasswordShown(!isPasswordShown)}
                  onMouseDown={(event) => event.preventDefault()}>
        {isPasswordShown ? <Visibility/> : <VisibilityOff/>}
      </IconButton>
    </InputAdornment>
  );

  return (
    <div id="root">
      <form onSubmit={onCheck}>
        <TextField fullWidth
                   required
                   autoFocus
                   value={password}
                   onChange={({ target: { value } }) => {
                     setPassword(value);
                     setIsError(false);
                   }}
                   error={isError}
                   InputProps={{ endAdornment }}
                   margin="dense"
                   variant="standard"
                   type={isPasswordShown ? 'text' : 'password'}
                   label="Enter Master Password"/>
        <Button id="logout-button" variant="text" size="small" type="button" onClick={handleLogoutClick}>
          Logout
        </Button>
        <Button id="done-button" color="primary" variant="contained" size="small" type="submit" disabled={!password}>
          Enter
        </Button>
      </form>
    </div>
  );
}

const root = document.createElement('div');
root.id = 'app';
document.body.appendChild(root);

render(
  <CheckMasterPasswordWindow/>,
  document.getElementById('app')
);
