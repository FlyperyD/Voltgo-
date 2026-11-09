var ST=[{id:1,n:"ТЦ «КУБ»",s:"КУБ",x:250,y:95,f:6,t:8,lat:49.0495,lng:24.3680},
{id:2,n:"Площа Героїв України",s:"пл. Героїв",x:130,y:180,f:4,t:8,lat:49.0467,lng:24.3589},
{id:3,n:"Залізничний вокзал",s:"Вокзал",x:300,y:225,f:3,t:6,lat:49.0372,lng:24.3716},
{id:4,n:"Автовокзал",s:"Автовокзал",x:215,y:150,f:5,t:6,lat:49.0449,lng:24.3733},
{id:5,n:"Міський парк",s:"Парк",x:80,y:90,f:2,t:6,lat:49.0510,lng:24.3610},
{id:6,n:"Калуська міська лікарня",s:"Лікарня",x:340,y:70,f:0,t:6,lat:49.0541,lng:24.3790}];
var SOON=[[45,215],[385,150],[160,40]],onlyFree=false;
var sel=1,fast=false,tick=null,S={user:null,card:null,terms:null,active:null,hist:[]},tmp={};
try{var r=localStorage.getItem("iskra");if(r)S=JSON.parse(r)}catch(e){}
function save(){try{localStorage.setItem("iskra",JSON.stringify(S))}catch(e){}}
function $(i){return document.getElementById(i)}
function st(id){return ST.filter(function(s){return s.id==id})[0]}
function cost(m){return m<=5?0:Math.min(150,Math.ceil(m/60)*30)}
function fmt(ms){var s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60);s%=60;return(h?h+":":"")+String(m).padStart(h?2:1,"0")+":"+String(s).padStart(2,"0")}
var HD={map:["Знайдіть станцію","Візьміть павербанк і верніть у будь-якій точці"],rent:["Ваша оренда",""],hist:["Історія оренд","Усі ваші поїздки із зарядом"],me:["Профіль","Акаунт, картка й умови"]};
function show(v){["map","rent","hist","me"].forEach(function(k){$("v-"+k).classList.toggle("hide",k!=v)});
document.querySelectorAll("nav button").forEach(function(b){b.setAttribute("aria-selected",b.dataset.v==v)});
var h=HD[v];if(v=="rent"&&S.active)h=["Павербанк у вас","Взято: "+st(S.active.sid).n];
$("hd").innerHTML='<div class="top"><b class="br">'+LG(26)+'VOLTGO</b><span class="st">'+(S.user?S.user.name:"")+'</span></div><h1>'+h[0]+'</h1><p>'+h[1]+'</p>';
if(v=="rent")drawRent();if(v=="hist")drawHist();if(v=="me")drawMe();window.scrollTo(0,0)}
document.querySelectorAll("nav button").forEach(function(b){b.onclick=function(){show(b.dataset.v)}});
function modal(h){$("mc").innerHTML=h;$("modal").classList.add("on")}
function close(){$("modal").classList.remove("on")}

/* onboarding */
function LG(n){return'<svg width="'+n+'" height="'+n+'" viewBox="347 185 476 476" aria-hidden="true"><rect x="347" y="185" width="476" height="476" rx="96" fill="#000"/><path d="M398 320H672L616 420L578 352H480L598 558H537Z" fill="#00FFFF"/><path d="M505 367H568L615 448L710 287H773L615 560Z" fill="#FFFBA6" stroke="#000" stroke-width="10" stroke-linejoin="round"/></svg>'}
function obHead(n,back,t,s){return'<div class="hd"><div class="top"><button data-s="'+back+'" aria-label="Назад">←</button><span class="st">Крок '+n+' з 4</span><span style="width:28px"></span></div><h1>'+t+'</h1><p>'+s+'</p></div>'}
function ob(step){var o=$("ob"),h="";o.classList.add("on");
if(step=="welcome")h='<div class="wel"><div class="hero"><div class="logo"><div class="bolt">'+LG(58)+'</div>VOLTGO</div><h1 style="font-size:32px;margin:6px 0 0">Заряд за хвилину. Де завгодно в місті.</h1><p style="opacity:.85;margin:0;font-size:17px">Візьміть павербанк у станції та поверніть у будь-якій іншій.</p></div><div class="stack"><button class="soc k" data-s="apple">Продовжити з Apple</button><button class="soc" data-s="google">Продовжити з Google</button><button class="soc" style="background:transparent;color:#fff;border:2px solid rgba(255,255,255,.5)" data-s="phone">Увійти за номером телефону</button></div><p style="opacity:.7;text-align:center;font-size:13px;margin:14px 0 0">Демо: вхід імітується, дані нікуди не надсилаються.</p></div>';
else{var b="";
if(step=="phone")b=obHead(1,"welcome","Ваш номер телефону","Надішлемо код у повідомленні")+'<div class="pad"><div><label class="f" for="ph">Номер</label><input id="ph" type="tel" inputmode="tel" autocomplete="off" value="+380 "></div><div class="mu">Демо: можна ввести вигаданий номер.</div><div class="err" id="er"></div><div style="margin-top:auto"><button class="pri" id="go">Отримати код</button></div></div>';
if(step=="code")b=obHead(2,"phone","Код із повідомлення","Ми надіслали його на "+tmp.phone)+'<div class="pad"><div><label class="f" for="cd">Код</label><input id="cd" type="tel" inputmode="numeric" maxlength="4" autocomplete="off"></div><div class="mu">У демо підійдуть будь-які 4 цифри.</div><div class="err" id="er"></div><div style="margin-top:auto"><button class="pri" id="go">Підтвердити</button></div></div>';
if(step=="terms")b=obHead(3,"welcome","Умови використання","Застава не потрібна")+'<div class="pad"><p style="margin:0">Ми списуємо лише вартість оренди після повернення павербанка.</p><label class="chk"><input type="checkbox" id="tk"><span>Я прочитав(ла) і приймаю <button class="lk" id="rd">умови використання</button> та політику конфіденційності</span></label><div style="margin-top:auto"><button class="pri" id="go" disabled>Продовжити</button></div></div>';
if(step=="card")b=obHead(4,S.terms?"skip":"terms","Додайте картку","Без застави й блокування коштів")+'<div class="pad"><div><label class="f" for="cn">Номер картки</label><input id="cn" type="tel" inputmode="numeric" autocomplete="off" placeholder="0000 0000 0000 0000"></div><div class="two"><div><label class="f" for="ce">Термін дії</label><input id="ce" type="tel" inputmode="numeric" autocomplete="off" placeholder="ММ/РР"></div><div><label class="f" for="cv">CVC</label><input id="cv" type="password" inputmode="numeric" maxlength="3" autocomplete="off" placeholder="•••"></div></div><div class="err" id="er"></div><div class="mu">Демо: картка нікуди не надсилається, зберігаються лише тип і останні 4 цифри. Не вводьте справжні дані. Підійде тестовий номер 4242 4242 4242 4242, будь-який термін дії у форматі ММ/РР і 3 цифри CVC.</div><div class="stack" style="margin-top:auto"><button class="pri" id="go">Додати карту</button><button class="sec" id="skip">Пізніше</button></div></div>';
h='<div class="obw">'+b+'</div>'}
o.innerHTML=h;
o.querySelectorAll("[data-s]").forEach(function(b){b.onclick=function(){var s=b.dataset.s;if(s=="skip")return done();if(s=="google"||s=="apple"){S.user={name:s=="google"?"Google":"Apple ID",via:s};save();ob("terms")}else ob(s)}});
var go=$("go");
if(step=="phone"){var p=$("ph");p.oninput=function(){var d=p.value.replace(/\D/g,"").replace(/^380?/,"").slice(0,9);p.value="+380 "+d.replace(/(\d{2})(\d{3})?(\d{2})?(\d{2})?/,function(_,a,b,c,e){return[a,b,c,e].filter(Boolean).join(" ")})};
go.onclick=function(){if(p.value.replace(/\D/g,"").length!=12){$("er").textContent="Введіть номер повністю, наприклад +380 67 123 45 67";return}tmp.phone=p.value;ob("code")}}
if(step=="code")go.onclick=function(){if($("cd").value.length!=4){$("er").textContent="Введіть 4 цифри з повідомлення";return}S.user={name:tmp.phone,via:"phone"};save();ob("terms")};
if(step=="terms"){$("tk").onchange=function(){go.disabled=!this.checked};$("rd").onclick=terms;go.onclick=function(){S.terms=new Date().toISOString();save();ob("card")}}
if(step=="card"){var cn=$("cn"),ce=$("ce");cn.oninput=function(){cn.value=cn.value.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim()};
ce.oninput=function(){var d=ce.value.replace(/\D/g,"").slice(0,4);ce.value=d.length>2?d.slice(0,2)+"/"+d.slice(2):d};$("skip").onclick=done;
go.onclick=function(){var n=cn.value.replace(/\D/g,""),m=ce.value.split("/"),e="";
if(!luhn(n))e="Перевірте номер картки";else if(!(m[0]>=1&&m[0]<=12&&m[1]&&m[1].length==2))e="Вкажіть термін дії у форматі ММ/РР";else if($("cv").value.length!=3)e="Введіть 3 цифри CVC";
if(e){$("er").textContent=e;return}
S.card={brand:n[0]=="4"?"Visa":(n[0]=="5"||n[0]=="2")?"Mastercard":"Картка",last4:n.slice(-4)};save();done()}}}
function luhn(n){if(n.length<13)return false;var s=0,a=false;for(var i=n.length-1;i>=0;i--){var d=+n[i];if(a){d*=2;if(d>9)d-=9}s+=d;a=!a}return s%10==0}
function done(){$("ob").classList.remove("on");refresh();show("map");if(tmp.rent){tmp.rent=false;if(S.card)scan()}}
function terms(){modal('<h2>Умови використання</h2><div class="stack" style="font-size:15px"><p>1. Сервіс «VOLTGO» надає павербанки в тимчасове користування через станції.</p><p>2. Оплата: перші 5 хвилин безкоштовно, далі 30 ₴ за годину, не більше 150 ₴ за добу. Застава не стягується.</p><p>3. Павербанк потрібно повернути в будь-яку станцію. Якщо його не повернуто протягом 7 днів, він вважається втраченим і з картки списується його вартість 800 ₴.</p><p>4. Ви відповідаєте за збереження павербанка й не передаєте його третім особам.</p><p>5. Ми обробляємо номер телефону та дані оренд лише для роботи сервісу.</p><p class="mu">Це шаблон для демо. Перед запуском текст має перевірити юрист.</p></div><button class="pri" style="margin-top:14px" id="cl">Закрити</button>');$("cl").onclick=close}

/* map (schematic) */
function drawMap(){var h='<rect x="-200" y="-150" width="800" height="600" fill="var(--map)"/><ellipse cx="50" cy="270" rx="90" ry="55" fill="var(--pk)"/><path d="M-200 235Q120 200 200 245T600 225" stroke="#9DB9F5" stroke-width="12" fill="none" opacity=".6"/><g stroke="var(--rd)" stroke-width="10" fill="none" stroke-linecap="round"><path d="M-200 130H600"/><path d="M190 -150V450"/><path d="M-200 -50L600 350"/><path d="M310 -150V450" stroke-width="6"/></g>';
SOON.forEach(function(p){h+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="11" fill="none" stroke="var(--mu)" stroke-width="2" stroke-dasharray="4 3"/>'});
ST.forEach(function(s){var a=s.id==sel;h+='<g class="pin" tabindex="0" role="button" aria-label="'+s.n+', вільних: '+s.f+'" data-id="'+s.id+'"><circle class="pc" cx="'+s.x+'" cy="'+s.y+'" r="'+(a?24:19)+'" fill="'+(a?"#00F0FF":s.f?"#000":"#5E7173")+'" stroke="#fff" stroke-width="2.5"/><text x="'+s.x+'" y="'+(s.y+6)+'" text-anchor="middle" font-size="17" font-weight="800" fill="'+(a?"#000":"#fff")+'" font-family="Manrope,sans-serif">'+s.f+'</text><text x="'+s.x+'" y="'+(s.y+(a?38:33))+'" text-anchor="middle" font-size="10" font-weight="800" fill="var(--ink)" stroke="var(--map)" stroke-width="3" paint-order="stroke" font-family="Manrope,sans-serif">'+s.s+'</text></g>'});
$("svg").innerHTML=h;$("svg").querySelectorAll(".pin").forEach(function(p){p.onclick=function(){pick(+p.dataset.id)};p.onkeydown=function(e){if(e.key=="Enter"||e.key==" "){e.preventDefault();pick(+p.dataset.id)}}})}
function searchPlace(){var q=$("mapSearch").value.trim().toLowerCase(),box=$("searchResults");
if(!q){box.classList.add("hide");return}
var r=ST.filter(function(s){return(s.n+" "+s.s).toLowerCase().indexOf(q)>-1});
box.classList.remove("hide");
box.innerHTML=r.length?r.map(function(s){return'<button data-id="'+s.id+'">'+s.n+' · вільних: '+s.f+'</button>'}).join(""):'<div style="padding:12px 14px">Станцій за таким запитом немає</div>';
box.querySelectorAll("button").forEach(function(b){b.onclick=function(){box.classList.add("hide");$("mapSearch").value=st(+b.dataset.id).n;pick(+b.dataset.id)}})}
function toast(t){var e=$("toast");e.textContent=t;e.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(function(){e.classList.remove("on")},6000)}
function drawTiles(){var L2=ST.filter(function(s){return!onlyFree||s.f>0});
$("tot").textContent="Вільних: "+ST.reduce(function(a,s){return a+s.f},0);
$("tiles").innerHTML=L2.map(function(s){return'<button class="tile'+(s.f?"":" z")+'" aria-pressed="'+(s.id==sel)+'" data-id="'+s.id+'"><b>'+s.n+'</b><span class="n">'+s.f+'</span><span class="mu">вільних із '+s.t+'</span></button>'}).join("")||'<p class="mu">Станцій із павербанками зараз немає.</p>';
$("tiles").querySelectorAll(".tile").forEach(function(b){b.onclick=function(){pick(+b.dataset.id)}});
$("fAll").setAttribute("aria-pressed",!onlyFree);$("fFree").setAttribute("aria-pressed",onlyFree);
var s=st(sel);$("routeGo").href="https://www.google.com/maps/dir/?api=1&destination="+s.lat+","+s.lng+"&travelmode=walking";$("routeGo").textContent="↗ Маршрут до «"+s.n+"»";
$("rentHere").disabled=!!S.active||s.f==0;$("rentHere").textContent=S.active?"У вас уже є активна оренда":s.f?"Орендувати тут":"Тут немає павербанків"}
function pick(id){sel=id;drawMap();drawTiles()}
function refresh(){drawMap();drawTiles()}
$("fAll").onclick=function(){onlyFree=false;drawTiles()};$("fFree").onclick=function(){onlyFree=true;drawTiles()};
$("searchGo").onclick=searchPlace;$("mapSearch").oninput=searchPlace;$("mapSearch").onkeydown=function(e){if(e.key==="Enter")searchPlace()};
$("rentHere").onclick=function(){if(!S.card){tmp.rent=true;ob("card");return}scan()};
function scan(){modal('<h2>Скануйте QR на станції</h2><div class="mu">'+st(sel).n+'</div><div class="scan"><i></i></div><div class="stack"><button class="pri" id="ds">Імітувати скан</button><button class="sec" id="cl">Скасувати</button></div>');
$("cl").onclick=close;$("ds").onclick=function(){var s=st(sel);if(s.f>0){s.f--;S.active={sid:sel,t0:Date.now()};save()}close();pick(sel);show("rent");startTick();toast("Осередок №"+(1+Math.random()*8|0)+" відкрито. Заберіть павербанк")}}

/* rent, history, profile */
function drawRent(){var a=S.active,b=$("v-rent");
if(!a){b.innerHTML='<h2>Активної оренди немає</h2><p class="mu">Оберіть станцію на карті та скануйте QR-код.</p><button class="pri" id="tm2">Знайти станцію</button>';$("tm2").onclick=function(){show("map")};return}
b.innerHTML='<div class="batt" aria-hidden="true"><div class="fill" id="fill"></div><div class="t" id="tm">0:00</div></div><div class="row"><span>Заряд павербанка</span><b id="pc">100%</b></div><div class="row"><span>До сплати зараз</span><b id="cs">0 ₴</b></div><div class="row"><span>Спише з картки</span><span>'+(S.card?S.card.brand+" •••• "+S.card.last4:"—")+'</span></div><label class="f" for="ret" style="margin-top:14px">Куди повернути</label><select id="ret" style="margin-bottom:14px">'+ST.map(function(s){return'<option value="'+s.id+'"'+(s.id==a.sid?" selected":"")+'>'+s.n+'</option>'}).join("")+'</select><div class="stack"><button class="pri" id="dr">Повернути павербанк</button><label class="chk mu"><input type="checkbox" id="fs"'+(fast?" checked":"")+'><span>Демо: пришвидшити час ×60</span></label></div>';
$("fs").onchange=function(){fast=this.checked;tickNow()};
$("dr").onclick=function(){var ms=el(),rs=st($("ret").value);rs.f++;S.hist.unshift({f:st(a.sid).n,t:rs.n,d:new Date().toLocaleString("uk-UA",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"}),du:fmt(ms),c:cost(ms/60000)});S.active=null;save();clearInterval(tick);pick(rs.id);show("hist");toast("Дякуємо! Оренду завершено")};tickNow()}
function el(){var e=Date.now()-S.active.t0;return fast?e*60:e}
function tickNow(){if(!S.active||!$("tm"))return;var ms=el();$("tm").textContent=fmt(ms);$("cs").textContent=cost(ms/60000)+" ₴";$("pc").textContent=Math.max(5,100-Math.round(ms/36e5*30))+"%";$("fill").style.width=Math.min(100,ms/36e5*100)+"%"}
function startTick(){clearInterval(tick);tick=setInterval(tickNow,1000)}
function drawHist(){$("v-hist").innerHTML=S.hist.length?S.hist.map(function(h){return'<div class="row"><span><b>'+h.d+'</b><br><span class="mu">'+h.f+' → '+h.t+', '+h.du+'</span></span><b>'+h.c+' ₴</b></div>'}).join(""):'<p class="mu">Тут з’являться ваші оренди після першого повернення.</p>'}
function drawMe(){var u=S.user||{},c=S.card;$("v-me").innerHTML='<div class="row"><span>Акаунт</span><b>'+(u.name||"—")+'</b></div><div class="row"><span>Умови прийнято</span><span>'+(S.terms?new Date(S.terms).toLocaleDateString("uk-UA"):"ні")+'</span></div><h2 style="margin-top:22px">Картка</h2>'+(c?'<div class="cc"><div style="opacity:.8">'+c.brand+'</div><div style="font-size:20px;font-weight:800;margin-top:24px">•••• •••• •••• '+c.last4+'</div></div>':'<p class="mu">Картку не додано. Вона потрібна для оренди.</p>')+'<label class="chk mu" style="margin-top:16px"><input type="checkbox" id="fs2"'+(fast?" checked":"")+'><span>Демо: пришвидшити час ×60</span></label><div class="stack" style="margin-top:16px"><button class="pri" id="ac">'+(c?"Замінити картку":"Додати картку")+'</button><button class="sec" id="tr">Умови використання</button><button class="sec" id="lo">Вийти</button></div>';
$("fs2").onchange=function(){fast=this.checked};$("ac").onclick=function(){ob("card")};$("tr").onclick=terms;$("lo").onclick=function(){if(S.active){modal('<h2>Спершу поверніть павербанк</h2><p class="mu">Активна оренда триває. Завершіть її, щоб вийти.</p><button class="pri" id="cl">Зрозуміло</button>');$("cl").onclick=close;return}S={user:null,card:null,terms:null,active:null,hist:[]};save();ob("welcome")}}
refresh();show("map");if(S.active)startTick();
if(!S.user)ob("welcome");else if(!S.terms)ob("terms");
