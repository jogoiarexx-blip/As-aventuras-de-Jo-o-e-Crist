// Chico Fumaça - personagem desbloqueável após vencer o bônus da pescaria.
const CHICO_PLAYER_SPRITE = new Image();
CHICO_PLAYER_SPRITE.src = 'assets/npc/chico-fumaca/chico-fumaca-idle.webp';

class PlayerChico extends PlayerCrist {
    constructor(x, y, controlPlayer = 1) {
        super(x, y, controlPlayer);
        this.name = 'Chico Fumaça';
        this.w = 52;
        this.h = 74;
        this.speed = 5.6;
        this.maxLife = 125;
        this.life = this.maxLife;
        this.primaryColor = '#f0a93b';
        this.secondaryColor = '#8c5420';
        this.hitbox = { offsetX: 7, offsetY: 18, width: 38, height: 52 };
        this.spriteBaseOffset = 3;
        this._chicoVisualTime = Math.random() * 1000;
    }

    getHitbox() {
        if (!this.attacking || this.attackTimer > 10 || this.attackTimer < 5) return null;
        const w = 70, h = 43;
        return {
            x: this.facingRight ? this.x + this.w - 2 : this.x - w + 2,
            y: this.y + 18,
            w, h
        };
    }

    drawCristSprite(ctx) { this.drawChicoSprite(ctx); }
    drawCrist(ctx) { this.drawChicoSprite(ctx); }

    drawChicoSprite(ctx) {
        if (!CHICO_PLAYER_SPRITE.complete || !CHICO_PLAYER_SPRITE.naturalWidth) {
            ctx.fillStyle = '#d9772a';
            ctx.fillRect(this.x, this.y, this.w, this.h);
            return;
        }
        const t = performance.now() + this._chicoVisualTime;
        let drawH = 102;
        let drawW = drawH * (CHICO_PLAYER_SPRITE.naturalWidth / CHICO_PLAYER_SPRITE.naturalHeight);
        let lean = 0, bob = Math.sin(t/170)*1.5;
        if (this.attacking) { lean = this.facingRight ? 9 : -9; drawH = 106; }
        else if (this.dashing) { lean = this.facingRight ? 13 : -13; bob = -2; }
        else if (this.isJumping) { bob = -5; }
        else if (this.isMoving) { bob = Math.sin(t/85)*3; }
        drawW = drawH * (CHICO_PLAYER_SPRITE.naturalWidth / CHICO_PLAYER_SPRITE.naturalHeight);
        const cx = this.x + this.w/2 + lean;
        const bottom = this.y + this.h + this.spriteBaseOffset;
        const dx = cx - drawW/2, dy = bottom - drawH + bob;
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        if (this.invulnerable > 0 && Math.floor(this.invulnerable/5)%2===0) ctx.globalAlpha=.55;
        if (!this.facingRight) {
            ctx.translate(dx+drawW,0); ctx.scale(-1,1);
            ctx.drawImage(CHICO_PLAYER_SPRITE,0,dy,drawW,drawH);
        } else ctx.drawImage(CHICO_PLAYER_SPRITE,dx,dy,drawW,drawH);
        if (this.attacking && this.attackTimer <= 10 && this.attackTimer >= 5) {
            ctx.globalAlpha=.28; ctx.strokeStyle='#ffd66b'; ctx.lineWidth=8;
            ctx.beginPath();
            ctx.arc(this.facingRight?cx+45:cx-45, dy+58, 32, this.facingRight?-1.2:2.0, this.facingRight?1.1:4.25);
            ctx.stroke();
        }
        ctx.restore();
    }
}
