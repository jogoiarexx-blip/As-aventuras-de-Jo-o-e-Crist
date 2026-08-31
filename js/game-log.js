// Logger central de produção. Debug/warn ficam silenciosos quando DEV=false.
(() => {
  const dev=()=>window.DEV===true;
  window.GameLog={
    debug:(...a)=>{if(dev()) console.log(...a);},
    info:(...a)=>{if(dev()) console.info(...a);},
    warn:(...a)=>{if(dev()) console.warn(...a);},
    error:(...a)=>console.error(...a)
  };
})();
