/* ========================================
   旅行スケジュール管理 - データストレージ管理
   localStorageを使用したデータの保存・読み込み・入出力を管理します。
   ======================================== */

/* ========== ストレージキー定義 ========== */
/* localStorageに保存する時のキー名 */
const STORAGE_KEY = 'travel_app_data';

/* ========== 初期データ構造 ========== */
/* 複数旅行を管理するため、trips配列を持つ構造に拡張 */
const INITIAL_TRIP_ID = 'trip-default';

const INITIAL_DATA = {
    trips: [
        {
            id: INITIAL_TRIP_ID,
            name: 'メイン旅行',
            startDate: '',
            endDate: '',
            notes: '',
            schedules: [],
            locations: [],
            expenses: [],
            tasks: [],
            users: [
                { id: 'u1', name: '自分', color: '#3498db' }
            ],
            globalNotes: '',
            updatedAt: new Date().toISOString()
        }
    ],
    currentTripId: INITIAL_TRIP_ID,
    updatedAt: new Date().toISOString()
};

/**
 * loadData()
 * localStorageからすべてのデータを読み込む
 * @returns {Object} 旅行データオブジェクト
 */
export function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        saveData(INITIAL_DATA);
        return INITIAL_DATA;
    }

    const parsed = JSON.parse(data);

    // 既存の単一旅行構造を複数旅行構造へ移行
    if (!parsed.trips) {
        const migratedTripId = parsed.id || INITIAL_TRIP_ID;
        const migratedTrip = {
            id: migratedTripId,
            name: parsed.name || 'メイン旅行',
            startDate: parsed.startDate || '',
            endDate: parsed.endDate || '',
            notes: parsed.notes || '',
            schedules: parsed.schedules || [],
            locations: parsed.locations || [],
            expenses: parsed.expenses || [],
            tasks: parsed.tasks || [],
            users: parsed.users || [{ id: 'u1', name: '自分', color: '#3498db' }],
            globalNotes: parsed.globalNotes || '',
            updatedAt: parsed.updatedAt || new Date().toISOString()
        };

        const migratedData = {
            trips: [migratedTrip],
            currentTripId: migratedTripId,
            updatedAt: parsed.updatedAt || new Date().toISOString()
        };
        saveData(migratedData);
        return migratedData;
    }

    // currentTripIdが存在しない場合は先頭を選択
    if (!parsed.currentTripId && parsed.trips.length > 0) {
        parsed.currentTripId = parsed.trips[0].id;
        saveData(parsed);
    }

    return parsed;
}

/**
 * saveData()
 * すべてのデータをlocalStorageに保存し、dataChangedイベントを発火
 * @param {Object} data 保存する旅行データ
 */
export function saveData(data) {
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // Dispatch a custom event to notify other components that data has changed
    window.dispatchEvent(new CustomEvent('dataChanged', { detail: data }));
}

/**
 * generateId()
 * データベースの各レコード用にユニークなIDを生成
 * @returns {string} ユニークID
 */
export function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// 空の旅行データを生成（新規旅行作成用）
export function createEmptyTrip(name = '新しい旅行') {
    return {
        id: generateId(),
        name,
        startDate: '',
        endDate: '',
        notes: '',
        schedules: [],
        locations: [],
        expenses: [],
        tasks: [],
        users: [
            { id: 'u1', name: '自分', color: '#3498db' }
        ],
        globalNotes: '',
        updatedAt: new Date().toISOString()
    };
}

/**
 * exportToJson()
 * 現在のデータをJSONファイルとしてダウンロード
 */
export function exportToJson() {
    const data = loadData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel_schedule_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * importFromJson()
 * JSONファイルからデータを読み込み、localStorageに保存
 * @param {File} file ユーザーが選択したJSONファイル
 * @returns {Promise<Object>} インポートされたデータ
 */
export function importFromJson(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                saveData(data);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
        reader.readAsText(file);
    });
}

/* ========== ヘルパー関数 ========== */
/* 各データタイプの取得・更新用便利関数 */

/**
 * getSchedules()
 * スケジュール一覧を日時でソートして取得
 */
export function getSchedules() {
    const trip = getCurrentTrip();
    const schedules = trip ? trip.schedules : [];
    return [...schedules].sort((a, b) => {
        const dateCompare = (a.date || '').localeCompare(b.date || '');
        if (dateCompare !== 0) return dateCompare;
        return (a.startTime || '').localeCompare(b.startTime || '');
    });
}

/**
 * getLocations() - 場所一覧を取得
 * getExpenses() - 費用一覧を取得
 * getTasks() - タスク一覧を取得
 * getUsers() - ユーザー一覧を取得
 * getGlobalNotes() - グローバルメモを取得
 * updateGlobalNotes() - グローバルメモを更新
 */
export function getLocations() {
    const trip = getCurrentTrip();
    return trip ? trip.locations : [];
}

export function getExpenses() {
    const trip = getCurrentTrip();
    return trip ? trip.expenses : [];
}

export function getTasks() {
    const trip = getCurrentTrip();
    return trip ? trip.tasks : [];
}

export function getUsers() {
    const trip = getCurrentTrip();
    return trip ? trip.users : [];
}

export function getGlobalNotes() {
    const trip = getCurrentTrip();
    return trip ? trip.globalNotes : '';
}

export function updateGlobalNotes(notes) {
    const data = loadData();
    const trip = getCurrentTrip(data);
    if (!trip) return;
    trip.globalNotes = notes;
    saveData(data);
}

/* ========== 旅行単位のヘルパー ========== */

export function getCurrentTrip(data) {
    const d = data || loadData();
    if (!d.trips || d.trips.length === 0) return null;
    const target = d.trips.find(t => t.id === d.currentTripId) || d.trips[0];
    // currentTripIdが無効な場合は先頭を設定し直す
    if (!d.currentTripId || !d.trips.find(t => t.id === d.currentTripId)) {
        d.currentTripId = target.id;
        saveData(d);
    }
    return target;
}

export function getTrips() {
    const data = loadData();
    return data.trips || [];
}

export function setCurrentTrip(tripId) {
    const data = loadData();
    if (!data.trips || data.trips.length === 0) return;
    const exists = data.trips.find(t => t.id === tripId);
    if (!exists) return;
    data.currentTripId = tripId;
    saveData(data);
}

export function createTrip(name, startDate = '', endDate = '', notes = '') {
    const data = loadData();
    const newTrip = createEmptyTrip(name || '新しい旅行');
    newTrip.startDate = startDate;
    newTrip.endDate = endDate;
    newTrip.notes = notes;
    data.trips = data.trips || [];
    data.trips.push(newTrip);
    data.currentTripId = newTrip.id;
    saveData(data);
    return newTrip;
}

export function updateTrip(tripId, payload) {
    const data = loadData();
    const trip = getCurrentTrip(data);
    const target = data.trips.find(t => t.id === tripId);
    if (!target) return null;
    Object.assign(target, payload, { updatedAt: new Date().toISOString() });
    // currentTripを編集した場合、currentTripIdは維持
    saveData(data);
    return target;
}

export function deleteTrip(tripId) {
    const data = loadData();
    if (!data.trips || data.trips.length <= 1) {
        alert('少なくとも1つの旅行は必要です');
        return false;
    }
    data.trips = data.trips.filter(t => t.id !== tripId);
    if (data.currentTripId === tripId) {
        data.currentTripId = data.trips[0].id;
    }
    saveData(data);
    return true;
}
