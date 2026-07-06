/* ---------------------------------------------------------------------------
   STORAGE SEAM — the ONLY place that touches the storage backend.
   Backend: Capacitor Preferences on native (Android/iOS), localStorage on the
   plain web. Selected ONCE at boot in Store.init(). Nothing else in this file
   knows which backend is live.

   THE SYNC/ASYNC SPLIT (read this before editing):
   Native Preferences is asynchronous (every get/set returns a Promise); there
   is no synchronous native storage. But every render function here reads
   storage synchronously while building HTML, and rewriting all of them to
   await reads would be a huge, fragile change. So the seam keeps a synchronous
   in-memory CACHE that mirrors the backend:

     • Store.init()  — async, run ONCE at boot. Loads the whole backend into the
                       cache. Until it resolves, reads would be empty, so boot
                       waits for it.
     • READS  (getJSON/getString/_keys) — synchronous, served from the cache.
                       Render code stays unchanged.
     • WRITES (setJSON/setString/_remove) — ASYNC. They update the cache
                       synchronously (so a following read is correct), then
                       write through to the backend and READ BACK to verify.
                       The returned Promise resolves true only when the backend
                       confirms the write. Callers `await` this and warn the
                       teacher on false — the write-verify guarantee is intact
                       end-to-end, not faked off the cache.

   Why verify at all: inside a native WebView a quota/serialise/OS error can
   fail SILENTLY — the worst outcome for a children's data tool. A failed write
   surfaces to the teacher (who can export a CSV) instead of vanishing.

   TO CHANGE BACKENDS: edit ONLY the four _backend* bodies + the detection in
   init(). The cache, verify, and public API stay put.
   --------------------------------------------------------------------------- */
const Store = {
  _cache: {},            // key -> string value (mirror of the backend)
  _ready: false,
  _native: false,
  _prefs: null,          // Capacitor Preferences plugin handle, when native

  // ---- backend primitives (the ONLY backend-specific code) ----------------
  async _backendEntries(){
    if(this._native){
      const { keys } = await this._prefs.keys();
      const out = {};
      for(const k of keys){ const { value } = await this._prefs.get({ key:k }); out[k] = value; }
      return out;
    }
    const out = {};
    try { for(let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); out[k] = localStorage.getItem(k); } } catch(e){}
    return out;
  },
  async _backendSet(key, val){
    if(this._native){ await this._prefs.set({ key, value: val }); return true; }
    try { localStorage.setItem(key, val); return true; } catch(e){ return false; }
  },
  async _backendGet(key){
    if(this._native){ const { value } = await this._prefs.get({ key }); return value; }
    try { return localStorage.getItem(key); } catch(e){ return null; }
  },
  async _backendRemove(key){
    if(this._native){ await this._prefs.remove({ key }); return; }
    try { localStorage.removeItem(key); } catch(e){}
  },

  // ---- boot: detect backend, fill the cache once --------------------------
  async init(){
    // Capacitor injects window.Capacitor; Preferences is registered as a plugin.
    const cap = window.Capacitor;
    if(cap && cap.isNativePlatform && cap.isNativePlatform() && cap.Plugins && cap.Plugins.Preferences){
      this._native = true;
      this._prefs = cap.Plugins.Preferences;
    }
    this._cache = await this._backendEntries();
    this._ready = true;
  },

  // ---- synchronous reads (served from cache) ------------------------------
  _get(key){ return Object.prototype.hasOwnProperty.call(this._cache, key) ? this._cache[key] : null; },
  _keys(){ return Object.keys(this._cache); },
  getJSON(key, fallback){
    const raw = this._get(key);
    if(raw == null) return fallback;
    try { return JSON.parse(raw); } catch(e){ return fallback; }
  },
  getString(key, fallback){ const v = this._get(key); return v == null ? fallback : v; },

  // ---- asynchronous writes (cache + write-through + read-back verify) -----
  // Resolves true only if the backend confirms the value was stored.
  async setJSON(key, value){
    const serialised = JSON.stringify(value);
    this._cache[key] = serialised;                 // sync cache update first
    const ok = await this._backendSet(key, serialised);
    if(!ok) return false;
    const check = await this._backendGet(key);     // read-back verify
    return check === serialised;
  },
  async setString(key, value){
    this._cache[key] = value;
    const ok = await this._backendSet(key, value);
    if(!ok) return false;
    const check = await this._backendGet(key);
    return check === value;
  },
  async _remove(key){
    delete this._cache[key];
    await this._backendRemove(key);
  }
};
