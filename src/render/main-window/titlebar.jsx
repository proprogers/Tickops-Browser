/* global document */
import { platform } from 'os';
import { ipcRenderer } from 'electron';
import { useCallback, useEffect, useState,memo } from 'react';
import { useStore as usePagesStore } from './pages-store';
import { useStore as useMainWindowStore } from './main-window-store';
import { WindowsControls } from 'react-windows-controls';
import { Tab } from './tab.jsx';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Add from '@mui/icons-material/Add';
import { isDev } from '@/../config';
import { messages } from '@/common/consts';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

export default function TitleBar() {
  const [isLoading, setIsLoading] = useState(false);
  const [tabsNodes, setTabsNodes] = useState([]);
  const [activeTabId, setActiveTabId] = useState(0);
  const [needToScroll, setNeedToScroll] = useState(true);


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
    openNewTab,
    reorderTabs,
    activePageId
  } = usePagesStore([
    'tabs',
    'pagesMap',
    'openNewTab',
    'reorderTabs',
    'activePageId'
  ]);

  const isMac = platform() === 'darwin';

  useEffect(() => {
    ipcRenderer.invoke('get-app-version').then((value) => setAppVersion(value));
  }, []);
  
  


  useEffect(() => {
    if (activeTabId !== activePageId) {
      setActiveTabId(activeTabId);
      const node = document.getElementById('browser-tab-' + activePageId);
      if (node && needToScroll) {
        node.scrollIntoView({ block: 'center', behavior: 'smooth', inline: 'center' });
      }
    }

    const  nodes = tabs.map((pageId, index) => {

      const page = pagesMap.get(pageId);
      if (!page) return;
      const key = `browser-tab-${pageId}`;
      return (
        <Tab key={key}
             id={key}
             index={index}
             page={page}
             setIsLoading={setIsLoading}
             setNeedToScroll={setNeedToScroll}
        /> 
      );
    });
    
    if (!needToScroll) setNeedToScroll(true);
    setActiveTabId(activePageId);
    setTabsNodes(nodes);
  }, [tabs, pagesMap, activePageId]);

  const onNewTab = async () => {
    setIsLoading(true);
    var date = new Date().getTime();
    await openNewTab();

  };

  const setContainerRef = useCallback((element) => {
    if (element === null) return;
    element.addEventListener('wheel', (e) => {
      e.preventDefault();
      element.scrollLeft += e.deltaY;
    });
  }, []);

  const onDragEnd = ({ destination, source }) => {
    if (!destination) return;
    if (destination.index === source.index) return;
    reorderTabs({ startIndex: destination.index, endIndex: source.index });
  };

  return (
    <div id="titlebar">
      <div id="mac-spacer"></div>
      <div id="tabs-container" ref={setContainerRef}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable" direction="horizontal">
            {({ innerRef, droppableProps, placeholder }) => (
              <div ref={innerRef} {...droppableProps}>
                <div id="tabs">
                  {tabsNodes}
                  {placeholder}
                  {isLoading
                    ? <span id="titlebar-spinner">
                        <CircularProgress size={13}/>
                      </span>
                    : <span>
                        <IconButton size="small" onClick={onNewTab}>
                          <Add fontSize="inherit"/>
                        </IconButton>
                      </span>
                  }
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      {(isDev || process.env.IS_BETA) &&
      <span id="app-version">{`v${appVersion}${process.env.IS_BETA ? ' Beta' : ''}`}</span>}
      {!isMac && (
        <WindowsControls onClose={() => ipcRenderer.invoke('on-browser-window-close')}
                         onMinimize={() => ipcRenderer.invoke('on-browser-window-minimize')}
                         onMaximize={() => ipcRenderer.invoke('on-browser-window-maximize')}
                         style={{
                           flexGrow: 0,
                           flexShrink: 0,
                           height: 34,
                           WebkitAppRegion: 'no-drag',
                         }}
        />
      )}
    </div>
  );
}
