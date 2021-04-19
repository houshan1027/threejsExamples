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
    Vector2
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

viewer.background = new TextureLoader().load('/static/bg/default_bg_pc.jpg');

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

viewer.screenSpaceEventHandler.setInputAction((movement: any) => {
    // console.log(movement);

    mouse.x = (movement.position.x / scene.drawingBufferSize.width) * 2 - 1;
    mouse.y = -(movement.position.y / scene.drawingBufferSize.height) * 2 + 1;

    console.log(scene.pickPosition(movement.position));

    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, true);
    console.log(intersects);
}, ScreenSpaceEventType.LEFT_CLICK);
