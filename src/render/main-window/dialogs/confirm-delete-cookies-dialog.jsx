import { useStore as useNavbarStore } from '../navbar-store';
import ConfirmDialogWrapper from './confirm-dialog-wrapper.jsx';

export default function ConfirmDeleteCookiesDialog() {
  const {
    isConfirmDeleteCookiesDialogOpened,
    setIsConfirmDeleteCookiesDialogOpened,
    clearCookies,
    clearingCookiesInfo,
  } = useNavbarStore([
    'isConfirmDeleteCookiesDialogOpened',
    'setIsConfirmDeleteCookiesDialogOpened',
    'clearCookies',
    'clearingCookiesInfo',
  ]);
  const { openedTabsCount, partition } = clearingCookiesInfo;

  const text = `Clearing cookies of this session will affect ${openedTabsCount} 
    more opened tab${openedTabsCount > 1 ? 's' : ''}. Do you want to continue?`;

  const close = () => setIsConfirmDeleteCookiesDialogOpened(false);

  const onConfirm = (event) => {
    event.preventDefault();
    close();
    clearCookies(partition);
  };

  return <ConfirmDialogWrapper opened={isConfirmDeleteCookiesDialogOpened}
                               close={close}
                               text={text}
                               onConfirm={onConfirm}
  />;
}
