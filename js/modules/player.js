/**
 * jDocumentary Player Module
 * Gestion de la navigation et de la lecture des pages
 */

function jPlayer(screen) {
    var self = this;
    this.previous = null;
    this.current = null;
    this.pages = [];
    this.currentIndex = 0;
    this.seenPages = [];
    
    this.seen = function(pageName) {
        for (var i = 0; i < this.seenPages.length; i++) {
            if (this.seenPages[i] == pageName) {
                return true;
            }
        }
        return false;
    };
    
    this.previous = function() {
        return this.previous;
    };
    
    // Ajout des méthodes d'affichage
    this.displayPagesButtons = $.fn.jDocumentary.displayPagesButtons;
    this.displayRightLeftButtons = $.fn.jDocumentary.displayRightLeftButtons;
    
    this.play = function(pageName) {
        var page = screen.page(pageName);
        if (page == null) {
            alert("[jDocumentary Error]\nPage not found: " + pageName);
            return;
        }
        
        if (this.current != null && pageName == this.current.name()) {
            return;
        }
        
        screen.state($.fn.jDocumentary.STATE.pagechange);
        screen.trigger("pagechange", page);
        $("#jdocumentary-command-wait").show();
        
        this.previous = this.current;
        this.current = page;
        
        // Nettoyage de la page précédente
        if (this.previous != null) {
            this.previous.div.detach();
            this.previous.trigger("unload");
            screen.trigger("pageunload", this.previous);
            if ("onUnload" in this.previous.data()) {
                this.previous.data().onUnload(screen, this.previous, page);
            }
        }
        
        // Configuration des événements de la nouvelle page
        page.one("contentloaderror", function() {
            alert("Erreur lors du chargement de la page");
        });
        
        page.one("contentloaded", function() {
            if (self.current.name() != this.name()) {
                return;
            }
            this.show();
        });
        
        page.one("ready", function() {
            if (self.current.name() != this.name()) {
                return;
            }
            self.seenPages.push(this.name());
            screen.state($.fn.jDocumentary.STATE.ready);
            $("#jdocumentary-command-wait").hide();
            screen.trigger("pagechanged", page);
            page.trigger("start");
            if ("onStart" in this.data()) {
                page.data().onStart(screen, this);
            }
        });
        
        // Chargement de la nouvelle page
        screen.prepend(page.div);
        if ("onLoad" in page.data()) {
            page.data().onLoad(screen, this.previous, page);
        }
        page.load();
        
        // Mise à jour du titre
        if ("title" in page.data()) {
            document.title = page.data().title;
        }
        
        // Affichage des boutons et navigation
        this.displayPagesButtons(page, screen, page.div);
        this.displayRightLeftButtons(page, screen, page.div, screen.opts.enableAutoNav);
        
        return;
    };
    
    return this;
}