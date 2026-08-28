// =====================================================
// NEW DRISHTI GALLERY - SCRIPT.JS
// =====================================================

const GAS_API_URL =
    "https://script.google.com/macros/s/AKfycbxjDcDe7qKYhIqg749VePQMLOlBqolihWIH2-mXsY-D5IuXJ5dMTFuSb7Xp_vUR7-AbGg/exec";


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let token = "";
let galleryData = [];
let currentFilter = "All";


// =====================================================
// API HELPER
// =====================================================

function callAPI(data) {

    return fetch(GAS_API_URL, {
        method: "POST",

        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },

        body: JSON.stringify(data)
    })
    .then(response => {

        if (!response.ok) {
            throw new Error(
                "Server Error: " + response.status
            );
        }

        return response.json();
    });
}


// =====================================================
// LOGIN
// =====================================================

function login() {

    const passwordEl =
        document.getElementById("password");

    const message =
        document.getElementById("loginMessage");

    const loginButton =
        document.querySelector(".login-btn");

    const password =
        passwordEl ? passwordEl.value.trim() : "";

    if (!password) {

        if (message) {
            message.innerText = "Password डालें।";
        }

        return;
    }

    if (message) {
        message.innerText = "Checking...";
    }

    if (loginButton) {

        loginButton.disabled = true;
        loginButton.innerText = "⏳ Checking...";

    }

    callAPI({
        action: "login",
        password: password
    })

    .then(result => {

        if (result.success) {

            token = result.token || "";

            if (!token) {
                throw new Error(
                    "Server ने login token नहीं भेजा।"
                );
            }

            localStorage.setItem(
                "galleryToken",
                token
            );

            const loginPage =
                document.getElementById("loginPage");

            const galleryApp =
                document.getElementById("galleryApp");

            if (loginPage) {
                loginPage.style.display = "none";
            }

            if (galleryApp) {
                galleryApp.style.display = "block";
            }

            if (message) {
                message.innerText = "";
            }

            loadGallery();

        } else {

            if (message) {
                message.innerText =
                    result.message ||
                    "Invalid Password";
            }

        }

    })

    .catch(error => {

        console.error("Login Error:", error);

        if (message) {
            message.innerText =
                "Server connection error. कृपया दोबारा प्रयास करें।";
        }

    })

    .finally(() => {

        if (loginButton) {

            loginButton.disabled = false;
            loginButton.innerText = "🔐 Login";

        }

    });
}


// =====================================================
// LOAD GALLERY
// =====================================================

function loadGallery() {

    const gallery =
        document.getElementById("gallery");

    if (!gallery) {
        return;
    }

    gallery.innerHTML = `
        <div style="
            grid-column:1/-1;
            text-align:center;
            padding:50px;
        ">
            <h2>⏳ Loading Gallery...</h2>
            <p>कृपया प्रतीक्षा करें...</p>
        </div>
    `;

    callAPI({
        action: "getGallery",
        token: token
    })

    .then(result => {

        if (!result.success) {

            alert(
                result.message ||
                "Gallery load failed"
            );

            logout(false);
            return;
        }

        galleryData =
            Array.isArray(result.data)
                ? result.data
                : [];

        renderGallery();
        updateDashboard();

    })

    .catch(error => {

        console.error(
            "Gallery Load Error:",
            error
        );

        gallery.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:50px;
            ">
                <h2>❌ Gallery Load Error</h2>
                <p>
                    Server से connection नहीं हो पाया।
                </p>
                <p>
                    ${escapeHtml(error.message)}
                </p>
            </div>
        `;

    });
}


// =====================================================
// GET DRIVE IMAGE URL
// =====================================================

function getDriveImageUrl(item) {

    // New backend URL
    if (
        item &&
        item.fileUrl &&
        item.fileUrl.includes("thumbnail")
    ) {
        return item.fileUrl;
    }

    // File ID से नया thumbnail URL
    if (item && item.fileId) {

        return (
            "https://drive.google.com/thumbnail?id=" +
            encodeURIComponent(item.fileId) +
            "&sz=w1200"
        );

    }

    // पुराने URL को भी use करें
    if (item && item.fileUrl) {
        return item.fileUrl;
    }

    return "";
}


// =====================================================
// RENDER GALLERY
// =====================================================

function renderGallery() {

    const gallery =
        document.getElementById("gallery");

    if (!gallery) {
        return;
    }

    gallery.innerHTML = "";

    const filtered =
        galleryData.filter(item => {

            return (
                currentFilter === "All" ||
                item.category === currentFilter
            );

        });

    if (filtered.length === 0) {

        gallery.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:50px;
            ">
                <h2>📭 No Gallery Found</h2>
                <p>
                    इस category में अभी कोई record नहीं है।
                </p>
            </div>
        `;

        return;
    }

    filtered.forEach(item => {

        let media = "";

        // =================================================
        // IMAGE
        // =================================================

        if (item.type === "image") {

            const imageUrl =
                getDriveImageUrl(item);

            const fileId =
                item.fileId || "";

            const fallbackUrl =
                fileId
                    ? "https://drive.google.com/thumbnail?id=" +
                      encodeURIComponent(fileId) +
                      "&sz=w1200"
                    : "";

            media = `
                <div class="card-media">

                    <img
                        src="${escapeHtml(imageUrl)}"

                        alt="${escapeHtml(
                            item.title || "Gallery Image"
                        )}"

                        loading="lazy"

                        style="
                            width:100%;
                            height:100%;
                            object-fit:cover;
                            cursor:pointer;
                            display:block;
                        "

                        onclick="openImage('${escapeJs(
                            imageUrl
                        )}')"

                        onerror="handleImageError(
                            this,
                            '${escapeJs(fallbackUrl)}'
                        )"
                    >

                </div>
            `;
        }


        // =================================================
        // VIDEO
        // =================================================

        else if (item.type === "video") {

            const videoUrl =
                item.fileUrl || "";

            media = `
                <div class="card-media">

                    <video
                        controls
                        preload="metadata"
                        style="
                            width:100%;
                            height:100%;
                            object-fit:cover;
                        "
                    >

                        <source
                            src="${escapeHtml(videoUrl)}"
                            type="${escapeHtml(
                                item.mimeType ||
                                "video/mp4"
                            )}"
                        >

                        आपका browser video support नहीं करता।

                    </video>

                </div>
            `;
        }


        // =================================================
        // YOUTUBE
        // =================================================

        else if (item.type === "youtube") {

            const yt =
                getYouTubeEmbed(
                    item.youtubeUrl
                );

            if (yt) {

                media = `
                    <div class="card-media">

                        <iframe
                            src="${escapeHtml(yt)}"

                            style="
                                width:100%;
                                height:100%;
                                border:0;
                            "

                            title="${escapeHtml(
                                item.title || "YouTube Video"
                            )}"

                            allow="
                                accelerometer;
                                autoplay;
                                clipboard-write;
                                encrypted-media;
                                gyroscope;
                                picture-in-picture;
                                web-share
                            "

                            allowfullscreen>
                        </iframe>

                    </div>
                `;

            } else {

                media = `
                    <div class="card-media"
                        style="
                            display:flex;
                            align-items:center;
                            justify-content:center;
                        "
                    >
                        ❌ Invalid YouTube URL
                    </div>
                `;

            }
        }


        // =================================================
        // CARD
        // =================================================

        const card =
            document.createElement("div");

        card.className = "card";

        const imageButton =
            item.type === "image"
                ? `
                    <button
                        class="open-btn"
                        onclick="openImage('${escapeJs(
                            getDriveImageUrl(item)
                        )}')"
                    >
                        👁 View
                    </button>
                  `
                : "";

        card.innerHTML = `

            ${media}

            <div class="card-info">

                <span class="category">
                    ${escapeHtml(
                        item.category || "Other"
                    )}
                </span>

                <h3>
                    ${escapeHtml(
                        item.title || "Untitled"
                    )}
                </h3>

                <p>
                    📅 ${escapeHtml(
                        item.date || ""
                    )}
                </p>

                <p>
                    ${escapeHtml(
                        item.description || ""
                    )}
                </p>

                <div class="card-actions">

                    ${imageButton}

                    <button
                        class="delete-btn"
                        onclick="deleteItem('${escapeJs(
                            item.id || ""
                        )}')"
                    >
                        🗑 Delete
                    </button>

                </div>

            </div>
        `;

        gallery.appendChild(card);

    });
}


// =====================================================
// IMAGE ERROR HANDLER
// =====================================================

function handleImageError(
    img,
    fallbackUrl
) {

    console.warn(
        "Image loading failed:",
        img.src
    );

    if (
        fallbackUrl &&
        img.src !== fallbackUrl
    ) {

        img.src = fallbackUrl;
        return;

    }

    img.onerror = null;

    img.style.objectFit = "contain";

    img.src =
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="600"
                 height="400">
                <rect width="100%"
                      height="100%"
                      fill="#eeeeee"/>
                <text x="50%"
                      y="48%"
                      dominant-baseline="middle"
                      text-anchor="middle"
                      font-size="24">
                    Image Not Available
                </text>
                <text x="50%"
                      y="58%"
                      dominant-baseline="middle"
                      text-anchor="middle"
                      font-size="16">
                    Google Drive access check करें
                </text>
            </svg>
        `);
}


// =====================================================
// DASHBOARD
// =====================================================

function updateDashboard() {

    const total =
        document.getElementById("totalCount");

    const images =
        document.getElementById("imageCount");

    const videos =
        document.getElementById("videoCount");

    const events =
        document.getElementById("eventCount");

    if (total) {

        total.innerText =
            galleryData.length;

    }

    if (images) {

        images.innerText =
            galleryData.filter(
                x => x.type === "image"
            ).length;

    }

    if (videos) {

        videos.innerText =
            galleryData.filter(
                x =>
                    x.type === "video" ||
                    x.type === "youtube"
            ).length;

    }

    if (events) {

        events.innerText =
            galleryData.filter(
                x =>
                    x.category === "Event"
            ).length;

    }
}


// =====================================================
// FILTER GALLERY
// =====================================================

function filterGallery(
    category,
    button
) {

    currentFilter = category;

    document
        .querySelectorAll(
            ".filter-bar button"
        )
        .forEach(btn => {

            btn.classList.remove("active");

        });

    if (button) {

        button.classList.add("active");

    }

    renderGallery();
}


// =====================================================
// CHANGE MEDIA TYPE
// =====================================================

function changeMediaType() {

    const type =
        document.getElementById(
            "mediaType"
        );

    const file =
        document.getElementById(
            "mediaFile"
        );

    const fileBox =
        document.getElementById(
            "fileBox"
        );

    const youtubeBox =
        document.getElementById(
            "youtubeBox"
        );

    if (!type) {
        return;
    }

    if (type.value === "youtube") {

        if (fileBox) {
            fileBox.style.display = "none";
        }

        if (youtubeBox) {
            youtubeBox.style.display = "flex";
        }

    } else {

        if (fileBox) {
            fileBox.style.display = "flex";
        }

        if (youtubeBox) {
            youtubeBox.style.display = "none";
        }

        if (file) {

            if (type.value === "image") {

                file.accept = "image/*";

            } else {

                file.accept = "video/*";

            }

        }
    }
}


// =====================================================
// SAVE GALLERY
// =====================================================

function saveGallery() {

    const date =
        document.getElementById(
            "itemDate"
        ).value;

    const category =
        document.getElementById(
            "itemCategory"
        ).value;

    const title =
        document.getElementById(
            "itemTitle"
        ).value.trim();

    const description =
        document.getElementById(
            "itemDescription"
        ).value.trim();

    const type =
        document.getElementById(
            "mediaType"
        ).value;


    if (!date) {

        alert("Date चुनें।");
        return;

    }

    if (!category) {

        alert("Category चुनें।");
        return;

    }

    if (!title) {

        alert("Title डालें।");
        return;

    }


    // =================================================
    // YOUTUBE
    // =================================================

    if (type === "youtube") {

        const youtubeUrl =
            document.getElementById(
                "youtubeUrl"
            ).value.trim();

        if (!youtubeUrl) {

            alert(
                "YouTube URL डालें।"
            );

            return;
        }

        if (!isValidYouTubeUrl(youtubeUrl)) {

            alert(
                "Valid YouTube URL डालें।"
            );

            return;
        }

        sendToServer({

            date: date,

            category: category,

            title: title,

            description: description,

            type: "youtube",

            youtubeUrl: youtubeUrl

        });

        return;
    }


    // =================================================
    // FILE
    // =================================================

    const fileInput =
        document.getElementById(
            "mediaFile"
        );

    const file =
        fileInput &&
        fileInput.files
            ? fileInput.files[0]
            : null;

    if (!file) {

        alert(
            "Image या Video select करें।"
        );

        return;
    }


    // =================================================
    // TYPE VALIDATION
    // =================================================

    if (
        type === "image" &&
        !file.type.startsWith("image/")
    ) {

        alert(
            "कृपया केवल Image file चुनें।"
        );

        return;
    }

    if (
        type === "video" &&
        !file.type.startsWith("video/")
    ) {

        alert(
            "कृपया केवल Video file चुनें।"
        );

        return;
    }


    // =================================================
    // SIZE
    // =================================================

    if (
        type === "image" &&
        file.size > 10 * 1024 * 1024
    ) {

        alert(
            "Image maximum 10 MB रखें।"
        );

        return;
    }

    if (
        type === "video" &&
        file.size > 50 * 1024 * 1024
    ) {

        alert(
            "Video maximum 50 MB रखें।"
        );

        return;
    }


    const progress =
        document.getElementById(
            "uploadProgress"
        );

    if (progress) {

        progress.innerText =
            "⏳ File पढ़ी जा रही है...";

    }


    const reader =
        new FileReader();


    reader.onload = function(event) {

        try {

            const result =
                event.target.result;

            if (
                typeof result !== "string"
            ) {

                throw new Error(
                    "File read failed."
                );

            }

            const comma =
                result.indexOf(",");

            if (comma === -1) {

                throw new Error(
                    "Invalid file data."
                );

            }

            const base64 =
                result.substring(
                    comma + 1
                );


            sendToServer({

                date: date,

                category: category,

                title: title,

                description: description,

                type: type,

                fileName: file.name,

                mimeType: file.type,

                base64: base64

            });

        }

        catch (error) {

            console.error(
                "File Error:",
                error
            );

            if (progress) {
                progress.innerText = "";
            }

            alert(
                "File read error: " +
                error.message
            );

        }
    };


    reader.onerror = function() {

        if (progress) {
            progress.innerText = "";
        }

        alert(
            "File पढ़ने में समस्या हुई।"
        );

    };


    reader.readAsDataURL(file);
}


// =====================================================
// SEND TO SERVER
// =====================================================

function sendToServer(data) {

    const progress =
        document.getElementById(
            "uploadProgress"
        );

    if (progress) {

        progress.innerText =
            "⏳ Uploading...";

    }

    callAPI({

        action: "addGalleryItem",

        token: token,

        data: data

    })

    .then(result => {

        if (progress) {
            progress.innerText = "";
        }

        if (result.success) {

            alert(
                "✅ " +
                (
                    result.message ||
                    "Gallery item added successfully."
                )
            );

            resetForm();

            awaitRefreshGallery();

        } else {

            alert(
                "❌ " +
                (
                    result.message ||
                    "Upload failed."
                )
            );

        }

    })

    .catch(error => {

        console.error(
            "Upload Error:",
            error
        );

        if (progress) {
            progress.innerText = "";
        }

        alert(
            "Upload Error: " +
            error.message
        );

    });
}


// =====================================================
// REFRESH AFTER UPLOAD
// =====================================================

function awaitRefreshGallery() {

    loadGallery();

    const viewButton =
        document.querySelector(
            ".tab-btn"
        );

    showTab(
        "viewTab",
        viewButton
    );
}


// =====================================================
// DELETE
// =====================================================

function deleteItem(id) {

    if (!id) {

        alert(
            "Invalid Gallery ID."
        );

        return;
    }

    const confirmDelete =
        confirm(
            "क्या आप इस Gallery item को delete करना चाहते हैं?"
        );

    if (!confirmDelete) {
        return;
    }

    callAPI({

        action: "deleteGalleryItem",

        token: token,

        id: id

    })

    .then(result => {

        if (result.success) {

            alert(
                "✅ " +
                (
                    result.message ||
                    "Gallery item deleted."
                )
            );

            loadGallery();

        } else {

            alert(
                "❌ " +
                (
                    result.message ||
                    "Delete failed."
                )
            );

        }

    })

    .catch(error => {

        console.error(
            "Delete Error:",
            error
        );

        alert(
            "Delete Error: " +
            error.message
        );

    });
}


// =====================================================
// RESET FORM
// =====================================================

function resetForm() {

    const title =
        document.getElementById(
            "itemTitle"
        );

    const description =
        document.getElementById(
            "itemDescription"
        );

    const mediaFile =
        document.getElementById(
            "mediaFile"
        );

    const youtubeUrl =
        document.getElementById(
            "youtubeUrl"
        );

    const progress =
        document.getElementById(
            "uploadProgress"
        );

    if (title) {
        title.value = "";
    }

    if (description) {
        description.value = "";
    }

    if (mediaFile) {
        mediaFile.value = "";
    }

    if (youtubeUrl) {
        youtubeUrl.value = "";
    }

    if (progress) {
        progress.innerText = "";
    }

    const mediaType =
        document.getElementById(
            "mediaType"
        );

    if (mediaType) {

        mediaType.value = "image";

        changeMediaType();

    }
}


// =====================================================
// TAB
// =====================================================

function showTab(
    tabId,
    button
) {

    const viewTab =
        document.getElementById(
            "viewTab"
        );

    const addTab =
        document.getElementById(
            "addTab"
        );

    if (viewTab) {
        viewTab.style.display = "none";
    }

    if (addTab) {
        addTab.style.display = "none";
    }

    const selected =
        document.getElementById(tabId);

    if (selected) {
        selected.style.display = "block";
    }

    document
        .querySelectorAll(".tab-btn")
        .forEach(btn => {

            btn.classList.remove("active");

        });

    if (button) {
        button.classList.add("active");
    }
}


// =====================================================
// IMAGE MODAL
// =====================================================

function openImage(url) {

    if (!url) {
        return;
    }

    const modalImage =
        document.getElementById(
            "modalImage"
        );

    const imageModal =
        document.getElementById(
            "imageModal"
        );

    if (modalImage) {

        modalImage.src = url;

        modalImage.onerror = function() {

            this.onerror = null;

            this.src = url;

        };
    }

    if (imageModal) {

        imageModal.style.display =
            "flex";

    }
}


// =====================================================
// CLOSE MODAL
// =====================================================

function closeModal() {

    const modal =
        document.getElementById(
            "imageModal"
        );

    const image =
        document.getElementById(
            "modalImage"
        );

    if (modal) {
        modal.style.display = "none";
    }

    if (image) {
        image.src = "";
    }
}


// =====================================================
// ESC
// =====================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            closeModal();

        }

    }
);


// =====================================================
// YOUTUBE EMBED
// =====================================================

function getYouTubeEmbed(url) {

    if (!url) {
        return "";
    }

    try {

        const parsed =
            new URL(url);

        let id =
            parsed.searchParams.get("v");

        const host =
            parsed.hostname
                .toLowerCase();

        const path =
            parsed.pathname;


        // youtu.be
        if (
            host.includes("youtu.be")
        ) {

            id =
                path
                    .replace(/^\/+/, "")
                    .split("/")[0];

        }


        // Shorts
        if (
            path.includes("/shorts/")
        ) {

            id =
                path
                    .split("/shorts/")[1]
                    .split("/")[0];

        }


        // Embed
        if (
            path.includes("/embed/")
        ) {

            id =
                path
                    .split("/embed/")[1]
                    .split("/")[0];

        }


        if (id) {

            return (
                "https://www.youtube.com/embed/" +
                encodeURIComponent(id)
            );

        }

    }

    catch (error) {

        console.error(
            "YouTube URL Error:",
            error
        );

    }

    return "";
}


// =====================================================
// VALIDATE YOUTUBE
// =====================================================

function isValidYouTubeUrl(url) {

    try {

        const parsed =
            new URL(url);

        const host =
            parsed.hostname
                .toLowerCase();

        return (
            host === "youtube.com" ||
            host === "www.youtube.com" ||
            host === "m.youtube.com" ||
            host === "youtu.be" ||
            host === "www.youtu.be"
        );

    }

    catch (error) {

        return false;

    }
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

    return String(
        value == null
            ? ""
            : value
    )

    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// =====================================================
// ESCAPE JAVASCRIPT
// =====================================================

function escapeJs(value) {

    return String(
        value == null
            ? ""
            : value
    )

    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");
}


// =====================================================
// CHECK SAVED SESSION
// =====================================================

function checkSavedSession() {

    const saved =
        localStorage.getItem(
            "galleryToken"
        );

    if (!saved) {
        return;
    }

    token = saved;

    callAPI({

        action: "checkSession",

        token: saved

    })

    .then(result => {

        const valid =
            result.success === true ||
            result.valid === true;

        if (valid) {

            const loginPage =
                document.getElementById(
                    "loginPage"
                );

            const galleryApp =
                document.getElementById(
                    "galleryApp"
                );

            if (loginPage) {
                loginPage.style.display = "none";
            }

            if (galleryApp) {
                galleryApp.style.display = "block";
            }

            loadGallery();

        } else {

            token = "";

            localStorage.removeItem(
                "galleryToken"
            );

        }

    })

    .catch(error => {

        console.error(
            "Session Check Error:",
            error
        );

        token = "";

        localStorage.removeItem(
            "galleryToken"
        );

    });
}


// =====================================================
// LOGOUT
// =====================================================

function logout(
    callServer = true
) {

    const oldToken = token;

    token = "";

    galleryData = [];

    localStorage.removeItem(
        "galleryToken"
    );

    if (
        callServer &&
        oldToken
    ) {

        callAPI({

            action: "logout",

            token: oldToken

        })

        .catch(error => {

            console.warn(
                "Logout server error:",
                error
            );

        });

    }

    const galleryApp =
        document.getElementById(
            "galleryApp"
        );

    if (galleryApp) {
        galleryApp.style.display = "none";
    }

    const loginPage =
        document.getElementById(
            "loginPage"
        );

    if (loginPage) {
        loginPage.style.display = "flex";
    }

    const password =
        document.getElementById(
            "password"
        );

    if (password) {
        password.value = "";
    }

    const message =
        document.getElementById(
            "loginMessage"
        );

    if (message) {
        message.innerText = "";
    }

    updateDashboard();
}


// =====================================================
// PAGE LOAD
// =====================================================

window.addEventListener(
    "DOMContentLoaded",
    function() {

        changeMediaType();

        checkSavedSession();

    }
);