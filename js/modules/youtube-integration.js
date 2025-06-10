/**
 * jDocumentary YouTube Integration Module
 * Gestion de l'intégration des vidéos YouTube
 */

// Variables globales pour les callbacks YouTube
var youTubePlayerStateChange = {};
var youTubePlayerError = {};

// Callback global pour l'API YouTube
function onYouTubePlayerReady(playerId) {
    var element = document.getElementById(playerId);
    var instance = $.fn.jDocumentary.INSTANCE;
    var layerDiv = $(element).parent();
    var page = instance.page(layerDiv.attr("pagename"));
    var layer = page.layer(layerDiv.attr("layername"));
    
    layer.ytPlayer = element;
    
    // Configuration des callbacks d'état
    youTubePlayerStateChange[playerId] = function(state) {
        if (state == 0) { // Vidéo terminée
            if ("onVideoEnded" in layer.data) {
                instance.getSoundManager().unMute();
                layer.data.onVideoEnded(layer, page, instance);
            }
        }
    };
    
    // Configuration des callbacks d'erreur
    youTubePlayerError[playerId] = function(errorCode) {
        if ("onVideoError" in layer.data) {
            layer.data.onVideoError(layer, page, instance, errorCode);
        }
    };
    
    // Ajout des listeners d'événements (non IE)
    if (!$.browser.msie) {
        element.addEventListener("onStateChange", "youTubePlayerStateChange." + playerId);
        element.addEventListener("onError", "youTubePlayerError." + playerId);
    }
    
    // Configuration de la vidéo
    element.cueVideoById(layer.data.youtube, 0, "small");
    element.playVideo();
    element.setVolume(instance.getSoundManager().currentVolume * 100);
    
    if (instance.getSoundManager().mute) {
        element.mute();
    }
    
    // Callback de démarrage de la vidéo
    if ("onVideoStarted" in layer.data) {
        instance.getSoundManager().mute();
        layer.data.onVideoStarted(layer, page, instance);
    }
}

// Fonction utilitaire pour créer un lecteur YouTube
function createYouTubePlayer(containerId, videoId, width, height, options) {
    options = options || {};
    
    var params = {
        allowScriptAccess: "always",
        allowfullscreen: "true",
        wmode: "transparent"
    };
    
    var atts = {
        id: containerId
    };
    
    var playerVars = {
        enablejsapi: 1,
        autoplay: options.autoplay || 1,
        controls: options.controls || 0,
        modestbranding: options.modestbranding || 1,
        rel: options.rel || 0,
        showinfo: options.showinfo || 0,
        loop: options.loop || 0
    };
    
    // Cette fonction nécessiterait l'API YouTube Player (SWF), 
    // mais nous utilisons maintenant l'iframe API
    // Conservé pour compatibilité avec l'ancien code
}