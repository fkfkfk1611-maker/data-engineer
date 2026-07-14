const trackUrl = 'https://www.datacamp.com/tracks/associate-data-engineer-in-sql';
const courses = [
 {id:1,title:'Understanding Data Engineering',hours:2,type:'foundation',cat:'all',defaultDone:true,url:'https://www.datacamp.com/courses/understanding-data-engineering',desc:'See how data engineers turn raw sources into reliable, analysis-ready systems—and how the role connects software, analytics, and infrastructure.',topics:['The data engineering ecosystem','Data pipelines and workflows','Storage and processing concepts','Cloud and modern tooling'],checkpoint:'Sketch a source → ingestion → storage → serving pipeline for an app you use.'},
 {id:2,title:'Introduction to SQL',hours:2,type:'sql',cat:'sql',defaultDone:true,url:'https://www.datacamp.com/courses/introduction-to-sql',desc:'Learn the relational query basics you will use throughout the track: selecting, filtering, summarizing, sorting, and grouping tabular data.',topics:['SELECT and DISTINCT','WHERE and logical filters','Aggregate functions','ORDER BY and GROUP BY'],checkpoint:'Write one query that filters a table, groups by a category, and sorts an aggregate.'},
 {id:3,title:'Intermediate SQL',hours:4,type:'sql',cat:'sql',defaultDone:true,url:'https://www.datacamp.com/courses/intermediate-sql',desc:'Make your queries expressive and dependable with more precise filters, calculations, aggregation patterns, aliases, and clean query structure.',topics:['Query execution order','Pattern and null filtering','Numeric and date calculations','Grouping with HAVING'],checkpoint:'Explain the difference between WHERE and HAVING, then demonstrate both in one query.'},
 {id:4,title:'Joining Data in SQL',hours:4,type:'sql',cat:'sql',defaultDone:true,url:'https://www.datacamp.com/courses/joining-data-in-sql',desc:'Connect related tables using joins, relational set operations, and subqueries—the core of turning normalized records into useful datasets.',topics:['INNER and outer joins','Self and cross joins','UNION, INTERSECT, EXCEPT','Correlated subqueries'],checkpoint:'Build a three-table join and explain what happens to unmatched rows.'},
 {id:5,title:'Introduction to Relational Databases in SQL',hours:4,type:'modeling',cat:'modeling',defaultDone:true,url:'https://www.datacamp.com/courses/introduction-to-relational-databases-in-sql',desc:'Move from querying existing tables to defining reliable ones with keys, constraints, relationships, and the language of relational design.',topics:['Tables and data types','Primary and foreign keys','Uniqueness and constraints','Entity relationships'],checkpoint:'Design tables for customers, orders, and products. Mark every primary and foreign key.'},
 {id:6,title:'Database Design',hours:4,type:'modeling',cat:'modeling',defaultDone:false,url:'https://www.datacamp.com/courses/database-design',desc:'Organize data for accuracy and performance by comparing operational and analytical workloads, applying normalization, and using views.',topics:['OLTP vs. OLAP','Normalization levels','Dimensional modeling','Views and materialization'],checkpoint:'Take one wide spreadsheet and normalize it to third normal form; note the trade-offs.',partial:56},
 {id:7,title:'Data Warehousing Concepts',hours:4,type:'warehouse',cat:'warehouse',defaultDone:false,url:'https://www.datacamp.com/courses/data-warehousing-concepts',desc:'Understand warehouse lifecycles, data marts and lakes, dimensional schemas, ETL/ELT, slowly changing dimensions, and cloud trade-offs.',topics:['Warehouse, lake, and mart','Star and snowflake schemas','Facts, dimensions, and grain','ETL vs. ELT'],checkpoint:'Choose a grain and draft a star schema for an online store’s daily sales.'},
 {id:8,title:'Introduction to Snowflake SQL',hours:4,type:'warehouse',cat:'warehouse',defaultDone:false,url:'https://www.datacamp.com/courses/introduction-to-snowflake-sql',desc:'Translate your SQL and warehouse knowledge to Snowflake: its separated architecture, object hierarchy, data loading, access, and query workflows.',topics:['Snowflake architecture','Databases, schemas, warehouses','Loading and querying data','Roles and access control'],checkpoint:'Explain how Snowflake separates storage and compute, then propose two warehouse sizes.'},
 {id:9,title:'Understanding Data Visualization',hours:2,type:'communication',cat:'all',defaultDone:false,url:'https://www.datacamp.com/courses/understanding-data-visualization',desc:'Close the loop by choosing honest, readable visual forms that help people understand the datasets your pipelines deliver.',topics:['Distributions and comparison','Relationships and trends','Color and encoding','Avoiding misleading charts'],checkpoint:'Choose a chart for five business questions and justify each choice in one sentence.'}
];
const challenges=[
 {name:'Aggregate',level:'01 / 03',text:'From <code>orders(customer_id, amount, status)</code>, return each customer’s total paid amount. Include only paid orders and totals above 500.',hint:'Look for SELECT, SUM, WHERE, GROUP BY, and HAVING.',starter:'SELECT customer_id,\\n       -- calculate the total\\nFROM orders\\n-- filter paid orders\\n-- group and filter totals;',checks:[/select/i,/sum\\s*\\(/i,/where[\\s\\S]*status/i,/group\\s+by/i,/having/i]},
 {name:'Join',level:'02 / 03',text:'Return every customer name and their order count, including customers who have placed zero orders.',hint:'A LEFT JOIN preserves every row from the customer table. COUNT a column from orders.',starter:'SELECT c.name,\\n       COUNT(o.order_id) AS order_count\\nFROM customers AS c\\n-- join orders here\\nGROUP BY c.name;',checks:[/select/i,/left\\s+(outer\\s+)?join/i,/count\\s*\\(/i,/group\\s+by/i]},
 {name:'Warehouse',level:'03 / 03',text:'Create a monthly revenue result with <code>month</code>, <code>region</code>, and <code>revenue</code> from the fact_sales table.',hint:'Use DATE_TRUNC for month, then group by both non-aggregate columns.',starter:"SELECT DATE_TRUNC('month', sold_at) AS month,\\n       region,\\n       SUM(amount) AS revenue\\nFROM fact_sales\\n-- complete the query;",checks:[/date_trunc/i,/sum\\s*\\(/i,/group\\s+by/i,/(month[\\s\\S]*region|region[\\s\\S]*month)/i]}
];
const weeks=[
 ['01','Orientation + SQL basics','Courses 1–2'],
 ['02','Filtering + aggregation','Course 3'],
 ['03','Joins and subqueries','Course 4'],
 ['04','Relational foundations','Course 5'],
 ['05','Database design','Course 6'],
 ['06','Warehouse modeling','Course 7'],
 ['07','Snowflake workflows','Course 8'],
 ['08','Communicate + portfolio','Course 9 + projects']
];
const quiz=[
 {q:'Which clause filters groups after aggregation?',a:['WHERE','HAVING','ORDER BY'],correct:1},
 {q:'Which join keeps every row from the left table?',a:['INNER JOIN','CROSS JOIN','LEFT JOIN'],correct:2},
 {q:'In a star schema, numeric business events usually live in…',a:['a fact table','a role table','a bridge only'],correct:0}
];
const initialDone=Object.fromEntries(courses.map(c=>[c.id,c.defaultDone]));
const memoryStore={};
const storage={get:key=>{try{return (typeof localStorage!=='undefined'?localStorage.getItem(key):null)??memoryStore[key]??null}catch{return memoryStore[key]??null}},set:(key,value)=>{memoryStore[key]=value;try{if(typeof localStorage!=='undefined')localStorage.setItem(key,value)}catch{}}};
let state=JSON.parse(storage.get('sqlEngineerState')||'null')||{done:initialDone,weeks:{},notes:'',filter:'all'};
let activeChallenge=0;
const $=s=>document.querySelector(s);
function save(){storage.set('sqlEngineerState',JSON.stringify(state))}
function toast(message){const t=$('#toast');t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
function renderNav(){
 $('#sideNav').innerHTML=courses.map(c=>'<a class="road-link '+(state.done[c.id]?'done ':'')+'" href="#course-'+c.id+'"><span class="road-num">'+(state.done[c.id]?'✓':c.id)+'</span><span>'+c.title+'</span><span class="road-time">'+c.hours+'h</span></a>').join('');
}
function renderCourses(){
 const filter=state.filter||'all';
 $('#courseGrid').innerHTML=courses.filter(c=>filter==='all'||c.cat===filter).map(c=>{
  const done=!!state.done[c.id];
  const progress=c.partial&&!done?'<span class="tag">'+c.partial+'% in your screenshot</span>':'';
  return '<article class="course '+(done?'done ':'')+'" id="course-'+c.id+'">'+
   '<button class="course-head" aria-expanded="false"><span class="course-num">'+(done?'✓':String(c.id).padStart(2,'0'))+'</span><span><span class="course-meta">Course '+c.id+' · '+c.hours+' hours · '+c.type+'</span><h3>'+c.title+'</h3><span class="course-tags"><span class="tag">'+(done?'Completed':'To learn')+'</span>'+progress+'</span></span><span class="chev">+</span></button>'+
   '<div class="course-body"><div><p class="course-desc">'+c.desc+'</p><ul class="topics">'+c.topics.map(t=>'<li>'+t+'</li>').join('')+'</ul><div class="course-actions"><button class="complete-btn '+(done?'completed':'')+'" data-id="'+c.id+'">'+(done?'✓ Marked complete':'Mark complete')+'</button><a href="'+c.url+'" target="_blank" rel="noreferrer">Open course ↗</a></div></div><div class="checkpoint"><div class="eyebrow">Proof-of-skill checkpoint</div><p>'+c.checkpoint+'</p><label>Deliverable</label><code>portfolio/checkpoint_'+String(c.id).padStart(2,'0')+'.md</code></div></div></article>';
 }).join('');
 document.querySelectorAll('.course-head').forEach(b=>b.addEventListener('click',()=>{const card=b.closest('.course');card.classList.toggle('open');b.setAttribute('aria-expanded',card.classList.contains('open'))}));
 document.querySelectorAll('.complete-btn').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const id=Number(b.dataset.id);state.done[id]=!state.done[id];save();renderAll();toast(state.done[id]?'Course completed — nice work.':'Course moved back to learning.')}))
}
function updateStats(){
 const complete=courses.filter(c=>state.done[c.id]).length;
 const progress=Math.round(complete/courses.length*100);
 $('#progressFill').style.width=progress+'%';$('#progressLabel').textContent=progress+'%';$('#completeCount').textContent=complete+'/9';
 const next=courses.find(c=>!state.done[c.id]);$('#nextSkill').textContent=next?next.type.toUpperCase():'SHIP';
}
function renderWeeks(){
 $('#weekList').innerHTML=weeks.map((w,i)=>'<label class="week"><span class="week-num">'+w[0]+'</span><span><b>'+w[1]+'</b><span>'+w[2]+'</span></span><input type="checkbox" data-week="'+i+'" '+(state.weeks[i]?'checked':'')+' aria-label="Complete week '+(i+1)+'"></label>').join('');
 document.querySelectorAll('[data-week]').forEach(x=>x.addEventListener('change',()=>{state.weeks[x.dataset.week]=x.checked;save();toast(x.checked?'Sprint week complete.':'Sprint week reopened.')}))
}
function renderAll(){renderNav();renderCourses();renderWeeks();updateStats()}
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.filter=b.dataset.filter;save();renderCourses()}));
function renderChallenge(){
 const c=challenges[activeChallenge];$('#challengeLevel').textContent=c.level;$('#challengeText').innerHTML=c.text;$('#challengeHint').textContent=c.hint;$('#sqlInput').value=c.starter;$('#feedback').className='feedback';$('#feedback').textContent='';
 document.querySelectorAll('.challenge-tab').forEach((b,i)=>b.classList.toggle('active',i===activeChallenge));
}
$('#challengeTabs').innerHTML=challenges.map((c,i)=>'<button class="challenge-tab '+(i===0?'active':'')+'" data-challenge="'+i+'">'+c.name+'</button>').join('');
document.querySelectorAll('[data-challenge]').forEach(b=>b.addEventListener('click',()=>{activeChallenge=Number(b.dataset.challenge);renderChallenge()}));
function checkQuery(){const c=challenges[activeChallenge],value=$('#sqlInput').value,passed=c.checks.filter(r=>r.test(value)).length,f=$('#feedback');if(passed===c.checks.length){f.className='feedback good';f.textContent='✓ Structure looks right. Now test it against real data and inspect edge cases.'}else{f.className='feedback try';f.textContent='Not yet — '+passed+' of '+c.checks.length+' key ideas detected. Re-read the hint and refine your query.'}}
$('#runQuery').addEventListener('click',checkQuery);$('#sqlInput').addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter')checkQuery()});
const notes=$('#notes');notes.value=state.notes||'';let noteTimer;notes.addEventListener('input',()=>{clearTimeout(noteTimer);$('#saveStatus').textContent='Saving…';noteTimer=setTimeout(()=>{state.notes=notes.value;save();$('#saveStatus').textContent='Saved on this device'},400)});
let quizAnswers={};function renderQuiz(){ $('#quizBox').innerHTML=quiz.map((q,qi)=>'<div class="question"><p>'+(qi+1)+'. '+q.q+'</p><div class="answers">'+q.a.map((a,ai)=>'<button class="answer" data-q="'+qi+'" data-a="'+ai+'">'+a+'</button>').join('')+'</div></div>').join('');document.querySelectorAll('.answer').forEach(b=>b.addEventListener('click',()=>{const qi=Number(b.dataset.q),ai=Number(b.dataset.a);quizAnswers[qi]=ai;document.querySelectorAll('[data-q="'+qi+'"]').forEach(x=>{x.classList.remove('correct','wrong');const xa=Number(x.dataset.a);if(xa===quiz[qi].correct)x.classList.add('correct');else if(xa===ai)x.classList.add('wrong')});const score=quiz.filter((q,i)=>quizAnswers[i]===q.correct).length;$('#quizScore').textContent=Object.keys(quizAnswers).length===quiz.length?'Score: '+score+' / '+quiz.length+(score===quiz.length?' — ready to ship.':' — revisit the highlighted concepts.'):'Answer all three to see your score.'}))}
$('#focusButton').addEventListener('click',()=>{const next=courses.find(c=>!state.done[c.id]);if(next){location.hash='course-'+next.id;setTimeout(()=>{const card=$('#course-'+next.id);if(card&&!card.classList.contains('open'))card.querySelector('.course-head').click()},200)}else{location.hash='lab'}});
$('#resetProgress').addEventListener('click',()=>{if(confirm('Reset course, sprint, and notes progress on this device?')){state={done:{},weeks:{},notes:'',filter:'all'};save();notes.value='';document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x.dataset.filter==='all'));renderAll();toast('Progress reset. Fresh start.')}});
renderAll();renderChallenge();renderQuiz();
