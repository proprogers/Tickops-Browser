((()=>{setInterval(function(){let b=document['getElementById']('div_for_keycaptcha');if(!b)return;if(isCaptchaWidgetRegistered('keycaptcha',0x0))return;let c=a(b);registerCaptchaWidget(c);},0x7d0);let a=function(b){let c={'captchaType':'keycaptcha','widgetId':0x0,'containerId':b['id']};let d=document['querySelectorAll']('script');for(let e=0x0;e<d['length'];e++){let f=d[e]['textContent'];if(f['indexOf']('s_s_c_user_id')!==-0x1){eval(f);c['userId']=s_s_c_user_id;c['sessionId']=s_s_c_session_id;c['webServerSign']=s_s_c_web_server_sign;c['webServerSign2']=s_s_c_web_server_sign2;c['captchaFieldId']=s_s_c_captcha_field_id;c['submitButtonId']=s_s_c_submit_button_id;break;}}return c;};})());