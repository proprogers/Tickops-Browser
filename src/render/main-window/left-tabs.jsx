/* global document */
import { platform } from 'os';
import { ipcRenderer } from 'electron';
import { useCallback, useEffect, useState,memo, useMemo } from 'react';
import { useStore as usePagesStore } from './pages-store.js';
import { useStore as useMainWindowStore } from './main-window-store.js';
import { WindowsControls } from 'react-windows-controls';
import { MemoizedTab } from './tab.jsx';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Add from '@mui/icons-material/Add';
import { isDev } from '@/../config';
import { messages } from '@/common/consts';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

export default function LeftTabs() {
  const [isLoading, setIsLoading] = useState(false);
  const [tabsNodes, setTabsNodes] = useState([]);
  const [activeTabId, setActiveTabId] = useState(0);
  const [scrollValue, setScrollValue] = useState(0);
  const [needToScroll, setNeedToScroll] = useState(true);
  const [isTabHovered, setIsTabHovered] = useState(false);

  const {
    appVersion,
    setAppVersion
  } = useMainWindowStore([
    'appVersion',
    'setAppVersion'
  ]);

  
  const {
    tabs,
    pagesMap,
    openOtherTab,
    reorderTabsReverse,
    reorderTabs,
    activePageId
  } = usePagesStore([
    'tabs',
    'pagesMap',
    'openOtherTab',
    'reorderTabsReverse',
    'reorderTabs',
    'activePageId'
  ]);

  const isMac = platform() === 'darwin';

  useEffect(() => {
    ipcRenderer.invoke('get-app-version').then((value) => setAppVersion(value));
    // ipcRenderer.on(messages.TAB_CONTEXT_MENU, (e, type) => {
    //   if (type === 'create') setIsLoading(true);
    // });
  }, []);
  

  useEffect(() => {
 
    
    const  nodes = tabs.map((pageId, index) => {

      // console.log(tabs.length-1-index);
      const page = pagesMap.get(pageId);
      // console.log(page);
      if (!page) return;
      const key = `browser-tab-${pageId}`;
      return (
        <MemoizedTab 
             key={key}
             class="tab-left"
             id={key}
             index={tabs.length-1-index}
             page={page}
             setIsLoading={setIsLoading}
             setNeedToScroll={setNeedToScroll}
        /> 
      );
    }).reverse();

    

   
    if (activeTabId !== activePageId) {
      setActiveTabId(activeTabId);
      const node = document.getElementById('browser-tab-' + activePageId);
      if (node && needToScroll) {
        node.scrollIntoView({ block: 'center', behavior: 'smooth', inline: 'center' });
      }
    }

    
    if (!needToScroll) setNeedToScroll(true);
    setActiveTabId(activePageId);
    setTabsNodes(nodes);

    var end = new Date().getTime();

    // console.log("RELOAD TABS");
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs, pagesMap]);

  const onNewTab = async () => {
    setIsTabHovered(false);
    setIsLoading(true);
    var date = new Date().getTime();
    // console.log("start "+date)
    await openOtherTab();

  };

  const setContainerRef = useCallback((element) => {
    // if (element === null) return;
    // element.addEventListener('wheel', (e) => {
    //   e.preventDefault();
    //   // var value = scrollValue+e.deltaY;
    //   // setScrollValue(value);
    //   // console.log(value);
    //   // console.log(scrollValue);
    //   // console.log(e.deltaY);

    //   // element.scroll += e.deltaY;
    // });
  }, []);

  const onDragEnd = (event) => {
    // console.log(tabsNodes)
    // console.log("DRAG");
    // console.log(event);

    if (!event.destination) return;
    // if (event.destination.index === event.source.index) return;
    
    reorderTabsReverse({ startIndex:  event.destination.index, endIndex: event.source.index});
  };


  return (
    <div id="titlebar_left">
      <div className="left-drop"></div>
      <div id="tabs-container-left" ref={setContainerRef}>
        <DragDropContext style={{width:'100%'}} onDragEnd={onDragEnd}>
        <span 
          className="tab-left" 
          style={{background: isTabHovered?'#939393':'rgba(89, 87, 87, 0.34)'}} 
          onClick={onNewTab}
          onMouseOver={() => setIsTabHovered(true)}
          onMouseLeave={() => setIsTabHovered(false)}
        >

                        <IconButton size="small" sx={{color: 'white'}}>
                          <Add fontSize="inherit"/> 
                        </IconButton>
                        <span style={{paddingTop: '10px',paddingLeft: '0px',fontSize: '12px'}}>New tab</span>
          </span>
          <Droppable droppableId="droppable" className="left-sidebar-dropable" sx={{width:"100%"}} direction="vertical">
            {({ innerRef, droppableProps, placeholder }) => (
              <div ref={innerRef} {...droppableProps} style={{cursor:'default !important'}}>
                <div id="tabs-left" >
                
                  {tabsNodes}
                  {placeholder}
                  {isLoading
                    && <span id="titlebar-spinner">
                        <CircularProgress size={13}/>
                      </span>
                    
                  }
                 
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      
      <div className='tickops-software'><span>TickOps Software 2024 Version: <b>{appVersion}</b></span></div>
    </div>
  );
}
