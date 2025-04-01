import Close from '@mui/icons-material/Close';
import ArrowBack from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';

export default function DialogWrapper(props) {
  return (
    <div>
      <div id="popup" className={`fade${props.opened ? '-in-popup' : '-out'}`}>
        <div className="content-popup">
          {props.goBack &&
          <IconButton size="small" onClick={props.goBack}>
            <ArrowBack fontSize="inherit"/>
          </IconButton>}
          <IconButton size="small" className="float-right" onClick={props.close}>
            <Close fontSize="inherit"/>
          </IconButton>
          <div className='p-3 mt-1'>
            {props.children}
          </div>
        </div>
      </div>
      {/* <div className={`popup-overlay fade${props.opened ? '-in-overlay' : '-out'}`}/> */}
    </div>
  );
}
