const GARDEN_FLOWERS=[
 {name:'百合',shape:'lily'},{name:'玫瑰',shape:'rose'},{name:'郁金香',shape:'tulip'},{name:'铃兰',shape:'bells'},{name:'大飞燕',shape:'delphinium'},{name:'鸢尾',shape:'iris'},{name:'向日葵',shape:'sunflower'},{name:'雏菊',shape:'daisy'},{name:'绣球',shape:'hydrangea'},{name:'牡丹',shape:'peony'},{name:'薰衣草',shape:'lavender'},{name:'樱花',shape:'cherry'}
];
const gardenAliases={'美利坚合众国':'美国','俄罗斯联邦':'俄罗斯','大韩民国':'韩国','朝鲜民主主义人民共和国':'朝鲜','阿拉伯叙利亚共和国':'叙利亚','坦桑尼亚联合共和国':'坦桑尼亚','刚果民主共和国':'刚果（金）','刚果共和国':'刚果（布）'};
const gardenData=window.GARDEN_COUNTRY_PATHS||[];
gardenData.forEach(c=>{c.label=gardenAliases[c.name]||c.name;let index=countries.findIndex(x=>x[0]===c.label);if(index<0){index=countries.length;countries.push([c.label,c.lon,c.lat])}c.index=index});
const gardenColors=['#eb8da1','#d85776','#f5c85c','#b49cdb','#80a7d9','#ebae81','#f6eee4','#c179af','#8a9cdb','#e7a9c1','#bd545d','#93b6ba'];
function gardenBlossom(shape,color){
 const petal=(angle,path)=>'<path transform="rotate('+angle+')" d="'+path+'" fill="'+color+'" stroke="#5b5d5733" stroke-width=".45"/>';
 const radial=(n,path)=>Array.from({length:n},(_,i)=>petal(i*360/n,path)).join('');
 const stem='<path d="M0 0Q-2 10 0 19M-1 11Q-12 5-9 13Q-4 16-1 13M0 15Q10 6 8 15Q4 19 0 17" fill="#83a86e" stroke="#5b895e" stroke-width="1"/>';
 let head='';
 if(shape==='lily')head=radial(6,'M0 1Q-8-5 0-15Q8-5 0 1')+'<circle r="2.3" fill="#d6a64d"/>';
 else if(shape==='rose'||shape==='peony')head=radial(shape==='rose'?7:10,'M0 3C-14-2-10-15 0-11C10-15 14-2 0 3')+'<path d="M-5-5Q0-12 5-5Q9 2 0 4Q-7 1-3-3Q2-7 3-2" fill="none" stroke="#9a4c63" stroke-width="1.4"/>';
 else if(shape==='tulip')head='<path d="M-10-14L-4-9L0-16L5-9L10-14Q12 3 0 5Q-12 3-10-14" fill="'+color+'" stroke="#b96a7055"/><path d="M0-14Q-5-5 0 5M5-9Q2-3 0 5" fill="none" stroke="#ffffff88"/>';
 else if(shape==='bells'){head='<path d="M0 10Q11-16-2-20" fill="none" stroke="#5b895e" stroke-width="1.3"/>';for(let i=0;i<5;i++){const x=3+Math.sin(i)*3,y=-17+i*5;head+='<path d="M'+x+' '+y+'q-7 0-5 6l-2 2q6-2 9 1l-1-3q2-6-1-6" fill="#fffdf4" stroke="#99ad92" stroke-width=".7"/>'}}
 else if(shape==='lavender')head='<path d="M0 10L0-26" stroke="#628a61" stroke-width="1.2"/>'+Array.from({length:8},(_,i)=>'<ellipse cx="'+(i%2?2:-2)+'" cy="'+(-25+i*4)+'" rx="3.2" ry="2.3" fill="'+color+'" transform="rotate('+(i%2?25:-25)+' 0 '+(-25+i*4)+')"/>').join(''); else if(shape==='delphinium'){head='<path d="M0 8L0-26" stroke="#628a61" stroke-width="1.2"/>';for(let i=0;i<8;i++){const y=-24+i*4,x=i%2?3:-3;head+='<g transform="translate('+x+' '+y+') scale(.27)">'+radial(5,'M0 2Q-10-2-3-10Q2-14 5-5Q11-2 0 2')+'<circle r="2" fill="#fff0c7"/></g>'}}
 else if(shape==='iris')head=radial(3,'M0 3C-19 7-17-7-6-8L-3-18Q7-17 2-4L0 3')+'<path d="M-2-8L0 2L3-8" fill="none" stroke="#f3d271" stroke-width="2"/>';
 else if(shape==='hydrangea'){for(let i=0;i<12;i++){const a=i*2.4,r=Math.sqrt(i)*3;head+='<g transform="translate('+(Math.cos(a)*r)+' '+(Math.sin(a)*r-5)+') scale(.34)">'+radial(4,'M0 1Q-10-7 0-11Q10-7 0 1')+'<circle r="2" fill="#f6ecd0"/></g>'}}
 else if(shape==='cherry')head=radial(5,'M0 2C-13-2-10-13-3-12L0-8L3-12C10-13 13-2 0 2')+'<circle r="2" fill="#c58668"/>';
 else head=radial(shape==='sunflower'?13:12,'M0 1Q-6-5 0-13Q6-5 0 1')+'<circle r="'+(shape==='sunflower'?5:3)+'" fill="'+(shape==='sunflower'?'#896348':'#eac365')+'"/>';
 return stem+head;
}
function gardenFlowerSVG(f,size=40){return '<svg width="'+size+'" height="'+size+'" viewBox="-20 -30 40 52" aria-label="'+esc(f.flowerName||'小花')+'">'+gardenBlossom(f.flowerShape||'daisy',f.color||'#e99dad')+'</svg>'}
worldMap=function(){
 const paths=gardenData.map(c=>'<path d="'+c.d+'" class="garden-country" fill-rule="evenodd" tabindex="0" role="button" aria-label="在'+esc(c.label)+'种花" onclick="chooseCountry('+c.index+')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();chooseCountry('+c.index+')}"><title>'+esc(c.label)+'</title></path>').join('');
 const flowers=state.flowers.map((f,i)=>{const c=countries[f.country];if(!c)return '';const [x,y]=xy(c[1],c[2]);return '<g transform="translate('+(x+(i%3-1)*2)+' '+(y-3)+') scale(.75)" pointer-events="none"><title>'+esc(c[0]+' · '+(f.flowerName||'旧版小花'))+'</title>'+gardenBlossom(f.flowerShape||'daisy',f.color)+'</g>'}).join('');
 return '<style>.garden-country{fill:#dce7cf;stroke:#fffdf6;stroke-width:.65;vector-effect:non-scaling-stroke;cursor:pointer;transition:fill .2s}.garden-country:hover,.garden-country:focus{fill:#a9c49b;stroke:#71926c;outline:none}.garden-map svg{width:100%;height:auto;display:block}.garden-flower-shelf{display:flex;gap:13px;overflow-x:auto;padding:12px 0}.garden-flower-shelf>div{min-width:47px;text-align:center;font-size:10px;color:#70816a}</style><div class="garden-map" style="background:#f0f7f7;border-radius:12px;overflow:hidden"><svg viewBox="20 10 610 310" role="img" aria-label="基于Natural Earth数据的世界国家地图"><rect x="20" y="10" width="610" height="310" fill="#eff6f5"/>'+paths+flowers+'</svg></div><div class="row between" style="margin-top:10px"><span class="fine">'+countries.length+' 个国家及地区可选 · 12种花型</span><button class="mini" onclick="gardenLargeMap()">放大地图 ↗</button></div><div class="garden-flower-shelf">'+GARDEN_FLOWERS.map((f,i)=>'<div>'+gardenFlowerSVG({flowerShape:f.shape,flowerName:f.name,color:gardenColors[i]},36)+'<br>'+f.name+'</div>').join('')+'</div><p class="fine" style="font-size:9px">地图：Natural Earth 1:110m · 地理轮廓与国家边界；小岛可从列表选择。</p>';
};
window.gardenLargeMap=function(){modal('我的世界花园',worldMap());$('#modal').style.maxWidth='1100px'};
plant=function(i){
 if(!Number.isInteger(i)||!countries[i]||available()<10)return toast('需要10分才能种花');
 const type=GARDEN_FLOWERS[Math.floor(Math.random()*GARDEN_FLOWERS.length)],color=gardenColors[Math.floor(Math.random()*gardenColors.length)];
 state.flowers.push({id:uid(),country:i,date:today(),style:'✿',color,flowerName:type.name,flowerShape:type.shape});
 save();render();toast('一束'+type.name+'在'+countries[i][0]+'盛开了！');
};
chooseCountry=function(i){
 if($('#country'))$('#country').value=i;
 if(available()<10)return toast('再积攒 '+(10-available())+' 分就可以在'+countries[i][0]+'种花啦');
 modal('下一站 · '+countries[i][0],'<div class="garden-flower-shelf">'+GARDEN_FLOWERS.map((f,j)=>'<div>'+gardenFlowerSVG({flowerShape:f.shape,color:gardenColors[j]},38)+'<br>'+f.name+'</div>').join('')+'</div><p>用10积分种一束花，品种和颜色随机。每一次坚持，都会有不同的惊喜。</p><div class="modalactions"><button class="primary" onclick="plant('+i+');closeModal()">种下小花 · 10分</button></div>');
};
flowerList=function(){modal('世界里的种花足迹',state.flowers.map(f=>'<div class="task">'+gardenFlowerSVG(f,46)+'<div><b>'+esc(countries[f.country]?.[0]||'未知地点')+' · '+esc(f.flowerName||'旧版小花')+'</b><p>'+f.date+' · 10积分</p></div><button class="mini" onclick="removeFlower(\''+f.id+'\')">撤回</button></div>').join('')||'<div class="empty">你的第一束花，正在路上。</div>')};
render();

