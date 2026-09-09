/* Popup polish v0.9.9 */
(()=>{
  function install(){
    const old = window.createTextPopup;
    if(typeof old !== 'function' || old.__popupPolishWrapped) return false;
    const wrapped = function(x,y,text,color,size=24){
      const t=String(text||'');
      const special = /COMBO|K\.O\.|BOSS|INVENC|FORÇA|VELOCIDADE|HP|XP/.test(t.toUpperCase());
      const s = special ? Math.round(size*1.08) : size;
      return old.call(this,x,y,t,color,s);
    };
    wrapped.__popupPolishWrapped = true;
    window.createTextPopup = wrapped;
    return true;
  }
  if(!install()){
    let tries=0;
    const timer=setInterval(()=>{tries++; if(install()||tries>120) clearInterval(timer);}, 250);
  }
})();
