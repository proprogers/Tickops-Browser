/* global window */
import { useStore as useSessionsBoardStore } from './sessions-board-store';
import { useStore as useUserStore } from '@/common/components/user-store';
import Toolbar from '@mui/material/Toolbar';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { green } from '@mui/material/colors';
import Launch from '@mui/icons-material/Launch';
import Delete from '@mui/icons-material/Delete';
import FilterList from '@mui/icons-material/FilterList';
import ToolbarButtons from './toolbar-buttons.jsx';
import Filter from './filter.jsx';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';

export default function EnhancedTableToolbar() {
  const {
    sessions,
    savedSessionsLimit,
  } = useUserStore([ // TODO: maybe move to the sessions-board-store
    'sessions',
    'savedSessionsLimit',
  ]);

  const {
    isFilterOpened,
    handleFilterButtonClick,
    checkedSessions,
    setCheckedSessions,
  } = useSessionsBoardStore([
    'isFilterOpened',
    'handleFilterButtonClick',
    'checkedSessions',
    'setCheckedSessions',
  ]);

  const numSelected = checkedSessions.length;

  const generalText = `Saved Sessions (Using ${sessions.length} of ${savedSessionsLimit})`;
  const selectedText = `${numSelected} selected`;

  const getCheckedSessionsMap = () => new Map(checkedSessions.map((partition) => [partition, 1]));

  const handleLaunchSessions = () => {
    window.openLinkOpeningDialog({
      checkedSessionsMap: getCheckedSessionsMap()
    });
    setCheckedSessions([]);
  };

  const handleDeleteSessions = () => {
    window.openConfirmDeleteSessionsDialog({
      checkedSessionsMap: getCheckedSessionsMap()
    });
    setCheckedSessions([]);
  };

  const toolbarSx = {
    justifyContent: 'space-between',
    pl: { sm: 1.8 },
    pr: { xs: 3, sm: 1.25 },
    ...(numSelected > 0 && {
      bgcolor: (theme) =>
        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
    }),
  };

  const toolbarTypographySx = {
    fontWeight: 'bold',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  };

  return (
    <Toolbar sx={toolbarSx}>
      <Stack spacing={2} direction="row" justifyContent="flex-start" alignItems="center">
        <Tooltip title="Filter sessions">
          <IconButton onClick={handleFilterButtonClick}>
            <FilterList/>
          </IconButton>
        </Tooltip>
        {isFilterOpened
          ? <Filter/>
          : <Typography sx={toolbarTypographySx} variant={numSelected > 0 ? 'subtitle1' : 'h7'}>
            {numSelected > 0 ? selectedText : generalText}
          </Typography>}
      </Stack>

      
      {/* <Switch checked={true}/> */}
          {/* onChange={handleToggle('tabRedefine')}  */}

      {numSelected > 0
        ? (<div className="d-inline-flex">

          
            <Tooltip title="Launch sessions">
              <IconButton sx={{ color: green[500] }} onClick={handleLaunchSessions}>
                <Launch/>
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete sessions">
              <IconButton onClick={handleDeleteSessions}>
                <Delete/>
              </IconButton>
            </Tooltip>
          </div>
        ) : <ToolbarButtons/>}
    </Toolbar>
  );
}
