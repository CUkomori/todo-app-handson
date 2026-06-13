const STORAGE_KEY = 'todo-app-tasks';

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  const parsed = JSON.parse(saved);
  // 旧形式（string[]）からの移行
  return parsed.map((item) =>
    typeof item === 'string'
      ? { id: Date.now() + Math.random(), text: item, completed: false }
      : item
  );
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks(tasks) {
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  if (tasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'task-empty';
    empty.textContent = 'タスクがありません。追加ボタンを押してください。';
    list.appendChild(empty);
    return;
  }

  tasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = 'task-item' + (task.completed ? ' is-completed' : '');
    item.dataset.id = task.id;

    // チェックボックス＋テキストのラベル
    const label = document.createElement('label');
    label.className = 'task-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;

    label.appendChild(checkbox);
    label.appendChild(span);

    // 編集・削除ボタン
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'task-edit-button';
    editBtn.textContent = '編集';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'task-delete-button';
    deleteBtn.textContent = '削除';

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(label);
    item.appendChild(actions);
    list.appendChild(item);
  });
}

const tasks = loadTasks();
renderTasks(tasks);

const form = document.querySelector('.task-form');
const input = document.querySelector('.task-input');
const taskList = document.getElementById('task-list');

// 完了トグル
taskList.addEventListener('change', (event) => {
  if (!event.target.classList.contains('task-checkbox')) return;
  const id = Number(event.target.closest('.task-item').dataset.id);
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = event.target.checked;
  saveTasks(tasks);
  renderTasks(tasks);
});

// 削除・編集・保存
taskList.addEventListener('click', (event) => {
  const item = event.target.closest('.task-item');
  if (!item) return;
  const id = Number(item.dataset.id);

  // 削除
  if (event.target.classList.contains('task-delete-button')) {
    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) tasks.splice(index, 1);
    saveTasks(tasks);
    renderTasks(tasks);
    return;
  }

  // 編集ボタン → インライン編集モードへ切り替え
  if (event.target.classList.contains('task-edit-button')) {
    const span = item.querySelector('.task-text');
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'task-edit-input';
    editInput.value = task.text;
    span.replaceWith(editInput);
    editInput.focus();

    event.target.textContent = '保存';
    event.target.className = 'task-save-button';
    return;
  }

  // 保存ボタン → 編集を確定
  if (event.target.classList.contains('task-save-button')) {
    const editInput = item.querySelector('.task-edit-input');
    const newText = editInput.value.trim();
    if (!newText) {
      alert('タスクを入力してください。');
      return;
    }
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.text = newText;
    saveTasks(tasks);
    renderTasks(tasks);
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) {
    alert('タスクを入力してください。');
    return;
  }

  tasks.push({ id: Date.now(), text, completed: false });
  saveTasks(tasks);
  renderTasks(tasks);
  input.value = '';
});
