"use strict"
let satellitePosAndVelo = {};
import * as THREE from './js/three.module.js';
import { OrbitControls } from './js/controls/OrbitControls.js';
import { ConvexGeometry } from './js/geometries/ConvexGeometry.js';
import * as BufferGeometryUtils from './js/utils/BufferGeometryUtils.js';
import { GUI } from './js/libs/dat.gui.module.js';
import { LightProbeGenerator } from './js/lights/LightProbeGenerator.js';

window.addEventListener("load", () => {
    init();
    const socket = io();
    socket.on('connect', socket => {
    });
    socket.on('init', msg => {
        console.log(`get data: ${Object.keys(msg)}`);
        console.log(msg)
        satellitePosAndVelo = msg;
    })
    socket.on('updateData', msg => {
        satellitePosAndVelo = msg;
        console.log(`get data: ${Object.keys(msg)}`)
    });
});
function init() {
    const earthOribitLength = 5;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    const axesHelper = new THREE.AxesHelper(20);
    axesHelper.setColors(0x999999, 0x999999, 0x999999);
    scene.add(axesHelper);
    camera.position.z = 20;
    camera.position.x = 1;
    camera.position.y = 1;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 10;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI;
    const sphereGeo = new THREE.SphereGeometry(earthOribitLength, 100, 100);
    const material = new THREE.LineDashedMaterial({
        color: 0xffffff,
        linewidth: .1,
        scale: 1,
        dashSize: 3,
        gapSize: 1,
    });
    const sphere = new THREE.Mesh(sphereGeo, material);
    scene.add(sphere);
    (function animate() {
        requestAnimationFrame(animate); //loop call
        renderer.render(scene, camera);
        // controls.update();
    })();
    (function drawSatellites(satelliteObject) {
        for (let satellite in satelliteObject) {
            let tempSatellitePosition = satellite[position];

        }
    })(satellitePosAndVelo);




    window.addEventListener("resize", updateView);


    //utils
    //window resize
    function updateView() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}




