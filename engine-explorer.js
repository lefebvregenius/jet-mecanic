/* ============================================================
   GRALWEBS AEROSPACE DIGITAL LAB
   ENGINE EXPLORER
============================================================ */

import * as THREE from "three";

import { GLTFLoader }
    from "https://cdn.jsdelivr.net/npm/three@0.167.1/examples/jsm/loaders/GLTFLoader.js";

import { OrbitControls }
    from "https://cdn.jsdelivr.net/npm/three@0.167.1/examples/jsm/controls/OrbitControls.js";


/* ============================================================
   CONFIGURATION
============================================================ */

const ENGINE_CONFIG = {

    modelPath:
        "./models/jet_engine.glb",

    modelScale:
        1.0,

    cameraDistance:
        5.5,

    autoRotateSpeed:
        0.35,

    minDistance:
        2.2,

    maxDistance:
        11,

    audioPath:
        "./audio/jet-engine.m4a"

};


/* ============================================================
   DOM
============================================================ */

const canvas =
    document.querySelector("#engine-canvas");

const viewer =
    document.querySelector("#engine-viewer");

const loading =
    document.querySelector("#engine-loading");

const progressBar =
    document.querySelector("#loading-progress-bar");

const hotspotContainer =
    document.querySelector("#hotspot-container");

const fpsCounter =
    document.querySelector("#fps-counter");

const selectedTitle =
    document.querySelector("#selected-hotspot-title");

const selectedDescription =
    document.querySelector("#selected-hotspot-description");


if (!canvas || !viewer) {

    console.warn(
        "Engine Explorer: viewer not found."
    );

}


/* ============================================================
   SCENE
============================================================ */

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x030303);


/* ============================================================
   CAMERA
============================================================ */

const camera =
    new THREE.PerspectiveCamera(
        45,
        viewer.clientWidth /
        viewer.clientHeight,
        0.01,
        100
    );

camera.position.set(
    4.5,
    2.2,
    ENGINE_CONFIG.cameraDistance
);


/* ============================================================
   RENDERER
============================================================ */

const renderer =
    new THREE.WebGLRenderer({

        canvas,

        antialias:
            true,

        alpha:
            false,

        powerPreference:
            "high-performance"

    });


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

renderer.setSize(
    viewer.clientWidth,
    viewer.clientHeight,
    false
);

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure =
    1.1;


/* ============================================================
   LIGHTING
============================================================ */

const ambient =
    new THREE.HemisphereLight(
        0xffffff,
        0x101010,
        1.8
    );

scene.add(ambient);


const keyLight =
    new THREE.DirectionalLight(
        0xffffff,
        3
    );

keyLight.position.set(
    5,
    8,
    7
);

scene.add(keyLight);


const rimLight =
    new THREE.DirectionalLight(
        0xff3333,
        2.5
    );

rimLight.position.set(
    -5,
    3,
    -7
);

scene.add(rimLight);


const topLight =
    new THREE.DirectionalLight(
        0xffd9a0,
        1.2
    );

topLight.position.set(
    0,
    10,
    0
);

scene.add(topLight);


/* ============================================================
   ORBIT CONTROLS
============================================================ */

const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    );

controls.enableDamping =
    true;

controls.dampingFactor =
    0.07;

controls.enablePan =
    false;

controls.minDistance =
    ENGINE_CONFIG.minDistance;

controls.maxDistance =
    ENGINE_CONFIG.maxDistance;

controls.target.set(
    0,
    0,
    0
);


/* ============================================================
   ENGINE ROOT
============================================================ */

const engineRoot =
    new THREE.Group();

scene.add(engineRoot);


/* ============================================================
   ENGINE STATE
============================================================ */

let engineModel =
    null;

let mixer =
    null;

let animationActions =
    [];

let autoRotate =
    false;

let isLoaded =
    false;


/* ============================================================
   LOAD MODEL
============================================================ */

const loader =
    new GLTFLoader();


loader.load(

    ENGINE_CONFIG.modelPath,

    (gltf) => {

        engineModel =
            gltf.scene;

        engineModel.scale.setScalar(
            ENGINE_CONFIG.modelScale
        );


        /*
         * Center model automatically.
         */

        const box =
            new THREE.Box3()
                .setFromObject(
                    engineModel
                );

        const center =
            box.getCenter(
                new THREE.Vector3()
            );

        engineModel.position.sub(
            center
        );


        engineRoot.add(
            engineModel
        );


        /*
         * Shadows / material optimization.
         */

        engineModel.traverse(
            (object) => {

                if (!object.isMesh)
                    return;

                object.frustumCulled =
                    true;

                if (object.material) {

                    object.material
                        .roughness =
                        Math.max(
                            0.22,
                            object.material.roughness ??
                            0.5
                        );

                }

            }
        );


        /*
         * Native GLB animation.
         */

        if (
            gltf.animations &&
            gltf.animations.length
        ) {

            mixer =
                new THREE.AnimationMixer(
                    engineModel
                );

            gltf.animations.forEach(
                (clip) => {

                    const action =
                        mixer.clipAction(
                            clip
                        );

                    action.play();

                    animationActions
                        .push(action);

                }
            );

        }


        /*
         * Initial camera framing.
         */

        frameModel();


        isLoaded =
            true;

        loading.classList
            .add("loaded");

        progressBar.style.width =
            "100%";


        createHotspots();

        console.log(
            "JET ENGINE GLB loaded."
        );

    },


    /*
     * Loading progress.
     */

    (xhr) => {

        if (!xhr.total)
            return;

        const progress =
            (
                xhr.loaded /
                xhr.total
            ) * 100;

        progressBar.style.width =
            `${progress}%`;

    },


    /*
     * Error.
     */

    (error) => {

        console.error(
            "Unable to load jet_engine.glb",
            error
        );

        loading.innerHTML = `

            <strong>
                ENGINE LOAD ERROR
            </strong>

            <span>
                CHECK ./models/jet_engine.glb
            </span>

        `;

    }

);


/* ============================================================
   FRAME MODEL
============================================================ */

function frameModel() {

    if (!engineModel)
        return;


    const box =
        new THREE.Box3()
            .setFromObject(
                engineModel
            );

    const size =
        box.getSize(
            new THREE.Vector3()
        );

    const center =
        box.getCenter(
            new THREE.Vector3()
        );


    const maxSize =
        Math.max(
            size.x,
            size.y,
            size.z
        );


    const distance =
        maxSize * 1.8;


    camera.position.set(
        distance,
        distance * .45,
        distance
    );


    controls.target.copy(
        center
    );

    controls.update();

}


/* ============================================================
   HOTSPOT DATA
============================================================ */

const HOTSPOTS = [

    {

        id:
            "fan",

        label:
            "01",

        title:
            "FAN",

        description:
            "Le fan constitue la première grande zone aérodynamique du turbofan. Il accélère le flux d'air et contribue fortement à la génération de poussée.",

        position:
            new THREE.Vector3(
                0,
                0.15,
                1.05
            )

    },

    {

        id:
            "compressor",

        label:
            "02",

        title:
            "COMPRESSOR",

        description:
            "Le compresseur augmente progressivement la pression de l'air avant son entrée dans la chambre de combustion.",

        position:
            new THREE.Vector3(
                0,
                0.15,
                0.35
            )

    },

    {

        id:
            "combustor",

        label:
            "03",

        title:
            "COMBUSTOR",

        description:
            "La chambre de combustion transforme l'énergie chimique du carburant en énergie thermique contenue dans le flux gazeux.",

        position:
            new THREE.Vector3(
                0,
                0.05,
                -0.15
            )

    },

    {

        id:
            "turbine",

        label:
            "04",

        title:
            "TURBINE",

        description:
            "Les turbines récupèrent une partie de l'énergie du flux chaud pour entraîner les systèmes mécaniques du moteur.",

        position:
            new THREE.Vector3(
                0,
                0.05,
                -0.65
            )

    },

    {

        id:
            "exhaust",

        label:
            "05",

        title:
            "EXHAUST",

        description:
            "La section d'échappement dirige le flux final et participe à la conversion de l'énergie restante en poussée.",

        position:
            new THREE.Vector3(
                0,
                0.05,
                -1.1
            )

    }

];


/* ============================================================
   CREATE HOTSPOTS
============================================================ */

function createHotspots() {

    hotspotContainer.innerHTML =
        "";


    HOTSPOTS.forEach(
        (hotspot) => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "engine-hotspot";

            button.type =
                "button";

            button.textContent =
                hotspot.label;

            button.setAttribute(
                "aria-label",
                hotspot.title
            );


            button.addEventListener(
                "click",
                () => {

                    selectHotspot(
                        hotspot
                    );

                    focusHotspot(
                        hotspot
                    );

                }
            );


            hotspot.element =
                button;

            hotspotContainer
                .appendChild(
                    button
                );

        }
    );

}


/* ============================================================
   SELECT HOTSPOT
============================================================ */

function selectHotspot(
    hotspot
) {

    selectedTitle.textContent =
        hotspot.title;

    selectedDescription.textContent =
        hotspot.description;


    document
        .querySelectorAll(
            ".tech-card"
        )
        .forEach(
            card => {

                card.classList
                    .remove(
                        "selected"
                    );

            }
        );


    const card =
        document.querySelector(
            `.tech-card[data-system="${hotspot.id}"]`
        );


    if (card) {

        card.classList
            .add(
                "selected"
            );

        card.scrollIntoView({
            behavior:
                "smooth",
            block:
                "center"
        });

    }

}


/* ============================================================
   FOCUS HOTSPOT
============================================================ */

function focusHotspot(
    hotspot
) {

    if (!engineModel)
        return;


    const target =
        hotspot.position
            .clone();


    controls.target.copy(
        target
    );

}


/* ============================================================
   UPDATE HOTSPOT SCREEN POSITION
============================================================ */

function updateHotspots() {

    if (!engineModel)
        return;


    const rect =
        viewer.getBoundingClientRect();


    HOTSPOTS.forEach(
        (hotspot) => {

            if (!hotspot.element)
                return;


            const worldPosition =
                hotspot.position
                    .clone();

            engineRoot
                .localToWorld(
                    worldPosition
                );


            const projected =
                worldPosition
                    .project(
                        camera
                    );


            const x =
                (
                    projected.x *
                    0.5 +
                    0.5
                ) * rect.width;


            const y =
                (
                    -projected.y *
                    0.5 +
                    0.5
                ) * rect.height;


            const visible =
                projected.z > -1 &&
                projected.z < 1;


            hotspot.element.style
                .transform =
                `
                translate(
                    ${x}px,
                    ${y}px
                )
                `;

            hotspot.element.style
                .opacity =
                visible ? "1" : "0";

            hotspot.element.style
                .pointerEvents =
                visible ? "auto" : "none";

        }
    );

}


/* ============================================================
   AUTO ROTATION
============================================================ */

function updateAutoRotation() {

    if (
        !engineModel ||
        !autoRotate
    )
        return;


    engineModel.rotation.y +=
        ENGINE_CONFIG.autoRotateSpeed *
        0.005;

}


/* ============================================================
   RESET
============================================================ */

document
    .querySelector("#engine-reset")
    ?.addEventListener(
        "click",
        () => {

            frameModel();

        }
    );


/* ============================================================
   AUTO BUTTON
============================================================ */

document
    .querySelector("#engine-rotate")
    ?.addEventListener(
        "click",
        (event) => {

            autoRotate =
                !autoRotate;

            event.currentTarget
                .classList
                .toggle(
                    "active",
                    autoRotate
                );

        }
    );


/* ============================================================
   FULLSCREEN
============================================================ */

document
    .querySelector("#engine-fullscreen")
    ?.addEventListener(
        "click",
        async () => {

            try {

                if (
                    !document.fullscreenElement
                ) {

                    await viewer
                        .requestFullscreen();

                } else {

                    await document
                        .exitFullscreen();

                }

            } catch (error) {

                console.warn(
                    "Fullscreen unavailable.",
                    error
                );

            }

        }
    );


/* ============================================================
   AUDIO SYSTEM
============================================================ */

const audio =
    document.querySelector(
        "#engine-audio"
    );

const audioToggle =
    document.querySelector(
        "#engine-audio-toggle"
    );

const audioMute =
    document.querySelector(
        "#engine-audio-mute"
    );

const audioVolume =
    document.querySelector(
        "#engine-volume"
    );

const audioState =
    document.querySelector(
        "#audio-state"
    );

const audioModule =
    document.querySelector(
        ".audio-module"
    );


if (audio) {

    audio.volume =
        Number(
            audioVolume?.value ??
            0.65
        );

}


audioToggle
    ?.addEventListener(
        "click",
        async () => {

            if (!audio)
                return;


            if (
                audio.paused
            ) {

                try {

                    await audio.play();

                    audioToggle.textContent =
                        "STOP ENGINE";

                    audioState.textContent =
                        "RUNNING";

                    audioModule.classList
                        .add(
                            "playing"
                        );

                } catch (error) {

                    console.warn(
                        "Audio playback blocked.",
                        error
                    );

                }

            } else {

                audio.pause();

                audioToggle.textContent =
                    "PLAY ENGINE";

                audioState.textContent =
                    "STANDBY";

                audioModule.classList
                    .remove(
                        "playing"
                    );

            }

        }
    );


audioMute
    ?.addEventListener(
        "click",
        () => {

            if (!audio)
                return;

            audio.muted =
                !audio.muted;

            audioMute.textContent =
                audio.muted
                    ? "UNMUTE"
                    : "MUTE";

        }
    );


audioVolume
    ?.addEventListener(
        "input",
        () => {

            if (!audio)
                return;

            audio.volume =
                Number(
                    audioVolume.value
                );

        }
    );


/* ============================================================
   PARTS SLIDER
============================================================ */

const slides =
    Array.from(
        document.querySelectorAll(
            ".part-slide"
        )
    );

const nextButton =
    document.querySelector(
        "#parts-next"
    );

const prevButton =
    document.querySelector(
        "#parts-prev"
    );

const sliderProgress =
    document.querySelector(
        "#slider-progress"
    );

let currentSlide =
    0;


function updateSlider() {

    slides.forEach(
        (slide, index) => {

            slide.style.display =
                index === currentSlide
                    ? "grid"
                    : "none";

            slide.classList.toggle(
                "active",
                index === currentSlide
            );

        }
    );


    const percentage =
        (
            (
                currentSlide + 1
            ) /
            slides.length
        ) * 100;


    if (sliderProgress) {

        sliderProgress.style
            .background =
            `
            linear-gradient(
                90deg,
                var(--engine-red)
                0 ${percentage}%,
                #222 ${percentage}% 100%
            )
            `;

    }

}


nextButton
    ?.addEventListener(
        "click",
        () => {

            currentSlide =
                (
                    currentSlide + 1
                ) %
                slides.length;

            updateSlider();

        }
    );


prevButton
    ?.addEventListener(
        "click",
        () => {

            currentSlide =
                (
                    currentSlide -
                    1 +
                    slides.length
                ) %
                slides.length;

            updateSlider();

        }
    );


updateSlider();


/* ============================================================
   RESIZE
============================================================ */

function resize() {

    const width =
        viewer.clientWidth;

    const height =
        viewer.clientHeight;


    if (
        width <= 0 ||
        height <= 0
    )
        return;


    camera.aspect =
        width / height;

    camera.updateProjectionMatrix();


    renderer.setSize(
        width,
        height,
        false
    );

}


window.addEventListener(
    "resize",
    resize
);


/* ============================================================
   FPS
============================================================ */

let frames =
    0;

let fpsTime =
    performance.now();


function updateFPS() {

    frames++;

    const now =
        performance.now();


    if (
        now -
        fpsTime >=
        1000
    ) {

        if (fpsCounter) {

            fpsCounter.textContent =
                `${frames} FPS`;

        }

        frames =
            0;

        fpsTime =
            now;

    }

}


/* ============================================================
   CLOCK
============================================================ */

const clock =
    new THREE.Clock();


/* ============================================================
   MAIN LOOP
============================================================ */

function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        clock.getDelta();


    if (mixer) {

        mixer.update(
            delta
        );

    }


    updateAutoRotation();

    controls.update();

    updateHotspots();

    updateFPS();


    renderer.render(
        scene,
        camera
    );

}


animate();


/* ============================================================
   INITIALIZE
============================================================ */

resize();


console.log(
    "GRALWEBS ENGINE EXPLORER ONLINE"
);