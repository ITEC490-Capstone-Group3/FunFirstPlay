const form = document.getElementById('sessionForm');
const sessionsList = document.getElementById('sessionsList');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    loadSessions();
});

async function loadSessions() {
    const response = await fetch('/api/sessions');
    const sessions = await response.json();

    sessionsList.innerHTML = sessions
        .map(
            (session) => `
        <div>
            <h3>${session.name}</h3>
            <p>${session.description}</p>
            <p>${session.date}</p>
            <button onclick="deleteSession(${session.id})">Delete</button>
        </div>
    `
        )
        .join('');
}

async function deleteSession(id) {
    await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
    loadSessions();
}

loadSessions();