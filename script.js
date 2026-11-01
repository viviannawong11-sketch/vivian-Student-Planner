// ---------- Data ----------
const STORAGE_KEY = "studentPlannerTasks";
let tasks = loadTasks();

// ---------- Elements ----------
const form = document.getElementById("taskForm");
const titleInput = document.getElementById("taskTitle");
const subjectInput = document.getElementById("taskSubject");
const errorBox = document.getElementById("formError");
const pendingList = document.getElementById("pendingList");
const completedList = document.getElementById("completedList");
const totalEl = document.getElementById("totalTasks");
const completedEl = document.getElementById("completedTasks");
const pendingEl = document.getElementById("pendingTasks");

// ---------- Local Storage ----------
function loadTasks() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch (e) {
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
        console.warn("Could not save tasks:", e);
    }
}

// ---------- Task actions ----------
function addTask(title, subject) {
    tasks.push({
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        title: title,
        subject: subject || "General",
        completed: false
    });
    saveTasks();
    render();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        render();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
}

// ---------- Rendering ----------
function createTaskItem(task) {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", task.completed ? "Mark as incomplete" : "Mark as complete");
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const info = document.createElement("div");
    info.className = "task-info";

    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.title;       // textContent keeps user input safe

    const subject = document.createElement("span");
    subject.className = "task-subject";
    subject.textContent = task.subject;

    info.appendChild(title);
    info.appendChild(subject);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "btn-delete";
    del.textContent = "Delete";
    del.addEventListener("click", () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(info);
    li.appendChild(del);
    return li;
}

function fillList(listEl, items, emptyText) {
    listEl.innerHTML = "";
    if (items.length === 0) {
        const msg = document.createElement("li");
        msg.className = "empty-message";
        msg.textContent = emptyText;
        listEl.appendChild(msg);
        return;
    }
    items.forEach(task => listEl.appendChild(createTaskItem(task)));
}

function render() {
    const pending = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);

    fillList(
        pendingList,
        pending,
        tasks.length === 0
            ? "No tasks yet. Add your first study task above!"
            : "No pending tasks. Great work!"
    );
    fillList(completedList, completed, "No completed tasks yet.");

    totalEl.textContent = tasks.length;
    completedEl.textContent = completed.length;
    pendingEl.textContent = pending.length;
}

// ---------- Form ----------
form.addEventListener("submit", function (event) {
    event.preventDefault();
    const title = titleInput.value.trim();
    const subject = subjectInput.value.trim();

    if (title === "") {
        errorBox.textContent = "Please enter a task title.";
        titleInput.classList.add("invalid");
        titleInput.focus();
        return;
    }

    errorBox.textContent = "";
    titleInput.classList.remove("invalid");
    addTask(title, subject);
    form.reset();
    titleInput.focus();
});

titleInput.addEventListener("input", () => {
    if (titleInput.value.trim() !== "") {
        errorBox.textContent = "";
        titleInput.classList.remove("invalid");
    }
});

// ---------- Mobile menu ----------
const sidebar = document.getElementById("sidebar");
const backdrop = document.getElementById("backdrop");
const menuBtn = document.getElementById("menuBtn");

function setMenu(open) {
    sidebar.classList.toggle("open", open);
    backdrop.classList.toggle("show", open);
    menuBtn.setAttribute("aria-expanded", String(open));
}
menuBtn.addEventListener("click", () => setMenu(!sidebar.classList.contains("open")));
backdrop.addEventListener("click", () => setMenu(false));

// ---------- Nav highlight ----------
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach(link => link.addEventListener("click", () => {
    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    setMenu(false);
}));

const sections = ["overview", "tasks", "about"].map(id => document.getElementById(id));
window.addEventListener("scroll", () => {
    let current = "overview";
    sections.forEach(sec => {
        if (sec.getBoundingClientRect().top < 140) current = sec.id;
    });
    navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + current));
});

// ---------- Start ----------
render();
