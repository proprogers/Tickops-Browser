import { useStore as useNotificationsStore } from './notifications-store';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import Close from '@mui/icons-material/Close';

const colors = {
  error: '#D32F2F',
  success: '#4caf50',
  info: '#2196f3',
  warning: '#ff9800'
};

export default function Notification() {
  const { opened, type, message, close } = useNotificationsStore();

  const onClose = (event, reason) => {
    if (reason === 'clickaway') return;
    close();
  };

  return (
    <Snackbar open={opened}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              autoHideDuration={2000}
              onClose={onClose}
    >
      <SnackbarContent message={message}
                       style={{
                         flexWrap: 'nowrap',
                         fontSize: 12,
                         backgroundColor: colors[type]
                       }}
                       action={[
                         <IconButton key="close"
                                     color="inherit"
                                     onClick={onClose}>
                           <Close/>
                         </IconButton>,
                       ]}
      />
    </Snackbar>
  );
}
