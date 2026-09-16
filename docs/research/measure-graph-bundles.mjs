import {build} from 'esbuild';
import {gzipSync,brotliCompressSync} from 'node:zlib';
import {writeFile} from 'node:fs/promises';
const entries={
 'd3-force only':`export {forceSimulation,forceLink,forceManyBody,forceCenter,forceCollide} from 'd3-force';`,
 'D3 force + zoom + drag + selection':`export {forceSimulation,forceLink,forceManyBody,forceCenter,forceCollide} from 'd3-force'; export {select} from 'd3-selection'; export {zoom} from 'd3-zoom'; export {drag} from 'd3-drag';`,
 'force-graph':`export {default} from 'force-graph';`,
 'Sigma + Graphology':`export {default as Sigma} from 'sigma'; export {default as Graph} from 'graphology';`,
 'Sigma + Graphology + ForceAtlas2':`export {default as Sigma} from 'sigma'; export {default as Graph} from 'graphology'; export {default as layout} from 'graphology-layout-forceatlas2';`,
 'Cytoscape':`export {default} from 'cytoscape';`,
 'React Flow':`export {ReactFlow,Controls,Background,Handle,Position} from '@xyflow/react'; import '@xyflow/react/dist/style.css';`,
 'React Flow + Dagre':`export {ReactFlow,Controls,Background,Handle,Position} from '@xyflow/react'; import '@xyflow/react/dist/style.css'; export {default as layout} from '@dagrejs/dagre';`,
 'G6':`export {Graph} from '@antv/g6';`,
 'Reagraph':`export {GraphCanvas} from 'reagraph';`,
 'Cosmos':`export {Graph} from '@cosmos.gl/graph';`
};
const results=[];
for(const [name,contents] of Object.entries(entries)){
 try {const out=await build({stdin:{contents,resolveDir:process.cwd(),loader:'js'},bundle:true,minify:true,format:'esm',platform:'browser',target:'es2022',external:['react','react-dom','react/*','react-dom/*'],define:{'process.env.NODE_ENV':'"production"'},write:false,outfile:'bundle.js',logLevel:'silent'});
 const files=out.outputFiles.map(f=>({kind:f.path.endsWith('.css')?'css':'js',bytes:f.contents.length,gzip:gzipSync(f.contents,{level:9}).length,brotli:brotliCompressSync(f.contents).length})); results.push({name,files});console.log(name,JSON.stringify(files));
 }catch(e){results.push({name,error:e.message});console.log(name,e.message.slice(0,250));}
}
await writeFile('measurements.json',JSON.stringify({at:new Date().toISOString(),method:'esbuild minified browser ESM ES2022; React and ReactDOM external; gzip level 9; import entries in measure.mjs; no application code/data/images/layout plugins',results},null,2));
