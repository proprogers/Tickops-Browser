import { useStore as useCartingStore } from '../carting-store';
import CartingDialogWrapper from './carting-dialog-wrapper.jsx';

export default function FrontgateTicketsCartingDialog() {
  const {
    fgSessid,
    setFgSessid,
    fgCartUrl,
    setFgCartUrl,
    isFrontgateTicketsCartingDialogOpened,
    setIsFrontgateTicketsCartingDialogOpened,
  } = useCartingStore([
    'fgSessid',
    'setFgSessid',
    'fgCartUrl',
    'setFgCartUrl',
    'isFrontgateTicketsCartingDialogOpened',
    'setIsFrontgateTicketsCartingDialogOpened',
  ]);

  const getCookies = (et) => ([{
    url: fgCartUrl,
    name: 'FG_SESSID',
    value: et
  }]);

  return (
    <CartingDialogWrapper headlineText="FrontGateTickets carting"
                          cartUrl={fgCartUrl}
                          urlInput={{
                            value: fgCartUrl,
                            set: setFgCartUrl,
                          }}
                          bulkInputPlaceholder={`FG_SESSID\nFG_SESSID\n...`}
                          opened={isFrontgateTicketsCartingDialogOpened}
                          close={() => setIsFrontgateTicketsCartingDialogOpened(false)}
                          isOneTabSubmitDisabled={!fgSessid}
                          inputs={[{
                            label: 'FG_SESSID',
                            value: fgSessid,
                            set: setFgSessid,
                          }]}
                          getCookies={() => getCookies(fgSessid)}
                          resetOneTabTokens={() => setFgSessid('')}
                          bulkMappingFn={getCookies}
    />
  );
}
