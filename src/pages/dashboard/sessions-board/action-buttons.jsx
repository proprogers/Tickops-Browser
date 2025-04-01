/* global window */
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { green } from '@mui/material/colors';
import Launch from '@mui/icons-material/Launch';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';

export default function ActionButtons(props) {
  const { partition } = props;

  const isLaunchSessionButtonDisabled = window.currentSessionData && window.currentSessionData.partition === partition;

  const handleLaunchSessionClick = (e) => {
    e.stopPropagation();
    window.loadSession(partition);
  };

  const handleEditSessionClick = (e) => {
    e.stopPropagation();
    window.openEditSessionDialog(props);
  };

  const handleDeleteSessionClick = (e) => {
    e.stopPropagation();
    window.openConfirmDeleteSessionsDialog({ session: props });
  };

  return (
    <div className="d-inline-flex">
      <Tooltip title="Launch session">
        <span>
          <IconButton sx={{ color: green[500] }}
                      disabled={isLaunchSessionButtonDisabled}
                      onClick={handleLaunchSessionClick}
          >
            <Launch/>
          </IconButton>
        </span>
      </Tooltip>

      
      
      <Tooltip title="Edit session">
        <IconButton color="primary" onClick={handleEditSessionClick}>
          <Edit/>
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete session">
        <IconButton onClick={handleDeleteSessionClick}>
          <Delete/>
        </IconButton>
      </Tooltip>
    </div>
  );
}
