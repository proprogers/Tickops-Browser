import { useStore as usePopupsStateStore } from './popups-state-store';
import { getState as getPagesStoreState } from '../pages-store';
import ListsPopupWrapper from './lists-popup-wrapper.jsx';
import { useStore as usePaymentDataStore } from '../dialogs/payment-data-store';

const { autoFillPaymentData } = getPagesStoreState();

export default function AutoFillPaymentPopup() {
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
    setIsPaymentDataManagerDialogOpened,
    generalPaymentDataArray,
    boundPaymentDataArray,
  } = usePaymentDataStore([
    'setIsPaymentDataManagerDialogOpened',
    'generalPaymentDataArray',
    'boundPaymentDataArray',
  ]);

  let currentPaymentDataArray = [];

  if (autoFillPopupParams.paymentDataId) {
    const item = boundPaymentDataArray.find(({ id }) => autoFillPopupParams.paymentDataId === id);
    if (item) {
      currentPaymentDataArray.push(item);
    } else {
      currentPaymentDataArray = generalPaymentDataArray;
    }
  } else {
    currentPaymentDataArray = generalPaymentDataArray.filter((item) => item[autoFillPopupParams.dataName]);
  }

  const shouldBeShown = isAutoFillPopupOpened
    && autoFillPopupParams.type === 'auto-fill-payment'
    && !!currentPaymentDataArray.length;

  const handlePickingAutofill = (item) => {
    setIsAutoFillPopupOpened(false);
    autoFillPaymentData({ item, pageId: autoFillPopupParams.pageId, needToClear: true });
  };

  const handlePaymentDataManagerClick = () => {
    setIsPaymentDataManagerDialogOpened(true);
    close();
  };

  const close = () => {
    setIsAutoFillPopupOpened(false);
  };

  const getList = (getExtraListItemClasses) => (
    currentPaymentDataArray.map((curr, i, a) => {
      const listItemClasses = 'btn btn-light d-flex flex-column border-right-0 border-left-0';
      return curr && (
        <button type="button"
                className={listItemClasses + getExtraListItemClasses(i, a.length)}
                style={{ borderColor: '#ced0de' }}
                key={curr.id}
                onClick={() => handlePickingAutofill(curr)}>
          <small>
            <strong className="text-truncate">{curr[autoFillPopupParams.dataName]}</strong>
          </small>
          <small className="d-flex justify-content-between w-100">
            <span className="text-truncate">{curr.nameOnCard}</span>
            <span className="ml-2">
              <strong className="mr-1">&#xB7;</strong>
              {curr.cardNumber.split('').slice(-4).join('')}
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
                       minWidth={170}
                       managerButtonText="Manage payment data..."
                       handleManagerButtonClick={handlePaymentDataManagerClick}
    />
  );
}
