import React, {useState, useEffect, useRef} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, Image, Dimensions,
  SafeAreaView, StatusBar, Animated, Platform,
} from 'react-native';

const {width, height} = Dimensions.get('window');

// ─── SUPABASE CONFIG ───────────────────────────────────────
const SB_URL = 'https://npfvlfdjngzczxhghmyu.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wZnZsZmRqbmd6Y3p4aGdobXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMTI2NjgsImV4cCI6MjA5NDg4ODY2OH0.oqnB4FTnmj-wno7AEgTz-MAmunazqwpj5jEkvB5xN8s';

async function sbReq(path: string, method = 'GET', body?: any) {
  const prefer = method === 'PATCH' || method === 'DELETE' ? 'return=minimal' : 'return=representation';
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      Prefer: prefer,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (r.status === 204) return {ok: true, data: []};
  const data = await r.json().catch(() => []);
  return {ok: r.ok, data};
}

// ─── COLORS ────────────────────────────────────────────────
const C = {
  blue: '#1B4FD8',
  dark: '#060616',
  white: '#FFFFFF',
  gray: '#6B7280',
  light: '#F3F4F6',
  green: '#16A34A',
  red: '#DC2626',
  yellow: '#D97706',
  border: '#E5E7EB',
};

// ─── QUESTIONS (sample - loads more from Supabase) ─────────
const LOCAL_QUESTIONS = [
  {id:1,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Zeichen_206.svg/200px-Zeichen_206.svg.png',opts:[{text_de:'Halt — Vorfahrt gewähren',ok:true},{text_de:'Einfahrt verboten',ok:false},{text_de:'Parkieren verboten',ok:false}]},
  {id:2,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Zeichen_205.svg/200px-Zeichen_205.svg.png',opts:[{text_de:'Vorfahrt gewähren',ok:true},{text_de:'Vorfahrtsstrasse',ok:false},{text_de:'Halt',ok:false}]},
  {id:3,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Zeichen_274-50.svg/200px-Zeichen_274-50.svg.png',opts:[{text_de:'Höchstgeschwindigkeit 50 km/h',ok:true},{text_de:'Mindestgeschwindigkeit 50 km/h',ok:false},{text_de:'Empfohlene Geschwindigkeit',ok:false}]},
  {id:4,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Zeichen_274-120.svg/200px-Zeichen_274-120.svg.png',opts:[{text_de:'Höchstgeschwindigkeit 120 km/h',ok:true},{text_de:'130 km/h',ok:false},{text_de:'100 km/h',ok:false}]},
  {id:5,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Zeichen_276.svg/200px-Zeichen_276.svg.png',opts:[{text_de:'Überholen verboten',ok:true},{text_de:'Gegenverkehr',ok:false},{text_de:'Einbahnstrasse',ok:false}]},
  {id:6,text_de:'Welches ist die Höchstgeschwindigkeit auf Schweizer Autobahnen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Zeichen_274-120.svg/200px-Zeichen_274-120.svg.png',opts:[{text_de:'120 km/h',ok:true},{text_de:'130 km/h',ok:false},{text_de:'100 km/h',ok:false}]},
  {id:7,text_de:'Wer hat Vortritt an einer Kreuzung ohne Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Zeichen_102.svg/200px-Zeichen_102.svg.png',opts:[{text_de:'Fahrzeuge von rechts',ok:true},{text_de:'Fahrzeuge von links',ok:false},{text_de:'Wer zuerst kommt',ok:false}]},
  {id:8,text_de:'Wie viel Promille Alkohol ist beim Fahren erlaubt?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Zeichen_274-50.svg/200px-Zeichen_274-50.svg.png',opts:[{text_de:'0,5 Promille (Neulenker: 0,1)',ok:true},{text_de:'0,8 Promille',ok:false},{text_de:'0,0 Promille',ok:false}]},
  {id:9,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Zeichen_286.svg/200px-Zeichen_286.svg.png',opts:[{text_de:'Halten und Parkieren verboten',ok:true},{text_de:'Nur Parkieren verboten',ok:false},{text_de:'Einfahrt verboten',ok:false}]},
  {id:10,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Zeichen_201.svg/200px-Zeichen_201.svg.png',opts:[{text_de:'Bahnübergang ohne Schranken',ok:true},{text_de:'Bahnübergang mit Schranken',ok:false},{text_de:'Haltestelle',ok:false}]},
  {id:11,text_de:'Ist der Sicherheitsgurt Pflicht?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Zeichen_101.svg/200px-Zeichen_101.svg.png',opts:[{text_de:'Ja, für alle Insassen',ok:true},{text_de:'Nur für Fahrer',ok:false},{text_de:'Freiwillig',ok:false}]},
  {id:12,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Zeichen_301.svg/200px-Zeichen_301.svg.png',opts:[{text_de:'Ich habe Vorfahrt',ok:true},{text_de:'Vorfahrt gewähren',ok:false},{text_de:'Halt',ok:false}]},
  {id:13,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Zeichen_350-10.svg/200px-Zeichen_350-10.svg.png',opts:[{text_de:'Fussgängerstreifen',ok:true},{text_de:'Schulübergang',ok:false},{text_de:'Spielstrasse',ok:false}]},
  {id:14,text_de:'Darf man auf der Autobahn wenden?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Zeichen_330.1.svg/200px-Zeichen_330.1.svg.png',opts:[{text_de:'Nein, verboten',ok:true},{text_de:'Ja, wenn frei',ok:false},{text_de:'Auf Notspuren',ok:false}]},
  {id:15,text_de:'Muss man tagsüber Licht fahren?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Zeichen_101.svg/200px-Zeichen_101.svg.png',opts:[{text_de:'Ja, Tagfahrlicht ist Pflicht',ok:true},{text_de:'Nein, nur nachts',ok:false},{text_de:'Nur im Winter',ok:false}]},
  {id:16,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Zeichen_327.svg/200px-Zeichen_327.svg.png',opts:[{text_de:'Tunnel',ok:true},{text_de:'Unterführung',ok:false},{text_de:'Brücke',ok:false}]},
  {id:17,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Zeichen_101.svg/200px-Zeichen_101.svg.png',opts:[{text_de:'Gefahrenstelle',ok:true},{text_de:'Baustelle',ok:false},{text_de:'Schule',ok:false}]},
  {id:18,text_de:'Welches ist die Höchstgeschwindigkeit ausserhalb der Ortschaft?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Zeichen_274-80.svg/200px-Zeichen_274-80.svg.png',opts:[{text_de:'80 km/h',ok:true},{text_de:'100 km/h',ok:false},{text_de:'60 km/h',ok:false}]},
  {id:19,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Zeichen_267.svg/200px-Zeichen_267.svg.png',opts:[{text_de:'Einfahrt verboten',ok:true},{text_de:'Halt',ok:false},{text_de:'Parkieren verboten',ok:false}]},
  {id:20,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Zeichen_330.1.svg/200px-Zeichen_330.1.svg.png',opts:[{text_de:'Beginn der Autobahn',ok:true},{text_de:'Ende der Autobahn',ok:false},{text_de:'Schnellstrasse',ok:false}]},
  {id:21,text_de:'Was bedeutet eine gelbe Linie am Strassenrand?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Zeichen_286.svg/200px-Zeichen_286.svg.png',opts:[{text_de:'Halteverbot',ok:true},{text_de:'Parkverbot',ok:false},{text_de:'Keine Bedeutung',ok:false}]},
  {id:22,text_de:'Darf man mit dem Handy telefonieren beim Fahren?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Zeichen_101.svg/200px-Zeichen_101.svg.png',opts:[{text_de:'Nein, verboten ohne Freisprechanlage',ok:true},{text_de:'Ja, kurz schon',ok:false},{text_de:'Nur bei Stopp',ok:false}]},
  {id:23,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Zeichen_280.svg/200px-Zeichen_280.svg.png',opts:[{text_de:'Parkieren verboten',ok:true},{text_de:'Halten verboten',ok:false},{text_de:'Einfahrt verboten',ok:false}]},
  {id:24,text_de:'Was ist die Vignette in der Schweiz?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Zeichen_330.1.svg/200px-Zeichen_330.1.svg.png',opts:[{text_de:'Jahresgebühr für Autobahn — CHF 40',ok:true},{text_de:'Versicherungsnachweis',ok:false},{text_de:'Führerausweis',ok:false}]},
  {id:25,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Zeichen_268.svg/200px-Zeichen_268.svg.png',opts:[{text_de:'Schneeketten obligatorisch',ok:true},{text_de:'Winterreifen obligatorisch',ok:false},{text_de:'Vorsicht Schnee',ok:false}]},
];

function shuffle(arr: any[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── MAIN APP ──────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<'home'|'login'|'register'|'exam'|'result'|'practice'|'practiceResult'>('home');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);

  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Exam state
  const [examQ, setExamQ] = useState<any[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<number|null>(null);
  const [timeLeft, setTimeLeft] = useState(2700);
  const [timer, setTimer] = useState<any>(null);
  const [wrongQs, setWrongQs] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {toValue: 1, duration: 400, useNativeDriver: true}).start();
  }, [screen]);

  async function loadQuestions() {
    try {
      const r = await sbReq('questions?is_active=eq.true&order=id.asc&limit=500');
      if (r.ok && Array.isArray(r.data) && r.data.length > 0) {
        const ra = await sbReq('answers?order=question_id.asc,id.asc&limit=2000');
        if (ra.ok && Array.isArray(ra.data)) {
          const qs = r.data.map((q: any) => ({
            ...q,
            opts: ra.data.filter((a: any) => a.question_id === q.id).map((a: any) => ({
              text_de: a.text_de,
              ok: a.is_correct,
            })),
          })).filter((q: any) => q.opts.length >= 2);
          setQuestions(qs.length > 0 ? qs : LOCAL_QUESTIONS);
          return;
        }
      }
    } catch (e) {}
    setQuestions(LOCAL_QUESTIONS);
  }

  async function doLogin() {
    if (!email || !password) {Alert.alert('Hata', 'E-mail ve şifre gerekli'); return;}
    setLoading(true);
    try {
      const r = await sbReq(`users?email=eq.${encodeURIComponent(email)}&password_hash=eq.${encodeURIComponent(password)}&select=*`);
      if (r.ok && Array.isArray(r.data) && r.data.length > 0) {
        setUser(r.data[0]);
        await sbReq(`users?id=eq.${r.data[0].id}`, 'PATCH', {last_login: new Date().toISOString()});
        setScreen('home');
      } else {
        Alert.alert('Hata', 'E-mail veya şifre yanlış');
      }
    } catch (e) {Alert.alert('Hata', 'Bağlantı sorunu');}
    setLoading(false);
  }

  async function doRegister() {
    if (!email || !password || !fullName) {Alert.alert('Hata', 'Tüm alanları doldurun'); return;}
    setLoading(true);
    try {
      const r = await sbReq('users', 'POST', {
        email, password_hash: password, full_name: fullName,
        language: 'de', is_premium: false, created_at: new Date().toISOString(),
      });
      if (r.ok && Array.isArray(r.data) && r.data.length > 0) {
        setUser(r.data[0]);
        setScreen('home');
      } else {
        Alert.alert('Hata', 'Kayıt başarısız. E-mail zaten kayıtlı olabilir.');
      }
    } catch (e) {Alert.alert('Hata', 'Bağlantı sorunu');}
    setLoading(false);
  }

  function startExam() {
    const pool = shuffle(questions.length > 0 ? questions : LOCAL_QUESTIONS);
    const examSet = pool.slice(0, Math.min(50, pool.length));
    setExamQ(examSet);
    setQIdx(0); setScore(0); setErrors(0);
    setAnswered(false); setSelectedOpt(null);
    setWrongQs([]); setExamResults([]);
    setTimeLeft(2700);
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {clearInterval(t); return 0;}
        return prev - 1;
      });
    }, 1000);
    setTimer(t);
    fadeAnim.setValue(0);
    setScreen('exam');
  }

  function startPractice() {
    const pool = shuffle(questions.length > 0 ? questions : LOCAL_QUESTIONS);
    setExamQ(pool);
    setQIdx(0); setScore(0); setErrors(0);
    setAnswered(false); setSelectedOpt(null);
    setWrongQs([]); setExamResults([]);
    fadeAnim.setValue(0);
    setScreen('practice');
  }

  function pickAnswer(optIdx: number, correct: boolean) {
    if (answered) return;
    setAnswered(true);
    setSelectedOpt(optIdx);
    if (correct) {setScore(s => s + 1);}
    else {
      setErrors(e => e + 1);
      setWrongQs(w => [...w, examQ[qIdx]]);
    }
    setExamResults(r => [...r, {q: examQ[qIdx], correct, optIdx}]);
  }

  function nextQuestion() {
    const FREE_LIMIT = 20;
    if (!user?.is_premium && qIdx + 1 >= FREE_LIMIT) {
      if (timer) clearInterval(timer);
      Alert.alert(
        '⭐ Premium erforderlich',
        'Für unbegrenzten Zugang bitte Premium kaufen.',
        [{text: 'OK', onPress: () => finishExam()}]
      );
      return;
    }
    if (qIdx + 1 >= examQ.length) {finishExam(); return;}
    setQIdx(i => i + 1);
    setAnswered(false);
    setSelectedOpt(null);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {toValue: 1, duration: 300, useNativeDriver: true}).start();
  }

  function finishExam() {
    if (timer) clearInterval(timer);
    setScreen(screen === 'exam' ? 'result' : 'practiceResult');
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  const currentQ = examQ[qIdx];
  const isPractice = screen === 'practice';

  // ─── HOME SCREEN ─────────────────────────────────────────
  if (screen === 'home') {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.dark} />
        <ScrollView style={s.homeScroll} showsVerticalScrollIndicator={false}>
          {/* HEADER */}
          <View style={s.homeHeader}>
            <View style={s.logoRow}>
              <Text style={s.logoIcon}>🚗</Text>
              <Text style={s.logoText}>Fahr<Text style={{color:'#60A5FA'}}>Ready</Text></Text>
            </View>
            {user ? (
              <TouchableOpacity onPress={() => {setUser(null); setEmail(''); setPassword('');}}>
                <Text style={s.logoutBtn}>Abmelden</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setScreen('login')}>
                <Text style={s.loginBtn}>Anmelden</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* HERO */}
          <View style={s.hero}>
            <View style={s.heroBadge}><Text style={s.heroBadgeText}>🇨🇭 Offizielle Schweizer Theorieprüfung</Text></View>
            <Text style={s.heroTitle}>Bestehe deine{'\n'}<Text style={{color:'#60A5FA'}}>Fahrprüfung</Text></Text>
            <Text style={s.heroSub}>Auf Persisch · Deutsch · Englisch</Text>
            {user && <Text style={s.welcomeText}>Willkommen, {user.full_name?.split(' ')[0]}! {user.is_premium ? '⭐' : ''}</Text>}
          </View>

          {/* STATS */}
          <View style={s.statsRow}>
            {[['50','Fragen'],['45','Minuten'],['135','Punkte zum Bestehen'],['4','Sprachen']].map(([n,l]) => (
              <View key={l} style={s.statCard}>
                <Text style={s.statN}>{n}</Text>
                <Text style={s.statL}>{l}</Text>
              </View>
            ))}
          </View>

          {/* BUTTONS */}
          <View style={s.btnsSection}>
            <TouchableOpacity style={s.btnPrimary} onPress={startExam}>
              <Text style={s.btnPrimaryText}>▶ Prüfung starten</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnSecondary} onPress={startPractice}>
              <Text style={s.btnSecondaryText}>📚 Lernen / Hazırlık</Text>
            </TouchableOpacity>
            {!user && (
              <TouchableOpacity style={s.btnOutline} onPress={() => setScreen('register')}>
                <Text style={s.btnOutlineText}>✓ Kostenlos registrieren</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* INFO */}
          <View style={s.infoCard}>
            <Text style={s.infoTitle}>ℹ️ Prüfungsregeln</Text>
            <Text style={s.infoText}>• 50 Fragen, 45 Minuten{'\n'}• 3 Punkte pro richtige Antwort{'\n'}• Bestehen: mindestens 135 Punkte{'\n'}• 20 Fragen kostenlos — dann Premium</Text>
          </View>

          <View style={{height: 40}} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── LOGIN SCREEN ─────────────────────────────────────────
  if (screen === 'login' || screen === 'register') {
    const isReg = screen === 'register';
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.authContainer}>
          <TouchableOpacity style={s.backBtn} onPress={() => setScreen('home')}>
            <Text style={s.backBtnText}>← Zurück</Text>
          </TouchableOpacity>
          <Text style={s.authTitle}>{isReg ? 'Registrieren' : 'Anmelden'}</Text>
          <Text style={s.authSub}>{isReg ? 'Kostenloses Konto erstellen' : 'Mit deinem Konto anmelden'}</Text>

          {isReg && (
            <TextInput style={s.input} placeholder="Vollständiger Name" value={fullName}
              onChangeText={setFullName} placeholderTextColor={C.gray} />
          )}
          <TextInput style={s.input} placeholder="E-Mail" value={email}
            onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
            placeholderTextColor={C.gray} />
          <TextInput style={s.input} placeholder="Passwort" value={password}
            onChangeText={setPassword} secureTextEntry placeholderTextColor={C.gray} />

          <TouchableOpacity style={s.btnPrimary} onPress={isReg ? doRegister : doLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnPrimaryText}>{isReg ? 'Registrieren' : 'Anmelden'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setScreen(isReg ? 'login' : 'register')}>
            <Text style={s.switchAuth}>{isReg ? 'Bereits registriert? Anmelden' : 'Noch kein Konto? Registrieren'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── EXAM / PRACTICE SCREEN ──────────────────────────────
  if ((screen === 'exam' || screen === 'practice') && currentQ) {
    const opts = currentQ.opts || [];
    const pct = Math.round((qIdx / examQ.length) * 100);

    return (
      <SafeAreaView style={[s.safe, {backgroundColor: '#F8FAFF'}]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />

        {/* HEADER */}
        <View style={s.examHeader}>
          <TouchableOpacity onPress={() => {if(timer)clearInterval(timer); setScreen('home');}}>
            <Text style={s.examBack}>✕</Text>
          </TouchableOpacity>
          <Text style={s.examCounter}>{qIdx + 1} / {Math.min(examQ.length, isPractice ? examQ.length : 50)}</Text>
          {!isPractice && <Text style={s.examTimer}>{formatTime(timeLeft)}</Text>}
          {isPractice && <Text style={s.examTimer}>📚 Lernen</Text>}
        </View>

        {/* PROGRESS */}
        <View style={s.progressTrack}>
          <View style={[s.progressFill, {width: `${pct}%` as any}]} />
        </View>

        {/* SCORE */}
        <View style={s.scoreRow}>
          <Text style={[s.scoreItem, {color: C.green}]}>✓ {score}</Text>
          <Text style={[s.scoreItem, {color: C.red}]}>✗ {errors}</Text>
          {!isPractice && <Text style={s.scoreItem}>Pkt: {score * 3}</Text>}
        </View>

        <ScrollView style={s.examScroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={{opacity: fadeAnim}}>
            {/* IMAGE */}
            {currentQ.img_url ? (
              <Image source={{uri: currentQ.img_url}} style={s.qImg} resizeMode="contain" />
            ) : null}

            {/* QUESTION */}
            <Text style={s.qText}>{currentQ.text_de}</Text>

            {/* OPTIONS */}
            {opts.map((opt: any, i: number) => {
              let optStyle = s.optBtn;
              let optTextStyle = s.optText;
              if (answered) {
                if (opt.ok) {optStyle = {...s.optBtn, ...s.optCorrect} as any; optTextStyle = {...s.optText, color: C.green} as any;}
                else if (selectedOpt === i && !opt.ok) {optStyle = {...s.optBtn, ...s.optWrong} as any; optTextStyle = {...s.optText, color: C.red} as any;}
              }
              return (
                <TouchableOpacity key={i} style={optStyle} onPress={() => pickAnswer(i, opt.ok)} disabled={answered}>
                  <View style={s.optLetter}><Text style={s.optLetterText}>{['A','B','C','D'][i]}</Text></View>
                  <Text style={optTextStyle}>{opt.text_de}</Text>
                </TouchableOpacity>
              );
            })}

            {answered && (
              <View style={[s.feedbackBox, {backgroundColor: opts[selectedOpt!]?.ok ? '#DCFCE7' : '#FEF2F2'}]}>
                <Text style={[s.feedbackText, {color: opts[selectedOpt!]?.ok ? C.green : C.red}]}>
                  {opts[selectedOpt!]?.ok ? '✓ Richtig!' : '✗ Falsch!'}
                </Text>
                {!opts[selectedOpt!]?.ok && (
                  <Text style={s.correctAnswerText}>
                    Richtig: {opts.find((o:any) => o.ok)?.text_de}
                  </Text>
                )}
              </View>
            )}

            {answered && (
              <TouchableOpacity style={s.nextBtn} onPress={nextQuestion}>
                <Text style={s.nextBtnText}>
                  {qIdx + 1 >= examQ.length ? 'Fertig →' : 'Weiter →'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={{height: 40}} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── RESULT SCREEN ────────────────────────────────────────
  if (screen === 'result' || screen === 'practiceResult') {
    const total = examResults.length;
    const correct = examResults.filter(r => r.correct).length;
    const wrong = examResults.filter(r => !r.correct).length;
    const pts = correct * 3;
    const passed = pts >= 135;
    const rate = total > 0 ? Math.round(correct / total * 100) : 0;

    return (
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.resultContainer}>
          <Text style={s.resultIcon}>{passed || screen === 'practiceResult' ? '🎓' : '😔'}</Text>
          <Text style={s.resultTitle}>
            {screen === 'practiceResult' ? 'Übung abgeschlossen!' : passed ? 'Bestanden! 🎉' : 'Nicht bestanden'}
          </Text>

          <View style={s.resultStats}>
            <View style={s.resultStat}><Text style={[s.resultStatN, {color: C.blue}]}>{total}</Text><Text style={s.resultStatL}>Gesamt</Text></View>
            <View style={s.resultStat}><Text style={[s.resultStatN, {color: C.green}]}>{correct}</Text><Text style={s.resultStatL}>Richtig</Text></View>
            <View style={s.resultStat}><Text style={[s.resultStatN, {color: C.red}]}>{wrong}</Text><Text style={s.resultStatL}>Falsch</Text></View>
            {screen === 'result' && <View style={s.resultStat}><Text style={[s.resultStatN, {color: passed ? C.green : C.red}]}>{pts}</Text><Text style={s.resultStatL}>Punkte</Text></View>}
            {screen === 'practiceResult' && <View style={s.resultStat}><Text style={[s.resultStatN, {color: C.blue}]}>{rate}%</Text><Text style={s.resultStatL}>Erfolg</Text></View>}
          </View>

          {wrongQs.length > 0 && (
            <View style={s.wrongSection}>
              <Text style={s.wrongTitle}>✗ Falsche Antworten ({wrongQs.length})</Text>
              {wrongQs.map((q, i) => (
                <View key={i} style={s.wrongItem}>
                  {q.img_url ? <Image source={{uri: q.img_url}} style={s.wrongImg} resizeMode="contain" /> : null}
                  <Text style={s.wrongQ}>{q.text_de}</Text>
                  <Text style={s.wrongCorrect}>✓ {q.opts?.find((o:any) => o.ok)?.text_de}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={s.btnPrimary} onPress={() => screen === 'result' ? startExam() : startPractice()}>
            <Text style={s.btnPrimaryText}>🔁 Nochmal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnSecondary, {marginTop: 10}]} onPress={() => setScreen('home')}>
            <Text style={s.btnSecondaryText}>← Startseite</Text>
          </TouchableOpacity>
          <View style={{height: 40}} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return <View style={s.safe}><ActivityIndicator size="large" color={C.blue} style={{flex:1}} /></View>;
}

// ─── STYLES ────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: C.dark},
  homeScroll: {flex: 1},
  homeHeader: {flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:20,paddingTop:10},
  logoRow: {flexDirection:'row',alignItems:'center',gap:8},
  logoIcon: {fontSize:24},
  logoText: {fontSize:20,fontWeight:'900',color:C.white},
  loginBtn: {color:'#60A5FA',fontWeight:'700',fontSize:14},
  logoutBtn: {color:C.gray,fontWeight:'600',fontSize:13},
  hero: {padding:24,paddingTop:10},
  heroBadge: {backgroundColor:'rgba(255,255,255,0.1)',borderRadius:20,paddingHorizontal:12,paddingVertical:5,alignSelf:'flex-start',marginBottom:14},
  heroBadgeText: {color:'rgba(255,255,255,0.7)',fontSize:11,fontWeight:'600'},
  heroTitle: {fontSize:32,fontWeight:'900',color:C.white,lineHeight:40,marginBottom:10},
  heroSub: {fontSize:14,color:'rgba(255,255,255,0.5)',marginBottom:8},
  welcomeText: {fontSize:14,color:'#60A5FA',fontWeight:'600',marginTop:8},
  statsRow: {flexDirection:'row',flexWrap:'wrap',gap:10,paddingHorizontal:20,marginBottom:24},
  statCard: {flex:1,minWidth:'22%',backgroundColor:'rgba(255,255,255,0.06)',borderRadius:12,padding:12,alignItems:'center'},
  statN: {fontSize:22,fontWeight:'900',color:C.white},
  statL: {fontSize:9,color:'rgba(255,255,255,0.4)',textAlign:'center',marginTop:2},
  btnsSection: {paddingHorizontal:20,gap:12,marginBottom:24},
  btnPrimary: {backgroundColor:C.blue,borderRadius:14,padding:16,alignItems:'center'},
  btnPrimaryText: {color:C.white,fontSize:16,fontWeight:'800'},
  btnSecondary: {backgroundColor:'rgba(255,255,255,0.1)',borderRadius:14,padding:16,alignItems:'center',borderWidth:1,borderColor:'rgba(255,255,255,0.15)'},
  btnSecondaryText: {color:C.white,fontSize:15,fontWeight:'700'},
  btnOutline: {borderRadius:14,padding:14,alignItems:'center',borderWidth:1.5,borderColor:'rgba(255,255,255,0.25)'},
  btnOutlineText: {color:'rgba(255,255,255,0.7)',fontSize:14,fontWeight:'600'},
  infoCard: {marginHorizontal:20,backgroundColor:'rgba(255,255,255,0.05)',borderRadius:14,padding:18,marginBottom:20},
  infoTitle: {color:C.white,fontWeight:'700',fontSize:14,marginBottom:10},
  infoText: {color:'rgba(255,255,255,0.6)',fontSize:13,lineHeight:22},
  authContainer: {padding:24,flexGrow:1,backgroundColor:C.white},
  backBtn: {marginBottom:24},
  backBtnText: {color:C.blue,fontSize:14,fontWeight:'600'},
  authTitle: {fontSize:26,fontWeight:'900',color:C.dark,marginBottom:6},
  authSub: {fontSize:14,color:C.gray,marginBottom:28},
  input: {borderWidth:1.5,borderColor:C.border,borderRadius:10,padding:14,fontSize:14,marginBottom:14,color:C.dark,backgroundColor:'#F9FAFB'},
  switchAuth: {color:C.blue,textAlign:'center',marginTop:20,fontWeight:'600'},
  examHeader: {flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:12,backgroundColor:C.white,borderBottomWidth:1,borderBottomColor:C.border},
  examBack: {fontSize:18,color:C.gray,fontWeight:'700',padding:4},
  examCounter: {fontSize:13,fontWeight:'700',color:C.dark},
  examTimer: {fontSize:13,fontWeight:'700',color:C.blue},
  progressTrack: {height:4,backgroundColor:C.light},
  progressFill: {height:4,backgroundColor:C.blue},
  scoreRow: {flexDirection:'row',justifyContent:'center',gap:20,paddingVertical:10,backgroundColor:C.white,borderBottomWidth:1,borderBottomColor:C.border},
  scoreItem: {fontSize:13,fontWeight:'700',color:C.dark},
  examScroll: {flex:1,padding:16},
  qImg: {width:'100%',height:180,borderRadius:12,marginBottom:16,backgroundColor:C.light},
  qText: {fontSize:17,fontWeight:'800',color:C.dark,marginBottom:16,lineHeight:24},
  optBtn: {flexDirection:'row',alignItems:'center',gap:12,padding:14,backgroundColor:C.white,borderRadius:12,marginBottom:10,borderWidth:1.5,borderColor:C.border},
  optCorrect: {backgroundColor:'#DCFCE7',borderColor:C.green},
  optWrong: {backgroundColor:'#FEF2F2',borderColor:C.red},
  optLetter: {width:28,height:28,borderRadius:14,backgroundColor:C.light,alignItems:'center',justifyContent:'center'},
  optLetterText: {fontSize:12,fontWeight:'700',color:C.dark},
  optText: {flex:1,fontSize:13,color:C.dark,fontWeight:'500'},
  feedbackBox: {borderRadius:10,padding:12,marginBottom:12},
  feedbackText: {fontSize:15,fontWeight:'800',textAlign:'center'},
  correctAnswerText: {fontSize:12,color:C.green,textAlign:'center',marginTop:6},
  nextBtn: {backgroundColor:C.blue,borderRadius:12,padding:14,alignItems:'center',marginTop:4},
  nextBtnText: {color:C.white,fontSize:15,fontWeight:'800'},
  resultContainer: {padding:24,alignItems:'center',backgroundColor:C.white,flexGrow:1},
  resultIcon: {fontSize:60,marginTop:20,marginBottom:10},
  resultTitle: {fontSize:24,fontWeight:'900',color:C.dark,marginBottom:24,textAlign:'center'},
  resultStats: {flexDirection:'row',gap:12,marginBottom:28,flexWrap:'wrap',justifyContent:'center'},
  resultStat: {backgroundColor:C.light,borderRadius:12,padding:14,alignItems:'center',minWidth:70},
  resultStatN: {fontSize:24,fontWeight:'900'},
  resultStatL: {fontSize:10,color:C.gray,marginTop:2},
  wrongSection: {width:'100%',marginBottom:24},
  wrongTitle: {fontSize:14,fontWeight:'700',color:C.red,marginBottom:12},
  wrongItem: {backgroundColor:'#FEF2F2',borderRadius:10,padding:12,marginBottom:8},
  wrongImg: {width:'100%',height:80,borderRadius:6,marginBottom:6},
  wrongQ: {fontSize:12,fontWeight:'600',color:C.dark,marginBottom:4},
  wrongCorrect: {fontSize:12,color:C.green,fontWeight:'600'},
});
