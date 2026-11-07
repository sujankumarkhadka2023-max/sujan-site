/* Explore section: weather forecast page and daily horoscope (rashifal).
   Loaded by index.html when this section is opened. Upload it next to index.html. */
/* ---------- Weather page (/weather): hero, hourly and daily forecast, free data from Open-Meteo ---------- */
const WF_CITIES=[['Kathmandu',27.7172,85.324],['Pokhara',28.2096,83.9856],['Lalitpur',27.6644,85.3188],['Bhaktapur',27.671,85.4298],['Biratnagar',26.4525,87.2718],['Birgunj',27.0104,84.877],['Butwal',27.7006,83.4483],['Dharan',26.8065,87.2846],['Janakpur',26.7288,85.9266],['Nepalgunj',28.05,81.6167],['Hetauda',27.4287,85.0322],['Dhangadhi',28.6833,80.6],['Itahari',26.6667,87.2833],['Bharatpur',27.6833,84.4333]];
const WF_ABROAD=[['Doha',25.2854,51.531],['Dubai',25.2048,55.2708],['Riyadh',24.7136,46.6753],['Kuala Lumpur',3.139,101.6869],['Delhi',28.6139,77.209],['London',51.5072,-0.1276],['New York',40.7128,-74.006],['Sydney',-33.8688,151.2093],['Tokyo',35.6762,139.6503]];
const WF_CAPS=`Afghanistan|Kabul|34.53|69.17
Albania|Tirana|41.33|19.82
Algeria|Algiers|36.75|3.06
Andorra|Andorra la Vella|42.51|1.52
Angola|Luanda|-8.84|13.23
Antigua and Barbuda|Saint John's|17.12|-61.85
Argentina|Buenos Aires|-34.6|-58.38
Armenia|Yerevan|40.18|44.51
Australia|Canberra|-35.28|149.13
Austria|Vienna|48.21|16.37
Azerbaijan|Baku|40.41|49.87
Bahamas|Nassau|25.05|-77.36
Bahrain|Manama|26.23|50.59
Bangladesh|Dhaka|23.81|90.41
Barbados|Bridgetown|13.1|-59.61
Belarus|Minsk|53.9|27.57
Belgium|Brussels|50.85|4.35
Belize|Belmopan|17.25|-88.76
Benin|Porto-Novo|6.5|2.63
Bhutan|Thimphu|27.47|89.64
Bolivia|La Paz|-16.5|-68.15
Bosnia and Herzegovina|Sarajevo|43.86|18.41
Botswana|Gaborone|-24.65|25.91
Brazil|Brasília|-15.79|-47.88
Brunei|Bandar Seri Begawan|4.89|114.94
Bulgaria|Sofia|42.7|23.32
Burkina Faso|Ouagadougou|12.37|-1.52
Burundi|Gitega|-3.43|29.93
Cabo Verde|Praia|14.93|-23.51
Cambodia|Phnom Penh|11.56|104.92
Cameroon|Yaoundé|3.85|11.5
Canada|Ottawa|45.42|-75.7
Central African Republic|Bangui|4.36|18.56
Chad|N'Djamena|12.13|15.06
Chile|Santiago|-33.45|-70.67
China|Beijing|39.9|116.41
Colombia|Bogotá|4.71|-74.07
Comoros|Moroni|-11.7|43.26
Congo (Republic)|Brazzaville|-4.27|15.28
Congo (Democratic Republic)|Kinshasa|-4.44|15.27
Costa Rica|San José|9.93|-84.08
Côte d'Ivoire|Yamoussoukro|6.82|-5.28
Croatia|Zagreb|45.81|15.98
Cuba|Havana|23.11|-82.37
Cyprus|Nicosia|35.19|33.38
Czechia|Prague|50.08|14.44
Denmark|Copenhagen|55.68|12.57
Djibouti|Djibouti|11.59|43.15
Dominica|Roseau|15.3|-61.39
Dominican Republic|Santo Domingo|18.49|-69.93
Ecuador|Quito|-0.18|-78.47
Egypt|Cairo|30.04|31.24
El Salvador|San Salvador|13.69|-89.22
Equatorial Guinea|Malabo|3.75|8.78
Eritrea|Asmara|15.32|38.93
Estonia|Tallinn|59.44|24.75
Eswatini|Mbabane|-26.31|31.14
Ethiopia|Addis Ababa|9.03|38.74
Fiji|Suva|-18.14|178.44
Finland|Helsinki|60.17|24.94
France|Paris|48.86|2.35
Gabon|Libreville|0.39|9.45
Gambia|Banjul|13.45|-16.58
Georgia|Tbilisi|41.72|44.79
Germany|Berlin|52.52|13.41
Ghana|Accra|5.6|-0.19
Greece|Athens|37.98|23.73
Grenada|St. George's|12.06|-61.75
Guatemala|Guatemala City|14.63|-90.51
Guinea|Conakry|9.64|-13.58
Guinea-Bissau|Bissau|11.86|-15.6
Guyana|Georgetown|6.8|-58.16
Haiti|Port-au-Prince|18.59|-72.31
Honduras|Tegucigalpa|14.07|-87.19
Hungary|Budapest|47.5|19.04
Iceland|Reykjavik|64.15|-21.94
India|New Delhi|28.61|77.21
Indonesia|Jakarta|-6.21|106.85
Iran|Tehran|35.69|51.39
Iraq|Baghdad|33.31|44.37
Ireland|Dublin|53.35|-6.26
Israel|Jerusalem|31.77|35.21
Italy|Rome|41.9|12.5
Jamaica|Kingston|17.97|-76.79
Japan|Tokyo|35.68|139.69
Jordan|Amman|31.95|35.93
Kazakhstan|Astana|51.17|71.43
Kenya|Nairobi|-1.29|36.82
Kiribati|Tarawa|1.45|173.03
Kosovo|Pristina|42.66|21.17
Kuwait|Kuwait City|29.38|47.99
Kyrgyzstan|Bishkek|42.87|74.59
Laos|Vientiane|17.97|102.63
Latvia|Riga|56.95|24.11
Lebanon|Beirut|33.89|35.5
Lesotho|Maseru|-29.31|27.48
Liberia|Monrovia|6.3|-10.8
Libya|Tripoli|32.89|13.19
Liechtenstein|Vaduz|47.14|9.52
Lithuania|Vilnius|54.69|25.28
Luxembourg|Luxembourg|49.61|6.13
Madagascar|Antananarivo|-18.88|47.51
Malawi|Lilongwe|-13.96|33.77
Malaysia|Kuala Lumpur|3.14|101.69
Maldives|Malé|4.18|73.51
Mali|Bamako|12.64|-8
Malta|Valletta|35.9|14.51
Marshall Islands|Majuro|7.09|171.38
Mauritania|Nouakchott|18.08|-15.98
Mauritius|Port Louis|-20.16|57.5
Mexico|Mexico City|19.43|-99.13
Micronesia|Palikir|6.92|158.16
Moldova|Chișinău|47.01|28.86
Monaco|Monaco|43.74|7.42
Mongolia|Ulaanbaatar|47.89|106.91
Montenegro|Podgorica|42.44|19.26
Morocco|Rabat|34.02|-6.84
Mozambique|Maputo|-25.97|32.57
Myanmar|Naypyidaw|19.76|96.08
Namibia|Windhoek|-22.56|17.08
Nauru|Yaren|-0.55|166.92
Nepal|Kathmandu|27.72|85.32
Netherlands|Amsterdam|52.37|4.9
New Zealand|Wellington|-41.29|174.78
Nicaragua|Managua|12.11|-86.24
Niger|Niamey|13.51|2.11
Nigeria|Abuja|9.08|7.4
North Korea|Pyongyang|39.04|125.76
North Macedonia|Skopje|41.99|21.43
Norway|Oslo|59.91|10.75
Oman|Muscat|23.59|58.41
Pakistan|Islamabad|33.69|73.06
Palau|Ngerulmud|7.5|134.62
Palestine|Ramallah|31.9|35.2
Panama|Panama City|8.98|-79.52
Papua New Guinea|Port Moresby|-9.44|147.18
Paraguay|Asunción|-25.26|-57.58
Peru|Lima|-12.05|-77.04
Philippines|Manila|14.6|120.98
Poland|Warsaw|52.23|21.01
Portugal|Lisbon|38.72|-9.14
Qatar|Doha|25.29|51.53
Romania|Bucharest|44.43|26.1
Russia|Moscow|55.76|37.62
Rwanda|Kigali|-1.95|30.06
Saint Kitts and Nevis|Basseterre|17.3|-62.72
Saint Lucia|Castries|14.01|-60.99
Saint Vincent and the Grenadines|Kingstown|13.16|-61.22
Samoa|Apia|-13.83|-171.76
San Marino|San Marino|43.94|12.45
São Tomé and Príncipe|São Tomé|0.34|6.73
Saudi Arabia|Riyadh|24.71|46.68
Senegal|Dakar|14.72|-17.47
Serbia|Belgrade|44.79|20.45
Seychelles|Victoria|-4.62|55.45
Sierra Leone|Freetown|8.48|-13.23
Singapore|Singapore|1.35|103.82
Slovakia|Bratislava|48.15|17.11
Slovenia|Ljubljana|46.06|14.51
Solomon Islands|Honiara|-9.43|159.95
Somalia|Mogadishu|2.05|45.32
South Africa|Pretoria|-25.75|28.19
South Korea|Seoul|37.57|126.98
South Sudan|Juba|4.85|31.58
Spain|Madrid|40.42|-3.7
Sri Lanka|Sri Jayawardenepura Kotte|6.89|79.92
Sudan|Khartoum|15.5|32.56
Suriname|Paramaribo|5.85|-55.2
Sweden|Stockholm|59.33|18.07
Switzerland|Bern|46.95|7.45
Syria|Damascus|33.51|36.28
Taiwan|Taipei|25.03|121.57
Tajikistan|Dushanbe|38.56|68.77
Tanzania|Dodoma|-6.16|35.75
Thailand|Bangkok|13.76|100.5
Timor-Leste|Dili|-8.56|125.57
Togo|Lomé|6.13|1.22
Tonga|Nuku'alofa|-21.14|-175.2
Trinidad and Tobago|Port of Spain|10.66|-61.52
Tunisia|Tunis|36.81|10.18
Türkiye|Ankara|39.93|32.86
Turkmenistan|Ashgabat|37.96|58.33
Tuvalu|Funafuti|-8.52|179.2
Uganda|Kampala|0.35|32.58
Ukraine|Kyiv|50.45|30.52
United Arab Emirates|Abu Dhabi|24.45|54.38
United Kingdom|London|51.51|-0.13
United States|Washington, D.C.|38.91|-77.04
Uruguay|Montevideo|-34.9|-56.16
Uzbekistan|Tashkent|41.3|69.24
Vanuatu|Port Vila|-17.73|168.32
Vatican City|Vatican City|41.9|12.45
Venezuela|Caracas|10.48|-66.9
Vietnam|Hanoi|21.03|105.85
Yemen|Sana'a|15.37|44.19
Zambia|Lusaka|-15.39|28.32
Zimbabwe|Harare|-17.83|31.05`.split('\n').map(l=>{const a=l.split('|');return[a[0],a[1],+a[2],+a[3]]});
const WF={city:null,u:'c',hn:7,d:null,srch:false,res:[],ex:{},busy:0};
try{const c=JSON.parse(localStorage.getItem('sk_wc')||'null');if(c&&c.lat!=null&&c.lon!=null)WF.city=c;WF.u=localStorage.getItem('sk_wu')==='f'?'f':'c'}catch(e){}
function wfKind(c){if(c===0||c===1)return'clear';if(c===2)return'partly';if(c===3)return'cloud';if(c===45||c===48)return'fog';if(c>=51&&c<=57)return'drizzle';if(c===65||c===82||c===67)return'heavy';if((c>=61&&c<=66)||c===80||c===81)return'rain';if((c>=71&&c<=77)||c===85||c===86)return'snow';if(c>=95)return'thunder';return'cloud'}
function wfCond(c){return({0:'Clear skies',1:'Mostly clear',2:'Partly cloudy',3:'Cloudy',45:'Fog',48:'Freezing fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',56:'Freezing drizzle',57:'Freezing drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',66:'Freezing rain',67:'Freezing rain',71:'Light snow',73:'Snow',75:'Heavy snow',77:'Snow grains',80:'Light showers',81:'Showers',82:'Heavy showers',85:'Snow showers',86:'Heavy snow showers',95:'Thunderstorms',96:'Thunderstorms with hail',99:'Thunderstorms with hail'})[c]||'Cloudy'}
function wfNoun(c){const k=wfKind(c);return k==='drizzle'?'drizzle':(k==='rain'||k==='heavy')?(c>=80&&c<=82?'showers':'rain'):k==='snow'?'snow':k==='thunder'?'thunderstorms':''}
function wfIcon(code,day,sz,dk){
 const cl=dk?'#8296b2':'#a2abb6',cd=dk?'#667c99':'#7c8691',bl='#4a90d9',sun='#f4c430',mo=dk?'#cdd8e9':'#b3bbc7',k=wfKind(code),
 cloud=(x,y,s,f)=>`<g transform="translate(${x} ${y}) scale(${s})" fill="${f}"><circle cx="20" cy="30" r="10"/><circle cx="32" cy="24" r="13"/><circle cx="45" cy="31" r="9"/><rect x="11" y="30" width="43" height="10" rx="5"/></g>`,
 sunS=(x,y,r)=>{let g=`<circle cx="${x}" cy="${y}" r="${r}" fill="${sun}"/>`;for(let i=0;i<8;i++){const a=i*Math.PI/4,x1=x+Math.cos(a)*(r+3),y1=y+Math.sin(a)*(r+3),x2=x+Math.cos(a)*(r+7),y2=y+Math.sin(a)*(r+7);g+=`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${sun}" stroke-width="2.6" stroke-linecap="round"/>`}return g},
 moon=(x,y,s)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M30 4a22 22 0 1 0 22 30 17 17 0 0 1-22-30z" fill="${mo}"/>`;
 let g='';
 if(k==='clear')g=day?sunS(32,32,12):moon(6,8,1);
 else if(k==='partly')g=(day?sunS(23,22,8):moon(0,0,.6))+cloud(8,14,.92,cl);
 else if(k==='cloud')g=cloud(-2,0,.78,dk?'#6f84a2':'#c3c9d2')+cloud(8,9,.95,cl);
 else if(k==='fog')g=cloud(6,0,.95,cl)+`<path d="M13 47h38M18 54h28" stroke="${cl}" stroke-width="3" stroke-linecap="round"/>`;
 else if(k==='drizzle')g=cloud(6,0,.95,cd)+[[20,50],[32,53],[44,50],[26,59],[38,59]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="1.9" fill="${bl}"/>`).join('');
 else if(k==='rain')g=cloud(6,0,.95,cd)+`<path d="M21 46l-3 8M31 46l-3 8M41 46l-3 8M26 55l-2 6M36 55l-2 6M46 55l-2 6" stroke="${bl}" stroke-width="2.6" stroke-linecap="round"/>`;
 else if(k==='heavy')g=cloud(6,-2,.95,dk?'#566b88':'#626c78')+`<path d="M19 43l-3 9M27 43l-3 9M35 43l-3 9M43 43l-3 9M23 53l-3 8M31 53l-3 8M39 53l-3 8M47 53l-3 8" stroke="${bl}" stroke-width="2.8" stroke-linecap="round"/>`;
 else if(k==='snow')g=cloud(6,0,.95,cd)+[[20,50],[32,52],[44,50],[26,58],[38,58]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="2.6" fill="${dk?'#dbe8f7':'#8db4dc'}"/>`).join('');
 else g=cloud(6,-2,.95,dk?'#566b88':'#626c78')+`<path d="M35 37l-9 13h6l-4 11 13-15h-7z" fill="${sun}"/>`;
 return `<svg class="wfi" viewBox="0 0 64 64" width="${sz}" height="${sz}" aria-hidden="true" focusable="false">${g}</svg>`}
const wfDrop='<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false"><path d="M7 2C5 5 3.2 7 3.2 9.5a3.8 3.8 0 0 0 7.6 0C10.8 7 9 5 7 2zM14 8c-1.3 2-2.3 3.2-2.3 4.7a2.3 2.3 0 0 0 4.6 0C16.3 11.2 15.3 10 14 8z" fill="currentColor"/></svg>';
function wfT(t){const v=WF.u==='f'?t*9/5+32:t;return Math.round(v)}
function wfHr(iso){const h=+iso.slice(11,13);return (h%12||12)+' '+(h<12?'am':'pm')}
function wfAP(iso){const M=['Jan.','Feb.','March','April','May','June','July','Aug.','Sept.','Oct.','Nov.','Dec.'],h=+iso.slice(11,13),m=iso.slice(14,16);return M[+iso.slice(5,7)-1]+' '+(+iso.slice(8,10))+' at '+(h%12||12)+':'+m+' '+(h<12?'a.m.':'p.m.')+' local time'}
function wfWhen(h){return h>=5&&h<12?'in the morning':h>=12&&h<17?'this afternoon':h>=17&&h<21?'this evening':'tonight'}
function wfWind(w){return w<6?'calm':w<20?'gentle breeze':w<39?'a strong breeze':'strong winds'}
function wfMini(){const d=WF.d,c=WF.city||{n:'Kathmandu'};if(!d)return `<a class="wfmc" href="/weather"><span class="wfmt">Weather · <b>${esc(c.n)}</b></span><span class="wfmn">Loading the forecast…</span></a>`;const cur=d.current,D=d.daily,day=cur.is_day===1,u=WF.u==='f'?'°F':'°C';return `<a class="wfmc" href="/weather"><span class="wfmi">${wfIcon(cur.weather_code,day,56,1)}</span><span class="wfmt">Weather · <b>${esc(c.n)}</b></span><span class="wfmn">${wfT(cur.temperature_2m)}${u}</span><span class="wfms">${wfCond(cur.weather_code)} · High ${wfT(D.temperature_2m_max[0])}° · Low ${wfT(D.temperature_2m_min[0])}°</span><span class="wfmg">Full forecast →</span></a>`}
function wfHtml(){
 if(WF.mini)return wfMini();
 const d=WF.d,c=WF.city||{n:'Kathmandu'};
 if(!d)return`<section class="wfh"><div class="wfhh"><span>Weather for <b>${esc(c.n)}</b></span></div><div class="wfm"><h1>Loading the forecast…</h1></div></section>`;
 const cur=d.current,H=d.hourly,D=d.daily,nowH=cur.time.slice(0,13)+':00';let i0=H.time.findIndex(t=>t>=nowH);if(i0<0)i0=0;
 const day=cur.is_day===1,t0=wfT(cur.temperature_2m),lo=wfT(D.temperature_2m_min[0]),hi=wfT(D.temperature_2m_max[0]),
  cond=wfCond(cur.weather_code),sent=cond+(/(Clear|Fog|Cloud|Overcast)/i.test(cond)||true?' and '+wfWind(cur.wind_speed_10m):'');
 /* next 12 hours */
 const win=[];for(let i=i0;i<Math.min(i0+12,H.time.length);i++)win.push(i);
 let mx=0,mi=win[0];win.forEach(i=>{if((H.precipitation_probability[i]||0)>mx){mx=H.precipitation_probability[i];mi=i}});
 const nn=wfNoun(H.weather_code[mi])||'rain',Nn=nn.charAt(0).toUpperCase()+nn.slice(1),wet=win.filter(i=>(H.precipitation_probability[i]||0)>=50).length,w=wfWhen(+H.time[mi].slice(11,13));
 let s1=mx>=70?`${Nn} is very likely ${w}.`:mx>=40?`${Nn} is possible ${w}.`:'No significant rain is expected in the next 12 hours.',s2='';
 if(mx>=40&&wet>=4)s2=' Wet conditions will continue for several hours.';
 else{const tl=Math.min(...win.map(i=>H.temperature_2m[i]));if(cur.temperature_2m-tl>=4){const ti=win.find(i=>H.temperature_2m[i]===tl);s2=` Temperatures will fall to ${wfT(tl)}° by ${wfHr(H.time[ti])}.`}}
 /* advisory from the next 3 days */
 let adv=null;const n3=Math.min(3,D.time.length);
 for(let i=0;i<n3&&!adv;i++){const c=D.weather_code[i],mxT=D.temperature_2m_max[i],mnT=D.temperature_2m_min[i];
  if(c>=95)adv=['thunderstorms','Thunderstorms are likely and could bring lightning, strong gusts and heavy rain. Stay indoors during storms.',i];
  else if(c===65||c===82||c===67)adv=['heavy rain','Heavy rain is likely and could cause local flooding or landslides in hilly areas. Take care near rivers and steep slopes.',i];
  else if(c===75||c===86)adv=['heavy snow','Heavy snow is likely and could make travel difficult at higher altitudes.',i];
  else if(mxT>=38)adv=['extreme heat','Very high temperatures are expected. Drink water, avoid midday sun and check on older people.',i];
  else if(mnT<=-5)adv=['severe cold','Very low temperatures are expected. Dress warmly and protect pipes and plants.',i]}
 const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],dn=iso=>DN[new Date(iso+'T00:00:00Z').getUTCDay()],
  last=adv?n3-1:0;
 let h=`<section class="wfh"><div class="wfhh"><span>Weather for <b>${esc(c.n)}</b></span><button class="wfc" type="button" data-act="srch" aria-label="Search for a city" aria-expanded="${WF.srch}"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15 15l6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button><button class="wfc" type="button" data-act="loc" aria-label="Use my location"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button></div>`;
 if(WF.srch)h+=`<div class="wfsb"><input type="search" id="wfq" placeholder="Search for a city" aria-label="Search for a city" autocomplete="off" autocapitalize="words"><ul id="wfr">${WF.res.map((r,i)=>`<li><button type="button" data-act="pick" data-i="${i}">${esc(r.n)}<small>${esc(r.a)}</small></button></li>`).join('')}</ul></div>`;
 h+=`<div class="wfm"><h1><b>It is ${t0}° right now.</b> ${esc(sent)}.</h1><div class="wfhi">${wfIcon(cur.weather_code,day,124,1)}</div></div><p class="wflh">Low: ${lo}° <i></i> High: <b>${hi}°</b></p>
 <div class="wfsm">${wfIcon(H.weather_code[mi],H.is_day[mi]===1,74,1)}<div><p>${esc(s1+s2)}</p><small>Updated ${wfAP(cur.time)}</small></div></div></section>`;
 if(adv)h+=`<details class="wfal"><summary><i></i><span>Risk of <b>${adv[0]}</b></span></summary><div><p><i></i><span><b>${adv[0].charAt(0).toUpperCase()+adv[0].slice(1)}</b> ${esc(adv[1])}</span></p><small>Through ${dn(D.time[last])} night</small><small class="wfnt">Forecast-based note, not an official warning. Check the Department of Hydrology and Meteorology (dhm.gov.np) for official alerts.</small></div></details>`;
 const un=(a)=>`<div class="wfu" role="group" aria-label="Temperature unit"><button type="button" data-act="u" data-v="f"${WF.u==='f'?' class="on" aria-pressed="true"':' aria-pressed="false"'}>F°</button><button type="button" data-act="u" data-v="c"${WF.u==='c'?' class="on" aria-pressed="true"':' aria-pressed="false"'}>C°</button></div>`;
 h+=`<div class="wfgrid"><section class="wfs"><div class="wfsh"><h2>Hourly forecast</h2>${un()}</div><ul class="wfhr">`;
 const hn=Math.min(WF.hn,H.time.length-i0);
 for(let k=0;k<hn;k++){const i=i0+k,p=H.precipitation_probability[i]||0,cd=H.weather_code[i],kd=wfKind(cd),precip=['drizzle','rain','heavy','snow','thunder'].includes(kd);
  let tx;if(precip){const nn2=wfNoun(cd),cc=wfCond(cd);tx=p>=80?cc:p>=60?cc+' is likely':'Chance of '+nn2}else tx=p>=50?'Chance of rain':wfCond(cd);
  h+=`<li${k>=hn-1&&hn<H.time.length-i0&&WF.hn<48?' class="wff"':''}><span class="wft">${wfHr(H.time[i])}</span><b class="wfd">${wfT(H.temperature_2m[i])}°</b>${wfIcon(cd,H.is_day[i]===1,38,0)}<span class="wfx">${esc(tx)}</span><span class="wfpc">${p>=10||precip?wfDrop+p+'%':''}</span></li>`}
 h+=`</ul>${WF.hn<48?`<button class="wfmore" type="button" data-act="more">Show more</button>`:''}</section>`;
 const lows=D.temperature_2m_min,highs=D.temperature_2m_max,gmin=Math.min(...lows),gmax=Math.max(...highs),span=Math.max(1,gmax-gmin);
 h+=`<section class="wfs"><div class="wfsh"><h2>Daily forecast</h2>${un()}</div><ul class="wfdl">`;
 for(let i=0;i<D.time.length;i++){const sv=D.weather_code[i]>=95||D.weather_code[i]===65||D.weather_code[i]===82||D.weather_code[i]===75,l=(lows[i]-gmin)/span*100,wd=Math.max(14,(highs[i]-lows[i])/span*100),p=D.precipitation_probability_max[i]||0,open=WF.ex[i];
  h+=`<li><button type="button" class="wfdr" data-act="day" data-i="${i}" aria-expanded="${open?'true':'false'}"><span class="wfdn">${i===0?'Today':dn(D.time[i])}</span><span class="wfdi">${sv?'<em class="wfwarn" title="Severe weather risk"></em>':''}${wfIcon(D.weather_code[i],true,38,0)}</span><span class="wfl">${wfT(lows[i])}°</span><span class="wfbar"><i style="left:${Math.min(l,100-wd).toFixed(1)}%;width:${wd.toFixed(1)}%"></i></span><b class="wfhh2">${wfT(highs[i])}°</b><span class="wfpc">${p>=10?wfDrop+p+'%':''}</span><svg class="wfch" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M4 7l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>${open?`<div class="wfdd"><p>${esc(wfCond(D.weather_code[i]))}. High ${wfT(highs[i])}°, low ${wfT(lows[i])}°.${p?' Chance of precipitation '+p+'%.':''}</p><p>Sunrise ${wfHr(D.sunrise[i]).replace(/^(\d+)/,'$1:'+D.sunrise[i].slice(14,16))} · Sunset ${wfHr(D.sunset[i]).replace(/^(\d+)/,'$1:'+D.sunset[i].slice(14,16))}</p></div>`:''}</li>`}
 h+=`</ul></section></div><section class="wfn"><h3>Notes</h3><p>Tap the plus sign to use your phone's location. Your place is only saved on this device.</p><details><summary>About the data</summary><p>Forecasts come from Open-Meteo.com (data licensed CC BY 4.0), which combines national weather models, and are refreshed about every 15 minutes. Chances of precipitation are the model's probability for each hour. Forecasts can change quickly, especially in the mountains.</p></details><details><summary>Credits</summary><p>Weather data: Open-Meteo.com. Weather pictures drawn for The Sujan Khadka.</p></details><h3>More forecasts</h3><ul class="wfmf">${WF_CITIES.map((x,i)=>`<li><button type="button" data-act="city" data-i="${i}">${esc(x[0])} <span aria-hidden="true">›</span></button></li>`).join('')}</ul><h3>Abroad</h3><ul class="wfmf">${WF_ABROAD.map((x,i)=>`<li><button type="button" data-act="abr" data-i="${i}">${esc(x[0])} <span aria-hidden="true">›</span></button></li>`).join('')}</ul><details class="wfcap"><summary>Capital cities of all countries</summary><input type="search" id="wfcf" placeholder="Filter by country or city" aria-label="Filter capital cities" autocomplete="off"><ul class="wfmf wfcl" id="wfcl">${WF_CAPS.map((x,i)=>`<li><button type="button" data-act="cap" data-i="${i}"><b>${esc(x[1])}</b><span>${esc(x[0])}</span></button></li>`).join('')}</ul></details></section>`;
 return h}
function wfPg(){WF.mini=false;document.title='Weather — The Sujan Khadka';return `<div class="wfp" id="wfp">${wfHtml()}</div>`}
function wfSet(c){WF.city=c;WF.d=null;WF.hn=7;WF.ex={};WF.srch=false;try{localStorage.setItem('sk_wc',JSON.stringify(c))}catch(e){}wfDraw();wfLoad()}
function wfDraw(){const el=document.getElementById('wfp');if(el)el.innerHTML=wfHtml()}
async function wfLoad(){
 const el=document.getElementById('wfp');if(!el)return;
 if(!WF.city){let c=null;try{const g=await(await fetch('/api/geo')).json();if(g&&g.lat!=null&&g.lon!=null&&!isNaN(+g.lat))c={n:g.city||g.region||g.country||'Your area',lat:+g.lat,lon:+g.lon}}catch(e){}WF.city=c||{n:'Kathmandu',lat:27.7172,lon:85.324}}
 const c=WF.city,key='sk_wd_'+c.lat.toFixed(2)+'_'+c.lon.toFixed(2);let d=null;
 try{const o=JSON.parse(sessionStorage.getItem(key)||'null');if(o&&Date.now()-o.t<6e5)d=o.d}catch(e){}
 if(!d){const my=++WF.busy;try{const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+c.lat+'&longitude='+c.lon+'&current=temperature_2m,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,precipitation_probability,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=auto&forecast_days=7&wind_speed_unit=kmh');if(!r.ok)throw 0;d=await r.json();if(!d.current||!d.hourly||!d.daily)throw 0;try{sessionStorage.setItem(key,JSON.stringify({t:Date.now(),d}))}catch(e){}if(my!==WF.busy)return}
  catch(e){const p=document.getElementById('wfp');if(p&&WF.mini)p.innerHTML=`<a class="wfmc" href="/weather"><span class="wfmt">Weather · <b>${esc(c.n)}</b></span><span class="wfms">Tap to open the forecast</span></a>`;else if(p)p.innerHTML=`<section class="wfh"><div class="wfhh"><span>Weather for <b>${esc(c.n)}</b></span></div><div class="wfm"><h1>The forecast could not be loaded.</h1></div><p class="wflh"><button class="wfmore" style="color:#fff" type="button" data-act="retry">Try again</button></p></section>`;return}}
 WF.d=d;wfDraw()}
let wfTm=0;
function wfInit(){const el=document.getElementById('wfp');if(!el)return;
 el.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,i=+b.dataset.i;
  if(a==='u'){WF.u=b.dataset.v;try{localStorage.setItem('sk_wu',WF.u)}catch(x){}wfDraw()}
  else if(a==='more'){WF.hn=Math.min(48,WF.hn+12);wfDraw()}
  else if(a==='day'){WF.ex[i]=!WF.ex[i];wfDraw()}
  else if(a==='srch'){WF.srch=!WF.srch;WF.res=[];wfDraw();const q=document.getElementById('wfq');if(q)q.focus()}
  else if(a==='pick'){const r=WF.res[i];if(r)wfSet({n:r.n,lat:r.lat,lon:r.lon})}
  else if(a==='city'){const x=WF_CITIES[i];wfSet({n:x[0],lat:x[1],lon:x[2]});scrollTo(0,0)}
  else if(a==='cap'){const x=WF_CAPS[i];wfSet({n:x[1],lat:x[2],lon:x[3]});scrollTo(0,0)}
  else if(a==='abr'){const x=WF_ABROAD[i];wfSet({n:x[0],lat:x[1],lon:x[2]});scrollTo(0,0)}
  else if(a==='retry'){wfLoad()}
  else if(a==='loc'){if(!navigator.geolocation){alert('Your browser cannot share its location.');return}navigator.geolocation.getCurrentPosition(p=>wfSet({n:'Your location',lat:+p.coords.latitude.toFixed(3),lon:+p.coords.longitude.toFixed(3)}),()=>alert('Location permission was not given.'),{timeout:12000,maximumAge:600000})}});
 el.addEventListener('input',e=>{if(e.target.id==='wfcf'){const q=e.target.value.trim().toLowerCase();document.querySelectorAll('#wfcl li').forEach(li=>{li.hidden=q&&!li.textContent.toLowerCase().includes(q)});return}if(e.target.id!=='wfq')return;const q=e.target.value.trim();clearTimeout(wfTm);if(q.length<2){WF.res=[];const u=document.getElementById('wfr');if(u)u.innerHTML='';return}
  wfTm=setTimeout(async()=>{try{const j=await(await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(q)+'&count=6&language=en&format=json')).json();WF.res=(j.results||[]).map(r=>({n:r.name,a:[r.admin1,r.country].filter(Boolean).join(', '),lat:+r.latitude.toFixed(3),lon:+r.longitude.toFixed(3)}));const u=document.getElementById('wfr');if(u)u.innerHTML=WF.res.map((r,i)=>`<li><button type="button" data-act="pick" data-i="${i}">${esc(r.n)}<small>${esc(r.a)}</small></button></li>`).join('')}catch(x){}},300)});
 wfLoad()}

/* ---------- Daily horoscope: real Moon/Sun astronomy + daily readings ---------- */
const HZ=[
 {k:'aries',n:'Aries',g:'♈\uFE0E',ne:'मेष',nr:'Mesh',d:'Mar 21 – Apr 19',el:'Fire',ru:'Mars'},
 {k:'taurus',n:'Taurus',g:'♉\uFE0E',ne:'वृष',nr:'Brish',d:'Apr 20 – May 20',el:'Earth',ru:'Venus'},
 {k:'gemini',n:'Gemini',g:'♊\uFE0E',ne:'मिथुन',nr:'Mithun',d:'May 21 – Jun 20',el:'Air',ru:'Mercury'},
 {k:'cancer',n:'Cancer',g:'♋\uFE0E',ne:'कर्कट',nr:'Karkat',d:'Jun 21 – Jul 22',el:'Water',ru:'the Moon'},
 {k:'leo',n:'Leo',g:'♌\uFE0E',ne:'सिंह',nr:'Simha',d:'Jul 23 – Aug 22',el:'Fire',ru:'the Sun'},
 {k:'virgo',n:'Virgo',g:'♍\uFE0E',ne:'कन्या',nr:'Kanya',d:'Aug 23 – Sep 22',el:'Earth',ru:'Mercury'},
 {k:'libra',n:'Libra',g:'♎\uFE0E',ne:'तुला',nr:'Tula',d:'Sep 23 – Oct 22',el:'Air',ru:'Venus'},
 {k:'scorpio',n:'Scorpio',g:'♏\uFE0E',ne:'वृश्चिक',nr:'Brischik',d:'Oct 23 – Nov 21',el:'Water',ru:'Mars'},
 {k:'sagittarius',n:'Sagittarius',g:'♐\uFE0E',ne:'धनु',nr:'Dhanu',d:'Nov 22 – Dec 21',el:'Fire',ru:'Jupiter'},
 {k:'capricorn',n:'Capricorn',g:'♑\uFE0E',ne:'मकर',nr:'Makar',d:'Dec 22 – Jan 19',el:'Earth',ru:'Saturn'},
 {k:'aquarius',n:'Aquarius',g:'♒\uFE0E',ne:'कुम्भ',nr:'Kumbha',d:'Jan 20 – Feb 18',el:'Air',ru:'Saturn'},
 {k:'pisces',n:'Pisces',g:'♓\uFE0E',ne:'मीन',nr:'Meen',d:'Feb 19 – Mar 20',el:'Water',ru:'Jupiter'}];
const HZB={
 moon:{
  Fire:['motivation is strong and it is easy to start the things you have been putting off.','energy runs high, so put it into one clear goal rather than many small ones.','confidence is up, and your enthusiasm can lift the people around you.','you may feel an urge to act, and bold but thoughtful steps are favoured.','the mood is lively, and a spontaneous plan could turn out better than expected.'],
  Earth:['the mood is steady and practical, which suits finishing tasks and sorting out details.','slow, careful progress works better than rushing, so take things one step at a time.','routine feels supportive, and small improvements at home or at work add up.','it is a good day to plan your money, your time and your priorities sensibly.','patience is your strength, and what you build today has a chance to last.'],
  Air:['conversation and ideas flow easily, so reach out to someone you have been meaning to contact.','your mind is quick and curious, which helps with learning, writing and decisions.','a short message or a friendly chat could bring a useful new viewpoint.','variety helps today, so mix up your routine and stay open to new information.','listening carefully is as valuable as speaking, and it may reveal something helpful.'],
  Water:['feelings run deeper than usual, and your intuition is worth listening to.','emotions are close to the surface, so be gentle with yourself and with others.','quiet time and kind words help, and a creative or reflective activity restores balance.','you may pick up on the moods around you, which makes it a good day for care and understanding.','trust your instincts, but give strong feelings a little time before acting on them.']},
 sign:['Your natural drive helps you take the lead where others hesitate.','Your patience is an advantage, and slow, steady steps win out.','Your curiosity opens a useful door, so ask the extra question.','Trust the instincts that usually protect the people around you.','Your warmth draws attention, so use it to encourage someone else.','Small details matter, and your careful eye catches what others miss.','A calm, fair approach settles something that felt uneven.','Your focus is intense, so aim it at one goal rather than many.','Your optimism is contagious, and a new idea deserves a trial.','Discipline pays off, so keep your long-term goal in view.','An original thought sets you apart, so share it with the right person.','Your imagination is strong, so give it a creative outlet.'],
 advice:['Take a short walk before any big decision.','Drink enough water and keep your day simple.','Write down your top three tasks and start with the hardest.','Say thank you to someone who helped you recently.','Avoid arguing over small things; they pass quickly.','Spend a few minutes away from your phone.','Save a little today, even a small amount.','Check your plans twice before sending important messages.','Spend time with someone who makes you feel at ease.','Finish one unfinished job before you start another.','Keep your voice calm if a conversation becomes tense.','Learn one new thing, however small.','Tidy your workspace to clear your mind.','Be kind to yourself if things move slower than you hoped.','Get some fresh air and sunlight if you can.','End the day by noting one thing that went well.'],
 love:{
  hi:['Warm, open conversation brings you closer to someone special, and small gestures mean a lot.','A friendly mood makes it easy to connect, and a kind message could brighten someone\u2019s day.','Relationships feel supportive, so share your appreciation openly.','If you are single, a relaxed chat with someone new may be pleasantly surprising.','Family and loved ones respond well to your patience and humour today.','Honest words said gently help a close bond grow stronger.','Time spent together, even over a simple meal, strengthens an important connection.','Your caring side shows, and others notice and appreciate it.'],
  mid:['Relationships are steady today, and listening more than you talk keeps things smooth.','A quiet day for love, so enjoy simple company without expecting much.','Small misunderstandings are possible, so ask before you assume.','Spend a little time with those you care about, even by phone.','Keep expectations realistic and let conversations develop at their own pace.','Be clear about what you need and equally open to what others need.','A calm evening with family or friends helps you recharge.','Patience with a loved one\u2019s mood will be appreciated.'],
  lo:['Take extra care with your tone today, as tired moods can make small things seem bigger.','It may be best to postpone sensitive conversations until you feel more settled.','Give people some space, and avoid taking passing remarks personally.','Focus on self-care first, because a calmer mind makes relationships easier.','Avoid comparing your situation with others and be patient with yourself.','If tension appears, pause, breathe and respond slowly.','Choose gentle words, and keep important talks for another day if needed.','A kind gesture, even a small one, can soften a difficult moment.']},
 career:{
  hi:['Work or study goes well, and your effort is likely to be noticed by the right people.','A clear plan helps you make real progress, and colleagues respond well to your ideas.','It is a good day to start a new task, ask a question or present your thoughts.','Focus and confidence help you finish something important ahead of time.','Teamwork pays off, so share credit and keep communication open.','A useful chance to learn or earn may appear, so stay alert and prepared.','Your skills are valued today, so speak up about what you can offer.','Good planning with money or time brings a sense of progress.'],
  mid:['A steady day at work: complete routine tasks first and keep a simple list.','Progress is gradual, so avoid rushing and double-check important details.','Stay organised, and keep your promises to colleagues and teachers.','Review your goals for the week and adjust where needed.','Spend carefully today and avoid unplanned purchases.','Ask for clarity if instructions seem unclear instead of guessing.','Use quieter moments to learn something that helps your future plans.','Calm, consistent effort is better than a burst of energy.'],
  lo:['Take your time with important decisions, and avoid committing in a hurry.','Delays are possible, so allow extra time and keep a flexible plan.','Double-check figures, messages and deadlines before you submit anything.','Keep spending modest today and postpone large purchases if you can.','Do not take criticism personally; treat it as information you can use.','Focus on one task at a time rather than trying to do everything at once.','If work feels heavy, break it into small steps and begin with the easiest.','Rest and preparation today will help you perform better tomorrow.']},
 health:{
  hi:['Energy and mood are good, so a walk, stretching or light exercise will feel rewarding.','You feel more positive than usual, so keep up healthy habits and regular meals.','A good day to start a small healthy routine, such as drinking more water or sleeping on time.','Fresh air and sunlight lift your spirits and sharpen your focus.','Your mind feels clear, which makes it a good time for planning and learning.','Cheerful company and a little laughter do you good today.','Balanced meals and steady movement keep your energy even through the day.','Your motivation for self-care is strong, so make the most of it.'],
  mid:['Energy is steady, so keep to regular meals and a normal routine.','Short breaks between tasks help you stay fresh and focused.','Listen to your body, and rest if you feel tired rather than pushing on.','A gentle walk or a few minutes of stretching will help you relax.','Keep your screen time moderate and give your eyes a rest.','Eat simple, light food and drink enough water.','Take a few slow breaths whenever the day feels busy.','Good sleep tonight will help you feel better tomorrow.'],
  lo:['Energy may dip, so rest when you need to and do not take on too much.','Take things slowly and avoid heavy meals late in the evening.','Stress can build up quietly, so take short pauses and breathe deeply.','Try to sleep early tonight, and keep your phone away from the bed.','Light exercise and fresh air will help more than pushing through tiredness.','Drink plenty of water and avoid skipping meals.','Be gentle with yourself, because a quiet evening may be the best medicine.','If you feel unwell for more than a day or two, consider seeing a doctor.']}};
const HZC=[['Crimson','#c0392b'],['Saffron','#f39c12'],['Emerald','#1e8449'],['Sky blue','#3498db'],['Royal purple','#6c3483'],['Pearl white','#ecf0f1'],['Gold','#d4ac0d'],['Teal','#16a085'],['Rose pink','#e8788f'],['Indigo','#34459e'],['Ivory','#f5ecd0'],['Turquoise','#1abc9c']];
const HZT=['6:30 AM','8:15 AM','10:30 AM','12:45 PM','3:20 PM','5:40 PM','7:10 PM','9:00 PM'];
const HZM=['Confident','Curious','Calm','Focused','Hopeful','Bold','Creative','Patient','Cheerful','Thoughtful','Energetic','Grounded','Playful','Determined','Open-minded','Reflective','Warm','Steady','Adventurous','Balanced'];
/* astronomy: Sun (apparent) and Moon (Meeus ch.47, 59 terms) – checked against known new/full moon times to about 2 minutes */
const hzRad=Math.PI/180,hzN=x=>((x%360)+360)%360,hzJD=d=>d.getTime()/864e5+2440587.5;
function sunLon(j){const T=(j-2451545)/36525,L0=280.46646+36000.76983*T+.0003032*T*T,M=357.52911+35999.05029*T-.0001537*T*T,
 C=(1.914602-.004817*T-.000014*T*T)*Math.sin(M*hzRad)+(.019993-.000101*T)*Math.sin(2*M*hzRad)+.000289*Math.sin(3*M*hzRad);
 return hzN(L0+C-.00569-.00478*Math.sin((125.04-1934.136*T)*hzRad))}
const HS_ML=[[0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],[0,1,0,0,-185116],[0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],[2,0,1,0,53322],[2,-1,0,0,45758],[0,1,-1,0,-40923],[1,0,0,0,-34720],[0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],[0,0,1,-2,10980],[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],[2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],[2,0,2,0,3994],[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],[2,0,-1,2,-2602],[2,-1,-2,0,2390],[1,0,1,0,-2348],[2,-2,0,0,2236],[0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],[2,0,1,-2,-1773],[2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],[2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],[2,1,-2,0,691],[2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],[4,-1,0,0,520],[1,0,-2,0,-487],[2,1,0,-2,-399],[0,0,2,-2,-381],[1,1,1,0,351],[3,0,-2,0,-340],[4,0,-3,0,330],[2,-1,2,0,327],[0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294]];
function moonLon(j){const T=(j-2451545)/36525,r=hzRad,Lp=hzN(218.3164477+481267.88123421*T-.0015786*T*T),D=hzN(297.8501921+445267.1114034*T-.0018819*T*T),M=hzN(357.5291092+35999.0502909*T-.0001536*T*T),Mp=hzN(134.9633964+477198.8675055*T+.0087414*T*T),F=hzN(93.272095+483202.0175233*T-.0036539*T*T),E=1-.002516*T-.0000074*T*T;
 let t=0;for(const[d,m,mp,f,c]of HS_ML)t+=c*(Math.abs(m)===1?E:Math.abs(m)===2?E*E:1)*Math.sin((d*D+m*M+mp*Mp+f*F)*r);
 t+=3958*Math.sin((119.75+131.849*T)*r)+1962*Math.sin((Lp-F)*r)+318*Math.sin((53.09+479264.29*T)*r);
 return hzN(Lp+t/1e6-.00478*Math.sin((125.04-1934.136*T)*r))}
const hzElong=j=>hzN(moonLon(j)-sunLon(j));
const hzAyan=j=>23.853+.013969*((j-2451545)/365.25);                         /* Lahiri ayanamsa */
function hzVd(){try{const v=JSON.parse(localStorage.getItem('sk_zv')||'null');return v===null?true:!!v}catch(e){return true}}
const hzNm=i=>hzVd()?HZ[i].nr:HZ[i].n;
const HZVD=['Apr 14 – May 14','May 15 – Jun 14','Jun 15 – Jul 15','Jul 16 – Aug 16','Aug 17 – Sep 16','Sep 17 – Oct 16','Oct 17 – Nov 15','Nov 16 – Dec 15','Dec 16 – Jan 13','Jan 14 – Feb 12','Feb 13 – Mar 13','Mar 14 – Apr 13'];
const hzDt=i=>hzVd()?HZVD[i]:HZ[i].d;
const HZ_TITHI=['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi'],
 HZ_NAK=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
function hzPanch(j){const e=hzElong(j),t=Math.floor(e/12)+1,pk=t<=15?'Shukla':'Krishna',n=((t-1)%15)+1,tn=n===15?(t===15?'Purnima':'Amavasya'):HZ_TITHI[n-1];return pk==='Shukla'&&n===15?{t:'Purnima',nk:HZ_NAK[Math.floor(hzN(moonLon(j)-hzAyan(j))/(360/27))]}:{t:(n===15?tn:pk+' '+tn),nk:HZ_NAK[Math.floor(hzN(moonLon(j)-hzAyan(j))/(360/27))]}}
function hzMoonMove(){const v=hzVd(),f=t=>{const j=t/864e5+2440587.5;return Math.floor(hzN(moonLon(j)-(v?hzAyan(j):0))/30)};let t=Date.now();const s0=f(t),end=t+80*36e5;
 while(t<end){const n=t+20*6e4;if(f(n)!==s0){let a=t,b=n;for(let i=0;i<12;i++){const m=(a+b)/2;if(f(m)===s0)a=m;else b=m}return{t:new Date(b),to:f(b+6e4)}}t=n}return null}
const HZ_DAYRU=['the Sun','the Moon','Mars','Mercury','Jupiter','Venus','Saturn'],HZ_NUM={'Mars':9,'Venus':6,'Mercury':5,'the Moon':2,'the Sun':1,'Jupiter':3,'Saturn':8},
 HZ_WC=[['Orange','#f39c12'],['Pearl white','#ecf0f1'],['Crimson','#c0392b'],['Emerald','#1e8449'],['Golden yellow','#f1c40f'],['Rose pink','#e8788f'],['Midnight blue','#1b2a6b']],
 HZ_ORD=['','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];
/* classical Moon-transit rule: the Moon is favourable in the 1st, 3rd, 6th, 7th, 10th and 11th house counted from your sign */
const HH=[null,
 {o:4,l:4,c:4,m:3,h:4,mood:'Confident',sum:'The Moon is in your own sign, which usually brings a calm mind, good appetite and a warm, confident mood. People notice you today. Start a personal task you have been postponing, and keep your tone gentle in discussions.',lo:'Warm, open conversation brings you closer to someone.',ca:'Good for taking the lead on a task you own.',mo:'Money is steady, and small comforts are fine.',he:'Energy is good; rest if you feel emotionally tired.',dd:'Begin something personal',av:'Taking everything to heart'},
 {o:2,l:3,c:3,m:2,h:3,mood:'Careful',sum:'The Moon is in the second house from your sign, which tradition links with higher spending and careless words. Think twice before you speak or pay, and be patient with family and food matters.',lo:'Choose gentle words, because sharp remarks hurt more than you mean.',ca:'Double-check messages and numbers before you send them.',mo:'Expenses run high, so delay big purchases.',he:'Watch your eating habits and eye strain.',dd:'Count before you spend',av:'Harsh speech'},
 {o:4,l:3,c:4,m:4,h:4,mood:'Courageous',sum:'The Moon is in your third house, a supportive position linked with courage, effort that pays off and help from friends and siblings. A short trip, a call or a message can move something forward.',lo:'A friendly message opens a door.',ca:'Initiative and communication are rewarded.',mo:'Small gains come from your own effort.',he:'You feel active and strong; a walk will help.',dd:'Take the first step',av:'Waiting for others to move first'},
 {o:2,l:3,c:2,m:2,h:3,mood:'Restless',sum:'The Moon is in your fourth house, which tradition links with restlessness and a heavy mind at home. Your attention may drift, so keep routines simple and avoid arguments with family.',lo:'Home feels sensitive, so listen more than you explain.',ca:'Focus is low; do routine work first.',mo:'Avoid property and vehicle decisions today.',he:'Rest well and eat light food.',dd:'Keep the day simple',av:'Family arguments'},
 {o:2,l:3,c:2,m:3,h:3,mood:'Thoughtful',sum:'The Moon is in your fifth house, when thoughts may be scattered and decisions feel unclear. Creative work is fine, but avoid risks and speculation, and keep an eye on the needs of children and students.',lo:'Feelings are mixed, so do not rush into promises.',ca:'Study and plan, and leave final decisions for later.',mo:'Avoid gambling and risky bets.',he:'Your mind is busy; short breaks and sleep help.',dd:'Plan instead of gambling',av:'Quick decisions'},
 {o:4,l:3,c:4,m:4,h:4,mood:'Determined',sum:'The Moon is in your sixth house, a strong position for overcoming obstacles. Rivals and old problems lose their power, and health improves with a good routine. It is a day to finish pending work.',lo:'Clear up an old misunderstanding.',ca:'Pending work gets finished and competition is easier.',mo:'A good day to recover dues or pay off a small debt.',he:'Recovery is good, so start a healthy habit.',dd:'Finish what is pending',av:'Holding grudges'},
 {o:5,l:5,c:4,m:4,h:4,mood:'Sociable',sum:'The Moon is in your seventh house, one of the best positions for relationships and partnerships. Meetings go well, and you get cooperation from partners, clients and friends. Social plans bring happiness.',lo:'A very good day for love, marriage talks and reconciliation.',ca:'Partnerships and meetings succeed.',mo:'Gains come through cooperation or clients.',he:'A cheerful mood supports good health.',dd:'Meet people and agree on plans',av:'Doing everything alone'},
 {o:1,l:2,c:2,m:2,h:2,mood:'Cautious',sum:'The Moon is in your eighth house, traditionally the most testing position. Delays, sudden changes and a low mood are possible. Stay careful with travel, money and health, and avoid new risks.',lo:'Misunderstandings come easily, so stay patient.',ca:'Expect delays and extra checks; do not start something new.',mo:'Avoid lending, loans and investments.',he:'Be careful with travel, fire and sharp tools, and rest.',dd:'Stay careful and slow',av:'New risks'},
 {o:2,l:3,c:2,m:3,h:3,mood:'Patient',sum:'The Moon is in your ninth house, which tradition links with obstacles in plans and long journeys. Luck feels slower than usual. Prayer, learning and time with elders will steady you.',lo:'Distance or timing causes small problems.',ca:'Plans take longer, so be flexible.',mo:'Hold back from major spending.',he:'Avoid overwork and long travel if you can.',dd:'Ask advice from elders',av:'Long trips'},
 {o:5,l:3,c:5,m:4,h:4,mood:'Ambitious',sum:'The Moon is in your tenth house, a powerful position for career and reputation. Your efforts are noticed by seniors and the public. It is a very good day to take responsibility, present your work or make a career move.',lo:'Work success lifts your mood at home.',ca:'Excellent: recognition and progress.',mo:'Good income opportunities appear.',he:'You are strong, but do not skip meals.',dd:'Present your work',av:'Hiding your effort'},
 {o:5,l:4,c:4,m:5,h:4,mood:'Hopeful',sum:'The Moon is in your eleventh house, a position linked with gains and fulfilled wishes. Friends, networks and older relatives help you. Money, news or support you have been waiting for may arrive.',lo:'Friends bring good company and a social bond grows.',ca:'Networking and teamwork pay off.',mo:'Excellent for income and long-awaited payments.',he:'Good; enjoy time with friends.',dd:'Reach out to your network',av:'Ignoring offers of help'},
 {o:2,l:3,c:2,m:2,h:3,mood:'Reflective',sum:'The Moon is in your twelfth house, a quiet day linked with expenses, tiredness and a wish for solitude. Rest, prayer and charity suit it better than big new steps. Guard against waste and lost items.',lo:'Give space and keep conversations short.',ca:'Behind-the-scenes work is better than public moves.',mo:'Expenses rise, so track every payment.',he:'Sleep and rest are the priority.',dd:'Rest and help someone',av:'Waste and late nights'}];

function hzPhaseName(e){return e<6.5||e>=353.5?'New Moon':e<83.5?'Waxing Crescent':e<96.5?'First Quarter':e<173.5?'Waxing Gibbous':e<186.5?'Full Moon':e<263.5?'Waning Gibbous':e<276.5?'Last Quarter':'Waning Crescent'}
function hzNext(target,from){const f=t=>hzN(hzElong(t/864e5+2440587.5)-target+180)-180,t0=from||Date.now();let a=t0,fa=f(a);
 for(let i=1;i<=24*35;i++){const b=t0+i*36e5,fb=f(b);if(fa<0&&fb>=0){let lo=a,hi=b;for(let k=0;k<30;k++){const m=(lo+hi)/2;if(f(m)<0)lo=m;else hi=m}return new Date(hi)}a=b;fa=fb}return null}
function hzMoonSvg(e){const k=Math.cos(e*hzRad),R=50,rx=(R*Math.abs(k)).toFixed(2),wax=e<180,sw1=wax?1:0,sw2=wax?(k>0?0:1):(k>0?1:0);
 const lit=e<2||e>358?'':`<path d="M50 0A50 50 0 0 ${sw1} 50 100A${rx} 50 0 0 ${sw2} 50 0Z" fill="url(#hzl)"/>`;
 return `<svg viewBox="-8 -8 116 116" role="img" aria-label="Moon phase"><defs><radialGradient id="hzl" cx=".35" cy=".35" r=".9"><stop offset="0" stop-color="#fffdf0"/><stop offset="1" stop-color="#e6dcae"/></radialGradient><radialGradient id="hzd" cx=".5" cy=".5" r=".5"><stop offset=".7" stop-color="#26325a"/><stop offset="1" stop-color="#171f3c"/></radialGradient></defs><circle cx="50" cy="50" r="52" fill="rgba(255,244,190,.10)"/><circle cx="50" cy="50" r="50" fill="url(#hzd)"/>${lit}<g fill="#000" opacity=".07"><circle cx="38" cy="36" r="7"/><circle cx="62" cy="58" r="9"/><circle cx="44" cy="72" r="5"/><circle cx="66" cy="30" r="4"/></g></svg>`}
function hzSky(){const j=hzJD(new Date()),e=hzElong(j),v=hzVd(),a=v?hzAyan(j):0,ms=hzN(moonLon(j)-a),ss=hzN(sunLon(j)-a);return{e,ill:Math.round((1-Math.cos(e*hzRad))/2*100),name:hzPhaseName(e),mi:Math.floor(ms/30),mdeg:Math.floor(ms%30),si:Math.floor(ss/30),full:hzNext(180),nw:hzNext(0),mn:hzMoonMove(),pc:hzPanch(j),v}}
/* readings: the same for everyone on the same day, shaped by the real Moon sign */
const hzYmd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
function hzSeed(t){let h=2166136261;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function hzRng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hzCompat=(a,b)=>(a==='Fire'&&b==='Air')||(a==='Air'&&b==='Fire')||(a==='Earth'&&b==='Water')||(a==='Water'&&b==='Earth');
function hzRead(si,off){const n=new Date(),dt=new Date(n.getFullYear(),n.getMonth(),n.getDate()+off,12),ds=hzYmd(dt),j=hzJD(dt),S=HZ[si],v=hzVd(),a=v?hzAyan(j):0,mi=Math.floor(hzN(moonLon(j)-a)/30),h=((mi-si+12)%12)+1,H=HH[h],R=hzRng(hzSeed(ds+'|'+S.k)),pick=x=>x[Math.floor(R()*x.length)],
  el=hzElong(j),bright=el>=84&&el<180,faint=el>=312,wk=dt.getDay(),ruled=HZ_DAYRU[wk]===S.ru,
  fx=x=>Math.max(1,Math.min(5,x+(bright&&x<=3?1:0)-(faint&&x>=4?1:0))),
  love=fx(H.l),career=fx(Math.round((H.c+H.m)/2)),health=fx(H.h),overall=Math.min(5,fx(H.o)+(ruled&&H.o<5?1:0)),
  why=`The Moon is in ${hzNm(mi)}, your ${HZ_ORD[h]} house.`+(bright&&H.o<=3?' A bright, growing Moon softens the difficult side of this position.':'')+(faint&&H.o>=4?' A very thin Moon slightly dampens the good side of this position.':'')+(ruled?` ${S.ru[0].toUpperCase()+S.ru.slice(1)}, your ruling planet, also rules today.`:'');
 return{ds,dt,S,mi,h,why,love,career,health,overall,mood:H.mood,dd:H.dd,av:H.av,
  main:H.sum+' '+pick(HZB.advice),loveT:H.lo,careerT:H.ca+' '+H.mo,healthT:H.he,
  num:HZ_NUM[S.ru],col:HZ_WC[wk]}}
const hzSaved=()=>{const v=lsGet('sk_sign');return typeof v==='number'&&v>=0&&v<12?v:-1};
function hzChip(){return RF.chip()}
function horoPg(){document.title='Daily Horoscope — The Sujan Khadka';const k=hzSky(),R=hzRng(7),st=Array.from({length:44},()=>`<i style="left:${(R()*100).toFixed(1)}%;top:${(R()*100).toFixed(1)}%;--s:${(1+R()*2.2).toFixed(1)}px;--d:${(R()*4).toFixed(1)}s"></i>`).join('');
 const wheel=HZ.map((s,i)=>{const a=(i*30-90+15)*hzRad,x=(Math.cos(a)*112).toFixed(1),y=(Math.sin(a)*112).toFixed(1);return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${s.g}</text>`}).join('');
 const fd2=d=>d?d.toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'}):'–';
 const mo=['January','February','March','April','May','June','July','August','September','October','November','December'];
 return `<div class="pg hz"><h1>Daily Horoscope</h1><p>Pick your sign for today’s reading, with the real Moon and Sun positions for the day. Come back tomorrow for a new one.</p>
 <div class="hzmode" role="group" aria-label="Zodiac system"><button class="${hzVd()?'on':''}" onclick="hzMode(true)">Nepali · Vedic (Rashifal)</button><button class="${hzVd()?'':'on'}" onclick="hzMode(false)">Western</button></div><p class="meta hzmn">${hzVd()?'Rashi is your Moon sign at birth, taken from your janma kundali. Signs use the Lahiri (sidereal) zodiac, the system used in Nepal.':'Signs use the Western (tropical) zodiac, based on your Sun sign.'}</p>
 <div class="hzhero"><div class="hzst" aria-hidden="true">${st}</div><svg class="hzwh" viewBox="-150 -150 300 300" aria-hidden="true"><circle r="142" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="1.2"/><circle r="84" fill="none" stroke="rgba(255,255,255,.2)"/><g stroke="rgba(255,255,255,.2)">${HZ.map((_,i)=>`<line x1="0" y1="0" x2="${(Math.cos(i*30*hzRad)*142).toFixed(1)}" y2="${(Math.sin(i*30*hzRad)*142).toFixed(1)}"/>`).join('')}</g><g fill="rgba(255,236,160,.85)" font-size="17">${wheel}</g></svg>
  <div class="hzsky"><div class="hzmoon">${hzMoonSvg(k.e)}</div><div class="hzinfo"><span class="hzlbl">Today’s sky</span><b class="hzph">${k.name}</b><span>${k.ill}% lit · Moon in <strong>${hzNm(k.mi)} ${HZ[k.mi].g}</strong> ${k.mdeg}°</span><span>Sun in <strong>${hzNm(k.si)} ${HZ[k.si].g}</strong></span>${k.mn?`<span>Moon enters <strong>${hzNm(k.mn.to)}</strong> on <strong>${k.mn.t.toLocaleString(undefined,{weekday:'short',hour:'numeric',minute:'2-digit'})}</strong></span>`:''}${k.v?`<span>Tithi <strong>${k.pc.t}</strong> · Nakshatra <strong>${k.pc.nk}</strong></span>`:''}<span>Next full moon <strong>${fd2(k.full)}</strong> · new moon <strong>${fd2(k.nw)}</strong></span></div></div></div>
 <div class="hzfind"${hzVd()?' hidden':''}><span>Not sure of your sign?</span><select id="hz_m" aria-label="Birth month">${mo.map((m,i)=>`<option value="${i+1}">${m}</option>`).join('')}</select><select id="hz_d" aria-label="Birth day">${Array.from({length:31},(_,i)=>`<option>${i+1}</option>`).join('')}</select><button class="bt o" onclick="hzFind()">Find my sign</button></div>
 <div class="hzgrid" role="radiogroup" aria-label="Choose your sign">${HZ.map((s,i)=>`<button class="hzsg" role="radio" aria-checked="false" data-i="${i}" onclick="hzShow(${i},0,true)"><span class="hzg">${s.g}</span><b>${hzNm(i)}</b><small>${s.ne}</small><em>${hzDt(i)}</em></button>`).join('')}</div>
 <div id="hzread" aria-live="polite"></div>
 <p class="hzdis" hidden style="display:none">Moon phase, Moon sign, tithi and nakshatra are calculated from astronomy for the current moment. The daily readings follow the classical Moon-transit rule, with the Moon counted as a house from your sign. Astrology is a traditional belief and is not scientifically proven, so these readings are for guidance and entertainment only, not predictions, medical, legal or financial advice.</p></div>`}
let hzSi=-1,hzOff=0;
function hzMode(v){try{localStorage.setItem('sk_zv',JSON.stringify(!!v))}catch(e){}go();const c=$('#hz');if(c)c.innerHTML=hzChip()}
function hzStars(n){return `<span class="hz5" role="img" aria-label="${n} out of 5">${[1,2,3,4,5].map(i=>`<i class="${i<=n?'on':''}" style="--i:${i}">★</i>`).join('')}</span>`}
function hzHtml(si,off){const r=hzRead(si,off),S=r.S,ov=(((D.pages||{}).__horo||{}).days||{})[r.ds],note=ov&&ov[S.k]?`<div class="hzed"><b>Editor’s note</b><p>${esc(ov[S.k])}</p></div>`:'',
 row=(t,n,x)=>`<div class="hzrow"><div class="hzrh"><b>${t}</b>${hzStars(n)}</div><div class="hzbar"><i style="--w:${n*20}%"></i></div><p>${x}</p></div>`,
 tab=(l,o)=>`<button class="${o===off?'on':''}" onclick="hzShow(${si},${o})">${l}</button>`;
 return `<div class="hzr"><div class="hzh"><span class="hzbig">${S.g}</span><div><h2>${hzNm(si)} <small>${S.ne} · ${hzVd()?S.n:S.nr}</small></h2><div class="meta">${hzDt(si)} · ${S.el} · ruled by ${S.ru}</div></div></div>
 <div class="hztabs" role="tablist">${tab('Yesterday',-1)}${tab('Today',0)}${tab('Tomorrow',1)}</div>
 <div class="meta hzdate">${r.dt.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'})} · Mood: <b>${r.mood}</b> · Overall ${hzStars(r.overall)}</div>
 ${note}<p class="hzmain">${r.main}</p>
 ${row('Love',r.love,r.loveT)}${row('Career &amp; money',r.career,r.careerT)}${row('Health &amp; mind',r.health,r.healthT)}
 <div class="hzlk"><div><small>Lucky number</small><b>${r.num}</b></div><div><small>Lucky colour</small><b><i class="hzsw" style="background:${r.col[1]}"></i>${r.col[0]}</b></div><div><small>Moon is in your</small><b>${HZ_ORD[r.h]} house</b></div></div><div class="hzda"><div><small>Do</small><b>${r.dd}</b></div><div><small>Avoid</small><b>${r.av}</b></div></div><p class="hzwhy">${r.why}</p></div>`}
function hzShow(si,off,sc){hzSi=si;hzOff=off||0;const box=$('#hzread');if(!box)return;
 document.querySelectorAll('.hzsg').forEach(b=>{const on=+b.dataset.i===si;b.classList.toggle('on',on);b.setAttribute('aria-checked',on)});
 if(si<0){box.innerHTML='<div class="hzempty">Choose your sign above to see today’s reading.</div>';return}
 box.innerHTML=hzHtml(si,hzOff);if(lsGet('sk_sign')!==si){lsSet('sk_sign',si);const c=$('#hz');if(c)c.innerHTML=hzChip()}
 const r=box.querySelector('.hzr');requestAnimationFrame(()=>requestAnimationFrame(()=>r&&r.classList.add('go')));if(sc)setTimeout(()=>box.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'}),80)}
function hzInit(){if(!$('#hzread'))return;hzShow(hzSi>=0?hzSi:hzSaved(),hzOff)}
function hzFind(){const m=+$('#hz_m').value,d=+$('#hz_d').value,cut=[[1,20,'aquarius'],[2,19,'pisces'],[3,21,'aries'],[4,20,'taurus'],[5,21,'gemini'],[6,21,'cancer'],[7,23,'leo'],[8,23,'virgo'],[9,23,'libra'],[10,23,'scorpio'],[11,22,'sagittarius'],[12,22,'capricorn']];
 let k='capricorn';cut.forEach(c=>{if(m>c[0]||(m===c[0]&&d>=c[1]))k=c[2]});hzShow(HZ.findIndex(x=>x.k===k),0);const b=$('#hzread');if(b)b.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'})}
/* portal: optional editor's notes per sign and date */
let hzAD=null;
function hzTab(){const ds=hzAD||hzYmd(new Date()),cur=((((A.pages||{}).__horo||{}).days)||{})[ds]||{};
 return `<div class="aup"><strong>Daily horoscope</strong><p class="meta">Every sign already gets an automatic daily reading based on the real position of the Moon. If you write a message here for a date, readers see it as an “Editor’s note” on top of that sign’s reading. Leave a box empty to show only the automatic reading.</p><label>Date</label><input type="date" id="hz_dt" value="${ds}" onchange="hzAD=this.value;go()">${HZ.map(s=>`<label>${s.g} ${s.n} (${s.nr})</label><textarea id="hz_${s.k}" style="min-height:70px" maxlength="600">${esc(cur[s.k]||'')}</textarea>`).join('')}<div style="margin-top:12px"><button class="bt" onclick="hzSave()">Save</button></div></div>`}
async function hzSave(){const ds=$('#hz_dt').value;if(!ds)return alert('Choose a date.');A.pages=A.pages||{};const o=A.pages.__horo||{days:{}};o.days=o.days||{};const day={};
 HZ.forEach(s=>{const t=$('#hz_'+s.k).value.trim();if(t)day[s.k]=t.slice(0,600)});if(Object.keys(day).length)o.days[ds]=day;else delete o.days[ds];
 const keep=hzYmd(new Date(Date.now()-30*864e5));Object.keys(o.days).forEach(k=>{if(k<keep)delete o.days[k]});A.pages.__horo=o;if(await persist()){alert('Saved.');go()}}
/* ---------- Rashifal (real Nepal-time engine: Moon over Kathmandu, Lahiri ayanamsa) ---------- */
var RashifalEngine = (function () {
  "use strict";
  var RAD = Math.PI / 180;
  var DELTA_T = 69.2; // seconds, TT minus UT, about 2026
  var OFFSET_MS = (5 * 60 + 45) * 60 * 1000; // Nepal Time, UTC+05:45
  var DAY_MS = 86400000;
  var LAT = 27.7172, LON = 85.3240; // Kathmandu

  function norm(x) { x = x % 360; return x < 0 ? x + 360 : x; }
  function jdUT(ms) { return ms / DAY_MS + 2440587.5; }
  function jde(ms) { return jdUT(ms) + DELTA_T / 86400; }

  // [D, M, M', F, coefficient in 1e-6 degrees]
  var MOON_TERMS = [
    [0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],[0,1,0,0,-185116],
    [0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],[2,0,1,0,53322],[2,-1,0,0,45758],
    [0,1,-1,0,-40923],[1,0,0,0,-34720],[0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],
    [0,0,1,-2,10980],[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],
    [2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],[2,0,2,0,3994],
    [4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],[2,0,-1,2,-2602],[2,-1,-2,0,2390],
    [1,0,1,0,-2348],[2,-2,0,0,2236],[0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],
    [2,0,1,-2,-1773],[2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],
    [2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],[2,1,-2,0,691],
    [2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],[4,-1,0,0,520],[1,0,-2,0,-487]
  ];

  function moonTropical(ms) {
    var T = (jde(ms) - 2451545.0) / 36525;
    var Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
    var D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T;
    var M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
    var Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;
    var F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T;
    var E = 1 - 0.002516 * T - 0.0000074 * T * T;
    var A1 = 119.75 + 131.849 * T, A2 = 53.09 + 479264.290 * T;
    var sum = 0;
    for (var i = 0; i < MOON_TERMS.length; i++) {
      var t = MOON_TERMS[i];
      var arg = (t[0] * D + t[1] * M + t[2] * Mp + t[3] * F) * RAD;
      var c = t[4];
      var am = Math.abs(t[1]);
      if (am === 1) c *= E; else if (am === 2) c *= E * E;
      sum += c * Math.sin(arg);
    }
    sum += 3958 * Math.sin(A1 * RAD) + 1962 * Math.sin((Lp - F) * RAD) + 318 * Math.sin(A2 * RAD);
    var lon = Lp + sum / 1e6;
    // nutation in longitude (low precision) to get apparent longitude
    var Om = 125.04452 - 1934.136261 * T;
    var dpsi = -17.20 * Math.sin(Om * RAD) - 1.32 * Math.sin(2 * (280.4665 + 36000.7698 * T) * RAD)
             - 0.23 * Math.sin(2 * Lp * RAD) + 0.21 * Math.sin(2 * Om * RAD);
    return norm(lon + dpsi / 3600);
  }

  function sunTropical(ms) {
    var T = (jde(ms) - 2451545.0) / 36525;
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    var M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * RAD)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * M * RAD) + 0.000289 * Math.sin(3 * M * RAD);
    var om = 125.04 - 1934.136 * T;
    return norm(L0 + C - 0.00569 - 0.00478 * Math.sin(om * RAD));
  }

  function ayanamsa(ms) { // Lahiri, degrees
    var T = (jde(ms) - 2451545.0) / 36525;
    return 23.857092 + (5028.796195 * T + 1.1054348 * T * T) / 3600;
  }

  function nutLon(ms) { var T = (jde(ms) - 2451545.0) / 36525, Om = 125.04452 - 1934.136261 * T;
    return (-17.20 * Math.sin(Om * RAD) - 1.32 * Math.sin(2 * (280.4665 + 36000.7698 * T) * RAD)) / 3600; }
  function moonSidereal(ms) { return norm(moonTropical(ms) - nutLon(ms) - ayanamsa(ms)); }
  function elongation(ms) { return norm(moonTropical(ms) - sunTropical(ms)); }

  // monotonic "unwrapped" quantities so crossings can be found by bisection
  function crossing(fn, step, from, target, spanMs) {
    // fn returns an angle in [0,360) increasing with time; find first time ms>=from where it reaches target
    var t0 = from, a0 = fn(t0);
    var maxT = from + (spanMs || 3 * DAY_MS);
    for (var t = from + step; t <= maxT + step; t += step) {
      var a1 = fn(t);
      var d0 = norm(target - a0), d1 = norm(target - a1);
      if (d0 < 180 && (d1 > d0 || d1 >= 180)) { // passed target between t0 and t
        var lo = t0, hi = t;
        for (var i = 0; i < 40; i++) {
          var mid = (lo + hi) / 2;
          if (norm(target - fn(mid)) < 180 && norm(target - fn(mid)) > 0) lo = mid; else hi = mid;
        }
        return (lo + hi) / 2;
      }
      t0 = t; a0 = a1;
    }
    return null;
  }

  var TITHI_EN = ["Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi"];
  var TITHI_NP = ["प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पञ्चमी","षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी","एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी"];
  function tithiInfo(ms) {
    var n = Math.floor(elongation(ms) / 12) + 1; // 1..30
    var shukla = n <= 15;
    var k = shukla ? n : n - 15;
    var en, np;
    if (k === 15) { en = shukla ? "Purnima" : "Amavasya"; np = shukla ? "पूर्णिमा" : "औंसी"; }
    else { en = TITHI_EN[k - 1]; np = TITHI_NP[k - 1]; }
    return { number: n, en: en, np: np, paksha: shukla ? "Shukla" : "Krishna", pakshaNp: shukla ? "शुक्ल" : "कृष्ण" };
  }
  function tithiEnd(ms) {
    var n = Math.floor(elongation(ms) / 12) + 1;
    return crossing(elongation, 10 * 60000, ms, norm(n * 12), 3 * DAY_MS);
  }

  var NAK_EN = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
  var NAK_NP = ["अश्विनी","भरणी","कृत्तिका","रोहिणी","मृगशिरा","आर्द्रा","पुनर्वसु","पुष्य","आश्लेषा","मघा","पूर्व फाल्गुनी","उत्तर फाल्गुनी","हस्त","चित्रा","स्वाति","विशाखा","अनुराधा","ज्येष्ठा","मूल","पूर्वाषाढा","उत्तराषाढा","श्रवण","धनिष्ठा","शतभिषा","पूर्व भाद्रपद","उत्तर भाद्रपद","रेवती"];
  function nakshatraInfo(ms) {
    var i = Math.floor(moonSidereal(ms) / (360 / 27));
    return { index: i, en: NAK_EN[i], np: NAK_NP[i] };
  }
  function nakshatraEnd(ms) {
    var i = Math.floor(moonSidereal(ms) / (360 / 27));
    return crossing(moonSidereal, 10 * 60000, ms, norm((i + 1) * (360 / 27)), 2 * DAY_MS);
  }

  function moonSign(ms) { return Math.floor(moonSidereal(ms) / 30); } // 0 = Mesh ... 11 = Meen

  // Kathmandu day boundaries
  function nepalDayStart(ms) {
    var local = ms + OFFSET_MS;
    return Math.floor(local / DAY_MS) * DAY_MS - OFFSET_MS;
  }
  function dateKey(ms) { return new Date(ms + OFFSET_MS).toISOString().slice(0, 10); }

  // Moon sign segments between start and end (ms)
  function moonSignSegments(start, end) {
    var segs = [], t = start, sign = moonSign(t);
    while (t < end) {
      var nxt = crossing(moonSidereal, 10 * 60000, t, norm((sign + 1) * 30), 4 * DAY_MS);
      if (nxt === null || nxt >= end) { segs.push({ from: t, to: end, sign: sign }); break; }
      segs.push({ from: t, to: nxt, sign: sign });
      t = nxt; sign = (sign + 1) % 12;
    }
    return segs;
  }

  // approximate sunrise at Kathmandu (upper limb, refraction included), ms
  function sunrise(dayStartMs) {
    var civil = new Date(dayStartMs + OFFSET_MS);
    var utcMidnight = Date.UTC(civil.getUTCFullYear(), civil.getUTCMonth(), civil.getUTCDate());
    var t = utcMidnight + (720 - 4 * LON) * 60000; // start from local solar noon, then iterate
    for (var k = 0; k < 4; k++) {
      var T = (jde(t) - 2451545.0) / 36525;
      var lam = sunTropical(t) * RAD;
      var eps = (23.439291 - 0.0130042 * T) * RAD;
      var dec = Math.asin(Math.sin(eps) * Math.sin(lam));
      var ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)) / RAD;
      var L0 = 280.46646 + 36000.76983 * T;
      var eqtMin = 4 * (norm(L0 - ra + 180) - 180); // equation of time, minutes
      var cosH = (Math.sin(-0.8333 * RAD) - Math.sin(LAT * RAD) * Math.sin(dec)) / (Math.cos(LAT * RAD) * Math.cos(dec));
      var H = Math.acos(Math.max(-1, Math.min(1, cosH))) / RAD; // hour angle, degrees
      t = utcMidnight + (720 - 4 * LON - eqtMin - 4 * H) * 60000;
    }
    return t;
  }

  // Chandra gochar: house of the transiting Moon counted from the birth rashi
  var FAVOURABLE = { 1: true, 3: true, 6: true, 7: true, 10: true, 11: true };
  function house(moonSignIdx, natalIdx) { return ((moonSignIdx - natalIdx + 12) % 12) + 1; }

  return {
    moonTropical: moonTropical, sunTropical: sunTropical, ayanamsa: ayanamsa,
    moonSidereal: moonSidereal, elongation: elongation, moonSign: moonSign,
    tithiInfo: tithiInfo, tithiEnd: tithiEnd, nakshatraInfo: nakshatraInfo, nakshatraEnd: nakshatraEnd,
    nepalDayStart: nepalDayStart, dateKey: dateKey, moonSignSegments: moonSignSegments, sunrise: sunrise,
    house: house, FAVOURABLE: FAVOURABLE, OFFSET_MS: OFFSET_MS, DAY_MS: DAY_MS, norm: norm, jde: jde
  };
})();
const RF=(function(){
"use strict";
var E=RashifalEngine,RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var SIGNS = [
    { np: "मेष", en: "Aries", tr: "Mesh", trait: { en: "Bold, direct and quick to start things", ne: "साहसी, स्पष्ट र छिट्टै सुरु गर्ने" } },
    { np: "वृष", en: "Taurus", tr: "Brish", trait: { en: "Steady, patient and loyal", ne: "स्थिर, धैर्यवान् र निष्ठावान्" } },
    { np: "मिथुन", en: "Gemini", tr: "Mithun", trait: { en: "Curious, social and quick-minded", ne: "जिज्ञासु, मिलनसार र तीक्ष्ण बुद्धि" } },
    { np: "कर्कट", en: "Cancer", tr: "Karkat", trait: { en: "Caring, intuitive and protective", ne: "स्नेही, अन्तर्ज्ञानी र रक्षक" } },
    { np: "सिंह", en: "Leo", tr: "Singha", trait: { en: "Warm, confident and generous", ne: "न्यानो, आत्मविश्वासी र उदार" } },
    { np: "कन्या", en: "Virgo", tr: "Kanya", trait: { en: "Careful, practical and observant", ne: "सावधान, व्यावहारिक र सूक्ष्म दृष्टि" } },
    { np: "तुला", en: "Libra", tr: "Tula", trait: { en: "Fair-minded, graceful and diplomatic", ne: "न्यायप्रिय, सौम्य र कूटनीतिज्ञ" } },
    { np: "वृश्चिक", en: "Scorpio", tr: "Brischik", trait: { en: "Intense, focused and resourceful", ne: "गहिरो, केन्द्रित र साधनसम्पन्न" } },
    { np: "धनु", en: "Sagittarius", tr: "Dhanu", trait: { en: "Adventurous, honest and hopeful", ne: "साहसिक, इमानदार र आशावादी" } },
    { np: "मकर", en: "Capricorn", tr: "Makar", trait: { en: "Disciplined, ambitious and reliable", ne: "अनुशासित, महत्त्वाकांक्षी र भरपर्दो" } },
    { np: "कुम्भ", en: "Aquarius", tr: "Kumbha", trait: { en: "Original, independent and friendly", ne: "मौलिक, स्वतन्त्र र मिलनसार" } },
    { np: "मीन", en: "Pisces", tr: "Meen", trait: { en: "Gentle, creative and empathetic", ne: "कोमल, सिर्जनशील र संवेदनशील" } }
  ];

  // Traditional Chandra gochar: the Moon's house counted from your birth rashi.
  var HOUSE = {
    en: [
      "The Moon is in your own sign. The mind is settled and comfortable; a good day for routine and looking after yourself.",
      "Family, speech and money turn sensitive. Speak carefully and watch your spending.",
      "Courage and initiative are strong. Good for short trips, messages and starting small efforts.",
      "Home and comfort come to the front, but satisfaction is slow to arrive. Avoid brooding and keep to your routine.",
      "Creativity, children and romance are in focus, but feeling can run ahead of judgment. Double-check decisions.",
      "A practical, steady mind. Good for routine work, dealing with competition and settling debts.",
      "Partnerships and meetings go well. A favourable time for your partner and for dealings with the public.",
      "Chandrashtama: energy runs low and obstacles are more likely. Avoid launches, signings and confrontations if you can.",
      "Restlessness around teachers, long travel and belief. Be patient with delays.",
      "Career and public action are favoured. A good day to be visible at work.",
      "Gains, friends and networks. Requests are more likely to be received well.",
      "Expenses and withdrawal. A day for rest and quiet; keep spending modest."
    ],
    ne: [
      "चन्द्रमा तपाईंको आफ्नै राशिमा छ। मन शान्त र सहज रहन्छ; दैनिक काम र आफ्नो हेरचाहका लागि राम्रो दिन।",
      "परिवार, बोली र धनका विषय संवेदनशील हुन सक्छन्। सोचेर बोल्नुहोस् र खर्चमा सावधानी अपनाउनुहोस्।",
      "साहस र पहल बलियो रहन्छ। छोटो यात्रा, सम्पर्क र साना काम सुरु गर्न राम्रो।",
      "घर र सुखका कुरा अघि आउँछन् तर सन्तुष्टि ढिलो मिल्न सक्छ। चिन्ता नगरी दैनिक लयमै रहनुहोस्।",
      "सिर्जना, सन्तान र प्रेमका विषय चर्चामा रहन्छन् तर भावना निर्णयभन्दा अघि जान सक्छ। निर्णय दोहोर्‍याएर हेर्नुहोस्।",
      "मन व्यावहारिक र स्थिर रहन्छ। नियमित काम, प्रतिस्पर्धा र ऋण मिलाउन राम्रो।",
      "साझेदारी र भेटघाट राम्रो रहन्छ। जीवनसाथी र जनसम्पर्कका काममा अनुकूल समय।",
      "चन्द्राष्टम: ऊर्जा कम र अवरोध बढी हुन सक्छ। सकेसम्म नयाँ सुरुवात, हस्ताक्षर र विवादबाट टाढा रहनुहोस्।",
      "शिक्षक, लामो यात्रा र आस्थासँग सम्बन्धित बेचैनी हुन सक्छ। ढिलाइमा धैर्य राख्नुहोस्।",
      "काम र सार्वजनिक भूमिकामा अनुकूलता रहन्छ। कार्यक्षेत्रमा सक्रिय हुन राम्रो दिन।",
      "लाभ, मित्र र सम्पर्कको साथ मिल्छ। अनुरोध र प्रस्ताव राम्रोसँग स्वीकार हुन सक्छन्।",
      "खर्च र एकान्त बढ्न सक्छ। आराम गर्नुहोस् र खर्च सीमित राख्नुहोस्।"
    ]
  };

  var UI = {
    en: {
      title: "Daily Rashifal", tithi: "Tithi", nak: "Nakshatra", moon: "Moon sign", sunrise: "Sunrise",
      until: "until", then: "then", allDay: "all day", house: "house from", ends: "ends",
      good: "Favourable", mixed: "Mixed", bad: "Challenging", ctr: "Chandrashtama",
      chandrashtama: "Chandrashtama today for", tomorrow: "tomorrow", moonIn: "Moon in", times: "Nepal time",
      method: "Calculated for Kathmandu from the Moon's real position (Lahiri ayanamsa) using the traditional Chandra gochar method: the Moon's house is counted from your birth rashi. " +
              "This is a general reading for each rashi. It does not use your full birth chart or the other planets, and traditional texts differ in detail. " +
              "Astrology is a traditional belief system and not a scientific forecast. Times are Nepal Time and can differ by a few minutes from printed patros."
    },
    ne: {
      title: "दैनिक राशिफल", tithi: "तिथि", nak: "नक्षत्र", moon: "चन्द्र राशि", sunrise: "सूर्योदय",
      until: "सम्म", then: "त्यसपछि", allDay: "दिनभर", house: "भाव", ends: "समाप्त",
      good: "अनुकूल", mixed: "मिश्रित", bad: "चुनौतीपूर्ण", ctr: "चन्द्राष्टम",
      chandrashtama: "आज चन्द्राष्टम रहने राशि", tomorrow: "भोलि", moonIn: "चन्द्रमा", times: "नेपाली समय",
      method: "चन्द्रमाको वास्तविक स्थिति (लाहिरी अयनांश) बाट काठमाडौंका लागि गणना गरी परम्परागत चन्द्र गोचर विधि अपनाइएको छ: तपाईंको जन्म राशिबाट चन्द्रमा कुन भावमा छ भनेर हेरिन्छ। " +
              "यो प्रत्येक राशिको सामान्य फल हो। यसमा पूरा जन्मकुण्डली र अन्य ग्रहहरू समावेश छैनन्, र ग्रन्थअनुसार केही भिन्नता हुन सक्छ। " +
              "ज्योतिष परम्परागत विश्वास हो, वैज्ञानिक भविष्यवाणी होइन। समय नेपाली समयमा हो र छापिएका पात्रोसँग केही मिनेटको फरक हुन सक्छ।"
    }
  };

var NPT=E.OFFSET_MS,lang='en',cur=0,key=null,cache=null,timer=0;
try{var _l=localStorage.getItem('rf-lang');if(_l==='ne'||_l==='en')lang=_l}catch(e){}
try{var _s=parseInt(localStorage.getItem('rf-sign'),10);if(_s>=0&&_s<12)cur=_s}catch(e){}
var G=function(i){return '♈♉♊♋♌♍♎♏♐♑♒♓'[i]+'\uFE0E'};
var hm=function(ms){var d=new Date(ms+NPT);return('0'+d.getUTCHours()).slice(-2)+':'+('0'+d.getUTCMinutes()).slice(-2)};
var dayLabel=function(ms){return new Intl.DateTimeFormat(lang==='ne'?'ne-NP':'en-GB',{timeZone:'Asia/Kathmandu',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(ms))};
var sname=function(i){return lang==='ne'?SIGNS[i].np:SIGNS[i].tr+' ('+SIGNS[i].en+')'};
var endTxt=function(ms,c){var t=UI[lang];return t.ends+' '+hm(ms)+(ms>=c.end?' ('+t.tomorrow+')':'')};
function compute(now){var start=E.nepalDayStart(now),end=start+E.DAY_MS,sr=E.sunrise(start),ref=sr;
 return{key:E.dateKey(now),start:start,end:end,sunrise:sr,tithi:E.tithiInfo(ref),tithiEnd:E.tithiEnd(ref),nak:E.nakshatraInfo(ref),nakEnd:E.nakshatraEnd(ref),segs:E.moonSignSegments(start,end),stamp:now,ml:E.moonSidereal(now),el:E.elongation(now)}}
function getC(now){if(!cache||cache.key!==E.dateKey(now)||now-cache.stamp>30*60000)cache=compute(now);return cache}
function verdict(houses,durs,els){var total=0,sum=0,bad8=0;for(var i=0;i<houses.length;i++){total+=durs[i];sum+=sc(houses[i],els[i])*durs[i];if(houses[i]===8)bad8+=durs[i]}
 if(bad8>=2*3600000)return'ctr';var s=sum/total;return s>=.5?'good':(s<=.05?'bad':'mixed')}
/* Chandra bala: houses 1,3,6,7,10,11 favourable; 2,5,9 help only in the bright (Shukla) half; 4,12 poor; 8 Chandrashtama.
   Moon is weak from Krishna Ashtami to Shukla Saptami (elongation 264deg..84deg): its good results are reduced. */
var weakM=function(el){return el>=264||el<84};
function sc(h,el){var b;if(h===8)return -1;if(E.FAVOURABLE[h])b=1;else if(h===2||h===5||h===9)b=(el<180)?.6:.2;else b=-.2;return b>0&&weakM(el)?b*.6:b}
var hq=function(h,el){var x=sc(h,el);return x>=.5?'good':(x<=-.5?'bad':'mid')};
function verdictFor(c,i){var h=[],d=[],e=[];c.segs.forEach(function(g){h.push(E.house(g.sign,i));d.push(g.to-g.from);e.push(E.elongation((Math.max(g.from,c.start)+Math.min(g.to,c.end))/2))});return{v:verdict(h,d,e),h:h,e:e}}
function ringSvg(c){var g='';for(var i=0;i<12;i++){var a=(i*30+15-90)*RAD,b=(i*30-90)*RAD;
  g+='<text x="'+(160+131*Math.cos(a)).toFixed(1)+'" y="'+(160+131*Math.sin(a)+7).toFixed(1)+'" text-anchor="middle" data-i="'+i+'">'+G(i)+'</text><line x1="'+(160+112*Math.cos(b)).toFixed(1)+'" y1="'+(160+112*Math.sin(b)).toFixed(1)+'" x2="'+(160+150*Math.cos(b)).toFixed(1)+'" y2="'+(160+150*Math.sin(b)).toFixed(1)+'"/>'}
 var m=(c.ml-90)*RAD,moon=hzMoonSvg(c.el).replace('<svg viewBox','<svg x="97" y="97" width="126" height="126" viewBox');
 return '<svg class="rfz" viewBox="0 0 320 320" role="img" aria-label="Zodiac wheel with the Moon"><g class="rfzs"><circle cx="160" cy="160" r="150"/><circle cx="160" cy="160" r="112"/>'+g+'<circle class="rfmk" cx="'+(160+112*Math.cos(m)).toFixed(1)+'" cy="'+(160+112*Math.sin(m)).toFixed(1)+'" r="7"/></g>'+moon+'</svg>'}
var RAD=Math.PI/180;
function nowPct(c,now){return Math.max(0,Math.min(100,(now-c.start)/E.DAY_MS*100))}
function render(){var now=Date.now(),c=getC(now),t=UI[lang],r=document.getElementById('rf');if(!r)return;key=c.key;document.documentElement.lang=lang==='ne'?'ne':'en';
 var R=function(id){return document.getElementById(id)};
 if(!r.dataset.b){r.dataset.b='1';r.innerHTML='<section class="rh"><div class="rsh"></div><div class="rhz" id="rfz"></div><div class="rht"><div class="rlg" role="group" aria-label="Language"><button type="button" id="rfen">English</button><button type="button" id="rfne">नेपाली</button></div><h1 id="rft"></h1><p id="rfd"></p><p class="rkt" id="rfk"></p></div></section><div class="rpc" id="rfpc"></div><div class="ral" id="rfal" hidden></div><div class="rtl" id="rftl"></div><div class="rpk" id="rfpk" role="group"></div><section class="rrd" id="rfrd" aria-live="polite"></section><p class="rmt" id="rfmt" hidden style="display:none"></p>';
  R('rfen').onclick=function(){lang='en';try{localStorage.setItem('rf-lang','en')}catch(e){}render()};R('rfne').onclick=function(){lang='ne';try{localStorage.setItem('rf-lang','ne')}catch(e){}render()}}
 if(r.dataset.k!==c.key+'|'+(c.stamp===cache.stamp?cache.stamp:'')){r.dataset.k=c.key+'|'+cache.stamp;R('rfz').innerHTML=ringSvg(c)}
 R('rft').textContent=t.title;R('rfd').textContent=dayLabel(now)+' · '+t.times+' · '+(lang==='ne'?'काठमाडौं':'Kathmandu');
 R('rfk').innerHTML=(lang==='ne'?'चन्द्रमा':'Moon')+' <b>'+G(c.segs[c.segs.length?E.moonSign(now)>=0?0:0:0].sign)+'</b>';
 R('rfen').setAttribute('aria-pressed',lang==='en');R('rfne').setAttribute('aria-pressed',lang==='ne');
 var ms=E.moonSign(now);R('rfk').innerHTML=(lang==='ne'?'अहिले चन्द्रमा ':'Moon now in ')+'<b>'+G(ms)+' '+esc(lang==='ne'?SIGNS[ms].np:SIGNS[ms].tr)+'</b>';R('rfk').innerHTML+=' · '+(function(){var el=E.elongation(now);return el>=84&&el<264?(lang==='ne'?'चन्द्रमा बलियो':'Moon strong'):(lang==='ne'?'चन्द्रमा कमजोर':'Moon weak')})();
 /* panchang */
 var tl=lang==='ne'?c.tithi.pakshaNp+' '+c.tithi.np:c.tithi.paksha+' '+c.tithi.en;
 var mv=c.segs.map(function(g,i){return sname(g.sign)+(i<c.segs.length-1?' '+t.until+' '+hm(c.segs[i+1].from):'')}).join(', '+t.then+' ');
 var pc=function(ic,k,v,s,i){return '<div class="rc" style="--i:'+i+'"><span class="ri">'+ic+'</span><div><small>'+esc(k)+'</small><b>'+esc(v)+'</b>'+(s?'<em>'+esc(s)+'</em>':'')+'</div></div>'};
 R('rfpc').innerHTML=pc('🌙',t.tithi,tl,endTxt(c.tithiEnd,c),0)+pc('✨',t.nak,lang==='ne'?c.nak.np:c.nak.en,endTxt(c.nakEnd,c),1)+pc(G(ms),t.moon,mv,c.segs.length===1?t.allDay:'',2)+pc('🌅',t.sunrise,hm(c.sunrise),'',3);
 /* chandrashtama alert */
 var cs=[];c.segs.forEach(function(g){var s8=(g.sign-7+12)%12;if(g.to-g.from>=30*60000&&cs.indexOf(s8)<0)cs.push(s8)});var al=R('rfal');
 if(cs.length){al.hidden=false;al.innerHTML='<i></i><span>'+esc(t.chandrashtama+': '+cs.map(function(i){return lang==='ne'?SIGNS[i].np:SIGNS[i].tr}).join(', '))+'</span>'}else al.hidden=true;
 /* rashi cards */
 var box=R('rfpk');box.className='rcw';box.removeAttribute('role');box.innerHTML=cardsHtml(c);phaseAnim();s3init();R('rftl').innerHTML='';var rr0=R('rfrd');rr0.innerHTML='';rr0.style.display='none';
 box.onclick=function(ev){var b=ev.target.closest('button');if(!b)return;var a=b.closest('.rcd');if(!a)return;var i=+a.dataset.i,ne=lang==='ne';
  if(b.classList.contains('rcm')){a.classList.toggle('open');b.textContent=a.classList.contains('open')?(ne?'कम हेर्नुहोस्':'See less'):(ne?'थप हेर्नुहोस्':'See more')}
  else if(b.classList.contains('rcs')){setCur(i);openShare()}}}
/* ---- rashi-specific insight: sign ruler vs Moon-sign ruler, nakshatra ruler, day lord ---- */
var PN={en:['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'],ne:['सूर्य','चन्द्र','मंगल','बुध','गुरु','शुक्र','शनि']},
 LORD=[2,5,3,1,0,3,5,2,4,6,6,4],FR=[[1,2,4],[0,3],[0,1,4],[0,5],[0,1,2],[3,6],[3,5]],EN_=[[5,6],[],[3],[1],[3,5],[0,1],[0,1,2]],
 WD={en:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],ne:['आइतबार','सोमबार','मंगलबार','बुधबार','बिहीबार','शुक्रबार','शनिबार']},
 COLS={en:['orange or copper','white or silver','red','green','yellow','white or pink','blue or black'],ne:['सुन्तला वा ताँबे','सेतो वा चाँदी','रातो','हरियो','पहेंलो','सेतो वा गुलाबी','निलो वा कालो']},
 RELT={en:{own:'is also your own ruler, so the day feels familiar and natural',friend:'is friendly to your ruler, so things flow with less effort',neutral:'is neutral to your ruler, so results depend on your own effort',enemy:'is unfriendly to your ruler, so expect some friction and go slowly'},
  ne:{own:'तपाईंकै राशि स्वामी पनि हो, त्यसैले दिन परिचित र स्वाभाविक लाग्छ',friend:'तपाईंको राशि स्वामीको मित्र हो, त्यसैले काम सजिलो चल्छ',neutral:'तपाईंको राशि स्वामीसँग सम छ, त्यसैले फल तपाईंकै प्रयासमा भर पर्छ',enemy:'तपाईंको राशि स्वामीको शत्रु हो, त्यसैले केही अवरोध आउन सक्छ; ढिलो र होसियार भई अघि बढ्नुहोस्'}},
 FLV={en:['Mood is proud and purposeful; you want recognition and clarity.','Mood is soft and sensitive; feelings, family and caring come first.','Mood is quick and energetic; good for action, but tempers can flare.','Mood is alert and talkative; good for study, messages and deals.','Mood is hopeful and generous; advice from elders and teachers helps.','Mood is gentle and pleasure-seeking; good for harmony, art and relationships.','Mood is serious and slow; patience and steady work pay better than shortcuts.'],
  ne:['मन स्वाभिमानी र उद्देश्यपूर्ण रहन्छ; मान्यता र स्पष्टता चाहिन्छ।','मन कोमल र संवेदनशील रहन्छ; भावना, परिवार र स्याहारलाई प्राथमिकता मिल्छ।','मन छिटो र ऊर्जावान् रहन्छ; काम गर्न राम्रो, तर रीस उठ्न सक्छ।','मन सजग र बोल्न मन लाग्ने रहन्छ; अध्ययन, सन्देश र सम्झौताका लागि राम्रो।','मन आशावादी र उदार रहन्छ; ज्येष्ठ र गुरुको सल्लाह उपयोगी हुन्छ।','मन कोमल र सौन्दर्यप्रेमी रहन्छ; मेलमिलाप, कला र सम्बन्धका लागि राम्रो।','मन गम्भीर र ढिलो रहन्छ; धैर्य र निरन्तर कामले छोटो बाटोभन्दा राम्रो फल दिन्छ।']},
 NKL=[['Ketu','केतु'],['Venus','शुक्र'],['Sun','सूर्य'],['Moon','चन्द्र'],['Mars','मंगल'],['Rahu','राहु'],['Jupiter','गुरु'],['Saturn','शनि'],['Mercury','बुध']],
 NKT={en:['detachment, quiet focus and sudden changes of plan','comfort, affection and money matters','leadership, health and dealings with officials','emotions, home and the public mood','courage, property and competitive matters','unusual ideas, technology and confusion, so double-check details','learning, advice and good fortune','duty, delays and hard work, so go step by step','trade, speech, writing and travel'],
  ne:['अलग्गिने भाव, एकान्त र अचानक योजना बदलिने स्थिति','सुख-सुविधा, स्नेह र धन सम्बन्धी कुरा','नेतृत्व, स्वास्थ्य र अधिकारीसँगका व्यवहार','भावना, घर र जनमत सम्बन्धी कुरा','साहस, सम्पत्ति र प्रतिस्पर्धासँग सम्बन्धित कुरा','असामान्य विचार, प्रविधि र अन्योल, त्यसैले विवरण दोहोर्‍याएर हेर्नुहोस्','अध्ययन, सल्लाह र सौभाग्य','कर्तव्य, ढिलाइ र कडा मेहनत, त्यसैले क्रमशः अघि बढ्नुहोस्','व्यापार, बोली, लेखन र यात्रा']};
function rel(a,b){return a===b?'own':FR[a].indexOf(b)>-1?'friend':EN_[a].indexOf(b)>-1?'enemy':'neutral'}
function ins(si,sg,mid){var ne=lang==='ne',L=ne?'ne':'en',ml=LORD[sg],r=rel(LORD[si],ml),nk=E.nakshatraInfo(mid),nl=nk.index%9,nn=ne?nk.np:nk.en;
 return{nkn:nn,fl:FLV[L][ml],
  rl:ne?'चन्द्रमा '+PN.ne[ml]+'को राशिमा छ। '+PN.ne[ml]+' '+RELT.ne[r]+'।':'The Moon is in a '+PN.en[ml]+'-ruled sign. '+PN.en[ml]+' '+RELT.en[r]+'.',
  nk:ne?nn+' नक्षत्रका स्वामी '+NKL[nl][1]+': '+NKT.ne[nl]+'।':nn+' is ruled by '+NKL[nl][0]+': '+NKT.en[nl]+'.'}}
function dayIns(si,c){var ne=lang==='ne',L=ne?'ne':'en',wd=new Date(c.key+'T12:00:00Z').getUTCDay(),nat=LORD[si],r=rel(nat,wd),col=(r==='own'||r==='friend')?wd:nat;
 return{day:ne?'तपाईंको राशि स्वामी '+PN.ne[nat]+' हो। '+WD.ne[wd]+'को स्वामी '+PN.ne[wd]+'; '+PN.ne[wd]+' '+RELT.ne[r]+'।':'Your sign ruler is '+PN.en[nat]+'. '+WD.en[wd]+' is ruled by '+PN.en[wd]+'; '+PN.en[wd]+' '+RELT.en[r]+'.',
  col:ne?'आजको लागि सहयोगी रङ: '+COLS.ne[col]+'।':'Helpful colour today: '+COLS.en[col]+'.'}}
function bestWin(c,V){if(c.segs.length<2)return'';var b=-9,k=-1,q=hq(V.h[0],V.e[0]),diff=false;c.segs.forEach(function(g,i){var x=sc(V.h[i],V.e[i]);if(hq(V.h[i],V.e[i])!==q)diff=true;if(x>b){b=x;k=i}});if(!diff)return'';var g=c.segs[k],f=Math.max(g.from,c.start),to=Math.min(g.to,c.end);return lang==='ne'?' दिनको राम्रो भाग: '+hm(f)+'–'+hm(to)+'।':' Better part of the day: '+hm(f)+'–'+hm(to)+'.'}
/* ---- 12 rashi cards: each reading is composed from that rashi's own house, aspect, ruler and day ---- */
var LET=['चु, चे, चो, ला, लि, लु, ले, लो, अ','इ, उ, ए, ओ, वा, वि, वु, वे, वो','का, कि, कु, घ, ङ, छ, के, को, हा','हि, हु, हे, हो, डा, डि, डु, डे, डो','मा, मि, मु, मे, मो, टा, टि, टु, टे','टो, पा, पि, पु, ष, ण, ठ, पे, पो','रा, रि, रु, रे, रो, ता, ति, तु, ते','तो, ना, नि, नु, ने, नो, या, यि, यु','ये, यो, भा, भि, भु, धा, फा, ढा, भे','भो, जा, जि, जु, जे, जो, खा, खि, खु, खे, खो, गा, गि','गु, गे, गो, सा, सि, सु, से, सो, दा','दि, दु, थ, झ, ञ, दे, दो, चा, चि'],
 NUM=[1,2,9,5,3,6,8],NKP=[-1,5,0,1,2,-1,4,6,3],
 H2={en:['The Moon is in your own sign, so mind and body are in step. Look after your {B} and start a personal plan you have been postponing.','Family, speech and money are in focus; be careful with {M}. Keep your words gentle at home.','Courage and effort bring results. Short trips, calls and small starts go well, especially in {W}.','Home and comfort ask for attention, but satisfaction arrives slowly. Do not brood; when tired, watch your {B}, and keep vehicle and property papers in order.','Study, children and creative work come forward, but feeling can run ahead of judgment. Double-check decisions about {M}.','A practical mind helps you outwork rivals. A good day to clear dues and routine work in {W}; take care of your {B}.','Partners, clients and the public favour you, and {L} bring ease. Meetings and agreements move smoothly.','Chandrashtama: the Moon is in your eighth house. Expect delays and unease; avoid risks and big signatures, protect your {B} and keep the day simple.','Fortune is mixed and faith is tested a little. Take advice from a teacher or elder before big moves in {W}; avoid long journeys without need.','Work and responsibility are supported. A strong day to take charge in {W} and show results.','Gains and friends are active. Requests and proposals land well, and an old contact may help with {W}.','Expenses and withdrawal are in focus. Rest, prayer and quiet work suit you; keep spending modest, rest your {B} and avoid late nights.'],
  ne:['चन्द्रमा तपाईंकै राशिमा रहँदा मन र शरीर तालमा रहन्छन्। {B}को ख्याल गर्नुहोस् र ढिलो गरेको व्यक्तिगत योजना सुरु गर्नुहोस्।','परिवार, बोली र धन अगाडि आउँछन्; विशेषगरी {M}मा होसियार रहनुहोस्। घरमा बोली मधुर राख्नुहोस्।','साहस र मेहनतले फल दिन्छ। छोटो यात्रा, फोन र साना सुरुवात राम्रो हुन्छन्, विशेषगरी {W} जस्ता क्षेत्रमा।','घर र सुख-सुविधातर्फ ध्यान जान्छ तर सन्तुष्टि ढिलो आउँछ। चिन्तामा नडुब्नुहोस्, थकान हुँदा {B}को ख्याल गर्नुहोस् र सवारी तथा जग्गा-कागजात मिलाउनुहोस्।','अध्ययन, सन्तान र सिर्जनात्मक काम अगाडि आउँछन्, तर भावना निर्णयभन्दा अगाडि दौडन सक्छ। {M}को विषयमा निर्णय दोहोर्‍याएर जाँच्नुहोस्।','व्यावहारिक मनले प्रतिस्पर्धीभन्दा अगाडि बढ्न मद्दत गर्छ। {W} जस्ता क्षेत्रका नियमित काम र बाँकी हिसाब मिलाउन राम्रो दिन; {B}को स्याहार गर्नुहोस्।','साझेदार, ग्राहक र सार्वजनिक व्यवहारमा अनुकूलता रहन्छ। {L}ले सहजता ल्याउँछ; भेटघाट र सम्झौता सहज चल्छन्।','चन्द्राष्टम: चन्द्रमा तपाईंको आठौँ भावमा छ। ढिलाइ र बेचैनी हुन सक्छ; जोखिम र ठूला हस्ताक्षरबाट टाढा बस्नुहोस्, {B}को रक्षा गर्नुहोस् र दिन सरल राख्नुहोस्।','भाग्य मिश्रित रहन्छ र आस्था अलिकति परीक्षा हुन्छ। {W} जस्ता क्षेत्रमा ठूलो कदम चाल्नुअघि गुरु वा ज्येष्ठको सल्लाह लिनुहोस्; आवश्यक नपरे लामो यात्रा नगर्नुहोस्।','काम र जिम्मेवारीमा साथ मिल्छ। {W} जस्ता क्षेत्रमा नेतृत्व लिन र नतिजा देखाउन बलियो दिन।','लाभ र मित्र सक्रिय रहन्छन्। अनुरोध र प्रस्ताव राम्रोसँग स्वीकार हुन्छन् र पुरानो चिनजानले {W} जस्ता क्षेत्रमा काम आउन सक्छ।','खर्च र एकान्तको विषय अगाडि आउँछ। आराम, पूजापाठ र शान्त काम मिल्छ; खर्च सीमित राख्नुहोस्, {B}लाई आराम दिनुहोस् र राति जागा नबस्नुहोस्।']},
 SA={en:[
  {B:'head, face and blood pressure',W:'leadership, sports, engineering or a new venture',M:'hasty spending and risk',L:'direct, passionate dealings'},
  {B:'throat, neck and voice',W:'finance, food, art or comforts',M:'saving and slow, steady growth',L:'loyal bonds that build slowly'},
  {B:'arms, lungs and nerves',W:'writing, teaching, sales or media',M:'small deals and side income',L:'talkative, curious exchanges'},
  {B:'chest, stomach and digestion',W:'care work, hospitality, property or food',M:'the household budget',L:'protective, caring gestures'},
  {B:'heart, spine and back',W:'management, politics, performance or authority roles',M:'generous, status-driven spending',L:'warm, loyal gestures'},
  {B:'intestines, skin and nerves',W:'accounts, health, research or detailed service',M:'every detail of your accounts',L:'practical, caring acts'},
  {B:'kidneys, lower back and skin',W:'law, design, diplomacy or partnerships',M:'shared funds and splitting costs',L:'balanced, harmonious dealings'},
  {B:'reproductive organs, bladder and immunity',W:'research, investigation, medicine or finance',M:'joint money, loans and hidden income',L:'intense, private bonds'},
  {B:'hips, thighs and liver',W:'teaching, law, travel or publishing',M:'big investment plans',L:'free, honest conversations'},
  {B:'knees, bones and joints',W:'administration, construction, government or industry',M:'long-term saving discipline',L:'serious, dependable promises'},
  {B:'shins, ankles and circulation',W:'technology, social work, science or networks',M:'group projects and unusual income',L:'friendly, independent bonds'},
  {B:'feet, sleep and immunity',W:'healing, arts, spirituality or overseas work',M:'giving and quiet saving',L:'gentle, devoted bonds'}],
  ne:[
  {B:'टाउको, अनुहार र रक्तचाप',W:'नेतृत्व, खेलकुद, इन्जिनियरिङ वा नयाँ उद्यम',M:'खर्च र जोखिममा हतार',L:'सोझो र जोशिलो व्यवहार'},
  {B:'घाँटी, गर्धन र स्वर',W:'वित्त, खाद्य, कला वा सुखसुविधाका सामान',M:'बचत र स्थिर वृद्धि',L:'निष्ठावान् र बिस्तारै बलियो हुने सम्बन्ध'},
  {B:'हात, फोक्सो र स्नायु',W:'लेखन, शिक्षण, बिक्री वा सञ्चार',M:'साना सम्झौता र अतिरिक्त आम्दानी',L:'कुराकानी र जिज्ञासाले भरिएको साथ'},
  {B:'छाती, पेट र पाचन',W:'स्याहार, आतिथ्य, घरजग्गा वा खाद्य',M:'घरखर्चको बजेट',L:'स्नेही र रक्षात्मक व्यवहार'},
  {B:'मुटु, मेरुदण्ड र ढाड',W:'व्यवस्थापन, राजनीति, प्रस्तुति वा अधिकारका भूमिका',M:'प्रतिष्ठाका लागि उदार खर्च',L:'न्यानो र निष्ठावान् व्यवहार'},
  {B:'आन्द्रा, छाला र स्नायु',W:'लेखा, स्वास्थ्य, अनुसन्धान वा सूक्ष्म सेवा',M:'हरेक हिसाबको सूक्ष्म लेखाजोखा',L:'व्यावहारिक र स्याहारपूर्ण सहयोग'},
  {B:'मिर्गौला, कम्मर र छाला',W:'कानुन, डिजाइन, कूटनीति वा साझेदारी',M:'साझा रकम र खर्च बाँडफाँड',L:'सन्तुलित र मेलमिलापपूर्ण व्यवहार'},
  {B:'प्रजनन अङ्ग, मूत्राशय र रोग प्रतिरोधक क्षमता',W:'अनुसन्धान, छानबिन, चिकित्सा वा वित्त',M:'साझा रकम, ऋण र लुकेको आम्दानी',L:'गहिरो र निजी सम्बन्ध'},
  {B:'कम्मर, तिघ्रा र कलेजो',W:'शिक्षण, कानुन, यात्रा वा प्रकाशन',M:'ठूला लगानीको योजना',L:'खुला र इमानदार कुराकानी'},
  {B:'घुँडा, हड्डी र जोर्नी',W:'प्रशासन, निर्माण, सरकारी वा उद्योग',M:'दीर्घकालीन बचतको अनुशासन',L:'गम्भीर र भरपर्दो वाचा'},
  {B:'पिँडुला, कुर्कुच्चा र रक्तसञ्चार',W:'प्रविधि, समाजसेवा, विज्ञान वा सञ्जाल',M:'समूहगत परियोजना र असामान्य आम्दानी',L:'मित्रवत् र स्वतन्त्र सम्बन्ध'},
  {B:'पाउ, निद्रा र प्रतिरोधक क्षमता',W:'उपचार, कला, आध्यात्मिकता वा विदेश सम्बन्धी काम',M:'दान र चुपचाप बचत',L:'कोमल र समर्पित सम्बन्ध'}]},
AREA={en:['yourself and your health','money and family','effort, siblings and short trips','home and peace of mind','children, study and creativity','work, debts and health routine','partners and public dealings','sudden changes and hidden matters','luck, teachers and long journeys','career and status','income and friends','expenses and rest'],
  ne:['आफ्नो व्यक्तित्व र स्वास्थ्य','धन र परिवार','प्रयास, दाजुभाइ र छोटो यात्रा','घर र मनको शान्ति','सन्तान, अध्ययन र सिर्जना','काम, ऋण र स्वास्थ्य बानी','साझेदार र सार्वजनिक व्यवहार','अचानक परिवर्तन र गोप्य विषय','भाग्य, गुरु र लामो यात्रा','पेसा र पद','आम्दानी र मित्र','खर्च र विश्राम']},
 SGN={en:[['Your natural drive is backed today; start what you have been putting off.','Your urge to rush works against you today; pause before replying or buying.'],['Your patience pays off; steady, practical steps bring comfort.','Stubbornness can cost you today; stay flexible and avoid impulse spending.'],['Your quick mind finds the right words; a good day for talks and deals.','Too many thoughts scatter your focus; finish one task before taking the next.'],['Your caring nature wins trust; family support is close at hand.','Mood swings are likely; protect your energy and do not take remarks personally.'],['Confidence is high and people respond to your warmth.','Pride may block a good offer; listen first and let others share the credit.'],['Careful planning pays; details you check today save trouble later.','Over-analysing drains you; do the useful thing and let small errors pass.'],['Balance and fairness help you settle a pending matter.','Indecision delays you; choose, even if the choice is not perfect.'],['Your focus and intuition are sharp; dig into what needs understanding.','Suspicion can sour a good situation; ask directly before assuming.'],['Optimism opens doors; share your plans with someone you trust.','Careless promises create trouble; say less and keep what you say.'],['Discipline brings visible progress; stick to the plan.','Heavy duty feels lonely; take a short break and ask for a hand.'],['Original ideas and friends help; try a new approach.','Detachment can look like coldness; keep in touch with those close to you.'],['Intuition and kindness guide you well; trust a quiet inner nudge.','Daydreaming and worry blur reality; write down the facts before deciding.']],
  ne:[['तपाईंको स्वाभाविक जोस आज साथ दिन्छ; ढिलाइ गरेको काम सुरु गर्नुहोस्।','हतारले आज बिगार्न सक्छ; जवाफ वा खरिद गर्नुअघि एक क्षण रोकिनुहोस्।'],['तपाईंको धैर्यले फल दिन्छ; स्थिर र व्यावहारिक कदमले सुख दिन्छ।','जिद्दीले आज नोक्सान गर्न सक्छ; लचिलो बन्नुहोस् र आवेगमा खर्च नगर्नुहोस्।'],['तपाईंको तीक्ष्ण बुद्धिले उचित शब्द भेट्टाउँछ; कुराकानी र सम्झौताका लागि राम्रो।','धेरै सोचले ध्यान छरिन्छ; एउटा काम सक्याएर मात्र अर्को सुरु गर्नुहोस्।'],['तपाईंको स्नेही स्वभावले विश्वास जित्छ; परिवारको साथ नजिकै छ।','मन चलमल हुन सक्छ; ऊर्जा जोगाउनुहोस् र अरूका कुरालाई व्यक्तिगत नलिनुहोस्।'],['आत्मविश्वास उच्च रहन्छ र मानिसले तपाईंको न्यानोपनलाई सकारात्मक लिन्छन्।','अहंकारले राम्रो प्रस्ताव रोक्न सक्छ; पहिले सुन्नुहोस् र श्रेय बाँड्नुहोस्।'],['सावधान योजनाले फल दिन्छ; आज जाँचेका विवरणले पछि समस्या बचाउँछ।','अति विश्लेषणले थकाउँछ; उपयोगी काम गर्नुहोस् र साना त्रुटि जान दिनुहोस्।'],['सन्तुलन र न्यायप्रियताले बाँकी विषय मिलाउन मद्दत गर्छ।','अनिर्णयले ढिलाइ हुन्छ; पूर्ण नभए पनि निर्णय लिनुहोस्।'],['तपाईंको एकाग्रता र अन्तर्ज्ञान तीक्ष्ण छ; बुझ्नुपर्ने विषयमा गहिराइमा जानुहोस्।','शंकाले राम्रो अवस्था बिगार्न सक्छ; अनुमान गर्नुअघि सोझै सोध्नुहोस्।'],['आशावादी सोचले ढोका खोल्छ; योजना विश्वासिलो व्यक्तिसँग बाँड्नुहोस्।','लापरवाह वाचाले समस्या ल्याउँछ; कम बोल्नुहोस् र बोलेको निभाउनुहोस्।'],['अनुशासनले देखिने प्रगति दिन्छ; योजनामै अडिनुहोस्।','भारी जिम्मेवारीले एक्लो लाग्छ; छोटो विश्राम लिनुहोस् र सहयोग माग्नुहोस्।'],['मौलिक विचार र मित्रले साथ दिन्छन्; नयाँ तरिका आजमाउनुहोस्।','अलगावलाई चिसोपन ठानिन सक्छ; नजिकका मानिससँग सम्पर्कमा रहनुहोस्।'],['अन्तर्ज्ञान र दयाले राम्रो दिशा दिन्छ; मनको शान्त सङ्केतमा विश्वास गर्नुहोस्।','दिवास्वप्न र चिन्ताले यथार्थ धमिलो हुन्छ; निर्णय गर्नुअघि तथ्य लेख्नुहोस्।']]};
function mt(i,h){var L=lang==='ne'?'ne':'en',a=SA[L][i];return H2[L][h-1].replace(/\{(B|W|M|L)\}/g,function(m,k){return a[k]})}
function pkTxt(br){return lang==='ne'?(br?'चन्द्रमा बलियो (उज्यालो चरण): फल पूर्ण रूपमा मिल्छ।':'चन्द्रमा कमजोर (कृष्ण अष्टमीदेखि शुक्ल सप्तमीसम्म): शुभ फल केही घट्छ।'):(br?'Moon is strong (bright phase): results come in full.':'Moon is weak (dark phase, Krishna Ashtami to Shukla Saptami): good results are reduced.')}
/* per-rashi life-area lines: [career, money, home & love, health] */
var DOM={en:[['You lead best when free to start things; your initiative is noticed.','Income comes through initiative, but impulse buying drains it.','Home responds to your protective, direct manner; soften your tone.','Head, fevers and blood pressure are sensitive; avoid overheating and rushing.'],
['Steady, quality work earns trust; you do best in familiar fields.','You save well and grow wealth slowly; avoid spending only on comfort.','Loyalty and good food keep the home warm; stubbornness is the risk.','Throat, neck and weight need care; keep meals light and regular.'],
['Communication, writing and quick thinking carry your work forward.','Several small sources help you; keep track so none slips away.','Talk and humour ease tension, but listen as much as you speak.','Lungs, arms and nerves need rest; do not overload your schedule.'],
['Caring, service-minded work suits you; trust your instincts with people.','You are careful with money and save for family security.','Home and mother are your anchor; feelings run deep, so be gentle.','Chest, stomach and moods are linked; eat on time and stay calm.'],
['You shine in leadership roles; recognition follows steady effort.','You spend generously for status; budget before showing off.','Warmth and loyalty hold the family; avoid wounded pride.','Heart, back and blood pressure need attention; rest when tired.'],
['Detail, analysis and service make you valuable; accuracy is your edge.','Careful budgeting works; do not let worry make you stingy.','You help quietly at home; offer kind words, not only corrections.','Digestion and nerves are sensitive; keep meals clean and routine regular.'],
['Fair dealing and partnerships help your work; diplomacy opens doors.','Money comes through agreements and partners; avoid spending to please others.','Harmony matters to you; decide issues instead of keeping peace by silence.','Kidneys and lower back need care; drink water and avoid long sitting.'],
['Depth and research set you apart; work behind the scenes pays.','Shared money, loans and hidden income need clear records.','Loyalty runs deep, and so do silences; share what you feel.','Reproductive and excretory health need regularity; do not ignore small signs.'],
['Teaching, advice, travel and law suit you; aim at bigger goals.','Luck helps income, but over-confidence can cost you; keep a reserve.','Freedom and honesty shape your bonds; honour small promises at home.','Hips, thighs and liver need care; avoid heavy food and over-exertion.'],
['Discipline and long effort bring authority; you are trusted with duty.','Savings grow slowly through hard work; avoid fear-driven stinginess.','You show love by providing; make time to be present as well.','Knees, bones and joints need warmth and rest; do not skip stretching.'],
['Unusual ideas and technology help; networks bring the opportunity.','Income comes through friends and groups; avoid risky experiments.','You value space in relationships; say clearly what you need.','Calves, ankles and circulation need care; move often and keep warm.'],
['Creative, healing and spiritual work suit you; trust your intuition.','Money slips away through kindness or confusion; keep clear accounts.','You give more than you ask; protect your own energy too.','Feet, sleep and immunity need care; avoid late nights and rest well.']],
ne:[['स्वतन्त्र भएर काम सुरु गर्दा तपाईं सबैभन्दा राम्रो गर्नुहुन्छ; तपाईंको पहल देखिन्छ।','आम्दानी पहलबाट आउँछ, तर आवेगमा खरिदले खर्च बढाउँछ।','तपाईंको रक्षात्मक र सीधा स्वभावमा घर प्रतिक्रिया दिन्छ; बोली नरम राख्नुहोस्।','टाउको, ज्वरो र रक्तचाप संवेदनशील छन्; ताप र हतारबाट जोगिनुहोस्।'],
['स्थिर र गुणस्तरीय कामले विश्वास जित्छ; परिचित क्षेत्रमा राम्रो गर्नुहुन्छ।','बचत राम्रो हुन्छ र धन बिस्तारै बढ्छ; सुखसुविधामै मात्र खर्च नगर्नुहोस्।','निष्ठा र राम्रो खानाले घर न्यानो राख्छ; जिद्दी नै जोखिम हो।','घाँटी, ढाड र तौलमा ध्यान दिनुहोस्; खाना हल्का र नियमित राख्नुहोस्।'],
['सञ्चार, लेखन र तीक्ष्ण सोचले काम अघि बढाउँछ।','धेरै साना स्रोतले साथ दिन्छन्; कुनै नछुटोस् भनी हिसाब राख्नुहोस्।','कुराकानी र हास्यले तनाव घटाउँछ, तर बोल्नुजति सुन्नुहोस्।','फोक्सो, पाखुरा र स्नायुलाई आराम चाहिन्छ; तालिका बोझिलो नबनाउनुहोस्।'],
['स्याहार र सेवामूलक काम मिल्छ; मानिससँगको व्यवहारमा अन्तर्ज्ञानमा भरोसा गर्नुहोस्।','तपाईं पैसामा होसियार हुनुहुन्छ र परिवारको सुरक्षाका लागि जोगाउनुहुन्छ।','घर र आमा तपाईंको आधार हुन्; भावना गहिरो छ, त्यसैले कोमल रहनुहोस्।','छाती, पेट र मनस्थिति जोडिएका छन्; समयमै खानुहोस् र शान्त रहनुहोस्।'],
['नेतृत्वमा तपाईं चम्कनुहुन्छ; निरन्तर प्रयासपछि मान्यता आउँछ।','प्रतिष्ठाका लागि उदार भएर खर्च गर्नुहुन्छ; देखावटअघि बजेट बनाउनुहोस्।','न्यानोपन र निष्ठाले परिवार बाँध्छ; चोट खाएको अहंकारबाट जोगिनुहोस्।','मुटु, ढाड र रक्तचापमा ध्यान दिनुहोस्; थाकेपछि आराम गर्नुहोस्।'],
['विवरण, विश्लेषण र सेवाले तपाईंलाई मूल्यवान् बनाउँछ; शुद्धता तपाईंको बल हो।','होसियारीपूर्वक बजेट बनाउनु राम्रो; चिन्ताले कन्जुस नबनाउनुहोस्।','घरमा चुपचाप सहयोग गर्नुहुन्छ; सुधार मात्र होइन, मीठा शब्द पनि भन्नुहोस्।','पाचन र स्नायु संवेदनशील छन्; खाना सफा र दिनचर्या नियमित राख्नुहोस्।'],
['न्यायपूर्ण व्यवहार र साझेदारीले काम सहज बनाउँछ; कूटनीतिले ढोका खोल्छ।','सम्झौता र साझेदारबाट पैसा आउँछ; अरूलाई खुसी पार्न खर्च नगर्नुहोस्।','मेलमिलाप तपाईंलाई प्यारो छ; मौन बसेर शान्ति राख्नुको सट्टा निर्णय गर्नुहोस्।','मिर्गौला र तल्लो ढाडको ख्याल गर्नुहोस्; पानी पिउनुहोस् र लामो समय नबस्नुहोस्।'],
['गहिराइ र अनुसन्धानले तपाईंलाई अलग बनाउँछ; पर्दा पछाडिको काम फलदायी हुन्छ।','साझा धन, ऋण र लुकेको आम्दानीमा स्पष्ट अभिलेख राख्नुहोस्।','निष्ठा गहिरो छ, मौनता पनि; मनमा भएको कुरा बाँड्नुहोस्।','प्रजनन र उत्सर्जन स्वास्थ्यमा नियमितता चाहिन्छ; सानो संकेत नटार्नुहोस्।'],
['शिक्षण, सल्लाह, यात्रा र कानुन मिल्छ; ठूला लक्ष्य राख्नुहोस्।','भाग्यले आम्दानीमा साथ दिन्छ, तर अति आत्मविश्वासले नोक्सान हुन सक्छ; जगेडा राख्नुहोस्।','स्वतन्त्रता र इमानदारीले सम्बन्ध बनाउँछ; घरमा साना वाचा पनि निभाउनुहोस्।','कम्मर, तिघ्रा र कलेजोको ख्याल गर्नुहोस्; गरिष्ठ खाना र अति परिश्रमबाट जोगिनुहोस्।'],
['अनुशासन र लामो प्रयासले अधिकार दिन्छ; तपाईंलाई जिम्मेवारी सुम्पिन्छन्।','कडा मेहनतले बचत बिस्तारै बढ्छ; डरले कन्जुस नबन्नुहोस्।','तपाईं जुटाएर माया देखाउनुहुन्छ; उपस्थित रहने समय पनि निकाल्नुहोस्।','घुँडा, हड्डी र जोर्नीलाई न्यानो र आराम चाहिन्छ; व्यायाम नछोड्नुहोस्।'],
['असामान्य विचार र प्रविधिले मद्दत गर्छ; सञ्जालबाट अवसर आउँछ।','मित्र र समूहबाट आम्दानी आउँछ; जोखिमपूर्ण प्रयोगबाट जोगिनुहोस्।','सम्बन्धमा तपाईं ठाउँ चाहनुहुन्छ; के चाहिन्छ स्पष्ट भन्नुहोस्।','पिँडुला, खुट्टा र रक्तसञ्चारमा ख्याल गर्नुहोस्; हिँडडुल गर्नुहोस् र न्यानो रहनुहोस्।'],
['सिर्जनात्मक, उपचार र आध्यात्मिक काम मिल्छ; अन्तर्ज्ञानमा भरोसा गर्नुहोस्।','दया वा अन्योलले पैसा खसी जान सक्छ; हिसाब स्पष्ट राख्नुहोस्।','तपाईं माग्नुभन्दा बढी दिनुहुन्छ; आफ्नो ऊर्जा पनि जोगाउनुहोस्।','खुट्टा, निद्रा र प्रतिरक्षामा ध्यान दिनुहोस्; राति नजाग्नुहोस् र राम्ररी सुत्नुहोस्।']]},
 DLB={en:['Career','Money','Home & love','Health'],ne:['पेसा','धन','घर र प्रेम','स्वास्थ्य']},
 DH=[3,1,0,2,2,3,2,3,0,0,1,1],
 TN={en:['Today\'s Moon supports this.','Today\'s Moon is neutral here, so effort decides.','Today\'s Moon adds some friction here, so go slowly.'],ne:['आजको चन्द्रमाले यसमा साथ दिन्छ।','आजको चन्द्रमा यसमा सम छ, त्यसैले प्रयासले निर्णय गर्छ।','आजको चन्द्रमाले यसमा केही अवरोध ल्याउँछ, त्यसैले ढिलो अघि बढ्नुहोस्।']};
function dTone(i,d,ml){var dl=[LORD[(i+9)%12],LORD[(i+1)%12],LORD[(i+3)%12],LORD[i]][d],r=rel(dl,ml);return r==='enemy'?2:(r==='neutral'?1:0)}
/* ---- planetary positions: JPL Keplerian elements (1800-2050), sidereal Lahiri, mean node ---- */
var PEL=[[0.38709927,0.00000037,0.20563593,0.00001906,7.00497902,-0.00594749,252.25032350,149472.67411175,77.45779628,0.16047689,48.33076593,-0.12534081],
[0.72333566,0.00000390,0.00677672,-0.00004107,3.39467605,-0.00078890,181.97909950,58517.81538729,131.60246718,0.00268329,76.67984255,-0.27769418],
[1.00000261,0.00000562,0.01671123,-0.00004392,-0.00001531,-0.01294668,100.46457166,35999.37244981,102.93768193,0.32327364,0,0],
[1.52371034,0.00001847,0.09339410,0.00007882,1.84969142,-0.00813131,-4.55343205,19140.30268499,-23.94362959,0.44441088,49.55953891,-0.29257343],
[5.20288700,-0.00011607,0.04838624,-0.00013253,1.30439695,-0.00183714,34.39644051,3034.74612775,14.72847983,0.21252668,100.47390909,0.20469106],
[9.53667594,-0.00125060,0.05386179,-0.00050991,2.48599187,0.00193609,49.95424423,1222.49362201,92.59887831,-0.41897216,113.66242448,-0.28867794]],
 PMAP={2:3,3:0,4:4,5:1,6:5};
function nrm(x){return((x%360)+360)%360}
function hel(k,T){var e=PEL[k],a=e[0]+e[1]*T,ec=e[2]+e[3]*T,I=(e[4]+e[5]*T)*Math.PI/180,L=e[6]+e[7]*T,w=e[8]+e[9]*T,Od=e[10]+e[11]*T,O=Od*Math.PI/180,Mr=(((L-w)%360+540)%360-180)*Math.PI/180,Ee=Mr+ec*Math.sin(Mr);
 for(var n=0;n<10;n++)Ee+=(Mr-Ee+ec*Math.sin(Ee))/(1-ec*Math.cos(Ee));
 var xp=a*(Math.cos(Ee)-ec),yp=a*Math.sqrt(1-ec*ec)*Math.sin(Ee),om=(w-Od)*Math.PI/180,co=Math.cos(om),so=Math.sin(om),cO=Math.cos(O),sO=Math.sin(O),cI=Math.cos(I),sI=Math.sin(I);
 return[(co*cO-so*sO*cI)*xp+(-so*cO-co*sO*cI)*yp,(co*sO+so*cO*cI)*xp+(-so*sO+co*cO*cI)*yp,so*sI*xp+co*sI*yp]}
function lonP(p,ms){if(p===1)return E.moonSidereal(ms);var T=(ms/86400000+2440587.5-2451545)/36525;
 if(p===7||p===8)return nrm(125.04452-1934.136261*T+0.0020708*T*T-E.ayanamsa(ms)+(p===8?180:0));
 var ea=hel(2,T);if(p===0)return nrm(Math.atan2(-ea[1],-ea[0])*180/Math.PI-23.857092);
 var pp=hel(PMAP[p],T);return nrm(Math.atan2(pp[1]-ea[1],pp[0]-ea[0])*180/Math.PI-23.857092)}
function isR(p,ms){if(p===7||p===8)return true;if(p<2)return false;var d=lonP(p,ms+864e5)-lonP(p,ms-864e5);return((d+540)%360-180)<0}
var plc={};function planetsDay(c){var k=c.key;if(plc[k])return plc[k];var m=(c.start+c.end)/2;return plc[k]=[0,1,2,3,4,5,6,7,8].map(function(p){var l=lonP(p,m);return{p:p,l:l,s:Math.floor(l/30),r:isR(p,m)}})}
function dm(l){var d=l%30,m=Math.floor((d%1)*60);return Math.floor(d)+'°'+(m<10?'0':'')+m+'′'}

/* ---- Moon-sign gochar rules (whole-sign houses from each rashi), bilingual sections ---- */
var PNX={en:['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'],ne:['सूर्य','चन्द्र','मंगल','बुध','गुरु','शुक्र','शनि','राहु','केतु']},
 FAVP=[[3,6,10,11],[1,3,6,7,10,11],[3,6,11],[2,4,6,8,10,11],[2,5,7,9,11],[1,2,3,4,5,8,9,11,12],[3,6,11],[3,6,10,11],[3,6,11]],WT=[1,1.5,1,1,1.5,1,1.5,1.2,1],
 ORD={en:['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'],ne:['पहिलो','दोस्रो','तेस्रो','चौथो','पाँचौँ','छैटौँ','सातौँ','आठौँ','नवौँ','दसौँ','एघारौँ','बाह्रौँ']},
 DD=[{p:[0,6,2],h:[10]},{p:[4,5,3],h:[2,11]},{p:[5,2,4],h:[7]},{p:[1,4,6],h:[4]},{p:[0,2,6,7],h:[6,1]}],
 HA={en:{1:'self',2:'money and family',4:'home',6:'health and routine',7:'partnership',10:'career',11:'gains'},ne:{1:'आफू',2:'धन र परिवार',4:'घर',6:'स्वास्थ्य र दिनचर्या',7:'साझेदारी',10:'पेसा',11:'लाभ'}},
 LAB={en:['Today\'s Theme','Career and Work','Money and Finances','Love and Relationships','Family and Personal Life','Health and Well-being','Opportunity','Caution','Advice for Today','Astrological Basis'],ne:['आजको मुख्य संकेत','करियर तथा काम','धन तथा आर्थिक पक्ष','प्रेम तथा सम्बन्ध','परिवार तथा व्यक्तिगत जीवन','स्वास्थ्य तथा तन्दुरुस्ती','अवसर','सावधानी','आजको सुझाव','ज्योतिषीय आधार']},
 DT={en:[['Work matters are supported; responsibilities can be handled with confidence.','Work is a mixed picture; steady routine beats big moves.','Work may feel slow or contested; keep to essentials and communicate clearly.'],
  ['Money matters look more organised; a sensible review or planned purchase is fine.','Finances are mixed; keep spending to planned items.','Hold back on large or impulsive spending and keep clear records.'],
  ['Relationships feel easier; kind, open conversation is rewarded.','Relationships need a balance between talking and listening.','Misunderstandings come easily; choose words and timing carefully.'],
  ['Home life is supportive and cooperation comes naturally.','Home needs some patience; small duties may compete for time.','Family matters need tact; avoid reopening old disagreements.'],
  ['Energy is fairly steady; keep your routines going.','Energy fluctuates; regular meals and rest help.','Stress or fatigue may show up; prefer rest and a lighter schedule.']],
 ne:[['काममा साथ मिल्छ; जिम्मेवारी आत्मविश्वासका साथ सम्हाल्न सकिन्छ।','काममा मिश्रित अवस्था छ; ठूला चाल भन्दा स्थिर दिनचर्या राम्रो।','काम ढिलो वा विवादित लाग्न सक्छ; आवश्यक कुरामै सीमित रहनुहोस् र स्पष्ट बोल्नुहोस्।'],
  ['आर्थिक कुरा व्यवस्थित देखिन्छ; सोचेर गरिने समीक्षा वा योजनाबद्ध खरिद ठीक छ।','आर्थिक अवस्था मिश्रित छ; खर्च योजनाबद्ध कुरामै सीमित राख्नुहोस्।','ठूलो वा आवेगमा हुने खर्च रोक्नुहोस् र हिसाब स्पष्ट राख्नुहोस्।'],
  ['सम्बन्ध सहज लाग्छ; मायालु र खुला कुराकानीले फल दिन्छ।','सम्बन्धमा बोल्ने र सुन्ने सन्तुलन चाहिन्छ।','गलतफहमी सजिलै हुन सक्छ; शब्द र समय सोचेर छान्नुहोस्।'],
  ['घरको वातावरण सहयोगी रहन्छ र सहकार्य स्वाभाविक लाग्छ।','घरमा केही धैर्य चाहिन्छ; साना जिम्मेवारीले समय बाँड्न सक्छन्।','पारिवारिक कुरामा चातुर्य चाहिन्छ; पुराना मतभेद नकोट्याउनुहोस्।'],
  ['ऊर्जा लगभग स्थिर छ; दिनचर्या जारी राख्नुहोस्।','ऊर्जा घटबढ हुन सक्छ; नियमित खाना र आराम उपयोगी हुन्छ।','तनाव वा थकान देखिन सक्छ; आराम र हल्का तालिका रोज्नुहोस्।']]},
 OPP={en:['Take initiative with seniors or officials; clear, confident requests land well.','Use the day\'s emotional steadiness for family and personal matters.','Use extra energy for a task that needs courage or physical effort.','Messages, paperwork, study and negotiations are worth your focus.','Seek advice or teaching and plan for the longer term.','Invest in harmony: relationships, art, comfort and fair agreements.','Steady, disciplined work on a long-term duty will hold its value.','Fresh ideas, technology or unconventional methods may be worth testing.','Quiet study, reflection and letting go of clutter will help.'],
  ne:['ठूला वा अधिकारीसँग पहल गर्नुहोस्; स्पष्ट र आत्मविश्वासी अनुरोध राम्रो लाग्छ।','चन्द्रको भावनात्मक स्थिरता परिवार र व्यक्तिगत कुरामा प्रयोग गर्नुहोस्।','अतिरिक्त ऊर्जा साहस वा शारीरिक मेहनत चाहिने काममा लगाउनुहोस्।','सन्देश, कागजात, अध्ययन र वार्तामा ध्यान दिनु उपयोगी हुन्छ।','सल्लाह वा शिक्षा लिनुहोस् र लामो अवधिको योजना बनाउनुहोस्।','मेलमिलापमा लगानी गर्नुहोस्: सम्बन्ध, कला, सुख-सुविधा र न्यायपूर्ण सम्झौता।','दीर्घकालीन कर्तव्यमा स्थिर र अनुशासित काम टिकाउ हुन्छ।','नयाँ विचार, प्रविधि वा अपरम्परागत तरिका परीक्षण गर्न लायक हुन सक्छ।','शान्त अध्ययन, मनन र अनावश्यक कुरा छाड्नु उपयोगी हुन्छ।']},
 CAU={en:['Avoid ego clashes with authority figures and overexertion.','Avoid acting on passing moods; give feelings time to settle.','Watch temper, haste and risk-taking.','Re-read messages and documents; avoid hasty or careless words.','Avoid over-promising or assuming things will work out by themselves.','Watch overspending, and avoiding hard conversations just to keep the peace.','Expect delays and heavy responsibility; do not push against them.','Be wary of confusion, shortcuts and unclear offers; verify details.','Avoid withdrawing completely or making sudden cuts in plans.'],
  ne:['अधिकारीसँग अहंकारको टकराव र अति परिश्रमबाट जोगिनुहोस्।','क्षणिक मनस्थितिमा काम नगर्नुहोस्; भावनालाई शान्त हुन समय दिनुहोस्।','रीस, हतार र जोखिम लिने बानीमा ध्यान दिनुहोस्।','सन्देश र कागजात दोहोर्‍याएर पढ्नुहोस्; हतार वा लापरवाह शब्दबाट जोगिनुहोस्।','धेरै वाचा गर्ने वा आफैँ मिल्छ भन्ने ठान्नेबाट जोगिनुहोस्।','अति खर्च र शान्ति राख्न कठिन कुरा टार्ने बानीमा ध्यान दिनुहोस्।','ढिलाइ र भारी जिम्मेवारी आउन सक्छ; तिनको विरोध नगर्नुहोस्।','अन्योल, छोटो बाटो र अस्पष्ट प्रस्तावदेखि सावधान रहनुहोस्; विवरण जाँच्नुहोस्।','पूर्ण रूपमा अलग हुने वा योजना अचानक काट्नेबाट जोगिनुहोस्।']};
function pn(p){return PNX[lang==='ne'?'ne':'en'][p]}
function bcT(p,h,f){return lang==='ne'?pn(p)+' तपाईंको '+ORD.ne[h-1]+' भावमा रहेकाले '+(f?'यसमा साथ मिल्छ।':'यसमा होसियारी चाहिन्छ।'):pn(p)+' in your '+ORD.en[h-1]+' house '+(f?'supports this.':'asks for care here.')}
function sRead(i,c){var ne=lang==='ne',L=ne?'ne':'en',V=verdictFor(c,i),PL=planetsDay(c),mains=[],more='',bar=[],dom=0,dd=-1,wd=new Date(c.key+'T12:00:00Z').getUTCDay();
 c.segs.forEach(function(g,k){var f=Math.max(g.from,c.start),to=Math.min(g.to,c.end),h=V.h[k],w=to-f,mid=(f+to)/2,I=ins(i,g.sign,mid),when=c.segs.length>1?hm(f)+'–'+hm(to):'',el=V.e[k];if(w>dd){dd=w;dom=k}
  mains.push((when?when+': ':'')+mt(i,h));bar.push({q:hq(h,el),w:w});
  more+='<div class="rsq q-'+hq(h,el)+'"><p class="rw">'+esc((when?when+' · ':'')+(ne?'चन्द्रमा '+SIGNS[g.sign].np+'मा · '+SIGNS[i].np+'बाट '+h+' भाव':'Moon in '+SIGNS[g.sign].en+' · house '+h+' from '+SIGNS[i].en)+' · '+I.nkn)+'</p><p>'+esc(I.rl)+'</p><p class="rw">'+esc(pkTxt(V.e[k]>=84&&V.e[k]<264))+'</p></div>'});
 var hd=V.h[dom],xs=sc(hd,V.e[dom]),hs=PL.map(function(x){return((x.s-i+12)%12)+1});hs[1]=hd;
 function val(p){return p===1?(xs>=.5?1:(xs<=-.2?-1:0)):(FAVP[p].indexOf(hs[p])>-1?1:-1)}
 var tw=0,tt=0;for(var p=0;p<9;p++){tw+=WT[p];tt+=WT[p]*val(p)}var ov=tt/tw,q=ov>=.25?'good':(ov<=-.25?'bad':'mixed'),vv=V.v==='ctr'?'ctr':q;if(vv==='ctr')q='bad';
 function dsent(d){var ps=DD[d].p,s=0,w=0,best=-1,bw=0;ps.forEach(function(p){var v=val(p);s+=WT[p]*v;w+=WT[p];if(v!==0&&WT[p]>bw){bw=WT[p];best=p}});var a=s/w,t=a>=.34?0:(a<=-.34?2:1),o='';
  var occ=-1,ow=0;DD[d].h.forEach(function(h){PL.forEach(function(x){if(x.p!==1&&hs[x.p]===h&&x.p!==best&&WT[x.p]>ow){ow=WT[x.p];occ=x.p}})});
  if(occ>-1){var oh=hs[occ],ar=HA[L][oh];o=' '+(ne?pn(occ)+' तपाईंको '+ORD.ne[oh-1]+' भाव ('+ar+') मा पनि छ।':pn(occ)+' also occupies your '+ORD.en[oh-1]+' house of '+ar+'.')}
  var sl=d===0?DOM[L][i][0]:d===1?DOM[L][i][1]:d===3?DOM[L][i][2]:d===4?DOM[L][i][3]:'';
  return(sl?sl+' ':'')+DT[L][d][t]+(best>-1?' '+bcT(best,hs[best],val(best)>0):'')+o}
 var bp=-1,bv=0,wp=-1,wv=0;for(var p=0;p<9;p++){var z=WT[p]*val(p);if(z>bv){bv=z;bp=p}if(z<wv){wv=z;wp=p}}
 var opp=bp>-1?OPP[L][bp]+' '+bcT(bp,hs[bp],true):(ne?'कुनै एक क्षेत्र विशेष देखिँदैन; दिनचर्यामै स्थिर रहनुहोस्।':'No single area stands out; keep to your routine.'),
  cau=wp>-1?CAU[L][wp]+' '+bcT(wp,hs[wp],false):(ne?'ठूलो सावधानी देखिँदैन; विवरणमा ध्यान दिनुहोस्।':'No major caution stands out; stay attentive to details.'),
  sg=SGN[L][i][q==='good'?0:1],
  basis=PL.map(function(x){var h=x.p===1?hd:hs[x.p],sn=x.p===1?c.segs[dom].sign:x.s;return pn(x.p)+' '+(ne?SIGNS[sn].np:SIGNS[sn].tr)+(x.r?' (R)':'')+' – '+h}).join('; ')+(ne?'। मूल राशिबाट सम्पूर्ण-राशि भाव गणना; परम्परागत गोचर नियम (फलदीपिका); राहु-केतु मध्यम नोड; लाहिरी अयनांश।':'. Whole-sign houses counted from your Moon sign; traditional gochar rules (Phaladeepika); mean node for Rahu/Ketu; Lahiri ayanamsha.'),
  tp=(function(){var b=-1,m=0;for(var p=0;p<9;p++){if(p===1)continue;var z=WT[p]*Math.abs(val(p));if(z>m){m=z;b=p}}return b})(),thA=tp>-1?' '+(ne?'पृष्ठभूमिमा '+pn(tp)+(PL[tp].r?' (वक्री)':'')+' तपाईंको '+ORD.ne[hs[tp]-1]+' भावमा रहेकाले यो दिनको मुख्य ग्रहीय प्रभाव परम्परागत रूपमा '+(val(tp)>0?'सहयोगी':'परीक्षाजनक')+' छ।':'In the background, '+pn(tp)+(PL[tp].r?' (retrograde)':'')+' in your '+ORD.en[hs[tp]-1]+' house is the day\'s main planetary influence, traditionally '+(val(tp)>0?'supportive':'demanding')+' from there.'):'',
  secs=[mains.join(' ')+thA,dsent(0),dsent(1),dsent(2),dsent(3),dsent(4),opp,cau,sg,basis],day=dayIns(i,c).day,best2=bestWin(c,V),main1=mt(i,hd);
 var html='';secs.forEach(function(t,k){html+='<p><b>'+LAB[L][k]+':</b> '+esc(t)+'</p>'});
 return{v:vv,q:q,bar:bar,short:main1+' '+sg,cardTxt:main1+' '+sg,full:secs.map(function(t,k){return LAB[L][k]+': '+t}).join(' ')+' '+day+best2,more:'<div class="rdm">'+html+'</div><p class="rw">'+esc(day+best2)+'</p>'+more}}
/* ---- graphics: live sky wheel (all nine grahas) and a gochar chart inside every rashi card ---- */
var PCOL=['#ff9a2e','#ffe500','#e5484d','#3fb27f','#d9a441','#f3c6e8','#6ea8ff','#9aa7bd','#7e8aa0'],AB={en:['Su','Mo','Ma','Me','Ju','Ve','Sa','Ra','Ke'],ne:['सू','चं','मं','बु','गु','शु','श','रा','के']},
 CELL={11:[0,0],0:[0,1],1:[0,2],2:[0,3],10:[1,0],3:[1,3],9:[2,0],4:[2,3],8:[3,0],7:[3,1],6:[3,2],5:[3,3]};
function skyHtml(c){var ne=lang==='ne',PL=planetsDay(c),cx=160,cy=160,R=Math.PI/180,pt=function(a,r){return[(cx+r*Math.sin(a*R)).toFixed(1),(cy-r*Math.cos(a*R)).toFixed(1)]},
 v='<svg viewBox="0 0 320 320" role="img" aria-label="'+(ne?'आजको आकाश':'Today\'s sky')+'"><defs><radialGradient id="skg" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#0d4aa8"/><stop offset=".5" stop-color="#052962"/><stop offset="1" stop-color="#021634"/></radialGradient><filter id="skb" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4"/></filter></defs><rect width="320" height="320" rx="26" fill="url(#skg)"/>';
 for(var k=0;k<38;k++)v+='<circle class="sky-tw" style="--d:'+((k*37%30)/10).toFixed(1)+'s" cx="'+(k*83%316+2)+'" cy="'+(k*131%316+2)+'" r="'+(.6+(k%3)*.4)+'" fill="#fff"/>';
 for(var s=0;s<12;s++){var a0=s*30,a1=a0+30,p0=pt(a0,118),p1=pt(a0,150),p2=pt(a1,150),p3=pt(a1,118),m=pt(a0+15,134);
  v+='<path d="M'+p0+'L'+p1+'A150 150 0 0 1 '+p2+'L'+p3+'A118 118 0 0 0 '+p0+'Z" fill="rgba(255,255,255,'+(s%2?.03:.08)+')" stroke="rgba(255,255,255,.18)" stroke-width=".8"/><text x="'+m[0]+'" y="'+m[1]+'" text-anchor="middle" dominant-baseline="central" font-size="15" fill="#ffe500" opacity=".92">'+G(s)+'</text>'}
 v+='<g class="sky-rot"><circle cx="160" cy="160" r="112" fill="none" stroke="rgba(255,229,0,.45)" stroke-width="1.4" stroke-dasharray="2 8"/></g><circle cx="160" cy="160" r="46" fill="none" stroke="rgba(255,255,255,.14)"/>';
 var ord=PL.filter(function(x){return x.p!==1}).sort(function(a,b){return a.l-b.l}),tier=0,pl=-99,rad=[98,78,58];
 ord.forEach(function(x,n){tier=(x.l-pl<11&&n)?(tier+1)%3:0;pl=x.l;x.t=tier});
 ord.concat(PL.filter(function(x){return x.p===1})).forEach(function(x){var mo=x.p===1,r=mo?98:rad[x.t],q=pt(x.l,r),nm=AB[ne?'ne':'en'][x.p];
  if(mo)v+='<circle cx="'+q[0]+'" cy="'+q[1]+'" r="22" fill="#ffe500" opacity=".5" filter="url(#skb)"/>';
  v+='<g'+(mo?' class="sky-moon"':'')+'><circle cx="'+q[0]+'" cy="'+q[1]+'" r="'+(mo?13:10.5)+'" fill="'+PCOL[x.p]+'" stroke="#021634" stroke-width="1.5"/><text x="'+q[0]+'" y="'+q[1]+'" text-anchor="middle" dominant-baseline="central" font-size="'+(ne?9:8.5)+'" font-weight="700" fill="#021634">'+nm+'</text>'+(x.r&&x.p>1&&x.p<7?'<text x="'+(+q[0]+9)+'" y="'+(+q[1]-9)+'" font-size="7.5" font-weight="700" fill="#fff">R</text>':'')+'</g>'});
 var ms=PL[1].s;v+='<text x="160" y="152" text-anchor="middle" dominant-baseline="central" font-size="30" fill="#ffe500">'+G(ms)+'</text><text x="160" y="178" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">'+esc(ne?SIGNS[ms].np:SIGNS[ms].tr)+'</text><text x="160" y="192" text-anchor="middle" font-size="8.5" fill="#fff" opacity=".7">'+(ne?'चन्द्रमा':'Moon')+'</text></svg>';
 var lg=PL.map(function(x){return'<span><i style="background:'+PCOL[x.p]+'"></i>'+esc(pn(x.p))+(x.r&&x.p>1&&x.p<7?' (R)':'')+'</span>'}).join('');
 return'<section class="sky"><h3>'+(ne?'आजको आकाश (निरयन)':'Today\'s sky (sidereal)')+'</h3>'+v+'<div class="skl">'+lg+'</div></section>'}
function chartHtml(i,PL){var ne=lang==='ne',L=ne?'ne':'en',S=60,v='<svg viewBox="0 0 240 240" role="img" aria-label="'+(ne?'गोचर चक्र':'Gochar chart')+'"><rect width="240" height="240" rx="14" fill="#052962"/>',by={};
 PL.forEach(function(x){(by[x.s]=by[x.s]||[]).push(x)});
 for(var s=0;s<12;s++){var rc=CELL[s],x=rc[1]*S,y=rc[0]*S,h=((s-i+12)%12)+1,own=s===i;
  v+='<rect x="'+x+'" y="'+y+'" width="'+S+'" height="'+S+'" fill="'+(own?'rgba(255,229,0,.22)':'rgba(255,255,255,.05)')+'" stroke="rgba(255,255,255,.35)" stroke-width="1"/>'+(own?'<line x1="'+x+'" y1="'+y+'" x2="'+(x+14)+'" y2="'+y+'" stroke="#ffe500" stroke-width="2"/><line x1="'+x+'" y1="'+y+'" x2="'+x+'" y2="'+(y+14)+'" stroke="#ffe500" stroke-width="2"/>':'')+'<text x="'+(x+S-5)+'" y="'+(y+11)+'" text-anchor="end" font-size="9" fill="'+(own?'#ffe500':'#9fb7e0')+'">'+h+'</text>';
  (by[s]||[]).forEach(function(p,n){var col=n%2,row=Math.floor(n/2);v+='<text x="'+(x+8+col*26)+'" y="'+(y+26+row*14)+'" font-size="'+(ne?11:10.5)+'" font-weight="700" fill="'+(p.p===1?'#ffe500':'#fff')+'">'+AB[L][p.p]+(p.r&&p.p>1&&p.p<7?'<tspan font-size="7" dy="-4">R</tspan>':'')+'</text>'})}
 v+='<text x="120" y="112" text-anchor="middle" font-size="26" fill="#ffe500">'+G(i)+'</text><text x="120" y="134" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">'+esc(ne?SIGNS[i].np:SIGNS[i].tr)+'</text></svg>';
 return'<div class="rcc">'+v+'<p class="rw">'+(ne?SIGNS[i].np+'बाट गोचर चक्र (दक्षिण भारतीय शैली): पहेंलो कुना पहिलो भाव हो, सानो अङ्कले भाव देखाउँछ।':'Gochar chart from '+SIGNS[i].tr+' (South-Indian style): the yellow corner is your 1st house; small numbers show the house.')+'</p></div>'}
/* ---- element themes and Moon-phase graphic ---- */
var EL=[0,1,2,3,0,1,2,3,0,1,2,3],ELN={en:['Fire','Earth','Air','Water'],ne:['अग्नि','पृथ्वी','वायु','जल']};
function wv(y,amp,fill,cls){var d='M0 '+y,n;for(n=0;n<14;n++)d+=(n?' t40 0':' q20 -'+amp+' 40 0');return'<path class="'+cls+'" d="'+d+'V110H0Z" fill="'+fill+'"/>'}
var ELSVG=['<svg viewBox="0 0 400 110" preserveAspectRatio="xMidYMax slice"><path class="fl" style="--d:0s" d="M300 110C280 84 310 74 302 44C328 64 338 88 326 110Z" fill="#ff7a1a"/><path class="fl" style="--d:-.4s" d="M340 110C326 90 346 80 342 58C362 74 368 94 358 110Z" fill="#ffb02e"/><path class="fl" style="--d:-.8s" d="M262 110C250 92 268 84 264 66C280 80 286 96 278 110Z" fill="#ff4d2e"/><path class="fl" style="--d:-.2s" d="M376 110C368 98 380 92 378 80C390 90 394 100 388 110Z" fill="#ff7a1a"/></svg>',
 '<svg viewBox="0 0 400 110" preserveAspectRatio="xMidYMax slice"><path class="er" d="M-30 110V78C10 52 70 70 110 56S190 40 230 62 300 40 340 58 400 70 430 62V110Z" fill="#8a6b3f"/><path class="er" style="animation-delay:-6s" d="M-30 110V92C20 74 90 90 140 80S230 66 280 86 360 84 430 80V110Z" fill="#5f8a4a"/></svg>',
 '<svg viewBox="0 0 400 110" preserveAspectRatio="xMidYMax slice"><g fill="none" stroke="#7fb4ff" stroke-width="2" stroke-linecap="round" stroke-dasharray="90 40"><path class="aw" d="M220 40C260 20 290 60 330 38S380 30 420 44"/><path class="aw" style="--d:-1s" d="M200 66C250 46 280 86 330 64S390 56 430 70"/><path class="aw" style="--d:-2s" d="M240 92C280 76 310 104 350 88"/></g><g fill="#cfe3ff"><ellipse class="cl" cx="340" cy="30" rx="26" ry="9"/><ellipse class="cl" style="animation-delay:-6s" cx="300" cy="80" rx="20" ry="7"/></g></svg>',
 '<svg viewBox="0 0 400 110" preserveAspectRatio="xMidYMax slice">'+wv(66,14,'rgba(79,208,224,.55)','wv')+wv(80,12,'rgba(13,106,154,.6)','wv wv2')+wv(94,10,'rgba(5,41,98,.55)','wv wv3')+'</svg>'];
function moonPath(e,r,cx,cy){e=((e%360)+360)%360;var c=Math.cos(e*Math.PI/180),rx=Math.max(.01,Math.abs(c)*r),wax=e<=180,sw=wax?(c>0?0:1):(c<0?0:1),t=cx+','+(cy-r),b=cx+','+(cy+r);return'M'+t+'A'+r+' '+r+' 0 0 '+(wax?1:0)+' '+b+'A'+rx+' '+r+' 0 0 '+sw+' '+t+'Z'}
var PHN={en:['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'],ne:['नयाँ चन्द्रमा (औंसी)','बढ्दो अर्धचन्द्र','पहिलो चौथाइ','बढ्दो चन्द्रमा','पूर्णिमा','घट्दो चन्द्रमा','अन्तिम चौथाइ','घट्दो अर्धचन्द्र']};
function phaseHtml(){var ne=lang==='ne',L=ne?'ne':'en',now=Date.now(),el=E.elongation(now),k=Math.round((1-Math.cos(el*Math.PI/180))/2*100),ix=Math.round(el/45)%8,ti=E.tithiInfo(now),d=moonPath(el,70,100,100),nm=PHN[L][ix],
 cr=[[82,78,9],[118,92,12],[96,124,8],[124,130,6],[78,108,5],[112,62,5]],
 v='<svg class="mps" viewBox="0 0 200 200" role="img" aria-label="'+esc(nm)+'"><defs><radialGradient id="mph" cx="50%" cy="50%" r="50%"><stop offset=".55" stop-color="#ffe500" stop-opacity=".35"/><stop offset="1" stop-color="#ffe500" stop-opacity="0"/></radialGradient><radialGradient id="mpg" cx="38%" cy="35%" r="75%"><stop offset="0" stop-color="#fffbe6"/><stop offset="1" stop-color="#e9dca6"/></radialGradient><clipPath id="mpc"><path id="mpcp" d="'+d+'"/></clipPath><filter id="mpb"><feGaussianBlur stdDeviation=".8"/></filter></defs>';
 for(var q=0;q<26;q++)v+='<circle class="sky-tw" style="--d:'+((q*37%30)/10).toFixed(1)+'s" cx="'+(q*71%196+2)+'" cy="'+(q*109%196+2)+'" r="'+(.6+(q%3)*.35)+'" fill="#fff"/>';
 v+='<circle class="mp-h" cx="100" cy="100" r="96" fill="url(#mph)"/><circle class="mp-o" cx="100" cy="100" r="90" fill="none" stroke="rgba(255,229,0,.4)" stroke-dasharray="2 8"/><circle cx="100" cy="100" r="70" fill="#0b1d44" stroke="rgba(255,255,255,.18)"/>';
 cr.forEach(function(c){v+='<circle cx="'+c[0]+'" cy="'+c[1]+'" r="'+c[2]+'" fill="rgba(255,255,255,.05)"/>'});
 v+='<path id="mpl" d="'+d+'" fill="url(#mpg)" filter="url(#mpb)"/><g clip-path="url(#mpc)">';cr.forEach(function(c){v+='<circle cx="'+c[0]+'" cy="'+c[1]+'" r="'+c[2]+'" fill="rgba(120,100,60,.3)"/>'});v+='</g></svg>';
 var st='';for(var i=0;i<8;i++)st+='<svg viewBox="0 0 44 44" class="mpm'+(i===ix?' on':'')+'" role="img" aria-label="'+esc(PHN[L][i])+'"><title>'+esc(PHN[L][i])+'</title><circle cx="22" cy="22" r="16" fill="#0b1d44" stroke="rgba(255,255,255,.22)"/><path d="'+moonPath(i*45,16,22,22)+'" fill="#f6edc0"/>'+(i===ix?'<circle class="mp-cur" cx="22" cy="22" r="20" fill="none" stroke="#ffe500" stroke-width="2"/>':'')+'</svg>';
 return'<section class="mph"><h3>'+(ne?'आजको चन्द्र कला':'Moon phase today')+'</h3>'+v+'<div class="mpt"><b>'+esc(nm)+'</b><span>'+k+'% '+(ne?'प्रकाशित':'illuminated')+' · '+esc(ne?ti.pakshaNp+' '+ti.np:ti.paksha+' '+ti.en)+'</span></div><div class="mpr">'+st+'</div></section>'}
function phaseAnim(){var l=document.getElementById('mpl'),cp=document.getElementById('mpcp');if(!l||!cp||RM)return;var el=E.elongation(Date.now()),t0=performance.now();(function f(t){if(!l.isConnected)return;var k=Math.min(1,(t-t0)/1800),d=moonPath(el*(1-Math.pow(1-k,3)),70,100,100);l.setAttribute('d',d);cp.setAttribute('d',d);if(k<1)requestAnimationFrame(f)})(t0)}
/* ---- 3D sky: rotatable celestial sphere drawn on a canvas from the planetary calculations ---- */
var S3={yaw:null,pit:24,fov:125,off:0,auto:true,sel:1,play:false,raf:0,bd:null,fr:[],vis:true,hook:false},
 S3C=['#ffd23f','#fff4c2','#ff6a4d','#7ee0a4','#ffb347','#ff9ed2','#9fb4ff','#b9a8d8','#9a8ab8'],
 S3E=['#ff9a6b','#9bd88f','#9ad4ff','#7fb0ff'],
 S3T={en:{h:'3D Sky',hint:'Drag to rotate · pinch or scroll to zoom · tap a planet',tap:'Tap a planet or the Moon',now:'Today',sky:'Sky on',live:'Sky now',alt:'Rotatable 3D sky showing the Sun, Moon and planets on the zodiac',play:'Play',pause:'Pause',off:'Days from today'},
  ne:{h:'३D आकाश',hint:'घुमाउन तान्नुहोस् · जुम गर्न चिमोट्नुहोस् वा स्क्रोल गर्नुहोस् · ग्रहमा ट्याप गर्नुहोस्',tap:'कुनै ग्रह वा चन्द्रमामा ट्याप गर्नुहोस्',now:'आज',sky:'आकाश',live:'अहिलेको आकाश',alt:'सूर्य, चन्द्रमा र ग्रहहरू राशिचक्रमा देखाउने घुमाउन मिल्ने ३D आकाश',play:'चलाउनुहोस्',pause:'रोक्नुहोस्',off:'आजबाट दिन'}},
 S3S=(function(){var a=1234567,o=[];function r(){a=(a+0x6D2B79F5)|0;var t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}
  for(var i=0;i<420;i++){var l=r()*6.283185,b=Math.asin(r()*2-1),m=r();o.push([Math.cos(b)*Math.cos(l),Math.cos(b)*Math.sin(l),Math.sin(b),m*m*m,r()*6.28])}return o})();
function s3v(l,b){l*=Math.PI/180;b*=Math.PI/180;return[Math.cos(b)*Math.cos(l),Math.cos(b)*Math.sin(l),Math.sin(b)]}
function s3lat(p,ms){if(p===1){var d=ms/86400000+2440587.5-2451545;return 5.128*Math.sin((93.272+13.22935*d)*Math.PI/180)}
 if(p===0||p>=7)return 0;var T=(ms/86400000+2440587.5-2451545)/36525,ea=hel(2,T),pp=hel(PMAP[p],T);
 return Math.atan2(pp[2]-ea[2],Math.hypot(pp[0]-ea[0],pp[1]-ea[1]))*180/Math.PI}
function s3bodies(ms,keepR){var old=S3.bd;return[0,1,2,3,4,5,6,7,8].map(function(p){var l=lonP(p,ms),b=s3lat(p,ms);
 return{p:p,l:l,b:b,s:Math.floor(l/30),r:keepR&&old?old[p].r:isR(p,ms),v:s3v(l,b)}})}
function s3ms(){return Date.now()+S3.off*864e5}
function s3html(){var T=S3T[lang==='ne'?'ne':'en'];
 return'<section class="s3d"><h3>'+T.h+'</h3><div class="s3w"><canvas id="s3c" tabindex="0" role="img" aria-label="'+esc(T.alt)+'"></canvas></div><div class="s3i" id="s3i" aria-live="polite">'+T.tap+'</div><div class="s3b"><button type="button" id="s3p" aria-label="'+T.play+'">▶</button><input type="range" id="s3o" min="-45" max="45" step="1" value="'+S3.off+'" aria-label="'+T.off+'"><button type="button" id="s3n">'+T.now+'</button></div><p class="s3h">'+T.hint+'</p><div class="s3dt" id="s3dt"></div></section>'}
function s3init(){var cv=document.getElementById('s3c');if(!cv)return;var ne=lang==='ne',T=S3T[ne?'ne':'en'],cx2=cv.getContext('2d'),info=document.getElementById('s3i'),dtl=document.getElementById('s3dt'),rng=document.getElementById('s3o'),pb=document.getElementById('s3p'),nb=document.getElementById('s3n');
 if(S3.yaw===null)S3.yaw=lonP(1,Date.now());S3.bd=s3bodies(s3ms(),false);
 var ptr={},drag=0,t0=0,last=0,W=0,H=0,dpr=1,mcv=document.createElement('canvas'),mx,mid,N=72;mcv.width=mcv.height=N;mx=mcv.getContext('2d');mid=mx.createImageData(N,N);
 var MAR=[[-.3,.35,.3],[.15,.42,.2],[-.05,.08,.24],[.3,-.02,.18],[-.38,-.12,.15],[.1,-.38,.2],[.42,.22,.1]];
 function clamp(x,a,b){return x<a?a:(x>b?b:x)}
 function basis(){var y=S3.yaw*Math.PI/180,p=S3.pit*Math.PI/180,F=[Math.cos(p)*Math.cos(y),Math.cos(p)*Math.sin(y),Math.sin(p)],R=[Math.sin(y),-Math.cos(y),0],U=[R[1]*F[2]-R[2]*F[1],R[2]*F[0]-R[0]*F[2],R[0]*F[1]-R[1]*F[0]];return{F:F,R:R,U:U}}
 function proj(v,B,f){var z=v[0]*B.F[0]+v[1]*B.F[1]+v[2]*B.F[2];if(z<=-.8)return null;var k=f/(1+z);return[W/2+(v[0]*B.R[0]+v[1]*B.R[1]+v[2]*B.R[2])*k,H/2-(v[0]*B.U[0]+v[1]*B.U[1]+v[2]*B.U[2])*k,z,k]}
 function moonImg(w,s,B){var d1=B.R[0]*w[0]+B.R[1]*w[1]+B.R[2]*w[2],u=[B.R[0]-d1*w[0],B.R[1]-d1*w[1],B.R[2]-d1*w[2]],ul=Math.hypot(u[0],u[1],u[2])||1,d2=B.U[0]*w[0]+B.U[1]*w[1]+B.U[2]*w[2],v=[B.U[0]-d2*w[0],B.U[1]-d2*w[1],B.U[2]-d2*w[2]],vl=Math.hypot(v[0],v[1],v[2])||1;
  u=[u[0]/ul,u[1]/ul,u[2]/ul];v=[v[0]/vl,v[1]/vl,v[2]/vl];var su=s[0]*u[0]+s[1]*u[1]+s[2]*u[2],sv=s[0]*v[0]+s[1]*v[1]+s[2]*v[2],sw=-(s[0]*w[0]+s[1]*w[1]+s[2]*w[2]),d=mid.data;
  for(var py=0;py<N;py++)for(var px=0;px<N;px++){var a=(px+.5)/N*2-1,b=1-(py+.5)/N*2,q=a*a+b*b,i=(py*N+px)*4;if(q>=1){d[i+3]=0;continue}
   var c=Math.sqrt(1-q),dp=a*su+b*sv+c*sw,lit=clamp((dp+.02)/.27,0,1);lit=lit*lit*(3-2*lit);var I=.05+.95*lit*(.62+.38*clamp(dp*1.2,0,1)),mr=0;
   for(var m=0;m<MAR.length;m++){var da=a-MAR[m][0],db=b-MAR[m][1];mr+=Math.exp(-(da*da+db*db)/(MAR[m][2]*MAR[m][2]))*.24}
   I*=(1-mr)*(.8+.2*c);var e=1-Math.sqrt(q),sh=1-lit;d[i]=clamp(252*I+8*sh,0,255);d[i+1]=clamp(243*I+12*sh,0,255);d[i+2]=clamp(214*I+22*sh,0,255);d[i+3]=Math.min(1,e*18)*255}
  mx.putImageData(mid,0,0)}
 function draw(t){var w=cv.clientWidth,h=cv.clientHeight;dpr=Math.min(1.5,window.devicePixelRatio||1);if(!w||!h)return;
  if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}W=w;H=h;cx2.setTransform(dpr,0,0,dpr,0,0);
  var g=cx2.createLinearGradient(0,0,0,H);g.addColorStop(0,'#010612');g.addColorStop(.55,'#04153a');g.addColorStop(1,'#0a2a66');cx2.fillStyle=g;cx2.fillRect(0,0,W,H);
  var B=basis(),f=(H/2)/Math.tan(S3.fov*Math.PI/720),i,k,p0;
  for(i=0;i<S3S.length;i++){var st=S3S[i];p0=proj(st,B,f);if(!p0)continue;var tw=RM?1:(.72+.28*Math.sin(t*.002+st[4])),sz=.7+st[3]*2.2;cx2.globalAlpha=Math.min(1,(.3+st[3]*.9)*tw);cx2.fillStyle='#fff';cx2.fillRect(p0[0]-sz/2,p0[1]-sz/2,sz,sz)}
  cx2.globalAlpha=1;
  /* zodiac ring */
  for(i=0;i<12;i++){var a0=i*30;cx2.beginPath();var pen=false;for(k=0;k<=30;k++){p0=proj(s3v(a0+k,0),B,f);if(!p0){pen=false;continue}if(!pen){cx2.moveTo(p0[0],p0[1]);pen=true}else cx2.lineTo(p0[0],p0[1])}
   cx2.strokeStyle=S3E[EL[i]];cx2.globalAlpha=.85;cx2.lineWidth=2.2;cx2.stroke();
   var q1=proj(s3v(a0,-7),B,f),q2=proj(s3v(a0,7),B,f);if(q1&&q2){cx2.beginPath();cx2.moveTo(q1[0],q1[1]);cx2.lineTo(q2[0],q2[1]);cx2.strokeStyle='rgba(255,255,255,.35)';cx2.globalAlpha=1;cx2.lineWidth=1;cx2.stroke()}
   for(k=5;k<30;k+=5){var t1=proj(s3v(a0+k,-1.3),B,f),t2=proj(s3v(a0+k,1.3),B,f);if(t1&&t2){cx2.beginPath();cx2.moveTo(t1[0],t1[1]);cx2.lineTo(t2[0],t2[1]);cx2.strokeStyle='rgba(255,255,255,.28)';cx2.lineWidth=1;cx2.stroke()}}
   var gp=proj(s3v(a0+15,9.5),B,f);if(gp){cx2.globalAlpha=1;cx2.fillStyle=S3E[EL[i]];cx2.font='600 '+Math.round(clamp(gp[3]*.058,12,30)/2)*2+'px system-ui,sans-serif';cx2.textAlign='center';cx2.textBaseline='middle';cx2.fillText(G(i),gp[0],gp[1])}}
  cx2.globalAlpha=1;
  /* bodies, far to near so the Moon and Sun sit on top */
  var bd=S3.bd,sun=bd[0].v,mn=bd[1],fr=[],ord=[7,8,6,4,3,2,5,0,1];
  for(i=0;i<ord.length;i++){var b=bd[ord[i]],pp=proj(b.v,B,f);if(!pp)continue;var rad,col=S3C[b.p];
   if(b.p===1){rad=clamp(pp[3]*.034,13,64);var fl=(1-(b.v[0]*sun[0]+b.v[1]*sun[1]+b.v[2]*sun[2]))/2,gl=cx2.createRadialGradient(pp[0],pp[1],rad*.8,pp[0],pp[1],rad*2.6);gl.addColorStop(0,'rgba(255,240,180,'+(.1+.4*fl)+')');gl.addColorStop(1,'rgba(255,240,180,0)');cx2.fillStyle=gl;cx2.fillRect(pp[0]-rad*3,pp[1]-rad*3,rad*6,rad*6);
    if(drag||!S3.mt||t-S3.mt>150||t<S3.mt){moonImg(b.v,sun,B);S3.mt=t}cx2.drawImage(mcv,pp[0]-rad,pp[1]-rad,rad*2,rad*2)}
   else if(b.p===0){rad=clamp(pp[3]*.03,11,42);var sg=cx2.createRadialGradient(pp[0],pp[1],rad*.4,pp[0],pp[1],rad*3.2);sg.addColorStop(0,'rgba(255,214,64,.85)');sg.addColorStop(.35,'rgba(255,170,30,.25)');sg.addColorStop(1,'rgba(255,170,30,0)');cx2.fillStyle=sg;cx2.fillRect(pp[0]-rad*3.4,pp[1]-rad*3.4,rad*6.8,rad*6.8);cx2.beginPath();cx2.arc(pp[0],pp[1],rad,0,6.283);cx2.fillStyle='#ffe27a';cx2.fill();cx2.beginPath();cx2.arc(pp[0],pp[1],rad*.72,0,6.283);cx2.fillStyle='#fff7d0';cx2.fill()}
   else if(b.p>=7){rad=clamp(pp[3]*.011,4,9);cx2.beginPath();cx2.moveTo(pp[0],pp[1]-rad);cx2.lineTo(pp[0]+rad,pp[1]);cx2.lineTo(pp[0],pp[1]+rad);cx2.lineTo(pp[0]-rad,pp[1]);cx2.closePath();cx2.fillStyle=col;cx2.globalAlpha=.9;cx2.fill();cx2.globalAlpha=1}
   else{rad=clamp(pp[3]*.013,4,11);var pg=cx2.createRadialGradient(pp[0],pp[1],0,pp[0],pp[1],rad*3.2);pg.addColorStop(0,col);pg.addColorStop(.3,col+'66');pg.addColorStop(1,col+'00');cx2.fillStyle=pg;cx2.fillRect(pp[0]-rad*3.4,pp[1]-rad*3.4,rad*6.8,rad*6.8);cx2.beginPath();cx2.arc(pp[0],pp[1],rad,0,6.283);cx2.fillStyle=col;cx2.fill();cx2.beginPath();cx2.arc(pp[0]-rad*.3,pp[1]-rad*.3,rad*.35,0,6.283);cx2.fillStyle='rgba(255,255,255,.7)';cx2.fill()}
   if(S3.sel===b.p){cx2.beginPath();cx2.arc(pp[0],pp[1],rad+6,0,6.283);cx2.strokeStyle='#ffe500';cx2.lineWidth=1.6;cx2.setLineDash([4,4]);cx2.stroke();cx2.setLineDash([])}
   cx2.font='600 12px system-ui,\'Noto Sans Devanagari\',sans-serif';cx2.textAlign='left';cx2.textBaseline='alphabetic';cx2.fillStyle='rgba(0,0,0,.55)';cx2.fillText(pn(b.p)+(b.r&&b.p>1&&b.p<7?' ᴿ':''),pp[0]+rad+6,pp[1]-rad*.4+1);cx2.fillStyle='rgba(255,255,255,.95)';cx2.fillText(pn(b.p)+(b.r&&b.p>1&&b.p<7?' ᴿ':''),pp[0]+rad+5,pp[1]-rad*.4);
   fr.push([b.p,pp[0],pp[1],rad])}
  S3.fr=fr}
 function showInfo(){var b=S3.bd[S3.sel];if(!b){info.textContent=T.tap;return}info.innerHTML='<b>'+esc(pn(b.p))+(b.r&&b.p>1&&b.p<7?' (R)':'')+'</b> · '+G(b.s)+' '+esc(ne?SIGNS[b.s].np:SIGNS[b.s].tr)+' '+dm(b.l)}
 function showDate(){if(!S3.off){dtl.textContent=T.live}else{dtl.textContent=T.sky+' '+new Intl.DateTimeFormat(ne?'ne-NP':'en-GB',{day:'numeric',month:'short',year:'numeric'}).format(new Date(s3ms()))}}
 function setOff(v,keepR){S3.off=v;S3.bd=s3bodies(s3ms(),keepR);rng.value=Math.round(v);showInfo();showDate()}
 function frame(t){S3.raf=0;if(!cv.isConnected)return;if(!drag&&!S3.play&&t-last<40){S3.raf=requestAnimationFrame(frame);return}var dt=Math.min(.1,(t-last)/1000||0);last=t;
  if(S3.play){var v=S3.off+dt*5;if(v>45)v=-45;setOff(v,true)}
  if(S3.auto&&!RM&&!drag)S3.yaw+=dt*2.2;draw(t);if(S3.vis&&!document.hidden&&(!RM||drag||S3.play))S3.raf=requestAnimationFrame(frame)}
 function go(){if(!S3.raf)S3.raf=requestAnimationFrame(frame)}
 S3.go=go;
 function stopAuto(){S3.auto=false}
 cv.addEventListener('pointerdown',function(e){cv.setPointerCapture(e.pointerId);ptr[e.pointerId]={x:e.clientX,y:e.clientY};drag=Object.keys(ptr).length;t0=performance.now();stopAuto();S3.moved=0;go()});
 cv.addEventListener('pointermove',function(e){var q=ptr[e.pointerId];if(!q)return;var ids=Object.keys(ptr);
  if(ids.length===2){var o=ids[0]==e.pointerId?ids[1]:ids[0],oq=ptr[o],d0=Math.hypot(q.x-oq.x,q.y-oq.y),d1=Math.hypot(e.clientX-oq.x,e.clientY-oq.y);if(d0>0)S3.fov=clamp(S3.fov*d0/d1,30,165);S3.moved=99}
  else{var dx=e.clientX-q.x,dy=e.clientY-q.y,sc=S3.fov/(cv.clientHeight||300);S3.yaw+=dx*sc;S3.pit=clamp(S3.pit+dy*sc,-85,85);S3.moved+=Math.abs(dx)+Math.abs(dy)}
  q.x=e.clientX;q.y=e.clientY;if(RM)draw(performance.now())});
 function up(e){var q=ptr[e.pointerId];if(!q)return;delete ptr[e.pointerId];drag=Object.keys(ptr).length;
  if(e.type==='pointerup'&&S3.moved<8&&performance.now()-t0<400){var r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,best=-1,bd=1e9;S3.fr.forEach(function(o){var d=Math.hypot(o[1]-x,o[2]-y);if(d<Math.max(26,o[3]+12)&&d<bd){bd=d;best=o[0]}});S3.sel=best;showInfo();if(RM)draw(performance.now())}}
 cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 cv.addEventListener('wheel',function(e){e.preventDefault();stopAuto();S3.fov=clamp(S3.fov*Math.exp(e.deltaY*.0012),30,165);if(RM)draw(performance.now())},{passive:false});
 cv.addEventListener('keydown',function(e){var s=S3.fov/12,h=1;if(e.key==='ArrowLeft')S3.yaw+=s;else if(e.key==='ArrowRight')S3.yaw-=s;else if(e.key==='ArrowUp')S3.pit=clamp(S3.pit+s,-85,85);else if(e.key==='ArrowDown')S3.pit=clamp(S3.pit-s,-85,85);else if(e.key==='+'||e.key==='=')S3.fov=clamp(S3.fov/1.15,30,165);else if(e.key==='-')S3.fov=clamp(S3.fov*1.15,30,165);else h=0;if(h){e.preventDefault();stopAuto();if(RM)draw(performance.now());else go()}});
 rng.addEventListener('input',function(){S3.play=false;pb.textContent='▶';setOff(+rng.value,false);if(RM)draw(performance.now());else go()});
 pb.addEventListener('click',function(){S3.play=!S3.play;pb.textContent=S3.play?'❚❚':'▶';pb.setAttribute('aria-label',S3.play?T.pause:T.play);go()});
 nb.addEventListener('click',function(){S3.play=false;pb.textContent='▶';S3.yaw=lonP(1,Date.now());S3.pit=24;S3.fov=125;S3.sel=1;setOff(0,false);if(RM)draw(performance.now());else go()});
 if('IntersectionObserver' in window){new IntersectionObserver(function(es){S3.vis=es[0].isIntersecting;if(S3.vis)go()},{threshold:.05}).observe(cv)}
 if(!S3.hook){S3.hook=true;document.addEventListener('visibilitychange',function(){if(!document.hidden&&S3.go)S3.go()})}
 pb.textContent=S3.play?'❚❚':'▶';showInfo();showDate();draw(performance.now());go()}

function plTable(c){var ne=lang==='ne',PL=planetsDay(c),h='<details class="rpl"><summary>'+(ne?'आजका ग्रह स्थिति (निरयन, लाहिरी)':'Planet positions today (sidereal, Lahiri)')+'</summary>';
 PL.forEach(function(x){h+='<div class="rpr"><span>'+esc(pn(x.p))+(x.r?' (R)':'')+'</span><span>'+G(x.s)+' '+esc(ne?SIGNS[x.s].np:SIGNS[x.s].tr)+'</span><span>'+dm(x.l)+'</span></div>'});
 return h+'<p class="rw">'+(ne?'मध्याह्न स्थिति; राहु-केतु मध्यम नोड। ग्रह स्थिति मानक कक्षीय तत्त्वबाट गणना गरिएको (केही चाप-मिनेटसम्म शुद्ध); चन्द्रमा लामो चन्द्र श्रेणीबाट।':'Midday positions; Rahu/Ketu use the mean node. Planets are calculated from standard orbital elements (accurate to a few arc-minutes) and the Moon from a long lunar series.')+'</p></details>'}
/* ---- daily line on every card: that day's weekday ruler, tithi and nakshatra, read against the sign's own ruler ---- */
var DLR={en:{own:'is also your own ruler, so the day feels natural',friend:'is friendly to your ruler, so things flow',neutral:'is neutral to your ruler, so results follow your effort',enemy:'is unfriendly to your ruler, so go slowly'},
 ne:{own:'तपाईंकै राशि स्वामी पनि हो, दिन स्वाभाविक लाग्छ',friend:'तपाईंको राशि स्वामीको मित्र हो, काम सजिलो चल्छ',neutral:'तपाईंको राशि स्वामीसँग सम छ, फल प्रयासमा भर पर्छ',enemy:'तपाईंको राशि स्वामीको शत्रु हो, ढिलो र होसियार हुनुहोस्'}},
 DLT={en:['a joyful tithi, good for fresh starts and celebrations','a steady tithi, good for health, routine and family matters','a tithi of success, good for contests, study and talks','an empty tithi, so avoid new launches and big spending','a full tithi, good for finishing work and giving thanks'],
 ne:['आनन्ददायी तिथि, नयाँ सुरुवात र उत्सवका लागि राम्रो','स्थिर तिथि, स्वास्थ्य, दैनिक काम र पारिवारिक कुराका लागि राम्रो','सफलताको तिथि, प्रतिस्पर्धा, अध्ययन र वार्ताका लागि राम्रो','रिक्ता तिथि, त्यसैले नयाँ काम र ठूलो खर्चबाट जोगिनुहोस्','पूर्णा तिथि, काम पूरा गर्न र कृतज्ञता जनाउन राम्रो']},
 DLA={en:'the new-moon day, best for rest, quiet work and remembering elders',ne:'औंसीको दिन, आराम, शान्त काम र पितृस्मरणका लागि राम्रो'},
 DLE={en:['Move early and speak plainly.','Stay practical and finish what you start.','Talk it through before you decide.','Trust your feelings, but check the facts.'],ne:['चाँडै सुरु गर्नुहोस् र स्पष्ट बोल्नुहोस्।','व्यावहारिक रहनुहोस् र सुरु गरेको काम पूरा गर्नुहोस्।','निर्णय गर्नुअघि छलफल गर्नुहोस्।','भावनामा विश्वास गर्नुहोस्, तर तथ्य जाँच्नुहोस्।']};
function dailyLine(i,c){var ne=lang==='ne',L=ne?'ne':'en',wd=new Date(c.key+'T12:00:00Z').getUTCDay(),lord=LORD[i],r1=rel(lord,wd),T=c.tithi,k=T.number<=15?T.number:T.number-15,
  tn=T.number===30?DLA[L]:DLT[L][(k-1)%5],tname=ne?T.pakshaNp+' '+T.np:T.paksha+' '+T.en,nl=c.nak.index%9,np=NKP[nl],nn=ne?c.nak.np:c.nak.en,nlord=ne?NKL[nl][1]:NKL[nl][0],s3;
 if(np>=0)s3=ne?nn+' नक्षत्रका स्वामी '+nlord+', जो '+DLR.ne[rel(lord,np)]+'।':nn+' is ruled by '+nlord+', which '+DLR.en[rel(lord,np)]+'.';
 else s3=ne?nn+' नक्षत्रका स्वामी '+nlord+', छायाग्रह, त्यसैले योजना लचिलो राख्नुहोस्।':nn+' is ruled by '+nlord+', a shadow planet, so keep plans flexible.';
 var s1=ne?SIGNS[i].np+'का लागि '+WD.ne[wd]+'को स्वामी '+PN.ne[wd]+', जो '+DLR.ne[r1]+'।':'For '+SIGNS[i].tr+', '+WD.en[wd]+' is ruled by '+PN.en[wd]+', which '+DLR.en[r1]+'.',
  s2=ne?tname+' '+tn+'।':tname+' is '+tn+'.';
 return '<b>'+(ne?'आजको झलक':'Today at a glance')+'</b> '+esc(s1+' '+s2+' '+s3+' '+DLE[L][EL[i]])}
function cardsHtml(c){var t=UI[lang],ne=lang==='ne',h=s3html()+'<div class="rvg">'+skyHtml(c)+phaseHtml()+'</div>'+plTable(c),PLd=planetsDay(c);SIGNS.forEach(function(s,i){var r=sRead(i,c);h+='<article class="rcd el'+EL[i]+(i===cur?' mine':'')+'" style="--i:'+i+'" data-i="'+i+'"><div class="rce" aria-hidden="true">'+ELSVG[EL[i]]+'</div><div class="rch"><span class="rcg">'+G(i)+'</span><div><h3>'+esc(s.np)+' <small>'+esc(s.en)+'</small></h3><p class="rcl">'+esc(LET[i])+' · '+ELN[ne?'ne':'en'][EL[i]]+'</p></div><span class="rbd '+r.q+'">'+esc(t[r.v])+'</span></div><p class="rcdl">'+dailyLine(i,c)+'</p><p class="rcp">'+esc(r.short)+'</p><div class="rcx">'+chartHtml(i,PLd)+r.more+'</div><div class="rcf"><button type="button" class="rcm">'+(ne?'थप हेर्नुहोस्':'See more')+'</button><button type="button" class="rcs">↗ '+(ne?'साझा गर्नुहोस्':'Share')+'</button></div></article>'});return h}
function setCur(i){cur=i;try{localStorage.setItem('rf-sign',String(i))}catch(e){}}
function tick(){var r=document.getElementById('rf');if(!r)return;var now=Date.now();if(E.dateKey(now)!==key)render();else{var n=document.getElementById('rfnow'),c=getC(now);if(n)n.style.left=nowPct(c,now).toFixed(2)+'%'}}
function init(){if(document.getElementById('rf'))render()}
function chip(){var s=-1;try{s=parseInt(localStorage.getItem('rf-sign'),10)}catch(e){}if(!(s>=0&&s<12))return'✨ Horoscope';var V=verdictFor(getC(Date.now()),s);return G(s)+' '+SIGNS[s].tr+' <span class="rfd '+(V.v==='ctr'?'bad':V.v)+'" title="'+esc(UI.en[V.v])+'"></span>'}
setInterval(tick,60000);function nmid(){var n=Date.now(),nx=E.nepalDayStart(n)+E.DAY_MS;setTimeout(function(){tick();nmid()},Math.max(1000,nx-n+1500))}nmid();window.addEventListener('pageshow',tick);window.addEventListener('focus',tick);document.addEventListener('visibilitychange',function(){if(!document.hidden)tick()});
/* ---- Share: animated card (live preview, PNG, video) in site colours ---- */
var openShare=(function(){
var W=1080,H=1350,SANS='system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans Devanagari",sans-serif',SERIF='Georgia,"Times New Roman","Noto Serif Devanagari",serif';
var COL={good:'#2e9e4f',mixed:'#d99a00',mid:'#d99a00',bad:'#c0392b'};
var ST=[],sd=7;function rn(){sd=(sd*16807)%2147483647;return sd/2147483647}
for(var i=0;i<90;i++)ST.push({x:rn(),y:rn(),r:.8+rn()*2,sp:.8+rn()*2.4,ph:rn()*6.28});
function cl(x){return Math.max(0,Math.min(1,x))}
function ez(x){x=cl(x);return 1-Math.pow(1-x,3)}
function bk(x){x=cl(x);var c=1.70158;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)}
function pr(t,a,d){return ez((t-a)/d)}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function wrap(c,txt,mw,max){var ws=String(txt).split(' '),L=[],ln='';ws.forEach(function(w){var s=ln?ln+' '+w:w;if(c.measureText(s).width>mw&&ln){L.push(ln);ln=w}else ln=s});L.push(ln);if(L.length>max){L=L.slice(0,max);L[max-1]=L[max-1].replace(/[\s.,;।]*$/,'')+'…'}return L}
function data(){var now=Date.now(),c=getC(now),t=UI[lang],r=sRead(cur,c),s=SIGNS[cur];
 return{np:s.np,en:s.en,g:G(cur),vl:t[r.v],q:r.q,date:dayLabel(now),title:lang==='ne'?'दैनिक राशिफल':'Daily Rashifal',now:(now-c.start)/(c.end-c.start),url:location.origin+'/horoscope',text:r.cardTxt,full:r.full,segs:r.bar}}
function stext(d){return d.g+' '+d.np+' ('+d.en+') · '+d.vl+'\n'+d.date+'\n\n'+d.full+'\n\n'+d.url}
function draw(c,t,d){
 var g=c.createRadialGradient(W/2,0,60,W/2,H*.35,H*.95);g.addColorStop(0,'#0d4aa8');g.addColorStop(.48,'#052962');g.addColorStop(1,'#021634');c.fillStyle=g;c.fillRect(0,0,W,H);
 c.textAlign='center';c.textBaseline='alphabetic';c.shadowBlur=0;
 ST.forEach(function(s){c.globalAlpha=(.2+.8*Math.abs(Math.sin(t*s.sp+s.ph)))*.9;c.fillStyle='#fff';c.beginPath();c.arc(s.x*W,s.y*H,s.r,0,6.283);c.fill()});c.globalAlpha=1;
 var ph=(t%3.6)/3.6;if(ph<.22){var k=ph/.22,x=W*(.1+.6*k),y=H*(.06+.14*k),gr=c.createLinearGradient(x-170,y-60,x,y);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(255,255,255,'+(1-k)+')');c.strokeStyle=gr;c.lineWidth=3;c.beginPath();c.moveTo(x-170,y-60);c.lineTo(x,y);c.stroke()}
 var p=pr(t,.1,.7);c.globalAlpha=p;c.fillStyle='#ffe500';c.font='700 36px '+SANS;c.fillText(d.title,W/2,86-(1-p)*20);
 c.fillStyle='rgba(255,255,255,.75)';c.font='500 28px '+SANS;c.fillText(d.date,W/2,130-(1-p)*20);c.globalAlpha=1;
 var cx=W/2,cy=390;
 c.save();c.globalAlpha=pr(t,.2,.8);c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=2;c.beginPath();c.arc(cx,cy,215,0,6.283);c.stroke();
 c.setLineDash([4,20]);c.lineDashOffset=-t*24;c.strokeStyle='rgba(255,229,0,.55)';c.lineWidth=4;c.beginPath();c.arc(cx,cy,176,0,6.283);c.stroke();c.restore();
 var a=t*.9-1.2,mx=cx+Math.cos(a)*215,my=cy+Math.sin(a)*215,mg=c.createRadialGradient(mx,my,0,mx,my,70);mg.addColorStop(0,'rgba(255,229,0,.55)');mg.addColorStop(1,'rgba(255,229,0,0)');
 c.globalAlpha=pr(t,.5,.6);c.fillStyle=mg;c.beginPath();c.arc(mx,my,70,0,6.283);c.fill();c.fillStyle='#fff7c2';c.beginPath();c.arc(mx,my,24,0,6.283);c.fill();c.fillStyle='#021634';c.beginPath();c.arc(mx+11,my-5,20,0,6.283);c.fill();c.globalAlpha=1;
 var sc=bk((t-.3)/.9);c.save();c.translate(cx,cy);c.scale(sc,sc);var cg=c.createRadialGradient(-40,-50,10,0,0,150);cg.addColorStop(0,'#0d4aa8');cg.addColorStop(1,'#052962');c.fillStyle=cg;c.beginPath();c.arc(0,0,146,0,6.283);c.fill();
 c.strokeStyle='rgba(255,229,0,.6)';c.lineWidth=3;c.stroke();c.shadowColor='#ffe500';c.shadowBlur=24+10*Math.sin(t*2.4);c.fillStyle='#ffe500';c.textBaseline='middle';c.font='700 170px "Segoe UI Symbol","Apple Symbols","Noto Sans Symbols",'+SANS;c.fillText(d.g,0,8);c.restore();
 c.shadowBlur=0;c.textBaseline='alphabetic';
 p=pr(t,.9,.7);c.globalAlpha=p;c.fillStyle='#fff';c.font='700 84px '+SERIF;c.fillText(d.np,W/2,700+(1-p)*30);c.fillStyle='rgba(255,255,255,.78)';c.font='500 36px '+SANS;c.fillText(d.en,W/2,752+(1-p)*30);c.globalAlpha=1;
 var vc=COL[d.q]||COL.mixed,vs=bk((t-1.2)/.6);c.save();c.translate(W/2,812);c.scale(vs,vs);c.font='700 32px '+SANS;var vw=c.measureText(d.vl).width+70;c.shadowColor=vc;c.shadowBlur=14+10*Math.sin(t*3);c.fillStyle=vc;rr(c,-vw/2,-30,vw,60,30);c.fill();c.shadowBlur=0;c.fillStyle='#fff';c.textBaseline='middle';c.fillText(d.vl,0,2);c.restore();c.textBaseline='alphabetic';
 /* reading panel */
 c.font='400 29px '+SERIF;c.textAlign='left';var Lp=wrap(c,d.text,800,7),hh=Lp.length*40+60,py=868;
 p=pr(t,1.5,.7);c.globalAlpha=p;c.fillStyle='rgba(255,255,255,.08)';rr(c,70,py,W-140,hh,26);c.fill();c.strokeStyle='rgba(255,255,255,.2)';c.lineWidth=2;c.stroke();
 var q=pr(t,1.7,.7);c.globalAlpha=q;c.fillStyle=COL[d.q]||COL.mixed;rr(c,98,py+30,8,hh-60,4);c.fill();c.fillStyle='#fff';var y=py+56;Lp.forEach(function(l){c.fillText(l,124+(1-q)*30,y);y+=40});
 c.globalAlpha=1;
 /* day timeline */
 var by=py+hh+30,bx=100,bw=W-200,gp=pr(t,2.2,.9),tot=d.segs.reduce(function(s,g){return s+g.w},0),cx2=bx;c.save();rr(c,bx,by,bw,22,11);c.clip();c.fillStyle='rgba(255,255,255,.12)';c.fillRect(bx,by,bw,22);
 d.segs.forEach(function(g){var w=bw*g.w/tot*gp;c.fillStyle=COL[g.q]||COL.mixed;c.fillRect(cx2,by,w,22);cx2+=w});c.restore();
 c.globalAlpha=gp;var nx=bx+bw*cl(d.now),pu=1+.25*Math.sin(t*4);c.fillStyle='#ffe500';c.shadowColor='#ffe500';c.shadowBlur=16;c.beginPath();c.arc(nx,by+11,11*pu,0,6.283);c.fill();c.shadowBlur=0;c.globalAlpha=1;
 c.textAlign='center';p=pr(t,2.6,.7);c.globalAlpha=p;c.fillStyle='#ffe500';c.font='700 38px '+SERIF;c.fillText('The Sujan Khadka',W/2,H-50);c.fillStyle='rgba(255,255,255,.7)';c.font='500 26px '+SANS;c.fillText(d.url.replace(/^https?:\/\//,''),W/2,H-16);c.globalAlpha=1}
function dl(f){var a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1500)}
return function(){
 var d=data(),ne=lang==='ne',m=document.createElement('div'),raf=0;
 var L=ne?{i:'🖼 फोटो',v:'🎬 भिडियो',t:'🔗 टेक्स्ट',x:'बन्द गर्नुहोस्',rec:'भिडियो बन्दैछ… ',sv:'उपकरणमा सुरक्षित भयो',cp:'कपी भयो',nv:'यो ब्राउजरमा भिडियो समर्थित छैन'}:{i:'🖼 Image',v:'🎬 Video',t:'🔗 Text',x:'Close',rec:'Recording video… ',sv:'Saved to your device',cp:'Copied to clipboard',nv:'Video is not supported in this browser'};
 m.className='rsm';m.innerHTML='<div class="rsb2" role="dialog" aria-modal="true"><button type="button" class="rsx" aria-label="'+L.x+'">×</button><canvas width="'+W+'" height="'+H+'"></canvas><div class="rsa"><button type="button" class="p" data-a="i">'+L.i+'</button><button type="button" data-a="v">'+L.v+'</button><button type="button" data-a="t">'+L.t+'</button></div><p class="rss" aria-live="polite"></p></div>';
 document.body.appendChild(m);var cv=m.querySelector('canvas'),ctx=cv.getContext('2d'),st=m.querySelector('.rss'),bs=m.querySelectorAll('.rsa button'),busy=false;
 var t0=performance.now();function loop(){draw(ctx,(performance.now()-t0)/1000,d);raf=requestAnimationFrame(loop)}if(RM)draw(ctx,9,d);else loop();
 function close(){cancelAnimationFrame(raf);document.removeEventListener('keydown',kd);m.remove()}function kd(e){if(e.key==='Escape')close()}document.addEventListener('keydown',kd);
 m.addEventListener('click',function(e){if(e.target===m)close()});m.querySelector('.rsx').onclick=close;m.querySelector('.rsx').focus();
 function send(f){var sh={files:[f],title:d.np+' · '+d.title,text:stext(d)};if(navigator.canShare&&navigator.canShare(sh)){navigator.share(sh).catch(function(){})}else{dl(f);st.textContent=L.sv}}
 function lock(b){busy=b;bs.forEach(function(x){x.disabled=b})}
 function img(){var c2=document.createElement('canvas');c2.width=W;c2.height=H;draw(c2.getContext('2d'),9,d);c2.toBlob(function(b){send(new File([b],'rashifal-'+d.en.toLowerCase()+'.png',{type:'image/png'}))},'image/png')}
 function vid(){if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){st.textContent=L.nv;return}
  var mt=['video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9','video/webm'].filter(function(x){return MediaRecorder.isTypeSupported(x)})[0];if(!mt){st.textContent=L.nv;return}
  var c3=document.createElement('canvas');c3.width=W;c3.height=H;var x3=c3.getContext('2d'),rc=new MediaRecorder(c3.captureStream(30),{mimeType:mt,videoBitsPerSecond:4000000}),ch=[],T=7000,s0=performance.now(),r2=0;lock(true);
  rc.ondataavailable=function(e){if(e.data&&e.data.size)ch.push(e.data)};
  rc.onstop=function(){cancelAnimationFrame(r2);lock(false);st.textContent='';var ext=mt.indexOf('mp4')>-1?'mp4':'webm';send(new File([new Blob(ch,{type:mt.split(';')[0]})],'rashifal-'+d.en.toLowerCase()+'.'+ext,{type:mt.split(';')[0]}))};
  function f(){var e=performance.now()-s0;draw(x3,e/1000,d);st.textContent=L.rec+Math.min(100,Math.round(e/T*100))+'%';if(e<T)r2=requestAnimationFrame(f);else rc.stop()}rc.start();f()}
 function txt(){var s=stext(d);if(navigator.share){navigator.share({title:d.np+' · '+d.title,text:s}).catch(function(){})}else if(navigator.clipboard){navigator.clipboard.writeText(s).then(function(){st.textContent=L.cp})}}
 bs.forEach(function(b){b.onclick=function(){if(busy)return;st.textContent='';var a=b.dataset.a;if(a==='i')img();else if(a==='v')vid();else txt()}})}
})();

return{init:init,chip:chip,compute:compute,E:E,render:render,verdictFor:verdictFor}
})();
function rfPg(){document.title='Daily Rashifal — The Sujan Khadka';return '<div class="rf" id="rf"></div>'}
