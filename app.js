const {loadCatalog,defaultPrices,subscribePrices,priceKey}=window.ES;
const menu=document.querySelector('#menu');const modal=document.querySelector('#infoModal');
const PAGE_H=1672,PAGE_W=941;
const PHONE='05315860798';
let catalog,geo,currentPrices={},defaults={},activePage=1;
const fields=['single','one_half','double'];
const screenNames={1:'Giriş',2:'Çorbalar',3:'Kebaplar',4:'Pide ve Lahmacun',5:'Dürümler',6:'Sulu Yemekler',7:'Tatlılar',8:'İçecekler',9:'Alo Paket Servis'};
function pct(v,max){return `${(100*v/max).toFixed(5)}%`}
function prod(name){return catalog.products.find(p=>p.name===name)}
function renderPrices(){
 document.querySelectorAll('.price-value').forEach(el=>{
  const k=el.dataset.priceKey;
  const number=(currentPrices[k]??defaults[k]);
  el.textContent=Number(number).toLocaleString('tr-TR')+' ₺';
  let initial=(Number(el.dataset.baseSize)||40)*(el.parentElement.offsetWidth/PAGE_W);
  el.style.fontSize=initial+'px';
  const width=el.getBoundingClientRect().width-3;
  const height=el.getBoundingClientRect().height-2;
  while((el.scrollWidth>width || el.scrollHeight>height) && initial>14){
   initial*=.97;
   el.style.fontSize=initial+'px';
  }
 });
}
function addHotspot(poster,rect,label,callback,cls='product-hit'){
 const hit=document.createElement('button');hit.type='button';hit.className=cls;
 hit.style.left=pct(rect.x,PAGE_W);hit.style.top=pct(rect.y,PAGE_H);
 hit.style.width=pct(rect.w,PAGE_W);hit.style.height=pct(rect.h,PAGE_H);
 hit.setAttribute('aria-label',label);hit.title=label;hit.addEventListener('click',callback);poster.append(hit);
}
function buildMenu(){
 menu.replaceChildren();
 const namesById=new Map(catalog.products.map(p=>[p.id,p]));
 for(let page=1;page<=9;page++){
  const section=document.createElement('section');section.className='menu-page';section.id=`sayfa-${page}`;section.dataset.page=page;
  section.setAttribute('aria-label',`${page}. sayfa: ${screenNames[page]}`);
  const poster=document.createElement('div');poster.className='poster';
  const image=document.createElement('img');image.className='poster-image';image.src=`assets/page-${String(page).padStart(2,'0')}.png`;image.alt=`Erzurum Sofrası, ${screenNames[page]} sayfası`;image.draggable=false;
  poster.append(image);
  const rows=catalog.pages[String(page)];
  const layout=geo[String(page)];
  if(rows&&layout){
   for(const [ri,row] of rows.entries()){
    const name=namesById.get(row.id)?.name??row.name;
    const y=layout.rows[ri];
    const xEnd=(page===4?390:page===5?392:page===7?645:page===8?681:495);
    const yGap=page===4?69:page===8?58:page===7?112:page===5?73:page===2?84:70;
    addHotspot(poster,{x:30,y:y-yGap*.46,w:xEnd-36,h:yGap*.92},`${name} ürün içeriğini, kalorisini ve alerjen bilgisini gör`,()=>openInfo(row.id));
   }
   for(const item of layout.prices){
    const row=rows[item.row];const field=fields[item.col];const v=row?.prices[field];if(v==null)continue;
    const span=document.createElement('span');span.className='price-value';
    span.dataset.priceKey=priceKey(row.id,field);span.dataset.baseSize=({2:49,3:50,4:42,5:49,7:68,8:48}[page]);
    // Price overlay occupies INSIDE original border; pixel-cleared art remains the exact original page.
    span.style.left=pct(item.left+2,PAGE_W);span.style.top=pct(item.top+2,PAGE_H);
    span.style.width=pct(item.width-4,PAGE_W);span.style.height=pct(item.height-4,PAGE_H);
    poster.append(span);
   }
  }
  if(page===9){
   addHotspot(poster,{x:30,y:756,w:877,h:210},'Alo paket sipariş: 0531 586 07 98 numarasını ara',()=>{window.location.href='tel:'+PHONE},'phone-hit');
  }
  section.append(poster);menu.append(section);
 }
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){if(entry.isIntersecting){activePage=Number(entry.target.dataset.page);document.querySelector('#pageStatus').textContent=`${activePage} / 9`}}
 },{root:menu,threshold:.6});
 document.querySelectorAll('.menu-page').forEach(n=>observer.observe(n));
 window.addEventListener('resize',renderPrices);renderPrices();
}
function fmt(x,dec=1){return Number.isFinite(x)?x.toLocaleString('tr-TR',{maximumFractionDigits:dec}):'—'}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function openInfo(id){
 const p=catalog.products.find(p=>p.id===id);if(!p)return;
 const isDraftPreview=new URLSearchParams(location.search).get('taslak')==='1';
 const content=`<div class="warning-note"><strong>Standart tarif hesabı.</strong> Bu ürünün verileri yaklaşık araştırma taslağıdır; işletmenin gerçek reçetesiyle henüz doğrulanmadı.</div>
 <div class="macro-grid">
 <div class="macro"><span>Yaklaşık enerji</span><strong>${fmt(p.energy_kcal,0)} kcal</strong></div>
 <div class="macro"><span>Yağ</span><strong>${fmt(p.fat_g)} g</strong></div>
 <div class="macro"><span>Protein</span><strong>${fmt(p.protein_g)} g</strong></div>
 <div class="macro"><span>Karbonhidrat</span><strong>${fmt(p.carbohydrate_g)} g</strong></div>
 </div>
 <p class="modal-subtitle">İçindekiler – örnek standart tarif</p>
 <p class="modal-bodycopy">${escapeHtml(p.ingredients_model)}</p>
 <p class="modal-subtitle">Alerjen bilgileri</p>
 <p class="modal-bodycopy">${p.allergen_verified?escapeHtml(p.allergens_model):'İşletmeye özel alerjen doğrulaması henüz tamamlanmadı. Alerjiniz varsa sipariş vermeden önce işletmeyle görüşün.'}</p>
 ${isDraftPreview&&!p.allergen_verified?`<div class="warning-note"><strong>Yalnızca yönetim önizlemesi – muhtemel alerjenler:</strong> ${escapeHtml(p.allergens_model)}. Kesin restoran beyanı değildir.</div>`:''}
 <p class="nutrition-footnote">${escapeHtml(p.disclaimer)}${p.portion?' • Hesaplama miktarı: '+escapeHtml(p.portion):''}</p>
 <a class="call-button" href="tel:${PHONE}">☎ İşletmeyi ara • 0531 586 07 98</a>`;
 document.querySelector('#modalTitle').textContent=p.name;
 document.querySelector('#modalContent').innerHTML=content;
 modal.showModal();
}
document.querySelector('#modalClose').addEventListener('click',()=>modal.close());
modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});
(async()=>{
 try{
  ({catalog,geometry:geo}=await loadCatalog());defaults=defaultPrices(catalog);
  buildMenu();
  subscribePrices(overrides=>{currentPrices=overrides||{};renderPrices()});
 }catch(err){console.error(err);menu.innerHTML='<div class="loading">Menü açılamadı. Lütfen bağlantıyı kontrol edip sayfayı yenileyin.</div>'}
})();
