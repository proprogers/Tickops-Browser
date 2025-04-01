require('dotenv').config();
const { notarize } = require('@electron/notarize');


exports.default = async function notarizing(context) {
  const {electronPlatformName, appOutDir} = context;  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: 'com.tickops.browser',
    appPath: 'dist/mac-universal/TickOps Beta Browser.app',
    appleId: 'rs@tickops.com',
    appleIdPassword: 'jsho-wbmg-dhrj-vcki',
    teamId: 'P3U8V64W42'
  });
};

