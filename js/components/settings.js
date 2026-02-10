/* ========================================
   旅行スケジュール管理 - 設定管理コンポーネント
   UIテーマ、カテゴリーマスタ、データ管理機能を管理します。
   ======================================== */

import { loadData, saveData, getCurrentTrip } from '../storage.js';
import { showModal } from '../ui.js';

/**
 * initSettings()
 * 設定機能の初期化
 */
export function initSettings() {
    renderScheduleCategories();
    renderExpenseCategories();
    loadThemePreference();

    document.getElementById('add-schedule-category-btn').addEventListener('click', () => {
        showCategoryModal('schedule');
    });

    document.getElementById('add-expense-category-btn').addEventListener('click', () => {
        showCategoryModal('expense');
    });

    document.getElementById('theme-select').addEventListener('change', (e) => {
        setTheme(e.target.value);
    });

    document.getElementById('reset-data-btn').addEventListener('click', () => {
        if (confirm('本当に全データをリセットしてもよろしいですか？この操作は取り消せません。')) {
            if (confirm('確認：全データを削除します。よろしいですか？')) {
                localStorage.clear();
                alert('データをリセットしました。ページを再読み込みしてください。');
                location.reload();
            }
        }
    });

    window.addEventListener('dataChanged', () => {
        renderScheduleCategories();
        renderExpenseCategories();
    });
}

/**
 * renderScheduleCategories()
 * スケジュールカテゴリー一覧を描画
 */
function renderScheduleCategories() {
    const container = document.getElementById('schedule-categories');
    const data = loadData();
    const trip = getCurrentTrip(data);
    if (!trip || !trip.settings) {
        container.innerHTML = '<p class="empty-message">カテゴリーが設定されていません。</p>';
        return;
    }

    const categories = trip.settings.scheduleCategories || getDefaultScheduleCategories();
    let html = '';

    categories.forEach((cat, idx) => {
        html += `
            <div class="category-item" style="display: flex; gap: 10px; align-items: center; padding: 10px; background: #f5f5f5; border-radius: 4px; margin-bottom: 8px;">
                <div style="width: 20px; height: 20px; background: ${cat.color}; border-radius: 3px;"></div>
                <span style="flex: 1;">${cat.label}</span>
                <button class="btn-secondary" style="padding: 4px 8px; font-size: 12px;" onclick="window.editScheduleCategory(${idx})"><i class="fas fa-edit"></i></button>
                <button class="btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="window.deleteScheduleCategory(${idx})"><i class="fas fa-trash"></i></button>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * renderExpenseCategories()
 * 費用カテゴリー一覧を描画
 */
function renderExpenseCategories() {
    const container = document.getElementById('expense-categories');
    const data = loadData();
    const trip = getCurrentTrip(data);
    if (!trip || !trip.settings) {
        container.innerHTML = '<p class="empty-message">カテゴリーが設定されていません。</p>';
        return;
    }

    const categories = trip.settings.expenseCategories || getDefaultExpenseCategories();
    let html = '';

    categories.forEach((cat, idx) => {
        html += `
            <div class="category-item" style="display: flex; gap: 10px; align-items: center; padding: 10px; background: #f5f5f5; border-radius: 4px; margin-bottom: 8px;">
                <span style="flex: 1;">${cat.label}</span>
                <button class="btn-secondary" style="padding: 4px 8px; font-size: 12px;" onclick="window.editExpenseCategory(${idx})"><i class="fas fa-edit"></i></button>
                <button class="btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="window.deleteExpenseCategory(${idx})"><i class="fas fa-trash"></i></button>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * showCategoryModal()
 * カテゴリー追加・編集用モーダルを表示
 */
function showCategoryModal(type, categoryIndex = null) {
    const data = loadData();
    const trip = getCurrentTrip(data);
    if (!trip) return;

    const isSchedule = type === 'schedule';
    const categories = isSchedule 
        ? (trip.settings?.scheduleCategories || getDefaultScheduleCategories())
        : (trip.settings?.expenseCategories || getDefaultExpenseCategories());
    
    const category = categoryIndex !== null ? categories[categoryIndex] : null;
    const title = category ? `カテゴリーを編集 (${type === 'schedule' ? 'スケジュール' : '費用'})` : `カテゴリーを追加 (${type === 'schedule' ? 'スケジュール' : '費用'})`;

    const colorInput = isSchedule && category ? `<div class="form-group">
                <label for="cat-color">色</label>
                <input type="color" id="cat-color" value="${category.color}" required>
            </div>` : '';

    const bodyHtml = `
        <form id="category-form">
            <div class="form-group">
                <label for="cat-label">カテゴリー名 *</label>
                <input type="text" id="cat-label" value="${category ? category.label : ''}" placeholder="例：食事" required>
            </div>
            ${colorInput}
        </form>
    `;

    showModal(title, bodyHtml, () => {
        const label = document.getElementById('cat-label').value.trim();
        if (!label) {
            alert('カテゴリー名を入力してください。');
            return false;
        }

        if (!trip.settings) {
            trip.settings = {
                scheduleCategories: getDefaultScheduleCategories(),
                expenseCategories: getDefaultExpenseCategories()
            };
        }

        const newCategory = {
            value: label.toLowerCase().replace(/\s+/g, '-'),
            label: label
        };

        if (isSchedule) {
            const colorInput = document.getElementById('cat-color');
            if (colorInput) {
                newCategory.color = colorInput.value;
            } else {
                newCategory.color = '#3498db';
            }
            if (categoryIndex !== null) {
                trip.settings.scheduleCategories[categoryIndex] = newCategory;
            } else {
                trip.settings.scheduleCategories.push(newCategory);
            }
        } else {
            if (categoryIndex !== null) {
                trip.settings.expenseCategories[categoryIndex] = newCategory;
            } else {
                trip.settings.expenseCategories.push(newCategory);
            }
        }

        saveData(data);
        window.dispatchEvent(new Event('dataChanged'));
        return true;
    });
}

/**
 * getDefaultScheduleCategories()
 * デフォルトのスケジュールカテゴリーを返す
 */
function getDefaultScheduleCategories() {
    return [
        { value: 'unset', label: '未設定', color: '#bdc3c7' },
        { value: 'meal', label: '食事', color: '#e74c3c' },
        { value: 'transport', label: '移動', color: '#3498db' },
        { value: 'accommodation', label: '宿泊', color: '#9b59b6' },
        { value: 'activity', label: '体験/アクティビティ', color: '#f39c12' }
    ];
}

/**
 * getDefaultExpenseCategories()
 * デフォルトの費用カテゴリーを返す
 */
function getDefaultExpenseCategories() {
    return [
        { value: 'food', label: '食事' },
        { value: 'transport', label: '移動' },
        { value: 'accommodation', label: '宿泊' },
        { value: 'activity', label: '体験' },
        { value: 'other', label: 'その他' }
    ];
}

/**
 * setTheme()
 * テーマを変更
 */
function setTheme(theme) {
    localStorage.setItem('app_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === 'dark') {
        document.body.style.backgroundColor = '#1a1a1a';
        document.body.style.color = '#e0e0e0';
    } else {
        document.body.style.backgroundColor = '#ffffff';
        document.body.style.color = '#333333';
    }
}

/**
 * loadThemePreference()
 * 保存されたテーマ設定を読み込む
 */
function loadThemePreference() {
    const savedTheme = localStorage.getItem('app_theme') || 'light';
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.value = savedTheme;
    }
    setTheme(savedTheme);
}

// グローバル関数として公開
window.editScheduleCategory = (idx) => {
    showCategoryModal('schedule', idx);
};

window.deleteScheduleCategory = (idx) => {
    if (confirm('このカテゴリーを削除してもよろしいですか？')) {
        const data = loadData();
        const trip = getCurrentTrip(data);
        if (trip && trip.settings) {
            trip.settings.scheduleCategories.splice(idx, 1);
            saveData(data);
            window.dispatchEvent(new Event('dataChanged'));
        }
    }
};

window.editExpenseCategory = (idx) => {
    showCategoryModal('expense', idx);
};

window.deleteExpenseCategory = (idx) => {
    if (confirm('このカテゴリーを削除してもよろしいですか？')) {
        const data = loadData();
        const trip = getCurrentTrip(data);
        if (trip && trip.settings) {
            trip.settings.expenseCategories.splice(idx, 1);
            saveData(data);
            window.dispatchEvent(new Event('dataChanged'));
        }
    }
};
