import { useState, memo, useEffect, useCallback, useRef } from 'react';
import { useStore as usePagesStore } from './pages-store';
import MemorPage from './page.jsx';

export default function Tabs(props) {

  
  const [tabsNodes, setTabsNodes] = useState([]);

  const {
    pagesMap,
    webviews
  } = usePagesStore([
    'tabs',
    'pagesMap'
  ]);

  window.page=pagesMap;

  const listItems =  [...pagesMap].map(([id, page]) => {    
    if (!page) return;
      return  <MemorPage key={`page-${id}`} class={props.class} page={page}/>
  });

  

  return (<>{listItems}</>)
}
