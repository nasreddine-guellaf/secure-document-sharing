# Rapport LaTeX complet - Système de partage de documents sécurisé basé sur la blockchain

Ce fichier contient une proposition complète de rapport académique en français. Le contenu principal est fourni sous forme de code LaTeX dans le bloc ci-dessous. Il peut être copié dans un fichier `rapport.tex`, compilé localement avec `pdflatex`, ou importé dans Overleaf.

## Structure du rapport

| Partie | Contenu principal |
| --- | --- |
| Pages préliminaires | Page de garde, résumé, abstract, listes, table des matières |
| Introduction générale | Contexte, problématique, objectifs, solution proposée |
| Chapitre 1 | État de l’art : documents numériques, blockchain, hash, smart contracts, IA |
| Chapitre 2 | Analyse des besoins, conception, architecture, modèles et diagrammes |
| Chapitre 3 | Réalisation, implémentation, tests, résultats, difficultés et limites |
| Conclusion générale | Bilan, apports, limites et perspectives |
| Bibliographie | Références techniques et académiques |
| Annexes | Extraits de code, réponses API et captures à insérer |

```latex
\documentclass[12pt,a4paper]{report}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[french]{babel}
\usepackage{geometry}
\usepackage{graphicx}
\usepackage{float}
\usepackage{longtable}
\usepackage{array}
\usepackage{booktabs}
\usepackage{xcolor}
\usepackage{hyperref}
\usepackage{listings}
\geometry{margin=2.5cm}

\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    urlcolor=blue,
    citecolor=blue
}

\lstset{
    basicstyle=\ttfamily\small,
    breaklines=true,
    frame=single,
    backgroundcolor=\color{gray!8},
    columns=fullflexible,
    keepspaces=true
}

\begin{document}

% =========================
% Page de garde
% =========================
\begin{titlepage}
    \centering
    \vspace*{1cm}

    {\Large \textbf{Rapport de projet de sécurité blockchain}\par}
    \vspace{1.5cm}

    {\Huge \textbf{Système de partage de documents sécurisé basé sur la blockchain}\par}
    \vspace{0.5cm}

    {\Large Sujet 7 : Partage de documents sécurisé\par}
    \vspace{2cm}

    \begin{flushleft}
        \textbf{Réalisé par :} \textit{à compléter}\\
        \textbf{Encadré par :} \textit{à compléter}\\
        \textbf{Formation :} \textit{à compléter}\\
        \textbf{Établissement :} \textit{à compléter}\\
        \textbf{Année universitaire :} 2025--2026
    \end{flushleft}

    \vfill
    {\large \today\par}
\end{titlepage}

\pagenumbering{roman}

% =========================
% Résumé
% =========================
\chapter*{Résumé}
\addcontentsline{toc}{chapter}{Résumé}

Ce projet porte sur la réalisation d’un système de partage de documents sécurisé basé sur la blockchain. L’objectif principal est de permettre à un utilisateur de déposer un document, de calculer son empreinte cryptographique SHA-256, puis d’enregistrer cette empreinte dans un smart contract afin de garantir l’intégrité du document. Le document complet n’est pas stocké dans la blockchain ; il reste conservé hors chaîne dans le stockage local de l’application, tandis que seule son empreinte est enregistrée dans le registre blockchain.

Le système développé comprend une application web avec un frontend React.js, un backend Node.js/Express.js, une base de données SQLite manipulée avec Prisma ORM, un smart contract Solidity déployé localement avec Hardhat et une intégration IA via un microservice FastAPI. Le service IA utilise un modèle de classification de type zero-shot basé sur Hugging Face Transformers afin de classer automatiquement les documents dans les catégories suivantes : Contrat, Facture, Rapport, CV, Diplôme, Lettre administrative et Autre.

Le résultat obtenu est un prototype fonctionnel permettant l’upload, le partage, la classification, la vérification d’intégrité, la consultation de l’historique des vérifications et l’administration de base du système.

\textbf{Mots-clés :} blockchain, smart contract, SHA-256, sécurité documentaire, React.js, Node.js, Prisma, FastAPI, intelligence artificielle.

% =========================
% Abstract
% =========================
\chapter*{Abstract}
\addcontentsline{toc}{chapter}{Abstract}

This project presents the development of a secure document sharing system based on blockchain technology. The main goal is to allow users to upload documents, compute their SHA-256 cryptographic hash, and register only this hash on a smart contract in order to verify document integrity. The complete document is not stored on-chain; it remains stored off-chain in the application storage, while the blockchain keeps a tamper-resistant proof of integrity.

The implemented system includes a React.js frontend, a Node.js/Express.js backend, a SQLite database managed with Prisma ORM, a Solidity smart contract deployed locally with Hardhat, and an AI classification microservice built with Python FastAPI and Hugging Face Transformers. The system supports document upload, blockchain hash registration, integrity verification, modified document detection, document sharing, verification history and a basic administrator dashboard.

\textbf{Keywords:} blockchain, smart contract, SHA-256, document security, React.js, Node.js, Prisma, FastAPI, artificial intelligence.

\listoffigures
\addcontentsline{toc}{chapter}{Liste des figures}

\listoftables
\addcontentsline{toc}{chapter}{Liste des tableaux}

\chapter*{Liste des abréviations}
\addcontentsline{toc}{chapter}{Liste des abréviations}

\begin{longtable}{p{0.25\textwidth}p{0.65\textwidth}}
\toprule
\textbf{Abréviation} & \textbf{Signification} \\
\midrule
API & Application Programming Interface \\
CRUD & Create, Read, Update, Delete \\
DOCX & Format de document Microsoft Word basé sur XML \\
HTTP & HyperText Transfer Protocol \\
IA & Intelligence Artificielle \\
JWT & JSON Web Token \\
NLI & Natural Language Inference \\
ORM & Object Relational Mapping \\
PDF & Portable Document Format \\
SHA & Secure Hash Algorithm \\
UI & User Interface \\
URL & Uniform Resource Locator \\
\bottomrule
\end{longtable}

\tableofcontents
\clearpage
\pagenumbering{arabic}

% =========================
% Introduction générale
% =========================
\chapter*{Introduction générale}
\addcontentsline{toc}{chapter}{Introduction générale}

\section*{Contexte général}
\addcontentsline{toc}{section}{Contexte général}

La numérisation des services a rendu l’échange de documents plus rapide, plus fréquent et plus accessible. Dans les établissements, les entreprises ou les administrations, plusieurs types de documents circulent sous forme numérique : contrats, factures, rapports, diplômes, curriculum vitae ou lettres administratives. Cependant, cette facilité de circulation introduit aussi des risques importants, notamment la modification non autorisée des fichiers, la falsification de documents, la perte de traçabilité et la difficulté de prouver qu’un document reçu correspond exactement au document original.

Dans ce contexte, la sécurité documentaire ne se limite pas au stockage ou à l’accès aux fichiers. Elle doit aussi permettre de vérifier l’intégrité d’un document après son partage. La blockchain apporte une réponse intéressante à ce besoin, car elle permet d’enregistrer une preuve difficilement falsifiable sous forme de transaction. Dans le cadre de ce projet, cette preuve correspond au hash SHA-256 du document.

\section*{Problématique générale}
\addcontentsline{toc}{section}{Problématique générale}

La problématique générale peut être formulée comme suit :

\begin{quote}
Comment concevoir un système permettant de partager des documents numériques, de vérifier leur intégrité et de détecter toute modification, tout en évitant de stocker les documents eux-mêmes dans la blockchain ?
\end{quote}

Cette problématique implique plusieurs contraintes : le système doit être utilisable via une interface web, protéger l’accès par authentification, conserver les métadonnées dans une base de données, inscrire une preuve d’intégrité dans la blockchain, permettre la vérification ultérieure et intégrer une classification automatique des documents.

\section*{Objectifs du projet}
\addcontentsline{toc}{section}{Objectifs du projet}

Les objectifs principaux de ce projet sont les suivants :

\begin{itemize}
    \item permettre à un utilisateur de créer un compte et de s’authentifier ;
    \item permettre le dépôt de documents PDF, DOCX ou TXT ;
    \item calculer l’empreinte SHA-256 de chaque document ;
    \item enregistrer uniquement le hash du document dans un smart contract ;
    \item conserver le document et ses métadonnées hors blockchain ;
    \item vérifier l’intégrité d’un document à partir de son code et de son fichier ;
    \item détecter les documents modifiés ou inconnus ;
    \item partager un document avec un autre utilisateur ;
    \item consulter l’historique des vérifications ;
    \item classifier automatiquement les documents à l’aide d’un service IA ;
    \item fournir un tableau de bord administrateur.
\end{itemize}

\section*{Solution proposée}
\addcontentsline{toc}{section}{Solution proposée}

La solution proposée est une application web modulaire appelée \textbf{Système de partage de documents sécurisé basé sur la blockchain}. Elle repose sur quatre composants principaux :

\begin{itemize}
    \item un \textbf{frontend React.js} pour l’interface utilisateur ;
    \item un \textbf{backend Node.js/Express.js} qui coordonne l’upload, l’authentification, la base de données, la blockchain et l’IA ;
    \item un \textbf{smart contract Solidity}, nommé \texttt{DocumentRegistry}, déployé avec Hardhat ;
    \item un \textbf{service IA FastAPI} utilisant Hugging Face Transformers pour la classification documentaire.
\end{itemize}

Le backend joue le rôle de coordinateur central. Lorsqu’un document est envoyé, il est stocké localement, son hash est calculé, le service IA est appelé pour déterminer sa catégorie, puis le hash est enregistré dans la blockchain. La base de données conserve les métadonnées nécessaires au fonctionnement de l’application.

\section*{Organisation du rapport}
\addcontentsline{toc}{section}{Organisation du rapport}

Ce rapport est organisé en trois chapitres. Le premier chapitre présente l’état de l’art et les notions principales liées à la sécurité documentaire, à la blockchain, aux smart contracts et à la classification par IA. Le deuxième chapitre décrit l’analyse des besoins et la conception du système. Le troisième chapitre détaille la réalisation technique, les outils utilisés, les tests effectués, les résultats obtenus ainsi que les limites de la solution.

% =========================
% Chapitre 1
% =========================
\chapter{État de l’art et contexte du projet}

\section{Introduction}

Ce chapitre présente les concepts nécessaires à la compréhension du projet. Il aborde la sécurité des documents numériques, les limites des systèmes classiques de partage, les principes de la blockchain, la notion de hash cryptographique, les smart contracts et l’utilisation de l’intelligence artificielle pour la classification documentaire.

\section{Généralités sur la sécurité des documents numériques}

La sécurité des documents numériques concerne plusieurs aspects : la confidentialité, l’intégrité, l’authenticité, la disponibilité et la traçabilité. Dans le cadre de ce projet, l’intégrité occupe une place centrale. Il s’agit de garantir qu’un document n’a pas été modifié depuis son enregistrement initial.

Un document numérique peut être altéré volontairement ou accidentellement. Même une modification très légère, comme un caractère ajouté ou une image remplacée, change le contenu binaire du fichier. Grâce à une fonction de hachage cryptographique, il est possible de produire une empreinte unique du document. Cette empreinte permet ensuite de comparer un fichier reçu avec la version originale.

\section{Limites des systèmes classiques de partage documentaire}

Les systèmes classiques de partage documentaire reposent souvent sur un serveur centralisé. Ce modèle est simple à mettre en place, mais il présente plusieurs limites :

\begin{itemize}
    \item l’administrateur du serveur peut modifier ou supprimer des données ;
    \item la preuve d’intégrité dépend de la confiance accordée au serveur ;
    \item l’historique peut être altéré si le système n’est pas suffisamment protégé ;
    \item la vérification d’un document peut être difficile en dehors du système initial ;
    \item les fichiers sensibles peuvent être exposés en cas de fuite de données.
\end{itemize}

La blockchain ne remplace pas totalement une base de données classique, mais elle peut renforcer la preuve d’intégrité. Dans notre cas, elle est utilisée comme registre externe pour stocker uniquement le hash du document.

\section{Principe de la blockchain}

Une blockchain est un registre distribué constitué de blocs liés entre eux par des mécanismes cryptographiques. Chaque bloc contient un ensemble de transactions. Une fois validées, ces transactions deviennent difficiles à modifier sans remettre en cause l’ensemble de la chaîne.

Dans un réseau public, la sécurité repose sur la décentralisation et le consensus. Dans un environnement de développement, comme Hardhat, la blockchain est simulée localement afin de tester le comportement des smart contracts. Le principe reste le même du point de vue applicatif : le backend envoie une transaction au smart contract et attend sa confirmation.

\section{Blockchain et sécurité des données}

La blockchain est utile pour stocker des preuves, des événements ou des empreintes cryptographiques. Cependant, elle n’est pas adaptée au stockage direct de fichiers complets. Les raisons principales sont les suivantes :

\begin{itemize}
    \item le stockage sur blockchain coûte cher en ressources ;
    \item les données inscrites sont difficiles à supprimer ;
    \item les documents peuvent contenir des informations confidentielles ;
    \item la taille des fichiers dépasse souvent ce qui est raisonnable pour une transaction.
\end{itemize}

Pour ces raisons, le système développé adopte une architecture hybride : le document est stocké hors chaîne, tandis que son hash est inscrit dans la blockchain.

\section{Notion de hash cryptographique}

Un hash cryptographique est une valeur de taille fixe calculée à partir d’une donnée d’entrée. Dans ce projet, l’algorithme utilisé est SHA-256. Il produit une empreinte de 256 bits, généralement représentée par une chaîne hexadécimale de 64 caractères.

Les propriétés importantes d’un hash cryptographique sont :

\begin{itemize}
    \item il est déterministe : le même fichier produit toujours le même hash ;
    \item il est sensible aux modifications : une petite modification produit un hash différent ;
    \item il est difficile de retrouver le fichier original à partir du hash ;
    \item il est difficile de trouver deux fichiers différents ayant le même hash.
\end{itemize}

Dans le système, le hash calculé lors de l’upload est comparé au hash recalculé lors de la vérification. Si les deux valeurs correspondent et que la blockchain confirme l’existence du hash, le document est considéré comme authentique.

\section{Smart contracts}

Un smart contract est un programme déployé sur une blockchain. Il contient des fonctions exécutées par le réseau blockchain. Dans ce projet, le smart contract \texttt{DocumentRegistry} fournit les fonctions principales suivantes :

\begin{itemize}
    \item \texttt{registerDocument} : enregistrer un identifiant de document et son hash ;
    \item \texttt{getDocument} : récupérer les informations d’un document ;
    \item \texttt{getDocumentHash} : récupérer uniquement le hash enregistré ;
    \item \texttt{verifyDocument} : vérifier si un hash correspond au hash stocké ;
    \item \texttt{documentExists} : vérifier l’existence d’un document ;
    \item \texttt{revokeDocument} : révoquer un document.
\end{itemize}

\section{Intelligence artificielle pour la classification documentaire}

La classification documentaire consiste à associer automatiquement un document à une catégorie. Dans ce projet, le service IA est externe au backend et expose une API HTTP. Il reçoit un fichier, extrait son texte, détecte la langue et utilise un pipeline de classification zero-shot avec le modèle \texttt{MoritzLaurer/mDeBERTa-v3-base-mnli-xnli}.

Les catégories utilisées sont :

\begin{itemize}
    \item Contrat ;
    \item Facture ;
    \item Rapport ;
    \item CV ;
    \item Diplôme ;
    \item Lettre administrative ;
    \item Autre.
\end{itemize}

Cette classification permet d’enrichir les métadonnées du document. Elle ne remplace pas la vérification blockchain ; elle ajoute une information utile pour l’organisation et la recherche des documents.

\section{Étude de l’existant}

Les solutions classiques de gestion électronique de documents permettent généralement l’upload, la recherche, le partage et parfois la signature électronique. Cependant, elles reposent souvent sur une autorité centrale. D’autres solutions utilisent la blockchain pour la certification ou l’horodatage de documents, mais elles ne proposent pas toujours une intégration simple avec une application web complète ou un module de classification IA.

Le projet proposé se distingue par l’intégration de plusieurs composants dans un prototype pédagogique : gestion web complète, base de données locale, smart contract, vérification d’intégrité et microservice IA indépendant.

\section{Conclusion}

Ce chapitre a présenté les notions nécessaires au projet. La blockchain est utilisée comme registre de preuve, le hash SHA-256 permet de représenter l’intégrité d’un document, et l’IA enrichit le système par une classification automatique. Le chapitre suivant présente l’analyse des besoins et la conception détaillée de la solution.

% =========================
% Chapitre 2
% =========================
\chapter{Analyse des besoins et conception du système}

\section{Introduction}

Ce chapitre présente l’analyse des besoins fonctionnels et non fonctionnels du système, les acteurs concernés, l’architecture générale et la conception des données. Il décrit également le rôle de la blockchain et la séparation entre les données stockées on-chain et off-chain.

\section{Présentation du sujet}

Le sujet du projet est : \textbf{Partage de documents sécurisé}. Il s’agit de concevoir une application permettant de déposer, classer, partager et vérifier des documents. La sécurité repose principalement sur l’utilisation d’un hash SHA-256 enregistré dans la blockchain. Ainsi, toute modification du fichier peut être détectée lors d’une vérification ultérieure.

\section{Problématique spécifique}

Dans le système proposé, la problématique spécifique est la suivante :

\begin{quote}
Comment assurer la vérification fiable d’un document partagé, tout en conservant une architecture simple, locale et adaptée à un projet académique ?
\end{quote}

Cette problématique implique la gestion de plusieurs contraintes : protection des comptes utilisateurs, stockage hors blockchain, intégration d’un smart contract, synchronisation avec une base de données locale, classification IA et gestion des cas d’erreur.

\section{Objectifs fonctionnels}

Les objectifs fonctionnels sont directement liés aux actions attendues dans l’application :

\begin{itemize}
    \item authentifier les utilisateurs ;
    \item déposer un document ;
    \item calculer et enregistrer le hash ;
    \item classifier automatiquement le document ;
    \item partager un document avec un autre utilisateur ;
    \item vérifier l’intégrité d’un fichier ;
    \item afficher l’historique des vérifications ;
    \item fournir une interface d’administration.
\end{itemize}

\section{Objectifs non fonctionnels}

Les objectifs non fonctionnels concernent la qualité du système :

\begin{itemize}
    \item sécurité des mots de passe par hachage avec bcrypt ;
    \item authentification par JWT ;
    \item limitation des fichiers uploadés à 10 Mo ;
    \item acceptation initiale des formats PDF, DOCX et TXT ;
    \item séparation claire entre backend, frontend, blockchain et IA ;
    \item code lisible et facilement maintenable ;
    \item mode de fonctionnement local compatible avec Hardhat.
\end{itemize}

\section{Acteurs du système}

\begin{table}[H]
    \centering
    \caption{Acteurs du système}
    \label{tab:acteurs}
    \begin{tabular}{p{0.28\textwidth}p{0.6\textwidth}}
        \toprule
        \textbf{Acteur} & \textbf{Rôle} \\
        \midrule
        Utilisateur & Crée un compte, dépose des documents, consulte ses documents, partage des documents et lance des vérifications. \\
        Destinataire / Vérificateur & Accède aux documents partagés avec lui et vérifie l’intégrité des fichiers reçus. \\
        Administrateur & Consulte les utilisateurs, les documents, les journaux de vérification et gère les catégories. \\
        \bottomrule
    \end{tabular}
\end{table}

\section{Besoins fonctionnels}

\begin{longtable}{p{0.35\textwidth}p{0.55\textwidth}}
\caption{Besoins fonctionnels du système}
\label{tab:besoins-fonctionnels}\\
\toprule
\textbf{Besoin} & \textbf{Description} \\
\midrule
\endfirsthead
\toprule
\textbf{Besoin} & \textbf{Description} \\
\midrule
\endhead
Créer un compte & Permettre à un utilisateur de s’inscrire avec un nom, un email, un mot de passe et un rôle autorisé. \\
Se connecter & Authentifier l’utilisateur et générer un token JWT. \\
Déposer un document & Envoyer un fichier PDF, DOCX ou TXT vers le backend. \\
Consulter ses documents & Afficher la liste des documents appartenant à l’utilisateur connecté. \\
Partager un document & Créer un partage actif vers l’adresse email d’un destinataire. \\
Accéder à un document partagé & Permettre au destinataire de consulter les documents qui lui ont été partagés. \\
Vérifier l’intégrité d’un document & Recalculer le hash du fichier fourni et le comparer avec la preuve enregistrée. \\
Consulter le résultat de vérification & Afficher si le document est authentique, modifié, inconnu ou en erreur. \\
Gérer les utilisateurs & Permettre à l’administrateur de consulter les comptes enregistrés. \\
Consulter les journaux de vérification & Permettre à l’administrateur de visualiser les vérifications effectuées. \\
Gérer les catégories & Permettre à l’administrateur de consulter et créer des catégories. \\
\bottomrule
\end{longtable}

\section{Besoins non fonctionnels}

\begin{table}[H]
    \centering
    \caption{Besoins non fonctionnels}
    \label{tab:besoins-non-fonctionnels}
    \begin{tabular}{p{0.28\textwidth}p{0.6\textwidth}}
        \toprule
        \textbf{Besoin} & \textbf{Description} \\
        \midrule
        Sécurité & Les mots de passe sont hachés avec bcrypt et les routes sensibles sont protégées par JWT. \\
        Intégrité & Le hash SHA-256 permet de détecter toute modification du document. \\
        Traçabilité & Les vérifications sont enregistrées dans une table dédiée. \\
        Performance & Le fichier est stocké hors blockchain et seul le hash est envoyé au smart contract. \\
        Simplicité d’utilisation & L’interface frontend permet d’utiliser les principaux scénarios sans manipulation technique. \\
        Maintenabilité & Le projet est divisé en modules indépendants : backend, frontend, smart contract et service IA. \\
        \bottomrule
    \end{tabular}
\end{table}

\section{Architecture générale du système}

L’architecture repose sur quatre couches principales. Le frontend communique avec le backend via des appels HTTP. Le backend interagit avec la base SQLite via Prisma, avec le smart contract via ethers.js, et avec le service IA via une requête multipart/form-data.

\begin{figure}[H]
    \centering
    \fbox{\parbox{0.85\textwidth}{\centering Capture à insérer : Architecture générale du système}}
    \caption{Architecture générale du système}
    \label{fig:architecture-generale}
\end{figure}

Le flux d’upload suit la logique suivante :

\begin{center}
Frontend $\rightarrow$ Backend $\rightarrow$ Hash service $\rightarrow$ AI service $\rightarrow$ Blockchain service $\rightarrow$ Database $\rightarrow$ Frontend
\end{center}

Le flux de vérification suit la logique suivante :

\begin{center}
Frontend $\rightarrow$ Backend $\rightarrow$ Hash service $\rightarrow$ Database $\rightarrow$ Blockchain service $\rightarrow$ Verification history $\rightarrow$ Frontend
\end{center}

\section{Rôle de la blockchain dans le système}

La blockchain joue le rôle de registre de preuve. Elle ne contient pas le document complet, mais uniquement son identifiant transformé en \texttt{bytes32} et son hash SHA-256. Le backend convertit le code du document avec \texttt{ethers.id(documentCode)} et transforme le hash hexadécimal en \texttt{bytes32} en ajoutant le préfixe \texttt{0x}.

Cette conception permet de vérifier qu’un document correspond à celui enregistré au moment de l’upload, sans exposer son contenu dans la blockchain.

\section{Données stockées dans la blockchain}

\begin{table}[H]
    \centering
    \caption{Données liées à la blockchain}
    \label{tab:blockchain-data}
    \begin{tabular}{p{0.32\textwidth}p{0.56\textwidth}}
        \toprule
        \textbf{Donnée} & \textbf{Rôle} \\
        \midrule
        documentCode & Identifiant métier du document, converti en \texttt{bytes32} avant appel au smart contract. \\
        sha256Hash & Empreinte cryptographique du fichier, enregistrée comme preuve d’intégrité. \\
        owner address & Adresse Ethereum ayant envoyé la transaction d’enregistrement. \\
        timestamp & Date blockchain d’enregistrement dans le smart contract. \\
        blockchain transaction hash & Hash de la transaction conservé dans la base de données pour traçabilité. \\
        \bottomrule
    \end{tabular}
\end{table}

\section{Données stockées hors blockchain}

\begin{table}[H]
    \centering
    \caption{Données stockées hors blockchain}
    \label{tab:offchain-data}
    \begin{tabular}{p{0.32\textwidth}p{0.56\textwidth}}
        \toprule
        \textbf{Donnée} & \textbf{Rôle} \\
        \midrule
        originalName & Nom original du fichier envoyé par l’utilisateur. \\
        storagePath & Chemin local du fichier stocké dans le dossier d’uploads. \\
        category & Catégorie retournée par le service IA. \\
        confidence & Score de confiance associé à la classification. \\
        aiModel & Nom du modèle ou de la stratégie IA utilisée. \\
        ownerId & Identifiant du propriétaire dans la base SQLite. \\
        shares & Informations de partage entre propriétaire et destinataire. \\
        verification history & Historique des vérifications effectuées. \\
        \bottomrule
    \end{tabular}
\end{table}

\section{Modèle de base de données}

Le modèle de données est défini avec Prisma. La base SQLite contient les entités principales suivantes :

\begin{itemize}
    \item \textbf{User} : informations de compte, rôle et mot de passe haché ;
    \item \textbf{Document} : métadonnées, hash, catégorie IA, statut blockchain et propriétaire ;
    \item \textbf{Share} : partage d’un document avec une adresse email ou un utilisateur ;
    \item \textbf{Verification} : résultat d’une vérification d’intégrité ;
    \item \textbf{Category} : catégories de documents administrables.
\end{itemize}

Dans l’implémentation SQLite actuelle, les rôles et statuts sont stockés sous forme de chaînes de caractères, car Prisma SQLite ne supporte pas les énumérations de la même façon que certains autres moteurs.

\section{Diagramme de cas d’utilisation}

Le diagramme de cas d’utilisation doit représenter les interactions entre les trois acteurs et les principales fonctionnalités du système.

\begin{figure}[H]
    \centering
    \fbox{\parbox{0.85\textwidth}{\centering Capture à insérer : Diagramme de cas d’utilisation}}
    \caption{Diagramme de cas d’utilisation}
    \label{fig:use-case}
\end{figure}

\section{Diagrammes de séquence}

\subsection{Séquence d’upload}

Lors de l’upload, l’utilisateur envoie un fichier au backend. Le backend le stocke avec Multer, calcule son hash, appelle le service IA, inscrit le hash dans le smart contract, puis sauvegarde les métadonnées en base.

\begin{figure}[H]
    \centering
    \fbox{\parbox{0.85\textwidth}{\centering Capture à insérer : Diagramme de séquence upload}}
    \caption{Diagramme de séquence du dépôt de document}
    \label{fig:sequence-upload}
\end{figure}

\subsection{Séquence de vérification}

Lors de la vérification, l’utilisateur fournit un code de document et un fichier. Le backend recalcule le hash du fichier, recherche le document dans SQLite, interroge la blockchain, sauvegarde le résultat dans l’historique et retourne une réponse à l’interface.

\begin{figure}[H]
    \centering
    \fbox{\parbox{0.85\textwidth}{\centering Capture à insérer : Diagramme de séquence vérification}}
    \caption{Diagramme de séquence de vérification d’intégrité}
    \label{fig:sequence-verification}
\end{figure}

\section{Diagramme de classes}

Le diagramme de classes peut être construit à partir du schéma Prisma. Il doit montrer les relations entre User, Document, Share, Verification et Category.

\begin{figure}[H]
    \centering
    \fbox{\parbox{0.85\textwidth}{\centering Capture à insérer : Diagramme de classes}}
    \caption{Diagramme de classes du système}
    \label{fig:diagramme-classes}
\end{figure}

\section{Diagramme d’activité}

Le diagramme d’activité principal peut représenter le cycle de vie d’un document : dépôt, classification, enregistrement blockchain, partage, vérification et consultation du résultat.

\begin{figure}[H]
    \centering
    \fbox{\parbox{0.85\textwidth}{\centering Capture à insérer : Diagramme d’activité du cycle de vie d’un document}}
    \caption{Diagramme d’activité du cycle de vie d’un document}
    \label{fig:diagramme-activite}
\end{figure}

\section{Conclusion}

Ce chapitre a défini les besoins et la conception du système. L’architecture retenue sépare clairement les responsabilités : le frontend gère l’interaction utilisateur, le backend coordonne les traitements, la blockchain conserve la preuve d’intégrité, la base SQLite stocke les métadonnées et le service IA assure la classification automatique.

% =========================
% Chapitre 3
% =========================
\chapter{Réalisation et implémentation}

\section{Introduction}

Ce chapitre présente la réalisation technique du projet. Il décrit l’environnement de développement, les outils utilisés, les modules développés, les scénarios de test et les résultats obtenus.

\section{Environnement de développement}

Le projet est organisé dans un dossier principal nommé \texttt{secure-document-sharing}. La structure actuelle est la suivante :

\begin{lstlisting}
secure-document-sharing/
+-- backend/
+-- frontend/
+-- smart-contract/
+-- ai-service/
\end{lstlisting}

Chaque dossier correspond à un module indépendant. Cette organisation facilite le développement, les tests et la maintenance.

\section{Outils et technologies utilisés}

\begin{longtable}{p{0.28\textwidth}p{0.6\textwidth}}
\caption{Technologies utilisées}
\label{tab:technologies}\\
\toprule
\textbf{Technologie} & \textbf{Utilisation dans le projet} \\
\midrule
\endfirsthead
\toprule
\textbf{Technologie} & \textbf{Utilisation dans le projet} \\
\midrule
\endhead
React.js & Développement de l’interface utilisateur. \\
Node.js / Express.js & Développement de l’API backend. \\
SQLite & Base de données locale du projet. \\
Prisma & ORM utilisé pour manipuler SQLite. \\
Solidity & Langage du smart contract \texttt{DocumentRegistry}. \\
Hardhat & Environnement de développement et de déploiement blockchain local. \\
ethers.js & Communication entre backend Node.js et smart contract. \\
FastAPI & Microservice Python de classification documentaire. \\
Transformers & Pipeline IA de classification zero-shot. \\
SHA-256 & Calcul de l’empreinte cryptographique des documents. \\
\bottomrule
\end{longtable}

\section{Implémentation du backend}

Le backend est développé avec Node.js et Express.js. Il expose plusieurs groupes de routes :

\begin{itemize}
    \item \texttt{/api/auth} pour l’authentification ;
    \item \texttt{/api/documents} pour l’upload, la consultation, le téléchargement et la révocation ;
    \item \texttt{/api/verifications} pour la vérification et l’historique ;
    \item \texttt{/api/shares} pour le partage ;
    \item \texttt{/api/admin} pour l’administration.
\end{itemize}

Le backend contient des contrôleurs, des services et des middlewares. Les services importants sont le service de hash, le service IA, le service blockchain, le service de stockage et le service document.

\section{Gestion de l’authentification}

L’authentification repose sur JWT et bcrypt. Lors de l’inscription, le mot de passe est haché avant d’être stocké en base. Lors de la connexion, bcrypt compare le mot de passe saisi avec le hash enregistré. Si l’authentification réussit, un token JWT est généré pour une durée de sept jours.

Les rôles utilisés sont :

\begin{itemize}
    \item \texttt{USER} ;
    \item \texttt{VERIFIER} ;
    \item \texttt{ADMIN}.
\end{itemize}

Les routes sensibles utilisent un middleware d’authentification. Les routes administrateur sont limitées au rôle \texttt{ADMIN}.

\section{Upload et stockage hors blockchain des documents}

L’upload est réalisé avec Multer. Le backend accepte les fichiers PDF, DOCX et TXT, avec une limite de taille de 10 Mo. Les fichiers sont stockés dans le dossier local \texttt{backend/src/uploads}. Le nom stocké est généré de manière sûre afin d’éviter de dépendre uniquement du nom original fourni par l’utilisateur.

Le document complet n’est pas envoyé à la blockchain. Ce choix est important pour trois raisons :

\begin{itemize}
    \item préserver la confidentialité du document ;
    \item éviter le coût et la lourdeur du stockage on-chain ;
    \item garder une architecture réaliste où la blockchain sert uniquement de preuve d’intégrité.
\end{itemize}

\section{Calcul du hash SHA-256}

Après l’upload, le backend lit le fichier et calcule son hash SHA-256. Ce hash est ensuite utilisé à la fois pour l’enregistrement blockchain et pour la vérification ultérieure.

\begin{lstlisting}[caption={Extrait du calcul SHA-256 côté backend}]
const crypto = require("crypto");
const fs = require("fs");

function calculateSHA256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}
\end{lstlisting}

\section{Intégration du smart contract}

Le smart contract \texttt{DocumentRegistry} stocke une structure contenant le hash du document, l’adresse du propriétaire, un timestamp, un indicateur d’existence et un indicateur de révocation. Le backend utilise ethers.js pour appeler le contrat.

Lors de l’upload, le backend convertit :

\begin{itemize}
    \item le code document en \texttt{bytes32} avec \texttt{ethers.id(documentCode)} ;
    \item le hash SHA-256 en \texttt{bytes32} avec \texttt{"0x" + sha256Hash}.
\end{itemize}

\begin{lstlisting}[caption={Extrait simplifié de la fonction registerDocument}]
function registerDocument(bytes32 documentId, bytes32 documentHash) external {
    if (documentId == bytes32(0)) revert EmptyDocumentId();
    if (documentHash == bytes32(0)) revert EmptyDocumentHash();
    if (documents[documentId].exists) revert DocumentAlreadyExists();

    documents[documentId] = DocumentRecord({
        documentHash: documentHash,
        owner: msg.sender,
        timestamp: block.timestamp,
        exists: true,
        revoked: false
    });

    emit DocumentRegistered(documentId, documentHash, msg.sender, block.timestamp);
}
\end{lstlisting}

\section{Déploiement local avec Hardhat}

Le smart contract est déployé localement avec Hardhat. Le réseau local est lancé avec :

\begin{lstlisting}
npx hardhat node
\end{lstlisting}

Puis le contrat est déployé avec :

\begin{lstlisting}
npx hardhat run .\scripts\deploy.js --network localhost
\end{lstlisting}

L’adresse du contrat déployé est ensuite placée dans le fichier \texttt{backend/.env}. Une particularité importante est que la blockchain locale Hardhat est temporaire : lorsqu’on redémarre \texttt{npx hardhat node}, l’état blockchain est réinitialisé. Les anciens documents restent dans SQLite, mais leurs hashes ne sont plus présents dans la nouvelle session blockchain. Pour corriger cela, un script backend de réenregistrement peut relire les documents existants et réinscrire leurs hashes dans le contrat courant.

\begin{figure}[H]
    \centering
    \fbox{\parbox{0.85\textwidth}{\centering Capture à insérer : Hardhat node avec les transactions}}
    \caption{Exécution du réseau local Hardhat}
    \label{fig:hardhat-node}
\end{figure}

\begin{figure}[H]
    \centering
    \fbox{\parbox{0.85\textwidth}{\centering Capture à insérer : Résultat blockchain après upload}}
    \caption{Résultat d’enregistrement blockchain}
    \label{fig:resultat-blockchain}
\end{figure}

\section{Intégration de la classification IA}

Le service IA est indépendant du backend. Il est développé avec FastAPI et expose les endpoints suivants :

\begin{itemize}
    \item \texttt{GET /health} pour vérifier l’état du service ;
    \item \texttt{POST /classify} pour classifier un fichier ;
    \item \texttt{POST /classify-text} pour classifier un texte.
\end{itemize}

Le backend appelle \texttt{POST /classify} avec un champ multipart nommé \texttt{file}. Le service IA extrait le texte selon le type de fichier :

\begin{itemize}
    \item TXT : lecture UTF-8 avec fallback latin-1 ;
    \item PDF : extraction avec PyMuPDF ;
    \item DOCX : extraction avec python-docx.
\end{itemize}

Ensuite, il détecte la langue avec \texttt{langdetect} et classe le document avec le modèle \texttt{MoritzLaurer/mDeBERTa-v3-base-mnli-xnli}. Le classificateur utilise aussi un nettoyage du texte, un découpage en morceaux, des libellés descriptifs, des règles par mots-clés et un seuil de confiance. Si le service IA est indisponible, le backend utilise une valeur de secours : catégorie \texttt{Autre}, confiance \texttt{0}, modèle \texttt{AI service unavailable}.

\begin{lstlisting}[caption={Exemple de réponse du service IA}]
{
  "status": "success",
  "category": "Rapport",
  "confidence": 0.78,
  "model": "MoritzLaurer/mDeBERTa-v3-base-mnli-xnli",
  "language": "fr",
  "extracted_text_length": 1904
}
\end{lstlisting}

\begin{figure}[H]
    \centering
    \fbox{\parbox{0.85\textwidth}{\centering Capture à insérer : Résultat IA affiché après upload}}
    \caption{Résultat de classification IA}
    \label{fig:resultat-ia}
\end{figure}

\section{Implémentation du frontend}

Le frontend est développé avec React.js et Vite. Il utilise React Router pour la navigation et Axios pour les appels API. Les principales pages sont :

\begin{itemize}
    \item Login ;
    \item Register ;
    \item Dashboard ;
    \item UploadDocument ;
    \item MyDocuments ;
    \item VerifyDocument ;
    \item SharedDocuments ;
    \item VerificationHistory ;
    \item AdminDashboard.
\end{itemize}

Le frontend permet de démontrer les scénarios principaux du projet : authentification, upload, affichage du code document, résultat IA, hash, statut blockchain, partage et vérification.

\begin{figure}[H]
    \centering
    \fbox{\parbox{0.85\textwidth}{\centering Capture à insérer : Interface login}}
    \caption{Interface de connexion}
    \label{fig:interface-login}
\end{figure}

\begin{figure}[H]
    \centering
    \fbox{\parbox{0.85\textwidth}{\centering Capture à insérer : Interface upload}}
    \caption{Interface d’upload de document}
    \label{fig:interface-upload}
\end{figure}

\begin{figure}[H]
    \centering
    \fbox{\parbox{0.85\textwidth}{\centering Capture à insérer : Vérification d’intégrité}}
    \caption{Interface de vérification d’intégrité}
    \label{fig:verification-integrite}
\end{figure}

\section{Base de données avec Prisma et SQLite}

La base de données SQLite est stockée dans le dossier Prisma du backend. Prisma fournit un client permettant d’effectuer les opérations sur les utilisateurs, documents, partages, vérifications et catégories.

Prisma Studio peut être utilisé pour consulter les données pendant le développement :

\begin{lstlisting}
npx prisma studio
\end{lstlisting}

\begin{figure}[H]
    \centering
    \fbox{\parbox{0.85\textwidth}{\centering Capture à insérer : Prisma Studio avec les documents}}
    \caption{Consultation de la base avec Prisma Studio}
    \label{fig:prisma-studio}
\end{figure}

\section{Scénarios de test}

\begin{longtable}{p{0.32\textwidth}p{0.28\textwidth}p{0.28\textwidth}}
\caption{Scénarios de test}
\label{tab:tests}\\
\toprule
\textbf{Test} & \textbf{Résultat attendu} & \textbf{Résultat observé} \\
\midrule
\endfirsthead
\toprule
\textbf{Test} & \textbf{Résultat attendu} & \textbf{Résultat observé} \\
\midrule
\endhead
Upload valid document & Document enregistré, hash calculé, blockchain appelée & \textit{à compléter avec capture} \\
Upload unsupported file & Erreur claire indiquant les formats acceptés & \textit{à compléter} \\
Blockchain hash registration & Transaction confirmée et hash de transaction retourné & \textit{à compléter} \\
Verify authentic document & Résultat AUTHENTIC & \textit{à compléter} \\
Verify modified document & Résultat MODIFIED & \textit{à compléter} \\
Verify unknown document & Résultat UNKNOWN & \textit{à compléter} \\
AI classification of contract & Catégorie Contrat avec confiance positive & \textit{à compléter} \\
AI classification of report & Catégorie Rapport avec confiance positive & \textit{à compléter} \\
Document sharing & Partage actif visible chez le destinataire & \textit{à compléter} \\
\bottomrule
\end{longtable}

\section{Résultats obtenus}

Le prototype permet de réaliser les fonctionnalités principales prévues. Lorsqu’un document est uploadé, le backend calcule son hash, appelle le service IA et tente d’enregistrer le hash dans la blockchain. Le résultat affiché côté frontend contient le code du document, le hash, la catégorie IA, le niveau de confiance, le statut blockchain et le hash de transaction.

\begin{lstlisting}[caption={Exemple de réponse backend après upload}]
{
  "success": true,
  "message": "Document uploaded and secured successfully",
  "data": {
    "documentId": "clx123",
    "documentCode": "DOC-2026-0001",
    "originalName": "rapport.pdf",
    "sha256Hash": "a3f5...",
    "category": "Rapport",
    "confidence": 0.78,
    "blockchainStatus": "REGISTERED",
    "blockchainTxHash": "0x..."
  }
}
\end{lstlisting}

Lors de la vérification, le backend retourne un résultat parmi \texttt{AUTHENTIC}, \texttt{MODIFIED}, \texttt{UNKNOWN} ou \texttt{ERROR}. Un document est authentique lorsque le fichier fourni produit le même hash que celui stocké en base et enregistré dans la blockchain.

\begin{lstlisting}[caption={Exemple de réponse de vérification}]
{
  "success": true,
  "result": "AUTHENTIC",
  "message": "Document is authentic and has not been modified.",
  "data": {
    "documentCode": "DOC-2026-0001",
    "calculatedHash": "a3f5...",
    "blockchainHash": "0xa3f5..."
  }
}
\end{lstlisting}

\section{Difficultés rencontrées}

Plusieurs difficultés ont été rencontrées pendant le développement :

\begin{itemize}
    \item l’intégration du smart contract avec ethers.js nécessite de charger uniquement l’ABI et non l’artifact Hardhat complet ;
    \item le réseau Hardhat local est réinitialisé à chaque redémarrage, ce qui peut rendre les anciens documents inconnus côté blockchain ;
    \item la classification IA dépend fortement de la qualité du texte extrait, surtout pour les fichiers PDF ;
    \item certains documents scannés ne contiennent pas de texte directement exploitable sans OCR ;
    \item les temps de réponse du modèle IA peuvent être élevés lors du premier chargement.
\end{itemize}

\section{Limites de la solution}

La solution développée reste un prototype académique. Ses principales limites sont :

\begin{itemize}
    \item la blockchain locale Hardhat est temporaire et ne conserve pas l’état après redémarrage ;
    \item le stockage des fichiers est local et non distribué ;
    \item l’application n’utilise pas encore IPFS ou un stockage cloud sécurisé ;
    \item la classification IA dépend de l’extraction de texte ;
    \item les PDF scannés sans OCR peuvent être classés en \texttt{Autre} ;
    \item la gestion des clés privées est simplifiée pour un usage pédagogique ;
    \item le contrôle d’accès pourrait être renforcé pour des scénarios réels.
\end{itemize}

\section{Conclusion}

Ce chapitre a présenté la réalisation du système. Le projet montre qu’il est possible d’intégrer dans une même application un backend web, une base de données, un smart contract, un frontend et un service IA. Le prototype répond aux objectifs principaux : dépôt, classification, preuve blockchain, vérification et partage de documents.

% =========================
% Conclusion générale
% =========================
\chapter*{Conclusion générale}
\addcontentsline{toc}{chapter}{Conclusion générale}

\section*{Bilan du projet}
\addcontentsline{toc}{section}{Bilan du projet}

Ce projet a permis de réaliser un système de partage de documents sécurisé basé sur la blockchain. Le système développé combine plusieurs technologies modernes : React.js pour l’interface, Express.js pour le backend, SQLite avec Prisma pour la persistance, Solidity et Hardhat pour la blockchain, ethers.js pour l’intégration smart contract, et FastAPI avec Transformers pour la classification IA.

Le principe central du projet est de ne pas stocker le document dans la blockchain. Le fichier est stocké hors chaîne, tandis que son hash SHA-256 est enregistré dans le smart contract. Ainsi, il devient possible de vérifier l’intégrité d’un document sans exposer son contenu dans un registre public ou coûteux.

\section*{Apports du projet}
\addcontentsline{toc}{section}{Apports du projet}

Le projet a permis de mettre en pratique plusieurs notions importantes :

\begin{itemize}
    \item développement full-stack ;
    \item sécurité par authentification JWT et hachage bcrypt ;
    \item manipulation de fichiers avec Multer ;
    \item calcul de hash cryptographique ;
    \item interaction avec un smart contract Ethereum ;
    \item conception d’un modèle de données avec Prisma ;
    \item intégration d’un microservice IA ;
    \item séparation entre stockage on-chain et off-chain.
\end{itemize}

\section*{Limites}
\addcontentsline{toc}{section}{Limites}

Les limites principales concernent le contexte local du projet. Hardhat est adapté au développement, mais il ne représente pas un réseau blockchain persistant. De plus, le stockage local des fichiers n’est pas suffisant pour une solution de production. La classification IA, bien qu’utile, peut se tromper lorsque le texte extrait est incomplet ou bruité.

\section*{Perspectives d’amélioration}
\addcontentsline{toc}{section}{Perspectives d’amélioration}

Plusieurs améliorations peuvent être envisagées :

\begin{itemize}
    \item déployer le smart contract sur un testnet public ;
    \item utiliser IPFS pour un stockage décentralisé des documents ;
    \item ajouter un module OCR pour les PDF scannés ;
    \item fine-tuner le classificateur IA avec un dataset annoté ;
    \item améliorer le contrôle d’accès basé sur les rôles ;
    \item enrichir les journaux d’audit ;
    \item ajouter la signature numérique des documents ;
    \item améliorer l’interface administrateur ;
    \item sécuriser la gestion des clés privées.
\end{itemize}

En conclusion, ce projet constitue une base solide pour comprendre comment la blockchain peut être utilisée comme mécanisme de preuve d’intégrité dans un système de partage documentaire.

% =========================
% Bibliographie
% =========================
\begin{thebibliography}{9}
\addcontentsline{toc}{chapter}{Bibliographie}

\bibitem{react}
Documentation officielle React.js, \url{https://react.dev/}

\bibitem{vite}
Documentation officielle Vite, \url{https://vitejs.dev/}

\bibitem{express}
Documentation officielle Express.js, \url{https://expressjs.com/}

\bibitem{prisma}
Documentation officielle Prisma ORM, \url{https://www.prisma.io/docs}

\bibitem{sqlite}
Documentation officielle SQLite, \url{https://www.sqlite.org/docs.html}

\bibitem{hardhat}
Documentation officielle Hardhat, \url{https://hardhat.org/docs}

\bibitem{ethers}
Documentation officielle ethers.js, \url{https://docs.ethers.org/}

\bibitem{solidity}
Documentation officielle Solidity, \url{https://docs.soliditylang.org/}

\bibitem{fastapi}
Documentation officielle FastAPI, \url{https://fastapi.tiangolo.com/}

\bibitem{huggingface}
Documentation Hugging Face Transformers, \url{https://huggingface.co/docs/transformers}

\bibitem{sha}
National Institute of Standards and Technology, Secure Hash Standard, FIPS PUB 180-4.

\end{thebibliography}

% =========================
% Annexes
% =========================
\appendix

\chapter{Extrait du smart contract DocumentRegistry}

\begin{lstlisting}[caption={Structure principale du smart contract}]
struct DocumentRecord {
    bytes32 documentHash;
    address owner;
    uint256 timestamp;
    bool exists;
    bool revoked;
}

mapping(bytes32 => DocumentRecord) private documents;
\end{lstlisting}

\chapter{Exemple de réponse API upload}

\begin{lstlisting}
{
  "success": true,
  "message": "Document uploaded and secured successfully",
  "data": {
    "documentId": "clx123",
    "documentCode": "DOC-2026-0001",
    "originalName": "contract.pdf",
    "sha256Hash": "a3f5...",
    "category": "Contrat",
    "confidence": 0.92,
    "blockchainStatus": "REGISTERED",
    "blockchainTxHash": "0x..."
  }
}
\end{lstlisting}

\chapter{Exemple de réponse API vérification}

\begin{lstlisting}
{
  "success": true,
  "result": "MODIFIED",
  "message": "Document has been modified or falsified.",
  "data": {
    "documentCode": "DOC-2026-0001",
    "calculatedHash": "b8c2...",
    "blockchainHash": "0xa3f5..."
  }
}
\end{lstlisting}

\chapter{Exemples de résultats IA}

\begin{lstlisting}
{
  "status": "success",
  "category": "Contrat",
  "confidence": 0.95,
  "model": "MoritzLaurer/mDeBERTa-v3-base-mnli-xnli",
  "language": "fr",
  "extracted_text_length": 127
}
\end{lstlisting}

\chapter{Captures d’écran à insérer}

Cette annexe peut contenir les captures réelles du projet :

\begin{itemize}
    \item page de connexion ;
    \item tableau de bord ;
    \item upload d’un document ;
    \item résultat IA ;
    \item transaction blockchain ;
    \item vérification d’un document authentique ;
    \item vérification d’un document modifié ;
    \item Prisma Studio ;
    \item terminal Hardhat.
\end{itemize}

\end{document}
```

## Instructions pour générer le PDF

Option 1 : utiliser Overleaf.

1. Créer un nouveau projet Overleaf.
2. Copier le contenu du bloc LaTeX dans un fichier `rapport.tex`.
3. Compiler avec pdfLaTeX.

Option 2 : compiler localement.

```bash
pdflatex rapport.tex
pdflatex rapport.tex
```

La deuxième compilation permet de mettre à jour correctement la table des matières, la liste des figures et la liste des tableaux.
