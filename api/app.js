// ########### Variables ###########
const PORT = process.env.PORT || 8000;
const app = require('express')();
const http = require('http');
const bodyParser = require('body-parser');
const seedrandom = require('seedrandom');
const fastnoise = require('fastnoisejs')
const server = http.createServer(app);
const path = require('path');

// ########### Server config ###########
app.use(bodyParser.json({ limit: "75mb" }));    // change this to allow larger image sizes

// ########### Server status endpoint ###########
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/map.html'))
});

// ########### Endpoints ###########
app.post('/requestMap', (req, res) => {
    try {
        var dataDecoded = toArrayBuffer(Buffer.from(req.body.data, 'base64'))
        var colors = req.body.colors
        var rivers = req.body.riverMode
        var lakes = req.body.lakeMode
        var island = req.body.islandMode
        var heightModifier = parseFloat(req.body.heightModifier)
        var islandFalloff = parseFloat(req.body.islandFalloff)
        var riverScale = parseFloat(req.body.riverScale)
        var lakeScale = parseFloat(req.body.lakeScale)
        var zoom = parseFloat(req.body.zoom)
        var data = dataDecoded
        var octaves = parseInt(req.body.octaves)
        var lenght = Math.pow(2, octaves)
        var width = Math.pow(2, octaves)
        var frequency = (parseFloat(req.body.frequency) / (lenght / 2048 * zoom)) / 1000
        var gain = parseFloat(req.body.gain)
        var lacunarity = parseFloat(req.body.lacunarity)
        var heightseed = seedrandom(req.body.hightSeed);
        var heightnoise = fastnoise.Create(heightseed.int32())
        
        heightnoise.SetNoiseType(fastnoise.SimplexFractal)
        heightnoise.SetFrequency(frequency)
        heightnoise.SetFractalOctaves(octaves)
        heightnoise.SetFractalGain(gain)
        heightnoise.SetFractalLacunarity(lacunarity)
        heightnoise.SetFractalType(fastnoise.FBM)

        if (rivers) {
            var riverseed = seedrandom(req.body.riverSeed);
            var rivernoise = fastnoise.Create(riverseed.int32())
            rivernoise.SetNoiseType(fastnoise.SimplexFractal)
            rivernoise.SetFrequency(frequency)
            rivernoise.SetFractalOctaves(octaves)
            rivernoise.SetFractalGain(gain)
            rivernoise.SetFractalLacunarity(lacunarity)
            rivernoise.SetFractalType(fastnoise.FBM)
        }

        if (lakes) {
            var lakeseed = seedrandom(req.body.lakeSeed);
            var lakenoise = fastnoise.Create(lakeseed.int32())
            lakenoise.SetNoiseType(fastnoise.SimplexFractal)
            lakenoise.SetFrequency(frequency)
            lakenoise.SetFractalOctaves(octaves)
            lakenoise.SetFractalGain(gain)
            lakenoise.SetFractalLacunarity(lacunarity)
            lakenoise.SetFractalType(fastnoise.FBM)
        }

        h1 = [hexToRgb(colors[0])[0], hexToRgb(colors[0])[1], hexToRgb(colors[0])[2]]
        h2 = [hexToRgb(colors[1])[0], hexToRgb(colors[1])[1], hexToRgb(colors[1])[2]]
        h3 = [hexToRgb(colors[2])[0], hexToRgb(colors[2])[1], hexToRgb(colors[2])[2]]
        h4 = [hexToRgb(colors[3])[0], hexToRgb(colors[3])[1], hexToRgb(colors[3])[2]]
        h5 = [hexToRgb(colors[4])[0], hexToRgb(colors[4])[1], hexToRgb(colors[4])[2]]
        h6 = [hexToRgb(colors[5])[0], hexToRgb(colors[5])[1], hexToRgb(colors[5])[2]]
        h7 = [hexToRgb(colors[6])[0], hexToRgb(colors[6])[1], hexToRgb(colors[6])[2]]
        h8 = [hexToRgb(colors[7])[0], hexToRgb(colors[7])[1], hexToRgb(colors[7])[2]]
        h9 = [hexToRgb(colors[8])[0], hexToRgb(colors[8])[1], hexToRgb(colors[8])[2]]
        h10 = [hexToRgb(colors[9])[0], hexToRgb(colors[9])[1], hexToRgb(colors[9])[2]]

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
                if (lakes) {
                    r2 = (lakenoise.GetNoise(x, y) + 0.75) / lakeScale
                }

                if (r <= 0.15 || (lakes && (r2 <= 0.1))) {
                    data[(x + y * lenght) * 4 + 0] = h1[0];
                    data[(x + y * lenght) * 4 + 1] = h1[1];
                    data[(x + y * lenght) * 4 + 2] = h1[2];
                }
                else if ((r > 0.15 && r <= 0.25) || (rivers && (r1 > 0 && r1 <= riverScale)) || (lakes && (r2 > 0 && r2 <= 0.25))) {
                    data[(x + y * lenght) * 4 + 0] = h2[0];
                    data[(x + y * lenght) * 4 + 1] = h2[1];
                    data[(x + y * lenght) * 4 + 2] = h2[2];
                }
                else if ((r > 0.25 && r <= 0.3)) {
                    data[(x + y * lenght) * 4 + 0] = h3[0];
                    data[(x + y * lenght) * 4 + 1] = h3[1];
                    data[(x + y * lenght) * 4 + 2] = h3[2];
                }
                else if (r > 0.3 && r <= 0.35) {
                    data[(x + y * lenght) * 4 + 0] = h4[0];
                    data[(x + y * lenght) * 4 + 1] = h4[1];
                    data[(x + y * lenght) * 4 + 2] = h4[2];
                }
                else if (r > 0.35 && r <= 0.45) {
                    data[(x + y * lenght) * 4 + 0] = h5[0];
                    data[(x + y * lenght) * 4 + 1] = h5[1];
                    data[(x + y * lenght) * 4 + 2] = h5[2];
                }
                else if (r > 0.45 && r <= 0.55) {
                    data[(x + y * lenght) * 4 + 0] = h6[0];
                    data[(x + y * lenght) * 4 + 1] = h6[1];
                    data[(x + y * lenght) * 4 + 2] = h6[2];
                }
                else if (r > 0.55 && r <= 0.7) {
                    data[(x + y * lenght) * 4 + 0] = h7[0];
                    data[(x + y * lenght) * 4 + 1] = h7[1];
                    data[(x + y * lenght) * 4 + 2] = h7[2];
                }
                else if (r > 0.7 && r <= 0.8) {
                    data[(x + y * lenght) * 4 + 0] = h8[0];
                    data[(x + y * lenght) * 4 + 1] = h8[1];
                    data[(x + y * lenght) * 4 + 2] = h8[2];
                }
                else if (r > 0.8 && r <= 0.9) {
                    data[(x + y * lenght) * 4 + 0] = h9[0];
                    data[(x + y * lenght) * 4 + 1] = h9[1];
                    data[(x + y * lenght) * 4 + 2] = h9[2];
                }
                else {
                    data[(x + y * lenght) * 4 + 0] = h10[0];
                    data[(x + y * lenght) * 4 + 1] = h10[1];
                    data[(x + y * lenght) * 4 + 2] = h10[2];
                }
                data[(x + y * lenght) * 4 + 3] = 255;

            }
        }

        const uint8ToBase64 = (arr) => Buffer.from(arr).toString('base64');
        modifieddata = uint8ToBase64(data)
        res.send(modifieddata);
    } catch (error) {
        res.send(JSON.stringify({ "status": "-1", "message": "Error: Failed to make map." }));
        console.log(error)
    }
});

// ########### Server listiner ###########
server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});

// ########### Helper Functions ###########
function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return [r, g, b];
}

function toArrayBuffer(buf) {
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8ClampedArray(ab);
    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return view;
}