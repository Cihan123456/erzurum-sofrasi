const {loadCatalog,defaultPrices,localPrices,updateLocalPrices,subscribePrices,priceKey,hasCloudConfig,getCloud,saveCloudPrices}=window.ES;
const status=document.getElementById('adminStatus'),panel=document.getElementById('adminPanel'),login=document.getElementById('loginPanel');
const labels={single:'1 porsiyon / adet',one_half:'1,5 porsiyon',double:'Duble'};
let catalog,defaults={},overrides={},mode='demo',unsubscribe=()=>{},cloud;
const text=(msg)=>status.textContent=msg;
function makeRow(row){
 const wrapper=document.createElement('div');wrapper.className='price-editor-row';wrapper.dataset.search=row.name.toLocaleLowerCase('tr');
 const name=document.createElement('div');name.className='name';name.textContent=row.name;wrapper.append(name);
 const area=document.createElement('div');area.className='price-inputs';
 for(const [k,value] of Object.entries(row.prices)){
  if(value===null)continue;
  const key=priceKey(row.id,k);
  const label=document.createElement('label');label.textContent=labels[k];
  const input=document.createElement('input');input.type='number';input.step='1';input.min='0';input.max='999999';input.required=true;input.dataset.priceKey=key;input.value=overrides[key]??defaults[key];input.setAttribute('aria-label',row.name+' '+labels[k]);label.append(input);area.append(label);
 }
 wrapper.append(area);return wrapper;
}
function paintEditor(){
 const container=document.getElementById('priceEditor');container.replaceChildren();
 for(const [page,rows] of Object.entries(catalog.pages)){
  const section=document.createElement('section');section.className='admin-category';
  const head=document.createElement('h2');head.textContent=`${page}. Sayfa – ${catalog.pageTitles[page]}`;section.append(head);
  for(const row of rows)section.append(makeRow(row));
  container.append(section);
 }
 document.getElementById('searchPrices').dispatchEvent(new Event('input'));
}
function updateInputs(next){overrides=next||{};document.querySelectorAll('input[data-price-key]').forEach(input=>{if(document.activeElement!==input)input.value=overrides[input.dataset.priceKey]??defaults[input.dataset.priceKey]})}
function startEditor(){
 login.hidden=true;panel.hidden=false;paintEditor();
 unsubscribe();unsubscribe=subscribePrices(updateInputs);
 document.getElementById('logoutBtn').hidden=mode!=='cloud';
 text(mode==='demo'?'DEMO MODU — Fiyat değişiklikleri yalnızca bu tarayıcıda kaydedilir; başka telefonlara aktarılmaz.':'CANLI MOD — Kaydettiğiniz fiyatlar Firestore üzerinden müşterilerin menüsünde güncellenir.');
}
async function start(){
 ({catalog}=await loadCatalog());defaults=defaultPrices(catalog);
 if(hasCloudConfig()){
  mode='cloud';cloud=await getCloud();
  cloud.account.onAuthStateChanged(cloud.auth,user=>{
   if(user && user.email?.toLowerCase()===window.ERZURUM_FIREBASE.ownerEmail.toLowerCase()){startEditor()}
   else {panel.hidden=true;login.hidden=false;text('Güvenli yönetim: İşletme sahibinin hesabıyla giriş yapın.')}
  });
 }else{mode='demo';startEditor()}
}
document.getElementById('loginForm').addEventListener('submit',async e=>{
 e.preventDefault();text('Giriş doğrulanıyor…');
 try{await cloud.account.signInWithEmailAndPassword(cloud.auth,document.getElementById('loginEmail').value.trim(),document.getElementById('loginPassword').value)}
 catch(err){text('Giriş başarısız: '+err.message)}
});
document.getElementById('savePrices').addEventListener('click',async()=>{
 const inputs=Array.from(document.querySelectorAll('input[data-price-key]'));
 if(inputs.some(i=>!i.reportValidity()))return;
 const edited={};for(const input of inputs){let price=Number(input.value);if(!Number.isInteger(price)||price<0){text('Fiyatlar negatif olmayan tam sayılar olmalı.');return}edited[input.dataset.priceKey]=price}
 text('Fiyatlar kaydediliyor…');
 try{
  if(mode==='demo'){updateLocalPrices(edited);text('DEMO — Fiyatlar bu tarayıcıda kaydedildi. Başka telefonlarda güncellenmez.')}
  else{await saveCloudPrices(edited);text('Fiyatlar kaydedildi. Bağlı müşteri menülerine güncelleme gönderildi.')}
 }catch(err){text('Kaydetme hatası: '+err.message)}
});
document.getElementById('searchPrices').addEventListener('input',e=>{
 const term=e.target.value.toLocaleLowerCase('tr').trim();
 document.querySelectorAll('.admin-category').forEach(section=>{
  let count=0;
  section.querySelectorAll('.price-editor-row').forEach(r=>{const visible=!term||r.dataset.search.includes(term);r.hidden=!visible;if(visible)count++});
  section.hidden=count===0;
 });
});
document.getElementById('exportPrices').addEventListener('click',()=>{
 const values={};for(const input of document.querySelectorAll('input[data-price-key]'))values[input.dataset.priceKey]=Number(input.value);
 const file=new Blob([JSON.stringify({project:'Erzurum Sofrası',prices:values,exportDate:new Date().toISOString()},null,2)],{type:'application/json'});
 const link=document.createElement('a');link.href=URL.createObjectURL(file);link.download='Erzurum_Sofrasi_Fiyat_Yedegi.json';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),500);
});
document.getElementById('logoutBtn').addEventListener('click',async()=>{if(cloud)await cloud.account.signOut(cloud.auth)});
start().catch(err=>{console.error(err);text('Panel açılamadı: '+err.message)});
