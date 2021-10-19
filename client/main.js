"use strict"
window.addEventListener("load", () => {
    init();
    const socket = io();
    socket.on('connect', socket=>{
        console.log(socket.id)
    })
});
function init() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    const axesHelper = new THREE.AxesHelper(2);
    axesHelper.setColors(0x555555, 0x555555, 0x555555);
    scene.add(axesHelper);
    camera.position.z = 5;
    camera.position.x = .5;
    camera.position.y = .5;
    (function animate() {
        requestAnimationFrame(animate); //loop call
        renderer.render(scene, camera);
        // controls.update();
    })();








    window.addEventListener("resize", updateView);


    //utils
    //window resize callback
    function updateView() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

}



