const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const protoDir = path.join(rootDir, 'shared', 'proto');
const outDir = path.join(rootDir, 'shared', 'src', 'lib', 'generated');

// Ensure output directory exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Find all .proto files in shared/proto
const protoFiles = fs
  .readdirSync(protoDir)
  .filter((file) => file.endsWith('.proto'))
  .map((file) => path.join(protoDir, file));

if (protoFiles.length === 0) {
  console.log('No .proto files found in', protoDir);
  process.exit(0);
}

// Determine binaries based on platform
const isWin = process.platform === 'win32';
const protocBinary = path.join(
  rootDir,
  'node_modules',
  'grpc-tools',
  'bin',
  `protoc${isWin ? '.exe' : ''}`
);

const pluginPath = path.join(
  rootDir,
  'node_modules',
  '.bin',
  `protoc-gen-ts_proto${isWin ? '.cmd' : ''}`
);

const args = [
  `--plugin=protoc-gen-ts_proto=${pluginPath}`,
  `--ts_proto_out=${outDir}`,
  '--ts_proto_opt=nestJs=true,exportCommonSymbols=false',
  `--proto_path=${protoDir}`,
  ...protoFiles,
];

try {
  console.log(`Generating TypeScript files from ${protoFiles.length} proto file(s)...`);
  execFileSync(protocBinary, args, { stdio: 'inherit' });
  console.log('Successfully generated proto TypeScript files in shared/src/lib/generated!');
} catch (error) {
  console.error('Failed to generate proto TypeScript files:', error.message);
  process.exit(1);
}
