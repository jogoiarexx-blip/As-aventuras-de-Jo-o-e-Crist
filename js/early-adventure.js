/* João & Crist v0.9.12 — primeiros capítulos da viagem
   Canvas 2D / uma ou duas pessoas / sem imagens nem downloads novos. */
(() => {
  'use strict';
  const supplies = [
    {id:'bilhete', label:'BILHETE PREMIADO', x:330, kind:'ticket', color:'#f8d36e'},
    {id:'malas', label:'MALAS', x:660, kind:'suitcase', color:'#bb8b64'},
    {id:'documentos', label:'DOCUMENTOS', x:995, kind:'passport', color:'#8ac5ff'}
  ];
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  class EarlyAdventure {
    constructor(){this.reset(-1);}
    reset(levelIndex=-1){
      this.levelIndex=levelIndex;
      this.collected=new Set();
      this.bike={state:'idle',x:0,timer:0,hit:false};
      this.message='';this.messageFrames=0;
      this.readyNotified=false;
    }
    notify(text,frames=175){
      this.message=text;this.messageFrames=frames;
      window.GameDebugConsole?.log?.('[AVENTURA] '+text);
    }
    isStageReady(id){
      return id!==1 || this.collected.size===supplies.length;
    }
    missingSupplies(){return supplies.filter(item=>!this.collected.has(item.id)).map(item=>item.label);}
    update(players,groundY){
      if(this.messageFrames>0)this.messageFrames--;
      const alive=(players||[]).filter(p=>p&&p.life>0);
      if(!alive.length)return;
      const lead=Math.max(...alive.map(p=>p.x+(p.w||0)));
      if(this.levelIndex===0){
        for(const item of supplies){
          if(this.collected.has(item.id))continue;
          const collected=alive.some(p=>Math.abs((p.x+(p.w||0)/2)-item.x)<=55 && Math.abs((p.y+(p.h||0))-groundY)<95);
          if(!collected)continue;
          this.collected.add(item.id);
          this.notify(item.label+' GUARDADO!  '+this.collected.size+'/'+supplies.length,155);
          window.soundSystem?.playSound?.('menuSelect');
          if(this.collected.size===supplies.length){
            this.notify('TUDO PRONTO! ACABE COM OS ENCRENQUEIROS E PARTA PARA A CIDADE.',230);
          }
        }
      } else if(this.levelIndex===1){
        const b=this.bike;
        if(b.state==='idle' && lead>=1120){
          b.state='warning';b.timer=65;b.x=lead+425;
          this.notify('CUIDADO! UM CICLISTA VEM NA CONTRAMAO!',150);
        } else if(b.state==='warning'){
          b.timer--;
          if(b.timer<=0){b.state='moving';b.timer=190;}
        } else if(b.state==='moving'){
          b.x-=8.2;
          b.timer--;
          if(!b.hit){
            for(const p of alive){
              const center=p.x+(p.w||0)*0.5;
              const feet=p.y+(p.h||0);
              if(Math.abs(center-b.x)<42 && Math.abs(feet-groundY)<44){
                b.hit=true;
                if(typeof p.takeDamage==='function')p.takeDamage(8);
                this.notify('POR UM TRIZ! CRIST: OLHA A BICICLETA, JOAO!',190);
                break;
              }
            }
          }
          if(b.timer<=0||b.x<lead-950){
            b.state='done';
            if(!b.hit)this.notify('JOAO: ESSA PASSOU RASPANDO! VAMOS A RODOVIARIA.',180);
          }
        }
      }
    }
    drawWorld(ctx,groundY,cameraX=0,viewWidth=1000){
      if(this.levelIndex===0){
        for(const item of supplies){
          if(this.collected.has(item.id)||item.x<cameraX-80||item.x>cameraX+viewWidth+80)continue;
          const x=item.x, y=groundY-45;
          ctx.save();
          ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(x-55,y-59,110,28);
          ctx.fillStyle='#fff9e7';ctx.font='bold 11px monospace';ctx.textAlign='center';
          ctx.fillText(item.label,x,y-40);
          ctx.strokeStyle=item.color;ctx.lineWidth=3;ctx.fillStyle=item.color;
          if(item.kind==='ticket'){
            ctx.fillRect(x-23,y-17,46,27);ctx.fillStyle='#62450e';ctx.fillRect(x-13,y-8,26,4);
          }else if(item.kind==='suitcase'){
            ctx.fillRect(x-21,y-18,42,32);ctx.strokeRect(x-10,y-23,20,8);
            ctx.fillStyle='#442d20';ctx.fillRect(x-1,y-18,4,32);
          }else{
            ctx.fillRect(x-18,y-22,36,40);ctx.fillStyle='#255080';ctx.fillRect(x-8,y-12,16,4);
            ctx.fillStyle='#fff';ctx.fillRect(x-8,y-4,20,3);
          }
          ctx.restore();
        }
      } else if(this.levelIndex===1 && this.bike.state!=='idle'&&this.bike.state!=='done'){
        const b=this.bike, x=b.x, y=groundY-15;
        if(x<cameraX-100||x>cameraX+viewWidth+100)return;
        ctx.save();
        if(b.state==='warning'){
          ctx.fillStyle='rgba(255,176,50,.9)';ctx.font='bold 22px monospace';ctx.textAlign='center';
          ctx.fillText('! CICLISTA !',x,y-105);
          ctx.restore();return;
        }
        ctx.lineWidth=4;ctx.strokeStyle='#15151c';
        for(const dx of [-22,23]){ctx.beginPath();ctx.arc(x+dx,y-13,15,0,Math.PI*2);ctx.stroke();}
        ctx.strokeStyle='#e9d46d';ctx.beginPath();ctx.moveTo(x-22,y-13);ctx.lineTo(x-3,y-42);ctx.lineTo(x+23,y-13);ctx.lineTo(x-22,y-13);ctx.stroke();
        ctx.fillStyle='#b2e7fc';ctx.fillRect(x-5,y-67,19,25);
        ctx.fillStyle='#f0bd8b';ctx.fillRect(x+2,y-79,15,12);
        ctx.fillStyle='#29324b';ctx.fillRect(x-12,y-44,17,6);
        ctx.restore();
      }
    }
    drawHUD(ctx){
      if(this.levelIndex!==0&&this.levelIndex!==1)return;
      ctx.save();
      ctx.fillStyle='rgba(9,17,30,.86)';ctx.fillRect(18,520,425,this.levelIndex===0?104:52);
      ctx.fillStyle='#f4d78b';ctx.font='bold 15px monospace';ctx.textAlign='left';
      if(this.levelIndex===0){
        ctx.fillText('FAZENDA  |  PREPARAR VIAGEM  '+this.collected.size+'/3',32,542);
        supplies.forEach((item,i)=>{
          ctx.fillStyle=this.collected.has(item.id)?'#8cebb0':'#d7ddeb';
          ctx.font='12px monospace';
          ctx.fillText((this.collected.has(item.id)?'[OK] ':'[  ] ')+item.label,32+(i===2?220:0),564+(i===1?20:0));
        });
      } else {
        ctx.fillText('CIDADE  |  ENCONTRE O ONIBUS PARA VEGAS',32,550);
      }
      if(this.messageFrames>0){
        ctx.fillStyle='rgba(4,8,14,.89)';ctx.fillRect(190,447,620,54);
        ctx.fillStyle='#ffe3a2';ctx.font='bold 15px monospace';ctx.textAlign='center';
        const msg=this.message.length>65?this.message.slice(0,62)+'...':this.message;
        ctx.fillText(msg,500,479);
      }
      ctx.restore();
    }
  }
  window.earlyAdventure=new EarlyAdventure();
  window.EarlyAdventure=EarlyAdventure;
})();