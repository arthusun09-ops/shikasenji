/* 鹿しかミニゲーム ハイスコアランキング（ゲームとサイトのトップで共用）
   記録：Googleフォーム「鹿しかミニゲーム ハイスコア」へ送る（1つの記述式の質問に `名前|スコア|ステージ|キャラ`）
   表示：回答の表を gviz の JSONP で読む（リンクを知っている全員が閲覧可）。表の行を消せばランキングからも消える。
   名前はアルファベットと数字3文字だけ。メールなどは集めない。 */
(function(){
'use strict';
var C={
  form:'1FAIpQLSesv2Yqd3N0h6rhXGdM0EhSnYeIZwCxafCLN0apHEMfFV9yCw',
  entry:'entry.16803196',
  sheet:'11M70kwamcqeLiV_vk_SdwBWErrKC7OWzVCYZe7nctBo',
  gid:'817989126'
};
var WHO={asu:'あーすさん',rin:'凛',momiji:'もみじ',shika:'しかちゃん'};
var MAX_SCORE=200000;

function clean(n){return String(n||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3);}
function parse(v,i){
  var p=String(v||'').split('|');if(p.length<4)return null;
  var name=clean(p[0]),score=parseInt(p[1],10),stage=parseInt(p[2],10),who=p[3];
  if(!name||!(score>=0&&score<=MAX_SCORE)||!(stage>=1&&stage<=99)||!WHO[who])return null;
  return {name:name,score:score,stage:stage,who:who,i:i};
}
function sort(list){return list.sort(function(a,b){return b.score-a.score||b.stage-a.stage||a.i-b.i;});}

function submit(name,score,stage,who){
  var body=new URLSearchParams();body.append(C.entry,[clean(name),score|0,stage|0,who].join('|'));
  return fetch('https://docs.google.com/forms/d/e/'+C.form+'/formResponse',{method:'POST',mode:'no-cors',body:body})
    .then(function(){return true;}).catch(function(){return false;});
}
function load(){
  return new Promise(function(res){
    var cb='__skRank'+Date.now()+Math.floor(Math.random()*1e4),s=document.createElement('script'),done=false;
    function fin(v){if(done)return;done=true;clearTimeout(to);try{delete window[cb];}catch(e){window[cb]=undefined;}s.remove();res(v);}
    var to=setTimeout(function(){fin(null);},9000);
    window[cb]=function(d){
      try{var out=[];(d.table.rows||[]).forEach(function(r,i){var c=r.c&&r.c[1];var e=c&&parse(c.v,i);if(e)out.push(e);});fin(sort(out));}
      catch(e){fin(null);}
    };
    s.onerror=function(){fin(null);};
    s.src='https://docs.google.com/spreadsheets/d/'+C.sheet+'/gviz/tq?gid='+C.gid+'&tqx=responseHandler:'+cb+'&_='+Date.now();
    document.head.appendChild(s);
  });
}

var CSS='.skr{font-family:"DotGothic16",ui-monospace,monospace;background:#07060f;color:#fff;border-radius:12px;padding:14px 12px 12px;box-shadow:0 0 0 3px #1d1740 inset,0 0 18px rgba(255,60,200,.35);text-align:center;letter-spacing:.06em}'+
 '.skr h3{margin:0 0 8px;font-size:1.25em;font-weight:400;color:#ff4fd8;text-shadow:0 0 8px #ff4fd8;animation:skrB 1.1s steps(2) infinite}'+
 '.skr .sub{font-size:.75em;color:#8ab4ff;margin:-4px 0 8px}'+
 '.skr table{width:100%;border-collapse:collapse;font-size:.95em}'+
 '.skr td{padding:3px 4px;white-space:nowrap}'+
 '.skr td.r{text-align:left;width:3.2em}.skr td.n{text-align:left;letter-spacing:.25em}.skr td.s{text-align:right}.skr td.st{text-align:right;font-size:.8em;opacity:.8}'+
 '.skr td.w img{height:1.6em;vertical-align:middle}'+
 '.skr tr.new td{animation:skrB .5s steps(2) infinite}'+
 '.skr .msg{font-size:.85em;opacity:.8;padding:8px 0}'+
 '@keyframes skrB{50%{opacity:.35}}';
var RC=['#ffd54a','#d9e2ec','#ff9a5a','#7fe0ff','#7fe0ff','#9dff7a','#9dff7a','#ff8ac8','#ff8ac8','#b58cff'];
var SUF=['ST','ND','RD'];
function css(){if(document.getElementById('skr-css'))return;var st=document.createElement('style');st.id='skr-css';st.textContent=CSS;document.head.appendChild(st);}
function pad(n){n=String(n);while(n.length<6)n='0'+n;return n;}
function render(el,list,opt){
  opt=opt||{};css();var top=opt.top||10,base=opt.base||'',mine=opt.mine;
  var h='<div class="skr"><h3>HIGH SCORE</h3><div class="sub">鹿しかミニゲーム　帰ってもらった数ランキング</div>';
  if(list===null)h+='<div class="msg">ランキングを読みこめませんでした</div>';
  else if(!list.length)h+='<div class="msg">まだだれも登録していません。一番乗りをねらおう！</div>';
  else{
    h+='<table>';
    list.slice(0,top).forEach(function(e,i){
      var isMine=mine&&e.name===mine.name&&e.score===mine.score&&e.who===mine.who;
      h+='<tr'+(isMine?' class="new"':'')+' style="color:'+RC[i%RC.length]+'"><td class="r">'+(i+1)+(SUF[i]||'TH')+'</td><td class="n">'+e.name+'</td><td class="s">'+pad(e.score)+'</td><td class="st">ST'+e.stage+'</td><td class="w"><img src="'+base+'img/sel_'+e.who+'.webp" alt="'+WHO[e.who]+'" title="'+WHO[e.who]+'"></td></tr>';
    });
    h+='</table>';
  }
  el.innerHTML=h+'</div>';
}
// サイトのトップ用：<div id="sk-rank"></div> があれば自動で表示（base は game/）
function auto(){var el=document.getElementById('sk-rank');if(!el)return;render(el,[],{base:el.getAttribute('data-base')||'game/'});el.querySelector('.msg').textContent='読みこみ中…';
  load().then(function(l){render(el,l,{base:el.getAttribute('data-base')||'game/',top:+(el.getAttribute('data-top')||10)});});}
window.SKRank={C:C,submit:submit,load:load,render:render,clean:clean,insert:function(list,e){return sort((list||[]).concat([Object.assign({i:1e9},e)]));}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',auto);else auto();
})();
