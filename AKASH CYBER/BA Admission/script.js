/* =========================================================
   AKASH CYBER
   BA FEE & ACCOUNTING MANAGEMENT SYSTEM

   UPDATED II / III YEAR FORMULA

   Deposit Amount =
   Year Fees - Charge

   Actual Deposit Amount =
   Amount actually deposited

   Refundable Amount =
   Deposit Amount - Actual Deposit Amount

   Total Collection =
   Deposit Amount

   Net Profit =
   Total Charges

   Expense is separate.
========================================================= */


/* =========================================================
   GOOGLE APPS SCRIPT URL
========================================================= */

const GOOGLE_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbyz7aHpT658unFNSRkltKI39pRTPVm59Zn4e7C4jSA1vCPY8-qMMuDZ6Mjhu8ONKPtNDg/exec";


/* =========================================================
   GLOBAL
========================================================= */

let allRecords = [];


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateClock();

        setInterval(
            updateClock,
            1000
        );

        setTodayDate();

        setDefaultExpenseDate();

        calculateFirstRegistration();

        calculateCounseling();

        calculateOtherYear();

        loadRecords();

    }
);


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    const now = new Date();

    const time =
        now.toLocaleTimeString(
            "en-IN",
            {
                hour12: true
            }
        );

    const day =
        now.toLocaleDateString(
            "en-IN",
            {
                weekday: "long"
            }
        );

    const date =
        now.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    setText(
        "liveTime",
        time
    );

    setText(
        "liveDay",
        day
    );

    setText(
        "liveDate",
        date
    );

}


/* =========================================================
   DATE
========================================================= */

function getToday() {

    const d = new Date();

    return [

        d.getFullYear(),

        String(
            d.getMonth() + 1
        ).padStart(2, "0"),

        String(
            d.getDate()
        ).padStart(2, "0")

    ].join("-");

}


function setTodayDate() {

    const today = getToday();

    const from =
        document.getElementById(
            "reportFrom"
        );

    const to =
        document.getElementById(
            "reportTo"
        );

    if (from)
        from.value = today;

    if (to)
        to.value = today;

}


function setDefaultExpenseDate() {

    const el =
        document.getElementById(
            "expenseDate"
        );

    if (el)
        el.value = getToday();

}


/* =========================================================
   NAVIGATION
========================================================= */

function showSection(id) {

    document
        .querySelectorAll(
            ".content-section"
        )
        .forEach(
            section =>
                section.classList.remove(
                    "active"
                )
        );

    const section =
        document.getElementById(id);

    if (section)
        section.classList.add("active");

}


/* =========================================================
   THEME
========================================================= */

function changeTheme(theme) {

    document.body.classList.remove(
        "dark-theme"
    );

    const root =
        document.documentElement;


    const themes = {

        default: [
            "#1565c0",
            "#0d47a1"
        ],

        blue: [
            "#1565c0",
            "#0d47a1"
        ],

        green: [
            "#2e7d32",
            "#1b5e20"
        ],

        purple: [
            "#6a1b9a",
            "#4a148c"
        ],

        dark: [
            "#3949ab",
            "#1a237e"
        ]

    };


    const selected =
        themes[theme] ||
        themes.default;


    root.style.setProperty(
        "--primary",
        selected[0]
    );

    root.style.setProperty(
        "--secondary",
        selected[1]
    );


    if (theme === "dark") {

        document.body.classList.add(
            "dark-theme"
        );

    }

}


/* =========================================================
   IST YEAR REGISTRATION
========================================================= */

function calculateFirstRegistration() {

    const fees =
        Number(
            document.getElementById(
                "registrationFees"
            )?.value
        ) || 0;


    const charge =
        Number(
            document.getElementById(
                "registrationCharge"
            )?.value
        ) || 0;


    setInputValue(
        "registrationCollected",
        fees + charge
    );

}


/* =========================================================
   COUNSELING
========================================================= */

function calculateCounseling() {

    const fees =
        Number(
            document.getElementById(
                "firstYearFees"
            )?.value
        ) || 0;


    const charge =
        Number(
            document.getElementById(
                "counselingCharge"
            )?.value
        ) || 0;


    setInputValue(
        "counselingCollected",
        fees + charge
    );

}


/* =========================================================
   II / III YEAR CALCULATION

   Year Fees = 1000
   Charge = 100

   Deposit Amount =
   1000 - 100
   = 900

   Actual Deposit = 850

   Refundable =
   900 - 850
   = 50
========================================================= */

function calculateOtherYear() {

    const fees =
        Number(
            document.getElementById(
                "otherYearFees"
            )?.value
        ) || 0;


    const charge =
        Number(
            document.getElementById(
                "otherCharge"
            )?.value
        ) || 0;


    /*
       Deposit Amount
       = Fees - Charge
    */

    const depositAmount =
        Math.max(
            0,
            fees - charge
        );


    /*
       Actual Deposit
    */

    let actualDeposit =
        Number(
            document.getElementById(
                "otherActualDepositAmount"
            )?.value
        ) || 0;


    /*
       Actual Deposit cannot
       be greater than Deposit
    */

    if (
        actualDeposit >
        depositAmount
    ) {

        actualDeposit =
            depositAmount;

        setInputValue(
            "otherActualDepositAmount",
            actualDeposit
        );

    }


    /*
       Refundable
       = Deposit - Actual Deposit
    */

    const refundable =
        Math.max(
            0,
            depositAmount -
            actualDeposit
        );


    /*
       Collected Amount
       = Deposit Amount
    */

    setInputValue(
        "otherDepositAmount",
        depositAmount
    );


    setInputValue(
        "otherCollected",
        depositAmount
    );


    setInputValue(
        "otherRefundableAmount",
        refundable
    );

}


/* =========================================================
   YEAR FEES
========================================================= */

function loadYearFees() {

    const year =
        document.getElementById(
            "otherYear"
        )?.value;


    /*
       अपनी वास्तविक fees यहां डालें।
    */

    const fees = {

        "1st Year": 0,

        "2nd Year": 0,

        "3rd Year": 0

    };


    setInputValue(
        "otherYearFees",
        fees[year] || 0
    );


    calculateOtherYear();

}


/* =========================================================
   JSONP
========================================================= */

function googleRequest(
    action,
    data = {}
) {

    return new Promise(
        (resolve, reject) => {

            const callbackName =
                "jsonpCallback_" +
                Date.now() +
                "_" +
                Math.floor(
                    Math.random() *
                    100000
                );


            const params =
                new URLSearchParams();


            params.append(
                "action",
                action
            );


            params.append(
                "callback",
                callbackName
            );


            Object.keys(data)
                .forEach(
                    key => {

                        params.append(
                            key,
                            data[key] ?? ""
                        );

                    }
                );


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                GOOGLE_SCRIPT_URL +
                "?" +
                params.toString();


            window[callbackName] =
                function(response) {

                    delete window[
                        callbackName
                    ];

                    script.remove();

                    resolve(response);

                };


            script.onerror =
                function() {

                    delete window[
                        callbackName
                    ];

                    script.remove();

                    reject(
                        new Error(
                            "Google Apps Script connection failed."
                        )
                    );

                };


            document.body.appendChild(
                script
            );

        }
    );

}


/* =========================================================
   SAVE IST REGISTRATION
========================================================= */

async function saveFirstYearRegistration(
    event
) {

    event.preventDefault();

    calculateFirstRegistration();


    const editId =
        document.getElementById(
            "firstEditId"
        ).value;


    const data = {

        id:
            editId ||
            generateId(),

        type:
            "BA Ist Year Registration",

        candidateName:
            getValue(
                "firstCandidateName"
            ),

        fatherName:
            getValue(
                "firstFatherName"
            ),

        village:
            getValue(
                "firstVillageName"
            ),

        year:
            "Registration",

        mobile:
            getValue(
                "firstMobile"
            ),

        fees:
            numberValue(
                "registrationFees"
            ),

        charge:
            numberValue(
                "registrationCharge"
            ),

        collected:
            numberValue(
                "registrationCollected"
            ),

        depositAmount:
            numberValue(
                "registrationCollected"
            ),

        actualDepositAmount:
            numberValue(
                "registrationCollected"
            ),

        refundableAmount:
            0,

        date:
            getToday()

    };


    await saveRecord(data);

    resetFirstRegistration();

}


/* =========================================================
   SAVE COUNSELING
========================================================= */

async function saveCounseling(event) {

    event.preventDefault();

    calculateCounseling();


    const editId =
        document.getElementById(
            "counselingEditId"
        ).value;


    const collected =
        numberValue(
            "counselingCollected"
        );


    const data = {

        id:
            editId ||
            generateId(),

        type:
            "BA Ist Year Counseling",

        candidateName:
            getValue(
                "counselingCandidateName"
            ),

        fatherName:
            getValue(
                "counselingFatherName"
            ),

        village:
            "",

        year:
            "1st Year",

        mobile:
            getValue(
                "counselingMobile"
            ),

        fees:
            numberValue(
                "firstYearFees"
            ),

        charge:
            numberValue(
                "counselingCharge"
            ),

        collected:
            collected,

        depositAmount:
            collected,

        actualDepositAmount:
            collected,

        refundableAmount:
            0,

        date:
            getToday()

    };


    await saveRecord(data);

    resetCounseling();

}


/* =========================================================
   SAVE II / III YEAR
========================================================= */

async function saveOtherYear(event) {

    event.preventDefault();

    calculateOtherYear();


    const editId =
        document.getElementById(
            "otherEditId"
        ).value;


    const data = {

        id:
            editId ||
            generateId(),

        type:
            "BA IInd / IIIrd Year",

        candidateName:
            getValue(
                "otherCandidateName"
            ),

        fatherName:
            getValue(
                "otherFatherName"
            ),

        village:
            getValue(
                "otherVillageName"
            ),

        year:
            getValue(
                "otherYear"
            ),

        mobile:
            getValue(
                "otherMobile"
            ),

        fees:
            numberValue(
                "otherYearFees"
            ),

        charge:
            numberValue(
                "otherCharge"
            ),

        /*
           Deposit Amount =
           Year Fees - Charge
        */

        depositAmount:
            numberValue(
                "otherDepositAmount"
            ),

        /*
           Actual amount deposited
        */

        actualDepositAmount:
            numberValue(
                "otherActualDepositAmount"
            ),

        /*
           Refundable =
           Deposit - Actual Deposit
        */

        refundableAmount:
            numberValue(
                "otherRefundableAmount"
            ),

        /*
           Collection =
           Deposit Amount
        */

        collected:
            numberValue(
                "otherCollected"
            ),

        date:
            getToday()

    };


    await saveRecord(data);

    resetOtherYear();

}


/* =========================================================
   EXPENSE
========================================================= */

async function saveExpense(event) {

    event.preventDefault();


    const editId =
        document.getElementById(
            "expenseEditId"
        ).value;


    const amount =
        numberValue(
            "expenseAmount"
        );


    const data = {

        id:
            editId ||
            generateId(),

        type:
            "Expense",

        candidateName:
            getValue(
                "expenseDescription"
            ),

        fatherName:
            getValue(
                "expenseCategory"
            ),

        village:
            "",

        year:
            "Expense",

        mobile:
            "",

        fees:
            0,

        charge:
            0,

        depositAmount:
            0,

        actualDepositAmount:
            0,

        refundableAmount:
            0,

        collected:
            amount,

        date:
            getValue(
                "expenseDate"
            )

    };


    await saveRecord(data);

    resetExpense();

}


/* =========================================================
   SAVE RECORD
========================================================= */

async function saveRecord(data) {

    showToast(
        "Saving..."
    );


    try {

        const response =
            await googleRequest(
                "save",
                data
            );


        if (
            response &&
            response.success
        ) {

            showToast(
                "Record saved successfully."
            );

            await loadRecords();

        }
        else {

            showToast(
                response?.message ||
                "Save failed."
            );

        }

    }
    catch(error) {

        console.error(error);

        showToast(
            "Unable to connect with Google Sheet."
        );

    }

}


/* =========================================================
   LOAD RECORDS
========================================================= */

async function loadRecords() {

    try {

        const response =
            await googleRequest(
                "getAll"
            );


        if (
            response &&
            response.success
        ) {

            allRecords =
                response.records || [];


            normalizeRecords();

            renderRecords();

            updateDashboard();

            generateReport();

        }

    }
    catch(error) {

        console.error(error);

        showToast(
            "Could not load Google Sheet data."
        );

    }

}


/* =========================================================
   NORMALIZE OLD RECORDS
========================================================= */

function normalizeRecords() {

    allRecords =
        allRecords.map(
            record => {

                record.fees =
                    Number(
                        record.fees || 0
                    );

                record.charge =
                    Number(
                        record.charge || 0
                    );

                record.collected =
                    Number(
                        record.collected || 0
                    );

                record.depositAmount =
                    Number(
                        record.depositAmount ??
                        record.collected ??
                        0
                    );

                record.actualDepositAmount =
                    Number(
                        record.actualDepositAmount ??
                        record.depositAmount ??
                        record.collected ??
                        0
                    );

                record.refundableAmount =
                    Number(
                        record.refundableAmount ??
                        0
                    );

                return record;

            }
        );

}


/* =========================================================
   RENDER RECORDS
========================================================= */

function renderRecords() {

    const tbody =
        document.getElementById(
            "recordsTableBody"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    const search =
        (
            getValue(
                "recordSearch"
            )
        ).toLowerCase();


    const type =
        getValue(
            "recordTypeFilter"
        );


    const date =
        getValue(
            "recordDateFilter"
        );


    const filtered =
        allRecords.filter(
            record => {

                const text =
                    (
                        record.candidateName +
                        " " +
                        record.mobile +
                        " " +
                        record.village +
                        " " +
                        record.fatherName
                    ).toLowerCase();


                if (
                    search &&
                    !text.includes(search)
                )
                    return false;


                if (
                    type &&
                    record.type !== type
                )
                    return false;


                if (
                    date &&
                    record.date !== date
                )
                    return false;


                return true;

            }
        );


    filtered.forEach(
        record => {

            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${escapeHtml(record.date)}
                </td>

                <td>
                    ${escapeHtml(record.type)}
                </td>

                <td>
                    ${escapeHtml(record.candidateName)}
                </td>

                <td>
                    ${escapeHtml(record.fatherName)}
                </td>

                <td>
                    ${escapeHtml(record.village)}
                </td>

                <td>
                    ${escapeHtml(record.year)}
                </td>

                <td>
                    ${escapeHtml(record.mobile)}
                </td>

                <td>
                    ₹${money(record.fees)}
                </td>

                <td>
                    <strong>
                        ₹${money(record.charge)}
                    </strong>
                </td>

                <td>
                    ₹${money(record.depositAmount)}
                </td>

                <td>
                    ₹${money(record.actualDepositAmount)}
                </td>

                <td>
                    ₹${money(record.refundableAmount)}
                </td>

                <td>
                    ₹${money(record.collected)}
                </td>

                <td>

                    <button
                        class="action-btn edit-btn"
                        onclick="editRecord('${record.id}')">
                        Edit
                    </button>

                    <button
                        class="action-btn delete-btn"
                        onclick="deleteRecord('${record.id}')">
                        Delete
                    </button>

                </td>

            `;


            tbody.appendChild(tr);

        }
    );

}


/* =========================================================
   EDIT RECORD
========================================================= */

function editRecord(id) {

    const record =
        allRecords.find(
            r =>
                String(r.id) ===
                String(id)
        );


    if (!record) {

        showToast(
            "Record not found."
        );

        return;

    }


    if (
        record.type ===
        "BA Ist Year Registration"
    ) {

        showSection(
            "firstYearSection"
        );


        setInputValue(
            "firstEditId",
            record.id
        );

        setInputValue(
            "firstCandidateName",
            record.candidateName
        );

        setInputValue(
            "firstFatherName",
            record.fatherName
        );

        setInputValue(
            "firstVillageName",
            record.village
        );

        setInputValue(
            "firstMobile",
            record.mobile
        );

        setInputValue(
            "registrationFees",
            record.fees
        );

        setInputValue(
            "registrationCharge",
            record.charge
        );

        calculateFirstRegistration();

    }


    else if (
        record.type ===
        "BA Ist Year Counseling"
    ) {

        showSection(
            "firstYearSection"
        );


        setInputValue(
            "counselingEditId",
            record.id
        );

        setInputValue(
            "counselingCandidateName",
            record.candidateName
        );

        setInputValue(
            "counselingFatherName",
            record.fatherName
        );

        setInputValue(
            "counselingMobile",
            record.mobile
        );

        setInputValue(
            "firstYearFees",
            record.fees
        );

        setInputValue(
            "counselingCharge",
            record.charge
        );

        calculateCounseling();

    }


    else if (
        record.type ===
        "BA IInd / IIIrd Year"
    ) {

        showSection(
            "otherYearSection"
        );


        setInputValue(
            "otherEditId",
            record.id
        );

        setInputValue(
            "otherCandidateName",
            record.candidateName
        );

        setInputValue(
            "otherFatherName",
            record.fatherName
        );

        setInputValue(
            "otherVillageName",
            record.village
        );

        setInputValue(
            "otherMobile",
            record.mobile
        );

        setInputValue(
            "otherYear",
            record.year
        );

        setInputValue(
            "otherYearFees",
            record.fees
        );

        setInputValue(
            "otherCharge",
            record.charge
        );

        setInputValue(
            "otherActualDepositAmount",
            record.actualDepositAmount
        );

        calculateOtherYear();

    }


    else if (
        record.type ===
        "Expense"
    ) {

        showSection(
            "expenseSection"
        );


        setInputValue(
            "expenseEditId",
            record.id
        );

        setInputValue(
            "expenseDate",
            record.date
        );

        setInputValue(
            "expenseCategory",
            record.fatherName
        );

        setInputValue(
            "expenseDescription",
            record.candidateName
        );

        setInputValue(
            "expenseAmount",
            record.collected
        );

    }

}


/* =========================================================
   DELETE
========================================================= */

async function deleteRecord(id) {

    const record =
        allRecords.find(
            r =>
                String(r.id) ===
                String(id)
        );


    if (!record)
        return;


    if (
        !confirm(
            "क्या आप यह record delete करना चाहते हैं?"
        )
    )
        return;


    showToast(
        "Deleting..."
    );


    try {

        const response =
            await googleRequest(
                "delete",
                {
                    id: id
                }
            );


        if (
            response &&
            response.success
        ) {

            showToast(
                "Record deleted successfully."
            );

            await loadRecords();

        }
        else {

            showToast(
                response?.message ||
                "Delete failed."
            );

        }

    }
    catch(error) {

        console.error(error);

        showToast(
            "Delete failed."
        );

    }

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const income =
        allRecords.filter(
            r =>
                r.type !== "Expense"
        );


    const expenses =
        allRecords.filter(
            r =>
                r.type === "Expense"
        );


    /*
       TOTAL FEES
    */

    const totalFees =
        sumField(
            income,
            "fees"
        );


    /*
       TOTAL CHARGES
       = NET PROFIT
    */

    const totalCharges =
        sumField(
            income,
            "charge"
        );


    /*
       TOTAL COLLECTION
       = DEPOSIT AMOUNT
    */

    const totalCollection =
        income.reduce(
            (sum, r) =>
                sum +
                Number(
                    r.depositAmount ??
                    r.collected ??
                    0
                ),
            0
        );


    /*
       TOTAL ACTUAL DEPOSIT
    */

    const totalActualDeposit =
        income.reduce(
            (sum, r) =>
                sum +
                Number(
                    r.actualDepositAmount ??
                    r.depositAmount ??
                    r.collected ??
                    0
                ),
            0
        );


    /*
       TOTAL REFUNDABLE
    */

    const totalRefundable =
        income.reduce(
            (sum, r) =>
                sum +
                Number(
                    r.refundableAmount ||
                    0
                ),
            0
        );


    /*
       TOTAL EXPENSE
    */

    const totalExpense =
        sumField(
            expenses,
            "collected"
        );


    setText(
        "totalCollection",
        "₹" +
        money(totalCollection)
    );


    setText(
        "totalFees",
        "₹" +
        money(totalFees)
    );


    setText(
        "totalProfit",
        "₹" +
        money(totalCharges)
    );


    setText(
        "totalExpense",
        "₹" +
        money(totalExpense)
    );


    setText(
        "totalRefundable",
        "₹" +
        money(totalRefundable)
    );


    const today =
        getToday();


    const todayCollection =
        income
            .filter(
                r =>
                    r.date === today
            )
            .reduce(
                (sum, r) =>
                    sum +
                    Number(
                        r.depositAmount ??
                        r.collected ??
                        0
                    ),
                0
            );


    setText(
        "todayCollection",
        "₹" +
        money(todayCollection)
    );


    setText(
        "firstRegistrationCount",

        allRecords.filter(
            r =>
                r.type ===
                "BA Ist Year Registration"
        ).length
    );


    setText(
        "counselingCount",

        allRecords.filter(
            r =>
                r.type ===
                "BA Ist Year Counseling"
        ).length
    );


    setText(
        "otherYearCount",

        allRecords.filter(
            r =>
                r.type ===
                "BA IInd / IIIrd Year"
        ).length
    );

}


/* =========================================================
   REPORT
========================================================= */

function generateReport() {

    const from =
        getValue(
            "reportFrom"
        );

    const to =
        getValue(
            "reportTo"
        );


    if (!from || !to)
        return;


    const records =
        allRecords.filter(
            r =>
                r.date >= from &&
                r.date <= to
        );


    const income =
        records.filter(
            r =>
                r.type !== "Expense"
        );


    const expenses =
        records.filter(
            r =>
                r.type === "Expense"
        );


    const totalFees =
        sumField(
            income,
            "fees"
        );


    const totalCharges =
        sumField(
            income,
            "charge"
        );


    const totalCollection =
        income.reduce(
            (sum, r) =>
                sum +
                Number(
                    r.depositAmount ??
                    r.collected ??
                    0
                ),
            0
        );


    const totalExpense =
        sumField(
            expenses,
            "collected"
        );


    const totalRefundable =
        income.reduce(
            (sum, r) =>
                sum +
                Number(
                    r.refundableAmount ||
                    0
                ),
            0
        );


    setText(
        "reportStudents",
        income.length
    );


    setText(
        "reportFees",
        "₹" +
        money(totalFees)
    );


    setText(
        "reportCollection",
        "₹" +
        money(totalCollection)
    );


    setText(
        "reportExpense",
        "₹" +
        money(totalExpense)
    );


    setText(
        "reportProfit",
        "₹" +
        money(totalCharges)
    );


    setText(
        "reportRefundable",
        "₹" +
        money(totalRefundable)
    );


    buildDailyReport(
        records
    );


    buildYearReport(
        records
    );

}


/* =========================================================
   DAILY REPORT
========================================================= */

function buildDailyReport(records) {

    const body =
        document.getElementById(
            "dailyReportBody"
        );


    if (!body)
        return;


    body.innerHTML = "";


    const dates =
        [
            ...new Set(
                records.map(
                    r => r.date
                )
            )
        ].sort();


    dates.forEach(
        date => {

            const registration =
                records.filter(
                    r =>
                        r.date === date &&
                        r.type ===
                        "BA Ist Year Registration"
                );


            const counseling =
                records.filter(
                    r =>
                        r.date === date &&
                        r.type ===
                        "BA Ist Year Counseling"
                );


            const other =
                records.filter(
                    r =>
                        r.date === date &&
                        r.type ===
                        "BA IInd / IIIrd Year"
                );


            const expenses =
                records.filter(
                    r =>
                        r.date === date &&
                        r.type === "Expense"
                );


            const registrationCollection =
                sumDeposit(
                    registration
                );


            const counselingCollection =
                sumDeposit(
                    counseling
                );


            const otherCollection =
                sumDeposit(
                    other
                );


            const totalCollection =
                registrationCollection +
                counselingCollection +
                otherCollection;


            const actualDeposit =
                sumActualDeposit(
                    records.filter(
                        r =>
                            r.date === date &&
                            r.type !== "Expense"
                    )
                );


            const refundable =
                sumRefundable(
                    records.filter(
                        r =>
                            r.date === date &&
                            r.type !== "Expense"
                    )
                );


            const expense =
                sumField(
                    expenses,
                    "collected"
                );


            /*
               PROFIT = CHARGES
            */

            const profit =
                sumField(
                    records.filter(
                        r =>
                            r.date === date &&
                            r.type !== "Expense"
                    ),
                    "charge"
                );


            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${escapeHtml(date)}
                </td>

                <td>
                    ₹${money(
                        registrationCollection
                    )}
                </td>

                <td>
                    ₹${money(
                        counselingCollection
                    )}
                </td>

                <td>
                    ₹${money(
                        otherCollection
                    )}
                </td>

                <td>
                    <strong>
                        ₹${money(
                            totalCollection
                        )}
                    </strong>
                </td>

                <td>
                    ₹${money(
                        actualDeposit
                    )}
                </td>

                <td>
                    ₹${money(
                        refundable
                    )}
                </td>

                <td>
                    ₹${money(
                        expense
                    )}
                </td>

                <td>
                    <strong>
                        ₹${money(
                            profit
                        )}
                    </strong>
                </td>

            `;


            body.appendChild(tr);

        }
    );

}


/* =========================================================
   YEAR REPORT
========================================================= */

function buildYearReport(records) {

    const body =
        document.getElementById(
            "yearReportBody"
        );


    if (!body)
        return;


    body.innerHTML = "";


    const years = [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ];


    years.forEach(
        year => {

            const list =
                records.filter(
                    r =>
                        r.year === year &&
                        r.type !== "Expense"
                );


            const fees =
                sumField(
                    list,
                    "fees"
                );


            const charges =
                sumField(
                    list,
                    "charge"
                );


            const deposit =
                sumDeposit(
                    list
                );


            const actual =
                sumActualDeposit(
                    list
                );


            const refundable =
                sumRefundable(
                    list
                );


            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${escapeHtml(year)}
                </td>

                <td>
                    ${list.length}
                </td>

                <td>
                    ₹${money(fees)}
                </td>

                <td>
                    <strong>
                        ₹${money(charges)}
                    </strong>
                </td>

                <td>
                    ₹${money(deposit)}
                </td>

                <td>
                    ₹${money(actual)}
                </td>

                <td>
                    ₹${money(refundable)}
                </td>

            `;


            body.appendChild(tr);

        }
    );

}


/* =========================================================
   TODAY REPORT
========================================================= */

function todayReport() {

    const today =
        getToday();


    setInputValue(
        "reportFrom",
        today
    );


    setInputValue(
        "reportTo",
        today
    );


    generateReport();

}


/* =========================================================
   MONTH REPORT
========================================================= */

function monthReport() {

    const now =
        new Date();


    const first =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );


    const from =
        [
            first.getFullYear(),

            String(
                first.getMonth() + 1
            ).padStart(2, "0"),

            "01"

        ].join("-");


    setInputValue(
        "reportFrom",
        from
    );


    setInputValue(
        "reportTo",
        getToday()
    );


    generateReport();

}


/* =========================================================
   RESET
========================================================= */

function resetFirstRegistration() {

    document
        .getElementById(
            "firstYearRegistrationForm"
        )
        ?.reset();


    setInputValue(
        "firstEditId",
        ""
    );


    calculateFirstRegistration();

}


function resetCounseling() {

    document
        .getElementById(
            "counselingForm"
        )
        ?.reset();


    setInputValue(
        "counselingEditId",
        ""
    );


    calculateCounseling();

}


function resetOtherYear() {

    document
        .getElementById(
            "otherYearForm"
        )
        ?.reset();


    setInputValue(
        "otherEditId",
        ""
    );


    calculateOtherYear();

}


function resetExpense() {

    document
        .getElementById(
            "expenseForm"
        )
        ?.reset();


    setInputValue(
        "expenseEditId",
        ""
    );


    setDefaultExpenseDate();

}


/* =========================================================
   CLEAR FILTERS
========================================================= */

function clearRecordFilters() {

    setInputValue(
        "recordSearch",
        ""
    );

    setInputValue(
        "recordTypeFilter",
        ""
    );

    setInputValue(
        "recordDateFilter",
        ""
    );


    renderRecords();

}


/* =========================================================
   PRINT IST REGISTRATION
========================================================= */

function printCurrentFirstRegistration() {

    printHTML(`

        <h1>AKASH CYBER</h1>

        <h2>BA Ist Year Registration Receipt</h2>

        <hr>

        <p>
            <b>Date:</b>
            ${getToday()}
        </p>

        <p>
            <b>Candidate:</b>
            ${escapeHtml(
                getValue(
                    "firstCandidateName"
                )
            )}
        </p>

        <p>
            <b>Father Name:</b>
            ${escapeHtml(
                getValue(
                    "firstFatherName"
                )
            )}
        </p>

        <p>
            <b>Village:</b>
            ${escapeHtml(
                getValue(
                    "firstVillageName"
                )
            )}
        </p>

        <p>
            <b>Mobile:</b>
            ${escapeHtml(
                getValue(
                    "firstMobile"
                )
            )}
        </p>

        <p>
            Registration Fees:
            ₹${money(
                numberValue(
                    "registrationFees"
                )
            )}
        </p>

        <p>
            Charge:
            ₹${money(
                numberValue(
                    "registrationCharge"
                )
            )}
        </p>

        <h3>
            Collected Amount:
            ₹${money(
                numberValue(
                    "registrationCollected"
                )
            )}
        </h3>

        <hr>

        <p>Thank You</p>

    `);

}


/* =========================================================
   PRINT II / III YEAR
========================================================= */

function printCurrentOtherYear() {

    printHTML(`

        <h1>AKASH CYBER</h1>

        <h2>
            BA IInd / IIIrd Year Receipt
        </h2>

        <hr>

        <p>
            <b>Date:</b>
            ${getToday()}
        </p>

        <p>
            <b>Candidate:</b>
            ${escapeHtml(
                getValue(
                    "otherCandidateName"
                )
            )}
        </p>

        <p>
            <b>Father Name:</b>
            ${escapeHtml(
                getValue(
                    "otherFatherName"
                )
            )}
        </p>

        <p>
            <b>Village:</b>
            ${escapeHtml(
                getValue(
                    "otherVillageName"
                )
            )}
        </p>

        <p>
            <b>Year:</b>
            ${escapeHtml(
                getValue(
                    "otherYear"
                )
            )}
        </p>

        <p>
            <b>Mobile:</b>
            ${escapeHtml(
                getValue(
                    "otherMobile"
                )
            )}
        </p>

        <hr>

        <p>
            Year Fees:
            ₹${money(
                numberValue(
                    "otherYearFees"
                )
            )}
        </p>

        <p>
            Charge / Profit:
            ₹${money(
                numberValue(
                    "otherCharge"
                )
            )}
        </p>

        <p>
            <b>Deposit Amount:</b>
            ₹${money(
                numberValue(
                    "otherDepositAmount"
                )
            )}
        </p>

        <p>
            Actual Deposit Amount:
            ₹${money(
                numberValue(
                    "otherActualDepositAmount"
                )
            )}
        </p>

        <p>
            <b>Refundable Amount:</b>
            ₹${money(
                numberValue(
                    "otherRefundableAmount"
                )
            )}
        </p>

        <h3>
            Collected Amount:
            ₹${money(
                numberValue(
                    "otherCollected"
                )
            )}
        </h3>

        <hr>

        <p>
            Net Profit / Charge:
            ₹${money(
                numberValue(
                    "otherCharge"
                )
            )}
        </p>

    `);

}


/* =========================================================
   PRINT ALL RECORDS
========================================================= */

function printRecords() {

    let html = `

        <h1>AKASH CYBER</h1>

        <h2>BA Fee Records</h2>

        <table>

            <tr>

                <th>Date</th>
                <th>Type</th>
                <th>Name</th>
                <th>Year</th>
                <th>Mobile</th>
                <th>Fees</th>
                <th>Charge</th>
                <th>Deposit</th>
                <th>Actual Deposit</th>
                <th>Refundable</th>
                <th>Collection</th>

            </tr>

    `;


    allRecords.forEach(
        r => {

            html += `

                <tr>

                    <td>
                        ${escapeHtml(r.date)}
                    </td>

                    <td>
                        ${escapeHtml(r.type)}
                    </td>

                    <td>
                        ${escapeHtml(
                            r.candidateName
                        )}
                    </td>

                    <td>
                        ${escapeHtml(r.year)}
                    </td>

                    <td>
                        ${escapeHtml(r.mobile)}
                    </td>

                    <td>
                        ₹${money(r.fees)}
                    </td>

                    <td>
                        ₹${money(r.charge)}
                    </td>

                    <td>
                        ₹${money(
                            r.depositAmount
                        )}
                    </td>

                    <td>
                        ₹${money(
                            r.actualDepositAmount
                        )}
                    </td>

                    <td>
                        ₹${money(
                            r.refundableAmount
                        )}
                    </td>

                    <td>
                        ₹${money(r.collected)}
                    </td>

                </tr>

            `;

        }
    );


    html += `
        </table>
    `;


    printHTML(html);

}


/* =========================================================
   PRINT REPORT
========================================================= */

function printReport() {

    const dailyTable =
        document.getElementById(
            "dailyReportBody"
        )?.parentElement
        ?.outerHTML || "";


    const yearTable =
        document.getElementById(
            "yearReportBody"
        )?.parentElement
        ?.outerHTML || "";


    printHTML(`

        <h1>AKASH CYBER</h1>

        <h2>
            BA Accounting Report
        </h2>

        <p>
            Report Period:
            <b>
                ${getValue("reportFrom")}
            </b>
            to
            <b>
                ${getValue("reportTo")}
            </b>
        </p>

        <hr>

        <h3>
            Total Students:
            ${getValue("reportStudents")}
        </h3>

        <h3>
            Total Fees:
            ${getValue("reportFees")}
        </h3>

        <h3>
            Total Collection:
            ${getValue("reportCollection")}
        </h3>

        <h3>
            Total Expense:
            ${getValue("reportExpense")}
        </h3>

        <h3>
            Total Charges / Net Profit:
            ${getValue("reportProfit")}
        </h3>

        <h3>
            Total Refundable Amount:
            ${getValue("reportRefundable")}
        </h3>

        <hr>

        <p>
            <b>
                Deposit Amount = Year Fees - Charge
            </b>
        </p>

        <p>
            <b>
                Refundable Amount =
                Deposit Amount - Actual Deposit Amount
            </b>
        </p>

        <p>
            <b>
                Net Profit = Total Charges
            </b>
        </p>

        <hr>

        <h3>Day-wise Summary</h3>

        ${dailyTable}

        <br>

        <h3>Year-wise Summary</h3>

        ${yearTable}

    `);

}


/* =========================================================
   PRINT HTML
========================================================= */

function printHTML(content) {

    const win =
        window.open(
            "",
            "_blank"
        );


    if (!win) {

        alert(
            "Please allow pop-ups for printing."
        );

        return;

    }


    win.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                AKASH CYBER
            </title>

            <style>

                body {

                    font-family:
                        Arial,
                        sans-serif;

                    padding: 30px;

                    color: #111;

                }

                h1,
                h2 {

                    text-align: center;

                }

                table {

                    border-collapse:
                        collapse;

                    width: 100%;

                    margin-top: 20px;

                }

                th,
                td {

                    border:
                        1px solid #777;

                    padding: 7px;

                }

                th {

                    background: #eee;

                }

            </style>

        </head>

        <body>

            ${content}

        </body>

        </html>

    `);


    win.document.close();

    win.focus();


    setTimeout(
        () => win.print(),
        300
    );

}


/* =========================================================
   HELPERS
========================================================= */

function generateId() {

    return Date.now() +
        "_" +
        Math.floor(
            Math.random() *
            100000
        );

}


function money(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 2
        }
    );

}


function numberValue(id) {

    return Number(
        document.getElementById(
            id
        )?.value
    ) || 0;

}


function getValue(id) {

    return (
        document.getElementById(
            id
        )?.value || ""
    );

}


function setInputValue(
    id,
    value
) {

    const el =
        document.getElementById(id);

    if (el)
        el.value = value;

}


function setText(
    id,
    value
) {

    const el =
        document.getElementById(id);

    if (el)
        el.textContent = value;

}


function sumField(
    records,
    field
) {

    return records.reduce(
        (sum, r) =>
            sum +
            Number(
                r[field] || 0
            ),
        0
    );

}


function sumDeposit(records) {

    return records.reduce(
        (sum, r) =>
            sum +
            Number(
                r.depositAmount ??
                r.collected ??
                0
            ),
        0
    );

}


function sumActualDeposit(records) {

    return records.reduce(
        (sum, r) =>
            sum +
            Number(
                r.actualDepositAmount ??
                r.depositAmount ??
                r.collected ??
                0
            ),
        0
    );

}


function sumRefundable(records) {

    return records.reduce(
        (sum, r) =>
            sum +
            Number(
                r.refundableAmount ||
                0
            ),
        0
    );

}


function escapeHtml(value) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast)
        return;


    toast.textContent =
        message;


    toast.style.display =
        "block";


    clearTimeout(
        window.toastTimer
    );


    window.toastTimer =
        setTimeout(
            () => {

                toast.style.display =
                    "none";

            },
            2500
        );

}