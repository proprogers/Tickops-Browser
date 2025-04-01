import { useStore as useSessionsBoardStore } from './sessions-board-store';
import TextField from '@mui/material/TextField';

export default function Filter() {
  const {
    filterValue,
    setFilterValue,
  } = useSessionsBoardStore([
    'filterValue',
    'setFilterValue',
  ]);

  return (
    <TextField type="search"
               label="Filter..."
               variant="outlined"
               size="small"
               value={filterValue}
               onChange={(e) => setFilterValue(e.target.value)}
    />
  );
}
