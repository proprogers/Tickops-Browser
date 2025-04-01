const {Menu, MenuItem, BrowserWindow, ipcMain} = require('electron');
const os = require('os');
const {isDev} = require('@/../config');
const {messages: {TAB_CONTEXT_MENU, WEBVIEW_CONTEXT_MENU, ADDRESS_BAR_CONTEXT_MENU}} = require('@/common/consts');
const isMac = process.platform === 'darwin';
const {Settings} = require('../common/settings/Settings');
class AppMenu {
    constructor(webContents, isAdmin) {
        this._webContents = webContents;
        this._browserWindow = BrowserWindow.fromWebContents(webContents);
        if (os.platform() === 'win32') {
            this._setApplicationMenu();
        }

        if (isMac) {
            this._setApplicationMenuMac();
        }

        ipcMain.removeHandler('open-tab-context-menu');
        ipcMain.removeHandler('open-address-bar-context-menu');
        ipcMain.removeHandler('open-webview-context-menu');

        this._setTabContextMenu();
        this._setAddressBarContextMenu();
        this._setWebviewContextMenu();
        this._isAdmin = isAdmin;
    }

    _setApplicationMenuMac() {
        const template = [
            ...(isMac ? [{
                label: 'TickOps',
                submenu: [
                    {
                        label: 'Clear application cache and restart',
                        click: () => this._webContents.send(TAB_CONTEXT_MENU, 'clear-cache')
                    },
                    {role: 'about'},
                    {type: 'separator'},
                    {role: 'services'},
                    {type: 'separator'},
                    {role: 'hide'},
                    {role: 'hideOthers'},
                    {role: 'unhide'},
                    {type: 'separator'},
                    {role: 'quit'}
                ]
            }] : []),
            {
                label: 'File',
                submenu: [
                    {
                        label: 'New Window',
                        accelerator: 'CmdOrCtrl+N',
                        click: () => this._webContents.send(TAB_CONTEXT_MENU, 'create-window'),

                    }, {
                        label: 'New Tab',
                        accelerator: 'CmdOrCtrl+T',
                        click: () => this._webContents.send(TAB_CONTEXT_MENU, 'create'),
                    }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    {role: 'undo'},
                    {role: 'redo'},
                    {type: 'separator'},
                    {role: 'cut'},
                    {role: 'copy'},
                    {role: 'paste'},
                    ...(isMac ? [
                        {role: 'pasteAndMatchStyle'},
                        {role: 'delete'},
                        {role: 'selectAll'},
                        {type: 'separator'},
                        {
                            label: 'Speech',
                            submenu: [
                                {role: 'startSpeaking'},
                                {role: 'stopSpeaking'}
                            ]
                        }
                    ] : [
                        {role: 'delete'},
                        {type: 'separator'},
                        {role: 'selectAll'}
                    ])
                ]
            },
            {
                label: 'View',
                submenu: [
                    {
                        label: 'Reload',
                        accelerator: 'CmdOrCtrl+R',
                        click: () => this._webContents.send(TAB_CONTEXT_MENU, 'reload'),
                    },
                    {role: 'forceReload'},
                    {role: 'toggleDevTools'},
                    {type: 'separator'},
                    {role: 'resetZoom'},
                    {role: 'zoomIn'},
                    {role: 'zoomOut'},
                    {type: 'separator'},
                    {role: 'togglefullscreen'}
                ]
            },
            {
                label: 'Tab',
                submenu: [
                    {
                        label: 'Select next tab',
                        accelerator: 'Cmd+Option+Right',
                        click: () => this._webContents.send(TAB_CONTEXT_MENU, 'select-next-tab'),
                    }, {
                        label: 'Select tabs',
                        accelerator: 'Control+Tab',
                        click: () => this._webContents.send(TAB_CONTEXT_MENU, 'select-next-tab'),
                    }, {
                        label: 'Select previous tab',
                        accelerator: 'Control+Shift+Tab',
                        click: () => this._webContents.send(TAB_CONTEXT_MENU, 'select-previous-tab'),
                    }
                ]
            },
            {
                label: 'Window',
                submenu: [
                    {role: 'minimize'},
                    {role: 'zoom'},
                    ...(isMac ? [
                        {type: 'separator'},
                        {role: 'front'},
                        {type: 'separator'},
                        {role: 'window'}
                    ] : [
                        {role: 'close'}
                    ])
                ]
            }
        ]

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

    _setApplicationMenu() {
        const items = [{
            label: 'New Window',
            accelerator: 'CmdOrCtrl+N',
            click: () => this._webContents.send(TAB_CONTEXT_MENU, 'create-window'),
        }, {
            label: 'New Tab',
            accelerator: 'CmdOrCtrl+T',
            click: () => this._webContents.send(TAB_CONTEXT_MENU, 'create'),
        }, {
            label: 'Close Tab',
            accelerator: 'CmdOrCtrl+W',
            click: () => this._webContents.send(TAB_CONTEXT_MENU, 'close'),
        }, {
            label: 'Enter Address',
            accelerator: 'F6',
            click: () => this._webContents.send('focus-input')
        }, {
            label: 'Reload Page',
            accelerator: 'F5',
            click: () => this._webContents.send(TAB_CONTEXT_MENU, 'reload'),
        }, {
            label: 'Reload Page',
            accelerator: 'CmdOrCtrl+R',
            click: () => this._webContents.send(TAB_CONTEXT_MENU, 'reload'),
        }, {
            label: 'Reload Page Ignoring Cache',
            accelerator: 'CmdOrCtrl+F5',
            click: () => this._webContents.send('reload-page', false)
        }, {
            label: 'Reload Page Ignoring Cache',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => this._webContents.send('reload-page', false)
        }, {
            label: 'Select next tab',
            accelerator: 'Control+Tab',
            click: () => this._webContents.send(TAB_CONTEXT_MENU, 'select-next-tab'),
        }, {
            label: 'Select previous tab',
            accelerator: 'ControlOrCtrl+Shift+Tab',
            click: () => this._webContents.send(TAB_CONTEXT_MENU, 'select-previous-tab'),
        }, {
            label: 'Go Back',
            accelerator: 'Alt+Left',
            click: () => this._webContents.send('go-back')
        }, {
            label: 'Go Forward',
            accelerator: 'Alt+Right',
            click: () => this._webContents.send('go-forward')
        }, {
            label: 'Inspect Element',
            accelerator: 'CmdOrCtrl+Shift+I',
            click: () => this._webContents.send('inspect-element')
        }, {
            label: 'Open Developer Tools',
            accelerator: 'F12',
            click: () => {
                if (isDev || process.env.IS_BETA || this._isAdmin) {
                    this._webContents.isDevToolsOpened()
                        ? this._webContents.closeDevTools()
                        : this._webContents.openDevTools();
                } else {
                    this._webContents.send('inspect-element');
                }
            }
        }, {
            label: 'Page Search',
            accelerator: 'CmdOrCtrl+F',
            click: () => this._webContents.send('page-search')
        }, {
            role: 'zoomin',
            accelerator: 'CmdOrCtrl+='
        }
            , {
                role: 'zoomout'
            }];

        const menu = new Menu();
        items.forEach(item => {
            menu.append(new MenuItem(item))
        });
        Menu.setApplicationMenu(menu);
    }

    _setTabContextMenu() {
        const items = [{
            label: 'New tab',
            accelerator: 'Ctrl + T',
            click: () => this._webContents.send(TAB_CONTEXT_MENU, 'create'),
        }, {
            label: 'Duplicate',
            click: () => this._webContents.send(TAB_CONTEXT_MENU, 'duplicate'),
        }, {
            type: 'separator',
        }, {
            label: 'Close',
            accelerator: 'Ctrl + W',
            click: () => this._webContents.send(TAB_CONTEXT_MENU, 'close'),
        }, {
            label: 'Close other tabs',
            click: () => this._webContents.send(TAB_CONTEXT_MENU, 'close-other'),
        }];

        const menu = new Menu();
        items.forEach(item => {
            menu.append(new MenuItem(item));
        });
        ipcMain.handle('open-tab-context-menu', () => {
            menu.popup(this._browserWindow);
        });
    }

    _setAddressBarContextMenu() {
        const items = [{
            label: 'Copy',
            accelerator: 'Ctrl + C',
            click: () => this._webContents.send(ADDRESS_BAR_CONTEXT_MENU, 'copy'),
        }, {
            label: 'Cut',
            accelerator: 'Ctrl + X',
            click: () => this._webContents.send(ADDRESS_BAR_CONTEXT_MENU, 'cut'),
        }, {
            label: 'Paste',
            accelerator: 'Ctrl + V',
            click: () => this._webContents.send(ADDRESS_BAR_CONTEXT_MENU, 'paste'),
        }];

        const menu = new Menu();
        items.forEach((item) => {
            menu.append(new MenuItem(item))
        });
        ipcMain.handle('open-address-bar-context-menu', () => {
            menu.popup(this._browserWindow);
        });
    }

    _setWebviewContextMenu() {
        const items = [{
            id: 'links-0',
            label: 'Open link in new tab',
            click: () => this._webContents.send(WEBVIEW_CONTEXT_MENU, 'open-link-new-tab'),
        }, {
            id: 'links-1',
            label: 'Start multiple sessions',
            click: () => this._webContents.send(WEBVIEW_CONTEXT_MENU, 'sessions'),
        }, {
            id: 'links-2',
            label: 'Copy link address',
            click: () => this._webContents.send(WEBVIEW_CONTEXT_MENU, 'copy-link'),
        }, {
            id: 'images-0',
            label: 'Copy Image URL',
            click: () => this._webContents.send(WEBVIEW_CONTEXT_MENU, 'copy-image-url'),
        }, {
            id: 'images-1',
            label: 'Open Image in New Tab',
            click: () => this._webContents.send(WEBVIEW_CONTEXT_MENU, 'open-image'),
        }, {
            id: 'iframes-0',
            label: 'Reload Frame',
            click: () => this._webContents.send(WEBVIEW_CONTEXT_MENU, 'reload-iframe'),
        }, {
            id: 'copy',
            label: 'Copy',
            accelerator: 'Ctrl + C',
            click: () => this._webContents.send(WEBVIEW_CONTEXT_MENU, 'copy'),
        }, {
            id: 'separator',
            type: 'separator'
        }, {
            id: 'inspect',
            label: 'Inspect',
            accelerator: 'Ctrl + Shift + I',
            click: () => this._webContents.send(WEBVIEW_CONTEXT_MENU, 'inspect'),
        }];

        const menu = new Menu();
        items.forEach((item) => {
            menu.append(new MenuItem(item));
        });

        ipcMain.handle('open-webview-context-menu', (event, {href, img, iframe, hasSelection}) => {
            menu.items.forEach(item => {

                if (item.id.startsWith('links')) {
                    item.visible = !!href;
                }
                if (item.id.startsWith('images')) {
                    item.visible = !!img;
                }
                if (item.id.startsWith('iframes')) {
                    item.visible = !!iframe;
                }
                if (item.id.startsWith('links')) {
                    item.visible = !!href;
                }
            });
            menu.getMenuItemById('copy').enabled = hasSelection;
            menu.getMenuItemById('separator').visible = !!(hasSelection || img || href || iframe);
            menu.popup(this._browserWindow);
        });
    }
}

module.exports = AppMenu;
