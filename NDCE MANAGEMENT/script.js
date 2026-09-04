/* =========================================================
   NEW DRISHTI COMPUTER EDUCATION
   SMART MANAGEMENT SYSTEM
   FRONTEND JAVASCRIPT
========================================================= */


/* =========================================================
   GOOGLE APPS SCRIPT URL
========================================================= */

const API_URL =
  "https://script.google.com/macros/s/AKfycbyBwjrSBXzxtT5f7p2xD9sAPke88MlKMCjvb3IleLO5Nb7o3ZUAbVNFoIatYdV5O9J2/exec";


/* =========================================================
   GLOBAL DATA
========================================================= */

let DATA = {

  students: [],
  staff: [],
  courses: [],
  batches: [],
  studentFees: [],
  staffFees: [],
  attendance: [],
  expenses: []

};


let TOKEN =
  sessionStorage.getItem("NDCE_SESSION") || "";


/* =========================================================
   API
========================================================= */

async function api(action, data = {}) {

  const payload = {

    action: action,

    token: TOKEN,

    ...data

  };


  try {

    const response =
      await fetch(
        API_URL,
        {
          method:"POST",
          body:JSON.stringify(payload)
        }
      );


    const result =
      await response.json();


    if (
      result.message &&
      result.message.includes("Session expired")
    ) {

      logout();

    }


    return result;


  } catch(error) {

    console.error(error);

    return {
      success:false,
      message:"Server connection error"
    };

  }

}


/* =========================================================
   LOGIN
========================================================= */

async function login() {

  const pin =
    getValue("loginPin").trim();


  if (!pin) {

    setText(
      "loginMessage",
      "Please enter PIN"
    );

    return;

  }


  try {

    const result =
      await api(
        "login",
        {pin:pin}
      );


    if (!result.success) {

      setText(
        "loginMessage",
        result.message
      );

      return;

    }


    TOKEN =
      result.token;


    sessionStorage.setItem(
      "NDCE_SESSION",
      TOKEN
    );


    document
      .getElementById("loginScreen")
      .classList.add("hidden");


    document
      .getElementById("app")
      .classList.remove("hidden");


    await loadData();


  } catch(error) {

    setText(
      "loginMessage",
      "Server connection error"
    );

  }

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

  TOKEN = "";

  sessionStorage.removeItem(
    "NDCE_SESSION"
  );


  document
    .getElementById("app")
    .classList.add("hidden");


  document
    .getElementById("loginScreen")
    .classList.remove("hidden");

}


/* =========================================================
   LOAD DATA
========================================================= */

async function loadData() {

  try {

    const result =
      await api("getAll");


    if (!result.success) {

      alert(result.message);

      return;

    }


    DATA.students =
      result.students || [];

    DATA.staff =
      result.staff || [];

    DATA.courses =
      result.courses || [];

    DATA.batches =
      result.batches || [];

    DATA.studentFees =
      result.studentFees || [];

    DATA.staffFees =
      result.staffFees || [];

    DATA.attendance =
      result.attendance || [];

    DATA.expenses =
      result.expenses || [];


    initializeDropdowns();

    renderAll();


  } catch(error) {

    console.error(error);

    alert(
      "Google Sheet data load nahi ho saka."
    );

  }

}


/* =========================================================
   REFRESH
========================================================= */

async function refreshData() {

  await loadData();

}


/* =========================================================
   INITIALIZE
========================================================= */

function initializeDropdowns() {

  fillMonths("feeMonth");
  fillMonths("expenseMonth");
  fillMonths("reportMonth");
  fillMonths("feeFilterMonth");
  fillMonths("expenseFilterMonth");

  fillYears("feeYear");
  fillYears("expenseYear");
  fillYears("reportYear");
  fillYears("feeFilterYear");
  fillYears("expenseFilterYear");
  fillYears("dashboardYear");


  const month =
    new Date().toLocaleString(
      "en-US",
      {month:"long"}
    );


  const year =
    new Date().getFullYear();


  setValue("feeMonth",month);
  setValue("expenseMonth",month);
  setValue("reportMonth",month);

  setValue("feeFilterMonth","All");
  setValue("expenseFilterMonth","All");

  setValue("feeYear",year);
  setValue("expenseYear",year);
  setValue("reportYear",year);

  setValue("feeFilterYear","All");
  setValue("expenseFilterYear","All");

  setValue("dashboardYear",year);


  fillCourseDropdowns();
  fillBatchDropdowns();
  fillTeacherDropdown();


  setValue(
    "admissionDate",
    today()
  );

  setValue(
    "joiningDate",
    today()
  );

  setValue(
    "feePaymentDate",
    today()
  );

  setValue(
    "attendanceDate",
    today()
  );

  setValue(
    "expenseDate",
    today()
  );


  loadFeePersons();
  loadAttendancePersons();

}


/* =========================================================
   MONTHS
========================================================= */

function fillMonths(id) {

  const el =
    document.getElementById(id);

  if (!el) return;


  el.innerHTML =
    `<option value="All">All Months</option>`;


  const months = [

    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"

  ];


  months.forEach(
    month => {

      el.innerHTML +=
        `<option value="${esc(month)}">
          ${esc(month)}
        </option>`;

    }
  );

}


/* =========================================================
   YEARS
========================================================= */

function fillYears(id) {

  const el =
    document.getElementById(id);

  if (!el) return;


  el.innerHTML =
    `<option value="All">All Years</option>`;


  const current =
    new Date().getFullYear();


  for(
    let y=current-5;
    y<=current+5;
    y++
  ) {

    el.innerHTML +=
      `<option value="${y}">
        ${y}
      </option>`;

  }

}


/* =========================================================
   COMMON
========================================================= */

function setValue(id,value) {

  const el =
    document.getElementById(id);

  if (el)
    el.value =
      value ?? "";

}


function getValue(id) {

  const el =
    document.getElementById(id);

  return el
    ? el.value
    : "";

}


function setText(id,value) {

  const el =
    document.getElementById(id);

  if (el)
    el.textContent =
      value ?? "";

}


function today() {

  const d =
    new Date();

  const offset =
    d.getTimezoneOffset();

  return new Date(
    d.getTime() -
    offset * 60000
  )
  .toISOString()
  .split("T")[0];

}


function money(value) {

  return "₹" +
    Number(value || 0)
      .toLocaleString("en-IN");

}


function esc(value) {

  return String(
    value ?? ""
  )
  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;")
  .replace(/'/g,"&#039;");

}


/* =========================================================
   DATE HELPER
========================================================= */

function dateOnly(value) {

  if (!value)
    return "";


  const s =
    String(value);


  if (s.includes("T"))
    return s.split("T")[0];


  return s.substring(0,10);

}


/* =========================================================
   NAVIGATION
========================================================= */

function showSection(section,button) {

  document
    .querySelectorAll(".page-section")
    .forEach(
      x =>
        x.classList.remove("active")
    );


  const target =
    document.getElementById(section);


  if (target)
    target.classList.add("active");


  document
    .querySelectorAll(".nav-btn")
    .forEach(
      x =>
        x.classList.remove("active")
    );


  if (button)
    button.classList.add("active");

}


function quickAdd(section) {

  showSection(
    section,
    document.querySelector(
      `[data-section="${section}"]`
    )
  );

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

  renderDashboard();

  renderStudents();

  renderStaff();

  renderBatches();

  renderFees();

  renderAttendance();

  renderExpenses();

  renderCourses();

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

  const students =
    DATA.students.length;

  const staff =
    DATA.staff.length;

  const batches =
    DATA.batches.length;

  const courses =
    DATA.courses.length;


  const studentFees =
    DATA.studentFees.reduce(
      (a,b) =>
        a +
        Number(b.Amount || 0),
      0
    );


  const salary =
    DATA.staffFees.reduce(
      (a,b) =>
        a +
        Number(b.Amount || 0),
      0
    );


  const expenses =
    DATA.expenses.reduce(
      (a,b) =>
        a +
        Number(b.Amount || 0),
      0
    );


  const net =
    studentFees -
    salary -
    expenses;


  setText(
    "totalStudents",
    students
  );

  setText(
    "totalStaff",
    staff
  );

  setText(
    "totalBatches",
    batches
  );

  setText(
    "totalCourses",
    courses
  );

  setText(
    "totalStudentFees",
    money(studentFees)
  );

  setText(
    "totalSalary",
    money(salary)
  );

  setText(
    "totalExpenses",
    money(expenses)
  );

  setText(
    "netBalance",
    money(net)
  );


  drawRecordsChart([
    students,
    staff,
    courses,
    batches
  ]);


  drawFinanceChart([
    studentFees,
    salary,
    expenses,
    net
  ]);

}


/* =========================================================
   BAR CHART
========================================================= */

function drawBarChart(
  canvasId,
  labels,
  values
) {

  const canvas =
    document.getElementById(canvasId);

  if (!canvas) return;


  const ctx =
    canvas.getContext("2d");


  const width =
    canvas.width;

  const height =
    canvas.height;


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  const max =
    Math.max(
      ...values,
      1
    );


  const padding = 55;

  const chartHeight =
    height - 90;

  const slot =
    (
      width -
      padding * 2
    ) /
    values.length;


  const barWidth =
    slot * .55;


  values.forEach(
    (value,index) => {

      const x =
        padding +
        index * slot +
        (slot-barWidth)/2;


      const barHeight =
        (
          Number(value) /
          max
        ) *
        chartHeight;


      const y =
        height -
        50 -
        barHeight;


      const gradient =
        ctx.createLinearGradient(
          0,
          y,
          0,
          height
        );


      gradient.addColorStop(
        0,
        "#635bdb"
      );


      gradient.addColorStop(
        1,
        "#4cc9f0"
      );


      ctx.fillStyle =
        gradient;


      if (
        typeof ctx.roundRect ===
        "function"
      ) {

        ctx.beginPath();

        ctx.roundRect(
          x,
          y,
          barWidth,
          barHeight,
          8
        );

        ctx.fill();

      } else {

        ctx.fillRect(
          x,
          y,
          barWidth,
          barHeight
        );

      }


      ctx.fillStyle =
        getComputedStyle(
          document.body
        )
        .getPropertyValue("--text");


      ctx.font =
        "bold 13px Arial";


      ctx.textAlign =
        "center";


      ctx.fillText(
        Number(value)
          .toLocaleString("en-IN"),
        x + barWidth/2,
        y - 8
      );


      ctx.font =
        "12px Arial";


      ctx.fillText(
        labels[index],
        x + barWidth/2,
        height - 25
      );

    }
  );

}


function drawRecordsChart(values) {

  drawBarChart(
    "recordsChart",
    [
      "Students",
      "Staff",
      "Courses",
      "Batches"
    ],
    values
  );

}


function drawFinanceChart(values) {

  drawBarChart(
    "financeChart",
    [
      "Student Fees",
      "Salary",
      "Expenses",
      "Net"
    ],
    values
  );

}


/* =========================================================
   COURSES DROPDOWNS
========================================================= */

function fillCourseDropdowns() {

  [
    "studentCourse",
    "batchCourse"
  ]
  .forEach(id => {

    const el =
      document.getElementById(id);

    if (!el) return;


    el.innerHTML =
      `<option value="">
        Select Course
      </option>`;


    DATA.courses.forEach(
      course => {

        el.innerHTML +=
          `<option value="${esc(course.CourseName)}">
            ${esc(course.CourseName)}
          </option>`;

      }
    );

  });

}


/* =========================================================
   BATCH DROPDOWNS
========================================================= */

function fillBatchDropdowns() {

  [
    "studentBatch",
    "attendanceBatch"
  ]
  .forEach(id => {

    const el =
      document.getElementById(id);

    if (!el) return;


    el.innerHTML =
      `<option value="">
        Select Batch
      </option>`;


    DATA.batches.forEach(
      b => {

        el.innerHTML +=
          `<option value="${esc(b.BatchName)}">
            ${esc(b.BatchName)}
          </option>`;

      }
    );

  });

}


/* =========================================================
   TEACHER DROPDOWN
========================================================= */

function fillTeacherDropdown() {

  const el =
    document.getElementById(
      "batchTeacher"
    );

  if (!el) return;


  el.innerHTML =
    `<option value="">
      Select Teacher
    </option>`;


  DATA.staff.forEach(
    staff => {

      el.innerHTML +=
        `<option value="${esc(staff.Name)}">
          ${esc(staff.Name)}
        </option>`;

    }
  );

}


/* =========================================================
   STUDENTS
========================================================= */

function renderStudents() {

  const tbody =
    document.getElementById(
      "studentsTable"
    );

  if (!tbody) return;


  const search =
    getValue(
      "studentSearch"
    )
    .toLowerCase();


  const rows =
    DATA.students.filter(
      s =>
        (
          s.StudentName +
          " " +
          s.RegistrationNo +
          " " +
          s.Mobile +
          " " +
          s.Course
        )
        .toLowerCase()
        .includes(search)
    );


  tbody.innerHTML =
    rows.map(
      s => `

      <tr>

        <td>${esc(s.RegistrationNo)}</td>

        <td>
          <b>${esc(s.StudentName)}</b>
        </td>

        <td>${esc(s.FatherName)}</td>

        <td>${esc(s.Mobile)}</td>

        <td>${esc(s.Course)}</td>

        <td>${esc(s.Batch)}</td>

        <td>${money(s.MonthlyFee)}</td>

        <td>
          <span class="${
            s.Status === "Active"
            ? "status-active"
            : "status-inactive"
          }">
            ${esc(s.Status)}
          </span>
        </td>

        <td>

          <button
            class="action-btn edit-btn"
            onclick="editStudent('${esc(s.ID)}')"
          >
            ✏️
          </button>

          <button
            class="action-btn delete-btn"
            onclick="deleteStudent('${esc(s.ID)}')"
          >
            🗑️
          </button>

        </td>

      </tr>

    `
    )
    .join("");

}


document
  .getElementById("studentForm")
  .addEventListener(
    "submit",
    async function(e) {

      e.preventDefault();


      const id =
        getValue("studentID");


      const data = {

        id:id,

        registrationNo:
          getValue("registrationNo"),

        studentName:
          getValue("studentName"),

        fatherName:
          getValue("fatherName"),

        mobile:
          getValue("mobile"),

        alternateMobile:
          getValue("alternateMobile"),

        gender:
          getValue("gender"),

        dob:
          getValue("dob"),

        course:
          getValue("studentCourse"),

        batch:
          getValue("studentBatch"),

        admissionDate:
          getValue("admissionDate"),

        totalFee:
          getValue("totalFee"),

        monthlyFee:
          getValue("monthlyFee"),

        paidAmount:
          getValue("studentPaid"),

        address:
          getValue("studentAddress"),

        status:
          getValue("studentStatus"),

        remark:
          getValue("studentRemark")

      };


      const result =
        await api(
          id
          ? "updateStudent"
          : "addStudent",
          data
        );


      alert(result.message);


      if (result.success) {

        resetStudentForm();

        await loadData();

      }

    }
  );


function editStudent(id) {

  const s =
    DATA.students.find(
      x =>
        String(x.ID) ===
        String(id)
    );


  if (!s) return;


  setValue("studentID",s.ID);
  setValue("registrationNo",s.RegistrationNo);
  setValue("studentName",s.StudentName);
  setValue("fatherName",s.FatherName);
  setValue("mobile",s.Mobile);
  setValue("alternateMobile",s.AlternateMobile);
  setValue("gender",s.Gender);
  setValue("dob",dateOnly(s.DOB));
  setValue("studentCourse",s.Course);
  setValue("studentBatch",s.Batch);
  setValue("admissionDate",dateOnly(s.AdmissionDate));
  setValue("totalFee",s.TotalFee);
  setValue("monthlyFee",s.MonthlyFee);
  setValue("studentPaid",s.PaidAmount);
  setValue("studentAddress",s.Address);
  setValue("studentStatus",s.Status);
  setValue("studentRemark",s.Remark);


  showSection(
    "students",
    document.querySelector(
      '[data-section="students"]'
    )
  );


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}


async function deleteStudent(id) {

  if (
    !confirm(
      "Student record delete karna hai?"
    )
  )
    return;


  const result =
    await api(
      "deleteStudent",
      {id:id}
    );


  alert(result.message);


  if (result.success)
    await loadData();

}


function resetStudentForm() {

  document
    .getElementById("studentForm")
    .reset();


  setValue(
    "studentID",
    ""
  );


  setValue(
    "admissionDate",
    today()
  );

}


/* =========================================================
   STAFF
========================================================= */

function renderStaff() {

  const tbody =
    document.getElementById(
      "staffTable"
    );

  if (!tbody) return;


  const search =
    getValue(
      "staffSearch"
    )
    .toLowerCase();


  const rows =
    DATA.staff.filter(
      s =>
        (
          s.Name +
          " " +
          s.StaffCode +
          " " +
          s.Mobile +
          " " +
          s.Designation
        )
        .toLowerCase()
        .includes(search)
    );


  tbody.innerHTML =
    rows.map(
      s => `

      <tr>

        <td>${esc(s.StaffCode)}</td>

        <td>
          <b>${esc(s.Name)}</b>
        </td>

        <td>${esc(s.Mobile)}</td>

        <td>${esc(s.Designation)}</td>

        <td>${money(s.MonthlySalary)}</td>

        <td>${esc(s.JoiningDate)}</td>

        <td>${esc(s.Status)}</td>

        <td>

          <button
            class="action-btn edit-btn"
            onclick="editStaff('${esc(s.ID)}')"
          >
            ✏️
          </button>

          <button
            class="action-btn delete-btn"
            onclick="deleteStaff('${esc(s.ID)}')"
          >
            🗑️
          </button>

        </td>

      </tr>

    `
    )
    .join("");

}


document
  .getElementById("staffForm")
  .addEventListener(
    "submit",
    async function(e) {

      e.preventDefault();


      const id =
        getValue("staffID");


      const data = {

        id:id,

        staffCode:
          getValue("staffCode"),

        name:
          getValue("staffName"),

        fatherName:
          getValue("staffFather"),

        mobile:
          getValue("staffMobile"),

        designation:
          getValue("designation"),

        joiningDate:
          getValue("joiningDate"),

        monthlySalary:
          getValue("monthlySalary"),

        address:
          getValue("staffAddress"),

        status:
          getValue("staffStatus"),

        remark:
          getValue("staffRemark")

      };


      const result =
        await api(
          id
          ? "updateStaff"
          : "addStaff",
          data
        );


      alert(result.message);


      if (result.success) {

        resetStaffForm();

        await loadData();

      }

    }
  );


function editStaff(id) {

  const s =
    DATA.staff.find(
      x =>
        String(x.ID) ===
        String(id)
    );


  if (!s) return;


  setValue("staffID",s.ID);
  setValue("staffCode",s.StaffCode);
  setValue("staffName",s.Name);
  setValue("staffFather",s.FatherName);
  setValue("staffMobile",s.Mobile);
  setValue("designation",s.Designation);
  setValue("joiningDate",dateOnly(s.JoiningDate));
  setValue("monthlySalary",s.MonthlySalary);
  setValue("staffAddress",s.Address);
  setValue("staffStatus",s.Status);
  setValue("staffRemark",s.Remark);


  showSection(
    "staff",
    document.querySelector(
      '[data-section="staff"]'
    )
  );

}


async function deleteStaff(id) {

  if (
    !confirm(
      "Staff record delete karna hai?"
    )
  )
    return;


  const result =
    await api(
      "deleteStaff",
      {id:id}
    );


  alert(result.message);


  if (result.success)
    await loadData();

}


function resetStaffForm() {

  document
    .getElementById("staffForm")
    .reset();


  setValue("staffID","");

  setValue(
    "joiningDate",
    today()
  );

}


/* =========================================================
   BATCHES
========================================================= */

function renderBatches() {

  const tbody =
    document.getElementById(
      "batchesTable"
    );

  if (!tbody) return;


  const search =
    getValue(
      "batchSearch"
    )
    .toLowerCase();


  const rows =
    DATA.batches.filter(
      b =>
        (
          b.BatchName +
          " " +
          b.Course +
          " " +
          b.Teacher
        )
        .toLowerCase()
        .includes(search)
    );


  tbody.innerHTML =
    rows.map(
      b => `

      <tr>

        <td>
          <b>${esc(b.BatchName)}</b>
        </td>

        <td>${esc(b.Course)}</td>

        <td>
          ${esc(b.StartTime)}
          -
          ${esc(b.EndTime)}
        </td>

        <td>${esc(b.Teacher)}</td>

        <td>${esc(b.Room)}</td>

        <td>${esc(b.MaxStudents)}</td>

        <td>${esc(b.Status)}</td>

        <td>

          <button
            class="action-btn edit-btn"
            onclick="editBatch('${esc(b.ID)}')"
          >
            ✏️
          </button>

          <button
            class="action-btn delete-btn"
            onclick="deleteBatch('${esc(b.ID)}')"
          >
            🗑️
          </button>

        </td>

      </tr>

    `
    )
    .join("");

}


document
  .getElementById("batchForm")
  .addEventListener(
    "submit",
    async function(e) {

      e.preventDefault();


      const id =
        getValue("batchID");


      const data = {

        id:id,

        batchName:
          getValue("batchName"),

        course:
          getValue("batchCourse"),

        startTime:
          getValue("batchStart"),

        endTime:
          getValue("batchEnd"),

        teacher:
          getValue("batchTeacher"),

        room:
          getValue("batchRoom"),

        maxStudents:
          getValue("maxStudents"),

        status:
          getValue("batchStatus"),

        remark:
          getValue("batchRemark")

      };


      const result =
        await api(
          id
          ? "updateBatch"
          : "addBatch",
          data
        );


      alert(result.message);


      if (result.success) {

        resetBatchForm();

        await loadData();

      }

    }
  );


function editBatch(id) {

  const b =
    DATA.batches.find(
      x =>
        String(x.ID) ===
        String(id)
    );


  if (!b) return;


  setValue("batchID",b.ID);
  setValue("batchName",b.BatchName);
  setValue("batchCourse",b.Course);
  setValue("batchStart",b.StartTime);
  setValue("batchEnd",b.EndTime);
  setValue("batchTeacher",b.Teacher);
  setValue("batchRoom",b.Room);
  setValue("maxStudents",b.MaxStudents);
  setValue("batchStatus",b.Status);
  setValue("batchRemark",b.Remark);


  showSection(
    "batches",
    document.querySelector(
      '[data-section="batches"]'
    )
  );

}


async function deleteBatch(id) {

  if (
    !confirm(
      "Batch delete karna hai?"
    )
  )
    return;


  const result =
    await api(
      "deleteBatch",
      {id:id}
    );


  alert(result.message);


  if (result.success)
    await loadData();

}


function resetBatchForm() {

  document
    .getElementById("batchForm")
    .reset();

  setValue("batchID","");

}


/* =========================================================
   FEES
========================================================= */

function changeFeePersonType() {

  loadFeePersons();

}


function loadFeePersons() {

  const type =
    getValue("feePersonType");


  const el =
    document.getElementById(
      "feePerson"
    );


  if (!el) return;


  el.innerHTML =
    `<option value="">
      Select Person
    </option>`;


  if (type === "Student") {

    DATA.students.forEach(
      s => {

        el.innerHTML +=
          `<option value="${esc(s.ID)}">
            ${esc(s.StudentName)}
            - ${esc(s.RegistrationNo)}
          </option>`;

      }
    );

  } else {

    DATA.staff.forEach(
      s => {

        el.innerHTML +=
          `<option value="${esc(s.ID)}">
            ${esc(s.Name)}
            - ${esc(s.StaffCode)}
          </option>`;

      }
    );

  }

}


document
  .getElementById("feePerson")
  .addEventListener(
    "change",
    function() {

      const id =
        this.value;


      const type =
        getValue("feePersonType");


      if (type === "Student") {

        const s =
          DATA.students.find(
            x =>
              String(x.ID) ===
              String(id)
          );


        if (s)
          setValue(
            "feeAmount",
            s.MonthlyFee
          );

      } else {

        const s =
          DATA.staff.find(
            x =>
              String(x.ID) ===
              String(id)
          );


        if (s)
          setValue(
            "feeAmount",
            s.MonthlySalary
          );

      }

    }
  );


document
  .getElementById("feeForm")
  .addEventListener(
    "submit",
    async function(e) {

      e.preventDefault();


      const id =
        getValue("feeID");


      const type =
        getValue("feePersonType");


      const personID =
        getValue("feePerson");


      if (!personID) {

        alert(
          "Please select person"
        );

        return;

      }


      let data;


      if (type === "Student") {

        const s =
          DATA.students.find(
            x =>
              String(x.ID) ===
              String(personID)
          );


        data = {

          id:id,

          studentID:personID,

          registrationNo:
            s?.RegistrationNo || "",

          studentName:
            s?.StudentName || "",

          month:
            getValue("feeMonth"),

          year:
            getValue("feeYear"),

          amount:
            getValue("feeAmount"),

          paymentMode:
            getValue("feePaymentMode"),

          paymentDate:
            getValue("feePaymentDate"),

          receiptNo:
            "",

          remark:
            getValue("feeRemark")

        };


      } else {

        const s =
          DATA.staff.find(
            x =>
              String(x.ID) ===
              String(personID)
          );


        data = {

          id:id,

          staffID:personID,

          staffCode:
            s?.StaffCode || "",

          staffName:
            s?.Name || "",

          month:
            getValue("feeMonth"),

          year:
            getValue("feeYear"),

          amount:
            getValue("feeAmount"),

          paymentMode:
            getValue("feePaymentMode"),

          paymentDate:
            getValue("feePaymentDate"),

          receiptNo:
            "",

          remark:
            getValue("feeRemark")

        };

      }


      const action =
        id
        ?
        (
          type === "Student"
          ?
          "updateStudentFee"
          :
          "updateStaffFee"
        )
        :
        (
          type === "Student"
          ?
          "addStudentFee"
          :
          "addStaffFee"
        );


      const result =
        await api(
          action,
          data
        );


      alert(
        result.message +
        (
          result.receiptNo
          ?
          "\nReceipt: " +
          result.receiptNo
          :
          ""
        )
      );


      if (result.success) {

        resetFeeForm();

        await loadData();

      }

    }
  );


function renderFees() {

  const tbody =
    document.getElementById(
      "feesTable"
    );

  if (!tbody) return;


  const type =
    getValue("feeFilterType");

  const month =
    getValue("feeFilterMonth");

  const year =
    getValue("feeFilterYear");

  const search =
    getValue("feeSearch")
    .toLowerCase();


  let rows = [

    ...DATA.studentFees.map(
      x => ({
        ...x,
        _type:"Student",
        _name:x.StudentName
      })
    ),

    ...DATA.staffFees.map(
      x => ({
        ...x,
        _type:"Staff",
        _name:x.StaffName
      })
    )

  ];


  if (type !== "All")
    rows =
      rows.filter(
        x =>
          x._type === type
      );


  if (month !== "All")
    rows =
      rows.filter(
        x =>
          String(x.Month) ===
          String(month)
      );


  if (year !== "All")
    rows =
      rows.filter(
        x =>
          String(x.Year) ===
          String(year)
      );


  if (search)
    rows =
      rows.filter(
        x =>
          (
            x._name +
            " " +
            x.ReceiptNo +
            " " +
            x.RegistrationNo +
            " " +
            x.StaffCode
          )
          .toLowerCase()
          .includes(search)
      );


  tbody.innerHTML =
    rows.map(
      x => `

      <tr>

        <td>${esc(x._type)}</td>

        <td>
          <b>${esc(x._name)}</b>
        </td>

        <td>${esc(x.Month)}</td>

        <td>${esc(x.Year)}</td>

        <td>${money(x.Amount)}</td>

        <td>${esc(x.PaymentMode)}</td>

        <td>${esc(x.PaymentDate)}</td>

        <td>${esc(x.ReceiptNo)}</td>

        <td>

          <button
            class="action-btn edit-btn"
            onclick="editFee('${esc(x.ID)}','${esc(x._type)}')"
          >
            ✏️
          </button>

          <button
            class="action-btn delete-btn"
            onclick="deleteFee('${esc(x.ID)}','${esc(x._type)}')"
          >
            🗑️
          </button>

        </td>

      </tr>

    `
    )
    .join("");

}


function editFee(id,type) {

  const source =
    type === "Student"
    ?
    DATA.studentFees
    :
    DATA.staffFees;


  const f =
    source.find(
      x =>
        String(x.ID) ===
        String(id)
    );


  if (!f) return;


  setValue("feeID",f.ID);

  setValue(
    "feePersonType",
    type
  );


  loadFeePersons();


  setValue(
    "feePerson",
    type === "Student"
    ?
    f.StudentID
    :
    f.StaffID
  );


  setValue("feeMonth",f.Month);
  setValue("feeYear",f.Year);
  setValue("feeAmount",f.Amount);
  setValue("feePaymentMode",f.PaymentMode);
  setValue("feePaymentDate",dateOnly(f.PaymentDate));
  setValue("feeRemark",f.Remark);


  showSection(
    "fees",
    document.querySelector(
      '[data-section="fees"]'
    )
  );

}


async function deleteFee(id,type) {

  if (
    !confirm(
      "Payment record delete karna hai?"
    )
  )
    return;


  const action =
    type === "Student"
    ?
    "deleteStudentFee"
    :
    "deleteStaffFee";


  const result =
    await api(
      action,
      {id:id}
    );


  alert(result.message);


  if (result.success)
    await loadData();

}


function resetFeeForm() {

  document
    .getElementById("feeForm")
    .reset();


  setValue("feeID","");

  setValue(
    "feePaymentDate",
    today()
  );


  setValue(
    "feeMonth",
    new Date()
      .toLocaleString(
        "en-US",
        {month:"long"}
      )
  );

}


/* =========================================================
   ATTENDANCE
   SAVE + EDIT + DELETE
========================================================= */

function loadAttendancePersons() {

  const type =
    getValue(
      "attendanceType"
    );


  const el =
    document.getElementById(
      "attendancePerson"
    );


  if (!el) return;


  el.innerHTML =
    `<option value="">
      Select Person
    </option>`;


  const list =
    type === "Student"
    ?
    DATA.students
    :
    DATA.staff;


  list.forEach(
    p => {

      const id =
        p.ID;


      const name =
        type === "Student"
        ?
        p.StudentName
        :
        p.Name;


      const extra =
        type === "Student"
        ?
        p.RegistrationNo
        :
        p.StaffCode;


      el.innerHTML +=
        `<option value="${esc(id)}">
          ${esc(name)}
          ${extra ? " - " + esc(extra) : ""}
        </option>`;

    }
  );

}


/* =========================================================
   ATTENDANCE SAVE / UPDATE
========================================================= */

document
  .getElementById("attendanceForm")
  .addEventListener(
    "submit",
    async function(e) {

      e.preventDefault();


      const attendanceID =
        getValue(
          "attendanceID"
        );


      const type =
        getValue(
          "attendanceType"
        );


      const personID =
        getValue(
          "attendancePerson"
        );


      if (!personID) {

        alert(
          "Please select person"
        );

        return;

      }


      let person;


      if (type === "Student") {

        person =
          DATA.students.find(
            x =>
              String(x.ID) ===
              String(personID)
          );

      } else {

        person =
          DATA.staff.find(
            x =>
              String(x.ID) ===
              String(personID)
          );

      }


      if (!person) {

        alert(
          "Selected person not found"
        );

        return;

      }


      const data = {

        id:
          attendanceID,

        personType:
          type,

        personID:
          personID,

        personName:
          type === "Student"
          ?
          person.StudentName
          :
          person.Name,

        batch:
          type === "Student"
          ?
          (
            getValue("attendanceBatch") ||
            person.Batch ||
            ""
          )
          :
          "",

        attendanceDate:
          getValue(
            "attendanceDate"
          ),

        status:
          getValue(
            "attendanceStatus"
          ),

        remark:
          getValue(
            "attendanceRemark"
          )

      };


      /*
        ID है तो UPDATE
        ID नहीं है तो SAVE
      */

      const action =
        attendanceID
        ?
        "updateAttendance"
        :
        "saveAttendance";


      const result =
        await api(
          action,
          data
        );


      alert(result.message);


      if (result.success) {

        resetAttendanceForm();

        await loadData();

      }

    }
  );


/* =========================================================
   RENDER ATTENDANCE
========================================================= */

function renderAttendance() {

  const tbody =
    document.getElementById(
      "attendanceTable"
    );


  if (!tbody) return;


  const search =
    getValue(
      "attendanceSearch"
    )
    .toLowerCase();


  const rows =
    DATA.attendance.filter(
      a =>
        (
          a.PersonName +
          " " +
          a.Batch +
          " " +
          a.Status +
          " " +
          a.PersonType +
          " " +
          a.AttendanceDate
        )
        .toLowerCase()
        .includes(search)
    );


  if (!rows.length) {

    tbody.innerHTML = `

      <tr>

        <td
          colspan="7"
          style="text-align:center;padding:25px"
        >
          No attendance records found
        </td>

      </tr>

    `;

    return;

  }


  tbody.innerHTML =
    rows.map(
      a => `

      <tr>

        <td>
          ${esc(a.PersonType)}
        </td>


        <td>
          <b>
            ${esc(a.PersonName)}
          </b>
        </td>


        <td>
          ${esc(a.Batch)}
        </td>


        <td>
          ${esc(dateOnly(a.AttendanceDate))}
        </td>


        <td>

          <span
            class="${
              a.Status === "Present"
              ?
              "status-active"
              :
              "status-inactive"
            }"
          >
            ${esc(a.Status)}
          </span>

        </td>


        <td>
          ${esc(a.Remark)}
        </td>


        <td>

          <!-- EDIT -->

          <button
            class="action-btn edit-btn"
            onclick="editAttendance('${esc(a.ID)}')"
            title="Edit Attendance"
          >
            ✏️
          </button>


          <!-- DELETE -->

          <button
            class="action-btn delete-btn"
            onclick="deleteAttendance('${esc(a.ID)}')"
            title="Delete Attendance"
          >
            🗑️
          </button>

        </td>

      </tr>

    `
    )
    .join("");

}


/* =========================================================
   EDIT ATTENDANCE
========================================================= */

function editAttendance(id) {

  const a =
    DATA.attendance.find(
      x =>
        String(x.ID) ===
        String(id)
    );


  if (!a) {

    alert(
      "Attendance record not found"
    );

    return;

  }


  /*
    पहले hidden ID में record ID
  */

  setValue(
    "attendanceID",
    a.ID
  );


  /*
    Type set
  */

  setValue(
    "attendanceType",
    a.PersonType || "Student"
  );


  /*
    Person dropdown reload
  */

  loadAttendancePersons();


  /*
    Person select
  */

  setValue(
    "attendancePerson",
    a.PersonID
  );


  /*
    Date
  */

  setValue(
    "attendanceDate",
    dateOnly(a.AttendanceDate)
  );


  /*
    Status
  */

  setValue(
    "attendanceStatus",
    a.Status || "Present"
  );


  /*
    Batch
  */

  setValue(
    "attendanceBatch",
    a.Batch || ""
  );


  /*
    Remark
  */

  setValue(
    "attendanceRemark",
    a.Remark || ""
  );


  /*
    Button text
  */

  const btn =
    document.getElementById(
      "attendanceSaveBtn"
    );


  if (btn)
    btn.innerHTML =
      "✏️ Update Attendance";


  /*
    Attendance section open
  */

  showSection(
    "attendance",
    document.querySelector(
      '[data-section="attendance"]'
    )
  );


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}


/* =========================================================
   DELETE ATTENDANCE
========================================================= */

async function deleteAttendance(id) {

  if (
    !confirm(
      "Attendance record delete karna hai?"
    )
  )
    return;


  const result =
    await api(
      "deleteAttendance",
      {
        id:id
      }
    );


  alert(
    result.message
  );


  if (result.success) {

    resetAttendanceForm();

    await loadData();

  }

}


/* =========================================================
   RESET ATTENDANCE
========================================================= */

function resetAttendanceForm() {

  const form =
    document.getElementById(
      "attendanceForm"
    );


  if (form)
    form.reset();


  /*
    बहुत जरूरी:
    Edit ID खाली
  */

  setValue(
    "attendanceID",
    ""
  );


  /*
    Default date
  */

  setValue(
    "attendanceDate",
    today()
  );


  /*
    Default status
  */

  setValue(
    "attendanceStatus",
    "Present"
  );


  /*
    Save button वापस Save
  */

  const btn =
    document.getElementById(
      "attendanceSaveBtn"
    );


  if (btn)
    btn.innerHTML =
      "💾 Save Attendance";


  /*
    Person list reload
  */

  loadAttendancePersons();

}


/* =========================================================
   EXPENSES
========================================================= */

document
  .getElementById("expenseForm")
  .addEventListener(
    "submit",
    async function(e) {

      e.preventDefault();


      const id =
        getValue("expenseID");


      const data = {

        id:id,

        expenseDate:
          getValue("expenseDate"),

        month:
          getValue("expenseMonth"),

        year:
          getValue("expenseYear"),

        expenseType:
          getValue("expenseType"),

        description:
          getValue("expenseDescription"),

        amount:
          getValue("expenseAmount"),

        paymentMode:
          getValue("expensePaymentMode"),

        paidTo:
          getValue("paidTo"),

        remark:
          getValue("expenseRemark")

      };


      const result =
        await api(
          id
          ?
          "updateExpense"
          :
          "addExpense",
          data
        );


      alert(result.message);


      if (result.success) {

        resetExpenseForm();

        await loadData();

      }

    }
  );


function renderExpenses() {

  const tbody =
    document.getElementById(
      "expensesTable"
    );


  if (!tbody) return;


  const month =
    getValue(
      "expenseFilterMonth"
    );


  const year =
    getValue(
      "expenseFilterYear"
    );


  const search =
    getValue(
      "expenseSearch"
    )
    .toLowerCase();


  let rows =
    DATA.expenses;


  if (month !== "All")
    rows =
      rows.filter(
        x =>
          String(x.Month) ===
          String(month)
      );


  if (year !== "All")
    rows =
      rows.filter(
        x =>
          String(x.Year) ===
          String(year)
      );


  if (search)
    rows =
      rows.filter(
        x =>
          (
            x.ExpenseType +
            " " +
            x.Description +
            " " +
            x.PaidTo
          )
          .toLowerCase()
          .includes(search)
      );


  tbody.innerHTML =
    rows.map(
      e => `

      <tr>

        <td>${esc(e.ExpenseDate)}</td>

        <td>${esc(e.Month)}</td>

        <td>${esc(e.Year)}</td>

        <td>${esc(e.ExpenseType)}</td>

        <td>${esc(e.Description)}</td>

        <td>${money(e.Amount)}</td>

        <td>${esc(e.PaymentMode)}</td>

        <td>${esc(e.PaidTo)}</td>

        <td>

          <button
            class="action-btn edit-btn"
            onclick="editExpense('${esc(e.ID)}')"
          >
            ✏️
          </button>

          <button
            class="action-btn delete-btn"
            onclick="deleteExpense('${esc(e.ID)}')"
          >
            🗑️
          </button>

        </td>

      </tr>

    `
    )
    .join("");

}


function editExpense(id) {

  const e =
    DATA.expenses.find(
      x =>
        String(x.ID) ===
        String(id)
    );


  if (!e) return;


  setValue("expenseID",e.ID);
  setValue("expenseDate",dateOnly(e.ExpenseDate));
  setValue("expenseMonth",e.Month);
  setValue("expenseYear",e.Year);
  setValue("expenseType",e.ExpenseType);
  setValue("expenseDescription",e.Description);
  setValue("expenseAmount",e.Amount);
  setValue("expensePaymentMode",e.PaymentMode);
  setValue("paidTo",e.PaidTo);
  setValue("expenseRemark",e.Remark);


  showSection(
    "expenses",
    document.querySelector(
      '[data-section="expenses"]'
    )
  );

}


async function deleteExpense(id) {

  if (
    !confirm(
      "Expense delete karna hai?"
    )
  )
    return;


  const result =
    await api(
      "deleteExpense",
      {id:id}
    );


  alert(result.message);


  if (result.success)
    await loadData();

}


function resetExpenseForm() {

  document
    .getElementById("expenseForm")
    .reset();


  setValue("expenseID","");

  setValue(
    "expenseDate",
    today()
  );

}


/* =========================================================
   COURSES
========================================================= */

document
  .getElementById("courseForm")
  .addEventListener(
    "submit",
    async function(e) {

      e.preventDefault();


      const id =
        getValue("courseID");


      const data = {

        id:id,

        courseName:
          getValue("courseName"),

        duration:
          getValue("courseDuration"),

        courseFee:
          getValue("courseFee"),

        monthlyFee:
          getValue("courseMonthlyFee"),

        status:
          getValue("courseStatus"),

        remark:
          getValue("courseRemark")

      };


      const result =
        await api(
          id
          ?
          "updateCourse"
          :
          "addCourse",
          data
        );


      alert(result.message);


      if (result.success) {

        resetCourseForm();

        await loadData();

      }

    }
  );


function renderCourses() {

  const tbody =
    document.getElementById(
      "coursesTable"
    );


  if (!tbody) return;


  const search =
    getValue(
      "courseSearch"
    )
    .toLowerCase();


  const rows =
    DATA.courses.filter(
      c =>
        (
          c.CourseName +
          " " +
          c.Duration
        )
        .toLowerCase()
        .includes(search)
    );


  tbody.innerHTML =
    rows.map(
      c => `

      <tr>

        <td>
          <b>${esc(c.CourseName)}</b>
        </td>

        <td>${esc(c.Duration)}</td>

        <td>${money(c.CourseFee)}</td>

        <td>${money(c.MonthlyFee)}</td>

        <td>${esc(c.Status)}</td>

        <td>

          <button
            class="action-btn edit-btn"
            onclick="editCourse('${esc(c.ID)}')"
          >
            ✏️
          </button>

          <button
            class="action-btn delete-btn"
            onclick="deleteCourse('${esc(c.ID)}')"
          >
            🗑️
          </button>

        </td>

      </tr>

    `
    )
    .join("");

}


function editCourse(id) {

  const c =
    DATA.courses.find(
      x =>
        String(x.ID) ===
        String(id)
    );


  if (!c) return;


  setValue("courseID",c.ID);
  setValue("courseName",c.CourseName);
  setValue("courseDuration",c.Duration);
  setValue("courseFee",c.CourseFee);
  setValue("courseMonthlyFee",c.MonthlyFee);
  setValue("courseStatus",c.Status);
  setValue("courseRemark",c.Remark);


  showSection(
    "courses",
    document.querySelector(
      '[data-section="courses"]'
    )
  );

}


async function deleteCourse(id) {

  if (
    !confirm(
      "Course delete karna hai?"
    )
  )
    return;


  const result =
    await api(
      "deleteCourse",
      {id:id}
    );


  alert(result.message);


  if (result.success)
    await loadData();

}


function resetCourseForm() {

  document
    .getElementById("courseForm")
    .reset();


  setValue(
    "courseID",
    ""
  );

}


/* =========================================================
   REPORTS
========================================================= */

function generateReport() {

  const type =
    getValue("reportType");

  const month =
    getValue("reportMonth");

  const year =
    getValue("reportYear");


  let rows = [];

  let headers = [];


  if (type === "students") {

    rows =
      DATA.students;


    headers = [
      "Registration",
      "Student",
      "Father",
      "Mobile",
      "Course",
      "Batch",
      "Monthly Fee",
      "Status"
    ];

  }


  else if (type === "staff") {

    rows =
      DATA.staff;


    headers = [
      "Code",
      "Name",
      "Mobile",
      "Designation",
      "Salary",
      "Joining Date",
      "Status"
    ];

  }


  else if (type === "studentFees") {

    rows =
      DATA.studentFees.filter(
        x =>
          (
            month === "All" ||
            String(x.Month) === String(month)
          ) &&
          (
            year === "All" ||
            String(x.Year) === String(year)
          )
      );


    headers = [
      "Student",
      "Registration",
      "Month",
      "Year",
      "Amount",
      "Mode",
      "Date",
      "Receipt"
    ];

  }


  else if (type === "staffFees") {

    rows =
      DATA.staffFees.filter(
        x =>
          (
            month === "All" ||
            String(x.Month) === String(month)
          ) &&
          (
            year === "All" ||
            String(x.Year) === String(year)
          )
      );


    headers = [
      "Staff",
      "Code",
      "Month",
      "Year",
      "Amount",
      "Mode",
      "Date",
      "Receipt"
    ];

  }


  else if (type === "expenses") {

    rows =
      DATA.expenses.filter(
        x =>
          (
            month === "All" ||
            String(x.Month) === String(month)
          ) &&
          (
            year === "All" ||
            String(x.Year) === String(year)
          )
      );


    headers = [
      "Date",
      "Month",
      "Year",
      "Type",
      "Description",
      "Amount",
      "Mode",
      "Paid To"
    ];

  }


  else if (type === "attendance") {

    rows =
      DATA.attendance.filter(
        x =>
          (
            month === "All" ||
            String(
              new Date(
                x.AttendanceDate
              )
              .toLocaleString(
                "en-US",
                {month:"long"}
              )
            ) === String(month)
          ) &&
          (
            year === "All" ||
            String(
              new Date(
                x.AttendanceDate
              ).getFullYear()
            ) === String(year)
          )
      );


    headers = [
      "Type",
      "Name",
      "Batch",
      "Date",
      "Status",
      "Remark"
    ];

  }


  else if (type === "courses") {

    rows =
      DATA.courses;


    headers = [
      "Course",
      "Duration",
      "Total Fee",
      "Monthly Fee",
      "Status"
    ];

  }


  else if (type === "batches") {

    rows =
      DATA.batches;


    headers = [
      "Batch",
      "Course",
      "Start",
      "End",
      "Teacher",
      "Room",
      "Max Students",
      "Status"
    ];

  }


  renderReport(
    headers,
    rows,
    type
  );

}


function renderReport(
  headers,
  rows,
  type
) {

  const head =
    document.getElementById(
      "reportHead"
    );


  const body =
    document.getElementById(
      "reportBody"
    );


  head.innerHTML =
    `<tr>
      ${headers.map(
        h =>
          `<th>${esc(h)}</th>`
      ).join("")}
    </tr>`;


  body.innerHTML =
    rows.map(
      r => {

        let values=[];


        if (type === "students") {

          values = [
            r.RegistrationNo,
            r.StudentName,
            r.FatherName,
            r.Mobile,
            r.Course,
            r.Batch,
            money(r.MonthlyFee),
            r.Status
          ];

        }


        else if (type === "staff") {

          values = [
            r.StaffCode,
            r.Name,
            r.Mobile,
            r.Designation,
            money(r.MonthlySalary),
            r.JoiningDate,
            r.Status
          ];

        }


        else if (type === "studentFees") {

          values = [
            r.StudentName,
            r.RegistrationNo,
            r.Month,
            r.Year,
            money(r.Amount),
            r.PaymentMode,
            r.PaymentDate,
            r.ReceiptNo
          ];

        }


        else if (type === "staffFees") {

          values = [
            r.StaffName,
            r.StaffCode,
            r.Month,
            r.Year,
            money(r.Amount),
            r.PaymentMode,
            r.PaymentDate,
            r.ReceiptNo
          ];

        }


        else if (type === "expenses") {

          values = [
            r.ExpenseDate,
            r.Month,
            r.Year,
            r.ExpenseType,
            r.Description,
            money(r.Amount),
            r.PaymentMode,
            r.PaidTo
          ];

        }


        else if (type === "attendance") {

          values = [
            r.PersonType,
            r.PersonName,
            r.Batch,
            dateOnly(r.AttendanceDate),
            r.Status,
            r.Remark
          ];

        }


        else if (type === "courses") {

          values = [
            r.CourseName,
            r.Duration,
            money(r.CourseFee),
            money(r.MonthlyFee),
            r.Status
          ];

        }


        else if (type === "batches") {

          values = [
            r.BatchName,
            r.Course,
            r.StartTime,
            r.EndTime,
            r.Teacher,
            r.Room,
            r.MaxStudents,
            r.Status
          ];

        }


        return `
          <tr>
            ${values.map(
              v =>
                `<td>${esc(v)}</td>`
            ).join("")}
          </tr>
        `;

      }
    )
    .join("");


  document.getElementById(
    "reportSummary"
  ).innerHTML = `

    <div class="summary-box">

      <span>Total Records</span>

      <strong>
        ${rows.length}
      </strong>

    </div>

    ${
      (
        type === "studentFees" ||
        type === "staffFees" ||
        type === "expenses"
      )
      ?
      `
      <div class="summary-box">

        <span>Total Amount</span>

        <strong>
          ${money(
            rows.reduce(
              (a,b) =>
                a +
                Number(
                  b.Amount || 0
                ),
              0
            )
          )}
        </strong>

      </div>
      `
      :
      ""
    }

  `;

}


/* =========================================================
   PRINT REPORT
========================================================= */

function printReport() {

  const head =
    document.getElementById(
      "reportHead"
    ).innerHTML;


  const body =
    document.getElementById(
      "reportBody"
    ).innerHTML;


  printHTML(
    "Management Report",
    head,
    body
  );

}


/* =========================================================
   PRINT STUDENTS
========================================================= */

function printStudents() {

  const head = `

    <tr>

      <th>Reg. No</th>
      <th>Student</th>
      <th>Father</th>
      <th>Mobile</th>
      <th>Course</th>
      <th>Batch</th>
      <th>Monthly Fee</th>
      <th>Status</th>

    </tr>

  `;


  const body =
    DATA.students.map(
      s => `

      <tr>

        <td>${esc(s.RegistrationNo)}</td>
        <td>${esc(s.StudentName)}</td>
        <td>${esc(s.FatherName)}</td>
        <td>${esc(s.Mobile)}</td>
        <td>${esc(s.Course)}</td>
        <td>${esc(s.Batch)}</td>
        <td>${money(s.MonthlyFee)}</td>
        <td>${esc(s.Status)}</td>

      </tr>

    `
    )
    .join("");


  printHTML(
    "All Students",
    head,
    body
  );

}


/* =========================================================
   PRINT STAFF
========================================================= */

function printStaff() {

  const head = `

    <tr>

      <th>Code</th>
      <th>Name</th>
      <th>Mobile</th>
      <th>Designation</th>
      <th>Salary</th>
      <th>Joining</th>
      <th>Status</th>

    </tr>

  `;


  const body =
    DATA.staff.map(
      s => `

      <tr>

        <td>${esc(s.StaffCode)}</td>
        <td>${esc(s.Name)}</td>
        <td>${esc(s.Mobile)}</td>
        <td>${esc(s.Designation)}</td>
        <td>${money(s.MonthlySalary)}</td>
        <td>${esc(s.JoiningDate)}</td>
        <td>${esc(s.Status)}</td>

      </tr>

    `
    )
    .join("");


  printHTML(
    "All Teachers / Staff",
    head,
    body
  );

}


/* =========================================================
   PRINT FEES
========================================================= */

function printFees() {

  generateReport();


  setTimeout(
    printReport,
    150
  );

}


/* =========================================================
   PRINT EXPENSES
========================================================= */

function printExpenses() {

  const head = `

    <tr>

      <th>Date</th>
      <th>Month</th>
      <th>Year</th>
      <th>Type</th>
      <th>Description</th>
      <th>Amount</th>
      <th>Mode</th>
      <th>Paid To</th>

    </tr>

  `;


  const body =
    DATA.expenses.map(
      e => `

      <tr>

        <td>${esc(e.ExpenseDate)}</td>
        <td>${esc(e.Month)}</td>
        <td>${esc(e.Year)}</td>
        <td>${esc(e.ExpenseType)}</td>
        <td>${esc(e.Description)}</td>
        <td>${money(e.Amount)}</td>
        <td>${esc(e.PaymentMode)}</td>
        <td>${esc(e.PaidTo)}</td>

      </tr>

    `
    )
    .join("");


  printHTML(
    "Office Expenses",
    head,
    body
  );

}


/* =========================================================
   PRINT ATTENDANCE
========================================================= */

function printAttendance() {

  const search =
    getValue(
      "attendanceSearch"
    )
    .toLowerCase();


  const rows =
    DATA.attendance.filter(
      a =>
        (
          a.PersonName +
          " " +
          a.Batch +
          " " +
          a.Status +
          " " +
          a.PersonType +
          " " +
          a.AttendanceDate
        )
        .toLowerCase()
        .includes(search)
    );


  const head = `

    <tr>

      <th>Type</th>
      <th>Name</th>
      <th>Batch</th>
      <th>Date</th>
      <th>Status</th>
      <th>Remark</th>

    </tr>

  `;


  const body =
    rows.map(
      a => `

      <tr>

        <td>${esc(a.PersonType)}</td>

        <td>${esc(a.PersonName)}</td>

        <td>${esc(a.Batch)}</td>

        <td>
          ${esc(dateOnly(a.AttendanceDate))}
        </td>

        <td>${esc(a.Status)}</td>

        <td>${esc(a.Remark)}</td>

      </tr>

    `
    )
    .join("");


  printHTML(
    "Attendance Report",
    head,
    body
  );

}


/* =========================================================
   PRINT HTML
========================================================= */

function printHTML(
  title,
  head,
  body
) {

  const area =
    document.getElementById(
      "printArea"
    );


  area.innerHTML = `

    <div class="print-title">

      <h1>
        NEW DRISHTI COMPUTER EDUCATION
      </h1>

      <h2>
        ${esc(title)}
      </h2>

      <p>
        Generated:
        ${new Date().toLocaleString("en-IN")}
      </p>

    </div>


    <table class="print-table">

      <thead>
        ${head}
      </thead>

      <tbody>
        ${body}
      </tbody>

    </table>

  `;


  window.print();

}


/* =========================================================
   PIN
========================================================= */

document
  .getElementById("pinForm")
  .addEventListener(
    "submit",
    async function(e) {

      e.preventDefault();


      const oldPin =
        getValue("oldPin");


      const newPin =
        getValue("newPin");


      const confirmPin =
        getValue("confirmPin");


      if (
        newPin !== confirmPin
      ) {

        alert(
          "New PIN and Confirm PIN same nahi hain."
        );

        return;

      }


      const result =
        await api(
          "changePin",
          {
            oldPin:oldPin,
            newPin:newPin
          }
        );


      alert(
        result.message
      );


      if (result.success)
        this.reset();

    }
  );


/* =========================================================
   THEMES
========================================================= */

function setTheme(theme) {

  document.body.dataset.theme =
    theme;


  localStorage.setItem(
    "NDCE_THEME",
    theme
  );

}


function loadTheme() {

  const theme =
    localStorage.getItem(
      "NDCE_THEME"
    ) || "default";


  document.body.dataset.theme =
    theme;

}


/* =========================================================
   DIGITAL CLOCK
========================================================= */

function updateClock() {

  const now =
    new Date();


  const time =
    now.toLocaleTimeString(
      "en-IN",
      {
        hour:"2-digit",
        minute:"2-digit",
        second:"2-digit"
      }
    );


  const date =
    now.toLocaleDateString(
      "en-IN",
      {
        weekday:"long",
        day:"2-digit",
        month:"long",
        year:"numeric"
      }
    );


  setText(
    "clock",
    time
  );


  setText(
    "date",
    date
  );

}


setInterval(
  updateClock,
  1000
);


/* =========================================================
   INITIAL LOAD
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    loadTheme();

    updateClock();


    const existing =
      sessionStorage.getItem(
        "NDCE_SESSION"
      );


    if (existing) {

      TOKEN =
        existing;


      document
        .getElementById(
          "loginScreen"
        )
        .classList.add("hidden");


      document
        .getElementById(
          "app"
        )
        .classList.remove("hidden");


      loadData();

    }

  }
);