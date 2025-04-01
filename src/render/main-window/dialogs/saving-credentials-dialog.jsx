import { useState } from 'react';
import { getState as getUserStoreState } from '@/common/components/user-store';
import { getState as getNotificationsStoreState } from '@/common/components/notifications-store';
import { getState as getPagesStoreState } from '../pages-store';
import { useStore as usePasswordsStore } from './passwords-store';
import { SITES_CREDENTIALS_KEY } from '@/common/consts';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EncryptionManager from '@/common/encryption-manager';
import API from '@/API';
import psl from 'psl';
import Settings from '@/common/settings';
import DialogWrapper from './dialog-wrapper.jsx';

const { show: showNotification } = getNotificationsStoreState();
const { editPageSiteCredentials } = getPagesStoreState();

export default function SavingCredentialsDialog() {
  const [isPasswordShown, setIsPasswordShown] = useState(false);

  const {
    isSavingCredentialsDialogOpened,
    setIsSavingCredentialsDialogOpened,
    savingCredentials,
    setSavingCredentials
  } = usePasswordsStore([
    'isSavingCredentialsDialogOpened',
    'setIsSavingCredentialsDialogOpened',
    'savingCredentials',
    'setSavingCredentials'
  ]);

  const hostname = psl.get(savingCredentials.location.split('/')[2]);

  const close = () => {
    setIsSavingCredentialsDialogOpened(false);
    setIsPasswordShown(false);
    editPageSiteCredentials(savingCredentials.pageId);
  };

  const onSave = async () => {
    const { iv, masterPasswordHash } = getUserStoreState();
    const encPassword = EncryptionManager.encrypt({
      data: savingCredentials.password,
      iv,
      masterPasswordHash
    });
    try {
      if (savingCredentials.alreadySavedItemId) {
        const editedPasswordDataWithId = await API.editSiteCredentials({
          id: savingCredentials.alreadySavedItemId,
          data: { hostname, login: savingCredentials.login, password: encPassword }
        });
        await Settings.findAndUpdateArrayItems(SITES_CREDENTIALS_KEY, [{
          value: editedPasswordDataWithId,
          findIndexFunc: ({ _id }) => _id === savingCredentials.alreadySavedItemId
        }]);
      } else {
        const newSiteDataItemWithId = await API.saveSiteCredentials({
          login: savingCredentials.login,
          password: encPassword,
          hostname,
          partition: savingCredentials.partition
        });
        await Settings.addToArray(SITES_CREDENTIALS_KEY, newSiteDataItemWithId);
      }
      const message = `Password has been successfully ${savingCredentials.alreadySavedItemId ? 'updated' : 'saved'}`;
      showNotification({ message, type: 'success' });
    } catch (e) {
      const message = `Error ${savingCredentials.alreadySavedItemId ? 'updating' : 'saving'} password`;
      showNotification({ message, type: 'error' });
      return;
    }
    close();
  };

  return (
    <DialogWrapper opened={isSavingCredentialsDialogOpened} close={close}>
      <div className="text-center">
        <h5 className="h5 text-gray-900 mb-4 user-select-none">
          {savingCredentials.alreadySavedItemId ? 'Update' : 'Save'} password for {hostname}?
        </h5>
      </div>
      <form>
        <div className="form-group row">
          <label htmlFor="login-input" className="col-3 col-form-label">
            Login:
          </label>
          <div className="col-sm-9">
            <input type="text"
                   className="form-control form-control-user"
                   id="login-input"
                   readOnly={savingCredentials.alreadySavedItemId}
                   value={savingCredentials.login || ''}
                   onChange={({ target: { value } }) => {
                     setSavingCredentials({ ...savingCredentials, login: value });
                   }}
            />
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="password-input" className="col-3 col-form-label">
            Password:
          </label>
          <div className="col-sm-9 input-group">
            <input type={isPasswordShown ? 'text' : 'password'}
                   className="form-control form-control-user"
                   id="password-input"
                   value={savingCredentials.password || ''}
                   onChange={({ target: { value } }) => {
                     setSavingCredentials({ ...savingCredentials, password: value });
                   }}
            />
            <div className="input-group-append">
              <button className="btn btn-outline-primary" type="button"
                      onClick={() => setIsPasswordShown(!isPasswordShown)}>
                {isPasswordShown ? <Visibility fontSize="small"/> : <VisibilityOff fontSize="small"/>}
              </button>
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary btn-sm mr-1 w-25" type="button" onClick={onSave}>
            {savingCredentials.alreadySavedItemId ? 'Update' : 'Save'}
          </button>
          <button className="btn btn-secondary btn-sm ml-1 w-25" type="button" onClick={close}>
            No
          </button>
        </div>
      </form>
    </DialogWrapper>
  );
}
