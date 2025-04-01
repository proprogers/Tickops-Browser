import { useStore as useDialogsStateStore } from './dialogs-state-store';
import { useStore as usePaymentDataStore } from './payment-data-store';
import DialogWrapper from './dialog-wrapper.jsx';
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Done from '@mui/icons-material/Done';
import Tooltip from '@mui/material/Tooltip';

export default function PaymentDataManagerDialog() {
  const {
    isPaymentDataManagerDialogOpened,
    setIsPaymentDataManagerDialogOpened,
    setIsAddOrEditPaymentDialogOpened,
    setIsConfirmDeletePaymentDataDialogOpened,
    setSelectedPaymentDataItem,
    generalPaymentDataArray,
    boundPaymentDataArray,
  } = usePaymentDataStore([
    'isPaymentDataManagerDialogOpened',
    'setIsPaymentDataManagerDialogOpened',
    'setIsAddOrEditPaymentDialogOpened',
    'setIsConfirmDeletePaymentDataDialogOpened',
    'setSelectedPaymentDataItem',
    'generalPaymentDataArray',
    'boundPaymentDataArray',
  ]);

  const {
    setGoBack
  } = useDialogsStateStore([
    'setGoBack',
  ]);

  const close = () => setIsPaymentDataManagerDialogOpened(false);

  const handleDeleteClick = (curr) => {
    setSelectedPaymentDataItem(curr);
    setIsConfirmDeletePaymentDataDialogOpened(true);
    close();
  };

  const handleAddClick = () => {
    setGoBack(() => setIsPaymentDataManagerDialogOpened(true));
    setIsAddOrEditPaymentDialogOpened(true);
    close();
  };

  const handleEditClick = (curr) => {
    setSelectedPaymentDataItem(curr);
    setGoBack(() => setIsPaymentDataManagerDialogOpened(true));
    setIsAddOrEditPaymentDialogOpened(true);
    close();
  };

  return (
    <DialogWrapper opened={isPaymentDataManagerDialogOpened} close={close}>
      <div className="text-center">
        <h5 className="h5 text-gray-900 mb-3">
          Saved Payment Data
        </h5>
      </div>
      <ul className="list-group list-group-flush overflow-auto" style={{ maxHeight: '350px' }}>
        <li className="list-group-item d-flex justify-content-between align-items-center text-gray-900" key="add-one">
          Add New
          <div className="d-inline-flex">
            <Tooltip title="Add">
              <IconButton color="primary" onClick={handleAddClick}>
                <Add fontSize="small"/>
              </IconButton>
            </Tooltip>
          </div>
        </li>
        {[
          ...boundPaymentDataArray,
          ...generalPaymentDataArray
        ].map((curr) => {
          return (
            <li className="list-group-item d-flex justify-content-between align-items-center" key={curr._id}>
              <div className="d-flex justify-content-between align-items-center w-100 mr-4">
                <span className="text-truncate" style={{ maxWidth: '150px' }}>{curr.nameOnCard}</span>
                {curr.partition && <span className="font-italic">(assigned)</span>}
                <span className="ml-2">
                  <strong className="mr-1">&#xB7;</strong>
                  {curr.cardNumber.split('').slice(-4).join('')}
                </span>
              </div>
              <div className="d-inline-flex">
                <Tooltip title="Edit">
                  <IconButton color="primary" onClick={() => handleEditClick(curr)}>
                    <Edit fontSize="small"/>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton onClick={() => handleDeleteClick(curr)}>
                    <Delete fontSize="small"/>
                  </IconButton>
                </Tooltip>
              </div>
            </li>
          );
        })}
      </ul>
    </DialogWrapper>
  );
}
