import { useEffect, useState } from 'react';
import { useStore as useBookmarksStore } from '../bookmarks-store';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';

export default function BookmarksPopup() {
  const [name, setName] = useState('');

  const {
    bookmarksPopupAnchorEl,
    setBookmarksPopupAnchorEl,
    bookmarksPopupParams,
    addBookmark,
  } = useBookmarksStore([
    'bookmarksPopupAnchorEl',
    'setBookmarksPopupAnchorEl',
    'bookmarksPopupParams',
    'addBookmark',
  ]);

  useEffect(() => {
    setName(bookmarksPopupAnchorEl && bookmarksPopupParams.name || '');
  }, [bookmarksPopupAnchorEl, bookmarksPopupParams.name]);

  const close = () => {
    setBookmarksPopupAnchorEl(null);
  };

  const onSave = async () => {
    await addBookmark({ name, url: bookmarksPopupParams.url });
    close();
  };

  return (
    <Popover anchorEl={bookmarksPopupAnchorEl}
             open={!!bookmarksPopupAnchorEl}
             onClose={close}
             anchorOrigin={{
               vertical: 'bottom',
               horizontal: 'right',
             }}
             transformOrigin={{
               vertical: 'top',
               horizontal: 'right',
             }}
    >
      <Card sx={{ width: 275 }}>
        <CardContent>
          <Typography variant="body1">
            Save bookmark
          </Typography>
          <TextField fullWidth
                     size="small"
                     variant="standard"
                     value={name}
                     onChange={({ target: { value } }) => setName(value)}
                     type="text"
                     margin="dense"
                     label="Name"
          />
        </CardContent>
        <CardActions sx={{ float: 'right', padding: '0 12px 12px 0' }}>
          <Button type="button" variant="text" size="small" onClick={close}>
            Cancel
          </Button>
          <Button type="button" variant="text" size="small" onClick={onSave}>
            {bookmarksPopupParams.edit ? 'Update' : 'Save'}
          </Button>
        </CardActions>
      </Card>
    </Popover>
  );
}
