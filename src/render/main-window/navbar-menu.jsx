import {ipcRenderer} from 'electron';
import {useEffect, useState} from 'react';
import {getState as getDialogsStateStoreState} from './dialogs/dialogs-state-store';
import {getState as getPagesStoreState} from './pages-store';
import {getState as getPaymentDataStoreState} from './dialogs/payment-data-store';
import {getState as getPasswordsStoreState} from './dialogs/passwords-store';
import {getState as getPreferencesStoreState} from './dialogs/preferences-store';
import {useStore as useBookmarksStore} from './bookmarks-store';
import {useStore as useIntegrationsStore} from './integrations-store';
import {useStore as useCartingStore} from './carting-store';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import IconButton from '@mui/material/IconButton';
import MoreVert from '@mui/icons-material/MoreVert';
import CreditCard from '@mui/icons-material/CreditCard';
import ShoppingCartCheckout from '@mui/icons-material/ShoppingCartCheckout';
import VpnKey from '@mui/icons-material/VpnKey';
import Info from '@mui/icons-material/Info';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import Bookmarks from '@mui/icons-material/Bookmarks';
import Logout from '@mui/icons-material/Logout';
import IntegrationsMenu from './integrations-menu.jsx';
import ArrowRight from '@mui/icons-material/ArrowRight';
import Settings from '@mui/icons-material/Settings';
import BookmarksMenu from './bookmarks-menu.jsx';
import CartingMenu from './carting-menu.jsx';
import UpdateButton from "../component/button/UpdateButton.jsx";

const {createTab} = getPagesStoreState();
const {setIsAboutDialogOpened} = getDialogsStateStoreState();
const {setIsPreferencesDialogOpened} = getPreferencesStoreState();
const {setIsPaymentDataManagerDialogOpened} = getPaymentDataStoreState();
const {setIsPasswordsManagerDialogOpened} = getPasswordsStoreState();

export default function NavbarMenu(props) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [needToUpdate, setNeedToUpdate] = useState(false);

    const {
        integrationsMenuAnchorEl,
        setIntegrationsMenuAnchorEl,
    } = useIntegrationsStore([
        'inegrationsMenuAnchorEl',
        'setIntegrationsMenuAnchorEl',
    ]);


    const {
        bookmarksMenuAnchorEl,
        setBookmarksMenuAnchorEl,
    } = useBookmarksStore([
        'bookmarksMenuAnchorEl',
        'setBookmarksMenuAnchorEl',
    ]);

    const theme = createTheme({
        transitions: {
            duration: {
                shortest: 0,
                shorter: 0,
                short: 0,
                // most basic recommended timing
                standard: 0,
                // this is to be used in complex animations
                complex: 0,
                // recommended when something is entering screen
                enteringScreen: 0,
                // recommended when something is leaving screen
                leavingScreen: 0,
            },
            easing: {
                // This is the most common easing curve.
                easeInOut: '',
                // Objects enter the screen at full velocity from off-screen and
                // slowly decelerate to a resting point.
                easeOut: '',
                // Objects leave the screen at full velocity. They do not decelerate when off-screen.
                easeIn: '',
                // The sharp curve is used by objects that may return to the screen at any time.
                sharp: '',
            },
        },
    });

    const {
        isCartingVisible,
        cartingMenuAnchorEl,
        setCartingMenuAnchorEl,
    } = useCartingStore([
        'isCartingVisible',
        'cartingMenuAnchorEl',
        'setCartingMenuAnchorEl',
    ]);

    useEffect(() => {
        ipcRenderer.on('need-to-update-browser', () => setNeedToUpdate(true));
        ipcRenderer.invoke('does-need-to-update-browser').then(setNeedToUpdate);
    }, []);

    /*const handleAutoCartingClick = async () => {
      setOpeningLinkUrl('');
      setIsEventbriteAutoCartingDialogOpened(true);
      const sessions = await Settings.get(SESSIONS_KEY);
      setSessions(sessions);
      close();
    };*/

    const handleUpdateClick = () => {
        ipcRenderer.invoke('on-update-browser');
    };

    const close = () => setAnchorEl(null);

    const handleToggle = (event) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const list = [
        {
            text: 'Settings User Proxy',
            Icon: (props) => <CloudQueueIcon {...props}/>,
            divider: true,
            handler: () => {
                const location = 'https://tickops.com/?browser=true';
                createTab({params: {location}});
            },
        },
        {
            text: 'Password Manager',
            Icon: (props) => <VpnKey {...props}/>,
            handler: () => {
                setIsPasswordsManagerDialogOpened(true);
                close();
            },
        },
        {
            text: 'Payment Data Manager',
            Icon: (props) => <CreditCard {...props}/>,
            handler: () => {
                setIsPaymentDataManagerDialogOpened(true);
                close();
            },
        },
        {
            text: 'Bookmarks',
            Icon: (props) => <Bookmarks {...props}/>,
            EndIcon: () => <ArrowRight fontSize="small" color="action"/>,
            handler: ({currentTarget}) => setBookmarksMenuAnchorEl(bookmarksMenuAnchorEl ? null : currentTarget),
        },
        {
            text: 'Integrations',
            Icon: (props) => <IntegrationInstructionsIcon {...props}/>,
            EndIcon: () => <ArrowRight fontSize="small" color="action"/>,
            handler: ({currentTarget}) => setIntegrationsMenuAnchorEl(integrationsMenuAnchorEl ? null : currentTarget),
        },
        {
            text: 'Carting',
            Icon: (props) => <ShoppingCartCheckout {...props}/>,
            EndIcon: () => <ArrowRight fontSize="small" color="action"/>,
            handler: isCartingVisible
                ? ({currentTarget}) => setCartingMenuAnchorEl(cartingMenuAnchorEl ? null : currentTarget)
                : null,
            disabled: !isCartingVisible
        },
        {
            text: 'Preferences',
            Icon: (props) => <Settings {...props}/>,
            handler: () => {
                close();
                setIsPreferencesDialogOpened(true);
            },
        },
        {
            text: 'Logout',
            Icon: (props) => <Logout {...props}/>,
            handler: () => {
                close();
                ipcRenderer.invoke('on-logout');
            },
        },
        {
            text: 'About TickOps Browser',
            Icon: (props) => <Info {...props}/>,
            handler: () => {
                setIsAboutDialogOpened(true);
                close();
            },
        }];

    return (
        <ThemeProvider theme={theme}>
            <div className="d-flex flex-column justify-content-center mr-1">
                <BookmarksMenu close={close} page={props.page}/>
                <IntegrationsMenu close={close} page={props.page}/>
                <CartingMenu close={close}/>

                {needToUpdate
                    ? <UpdateButton onUpdate={handleUpdateClick} onDelete={handleToggle}/>
                    : <IconButton onClick={handleToggle} theme={theme} disabled={!props.page || !props.page.session}>
                        <MoreVert/>
                    </IconButton>}

                <Menu anchorEl={anchorEl}
                      open={!!anchorEl}
                      onClose={close}
                      anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                      theme={theme}
                >
                    {list.map(({Icon, EndIcon, text, handler, divider, disabled}) => (
                        <MenuItem key={text} onClick={handler} divider={!!divider} disabled={disabled}>
                            <ListItemIcon>
                                <Icon fontSize="small"/>
                            </ListItemIcon>
                            <ListItemText> {text} </ListItemText>
                            {EndIcon && <EndIcon/>}
                        </MenuItem>
                    ))}
                </Menu>
            </div>
        </ThemeProvider>
    );
}
