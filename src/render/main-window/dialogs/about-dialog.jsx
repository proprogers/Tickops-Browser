import DialogWrapper from './dialog-wrapper.jsx';
import { useStore as useMainWindowStore } from '../main-window-store';
import { useStore as useDialogsStateStore } from './dialogs-state-store';

export default function AboutDialog() {
  const {
    isAboutDialogOpened,
    setIsAboutDialogOpened,
  } = useDialogsStateStore([
    'isAboutDialogOpened',
    'setIsAboutDialogOpened',
  ]);

  const {
    appVersion
  } = useMainWindowStore([
    'appVersion'
  ]);

  return (
    <DialogWrapper opened={isAboutDialogOpened} close={() => setIsAboutDialogOpened(false)} style={{ minHeight: '0' }}>
      <div className="text-center">
        <h1 className="h5 text-gray-900 mb-4">
          Browser version:
        </h1>
        {appVersion}
      </div>
    </DialogWrapper>
  );
}
