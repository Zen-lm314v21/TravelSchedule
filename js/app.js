/* ========================================
   旅行スケジュール管理 - メインアプリケーションファイル
   このファイルはアプリケーション全体の初期化、ナビゲーション、イベント処理を管理します。
   ======================================== */

import { loadData, saveData, exportToJson, importFromJson, updateGlobalNotes, getTrips, setCurrentTrip, createTrip, updateTrip, deleteTrip, getCurrentTrip } from './storage.js';
import { initSchedule } from './components/schedule.js';
import { initLocations } from './components/locations.js';
import { initExpenses } from './components/expenses.js';
import { initTasks } from './components/tasks.js';
import { initUsers } from './components/users.js';
import { closeModal, showModal } from './ui.js';

/* ========== DOMロード時の処理 ========== */
/* ページ読み込み後、アプリケーションを初期化 */
document.addEventListener('DOMContentLoaded', () => {
    // Check for file:// protocol
    if (window.location.protocol === 'file:') {
        alert('警告: ブラウザのセキュリティ設定により、ローカルファイルとして直接開くと正常に動作しません。VS CodeのLive Server拡張機能などを使用して開いてください。');
    }

    try {
        initApp();
    } catch (error) {
        console.error('アプリケーションの起動中にエラーが発生しました:', error);
        alert('アプリケーションの起動中にエラーが発生しました。コンソールを確認してください。');
    }
});

/* ========== アプリケーション初期化関数 ========== */
/* 全機能の初期化と初期状態の設定 */
function initApp() {
    setupTabs();
    setupEventListeners();
    setupTripControls();
    renderTripSelector();
    loadContent();
    
    // Initialize components
    initSchedule();
    initLocations();
    initExpenses();
    initTasks();
    initUsers();
}

/* ========== タブ切り替え処理 ========== */
/* ナビゲーション項目クリック時にタブを切り替え */
function setupTabs() {
    const navItems = document.querySelectorAll('.main-nav li');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');

            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update visible tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
}

/**
 * グローバルイベントリスナーの設定
 * エクスポート、インポート、モーダル関連のイベント処理
 */
function setupEventListeners() {
    // ========== エクスポートボタン ==========
    // JSONファイルとしてデータをダウンロード
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportToJson();
        });
    }

    // ========== インポートボタン ==========
    // JSONファイルからデータを読み込み
    const importBtn = document.getElementById('import-btn');
    const importInput = document.getElementById('import-input');
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => {
            importInput.click();
        });

        importInput.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                try {
                    await importFromJson(e.target.files[0]);
                    alert('データをインポートしました');
                    location.reload();
                } catch (err) {
                    alert('インポートに失敗しました: ' + err.message);
                }
            }
        });
    }

    // Global Notes storage
    const globalNotes = document.getElementById('global-notes');
    if (globalNotes) {
        globalNotes.addEventListener('blur', () => {
            updateGlobalNotes(globalNotes.value);
        });
    }

    // Modal close
    const modal = document.getElementById('modal');
    if (modal) {
        const closeBtn = modal.querySelector('.close-btn');
        const cancelBtn = modal.querySelector('#modal-cancel');

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
    }

    // データ変更時にグローバルメモと旅行セレクタを最新化
    window.addEventListener('dataChanged', () => {
        renderTripSelector();
        loadContent();
    });
}

/**
 * Load initial content
 */
function loadContent() {
    const data = loadData();
    const trip = getCurrentTrip(data);
    const globalNotes = document.getElementById('global-notes');
    if (globalNotes && trip) {
        globalNotes.value = trip.globalNotes || '';
    }
}

/* ========== 旅行切替・管理 ========== */
function setupTripControls() {
    const tripSelect = document.getElementById('trip-select');
    const addBtn = document.getElementById('trip-add-btn');
    const editBtn = document.getElementById('trip-edit-btn');
    const deleteBtn = document.getElementById('trip-delete-btn');

    if (tripSelect) {
        tripSelect.addEventListener('change', (e) => {
            setCurrentTrip(e.target.value);
        });
    }

    addBtn?.addEventListener('click', () => openTripModal('add'));
    editBtn?.addEventListener('click', () => openTripModal('edit'));
    deleteBtn?.addEventListener('click', () => {
        const data = loadData();
        const trip = getCurrentTrip(data);
        if (!trip) return;
        if (data.trips.length <= 1) {
            alert('少なくとも1つの旅行は必要です');
            return;
        }
        if (confirm(`「${trip.name}」を削除しますか？`)) {
            deleteTrip(trip.id);
        }
    });
}

function renderTripSelector() {
    const tripSelect = document.getElementById('trip-select');
    if (!tripSelect) return;
    const data = loadData();
    const trips = getTrips();
    const current = getCurrentTrip(data);

    tripSelect.innerHTML = trips.map(t => `<option value="${t.id}" ${current && current.id === t.id ? 'selected' : ''}>${t.name || '旅行'}</option>`).join('');
}

function openTripModal(mode = 'add') {
    const data = loadData();
    const trip = getCurrentTrip(data);
    const isEdit = mode === 'edit';
    if (isEdit && !trip) return;

    const title = isEdit ? '旅行情報を編集' : '旅行を追加';
    const bodyHtml = `
        <form id="trip-form">
            <div class="form-group">
                <label for="trip-name">旅行名 *</label>
                <input type="text" id="trip-name" value="${isEdit ? (trip.name || '') : ''}" required>
            </div>
            <div class="form-group-row" style="display:flex; gap:10px;">
                <div class="form-group" style="flex:1;">
                    <label for="trip-start">開始日</label>
                    <input type="date" id="trip-start" value="${isEdit ? (trip.startDate || '') : ''}">
                </div>
                <div class="form-group" style="flex:1;">
                    <label for="trip-end">終了日</label>
                    <input type="date" id="trip-end" value="${isEdit ? (trip.endDate || '') : ''}">
                </div>
            </div>
            <div class="form-group">
                <label for="trip-notes">メモ</label>
                <textarea id="trip-notes" rows="3">${isEdit ? (trip.notes || '') : ''}</textarea>
            </div>
        </form>
    `;

    showModal(title, bodyHtml, () => {
        const form = document.getElementById('trip-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }
        const name = document.getElementById('trip-name').value;
        const startDate = document.getElementById('trip-start').value;
        const endDate = document.getElementById('trip-end').value;
        const notes = document.getElementById('trip-notes').value;

        if (isEdit) {
            updateTrip(trip.id, { name, startDate, endDate, notes });
        } else {
            createTrip(name, startDate, endDate, notes);
        }
        return true;
    });
}
