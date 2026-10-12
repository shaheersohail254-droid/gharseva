
"use strict";

/* =========================================
   GHAR SORTED - MAIN JAVASCRIPT
   Front-end demo only; no backend.
========================================= */

/* SERVICE DATA */

const services = {
    plumbing: {
        name: "Plumbing",
        plans: [
            { name: "1 Hour", price: 1000 },
            { name: "2 Hours", price: 1800 },
            { name: "Full Day", price: 3500 }
        ]
    },

    electrical: {
        name: "Electrical",
        plans: [
            { name: "1 Hour", price: 1200 },
            { name: "2 Hours", price: 2000 },
            { name: "Full Day", price: 4000 }
        ]
    },

    cleaning: {
        name: "Home Cleaning / Maid",
        plans: [
            { name: "Hourly", price: 800 },
            { name: "Daily", price: 2000 },
            { name: "Weekly", price: 10000 },
            { name: "Monthly", price: 30000 }
        ]
    },

    laundry: {
        name: "Laundry",
        plans: [
            { name: "One-Time Pickup", price: 1500 },
            { name: "Weekly", price: 5000 },
            { name: "Monthly", price: 15000 }
        ]
    }
};

const BOOKING_KEY = "gharSortedBooking";


/* HELPER FUNCTIONS */

function formatPKR(amount) {
    return "Rs. " + Number(amount).toLocaleString("en-PK");
}

function getToday() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(value) {
    if (!value) return "—";
    const [y, x, d] = value.split("-").map(Number);
    return new Date(y, x - 1, d).toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short", year: "numeric"
    });
}

function formatTime(value) {
    if (!value) return "—";
    const [h, m] = value.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function isValidPakPhone(value) {
    // Accepts 03XX-XXXXXXX, 03XXXXXXXXX, +923XXXXXXXXX, 923XXXXXXXXX
    const digits = value.replace(/[\s-]/g, "");
    return /^(\+92|92|0)3\d{9}$/.test(digits);
}

function generateReference() {
    const date = getToday().replaceAll("-", "");
    const random = Math.floor(100000 + Math.random() * 900000);

    return `GS-${date}-${random}`;
}


/* INITIALISE THE WEBSITE */

document.addEventListener("DOMContentLoaded", function () {
    setupMobileNavigation();
    setupActiveNavigation();
    setupBookingForm();
    setupContactForm();
    setupConfirmationPage();
});


/* MOBILE NAVIGATION */

function setupMobileNavigation() {
    const toggle = document.getElementById("menuToggle");
    const navigation = document.getElementById("siteNav");

    if (!toggle || !navigation) return;

    toggle.addEventListener("click", function () {
        const open = navigation.classList.toggle("open");

        toggle.setAttribute("aria-expanded", String(open));
    });

    navigation.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            navigation.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
        });
    });
}


/* ACTIVE NAVIGATION LINK */

function setupActiveNavigation() {
    let currentPage = window.location.pathname.split("/").pop();

    if (!currentPage) {
        currentPage = "index.html";
    }

    document.querySelectorAll(".site-nav a").forEach(function (link) {
        const targetPage = link.getAttribute("href").split("?")[0];

        if (
            targetPage === currentPage &&
            !link.classList.contains("nav-button")
        ) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
}


/* BOOKING FORM */

function setupBookingForm() {
    const form = document.getElementById("bookingForm");

    // Do nothing on pages without a booking form.
    if (!form) return;

    const serviceSelect = document.getElementById("service");
    const planSelect = document.getElementById("plan");
    const priceDisplay = document.getElementById("planPrice");
    const dateInput = document.getElementById("preferredDate");
    const timeInput = document.getElementById("preferredTime");
    const errorBox = document.getElementById("bookingError");

    const summaryService = document.getElementById("summaryService");
    const summaryPlan = document.getElementById("summaryPlan");
    const summaryPrice = document.getElementById("summaryPrice");
    const summaryDate = document.getElementById("summaryDate");
    const summaryTime = document.getElementById("summaryTime");

    // Prevent errors if the HTML elements are missing.
    if (
        !serviceSelect || !planSelect || !priceDisplay ||
        !dateInput || !timeInput || !summaryService ||
        !summaryPlan || !summaryPrice || !summaryDate ||
        !summaryTime
    ) {
        console.error("A required booking form element is missing.");
        return;
    }

    // Prevent choosing a date in the past.
    dateInput.min = getToday();

    function getSelectedPlan() {
        const serviceKey = serviceSelect.value;
        const planValue = planSelect.value;

        if (!services[serviceKey] || planValue === "") {
            return null;
        }

        const index = Number(planValue);

        if (!Number.isInteger(index) || index < 0) {
            return null;
        }

        return services[serviceKey].plans[index] || null;
    }

    function updateSummary() {
        const serviceKey = serviceSelect.value;
        const plan = getSelectedPlan();

        summaryService.textContent =
            services[serviceKey] ? services[serviceKey].name : "—";

        summaryPlan.textContent = plan ? plan.name : "—";

        summaryPrice.textContent =
            plan ? formatPKR(plan.price) : "—";

        summaryDate.textContent = formatDate(dateInput.value);
        summaryTime.textContent = formatTime(timeInput.value);
    }

    function updatePlans() {
        const serviceKey = serviceSelect.value;

        // Clear old plans whenever the service changes.
        planSelect.replaceChildren();

        const firstOption = document.createElement("option");
        firstOption.value = "";

        if (!services[serviceKey]) {
            firstOption.textContent = "Select a service first";
            planSelect.appendChild(firstOption);
            planSelect.disabled = true;

            priceDisplay.textContent = "Select a plan";
            updateSummary();

            return;
        }

        firstOption.textContent = "Select a plan";
        planSelect.appendChild(firstOption);

        services[serviceKey].plans.forEach(function (plan, index) {
            const option = document.createElement("option");

            option.value = String(index);
            option.textContent =
                `${plan.name} - ${formatPKR(plan.price)}`;

            planSelect.appendChild(option);
        });

        planSelect.disabled = false;
        planSelect.value = "";

        priceDisplay.textContent = "Select a plan";
        updateSummary();
    }

    function updatePrice() {
        const plan = getSelectedPlan();

        priceDisplay.textContent =
            plan ? formatPKR(plan.price) : "Select a plan";

        updateSummary();
    }

    function showError(message) {
        errorBox.textContent = message;
        errorBox.hidden = false;
        errorBox.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }

    function clearError() {
        errorBox.textContent = "";
        errorBox.hidden = true;
    }

    /* Listen for form changes */

    serviceSelect.addEventListener("change", function () {
        clearError();
        updatePlans();
    });

    planSelect.addEventListener("change", function () {
        clearError();
        updatePrice();
    });

    dateInput.addEventListener("change", updateSummary);
    timeInput.addEventListener("change", updateSummary);

    /*
       Support links such as:
       booking.html?service=plumbing
       booking.html?service=electrical
       booking.html?service=cleaning
       booking.html?service=laundry
    */

    const urlParams = new URLSearchParams(window.location.search);
    const requestedService = urlParams.get("service");

    if (
        requestedService &&
        Object.prototype.hasOwnProperty.call(services, requestedService)
    ) {
        serviceSelect.value = requestedService;
    }

    updatePlans();
    updateSummary();

    /* FIELD VALIDATION */

    const fieldIds = [
        "service", "plan", "fullName", "phone", "email",
        "address", "city", "preferredDate", "preferredTime"
    ];

    function setFieldError(id, message) {
        const field = document.getElementById(id);
        const group = field.closest(".form-group");
        let note = group.querySelector(".field-error");

        if (!message) {
            field.classList.remove("invalid");
            field.removeAttribute("aria-invalid");
            if (note) note.remove();
            return;
        }

        field.classList.add("invalid");
        field.setAttribute("aria-invalid", "true");

        if (!note) {
            note = document.createElement("span");
            note.className = "field-error";
            group.appendChild(note);
        }
        note.textContent = message;
    }

    function validateField(id) {
        const field = document.getElementById(id);
        const value = field.value.trim();
        let message = "";

        switch (id) {
            case "service":
                if (!value) message = "Please choose a service.";
                break;
            case "plan":
                if (!value) message = "Please choose a plan.";
                break;
            case "fullName":
                if (value.length < 3) message = "Please enter your full name.";
                else if (!/^[A-Za-z\u0600-\u06FF\s.'-]+$/.test(value))
                    message = "Name can only contain letters.";
                break;
            case "phone":
                if (!value) message = "Please enter your phone number.";
                else if (!isValidPakPhone(value))
                    message = "Enter a valid number, e.g. 0300-1234567.";
                break;
            case "email":
                if (!value) message = "Please enter your email.";
                else if (!field.checkValidity())
                    message = "Enter a valid email, e.g. you@example.com.";
                break;
            case "address":
                if (value.length < 10)
                    message = "Please enter your complete address.";
                break;
            case "city":
                if (!value) message = "Please select your city.";
                break;
            case "preferredDate":
                if (!value) message = "Please pick a date.";
                else if (value < getToday())
                    message = "Please select today or a future date.";
                break;
            case "preferredTime":
                if (!value) message = "Please pick a time.";
                else if (
                    dateInput.value === getToday() &&
                    value <= currentTime()
                ) message = "That time has already passed today.";
                break;
        }

        setFieldError(id, message);
        return message === "";
    }

    function currentTime() {
        const now = new Date();
        return String(now.getHours()).padStart(2, "0") + ":" +
               String(now.getMinutes()).padStart(2, "0");
    }

    // Validate on blur, and re-validate live once a field was flagged.
    fieldIds.forEach(function (id) {
        const field = document.getElementById(id);

        field.addEventListener("blur", function () {
            if (field.value !== "" || field.classList.contains("invalid")) {
                validateField(id);
            }
        });

        ["input", "change"].forEach(function (evt) {
            field.addEventListener(evt, function () {
                if (field.classList.contains("invalid")) validateField(id);
            });
        });
    });

    // Changing the date can change whether the time is valid.
    dateInput.addEventListener("change", function () {
        if (timeInput.value) validateField("preferredTime");
    });

    /* SUCCESS POPUP */

    const modal = document.getElementById("bookingModal");
    const modalClose = document.getElementById("modalClose");
    let lastFocused = null;

    function openModal(booking) {
        const set = function (id, text) {
            document.getElementById(id).textContent = text || "—";
        };

        set("modalName", booking.fullName.split(" ")[0]);
        set("modalRef", booking.reference);
        set("modalService", booking.service);
        set("modalPlan", booking.plan);
        set("modalDate", formatDate(booking.preferredDate));
        set("modalTime", formatTime(booking.preferredTime));
        set("modalPrice", formatPKR(booking.price));

        lastFocused = document.activeElement;
        modal.hidden = false;
        document.body.classList.add("modal-open");
        modalClose.focus();
    }

    function closeModal() {
        modal.hidden = true;
        document.body.classList.remove("modal-open");

        // Start fresh for the next booking.
        form.reset();
        fieldIds.forEach(function (id) { setFieldError(id, ""); });
        updatePlans();
        updateSummary();
        window.scrollTo({ top: 0, behavior: "smooth" });

        if (lastFocused) lastFocused.focus();
    }

    if (modal && modalClose) {
        modalClose.addEventListener("click", closeModal);

        // Click on the dark backdrop closes it.
        modal.addEventListener("click", function (event) {
            if (event.target === modal) closeModal();
        });

        document.addEventListener("keydown", function (event) {
            if (modal.hidden) return;

            if (event.key === "Escape") {
                closeModal();
            } else if (event.key === "Tab") {
                // Keep keyboard focus inside the popup.
                const focusable = modal.querySelectorAll("a[href], button");
                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });
    }

    /* SUBMIT BOOKING */

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        clearError();

        // Validate every field; focus the first one that fails.
        let firstInvalid = null;

        fieldIds.forEach(function (id) {
            if (!validateField(id) && !firstInvalid) {
                firstInvalid = document.getElementById(id);
            }
        });

        if (firstInvalid) {
            showError("Please fix the highlighted fields and try again.");
            firstInvalid.focus();
            return;
        }

        const serviceKey = serviceSelect.value;
        const selectedPlan = getSelectedPlan();

        const booking = {
            reference: generateReference(),
            serviceKey: serviceKey,
            service: services[serviceKey].name,
            plan: selectedPlan.name,
            price: selectedPlan.price,

            fullName: document.getElementById("fullName").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            email: document.getElementById("email").value.trim(),
            address: document.getElementById("address").value.trim(),
            city: document.getElementById("city").value,

            preferredDate: dateInput.value,
            preferredTime: timeInput.value,

            details: document.getElementById("details").value.trim()
        };

        // Keep the booking so confirmation.html can display it.
        try {
            sessionStorage.setItem(BOOKING_KEY, JSON.stringify(booking));
        } catch (error) {
            console.error("Unable to save booking:", error);
        }

        openModal(booking);
    });
}


/* CONTACT FORM - DEMO ONLY */

function setupContactForm() {
    const form = document.getElementById("contactForm");

    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const success = document.getElementById("contactSuccess");

        if (success) {
            success.textContent =
                "Thank you! Your message has been received for this demo.";

            success.style.display = "block";
        }

        form.reset();
    });
}


/* CONFIRMATION PAGE */

function setupConfirmationPage() {
    const referenceElement = document.getElementById("confirmationRef");

    // This is not the confirmation page.
    if (!referenceElement) return;

    const details = document.getElementById("bookingConfirmationDetails");
    const noBooking = document.getElementById("noBooking");

    let booking = null;

    try {
        const savedBooking = sessionStorage.getItem(BOOKING_KEY);

        if (savedBooking) {
            booking = JSON.parse(savedBooking);
        }
    } catch (error) {
        console.error("Unable to read saved booking:", error);
    }

    if (
        !booking ||
        !details ||
        !noBooking
    ) {
        if (details) details.style.display = "none";
        if (noBooking) noBooking.style.display = "block";

        return;
    }

    details.style.display = "";
    noBooking.style.display = "none";

    const confirmationValues = {
        confirmationRef: booking.reference,
        confirmationService: booking.service,
        confirmationPlan: booking.plan,
        confirmationPrice:
            booking.price != null ? formatPKR(booking.price) : "—",
        confirmationDate: formatDate(booking.preferredDate),
        confirmationTime: formatTime(booking.preferredTime),
        confirmationName: booking.fullName,
        confirmationCity: booking.city,
        confirmationAddress: booking.address
    };

    Object.entries(confirmationValues).forEach(function ([id, value]) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value || "—";
        }
    });

    const anotherBooking = document.getElementById("anotherBooking");

    if (anotherBooking) {
        anotherBooking.addEventListener("click", function () {
            sessionStorage.removeItem(BOOKING_KEY);
        });
    }
}
