/* ========================================
   旅行スケジュール管理 - UIユーティリティ
   モーダルウィンドウや共通UI機能を管理します。
   ======================================== */

/**
 * showModal()
 * フォーム入力用のモーダルウィンドウを表示
 * @param {string} title モーダルのタイトル
 * @param {string} bodyHtml フォームのHTML
 * @param {Function} onSave 保存ボタンクリック時のコールバック関数
 */
export function showModal(title, bodyHtml, onSave) {
    const modal = document.getElementById('modal');
    if (!modal) return;

    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const saveBtn = document.getElementById('modal-save');

    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    
    // Replace save button to clear previous listeners
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    
   // onSaveがnullの場合は保存ボタンを非表示
   if (onSave === null) {
       newSaveBtn.style.display = 'none';
   } else {
       newSaveBtn.style.display = 'block';
       newSaveBtn.addEventListener('click', () => {
           if (onSave()) {
               modal.style.display = 'none';
           }
       });
        }

    modal.style.display = 'block';
}

/**
 * closeModal()
 * モーダルウィンドウを閉じる
 */
export function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
    }
}
