const Canvas = require('canvas');
const fs = require('fs')
const seedrandom = require('seedrandom');
const fastnoise = require('fastnoisejs')

// Generic settings
var fileName = "map"        // name of the output png file
var hightSeed = "07684239"  // main map seed
var riverSeed = "23662342"  // seed of river generation if rivers are enabled
var lakeSeed = "8745370423" // seed of lake generation if rivers are enabled
var zoom = 1                // map zoom multiplier

// Map customization settings
var lake = true             // toggles lakes
var rivers = true           // toggles rivers
var island = false          // toggles island map
var islandFalloff = 0.5     // lower value = more water around island
var heightModifier = 1.5    // lower value = more water and less land
var riverScale = 0.025      // lower value = thinner rivers
var lakeScale = 2.5         // lower value = more lakes

// Map colors in hex
var ocean = `0052FF`;
var shore = `006DFF`;
var beach = `979549`;
var plains = `486200`;
var grass = `155900`;
var forest = `006207`;
var hillside = `096B00`;
var hill = `3F771B`;
var mountain = `6E8431`;
var top = `92AA65`;

/* The octave count controls lenght, width and frequency so it will always be the same map regardless of the octave count.
If you want full control over them simply swap them out with the commented code. */
var octaves = 11
var lenght = Math.pow(2, octaves)               // var lenght = 2048
var width = Math.pow(2, octaves)                // var width = 2048
var frequency = 0.001 / (lenght / 2048 * zoom)  // var frequency = 0.001
var gain = 0.5
var lacunarity = 2

const canvas = Canvas.createCanvas(lenght, width);
const out = fs.createWriteStream(`${fileName}.png`)
const stream = canvas.createPNGStream()
const ctx = canvas.getContext('2d');
var imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height)
var data = imgdata.data

function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return [r, g, b];
}

var heightseed = seedrandom(hightSeed);
var heightnoise = fastnoise.Create(heightseed.int32())
heightnoise.SetNoiseType(fastnoise.SimplexFractal)
heightnoise.SetFrequency(frequency)
heightnoise.SetFractalOctaves(octaves)
heightnoise.SetFractalGain(gain)
heightnoise.SetFractalLacunarity(lacunarity)
heightnoise.SetFractalType(fastnoise.FBM)

if (rivers) {
    var riverseed = seedrandom(riverSeed);
    var rivernoise = fastnoise.Create(riverseed.int32())
    rivernoise.SetNoiseType(fastnoise.SimplexFractal)
    rivernoise.SetFrequency(frequency)
    rivernoise.SetFractalOctaves(octaves)
    rivernoise.SetFractalGain(gain)
    rivernoise.SetFractalLacunarity(lacunarity)
    rivernoise.SetFractalType(fastnoise.FBM)
}

if (lake) {
    var lakeseed = seedrandom(lakeSeed);
    var lakenoise = fastnoise.Create(lakeseed.int32())
    lakenoise.SetNoiseType(fastnoise.SimplexFractal)
    lakenoise.SetFrequency(frequency)
    lakenoise.SetFractalOctaves(octaves)
    lakenoise.SetFractalGain(gain)
    lakenoise.SetFractalLacunarity(lacunarity)
    lakenoise.SetFractalType(fastnoise.FBM)
}

h1 = [hexToRgb(ocean)[0], hexToRgb(ocean)[1], hexToRgb(ocean)[2]]
h2 = [hexToRgb(shore)[0], hexToRgb(shore)[1], hexToRgb(shore)[2]]
h3 = [hexToRgb(beach)[0], hexToRgb(beach)[1], hexToRgb(beach)[2]]
h4 = [hexToRgb(plains)[0], hexToRgb(plains)[1], hexToRgb(plains)[2]]
h5 = [hexToRgb(grass)[0], hexToRgb(grass)[1], hexToRgb(grass)[2]]
h6 = [hexToRgb(forest)[0], hexToRgb(forest)[1], hexToRgb(forest)[2]]
h7 = [hexToRgb(hillside)[0], hexToRgb(hillside)[1], hexToRgb(hillside)[2]]
h8 = [hexToRgb(hill)[0], hexToRgb(hill)[1], hexToRgb(hill)[2]]
h9 = [hexToRgb(mountain)[0], hexToRgb(mountain)[1], hexToRgb(mountain)[2]]
h10 = [hexToRgb(top)[0], hexToRgb(top)[1], hexToRgb(top)[2]]

for (let x = 0; x < lenght; x++) {
    for (let y = 0; y < width; y++) {

        if (island) {
            var a = x - lenght / 2;
            var b = y - width / 2;
            var c = Math.sqrt(a * a + b * b) / lenght / 2
            mod = (2.5 - (c * 8.5)) * islandFalloff
            if (mod > 0.9) { mod = 0.9 }
            r = ((heightnoise.GetNoise(x, y)) + (0.275 * heightModifier)) * mod
        }
        else {
            r = heightnoise.GetNoise(x, y) + (0.25 * heightModifier)
        }

        if (rivers) {
            r1 = rivernoise.GetNoise(x, y)
        }
        if (lake) {
            r2 = lakenoise.GetNoise(x, y) + (0.25 * lakeScale)
        }

        if (r <= 0.15 || (lake && (r2 <= 0.1))) {
            data[(x + y * lenght) * 4 + 0] = h1[0];
            data[(x + y * lenght) * 4 + 1] = h1[1];
            data[(x + y * lenght) * 4 + 2] = h1[2];
            data[(x + y * lenght) * 4 + 3] = 255;
        }
        else if ((r > 0.15 && r <= 0.25) || (rivers && (r1 > 0 && r1 <= riverScale)) || (lake && (r2 > 0.1 && r2 <= 0.15))) {
            data[(x + y * lenght) * 4 + 0] = h2[0];
            data[(x + y * lenght) * 4 + 1] = h2[1];
            data[(x + y * lenght) * 4 + 2] = h2[2];
            data[(x + y * lenght) * 4 + 3] = 255;
        }
        else if ((r > 0.25 && r <= 0.3)) {
            data[(x + y * lenght) * 4 + 0] = h3[0];
            data[(x + y * lenght) * 4 + 1] = h3[1];
            data[(x + y * lenght) * 4 + 2] = h3[2];
            data[(x + y * lenght) * 4 + 3] = 255;
        }
        else if (r > 0.3 && r <= 0.35) {
            data[(x + y * lenght) * 4 + 0] = h4[0];
            data[(x + y * lenght) * 4 + 1] = h4[1];
            data[(x + y * lenght) * 4 + 2] = h4[2];
            data[(x + y * lenght) * 4 + 3] = 255;
        }
        else if (r > 0.35 && r <= 0.45) {
            data[(x + y * lenght) * 4 + 0] = h5[0];
            data[(x + y * lenght) * 4 + 1] = h5[1];
            data[(x + y * lenght) * 4 + 2] = h5[2];
            data[(x + y * lenght) * 4 + 3] = 255;
        }
        else if (r > 0.45 && r <= 0.55) {
            data[(x + y * lenght) * 4 + 0] = h6[0];
            data[(x + y * lenght) * 4 + 1] = h6[1];
            data[(x + y * lenght) * 4 + 2] = h6[2];
            data[(x + y * lenght) * 4 + 3] = 255;
        }
        else if (r > 0.55 && r <= 0.7) {
            data[(x + y * lenght) * 4 + 0] = h7[0];
            data[(x + y * lenght) * 4 + 1] = h7[1];
            data[(x + y * lenght) * 4 + 2] = h7[2];
            data[(x + y * lenght) * 4 + 3] = 255;
        }
        else if (r > 0.7 && r <= 0.8) {
            data[(x + y * lenght) * 4 + 0] = h8[0];
            data[(x + y * lenght) * 4 + 1] = h8[1];
            data[(x + y * lenght) * 4 + 2] = h8[2];
            data[(x + y * lenght) * 4 + 3] = 255;
        }
        else if (r > 0.8 && r <= 0.9) {
            data[(x + y * lenght) * 4 + 0] = h9[0];
            data[(x + y * lenght) * 4 + 1] = h9[1];
            data[(x + y * lenght) * 4 + 2] = h9[2];
            data[(x + y * lenght) * 4 + 3] = 255;
        }
        else {
            data[(x + y * lenght) * 4 + 0] = h10[0];
            data[(x + y * lenght) * 4 + 1] = h10[1];
            data[(x + y * lenght) * 4 + 2] = h10[2];
            data[(x + y * lenght) * 4 + 3] = 255;
        }

    }
}

ctx.putImageData(imgdata, 0, 0);
stream.pipe(out)