import React, {useState, useEffect, useRef} from 'react';

// SHA-256 implementation (pure JS, matches web's crypto.subtle.digest)
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  // Pure JS SHA-256 (since RN doesn't have crypto.subtle)
  function rotr(x,n){return (x>>>n)|(x<<(32-n));}
  const k=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  let h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const len=msgBuffer.length;
  const bitLen=len*8;
  const padded=new Uint8Array(Math.ceil((len+9)/64)*64);
  padded.set(msgBuffer);
  padded[len]=0x80;
  const dv=new DataView(padded.buffer);
  dv.setUint32(padded.length-4,bitLen>>>0);
  dv.setUint32(padded.length-8,Math.floor(bitLen/0x100000000));
  for(let i=0;i<padded.length;i+=64){
    const w=new Array(64);
    for(let j=0;j<16;j++) w[j]=dv.getUint32(i+j*4);
    for(let j=16;j<64;j++){
      const s0=rotr(w[j-15],7)^rotr(w[j-15],18)^(w[j-15]>>>3);
      const s1=rotr(w[j-2],17)^rotr(w[j-2],19)^(w[j-2]>>>10);
      w[j]=(w[j-16]+s0+w[j-7]+s1)|0;
    }
    let [a,b,c2,d,e,f,g,hh]=h;
    for(let j=0;j<64;j++){
      const S1=rotr(e,6)^rotr(e,11)^rotr(e,25);
      const ch=(e&f)^((~e)&g);
      const temp1=(hh+S1+ch+k[j]+w[j])|0;
      const S0=rotr(a,2)^rotr(a,13)^rotr(a,22);
      const maj=(a&b)^(a&c2)^(b&c2);
      const temp2=(S0+maj)|0;
      hh=g;g=f;f=e;e=(d+temp1)|0;d=c2;c2=b;b=a;a=(temp1+temp2)|0;
    }
    h[0]=(h[0]+a)|0;h[1]=(h[1]+b)|0;h[2]=(h[2]+c2)|0;h[3]=(h[3]+d)|0;
    h[4]=(h[4]+e)|0;h[5]=(h[5]+f)|0;h[6]=(h[6]+g)|0;h[7]=(h[7]+hh)|0;
  }
  return h.map(x=>(x>>>0).toString(16).padStart(8,'0')).join('');
}

async function hashPwd(p) {
  return sha256(p + 'fahrready2025');
}
import Sound from 'react-native-sound';
Sound.setCategory('Playback');
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, Image, Dimensions,
  SafeAreaView, StatusBar, Animated, BackHandler, Linking, AppState, Platform,
} from 'react-native';

const {width} = Dimensions.get('window');
const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 0;

// FahrReady v2.1
const LOGO_URI = 'data:image/png;base64,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';
const SB_URL = 'https://npfvlfdjngzczxhghmyu.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wZnZsZmRqbmd6Y3p4aGdobXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMTI2NjgsImV4cCI6MjA5NDg4ODY2OH0.oqnB4FTnmj-wno7AEgTz-MAmunazqwpj5jEkvB5xN8s';
const STRIPE_URL = 'https://npfvlfdjngzczxhghmyu.supabase.co/functions/v1/create-checkout';
const WEBSITE = 'https://fahrready.ch';
const EXAM_FREE = 5;
const PRACTICE_FREE = 10;

const THEMES = {
  dark:  {bg:'#0A0A1A', card:'#1A1A2E', text:'#FFFFFF', sub:'#94A3B8', border:'#2D2D4E', blue:'#1B4FD8', accent:'#60A5FA', navBg:'#0A0A1A'},
  light: {bg:'#F8FAFF', card:'#FFFFFF', text:'#0f172a', sub:'#6B7280', border:'#E5E7EB', blue:'#1B4FD8', accent:'#1B4FD8', navBg:'#FFFFFF'},
  blue:  {bg:'#0A1628', card:'#112240', text:'#E2E8F0', sub:'#94A3B8', border:'#1E3A5F', blue:'#3B82F6', accent:'#60A5FA', navBg:'#0A1628'},
  green: {bg:'#0A1F1A', card:'#112B22', text:'#E2E8F0', sub:'#86EFAC', border:'#1A4A35', blue:'#16A34A', accent:'#4ADE80', navBg:'#0A1F1A'},
};

const THEME_NAMES = {dark:'🌙 Dark', light:'☀️ Light', blue:'🔵 Blue', green:'🌿 Green'};

const TX = {
  de:{exam:'Prüfung',practice:'Vorbereitung',news:'Nachrichten',home:'Start',login:'Anmelden',register:'Registrieren',logout:'Abmelden',profile:'Profil',calendar:'Kalender',design:'Design',website:'🌐 Website',start:'▶ Prüfung starten',learn:'📚 Lernen starten',correct:'✓ Richtig!',wrong:'✗ Falsch!',next:'Nächste →',passed:'Bestanden! 🎉',failed:'Nicht bestanden 😔',again:'🔁 Nochmal',premium:'⭐ Premium',back:'← Zurück',confirm:'✓ Bestätigen',hello:'Hallo',analysis:'🤖 KI-Analyse',deleteAccount:'Konto löschen',questions:'Fragen',minutes:'Minuten',points:'Punkte'},
  fa:{exam:'آزمون',practice:'آمادگی',news:'اخبار',home:'خانه',login:'ورود',register:'ثبت‌نام',logout:'خروج',profile:'پروفایل',calendar:'تقویم',design:'طراحی',website:'🌐 وب‌سایت',start:'▶ شروع آزمون',learn:'📚 شروع یادگیری',correct:'✓ درست!',wrong:'✗ نادرست!',next:'بعدی ←',passed:'قبول! 🎉',failed:'رد شدید 😔',again:'🔁 دوباره',premium:'⭐ ویژه',back:'← برگشت',confirm:'✓ تأیید',hello:'سلام',analysis:'🤖 تحلیل هوش مصنوعی',deleteAccount:'حذف حساب',questions:'سوال',minutes:'دقیقه',points:'امتیاز'},
  az:{exam:'İmtahan',practice:'Hazırlıq',news:'Xəbərlər',home:'Ana',login:'Daxil ol',register:'Qeydiyyat',logout:'Çıxış',profile:'Profil',calendar:'Təqvim',design:'Dizayn',website:'🌐 Sayt',start:'▶ İmtahanı başlat',learn:'📚 Öyrənməyə başla',correct:'✓ Düzgün!',wrong:'✗ Yanlış!',next:'Növbəti →',passed:'Keçdiniz! 🎉',failed:'Keçmədiniz 😔',again:'🔁 Yenidən',premium:'⭐ Premium',back:'← Geri',confirm:'✓ Təsdiq',hello:'Salam',analysis:'🤖 AI Analizi',deleteAccount:'Hesabı sil',questions:'Sual',minutes:'Dəqiqə',points:'Xal'},
  en:{exam:'Exam',practice:'Practice',news:'News',home:'Home',login:'Login',register:'Register',logout:'Logout',profile:'Profile',calendar:'Calendar',design:'Theme',website:'🌐 Website',start:'▶ Start Exam',learn:'📚 Start Practice',correct:'✓ Correct!',wrong:'✗ Wrong!',next:'Next →',passed:'Passed! 🎉',failed:'Failed 😔',again:'🔁 Again',premium:'⭐ Premium',back:'← Back',confirm:'✓ Confirm',hello:'Hello',analysis:'🤖 AI Analysis',deleteAccount:'Delete Account',questions:'Questions',minutes:'Minutes',points:'Points'},
};

const LOCAL_Q = [
  {id:1,text_de:'Was bedeutet dieses Zeichen?',text_fa:'این علامت چه معنایی دارد؟',text_az:'Bu işarə nə deməkdir?',text_en:'What does this sign mean?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Zeichen_206.svg/200px-Zeichen_206.svg.png',is_multi:false,opts:[{text_de:'Halt — Vorfahrt gewähren',text_fa:'ایست — حق تقدم',text_az:'Dur — üstünlük ver',text_en:'Stop — give way',ok:true},{text_de:'Einfahrt verboten',text_fa:'ورود ممنوع',text_az:'Giriş qadağan',text_en:'No entry',ok:false},{text_de:'Parkieren verboten',text_fa:'پارک ممنوع',text_az:'Park qadağan',text_en:'No parking',ok:false}]},
  {id:2,text_de:'Was bedeutet dieses Zeichen?',text_fa:'این علامت چه معنایی دارد؟',text_az:'Bu işarə nə deməkdir?',text_en:'What does this sign mean?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Zeichen_205.svg/200px-Zeichen_205.svg.png',is_multi:false,opts:[{text_de:'Vorfahrt gewähren',text_fa:'حق تقدم بده',text_az:'Üstünlük ver',text_en:'Give way',ok:true},{text_de:'Vorfahrtsstrasse',text_fa:'خیابان اولویت',text_az:'Üstünlük yolu',text_en:'Priority road',ok:false},{text_de:'Halt',text_fa:'ایست',text_az:'Dur',text_en:'Stop',ok:false}]},
  {id:3,text_de:'Was bedeutet dieses Zeichen?',text_fa:'این علامت چه معنایی دارد؟',text_az:'Bu işarə nə deməkdir?',text_en:'What does this sign mean?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Zeichen_274-50.svg/200px-Zeichen_274-50.svg.png',is_multi:false,opts:[{text_de:'Höchstgeschwindigkeit 50 km/h',text_fa:'حداکثر سرعت ۵۰',text_az:'Maks. sürət 50',text_en:'Max speed 50 km/h',ok:true},{text_de:'Mindestgeschwindigkeit 50',text_fa:'حداقل ۵۰',text_az:'Min. sürət 50',text_en:'Min speed 50',ok:false},{text_de:'Empfohlene Geschwindigkeit',text_fa:'سرعت توصیه‌شده',text_az:'Tövsiyə sürəti',text_en:'Recommended speed',ok:false}]},
  {id:4,text_de:'Höchstgeschwindigkeit auf Schweizer Autobahnen?',text_fa:'حداکثر سرعت در اتوبان سوئیس؟',text_az:'İsveçrə avtoyollarında maks. sürət?',text_en:'Max speed on Swiss motorways?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Zeichen_274-120.svg/200px-Zeichen_274-120.svg.png',is_multi:false,opts:[{text_de:'120 km/h',text_fa:'۱۲۰',text_az:'120',text_en:'120 km/h',ok:true},{text_de:'130 km/h',text_fa:'۱۳۰',text_az:'130',text_en:'130 km/h',ok:false},{text_de:'100 km/h',text_fa:'۱۰۰',text_az:'100',text_en:'100 km/h',ok:false}]},
  {id:5,text_de:'Wer hat Vortritt ohne Zeichen?',text_fa:'در تقاطع بدون علامت چه کسی حق تقدم دارد؟',text_az:'İşarəsiz kəsişmədə kim üstünlüyə malikdir?',text_en:'Who has priority at unmarked junction?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Zeichen_102.svg/200px-Zeichen_102.svg.png',is_multi:false,opts:[{text_de:'Fahrzeuge von rechts',text_fa:'از راست',text_az:'Sağdan',text_en:'From right',ok:true},{text_de:'Von links',text_fa:'از چپ',text_az:'Soldan',text_en:'From left',ok:false},{text_de:'Wer zuerst kommt',text_fa:'هر که اول',text_az:'Kim əvvəl',text_en:'First come',ok:false}]},
];

function shuffle(arr) {
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

async function sbReq(path,method='GET',body=null) {
  try {
    const r=await fetch(`${SB_URL}/rest/v1/${path}`,{method,headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,'Content-Type':'application/json',Prefer:'return=representation'},body:body?JSON.stringify(body):undefined});
    const data=await r.json().catch(()=>[]);
    return {ok:r.ok,data};
  }catch(e){return {ok:false,data:[]};}
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [lang, setLang] = useState('de');
  const [theme, setTheme] = useState('dark');
  const [showTheme, setShowTheme] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState(LOCAL_Q);
  const [news, setNews] = useState([]);
  const [ads, setAds] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [editName, setEditName] = useState('');
  const [examQ, setExamQ] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOpts, setSelectedOpts] = useState([]);
  const [timeLeft, setTimeLeft] = useState(2700);
  const [timerRef, setTimerRef] = useState(null);
  const [results, setResults] = useState([]);
  const [isPractice, setIsPractice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loginMode, setLoginMode] = useState('email'); // 'email' or 'phone'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [logoutStep, setLogoutStep] = useState(0);
  const [premiumLocked, setPremiumLocked] = useState(false);
  const [calendar, setCalendar] = useState([]);
  const [calTitle, setCalTitle] = useState('Führerausweis Prüfung');
  const [calDate, setCalDate] = useState('');
  const [calTime, setCalTime] = useState('06:00');
  const [calRingtone, setCalRingtone] = useState('🔔 Standard');
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const T = THEMES[theme] || THEMES.dark;
  const t = TX[lang] || TX.de;

  // BackHandler - always intercept
  const logoutStepRef = useRef(0);
  const screenRef = useRef('home');
  const backPressTime = useRef(0);
  const [showExitMsg, setShowExitMsg] = useState(false);
  useEffect(() => { logoutStepRef.current = logoutStep; }, [logoutStep]);
  useEffect(() => { screenRef.current = screen; }, [screen]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (logoutStepRef.current > 0) { setLogoutStep(0); return true; }
      if (screenRef.current !== 'home') { setScreen('home'); return true; }
      // On home screen - double press to exit
      const now = Date.now();
      if (now - backPressTime.current < 2000) {
        BackHandler.exitApp();
      } else {
        backPressTime.current = now;
        setShowExitMsg(true);
        setTimeout(() => setShowExitMsg(false), 2000);
      }
      return true;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'background' || state === 'inactive') {
        stopAllSounds();
      }
    });
    return () => sub.remove();
  }, []);

  async function loadData() {
    try {
      const [qRes,nRes,aRes] = await Promise.all([
        sbReq('questions?is_active=eq.true&order=id.asc&limit=500'),
        sbReq('news?is_active=eq.true&order=created_at.desc&limit=10'),
        sbReq('ads?is_active=eq.true&limit=5'),
      ]);
      if(qRes.ok&&Array.isArray(qRes.data)&&qRes.data.length>0){
        const ar=await sbReq('answers?order=question_id.asc,id.asc&limit=2000');
        if(ar.ok&&Array.isArray(ar.data)){
          const qs=qRes.data.map(q=>{
            const lq=LOCAL_Q.find(l=>l.text_de===q.text_de&&l.img_url===q.img_url)||LOCAL_Q.find(l=>l.text_de===q.text_de);
            const opts=ar.data.filter(a=>a.question_id===q.id).slice(0,4).map((a,ai)=>{
              const lo=lq?.opts?.[ai];
              return {text_de:a.text_de||'',text_fa:a.text_fa||lo?.text_fa||'',text_az:a.text_az||lo?.text_az||'',text_en:a.text_en||lo?.text_en||'',ok:a.is_correct};
            });
            return {...q,text_fa:q.text_fa||lq?.text_fa||'',text_az:q.text_az||lq?.text_az||'',text_en:q.text_en||lq?.text_en||'',opts};
          }).filter(q=>q.text_de&&q.opts.length>=2);
          if(qs.length>0) setQuestions(qs);
        }
      }
      if(nRes.ok&&Array.isArray(nRes.data)) setNews(nRes.data);
      if(aRes.ok&&Array.isArray(aRes.data)) setAds(aRes.data);
    }catch(e){}
  }

  const currentSound = useRef(null);

  function playRingtone(name) {
    // Stop previous sound
    if (currentSound.current) {
      currentSound.current.stop();
      currentSound.current.release();
      currentSound.current = null;
    }
    const files = {
      '🔔 Standard': 'standard',
      '🎵 Melodie': 'melodie',
      '📯 Trompete': 'trompete',
      '🔊 Laut': 'laut',
      '🎶 Sanft': 'sanft',
    };
    const file = files[name] || 'standard';
    const sound = new Sound(file + '.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (!error) {
        currentSound.current = sound;
        sound.play(() => {
          sound.release();
          currentSound.current = null;
        });
      }
    });
  }

  function stopAllSounds() {
    if (currentSound.current) {
      currentSound.current.stop();
      currentSound.current.release();
      currentSound.current = null;
    }
  }

  async function sendOtp() {
    if (!phone || phone.length < 10) {
      Alert.alert('Fehler', 'Bitte gültige Telefonnummer eingeben (z.B. +41791234567)');
      return;
    }
    setOtpLoading(true);
    try {
      const r = await fetch(`${SB_URL}/auth/v1/otp`, {
        method: 'POST',
        headers: {'Content-Type':'application/json', 'apikey': SB_KEY},
        body: JSON.stringify({phone, channel: 'sms'})
      });
      if (r.ok) {
        setOtpSent(true);
        Alert.alert('✓ SMS gesendet', 'Code wurde an ' + phone + ' gesendet.');
      } else {
        const err = await r.json();
        Alert.alert('Fehler', err.msg || err.message || 'SMS konnte nicht gesendet werden');
      }
    } catch(e) {
      Alert.alert('Fehler', 'Verbindungsfehler');
    }
    setOtpLoading(false);
  }

  async function verifyOtp() {
    if (!otp || otp.length < 4) {
      Alert.alert('Fehler', 'Bitte Code eingeben');
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`${SB_URL}/auth/v1/verify`, {
        method: 'POST',
        headers: {'Content-Type':'application/json', 'apikey': SB_KEY},
        body: JSON.stringify({phone, token: otp, type: 'sms'})
      });
      const data = await r.json();
      if (r.ok && data.user) {
        // Check if user exists in users table
        const ur = await sbReq(`users?email=eq.${encodeURIComponent(data.user.phone||phone)}`);
        let userData = ur.ok && Array.isArray(ur.data) && ur.data[0];
        if (!userData) {
          // Create user
          const cr = await sbReq('users', 'POST', {
            email: data.user.phone || phone,
            password_hash: 'phone_' + Date.now(),
            full_name: 'Benutzer ' + phone.slice(-4),
            language: lang,
            is_premium: false,
            created_at: new Date().toISOString()
          });
          userData = cr.ok && Array.isArray(cr.data) && cr.data[0];
        }
        if (userData) {
          setUser(userData);
          setScreen('home');
          Alert.alert('Willkommen!', 'Hallo ' + userData.full_name + '!');
        }
      } else {
        Alert.alert('Fehler', data.msg || 'Falscher Code');
      }
    } catch(e) {
      Alert.alert('Fehler', 'Verbindungsfehler');
    }
    setLoading(false);
  }

  function goHome() { if(timerRef){clearInterval(timerRef);setTimerRef(null);} setScreen('home'); setShowMenu(false); setShowTheme(false); }

  function startExam(practice=false) {
    const pool=shuffle(questions.map(q=>({...q,opts:shuffle([...q.opts])})));
    const set=practice?pool:pool.slice(0,Math.min(50,pool.length));
    setExamQ(set);setQIdx(0);setScore(0);setErrors(0);
    setAnswered(false);setSelectedOpts([]);setResults([]);setIsPractice(practice);
    setAiText('');
    setPremiumLocked(false);
    if(!practice){
      setTimeLeft(2700);
      const ti=setInterval(()=>setTimeLeft(p=>{if(p<=1){clearInterval(ti);return 0;}return p-1;}),1000);
      setTimerRef(ti);
    }
    setShowMenu(false);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim,{toValue:1,duration:300,useNativeDriver:true}).start();
    setScreen('exam');
  }

  function pickAnswer(i) {
    if(answered) return;
    // Always allow toggling - user can select multiple
    setSelectedOpts(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i]);
  }

  function submitAnswer() {
    if(selectedOpts.length===0) return;
    const q=examQ[qIdx];
    const correctIdxs=q.opts.map((o,i)=>o.ok?i:-1).filter(i=>i>=0);
    const ok=correctIdxs.every(i=>selectedOpts.includes(i))&&selectedOpts.every(i=>q.opts[i]?.ok);
    setAnswered(true);
    if(ok) setScore(s=>s+1); else setErrors(e=>e+1);
    setResults(r=>[...r,{q,correct:ok}]);
  }

  function nextQ() {
    const freeLimit=isPractice?PRACTICE_FREE:EXAM_FREE;
    if(!user?.is_premium&&(premiumLocked||qIdx+1>=freeLimit)){if(timerRef)clearInterval(timerRef);setPremiumLocked(true);setScreen('premium');return;}
    if(qIdx+1>=examQ.length){finishExam();return;}
    setQIdx(i=>i+1);setAnswered(false);setSelectedOpts([]);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim,{toValue:1,duration:250,useNativeDriver:true}).start();
  }

  function finishExam(){if(timerRef){clearInterval(timerRef);setTimerRef(null);}setScreen('result');}
  function formatTime(s){return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;}

  async function stripeCheckout(priceId) {
    const userEmail=user?.email||email;
    if(!userEmail){Alert.alert('E-Mail','Bitte E-Mail eingeben');return;}
    try{
      const r=await fetch(STRIPE_URL,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${SB_KEY}`,apikey:SB_KEY},body:JSON.stringify({priceId,email:userEmail})});
      const data=await r.json();
      if(data.url) Linking.openURL(data.url);
      else Alert.alert('Fehler',data.error||'Fehler');
    }catch(e){Alert.alert('Fehler','Verbindungsfehler');}
  }

  async function runAiAnalysis() {
    setAiLoading(true);
    const wrong=results.filter(r=>!r.correct);
    const prompt=`Du bist Schweizer Fahrlehrer. Analysiere auf DEUTSCH und PERSISCH. Richtig: ${results.filter(r=>r.correct).length}/${results.length}. Falsche Themen: ${wrong.slice(0,6).map(r=>r.q.text_de).join('; ')}. Gib fuer jede falsche Antwort eine Lernmethode. Max 200 Woerter pro Sprache.`;
    try{
      const r=await fetch('https://npfvlfdjngzczxhghmyu.supabase.co/functions/v1/ai-analysis',{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${SB_KEY}`,'apikey':SB_KEY},
        body:JSON.stringify({prompt})
      });
      const d=await r.json();
      setAiText(d.text||d.error||'Analyse nicht verfügbar');
    }catch(e){setAiText('Verbindungsfehler. Bitte Internet prüfen.');}
    setAiLoading(false);
  }

  async function deleteAccount() {
    Alert.alert('Konto löschen?','Wirklich löschen?',[
      {text:'Nein',style:'cancel'},
      {text:'Ja',style:'destructive',onPress:()=>{
        Alert.alert('Sicher?','Alle Daten werden gelöscht!',[
          {text:'Abbrechen',style:'cancel'},
          {text:'Löschen',style:'destructive',onPress:async()=>{
            if(user?.id) await sbReq(`users?id=eq.${user.id}`,'DELETE');
            setUser(null);setScreen('home');
          }}
        ]);
      }}
    ]);
  }

  const curQ=examQ[qIdx];
  const adTop=ads.find(a=>a.position==='top');
  const adBottom=ads.find(a=>a.position==='bottom');

  // ── OVERLAY COMPONENTS ──
  const ThemeOverlay = showTheme ? (
    <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:1000,backgroundColor:'rgba(0,0,0,0.6)',justifyContent:'center',alignItems:'center'}}>
      <View style={{backgroundColor:T.card,borderRadius:20,padding:24,width:width*0.8}}>
        <Text style={{color:T.text,fontSize:18,fontWeight:'800',marginBottom:16,textAlign:'center'}}>{t.design}</Text>
        {Object.entries(THEME_NAMES).map(([key,name])=>(
          <TouchableOpacity key={key} onPress={()=>{setTheme(key);setShowTheme(false);}}
            style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:14,borderRadius:12,marginBottom:8,backgroundColor:theme===key?T.blue+'33':T.bg,borderWidth:1,borderColor:theme===key?T.blue:T.border}}>
            <Text style={{color:T.text,fontSize:15,fontWeight:'600'}}>{name}</Text>
            {theme===key&&<Text style={{color:T.blue,fontWeight:'700'}}>✓</Text>}
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={()=>setShowTheme(false)} style={{marginTop:4,padding:12,alignItems:'center'}}>
          <Text style={{color:T.sub}}>✕ Schließen</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : null;

  // ── LOGOUT CONFIRM OVERLAY ──
  const LogoutOverlay = logoutStep > 0 ? (
    <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:2000,backgroundColor:'rgba(0,0,0,0.7)',justifyContent:'center',alignItems:'center',padding:30}}>
      <View style={{backgroundColor:T.card,borderRadius:20,padding:24,width:'100%'}}>
        {logoutStep === 1 ? (
          <>
            <Text style={{fontSize:24,textAlign:'center',marginBottom:8}}>🚪</Text>
            <Text style={{color:T.text,fontSize:18,fontWeight:'900',textAlign:'center',marginBottom:6}}>Abmelden?</Text>
            <Text style={{color:T.sub,fontSize:13,textAlign:'center',marginBottom:6}}>خروج از حساب؟</Text>
            <Text style={{color:T.sub,fontSize:12,textAlign:'center',marginBottom:24}}>Möchten Sie sich wirklich abmelden?</Text>
            <View style={{flexDirection:'row',gap:12}}>
              <TouchableOpacity style={{flex:1,backgroundColor:T.bg,borderRadius:12,padding:14,alignItems:'center',borderWidth:1,borderColor:T.border}} onPress={()=>setLogoutStep(0)}>
                <Text style={{color:T.text,fontWeight:'700'}}>❌ Nein / نه</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{flex:1,backgroundColor:'#F59E0B',borderRadius:12,padding:14,alignItems:'center'}} onPress={()=>setLogoutStep(2)}>
                <Text style={{color:'#fff',fontWeight:'700'}}>⚠️ Ja / بله</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={{fontSize:24,textAlign:'center',marginBottom:8}}>✋</Text>
            <Text style={{color:'#DC2626',fontSize:18,fontWeight:'900',textAlign:'center',marginBottom:6}}>Wirklich sicher?</Text>
            <Text style={{color:T.sub,fontSize:13,textAlign:'center',marginBottom:6}}>مطمئنی؟</Text>
            <Text style={{color:T.sub,fontSize:12,textAlign:'center',marginBottom:24}}>Diese Aktion kann nicht rückgängig gemacht werden.</Text>
            <View style={{flexDirection:'row',gap:12}}>
              <TouchableOpacity style={{flex:1,backgroundColor:T.bg,borderRadius:12,padding:14,alignItems:'center',borderWidth:1,borderColor:T.border}} onPress={()=>setLogoutStep(0)}>
                <Text style={{color:T.text,fontWeight:'700'}}>❌ Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{flex:1,backgroundColor:'#DC2626',borderRadius:12,padding:14,alignItems:'center'}} onPress={()=>{setLogoutStep(0);setUser(null);goHome();}}>
                <Text style={{color:'#fff',fontWeight:'700'}}>🚪 Abmelden</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  ) : null;

  const MenuOverlay = showMenu ? (
    <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:999,flexDirection:'row'}}>
      <View style={{width:width*0.78,height:'100%',backgroundColor:T.card}}>
        <SafeAreaView style={{flex:1}}>
          <View style={{padding:20,borderBottomWidth:1,borderBottomColor:T.border,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
            <Text style={{fontSize:18,fontWeight:'900',color:T.text}}>🚗 Fahr<Text style={{color:T.accent}}>Ready</Text></Text>
            <TouchableOpacity onPress={()=>setShowMenu(false)}><Text style={{color:T.text,fontSize:22}}>✕</Text></TouchableOpacity>
          </View>
          {user&&(
            <View style={{padding:16,borderBottomWidth:1,borderBottomColor:T.border}}>
              <Text style={{color:T.text,fontSize:15,fontWeight:'700'}}>{t.hello}, {user.full_name?.split(' ')[0]}! {user.is_premium?'⭐':''}</Text>
              <Text style={{color:T.sub,fontSize:12}}>{user.email}</Text>
            </View>
          )}
          <View style={{flexDirection:'row',gap:6,padding:12,borderBottomWidth:1,borderBottomColor:T.border}}>
            {['DE','FA','AZ','EN'].map(l=>(
              <TouchableOpacity key={l} onPress={()=>{setLang(l.toLowerCase());setShowMenu(false);}}
                style={{paddingHorizontal:10,paddingVertical:6,borderRadius:20,borderWidth:1,borderColor:lang===l.toLowerCase()?T.blue:T.border,backgroundColor:lang===l.toLowerCase()?T.blue:'transparent'}}>
                <Text style={{color:lang===l.toLowerCase()?'#fff':T.sub,fontSize:12,fontWeight:'700'}}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView>
            {[
              ['🏠',t.home,()=>{goHome();}],
              ['📝',t.exam,()=>{startExam(false);}],
              ['📚',t.practice,()=>{startExam(true);}],
              ['📰',t.news,()=>{setScreen('news');setShowMenu(false);}],
              ['📅',t.calendar,()=>{setScreen('calendar');setShowMenu(false);}],
              ['👤',t.profile,()=>{setScreen('profile');setShowMenu(false);}],
              ['🎨',t.design,()=>{setShowTheme(true);setShowMenu(false);}],
              ['🌐',t.website,()=>{Linking.openURL(WEBSITE);setShowMenu(false);}],
            ].map(([icon,label,action],i)=>(
              <TouchableOpacity key={i} style={{flexDirection:'row',alignItems:'center',gap:14,padding:16,borderBottomWidth:1,borderBottomColor:T.border}} onPress={action}>
                <Text style={{fontSize:20}}>{icon}</Text>
                <Text style={{color:T.text,fontSize:15,fontWeight:'500'}}>{label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={{padding:16,borderTopWidth:1,borderTopColor:T.border}}>
            {user?(
              <TouchableOpacity style={{backgroundColor:'#DC2626',borderRadius:10,padding:12,alignItems:'center'}} onPress={()=>setLogoutStep(1)}>
                <Text style={{color:'#fff',fontWeight:'700'}}>🚪 {t.logout}</Text>
              </TouchableOpacity>
            ):(
              <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:10,padding:12,alignItems:'center'}} onPress={()=>{setScreen('login');setShowMenu(false);}}>
                <Text style={{color:'#fff',fontWeight:'700'}}>{t.login}</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>
      <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}} onPress={()=>setShowMenu(false)} activeOpacity={1}/>
    </View>
  ) : null;

  const BottomAd = () => {
    if(!adBottom) return null;
    return (
      <TouchableOpacity onPress={()=>adBottom.link_url&&Linking.openURL(adBottom.link_url)}
        style={{backgroundColor:T.card,borderTopWidth:1,borderTopColor:T.border,padding:6,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:8}}>
        <Text style={{fontSize:9,color:T.sub}}>AD</Text>
        {adBottom.image_url?
          <Image source={{uri:adBottom.image_url}} style={{height:40,width:width-60,borderRadius:6}} resizeMode="cover"/>:
          <Text style={{color:T.text,fontSize:12,fontWeight:'600'}}>{adBottom.name}</Text>
        }
      </TouchableOpacity>
    );
  };

  const NavBar = () => (
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:12,backgroundColor:T.navBg,borderBottomWidth:1,borderBottomColor:T.border}}>
      <TouchableOpacity onPress={()=>setShowMenu(true)} style={{padding:4,gap:4}}>
        <View style={{height:2,width:22,backgroundColor:T.text}}/>
        <View style={{height:2,width:22,backgroundColor:T.text}}/>
        <View style={{height:2,width:22,backgroundColor:T.text}}/>
      </TouchableOpacity>
      <TouchableOpacity onPress={goHome} style={{flexDirection:'row',alignItems:'center',gap:8}}>
        <Image source={{uri:LOGO_URI}} style={{width:28,height:28,borderRadius:6}} />
        <Text style={{fontSize:17,fontWeight:'900',color:T.text}}>Fahr<Text style={{color:T.accent}}>Ready</Text></Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>setShowTheme(true)} style={{width:34,height:34,borderRadius:17,backgroundColor:T.blue,alignItems:'center',justifyContent:'center'}}>
        <Text style={{fontSize:15}}>🎨</Text>
      </TouchableOpacity>
    </View>
  );

  const AdBanner = ({ad}) => {
    if(!ad) return null;
    return (
      <TouchableOpacity onPress={()=>ad.link_url&&Linking.openURL(ad.link_url)} style={{margin:12,borderRadius:10,overflow:'hidden',borderWidth:1,borderColor:T.border}}>
        <Text style={{fontSize:9,color:T.sub,textAlign:'center',paddingTop:4}}>Werbung</Text>
        {ad.image_url?<Image source={{uri:ad.image_url}} style={{width:'100%',height:80}} resizeMode="cover"/>:
        <View style={{padding:12,backgroundColor:T.card}}><Text style={{color:T.text,fontSize:12,textAlign:'center'}}>{ad.name}</Text></View>}
      </TouchableOpacity>
    );
  };

  // ── LOGOUT OVERLAY (global - must be before all screens) ──
  if (logoutStep > 0) {
    return (
      <View style={{flex:1,backgroundColor:T.bg}}>
        <SafeAreaView style={{flex:1,justifyContent:'center',alignItems:'center',padding:30,backgroundColor:'rgba(0,0,0,0.85)'}}>
          <View style={{backgroundColor:T.card,borderRadius:20,padding:28,width:'100%',borderWidth:1,borderColor:T.border}}>
            {logoutStep===1 ? (
              <>
                <Text style={{fontSize:32,textAlign:'center',marginBottom:10}}>🚪</Text>
                <Text style={{color:T.text,fontSize:20,fontWeight:'900',textAlign:'center',marginBottom:4}}>Abmelden?</Text>
                <Text style={{color:T.sub,fontSize:13,textAlign:'center',marginBottom:24}}>Moechten Sie sich wirklich abmelden?</Text>
                <View style={{flexDirection:'row',gap:12}}>
                  <TouchableOpacity style={{flex:1,backgroundColor:T.bg,borderRadius:12,padding:14,alignItems:'center',borderWidth:1,borderColor:T.border}} onPress={()=>setLogoutStep(0)}>
                    <Text style={{color:T.text,fontWeight:'700'}}>❌ Nein</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{flex:1,backgroundColor:'#F59E0B',borderRadius:12,padding:14,alignItems:'center'}} onPress={()=>setLogoutStep(2)}>
                    <Text style={{color:'#fff',fontWeight:'700'}}>⚠️ Ja</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={{fontSize:32,textAlign:'center',marginBottom:10}}>✋</Text>
                <Text style={{color:'#DC2626',fontSize:20,fontWeight:'900',textAlign:'center',marginBottom:4}}>Wirklich sicher?</Text>
                <Text style={{color:T.sub,fontSize:13,textAlign:'center',marginBottom:24}}>Diese Aktion kann nicht rueckgaengig gemacht werden.</Text>
                <View style={{flexDirection:'row',gap:12}}>
                  <TouchableOpacity style={{flex:1,backgroundColor:T.bg,borderRadius:12,padding:14,alignItems:'center',borderWidth:1,borderColor:T.border}} onPress={()=>setLogoutStep(0)}>
                    <Text style={{color:T.text,fontWeight:'700'}}>❌ Abbrechen</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{flex:1,backgroundColor:'#DC2626',borderRadius:12,padding:14,alignItems:'center'}} onPress={()=>{setLogoutStep(0);setUser(null);goHome();}}>
                    <Text style={{color:'#fff',fontWeight:'700'}}>🚪 Abmelden</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── HOME ──
  if(screen==='home') return (
    <View style={{flex:1,backgroundColor:T.bg}}>
      <View style={{flex:1,paddingTop:STATUS_BAR_HEIGHT}}>
        <StatusBar translucent={false} barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg}/>
        <NavBar/>
        <ScrollView showsVerticalScrollIndicator={false}>
          {adTop&&<AdBanner ad={adTop}/>}
          <View style={{padding:20}}>
            {user&&<Text style={{color:T.accent,fontSize:14,fontWeight:'600',marginBottom:8}}>{t.hello}, {user.full_name?.split(' ')[0]}! {user.is_premium?'⭐':''}</Text>}
            <Text style={{fontSize:28,fontWeight:'900',color:T.text,marginBottom:6}}>Bestehe deine <Text style={{color:T.accent}}>Fahrprüfung</Text></Text>
            <Text style={{fontSize:12,color:T.sub,marginBottom:20}}>Persisch · Azerbaijanisch · Deutsch · Englisch</Text>
            <View style={{flexDirection:'row',gap:8,marginBottom:20}}>
              {[['50',t.questions],['45',t.minutes],['135',t.points],['4','Sprachen']].map(([n,l])=>(
                <View key={l} style={{flex:1,backgroundColor:T.card,borderRadius:10,padding:10,alignItems:'center',borderWidth:1,borderColor:T.border}}>
                  <Text style={{fontSize:20,fontWeight:'900',color:T.text}}>{n}</Text>
                  <Text style={{fontSize:9,color:T.sub,textAlign:'center'}}>{l}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:12,padding:15,alignItems:'center',marginBottom:10}} onPress={()=>startExam(false)}>
              <Text style={{color:'#fff',fontSize:15,fontWeight:'800'}}>{t.start}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{backgroundColor:T.card,borderRadius:12,padding:14,alignItems:'center',marginBottom:10,borderWidth:1,borderColor:T.border}} onPress={()=>startExam(true)}>
              <Text style={{color:T.text,fontSize:14,fontWeight:'700'}}>{t.learn}</Text>
            </TouchableOpacity>
            {!user&&<TouchableOpacity style={{borderRadius:12,padding:12,alignItems:'center',borderWidth:1,borderColor:T.border,marginBottom:10}} onPress={()=>setScreen('register')}>
              <Text style={{color:T.sub,fontSize:13}}>✓ Kostenlos registrieren</Text>
            </TouchableOpacity>}
            <TouchableOpacity style={{borderRadius:12,padding:12,alignItems:'center',borderWidth:1,borderColor:T.border}} onPress={()=>Linking.openURL(WEBSITE)}>
              <Text style={{color:T.accent,fontSize:13,fontWeight:'600'}}>{t.website}</Text>
            </TouchableOpacity>
          </View>
          {news.slice(0,3).map((n,i)=>(
            <View key={i} style={{marginHorizontal:16,marginBottom:10,backgroundColor:T.card,borderRadius:12,overflow:'hidden',borderWidth:1,borderColor:T.border}}>
              {n.image_url&&<Image source={{uri:n.image_url}} style={{width:'100%',height:110}} resizeMode="cover"/>}
              <View style={{padding:12}}>
                <Text style={{color:T.accent,fontSize:10,fontWeight:'700'}}>{n.tag||'NEU'}</Text>
                <Text style={{color:T.text,fontSize:13,fontWeight:'600',marginTop:2}}>{n['title_'+lang]||n.title_de}</Text>
              </View>
            </View>
          ))}
          {adBottom&&<AdBanner ad={adBottom}/>}
          <View style={{height:40}}/>
        </ScrollView>
      </SafeAreaView>
      <BottomAd/>
      {MenuOverlay}
      {ThemeOverlay}
    </View>
  );

  // ── LOGIN / REGISTER ──
  if(screen==='login'||screen==='register') {
    const isReg=screen==='register';
    return (
      <View style={{flex:1,backgroundColor:T.bg}}>
        <SafeAreaView style={{flex:1}}>
          <StatusBar barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg}/>
          <NavBar/>
          <ScrollView contentContainerStyle={{padding:24,flexGrow:1}}>
            <TouchableOpacity style={{marginBottom:20}} onPress={goHome}><Text style={{color:T.accent,fontSize:14}}>{t.back}</Text></TouchableOpacity>
            <Text style={{fontSize:24,fontWeight:'900',color:T.text,marginBottom:20}}>{isReg?t.register:t.login}</Text>

            {/* Mode toggle - Email / Phone */}
            <View style={{flexDirection:'row',backgroundColor:T.card,borderRadius:12,padding:4,marginBottom:20,borderWidth:1,borderColor:T.border}}>
              <TouchableOpacity style={{flex:1,padding:10,alignItems:'center',borderRadius:10,backgroundColor:loginMode==='email'?T.blue:'transparent'}} onPress={()=>{setLoginMode('email');setOtpSent(false);}}>
                <Text style={{color:loginMode==='email'?'#fff':T.sub,fontWeight:'700',fontSize:13}}>📧 E-Mail</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{flex:1,padding:10,alignItems:'center',borderRadius:10,backgroundColor:loginMode==='phone'?T.blue:'transparent'}} onPress={()=>{setLoginMode('phone');setOtpSent(false);}}>
                <Text style={{color:loginMode==='phone'?'#fff':T.sub,fontWeight:'700',fontSize:13}}>📱 Telefon / تلفن</Text>
              </TouchableOpacity>
            </View>

            {loginMode==='phone' ? (
              <View>
                {!otpSent ? (
                  <View>
                    <Text style={{color:T.sub,fontSize:12,marginBottom:8}}>Format: +41791234567 / +49...</Text>
                    <TextInput style={{borderWidth:1.5,borderColor:T.border,borderRadius:10,padding:13,fontSize:15,marginBottom:16,color:T.text,backgroundColor:T.card}} placeholder="+41 79 123 45 67" placeholderTextColor={T.sub} value={phone} onChangeText={setPhone} keyboardType="phone-pad"/>
                    <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:12,padding:15,alignItems:'center'}} disabled={otpLoading} onPress={sendOtp}>
                      {otpLoading?<ActivityIndicator color="#fff"/>:<Text style={{color:'#fff',fontSize:15,fontWeight:'800'}}>📱 SMS Code senden</Text>}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <Text style={{color:T.sub,fontSize:13,marginBottom:12,textAlign:'center'}}>Code an {phone} gesendet</Text>
                    <TextInput style={{borderWidth:1.5,borderColor:T.border,borderRadius:10,padding:13,fontSize:22,marginBottom:16,color:T.text,backgroundColor:T.card,textAlign:'center',letterSpacing:10}} placeholder="------" placeholderTextColor={T.sub} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6}/>
                    <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:12,padding:15,alignItems:'center',marginBottom:10}} disabled={loading} onPress={verifyOtp}>
                      {loading?<ActivityIndicator color="#fff"/>:<Text style={{color:'#fff',fontSize:15,fontWeight:'800'}}>✓ Code bestätigen</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>{setOtpSent(false);setOtp('');}} style={{padding:10,alignItems:'center'}}>
                      <Text style={{color:T.sub,fontSize:13}}>← Nummer ändern</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <View>
                {isReg&&<TextInput style={{borderWidth:1.5,borderColor:T.border,borderRadius:10,padding:13,fontSize:13,marginBottom:12,color:T.text,backgroundColor:T.card}} placeholder="Vollstaendiger Name" placeholderTextColor={T.sub} value={fullName} onChangeText={setFullName}/>}
                <TextInput style={{borderWidth:1.5,borderColor:T.border,borderRadius:10,padding:13,fontSize:13,marginBottom:12,color:T.text,backgroundColor:T.card}} placeholder="E-Mail" placeholderTextColor={T.sub} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
                <View style={{flexDirection:'row',alignItems:'center',borderWidth:1.5,borderColor:T.border,borderRadius:10,marginBottom:20,backgroundColor:T.card}}>
                  <TextInput style={{flex:1,padding:13,fontSize:13,color:T.text}} placeholder="Passwort" placeholderTextColor={T.sub} value={password} onChangeText={setPassword} secureTextEntry={!showPass}/>
                  <TouchableOpacity onPress={()=>setShowPass(p=>!p)} style={{padding:13}}>
                    <Text style={{fontSize:16}}>{showPass?'👁️':'🙈'}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:12,padding:15,alignItems:'center'}} disabled={loading} onPress={async()=>{
                  if(!email||!password){Alert.alert('Fehler','E-Mail und Passwort eingeben');return;}
                  setLoading(true);
                  if(isReg){
                    const ph=await hashPwd(password);
                    const r=await sbReq('users','POST',{email,password_hash:ph,full_name:fullName||email,language:lang,is_premium:false,created_at:new Date().toISOString()});
                    if(r.ok&&Array.isArray(r.data)&&r.data[0]){setUser(r.data[0]);setScreen('home');Alert.alert('Willkommen!','Hallo '+r.data[0].full_name+'!');}
                    else Alert.alert('Fehler','E-Mail bereits vorhanden?');
                  }else{
                    const ph2=await hashPwd(password);
                    const r=await sbReq(`users?email=eq.${encodeURIComponent(email)}&password_hash=eq.${ph2}`);
                    if(r.ok&&Array.isArray(r.data)&&r.data[0]){setUser(r.data[0]);setScreen('home');Alert.alert('Willkommen zurueck!','Hallo '+r.data[0].full_name+'!');}
                    else Alert.alert('Fehler','Falsche E-Mail oder Passwort');
                  }
                  setLoading(false);
                }}>
                  {loading?<ActivityIndicator color="#fff"/>:<Text style={{color:'#fff',fontSize:15,fontWeight:'800'}}>{isReg?t.register:t.login}</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setScreen(isReg?'login':'register')} style={{marginTop:16,padding:12}}>
                  <Text style={{color:T.accent,textAlign:'center',fontWeight:'600'}}>{isReg?t.login+' →':'Registrieren →'}</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={()=>{setUser({id:'anon',email:'',full_name:t.guest,is_premium:false,isAnon:true});setScreen('home');}} style={{marginTop:16,padding:12}}>
              <Text style={{color:T.sub,textAlign:'center',fontSize:13}}>👤 {t.guest} / Als Gast fortfahren</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>Linking.openURL('https://fahrready.ch/privacy.html')} style={{marginTop:8,padding:8}}>
              <Text style={{color:T.sub,textAlign:'center',fontSize:11}}>🔒 Datenschutz / حریم خصوصی</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
        {MenuOverlay}{ThemeOverlay}
      </View>
    );
  }


  // ── PROFILE ──
  if(screen==='profile') return (
    <View style={{flex:1,backgroundColor:T.bg}}>
      <View style={{flex:1,paddingTop:STATUS_BAR_HEIGHT}}>
        <StatusBar translucent={false} barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg}/>
        <NavBar/>
        <ScrollView contentContainerStyle={{padding:20}}>
          <TouchableOpacity style={{marginBottom:16}} onPress={goHome}><Text style={{color:T.accent,fontSize:14}}>{t.back}</Text></TouchableOpacity>
          <Text style={{fontSize:22,fontWeight:'900',color:T.text,marginBottom:20}}>👤 {t.profile}</Text>
          {user?(
            <View>
              {/* Avatar & Name */}
              <View style={{alignItems:'center',marginBottom:24}}>
                <View style={{width:72,height:72,borderRadius:36,backgroundColor:T.blue,alignItems:'center',justifyContent:'center',marginBottom:10}}>
                  <Text style={{fontSize:30,color:'#fff',fontWeight:'900'}}>{user.full_name?.[0]?.toUpperCase()||'U'}</Text>
                </View>
                <Text style={{color:T.text,fontSize:18,fontWeight:'800'}}>{user.full_name}</Text>
                <Text style={{color:T.sub,fontSize:12,marginTop:2}}>{user.email}</Text>
                {user.is_premium&&<View style={{backgroundColor:'#F59E0B22',borderRadius:20,paddingHorizontal:12,paddingVertical:4,marginTop:6}}><Text style={{color:'#F59E0B',fontSize:12,fontWeight:'700'}}>⭐ Premium</Text></View>}
              </View>

              {/* İsim Değiştir */}
              <View style={{backgroundColor:T.card,borderRadius:14,padding:16,marginBottom:12,borderWidth:1,borderColor:T.border}}>
                <Text style={{color:T.sub,fontSize:11,fontWeight:'600',marginBottom:8}}>✏️ İsim Değiştir / Name ändern</Text>
                <TextInput style={{borderWidth:1,borderColor:T.border,borderRadius:10,padding:12,color:T.text,backgroundColor:T.bg,fontSize:14,marginBottom:10}} value={editName} onChangeText={setEditName} placeholder={user.full_name} placeholderTextColor={T.sub}/>
                <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:10,padding:11,alignItems:'center'}} onPress={async()=>{
                  if(!editName.trim()){Alert.alert('Fehler','Name eingeben');return;}
                  const r=await sbReq(`users?id=eq.${user.id}`,'PATCH',{full_name:editName.trim()});
                  if(r.ok){setUser({...user,full_name:editName.trim()});Alert.alert('✓','Name gespeichert!');}
                  else Alert.alert('Fehler','Speichern fehlgeschlagen');
                }}>
                  <Text style={{color:'#fff',fontWeight:'700'}}>💾 Speichern</Text>
                </TouchableOpacity>
              </View>

              {/* Premium */}
              {!user.is_premium&&(
                <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:14,padding:14,alignItems:'center',marginBottom:12}} onPress={()=>setScreen('premium')}>
                  <Text style={{color:'#fff',fontWeight:'800'}}>⭐ Premium kaufen</Text>
                </TouchableOpacity>
              )}

              {/* Hesaptan Çık */}
              <TouchableOpacity style={{backgroundColor:T.card,borderRadius:14,padding:14,alignItems:'center',marginBottom:10,borderWidth:1.5,borderColor:'#F59E0B'}} onPress={()=>setLogoutStep(1)}>
                <Text style={{color:'#F59E0B',fontWeight:'800',fontSize:15}}>🚪 Hesaptan Çık / Abmelden</Text>
              </TouchableOpacity>

              {/* Hesabı Sil */}
              <TouchableOpacity style={{backgroundColor:'#FEF2F2',borderRadius:14,padding:14,alignItems:'center',borderWidth:1.5,borderColor:'#DC2626'}} onPress={deleteAccount}>
                <Text style={{color:'#DC2626',fontWeight:'800',fontSize:15}}>🗑️ Hesabı Sil / Konto löschen</Text>
              </TouchableOpacity>
            </View>
          ):(
            <View style={{gap:12}}>
              <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:12,padding:15,alignItems:'center'}} onPress={()=>setScreen('login')}>
                <Text style={{color:'#fff',fontWeight:'800'}}>{t.login}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{backgroundColor:T.card,borderRadius:12,padding:15,alignItems:'center',borderWidth:1,borderColor:T.border}} onPress={()=>setScreen('register')}>
                <Text style={{color:T.text,fontWeight:'700'}}>{t.register}</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{height:40}}/>
        </ScrollView>
      </SafeAreaView>
      {MenuOverlay}{ThemeOverlay}{LogoutOverlay}
    </View>
  );

  // ── CALENDAR ──
  if(screen==='calendar') return (
    <View style={{flex:1,backgroundColor:T.bg}}>
      <View style={{flex:1,paddingTop:STATUS_BAR_HEIGHT}}>
        <StatusBar translucent={false} barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg}/>
        <NavBar/>
        <ScrollView contentContainerStyle={{padding:20}}>
          <TouchableOpacity style={{marginBottom:20}} onPress={goHome}><Text style={{color:T.accent,fontSize:14}}>{t.back}</Text></TouchableOpacity>
          <Text style={{fontSize:22,fontWeight:'900',color:T.text,marginBottom:20}}>📅 {t.calendar}</Text>
          <View style={{backgroundColor:T.card,borderRadius:16,padding:20,marginBottom:20,borderWidth:1,borderColor:T.border}}>
            <Text style={{color:T.text,fontSize:16,fontWeight:'800',marginBottom:16}}>📅 Neuer Termin</Text>
            <Text style={{color:T.sub,fontSize:11,marginBottom:4}}>Titel</Text>
            <TextInput style={{borderWidth:1,borderColor:T.border,borderRadius:10,padding:12,color:T.text,backgroundColor:T.bg,marginBottom:12,fontSize:13}} placeholder="z.B. Führerausweis Prüfung" placeholderTextColor={T.sub} value={calTitle} onChangeText={setCalTitle}/>
            <View style={{flexDirection:'row',gap:10,marginBottom:12}}>
              <View style={{flex:1}}>
                <Text style={{color:T.sub,fontSize:11,marginBottom:4}}>Datum</Text>
                <TextInput style={{borderWidth:1,borderColor:T.border,borderRadius:10,padding:12,color:T.text,backgroundColor:T.bg,fontSize:13}} placeholder="DD.MM.YYYY" placeholderTextColor={T.sub} value={calDate} onChangeText={setCalDate} keyboardType="numbers-and-punctuation"/>
              </View>
              <View style={{flex:1}}>
                <Text style={{color:T.sub,fontSize:11,marginBottom:4}}>Uhrzeit</Text>
                <TextInput style={{borderWidth:1,borderColor:T.border,borderRadius:10,padding:12,color:T.text,backgroundColor:T.bg,fontSize:13}} placeholder="HH:MM" placeholderTextColor={T.sub} value={calTime} onChangeText={setCalTime} keyboardType="numbers-and-punctuation"/>
              </View>
            </View>
            <Text style={{color:T.sub,fontSize:11,marginBottom:8}}>🔔 Klingelton</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:14}}>
              {[
                {name:'🔔 Standard', desc:'Standard Klingelton'},
                {name:'🎵 Melodie', desc:'Melodie'},
                {name:'📯 Trompete', desc:'Laut & klar'},
                {name:'🔊 Laut', desc:'Sehr laut'},
                {name:'🎶 Sanft', desc:'Sanfte Musik'},
              ].map((r,i)=>(
                <TouchableOpacity key={i} onPress={()=>{
                    setCalRingtone(r.name);
                    playRingtone(r.name);
                  }}
                  style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,marginRight:8,borderWidth:1.5,borderColor:calRingtone===r.name?T.blue:T.border,backgroundColor:calRingtone===r.name?T.blue+'22':'transparent'}}>
                  <Text style={{color:calRingtone===r.name?T.blue:T.sub,fontSize:12,fontWeight:'600'}}>{r.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:12,padding:14,alignItems:'center'}} onPress={()=>{
              if(!calDate){Alert.alert('Fehler','Datum eingeben');return;}
              const ev={id:Date.now().toString(),title:calTitle||'Prüfung',date:calDate,time:calTime||'06:00',ringtone:calRingtone,enabled:true};
              setCalendar(p=>[...p,ev]);
              setCalDate('');setCalTime('06:00');setCalTitle('Führerausweis Prüfung');setCalRingtone('🔔 Standard');
              Alert.alert('✓','Termin gespeichert! Sie werden um '+calTime+' Uhr erinnert.');
            }}>
              <Text style={{color:'#fff',fontWeight:'800'}}>💾 Termin speichern</Text>
            </TouchableOpacity>
          </View>
          {calendar.length===0?(
            <View style={{alignItems:'center',paddingVertical:40}}>
              <Text style={{fontSize:40,marginBottom:10}}>📅</Text>
              <Text style={{color:T.sub,textAlign:'center'}}>Keine Termine vorhanden</Text>
            </View>
          ):calendar.map(ev=>(
            <View key={ev.id} style={{backgroundColor:T.card,borderRadius:16,padding:16,marginBottom:12,borderWidth:1,borderColor:ev.enabled!==false?T.blue+'44':T.border}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
                <View style={{flex:1}}>
                  <Text style={{color:T.text,fontSize:15,fontWeight:'700'}}>{ev.title}</Text>
                  <View style={{flexDirection:'row',gap:12,marginTop:8}}>
                    <Text style={{color:T.accent,fontSize:12}}>📅 {ev.date}</Text>
                    <Text style={{color:T.accent,fontSize:12}}>⏰ {ev.time}</Text>
                    <Text style={{color:T.sub,fontSize:12}}>{ev.ringtone||'🔔 Standard'}</Text>
                  </View>
                </View>
                <View style={{flexDirection:'row',gap:8}}>
                  <TouchableOpacity onPress={()=>setCalendar(p=>p.map(e=>e.id===ev.id?{...e,enabled:!e.enabled}:e))}
                    style={{backgroundColor:ev.enabled!==false?T.blue:'#9CA3AF',borderRadius:8,paddingHorizontal:10,paddingVertical:6}}>
                    <Text style={{color:'#fff',fontSize:11,fontWeight:'700'}}>{ev.enabled!==false?'AN':'AUS'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>{
                    Alert.alert('Löschen?',ev.title+' löschen?',[
                      {text:'Nein',style:'cancel'},
                      {text:'Löschen',style:'destructive',onPress:()=>setCalendar(p=>p.filter(e=>e.id!==ev.id))}
                    ]);
                  }} style={{backgroundColor:'#DC2626',borderRadius:8,paddingHorizontal:10,paddingVertical:6}}>
                    <Text style={{color:'#fff',fontSize:11,fontWeight:'700'}}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          <View style={{height:40}}/>
        </ScrollView>
      </SafeAreaView>
      {MenuOverlay}{ThemeOverlay}{LogoutOverlay}
    </View>
  );

  // ── NEWS ──
  if(screen==='news') return (
    <View style={{flex:1,backgroundColor:T.bg}}>
      <View style={{flex:1,paddingTop:STATUS_BAR_HEIGHT}}>
        <StatusBar translucent={false} barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg}/>
        <NavBar/>
        <ScrollView contentContainerStyle={{padding:20}}>
          <TouchableOpacity style={{marginBottom:20}} onPress={goHome}><Text style={{color:T.accent,fontSize:14}}>{t.back}</Text></TouchableOpacity>
          <Text style={{fontSize:22,fontWeight:'900',color:T.text,marginBottom:20}}>📰 {t.news}</Text>
          {news.map((n,i)=>(
            <View key={i} style={{backgroundColor:T.card,borderRadius:12,overflow:'hidden',marginBottom:12,borderWidth:1,borderColor:T.border}}>
              {n.image_url&&<Image source={{uri:n.image_url}} style={{width:'100%',height:130}} resizeMode="cover"/>}
              <View style={{padding:12}}>
                <Text style={{color:T.accent,fontSize:10,fontWeight:'700'}}>{n.tag||'NEU'}</Text>
                <Text style={{color:T.text,fontSize:13,fontWeight:'600',marginTop:4}}>{n['title_'+lang]||n.title_de}</Text>
                {n['content_'+lang]&&<Text style={{color:T.sub,fontSize:12,marginTop:6,lineHeight:18}}>{n['content_'+lang]}</Text>}
              </View>
            </View>
          ))}
          {news.length===0&&<Text style={{color:T.sub,textAlign:'center'}}>Keine Nachrichten</Text>}
          <View style={{height:40}}/>
        </ScrollView>
      </SafeAreaView>
      {MenuOverlay}{ThemeOverlay}{LogoutOverlay}
    </View>
  );

  // ── PREMIUM ──
  if(screen==='premium') return (
    <View style={{flex:1,backgroundColor:T.bg}}>
      <View style={{flex:1,paddingTop:STATUS_BAR_HEIGHT}}>
        <StatusBar translucent={false} barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg}/>
        <NavBar/>
        <ScrollView contentContainerStyle={{padding:24,alignItems:'center'}}>
          <Text style={{fontSize:52,marginTop:10,marginBottom:8}}>⭐</Text>
          <Text style={{fontSize:22,fontWeight:'900',color:T.text,marginBottom:6}}>Premium</Text>
          <Text style={{fontSize:13,color:T.sub,textAlign:'center',marginBottom:20}}>Unbegrenzter Zugang zu allen Fragen</Text>
          <View style={{flexDirection:'row',gap:10,marginBottom:20,width:'100%'}}>
            <View style={{flex:1,backgroundColor:T.card,borderRadius:14,padding:16,alignItems:'center',borderWidth:1,borderColor:T.border}}>
              <Text style={{color:T.text,fontSize:13,fontWeight:'700'}}>Monatlich</Text>
              <Text style={{color:T.accent,fontSize:26,fontWeight:'900',marginTop:4}}>CHF 9</Text>
              <Text style={{color:T.sub,fontSize:11}}>/Monat</Text>
            </View>
            <View style={{flex:1,backgroundColor:T.blue,borderRadius:14,padding:16,alignItems:'center'}}>
              <Text style={{color:'#fff',fontSize:13,fontWeight:'700'}}>Jährlich ⭐</Text>
              <Text style={{color:'#fff',fontSize:26,fontWeight:'900',marginTop:4}}>CHF 29</Text>
              <Text style={{color:'rgba(255,255,255,0.7)',fontSize:11}}>/Jahr</Text>
            </View>
          </View>
          <TextInput style={{borderWidth:1.5,borderColor:T.border,borderRadius:10,padding:13,fontSize:13,marginBottom:12,color:T.text,backgroundColor:T.card,width:'100%'}} placeholder="E-Mail" placeholderTextColor={T.sub} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
          <TouchableOpacity style={{backgroundColor:'#635BFF',borderRadius:12,padding:14,alignItems:'center',width:'100%',marginBottom:10}} onPress={()=>stripeCheckout('price_1TgMzP0VonCoGUqlWZ6pYNOK')}>
            <Text style={{color:'#fff',fontSize:14,fontWeight:'800'}}>💳 Monatlich — CHF 9</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:12,padding:14,alignItems:'center',width:'100%',marginBottom:20}} onPress={()=>stripeCheckout('price_1TgMzy0VonCoGUqlOfHZ5xR5')}>
            <Text style={{color:'#fff',fontSize:14,fontWeight:'800'}}>⭐ Jährlich — CHF 29</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{padding:12}} onPress={goHome}>
            <Text style={{color:T.sub,fontSize:13}}>{t.back}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      {MenuOverlay}{ThemeOverlay}{LogoutOverlay}
    </View>
  );

  // ── EXAM ──
  if(screen==='exam'&&curQ) {
    const opts=curQ.opts||[];
    const isMulti=curQ.is_multi||opts.filter(o=>o.ok).length>1;
    const pct=Math.round((qIdx/Math.max(examQ.length,1))*100);
    const qSub=lang!=='de'&&curQ['text_'+lang]?curQ['text_'+lang]:null;
    return (
      <View style={{flex:1,backgroundColor:T.bg}}>
        <SafeAreaView style={{flex:1}}>
          <StatusBar barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg}/>
          <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:10,backgroundColor:T.navBg,borderBottomWidth:1,borderBottomColor:T.border}}>
            <TouchableOpacity onPress={goHome}><Text style={{fontSize:18,color:T.sub,fontWeight:'700'}}>✕</Text></TouchableOpacity>
            <View style={{alignItems:'center'}}>
              <Text style={{fontSize:14,fontWeight:'700',color:T.text}}>{qIdx+1} / {Math.min(examQ.length,isPractice?examQ.length:50)}</Text>
              <Text style={{fontSize:10,color:T.sub}}>{isPractice?'📚 Übung':'📝 Prüfung'}</Text>
            </View>
            {!isPractice?<Text style={{fontSize:14,fontWeight:'700',color:T.accent}}>{formatTime(timeLeft)}</Text>:<View style={{width:40}}/>}
          </View>
          <View style={{height:4,backgroundColor:T.border}}><View style={{height:4,backgroundColor:T.blue,width:`${pct}%`}}/></View>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,paddingVertical:8,backgroundColor:T.navBg,borderBottomWidth:1,borderBottomColor:T.border}}>
            <View style={{flexDirection:'row',gap:16}}>
              <Text style={{fontSize:13,fontWeight:'700',color:'#16A34A'}}>✓ {score}</Text>
              <Text style={{fontSize:13,fontWeight:'700',color:'#DC2626'}}>✗ {errors}</Text>
              {!isPractice&&<Text style={{fontSize:13,fontWeight:'700',color:T.text}}>Pkt: {score*3}/150</Text>}
            </View>
            <TouchableOpacity
              onPress={()=>{
                if(user?.is_premium){finishExam();setTimeout(()=>setScreen('analysis'),100);}
                else{setScreen('premium');}
              }}
              style={{backgroundColor:'#7C3AED',borderRadius:8,paddingHorizontal:10,paddingVertical:4}}>
              <Text style={{color:'#fff',fontSize:11,fontWeight:'700'}}>{user?.is_premium?'🤖 AI':'🤖 AI ⭐'}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{flex:1}} contentContainerStyle={{padding:16}}>
            <Animated.View style={{opacity:fadeAnim}}>
              {curQ.img_url?<Image source={{uri:curQ.img_url}} style={{width:'100%',height:180,borderRadius:12,marginBottom:14,backgroundColor:T.card}} resizeMode="contain"/>:null}
              {isMulti&&!answered&&<View style={{backgroundColor:'#FEF9E7',borderRadius:8,padding:8,marginBottom:10,borderWidth:1,borderColor:'#F59E0B'}}><Text style={{color:'#92700A',fontSize:12,fontWeight:'600',textAlign:'center'}}>⚠️ Mehrere Antworten möglich</Text></View>}
              <Text style={{fontSize:16,fontWeight:'800',color:T.text,marginBottom:qSub?4:14,lineHeight:24}}>{curQ.text_de}</Text>
              {qSub&&<Text style={{fontSize:13,color:T.sub,marginBottom:14,lineHeight:20}}>{qSub}</Text>}
              {opts.map((opt,i)=>{
                let bg=T.card,bc=T.border,tc=T.text;
                const sel=selectedOpts.includes(i);
                if(answered){
                  if(opt.ok){bg='#DCFCE7';bc='#16A34A';tc='#16A34A';}
                  else if(sel){bg='#FEF2F2';bc='#DC2626';tc='#DC2626';}
                } else if(sel){bc=T.blue;bg=T.blue+'22';}
                const optSub=lang!=='de'&&opt['text_'+lang]?opt['text_'+lang]:null;
                return (
                  <TouchableOpacity key={i} onPress={()=>pickAnswer(i)} disabled={answered}
                    style={{flexDirection:'row',alignItems:'center',gap:10,padding:13,backgroundColor:bg,borderRadius:12,marginBottom:8,borderWidth:1.5,borderColor:bc}}>
                    <View style={{width:26,height:26,borderRadius:13,backgroundColor:T.bg,alignItems:'center',justifyContent:'center'}}>
                      <Text style={{fontSize:11,fontWeight:'700',color:T.text}}>{['A','B','C','D'][i]}</Text>
                    </View>
                    <View style={{flex:1}}>
                      <Text style={{fontSize:13,color:tc,fontWeight:'500'}}>{opt.text_de}</Text>
                      {optSub&&<Text style={{fontSize:11,color:T.sub,marginTop:2}}>{optSub}</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
              {!answered&&selectedOpts.length>0&&(
                <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:12,padding:13,alignItems:'center',marginBottom:8}} onPress={submitAnswer}>
                  <Text style={{color:'#fff',fontWeight:'800'}}>{t.confirm}</Text>
                </TouchableOpacity>
              )}
              {answered&&(
                <View>
                  <View style={{borderRadius:10,padding:12,marginBottom:10,backgroundColor:results[results.length-1]?.correct?'#DCFCE7':'#FEF2F2'}}>
                    <Text style={{fontSize:14,fontWeight:'800',textAlign:'center',color:results[results.length-1]?.correct?'#16A34A':'#DC2626'}}>
                      {results[results.length-1]?.correct?t.correct:t.wrong}
                    </Text>
                    {!results[results.length-1]?.correct&&<Text style={{fontSize:12,color:'#16A34A',textAlign:'center',marginTop:4}}>✓ {opts.filter(o=>o.ok).map(o=>o.text_de).join(' + ')}</Text>}
                  </View>
                  <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:12,padding:13,alignItems:'center'}} onPress={nextQ}>
                    <Text style={{color:'#fff',fontSize:14,fontWeight:'800'}}>{t.next}</Text>
                  </TouchableOpacity>
                </View>
              )}
              <View style={{height:40}}/>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
        {MenuOverlay}{ThemeOverlay}
      </View>
    );
  }

  // ── RESULT ──
  if(screen==='result') {
    const total=results.length,correct=results.filter(r=>r.correct).length;
    const pts=correct*3,passed=!isPractice&&pts>=135;
    return (
      <View style={{flex:1,backgroundColor:T.bg}}>
        <SafeAreaView style={{flex:1}}>
          <StatusBar barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg}/>
          <NavBar/>
          <ScrollView contentContainerStyle={{padding:24,alignItems:'center'}}>
            <Text style={{fontSize:52,marginTop:10,marginBottom:8}}>{isPractice?'🎓':passed?'🏆':'😔'}</Text>
            <Text style={{fontSize:22,fontWeight:'900',color:T.text,marginBottom:6,textAlign:'center'}}>{isPractice?'Übung abgeschlossen!':passed?t.passed:t.failed}</Text>
            {!isPractice&&<Text style={{fontSize:18,fontWeight:'700',marginBottom:16,color:passed?'#16A34A':'#DC2626'}}>{pts}/150 Punkte</Text>}
            <View style={{flexDirection:'row',gap:10,marginBottom:20}}>
              {[[total,'Gesamt',T.blue],[correct,'Richtig','#16A34A'],[total-correct,'Falsch','#DC2626']].map(([n,l,col])=>(
                <View key={l} style={{backgroundColor:T.card,borderRadius:12,padding:14,alignItems:'center',minWidth:80,borderWidth:1,borderColor:T.border}}>
                  <Text style={{fontSize:22,fontWeight:'900',color:col}}>{n}</Text>
                  <Text style={{fontSize:10,color:T.sub}}>{l}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:12,padding:13,alignItems:'center',width:'100%',marginBottom:10}} onPress={()=>startExam(isPractice)}>
              <Text style={{color:'#fff',fontWeight:'700'}}>{t.again}</Text>
            </TouchableOpacity>
            {user?.is_premium ? (
              <TouchableOpacity style={{backgroundColor:'#7C3AED',borderRadius:12,padding:13,alignItems:'center',width:'100%',marginBottom:10}} onPress={()=>setScreen('analysis')}>
                <Text style={{color:'#fff',fontWeight:'700'}}>🤖 KI-Analyse (Premium)</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={{backgroundColor:'#7C3AED44',borderRadius:12,padding:13,alignItems:'center',width:'100%',marginBottom:10,borderWidth:1,borderColor:'#7C3AED'}} onPress={()=>setScreen('premium')}>
                <Text style={{color:'#7C3AED',fontWeight:'700'}}>🤖 KI-Analyse — ⭐ Premium</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={{backgroundColor:T.card,borderRadius:12,padding:13,alignItems:'center',width:'100%',borderWidth:1,borderColor:T.border}} onPress={goHome}>
              <Text style={{color:T.text,fontWeight:'700'}}>{t.back}</Text>
            </TouchableOpacity>
            <View style={{height:40}}/>
          </ScrollView>
        </SafeAreaView>
        {MenuOverlay}{ThemeOverlay}
      </View>
    );
  }

  // ── AI ANALYSIS ──
  if(screen==='analysis') {
    const wrong=results.filter(r=>!r.correct);
    return (
      <View style={{flex:1,backgroundColor:T.bg}}>
        <SafeAreaView style={{flex:1}}>
          <StatusBar barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg}/>
          <NavBar/>
          <ScrollView contentContainerStyle={{padding:20}}>
            <TouchableOpacity style={{marginBottom:16}} onPress={()=>setScreen('result')}><Text style={{color:T.accent,fontSize:14}}>{t.back}</Text></TouchableOpacity>
            <Text style={{fontSize:22,fontWeight:'900',color:T.text,marginBottom:6}}>🤖 KI-Analyse</Text>
            <Text style={{fontSize:13,color:T.sub,marginBottom:16}}>تحلیل هوش مصنوعی</Text>
            <View style={{flexDirection:'row',gap:10,marginBottom:20}}>
              {[[results.length,'Gesamt',T.blue],[results.filter(r=>r.correct).length,'Richtig','#16A34A'],[wrong.length,'Falsch','#DC2626']].map(([n,l,col])=>(
                <View key={l} style={{flex:1,backgroundColor:T.card,borderRadius:12,padding:12,alignItems:'center',borderWidth:1,borderColor:T.border}}>
                  <Text style={{fontSize:20,fontWeight:'900',color:col}}>{n}</Text>
                  <Text style={{fontSize:10,color:T.sub}}>{l}</Text>
                </View>
              ))}
            </View>
            {!aiText&&!aiLoading&&(
              <TouchableOpacity style={{backgroundColor:'#7C3AED',borderRadius:12,padding:14,alignItems:'center',marginBottom:16}} onPress={runAiAnalysis}>
                <Text style={{color:'#fff',fontSize:14,fontWeight:'800'}}>🤖 Analyse starten / شروع تحلیل</Text>
              </TouchableOpacity>
            )}
            {aiLoading&&<View style={{alignItems:'center',padding:30}}><ActivityIndicator size="large" color="#7C3AED"/><Text style={{color:T.sub,marginTop:12}}>KI analysiert...</Text></View>}
            {aiText&&(
              <View style={{backgroundColor:T.card,borderRadius:14,padding:18,marginBottom:16,borderWidth:1,borderColor:'#7C3AED44'}}>
                <Text style={{color:'#7C3AED',fontSize:12,fontWeight:'700',marginBottom:8}}>🤖 KI-Analyse</Text>
                <Text style={{color:T.text,fontSize:13,lineHeight:22}}>{aiText}</Text>
              </View>
            )}
            {wrong.length>0&&(
              <View>
                <Text style={{color:T.text,fontSize:15,fontWeight:'700',marginBottom:10}}>❌ Falsche Antworten:</Text>
                {wrong.map((r,i)=>(
                  <View key={i} style={{backgroundColor:T.card,borderRadius:12,padding:12,marginBottom:8,borderWidth:1,borderColor:'#DC262622'}}>
                    <Text style={{color:T.text,fontSize:13,fontWeight:'600',marginBottom:4}}>{r.q.text_de}</Text>
                    {lang!=='de'&&r.q['text_'+lang]&&<Text style={{color:T.sub,fontSize:11,marginBottom:6}}>{r.q['text_'+lang]}</Text>}
                    <Text style={{color:'#16A34A',fontSize:12}}>✓ {r.q.opts?.filter(o=>o.ok).map(o=>o.text_de).join(' + ')}</Text>
                  </View>
                ))}
              </View>
            )}
            <View style={{height:40}}/>
          </ScrollView>
        </SafeAreaView>
        {MenuOverlay}{ThemeOverlay}
      </View>
    );
  }



  return <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:T.bg}}><ActivityIndicator size="large" color="#1B4FD8"/></View>;
}
