const fs = require("fs");

// fs.readFile("./trotting.bin", (err, data) => {
//   if (err) throw err;

// kopiera alla värden över från bufferten till en annan array

fs.readFile("./trotting.bin", (err, data) => {
  if (err) throw err;

  // 1 byte = 8 bitar = 2 hex
  //console.log(data);

  // här tar jag ut packetheader för att ta mig igenom den
  //  i samma veva försöker jag ta ut targetcount från targetheader för att få ut mina hästar

  const packet = packetHeader(data);

  let targetCounter = 0, offset = packet.offset;

  while (offset < data.length && targetCounter < packet.targetCount) {
    const block = data.slice(offset, offset + 25);
    console.log(targetCounter, offset, '-------------------------------------');
    targetHeader(block);
    offset += block.length
    targetCounter++;
  }

  // för att se ifall något körs efter att vi utfört vår while loop ovan
  // const leftPacket = [];
  // while (offset < data.length) {
  //   leftPacket.push(data.readInt8(offset));
  //   offset += 1;
  // }
  // console.log(leftPacket);


  // Ifall man väljer att lägga in dynamic data kör man det på det här sättet

  // Dynamic Data Package
  if (packet.dynamicDataCount > 0) {
    const dynamicDataId = data.readInt8(offset);
    offset += 1;
    const dynamicDataSize = data.readInt32LE(offset);
    offset += 4;
    const dynamicData = data[offset, offset + packet.dynamicDataSize];
    offset += dynamicDataSize;

    console.log("dynamicDataId: " + dynamicDataId);
    console.log("dynamicDataSize: " + packet.dynamicDataSize);
    console.log("dynamicData: " + dynamicData);
  };
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

  const distanceToGoalLine = data.readFloatLE(curOffset); // 38 (BE)
  curOffset += 4;

  const speed = data.readFloatLE(curOffset); // 42 (BE)
  curOffset += 4;

  console.log("horseNo: " + horseNo);
  console.log("posX: " + posX);
  console.log("posY: " + posY);
  console.log("posZ: " + posZ);
  console.log("laneNumber: " + laneNumber);
  console.log("distanceToGoalLine: " + distanceToGoalLine);
  console.log("speed: " + speed);

}

// lägger packet header i egen funktion och försöker utvinna datan från det
// Packet header
function packetHeader(data) {
  let curOffset = 0;

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

  console.log("versionId: " + versionId);
  console.log("trackId: " + trackId);
  console.log("raceId: " + raceId);
  let date = new Date(1000 * timestamp);
  console.log("timestamp: " + timestamp);
  console.log("timestamp as date: " + date);
  console.log("targetCount: " + targetCount);
  console.log("dynamicDataSize: " + dynamicDataSize);
  console.log("dynamicDataCount: " + dynamicDataCount);

  // lägga in detta i object för att få ut targetCount och offset
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


