/* João & Crist v0.9.6 — pacote visual de efeitos 16-bit */
(()=>{
  'use strict';
  const BASE='assets/effects/';
  const files={
    spark:'hit-spark.webp',
    explosion:'explosion-burst.webp',
    dust:'dust-cloud.webp',
    bossAura:'boss-aura.webp',
    slash:'slash-arc.webp',
    orb:'energy-orb.webp'
  };
  const sprites={};
  for(const [key,file] of Object.entries(files)){
    const src=BASE+file;
    sprites[key]=window.assetManager?.placeholder?.(src)||new Image();
    if(!sprites[key].src) sprites[key].src=src;
    window.assetManager?.loadImage?.(src,'shared').catch(()=>{});
  }
  window.GameFxSprites=sprites;
  window.drawGameFxSprite=function(ctx,key,x,y,size=48,alpha=1,rotation=0){
    const img=sprites[key];
    if(!img?.complete||!img.naturalWidth)return false;
    ctx.save();
    ctx.globalAlpha*=alpha;
    ctx.imageSmoothingEnabled=false;
    ctx.translate(x,y);ctx.rotate(rotation);
    const ratio=img.naturalWidth/img.naturalHeight;
    const h=size,w=size*ratio;
    ctx.drawImage(img,-w/2,-h/2,w,h);
    ctx.restore();
    return true;
  };
})();
