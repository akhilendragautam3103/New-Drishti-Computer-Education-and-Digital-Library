// ============================================================
// NEW DRISHTI RESUME CREATOR V2
// IMPORTANT: paste your deployed Google Apps Script /exec URL.
// Do NOT use the /dev URL.
// ============================================================
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbxR8xyHH7N1i9iXING53CxkLcIm7BZrOD_fY9m9Mwh5Cqes5BrH8fa_uqRwF3GsJzljXQ/exec";

const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const lines=s=>String(s||"").split(/\n|,/).map(x=>x.trim()).filter(Boolean);

let education=[],experience=[],projects=[],skills=[],photoData="",currentTemplate="modern",currentId="";

const templateNames=[
["modern","🌟 Modern"],["professional","💼 Professional"],["classic","📜 Classic"],["creative","🎨 Creative"],
["minimal","⚪ Minimal"],["executive","🏢 Executive"],["elegant","✨ Elegant"],["bold","🔥 Bold"]
];
$("templates").innerHTML=templateNames.map(([id,n])=>`<button class="template ${id===currentTemplate?"active":""}" data-template="${id}" onclick="selectTemplate('${id}')">${n}</button>`).join("");

function selectTemplate(t){
 currentTemplate=t;
 document.querySelectorAll(".template").forEach(b=>b.classList.toggle("active",b.dataset.template===t));
 update();
}
function addEducation(x={}){education.push({...x});renderRepeats();update();}
function addExperience(x={}){experience.push({...x});renderRepeats();update();}
function addProject(x={}){projects.push({...x});renderRepeats();update();}

function renderRepeats(){
 $("educationList").innerHTML=education.map((x,i)=>`<div class="repeat"><button class="remove" onclick="education.splice(${i},1);renderRepeats();update()">✕</button><div class="grid two">
<label>Degree / Course<input value="${esc(x.degree)}" oninput="education[${i}].degree=this.value;update()"></label>
<label>Institute<input value="${esc(x.institute)}" oninput="education[${i}].institute=this.value;update()"></label>
<label>Year<input value="${esc(x.year)}" oninput="education[${i}].year=this.value;update()"></label>
<label>Grade<input value="${esc(x.grade)}" oninput="education[${i}].grade=this.value;update()"></label>
</div></div>`).join("");

 $("experienceList").innerHTML=experience.map((x,i)=>`<div class="repeat"><button class="remove" onclick="experience.splice(${i},1);renderRepeats();update()">✕</button><div class="grid two">
<label>Job Title<input value="${esc(x.title)}" oninput="experience[${i}].title=this.value;update()"></label>
<label>Company<input value="${esc(x.company)}" oninput="experience[${i}].company=this.value;update()"></label>
<label>Duration<input value="${esc(x.duration)}" oninput="experience[${i}].duration=this.value;update()"></label>
<label>Description<textarea oninput="experience[${i}].description=this.value;update()">${esc(x.description)}</textarea></label>
</div></div>`).join("");

 $("projectList").innerHTML=projects.map((x,i)=>`<div class="repeat"><button class="remove" onclick="projects.splice(${i},1);renderRepeats();update()">✕</button>
<label>Project Name<input value="${esc(x.name)}" oninput="projects[${i}].name=this.value;update()"></label>
<label>Description<textarea oninput="projects[${i}].description=this.value;update()">${esc(x.description)}</textarea></label></div>`).join("");
}

function addSkill(){
 const v=$("skillInput").value.trim();
 if(v){skills.push(v);$("skillInput").value="";renderSkills();update();}
}
$("skillInput").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();addSkill();}});
function renderSkills(){
 $("skillsList").innerHTML=skills.map((s,i)=>`<span class="chip">${esc(s)} <button onclick="skills.splice(${i},1);renderSkills();update()">×</button></span>`).join("");
}

function data(){
 return {
 resumeId:currentId,name:$("name").value,jobTitle:$("jobTitle").value,mobile:$("mobile").value,email:$("email").value,
 location:$("location").value,website:$("website").value,summary:$("summary").value,education,experience,skills,projects,
 certifications:$("certifications").value,languages:$("languages").value,hobbies:$("hobbies").value,
 template:currentTemplate,photo:photoData
 };
}

function update(){
 const d=data();
 const edu=d.education.length?d.education.map(x=>`<div class="item"><h3>${esc(x.degree)}</h3><p>${esc(x.institute)} ${x.year?"• "+esc(x.year):""} ${x.grade?"• "+esc(x.grade):""}</p></div>`).join(""):"<p class=empty>Add education details.</p>";
 const exp=d.experience.length?d.experience.map(x=>`<div class=item><h3>${esc(x.title)} — ${esc(x.company)}</h3><div class=date>${esc(x.duration)}</div><p>${esc(x.description)}</p></div>`).join(""):"<p class=empty>Add experience details.</p>";
 const proj=d.projects.map(x=>`<div class=item><h3>${esc(x.name)}</h3><p>${esc(x.description)}</p></div>`).join("");
 const skillsHtml=d.skills.map(x=>`<span class=skill>${esc(x)}</span>`).join("");
 const cert=lines(d.certifications).map(x=>`<div class=item>• ${esc(x)}</div>`).join("");
 const lang=lines(d.languages).map(x=>`<span class=skill>${esc(x)}</span>`).join("");
 const hobby=lines(d.hobbies).map(x=>`<span class=skill>${esc(x)}</span>`).join("");

 $("resume").className="resume "+currentTemplate;
 $("resume").innerHTML=`
<div class=head>${d.photo?`<img class=photo src="${d.photo}">`:""}<div>
<h1>${esc(d.name||"Your Name")}</h1><p><strong>${esc(d.jobTitle||"Professional Title")}</strong></p>
<div class=contact>${esc(d.mobile)} ${d.email?" • "+esc(d.email):""} ${d.location?" • "+esc(d.location):""} ${d.website?" • "+esc(d.website):""}</div>
</div></div>
<div class=columns><main>
<h2>Profile</h2><p>${esc(d.summary||"Your professional summary will appear here.")}</p>
<h2>Experience</h2>${exp}
${proj?`<h2>Projects</h2>${proj}`:""}
<h2>Education</h2>${edu}
</main><aside>
${skillsHtml?`<h2>Skills</h2>${skillsHtml}`:""}
${cert?`<h2>Certifications</h2>${cert}`:""}
${lang?`<h2>Languages</h2>${lang}`:""}
${hobby?`<h2>Hobbies</h2>${hobby}`:""}
</aside></div>
<div class=bottom-note>Created with NEW DRISHTI Resume Creator</div>`;
}

document.querySelectorAll("input:not(#photo):not(#searchId),textarea").forEach(e=>e.addEventListener("input",update));
$("photo").addEventListener("change",e=>{
 const f=e.target.files[0];if(!f)return;
 const r=new FileReader();r.onload=()=>{photoData=r.result;update()};r.readAsDataURL(f);
});

function toast(m){
 $("toast").textContent=m;$("toast").style.opacity=1;$("toast").style.transform="translateY(0)";
 setTimeout(()=>{$("toast").style.opacity=0;$("toast").style.transform="translateY(20px)"},3200);
}
function printResume(){window.print();}
function newResume(){if(confirm("Start a new resume?"))clearAll(false);}

function clearAll(confirmIt=true){
 if(confirmIt&&!confirm("Clear this resume?"))return;
 document.querySelectorAll("input,textarea").forEach(e=>{if(e.type!=="file"&&e.id!=="searchId")e.value=""});
 education=[];experience=[];projects=[];skills=[];photoData="";currentId="";
 $("searchId").value="";$("resumeId").textContent="Resume ID: NEW";
 renderRepeats();renderSkills();update();
}

async function saveResume(){
 const d=data();
 if(!d.name.trim()){toast("Please enter Full Name.");return;}

 if(!currentId)currentId="ND-"+Date.now().toString().slice(-9);
 d.resumeId=currentId;
 $("resumeId").textContent="Resume ID: "+currentId;

 // Always keep a local backup
 localStorage.setItem("ND_RESUME_"+currentId,JSON.stringify(d));

 if(!GAS_API_URL){
   toast("✅ Saved locally. Add GAS_API_URL for Google Sheet.");
   refreshResumeList();
   return;
 }

 try{
   // FIX: send the actual resume object. Code.gs accepts this directly.
   const response=await fetch(GAS_API_URL,{
     method:"POST",
     headers:{"Content-Type":"text/plain;charset=utf-8"},
     body:JSON.stringify(d)
   });
   const text=await response.text();
   let result;
   try{result=JSON.parse(text)}catch(e){throw new Error("Server returned non-JSON response");}
   if(result.success){toast("✅ Saved to Google Sheet | "+currentId);refreshResumeList();}
   else toast("❌ "+(result.message||"Save failed"));
 }catch(err){
   console.error(err);
   toast("⚠️ Local save done. Google Sheet error: "+err.message);
 }
}

function setResumeDropdown(list){
 const select=$("resumeSelect"); if(!select)return; const current=currentId;
 select.innerHTML='<option value="">📋 Select Resume ID + Name</option>';
 (list||[]).forEach(r=>{const opt=document.createElement("option"); opt.value=r.resumeId||""; opt.textContent=(r.resumeId||"NO-ID")+" — "+(r.name||"Unnamed"); select.appendChild(opt);});
 if(current)select.value=current;
}
function selectResumeFromDropdown(id){if(id)$("searchId").value=id;}
async function refreshResumeList(){
 let list=[];
 if(GAS_API_URL){try{const r=await fetch(GAS_API_URL+"?action=list");const out=await r.json();if(out.success&&Array.isArray(out.data))list=out.data;}catch(e){console.error(e);}}
 const local=[]; for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&key.startsWith("ND_RESUME_")){try{const d=JSON.parse(localStorage.getItem(key));if(d&&d.resumeId)local.push({resumeId:d.resumeId,name:d.name||"Unnamed"});}catch(e){}}}
 const map=new Map(); [...list,...local].forEach(r=>{if(r.resumeId)map.set(String(r.resumeId),r)}); setResumeDropdown([...map.values()]);
}

async function loadResume(){
 const id=($("resumeSelect").value || $("searchId").value).trim();
 if(!id){toast("Select Resume ID + Name.");return;}
 $("searchId").value=id;
 let d=null;

 if(GAS_API_URL){
   try{
     const r=await fetch(GAS_API_URL+"?action=get&resumeId="+encodeURIComponent(id));
     const out=await r.json();
     if(out.success)d=out.data;
   }catch(e){console.error(e);}
 }

 if(!d){
   try{d=JSON.parse(localStorage.getItem("ND_RESUME_"+id))}catch(e){}
 }

 if(!d){toast("Resume not found.");return;}
 fillData(d);toast("✅ Resume loaded: "+id);
}

function fillData(d){
 currentId=d.resumeId||"";photoData=d.photo||"";currentTemplate=d.template||"modern";
 ["name","jobTitle","mobile","email","location","website","summary","certifications","languages","hobbies"].forEach(id=>$(id).value=d[id]||"");
 education=Array.isArray(d.education)?d.education:[];
 experience=Array.isArray(d.experience)?d.experience:[];
 projects=Array.isArray(d.projects)?d.projects:[];
 skills=Array.isArray(d.skills)?d.skills:[];
 $("resumeId").textContent="Resume ID: "+(currentId||"NEW");
 renderRepeats();renderSkills();update();
 document.querySelectorAll(".template").forEach(b=>b.classList.toggle("active",b.dataset.template===currentTemplate));
}

addEducation({degree:"Bachelor / Graduation",institute:"Your College / University",year:"2026",grade:""});
addExperience({title:"Your Job Title",company:"Company Name",duration:"2024 – Present",description:"Describe your responsibilities and achievements."});
refreshResumeList();
update();
