CaptchaProcessors['register']({'captchaType':'geetest_v4','canBeProcessed':function(a,b){if(!b['enabledForGeetest_v4'])return![];return!![];},'attachButton':function(a,b,c){let d=this['getHelper'](a);if(d['find']('.captcha-solver')['length']!==0x0){return;}c['css']({'width':d['outerWidth']()+'px'});c[0x0]['dataset']['disposable']=!![];d['append'](c);},'clickButton':function(a,b,c){if(b['autoSolveGeetest_v4'])c['click']();},'getName':function(){return'GeeTest\x20V4';},'getParams':function(a,b){return{'method':'geetest_v4','url':location['href'],'captchaId':a['captchaId']};},'getParamsV2':function(a,b){let c={'type':'GeeTestTaskProxyless','websiteURL':location['href'],'initParameters':{'captcha_id':a['captchaId']},'version':0x4};if(a['apiServer']){c['geetestApiServerSubdomain']=a['apiServer'];}return c;},'onSolved':function(a,b){let c=this['getHelper'](a);c['find']('input[name=captcha_id]')['val'](b['captcha_id']);c['find']('input[name=lot_number]')['val'](b['lot_number']);c['find']('input[name=pass_token]')['val'](b['pass_token']);c['find']('input[name=gen_time]')['val'](b['gen_time']);c['find']('input[name=captcha_output]')['val'](b['captcha_output']);let d=document['createElement']('script');d['src']=chrome['runtime']['getURL']('content/captcha/geetest_v4/validate.js');document['body']['append'](d);},'getForm':function(a){return this['getHelper'](a)['closest']('form');},'getCallback':function(a){return null;},'getHelper':function(a){let b=$('.geetest_captcha');let c=b['find']('.twcpt-geetest_v4-helper');if(!c['length']){c=$('\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22twcpt-geetest_v4-helper\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=\x22hidden\x22\x20name=\x22captcha_id\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=\x22hidden\x22\x20name=\x22lot_number\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=\x22hidden\x22\x20name=\x22pass_token\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=\x22hidden\x22\x20name=\x22gen_time\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<input\x20type=\x22hidden\x22\x20name=\x22captcha_output\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20')['appendTo'](b);}return c;}});