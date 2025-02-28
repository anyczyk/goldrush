// admobService.js
import { setCookiesMinutes, hasCookies } from './cookies';

let interstitial = null;
const idAd = 'ca-app-pub-4263972941440160/9932932002'; // real
// const idAd = 'ca-app-pub-3940256099942544/1033173712'; // test
const initializeAdMob = async () => {
    if(window.cordova) {
        try {
            if (!window.admob) {
                return;
            }

            await window.admob.start();
            console.log('admob.start() OK');

            interstitial = new window.admob.InterstitialAd({
                adUnitId: idAd,
            });

            interstitial.on('load', () => {
                console.log('Interstitial LOADED!');
            });

            interstitial.on('error', (err) => {
                console.error('Interstitial ERROR:', err);
            });

            interstitial.on('dismiss', async () => {
                try {
                    await interstitial.load();
                } catch (err) {
                    console.error('Error:', err);
                }
            });

            await interstitial.load();
        } catch (e) {
            console.error('Error:', e);
        }
    }
};
export const showInterstitial = async (premium, noCookie) => {
    if(!premium && (!hasCookies('goldRushAdFullScreen-cookie-full-screen-ad') || noCookie)) {
        //alert("no premium");
        if(!noCookie) {
            setCookiesMinutes('goldRushAdFullScreen-cookie-full-screen-ad','start', 5);
        }
        if(window.cordova) {
            try {
                //alert("try ad")
                if (!interstitial) {
                    console.warn('No interstitial (still no loaded)');
                    //alert('No interstitial (still no loaded)');
                    return;
                }
                if (window.StatusBar) {
                    window.StatusBar.backgroundColorByHexString('#000000');
                }
                await interstitial.show();
            } catch (err) {
                console.error('Error in showInterstitial:', err);
                alert("error add");
            }
        } else {
            alert("Ad for mobile");
        }
    }
};

document.addEventListener('deviceready', initializeAdMob, false);
document.addEventListener('admob.ad.dismiss', async () => {}, false);
