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
 await go(12);await p.locator('#photo-cover-task').click();assert.match(await p.locator('#notice').innerText(),/先写好/);assert.equal(await p.locator('#handoff').isVisible(),false);
 await go(13);for(const t of await p.locator('#fields textarea:not([readonly])').all())await t.fill('本篇真实的正文草稿');
 await go(12);assert.equal(await p.locator('#source-2').inputValue(),'AI截图');assert.equal(await p.locator('#source-0').inputValue(),'真人实拍');assert.match(await p.locator('#fields').innerText(),/秘密揭露型/);assert.match(await p.locator('#fields').innerText(),/用真实材料说明field-11-image0/);
 for(let i=0;i<4;i++)await p.locator('#anchor-'+i).check();
 await p.locator('#ref-0-A').setInputFiles(require('node:path').join(__dirname,'assets/workbench-icon.png'));await p.locator('.reference img').first().waitFor({state:'visible'});
 await p.locator('#ref-0-B').setInputFiles(require('node:path').join(__dirname,'assets/workbench-icon.png'));await p.waitForFunction(()=>document.querySelectorAll('.reference img:not([hidden])').length===2);
 await p.reload();assert.equal(await p.locator('#stage-title').innerText(),'拍摄清单与AI参考图');await p.waitForFunction(()=>document.querySelectorAll('.reference img:not([hidden])').length===2);
 await p.locator('#primary').click();assert.match(await p.locator('#handoff-text').inputValue(),/秘密揭露型/);assert.match(await p.locator('#handoff-text').inputValue(),/构图 B/);
 await p.locator('#photo-cover-task').click();let task=await p.locator('#handoff-text').inputValue();assert.match(task,/只试封面/);assert.match(task,/预期图片数量：2 张/);assert.match(task,/本篇真实的正文草稿/);assert.match(task,/\$content-photo-reference/);assert.equal((task.match(/\n生成图 /g)||[]).length,1);
 await p.locator('#photo-all-task').click();task=await p.locator('#handoff-text').inputValue();assert.match(task,/预期图片数量：8 张/);assert.ok(!task.includes('\n生成图 3'));
 await p.locator('#source-0').selectOption('AI截图');await p.locator('#photo-cover-task').click();assert.match(await p.locator('#notice').innerText(),/保留真实截图/);await p.locator('#source-0').selectOption('真人实拍');
 await go(13);await p.locator('#field-13-core').fill('正文修改后需要重新检查参考图');await go(12);assert.match(await p.locator('#fields').innerText(),/请重新生成/);
 // Dependency edit makes existing images stale.
 await go(11);await p.locator('#field-11-image0').fill('新的困境重点');await p.locator('#complete').click();await go(12);assert.match(await p.locator('#fields').innerText(),/请重新生成/);
 await p.screenshot({path:'/tmp/workbench16-desktop.png',fullPage:true});
 for(let i=0;i<5;i++){await p.locator('#source-'+i).selectOption('AI截图');await p.locator('#shot-'+i).check();}
 await p.locator('#complete').click();assert.equal(await p.locator('#primary').innerText(),'已完成，进入下一步 →');
 await go(13);assert.equal(await p.locator('#field-9-opening').inputValue(),'真'.repeat(110));assert.equal(await p.locator('#field-9-opening').getAttribute('readonly'),'');
 const lengths={before:110,turn:90,middle:70,core:130,bridge:130,ending:50};for(const [key,n]of Object.entries(lengths))await p.locator('#field-13-'+key).fill('实'.repeat(n));
 await p.locator('#complete').click();assert.equal(await p.locator('#primary').innerText(),'已完成，进入下一步 →');
 await go(12);await p.locator('#complete').click();
 await go(14);assert.equal(await p.locator('#fields input[type=checkbox]').count(),6);for(let i=0;i<6;i++)await p.locator('#revision-'+i).check();await p.locator('#field-14-notes').fill('已逐轮核对');await p.locator('#complete').click();
 assert.equal(await p.locator('#count').innerText(),'15/16步已完成');await go(15);
 const dlPromise=p.waitForEvent('download');await p.locator('#primary').click();const dl=await dlPromise;assert.match(dl.suggestedFilename(),/^\d{4}-\d{2}-\d{2}-雅思备考党单词背了又忘.md$/);const content=fs.readFileSync(await dl.path(),'utf8');for(let i=1;i<=15;i++)assert.ok(content.includes('## '+String(i).padStart(2,'0')+' '));assert.ok(content.includes('秘密揭露型'));assert.ok(content.includes('新的困境重点'));assert.ok(content.includes('已逐轮核对'));assert.equal(await p.locator('#count').innerText(),'16/16步已完成');
 await p.reload();assert.equal(await p.locator('#count').innerText(),'16/16步已完成');
 await go(13);await p.setViewportSize({width:390,height:1100});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.screenshot({path:'/tmp/workbench16-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 // Old six-step text must remain recoverable without falsely marking new steps complete.
 const migration=await browser.newContext();const m=await migration.newPage();await m.goto(url);await m.evaluate(()=>{localStorage.removeItem('ielts-content-workbench-v3');localStorage.setItem('codex:visualization-widget-state-v2:'+JSON.stringify([location.pathname,location.search]),JSON.stringify({privateContent:{version:2,title:'旧笔记',notes:['原来的完整定位','','','','正文旧稿',''],checks:[],stage:4}}));});await m.reload();assert.equal(await m.locator('#post-name').inputValue(),'旧笔记');assert.match(await m.locator('#legacy-text').textContent(),/正文旧稿/);assert.equal(await m.locator('#count').innerText(),'0/16步已完成');
 await browser.close();console.log('PASS: 16 blocks, validation, button transition, dependency links, image upload/persistence/staleness, 15-section Markdown filename/download, reload, mobile, legacy preservation.');
})().catch(e=>{console.error(e);process.exit(1)});
