const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const url=require('node:url').pathToFileURL(require('node:path').join(__dirname,'index.html')).href;
(async()=>{
 const b=await chromium.launch({headless:true}),ctx=await b.newContext({acceptDownloads:true,viewport:{width:1280,height:1000}}),p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(url);
 // Migrate an existing single-note record, without altering its legacy storage.
 await p.evaluate(()=>{const old=fresh();old.name='旧笔记';old.values[0].type='雅思AI';old.values[8].title='原来的标题';localStorage.setItem(KEY,JSON.stringify(old));});await p.reload();assert.equal(await p.locator('#post-name').inputValue(),'旧笔记');
 await p.locator('#field-0-type').fill('雅思AI干货');assert.match(await p.locator('#save-state').innerText(),/已保存 · \d/);
 await p.locator('[data-step="12"]').click();await p.locator('#ref-0-A').setInputFiles(require('node:path').join(__dirname,'assets/workbench-icon.png'));await p.waitForFunction(()=>!!state.references[0].A);const originalImage=await p.evaluate(async()=>dataURL(await getAsset(state.references[0].A.id)));
 await p.reload();assert.equal(await p.locator('#stage-title').innerText(),'拍摄清单与AI参考图');await p.waitForFunction(()=>document.querySelector('.reference img').naturalWidth>0);
 await p.locator('#new-note').click();assert.equal(await p.locator('#note-picker option').count(),2);assert.equal(await p.locator('#field-0-type').inputValue(),'雅思AI干货');await p.locator('#post-name').fill('第二篇');await p.locator('[data-step="8"]').click();assert.equal(await p.locator('#field-8-title').inputValue(),'');await p.locator('#field-8-title').fill('第二篇标题');
 const ids=await p.locator('#note-picker option').evaluateAll(es=>es.map(e=>e.value));await p.locator('#note-picker').selectOption(ids[0]);assert.equal(await p.locator('#stage-title').innerText(),'拍摄清单与AI参考图');await p.locator('[data-step="8"]').click();assert.equal(await p.locator('#field-8-title').inputValue(),'原来的标题');
 await p.locator('#resume-note').fill('明天从第二个标题候选改');await p.locator('[data-step="4"]').click();assert.match(await p.locator('#resume-location').innerText(),/09 标题/);await p.locator('#resume-jump').click();assert.equal(await p.locator('#stage-title').innerText(),'标题');assert.match(await p.locator('#step-minimum').innerText(),/先留一个/);
 await p.locator('#note-picker').selectOption(ids[1]);assert.equal(await p.locator('#resume-note').inputValue(),'');await p.locator('#note-picker').selectOption(ids[0]);
 await p.close();const q=await ctx.newPage();await q.goto(url);assert.equal(await q.locator('#field-8-title').inputValue(),'原来的标题');
 assert.equal(await q.locator('#resume-note').inputValue(),'明天从第二个标题候选改');
 const d=q.waitForEvent('download');await q.locator('#backup-all').click();const dl=await d;const backup=JSON.parse(fs.readFileSync(await dl.path(),'utf8'));assert.equal(backup.library.notes.length,2);assert.equal(backup.assets.length,1);assert.equal(backup.assets[0].data,originalImage);
 // Restore into a separate clean browser profile; existing blank note is preserved.
 const ctx2=await b.newContext(),r=await ctx2.newPage();await r.goto(url);await r.locator('#backup-file').setInputFiles(await dl.path());await r.waitForFunction(()=>library.notes.length===3);assert.match(await r.locator('#post-name').inputValue(),/旧笔记（恢复）/);assert.equal(await r.locator('#resume-note').inputValue(),'明天从第二个标题候选改');await r.locator('[data-step="12"]').click();await r.waitForFunction(()=>document.querySelector('.reference img').naturalWidth>0);assert.equal(await r.evaluate(async()=>dataURL(await getAsset(state.references[0].A.id))),originalImage);
 await r.locator('#backup-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"format":"bad"}')});await r.waitForFunction(()=>document.querySelector('#library-status').textContent.includes('不是有效'));assert.equal(await r.locator('#note-picker option').count(),3);
 // Preserve the active note when it is not the first item; do not lose any imported fields.
 await q.locator('#note-picker').selectOption(ids[1]);await q.locator('[data-step="14"]').click();await q.locator('#revision-0').check();await q.locator('[data-step="9"]').click();await q.locator('#field-9-opening').fill('还没有写完的开头，备份也应该保留');
 const activeDownload=q.waitForEvent('download');await q.locator('#backup-all').click();const activeFile=await activeDownload;const activeBackup=JSON.parse(fs.readFileSync(await activeFile.path(),'utf8'));
 assert.equal(activeBackup.library.activeId,ids[1]);assert.equal(activeBackup.library.notes[1].step,9);
 const activeCtx=await b.newContext(),activePage=await activeCtx.newPage();await activePage.goto(url);
 await activePage.locator('#backup-file').setInputFiles({name:'active-second.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(activeBackup))});
 await activePage.waitForFunction(()=>library.notes.length===3);
 assert.equal(await activePage.locator('#post-name').inputValue(),'第二篇（恢复）');
 assert.deepEqual(await activePage.evaluate(()=>library.notes.slice(1).map(n=>n.values)),activeBackup.library.notes.map(n=>n.values));
 assert.equal(await activePage.locator('#stage-title').innerText(),'开头');assert.equal(await activePage.locator('#field-9-opening').inputValue(),'还没有写完的开头，备份也应该保留');
 const fields=['step','values','done','review','working','style','shots','revision','sources'];assert.deepEqual(await activePage.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,state[k]])),fields),Object.fromEntries(fields.map(k=>[k,activeBackup.library.notes[1][k]])));
 await activePage.reload();assert.equal(await activePage.locator('#post-name').inputValue(),'第二篇（恢复）');assert.equal(await activePage.locator('#stage-title').innerText(),'开头');
 await activeCtx.close();
 // Quota failure is visible and cannot cause new-note navigation to discard unsaved edits.
 await r.evaluate(()=>{Storage.prototype.setItem=function(){throw new Error('QuotaExceededError')};});await r.locator('#post-name').fill('仍在内存的草稿');await r.locator('#new-note').click();assert.equal(await r.locator('#post-name').inputValue(),'仍在内存的草稿');assert.match(await r.locator('#save-state').innerText(),/保存未成功/);
 // Quick capture reuses ordinary drafts and must never overwrite an existing topic.
 const quickCtx=await b.newContext({viewport:{width:1200,height:1000}}),k=await quickCtx.newPage();await k.goto(url);
 await k.locator('#post-name').fill('保留原笔记');await k.locator('#quick-capture summary').click();await k.locator('#save-quick').click();assert.equal(await k.locator('#note-picker option').count(),1);
 const scene='这个单词看得懂，但录音里总听不出来。';await k.locator('#quick-scene').fill(scene);await k.locator('#cancel-quick').click();assert.equal(await k.locator('#note-picker option').count(),1);await k.locator('#quick-capture summary').click();assert.equal(await k.locator('#quick-scene').inputValue(),scene);await k.locator('#save-quick').click();
 assert.equal(await k.locator('#note-picker option').count(),2);assert.equal(await k.locator('#field-4-scene').inputValue(),scene);assert.equal(await k.locator('#count').innerText(),'0/16步已完成');assert.equal(await k.evaluate(()=>state.values.filter((v,i)=>i!==4).every(v=>Object.keys(v).length===0)),true);
 await k.reload();assert.equal(await k.locator('#field-4-scene').inputValue(),scene);await k.locator('#scene-to-topic').click();assert.equal(await k.locator('#field-3-topic').inputValue(),scene);assert.equal(await k.locator('#field-3-need').inputValue(),'');await k.locator('#field-3-topic').fill('后来修改的选题');await k.locator('[data-step="4"]').click();await k.locator('#scene-to-topic').click();assert.equal(await k.locator('#field-3-topic').inputValue(),'后来修改的选题');
 await k.locator('[data-step="4"]').click();await k.locator('#quick-capture summary').click();await k.screenshot({path:'/tmp/workbench-quick.png',fullPage:true});await k.setViewportSize({width:390,height:900});assert.equal(await k.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await r.locator('#quick-capture summary').click();await r.locator('#quick-scene').fill('保存失败也不能丢掉这句话');await r.locator('#save-quick').click();assert.equal(await r.locator('#note-picker option').count(),3);assert.equal(await r.locator('#quick-scene').inputValue(),'保存失败也不能丢掉这句话');
 await q.screenshot({path:'/tmp/workbench-library.png',fullPage:true});await q.setViewportSize({width:390,height:900});assert.equal(await q.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);await b.close();console.log('PASS: legacy migration, timestamps, close/reopen, independent notes, profile reuse, image-inclusive backup and clean-profile restore, invalid backup rejection, quota failure, mobile layout');
})().catch(e=>{console.error(e);process.exit(1)});
