import { Viewer } from './Viewer/Viewer';

let viewer = new Viewer('app');
let scene = viewer.scene;
let renderer = viewer.renderer;
let camera = viewer.camera;

camera.position.set(3, 3, 3);
camera.lookAt(0, 0, 0);
renderer.setClearColor(0x263238);
