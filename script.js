// ============================================
// DATA STRUCTURES
// ============================================

/**
 * FriendsGraph - Adjacency List implementation using Map and Set
 * Time Complexities:
 * - addFriend: O(1)
 * - removeFriend: O(1)
 * - areFriends: O(1)
 * - getFriends: O(degree)
 */
class FriendsGraph {
    constructor() {
        this.graph = new Map();
    }

    addUser(userId) {
        if (!this.graph.has(userId)) {
            this.graph.set(userId, new Set());
        }
    }

    addFriend(userId, friendId) {
        this.addUser(userId);
        this.addUser(friendId);
        this.graph.get(userId).add(friendId);
        this.graph.get(friendId).add(userId);
    }

    removeFriend(userId, friendId) {
        if (this.graph.has(userId)) {
            this.graph.get(userId).delete(friendId);
        }
        if (this.graph.has(friendId)) {
            this.graph.get(friendId).delete(userId);
        }
    }

    areFriends(userId, friendId) {
        return this.graph.has(userId) && this.graph.get(userId).has(friendId);
    }

    getFriends(userId) {
        return this.graph.has(userId) ? Array.from(this.graph.get(userId)) : [];
    }

    getFriendCount(userId) {
        return this.graph.has(userId) ? this.graph.get(userId).size : 0;
    }

    getAllUsers() {
        return Array.from(this.graph.keys());
    }

    getEdgeCount() {
        let count = 0;
        for (const friends of this.graph.values()) {
            count += friends.size;
        }
        return count / 2;
    }
}

/**
 * MutualFriendsRecommender - Hash-based counting for recommendations
 */
class MutualFriendsRecommender {
    constructor(graph) {
        this.graph = graph;
    }

    getMutualFriends(userId, otherUserId) {
        const friends1 = this.graph.getFriends(userId);
        const friends2 = this.graph.getFriends(otherUserId);

        let smaller, larger;
        if (friends1.length <= friends2.length) {
            smaller = friends1;
            larger = new Set(friends2);
        } else {
            smaller = friends2;
            larger = new Set(friends1);
        }

        const mutual = [];
        for (const friend of smaller) {
            if (larger.has(friend)) {
                mutual.push(friend);
            }
        }
        return mutual;
    }

    getRecommendations(userId, limit = 5) {
        const allUsers = this.graph.getAllUsers();
        const friends = new Set(this.graph.getFriends(userId));
        const scores = new Map();

        for (const otherUserId of allUsers) {
            if (otherUserId === userId) continue;
            if (friends.has(otherUserId)) continue;

            const mutual = this.getMutualFriends(userId, otherUserId);
            if (mutual.length > 0) {
                scores.set(otherUserId, {
                    mutualCount: mutual.length,
                    mutualFriends: mutual
                });
            }
        }

        const sorted = Array.from(scores.entries())
            .sort((a, b) => b[1].mutualCount - a[1].mutualCount)
            .slice(0, limit);

        return sorted.map(([userId, data]) => ({
            userId,
            mutualCount: data.mutualCount,
            mutualFriends: data.mutualFriends
        }));
    }
}

// ============================================
// APPLICATION STATE
// ============================================

const users = [
    { id: 1, name: 'Alice Chen', color: '#1877f2', emoji: '👩' },
    { id: 2, name: 'Bob Smith', color: '#f02849', emoji: '👨' },
    { id: 3, name: 'Carol Davis', color: '#42b72a', emoji: '👩' },
    { id: 4, name: 'David Lee', color: '#f7b928', emoji: '👨' },
    { id: 5, name: 'Emma Wilson', color: '#a371f7', emoji: '👩' },
    { id: 6, name: 'Frank Miller', color: '#e4e6eb', emoji: '👨' },
    { id: 7, name: 'Grace Kim', color: '#79c0ff', emoji: '👩' },
    { id: 8, name: 'Henry Brown', color: '#ffa657', emoji: '👨' }
];

const graph = new FriendsGraph();
const recommender = new MutualFriendsRecommender(graph);
let currentUserId = 1;
let selectedUserId = null;
let currentPanel = 'home';

// ============================================
// INITIALIZATION
// ============================================

function init() {
    // Initialize graph with sample friendships
    graph.addFriend(1, 2);
    graph.addFriend(1, 3);
    graph.addFriend(2, 3);
    graph.addFriend(2, 4);
    graph.addFriend(3, 4);
    graph.addFriend(3, 5);
    graph.addFriend(4, 6);
    graph.addFriend(5, 6);
    graph.addFriend(5, 7);
    graph.addFriend(6, 8);
    graph.addFriend(7, 8);

    renderAll();
    showToast('Welcome to SocialGraph!', 'success');
}

// ============================================
// RENDERING
// ============================================

function renderAll() {
    renderCurrentUser();
    renderAccountDropdown();
    renderSidebar();
    renderStories();
    renderPostFeed();
    renderContacts();
    renderMiniGraph();
    renderShortcuts();
}

function renderCurrentUser() {
    const user = users.find(u => u.id === currentUserId);
    document.getElementById('currentUserAvatar').textContent = user.name[0];
    document.getElementById('currentUserName').textContent = user.name.split(' ')[0];
    document.getElementById('posterAvatar').textContent = user.name[0];
    document.getElementById('posterAvatar').style.background = user.color;
    document.getElementById('storyAvatar').textContent = user.name[0];
    document.getElementById('storyAvatar').style.background = user.color;
}

function renderAccountDropdown() {
    const container = document.getElementById('accountList');
    container.innerHTML = users.map(user => `
        <div class="fb-account-item" onclick="switchUser(${user.id})">
            <div class="fb-avatar-small" style="background: ${user.color}">${user.name[0]}</div>
            <span>${user.name}</span>
        </div>
    `).join('');
}

function renderSidebar() {
    // Sidebar is static in HTML
}

function renderShortcuts() {
    const container = document.getElementById('shortcutsList');
    const friends = graph.getFriends(currentUserId);
    const friendUsers = friends.map(id => users.find(u => u.id === id));
    
    container.innerHTML = friendUsers.map(user => `
        <div class="fb-shortcut-item" onclick="selectUser(${user.id})">
            <div class="fb-shortcut-avatar" style="background: ${user.color}">${user.emoji}</div>
            <span>${user.name}</span>
        </div>
    `).join('');
}

function renderStories() {
    const container = document.getElementById('storyCards');
    
    // Show friends' stories
    const friends = graph.getFriends(currentUserId);
    const friendUsers = friends.slice(0, 5).map(id => users.find(u => u.id === id));
    
    container.innerHTML = friendUsers.map(user => `
        <div class="fb-story" style="background: linear-gradient(135deg, ${user.color}, ${adjustColor(user.color, -30)})">
            <div class="fb-story-avatar">
                <div class="fb-avatar-small" style="background: white; color: ${user.color}">${user.name[0]}</div>
            </div>
            <span>${user.name.split(' ')[0]}</span>
        </div>
    `).join('');
}

function renderPostFeed() {
    const container = document.getElementById('postFeed');
    const friends = graph.getFriends(currentUserId);
    const friendUsers = [currentUserId, ...friends].map(id => users.find(u => u.id === id));
    
    container.innerHTML = friendUsers.map(user => {
        const friendCount = graph.getFriendCount(user.id);
        return `
            <div class="fb-post">
                <div class="fb-post-header">
                    <div class="fb-post-avatar" style="background: ${user.color}">${user.name[0]}</div>
                    <div class="fb-post-info">
                        <div class="fb-post-name">${user.name}</div>
                        <div class="fb-post-meta">${friendCount} friends · ${Math.floor(Math.random() * 24)}h</div>
                    </div>
                </div>
                <div class="fb-post-content">
                    ${getPostContent(user.id)}
                </div>
                <div class="fb-post-stats">
                    <span>👍 ${Math.floor(Math.random() * 50)}</span>
                    <span>💬 ${Math.floor(Math.random() * 20)} comments</span>
                </div>
                <div class="fb-post-actions">
                    <button class="fb-post-action like" onclick="likePost(${user.id})">👍 Like</button>
                    <button class="fb-post-action comment" onclick="commentPost(${user.id})">💬 Comment</button>
                    <button class="fb-post-action share" onclick="sharePost(${user.id})">↗️ Share</button>
                </div>
            </div>
        `;
    }).join('');
}

function getPostContent(userId) {
    const contents = [
        "Just had an amazing coffee with friends! ☕",
        "Learning about Graph Data Structures today. Trees and networks are fascinating! 🌳",
        "Who else loves algorithm challenges? Let's connect! 💻",
        "Mutual friends make the best friends. True story!",
        "Just discovered a great new way to visualize social networks!",
        "Happy to announce I've mastered Hash Maps! 🎉",
        "Looking for study partners for DSA. Anyone interested?",
        "Big thanks to all my friends for the support! ❤️"
    ];
    return contents[userId % contents.length];
}

function renderContacts() {
    const container = document.getElementById('contactsList');
    const allOtherUsers = users.filter(u => u.id !== currentUserId);
    
    container.innerHTML = allOtherUsers.map(user => {
        const isFriend = graph.areFriends(currentUserId, user.id);
        return `
            <div class="fb-contact-item" onclick="selectUser(${user.id})">
                <div class="fb-contact-avatar">
                    <div class="fb-avatar-small" style="background: ${user.color}">${user.name[0]}</div>
                    <div class="fb-online-dot"></div>
                </div>
                <span>${user.name}</span>
            </div>
        `;
    }).join('');
}

function renderMiniGraph() {
    const canvas = document.getElementById('miniGraphCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.parentElement.clientWidth - 24;
    canvas.height = 120;
    
    ctx.fillStyle = '#f0f2f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 20;
    
    const positions = {};
    const angleStep = (2 * Math.PI) / users.length;
    
    users.forEach((user, i) => {
        const angle = i * angleStep - Math.PI / 2;
        positions[user.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });
    
    // Draw edges
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    
    const drawnEdges = new Set();
    users.forEach(user => {
        const friends = graph.getFriends(user.id);
        friends.forEach(friendId => {
            const edgeKey = [Math.min(user.id, friendId), Math.max(user.id, friendId)].join('-');
            if (!drawnEdges.has(edgeKey)) {
                drawnEdges.add(edgeKey);
                const p1 = positions[user.id];
                const p2 = positions[friendId];
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        });
    });
    
    // Draw nodes
    users.forEach(user => {
        const pos = positions[user.id];
        const isCurrent = user.id === currentUserId;
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isCurrent ? 10 : 7, 0, 2 * Math.PI);
        ctx.fillStyle = user.color;
        ctx.fill();
        
        if (isCurrent) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
    
    // Update stats
    document.getElementById('miniUsers').textContent = users.length;
    document.getElementById('miniEdges').textContent = graph.getEdgeCount();
}

// ============================================
// USER ACTIONS
// ============================================

function switchUser(userId) {
    currentUserId = userId;
    toggleDropdown('currentUserDropdown');
    renderAll();
    showToast(`Switched to ${users.find(u => u.id === userId).name}`, 'success');
}

function selectUser(userId) {
    selectedUserId = userId;
    const user = users.find(u => u.id === userId);
    showFriendsModal(userId);
}

function selectUserById(userId) {
    // If it's the current user, show profile modal
    if (userId === currentUserId) {
        showProfileModal(userId);
    } else {
        // Otherwise show friends modal for that user
        showFriendsModal(userId);
    }
}

function showPanel(panel) {
    currentPanel = panel;
    
    // Update nav
    document.querySelectorAll('.fb-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (panel === 'home') {
        renderPostFeed();
    } else if (panel === 'friends') {
        showFriendsModal(currentUserId);
    } else if (panel === 'recommendations') {
        showRecommendationsModal();
    } else if (panel === 'graph') {
        showGraphModal();
    }
}

function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.classList.toggle('active');
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.fb-dropdown')) {
        document.querySelectorAll('.fb-dropdown.active').forEach(d => d.classList.remove('active'));
    }
});

// ============================================
// MODALS
// ============================================

function showGraphModal() {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 700;
    canvas.height = 450;
    
    // Background
    ctx.fillStyle = '#f0f2f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate positions
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 60;
    
    const positions = {};
    const angleStep = (2 * Math.PI) / users.length;
    
    users.forEach((user, i) => {
        const angle = i * angleStep - Math.PI / 2;
        positions[user.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });
    
    // Draw edges
    const drawnEdges = new Set();
    users.forEach(user => {
        const friends = graph.getFriends(user.id);
        friends.forEach(friendId => {
            const edgeKey = [Math.min(user.id, friendId), Math.max(user.id, friendId)].join('-');
            if (!drawnEdges.has(edgeKey)) {
                drawnEdges.add(edgeKey);
                const p1 = positions[user.id];
                const p2 = positions[friendId];
                
                // Create gradient
                const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                gradient.addColorStop(0, user.color + '60');
                gradient.addColorStop(1, users.find(u => u.id === friendId).color + '60');
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        });
    });
    
    // Draw nodes
    users.forEach(user => {
        const pos = positions[user.id];
        const isCurrent = user.id === currentUserId;
        const isFriend = graph.areFriends(currentUserId, user.id);
        
        // Node shadow
        ctx.shadowColor = user.color;
        ctx.shadowBlur = isCurrent ? 15 : 8;
        
        // Node circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isCurrent ? 28 : 22, 0, 2 * Math.PI);
        ctx.fillStyle = user.color;
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // Node border
        ctx.strokeStyle = isCurrent ? '#fff' : '#ccc';
        ctx.lineWidth = isCurrent ? 4 : 2;
        ctx.stroke();
        
        // User initial
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(user.name[0], pos.x, pos.y);
        
        // User name label
        ctx.fillStyle = '#050505';
        ctx.font = '11px Inter';
        ctx.fillText(user.name.split(' ')[0], pos.x, pos.y + 35);
    });
    
    // Update stats
    const userCount = users.length;
    const edgeCount = graph.getEdgeCount();
    const maxEdges = (userCount * (userCount - 1)) / 2;
    const density = ((edgeCount / maxEdges) * 100).toFixed(1);
    
    document.getElementById('graphUsersCount').textContent = userCount;
    document.getElementById('graphEdgesCount').textContent = edgeCount;
    document.getElementById('graphDensity').textContent = density + '%';
    
    document.getElementById('graphModal').classList.add('active');
}

function showProfileModal(userId) {
    const user = users.find(u => u.id === userId);
    const friends = graph.getFriends(userId);
    const friendCount = friends.length;
    
    // Calculate mutual friends with current user
    const mutualCount = userId === currentUserId ? 0 : recommender.getMutualFriends(currentUserId, userId).length;
    
    // Update profile header
    document.getElementById('profileAvatar').textContent = user.name[0];
    document.getElementById('profileAvatar').style.background = user.color;
    document.getElementById('profileNameText').textContent = user.name;
    document.getElementById('profileCover').style.background = `linear-gradient(135deg, ${user.color}, ${adjustColor(user.color, -40)})`;
    
    // Update stats
    document.getElementById('profileFriendsCount').textContent = friendCount;
    document.getElementById('profileMutualCount').textContent = mutualCount;
    
    // Render friends list
    const friendsList = document.getElementById('profileFriendsList');
    friendsList.innerHTML = friends.map(friendId => {
        const friend = users.find(u => u.id === friendId);
        return `
            <div class="fb-profile-friend-item" onclick="viewUserProfile(${friend.id})">
                <div class="fb-avatar-small" style="background: ${friend.color}">${friend.name[0]}</div>
                <span>${friend.name}</span>
            </div>
        `;
    }).join('') || '<div class="fb-empty">No friends yet</div>';
    
    document.getElementById('profileModal').classList.add('active');
}

function viewUserProfile(userId) {
    closeModal('friendsModal');
    showProfileModal(userId);
}

function showFriendsModal(userId) {
    const user = users.find(u => u.id === userId);
    const friends = graph.getFriends(userId);
    
    document.getElementById('friendsModalList').innerHTML = friends.map(friendId => {
        const friend = users.find(u => u.id === friendId);
        const mutual = recommender.getMutualFriends(userId, friendId);
        
        return `
            <div class="fb-friend-card">
                <div class="fb-friend-avatar" style="background: ${friend.color}">${friend.name[0]}</div>
                <div class="fb-friend-info">
                    <div class="fb-friend-name">${friend.name}</div>
                    <div class="fb-friend-mutual">${mutual.length} mutual friends</div>
                    <div class="fb-friend-actions">
                        <button class="fb-btn-confirm" onclick="viewProfile(${friend.id})">View Profile</button>
                        <button class="fb-btn-delete" onclick="removeFriendFromModal(${friend.id})">Unfriend</button>
                    </div>
                </div>
            </div>
        `;
    }).join('') || '<div class="fb-empty"><div class="fb-empty-icon">😔</div><p>No friends yet</p></div>';
    
    document.getElementById('friendsModal').classList.add('active');
}

function showRecommendationsModal() {
    const recommendations = recommender.getRecommendations(currentUserId, 10);
    
    document.getElementById('recommendationsModalList').innerHTML = recommendations.map(rec => {
        const user = users.find(u => u.id === rec.userId);
        
        return `
            <div class="fb-rec-card">
                <div class="fb-rec-avatar" style="background: ${user.color}">${user.name[0]}</div>
                <div class="fb-rec-info">
                    <div class="fb-rec-name">${user.name}</div>
                    <div class="fb-rec-mutual">${rec.mutualCount} mutual friends</div>
                    <div class="fb-rec-actions">
                        <button class="fb-btn-confirm" onclick="addFriendRec(${rec.userId})">Add Friend</button>
                        <button class="fb-btn-delete" onclick="closeModal('recommendationsModal')">Remove</button>
                    </div>
                </div>
            </div>
        `;
    }).join('') || '<div class="fb-empty"><div class="fb-empty-icon">🎉</div><p>No recommendations available</p></div>';
    
    document.getElementById('recommendationsModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
document.querySelectorAll('.fb-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// ============================================
// FRIEND OPERATIONS
// ============================================

function addFriendRec(friendId) {
    if (graph.areFriends(currentUserId, friendId)) {
        showToast('Already friends!', 'warning');
        return;
    }
    
    graph.addFriend(currentUserId, friendId);
    showToast(`Added ${users.find(u => u.id === friendId).name} as friend!`, 'success');
    renderAll();
    showRecommendationsModal();
}

function removeFriendFromModal(friendId) {
    graph.removeFriend(currentUserId, friendId);
    showToast(`Removed from friends`, 'success');
    renderAll();
    showFriendsModal(currentUserId);
}

function removeFriendAction(friendId) {
    graph.removeFriend(selectedUserId, friendId);
    showToast(`Removed from friends`, 'success');
    renderAll();
}

function addFriendAction(friendId) {
    graph.addFriend(currentUserId, friendId);
    showToast(`Added ${users.find(u => u.id === friendId).name} as friend!`, 'success');
    renderAll();
}

function viewProfile(userId) {
    closeModal('friendsModal');
    showProfileModal(userId);
}

// ============================================
// POST ACTIONS
// ============================================

function likePost(userId) {
    showToast('Liked! 👍', 'success');
}

function commentPost(userId) {
    const user = users.find(u => u.id === userId);
    showToast(`Comment on ${user.name}'s post`, 'success');
}

function sharePost(userId) {
    const user = users.find(u => u.id === userId);
    showToast(`Shared ${user.name}'s post`, 'success');
}

// ============================================
// SEARCH
// ============================================

document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (query.length < 2) return;
    
    const results = users.filter(u => 
        u.name.toLowerCase().includes(query) && u.id !== currentUserId
    );
    
    // Could show search dropdown here
    if (results.length > 0) {
        const user = results[0];
        // Highlight or show result
    }
});

// ============================================
// UTILITIES
// ============================================

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠'}</span>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

// Tab switching in friends modal
document.querySelectorAll('.fb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.fb-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const tabName = tab.dataset.tab;
        if (tabName === 'mutual') {
            // Show mutual friends
            showFriendsModal(currentUserId);
        } else {
            showFriendsModal(currentUserId);
        }
    });
});

// ============================================
// START
// ============================================

init();

