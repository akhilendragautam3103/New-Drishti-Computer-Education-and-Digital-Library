/* =====================================================
   MY OFFICE CALCULATOR
   SCRIPT.JS
===================================================== */


/* =========================
   GLOBAL VARIABLES
========================= */

let currentInput = "";

let history =
    JSON.parse(
        localStorage.getItem(
            "officeCalcHistory"
        )
    ) || [];


/* =====================================================
   BASIC CALCULATOR
===================================================== */

function addNumber(num){

    if(
        num === "." &&
        currentInput.endsWith(".")
    ){
        return;
    }


    currentInput += num;

    updateDisplay();

}


function addOperator(operator){

    if(currentInput === ""){
        return;
    }


    let last =
        currentInput.slice(-1);


    if(
        ["+","-","*","/"].includes(last)
    ){

        currentInput =
            currentInput.slice(0,-1);

    }


    currentInput += operator;

    updateDisplay();

}


function updateDisplay(){

    document.getElementById(
        "result"
    ).innerText =
        currentInput || "0";

}


function clearCalc(){

    currentInput = "";

    document.getElementById(
        "expression"
    ).innerText = "";

    updateDisplay();

}


function backspace(){

    currentInput =
        currentInput.slice(0,-1);

    updateDisplay();

}


function percentage(){

    if(currentInput === ""){
        return;
    }


    try{

        let value =
            Function(
                '"use strict";return (' +
                currentInput +
                ')'
            )();


        currentInput =
            String(value / 100);

        updateDisplay();

    }

    catch{

        currentInput = "";

        updateDisplay();

    }

}


function calculate(){

    if(!currentInput){
        return;
    }


    try{

        let expression =
            currentInput;


        let result =
            Function(
                '"use strict";return (' +
                expression +
                ')'
            )();


        if(!isFinite(result)){
            throw new Error();
        }


        document.getElementById(
            "expression"
        ).innerText =
            expression + " =";


        document.getElementById(
            "result"
        ).innerText =
            formatNumber(result);


        saveHistory(
            expression +
            " = " +
            formatNumber(result)
        );


        currentInput =
            String(result);

    }

    catch{

        document.getElementById(
            "result"
        ).innerText =
            "Error";

    }

}


function formatNumber(num){

    return Number(num).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits:10
        }
    );

}


/* =====================================================
   GST CALCULATOR
===================================================== */

function calculateGST(){

    let amount =
        parseFloat(
            document.getElementById(
                "gstAmount"
            ).value
        );


    let rate =
        parseFloat(
            document.getElementById(
                "gstRate"
            ).value
        );


    if(isNaN(amount)){

        alert(
            "Please enter amount"
        );

        return;

    }


    let gst =
        amount * rate / 100;


    let total =
        amount + gst;


    document.getElementById(
        "gstResult"
    ).innerHTML =

        "<b>GST Amount:</b> ₹" +
        formatNumber(gst) +

        "<br><br>" +

        "<b>Total Amount:</b> ₹" +
        formatNumber(total);


    saveHistory(
        "GST: ₹" +
        formatNumber(amount) +
        " + " +
        rate +
        "% = ₹" +
        formatNumber(total)
    );

}


/* =====================================================
   DISCOUNT CALCULATOR
===================================================== */

function calculateDiscount(){

    let price =
        parseFloat(
            document.getElementById(
                "originalPrice"
            ).value
        );


    let rate =
        parseFloat(
            document.getElementById(
                "discountRate"
            ).value
        );


    if(
        isNaN(price) ||
        isNaN(rate)
    ){

        alert(
            "Please enter both values"
        );

        return;

    }


    let discount =
        price * rate / 100;


    let finalPrice =
        price - discount;


    document.getElementById(
        "discountResult"
    ).innerHTML =

        "<b>Discount:</b> ₹" +
        formatNumber(discount) +

        "<br><br>" +

        "<b>Final Price:</b> ₹" +
        formatNumber(finalPrice);


    saveHistory(
        "Discount: ₹" +
        formatNumber(price) +
        " - " +
        rate +
        "% = ₹" +
        formatNumber(finalPrice)
    );

}


/* =====================================================
   PERCENTAGE
===================================================== */

function calculatePercentage(){

    let value =
        parseFloat(
            document.getElementById(
                "percentageValue"
            ).value
        );


    let total =
        parseFloat(
            document.getElementById(
                "percentageTotal"
            ).value
        );


    if(
        isNaN(value) ||
        isNaN(total) ||
        total === 0
    ){

        alert(
            "Please enter valid values"
        );

        return;

    }


    let result =
        (value / total) * 100;


    document.getElementById(
        "percentageResult"
    ).innerHTML =

        "<b>Percentage:</b> " +
        formatNumber(result) +
        "%";


    saveHistory(
        value +
        " / " +
        total +
        " = " +
        formatNumber(result) +
        "%"
    );

}


/* =====================================================
   EMI CALCULATOR
===================================================== */

function calculateEMI(){

    let principal =
        parseFloat(
            document.getElementById(
                "loanAmount"
            ).value
        );


    let annualRate =
        parseFloat(
            document.getElementById(
                "interestRate"
            ).value
        );


    let years =
        parseFloat(
            document.getElementById(
                "loanYears"
            ).value
        );


    if(
        isNaN(principal) ||
        isNaN(annualRate) ||
        isNaN(years)
    ){

        alert(
            "Please enter all values"
        );

        return;

    }


    let monthlyRate =
        annualRate / 12 / 100;


    let months =
        years * 12;


    let emi;


    if(monthlyRate === 0){

        emi =
            principal / months;

    }

    else{

        emi =
            principal *
            monthlyRate *
            Math.pow(
                1 + monthlyRate,
                months
            ) /
            (
                Math.pow(
                    1 + monthlyRate,
                    months
                ) - 1
            );

    }


    let totalPayment =
        emi * months;


    let totalInterest =
        totalPayment - principal;


    document.getElementById(
        "emiResult"
    ).innerHTML =

        "<b>Monthly EMI:</b> ₹" +
        formatNumber(emi) +

        "<br><br>" +

        "<b>Total Interest:</b> ₹" +
        formatNumber(totalInterest) +

        "<br><br>" +

        "<b>Total Payment:</b> ₹" +
        formatNumber(totalPayment);


    saveHistory(
        "EMI: ₹" +
        formatNumber(emi) +
        " / month"
    );

}


/* =====================================================
   DENOMINATION SYSTEM
===================================================== */

function getDenominationValue(id){

    let value =
        parseInt(
            document.getElementById(id).value
        );


    if(
        isNaN(value) ||
        value < 0
    ){

        return 0;

    }


    return value;

}


function calculateDenomination(){

    let denominations = [

        {
            value:500,
            id:"note500"
        },

        {
            value:200,
            id:"note200"
        },

        {
            value:100,
            id:"note100"
        },

        {
            value:50,
            id:"note50"
        },

        {
            value:20,
            id:"note20"
        },

        {
            value:10,
            id:"note10"
        },

        {
            value:5,
            id:"note5"
        },

        {
            value:2,
            id:"note2"
        },

        {
            value:1,
            id:"note1"
        }

    ];


    let totalCash = 0;

    let totalCount = 0;


    denominations.forEach(function(item){

        let quantity =
            getDenominationValue(
                item.id
            );


        totalCash +=
            item.value * quantity;


        totalCount +=
            quantity;

    });


    document.getElementById(
        "totalCount"
    ).innerText =
        formatNumber(totalCount);


    document.getElementById(
        "totalCash"
    ).innerText =
        formatNumber(totalCash);


    return {
        totalCash:totalCash,
        totalCount:totalCount
    };

}


/* =====================================================
   SAVE DENOMINATION
===================================================== */

function saveDenomination(){

    let data =
        calculateDenomination();


    if(data.totalCount === 0){

        alert(
            "Please enter denomination quantity."
        );

        return;

    }


    saveHistory(

        "Denomination: " +
        data.totalCount +
        " Notes/Coins = ₹" +
        formatNumber(
            data.totalCash
        )

    );


    alert(
        "Denomination calculation saved in History."
    );

}


/* =====================================================
   CLEAR DENOMINATION
===================================================== */

function clearDenomination(){

    let ids = [

        "note500",
        "note200",
        "note100",
        "note50",
        "note20",
        "note10",
        "note5",
        "note2",
        "note1"

    ];


    ids.forEach(function(id){

        document.getElementById(id).value = 0;

    });


    calculateDenomination();

}


/* =====================================================
   PRINT DENOMINATION
===================================================== */

function printDenomination(){

    let data =
        calculateDenomination();


    let rows = [

        {
            denomination:500,
            id:"note500"
        },

        {
            denomination:200,
            id:"note200"
        },

        {
            denomination:100,
            id:"note100"
        },

        {
            denomination:50,
            id:"note50"
        },

        {
            denomination:20,
            id:"note20"
        },

        {
            denomination:10,
            id:"note10"
        },

        {
            denomination:5,
            id:"note5"
        },

        {
            denomination:2,
            id:"note2"
        },

        {
            denomination:1,
            id:"note1"
        }

    ];


    let tableRows = "";


    rows.forEach(function(item){

        let quantity =
            getDenominationValue(
                item.id
            );


        let amount =
            item.denomination *
            quantity;


        tableRows += `

            <tr>

                <td>
                    ₹${item.denomination}
                </td>

                <td>
                    ${quantity}
                </td>

                <td>
                    ₹${formatNumber(amount)}
                </td>

            </tr>

        `;

    });


    let printWindow =
        window.open(
            "",
            "",
            "width=800,height=700"
        );


    if(!printWindow){

        alert(
            "Please allow pop-ups to print."
        );

        return;

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                Cash Denomination Report
            </title>

            <style>

                body{

                    font-family:
                        Arial,
                        sans-serif;

                    padding:35px;

                    color:#111;

                }

                h1{

                    text-align:center;

                    margin-bottom:5px;

                }

                h2{

                    text-align:center;

                    margin-top:5px;

                }

                table{

                    width:100%;

                    border-collapse:
                        collapse;

                    margin-top:30px;

                }

                th,
                td{

                    border:
                        1px solid #333;

                    padding:12px;

                    text-align:center;

                }

                th{

                    background:#eeeeee;

                }

                .total{

                    margin-top:25px;

                    font-size:20px;

                    font-weight:bold;

                    border:
                        2px solid #333;

                    padding:15px;

                }

                .date{

                    margin-top:20px;

                }

            </style>

        </head>


        <body>

            <h1>
                MY OFFICE CALCULATOR
            </h1>

            <h2>
                CASH DENOMINATION REPORT
            </h2>


            <table>

                <thead>

                    <tr>

                        <th>
                            Denomination
                        </th>

                        <th>
                            Quantity
                        </th>

                        <th>
                            Amount
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${tableRows}

                </tbody>

            </table>


            <div class="total">

                Total Notes/Coins:
                ${formatNumber(data.totalCount)}

                <br><br>

                Total Cash:
                ₹${formatNumber(data.totalCash)}

            </div>


            <div class="date">

                Date:
                ${new Date().toLocaleString("en-IN")}

            </div>


        </body>

        </html>

    `);


    printWindow.document.close();

    printWindow.focus();

    setTimeout(function(){

        printWindow.print();

    },300);

}


/* =====================================================
   HISTORY
===================================================== */

function saveHistory(item){

    history.unshift({

        text:item,

        time:
            new Date()
            .toLocaleString("en-IN")

    });


    if(history.length > 50){

        history.pop();

    }


    localStorage.setItem(

        "officeCalcHistory",

        JSON.stringify(history)

    );


    displayHistory();

}


function displayHistory(){

    let container =
        document.getElementById(
            "historyList"
        );


    if(history.length === 0){

        container.innerHTML =
            "No calculations yet.";

        return;

    }


    container.innerHTML =

        history.map(function(item){

            return `

                <div class="history-item">

                    <b>
                        ${escapeHTML(item.text)}
                    </b>

                    <br>

                    <small>
                        ${escapeHTML(item.time)}
                    </small>

                </div>

            `;

        }).join("");

}


function clearHistory(){

    if(
        confirm(
            "Clear all calculation history?"
        )
    ){

        history = [];


        localStorage.removeItem(
            "officeCalcHistory"
        );


        displayHistory();

    }

}


/* =====================================================
   SAFE HTML
===================================================== */

function escapeHTML(value){

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


/* =====================================================
   TABS
===================================================== */

function openTab(id,button){

    document
        .querySelectorAll(".section")
        .forEach(function(section){

            section.classList.remove(
                "active"
            );

        });


    document
        .querySelectorAll(".tab")
        .forEach(function(tab){

            tab.classList.remove(
                "active"
            );

        });


    let section =
        document.getElementById(id);


    if(section){

        section.classList.add(
            "active"
        );

    }


    button.classList.add(
        "active"
    );


    /* Denomination refresh */

    if(id === "denomination"){

        calculateDenomination();

    }


    /* History refresh */

    if(id === "history"){

        displayHistory();

    }

}


/* =====================================================
   COPY RESULT
===================================================== */

function copyResult(){

    let result =
        document.getElementById(
            "result"
        ).innerText;


    if(
        navigator.clipboard &&
        window.isSecureContext
    ){

        navigator.clipboard
            .writeText(result)
            .then(function(){

                alert(
                    "Result copied!"
                );

            })

            .catch(function(){

                alert(
                    "Copy failed."
                );

            });

    }

    else{

        let textarea =
            document.createElement(
                "textarea"
            );


        textarea.value = result;


        document.body.appendChild(
            textarea
        );


        textarea.select();


        document.execCommand(
            "copy"
        );


        textarea.remove();


        alert(
            "Result copied!"
        );

    }

}


/* =====================================================
   PRINT BASIC RESULT
===================================================== */

function printResult(){

    let result =
        document.getElementById(
            "result"
        ).innerText;


    let expression =
        document.getElementById(
            "expression"
        ).innerText;


    let printWindow =
        window.open(
            "",
            "",
            "width=500,height=500"
        );


    if(!printWindow){

        alert(
            "Please allow pop-ups to print."
        );

        return;

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                Office Calculator Result
            </title>


            <style>

                body{

                    font-family:
                        Arial,
                        sans-serif;

                    padding:40px;

                }


                h1{

                    text-align:center;

                }


                .box{

                    border:
                        1px solid #ccc;

                    padding:25px;

                    margin-top:30px;

                    text-align:center;

                }


                .result{

                    font-size:32px;

                    font-weight:bold;

                }

            </style>

        </head>


        <body>

            <h1>
                MY OFFICE CALCULATOR
            </h1>


            <div class="box">

                <p>
                    Calculation
                </p>


                <h2>
                    ${escapeHTML(expression)}
                </h2>


                <div class="result">
                    ${escapeHTML(result)}
                </div>

            </div>


            <p>

                Date:
                ${new Date()
                    .toLocaleString("en-IN")}

            </p>


        </body>

        </html>

    `);


    printWindow.document.close();

    printWindow.focus();


    setTimeout(function(){

        printWindow.print();

    },300);

}


/* =====================================================
   DARK MODE
===================================================== */

function toggleTheme(){

    document.body.classList.toggle(
        "dark"
    );


    localStorage.setItem(

        "calculatorTheme",

        document.body.classList.contains(
            "dark"
        )

    );

}


/* =====================================================
   KEYBOARD
===================================================== */

document.addEventListener(
    "keydown",
    function(e){

        /*
         * यदि user किसी input box में
         * typing कर रहा है तो calculator
         * keyboard shortcuts न चलें।
         */

        let active =
            document.activeElement;


        if(
            active &&
            (
                active.tagName === "INPUT" ||
                active.tagName === "SELECT" ||
                active.tagName === "TEXTAREA"
            )
        ){

            return;

        }


        if(

            (
                e.key >= "0" &&
                e.key <= "9"
            )

            ||

            e.key === "."

        ){

            addNumber(e.key);

        }


        else if(

            [
                "+",
                "-",
                "*",
                "/"
            ].includes(e.key)

        ){

            addOperator(e.key);

        }


        else if(
            e.key === "Enter"
        ){

            e.preventDefault();

            calculate();

        }


        else if(
            e.key === "Backspace"
        ){

            backspace();

        }


        else if(
            e.key === "Escape"
        ){

            clearCalc();

        }

    }
);


/* =====================================================
   INITIALIZATION
===================================================== */

if(

    localStorage.getItem(
        "calculatorTheme"
    ) === "true"

){

    document.body.classList.add(
        "dark"
    );

}


displayHistory();

calculateDenomination();