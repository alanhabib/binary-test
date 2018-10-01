const fs = require("fs");

fs.readFile("./trotting.bin", (err, data) => {
  if (err) throw err;

  // exempel på hur man kan kopiera alla värden över
  // från bufferten till en annan array
  let curOffset = 0;
  let myBufferData = [];
  while (curOffset < data.byteLength) {
    myBufferData.push(data.readInt8(curOffset));
    curOffset += 1;
  }

  console.log(myBufferData);
});

fs.readFile("./trotting.bin", (err, data) => {
  if (err) throw err;

  // 1 byte = 8 bitar = 2 hex
  //console.log(data);

  let curOffset = 0;

  // Packet header
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

  // Target header
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

  // Dynamic Data Package
  // if(dynamicDataCount > 0) {
  //     const dynamicDataId = data.readInt8(curOffset);
  //     curOffset += 1;
  //     const dynamicDataSize = data.readInt32LE(curOffset);
  //     curOffset += 4;
  //     const dynamicData = data[curOffset, curOffset + dynamicDataSize];
  //     curOffset += dynamicDataSize;

  //     console.log("dynamicDataId: " + dynamicDataId);
  //     console.log("dynamicDataSize: " + dynamicDataSize);
  //     console.log("dynamicData: " + dynamicData);
  //     };
});
