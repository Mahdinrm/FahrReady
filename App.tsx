import React, {useState, useEffect, useRef} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, Image, Dimensions,
  SafeAreaView, StatusBar, Animated, BackHandler, Linking,
} from 'react-native';

const {width} = Dimensions.get('window');

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
  const [calendar, setCalendar] = useState([]);
  const [calTitle, setCalTitle] = useState('Führerausweis Prüfung');
  const [calDate, setCalDate] = useState('');
  const [calTime, setCalTime] = useState('06:00');
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const T = THEMES[theme] || THEMES.dark;
  const t = TX[lang] || TX.de;

  // BackHandler - always intercept
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowTheme(false);
      setShowMenu(false);
      setScreen(s => s === 'home' ? s : 'home');
      return true; // always intercept
    });
    return () => sub.remove();
  }, []);

  useEffect(() => { loadData(); }, []);

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
            const lq=LOCAL_Q.find(l=>l.img_url===q.img_url);
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

  function goHome() { if(timerRef){clearInterval(timerRef);setTimerRef(null);} setScreen('home'); setShowMenu(false); setShowTheme(false); }

  function startExam(practice=false) {
    const pool=shuffle(questions.map(q=>({...q,opts:shuffle([...q.opts])})));
    const set=practice?pool:pool.slice(0,Math.min(50,pool.length));
    setExamQ(set);setQIdx(0);setScore(0);setErrors(0);
    setAnswered(false);setSelectedOpts([]);setResults([]);setIsPractice(practice);
    setAiText('');
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
    const q=examQ[qIdx];
    const multi=q.is_multi||q.opts.filter(o=>o.ok).length>1;
    if(multi){
      setSelectedOpts(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i]);
    } else {
      setSelectedOpts([i]);
    }
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
    if(!user?.is_premium&&qIdx+1>=freeLimit){if(timerRef)clearInterval(timerRef);setScreen('premium');return;}
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
    const prompt=`Du bist Fahrlehrer. Analysiere diese Prüfung kurz auf Deutsch UND Persisch:
Richtig: ${results.filter(r=>r.correct).length}/${results.length}
Falsch: ${wrong.slice(0,8).map(r=>r.q.text_de).join(', ')}
Gib konkrete Tipps. Max 150 Wörter pro Sprache.`;
    try{
      const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:prompt}]})});
      const d=await r.json();
      setAiText(d.content?.[0]?.text||'Analyse nicht verfügbar');
    }catch(e){setAiText('Fehler bei der Analyse');}
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
              <TouchableOpacity style={{backgroundColor:'#DC2626',borderRadius:10,padding:12,alignItems:'center'}} onPress={()=>{
                Alert.alert(t.logout+'?','Wirklich abmelden?',[
                  {text:'Nein',style:'cancel'},
                  {text:'Ja',onPress:()=>{
                    Alert.alert('Sicher?','Abmeldung bestätigen',[
                      {text:'Abbrechen',style:'cancel'},
                      {text:'Abmelden',onPress:()=>{setUser(null);goHome();}}
                    ]);
                  }}
                ]);
              }}>
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

  const NavBar = () => (
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:12,backgroundColor:T.navBg,borderBottomWidth:1,borderBottomColor:T.border}}>
      <TouchableOpacity onPress={()=>setShowMenu(true)} style={{padding:4,gap:4}}>
        <View style={{height:2,width:22,backgroundColor:T.text}}/>
        <View style={{height:2,width:22,backgroundColor:T.text}}/>
        <View style={{height:2,width:22,backgroundColor:T.text}}/>
      </TouchableOpacity>
      <TouchableOpacity onPress={goHome} style={{flexDirection:'row',alignItems:'center',gap:8}}>
        <Text style={{fontSize:18}}>🚗</Text>
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

  // ── HOME ──
  if(screen==='home') return (
    <View style={{flex:1,backgroundColor:T.bg}}>
      <SafeAreaView style={{flex:1}}>
        <StatusBar barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg}/>
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
            <Text style={{fontSize:24,fontWeight:'900',color:T.text,marginBottom:24}}>{isReg?t.register:t.login}</Text>
            {isReg&&<TextInput style={{borderWidth:1.5,borderColor:T.border,borderRadius:10,padding:13,fontSize:13,marginBottom:12,color:T.text,backgroundColor:T.card}} placeholder="Vollständiger Name" placeholderTextColor={T.sub} value={fullName} onChangeText={setFullName}/>}
            <TextInput style={{borderWidth:1.5,borderColor:T.border,borderRadius:10,padding:13,fontSize:13,marginBottom:12,color:T.text,backgroundColor:T.card}} placeholder="E-Mail" placeholderTextColor={T.sub} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
            <TextInput style={{borderWidth:1.5,borderColor:T.border,borderRadius:10,padding:13,fontSize:13,marginBottom:20,color:T.text,backgroundColor:T.card}} placeholder="Passwort" placeholderTextColor={T.sub} value={password} onChangeText={setPassword} secureTextEntry/>
            <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:12,padding:15,alignItems:'center'}} disabled={loading} onPress={async()=>{
              if(!email||!password){Alert.alert('Fehler','E-Mail und Passwort eingeben');return;}
              setLoading(true);
              if(isReg){
                const r=await sbReq('users','POST',{email,password_hash:password,full_name:fullName||email,language:lang,is_premium:false,created_at:new Date().toISOString()});
                if(r.ok&&Array.isArray(r.data)&&r.data[0]){setUser(r.data[0]);setScreen('home');}
                else Alert.alert('Fehler','Registrierung fehlgeschlagen. E-Mail bereits vorhanden?');
              }else{
                const r=await sbReq(`users?email=eq.${encodeURIComponent(email)}&password_hash=eq.${encodeURIComponent(password)}`);
                if(r.ok&&Array.isArray(r.data)&&r.data[0]){setUser(r.data[0]);setScreen('home');}
                else Alert.alert('Fehler','Falsche E-Mail oder Passwort');
              }
              setLoading(false);
            }}>
              {loading?<ActivityIndicator color="#fff"/>:<Text style={{color:'#fff',fontSize:15,fontWeight:'800'}}>{isReg?t.register:t.login}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setScreen(isReg?'login':'register')} style={{marginTop:16,padding:12}}>
              <Text style={{color:T.accent,textAlign:'center',fontWeight:'600'}}>{isReg?t.login+' →':'Registrieren →'}</Text>
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
      <SafeAreaView style={{flex:1}}>
        <StatusBar barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg}/>
        <NavBar/>
        <ScrollView contentContainerStyle={{padding:24}}>
          <TouchableOpacity style={{marginBottom:20}} onPress={goHome}><Text style={{color:T.accent,fontSize:14}}>{t.back}</Text></TouchableOpacity>
          <Text style={{fontSize:24,fontWeight:'900',color:T.text,marginBottom:24}}>👤 {t.profile}</Text>
          {user?(
            <View>
              <View style={{backgroundColor:T.card,borderRadius:14,padding:18,marginBottom:12,borderWidth:1,borderColor:T.border}}>
                <Text style={{color:T.sub,fontSize:11,marginBottom:6}}>Name</Text>
                <TextInput style={{color:T.text,fontSize:16,fontWeight:'700',borderBottomWidth:1,borderBottomColor:T.border,paddingBottom:8,marginBottom:12}} value={editName||user.full_name} onChangeText={setEditName} placeholderTextColor={T.sub}/>
                <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:10,padding:10,alignItems:'center'}} onPress={async()=>{
                  if(!editName)return;
                  const r=await sbReq(`users?id=eq.${user.id}`,'PATCH',{full_name:editName});
                  if(r.ok){setUser({...user,full_name:editName});Alert.alert('✓','Gespeichert');}
                }}>
                  <Text style={{color:'#fff',fontWeight:'700'}}>💾 Speichern</Text>
                </TouchableOpacity>
              </View>
              <View style={{backgroundColor:T.card,borderRadius:14,padding:18,marginBottom:12,borderWidth:1,borderColor:T.border}}>
                <Text style={{color:T.sub,fontSize:11}}>E-Mail</Text>
                <Text style={{color:T.text,fontSize:15,fontWeight:'600',marginTop:4}}>{user.email}</Text>
              </View>
              <View style={{backgroundColor:T.card,borderRadius:14,padding:18,marginBottom:20,borderWidth:1,borderColor:T.border}}>
                <Text style={{color:T.sub,fontSize:11}}>Status</Text>
                <Text style={{color:user.is_premium?'#16A34A':T.sub,fontSize:15,fontWeight:'700',marginTop:4}}>{user.is_premium?'⭐ Premium':'Free'}</Text>
              </View>
              <TouchableOpacity style={{backgroundColor:'#DC2626',borderRadius:12,padding:14,alignItems:'center',marginBottom:10}} onPress={deleteAccount}>
                <Text style={{color:'#fff',fontWeight:'700'}}>🗑️ {t.deleteAccount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{backgroundColor:T.card,borderRadius:12,padding:14,alignItems:'center',borderWidth:1,borderColor:T.border}} onPress={()=>{
                Alert.alert(t.logout+'?','Wirklich abmelden?',[
                  {text:'Nein',style:'cancel'},
                  {text:'Ja',onPress:()=>{Alert.alert('Sicher?','Abmeldung bestätigen?',[{text:'Nein',style:'cancel'},{text:'Abmelden',onPress:()=>{setUser(null);goHome();}}]);}}
                ]);
              }}>
                <Text style={{color:'#DC2626',fontWeight:'700'}}>🚪 {t.logout}</Text>
              </TouchableOpacity>
            </View>
          ):(
            <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:12,padding:15,alignItems:'center'}} onPress={()=>setScreen('login')}>
              <Text style={{color:'#fff',fontWeight:'800'}}>{t.login}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
      {MenuOverlay}{ThemeOverlay}
    </View>
  );

  // ── CALENDAR ──
  if(screen==='calendar') return (
    <View style={{flex:1,backgroundColor:T.bg}}>
      <SafeAreaView style={{flex:1}}>
        <StatusBar barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg}/>
        <NavBar/>
        <ScrollView contentContainerStyle={{padding:20}}>
          <TouchableOpacity style={{marginBottom:20}} onPress={goHome}><Text style={{color:T.accent,fontSize:14}}>{t.back}</Text></TouchableOpacity>
          <Text style={{fontSize:22,fontWeight:'900',color:T.text,marginBottom:20}}>📅 {t.calendar}</Text>
          <View style={{backgroundColor:T.card,borderRadius:14,padding:16,marginBottom:20,borderWidth:1,borderColor:T.border}}>
            <Text style={{color:T.text,fontSize:14,fontWeight:'700',marginBottom:12}}>+ Neuer Termin</Text>
            <TextInput style={{borderWidth:1,borderColor:T.border,borderRadius:8,padding:10,color:T.text,backgroundColor:T.bg,marginBottom:8,fontSize:13}} placeholder="Titel" placeholderTextColor={T.sub} value={calTitle} onChangeText={setCalTitle}/>
            <TextInput style={{borderWidth:1,borderColor:T.border,borderRadius:8,padding:10,color:T.text,backgroundColor:T.bg,marginBottom:8,fontSize:13}} placeholder="Datum (DD.MM.YYYY)" placeholderTextColor={T.sub} value={calDate} onChangeText={setCalDate} keyboardType="numbers-and-punctuation"/>
            <TextInput style={{borderWidth:1,borderColor:T.border,borderRadius:8,padding:10,color:T.text,backgroundColor:T.bg,marginBottom:12,fontSize:13}} placeholder="Uhrzeit (HH:MM)" placeholderTextColor={T.sub} value={calTime} onChangeText={setCalTime} keyboardType="numbers-and-punctuation"/>
            <TouchableOpacity style={{backgroundColor:T.blue,borderRadius:10,padding:12,alignItems:'center'}} onPress={()=>{
              if(!calDate){Alert.alert('Fehler','Datum eingeben');return;}
              const ev={id:Date.now().toString(),title:calTitle||'Prüfung',date:calDate,time:calTime||'06:00'};
              setCalendar(p=>[...p,ev]);
              setCalDate('');setCalTime('06:00');setCalTitle('Führerausweis Prüfung');
              Alert.alert('✓','Termin gespeichert!');
            }}>
              <Text style={{color:'#fff',fontWeight:'700'}}>💾 Speichern</Text>
            </TouchableOpacity>
          </View>
          {calendar.length===0?<Text style={{color:T.sub,textAlign:'center',marginTop:20}}>Keine Termine</Text>:
          calendar.map(ev=>(
            <View key={ev.id} style={{backgroundColor:T.card,borderRadius:12,padding:16,marginBottom:10,borderWidth:1,borderColor:T.border,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <View>
                <Text style={{color:T.text,fontSize:14,fontWeight:'700'}}>{ev.title}</Text>
                <Text style={{color:T.accent,fontSize:12,marginTop:4}}>📅 {ev.date} ⏰ {ev.time}</Text>
              </View>
              <TouchableOpacity onPress={()=>setCalendar(p=>p.filter(e=>e.id!==ev.id))} style={{backgroundColor:'#DC2626',borderRadius:8,padding:8}}>
                <Text style={{color:'#fff',fontSize:12}}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={{height:40}}/>
        </ScrollView>
      </SafeAreaView>
      {MenuOverlay}{ThemeOverlay}
    </View>
  );

  // ── NEWS ──
  if(screen==='news') return (
    <View style={{flex:1,backgroundColor:T.bg}}>
      <SafeAreaView style={{flex:1}}>
        <StatusBar barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg}/>
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
      {MenuOverlay}{ThemeOverlay}
    </View>
  );

  // ── PREMIUM ──
  if(screen==='premium') return (
    <View style={{flex:1,backgroundColor:T.bg}}>
      <SafeAreaView style={{flex:1}}>
        <StatusBar barStyle={theme==='light'?'dark-content':'light-content'} backgroundColor={T.bg}/>
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
      {MenuOverlay}{ThemeOverlay}
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
          <View style={{flexDirection:'row',justifyContent:'center',gap:20,paddingVertical:8,backgroundColor:T.navBg,borderBottomWidth:1,borderBottomColor:T.border}}>
            <Text style={{fontSize:13,fontWeight:'700',color:'#16A34A'}}>✓ {score}</Text>
            <Text style={{fontSize:13,fontWeight:'700',color:'#DC2626'}}>✗ {errors}</Text>
            {!isPractice&&<Text style={{fontSize:13,fontWeight:'700',color:T.text}}>Pkt: {score*3}/150</Text>}
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
            <TouchableOpacity style={{backgroundColor:'#7C3AED',borderRadius:12,padding:13,alignItems:'center',width:'100%',marginBottom:10}} onPress={()=>setScreen('analysis')}>
              <Text style={{color:'#fff',fontWeight:'700'}}>{t.analysis}</Text>
            </TouchableOpacity>
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
