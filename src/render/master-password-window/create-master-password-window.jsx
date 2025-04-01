/* global document */
import { render } from 'react-dom';
import { useStore as useMasterPasswordWindowStore } from './master-password-window-store';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Notification from '@/common/components/notification.jsx';

const info = `Come up with your master password before saving sessions. 
    You'll have to enter it every time you open TickOps Browser and 
    it'll be used to encode and store your accounts' passwords.`;

function CreateMasterPasswordWindow() {
  const {
    onSave,
    password,
    setPassword,
    confirmedPassword,
    setConfirmedPassword,
    isPasswordShown,
    setIsPasswordShown,
    isError,
    setIsError,
    isSubmittedOnce,
  } = useMasterPasswordWindowStore([
    'onSave',
    'password',
    'setPassword',
    'confirmedPassword',
    'setConfirmedPassword',
    'isPasswordShown',
    'setIsPasswordShown',
    'isError',
    'setIsError',
    'isSubmittedOnce',
  ]);

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
      <Typography variant="h5" gutterBottom>
        Welcome!
      </Typography>
      <Typography variant="body2" display="block" gutterBottom>
        {info}
      </Typography>
      <form onSubmit={onSave}>
        <TextField fullWidth
                   required
                   value={password}
                   onChange={({ target: { value } }) => {
                     setPassword(value);
                     setIsError(true);
                   }}
                   error={isError}
                   InputProps={{ endAdornment }}
                   margin="dense"
                   variant="standard"
                   type={isPasswordShown ? 'text' : 'password'}
                   label="Enter Master Password"/>
        <TextField fullWidth
                   required
                   value={confirmedPassword}
                   onChange={({ target: { value } }) => {
                     setIsError(isSubmittedOnce && value !== password);
                     setConfirmedPassword(value);
                   }}
                   error={isError}
                   helperText={isError ? `Passwords doesn't match` : ''}
                   margin="dense"
                   variant="standard"
                   type="password"
                   label="Confirm Master Password"/>
        <Button id="done-button" color="primary" type="submit"
                disabled={isError || !password || !confirmedPassword}>
          Ok
        </Button>
      </form>
      <Notification/>
    </div>
  );
}

const root = document.createElement('div');
root.id = 'app';
document.body.appendChild(root);

render(
  <CreateMasterPasswordWindow/>,
  document.getElementById('app')
);
