import * as THREE from 'three';

import metaversefile from 'metaversefile';

const { useApp, useFrame, useInternals, useLocalPlayer, useLoaders, usePhysics, useCleanup, useActivate } = metaversefile;
const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localVector3 = new THREE.Vector3();
const localVector4 = new THREE.Vector3();
const localVector5 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localQuaternion2 = new THREE.Quaternion();
const localQuaternion3 = new THREE.Quaternion();
const localQuaternion4 = new THREE.Quaternion();


export default () => {
  const app = useApp();
  const { renderer, camera } = useInternals();
  const localPlayer = useLocalPlayer();
  const physics = usePhysics();
  const textureLoader = new THREE.TextureLoader();
  
  //####################################################### load bridge glb ####################################################
  {    
    let velocity = new THREE.Vector3();
    let angularVel = new THREE.Vector3();
    let physicsIds = [];
    let glassArray = [];
    (async () => {
        const u = `${baseUrl}/assets/stange.glb`;
        let gltf = await new Promise((accept, reject) => {
            const {gltfLoader} = useLoaders();
            gltfLoader.load(u, accept, function onprogress() {}, reject);
            
        });
        app.add(gltf.scene);
        app.updateMatrixWorld();
    })();
    (async () => {
        const u = `${baseUrl}/assets/rest.glb`;
        let gltf = await new Promise((accept, reject) => {
            const {gltfLoader} = useLoaders();
            gltfLoader.load(u, accept, function onprogress() {}, reject);

            const geometry = new THREE.BoxGeometry( 2, 0.05, 2 );
            const material = new THREE.MeshLambertMaterial( { color: 0x09102b, opacity: 0.5, transparent: true} );
            const mesh = new THREE.Mesh( geometry, material );
            const mesh2 = new THREE.Mesh( geometry, material );

            for (var i = 0; i < 18; i++) {
              let temp = mesh.clone();
               temp.position.set(-20 + i*3.7, -1.7, -6.46);
               app.add( temp );
               glassArray.push(temp);
               temp.updateMatrixWorld();
               const physicsId = physics.addGeometry(temp);
               physicsIds.push(physicsId);
               temp.physicsId = physicsId;
               physicsId.glassObj = temp;

               let temp2 = mesh2.clone();
               temp2.position.set(-20 + i*3.7, -1.7, -3.46);
               app.add( temp2 );
               glassArray.push(temp2);
               temp2.updateMatrixWorld();
               const physicsId2 = physics.addGeometry(temp2);
               physicsIds.push(physicsId2);
               temp2.physicsId = physicsId2;
               physicsId2.glassObj = temp2;

               if (Math.random() > 0.5) { temp.breakable = true } else { temp2.breakable = true};

            }
            
        });
        app.add(gltf.scene);

        const physicsId = physics.addGeometry(gltf.scene);
        physicsIds.push(physicsId);
        app.updateMatrixWorld();
    })();
    useCleanup(() => {
      for (const physicsId of physicsIds) {
        physics.removeGeometry(physicsId);
      }
    });

    useFrame(({ timeDiff, timestamp }) => {

      if(localPlayer.avatar) {
        const downQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI*0.5);
        const resultDown = physics.raycast(localPlayer.position, downQuat);
        if(resultDown && localPlayer.characterPhysics.lastGroundedTime === timestamp) {
          let foundObj = metaversefile.getPhysicsObjectByPhysicsId(resultDown.objectId);
          if(foundObj) {
            if(foundObj.glassObj) {
              if(foundObj.glassObj.breakable) {
                foundObj.glassObj.visible = false;
                physics.disableGeometry(foundObj);
                physics.disableGeometryQueries(foundObj);
              }
            }
          }

        }
      }


      if(localPlayer.position.y < -25) {
        physics.setCharacterControllerPosition(localPlayer.characterController, new THREE.Vector3(-25, 0, -5));
      }

      
    });
  }

  return app;
};

