import { useEffect } from 'react';
import { useStore as useBookmarksStore } from './bookmarks-store';
import { getState as getPagesStoreState } from './pages-store';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Add from '@mui/icons-material/Add';
import Close from '@mui/icons-material/Close';

const { catchLoadingUrlError } = getPagesStoreState();

export default function BookmarksMenu(props) {
  const {
    bookmarksMap,
    removeBookmark,
    initBookmarks,
    bookmarksMenuAnchorEl,
    setBookmarksMenuAnchorEl,
    setIsAddBookmarkDialogOpened,
  } = useBookmarksStore([
    'bookmarksMap',
    'removeBookmark',
    'initBookmarks',
    'bookmarksMenuAnchorEl',
    'setBookmarksMenuAnchorEl',
    'setIsAddBookmarkDialogOpened',
  ]);

  const bookmarks = [...bookmarksMap].map(([url, name]) => ({ url, name }));

  useEffect(() => {
    initBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => setBookmarksMenuAnchorEl(null);

  const handleBookmarkClick = async (url) => {
    close();
    props.close();
    if (!props.page || !props.page.webview) return;
    props.page.webview.stop();
    try {
      await props.page.webview.loadURL(url);
    } catch (e) {
      catchLoadingUrlError(e);
    }
  };

  const handleAddBookmarkClick = () => {
    close();
    props.close();
    setIsAddBookmarkDialogOpened(true);
  };

  const handleRemoveBookmarkClick = async (url) => {
    await removeBookmark(url);
    close();
  };

  return (
    <Menu anchorEl={bookmarksMenuAnchorEl}
          open={!!bookmarksMenuAnchorEl}
          onClose={close}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          style={{ maxHeight: '75%' }}
    >
      <MenuItem key="add-bookmark" onClick={handleAddBookmarkClick} divider={!!bookmarks.length}>
        <Add fontSize="small" color="action" className="mr-2 my-1"/>
        <ListItemText> Add bookmark </ListItemText>
      </MenuItem>
      {bookmarks.map(({ url, name }, i) => {
        return (
          <MenuItem key={i} className="pr-2">
            <ListItemText className="mr-2" onClick={() => handleBookmarkClick(url)}>
              <div className="text-truncate" style={{ maxWidth: '350px', width: 'fit-content' }}>
                {name}
              </div>
            </ListItemText>
            <IconButton title="Remove bookmark" size="small" onClick={() => handleRemoveBookmarkClick(url)}>
              <Close fontSize="inherit"/>
            </IconButton>
          </MenuItem>
        );
      })}
    </Menu>
  );
}
