import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

// The original phone bug was structural: log/commands covered the enemy canvas.
// Keep the battle panel outside the scene, in normal document flow, at every breakpoint.
const html=await readFile('dist/index.html','utf8');
const css=await readFile('dist/style.css','utf8');
const game=await readFile('dist/game.js','utf8');
const stack=[],parents=new Map();
const voids=new Set(['meta','link','input','br']);
for(const match of html.matchAll(/<(\/?)([a-z][\w-]*)([^>]*)>/gi)){
 const [,close,tag,attrs]=match;
 if(close){assert.equal(stack.pop()?.tag,tag,`unbalanced ${tag}`);continue;}
 const id=attrs.match(/\bid="([^"]+)"/)?.[1];
 const classes=attrs.match(/\bclass="([^"]+)"/)?.[1]?.split(' ')||[];
 if(id){assert(!parents.has(id),`duplicate id ${id}`);parents.set(id,[...stack]);}
 if(!voids.has(tag))stack.push({tag,id,classes});
}
assert.equal(stack.length,0,'balanced HTML');
assert(parents.get('world').at(-1).classes.includes('scene'));
assert(parents.get('battleHud').at(-1).classes.includes('scene'));
assert(parents.get('dialog').at(-1).classes.includes('scene'));
assert.equal(parents.get('battle').at(-1).id,'viewport');
for(const id of ['battle','battleLog','commands'])assert(!parents.get(id).some(p=>p.classes.includes('scene')),`${id} must not overlay the scene`);
for(const id of ['battleLog','commands'])assert.equal(parents.get(id).at(-1).id,'battle');
for(const match of css.matchAll(/#(?:battle|battleLog|commands)\s*\{([^}]+)\}/g)){
 assert(!/position\s*:\s*(absolute|fixed)/.test(match[1]),'combat panel must stay in document flow');
}
assert(!html.includes('interactBtn')&&!html.includes('data-dir')&&!html.includes('class="touch"'));
assert(!game.includes('interactBtn')&&!game.includes('[data-dir]'));
assert(game.includes("$('world').addEventListener('pointerdown'"),'tap input retained');
assert(game.includes("['Enter','e','E',' ']"),'keyboard interaction retained');
console.log('PASS battle panel/scene separation, valid HTML, removed touch controls, retained tap/keyboard input');
