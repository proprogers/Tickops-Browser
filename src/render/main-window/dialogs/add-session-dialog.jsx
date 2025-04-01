import { useState, useEffect } from 'react';
import { getState as getNotificationsStoreState } from '@/common/components/notifications-store';
import { useStore as useDialogsStateStore } from './dialogs-state-store';
import { useStore as usePaymentDataStore } from './payment-data-store';
import { useStore as usePasswordsStore } from './passwords-store';
import DialogWrapper from './dialog-wrapper.jsx';
import PasswordsChecklist from './passwords-checklist.jsx';
import AddEditUserProxy from './add-edit-user-proxy.jsx';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Add from '@mui/icons-material/Add';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import ArrowDropUp from '@mui/icons-material/ArrowDropUp';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import SessionManager from '@/common/session-manager/render';

const { show: showNotification } = getNotificationsStoreState();

export default function AddSessionDialog() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tel, setTel] = useState('');

  const [isUseYourOwnProxyChecked, setIsUseYourOwnProxyChecked] = useState(false);
  const [proxyHost, setProxyHost] = useState('');
  const [proxyPort, setProxyPort] = useState('');
  const [proxyUsername, setProxyUsername] = useState('');
  const [proxyPassword, setProxyPassword] = useState('');

  const [paymentDataId, setPaymentDataId] = useState('');
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isAttachPasswordOpened, setIsAttachPasswordOpened] = useState(false);

  const {
    generalPaymentDataArray,
    setIsAddOrEditPaymentDialogOpened,
  } = usePaymentDataStore([
    'setIsAddOrEditPaymentDialogOpened',
    'generalPaymentDataArray',
  ]);

  const {
    checkedPasswordsIdsArray,
    setCheckedPasswordsIdsArray,
  } = usePasswordsStore([
    'checkedPasswordsIdsArray',
    'setCheckedPasswordsIdsArray',
  ]);

  const {
    setIsAddSessionDialogOpened,
    isAddSessionDialogOpened,
  } = useDialogsStateStore([
    'setIsAddSessionDialogOpened',
    'isAddSessionDialogOpened',
  ]);

  const resetState = () => {
    setName('');
    setEmail('');
    setPassword('');
    setTel('');
    setProxyHost('');
    setProxyPort('');
    setProxyUsername('');
    setProxyPassword('');
    setPaymentDataId('');
    setIsPasswordShown(false);
    setIsAttachPasswordOpened(false);
    setIsUseYourOwnProxyChecked(false);
  };

  useEffect(() => {
    resetState();
    setCheckedPasswordsIdsArray([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddSessionDialogOpened]);

  const close = () => setIsAddSessionDialogOpened(false);

  const onSave = async (event) => {
    console.log('onSave triggered');
    event.preventDefault();

    const credentials = {
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      paymentDataId: paymentDataId || null,
      tel: tel ? tel.replace(/\D/g, '') : null,
      checkedPasswordsIdsArray
    };
    if (!credentials.name || !credentials.email || !credentials.password) {
      showNotification({ message: 'Fields must not be filled with spaces only', type: 'error' });
      return;
    }
    if (isUseYourOwnProxyChecked) {
      credentials.userProxy = {
        host: proxyHost,
        port: proxyPort,
        username: proxyUsername,
        password: proxyPassword
      };
    }

    try {
      await SessionManager.save(credentials);
      close();
      showNotification({ message: 'Session saved successfully', type: 'success' });
    } catch (e) {
      console.log(e);
      showNotification({ message: e.message, type: 'error' });
    }
  };

  return (
    <DialogWrapper opened={isAddSessionDialogOpened} close={close}>
      <div className="text-center">
        <h5 className="h5 text-gray-900 mb-3">
          New Session
        </h5>
      </div>
      <form className="user" onSubmit={onSave}>
        <div className="mb-3 p-3 overflow-auto" style={{ maxHeight: '350px' }}>
          <div className="form-group row">
            <label htmlFor="name-input" className="col-4 col-form-label">
              Session Name*:
            </label>
            <div className="col-sm-8">
              <input type="text"
                     className="form-control form-control-user"
                     id="name-input"
                     placeholder="John Smith"
                     value={name}
                     onChange={({ target: { value } }) => setName(value)}
              />
            </div>
          </div>

          <Divider/>

          <h5 className="h5 text-gray-900 my-4">
            Ticketmaster Credentials
          </h5>
          <div className="form-group row">
            <label htmlFor="email-input" className="col-2 col-form-label">
              Email*:
            </label>
            <div className="col-sm-10">
              <input type="text"
                     className="form-control form-control-user"
                     id="email-input"
                     placeholder="hello@tickops.com"
                     value={email}
                     onChange={({ target: { value } }) => setEmail(value)}
              />
            </div>
          </div>
          <div className="form-group row">
            <label htmlFor="password-input" className="col-3 col-form-label">
              Password*:
            </label>
            <div className="col-sm-9 input-group">
              <input type={isPasswordShown ? 'text' : 'password'}
                     className="form-control form-control-user"
                     id="password-input"
                     value={password}
                     onChange={({ target: { value } }) => setPassword(value)}
              />
              <div className="input-group-append">
                <button className="btn btn-outline-primary btn-sm" type="button"
                        onClick={() => setIsPasswordShown(!isPasswordShown)}>
                  {isPasswordShown ? <Visibility fontSize="small"/> : <VisibilityOff fontSize="small"/>}
                </button>
              </div>
            </div>
          </div>
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

          <Divider/>

          <h5 className="h5 text-gray-900 mt-4">
            Payment Data
          </h5>
          <div className="form-group my-4">
            <div className="input-group">
              <select className="custom-select form-control form-control-user"
                      value={paymentDataId}
                      onChange={({ target: { value } }) => setPaymentDataId(value)}
              >
                <option key="default" value="">Not chosen</option>
                {generalPaymentDataArray.map((curr) => {
                  return (
                    <option key={curr.id} value={curr.id}>
                      {curr.nameOnCard}&emsp;&#xB7; {curr.cardNumber.split('').slice(-4).join('')}
                    </option>
                  );
                })}
              </select>
              <div className="input-group-append">
                <button type="button" className="btn btn-outline-primary btn-sm"
                        onClick={() => setIsAddOrEditPaymentDialogOpened(true)}
                        title="Add new"
                >
                  <Add fontSize="small"/>
                </button>
              </div>
            </div>
          </div>

          <Divider/>

          <div className="d-flex justify-content-between align-items-center my-2">
            <div className="d-inline-flex">
              <h5 className="h5 text-gray-900 m-0">
                Use Your Own Proxy
              </h5>
            </div>
            <div className="d-inline-flex">
              <Switch checked={isUseYourOwnProxyChecked}
                      onChange={() => setIsUseYourOwnProxyChecked(!isUseYourOwnProxyChecked)}
              />
            </div>
          </div>
          {isUseYourOwnProxyChecked &&
          <AddEditUserProxy host={proxyHost}
                            setHost={setProxyHost}
                            port={proxyPort}
                            setPort={setProxyPort}
                            username={proxyUsername}
                            setUsername={setProxyUsername}
                            password={proxyPassword}
                            setPassword={setProxyPassword}
          />}

          <Divider/>

          <div className="d-flex justify-content-between align-items-center my-3">
            <div className="d-inline-flex">
              <h5 className="h5 text-gray-900 m-0">
                Attach Saved Passwords
              </h5>
            </div>
            <div className="d-inline-flex">
              <button type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setIsAttachPasswordOpened(!isAttachPasswordOpened)}
                      title={isAttachPasswordOpened ? 'Collapse' : 'Expand'}>
                {isAttachPasswordOpened ? <ArrowDropUp/> : <ArrowDropDown/>}
              </button>
            </div>
          </div>
          {isAttachPasswordOpened && <PasswordsChecklist/>}
        </div>
        <button type="submit" className="btn btn-primary btn-user btn-block"
                disabled={!name || !email || !password}>
          Create New Session
        </button>
      </form>
    </DialogWrapper>
  );
}
