import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Truck, CheckCircle2 } from 'lucide-react';

const SUPABASE_URL = 'https://wetbridzfwmvyhqhfsqw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xgLp7zdiHpLzdutOwRrYYA_Q0R8Hftx';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function estimatePrice(distance: number, size: string, helpers: string) {
  const base = Math.max(25, distance * 0.8);
  const sizeFactor = size === 'small' ? 0 : size === 'medium' ? 18 : size === 'large' ? 38 : 60;
  const helperFactor = helpers === '2' ? 25 : helpers === '3' ? 50 : 0;
  const low = Math.round(base + sizeFactor + helperFactor);
  const high = Math.round(low * 1.28);
  return { low, high };
}

const __priceTest1 = estimatePrice(10, 'small', '1');
console.assert(__priceTest1.low >= 25, 'minimum price should be at least 25');
const __priceTest2 = estimatePrice(120, 'medium', '2');
console.assert(__priceTest2.high > __priceTest2.low, 'high price should exceed low price');
const __priceTest3 = estimatePrice(120, 'large', '3');
console.assert(__priceTest3.low > __priceTest2.low, 'more size/helpers should increase price');
const __priceTest4 = estimatePrice(0, 'bulky', '3');
console.assert(__priceTest4.low >= 25, 'minimum price should remain intact');

type Lang = 'de' | 'en' | 'tr' | 'pl' | 'nl' | 'fr';
type Role = 'private' | 'driver' | 'company';
type Page = 'home' | 'login' | 'register' | 'dashboard';
type Status = 'open' | 'matched' | 'accepted' | 'completed';

type TransportRequest = {
  id: string;
  createdAt: string;
  name: string;
  from: string;
  to: string;
  item: string;
  size: string;
  helpers: string;
  distance: number;
  estimatedLow: number;
  estimatedHigh: number;
  status: Status;
};

type FreeRoute = {
  id: string;
  createdAt: string;
  providerName: string;
  from: string;
  to: string;
  vehicleType: string;
  capacity: string;
  price: string;
  status: Status;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

function Card({ children, dark = false, style = {} }: { children: React.ReactNode; dark?: boolean; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: dark ? '#0f172a' : '#ffffff',
        color: dark ? '#ffffff' : '#0f172a',
        borderRadius: 28,
        padding: 24,
        border: dark ? 'none' : '1px solid #e8eef5',
        boxShadow: dark ? 'none' : '0 20px 50px rgba(15,23,42,0.08)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Btn({ children, secondary = false, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      {...props}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '13px 18px',
        minHeight: 48,
        borderRadius: 14,
        border: secondary ? '1px solid #d6dee8' : '1px solid #F97316',
        background: secondary ? (hovered ? '#eef2f7' : '#ffffff') : hovered ? '#c2410c' : '#F97316',
        color: secondary ? '#0f172a' : '#ffffff',
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: '-0.01em',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.65 : 1,
       boxShadow: secondary
  ? hovered
    ? '0 12px 30px rgba(15,23,42,0.12)'
    : 'none'
  : hovered
    ? '0 18px 36px rgba(249,115,22,0.38)'
    : '0 10px 24px rgba(249,115,22,0.22)',
        transform: hovered ? 'translateY(-3px) scale(1.01)' : 'translateY(0) scale(1)',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        minHeight: 48,
        padding: '12px 14px',
        borderRadius: 14,
        border: '1px solid #dbe3ee',
        fontSize: 14,
        lineHeight: 1.2,
        boxSizing: 'border-box',
        background: '#fff',
        color: '#0f172a',
      }}
    />
  );
}

function Select({ value = '', onChange, options, placeholder }: { value?: string; onChange?: React.ChangeEventHandler<HTMLSelectElement>; options: { value: string; label: string }[]; placeholder: string }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        width: '100%',
        minHeight: 48,
        padding: '12px 14px',
        borderRadius: 14,
        border: '1px solid #dbe3ee',
        fontSize: 14,
        background: '#fff',
        color: '#0f172a',
        boxSizing: 'border-box',
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: '#fff7ed',
        color: '#9a3412',
        border: '1px solid #fdba74',
      }}
    >
      {children}
    </span>
  );
}

function SectionTitle({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ maxWidth: 820, marginBottom: 28 }}>
      <h2 style={{ fontSize: 38, lineHeight: 1.06, margin: 0, letterSpacing: '-0.03em', color: '#0f172a' }}>{title}</h2>
      <p style={{ marginTop: 12, color: '#475569', lineHeight: 1.8, fontSize: 16 }}>{text}</p>
    </div>
  );
}

function formatStatus(status: Status, lang: Lang) {
  const map = {
    de: { open: 'Offen', matched: 'Passende Routen', accepted: 'Angenommen', completed: 'Abgeschlossen' },
    en: { open: 'Open', matched: 'Matched', accepted: 'Accepted', completed: 'Completed' },
    tr: { open: 'Açık', matched: 'Eşleşti', accepted: 'Kabul edildi', completed: 'Tamamlandı' },
    pl: { open: 'Otwarte', matched: 'Dopasowane', accepted: 'Przyjęte', completed: 'Zakończone' },
    nl: { open: 'Open', matched: 'Matches', accepted: 'Aangenomen', completed: 'Voltooid' },
    fr: { open: 'Ouvert', matched: 'Correspondances', accepted: 'Accepté', completed: 'Terminé' },
  } as const;
  return map[lang][status];
}

export default function ShipenFullPreview() {
  const getInitialLang = (): Lang => {
    if (typeof window === 'undefined') return 'de';
    const saved = window.localStorage.getItem('shipen_lang');
    return saved && ['de', 'en', 'tr', 'pl', 'nl', 'fr'].includes(saved) ? (saved as Lang) : 'de';
  };

  const [lang, setLang] = useState<Lang>(getInitialLang());
  const [page, setPage] = useState<Page>('home');
  const [role, setRole] = useState<Role>('private');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [banner, setBanner] = useState('');
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [routes, setRoutes] = useState<FreeRoute[]>([]);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [requestForm, setRequestForm] = useState({ from: '', to: '', item: '', size: 'medium', helpers: '1', distance: '120' });
  const [routeForm, setRouteForm] = useState({ from: '', to: '', vehicleType: '', capacity: '', price: '' });

  const tx = <T extends string>(copy: Record<Lang, T>) => copy[lang] || copy.de;

  const mapRequestRow = (row: any): TransportRequest => ({
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    from: row.from_location,
    to: row.to_location,
    item: row.item,
    size: row.size,
    helpers: row.helpers,
    distance: Number(row.distance || 0),
    estimatedLow: Number(row.estimated_low || 0),
    estimatedHigh: Number(row.estimated_high || 0),
    status: (row.status as Status) || 'open',
  });

  const mapRouteRow = (row: any): FreeRoute => ({
    id: row.id,
    createdAt: row.created_at,
    providerName: row.provider_name,
    from: row.from_location,
    to: row.to_location,
    vehicleType: row.vehicle_type,
    capacity: row.capacity,
    price: row.price,
    status: (row.status as Status) || 'open',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('shipen_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsMobile(window.innerWidth < 920);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.title = tx({
      de: 'Shipen – Transportplattform',
      en: 'Shipen – Transport platform',
      tr: 'Shipen – Taşıma platformu',
      pl: 'Shipen – Platforma transportowa',
      nl: 'Shipen – Transportplatform',
      fr: 'Shipen – Plateforme de transport',
    });
  }, [lang]);

  useEffect(() => {
    const applySession = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;
      if (!sessionUser) return;
      setUser({
        id: sessionUser.id,
        name: (sessionUser.user_metadata?.full_name as string) || sessionUser.email?.split('@')[0] || 'User',
        email: sessionUser.email || '',
        role: ((sessionUser.user_metadata?.role as Role) || 'private'),
      });
    };

    applySession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      const sessionUser = session?.user;
      if (!sessionUser) {
        setUser(null);
        return;
      }
      setUser({
        id: sessionUser.id,
        name: (sessionUser.user_metadata?.full_name as string) || sessionUser.email?.split('@')[0] || 'User',
        email: sessionUser.email || '',
        role: ((sessionUser.user_metadata?.role as Role) || 'private'),
      });
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase.from('transport_requests').select('*').order('created_at', { ascending: false });
    if (error) {
      setBanner(error.message);
      return;
    }
    setRequests((data || []).map(mapRequestRow));
  };

  const fetchRoutes = async () => {
    const { data, error } = await supabase.from('free_routes').select('*').order('created_at', { ascending: false });
    if (error) {
      setBanner(error.message);
      return;
    }
    setRoutes((data || []).map(mapRouteRow));
  };

  useEffect(() => {
    fetchRequests();
    fetchRoutes();
  }, []);

  const estimate = useMemo(() => estimatePrice(Number(requestForm.distance || 0), requestForm.size, requestForm.helpers), [requestForm]);

  const getMatchesForRequest = (request: TransportRequest) => {
    const fromNeedle = request.from.trim().toLowerCase();
    const toNeedle = request.to.trim().toLowerCase();
    return routes.filter((route: FreeRoute) => {
      const fromHit = route.from.toLowerCase().includes(fromNeedle) || fromNeedle.includes(route.from.toLowerCase());
      const toHit = route.to.toLowerCase().includes(toNeedle) || toNeedle.includes(route.to.toLowerCase());
      return fromHit || toHit;
    });
  };

  const matchedRequestCount = requests.filter((r: TransportRequest) => getMatchesForRequest(r).length > 0).length;

  const createAccount = async () => {
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setBanner(tx({ de: 'Bitte Name, E-Mail und Passwort ausfüllen.', en: 'Please fill in name, email and password.', tr: 'Lütfen ad, e-posta ve şifreyi doldurun.', pl: 'Wpisz imię, e-mail i hasło.', nl: 'Vul naam, e-mail en wachtwoord in.', fr: 'Veuillez saisir le nom, l’e-mail et le mot de passe.' }));
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: registerEmail.trim(),
      password: registerPassword,
      options: { data: { full_name: registerName.trim(), role } },
    });

    if (error) {
      setBanner(error.message);
      return;
    }

    if (data.user) {
      setUser({
        id: data.user.id,
        name: (data.user.user_metadata?.full_name as string) || registerName.trim(),
        email: data.user.email || registerEmail.trim(),
        role: ((data.user.user_metadata?.role as Role) || role),
      });
    }

    setRegisterName('');
    setRegisterEmail('');
    setRegisterPassword('');
    setPage('dashboard');
    setBanner(tx({ de: 'Konto erstellt. Prüfe deine E-Mail, falls eine Bestätigung verlangt wird.', en: 'Account created. Check your email if confirmation is required.', tr: 'Hesap oluşturuldu. Onay isteniyorsa e-postanı kontrol et.', pl: 'Konto utworzone. Sprawdź e-mail, jeśli wymagane jest potwierdzenie.', nl: 'Account aangemaakt. Controleer je e-mail als bevestiging vereist is.', fr: 'Compte créé. Vérifiez votre e-mail si une confirmation est requise.' }));
  };

  const login = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setBanner(tx({ de: 'Bitte E-Mail und Passwort eingeben.', en: 'Please enter email and password.', tr: 'Lütfen e-posta ve şifre girin.', pl: 'Wpisz e-mail i hasło.', nl: 'Vul e-mail en wachtwoord in.', fr: 'Veuillez saisir l’e-mail et le mot de passe.' }));
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });

    if (error) {
      setBanner(error.message);
      return;
    }

    setUser({
      id: data.user.id,
      name: (data.user.user_metadata?.full_name as string) || data.user.email?.split('@')[0] || 'User',
      email: data.user.email || loginEmail.trim(),
      role: ((data.user.user_metadata?.role as Role) || role),
    });
    setLoginPassword('');
    setPage('dashboard');
    setBanner(tx({ de: 'Login erfolgreich.', en: 'Login successful.', tr: 'Giriş başarılı.', pl: 'Logowanie udane.', nl: 'Inloggen gelukt.', fr: 'Connexion réussie.' }));
  };

  const submitRequest = async () => {
    if (!requestForm.from || !requestForm.to || !requestForm.item) {
      setBanner(tx({ de: 'Bitte Start, Ziel und Transportgut ausfüllen.', en: 'Please fill in start, destination and item.', tr: 'Lütfen başlangıç, varış ve yükü girin.', pl: 'Uzupełnij start, cel i ładunek.', nl: 'Vul start, bestemming en lading in.', fr: 'Veuillez saisir départ, destination et marchandise.' }));
      return;
    }
    if (!user) {
      setBanner(tx({ de: 'Bitte zuerst einloggen.', en: 'Please log in first.', tr: 'Lütfen önce giriş yapın.', pl: 'Najpierw się zaloguj.', nl: 'Log eerst in.', fr: 'Veuillez d’abord vous connecter.' }));
      return;
    }

    const { error } = await supabase.from('transport_requests').insert({
      user_id: user.id,
      name: user.name,
      from_location: requestForm.from,
      to_location: requestForm.to,
      item: requestForm.item,
      size: requestForm.size,
      helpers: requestForm.helpers,
      distance: Number(requestForm.distance || 0),
      estimated_low: estimate.low,
      estimated_high: estimate.high,
      status: 'open',
    });

    if (error) {
      setBanner(error.message);
      return;
    }

    await fetchRequests();
    setRequestForm({ from: '', to: '', item: '', size: 'medium', helpers: '1', distance: '120' });
    setBanner(tx({ de: 'Transportanfrage in Supabase gespeichert.', en: 'Transport request saved to Supabase.', tr: 'Taşıma talebi Supabase’e kaydedildi.', pl: 'Zlecenie transportowe zapisano w Supabase.', nl: 'Transportaanvraag opgeslagen in Supabase.', fr: 'Demande de transport enregistrée dans Supabase.' }));
  };

  const submitRoute = async () => {
    if (!routeForm.from || !routeForm.to || !routeForm.vehicleType) {
      setBanner(tx({ de: 'Bitte Route und Fahrzeugtyp ausfüllen.', en: 'Please fill in route and vehicle type.', tr: 'Lütfen rota ve araç tipini doldurun.', pl: 'Uzupełnij trasę i typ pojazdu.', nl: 'Vul route en voertuigtype in.', fr: 'Veuillez saisir le trajet et le type de véhicule.' }));
      return;
    }
    if (!user) {
      setBanner(tx({ de: 'Bitte zuerst einloggen.', en: 'Please log in first.', tr: 'Lütfen önce giriş yapın.', pl: 'Najpierw się zaloguj.', nl: 'Log eerst in.', fr: 'Veuillez d’abord vous connecter.' }));
      return;
    }

    const { error } = await supabase.from('free_routes').insert({
      user_id: user.id,
      provider_name: user.name,
      from_location: routeForm.from,
      to_location: routeForm.to,
      vehicle_type: routeForm.vehicleType,
      capacity: routeForm.capacity || 'flexible',
      price: routeForm.price || 'on request',
      status: 'open',
    });

    if (error) {
      setBanner(error.message);
      return;
    }

    await fetchRoutes();
    setRouteForm({ from: '', to: '', vehicleType: '', capacity: '', price: '' });
    setBanner(tx({ de: 'Freie Route in Supabase gespeichert.', en: 'Free route saved to Supabase.', tr: 'Boş rota Supabase’e kaydedildi.', pl: 'Wolna trasa zapisana w Supabase.', nl: 'Vrije route opgeslagen in Supabase.', fr: 'Trajet libre enregistré dans Supabase.' }));
  };

  const StatCard = ({ value, label }: { value: string; label: string }) => (
    <Card>
      <div style={{ fontSize: 30, fontWeight: 800 }}>{value}</div>
      <div style={{ color: '#64748b', marginTop: 8 }}>{label}</div>
    </Card>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 16, background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800 }}>Shipen</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{tx({ de: 'Transportplattform', en: 'Transport platform', tr: 'Taşıma platformu', pl: 'Platforma transportowa', nl: 'Transportplatform', fr: 'Plateforme de transport' })}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Btn secondary onClick={() => setPage('home')}>{tx({ de: 'Startseite', en: 'Home', tr: 'Ana sayfa', pl: 'Start', nl: 'Home', fr: 'Accueil' })}</Btn>
            {!user && <Btn secondary onClick={() => setPage('login')}>{tx({ de: 'Login', en: 'Login', tr: 'Giriş', pl: 'Login', nl: 'Login', fr: 'Connexion' })}</Btn>}
            {!user && <Btn onClick={() => setPage('register')}>{tx({ de: 'Registrieren', en: 'Register', tr: 'Kayıt ol', pl: 'Rejestracja', nl: 'Registreren', fr: 'Inscription' })}</Btn>}
            {user && <Btn secondary onClick={() => setPage('dashboard')}>{tx({ de: 'Dashboard', en: 'Dashboard', tr: 'Panel', pl: 'Panel', nl: 'Dashboard', fr: 'Tableau de bord' })}</Btn>}
            {user && (
              <Btn onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
                setPage('home');
                setBanner(tx({ de: 'Du wurdest abgemeldet.', en: 'You have been signed out.', tr: 'Çıkış yapıldı.', pl: 'Wylogowano.', nl: 'Je bent uitgelogd.', fr: 'Vous avez été déconnecté.' }));
              }}>
                {tx({ de: 'Logout', en: 'Logout', tr: 'Çıkış', pl: 'Wyloguj', nl: 'Uitloggen', fr: 'Déconnexion' })}
              </Btn>
            )}
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} style={{ minHeight: 42, borderRadius: 12, border: '1px solid #cbd5e1', padding: '0 10px', background: '#fff' }}>
              <option value="de">DE</option><option value="en">EN</option><option value="tr">TR</option><option value="pl">PL</option><option value="nl">NL</option><option value="fr">FR</option>
            </select>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '34px 20px 96px' }}>
        {banner && <div style={{ marginBottom: 18 }}><Card dark style={{ background: '#14532d' }}>{banner}</Card></div>}

        {page === 'home' && (
          <>
            <section style={{ position: 'relative', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.08fr 1fr', gap: 28, marginBottom: 64, padding: '30px 0 34px' }}>
              <div style={{ position: 'absolute', top: -80, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(249,115,22,0.25)', filter: 'blur(100px)' }} />
              <div style={{ position: 'absolute', bottom: -80, left: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(249,115,22,0.15)', filter: 'blur(100px)' }} />

              <div style={{ position: 'relative' }}>
                <Badge>{tx({ de: 'Privat + Fahrer + Firmen', en: 'Private + drivers + companies', tr: 'Bireysel + sürücüler + şirketler', pl: 'Prywatni + kierowcy + firmy', nl: 'Particulier + chauffeurs + bedrijven', fr: 'Particuliers + chauffeurs + entreprises' })}</Badge>
                <h1 style={{ fontSize: isMobile ? 40 : 62, lineHeight: 0.98, margin: '18px 0 14px', letterSpacing: '-0.05em', color: '#0f172a', maxWidth: 760 }}>
                  {tx({ de: 'Shipen macht Transport', en: 'Shipen makes transport', tr: 'Shipen taşımayı', pl: 'Shipen sprawia, że transport', nl: 'Shipen maakt transport', fr: 'Shipen rend le transport' })}
                  <br />
                  <span>{tx({ de: 'einfach, schnell und klar.', en: 'simple, fast and clear.', tr: 'basit, hızlı ve net hale getirir.', pl: 'prostym, szybkim i jasnym.', nl: 'eenvoudig, snel en duidelijk.', fr: 'simple, rapide et clair.' })}</span>
                </h1>
                <p style={{ color: '#475569', fontSize: 18, lineHeight: 1.8, maxWidth: 700 }}>{tx({ de: 'Von Kleintransporten bis zu freien Firmenrouten. Eine Plattform für Privatkunden, Fahrer und Unternehmen – mit echter Anfrage-, Routen- und Matching-Logik.', en: 'From small deliveries to free company routes. One platform for private customers, drivers and companies – with real requests, routes and matching logic.', tr: 'Küçük taşımadan boş şirket rotalarına kadar. Gerçek talep, rota ve eşleştirme mantığıyla tek platform.', pl: 'Od małych transportów po wolne trasy firmowe. Jedna platforma z prawdziwą logiką zleceń, tras i dopasowań.', nl: 'Van kleine transporten tot vrije bedrijfsroutes. Eén platform met echte aanvraag-, route- en matchinglogica.', fr: 'Des petits transports aux trajets d’entreprise disponibles. Une plateforme avec une vraie logique de demandes, trajets et matching.' })}</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 26 }}>
                  <Btn onClick={() => setPage('register')}>{tx({ de: 'Jetzt starten', en: 'Start now', tr: 'Şimdi başla', pl: 'Zacznij teraz', nl: 'Start nu', fr: 'Commencer' })}</Btn>
                  <Btn secondary onClick={() => setPage('login')}>{tx({ de: 'Einloggen', en: 'Log in', tr: 'Giriş yap', pl: 'Zaloguj się', nl: 'Inloggen', fr: 'Se connecter' })}</Btn>
                </div>
                <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap', color: '#475569', fontSize: 14, fontWeight: 600 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={16} color="#F97316" /> {tx({ de: 'Sichere Plattform', en: 'Secure platform', tr: 'Güvenli platform', pl: 'Bezpieczna platforma', nl: 'Veilig platform', fr: 'Plateforme sécurisée' })}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={16} color="#F97316" /> {tx({ de: 'Für Privat & Firmen', en: 'For private & companies', tr: 'Bireysel ve şirketler için', pl: 'Dla klientów i firm', nl: 'Voor particulieren en bedrijven', fr: 'Pour particuliers et entreprises' })}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={16} color="#F97316" /> {tx({ de: 'Schnelle Vermittlung', en: 'Fast matching', tr: 'Hızlı eşleştirme', pl: 'Szybkie dopasowanie', nl: 'Snelle matching', fr: 'Mise en relation rapide' })}</span>
                </div>
              </div>

              <Card style={{ padding: 28 }}>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{tx({ de: 'Was jetzt wirklich funktioniert', en: 'What actually works now', tr: 'Artık gerçekten çalışanlar', pl: 'Co już naprawdę działa', nl: 'Wat nu echt werkt', fr: 'Ce qui fonctionne réellement maintenant' })}</div>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} /><span>{tx({ de: 'Transportanfragen speichern', en: 'Store transport requests', tr: 'Taşıma taleplerini kaydet', pl: 'Zapisuj zlecenia transportowe', nl: 'Transportaanvragen opslaan', fr: 'Enregistrer les demandes de transport' })}</span></div>
                  <div style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} /><span>{tx({ de: 'Freie Routen speichern', en: 'Store free routes', tr: 'Boş rotaları kaydet', pl: 'Zapisuj wolne trasy', nl: 'Vrije routes opslaan', fr: 'Enregistrer les trajets libres' })}</span></div>
                  <div style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} /><span>{tx({ de: 'Dashboard mit echten Einträgen', en: 'Dashboard with real entries', tr: 'Gerçek kayıtlarla panel', pl: 'Panel z prawdziwymi wpisami', nl: 'Dashboard met echte items', fr: 'Tableau de bord avec de vraies entrées' })}</span></div>
                  <div style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} /><span>{tx({ de: 'Einfaches Matching zwischen Anfrage und Route', en: 'Simple matching between request and route', tr: 'Talep ve rota arasında basit eşleştirme', pl: 'Proste dopasowanie zlecenia i trasy', nl: 'Eenvoudige matching tussen aanvraag en route', fr: 'Correspondance simple entre demande et trajet' })}</span></div>
                </div>
              </Card>
            </section>

            <section style={{ marginBottom: 44 }}><div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 16 }}><StatCard value={String(requests.length)} label={tx({ de: 'Anfragen gespeichert', en: 'Requests stored', tr: 'Kaydedilen talepler', pl: 'Zapisane zlecenia', nl: 'Opgeslagen aanvragen', fr: 'Demandes enregistrées' })} /><StatCard value={String(routes.length)} label={tx({ de: 'Routen gespeichert', en: 'Routes stored', tr: 'Kaydedilen rotalar', pl: 'Zapisane trasy', nl: 'Opgeslagen routes', fr: 'Trajets enregistrés' })} /><StatCard value={String(matchedRequestCount)} label={tx({ de: 'Anfragen mit Match', en: 'Requests with match', tr: 'Eşleşen talepler', pl: 'Zlecenia z dopasowaniem', nl: 'Aanvragen met match', fr: 'Demandes avec correspondance' })} /></div></section>

            <section style={{ marginBottom: 64 }}><SectionTitle title={tx({ de: 'Was du mit Shipen bewegen kannst', en: 'What you can move with Shipen', tr: 'Shipen ile neleri taşıyabilirsin', pl: 'Co możesz przewieźć z Shipen', nl: 'Wat je met Shipen kunt vervoeren', fr: 'Ce que vous pouvez transporter avec Shipen' })} text={tx({ de: 'Die Startseite soll wieder groß wirken – mit klaren Bereichen für Privatkunden, Sperrgut und Firmenlogistik.', en: 'The homepage should feel big again – with clear areas for private customers, bulky goods and company logistics.', tr: 'Ana sayfa tekrar büyük görünmeli – bireysel, hacimli yük ve şirket lojistiği için net alanlarla.', pl: 'Strona główna ma znów wyglądać szeroko – z jasnymi sekcjami dla klientów prywatnych, gabarytów i logistyki firmowej.', nl: 'De homepage moet weer groot aanvoelen – met duidelijke delen voor particulieren, grofvracht en bedrijfslogistiek.', fr: 'La page d’accueil doit redevenir riche – avec des sections claires pour particuliers, encombrants et logistique d’entreprise.' })} /><div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 18 }}><Card style={{ minHeight: 210 }}><div style={{ width: 52, height: 52, borderRadius: 18, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F97316', fontWeight: 800, fontSize: 22 }}>P</div><div style={{ fontSize: 22, fontWeight: 800, marginTop: 16, marginBottom: 8 }}>{tx({ de: 'Kleine Transporte', en: 'Small transports', tr: 'Küçük taşımalar', pl: 'Małe transporty', nl: 'Kleine transporten', fr: 'Petits transports' })}</div><div style={{ color: '#64748b', lineHeight: 1.8 }}>{tx({ de: 'Pakete, Kartons, einzelne Möbel und spontane Fahrten.', en: 'Parcels, boxes, single furniture pieces and quick rides.', tr: 'Paketler, kutular, tekil mobilyalar ve hızlı taşımalar.', pl: 'Paczki, kartony, pojedyncze meble i szybkie przewozy.', nl: 'Pakketten, dozen, losse meubels en snelle ritten.', fr: 'Colis, cartons, meubles isolés et trajets rapides.' })}</div></Card><Card style={{ minHeight: 210 }}><div style={{ width: 52, height: 52, borderRadius: 18, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F97316', fontWeight: 800, fontSize: 22 }}>M</div><div style={{ fontSize: 22, fontWeight: 800, marginTop: 16, marginBottom: 8 }}>{tx({ de: 'Möbel & Sperrgut', en: 'Furniture & bulky goods', tr: 'Mobilya ve hacimli yük', pl: 'Meble i gabaryty', nl: 'Meubels & grofvracht', fr: 'Meubles & encombrants' })}</div><div style={{ color: '#64748b', lineHeight: 1.8 }}>{tx({ de: 'Waschmaschinen, Sofas, Umzüge und größere Privattransporte.', en: 'Washing machines, sofas, moves and larger private transports.', tr: 'Çamaşır makineleri, koltuklar, taşınmalar ve daha büyük bireysel taşımalar.', pl: 'Pralki, sofy, przeprowadzki i większe prywatne transporty.', nl: 'Wasmachines, banken, verhuizingen en grotere particuliere transporten.', fr: 'Machines à laver, canapés, déménagements et transports privés plus grands.' })}</div></Card><Card style={{ minHeight: 210 }}><div style={{ width: 52, height: 52, borderRadius: 18, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F97316', fontWeight: 800, fontSize: 22 }}>B</div><div style={{ fontSize: 22, fontWeight: 800, marginTop: 16, marginBottom: 8 }}>{tx({ de: 'Firmen & B2B', en: 'Companies & B2B', tr: 'Şirketler ve B2B', pl: 'Firmy i B2B', nl: 'Bedrijven & B2B', fr: 'Entreprises & B2B' })}</div><div style={{ color: '#64748b', lineHeight: 1.8 }}>{tx({ de: 'Freie Kapazitäten, feste Routen und Überlauf-Aufträge.', en: 'Free capacity, fixed routes and overflow jobs.', tr: 'Boş kapasite, sabit rotalar ve taşan işler.', pl: 'Wolne moce, stałe trasy i zlecenia nadmiarowe.', nl: 'Vrije capaciteit, vaste routes en overloopopdrachten.', fr: 'Capacité libre, trajets fixes et missions en surcharge.' })}</div></Card></div></section>

            <section style={{ marginBottom: 52 }}><SectionTitle title={tx({ de: 'So funktioniert Shipen', en: 'How Shipen works', tr: 'Shipen nasıl çalışır', pl: 'Jak działa Shipen', nl: 'Hoe Shipen werkt', fr: 'Comment fonctionne Shipen' })} text={tx({ de: 'Die große Startseite braucht wieder klare Schritte, damit Nutzer sofort verstehen, was sie tun können.', en: 'The larger homepage needs clear steps again so users immediately understand what they can do.', tr: 'Büyük ana sayfa, kullanıcıların ne yapabileceğini hemen anlaması için tekrar net adımlar gerektirir.', pl: 'Duża strona główna znów potrzebuje jasnych kroków, aby użytkownicy od razu wiedzieli, co mogą zrobić.', nl: 'De grote homepage heeft weer duidelijke stappen nodig zodat gebruikers meteen begrijpen wat ze kunnen doen.', fr: 'La grande page d’accueil a de nouveau besoin d’étapes claires pour que les utilisateurs comprennent immédiatement quoi faire.' })} /><div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 16 }}><Card><div style={{ fontSize: 42, fontWeight: 800, color: '#F97316' }}>1</div><div style={{ fontWeight: 800, marginTop: 8 }}>{tx({ de: 'Anfrage oder Route erstellen', en: 'Create request or route', tr: 'Talep veya rota oluştur', pl: 'Utwórz zlecenie lub trasę', nl: 'Maak aanvraag of route', fr: 'Créer une demande ou un trajet' })}</div></Card><Card><div style={{ fontSize: 42, fontWeight: 800, color: '#F97316' }}>2</div><div style={{ fontWeight: 800, marginTop: 8 }}>{tx({ de: 'Passende Vorschläge sehen', en: 'See matching suggestions', tr: 'Uygun önerileri gör', pl: 'Zobacz dopasowane propozycje', nl: 'Bekijk passende voorstellen', fr: 'Voir les correspondances' })}</div></Card><Card><div style={{ fontSize: 42, fontWeight: 800, color: '#F97316' }}>3</div><div style={{ fontWeight: 800, marginTop: 8 }}>{tx({ de: 'Im Dashboard verwalten', en: 'Manage it in dashboard', tr: 'Panelde yönet', pl: 'Zarządzaj w panelu', nl: 'Beheer in dashboard', fr: 'Gérer dans le tableau de bord' })}</div></Card></div></section>

            <section style={{ marginBottom: 64 }}><SectionTitle title={tx({ de: 'Live-Einträge auf der Plattform', en: 'Live entries on the platform', tr: 'Platformdaki canlı kayıtlar', pl: 'Wpisy na żywo na platformie', nl: 'Live items op het platform', fr: 'Entrées en direct sur la plateforme' })} text={tx({ de: 'Hier sieht die Seite wieder lebendig aus, statt nur kurz und technisch zu wirken.', en: 'This makes the page feel alive again instead of short and purely technical.', tr: 'Bu, sayfanın sadece teknik değil tekrar canlı görünmesini sağlar.', pl: 'Dzięki temu strona znów wygląda żywo, a nie tylko technicznie.', nl: 'Zo voelt de pagina weer levendig in plaats van alleen technisch.', fr: 'Cela redonne de la vie à la page au lieu d’un simple aspect technique.' })} /><div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 18 }}><Card><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}><div style={{ fontSize: 22, fontWeight: 800 }}>{tx({ de: 'Neueste Anfragen', en: 'Latest requests', tr: 'Son talepler', pl: 'Najnowsze zlecenia', nl: 'Nieuwste aanvragen', fr: 'Dernières demandes' })}</div><Badge>{requests.length}</Badge></div><div style={{ display: 'grid', gap: 12 }}>{requests.slice(0, 3).map((req: TransportRequest) => <div key={req.id} style={{ border: '1px solid #e2e8f0', borderRadius: 18, padding: 16, background: '#fcfdff' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><div><div style={{ fontWeight: 700, fontSize: 16 }}>{req.from} → {req.to}</div><div style={{ color: '#64748b', marginTop: 6 }}>{req.item}</div></div><div style={{ textAlign: 'right' }}><div style={{ fontWeight: 700 }}>{req.estimatedLow}–{req.estimatedHigh} €</div><div style={{ color: '#94a3b8', fontSize: 12 }}>{formatStatus(req.status, lang)}</div></div></div></div>)}{requests.length === 0 && <div style={{ color: '#64748b' }}>{tx({ de: 'Noch keine Anfragen vorhanden.', en: 'No requests yet.', tr: 'Henüz talep yok.', pl: 'Brak zleceń.', nl: 'Nog geen aanvragen.', fr: 'Aucune demande pour le moment.' })}</div>}</div></Card><Card><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}><div style={{ fontSize: 22, fontWeight: 800 }}>{tx({ de: 'Neueste freie Routen', en: 'Latest free routes', tr: 'Son boş rotalar', pl: 'Najnowsze wolne trasy', nl: 'Nieuwste vrije routes', fr: 'Derniers trajets libres' })}</div><Badge>{routes.length}</Badge></div><div style={{ display: 'grid', gap: 12 }}>{routes.slice(0, 3).map((route: FreeRoute) => <div key={route.id} style={{ border: '1px solid #e2e8f0', borderRadius: 18, padding: 16, background: '#fcfdff' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><div><div style={{ fontWeight: 700, fontSize: 16 }}>{route.from} → {route.to}</div><div style={{ color: '#64748b', marginTop: 6 }}>{route.vehicleType}</div></div><div style={{ textAlign: 'right' }}><div style={{ fontWeight: 700 }}>{route.price}</div><div style={{ color: '#94a3b8', fontSize: 12 }}>{formatStatus(route.status, lang)}</div></div></div></div>)}{routes.length === 0 && <div style={{ color: '#64748b' }}>{tx({ de: 'Noch keine Routen vorhanden.', en: 'No routes yet.', tr: 'Henüz rota yok.', pl: 'Brak tras.', nl: 'Nog geen routes.', fr: 'Aucun trajet pour le moment.' })}</div>}</div></Card></div></section>

            <section style={{ marginBottom: 72 }}><Card dark style={{ padding: isMobile ? 24 : 34, borderRadius: 30 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row' }}><div style={{ maxWidth: 720 }}><div style={{ fontSize: isMobile ? 28 : 34, fontWeight: 800, lineHeight: 1.05 }}>{tx({ de: 'Bereit für die nächste Ausbaustufe', en: 'Ready for the next stage', tr: 'Bir sonraki aşamaya hazır', pl: 'Gotowe na kolejny etap', nl: 'Klaar voor de volgende stap', fr: 'Prêt pour la prochaine étape' })}</div><div style={{ color: '#cbd5e1', marginTop: 10, lineHeight: 1.8 }}>{tx({ de: 'Große Startseite ist zurück. Jetzt können wir Suche, Nutzertrennung und besseres Matching bauen.', en: 'The big homepage is back. Now we can build search, user separation and better matching.', tr: 'Büyük ana sayfa geri döndü. Şimdi arama, kullanıcı ayrımı ve daha iyi eşleştirme kurabiliriz.', pl: 'Duża strona główna wróciła. Teraz możemy budować wyszukiwanie, separację użytkowników i lepsze dopasowanie.', nl: 'De grote homepage is terug. Nu kunnen we zoeken, gebruikersscheiding en bessere matching bouwen.', fr: 'La grande page d’accueil est revenue. Nous pouvons maintenant construire la recherche, la séparation des utilisateurs et un meilleur matching.' })}</div></div><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><Btn onClick={() => setPage('register')}>{tx({ de: 'Registrieren', en: 'Register', tr: 'Kayıt ol', pl: 'Rejestracja', nl: 'Registreren', fr: 'Inscription' })}</Btn><Btn secondary onClick={() => setPage('dashboard')} style={{ background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>{tx({ de: 'Zum Dashboard', en: 'To dashboard', tr: 'Panele git', pl: 'Do panelu', nl: 'Naar dashboard', fr: 'Vers le tableau de bord' })}</Btn></div></div></Card></section>
          </>
        )}

        {page === 'login' && (
          <section style={{ maxWidth: 480, margin: '40px auto 0' }}>
            <Card style={{ padding: 30 }}>
              <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>{tx({ de: 'Login', en: 'Login', tr: 'Giriş', pl: 'Login', nl: 'Login', fr: 'Connexion' })}</div>
              <div style={{ color: '#64748b', marginBottom: 22 }}>{tx({ de: 'Melde dich an und verwalte deine Transporte an einem Ort.', en: 'Sign in and manage your transports in one place.', tr: 'Giriş yap ve taşımalarını tek bir yerde yönet.', pl: 'Zaloguj się i zarządzaj transportami w jednym miejscu.', nl: 'Log in en beheer je transporten op één plek.', fr: 'Connectez-vous et gérez vos transports au même endroit.' })}</div>
              <div style={{ display: 'grid', gap: 14 }}>
                <Input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Email" />
                <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder={tx({ de: 'Passwort', en: 'Password', tr: 'Şifre', pl: 'Hasło', nl: 'Wachtwoord', fr: 'Mot de passe' })} />
                <Select value={role} onChange={(e) => setRole(e.target.value as Role)} placeholder={tx({ de: 'Rolle wählen', en: 'Select role', tr: 'Rol seç', pl: 'Wybierz rolę', nl: 'Kies rol', fr: 'Choisir un rôle' })} options={[{ value: 'private', label: tx({ de: 'Privatkunde', en: 'Private customer', tr: 'Bireysel müşteri', pl: 'Klient prywatny', nl: 'Particulier', fr: 'Particulier' }) }, { value: 'driver', label: tx({ de: 'Fahrer', en: 'Driver', tr: 'Sürücü', pl: 'Kierowca', nl: 'Chauffeur', fr: 'Chauffeur' }) }, { value: 'company', label: tx({ de: 'Firma', en: 'Company', tr: 'Şirket', pl: 'Firma', nl: 'Bedrijf', fr: 'Entreprise' }) }]} />
                <Btn onClick={login}>{tx({ de: 'Einloggen', en: 'Log in', tr: 'Giriş yap', pl: 'Zaloguj się', nl: 'Inloggen', fr: 'Se connecter' })}</Btn>
              </div>
            </Card>
          </section>
        )}

        {page === 'register' && (
          <section style={{ maxWidth: 920, margin: '40px auto 0' }}>
            <SectionTitle title={tx({ de: 'Registrieren & loslegen', en: 'Register & get started', tr: 'Kayıt ol ve başla', pl: 'Zarejestruj się i zacznij', nl: 'Registreer en start', fr: 'Inscrivez-vous et commencez' })} text={tx({ de: 'Lege dein Konto an und starte als Privatkunde, Fahrer oder Firma.', en: 'Create your account and start as a private customer, driver or company.', tr: 'Hesabını oluştur ve bireysel müşteri, sürücü veya şirket olarak başla.', pl: 'Załóż konto i zacznij jako klient prywatny, kierowca lub firma.', nl: 'Maak je account aan en start als particulier, chauffeur of bedrijf.', fr: 'Créez votre compte et commencez comme particulier, chauffeur ou entreprise.' })} />
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.15fr 0.85fr', gap: 16 }}>
              <Card>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}><Btn type="button" secondary={role !== 'private'} onClick={() => setRole('private')}>{tx({ de: 'Privatkunde', en: 'Private customer', tr: 'Bireysel müşteri', pl: 'Klient prywatny', nl: 'Particulier', fr: 'Particulier' })}</Btn><Btn type="button" secondary={role !== 'driver'} onClick={() => setRole('driver')}>{tx({ de: 'Fahrer', en: 'Driver', tr: 'Sürücü', pl: 'Kierowca', nl: 'Chauffeur', fr: 'Chauffeur' })}</Btn><Btn type="button" secondary={role !== 'company'} onClick={() => setRole('company')}>{tx({ de: 'Firma', en: 'Company', tr: 'Şirket', pl: 'Firma', nl: 'Bedrijf', fr: 'Entreprise' })}</Btn></div>
                <div style={{ display: 'grid', gap: 12 }}>
                  <Input value={registerName} onChange={(e) => setRegisterName(e.target.value)} placeholder={tx({ de: 'Name', en: 'Name', tr: 'İsim', pl: 'Imię i nazwisko', nl: 'Naam', fr: 'Nom' })} />
                  <Input value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} placeholder="Email" />
                  <Input type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} placeholder={tx({ de: 'Passwort', en: 'Password', tr: 'Şifre', pl: 'Hasło', nl: 'Wachtwoord', fr: 'Mot de passe' })} />
                  <Btn onClick={createAccount}>{tx({ de: 'Konto erstellen', en: 'Create account', tr: 'Hesap oluştur', pl: 'Utwórz konto', nl: 'Account maken', fr: 'Créer un compte' })}</Btn>
                </div>
              </Card>
              <Card dark><div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>{tx({ de: 'Nach der Registrierung', en: 'After registration', tr: 'Kayıttan sonra', pl: 'Po rejestracji', nl: 'Na registratie', fr: 'Après l’inscription' })}</div><div style={{ display: 'grid', gap: 10, color: '#cbd5e1', lineHeight: 1.7 }}><div>1. {tx({ de: 'Ins Dashboard gehen', en: 'Go to dashboard', tr: 'Panele git', pl: 'Przejdź do panelu', nl: 'Ga naar dashboard', fr: 'Aller au tableau de bord' })}</div><div>2. {tx({ de: 'Anfrage oder Route anlegen', en: 'Create request or route', tr: 'Talep veya rota oluştur', pl: 'Utwórz zlecenie lub trasę', nl: 'Maak aanvraag of route', fr: 'Créer une demande ou un trajet' })}</div><div>3. {tx({ de: 'Matches im System sehen', en: 'See matches in the system', tr: 'Sistemde eşleşmeleri gör', pl: 'Zobacz dopasowania w systemie', nl: 'Bekijk matches in het systeem', fr: 'Voir les correspondances dans le système' })}</div></div></Card>
            </div>
          </section>
        )}

        {page === 'dashboard' && (
          <section style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}><div><h1 style={{ margin: 0, fontSize: 34 }}>{tx({ de: 'Dashboard', en: 'Dashboard', tr: 'Panel', pl: 'Panel', nl: 'Dashboard', fr: 'Tableau de bord' })}</h1><div style={{ color: '#64748b', marginTop: 6 }}>{user ? `${user.name} · ${user.email}` : tx({ de: 'Demo-Modus', en: 'Demo mode', tr: 'Demo modu', pl: 'Tryb demo', nl: 'Demomodus', fr: 'Mode démo' })}</div></div><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><Btn secondary onClick={() => setRole('private')}>{tx({ de: 'Privat', en: 'Private', tr: 'Bireysel', pl: 'Prywatny', nl: 'Particulier', fr: 'Particulier' })}</Btn><Btn secondary onClick={() => setRole('driver')}>{tx({ de: 'Fahrer', en: 'Driver', tr: 'Sürücü', pl: 'Kierowca', nl: 'Chauffeur', fr: 'Chauffeur' })}</Btn><Btn secondary onClick={() => setRole('company')}>{tx({ de: 'Firma', en: 'Company', tr: 'Şirket', pl: 'Firma', nl: 'Bedrijf', fr: 'Entreprise' })}</Btn></div></div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}><StatCard value={String(requests.length)} label={tx({ de: 'Alle Anfragen', en: 'All requests', tr: 'Tüm talepler', pl: 'Wszystkie zlecenia', nl: 'Alle aanvragen', fr: 'Toutes les demandes' })} /><StatCard value={String(routes.length)} label={tx({ de: 'Alle Routen', en: 'All routes', tr: 'Tüm rotalar', pl: 'Wszystkie trasy', nl: 'Alle routes', fr: 'Tous les trajets' })} /><StatCard value={String(matchedRequestCount)} label={tx({ de: 'Mit Match', en: 'With match', tr: 'Eşleşmeli', pl: 'Z dopasowaniem', nl: 'Met match', fr: 'Avec correspondance' })} /></div>

            {role === 'private' && <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}><Card><div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{tx({ de: 'Neue Transportanfrage', en: 'New transport request', tr: 'Yeni taşıma talebi', pl: 'Nowe zlecenie transportowe', nl: 'Nieuwe transportaanvraag', fr: 'Nouvelle demande de transport' })}</div><div style={{ display: 'grid', gap: 12 }}><div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}><Input value={requestForm.from} onChange={(e) => setRequestForm({ ...requestForm, from: e.target.value })} placeholder={tx({ de: 'Von', en: 'From', tr: 'Nereden', pl: 'Skąd', nl: 'Van', fr: 'De' })} /><Input value={requestForm.to} onChange={(e) => setRequestForm({ ...requestForm, to: e.target.value })} placeholder={tx({ de: 'Nach', en: 'To', tr: 'Nereye', pl: 'Dokąd', nl: 'Naar', fr: 'À' })} /></div><Input value={requestForm.item} onChange={(e) => setRequestForm({ ...requestForm, item: e.target.value })} placeholder={tx({ de: 'Was soll transportiert werden?', en: 'What should be transported?', tr: 'Ne taşınacak?', pl: 'Co należy przewieźć?', nl: 'Wat moet vervoerd worden?', fr: 'Que faut-il transporter ?' })} /><div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 12 }}><Input type="number" value={requestForm.distance} onChange={(e) => setRequestForm({ ...requestForm, distance: e.target.value })} placeholder={tx({ de: 'Distanz km', en: 'Distance km', tr: 'Mesafe km', pl: 'Dystans km', nl: 'Afstand km', fr: 'Distance km' })} /><Select value={requestForm.size} onChange={(e) => setRequestForm({ ...requestForm, size: e.target.value })} placeholder={tx({ de: 'Größe', en: 'Size', tr: 'Boyut', pl: 'Rozmiar', nl: 'Grootte', fr: 'Taille' })} options={[{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }, { value: 'bulky', label: 'Bulky' }]} /><Select value={requestForm.helpers} onChange={(e) => setRequestForm({ ...requestForm, helpers: e.target.value })} placeholder={tx({ de: 'Helfer', en: 'Helpers', tr: 'Yardımcılar', pl: 'Pomocnicy', nl: 'Helpers', fr: 'Aides' })} options={[{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }]} /></div><Card dark><div style={{ color: '#FDBA74', fontWeight: 700 }}>{tx({ de: 'Geschätzter Preis', en: 'Estimated price', tr: 'Tahmini fiyat', pl: 'Szacowana cena', nl: 'Geschatte prijs', fr: 'Prix estimé' })}</div><div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>{estimate.low} € – {estimate.high} €</div></Card><Btn onClick={submitRequest}>{tx({ de: 'Anfrage speichern', en: 'Save request', tr: 'Talebi kaydet', pl: 'Zapisz zlecenie', nl: 'Aanvraag opslaan', fr: 'Enregistrer la demande' })}</Btn></div></Card><Card><div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{tx({ de: 'Meine Anfragen', en: 'My requests', tr: 'Taleplerim', pl: 'Moje zlecenia', nl: 'Mijn aanvragen', fr: 'Mes demandes' })}</div><div style={{ display: 'grid', gap: 12 }}>{requests.length === 0 && <div style={{ color: '#64748b' }}>{tx({ de: 'Noch keine Anfragen gespeichert.', en: 'No requests saved yet.', tr: 'Henüz kayıtlı talep yok.', pl: 'Brak zapisanych zleceń.', nl: 'Nog geen aanvragen opgeslagen.', fr: 'Aucune demande enregistrée.' })}</div>}{requests.map((req: TransportRequest) => {const matches = getMatchesForRequest(req); return <Card key={req.id} style={{ padding: 18, background: '#f8fafc', boxShadow: 'none' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><div><div style={{ fontWeight: 700 }}>{req.from} → {req.to}</div><div style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>{req.item}</div><div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}><Badge>{formatStatus(matches.length ? 'matched' : req.status, lang)}</Badge><Badge>{req.estimatedLow}–{req.estimatedHigh} €</Badge></div></div><div style={{ minWidth: 160 }}><div style={{ fontSize: 13, color: '#64748b' }}>{tx({ de: 'Passende Routen', en: 'Matching routes', tr: 'Uygun rotalar', pl: 'Pasujące trasy', nl: 'Passende routes', fr: 'Trajets correspondants' })}</div><div style={{ fontWeight: 800, fontSize: 28 }}>{matches.length}</div></div></div>{matches.length > 0 && <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>{matches.slice(0, 2).map((match: FreeRoute) => <div key={match.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', background: '#fff', borderRadius: 14, padding: 12, border: '1px solid #e2e8f0' }}><div><div style={{ fontWeight: 700 }}>{match.providerName}</div><div style={{ color: '#64748b', fontSize: 14 }}>{match.from} → {match.to}</div></div><div style={{ textAlign: 'right' }}><div style={{ fontWeight: 700 }}>{match.price}</div><div style={{ color: '#64748b', fontSize: 12 }}>{match.vehicleType}</div></div></div>)}</div>}</Card>;})}</div></Card></div>}

            {(role === 'driver' || role === 'company') && <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}><Card><div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{tx({ de: 'Neue freie Route', en: 'New free route', tr: 'Yeni boş rota', pl: 'Nowa wolna trasa', nl: 'Nieuwe vrije route', fr: 'Nouveau trajet libre' })}</div><div style={{ display: 'grid', gap: 12 }}><div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}><Input value={routeForm.from} onChange={(e) => setRouteForm({ ...routeForm, from: e.target.value })} placeholder={tx({ de: 'Von', en: 'From', tr: 'Nereden', pl: 'Skąd', nl: 'Van', fr: 'De' })} /><Input value={routeForm.to} onChange={(e) => setRouteForm({ ...routeForm, to: e.target.value })} placeholder={tx({ de: 'Nach', en: 'To', tr: 'Nereye', pl: 'Dokąd', nl: 'Naar', fr: 'À' })} /></div><div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 12 }}><Input value={routeForm.vehicleType} onChange={(e) => setRouteForm({ ...routeForm, vehicleType: e.target.value })} placeholder={tx({ de: 'Fahrzeugtyp', en: 'Vehicle type', tr: 'Araç tipi', pl: 'Typ pojazdu', nl: 'Voertuigtype', fr: 'Type de véhicule' })} /><Input value={routeForm.capacity} onChange={(e) => setRouteForm({ ...routeForm, capacity: e.target.value })} placeholder={tx({ de: 'Freie Kapazität', en: 'Free capacity', tr: 'Boş kapasite', pl: 'Wolna pojemność', nl: 'Vrije capaciteit', fr: 'Capacité libre' })} /><Input value={routeForm.price} onChange={(e) => setRouteForm({ ...routeForm, price: e.target.value })} placeholder={tx({ de: 'Preis / ab', en: 'Price / from', tr: 'Fiyat / başlangıç', pl: 'Cena / od', nl: 'Prijs / vanaf', fr: 'Prix / à partir de' })} /></div><Btn onClick={submitRoute}>{tx({ de: 'Route speichern', en: 'Save route', tr: 'Rotayı kaydet', pl: 'Zapisz trasę', nl: 'Route opslaan', fr: 'Enregistrer le trajet' })}</Btn></div></Card><Card><div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{tx({ de: 'Passende offene Anfragen', en: 'Matching open requests', tr: 'Uygun açık talepler', pl: 'Pasujące otwarte zlecenia', nl: 'Passende open aanvragen', fr: 'Demandes ouvertes correspondantes' })}</div><div style={{ display: 'grid', gap: 12 }}>{requests.filter((r: TransportRequest) => getMatchesForRequest(r).length > 0).length === 0 && <div style={{ color: '#64748b' }}>{tx({ de: 'Noch keine passenden Anfragen vorhanden.', en: 'No matching requests yet.', tr: 'Henüz uygun talep yok.', pl: 'Brak pasujących zleceń.', nl: 'Nog geen passende aanvragen.', fr: 'Aucune demande correspondante pour le moment.' })}</div>}{requests.filter((r: TransportRequest) => getMatchesForRequest(r).length > 0).map((req: TransportRequest) => <div key={req.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 18, padding: 16 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><div><div style={{ fontWeight: 700 }}>{req.from} → {req.to}</div><div style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>{req.item}</div></div><div style={{ textAlign: 'right' }}><div style={{ fontWeight: 700 }}>{req.estimatedLow}–{req.estimatedHigh} €</div><div style={{ color: '#64748b', fontSize: 12 }}>{formatStatus(req.status, lang)}</div></div></div></div>)}</div></Card></div>}
          </section>
        )}
      </main>

      <footer style={{ width: '100vw', marginTop: 60, marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)', padding: '70px 0 40px', background: '#000000', color: '#ffffff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr 1fr 1fr', gap: 20 }}>
          <div><div style={{ fontWeight: 800, fontSize: 18 }}>Shipen</div><div style={{ color: '#94a3b8', fontSize: 14, marginTop: 10 }}>{tx({ de: 'Jetzt mit echter Produktlogik im Frontend.', en: 'Now with real product logic in the frontend.', tr: 'Artık ön yüzde gerçek ürün mantığı ile.', pl: 'Teraz z prawdziwą logiką produktu w frontendzie.', nl: 'Nu met echte productlogica in de frontend.', fr: 'Maintenant avec une vraie logique produit dans le frontend.' })}</div></div>
          <div><div style={{ fontWeight: 700, marginBottom: 12 }}>{tx({ de: 'Kernfunktionen', en: 'Core features', tr: 'Temel özellikler', pl: 'Funkcje główne', nl: 'Kernfuncties', fr: 'Fonctions clés' })}</div><div style={{ display: 'grid', gap: 8, fontSize: 14 }}><span>{tx({ de: 'Anfragen anlegen', en: 'Create requests', tr: 'Talep oluştur', pl: 'Twórz zlecenia', nl: 'Aanvragen maken', fr: 'Créer des demandes' })}</span><span>{tx({ de: 'Routen anlegen', en: 'Create routes', tr: 'Rota oluştur', pl: 'Twórz trasy', nl: 'Routes maken', fr: 'Créer des trajets' })}</span><span>{tx({ de: 'Matches sehen', en: 'See matches', tr: 'Eşleşmeleri gör', pl: 'Zobacz dopasowania', nl: 'Matches bekijken', fr: 'Voir les correspondances' })}</span></div></div>
          <div><div style={{ fontWeight: 700, marginBottom: 12 }}>{tx({ de: 'Rollen', en: 'Roles', tr: 'Roller', pl: 'Role', nl: 'Rollen', fr: 'Rôles' })}</div><div style={{ display: 'grid', gap: 8, fontSize: 14 }}><span>{tx({ de: 'Privatkunde', en: 'Private customer', tr: 'Bireysel müşteri', pl: 'Klient prywatny', nl: 'Particulier', fr: 'Particulier' })}</span><span>{tx({ de: 'Fahrer', en: 'Driver', tr: 'Sürücü', pl: 'Kierowca', nl: 'Chauffeur', fr: 'Chauffeur' })}</span><span>{tx({ de: 'Firma', en: 'Company', tr: 'Şirket', pl: 'Firma', nl: 'Bedrijf', fr: 'Entreprise' })}</span></div></div>
          <div><div style={{ fontWeight: 700, marginBottom: 12 }}>{tx({ de: 'Nächster Schritt', en: 'Next step', tr: 'Sonraki adım', pl: 'Następny krok', nl: 'Volgende stap', fr: 'Étape suivante' })}</div><div style={{ display: 'grid', gap: 8, fontSize: 14 }}><span>{tx({ de: 'Suche & Matching', en: 'Search & matching', tr: 'Arama ve eşleştirme', pl: 'Wyszukiwanie i dopasowanie', nl: 'Zoeken & matching', fr: 'Recherche et matching' })}</span><span>{tx({ de: 'Nutzertrennung', en: 'User separation', tr: 'Kullanıcı ayrımı', pl: 'Rozdzielenie użytkowników', nl: 'Gebruikersscheiding', fr: 'Séparation des utilisateurs' })}</span></div></div>
        </div>
      </footer>
    </div>
  );
}
