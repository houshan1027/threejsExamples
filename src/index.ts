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
    ShaderMaterial,
    FileLoader,
    CanvasTexture,
    RGBAFormat,
    ImageBitmapLoader
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Resource } from './Core/Resource';
import { ScreenSpaceEventType } from './Core/ScreenSpaceEventType';
import { GlobeScene } from './Scene/GlobeScene';
import { Model } from './Scene/Model';
// import { Cesium3Dtileset } from './Tmp/Cesium3Dtileset';
// import { CesiumTile } from './Tmp/CesiumTile';
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
// scene.addObject(model);

model.readyEvent.addEventListener(() => {
    console.log(model);
});

scene.addHDREnvironment({
    url: '/static/bg/01_brasschaat_park_bushes.hdr'
});

const raycaster = new Raycaster();
const mouse = new Vector2();

viewer.screenSpaceEventHandler.setInputAction((movement: any) => {
    // console.log(movement.endPosition);
    let pickPs = scene.pickPosition(movement.endPosition);

    mouse.x = (movement.endPosition.x / scene.drawingBufferSize.width) * 2 - 1;
    mouse.y = -(movement.endPosition.y / scene.drawingBufferSize.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (Array.isArray(intersects) && intersects.length > 0) {
        let r1 = new Vector3().subVectors(intersects[0].point, camera.position);
        let r2 = new Vector3().subVectors(pickPs, camera.position);
        // console.log(r1.x / r2.x, r1.y / r2.y, r1.z / r2.z);
    }
}, ScreenSpaceEventType.MOUSE_MOVE);

const geometry3 = new BoxGeometry(1, 1, 1);
const material3 = new MeshBasicMaterial();
const cube = new Mesh(geometry3, material3);
scene.addObject(cube);

// let url: string = 'http://bos3d-alpha.bimwinner.com/api/bos3dalpha/files?fileKey=Z3JvdXAxLE0wMC84Qy8zNi9yQkFCQjE5eHNhR0FjVGZ0QUcyRUJRSURIdGs0MDAucG5n';

// fetch(url)
//     .then(res => {
//         return res.blob();
//     })
//     .then(blob => {
//         return createImageBitmap(blob, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
//     })
//     .then(imageBitmap => {
//         let map = new CanvasTexture(imageBitmap);
//         map.format = RGBAFormat;
//         // plane.material.map = map;

//         cube.material.map = map;
//         cube.material.needsUpdate = true;
//         console.log('aaa');
//     });

// let loader = new ImageBitmapLoader();
// loader.setOptions({ imageOrientation: 'flipY' });

// loader.loadAsync(url).then(imageBitmap => {
//     let map = new CanvasTexture(imageBitmap);
//     map.format = RGBAFormat;
//     // plane.material.map = map;
//     cube.material.map = map;
//     cube.material.needsUpdate = true;
// });

//!------------------------------------------------------------------------------------------
// 这里每个CesiumTile代表一个构件
// function createCube(color: any) {
//     const geometry = new BoxGeometry(1, 1, 1);
//     const material = new MeshBasicMaterial({ color: color });
//     return new Mesh(geometry, material);
// }

// let tileset = new Cesium3Dtileset();
// scene.addObject(tileset);

// let tile = new CesiumTile(tileset, tileset.root);
// tile.comKey = 'aaa';
// tileset.addTile(tile.comKey, tile);

// let component1 = createCube(0xff0000);
// let component2 = createCube(0x00ff00);
// component2.position.y += 2;

// tile.content.set('component1', component1);
// tile.content.set('component2', component2);

//~--------------------------------

// let tile2 = new CesiumTile(tileset, tileset.root);
// tile2.comKey = 'bbb';
// tileset.addTile(tile2.comKey, tile2);

// let tile2Component = createCube(0x0000ff);
// tile2Component.position.y -= 2;

// tile2.content.set('tile2Component', tile2Component);

// console.log(tileset);

// scene.context.addEventListener('render', (res: any) => {
//     // console.log(res);

//     cube.material.map = res.res.texture;
//     cube.material.needsUpdate = true;
// });
// tile2.visible = false;
