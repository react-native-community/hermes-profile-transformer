# Hermes Profile Transformer

A package written in TypeScript for converting Hermes Sampled Profile into Events supported by Chrome Dev Tools
![Demo Profile](https://raw.githubusercontent.com/MLH-Fellowship/hermes-profile-transformer/master/assets/convertedProfile.png)

The Hermes Profile Transformer takes as input the `path to the Hermes Profile file` and outputs `a CPU Profile that can be loaded into Chrome Dev Tools`.

The transformer can optionally also take in a `Source Map` or rather the `path to the source map file` (and the bundle filename) and output rectified function names, line and column numbers to facilitate easy debugging and profiling.

## Usage

1. Import the transformer function into your project.
2. Pass the path of the Profile file into the function.
3. The function returns the profile in Chrome supported events as a promise. You need to await the result of the function to actually obtain the events.
4. These events can then be stored to the file system and shown in Chrome Dev Tools.
