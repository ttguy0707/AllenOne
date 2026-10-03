import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialState,exportBackup,importBackup,summarize,workoutCSV} from '../app/core.js';

const created=new Date('2025-01-01T00:00:00Z');
const base=()=>initialState('rabbit',created);
const session=(sport='strength',id=null)=>({
 id,sport,date:'2025-01-01',duration:'',distance:'',start:'',end:'',notes:'未完成，保留输入\n第二行',
 started_at:sport==='strength'?created.toISOString():null,ended_at:null,template_id:null,exercises:[]
});
const workout=id=>({
 id,sport:'running',date:'2025-01-01',duration_seconds:1800,duration_source:'manual',
 started_at:null,ended_at:null,distance_meters:5000,notes:'已保存记录',template_id:null,
 created_at:created.toISOString(),updated_at:created.toISOString(),exercises:[]
});
const roundtrip=s=>importBackup(exportBackup(s));

test('legacy backups without recording_sessions preserve null or populated draft',()=>{
 for(const draft of [null,session()]){
  const s=base();s.draft=draft;
  const restored=roundtrip(s);
  assert.equal(Object.hasOwn(restored,'recording_sessions'),false);
  assert.deepEqual(restored.draft,draft);
  assert.deepEqual(restored.workouts,[]);
 }
});

test('four sports and distinct historical edits roundtrip without changing saved workouts',()=>{
 const s=base();s.workouts=[workout('saved-1'),workout('saved-2')];
 s.recording_sessions=['strength','running','cycling','basketball'].map(sport=>session(sport));
 s.recording_sessions[0].exercises=[{exercise_id:'bench',name:'杠铃卧推',weight_basis:'杠铃总重',sets:[
  {id:'pending-set-1',weight:'',reps:'10',completed:false},
  {id:'pending-set-2',weight:'40.5',reps:'8',completed:true}
 ]}];
 s.recording_sessions[1].duration='';s.recording_sessions[1].distance='5.25';
 s.recording_sessions.push(session('running','saved-1'),session('running','saved-2'));
 s.recording_sessions.at(-1).distance='8';
 const restored=roundtrip(s);
 assert.deepEqual(restored.recording_sessions,s.recording_sessions);
 assert.deepEqual(restored.workouts,s.workouts);
 assert.equal(restored.draft,null);
 assert.equal(summarize(restored.workouts).count,2);
 assert.equal(summarize(restored.workouts).distance,10000);
 const completedOnly=base();completedOnly.workouts=structuredClone(s.workouts);
 assert.equal(workoutCSV(restored),workoutCSV(completedOnly));
 assert.equal(Object.hasOwn(restored,'revision'),false);
});

test('legacy draft can coexist with a different recording session',()=>{
 const s=base();s.draft=session('strength');s.recording_sessions=[session('running')];
 const restored=roundtrip(s);
 assert.deepEqual(restored.draft,s.draft);
 assert.deepEqual(restored.recording_sessions,s.recording_sessions);
});

test('duplicate new-sport sessions are rejected within and across legacy/new fields',()=>{
 for(const legacy of [false,true]){
  const s=base();s.recording_sessions=[session('running')];
  if(legacy)s.draft=session('running');else s.recording_sessions.push(session('running'));
  assert.throws(()=>roundtrip(s),/未完成记录重复/);
 }
});

test('duplicate historical-edit ids are rejected',()=>{
 const s=base();s.workouts=[workout('saved')];
 s.recording_sessions=[session('running','saved'),session('running','saved')];
 assert.throws(()=>roundtrip(s),/未完成记录重复/);
});

test('invalid session fields and references are rejected without mutating input',()=>{
 const invalid=[
  d=>d.sport='swimming',d=>d.id='missing-workout',d=>d.duration=30,
  d=>d.started_at='not-a-date',d=>d.ended_at='not-a-date',d=>d.exercises=null,
  d=>d.exercises=[{exercise_id:'missing',name:'动作',weight_basis:'kg',sets:[]}],
  d=>d.exercises=[{exercise_id:'bench',name:'动作',weight_basis:'kg',sets:[{id:'s',weight:40,reps:'10',completed:false}]}],
  d=>d.exercises=[{exercise_id:'bench',name:'动作',weight_basis:'kg',sets:[{id:'s',weight:'40',reps:'10',completed:'yes'}]}]
 ];
 for(const change of invalid){
  const s=base(),d=session();change(d);s.recording_sessions=[d];
  const before=structuredClone(s);
  assert.throws(()=>roundtrip(s));
  assert.deepEqual(s,before);
 }
});

test('malformed and oversized session collections are rejected',()=>{
 for(const value of [null,{},[null],Array.from({length:105},()=>session())]){
  const s=base();s.recording_sessions=value;
  assert.throws(()=>roundtrip(s));
 }
});
