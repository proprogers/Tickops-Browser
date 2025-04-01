/* global document */
import { render } from 'react-dom';
import { useStore as useAuthWindowStore } from './auth-window-store';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Notification from '@/common/components/notification.jsx';
import CircularProgress from '@mui/material/CircularProgress';
import { useRef, useEffect, useState } from 'react';

function AuthWindow() {
  const {
    onSubmit,
    email,
    setEmail,
    password,
    setPassword,
    isError,
    setIsError,
  } = useAuthWindowStore([
    'onSubmit',
    'email',
    'setEmail',
    'password',
    'setPassword',
    'isError',
    'setIsError',
  ]);

  const [loading, setLoading] = useState(false);


  return (
    <div id="auth">
      <form onSubmit={(event)=>{
        event.preventDefault();
        setLoading(true);
        onSubmit(event);
      }}>
        <TextField autoFocus
                   fullWidth
                   variant="standard"
                   value={email}
                   error={isError}
                   onChange={({ target: { value } }) => {
                     setEmail(value);
                     setIsError(false);
                   }}
                   type="text"
                   margin="dense"
                   label="Email"/>
        <TextField fullWidth
                   variant="standard"
                   error={isError}
                   value={password}
                   onChange={({ target: { value } }) => {
                     setPassword(value);
                     setIsError(false);
                   }}
                   type="password"
                   margin="dense"
                   label="Password"/>
                   
        <Button id="enter-button" color="primary" type="submit">
           { !!loading &&
            <span id="tab-spinner">
            <CircularProgress style={{ marginLeft: 6,marginTop:10,color: 'white'}} size={12} />
            </span> 
          } 
          {!loading && <span>Enter</span>}
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
  <AuthWindow/>,
  document.getElementById('app')
);
