// Mock data and application state
const mockUsers = [
    {"id": "user1", "name": "sachin", "email": "sachinv29@example.com", "avatar": "👨‍💻"},
    {"id": "user2", "name": "Shilpa", "email": "shilpa223@example.com", "avatar": "👩‍🎓"}, 
    {"id": "user3", "name": "shankar", "email": "shankar3py@example.com", "avatar": "👨‍🎓"},
    {"id": "user4", "name": "chetana", "email": "chetana4@example.com", "avatar": "👩‍💻"},
    {"id": "user5", "name": "shweta k", "email": "handep@example.com", "avatar": "👨‍🎓"}
];

let appState = {
    currentUser: null,
    sessions: [
        {
            "id": "session1",
            "name": "MERN Stack Development",
            "scheduledTime": "2025-09-20T13:00:00", // Past time so it can be started
            "link": "https://developer.mozilla.org/en-US/docs/Learn",
            "milestones": [
                {"id": "m1", "title": "MongoDB Basics", "completed": false, "keyLearnings": "", "completedBy": null},
                {"id": "m2", "title": "Express.js Setup", "completed": false, "keyLearnings": "", "completedBy": null},
                {"id": "m3", "title": "React Components", "completed": false, "keyLearnings": "", "completedBy": null},
                {"id": "m4", "title": "Node.js API", "completed": false, "keyLearnings": "", "completedBy": null}
            ],
            "participants": ["user1", "user2", "user3"],
            "createdBy": "user1",
            "status": "scheduled"
        },
        {
            "id": "session2", 
            "name": "JavaScript Fundamentals",
            "scheduledTime": "2025-09-20T10:30:00",
            "link": "https://javascript.info",
            "milestones": [
                {"id": "m5", "title": "Variables & Data Types", "completed": true, "keyLearnings": "Learned about let, const, var and different data types", "completedBy": "user1"},
                {"id": "m6", "title": "Functions & Scope", "completed": false, "keyLearnings": "", "completedBy": null},
                {"id": "m7", "title": "Objects & Arrays", "completed": false, "keyLearnings": "", "completedBy": null}
            ],
            "participants": ["user1", "user4"],
            "createdBy": "user1", 
            "status": "in_progress"
        }
    ],
    currentSession: null,
    selectedFriends: [],
    milestones: [],
    currentMilestone: null,
    participantStatus: {}
};

// Utility functions
function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function getUserById(userId) {
    return mockUsers.find(user => user.id === userId);
}

function canStartSession(session) {
    const now = new Date();
    const scheduledTime = new Date(session.scheduledTime);
    return now >= scheduledTime;
}

// Authentication
function simulateGoogleLogin() {
    // Simulate Google OAuth - use first user as logged in user
    appState.currentUser = mockUsers[0];
    showUserInfo();
    showDashboard();
    showToast('Successfully logged in!', 'success');
}

function logout() {
    appState.currentUser = null;
    showLoginPage();
    showToast('Logged out successfully', 'info');
}

function showUserInfo() {
    if (appState.currentUser) {
        document.getElementById('userAvatar').textContent = appState.currentUser.avatar;
        document.getElementById('userName').textContent = appState.currentUser.name;
    }
}

// Page navigation
function showLoginPage() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('activeSession').classList.add('hidden');
    hideAllModals();
}

function showDashboard() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('activeSession').classList.add('hidden');
    document.getElementById('sessionsList').classList.add('hidden');
    hideAllModals();
}

function showSessionsList() {
    document.getElementById('sessionsList').classList.remove('hidden');
    renderSessionsList();
}

function showActiveSession(sessionId) {
    const session = appState.sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    appState.currentSession = session;
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('activeSession').classList.remove('hidden');
    hideAllModals();
    
    renderActiveSession();
    startSessionSimulation();
}

function hideAllModals() {
    document.getElementById('createSessionModal').classList.add('hidden');
    document.getElementById('milestoneModal').classList.add('hidden');
}

// Create session functionality
function showCreateSessionModal() {
    hideAllModals();
    document.getElementById('createSessionModal').classList.remove('hidden');
    populateFriendsList();
    appState.selectedFriends = [];
    appState.milestones = [];
    updateMilestonesList();
    
    // Set default datetime to current time + 1 hour
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const defaultTime = now.toISOString().slice(0, 16);
    document.getElementById('scheduleTime').value = defaultTime;
}

function hideCreateSessionModal() {
    document.getElementById('createSessionModal').classList.add('hidden');
    document.getElementById('createSessionForm').reset();
    appState.selectedFriends = [];
    appState.milestones = [];
}

function populateFriendsList() {
    const friendsList = document.getElementById('friendsList');
    friendsList.innerHTML = '';
    
    mockUsers.forEach(user => {
        if (user.id === appState.currentUser.id) return;
        
        const friendItem = document.createElement('div');
        friendItem.className = 'friend-item';
        friendItem.innerHTML = `
            <input type="checkbox" class="friend-checkbox" id="friend-${user.id}" value="${user.id}">
            <div class="friend-info">
                <span class="friend-avatar">${user.avatar}</span>
                <span class="friend-name">${user.name}</span>
            </div>
        `;
        
        friendItem.addEventListener('click', (e) => {
            e.preventDefault();
            toggleFriendSelection(user.id);
        });
        
        friendsList.appendChild(friendItem);
    });
}

function toggleFriendSelection(userId) {
    const checkbox = document.getElementById(`friend-${userId}`);
    const friendItem = checkbox.closest('.friend-item');
    
    if (appState.selectedFriends.includes(userId)) {
        appState.selectedFriends = appState.selectedFriends.filter(id => id !== userId);
        checkbox.checked = false;
        friendItem.classList.remove('selected');
    } else {
        appState.selectedFriends.push(userId);
        checkbox.checked = true;
        friendItem.classList.add('selected');
    }
}

function addMilestone() {
    const input = document.getElementById('newMilestone');
    const title = input.value.trim();
    
    if (!title) {
        showToast('Please enter a milestone title', 'error');
        return;
    }
    
    const milestone = {
        id: generateId(),
        title: title,
        completed: false,
        keyLearnings: '',
        completedBy: null
    };
    
    appState.milestones.push(milestone);
    updateMilestonesList();
    input.value = '';
    showToast('Milestone added', 'success');
}

function removeMilestone(milestoneId) {
    appState.milestones = appState.milestones.filter(m => m.id !== milestoneId);
    updateMilestonesList();
    showToast('Milestone removed', 'info');
}

function updateMilestonesList() {
    const milestonesList = document.getElementById('milestonesList');
    milestonesList.innerHTML = '';
    
    appState.milestones.forEach(milestone => {
        const milestoneItem = document.createElement('div');
        milestoneItem.className = 'milestone-item';
        milestoneItem.innerHTML = `
            <span class="milestone-text">${milestone.title}</span>
            <button type="button" class="remove-milestone" data-milestone-id="${milestone.id}">×</button>
        `;
        
        const removeBtn = milestoneItem.querySelector('.remove-milestone');
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            removeMilestone(milestone.id);
        });
        
        milestonesList.appendChild(milestoneItem);
    });
}

function createSession(event) {
    event.preventDefault();
    
    const sessionName = document.getElementById('sessionName').value.trim();
    const scheduleTime = document.getElementById('scheduleTime').value;
    const learningLink = document.getElementById('learningLink').value.trim();
    
    if (!sessionName || !scheduleTime || !learningLink) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (appState.milestones.length === 0) {
        showToast('Please add at least one milestone', 'error');
        return;
    }
    
    const newSession = {
        id: generateId(),
        name: sessionName,
        scheduledTime: scheduleTime,
        link: learningLink,
        milestones: [...appState.milestones],
        participants: [appState.currentUser.id, ...appState.selectedFriends],
        createdBy: appState.currentUser.id,
        status: 'scheduled'
    };
    
    appState.sessions.push(newSession);
    hideCreateSessionModal();
    showToast('Session created successfully!', 'success');
}

// Sessions list rendering
function renderSessionsList() {
    const container = document.getElementById('sessionsContainer');
    container.innerHTML = '';
    
    const userSessions = appState.sessions.filter(session => 
        session.participants.includes(appState.currentUser.id)
    );
    
    if (userSessions.length === 0) {
        container.innerHTML = `
            <div class="text-center text-small">
                <p>No sessions found. Create your first session to get started!</p>
            </div>
        `;
        return;
    }
    
    userSessions.forEach(session => {
        const sessionCard = document.createElement('div');
        sessionCard.className = 'session-card';
        
        const completedMilestones = session.milestones.filter(m => m.completed).length;
        const totalMilestones = session.milestones.length;
        const canStart = canStartSession(session);
        
        sessionCard.innerHTML = `
            <div class="session-card-header">
                <h3 class="session-card-title">${session.name}</h3>
                <div class="session-card-time">📅 ${formatDateTime(session.scheduledTime)}</div>
                <div class="session-card-link">🔗 <a href="${session.link}" target="_blank">${session.link}</a></div>
                <div class="session-status ${session.status}">${session.status.replace('_', ' ')}</div>
            </div>
            
            <div class="session-card-milestones">
                <h4>Milestones (${completedMilestones}/${totalMilestones})</h4>
                <div class="milestones-preview">
                    ${session.milestones.slice(0, 3).map(m => 
                        `<span class="milestone-badge ${m.completed ? 'completed' : ''}">${m.title}</span>`
                    ).join('')}
                    ${session.milestones.length > 3 ? `<span class="milestone-badge">+${session.milestones.length - 3} more</span>` : ''}
                </div>
            </div>
            
            <div class="session-card-participants">
                <h4>Participants (${session.participants.length})</h4>
                <div class="participants-preview">
                    ${session.participants.slice(0, 5).map(participantId => {
                        const user = getUserById(participantId);
                        return `<div class="participant-avatar" title="${user.name}">${user.avatar}</div>`;
                    }).join('')}
                    ${session.participants.length > 5 ? `<div class="participant-avatar">+${session.participants.length - 5}</div>` : ''}
                </div>
            </div>
            
            <div class="session-card-actions">
                ${canStart && session.status !== 'completed' ? 
                    `<button class="btn btn--primary btn--full-width start-session-btn" data-session-id="${session.id}">Start Session</button>` :
                    `<button class="btn btn--outline btn--full-width" disabled>
                        ${session.status === 'completed' ? 'Session Completed' : 'Scheduled for ' + new Date(session.scheduledTime).toLocaleTimeString()}
                    </button>`
                }
            </div>
        `;
        
        const startBtn = sessionCard.querySelector('.start-session-btn');
        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                e.preventDefault();
                startSession(session.id);
            });
        }
        
        container.appendChild(sessionCard);
    });
}

function startSession(sessionId) {
    const session = appState.sessions.find(s => s.id === sessionId);
    if (session) {
        session.status = 'in_progress';
        showActiveSession(sessionId);
        showToast('Session started!', 'success');
    }
}

// Active session functionality
function renderActiveSession() {
    if (!appState.currentSession) return;
    
    const session = appState.currentSession;
    document.getElementById('activeSessionName').textContent = session.name;
    document.getElementById('activeLearningLink').href = session.link;
    
    renderActiveMilestones();
    renderParticipantsList();
    updateEndSessionButton();
}

function renderActiveMilestones() {
    const container = document.getElementById('activeMilestones');
    container.innerHTML = '';
    
    appState.currentSession.milestones.forEach(milestone => {
        const milestoneCard = document.createElement('div');
        milestoneCard.className = `milestone-card ${milestone.completed ? 'completed' : ''}`;
        
        milestoneCard.innerHTML = `
            <div class="milestone-card-header">
                <h3 class="milestone-title">${milestone.title}</h3>
                ${!milestone.completed ? 
                    `<button class="btn btn--primary milestone-complete-btn" data-milestone-id="${milestone.id}">
                        Complete Milestone
                    </button>` :
                    `<span class="milestone-completed-by">✅ Completed by ${getUserById(milestone.completedBy)?.name}</span>`
                }
            </div>
            ${milestone.completed && milestone.keyLearnings ? 
                `<div class="milestone-learnings">
                    <strong>Key Learnings:</strong><br>
                    ${milestone.keyLearnings}
                </div>` : ''
            }
        `;
        
        const completeBtn = milestoneCard.querySelector('.milestone-complete-btn');
        if (completeBtn) {
            completeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openMilestoneModal(milestone.id);
            });
        }
        
        container.appendChild(milestoneCard);
    });
}

function renderParticipantsList() {
    const container = document.getElementById('participantsList');
    container.innerHTML = '';
    
    appState.currentSession.participants.forEach(participantId => {
        const user = getUserById(participantId);
        const completedMilestones = appState.currentSession.milestones.filter(m => m.completedBy === participantId).length;
        const totalMilestones = appState.currentSession.milestones.length;
        const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
        const status = appState.participantStatus[participantId] || 'online';
        
        const participantCard = document.createElement('div');
        participantCard.className = 'participant-card';
        
        participantCard.innerHTML = `
            <div class="participant-info">
                <span class="participant-avatar">${user.avatar}</span>
                <span class="participant-name">${user.name}</span>
                <span class="participant-status ${status}">${status}</span>
            </div>
            <div class="participant-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">${completedMilestones}/${totalMilestones} milestones completed</div>
            </div>
        `;
        
        container.appendChild(participantCard);
    });
}

function openMilestoneModal(milestoneId) {
    hideAllModals();
    appState.currentMilestone = milestoneId;
    const milestone = appState.currentSession.milestones.find(m => m.id === milestoneId);
    document.getElementById('milestoneModalTitle').textContent = `Complete: ${milestone.title}`;
    document.getElementById('keyLearnings').value = '';
    document.getElementById('milestoneModal').classList.remove('hidden');
}

function closeMilestoneModal() {
    document.getElementById('milestoneModal').classList.add('hidden');
    appState.currentMilestone = null;
}

function completeMilestone() {
    const keyLearnings = document.getElementById('keyLearnings').value.trim();
    
    if (!keyLearnings) {
        showToast('Please enter your key learnings', 'error');
        return;
    }
    
    const milestone = appState.currentSession.milestones.find(m => m.id === appState.currentMilestone);
    if (milestone) {
        milestone.completed = true;
        milestone.keyLearnings = keyLearnings;
        milestone.completedBy = appState.currentUser.id;
        
        closeMilestoneModal();
        renderActiveSession();
        showToast('Milestone completed!', 'success');
        
        // Simulate other participants' progress
        setTimeout(() => simulateParticipantProgress(), 2000);
    }
}

function takeBreak() {
    appState.participantStatus[appState.currentUser.id] = 'break';
    renderParticipantsList();
    showToast('You are now on break', 'info');
    
    // Auto return from break after 30 seconds (simulated)
    setTimeout(() => {
        if (appState.participantStatus[appState.currentUser.id] === 'break') {
            appState.participantStatus[appState.currentUser.id] = 'online';
            renderParticipantsList();
            showToast('Welcome back from break!', 'success');
        }
    }, 5000);
}

function updateEndSessionButton() {
    const allCompleted = appState.currentSession.milestones.every(m => m.completed);
    const endButton = document.getElementById('endSessionBtn');
    endButton.disabled = !allCompleted;
    
    if (allCompleted) {
        endButton.textContent = 'End Session';
    } else {
        const remaining = appState.currentSession.milestones.filter(m => !m.completed).length;
        endButton.textContent = `${remaining} milestones remaining`;
    }
}

function endSession() {
    appState.currentSession.status = 'completed';
    showToast('Session completed successfully!', 'success');
    setTimeout(() => {
        showDashboard();
    }, 2000);
}

function leaveSession() {
    showToast('Left the session', 'info');
    showDashboard();
}

// Real-time simulation
function startSessionSimulation() {
    // Simulate real-time updates every 10 seconds
    const interval = setInterval(() => {
        if (!appState.currentSession || document.getElementById('activeSession').classList.contains('hidden')) {
            clearInterval(interval);
            return;
        }
        
        simulateParticipantProgress();
    }, 10000);
}

function simulateParticipantProgress() {
    // Randomly complete milestones by other participants
    const incompleteMilestones = appState.currentSession.milestones.filter(m => !m.completed);
    const otherParticipants = appState.currentSession.participants.filter(id => id !== appState.currentUser.id);
    
    if (incompleteMilestones.length > 0 && otherParticipants.length > 0 && Math.random() < 0.3) {
        const randomMilestone = incompleteMilestones[Math.floor(Math.random() * incompleteMilestones.length)];
        const randomParticipant = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const user = getUserById(randomParticipant);
        
        randomMilestone.completed = true;
        randomMilestone.completedBy = randomParticipant;
        randomMilestone.keyLearnings = `Key insights and learnings from ${randomMilestone.title} by ${user.name}`;
        
        renderActiveSession();
        showToast(`${user.name} completed "${randomMilestone.title}"!`, 'success');
    }
    
    // Simulate participants going on break
    if (Math.random() < 0.2) {
        const onlineParticipants = appState.currentSession.participants.filter(id => 
            id !== appState.currentUser.id && appState.participantStatus[id] !== 'break'
        );
        
        if (onlineParticipants.length > 0) {
            const randomParticipant = onlineParticipants[Math.floor(Math.random() * onlineParticipants.length)];
            appState.participantStatus[randomParticipant] = 'break';
            
            setTimeout(() => {
                appState.participantStatus[randomParticipant] = 'online';
                if (!document.getElementById('activeSession').classList.contains('hidden')) {
                    renderParticipantsList();
                }
            }, 8000);
            
            renderParticipantsList();
        }
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Authentication
    document.getElementById('googleLoginBtn').addEventListener('click', (e) => {
        e.preventDefault();
        simulateGoogleLogin();
    });
    
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    // Dashboard navigation
    document.getElementById('createSessionBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showCreateSessionModal();
    });
    
    document.getElementById('mySessionsBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showSessionsList();
    });
    
    document.getElementById('backToDashboard').addEventListener('click', (e) => {
        e.preventDefault();
        showDashboard();
    });
    
    // Create session modal
    document.getElementById('closeCreateModal').addEventListener('click', (e) => {
        e.preventDefault();
        hideCreateSessionModal();
    });
    
    document.getElementById('cancelCreate').addEventListener('click', (e) => {
        e.preventDefault();
        hideCreateSessionModal();
    });
    
    document.getElementById('createSessionForm').addEventListener('submit', createSession);
    
    document.getElementById('addMilestoneBtn').addEventListener('click', (e) => {
        e.preventDefault();
        addMilestone();
    });
    
    // Milestone modal
    document.getElementById('closeMilestoneModal').addEventListener('click', (e) => {
        e.preventDefault();
        closeMilestoneModal();
    });
    
    document.getElementById('cancelMilestone').addEventListener('click', (e) => {
        e.preventDefault();
        closeMilestoneModal();
    });
    
    document.getElementById('submitMilestone').addEventListener('click', (e) => {
        e.preventDefault();
        completeMilestone();
    });
    
    // Active session controls
    document.getElementById('takeBreakBtn').addEventListener('click', (e) => {
        e.preventDefault();
        takeBreak();
    });
    
    document.getElementById('endSessionBtn').addEventListener('click', (e) => {
        e.preventDefault();
        endSession();
    });
    
    document.getElementById('leaveSessionBtn').addEventListener('click', (e) => {
        e.preventDefault();
        leaveSession();
    });
    
    // Allow Enter key to add milestones
    document.getElementById('newMilestone').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addMilestone();
        }
    });
    
    // Allow Ctrl+Enter to complete milestone
    document.getElementById('keyLearnings').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            completeMilestone();
        }
    });
    
    // Close modals when clicking outside
    document.getElementById('createSessionModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            hideCreateSessionModal();
        }
    });
    
    document.getElementById('milestoneModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeMilestoneModal();
        }
    });
    
    // Initialize the app
    showLoginPage();
});