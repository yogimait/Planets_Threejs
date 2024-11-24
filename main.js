import './style.css'

import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import gsap from 'gsap';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true
});

// Configure renderer
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));




// Load HDRI environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr', 
  function(texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});


const radius = 1.3;
const segments = 64;
const orbitRadius = 4.5;
const colors=[0x00ff00,0x0000ff,0xff0000,0x00ffff]
const textures = ["./iceworld/map.jpg","./earth/map.jpg","./mars/map.jpg","./venus/map.jpg"]
const spheres = new THREE.Group()

// Create a large sphere for the starfield background
const starfieldRadius = 50;  // Much larger than other spheres
const starfieldGeometry = new THREE.SphereGeometry(starfieldRadius, 64, 64);

// Load and configure the star texture
const starTexture = new THREE.TextureLoader().load('./bg_stars.jpg');
starTexture.colorSpace = THREE.SRGBColorSpace;
starTexture.wrapS = THREE.RepeatWrapping;
starTexture.wrapT = THREE.RepeatWrapping;

// Create material with the star texture mapped to the inside of the sphere
const starfieldMaterial = new THREE.MeshBasicMaterial({
  map: starTexture,
  transparent: true,
  opacity: 0.3,
  side: THREE.BackSide  // Render on the inside of the sphere
});

const starfield = new THREE.Mesh(starfieldGeometry, starfieldMaterial);
scene.add(starfield);

const spheresMesh =[];
const cloudsMesh =[];

for(let i=0 ; i < 4 ; i++){
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textures[i]);
  texture.colorSpace = THREE.SRGBColorSpace;
  
  
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, material);

  // Add cloud layer
  const cloudGeometry = new THREE.SphereGeometry(radius * 1.01, segments, segments);
  if (i === 1) {
    const cloudTexture = new THREE.TextureLoader().load('./earth/clouds.jpg');
    cloudTexture.colorSpace = THREE.SRGBColorSpace;
    const cloudMaterial = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    sphere.add(clouds);
  }
  if (i === 3) {
    const cloudTexture1 = new THREE.TextureLoader().load('./venus/venus_clouds.jpg');
    cloudTexture1.colorSpace = THREE.SRGBColorSpace;
    const cloudMaterial = new THREE.MeshStandardMaterial({
      map: cloudTexture1,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    sphere.add(clouds);
  }


  spheresMesh.push(sphere);
  const angle = (i/4)*(Math.PI*2)
  sphere.position.x =orbitRadius* Math.cos(angle)
  sphere.position.z = orbitRadius* Math.sin(angle)
  
  spheres.add(sphere);

}
spheres.rotation.x = 0.1;
spheres.position.y = -0.8;
scene.add(spheres)
// Add orbit controls


// Position camera
camera.position.z = 9;

// Example mesh


// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// setInterval(()=>{
//   gsap.to(spheres.rotation,{
//     y:`+=${Math.PI / 2}`,
//     duration: 2,
//     ease: "expo.easeInOut",
//   });
// },2000)

let lastWheelTime = 0;
const throttleDelay = 1000;
let scroll = 0;

function throttleWheelHandler(event){
  const currentTime = Date.now();
  if(currentTime - lastWheelTime >= throttleDelay){
    
    lastWheelTime = currentTime;
    const direction = event.deltaY > 0 ? "down" : "up";
    scroll =(scroll+1)%4;
    
    const headings = document.querySelectorAll('.heading');
    gsap.to(headings,{
      duration: 1,
      y:`-=${100}%`,
      ease: "power2.inOut",
    });

    gsap.to(spheres.rotation,{
      duration: 1,
      y:`-=${Math.PI/2}%`,
      ease: "power2.inOut",
    })

    if(scroll ===0){
      gsap.to(headings,{
        duration: 1,
        y:0,
        ease: "power2.inOut",
      })
    }

  }

}

window.addEventListener('wheel', throttleWheelHandler);

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  for(let i=0 ; i < spheresMesh.length ; i++){
    const sphere = spheresMesh[i];;
    sphere.rotation.y = clock.getElapsedTime()*0.05;
  }
  renderer.render(scene, camera);
}
animate();
