/**
 * jDocumentary Page Module
 * Gestion des pages individuelles
 */

function jPage(pageData, screen) {
    if (!("name" in pageData)) {
        alert("[jDocumentary Error]\nMissing page name");
        throw "Missing page name";
    }
    
    if (pageData.name == "embedded") {
        alert("[jDocumentary Error]\nInvalid page name: embedded");
        throw "Invalid page name: embedded";
    }
    
    var nameRegex = new RegExp("^[\\w-]+$", "i");
    if (!nameRegex.test(pageData.name)) {
        alert("[jDocumentary Error]\nInvalid page name: " + pageData.name + "\n(only alphanum, dash and underscore are allowed)");
        throw "Invalid page name: " + pageData.name;
    }
    
    var self = this;
    this.screen = screen;
    this.contentsAllreadyLoaded = false;
    this.currentScreenSize = null;
    this.layerReadyCount = 0;
    this.div = $("<div>").addClass("jdocumentary-page").attr("pagename", pageData.name);
    
    this.name = function() {
        return pageData.name;
    };
    
    this.data = function() {
        return pageData;
    };
    
    // Système d'événements
    this.listeners = [];
    
    this.one = function(event, callback) {
        return this.bind(event, callback, true);
    };
    
    this.bind = function(event, callback, once) {
        if (jQuery.type(event) != "string") {
            return this;
        }
        if (jQuery.type(callback) != "function") {
            return this;
        }
        this.listeners.push({
            event: event,
            callback: callback,
            one: once === true
        });
        return this;
    };
    
    this.trigger = function(eventName, data) {
        for (var i = 0, len = this.listeners.length; i < len; i++) {
            var listener = this.listeners[i];
            if (!listener) {
                continue;
            }
            if (listener.event == eventName || listener.event == "*") {
                this.thread = listener.callback;
                this.thread(eventName, data);
                if (listener.one) {
                    this.listeners.splice(i, 1);
                }
            }
        }
        this.thread = null;
        return this;
    };
    
    this.unbind = function(eventName, callback) {
        if (eventName && callback) {
            for (var i = 0, len = this.listeners.length; i < len; i++) {
                var listener = this.listeners[i];
                if (!listener) {
                    continue;
                }
                if ((listener.event == eventName || eventName == "*") && listener.callback == callback) {
                    this.listeners.splice(i, 1);
                }
            }
        } else if (eventName) {
            for (var i = 0, len = this.listeners.length; i < len; i++) {
                var listener = this.listeners[i];
                if (!listener) {
                    continue;
                }
                if (listener.event == eventName || eventName == "*") {
                    this.listeners.splice(i, 1);
                }
            }
        } else {
            this.listeners = [];
        }
        return this;
    };
    
    // Gestion des couches
    this.layers = [];
    
    this.layer = function(layerName) {
        for (var i = 0, len = this.layers.length; i < len; i++) {
            if (this.layers[i].name() == layerName) {
                return this.layers[i];
            }
        }
        return null;
    };
    
    // Événements de redimensionnement et déchargement
    this.bind("resize", function() {
        for (var i = 0, len = this.layers.length; i < len; i++) {
            self.layers[i].trigger("resize");
        }
    });
    
    this.bind("unload", function() {
        for (var i = 0, len = this.layers.length; i < len; i++) {
            this.layers[i].trigger("unload");
        }
    });
    
    // Chargement de la page
    this.load = function() {
        this.trigger("load");
        
        if (this.contentsAllreadyLoaded || pageData.layers.length == 0) {
            this.trigger("contentloaded");
            if (screen.currentPage() == screen.firstPage()) {
                screen.play(screen.nextPage().name());
            }
            return;
        }
        
        var layersCount = pageData.layers.length;
        
        // Création des couches si nécessaire
        if (this.layers.length < 1) {
            for (var i = 0; i < layersCount; i++) {
                var layerData = pageData.layers[i];
                if (!layerData) {
                    continue;
                }
                var layer = $("<div>").jLayer(layerData, this, i);
                this.layers.push(layer);
            }
        }
        
        // Initialisation du compteur de couches prêtes
        this.layerReadyCount = 0;
        
        // Initialisation du contenu des couches
        for (var i = 0; i < layersCount; i++) {
            this.layers[i].trigger("load").initContent();
        }
        
        // Ajout des couches au DOM
        for (var i = 0; i < layersCount; i++) {
            this.div.append(this.layers[i]);
        }
        
        // Configuration des événements de fin de chargement
        for (var i = 0; i < layersCount; i++) {
            this.layers[i].one("layerContentReady", function() {
                self.layerReadyCount++;
                if (self.layerReadyCount > self.layers.length) {
                    throw "Bug#002| In Page " + self.name() + ": " + self.layers.length + " layers(s) to init, " + self.layerReadyCount + " are ready (too many).";
                }
                if (self.layerReadyCount == self.layers.length) {
                    self.contentsAllreadyLoaded = true;
                    self.trigger("contentloaded");
                    if (screen.currentPage() == screen.firstPage()) {
                        screen.play(screen.nextPage().name());
                    }
                }
            });
        }
        
        // Configuration du contenu des couches
        for (var i = 0; i < layersCount; i++) {
            var layer = this.layers[i];
            if ("visible" in layer.data) {
                if (layer.data.visible) {
                    layer.setContent(layer.data);
                } else {
                    layer.hide().setContent(layer.data);
                }
            } else {
                layer.css("visibility", "hidden").setContent(layer.data);
            }
        }
    };
    
    // Affichage de la page
    this.show = function() {
        this.resize();
        for (var i = 0, len = this.layers.length; i < len; i++) {
            var layer = this.layers[i];
            if ("visible" in layer.data && !layer.data.visible) {
                // Couche invisible
            } else {
                layer.layerDisplay();
            }
        }
        this.trigger("ready");
    };
    
    // Redimensionnement de la page
    this.resize = function() {
        var newSize = $(window).width() + "x" + $(window).height();
        if (newSize == this.currentScreenSize) {
            return false;
        }
        this.currentScreenSize = $(window).width() + "x" + $(window).height();
        for (var i = 0, len = this.layers.length; i < len; i++) {
            this.layers[i].trigger("resize");
        }
        return this;
    };
    
    return this;
}