export const injectChromeWebstoreInstallButton = () => {

    const baseUrl = 'https://clients2.google.com/service/update2/crx?response=redirect&acceptformat=crx2,crx3&prodversion=%VERSION&x=id%3D%ID%26installsource%3Dondemand%26uc';
    const ibText = 'Add to TickOps';
    const ibTemplate = '<div role="button" class="UywwFc-LgbsSe UywwFc-LgbsSe-OWXEXe-dgl2Hf" aria-label="' +
        ibText +
        '" tabindex="0" style="user-select: none;"><div class="g-c-Hf"><div class="g-c-x"><div class="g-c-R  webstore-test-button-label">' +
        ibText +
        '</div></div></div></div>';

    // installPlugin(id);

    function waitForCreation(selector, callback) {
        const element = document.getElementsByClassName(selector);
        console.log(element);
        if (element != null) {
            
            callback(element);
        }
        else {
            setInterval(() => {
                waitForCreation(selector, callback);
            }, 50);
        }
    }

    waitForCreation('gSrP5d', (element) => {
        
        
        
        
        // installPlugin();
            setInterval(() => {

                const elements = document.getElementsByClassName('gSrP5d')[0];
                elements.style.display = 'none';

                const button = document.getElementsByClassName('UywwFc-vQzf8d')[0];
                console.log(button);
                button.textContent = "Add to Tickops";
                document.getElementsByClassName('UywwFc-LgbsSe UywwFc-LgbsSe-OWXEXe-dgl2Hf')[0].disabled = false;
                InstallButton();
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                
                // const elements = document.getElementsByClassName(element);
                // console.log(elements);
                // while(elements.length > 0){
                //     console.log("REMOVE");
                //     elements[0].parentNode.removeChild(elements[0]);
                // }

                // new InstallButton();

            }, 1000);
        
    });
    // document.addEventListener('DOMNodeInserted', (event) => {
    //     setTimeout(() => {
    //         // eslint-disable-next-line @typescript-eslint/no-use-before-define
    //         Array.from(document.getElementsByClassName('a-na-d-K-ea')).forEach((el) => {
    //             el.parentNode.removeChild(el);
    //         });
    //     }, 10);
    // });
    function installPlugin(id =  document.URL.match(/(?<=\/)(\w+)(\?|$)/)[1] , version = navigator.userAgent.match(/(?<=Chrom(e|ium)\/)\d+\.\d+/)[0]) {
        console.log(baseUrl
            .replace('%VERSION', version)
            .replace('%ID', id));
        window.location.href = baseUrl
            .replace('%VERSION', version)
            .replace('%ID', id);
    }
    function InstallButton() {
 
        // installPlugin(id);
        console.log("INSTALLED");
            // if (wrapper == null)
            //     return;

        const button = document.getElementsByClassName('UywwFc-vQzf8d')[0];
        button.textContent = ibText;
        
        document.getElementsByClassName('UywwFc-LgbsSe UywwFc-LgbsSe-OWXEXe-dgl2Hf')[0].disabled = false;
        document.getElementsByClassName('UywwFc-LgbsSe UywwFc-LgbsSe-OWXEXe-dgl2Hf')[0].addEventListener('click', () => {
            // button.textContent = 'Loading...';
            installPlugin();
        });
    }
};
