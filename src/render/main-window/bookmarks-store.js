import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';
import { BOOKMARKS_KEY } from '@/common/consts';
import Settings from '@/common/settings';

const store = create((set, get) => ({
  bookmarksMap: new Map(),
  addBookmark: async (v) => {
    const { bookmarksMap } = get();
    bookmarksMap.set(v.url, v.name);
    const bookmarks = [...bookmarksMap];
    await Settings.set(BOOKMARKS_KEY, bookmarks.map(([url, name]) => ({ url, name })));
    set(() => ({ bookmarksMap: new Map(bookmarks) }))
  },
  removeBookmark: async (url) => {
    const { bookmarksMap } = get();
    bookmarksMap.delete(url);
    const bookmarks = [...bookmarksMap];
    await Settings.set(BOOKMARKS_KEY, bookmarks.map(([url, name]) => ({ url, name })));
    set(() => ({ bookmarksMap: new Map(bookmarks) }))
  },
  initBookmarks: async () => {
    const array = await Settings.get(BOOKMARKS_KEY) || [];
    set(() => ({ bookmarksMap: new Map(array.map(({ url, name }) => [url, name])) }))
  },

  isBookmarked: false,
  setIsBookmarked: (v) => set(() => ({ isBookmarked: v })),

  isAddBookmarkDialogOpened: false,
  setIsAddBookmarkDialogOpened: (v) => set(() => ({ isAddBookmarkDialogOpened: v })),

  bookmarksPopupAnchorEl: null,
  setBookmarksPopupAnchorEl: (v) => set(() => ({ bookmarksPopupAnchorEl: v })),

  bookmarksMenuAnchorEl: null,
  setBookmarksMenuAnchorEl: (v) => set(() => ({ bookmarksMenuAnchorEl: v })),

  bookmarksPopupParams: { name: null, url: null, edit: false },
  setBookmarksPopupParams: (v) => set(() => ({ bookmarksPopupParams: v })),
}));

const useStore = getUseStore(store);
const { getState, setState, subscribe, destroy } = store;

const currentStoreState = getState();

export { useStore, getState, setState, subscribe, destroy };
