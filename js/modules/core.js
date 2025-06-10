/**
 * jDocumentary Core Module
 * Module principal contenant les constantes, utilitaires et le plugin principal
 */

// Vérification de jQuery
if (typeof jQuery == "undefined") {
    alert("Error: you must import the jQuery file before jDocumentary");
}

// Fonction utilitaire
function ucfirst(str) {
    if (str.length > 0) {
        return str[0].toUpperCase() + str.substring(1);
    } else {
        return str;
    }
}

// Plugin principal jDocumentary
$.fn.jDocumentary = function(options) {
    if ($.fn.jDocumentary.INSTANCE != null) {
        return $.fn.jDocumentary.INSTANCE;
    }
    
    $.fn.jDocumentary.INSTANCE = this;
    window["$$"] = this;
    
    if (options.scenario == null) {
        alert("[jDocumentary error]\nDont forget to link the scenario file");
        return null;
    }
    
    if (this.length !== 1 || this[0] !== document.body) {
        console.error("[jDocumentary error] jDocumentary must be used on <body> only.");
        return null;
    }
    
    // Initialisation des propriétés
    this.currentState = null;
    this.state = function(newState) {
        if (newState) {
            this.currentState = newState;
        } else {
            return this.currentState;
        }
    };
    
    this.state($.fn.jDocumentary.STATE.init);
    
    var self = this;
    this.opts = {};
    this.opts = $.extend({}, $.fn.jDocumentary.DEFAULTS, options);
    this.sce = new jScenario(options.scenario.pages, this);
    this.playlist = [];
    
    // Préparation de la playlist
    $.each(options.scenario.playlist, function (index, value) {
        self.playlist.push({mp3: value});
    });
    
    // Préchargement forcé des images
    this._preloadImages = function(pages) {
        var self = this;
        $.each(pages, function (index, page) {
            var havePreload = false;
            var haveTagClass = false;
            var imgToLoad = undefined;
            
            $.each(page.layers, function (index, layer) {
                if (layer.preloadPictures != undefined) {
                    havePreload = true;
                }
                if (layer.tagClass == "jdocumentary-preloadmsg") {  
                    haveTagClass = true;
                }
                if (layer.background != undefined) {
                    imgToLoad = layer.background;
                }
            });
            
            if (!havePreload && imgToLoad != undefined) {
                var layer = {
                    "preloadPictures": [imgToLoad],
                    "visible": true
                };
                page.layers.push(layer);
            }
            
            if (!haveTagClass && imgToLoad != undefined) {
                var layer = {
                    "html": "Chargement...",
                    "visible": true,
                    "tagClass": "jdocumentary-preloadmsg"
                };
                page.layers.push(layer);
            }
        });
    };
    this._preloadImages(options.scenario.pages);
    
    // Configuration du chemin global
    this._setupGlobalPath = function() {
        var path;
        if (window.location.protocol == "file:") {
            path = window.location.protocol + "//" + window.location.hostname + window.location.pathname;
            while (path.substr(path.length - 1, 1) != "/") {
                path = path.substr(0, path.length - 1);
            }
        } else {
            path = window.location.protocol + "//" + window.location.hostname + window.location.pathname;
        }
        
        if (this.opts.globalPath != null) {
            path = this.opts.globalPath;
        } else {
            this.opts.globalPath = path;
        }
    };
    this._setupGlobalPath();
    
    // Initialisation des composants
    this.player = new jPlayer(this);
    this._setupMethods = function() {
        this.page = function(name) {
            return this.sce.find(name);
        };
        
        this.currentPage = function() {
            return this.player.current;
        };
        
        this.nextPage = function() {
            return this.sce.next(this.player.current);
        };
        
        this.firstPage = function() {
            return this.sce.first();
        };
        
        this.previousPage = function() {
            return this.sce.previous(this.player.current);
        };
        
        this.seen = function(pageName) {
            return this.player.seen(pageName);
        };
        
        this.play = function(pageName) {
            location.hash = "#" + pageName;
            return this;
        };
    };
    this._setupMethods();
    this._setupDocumentProperties = function() {
        document.title = this.opts.scenario.title;
        this.attr("id", "jdocumentary-screen");
        this.attr("role", "main");
        
        // Ajout des méthodes d'affichage
        this.displayCommands = $.fn.jDocumentary.displayCommands;
        this.displayAbout = $.fn.jDocumentary.displayAbout;
        this.displayOverlay = $.fn.jDocumentary.displayOverlay;
        this.removeOverlay = $.fn.jDocumentary.removeOverlay;
        this.displayNavigator = $.fn.jDocumentary.displayNavigator;
    };
    this._setupDocumentProperties();
    this._setupEventHandlers = function() {
        var self = this;
        
        this.start = function() {
            if (this.state() != $.fn.jDocumentary.STATE.init) {
                throw "jDocumentary Exception: multiple jDocumentary.start() calls";
            }
            
            this.state($.fn.jDocumentary.STATE.starting);
            this.currentScreenSize = $(window).width() + "x" + $(window).height();
            $("#jdocumentary-screen > *:not(.jdocumentary-persistant)").remove();
            
            // Gestion du redimensionnement
            $(window).bind("resize", function() {
                self.resize();
            });
            
            // Gestion des touches clavier
            $(document).keydown(function(event) {
                switch (event.keyCode) {
                    case 40:
                    case 39:
                        if ("right" in self.currentPage().data()) {
                            self.play(self.currentPage().data().right);
                        } else if (self.opts.enableAutoNav) {
                            self.play(self.nextPage().data().name);
                        }
                        break;
                    case 38:
                    case 37:
                        if ("left" in self.currentPage().data()) {
                            self.play(self.currentPage().data().left);
                        } else if (self.opts.enableAutoNav) {
                            self.play(self.previousPage().data().name);
                        }
                        break;
                }
            });
            
            // Gestion du changement de hash
            $(window).bind("hashchange", function(event) {
                if (location.hash == "") {
                    self.player.play("root", true);
                } else {
                    self.player.play(location.hash.substr(1), true);
                }
                return false;
            });
            
            // Google Analytics
            self._setupAnalytics();
            
            this.displayCommands(this);
            this.displayNavigator(this);
            this.state($.fn.jDocumentary.STATE.ready);
            this.soundMgr.init();
            this.soundMgr.setPlaylist(this.playlist);
            $(window).trigger("hashchange");
        };
        
        this.resize = function() {
            var newSize = $(window).width() + "x" + $(window).height();
            if (newSize == this.currentScreenSize) {
                return;
            }
            this.currentScreenSize = $(window).width() + "x" + $(window).height();
            if (this.player.current != null) {
                this.player.current.resize();
            }
            return;
        };
    };
    this._setupEventHandlers();
    this._setupAnalytics = function() {
        var self = this;
        if ("analyticsTracker" in this.opts && this.opts.analyticsTracker != null) {
            window._gaq = window._gaq || [];
            window._gaq.push(["_setAccount", "" + this.opts.analyticsTracker], ["_trackPageview"]);
            this.bind("pagechanged", function(event, page) {
                window._gaq.push(["_trackEvent", self.opts.analyticsEventName, "PageChange", "" + page.name()]);
            });
            
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.async = true;
            script.src = ("https:" == document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";
            var firstScript = document.getElementsByTagName("script")[0];
            firstScript.parentNode.insertBefore(script, firstScript);
        }
    };
    this._setupSoundManager = function() {
        this.loaded = [];
        this.isResourceLoaded = function(resource) {
            for (var i in this.loaded) {
                if (this.loaded[i] === resource) {
                    return true;
                }
            }
            return false;
        };
        
        this.addLoadedResource = function(resource) {
            if (!this.isResourceLoaded(resource)) {
                this.loaded.push(resource);
            }
            return this;
        };
        
        var soundDiv = $("<div>").addClass("jdocumentary-persistant").addClass("jdocumentary-soundplayer").appendTo(this);
        this.soundMgr = new jSoundManager();
        this.getSoundManager = function() {
            return this.soundMgr;
        };
    };
    this._setupSoundManager();
    
    // Gestion du mode embedded
    if (location.hash == "#embedded") {
        this._setupEmbeddedMode = function() {
            var self = this;
            this.addClass("jdocumentary-embedded");
            $("body > *:not(.jdocumentary-persistant)").remove();
            this.displayOverlay();
            this.append($("<a>").attr("href", "javascript:;").addClass("jdocumentary-start").click(function() {
                self.removeOverlay();
                location.hash = "#root";
                self.start();
            }));
        };
        this._setupEmbeddedMode();
    } else {
        this.start();
    }
    
    return this;
};

// Suppression des méthodes prototype (maintenant inline)
// Extension des méthodes du plugin
$.fn.jDocumentary.prototype = $.fn.jDocumentary.prototype || {};

// Constantes et paramètres par défaut
$.fn.jDocumentary.INSTANCE = null;

$.fn.jDocumentary.DEFAULTS = {
    scenario: null,
    globalPath: null,
    commandsPosition: null,
    homeButtonGo: "root",
    navigation: null,
    analyticsTracker: null,
    analyticsEventName: "jDocumentary",
    enableAutoNav: true
};

$.fn.jDocumentary.LANG = {
    button: "Button ",
    close: "Close",
    musicButton: " Music control ",
    playButton: " Play/Pause ",
    muteButton: " Mute/UnMute ",
    previousButton: " Previous ",
    nextButton: " Next ",
    stopButton: " Stop ",
    volumeMinusButton: " Volume - ",
    volumePlusButton: " Volume + ",
    homeButton: " Home ",
    wait: "Please wait...",
    by: "A documentary by "
};

$.fn.jDocumentary.STATE = {
    init: "init",
    starting: "starting",
    pagechange: "pagechange",
    ready: "ready"
};

// Gestion des messages pour le mode embedded
if (window.addEventListener) {
    window.addEventListener("message", function(event) {
        switch (event.data) {
            case "start":
                var instance = $.fn.jDocumentary.INSTANCE;
                if (instance && instance.started) {
                    event.source.postMessage("ERROR start: Already started", event.origin);
                    return;
                }
                event.source.postMessage("OK start", event.origin);
                if (instance) {
                    instance.start();
                }
                break;
        }
    }, false);
}