import {
    ShaderLib,
    TextureLoader,
    LoaderUtils,
    BoxGeometry,
    MeshStandardMaterial,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry
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

// const geometry = new PlaneGeometry(1, 1);
// const material = new MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new Mesh(geometry, material);
// scene.addObject(cube);
// cube.position.y += 2.0;

// scene.preUpdate.addEventListener(() => {
//     cube.material.map = scene.frameState.context.renderTarget.texture;
// });

viewer.screenSpaceEventHandler.setInputAction((movement: any) => {
    console.log(movement);
}, ScreenSpaceEventType.LEFT_CLICK);
