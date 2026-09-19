import './style.css'
import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#1a1a1a'); 

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 11.7); 

const canvas = document.querySelector(".threejs");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; 
controls.enablePan = false;

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);


const loader = new GLTFLoader();
let Base;
let Upper_Arm;
let Medium_Arm;
let Lower_Arm;
loader.load('./assets/Robotic_Arm.glb', (gltf) => {
    const model = gltf.scene;
    Lower_Arm = model.getObjectByName("Arm_3");
    Medium_Arm = model.getObjectByName("Arm_2");
    Upper_Arm = model.getObjectByName('Arm_1');
    Base = model.getObjectByName('Base');

    scene.add(Base);
    Base.add(Upper_Arm);
    Upper_Arm.add(Medium_Arm);
    Medium_Arm.add(Lower_Arm);

    Upper_Arm.position.set(0, 0, 0);       
    Medium_Arm.position.set(0, 0.8, 0);     
    Lower_Arm.position.set(0, 0.8, 0);
}, undefined, (error) => {
    console.error('Error al cargar el brazo robótico:', error);
});

function animate() {
    window.requestAnimationFrame(animate);
    controls.update(); 
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


const intersectionPoint = new THREE.Vector3();
const zeroPoint = new THREE.Vector3();
const planeNormal = new THREE.Vector3();
const plane = new THREE.Plane();
const absolute = new THREE.Vector2();
const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const baseScreenPos = new THREE.Vector3();

window.addEventListener('mousemove', handleMoves);
window.addEventListener('touchstart', handleMoves, { passive: false });
window.addEventListener('touchmove', handleMoves, { passive: false });

function handleMoves(e) {
  if (!Base || !camera) return;

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  if (clientX === undefined || clientY === undefined) return;

  const canvas = document.querySelector("canvas");
  const rect = canvas.getBoundingClientRect();

  Base.getWorldPosition(baseScreenPos);
  baseScreenPos.project(camera);

  const basePixelX = rect.left + ((baseScreenPos.x + 1) * rect.width) / 2;
  const basePixelY = rect.top + ((-baseScreenPos.y + 1) * rect.height) / 2;

  const offsetX = clientX - basePixelX;
  const offsetY = clientY - basePixelY;

  mousePosition.x = offsetX / (rect.width / 2);
  mousePosition.y = -(offsetY / (rect.height / 2));

  planeNormal.copy(camera.position).normalize();
  plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);

  raycaster.setFromCamera(mousePosition, camera);
  raycaster.ray.intersectPlane(plane, intersectionPoint);

  baseRotation();
}

window.addEventListener('touchstart', (e)=>{handleMoves(e)});
window.addEventListener('touchmove', (e)=>{handleMoves(e)});

function baseRotation(){
    if (!camera) return;

    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const stableCameraAngleY = Math.atan2(cameraDirection.x, cameraDirection.z);
    
    const angle = Math.PI / 2 + stableCameraAngleY + mousePosition.x * (Math.PI / 4);

    Base.rotation.y = angle;

    Upper_Arm.rotation.z = 0.4 + mousePosition.y * (Math.PI / 10);
    Medium_Arm.rotation.z = -1.2 + mousePosition.y * (Math.PI / 10);
    Lower_Arm.rotation.z = -1 + mousePosition.y * (Math.PI / 10);
}

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);