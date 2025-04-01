import { useEffect, useState } from 'react';
import { useStore as usePopupsStateStore } from './popups-state-store';
import PopupWrapper from './popup-wrapper.jsx';
import passwordGenerator from 'generate-password';
import { messages } from '@/common/consts';
import { getState as getPagesStoreState } from '../pages-store';

const { getWebView } = getPagesStoreState();

export default function AutoFillPaymentPopup() {
  const [suggestedPassword, setSuggestedPassword] = useState(false);

  const {
    autoFillPopupParams,
    isAutoFillPopupOpened,
    setIsAutoFillPopupOpened
  } = usePopupsStateStore([
    'autoFillPopupParams',
    'isAutoFillPopupOpened',
    'setIsAutoFillPopupOpened'
  ]);

  const shouldBeShown = isAutoFillPopupOpened
    && autoFillPopupParams.type === 'auto-suggest-passwords';

  useEffect(() => {
    if (!shouldBeShown) return;
    setSuggestedPassword(
      passwordGenerator.generate({
        length: 12,
        numbers: true,
        symbols: true,
        strict: true,
        exclude: ';,|\\/-<>%~=:{}[]()`\'"'
      })
    );
  }, [shouldBeShown]);

  const handleUseSuggestedPassword = () => {
    setIsAutoFillPopupOpened(false);
    getWebView(autoFillPopupParams.pageId)
      .sendToFrame(autoFillPopupParams.frameId, messages.FILL_SUGGESTED_PASSWORD, suggestedPassword);
  };

  const close = () => {
    setIsAutoFillPopupOpened(false);
  };

  return (
    <PopupWrapper shouldBeShown={shouldBeShown}
                  x={autoFillPopupParams.x}
                  y={autoFillPopupParams.y}
                  close={close}
    >
      <div className="btn-group-vertical justify-content-start rounded border border-secondary overflow-auto gray-100"
           style={{ maxHeight: '300px', width: autoFillPopupParams.width, minWidth: '300px' }}
      >
        <button type="button"
                className="btn btn-light d-flex justify-content-between align-items-center"
                onClick={handleUseSuggestedPassword}>
          <small>
            <span className="text-truncate">Use suggested password</span>
          </small>
          <small>
            <span className="ml-2 text-secondary">
              {suggestedPassword}
            </span>
          </small>
        </button>
      </div>
    </PopupWrapper>
  );
}
