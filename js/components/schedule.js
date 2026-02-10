/* ========================================
   旅行スケジュール管理 - スケジュール管理コンポーネント
   イベント登録・編集・削除・表示機能を管理します。
   ======================================== */

import { getSchedules, getDeletedSchedules, getDayHighlights, setDayHighlight, saveData, loadData, generateId, getLocations, getCurrentTrip } from '../storage.js';
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

    document.getElementById('show-deleted-btn').addEventListener('click', () => {
        window.showDeletedSchedules();
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
    let schedules = getSchedules();
    const dayHighlights = getDayHighlights();

    if (schedules.length === 0) {
        listContainer.innerHTML = '<p class="empty-message">スケジュールが登録されていません。</p>';
        return;
    }

    // 日本時刻で今日を計算
    const now = new Date();
    const jstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const today = jstDate.toISOString().split('T')[0];
    
    // 終了済みを判定し、ソート
    const isFinished = (item) => item.endDate && item.endDate < today;
    
    schedules = schedules.sort((a, b) => {
        // 上典6下典6右列の結果を下典6上典6に反転
        const aFinished = isFinished(a) ? 1 : 0;
        const bFinished = isFinished(b) ? 1 : 0;
        if (aFinished !== bFinished) return aFinished - bFinished;
        // 上典6下典6は日付でソート
        return (a.date || '').localeCompare(b.date || '');
    });

    // Group by date
    const grouped = schedules.reduce((acc, item) => {
        if (!acc[item.date]) acc[item.date] = [];
        acc[item.date].push(item);
        return acc;
    }, {});

    let html = '';
    const sortedDates = Object.keys(grouped).sort();

    sortedDates.forEach(date => {
        const highlight = dayHighlights[date] || '';
        html += `<div class="schedule-date-group">
            <div class="date-header-row">
                <h3 class="date-header">${formatDate(date)}</h3>
                <div class="date-main-event">
                    <input type="text" class="main-event-input" data-date="${date}" value="${highlight}" placeholder="">
                </div>
                <button class="btn-secondary add-date-btn" onclick="window.addScheduleForDate('${date}')"><i class="fas fa-plus"></i> この日に追加</button>
            </div>
            <div class="schedule-items">`;
        
        grouped[date].forEach(item => {
            html += `
                <div class="schedule-item" data-id="${item.id}" style="border-left: 5px solid ${getCategoryColor(item.category)}">
                    <div class="schedule-time">${formatTimeRange(item.startTime, item.endTime)}</div>
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

    // メインイベント入力の保存
    const inputs = listContainer.querySelectorAll('.main-event-input');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            const date = input.getAttribute('data-date');
            setDayHighlight(date, input.value);
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.blur();
            }
        });
    });
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
                    <div class="timeline-time">${formatTimeRange(item.startTime, item.endTime)}</div>
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
        '': '#bdc3c7',
        sightseeing: '#3498db',
        meal: '#e67e22',
        transport: '#95a5a6',
        accommodation: '#9b59b6',
        activity: '#2ecc71'
    };
    return colors[cat] || '#bdc3c7';
}

/**
 * formatTimeRange()
 * 時間の表示を整形（未定対応）
 */
function formatTimeRange(startTime, endTime) {
    const start = startTime || '';
    const end = endTime || '';
    if (!start && !end) return '未定';
    if (start && end) return `${start} - ${end}`;
    if (start) return start;
    return `〜${end}`;
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

    // 画像素材があれば表示
    const imageHtml = loc.image ? `<img src="${loc.image}" alt="${loc.name}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 4px; margin-bottom: 15px;">` : '';

    const bodyHtml = `
        <div class="location-detail">
            ${imageHtml}
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

    // 設定からカテゴリーを取得
    const scheduleCategories = trip.settings?.scheduleCategories || [
        { value: 'unset', label: '未設定', color: '#bdc3c7' },
        { value: 'meal', label: '食事', color: '#e74c3c' },
        { value: 'transport', label: '移動', color: '#3498db' },
        { value: 'accommodation', label: '宿泊', color: '#9b59b6' },
        { value: 'activity', label: '体験/アクティビティ', color: '#f39c12' }
    ];

    const categoryOptionsHtml = scheduleCategories.map(cat => 
        `<option value="${cat.value}" ${schedule?.category === cat.value ? 'selected' : ''}>${cat.label}</option>`
    ).join('');
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
                    <input type="time" id="sched-start" value="${schedule ? (schedule.startTime || '') : ''}" onchange="window.updateScheduleEndTime()">
                </div>
                <div class="form-group" style="flex: 1;">
                    <label for="sched-end">終了時間</label>
                    <input type="time" id="sched-end" value="${schedule ? (schedule.endTime || '') : ''}" onchange="window.setEndTimeModified()">
                </div>
            </div>
            <div class="form-group">
                <label for="sched-category">カテゴリー</label>
                <select id="sched-category">
                    ${categoryOptionsHtml}
                </select>
            </div>
            <div style="display: flex; gap: 20px; margin-bottom: 15px;">
                <div style="flex: 1;">
                    <div style="font-weight: bold; color: #2c3e50; margin-bottom: 8px; padding-top: 5px;">場所</div>
                    <input type="text" id="new-loc-name" placeholder="\u4f8b\uff1a东京タワー" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="form-group" style="flex: 1;">
                    <label for="sched-location">登録済みの場所から選択</label>
                    <select id="sched-location">
                        <option value="">(\u672a選抟)</option>
                        ${locations.map(l => `<option value="${l.id}" ${schedule?.location === l.id ? 'selected' : ''}>${l.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <button type="button" id="toggle-location-details" style="background-color: #f0f0f0; border: 1px solid #ddd; padding: 8px 12px; border-radius: 4px; cursor: pointer; color: #2c3e50; font-weight: bold; margin-bottom: 15px; width: 100%;">場所の詳細情報 ▼</button>
            <div id="location-details" style="display: none; transition: all 0.3s ease;">
                <div class="divider" style="margin: 15px 0; border-top: 1px solid #ddd;"></div>
                <div class="form-group">
                    <label for="new-loc-address">住所</label>
                    <input type="text" id="new-loc-address" placeholder="例：東京都港区芝公園4-2-8">
                </div>
                <div class="form-group">
                    <label for="new-loc-hours">営業時間</label>
                    <input type="text" id="new-loc-hours" placeholder="例：9:00 - 22:30">
                </div>
                <div class="form-group">
                    <label for="new-loc-website">関連リンク / ウェブサイト</label>
                    <input type="url" id="new-loc-website" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label for="new-loc-image">画像URL</label>
                    <input type="url" id="new-loc-image" placeholder="https://example.com/image.jpg">
                </div>
                <div class="form-group">
                    <label for="new-loc-notes">場所の備考</label>
                    <textarea id="new-loc-notes" rows="3"></textarea>
                </div>
            </div>
            <div class="form-group">
                <label for="sched-desc">スケジュールの備考</label>
                <textarea id="sched-desc" rows="3">${schedule ? schedule.description : ''}</textarea>
            </div>
        </form>
    `;

    // Reset the end time modified flag when modal opens
    window.resetScheduleTimeFlags();

    // 詳細情報トグルボタンのイベントハンドラ
    setTimeout(() => {
        const toggleBtn = document.getElementById('toggle-location-details');
        const detailsSection = document.getElementById('location-details');
        if (toggleBtn && detailsSection) {
            let isExpanded = false;
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                isExpanded = !isExpanded;
                if (isExpanded) {
                    detailsSection.style.display = 'block';
                    toggleBtn.textContent = '場所の詳細情報 ▲';
                } else {
                    detailsSection.style.display = 'none';
                    toggleBtn.textContent = '場所の詳細情報 ▼';
                }
            });
        }
    }, 0);

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
                businessHours: document.getElementById('new-loc-hours').value,
                website: document.getElementById('new-loc-website').value,
                image: document.getElementById('new-loc-image').value,
                notes: document.getElementById('new-loc-notes').value,
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
 * スケジュール削除
 * 1回目：非表示（soft delete）
 * 2回目：完全削除（hard delete）
 */
window.deleteSchedule = (id) => {
    const data = loadData();
    const trip = getCurrentTrip(data);
    if (!trip) return;
    
    const schedule = trip.schedules.find(s => s.id === id);
    if (!schedule) return;

    if (schedule.isDeleted) {
        // 既に削除済み→完全削除
        if (confirm('このスケジュールを完全に削除してもよろしいですか？\n（この操作は取り消せません）')) {
            trip.schedules = trip.schedules.filter(s => s.id !== id);
            saveData(data);
        }
    } else {
        // 未削除→非表示にする
        if (confirm('このスケジュールを削除してもよろしいですか？\n（削除済みスケジュールから復元できます）')) {
            schedule.isDeleted = true;
            schedule.deletedAt = new Date().toISOString();
            saveData(data);
        }
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
/**
 * window.showDeletedSchedules()
 * 削除済みスケジュール一覧をモーダルで表示
 */
window.showDeletedSchedules = () => {
    const deletedSchedules = getDeletedSchedules();

    if (deletedSchedules.length === 0) {
        showModal('削除済みスケジュール', '<p style="text-align: center; padding: 20px;">削除済みスケジュールはありません。</p>', null);
        return;
    }

    let bodyHtml = '<div class="deleted-schedules-container">';
    
    deletedSchedules.forEach(item => {
        bodyHtml += `
            <div class="deleted-schedule-item" style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 4px; background-color: #f9f9f9;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <div style="font-weight: bold;">${item.title}</div>
                        <div style="color: #666; font-size: 0.9em;">📅 ${item.date} ${formatTimeRange(item.startTime, item.endTime)}</div>
                        ${item.description ? `<div style="color: #666; font-size: 0.9em; margin-top: 5px;">${item.description}</div>` : ''}
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn-primary" style="padding: 5px 10px; font-size: 0.85rem;" onclick="window.restoreSchedule('${item.id}')">復元</button>
                        <button class="btn-primary" style="padding: 5px 10px; font-size: 0.85rem; background-color: #e74c3c;" onclick="window.deletePermanently('${item.id}')">完全削除</button>
                    </div>
                </div>
            </div>
        `;
    });

    bodyHtml += '</div>';
    showModal('削除済みスケジュール', bodyHtml, null);
};

/**
 * window.restoreSchedule()
 * 削除済みスケジュールを復元
 */
window.restoreSchedule = (id) => {
    const data = loadData();
    const trip = getCurrentTrip(data);
    if (!trip) return;
    
    const schedule = trip.schedules.find(s => s.id === id);
    if (!schedule) return;

    if (confirm('このスケジュールを復元してもよろしいですか？')) {
        schedule.isDeleted = false;
        delete schedule.deletedAt;
        saveData(data);
        
        // モーダルを閉じて再表示
        const modal = document.getElementById('modal');
        if (modal) modal.style.display = 'none';
        window.showDeletedSchedules();
    }
};

/**
 * window.deletePermanently()
 * 削除済みスケジュールを完全削除
 */
window.deletePermanently = (id) => {
    const data = loadData();
    const trip = getCurrentTrip(data);
    if (!trip) return;

    if (confirm('このスケジュールを完全に削除してもよろしいですか？\n（この操作は取り消せません）')) {
        trip.schedules = trip.schedules.filter(s => s.id !== id);
        saveData(data);
        
        // モーダルを再表示
        const modal = document.getElementById('modal');
        if (modal) modal.style.display = 'none';
        window.showDeletedSchedules();
    }
};