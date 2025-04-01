import { useState } from 'react';
import { useStore as useToggleProxyStore } from './toggle-proxy-store';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import VpnLock from '@mui/icons-material/VpnLock';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { green, grey, red } from '@mui/material/colors';
import Tooltip from '@mui/material/Tooltip';

export default function ToggleProxyMenu(props) {
  const [anchorEl, setAnchorEl] = useState(null);

  const {
    isProxyOnGlobally,
    onToggleProxyInSession,
    onToggleProxyGlobally,
  } = useToggleProxyStore([
    'isProxyOnGlobally',
    'onToggleProxyInSession',
    'onToggleProxyGlobally',
  ]);

  const close = () => setAnchorEl(null);

  const handleToggleMenu = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleToggleCurrentSession = () => {
    onToggleProxyInSession({ partition: props.session.partition, value: props.session.isProxyOn });
    close();
  };

  const handleToggleAllTabsProxy = () => {
    onToggleProxyGlobally();
    close();
  };

  const isSessionProxyOn = props.session && props.session.isProxyOn !== false;

  const title = `${isSessionProxyOn ? 'Dis' : 'En'}able proxy`;
  const sessionToggleTextColor = props.partition
    ? isSessionProxyOn ? red[500] : green[500]
    : grey[400];
  const iconColor = props.partition
    ? isSessionProxyOn ? green[500] : red[500]
    : grey[400];

  const tooltipText = 'Toggling proxy in all tabs will reset proxy state in all sessions, including individually toggled session proxies.';

  return (
    <div className="d-flex flex-column justify-content-center">
      <IconButton onClick={handleToggleMenu}
                  disabled={!props.partition}
                  title={`${title}...`}
      >
        <VpnLock style={{ color: iconColor }}/>
      </IconButton>
      <Menu anchorEl={anchorEl}
            open={!!anchorEl}
            onClose={close}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MenuItem key="current-session-tabs" onClick={handleToggleCurrentSession}>
          <ListItemText style={{ color: sessionToggleTextColor }}>
            {title} in this session
          </ListItemText>
        </MenuItem>
        <MenuItem key="all-tabs" onClick={handleToggleAllTabsProxy}>
          <ListItemText style={{ color: isProxyOnGlobally ? red[500] : green[500] }}>
            {title} in all tabs
          </ListItemText>
          <Tooltip title={tooltipText}>
            <InfoOutlined fontSize="small" color="action"/>
          </Tooltip>
        </MenuItem>
      </Menu>
    </div>
  );
}
