import { useEffect, useState } from 'react';
import { getState as getNotificationsStoreState } from '@/common/components/notifications-store';
import { useStore as useUserStore } from '@/common/components/user-store';
import { useStore as useDialogsStateStore } from './dialogs-state-store';
import { getState as getMainWindowStoreState } from '../main-window-store';
import ConfirmDialogWrapper from './confirm-dialog-wrapper.jsx';
import { SESSIONS_KEY } from '@/common/consts';
import Settings from '@/common/settings';

const { show: showNotification } = getNotificationsStoreState();
const { deleteSessions } = getMainWindowStoreState();

export default function ConfirmDeleteSessionsDialog() {
  const [sessionsToDelete, setSessionsToDelete] = useState([]);

  const {
    isConfirmDeleteSessionsDialogOpened,
    setIsConfirmDeleteSessionsDialogOpened,
    sessionToEditOrDelete,
    setSessionToEditOrDelete,
    checkedSessionsMap,
    setCheckedSessionsMap,
  } = useDialogsStateStore([
    'isConfirmDeleteSessionsDialogOpened',
    'setIsConfirmDeleteSessionsDialogOpened',
    'sessionToEditOrDelete',
    'setSessionToEditOrDelete',
    'checkedSessionsMap',
    'setCheckedSessionsMap',
  ]);

  const {
    sessions,
    setSessions,
  } = useUserStore([
    'sessions',
    'setSessions',
  ]);

  useEffect(() => {
    if (isConfirmDeleteSessionsDialogOpened) {
      setSessionsToDelete(
        sessionToEditOrDelete
          ? [sessionToEditOrDelete.partition]
          : [...checkedSessionsMap].map(([partition]) => partition)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmDeleteSessionsDialogOpened]);

  const text = `Delete ${sessionsToDelete.length} session${sessionsToDelete.length > 1 ? 's' : ''}?`;

  const close = () => {
    setIsConfirmDeleteSessionsDialogOpened(false);
    setSessionToEditOrDelete(null);
  };

  const onConfirm = async (event) => {
    event.preventDefault();
    close();
    try {
      await deleteSessions(sessionsToDelete);
    } catch (e) {
      if (e.status !== 400) {
        const message = `Error deleting session${sessionsToDelete.length > 1 ? 's' : ''}`;
        showNotification({ message, type: 'error' });
      }
    }

    for (const partition of sessionsToDelete) {
      sessions.splice(sessions.findIndex(ses => ses.partition === partition), 1);
    }
    await Settings.set(SESSIONS_KEY, sessions);
    setSessions(sessions);
    setCheckedSessionsMap(new Map());

    const message = `Session${sessionsToDelete.length > 1 ? 's' : ''} deleted successfully`;
    showNotification({ message, type: 'success' });
  };

  return <ConfirmDialogWrapper opened={isConfirmDeleteSessionsDialogOpened}
                               close={close}
                               text={text}
                               onConfirm={onConfirm}
  />;
}
