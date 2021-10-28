"use strict"
let satellitePosAndVelo = {};
import * as THREE from './js/three.module.js';
import { OrbitControls } from './js/controls/OrbitControls.js';
import { ConvexGeometry } from './js/geometries/ConvexGeometry.js';
import * as BufferGeometryUtils from './js/utils/BufferGeometryUtils.js';
import { GUI } from './js/libs/dat.gui.module.js';
import { LightProbeGenerator } from './js/lights/LightProbeGenerator.js';
let INTERSECTED;
const pointer = new THREE.Vector2();
let dependencies = [];
const keyPairs = {};
const socket = io();
const API = {
    lightProbeIntensity: 1.0,
    directionalLightIntensity: 0.2,
    envMapIntensity: 1
};

window.addEventListener("load", () => {
    init();
    
    socket.on('connect', socket => {
    });
    socket.on('init', msg => {
        console.log(`get data: ${Object.keys(msg)}`);
        // console.log(msg)
        satellitePosAndVelo = msg;
    })
    
});

function init() {
    const earthOribitLength = 5;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    camera.position.z = 20;
    camera.position.x = 1;
    camera.position.y = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //reference: https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/Mouse-Tooltip.html
    const canvas1 = document.createElement('canvas')
    let context1 = canvas1.getContext('2d');
    context1.font = "Bold 20px Arial";
    context1.fillStyle = "rgba(0,0,0,0.95)";
    let texture1 = new THREE.Texture(canvas1)
    texture1.needsUpdate = true;
    var spriteMaterial = new THREE.SpriteMaterial({ map: texture1, useScreenCoordinates: true });

    let sprite1 = new THREE.Sprite(spriteMaterial);
    sprite1.scale.set(200, 100, 1.0);
    sprite1.position.set(50, 50, 0);
    scene.add(sprite1);
    // const axesHelper = new THREE.AxesHelper(20);
    // axesHelper.setColors(0x999999, 0x999999, 0x999999);
    // scene.add(axesHelper);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 10;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI * 2;

    // scene.add(new THREE.AmbientLight(0x111111));

    const directionalLight = new THREE.DirectionalLight(0xffffff, API.directionalLightIntensity);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);

    let raycaster = new THREE.Raycaster();


    for (let i = 0; i < 24; i++) {
        let circleM = new THREE.LineBasicMaterial({ color: 0x666666 });
        let circleG = new THREE.CircleGeometry(earthOribitLength + .05, 100);
        let circle = new THREE.Line(circleG, circleM);
        circle.rotation.y = (Math.PI / 23) * i;
        scene.add(circle);
    }

    const sphereGeo = new THREE.SphereGeometry(earthOribitLength, 100, 100);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 2
    });
    const sphere = new THREE.Mesh(sphereGeo, material);
    scene.add(sphere);
    (function animate() {
        requestAnimationFrame(animate); //loop call
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(scene.children, false);
        let label = document.createElement('label');
        if (intersects.length) {
            if (INTERSECTED != intersects[0].object) {
                if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);

                INTERSECTED = intersects[0].object;
                INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                INTERSECTED.material.color.setHex(0xff0000);
                if (keyPairs) {
                    let name = getKeyByVal(keyPairs, INTERSECTED.uuid)
                    if (name) {
                        let metrics = context1.measureText(name);
                        let width = metrics.width;
                        context1.fillStyle = "rgba(0,0,0,0.95)"; // black border
                        context1.fillRect(0, 0, width + 8, 20 + 8);
                        context1.fillStyle = "rgba(255,255,255,0.95)"; // white filler
                        context1.fillRect(2, 2, width + 4, 20 + 4);
                        context1.fillStyle = "rgba(0,0,0,1)"; // text color
                        context1.fillText(name, 4, 20);
                        texture1.needsUpdate = true;
                        console.log(name);
                    }
                }
            }
        } else {
            if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            context1.clearRect(0,0,300,300);
            INTERSECTED = null;

        }
        renderer.render(scene, camera);
        // controls.update();
    })();


    function drawSatellites(satelliteObject) {
        if (dependencies[0]) {
            dependencies.forEach((element) => {
                let obj = scene.getObjectByProperty('uuid', element);
                scene.remove(obj);
                obj = null;
                //TODO: trash guy collect this
            });
            dependencies = [];
        }
        // let constellation = new THREE.ShapeGeometry();
        for (let satellite in satelliteObject) {
            // console.log(typeof satelliteObject)
            let x = satelliteObject[satellite]['position']['x'];
            let y = satelliteObject[satellite]['position']['y'];
            let z = satelliteObject[satellite]['position']['z'];

            x /= 1000;
            y /= 1000;
            z /= 1000;
            let satelliteInstance = new THREE.SphereGeometry(.05, 10, 10);
            const Smaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0,
                roughness: 0
            });
            let satelliteSphere = new THREE.Mesh(satelliteInstance, Smaterial);
            satelliteSphere.position.set(x, y, z);
            dependencies.push(satelliteSphere.uuid);
            //for tooltip
            keyPairs[satellite] = satelliteSphere.uuid;
            scene.add(satelliteSphere);
        }
    }
    drawSatellites(satellitePosAndVelo);
    socket.on('updateData', msg => {
        // satellitePosAndVelo = msg;
        console.log(msg)
        drawSatellites(JSON.parse(msg));
        // console.log(`get data: ${Object.keys(msg)}`)
    });
    window.addEventListener("resize", updateView);
    document.addEventListener('mousemove', onMouseMove);

    //utils
    //window resize
    function updateView() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    // const gui = new GUI({width: 300});
    // const lightControl = gui.addFolder('Light');
    function onMouseMove(event) {
        // console.log(event)
        sprite1.position.set(event.clientX, event.clientY);
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }
    function getKeyByVal(obj, val) {
        return Object.keys(obj).find(key => obj[key] === val);
    }
}