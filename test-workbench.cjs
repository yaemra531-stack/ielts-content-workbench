const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const url=require('node:url').pathToFileURL(require('node:path').join(__dirname,'index.html')).href;
(async()=>{
 const browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({acceptDownloads:true,viewport:{width:1200,height:1000}});const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(url);
 assert.equal(await p.locator('#steps button').count(),16);
 await p.locator('#complete').click();assert.match(await p.locator('#notice').innerText(),/请填写/);
 async function go(i){await p.locator(`[data-step="${i}"]`).click();}
 for(let i=0;i<12;i++){
  await go(i);
  for(const t of await p.locator('#fields textarea').all()){
   const id=await t.getAttribute('id');const text=i===6?'雅思备考党单词背了又忘':i===9?'真'.repeat(110):id.includes('image')?'用真实材料说明'+id:'真实内容 '+id;
   await t.fill(text);
  }
  if(i===8)await p.locator('#title-formula').selectOption('秘密揭露型');
  await p.locator('#complete').click();assert.equal(await p.locator('#primary').innerText(),'已完成，进入下一步 →',`stage ${i}`);
  if(i===0){await p.locator('#primary').click();assert.equal(await p.locator('#stage-title').innerText(),'内容原则与限制');}
 }
 await go(6);await p.locator('#field-6-summary').fill('词'.repeat(21));await p.locator('#complete').click();assert.match(await p.locator('#notice').innerText(),/不超过 20/);await p.locator('#field-6-summary').fill('雅思备考党单词背了又忘');await p.locator('#complete').click();
 // Reconfirm downstream after changing the overview.
 for(let i=7;i<12;i++){await go(i);if(await p.locator('#complete').isVisible())await p.locator('#complete').click();}
 await go(12);assert.equal(await p.locator('#stage-title').innerText(),'找参考与拍摄');
 assert.equal(await p.locator('.reference-flow button').count(),0);
 assert.equal(await p.locator('#reference-records').getAttribute('open'),null);
 assert.equal(await p.locator('#reference-generate').count(),0);
 await p.locator('#reference-search').click();let task=await p.locator('#handoff-text').inputValue();
 for(let i=0;i<5;i++)assert.ok(task.includes('用真实材料说明field-11-image'+i));
 for(const text of ['秘密揭露型','本次只查本地','~/WorkBuddy/小红书参考库/','禁止自行联网','等待我另行明确授权','实际画面','适合用途','借鉴点','每一项已填写的配图需求，分别筛选 3—5 组','每张配图一页','每张配图推荐其中一组','不能把近似图片','全部 5 项需求','不用生成构图示意图'])assert.ok(task.includes(text),text);
 assert.ok(!task.includes('整篇总计给 3—5 张'));
 assert.match(await p.locator('#reference-batch').innerText(),/每张分别找 3—5 组不同参考/);
 assert.match(await p.locator('#notice').innerText(),/Workbuddy/);
 const handoffDownload=p.waitForEvent('download');await p.locator('#download-handoff').click();assert.equal(fs.readFileSync(await(await handoffDownload).path(),'utf8'),task);
 await p.locator('#primary').click();assert.equal(await p.locator('#handoff-text').inputValue(),task);
 await p.locator('#complete').click();assert.match(await p.locator('#notice').innerText(),/借鉴点/);
 await p.locator('#reference-records > summary').click();
 await p.locator('#reference-tab-4').click();await p.locator('#reference-search').click();assert.equal(await p.locator('#handoff-text').inputValue(),task);await p.locator('#reference-tab-0').click();
 await p.locator('#reference-link').fill('javascript:alert(1)');assert.equal(await p.locator('#reference-open-link').isVisible(),false);
 await p.locator('#reference-localRef').fill('XHS-012 · 图1');await p.locator('#reference-borrow').fill('借鉴俯拍和左侧留白，换成我的练习本');assert.equal(await p.evaluate(()=>referenceReady(0)),true);
 await p.locator('#reference-link').fill('https://example.com/reference');assert.equal(await p.locator('#reference-open-link').getAttribute('href'),'https://example.com/reference');
 await p.locator('#ref-0-A').setInputFiles({name:'bad.heic',mimeType:'image/heic',buffer:Buffer.from('bad')});assert.match(await p.locator('.reference').first().innerText(),/HEIC/);
 await p.locator('#ref-0-A').setInputFiles({name:'large.png',mimeType:'image/png',buffer:Buffer.alloc(12*1024*1024+1)});assert.match(await p.locator('.reference').first().innerText(),/12 MB/);
 await p.locator('#ref-0-A').setInputFiles(require('node:path').join(__dirname,'assets/workbench-icon.png'));await p.locator('.reference img').first().waitFor({state:'visible'});
 // Seed historical slots exactly as an earlier version saved them; no new demo generation/upload UI.
 await p.evaluate(async()=>{state.references[0].B={...state.references[0].A};const id=crypto.randomUUID();await putAsset(id,await getAsset(state.references[0].A.id));state.references[0].demo={id,name:'demo.png',signature:photoSignature(0)};state.values[12].flow0='3';state.values[12].comparison0='标题清楚，批注的使用感需要保留';state.values[12].candidates0='https://example.com/reference｜点赞数待核';state.shots[0]=true;state.style[0]=true;save();});await p.reload();
 assert.equal(await p.locator('#ref-0-demo').count(),0);assert.equal(await p.locator('#remove-ref-0-demo').count(),0);
 assert.equal(await p.locator('#reference-borrow').inputValue(),'借鉴俯拍和左侧留白，换成我的练习本');
 const refDownload=p.waitForEvent('download');await p.locator('#download-ref-0-A').click();const refFile=await refDownload;assert.equal(refFile.suggestedFilename(),'workbench-icon.png');assert.deepEqual(fs.readFileSync(await refFile.path()),fs.readFileSync(require('node:path').join(__dirname,'assets/workbench-icon.png')));
 await p.locator('#reference-shot > summary').click();assert.equal(await p.locator('#shot-0').isChecked(),true);await p.locator('#reference-plan').fill('自己的词汇书，窗边试拍一张');
 const png=fs.readFileSync(require('node:path').join(__dirname,'assets/workbench-icon.png'));await p.locator('#ref-0-shot').setInputFiles({name:'shot.png',mimeType:'image/png',buffer:png});await p.waitForFunction(()=>!!state.references[0].shot);await p.reload();assert.equal(await p.locator('#reference-plan').inputValue(),'自己的词汇书，窗边试拍一张');
 await p.locator('#reference-tab-1').click();await p.locator('#reference-mode').selectOption('shared:0');assert.match(await p.locator('#reference-status').innerText(),/已有方向/);await p.reload();assert.equal(await p.locator('#reference-mode').inputValue(),'shared:0');
 await p.locator('#reference-tab-2').click();await p.evaluate(()=>{state.references[2].demo={...state.references[0].demo};save();});assert.equal(await p.evaluate(()=>referenceReady(2)),false);
 await p.locator('#reference-mode').selectOption('shared:1');assert.match(await p.locator('#reference-status').innerText(),/连续沿用|先留一张/);await p.locator('#reference-mode').selectOption('own');
 for(let i=3;i<5;i++){await p.locator('#reference-tab-'+i).click();await p.locator('#reference-mode').selectOption('own');}
 await p.locator('summary').filter({hasText:'拍了几张，想请 Workbuddy'}).click();await p.locator('#reference-shoot').click();task=await p.locator('#handoff-text').inputValue();assert.match(task,/过程页应截取真实操作/);assert.match(task,/XHS-012/);assert.match(task,/文件名不会自动携带图片/);for(let i=0;i<5;i++)assert.ok(task.includes('用真实材料说明field-11-image'+i));
 await p.locator('#complete').click();assert.equal(await p.locator('#primary').innerText(),'已完成，进入下一步 →');
 await go(11);await p.locator('#field-11-image0').fill('新的困境重点');await p.locator('#complete').click();await go(12);assert.equal(await p.locator('#review-notice').isVisible(),true);
 await p.locator('#reference-tab-0').click();await p.locator('#reference-extra > summary').click();assert.equal(await p.locator('#reference-comparison').inputValue(),'标题清楚，批注的使用感需要保留');await p.waitForFunction(()=>document.querySelectorAll('.reference img:not([hidden])').length===4);
 await p.locator('#reference-records > summary').click();await p.screenshot({path:'/tmp/workbench-references-desktop.png',fullPage:true});await p.setViewportSize({width:390,height:1000});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.screenshot({path:'/tmp/workbench-references-mobile.png',fullPage:true});await p.setViewportSize({width:1200,height:1000});
 await p.locator('#complete').click();
 await go(13);assert.equal(await p.locator('#field-9-opening').inputValue(),'真'.repeat(110));assert.equal(await p.locator('#field-9-opening').getAttribute('readonly'),'');
 const lengths={before:110,turn:90,middle:70,core:130,bridge:130,ending:50};for(const [key,n]of Object.entries(lengths))await p.locator('#field-13-'+key).fill('实'.repeat(n));
 await p.locator('#complete').click();assert.equal(await p.locator('#primary').innerText(),'已完成，进入下一步 →');
 await go(12);await p.locator('#complete').click();
 await go(14);assert.equal(await p.locator('#fields input[type=checkbox]').count(),6);for(let i=0;i<6;i++)await p.locator('#revision-'+i).check();await p.locator('#field-14-notes').fill('已逐轮核对');await p.locator('#complete').click();
 assert.equal(await p.locator('#count').innerText(),'15/16步已完成');await go(15);
 const dlPromise=p.waitForEvent('download');await p.locator('#primary').click();const dl=await dlPromise;assert.match(dl.suggestedFilename(),/^\d{4}-\d{2}-\d{2}-雅思备考党单词背了又忘.md$/);const content=fs.readFileSync(await dl.path(),'utf8');for(let i=1;i<=15;i++)assert.ok(content.includes('## '+String(i).padStart(2,'0')+' '));assert.ok(content.includes('秘密揭露型'));assert.ok(content.includes('新的困境重点'));assert.ok(content.includes('已逐轮核对'));assert.ok(content.includes('https://example.com/reference'));assert.ok(content.includes('借鉴俯拍和左侧留白'));assert.ok(content.includes('沿用图 1 的参考'));assert.ok(content.includes('workbench-icon.png'));assert.equal(await p.locator('#count').innerText(),'16/16步已完成');
 assert.ok(content.includes('AI 构图示意（非真实记录）文件：demo.png'));assert.ok(content.includes('自己的试拍 / 截图文件：shot.png'));assert.ok(content.includes('自己的词汇书，窗边试拍一张'));assert.ok(content.includes('标题清楚，批注的使用感需要保留'));assert.ok(content.includes('点赞数待核'));
 await p.reload();assert.equal(await p.locator('#count').innerText(),'16/16步已完成');
 await go(13);await p.setViewportSize({width:390,height:1100});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.screenshot({path:'/tmp/workbench16-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 // Whole-post handoff does not invent missing needs or leak a different note's requirements.
 const partialCtx=await browser.newContext(),partial=await partialCtx.newPage();await partial.goto(url);await partial.locator('[data-step="12"]').click();await partial.locator('#reference-search').click();assert.match(await partial.locator('#notice').innerText(),/至少一张/);assert.equal(await partial.locator('#handoff').isVisible(),false);
 await partial.locator('[data-step="11"]').click();await partial.locator('#field-11-image1').fill('局部需求二');await partial.locator('#field-11-image4').fill('局部需求五');await partial.locator('[data-step="12"]').click();await partial.locator('#primary').click();const partialTask=await partial.locator('#handoff-text').inputValue();assert.match(partialTask,/全部 2 项需求/);assert.match(partialTask,/图 2 ·/);assert.match(partialTask,/图 5 ·/);assert.ok(!partialTask.includes('图 1 ·'));
 await partial.locator('#new-note').click();await partial.locator('[data-step="12"]').click();await partial.locator('#primary').click();assert.equal(await partial.locator('#handoff').isVisible(),false);await partialCtx.close();
 // Old six-step text must remain recoverable without falsely marking new steps complete.
 const migration=await browser.newContext();const m=await migration.newPage();await m.goto(url);await m.evaluate(()=>{localStorage.removeItem('ielts-content-workbench-v3');localStorage.setItem('codex:visualization-widget-state-v2:'+JSON.stringify([location.pathname,location.search]),JSON.stringify({privateContent:{version:2,title:'旧笔记',notes:['原来的完整定位','','','','正文旧稿',''],checks:[],stage:4}}));});await m.reload();assert.equal(await m.locator('#post-name').inputValue(),'旧笔记');assert.match(await m.locator('#legacy-text').textContent(),/正文旧稿/);assert.equal(await m.locator('#count').innerText(),'0/16步已完成');
 await browser.close();console.log('PASS: 16 blocks, validation, button transition, dependency links, reference search handoff, link/image/own/shared modes, legacy A/B preservation, upload limits, persistence/review, 15-section Markdown filename/download, reload, mobile, legacy preservation.');
})().catch(e=>{console.error(e);process.exit(1)});
