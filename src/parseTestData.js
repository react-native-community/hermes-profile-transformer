const fs = require('fs');
const TEST_DATA = 'hermes_sample.cpuprofile';

const readData = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const obtainData = async path => {
  const data = JSON.parse(await readData(path));
  return data;
};

const processData = data => {
  const samples = data.samples;
  const stackFrames = data.stackFrames;
  return samples.map(sample => {
    const { name, category, parent } = stackFrames[sample.sf.toString()];
    sample.sf = { name, category, parent };
    return sample;
  });
};

const callStack = async path => {
  const data = await obtainData(path);
  const processed_data = processData(data);
  const stackFrames = data.stackFrames;
  let parentStructure = ``;
  for (const stackFrameId in stackFrames) {
    const endIndex = stackFrames[stackFrameId].name.indexOf('(');
    let name = '';
    if (endIndex === 0) {
      name = stackFrames[stackFrameId].name.substring(
        1,
        stackFrames[stackFrameId].name.indexOf(')') - 1
      );
    } else if (endIndex === -1) {
      name = stackFrames[stackFrameId].name;
    } else {
      name = stackFrames[stackFrameId].name.substring(0, endIndex);
    }
    const parentId = stackFrames[stackFrameId].parent;
    let depth = 0;
    if (parentId) {
      depth = stackFrames[parentId].depth + 1;
    }
    stackFrames[stackFrameId].depth = depth;
    const tabString = ' '.repeat(depth);
    parentStructure += tabString + name + `\n`;
  }
  fs.writeFile('processStack.txt', parentStructure, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log('The file was saved!');
  });
};

callStack(TEST_DATA);
