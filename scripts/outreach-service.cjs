const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const original = Module._resolveFilename;
Module._resolveFilename = function(request, parent, ...rest) {
  return original.call(this, request.startsWith('@/') ? path.resolve(__dirname, '../src', request.slice(2)) : request, parent, ...rest);
};
require.extensions['.ts'] = function(module, filename) {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename);
};
const command = process.argv[2] || 'status';
(async () => {
  if (command === 'research-preview') {
    const { discover } = require('../src/lib/outreach/discovery.ts');
    const result = await discover(0, new Set(), 40000);
    console.log(JSON.stringify(result)); return;
  }
  const service = require('../src/lib/outreach/service.ts');
  if (command === 'status') console.log(JSON.stringify(await service.outreachStatus()));
  else if (command === 'discover' || command === 'send') console.log(JSON.stringify(await service.runOutreach(command)));
  else if (command === 'monitor') console.log(JSON.stringify(await service.monitorOutreach()));
  else throw new Error('Unknown command');
})().catch(e => { console.error(JSON.stringify({ error: e.message })); process.exitCode = 1; }).finally(async () => { if(globalThis.prisma) await globalThis.prisma.$disconnect(); });
