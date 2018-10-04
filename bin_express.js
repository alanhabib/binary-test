const express = require("express");
const cors = require("cors");
const assert = require("assert");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();

const PORT = 4000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//app.use(cors());

app.get("/", async (req, res, err) => {
  res.sendFile("bubble-chart.html");

})

app.get("/info", async (req, res, err) => {

  // 1 byte = 8 bitar = 2 hex
  // läser readfile

  fs.readFile("./trotting.bin", (err, data) => {
    if (err) throw err;

    // lägger offset på 0 för att måste starta från början i filen
    let offset = 0;

    let horses = [];

    //  går igenom all data i packetHeader hämtar först ut den
    while (offset < data.length) {
      const packet = packetHeader(data, offset);

      let targetCounter = 0;

      offset = packet.offset;
      // hämtar ut target header och returnerar target count
      while (offset < data.length && targetCounter < packet.targetCount) {
        const block = data.slice(offset, offset + 25);
        //console.log(targetCounter, offset, '-------------------------------------');
        const tgt = targetHeader(block);
        offset += block.length;
        let date = new Date(1000 * packet.timestamp);

        horses[tgt.horseNo] = horses[tgt.horseNo] ? horses[tgt.horseNo] : [];
        horses[tgt.horseNo].push({ y: tgt.distanceToGoalLine, x: date, z: 1 });

        //console.log(horses[tgt.horseNo]);

        targetCounter++;
        //console.log(block);
      }
      // testar ifall det finns dynamic data
      // Dynamic Data Package
      if (packet.dynamicDataCount > 0) {
        const dynamicDataId = data.readInt8(offset);
        offset += 1;
        const dynamicDataSize = data.readInt32LE(offset);
        offset += 4;
        const dynamicData = data[(offset, offset + packet.dynamicDataSize)];
        offset += dynamicDataSize;

        console.log("dynamicDataId: " + dynamicDataId);
        console.log("dynamicDataSize: " + packet.dynamicDataSize);
        console.log("dynamicData: " + dynamicData);
      }

      //console.log('END PACKET --------------------------------------');
    }

    const actualHorses = horses
      .map((f, i) => {
        return { horseNo: i, data: f };
      })
      .filter(f => f.data.length !== 0);
    res.send(actualHorses);
    console.log("horses ->", actualHorses);
  });

  // bryter ut target header till en egen funktion  och tar ut datan från varje element

  function targetHeader(data) {
    let curOffset = 0;

    const horseNo = data.readInt8(curOffset);
    curOffset += 1;

    const posX = data.readFloatLE(curOffset); // 22 (BE)
    curOffset += 4;

    const posY = data.readFloatLE(curOffset); // 26 (BE)
    curOffset += 4;

    const posZ = data.readFloatLE(curOffset); // 30 (BE)
    curOffset += 4;

    const laneNumber = data.readFloatLE(curOffset); // 34 (BE)
    curOffset += 4;

    // stod och kika på koden hela lunchen för att se varför den var på 0 tills jag upptäckte att när de går i mål blir sträckan 0
    // console.log(data[curOffset]);

    const distanceToGoalLine = data.readFloatLE(curOffset); // 38 (BE)
    curOffset += 4;

    const speed = data.readFloatLE(curOffset); // 42 (BE)
    curOffset += 4;

    // console.log("horseNo: " + horseNo);
    // console.log("posX: " + posX);
    // console.log("posY: " + posY);
    // console.log("posZ: " + posZ);
    // console.log("laneNumber: " + laneNumber);
    // console.log("distanceToGoalLine: " + distanceToGoalLine);
    // console.log("speed: " + speed);

    return {
      horseNo: horseNo,
      posX: posX,
      posY: posY,
      distanceToGoalLine: distanceToGoalLine
    };
  }

  // lägger packet header i egen funktion och försöker utvinna datan från det
  // Packet header
  function packetHeader(data, curOffset) {
    const versionId = data.readInt8(curOffset);
    curOffset += 1;

    const trackId = data.readInt8(curOffset);
    curOffset += 1;

    const raceId = data.readInt8(curOffset);
    curOffset += 1;

    const timestamp = data.readDoubleLE(curOffset);
    curOffset += 8;

    const targetCount = data.readInt8(curOffset);
    curOffset += 1;

    const dynamicDataSize = data.readInt32LE(curOffset);
    curOffset += 4;

    const dynamicDataCount = data.readUInt16LE(curOffset);
    curOffset += 2;

    // console.log("versionId: " + versionId);
    // console.log("trackId: " + trackId);
    // console.log("raceId: " + raceId);
    // let date = new Date(1000 * timestamp);
    // console.log("timestamp: " + timestamp);
    // console.log("timestamp as date: " + date);
    // console.log("targetCount: " + targetCount);
    // console.log("dynamicDataSize: " + dynamicDataSize);
    // console.log("dynamicDataCount: " + dynamicDataCount);

    // returnar detta i object för att få ut targetCount och offset och gå igenom all data
    return {
      versionId: versionId,
      trackId: trackId,
      raceId: raceId,
      timestamp: timestamp,
      targetCount: targetCount,
      dynamicDataSize: dynamicDataSize,
      dynamicDataCount: dynamicDataCount,
      offset: curOffset
    };
  }
});

app.listen(PORT);
