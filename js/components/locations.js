/* ========================================
   旅行スケジュール管理 - 場所情報管理コンポーネント
   訪問地の登録・編集・削除・表示機能を管理します。
   ======================================== */

import { getLocations, saveData, loadData, generateId, getCurrentTrip } from '../storage.js';
import { showModal } from '../ui.js';

/**
 * initLocations()
 * 場所情報機能の初期化
 */
export function initLocations() {
    renderLocationList();

    document.getElementById('add-location-btn').addEventListener('click', () => {
        showLocationModal();
    });

    window.addEventListener('dataChanged', () => {
        renderLocationList();
    });
}

/**
 * renderLocationList()
 * 場所情報をカード形式で描画
 */
function renderLocationList() {
    const listContainer = document.getElementById('location-list');
    const locations = getLocations();

    if (locations.length === 0) {
        listContainer.innerHTML = '<p class="empty-message">場所情報が登録されていません。</p>';
        return;
    }

    let html = '';
    locations.forEach(loc => {
        html += `
            <div class="location-card" data-id="${loc.id}">
                ${loc.image ? `<img src="${loc.image}" alt="${loc.name}" class="location-img">` : '<div class="location-img-placeholder"><i class="fas fa-map-marked-alt"></i></div>'}
                <div class="location-body">
                    <h3 class="location-name">${loc.name}</h3>
                    ${loc.address ? `<p class="location-address"><i class="fas fa-map-pin"></i> ${loc.address}</p>` : ''}
                    ${loc.businessHours ? `<p class="location-hours"><i class="fas fa-clock"></i> ${loc.businessHours}</p>` : ''}
                    <div class="location-links">
                        ${loc.website ? `<a href="${loc.website}" target="_blank" class="loc-link"><i class="fas fa-external-link-alt"></i> サイト</a>` : ''}
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.name + (loc.address ? ' ' + loc.address : ''))}" target="_blank" class="loc-link map-link"><i class="fas fa-map"></i> 地図</a>
                    </div>
                </div>
                <div class="location-actions">
                    <button class="edit-btn" onclick="window.editLocation('${loc.id}')"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="window.deleteLocation('${loc.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });

    listContainer.innerHTML = html;
}

/**
 * showLocationModal()
 * 場所情報追加・編集用のモーダルを表示
 */
function showLocationModal(locationId = null) {
    const data = loadData();
    const trip = getCurrentTrip(data);
    if (!trip) return;
    const loc = locationId ? trip.locations.find(l => l.id === locationId) : null;

    const title = loc ? '場所を編集' : '場所を追加';
    const bodyHtml = `
        <form id="location-form">
            <div class="form-group">
                <label for="loc-name">名称 *</label>
                <input type="text" id="loc-name" value="${loc ? loc.name : ''}" placeholder="例：東京タワー" required>
            </div>
            <div class="form-group">
                <label for="loc-address">住所</label>
                <input type="text" id="loc-address" value="${loc ? loc.address : ''}" placeholder="例：東京都港区芝公園4-2-8">
            </div>
            <div class="form-group">
                <label for="loc-hours">営業時間</label>
                <input type="text" id="loc-hours" value="${loc ? loc.businessHours : ''}" placeholder="例：9:00 - 22:30">
            </div>
            <div class="form-group">
                <label for="loc-website">関連リンク / ウェブサイト</label>
                <input type="url" id="loc-website" value="${loc ? loc.website : ''}" placeholder="https://...">
            </div>
            <div class="form-group">
                <label for="loc-image">画像URL</label>
                <input type="url" id="loc-image" value="${loc ? (loc.image || '') : ''}" placeholder="https://example.com/image.jpg">
            </div>
            <div class="form-group">
                <label for="loc-notes">備考</label>
                <textarea id="loc-notes" rows="3">${loc ? loc.notes : ''}</textarea>
            </div>
        </form>
    `;

    showModal(title, bodyHtml, () => {
        const form = document.getElementById('location-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        const newLoc = {
            id: locationId || generateId(),
            name: document.getElementById('loc-name').value,
            address: document.getElementById('loc-address').value,
            businessHours: document.getElementById('loc-hours').value,
            website: document.getElementById('loc-website').value,
            image: document.getElementById('loc-image').value,
            notes: document.getElementById('loc-notes').value,
            updatedAt: new Date().toISOString()
        };

        const currentData = loadData();
        const currentTrip = getCurrentTrip(currentData);
        if (!currentTrip) return false;
        if (locationId) {
            const index = currentTrip.locations.findIndex(l => l.id === locationId);
            currentTrip.locations[index] = newLoc;
        } else {
            currentTrip.locations.push(newLoc);
        }
        saveData(currentData);
        return true;
    });
}

/**
 * window.editLocation() / window.deleteLocation()
 * 場所の編集・削除処理
 */
window.editLocation = (id) => {
    showLocationModal(id);
};

window.deleteLocation = (id) => {
    if (confirm('この場所情報を削除してもよろしいですか？（スケジュールとの紐付けは解除されます）')) {
        const data = loadData();
        const trip = getCurrentTrip(data);
        if (!trip) return;
        trip.locations = trip.locations.filter(l => l.id !== id);
        // Clean up location refs in schedules
        trip.schedules.forEach(s => {
            if (s.location === id) s.location = '';
        });
        saveData(data);
    }
};
