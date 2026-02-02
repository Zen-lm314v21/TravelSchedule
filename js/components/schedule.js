/* ========================================
   旅行スケジュール管理 - スケジュール管理コンポーネント
   イベント登録・編集・削除・表示機能を管理します。
   ======================================== */

import { getSchedules, saveData, loadData, generateId, getLocations, getCurrentTrip } from '../storage.js';
import { showModal } from '../ui.js';

/**
 * initSchedule()
 * スケジュール機能の初期化
 */
export function initSchedule() {
    renderAllSchedules();

    // View toggle buttons (list/timeline)
    setupScheduleViewToggle();

    document.getElementById('add-schedule-btn').addEventListener('click', () => {
        showScheduleModal();
    });

    window.addEventListener('dataChanged', () => {
        renderAllSchedules();
    });
}

// リストとタイムラインの両方を更新
function renderAllSchedules() {
    renderScheduleList();
    renderTimelineView();
}

// ビュー切替ボタンの設定
function setupScheduleViewToggle() {
    const listBtn = document.getElementById('view-list-btn');
    const timelineBtn = document.getElementById('view-timeline-btn');
    const listContainer = document.getElementById('schedule-list');
    const timelineContainer = document.getElementById('schedule-timeline');

    const switchView = (view) => {
        if (!listContainer || !timelineContainer) return;
        if (view === 'timeline') {
            listContainer.style.display = 'none';
            timelineContainer.style.display = 'block';
            timelineBtn?.classList.add('active');
            listBtn?.classList.remove('active');
        } else {
            listContainer.style.display = 'block';
            timelineContainer.style.display = 'none';
            listBtn?.classList.add('active');
            timelineBtn?.classList.remove('active');
        }
    };

    listBtn?.addEventListener('click', () => switchView('list'));
    timelineBtn?.addEventListener('click', () => switchView('timeline'));

    // デフォルトはリスト表示
    switchView('list');
}

/**
 * renderScheduleList()
 * スケジュール一覧をHTMLで描画
 * 日付ごとにグループ化して表示
 */
function renderScheduleList() {
    const listContainer = document.getElementById('schedule-list');
    const schedules = getSchedules();

    if (schedules.length === 0) {
        listContainer.innerHTML = '<p class="empty-message">スケジュールが登録されていません。</p>';
        return;
    }

    // Group by date
    const grouped = schedules.reduce((acc, item) => {
        if (!acc[item.date]) acc[item.date] = [];
        acc[item.date].push(item);
        return acc;
    }, {});

    let html = '';
    const sortedDates = Object.keys(grouped).sort();

    sortedDates.forEach(date => {
        html += `<div class="schedule-date-group">
            <div class="date-header-row">
                <h3 class="date-header">${formatDate(date)}</h3>
                <button class="btn-secondary add-date-btn" onclick="window.addScheduleForDate('${date}')"><i class="fas fa-plus"></i> この日に追加</button>
            </div>
            <div class="schedule-items">`;
        
        grouped[date].forEach(item => {
            html += `
                <div class="schedule-item" data-id="${item.id}" style="border-left: 5px solid ${getCategoryColor(item.category)}">
                    <div class="schedule-time">${item.startTime}${item.endTime ? ' - ' + item.endTime : ''}</div>
                    <div class="schedule-info">
                        <div class="schedule-title">${item.title}</div>
                        ${item.description ? `<div class="schedule-desc">${item.description}</div>` : ''}
                        ${item.location ? `<div class="schedule-loc"><button type="button" class="loc-inline" onclick="window.showLocationDetail('${item.location}')"><i class="fas fa-map-marker-alt"></i> ${getLocationName(item.location)}</button></div>` : ''}
                    </div>
                    <div class="schedule-actions">
                        <button class="edit-btn" onclick="window.editSchedule('${item.id}')"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" onclick="window.deleteSchedule('${item.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
    });

    listContainer.innerHTML = html;
}

// タイムライン表示を描画
function renderTimelineView() {
    const timelineContainer = document.getElementById('schedule-timeline');
    const schedules = getSchedules();

    if (!timelineContainer) return;

    if (schedules.length === 0) {
        timelineContainer.innerHTML = '<p class="empty-message">スケジュールが登録されていません。</p>';
        return;
    }

    // 日付ごとにグループ化
    const grouped = schedules.reduce((acc, item) => {
        if (!acc[item.date]) acc[item.date] = [];
        acc[item.date].push(item);
        return acc;
    }, {});

    let html = '';
    const sortedDates = Object.keys(grouped).sort();

    sortedDates.forEach(date => {
        html += `<div class="timeline-day">
            <div class="timeline-date-row">
                <div class="timeline-date">${formatDate(date)}</div>
                <button class="btn-secondary add-date-btn" onclick="window.addScheduleForDate('${date}')"><i class="fas fa-plus"></i> この日に追加</button>
            </div>
            <div class="timeline-items">`;

        grouped[date].forEach(item => {
            html += `
                <div class="timeline-item" style="border-left-color: ${getCategoryColor(item.category)}">
                    <div class="timeline-time">${item.startTime}${item.endTime ? ' - ' + item.endTime : ''}</div>
                    <div class="timeline-content">
                        <div class="timeline-title">${item.title}</div>
                        ${item.description ? `<div class="timeline-desc">${item.description}</div>` : ''}
                        ${item.location ? `<div class="timeline-loc"><button type="button" class="loc-inline" onclick="window.showLocationDetail('${item.location}')"><i class="fas fa-map-marker-alt"></i> ${getLocationName(item.location)}</button></div>` : ''}
                    </div>
                    <div class="timeline-actions">
                        <button class="edit-btn" onclick="window.editSchedule('${item.id}')"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" onclick="window.deleteSchedule('${item.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
    });

    timelineContainer.innerHTML = html;
}

/**
 * formatDate()
 * 日付文字列を「YYYY年M月D日 (曜日)」形式でフォーマット
 */
function formatDate(dateStr) {
    const d = new Date(dateStr);
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 (${days[d.getDay()]})`;
}

/**
 * getCategoryColor()
 * カテゴリーに対応するカラーコードを返す
 */
function getCategoryColor(cat) {
    const colors = {
        sightseeing: '#3498db',
        meal: '#e67e22',
        transport: '#95a5a6',
        accommodation: '#9b59b6',
        activity: '#2ecc71'
    };
    return colors[cat] || '#bdc3c7';
}

/**
 * getLocationName()
 * 場所IDから場所名を取得
 */
function getLocationName(locId) {
    const locations = getLocations();
    const loc = locations.find(l => l.id === locId);
    return loc ? loc.name : '不明な場所';
}

/**
 * showLocationDetail()
 * スケジュール一覧・タイムラインから場所の詳細を参照表示
 */
function showLocationDetail(locId) {
    const locations = getLocations();
    const loc = locations.find(l => l.id === locId);
    if (!loc) {
        alert('場所情報が見つかりませんでした');
        return;
    }

    const bodyHtml = `
        <div class="location-detail">
            <div class="loc-row"><strong>名称:</strong> ${loc.name || '未設定'}</div>
            <div class="loc-row"><strong>住所:</strong> ${loc.address || '未設定'}</div>
            <div class="loc-row"><strong>営業時間:</strong> ${loc.businessHours || '未設定'}</div>
            <div class="loc-row"><strong>Web:</strong> ${loc.website ? `<a href="${loc.website}" target="_blank" rel="noopener">${loc.website}</a>` : '未設定'}</div>
            <div class="loc-row"><strong>メモ:</strong> ${loc.notes || '未設定'}</div>
        </div>
    `;

    showModal('場所の詳細', bodyHtml, null);
}

/**
 * showScheduleModal()
 * スケジュール追加・編集用のモーダルを表示
 * @param {string|null} scheduleId 編集時はスケジュールID、新規追加時はnull
 */
export function showScheduleModal(scheduleId = null, defaultDate = null) {
    const data = loadData();
    const trip = getCurrentTrip(data);
    if (!trip) return;
    const schedule = scheduleId ? trip.schedules.find(s => s.id === scheduleId) : null;
    const locations = getLocations();
    const initialDate = schedule ? schedule.date : (defaultDate || new Date().toISOString().split('T')[0]);

    const title = schedule ? 'スケジュールを編集' : 'スケジュールを追加';
    const bodyHtml = `
        <form id="schedule-form">
            <div class="form-group">
                <label for="sched-title">タイトル *</label>
                <input type="text" id="sched-title" value="${schedule ? schedule.title : ''}" required>
            </div>
            <div class="form-group">
                <label for="sched-date">日付 *</label>
                <input type="date" id="sched-date" value="${initialDate}" required>
            </div>
            <div class="form-group-row" style="display: flex; gap: 10px;">
                <div class="form-group" style="flex: 1;">
                    <label for="sched-start">開始時間</label>
                    <input type="time" id="sched-start" value="${schedule ? schedule.startTime : '08:00'}" onchange="window.updateScheduleEndTime()">
                </div>
                <div class="form-group" style="flex: 1;">
                    <label for="sched-end">終了時間</label>
                    <input type="time" id="sched-end" value="${schedule ? schedule.endTime : '08:00'}" onchange="window.setEndTimeModified()">
                </div>
            </div>
            <div class="form-group">
                <label for="sched-category">カテゴリー</label>
                <select id="sched-category">
                    <option value="sightseeing" ${schedule?.category === 'sightseeing' ? 'selected' : ''}>観光</option>
                    <option value="meal" ${schedule?.category === 'meal' ? 'selected' : ''}>食事</option>
                    <option value="transport" ${schedule?.category === 'transport' ? 'selected' : ''}>移動</option>
                    <option value="accommodation" ${schedule?.category === 'accommodation' ? 'selected' : ''}>宿泊</option>
                    <option value="activity" ${schedule?.category === 'activity' ? 'selected' : ''}>体験/アクティビティ</option>
                </select>
            </div>
            <div class="form-group">
                <label for="sched-location">場所</label>
                <select id="sched-location">
                    <option value="">(未選択)</option>
                    ${locations.map(l => `<option value="${l.id}" ${schedule?.location === l.id ? 'selected' : ''}>${l.name}</option>`).join('')}
                </select>
            </div>
            <div class="divider" style="margin: 15px 0; border-top: 1px solid #ddd;"></div>
            <div class="form-group">
                <label style="font-weight: bold; color: #2c3e50;">新規場所を追加（オプション）</label>
            </div>
            <div class="form-group">
                <label for="new-loc-name">場所の名前</label>
                <input type="text" id="new-loc-name" placeholder="例：東京タワー">
            </div>
            <div class="form-group">
                <label for="new-loc-address">住所</label>
                <input type="text" id="new-loc-address" placeholder="例：東京都港区芝公園4-2-8">
            </div>
            <div class="form-group">
                <label for="sched-desc">メモ</label>
                <textarea id="sched-desc" rows="3">${schedule ? schedule.description : ''}</textarea>
            </div>
        </form>
    `;

    // Reset the end time modified flag when modal opens
    window.resetScheduleTimeFlags();

    showModal(title, bodyHtml, () => {
        /* ========== フォームバリデーション ========== */
        /* 必須項目が入力されているか確認 */
        const schedForm = document.getElementById('schedule-form');
        if (!schedForm.checkValidity()) {
            schedForm.reportValidity();
            return false;
        }

        const currentData = loadData();
        const currentTrip = getCurrentTrip(currentData);
        if (!currentTrip) return false;
        let locationId = document.getElementById('sched-location').value;

        /* ========== 新規場所の自動作成 ========== */
        /* スケジュール追加時に新規場所も登録できる */
        const newLocName = document.getElementById('new-loc-name').value;
        if (newLocName.trim()) {
            const newLocation = {
                id: generateId(),
                name: newLocName,
                address: document.getElementById('new-loc-address').value,
                businessHours: '',
                website: '',
                image: '',
                notes: '',
                createdAt: new Date().toISOString()
            };
            currentTrip.locations.push(newLocation);
            locationId = newLocation.id;
        }

        /* ========== スケジュールデータの構築 ========== */
        /* フォーム入力値からスケジュールオブジェクトを生成 */
        const newSchedule = {
            id: scheduleId || generateId(),
            title: document.getElementById('sched-title').value,
            date: document.getElementById('sched-date').value,
            startTime: document.getElementById('sched-start').value,
            endTime: document.getElementById('sched-end').value,
            category: document.getElementById('sched-category').value,
            location: locationId,
            description: document.getElementById('sched-desc').value,
            updatedAt: new Date().toISOString()
        };

        if (scheduleId) {
            const index = currentTrip.schedules.findIndex(s => s.id === scheduleId);
            currentTrip.schedules[index] = newSchedule;
        } else {
            currentTrip.schedules.push(newSchedule);
        }
        saveData(currentData);
        return true;
    });
}

/* ========== グローバル関数（クリックハンドラー） ========== */
/* HTMLのinline onClick属性から呼び出される */

/**
 * window.editSchedule()
 * スケジュール編集画面を表示
 */
window.editSchedule = (id) => {
    showScheduleModal(id);
};

/**
 * window.addScheduleForDate()
 * 指定した日付であらかじめ日付をセットして追加モーダルを開く
 */
window.addScheduleForDate = (date) => {
    showScheduleModal(null, date);
};

/**
 * window.deleteSchedule()
 * スケジュール削除確認後に削除実行
 */
window.deleteSchedule = (id) => {
    if (confirm('このスケジュールを削除してもよろしいですか？')) {
        const data = loadData();
        const trip = getCurrentTrip(data);
        if (!trip) return;
        trip.schedules = trip.schedules.filter(s => s.id !== id);
        saveData(data);
    }
};

/**
 * window.updateScheduleEndTime()
 * 開始時刻変更時に終了時刻を自動更新（ユーザーが未手動変更の場合のみ）
 */
window.updateScheduleEndTime = () => {
    const startTimeInput = document.getElementById('sched-start');
    const endTimeInput = document.getElementById('sched-end');
    // Only sync if user hasn't manually changed the end time
    /* 終了時刻をユーザーが手動で変更していない場合のみ同期 */
    if (startTimeInput && endTimeInput && startTimeInput.value && !window.scheduleEndTimeModified) {
        endTimeInput.value = startTimeInput.value;
    }
};

/**
 * window.setEndTimeModified()
 * ユーザーが終了時刻を手動で変更したことをマーク
 */
window.setEndTimeModified = () => {
    window.scheduleEndTimeModified = true;
};

/**
 * window.resetScheduleTimeFlags()
 * モーダル表示時に終了時刻フラグをリセット
 */
window.resetScheduleTimeFlags = () => {
    window.scheduleEndTimeModified = false;
};

/**
 * window.showLocationDetail()
 * 場所詳細をモーダルで表示
 */
window.showLocationDetail = (id) => {
    showLocationDetail(id);
};
