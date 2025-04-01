import { useStore as useDialogsStateStore } from './dialogs-state-store';
import { useStore as useMainWindowStore } from '../main-window-store';
import ConfirmDeleteCookiesDialog from './confirm-delete-cookies-dialog.jsx';
import ConfirmDeletePaymentDataDialog from './confirm-delete-payment-data-dialog.jsx';
import ConfirmDeleteSessionsDialog from './confirm-delete-sessions-dialog.jsx';
import AddSessionDialog from './add-session-dialog.jsx';
import EditSessionDialog from './edit-session-dialog.jsx';
import AddEditPaymentDataDialogWrapper from './add-edit-payment-data-dialog-wrapper.jsx';
import PaymentDataManagerDialog from './payment-data-manager-dialog.jsx';
import PasswordsManagerDialog from './passwords-manager-dialog.jsx';
import EtixCartingDialog from './etix-carting-dialog.jsx';
import TicketwebCartingDialog from './ticketweb-carting-dialog.jsx';
import FrontgateTicketsCartingDialog from './frontgate-tickets-carting-dialog.jsx';
import SeeticketsCartingDialog from './seetickets-carting-dialog.jsx';
import SavingCredentialsDialog from './saving-credentials-dialog.jsx';
import AboutDialog from './about-dialog.jsx';
import AddBookmarkDialog from './add-bookmark-dialog.jsx';
import PreferencesDialog from './preferences-dialog.jsx';
import OpenLinkDialogWrapper from './open-link-dialog-wrapper.jsx';
import AddIntegrationDialog from './add-integration-dialog.jsx';

export default function Dialogs() {
  const {
    isOpenLinkDialogOpened,
    setIsOpenLinkDialogOpened,
    setCheckedSessionsMap,
  } = useDialogsStateStore([
    'isOpenLinkDialogOpened',
    'setIsOpenLinkDialogOpened',
    'setCheckedSessionsMap',
  ]);

  const {
    openLink,
  } = useMainWindowStore([
    'openLink',
  ]);

  const closeOpenLinkDialog = () => {
    setIsOpenLinkDialogOpened(false);
    setCheckedSessionsMap(new Map());
  };

  return (
    <div>
      <OpenLinkDialogWrapper submitButtonTitle="Start Sessions"
                             opened={isOpenLinkDialogOpened}
                             onGo={(data) => openLink({ data })}
                             close={closeOpenLinkDialog}
      />
      <ConfirmDeleteCookiesDialog/>
      <ConfirmDeletePaymentDataDialog/>
      <ConfirmDeleteSessionsDialog/>
      <AddSessionDialog/>
      <EditSessionDialog/>
      <AddEditPaymentDataDialogWrapper/>
      <PaymentDataManagerDialog/>
      <PasswordsManagerDialog/>
      <EtixCartingDialog/>
      <TicketwebCartingDialog/>
      <FrontgateTicketsCartingDialog/>
      <SeeticketsCartingDialog/>
      <SavingCredentialsDialog/>
      <AboutDialog/>
      <AddBookmarkDialog/>
      <AddIntegrationDialog/>
      <PreferencesDialog/>
    </div>
  );
}
