import { useStore as useCartingStore } from '../carting-store';
import CartingDialogWrapper from './carting-dialog-wrapper.jsx';

export default function TicketwebCartingDialog() {
  const {
    ecmToken,
    setEcmToken,
    ticketwebCartUrl,
    isTicketwebCartingDialogOpened,
    setIsTicketwebCartingDialogOpened,
  } = useCartingStore([
    'ecmToken',
    'setEcmToken',
    'ticketwebCartUrl',
    'isTicketwebCartingDialogOpened',
    'setIsTicketwebCartingDialogOpened',
  ]);

  const getCookies = (et) => ([{
    url: ticketwebCartUrl,
    name: 'ECM_JSESSIONID',
    value: et
  }]);

  return (
    <CartingDialogWrapper headlineText="Ticketweb carting"
                          cartUrl={ticketwebCartUrl}
                          bulkInputPlaceholder={`ECM_JSESSIONID\nECM_JSESSIONID\n...`}
                          opened={isTicketwebCartingDialogOpened}
                          close={() => setIsTicketwebCartingDialogOpened(false)}
                          isOneTabSubmitDisabled={!ecmToken}
                          inputs={[{
                            label: 'ECM_JSESSIONID',
                            value: ecmToken,
                            set: setEcmToken,
                          }]}
                          getCookies={() => getCookies(ecmToken)}
                          resetOneTabTokens={() => setEcmToken('')}
                          bulkMappingFn={getCookies}
    />
  );
}
