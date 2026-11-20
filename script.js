/* =========================
   STORAGE AND APP SETTINGS
========================= */

const content = document.getElementById("content");
const roleMenu = document.getElementById("roleMenu");

const STATUS = [
    "Submitted",
    "Under review",
    "Item found",
    "Returned"
];

const STORE = {
    reports:"lf-all",
    log:"lf-log",
    session:"lf-session"
};

function read(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch(error) {
        return fallback;
    }
}

function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        '"':"&quot;",
        "'":"&#39;"
    })[char]);
}

function getReports() {
    return read(STORE.reports, []);
}

function saveReports(reports) {
    write(STORE.reports, reports);
}

function getMessages(name) {
    return read("lf-msgs:"+name.toLowerCase(), []);
}

function saveMessages(name, messages) {
    write("lf-msgs:"+name.toLowerCase(), messages);
}

function getMyReports(name) {
    return getReports().filter(report =>
        report.by.toLowerCase() === name.toLowerCase()
    );
}

function setMessage(text, type) {
    const box = document.getElementById("message");
    if(!box) return;
    box.textContent = text;
    box.className = "message "+type;
}

/* =========================
   DARK MODE
========================= */

document.getElementById("themeBtn").onclick = function() {
    const root = document.documentElement;
    const dark = root.dataset.theme !== "dark";
    root.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("lf-theme", root.dataset.theme);
};

const savedTheme = localStorage.getItem("lf-theme");
if(savedTheme) {
    document.documentElement.dataset.theme = savedTheme;
}

/* =========================
   ROLE MENU
========================= */

document.getElementById("menuBtn").onclick = function(event) {
    event.stopPropagation();
    roleMenu.hidden = !roleMenu.hidden;
};

roleMenu.querySelectorAll("[data-role]").forEach(button => {
    button.onclick = function() {
        roleMenu.hidden = true;
        showLogin(button.dataset.role);
    };
});

document.addEventListener("click", function(event) {
    if(!roleMenu.contains(event.target)) {
        roleMenu.hidden = true;
    }
});

/* =========================
   CAPTCHA
========================= */

let captchaCode = "";

function createCaptcha() {
    const canvas = document.getElementById("captchaCanvas");
    if(!canvas) return;

    const ctx = canvas.getContext("2d");
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    captchaCode = "";

    for(let i=0;i<5;i++) {
        captchaCode += chars[Math.floor(Math.random()*chars.length)];
    }

    ctx.clearRect(0,0,170,55);
    ctx.fillStyle = "#e8f0ff";
    ctx.fillRect(0,0,170,55);

    for(let i=0;i<6;i++) {
        ctx.strokeStyle = "rgba(37,99,235,.35)";
        ctx.beginPath();
        ctx.moveTo(Math.random()*170,Math.random()*55);
        ctx.lineTo(Math.random()*170,Math.random()*55);
        ctx.stroke();
    }

    ctx.font = "bold 29px Arial";
    ctx.fillStyle = "#174a9a";
    ctx.fillText(captchaCode,18,38);
}

/* =========================
   LOGIN
========================= */

function showLogin(role="Student") {

    content.className = "panel";

    const isAdmin = role === "Admin";
    const isStaff = role === "Staff & Others";

    content.innerHTML = `
        <div class="login-wrapper">

            <section class="login-banner">
                <h1>Find What's Lost.<br>Return What's Found.</h1>

                <p>
                    A smart campus platform to report lost items,
                    track requests and reconnect belongings with
                    their owners.
                </p>

                <div class="feature">
                    <span>✓</span> Easy Lost Item Reporting
                </div>

                <div class="feature">
                    <span>✓</span> Real-Time Status Tracking
                </div>

                <div class="feature">
                    <span>✓</span> Admin and Staff Management
                </div>
            </section>

            <section class="login-area">
                <h2>Welcome Back 👋</h2>
                <p class="subtitle">Login as ${safe(role)} to continue.</p>

                <form id="loginForm">

                    ${isStaff ? "" : `
                        <label>Username</label>
                        <input id="username" placeholder="Enter username" required>
                    `}

                    <label>Email ID</label>
                    <input id="email" type="email"
                        placeholder="Enter email address" required>

                    <label>Password</label>
                    <div class="password-box">
                        <input id="password" type="password"
                            placeholder="Enter password" required>
                        <button type="button" class="eye"
                            id="eyeBtn">◉</button>
                    </div>

                    ${isAdmin ? `
                        <label>Phone Number</label>
                        <input id="phone" maxlength="10"
                            inputmode="numeric" placeholder="10-digit number" required>

                        <label>Admin OTP</label>
                        <div class="row">
                            <input id="otp" maxlength="6"
                                placeholder="Enter OTP" required>
                            <button class="secondary-btn" type="button"
                                id="sendOtp">Send OTP</button>
                        </div>
                    ` : ""}

                    <label>Captcha</label>
                    <div class="captcha">
                        <canvas id="captchaCanvas" width="170" height="55"></canvas>
                        <button class="secondary-btn" type="button"
                            id="refreshCaptcha">↻</button>
                    </div>

                    <label>Enter Captcha</label>
                    <input id="captchaInput" placeholder="Type the code above" required>

                    <button class="primary-btn" type="submit">Login →</button>

                    <div id="message" class="message"></div>
                </form>
            </section>

        </div>
    `;

    createCaptcha();

    document.getElementById("refreshCaptcha").onclick = createCaptcha;

    document.getElementById("eyeBtn").onclick = function() {
        const password = document.getElementById("password");
        password.type = password.type === "password" ? "text" : "password";
    };

    let generatedOTP = "";

    if(isAdmin) {
        document.getElementById("sendOtp").onclick = function() {
            const phone = document.getElementById("phone").value.trim();

            if(!/^[0-9]{10}$/.test(phone)) {
                setMessage("Enter a valid 10-digit phone number.","error");
                return;
            }

            generatedOTP = String(
                Math.floor(100000 + Math.random()*900000)
            );

            setMessage(
                "Demo OTP: "+generatedOTP+" (No SMS is sent).",
                "success"
            );
        };
    }

    document.getElementById("loginForm").onsubmit = function(event) {
        event.preventDefault();

        const username = isStaff
            ? document.getElementById("email").value.trim()
            : document.getElementById("username").value.trim();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const captcha = document.getElementById("captchaInput").value.trim();

        if(!username) {
            setMessage("Enter your username.","error");
            return;
        }

        if(password.length < 1) {
            setMessage("Enter your password.","error");
            return;
        }

        if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            setMessage("Enter a valid email address.","error");
            return;
        }

        if(isAdmin) {
            const phone = document.getElementById("phone").value.trim();
            const otp = document.getElementById("otp").value.trim();

            if(!/^[0-9]{10}$/.test(phone)) {
                setMessage("Enter a valid phone number.","error");
                return;
            }

            if(!generatedOTP || otp !== generatedOTP) {
                setMessage("Please enter the correct generated OTP.","error");
                return;
            }
        }

        if(captcha.toUpperCase() !== captchaCode) {
            setMessage("Incorrect CAPTCHA. Try again.","error");
            createCaptcha();
            return;
        }

        const name = username || email;

        const session = {
            who:role,
            name:name,
            email:email
        };

        write(STORE.session,session);
        openDashboard(name,role);
    };
}

/* =========================
   REPORT SUBMISSION
========================= */

function reportForm(name) {

    const today = new Date().toISOString().split("T")[0];

    return `
        <h2 class="page-title">Report Lost Item</h2>
        <p class="page-subtitle">
            Provide the details of your lost item.
        </p>

        <form id="reportForm">

            <div class="form-grid">

                <div class="full">
                    <label>Item Name *</label>
                    <input id="item" placeholder="Example: Laptop, ID Card, Phone" required>
                </div>

                <div>
                    <label>Lost Date *</label>
                    <input id="lostDate" type="date" max="${today}" required>
                </div>

                <div>
                    <label>Lost Time *</label>
                    <input id="lostTime" type="time" required>
                </div>

                <div>
                    <label>Lost Location *</label>
                    <select id="location" required>
                        <option value="">Select Location</option>
                        <option>Block 1 - Administrative Block</option>
                        <option>Block 2</option>
                        <option>Block 3</option>
                        <option>Block 4 - Sports Block</option>
                        <option>Block 5</option>
                        <option>Block 6</option>
                        <option>Block 7 - SRIX</option>
                        <option>Block 8</option>
                        <option>Library</option>
                        <option>Canteen</option>
                        <option>Parking Area</option>
                        <option>College Bus</option>
                    </select>
                </div>

                <div>
                    <label>Color</label>
                    <input id="color" placeholder="Example: Black">
                </div>

                <div>
                    <label>Brand</label>
                    <input id="brand" placeholder="Example: Samsung">
                </div>

                <div class="full">
                    <label>Detailed Description *</label>
                    <textarea id="description"
                        placeholder="Describe the item, scratches, stickers or unique marks..."
                        required></textarea>
                </div>

            </div>

            <div class="form-actions">
                <button class="primary-btn" type="submit">Submit Report</button>
                <button class="secondary-btn" type="reset">Clear Form</button>
            </div>

            <div id="formMessage" class="message"></div>

        </form>
    `;
}

/* =========================
   CREATE NEW REPORT
========================= */

function submitReport(name) {

    const get = id => document.getElementById(id).value.trim();

    const report = {
        id:"LF-"+Date.now().toString().slice(-8),
        item:get("item"),
        date:get("lostDate"),
        time:get("lostTime"),
        loc:get("location"),
        color:get("color"),
        brand:get("brand"),
        desc:get("description"),
        status:"Submitted",
        by:name,
        at:Date.now()
    };

    const reports = getReports();
    reports.unshift(report);
    saveReports(reports);

    document.getElementById("reportForm").reset();

    const message = document.getElementById("formMessage");
    message.textContent = "Your lost item report was submitted successfully!";
    message.className = "message success";

    renderOverview(name,"Student");
}

/* =========================
   REPORT CARD
========================= */

function reportCard(report,admin=false) {

    let statusClass = "";

    if(report.status === "Returned") {
        statusClass = "returned";
    } else if(report.status === "Under review") {
        statusClass = "review";
    }

    return `
        <article class="report-card">

            <div class="report-top">
                <div>
                    <h3>${safe(report.item)}</h3>
                    <div class="small-text">
                        ${safe(report.id)} · ${new Date(report.at).toLocaleDateString()}
                    </div>
                </div>

                <span class="status ${statusClass}">
                    ${safe(report.status)}
                </span>
            </div>

            <div class="report-details">

                <div>
                    <div class="detail-label">Reported By</div>
                    <div class="detail-value">${safe(report.by)}</div>
                </div>

                <div>
                    <div class="detail-label">Lost Date</div>
                    <div class="detail-value">${safe(report.date)}</div>
                </div>

                <div>
                    <div class="detail-label">Lost Time</div>
                    <div class="detail-value">${safe(report.time)}</div>
                </div>

                <div>
                    <div class="detail-label">Location</div>
                    <div class="detail-value">${safe(report.loc)}</div>
                </div>

                <div>
                    <div class="detail-label">Color</div>
                    <div class="detail-value">${safe(report.color || "Not provided")}</div>
                </div>

                <div>
                    <div class="detail-label">Brand</div>
                    <div class="detail-value">${safe(report.brand || "Not provided")}</div>
                </div>

                <div class="full">
                    <div class="detail-label">Description</div>
                    <div class="detail-value">${safe(report.desc)}</div>
                </div>

            </div>

            ${admin ? `
                <div class="row" style="margin-top:18px;flex-wrap:wrap">
                    <select id="status-${safe(report.id)}">
                        ${STATUS.map(status =>
                            `<option ${status===report.status?"selected":""}>
                                ${status}
                            </option>`
                        ).join("")}
                    </select>

                    <input id="note-${safe(report.id)}"
                        placeholder="Admin note (optional)">

                    <button class="inline-btn"
                        data-update="${safe(report.id)}">
                        Update
                    </button>
                </div>
            ` : ""}

        </article>
    `;
}

/* =========================
   DASHBOARD OVERVIEW
========================= */

function renderOverview(name,role) {

    const reports = role === "Admin"
        ? getReports()
        : getMyReports(name);

    const total = reports.length;

    const pending = reports.filter(r =>
        r.status !== "Returned"
    ).length;

    const returned = reports.filter(r =>
        r.status === "Returned"
    ).length;

    const found = reports.filter(r =>
        r.status === "Item found"
    ).length;

    const recent = reports.slice(0,5);

    const main = document.getElementById("dashboardContent");

    main.innerHTML = `
        <h2 class="page-title">Overview Dashboard</h2>

        <p class="page-subtitle">
            Welcome back, ${safe(name)}! Here's your latest activity.
        </p>

        <div class="stats">

            <div class="stat-card">
                <div class="stat-icon">📦</div>
                <h2>${total}</h2>
                <p>Total Reports</p>
            </div>

            <div class="stat-card">
                <div class="stat-icon">⏳</div>
                <h2>${pending}</h2>
                <p>Pending Reports</p>
            </div>

            <div class="stat-card">
                <div class="stat-icon">🔍</div>
                <h2>${found}</h2>
                <p>Items Found</p>
            </div>

            <div class="stat-card">
                <div class="stat-icon">✅</div>
                <h2>${returned}</h2>
                <p>Returned Items</p>
            </div>

        </div>

        <section class="section-card">
            <h3>Recent Reports</h3>

            ${recent.length
                ? recent.map(r => reportCard(r)).join("")
                : `<div class="empty">
                    <h3>No Reports Yet</h3>
                    <p>New reports will appear here.</p>
                   </div>`
            }
        </section>
    `;
}

/* =========================
   STUDENT PAGES
========================= */

function renderStudentPage(index,name) {

    const main = document.getElementById("dashboardContent");

    if(index === 0) {
        renderOverview(name,"Student");
        return;
    }

    if(index === 1) {
        main.innerHTML = reportForm(name);

        document.getElementById("reportForm").onsubmit = function(event) {
            event.preventDefault();

            const ids = [
                "item","lostDate","lostTime",
                "location","description"
            ];

            for(const id of ids) {
                if(!document.getElementById(id).value.trim()) {
                    document.getElementById(id).focus();
                    return;
                }
            }

            submitReport(name);
        };
        return;
    }

    if(index === 2) {
        const reports = getMyReports(name);

        main.innerHTML = `
            <h2 class="page-title">Report Tracking</h2>
            <p class="page-subtitle">
                Track the latest status of your lost items.
            </p>

            ${reports.length
                ? reports.map(r => `
                    ${reportCard(r)}
                    <div class="section-card">
                        <b>Tracking Progress</b>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:15px">
                            ${STATUS.map(s => `
                                <span class="status ${STATUS.indexOf(s) <= STATUS.indexOf(r.status) ? "returned" : ""}">
                                    ${s}
                                </span>
                            `).join("")}
                        </div>
                    </div>
                `).join("")
                : `<div class="empty">No reports to track. Submit a lost item report first.</div>`
            }
        `;
        return;
    }

    if(index === 3) {
        const reports = getMyReports(name);

        main.innerHTML = `
            <h2 class="page-title">Report History</h2>
            <p class="page-subtitle">
                View all your previously submitted reports.
            </p>

            ${reports.length
                ? reports.map(r => reportCard(r)).join("")
                : `<div class="empty">Your report history is empty.</div>`
            }
        `;
        return;
    }

    if(index === 4) {
        const messages = getMessages(name);

        main.innerHTML = `
            <h2 class="page-title">Messages</h2>
            <p class="page-subtitle">
                Receive updates from the admin.
            </p>

            ${messages.length
                ? messages.map(m => `
                    <article class="report-card">
                        <div class="report-top">
                            <h3>${safe(m.item)}</h3>
                            <span class="status">${safe(m.status)}</span>
                        </div>
                        <p>${safe(m.note || "Your report status has been updated.")}</p>
                        <div class="small-text">
                            ${new Date(m.at).toLocaleString()}
                        </div>
                    </article>
                `).join("")
                : `<div class="empty">No messages yet.</div>`
            }
        `;

        messages.forEach(m => m.read = true);
        saveMessages(name,messages);
    }
}

/* =========================
   ADMIN PAGES
========================= */

function updateReport(id) {

    const reports = getReports();
    const report = reports.find(r => r.id === id);

    if(!report) {
        alert("Report not found.");
        return;
    }

    const newStatus = document.getElementById("status-"+id).value;
    const note = document.getElementById("note-"+id).value.trim();

    if(report.status === newStatus) {
        alert("Select a different status.");
        return;
    }

    const oldStatus = report.status;
    report.status = newStatus;

    saveReports(reports);

    const logs = read(STORE.log,[]);

    logs.unshift({
        id:id,
        item:report.item,
        by:report.by,
        from:oldStatus,
        status:newStatus,
        note:note,
        at:Date.now()
    });

    write(STORE.log,logs);

    const messages = getMessages(report.by);

    messages.unshift({
        item:report.item,
        rid:id,
        status:newStatus,
        note:note,
        at:Date.now(),
        read:false
    });

    saveMessages(report.by,messages);

    alert("Report status updated successfully!");
    renderAdminPage(1);
}

function renderAdminPage(index) {

    const main = document.getElementById("dashboardContent");
    const reports = getReports();

    if(index === 0) {
        renderOverview(
            read(STORE.session,{}).name || "Admin",
            "Admin"
        );
        return;
    }

    if(index === 1 || index === 2) {

        main.innerHTML = `
            <h2 class="page-title">
                ${index === 1 ? "Lost Item Requests" : "Lost Item Status Update"}
            </h2>

            <p class="page-subtitle">
                Review reports and update their status.
            </p>

            ${reports.length
                ? reports.map(r => reportCard(r,true)).join("")
                : `<div class="empty">
                    <h3>No Lost Item Requests</h3>
                    <p>New student reports will appear here.</p>
                   </div>`
            }
        `;

        main.querySelectorAll("[data-update]").forEach(button => {
            button.onclick = function() {
                updateReport(button.dataset.update);
            };
        });

        return;
    }

    if(index === 3) {

        const logs = read(STORE.log,[]);

        main.innerHTML = `
            <h2 class="page-title">Update History</h2>
            <p class="page-subtitle">
                View all changes made to report statuses.
            </p>

            ${logs.length
                ? logs.map(log => `
                    <article class="report-card">
                        <div class="report-top">
                            <h3>${safe(log.item)}</h3>
                            <span class="status">${safe(log.status)}</span>
                        </div>
                        <p>Reported by: ${safe(log.by)}</p>
                        <p>Previous status: ${safe(log.from)}</p>
                        <p>New status: ${safe(log.status)}</p>
                        <p>Admin note: ${safe(log.note || "No note")}</p>
                        <div class="small-text">
                            ${new Date(log.at).toLocaleString()}
                        </div>
                    </article>
                `).join("")
                : `<div class="empty">No status updates available.</div>`
            }
        `;
        return;
    }

    if(index === 4) {

        const returned = reports.filter(r => r.status === "Returned");

        main.innerHTML = `
            <h2 class="page-title">Returned Items</h2>
            <p class="page-subtitle">
                Items successfully returned to their owners.
            </p>

            ${returned.length
                ? returned.map(r => reportCard(r)).join("")
                : `<div class="empty">No returned items yet.</div>`
            }
        `;
    }
}

/* =========================
   DASHBOARD LAYOUT
========================= */

function openDashboard(name,role) {

    content.className = "panel";

    const isAdmin = role === "Admin";

    const studentItems = [
        ["📊","Overview"],
        ["➕","Report Lost Item"],
        ["📍","Report Tracking"],
        ["📁","Report History"],
        ["✉️","Messages"]
    ];

    const adminItems = [
        ["📊","Overview"],
        ["📋","Lost Item Requests"],
        ["🔄","Status Update"],
        ["📜","Update History"],
        ["✅","Returned Items"]
    ];

    const items = isAdmin ? adminItems : studentItems;

    content.innerHTML = `
        <div class="dashboard">

            <aside class="sidebar">
                <h3>${isAdmin ? "ADMIN MODULE" : "USER MODULE"}</h3>

                <div id="sidebarItems">
                    ${items.map((item,index) => `
                        <button data-page="${index}"
                            class="${index===0 ? "active" : ""}">
                            <span class="side-icon">${item[0]}</span>
                            ${item[1]}
                        </button>
                    `).join("")}
                </div>

                <button class="logout" id="logoutBtn">
                    <span class="side-icon">↪</span>
                    Logout
                </button>
            </aside>

            <section class="dashboard-main">

                <div class="topbar">
                    <div>
                        <h2>${isAdmin ? "Admin Dashboard" : "Student Dashboard"}</h2>
                        <p>Manage your campus lost and found activity.</p>
                    </div>

                    <div class="user-pill">
                        👤 ${safe(name)} · ${safe(role)}
                    </div>
                </div>

                <div id="dashboardContent"></div>

            </section>

        </div>
    `;

    document.getElementById("logoutBtn").onclick = logout;

    document.querySelectorAll("[data-page]").forEach(button => {

        button.onclick = function() {

            const index = Number(button.dataset.page);

            document.querySelectorAll("[data-page]").forEach(b => {
                b.classList.toggle("active",b === button);
            });

            if(isAdmin) {
                renderAdminPage(index);
            } else {
                renderStudentPage(index,name);
            }
        };
    });

    if(isAdmin) {
        renderAdminPage(0);
    } else {
        renderStudentPage(0,name);
    }
}

/* =========================
   LOGOUT
========================= */

function logout() {
    localStorage.removeItem(STORE.session);
    roleMenu.hidden = true;
    showLogin("Student");
}

/* =========================
   CONTACT AND HELP LINKS
========================= */

function showHelp() {
    alert(
        "Help: Login to your account, report a lost item, " +
        "and use Report Tracking to check its status."
    );
}

/* =========================
   START APPLICATION
========================= */

const currentSession = read(STORE.session,null);

if(currentSession && currentSession.name && currentSession.who) {
    openDashboard(currentSession.name,currentSession.who);
} else {
    showLogin("Student");
}
