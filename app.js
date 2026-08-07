const API_URL = './api'; 

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        const role = localStorage.getItem('user_role');
        updateUIForLoggedInUser(role);
        loadDashboardData(role);
    }
    const loginForm = document.getElementById('login-form');
    if(loginForm) {
        loginForm.addEventListener('submit', login);
    }
});

function showView(viewId) {
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

async function login(event) {
    event.preventDefault();
    
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;
    const errorMsg = document.getElementById('error-msg');
    
    try {
        const response = await fetch(`${API_URL}/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass, role: role })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            errorMsg.style.display = 'none';
            localStorage.setItem("jwt_token", data.token);
            localStorage.setItem("user_role", data.role);
            localStorage.setItem("user_id", data.user_id);
            
            updateUIForLoggedInUser(data.role);
            loadDashboardData(data.role); 
        } else {
            errorMsg.style.display = 'block';
            errorMsg.innerText = data.error || "Credenciales inválidas.";
        }
    } catch (error) {
        console.error("Error Fetch API:", error);
        errorMsg.style.display = 'block';
        errorMsg.innerText = "Error 500: Fallo de conexión con PHP/SQL.";
    }
}

async function loadDashboardData(role) {
    const token = localStorage.getItem('jwt_token');
    const userId = localStorage.getItem('user_id');
    if (!token) return logout();

    try {
        const response = await fetch(`${API_URL}/dashboard.php?user_id=${userId}&role=${role}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401) return logout();

        const dbData = await response.json();
        
        if (role === 'paciente') {
            renderPacienteData(dbData);
        } else if (role === 'funcionario') {
            renderFuncionarioData(dbData);
        }
    } catch (error) {
        console.error("Error leyendo tablas:", error);
    }
}

function renderPacienteData(data) {
    const listaEstudios = document.getElementById('lista-estudios');
    listaEstudios.innerHTML = ''; 
    
    if(data.historial && data.historial.length > 0) {
        data.historial.forEach(registro => {
            const li = document.createElement('li');
            li.innerText = `Fecha: ${registro.fecha} - ${registro.especialidad} | Estado: ${registro.estado}`;
            listaEstudios.appendChild(li);
        });
        document.getElementById('qr-paciente').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.historial[0].qr_hash}`;
    } else {
        listaEstudios.innerHTML = '<li>No hay registros clínicos en la base de datos.</li>';
    }
}

function renderFuncionarioData(data) {
    const containerAmbulancias = document.getElementById('status-ambulancias');
    if(data.ambulancias_activas !== undefined) {
        containerAmbulancias.innerHTML = `Ambulancias en Ruta: <strong>${data.ambulancias_activas} Unidades</strong><br><small>Alerta: ${data.alertas}</small>`;
    }
}

function updateUIForLoggedInUser(role) {
    document.getElementById('btn-login').style.display = 'none';
    document.getElementById('btn-logout').style.display = 'inline-block';
    
    if (role === 'paciente') {
        document.getElementById('btn-paciente').style.display = 'inline-block';
        document.getElementById('btn-funcionario').style.display = 'none';
        showView('paciente');
    } else {
        document.getElementById('btn-paciente').style.display = 'none';
        document.getElementById('btn-funcionario').style.display = 'inline-block';
        showView('funcionario');
    }
}

function logout() {
    localStorage.clear();
    document.getElementById('btn-login').style.display = 'inline-block';
    document.getElementById('btn-logout').style.display = 'none';
    document.getElementById('btn-paciente').style.display = 'none';
    document.getElementById('btn-funcionario').style.display = 'none';
    
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    showView('login');
}