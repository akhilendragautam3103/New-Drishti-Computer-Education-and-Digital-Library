/* =========================================================
   NEW DRISHTI DIGITAL LIBRARY MANAGEMENT SYSTEM
   COMPLETE & FIXED SCRIPT.JS

   FEATURES
   ---------------------------------------------------------
   1. Unlimited Seats
   2. Initial 50 Seats
   3. 1st Shift / 2nd Shift / Full Shift
   4. VACANT / PARTIAL / FULL
   5. Student Management
   6. Fees Management
   7. Seat Management
   8. Shift Wise Students
   9. Dashboard
   10. Reports
   11. CSV Export
   12. Print Reports
   13. LocalStorage Backup
   14. Google Apps Script API
   15. Full Shift Conflict Protection
   16. Duplicate Shift Protection
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const GAS_API_URL =
"https://script.google.com/macros/s/AKfycbwiOywF3tKpCYmirbpiHxuiuj92VGxCMbuY3vTXMiiABChleqNIeTXgcsV5pU2ZhYkr/exec";

const LOCAL_STUDENT_KEY = "NDCE_LIBRARY_STUDENTS";
const LOCAL_SEAT_KEY    = "NDCE_LIBRARY_SEATS";
const LOCAL_FEE_KEY     = "NDCE_LIBRARY_FEES";


/* =========================================================
   GLOBAL DATA
========================================================= */

let students = [];
let seats = [];
let fees = [];

let currentDetailId = null;
let currentFeeStudentId = null;

let isOnline = false;


/* =========================================================
   SHIFT CONSTANTS
========================================================= */

const SHIFTS = [
    "1st Shift",
    "2nd Shift",
    "Full Shift"
];


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    setDefaultDates();

    loadLocalData();

    initializeDefaultSeats();

    updateClock();

    setInterval(updateClock, 1000);

    loadAllData();

});


/* =========================================================
   DEFAULT DATE
========================================================= */

function setDefaultDates() {

    const today = getTodayDate();

    const admissionDate =
        document.getElementById("admissionDate");

    const paymentDate =
        document.getElementById("paymentDate");

    const feeMonth =
        document.getElementById("feeMonth");


    if (admissionDate && !admissionDate.value) {
        admissionDate.value = today;
    }

    if (paymentDate && !paymentDate.value) {
        paymentDate.value = today;
    }

    if (feeMonth && !feeMonth.value) {
        feeMonth.value = today.substring(0, 7);
    }
}


/* =========================================================
   DATE HELPERS
========================================================= */

function getTodayDate() {

    const d = new Date();

    const year =
        d.getFullYear();

    const month =
        String(d.getMonth() + 1).padStart(2, "0");

    const day =
        String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(dateValue) {

    if (!dateValue) {
        return "";
    }

    const d = new Date(dateValue);

    if (isNaN(d.getTime())) {
        return String(dateValue);
    }

    return d.toLocaleDateString("en-IN");
}


function formatCurrency(value) {

    const number =
        Number(value || 0);

    return "₹" +
        number.toLocaleString("en-IN");
}


/* =========================================================
   LIVE CLOCK
========================================================= */

function updateClock() {

    const now = new Date();

    const time =
        now.toLocaleTimeString(
            "en-IN",
            {
                hour12: false
            }
        );

    const date =
        now.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );


    const liveTime =
        document.getElementById("liveTime");

    const currentDate =
        document.getElementById("currentDate");


    if (liveTime) {
        liveTime.textContent = time;
    }

    if (currentDate) {
        currentDate.textContent = date;
    }
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadLocalData() {

    try {

        students =
            JSON.parse(
                localStorage.getItem(
                    LOCAL_STUDENT_KEY
                )
            ) || [];


        seats =
            JSON.parse(
                localStorage.getItem(
                    LOCAL_SEAT_KEY
                )
            ) || [];


        fees =
            JSON.parse(
                localStorage.getItem(
                    LOCAL_FEE_KEY
                )
            ) || [];


        students =
            normalizeStudents(students);

        seats =
            normalizeSeats(seats);

        fees =
            normalizeFees(fees);


    } catch (error) {

        console.error(
            "Local data load error:",
            error
        );

        students = [];
        seats = [];
        fees = [];
    }
}


/* =========================================================
   SAVE LOCAL DATA
========================================================= */

function saveLocalData() {

    try {

        localStorage.setItem(
            LOCAL_STUDENT_KEY,
            JSON.stringify(students)
        );

        localStorage.setItem(
            LOCAL_SEAT_KEY,
            JSON.stringify(seats)
        );

        localStorage.setItem(
            LOCAL_FEE_KEY,
            JSON.stringify(fees)
        );

    } catch (error) {

        console.error(
            "Local data save error:",
            error
        );
    }
}


/* =========================================================
   DEFAULT 50 SEATS
========================================================= */

function initializeDefaultSeats() {

    if (seats.length > 0) {
        return;
    }


    for (let i = 1; i <= 50; i++) {

        seats.push({

            seatNo: String(i),

            createdAt:
                new Date().toISOString()

        });
    }


    sortSeats();

    saveLocalData();
}


/* =========================================================
   SEAT SORTING
========================================================= */

function sortSeats() {

    seats.sort(function (a, b) {

        const aNo =
            String(a.seatNo);

        const bNo =
            String(b.seatNo);


        const aNum =
            Number(aNo);

        const bNum =
            Number(bNo);


        if (
            !isNaN(aNum) &&
            !isNaN(bNum)
        ) {

            return aNum - bNum;
        }


        return aNo.localeCompare(
            bNo,
            undefined,
            {
                numeric: true,
                sensitivity: "base"
            }
        );

    });
}


/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest(
    action,
    payload = {}
) {

    if (
        !GAS_API_URL ||
        GAS_API_URL.includes(
            "YOUR_GAS_WEB_APP_URL"
        )
    ) {

        throw new Error(
            "GAS_API_URL configure नहीं किया गया है।"
        );
    }


    const body = {

        action: action,

        ...payload

    };


    const response =
        await fetch(
            GAS_API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body:
                    JSON.stringify(body)
            }
        );


    if (!response.ok) {

        throw new Error(
            "Server error: " +
            response.status
        );
    }


    const text =
        await response.text();


    let result;


    try {

        result =
            JSON.parse(text);

    } catch (error) {

        console.error(
            "Invalid API response:",
            text
        );

        throw new Error(
            "Invalid server response."
        );
    }


    if (
        result &&
        result.success === false
    ) {

        throw new Error(
            result.message ||
            "API request failed."
        );
    }


    return result;
}


/* =========================================================
   LOAD ALL DATA
========================================================= */

async function loadAllData() {

    setSystemStatus(
        "Connecting...",
        false
    );


    try {

        const result =
            await apiRequest(
                "getAllData"
            );


        if (
            result &&
            Array.isArray(
                result.students
            )
        ) {

            students =
                normalizeStudents(
                    result.students
                );
        }


        if (
            result &&
            Array.isArray(
                result.seats
            )
        ) {

            seats =
                normalizeSeats(
                    result.seats
                );
        }


        if (
            result &&
            Array.isArray(
                result.fees
            )
        ) {

            fees =
                normalizeFees(
                    result.fees
                );
        }


        if (!seats.length) {

            initializeDefaultSeats();
        }


        sortSeats();

        saveLocalData();


        isOnline = true;


        setSystemStatus(
            "Connected",
            true
        );


        refreshEverything();


    } catch (error) {

        console.warn(
            "Google Sheet load failed:",
            error
        );


        isOnline = false;


        setSystemStatus(
            "Offline / Local Data",
            false
        );


        refreshEverything();
    }
}


/* =========================================================
   NORMALIZE STUDENTS
========================================================= */

function normalizeStudents(data) {

    if (!Array.isArray(data)) {
        return [];
    }


    return data.map(
        function (s, index) {

            const studentId =
                s.id ||
                s.studentId ||
                (
                    "STU-" +
                    Date.now() +
                    "-" +
                    index
                );


            return {

                id:
                    String(studentId),


                seatNo:
                    String(
                        s.seatNo ??
                        s.seat ??
                        ""
                    ),


                name:
                    s.name ||
                    s.studentName ||
                    "",


                fatherName:
                    s.fatherName ||
                    "",


                rollNumber:
                    s.rollNumber ||
                    s.roll ||
                    "",


                mobile:
                    s.mobile ||
                    "",


                alternateMobile:
                    s.alternateMobile ||
                    "",


                shift:
                    s.shift ||
                    "",


                admissionDate:
                    s.admissionDate ||
                    getTodayDate(),


                totalFees:
                    Number(
                        s.totalFees ??
                        s.total ??
                        0
                    ),


                paidFees:
                    Number(
                        s.paidFees ??
                        s.paid ??
                        0
                    ),


                address:
                    s.address ||
                    "",


                remark:
                    s.remark ||
                    "",


                status:
                    s.status ||
                    "Active",


                createdAt:
                    s.createdAt ||
                    new Date().toISOString(),


                updatedAt:
                    s.updatedAt ||
                    new Date().toISOString()

            };

        }
    );
}


/* =========================================================
   NORMALIZE SEATS
========================================================= */

function normalizeSeats(data) {

    if (!Array.isArray(data)) {
        return [];
    }


    return data
        .map(function (s) {

            const number =
                s.seatNo ??
                s.seat ??
                s.number;


            if (
                number === undefined ||
                number === null ||
                number === ""
            ) {

                return null;
            }


            return {

                seatNo:
                    String(number),


                createdAt:
                    s.createdAt ||
                    new Date().toISOString()

            };

        })
        .filter(Boolean);
}


/* =========================================================
   NORMALIZE FEES
========================================================= */

function normalizeFees(data) {

    if (!Array.isArray(data)) {
        return [];
    }


    return data.map(
        function (f, index) {

            return {

                id:
                    f.id ||
                    f.feeId ||
                    (
                        "FEE-" +
                        Date.now() +
                        "-" +
                        index
                    ),


                studentId:
                    f.studentId ||
                    "",


                seatNo:
                    String(
                        f.seatNo ??
                        f.seat ??
                        ""
                    ),


                month:
                    f.month ||
                    "",


                amount:
                    Number(
                        f.amount ||
                        0
                    ),


                paymentMode:
                    f.paymentMode ||
                    "Cash",


                paymentDate:
                    f.paymentDate ||
                    getTodayDate(),


                remark:
                    f.remark ||
                    "",


                createdAt:
                    f.createdAt ||
                    new Date().toISOString()

            };

        }
    );
}


/* =========================================================
   REFRESH EVERYTHING
========================================================= */

function refreshEverything() {

    sortSeats();

    renderDashboard();

    renderStudentPage();

    renderFeesPage();

    renderSeatManagement();

    renderShiftStudents();

    updateStatistics();

    updateReports();

    populateSeatDropdown();

}


/* =========================================================
   SYSTEM STATUS
========================================================= */

function setSystemStatus(
    text,
    connected
) {

    const status =
        document.getElementById(
            "systemStatus"
        );

    const dot =
        document.getElementById(
            "statusDot"
        );


    if (status) {

        status.textContent =
            text;
    }


    if (dot) {

        dot.style.background =
            connected
                ? "#16a34a"
                : "#f59e0b";
    }
}


/* =========================================================
   NAVIGATION
========================================================= */

function showSection(
    sectionId,
    button
) {

    document
        .querySelectorAll(
            ".page-section"
        )
        .forEach(function (section) {

            section.classList.remove(
                "active-section"
            );

        });


    const target =
        document.getElementById(
            sectionId
        );


    if (target) {

        target.classList.add(
            "active-section"
        );
    }


    document
        .querySelectorAll(
            ".nav-btn"
        )
        .forEach(function (btn) {

            btn.classList.remove(
                "active"
            );

        });


    if (button) {

        button.classList.add(
            "active"
        );
    }


    refreshEverything();
}


/* =========================================================
   SEAT HELPERS
========================================================= */

function getSeatStudents(seatNo) {

    return students.filter(
        function (student) {

            return (
                String(student.seatNo) ===
                String(seatNo) &&

                student.status !==
                "Inactive"
            );

        }
    );
}


/* =========================================================
   GET STUDENT FOR PARTICULAR SLOT
========================================================= */

function getStudentForSlot(
    seatNo,
    shift
) {

    return students.find(
        function (student) {

            return (

                String(student.seatNo) ===
                String(seatNo) &&

                student.shift === shift &&

                student.status !==
                "Inactive"

            );

        }
    );
}


/* =========================================================
   SEAT STATUS
========================================================= */

function getSeatStatus(seatNo) {

    const list =
        getSeatStudents(seatNo);


    if (list.length === 0) {

        return "VACANT";
    }


    const hasFullShift =
        list.some(
            function (student) {

                return (
                    student.shift ===
                    "Full Shift"
                );

            }
        );


    if (hasFullShift) {

        return "FULL";
    }


    const first =
        list.some(
            function (student) {

                return (
                    student.shift ===
                    "1st Shift"
                );

            }
        );


    const second =
        list.some(
            function (student) {

                return (
                    student.shift ===
                    "2nd Shift"
                );

            }
        );


    if (first && second) {

        return "FULL";
    }


    return "PARTIAL";
}


/* =========================================================
   RENDER DASHBOARD
========================================================= */

function renderDashboard() {

    const grid =
        document.getElementById(
            "seatGrid"
        );


    if (!grid) return;


    const search =
        (
            document.getElementById(
                "mainSearch"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const shiftFilter =
        document.getElementById(
            "shiftFilter"
        )?.value || "ALL";


    const statusFilter =
        document.getElementById(
            "seatStatusFilter"
        )?.value || "ALL";


    const filteredSeats =
        seats.filter(
            function (seat) {

                const seatStatus =
                    getSeatStatus(
                        seat.seatNo
                    );


                if (
                    statusFilter !== "ALL" &&
                    seatStatus !== statusFilter
                ) {

                    return false;
                }


                const seatStudents =
                    getSeatStudents(
                        seat.seatNo
                    );


                if (
                    shiftFilter !== "ALL"
                ) {

                    const hasShift =
                        seatStudents.some(
                            function (student) {

                                return (
                                    student.shift ===
                                    shiftFilter
                                );

                            }
                        );


                    if (!hasShift) {

                        return false;
                    }
                }


                if (search) {

                    const seatMatch =
                        String(
                            seat.seatNo
                        )
                        .toLowerCase()
                        .includes(search);


                    const studentMatch =
                        seatStudents.some(
                            function (student) {

                                return (

                                    String(
                                        student.name ||
                                        ""
                                    )
                                    .toLowerCase()
                                    .includes(search)

                                    ||

                                    String(
                                        student.mobile ||
                                        ""
                                    )
                                    .includes(search)

                                    ||

                                    String(
                                        student.rollNumber ||
                                        ""
                                    )
                                    .toLowerCase()
                                    .includes(search)

                                );

                            }
                        );


                    if (
                        !seatMatch &&
                        !studentMatch
                    ) {

                        return false;
                    }
                }


                return true;
            }
        );


    setText(
        "visibleSeats",
        filteredSeats.length
    );


    grid.innerHTML =
        filteredSeats
            .map(
                createSeatCard
            )
            .join("");


    renderCurrentStudentTable();
}


/* =========================================================
   CREATE SEAT CARD
========================================================= */

function createSeatCard(seat) {

    const seatNo =
        String(seat.seatNo);


    const status =
        getSeatStatus(seatNo);


    const first =
        getStudentForSlot(
            seatNo,
            "1st Shift"
        );


    const second =
        getStudentForSlot(
            seatNo,
            "2nd Shift"
        );


    const full =
        getStudentForSlot(
            seatNo,
            "Full Shift"
        );


    return `

        <div class="seat-card">

            <div class="seat-head">

                <strong>
                    🪑 Seat
                    ${escapeHTML(seatNo)}
                </strong>

                <span class="badge ${getStatusClass(status)}">
                    ${escapeHTML(status)}
                </span>

            </div>


            ${createSlotHTML(
                "1st Shift",
                first,
                seatNo
            )}


            ${createSlotHTML(
                "2nd Shift",
                second,
                seatNo
            )}


            ${createSlotHTML(
                "Full Shift",
                full,
                seatNo
            )}

        </div>

    `;
}


/* =========================================================
   CREATE SLOT HTML
========================================================= */

function createSlotHTML(
    shift,
    student,
    seatNo
) {

    if (!student) {

        return `

            <div
                class="slot vacant"
                onclick="quickAddStudent(
                    '${escapeJS(seatNo)}',
                    '${escapeJS(shift)}'
                )"
            >

                <b>
                    🕐 ${escapeHTML(shift)}
                </b>


                <div class="name">
                    🔴 VACANT
                </div>

            </div>

        `;
    }


    return `

        <div
            class="slot occupied"
            onclick="openStudentDetails(
                '${escapeJS(student.id)}'
            )"
        >

            <b>
                🕐 ${escapeHTML(shift)}
            </b>


            <div class="name">
                👤
                ${escapeHTML(student.name)}
            </div>


            ${
                student.rollNumber
                ?
                `
                    <small>
                        Roll:
                        ${escapeHTML(
                            student.rollNumber
                        )}
                    </small>
                `
                :
                ""
            }

        </div>

    `;
}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(status) {

    if (status === "VACANT") {

        return "vac";
    }


    if (status === "FULL") {

        return "full";
    }


    return "partial";
}


/* =========================================================
   CURRENT STUDENT TABLE
========================================================= */

function renderCurrentStudentTable() {

    const tbody =
        document.getElementById(
            "studentTable"
        );


    if (!tbody) return;


    const search =
        (
            document.getElementById(
                "mainSearch"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const list =
        students.filter(
            function (student) {

                if (
                    student.status ===
                    "Inactive"
                ) {

                    return false;
                }


                if (!search) {

                    return true;
                }


                return (

                    String(
                        student.seatNo
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        student.name
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        student.mobile
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        student.rollNumber
                    )
                    .toLowerCase()
                    .includes(search)

                );

            }
        );


    tbody.innerHTML =
        list.map(
            function (student) {

                const pending =
                    getPendingFees(
                        student
                    );


                return `

                    <tr>

                        <td>
                            <b>
                                ${escapeHTML(
                                    student.seatNo
                                )}
                            </b>
                        </td>


                        <td>
                            ${escapeHTML(
                                student.name
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                student.rollNumber ||
                                "-"
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                student.mobile ||
                                "-"
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                student.shift
                            )}
                        </td>


                        <td>
                            ${formatDate(
                                student.admissionDate
                            )}
                        </td>


                        <td>
                            ${formatCurrency(
                                pending
                            )}
                        </td>


                        <td>

                            <button
                                class="btn blue"
                                onclick="openStudentDetails(
                                    '${escapeJS(student.id)}'
                                )"
                            >
                                View
                            </button>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");
}


/* =========================================================
   STUDENT MANAGEMENT PAGE
========================================================= */

function renderStudentPage() {

    const tbody =
        document.getElementById(
            "allStudentTable"
        );


    if (!tbody) return;


    const search =
        (
            document.getElementById(
                "studentSearch"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const list =
        students.filter(
            function (student) {

                if (!search) {

                    return true;
                }


                return (

                    String(
                        student.name
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        student.rollNumber
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        student.mobile
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        student.seatNo
                    )
                    .toLowerCase()
                    .includes(search)

                );

            }
        );


    tbody.innerHTML =
        list.map(
            function (student) {

                const pending =
                    getPendingFees(
                        student
                    );


                return `

                    <tr>

                        <td>
                            ${escapeHTML(
                                student.seatNo
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                student.name
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                student.rollNumber ||
                                "-"
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                student.mobile ||
                                "-"
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                student.shift
                            )}
                        </td>


                        <td>
                            ${formatCurrency(
                                student.totalFees
                            )}
                        </td>


                        <td>
                            ${formatCurrency(
                                getStudentPaidTotal(
                                    student
                                )
                            )}
                        </td>


                        <td>
                            ${formatCurrency(
                                pending
                            )}
                        </td>


                        <td>

                            <span class="badge ${
                                pending > 0
                                ? "partial"
                                : "full"
                            }">

                                ${
                                    pending > 0
                                    ? "Pending"
                                    : "Paid"
                                }

                            </span>

                        </td>


                        <td>

                            <button
                                class="btn blue"
                                onclick="openStudentDetails(
                                    '${escapeJS(student.id)}'
                                )"
                            >
                                View
                            </button>


                            <button
                                class="btn green"
                                onclick="openFeeModal(
                                    '${escapeJS(student.id)}'
                                )"
                            >
                                Fees
                            </button>


                            <button
                                class="btn orange"
                                onclick="editStudent(
                                    '${escapeJS(student.id)}'
                                )"
                            >
                                Edit
                            </button>


                            <button
                                class="btn red"
                                onclick="deleteStudent(
                                    '${escapeJS(student.id)}'
                                )"
                            >
                                Delete
                            </button>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");
}


/* =========================================================
   OPEN STUDENT MODAL
========================================================= */

function openStudentModal(
    seatNo = "",
    shift = ""
) {

    const modal =
        document.getElementById(
            "studentModal"
        );


    if (!modal) return;


    const form =
        document.getElementById(
            "studentForm"
        );


    if (form) {

        form.reset();
    }


    setValue(
        "editStudentId",
        ""
    );


    setText(
        "studentModalTitle",
        "👨‍🎓 Student Registration"
    );


    setDefaultDates();

    populateSeatDropdown();


    if (seatNo) {

        setValue(
            "studentSeat",
            String(seatNo)
        );
    }


    if (shift) {

        setValue(
            "studentShift",
            shift
        );
    }


    modal.classList.add(
        "show"
    );
}


/* =========================================================
   CLOSE STUDENT MODAL
========================================================= */

function closeStudentModal() {

    const modal =
        document.getElementById(
            "studentModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


/* =========================================================
   POPULATE SEAT DROPDOWN
========================================================= */

function populateSeatDropdown() {

    const select =
        document.getElementById(
            "studentSeat"
        );


    if (!select) return;


    const current =
        select.value;


    select.innerHTML =

        `
            <option value="">
                Select Seat
            </option>
        ` +

        seats.map(
            function (seat) {

                const status =
                    getSeatStatus(
                        seat.seatNo
                    );


                return `

                    <option
                        value="${escapeHTML(
                            seat.seatNo
                        )}"
                    >

                        Seat
                        ${escapeHTML(
                            seat.seatNo
                        )}
                        -
                        ${escapeHTML(
                            status
                        )}

                    </option>

                `;

            }
        )
        .join("");


    if (current) {

        select.value =
            current;
    }
}


/* =========================================================
   QUICK ADD STUDENT
========================================================= */

function quickAddStudent(
    seatNo,
    shift
) {

    openStudentModal(
        seatNo,
        shift
    );
}


/* =========================================================
   VALIDATE SHIFT
========================================================= */

function isValidShift(shift) {

    return SHIFTS.includes(
        shift
    );
}


/* =========================================================
   CHECK SEAT CONFLICT
========================================================= */

function checkSeatConflict(
    seatNo,
    shift,
    editingId = ""
) {

    const sameSeatStudents =
        students.filter(
            function (student) {

                return (

                    student.id !==
                    editingId &&

                    String(
                        student.seatNo
                    ) ===
                    String(seatNo) &&

                    student.status !==
                    "Inactive"

                );

            }
        );


    /* -----------------------------------------
       FULL SHIFT
    ----------------------------------------- */

    if (
        shift ===
        "Full Shift"
    ) {

        const conflict =
            sameSeatStudents.find(
                function (student) {

                    return (
                        student.shift ===
                        "1st Shift" ||

                        student.shift ===
                        "2nd Shift" ||

                        student.shift ===
                        "Full Shift"
                    );

                }
            );


        if (conflict) {

            return {

                valid: false,

                message:

                    `Seat ${seatNo} पहले से occupied है।

Student: ${conflict.name}
Shift: ${conflict.shift}

Full Shift के साथ दूसरी shift की entry नहीं हो सकती।`

            };

        }

    }


    /* -----------------------------------------
       1ST / 2ND SHIFT
    ----------------------------------------- */

    if (
        shift === "1st Shift" ||
        shift === "2nd Shift"
    ) {

        const fullStudent =
            sameSeatStudents.find(
                function (student) {

                    return (
                        student.shift ===
                        "Full Shift"
                    );

                }
            );


        if (fullStudent) {

            return {

                valid: false,

                message:

                    `Seat ${seatNo} पर Full Shift पहले से occupied है।

Student: ${fullStudent.name}

Full Shift होने पर 1st या 2nd Shift की entry नहीं हो सकती।`

            };

        }


        const duplicate =
            sameSeatStudents.find(
                function (student) {

                    return (
                        student.shift ===
                        shift
                    );

                }
            );


        if (duplicate) {

            return {

                valid: false,

                message:

                    `Seat ${seatNo} में ${shift} पहले से occupied है।

Student: ${duplicate.name}`

            };

        }

    }


    return {

        valid: true,

        message: ""

    };
}


/* =========================================================
   SAVE STUDENT
========================================================= */

async function saveStudent(event) {

    event.preventDefault();


    /* -----------------------------------------
       GET FORM VALUES
    ----------------------------------------- */

    const id =
        getValue(
            "editStudentId"
        ).trim();


    const seatNo =
        getValue(
            "studentSeat"
        ).trim();


    const name =
        getValue(
            "studentName"
        ).trim();


    const fatherName =
        getValue(
            "fatherName"
        ).trim();


    const rollNumber =
        getValue(
            "rollNumber"
        ).trim();


    const mobile =
        getValue(
            "studentMobile"
        ).trim();


    const alternateMobile =
        getValue(
            "alternateMobile"
        ).trim();


    const shift =
        getValue(
            "studentShift"
        ).trim();


    const admissionDate =
        getValue(
            "admissionDate"
        ) ||
        getTodayDate();


    const totalFees =
        Number(
            getValue(
                "totalFeesInput"
            ) || 0
        );


    const initialPaid =
        Number(
            getValue(
                "paidFeesInput"
            ) || 0
        );


    const address =
        getValue(
            "studentAddress"
        ).trim();


    const remark =
        getValue(
            "studentRemark"
        ).trim();


    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!seatNo) {

        alert(
            "कृपया Seat Number चुनें।"
        );

        return;
    }


    if (!name) {

        alert(
            "कृपया Student Name डालें।"
        );

        return;
    }


    if (!isValidShift(shift)) {

        alert(
            "कृपया valid shift चुनें।"
        );

        return;
    }


    if (
        isNaN(totalFees) ||
        totalFees < 0
    ) {

        alert(
            "कृपया valid Total Fees डालें।"
        );

        return;
    }


    if (
        isNaN(initialPaid) ||
        initialPaid < 0
    ) {

        alert(
            "कृपया valid Paid Fees डालें।"
        );

        return;
    }


    if (
        initialPaid >
        totalFees
    ) {

        alert(
            "Initial Paid Fees, Total Fees से अधिक नहीं हो सकती।"
        );

        return;
    }


    /* -----------------------------------------
       CHECK SEAT EXISTS
    ----------------------------------------- */

    const seatExists =
        seats.some(
            function (seat) {

                return (
                    String(
                        seat.seatNo
                    ) ===
                    String(seatNo)
                );

            }
        );


    if (!seatExists) {

        alert(
            `Seat ${seatNo} मौजूद नहीं है। पहले Seat Management से seat add करें।`
        );

        return;
    }


    /* -----------------------------------------
       CHECK SEAT / SHIFT CONFLICT
    ----------------------------------------- */

    const conflict =
        checkSeatConflict(
            seatNo,
            shift,
            id
        );


    if (!conflict.valid) {

        alert(
            conflict.message
        );

        return;
    }


    /* -----------------------------------------
       EXISTING STUDENT
    ----------------------------------------- */

    const existingStudent =
        id
        ?
        students.find(
            function (student) {

                return (
                    student.id ===
                    id
                );

            }
        )
        :
        null;


    const now =
        new Date().toISOString();


    /* -----------------------------------------
       CREATE / UPDATE STUDENT
    ----------------------------------------- */

    const student = {

        id:
            id ||
            (
                "STU-" +
                Date.now() +
                "-" +
                Math.floor(
                    Math.random() *
                    10000
                )
            ),


        seatNo:
            seatNo,


        name:
            name,


        fatherName:
            fatherName,


        rollNumber:
            rollNumber,


        mobile:
            mobile,


        alternateMobile:
            alternateMobile,


        shift:
            shift,


        admissionDate:
            admissionDate,


        totalFees:
            totalFees,


        paidFees:
            existingStudent
            ?
            Number(
                existingStudent.paidFees ||
                0
            )
            :
            0,


        address:
            address,


        remark:
            remark,


        status:
            existingStudent
            ?
            existingStudent.status
            :
            "Active",


        createdAt:
            existingStudent
            ?
            existingStudent.createdAt
            :
            now,


        updatedAt:
            now

    };


    /* -----------------------------------------
       INITIAL PAYMENT
       केवल NEW STUDENT पर
    ----------------------------------------- */

    let initialFee = null;


    if (
        !id &&
        initialPaid > 0
    ) {

        initialFee = {

            id:
                "FEE-" +
                Date.now() +
                "-" +
                Math.floor(
                    Math.random() *
                    1000
                ),


            studentId:
                student.id,


            seatNo:
                seatNo,


            month:
                getTodayDate()
                    .substring(
                        0,
                        7
                    ),


            amount:
                initialPaid,


            paymentMode:
                "Cash",


            paymentDate:
                getTodayDate(),


            remark:
                "Initial Paid Fees",


            createdAt:
                now

        };


        fees.push(
            initialFee
        );


        student.paidFees =
            initialPaid;
    }


    /* -----------------------------------------
       EXISTING STUDENT EDIT
       paidFees को transaction से calculate करें
    ----------------------------------------- */

    if (id) {

        student.paidFees =
            getStudentPaidFromTransactions(
                student.id
            );


        /* -------------------------------------
           पुराने data में transaction नहीं है
           तो existing paidFees रखें
        ------------------------------------- */

        if (
            student.paidFees === 0 &&
            Number(
                existingStudent?.paidFees || 0
            ) > 0
        ) {

            student.paidFees =
                Number(
                    existingStudent.paidFees
                );
        }

    }


    /* -----------------------------------------
       INSERT / UPDATE ARRAY
    ----------------------------------------- */

    if (id) {

        const index =
            students.findIndex(
                function (s) {

                    return (
                        s.id ===
                        id
                    );

                }
            );


        if (index === -1) {

            alert(
                "Student record नहीं मिला।"
            );

            return;
        }


        students[index] =
            student;

    } else {

        students.push(
            student
        );
    }


    /* -----------------------------------------
       SAVE LOCAL
    ----------------------------------------- */

    saveLocalData();

    closeStudentModal();

    refreshEverything();


    /* -----------------------------------------
       SAVE STUDENT TO GOOGLE SHEET
    ----------------------------------------- */

    try {

        await apiRequest(
            id
            ?
            "updateStudent"
            :
            "addStudent",
            {
                student:
                    student
            }
        );


        /* -------------------------------------
           SAVE INITIAL FEE
        ------------------------------------- */

        if (
            !id &&
            initialFee
        ) {

            await apiRequest(
                "addFee",
                {
                    fee:
                        initialFee
                }
            );
        }


        isOnline = true;


        setSystemStatus(
            "Connected",
            true
        );


    } catch (error) {

        console.warn(
            "Student server save failed:",
            error
        );


        setSystemStatus(
            "Saved Locally",
            false
        );
    }


    alert(
        id
        ?
        "Student successfully updated."
        :
        "Student successfully saved."
    );
}


/* =========================================================
   EDIT STUDENT
========================================================= */

function editStudent(
    studentId
) {

    const student =
        students.find(
            function (s) {

                return (
                    s.id ===
                    studentId
                );

            }
        );


    if (!student) {

        alert(
            "Student नहीं मिला।"
        );

        return;
    }


    closeDetailModal();

    openStudentModal();


    setValue(
        "editStudentId",
        student.id
    );


    setText(
        "studentModalTitle",
        "✏️ Edit Student"
    );


    populateSeatDropdown();


    setValue(
        "studentSeat",
        student.seatNo
    );


    setValue(
        "studentName",
        student.name
    );


    setValue(
        "fatherName",
        student.fatherName || ""
    );


    setValue(
        "rollNumber",
        student.rollNumber || ""
    );


    setValue(
        "studentMobile",
        student.mobile || ""
    );


    setValue(
        "alternateMobile",
        student.alternateMobile || ""
    );


    setValue(
        "studentShift",
        student.shift
    );


    setValue(
        "admissionDate",
        student.admissionDate || ""
    );


    setValue(
        "totalFeesInput",
        student.totalFees || 0
    );


    /*
       Edit करते समय paid fees को
       दोबारा payment transaction नहीं बनाना है।
    */

    setValue(
        "paidFeesInput",
        0
    );


    setValue(
        "studentAddress",
        student.address || ""
    );


    setValue(
        "studentRemark",
        student.remark || ""
    );
}


/* =========================================================
   DELETE STUDENT
========================================================= */

async function deleteStudent(
    studentId
) {

    const student =
        students.find(
            function (s) {

                return (
                    s.id ===
                    studentId
                );

            }
        );


    if (!student) {
        return;
    }


    const confirmDelete =
        confirm(
            `क्या आप "${student.name}" को delete करना चाहते हैं?`
        );


    if (!confirmDelete) {
        return;
    }


    students =
        students.filter(
            function (s) {

                return (
                    s.id !==
                    studentId
                );

            }
        );


    saveLocalData();

    refreshEverything();


    try {

        await apiRequest(
            "deleteStudent",
            {
                studentId:
                    studentId
            }
        );

    } catch (error) {

        console.warn(
            "Delete server error:",
            error
        );
    }


    alert(
        "Student deleted successfully."
    );
}


/* =========================================================
   STUDENT DETAILS
========================================================= */

function openStudentDetails(
    studentId
) {

    const student =
        students.find(
            function (s) {

                return (
                    s.id ===
                    studentId
                );

            }
        );


    if (!student) {
        return;
    }


    currentDetailId =
        studentId;


    const paid =
        getStudentPaidTotal(
            student
        );


    const pending =
        Math.max(
            0,
            Number(
                student.totalFees ||
                0
            ) -
            paid
        );


    const details =
        document.getElementById(
            "studentDetails"
        );


    if (!details) {
        return;
    }


    details.innerHTML = `

        <div class="panel">

            <h3>
                👤 ${escapeHTML(
                    student.name
                )}
            </h3>

            <br>


            <p>
                <b>Seat:</b>
                ${escapeHTML(
                    student.seatNo
                )}
            </p>


            <p>
                <b>Shift:</b>
                ${escapeHTML(
                    student.shift
                )}
            </p>


            <p>
                <b>Father Name:</b>
                ${escapeHTML(
                    student.fatherName ||
                    "-"
                )}
            </p>


            <p>
                <b>Roll Number:</b>
                ${escapeHTML(
                    student.rollNumber ||
                    "-"
                )}
            </p>


            <p>
                <b>Mobile:</b>
                ${escapeHTML(
                    student.mobile ||
                    "-"
                )}
            </p>


            <p>
                <b>Alternate Mobile:</b>
                ${escapeHTML(
                    student.alternateMobile ||
                    "-"
                )}
            </p>


            <p>
                <b>Admission Date:</b>
                ${formatDate(
                    student.admissionDate
                )}
            </p>


            <p>
                <b>Total Fees:</b>
                ${formatCurrency(
                    student.totalFees
                )}
            </p>


            <p>
                <b>Paid Fees:</b>
                ${formatCurrency(
                    paid
                )}
            </p>


            <p>
                <b>Pending:</b>
                ${formatCurrency(
                    pending
                )}
            </p>


            <p>
                <b>Address:</b>
                ${escapeHTML(
                    student.address ||
                    "-"
                )}
            </p>


            <p>
                <b>Remark:</b>
                ${escapeHTML(
                    student.remark ||
                    "-"
                )}
            </p>

        </div>


        <div class="panel">

            <h3>
                💰 Payment History
            </h3>

            ${renderStudentFeeHistory(
                student.id
            )}

        </div>

    `;


    const modal =
        document.getElementById(
            "detailModal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );
    }
}


/* =========================================================
   CLOSE DETAIL MODAL
========================================================= */

function closeDetailModal() {

    const modal =
        document.getElementById(
            "detailModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


/* =========================================================
   FEE TRANSACTIONS
========================================================= */

function getStudentFeeTransactions(
    studentId
) {

    return fees.filter(
        function (fee) {

            return (
                String(
                    fee.studentId
                ) ===
                String(studentId)
            );

        }
    );
}


/* =========================================================
   GET TRANSACTION PAID
========================================================= */

function getStudentPaidFromTransactions(
    studentId
) {

    return getStudentFeeTransactions(
        studentId
    )
    .reduce(
        function (sum, fee) {

            return (
                sum +
                Number(
                    fee.amount || 0
                )
            );

        },
        0
    );
}


/* =========================================================
   GET TOTAL PAID
========================================================= */

function getStudentPaidTotal(
    student
) {

    const transactionPaid =
        getStudentPaidFromTransactions(
            student.id
        );


    /*
       यदि transaction available है
       तो वही actual paid amount है।
    */

    if (
        transactionPaid > 0
    ) {

        return transactionPaid;
    }


    /*
       पुराने student data के लिए
       paidFees fallback रहेगा।
    */

    return Number(
        student.paidFees || 0
    );
}


/* =========================================================
   PENDING FEES
========================================================= */

function getPendingFees(
    student
) {

    const paid =
        getStudentPaidTotal(
            student
        );


    return Math.max(
        0,
        Number(
            student.totalFees || 0
        ) -
        paid
    );
}


/* =========================================================
   FEE HISTORY
========================================================= */

function renderStudentFeeHistory(
    studentId
) {

    const list =
        getStudentFeeTransactions(
            studentId
        );


    if (!list.length) {

        return `

            <p>
                अभी कोई payment transaction नहीं है।
            </p>

        `;
    }


    return `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>Month</th>

                        <th>Amount</th>

                        <th>Mode</th>

                        <th>Date</th>

                        <th>Remark</th>

                    </tr>

                </thead>


                <tbody>

                    ${
                        list
                        .slice()
                        .reverse()
                        .map(
                            function (fee) {

                                return `

                                    <tr>

                                        <td>
                                            ${escapeHTML(
                                                fee.month
                                            )}
                                        </td>


                                        <td>
                                            ${formatCurrency(
                                                fee.amount
                                            )}
                                        </td>


                                        <td>
                                            ${escapeHTML(
                                                fee.paymentMode
                                            )}
                                        </td>


                                        <td>
                                            ${formatDate(
                                                fee.paymentDate
                                            )}
                                        </td>


                                        <td>
                                            ${escapeHTML(
                                                fee.remark ||
                                                "-"
                                            )}
                                        </td>

                                    </tr>

                                `;

                            }
                        )
                        .join("")
                    }

                </tbody>

            </table>

        </div>

    `;
}


/* =========================================================
   OPEN FEE MODAL
========================================================= */

function openFeeModal(
    studentId
) {

    const student =
        students.find(
            function (s) {

                return (
                    s.id ===
                    studentId
                );

            }
        );


    if (!student) {

        alert(
            "Student नहीं मिला।"
        );

        return;
    }


    currentFeeStudentId =
        studentId;


    const paid =
        getStudentPaidTotal(
            student
        );


    const pending =
        getPendingFees(
            student
        );


    const info =
        document.getElementById(
            "feeStudentInfo"
        );


    if (info) {

        info.innerHTML = `

            <div class="panel">

                <h3>
                    👤 ${escapeHTML(
                        student.name
                    )}
                </h3>


                <p>
                    Seat:
                    <b>
                        ${escapeHTML(
                            student.seatNo
                        )}
                    </b>
                </p>


                <p>
                    Shift:
                    <b>
                        ${escapeHTML(
                            student.shift
                        )}
                    </b>
                </p>


                <p>
                    Total Fees:
                    <b>
                        ${formatCurrency(
                            student.totalFees
                        )}
                    </b>
                </p>


                <p>
                    Paid:
                    <b>
                        ${formatCurrency(
                            paid
                        )}
                    </b>
                </p>


                <p>
                    Pending:
                    <b>
                        ${formatCurrency(
                            pending
                        )}
                    </b>
                </p>

            </div>

        `;
    }


    setValue(
        "feeMonth",
        getTodayDate().substring(
            0,
            7
        )
    );


    setValue(
        "paymentDate",
        getTodayDate()
    );


    setValue(
        "depositAmount",
        ""
    );


    setValue(
        "paymentRemark",
        ""
    );


    const modal =
        document.getElementById(
            "feeModal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );
    }
}


/* =========================================================
   CLOSE FEE MODAL
========================================================= */

function closeFeeModal() {

    const modal =
        document.getElementById(
            "feeModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


/* =========================================================
   DEPOSIT FEES
========================================================= */

async function depositFees(
    event
) {

    event.preventDefault();


    const student =
        students.find(
            function (s) {

                return (
                    s.id ===
                    currentFeeStudentId
                );

            }
        );


    if (!student) {

        alert(
            "Student नहीं मिला।"
        );

        return;
    }


    const month =
        getValue(
            "feeMonth"
        );


    const amount =
        Number(
            getValue(
                "depositAmount"
            ) || 0
        );


    const paymentMode =
        getValue(
            "paymentMode"
        ) ||
        "Cash";


    const paymentDate =
        getValue(
            "paymentDate"
        );


    const remark =
        getValue(
            "paymentRemark"
        ).trim();


    if (
        !month ||
        amount <= 0 ||
        !paymentDate
    ) {

        alert(
            "कृपया सभी payment details भरें।"
        );

        return;
    }


    const pending =
        getPendingFees(
            student
        );


    if (
        amount >
        pending
    ) {

        const proceed =
            confirm(
                `Pending fees ${formatCurrency(pending)} है।

क्या फिर भी ${formatCurrency(amount)} जमा करना है?`
            );


        if (!proceed) {
            return;
        }
    }


    const fee = {

        id:
            "FEE-" +
            Date.now() +
            "-" +
            Math.floor(
                Math.random() *
                1000
            ),


        studentId:
            student.id,


        seatNo:
            student.seatNo,


        month:
            month,


        amount:
            amount,


        paymentMode:
            paymentMode,


        paymentDate:
            paymentDate,


        remark:
            remark,


        createdAt:
            new Date().toISOString()

    };


    fees.push(
        fee
    );


    student.paidFees =
        getStudentPaidFromTransactions(
            student.id
        );


    student.updatedAt =
        new Date().toISOString();


    saveLocalData();

    closeFeeModal();

    refreshEverything();


    try {

        await apiRequest(
            "addFee",
            {
                fee:
                    fee
            }
        );


        await apiRequest(
            "updateStudent",
            {
                student:
                    student
            }
        );


        setSystemStatus(
            "Connected",
            true
        );


    } catch (error) {

        console.warn(
            "Fee server save failed:",
            error
        );


        setSystemStatus(
            "Saved Locally",
            false
        );
    }


    alert(
        "Fees successfully deposited."
    );
}


/* =========================================================
   FEES PAGE
========================================================= */

function renderFeesPage() {

    const tbody =
        document.getElementById(
            "feesTable"
        );


    if (!tbody) return;


    tbody.innerHTML =
        students.map(
            function (student) {

                const paid =
                    getStudentPaidTotal(
                        student
                    );


                const pending =
                    getPendingFees(
                        student
                    );


                return `

                    <tr>

                        <td>
                            ${escapeHTML(
                                student.seatNo
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                student.name
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                student.shift
                            )}
                        </td>


                        <td>
                            ${formatCurrency(
                                student.totalFees
                            )}
                        </td>


                        <td>
                            ${formatCurrency(
                                paid
                            )}
                        </td>


                        <td>
                            ${formatCurrency(
                                pending
                            )}
                        </td>


                        <td>

                            <span class="badge ${
                                pending > 0
                                ? "partial"
                                : "full"
                            }">

                                ${
                                    pending > 0
                                    ? "Pending"
                                    : "Paid"
                                }

                            </span>

                        </td>


                        <td>

                            <button
                                class="btn blue"
                                onclick="openFeeModal(
                                    '${escapeJS(
                                        student.id
                                    )}'
                                )"
                            >
                                💰 Deposit
                            </button>


                            <button
                                class="btn dark"
                                onclick="openStudentDetails(
                                    '${escapeJS(
                                        student.id
                                    )}'
                                )"
                            >
                                View
                            </button>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");
}


/* =========================================================
   SEARCH FEES BY SEAT
========================================================= */

function searchFeesBySeat() {

    const seat =
        getValue(
            "feesSeatSearch"
        ).trim();


    const report =
        document.getElementById(
            "feesStudentReport"
        );


    if (!report) {
        return;
    }


    if (!seat) {

        report.innerHTML = "";

        updateFeeReportTotals(
            students
        );

        return;
    }


    const result =
        students.filter(
            function (student) {

                return (
                    String(
                        student.seatNo
                    ) ===
                    String(seat)
                );

            }
        );


    if (!result.length) {

        report.innerHTML = `

            <div class="panel">

                <h3>
                    ❌ Seat
                    ${escapeHTML(seat)}
                    पर कोई student नहीं मिला।
                </h3>

            </div>

        `;


        updateFeeReportTotals(
            []
        );

        return;
    }


    report.innerHTML =
        result.map(
            function (student) {

                const paid =
                    getStudentPaidTotal(
                        student
                    );


                const pending =
                    getPendingFees(
                        student
                    );


                return `

                    <div class="panel">

                        <h3>
                            👤 ${escapeHTML(
                                student.name
                            )}
                        </h3>


                        <p>
                            Seat:
                            <b>
                                ${escapeHTML(
                                    student.seatNo
                                )}
                            </b>
                        </p>


                        <p>
                            Shift:
                            <b>
                                ${escapeHTML(
                                    student.shift
                                )}
                            </b>
                        </p>


                        <p>
                            Total:
                            <b>
                                ${formatCurrency(
                                    student.totalFees
                                )}
                            </b>
                        </p>


                        <p>
                            Paid:
                            <b>
                                ${formatCurrency(
                                    paid
                                )}
                            </b>
                        </p>


                        <p>
                            Pending:
                            <b>
                                ${formatCurrency(
                                    pending
                                )}
                            </b>
                        </p>


                        <br>


                        <button
                            class="btn green"
                            onclick="openFeeModal(
                                '${escapeJS(
                                    student.id
                                )}'
                            )"
                        >
                            💰 Deposit Fees
                        </button>

                    </div>

                `;

            }
        )
        .join("");


    updateFeeReportTotals(
        result
    );
}


/* =========================================================
   FEE REPORT TOTALS
========================================================= */

function updateFeeReportTotals(
    list
) {

    let total = 0;

    let paid = 0;


    (list || []).forEach(
        function (student) {

            total +=
                Number(
                    student.totalFees ||
                    0
                );


            paid +=
                getStudentPaidTotal(
                    student
                );

        }
    );


    const pending =
        Math.max(
            0,
            total - paid
        );


    setText(
        "feesTotalReport",
        formatCurrency(total)
    );


    setText(
        "feesPaidReport",
        formatCurrency(paid)
    );


    setText(
        "feesPendingReport",
        formatCurrency(pending)
    );
}


/* =========================================================
   CLEAR FEES SEARCH
========================================================= */

function clearFeesSearch() {

    setValue(
        "feesSeatSearch",
        ""
    );


    const report =
        document.getElementById(
            "feesStudentReport"
        );


    if (report) {

        report.innerHTML = "";
    }


    updateFeeReportTotals(
        students
    );
}


/* =========================================================
   SEAT MANAGEMENT MODAL
========================================================= */

function openSeatModal() {

    const modal =
        document.getElementById(
            "seatModal"
        );


    if (!modal) return;


    setValue(
        "newSeatNumber",
        ""
    );


    modal.classList.add(
        "show"
    );
}


/* =========================================================
   CLOSE SEAT MODAL
========================================================= */

function closeSeatModal() {

    const modal =
        document.getElementById(
            "seatModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


/* =========================================================
   SAVE NEW SEAT
========================================================= */

async function saveSeat(
    event
) {

    event.preventDefault();


    const seatNo =
        getValue(
            "newSeatNumber"
        ).trim();


    if (!seatNo) {

        alert(
            "Valid seat number डालें।"
        );

        return;
    }


    if (
        /^\d+$/.test(seatNo) &&
        Number(seatNo) <= 0
    ) {

        alert(
            "Seat number 0 से बड़ा होना चाहिए।"
        );

        return;
    }


    const exists =
        seats.some(
            function (seat) {

                return (
                    String(
                        seat.seatNo
                    ) ===
                    seatNo
                );

            }
        );


    if (exists) {

        alert(
            `Seat ${seatNo} पहले से मौजूद है।`
        );

        return;
    }


    const seat = {

        seatNo:
            seatNo,


        createdAt:
            new Date().toISOString()

    };


    seats.push(
        seat
    );


    sortSeats();

    saveLocalData();

    closeSeatModal();

    refreshEverything();


    try {

        await apiRequest(
            "addSeat",
            {
                seat:
                    seat
            }
        );


        setSystemStatus(
            "Connected",
            true
        );


    } catch (error) {

        console.warn(
            "Seat server save failed:",
            error
        );


        setSystemStatus(
            "Saved Locally",
            false
        );
    }


    alert(
        `Seat ${seatNo} successfully added.`
    );
}


/* =========================================================
   DELETE SEAT
========================================================= */

async function deleteSeat(
    seatNo
) {

    const seatStudents =
        getSeatStudents(
            seatNo
        );


    if (
        seatStudents.length > 0
    ) {

        alert(
            `Seat ${seatNo} में student मौजूद हैं।

पहले students हटाएँ या दूसरी seat पर shift करें।`
        );

        return;
    }


    const confirmDelete =
        confirm(
            `क्या Seat ${seatNo} delete करना चाहते हैं?`
        );


    if (!confirmDelete) {
        return;
    }


    seats =
        seats.filter(
            function (seat) {

                return (
                    String(
                        seat.seatNo
                    ) !==
                    String(seatNo)
                );

            }
        );


    saveLocalData();

    refreshEverything();


    try {

        await apiRequest(
            "deleteSeat",
            {
                seatNo:
                    String(seatNo)
            }
        );

    } catch (error) {

        console.warn(
            "Seat delete server error:",
            error
        );
    }


    alert(
        `Seat ${seatNo} deleted successfully.`
    );
}


/* =========================================================
   SEAT MANAGEMENT TABLE
========================================================= */

function renderSeatManagement() {

    const tbody =
        document.getElementById(
            "seatManagementTable"
        );


    if (!tbody) return;


    tbody.innerHTML =
        seats.map(
            function (seat) {

                const first =
                    getStudentForSlot(
                        seat.seatNo,
                        "1st Shift"
                    );


                const second =
                    getStudentForSlot(
                        seat.seatNo,
                        "2nd Shift"
                    );


                const full =
                    getStudentForSlot(
                        seat.seatNo,
                        "Full Shift"
                    );


                const status =
                    getSeatStatus(
                        seat.seatNo
                    );


                return `

                    <tr>

                        <td>

                            <b>
                                🪑
                                ${escapeHTML(
                                    seat.seatNo
                                )}
                            </b>

                        </td>


                        <td>

                            ${
                                first
                                ?
                                "🟢 " +
                                escapeHTML(
                                    first.name
                                )
                                :
                                "🔴 VACANT"
                            }

                        </td>


                        <td>

                            ${
                                second
                                ?
                                "🟢 " +
                                escapeHTML(
                                    second.name
                                )
                                :
                                "🔴 VACANT"
                            }

                        </td>


                        <td>

                            ${
                                full
                                ?
                                "🟢 " +
                                escapeHTML(
                                    full.name
                                )
                                :
                                "🔴 VACANT"
                            }

                        </td>


                        <td>

                            <span class="badge ${
                                getStatusClass(
                                    status
                                )
                            }">

                                ${escapeHTML(
                                    status
                                )}

                            </span>

                        </td>


                        <td>

                            <button
                                class="btn red"
                                onclick="deleteSeat(
                                    '${escapeJS(
                                        seat.seatNo
                                    )}'
                                )"
                            >
                                🗑 Delete
                            </button>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");
}


/* =========================================================
   SHIFT WISE STUDENTS
========================================================= */

function renderShiftStudents() {

    renderShiftList(
        "1st Shift",
        "firstShiftStudents",
        "firstShiftCount"
    );


    renderShiftList(
        "2nd Shift",
        "secondShiftStudents",
        "secondShiftCount"
    );


    renderShiftList(
        "Full Shift",
        "fullShiftStudents",
        "fullShiftCount"
    );
}


/* =========================================================
   SHIFT LIST
========================================================= */

function renderShiftList(
    shift,
    containerId,
    countId
) {

    const container =
        document.getElementById(
            containerId
        );


    const count =
        document.getElementById(
            countId
        );


    if (!container) return;


    const list =
        students.filter(
            function (student) {

                return (

                    student.shift ===
                    shift &&

                    student.status !==
                    "Inactive"

                );

            }
        );


    if (count) {

        count.textContent =
            list.length;
    }


    if (!list.length) {

        container.innerHTML = `

            <div class="student-mini">

                🔴 इस shift में कोई student नहीं है।

            </div>

        `;

        return;
    }


    container.innerHTML =
        list.map(
            function (student) {

                return `

                    <div
                        class="student-mini"
                        onclick="openStudentDetails(
                            '${escapeJS(
                                student.id
                            )}'
                        )"
                    >

                        <b>
                            🪑 Seat
                            ${escapeHTML(
                                student.seatNo
                            )}
                        </b>


                        <br>


                        👤
                        ${escapeHTML(
                            student.name
                        )}


                        <br>


                        <small>

                            Roll:
                            ${escapeHTML(
                                student.rollNumber ||
                                "-"
                            )}

                            |

                            Mobile:
                            ${escapeHTML(
                                student.mobile ||
                                "-"
                            )}

                        </small>

                    </div>

                `;

            }
        )
        .join("");
}


/* =========================================================
   DASHBOARD STATISTICS
========================================================= */

function updateStatistics() {

    const totalSeats =
        seats.length;


    const vacantSeats =
        seats.filter(
            function (seat) {

                return (
                    getSeatStatus(
                        seat.seatNo
                    ) ===
                    "VACANT"
                );

            }
        ).length;


    const fullSeats =
        seats.filter(
            function (seat) {

                return (
                    getSeatStatus(
                        seat.seatNo
                    ) ===
                    "FULL"
                );

            }
        ).length;


    const occupiedSlots =
        students.filter(
            function (student) {

                return (
                    student.status !==
                    "Inactive"
                );

            }
        ).length;


    /*
       Important:
       1 seat = 3 slots
       1st + 2nd + Full
    */

    const totalSlots =
        totalSeats * 3;


    const occupancy =
        totalSlots > 0
        ?
        (
            occupiedSlots /
            totalSlots *
            100
        )
        :
        0;


    let totalFees = 0;

    let paidFees = 0;


    students.forEach(
        function (student) {

            if (
                student.status ===
                "Inactive"
            ) {
                return;
            }


            totalFees +=
                Number(
                    student.totalFees ||
                    0
                );


            paidFees +=
                getStudentPaidTotal(
                    student
                );

        }
    );


    const pendingFees =
        Math.max(
            0,
            totalFees -
            paidFees
        );


    const today =
        getTodayDate();


    const todayEntries =
        students.filter(
            function (student) {

                return (

                    student.status !==
                    "Inactive" &&

                    String(
                        student.createdAt ||
                        ""
                    )
                    .substring(
                        0,
                        10
                    ) ===
                    today

                );

            }
        ).length;


    setText(
        "totalSeats",
        totalSeats
    );


    setText(
        "vacantSeats",
        vacantSeats
    );


    setText(
        "occupiedSeats",
        fullSeats
    );


    setText(
        "occupancyPercent",
        occupancy.toFixed(1) +
        "%"
    );


    setText(
        "todayEntries",
        todayEntries
    );


    setText(
        "totalFees",
        formatCurrency(
            totalFees
        )
    );


    setText(
        "paidFees",
        formatCurrency(
            paidFees
        )
    );


    setText(
        "pendingFees",
        formatCurrency(
            pendingFees
        )
    );
}


/* =========================================================
   REPORT STATISTICS
========================================================= */

function updateReports() {

    const today =
        getTodayDate();


    const todayEntries =
        students.filter(
            function (student) {

                return (

                    student.status !==
                    "Inactive" &&

                    String(
                        student.createdAt ||
                        ""
                    )
                    .substring(
                        0,
                        10
                    ) ===
                    today

                );

            }
        ).length;


    const todayFees =
        fees.filter(
            function (fee) {

                return (

                    String(
                        fee.paymentDate ||
                        ""
                    )
                    .substring(
                        0,
                        10
                    ) ===
                    today

                );

            }
        ).length;


    const activeStudents =
        students.filter(
            function (student) {

                return (
                    student.status !==
                    "Inactive"
                );

            }
        ).length;


    setText(
        "reportTodayEntries",
        todayEntries
    );


    setText(
        "reportCurrent",
        activeStudents
    );


    setText(
        "reportCheckout",
        todayFees
    );


    setText(
        "reportPeak",
        seats.length
    );
}


/* =========================================================
   DASHBOARD FEE ENTRY
========================================================= */

function openDashboardFeeEntry() {

    const buttons =
        document.querySelectorAll(
            ".nav-btn"
        );


    showSection(
        "feesSection",
        buttons[2]
    );


    setTimeout(
        function () {

            const input =
                document.getElementById(
                    "feesSeatSearch"
                );


            if (input) {

                input.focus();
            }

        },
        100
    );
}


/* =========================================================
   CSV EXPORT
========================================================= */

function exportCSV() {

    const rows = [

        [

            "Seat",
            "Name",
            "Father Name",
            "Roll Number",
            "Mobile",
            "Shift",
            "Admission Date",
            "Total Fees",
            "Paid Fees",
            "Pending Fees",
            "Status"

        ]

    ];


    students.forEach(
        function (student) {

            if (
                student.status ===
                "Inactive"
            ) {
                return;
            }


            const paid =
                getStudentPaidTotal(
                    student
                );


            const pending =
                getPendingFees(
                    student
                );


            rows.push([

                student.seatNo,

                student.name,

                student.fatherName,

                student.rollNumber,

                student.mobile,

                student.shift,

                student.admissionDate,

                student.totalFees,

                paid,

                pending,

                pending > 0
                ?
                "Pending"
                :
                "Paid"

            ]);

        }
    );


    const csv =
        rows.map(
            function (row) {

                return row
                    .map(csvEscape)
                    .join(",");

            }
        )
        .join("\n");


    const blob =
        new Blob(
            [
                "\uFEFF" +
                csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const a =
        document.createElement(
            "a"
        );


    a.href =
        url;


    a.download =
        "NEW_DRISHTI_LIBRARY_STUDENTS_" +
        getTodayDate() +
        ".csv";


    document.body.appendChild(
        a
    );


    a.click();

    a.remove();


    URL.revokeObjectURL(
        url
    );
}


/* =========================================================
   PRINT SEAT REPORT
========================================================= */

function printSeatReport() {

    const rows =
        seats.map(
            function (seat) {

                const first =
                    getStudentForSlot(
                        seat.seatNo,
                        "1st Shift"
                    );


                const second =
                    getStudentForSlot(
                        seat.seatNo,
                        "2nd Shift"
                    );


                const full =
                    getStudentForSlot(
                        seat.seatNo,
                        "Full Shift"
                    );


                return `

                    <tr>

                        <td>
                            ${escapeHTML(
                                seat.seatNo
                            )}
                        </td>


                        <td>
                            ${
                                first
                                ?
                                escapeHTML(
                                    first.name
                                )
                                :
                                "VACANT"
                            }
                        </td>


                        <td>
                            ${
                                second
                                ?
                                escapeHTML(
                                    second.name
                                )
                                :
                                "VACANT"
                            }
                        </td>


                        <td>
                            ${
                                full
                                ?
                                escapeHTML(
                                    full.name
                                )
                                :
                                "VACANT"
                            }
                        </td>


                        <td>
                            ${escapeHTML(
                                getSeatStatus(
                                    seat.seatNo
                                )
                            )}
                        </td>

                    </tr>

                `;

            }
        )
        .join("");


    printHTML(

        "NEW DRISHTI - Seat Report",

        `

            <h1>
                NEW DRISHTI COMPUTER EDUCATION
                & DIGITAL LIBRARY
            </h1>


            <h2>
                Seat Management Report
            </h2>


            <p>
                Date:
                ${formatDate(
                    getTodayDate()
                )}
            </p>


            <table>

                <thead>

                    <tr>

                        <th>Seat</th>

                        <th>1st Shift</th>

                        <th>2nd Shift</th>

                        <th>Full Shift</th>

                        <th>Status</th>

                    </tr>

                </thead>


                <tbody>

                    ${rows}

                </tbody>

            </table>

        `
    );
}


/* =========================================================
   PRINT STUDENT REPORT
========================================================= */

function printStudentReport() {

    const rows =
        students
        .filter(
            function (student) {

                return (
                    student.status !==
                    "Inactive"
                );

            }
        )
        .map(
            function (student) {

                const paid =
                    getStudentPaidTotal(
                        student
                    );


                const pending =
                    getPendingFees(
                        student
                    );


                return `

                    <tr>

                        <td>
                            ${escapeHTML(
                                student.seatNo
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                student.name
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                student.rollNumber ||
                                "-"
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                student.mobile ||
                                "-"
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                student.shift
                            )}
                        </td>


                        <td>
                            ${formatCurrency(
                                student.totalFees
                            )}
                        </td>


                        <td>
                            ${formatCurrency(
                                paid
                            )}
                        </td>


                        <td>
                            ${formatCurrency(
                                pending
                            )}
                        </td>

                    </tr>

                `;

            }
        )
        .join("");


    printHTML(

        "NEW DRISHTI - Student Report",

        `

            <h1>
                NEW DRISHTI COMPUTER EDUCATION
                & DIGITAL LIBRARY
            </h1>


            <h2>
                Student Report
            </h2>


            <table>

                <thead>

                    <tr>

                        <th>Seat</th>

                        <th>Name</th>

                        <th>Roll</th>

                        <th>Mobile</th>

                        <th>Shift</th>

                        <th>Total</th>

                        <th>Paid</th>

                        <th>Pending</th>

                    </tr>

                </thead>


                <tbody>

                    ${rows}

                </tbody>

            </table>

        `
    );
}


/* =========================================================
   PRINT FEES REPORT
========================================================= */

function printFeesReport() {

    const rows =
        fees.map(
            function (fee) {

                const student =
                    students.find(
                        function (s) {

                            return (
                                s.id ===
                                fee.studentId
                            );

                        }
                    );


                return `

                    <tr>

                        <td>
                            ${escapeHTML(
                                fee.seatNo
                            )}
                        </td>


                        <td>
                            ${
                                student
                                ?
                                escapeHTML(
                                    student.name
                                )
                                :
                                "-"
                            }
                        </td>


                        <td>
                            ${escapeHTML(
                                fee.month
                            )}
                        </td>


                        <td>
                            ${formatCurrency(
                                fee.amount
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                fee.paymentMode
                            )}
                        </td>


                        <td>
                            ${formatDate(
                                fee.paymentDate
                            )}
                        </td>

                    </tr>

                `;

            }
        )
        .join("");


    printHTML(

        "NEW DRISHTI - Fees Report",

        `

            <h1>
                NEW DRISHTI COMPUTER EDUCATION
                & DIGITAL LIBRARY
            </h1>


            <h2>
                Fees Transaction Report
            </h2>


            <table>

                <thead>

                    <tr>

                        <th>Seat</th>

                        <th>Student</th>

                        <th>Month</th>

                        <th>Amount</th>

                        <th>Mode</th>

                        <th>Date</th>

                    </tr>

                </thead>


                <tbody>

                    ${rows}

                </tbody>

            </table>

        `
    );
}


/* =========================================================
   PRINT TODAY REPORT
========================================================= */

function printTodayReport() {

    const today =
        getTodayDate();


    const todayStudents =
        students.filter(
            function (student) {

                return (

                    student.status !==
                    "Inactive" &&

                    String(
                        student.createdAt ||
                        ""
                    )
                    .substring(
                        0,
                        10
                    ) ===
                    today

                );

            }
        );


    const todayFees =
        fees.filter(
            function (fee) {

                return (
                    String(
                        fee.paymentDate ||
                        ""
                    )
                    .substring(
                        0,
                        10
                    ) ===
                    today
                );

            }
        );


    printHTML(

        "NEW DRISHTI - Today's Report",

        `

            <h1>
                NEW DRISHTI COMPUTER EDUCATION
                & DIGITAL LIBRARY
            </h1>


            <h2>
                Today's Entry Report
            </h2>


            <p>
                Date:
                ${formatDate(today)}
            </p>


            <hr>


            <h3>
                Today's Student Entries:
                ${todayStudents.length}
            </h3>


            <br>


            <table>

                <thead>

                    <tr>

                        <th>Seat</th>

                        <th>Name</th>

                        <th>Shift</th>

                        <th>Mobile</th>

                    </tr>

                </thead>


                <tbody>

                    ${
                        todayStudents
                        .map(
                            function (student) {

                                return `

                                    <tr>

                                        <td>
                                            ${escapeHTML(
                                                student.seatNo
                                            )}
                                        </td>


                                        <td>
                                            ${escapeHTML(
                                                student.name
                                            )}
                                        </td>


                                        <td>
                                            ${escapeHTML(
                                                student.shift
                                            )}
                                        </td>


                                        <td>
                                            ${escapeHTML(
                                                student.mobile ||
                                                "-"
                                            )}
                                        </td>

                                    </tr>

                                `;

                            }
                        )
                        .join("")
                    }

                </tbody>

            </table>


            <br>


            <h3>
                Today's Fee Transactions:
                ${todayFees.length}
            </h3>

        `
    );
}


/* =========================================================
   PRINT HELPER
========================================================= */

function printHTML(
    title,
    content
) {

    const printWindow =
        window.open(
            "",
            "_blank"
        );


    if (!printWindow) {

        alert(
            "Popup blocked है। कृपया popup allow करें।"
        );

        return;
    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">


            <title>
                ${escapeHTML(title)}
            </title>


            <style>

                *{
                    box-sizing:border-box;
                }

                body{
                    font-family:Arial,sans-serif;
                    padding:30px;
                    color:#111;
                }

                h1{
                    text-align:center;
                    font-size:22px;
                }

                h2{
                    text-align:center;
                    margin-bottom:20px;
                }

                table{
                    width:100%;
                    border-collapse:collapse;
                    margin-top:20px;
                }

                th,
                td{
                    border:1px solid #333;
                    padding:8px;
                    text-align:left;
                }

                th{
                    background:#eee;
                }

                @media print{

                    body{
                        padding:10px;
                    }

                    table{
                        page-break-inside:auto;
                    }

                    tr{
                        page-break-inside:avoid;
                        page-break-after:auto;
                    }

                }

            </style>

        </head>


        <body>

            ${content}


            <br>
            <br>


            <div
                style="
                    text-align:center;
                    margin-top:30px;
                "
            >

                NEW DRISHTI COMPUTER EDUCATION
                & DIGITAL LIBRARY

            </div>

        </body>

        </html>

    `);


    printWindow.document.close();

    printWindow.focus();


    setTimeout(
        function () {

            printWindow.print();

        },
        500
    );
}


/* =========================================================
   UTILITY - GET VALUE
========================================================= */

function getValue(id) {

    const el =
        document.getElementById(id);


    if (!el) {
        return "";
    }


    return (
        el.value ??
        ""
    );
}


/* =========================================================
   UTILITY - SET VALUE
========================================================= */

function setValue(
    id,
    value
) {

    const el =
        document.getElementById(id);


    if (el) {

        el.value =
            value ?? "";
    }
}


/* =========================================================
   UTILITY - SET TEXT
========================================================= */

function setText(
    id,
    value
) {

    const el =
        document.getElementById(id);


    if (el) {

        el.textContent =
            value ?? "";
    }
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";
    }


    return String(value)

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
   ESCAPE JAVASCRIPT STRING
========================================================= */

function escapeJS(value) {

    return String(
        value ?? ""
    )

    .replace(
        /\\/g,
        "\\\\"
    )

    .replace(
        /'/g,
        "\\'"
    )

    .replace(
        /"/g,
        '\\"'
    )

    .replace(
        /\r/g,
        "\\r"
    )

    .replace(
        /\n/g,
        "\\n"
    );
}


/* =========================================================
   CSV ESCAPE
========================================================= */

function csvEscape(value) {

    const str =
        String(
            value ?? ""
        );


    return '"' +
        str.replace(
            /"/g,
            '""'
        ) +
        '"';
}


/* =========================================================
   CLOSE MODALS WHEN CLICK OUTSIDE
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        if (
            event.target.classList.contains(
                "modal"
            )
        ) {

            event.target.classList.remove(
                "show"
            );
        }

    }
);


/* =========================================================
   ESC KEY CLOSE MODALS
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !==
            "Escape"
        ) {

            return;
        }


        document
            .querySelectorAll(
                ".modal.show"
            )
            .forEach(
                function (modal) {

                    modal.classList.remove(
                        "show"
                    );

                }
            );

    }
);


/* =========================================================
   AUTO REFRESH
========================================================= */

setInterval(
    function () {

        refreshEverything();

    },
    60000
);


/* =========================================================
   END OF SCRIPT
========================================================= */