# Structure du projet jDocumentary refactorisé

## Organisation des fichiers

```
trip/
├── index.html                          # Page principale mise à jour
├── MyScenario.json                     # Données du voyage
├── css/
│   └── styles.css                      # Styles CSS
├── js/
│   ├── jquery.min.js                   # jQuery
│   ├── jquery.jplayer.min.js           # jPlayer
│   ├── jplayer.playlist.min.js         # Playlist jPlayer
│   └── modules/                        # Modules refactorisés
│       ├── core.js                     # Module principal et plugin jDocumentary
│       ├── scenario.js                 # Gestion du scénario et navigation
│       ├── player.js                   # Lecteur de pages
│       ├── page.js                     # Gestion des pages individuelles
│       ├── layer.js                    # Gestion des couches (layers)
│       ├── ui-components.js             # Composants d'interface (boutons, navigation)
│       ├── fullscreen.js               # Plugin plein écran pour images
│       ├── sound-manager.js            # Gestionnaire audio
│       └── youtube-integration.js      # Intégration YouTube
├── images/                             # Images du voyage
└── zik/                               # Fichiers audio
```

## Description des modules

### 1. `core.js` - Module principal
- Plugin jQuery principal `$.fn.jDocumentary`
- Constantes et configuration par défaut
- Initialisation générale
- Gestion des événements globaux
- Préchargement des images
- Configuration des chemins

### 2. `scenario.js` - Gestion du scénario
- Classe `jScenario` pour la navigation entre pages
- Méthodes `next()`, `previous()`, `first()`, `find()`
- Gestion de l'ordre des pages

### 3. `player.js` - Lecteur de pages
- Classe `jPlayer` pour la lecture des pages
- Gestion de l'historique des pages vues
- Transition entre les pages
- Événements de chargement/déchargement

### 4. `page.js` - Gestion des pages
- Classe `jPage` pour les pages individuelles
- Système d'événements personnalisé
- Gestion des couches (layers)
- Redimensionnement responsive

### 5. `layer.js` - Gestion des couches
- Plugin `$.fn.jLayer` pour les couches
- Support des différents types de contenu :
  - HTML
  - Images de fond
  - Vidéos YouTube
  - Cartes Google Maps
  - Préchargement d'images
- Alignement et positionnement
- Effets d'apparition

### 6. `ui-components.js` - Composants d'interface
- Barre de commandes (`displayCommands`)
- Boutons de navigation (`displayPagesButtons`)
- Boîte de dialogue "À propos" (`displayAbout`)
- Overlay et navigateur
- Boutons gauche/droite

### 7. `fullscreen.js` - Plugin plein écran
- Plugin `$.fn.jFullscreen` pour les images
- Gestion du redimensionnement automatique
- Alignement et ajustement des images
- Protection contre le clic droit

### 8. `sound-manager.js` - Gestionnaire audio
- Classe `jSoundManager` pour l'audio
- Contrôle de la playlist
- Gestion du volume et du mute
- Interface avec jPlayer

### 9. `youtube-integration.js` - Intégration YouTube
- Callbacks pour l'API YouTube
- Gestion des événements vidéo
- Configuration des lecteurs YouTube

## Avantages de cette refactorisation

### Maintenabilité
- **Code modulaire** : Chaque fonctionnalité dans son propre fichier
- **Séparation des responsabilités** : Chaque module a un rôle spécifique
- **Lisibilité améliorée** : Code plus facile à comprendre et modifier

### Performance
- **Chargement sélectif** : Possibilité de charger seulement les modules nécessaires
- **Cache navigateur** : Modules mis en cache individuellement
- **Debugging facilité** : Erreurs localisées plus facilement

### Évolutivité
- **Ajout de fonctionnalités** : Nouveau module sans impacter l'existant
- **Réutilisabilité** : Modules réutilisables dans d'autres projets
- **Tests unitaires** : Possibilité de tester chaque module séparément

### Flexibilité
- **Configuration modulaire** : Activation/désactivation de fonctionnalités
- **Personnalisation** : Modification d'un module sans affecter les autres
- **Version allégée** : Possibilité de créer une version minimale

## Utilisation

1. Remplacez le fichier `index.html` par la version refactorisée
2. Créez le dossier `js/modules/`
3. Placez chaque module dans le dossier
4. L'application fonctionne de manière identique

## Compatibilité

- ✅ Fonctionnalités identiques à l'original
- ✅ Interface utilisateur inchangée
- ✅ Données de voyage préservées
- ✅ Performance maintenue ou améliorée