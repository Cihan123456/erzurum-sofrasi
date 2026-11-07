/* Demo mode works fully offline. Firebase is only loaded after actual configuration. */
(function(){
 'use strict';
 const VERSION='10.14.1';
 function hasCloudConfig(){const c=window.ERZURUM_FIREBASE||{};return Boolean(c.apiKey&&c.authDomain&&c.projectId&&c.appId&&c.ownerUid)}
 let p;
 async function getCloud(){
  if(!hasCloudConfig())return null;
  if(!p)p=(async()=>{
   const [a,d,account]=await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${VERSION}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${VERSION}/firebase-firestore.js`),
    import(`https://www.gstatic.com/firebasejs/${VERSION}/firebase-auth.js`)
   ]);
   const app=a.initializeApp(window.ERZURUM_FIREBASE);
   return {app,db:d.getFirestore(app),auth:account.getAuth(app),d,account};
  })();
  return p;
 }
 window.ESCloud={hasCloudConfig,getCloud};
})();
