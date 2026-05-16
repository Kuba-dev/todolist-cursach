const API = 'http://localhost:3000';

const app = document.querySelector('#app');

let token = localStorage.getItem('token');

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  token = data.access_token;
  localStorage.setItem('token', token);

  loadTodos();
}

async function loadTodos() {
  const res = await fetch(`${API}/todos`, {
    headers: headers(),
  });

  const todos = await res.json();

  renderTodos(todos);
}

async function addTodo(title) {
  await fetch(`${API}/todos`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ title }),
  });

  loadTodos();
}

async function toggleTodo(id, completed) {
  await fetch(`${API}/todos/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({
      completed: !completed,
    }),
  });

  loadTodos();
}

async function deleteTodo(id) {
  await fetch(`${API}/todos/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });

  loadTodos();
}

function renderLogin() {
  app.innerHTML = `
    <div class="card">
      <h1>Todo Login</h1>

      <input id="email" placeholder="email" />
      <input id="password" type="password" placeholder="password" />

      <button id="loginBtn">Login</button>
    </div>
  `;

  document.querySelector('#loginBtn').onclick = async () => {
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    await login(email, password);
  };
}

function renderTodos(todos) {
  app.innerHTML = `
    <div class="card">
      <h1>Todos</h1>

      <div class="row">
        <input id="newTodo" placeholder="new todo" />
        <button id="addBtn">Add</button>
      </div>

      <div>
        ${todos
          .map(
            (todo) => `
          <div class="todo">
            <span
              style="
                text-decoration:${todo.completed ? 'line-through' : 'none'}
              "
            >
              ${todo.title}
            </span>

            <div>
              <button onclick="toggleTodo(${todo.id}, ${todo.completed})">
                ✓
              </button>

              <button onclick="deleteTodo(${todo.id})">
                x
              </button>
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
    </div>
  `;

  document.querySelector('#addBtn').onclick = async () => {
    const title = document.querySelector('#newTodo').value;

    if (!title) return;

    await addTodo(title);
  };
}

window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;

if (token) {
  loadTodos();
} else {
  renderLogin();
}