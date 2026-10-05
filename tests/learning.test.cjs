const test=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./helpers.cjs');
function setup(t,options){const g=game(options);t.after(g.close);return g;}

test('helped first answers remain supported and cannot raise a skill level',t=>{
 const g=setup(t);
 for(let i=0;i<5;i++)g.run("startRound('add','add.story'); ctl.assist(); ctl.correct()");
 assert.equal(g.run("learningRecord('add.story').supported"),5);
 assert.equal(g.run("learningRecord('add.story').independent"),0);
 assert.equal(g.run("learningRecord('add.story').level"),1);
});
test('learning evidence stays with its own skill and records a correction once',t=>{
 const g=setup(t);
 g.run("startRound('tenframe','tenframe.build');ctl.wrong();ctl.correct();ctl.correct()");
 assert.equal(g.run("learningRecord('tenframe.build').supported"),1);
 assert.equal(g.run("learningRecord('tenframe.read').supported"),0);
 assert.equal(g.run('S.skills.tenframe.att'),1);
 assert.equal(g.run('S.stars'),1,'a corrected answer earns a star');
});
test('a worked example is followed by a fresh question on the same skill',t=>{
 const g=setup(t);
 g.run("startRound('bonds','bonds.part');ctl.wrong();ctl.wrong()");
 const first=g.document.querySelector('#stage').textContent;
 g.run('advance()');
 assert.equal(g.run('R.q.topic'),'bonds.part');
 assert.notEqual(g.document.querySelector('#stage').textContent,first);
 assert.equal(g.run('R.q.assisted'),false);
});
test('old progress survives and malformed individual-skill evidence is repaired',t=>{
 const g=setup(t,{saved:{stars:21,stickers:['🐸'],skills:{count:{lvl:3,att:9,ok:8,rounds:1}},learning:{'count.count':{level:99,independent:4,supported:-1,history:'bad'},fake:{level:3}}}});
 assert.equal(g.run('S.stars'),21);
 assert.equal(g.run('S.skills.count.lvl'),3);
 assert.equal(g.run("learningRecord('count.count').level"),3);
 assert.equal(g.run("learningRecord('count.count').supported"),0);
 assert.equal(g.run("learningRecord('count.count').history.length"),0);
 assert.equal(g.run("Object.hasOwn(S.learning,'fake')"),false);
});

test('varied independent work extends challenge and a later-day check confirms retention',t=>{
 const g=setup(t);
 g.run("let day='2026-10-05'; Date.prototype.toLocaleDateString=()=>day");
 for(const signature of ['2+1','1+3','4+1','2+2'])g.run(`startRound('add','add.story');R.q.signature='${signature}';ctl.correct()`);
 assert.equal(g.run("learningRecord('add.story').level"),2);
 assert.equal(g.run("learningRecord('add.story').verifiedLevel"),0);
 g.run("day='2026-10-06';startRound('add','add.story')");
 assert.equal(g.run('R.q.level'),1,'review the previously practiced range');
 g.run("R.q.signature='3+2';ctl.correct()");
 assert.equal(g.run("learningRecord('add.story').verifiedLevel"),1);
});
test('identical repeated questions cannot alone advance difficulty',t=>{
 const g=setup(t);
 for(let i=0;i<8;i++)g.run("startRound('add','add.story');R.q.signature='2+1';ctl.correct()");
 assert.equal(g.run("learningRecord('add.story').level"),1);
});
