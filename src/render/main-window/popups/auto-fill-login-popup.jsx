import { useStore as usePopupsStateStore } from './popups-state-store';
import { getState as getPagesStoreState } from '../pages-store';
import { useStore as usePasswordsStore } from '../dialogs/passwords-store';
import ListsPopupWrapper from './lists-popup-wrapper.jsx';
import { messages } from '@/common/consts';
import psl from 'psl';

const { getWebView } = getPagesStoreState();

export default function AutoFillLoginPopup() {
  const {
    autoFillPopupParams,
    isAutoFillPopupOpened,
    setIsAutoFillPopupOpened,
  } = usePopupsStateStore([
    'autoFillPopupParams',
    'isAutoFillPopupOpened',
    'setIsAutoFillPopupOpened',
  ]);

  const {
    setIsPasswordsManagerDialogOpened,
    sitesCredentials,
  } = usePasswordsStore([
    'setIsPasswordsManagerDialogOpened',
    'sitesCredentials',
  ]);

  const domainName = psl.get(autoFillPopupParams.hostname);
  const credentialsArray = sitesCredentials
    && autoFillPopupParams.hostname
    && sitesCredentials[domainName];

  const credentialsFilteredArray = credentialsArray
    && credentialsArray.length
    && credentialsArray.filter(({ partition = null }) => partition === autoFillPopupParams.partition);

  const shouldBeShown = isAutoFillPopupOpened
    && autoFillPopupParams.type === 'auto-fill-login'
    && credentialsFilteredArray
    && credentialsFilteredArray.length;

  const handlePickingAutofill = (item) => {
    setIsAutoFillPopupOpened(false);
    getWebView(autoFillPopupParams.pageId)
      .sendToFrame(autoFillPopupParams.frameId, messages.FILL_LOGIN, item);
  };

  const handlePasswordsManagerClick = () => {
    setIsPasswordsManagerDialogOpened(true);
    close();
  };

  const close = () => {
    setIsAutoFillPopupOpened(false);
  };

  const getList = (getExtraListItemClasses) => (
    credentialsFilteredArray && credentialsFilteredArray.map((curr, i, a) => {
      const listItemClasses = 'btn btn-light d-flex justify-content-between align-items-center border-right-0 border-left-0';
      return curr && (
        <button type="button"
                className={listItemClasses + getExtraListItemClasses(i, a.length)}
                key={curr._id}
                onClick={() => handlePickingAutofill(curr)}>
          <small>
            <span className="text-truncate">{curr.login}</span>
          </small>
          <small>
              <span className="ml-2">
                {curr.password && curr.password.split('').map((_, i) => {
                  return <strong className="mr-1" key={i + curr._id}>&#xB7;</strong>
                })}
              </span>
          </small>
        </button>
      );
    })
  );

  return (
    <ListsPopupWrapper shouldBeShown={shouldBeShown}
                       close={close}
                       handlePickingAutofill={handlePickingAutofill}
                       getList={getList}
                       minWidth={300}
                       managerButtonText="Manage passwords..."
                       handleManagerButtonClick={handlePasswordsManagerClick}
    />
  );
}
