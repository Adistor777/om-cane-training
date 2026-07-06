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

/* ---------------------------------------------------------------------------
   CLOUD SEAM — the ONLY place that touches Supabase. (feat/cloud-sync)

   >>> CLOUD_SYNC is the master switch. DEFAULT OFF. <<<
   OFF = the app is byte-for-byte the offline pilot: local stub auth, local
   newResearchId() minting, no network calls, supabase.js loads but is never
   initialised. Flip to true ONLY on a build where the dashboard prep is done
   (schools re-seeded to sch_* IDs, test teacher provisioned with
   app_metadata.school_id + linked teachers row) — see TRACKER.md.

   What lives here and why:
   • Client init is LAZY (first use, not boot) so flag-OFF builds never pay
     for it and a missing/corrupt supabase.js cannot break offline boot.
   • signIn(loginId, pw) — loginId is what the teacher types (e.g. saksham01);
     auth users are provisioned as <loginId>@CLOUD_AUTH_DOMAIN. A full email
     typed as loginId is passed through untouched, so real school emails work
     later without a code change.
   • enrolChild(fields) — wraps the enrol_child() RPC (security definer).
     The SERVER mints research_id and stamps school_id from the signed-in
     teacher's JWT — the device never chooses either. Requires a live cloud
     session; RLS rejects anonymous calls ('not an active roster teacher').
   • Errors are returned as {ok:false, error, offline} — callers decide the
     teacher-facing message. Nothing here throws.
   --------------------------------------------------------------------------- */
const CLOUD_SYNC = false;   // MASTER SWITCH — keep false until dashboard prep is verified
const CLOUD_URL  = 'https://nrnmxgggmqddhbsjtuob.supabase.co';
const CLOUD_KEY  = 'sb_publishable_jrpvaGwr9d53AysVlTpLJg_qZepOmQh'; // publishable (anon) key — RLS-protected, safe in client
const CLOUD_AUTH_DOMAIN = 'test.local'; // pilot: auth users are <loginId>@test.local; swap when real accounts land

const Cloud = {
  _client: null,

  enabled(){ return CLOUD_SYNC; },
  // navigator.onLine is optimistic inside a WebView (can report true on dead
  // links) — treat it as a fast pre-check only; every call still handles the
  // real network failure.
  online(){ return typeof navigator === 'undefined' ? true : navigator.onLine !== false; },

  _init(){
    if(this._client) return this._client;
    if(!CLOUD_SYNC) return null;
    if(!(window.supabase && window.supabase.createClient)){
      console.error('Cloud: vendored supabase.js not loaded — check script order in index.html');
      return null;
    }
    this._client = window.supabase.createClient(CLOUD_URL, CLOUD_KEY);
    return this._client;
  },

  _emailFor(loginId){
    const id = (loginId || '').trim().toLowerCase();
    return id.includes('@') ? id : `${id}@${CLOUD_AUTH_DOMAIN}`;
  },

  // (loginId, password) -> {ok, offline?, error?}. Session persists via
  // supabase-js (localStorage) so enrol_child() has auth.uid() later.
  async signIn(loginId, password){
    const c = this._init();
    if(!c) return { ok:false, error:'cloud-disabled' };
    if(!this.online()) return { ok:false, offline:true, error:'offline' };
    try {
      const { error } = await c.auth.signInWithPassword({ email: this._emailFor(loginId), password });
      if(error) return { ok:false, offline: this._isNetworkError(error), error: error.message };
      return { ok:true };
    } catch(e){
      return { ok:false, offline:true, error: String(e && e.message || e) };
    }
  },

  // fields: {name, dob, height, weight, hand, filledBy, consent, consentBy,
  // consentRelation, consentMethod} — app-side strings; numerics/date are
  // null-coerced here so empty inputs don't fail Postgres casts.
  // -> {ok, researchId?, offline?, error?}
  async enrolChild(fields){
    const c = this._init();
    if(!c) return { ok:false, error:'cloud-disabled' };
    if(!this.online()) return { ok:false, offline:true, error:'offline' };
    const num = v => { const n = parseFloat(v); return isFinite(n) ? n : null; };
    try {
      const { data, error } = await c.rpc('enrol_child', {
        p_name: fields.name,
        p_dob: (fields.dob || '').trim() || null,           // 'YYYY-MM-DD' or null
        p_height: num(fields.height),
        p_weight: num(fields.weight),
        p_hand: fields.hand || null,
        p_filled_by: fields.filledBy || null,
        p_consent: !!fields.consent,
        p_consent_by: fields.consentBy || null,
        p_consent_relation: fields.consentRelation || null,
        p_consent_method: fields.consentMethod || null
      });
      if(error) return { ok:false, offline: this._isNetworkError(error), error: error.message };
      return { ok:true, researchId: data };                 // server-minted 'OM-XXXX-XXXX'
    } catch(e){
      return { ok:false, offline:true, error: String(e && e.message || e) };
    }
  },

  // Heuristic: supabase-js surfaces fetch failures with these shapes; RLS and
  // auth rejections come back as structured errors instead.
  _isNetworkError(err){
    const m = String(err && err.message || err).toLowerCase();
    return m.includes('fetch') || m.includes('network') || m.includes('timeout');
  }
};
