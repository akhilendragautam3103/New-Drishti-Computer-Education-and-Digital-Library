/* =========================================================
   NDCE ADMISSION SYSTEM
   COMPLETE FRONTEND JAVASCRIPT
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const GAS_API_URL =
"https://script.google.com/macros/s/AKfycby_gJgJu3JiJYnMncxYGVoBvQBobw9x_I96Ij9nYC1lBHoXMDyxt_ILfRTMq0XxPijDEg/exec";


const UPI_ID =
"Q727361162@ybl";


const UPI_NAME =
"NEW DRISHTI COMPUTER EDUCATION";


const THEME_KEY =
"NDCE_SELECTED_THEME";


let currentApplication = null;

let allAdmissions = [];


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        document.getElementById(
            "displayUPI"
        ).textContent = UPI_ID;


        loadTheme();


        validateGmail();

    }
);


/* =========================================================
   THEME SYSTEM
========================================================= */

function loadTheme(){

    let theme =
        localStorage.getItem(
            THEME_KEY
        ) || "ocean";


    applyTheme(theme);


    const select =
        document.getElementById(
            "themeSelect"
        );


    if(select){

        select.value = theme;

    }

}


function changeTheme(theme){

    applyTheme(theme);

    localStorage.setItem(
        THEME_KEY,
        theme
    );

}


function applyTheme(theme){

    const themes = [
        "ocean",
        "purple",
        "green",
        "orange",
        "rose",
        "dark"
    ];


    document.body.classList.remove(
        ...themes.map(
            x => "theme-" + x
        )
    );


    if(!themes.includes(theme)){

        theme = "ocean";

    }


    document.body.classList.add(
        "theme-" + theme
    );

}


/* =========================================================
   COURSE SELECT
========================================================= */

function selectCourse(course){

    const select =
        document.getElementById(
            "course"
        );


    select.value = course;


    updateFee();

}


function updateFee(){

    const select =
        document.getElementById(
            "course"
        );


    const option =
        select.options[
            select.selectedIndex
        ];


    const fee =
        option
        ? option.dataset.fee || 0
        : 0;


    document.getElementById(
        "courseFee"
    ).value = fee;


    generateUPI();

}


/* =========================================================
   GMAIL VALIDATION
========================================================= */

function validateGmail(){

    const email =
        document.getElementById(
            "email"
        ).value
        .trim()
        .toLowerCase();


    const msg =
        document.getElementById(
            "emailMessage"
        );


    if(!email){

        msg.className =
            "email-message";


        msg.innerHTML =
            "⚠️ Valid Gmail ID डालें।";


        return false;

    }


    const gmailPattern =
        /^[a-zA-Z0-9._%+-]+@gmail\.com$/;


    if(!gmailPattern.test(email)){

        msg.className =
            "email-message";


        msg.innerHTML =
            "❌ Please enter a valid Gmail ID जैसे example@gmail.com";


        return false;

    }


    msg.className =
        "email-message email-valid";


    msg.innerHTML =
        "✓ Valid Gmail ID. PDFs इसी email पर भेजे जाएंगे।";


    return true;

}


/* =========================================================
   PHOTO PREVIEW
========================================================= */

function previewPhoto(event){

    const file =
        event.target.files[0];


    if(!file){

        return;

    }


    if(!file.type.startsWith("image/")){

        alert(
            "Please select a valid image file."
        );


        event.target.value = "";

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function(e){

            document.getElementById(
                "photoPreview"
            ).src =
                e.target.result;

        };


    reader.readAsDataURL(file);

}


/* =========================================================
   UPI
========================================================= */

function showUPI(){

    document
        .getElementById(
            "upiBox"
        )
        .classList.remove(
            "hidden"
        );


    generateUPI();

}


function hideUPI(){

    document
        .getElementById(
            "upiBox"
        )
        .classList.add(
            "hidden"
        );

}


function generateUPI(){

    const amount =
        document.getElementById(
            "courseFee"
        ).value || 0;


    const course =
        document.getElementById(
            "course"
        ).value || "Admission";


    const upiURL =
        "upi://pay?" +
        "pa=" +
        encodeURIComponent(UPI_ID) +
        "&pn=" +
        encodeURIComponent(UPI_NAME) +
        "&am=" +
        encodeURIComponent(amount) +
        "&cu=INR" +
        "&tn=" +
        encodeURIComponent(
            course + " Admission"
        );


    const box =
        document.getElementById(
            "upiQRCode"
        );


    if(!box){

        return;

    }


    box.innerHTML = "";


    new QRCode(
        box,
        {

            text:upiURL,

            width:200,

            height:200

        }
    );

}


/* =========================================================
   GET FORM DATA
========================================================= */

function collectFormData(){

    const paymentMethod =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        )?.value || "Offline";


    return {

        studentName:
            document
            .getElementById(
                "studentName"
            )
            .value
            .trim(),


        fatherName:
            document
            .getElementById(
                "fatherName"
            )
            .value
            .trim(),


        motherName:
            document
            .getElementById(
                "motherName"
            )
            .value
            .trim(),


        dob:
            document.getElementById(
                "dob"
            ).value,


        gender:
            document.getElementById(
                "gender"
            ).value,


        mobile:
            document
            .getElementById(
                "mobile"
            )
            .value
            .trim(),


        whatsapp:
            document
            .getElementById(
                "whatsapp"
            )
            .value
            .trim(),


        email:
            document
            .getElementById(
                "email"
            )
            .value
            .trim(),


        address:
            document
            .getElementById(
                "address"
            )
            .value
            .trim(),


        village:
            document
            .getElementById(
                "village"
            )
            .value
            .trim(),


        district:
            document
            .getElementById(
                "district"
            )
            .value
            .trim(),


        state:
            document
            .getElementById(
                "state"
            )
            .value
            .trim(),


        pincode:
            document
            .getElementById(
                "pincode"
            )
            .value
            .trim(),


        course:
            document.getElementById(
                "course"
            ).value,


        batch:
            document.getElementById(
                "batch"
            ).value,


        courseFee:
            document.getElementById(
                "courseFee"
            ).value,


        paymentMethod:
            paymentMethod,


        paymentStatus:
            document.getElementById(
                "paymentStatus"
            ).value,


        transactionId:
            document
            .getElementById(
                "transactionId"
            )
            .value
            .trim()

    };

}


/* =========================================================
   SUBMIT
========================================================= */

async function submitAdmission(event){

    event.preventDefault();


    if(!validateGmail()){

        alert(
            "Valid Gmail ID डालना जरूरी है।"
        );


        document
            .getElementById(
                "email"
            )
            .focus();


        return;

    }


    const photo =
        document
        .getElementById(
            "studentPhoto"
        )
        .files[0];


    if(!photo){

        alert(
            "Student photo upload करना जरूरी है."
        );


        return;

    }


    const form =
        document.getElementById(
            "admissionForm"
        );


    const submitBtn =
        document.getElementById(
            "submitBtn"
        );


    submitBtn.disabled = true;


    submitBtn.textContent =
        "Submitting...";


    try{

        const data =
            collectFormData();


        data.action =
            "submitAdmission";


        data.photo =
            await fileToBase64(
                photo
            );


        data.photoName =
            photo.name;


        const documentFile =
            document
            .getElementById(
                "documentFile"
            )
            .files[0];


        if(documentFile){

            data.document =
                await fileToBase64(
                    documentFile
                );


            data.documentName =
                documentFile.name;

        }


        const response =
            await fetch(

                GAS_API_URL,

                {

                    method:"POST",

                    body:
                        JSON.stringify(data)

                }

            );


        const result =
            await response.json();


        if(!result.success){

            throw new Error(
                result.message ||
                "Admission failed"
            );

        }


        currentApplication =
            result.data;


        showSuccess(
            result.data
        );


        form.reset();


        document.getElementById(
            "courseFee"
        ).value = "";


        document.getElementById(
            "photoPreview"
        ).src = "";


        hideUPI();


        alert(

            "Admission submitted successfully.\n\n" +

            "Registration Number: " +
            result.data.registrationNumber +

            "\n\n" +

            "Receipt Number: " +
            result.data.receiptNumber +

            "\n\n" +

            "Application Form PDF और Receipt PDF आपके Gmail पर भेज दिए गए हैं।"

        );


    }catch(error){

        console.error(error);


        alert(
            "Error: " +
            error.message
        );

    }


    submitBtn.disabled = false;


    submitBtn.textContent =
        "Submit Admission";

}


/* =========================================================
   BASE64
========================================================= */

function fileToBase64(file){

    return new Promise(

        (resolve,reject)=>{

            const reader =
                new FileReader();


            reader.onload =
                () => resolve(
                    reader.result
                    .split(",")[1]
                );


            reader.onerror =
                reject;


            reader.readAsDataURL(
                file
            );

        }

    );

}


/* =========================================================
   SUCCESS
========================================================= */

function showSuccess(data){

    document.getElementById(
        "registrationNumber"
    ).textContent =
        data.registrationNumber;


    document.getElementById(
        "receiptNumber"
    ).textContent =
        data.receiptNumber || "-";


    document.getElementById(
        "successMessage"
    ).innerHTML =

        "Application submitted successfully.<br>" +

        "Registration Number और Receipt Number generate हो चुके हैं।<br>" +

        "Application PDF और Receipt PDF आपके Gmail ID पर भेज दिए गए हैं।";


    document
        .getElementById(
            "successSection"
        )
        .classList.remove(
            "hidden"
        );


    populatePrintData(
        data
    );


    window.scrollTo({

        top:
            document
            .getElementById(
                "successSection"
            )
            .offsetTop,

        behavior:"smooth"

    });

}


/* =========================================================
   PRINT DATA
========================================================= */

function populatePrintData(data){

    setText(
        "printRegNo",
        data.registrationNumber
    );


    setText(
        "pStudentName",
        data.studentName
    );


    setText(
        "pFatherName",
        data.fatherName
    );


    setText(
        "pMotherName",
        data.motherName
    );


    setText(
        "pDOB",
        data.dob
    );


    setText(
        "pGender",
        data.gender
    );


    setText(
        "pMobile",
        data.mobile
    );


    setText(
        "pEmail",
        data.email
    );


    setText(

        "pAddress",

        data.address +
        ", " +
        data.village +
        ", " +
        data.district +
        ", " +
        data.state +
        " - " +
        data.pincode

    );


    setText(
        "pCourse",
        data.course
    );


    setText(
        "pBatch",
        data.batch
    );


    setText(
        "pFee",
        "₹" + data.courseFee
    );


    setText(
        "pPayment",
        data.paymentStatus
    );


    if(data.photoData){

        document.getElementById(
            "pPhoto"
        ).src =
            data.photoData;

    }else{

        document.getElementById(
            "pPhoto"
        ).src = "";

    }


    /* RECEIPT */

    setText(
        "rRegNo",
        data.registrationNumber
    );


    setText(
        "rReceiptNo",
        data.receiptNumber || "-"
    );


    setText(
        "rStudent",
        data.studentName
    );


    setText(
        "rCourse",
        data.course
    );


    setText(
        "rMobile",
        data.mobile
    );


    setText(
        "rEmail",
        data.email
    );


    setText(
        "rAmount",
        data.courseFee
    );


    setText(
        "rPaymentMode",
        data.paymentMethod
    );


    setText(
        "rPaymentStatus",
        data.paymentStatus
    );


    setText(
        "rTransaction",
        data.transactionId || "-"
    );


    setText(
        "rDate",
        data.date
    );


    const qr =
        document.getElementById(
            "receiptQR"
        );


    qr.innerHTML = "";


    new QRCode(

        qr,

        {

            text:
                data.receiptNumber ||
                data.registrationNumber,

            width:120,

            height:120

        }

    );

}


/* =========================================================
   HELPER
========================================================= */

function setText(id,value){

    const el =
        document.getElementById(id);


    if(el){

        el.textContent =
            value ?? "";

    }

}


/* =========================================================
   FORM PRINT
========================================================= */

function printApplication(){

    if(!currentApplication){

        alert(
            "Application data उपलब्ध नहीं है।"
        );


        return;

    }


    document.body.classList.remove(
        "print-receipt"
    );


    document.body.classList.add(
        "print-form"
    );


    window.print();


    setTimeout(

        function(){

            document.body.classList.remove(
                "print-form"
            );

        },

        1000

    );

}


/* =========================================================
   RECEIPT PRINT
========================================================= */

function printReceipt(){

    if(!currentApplication){

        alert(
            "Receipt data उपलब्ध नहीं है।"
        );


        return;

    }


    document.body.classList.remove(
        "print-form"
    );


    document.body.classList.add(
        "print-receipt"
    );


    window.print();


    setTimeout(

        function(){

            document.body.classList.remove(
                "print-receipt"
            );

        },

        1000

    );

}


/* =========================================================
   EDIT
========================================================= */

function editApplication(){

    document
        .getElementById(
            "successSection"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "admissionForm"
        )
        .scrollIntoView({

            behavior:"smooth"

        });

}


/* =========================================================
   RESET
========================================================= */

function resetForm(){

    if(

        confirm(
            "क्या आप पूरा form reset करना चाहते हैं?"
        )

    ){

        document
            .getElementById(
                "admissionForm"
            )
            .reset();


        document.getElementById(
            "courseFee"
        ).value = "";


        document.getElementById(
            "photoPreview"
        ).src = "";


        document
            .getElementById(
                "upiBox"
            )
            .classList.add(
                "hidden"
            );

    }

}


/* =========================================================
   ADMIN LOGIN
========================================================= */

function openAdminLogin(){

    document
        .getElementById(
            "adminLoginModal"
        )
        .classList.remove(
            "hidden"
        );

}


function closeAdminLogin(){

    document
        .getElementById(
            "adminLoginModal"
        )
        .classList.add(
            "hidden"
        );

}


async function adminLogin(){

    const username =
        document
        .getElementById(
            "adminUser"
        )
        .value
        .trim();


    const password =
        document
        .getElementById(
            "adminPassword"
        )
        .value;


    const msg =
        document.getElementById(
            "adminLoginMessage"
        );


    msg.textContent =
        "Checking login...";


    try{

        const response =
            await fetch(

                GAS_API_URL,

                {

                    method:"POST",

                    body:
                        JSON.stringify({

                            action:
                                "adminLogin",

                            username:
                                username,

                            password:
                                password

                        })

                }

            );


        const result =
            await response.json();


        if(!result.success){

            msg.textContent =
                result.message;


            return;

        }


        closeAdminLogin();


        document
            .getElementById(
                "adminDashboard"
            )
            .classList.remove(
                "hidden"
            );


        loadAdmissions();


    }catch(error){

        msg.textContent =
            error.message;

    }

}


/* =========================================================
   ADMIN DATA
========================================================= */

async function loadAdmissions(){

    try{

        const response =
            await fetch(

                GAS_API_URL +
                "?action=getAdmissions"

            );


        const result =
            await response.json();


        if(!result.success){

            alert(
                result.message
            );


            return;

        }


        allAdmissions =
            result.data || [];


        renderAdmissions(
            allAdmissions
        );


        updateStats(
            allAdmissions
        );


    }catch(error){

        alert(
            "Dashboard error: " +
            error.message
        );

    }

}


/* =========================================================
   RENDER ADMIN
========================================================= */

function renderAdmissions(data){

    const tbody =
        document.getElementById(
            "adminTableBody"
        );


    tbody.innerHTML = "";


    data.forEach(row=>{

        const tr =
            document.createElement(
                "tr"
            );


        tr.innerHTML = `

            <td>
                ${escapeHTML(row.registrationNumber)}
            </td>

            <td>
                ${escapeHTML(row.receiptNumber || "-")}
            </td>

            <td>
                ${escapeHTML(row.date)}
            </td>

            <td>
                ${escapeHTML(row.studentName)}
            </td>

            <td>
                ${escapeHTML(row.course)}
            </td>

            <td>
                ${escapeHTML(row.mobile)}
            </td>

            <td>
                ${escapeHTML(row.paymentStatus)}
            </td>

            <td>

                <select
                    onchange="updateStatus('${escapeJS(row.registrationNumber)}',this.value)">

                    <option
                        value="Applied"
                        ${row.status==="Applied"?"selected":""}>

                        Applied

                    </option>

                    <option
                        value="Verified"
                        ${row.status==="Verified"?"selected":""}>

                        Verified

                    </option>

                    <option
                        value="Approved"
                        ${row.status==="Approved"?"selected":""}>

                        Approved

                    </option>

                    <option
                        value="Active"
                        ${row.status==="Active"?"selected":""}>

                        Active

                    </option>

                </select>

            </td>

            <td>

                <button
                    class="small-btn primary"
                    onclick="viewAdmission('${escapeJS(row.registrationNumber)}')">

                    View

                </button>

            </td>

        `;


        tbody.appendChild(tr);

    });

}


/* =========================================================
   FILTER
========================================================= */

function filterAdmissions(){

    const search =
        document
        .getElementById(
            "adminSearch"
        )
        .value
        .toLowerCase();


    const course =
        document
        .getElementById(
            "adminCourseFilter"
        )
        .value;


    const payment =
        document
        .getElementById(
            "adminPaymentFilter"
        )
        .value;


    const filtered =
        allAdmissions.filter(
            row=>{

                const text =

                    (

                        row.registrationNumber +
                        " " +
                        row.receiptNumber +
                        " " +
                        row.studentName +
                        " " +
                        row.mobile

                    )
                    .toLowerCase();


                return (

                    text.includes(search) &&

                    (
                        !course ||
                        row.course === course
                    ) &&

                    (
                        !payment ||
                        row.paymentStatus === payment
                    )

                );

            }
        );


    renderAdmissions(
        filtered
    );

}


/* =========================================================
   STATS
========================================================= */

function updateStats(data){

    document.getElementById(
        "totalAdmissions"
    ).textContent =
        data.length;


    document.getElementById(
        "paidAdmissions"
    ).textContent =
        data.filter(
            x =>
            x.paymentStatus === "Paid"
        ).length;


    document.getElementById(
        "unpaidAdmissions"
    ).textContent =
        data.filter(
            x =>
            x.paymentStatus === "Unpaid"
        ).length;


    document.getElementById(
        "approvedAdmissions"
    ).textContent =
        data.filter(
            x =>
            x.status === "Approved"
        ).length;

}


/* =========================================================
   STATUS UPDATE
========================================================= */

async function updateStatus(
    registrationNumber,
    status
){

    try{

        const response =
            await fetch(

                GAS_API_URL,

                {

                    method:"POST",

                    body:
                        JSON.stringify({

                            action:
                                "updateStatus",

                            registrationNumber:
                                registrationNumber,

                            status:
                                status

                        })

                }

            );


        const result =
            await response.json();


        if(!result.success){

            alert(
                result.message
            );

        }else{

            alert(
                "Status updated successfully."
            );


            loadAdmissions();

        }

    }catch(error){

        alert(
            error.message
        );

    }

}


/* =========================================================
   VIEW ADMISSION
========================================================= */

function viewAdmission(
    registrationNumber
){

    const row =
        allAdmissions.find(

            x =>
            x.registrationNumber ===
            registrationNumber

        );


    if(!row){

        return;

    }


    let text =

        "Registration: " +
        row.registrationNumber +

        "\nReceipt: " +
        (row.receiptNumber || "-") +

        "\nName: " +
        row.studentName +

        "\nFather: " +
        row.fatherName +

        "\nMobile: " +
        row.mobile +

        "\nEmail: " +
        row.email +

        "\nCourse: " +
        row.course +

        "\nFee: ₹" +
        row.courseFee +

        "\nPayment: " +
        row.paymentStatus +

        "\nStatus: " +
        row.status;


    alert(text);

}


/* =========================================================
   LOGOUT
========================================================= */

function adminLogout(){

    document
        .getElementById(
            "adminDashboard"
        )
        .classList.add(
            "hidden"
        );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value){

    return String(
        value ?? ""
    )
    .replace(
        /[&<>"']/g,
        function(m){

            return {

                "&":"&amp;",
                "<":"&lt;",
                ">":"&gt;",
                '"':"&quot;",
                "'":"&#039;"

            }[m];

        }
    );

}


/* =========================================================
   JAVASCRIPT ESCAPE
========================================================= */

function escapeJS(value){

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
    );

}