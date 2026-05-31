import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, Image, Dimensions,
  SafeAreaView, StatusBar, Animated, BackHandler,
  Modal, FlatList, Platform,
} from 'react-native';

const {width, height} = Dimensions.get('window');

const SB_URL = 'https://npfvlfdjngzczxhghmyu.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wZnZsZmRqbmd6Y3p4aGdobXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMTI2NjgsImV4cCI6MjA5NDg4ODY2OH0.oqnB4FTnmj-wno7AEgTz-MAmunazqwpj5jEkvB5xN8s';
const EXAM_FREE = 5;
const PRACTICE_FREE = 10;

async function sbReq(path, method = 'GET', body) {
  const prefer = method === 'PATCH' || method === 'DELETE' ? 'return=minimal' : 'return=representation';
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
      method, headers: {apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: prefer},
      body: body ? JSON.stringify(body) : undefined,
    });
    if (r.status === 204) return {ok: true, data: []};
    const data = await r.json().catch(() => []);
    return {ok: r.ok, data};
  } catch (e) { return {ok: false, data: []}; }
}

const C = {blue:'#1B4FD8', dark:'#060616', white:'#FFFFFF', gray:'#6B7280', light:'#F3F4F6', green:'#16A34A', red:'#DC2626', border:'#E5E7EB', card:'#1a1a2e'};

const TX = {
  de: {anmelden:'Anmelden', abmelden:'Abmelden', registrieren:'Registrieren', pruefung:'Prüfung', vorbereitung:'Vorbereitung', nachrichten:'Nachrichten', home:'Start', fragen:'Fragen', minuten:'Minuten', punkte:'Punkte', sprachen:'Sprachen', starten:'▶ Prüfung starten', lernen:'📚 Lernen / Vorbereitung', kostenlos:'✓ Kostenlos registrieren', regeln:'Prüfungsregeln', r1:'50 Fragen, 45 Minuten', r2:'3 Punkte pro richtige Antwort', r3:'Bestehen: mindestens 135 Punkte', r4:'20 Fragen kostenlos', richtig:'✓ Richtig!', falsch:'✗ Falsch!', weiter:'Weiter →', fertig:'Ergebnis →', bestanden:'Bestanden! 🎉', nichtBestanden:'Nicht bestanden 😔', gesamt:'Gesamt', ergebnis:'Ergebnis', nochmal:'🔁 Nochmal', start:'← Startseite', neuigkeiten:'Aktuelle Neuigkeiten', werbung:'WERBUNG', premium:'⭐ Premium erforderlich', premiumMsg:'Für unbegrenzten Zugang bitte Premium kaufen.'},
  fa: {anmelden:'ورود', abmelden:'خروج', registrieren:'ثبت‌نام', pruefung:'آزمون', vorbereitung:'آمادگی', nachrichten:'اخبار', home:'خانه', fragen:'سوال', minuten:'دقیقه', punkte:'امتیاز', sprachen:'زبان', starten:'▶ شروع آزمون', lernen:'📚 آمادگی و یادگیری', kostenlos:'✓ ثبت‌نام رایگان', regeln:'قوانین آزمون', r1:'۵۰ سوال، ۴۵ دقیقه', r2:'۳ امتیاز به ازای هر پاسخ صحیح', r3:'قبولی: حداقل ۱۳۵ امتیاز', r4:'۲۰ سوال رایگان', richtig:'✓ درست!', falsch:'✗ نادرست!', weiter:'بعدی ←', fertig:'نتیجه ←', bestanden:'قبول شدید! 🎉', nichtBestanden:'قبول نشدید 😔', gesamt:'کل', ergebnis:'نتیجه', nochmal:'🔁 دوباره', start:'← صفحه اصلی', neuigkeiten:'اخبار جدید', werbung:'تبلیغ', premium:'⭐ اشتراک ویژه لازم است', premiumMsg:'برای دسترسی نامحدود اشتراک ویژه بگیرید.'},
  az: {anmelden:'Daxil ol', abmelden:'Çıxış', registrieren:'Qeydiyyat', pruefung:'İmtahan', vorbereitung:'Hazırlıq', nachrichten:'Xəbərlər', home:'Ana səhifə', fragen:'Sual', minuten:'Dəqiqə', punkte:'Xal', sprachen:'Dil', starten:'▶ İmtahanı başlat', lernen:'📚 Öyrən / Hazırlıq', kostenlos:'✓ Pulsuz qeydiyyat', regeln:'İmtahan qaydaları', r1:'50 sual, 45 dəqiqə', r2:'Hər düzgün cavab 3 xal', r3:'Keçmək üçün ən azı 135 xal', r4:'20 sual pulsuz', richtig:'✓ Düzgün!', falsch:'✗ Yanlış!', weiter:'Növbəti →', fertig:'Nəticə →', bestanden:'Keçdiniz! 🎉', nichtBestanden:'Keçmədiniz 😔', gesamt:'Cəmi', ergebnis:'Nəticə', nochmal:'🔁 Yenidən', start:'← Ana səhifə', neuigkeiten:'Son xəbərlər', werbung:'REKLAM', premium:'⭐ Premium tələb olunur', premiumMsg:'Limitsiz giriş üçün premium alın.'},
  en: {anmelden:'Login', abmelden:'Logout', registrieren:'Register', pruefung:'Exam', vorbereitung:'Practice', nachrichten:'News', home:'Home', fragen:'Questions', minuten:'Minutes', punkte:'Points', sprachen:'Languages', starten:'▶ Start Exam', lernen:'📚 Learn / Practice', kostenlos:'✓ Register Free', regeln:'Exam Rules', r1:'50 questions, 45 minutes', r2:'3 points per correct answer', r3:'Pass: at least 135 points', r4:'20 questions free', richtig:'✓ Correct!', falsch:'✗ Wrong!', weiter:'Next →', fertig:'Result →', bestanden:'Passed! 🎉', nichtBestanden:'Failed 😔', gesamt:'Total', ergebnis:'Result', nochmal:'🔁 Again', start:'← Home', neuigkeiten:'Latest News', werbung:'AD', premium:'⭐ Premium required', premiumMsg:'Get premium for unlimited access.'},
};

const LOCAL_Q = [
  {id:1,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Zeichen_206.svg/200px-Zeichen_206.svg.png',opts:[{text_de:'Halt — Vorfahrt gewähren',ok:true},{text_de:'Einfahrt verboten',ok:false},{text_de:'Parkieren verboten',ok:false}]},
  {id:2,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Zeichen_205.svg/200px-Zeichen_205.svg.png',opts:[{text_de:'Vorfahrt gewähren',ok:true},{text_de:'Vorfahrtsstrasse',ok:false},{text_de:'Halt',ok:false}]},
  {id:3,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Zeichen_274-50.svg/200px-Zeichen_274-50.svg.png',opts:[{text_de:'Höchstgeschwindigkeit 50 km/h',ok:true},{text_de:'Mindestgeschwindigkeit 50',ok:false},{text_de:'Empfohlene Geschwindigkeit',ok:false}]},
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
  {id:26,text_de:'Welches ist die Höchstgeschwindigkeit innerhalb einer Ortschaft?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Zeichen_274-50.svg/200px-Zeichen_274-50.svg.png',opts:[{text_de:'50 km/h',ok:true},{text_de:'60 km/h',ok:false},{text_de:'80 km/h',ok:false}]},
  {id:27,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Zeichen_314.svg/200px-Zeichen_314.svg.png',opts:[{text_de:'Parkplatz',ok:true},{text_de:'Halteverbot aufgehoben',ok:false},{text_de:'Pannenhilfe',ok:false}]},
  {id:28,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Zeichen_215.svg/200px-Zeichen_215.svg.png',opts:[{text_de:'Kreisverkehr',ok:true},{text_de:'Kreuzung',ok:false},{text_de:'Wendeverbot',ok:false}]},
  {id:29,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Zeichen_306.svg/200px-Zeichen_306.svg.png',opts:[{text_de:'Vorfahrtsstrasse',ok:true},{text_de:'Ende der Vorfahrtsstrasse',ok:false},{text_de:'Kreisverkehr',ok:false}]},
  {id:30,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Zeichen_108.svg/200px-Zeichen_108.svg.png',opts:[{text_de:'Gefälle',ok:true},{text_de:'Steigung',ok:false},{text_de:'Schlechte Strasse',ok:false}]},
  {id:31,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Zeichen_107.svg/200px-Zeichen_107.svg.png',opts:[{text_de:'Steigung',ok:true},{text_de:'Gefälle',ok:false},{text_de:'Unebenheiten',ok:false}]},
  {id:32,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Zeichen_307.svg/200px-Zeichen_307.svg.png',opts:[{text_de:'Ende der Vorfahrtsstrasse',ok:true},{text_de:'Vorfahrtsstrasse',ok:false},{text_de:'Halt',ok:false}]},
  {id:33,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Zeichen_250.svg/200px-Zeichen_250.svg.png',opts:[{text_de:'Verbot für alle Fahrzeuge',ok:true},{text_de:'Einbahnstrasse',ok:false},{text_de:'Halt',ok:false}]},
  {id:34,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Zeichen_253.svg/200px-Zeichen_253.svg.png',opts:[{text_de:'LKW verboten',ok:true},{text_de:'Durchfahrt verboten',ok:false},{text_de:'Gefahrgut verboten',ok:false}]},
  {id:35,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Zeichen_280.svg/200px-Zeichen_280.svg.png',opts:[{text_de:'Parkieren verboten',ok:true},{text_de:'Halten verboten',ok:false},{text_de:'Einfahrt verboten',ok:false}]},
  {id:36,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Zeichen_265.svg/200px-Zeichen_265.svg.png',opts:[{text_de:'Höhenbeschränkung',ok:true},{text_de:'Breiteneinschränkung',ok:false},{text_de:'Gewichtsbeschränkung',ok:false}]},
  {id:37,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Zeichen_239.svg/200px-Zeichen_239.svg.png',opts:[{text_de:'Fussgänger',ok:true},{text_de:'Fussgänger und Radfahrer',ok:false},{text_de:'Schulweg',ok:false}]},
  {id:38,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Zeichen_222.svg/200px-Zeichen_222.svg.png',opts:[{text_de:'Rechts abbiegen',ok:true},{text_de:'Links abbiegen',ok:false},{text_de:'Geradeaus',ok:false}]},
  {id:39,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Zeichen_325.1.svg/200px-Zeichen_325.1.svg.png',opts:[{text_de:'Beginn der Begegnungszone',ok:true},{text_de:'Fussgängerzone',ok:false},{text_de:'Spielstrasse',ok:false}]},
  {id:40,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Zeichen_138.svg/200px-Zeichen_138.svg.png',opts:[{text_de:'Fussgänger — Achtung!',ok:true},{text_de:'Schulkinder',ok:false},{text_de:'Spielstrasse',ok:false}]},
  {id:41,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Zeichen_261.svg/200px-Zeichen_261.svg.png',opts:[{text_de:'Motorräder verboten',ok:true},{text_de:'Mopeds verboten',ok:false},{text_de:'Alle Fahrzeuge verboten',ok:false}]},
  {id:42,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Zeichen_241-30.svg/200px-Zeichen_241-30.svg.png',opts:[{text_de:'Getrennter Rad- und Gehweg',ok:true},{text_de:'Gemeinsamer Rad- und Gehweg',ok:false},{text_de:'Nur Radfahrer',ok:false}]},
  {id:43,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Zeichen_209-30.svg/200px-Zeichen_209-30.svg.png',opts:[{text_de:'Vorgeschriebene Fahrtrichtung rechts',ok:true},{text_de:'Empfohlene Richtung rechts',ok:false},{text_de:'Einbahnstrasse rechts',ok:false}]},
  {id:44,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Zeichen_274-100.svg/200px-Zeichen_274-100.svg.png',opts:[{text_de:'Höchstgeschwindigkeit 100 km/h',ok:true},{text_de:'Mindestgeschwindigkeit 100',ok:false},{text_de:'Empfehlung 100 km/h',ok:false}]},
  {id:45,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Zeichen_274-60.svg/200px-Zeichen_274-60.svg.png',opts:[{text_de:'Höchstgeschwindigkeit 60 km/h',ok:true},{text_de:'Höchstgeschwindigkeit 80 km/h',ok:false},{text_de:'Ende der Geschwindigkeitsbegrenzung',ok:false}]},
  {id:46,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Zeichen_354.svg/200px-Zeichen_354.svg.png',opts:[{text_de:'Wildwechsel',ok:true},{text_de:'Naturschutzgebiet',ok:false},{text_de:'Reiterweg',ok:false}]},
  {id:47,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Zeichen_123.svg/200px-Zeichen_123.svg.png',opts:[{text_de:'Arbeitsstelle / Baustelle',ok:true},{text_de:'Gefahrenstelle',ok:false},{text_de:'Schule',ok:false}]},
  {id:48,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Zeichen_274-80.svg/200px-Zeichen_274-80.svg.png',opts:[{text_de:'Höchstgeschwindigkeit 80 km/h',ok:true},{text_de:'Höchstgeschwindigkeit 60 km/h',ok:false},{text_de:'Mindestgeschwindigkeit 80 km/h',ok:false}]},
  {id:49,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Zeichen_103-10.svg/200px-Zeichen_103-10.svg.png',opts:[{text_de:'Kurve nach rechts',ok:true},{text_de:'Kurve nach links',ok:false},{text_de:'Doppelkurve',ok:false}]},
  {id:50,text_de:'Was bedeutet dieses Zeichen?',img_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Zeichen_237.svg/200px-Zeichen_237.svg.png',opts:[{text_de:'Radweg',ok:true},{text_de:'Fussgängerzone',ok:false},{text_de:'Schulweg',ok:false}]},
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [lang, setLang] = useState('de');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(LOCAL_Q);
  const [menuOpen, setMenuOpen] = useState(false);
  const [news, setNews] = useState([]);
  const [ads, setAds] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [examQ, setExamQ] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(2700);
  const [timerRef, setTimerRef] = useState(null);
  const [wrongQs, setWrongQs] = useState([]);
  const [results, setResults] = useState([]);
  const [isPractice, setIsPractice] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const t = TX[lang] || TX.de;

  useEffect(() => {
    loadData();
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (menuOpen) { setMenuOpen(false); return true; }
      if (screen !== 'home') { goHome(); return true; }
      return false;
    });
    return () => backHandler.remove();
  }, [screen, menuOpen]);

  async function loadData() {
    try {
      const [qRes, nRes, aRes] = await Promise.all([
        sbReq('questions?is_active=eq.true&order=id.asc&limit=500'),
        sbReq('news?is_active=eq.true&order=created_at.desc&limit=10'),
        sbReq('ads?is_active=eq.true&order=created_at.desc&limit=5'),
      ]);
      if (qRes.ok && Array.isArray(qRes.data) && qRes.data.length > 0) {
        const aRes2 = await sbReq('answers?order=question_id.asc,id.asc&limit=2000');
        if (aRes2.ok && Array.isArray(aRes2.data)) {
          const qs = qRes.data.map(q => ({
            ...q, opts: aRes2.data.filter(a => a.question_id === q.id).map(a => ({text_de: a.text_de, ok: a.is_correct}))
          })).filter(q => q.opts.length >= 2);
          if (qs.length > 0) setQuestions(qs);
        }
      }
      if (nRes.ok && Array.isArray(nRes.data)) setNews(nRes.data);
      if (aRes.ok && Array.isArray(aRes.data)) setAds(aRes.data);
    } catch (e) {}
  }

  function goHome() {
    if (timerRef) { clearInterval(timerRef); setTimerRef(null); }
    setScreen('home');
    setMenuOpen(false);
  }

  function startExam(practice = false) {
    // Shuffle opts within each question
  const questionsWithShuffledOpts = questions.map(q => ({
    ...q,
    opts: shuffle([...q.opts])
  }));
  const pool = shuffle([...questionsWithShuffledOpts]);
    const set = practice ? pool : pool.slice(0, Math.min(50, pool.length));
    setExamQ(set);
    setQIdx(0); setScore(0); setErrors(0);
    setAnswered(false); setSelectedOpt(null);
    setWrongQs([]); setResults([]);
    setIsPractice(practice);
    if (!practice) {
      setTimeLeft(2700);
      const t = setInterval(() => setTimeLeft(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; }), 1000);
      setTimerRef(t);
    }
    setMenuOpen(false);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {toValue: 1, duration: 300, useNativeDriver: true}).start();
    setScreen('exam');
  }

  function pickAnswer(optIdx, correct) {
    if (answered) return;
    setAnswered(true);
    setSelectedOpt(optIdx);
    if (correct) setScore(s => s + 1);
    else { setErrors(e => e + 1); setWrongQs(w => [...w, examQ[qIdx]]); }
    setResults(r => [...r, {q: examQ[qIdx], correct}]);
  }

  function nextQ() {
    const freeLimit = isPractice ? PRACTICE_FREE : EXAM_FREE;
    if (!user?.is_premium && qIdx + 1 >= freeLimit) {
      if (timerRef) clearInterval(timerRef);
      if (timerRef) clearInterval(timerRef);
      setScreen('premium');
      return;
    }
    if (qIdx + 1 >= examQ.length) { finishExam(); return; }
    setQIdx(i => i + 1);
    setAnswered(false); setSelectedOpt(null);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {toValue: 1, duration: 250, useNativeDriver: true}).start();
  }

  function finishExam() {
    if (timerRef) { clearInterval(timerRef); setTimerRef(null); }
    setScreen('result');
  }

  function formatTime(s) {
    return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  }

  const curQ = examQ[qIdx];
  const adTop = ads.find(a => a.position === 'top');
  const adBottom = ads.find(a => a.position === 'bottom');

  // HAMBURGER MENU
  const Menu = () => (
    <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
      <TouchableOpacity style={ms.overlay} onPress={() => setMenuOpen(false)}>
        <View style={ms.drawer}>
          <View style={ms.drawerHeader}>
            <Text style={ms.drawerLogo}>🚗 Fahr<Text style={{color:'#60A5FA'}}>Ready</Text></Text>
            <TouchableOpacity onPress={() => setMenuOpen(false)}>
              <Text style={ms.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          {user && <View style={ms.userInfo}><Text style={ms.userName}>{user.full_name}</Text><Text style={ms.userEmail}>{user.email}</Text>{user.is_premium && <Text style={ms.premBadge}>⭐ Premium</Text>}</View>}
          <View style={ms.langRow}>
            {['DE','FA','AZ','EN'].map(l => (
              <TouchableOpacity key={l} style={[ms.langBtn, lang===l.toLowerCase()&&ms.langBtnOn]} onPress={() => {setLang(l.toLowerCase()); setMenuOpen(false);}}>
                <Text style={[ms.langTxt, lang===l.toLowerCase()&&ms.langTxtOn]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {[
            {icon:'🏠', label:t.home, action:goHome},
            {icon:'📝', label:t.pruefung, action:() => {startExam(false);}},
            {icon:'📚', label:t.vorbereitung, action:() => {startExam(true);}},
            {icon:'📰', label:t.nachrichten, action:() => {setScreen('news'); setMenuOpen(false);}},
          ].map((item, i) => (
            <TouchableOpacity key={i} style={ms.menuItem} onPress={item.action}>
              <Text style={ms.menuIcon}>{item.icon}</Text>
              <Text style={ms.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <View style={ms.menuBottom}>
            {user ? (
              <TouchableOpacity style={ms.authBtn} onPress={() => {setUser(null); setMenuOpen(false);}}>
                <Text style={ms.authBtnTxt}>{t.abmelden}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={ms.authBtn} onPress={() => {setScreen('login'); setMenuOpen(false);}}>
                <Text style={ms.authBtnTxt}>{t.anmelden}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // NAVBAR
  const NavBar = ({light = false}) => (
    <View style={[s.navbar, light && s.navbarLight]}>
      <TouchableOpacity onPress={() => setMenuOpen(true)} style={s.hamburger}>
        <View style={[s.hLine, light && s.hLineDark]} />
        <View style={[s.hLine, light && s.hLineDark]} />
        <View style={[s.hLine, light && s.hLineDark]} />
      </TouchableOpacity>
      <TouchableOpacity onPress={goHome} style={s.navLogo}>
        <Image source={{uri:"data:image/png;base64,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"}} style={{width:28,height:28,borderRadius:6}} />
        <Text style={[s.navLogoTxt, light && s.navLogoTxtDark]}>Fahr<Text style={{color:'#60A5FA'}}>Ready</Text></Text>
      </TouchableOpacity>
      <View style={{width:44}} />
    </View>
  );

  // AD BANNER
  const AdBanner = ({ad}) => {
    if (!ad) return null;
    return (
      <View style={s.adBanner}>
        <Text style={s.adLabel}>{t.werbung}</Text>
        <TouchableOpacity style={s.adContent}>
          {ad.image_url ? <Image source={{uri:ad.image_url}} style={s.adImg} resizeMode="cover" /> : null}
          <Text style={s.adText}>{ad.name}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // HOME
  if (screen === 'home') return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />
      <Menu />
      <NavBar />
      {adTop && <AdBanner ad={adTop} />}
      <ScrollView style={s.homeScroll} showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <View style={s.heroBadge}><Text style={s.heroBadgeT}>🇨🇭 Offizielle Schweizer Theorieprüfung</Text></View>
          <Text style={s.heroTitle}>{"Bestehe deine\n"}<Text style={{color:'#60A5FA'}}>{"Fahrprüfung"}</Text></Text>
          <Text style={s.heroSub}>{t.sprachen === 'Sprachen' ? 'Persisch · Azerbaijanisch · Deutsch · Englisch' : t.sprachen}</Text>
          {user && <Text style={s.welcome}>👋 {user.full_name?.split(' ')[0]} {user.is_premium ? '⭐' : ''}</Text>}
        </View>
        <View style={s.statsRow}>
          {[['50',t.fragen],['45',t.minuten],['135',t.punkte],['4',t.sprachen]].map(([n,l]) => (
            <View key={l} style={s.statCard}>
              <Text style={s.statN}>{n}</Text>
              <Text style={s.statL}>{l}</Text>
            </View>
          ))}
        </View>
        <View style={s.btns}>
          <TouchableOpacity style={s.btnPrimary} onPress={() => startExam(false)}><Text style={s.btnPrimaryT}>{t.starten}</Text></TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => startExam(true)}><Text style={s.btnSecondaryT}>{t.lernen}</Text></TouchableOpacity>
          {!user && <TouchableOpacity style={s.btnOutline} onPress={() => setScreen('register')}><Text style={s.btnOutlineT}>{t.kostenlos}</Text></TouchableOpacity>}
        </View>
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>ℹ️ {t.regeln}</Text>
          <Text style={s.infoTxt}>{`• ${t.r1}\n• ${t.r2}\n• ${t.r3}\n• ${t.r4}`}</Text>
        </View>
        {news.length > 0 && (
          <View style={s.newsSection}>
            <Text style={s.sectionTitle}>📰 {t.neuigkeiten}</Text>
            {news.slice(0,3).map((n,i) => (
              <View key={i} style={s.newsCard}>
                {n.image_url ? <Image source={{uri:n.image_url}} style={s.newsImg} resizeMode="cover" /> : null}
                <View style={s.newsBody}>
                  <Text style={s.newsTag}>{n.tag || 'NEU'}</Text>
                  <Text style={s.newsTitle}>{n['title_'+lang] || n.title_de}</Text>
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

  // LOGIN / REGISTER
  if (screen === 'login' || screen === 'register') {
    const isReg = screen === 'register';
    return (
      <SafeAreaView style={[s.safe, {backgroundColor:C.white}]}>
        <StatusBar barStyle="dark-content" backgroundColor={C.white} />
        <Menu />
        <NavBar light />
        <ScrollView contentContainerStyle={s.authCont}>
          <TouchableOpacity style={s.backBtn} onPress={goHome}><Text style={s.backBtnT}>← {t.home}</Text></TouchableOpacity>
          <Text style={s.authTitle}>{isReg ? t.registrieren : t.anmelden}</Text>
          {isReg && <TextInput style={s.input} placeholder="Vollständiger Name" value={fullName} onChangeText={setFullName} placeholderTextColor={C.gray} />}
          <TextInput style={s.input} placeholder="E-Mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={C.gray} />
          <TextInput style={s.input} placeholder="Passwort" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={C.gray} />
          <TouchableOpacity style={s.btnPrimary} onPress={async () => {
            if (!email || !password) { Alert.alert('Fehler', 'Bitte E-Mail und Passwort eingeben'); return; }
            setLoading(true);
            if (isReg) {
              const r = await sbReq('users', 'POST', {email, password_hash:password, full_name:fullName||email, language:lang, is_premium:false, created_at:new Date().toISOString()});
              if (r.ok && Array.isArray(r.data) && r.data[0]) { setUser(r.data[0]); setScreen('home'); }
              else Alert.alert('Fehler', 'Registrierung fehlgeschlagen');
            } else {
              const r = await sbReq(`users?email=eq.${encodeURIComponent(email)}&password_hash=eq.${encodeURIComponent(password)}&select=*`);
              if (r.ok && Array.isArray(r.data) && r.data[0]) { setUser(r.data[0]); setScreen('home'); }
              else Alert.alert('Fehler', 'Falsche E-Mail oder Passwort');
            }
            setLoading(false);
          }} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnPrimaryT}>{isReg ? t.registrieren : t.anmelden}</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen(isReg ? 'login' : 'register')}>
            <Text style={s.switchAuth}>{isReg ? `${t.anmelden} →` : `${t.registrieren} →`}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // NEWS
  if (screen === 'news') return (
    <SafeAreaView style={[s.safe, {backgroundColor:C.white}]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <Menu />
      <NavBar light />
      <ScrollView style={{flex:1, padding:16}}>
        <TouchableOpacity style={s.backBtn} onPress={goHome}><Text style={s.backBtnT}>← {t.home}</Text></TouchableOpacity>
        <Text style={[s.authTitle, {color:C.dark}]}>📰 {t.neuigkeiten}</Text>
        {news.map((n,i) => (
          <View key={i} style={[s.newsCard, {marginBottom:12}]}>
            {n.image_url ? <Image source={{uri:n.image_url}} style={s.newsImg} resizeMode="cover" /> : null}
            <View style={s.newsBody}>
              <Text style={s.newsTag}>{n.tag || 'NEU'}</Text>
              <Text style={[s.newsTitle, {color:C.dark}]}>{n['title_'+lang] || n.title_de}</Text>
            </View>
          </View>
        ))}
        {news.length === 0 && <Text style={{color:C.gray, textAlign:'center', marginTop:40}}>Keine Neuigkeiten</Text>}
        <View style={{height:40}} />
      </ScrollView>
    </SafeAreaView>
  );

  // EXAM
  if (screen === 'exam' && curQ) {
    const opts = curQ.opts || [];
    const pct = Math.round((qIdx / Math.max(examQ.length,1)) * 100);
    return (
      <SafeAreaView style={[s.safe, {backgroundColor:'#F8FAFF'}]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
        <Menu />
        <View style={s.examHeader}>
          <TouchableOpacity onPress={() => { if(timerRef)clearInterval(timerRef); setScreen('home'); }} style={s.examBack}>
            <Text style={s.examBackT}>✕</Text>
          </TouchableOpacity>
          <View style={{alignItems:'center'}}>
            <Text style={s.examCounter}>{qIdx+1} / {Math.min(examQ.length, isPractice ? examQ.length : 50)}</Text>
            <Text style={s.examMode}>{isPractice ? '📚 '+t.vorbereitung : '📝 '+t.pruefung}</Text>
          </View>
          <View style={{alignItems:'flex-end'}}>
            {!isPractice && <Text style={s.examTimer}>{formatTime(timeLeft)}</Text>}
            <TouchableOpacity onPress={() => setMenuOpen(true)} style={{padding:4}}>
              <View style={s.hLine} /><View style={s.hLine} /><View style={s.hLine} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={s.progressTrack}><View style={[s.progressFill,{width:`${pct}%`}]} /></View>
        <View style={s.scoreRow}>
          <Text style={[s.scoreItem,{color:C.green}]}>✓ {score}</Text>
          <Text style={[s.scoreItem,{color:C.red}]}>✗ {errors}</Text>
          {!isPractice && <Text style={s.scoreItem}>Pkt: {score*3}/150</Text>}
        </View>
        <ScrollView style={s.examScroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={{opacity:fadeAnim}}>
            {curQ.img_url ? <Image source={{uri:curQ.img_url}} style={s.qImg} resizeMode="contain" /> : null}
            <Text style={s.qText}>{curQ.text_de}</Text>
            {lang !== 'de' && curQ['text_'+lang] ? (
              <Text style={[s.qText, {fontSize:14, color:C.gray, fontWeight:'500', marginTop:4}]}>
                {curQ['text_'+lang]}
              </Text>
            ) : null}
            {opts.map((opt,i) => {
              let os = s.optBtn, ots = s.optText;
              if (answered) {
                if (opt.ok) { os = {...s.optBtn,...s.optCorrect}; ots = {...s.optText,color:C.green}; }
                else if (selectedOpt===i) { os = {...s.optBtn,...s.optWrong}; ots = {...s.optText,color:C.red}; }
              }
              return (
                <TouchableOpacity key={i} style={os} onPress={() => pickAnswer(i, opt.ok)} disabled={answered}>
                  <View style={s.optLetter}><Text style={s.optLetterT}>{['A','B','C','D'][i]}</Text></View>
                  <View style={{flex:1}}>
                  <Text style={ots}>{opt.text_de}</Text>
                  {lang !== 'de' && opt['text_'+lang] ? (
                    <Text style={{fontSize:11, color:C.gray, marginTop:2}}>{opt['text_'+lang]}</Text>
                  ) : null}
                </View>
                </TouchableOpacity>
              );
            })}
            {answered && (
              <View style={[s.feedback,{backgroundColor:opts[selectedOpt]?.ok?'#DCFCE7':'#FEF2F2'}]}>
                <Text style={[s.feedbackT,{color:opts[selectedOpt]?.ok?C.green:C.red}]}>
                  {opts[selectedOpt]?.ok ? t.richtig : t.falsch}
                </Text>
                {!opts[selectedOpt]?.ok && <Text style={s.correctA}>✓ {opts.find(o=>o.ok)?.text_de}</Text>}
              </View>
            )}
            {answered && (
              <TouchableOpacity style={s.nextBtn} onPress={nextQ}>
                <Text style={s.nextBtnT}>{qIdx+1>=examQ.length ? t.fertig : t.weiter}</Text>
              </TouchableOpacity>
            )}
            <View style={{height:40}} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // RESULT
  if (screen === 'premium') {
    return (
      <SafeAreaView style={[s.safe,{backgroundColor:C.white}]}>
        <StatusBar barStyle="dark-content" backgroundColor={C.white} />
        <Menu />
        <NavBar light />
        <ScrollView contentContainerStyle={s.authCont}>
          <Text style={{fontSize:52,textAlign:'center',marginTop:20,marginBottom:10}}>⭐</Text>
          <Text style={[s.authTitle,{textAlign:'center'}]}>Premium</Text>
          <Text style={{fontSize:13,color:C.gray,textAlign:'center',marginBottom:24,lineHeight:20}}>
            Für unbegrenzten Zugang zu allen Fragen
          </Text>
          <View style={{backgroundColor:'#F8FAFF',borderRadius:14,padding:20,marginBottom:20,borderWidth:1,borderColor:C.border}}>
            <Text style={{fontSize:15,fontWeight:'800',color:C.dark,marginBottom:16}}>💳 Preise</Text>
            <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:10}}>
              <Text style={{fontSize:14,color:C.dark}}>Monatlich</Text>
              <Text style={{fontSize:14,fontWeight:'700',color:C.blue}}>CHF 9</Text>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
              <Text style={{fontSize:14,color:C.dark}}>Jährlich</Text>
              <Text style={{fontSize:14,fontWeight:'700',color:C.green}}>CHF 29</Text>
            </View>
          </View>
          <View style={{backgroundColor:'#F8FAFF',borderRadius:14,padding:20,marginBottom:24,borderWidth:1,borderColor:C.border}}>
            <Text style={{fontSize:15,fontWeight:'800',color:C.dark,marginBottom:12}}>🏦 Zahlung per IBAN</Text>
            <Text style={{fontSize:13,color:C.gray,marginBottom:6}}>IBAN:</Text>
            <Text style={{fontSize:14,fontWeight:'700',color:C.dark,marginBottom:10}}>CH56 0483 5012 3456 7800 9</Text>
            <Text style={{fontSize:13,color:C.gray,marginBottom:6}}>Empfänger:</Text>
            <Text style={{fontSize:14,fontWeight:'700',color:C.dark,marginBottom:10}}>FahrReady</Text>
            <Text style={{fontSize:11,color:C.gray,lineHeight:16}}>
              {"Nach Überweisung wird Ihr Konto innerhalb 24h freigeschaltet."}
            </Text>
            <Text style={{fontSize:11,color:C.gray,lineHeight:16}}>
              {"Bitte Ihre E-Mail als Verwendungszweck angeben."}
            </Text>
          </View>
          <TouchableOpacity style={s.btnPrimary} onPress={() => setScreen('home')}>
            <Text style={s.btnPrimaryT}>← Zurück zur Startseite</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

    if (screen === 'result') {
    const total = results.length;
    const correct = results.filter(r=>r.correct).length;
    const wrong = total - correct;
    const pts = correct * 3;
    const passed = !isPractice && pts >= 135;
    const rate = total > 0 ? Math.round(correct/total*100) : 0;
    return (
      <SafeAreaView style={[s.safe,{backgroundColor:C.white}]}>
        <StatusBar barStyle="dark-content" backgroundColor={C.white} />
        <Menu />
        <NavBar light />
        <ScrollView contentContainerStyle={s.resultCont}>
          <Text style={s.resultIcon}>{isPractice ? '🎓' : passed ? '🏆' : '😔'}</Text>
          <Text style={s.resultTitle}>{isPractice ? 'Übung abgeschlossen!' : passed ? t.bestanden : t.nichtBestanden}</Text>
          {!isPractice && <Text style={[s.resultSubtitle, {color: passed ? C.green : C.red}]}>{pts} / 150 Punkte</Text>}
          <View style={s.resultStats}>
            <View style={s.rStat}><Text style={[s.rStatN,{color:C.blue}]}>{total}</Text><Text style={s.rStatL}>{t.gesamt}</Text></View>
            <View style={s.rStat}><Text style={[s.rStatN,{color:C.green}]}>{correct}</Text><Text style={s.rStatL}>✓</Text></View>
            <View style={s.rStat}><Text style={[s.rStatN,{color:C.red}]}>{wrong}</Text><Text style={s.rStatL}>✗</Text></View>
            <View style={s.rStat}><Text style={[s.rStatN,{color:C.blue}]}>{rate}%</Text><Text style={s.rStatL}>{t.ergebnis}</Text></View>
          </View>
          {wrongQs.length > 0 && (
            <View style={s.wrongSec}>
              <Text style={s.wrongTitle}>✗ Falsche Antworten ({wrongQs.length})</Text>
              {wrongQs.map((q,i) => (
                <View key={i} style={s.wrongItem}>
                  {q.img_url ? <Image source={{uri:q.img_url}} style={s.wrongImg} resizeMode="contain" /> : null}
                  <Text style={s.wrongQ}>{q.text_de}</Text>
                  <Text style={s.wrongCorrect}>✓ {q.opts?.find(o=>o.ok)?.text_de}</Text>
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity style={s.btnPrimary} onPress={() => startExam(isPractice)}><Text style={s.btnPrimaryT}>{t.nochmal}</Text></TouchableOpacity>
          <TouchableOpacity style={[s.btnSecondary,{marginTop:10}]} onPress={goHome}><Text style={s.btnSecondaryT}>{t.start}</Text></TouchableOpacity>
          <View style={{height:40}} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator size="large" color={C.blue} /></View>;
}

const ms = StyleSheet.create({
  overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.5)',flexDirection:'row'},
  drawer:{width:width*0.78,backgroundColor:C.dark,height:'100%',paddingTop:50},
  drawerHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:20,borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,0.1)'},
  drawerLogo:{fontSize:20,fontWeight:'900',color:C.white},
  closeBtn:{color:C.white,fontSize:22,fontWeight:'700'},
  userInfo:{padding:16,borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,0.1)'},
  userName:{color:C.white,fontSize:15,fontWeight:'700'},
  userEmail:{color:C.gray,fontSize:12,marginTop:2},
  premBadge:{color:'#FFD700',fontSize:12,fontWeight:'700',marginTop:4},
  langRow:{flexDirection:'row',gap:8,padding:16,borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,0.1)'},
  langBtn:{paddingHorizontal:12,paddingVertical:6,borderRadius:20,borderWidth:1,borderColor:'rgba(255,255,255,0.2)'},
  langBtnOn:{backgroundColor:C.blue,borderColor:C.blue},
  langTxt:{color:C.gray,fontSize:12,fontWeight:'700'},
  langTxtOn:{color:C.white},
  menuItem:{flexDirection:'row',alignItems:'center',gap:12,padding:16,borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,0.05)'},
  menuIcon:{fontSize:20},
  menuLabel:{color:C.white,fontSize:15,fontWeight:'500'},
  menuBottom:{padding:16,marginTop:'auto',borderTopWidth:1,borderTopColor:'rgba(255,255,255,0.1)'},
  authBtn:{backgroundColor:C.blue,borderRadius:10,padding:12,alignItems:'center'},
  authBtnTxt:{color:C.white,fontWeight:'700',fontSize:14},
});

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:C.dark},
  navbar:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:12,backgroundColor:'transparent'},
  navbarLight:{backgroundColor:C.white,borderBottomWidth:1,borderBottomColor:C.border},
  hamburger:{width:44,height:44,justifyContent:'center',gap:5},
  hLine:{height:2,backgroundColor:C.white,borderRadius:1,width:22},
  hLineDark:{backgroundColor:C.dark},
  navLogo:{flexDirection:'row',alignItems:'center',gap:6},
  navLogoIcon:{fontSize:20},
  navLogoTxt:{fontSize:18,fontWeight:'900',color:C.white},
  navLogoTxtDark:{color:C.dark},
  homeScroll:{flex:1},
  hero:{padding:24,paddingTop:8},
  heroBadge:{backgroundColor:'rgba(255,255,255,0.1)',borderRadius:20,paddingHorizontal:12,paddingVertical:5,alignSelf:'flex-start',marginBottom:14},
  heroBadgeT:{color:'rgba(255,255,255,0.7)',fontSize:11,fontWeight:'600'},
  heroTitle:{fontSize:30,fontWeight:'900',color:C.white,lineHeight:38,marginBottom:10},
  heroSub:{fontSize:13,color:'rgba(255,255,255,0.5)',marginBottom:8},
  welcome:{fontSize:14,color:'#60A5FA',fontWeight:'600',marginTop:8},
  statsRow:{flexDirection:'row',flexWrap:'wrap',gap:10,paddingHorizontal:20,marginBottom:20},
  statCard:{flex:1,minWidth:'22%',backgroundColor:'rgba(255,255,255,0.06)',borderRadius:12,padding:12,alignItems:'center'},
  statN:{fontSize:22,fontWeight:'900',color:C.white},
  statL:{fontSize:9,color:'rgba(255,255,255,0.4)',textAlign:'center',marginTop:2},
  btns:{paddingHorizontal:20,gap:10,marginBottom:20},
  btnPrimary:{backgroundColor:C.blue,borderRadius:14,padding:15,alignItems:'center'},
  btnPrimaryT:{color:C.white,fontSize:15,fontWeight:'800'},
  btnSecondary:{backgroundColor:'rgba(255,255,255,0.08)',borderRadius:14,padding:15,alignItems:'center',borderWidth:1,borderColor:'rgba(255,255,255,0.15)'},
  btnSecondaryT:{color:C.white,fontSize:14,fontWeight:'700'},
  btnOutline:{borderRadius:14,padding:13,alignItems:'center',borderWidth:1.5,borderColor:'rgba(255,255,255,0.25)'},
  btnOutlineT:{color:'rgba(255,255,255,0.7)',fontSize:13,fontWeight:'600'},
  infoCard:{marginHorizontal:20,backgroundColor:'rgba(255,255,255,0.05)',borderRadius:14,padding:16,marginBottom:20},
  infoTitle:{color:C.white,fontWeight:'700',fontSize:13,marginBottom:8},
  infoTxt:{color:'rgba(255,255,255,0.55)',fontSize:12,lineHeight:20},
  newsSection:{marginHorizontal:20,marginBottom:20},
  sectionTitle:{color:C.white,fontSize:15,fontWeight:'700',marginBottom:12},
  newsCard:{backgroundColor:'rgba(255,255,255,0.06)',borderRadius:12,overflow:'hidden',marginBottom:10},
  newsImg:{width:'100%',height:120},
  newsBody:{padding:12},
  newsTag:{fontSize:10,color:'#60A5FA',fontWeight:'700',marginBottom:4},
  newsTitle:{color:C.white,fontSize:13,fontWeight:'600'},
  adBanner:{backgroundColor:'rgba(255,255,255,0.04)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:10,margin:16,padding:10},
  adLabel:{fontSize:9,color:C.gray,marginBottom:4},
  adContent:{alignItems:'center'},
  adImg:{width:'100%',height:80,borderRadius:6},
  adText:{color:C.white,fontSize:12,textAlign:'center',marginTop:4},
  authCont:{padding:24,flexGrow:1,backgroundColor:C.white},
  backBtn:{marginBottom:20},
  backBtnT:{color:C.blue,fontSize:14,fontWeight:'600'},
  authTitle:{fontSize:24,fontWeight:'900',color:C.dark,marginBottom:24},
  input:{borderWidth:1.5,borderColor:C.border,borderRadius:10,padding:13,fontSize:13,marginBottom:12,color:C.dark,backgroundColor:'#F9FAFB'},
  switchAuth:{color:C.blue,textAlign:'center',marginTop:16,fontWeight:'600'},
  examHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:10,backgroundColor:C.white,borderBottomWidth:1,borderBottomColor:C.border},
  examBack:{padding:6},
  examBackT:{fontSize:18,color:C.gray,fontWeight:'700'},
  examCounter:{fontSize:14,fontWeight:'700',color:C.dark,textAlign:'center'},
  examMode:{fontSize:10,color:C.gray,textAlign:'center'},
  examTimer:{fontSize:14,fontWeight:'700',color:C.blue},
  progressTrack:{height:4,backgroundColor:C.light},
  progressFill:{height:4,backgroundColor:C.blue},
  scoreRow:{flexDirection:'row',justifyContent:'center',gap:24,paddingVertical:8,backgroundColor:C.white,borderBottomWidth:1,borderBottomColor:C.border},
  scoreItem:{fontSize:13,fontWeight:'700',color:C.dark},
  examScroll:{flex:1,padding:16},
  qImg:{width:'100%',height:180,borderRadius:12,marginBottom:14,backgroundColor:C.light},
  qText:{fontSize:16,fontWeight:'800',color:C.dark,marginBottom:14,lineHeight:24},
  optBtn:{flexDirection:'row',alignItems:'center',gap:10,padding:13,backgroundColor:C.white,borderRadius:12,marginBottom:8,borderWidth:1.5,borderColor:C.border},
  optCorrect:{backgroundColor:'#DCFCE7',borderColor:C.green},
  optWrong:{backgroundColor:'#FEF2F2',borderColor:C.red},
  optLetter:{width:26,height:26,borderRadius:13,backgroundColor:C.light,alignItems:'center',justifyContent:'center'},
  optLetterT:{fontSize:11,fontWeight:'700',color:C.dark},
  optText:{flex:1,fontSize:13,color:C.dark,fontWeight:'500'},
  feedback:{borderRadius:10,padding:12,marginBottom:10},
  feedbackT:{fontSize:14,fontWeight:'800',textAlign:'center'},
  correctA:{fontSize:12,color:C.green,textAlign:'center',marginTop:4},
  nextBtn:{backgroundColor:C.blue,borderRadius:12,padding:14,alignItems:'center'},
  nextBtnT:{color:C.white,fontSize:15,fontWeight:'800'},
  resultCont:{padding:24,alignItems:'center',backgroundColor:C.white,flexGrow:1},
  resultIcon:{fontSize:56,marginTop:16,marginBottom:8},
  resultTitle:{fontSize:22,fontWeight:'900',color:C.dark,marginBottom:6,textAlign:'center'},
  resultSubtitle:{fontSize:18,fontWeight:'700',marginBottom:20,textAlign:'center'},
  resultStats:{flexDirection:'row',gap:10,marginBottom:24,flexWrap:'wrap',justifyContent:'center'},
  rStat:{backgroundColor:C.light,borderRadius:12,padding:14,alignItems:'center',minWidth:70},
  rStatN:{fontSize:22,fontWeight:'900'},
  rStatL:{fontSize:10,color:C.gray,marginTop:2},
  wrongSec:{width:'100%',marginBottom:20},
  wrongTitle:{fontSize:13,fontWeight:'700',color:C.red,marginBottom:10},
  wrongItem:{backgroundColor:'#FEF2F2',borderRadius:10,padding:10,marginBottom:8},
  wrongImg:{width:'100%',height:70,borderRadius:6,marginBottom:6},
  wrongQ:{fontSize:12,fontWeight:'600',color:C.dark,marginBottom:4},
  wrongCorrect:{fontSize:11,color:C.green,fontWeight:'600'},
});
