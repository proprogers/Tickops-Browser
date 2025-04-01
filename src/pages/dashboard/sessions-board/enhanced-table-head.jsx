import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import TableSortLabel from '@mui/material/TableSortLabel';
import Box from '@mui/material/Box';
import { visuallyHidden } from '@mui/utils';

export default function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;

  const headCells = [
    {
      id: 'name',
      label: 'Session Name',
      align: 'left'
    },
    {
      id: 'email',
      label: 'TM Email',
      align: 'left'
    },
    {
      id: 'location',
      label: 'Location',
      align: 'right'
    },
  ];

  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ width: '10%' }}>
          <Checkbox color="primary"
                    size="small"
                    indeterminate={numSelected > 0 && numSelected < rowCount}
                    checked={rowCount > 0 && numSelected === rowCount}
                    onChange={onSelectAllClick}
          />
        </TableCell>
        {headCells.map(({ id, label, align }, index) => (
          <TableCell key={id}
                     padding={index === 0 ? 'none' : 'normal'}
                     sortDirection={orderBy === id ? order : false}
                     align={align}
          >
            <TableSortLabel active={orderBy === id}
                            direction={orderBy === id ? order : 'asc'}
                            onClick={() => onRequestSort(id)}
            >
              {label}
              {orderBy === id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell key="actions" align="center" style={{ width: '20%' }}>
          Actions
        </TableCell>
      </TableRow>
    </TableHead>
  );
}
