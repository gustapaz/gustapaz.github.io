import {test} from 'node:test';import assert from 'node:assert/strict';
import {reserveExample,matchingTrio} from '../src/lib/exploration.mjs';
test('repeated local reservation preserves stock and input state',()=>{const initial={stock:3,reserved:false,replayed:false};const first=reserveExample(initial);assert.equal(first.stock,2);const repeat=reserveExample(first);assert.equal(repeat.stock,2);assert.equal(repeat.replayed,true);assert.equal(initial.stock,3);});
test('local match requires exactly three identical shapes',()=>{assert.equal(matchingTrio(['a','a','a']),true);for(const shapes of [[],['a'],['a','a'],['a','b','a'],['a','a','a','a']])assert.equal(matchingTrio(shapes),false);});
