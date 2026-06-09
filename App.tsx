import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, Image, Dimensions,
  SafeAreaView, StatusBar, Animated, BackHandler,
  Platform, Linking, Vibration,
} from 'react-native';

const {width, height} = Dimensions.get('window');

const SB_URL = 'https://npfvlfdjngzczxhghmyu.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wZnZsZmRqbmd6Y3p4aGdobXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMTI2NjgsImV4cCI6MjA5NDg4ODY2OH0.oqnB4FTnmj-wno7AEgTz-MAmunazqwpj5jEkvB5xN8s';
const EXAM_FREE = 5;
const PRACTICE_FREE = 10;
const WEBSITE_URL = 'https://fahrready.ch';
const STRIPE_URL = 'https://npfvlfdjngzczxhghmyu.supabase.co/functions/v1/create-checkout';

// ── THEMES ──────────────────────────────────────────────
const THEMES = {
  dark: {name:'🌙 Dark', bg:'#060616', card:'#1a1a2e', text:'#FFFFFF', sub:'rgba(255,255,255,0.5)', border:'rgba(255,255,255,0.1)', blue:'#1B4FD8', accent:'#60A5FA', navBg:'#060616', btnSecBg:'rgba(255,255,255,0.08)'},
  light: {name:'☀️ Light', bg:'#F8FAFF', card:'#FFFFFF', text:'#0f172a', sub:'#6B7280', border:'#E5E7EB', blue:'#1B4FD8', accent:'#1B4FD8', navBg:'#FFFFFF', btnSecBg:'#F1F5F9'},
  blue: {name:'🔵 Blue', bg:'#0A1628', card:'#112240', text:'#E2E8F0', sub:'#94A3B8', border:'rgba(96,165,250,0.2)', blue:'#3B82F6', accent:'#60A5FA', navBg:'#0A1628', btnSecBg:'rgba(59,130,246,0.1)'},
  green: {name:'🌿 Green', bg:'#0A1F1A', card:'#112B22', text:'#E2E8F0', sub:'#86EFAC', border:'rgba(34,197,94,0.2)', blue:'#16A34A', accent:'#4ADE80', navBg:'#0A1F1A', btnSecBg:'rgba(22,163,74,0.1)'},
};

async function sbReq(path, method = 'GET', body) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
      method, headers: {apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation'},
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await r.json().catch(() => []);
    return {ok: r.ok, data};
  } catch(e) { return {ok: false, data: []}; }
}

const TX = {
  de: {anmelden:'Anmelden', abmelden:'Abmelden', registrieren:'Registrieren', pruefung:'Prüfung', vorbereitung:'Vorbereitung', nachrichten:'Nachrichten', home:'Start', fragen:'Fragen', minuten:'Minuten', punkte:'Punkte', starten:'▶ Prüfung starten', lernen:'📚 Lernen', kostenlos:'✓ Registrieren', richtig:'✓ Richtig!', falsch:'✗ Falsch!', weiter:'Weiter →', bestanden:'Bestanden! 🎉', nichtBestanden:'Nicht bestanden 😔', nochmal:'🔁 Nochmal', premium:'⭐ Premium', premiumMsg:'Premium kaufen für unbegrenzten Zugang', website:'🌐 Website', profil:'Profil', thema:'Design', kalender:'Kalender', pruefungHinzu:'+ Prüfungstermin', abmeldeBest:'Wirklich abmelden?', abmeldeMsg:'Möchten Sie sich abmelden?', ja:'Ja', nein:'Nein', hallo:'Hallo'},
  fa: {anmelden:'ورود', abmelden:'خروج', registrieren:'ثبت‌نام', pruefung:'آزمون', vorbereitung:'آمادگی', nachrichten:'اخبار', home:'خانه', fragen:'سوال', minuten:'دقیقه', punkte:'امتیاز', starten:'▶ شروع آزمون', lernen:'📚 یادگیری', kostenlos:'✓ ثبت‌نام رایگان', richtig:'✓ درست!', falsch:'✗ نادرست!', weiter:'بعدی ←', bestanden:'قبول شدید! 🎉', nichtBestanden:'قبول نشدید 😔', nochmal:'🔁 دوباره', premium:'⭐ ویژه', premiumMsg:'برای دسترسی نامحدود اشتراک بگیرید', website:'🌐 وب‌سایت', profil:'پروفایل', thema:'طراحی', kalender:'تقویم', pruefungHinzu:'+ افزودن آزمون', abmeldeBest:'خروج؟', abmeldeMsg:'آیا می‌خواهید خارج شوید؟', ja:'بله', nein:'نه', hallo:'سلام'},
  az: {anmelden:'Daxil ol', abmelden:'Çıxış', registrieren:'Qeydiyyat', pruefung:'İmtahan', vorbereitung:'Hazırlıq', nachrichten:'Xəbərlər', home:'Ana', fragen:'Sual', minuten:'Dəqiqə', punkte:'Xal', starten:'▶ İmtahanı başlat', lernen:'📚 Öyrən', kostenlos:'✓ Pulsuz qeydiyyat', richtig:'✓ Düzgün!', falsch:'✗ Yanlış!', weiter:'Növbəti →', bestanden:'Keçdiniz! 🎉', nichtBestanden:'Keçmədiniz 😔', nochmal:'🔁 Yenidən', premium:'⭐ Premium', premiumMsg:'Limitsiz giriş üçün premium alın', website:'🌐 Sayt', profil:'Profil', thema:'Dizayn', kalender:'Təqvim', pruefungHinzu:'+ İmtahan əlavə et', abmeldeBest:'Çıxmaq?', abmeldeMsg:'Çıxmaq istəyirsiniz?', ja:'Bəli', nein:'Xeyr', hallo:'Salam'},
  en: {anmelden:'Login', abmelden:'Logout', registrieren:'Register', pruefung:'Exam', vorbereitung:'Practice', nachrichten:'News', home:'Home', fragen:'Questions', minuten:'Minutes', punkte:'Points', starten:'▶ Start Exam', lernen:'📚 Learn', kostenlos:'✓ Register Free', richtig:'✓ Correct!', falsch:'✗ Wrong!', weiter:'Next →', bestanden:'Passed! 🎉', nichtBestanden:'Failed 😔', nochmal:'🔁 Again', premium:'⭐ Premium', premiumMsg:'Buy premium for unlimited access', website:'🌐 Website', profil:'Profile', thema:'Theme', kalender:'Calendar', pruefungHinzu:'+ Add Exam', abmeldeBest:'Logout?', abmeldeMsg:'Do you want to logout?', ja:'Yes', nein:'No', hallo:'Hello'},
};

const LOCAL_Q = [
  {id:1,text_de:'Was bedeutet dieses Zeichen?',text_fa:'این علامت چه معنایی دارد؟',text_az:'Bu işarə nə deməkdir?',text_en:'What does this sign mean?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Zeichen_206.svg/200px-Zeichen_206.svg.png',opts:[{text_de:'Halt — Vorfahrt gewähren',text_fa:'ایست — حق تقدم بده',text_az:'Dur — üstünlük ver',text_en:'Stop — give way',ok:true},{text_de:'Einfahrt verboten',text_fa:'ورود ممنوع',text_az:'Giriş qadağan',text_en:'No entry',ok:false},{text_de:'Parkieren verboten',text_fa:'پارک ممنوع',text_az:'Park qadağan',text_en:'No parking',ok:false}]},
  {id:2,text_de:'Was bedeutet dieses Zeichen?',text_fa:'این علامت چه معنایی دارد؟',text_az:'Bu işarə nə deməkdir?',text_en:'What does this sign mean?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Zeichen_205.svg/200px-Zeichen_205.svg.png',opts:[{text_de:'Vorfahrt gewähren',text_fa:'حق تقدم بده',text_az:'Üstünlük ver',text_en:'Give way',ok:true},{text_de:'Vorfahrtsstrasse',text_fa:'خیابان اولویت‌دار',text_az:'Üstünlük yolu',text_en:'Priority road',ok:false},{text_de:'Halt',text_fa:'ایست',text_az:'Dur',text_en:'Stop',ok:false}]},
  {id:3,text_de:'Was bedeutet dieses Zeichen?',text_fa:'این علامت چه معنایی دارد؟',text_az:'Bu işarə nə deməkdir?',text_en:'What does this sign mean?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Zeichen_274-50.svg/200px-Zeichen_274-50.svg.png',opts:[{text_de:'Höchstgeschwindigkeit 50 km/h',text_fa:'حداکثر سرعت ۵۰',text_az:'Maksimum sürət 50',text_en:'Maximum speed 50 km/h',ok:true},{text_de:'Mindestgeschwindigkeit 50',text_fa:'حداقل سرعت ۵۰',text_az:'Minimum sürət 50',text_en:'Minimum speed 50',ok:false},{text_de:'Empfohlene Geschwindigkeit',text_fa:'سرعت توصیه‌شده',text_az:'Tövsiyə sürəti',text_en:'Recommended speed',ok:false}]},
  {id:4,text_de:'Welches ist die Höchstgeschwindigkeit auf Schweizer Autobahnen?',text_fa:'حداکثر سرعت در اتوبان‌های سوئیس چقدر است؟',text_az:'İsveçrə avtoyollarında maksimum sürət?',text_en:'Maximum speed on Swiss motorways?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Zeichen_274-120.svg/200px-Zeichen_274-120.svg.png',opts:[{text_de:'120 km/h',text_fa:'۱۲۰',text_az:'120',text_en:'120 km/h',ok:true},{text_de:'130 km/h',text_fa:'۱۳۰',text_az:'130',text_en:'130 km/h',ok:false},{text_de:'100 km/h',text_fa:'۱۰۰',text_az:'100',text_en:'100 km/h',ok:false}]},
  {id:5,text_de:'Wer hat Vortritt an einer Kreuzung ohne Zeichen?',text_fa:'در تقاطع بدون علامت چه کسی حق تقدم دارد؟',text_az:'İşarəsiz kəsişmədə kim üstünlüyə malikdir?',text_en:'Who has priority at an unmarked junction?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Zeichen_102.svg/200px-Zeichen_102.svg.png',opts:[{text_de:'Fahrzeuge von rechts',text_fa:'وسایل از راست',text_az:'Sağdan gələn',text_en:'Vehicles from right',ok:true},{text_de:'Fahrzeuge von links',text_fa:'از چپ',text_az:'Soldan',text_en:'From left',ok:false},{text_de:'Wer zuerst kommt',text_fa:'هر که اول رسید',text_az:'Kim əvvəl',text_en:'First come',ok:false}]},
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [lang, setLang] = useState('de');
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState(LOCAL_Q);
  const [menuOpen, setMenuOpen] = useState(false);
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
  const [calendar, setCalendar] = useState([]);
  const [showTheme, setShowTheme] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const menuAnim = useRef(new Animated.Value(0)).current;

  const T = THEMES[theme] || THEMES.dark;
  const t = TX[lang] || TX.de;

  useEffect(() => {
    loadData();
  }, []);

  // Use refs to avoid stale closures in BackHandler
  const screenRef = useRef(screen);
  const menuOpenRef = useRef(menuOpen);
  const showThemeRef = useRef(showTheme);
  
  useEffect(() => { screenRef.current = screen; }, [screen]);
  useEffect(() => { menuOpenRef.current = menuOpen; }, [menuOpen]);
  useEffect(() => { showThemeRef.current = showTheme; }, [showTheme]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showThemeRef.current) { setShowTheme(false); return true; }
      if (menuOpenRef.current) { setMenuOpen(false); return true; }
      if (screenRef.current !== 'home') { 
        setScreen('home');
        return true; 
      }
      return false;
    });
    return () => backHandler.remove();
  }, []);

  async function loadData() {
    try {
      const [qRes, nRes, aRes] = await Promise.all([
        sbReq('questions?is_active=eq.true&order=id.asc&limit=500'),
        sbReq('news?is_active=eq.true&order=created_at.desc&limit=10'),
        sbReq('ads?is_active=eq.true&order=created_at.desc&limit=5'),
      ]);
      if (qRes.ok && Array.isArray(qRes.data) && qRes.data.length > 0) {
        const ar = await sbReq('answers?order=question_id.asc,id.asc&limit=2000');
        if (ar.ok && Array.isArray(ar.data)) {
          const qs = qRes.data.map(q => {
            const localQ = LOCAL_Q.find(lq => lq.img_url === q.img_url);
            const opts = ar.data.filter(a => a.question_id === q.id).slice(0,4).map((a,ai) => {
              const lo = localQ?.opts?.[ai];
              return {
                text_de: a.text_de||'', text_fa: a.text_fa||lo?.text_fa||'',
                text_az: a.text_az||lo?.text_az||'', text_en: a.text_en||lo?.text_en||'',
                ok: a.is_correct
              };
            });
            return {
              ...q,
              text_fa: q.text_fa||localQ?.text_fa||'',
              text_az: q.text_az||localQ?.text_az||'',
              text_en: q.text_en||localQ?.text_en||'',
              opts
            };
          }).filter(q => q.text_de && q.opts.length >= 2);
          if (qs.length > 0) setQuestions(qs);
        }
      }
      if (nRes.ok && Array.isArray(nRes.data)) setNews(nRes.data);
      if (aRes.ok && Array.isArray(aRes.data)) setAds(aRes.data);
    } catch(e) {}
  }

  function openMenu() {
    setMenuOpen(true);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function goHome() {
    if (timerRef) { clearInterval(timerRef); setTimerRef(null); }
    setScreen('home'); closeMenu();
  }

  function startExam(practice = false) {
    const pool = shuffle(questions.map(q => ({...q, opts: shuffle([...q.opts])}))); 
    const set = practice ? pool : pool.slice(0, Math.min(50, pool.length));
    setExamQ(set); setQIdx(0); setScore(0); setErrors(0);
    setAnswered(false); setSelectedOpts([]); setResults([]);
    setIsPractice(practice);
    if (!practice) {
      setTimeLeft(2700);
      const ti = setInterval(() => setTimeLeft(p => { if(p<=1){clearInterval(ti);return 0;} return p-1; }), 1000);
      setTimerRef(ti);
    }
    closeMenu();
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {toValue:1, duration:300, useNativeDriver:true}).start();
    setScreen('exam');
  }

  function pickAnswer(optIdx) {
    if (answered) return;
    // Toggle selection - same for both single and multi
    setSelectedOpts(prev => {
      const q = examQ[qIdx];
      const correctCount = q.opts.filter(o=>o.ok).length;
      if (correctCount === 1) {
        // Single answer: replace selection
        return [optIdx];
      }
      // Multi answer: toggle
      if (prev.includes(optIdx)) return prev.filter(i=>i!==optIdx);
      return [...prev, optIdx];
    });
  }

  function submitAnswer() {
    if (selectedOpts.length === 0) return;
    const q = examQ[qIdx];
    const correctIdxs = q.opts.map((o,i)=>o.ok?i:-1).filter(i=>i>=0);
    const allCorrect = correctIdxs.every(i=>selectedOpts.includes(i)) && selectedOpts.every(i=>q.opts[i]?.ok);
    setAnswered(true);
    if (allCorrect) setScore(s=>s+1); else setErrors(e=>e+1);
    setResults(r=>[...r,{q,correct:allCorrect}]);
  }

  function nextQ() {
    const freeLimit = isPractice ? PRACTICE_FREE : EXAM_FREE;
    if (!user?.is_premium && qIdx+1 >= freeLimit) {
      if (timerRef) clearInterval(timerRef);
      setScreen('premium'); return;
    }
    if (qIdx+1 >= examQ.length) { finishExam(); return; }
    setQIdx(i=>i+1); setAnswered(false); setSelectedOpts([]);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {toValue:1, duration:250, useNativeDriver:true}).start();
  }

  function finishExam() {
    if (timerRef) { clearInterval(timerRef); setTimerRef(null); }
    setScreen('result');
  }

  function formatTime(s) { return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; }

  async function stripeCheckout(priceId) {
    if (!email && !user?.email) { Alert.alert('E-Mail', 'Bitte E-Mail eingeben'); return; }
    const userEmail = user?.email || email;
    try {
      const r = await fetch(STRIPE_URL, {
        method: 'POST',
        headers: {'Content-Type':'application/json','Authorization':`Bearer ${SB_KEY}`,'apikey':SB_KEY},
        body: JSON.stringify({priceId, email: userEmail})
      });
      const data = await r.json();
      if (data.url) Linking.openURL(data.url);
      else Alert.alert('Fehler', data.error||'Unknown error');
    } catch(e) { Alert.alert('Fehler', 'Verbindungsfehler'); }
  }

  function addCalendarEvent(title, date, time, ringtone='default') {
    const newEvent = {id: Date.now().toString(), title, date, time, ringtone};
    setCalendar(prev => [...prev, newEvent]);
    Alert.alert('✓', `${title} ${t.kalender} gespeichert`);
  }

  function deleteCalendarEvent(id) {
    setCalendar(prev => prev.filter(e => e.id !== id));
  }

  const curQ = examQ[qIdx];
  const adTop = ads.find(a => a.position==='top');
  const adBottom = ads.find(a => a.position==='bottom');

  // ── THEME SELECTOR ──
  const ThemeModal = () => {
    if (!showTheme) return null;
    return (
      <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:1000,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'center',alignItems:'center'}}>
        <View style={{backgroundColor:T.card,borderRadius:20,padding:24,width:width*0.8}}>
          <Text style={{color:T.text,fontSize:18,fontWeight:'800',marginBottom:16,textAlign:'center'}}>{t.thema}</Text>
          {Object.entries(THEMES).map(([key, th]) => (
            <TouchableOpacity key={key} onPress={() => {setTheme(key); setShowTheme(false);}}
              style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:14,borderRadius:12,marginBottom:8,backgroundColor:theme===key?T.blue+'33':T.bg,borderWidth:1,borderColor:theme===key?T.blue:T.border}}>
              <Text style={{color:T.text,fontSize:15,fontWeight:'600'}}>{th.name}</Text>
              {theme===key && <Text style={{color:T.blue}}>✓</Text>}
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={()=>setShowTheme(false)} style={{marginTop:8,padding:12,alignItems:'center'}}>
            <Text style={{color:T.sub,fontWeight:'600'}}>✕ Schließen</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={{position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:-1}} onPress={()=>setShowTheme(false)} activeOpacity={1}/>
      </View>
    );
  };

  // ── MENU ──
  const Menu = () => {
    if (!menuOpen) return null;
    return (
      <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:999,flexDirection:'row'}}>
        <View style={{width:width*0.78,height:'100%',backgroundColor:T.card}}>
          <SafeAreaView style={{flex:1}}>
            <View style={{padding:20,borderBottomWidth:1,borderBottomColor:T.border,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{fontSize:20,fontWeight:'900',color:T.text}}>🚗 Fahr<Text style={{color:T.accent}}>Ready</Text></Text>
              <TouchableOpacity onPress={closeMenu}><Text style={{color:T.text,fontSize:20}}>✕</Text></TouchableOpacity>
            </View>
            {user && (
              <View style={{padding:16,borderBottomWidth:1,borderBottomColor:T.border}}>
                <Text style={{color:T.text,fontSize:16,fontWeight:'700'}}>{t.hallo}, {user.full_name?.split(' ')[0]}! {user.is_premium?'⭐':''}</Text>
                <Text style={{color:T.sub,fontSize:12,marginTop:2}}>{user.email}</Text>
              </View>
            )}
            <View style={{flexDirection:'row',gap:8,padding:16,borderBottomWidth:1,borderBottomColor:T.border}}>
              {['DE','FA','AZ','EN'].map(l => (
                <TouchableOpacity key={l} onPress={() => {setLang(l.toLowerCase()); closeMenu();}}
                  style={{paddingHorizontal:12,paddingVertical:6,borderRadius:20,borderWidth:1,borderColor:lang===l.toLowerCase()?T.blue:T.border,backgroundColor:lang===l.toLowerCase()?T.blue:'transparent'}}>
                  <Text style={{color:lang===l.toLowerCase()?'#fff':T.sub,fontSize:12,fontWeight:'700'}}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <ScrollView>
              {[
                {icon:'🏠',label:t.home,action:goHome},
                {icon:'📝',label:t.pruefung,action:()=>startExam(false)},
                {icon:'📚',label:t.vorbereitung,action:()=>startExam(true)},
                {icon:'📰',label:t.nachrichten,action:()=>{setScreen('news');closeMenu();}},
                {icon:'📅',label:t.kalender,action:()=>{setScreen('calendar');closeMenu();}},
                {icon:'👤',label:t.profil,action:()=>{setScreen('profile');closeMenu();}},
                {icon:'🎨',label:t.thema,action:()=>{setShowTheme(true);closeMenu();}},
                {icon:'🌐',label:t.website,action:()=>Linking.openURL(WEBSITE_URL)},
              ].map((item,i) => (
                <TouchableOpacity key={i} style={{flexDirection:'row',alignItems:'center',gap:12,padding:16,borderBottomWidth:1,borderBottomColor:T.border}} onPress={item.action}>
                  <Text style={{fontSize:20}}>{item.icon}</Text>
                  <Text style={{color:T.text,fontSize:15,fontWeight:'500'}}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{padding:16,borderTopWidth:1,borderTopColor:T.border}}>
              {user ? (
                <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:10,padding:12,alignItems:'center'}}
                  onPress={() => {
                    Alert.alert(t.abmeldeBest, t.abmeldeMsg, [
                      {text:t.nein,style:'cancel'},
                      {text:t.ja,onPress:()=>{setUser(null);goHome();}}
                    ]);
                  }}>
                  <Text style={{color:'#fff',fontWeight:'700'}}>{t.abmelden}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:10,padding:12,alignItems:'center'}} onPress={()=>{setScreen('login');closeMenu();}}>
                  <Text style={{color:'#fff',fontWeight:'700'}}>{t.anmelden}</Text>
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        </View>
        <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}} onPress={closeMenu} activeOpacity={1}/>
      </View>
    );
  };

  const NavBar = ({light=false}) => (
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:12,backgroundColor:T.navBg}}>
      <TouchableOpacity onPress={openMenu} style={{gap:5}}>
        <View style={{height:2,backgroundColor:T.text,width:22}} />
        <View style={{height:2,backgroundColor:T.text,width:22}} />
        <View style={{height:2,backgroundColor:T.text,width:22}} />
      </TouchableOpacity>
      <TouchableOpacity onPress={goHome} style={{flexDirection:'row',alignItems:'center',gap:6}}>
        <Image source={{uri:"data:image/png;base64,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"}} style={{width:28,height:28,borderRadius:6}} />
        <Text style={{fontSize:18,fontWeight:'900',color:T.text}}>Fahr<Text style={{color:T.accent}}>Ready</Text></Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>setShowTheme(s=>!s)} style={{width:36,height:36,borderRadius:18,backgroundColor:T.blue,alignItems:'center',justifyContent:'center'}}>
        <Text style={{fontSize:16}}>🎨</Text>
      </TouchableOpacity>
    </View>
  );

  const AdBanner = ({ad}) => {
    if (!ad) return null;
    return (
      <TouchableOpacity onPress={()=>ad.link_url&&Linking.openURL(ad.link_url)} style={{margin:12,borderRadius:10,overflow:'hidden',borderWidth:1,borderColor:T.border}}>
        <Text style={{fontSize:9,color:T.sub,textAlign:'center',paddingTop:4}}>AD</Text>
        {ad.image_url?<Image source={{uri:ad.image_url}} style={{width:'100%',height:80}} resizeMode="cover"/>:
        <View style={{padding:12,backgroundColor:T.card}}><Text style={{color:T.text,fontSize:13,textAlign:'center',fontWeight:'600'}}>{ad.name}</Text></View>}
      </TouchableOpacity>
    );
  };

  // ── HOME ──
  if (screen === 'home') return (
    <SafeAreaView style={{flex:1,backgroundColor:T.bg}}>
      <StatusBar barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg} />
      <ThemeModal /><Menu />
      <NavBar />
      {adTop && <AdBanner ad={adTop} />}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{padding:24}}>
          <View style={{backgroundColor:T.blue+'22',borderRadius:20,padding:4,paddingHorizontal:12,alignSelf:'flex-start',marginBottom:14}}>
            <Text style={{color:T.accent,fontSize:11,fontWeight:'600'}}>🇨🇭 Offizielle Schweizer Theorieprüfung</Text>
          </View>
          {user && <Text style={{color:T.accent,fontSize:14,fontWeight:'600',marginBottom:8}}>{t.hallo}, {user.full_name?.split(' ')[0]}! {user.is_premium?'⭐':''}</Text>}
          <Text style={{fontSize:30,fontWeight:'900',color:T.text,lineHeight:38,marginBottom:10}}>
            {"Bestehe deine "}<Text style={{color:T.accent}}>{"Fahrprüfung"}</Text>
          </Text>
          <Text style={{fontSize:13,color:T.sub,marginBottom:20}}>Persisch · Azerbaijanisch · Deutsch · Englisch</Text>
        </View>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:10,paddingHorizontal:20,marginBottom:20}}>
          {[['50',t.fragen],['45',t.minuten],['135',t.punkte],['4','Sprachen']].map(([n,l])=>(
            <View key={l} style={{flex:1,minWidth:'22%',backgroundColor:T.card,borderRadius:12,padding:12,alignItems:'center',borderWidth:1,borderColor:T.border}}>
              <Text style={{fontSize:22,fontWeight:'900',color:T.text}}>{n}</Text>
              <Text style={{fontSize:9,color:T.sub,textAlign:'center',marginTop:2}}>{l}</Text>
            </View>
          ))}
        </View>
        <View style={{paddingHorizontal:20,gap:10,marginBottom:20}}>
          <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:14,padding:15,alignItems:'center'}} onPress={()=>startExam(false)}>
            <Text style={{color:'#fff',fontSize:15,fontWeight:'800'}}>{t.starten}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{backgroundColor:T.btnSecBg,borderRadius:14,padding:15,alignItems:'center',borderWidth:1,borderColor:T.border}} onPress={()=>startExam(true)}>
            <Text style={{color:T.text,fontSize:14,fontWeight:'700'}}>{t.lernen}</Text>
          </TouchableOpacity>
          {!user && <TouchableOpacity style={{borderRadius:14,padding:13,alignItems:'center',borderWidth:1.5,borderColor:T.border}} onPress={()=>setScreen('register')}>
            <Text style={{color:T.sub,fontSize:13,fontWeight:'600'}}>{t.kostenlos}</Text>
          </TouchableOpacity>}
          <TouchableOpacity style={{borderRadius:14,padding:13,alignItems:'center',borderWidth:1,borderColor:T.border,flexDirection:'row',justifyContent:'center',gap:8}} onPress={()=>Linking.openURL(WEBSITE_URL)}>
            <Text style={{color:T.accent,fontSize:13,fontWeight:'600'}}>{t.website}</Text>
          </TouchableOpacity>
        </View>
        {news.length>0 && (
          <View style={{paddingHorizontal:20,marginBottom:20}}>
            <Text style={{color:T.text,fontSize:15,fontWeight:'700',marginBottom:12}}>📰 Nachrichten</Text>
            {news.slice(0,3).map((n,i)=>(
              <View key={i} style={{backgroundColor:T.card,borderRadius:12,overflow:'hidden',marginBottom:10,borderWidth:1,borderColor:T.border}}>
                {n.image_url&&<Image source={{uri:n.image_url}} style={{width:'100%',height:120}} resizeMode="cover"/>}
                <View style={{padding:12}}>
                  <Text style={{color:T.accent,fontSize:10,fontWeight:'700',marginBottom:4}}>{n.tag||'NEU'}</Text>
                  <Text style={{color:T.text,fontSize:13,fontWeight:'600'}}>{n['title_'+lang]||n.title_de}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        {adBottom && <AdBanner ad={adBottom} />}
        <View style={{height:40}} />
      </ScrollView>
    </SafeAreaView>
  );

  // ── LOGIN/REGISTER ──
  if (screen==='login'||screen==='register') {
    const isReg = screen==='register';
    return (
      <SafeAreaView style={{flex:1,backgroundColor:T.bg}}>
        <StatusBar barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg} />
        <ThemeModal /><Menu /><NavBar />
        <ScrollView contentContainerStyle={{padding:24,flexGrow:1}}>
          <TouchableOpacity style={{marginBottom:20}} onPress={goHome}><Text style={{color:T.accent,fontSize:14,fontWeight:'600'}}>← {t.home}</Text></TouchableOpacity>
          <Text style={{fontSize:24,fontWeight:'900',color:T.text,marginBottom:24}}>{isReg?t.registrieren:t.anmelden}</Text>
          {isReg&&<TextInput style={{borderWidth:1.5,borderColor:T.border,borderRadius:10,padding:13,fontSize:13,marginBottom:12,color:T.text,backgroundColor:T.card}} placeholder="Vollständiger Name" value={fullName} onChangeText={setFullName} placeholderTextColor={T.sub}/>}
          <TextInput style={{borderWidth:1.5,borderColor:T.border,borderRadius:10,padding:13,fontSize:13,marginBottom:12,color:T.text,backgroundColor:T.card}} placeholder="E-Mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={T.sub}/>
          <TextInput style={{borderWidth:1.5,borderColor:T.border,borderRadius:10,padding:13,fontSize:13,marginBottom:20,color:T.text,backgroundColor:T.card}} placeholder="Passwort" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={T.sub}/>
          <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:14,padding:15,alignItems:'center'}} disabled={loading} onPress={async()=>{
            if(!email||!password){Alert.alert('Fehler','E-Mail und Passwort eingeben');return;}
            setLoading(true);
            if(isReg){
              const r=await sbReq('users','POST',{email,password_hash:password,full_name:fullName||email,language:lang,is_premium:false,created_at:new Date().toISOString()});
              if(r.ok&&Array.isArray(r.data)&&r.data[0]){setUser(r.data[0]);setScreen('home');}
              else Alert.alert('Fehler','Registrierung fehlgeschlagen');
            }else{
              const r=await sbReq(`users?email=eq.${encodeURIComponent(email)}&password_hash=eq.${encodeURIComponent(password)}&select=*`);
              if(r.ok&&Array.isArray(r.data)&&r.data[0]){setUser(r.data[0]);setScreen('home');}
              else Alert.alert('Fehler','Falsche E-Mail oder Passwort');
            }
            setLoading(false);
          }}>
            {loading?<ActivityIndicator color="#fff"/>:<Text style={{color:'#fff',fontSize:15,fontWeight:'800'}}>{isReg?t.registrieren:t.anmelden}</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>setScreen(isReg?'login':'register')} style={{marginTop:16}}>
            <Text style={{color:T.accent,textAlign:'center',fontWeight:'600'}}>{isReg?`${t.anmelden} →`:`${t.registrieren} →`}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── PROFILE ──
  if (screen==='profile') return (
    <SafeAreaView style={{flex:1,backgroundColor:T.bg}}>
      <StatusBar barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg} />
      <ThemeModal /><Menu /><NavBar />
      <ScrollView contentContainerStyle={{padding:24}}>
        <TouchableOpacity style={{marginBottom:20}} onPress={goHome}><Text style={{color:T.accent,fontSize:14,fontWeight:'600'}}>← {t.home}</Text></TouchableOpacity>
        <Text style={{fontSize:24,fontWeight:'900',color:T.text,marginBottom:24}}>👤 {t.profil}</Text>
        {user ? (
          <View>
            <View style={{backgroundColor:T.card,borderRadius:16,padding:20,marginBottom:16,borderWidth:1,borderColor:T.border}}>
              <Text style={{color:T.sub,fontSize:12,marginBottom:4}}>İsim / Name</Text>
              <TextInput style={{color:T.text,fontSize:16,fontWeight:'700',borderBottomWidth:1,borderBottomColor:T.border,paddingBottom:8}} value={editName||user.full_name} onChangeText={setEditName} placeholderTextColor={T.sub}/>
              <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:10,padding:10,alignItems:'center',marginTop:12}} onPress={async()=>{
                if(!editName)return;
                const r=await sbReq(`users?id=eq.${user.id}`,'PATCH',{full_name:editName});
                if(r.ok){setUser({...user,full_name:editName});Alert.alert('✓','Gespeichert');}
              }}>
                <Text style={{color:'#fff',fontWeight:'700'}}>💾 Speichern</Text>
              </TouchableOpacity>
            </View>
            <View style={{backgroundColor:T.card,borderRadius:16,padding:20,marginBottom:16,borderWidth:1,borderColor:T.border}}>
              <Text style={{color:T.sub,fontSize:12,marginBottom:4}}>E-Mail</Text>
              <Text style={{color:T.text,fontSize:15,fontWeight:'600'}}>{user.email}</Text>
            </View>
            <View style={{backgroundColor:T.card,borderRadius:16,padding:20,borderWidth:1,borderColor:T.border}}>
              <Text style={{color:T.sub,fontSize:12,marginBottom:4}}>Status</Text>
              <Text style={{color:user.is_premium?'#16A34A':T.sub,fontSize:15,fontWeight:'700'}}>{user.is_premium?'⭐ Premium':'Free'}</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:14,padding:15,alignItems:'center'}} onPress={()=>setScreen('login')}>
            <Text style={{color:'#fff',fontSize:15,fontWeight:'800'}}>{t.anmelden}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  // ── CALENDAR ADD ──
  const [calDate, setCalDate] = useState('');
  const [calTime, setCalTime] = useState('06:00');
  const [calTitle, setCalTitle] = useState('Führerausweis Prüfung');

  const CalendarAdd = () => (
    <View style={{backgroundColor:T.card,borderRadius:14,padding:16,marginBottom:16,borderWidth:1,borderColor:T.border}}>
      <Text style={{color:T.text,fontSize:14,fontWeight:'700',marginBottom:10}}>+ Neuer Termin</Text>
      <TextInput style={{borderWidth:1,borderColor:T.border,borderRadius:8,padding:10,color:T.text,backgroundColor:T.bg,marginBottom:8,fontSize:13}} placeholder="Titel (z.B. Prüfung)" placeholderTextColor={T.sub} value={calTitle} onChangeText={setCalTitle}/>
      <TextInput style={{borderWidth:1,borderColor:T.border,borderRadius:8,padding:10,color:T.text,backgroundColor:T.bg,marginBottom:8,fontSize:13}} placeholder="Datum (DD.MM.YYYY)" placeholderTextColor={T.sub} value={calDate} onChangeText={setCalDate} keyboardType="numeric"/>
      <TextInput style={{borderWidth:1,borderColor:T.border,borderRadius:8,padding:10,color:T.text,backgroundColor:T.bg,marginBottom:12,fontSize:13}} placeholder="Uhrzeit (HH:MM)" placeholderTextColor={T.sub} value={calTime} onChangeText={setCalTime} keyboardType="numeric"/>
      <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:10,padding:12,alignItems:'center'}} onPress={()=>{
        if(!calDate){Alert.alert('Fehler','Datum eingeben');return;}
        addCalendarEvent(calTitle||'Prüfung', calDate, calTime||'06:00');
        setCalDate(''); setCalTime('06:00'); setCalTitle('Führerausweis Prüfung');
      }}>
        <Text style={{color:'#fff',fontWeight:'700'}}>💾 Termin speichern</Text>
      </TouchableOpacity>
    </View>
  );

  // ── CALENDAR ──
  if (screen==='calendar') return (
    <SafeAreaView style={{flex:1,backgroundColor:T.bg}}>
      <StatusBar barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg} />
      <ThemeModal /><Menu /><NavBar />
      <ScrollView contentContainerStyle={{padding:24}}>
        <TouchableOpacity style={{marginBottom:20}} onPress={goHome}><Text style={{color:T.accent,fontSize:14,fontWeight:'600'}}>← {t.home}</Text></TouchableOpacity>
        <Text style={{fontSize:24,fontWeight:'900',color:T.text,marginBottom:24}}>📅 {t.kalender}</Text>
        <CalendarAdd />
        {calendar.length===0 ? (
          <Text style={{color:T.sub,textAlign:'center',marginTop:40}}>Keine Termine</Text>
        ) : calendar.map(ev=>(
          <View key={ev.id} style={{backgroundColor:T.card,borderRadius:16,padding:16,marginBottom:12,borderWidth:1,borderColor:T.border}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <View>
                <Text style={{color:T.text,fontSize:15,fontWeight:'700'}}>{ev.title}</Text>
                <Text style={{color:T.accent,fontSize:13,marginTop:4}}>📅 {ev.date} ⏰ {ev.time}</Text>
              </View>
              <TouchableOpacity onPress={()=>deleteCalendarEvent(ev.id)} style={{backgroundColor:'#DC2626',borderRadius:8,padding:8}}>
                <Text style={{color:'#fff',fontSize:12}}>✕ Löschen</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  // ── NEWS ──
  if (screen==='news') return (
    <SafeAreaView style={{flex:1,backgroundColor:T.bg}}>
      <StatusBar barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg} />
      <ThemeModal /><Menu /><NavBar />
      <ScrollView contentContainerStyle={{padding:24}}>
        <TouchableOpacity style={{marginBottom:20}} onPress={goHome}><Text style={{color:T.accent,fontSize:14,fontWeight:'600'}}>← {t.home}</Text></TouchableOpacity>
        <Text style={{fontSize:24,fontWeight:'900',color:T.text,marginBottom:24}}>📰 Nachrichten</Text>
        {news.map((n,i)=>(
          <View key={i} style={{backgroundColor:T.card,borderRadius:12,overflow:'hidden',marginBottom:12,borderWidth:1,borderColor:T.border}}>
            {n.image_url&&<Image source={{uri:n.image_url}} style={{width:'100%',height:140}} resizeMode="cover"/>}
            <View style={{padding:12}}>
              <Text style={{color:T.accent,fontSize:10,fontWeight:'700',marginBottom:4}}>{n.tag||'NEU'}</Text>
              <Text style={{color:T.text,fontSize:14,fontWeight:'600'}}>{n['title_'+lang]||n.title_de}</Text>
            </View>
          </View>
        ))}
        {news.length===0&&<Text style={{color:T.sub,textAlign:'center',marginTop:40}}>Keine Nachrichten</Text>}
        <View style={{height:40}}/>
      </ScrollView>
    </SafeAreaView>
  );

  // ── PREMIUM ──
  if (screen==='premium') return (
    <SafeAreaView style={{flex:1,backgroundColor:T.bg}}>
      <StatusBar barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg} />
      <ThemeModal /><Menu /><NavBar />
      <ScrollView contentContainerStyle={{padding:24,alignItems:'center'}}>
        <Text style={{fontSize:52,marginTop:16,marginBottom:8}}>⭐</Text>
        <Text style={{fontSize:22,fontWeight:'900',color:T.text,marginBottom:6,textAlign:'center'}}>Premium</Text>
        <Text style={{fontSize:13,color:T.sub,textAlign:'center',marginBottom:24}}>Für unbegrenzten Zugang zu allen Fragen</Text>
        <View style={{flexDirection:'row',gap:12,marginBottom:24,width:'100%'}}>
          <View style={{flex:1,backgroundColor:T.card,borderRadius:16,padding:16,alignItems:'center',borderWidth:1,borderColor:T.border}}>
            <Text style={{color:T.text,fontSize:14,fontWeight:'700',marginBottom:4}}>Monatlich</Text>
            <Text style={{color:T.accent,fontSize:28,fontWeight:'900'}}>CHF 9</Text>
            <Text style={{color:T.sub,fontSize:11}}>/Monat</Text>
          </View>
          <View style={{flex:1,backgroundColor:T.blue,borderRadius:16,padding:16,alignItems:'center'}}>
            <Text style={{color:'#fff',fontSize:14,fontWeight:'700',marginBottom:4}}>Jährlich ⭐</Text>
            <Text style={{color:'#fff',fontSize:28,fontWeight:'900'}}>CHF 29</Text>
            <Text style={{color:'rgba(255,255,255,0.7)',fontSize:11}}>/Jahr</Text>
          </View>
        </View>
        <TextInput style={{borderWidth:1.5,borderColor:T.border,borderRadius:10,padding:13,fontSize:13,marginBottom:12,color:T.text,backgroundColor:T.card,width:'100%'}} placeholder="E-Mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={T.sub}/>
        <TouchableOpacity style={{backgroundColor:'#635BFF',borderRadius:14,padding:15,alignItems:'center',width:'100%',marginBottom:10}} onPress={()=>stripeCheckout('price_1TgMzP0VonCoGUqlWZ6pYNOK')}>
          <Text style={{color:'#fff',fontSize:15,fontWeight:'800'}}>💳 Monatlich CHF 9</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:14,padding:15,alignItems:'center',width:'100%',marginBottom:20}} onPress={()=>stripeCheckout('price_1TgMzy0VonCoGUqlOfHZ5xR5')}>
          <Text style={{color:'#fff',fontSize:15,fontWeight:'800'}}>⭐ Jährlich CHF 29</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{padding:12}} onPress={goHome}>
          <Text style={{color:T.sub,fontSize:13}}>← Zurück</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  // ── EXAM ──
  if (screen==='exam'&&curQ) {
    const opts = curQ.opts||[];
    const pct = Math.round((qIdx/Math.max(examQ.length,1))*100);
    const qText = lang!=='de'&&curQ['text_'+lang] ? curQ['text_'+lang] : null;
    return (
      <SafeAreaView style={{flex:1,backgroundColor:T.bg}}>
        <StatusBar barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg} />
        <ThemeModal /><Menu />
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:10,backgroundColor:T.navBg,borderBottomWidth:1,borderBottomColor:T.border}}>
          <TouchableOpacity onPress={()=>{if(timerRef)clearInterval(timerRef);setScreen('home');}}>
            <Text style={{fontSize:18,color:T.sub,fontWeight:'700'}}>✕</Text>
          </TouchableOpacity>
          <View style={{alignItems:'center'}}>
            <Text style={{fontSize:14,fontWeight:'700',color:T.text}}>{qIdx+1} / {Math.min(examQ.length,isPractice?examQ.length:50)}</Text>
            <Text style={{fontSize:10,color:T.sub}}>{isPractice?'📚 Übung':'📝 Prüfung'}</Text>
          </View>
          <View style={{alignItems:'flex-end'}}>
            {!isPractice&&<Text style={{fontSize:14,fontWeight:'700',color:T.accent}}>{formatTime(timeLeft)}</Text>}
            <TouchableOpacity onPress={openMenu}><Text style={{color:T.sub,fontSize:12}}>☰</Text></TouchableOpacity>
          </View>
        </View>
        <View style={{height:4,backgroundColor:T.border}}><View style={{height:4,backgroundColor:T.blue,width:`${pct}%`}}/></View>
        <View style={{flexDirection:'row',justifyContent:'center',gap:24,paddingVertical:8,backgroundColor:T.navBg,borderBottomWidth:1,borderBottomColor:T.border}}>
          <Text style={{fontSize:13,fontWeight:'700',color:'#16A34A'}}>✓ {score}</Text>
          <Text style={{fontSize:13,fontWeight:'700',color:'#DC2626'}}>✗ {errors}</Text>
          {!isPractice&&<Text style={{fontSize:13,fontWeight:'700',color:T.text}}>Pkt: {score*3}/150</Text>}
        </View>
        <ScrollView style={{flex:1,padding:16}}>
          <Animated.View style={{opacity:fadeAnim}}>
            {(curQ.img_url||(curQ as any).img) ? <Image source={{uri:curQ.img_url||(curQ as any).img}} style={{width:'100%',height:180,borderRadius:12,marginBottom:14,backgroundColor:T.card}} resizeMode="contain"/> : null}
            <Text style={{fontSize:16,fontWeight:'800',color:T.text,marginBottom:qText?4:14,lineHeight:24}}>{curQ.text_de}</Text>
            {qText&&<Text style={{fontSize:13,color:T.sub,marginBottom:14,lineHeight:20,direction:lang==='fa'||lang==='az'?'rtl':'ltr'}}>{qText}</Text>}
            {curQ.opts.filter(o=>o.ok).length>1&&!answered&&(
              <View style={{backgroundColor:'#FEF9E7',borderRadius:8,padding:8,marginBottom:10,borderWidth:1,borderColor:'#F59E0B'}}>
                <Text style={{color:'#92700A',fontSize:12,fontWeight:'600',textAlign:'center'}}>⚠️ Mehrere Antworten möglich / چند جواب درست</Text>
              </View>
            )}
            {opts.map((opt,i)=>{
              let bg=T.card, bc=T.border, tc=T.text;
              const isSelected = selectedOpts.includes(i);
              if(answered){
                if(opt.ok){bg='#DCFCE7';bc='#16A34A';tc='#16A34A';}
                else if(isSelected&&!opt.ok){bg='#FEF2F2';bc='#DC2626';tc='#DC2626';}
              } else if(isSelected) {
                bc=T.blue; bg=T.blue+'22';
              }
              const optSub = lang!=='de'&&opt['text_'+lang]?opt['text_'+lang]:null;
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
              <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:12,padding:12,alignItems:'center',marginBottom:8}} onPress={submitAnswer}>
                <Text style={{color:'#fff',fontWeight:'700'}}>✓ Bestätigen / تأیید</Text>
              </TouchableOpacity>
            )}
            {answered&&(
              <View style={{borderRadius:10,padding:12,marginBottom:10,backgroundColor:results[results.length-1]?.correct?'#DCFCE7':'#FEF2F2'}}>
                <Text style={{fontSize:14,fontWeight:'800',textAlign:'center',color:results[results.length-1]?.correct?'#16A34A':'#DC2626'}}>
                  {results[results.length-1]?.correct?t.richtig:t.falsch}
                </Text>
                {!results[results.length-1]?.correct&&<Text style={{fontSize:12,color:'#16A34A',textAlign:'center',marginTop:4}}>✓ {opts.filter(o=>o.ok).map(o=>o.text_de).join(' + ')}</Text>}
              </View>
            )}
            {answered&&<TouchableOpacity style={{backgroundColor:T.blue,borderRadius:12,padding:14,alignItems:'center'}} onPress={nextQ}>
              <Text style={{color:'#fff',fontSize:15,fontWeight:'800'}}>{qIdx+1>=examQ.length?t.weiter:t.weiter}</Text>
            </TouchableOpacity>}
            <View style={{height:40}}/>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── RESULT ──
  if (screen==='result') {
    const total=results.length, correct=results.filter(r=>r.correct).length;
    const pts=correct*3, passed=!isPractice&&pts>=135;
    return (
      <SafeAreaView style={{flex:1,backgroundColor:T.bg}}>
        <StatusBar barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg} />
        <ThemeModal /><Menu /><NavBar />
        <ScrollView contentContainerStyle={{padding:24,alignItems:'center'}}>
          <Text style={{fontSize:56,marginTop:16,marginBottom:8}}>{isPractice?'🎓':passed?'🏆':'😔'}</Text>
          <Text style={{fontSize:22,fontWeight:'900',color:T.text,marginBottom:6,textAlign:'center'}}>{isPractice?'Übung abgeschlossen!':passed?t.bestanden:t.nichtBestanden}</Text>
          {!isPractice&&<Text style={{fontSize:18,fontWeight:'700',marginBottom:20,color:passed?'#16A34A':'#DC2626'}}>{pts}/150 Punkte</Text>}
          <View style={{flexDirection:'row',gap:10,marginBottom:24,flexWrap:'wrap',justifyContent:'center'}}>
            {[[total,'Gesamt','#1B4FD8'],[correct,'Richtig','#16A34A'],[total-correct,'Falsch','#DC2626']].map(([n,l,c])=>(
              <View key={l} style={{backgroundColor:T.card,borderRadius:12,padding:14,alignItems:'center',minWidth:70,borderWidth:1,borderColor:T.border}}>
                <Text style={{fontSize:22,fontWeight:'900',color:c}}>{n}</Text>
                <Text style={{fontSize:10,color:T.sub,marginTop:2}}>{l}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:12,padding:13,alignItems:'center',width:'100%',marginBottom:10}} onPress={()=>startExam(isPractice)}>
            <Text style={{color:'#fff',fontWeight:'700'}}>{t.nochmal}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{backgroundColor:'#7C3AED',borderRadius:12,padding:13,alignItems:'center',width:'100%',marginBottom:10}} onPress={()=>setScreen('analysis')}>
            <Text style={{color:'#fff',fontWeight:'700'}}>🤖 KI-Analyse / تحلیل هوش مصنوعی</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{backgroundColor:T.btnSecBg,borderRadius:12,padding:13,alignItems:'center',width:'100%',borderWidth:1,borderColor:T.border}} onPress={goHome}>
            <Text style={{color:T.text,fontWeight:'700'}}>← {t.home}</Text>
          </TouchableOpacity>
          <View style={{height:40}}/>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── AI ANALYSIS ──
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  async function runAiAnalysis() {
    setAiLoading(true);
    setAiAnalysis('');
    try {
      const wrongQ = results.filter(r=>!r.correct);
      const prompt = `Du bist ein Schweizer Fahrlehrer. Analysiere diese Prüfungsergebnisse:

Gesamt: ${results.length} Fragen
Richtig: ${results.filter(r=>r.correct).length}
Falsch: ${wrongQ.length}

Falsch beantwortete Fragen:
${wrongQ.slice(0,10).map((r,i)=>`${i+1}. ${r.q.text_de}`).join('\n')}

Gib eine kurze, hilfreiche Analyse auf Deutsch und Persisch (فارسی). 
Erkläre welche Themenbereiche verbessert werden müssen und gib konkrete Tipps. Max 200 Wörter.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{role:'user', content: prompt}]
        })
      });
      const data = await response.json();
      const text = data.content?.[0]?.text || 'Analyse nicht verfügbar';
      setAiAnalysis(text);
    } catch(e) {
      setAiAnalysis('Analyse fehlgeschlagen. Bitte Internet prüfen.');
    }
    setAiLoading(false);
  }

  if (screen==='analysis') return (
    <SafeAreaView style={{flex:1,backgroundColor:T.bg}}>
      <StatusBar barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg} />
      <ThemeModal />
      {menuOpen && <Menu />}
      <NavBar />
      <ScrollView contentContainerStyle={{padding:24}}>
        <TouchableOpacity style={{marginBottom:20}} onPress={()=>setScreen('result')}>
          <Text style={{color:T.accent,fontSize:14,fontWeight:'600'}}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={{fontSize:22,fontWeight:'900',color:T.text,marginBottom:6}}>🤖 KI-Analyse</Text>
        <Text style={{fontSize:13,color:T.sub,marginBottom:20}}>تحلیل هوش مصنوعی</Text>
        <View style={{flexDirection:'row',gap:10,marginBottom:20}}>
          {[[results.length,'Gesamt',T.blue],[results.filter(r=>r.correct).length,'Richtig','#16A34A'],[results.filter(r=>!r.correct).length,'Falsch','#DC2626']].map(([n,l,col])=>(
            <View key={l} style={{flex:1,backgroundColor:T.card,borderRadius:12,padding:12,alignItems:'center',borderWidth:1,borderColor:T.border}}>
              <Text style={{fontSize:20,fontWeight:'900',color:col}}>{n}</Text>
              <Text style={{fontSize:10,color:T.sub}}>{l}</Text>
            </View>
          ))}
        </View>
        {!aiAnalysis && !aiLoading && (
          <TouchableOpacity style={{backgroundColor:'#7C3AED',borderRadius:14,padding:15,alignItems:'center',marginBottom:20}} onPress={runAiAnalysis}>
            <Text style={{color:'#fff',fontSize:15,fontWeight:'800'}}>🤖 Analyse starten</Text>
          </TouchableOpacity>
        )}
        {aiLoading && (
          <View style={{alignItems:'center',padding:30}}>
            <ActivityIndicator size="large" color="#7C3AED"/>
            <Text style={{color:T.sub,marginTop:12}}>KI analysiert... / در حال تحلیل...</Text>
          </View>
        )}
        {aiAnalysis && (
          <View style={{backgroundColor:T.card,borderRadius:16,padding:20,borderWidth:1,borderColor:'#7C3AED33'}}>
            <Text style={{color:'#7C3AED',fontSize:12,fontWeight:'700',marginBottom:10}}>🤖 KI-Analyse</Text>
            <Text style={{color:T.text,fontSize:13,lineHeight:22}}>{aiAnalysis}</Text>
          </View>
        )}
        {results.filter(r=>!r.correct).length > 0 && (
          <View style={{marginTop:20}}>
            <Text style={{color:T.text,fontSize:15,fontWeight:'700',marginBottom:12}}>❌ Falsche Antworten</Text>
            {results.filter(r=>!r.correct).map((r,i)=>(
              <View key={i} style={{backgroundColor:T.card,borderRadius:12,padding:12,marginBottom:8,borderWidth:1,borderColor:'#DC262633'}}>
                <Text style={{color:T.text,fontSize:13,fontWeight:'600',marginBottom:4}}>{r.q.text_de}</Text>
                {lang!=='de'&&r.q['text_'+lang]&&<Text style={{color:T.sub,fontSize:11,marginBottom:6}}>{r.q['text_'+lang]}</Text>}
                <Text style={{color:'#16A34A',fontSize:12}}>✓ {r.q.opts?.find(o=>o.ok)?.text_de}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={{height:40}}/>
      </ScrollView>
    </SafeAreaView>
  );

    return <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:T.bg}}><ActivityIndicator size="large" color="#1B4FD8"/></View>;
}
