import { useStore as useCartingStore } from './carting-store';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';

export default function CartingMenu(props) {
  const {
    cartingMenuAnchorEl,
    setCartingMenuAnchorEl,
    setIsEtixCartingDialogOpened,
    setIsTicketwebCartingDialogOpened,
    setIsFrontgateTicketsCartingDialogOpened,
    setIsSeeticketsCartingDialogOpened,
  } = useCartingStore([
    'cartingMenuAnchorEl',
    'setCartingMenuAnchorEl',
    'setIsEtixCartingDialogOpened',
    'setIsTicketwebCartingDialogOpened',
    'setIsFrontgateTicketsCartingDialogOpened',
    'setIsSeeticketsCartingDialogOpened',
  ]);

  const close = () => {
    setCartingMenuAnchorEl(null);
    props.close();
  };

  const list = [{
    text: 'Etix',
    handler: () => {
      setIsEtixCartingDialogOpened(true);
      close();
    },
  }, {
    text: 'Ticketweb',
    handler: () => {
      setIsTicketwebCartingDialogOpened(true);
      close();
    },
  }, {
    text: 'Frontgate',
    handler: () => {
      setIsFrontgateTicketsCartingDialogOpened(true);
      close();
    },
  }, {
    text: 'Seetickets',
    handler: () => {
      setIsSeeticketsCartingDialogOpened(true);
      close();
    },
  }];

  return (
    <Menu anchorEl={cartingMenuAnchorEl}
          open={!!cartingMenuAnchorEl}
          onClose={() => setCartingMenuAnchorEl(null)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
    >
      {list.map(({ handler, text }) => (
        <MenuItem key={text} onClick={handler} style={{ minWidth: '150px' }}>
          <ListItemText> {text} </ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
}
