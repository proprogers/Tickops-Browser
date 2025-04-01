import { useEffect } from 'react';
import { useStore as useIntegrationsStore } from './integrations-store';
import { getState as getPagesStoreState } from './pages-store';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Add from '@mui/icons-material/Add';
import Close from '@mui/icons-material/Close';

const { catchLoadingUrlError } = getPagesStoreState();

export default function IntegrationsMenu(props) {
  const {
    integrationsMenuAnchorEl,
    setIntegrationsMenuAnchorEl,
    setIsAddIntegrationsDialogOpened,
    setGeneralIntegrationsData
  } = useIntegrationsStore([
    'integrationsMenuAnchorEl',
    'setIntegrationsMenuAnchorEl',
    'setIsAddIntegrationsDialogOpened',
    'setGeneralIntegrationsData'
  ]);


  const close = () => setIntegrationsMenuAnchorEl(null);


  const handleIntegrationsClick = (service) => {
    close();
    props.close();
    setIsAddIntegrationsDialogOpened(true);
    setGeneralIntegrationsData(service);
  };


  return (
    <Menu anchorEl={integrationsMenuAnchorEl}
          open={!!integrationsMenuAnchorEl}
          onClose={close}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          style={{ maxHeight: '75%' }}
    >
          {/* <MenuItem key="textchest" className="pr-2">
            <ListItemText className="mr-2" onClick={() => handleIntegrationsClick('textchest')}>
              <div className="text-truncate" style={{ maxWidth: '350px', width: 'fit-content' }}>
                TextChest API
              </div>
            </ListItemText>
          </MenuItem> */}
          <MenuItem key="2captcha" className="pr-2">
            <ListItemText className="mr-2" onClick={() => handleIntegrationsClick('2captcha')}>
              <div className="text-truncate" style={{ maxWidth: '350px', width: 'fit-content' }}>
                2CAPTCHA API
              </div>
            </ListItemText>
          </MenuItem>
        
    
    </Menu>
  );
}

