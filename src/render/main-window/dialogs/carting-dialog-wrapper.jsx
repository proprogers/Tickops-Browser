import { ipcRenderer } from 'electron';
import { useState, useRef, useEffect } from 'react';
import { getState as getPagesStoreState } from '../pages-store';
import { getState as getMainWindowStoreState } from '../main-window-store';
import { getState as getNotificationsStoreState } from '@/common/components/notifications-store';
import { messages } from '@/common/consts';
import { normalizeUrl } from '@/common/utils';
import DialogWrapper from './dialog-wrapper.jsx';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const { getPageObject } = getPagesStoreState();
const { openLink } = getMainWindowStoreState();
const { show: showNotification } = getNotificationsStoreState();

export default function CartingDialogWrapper(props) {
  const {
    headlineText,
    cartUrl,
    urlInput,
    bulkInputPlaceholder,
    opened,
    close,
    isOneTabSubmitDisabled,
    getCookies,
    resetOneTabTokens,
    inputs,
    bulkMappingFn,
  } = props;

  const [bulkTokens, setBulkTokens] = useState('');
  const [tabId, setTabId] = useState(0);

  const oneTabInputRefs = useRef([]);
  const bulkInputRef = useRef();

  const tooltipText = 'Load cart with specified token(s).';
  const buttonText = tabId === 0 ? 'Load cart in the current tab' : 'Open carts in new tabs';

  useEffect(() => {
    if (!opened) return;
    oneTabInputRefs?.current[0]?.select();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const manualClose = () => {
    close();
    resetOneTabTokens();
    setBulkTokens('');
    setTabId(0);
  };

  const onChangeTabs = (e, v) => {
    setTimeout(v === 0
      ? () => oneTabInputRefs?.current[0].select()
      : () => bulkInputRef.current?.select()
    );
    setTabId(v);
  };

  const onGo = async (event) => {
    event.preventDefault();
    close();

    if (tabId === 0) {
      const cookies = getCookies();
      const page = getPageObject();
      page.webview.stop();
      try {
        await ipcRenderer.invoke(messages.SET_COOKIES, { partition: page.session.partition, cookies });
        await page.webview.loadURL(normalizeUrl(cartUrl));
        resetOneTabTokens();
      } catch (e) {
        showNotification({ message: 'Carting loading URL error', type: 'error' });
        console.info('One tab carting error:', e);
      }
      setBulkTokens('');
      return;
    }
    try {
      const cookies = bulkTokens.split('\n').filter((curr) => curr.trim()).map(bulkMappingFn);
      await openLink({ data: { location: normalizeUrl(cartUrl), cookies, randomSessionsCount: cookies.length } });
      setBulkTokens('');
      setTabId(0);
    } catch (e) {
      showNotification({ message: 'Carting error', type: 'error' });
      console.info('Bulk carting error:', e);
    }
    resetOneTabTokens();
  };

  const OneTabInputs = inputs.map(({ label, value, set }, index) => {
    return (
      <TextField fullWidth
                 autoFocus={index === 0}
                 size="small"
                 variant="outlined"
                 type="text"
                 margin="dense"
                 key={label}
                 label={label}
                 value={value}
                 onChange={(e) => set(e.target.value)}
                 onFocus={() => oneTabInputRefs?.current[index]?.select()}
                 inputProps={{ ref: (el) => oneTabInputRefs.current[index] = el }}
      />
    );
  });

  const BulkInput = (
    <TextField autoFocus
               multiline
               fullWidth
               label="CSV"
               placeholder={bulkInputPlaceholder}
               margin="dense"
               maxRows={4}
               value={bulkTokens}
               onChange={({ target: { value } }) => {
                 setBulkTokens(value);
               }}
               onFocus={() => bulkInputRef.current?.select()}
               inputProps={{ ref: bulkInputRef }}
    />
  );

  const isSubmitDisabled = !cartUrl
    || tabId === 0 && isOneTabSubmitDisabled
    || tabId === 1 && !bulkTokens;

  return (
    <DialogWrapper opened={opened} close={manualClose}>
      <div className="text-center">
        <h5 className="h5 text-gray-900 mb-4 user-select-none">
          {headlineText}&nbsp;&nbsp;
          <Tooltip title={tooltipText}>
            <InfoOutlined fontSize="small" color="action"/>
          </Tooltip>
        </h5>
      </div>
      {
        urlInput &&
        <TextField fullWidth
                   autoFocus
                   size="small"
                   variant="outlined"
                   type="text"
                   margin="dense"
                   label="Checkout URL"
                   value={urlInput.value}
                   onChange={(e) => urlInput.set(e.target.value)}
        />
      }
      <Box sx={{ width: '100%' }}>
        <Tabs centered
              value={tabId}
              onChange={onChangeTabs}
        >
          <Tab label="One Tab"/>
          <Tab label="Bulk"/>
        </Tabs>
      </Box>
      <form onSubmit={onGo}>
        {tabId === 0
          ? OneTabInputs
          : BulkInput}
        <Button fullWidth
                type="submit"
                color="primary"
                variant="contained"
                sx={{ mt: 2 }}
                disabled={isSubmitDisabled}
        >
          {buttonText}
        </Button>
      </form>
    </DialogWrapper>
  );
}

