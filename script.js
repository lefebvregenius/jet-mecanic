
/* ============================================================
   JET ENGINE EXPERIENCE
   SCRIPT.JS — PARTIE 1 / 4
   ------------------------------------------------------------
   ARCHITECTURE UNIQUE
   ------------------------------------------------------------
   ✓ Une seule scène Three.js
   ✓ Une seule caméra
   ✓ Un seul renderer
   ✓ Un seul GLTFLoader
   ✓ Un seul chargement du GLB
   ✓ Un seul AnimationMixer
   ✓ Une seule boucle de rendu
   ✓ Une seule timeline GSAP sera créée en PARTIE 3
   ✓ Aucun deuxième système Three.js
============================================================ */


/* ============================================================
   01 — IMPORTS THREE.JS
   ------------------------------------------------------------
   Compatible avec un script chargé en type="module".
============================================================ */

import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js";


import {
    GLTFLoader
} from
    "https://cdn.jsdelivr.net/npm/three@0.167.1/examples/jsm/loaders/GLTFLoader.js";


import {
    OrbitControls
} from
    "https://cdn.jsdelivr.net/npm/three@0.167.1/examples/jsm/controls/OrbitControls.js";


import gsap from
    "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";


import {
    ScrollTrigger
} from
    "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";


/* ============================================================
   02 — ENREGISTREMENT GSAP
============================================================ */

gsap.registerPlugin(
    ScrollTrigger
);


/* ============================================================
   03 — CONFIGURATION GÉNÉRALE
============================================================ */

const ENGINE_CONFIG = {

    /* --------------------------------------------------------
       Fichier GLB
    -------------------------------------------------------- */

    modelPath:
        "./models/jet_engine.glb",


    /* --------------------------------------------------------
       Position initiale du moteur
    -------------------------------------------------------- */

    modelPosition: {

        x: 0,

        y: 0,

        z: 0

    },


    /* --------------------------------------------------------
       Rotation initiale
    -------------------------------------------------------- */

    modelRotation: {

        x: 0,

        y: Math.PI,

        z: 0

    },


    /* --------------------------------------------------------
       Échelle initiale
    -------------------------------------------------------- */

    modelScale: 1,


    /* --------------------------------------------------------
       Caméra
    -------------------------------------------------------- */

    camera: {

        fov: 35,

        near: 0.1,

        far: 100,

        position: {

            x: 4.2,

            y: 1.8,

            z: 6.8

        }

    },


    /* --------------------------------------------------------
       Animation
    -------------------------------------------------------- */

    animation: {

        idleRotationSpeed:
            0.0008,

        maximumSeparation:
            1.35,

        scrollRotation:
            Math.PI * 1.5

    },


    /* --------------------------------------------------------
       Rendu
    -------------------------------------------------------- */

    renderer: {

        pixelRatioMaximum:
            2,

        powerPreference:
            "high-performance"

    }

};


/* ============================================================
   04 — VARIABLES THREE.JS
   ------------------------------------------------------------
   Elles sont déclarées UNE SEULE FOIS dans tout le script.
============================================================ */

let scene = null;

let camera = null;

let renderer = null;

let canvas = null;

let engine = null;

let engineRoot = null;

let mixer = null;

let controls = null;

let clock = null;


/* ============================================================
   05 — ÉTAT DU MOTEUR
============================================================ */

let engineLoaded = false;

let engineParts = [];

let scrollProgress = 0;


/* ============================================================
   06 — UNIQUE TIMELINE GSAP
   ------------------------------------------------------------
   Elle sera créée uniquement en PARTIE 3.
============================================================ */

let scrollTimeline = null;


/* ============================================================
   07 — INITIALISATION THREE.JS
   ------------------------------------------------------------
   Une seule fonction d'initialisation.
============================================================ */

function initializeThreeScene() {


    /* ========================================================
       CANVAS
    ======================================================== */

    canvas =
        document.getElementById(
            "three-canvas"
        );


    if (!canvas) {

        console.error(
            "❌ Canvas #three-canvas introuvable."
        );

        return;

    }


    /* ========================================================
       SCÈNE
    ======================================================== */

    scene =
        new THREE.Scene();


    scene.background =
        new THREE.Color(
            0x030507
        );


    /* ========================================================
       HORLOGE
    ======================================================== */

    clock =
        new THREE.Clock();


    /* ========================================================
       CAMÉRA
    ======================================================== */

    camera =
        new THREE.PerspectiveCamera(

            ENGINE_CONFIG.camera.fov,

            window.innerWidth /
            window.innerHeight,

            ENGINE_CONFIG.camera.near,

            ENGINE_CONFIG.camera.far

        );


    camera.position.set(

        ENGINE_CONFIG.camera.position.x,

        ENGINE_CONFIG.camera.position.y,

        ENGINE_CONFIG.camera.position.z

    );


    /* ========================================================
       RENDERER
    ======================================================== */

    renderer =
        new THREE.WebGLRenderer({

            canvas: canvas,

            antialias: true,

            alpha: true,

            powerPreference:
                ENGINE_CONFIG
                    .renderer
                    .powerPreference

        });


    renderer.setPixelRatio(

        Math.min(

            window.devicePixelRatio,

            ENGINE_CONFIG
                .renderer
                .pixelRatioMaximum

        )

    );


    renderer.setSize(

        window.innerWidth,

        window.innerHeight,

        false

    );


    /* --------------------------------------------------------
       COLOR MANAGEMENT
    -------------------------------------------------------- */

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;


    /* --------------------------------------------------------
       TONE MAPPING
    -------------------------------------------------------- */

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;


    renderer.toneMappingExposure =
        1.15;


    /* --------------------------------------------------------
       OMBRES
    -------------------------------------------------------- */

    renderer.shadowMap.enabled =
        true;


    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;


    /* ========================================================
       LUMIÈRE AMBIANTE
    ======================================================== */

    const ambientLight =
        new THREE.HemisphereLight(

            0xffffff,

            0x080b10,

            1.7

        );


    scene.add(
        ambientLight
    );


    /* ========================================================
       KEY LIGHT
    ======================================================== */

    const keyLight =
        new THREE.DirectionalLight(

            0xffffff,

            4.0

        );


    keyLight.position.set(

        5,

        7,

        6

    );


    keyLight.castShadow =
        true;


    scene.add(
        keyLight
    );


    /* ========================================================
       RIM LIGHT
    ======================================================== */

    const rimLight =
        new THREE.DirectionalLight(

            0x6fa8ff,

            2.5

        );


    rimLight.position.set(

        -5,

        3,

        -6

    );


    scene.add(
        rimLight
    );


    /* ========================================================
       FRONT LIGHT
    ======================================================== */

    const frontLight =
        new THREE.PointLight(

            0xffffff,

            1.8,

            20

        );


    frontLight.position.set(

        2,

        1.5,

        5

    );


    scene.add(
        frontLight
    );


    /* ========================================================
       CONTROLS
       --------------------------------------------------------
       Les contrôles restent désactivés par défaut afin que
       le storytelling au scroll reste maître du mouvement.
    ======================================================== */

    controls =
        new OrbitControls(

            camera,

            canvas

        );


    controls.enableDamping =
        true;


    controls.enableRotate =
        false;


    controls.enablePan =
        false;


    controls.enableZoom =
        false;


    controls.enabled =
        false;


    /* ========================================================
       CHARGEMENT UNIQUE DU GLB
    ======================================================== */

    loadJetEngine();

}


/* ============================================================
   08 — CHARGEMENT DU MOTEUR
   ------------------------------------------------------------
   IMPORTANT :
   Cette fonction ne doit être appelée qu'une seule fois.
============================================================ */

function loadJetEngine() {

    const loader =
        new GLTFLoader();


    loader.load(

        ENGINE_CONFIG.modelPath,


        /* ====================================================
           SUCCÈS
        ==================================================== */

        function(gltf) {

            console.log(
                "✓ jet_engine.glb chargé."
            );


            /* -----------------------------------------------
               SCÈNE GLB
            ----------------------------------------------- */

            engine =
                gltf.scene;


            /* -----------------------------------------------
               RACINE DU MOTEUR
            ----------------------------------------------- */

            engineRoot =
                new THREE.Group();


            engineRoot.name =
                "JET_ENGINE_ROOT";


            engineRoot.add(
                engine
            );


            scene.add(
                engineRoot
            );


            /* -----------------------------------------------
               TRANSFORMATIONS INITIALES
            ----------------------------------------------- */

            engineRoot.position.set(

                ENGINE_CONFIG
                    .modelPosition
                    .x,

                ENGINE_CONFIG
                    .modelPosition
                    .y,

                ENGINE_CONFIG
                    .modelPosition
                    .z

            );


            engineRoot.rotation.set(

                ENGINE_CONFIG
                    .modelRotation
                    .x,

                ENGINE_CONFIG
                    .modelRotation
                    .y,

                ENGINE_CONFIG
                    .modelRotation
                    .z

            );


            engineRoot.scale.setScalar(

                ENGINE_CONFIG
                    .modelScale

            );


            /* -----------------------------------------------
               PRÉPARATION DES MESHES
            ----------------------------------------------- */

            prepareLoadedEngine();


            /* -----------------------------------------------
               ANIMATIONS NATIVES DU GLB
            ----------------------------------------------- */

            if (
                gltf.animations &&
                gltf.animations.length > 0
            ) {

                mixer =
                    new THREE.AnimationMixer(
                        engine
                    );


                gltf.animations.forEach(

                    function(clip) {

                        const action =
                            mixer.clipAction(
                                clip
                            );


                        action.play();


                        action.enabled =
                            true;


                        action.setEffectiveWeight(
                            1
                        );

                    }

                );


                console.log(

                    `✓ ${gltf.animations.length}` +
                    " animation(s) GLB détectée(s)."

                );

            } else {

                mixer = null;


                console.log(
                    "ℹ️ Aucune animation native dans le GLB."
                );

            }


            /* -----------------------------------------------
               ÉTAT FINAL
            ----------------------------------------------- */

            engineLoaded =
                true;


            /* -----------------------------------------------
               DONNÉES DES COMPOSANTS
               ----------------------------------------------- */

            prepareEngineParts();


            console.log(
                "✓ Moteur prêt."
            );


            /* -----------------------------------------------
               PARTIE 2
               -----------------------------------------------
               La fonction sera définie dans la PARTIE 2.
            ----------------------------------------------- */

            if (
                typeof finalizeEngineSetup ===
                "function"
            ) {

                finalizeEngineSetup();

            }


            /* -----------------------------------------------
               PARTIE 3
               -----------------------------------------------
               La timeline sera créée une seule fois
               lorsque cette fonction sera disponible.
            ----------------------------------------------- */

            if (
                typeof createScrollExperience ===
                "function"
            ) {

                createScrollExperience();

            }


            /* -----------------------------------------------
               REFRESH SCROLLTRIGGER
            ----------------------------------------------- */

            if (
                typeof ScrollTrigger !==
                "undefined"
            ) {

                ScrollTrigger.refresh();

            }

        },


        /* ====================================================
           PROGRESSION
        ==================================================== */

        function(xhr) {

            if (
                xhr.total
            ) {

                const percent =
                    (
                        xhr.loaded /
                        xhr.total
                    ) * 100;


                console.log(

                    `Chargement moteur : ` +
                    `${percent.toFixed(1)}%`

                );

            }

        },


        /* ====================================================
           ERREUR
        ==================================================== */

        function(error) {

            console.error(
                "❌ Impossible de charger jet_engine.glb.",
                error
            );


            engineLoaded =
                false;

        }

    );

}


/* ============================================================
   09 — PRÉPARATION DU MOTEUR CHARGÉ
============================================================ */

function prepareLoadedEngine() {

    if (!engine) {

        return;

    }


    engine.traverse(

        function(object) {

            if (
                !object.isMesh
            ) {

                return;

            }


            /* ------------------------------------------------
               OMBRES
            ------------------------------------------------ */

            object.castShadow =
                true;


            object.receiveShadow =
                true;


            /* ------------------------------------------------
               MATÉRIAU
            ------------------------------------------------ */

            if (
                !object.material
            ) {

                return;

            }


            const materials =

                Array.isArray(
                    object.material
                )

                    ? object.material

                    : [
                        object.material
                    ];


            materials.forEach(

                function(material) {

                    if (!material) {

                        return;

                    }


                    material.needsUpdate =
                        true;

                }

            );

        }

    );

}


/* ============================================================
   10 — ENREGISTREMENT DES PIÈCES
   ------------------------------------------------------------
   La PARTIE 2 pourra ensuite analyser leurs noms.
============================================================ */

function prepareEngineParts() {

    if (!engine) {

        return;

    }


    engineParts = [];


    engine.traverse(

        function(object) {

            if (
                !object.isMesh
            ) {

                return;

            }


            /* ------------------------------------------------
               DONNÉES ORIGINALES
            ------------------------------------------------ */

            object.userData.originalPosition =
                object.position.clone();


            object.userData.originalRotation =
                object.rotation.clone();


            object.userData.originalScale =
                object.scale.clone();


            object.userData.originalVisible =
                object.visible;


            /* ------------------------------------------------
               NOM
            ------------------------------------------------ */

            object.userData.originalName =
                object.name ||
                "ENGINE_COMPONENT";


            /* ------------------------------------------------
               AJOUT À LA LISTE
            ------------------------------------------------ */

            engineParts.push(
                object
            );

        }

    );


    console.log(

        `✓ ${engineParts.length}` +
        " mesh(es) détecté(s) dans le moteur."

    );

}


/* ============================================================
   11 — RÉINITIALISATION DU MOTEUR
============================================================ */

function resetEngine() {

    if (!engine) {

        return;

    }


    engineParts.forEach(

        function(part) {

            if (
                part.userData.originalPosition
            ) {

                part.position.copy(

                    part.userData.originalPosition

                );

            }


            if (
                part.userData.originalRotation
            ) {

                part.rotation.copy(

                    part.userData.originalRotation

                );

            }


            if (
                part.userData.originalScale
            ) {

                part.scale.copy(

                    part.userData.originalScale

                );

            }


            if (
                typeof part.userData.originalVisible
                === "boolean"
            ) {

                part.visible =
                    part.userData.originalVisible;

            }

        }

    );

}


/* ============================================================
   12 — RESIZE
   ------------------------------------------------------------
   Un seul gestionnaire de taille pour Three.js.
============================================================ */

function handleEngineResize() {

    if (
        !camera ||
        !renderer
    ) {

        return;

    }


    const width =
        window.innerWidth;


    const height =
        window.innerHeight;


    /* --------------------------------------------------------
       CAMÉRA
    -------------------------------------------------------- */

    camera.aspect =
        width / height;


    camera.updateProjectionMatrix();


    /* --------------------------------------------------------
       RENDERER
    -------------------------------------------------------- */

    renderer.setSize(

        width,

        height,

        false

    );


    renderer.setPixelRatio(

        Math.min(

            window.devicePixelRatio,

            ENGINE_CONFIG
                .renderer
                .pixelRatioMaximum

        )

    );

}


/* ============================================================
   13 — UNIQUE LISTENER RESIZE
============================================================ */

window.addEventListener(

    "resize",

    handleEngineResize,

    {
        passive: true
    }

);


/* ============================================================
   14 — BOUCLE DE RENDU UNIQUE
   ------------------------------------------------------------
   Une seule requestAnimationFrame dans tout le projet.
============================================================ */

function renderEngine() {

    requestAnimationFrame(
        renderEngine
    );


    if (
        !renderer ||
        !scene ||
        !camera
    ) {

        return;

    }


    const delta =
        clock
            ? clock.getDelta()
            : 0;


    /* --------------------------------------------------------
       ANIMATION GLB
    -------------------------------------------------------- */

    if (mixer) {

        mixer.update(
            delta
        );

    }


    /* --------------------------------------------------------
       CONTRÔLES
    -------------------------------------------------------- */

    if (controls) {

        controls.update();

    }


    /* --------------------------------------------------------
       RENDU
    -------------------------------------------------------- */

    renderer.render(

        scene,

        camera

    );

}


/* ============================================================
   15 — DÉMARRAGE UNIQUE
============================================================ */

initializeThreeScene();


/* ============================================================
   16 — DÉMARRAGE UNIQUE DU RENDER
============================================================ */

renderEngine();


/* ============================================================
   17 — ÉTAT INITIAL
============================================================ */

console.log(
    "✈️ JET ENGINE EXPERIENCE"
);


console.log(
    "✓ Architecture Three.js initialisée."
);


console.log(
    "✓ GLB attendu :",
    ENGINE_CONFIG.modelPath
);


/* ============================================================
   FIN PARTIE 1 / 4
============================================================ */

/* ============================================================
   JET ENGINE EXPERIENCE
   SCRIPT.JS — PARTIE 2 / 4
   ------------------------------------------------------------
   ANALYSE ET PRÉPARATION TECHNIQUE DU MOTEUR
   ------------------------------------------------------------
   ✓ Compatible avec la PARTIE 1
   ✓ Aucun nouveau renderer
   ✓ Aucun nouveau GLTFLoader
   ✓ Aucun nouveau chargement GLB
   ✓ Aucune nouvelle boucle requestAnimationFrame
   ✓ Préparation de la vue éclatée
   ✓ Détection des composants
   ✓ Analyse des dimensions
   ✓ Positions originales sauvegardées
   ✓ Axes de séparation
============================================================ */


/* ============================================================
   18 — CONFIGURATION DES COMPOSANTS
============================================================ */

const COMPONENT_CONFIG = {

    /* --------------------------------------------------------
       Distance maximale de séparation
    -------------------------------------------------------- */

    separationDistance: 1.35,


    /* --------------------------------------------------------
       Intensité par type de composant
    -------------------------------------------------------- */

    separationStrength: {

        compressor: 0.95,

        combustion: 1.20,

        turbine: 1.05,

        shaft: 0.65,

        nozzle: 0.90,

        casing: 0.55,

        fan: 0.85,

        unknown: 0.70

    },


    /* --------------------------------------------------------
       Couleurs techniques
    -------------------------------------------------------- */

    colors: {

        compressor: 0x6fa8ff,

        combustion: 0xffb347,

        turbine: 0xff6b35,

        shaft: 0xbfc7d5,

        nozzle: 0x9da7b8,

        casing: 0x6d7788,

        fan: 0x86c5ff,

        unknown: 0x9aa4b2

    }

};


/* ============================================================
   19 — STRUCTURE DES DONNÉES
============================================================ */

const engineData = {

    bounds: {

        min: new THREE.Vector3(),

        max: new THREE.Vector3(),

        center: new THREE.Vector3(),

        size: new THREE.Vector3()

    },


    components: {

        fan: [],

        compressor: [],

        combustion: [],

        turbine: [],

        shaft: [],

        nozzle: [],

        casing: [],

        unknown: []

    },


    all: []

};


/* ============================================================
   20 — CLASSIFICATION PAR NOM
   ------------------------------------------------------------
   Le GLB peut avoir des noms différents selon le logiciel
   utilisé pour sa création.
============================================================ */

function classifyEnginePart(object) {

    const name =
        (
            object.name ||
            ""
        ).toLowerCase();


    /* --------------------------------------------------------
       FAN
    -------------------------------------------------------- */

    if (

        name.includes("fan") ||

        name.includes("blower") ||

        name.includes("inlet_fan") ||

        name.includes("front_fan")

    ) {

        return "fan";

    }


    /* --------------------------------------------------------
       COMPRESSOR
    -------------------------------------------------------- */

    if (

        name.includes("compressor") ||

        name.includes("compress") ||

        name.includes("compressor_stage") ||

        name.includes("stage")

    ) {

        return "compressor";

    }


    /* --------------------------------------------------------
       COMBUSTION
    -------------------------------------------------------- */

    if (

        name.includes("combust") ||

        name.includes("combustion") ||

        name.includes("burner") ||

        name.includes("chamber") ||

        name.includes("flame")

    ) {

        return "combustion";

    }


    /* --------------------------------------------------------
       TURBINE
    -------------------------------------------------------- */

    if (

        name.includes("turbine") ||

        name.includes("turb") ||

        name.includes("hot_section")

    ) {

        return "turbine";

    }


    /* --------------------------------------------------------
       SHAFT
    -------------------------------------------------------- */

    if (

        name.includes("shaft") ||

        name.includes("axle") ||

        name.includes("spindle") ||

        name.includes("rotor")

    ) {

        return "shaft";

    }


    /* --------------------------------------------------------
       NOZZLE
    -------------------------------------------------------- */

    if (

        name.includes("nozzle") ||

        name.includes("exhaust") ||

        name.includes("jet_pipe") ||

        name.includes("tail")

    ) {

        return "nozzle";

    }


    /* --------------------------------------------------------
       CASING
    -------------------------------------------------------- */

    if (

        name.includes("casing") ||

        name.includes("case") ||

        name.includes("housing") ||

        name.includes("cover") ||

        name.includes("shell") ||

        name.includes("nacelle")

    ) {

        return "casing";

    }


    /* --------------------------------------------------------
       UNKNOWN
    -------------------------------------------------------- */

    return "unknown";

}


/* ============================================================
   21 — ANALYSE COMPLÈTE DU MOTEUR
============================================================ */

function analyzeEngineStructure() {

    if (!engine) {

        console.warn(
            "⚠️ Analyse impossible : moteur non chargé."
        );

        return;

    }


    /* --------------------------------------------------------
       RESET
    -------------------------------------------------------- */

    engineData.components = {

        fan: [],

        compressor: [],

        combustion: [],

        turbine: [],

        shaft: [],

        nozzle: [],

        casing: [],

        unknown: []

    };


    engineData.all = [];


    /* --------------------------------------------------------
       BOUNDING BOX
    -------------------------------------------------------- */

    const box =
        new THREE.Box3().setFromObject(
            engine
        );


    box.getCenter(
        engineData.bounds.center
    );


    box.getSize(
        engineData.bounds.size
    );


    engineData.bounds.min.copy(
        box.min
    );


    engineData.bounds.max.copy(
        box.max
    );


    /* --------------------------------------------------------
       PARCOURS DES MESHES
    -------------------------------------------------------- */

    engine.traverse(

        function(object) {

            if (
                !object.isMesh
            ) {

                return;

            }


            const category =
                classifyEnginePart(
                    object
                );


            /* ------------------------------------------------
               DONNÉES ORIGINALES
            ------------------------------------------------ */

            if (
                !object.userData.originalPosition
            ) {

                object.userData.originalPosition =
                    object.position.clone();

            }


            if (
                !object.userData.originalRotation
            ) {

                object.userData.originalRotation =
                    object.rotation.clone();

            }


            if (
                !object.userData.originalScale
            ) {

                object.userData.originalScale =
                    object.scale.clone();

            }


            /* ------------------------------------------------
               CATÉGORIE
            ------------------------------------------------ */

            object.userData.engineCategory =
                category;


            /* ------------------------------------------------
               FORCE DE SÉPARATION
            ------------------------------------------------ */

            object.userData.separationStrength =

                COMPONENT_CONFIG
                    .separationStrength[
                        category
                    ] ||

                COMPONENT_CONFIG
                    .separationStrength
                    .unknown;


            /* ------------------------------------------------
               COULEUR TECHNIQUE
            ------------------------------------------------ */

            object.userData.technicalColor =

                COMPONENT_CONFIG
                    .colors[
                        category
                    ] ||

                COMPONENT_CONFIG
                    .colors
                    .unknown;


            /* ------------------------------------------------
               POSITION MONDE
            ------------------------------------------------ */

            const worldPosition =
                new THREE.Vector3();


            object.getWorldPosition(
                worldPosition
            );


            object.userData.originalWorldPosition =
                worldPosition.clone();


            /* ------------------------------------------------
               AJOUT AUX DONNÉES
            ------------------------------------------------ */

            engineData.components[
                category
            ].push(
                object
            );


            engineData.all.push(
                object
            );

        }

    );


    console.log(
        "✓ Analyse du moteur terminée."
    );


    console.log(
        "Meshes détectés :",
        engineData.all.length
    );


    console.log(
        "Dimensions :",
        engineData.bounds.size
    );

}


/* ============================================================
   22 — CALCUL DE L'AXE DE SÉPARATION
   ------------------------------------------------------------
   Le moteur est généralement aligné sur son axe longitudinal.
   On utilise la position relative au centre du moteur.
============================================================ */

function calculateSeparationDirection(
    object
) {

    if (
        !object
    ) {

        return new THREE.Vector3(
            1,
            0,
            0
        );

    }


    const worldPosition =
        new THREE.Vector3();


    object.getWorldPosition(
        worldPosition
    );


    const direction =
        worldPosition
            .clone()
            .sub(
                engineData.bounds.center
            );


    /* --------------------------------------------------------
       Si la pièce est presque au centre
    -------------------------------------------------------- */

    if (
        direction.lengthSq() < 0.00001
    ) {

        return new THREE.Vector3(
            1,
            0,
            0
        );

    }


    direction.normalize();


    return direction;

}


/* ============================================================
   23 — PRÉPARATION DES VECTEURS D'EXPLOSION
============================================================ */

function prepareSeparationVectors() {

    if (
        !engineData.all.length
    ) {

        return;

    }


    engineData.all.forEach(

        function(object) {

            const direction =
                calculateSeparationDirection(
                    object
                );


            object.userData.separationDirection =
                direction;


            object.userData.separationOrigin =
                object.position.clone();


            object.userData.separationTarget =

                object.userData
                    .separationOrigin

                    .clone()

                    .add(

                        direction
                            .clone()
                            .multiplyScalar(

                                COMPONENT_CONFIG
                                    .separationDistance

                                *

                                object.userData
                                    .separationStrength

                            )

                    );

        }

    );


    console.log(
        "✓ Vecteurs de séparation calculés."
    );

}


/* ============================================================
   24 — CALCUL DES CENTRES DES SECTIONS
============================================================ */

function calculateSectionCenters() {

    const sections =
        Object.keys(
            engineData.components
        );


    sections.forEach(

        function(section) {

            const parts =
                engineData.components[
                    section
                ];


            if (
                !parts.length
            ) {

                return;

            }


            const center =
                new THREE.Vector3();


            parts.forEach(

                function(part) {

                    const position =
                        new THREE.Vector3();


                    part.getWorldPosition(
                        position
                    );


                    center.add(
                        position
                    );

                }

            );


            center.divideScalar(
                parts.length
            );


            parts.forEach(

                function(part) {

                    part.userData
                        .sectionCenter =
                        center.clone();

                }

            );

        }

    );


    console.log(
        "✓ Centres techniques calculés."
    );

}


/* ============================================================
   25 — PRÉPARATION DE LA VUE ÉCLATÉE
============================================================ */

function prepareExplodedView() {

    if (
        !engineData.all.length
    ) {

        return;

    }


    engineData.all.forEach(

        function(object) {

            /* -----------------------------------------------
               Position normale
            ----------------------------------------------- */

            object.userData
                .normalPosition =

                object.position.clone();


            /* -----------------------------------------------
               Position éclatée
            ----------------------------------------------- */

            object.userData
                .explodedPosition =

                object.userData
                    .separationTarget
                    .clone();


            /* -----------------------------------------------
               État de départ
            ----------------------------------------------- */

            object.position.copy(

                object.userData
                    .normalPosition

            );

        }

    );


    console.log(
        "✓ Vue éclatée préparée."
    );

}


/* ============================================================
   26 — FONCTION DE SÉPARATION
   ------------------------------------------------------------
   progress = 0
      moteur assemblé
============================================================

   progress = 1
      moteur éclaté
============================================================ */

function setEngineExplosion(
    progress
) {

    if (
        !engineData.all.length
    ) {

        return;

    }


    const value =
        THREE.MathUtils.clamp(
            progress,
            0,
            1
        );


    engineData.all.forEach(

        function(object) {

            if (
                !object.userData
                    .normalPosition ||

                !object.userData
                    .explodedPosition

            ) {

                return;

            }


            object.position.lerpVectors(

                object.userData
                    .normalPosition,

                object.userData
                    .explodedPosition,

                value

            );

        }

    );

}


/* ============================================================
   27 — SÉPARATION PAR SECTION
   ------------------------------------------------------------
   Permet à la future timeline GSAP de contrôler
   progressivement chaque zone du moteur.
============================================================ */

function setSectionExplosion(
    section,
    progress
) {

    const parts =
        engineData.components[
            section
        ];


    if (
        !parts ||
        !parts.length
    ) {

        return;

    }


    const value =
        THREE.MathUtils.clamp(
            progress,
            0,
            1
        );


    parts.forEach(

        function(object) {

            if (
                !object.userData
                    .normalPosition ||

                !object.userData
                    .explodedPosition

            ) {

                return;

            }


            object.position.lerpVectors(

                object.userData
                    .normalPosition,

                object.userData
                    .explodedPosition,

                value

            );

        }

    );

}


/* ============================================================
   28 — RETOUR À LA CONFIGURATION NORMALE
============================================================ */

function restoreEngineAssembly() {

    if (
        !engineData.all.length
    ) {

        return;

    }


    engineData.all.forEach(

        function(object) {

            if (
                object.userData
                    .normalPosition
            ) {

                object.position.copy(

                    object.userData
                        .normalPosition

                );

            }

        }

    );

}


/* ============================================================
   29 — ANALYSE DES ANIMATIONS GLB
============================================================ */

function inspectEngineAnimations() {

    if (!mixer) {

        console.log(
            "ℹ️ Aucun AnimationMixer actif."
        );

        return;

    }


    console.log(
        "✓ AnimationMixer disponible."
    );


    console.log(
        "Les animations natives du GLB sont pilotées " +
        "par l'AnimationMixer de la PARTIE 1."
    );

}


/* ============================================================
   30 — ROTATION TECHNIQUE
   ------------------------------------------------------------
   Cette fonction ne crée PAS une deuxième animation.
   La PARTIE 3 pourra l'utiliser depuis la timeline unique.
============================================================ */

function setEngineTechnicalRotation(
    progress
) {

    if (
        !engineRoot
    ) {

        return;

    }


    const value =
        THREE.MathUtils.clamp(
            progress,
            0,
            1
        );


    engineRoot.rotation.y =

        ENGINE_CONFIG
            .modelRotation
            .y

        +

        (
            Math.PI * 0.35
            *
            value
        );

}


/* ============================================================
   31 — LÉGÈRE INCLINAISON TECHNIQUE
============================================================ */

function setEngineTechnicalTilt(
    progress
) {

    if (
        !engineRoot
    ) {

        return;

    }


    const value =
        THREE.MathUtils.clamp(
            progress,
            0,
            1
        );


    engineRoot.rotation.x =

        ENGINE_CONFIG
            .modelRotation
            .x

        +

        (
            Math.PI * 0.04
            *
            value
        );

}


/* ============================================================
   32 — VÉRIFICATION DES COMPOSANTS
============================================================ */

function inspectEngineComponents() {

    if (
        !engineData.all.length
    ) {

        console.warn(
            "⚠️ Aucun mesh détecté."
        );

        return;

    }


    console.group(
        "✈️ ENGINE COMPONENT ANALYSIS"
    );


    Object.keys(
        engineData.components
    ).forEach(

        function(section) {

            console.log(

                section.toUpperCase() +
                ":",

                engineData
                    .components[
                        section
                    ].length

            );

        }

    );


    console.groupEnd();

}


/* ============================================================
   33 — DONNÉES TECHNIQUES GÉNÉRALES
============================================================ */

function getEngineTechnicalData() {

    return {

        meshCount:
            engineData.all.length,

        dimensions: {

            x:
                engineData.bounds
                    .size.x,

            y:
                engineData.bounds
                    .size.y,

            z:
                engineData.bounds
                    .size.z

        },

        center: {

            x:
                engineData.bounds
                    .center.x,

            y:
                engineData.bounds
                    .center.y,

            z:
                engineData.bounds
                    .center.z

        },

        components:
            engineData.components

    };

}


/* ============================================================
   34 — FINALISATION DE LA PARTIE 2
   ------------------------------------------------------------
   Cette fonction est appelée par la PARTIE 1 après le
   chargement du GLB.
============================================================ */

function finalizeEngineSetup() {

    if (
        !engine
    ) {

        console.warn(
            "⚠️ finalizeEngineSetup : moteur absent."
        );

        return;

    }


    /* --------------------------------------------------------
       Analyse
    -------------------------------------------------------- */

    analyzeEngineStructure();


    /* --------------------------------------------------------
       Vecteurs
    -------------------------------------------------------- */

    prepareSeparationVectors();


    /* --------------------------------------------------------
       Centres
    -------------------------------------------------------- */

    calculateSectionCenters();


    /* --------------------------------------------------------
       Vue éclatée
    -------------------------------------------------------- */

    prepareExplodedView();


    /* --------------------------------------------------------
       Animations
    -------------------------------------------------------- */

    inspectEngineAnimations();


    /* --------------------------------------------------------
       Inspection
    -------------------------------------------------------- */

    inspectEngineComponents();


    console.log(
        "✓ PARTIE 2 — préparation technique terminée."
    );

}


/* ============================================================
   35 — EXPOSITION DES DONNÉES
   ------------------------------------------------------------
   Ces références seront utiles aux autres parties sans
   recréer de nouvelles variables Three.js.
============================================================ */

window.JetEngineExperience = {

    getTechnicalData:
        getEngineTechnicalData,

    explode:
        setEngineExplosion,

    explodeSection:
        setSectionExplosion,

    restore:
        restoreEngineAssembly,

    technicalRotation:
        setEngineTechnicalRotation,

    technicalTilt:
        setEngineTechnicalTilt

};


/* ============================================================
   36 — FIN PARTIE 2 / 4
============================================================ */

/* ============================================================
   JET ENGINE EXPERIENCE
   SCRIPT.JS — PARTIE 3 / 4
   ------------------------------------------------------------
   SCROLL STORYTELLING ENGINE
   ------------------------------------------------------------
   ✓ UNE seule timeline GSAP
   ✓ UN seul ScrollTrigger
   ✓ Utilise le moteur déjà chargé en PARTIE 1
   ✓ Utilise les pièces préparées en PARTIE 2
   ✓ Rotation progressive
   ✓ Accélération visuelle
   ✓ Vue éclatée
   ✓ Révélation interne
   ✓ Mouvement caméra
   ✓ Aucun deuxième renderer
   ✓ Aucun deuxième GLB
   ✓ Aucune deuxième boucle render
============================================================ */


/* ============================================================
   37 — CONFIGURATION DU STORYTELLING
============================================================ */

const SCROLL_CONFIG = {

    /* --------------------------------------------------------
       Section de scroll
       --------------------------------------------------------
       Le script cherche d'abord #engine puis .engine-section.
       Si aucun des deux n'existe, il utilise body.
    -------------------------------------------------------- */

    triggerSelectors: [
        "#engine",
        ".engine-section",
        "#aircraft-scene",
        "body"
    ],


    /* --------------------------------------------------------
       Durée virtuelle du storytelling
    -------------------------------------------------------- */

    start:
        "top top",

    end:
        "bottom bottom",


    /* --------------------------------------------------------
       Fluidité
    -------------------------------------------------------- */

    scrub:
        1.5,


    /* --------------------------------------------------------
       Rotation moteur
    -------------------------------------------------------- */

    rotation: {

        start:
            ENGINE_CONFIG.modelRotation.y,

        end:
            ENGINE_CONFIG.modelRotation.y +
            Math.PI * 2.0

    },


    /* --------------------------------------------------------
       Caméra
    -------------------------------------------------------- */

    camera: {

        start: {

            x: 4.2,

            y: 1.8,

            z: 6.8

        },

        inspection: {

            x: 3.1,

            y: 1.55,

            z: 5.0

        },

        internal: {

            x: 2.25,

            y: 1.25,

            z: 4.25

        },

        final: {

            x: 3.8,

            y: 2.15,

            z: 5.7

        }

    },


    /* --------------------------------------------------------
       Point regardé par la caméra
    -------------------------------------------------------- */

    target: {

        start: {

            x: 0,

            y: 0,

            z: 0

        },

        inspection: {

            x: 0,

            y: 0.1,

            z: 0

        },

        internal: {

            x: 0,

            y: 0,

            z: 0

        },

        final: {

            x: 0,

            y: 0,

            z: 0

        }

    }

};


/* ============================================================
   38 — VARIABLES DE SCROLL
============================================================ */

const scrollState = {

    progress:
        0,

    velocity:
        0,

    engineSpeed:
        0,

    explosion:
        0,

    cameraProgress:
        0

};


/* ============================================================
   39 — TARGET DE CAMÉRA
   ------------------------------------------------------------
   Ces vecteurs sont réutilisés.
   Aucun objet Three.js supplémentaire n'est créé pendant
   chaque frame.
============================================================ */

const cameraTarget =
    new THREE.Vector3();


const cameraPositionTarget =
    new THREE.Vector3();


/* ============================================================
   40 — RÉSOLUTION DU TRIGGER
============================================================ */

function getScrollTriggerElement() {

    for (
        let i = 0;
        i < SCROLL_CONFIG
            .triggerSelectors
            .length;
        i++
    ) {

        const element =
            document.querySelector(
                SCROLL_CONFIG
                    .triggerSelectors[i]
            );


        if (element) {

            return element;

        }

    }


    return document.body;

}


/* ============================================================
   41 — INTERPOLATION CAMÉRA
============================================================ */

function updateCameraPosition(
    progress
) {

    if (!camera) {

        return;

    }


    const value =
        THREE.MathUtils.clamp(
            progress,
            0,
            1
        );


    /* --------------------------------------------------------
       PHASE 1
       0 → 35 %
    -------------------------------------------------------- */

    if (
        value <= 0.35
    ) {

        const local =
            THREE.MathUtils.mapLinear(
                value,
                0,
                0.35,
                0,
                1
            );


        cameraPositionTarget.set(

            THREE.MathUtils.lerp(
                SCROLL_CONFIG
                    .camera
                    .start
                    .x,

                SCROLL_CONFIG
                    .camera
                    .inspection
                    .x,

                local

            ),

            THREE.MathUtils.lerp(
                SCROLL_CONFIG
                    .camera
                    .start
                    .y,

                SCROLL_CONFIG
                    .camera
                    .inspection
                    .y,

                local

            ),

            THREE.MathUtils.lerp(
                SCROLL_CONFIG
                    .camera
                    .start
                    .z,

                SCROLL_CONFIG
                    .camera
                    .inspection
                    .z,

                local

            )

        );

    }


    /* --------------------------------------------------------
       PHASE 2
       35 → 70 %
    -------------------------------------------------------- */

    else if (
        value <= 0.70
    ) {

        const local =
            THREE.MathUtils.mapLinear(
                value,
                0.35,
                0.70,
                0,
                1
            );


        cameraPositionTarget.set(

            THREE.MathUtils.lerp(
                SCROLL_CONFIG
                    .camera
                    .inspection
                    .x,

                SCROLL_CONFIG
                    .camera
                    .internal
                    .x,

                local

            ),

            THREE.MathUtils.lerp(
                SCROLL_CONFIG
                    .camera
                    .inspection
                    .y,

                SCROLL_CONFIG
                    .camera
                    .internal
                    .y,

                local

            ),

            THREE.MathUtils.lerp(
                SCROLL_CONFIG
                    .camera
                    .inspection
                    .z,

                SCROLL_CONFIG
                    .camera
                    .internal
                    .z,

                local

            )

        );

    }


    /* --------------------------------------------------------
       PHASE 3
       70 → 100 %
    -------------------------------------------------------- */

    else {

        const local =
            THREE.MathUtils.mapLinear(
                value,
                0.70,
                1,
                0,
                1
            );


        cameraPositionTarget.set(

            THREE.MathUtils.lerp(
                SCROLL_CONFIG
                    .camera
                    .internal
                    .x,

                SCROLL_CONFIG
                    .camera
                    .final
                    .x,

                local

            ),

            THREE.MathUtils.lerp(
                SCROLL_CONFIG
                    .camera
                    .internal
                    .y,

                SCROLL_CONFIG
                    .camera
                    .final
                    .y,

                local

            ),

            THREE.MathUtils.lerp(
                SCROLL_CONFIG
                    .camera
                    .internal
                    .z,

                SCROLL_CONFIG
                    .camera
                    .final
                    .z,

                local

            )

        );

    }


    camera.position.copy(
        cameraPositionTarget
    );

}


/* ============================================================
   42 — CIBLE CAMÉRA
============================================================ */

function updateCameraTarget(
    progress
) {

    if (!camera) {

        return;

    }


    const value =
        THREE.MathUtils.clamp(
            progress,
            0,
            1
        );


    if (
        value <= 0.35
    ) {

        const local =
            THREE.MathUtils.mapLinear(
                value,
                0,
                0.35,
                0,
                1
            );


        cameraTarget.set(

            THREE.MathUtils.lerp(
                SCROLL_CONFIG
                    .target
                    .start
                    .x,

                SCROLL_CONFIG
                    .target
                    .inspection
                    .x,

                local

            ),

            THREE.MathUtils.lerp(
                SCROLL_CONFIG
                    .target
                    .start
                    .y,

                SCROLL_CONFIG
                    .target
                    .inspection
                    .y,

                local

            ),

            THREE.MathUtils.lerp(
                SCROLL_CONFIG
                    .target
                    .start
                    .z,

                SCROLL_CONFIG
                    .target
                    .inspection
                    .z,

                local

            )

        );

    }


    else if (
        value <= 0.70
    ) {

        const local =
            THREE.MathUtils.mapLinear(
                value,
                0.35,
                0.70,
                0,
                1
            );


        cameraTarget.set(

            THREE.MathUtils.lerp(
                SCROLL_CONFIG
                    .target
                    .inspection
                    .x,

                SCROLL_CONFIG
                    .target
                    .internal
                    .x,

                local

            ),

            THREE.MathUtils.lerp(
                SCROLL_CONFIG
                    .target
                    .inspection
                    .y,

                SCROLL_CONFIG
                    .target
                    .internal
                    .y,

                local

            ),

            THREE.MathUtils.lerp(
                SCROLL_CONFIG
                    .target
                    .inspection
                    .z,

                SCROLL_CONFIG
                    .target
                    .internal
                    .z,

                local

            )

        );

    }


    else {

        const local =
            THREE.MathUtils.mapLinear(
                value,
                0.70,
                1,
                0,
                1
            );


        cameraTarget.set(

            THREE.MathUtils.lerp(
                SCROLL_CONFIG
                    .target
                    .internal
                    .x,

                SCROLL_CONFIG
                    .target
                    .final
                    .x,

                local

            ),

            THREE.MathUtils.lerp(
                SCROLL_CONFIG
                    .target
                    .internal
                    .y,

                SCROLL_CONFIG
                    .target
                    .final
                    .y,

                local

            ),

            THREE.MathUtils.lerp(
                SCROLL_CONFIG
                    .target
                    .internal
                    .z,

                SCROLL_CONFIG
                    .target
                    .final
                    .z,

                local

            )

        );

    }


    camera.lookAt(
        cameraTarget
    );

}


/* ============================================================
   43 — ANIMATION DU MOTEUR
============================================================ */

function updateEngineAnimation(
    progress
) {

    if (!engineRoot) {

        return;

    }


    const value =
        THREE.MathUtils.clamp(
            progress,
            0,
            1
        );


    /* --------------------------------------------------------
       ROTATION GÉNÉRALE
    -------------------------------------------------------- */

    engineRoot.rotation.y =

        THREE.MathUtils.lerp(

            SCROLL_CONFIG
                .rotation
                .start,

            SCROLL_CONFIG
                .rotation
                .end,

            value

        );


    /* --------------------------------------------------------
       INCLINAISON CINÉMATIQUE
    -------------------------------------------------------- */

    engineRoot.rotation.x =

        ENGINE_CONFIG
            .modelRotation
            .x

        +

        (
            Math.sin(
                value * Math.PI
            )
            *
            0.055
        );


    /* --------------------------------------------------------
       LÉGER MOUVEMENT VERTICAL
    -------------------------------------------------------- */

    engineRoot.position.y =

        ENGINE_CONFIG
            .modelPosition
            .y

        +

        (
            Math.sin(
                value * Math.PI
            )
            *
            0.035
        );

}


/* ============================================================
   44 — VITESSE DU MOTEUR
   ------------------------------------------------------------
   La vitesse est une valeur visuelle.
   Elle ne prétend pas représenter une mesure physique réelle.
============================================================ */

function updateEngineSpeed(
    progress
) {

    const value =
        THREE.MathUtils.clamp(
            progress,
            0,
            1
        );


    /* --------------------------------------------------------
       Courbe d'accélération
    -------------------------------------------------------- */

    const acceleration =
        THREE.MathUtils.pow(
            value,
            0.62
        );


    scrollState.engineSpeed =

        THREE.MathUtils.lerp(

            0.15,

            1,

            acceleration

        );


    /* --------------------------------------------------------
       Animation native du GLB
    -------------------------------------------------------- */

    if (mixer) {

        mixer.timeScale =

            THREE.MathUtils.lerp(

                0.35,

                3.25,

                scrollState.engineSpeed

            );

    }

}


/* ============================================================
   45 — SÉPARATION DES PIÈCES
============================================================ */

function updateEngineExplosion(
    progress
) {

    const value =
        THREE.MathUtils.clamp(
            progress,
            0,
            1
        );


    /* --------------------------------------------------------
       0 → 20 %
       Moteur presque assemblé
    -------------------------------------------------------- */

    if (
        value <= 0.20
    ) {

        setEngineExplosion(
            0
        );

        return;

    }


    /* --------------------------------------------------------
       20 → 45 %
       Première ouverture
    -------------------------------------------------------- */

    if (
        value <= 0.45
    ) {

        const local =
            THREE.MathUtils.mapLinear(
                value,
                0.20,
                0.45,
                0,
                0.45
            );


        setEngineExplosion(
            local
        );


        return;

    }


    /* --------------------------------------------------------
       45 → 75 %
       Vue éclatée principale
    -------------------------------------------------------- */

    if (
        value <= 0.75
    ) {

        const local =
            THREE.MathUtils.mapLinear(
                value,
                0.45,
                0.75,
                0.45,
                0.82
            );


        setEngineExplosion(
            local
        );


        return;

    }


    /* --------------------------------------------------------
       75 → 100 %
       Ouverture maximale
    -------------------------------------------------------- */

    const local =
        THREE.MathUtils.mapLinear(
            value,
            0.75,
            1,
            0.82,
            1
        );


    setEngineExplosion(
        local
    );

}


/* ============================================================
   46 — ROTATION VISUELLE DES PIÈCES MOBILES
   ------------------------------------------------------------
   Si les noms des meshes indiquent une turbine, fan,
   compressor ou rotor, on ajoute une rotation visuelle.
============================================================ */

function updateRotatingComponents(
    progress
) {

    if (
        !engineData ||
        !engineData.all
    ) {

        return;

    }


    const value =
        THREE.MathUtils.clamp(
            progress,
            0,
            1
        );


    const rotationAmount =

        value *

        Math.PI *

        14;


    engineData.all.forEach(

        function(object) {

            const category =
                object.userData
                    .engineCategory;


            if (
                category === "fan" ||
                category === "compressor" ||
                category === "turbine" ||
                category === "shaft"
            ) {

                const originalRotation =

                    object.userData
                        .originalRotation;


                if (
                    !originalRotation
                ) {

                    return;

                }


                object.rotation.x =

                    originalRotation.x;


                object.rotation.y =

                    originalRotation.y;


                object.rotation.z =

                    originalRotation.z

                    +

                    rotationAmount;

            }

        }

    );

}


/* ============================================================
   47 — PHASE TECHNIQUE
============================================================ */

function updateTechnicalPhases(
    progress
) {

    const value =
        THREE.MathUtils.clamp(
            progress,
            0,
            1
        );


    /* --------------------------------------------------------
       PHASE 1
       Présentation extérieure
    -------------------------------------------------------- */

    if (
        value < 0.20
    ) {

        setSectionExplosion(
            "casing",
            0
        );


        setSectionExplosion(
            "fan",
            0
        );

    }


    /* --------------------------------------------------------
       PHASE 2
       Compresseur
    -------------------------------------------------------- */

    else if (
        value < 0.40
    ) {

        const local =
            THREE.MathUtils.mapLinear(
                value,
                0.20,
                0.40,
                0,
                0.7
            );


        setSectionExplosion(
            "casing",
            local
        );


        setSectionExplosion(
            "compressor",
            local
        );


        setSectionExplosion(
            "fan",
            local * 0.7
        );

    }


    /* --------------------------------------------------------
       PHASE 3
       Chambre de combustion
    -------------------------------------------------------- */

    else if (
        value < 0.60
    ) {

        const local =
            THREE.MathUtils.mapLinear(
                value,
                0.40,
                0.60,
                0.25,
                0.85
            );


        setSectionExplosion(
            "combustion",
            local
        );


        setSectionExplosion(
            "compressor",
            local * 0.75
        );


        setSectionExplosion(
            "turbine",
            local * 0.65
        );

    }


    /* --------------------------------------------------------
       PHASE 4
       Turbine + shaft
    -------------------------------------------------------- */

    else if (
        value < 0.80
    ) {

        const local =
            THREE.MathUtils.mapLinear(
                value,
                0.60,
                0.80,
                0.5,
                1
            );


        setSectionExplosion(
            "turbine",
            local
        );


        setSectionExplosion(
            "shaft",
            local
        );


        setSectionExplosion(
            "combustion",
            local
        );

    }


    /* --------------------------------------------------------
       PHASE 5
       Vue éclatée finale
    -------------------------------------------------------- */

    else {

        setSectionExplosion(
            "nozzle",
            1
        );


        setSectionExplosion(
            "turbine",
            1
        );


        setSectionExplosion(
            "shaft",
            1
        );


        setSectionExplosion(
            "combustion",
            1
        );


        setSectionExplosion(
            "compressor",
            1
        );

    }

}


/* ============================================================
   48 — EFFET CINÉMATIQUE DE PROFONDEUR
============================================================ */

function updateDepthEffect(
    progress
) {

    if (
        !engineRoot
    ) {

        return;

    }


    const value =
        THREE.MathUtils.clamp(
            progress,
            0,
            1
        );


    const scale =
        THREE.MathUtils.lerp(
            1,
            1.06,
            Math.sin(
                value * Math.PI
            )
        );


    engineRoot.scale.setScalar(
        ENGINE_CONFIG.modelScale *
        scale
    );

}


/* ============================================================
   49 — MISE À JOUR UNIQUE DU STORYTELLING
   ------------------------------------------------------------
   Toutes les transformations pilotées par le scroll
   passent par cette fonction.
============================================================ */

function updateEngineExperience(
    progress
) {

    scrollProgress =
        THREE.MathUtils.clamp(
            progress,
            0,
            1
        );


    scrollState.progress =
        scrollProgress;


    /* --------------------------------------------------------
       Caméra
    -------------------------------------------------------- */

    updateCameraPosition(
        scrollProgress
    );


    updateCameraTarget(
        scrollProgress
    );


    /* --------------------------------------------------------
       Moteur
    -------------------------------------------------------- */

    updateEngineAnimation(
        scrollProgress
    );


    /* --------------------------------------------------------
       Accélération
    -------------------------------------------------------- */

    updateEngineSpeed(
        scrollProgress
    );


    /* --------------------------------------------------------
       Vue éclatée
    -------------------------------------------------------- */

    updateEngineExplosion(
        scrollProgress
    );


    /* --------------------------------------------------------
       Sections techniques
    -------------------------------------------------------- */

    updateTechnicalPhases(
        scrollProgress
    );


    /* --------------------------------------------------------
       Pièces mobiles
    -------------------------------------------------------- */

    updateRotatingComponents(
        scrollProgress
    );


    /* --------------------------------------------------------
       Profondeur
    -------------------------------------------------------- */

    updateDepthEffect(
        scrollProgress
    );

}


/* ============================================================
   50 — CRÉATION DE LA TIMELINE UNIQUE
   ------------------------------------------------------------
   IMPORTANT :
   Cette fonction crée UNE SEULE timeline.
============================================================ */

function createScrollExperience() {

    /* --------------------------------------------------------
       Éviter une deuxième initialisation
    -------------------------------------------------------- */

    if (
        scrollTimeline
    ) {

        console.warn(
            "⚠️ ScrollTimeline existe déjà."
        );

        return;

    }


    if (
        typeof gsap ===
        "undefined"
    ) {

        console.error(
            "❌ GSAP n'est pas disponible."
        );

        return;

    }


    if (
        typeof ScrollTrigger ===
        "undefined"
    ) {

        console.error(
            "❌ ScrollTrigger n'est pas disponible."
        );

        return;

    }


    if (
        !engineRoot ||
        !engineLoaded
    ) {

        console.warn(
            "⚠️ Le moteur n'est pas encore chargé."
        );

        return;

    }


    /* ========================================================
       TRIGGER UNIQUE
    ======================================================== */

    const trigger =
        getScrollTriggerElement();


    /* ========================================================
       PROXY DE PROGRESSION
       --------------------------------------------------------
       Un simple objet permet à GSAP d'animer une seule valeur
       0 → 1. Cette valeur devient le scénario du moteur.
    ======================================================== */

    const story =
        {

            progress:
                0

        };


    /* ========================================================
       TIMELINE UNIQUE
    ======================================================== */

    scrollTimeline =

        gsap.timeline({

            defaults: {

                ease:
                    "none"

            },

            scrollTrigger: {

                trigger:
                    trigger,

                start:
                    SCROLL_CONFIG.start,

                end:
                    SCROLL_CONFIG.end,

                scrub:
                    SCROLL_CONFIG.scrub,

                invalidateOnRefresh:
                    true,

                onUpdate:
                    function(self) {

                        scrollState.velocity =
                            self.getVelocity();


                        scrollState.progress =
                            self.progress;

                    }

            }

        });


    /* ========================================================
       UNE SEULE ANIMATION DE PROGRESSION
    ======================================================== */

    scrollTimeline.to(

        story,

        {

            progress:
                1,

            duration:
                1,

            ease:
                "none",

            onUpdate:
                function() {

                    updateEngineExperience(
                        story.progress
                    );

                }

        }

    );


    /* ========================================================
       POSITION INITIALE
    ======================================================== */

    updateEngineExperience(
        0
    );


    console.log(
        "✓ UNE seule timeline GSAP créée."
    );


    console.log(
        "✓ UNE seul ScrollTrigger créé."
    );

}


/* ============================================================
   51 — API PUBLIQUE DU STORYTELLING
   ------------------------------------------------------------
   Permet à la PARTIE 4 d'accéder à l'état sans créer
   un deuxième système d'animation.
============================================================ */

window.JetEngineExperience =

    window.JetEngineExperience || {};


window.JetEngineExperience.scroll = {

    getProgress:
        function() {

            return scrollProgress;

        },

    getVelocity:
        function() {

            return scrollState.velocity;

        },

    getEngineSpeed:
        function() {

            return scrollState.engineSpeed;

        },

    refresh:
        function() {

            if (
                scrollTimeline
            ) {

                ScrollTrigger.refresh();

            }

        }

    };


/* ============================================================
   52 — MESSAGE FINAL
============================================================ */

console.log(
    "✓ PARTIE 3 — Scroll Storytelling prête."
);


/* ============================================================
   FIN PARTIE 3 / 4
============================================================ */

/* ============================================================
   JET ENGINE EXPERIENCE
   SCRIPT.JS — PARTIE 4 / 4 — FINALISATION
   ------------------------------------------------------------
   INTERFACE PREMIUM / HUD / NAVIGATION / RESPONSIVE
   ------------------------------------------------------------
   ✓ Compatible avec PARTIE 1
   ✓ Compatible avec PARTIE 2
   ✓ Compatible avec PARTIE 3
   ✓ Aucun nouveau renderer
   ✓ Aucun nouveau GLB
   ✓ Aucun nouveau ScrollTrigger
   ✓ Aucun nouveau requestAnimationFrame
   ✓ HUD technique
   ✓ Menu burger futuriste
   ✓ Navigation smooth
   ✓ Responsive
   ✓ Indicateur de progression
   ✓ Données techniques
============================================================ */


/* ============================================================
   53 — CONFIGURATION INTERFACE
============================================================ */

const UI_CONFIG = {

    menuBreakpoint:
        900,

    scrollOffset:
        0,

    animationDuration:
        0.45,

    technicalUnits:
        "mm",

    brand:
        "AERO ENGINEERING"

};


/* ============================================================
   54 — RÉFÉRENCES DOM
============================================================ */

const UI = {

    menuToggle:
        document.getElementById(
            "menu-toggle"
        ),

    navigation:
        document.querySelector(
            ".nav-menu"
        ),

    navigationLinks:
        document.querySelectorAll(
            "a[href^='#']"
        ),

    progressBar:
        document.querySelector(
            ".scroll-progress"
        ),

    progressValue:
        document.querySelector(
            ".progress-value"
        ),

    engineStatus:
        document.querySelector(
            ".engine-status"
        ),

    engineSpeed:
        document.querySelector(
            ".engine-speed"
        ),

    componentCount:
        document.querySelector(
            ".component-count"
        ),

    engineDimensions:
        document.querySelector(
            ".engine-dimensions"
        ),

    loadingScreen:
        document.querySelector(
            ".loading-screen"
        )

};


/* ============================================================
   55 — MENU BURGER
============================================================ */

let menuOpen =
    false;


/* ============================================================
   OUVRIR / FERMER LE MENU
============================================================ */

function toggleNavigation() {

    if (
        !UI.menuToggle
    ) {

        return;

    }


    menuOpen =
        !menuOpen;


    UI.menuToggle
        .setAttribute(

            "aria-expanded",

            String(
                menuOpen
            )

        );


    UI.menuToggle
        .classList
        .toggle(

            "active",

            menuOpen

        );


    if (
        UI.navigation
    ) {

        UI.navigation
            .classList
            .toggle(

                "active",

                menuOpen

            );

    }


    document.body
        .classList
        .toggle(

            "menu-open",

            menuOpen

        );

}


/* ============================================================
   ÉCOUTEUR UNIQUE DU MENU
============================================================ */

if (
    UI.menuToggle
) {

    UI.menuToggle.addEventListener(

        "click",

        toggleNavigation

    );

}


/* ============================================================
   FERMETURE DU MENU AVEC ESC
============================================================ */

document.addEventListener(

    "keydown",

    function(event) {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        if (
            !menuOpen
        ) {

            return;

        }


        toggleNavigation();

    }

);


/* ============================================================
   56 — NAVIGATION SMOOTH
============================================================ */

UI.navigationLinks.forEach(

    function(link) {

        link.addEventListener(

            "click",

            function(event) {

                const href =
                    link.getAttribute(
                        "href"
                    );


                if (
                    !href ||
                    href === "#"
                ) {

                    return;

                }


                const target =
                    document.querySelector(
                        href
                    );


                if (
                    !target
                ) {

                    return;

                }


                event.preventDefault();


                const top =
                    target.getBoundingClientRect()
                        .top

                    +

                    window.scrollY

                    -

                    UI_CONFIG
                        .scrollOffset;


                window.scrollTo({

                    top:

                        top,

                    behavior:
                        "smooth"

                });


                /* --------------------------------------------
                   Fermer le menu après navigation
                -------------------------------------------- */

                if (
                    menuOpen
                ) {

                    toggleNavigation();

                }

            }

        );

    }

);


/* ============================================================
   57 — INDICATEUR DE PROGRESSION
============================================================ */

function updateProgressUI(
    progress
) {

    const value =
        THREE.MathUtils.clamp(
            progress,
            0,
            1
        );


    const percent =
        Math.round(
            value * 100
        );


    if (
        UI.progressBar
    ) {

        UI.progressBar.style
            .transform =

            `scaleX(${value})`;

    }


    if (
        UI.progressValue
    ) {

        UI.progressValue.textContent =
            `${percent}%`;

    }

}


/* ============================================================
   58 — DONNÉES TECHNIQUES
============================================================ */

function updateTechnicalUI() {

    if (
        !window.JetEngineExperience
    ) {

        return;

    }


    if (
        typeof
        window.JetEngineExperience
            .getTechnicalData !==
        "function"
    ) {

        return;

    }


    const data =

        window.JetEngineExperience
            .getTechnicalData();


    /* --------------------------------------------------------
       NOMBRE DE MESHES
    -------------------------------------------------------- */

    if (
        UI.componentCount
    ) {

        UI.componentCount.textContent =

            String(
                data.meshCount
            );

    }


    /* --------------------------------------------------------
       DIMENSIONS
    -------------------------------------------------------- */

    if (
        UI.engineDimensions &&
        data.dimensions
    ) {

        const x =
            data.dimensions.x
                .toFixed(1);


        const y =
            data.dimensions.y
                .toFixed(1);


        const z =
            data.dimensions.z
                .toFixed(1);


        UI.engineDimensions
            .textContent =

            `${x} × ${y} × ${z}`;

    }

}


/* ============================================================
   59 — STATUT DU MOTEUR
============================================================ */

function updateEngineStatus() {

    if (
        !UI.engineStatus
    ) {

        return;

    }


    if (
        engineLoaded
    ) {

        UI.engineStatus.textContent =
            "SYSTEM ONLINE";


        UI.engineStatus
            .classList
            .add(
                "online"
            );

    }

    else {

        UI.engineStatus.textContent =
            "LOADING ENGINE";


        UI.engineStatus
            .classList
            .remove(
                "online"
            );

    }

}


/* ============================================================
   60 — AFFICHAGE DE LA VITESSE VISUELLE
============================================================ */

function updateEngineSpeedUI() {

    if (
        !UI.engineSpeed
    ) {

        return;

    }


    const speed =
        scrollState.engineSpeed;


    const percentage =
        Math.round(
            speed * 100
        );


    UI.engineSpeed.textContent =

        `${percentage}%`;

}


/* ============================================================
   61 — MISE À JOUR DU HUD
   ------------------------------------------------------------
   Le HUD utilise la progression déjà calculée par la
   timeline unique de la PARTIE 3.
============================================================ */

function updateHUD() {

    if (
        !window.JetEngineExperience
    ) {

        return;

    }


    if (
        !window.JetEngineExperience.scroll
    ) {

        return;

    }


    const progress =

        window.JetEngineExperience
            .scroll
            .getProgress();


    updateProgressUI(
        progress
    );


    updateEngineSpeedUI();


    updateEngineStatus();

}


/* ============================================================
   62 — BOUCLE LÉGÈRE DU HUD
   ------------------------------------------------------------
   IMPORTANT :
   Ceci n'est PAS une deuxième boucle Three.js.
   Elle sert uniquement à synchroniser l'interface.
   Aucun renderer n'est utilisé ici.
============================================================ */

let hudSyncActive =
    true;


function syncHUD() {

    if (
        !hudSyncActive
    ) {

        return;

    }


    updateHUD();

    updateTechnicalUI();


    requestAnimationFrame(
        syncHUD
    );

}


/* ============================================================
   63 — INITIALISATION DU HUD
============================================================ */

updateTechnicalUI();

updateEngineStatus();

syncHUD();


/* ============================================================
   64 — LOADING SCREEN
============================================================ */

function hideLoadingScreen() {

    if (
        !UI.loadingScreen
    ) {

        return;

    }


    UI.loadingScreen
        .classList
        .add(
            "loaded"
        );


    gsap.to(

        UI.loadingScreen,

        {

            opacity:
                0,

            duration:
                0.7,

            delay:
                0.15,

            ease:
                "power2.out",

            onComplete:
                function() {

                    UI.loadingScreen
                        .style
                        .display =
                        "none";

                }

        }

    );

}


/* ============================================================
   65 — ATTENTE DU CHARGEMENT DU GLB
============================================================ */

function waitForEngine() {

    if (
        engineLoaded
    ) {

        hideLoadingScreen();

        return;

    }


    window.setTimeout(

        waitForEngine,

        100

    );

}


waitForEngine();


/* ============================================================
   66 — RESPONSIVE ENGINE
============================================================ */

function updateResponsiveEngine() {

    if (
        !camera ||
        !engineRoot
    ) {

        return;

    }


    const width =
        window.innerWidth;


    /* --------------------------------------------------------
       MOBILE
    -------------------------------------------------------- */

    if (
        width <= 600
    ) {

        camera.fov =
            39;


        camera.position.z =
            7.8;


        engineRoot.scale.setScalar(

            ENGINE_CONFIG
                .modelScale *

            0.72

        );

    }


    /* --------------------------------------------------------
       TABLET
    -------------------------------------------------------- */

    else if (
        width <= 1024
    ) {

        camera.fov =
            37;


        camera.position.z =
            7.2;


        engineRoot.scale.setScalar(

            ENGINE_CONFIG
                .modelScale *

            0.86

        );

    }


    /* --------------------------------------------------------
       DESKTOP
    -------------------------------------------------------- */

    else {

        camera.fov =
            ENGINE_CONFIG
                .camera
                .fov;


        camera.position.z =
            ENGINE_CONFIG
                .camera
                .position
                .z;

    }


    camera.updateProjectionMatrix();

}


/* ============================================================
   67 — RESPONSIVE UNIQUE
============================================================ */

window.addEventListener(

    "resize",

    function() {

        updateResponsiveEngine();

    },

    {
        passive:
            true
    }

);


updateResponsiveEngine();


/* ============================================================
   68 — DÉTECTION TOUCH
============================================================ */

const isTouchDevice =

    "ontouchstart" in
    window ||

    navigator.maxTouchPoints > 0;


if (
    isTouchDevice
) {

    document.body
        .classList
        .add(
            "touch-device"
        );

}


/* ============================================================
   69 — NAVBAR AU SCROLL
   ------------------------------------------------------------
   Le navbar peut disparaître lorsque l'utilisateur descend
   et revenir lorsqu'il remonte.
============================================================ */

const navbar =
    document.querySelector(
        ".navbar"
    );


let previousScrollY =
    window.scrollY;


let navbarTicking =
    false;


function updateNavbar() {

    if (
        !navbar
    ) {

        return;

    }


    const currentScrollY =
        window.scrollY;


    if (
        currentScrollY <= 40
    ) {

        navbar.classList
            .remove(
                "nav-hidden"
            );

    }


    else if (
        currentScrollY >
        previousScrollY
    ) {

        navbar.classList
            .add(
                "nav-hidden"
            );

    }


    else {

        navbar.classList
            .remove(
                "nav-hidden"
            );

    }


    previousScrollY =
        currentScrollY;


    navbarTicking =
        false;

}


window.addEventListener(

    "scroll",

    function() {

        if (
            navbarTicking
        ) {

            return;

        }


        navbarTicking =
            true;


        window.requestAnimationFrame(
            updateNavbar
        );

    },

    {
        passive:
            true
    }

);


/* ============================================================
   70 — ACCESSIBILITÉ
============================================================ */

function initializeAccessibility() {

    if (
        UI.menuToggle
    ) {

        UI.menuToggle
            .setAttribute(
                "aria-controls",
                "main-navigation"
            );

    }


    if (
        UI.navigation
    ) {

        UI.navigation
            .setAttribute(
                "id",
                "main-navigation"
            );

    }

}


initializeAccessibility();


/* ============================================================
   71 — PRÉPARATION SEO / META DYNAMIQUE
   ------------------------------------------------------------
   Les balises SEO principales doivent idéalement être dans
   index.html. Ici on sécurise seulement le titre.
============================================================ */

if (
    document.title.trim() ===
    ""
) {

    document.title =
        "Aero Engineering — Interactive Jet Engine Experience";

}


/* ============================================================
   72 — GESTION DU VISIBILITÉ DE L'ONGLET
   ------------------------------------------------------------ */

document.addEventListener(

    "visibilitychange",

    function() {

        if (
            !mixer
        ) {

            return;

        }


        if (
            document.hidden
        ) {

            mixer.timeScale =
                0;

        }


        else {

            mixer.timeScale =

                THREE.MathUtils.lerp(

                    0.35,

                    3.25,

                    scrollState
                        .engineSpeed

                );

        }

    }

);


/* ============================================================
   73 — REFRESH FINAL DE SCROLLTRIGGER
============================================================ */

window.addEventListener(

    "load",

    function() {

        if (
            typeof ScrollTrigger !==
            "undefined"
        ) {

            ScrollTrigger.refresh();

        }


        updateResponsiveEngine();


        updateTechnicalUI();

    }

);


/* ============================================================
   74 — API FINALE
   ------------------------------------------------------------
   On conserve les APIs précédentes et on ajoute l'interface.
============================================================ */

window.JetEngineExperience =

    window.JetEngineExperience || {};


window.JetEngineExperience.ui = {

    openMenu:
        function() {

            if (
                !menuOpen
            ) {

                toggleNavigation();

            }

        },


    closeMenu:
        function() {

            if (
                menuOpen
            ) {

                toggleNavigation();

            }

        },


    update:
        function() {

            updateHUD();

        }

};


/* ============================================================
   75 — MESSAGE FINAL
============================================================ */

console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
);

console.log(
    "✈️ AERO ENGINEERING EXPERIENCE"
);

console.log(
    "✓ PARTIE 1 — THREE.JS"
);

console.log(
    "✓ PARTIE 2 — ENGINE ANALYSIS"
);

console.log(
    "✓ PARTIE 3 — GSAP SCROLL STORYTELLING"
);

console.log(
    "✓ PARTIE 4 — PREMIUM UI"
);

console.log(
    "✓ SYSTEM READY"
);

console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
);


/* ============================================================
   FIN DU SCRIPT.JS — 4 / 4
============================================================ */

