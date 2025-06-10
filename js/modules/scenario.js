/**
 * jDocumentary Scenario Module
 * Gestion du scénario et des pages
 */

function jScenario(scenarioPages, screen) {
    this.pages = [];
    
    // Création des pages à partir du scénario
    for (var i = 0; i < scenarioPages.length; i++) {
        var pageData = scenarioPages[i];
        if (!pageData) {
            continue;
        }
        this.pages.push(new jPage(pageData, screen));
    }
    
    this.first = function() {
        if (this.pages.length > 0) {
            return this.pages[0];
        }
        return null;
    };
    
    this.find = function(pageName) {
        for (var i = 0; i < this.pages.length; i++) {
            if (this.pages[i].name() == pageName) {
                return this.pages[i];
            }
        }
        return null;
    };
    
    this.next = function(currentJPage) {
        for (var i = 0; i < this.pages.length; i++) {
            if (this.pages[i].name() == currentJPage.name()) {
                if ((i + 1) < this.pages.length) {
                    return this.pages[i + 1];
                } else {
                    return this.pages[0];
                }
            }
        }
        return null;
    };
    
    this.previous = function(currentJPage) {
        for (var i = 0; i < this.pages.length; i++) {
            if (this.pages[i].name() == currentJPage.name()) {
                if ((i - 1) > 0) {
                    return this.pages[i - 1];
                } else {
                    return this.pages[this.pages.length - 1];
                }
            }
        }
        return null;
    };
    
    return this;
}