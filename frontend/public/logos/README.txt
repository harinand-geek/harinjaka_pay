Logos des wallets (fichiers PNG)
================================

Déposez ici un fichier PNG par wallet, nommé exactement d'après son "slug".
Le wallet utilisera automatiquement ce logo (l'icône par défaut sert de repli
si le fichier est absent). Un logo téléversé depuis l'admin a toujours priorité.

Fichiers attendus pour les 4 méthodes par défaut :

  airtel-money.png        -> Airtel Money
  mvola.png               -> MVola
  orange-money.png        -> Orange Money
  bred-madagasikara.png   -> BRED Madagasikara

Conseils :
- Format PNG (de préférence sur fond transparent), carré (ex : 256x256).
- La tuile d'affichage est blanche, donc les logos colorés ressortent bien.

Le mapping slug -> fichier est défini dans :
  frontend/src/lib/paymentVisuals.tsx  (constante LOCAL_LOGOS)
