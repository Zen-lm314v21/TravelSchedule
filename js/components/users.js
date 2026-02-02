/* ========================================
   旅行スケジュール管理 - ユーザー管理コンポーネント
   旅行参加メンバーの登録・編集・削除機能を管理します。
   ======================================== */

import { getUsers, saveData, loadData, generateId, getCurrentTrip } from '../storage.js';
import { showModal } from '../ui.js';

/**
 * initUsers()
 * ユーザー管理機能の初期化
 */
export function initUsers() {
    renderUserList();

    document.getElementById('add-user-btn').addEventListener('click', () => {
        showUserModal();
    });

    window.addEventListener('dataChanged', () => {
        renderUserList();
    });
}

/**
 * renderUserList()
 * ユーザー一覧をチップ形式で描画
 */
function renderUserList() {
    const userContainer = document.getElementById('user-list');
    const users = getUsers();

    let html = '';
    users.forEach(user => {
        html += `
            <div class="user-chip" onclick="window.editUser('${user.id}')">
                <span class="user-color" style="background-color: ${user.color}"></span>
                <span class="user-name">${user.name}</span>
            </div>
        `;
    });

    userContainer.innerHTML = html;
}

/**
 * showUserModal()
 * ユーザー追加・編集用のモーダルを表示
 */
function showUserModal(userId = null) {
    const data = loadData();
    const trip = getCurrentTrip(data);
    if (!trip) return;
    const user = userId ? trip.users.find(u => u.id === userId) : null;

    const title = user ? 'メンバーを編集' : 'メンバーを追加';
    const bodyHtml = `
        <form id="user-form">
            <div class="form-group">
                <label for="user-name">名前 *</label>
                <input type="text" id="user-name" value="${user ? user.name : ''}" required>
            </div>
            <div class="form-group">
                <label for="user-color">カラー</label>
                <input type="color" id="user-color" value="${user ? user.color : '#3498db'}">
            </div>
            ${user && userId !== 'u1' ? `<button type="button" class="btn-danger" id="delete-user-btn" style="margin-top: 10px;">メンバーを削除</button>` : ''}
        </form>
    `;

    showModal(title, bodyHtml, () => {
        const form = document.getElementById('user-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        const newUser = {
            id: userId || generateId(),
            name: document.getElementById('user-name').value,
            color: document.getElementById('user-color').value,
            joinedAt: user ? user.joinedAt : new Date().toISOString()
        };

        const currentData = loadData();
        const currentTrip = getCurrentTrip(currentData);
        if (!currentTrip) return false;
        if (userId) {
            const index = currentTrip.users.findIndex(u => u.id === userId);
            currentTrip.users[index] = newUser;
        } else {
            currentTrip.users.push(newUser);
        }
        saveData(currentData);
        return true;
    });

    // Delete button logic
    const delBtn = document.getElementById('delete-user-btn');
    if (delBtn) {
        delBtn.addEventListener('click', () => {
            if (confirm('このメンバーを削除してもよろしいですか？（このメンバーが支払った費用などは削除されませんが、表示が不明になります）')) {
                const currentData = loadData();
                const currentTrip = getCurrentTrip(currentData);
                if (!currentTrip) return;
                currentTrip.users = currentTrip.users.filter(u => u.id !== userId);
                saveData(currentData);
                document.getElementById('modal').style.display = 'none';
            }
        });
    }
}

window.editUser = (id) => {
    showUserModal(id);
};
