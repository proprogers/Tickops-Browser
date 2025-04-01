import { useStore as usePaymentDataStore } from './payment-data-store';
import ConfirmDialogWrapper from './confirm-dialog-wrapper.jsx';

export default function ConfirmDeletePaymentDataDialog() {
  const {
    isConfirmDeletePaymentDataDialogOpened,
    setIsConfirmDeletePaymentDataDialogOpened,
    selectedPaymentDataItem,
    setSelectedPaymentDataItem,
    setIsPaymentDataManagerDialogOpened,
    deletePaymentData,
  } = usePaymentDataStore([
    'isConfirmDeletePaymentDataDialogOpened',
    'setIsConfirmDeletePaymentDataDialogOpened',
    'selectedPaymentDataItem',
    'setSelectedPaymentDataItem',
    'setIsPaymentDataManagerDialogOpened',
    'deletePaymentData',
  ]);

  const text = selectedPaymentDataItem
    ? `Delete ${selectedPaymentDataItem.nameOnCard} ${selectedPaymentDataItem.cardNumber}?`
    : '';

  const close = () => {
    setIsPaymentDataManagerDialogOpened(true);
    setIsConfirmDeletePaymentDataDialogOpened(false);
    setSelectedPaymentDataItem(null);
  };

  const onConfirm = async (event) => {
    event.preventDefault();
    await deletePaymentData(selectedPaymentDataItem);
    close();
  };

  return <ConfirmDialogWrapper opened={isConfirmDeletePaymentDataDialogOpened}
                               close={close}
                               text={text}
                               onConfirm={onConfirm}
  />;
}
