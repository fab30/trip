/**
 * jDocumentary Sound Manager Module
 * Gestionnaire audio pour la lecture de musique de fond
 */

function jSoundManager() {
    var self = this;
    this.myPlaylist = null;
    this.player = null;
    this.onReady = null;
    this.currentVolume = 0.3;
    this.mute = false;
    this.play = false;
    
    this.isReady = function() {
        return this.myPlaylist != null;
    };
    
    this.init = function() {
        this.myPlaylist = new jPlayerPlaylist({
            jPlayer: "#mp3Reader",
            cssSelectorAncestor: "#jukebox"
        }, [], {
            playlistOptions: {
                enableRemoveControls: false
            },
            swfPath: "jplayer/jplayer",
            volume: this.currentVolume,
            supplied: "mp3"
        });
        this.player = $("#mp3Reader");
        this.restoreOnReady();
    };
    
    this.restoreOnReady = function() {
        if (this.isReady()) {
            if (this.onReady != null) {
                this.togglePlay();
                this.changeVolume();
                this.onReady = null;
            }
        }
    };
    
    this.setPlaylist = function(playlist) {
        this.myPlaylist.setPlaylist(playlist);
    };
    
    this.toggleMute = function() {
        this.player.jPlayer("mute", !this.mute);
        this.mute = !this.mute;
    };
    
    this.changeVolume = function() {
        this.player.jPlayer("volume", this.currentVolume);
    };
    
    this.volumeMinus = function() {
        if (this.currentVolume > 0) {
            this.currentVolume = this.currentVolume - 0.1;
            this.player.jPlayer("volume", this.currentVolume);
        }
    };
    
    this.volumePlus = function() {
        if (this.currentVolume < 1) {
            this.currentVolume = this.currentVolume + 0.1;
            this.player.jPlayer("volume", this.currentVolume);
        }
    };
    
    this.volumeMax = function() {
        this.currentVolume = 1;
        this.player.jPlayer("volume", this.currentVolume);
    };
    
    this.previous = function() {
        this.myPlaylist.previous();
        this.play = true;
    };
    
    this.togglePlay = function() {
        if (!this.play) {
            this.myPlaylist.play();
        } else {
            this.myPlaylist.pause();
        }
        this.play = !this.play;
    };
    
    this.stop = function() {
        this.player.jPlayer("stop");
        this.play = false;
    };
    
    this.next = function() {
        this.myPlaylist.next();
        this.play = true;
    };
    
    return this;
}