import { useState,useEffect } from 'react';
import { useStore as useIntegrationsStore } from '../integrations-store';
import DialogWrapper from './dialog-wrapper.jsx';
import { normalizeUrl } from '@/common/utils';

const initialStateData = {
  service: '',
  key:''
};

export default function AddIntegrationDialog() {
  const [data, setData] = useState({ ...initialStateData });
  const [isError, setIsError] = useState(false);

  const {
    setIsAddIntegrationsDialogOpened,
    isAddIntegrationsDialogOpened,
    saveTokenData,
    selectedIntegrationsDataItem,
    setSelectedIntegrationsDataItem
  } = useIntegrationsStore([
    'setIsAddIntegrationsDialogOpened',
    'isAddIntegrationsDialogOpened',
    'saveTokenData',
    'selectedIntegrationsDataItem',
    'setSelectedIntegrationsDataItem'
  ]);

  useEffect(() => {
    if (isAddIntegrationsDialogOpened) {
      setData({
        ...initialStateData,
        ...selectedIntegrationsDataItem
      });
      setIsError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddIntegrationsDialogOpened]);


  const close = () => {
    setIsAddIntegrationsDialogOpened(false);
    setSelectedIntegrationsDataItem(null);
  }

  const onSave = async (event) => {
    event.preventDefault();
    try {
      saveTokenData({ data, item: selectedIntegrationsDataItem });
    } catch (e) {
      return;
    }
    close();
  };


  return (
    <DialogWrapper opened={isAddIntegrationsDialogOpened} close={close}>
      <div className="text-center">
        <h1 className="h5 text-gray-900 mb-4">
          Save API Key
        </h1>
        {/* <h5 className="h5 text-gray-900 mb-4">You also need to follow the link: <b>https://app.textchest.com/developers/webhooks/</b> and specify our webhook url: <b>http://api.tickops.com:30690/webhooks/textchest</b> so that the system can process your messages. Enter your API key in the line below</h5> */}
      </div>
      <form className="user" onSubmit={onSave}>
        <div className="form-group row">
          <label htmlFor="key-input" className="col-2 col-form-label">
            API:
          </label>
          <div className="col-sm-10">
            <input type="text"
                   className="form-control form-control-user"
                   id="key-input"
                   placeholder="API KEY"
                   value={data.key}
                   onChange={({ target: { value } }) => {
                    setData({ ...data, key: value, service: '2captcha' });
                  }}
            />
          </div>
        </div>
        <div className="d-flex justify-content-end">
          <button type="button" className="btn btn-secondary btn-sm mr-1 w-25" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm ml-1 w-25" disabled={!data.key}>
            Save
          </button>
        </div>
      </form>
    </DialogWrapper>
  );
}

