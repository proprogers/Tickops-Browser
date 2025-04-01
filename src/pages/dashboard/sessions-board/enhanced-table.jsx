/* global window */
import { useState } from 'react';
import { useStore as useSessionsBoardStore } from './sessions-board-store';
import EnhancedTableHead from './enhanced-table-head.jsx';
import ActionButtons from './action-buttons.jsx';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';

export default function EnhancedTable({ rows }) {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');

  const {
    page,
    checkedSessions,
    setCheckedSessions,
    rowsPerPage,
  } = useSessionsBoardStore([
    'page',
    'checkedSessions',
    'setCheckedSessions',
    'rowsPerPage',
  ]);

  const tableCellsStyle = {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    paddingRight: 0
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const isSelected = (partition) => checkedSessions.indexOf(partition) !== -1;

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const toggleAllCheckboxes = ({ target: { checked } }) => {
    if (checked) {
      const newSelecteds = rows.map(({ partition }) => partition);
      setCheckedSessions(newSelecteds);
      return;
    }
    setCheckedSessions([]);
  };

  const handleClick = (partition) => {
    const selectedIndex = checkedSessions.indexOf(partition);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(checkedSessions, partition);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(checkedSessions.slice(1));
    } else if (selectedIndex === checkedSessions.length - 1) {
      newSelected = newSelected.concat(checkedSessions.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        checkedSessions.slice(0, selectedIndex),
        checkedSessions.slice(selectedIndex + 1),
      );
    }

    setCheckedSessions(newSelected);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  return (
    <TableContainer>
      <Table size="small" style={{ tableLayout: 'fixed' }}>
        <EnhancedTableHead numSelected={checkedSessions.length}
                           order={order}
                           orderBy={orderBy}
                           onSelectAllClick={toggleAllCheckboxes}
                           onRequestSort={handleRequestSort}
                           rowCount={rows.length}
        />
        <TableBody>
          {(orderBy ? rows.slice().sort(getComparator(order, orderBy)) : rows)
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row) => {
              const isItemSelected = isSelected(row.partition);

              const isCurrentSession = window.currentSessionData && window.currentSessionData.partition === row.partition;

              return (
                <TableRow hover
                          onClick={() => handleClick(row.partition)}
                          role="checkbox"
                          tabIndex={-1}
                          key={row.partition}
                          aria-checked={isItemSelected}
                          selected={isItemSelected}
                >
                  <TableCell>
                    <Checkbox size="small" color="primary" checked={isItemSelected}/>
                  </TableCell>
                  <Tooltip title={row.name}>
                    <TableCell padding="none" style={tableCellsStyle}>
                      {row.name} {isCurrentSession ? '(current)' : ''}
                    </TableCell>
                  </Tooltip>
                  <Tooltip title={row.email}>
                    <TableCell style={tableCellsStyle}>
                      {row.email}
                    </TableCell>
                  </Tooltip>
                  <TableCell align="right" style={tableCellsStyle}>
                    {row.location}
                  </TableCell>
                  <TableCell align="right">
                    <ActionButtons name={row.name}
                                   email={row.email}
                                   tel={row.tel}
                                   partition={row.partition}
                                   paymentDataId={row.paymentDataId}
                                   proxy={row.proxy}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={5}/>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
