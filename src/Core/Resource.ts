import { MathUtils, Texture, TextureLoader } from 'three';

interface fetchImageParameters {
    url: string;
}

let Resource = {
    fetchImage(options: fetchImageParameters): Promise<Texture> {
        return new TextureLoader().loadAsync(options.url);
    }
};

export { Resource };
