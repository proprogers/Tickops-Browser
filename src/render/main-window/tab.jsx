import { ipcRenderer } from 'electron';
import { useState, useEffect, memo } from 'react';
import { useStore as usePagesStore } from './pages-store';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Close from '@mui/icons-material/Close';
import { Draggable } from 'react-beautiful-dnd';
import favicons from '../../../img/favicon.ico'; 
import { useStore as useNavbarStore } from './navbar-store';
import { useStore as usePreferencesStore } from './dialogs/preferences-store';
///proxy 

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
const states = require('../../common/us-states.json');

export function Tab(props) {
  const [isTabHovered, setIsTabHovered] = useState(false);
  const [isTabClick, setIsTabClick] = useState(false);
  const [open, setOpen] = useState(false);

  const handleClickAway = () => {

    console.log("HANDLECLICKAWAY");
    setOpen((prev) => !prev);
    // setOpen(true);
  };

  const {
    userProxy
  } = usePreferencesStore([
   'userProxy'
  ]);


  const {
    refreshIp,
    handleClearCookies,
    toggleActiveInBg,
    toggleProxyLocation
  } = useNavbarStore([
    'refreshIp',
    'handleClearCookies',
    'toggleActiveInBg',
    'toggleProxyLocation'
  ]);


  const {
    closePages,
    pagesMap,
    setTabMenuParams,
    activePageId,
    setActivePageId,
  } = usePagesStore([
    'pagesMap',
    'closePages',
    'setTabMenuParams',
    'activePageId',
    'setActivePageId',
  ]);

  // console.log("render "+props.page.id);
  const isActive = activePageId === props.page.id;

  const page = props.page;
  if(page.title){
    page.title = page.title.indexOf("othertab") !== -1 ? 'New Tab' : page.title;
  }
 
    const favicon = props.page.location.indexOf("http") !== -1 ? 'http://www.google.com/s2/favicons?domain='+props.page.location :  favicons;
    var title = page.title || 'loading';
    const session = page.session || {};
    const sessionInfo = session.proxy
      ? session.credentials
        ? `${session.credentials.name} ${session.credentials.email}`
        : session.proxy.info
      : '';
  
 

  useEffect(() => {
    props.setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  

  const onMouseDown = async ({ button }) => {
    
    if (button === 2) return;
    if (button === 1){
      var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      
      fetch("https://grescode.com/ticketmaster/delete_tab.php?tab="+props.page.id+"&hash_id="+props.page.hash_id, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
      return closePages([page.id]);
    }
    setActivePageId(page.id);
    props.setNeedToScroll(false);
    page.color = null;
  };

  
  const onContextMenu = (e) => {

    if(e.target.className.indexOf('proxy_list') === -1){
      setOpen(false);
      setTabMenuParams(page);
      ipcRenderer.invoke('open-tab-context-menu');
    }
  };

  const pageClasses = 'page ' +
    'visible';

    const [proxy, setProxyLocation] = useState('');
    
    // if(page && page.session){
    //   // console.log(page.session.proxy);
    //   setProxyLocation(page.session.proxy.info);
    // }
    

    var top100Films = [];
    for( var i = 0; i < states.length; i++){
      top100Films.push({ label: states[i][1].name, value: states[i][1].mysterium });
    }

    top100Films = top100Films.sort(function(a, b){
      var nameA=a.label.toLowerCase(), nameB=b.label.toLowerCase()
      if (nameA < nameB) 
        return -1
      if (nameA > nameB)
        return 1
      return 0 
      })

  
  
  function proxyLocationChange(location){
    // console.log(location);
    setProxyLocation(location);
    toggleProxyLocation(session, location)
    setOpen(false);
  }

  if(props.class == 'tab-left'){
    var styles = { 
      width: 140, 
      fontSize: '6px', 
      cursor: 'default',
      // display: 'contents',
      color: 'white',
      '.MuiAutocomplete-inputRoot':{
        fontSize: '9px', 
        color: '#f4f4f4',
        cursor: 'default',
      },
      '.MuiAutocomplete-inputRoot::before': {
        display:'none'
      },
      '.MuiInput-root .MuiInput-input':{
        cursor: 'default'
      },
      '.Mui-disabled':{
        "-webkit-text-fill-color": "#a3a3a3e3",
        color: '#a3a3a3e3'
      }
      // '.MuiPaper-root':{
      //   width: 119,
      //   fontSize: '11px',
      //   lineHeight: 1.2
      // },
      // '.MuiAutocomplete-inputRoot':{
      //   top: '2px',
      // }
    };
  } else {
    var styles = { 
      width: 140, 
      fontSize: '6px', 
      top: '14px',
      cursor: 'default',
      color: 'rgba(0, 0, 0, 0.54)',
      position:'unset',
      cursor: 'default',
      '.MuiInput-root .MuiInput-input':{
        cursor: 'default'
      },
      '.MuiAutocomplete-inputRoot':{
        fontSize: '9px', 
        cursor: 'default'
      },
      '.MuiAutocomplete-inputRoot::before': {
        display:'none'
      },
      // '.Mui-disabled':{
      //   "-webkit-text-fill-color": "white",
      //   color: 'white'
      // }
      // '.MuiAutocomplete-inputRoot':{
      //   display: 'flow',
      // }
    };
  }
  return (
    <>

    <Draggable key={page.id} draggableId={'draggable-tab-' + page.id} index={props.index}>
    
      {({ innerRef, draggableProps, dragHandleProps }) => {

        const inputs = document.querySelectorAll('input.MuiAutocomplete-input');
        inputs.forEach(input => input.disabled = true);

        useEffect(() => {
          
          
          const onClick = e => { setOpen(false);};
          document.addEventListener('click', onClick);
          
          return () => document.removeEventListener('click', onClick);

          
          
        }, []);

      
          return (
            <div id={props.id}
              ref={innerRef}
              {...draggableProps}
              {...dragHandleProps}
              // style={{cursor: !isTabClick ? 'default' :''}}
              className={`${props.class ? props.class : 'tab'} ${activePageId === page.id ? 'active' : (page.color || '')}`}
              title={session.proxy ? session.proxy.info : title}
              onContextMenu={(e) => onContextMenu(e)}
              onMouseDown={onMouseDown}
              onMouseOver={() => setIsTabHovered(true)}
              onMouseLeave={() => setIsTabHovered(false)}
            >
              {/* {props.page.location.indexOf("http") !==-1 && */}
              {props.page.isLoading 
                  ? 
                  <span id="tab-spinner">
                    <CircularProgress style={{ marginLeft: 6,marginTop:10,color: props.class == 'tab-left' ? 'white':'black'}} size={12} />
                  </span> 
              : <img style={{ width: 13, marginTop: 9, marginLeft: 6, borderRadius: 3, height: 13 }} src={favicon} alt="Logo" />}
              <span style={{width:'100px'}}>
                {props.page.timer &&
                  <span className={`mr-1 font-weight-bold text-${props.page.timer.split(':')[0].trim() == '00' ? 'danger' : 'dark'}`}>
                    {props.page.timer}
                  </span>}
                <b>{title}</b>
              
                <br />
               
                {(session.proxy && isActive) ?
                 <div className="proxy_list">
                  {open && !session.proxy.isCustom ?
                    <Autocomplete
                      // disabled={!isActive}
                      freeSolo={true}
                      disablePortal
                      disableClearable
                      open={open}
                      // readOnly={!open}
                      id="disable-clearable"
                      options={top100Films}
                      sx={styles}
                      value={session.proxy.info?session.proxy.info:'loading...'}
                      isOptionEqualToValue={(option, value) => option.value === value.value}
                      onChange={(event, newValue) => {
                        // console.log(event);
                        proxyLocationChange(newValue);
                        
                      }}
                      renderInput={isActive ? (params) => <TextField sx={{fontSize: '6px'}} {...params}  variant="standard" /> :''}
                      
                    /> : session.proxy && <div className="proxy_list" onContextMenu={handleClickAway}><span className="proxy_list" style={{fontSize: '9px'}}>
                    {session.proxy.info}
                  </span></div>
                    }
                    </div> : session.proxy && <span style={{fontSize: '9px'}}>
                    {session.proxy.info}
                  </span>
                }
                 

              </span>
              {isTabHovered &&
              <IconButton size="small"
                          onClick={() => closePages([props.page.id])}
                          onMouseDown={(event) => event.stopPropagation()}
              >
                <Close style={{color: (isTabHovered && !isActive) ? 'white' : 'black'}} fontSize="10px"/>
              </IconButton>
            } 
            </div>
          );
        }}
      
    </Draggable>
    </>
    
    
  );
}

export const MemoizedTab = memo(Tab);
