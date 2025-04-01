import { ipcRenderer } from 'electron';
import { useState } from 'react';
import { useStore as useDialogsStateStore } from './dialogs-state-store';
import { useStore as useMainWindowStore } from '../main-window-store';
import { messages } from '@/common/consts';
import OpenLinkDialogWrapper from './open-link-dialog-wrapper.jsx';

const urlPattern = /^(https?:\/\/)?(www\.)?eventbrite\..+\/e\/.+/;
const ticketsLimits = { min: 1, max: 10 };

export default function EventbriteAutoCartingDialog() {
  const [eventUrl, setEventUrl] = useState('');
  const [ticketsType, setTicketsType] = useState('');
  const [ticketsNumber, setTicketsNumber] = useState(1);
  const [isUrlInvalid, setIsUrlInvalid] = useState(false);
  const [isTicketsNumberInvalid, setIsTicketsNumberInvalid] = useState(false);
  const [isTicketsTypeInvalid, setIsTicketsTypeInvalid] = useState(false);
  const [isUrlInputUpdated, setIsUrlInputUpdated] = useState(false);

  const {
    openLink,
    setAutoCartingLoading,
  } = useMainWindowStore([
    'openLink',
    'setAutoCartingLoading'
  ]);

  const {
    isEventbriteAutoCartingDialogOpened,
    setIsEventbriteAutoCartingDialogOpened,
    setCheckedSessions,
  } = useDialogsStateStore([
    'isEventbriteAutoCartingDialogOpened',
    'setIsEventbriteAutoCartingDialogOpened',
    'setCheckedSessions',
  ]);

  const isSubmitDisabled = !isUrlInputUpdated || !ticketsType
    || isUrlInvalid || isTicketsNumberInvalid;

  const resetState = () => {
    setTicketsType('');
    setTicketsNumber(1);
    setIsTicketsNumberInvalid(false);
    setIsTicketsTypeInvalid(false);
    setIsUrlInvalid(false);
    setIsUrlInputUpdated(false);
  };

  const getExtraDataOnGo = () => {
    return {
      eventLocation: eventUrl,
      tickets: {
        type: ticketsType.toLowerCase(),
        number: ticketsNumber
      }
    };
  };

  const onChangeUrlInput = (url) => {
    !isUrlInputUpdated && setIsUrlInputUpdated(true);
    setEventUrl(url);
    setIsUrlInvalid(!url.match(urlPattern));
  };

  const onChangeTicketTypeInput = ({ target: { value } }) => {
    setTicketsType(value);
    setIsTicketsTypeInvalid(!value);
  };

  const onChangeTicketsNumberInput = ({ target: { value } }) => {
    setTicketsNumber(value);
    setIsTicketsNumberInvalid(!!(value < ticketsLimits.min || value > ticketsLimits.max));
  };

  const onClose = () => {
    setIsEventbriteAutoCartingDialogOpened(false);
    setCheckedSessions([]);
  };

  const autoCartInputs = (
    <div className="form-group row">
      <div className="col-sm-7">
        <label htmlFor="tickets-type" className="pl-1">
          Tickets type
        </label>
        <input type="text" id="tickets-type"
               className={`form-control form-control-user ${isTicketsTypeInvalid && 'is-invalid'}`}
               value={ticketsType}
               onChange={onChangeTicketTypeInput}
        />
        <div className="invalid-feedback pl-1">
          Tickets type must be filled
        </div>
      </div>
      <div className="col-sm-5">
        <label htmlFor="tickets-number" className="pl-1">
          Number of tickets
        </label>
        <input type="number" id="tickets-number"
               className={`form-control form-control-user ${isTicketsNumberInvalid && 'is-invalid'}`}
               value={ticketsNumber}
               onChange={onChangeTicketsNumberInput}
        />
        <div className="invalid-feedback pl-1">
          Must be between {ticketsLimits.min} and {ticketsLimits.max}
        </div>
      </div>
    </div>
  );

  return (
    <OpenLinkDialogWrapper submitButtonTitle="Cart tickets"
                           opened={isEventbriteAutoCartingDialogOpened}
                           onGo={(data) => openLink({
                             data, extraFunction: (data) => {
                               ipcRenderer.send(messages.AUTO_CART, data);
                               setAutoCartingLoading({ value: true, pageId: data.pageId });
                             }
                           })}
                           close={onClose}
                           invalidUrl={isUrlInvalid}
                           isSubmitDisabled={isSubmitDisabled}
                           onChangeUrlInput={onChangeUrlInput}
                           extraInputs={autoCartInputs}
                           getExtraDataOnGo={getExtraDataOnGo}
                           resetState={resetState}
    />
  );
}
