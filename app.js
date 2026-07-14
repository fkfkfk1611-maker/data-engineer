(function(){
  'use strict';

  var memoryStore = {};
  var storage = {
    get: function(key){
      try { return (typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null) || memoryStore[key] || null; }
      catch(e){ return memoryStore[key] || null; }
    },
    set: function(key,value){
      memoryStore[key] = value;
      try { if(typeof localStorage !== 'undefined') localStorage.setItem(key,value); } catch(e){}
    }
  };

  var defaultState = {completed:{}, reflections:{}, notes:'', lastCourse:0, lastLesson:0};
  var state;
  try { state = JSON.parse(storage.get('sqlStudioState') || 'null') || defaultState; }
  catch(e){ state = defaultState; }
  state.completed = state.completed || {};
  state.reflections = state.reflections || {};

  var sqlDb = null;
  var currentCourse = 0;
  var currentLesson = 0;
  var $ = function(selector){ return document.querySelector(selector); };

  function save(){
    storage.set('sqlStudioState', JSON.stringify(state));
  }

  function escapeHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  function toast(message){
    var el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    setTimeout(function(){ el.classList.remove('show'); }, 1800);
  }

  function lessonKey(courseIndex,lessonIndex){
    return curriculum[courseIndex].id + '-' + lessonIndex;
  }

  function isDone(courseIndex,lessonIndex){
    return !!state.completed[lessonKey(courseIndex,lessonIndex)];
  }

  function courseDoneCount(courseIndex){
    var count = 0;
    curriculum[courseIndex].lessons.forEach(function(_,lessonIndex){
      if(isDone(courseIndex,lessonIndex)) count += 1;
    });
    return count;
  }

  function totalLessons(){
    return curriculum.reduce(function(sum,course){ return sum + course.lessons.length; },0);
  }

  function totalDone(){
    var count = 0;
    curriculum.forEach(function(course,courseIndex){
      course.lessons.forEach(function(_,lessonIndex){
        if(isDone(courseIndex,lessonIndex)) count += 1;
      });
    });
    return count;
  }

  function updateProgress(){
    var done = totalDone();
    var total = totalLessons();
    var percent = Math.round(done / total * 100);
    var completeCourses = curriculum.filter(function(_,courseIndex){
      return courseDoneCount(courseIndex) === curriculum[courseIndex].lessons.length;
    }).length;
    $('#overallPercent').textContent = percent + '%';
    $('#lessonCount').textContent = done + '/' + total;
    $('#courseCount').textContent = completeCourses + '/' + curriculum.length;
    $('#progressRing').style.background = 'conic-gradient(var(--mint) ' + (percent * 3.6) + 'deg,#214a47 0deg)';
  }

  function renderCourses(){
    $('#courseGrid').innerHTML = curriculum.map(function(course,courseIndex){
      var done = courseDoneCount(courseIndex);
      var percent = Math.round(done / course.lessons.length * 100);
      var buttonLabel = percent === 100 ? 'Review course' : (percent > 0 ? 'Continue' : 'Start course');
      return '<article class="course-card" style="--accent:'+course.color+'">' +
        '<span class="course-accent"></span>' +
        '<div class="course-top"><span class="course-index">'+String(course.id).padStart(2,'0')+'</span><span class="course-percent">'+percent+'%</span></div>' +
        '<div class="mini-track"><div class="mini-fill" style="width:'+percent+'%"></div></div>' +
        '<h3>'+escapeHtml(course.title)+'</h3><p>'+escapeHtml(course.subtitle)+'</p>' +
        '<div class="course-foot"><span>'+course.lessons.length+' lessons · '+course.lessons.reduce(function(s,l){return s+l.minutes;},0)+' min</span>' +
        '<button class="course-start" data-course="'+courseIndex+'">'+buttonLabel+' →</button></div></article>';
    }).join('');

    document.querySelectorAll('.course-start').forEach(function(button){
      button.addEventListener('click',function(){
        var courseIndex = Number(button.dataset.course);
        var firstIncomplete = curriculum[courseIndex].lessons.findIndex(function(_,lessonIndex){ return !isDone(courseIndex,lessonIndex); });
        openLesson(courseIndex, firstIncomplete === -1 ? 0 : firstIncomplete);
      });
    });
    updateProgress();
    renderReview();
  }

  function renderLessonNav(){
    var course = curriculum[currentCourse];
    $('#lessonNav').innerHTML = '<div class="lesson-nav-title">Course lessons</div>' + course.lessons.map(function(lesson,lessonIndex){
      var done = isDone(currentCourse,lessonIndex);
      var active = lessonIndex === currentLesson;
      return '<button class="lesson-link '+(done?'done ':'')+(active?'active':'')+'" data-lesson="'+lessonIndex+'">' +
        '<span class="lesson-dot">'+(done?'✓':lessonIndex+1)+'</span><span><b>'+escapeHtml(lesson.title)+'</b><small>'+lesson.minutes+' min</small></span></button>';
    }).join('');
    document.querySelectorAll('.lesson-link').forEach(function(button){
      button.addEventListener('click',function(){ openLesson(currentCourse,Number(button.dataset.lesson)); });
    });
  }

  function renderExercise(exercise){
    var key = lessonKey(currentCourse,currentLesson);
    if(exercise.type === 'quiz'){
      return '<section class="exercise"><div class="exercise-head"><strong>Knowledge check</strong><span>Choose one</span></div><div class="exercise-body">' +
        '<p class="exercise-prompt">'+escapeHtml(exercise.prompt)+'</p><div class="choice-list">' +
        exercise.choices.map(function(choice,index){return '<button class="choice" data-choice="'+index+'">'+escapeHtml(choice)+'</button>';}).join('') +
        '</div><div id="exerciseFeedback"></div></div></section>';
    }
    if(exercise.type === 'reflection'){
      return '<section class="exercise"><div class="exercise-head"><strong>Apply the idea</strong><span>Written practice</span></div><div class="exercise-body">' +
        '<p class="exercise-prompt">'+escapeHtml(exercise.prompt)+'</p><textarea class="reflection" id="reflectionInput" placeholder="'+escapeHtml(exercise.placeholder||'Write your response…')+'">'+escapeHtml(state.reflections[key]||'')+'</textarea>' +
        '<div class="exercise-actions"><button class="primary" id="saveReflection">Save and complete</button></div><div id="exerciseFeedback"></div></div></section>';
    }
    return '<section class="exercise"><div class="exercise-head"><strong>SQL practice</strong><span>Run a real query</span></div><div class="exercise-body">' +
      '<p class="exercise-prompt">'+escapeHtml(exercise.prompt)+'</p><textarea class="sql-editor" id="lessonSql" spellcheck="false">'+escapeHtml(exercise.starter)+'</textarea>' +
      '<div class="exercise-actions"><button class="primary" id="runLessonSql">Run and check</button><button class="secondary" id="showHint">Show hint</button><button class="secondary" id="showSolution">Reveal solution</button></div>' +
      '<div id="lessonSqlResult"></div><div id="exerciseFeedback"></div></div></section>';
  }

  function renderLesson(){
    var course = curriculum[currentCourse];
    var lesson = course.lessons[currentLesson];
    $('#studioCourseLabel').textContent = 'Course ' + course.id + ' · ' + course.category;
    $('#studioCourseTitle').textContent = course.title;
    var keys = lesson.keyPoints.map(function(point){return '<div class="key">'+escapeHtml(point)+'</div>';}).join('');
    $('#lessonContent').innerHTML =
      '<div class="lesson-breadcrumb">Lesson '+(currentLesson+1)+' of '+course.lessons.length+' · '+lesson.minutes+' minutes</div>' +
      '<h2>'+escapeHtml(lesson.title)+'</h2><div class="lesson-copy">' +
      lesson.paragraphs.map(function(paragraph){return '<p>'+escapeHtml(paragraph)+'</p>';}).join('') +
      '<div class="key-grid">'+keys+'</div>' +
      (lesson.example?'<pre class="code-block">'+escapeHtml(lesson.example)+'</pre>':'') +
      renderExercise(lesson.exercise) + '</div>' +
      '<div class="lesson-actions"><button class="secondary" id="previousLesson" '+(currentCourse===0&&currentLesson===0?'disabled':'')+'>← Previous</button>' +
      '<button class="primary" id="nextLesson">Next lesson →</button></div>';

    bindExercise(lesson.exercise);
    $('#previousLesson').addEventListener('click',goPrevious);
    $('#nextLesson').addEventListener('click',goNext);
  }

  function bindExercise(exercise){
    if(exercise.type === 'quiz'){
      document.querySelectorAll('.choice').forEach(function(button){
        button.addEventListener('click',function(){
          var answer = Number(button.dataset.choice);
          document.querySelectorAll('.choice').forEach(function(choice){ choice.classList.remove('correct','wrong'); });
          if(answer === exercise.answer){
            button.classList.add('correct');
            setFeedback('good','Correct. '+exercise.explanation);
            completeCurrentLesson();
          } else {
            button.classList.add('wrong');
            setFeedback('bad','Not quite. Re-read the key points and try again.');
          }
        });
      });
    } else if(exercise.type === 'reflection'){
      $('#saveReflection').addEventListener('click',function(){
        var value = $('#reflectionInput').value.trim();
        if(value.length < (exercise.minLength || 30)){
          setFeedback('bad','Add a little more detail before completing this lesson.');
          return;
        }
        state.reflections[lessonKey(currentCourse,currentLesson)] = value;
        save();
        setFeedback('good','Saved. You applied the concept in your own words.');
        completeCurrentLesson();
      });
    } else {
      $('#runLessonSql').addEventListener('click',function(){ runLessonQuery(exercise); });
      $('#showHint').addEventListener('click',function(){
        setFeedback('info','Look for these ideas: '+exercise.mustInclude.join(', ')+'.');
      });
      $('#showSolution').addEventListener('click',function(){
        var result = $('#lessonSqlResult');
        result.innerHTML = '<pre class="code-block">'+escapeHtml(exercise.solution)+'</pre>';
      });
    }
  }

  function setFeedback(type,message){
    $('#exerciseFeedback').innerHTML = '<div class="feedback '+type+'">'+escapeHtml(message)+'</div>';
  }

  function normalizeSql(sql){
    return sql.toLowerCase().replace(/\s+/g,' ').trim();
  }

  function structuralCheck(sql,required){
    var normalized = normalizeSql(sql);
    return required.filter(function(item){ return normalized.indexOf(item.toLowerCase()) !== -1; });
  }

  function runLessonQuery(exercise){
    var sql = $('#lessonSql').value.trim();
    var matched = structuralCheck(sql,exercise.mustInclude);
    if(!sql){
      setFeedback('bad','Write a query first.');
      return;
    }
    try {
      var result = sqlDb ? sqlDb.exec(sql) : [];
      $('#lessonSqlResult').innerHTML = result.length ? renderSqlResults(result) : '<div class="feedback info">Statement ran successfully. No result rows were returned.</div>';
      if(matched.length === exercise.mustInclude.length){
        setFeedback('good',sqlDb ? 'Query ran and includes the key ideas for this exercise.' : 'The query structure matches. The local SQL engine is unavailable, so result execution was skipped.');
        completeCurrentLesson();
      } else {
        setFeedback('bad','The query ran, but it is still missing '+(exercise.mustInclude.length-matched.length)+' expected idea(s). Try the hint.');
      }
    } catch(error){
      setFeedback('bad','SQL error: '+error.message);
    }
  }

  function completeCurrentLesson(){
    var key = lessonKey(currentCourse,currentLesson);
    if(!state.completed[key]){
      state.completed[key] = true;
      save();
      renderCourses();
      renderLessonNav();
      toast('Lesson complete.');
    }
  }

  function openLesson(courseIndex,lessonIndex){
    currentCourse = courseIndex;
    currentLesson = lessonIndex;
    state.lastCourse = courseIndex;
    state.lastLesson = lessonIndex;
    save();
    $('#studio').hidden = false;
    renderLessonNav();
    renderLesson();
    $('#studio').scrollIntoView({behavior:'smooth',block:'start'});
  }

  function goPrevious(){
    if(currentLesson > 0) openLesson(currentCourse,currentLesson-1);
    else if(currentCourse > 0) openLesson(currentCourse-1,curriculum[currentCourse-1].lessons.length-1);
  }

  function goNext(){
    if(currentLesson < curriculum[currentCourse].lessons.length-1) openLesson(currentCourse,currentLesson+1);
    else if(currentCourse < curriculum.length-1) openLesson(currentCourse+1,0);
    else toast('You reached the final lesson.');
  }

  function findNextLesson(){
    for(var c=0;c<curriculum.length;c++){
      for(var l=0;l<curriculum[c].lessons.length;l++){
        if(!isDone(c,l)) return {course:c,lesson:l};
      }
    }
    return {course:state.lastCourse||0,lesson:state.lastLesson||0};
  }

  function renderReview(){
    var next = [];
    curriculum.forEach(function(course,courseIndex){
      course.lessons.forEach(function(lesson,lessonIndex){
        if(!isDone(courseIndex,lessonIndex) && next.length < 5){
          next.push('<div class="review-row"><div><b>'+escapeHtml(lesson.title)+'</b><br><span>'+escapeHtml(course.title)+'</span></div><button class="tiny review-open" data-course="'+courseIndex+'" data-lesson="'+lessonIndex+'">Study</button></div>');
        }
      });
    });
    if(!next.length) next.push('<div class="feedback good">All lessons are complete. Revisit a course or use the SQL playground.</div>');
    $('#reviewList').innerHTML = next.join('');
    document.querySelectorAll('.review-open').forEach(function(button){
      button.addEventListener('click',function(){ openLesson(Number(button.dataset.course),Number(button.dataset.lesson)); });
    });
  }

  var seedSql = [
    'PRAGMA foreign_keys = ON;',
    'CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, name TEXT NOT NULL, country TEXT NOT NULL, active INTEGER NOT NULL);',
    "INSERT INTO customers VALUES (1,'Avery Lin','Taiwan',1),(2,'Mina Chen','Taiwan',1),(3,'Noah Williams','USA',1),(4,'Sofia Rossi','Italy',1),(5,'Kai Tan','Singapore',0),(6,'Emi Sato','Japan',1),(7,'Lucas Martin','France',1),(8,'Ravi Shah','India',0);",
    'CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, order_date TEXT NOT NULL, amount REAL NOT NULL, status TEXT NOT NULL, FOREIGN KEY(customer_id) REFERENCES customers(customer_id));',
    "INSERT INTO orders VALUES (101,1,'2026-01-03',120.50,'paid'),(102,1,'2026-01-17',340.00,'paid'),(103,2,'2026-01-08',78.00,'cancelled'),(104,2,'2026-02-01',260.00,'paid'),(105,3,'2026-02-08',540.00,'paid'),(106,3,'2026-02-15',110.00,'refunded'),(107,4,'2026-03-02',95.00,'paid'),(108,4,'2026-03-05',305.00,'paid'),(109,6,'2026-03-09',420.00,'paid'),(110,6,'2026-03-12',64.00,'pending'),(111,7,'2026-03-15',180.00,'paid'),(112,1,'2026-03-20',620.00,'paid');",
    'CREATE TABLE products (product_id INTEGER PRIMARY KEY, product_name TEXT NOT NULL, category TEXT NOT NULL, price REAL NOT NULL);',
    "INSERT INTO products VALUES (1,'Mechanical Keyboard','Accessories',120),(2,'Data Notebook','Books',28),(3,'Ultrawide Monitor','Hardware',540),(4,'USB-C Dock','Hardware',180),(5,'SQL Field Guide','Books',42),(6,'Desk Lamp','Accessories',75);",
    'CREATE TABLE order_items (order_id INTEGER, product_id INTEGER, quantity INTEGER NOT NULL, unit_price REAL NOT NULL, PRIMARY KEY(order_id,product_id));',
    'INSERT INTO order_items VALUES (101,1,1,120.5),(102,4,1,180),(102,6,2,80),(104,1,2,130),(105,3,1,540),(107,2,2,27.5),(108,4,1,180),(108,1,1,125),(109,3,1,420),(111,5,4,45),(112,3,1,540),(112,6,1,80);',
    'CREATE TABLE dim_product (product_key INTEGER PRIMARY KEY, category TEXT NOT NULL, product_name TEXT NOT NULL);',
    "INSERT INTO dim_product VALUES (1,'Accessories','Keyboard'),(2,'Books','Data Notebook'),(3,'Hardware','Monitor'),(4,'Hardware','Dock');",
    'CREATE TABLE fact_sales (sale_id INTEGER PRIMARY KEY, product_key INTEGER NOT NULL, month TEXT NOT NULL, region TEXT NOT NULL, revenue REAL NOT NULL, quantity INTEGER NOT NULL);',
    "INSERT INTO fact_sales VALUES (1,1,'2026-01','APAC',1200,10),(2,2,'2026-01','APAC',640,20),(3,3,'2026-01','NA',5400,10),(4,4,'2026-02','EU',2160,12),(5,1,'2026-02','EU',960,8),(6,3,'2026-02','APAC',4320,8),(7,2,'2026-03','NA',1280,40),(8,4,'2026-03','APAC',2700,15);"
  ].join('\n');

  var schema = [
    ['customers','customer_id PK · name · country · active'],
    ['orders','order_id PK · customer_id FK · order_date · amount · status'],
    ['products','product_id PK · product_name · category · price'],
    ['order_items','order_id PK/FK · product_id PK/FK · quantity · unit_price'],
    ['dim_product','product_key PK · category · product_name'],
    ['fact_sales','sale_id PK · product_key FK · month · region · revenue · quantity']
  ];

  async function initDatabase(){
    $('#schemaBody').innerHTML = schema.map(function(table){
      return '<div class="schema-table"><b>'+table[0]+'</b><p>'+table[1]+'</p></div>';
    }).join('');
    if(typeof initSqlJs === 'undefined'){
      $('#engineStatus').textContent = 'Structure-check mode';
      $('#freeResults').innerHTML = '<div class="feedback info">The SQL engine could not load. Course exercises still provide structural feedback.</div>';
      return;
    }
    try {
      var SQL = await initSqlJs({locateFile:function(file){return 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/'+file;}});
      sqlDb = new SQL.Database();
      sqlDb.run(seedSql);
      $('#engineStatus').textContent = 'Database ready';
    } catch(error){
      $('#engineStatus').textContent = 'Structure-check mode';
      $('#freeResults').innerHTML = '<div class="feedback bad">The practice database could not start: '+escapeHtml(error.message)+'</div>';
    }
  }

  function renderSqlResults(results){
    if(!results || !results.length) return '<div class="feedback info">Query completed. No rows returned.</div>';
    return results.map(function(result){
      var head = '<thead><tr>'+result.columns.map(function(column){return '<th>'+escapeHtml(column)+'</th>';}).join('')+'</tr></thead>';
      var body = '<tbody>'+result.values.map(function(row){
        return '<tr>'+row.map(function(value){return '<td>'+escapeHtml(value)+'</td>';}).join('')+'</tr>';
      }).join('')+'</tbody>';
      return '<table class="result-table">'+head+body+'</table>';
    }).join('');
  }

  function runFreeSql(){
    var sql = $('#freeSql').value.trim();
    if(!sqlDb){
      $('#freeResults').innerHTML = '<div class="feedback info">The database engine is not available in this browser. Your query is saved in the editor.</div>';
      return;
    }
    try {
      var results = sqlDb.exec(sql);
      $('#freeResults').innerHTML = renderSqlResults(results);
    } catch(error){
      $('#freeResults').innerHTML = '<div class="feedback bad">'+escapeHtml(error.message)+'</div>';
    }
  }

  var examples = {
    joins: "SELECT c.name, o.order_id, o.amount, o.status\nFROM customers AS c\nJOIN orders AS o ON c.customer_id = o.customer_id\nWHERE o.status = 'paid'\nORDER BY o.amount DESC;",
    windows: "SELECT customer_id, order_id, amount,\n       ROW_NUMBER() OVER (\n         PARTITION BY customer_id\n         ORDER BY amount DESC\n       ) AS amount_rank\nFROM orders;",
    warehouse: "SELECT p.category,\n       SUM(f.revenue) AS revenue,\n       SUM(f.quantity) AS units\nFROM fact_sales AS f\nJOIN dim_product AS p ON f.product_key = p.product_key\nGROUP BY p.category\nORDER BY revenue DESC;"
  };

  $('#startLearning').addEventListener('click',function(){ var next=findNextLesson();openLesson(next.course,next.lesson); });
  $('#continueNav').addEventListener('click',function(event){ event.preventDefault();var next=findNextLesson();openLesson(next.course,next.lesson); });
  $('#closeStudio').addEventListener('click',function(){ $('#studio').hidden=true;$('#courses').scrollIntoView({behavior:'smooth'}); });
  $('#runFreeSql').addEventListener('click',runFreeSql);
  $('#freeSql').addEventListener('keydown',function(event){ if((event.ctrlKey||event.metaKey)&&event.key==='Enter') runFreeSql(); });
  $('#resetDatabase').addEventListener('click',async function(){ if(sqlDb) sqlDb.close();sqlDb=null;$('#engineStatus').textContent='Resetting…';await initDatabase();toast('Practice database reset.'); });
  document.querySelectorAll('.example-sql').forEach(function(button){
    button.addEventListener('click',function(){ $('#freeSql').value=examples[button.dataset.example];runFreeSql(); });
  });

  var notes = $('#globalNotes');
  notes.value = state.notes || '';
  var noteTimer;
  notes.addEventListener('input',function(){
    clearTimeout(noteTimer);
    $('#noteStatus').textContent='Saving…';
    noteTimer=setTimeout(function(){state.notes=notes.value;save();$('#noteStatus').textContent='Saved locally';},350);
  });

  $('#resetProgress').addEventListener('click',function(){
    if(confirm('Reset all lesson progress, reflections, and notes on this device?')){
      state={completed:{},reflections:{},notes:'',lastCourse:0,lastLesson:0};
      save();notes.value='';$('#studio').hidden=true;renderCourses();toast('Progress reset.');
    }
  });

  renderCourses();
  initDatabase();
})();
