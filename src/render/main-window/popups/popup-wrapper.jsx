import { POPUP_ID } from '@/common/consts';
import Close from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

export default function PopupWrapper(props) {
  const style = {
    left: `${props.x || 0}px`,
    top: `${props.y || 0}px`,
    zIndex: 2
  };
  if (props.transform) {
    style.transform = `translate(0, -100%) translate(0, -${props.transform}px)`;
  }
  return (
    <div id={POPUP_ID}
         key={Date.now()}
         className={`position-absolute d-${props.shouldBeShown ? 'block' : 'none'}`}
         style={style}
    >
      <IconButton size="small" className="float-right" onClick={props.close}>
        <Close fontSize="inherit"/>
      </IconButton>
      {props.children}
    </div>
  );
}
