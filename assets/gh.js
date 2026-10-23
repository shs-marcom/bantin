/* Bản tin nội bộ SHS - thư viện dùng chung cho admin.html và setup.html
   - Mã hóa mã truy cập GitHub bằng mật khẩu (PBKDF2 600.000 vòng + AES-GCM 256)
   - Gọi GitHub API để ghi file theo từng lần lưu (1 lần lưu = 1 commit)
*/
const SHS = (() => {
  const enc = new TextEncoder(), dec = new TextDecoder();
  const ITER = 600000;

  /* ---------- tiện ích ---------- */
  const b64 = buf => {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let s = ''; const CH = 0x8000;
    for (let i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    return btoa(s);
  };
  const unb64 = s => Uint8Array.from(atob(s.replace(/\s/g, '')), c => c.charCodeAt(0));
  const rand = n => crypto.getRandomValues(new Uint8Array(n));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slug = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'ban-tin';
  const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const fmtDate = d => { const [y, m, dd] = (d || '').split('-'); return dd ? `${dd}/${m}/${y}` : (d || ''); };
  const num = (n, f = 1) => Number(n).toLocaleString('vi-VN', { maximumFractionDigits: f });

  const fileB64 = file => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1]);
    r.onerror = () => rej(new Error('Không đọc được file trên máy.'));
    r.readAsDataURL(file);
  });
  const isPdf = async file => (await file.slice(0, 5).text()) === '%PDF-';

  /* ---------- mã hóa ---------- */
  async function pwKey(pw, salt, iter) {
    const base = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  const aesKey = raw => crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
  async function seal(key, bytes) {
    const iv = rand(12);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes);
    return { iv: b64(iv), ct: b64(ct) };
  }
  async function unseal(key, box) {
    return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(box.iv) }, key, unb64(box.ct)));
  }
  /* Khóa chủ K (ngẫu nhiên) mã hóa mã GitHub; mỗi người dùng giữ 1 bản K bọc bằng mật khẩu riêng */
  const newMaster = () => rand(32);
  async function wrapMaster(K, pw) {
    const salt = rand(16);
    const box = await seal(await pwKey(pw, salt, ITER), K);
    return { salt: b64(salt), iter: ITER, iv: box.iv, ct: box.ct };
  }
  async function unwrapMaster(user, pw) { return unseal(await pwKey(pw, unb64(user.salt), user.iter || ITER), user); }
  async function encToken(K, token) { return seal(await aesKey(K), enc.encode(token)); }
  async function decToken(K, box) { return dec.decode(await unseal(await aesKey(K), box)); }

  async function login(auth, name, pw) {
    const u = (auth.users || []).find(x => x.name === name);
    if (!u) throw new Error('Không tìm thấy người dùng.');
    let K;
    try { K = await unwrapMaster(u, pw); } catch (e) { throw new Error('Sai mật khẩu.'); }
    const token = await decToken(K, auth.token);
    return { K, token, user: u };
  }

  /* ---------- cấu hình & phiên ---------- */
  async function loadAuth() {
    const r = await fetch('auth.json?t=' + Date.now(), { cache: 'no-store' });
    if (r.status === 404) return { v: 1, users: [] };
    if (!r.ok) throw new Error('Không đọc được auth.json');
    const a = await r.json(); a.users = a.users || []; return a;
  }
  function detectRepo() {
    const h = location.hostname;
    if (!h.endsWith('.github.io')) return '';
    const owner = h.split('.')[0];
    const seg = location.pathname.split('/')[1];
    return seg && !seg.includes('.') ? `${owner}/${seg}` : `${owner}/${h}`;
  }
  const session = {
    get(k) { try { return JSON.parse(sessionStorage.getItem('shs_' + k) || 'null'); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem('shs_' + k, JSON.stringify(v)); } catch (e) { } },
    del(k) { try { sessionStorage.removeItem('shs_' + k); } catch (e) { } }
  };

  /* ---------- GitHub API ---------- */
  function ghMsg(status, msg) {
    if (status === 401) return 'Mã truy cập GitHub không hợp lệ hoặc đã hết hạn. Báo quản trị viên cập nhật mã.';
    if (status === 403) return /rate limit/i.test(msg) ? 'GitHub đang giới hạn tần suất truy cập. Thử lại sau ít phút.' : 'Mã truy cập không đủ quyền ghi vào repo này.';
    if (status === 404) return 'Không tìm thấy repo hoặc file trên GitHub (kiểm tra tên repo và quyền của mã).';
    if (status === 409 || status === 422) return 'Có người vừa lưu cùng lúc. Vui lòng bấm lưu lại.';
    if (status === 413) return 'File quá lớn so với giới hạn của GitHub.';
    return 'Lỗi GitHub ' + status + (msg ? ': ' + msg : '');
  }
  function gh(token, repo, branch = 'main') {
    const API = 'https://api.github.com';
    async function req(path, opt = {}) {
      let r;
      try {
        r = await fetch(API + path, {
          cache: 'no-store', ...opt,
          headers: {
            'Accept': 'application/vnd.github+json', 'Authorization': 'Bearer ' + token,
            'X-GitHub-Api-Version': '2022-11-28', ...(opt.body ? { 'Content-Type': 'application/json' } : {})
          }
        });
      } catch (e) { throw new Error('Không kết nối được GitHub. Kiểm tra mạng rồi thử lại.'); }
      if (!r.ok) {
        let m = ''; try { m = (await r.json()).message || ''; } catch (_) { }
        const err = new Error(ghMsg(r.status, m)); err.status = r.status; throw err;
      }
      return r.status === 204 ? null : r.json();
    }
    const R = `/repos/${repo}`;
    return {
      repo, branch,
      repoInfo: () => req(R),
      commits: n => req(`${R}/commits?sha=${branch}&per_page=${n || 20}`),
      async readJson(path, ref) {
        try {
          const r = await req(`${R}/contents/${path}?ref=${ref || branch}`);
          return JSON.parse(dec.decode(unb64(r.content)));
        } catch (e) { if (e.status === 404) return null; throw e; }
      },
      async blob(base64) {
        const r = await req(`${R}/git/blobs`, { method: 'POST', body: JSON.stringify({ content: base64, encoding: 'base64' }) });
        return r.sha;
      },
      /* build(headSha) trả về danh sách thay đổi: {path, text} | {path, sha} | {path, delete:true}
         Đọc dữ liệu mới nhất bên trong build để không ghi đè thao tác của người khác */
      async commit(message, build, tries = 3) {
        for (let t = 0; t < tries; t++) {
          const ref = await req(`${R}/git/ref/heads/${branch}`);
          const head = ref.object.sha;
          const c = await req(`${R}/git/commits/${head}`);
          const changes = await build(head);
          const tree = [];
          for (const ch of changes) {
            if (ch.delete) { tree.push({ path: ch.path, mode: '100644', type: 'blob', sha: null }); continue; }
            const sha = ch.sha || await this.blob(b64(enc.encode(ch.text)));
            tree.push({ path: ch.path, mode: '100644', type: 'blob', sha });
          }
          const nt = await req(`${R}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: c.tree.sha, tree }) });
          const nc = await req(`${R}/git/commits`, { method: 'POST', body: JSON.stringify({ message, tree: nt.sha, parents: [head] }) });
          try {
            await req(`${R}/git/refs/heads/${branch}`, { method: 'PATCH', body: JSON.stringify({ sha: nc.sha, force: false }) });
            return nc;
          } catch (e) { if (e.status === 422 && t < tries - 1) continue; throw e; }
        }
      }
    };
  }

  /* ---------- giao diện ---------- */
  function toast(msg, ms = 2600) {
    const t = document.getElementById('toast'); if (!t) return alert(msg);
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), ms);
  }
  function busy(msg) {
    const b = document.getElementById('busy'); if (!b) return;
    if (msg === false) { b.classList.remove('open'); return; }
    document.getElementById('busyTxt').textContent = msg || 'Đang xử lý...'; b.classList.add('open');
  }

  return {
    ITER, b64, unb64, esc, slug, today, fmtDate, num, fileB64, isPdf,
    newMaster, wrapMaster, unwrapMaster, encToken, decToken, login,
    loadAuth, detectRepo, session, gh, toast, busy
  };
})();
