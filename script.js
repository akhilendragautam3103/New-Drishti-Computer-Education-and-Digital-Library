// MOBILE MENU

const menuBtn = document.getElementById("menuBtn");
const navbar = document.getElementById("navbar");

menuBtn.addEventListener("click", function () {

    navbar.classList.toggle("active");

});


// DARK MODE

const darkBtn = document.getElementById("darkBtn");

darkBtn.addEventListener("click", function () {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        darkBtn.innerHTML = "☀️";

    } else {

        darkBtn.innerHTML = "🌙";

    }

});


// COURSE POPUP

function courseInfo(course) {

    let title = document.getElementById("popupTitle");
    let text = document.getElementById("popupText");

    if (course === "DCA") {

        title.innerHTML = "DCA Course";

        text.innerHTML =
        "DCA में Computer Fundamentals, MS Word, Excel, PowerPoint, Internet, HTML आदि की practical training दी जाती है।";

    }

    else if (course === "ADCA") {

        title.innerHTML = "ADCA Course";

        text.innerHTML =
        "ADCA एक advanced computer course है जिसमें Office, Internet, HTML, CSS, JavaScript, Tally आदि topics शामिल किए जा सकते हैं।";

    }

    else if (course === "CCC") {

        title.innerHTML = "CCC Course";

        text.innerHTML =
        "CCC course में Computer Fundamentals, Internet, Digital Services, MS Office आदि की basic जानकारी दी जाती है।";

    }

    else if (course === "Tally") {

        title.innerHTML = "Tally Course";

        text.innerHTML =
        "Tally training में accounting, company creation, ledger, voucher, GST एवं reports का practical अभ्यास कराया जाता है।";

    }

    else if (course === "Typing") {

        title.innerHTML = "Typing Course";

        text.innerHTML =
        "Hindi और English typing की regular practice के साथ typing speed और accuracy बढ़ाने का अभ्यास कराया जाता है।";

    }

    document.getElementById("popup").style.display = "flex";

}


// CLOSE POPUP

function closePopup() {

    document.getElementById("popup").style.display = "none";

}


// ABOUT MESSAGE

function showMessage() {

    alert(
        "New Drishti Computer Education में Computer Education, CSC Services और Digital Library की सुविधाएं उपलब्ध हैं।"
    );

}


// CONTACT FORM

document.getElementById("contactForm")
.addEventListener("submit", function(event) {

    event.preventDefault();

    let name =
        document.getElementById("name").value;

    let phone =
        document.getElementById("phone").value;

    let course =
        document.getElementById("course").value;

    if (name === "" || phone === "") {

        alert("कृपया Name और Mobile Number भरें।");

        return;

    }

    alert(
        "धन्यवाद " + name +
        "! आपकी enquiry प्राप्त हो गई है।" +
        "\nCourse: " + course
    );

    this.reset();

});


// CLOSE MOBILE MENU AFTER CLICK

document.querySelectorAll("nav a")
.forEach(function(link) {

    link.addEventListener("click", function() {

        navbar.classList.remove("active");

    });

});
