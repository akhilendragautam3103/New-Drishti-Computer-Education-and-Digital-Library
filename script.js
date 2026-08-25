// ==========================================
// NEW DRISHTI WEBSITE JAVASCRIPT
// GOOGLE SHEET + EMAIL ENQUIRY
// ==========================================


// ==========================================
// GOOGLE APPS SCRIPT URL
// ==========================================

const GOOGLE_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbyWmz-3Yw0FQBHqJSPMKG--E_px-8qm5pm97tGc1bWFnY7eYi5ryhnAaoNWDKwCqGjT6A/exec";


// ==========================================
// ELEMENTS
// ==========================================

const contactForm =
    document.getElementById("contactForm");

const submitBtn =
    document.getElementById("submitBtn");

const formStatus =
    document.getElementById("formStatus");


// ==========================================
// FORM SUBMIT
// ==========================================

if (contactForm) {

    contactForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ----------------------------------
            // GET VALUES
            // ----------------------------------

            const name =
                document.getElementById("name")
                .value
                .trim();

            const phone =
                document.getElementById("phone")
                .value
                .trim();

            const course =
                document.getElementById("course")
                .value;

            const message =
                document.getElementById("message")
                .value
                .trim();


            // ----------------------------------
            // VALIDATION
            // ----------------------------------

            if (name === "") {

                showStatus(
                    "❌ कृपया अपना नाम दर्ज करें।",
                    "error"
                );

                document
                    .getElementById("name")
                    .focus();

                return;
            }


            if (phone === "") {

                showStatus(
                    "❌ कृपया अपना Mobile Number दर्ज करें।",
                    "error"
                );

                document
                    .getElementById("phone")
                    .focus();

                return;
            }


            if (!/^[0-9]{10}$/.test(phone)) {

                showStatus(
                    "❌ कृपया 10 अंकों का सही Mobile Number दर्ज करें।",
                    "error"
                );

                document
                    .getElementById("phone")
                    .focus();

                return;
            }


            if (course === "") {

                showStatus(
                    "❌ कृपया Course Select करें।",
                    "error"
                );

                document
                    .getElementById("course")
                    .focus();

                return;
            }


            // ----------------------------------
            // LOADING
            // ----------------------------------

            submitBtn.disabled = true;

            submitBtn.innerHTML =
                "⏳ Sending...";


            showStatus(
                "⏳ आपकी enquiry भेजी जा रही है...",
                "loading"
            );


            // ----------------------------------
            // FORM DATA
            // ----------------------------------

            const formData =
                new FormData();


            formData.append(
                "name",
                name
            );

            formData.append(
                "phone",
                phone
            );

            formData.append(
                "course",
                course
            );

            formData.append(
                "message",
                message
            );


            // ----------------------------------
            // SEND TO GOOGLE APPS SCRIPT
            // ----------------------------------

            try {

                await fetch(
                    GOOGLE_SCRIPT_URL,
                    {
                        method: "POST",

                        body: formData,

                        mode: "no-cors"
                    }
                );


                // ----------------------------------
                // SUCCESS
                // ----------------------------------

                showStatus(
                    "✅ Enquiry Successfully Submitted! आपको शीघ्र संपर्क किया जाएगा।",
                    "success"
                );


                alert(
                    "धन्यवाद " +
                    name +
                    "!\n\n" +
                    "आपकी enquiry successfully submit हो गई है।\n\n" +
                    "हम आपको शीघ्र संपर्क करेंगे।"
                );


                // ----------------------------------
                // RESET FORM
                // ----------------------------------

                contactForm.reset();


            }

            catch (error) {

                console.error(
                    "Enquiry Error:",
                    error
                );


                showStatus(
                    "❌ Enquiry भेजने में समस्या हुई। कृपया पुनः प्रयास करें।",
                    "error"
                );


                alert(
                    "Enquiry submit नहीं हो सकी।\n\n" +
                    "कृपया Internet Connection check करें।"
                );

            }


            // ----------------------------------
            // RESET BUTTON
            // ----------------------------------

            submitBtn.disabled = false;

            submitBtn.innerHTML =
                "📩 Submit Enquiry";

        });

}


// ==========================================
// STATUS FUNCTION
// ==========================================

function showStatus(
    message,
    type
) {

    if (!formStatus) {
        return;
    }

    formStatus.innerHTML =
        message;

    formStatus.className =
        "";

    formStatus.classList.add(
        type
    );
}


// ==========================================
// MOBILE MENU
// ==========================================

const menuBtn =
    document.getElementById("menuBtn");

const navbar =
    document.getElementById("navbar");


if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        function () {

            navbar.classList.toggle(
                "active"
            );

        }
    );

}


// ==========================================
// CLOSE MOBILE MENU
// ==========================================

document
    .querySelectorAll("#navbar a")
    .forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                navbar.classList.remove(
                    "active"
                );

            }
        );

    });


// ==========================================
// DARK MODE
// ==========================================

const darkBtn =
    document.getElementById("darkBtn");


if (darkBtn) {

    darkBtn.addEventListener(
        "click",
        function () {

            document
                .body
                .classList
                .toggle("dark");


            if (
                document.body.classList.contains(
                    "dark"
                )
            ) {

                darkBtn.innerHTML =
                    "☀️";

            }

            else {

                darkBtn.innerHTML =
                    "🌙";

            }

        }
    );

}


// ==========================================
// COURSE DETAILS
// ==========================================

// ==========================================
// COURSE DETAILS PAGE
// ==========================================

function courseInfo(course) {

    const coursePages = {
        DCA: "COURSES/DCA/index.html",
        ADCA: "COURSES/ADCA/index.html",
        CCC: "COURSES/CCC/index.html",
        Tally: "COURSES/Tally/index.html",
        Typing: "COURSES/Typing/index.html"
    };

    if (coursePages[course]) {
        window.location.href = coursePages[course];
    }
}

// ==========================================
// CLOSE POPUP
// ==========================================

function closePopup() {

    const popup =
        document.getElementById("popup");

    popup.style.display =
        "none";

}


// ==========================================
// CLOSE POPUP OUTSIDE
// ==========================================

window.addEventListener(
    "click",
    function (event) {

        const popup =
            document.getElementById("popup");

        if (
            event.target === popup
        ) {

            popup.style.display =
                "none";

        }

    }
);


/* ==========================================
   NEW DRISHTI HOME IMAGE SLIDER
========================================== */

const heroSlides =
    document.querySelectorAll(".hero-slide");

const heroDots =
    document.querySelectorAll(".hero-dot");

let heroCurrentSlide = 0;

let heroAutoSlide;


/* ==========================================
   SHOW SLIDE
========================================== */

function showHeroSlide(index) {

    if (index >= heroSlides.length) {

        index = 0;

    }

    if (index < 0) {

        index = heroSlides.length - 1;

    }


    heroSlides.forEach(
        (slide, i) => {

            slide.classList.remove(
                "active",
                "previous"
            );


            if (i < index) {

                slide.classList.add(
                    "previous"
                );

            }

        }
    );


    heroDots.forEach(
        dot => {

            dot.classList.remove(
                "active"
            );

        }
    );


    heroSlides[index]
        .classList.add("active");


    if (heroDots[index]) {

        heroDots[index]
            .classList.add("active");

    }


    heroCurrentSlide = index;

}


/* ==========================================
   NEXT
========================================== */

function nextHeroSlide() {

    showHeroSlide(
        heroCurrentSlide + 1
    );

    restartHeroSlider();

}


/* ==========================================
   PREVIOUS
========================================== */

function previousHeroSlide() {

    showHeroSlide(
        heroCurrentSlide - 1
    );

    restartHeroSlider();

}


/* ==========================================
   AUTO SLIDER
   5 SECOND
========================================== */

function startHeroSlider() {

    heroAutoSlide =
        setInterval(
            function() {

                showHeroSlide(
                    heroCurrentSlide + 1
                );

            },
            5000
        );

}


function restartHeroSlider() {

    clearInterval(
        heroAutoSlide
    );

    startHeroSlider();

}


/* START */

startHeroSlider();


/* ==========================================
   MOBILE SWIPE
========================================== */

let heroTouchStartX = 0;

let heroTouchEndX = 0;


const heroSection =
    document.querySelector("#home");


if (heroSection) {

    heroSection.addEventListener(
        "touchstart",
        function(e) {

            heroTouchStartX =
                e.changedTouches[0].screenX;

        },
        { passive: true }
    );


    heroSection.addEventListener(
        "touchend",
        function(e) {

            heroTouchEndX =
                e.changedTouches[0].screenX;


            const difference =
                heroTouchStartX -
                heroTouchEndX;


            /* SWIPE LEFT */

            if (difference > 50) {

                nextHeroSlide();

            }


            /* SWIPE RIGHT */

            if (difference < -50) {

                previousHeroSlide();

            }

        },
        { passive: true }
    );

}

// ================= GALLERY POPUP =================

function openGallery(imageSrc) {

    const modal = document.getElementById("galleryModal");
    const modalImage = document.getElementById("galleryModalImage");

    modalImage.src = imageSrc;

    modal.style.display = "flex";
}


function closeGallery() {

    const modal = document.getElementById("galleryModal");

    modal.style.display = "none";
}


// Close popup when clicking outside image

document.getElementById("galleryModal").addEventListener("click", function(event) {

    if (event.target === this) {
        closeGallery();
    }

});

