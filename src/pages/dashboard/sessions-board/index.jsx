/* global window */
import { useEffect } from 'react';
import { useStore as useSessionsBoardStore } from './sessions-board-store';
import { useStore as useUserStore } from '@/common/components/user-store';
import { SESSIONS_KEY,PREFERENCES_KEY,PROXY_PORTAL_DATA_KEY, messages } from '@/common/consts';
import EnhancedTableToolbar from './enhanced-table-toolbar.jsx';
import EnhancedTable from './enhanced-table.jsx';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';

export default function SessionsBoard() {
  const {
    sessions,
    setSessions,
    setSessionsPortal,
  } = useUserStore([
    'sessions',
    'setSessions',
    'setSessionsPortal',
  ]);

 
  const {
    filterValue,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
  } = useSessionsBoardStore([
    'filterValue',
    'page',
    'setPage',
    'rowsPerPage',
    'setRowsPerPage',
  ]);

  const rows = sessions.reduce((filtered, { credentials: { name, email, tel }, partition, proxy, paymentDataId }) => {
    if (!filterValue || [name, email, tel, proxy.info].join('').toLowerCase().includes(filterValue.toLowerCase())) {
      filtered.push({ name, email, tel, partition, location: proxy.info, paymentDataId, proxy });
    }
    return filtered;
  }, []);

  const needToShowFirstLastPageButtons = rows.length > rowsPerPage * 2;

  useEffect(() => {
   
    window.Settings.get(SESSIONS_KEY).then(setSessions);
    window.Settings.get(SESSIONS_KEY).then(setSessions);
    // window.Settings.get(PROXY_PORTAL_DATA_KEY).then(setSessionsPortal);

    window.Settings.on(messages.SETTINGS_SET, (key, value) => {
      if (key === SESSIONS_KEY) setSessions(value);
      

    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box className="col-xl-8" sx={{ width: '100%', minWidth: '710px' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar/>
        {!!sessions.length && <EnhancedTable rows={rows}/>}
        <TablePagination rowsPerPageOptions={[5, 10, 25]}
                         id="temp-table-pagination-id"
                         component="div"
                         count={rows.length}
                         rowsPerPage={rowsPerPage}
                         page={page}
                         onPageChange={handleChangePage}
                         onRowsPerPageChange={handleChangeRowsPerPage}
                         showFirstButton={needToShowFirstLastPageButtons}
                         showLastButton={needToShowFirstLastPageButtons}
        />
      </Paper>
    </Box>
  );
}
