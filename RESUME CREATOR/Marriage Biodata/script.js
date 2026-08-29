/* =========================================================
   MARRIAGE BIODATA CREATOR
   JAVASCRIPT
   NEW DRISHTI COMPUTER EDUCATION
   COMPLETE VERSION
   PRINT BLANK PAGE FIXED
========================================================= */


/* =========================================================
   GOOGLE APPS SCRIPT URL
========================================================= */

const GAS_API_URL =
"https://script.google.com/macros/s/AKfycbw5J7QfG6LbxDQlV3h3ieeeVz04MO5M1yZKlqXDJj9yZAPMsgRqfBSrdN88IFoUSC08qQ/exec";


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let currentPhoto = "";
let editingId = "";


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    generateBiodataId();

    loadRecords();

});


/* =========================================================
   SAFE ELEMENT
========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


/* =========================================================
   GENERATE BIODATA ID
========================================================= */

function generateBiodataId() {

    const element = getElement("biodataId");

    if (!element) {
        console.error("Element #biodataId not found.");
        return;
    }

    if (editingId) {

        element.textContent = editingId;

        return;

    }

    const now = new Date();

    const year = now.getFullYear();

    const random =
        Math.floor(
            1000 + Math.random() * 9000
        );

    const id =
        "MB-" +
        year +
        "-" +
        random;

    element.textContent = id;

}


/* =========================================================
   AGE CALCULATION
========================================================= */

function calculateAge() {

    const dobElement = getElement("dob");

    const ageElement = getElement("age");

    if (!dobElement || !ageElement) {
        return;
    }

    const dob = dobElement.value;

    if (!dob) {

        ageElement.value = "";

        return;

    }

    const birthDate =
        new Date(
            dob + "T00:00:00"
        );

    const today = new Date();

    let age =
        today.getFullYear() -
        birthDate.getFullYear();

    const month =
        today.getMonth() -
        birthDate.getMonth();

    if (
        month < 0 ||
        (
            month === 0 &&
            today.getDate() <
            birthDate.getDate()
        )
    ) {

        age--;

    }

    ageElement.value =
        age >= 0
            ? age
            : "";

}


/* =========================================================
   PHOTO PREVIEW
========================================================= */

function previewPhoto(event) {

    if (!event || !event.target) {
        return;
    }

    const file =
        event.target.files &&
        event.target.files[0];

    if (!file) {
        return;
    }


    /* FILE TYPE */

    if (!file.type.startsWith("image/")) {

        showMessage(
            "Please select an image file.",
            "error"
        );

        return;

    }


    /* FILE SIZE */

    if (file.size > 2 * 1024 * 1024) {

        showMessage(
            "Photo size should be less than 2 MB.",
            "error"
        );

        return;

    }


    const reader = new FileReader();


    reader.onload = function (e) {

        currentPhoto =
            e.target.result;


        const img =
            getElement("photoPreview");

        const placeholder =
            getElement("photoPlaceholder");


        if (img) {

            img.src =
                currentPhoto;

            img.style.display =
                "block";

        }


        if (placeholder) {

            placeholder.style.display =
                "none";

        }

    };


    reader.onerror = function () {

        showMessage(
            "Unable to read photo.",
            "error"
        );

    };


    reader.readAsDataURL(file);

}


/* =========================================================
   REMOVE PHOTO
========================================================= */

function removePhoto() {

    currentPhoto = "";


    const photo =
        getElement("photo");

    if (photo) {
        photo.value = "";
    }


    const img =
        getElement("photoPreview");

    const placeholder =
        getElement("photoPlaceholder");


    if (img) {

        img.src = "";

        img.style.display =
            "none";

    }


    if (placeholder) {

        placeholder.style.display =
            "flex";

    }

}


/* =========================================================
   GET FORM DATA
========================================================= */

function getFormData() {

    const idElement =
        getElement("biodataId");


    let biodataId =
        idElement
            ? String(
                idElement.textContent || ""
              ).trim()
            : "";


    if (
        !biodataId ||
        biodataId === "Generating..."
    ) {

        generateBiodataId();


        if (idElement) {

            biodataId =
                String(
                    idElement.textContent || ""
                ).trim();

        }

    }


    const templateRadio =
        document.querySelector(
            'input[name="template"]:checked'
        );


    const template =
        templateRadio
            ? templateRadio.value
            : "template1";


    return {

        biodataId: biodataId,

        fullName:
            getValue("fullName"),

        gender:
            getValue("gender"),

        dob:
            getValue("dob"),

        age:
            getValue("age"),

        height:
            getValue("height"),

        complexion:
            getValue("complexion"),

        religion:
            getValue("religion"),

        caste:
            getValue("caste"),

        motherTongue:
            getValue("motherTongue"),

        manglik:
            getValue("manglik"),


        education:
            getValue("education"),

        university:
            getValue("university"),

        profession:
            getValue("profession"),

        company:
            getValue("company"),

        income:
            getValue("income"),

        workLocation:
            getValue("workLocation"),


        fatherName:
            getValue("fatherName"),

        fatherOccupation:
            getValue("fatherOccupation"),

        motherName:
            getValue("motherName"),

        motherOccupation:
            getValue("motherOccupation"),

        brothers:
            getValue("brothers"),

        sisters:
            getValue("sisters"),

        familyType:
            getValue("familyType"),

        familyStatus:
            getValue("familyStatus"),


        address:
            getValue("address"),

        city:
            getValue("city"),

        district:
            getValue("district"),

        state:
            getValue("state"),

        pincode:
            getValue("pincode"),


        partnerAge:
            getValue("partnerAge"),

        partnerHeight:
            getValue("partnerHeight"),

        partnerEducation:
            getValue("partnerEducation"),

        partnerProfession:
            getValue("partnerProfession"),

        partnerLocation:
            getValue("partnerLocation"),

        partnerOther:
            getValue("partnerOther"),


        hobbies:
            getValue("hobbies"),

        aboutMe:
            getValue("aboutMe"),


        contactPerson:
            getValue("contactPerson"),

        mobile:
            getValue("mobile"),

        alternateMobile:
            getValue("alternateMobile"),

        email:
            getValue("email"),


        photo:
            currentPhoto || "",

        template:
            template

    };

}


/* =========================================================
   GET VALUE
========================================================= */

function getValue(id) {

    const element =
        getElement(id);


    if (!element) {
        return "";
    }


    return String(
        element.value || ""
    ).trim();

}


/* =========================================================
   SAVE BIODATA
========================================================= */

async function saveBiodata() {

    const data =
        getFormData();


    if (!data.biodataId) {

        showMessage(
            "Biodata ID could not be generated.",
            "error"
        );

        generateBiodataId();

        return;

    }


    if (!data.fullName) {

        showMessage(
            "Please enter Full Name.",
            "error"
        );

        const name =
            getElement("fullName");

        if (name) {
            name.focus();
        }

        return;

    }


    if (!data.mobile) {

        showMessage(
            "Please enter Mobile Number.",
            "error"
        );

        const mobile =
            getElement("mobile");

        if (mobile) {
            mobile.focus();
        }

        return;

    }


    if (
        !/^[0-9]{10}$/.test(
            data.mobile
        )
    ) {

        showMessage(
            "Please enter a valid 10 digit mobile number.",
            "error"
        );

        return;

    }


    if (
        !GAS_API_URL ||
        !GAS_API_URL.includes("/exec")
    ) {

        showMessage(
            "Google Apps Script /exec URL is invalid.",
            "error"
        );

        return;

    }


    showMessage(

        editingId
            ? "Updating biodata..."
            : "Saving biodata...",

        "success"

    );


    const saveButton =
        document.querySelector(
            ".btn.save"
        );


    let oldButtonText = "";


    if (saveButton) {

        oldButtonText =
            saveButton.innerHTML;

        saveButton.disabled =
            true;

        saveButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    }


    try {

        const payload = {

            action:
                editingId
                    ? "update"
                    : "save",

            data:
                data

        };


        console.log(
            "Sending biodata:",
            payload
        );


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
                        JSON.stringify(
                            payload
                        )

                }
            );


        const responseText =
            await response.text();


        console.log(
            "GAS Response:",
            responseText
        );


        let result;


        try {

            result =
                JSON.parse(
                    responseText
                );

        }
        catch (parseError) {

            console.error(
                "JSON Parse Error:",
                parseError
            );

            throw new Error(
                "Invalid response received from Google Apps Script."
            );

        }


        if (
            result &&
            result.success
        ) {

            editingId =
                data.biodataId;


            showMessage(
                result.message ||
                "Biodata saved successfully.",
                "success"
            );


            await loadRecords();

        }
        else {

            showMessage(

                result &&
                result.message
                    ? result.message
                    : "Unable to save biodata.",

                "error"

            );

        }

    }
    catch (error) {

        console.error(
            "SAVE ERROR:",
            error
        );


        showMessage(
            error.message ||
            "Server connection error.",
            "error"
        );

    }
    finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.innerHTML =
                oldButtonText;

        }

    }

}


/* =========================================================
   LOAD RECORDS
========================================================= */

async function loadRecords() {

    const list =
        getElement("recordsList");


    const dropdown =
        getElement("biodataDropdown");


    if (dropdown) {

        dropdown.innerHTML =
            '<option value="">-- Select Biodata ID + Name --</option>';

    }


    if (list) {

        list.innerHTML =
            '<div class="loading">Loading biodata...</div>';

    }


    try {

        const response =
            await fetch(
                GAS_API_URL +
                "?action=list&t=" +
                Date.now()
            );


        const responseText =
            await response.text();


        let result;


        try {

            result =
                JSON.parse(
                    responseText
                );

        }
        catch (error) {

            throw new Error(
                "Invalid list response from Google Apps Script."
            );

        }


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result &&
                result.message
                    ? result.message
                    : "Unable to load records."
            );

        }


        if (list) {
            list.innerHTML = "";
        }


        const records =
            Array.isArray(
                result.records
            )
                ? result.records
                : [];


        if (
            records.length === 0
        ) {

            if (list) {

                list.innerHTML =
                    `<div class="loading">
                        No biodata found.
                    </div>`;

            }

            return;

        }


        records.forEach(
            function(record) {


                /* DROPDOWN */

                if (dropdown) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        record.biodataId ||
                        "";


                    option.textContent =
                        (
                            record.biodataId ||
                            ""
                        ) +
                        " + " +
                        (
                            record.fullName ||
                            ""
                        );


                    dropdown.appendChild(
                        option
                    );

                }


                /* RECORD LIST */

                if (list) {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "record-item";


                    item.innerHTML = `

                        <div class="record-info">

                            <strong>
                                ${escapeHTML(
                                    record.fullName
                                )}
                            </strong>

                            <span>
                                ID:
                                ${escapeHTML(
                                    record.biodataId
                                )}

                                |

                                Mobile:
                                ${escapeHTML(
                                    record.mobile
                                )}
                            </span>

                        </div>


                        <div class="record-actions">

                            <button
                                type="button"
                                onclick="loadBiodata('${escapeJS(
                                    record.biodataId
                                )}')">

                                ✏️ Edit

                            </button>


                            <button
                                type="button"
                                onclick="deleteBiodata('${escapeJS(
                                    record.biodataId
                                )}')">

                                🗑️ Delete

                            </button>

                        </div>

                    `;


                    list.appendChild(
                        item
                    );

                }

            }
        );

    }
    catch (error) {

        console.error(
            "LOAD RECORDS ERROR:",
            error
        );


        if (list) {

            list.innerHTML =
                `<div class="loading">
                    Server connection unavailable.
                </div>`;

        }

    }

}


/* =========================================================
   LOAD SELECTED BIODATA
========================================================= */

function loadSelectedBiodata() {

    const dropdown =
        getElement(
            "biodataDropdown"
        );


    if (!dropdown) {
        return;
    }


    const id =
        dropdown.value;


    if (!id) {
        return;
    }


    loadBiodata(id);

}


/* =========================================================
   LOAD BIODATA
========================================================= */

async function loadBiodata(id) {

    if (!id) {

        showMessage(
            "Biodata ID is missing.",
            "error"
        );

        return;

    }


    try {

        showMessage(
            "Loading biodata...",
            "success"
        );


        const response =
            await fetch(

                GAS_API_URL +
                "?action=get&id=" +
                encodeURIComponent(id) +
                "&t=" +
                Date.now()

            );


        const responseText =
            await response.text();


        let result;


        try {

            result =
                JSON.parse(
                    responseText
                );

        }
        catch (error) {

            throw new Error(
                "Invalid response from Google Apps Script."
            );

        }


        if (
            !result ||
            !result.success ||
            !result.data
        ) {

            showMessage(
                result &&
                result.message
                    ? result.message
                    : "Biodata not found.",
                "error"
            );

            return;

        }


        const data =
            result.data;


        editingId =
            data.biodataId || id;


        const idElement =
            getElement("biodataId");


        if (idElement) {

            idElement.textContent =
                editingId;

        }


        Object.keys(data)
            .forEach(
                function(key) {

                    if (
                        key === "photo" ||
                        key === "template" ||
                        key === "biodataId" ||
                        key === "createdAt" ||
                        key === "updatedAt"
                    ) {

                        return;

                    }


                    const element =
                        getElement(key);


                    if (!element) {
                        return;
                    }


                    element.value =
                        data[key] || "";

                }
            );


        /* PHOTO */

        if (data.photo) {

            currentPhoto =
                data.photo;


            const img =
                getElement(
                    "photoPreview"
                );


            const placeholder =
                getElement(
                    "photoPlaceholder"
                );


            if (img) {

                img.src =
                    data.photo;

                img.style.display =
                    "block";

            }


            if (placeholder) {

                placeholder.style.display =
                    "none";

            }

        }
        else {

            removePhoto();

        }


        /* TEMPLATE */

        if (data.template) {

            const radio =
                document.querySelector(

                    'input[name="template"][value="' +
                    CSS.escape(
                        data.template
                    ) +
                    '"]'

                );


            if (radio) {

                radio.checked =
                    true;

            }

        }


        calculateAge();


        if (
            typeof showSectionById ===
            "function"
        ) {

            showSectionById(
                "formSection"
            );

        }


        showMessage(
            "Biodata loaded successfully.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "LOAD BIODATA ERROR:",
            error
        );


        showMessage(
            error.message ||
            "Unable to load biodata.",
            "error"
        );

    }

}


/* =========================================================
   DELETE BIODATA
========================================================= */

async function deleteBiodata(id) {

    if (!id) {

        showMessage(
            "Biodata ID is missing.",
            "error"
        );

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this biodata?"
        );


    if (!confirmed) {
        return;
    }


    try {

        showMessage(
            "Deleting biodata...",
            "success"
        );


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
                        JSON.stringify({

                            action:
                                "delete",

                            biodataId:
                                id

                        })

                }
            );


        const responseText =
            await response.text();


        let result;


        try {

            result =
                JSON.parse(
                    responseText
                );

        }
        catch (error) {

            throw new Error(
                "Invalid delete response."
            );

        }


        if (
            result &&
            result.success
        ) {

            if (
                editingId === id
            ) {

                editingId = "";

            }


            showMessage(
                result.message ||
                "Biodata deleted successfully.",
                "success"
            );


            await loadRecords();

        }
        else {

            showMessage(
                result &&
                result.message
                    ? result.message
                    : "Delete failed.",
                "error"
            );

        }

    }
    catch (error) {

        console.error(
            "DELETE ERROR:",
            error
        );


        showMessage(
            error.message ||
            "Server error.",
            "error"
        );

    }

}


/* =========================================================
   PREVIEW
========================================================= */

function previewBiodata() {

    const data =
        getFormData();


    if (!data.fullName) {

        showMessage(
            "Please enter Full Name first.",
            "error"
        );

        return;

    }


    const preview =
        getElement(
            "biodataPreview"
        );


    const modal =
        getElement(
            "previewModal"
        );


    if (!preview || !modal) {

        showMessage(
            "Preview area not found in HTML.",
            "error"
        );

        return;

    }


    preview.innerHTML =
        generateBiodataHTML(
            data
        );


    modal.classList.add(
        "show"
    );

}


/* =========================================================
   CLOSE PREVIEW
========================================================= */

function closePreview() {

    const modal =
        getElement(
            "previewModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   ========================================================
   PRINT BIODATA - MAJOR FIX
   ========================================================
========================================================= */

function printBiodata() {

    const data =
        getFormData();


    /* =========================================
       VALIDATION
    ========================================= */

    if (!data.fullName) {

        showMessage(
            "Please enter Full Name first.",
            "error"
        );

        return;

    }


    /* =========================================
       GENERATE COMPLETE BIODATA
    ========================================= */

    const biodataHTML =
        generateBiodataHTML(data);


    if (!biodataHTML) {

        showMessage(
            "Unable to generate biodata for printing.",
            "error"
        );

        return;

    }


    /* =========================================
       CREATE PRINT WINDOW
    ========================================= */

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=1100"
        );


    if (!printWindow) {

        showMessage(
            "Print window was blocked by the browser. Please allow pop-ups for this site.",
            "error"
        );

        return;

    }


    /* =========================================
       COMPLETE PRINT DOCUMENT
    ========================================= */

    const printDocument = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta name="viewport"
      content="width=device-width, initial-scale=1.0">

<title>
    Marriage Biodata -
    ${escapeHTML(data.fullName)}
</title>


<style>

/* =====================================================
   PRINT DOCUMENT BASE
===================================================== */

* {

    box-sizing:
        border-box;

}


html,
body {

    margin:
        0;

    padding:
        0;

    background:
        #ffffff;

    font-family:
        Arial,
        Helvetica,
        sans-serif;

    color:
        #222;

}


body {

    width:
        100%;

}


/* =====================================================
   BIODATA PAGE
===================================================== */

.biodata-page {

    width:
        100%;

    max-width:
        850px;

    margin:
        0 auto;

    padding:
        25px;

    background:
        #ffffff;

    box-sizing:
        border-box;

}


/* =====================================================
   HEADER
===================================================== */

.biodata-header {

    display:
        flex;

    align-items:
        center;

    gap:
        20px;

    padding:
        18px;

    margin-bottom:
        20px;

    border-bottom:
        2px solid #ddd;

}


.preview-photo {

    width:
        120px;

    height:
        145px;

    object-fit:
        cover;

    object-position:
        center;

    border:
        3px solid #ddd;

    border-radius:
        8px;

    flex-shrink:
        0;

}


.biodata-name {

    font-size:
        28px;

    font-weight:
        700;

    margin-bottom:
        8px;

    word-break:
        break-word;

}


.biodata-id {

    font-size:
        13px;

    color:
        #555;

}


/* =====================================================
   INFO SECTION
===================================================== */

.info-section {

    width:
        100%;

    margin-top:
        18px;

    margin-bottom:
        18px;

    page-break-inside:
        avoid;

}


.info-section h3 {

    margin:
        0;

    padding:
        9px 12px;

    color:
        #ffffff;

    font-size:
        16px;

    font-weight:
        700;

    border-radius:
        5px 5px 0 0;

    print-color-adjust:
        exact;

    -webkit-print-color-adjust:
        exact;

}


/* =====================================================
   TABLE
===================================================== */

.info-table {

    width:
        100%;

    border-collapse:
        collapse;

    table-layout:
        fixed;

}


.info-table tr {

    page-break-inside:
        avoid;

}


.info-table td {

    border:
        1px solid #d9d9d9;

    padding:
        8px 10px;

    vertical-align:
        top;

    font-size:
        13px;

    line-height:
        1.4;

    word-break:
        break-word;

    overflow-wrap:
        anywhere;

}


.info-table td:first-child {

    width:
        32%;

    font-weight:
        700;

    background:
        #f7f7f7;

    print-color-adjust:
        exact;

    -webkit-print-color-adjust:
        exact;

}


/* =====================================================
   ABOUT / HOBBIES
===================================================== */

.about-box {

    border:
        1px solid #d9d9d9;

    padding:
        12px;

    font-size:
        13px;

    line-height:
        1.6;

    white-space:
        pre-wrap;

    word-break:
        break-word;

    overflow-wrap:
        anywhere;

    page-break-inside:
        avoid;

}


/* =====================================================
   FOOTER
===================================================== */

.biodata-page > div:last-child {

    page-break-inside:
        avoid;

}


/* =====================================================
   PRINT SETTINGS
===================================================== */

@page {

    size:
        A4 portrait;

    margin:
        10mm;

}


@media print {

    html,
    body {

        width:
            100%;

        margin:
            0;

        padding:
            0;

        background:
            #ffffff;

    }


    .biodata-page {

        width:
            100%;

        max-width:
            none;

        margin:
            0;

        padding:
            5mm;

        border-top-width:
            8px !important;

    }


    .info-section {

        break-inside:
            avoid;

        page-break-inside:
            avoid;

    }


    .info-table tr {

        break-inside:
            avoid;

        page-break-inside:
            avoid;

    }


    .about-box {

        break-inside:
            avoid;

        page-break-inside:
            avoid;

    }


    .biodata-header {

        break-inside:
            avoid;

        page-break-inside:
            avoid;

    }


    * {

        -webkit-print-color-adjust:
            exact !important;

        print-color-adjust:
            exact !important;

    }

}


/* =====================================================
   SCREEN PREVIEW OF PRINT WINDOW
===================================================== */

@media screen {

    body {

        padding:
            20px;

        background:
            #eeeeee;

    }

    .biodata-page {

        box-shadow:
            0 5px 25px
            rgba(0,0,0,0.15);

        margin:
            0 auto;

    }

}

</style>

</head>


<body>

${biodataHTML}


<script>

window.addEventListener(
    "load",
    function () {

        setTimeout(
            function () {

                window.focus();

                window.print();

            },
            700
        );

    }
);

window.addEventListener(
    "afterprint",
    function () {

        setTimeout(
            function () {

                window.close();

            },
            300
        );

    }
);

</script>


</body>

</html>

`;


    /* =========================================
       WRITE DOCUMENT
    ========================================= */

    try {

        printWindow.document.open();

        printWindow.document.write(
            printDocument
        );

        printWindow.document.close();

    }
    catch (error) {

        console.error(
            "PRINT WINDOW ERROR:",
            error
        );

        try {
            printWindow.close();
        }
        catch (e) {}

        showMessage(
            "Unable to prepare print page.",
            "error"
        );

    }

}


/* =========================================================
   GENERATE BIODATA HTML
========================================================= */

function generateBiodataHTML(data) {

    const theme =
        getThemeColors(
            data.template
        );


    const photo =
        data.photo

            ? `

                <img
                    class="preview-photo"
                    src="${escapeHTML(
                        data.photo
                    )}"
                    alt="Profile Photo">

              `

            : `

                <div
                    class="preview-photo"
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        background:#eee;
                        font-size:45px;
                    "
                >
                    👤
                </div>

              `;


    return `

        <div
            class="biodata-page"
            style="
                border-top:12px solid
                ${theme.primary};
            "
        >


            <!-- HEADER -->

            <div
                class="biodata-header"
                style="
                    background:${theme.light};
                    border-bottom-color:
                    ${theme.secondary};
                "
            >

                ${photo}


                <div>

                    <div
                        class="biodata-name"
                        style="
                            color:
                            ${theme.primary};
                        "
                    >

                        ${escapeHTML(
                            data.fullName
                        )}

                    </div>


                    <div class="biodata-id">

                        Biodata ID:

                        <strong>

                            ${escapeHTML(
                                data.biodataId
                            )}

                        </strong>

                    </div>


                    ${
                        data.profession

                            ? `

                                <div
                                    style="
                                        margin-top:10px;
                                    "
                                >

                                    ${escapeHTML(
                                        data.profession
                                    )}

                                    ${
                                        data.company
                                            ? " • " +
                                              escapeHTML(
                                                  data.company
                                              )
                                            : ""
                                    }

                                </div>

                              `

                            : ""

                    }

                </div>

            </div>


            <!-- PERSONAL -->

            ${sectionHTML(

                "Personal Details",

                `

                    ${row(
                        "Date of Birth",
                        data.dob
                    )}

                    ${row(
                        "Age",
                        data.age
                    )}

                    ${row(
                        "Gender",
                        data.gender
                    )}

                    ${row(
                        "Height",
                        data.height
                    )}

                    ${row(
                        "Complexion",
                        data.complexion
                    )}

                    ${row(
                        "Religion",
                        data.religion
                    )}

                    ${row(
                        "Caste",
                        data.caste
                    )}

                    ${row(
                        "Mother Tongue",
                        data.motherTongue
                    )}

                    ${row(
                        "Manglik",
                        data.manglik
                    )}

                `,

                theme

            )}


            <!-- EDUCATION -->

            ${sectionHTML(

                "Education & Career",

                `

                    ${row(
                        "Qualification",
                        data.education
                    )}

                    ${row(
                        "University / College",
                        data.university
                    )}

                    ${row(
                        "Profession",
                        data.profession
                    )}

                    ${row(
                        "Company",
                        data.company
                    )}

                    ${row(
                        "Annual Income",
                        data.income
                    )}

                    ${row(
                        "Work Location",
                        data.workLocation
                    )}

                `,

                theme

            )}


            <!-- FAMILY -->

            ${sectionHTML(

                "Family Details",

                `

                    ${row(
                        "Father",
                        data.fatherName
                    )}

                    ${row(
                        "Father's Occupation",
                        data.fatherOccupation
                    )}

                    ${row(
                        "Mother",
                        data.motherName
                    )}

                    ${row(
                        "Mother's Occupation",
                        data.motherOccupation
                    )}

                    ${row(
                        "Brothers",
                        data.brothers
                    )}

                    ${row(
                        "Sisters",
                        data.sisters
                    )}

                    ${row(
                        "Family Type",
                        data.familyType
                    )}

                    ${row(
                        "Family Status",
                        data.familyStatus
                    )}

                `,

                theme

            )}


            <!-- ADDRESS -->

            ${sectionHTML(

                "Address",

                `

                    ${row(
                        "Address",
                        data.address
                    )}

                    ${row(
                        "City",
                        data.city
                    )}

                    ${row(
                        "District",
                        data.district
                    )}

                    ${row(
                        "State",
                        data.state
                    )}

                    ${row(
                        "PIN Code",
                        data.pincode
                    )}

                `,

                theme

            )}


            <!-- PARTNER -->

            ${sectionHTML(

                "Partner Preference",

                `

                    ${row(
                        "Preferred Age",
                        data.partnerAge
                    )}

                    ${row(
                        "Preferred Height",
                        data.partnerHeight
                    )}

                    ${row(
                        "Education",
                        data.partnerEducation
                    )}

                    ${row(
                        "Profession",
                        data.partnerProfession
                    )}

                    ${row(
                        "Location",
                        data.partnerLocation
                    )}

                    ${row(
                        "Other Preference",
                        data.partnerOther
                    )}

                `,

                theme

            )}


            <!-- HOBBIES -->

            ${
                data.hobbies

                    ? `

                        <div
                            class="info-section"
                        >

                            <h3
                                style="
                                    background:
                                    ${theme.primary};
                                "
                            >

                                Hobbies & Interests

                            </h3>


                            <div class="about-box">

                                ${escapeHTML(
                                    data.hobbies
                                )}

                            </div>

                        </div>

                      `

                    : ""

            }


            <!-- ABOUT -->

            ${
                data.aboutMe

                    ? `

                        <div
                            class="info-section"
                        >

                            <h3
                                style="
                                    background:
                                    ${theme.primary};
                                "
                            >

                                About Me

                            </h3>


                            <div class="about-box">

                                ${escapeHTML(
                                    data.aboutMe
                                )}

                            </div>

                        </div>

                      `

                    : ""

            }


            <!-- CONTACT -->

            ${sectionHTML(

                "Contact Details",

                `

                    ${row(
                        "Contact Person",
                        data.contactPerson
                    )}

                    ${row(
                        "Mobile",
                        data.mobile
                    )}

                    ${row(
                        "Alternate Mobile",
                        data.alternateMobile
                    )}

                    ${row(
                        "Email",
                        data.email
                    )}

                `,

                theme

            )}


            <!-- FOOTER -->

            <div
                style="
                    margin-top:30px;
                    text-align:center;
                    font-size:11px;
                    color:#777;
                    border-top:1px solid #ddd;
                    padding-top:12px;
                "
            >

                Marriage Biodata •
                NEW DRISHTI COMPUTER EDUCATION

            </div>


        </div>

    `;

}


/* =========================================================
   SECTION HTML
========================================================= */

function sectionHTML(
    title,
    content,
    theme
) {

    if (
        !content ||
        !content.trim()
    ) {

        return "";

    }


    return `

        <div
            class="info-section"
        >

            <h3
                style="
                    background:
                    linear-gradient(
                        135deg,
                        ${theme.primary},
                        ${theme.secondary}
                    );
                "
            >

                ${escapeHTML(
                    title
                )}

            </h3>


            <table
                class="info-table"
            >

                ${content}

            </table>

        </div>

    `;

}


/* =========================================================
   ROW
========================================================= */

function row(
    label,
    value
) {

    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {

        return "";

    }


    return `

        <tr>

            <td>
                ${escapeHTML(
                    label
                )}
            </td>


            <td>
                ${escapeHTML(
                    value
                )}
            </td>

        </tr>

    `;

}


/* =========================================================
   THEMES
========================================================= */

function getThemeColors(
    template
) {

    const themes = {

        template1: {

            primary:
                "#991b1b",

            secondary:
                "#f59e0b",

            light:
                "#fff7ed"

        },


        template2: {

            primary:
                "#3730a3",

            secondary:
                "#6366f1",

            light:
                "#eef2ff"

        },


        template3: {

            primary:
                "#be185d",

            secondary:
                "#fb7185",

            light:
                "#fff1f2"

        },


        template4: {

            primary:
                "#57534e",

            secondary:
                "#a8a29e",

            light:
                "#f5f5f4"

        },


        template5: {

            primary:
                "#0369a1",

            secondary:
                "#06b6d4",

            light:
                "#ecfeff"

        },


        template6: {

            primary:
                "#db2777",

            secondary:
                "#f472b6",

            light:
                "#fdf2f8"

        },


        template7: {

            primary:
                "#166534",

            secondary:
                "#22c55e",

            light:
                "#f0fdf4"

        },


        template8: {

            primary:
                "#581c87",

            secondary:
                "#c084fc",

            light:
                "#faf5ff"

        }

    };


    return (
        themes[template] ||
        themes.template1
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function showSection(
    id,
    button
) {

    document
        .querySelectorAll(
            ".page-section"
        )
        .forEach(
            function(section) {

                section.classList.remove(
                    "active"
                );

            }
        );


    const target =
        getElement(id);


    if (target) {

        target.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(
            ".nav-btn"
        )
        .forEach(
            function(btn) {

                btn.classList.remove(
                    "active"
                );

            }
        );


    if (button) {

        button.classList.add(
            "active"
        );

    }

}


/* =========================================================
   SHOW SECTION BY ID
========================================================= */

function showSectionById(id) {

    document
        .querySelectorAll(
            ".page-section"
        )
        .forEach(
            function(section) {

                section.classList.remove(
                    "active"
                );

            }
        );


    const target =
        getElement(id);


    if (target) {

        target.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(
            ".nav-btn"
        )
        .forEach(
            function(btn) {

                btn.classList.remove(
                    "active"
                );

            }
        );


    const first =
        document.querySelector(
            '.nav-btn[onclick*="' +
            id +
            '"]'
        );


    if (first) {

        first.classList.add(
            "active"
        );

    }

}


/* =========================================================
   RESET FORM
========================================================= */

function resetForm() {

    const confirmed =
        confirm(
            "Clear all entered information?"
        );


    if (!confirmed) {
        return;
    }


    document
        .querySelectorAll(
            "input, select, textarea"
        )
        .forEach(
            function(element) {

                if (
                    element.type === "radio"
                ) {

                    element.checked =
                        element.value ===
                        "template1";

                }
                else if (
                    element.type === "file"
                ) {

                    element.value = "";

                }
                else {

                    element.value = "";

                }

            }
        );


    editingId = "";

    currentPhoto = "";


    removePhoto();


    generateBiodataId();


    showMessage(
        "Form reset successfully.",
        "success"
    );

}


/* =========================================================
   DARK MODE
========================================================= */

function toggleDarkMode() {

    document.body.classList.toggle(
        "dark"
    );


    localStorage.setItem(

        "marriageDarkMode",

        document.body.classList.contains(
            "dark"
        )

    );

}


/* =========================================================
   RESTORE DARK MODE
========================================================= */

(function restoreDarkMode() {

    if (
        localStorage.getItem(
            "marriageDarkMode"
        ) === "true"
    ) {

        document.body.classList.add(
            "dark"
        );

    }

})();


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    type
) {

    const box =
        getElement(
            "messageBox"
        );


    if (!box) {

        console.log(
            message
        );

        return;

    }


    box.textContent =
        message;


    box.className =
        "message-box " +
        (
            type ||
            ""
        );


    setTimeout(
        function() {

            box.className =
                "message-box";

        },
        5000
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value || ""
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
   ESCAPE JAVASCRIPT
========================================================= */

function escapeJS(
    value
) {

    return String(
        value || ""
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


/* =========================================================
   CLOSE MODAL ON BACKGROUND CLICK
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const modal =
            getElement(
                "previewModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            closePreview();

        }

    }
);


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            closePreview();

        }

    }
);


/* =========================================================
   BEFORE UNLOAD
========================================================= */

window.addEventListener(
    "beforeunload",
    function() {

        /*
         * Reserved for future
         * unsaved-change warning.
         */

    }
);