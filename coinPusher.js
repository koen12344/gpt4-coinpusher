const canvas = document.getElementById('coinPusher');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

const world = new CANNON.World();
world.gravity.set(0, -40, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;

const platformGeometry = new THREE.BoxGeometry(10, 1, 5);
const platformMaterial = new THREE.MeshLambertMaterial({ color: 0x999999 });
const platformMesh = new THREE.Mesh(platformGeometry, platformMaterial);
platformMesh.position.y = -0.5;
scene.add(platformMesh);

const platformShape = new CANNON.Box(new CANNON.Vec3(5, 0.5, 2.5));
const platformBody = new CANNON.Body({ mass: 0, shape: platformShape });
platformBody.position.set(0, -0.5, 0);
platformBody.material = new CANNON.Material();
platformBody.material.friction = 0.1; // Adjust friction between platform and coins
platformBody.material.restitution = 0.0;
world.addBody(platformBody);

const wallGeometry = new THREE.BoxGeometry(1, 3, 5);
const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });

const leftWallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
leftWallMesh.position.set(-5.5, 1, 0);
scene.add(leftWallMesh);

const rightWallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
rightWallMesh.position.set(5.5, 1, 0);
scene.add(rightWallMesh);

const wallShape = new CANNON.Box(new CANNON.Vec3(0.5, 1.5, 2.5));
const leftWallBody = new CANNON.Body({ mass: 0, shape: wallShape });
leftWallBody.position.set(-5.5, 1, 0);
world.addBody(leftWallBody);

const rightWallBody = new CANNON.Body({ mass: 0, shape: wallShape });
rightWallBody.position.set(5.5, 1, 0);
world.addBody(rightWallBody);

const backWallGeometry = new THREE.BoxGeometry(10, 3, 1);
const backWallMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });

const backWallMesh = new THREE.Mesh(backWallGeometry, backWallMaterial);
backWallMesh.position.set(0, 1, -2.5);
scene.add(backWallMesh);

const backWallShape = new CANNON.Box(new CANNON.Vec3(5, 1.5, 0.5));
const backWallBody = new CANNON.Body({ mass: 0, shape: backWallShape });
backWallBody.position.set(0, 1, -2.5);
world.addBody(backWallBody);

const pusherGeometry = new THREE.BoxGeometry(10, 1, 3);
const pusherMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const pusherMesh = new THREE.Mesh(pusherGeometry, pusherMaterial);
pusherMesh.position.set(0, 0.5, -1);
scene.add(pusherMesh);

const pusherShape = new CANNON.Box(new CANNON.Vec3(5, 0.5, 1.5));
const pusherBody = new CANNON.Body({ mass: 1, type: CANNON.Body.KINEMATIC, shape: pusherShape });
pusherBody.position.set(0, 0.5, -1);
pusherBody.material = new CANNON.Material();
pusherBody.material.friction = 1; // Adjust friction between pusher and coins
pusherBody.material.restitution = 0; // Adjust bounciness of the pusher
world.addBody(pusherBody);

let pusherDirection = -1;
function updatePusher() {
  pusherBody.position.z += 0.02 * pusherDirection;

  if (pusherBody.position.z <= -2.0 || pusherBody.position.z >= -0.5) {
    pusherDirection *= -1;
  }

  pusherMesh.position.copy(pusherBody.position);
  pusherMesh.quaternion.copy(pusherBody.quaternion);
  
    for (let i = 0; i < coins.length; i++) {
    const { body } = coins[i];
    if (
      body.position.z >= pusherBody.position.z - 1 &&
      body.position.z <= pusherBody.position.z + 1 &&
      body.position.y <= pusherBody.position.y + 1
    ) {
      body.position.z += 0.02 * pusherDirection;
    }
  }
}


function spawnCoin(x, y,z) {
  const coinGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32);
  const coinMaterial = new THREE.MeshLambertMaterial({ color: 0xffcc00 });
  const coinMesh = new THREE.Mesh(coinGeometry, coinMaterial);
  coinMesh.position.set(x, y, -1.5);
  coinMesh.rotation.x = Math.PI / 2;
  scene.add(coinMesh);

  const coinShape = new CANNON.Box(new CANNON.Vec3(0.4, 0.1 / 2, 0.4));
  const coinBody = new CANNON.Body({ mass: 1, shape: coinShape });
  coinBody.position.set(x, y, -1.5);
  coinBody.quaternion.setFromEuler(Math.PI / 2, 0, 0, "XYZ");
  coinBody.material = new CANNON.Material();
  coinBody.material.friction = 0.1; // Adjust friction between coins and platform
  coinBody.material.restitution = 0; // Adjust bounciness of the coins
    coinMesh.position.set(x, y, z);
  coinBody.position.set(x, y, z);
  world.addBody(coinBody);

  return { mesh: coinMesh, body: coinBody };
}




canvas.addEventListener('click', () => {
  const x = Math.random() * 8 - 4; // Random x-coordinate between -4 and 4
  const y = 4; // Fixed height of 4 units above the platform
  const z = -1.5; // Fixed z-coordinate to spawn coins above the pusher
  const newCoin = spawnCoin(x, y, z);
  coins.push(newCoin);
});

const coins = [];



function animate() {
requestAnimationFrame(animate);

world.step(1 / 60);

updatePusher();

for (let i = 0; i < coins.length; i++) {
const { mesh, body } = coins[i];
mesh.position.copy(body.position);
mesh.quaternion.copy(body.quaternion);
}

renderer.render(scene, camera);
}

animate();
