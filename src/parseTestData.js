const fs = require('fs');
const TEST_DATA = 'hermes_sample.cpuprofile';

const readData = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err, data) => {
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

const getPidTid = data => {
  const pidTid = {};
  data.forEach((sample, idx) => {
    property = `${sample.pid}:${sample.tid}`;
    if (!(property in pidTid)) {
      pidTid[property] = [];
    }
    pidTid[property].push(sample);
  });
  return pidTid;
};

const getProcesses = data => {
  return data
    .map(sample => sample.pid)
    .filter((value, index, self) => self.indexOf(value) === index);
};

const processData = data => {
  let samples = data.samples;
  const stackFrames = data.stackFrames;
  return samples.map(sample => {
    const stackFrameId = sample.sf.toString();
    sample.sf = { ...stackFrames[stackFrameId], sfNumber: stackFrameId };
    const endIndex = stackFrames[stackFrameId].name.indexOf('(');
    if (endIndex === 0) {
      sample.name = '(anonymous)';
    } else if (endIndex === -1) {
      sample.name = stackFrames[stackFrameId].name;
    } else {
      sample.name = stackFrames[stackFrameId].name.substring(0, endIndex);
    }
    return sample;
  });
};

const callStack = async path => {
  const data = await obtainData(path);
  const stackFrames = data.stackFrames;
  let parentStructure = ``;
  for (const stackFrameId in stackFrames) {
    const endIndex = stackFrames[stackFrameId].name.indexOf('(');
    let name = '';
    if (endIndex === 0) {
      name = '(anonymous)';
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

const loadData = path => {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch (err) {
    console.error(err);
    return false;
  }
};

const storeData = (data, path) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
};

const constructChromeSample = sample => {
  return {
    pid: sample.pid,
    tid: Number(sample.tid),
    ts: Number(sample.ts),
    name: sample.name,
    args: { ...sample },
  };
};

const removeInvalidEvents = (events, trackEvents) => {
  for (property in trackEvents) {
    const propertyEvents = trackEvents[property].idx;
    if (propertyEvents.length % 2) {
      const toRemove = propertyEvents[propertyEvents.length - 1];
      events.splice(toRemove, 1);
    }
  }
  return events;
};

const convertToDurationEvents = async path => {
  const data = await obtainData(path);
  const processed_data = processData(data);
  const processes = getProcesses(processed_data);
  const processThreads = getPidTid(processed_data);
  processes.forEach(process => {
    const keys = Object.keys(processThreads).filter(
      key => key.substring(0, process.toString().length) === process.toString()
    );
    keys.forEach(key => {
      const pid = key.substring(0, key.indexOf(':'));
      const tid = key.substring(key.indexOf(':') + 1);
      const toConsider = processThreads[key].sort((a, b) =>
        a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0
      );
      const newList = [];
      const trackEvents = {};
      let idx = 0;
      toConsider.forEach(sample => {
        if (sample.name in trackEvents) {
          if (trackEvents[sample.name].status) {
            newList.push({ ...constructChromeSample(sample), ph: 'E' });
            trackEvents[sample.name].idx.push(idx);
          } else {
            newList.push({ ...constructChromeSample(sample), ph: 'B' });
            trackEvents[sample.name].idx.push(idx);
          }
          trackEvents[sample.name].status = !trackEvents[sample.name].status;
          idx += 1;
        } else {
          newList.push({ ...constructChromeSample(sample), ph: 'B' });
          trackEvents[sample.name] = { status: true, idx: [] };
          trackEvents[sample.name].idx.push(idx);
          idx += 1;
        }
      });
      storeData(
        removeInvalidEvents(newList, trackEvents),
        `processed_threads_${pid}_${tid}.json`
      );
    });
  });
};

callStack(TEST_DATA);
