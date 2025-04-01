import { useState } from 'react';
import { useStore as useBookmarksStore } from '../bookmarks-store';
import DialogWrapper from './dialog-wrapper.jsx';
import { normalizeUrl } from '@/common/utils';

export default function AddBookmarkDialog() {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');

  const {
    setIsAddBookmarkDialogOpened,
    isAddBookmarkDialogOpened,
    addBookmark,
  } = useBookmarksStore([
    'setIsAddBookmarkDialogOpened',
    'isAddBookmarkDialogOpened',
    'addBookmark',
  ]);

  const close = () => setIsAddBookmarkDialogOpened(false);

  const onSave = async (event) => {
    event.preventDefault();
    await addBookmark({ name, url: normalizeUrl(url) });
    close();
  };

  return (
    <DialogWrapper opened={isAddBookmarkDialogOpened} close={close}>
      <div className="text-center">
        <h1 className="h5 text-gray-900 mb-4">
          Save bookmark
        </h1>
      </div>
      <form className="user" onSubmit={onSave}>
        <div className="form-group row">
          <label htmlFor="url-input" className="col-2 col-form-label">
            URL:
          </label>
          <div className="col-sm-10">
            <input type="text"
                   className="form-control form-control-user"
                   id="url-input"
                   placeholder="e.g. ticketmaster.com"
                   value={url}
                   onChange={({ target: { value } }) => setUrl(value)}
            />
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="name-input" className="col-2 col-form-label">
            Name:
          </label>
          <div className="col-sm-10 input-group">
            <input type="text"
                   className="form-control form-control-user"
                   id="name-input"
                   value={name}
                   onChange={({ target: { value } }) => setName(value)}
            />
          </div>
        </div>
        <div className="d-flex justify-content-end">
          <button type="button" className="btn btn-secondary btn-sm mr-1 w-25" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm ml-1 w-25" disabled={!name || !url}>
            Save
          </button>
        </div>
      </form>
    </DialogWrapper>
  );
}
