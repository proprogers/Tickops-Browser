import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';
import Settings from '@/common/settings';
import API from '@/API';
import { messages, INTEGRATIONS_KEY } from '@/common/consts';
import { getState as getNotificationsStoreState } from '@/common/components/notifications-store';
const { show: showNotification } = getNotificationsStoreState();

const store = create((set, get) => ({
  generalIntegrationsArray: [],
  isAddIntegrationsDialogOpened: false,
  setIsAddIntegrationsDialogOpened: (v) => set(() => ({ isAddIntegrationsDialogOpened: v })),
  selectedIntegrationsDataItem: {},
  setSelectedIntegrationsDataItem: (v) => set(() => ({selectedIntegrationsDataItem: v })),
  setIntegrations: (v) => {

    const { generalIntegrationsArray } = get();
    v.forEach((curr) => {
      for (const prop in curr) {
        if (!curr[prop]) delete curr[prop];
      }
      const item = {
        ...curr,
        id: curr._id,
        service: curr.service,
        key: curr.key
      };
   
      generalIntegrationsArray.push(item);
      
    });
    return set(() => ({ generalIntegrationsArray}));
  },
  setGeneralIntegrationsData: (service) =>{
    const { generalIntegrationsArray,setSelectedIntegrationsDataItem } = get();
    generalIntegrationsArray.forEach((curr) => {
      
      if (curr.service == service){
        setSelectedIntegrationsDataItem(curr);
      }
    });
  },
  saveTokenData: async ({data, item }) => {

    const formattedData = {};
    for (const property in data) {
      if (data[property]) {
        formattedData[property] = data[property].trim();
      }
    }

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

    const newIntegrationDataItem = {
      ...formattedData
    };
        
    if (item) {
      const editedIntegrationDataItemWithId = await API.editIntegrationsData({
        id: item.id,
        data: newIntegrationDataItem
      });
      await Settings.findAndUpdateArrayItems(INTEGRATIONS_KEY, [{
        value: editedIntegrationDataItemWithId,
        findIndexFunc: ({ _id }) => _id === item.id
      }]);
    } else {
      const newIntegrationDataItemId = await API.saveIntegrationsData(newIntegrationDataItem);
      await Settings.addToArray(INTEGRATIONS_KEY, newIntegrationDataItemId);
    }
    showNotification({
      message: `API data ${item ? 'edited' : 'saved'} successfully`,
      type: 'success'
    });
    
  },
  
  integrationsMenuAnchorEl: null,
  setIntegrationsMenuAnchorEl: (v) => set(() => ({ integrationsMenuAnchorEl: v })),

}));



const useStore = getUseStore(store);
const { getState, setState, subscribe, destroy } = store;

const currentStoreState = getState();

export { useStore, getState, setState, subscribe, destroy };
