import { useEffect } from 'react';
import { useStore as usePreferencesStore } from './preferences-store';
import DialogWrapper from './dialog-wrapper.jsx';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';

export default function PreferencesDialog() {
  const {
    isPreferencesDialogOpened,
    setIsPreferencesDialogOpened,
    checkedSet,
    leftBar,
    userProxy,
    handleToggle,
    initPreferences,
  } = usePreferencesStore([
    'isPreferencesDialogOpened',
    'setIsPreferencesDialogOpened',
    'checkedSet',
    'leftBar',
    'userProxy',
    'handleToggle',
    'initPreferences',
  ]);

  useEffect(() => {
    initPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => setIsPreferencesDialogOpened(false);

  return (
    <DialogWrapper opened={isPreferencesDialogOpened} close={close}>
      <div className="text-center">
        <h5 className="h5 text-gray-900 mb-3">
          Preferences
        </h5>
      </div>
      <List>
        <ListItem>
          <Switch onChange={handleToggle('suggestToSaveCredentials')}
                  checked={checkedSet.has('suggestToSaveCredentials')}
          />
          <ListItemText primary="Suggest to save/update passwords"/>
        </ListItem>
        <ListItem>
          <Switch onChange={handleToggle('userProxy')}
                  checked={checkedSet.has('userProxy')}
          />
          <ListItemText primary="User proxy"/>
        </ListItem>
        <ListItem>
          <Switch onChange={handleToggle('tabRedefine')}
                  checked={checkedSet.has('tabRedefine')}
          />
          <ListItemText primary="Redefine tab position"/>
        </ListItem>
        <ListItem>
          <Switch onChange={handleToggle('recap')}
                  checked={checkedSet.has('recap')}
          />
          <ListItemText primary="2recapcha integration"/>
        </ListItem>

      </List>
    </DialogWrapper>
  );
}
