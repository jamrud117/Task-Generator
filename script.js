let tasks = [];
let currentDate = "";

/* =========================
   GENERATE TASKS
========================= */
function generateTasks() {
  const textArea = document.getElementById("inputText");
  const text = textArea.value;
  const lines = text.split("\n");
  tasks = [];

  // Cari tanggal
  const dateMatch = text.match(
    /(Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu)\s+\d{2}-\d{2}-\d{4}/i
  );

  // Update tanggal hanya jika ditemukan tanggal baru
  if (dateMatch) {
    currentDate = dateMatch[0];
  }

  document.getElementById("dateHeader").textContent = currentDate
    ? "📅 " + currentDate
    : "";

  // Ambil task berdasarkan numbering
  lines.forEach((line) => {
    const match = line.match(/^\s*\d+\.\s*(.+)/);
    if (match) {
      const content = match[1];
      const titleMatch = content.match(/(PT.*?)(?=\s*-)/i);
      const descMatch = content.match(/-\s*(.+)/);

      tasks.push({
        title: titleMatch ? titleMatch[1].trim() : "Tanpa Judul",
        description: descMatch ? descMatch[1].trim() : "",
        done: false,
      });
    }
  });

  saveTasks();
  renderTasks();
}

/* =========================
   RENDER TASKS
========================= */
function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  tasks.sort((a, b) => a.done - b.done);

  tasks.forEach((task, index) => {
    const collapseId = "collapse" + index;

    const taskCard = document.createElement("div");
    taskCard.className = "card task-card" + (task.done ? " task-done" : "");

    taskCard.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">

          <div class="d-flex align-items-center gap-3 flex-grow-1">
            <input type="checkbox" class="form-check-input"
              ${task.done ? "checked" : ""}>
            <h6 class="mb-0 fw-semibold">${task.title}</h6>
          </div>

          <button class="btn btn-sm btn-light" data-bs-toggle="collapse"
            data-bs-target="#${collapseId}">
            <i class="fa-solid fa-chevron-down rotate active"></i>
          </button>
        </div>

        <div class="collapse show mt-3" id="${collapseId}">
          ${task.description}
        </div>
      </div>
    `;

    taskList.appendChild(taskCard);

    const checkbox = taskCard.querySelector("input");
    const icon = taskCard.querySelector(".rotate");
    const collapseEl = taskCard.querySelector(".collapse");

    checkbox.addEventListener("change", function () {
      tasks[index].done = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    collapseEl.addEventListener("show.bs.collapse", () => {
      icon.classList.add("active");
    });

    collapseEl.addEventListener("hide.bs.collapse", () => {
      icon.classList.remove("active");
    });

    // Klik card (kecuali button & checkbox) → toggle checkbox
    taskCard.addEventListener("click", function (e) {
      if (!e.target.closest("button") && e.target.type !== "checkbox") {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event("change"));
      }
    });
  });

  updateStats();
}

/* =========================
   UPDATE STATS
========================= */
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;

  document.getElementById("totalTask").textContent = total;
  document.getElementById("completedTask").textContent = completed;

  const percent = total === 0 ? 0 : (completed / total) * 100;
  document.getElementById("progressBar").style.width = percent + "%";
}

/* =========================
   LOCAL STORAGE
========================= */
function saveTasks() {
  localStorage.setItem("taskData", JSON.stringify(tasks));
  localStorage.setItem("taskDate", currentDate);
  localStorage.setItem(
    "generatorText",
    document.getElementById("inputText").value
  );
}

function loadTasks() {
  const savedTasks = localStorage.getItem("taskData");
  const savedDate = localStorage.getItem("taskDate");
  const savedText = localStorage.getItem("generatorText");

  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }

  if (savedDate) {
    currentDate = savedDate;
    document.getElementById("dateHeader").textContent = "📅 " + currentDate;
  }

  if (savedText) {
    document.getElementById("inputText").value = savedText;
  }

  renderTasks();
}

/* =========================
   AUTO NUMBERING
========================= */
function autoNumbering() {
  const textarea = document.getElementById("inputText");

  textarea.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const value = textarea.value;
      const lines = value.split("\n");
      const lastLine = lines[lines.length - 1];

      const match = lastLine.match(/^\s*(\d+)\.\s*/);

      if (match) {
        e.preventDefault();
        const nextNumber = parseInt(match[1]) + 1;
        textarea.value += "\n" + nextNumber + ". ";
      }
    }
  });
}

/* =========================
   AUTO SAVE TEXTAREA
========================= */
function autoSaveText() {
  const textarea = document.getElementById("inputText");

  textarea.addEventListener("input", function () {
    localStorage.setItem("generatorText", this.value);
  });
}
function resetAll() {
  Swal.fire({
    title: "Yakin ingin reset?",
    text: "Semua task, tanggal, dan text generator akan dihapus.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Ya, Reset!",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      // Kosongkan data
      tasks = [];
      currentDate = "";

      localStorage.removeItem("taskData");
      localStorage.removeItem("taskDate");
      localStorage.removeItem("generatorText");

      document.getElementById("inputText").value = "";
      document.getElementById("dateHeader").textContent = "";

      renderTasks();

      // Alert sukses
      Swal.fire({
        title: "Berhasil!",
        text: "Semua data task telah direset.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
    }
  });
}
/* =========================
   DARK MODE
========================= */
function toggleDarkMode() {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", isDark);

  const icon = document.querySelector("#darkToggleBtn i");
  icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
}

function loadDarkMode() {
  const isDark = localStorage.getItem("darkMode") === "true";

  if (isDark) {
    document.body.classList.add("dark");
    document.querySelector("#darkToggleBtn i").className = "fa-solid fa-sun";
  }
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", function () {
  loadTasks();
  loadDarkMode();
  autoNumbering();
  autoSaveText();
});
