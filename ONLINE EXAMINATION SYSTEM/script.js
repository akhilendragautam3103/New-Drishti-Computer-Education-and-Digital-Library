/* =========================================================
   ONLINE EXAMINATION SYSTEM
   SCRIPT.JS
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

// IMPORTANT:
// If HTML is served directly from Google Apps Script,
// google.script.run is automatically available.
//
// If you host frontend separately, set your deployed
// Apps Script Web App URL below.

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbz6rMJ4FQG-nXkWSzAuFHZ9uwjuZB3IquwrAGQOpc97GXRLM8E-AHLsitwHUbApRfRdig/exec";



/* =========================================================
   GLOBAL STATE
========================================================= */

let APP = {

    settings: {},

    candidate: null,
    admin: null,

    batches: [],
    folders: [],
    exams: [],
    questions: [],
    candidates: [],
    results: [],

    selectedExam: null,

    examQuestions: [],
    currentQuestionIndex: 0,

    answers: {},
    markedForReview: {},

    examStartTime: null,
    remainingSeconds: 0,
    timerInterval: null,

    attemptId: null,
    submitting: false

};



/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", function(){

    document.getElementById("loginYear").textContent =
        new Date().getFullYear();

    bindPreviewEvents();

    loadPublicSettings();

});



function bindPreviewEvents(){

    const photoInput =
        document.getElementById("candidatePhotoUrl");

    if(photoInput){

        photoInput.addEventListener("input", function(){

            const img =
                document.getElementById("candidatePhotoPreview");

            if(this.value.trim()){

                img.src = this.value.trim();

            }else{

                img.removeAttribute("src");

            }

        });

    }

    const logoInput =
        document.getElementById("settingLogoUrl");

    if(logoInput){

        logoInput.addEventListener("input", function(){

            document.getElementById("settingLogoPreview").src =
                this.value.trim();

        });

    }

}



/* =========================================================
   GOOGLE APPS SCRIPT CALL WRAPPER
========================================================= */

function gas(functionName, ...args){

    return new Promise((resolve, reject) => {

        if(typeof google !== "undefined" &&
           google.script &&
           google.script.run){

            let runner =
                google.script.run
                    .withSuccessHandler(resolve)
                    .withFailureHandler(reject);

            runner[functionName](...args);

            return;
        }


        if(GAS_API_URL){

            fetch(GAS_API_URL, {

                method:"POST",

                headers:{
                    "Content-Type":"text/plain;charset=utf-8"
                },

                body:JSON.stringify({
                    action:functionName,
                    args:args
                })

            })
            .then(r => r.json())
            .then(resolve)
            .catch(reject);

            return;
        }


        reject(
            new Error(
                "Google Apps Script connection is not configured."
            )
        );

    });

}



/* =========================================================
   PUBLIC SETTINGS
========================================================= */

async function loadPublicSettings(){

    try{

        const data =
            await gas("getPublicSettings");

        APP.settings = data || {};

        applySettings();

    }catch(error){

        console.error(error);

    }finally{

        hideLoading();

    }

}



function applySettings(){

    const centerName =
        APP.settings.centerName ||
        "ONLINE EXAMINATION SYSTEM";

    const logoUrl =
        APP.settings.logoUrl || "";

    document.getElementById("centerName").textContent =
        centerName;

    document.getElementById("loginLogo").src =
        logoUrl;

    if(logoUrl){

        document.getElementById("loginLogo").style.display =
            "block";

        document.querySelector(".default-logo").style.display =
            "none";

    }

}



/* =========================================================
   LOGIN TYPE
========================================================= */

function showLoginType(type){

    const tabs =
        document.querySelectorAll(".login-tab");

    tabs.forEach(tab =>
        tab.classList.remove("active")
    );


    if(type === "candidate"){

        tabs[0].classList.add("active");

        document.getElementById("candidateLoginBox")
            .classList.remove("hidden");

        document.getElementById("adminLoginBox")
            .classList.add("hidden");

    }else{

        tabs[1].classList.add("active");

        document.getElementById("candidateLoginBox")
            .classList.add("hidden");

        document.getElementById("adminLoginBox")
            .classList.remove("hidden");

    }

}



/* =========================================================
   CANDIDATE LOGIN
========================================================= */

async function candidateLogin(){

    const regNo =
        document.getElementById("candidateRegNo")
            .value.trim();

    const dob =
        document.getElementById("candidateDOB")
            .value;


    if(!regNo){

        showToast(
            "Please enter Registration Number.",
            "error"
        );

        return;

    }


    if(!dob){

        showToast(
            "Please enter Date of Birth.",
            "error"
        );

        return;

    }


    showLoading();


    try{

        const candidate =
            await gas(
                "candidateLogin",
                regNo,
                dob
            );


        if(!candidate ||
           candidate.success === false){

            throw new Error(
                candidate?.message ||
                "Invalid Registration Number or DOB."
            );

        }


        APP.candidate =
            candidate.candidate || candidate;

        APP.candidate.exams =
            candidate.exams || [];


        showCandidateHome();


    }catch(error){

        showToast(
            error.message ||
            "Candidate login failed.",
            "error"
        );

    }finally{

        hideLoading();

    }

}



/* =========================================================
   CANDIDATE HOME
========================================================= */

function showCandidateHome(){

    showPage("candidateHomePage");


    const c = APP.candidate;


    document.getElementById("candidateHeaderName")
        .textContent = c.name || "";


    document.getElementById("candidateWelcomeName")
        .textContent = c.name || "";


    document.getElementById("candidateWelcomeReg")
        .textContent = c.registrationNo || "";


    const photo =
        c.photoUrl ||
        placeholderPhoto();


    document.getElementById("candidateHomePhoto")
        .src = photo;


    renderCandidateExams();

}



function renderCandidateExams(){

    const container =
        document.getElementById("candidateExamList");


    const exams =
        APP.candidate.exams || [];


    if(!exams.length){

        container.innerHTML = `
            <div class="empty-state">
                No examination has been assigned to your registration number.
            </div>
        `;

        return;

    }


    container.innerHTML =
        exams.map(exam => {

            const disabled =
                String(exam.status || "")
                    .toLowerCase() !== "active";


            return `

                <div class="exam-card">

                    <div class="exam-card-icon">
                        <i class="fa-solid fa-file-lines"></i>
                    </div>

                    <h3>${escapeHtml(exam.examName)}</h3>

                    <p>
                        ${escapeHtml(
                            exam.folderName || "Online Examination"
                        )}
                    </p>

                    <div class="exam-card-meta">

                        <span>
                            <i class="fa-solid fa-clock"></i>
                            ${exam.duration} Min
                        </span>

                        <span>
                            <i class="fa-solid fa-list"></i>
                            ${exam.totalQuestions} Questions
                        </span>

                    </div>

                    <button
                        class="primary-btn full-btn"
                        ${disabled ? "disabled" : ""}
                        onclick="selectExam('${escapeJs(exam.examId)}')">

                        <i class="fa-solid fa-arrow-right"></i>

                        ${disabled ? "Exam Inactive" : "View Exam"}

                    </button>

                </div>

            `;

        }).join("");

}



/* =========================================================
   SELECT EXAM
========================================================= */

async function selectExam(examId){

    const exam =
        (APP.candidate.exams || [])
        .find(e =>
            String(e.examId) === String(examId)
        );


    if(!exam){

        showToast(
            "Exam not found.",
            "error"
        );

        return;

    }


    APP.selectedExam = exam;


    showLoading();


    try{

        const details =
            await gas(
                "getCandidateExamDetails",
                APP.candidate.registrationNo,
                examId
            );


        if(details?.exam){

            APP.selectedExam =
                details.exam;

        }


        showInstructionPage();

    }catch(error){

        showToast(
            error.message ||
            "Unable to load examination.",
            "error"
        );

    }finally{

        hideLoading();

    }

}



/* =========================================================
   INSTRUCTIONS
========================================================= */

function showInstructionPage(){

    const exam =
        APP.selectedExam;

    const c =
        APP.candidate;


    showPage("instructionPage");


    document.getElementById("instructionExamName")
        .textContent =
        exam.examName || "";


    document.getElementById("instructionExamType")
        .textContent =
        exam.folderName || "";


    document.getElementById("instructionDuration")
        .textContent =
        `${exam.duration || 0} Minutes`;


    document.getElementById("instructionQuestionCount")
        .textContent =
        `${exam.totalQuestions || 0} Questions`;


    document.getElementById("instructionCandidateName")
        .textContent =
        c.name || "";


    document.getElementById("instructionCandidateReg")
        .textContent =
        c.registrationNo || "";


    document.getElementById("instructionCandidatePhoto")
        .src =
        c.photoUrl || placeholderPhoto();


    document.getElementById("instructionContent")
        .textContent =
        exam.instructions ||
        defaultInstructions();


    document.getElementById("instructionAgree")
        .checked = false;

}



function defaultInstructions(){

    return `
1. Read all questions carefully before answering.

2. Select the most appropriate answer.

3. You can move between questions using Previous and Next.

4. You may reset your selected answer.

5. You may mark questions for review.

6. The examination will be automatically submitted when the timer reaches zero.

7. Do not refresh or close the examination window during the examination.

8. After submission, the result will not be displayed to the candidate.

9. Contact the examination authority for any technical problem.

10. Once submitted, an examination cannot normally be restarted.
    `.trim();

}



/* =========================================================
   START EXAM
========================================================= */

async function startExam(){

    const agree =
        document.getElementById("instructionAgree")
            .checked;


    if(!agree){

        showToast(
            "Please accept the examination instructions first.",
            "error"
        );

        return;

    }


    if(!APP.selectedExam){

        showToast(
            "No examination selected.",
            "error"
        );

        return;

    }


    showLoading();


    try{

        const response =
            await gas(
                "startExamAttempt",
                APP.candidate.registrationNo,
                APP.selectedExam.examId
            );


        if(response?.success === false){

            throw new Error(
                response.message ||
                "Unable to start examination."
            );

        }


        APP.attemptId =
            response.attemptId ||
            response.attempt?.attemptId;


        APP.examQuestions =
            response.questions ||
            [];


        if(!APP.examQuestions.length){

            throw new Error(
                "No questions are available for this examination."
            );

        }


        APP.answers = {};
        APP.markedForReview = {};
        APP.currentQuestionIndex = 0;
        APP.submitting = false;


        APP.remainingSeconds =
            Number(
                response.remainingSeconds ||
                ((APP.selectedExam.duration || 60) * 60)
            );


        APP.examStartTime =
            new Date();


        setupExamInterface();

        showPage("examPage");

        startTimer();

        renderQuestion();

    }catch(error){

        showToast(
            error.message ||
            "Unable to start exam.",
            "error"
        );

    }finally{

        hideLoading();

    }

}



/* =========================================================
   EXAM INTERFACE
========================================================= */

function setupExamInterface(){

    const c =
        APP.candidate;

    const exam =
        APP.selectedExam;


    document.getElementById("examCandidatePhoto")
        .src =
        c.photoUrl || placeholderPhoto();


    document.getElementById("examCandidateName")
        .textContent =
        c.name || "";


    document.getElementById("examCandidateReg")
        .textContent =
        c.registrationNo || "";


    document.getElementById("liveExamName")
        .textContent =
        exam.examName || "";


    document.getElementById("liveExamType")
        .textContent =
        exam.folderName || "";


    document.getElementById("examCenterLogo")
        .src =
        APP.settings.logoUrl || "";


    document.getElementById("totalQuestionNo")
        .textContent =
        APP.examQuestions.length;


    renderPalette();

}



/* =========================================================
   TIMER
========================================================= */

function startTimer(){

    clearInterval(APP.timerInterval);

    updateTimer();


    APP.timerInterval =
        setInterval(() => {

            APP.remainingSeconds--;

            updateTimer();


            if(APP.remainingSeconds <= 0){

                clearInterval(APP.timerInterval);

                autoSubmitExam();

            }

        },1000);

}



function updateTimer(){

    const seconds =
        Math.max(0, APP.remainingSeconds);


    const h =
        Math.floor(seconds / 3600);

    const m =
        Math.floor((seconds % 3600) / 60);

    const s =
        seconds % 60;


    const formatted =
        [
            h,
            m,
            s
        ]
        .map(x =>
            String(x).padStart(2,"0")
        )
        .join(":");


    document.getElementById("examTimer")
        .textContent =
        formatted;


    const box =
        document.getElementById("timerBox");


    box.classList.remove(
        "timer-warning",
        "timer-danger"
    );


    if(seconds <= 300){

        box.classList.add("timer-danger");

    }else if(seconds <= 900){

        box.classList.add("timer-warning");

    }

}



/* =========================================================
   RENDER QUESTION
========================================================= */

function renderQuestion(){

    if(!APP.examQuestions.length){
        return;
    }


    const index =
        APP.currentQuestionIndex;

    const q =
        APP.examQuestions[index];


    document.getElementById("currentQuestionNo")
        .textContent =
        index + 1;


    document.getElementById("questionText")
        .textContent =
        q.questionText || "";


    const imageContainer =
        document.getElementById("questionImageContainer");

    const image =
        document.getElementById("questionImage");


    if(q.imageUrl){

        image.src = q.imageUrl;

        imageContainer.classList.remove("hidden");

    }else{

        image.removeAttribute("src");

        imageContainer.classList.add("hidden");

    }


    const selected =
        APP.answers[q.questionId] || "";


    const options =
        ["A","B","C","D"];


    document.getElementById("optionsContainer")
        .innerHTML =
        options.map(letter => {

            const text =
                q["option" + letter] || "";


            return `

                <label class="option
                    ${selected === letter ? "selected" : ""}">

                    <input
                        type="radio"
                        name="questionOption"
                        value="${letter}"
                        ${selected === letter ? "checked" : ""}
                        onchange="selectAnswer('${escapeJs(letter)}')">

                    <span class="option-letter">
                        ${letter}.
                    </span>

                    <span>
                        ${escapeHtml(text)}
                    </span>

                </label>

            `;

        }).join("");


    const status =
        document.getElementById("questionStatusText");


    if(APP.markedForReview[q.questionId]){

        status.textContent =
            "Marked for Review";

    }else if(selected){

        status.textContent =
            "Answered";

    }else{

        status.textContent =
            "Not Answered";

    }


    renderPalette();

}



/* =========================================================
   SELECT ANSWER
========================================================= */

function selectAnswer(letter){

    const q =
        APP.examQuestions[
            APP.currentQuestionIndex
        ];


    if(!q){
        return;
    }


    APP.answers[q.questionId] =
        letter;


    renderQuestion();

}



/* =========================================================
   RESET ANSWER
========================================================= */

function resetAnswer(){

    const q =
        APP.examQuestions[
            APP.currentQuestionIndex
        ];


    if(!q){
        return;
    }


    delete APP.answers[q.questionId];

    renderQuestion();

}



/* =========================================================
   MARK REVIEW
========================================================= */

function markForReview(){

    const q =
        APP.examQuestions[
            APP.currentQuestionIndex
        ];


    if(!q){
        return;
    }


    APP.markedForReview[q.questionId] =
        !APP.markedForReview[q.questionId];


    renderQuestion();

}



/* =========================================================
   NAVIGATION
========================================================= */

function nextQuestion(){

    if(APP.currentQuestionIndex <
       APP.examQuestions.length - 1){

        APP.currentQuestionIndex++;

        renderQuestion();

    }

}



function previousQuestion(){

    if(APP.currentQuestionIndex > 0){

        APP.currentQuestionIndex--;

        renderQuestion();

    }

}



function goToQuestion(index){

    if(index < 0 ||
       index >= APP.examQuestions.length){

        return;

    }


    APP.currentQuestionIndex =
        index;

    renderQuestion();

}



/* =========================================================
   QUESTION PALETTE
========================================================= */

function renderPalette(){

    const container =
        document.getElementById("questionPalette");


    if(!container){
        return;
    }


    container.innerHTML =
        APP.examQuestions
            .map((q,index) => {

                const answered =
                    !!APP.answers[q.questionId];

                const review =
                    !!APP.markedForReview[q.questionId];

                const current =
                    index === APP.currentQuestionIndex;


                let classes =
                    "palette-number";

                if(answered)
                    classes += " answered";

                if(review)
                    classes += " review";

                if(current)
                    classes += " current";


                return `

                    <button
                        class="${classes}"
                        onclick="goToQuestion(${index})">

                        ${index + 1}

                    </button>

                `;

            })
            .join("");


    updatePaletteCounts();

}



function updatePaletteCounts(){

    const total =
        APP.examQuestions.length;


    const answered =
        APP.examQuestions.filter(
            q => !!APP.answers[q.questionId]
        ).length;


    const review =
        APP.examQuestions.filter(
            q => !!APP.markedForReview[q.questionId]
        ).length;


    const unanswered =
        total - answered;


    document.getElementById("answeredCount")
        .textContent =
        answered;


    document.getElementById("unansweredCount")
        .textContent =
        unanswered;


    document.getElementById("reviewCount")
        .textContent =
        review;

}



/* =========================================================
   SUBMIT EXAM
========================================================= */

function confirmSubmitExam(){

    const total =
        APP.examQuestions.length;


    const answered =
        Object.keys(APP.answers).length;


    openConfirm(
        "Submit Examination",
        `You have answered ${answered} out of ${total} questions. Are you sure you want to submit the examination?`,
        submitExam
    );

}



async function autoSubmitExam(){

    showToast(
        "Time is over. Your examination is being submitted automatically.",
        "error"
    );


    await submitExam(true);

}



async function submitExam(isAutoSubmit=false){

    if(APP.submitting){
        return;
    }


    APP.submitting = true;


    clearInterval(APP.timerInterval);


    showLoading();


    try{

        const payload = {

            attemptId:
                APP.attemptId,

            registrationNo:
                APP.candidate.registrationNo,

            examId:
                APP.selectedExam.examId,

            answers:
                APP.answers,

            markedForReview:
                APP.markedForReview,

            autoSubmit:
                !!isAutoSubmit

        };


        const response =
            await gas(
                "submitExam",
                payload
            );


        if(response?.success === false){

            throw new Error(
                response.message ||
                "Exam submission failed."
            );

        }


        showSubmittedPage();

    }catch(error){

        APP.submitting = false;

        showToast(
            error.message ||
            "Unable to submit examination.",
            "error"
        );

        startTimer();

    }finally{

        hideLoading();

    }

}



/* =========================================================
   SUBMITTED PAGE
========================================================= */

function showSubmittedPage(){

    showPage("submittedPage");


    document.getElementById("submittedCandidateName")
        .textContent =
        APP.candidate?.name || "";


    document.getElementById("submittedCandidateReg")
        .textContent =
        APP.candidate?.registrationNo || "";


    document.getElementById("submittedExamName")
        .textContent =
        APP.selectedExam?.examName || "";

}



/* =========================================================
   ADMIN LOGIN
========================================================= */

async function adminLogin(){

    const username =
        document.getElementById("adminUsername")
            .value.trim();

    const password =
        document.getElementById("adminPassword")
            .value;


    if(!username || !password){

        showToast(
            "Enter Admin User ID and Password.",
            "error"
        );

        return;

    }


    showLoading();


    try{

        const response =
            await gas(
                "adminLogin",
                username,
                password
            );


        if(response?.success === false){

            throw new Error(
                response.message ||
                "Invalid admin credentials."
            );

        }


        APP.admin =
            response.admin || response;


        document.getElementById("adminHeaderName")
            .textContent =
            APP.admin.name ||
            APP.admin.username ||
            "Administrator";


        showPage("adminPage");

        await loadAdminDashboard();

    }catch(error){

        showToast(
            error.message ||
            "Admin login failed.",
            "error"
        );

    }finally{

        hideLoading();

    }

}



/* =========================================================
   ADMIN DASHBOARD
========================================================= */

async function loadAdminDashboard(){

    try{

        const data =
            await gas("getAdminDashboardData");


        APP.batches =
            data.batches || [];

        APP.folders =
            data.folders || [];

        APP.exams =
            data.exams || [];

        APP.questions =
            data.questions || [];

        APP.candidates =
            data.candidates || [];

        APP.results =
            data.results || [];


        document.getElementById("statBatches")
            .textContent =
            APP.batches.length;


        document.getElementById("statFolders")
            .textContent =
            APP.folders.length;


        document.getElementById("statExams")
            .textContent =
            APP.exams.length;


        document.getElementById("statQuestions")
            .textContent =
            APP.questions.length;


        document.getElementById("statCandidates")
            .textContent =
            APP.candidates.length;


        document.getElementById("statResults")
            .textContent =
            APP.results.length;


        renderBatchTable();
        renderFolderTable();
        renderExamFilters();
        loadExamTable();
        renderQuestionFilters();
        loadQuestionTable();
        renderCandidateFilters();
        loadCandidateTable();
        renderResultFilters();
        loadResultTable();
        renderSettings();

    }catch(error){

        showToast(
            error.message ||
            "Unable to load admin dashboard.",
            "error"
        );

    }

}



/* =========================================================
   ADMIN SECTIONS
========================================================= */

function showAdminSection(sectionId){

    document.querySelectorAll(".admin-section")
        .forEach(section =>
            section.classList.remove("active")
        );


    const section =
        document.getElementById(sectionId);


    if(section){

        section.classList.add("active");

    }


    document.querySelectorAll(".admin-nav")
        .forEach(button => {

            button.classList.remove("active");

            if(button.dataset.section === sectionId){

                button.classList.add("active");

            }

        });


    document.getElementById("adminSidebar")
        ?.classList.remove("open");

}



/* =========================================================
   BATCH
========================================================= */

function openBatchModal(batch=null){

    document.getElementById("batchModalTitle")
        .textContent =
        batch ? "Edit Batch" : "Add Batch";


    document.getElementById("batchId")
        .value =
        batch?.batchId || "";


    document.getElementById("batchName")
        .value =
        batch?.batchName || "";


    document.getElementById("batchSession")
        .value =
        batch?.session || "";


    document.getElementById("batchStatus")
        .value =
        batch?.status || "Active";


    openModal("batchModal");

}



async function saveBatch(event){

    event.preventDefault();


    const data = {

        batchId:
            document.getElementById("batchId").value,

        batchName:
            document.getElementById("batchName").value.trim(),

        session:
            document.getElementById("batchSession").value.trim(),

        status:
            document.getElementById("batchStatus").value

    };


    showLoading();


    try{

        const response =
            await gas("saveBatch", data);


        if(response?.success === false){

            throw new Error(response.message);

        }


        closeModal("batchModal");

        showToast(
            "Batch saved successfully.",
            "success"
        );


        await loadAdminDashboard();

    }catch(error){

        showToast(
            error.message ||
            "Unable to save batch.",
            "error"
        );

    }finally{

        hideLoading();

    }

}



function renderBatchTable(){

    const tbody =
        document.getElementById("batchTableBody");


    tbody.innerHTML =
        APP.batches.map(batch => `

            <tr>

                <td>${escapeHtml(batch.batchId)}</td>

                <td>${escapeHtml(batch.batchName)}</td>

                <td>${escapeHtml(batch.session || "")}</td>

                <td>
                    ${statusBadge(batch.status)}
                </td>

                <td>

                    <div class="action-buttons">

                        <button class="small-btn edit-btn"
                            onclick='editBatch(${safeJson(batch)})'>

                            <i class="fa-solid fa-pen"></i>

                        </button>

                        <button class="small-btn delete-btn"
                            onclick="deleteBatch('${escapeJs(batch.batchId)}')">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `).join("");

}



function editBatch(batch){

    openBatchModal(batch);

}



async function deleteBatch(batchId){

    openConfirm(
        "Delete Batch",
        "Are you sure you want to delete this batch?",
        async function(){

            try{

                showLoading();

                const response =
                    await gas(
                        "deleteBatch",
                        batchId
                    );


                if(response?.success === false){

                    throw new Error(response.message);

                }


                showToast(
                    "Batch deleted.",
                    "success"
                );


                await loadAdminDashboard();

            }catch(error){

                showToast(
                    error.message ||
                    "Unable to delete batch.",
                    "error"
                );

            }finally{

                hideLoading();

            }

        }
    );

}



/* =========================================================
   FOLDER
========================================================= */

function openFolderModal(folder=null){

    document.getElementById("folderModalTitle")
        .textContent =
        folder ? "Edit Exam Folder" : "Add Exam Folder";


    document.getElementById("folderId")
        .value =
        folder?.folderId || "";


    document.getElementById("folderName")
        .value =
        folder?.folderName || "";


    document.getElementById("folderDescription")
        .value =
        folder?.description || "";


    document.getElementById("folderStatus")
        .value =
        folder?.status || "Active";


    openModal("folderModal");

}



async function saveFolder(event){

    event.preventDefault();


    const data = {

        folderId:
            document.getElementById("folderId").value,

        folderName:
            document.getElementById("folderName").value.trim(),

        description:
            document.getElementById("folderDescription").value.trim(),

        status:
            document.getElementById("folderStatus").value

    };


    showLoading();


    try{

        const response =
            await gas("saveExamFolder", data);


        if(response?.success === false){

            throw new Error(response.message);

        }


        closeModal("folderModal");

        showToast(
            "Exam folder saved successfully.",
            "success"
        );


        await loadAdminDashboard();

    }catch(error){

        showToast(
            error.message ||
            "Unable to save folder.",
            "error"
        );

    }finally{

        hideLoading();

    }

}



function renderFolderTable(){

    const tbody =
        document.getElementById("folderTableBody");


    tbody.innerHTML =
        APP.folders.map(folder => `

            <tr>

                <td>${escapeHtml(folder.folderId)}</td>

                <td>
                    <strong>
                        ${escapeHtml(folder.folderName)}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(folder.description || "")}
                </td>

                <td>
                    ${
                        folder.driveFolderUrl
                        ?
                        `<a href="${escapeAttribute(folder.driveFolderUrl)}"
                            target="_blank">
                            Open Folder
                         </a>`
                        :
                        "-"
                    }
                </td>

                <td>
                    ${statusBadge(folder.status)}
                </td>

                <td>

                    <div class="action-buttons">

                        <button class="small-btn edit-btn"
                            onclick='editFolder(${safeJson(folder)})'>

                            <i class="fa-solid fa-pen"></i>

                        </button>

                        <button class="small-btn delete-btn"
                            onclick="deleteFolder('${escapeJs(folder.folderId)}')">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `).join("");

}



function editFolder(folder){

    openFolderModal(folder);

}



async function deleteFolder(folderId){

    openConfirm(
        "Delete Exam Folder",
        "Are you sure you want to delete this folder? Existing exams may be affected.",
        async function(){

            try{

                showLoading();

                const response =
                    await gas(
                        "deleteExamFolder",
                        folderId
                    );


                if(response?.success === false){

                    throw new Error(response.message);

                }


                showToast(
                    "Exam folder deleted.",
                    "success"
                );


                await loadAdminDashboard();

            }catch(error){

                showToast(
                    error.message ||
                    "Unable to delete folder.",
                    "error"
                );

            }finally{

                hideLoading();

            }

        }
    );

}



/* =========================================================
   EXAM
========================================================= */

function openExamModal(exam=null){

    populateFolderSelect(
        "examFolder",
        true
    );


    document.getElementById("examModalTitle")
        .textContent =
        exam ? "Edit Exam" : "Add Exam";


    document.getElementById("examId")
        .value =
        exam?.examId || "";


    document.getElementById("examFolder")
        .value =
        exam?.folderId || "";


    document.getElementById("examName")
        .value =
        exam?.examName || "";


    document.getElementById("examDuration")
        .value =
        exam?.duration || 60;


    document.getElementById("examTotalQuestions")
        .value =
        exam?.totalQuestions || 50;


    document.getElementById("examMarksPerQuestion")
        .value =
        exam?.marksPerQuestion ?? 1;


    document.getElementById("examNegativeMarks")
        .value =
        exam?.negativeMarks ?? 0;


    document.getElementById("examPassingMarks")
        .value =
        exam?.passingMarks ?? 40;


    document.getElementById("examStatus")
        .value =
        exam?.status || "Active";


    document.getElementById("examInstructions")
        .value =
        exam?.instructions || defaultInstructions();


    openModal("examModal");

}



async function saveExam(event){

    event.preventDefault();


    const data = {

        examId:
            document.getElementById("examId").value,

        folderId:
            document.getElementById("examFolder").value,

        examName:
            document.getElementById("examName").value.trim(),

        duration:
            Number(
                document.getElementById("examDuration").value
            ),

        totalQuestions:
            Number(
                document.getElementById("examTotalQuestions").value
            ),

        marksPerQuestion:
            Number(
                document.getElementById("examMarksPerQuestion").value
            ),

        negativeMarks:
            Number(
                document.getElementById("examNegativeMarks").value
            ),

        passingMarks:
            Number(
                document.getElementById("examPassingMarks").value
            ),

        instructions:
            document.getElementById("examInstructions").value,

        status:
            document.getElementById("examStatus").value

    };


    showLoading();


    try{

        const response =
            await gas("saveExam", data);


        if(response?.success === false){

            throw new Error(response.message);

        }


        closeModal("examModal");

        showToast(
            "Exam saved successfully.",
            "success"
        );


        await loadAdminDashboard();

    }catch(error){

        showToast(
            error.message ||
            "Unable to save exam.",
            "error"
        );

    }finally{

        hideLoading();

    }

}



function renderExamFilters(){

    populateFolderSelect(
        "examFolderFilter",
        false
    );

    populateExamSelect(
        "questionExamFilter",
        true
    );

    populateExamSelect(
        "questionExam",
        true
    );

    populateExamSelect(
        "candidateExam",
        false
    );

    populateExamSelect(
        "resultExamFilter",
        false
    );

}



function loadExamTable(){

    const folder =
        document.getElementById("examFolderFilter")
            ?.value || "";


    const status =
        document.getElementById("examStatusFilter")
            ?.value || "";


    const exams =
        APP.exams.filter(exam => {

            return (!folder ||
                    String(exam.folderId) === String(folder))
                &&
                   (!status ||
                    String(exam.status) === String(status));

        });


    const tbody =
        document.getElementById("examTableBody");


    tbody.innerHTML =
        exams.map(exam => `

            <tr>

                <td>${escapeHtml(exam.examId)}</td>

                <td>
                    <strong>
                        ${escapeHtml(exam.examName)}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(exam.folderName || "")}
                </td>

                <td>${exam.duration} Min</td>

                <td>${exam.totalQuestions}</td>

                <td>${exam.marksPerQuestion}</td>

                <td>
                    ${statusBadge(exam.status)}
                </td>

                <td>

                    <div class="action-buttons">

                        <button class="small-btn edit-btn"
                            onclick='editExam(${safeJson(exam)})'>

                            <i class="fa-solid fa-pen"></i>

                        </button>

                        <button class="small-btn delete-btn"
                            onclick="deleteExam('${escapeJs(exam.examId)}')">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `).join("");

}



function editExam(exam){

    openExamModal(exam);

}



async function deleteExam(examId){

    openConfirm(
        "Delete Examination",
        "Delete this examination? Questions associated with this exam may also be affected.",
        async function(){

            try{

                showLoading();

                const response =
                    await gas(
                        "deleteExam",
                        examId
                    );


                if(response?.success === false){

                    throw new Error(response.message);

                }


                showToast(
                    "Exam deleted.",
                    "success"
                );


                await loadAdminDashboard();

            }catch(error){

                showToast(
                    error.message ||
                    "Unable to delete exam.",
                    "error"
                );

            }finally{

                hideLoading();

            }

        }
    );

}



/* =========================================================
   QUESTION
========================================================= */

function openQuestionModal(question=null){

    populateExamSelect(
        "questionExam",
        true
    );


    document.getElementById("questionModalTitle")
        .textContent =
        question ? "Edit Question" : "Add Question";


    document.getElementById("questionId")
        .value =
        question?.questionId || "";


    document.getElementById("questionExam")
        .value =
        question?.examId || "";


    document.getElementById("questionNumber")
        .value =
        question?.questionNumber || "";


    document.getElementById("questionTextInput")
        .value =
        question?.questionText || "";


    document.getElementById("questionImageUrl")
        .value =
        question?.imageUrl || "";


    document.getElementById("optionA")
        .value =
        question?.optionA || "";


    document.getElementById("optionB")
        .value =
        question?.optionB || "";


    document.getElementById("optionC")
        .value =
        question?.optionC || "";


    document.getElementById("optionD")
        .value =
        question?.optionD || "";


    document.getElementById("correctAnswer")
        .value =
        question?.correctAnswer || "";


    document.getElementById("questionMarks")
        .value =
        question?.marks ?? 1;


    document.getElementById("questionNegativeMarks")
        .value =
        question?.negativeMarks ?? 0;


    document.getElementById("questionExplanation")
        .value =
        question?.explanation || "";


    openModal("questionModal");

}



async function saveQuestion(event){

    event.preventDefault();


    const data = {

        questionId:
            document.getElementById("questionId").value,

        examId:
            document.getElementById("questionExam").value,

        questionNumber:
            Number(
                document.getElementById("questionNumber").value
            ),

        questionText:
            document.getElementById("questionTextInput").value,

        imageUrl:
            document.getElementById("questionImageUrl").value.trim(),

        optionA:
            document.getElementById("optionA").value,

        optionB:
            document.getElementById("optionB").value,

        optionC:
            document.getElementById("optionC").value,

        optionD:
            document.getElementById("optionD").value,

        correctAnswer:
            document.getElementById("correctAnswer").value,

        marks:
            Number(
                document.getElementById("questionMarks").value
            ),

        negativeMarks:
            Number(
                document.getElementById("questionNegativeMarks").value
            ),

        explanation:
            document.getElementById("questionExplanation").value

    };


    showLoading();


    try{

        const response =
            await gas(
                "saveQuestion",
                data
            );


        if(response?.success === false){

            throw new Error(response.message);

        }


        closeModal("questionModal");

        showToast(
            "Question saved successfully.",
            "success"
        );


        await loadAdminDashboard();

    }catch(error){

        showToast(
            error.message ||
            "Unable to save question.",
            "error"
        );

    }finally{

        hideLoading();

    }

}



function renderQuestionFilters(){

    populateExamSelect(
        "questionExamFilter",
        true
    );

}



function loadQuestionTable(){

    const examId =
        document.getElementById("questionExamFilter")
            ?.value || "";


    const search =
        (
            document.getElementById("questionSearch")
                ?.value || ""
        ).toLowerCase();


    let questions =
        APP.questions;


    if(examId){

        questions =
            questions.filter(q =>
                String(q.examId) === String(examId)
            );

    }


    if(search){

        questions =
            questions.filter(q =>
                String(q.questionText || "")
                    .toLowerCase()
                    .includes(search)
            );

    }


    const tbody =
        document.getElementById("questionTableBody");


    tbody.innerHTML =
        questions.map(q => `

            <tr>

                <td>${q.questionNumber}</td>

                <td>
                    ${escapeHtml(
                        truncate(q.questionText,100)
                    )}
                </td>

                <td>${escapeHtml(q.optionA)}</td>
                <td>${escapeHtml(q.optionB)}</td>
                <td>${escapeHtml(q.optionC)}</td>
                <td>${escapeHtml(q.optionD)}</td>

                <td>
                    <strong>
                        ${escapeHtml(q.correctAnswer)}
                    </strong>
                </td>

                <td>${q.marks}</td>

                <td>

                    <div class="action-buttons">

                        <button class="small-btn edit-btn"
                            onclick='editQuestion(${safeJson(q)})'>

                            <i class="fa-solid fa-pen"></i>

                        </button>

                        <button class="small-btn delete-btn"
                            onclick="deleteQuestion('${escapeJs(q.questionId)}')">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `).join("");

}



function editQuestion(question){

    openQuestionModal(question);

}



async function deleteQuestion(questionId){

    openConfirm(
        "Delete Question",
        "Are you sure you want to delete this question?",
        async function(){

            try{

                showLoading();

                const response =
                    await gas(
                        "deleteQuestion",
                        questionId
                    );


                if(response?.success === false){

                    throw new Error(response.message);

                }


                showToast(
                    "Question deleted.",
                    "success"
                );


                await loadAdminDashboard();

            }catch(error){

                showToast(
                    error.message ||
                    "Unable to delete question.",
                    "error"
                );

            }finally{

                hideLoading();

            }

        }
    );

}



/* =========================================================
   CANDIDATE
========================================================= */

function openCandidateModal(candidate=null){

    populateBatchSelect(
        "candidateBatch"
    );

    populateExamSelect(
        "candidateExam",
        false
    );


    document.getElementById("candidateModalTitle")
        .textContent =
        candidate ? "Edit Candidate" : "Add Candidate";


    document.getElementById("candidateId")
        .value =
        candidate?.candidateId || "";


    document.getElementById("candidateRegNumber")
        .value =
        candidate?.registrationNo || "";


    document.getElementById("candidateName")
        .value =
        candidate?.name || "";


    document.getElementById("candidateDobInput")
        .value =
        candidate?.dob || "";


    document.getElementById("candidateBatch")
        .value =
        candidate?.batchId || "";


    document.getElementById("candidateExam")
        .value =
        candidate?.examId || "";


    document.getElementById("candidateStatus")
        .value =
        candidate?.status || "Active";


    document.getElementById("candidatePhotoUrl")
        .value =
        candidate?.photoUrl || "";


    document.getElementById("candidatePhotoPreview")
        .src =
        candidate?.photoUrl || "";


    openModal("candidateModal");

}



async function saveCandidate(event){

    event.preventDefault();


    const data = {

        candidateId:
            document.getElementById("candidateId").value,

        registrationNo:
            document.getElementById("candidateRegNumber")
                .value.trim(),

        name:
            document.getElementById("candidateName")
                .value.trim(),

        dob:
            document.getElementById("candidateDobInput")
                .value,

        batchId:
            document.getElementById("candidateBatch")
                .value,

        examId:
            document.getElementById("candidateExam")
                .value,

        photoUrl:
            document.getElementById("candidatePhotoUrl")
                .value.trim(),

        status:
            document.getElementById("candidateStatus")
                .value

    };


    showLoading();


    try{

        const response =
            await gas(
                "saveCandidate",
                data
            );


        if(response?.success === false){

            throw new Error(response.message);

        }


        closeModal("candidateModal");

        showToast(
            "Candidate saved successfully.",
            "success"
        );


        await loadAdminDashboard();

    }catch(error){

        showToast(
            error.message ||
            "Unable to save candidate.",
            "error"
        );

    }finally{

        hideLoading();

    }

}



function renderCandidateFilters(){

    populateBatchSelect(
        "candidateBatchFilter",
        true
    );

}



function loadCandidateTable(){

    const search =
        (
            document.getElementById("candidateSearch")
                ?.value || ""
        ).toLowerCase();


    const batch =
        document.getElementById("candidateBatchFilter")
            ?.value || "";


    let candidates =
        APP.candidates;


    if(search){

        candidates =
            candidates.filter(c =>
                (
                    String(c.registrationNo || "") +
                    " " +
                    String(c.name || "")
                )
                .toLowerCase()
                .includes(search)
            );

    }


    if(batch){

        candidates =
            candidates.filter(c =>
                String(c.batchId) === String(batch)
            );

    }


    const tbody =
        document.getElementById("candidateTableBody");


    tbody.innerHTML =
        candidates.map(c => `

            <tr>

                <td>

                    <img
                        src="${escapeAttribute(
                            c.photoUrl || placeholderPhoto()
                        )}"
                        style="
                            width:45px;
                            height:50px;
                            object-fit:cover;
                            border-radius:5px;
                        ">

                </td>

                <td>
                    ${escapeHtml(c.registrationNo)}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(c.name)}
                    </strong>
                </td>

                <td>${escapeHtml(c.dob || "")}</td>

                <td>${escapeHtml(c.batchName || "")}</td>

                <td>${escapeHtml(c.examName || "All")}</td>

                <td>
                    ${statusBadge(c.status)}
                </td>

                <td>

                    <div class="action-buttons">

                        <button class="small-btn edit-btn"
                            onclick='editCandidate(${safeJson(c)})'>

                            <i class="fa-solid fa-pen"></i>

                        </button>

                        <button class="small-btn delete-btn"
                            onclick="deleteCandidate('${escapeJs(c.candidateId)}')">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `).join("");

}



function editCandidate(candidate){

    openCandidateModal(candidate);

}



async function deleteCandidate(candidateId){

    openConfirm(
        "Delete Candidate",
        "Are you sure you want to delete this candidate?",
        async function(){

            try{

                showLoading();

                const response =
                    await gas(
                        "deleteCandidate",
                        candidateId
                    );


                if(response?.success === false){

                    throw new Error(response.message);

                }


                showToast(
                    "Candidate deleted.",
                    "success"
                );


                await loadAdminDashboard();

            }catch(error){

                showToast(
                    error.message ||
                    "Unable to delete candidate.",
                    "error"
                );

            }finally{

                hideLoading();

            }

        }
    );

}



/* =========================================================
   RESULTS
========================================================= */

function renderResultFilters(){

    populateExamSelect(
        "resultExamFilter",
        false
    );

}



function loadResultTable(){

    const search =
        (
            document.getElementById("resultSearch")
                ?.value || ""
        ).toLowerCase();


    const examId =
        document.getElementById("resultExamFilter")
            ?.value || "";


    let results =
        APP.results;


    if(search){

        results =
            results.filter(r =>
                (
                    String(r.registrationNo || "") +
                    " " +
                    String(r.candidateName || "")
                )
                .toLowerCase()
                .includes(search)
            );

    }


    if(examId){

        results =
            results.filter(r =>
                String(r.examId) === String(examId)
            );

    }


    const tbody =
        document.getElementById("resultTableBody");


    tbody.innerHTML =
        results.map(r => `

            <tr>

                <td>
                    ${escapeHtml(r.registrationNo)}
                </td>

                <td>
                    ${escapeHtml(r.candidateName)}
                </td>

                <td>
                    ${escapeHtml(r.examName)}
                </td>

                <td>
                    ${r.totalMarks}
                </td>

                <td>
                    ${r.obtainedMarks}
                </td>

                <td>
                    ${Number(r.percentage || 0).toFixed(2)}%
                </td>

                <td>
                    ${resultBadge(r.status)}
                </td>

                <td>

                    <div class="action-buttons">

                        <button class="small-btn edit-btn"
                            onclick='editResult(${safeJson(r)})'>

                            <i class="fa-solid fa-pen"></i>

                        </button>

                        <button class="small-btn print-btn"
                            onclick="printResult('${escapeJs(r.resultId)}')">

                            <i class="fa-solid fa-print"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `).join("");

}



function editResult(result){

    document.getElementById("resultId")
        .value =
        result.resultId || "";


    document.getElementById("resultCandidateName")
        .value =
        result.candidateName || "";


    document.getElementById("resultExamName")
        .value =
        result.examName || "";


    document.getElementById("resultTotalMarks")
        .value =
        result.totalMarks || 0;


    document.getElementById("resultObtainedMarks")
        .value =
        result.obtainedMarks || 0;


    document.getElementById("resultStatus")
        .value =
        result.status || "PASS";


    openModal("resultModal");

}



async function saveResult(event){

    event.preventDefault();


    const data = {

        resultId:
            document.getElementById("resultId").value,

        obtainedMarks:
            Number(
                document.getElementById("resultObtainedMarks").value
            ),

        status:
            document.getElementById("resultStatus").value

    };


    showLoading();


    try{

        const response =
            await gas(
                "updateResult",
                data
            );


        if(response?.success === false){

            throw new Error(response.message);

        }


        closeModal("resultModal");

        showToast(
            "Result updated.",
            "success"
        );


        await loadAdminDashboard();

    }catch(error){

        showToast(
            error.message ||
            "Unable to update result.",
            "error"
        );

    }finally{

        hideLoading();

    }

}



async function printResult(resultId){

    showLoading();


    try{

        const response =
            await gas(
                "getResultForPrint",
                resultId
            );


        if(response?.success === false){

            throw new Error(response.message);

        }


        openResultPrintWindow(
            response.result
        );

    }catch(error){

        showToast(
            error.message ||
            "Unable to generate result.",
            "error"
        );

    }finally{

        hideLoading();

    }

}



function openResultPrintWindow(result){

    const logo =
        APP.settings.logoUrl || "";


    const html = `

        <!DOCTYPE html>

        <html>

        <head>

            <title>Result</title>

            <style>

                body{
                    font-family:Arial;
                    padding:30px;
                    color:#111827;
                }

                .header{
                    text-align:center;
                    border-bottom:2px solid #111827;
                    padding-bottom:15px;
                    margin-bottom:25px;
                }

                .header img{
                    width:80px;
                    height:80px;
                    object-fit:contain;
                }

                table{
                    width:100%;
                    border-collapse:collapse;
                    margin-top:20px;
                }

                td,th{
                    border:1px solid #ccc;
                    padding:10px;
                }

                th{
                    background:#f1f5f9;
                    text-align:left;
                }

                .status{
                    font-size:20px;
                    font-weight:bold;
                    text-align:center;
                    margin:25px;
                }

            </style>

        </head>

        <body>

            <div class="header">

                ${
                    logo
                    ?
                    `<img src="${escapeAttribute(logo)}">`
                    :
                    ""
                }

                <h1>
                    ${escapeHtml(
                        APP.settings.centerName ||
                        "ONLINE EXAMINATION SYSTEM"
                    )}
                </h1>

                <h2>EXAMINATION RESULT</h2>

            </div>


            <table>

                <tr>
                    <th>Registration Number</th>
                    <td>${escapeHtml(result.registrationNo)}</td>
                </tr>

                <tr>
                    <th>Candidate Name</th>
                    <td>${escapeHtml(result.candidateName)}</td>
                </tr>

                <tr>
                    <th>Examination</th>
                    <td>${escapeHtml(result.examName)}</td>
                </tr>

                <tr>
                    <th>Total Marks</th>
                    <td>${result.totalMarks}</td>
                </tr>

                <tr>
                    <th>Obtained Marks</th>
                    <td>${result.obtainedMarks}</td>
                </tr>

                <tr>
                    <th>Percentage</th>
                    <td>${Number(result.percentage || 0).toFixed(2)}%</td>
                </tr>

            </table>


            <div class="status">
                RESULT:
                ${escapeHtml(result.status)}
            </div>


            <script>
                window.onload=function(){
                    window.print();
                }
            <\/script>

        </body>

        </html>

    `;


    const win =
        window.open(
            "",
            "_blank"
        );


    if(!win){

        showToast(
            "Please allow popups for printing.",
            "error"
        );

        return;

    }


    win.document.write(html);

    win.document.close();

}



/* =========================================================
   SETTINGS
========================================================= */

function renderSettings(){

    document.getElementById("settingCenterName")
        .value =
        APP.settings.centerName || "";


    document.getElementById("settingLogoUrl")
        .value =
        APP.settings.logoUrl || "";


    document.getElementById("settingLogoPreview")
        .src =
        APP.settings.logoUrl || "";

}



async function saveSettings(){

    const data = {

        centerName:
            document.getElementById("settingCenterName")
                .value.trim(),

        logoUrl:
            document.getElementById("settingLogoUrl")
                .value.trim()

    };


    showLoading();


    try{

        const response =
            await gas(
                "saveSettings",
                data
            );


        if(response?.success === false){

            throw new Error(response.message);

        }


        APP.settings = {
            ...APP.settings,
            ...data
        };


        applySettings();


        showToast(
            "Settings saved successfully.",
            "success"
        );

    }catch(error){

        showToast(
            error.message ||
            "Unable to save settings.",
            "error"
        );

    }finally{

        hideLoading();

    }

}



/* =========================================================
   SELECT HELPERS
========================================================= */

function populateFolderSelect(
    elementId,
    includeBlank
){

    const select =
        document.getElementById(elementId);


    if(!select){
        return;
    }


    let html =
        includeBlank
        ?
        `<option value="">Select Folder</option>`
        :
        `<option value="">All Folders</option>`;


    html +=
        APP.folders.map(folder => `

            <option value="${escapeAttribute(folder.folderId)}">

                ${escapeHtml(folder.folderName)}

            </option>

        `).join("");


    select.innerHTML = html;

}



function populateExamSelect(
    elementId,
    includeBlank
){

    const select =
        document.getElementById(elementId);


    if(!select){
        return;
    }


    let html =
        includeBlank
        ?
        `<option value="">Select Exam</option>`
        :
        `<option value="">All Exams</option>`;


    html +=
        APP.exams.map(exam => `

            <option value="${escapeAttribute(exam.examId)}">

                ${escapeHtml(exam.examName)}

            </option>

        `).join("");


    select.innerHTML = html;

}



function populateBatchSelect(
    elementId,
    includeBlank=true
){

    const select =
        document.getElementById(elementId);


    if(!select){
        return;
    }


    let html =
        includeBlank
        ?
        `<option value="">Select Batch</option>`
        :
        `<option value="">All Batches</option>`;


    html +=
        APP.batches.map(batch => `

            <option value="${escapeAttribute(batch.batchId)}">

                ${escapeHtml(batch.batchName)}

            </option>

        `).join("");


    select.innerHTML = html;

}



/* =========================================================
   COMMON UI
========================================================= */

function showPage(pageId){

    document.querySelectorAll(".page")
        .forEach(page =>
            page.classList.remove("active")
        );


    const page =
        document.getElementById(pageId);


    if(page){

        page.classList.add("active");

    }

}



function showLoading(){

    const loader =
        document.getElementById("loadingScreen");

    if(loader){

        loader.style.display = "flex";

    }

}



function hideLoading(){

    const loader =
        document.getElementById("loadingScreen");

    if(loader){

        loader.style.display = "none";

    }

}



function openModal(id){

    document.getElementById(id)
        ?.classList.add("show");

}



function closeModal(id){

    document.getElementById(id)
        ?.classList.remove("show");

}



function togglePassword(id){

    const input =
        document.getElementById(id);


    if(input.type === "password"){

        input.type = "text";

    }else{

        input.type = "password";

    }

}



function toggleSidebar(){

    document.querySelector(".admin-sidebar")
        ?.classList.toggle("open");

}



function toggleAdminSidebar(){

    document.getElementById("adminSidebar")
        ?.classList.toggle("open");

}



/* =========================================================
   CONFIRM
========================================================= */

function openConfirm(
    title,
    message,
    callback
){

    document.getElementById("confirmTitle")
        .textContent =
        title;


    document.getElementById("confirmMessage")
        .textContent =
        message;


    const button =
        document.getElementById("confirmButton");


    button.onclick = function(){

        closeModal("confirmModal");

        callback();

    };


    openModal("confirmModal");

}



/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(
    message,
    type="success"
){

    const toast =
        document.getElementById("toast");


    const icon =
        document.getElementById("toastIcon");


    document.getElementById("toastMessage")
        .textContent =
        message;


    toast.className =
        `toast show ${type}`;


    icon.className =
        type === "error"
        ?
        "fa-solid fa-circle-exclamation"
        :
        "fa-solid fa-circle-check";


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        },3500);

}



/* =========================================================
   NAVIGATION
========================================================= */

function backToCandidateHome(){

    APP.selectedExam = null;

    showCandidateHome();

}



function logout(){

    clearInterval(APP.timerInterval);


    APP = {

        settings: APP.settings,

        candidate:null,
        admin:null,

        batches:[],
        folders:[],
        exams:[],
        questions:[],
        candidates:[],
        results:[],

        selectedExam:null,

        examQuestions:[],
        currentQuestionIndex:0,

        answers:{},
        markedForReview:{},

        examStartTime:null,
        remainingSeconds:0,
        timerInterval:null,

        attemptId:null,
        submitting:false

    };


    document.getElementById("candidateRegNo")
        .value = "";

    document.getElementById("candidateDOB")
        .value = "";

    document.getElementById("adminUsername")
        .value = "";

    document.getElementById("adminPassword")
        .value = "";


    showPage("loginPage");

}



/* =========================================================
   TABLE SEARCH
========================================================= */

function filterTable(
    tableId,
    search
){

    const table =
        document.getElementById(tableId);


    if(!table){
        return;
    }


    const value =
        search.toLowerCase();


    table.querySelectorAll("tbody tr")
        .forEach(row => {

            row.style.display =
                row.textContent
                    .toLowerCase()
                    .includes(value)
                ?
                ""
                :
                "none";

        });

}



/* =========================================================
   BADGES
========================================================= */

function statusBadge(status){

    const s =
        String(status || "")
            .toLowerCase();


    const cls =
        s === "active"
        ?
        "status-active"
        :
        "status-inactive";


    return `
        <span class="status-badge ${cls}">
            ${escapeHtml(status || "")}
        </span>
    `;

}



function resultBadge(status){

    const s =
        String(status || "")
            .toUpperCase();


    const cls =
        s === "PASS"
        ?
        "status-pass"
        :
        "status-fail";


    return `
        <span class="status-badge ${cls}">
            ${escapeHtml(s)}
        </span>
    `;

}



/* =========================================================
   UTILITY
========================================================= */

function placeholderPhoto(){

    return (
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="150"
                 height="180"
                 viewBox="0 0 150 180">

                <rect width="150"
                      height="180"
                      fill="#e2e8f0"/>

                <circle cx="75"
                        cy="60"
                        r="30"
                        fill="#94a3b8"/>

                <path d="
                    M25 160
                    C30 115 120 115 125 160
                    Z"
                    fill="#94a3b8"/>

            </svg>
        `)
    );

}



function truncate(
    text,
    length
){

    text =
        String(text || "");


    return text.length > length
        ?
        text.substring(0,length) + "..."
        :
        text;

}



function escapeHtml(value){

    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}



function escapeAttribute(value){

    return escapeHtml(value);

}



function escapeJs(value){

    return String(value ?? "")
        .replace(/\\/g,"\\\\")
        .replace(/'/g,"\\'")
        .replace(/\n/g,"\\n")
        .replace(/\r/g,"\\r");

}



function safeJson(object){

    return JSON.stringify(object)
        .replace(/'/g,"&#39;");

}