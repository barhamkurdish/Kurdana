const openRegister = document.getElementById("openRegister");
const closeRegister = document.getElementById("closeRegister");
const registerModal = document.getElementById("registerModal");
const registerForm = document.getElementById("registerForm");

function openModal() {
    registerModal.classList.add("show");
    registerModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    setTimeout(() => {
        document.getElementById("fullName").focus();
    }, 150);
}

function closeModal() {
    registerModal.classList.remove("show");
    registerModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}

openRegister.addEventListener("click", openModal);
closeRegister.addEventListener("click", closeModal);

registerModal.addEventListener("click", (event) => {
    if (event.target === registerModal) {
        closeModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && registerModal.classList.contains("show")) {
        closeModal();
    }
});

registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    alert("فۆڕمی تۆمارکردن بە سەرکەوتوویی پڕکرایەوە. لەم قۆناغەدا زانیارییەکان تەنیا لە ناو پەڕەکەدایە.");
    registerForm.reset();
    closeModal();
});
