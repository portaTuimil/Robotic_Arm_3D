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
loader.load('/src/assets/Robotic_Arm.glb', (gltf) => {
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

window.addEventListener('mousemove', function (e) {
  if (!Base || !camera) return;

  const canvas = document.querySelector("canvas");
  const rect = canvas.getBoundingClientRect();

  // 1. Convert the 3D position of Base into 2D Normalized Device Coordinates (-1 to +1)
  Base.getWorldPosition(baseScreenPos); // Gets 3D world position
  baseScreenPos.project(camera);         // Maps 3D pos to 2D screen space (-1 to +1)

  // 2. Convert the Base's 2D NDC position into actual pixel coordinates on the page
  const basePixelX = rect.left + ((baseScreenPos.x + 1) * rect.width) / 2;
  const basePixelY = rect.top + ((-baseScreenPos.y + 1) * rect.height) / 2;

  // 3. Mouse offset relative to the ARM'S screen position (NOT the canvas center)
  // When mouse is directly over the Base, both offsets will be exactly 0
  const offsetX = e.clientX - basePixelX;
  const offsetY = e.clientY - basePixelY;

  // 4. Normalize the offset based on canvas dimensions so speed stays consistent
  mousePosition.x = offsetX / (rect.width / 2);
  mousePosition.y = -(offsetY / (rect.height / 2));

  // 5. Standard Raycasting & Rotation Update
  planeNormal.copy(camera.position).normalize();
  plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);

  raycaster.setFromCamera(mousePosition, camera);
  raycaster.ray.intersectPlane(plane, intersectionPoint);

  baseRotation();
});

function baseRotation(){
    /*const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const stableCameraAngleY = Math.atan2(cameraDirection.x, cameraDirection.z);
    
    const angle = Math.PI/2 + stableCameraAngleY + mousePosition.x * Math.PI/4;
    Base.rotation.y = angle;

    Upper_Arm.rotation.z = 0.9 - mousePosition.y*Math.PI/8;
    Upper_Arm.rotation.y = angle;

    Medium_Arm.rotation.z = -0.9 + mousePosition.y*Math.PI/6;
    Medium_Arm.rotation.y = angle;
    Medium_Arm.position.y = Math.cos(Upper_Arm.rotation.z) * 0.8;
    Medium_Arm.position.z = Math.sin(Upper_Arm.rotation.y) * 0.8;
    Medium_Arm.position.x = -Math.cos(Upper_Arm.rotation.y) * 0.8;

    Lower_Arm.position.x = Medium_Arm.position.x  + Math.cos(Medium_Arm.rotation.y)*0.8;
    Lower_Arm.position.y = Medium_Arm.position.y + Math.cos(Medium_Arm.rotation.z) * 0.8;
    Lower_Arm.position.z = Medium_Arm.position.z - Math.sin(Medium_Arm.rotation.y) * 0.8;
    Lower_Arm.rotation.z = -1.5 + mousePosition.y*Math.PI/6;
    Lower_Arm.rotation.y = angle;*/
    if (!camera) return;

    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const stableCameraAngleY = Math.atan2(cameraDirection.x, cameraDirection.z);
    
    const angle = Math.PI / 2 + stableCameraAngleY + mousePosition.x * (Math.PI / 4);

    Base.rotation.y = angle;

    Upper_Arm.rotation.z = 0.4 + mousePosition.y * (Math.PI / 10);
    Medium_Arm.rotation.z = -1.2 + mousePosition.y * (Math.PI / 10);
    Lower_Arm.rotation.z = -1 + mousePosition.y * (Math.PI / 10);
    console.log(document.querySelector("canvas").getBoundingClientRect())
console.log(mousePosition.x)

}

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

