const fs = require('fs');
// Path to the Test Data
const TEST_DATA = 'hermes_sample.cpuprofile';

// Reads files using fs asynchronously (returns a Promise)
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

// Parsing string to JS Object
const obtainData = async path => {
  const data = JSON.parse(await readData(path));
  return data;
};

// samples => [{
//     "cpu": "-1",
//     "name": "",
//     "ts": "142867379",
//     "pid": 6052,
//     "tid": "6105",
//     "weight": "1",
//     "sf": 16
// }]. This function converts it to '6052:6105': [{
//     "cpu": "-1",
//     "name": "",
//     "ts": "142867379",
//     "pid": 6052,
//     "tid": "6105",
//     "weight": "1",
//     "sf": 16
// }]
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

// samples => [{
//     "cpu": "-1",
//     "name": "",
//     "ts": "142867379",
//     "pid": 6052,
//     "tid": "6105",
//     "weight": "1",
//     "sf": 16
// }]. This function converts it to '6052': [{
//     "cpu": "-1",
//     "name": "",
//     "ts": "142867379",
//     "pid": 6052,
//     "tid": "6105",
//     "weight": "1",
//     "sf": 16
// }]
const getProcesses = data => {
  return data
    .map(sample => sample.pid)
    .filter((value, index, self) => self.indexOf(value) === index);
};

// Process samples and alter properties i.e. add name and stack frame data
const processData = data => {
  // samples contains the array of samples in the hermes profile
  let samples = data.samples;
  // stackFrames contains the object with property 'stackFrames' in the hermes profile
  const stackFrames = data.stackFrames;
  // {
  //     "cpu": "-1",
  //     "name": "",
  //     "ts": "142867379",
  //     "pid": 6052,
  //     "tid": "6105",
  //     "weight": "1",
  //     "sf": 16
  // } => {
  //     "cpu": "-1",
  //     "name": getName(stackFrames["16"]),
  //     "ts": "142867379",
  //     "pid": 6052,
  //     "tid": "6105",
  //     "weight": "1",
  //     "sf": {...stackFrames["16"], "sfNumber": 16}
  // }
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

// Prints function call stack and saves it to a file
const callStack = async path => {
  const data = await obtainData(path);
  const stackFrames = data.stackFrames;
  // Return result
  let parentStructure = ``;
  for (const stackFrameId in stackFrames) {
    // Obtaining name
    const endIndex = stackFrames[stackFrameId].name.indexOf('(');
    let name = '';
    if (endIndex === 0) {
      name = '(anonymous)';
    } else if (endIndex === -1) {
      name = stackFrames[stackFrameId].name;
    } else {
      name = stackFrames[stackFrameId].name.substring(0, endIndex);
    }
    // Obtain parent ID
    const parentId = stackFrames[stackFrameId].parent;
    // Initialise the depth/indentation of function call
    let depth = 0;
    if (parentId) {
      // Add one to the depth of parentId (as parent calls this child function)
      depth = stackFrames[parentId].depth + 1;
    }
    // Add a parameter called depth to our stackFrames
    stackFrames[stackFrameId].depth = depth;
    const tabString = ' '.repeat(depth);
    // Add to our result
    parentStructure += tabString + name + `\n`;
  }
  // Save file
  fs.writeFile('processStack.txt', parentStructure, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log('The file was saved!');
  });
};

// Reading our data
// const loadData = path => {
//   try {
//     return fs.readFileSync(path, 'utf8');
//   } catch (err) {
//     console.error(err);
//     return false;
//   }
// };

// Stores data using fs module synchronously
const storeData = (data, path) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
};

// Convert To Chrome Sample Format
const constructChromeSample = sample => {
  return {
    pid: sample.pid,
    tid: Number(sample.tid),
    ts: Number(sample.ts),
    name: sample.name,
    args: { ...sample },
  };
};

// Check and remove invalid events, should be a multiple of 2 to make sense
// TODO: DISCUSS: consider two functions => (()) | ()()
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

// CORE FUNCTION: Converts the hermes profile to Chrome Duration Events
const convertToDurationEvents = async path => {
  const data = await obtainData(path);
  const processed_data = processData(data);
  // Get our processes dictionary
  const processes = getProcesses(processed_data);
  // Get our processes and threads dictionary
  const processThreads = getPidTid(processed_data);
  // Crunch each process at a time
  // TODO: Optimise this loop (O(n^2), can be reduced in some way?)
  processes.forEach(process => {
    // Eg: Process ID = 1 => Threads corresponding to PID = 1 could be TID = [1,2,3,4,5]
    // keys = [1:1,1:2,1:3,1:4,1:5]
    const keys = Object.keys(processThreads).filter(
      key => key.substring(0, process.toString().length) === process.toString()
    );
    // Crunch each process id and thread id pair
    keys.forEach(key => {
      // Obtain pid and tid from Key
      const pid = key.substring(0, key.indexOf(':'));
      const tid = key.substring(key.indexOf(':') + 1);
      // Sort the events by Timestamp
      const toConsider = processThreads[key].sort((a, b) =>
        a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0
      );
      // Store the events list corresponding to each thread and process pair
      const newList = [];
      const trackEvents = {};
      let idx = 0;
      // Crunch each sample and make a chrome event
      // Eg: Function A calls function B, function B ends and then function A ends
      // newList = [func(A, 'B'), func(B, 'B'), func(B, 'E'), func(A,'E')]
      toConsider.forEach(sample => {
        if (sample.name in trackEvents) {
          if (trackEvents[sample.name].status) {
            // Case: Function called but has not ended yet
            newList.push({ ...constructChromeSample(sample), ph: 'E' });
            trackEvents[sample.name].idx.push(idx);
          } else {
            // Case: Function has been called and ended already,
            // this is a new instance of a function seen previously
            newList.push({ ...constructChromeSample(sample), ph: 'B' });
            trackEvents[sample.name].idx.push(idx);
          }
          // Invert status
          trackEvents[sample.name].status = !trackEvents[sample.name].status;
          // Increase index, used later
          idx += 1;
        } else {
          // Case: Seen function for the first time, mark status for true, mark the event as the beginning
          newList.push({ ...constructChromeSample(sample), ph: 'B' });
          trackEvents[sample.name] = { status: true, idx: [] };
          trackEvents[sample.name].idx.push(idx);
          idx += 1;
        }
      });
      // Store the events list after removing the invalid events (multiple of 2)
      storeData(
        removeInvalidEvents(newList, trackEvents),
        `processed_threads_${pid}_${tid}.json`
      );
    });
  });
};

convertToDurationEvents(TEST_DATA);
