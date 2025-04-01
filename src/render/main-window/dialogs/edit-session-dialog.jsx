import { useEffect, useState } from 'react';
import { useStore as useDialogsStateStore } from './dialogs-state-store';
import { getState as getNotificationsStoreState } from '@/common/components/notifications-store';
import { useStore as usePagesStore } from '../pages-store';
import { useStore as usePasswordsStore } from './passwords-store';
import { useStore as usePaymentDataStore } from './payment-data-store';
import DialogWrapper from './dialog-wrapper.jsx';
import PasswordsChecklist from './passwords-checklist.jsx';
import AddEditUserProxy from './add-edit-user-proxy.jsx';
import Divider from '@mui/material/Divider';
import SessionManager from '@/common/session-manager/render';
import { PAYMENT_DATA_KEY } from '@/common/consts';
import Settings from '@/common/settings';

const { show: showNotification } = getNotificationsStoreState();

export default function EditSessionDialog() {
  const [partition, setPartition] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [tel, setTel] = useState('');
  const [paymentDataId, setPaymentDataId] = useState('');
  const [paymentDataArray, setLocalStatePaymentDataArray] = useState([]);
  const [passsArray, setPasssArray] = useState([]);

  const [isCustomProxy, setIsCustomProxy] = useState('');
  const [proxyHost, setProxyHost] = useState('');
  const [proxyPort, setProxyPort] = useState('');
  const [proxyUsername, setProxyUsername] = useState('');
  const [proxyPassword, setProxyPassword] = useState('');

  const {
    isEditSessionDialogOpened,
    setIsEditSessionDialogOpened,
    sessionToEditOrDelete,
    setSessionToEditOrDelete,
  } = useDialogsStateStore([
    'isEditSessionDialogOpened',
    'setIsEditSessionDialogOpened',
    'sessionToEditOrDelete',
    'setSessionToEditOrDelete',
  ]);

  const {
    checkedPasswordsIdsArray,
    setCheckedPasswordsIdsArray,
    sitesFreeCredentialsArray,
    sitesCredentialsArray,
  } = usePasswordsStore([
    'checkedPasswordsIdsArray',
    'setCheckedPasswordsIdsArray',
    'sitesFreeCredentialsArray',
    'sitesCredentialsArray',
  ]);

  const {
    generalPaymentDataArray,
    boundPaymentDataArray,
    setPaymentDataArray,
  } = usePaymentDataStore([
    'generalPaymentDataArray',
    'boundPaymentDataArray',
    'setPaymentDataArray',
  ]);

  const {
    pagesMap,
    getWebView,
    editPages,
  } = usePagesStore([
    'pagesMap',
    'getWebView',
    'editPages',
  ]);

  const resetState = () => {
    setProxyHost('');
    setProxyPort('');
    setProxyUsername('');
    setProxyPassword('');
  };

  useEffect(() => {
    if (isEditSessionDialogOpened) {
      resetState();
      const { name, email, partition: p, paymentDataId: pid, proxy, tel } = sessionToEditOrDelete;
      setIsCustomProxy(!!proxy.isCustom);
      if (proxy.isCustom) {
        const [host, port] = proxy.address.split(':');
        setProxyHost(host);
        setProxyPort(port);
        setProxyUsername(proxy.login);
        setProxyPassword(proxy.password);
      }
      setSessionName(`${name} ${email}`);
      if (tel) {
        setTel(tel);
      }
      setPartition(p);
      const pDArray = [...generalPaymentDataArray];
      if (pid) {
        setPaymentDataId(pid);
        const item = boundPaymentDataArray.find(({ id }) => pid === id);
        if (item) {
          pDArray.push(item);
        }
      } else {
        setPaymentDataId('');
      }
      setLocalStatePaymentDataArray(pDArray);
      const passsCheckedArray = sitesCredentialsArray.filter((item) => item.partition === p);
      setPasssArray([
        ...passsCheckedArray,
        ...sitesFreeCredentialsArray
      ]);
      setCheckedPasswordsIdsArray(passsCheckedArray.map(({ _id }) => _id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditSessionDialogOpened]);

  const onSave = async (event) => {
    event.preventDefault();

    const checkedPasswordsIdsArraySet = new Set(checkedPasswordsIdsArray);
    const savedPasswordsArray = [];
    const unchecked = { ids: [] };
    const checked = { ids: [] };
    passsArray.forEach(({ _id, partition: p }) => {
      if (!checkedPasswordsIdsArraySet.has(_id) && p) {
        unchecked.ids.push(_id);
        unchecked.partition = null;
      } else if (checkedPasswordsIdsArraySet.has(_id) && !p) {
        checked.ids.push(_id);
        checked.partition = partition;
      }
    });
    if (unchecked.ids.length) {
      savedPasswordsArray.push(unchecked);
    }
    if (checked.ids.length) {
      savedPasswordsArray.push(checked);
    }
    const data = {
      partition,
      paymentDataId: paymentDataId || null,
      previousPaymentDataId: sessionToEditOrDelete.paymentDataId,
      tel: tel ? tel.replace(/\D/g, '') : null,
      savedPasswordsArray,
    };

    const { proxy } = sessionToEditOrDelete;
    const [host, port] = proxy.address.split(':');

    if (
      isCustomProxy
      && (proxyHost && proxyHost !== host
      || proxyPort && proxyPort !== port
      || proxyPassword && proxyPassword !== proxy.password
      || proxyUsername && proxyUsername !== proxy.login)
    ) {
      data.proxy = {
        address: `${proxyHost || host}:${proxyPort || port}`,
        proxy_server: `${proxyHost || host}:${proxyPort || port}`,
        login: proxyUsername || proxy.login,
        customer_server: proxyUsername || proxy.login,
        password: proxyPassword || proxy.password,
        password_server: proxyPassword || proxy.password,
      };
    }

    const pagesToEdit = [...pagesMap].reduce((filtered, [id, page]) => {
      if (page.session && page.session.partition === partition) {
        if (data.proxy) {
          page.session.proxy = { ...page.session.proxy, ...data.proxy };
        }
        page.session.paymentDataId = data.paymentDataId;
        page.session.credentials.tel = data.tel;
        filtered.push({
          pageId: id,
          props: { session: page.session }
        });
      }
      return filtered;
    }, []);
    if (pagesToEdit.length) {
      editPages(pagesToEdit);
    }

    close();

    try {
      await SessionManager.edit(data);
      if (data.paymentDataId !== sessionToEditOrDelete.paymentDataId) {
        const diskPaymentDataArray = await Settings.get(PAYMENT_DATA_KEY);
        setPaymentDataArray(diskPaymentDataArray);
      }
      showNotification({ type: 'success', message: 'Session edited successfully' });
    } catch (e) {
      showNotification({ type: 'error', message: e.message });
    }
  };

  const close = () => {
    setIsEditSessionDialogOpened(false);
    setSessionToEditOrDelete(null);
  };

  return (
    <DialogWrapper opened={isEditSessionDialogOpened} close={close}>
      <div className="text-center">
        <h5 className="h5 text-gray-900 mb-4">
          Edit session &quot;{sessionName}&quot;
        </h5>
      </div>
      <form className="user" onSubmit={onSave}>
        <div className="mb-3 p-3 overflow-auto" style={{ maxHeight: '350px' }}>
          <div className="mb-4">
            <div className="form-group row">
              <label htmlFor="tel-input" className="col-4 col-form-label">
                Phone Number:
              </label>
              <div className="input-group col-sm-8">
                <div className="input-group-prepend">
                  <span className="input-group-text">+</span>
                </div>
                <input type="tel"
                       className="form-control form-control-user"
                       id="tel-input"
                       placeholder="1 123 456 7890"
                       value={tel}
                       onChange={({ target: { value } }) => setTel(value)}
                />
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="payment-input" className="col-4 col-form-label">
                Payment Data:
              </label>
              <div className="col-sm-8 input-group">
                <select className="custom-select form-control form-control-user"
                        id="payment-input"
                        value={paymentDataId}
                        onChange={({ target: { value } }) => setPaymentDataId(value)}
                >
                  <option key="default" value="">Not chosen</option>
                  {paymentDataArray.map((curr) => {
                    return (
                      <option key={curr.id} value={curr.id}>
                        {curr.nameOnCard}&emsp;&#xB7; {curr.cardNumber.split('').slice(-4).join('')}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
          {isCustomProxy && (
            <div>
              <Divider/>
              <h5 className="h5 text-gray-900 text-center mb-3 mt-4">
                Proxy
              </h5>
              <AddEditUserProxy host={proxyHost}
                                setHost={setProxyHost}
                                port={proxyPort}
                                setPort={setProxyPort}
                                username={proxyUsername}
                                setUsername={setProxyUsername}
                                password={proxyPassword}
                                setPassword={setProxyPassword}
              />
            </div>
          )}

          <Divider/>

          <h5 className="h5 text-gray-900 text-center mb-3 mt-4">
            Saved Passwords
          </h5>
          <PasswordsChecklist list={passsArray}/>
        </div>
        <button type="submit" className="btn btn-primary btn-user btn-block">
          Save Changes
        </button>
      </form>
    </DialogWrapper>
  );
}
