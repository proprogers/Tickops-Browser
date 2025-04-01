import { ipcRenderer } from 'electron';
import { useState, useRef, useEffect } from 'react';
import Close from '@mui/icons-material/Close';
import TextFields from '@mui/icons-material/TextFields';

export default function PageSearch(props) {
  const [matchCase, setMatchCase] = useState(false);
  const [findNext, setFindNext] = useState(true);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    ipcRenderer.on('page-search', () => {
      setIsSearching(true);
      inputRef.current && inputRef.current.focus();
      inputRef.current && inputRef.current.select();
    });
  }, []);

  const resetState = () => {
    setIsSearching(false);
    setFindNext(true);
    setMatchCase(false);
    setQuery('');
  };

  const close = () => {
    setIsSearching(false);
    props.stop();
    resetState();
  };

  const onKeyDown = (event) => {
    switch (event.keyCode) {
      case 13:
      case 38:
      case 40:
        event.preventDefault();
        props.onPageSearch({
          query: event.target.value,
          options: {
            matchCase,
            findNext,
            forward: event.keyCode === 13 || event.keyCode === 40
          }
        });
        setFindNext(false);
        setQuery(event.target.value);
        break;
      case 27:
        close();
        break;
    }
  };

  const toggleMatchCase = () => {
    props.stop();
    props.onPageSearch({
      query,
      options: {
        matchCase: !matchCase,
        findNext: true
      }
    });
    setMatchCase(!matchCase);
    setFindNext(false);
  };

  return (
    <form id="page-search"
          className="d-none d-sm-inline-block form-inline position-absolute navbar-search shadow-sm">
      <div className={'input-group ' + (isSearching ? 'visible' : 'hidden')}>
        <input type="text"
               className="form-control border-0 bg-light small"
               placeholder="Search for..."
               aria-label="Search"
               aria-describedby="basic-addon2"
               onKeyDown={onKeyDown}
               onChange={() => setFindNext(true)}
               ref={inputRef}
        />
        <div className="input-group-append">
          <button type="button"
                  className={'btn btn-sm ' + (matchCase ? 'btn-hovered' : 'bg-light')}
                  onClick={toggleMatchCase}
                  title="Match case">
            <TextFields fontSize="small"/>
          </button>
          <button type="button" className="btn btn-sm bg-light" onClick={close}>
            <Close fontSize="small"/>
          </button>
        </div>
      </div>
    </form>
  );
}
