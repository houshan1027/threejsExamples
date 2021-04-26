import { Box3, Box3Helper, BoxGeometry, Mesh, MeshBasicMaterial } from 'three';
import { getMagic } from './GltfPipeline/getMagic';
import { Resource } from './Core/Resource';
import { Batched3DModel3DTileContent } from './Scene/Batched3DModel3DTileContent';
import { GlobeScene } from './Scene/GlobeScene';
import { Cesium3Dtileset } from './Tmp/Cesium3Dtileset';
import { CesiumTile } from './Tmp/CesiumTile';
import { Model } from './Scene/Model';

function tilesetTmp(scene: GlobeScene) {
    // 这里每个CesiumTile代表一个构件
    function createCube(color: any) {
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshBasicMaterial({ color: color });
        return new Mesh(geometry, material);
    }
    let tileset = new Cesium3Dtileset({
        url: 'https://raw.githubusercontent.com/AnalyticalGraphicsInc/3d-tiles-samples/master/tilesets/TilesetWithDiscreteLOD/tileset.json'
    });
    scene.addObject(tileset);

    Resource.fetchArrayBuffer({
        // url: 'http://192.168.1.29:3746/8_0_0_0.b3dm'
        url: 'https://raw.githubusercontent.com/AnalyticalGraphicsInc/3d-tiles-samples/master/tilesets/TilesetWithDiscreteLOD/dragon_low.b3dm'
    }).then((arraybuffer: any) => {
        let content = new Batched3DModel3DTileContent(tileset, undefined, undefined, arraybuffer, 0);
        scene.addObject(content);

        content.readyPromise.then((model: any) => {
            console.log(model);
        });
    });

    // let tile = new CesiumTile(tileset, tileset.root);
    // tile.comKey = 'aaa';
    // tileset.addTile(tile.comKey, tile);
    // let component1 = createCube(0xff0000);
    // let component2 = createCube(0x00ff00);
    // component2.position.y += 2;
    // tile.content.set('component1', component1);
    // tile.content.set('component2', component2);
    // //~--------------------------------
    // let tile2 = new CesiumTile(tileset, tileset.root);
    // tile2.comKey = 'bbb';
    // tileset.addTile(tile2.comKey, tile2);
    // let tile2Component = createCube(0x0000ff);
    // tile2Component.position.y -= 2;
    // tile2.content.set('tile2Component', tile2Component);
    // console.log(tileset);

    // tile2.visible = false;
}

export { tilesetTmp };
