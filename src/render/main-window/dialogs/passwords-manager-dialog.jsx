import { useEffect, useState } from 'react';
import { useStore as usePasswordsStore } from './passwords-store';
import DialogWrapper from './dialog-wrapper.jsx';
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Done from '@mui/icons-material/Done';
import Close from '@mui/icons-material/Close';
import FileUpload from '@mui/icons-material/FileUpload';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

export default function PasswordsManagerDialog() {
  const [editingItemId, setEditingItemId] = useState(null);
  const [isAddItemOpened, setIsAddItemOpened] = useState(false);
  const [hostname, setHostname] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const {
    isPasswordsManagerDialogOpened,
    setIsPasswordsManagerDialogOpened,
    savePassword,
    editPassword,
    deletePassword,
    sitesCredentialsArray,
    handleImport,
    fileInputValue,
  } = usePasswordsStore([
    'isPasswordsManagerDialogOpened',
    'setIsPasswordsManagerDialogOpened',
    'savePassword',
    'editPassword',
    'deletePassword',
    'sitesCredentialsArray',
    'handleImport',
    'fileInputValue',
  ]);

  const assignedSitesCredentialsArray = [];
  const unassignedSitesCredentialsArray = [];
  sitesCredentialsArray.forEach((curr) => {
    if (curr.partition) {
      assignedSitesCredentialsArray.push(curr);
    } else {
      unassignedSitesCredentialsArray.push(curr);
    }
  });

  useEffect(() => {
    if (isPasswordsManagerDialogOpened) {
      resetState();
    }
  }, [isPasswordsManagerDialogOpened]);

  const resetState = () => {
    setLogin('');
    setHostname('');
    setPassword('');
    setIsAddItemOpened(false);
    setEditingItemId(null);
  };

  const close = () => setIsPasswordsManagerDialogOpened(false);

  const handleAddNewClick = async () => {
    if (isAddItemOpened) {
      try {
        await savePassword({ hostname, login, password });
        resetState();
      } finally {
        // eslint-disable-next-line no-unsafe-finally
        return;
      }
    }
    resetState();
    setIsAddItemOpened(true);
  };

  const handleSaveEditClick = async ({ isEditing, item }) => {
    if (isEditing) {
      try {
        await editPassword({ id: editingItemId, hostname, login, password });
        resetState();
      } finally {
        // eslint-disable-next-line no-unsafe-finally
        return;
      }
    }
    setIsAddItemOpened(false);
    setPassword(item.password);
    setLogin(item.login);
    setHostname(item.hostname);
    setEditingItemId(item._id);
  };

  const handleRemoveClick = async ({ isEditing, id }) => {
    if (!isEditing) {
      await deletePassword(id);
    }
    resetState();
  };

  return (
    <DialogWrapper opened={isPasswordsManagerDialogOpened} close={close}>
      <div className="text-center">
        <h5 className="h5 text-gray-900 mb-3">
          Saved Passwords
        </h5>
      </div>
      <ul className="list-group list-group-flush overflow-auto" style={{ maxHeight: '350px' }}>
        <li className="list-group-item flex-column justify-content-between align-items-center text-gray-900"
            key="add-one">
          <div className="d-flex justify-content-between align-items-center w-100 mr-4 mb-1">
            Add New
            <div className="d-inline-flex">
              <Tooltip title={isAddItemOpened ? 'Save' : 'Add'}>
                <IconButton color="primary" onClick={handleAddNewClick}>
                  {isAddItemOpened ? <Done fontSize="small"/> : <Add fontSize="small"/>}
                </IconButton>
              </Tooltip>
              {isAddItemOpened
                ? <Tooltip title="Cancel">
                  <IconButton onClick={resetState}>
                    <Close fontSize="small"/>
                  </IconButton>
                </Tooltip>
                : <Tooltip title="Import CSV file (url,username,password)">
                  <IconButton color="primary" component="label">
                    <input type="file" accept=".csv" hidden value={fileInputValue} onChange={handleImport}/>
                    <FileUpload fontSize="small"/>
                  </IconButton>
                </Tooltip>}
            </div>
          </div>
          {isAddItemOpened && (
            <div className="pt-2">
              <div className="form-group row">
                <label htmlFor="hostname-input" className="col-3 col-form-label">Hostname:</label>
                <div className="col-sm-9">
                  <input type="text"
                         id="hostname-input"
                         placeholder="e.g. ticketmaster.com"
                         className="form-control form-control-user form-control-sm"
                         onChange={({ target: { value } }) => setHostname(value)}
                         value={hostname}
                  />
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="login-input" className="col-3 col-form-label">Login:</label>
                <div className="col-sm-9">
                  <input type="text"
                         id="login-input"
                         className="form-control form-control-user form-control-sm"
                         onChange={({ target: { value } }) => setLogin(value)}
                         value={login}
                  />
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="password-input" className="col-3 col-form-label">Password:</label>
                <div className="col-sm-9">
                  <input type="text"
                         id="password-input"
                         className="form-control form-control-user form-control-sm"
                         onChange={({ target: { value } }) => setPassword(value)}
                         value={password}
                  />
                </div>
              </div>
            </div>
          )}
        </li>
        {[
          ...assignedSitesCredentialsArray,
          ...unassignedSitesCredentialsArray,
        ].map((curr) => {
          const isEditing = curr._id === editingItemId;
          const inputsClassName = `form-control-sm  ${isEditing ? 'form-control form-control-user' : 'form-control-plaintext'}`;
          return (
            <li className="list-group-item flex-column justify-content-between align-items-center" key={curr._id}>
              <div className="d-flex justify-content-between align-items-center w-100 mr-4 mb-1">
                <span className="text-truncate">{curr.hostname}</span>
                {curr.partition && <span className="font-italic">(assigned)</span>}
              </div>
              <div className="d-flex justify-content-between align-items-center w-100 mr-4">
                <input type="text"
                       readOnly={!isEditing}
                       className={inputsClassName}
                       style={{ maxWidth: '150px' }}
                       value={isEditing ? login : curr.login}
                       onChange={({ target: { value } }) => setLogin(value)}
                />
                <input type={isEditing ? 'text' : 'password'}
                       readOnly={!isEditing}
                       className={inputsClassName + ' mx-3'}
                       style={{ maxWidth: '150px' }}
                       value={isEditing ? password : curr.password}
                       onChange={({ target: { value } }) => setPassword(value)}
                />
                <div className="d-inline-flex">
                  <Tooltip title={isEditing ? 'Save' : 'Edit'}>
                    <IconButton color="primary" onClick={() => handleSaveEditClick({ isEditing, item: curr })}>
                      {isEditing ? <Done fontSize="small"/> : <Edit fontSize="small"/>}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={isEditing ? 'Cancel' : 'Delete'}>
                    <IconButton onClick={() => handleRemoveClick({ isEditing, id: curr._id })}>
                      {isEditing ? <Close fontSize="small"/> : <Delete fontSize="small"/>}
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </DialogWrapper>
  );
}
