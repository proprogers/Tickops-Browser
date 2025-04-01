import { ipcRenderer } from 'electron';
import { useRef, useEffect, useState } from 'react';
import { useStore as useAddressBarStore } from './addressbar-store';
import { useStore as useBookmarksStore } from './bookmarks-store';
import InputBase from '@mui/material/InputBase';
import StarBorder from '@mui/icons-material/StarBorder';
import Star from '@mui/icons-material/Star';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { CUSTOM_PROTOCOL } from '@/common/consts';

export default function AddressBar(props) {
  const inputRef = useRef();


  let {
    location,
    pageId,
    setLocation,
    getLocation,
    clearLocation,
    updateLocation,
    prevLocation,
    setPrevLocation,
    onContextMenu,
    onKeyDown,
    onMouseUp,
  } = useAddressBarStore([
    'location',
    'pageId',
    'setLocation',
    'getLocation',
    'clearLocation',
    'updateLocation',
    'prevLocation',
    'setPrevLocation',
    'onContextMenu',
    'onKeyDown',
    'onMouseUp',
  ]);

  const {
    bookmarksPopupAnchorEl,
    setBookmarksPopupAnchorEl,
    isBookmarked,
    setIsBookmarked,
    bookmarksMap,
    setBookmarksPopupParams,
  } = useBookmarksStore([
    'bookmarksPopupAnchorEl',
    'setBookmarksPopupAnchorEl',
    'isBookmarked',
    'setIsBookmarked',
    'bookmarksMap',
    'setBookmarksPopupParams',
  ]);

  useEffect(() => {
    location = getLocation();
    setLocation(location);
    setPrevLocation(location);

    ipcRenderer.on('focus-input', () => {
      inputRef.current.focus();
      inputRef.current.select();
    });

    

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    inputRef.current.focus();
    inputRef.current.select();
  }, []);

  useEffect(() => {
      clearLocation(location);
      updateLocation();
      // console.log(location);
    inputRef.current.focus();
    inputRef.current.select();
      
  },[pageId()]);

  const checkAndSetIfBookmarked = (value) => {
    setIsBookmarked(
      bookmarksMap.has(value)
      || bookmarksMap.has(value.replace(/\/$/, ''))
    );
  };

  useEffect(() => {
    if (!props.page || props.page.location === prevLocation) return;
    setLocation(props.page.location.startsWith(CUSTOM_PROTOCOL) ? '' : props.page.location);
    setPrevLocation(props.page.location);
    checkAndSetIfBookmarked(props.page.location);
  });

  useEffect(() => {
    if (!props.page || !props.page.location) return;
    checkAndSetIfBookmarked(props.page.location);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarksMap]);

  // useEffect(() => { clearLocation()},[]);

  const handleBookmarksButtonClick = (event) => {
    if (bookmarksPopupAnchorEl) {
      setBookmarksPopupParams({ name: null, url: null, edit: false });
      setBookmarksPopupAnchorEl(null);
    } else {
      setBookmarksPopupParams({
        name: isBookmarked ? bookmarksMap.get(props.page && props.page.location) : props.page.title,
        url: props.page && props.page.location,
        edit: isBookmarked
      });
      setBookmarksPopupAnchorEl(event.currentTarget);
    }
  };

  
  return (
  
    <InputBase 
               fullWidth
               sx={{
                 height: 30,
                 border: '1px solid rgba(0, 0, 0, 0.23)',
                 borderRadius: '20px',
                 margin: '4px',
                 color: '#777',
                 padding: '0 10px 0 15px',
                 '&:focus': {
                  border: '2px solid green'
                  },
                  ':focus': {
                    border: '2px solid green'
                    }, 

                  "&.Mui-focused": {
                    border: '2px solid green'
                  }
                    
                
               }}
               value={getLocation()}
              //  disabled={!props.page || !props.page.session || !props.page.session.proxy}
               onChange={({ target: { value } }) => setLocation(value)}
               endAdornment={(
                 <InputAdornment position="end">
                   <IconButton onClick={handleBookmarksButtonClick}
                               disabled={
                                 !location
                                //  || location.startsWith(CUSTOM_PROTOCOL)
                                 || !props.page
                                 || props.page && !props.page.title
                               }
                               title="Bookmark this tab"
                               style={{ padding: 0 }}
                   >
                     {isBookmarked
                       ? <Star fontSize="small"/>
                       : <StarBorder fontSize="small"/>}
                   </IconButton>
                 </InputAdornment>
               )}
               inputRef={inputRef}
               inputProps={{
               
                //  ref: inputRef,
                 onBlur: () => inputRef.current.setSelectionRange(0, 0),
                 onMouseUp,
                 onKeyDown,
                 onContextMenu,
                 style: {
                   textOverflow: 'ellipsis',
                   letterSpacing: 'normal',
                   '&:focus': {
                    border: '2px solid green',
                  },
                 }
               }}
    />
    
  );
}
