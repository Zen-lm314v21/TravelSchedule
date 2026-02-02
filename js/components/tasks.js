/* ========================================
   旅行スケジュール管理 - タスク管理コンポーネント
   準備物チェック・やることリスト機能を管理します。
   ======================================== */

import { getTasks, saveData, loadData, generateId, getUsers, getCurrentTrip } from '../storage.js';
import { showModal } from '../ui.js';

/**
 * initTasks()
 * タスク管理機能の初期化
 */
export function initTasks() {
    renderTaskList();

    document.getElementById('add-task-btn').addEventListener('click', () => {
        showTaskModal();
    });

    window.addEventListener('dataChanged', () => {
        renderTaskList();
    });
}

/**
 * renderTaskList()
 * タスク一覧をチェックボックス付きで描画
 * 未完了のものを優先順に表示
 */
function renderTaskList() {
    const listContainer = document.getElementById('task-list');
    const tasks = getTasks();
    const users = getUsers();

    if (tasks.length === 0) {
        listContainer.innerHTML = '<p class="empty-message">タスクが登録されていません。</p>';
        return;
    }

    let html = '';
    // Sort logic: incomplete first, then priority, then date
    const sortedTasks = tasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const priorities = { high: 0, medium: 1, low: 2 };
        if (a.priority !== b.priority) return priorities[a.priority] - priorities[b.priority];
        return a.dueDate.localeCompare(b.dueDate);
    });

    sortedTasks.forEach(task => {
        const assigned = users.find(u => u.id === task.assignedTo);
        const priorityLabel = task.priority === 'high' ? '高' : (task.priority === 'medium' ? '中' : '低');
        
        html += `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-check">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="window.toggleTask('${task.id}')">
                </div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        ${task.dueDate ? `<span class="task-date"><i class="far fa-calendar"></i> ${task.dueDate}</span>` : ''}
                        <span class="task-priority priority-${task.priority}">${priorityLabel}</span>
                        ${assigned ? `<span class="task-assigned"><i class="far fa-user"></i> ${assigned.name}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" onclick="window.editTask('${task.id}')"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="window.deleteTask('${task.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });

    listContainer.innerHTML = html;
}

/**
 * showTaskModal()
 * タスク追加・編集用のモーダルを表示
 */
function showTaskModal(taskId = null) {
    const data = loadData();
    const trip = getCurrentTrip(data);
    if (!trip) return;
    const task = taskId ? trip.tasks.find(t => t.id === taskId) : null;
    const users = getUsers();

    const title = task ? 'タスクを編集' : 'タスクを追加';
    const bodyHtml = `
        <form id="task-form">
            <div class="form-group">
                <label for="task-title">タスク名 *</label>
                <input type="text" id="task-title" value="${task ? task.title : ''}" placeholder="例：チケット予約" required>
            </div>
            <div class="form-group">
                <label for="task-due">期限</label>
                <input type="date" id="task-due" value="${task ? (task.dueDate || '') : ''}">
            </div>
            <div class="form-group">
                <label for="task-priority">優先度</label>
                <select id="task-priority">
                    <option value="high" ${task?.priority === 'high' ? 'selected' : ''}>高</option>
                    <option value="medium" ${task?.priority === 'medium' || !task ? 'selected' : ''}>中</option>
                    <option value="low" ${task?.priority === 'low' ? 'selected' : ''}>低</option>
                </select>
            </div>
            <div class="form-group">
                <label for="task-assign">担当者</label>
                <select id="task-assign">
                    <option value="">(未設定)</option>
                    ${users.map(u => `<option value="${u.id}" ${task?.assignedTo === u.id ? 'selected' : ''}>${u.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="task-notes">説明/メモ</label>
                <textarea id="task-notes" rows="2">${task ? (task.description || '') : ''}</textarea>
            </div>
        </form>
    `;

    showModal(title, bodyHtml, () => {
        const form = document.getElementById('task-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        const newTask = {
            id: taskId || generateId(),
            title: document.getElementById('task-title').value,
            dueDate: document.getElementById('task-due').value,
            priority: document.getElementById('task-priority').value,
            assignedTo: document.getElementById('task-assign').value,
            description: document.getElementById('task-notes').value,
            completed: task ? task.completed : false,
            updatedAt: new Date().toISOString()
        };

        const currentData = loadData();
        const currentTrip = getCurrentTrip(currentData);
        if (!currentTrip) return false;
        if (taskId) {
            const index = currentTrip.tasks.findIndex(t => t.id === taskId);
            currentTrip.tasks[index] = newTask;
        } else {
            currentTrip.tasks.push(newTask);
        }
        saveData(currentData);
        return true;
    });
}

/**
 * グローバル関数（クリックハンドラー）
 * window.toggleTask() / window.editTask() / window.deleteTask()
 */
window.toggleTask = (id) => {
    const data = loadData();
    const trip = getCurrentTrip(data);
    if (!trip) return;
    const task = trip.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveData(data);
    }
};

window.editTask = (id) => {
    showTaskModal(id);
};

window.deleteTask = (id) => {
    if (confirm('このタスクを削除してもよろしいですか？')) {
        const data = loadData();
        const trip = getCurrentTrip(data);
        if (!trip) return;
        trip.tasks = trip.tasks.filter(t => t.id !== id);
        saveData(data);
    }
};
