/* global window */
import { useStore as useUserStore } from '@/common/components/user-store';
import { useStore as useSessionsBoardStore } from './sessions-board-store';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import PeopleAlt from '@mui/icons-material/PeopleAlt';
import PersonAdd from '@mui/icons-material/PersonAdd';

export default function ToolbarButtons() {
  const {
    sessions,
    savedSessionsLimit,
  } = useUserStore([
    'sessions',
    'savedSessionsLimit',
  ]);

  const {
    setCheckedSessions,
  } = useSessionsBoardStore([
    'setCheckedSessions',
  ]);

  const buttonsStyle = {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  };

  const handleStartMultipleSessionsClick = () => {
    window.openLinkOpeningDialog();
    setCheckedSessions([]);
  };

  const handleAddNewSessionClick = () => {
    if (savedSessionsLimit && sessions.length >= savedSessionsLimit) {
      window.showNotification({ message: 'Session limit had been exceeded', type: 'error' });
      return;
    }
    window.openAddSessionDialog();
  };

  return (
    <Stack spacing={1} direction="row" justifyContent="flex-end" style={{ paddingRight: '8px' }}>
      <Button variant="contained"
              size="small"
              startIcon={<PeopleAlt/>}
              onClick={handleStartMultipleSessionsClick}
              style={buttonsStyle}
      >
        Start Multiple
      </Button>
      <Button variant="contained"
              size="small"
              startIcon={<PersonAdd/>}
              onClick={handleAddNewSessionClick}
              style={buttonsStyle}
      >
        Add New
      </Button>
    </Stack>
  );
}
