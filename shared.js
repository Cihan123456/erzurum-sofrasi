/* All menu data is bundled in data.js: file:// and GitHub Pages both work. */
(function(){
 'use strict';
 const STORE_KEY='erzurum-sofrasi-fiyat-demo-v1';
 const {hasCloudConfig,getCloud}=window.ESCloud;
 const priceKey=(id,portion)=>`${id}:${portion}`;
 async function loadCatalog(){if(!window.ERZURUM_DATA)throw Error('Veri dosyası bulunamadı');return window.ERZURUM_DATA}
 function defaultPrices(catalog){
  const result={};for(const rows of Object.values(catalog.pages))for(const row of rows)
   for(const [portion,price] of Object.entries(row.prices))if(price!==null)result[priceKey(row.id,portion)]=price;
  return result;
 }
 function localPrices(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch{return {}}}
 function updateLocalPrices(changes){
  try{localStorage.setItem(STORE_KEY,JSON.stringify(changes))}
  catch(err){throw Error('Tarayıcı yerel kayda izin vermiyor. GitHub Pages üzerinden deneyin. '+err.message)}
  window.dispatchEvent(new Event('erzurum-price-update'));
 }
 function subscribePrices(callback){
  let cancel=()=>{},closed=false;
  if(!hasCloudConfig()){
   const rerender=()=>callback(localPrices());
   window.addEventListener('storage',rerender);window.addEventListener('erzurum-price-update',rerender);
   rerender();return ()=>{window.removeEventListener('storage',rerender);window.removeEventListener('erzurum-price-update',rerender)};
  }
  getCloud().then(c=>{
   if(closed||!c)return;
   cancel=c.d.onSnapshot(c.d.doc(c.db,'publicMenu','prices'),snapshot=>{
    callback(snapshot.exists()?snapshot.data().prices||{}:{});
   },error=>{console.error('Firestore hatası:',error);callback({})});
  }).catch(err=>{console.error(err);callback({})});
  return ()=>{closed=true;cancel()};
 }
 async function saveCloudPrices(changes){
  const c=await getCloud();if(!c)throw Error('Firebase yapılandırılmadı');
  await c.d.setDoc(c.d.doc(c.db,'publicMenu','prices'),{prices:changes,updatedAt:c.d.serverTimestamp()},{merge:true});
 }
 window.ES={loadCatalog,defaultPrices,localPrices,updateLocalPrices,subscribePrices,priceKey,getCloud,hasCloudConfig,saveCloudPrices};
})();
