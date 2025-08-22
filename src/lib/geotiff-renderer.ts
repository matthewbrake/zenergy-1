
import { fromUrl, fromUrls, fromArrayBuffer, fromBlob } from 'geotiff';

const ironPalette = [
    '#000000', '#030206', '#06040C', '#0A0612', '#0D0818', '#100A1F',
    '#140C25', '#170E2B', '#1A1032', '#1E1238', '#21143E', '#241644',
    '#28184B', '#2B1A51', '#2E1C57', '#321E5D', '#352064', '#38226A',
    '#3C2470', '#3F2676', '#42287D', '#462A83', '#492C89', '#4C2E8F',
    '#503096', '#53329C', '#5634A2', '#5A36A8', '#5D38AE', '#603AB5',
    '#643CBb', '#673EC1', '#6A40C7', '#6E42CD', '#7144D3', '#7446D9',
    '#7848E0', '#7B4AE6', '#7E4CEC', '#824EF2', '#8550F8', '#8852FF',
    '#8B55F9', '#8E57F4', '#925AFE', '#955CF8', '#985EF3', '#9B61ED',
    '#9F63E8', '#A265E2', '#A567DD', '#A86AD7', '#AC6CD2', '#AF6ECC',
    '#B271C7', '#B573C1', '#B975BC', '#BC78B6', '#BF7AB1', '#C27CAB',
    '#C67FA6', '#C981A0', '#CC839B', '#CF8695', '#D38890', '#D68A8A',
    '#D98D85', '#DDA07F', '#E0A27A', '#E3A474', '#E6A76F', '#EAA969',
    '#EDAB64', '#F0AE5E', '#F4B059', '#F7B253', '#FABB4D', '#FDBC48',
    '#FFBF42', '#FFC13D', '#FFC238', '#FFC432', '#FFC62D', '#FFC827',
    '#FFCA22', '#FFCC1C', '#FFCE16', '#FFD011', '#FFD20B', '#FFD406',
    '#FFD600', '#FCD700', '#F9D800', '#F6D900', '#F3DA00', '#F0DB00',
    '#EDDC00', '#EADD00', '#E7DE00', '#E4DF00', '#E1E000', '#DEE100',
    '#DBE200', '#D8E300', '#D5E400', '#D2E500', '#CFE600', '#CCE700',
    '#C9E800', '#C6E900', '#C3EA00', '#C0EB00', '#BDEC00', '#BAED00',
    '#B7EE00', '#B4EF00', '#B1F000', '#AEF100', '#ABF200', '#A8F300',
    '#A5F400', '#A2F500', '#9FF600', '#9CF700', '#99F800', '#96F900',
    '#93FA00', '#90FB00', '#8DFC00', '#8AFD00', '#87FE00', '#84FF00',
    '#82FF00', '#82FF00', '#82FF00', '#85FF03', '#87FF06', '#8AFF09',
    '#8DFF0C', '#90FF0F', '#92FF12', '#95FF15', '#98FF18', '#9BFF1B',
    '#9DFF1E', '#A0FF21', '#A3FF24', '#A6FF27', '#A8FF2A', '#ABFF2D',
    '#AEFF30', '#B1FF33', '#B3FF36', '#B6FF39', '#B9FF3C', '#BCFF3F',
    '#BFFFE42', '#C1FF45', '#C4FF48', '#C7FF4B', '#CAFF4E', '#CCFF51',
    '#CFFF54', '#D2FF57', '#D5FF5A', '#D8FF5D', '#DBFF60', '#DDFF63',
    '#E0FF66', '#E3FF69', '#E6FF6C', '#E8FF6F', '#EBFF72', '#EEFF75',
    '#F1FF78', '#F3FF7B', '#F6FF7E', '#F9FF81', '#FCFF84', '#FFFF87',
    '#FFFF8C', '#FFFF90', '#FFFF95', '#FFFF99', '#FFFF9E', '#FFFFA2',
    '#FFFFA7', '#FFFFAB', '#FFFFB0', '#FFFFB4', '#FFFFB9', '#FFFFBD',
    '#FFFFC2', '#FFFFC6', '#FFFFCB', '#FFFFCF', '#FFFFD4', '#FFFFD8',
    '#FFFFDD', '#FFFFE1', '#FFFFE6', '#FFFFEA', '#FFFFEF', '#FFFFF3',
    '#FFFFF8', '#FFFFFF',
];

interface Palette {
  colors: string[];
  min: number;
  max: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function createPalette(palette: string[]): { r: number; g: number; b: number }[] {
    return palette.map(hexToRgb);
}

function normalize(value: number, min: number, max: number): number {
    if (max === min) return 1;
    const result = (value - min) / (max - min);
    return Math.max(0, Math.min(1, result)); // Clamp between 0 and 1
}


export async function renderGeoTiff(
    url: string,
    apiKey: string
): Promise<HTMLCanvasElement> {
    console.log('[GeoTiffRenderer] Starting GeoTIFF processing.');
    
    let tiff;
    try {
        console.log(`[GeoTiffRenderer] Fetching GeoTIFF from URL`);
        const fullUrl = `${url}&key=${apiKey}`;
        tiff = await fromUrl(fullUrl);
        console.log('[GeoTiffRenderer] Successfully fetched GeoTIFF data.');
    } catch (e) {
        console.error('[GeoTiffRenderer] Failed to fetch or load GeoTIFF:', e);
        throw new Error('Could not download GeoTIFF data from the provided URL.');
    }

    let image;
    try {
        console.log('[GeoTiffRenderer] Reading image from TIFF file.');
        image = await tiff.getImage();
        console.log(`[GeoTiffRenderer] Image details: width=${image.getWidth()}, height=${image.getHeight()}.`);
    } catch(e) {
        console.error('[GeoTiffRenderer] Failed to get image from TIFF:', e);
        throw new Error('Could not parse image data from the GeoTIFF file.');
    }
    
    let rasterData;
    try {
        console.log('[GeoTiffRenderer] Reading raster data from image.');
        rasterData = await image.readRasters();
        if (!rasterData || !rasterData[0]) {
            throw new Error('Raster data is empty or invalid.');
        }
        console.log(`[GeoTiffRenderer] Successfully read raster data with ${rasterData.length} bands.`);
    } catch (e) {
        console.error('[GeoTiffRenderer] Failed to read raster data:', e);
        throw new Error('Could not read raster data from the GeoTIFF image.');
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = image.getWidth();
    canvas.height = image.getHeight();
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error('[GeoTiffRenderer] Could not get 2D context from canvas.');
        throw new Error('Failed to create canvas context for rendering.');
    }
    
    console.log('[GeoTiffRenderer] Starting to render raster data to canvas.');
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    
    // Using a simplified palette for annual flux
    const palette = createPalette(ironPalette);
    const min = 0; // Min for annual flux
    const max = 1800; // Max for annual flux

    const data = rasterData[0] as number[];

    for (let i = 0; i < data.length; i++) {
        // Skip pixels with no data (often -9999 or similar)
        if (data[i] < min) {
            imageData.data[i * 4 + 3] = 0; // Transparent
            continue;
        }

        const normalized = normalize(data[i], min, max);
        const colorIndex = Math.floor(normalized * (palette.length - 1));
        const color = palette[colorIndex];
        
        imageData.data[i * 4] = color.r;
        imageData.data[i * 4 + 1] = color.g;
        imageData.data[i * 4 + 2] = color.b;
        imageData.data[i * 4 + 3] = 200; // Semi-transparent (0-255)
    }

    ctx.putImageData(imageData, 0, 0);
    console.log('[GeoTiffRenderer] Successfully rendered GeoTIFF to canvas.');

    return canvas;
}
