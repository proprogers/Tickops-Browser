import { useStore as useCartingStore } from '../carting-store';
import CartingDialogWrapper from './carting-dialog-wrapper.jsx';

export default function FrontgateTicketsCartingDialog() {
  const {
    wafSessionIdToken,
    setWafSessionIdToken,
    seeticketsCartUrl,
    setSeeticketsCartUrl,
    isSeeticketsCartingDialogOpened,
    setIsSeeticketsCartingDialogOpened,
  } = useCartingStore([
    'wafSessionIdToken',
    'setWafSessionIdToken',
    'seeticketsCartUrl',
    'setSeeticketsCartUrl',
    'isSeeticketsCartingDialogOpened',
    'setIsSeeticketsCartingDialogOpened',
  ]);

  const getCookies = (et) => ([{
    url: seeticketsCartUrl,
    name: 'waf_session_id',
    value: et
  }]);

  return (
    <CartingDialogWrapper headlineText="FrontGateTickets carting"
                          cartUrl={seeticketsCartUrl}
                          urlInput={{
                            value: seeticketsCartUrl,
                            set: setSeeticketsCartUrl,
                          }}
                          bulkInputPlaceholder={`waf_session_id\nwaf_session_id\n...`}
                          opened={isSeeticketsCartingDialogOpened}
                          close={() => setIsSeeticketsCartingDialogOpened(false)}
                          isOneTabSubmitDisabled={!wafSessionIdToken}
                          inputs={[{
                            label: 'waf_session_id',
                            value: wafSessionIdToken,
                            set: setWafSessionIdToken,
                          }]}
                          getCookies={() => getCookies(wafSessionIdToken)}
                          resetOneTabTokens={() => setWafSessionIdToken('')}
                          bulkMappingFn={getCookies}
    />
  );
}
