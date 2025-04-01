import { useState, useEffect } from 'react';
import { useStore as useDialogsStateStore } from './dialogs-state-store';
import { useStore as usePaymentDataStore } from './payment-data-store';
import DialogWrapper from './dialog-wrapper.jsx';
import countries from '@/common/countries.json';
import states from '@/common/us-states.json';

const initialStateData = {
  cardNumber: '',
  cardExpYear: '',
  cardExpMonth: '',
  cardCvc: '',
  nameOnCard: '',
  firstName: '',
  lastName: '',
  email: '',
  country: 'US',
  province: '',
  provinceAbb: 'NY',
  city: '',
  zip: '',
  address1: '',
  address2: '',
  tel: '',
};

export default function AddEditPaymentDataDialogWrapper() {
  const [data, setData] = useState({ ...initialStateData });
  const [isError, setIsError] = useState(false);

  const {
    isAddOrEditPaymentDialogOpened,
    setIsAddOrEditPaymentDialogOpened,
    setIsPaymentDataManagerDialogOpened,
    selectedPaymentDataItem,
    setSelectedPaymentDataItem,
    savePaymentData,
  } = usePaymentDataStore([
    'isAddOrEditPaymentDialogOpened',
    'setIsAddOrEditPaymentDialogOpened',
    'setIsPaymentDataManagerDialogOpened',
    'selectedPaymentDataItem',
    'setSelectedPaymentDataItem',
    'savePaymentData',
  ]);

  const {
    goBack,
    setGoBack,
  } = useDialogsStateStore([
    'goBack',
    'setGoBack',
  ]);

  useEffect(() => {
    if (isAddOrEditPaymentDialogOpened) {
      setData({
        ...initialStateData,
        ...selectedPaymentDataItem,
        cardExpYear: selectedPaymentDataItem
          ? selectedPaymentDataItem.cardExpYear.split('').slice(-2).join('')
          : ''
      });
      setIsError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddOrEditPaymentDialogOpened]);

  const close = () => {
    setIsAddOrEditPaymentDialogOpened(false);
    setSelectedPaymentDataItem(null);
    setGoBack(null);
  };

  const closeAndGoBack = () => {
    goBack();
    close();
  };

  const onSave = (event) => {
    event.preventDefault();
    try {
      savePaymentData({ data, item: selectedPaymentDataItem });
    } catch (e) {
      return;
    }
    setIsPaymentDataManagerDialogOpened(true);
    close();
  };

  return (
    <DialogWrapper opened={isAddOrEditPaymentDialogOpened} close={close} goBack={goBack && closeAndGoBack}>
      <form className="user" onSubmit={onSave}>
        <div className="p-2 overflow-auto" style={{ maxHeight: '350px' }}>
          <div className="form-group">
            <div className="input-group">
              <input type="text"
                     className="form-control form-control-user"
                     style={{ width: '45%' }}
                     placeholder="Card Number"
                     minLength="13"
                     maxLength="19"
                     value={data.cardNumber}
                     onChange={({ target: { value } }) => {
                       setIsError(false);
                       setData({ ...data, cardNumber: value });
                     }}
              />
              <input type="text"
                     className="form-control form-control-user"
                     placeholder="MM"
                     minLength="2"
                     maxLength="2"
                     value={data.cardExpMonth}
                     onChange={({ target: { value } }) => {
                       setData({ ...data, cardExpMonth: value });
                     }}
              />
              <input type="text"
                     className="form-control form-control-user"
                     placeholder="YY"
                     minLength="2"
                     maxLength="2"
                     value={data.cardExpYear}
                     onChange={({ target: { value } }) => {
                       setData({ ...data, cardExpYear: value });
                     }}
              />
              <input type={selectedPaymentDataItem ? 'password' : 'text'}
                     className="form-control form-control-user"
                     style={{ width: '10%' }}
                     placeholder="CVC"
                     minLength="3"
                     maxLength="4"
                     value={data.cardCvc}
                     onChange={({ target: { value } }) => {
                       setData({ ...data, cardCvc: value });
                     }}
              />
            </div>
          </div>
          <div className="form-group row ml-0 mr-0">
            <label htmlFor="name-input" className="col-4 pl-1 col-form-label">
              Name on Card:
            </label>
            <div className="col-sm-8 pr-0 pl-0">
              <input type="text"
                     className="form-control form-control-user"
                     id="name-input"
                     value={data.nameOnCard}
                     onChange={({ target: { value } }) => setData({ ...data, nameOnCard: value })}
              />
            </div>
          </div>
          <div className="form-group row ml-0 mr-0">
            <div className="col-sm-6 mb-3 mb-sm-0 pl-0">
              <label htmlFor="first-name-input" className="pl-1">First Name:</label>
              <input type="text"
                     className="form-control form-control-user"
                     id="first-name-input"
                     value={data.firstName}
                     onChange={({ target: { value } }) => setData({ ...data, firstName: value })}
              />
            </div>
            <div className="col-sm-6 p-0">
              <label htmlFor="last-name-input" className="pl-1">Last Name:</label>
              <input type="text"
                     className="form-control form-control-user"
                     id="last-name-input"
                     value={data.lastName}
                     onChange={({ target: { value } }) => setData({ ...data, lastName: value })}
              />
            </div>
          </div>
          <div className="form-group row ml-0 mr-0">
            <div className="col-sm-6 mb-3 mb-sm-0 pl-0">
              <label htmlFor="country-input" className="pl-1">Country:</label>
              <select className="custom-select form-control form-control-user"
                      id="country-input"
                      value={data.country}
                      onChange={({ target: { value } }) => setData({ ...data, country: value })}
              >
                <option key="default" value="US">United States</option>
                {countries.map(({ name, iso2 }) => {
                  return <option key={iso2} value={iso2}>{name}</option>;
                })}
              </select>
            </div>
            <div className="col-sm-6 p-0">
              <label htmlFor="state-input" className="pl-1">State:</label>
              {data.country === 'US'
                ? <select className="custom-select form-control form-control-user"
                          id="state-input"
                          value={data.provinceAbb}
                          onChange={({ target: { value } }) => setData({ ...data, provinceAbb: value })}
                >
                  <option key="default" value="NY">New York</option>
                  {states.map(([value, { name }]) => {
                    return <option key={value} value={value.toUpperCase()}>{name}</option>;
                  })}
                </select>
                : <input type="text"
                         className="form-control form-control-user"
                         id="state-input"
                         value={data.province}
                         placeholder="e.g. British Columbia"
                         onChange={({ target: { value } }) => setData({ ...data, province: value })}
                />}
            </div>
          </div>
          <div className="form-group row ml-0 mr-0">
            <div className="col-sm-6 mb-3 mb-sm-0 pl-0">
              <label htmlFor="city-input" className="pl-1">City:</label>
              <input type="text"
                     className="form-control form-control-user"
                     id="city-input"
                     value={data.city}
                     placeholder="e.g. Los Angeles"
                     onChange={({ target: { value } }) => setData({ ...data, city: value })}
              />
            </div>
            <div className="col-sm-6 p-0">
              <label htmlFor="postal-input" className="pl-1">ZIP / Postal Code:</label>
              <input type="text"
                     className="form-control form-control-user"
                     id="postal-input"
                     value={data.zip}
                     onChange={({ target: { value } }) => setData({ ...data, zip: value })}
              />
            </div>
          </div>
          <label htmlFor="address-input" className="pl-1">Address:</label>
          <div className="form-group row ml-0 mr-0">
            <div className="col-sm-9 mb-3 mb-sm-0 pl-0">
              <input type="text"
                     className="form-control form-control-user"
                     id="address-input"
                     placeholder="Line 1"
                     value={data.address1}
                     onChange={({ target: { value } }) => setData({ ...data, address1: value })}
              />
            </div>
            <div className="col-sm-3 p-0">
              <input type="text" className="form-control form-control-user"
                     placeholder="Line 2"
                     value={data.address2}
                     onChange={({ target: { value } }) => setData({ ...data, address2: value })}
              />
            </div>
          </div>
          <div className="form-group row ml-0 mr-0">
            <div className="col-sm-5 mb-3 mb-sm-0 pl-0">
              <label htmlFor="tel-input" className="pl-1">Phone Number:</label>
              <input type="text"
                     className="form-control form-control-user"
                     id="tel-input"
                     value={data.tel}
                     onChange={({ target: { value } }) => setData({ ...data, tel: value })}
              />
            </div>
            <div className="col-sm-7 p-0">
              <label htmlFor="email-input" className="pl-1">Email:</label>
              <input type="text"
                     className="form-control form-control-user"
                     id="email-input"
                     value={data.email}
                     onChange={({ target: { value } }) => setData({ ...data, email: value })}
              />
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-user btn-block mt-2"
                disabled={isError || !data.nameOnCard || !data.cardNumber || !data.cardExpYear || !data.cardExpMonth || !data.cardCvc}
        >
          Save Payment Data
        </button>
      </form>
    </DialogWrapper>
  );
}
