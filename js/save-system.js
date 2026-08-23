// ========== SISTEMA DE SALVAMENTO ==========
class SaveSystem {
    constructor() {
        this.data = {
            highScore: 0,
            highestLevel: 0,
            totalPlaytime: 0,
            gamesPlayed: 0,
            favoriteCharacter: null,
            gameCompleted: false,
            lastSessionStartedAt: null,
            busMinigameUnlocked: false,
            busBestTime: null,
            busBestResistance: 0,
            busNoCollision: false,
            busTrophies: [],
            playerProgress: {
                João: { version: 2, level: 1, xp: 0, xpToNextLevel: 100, totalXpEarned: 0, killStats: { melee:0, ranged:0, assist:0, boss:0 }, unlockedSkills: [] },
                Crist: { version: 2, level: 1, xp: 0, xpToNextLevel: 100, totalXpEarned: 0, killStats: { melee:0, ranged:0, assist:0, boss:0 }, unlockedSkills: [] }
            }
        };
        this.loadSave();
    }
    
    load() {
        return this.data;
    }
    
    save(gameData) {
        if (gameData.score) {
            this.updateHighScore(gameData.score);
        }
        if (gameData.level) {
            this.updateHighestLevel(gameData.level);
        }
        if (gameData.playerCharacter) {
            this.updateFavoriteCharacter(gameData.playerCharacter);
        }
        // save() persiste estado; não contabiliza uma nova partida.
    }
    
    updateHighScore(score) {
        if (score > this.data.highScore) {
            this.data.highScore = score;
            this.saveSave();
            return true;
        }
        return false;
    }
    
    updateHighestLevel(level) {
        if (level > this.data.highestLevel) {
            this.data.highestLevel = level;
            this.saveSave();
        }
    }
    
    markGameCompleted() {
        if (!this.data.gameCompleted) {
            this.data.gameCompleted = true;
            this.data.completedAt = Date.now();
            this.saveSave();
        }
    }
    

    recordBusResult(result = {}) {
        const time = Number(result.time);
        const resistance = Math.max(0, Math.min(100, Number(result.resistance) || 0));
        this.data.busMinigameUnlocked = true;
        if (Number.isFinite(time) && time > 0 && (!Number.isFinite(this.data.busBestTime) || time < this.data.busBestTime)) this.data.busBestTime = time;
        this.data.busBestResistance = Math.max(Number(this.data.busBestResistance) || 0, resistance);
        if (result.noCollision) this.data.busNoCollision = true;
        if (!Array.isArray(this.data.busTrophies)) this.data.busTrophies = [];
        const add = id => { if (!this.data.busTrophies.includes(id)) this.data.busTrophies.push(id); };
        add('bus_road_trip');
        if (resistance >= 75) add('bus_good_driver');
        if (result.noCollision) add('bus_road_king');
        if (Number.isFinite(time) && time <= 72) add('bus_pedal_down');
        this.saveSave();
    }


    beginGame() {
        this.data.gamesPlayed = (Number(this.data.gamesPlayed) || 0) + 1;
        this.data.lastSessionStartedAt = Date.now();
        this.saveSave();
    }

    addPlaytime(seconds) {
        const safe = Math.max(0, Number(seconds) || 0);
        if (!safe) return;
        this.data.totalPlaytime = (Number(this.data.totalPlaytime) || 0) + safe;
        this.saveSave();
    }

    incrementGamesPlayed() {
        this.data.gamesPlayed++;
        this.saveSave();
    }
    
    updateFavoriteCharacter(character) {
        this.data.favoriteCharacter = character;
        this.saveSave();
    }
    
    savePlayerProgress(characterName, evolutionData) {
        if (!this.data.playerProgress) {
            this.data.playerProgress = {
                João: { version: 2, level: 1, xp: 0, xpToNextLevel: 100, totalXpEarned: 0, killStats: { melee:0, ranged:0, assist:0, boss:0 }, unlockedSkills: [] },
                Crist: { version: 2, level: 1, xp: 0, xpToNextLevel: 100, totalXpEarned: 0, killStats: { melee:0, ranged:0, assist:0, boss:0 }, unlockedSkills: [] }
            };
        }
        this.data.playerProgress[characterName] = evolutionData;
        this.saveSave();
    }
    
    loadPlayerProgress(characterName) {
        if (!this.data.playerProgress || !this.data.playerProgress[characterName]) {
            return { version: 2, level: 1, xp: 0, xpToNextLevel: 100, totalXpEarned: 0, killStats: { melee:0, ranged:0, assist:0, boss:0 }, unlockedSkills: [] };
        }
        return this.data.playerProgress[characterName];
    }
    
    saveSave() {
        try {
            localStorage.setItem('joaoCristSave', JSON.stringify(this.data));
        } catch (e) {
            console.warn('Não foi possível salvar progresso');
        }
    }
    
    loadSave() {
        try {
            const saved = localStorage.getItem('joaoCristSave');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.data = { ...this.data, ...parsed, playerProgress: { ...this.data.playerProgress, ...(parsed.playerProgress || {}) } };
                if (typeof this.data.busMinigameUnlocked !== 'boolean') this.data.busMinigameUnlocked = false;
                if (!Number.isFinite(this.data.busBestTime)) this.data.busBestTime = null;
                this.data.busBestResistance = Number(this.data.busBestResistance) || 0;
                this.data.busNoCollision = !!this.data.busNoCollision;
                if (!Array.isArray(this.data.busTrophies)) this.data.busTrophies = [];
                // Migração de saves antigos: quem já alcançou/zerou a última fase também recebe o seletor.
                if (typeof this.data.gameCompleted !== 'boolean') {
                    this.data.gameCompleted = Number(this.data.highestLevel || 0) >= 6;
                }
            }
        } catch (e) {
            console.warn('Não foi possível carregar progresso');
        }
    }
    
    resetSave() {
        if (confirm('Tem certeza que deseja resetar todo o progresso?')) {
            this.data = {
                highScore: 0,
                highestLevel: 0,
                totalPlaytime: 0,
                gamesPlayed: 0,
                favoriteCharacter: null,
                gameCompleted: false,
                lastSessionStartedAt: null,
            lastSessionStartedAt: null,
                busMinigameUnlocked: false,
                busBestTime: null,
                busBestResistance: 0,
                busNoCollision: false,
                busTrophies: [],
                playerProgress: {
                    João: { version: 2, level: 1, xp: 0, xpToNextLevel: 100, totalXpEarned: 0, killStats: { melee:0, ranged:0, assist:0, boss:0 }, unlockedSkills: [] },
                    Crist: { version: 2, level: 1, xp: 0, xpToNextLevel: 100, totalXpEarned: 0, killStats: { melee:0, ranged:0, assist:0, boss:0 }, unlockedSkills: [] }
                }
            };
            this.saveSave();
            
            // Limpar conquistas também
            localStorage.removeItem('joaoCristAchievements');
            localStorage.removeItem('joaoCristStats');
            localStorage.removeItem('trophies');
            localStorage.removeItem('game_trophies');
        }
    }
}
