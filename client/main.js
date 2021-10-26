"use strict"
let satellitePosAndVelo = {};
import * as THREE from './js/three.module.js';
import { OrbitControls } from './js/controls/OrbitControls.js';
import { ConvexGeometry } from './js/geometries/ConvexGeometry.js';
import * as BufferGeometryUtils from './js/utils/BufferGeometryUtils.js';
import { GUI } from './js/libs/dat.gui.module.js';
import { LightProbeGenerator } from './js/lights/LightProbeGenerator.js';
const clock = new THREE.Clock();

const API = {
    lightProbeIntensity: 1.0,
    directionalLightIntensity: 0.2,
    envMapIntensity: 1
};

window.addEventListener("load", () => {
    init();
    const socket = io();
    socket.on('connect', socket => {
    });
    socket.on('init', msg => {
        console.log(`get data: ${Object.keys(msg)}`);
        // console.log(msg)
        satellitePosAndVelo = msg;
    })
    socket.on('updateData', msg => {
        satellitePosAndVelo = msg;
        // console.log(`get data: ${Object.keys(msg)}`)
    });
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

    const axesHelper = new THREE.AxesHelper(20);
    axesHelper.setColors(0x999999, 0x999999, 0x999999);
    scene.add(axesHelper);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 10;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI * 2;

    // scene.add(new THREE.AmbientLight(0x111111));

    const directionalLight = new THREE.DirectionalLight(0xffffff, API.directionalLightIntensity);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);

    for (let i = 0; i < 24; i++) {
        let circleM = new THREE.LineBasicMaterial({ color: 0x666666 });
        let circleG = new THREE.CircleGeometry(earthOribitLength + .05, 100);
        let circle = new THREE.Line(circleG, circleM);
        circle.rotation.y = (Math.PI / 24) * i;
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
        const delta = clock.getDelta();
        renderer.render(scene, camera);
        // controls.update();
    })();

    const dependencies = [];
    const keyPairs = {};
    function drawSatellites(satelliteObject) {
        // let constellation = new THREE.ShapeGeometry();
        for (let satellite in satelliteObject) {
            let { x, y, z } = satelliteObject[satellite].position;
            x /= 1000;
            y /= 1000;
            z /= 1000;
            let satelliteInstance = new THREE.SphereGeometry(.05, 100, 100);
            const Smaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                metalness: 1,
                roughness: 0
            });
            let satelliteSphere = new THREE.Mesh(satelliteInstance, Smaterial);
            satelliteSphere.position.set(x, y, z);
            dependencies.push(satelliteSphere.uuid);
            keyPairs[satellite] = satelliteSphere.uuid;
            scene.add(satelliteSphere);
        }
    }
    function remove(arr){
        arr.forEach((element) => {
            let obj = scene.getObjectByProperty('uuid', element);
            obj.geometry.dispose();
            obj.material.dispose();
            scene.remove(obj);
        });
    }
    drawSatellites(satellitePosAndVelo);
    setInterval(() => {
        remove(dependencies)
        drawSatellites(satellitePosAndVelo);
    }, 10000);




    window.addEventListener("resize", updateView);


    //utils
    //window resize
    function updateView() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    // const gui = new GUI({width: 300});
    // const lightControl = gui.addFolder('Light');

}




