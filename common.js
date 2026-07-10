// ================================================================
// common.js — ใช้ร่วมกันทุกหน้า (index.html, dashboard.html, search.html)
// ต้องอัปเดต API_URL ทุกครั้งที่ deploy Apps Script เวอร์ชันใหม่ (ถ้า URL เปลี่ยน)
// ================================================================

const API_URL = "https://script.google.com/macros/s/AKfycbz59-fpy2xh0fWVl5x8jANIP_Kn3YtZdYJHcteEpkxKGt3wmGCxp2D6LG3cqoUNTMymSg/exec";

/**
 * เรียก API แบบ GET (ค้นหา, ดึงข้อมูล dashboard, export, getRecord)
 */
async function apiGet(action, params) {
  const qs = new URLSearchParams({ action, ...(params || {}) }).toString();
  const res = await fetch(`${API_URL}?${qs}`);
  if (!res.ok) throw new Error('เครือข่ายผิดพลาด (HTTP ' + res.status + ')');
  const json = await res.json();
  return json;
}

/**
 * เรียก API แบบ POST (save, update, delete)
 * ใช้ Content-Type: text/plain โดยตั้งใจ เพื่อให้เป็น "simple request"
 * และไม่ต้องผ่าน CORS preflight (OPTIONS) ซึ่ง Apps Script ไม่รองรับ
 */
async function apiPost(action, payload) {
  const res = await fetch(`${API_URL}?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload || {})
  });
  if (!res.ok) throw new Error('เครือข่ายผิดพลาด (HTTP ' + res.status + ')');
  return res.json();
}

/**
 * โหลด nav.html (partial) มาฝังใน div#navPlaceholder
 * themeClass: 'sw-header-dark' หรือ 'sw-header-light'
 * currentPage: 'form' | 'search' | 'dashboard' (ใช้ไฮไลต์เมนูปัจจุบัน)
 */
async function loadNav(themeClass, currentPage) {
  const container = document.getElementById('navPlaceholder');
  if (!container) return;
  try {
    const res = await fetch('nav.html');
    const html = await res.text();
    container.innerHTML = html;
    container.classList.add(themeClass);
    container.querySelectorAll('.sw-nav-link').forEach(a => {
      if (a.dataset.page === currentPage) a.classList.add('sw-active');
    });
  } catch (e) {
    console.error('โหลดเมนูไม่สำเร็จ', e);
  }
}

/**
 * แสดง error กลางๆ เวลาเรียก API ไม่สำเร็จ (เชื่อมต่อไม่ได้ / deployment ผิดสิทธิ์ ฯลฯ)
 */
function showApiError(err) {
  const msg = (err && err.message) ? err.message : String(err);
  if (window.Swal) {
    Swal.fire('เชื่อมต่อ API ไม่สำเร็จ', msg + '\n\nกรุณาตรวจสอบอินเทอร์เน็ต หรือแจ้งผู้ดูแลระบบว่า Apps Script Deployment อาจถูกตั้งค่าผิด (Execute as: Me, Access: Anyone)', 'error');
  } else {
    alert('เชื่อมต่อ API ไม่สำเร็จ: ' + msg);
  }
}
