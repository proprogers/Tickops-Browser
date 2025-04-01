import { useState, useRef, useEffect } from 'react';
import { useStore as useUserStore } from '@/common/components/user-store';
import { useStore as useDialogsStateStore } from './dialogs-state-store';
import { normalizeUrl } from '@/common/utils';
import DialogWrapper from './dialog-wrapper.jsx';
import Divider from '@mui/material/Divider';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const states = require('../../../common/us-states.json');


const sessionsLimits = { min: 1, max: 500 };

export default function OpenLinkDialogWrapper(props) {
  const [isRandomChecked, setIsRandomChecked] = useState(false);
  const [randomSessionsCount, setRandomSessionsCount] = useState(1);
  const [locationSessionsCount, setLocationSessionsCount] = useState(1);
  const [date, setDate] = useState('');
  const [maxDate, setMaxDate] = useState('');
  const [proxyLocation, setProxyLocation] = useState('');
  const [needToRunAt, setNeedToRunAt] = useState(false);
  const [invalidSessionsCountSet, setInvalidSessionsCountSet] = useState(new Set());

  const {
    sessions
  } = useUserStore([
    'sessions',
  ]);

  const {
    openingLinkUrl,
    setOpeningLinkUrl,
    checkedSessionsMap,
    setCheckedSessionsMap,
  } = useDialogsStateStore([
    'openingLinkUrl',
    'setOpeningLinkUrl',
    'checkedSessionsMap',
    'setCheckedSessionsMap',
  ]);

  const urlInputRef = useRef();

  const resetState = () => {
    setInvalidSessionsCountSet(new Set());
    setNeedToRunAt(false);
    setDate(dateToDateInputString(new Date()));
    setMaxDate(getMaxDate());
    setRandomSessionsCount(1);
    setLocationSessionsCount(1);
    setProxyLocation('');
    setIsRandomChecked(false);

    props.resetState && (props.resetState());
  };

  useEffect(() => {
    if (!props.opened) return;
    resetState();
    urlInputRef.current.focus();
    urlInputRef.current.select();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.opened]);

  const getTimerValue = () => {
    const d = new Date(date + 'Z');
    const seconds = d.getTime() - new Date().getTime();
    return seconds > 0 ? seconds : 0;
  };

  const onGo = (event) => {
    event.preventDefault();
    props.close();

    const data = props.getExtraDataOnGo ? { ...props.getExtraDataOnGo() } : {};
    !data.location && (data.location = normalizeUrl(openingLinkUrl));

    data.sessions = [...checkedSessionsMap];
    if (isRandomChecked) {
      data.randomSessionsCount = randomSessionsCount;
    }

    if(proxyLocation){
      data.proxyLocation = proxyLocation;
      data.locationSessionsCount = locationSessionsCount;
    }
    setTimeout(() => props.onGo(data), getTimerValue()); // TODO
  };

  const onToggleCheckbox = (partition, count = 1) => {
    if (!partition) {
      setIsRandomChecked(!isRandomChecked);
      if (isRandomChecked) setRandomSessionsCount(1);
      return;
    }
    if (checkedSessionsMap.has(partition)) {
      checkedSessionsMap.delete(partition);
    } else {
      checkedSessionsMap.set(partition, count);
    }
    setCheckedSessionsMap(new Map([...checkedSessionsMap]));
  };

  const onChangeUrlInput = ({ target: { value } }) => {
    setOpeningLinkUrl(value);
    props.onChangeUrlInput && props.onChangeUrlInput(value);
  };

  const onChangeOpenOnTimeInput = () => setNeedToRunAt(!needToRunAt);

  const onChangeDateInput = ({ target: { value } }) => setDate(value);

  const onChangeSessionsCountInput = ({ target: { value } }, key) => {
    if (key === 'random') {
      setRandomSessionsCount(value);
    } else if('location'){
      setLocationSessionsCount(value);
    } else {
      checkedSessionsMap.set(key, value);
      setCheckedSessionsMap(new Map([...checkedSessionsMap]));
    }
    if (!(value < sessionsLimits.min || value > sessionsLimits.max)) {
      if (!invalidSessionsCountSet.has(key)) return;
      invalidSessionsCountSet.delete(key);
    } else {
      invalidSessionsCountSet.add(key);
    }
    setInvalidSessionsCountSet(new Set([...invalidSessionsCountSet]));
  };

  const dateToDateInputString = (d) => {
    return d.toISOString().split(':').splice(0, 2).join(':')
  };

  const getMaxDate = () => {
    const maxDateIn = 1000 * 60 * 60 * 24 * 7;
    const d = new Date(new Date().getTime() + maxDateIn);
    return dateToDateInputString(d);
  };

  var statesArr = [];
  for( var i = 0; i < states.length; i++){
    statesArr.push({ label: states[i][1].name, value: states[i][1].mysterium });
  }

  statesArr = statesArr.sort(function(a, b){
    var nameA=a.label.toLowerCase(), nameB=b.label.toLowerCase()
    if (nameA < nameB) 
      return -1
    if (nameA > nameB)
      return 1
    return 0 
    })


function proxyLocationChange(location){
  setProxyLocation(location);
  // toggleProxyLocation(session, location)
}

  const list = (
    <ul className="list-group list-group-flush pb-3 overflow-auto" style={{ maxHeight: '300px' }}>
      <li key="random"
          className="row list-group-item d-flex justify-content-between align-items-center list-group-item-action">
        <div className={`custom-control custom-checkbox text-truncate py-2 col-${isRandomChecked ? '9' : '12'}`}
             style={{ paddingLeft: '30px' }}>
          <input type="checkbox" className="custom-control-input" checked={isRandomChecked} id="random"
                 onClick={() => onToggleCheckbox()} onChange={() => {
          }}/>
          <label className="custom-control-label font-weight-bold" htmlFor="random">
            Random
          </label>
        </div>
        {isRandomChecked &&
        <div className="col-3 pr-0">
          <input type="number"
                 className={`form-control form-control-user ${invalidSessionsCountSet.has('random') && 'is-invalid'}`}
                 value={randomSessionsCount}
                 onChange={(e) =>  onChangeSessionsCountInput(e, 'random')}/>
          <div className="invalid-feedback pl-1">
            Must be between {sessionsLimits.min} and {sessionsLimits.max}
          </div>
        </div>}
      </li>
      {sessions
        .map(({ partition, credentials }) => {
          const inputId = `${partition}-dialog`;
          const count = checkedSessionsMap.get(partition);
          return (
            <li key={partition}
                className="row list-group-item d-flex justify-content-between align-items-center list-group-item-action">
              <div className={`custom-control custom-checkbox text-truncate py-2 col-${count ? '9' : '12'}`}
                   style={{ paddingLeft: '30px' }}>
                <input type="checkbox" className="custom-control-input" checked={!!count} id={inputId}
                       onClick={() => onToggleCheckbox(partition, count)} onChange={() => {
                }}/>
                <label className="custom-control-label" htmlFor={inputId}>
                  {credentials.name} {credentials.email}
                </label>
              </div>
              {!!count &&
              <div className="col-3 pr-0">
                <input type="number"
                       className={`form-control form-control-user ${invalidSessionsCountSet.has(partition) && 'is-invalid'}`}
                       value={checkedSessionsMap.get(partition) || 0}
                       onChange={(e) => onChangeSessionsCountInput(e, partition)}/>
                <div className="invalid-feedback pl-1">
                  Must be between {sessionsLimits.min} and {sessionsLimits.max}
                </div>
              </div>}
            </li>
          );
        })}
    </ul>
  );

  const urlInput = (
    <div className="form-group row">
      <label htmlFor="url" className="col-2 pl-3 col-form-label">
        URL:
      </label>
      <div className="col-10">
        <input autoFocus
               type="text"
               id="url"
               className={`form-control form-control-user ${props.invalidUrl && 'is-invalid'}`}
               ref={urlInputRef}
               value={openingLinkUrl}
               onChange={onChangeUrlInput}
        />
        <div className="invalid-feedback pl-1">
          Invalid URL
        </div>
      </div>
    </div>
  );

  const dateInputs = (
    <div className="form-group row mx-1">
      <label htmlFor="datetime-local" className="col-4 col-form-label">
        <div className="custom-control custom-switch">
          <input type="checkbox" className="custom-control-input" id="timeSwitch"
                 checked={needToRunAt}
                 onChange={onChangeOpenOnTimeInput}
          />
          <label className="custom-control-label" htmlFor="timeSwitch">
            Run at:
          </label>
        </div>
      </label>
      <div className="col-8">
        <input className="form-control form-control-user"
               type="datetime-local"
               value={date}
               disabled={!needToRunAt}
               onChange={onChangeDateInput}
               min={date}
               max={maxDate}
        />
      </div>
    </div>
  );

  return (
    <DialogWrapper opened={props.opened} close={props.close}>
      <form className="user" onSubmit={onGo}>
        {urlInput}
        {props.extraInputs}
        {dateInputs}
        <div className="tab-content mt-3">
          <Divider>Sessions</Divider>
         <li key="random"
          className="row list-group-item d-flex justify-content-between align-items-center list-group-item-action">
        <div className={`custom-control custom-checkbox py-2 col-${proxyLocation ? '9' : '12'}`}
             style={{ paddingLeft: '30px', zIndex: 99}}> 
              <Autocomplete
              // disablePortal
              disableClearable
              disabled={isRandomChecked}
              id="disable-clearable"
              options={statesArr}
              sx={{ width: 200, zIndex: 9999 }}
              value={proxyLocation}
              onChange={(event, newValue) => {
                proxyLocationChange(newValue);
              }}
              renderInput={(params) => <TextField {...params}  variant="standard" />}
            />
        </div>
        {proxyLocation && !isRandomChecked &&
        <div className="col-3 pr-0">
          <input type="number"
                 className={`form-control form-control-user ${invalidSessionsCountSet.has('random') && 'is-invalid'}`}
                 value={locationSessionsCount}
                 onChange={(e) =>  onChangeSessionsCountInput(e, 'location')}/>
          <div className="invalid-feedback pl-1">
            Must be between {sessionsLimits.min} and {sessionsLimits.max}
          </div>
        </div>}
      </li>
          {list}
          <button type="submit" className="btn btn-primary btn-user btn-block"
                  disabled={invalidSessionsCountSet.size || props.isSubmitDisabled}>
            {props.submitButtonTitle}
          </button>
        </div>
      </form>
    </DialogWrapper>
  );
}
