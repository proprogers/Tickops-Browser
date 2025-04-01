import DialogWrapper from './dialog-wrapper.jsx';

export default function ConfirmDialogWrapper(props) {
  return (
    <DialogWrapper opened={props.opened} close={props.close} style={{ minHeight: '0' }}>
      <div className="text-center">
        <h1 className="h5 text-gray-900 mb-4">
          {props.text}
        </h1>
      </div>
      <form className="user" onSubmit={props.onConfirm}>
        <div className="d-flex">
          <button type="button" className="btn btn-secondary btn-user flex-grow-1 mr-2" onClick={props.close}>
            No
          </button>
          <button type="submit" className="btn btn-primary btn-user flex-grow-1 ml-2">
            Yes
          </button>
        </div>
      </form>
    </DialogWrapper>
  );
}
