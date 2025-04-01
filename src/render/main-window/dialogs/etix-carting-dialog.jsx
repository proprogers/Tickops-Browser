import CartingDialogWrapper from './carting-dialog-wrapper.jsx';
import { useStore as useCartingStore } from '../carting-store';

export default function EtixCartingDialog() {
  const {
    etixCartUrl,
    isEtixCartingDialogOpened,
    setIsEtixCartingDialogOpened,
    jsessionToken,
    setJsessionToken,
    bigserverToken,
    setBigserverToken,
  } = useCartingStore([
    'etixCartUrl',
    'isEtixCartingDialogOpened',
    'setIsEtixCartingDialogOpened',
    'jsessionToken',
    'setJsessionToken',
    'bigserverToken',
    'setBigserverToken',
  ]);

  const getCookies = (jt, bt) => ([{
    url: etixCartUrl,
    name: 'JSESSIONID',
    value: jt
  }, {
    url: etixCartUrl,
    name: 'BIGipServerwww.etix.com-HTTPS',
    value: bt
  }]);

  return (
    <CartingDialogWrapper headlineText="Etix carting"
                          cartUrl={etixCartUrl}
                          bulkInputPlaceholder={`JSESSIONID,BIGipServer\nJSESSIONID,BIGipServer\n...`}
                          opened={isEtixCartingDialogOpened}
                          close={() => setIsEtixCartingDialogOpened(false)}
                          isOneTabSubmitDisabled={!jsessionToken || !bigserverToken}
                          inputs={[{
                            label: 'JSESSIONID',
                            value: jsessionToken,
                            set: setJsessionToken,
                          }, {
                            label: 'BIGipServer',
                            value: bigserverToken,
                            set: setBigserverToken,
                          }]}
                          getCookies={() => getCookies(jsessionToken, bigserverToken)}
                          resetOneTabTokens={() => {
                            setJsessionToken('');
                            setBigserverToken('');
                          }}
                          bulkMappingFn={(str) => {
                            const [jt, bt] = str.split(',');
                            return getCookies(jt, bt);
                          }}
    />
  );
}
