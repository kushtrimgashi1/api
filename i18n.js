/* VidRidge i18n — English source, translations for 8 languages. */
(function () {
  'use strict';

  var LANGS = [
    { code: 'en', name: 'English',    dir: 'ltr' },
    { code: 'sq', name: 'Shqip',      dir: 'ltr' },
    { code: 'it', name: 'Italiano',   dir: 'ltr' },
    { code: 'de', name: 'Deutsch',    dir: 'ltr' },
    { code: 'fr', name: 'Français',   dir: 'ltr' },
    { code: 'es', name: 'Español',    dir: 'ltr' },
    { code: 'pt', name: 'Português',  dir: 'ltr' },
    { code: 'tr', name: 'Türkçe',     dir: 'ltr' },
    { code: 'ar', name: 'العربية',    dir: 'rtl' }
  ];

  var META = {
    en: { dir: 'ltr', title: 'VidRidge — Download videos & reels without watermark (TikTok, Facebook, Instagram)', desc: 'Download videos, reels and posts from TikTok, Facebook and Instagram in HD & SD. Free, no login, no watermark.' },
    sq: { dir: 'ltr', title: 'VidRidge — Shkarko video & reels pa watermark (TikTok, Facebook, Instagram)', desc: 'Shkarko video, reels dhe postime nga TikTok, Facebook dhe Instagram në HD & SD. Falas, pa login, pa watermark.' },
    it: { dir: 'ltr', title: 'VidRidge — Scarica video e reel senza watermark (TikTok, Facebook, Instagram)', desc: 'Scarica video, reel e post da TikTok, Facebook e Instagram in HD e SD. Gratis, senza login, senza watermark.' },
    de: { dir: 'ltr', title: 'VidRidge — Videos und Reels ohne Wasserzeichen herunterladen (TikTok, Facebook, Instagram)', desc: 'Lade Videos, Reels und Beiträge von TikTok, Facebook und Instagram in HD und SD herunter. Kostenlos, ohne Login, ohne Wasserzeichen.' },
    fr: { dir: 'ltr', title: 'VidRidge — Téléchargez vidéos et reels sans filigrane (TikTok, Facebook, Instagram)', desc: 'Téléchargez vidéos, reels et publications depuis TikTok, Facebook et Instagram en HD et SD. Gratuit, sans connexion, sans filigrane.' },
    es: { dir: 'ltr', title: 'VidRidge — Descarga videos y reels sin marca de agua (TikTok, Facebook, Instagram)', desc: 'Descarga videos, reels y publicaciones de TikTok, Facebook e Instagram en HD y SD. Gratis, sin registro, sin marca de agua.' },
    pt: { dir: 'ltr', title: 'VidRidge — Baixe vídeos e reels sem marca d\'água (TikTok, Facebook, Instagram)', desc: 'Baixe vídeos, reels e publicações do TikTok, Facebook e Instagram em HD e SD. Grátis, sem login, sem marca d\'água.' },
    tr: { dir: 'ltr', title: 'VidRidge — Videoları ve reels\'leri filigransız indirin (TikTok, Facebook, Instagram)', desc: 'TikTok, Facebook ve Instagram\'dan video, reels ve gönderileri HD ve SD olarak indirin. Ücretsiz, giriş yok, filigran yok.' },
    ar: { dir: 'rtl', title: 'VidRidge — حمّل الفيديوهات والريلز بدون علامة مائية (تيك توك، فيسبوك، إنستغرام)', desc: 'حمّل الفيديوهات والريلز والمنشورات من تيك توك وفيسبوك وإنستغرام بجودة HD و SD. مجاناً، بدون تسجيل، وبدون علامة مائية.' }
  };

  var KEYS = [
    'nav.platforms','nav.how','nav.why','nav.faq','nav.lang','header.tag',
    'hero.tag','hero.h1','hero.sub',
    'input.label','input.paste','input.ph','btn.find',
    'status.analyzing','result.found','result.ready',
    'btn.hd','btn.sd','btn.open','btn.mp3','btn.another',
    'how.tag','how.h2','how.s1t','how.s1d','how.s2t','how.s2d','how.s3t','how.s3d',
    'why.tag','why.h2','why.c1t','why.c1d','why.c2t','why.c2d','why.c3t','why.c3d','why.c4t','why.c4d',
    'faq.tag','faq.h2','faq.q1','faq.a1','faq.q2','faq.a2','faq.q3','faq.a3','faq.q4','faq.a4','faq.q5','faq.a5',
    'footer.about','footer.nav','footer.noteTag','footer.note','footer.made','footer.lang',
    'watch.back','watch.hd','watch.mp3','watch.another','watch.open',
    'js.analyzing','js.stage1','js.stage2','js.stage3','js.stage4','js.working','js.stepFail',
    'js.error','js.notFound','js.dl','js.dlPct','js.dlMb','js.prep','js.dling','js.doneQ','js.doneVia','js.done',
    'js.cdn','js.viaServer','js.convMp3','js.dlAudio','js.mp3Lib','js.extractAudio','js.decodeSlow','js.convPct','js.mp3Ok','js.mp3Done','js.mp3Fail','js.tryAnother','js.direct','js.server','js.noVideo','js.dlFail','js.mp3LibShort'
  ];

  var EN = [
    'Platforms','How it works','Why VidRidge','FAQ','Language','Free • No login',
    'Free • No watermark • No login','Download any video<br>in seconds','TikTok, Facebook or Instagram — HD & SD, straight to your device.',
    'Video link','Paste','https://www.tiktok.com/... or reel link...','Find video',
    'Analyzing link...','Video found','Ready to download',
    'Download HD','SD','Open video in a new tab','Download MP3 (Audio)','↺ Download another video',
    'How it works','Download in 3 steps.','Copy the link','Open the video and tap <span class="text-[var(--fg)]">Share → Copy link</span>.','Paste and search','Paste the link and press <span class="text-[var(--fg)]">Find video</span>.','Download instantly','Choose <span class="text-[var(--fg)]">HD</span> or <span class="text-[var(--fg)]">SD</span> — saved to your device.',
    'Why VidRidge','Fast, simple, free.','No watermark','Clean videos without logos.','HD & SD','Highest quality available.','Any device','Android, iPhone and desktop.','Privacy','We store nothing on our servers.',
    'Frequently asked questions','FAQ','Is VidRidge free?','Yes, completely free with no paywall. No sign-up required.','Which platforms are supported?','Currently TikTok, Facebook (Reels & Watch) and Instagram (Reels). More platforms are being added.','Why doesn\'t a link work?','Only public posts can be downloaded. Private, deleted or age-restricted posts cannot be retrieved.','Where are files saved?','Directly to your device (Gallery / Downloads). We don\'t store them.','What about copyright?','Use it only for personal archiving of content you have the right to download. Respect creators\' rights.',
    'Free video downloader for TikTok, Facebook and Instagram — HD & SD, no watermark.','Navigation','Note','Use only for public content and personal archiving. Respect copyright.','Made for personal archiving','Language',
    '← Back','Download HD','♫ Download MP3 (Audio)','↺ Download another video','Open source',
    'Analyzing...','Analyzing link...','Extracting video...','Trying servers...','Preparing video...','Working...','Step {n} failed, trying another...',
    'Error','Video not found. Make sure the post is public.','Downloading...','Downloading... {pct}% ({mb} / {total} MB)','Downloading... {mb} MB','Preparing download ({q})...','Downloading {q}...','Downloaded {q}!','Done ({q}){via}!','Done',
    'Connecting directly to CDN...','Connecting via server...','Converting to MP3...','Downloading audio...','MP3 library failed to load. Please try again.','Extracting audio and converting to MP3...','Audio decoding took too long.','Converting to MP3... {p}%','MP3 downloaded successfully!','✓ MP3 downloaded!','MP3 conversion failed: ','try another video.','direct','server','No video found. Go back and try another link.','Download failed. Try the ↗ button to open it directly.','MP3 library failed to load.'
  ];

  var LOCALES = { en: EN };
  LOCALES.sq = [
    'Platformat','Si funksionon','Pse VidRidge','FAQ','Gjuha','Falas • Pa login',
    'Falas • Pa watermark • Pa login','Shkarko çdo video<br>në sekonda','TikTok, Facebook ose Instagram — HD & SD, direkt në pajisje.',
    'Linku i videos','Ngjit','https://www.tiktok.com/... ose linku i reels...','Gjej videon',
    'Duke analizuar linkun...','Video e gjetur','Gati për shkarkim',
    'Shkarko HD','SD','Hap videon në tab të ri','Shkarko MP3 (Audio)','↺ Shkarko një video tjetër',
    'Si funksionon','Si shkarkohet në 3 hapa.','Kopjo linkun','Hap videon dhe shtyp <span class="text-[var(--fg)]">Share → Copy link</span>.','Ngjit dhe kërko','Vendos linkun dhe shtyp <span class="text-[var(--fg)]">Gjej videon</span>.','Shkarko direkt','Zgjidh <span class="text-[var(--fg)]">HD</span> ose <span class="text-[var(--fg)]">SD</span> — ruhet në pajisje.',
    'Pse VidRidge','I shpejtë, i thjeshtë, falas.','Pa watermark','Video të pastra pa logo.','HD & SD','Cilësia më e lartë e disponueshme.','Çdo pajisje','Android, iPhone dhe desktop.','Privatësi','Nuk ruajmë asgjë në server.',
    'Pyetje të shpeshta','FAQ','A është falas VidRidge?','Po, plotësisht falas dhe pa limit pagese. Nuk kërkohet regjistrim.','Cilat platforma mbështeten?','Aktualisht TikTok, Facebook (Reels & Watch) dhe Instagram (Reels). Po shtohen platforma të tjera.','Pse ndonjë link nuk funksionon?','Vetëm postimet publike shkarkohen. Postimet private, të fshira ose me kyçje moshe nuk mund të merren.','Ku ruhen skedarët?','Direkt në pajisjen tënde (Gallery / Downloads). Ne nuk i ruajmë ato.','Po të drejtat e autorit?','Përdore vetëm për arshivim personal të përmbajtjes që ke të drejtë ta shkarkosh. Respekto të drejtat e krijuesve.',
    'Shkarkues video falas për TikTok, Facebook dhe Instagram — në HD & SD, pa watermark.','Navigimi','Shënim','Përdore vetëm për përmbajtje publike dhe për arshivim personal. Respekto të drejtat e autorit.','Bërë për arshivim personal','Gjuha',
    '← Kthehu','Shkarko HD','♫ Shkarko MP3 (Audio)','↺ Shkarko një video tjetër','Hap burimin',
    'Duke analizuar...','Duke analizuar linkun...','Duke nxjerrë videon...','Duke provuar servera...','Duke përgatitur videon...','Duke punuar...','Hapi {n} dështoi, po provoj tjetër...',
    'Gabim','Videoja nuk u gjet. Sigurohu që postimi është publik.','Duke shkarkuar...','Duke shkarkuar... {pct}% ({mb} / {total} MB)','Duke shkarkuar... {mb} MB','Po përgatitet shkarkimi ({q})...','Duke shkarkuar {q}...','U shkarkua {q}!','U shkarkua ({q}){via}!','Përfundoi',
    'Duke u lidhur drejt CDN...','Duke u lidhur përmes serverit...','Duke konvertuar në MP3...','Duke shkarkuar audion...','Libraria MP3 nuk u ngarkua. Provo përsëri.','Duke nxjerrë audion dhe duke konvertuar në MP3...','Dekodimi i audios zgjati shumë.','Duke konvertuar në MP3... {p}%','MP3 u shkarkua me sukses!','✓ MP3 u shkarkua!','Konvertimi në MP3 dështoi: ','provo një video tjetër.','direkt','server','Nuk u gjet video. Kthehu dhe provo një link tjetër.','Shkarkimi dështoi. Provo butonin ↗ për ta hapur direkt.','Libraria MP3 nuk u ngarkua.'
  ];
  LOCALES.it = [
    'Piattaforme','Come funziona','Perché VidRidge','FAQ','Lingua','Gratis • Nessun login',
    'Gratis • Senza watermark • Nessun login','Scarica qualsiasi video<br>in pochi secondi','TikTok, Facebook o Instagram — HD & SD, direttamente sul tuo dispositivo.',
    'Link del video','Incolla','https://www.tiktok.com/... o link del reel...','Trova video',
    'Analisi del link...','Video trovato','Pronto per il download',
    'Scarica HD','SD','Apri video in una nuova scheda','Scarica MP3 (Audio)','↺ Scarica un altro video',
    'Come funziona','Scarica in 3 passaggi.','Copia il link','Apri il video e tocca <span class="text-[var(--fg)]">Condividi → Copia link</span>.','Incolla e cerca','Incolla il link e premi <span class="text-[var(--fg)]">Trova video</span>.','Scarica subito','Scegli <span class="text-[var(--fg)]">HD</span> o <span class="text-[var(--fg)]">SD</span> — salvato sul dispositivo.',
    'Perché VidRidge','Veloce, semplice, gratis.','Senza watermark','Video puliti senza loghi.','HD & SD','Massima qualità disponibile.','Ogni dispositivo','Android, iPhone e desktop.','Privacy','Non salviamo nulla sui nostri server.',
    'Domande frequenti','FAQ','VidRidge è gratis?','Sì, completamente gratis e senza paywall. Nessuna registrazione richiesta.','Quali piattaforme sono supportate?','Attualmente TikTok, Facebook (Reels & Watch) e Instagram (Reels). Altre piattaforme sono in arrivo.','Perché un link non funziona?','Si possono scaricare solo i post pubblici. I post privati, eliminati o con limiti di età non sono recuperabili.','Dove vengono salvati i file?','Direttamente sul tuo dispositivo (Galleria / Download). Non li conserviamo.','E il diritto d\'autore?','Usalo solo per archiviare personalmente contenuti che hai il diritto di scaricare. Rispetta i diritti dei creator.',
    'Downloader video gratuito per TikTok, Facebook e Instagram — in HD & SD, senza watermark.','Navigazione','Nota','Usalo solo per contenuti pubblici e archiviazione personale. Rispetta il diritto d\'autore.','Creato per l\'archiviazione personale','Lingua',
    '← Indietro','Scarica HD','♫ Scarica MP3 (Audio)','↺ Scarica un altro video','Apri sorgente',
    'Analisi...','Analisi del link...','Estrazione video...','Prova dei server...','Preparazione video...','In corso...','Passaggio {n} non riuscito, provo un altro...',
    'Errore','Video non trovato. Assicurati che il post sia pubblico.','Download in corso...','Download... {pct}% ({mb} / {total} MB)','Download... {mb} MB','Preparazione del download ({q})...','Download di {q}...','Scaricato {q}!','Scaricato ({q}){via}!','Completato',
    'Connessione diretta al CDN...','Connessione tramite server...','Conversione in MP3...','Download audio...','Libreria MP3 non caricata. Riprova.','Estrazione audio e conversione in MP3...','Decodifica audio troppo lunga.','Conversione in MP3... {p}%','MP3 scaricato con successo!','✓ MP3 scaricato!','Conversione MP3 non riuscita: ','prova un altro video.','diretto','server','Nessun video trovato. Torna indietro e prova un altro link.','Download non riuscito. Usa il pulsante ↗ per aprirlo direttamente.','Libreria MP3 non caricata.'
  ];
  LOCALES.de = [
    'Plattformen','So funktioniert\'s','Warum VidRidge','FAQ','Sprache','Kostenlos • Ohne Login',
    'Kostenlos • Ohne Wasserzeichen • Ohne Login','Lade jedes Video<br>in Sekunden herunter','TikTok, Facebook oder Instagram — HD & SD, direkt auf dein Gerät.',
    'Video-Link','Einfügen','https://www.tiktok.com/... oder Reel-Link...','Video finden',
    'Link wird analysiert...','Video gefunden','Bereit zum Herunterladen',
    'HD herunterladen','SD','Video in neuem Tab öffnen','MP3 herunterladen (Audio)','↺ Weiteres Video herunterladen',
    'So funktioniert\'s','In 3 Schritten herunterladen.','Link kopieren','Öffne das Video und tippe auf <span class="text-[var(--fg)]">Teilen → Link kopieren</span>.','Einfügen und suchen','Füge den Link ein und tippe auf <span class="text-[var(--fg)]">Video finden</span>.','Direkt herunterladen','Wähle <span class="text-[var(--fg)]">HD</span> oder <span class="text-[var(--fg)]">SD</span> — wird auf deinem Gerät gespeichert.',
    'Warum VidRidge','Schnell, einfach, kostenlos.','Ohne Wasserzeichen','Saubere Videos ohne Logos.','HD & SD','Höchste verfügbare Qualität.','Jedes Gerät','Android, iPhone und Desktop.','Privatsphäre','Wir speichern nichts auf unseren Servern.',
    'Häufige Fragen','FAQ','Ist VidRidge kostenlos?','Ja, völlig kostenlos ohne Paywall. Keine Registrierung nötig.','Welche Plattformen werden unterstützt?','Derzeit TikTok, Facebook (Reels & Watch) und Instagram (Reels). Weitere Plattformen folgen.','Warum funktioniert ein Link nicht?','Nur öffentliche Beiträge können heruntergeladen werden. Private, gelöschte oder altersbeschränkte Beiträge sind nicht abrufbar.','Wo werden die Dateien gespeichert?','Direkt auf deinem Gerät (Galerie / Downloads). Wir speichern sie nicht.','Was ist mit dem Urheberrecht?','Nutze es nur zur persönlichen Archivierung von Inhalten, die du herunterladen darfst. Respektiere die Rechte der Creator.',
    'Kostenloser Video-Downloader für TikTok, Facebook und Instagram — in HD & SD, ohne Wasserzeichen.','Navigation','Hinweis','Nur für öffentliche Inhalte und persönliche Archivierung nutzen. Urheberrecht respektieren.','Für persönliche Archivierung gemacht','Sprache',
    '← Zurück','HD herunterladen','♫ MP3 herunterladen (Audio)','↺ Weiteres Video herunterladen','Quelle öffnen',
    'Analyse...','Link wird analysiert...','Video wird extrahiert...','Server werden getestet...','Video wird vorbereitet...','In Arbeit...','Schritt {n} fehlgeschlagen, versuche anderen...',
    'Fehler','Video nicht gefunden. Stelle sicher, dass der Beitrag öffentlich ist.','Wird heruntergeladen...','Wird heruntergeladen... {pct}% ({mb} / {total} MB)','Wird heruntergeladen... {mb} MB','Download wird vorbereitet ({q})...','{q} wird heruntergeladen...','{q} heruntergeladen!','Heruntergeladen ({q}){via}!','Fertig',
    'Verbinde direkt mit CDN...','Verbinde über Server...','Konvertierung in MP3...','Audio wird heruntergeladen...','MP3-Bibliothek konnte nicht geladen werden. Bitte erneut versuchen.','Audio wird extrahiert und in MP3 konvertiert...','Audiodekodierung hat zu lange gedauert.','Konvertierung in MP3... {p}%','MP3 erfolgreich heruntergeladen!','✓ MP3 heruntergeladen!','MP3-Konvertierung fehlgeschlagen: ','versuche ein anderes Video.','direkt','Server','Kein Video gefunden. Gehe zurück und versuche einen anderen Link.','Download fehlgeschlagen. Nutze die Schaltfläche ↗, um es direkt zu öffnen.','MP3-Bibliothek konnte nicht geladen werden.'
  ];
  LOCALES.fr = [
    'Plateformes','Comment ça marche','Pourquoi VidRidge','FAQ','Langue','Gratuit • Sans connexion',
    'Gratuit • Sans filigrane • Sans connexion','Téléchargez n’importe quelle vidéo<br>en quelques secondes','TikTok, Facebook ou Instagram — HD & SD, directement sur votre appareil.',
    'Lien de la vidéo','Coller','https://www.tiktok.com/... ou lien du reel...','Trouver la vidéo',
    'Analyse du lien...','Vidéo trouvée','Prête à télécharger',
    'Télécharger HD','SD','Ouvrir la vidéo dans un nouvel onglet','Télécharger MP3 (Audio)','↺ Télécharger une autre vidéo',
    'Comment ça marche','Téléchargez en 3 étapes.','Copiez le lien','Ouvrez la vidéo et appuyez sur <span class="text-[var(--fg)]">Partager → Copier le lien</span>.','Collez et cherchez','Collez le lien et appuyez sur <span class="text-[var(--fg)]">Trouver la vidéo</span>.','Téléchargez aussitôt','Choisissez <span class="text-[var(--fg)]">HD</span> ou <span class="text-[var(--fg)]">SD</span> — enregistré sur votre appareil.',
    'Pourquoi VidRidge','Rapide, simple, gratuit.','Sans filigrane','Des vidéos propres, sans logo.','HD & SD','Meilleure qualité disponible.','Tous les appareils','Android, iPhone et ordinateur.','Confidentialité','Nous ne stockons rien sur nos serveurs.',
    'Questions fréquentes','FAQ','VidRidge est-il gratuit ?','Oui, entièrement gratuit et sans paywall. Aucune inscription requise.','Quelles plateformes sont prises en charge ?','Actuellement TikTok, Facebook (Reels & Watch) et Instagram (Reels). D’autres plateformes arrivent.','Pourquoi un lien ne fonctionne-t-il pas ?','Seules les publications publiques peuvent être téléchargées. Les publications privées, supprimées ou soumises à une limite d’âge ne sont pas récupérables.','Où sont enregistrés les fichiers ?','Directement sur votre appareil (Galerie / Téléchargements). Nous ne les conservons pas.','Et le droit d’auteur ?','Utilisez-le uniquement pour archiver personnellement des contenus que vous avez le droit de télécharger. Respectez les droits des créateurs.',
    'Téléchargeur vidéo gratuit pour TikTok, Facebook et Instagram — en HD & SD, sans filigrane.','Navigation','Remarque','À utiliser uniquement pour des contenus publics et un archivage personnel. Respectez le droit d’auteur.','Conçu pour l’archivage personnel','Langue',
    '← Retour','Télécharger HD','♫ Télécharger MP3 (Audio)','↺ Télécharger une autre vidéo','Ouvrir la source',
    'Analyse...','Analyse du lien...','Extraction de la vidéo...','Test des serveurs...','Préparation de la vidéo...','En cours...','Étape {n} échouée, essai d’une autre...',
    'Erreur','Vidéo introuvable. Vérifiez que la publication est publique.','Téléchargement...','Téléchargement... {pct}% ({mb} / {total} Mo)','Téléchargement... {mb} Mo','Préparation du téléchargement ({q})...','Téléchargement de {q}...','{q} téléchargé !','Téléchargé ({q}){via} !','Terminé',
    'Connexion directe au CDN...','Connexion via le serveur...','Conversion en MP3...','Téléchargement de l’audio...','La bibliothèque MP3 n’a pas pu se charger. Réessayez.','Extraction de l’audio et conversion en MP3...','Le décodage audio a pris trop de temps.','Conversion en MP3... {p}%','MP3 téléchargé avec succès !','✓ MP3 téléchargé !','Échec de la conversion MP3 : ','essayez une autre vidéo.','direct','serveur','Aucune vidéo trouvée. Revenez et essayez un autre lien.','Échec du téléchargement. Utilisez le bouton ↗ pour l’ouvrir directement.','La bibliothèque MP3 n’a pas pu se charger.'
  ];
  LOCALES.es = [
    'Plataformas','Cómo funciona','Por qué VidRidge','FAQ','Idioma','Gratis • Sin registro',
    'Gratis • Sin marca de agua • Sin registro','Descarga cualquier video<br>en segundos','TikTok, Facebook o Instagram — HD & SD, directamente en tu dispositivo.',
    'Enlace del video','Pegar','https://www.tiktok.com/... o enlace del reel...','Buscar video',
    'Analizando enlace...','Video encontrado','Listo para descargar',
    'Descargar HD','SD','Abrir video en una pestaña nueva','Descargar MP3 (Audio)','↺ Descargar otro video',
    'Cómo funciona','Descarga en 3 pasos.','Copia el enlace','Abre el video y toca <span class="text-[var(--fg)]">Compartir → Copiar enlace</span>.','Pega y busca','Pega el enlace y pulsa <span class="text-[var(--fg)]">Buscar video</span>.','Descarga al instante','Elige <span class="text-[var(--fg)]">HD</span> o <span class="text-[var(--fg)]">SD</span> — guardado en tu dispositivo.',
    'Por qué VidRidge','Rápido, simple, gratis.','Sin marca de agua','Videos limpios sin logos.','HD & SD','La mejor calidad disponible.','Cualquier dispositivo','Android, iPhone y ordenador.','Privacidad','No guardamos nada en nuestros servidores.',
    'Preguntas frecuentes','FAQ','¿VidRidge es gratis?','Sí, totalmente gratis y sin paywall. No hace falta registrarse.','¿Qué plataformas son compatibles?','Actualmente TikTok, Facebook (Reels & Watch) e Instagram (Reels). Se están añadiendo más plataformas.','¿Por qué no funciona un enlace?','Solo se pueden descargar publicaciones públicas. Las publicaciones privadas, eliminadas o con restricción de edad no se pueden obtener.','¿Dónde se guardan los archivos?','Directamente en tu dispositivo (Galería / Descargas). No los almacenamos.','¿Y los derechos de autor?','Úsalo solo para archivar personalmente contenido que tengas derecho a descargar. Respeta los derechos de los creadores.',
    'Descargador de video gratis para TikTok, Facebook e Instagram — en HD & SD, sin marca de agua.','Navegación','Nota','Úsalo solo para contenido público y archivo personal. Respeta los derechos de autor.','Hecho para archivo personal','Idioma',
    '← Volver','Descargar HD','♫ Descargar MP3 (Audio)','↺ Descargar otro video','Abrir fuente',
    'Analizando...','Analizando enlace...','Extrayendo video...','Probando servidores...','Preparando video...','Procesando...','El paso {n} falló, probando otro...',
    'Error','Video no encontrado. Asegúrate de que la publicación sea pública.','Descargando...','Descargando... {pct}% ({mb} / {total} MB)','Descargando... {mb} MB','Preparando descarga ({q})...','Descargando {q}...','¡{q} descargado!','¡Descargado ({q}){via}!','Terminado',
    'Conectando directamente al CDN...','Conectando mediante el servidor...','Convirtiendo a MP3...','Descargando audio...','No se pudo cargar la biblioteca MP3. Inténtalo de nuevo.','Extrayendo audio y convirtiendo a MP3...','La decodificación de audio tardó demasiado.','Convirtiendo a MP3... {p}%','¡MP3 descargado con éxito!','✓ ¡MP3 descargado!','Error al convertir a MP3: ','prueba otro video.','directo','servidor','No se encontró ningún video. Vuelve y prueba otro enlace.','La descarga falló. Usa el botón ↗ para abrirlo directamente.','No se pudo cargar la biblioteca MP3.'
  ];
  LOCALES.pt = [
    'Plataformas','Como funciona','Por que VidRidge','FAQ','Idioma','Grátis • Sem login',
    'Grátis • Sem marca d\'água • Sem login','Baixe qualquer vídeo<br>em segundos','TikTok, Facebook ou Instagram — HD & SD, direto no seu dispositivo.',
    'Link do vídeo','Colar','https://www.tiktok.com/... ou link do reel...','Buscar vídeo',
    'Analisando link...','Vídeo encontrado','Pronto para baixar',
    'Baixar HD','SD','Abrir vídeo em nova aba','Baixar MP3 (Áudio)','↺ Baixar outro vídeo',
    'Como funciona','Baixe em 3 passos.','Copie o link','Abra o vídeo e toque em <span class="text-[var(--fg)]">Compartilhar → Copiar link</span>.','Cole e busque','Cole o link e toque em <span class="text-[var(--fg)]">Buscar vídeo</span>.','Baixe na hora','Escolha <span class="text-[var(--fg)]">HD</span> ou <span class="text-[var(--fg)]">SD</span> — salvo no seu dispositivo.',
    'Por que VidRidge','Rápido, simples, grátis.','Sem marca d\'água','Vídeos limpos sem logos.','HD & SD','Melhor qualidade disponível.','Qualquer dispositivo','Android, iPhone e desktop.','Privacidade','Não armazenamos nada nos nossos servidores.',
    'Perguntas frequentes','FAQ','O VidRidge é grátis?','Sim, totalmente grátis e sem paywall. Não precisa de cadastro.','Quais plataformas são suportadas?','Atualmente TikTok, Facebook (Reels & Watch) e Instagram (Reels). Mais plataformas estão sendo adicionadas.','Por que um link não funciona?','Apenas publicações públicas podem ser baixadas. Publicações privadas, excluídas ou com restrição de idade não podem ser obtidas.','Onde os arquivos são salvos?','Diretamente no seu dispositivo (Galeria / Downloads). Não os armazenamos.','E os direitos autorais?','Use apenas para arquivar pessoalmente conteúdos que você tem o direito de baixar. Respeite os direitos dos criadores.',
    'Baixador de vídeo grátis para TikTok, Facebook e Instagram — em HD & SD, sem marca d\'água.','Navegação','Aviso','Use apenas para conteúdo público e arquivamento pessoal. Respeite os direitos autorais.','Feito para arquivamento pessoal','Idioma',
    '← Voltar','Baixar HD','♫ Baixar MP3 (Áudio)','↺ Baixar outro vídeo','Abrir origem',
    'Analisando...','Analisando link...','Extraindo vídeo...','Testando servidores...','Preparando vídeo...','Processando...','Etapa {n} falhou, tentando outra...',
    'Erro','Vídeo não encontrado. Verifique se a publicação é pública.','Baixando...','Baixando... {pct}% ({mb} / {total} MB)','Baixando... {mb} MB','Preparando download ({q})...','Baixando {q}...','{q} baixado!','Baixado ({q}){via}!','Concluído',
    'Conectando direto ao CDN...','Conectando via servidor...','Convertendo para MP3...','Baixando áudio...','Falha ao carregar a biblioteca MP3. Tente novamente.','Extraindo áudio e convertendo para MP3...','A decodificação de áudio demorou demais.','Convertendo para MP3... {p}%','MP3 baixado com sucesso!','✓ MP3 baixado!','Falha na conversão para MP3: ','tente outro vídeo.','direto','servidor','Nenhum vídeo encontrado. Volte e tente outro link.','O download falhou. Use o botão ↗ para abri-lo diretamente.','Falha ao carregar a biblioteca MP3.'
  ];
  LOCALES.tr = [
    'Platformlar','Nasıl çalışır','Neden VidRidge','SSS','Dil','Ücretsiz • Giriş yok',
    'Ücretsiz • Filigran yok • Giriş yok','Her videoyu<br>saniyeler içinde indirin','TikTok, Facebook veya Instagram — HD & SD, doğrudan cihazınıza.',
    'Video bağlantısı','Yapıştır','https://www.tiktok.com/... veya reel bağlantısı...','Videoyu bul',
    'Bağlantı analiz ediliyor...','Video bulundu','İndirmeye hazır',
    'HD indir','SD','Videoyu yeni sekmede aç','MP3 indir (Ses)','↺ Başka video indir',
    'Nasıl çalışır','3 adımda indirin.','Bağlantıyı kopyala','Videoyu açın ve <span class="text-[var(--fg)]">Paylaş → Bağlantıyı kopyala</span> seçeneğine dokunun.','Yapıştır ve ara','Bağlantıyı yapıştırın ve <span class="text-[var(--fg)]">Videoyu bul</span> düğmesine basın.','Hemen indir','<span class="text-[var(--fg)]">HD</span> veya <span class="text-[var(--fg)]">SD</span> seçin — cihazınıza kaydedilir.',
    'Neden VidRidge','Hızlı, basit, ücretsiz.','Filigran yok','Logosuz temiz videolar.','HD & SD','Mevcut en yüksek kalite.','Her cihaz','Android, iPhone ve masaüstü.','Gizlilik','Sunucularımızda hiçbir şey saklamayız.',
    'Sık sorulan sorular','SSS','VidRidge ücretsiz mi?','Evet, tamamen ücretsiz ve ödeme duvarı yok. Kayıt gerekmez.','Hangi platformlar destekleniyor?','Şu anda TikTok, Facebook (Reels & Watch) ve Instagram (Reels). Daha fazla platform ekleniyor.','Bir bağlantı neden çalışmıyor?','Yalnızca herkese açık gönderiler indirilebilir. Gizli, silinmiş veya yaş kısıtlı gönderiler alınamaz.','Dosyalar nerede saklanır?','Doğrudan cihazınızda (Galeri / İndirilenler). Biz saklamayız.','Telif hakları ne olacak?','Yalnızca indirme hakkınız olan içerikleri kişisel arşivleme için kullanın. İçerik üreticilerinin haklarına saygı gösterin.',
    'TikTok, Facebook ve Instagram için ücretsiz video indirici — HD & SD, filigransız.','Gezinme','Not','Yalnızca herkese açık içerik ve kişisel arşivleme için kullanın. Telif hakkına saygı gösterin.','Kişisel arşivleme için yapıldı','Dil',
    '← Geri','HD indir','♫ MP3 indir (Ses)','↺ Başka video indir','Kaynağı aç',
    'Analiz ediliyor...','Bağlantı analiz ediliyor...','Video çıkarılıyor...','Sunucular deneniyor...','Video hazırlanıyor...','İşleniyor...','Adım {n} başarısız, başka deniyorum...',
    'Hata','Video bulunamadı. Gönderinin herkese açık olduğundan emin olun.','İndiriliyor...','İndiriliyor... {pct}% ({mb} / {total} MB)','İndiriliyor... {mb} MB','İndirme hazırlanıyor ({q})...','{q} indiriliyor...','{q} indirildi!','İndirildi ({q}){via}!','Tamamlandı',
    'Doğrudan CDN\'ye bağlanılıyor...','Sunucu üzerinden bağlanılıyor...','MP3\'e dönüştürülüyor...','Ses indiriliyor...','MP3 kütüphanesi yüklenemedi. Lütfen tekrar deneyin.','Ses çıkarılıyor ve MP3\'e dönüştürülüyor...','Ses çözme işlemi çok uzun sürdü.','MP3\'e dönüştürülüyor... {p}%','MP3 başarıyla indirildi!','✓ MP3 indirildi!','MP3\'e dönüştürme başarısız: ','başka bir video deneyin.','doğrudan','sunucu','Video bulunamadı. Geri dönüp başka bir bağlantı deneyin.','İndirme başarısız. Doğrudan açmak için ↗ düğmesini kullanın.','MP3 kütüphanesi yüklenemedi.'
  ];
  LOCALES.ar = [
    'المنصات','كيف يعمل','لماذا VidRidge','الأسئلة الشائعة','اللغة','مجاني • بدون تسجيل',
    'مجاني • بدون علامة مائية • بدون تسجيل','حمّل أي فيديو<br>في ثوانٍ','تيك توك أو فيسبوك أو إنستغرام — HD & SD، مباشرة إلى جهازك.',
    'رابط الفيديو','لصق','https://www.tiktok.com/... أو رابط الريل...','ابحث عن الفيديو',
    'جارٍ تحليل الرابط...','تم العثور على الفيديو','جاهز للتنزيل',
    'تنزيل HD','SD','فتح الفيديو في تبويب جديد','تنزيل MP3 (صوت)','↺ تنزيل فيديو آخر',
    'كيف يعمل','نزّل في 3 خطوات.','انسخ الرابط','افتح الفيديو واضغط <span class="text-[var(--fg)]">مشاركة → نسخ الرابط</span>.','الصق وابحث','الصق الرابط واضغط <span class="text-[var(--fg)]">ابحث عن الفيديو</span>.','نزّل فوراً','اختر <span class="text-[var(--fg)]">HD</span> أو <span class="text-[var(--fg)]">SD</span> — يُحفظ على جهازك.',
    'لماذا VidRidge','سريع، بسيط، مجاني.','بدون علامة مائية','فيديوهات نظيفة بدون شعارات.','HD & SD','أفضل جودة متاحة.','أي جهاز','أندرويد، آيفون وسطح المكتب.','الخصوصية','لا نخزّن أي شيء على خوادمنا.',
    'الأسئلة الشائعة','الأسئلة الشائعة','هل VidRidge مجاني؟','نعم، مجاني تماماً وبدون جدار دفع. لا حاجة للتسجيل.','ما المنصات المدعومة؟','حالياً تيك توك وفيسبوك (ريلز وواتش) وإنستغرام (ريلز). تتم إضافة منصات أخرى.','لماذا لا يعمل بعض الروابط؟','يمكن تنزيل المنشورات العامة فقط. المنشورات الخاصة أو المحذوفة أو المقيّدة بالعمر لا يمكن جلبها.','أين تُحفظ الملفات؟','مباشرة على جهازك (المعرض / التنزيلات). نحن لا نخزّنها.','ماذا عن حقوق النشر؟','استخدمه فقط لأرشفة المحتوى الذي يحق لك تنزيله شخصياً. احترم حقوق المنشئين.',
    'أداة تنزيل فيديوهات مجانية لتيك توك وفيسبوك وإنستغرام — بجودة HD & SD وبدون علامة مائية.','التنقل','ملاحظة','استخدمه فقط للمحتوى العام والأرشفة الشخصية. احترم حقوق النشر.','صُنع للأرشفة الشخصية','اللغة',
    '← رجوع','تنزيل HD','♫ تنزيل MP3 (صوت)','↺ تنزيل فيديو آخر','فتح المصدر',
    'جارٍ التحليل...','جارٍ تحليل الرابط...','جارٍ استخراج الفيديو...','جارٍ تجربة الخوادم...','جارٍ تجهيز الفيديو...','جارٍ العمل...','فشلت الخطوة {n}، أجرّب خياراً آخر...',
    'خطأ','لم يتم العثور على الفيديو. تأكد من أن المنشور عام.','جارٍ التنزيل...','جارٍ التنزيل... {pct}% ({mb} / {total} م.ب)','جارٍ التنزيل... {mb} م.ب','جارٍ تجهيز التنزيل ({q})...','جارٍ تنزيل {q}...','تم تنزيل {q}!','تم التنزيل ({q}){via}!','اكتمل',
    'الاتصال بالـ CDN مباشرة...','الاتصال عبر الخادم...','جارٍ التحويل إلى MP3...','جارٍ تنزيل الصوت...','فشل تحميل مكتبة MP3. حاول مرة أخرى.','جارٍ استخراج الصوت والتحويل إلى MP3...','استغرق فك ترميز الصوت وقتاً طويلاً.','جارٍ التحويل إلى MP3... {p}%','تم تنزيل MP3 بنجاح!','✓ تم تنزيل MP3!','فشل التحويل إلى MP3: ','جرّب فيديو آخر.','مباشر','الخادم','لم يتم العثور على فيديو. ارجع وجرّب رابطاً آخر.','فشل التنزيل. استخدم زر ↗ لفتحه مباشرة.','فشل تحميل مكتبة MP3.'
  ];
  /* @@LANGUAGES@@ */

  var dict = {};
  Object.keys(LOCALES).forEach(function (code) {
    var arr = LOCALES[code] || [];
    var o = {};
    for (var i = 0; i < KEYS.length; i++) {
      o[KEYS[i]] = (arr[i] != null && arr[i] !== '') ? arr[i] : EN[i];
    }
    dict[code] = o;
  });

  function readCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }

  function norm(code) {
    code = (code || '').toLowerCase();
    if (code.indexOf('-') > 0) code = code.split('-')[0];
    return dict[code] ? code : '';
  }

  function detect() {
    var m = location.pathname.match(/^\/([a-z]{2})(?:\/|$)/);
    if (m && norm(m[1])) return norm(m[1]);
    var q = new URLSearchParams(location.search).get('lang');
    if (norm(q)) return norm(q);
    var c = norm(readCookie('lang'));
    if (c) return c;
    var h = norm(document.documentElement.getAttribute('lang'));
    if (h) return h;
    var n = norm(navigator.language || '');
    if (n) return n;
    return 'en';
  }

  var current = detect();

  function t(key, vars) {
    var s = (dict[current] && dict[current][key]) || dict.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split('{' + k + '}').join(vars[k]);
      });
    }
    return s;
  }

  function setAttrs(sel, attr, key) {
    var nodes = document.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) nodes[i].setAttribute(attr, t(nodes[i].getAttribute(key)));
  }

  function buildLangUi() {
    var sel = document.getElementById('langSelect');
    if (sel && !sel.options.length) {
      LANGS.forEach(function (l) {
        var o = document.createElement('option');
        o.value = l.code;
        o.textContent = l.name;
        sel.appendChild(o);
      });
    }
    if (sel) sel.value = current;
    var sel2 = document.getElementById('langSelect2');
    if (sel2 && !sel2.options.length) {
      LANGS.forEach(function (l) {
        var o = document.createElement('option');
        o.value = l.code;
        o.textContent = l.name;
        sel2.appendChild(o);
      });
    }
    if (sel2) sel2.value = current;

    var box = document.getElementById('langLinks');
    if (box && !box.children.length) {
      LANGS.forEach(function (l) {
        var a = document.createElement('a');
        a.href = '/' + l.code + '/';
        a.hreflang = l.code;
        a.lang = l.code;
        a.textContent = l.name;
        a.className = 'hover:underline' + (l.code === current ? ' font-bold' : ' opacity-80');
        box.appendChild(a);
      });
    }
  }

  function apply() {
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    }
    var html = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < html.length; j++) {
      html[j].innerHTML = t(html[j].getAttribute('data-i18n-html'));
    }
    setAttrs('[data-i18n-ph]', 'placeholder', 'data-i18n-ph');
    setAttrs('[data-i18n-aria]', 'aria-label', 'data-i18n-aria');
    setAttrs('[data-i18n-title]', 'title', 'data-i18n-title');

    document.documentElement.lang = current;
    document.documentElement.dir = (META[current] && META[current].dir) || 'ltr';

    if (document.body && document.body.getAttribute('data-page') !== 'watch' && META[current]) {
      document.title = META[current].title;
      var d = document.querySelector('meta[name="description"]');
      if (d) d.setAttribute('content', META[current].desc);
    }
    buildLangUi();
  }

  function switchTo(code) {
    if (!dict[code]) return;
    document.cookie = 'lang=' + code + '; path=/; max-age=31536000; SameSite=Lax';
    var isWatch = /\/watch\/?$/.test(location.pathname) || /watch\.html$/.test(location.pathname);
    location.href = '/' + code + (isWatch ? '/watch' : '/') + location.search + location.hash;
  }

  function bind() {
    ['langSelect', 'langSelect2'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', function () { switchTo(el.value); });
    });
  }

  function init() {
    apply();
    bind();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.VRI18N = {
    lang: current,
    t: t,
    apply: apply,
    setLang: switchTo,
    LANGS: LANGS,
    META: META,
    KEYS: KEYS,
    LOCALES: LOCALES
  };
})();
