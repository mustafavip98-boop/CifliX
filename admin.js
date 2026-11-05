const seed=[
{id:1,title:"مدينة النجوم",year:2025,genre:"خيال علمي",type:"فيلم",rating:"8.4",poster:"https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=700&q=85",desc:"رحلة بصرية إلى مستقبل تتغير فيه حدود الإنسان والفضاء.",featured:true,video:""},
{id:2,title:"آخر مهمة",year:2024,genre:"أكشن",type:"فيلم",rating:"7.9",poster:"https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=85",desc:"مهمة أخيرة تضع فريقاً صغيراً أمام قرار مصيري.",featured:false,video:""},
{id:3,title:"حكاية رمادية",year:2023,genre:"دراما",type:"مسلسل",rating:"8.1",poster:"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=85",desc:"دراما إنسانية عن اختيارات الحياة والأسرار.",featured:true,video:""}
];
const KEY="ciflix-catalog-v1";
let items=JSON.parse(localStorage.getItem(KEY)||"null")||seed;
const $=s=>document.querySelector(s);
const save=()=>{localStorage.setItem(KEY,JSON.stringify(items));render()};
function render(){const q=$("#adminSearch").value.toLowerCase();const filtered=items.filter(x=>x.title.toLowerCase().includes(q));$("#adminRows").innerHTML=filtered.map(x=>`<tr><td><span class="table-title"><img class="mini-poster" src="${safe(x.poster)}" onerror="this.style.visibility='hidden'"><span>${safe(x.title)}</span></span></td><td>${safe(x.type)}</td><td>${safe(x.genre)}</td><td>${x.year||"—"}</td><td>${x.featured?"★ نعم":"—"}</td><td><div class="row-actions"><button data-edit="${x.id}">تعديل</button><button class="delete" data-del="${x.id}">حذف</button></div></td></tr>`).join("");$("#emptyAdmin").hidden=filtered.length>0;$("#totalCount").textContent=items.length;$("#filmCount").textContent=items.filter(x=>x.type==="فيلم").length;$("#seriesCount").textContent=items.filter(x=>x.type==="مسلسل").length;$("#featuredCount").textContent=items.filter(x=>x.featured).length}
function normalizeImport(data){
 const arr=Array.isArray(data)?data:(data.items||data.movies||data.series||data.results);
 if(!Array.isArray(arr)||!arr.length)throw Error("لم نعثر على قائمة عناوين صالحة داخل JSON");
 return arr.map((x,i)=>{
  if(!x||typeof x!=="object")throw Error("يوجد عنصر غير صالح في القائمة");
  const title=String(x.title||x.name||x.en_title||"").trim();
  if(!title)throw Error("يوجد عنصر بدون اسم عنوان");
  const rawType=String(x.type||x.kind||"فيلم").toLowerCase();
  const type=(rawType.includes("series")||rawType.includes("مسلسل")||rawType==="2")?"مسلسل":(rawType.includes("anime")||rawType.includes("أنمي")?"أنمي":"فيلم");
  const poster=x.poster||x.image||x.poster_url||x.imgObjUrl||"";
  const video=x.video||x.url||x.stream||x.videoUrl||"";
  return {id:String(x.id||x.nb||("import-"+Date.now()+"-"+i)),title,type,genre:Array.isArray(x.genres)?(x.genres[0]||"دراما"):(x.genre||"دراما"),year:x.year||x.release_year||"",rating:x.rating||x.stars||"",poster,video,desc:x.desc||x.overview||x.description||x.en_content||"",featured:!!x.featured,seasons:x.seasons||x.episodes||[]};
 });
}
function mergeImport(incoming){
 const map=new Map(items.map(x=>[String(x.id),x]));
 incoming.forEach(x=>{const sameTitle=items.find(old=>old.title.trim().toLowerCase()===x.title.trim().toLowerCase()&&old.type===x.type);const key=sameTitle?String(sameTitle.id):String(x.id);map.set(key,{...(sameTitle||{}),...x,id:sameTitle?sameTitle.id:x.id});});
 items=Array.from(map.values());save();
}
function openPaste(){ $("#jsonText").value="";$("#jsonStatus").textContent="";$("#pasteModal").classList.add("show"); }
function closePaste(){ $("#pasteModal").classList.remove("show"); }
function safe(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function formOpen(item){$("#contentForm").reset();$("#itemId").value=item?.id||"";$("#formTitle").textContent=item?"تعديل العنوان":"إضافة عنوان";if(item){$("#fTitle").value=item.title||"";$("#fType").value=item.type||"فيلم";$("#fGenre").value=item.genre||"أكشن";$("#fYear").value=item.year||2026;$("#fRating").value=item.rating||8;$("#fPoster").value=item.poster||"";$("#fVideo").value=item.video||"";$("#fDesc").value=item.desc||"";$("#fFeatured").checked=!!item.featured}$("#editModal").classList.add("show")}
function formClose(){$("#editModal").classList.remove("show")}
$("#addBtn").onclick=()=>formOpen();$("#closeEdit").onclick=$("#cancelEdit").onclick=formClose;$("#editModal").onclick=e=>{if(e.target.id==="editModal")formClose()};
$("#contentForm").onsubmit=e=>{e.preventDefault();const id=$("#itemId").value;const obj={id:id?Number(id):Date.now(),title:$("#fTitle").value.trim(),type:$("#fType").value,genre:$("#fGenre").value,year:Number($("#fYear").value),rating:$("#fRating").value,poster:$("#fPoster").value.trim(),video:$("#fVideo").value.trim(),desc:$("#fDesc").value.trim(),featured:$("#fFeatured").checked};items=id?items.map(x=>x.id===Number(id)?obj:x):[obj,...items];save();formClose()};
$("#adminRows").onclick=e=>{const edit=e.target.dataset.edit,del=e.target.dataset.del;if(edit)formOpen(items.find(x=>x.id===Number(edit)));if(del&&confirm("متأكد تريد حذف هذا العنوان؟")){items=items.filter(x=>x.id!==Number(del));save()}};
$("#adminSearch").oninput=render;
$("#exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify({version:1,items},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="ciflix-catalog.json";a.click();URL.revokeObjectURL(a.href)};
$("#importBtn").onclick=()=>$("#jsonFile").click();
$("#pasteBtn").onclick=openPaste;$("#closePaste").onclick=$("#cancelPaste").onclick=closePaste;$("#pasteModal").onclick=e=>{if(e.target.id==="pasteModal")closePaste()};
$("#applyJson").onclick=()=>{try{const incoming=normalizeImport(JSON.parse($("#jsonText").value));if(!confirm(`تم التعرف على ${incoming.length} عنوان. دمجها مع المكتبة الحالية؟`))return;mergeImport(incoming);$("#jsonStatus").textContent=`تم استيراد ودمج ${incoming.length} عنوان بنجاح.`;setTimeout(closePaste,900)}catch(err){$("#jsonStatus").textContent="تعذر الاستيراد: "+err.message}};
$("#jsonFile").onchange=async e=>{try{const data=JSON.parse(await e.target.files[0].text());const incoming=normalizeImport(data);if(!confirm(`تم التعرف على ${incoming.length} عنوان. دمجها مع المكتبة الحالية دون حذف الموجود؟`))return;mergeImport(incoming);$("#feedStatus").textContent=`تم دمج ${incoming.length} عنوان من الملف بنجاح.`}catch(err){alert("تعذر الاستيراد: "+err.message)}e.target.value=""};
$("#loadFeed").onclick=async()=>{const url=$("#feedUrl").value.trim();if(!url)return alert("أدخل رابط JSON أولاً");$("#feedStatus").textContent="جارٍ جلب البيانات...";try{const res=await fetch(url);if(!res.ok)throw Error("HTTP "+res.status);const data=await res.json();const incoming=normalizeImport(data);if(!confirm(`تم التعرف على ${incoming.length} عنوان. دمجها مع المكتبة الحالية دون حذف الموجود؟`))return;mergeImport(incoming);$("#feedStatus").textContent=`تم دمج ${incoming.length} عنوان من الرابط بنجاح.`}catch(err){$("#feedStatus").textContent="فشل الجلب: "+err.message+" — قد يكون السبب CORS أو رابطاً غير صالح."}};

const API_KEY="ciflix-api-base", TOKEN_KEY="ciflix-admin-token";
$("#apiBase").value=localStorage.getItem(API_KEY)||"";
$("#adminToken").value=localStorage.getItem(TOKEN_KEY)||"";
$("#saveApi").onclick=()=>{localStorage.setItem(API_KEY,$("#apiBase").value.trim().replace(/\\/$/,""));localStorage.setItem(TOKEN_KEY,$("#adminToken").value);$("#apiStatus").textContent="تم حفظ إعدادات الربط على هذا المتصفح.";};
$("#syncCatalog").onclick=async()=>{const base=$("#apiBase").value.trim().replace(/\\/$/,""),token=$("#adminToken").value;if(!base||!token)return alert("أدخل رابط الخادم ورمز الإدارة أولاً");$("#apiStatus").textContent="جارٍ رفع المكتبة إلى الخادم...";try{const response=await fetch(base+"/api/admin/catalog/import",{method:"POST",headers:{"Content-Type":"application/json","X-CifliX-Admin-Token":token},body:JSON.stringify({items})});const data=await response.json();if(!response.ok)throw Error(data.detail||("HTTP "+response.status));$("#apiStatus").textContent="تمت المزامنة. العناوين المضافة: "+data.imported+" • الإجمالي بالخادم: "+data.total;}catch(error){$("#apiStatus").textContent="فشلت المزامنة: "+error.message;}};
\nrender();