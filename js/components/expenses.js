/* ========================================
   旅行スケジュール管理 - 予算・費用管理コンポーネント
   旅行中の費用記録・割り勘計算機能を管理します。
   ======================================== */

import { getExpenses, saveData, loadData, generateId, getUsers, getCurrentTrip } from '../storage.js';
import { showModal } from '../ui.js';

/**
 * initExpenses()
 * 費用管理機能の初期化
 */
export function initExpenses() {
    renderExpenseList();

    document.getElementById('add-expense-btn').addEventListener('click', () => {
        showExpenseModal();
    });

    window.addEventListener('dataChanged', () => {
        renderExpenseList();
    });
}

/**
 * renderExpenseList()
 * 費用一覧をリスト形式で描画し、合計金額と割り勘目安を表示
 */
function renderExpenseList() {
    const listContainer = document.getElementById('expense-list');
    const totalAmountSpan = document.getElementById('total-amount');
    const expenses = getExpenses();
    const users = getUsers();

    if (expenses.length === 0) {
        listContainer.innerHTML = '<p class="empty-message">費用が登録されていません。</p>';
        totalAmountSpan.textContent = '¥0';
        return;
    }

    let total = 0;
    let html = '';

    expenses.sort((a, b) => b.date.localeCompare(a.date)).forEach(exp => {
        total += exp.amount;
        const payer = users.find(u => u.id === exp.paidBy);
        
        html += `
            <div class="expense-item" data-id="${exp.id}">
                <div class="expense-main">
                    <div class="expense-title">${exp.title}</div>
                    <div class="expense-meta">
                        <span class="expense-date">${exp.date}</span>
                        <span class="expense-cat">${getExpenseCategoryLabel(exp.category)}</span>
                    </div>
                </div>
                <div class="expense-details">
                    <div class="expense-amount">¥${exp.amount.toLocaleString()}</div>
                    <div class="expense-payer">支払者: ${payer ? payer.name : '不明'}</div>
                </div>
                <div class="expense-actions">
                    <button class="edit-btn" onclick="window.editExpense('${exp.id}')"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="window.deleteExpense('${exp.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });

    listContainer.innerHTML = html;
    totalAmountSpan.textContent = `¥${total.toLocaleString()}`;
    
    // Add Settlement Summary
    renderSettlement();
}

/**
 * getExpenseCategoryLabel()
 * 費用カテゴリーコードを日本語ラベルに変換
 */
function getExpenseCategoryLabel(cat) {
    const labels = {
        food: '食事',
        transport: '移動',
        accommodation: '宿泊',
        activity: '体験',
        other: 'その他'
    };
    return labels[cat] || 'その他';
}

/**
 * renderSettlement()
 * 割り勘計算を行い、各メンバーの支払残高を表示
 */
function renderSettlement() {
    const expenses = getExpenses();
    const users = getUsers();
    if (users.length <= 1) return;

    const summaryContainer = document.querySelector('.expense-summary');
    let settlementHtml = '<div class="settlement-card"><h4>割り勘目安</h4><ul>';
    
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const perPerson = Math.floor(total / users.length);

    settlementHtml += `<li>1人あたり: ¥${perPerson.toLocaleString()}</li>`;
    
    // Simple balance calculation
    const balances = {};
    users.forEach(u => balances[u.id] = 0);
    
    expenses.forEach(exp => {
        balances[exp.paidBy] += exp.amount;
    });

    users.forEach(u => {
        const diff = balances[u.id] - perPerson;
        const statusClass = diff >= 0 ? 'plus' : 'minus';
        settlementHtml += `<li>${u.name}: <span class="${statusClass}">${diff >= 0 ? '+' : ''}¥${diff.toLocaleString()}</span></li>`;
    });

    settlementHtml += '</ul></div>';
    
    // Update or append settlement card
    const existing = summaryContainer.querySelector('.settlement-card');
    if (existing) existing.remove();
    summaryContainer.insertAdjacentHTML('beforeend', settlementHtml);
}

/**
 * showExpenseModal()
 * 費用追加・編集用のモーダルを表示
 */
function showExpenseModal(expenseId = null) {
    const data = loadData();
    const trip = getCurrentTrip(data);
    if (!trip) return;
    const exp = expenseId ? trip.expenses.find(e => e.id === expenseId) : null;
    const users = getUsers();

    const title = exp ? '費用を編集' : '費用を追加';
    const bodyHtml = `
        <form id="expense-form">
            <div class="form-group">
                <label for="exp-title">項目名 *</label>
                <input type="text" id="exp-title" value="${exp ? exp.title : ''}" placeholder="例：ランチ代" required>
            </div>
            <div class="form-group">
                <label for="exp-amount">金額 (¥) *</label>
                <input type="number" id="exp-amount" value="${exp ? exp.amount : ''}" required>
            </div>
            <div class="form-group">
                <label for="exp-date">日付 *</label>
                <input type="date" id="exp-date" value="${exp ? exp.date : new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label for="exp-payer">支払者</label>
                <select id="exp-payer">
                    ${users.map(u => `<option value="${u.id}" ${exp?.paidBy === u.id ? 'selected' : ''}>${u.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="exp-category">カテゴリー</label>
                <select id="exp-category">
                    <option value="food" ${exp?.category === 'food' ? 'selected' : ''}>食事</option>
                    <option value="transport" ${exp?.category === 'transport' ? 'selected' : ''}>移動</option>
                    <option value="accommodation" ${exp?.category === 'accommodation' ? 'selected' : ''}>宿泊</option>
                    <option value="activity" ${exp?.category === 'activity' ? 'selected' : ''}>体験/アクティビティ</option>
                    <option value="other" ${exp?.category === 'other' ? 'selected' : ''}>その他</option>
                </select>
            </div>
            <div class="form-group">
                <label for="exp-notes">メモ</label>
                <textarea id="exp-notes" rows="2">${exp ? exp.notes : ''}</textarea>
            </div>
        </form>
    `;

    showModal(title, bodyHtml, () => {
        const form = document.getElementById('expense-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        const newExp = {
            id: expenseId || generateId(),
            title: document.getElementById('exp-title').value,
            amount: parseInt(document.getElementById('exp-amount').value, 10),
            date: document.getElementById('exp-date').value,
            paidBy: document.getElementById('exp-payer').value,
            category: document.getElementById('exp-category').value,
            notes: document.getElementById('exp-notes').value,
            updatedAt: new Date().toISOString()
        };

        const currentData = loadData();
        const currentTrip = getCurrentTrip(currentData);
        if (!currentTrip) return false;
        if (expenseId) {
            const index = currentTrip.expenses.findIndex(e => e.id === expenseId);
            currentTrip.expenses[index] = newExp;
        } else {
            currentTrip.expenses.push(newExp);
        }
        saveData(currentData);
        return true;
    });
}

window.editExpense = (id) => {
    showExpenseModal(id);
};

window.deleteExpense = (id) => {
    if (confirm('この費用を削除してもよろしいですか？')) {
        const data = loadData();
        const trip = getCurrentTrip(data);
        if (!trip) return;
        trip.expenses = trip.expenses.filter(e => e.id !== id);
        saveData(data);
    }
};
