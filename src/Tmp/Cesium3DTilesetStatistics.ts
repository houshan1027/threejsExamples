class Cesium3DTilesetStatistics {
    selected: number;
    visited: number;
    numberOfCommands: number;
    numberOfAttemptedRequests: number;
    numberOfPendingRequests: number;
    numberOfTilesProcessing: number;
    numberOfTilesWithContentReady: number;
    numberOfTilesTotal: number;
    numberOfFeaturesSelected: number;
    numberOfFeaturesLoaded: number;
    numberOfPointsSelected: number;
    numberOfPointsLoaded: number;
    numberOfTrianglesSelected: number;
    numberOfTilesStyled: number;
    numberOfFeaturesStyled: number;
    numberOfTilesCulledWithChildrenUnion: number;
    geometryByteLength: number;
    texturesByteLength: number;
    batchTableByteLength: number;
    constructor() {
        // Rendering statistics
        this.selected = 0;
        this.visited = 0;
        // Loading statistics
        this.numberOfCommands = 0;
        this.numberOfAttemptedRequests = 0;
        this.numberOfPendingRequests = 0;
        this.numberOfTilesProcessing = 0;
        this.numberOfTilesWithContentReady = 0; // Number of tiles with content loaded, does not include empty tiles
        this.numberOfTilesTotal = 0; // Number of tiles in tileset JSON (and other tileset JSON files as they are loaded)
        // Features statistics
        this.numberOfFeaturesSelected = 0; // Number of features rendered
        this.numberOfFeaturesLoaded = 0; // Number of features in memory
        this.numberOfPointsSelected = 0;
        this.numberOfPointsLoaded = 0;
        this.numberOfTrianglesSelected = 0;
        // Styling statistics
        this.numberOfTilesStyled = 0;
        this.numberOfFeaturesStyled = 0;
        // Optimization statistics
        this.numberOfTilesCulledWithChildrenUnion = 0;
        // Memory statistics
        this.geometryByteLength = 0;
        this.texturesByteLength = 0;
        this.batchTableByteLength = 0;
    }
}

export { Cesium3DTilesetStatistics };
