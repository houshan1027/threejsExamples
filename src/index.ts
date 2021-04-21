import {
    ShaderLib,
    TextureLoader,
    LoaderUtils,
    BoxGeometry,
    MeshStandardMaterial,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    Raycaster,
    Vector2,
    SphereGeometry,
    DoubleSide,
    Vector3,
    ShaderMaterial
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Resource } from './Core/Resource';
import { ScreenSpaceEventType } from './Core/ScreenSpaceEventType';
import { GlobeScene } from './Scene/GlobeScene';
import { Model } from './Scene/Model';
import { Viewer } from './Viewer/Viewer';

let viewer = new Viewer('app', {
    enabledEffect: false
});

viewer.removeDefaultBox();

let scene: GlobeScene = viewer.scene;
scene.lightCollection.removeDefaultLight();

let renderer = viewer.renderer;

let camera = viewer.camera;
camera.position.set(3, 3, 3);
camera.lookAt(0, 0, 0);

// viewer.background = new TextureLoader().load('/static/bg/default_bg_pc.jpg');

let model = Model.fromUrl({
    url: '/static/bg/DamagedHelmet/DamagedHelmet.gltf',
    decoderPath: '/static/libs/draco'
});
scene.addObject(model);

model.readyEvent.addEventListener(() => {
    console.log(scene);
});

scene.addHDREnvironment({
    url: '/static/bg/01_brasschaat_park_bushes.hdr'
});

const raycaster = new Raycaster();
const mouse = new Vector2();

const geometry = new SphereGeometry(0.1, 32, 32);
const material = new MeshBasicMaterial({ color: 0xffff00 });

viewer.screenSpaceEventHandler.setInputAction((movement: any) => {
    let pickPs = scene.pickPosition(movement.position);

    // const sphere2 = new Mesh(geometry, material);
    // scene.addObject(sphere2);
    // sphere2.position.copy(pickPs);

    mouse.x = (movement.position.x / scene.drawingBufferSize.width) * 2 - 1;
    mouse.y = -(movement.position.y / scene.drawingBufferSize.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (Array.isArray(intersects) && intersects.length > 0) {
        // const sphere2 = new Mesh(geometry, material);
        // scene.addObject(sphere2);
        // sphere2.position.copy(intersects[0].point);

        let r1 = new Vector3().subVectors(intersects[0].point, camera.position);
        let r2 = new Vector3().subVectors(pickPs, camera.position);
        console.log(r1.x / r2.x, r1.y / r2.y, r1.z / r2.z);
    }
}, ScreenSpaceEventType.LEFT_CLICK);

const geometry2 = new PlaneGeometry(scene.drawingBufferSize.width / 200, scene.drawingBufferSize.height / 200, 32);
const material2 = new ShaderMaterial({
    uniforms: {
        map: { value: scene.context.depthTexture },
        cameraNear: { value: camera.near },
        cameraFar: { value: camera.far }
    },
    vertexShader: `    #include <common>
        #include <logdepthbuf_pars_vertex>
    
        varying vec2 vUv;
        void main()
        {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    
            #include <logdepthbuf_vertex>
        }`,
    fragmentShader: `   #include <common>
    #include <packing>
    #include <logdepthbuf_pars_fragment>

    varying vec2 vUv;
    uniform sampler2D map;
    uniform float cameraNear;
	uniform float cameraFar;

    float readDepth( sampler2D depthSampler, vec2 coord ) {
        float fragCoordZ = texture2D( depthSampler, coord ).x;
        float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
        return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
    }

    void main(void){
        #include <logdepthbuf_fragment>

        float depth = readDepth( map, vUv );

        gl_FragColor.rgb = 1.0 - vec3( depth );
        gl_FragColor.a = 1.0;
        
    }`
});

let basicMat = new MeshBasicMaterial();

const plane = new Mesh(geometry2, basicMat);
scene.addObject(plane);
plane.position.set(0, 3, 0);
scene.preUpdate.addEventListener(() => {
    // plane.material.uniforms.map.value = scene.context.depthTexture;
    plane.material.map = scene.context.depthTexture;
});
