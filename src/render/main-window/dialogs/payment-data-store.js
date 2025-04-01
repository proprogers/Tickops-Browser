import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';
import { getState as getNotificationsStoreState } from '@/common/components/notifications-store';
import { getState as getUserStoreState } from '@/common/components/user-store';
import { ipcRenderer } from 'electron';
import API from '@/API';
import { messages, PAYMENT_DATA_KEY } from '@/common/consts';
import EncryptionManager from '@/common/encryption-manager';
import Settings from '@/common/settings';
import cardTypes from '@/preload/autofill/card-types.json';

const { show: showNotification } = getNotificationsStoreState();

const cardTypesMap = new Map(cardTypes);

function getCardType(cardNumber) {
  const split = cardNumber.split('');
  return cardTypesMap.get(split.slice(0, 2).join())
    || cardTypesMap.get(split[0]);
}

const store = create((set) => ({
  isAddOrEditPaymentDialogOpened: false,
  setIsAddOrEditPaymentDialogOpened: (v) => set(() => ({ isAddOrEditPaymentDialogOpened: v })),
  isPaymentDataManagerDialogOpened: false,
  setIsPaymentDataManagerDialogOpened: (v) => set(() => ({ isPaymentDataManagerDialogOpened: v })),
  selectedPaymentDataItem: null,
  setSelectedPaymentDataItem: (v) => set(() => ({ selectedPaymentDataItem: v })),
  isConfirmDeletePaymentDataDialogOpened: false,
  setIsConfirmDeletePaymentDataDialogOpened: (v) => set(() => ({ isConfirmDeletePaymentDataDialogOpened: v })),

  generalPaymentDataArray: [],
  boundPaymentDataArray: [],
  setPaymentDataArray: (v) => {
    const { masterPasswordHash, iv } = getUserStoreState();
    if (!masterPasswordHash || !iv) return;
    const decrypt = (data) => EncryptionManager.decrypt({ data, iv, masterPasswordHash });
    const generalPaymentDataArray = [];
    const boundPaymentDataArray = [];
    v.forEach((curr) => {
      for (const prop in curr) {
        if (!curr[prop]) delete curr[prop];
      }
      const cardExpMonthDecrypted = decrypt(curr.cardExpMonth);
      const cardExpYearDecrypted = decrypt(curr.cardExpYear);
      const item = {
        ...curr,
        id: curr._id,
        cardNumber: decrypt(curr.cardNumber),
        cardExpYear: cardExpYearDecrypted,
        cardExpMonth: cardExpMonthDecrypted,
        cardExp: `${cardExpMonthDecrypted}/${cardExpYearDecrypted.split('').slice(-2).join('')}`,
        cardCvc: decrypt(curr.cardCvc),
        paymentMethod: 'credit or debit card'
      };
      const cardType = getCardType(item.cardNumber);
      if (cardType) {
        item.cardType = cardType;
      }
      if (item.partition) {
        boundPaymentDataArray.push(item);
      } else {
        generalPaymentDataArray.push(item);
      }
    });
    return set(() => ({ generalPaymentDataArray, boundPaymentDataArray }));
  },
  savePaymentData: async ({ data, item }) => {
    if (!data.nameOnCard || !data.cardNumber || !data.cardExpYear || !data.cardExpMonth || !data.cardCvc) {
      showNotification({ message: 'Card fields are required', type: 'error' });
      return;
    }
    try {
      const formattedData = {};
      for (const property in data) {
        if (data[property]) {
          formattedData[property] = data[property].trim();
        }
      }
      formattedData.cardExpYear = `20${formattedData.cardExpYear}`;
      if (item) {
        let isModified = false;
        for (const prop in formattedData) {
          if (formattedData[prop] !== item[prop]) {
            isModified = true;
            break;
          }
        }
        if (!isModified) return;
      }
      const { masterPasswordHash, iv } = await ipcRenderer.invoke(messages.GET_USER);
      const encrypt = (data) => EncryptionManager.encrypt({ data, iv, masterPasswordHash });
      const newPaymentDataItem = {
        ...formattedData,
        province: formattedData.country === 'US' ? formattedData.provinceAbb : formattedData.province,
        nameOnCard: formattedData.nameOnCard.trim(),
        cardNumber: encrypt(formattedData.cardNumber.replace(/ /g, '')),
        cardExpYear: encrypt(formattedData.cardExpYear),
        cardExpMonth: encrypt(formattedData.cardExpMonth),
        cardCvc: encrypt(formattedData.cardCvc),
      };
      if (item) {
        const editedPaymentDataItemWithId = await API.editPaymentData({
          id: item.id,
          data: newPaymentDataItem
        });
        await Settings.findAndUpdateArrayItems(PAYMENT_DATA_KEY, [{
          value: editedPaymentDataItemWithId,
          findIndexFunc: ({ _id }) => _id === item.id
        }]);
      } else {
        const newPaymentDataItemWithId = await API.savePaymentData(newPaymentDataItem);
        await Settings.addToArray(PAYMENT_DATA_KEY, newPaymentDataItemWithId);
      }
      showNotification({
        message: `Payment data ${item ? 'edited' : 'saved'} successfully`,
        type: 'success'
      });
    } catch (e) {
      showNotification({ message: e.message, type: 'error' });
      throw e;
    }
  },
  deletePaymentData: async (item) => {
    try {
      await API.deletePaymentData(item.id);
    } catch (e) {
      const message = 'Error deleting payment data';
      showNotification({ message, type: 'error' });
      console.error(e);
      return;
    }
    await Settings.findAndRemoveArrayItems(PAYMENT_DATA_KEY, [({ _id }) => _id === item.id]);
    const message = 'The record was successfully deleted';
    showNotification({ message, type: 'success' });
    if (!item.partition) return;
    await API.editSession({ paymentDataId: null, partition: item.partition });
  }
}));

const useStore = getUseStore(store);
const { getState, setState, subscribe, destroy } = store;

export { useStore, getState, setState, subscribe, destroy };
