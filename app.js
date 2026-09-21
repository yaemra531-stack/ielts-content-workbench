'use strict';
const $=s=>document.querySelector(s);
const phaseNames=['定位与选题','结构与视觉','成文与打磨'];
const F=(id,label,min=0,max=0)=>({id,label,min,max});
const steps=[
 {name:'账号定位',phase:0,action:'分别回答定位三问。',hint:'具体到内容类型、读者处境，以及为什么愿意看你。',fields:[F('type','内容类型'),F('audience','目标读者'),F('reason','为什么能打动他们')]},
 {name:'内容原则与限制',phase:0,action:'写清坚持什么，尤其是什么不做。',hint:'例如只做雅思相关 AI 干货；1000 粉前不做视频，除非有商单。',fields:[F('principles','内容原则'),F('limits','什么不做 / 限制')]},
 {name:'账号人格摘要',phase:0,action:'四项分别填写，形成账号长期的表达基础。',hint:'抱负是长期渴望；价值观是坚持的原则；对抗是一直想克服的东西；顿悟是认知转变。',fields:[F('ambition','抱负'),F('values','价值观'),F('against','对抗'),F('insight','顿悟')]},
 {name:'选题',phase:0,action:'先写这篇要解决的一个问题，再回答下面三个问题。每项先写一句就够。',hint:'以“单词看得懂，但录音里听不出来”为选题示例：谁在什么练习里遇到它？你准备亲自试什么，能补充什么具体过程？你手上有哪些原始截图、录音或练习记录？还没有证据，就写“尚未验证，准备怎样试”。这里是在确定值得尝试的问题，不是提前证明方法有效。',fields:[F('topic','这篇想解决什么问题？（选题）'),F('need','谁会在什么情况下被它卡住？（刚需度）'),F('difference','你能补充什么亲自尝试的过程或发现？（差异化）'),F('evidence','现在有什么证据，还缺什么？（证据完整度）')]},
 {name:'真实卡点梳理',phase:0,action:'具体写下这一次踩坑的场景。',hint:'写哪一次、在做什么、卡在哪一步。先留下真实场景，不急着概括成大道理。',fields:[F('scene','这次要写的具体踩坑 / 场景')]},
 {name:'五步初稿',phase:0,action:'五项各写一句话，先求真实和完整。',hint:'依次交代场景、情绪、AI 操作、验证结果和现有素材。没有验证就明确写“尚未验证”。',fields:[F('before','Before 场景'),F('emotion','Before 情绪'),F('ai','怎么用 AI 解决'),F('result','验证结果'),F('assets','可用配图素材')]},
 {name:'一句话概述',phase:1,action:'用“人群标签＋痛点”写出不超过 20 字的概述。',hint:'例如“雅思备考党，单词背了又忘”。让读者立即判断是否与自己有关。',fields:[F('summary','一句话概述',1,20)]},
 {name:'BAB结构摘要',phase:1,action:'四项各一句话，理清变化和路径。',hint:'Before 是原处境；转折点是触发变化的事件；After 是后来的状态；Bridge 是具体做法。',fields:[F('before','Before'),F('turn','转折点'),F('after','After'),F('bridge','Bridge')]},
 {name:'标题',phase:1,action:'选择公式类型，再写标题。',hint:'公式服务于真实内容。使用数字或效果时，必须有相应材料支持。',fields:[F('title','标题')]},
 {name:'开头',phase:1,action:'写 100—150 字的钩子，让目标读者愿意往下看。',hint:'压缩交代处境和变化，先让读者认出自己，再引出方法。此段会自动引用到第 14 步。',fields:[F('opening','开头',100,150)]},
 {name:'一页大纲',phase:1,action:'将四个部分分别展开，说明每段要讲什么。',hint:'场景要具体，转折有事件，结果有依据，路径能照做。',fields:[F('before','Before 展开'),F('turn','转折点展开'),F('after','After 展开'),F('bridge','Bridge 展开')]},
 {name:'配图清单',phase:1,action:'五张图各写一句重点；下一步会直接引用。',hint:'图不是装饰。分别承担困境、认知冲击、过程、成果、验证五种信息作用。',fields:[F('image0','图 1 · 困境'),F('image1','图 2 · 认知冲击'),F('image2','图 3 · 过程'),F('image3','图 4 · 成果'),F('image4','图 5 · 验证')]},
 {name:'拍摄清单与AI参考图',phase:1,action:'确认素材来源，为实拍图生成两个构图的参考，再逐张完成拍摄。',hint:'过程图默认 AI 截图，其余默认真人实拍。参考图只指导构图，不代替真实照片。生成任务交给当前 Codex 对话，生成后将 A/B 参考图放回对应位置。',fields:[]},
 {name:'正文',phase:2,action:'按七部分独立填写；开头自动引用第 10 步。',hint:'正文讲清楚方法和证据。每段按对应区间组织，计数不含空格与换行、包含标点。',fields:[F('before','Before 具体展开',100,150),F('turn','转折点',80,120),F('middle','After 中间转折',60,100),F('core','After 核心方法',120,180),F('bridge','Bridge 操作步骤',120,180),F('ending','结尾',40,60)]},
 {name:'六轮修改法',phase:2,action:'按原六轮顺序逐条完成，再确认本步骤。',hint:'每轮只处理对应问题。先完成真实化，再检查节奏、语言、标题、图文和最终校对。',fields:[F('notes','修改记录（选填）')]},
 {name:'导出成品',phase:2,action:'随时导出当前草稿；全部板块完成后导出成品。',hint:'文件名使用今天日期＋一句话概述关键词。参考图会保留文件名与使用状态；原图请另外保存。',fields:[]}
];
const minimumGuides=[
 ['定位太大，不知道从哪写。','内容类型、目标读者、打动他们的理由，各写一句具体的话。'],
 ['原则容易写成口号。','写一条坚持的原则，再写一条明确不做的事。'],
 ['担心自己还没有鲜明人格。','抱负、价值观、对抗、顿悟各写一句真实想法，先不用润色。'],
 ['知道术语，却不知道格子里该写什么。','写一个具体卡点；再各写一句：谁会遇到、你准备亲自试什么、已有或待补的证据。不确定可以如实写。'],
 ['只有大问题，没有具体经历。','写清一次真实场景：在做什么、卡在哪一步。'],
 ['一上来就想写完整文章。','五项各一句：场景、情绪、AI 做法、验证结果、可用素材；未验证就如实注明。'],
 ['一句话塞进太多信息。','20 字以内，说清一个人群和一个痛点。'],
 ['把方法、变化和结果混在一起。','Before、转折点、After、Bridge 各一句，能看出前后变化。'],
 ['反复挑标题，迟迟不往下走。','选一种公式，先留一个与真实内容一致的标题。'],
 ['想把所有背景都写在开头。','写 100—150 字，让读者认出自己的处境并愿意往下看。'],
 ['有故事，但不知道怎么分段。','四项各写清这段要讲的具体内容，暂时不追求漂亮句子。'],
 ['先找好看的图，却不知道图要说明什么。','五张图各写一句要传达的重点，先不用准备齐素材。'],
 ['不知道先拍哪张、怎么摆。','先从一张图开始；本步完成需五张重点、标题、四项风格确认、实拍图的 A/B 参考图，以及五张拍摄或截图勾选。'],
 ['想一口气写出成稿。','先写最有把握的一段；确认完成前，开头与其余六段需齐全并达到各自字数区间。'],
 ['每次修改都从头到尾一起改。','每轮只检查一件事，六项实际检查完后逐条勾选；修改记录可不填。'],
 ['总觉得还没完美，迟迟不导出。','草稿也能导出：下载一份 Markdown 即可留底；完整恢复请用左侧备份。']
];
const titleTypes=['痛点解决型','数字+情绪共鸣型','数字+效果型','秘密揭露型'];
const titleExamples=['例：雅思单词背了又忘，我这样处理难词','例：第 3 次忘掉同一个词，我换了办法（次数须真实）','例：用 3 步整理一次错题复盘（数字须与内容一致）','例：我的难词卡里，多放了这一条线索'];
const photoNames=['困境','认知冲击','过程','成果','验证'];
const anchors=['真实材质感','自然手部动作','大字标题无花体','自然光'];
const rounds=['故事真实化','BAB节奏检查','语言口语化','标题封面精修','配图排版核对','最终校对'];
const KEY='ielts-content-workbench-v3';
const fresh=()=>({version:3,name:'AI 背单词',step:0,values:steps.map(()=>({})),done:Array(16).fill(false),sources:photoNames.map((_,i)=>i===2?'AI截图':'真人实拍'),style:Array(4).fill(false),shots:Array(5).fill(false),references:photoNames.map(()=>({})),revision:Array(6).fill(false),legacy:null,review:Array(16).fill(false),working:Array(16).fill(false)});
let state=fresh(),storageError=false;
try{const raw=localStorage.getItem(KEY);if(raw){const v=JSON.parse(raw);if(v.version===3&&v.values?.length===16&&v.done?.length===16&&v.sources?.length===5&&v.references?.length===5&&v.revision?.length===6){state={...fresh(),...v};state.step=Math.max(0,Math.min(15,Number(state.step)||0));}}else{const k='codex:visualization-widget-state-v2:'+JSON.stringify([location.pathname,location.search]);const old=JSON.parse(localStorage.getItem(k)||'null')?.privateContent;if(old?.version===2){state.name=old.title||state.name;state.legacy=old;}}}catch{storageError=true;}
state.review=Array.from({length:16},(_,i)=>state.review?.[i]===true);
state.working=Array.from({length:16},(_,i)=>state.working?.[i]===true);
if(state.legacy){$('#legacy').hidden=false;$('#legacy-text').textContent=state.legacy.notes.map((x,i)=>`原第 ${i+1} 步\n${x||'（空）'}`).join('\n\n');}
let urls=[];let renderId=0;let handoff='';
const count=x=>Array.from((x||'').replace(/\s/g,'')).length;
const value=(i,k)=>String(state.values[i]?.[k]||'');
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const LIBRARY_KEY='ielts-content-workbench-library-v1';
let library={version:1,activeId:crypto.randomUUID(),notes:[],revision:null};
let libraryReadable=true;
let pendingUploads=0;
function validNote(n){
 const bools=(x,len)=>Array.isArray(x)&&x.length===len&&x.every(v=>typeof v==='boolean');
 return n&&(!n.resume||(typeof n.resume.text==='string'&&n.resume.text.length<=300&&Number.isInteger(n.resume.step)&&n.resume.step>=0&&n.resume.step<16))&&n.version===3&&typeof n.name==='string'&&Number.isInteger(n.step)&&n.step>=0&&n.step<16&&Array.isArray(n.values)&&n.values.length===16&&n.values.every(v=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.values(v).every(t=>typeof t==='string'))&&bools(n.done,16)&&bools(n.style,4)&&bools(n.shots,5)&&bools(n.revision,6)&&(!n.review||bools(n.review,16))&&(!n.working||bools(n.working,16))&&Array.isArray(n.sources)&&n.sources.length===5&&n.sources.every(s=>['真人实拍','AI截图'].includes(s))&&Array.isArray(n.references)&&n.references.length===5&&n.references.every(r=>r&&typeof r==='object'&&['A','B'].every(a=>!r[a]||(typeof r[a].id==='string'&&typeof r[a].name==='string'&&typeof r[a].signature==='string')))&&(!n.legacy||(Array.isArray(n.legacy.notes)&&n.legacy.notes.every(t=>typeof t==='string')));
}
try{
 const raw=localStorage.getItem(LIBRARY_KEY);
 if(raw){const l=JSON.parse(raw);if(l.version!==1||!Array.isArray(l.notes)||!l.notes.length||!l.notes.every(n=>typeof n.id==='string'&&validNote(n))||new Set(l.notes.map(n=>n.id)).size!==l.notes.length||!l.notes.some(n=>n.id===l.activeId))throw Error('记录格式错误');library=l;state=library.notes.find(n=>n.id===library.activeId);state.review ||= Array(16).fill(false);state.working ||= Array(16).fill(false);}
 else {state.id=library.activeId;library.notes=[state];}
}catch{storageError=true;libraryReadable=false;}
function showSaved(){ $('#save-state').textContent=pendingUploads?'参考图保存中，请稍候…':storageError?'保存未成功，请先备份，勿关闭页面':state.savedAt?'已保存 · '+new Date(state.savedAt).toLocaleString('zh-CN',{hour12:false}):'输入后自动保存，可随时关闭'; }
function refreshLibrary(){
 const select=$('#note-picker');select.replaceChildren();for(const n of library.notes){const o=document.createElement('option');o.value=n.id;o.textContent=n.name||'未命名笔记';select.append(o);}select.value=library.activeId;
 $('#legacy').hidden=!state.legacy;if(state.legacy)$('#legacy-text').textContent=state.legacy.notes.map((x,i)=>`原第 ${i+1} 步\n${x||'（空）'}`).join('\n\n');showSaved();
}
function persistLibrary(){
 if(!libraryReadable){$('#library-status').textContent='记录读取异常，未覆盖原记录。请先备份当前内容。';return false;}
 try{
 const current=JSON.parse(localStorage.getItem(LIBRARY_KEY)||'null');
 if(current&&current.revision!==library.revision)throw Error('另一个窗口更新了记录。请先备份当前内容，再刷新此页。');
 const revision=crypto.randomUUID();localStorage.setItem(LIBRARY_KEY,JSON.stringify({...library,revision}));library.revision=revision;storageError=false;return true;
 }catch(e){storageError=true;$('#library-status').textContent='保存失败：'+e.message;showSaved();return false;}
}
function refreshResume(){
 const reminder=state.resume?.text?.trim();const target=reminder?state.resume.step:state.step;
 $('#resume-location').textContent=(reminder?'提醒对应：':'系统自动记住：')+String(target+1).padStart(2,'0')+' '+steps[target].name;
 $('#resume-jump').hidden=!reminder||target===state.step;
}
function save(){const previous=state.savedAt;state.savedAt=new Date().toISOString();if(!persistLibrary()){state.savedAt=previous;return false;}refreshLibrary();return true;}
function createNote(){
 if(!save())return;
 const previous=state;const n=fresh();n.id=crypto.randomUUID();n.name='新笔记 '+(library.notes.length+1);
 if($('#reuse-profile').checked)n.values.splice(0,3,...structuredClone(state.values.slice(0,3)));
 library.notes.push(n);library.activeId=n.id;state=n;
 if(!save()){library.notes.pop();state=previous;library.activeId=previous.id;refreshLibrary();return;}render();$('#post-name').focus();$('#post-name').select();$('#library-status').textContent='已新建。旧笔记仍在上方列表中。';
}
function captureQuickNote(){
 const scene=$('#quick-scene').value.trim();
 if(!scene){$('#quick-status').textContent='先写一句具体卡点就好。';$('#quick-scene').focus();return;}
 if(!save()){$('#quick-status').textContent='保存未成功，请保留这句话并先备份当前内容。';return;}
 const previous=state;const n=fresh();n.id=crypto.randomUUID();n.name=Array.from(scene.replace(/\s+/g,' ')).slice(0,24).join('');n.step=4;n.values[4].scene=scene;n.working[4]=true;
 library.notes.push(n);library.activeId=n.id;state=n;
 if(!save()){library.notes.pop();state=previous;library.activeId=previous.id;refreshLibrary();$('#quick-status').textContent='草稿未保存，请保留输入后重试。';return;}
 $('#quick-scene').value='';$('#quick-status').textContent='';$('#quick-capture').open=false;render();$('#library-status').textContent='卡点已保存为草稿，可以直接关闭；想做时再开始选题。';
}
function startTopicFromScene(){
 const scene=value(4,'scene').trim();if(!scene)return;
 const existing=!!value(3,'topic').trim();
 if(!existing){state.values[3].topic=scene;invalidate(3);if(!save())return;}
 navigate(3);$('#notice').textContent=existing?'已保留已有选题，可继续完善。':'卡点原话已带入选题；其他判断留空，想好再填。';
}
function switchNote(id){if(!save()){refreshLibrary();return;}const previous=state;state=library.notes.find(n=>n.id===id)||state;library.activeId=state.id;if(!persistLibrary()){state=previous;library.activeId=previous.id;}refreshLibrary();render();}
function dataURL(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});}
let libraryBusy=false;
async function libraryTask(fn){if(libraryBusy)return;libraryBusy=true;document.querySelectorAll('#library-tools button').forEach(b=>b.disabled=true);try{await fn();}catch(e){$('#library-status').textContent=e.message;}finally{libraryBusy=false;document.querySelectorAll('#library-tools button').forEach(b=>b.disabled=false);}}
async function backupLibrary(){
 const snapshot=structuredClone(library);const assets=[];const ids=new Set(snapshot.notes.flatMap(n=>n.references.flatMap(r=>['A','B'].map(a=>r[a]?.id).filter(Boolean))));
 $('#library-status').textContent='正在整理全部笔记和参考图…';
 for(const id of ids){const blob=await getAsset(id);if(!blob)throw Error('有参考图文件缺失，未生成完整备份。请重新放入缺失图片后再备份。');assets.push({id,data:await dataURL(blob)});}
 download(JSON.stringify({format:'ielts-workbench-backup',version:1,exportedAt:new Date().toISOString(),library:snapshot,assets}),date()+'-雅思图文工作台-完整备份.json','application/json');
 $('#library-status').textContent=`已发起下载：${snapshot.notes.length} 篇笔记、${assets.length} 张参考图。请保留下载的 JSON 文件。`;
}
async function restoreLibrary(file){
 if(!file)return;if(!save())return;
 $('#library-status').textContent='正在检查备份…';
 const data=JSON.parse(await file.text());
 if(data.format!=='ielts-workbench-backup'||data.version!==1||data.library?.version!==1||!Array.isArray(data.library.notes)||!data.library.notes.length||!data.library.notes.every(validNote)||!Array.isArray(data.assets))throw Error('这不是有效的工作台备份，原记录没有改变。');
 const assets=new Map();
 for(const asset of data.assets){if(typeof asset.id!=='string'||typeof asset.data!=='string'||!/^data:image\/(png|jpeg|webp);base64,/.test(asset.data)||assets.has(asset.id))throw Error('备份图片格式有误，原记录没有改变。');const blob=await (await fetch(asset.data)).blob();if(blob.size>12*1024*1024)throw Error('备份图片过大');const image=await createImageBitmap(blob);image.close();assets.set(asset.id,{id:crypto.randomUUID(),blob});}
 const notes=data.library.notes.map(n=>{const copy={...fresh(),...structuredClone(n),id:crypto.randomUUID(),name:n.name+'（恢复）'};for(const r of copy.references)for(const a of ['A','B'])if(r[a]){const asset=assets.get(r[a].id);if(!asset)throw Error('备份缺少参考图，原记录没有改变。');r[a].id=asset.id;}return copy;});
 for(const asset of assets.values())await putAsset(asset.id,asset.blob);
 const oldNotes=library.notes,oldState=state,oldActive=library.activeId;library.notes=[...library.notes,...notes];const restoredIndex=data.library.notes.findIndex(n=>n.id===data.library.activeId);state=notes[restoredIndex>=0?restoredIndex:0];library.activeId=state.id;
 if(!persistLibrary()){library.notes=oldNotes;state=oldState;library.activeId=oldActive;return;}
 refreshLibrary();render();$('#library-status').textContent=`已恢复 ${notes.length} 篇笔记，作为独立副本加入；原有笔记均保留。当前打开「${state.name}」，其他笔记可在左上方“我的笔记”切换。`;
}

// Direct relationships, not a blanket reset of every subsequent block.
const dependencies={0:[3],1:[14],2:[14],3:[6,7,8,10],4:[5],5:[7,10,13],6:[8],7:[10],8:[12,14],9:[12,13,14],10:[13],11:[12,14],12:[14],13:[12,14],14:[]};
const completeAt=i=>state.done[i]&&!state.review[i];
const allReady=()=>state.done.slice(0,15).every((_,i)=>completeAt(i));
function hasContent(i){return Object.values(state.values[i]||{}).some(v=>String(v).trim())||(i===12&&(state.shots.some(Boolean)||state.references.some(r=>r.A||r.B)))||(i===14&&state.revision.some(Boolean));}
function statusAt(i){if(state.review[i])return '待复核';if(completeAt(i))return '已完成';if(state.working[i]||hasContent(i))return '进行中';return '未开始';}
function invalidate(i){state.done[i]=false;state.review[i]=false;state.working[i]=true;for(const j of dependencies[i]||[]){if(state.done[j]||hasContent(j))state.review[j]=true;}state.done[15]=false;}
function changed(i){invalidate(i);save();updateChrome();}
function photoSignature(i){return JSON.stringify([value(8,'formula')||titleTypes[0],value(8,'title'),value(11,'image'+i),state.style,...(photoBody().some(p=>p.text)?[photoBody().map(p=>p.text)]:[])]);}
function refsCurrent(i){return ['A','B'].every(a=>state.references[i][a]?.signature===photoSignature(i));}
function errors(i){
 const s=steps[i],out=[];
 if(i===12){if(!state.style.every(Boolean))out.push('请确认四个风格锚点');if(!value(8,'title'))out.push('请先填写第 09 步标题');photoNames.forEach((n,j)=>{if(!value(11,'image'+j).trim())out.push(`图 ${j+1} 缺少第 12 步重点`);if(state.sources[j]==='真人实拍'&&!refsCurrent(j))out.push(`图 ${j+1} 需要与当前重点一致的 A/B 参考图`);if(!state.shots[j])out.push(`图 ${j+1} 尚未完成${state.sources[j]==='真人实拍'?'实拍':'截图'}`);});return out;}
 if(i===14)return state.revision.every(Boolean)?[]:['请完成六个修改检查项'];
 if(i===15)return [];
 s.fields.forEach(f=>{const v=value(i,f.id).trim(),n=count(v);if(!v)out.push(`请填写「${f.label}」`);else if(f.min&&n<f.min)out.push(`「${f.label}」需至少 ${f.min} 字（目前 ${n} 字）`);else if(f.max&&n>f.max)out.push(`「${f.label}」需不超过 ${f.max} 字（目前 ${n} 字）`);});
 if(i===13&&(count(value(9,'opening'))<100||count(value(9,'opening'))>150))out.push('引用的开头需为 100—150 字，请返回第 10 步调整');return out;
}
function navigate(i){state.step=i;save();render();if(matchMedia('(max-width:700px)').matches){$('#navigation').open=false;$('main').scrollIntoView({behavior:'smooth',block:'start'});}}
function updateChrome(){
 $('#count').textContent=state.done.filter((_,i)=>completeAt(i)).length+'/16步已完成';$('#progress').value=state.done.filter((_,i)=>completeAt(i)).length;
 const nav=$('#steps');nav.replaceChildren();let phase=-1;
 steps.forEach((s,i)=>{if(s.phase!==phase){phase=s.phase;nav.append(el('div','阶段'+['一','二','三'][phase]+' · '+phaseNames[phase],'phase'));}const b=el('button');b.type='button';b.dataset.step=i;if(i===state.step)b.setAttribute('aria-current','step');b.append(el('span',state.review[i]?'!':completeAt(i)?'✓':String(i+1).padStart(2,'0'),'step-number'),el('span',s.name),el('span',statusAt(i),'status-tag'));b.onclick=()=>navigate(i);nav.append(b);});
 const topicButton=$('#scene-to-topic');if(topicButton){topicButton.disabled=!value(4,'scene').trim();topicButton.textContent=value(3,'topic').trim()?'查看已有选题 →':'用这个卡点开始选题 →';}
 const i=state.step;$('#primary').textContent=i===15?(allReady()?'导出 Markdown 成品':'导出 Markdown 草稿'):completeAt(i)?'已完成，进入下一步 →':'请AI帮我处理这一步';$('#complete').hidden=i===15||completeAt(i);$('#complete').textContent=state.review[i]?'已复核，确认本板块完成':'确认这一步已完成';$('#next-specific').textContent=i<15?`建议下一步：${String(i+2).padStart(2,'0')} ${steps[i+1].name} — ${steps[i+1].action} 也可直接切换左侧任意板块并行推进。`:'随时可以导出草稿；全部完成并复核后导出成品。';
 $('#review-notice').hidden=!state.review[i];$('#review-notice').textContent='相关内容有更新，请复核本板块。已填内容和勾选均保留。';
 const active=steps.slice(0,15).map((s,j)=>statusAt(j)==='进行中'?String(j+1).padStart(2,'0')+' '+s.name:null).filter(Boolean);$('#parallel-state').textContent=active.length?'正在推进：'+active.join(' · '):'可以从任何板块开始；填好一部分也会自动保存。';

}
function field(f,i,readonly=false,override){const wrap=el('div',undefined,'field'),id=`field-${i}-${f.id}`,label=el('label',f.label+(f.min?`（${f.min}—${f.max} 字）`:''));label.htmlFor=id;const t=el('textarea');t.id=id;t.rows=i===13?5:3;t.maxLength=20000;t.value=override??value(i,f.id);t.readOnly=readonly;const small=el('small');function feedback(){const n=count(t.value);small.textContent=`${n} 字`+(readonly?' · 自动引用第 10 步，修改请回到开头板块':'');small.className=f.min&&(n<f.min||n>f.max)?'invalid':'';}feedback();t.oninput=()=>{state.values[i][f.id]=t.value;feedback();changed(i);};wrap.append(label,t,small);return wrap;}
function checkbox(text,checked,fn,id){const l=el('label',undefined,'check'),c=el('input');c.type='checkbox';c.checked=checked;if(id)c.id=id;c.onchange=()=>fn(c.checked);l.append(c,el('span',text));return l;}
function button(text,fn){const b=el('button',text);b.type='button';b.onclick=fn;return b;}
function advice(i){const focus=value(11,'image'+i)||'请先填写第 12 步重点';const props=[['真实使用的书页或错题','笔'],['原方法与新方法的真实材料','笔'],['实际 AI 操作界面'],['实际制作出的词卡或结果','笔'],['真实复习记录或验证材料','笔']][i];return {focus,props:props.join('、'),arrangement:'将与“'+focus+'”直接有关的材料放在主体位置；其他物品退到边缘，标题区域留白，不补造记录。',A:'俯拍展开全景，交代材料之间的关系；手指向当前重点。',B:'45° 斜侧近拍，突出真实操作动作和材料细节；不挡住重点文字。'};}
function photoBody(){return [{label:'开头',text:value(9,'opening')},...steps[13].fields.map(f=>({label:f.label,text:value(13,f.id)}))];}
function requestPhotoTask(indices,cover=false){
 $('#handoff').hidden=true;
 if(!indices.length){$('#notice').textContent='当前全部为 AI 截图，无需生成拍摄参考图。';return;}
 if(cover&&state.sources[0]!=='真人实拍'){$('#notice').textContent='图 1 当前设为 AI 截图，保留真实截图；要试拍封面，可将图 1 的素材来源改为真人实拍。';return;}
 const missing=[];if(!value(8,'title').trim())missing.push('第 09 步标题');if(photoBody().some(p=>!p.text.trim()))missing.push('第 14 步正文（含引用第 10 步的开头）');
 if(missing.length){$('#handoff').hidden=true;$('#notice').textContent='先写好'+missing.join('和')+'，再来准备参考图。可以直接跳过去填写，无需先勾选完成，也不检查字数。';return;}
 showHandoff(photoTask(indices,cover));
}
function photoTask(indices,cover=false){
 let text=`请调用 $content-photo-reference，并按可用 imagegen 技能使用内置生图。\n本次范围：${cover?'只试封面（对应工作台图 1），仅生成 A/B 两张独立参考图，不扩展其他页。':'按下列工作台清单，为选中的真人实拍页分别生成 A/B 两张独立参考图。'}\n预期图片数量：${indices.length*2} 张。每张竖版 3:4。\n本篇采用已确定的五图框架；保持编号，不另拆页、不凑页。标为 AI 截图的页只用真实操作截图，不生成仿造界面。\n标题类型：${value(8,'formula')||titleTypes[0]}\n标题：${value(8,'title')}\n\n正文（本篇事实依据）：\n${photoBody().map(p=>p.label+'\n'+p.text).join('\n\n')}\n\n完整五图清单：\n${photoNames.map((n,i)=>`图 ${i+1} · ${n} · ${state.sources[i]}：${value(11,'image'+i)||'重点未填，请依据正文提炼，并在交付时列明，供填回第12步'}`).join('\n')}\n\n统一风格：${anchors.join('、')}。普通手机实拍感、纸张和手部动作，整套桌面与光线一致。道具优先普通纸、笔、书，按正文选择，不把所有主题套成单词卡。\n每页 A/B 印同一句本页重点；每张底部实际印上“参考稿，非发布成片”。不得虚构学习效果、日期、词义、词根、统计和可读软件界面。正文与重点有冲突时采用正文支持的保守表述并说明。\n`;
 indices.forEach(i=>{text+=`\n生成图 ${i+1} · ${cover?'封面（困境）':photoNames[i]}\n本页重点：${value(11,'image'+i)||'从正文提炼一句，不编造事实'}\n构图 A：俯拍展开全景，交代材料关系。\n构图 B：斜侧近拍，突出手部动作与关键材料。两种构图须有实质差异。\n文件名：${String(i+1).padStart(2,'0')}-A.png、${String(i+1).padStart(2,'0')}-B.png。\n`;});
 text+='\n交付：直接生成本次范围内的图片，不只交提示词。逐张检查文字、手部、道具可复现性、A/B 差异与尺寸。按图号展示两种构图，附本页重点、简短道具和摆放建议。图片及提示词存入新的版本目录，保留旧文件；已知本篇项目文件夹时放进其“02-制作过程”，路径未知时使用当前项目新的输出目录，不声称已自动关联。不能生成时如实说明缺失项。生成图片不代表已实拍完成。\n网页不会自动接收结果，请说明将图片放回第13步对应的 A/B 位置；新提炼的重点需填回第12步，先填重点再放图。';
 return text;
}
const dbPromise=new Promise((resolve,reject)=>{if(!window.indexedDB){reject(new Error('浏览器不支持素材保存'));return;}const req=indexedDB.open('ielts-workbench-assets',1);req.onupgradeneeded=()=>req.result.createObjectStore('images');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});dbPromise.catch(()=>{});
async function putAsset(id,blob){const db=await dbPromise;return new Promise((res,rej)=>{const tx=db.transaction('images','readwrite');tx.objectStore('images').put(blob,id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}
async function getAsset(id){const db=await dbPromise;return new Promise((res,rej)=>{const r=db.transaction('images').objectStore('images').get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
function renderPhotos(container,token){
 container.append(el('p',`引用 09：${value(8,'formula')||titleTypes[0]}\n标题：${value(8,'title')||'尚未填写'}`,'linked'));
 const styleBox=el('div');styleBox.append(el('h3','风格锚点确认'));anchors.forEach((a,i)=>styleBox.append(checkbox(a,state.style[i],v=>{state.style[i]=v;state.shots.fill(false);changed(12);render();},'anchor-'+i)));container.append(styleBox);
 container.append(el('p','拍摄参考 Skill 已接入任务整理。先写好标题和正文，再选封面试拍或整套；复制任务到 Codex 生成，回来放入图片。','muted'));
 const controls=el('div',undefined,'actions');const cover=button('先试封面 A/B（交给 Codex）',()=>requestPhotoTask([0],true));cover.id='photo-cover-task';const all=button('整套实拍参考任务（交给 Codex）',()=>requestPhotoTask(state.sources.map((s,i)=>s==='真人实拍'?i:-1).filter(i=>i>=0)));all.id='photo-all-task';controls.append(cover,all,button('去第 14 步写正文',()=>navigate(13)));container.append(controls);

 photoNames.forEach((n,i)=>{const card=el('section',undefined,'photo-card');card.append(el('h3',`图 ${i+1} · ${n}`),el('p','引用 12：'+(value(11,'image'+i)||'尚未填写'),'linked'));const l=el('label','素材来源');l.htmlFor='source-'+i;const sel=el('select');sel.id='source-'+i;['真人实拍','AI截图'].forEach(v=>{const o=el('option',v);o.value=v;sel.append(o);});sel.value=state.sources[i];sel.onchange=()=>{state.sources[i]=sel.value;state.shots[i]=false;changed(12);render();};card.append(l,sel);
 if(state.sources[i]==='真人实拍'){const a=advice(i);card.append(el('p','道具清单：'+a.props),el('p','摆放建议：'+a.arrangement),button('生成这张图的 A/B 参考任务（交给 Codex）',()=>requestPhotoTask([i])));const grid=el('div',undefined,'angles');['A','B'].forEach(angle=>{const box=el('div',undefined,'reference');box.append(el('p',`构图 ${angle}：${a[angle]}`));const img=el('img');img.alt=`图 ${i+1} 构图 ${angle} 的 AI 拍摄参考图`;img.hidden=true;box.append(img);const meta=state.references[i][angle];const status=el('p',meta?meta.name+' · '+(meta.signature===photoSignature(i)?'已放入参考图':'正文、重点或风格已变化，请重新生成'):'待生成参考图','muted');if(meta&&meta.signature!==photoSignature(i))status.classList.add('stale');box.append(status);
 if(meta)getAsset(meta.id).then(blob=>{if(token!==renderId)return;if(!blob){status.textContent='图片文件未找到，请重新选择';state.references[i][angle]=null;invalidate(12);save();updateChrome();return;}const url=URL.createObjectURL(blob);urls.push(url);img.src=url;img.hidden=false;}).catch(()=>{status.textContent='素材库不可用，请重新选择图片';});
 const lab=el('label','放入生成后的参考图 '+angle);const input=el('input');input.type='file';input.accept='image/png,image/jpeg,image/webp';input.id=`ref-${i}-${angle}`;lab.htmlFor=input.id;input.onchange=async()=>{const file=input.files[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>12*1024*1024){status.textContent='请选择 12 MB 以内的 PNG、JPG 或 WebP 图片';return;}const sig=photoSignature(i),owner=state;pendingUploads++;showSaved();try{const decoded=await createImageBitmap(file);decoded.close();const id=crypto.randomUUID();await putAsset(id,file);owner.references[i][angle]={id,name:file.name,signature:sig};owner.shots[i]=false;owner.done[12]=false;owner.working[12]=true;owner.done[15]=false;owner.savedAt=new Date().toISOString();if(owner===state){changed(12);if(state.step===12)render();}else persistLibrary();}catch{status.textContent='图片读取或保存失败，请重新选择';}finally{pendingUploads--;showSaved();}};box.append(lab,input);grid.append(box);});card.append(grid);}else card.append(el('p','直接截取真实 AI 操作过程或结果，保留关键输入与输出；这一张不生成仿造界面。','muted'));
 card.append(checkbox(state.sources[i]==='真人实拍'?'已实拍完成':'已截图完成',state.shots[i],v=>{state.shots[i]=v;changed(12);},'shot-'+i));container.append(card);
 });
}
function render(){
 renderId++;urls.forEach(URL.revokeObjectURL);urls=[];const token=renderId,i=state.step,s=steps[i];$('#post-name').value=state.name;$('#stage-number').textContent=`阶段${['一','二','三'][s.phase]} · ${String(i+1).padStart(2,'0')} / 16`;$('#stage-title').textContent=s.name;$('#action').textContent=s.action;$('#hint').textContent=s.hint;$('#resume-note').value=state.resume?.text||'';refreshResume();$('#step-blocker').textContent='常见卡点：'+minimumGuides[i][0];$('#step-minimum').textContent='最低完成标准：'+minimumGuides[i][1];$('#guidance').open=false;$('#handoff').hidden=true;$('#notice').textContent='';const area=$('#fields');area.replaceChildren();
 if(i===8){const wrap=el('div',undefined,'field'),l=el('label','标题公式类型');l.htmlFor='title-formula';const select=el('select');select.id='title-formula';titleTypes.forEach(x=>{const o=el('option',x);o.value=x;select.append(o);});select.value=value(8,'formula')||titleTypes[0];const example=el('p',titleExamples[titleTypes.indexOf(select.value)],'muted');select.onchange=()=>{state.values[8].formula=select.value;example.textContent=titleExamples[select.selectedIndex];changed(8);};wrap.append(l,select,example);area.append(wrap);}
 if(i===13){area.append(field(F('opening','开头（引用 10）',100,150),9,true,value(9,'opening')),button('返回第 10 步修改开头',()=>navigate(9)));}
 if(i===12)renderPhotos(area,token);
 else if(i===14){rounds.forEach((r,j)=>area.append(checkbox(`${j+1}. ${r}`,state.revision[j],v=>{state.revision[j]=v;changed(14);},'revision-'+j)));steps[i].fields.forEach(f=>area.append(field(f,i)));}
 else if(i===15){const pending=steps.slice(0,15).map((s,j)=>completeAt(j)?null:String(j+1).padStart(2,'0')+' '+s.name).filter(Boolean);area.append(el('p',pending.length?'可导出当前草稿。待完成或复核：'+pending.join('、'):'01—15 已全部确认，可以导出成品。','linked'));const preview=el('pre',markdown());preview.id='export-preview';area.append(preview);}
 else s.fields.forEach(f=>area.append(field(f,i)));
 if(i===4){const b=button('用这个卡点开始选题 →',startTopicFromScene);b.id='scene-to-topic';area.append(b);}
 updateChrome();
}
function mdStep(i){const s=steps[i];let text=`## ${String(i+1).padStart(2,'0')} ${s.name}\n\n状态：${statusAt(i)}\n\n`;
 if(i===8)text+=`标题类型：${value(8,'formula')||titleTypes[0]}\n\n`;
 if(i===13)text+=`### 开头（引用 10）\n\n${value(9,'opening')||'未填写'}\n\n`;
 if(i===12){text+=`引用标题：${value(8,'title')||'未填写'}\n标题类型：${value(8,'formula')||titleTypes[0]}\n\n风格确认：\n${anchors.map((a,j)=>'- ['+(state.style[j]?'x':' ')+'] '+a).join('\n')}\n\n`;photoNames.forEach((n,j)=>{const a=advice(j);text+=`### 图 ${j+1} · ${n}\n\n重点（引用 12）：${value(11,'image'+j)||'未填写'}\n来源：${state.sources[j]}\n完成：${state.shots[j]?'是':'否'}\n\n`;if(state.sources[j]==='真人实拍'){text+=`道具：${a.props}\n摆放：${a.arrangement}\n构图 A：${a.A}\n构图 B：${a.B}\n`;['A','B'].forEach(k=>{const r=state.references[j][k];text+=`参考图 ${k}：${r?r.name+'（'+(r.signature===photoSignature(j)?'与当前内容一致':'需更新')+'）':'未放入'}\n`;});text+='\n';}});}
 if(i===14)text+=rounds.map((r,j)=>'- ['+(state.revision[j]?'x':' ')+'] '+r).join('\n')+'\n\n';
 s.fields.forEach(f=>text+=`### ${f.label}${f.min?'（'+f.min+'—'+f.max+' 字）':''}\n\n${value(i,f.id)||'未填写'}\n\n`);return text;
}
function markdown(){let t='# '+(state.name||'雅思 AI 图文笔记')+'\n\n导出日期：'+date()+'\n状态：'+(allReady()?'成品':'草稿（包含未完成或待复核板块）')+'\n\n';for(let i=0;i<15;i++)t+=mdStep(i);if(state.legacy)t+='## 六步版旧记录（保留原文）\n\n'+state.legacy.notes.map((x,j)=>`### 原第 ${j+1} 步\n\n${x||'未填写'}`).join('\n\n');return t;}
function date(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function filename(){const keyword=value(6,'summary').trim().replace(/[\\/:*?"<>|\u0000-\u001f]/g,'').replace(/\s+/g,'-');return date()+'-'+(Array.from(keyword).slice(0,20).join('')||'雅思AI图文')+(allReady()?'':'-草稿')+'.md';}
function download(text,name,type='text/markdown;charset=utf-8'){const url=URL.createObjectURL(new Blob([text],{type}));const a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function showHandoff(text){handoff=text;$('#handoff-text').value=text;$('#handoff').hidden=false;$('#handoff').open=true;$('#notice').textContent='任务已整理好。复制到当前 Codex 对话执行。';$('#handoff').scrollIntoView({behavior:'smooth',block:'nearest'});}
$('#post-name').oninput=e=>{state.name=e.target.value;save();};
$('#complete').onclick=()=>{const e=errors(state.step);if(e.length){$('#notice').textContent=e.join('；');return;}state.done[state.step]=true;state.review[state.step]=false;state.working[state.step]=false;save();updateChrome();$('#notice').textContent='本板块已完成，可继续任意其他板块。';};
$('#primary').onclick=()=>{const i=state.step;if(i===15){const e=errors(15);if(e.length){$('#notice').textContent=e.join('；');return;}download(markdown(),filename());state.done[15]=allReady();save();updateChrome();$('#notice').textContent=(allReady()?'成品':'草稿')+' Markdown 已生成并发起下载。';return;}if(completeAt(i)){navigate(i+1);return;}state.working[i]=true;save();updateChrome();if(i===12){const ids=state.sources.map((s,j)=>s==='真人实拍'?j:-1).filter(j=>j>=0);if(!ids.length){showHandoff('请依据以下清单检查五张真实 AI 截图所需内容：\n'+mdStep(11));return;}requestPhotoTask(ids);return;}let task='请继续我的雅思 AI 图文制作，仅处理第 '+(i+1)+' 步「'+steps[i].name+'」。\n'+steps[i].action+'\n'+steps[i].hint+'\n保留原方法，不合并板块，不虚构经历或效果。\n\n';task+='本篇允许多个板块并行推进。以下是所有板块的当前内容与状态；只处理本次指定板块，不以编号顺序推断其他板块为空。\n';for(let j=0;j<15;j++)task+=mdStep(j);showHandoff(task);};
$('#copy-handoff').onclick=async()=>{try{await navigator.clipboard.writeText(handoff);$('#notice').textContent='任务已复制，可以粘贴到 Codex。';}catch{$('#handoff-text').focus();$('#handoff-text').select();$('#notice').textContent='已选中文字，请按 Command+C 复制。';}};
$('#download-handoff').onclick=()=>download(handoff,date()+'-第'+(state.step+1)+'步-AI任务.md');
window.addEventListener('beforeunload',e=>{if(storageError||pendingUploads){e.preventDefault();e.returnValue='';}});
$('#resume-note').oninput=e=>{state.resume={text:e.target.value,step:state.step};save();refreshResume();};
$('#resume-jump').onclick=()=>navigate(state.resume.step);
$('#save-quick').onclick=captureQuickNote;
$('#cancel-quick').onclick=()=>{$('#quick-capture').open=false;$('#quick-status').textContent='';};
$('#quick-capture').ontoggle=()=>{if($('#quick-capture').open)$('#quick-scene').focus();};
$('#new-note').onclick=createNote;
$('#note-picker').onchange=e=>switchNote(e.target.value);
$('#backup-all').onclick=()=>libraryTask(backupLibrary);
$('#restore-backup').onclick=()=>$('#backup-file').click();
$('#backup-file').onchange=e=>{const file=e.target.files[0];e.target.value='';libraryTask(()=>restoreLibrary(file));};
refreshLibrary();
if(matchMedia('(max-width:700px)').matches)$('#navigation').open=false;
render();
