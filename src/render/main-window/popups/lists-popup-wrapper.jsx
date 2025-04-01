/* global window */
import { useStore as usePopupsStateStore } from './popups-state-store';
import PopupWrapper from './popup-wrapper.jsx';
import { useEffect, useState } from 'react';

const initMaxHeightPx = 300;
const minMaxHeightPx = 100;
const browserHeadHeightPx = 72;
const managerButtonHeightPx = 34;
const minGapToBrowserBorderPx = 20;

export default function ListsPopupWrapper(props) {
  const [maxHeightPx, setMaxHeightPx] = useState(initMaxHeightPx);
  const [isReversed, setIsReversed] = useState(false);

  const {
    autoFillPopupParams,
  } = usePopupsStateStore([
    'autoFillPopupParams',
  ]);

  useEffect(() => {
    if (!props.shouldBeShown) return;
    setMaxHeightPx(initMaxHeightPx);
    setIsReversed(false);
    const h = window.innerHeight - autoFillPopupParams.y - browserHeadHeightPx - managerButtonHeightPx - minGapToBrowserBorderPx;
    if (h > initMaxHeightPx) return;
    if (h < minMaxHeightPx) {
      setIsReversed(true);
      return;
    }
    setMaxHeightPx(h);
  }, [props.shouldBeShown, autoFillPopupParams.y]);

  useEffect(() => {
    if (!isReversed) return;
    setMaxHeightPx(initMaxHeightPx);
    const h = autoFillPopupParams.y - autoFillPopupParams.height - minGapToBrowserBorderPx;
    if (h > initMaxHeightPx) return;
    setMaxHeightPx(h > minMaxHeightPx ? h : minMaxHeightPx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReversed, autoFillPopupParams.height]);

  const getExtraListItemClasses = (i, length) => {
    const isFirstElement = i === 0;
    const isLastElement = i === length - 1;

    return isFirstElement
      ? ` border-${isReversed ? 'bottom' : 'top'}-0`
      : isLastElement ? ' rounded-0' : '';
  };

  const managerButton = (
    <button type="button"
            className="btn btn-secondary d-flex justify-content-between align-items-center"
            key="manager"
            onClick={props.handleManagerButtonClick}
            style={{ height: `${managerButtonHeightPx}px` }}
    >
      <small>
        {props.managerButtonText}
      </small>
    </button>
  );

  const commonButtonGroupClasses = 'btn-group-vertical justify-content-start gray-100';

  return (
    <PopupWrapper shouldBeShown={props.shouldBeShown}
                  x={autoFillPopupParams.x}
                  y={autoFillPopupParams.y}
                  transform={isReversed && autoFillPopupParams.height}
                  close={props.close}
    >
      <div
        className={`${commonButtonGroupClasses} rounded border border-${isReversed ? 'top' : 'bottom'}-0 border-secondary`}>
        {isReversed && managerButton}
        <div
          className={`${commonButtonGroupClasses} rounded-${isReversed ? 'bottom' : 'top'} overflow-auto`}
          style={{
            maxHeight: `${maxHeightPx}px`,
            width: autoFillPopupParams.width,
            minWidth: `${props.minWidth || 100}px`
          }}
        >
          {props.getList(getExtraListItemClasses)}
        </div>
        {!isReversed && managerButton}
      </div>
    </PopupWrapper>
  );
}
