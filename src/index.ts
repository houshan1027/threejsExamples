import {
    ShaderLib,
    TextureLoader,
    LoaderUtils,
    BoxGeometry,
    MeshStandardMaterial,
    Mesh
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Resource } from './Core/Resource';
import { GlobeScene } from './Scene/GlobeScene';
import { Model } from './Scene/Model';
import { Viewer } from './Viewer/Viewer';

let viewer = new Viewer('app', {
    enabledEffect: true
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

scene.addHDREnvironment({
    url: '/static/bg/01_brasschaat_park_bushes.hdr'
});
