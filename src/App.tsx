import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Truck,
  MapPin,
  Package,
  Building2,
  User,
  ShieldCheck,
  Euro,
  Route,
  Search,
  CheckCircle2,
  Star,
} from 'lucide-react';

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

type Lang = 'de' | 'en' | 'tr' | 'pl' | 'nl' | 'fr';
type Role = 'private' | 'driver' | 'company';
type Page = 'home' | 'login' | 'register' | 'dashboard';
type Status = 'open' | 'matched' | 'accepted' | 'completed';

type TransportRequest = {
  id: string;
  createdAt: string;
  ownerRole: 'private';
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
  ownerRole: 'driver' | 'company';
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
        borderRadius: 24,
        padding: 22,
        border: dark ? 'none' : '1px solid #e8eef5',
        boxShadow: dark ? 'none' : '0 18px 40px rgba(15,23,42,0.08)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Btn({ children, secondary = false, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  return (
    <button
      {...props}
      style={{
        padding: '13px 17px',
        minHeight: 46,
        borderRadius: 14,
        border: secondary ? '1px solid #cbd5e1' : '1px solid #F97316',
        background: secondary ? '#ffffff' : '#F97316',
        color: secondary ? '#0f172a' : '#ffffff',
        fontWeight: 600,
        fontSize: 14,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.65 : 1,
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
        boxSizing: 'border-box',
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: '#fff7ed', color: '#9a3412', border: '1px solid #fdba74' }}>
      {children}
    </span>
  );
}

function SectionTitle({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ maxWidth: 780, marginBottom: 24 }}>
      <h2 style={{ fontSize: 34, lineHeight: 1.08, margin: 0 }}>{title}</h2>
      <p style={{ marginTop: 10, color: '#475569', lineHeight: 1.7 }}>{text}</p>
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
  const tx = <T extends string>(copy: Record<Lang, T>) => copy[lang] || copy.de;

  const getInitialLang = (): Lang => {
    if (typeof window === 'undefined') return 'de';
    const saved = window.localStorage.getItem('shipen_lang');
    return saved && ['de', 'en', 'tr', 'pl', 'nl', 'fr'].includes(saved) ? (saved as Lang) : 'de';
  };

  const mapRequestRow = (row: any): TransportRequest => ({
    id: row.id,
    createdAt: row.created_at,
    ownerRole: 'private',
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
    ownerRole: 'driver',
    providerName: row.provider_name,
    from: row.from_location,
    to: row.to_location,
    vehicleType: row.vehicle_type,
    capacity: row.capacity,
    price: row.price,
    status: (row.status as Status) || 'open',
  });

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('shipen_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('shipen_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('shipen_routes', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsMobile(window.innerWidth < 920);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const applySession = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;
      if (sessionUser) {
        setUser({
          id: sessionUser.id,
          name: (sessionUser.user_metadata?.full_name as string) || sessionUser.email?.split('@')[0] || 'User',
          email: sessionUser.email || '',
          role: ((sessionUser.user_metadata?.role as Role) || 'private'),
        });
      }
    };

    applySession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
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

    return () => {
      listener.subscription.unsubscribe();
    };
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

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('transport_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setBanner(error.message);
      return;
    }

    setRequests((data || []).map(mapRequestRow));
  };

  const fetchRoutes = async () => {
    const { data, error } = await supabase
      .from('free_routes')
      .select('*')
      .order('created_at', { ascending: false });

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

  const createId = () => Math.random().toString(36).slice(2, 10);

  const getMatchesForRequest = (request: TransportRequest) => {
    const fromNeedle = request.from.trim().toLowerCase();
    const toNeedle = request.to.trim().toLowerCase();
    return routes.filter((route) => {
      const fromHit = route.from.toLowerCase().includes(fromNeedle) || fromNeedle.includes(route.from.toLowerCase());
      const toHit = route.to.toLowerCase().includes(toNeedle) || toNeedle.includes(route.to.toLowerCase());
      return fromHit || toHit;
    });
  };

  const matchedRequestCount = requests.filter((r) => getMatchesForRequest(r).length > 0).length;
  const relevantOpenRequests = requests.filter((r) => getMatchesForRequest(r).length > 0);

  const createAccount = async () => {
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setBanner(tx({ de: 'Bitte Name, E-Mail und Passwort ausfüllen.', en: 'Please fill in name, email and password.', tr: 'Lütfen ad, e-posta ve şifreyi doldurun.', pl: 'Wpisz imię, e-mail i hasło.', nl: 'Vul naam, e-mail en wachtwoord in.', fr: 'Veuillez saisir le nom, l’e-mail et le mot de passe.' }));
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: registerEmail.trim(),
      password: registerPassword,
      options: {
        data: {
          full_name: registerName.trim(),
          role,
        },
      },
    });

    if (error) {
      setBanner(error.message);
      return;
    }

    const authUser = data.user;
    if (authUser) {
      setUser({
        id: authUser.id,
        name: (authUser.user_metadata?.full_name as string) || registerName.trim(),
        email: authUser.email || registerEmail.trim(),
        role: ((authUser.user_metadata?.role as Role) || role),
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

    const authUser = data.user;
    setUser({
      id: authUser.id,
      name: (authUser.user_metadata?.full_name as string) || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || loginEmail.trim(),
      role: ((authUser.user_metadata?.role as Role) || role),
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
    <Card><div style={{ fontSize: 30, fontWeight: 800 }}>{value}</div><div style={{ color: '#64748b', marginTop: 8 }}>{label}</div></Card>
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
            {user && <Btn onClick={async () => { await supabase.auth.signOut(); setUser(null); setPage('home'); setBanner(tx({ de: 'Du wurdest abgemeldet.', en: 'You have been signed out.', tr: 'Çıkış yapıldı.', pl: 'Wylogowano.', nl: 'Je bent uitgelogd.', fr: 'Vous avez été déconnecté.' })); }}>{tx({ de: 'Logout', en: 'Logout', tr: 'Çıkış', pl: 'Wyloguj', nl: 'Uitloggen', fr: 'Déconnexion' })}</Btn>}
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} style={{ minHeight: 42, borderRadius: 12, border: '1px solid #cbd5e1', padding: '0 10px', background: '#fff' }}>
              <option value="de">DE</option>
              <option value="en">EN</option>
              <option value="tr">TR</option>
              <option value="pl">PL</option>
              <option value="nl">NL</option>
              <option value="fr">FR</option>
            </select>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px 80px' }}>
        {banner && (
          <div style={{ marginBottom: 18 }}>
            <Card dark style={{ background: '#14532d' }}>{banner}</Card>
          </div>
        )}

        {page === 'home' && (
          <>
            <section style={{ position: 'relative', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.08fr 1fr', gap: 24, marginBottom: 48, padding: '20px 0 30px' }}>
              <div style={{ position: 'absolute', top: -80, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(249,115,22,0.25)', filter: 'blur(100px)' }} />
              <div style={{ position: 'absolute', bottom: -80, left: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(249,115,22,0.15)', filter: 'blur(100px)' }} />

              <div style={{ position: 'relative' }}>
                <Badge>{tx({ de: 'Privat + Fahrer + Firmen', en: 'Private + drivers + companies', tr: 'Bireysel + sürücüler + şirketler', pl: 'Prywatni + kierowcy + firmy', nl: 'Particulier + chauffeurs + bedrijven', fr: 'Particuliers + chauffeurs + entreprises' })}</Badge>
                <h1 style={{ fontSize: isMobile ? 40 : 56, lineHeight: 1.02, margin: '18px 0 14px', letterSpacing: '-0.03em' }}>
                  {tx({ de: 'Transporte nicht nur zeigen.', en: 'Do not just show transport.', tr: 'Sadece gösterme.', pl: 'Nie tylko pokazuj transport.', nl: 'Toon transport niet alleen.', fr: 'Ne vous contentez pas d’afficher le transport.' })}
                  <br />
                  <span>{tx({ de: 'Sondern wirklich anlegen.', en: 'Actually create it.', tr: 'Gerçekten oluştur.', pl: 'Naprawdę go twórz.', nl: 'Maak het echt aan.', fr: 'Créez-le vraiment.' })}</span>
                </h1>
                <p style={{ color: '#475569', fontSize: 18, lineHeight: 1.8, maxWidth: 700 }}>
                  {tx({
                    de: 'Mit Option C ist Shipen jetzt nicht mehr nur Landingpage. Nutzer können Transportanfragen und freie Routen anlegen, speichern und im Dashboard wiederfinden.',
                    en: 'With Option C, Shipen is no longer just a landing page. Users can create transport requests and free routes, store them and find them again in the dashboard.',
                    tr: 'Option C ile Shipen artık sadece bir açılış sayfası değil. Kullanıcılar taşıma talepleri ve boş rotalar oluşturabilir, kaydedebilir ve panelde tekrar görebilir.',
                    pl: 'Dzięki opcji C Shipen nie jest już tylko landing page. Użytkownicy mogą tworzyć zlecenia transportowe i wolne trasy, zapisywać je i ponownie widzieć w panelu.',
                    nl: 'Met optie C is Shipen niet langer alleen een landingspagina. Gebruikers kunnen transportaanvragen en vrije routes aanmaken, opslaan en terugzien in het dashboard.',
                    fr: 'Avec l’option C, Shipen n’est plus seulement une landing page. Les utilisateurs peuvent créer des demandes de transport et des trajets libres, les enregistrer et les retrouver dans le tableau de bord.',
                  })}
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
                  <Btn onClick={() => { setRole('private'); setPage('dashboard'); }}>{tx({ de: 'Als Privatkunde starten', en: 'Start as private customer', tr: 'Bireysel müşteri olarak başla', pl: 'Zacznij jako klient prywatny', nl: 'Start als particulier', fr: 'Commencer comme particulier' })}</Btn>
                  <Btn secondary onClick={() => { setRole('driver'); setPage('dashboard'); }}>{tx({ de: 'Als Fahrer starten', en: 'Start as driver', tr: 'Sürücü olarak başla', pl: 'Zacznij jako kierowca', nl: 'Start als chauffeur', fr: 'Commencer comme chauffeur' })}</Btn>
                  <Btn secondary onClick={() => { setRole('company'); setPage('dashboard'); }}>{tx({ de: 'Als Firma starten', en: 'Start as company', tr: 'Şirket olarak başla', pl: 'Zacznij jako firma', nl: 'Start als bedrijf', fr: 'Commencer comme entreprise' })}</Btn>
                </div>
              </div>

              <Card>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{tx({ de: 'Was jetzt wirklich funktioniert', en: 'What actually works now', tr: 'Artık gerçekten çalışanlar', pl: 'Co już naprawdę działa', nl: 'Wat nu echt werkt', fr: 'Ce qui fonctionne réellement maintenant' })}</div>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} /><span>{tx({ de: 'Transportanfragen speichern', en: 'Store transport requests', tr: 'Taşıma taleplerini kaydet', pl: 'Zapisuj zlecenia transportowe', nl: 'Transportaanvragen opslaan', fr: 'Enregistrer les demandes de transport' })}</span></div>
                  <div style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} /><span>{tx({ de: 'Freie Routen speichern', en: 'Store free routes', tr: 'Boş rotaları kaydet', pl: 'Zapisuj wolne trasy', nl: 'Vrije routes opslaan', fr: 'Enregistrer les trajets libres' })}</span></div>
                  <div style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} /><span>{tx({ de: 'Dashboard mit echten Einträgen', en: 'Dashboard with real entries', tr: 'Gerçek kayıtlarla panel', pl: 'Panel z prawdziwymi wpisami', nl: 'Dashboard met echte items', fr: 'Tableau de bord avec de vraies entrées' })}</span></div>
                  <div style={{ display: 'flex', gap: 10 }}><CheckCircle2 size={18} /><span>{tx({ de: 'Einfaches Matching zwischen Anfrage und Route', en: 'Simple matching between request and route', tr: 'Talep ve rota arasında basit eşleştirme', pl: 'Proste dopasowanie zlecenia i trasy', nl: 'Eenvoudige matching tussen aanvraag en route', fr: 'Correspondance simple entre demande et trajet' })}</span></div>
                </div>
              </Card>
            </section>

            <section style={{ marginBottom: 44 }}>
              <SectionTitle
                title={tx({ de: 'Produktlogik statt nur Design', en: 'Product logic instead of only design', tr: 'Sadece tasarım değil ürün mantığı', pl: 'Logika produktu zamiast samego designu', nl: 'Productlogica in plaats van alleen design', fr: 'Logique produit au lieu du seul design' })}
                text={tx({ de: 'Genau das ist Option C: Transportdaten werden im Frontend wirklich angelegt und können über Rollen wieder genutzt werden.', en: 'That is exactly Option C: transport data is actually created in the frontend and can be reused across roles.', tr: 'Option C tam olarak budur: taşıma verileri ön yüzde gerçekten oluşturulur ve roller arasında tekrar kullanılabilir.', pl: 'Na tym polega opcja C: dane transportowe są naprawdę tworzone w frontendzie i mogą być ponownie używane przez role.', nl: 'Dat is precies optie C: transportdata wordt echt aangemaakt in de frontend en kan door rollen opnieuw worden gebruikt.', fr: 'C’est exactement cela l’option C : les données de transport sont réellement créées dans le frontend et réutilisables par les rôles.' })}
              />
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 16 }}>
                <StatCard value={String(requests.length)} label={tx({ de: 'Anfragen gespeichert', en: 'Requests stored', tr: 'Kaydedilen talepler', pl: 'Zapisane zlecenia', nl: 'Opgeslagen aanvragen', fr: 'Demandes enregistrées' })} />
                <StatCard value={String(routes.length)} label={tx({ de: 'Routen gespeichert', en: 'Routes stored', tr: 'Kaydedilen rotalar', pl: 'Zapisane trasy', nl: 'Opgeslagen routes', fr: 'Trajets enregistrés' })} />
                <StatCard value={String(matchedRequestCount)} label={tx({ de: 'Anfragen mit Match', en: 'Requests with match', tr: 'Eşleşen talepler', pl: 'Zlecenia z dopasowaniem', nl: 'Aanvragen met match', fr: 'Demandes avec correspondance' })} />
              </div>
            </section>
          </>
        )}

        {page === 'login' && (
          <section style={{ maxWidth: 560, margin: '0 auto' }}>
            <Card>
              <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{tx({ de: 'Login', en: 'Login', tr: 'Giriş', pl: 'Login', nl: 'Login', fr: 'Connexion' })}</div>
              <div style={{ color: '#64748b', marginBottom: 20 }}>{tx({ de: 'Einfacher Demo-Login für die Produktlogik.', en: 'Simple demo login for the product logic.', tr: 'Ürün mantığı için basit demo girişi.', pl: 'Prosty demo-login dla logiki produktu.', nl: 'Eenvoudige demo-login voor de productlogica.', fr: 'Connexion démo simple pour la logique produit.' })}</div>
              <div style={{ display: 'grid', gap: 12 }}>
                <Input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Email" />
                <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder={tx({ de: 'Passwort', en: 'Password', tr: 'Şifre', pl: 'Hasło', nl: 'Wachtwoord', fr: 'Mot de passe' })} />
                <Select value={role} onChange={(e) => setRole(e.target.value as Role)} placeholder={tx({ de: 'Rolle wählen', en: 'Select role', tr: 'Rol seç', pl: 'Wybierz rolę', nl: 'Kies rol', fr: 'Choisir un rôle' })} options={[
                  { value: 'private', label: tx({ de: 'Privatkunde', en: 'Private customer', tr: 'Bireysel müşteri', pl: 'Klient prywatny', nl: 'Particulier', fr: 'Particulier' }) },
                  { value: 'driver', label: tx({ de: 'Fahrer', en: 'Driver', tr: 'Sürücü', pl: 'Kierowca', nl: 'Chauffeur', fr: 'Chauffeur' }) },
                  { value: 'company', label: tx({ de: 'Firma', en: 'Company', tr: 'Şirket', pl: 'Firma', nl: 'Bedrijf', fr: 'Entreprise' }) },
                ]} />
                <Btn onClick={login}>{tx({ de: 'Einloggen', en: 'Log in', tr: 'Giriş yap', pl: 'Zaloguj się', nl: 'Inloggen', fr: 'Se connecter' })}</Btn>
              </div>
            </Card>
          </section>
        )}

        {page === 'register' && (
          <section style={{ maxWidth: 900, margin: '0 auto' }}>
            <SectionTitle
              title={tx({ de: 'Registrieren & loslegen', en: 'Register & get started', tr: 'Kayıt ol ve başla', pl: 'Zarejestruj się i zacznij', nl: 'Registreer en start', fr: 'Inscrivez-vous et commencez' })}
              text={tx({ de: 'Hier legst du dein Konto und direkt deine Rolle im System fest.', en: 'Here you create your account and define your role in the system.', tr: 'Burada hesabını oluşturur ve sistemdeki rolünü belirlerirsin.', pl: 'Tutaj tworzysz konto i od razu ustawiasz rolę w systemie.', nl: 'Hier maak je je account aan en bepaal je direct je rol in het systeem.', fr: 'Ici vous créez votre compte et définissez directement votre rôle dans le système.' })}
            />
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.15fr 0.85fr', gap: 16 }}>
              <Card>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                  <Btn type="button" secondary={role !== 'private'} onClick={() => setRole('private')}>{tx({ de: 'Privatkunde', en: 'Private customer', tr: 'Bireysel müşteri', pl: 'Klient prywatny', nl: 'Particulier', fr: 'Particulier' })}</Btn>
                  <Btn type="button" secondary={role !== 'driver'} onClick={() => setRole('driver')}>{tx({ de: 'Fahrer', en: 'Driver', tr: 'Sürücü', pl: 'Kierowca', nl: 'Chauffeur', fr: 'Chauffeur' })}</Btn>
                  <Btn type="button" secondary={role !== 'company'} onClick={() => setRole('company')}>{tx({ de: 'Firma', en: 'Company', tr: 'Şirket', pl: 'Firma', nl: 'Bedrijf', fr: 'Entreprise' })}</Btn>
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  <Input value={registerName} onChange={(e) => setRegisterName(e.target.value)} placeholder={tx({ de: 'Name', en: 'Name', tr: 'İsim', pl: 'Imię i nazwisko', nl: 'Naam', fr: 'Nom' })} />
                  <Input value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} placeholder="Email" />
                  <Input type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} placeholder={tx({ de: 'Passwort', en: 'Password', tr: 'Şifre', pl: 'Hasło', nl: 'Wachtwoord', fr: 'Mot de passe' })} />
                  <Btn onClick={createAccount}>{tx({ de: 'Konto erstellen', en: 'Create account', tr: 'Hesap oluştur', pl: 'Utwórz konto', nl: 'Account maken', fr: 'Créer un compte' })}</Btn>
                </div>
              </Card>
              <Card dark>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>{tx({ de: 'Nach der Registrierung', en: 'After registration', tr: 'Kayıttan sonra', pl: 'Po rejestracji', nl: 'Na registratie', fr: 'Après l’inscription' })}</div>
                <div style={{ display: 'grid', gap: 10, color: '#cbd5e1', lineHeight: 1.7 }}>
                  <div>1. {tx({ de: 'Ins Dashboard gehen', en: 'Go to dashboard', tr: 'Panele git', pl: 'Przejdź do panelu', nl: 'Ga naar dashboard', fr: 'Aller au tableau de bord' })}</div>
                  <div>2. {tx({ de: 'Anfrage oder Route anlegen', en: 'Create request or route', tr: 'Talep veya rota oluştur', pl: 'Utwórz zlecenie lub trasę', nl: 'Maak aanvraag of route', fr: 'Créer une demande ou un trajet' })}</div>
                  <div>3. {tx({ de: 'Matches im System sehen', en: 'See matches in the system', tr: 'Sistemde eşleşmeleri gör', pl: 'Zobacz dopasowania w systemie', nl: 'Bekijk matches in het systeem', fr: 'Voir les correspondances dans le système' })}</div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {page === 'dashboard' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 34 }}>{tx({ de: 'Dashboard', en: 'Dashboard', tr: 'Panel', pl: 'Panel', nl: 'Dashboard', fr: 'Tableau de bord' })}</h1>
                <div style={{ color: '#64748b', marginTop: 6 }}>{user ? `${user.name} · ${user.email}` : tx({ de: 'Demo-Modus', en: 'Demo mode', tr: 'Demo modu', pl: 'Tryb demo', nl: 'Demomodus', fr: 'Mode démo' })}</div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Btn secondary onClick={() => setRole('private')}>{tx({ de: 'Privat', en: 'Private', tr: 'Bireysel', pl: 'Prywatny', nl: 'Particulier', fr: 'Particulier' })}</Btn>
                <Btn secondary onClick={() => setRole('driver')}>{tx({ de: 'Fahrer', en: 'Driver', tr: 'Sürücü', pl: 'Kierowca', nl: 'Chauffeur', fr: 'Chauffeur' })}</Btn>
                <Btn secondary onClick={() => setRole('company')}>{tx({ de: 'Firma', en: 'Company', tr: 'Şirket', pl: 'Firma', nl: 'Bedrijf', fr: 'Entreprise' })}</Btn>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
              <StatCard value={String(requests.length)} label={tx({ de: 'Alle Anfragen', en: 'All requests', tr: 'Tüm talepler', pl: 'Wszystkie zlecenia', nl: 'Alle aanvragen', fr: 'Toutes les demandes' })} />
              <StatCard value={String(routes.length)} label={tx({ de: 'Alle Routen', en: 'All routes', tr: 'Tüm rotalar', pl: 'Wszystkie trasy', nl: 'Alle routes', fr: 'Tous les trajets' })} />
              <StatCard value={String(matchedRequestCount)} label={tx({ de: 'Mit Match', en: 'With match', tr: 'Eşleşmeli', pl: 'Z dopasowaniem', nl: 'Met match', fr: 'Avec correspondance' })} />
            </div>

            {role === 'private' && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                <Card>
                  <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{tx({ de: 'Neue Transportanfrage', en: 'New transport request', tr: 'Yeni taşıma talebi', pl: 'Nowe zlecenie transportowe', nl: 'Nieuwe transportaanvraag', fr: 'Nouvelle demande de transport' })}</div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                      <Input value={requestForm.from} onChange={(e) => setRequestForm({ ...requestForm, from: e.target.value })} placeholder={tx({ de: 'Von', en: 'From', tr: 'Nereden', pl: 'Skąd', nl: 'Van', fr: 'De' })} />
                      <Input value={requestForm.to} onChange={(e) => setRequestForm({ ...requestForm, to: e.target.value })} placeholder={tx({ de: 'Nach', en: 'To', tr: 'Nereye', pl: 'Dokąd', nl: 'Naar', fr: 'À' })} />
                    </div>
                    <Input value={requestForm.item} onChange={(e) => setRequestForm({ ...requestForm, item: e.target.value })} placeholder={tx({ de: 'Was soll transportiert werden?', en: 'What should be transported?', tr: 'Ne taşınacak?', pl: 'Co należy przewieźć?', nl: 'Wat moet vervoerd worden?', fr: 'Que faut-il transporter ?' })} />
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 12 }}>
                      <Input type="number" value={requestForm.distance} onChange={(e) => setRequestForm({ ...requestForm, distance: e.target.value })} placeholder={tx({ de: 'Distanz km', en: 'Distance km', tr: 'Mesafe km', pl: 'Dystans km', nl: 'Afstand km', fr: 'Distance km' })} />
                      <Select value={requestForm.size} onChange={(e) => setRequestForm({ ...requestForm, size: e.target.value })} placeholder={tx({ de: 'Größe', en: 'Size', tr: 'Boyut', pl: 'Rozmiar', nl: 'Grootte', fr: 'Taille' })} options={[{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }, { value: 'bulky', label: 'Bulky' }]} />
                      <Select value={requestForm.helpers} onChange={(e) => setRequestForm({ ...requestForm, helpers: e.target.value })} placeholder={tx({ de: 'Helfer', en: 'Helpers', tr: 'Yardımcılar', pl: 'Pomocnicy', nl: 'Helpers', fr: 'Aides' })} options={[{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }]} />
                    </div>
                    <Card dark>
                      <div style={{ color: '#FDBA74', fontWeight: 700 }}>{tx({ de: 'Geschätzter Preis', en: 'Estimated price', tr: 'Tahmini fiyat', pl: 'Szacowana cena', nl: 'Geschatte prijs', fr: 'Prix estimé' })}</div>
                      <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>{estimate.low} € – {estimate.high} €</div>
                    </Card>
                    <Btn onClick={submitRequest}>{tx({ de: 'Anfrage speichern', en: 'Save request', tr: 'Talebi kaydet', pl: 'Zapisz zlecenie', nl: 'Aanvraag opslaan', fr: 'Enregistrer la demande' })}</Btn>
                  </div>
                </Card>

                <Card>
                  <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{tx({ de: 'Meine Anfragen', en: 'My requests', tr: 'Taleplerim', pl: 'Moje zlecenia', nl: 'Mijn aanvragen', fr: 'Mes demandes' })}</div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {requests.length === 0 && <div style={{ color: '#64748b' }}>{tx({ de: 'Noch keine Anfragen gespeichert.', en: 'No requests saved yet.', tr: 'Henüz kayıtlı talep yok.', pl: 'Brak zapisanych zleceń.', nl: 'Nog geen aanvragen opgeslagen.', fr: 'Aucune demande enregistrée.' })}</div>}
                    {requests.map((req) => {
                      const matches = getMatchesForRequest(req);
                      return (
                        <Card key={req.id} style={{ padding: 18, background: '#f8fafc', boxShadow: 'none' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontWeight: 700 }}>{req.from} → {req.to}</div>
                              <div style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>{req.item}</div>
                              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <Badge>{formatStatus(matches.length ? 'matched' : req.status, lang)}</Badge>
                                <Badge>{req.estimatedLow}–{req.estimatedHigh} €</Badge>
                              </div>
                            </div>
                            <div style={{ minWidth: 160 }}>
                              <div style={{ fontSize: 13, color: '#64748b' }}>{tx({ de: 'Passende Routen', en: 'Matching routes', tr: 'Uygun rotalar', pl: 'Pasujące trasy', nl: 'Passende routes', fr: 'Trajets correspondants' })}</div>
                              <div style={{ fontWeight: 800, fontSize: 28 }}>{matches.length}</div>
                            </div>
                          </div>
                          {matches.length > 0 && (
                            <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
                              {matches.slice(0, 2).map((match) => (
                                <div key={match.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', background: '#fff', borderRadius: 14, padding: 12, border: '1px solid #e2e8f0' }}>
                                  <div>
                                    <div style={{ fontWeight: 700 }}>{match.providerName}</div>
                                    <div style={{ color: '#64748b', fontSize: 14 }}>{match.from} → {match.to}</div>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700 }}>{match.price}</div>
                                    <div style={{ color: '#64748b', fontSize: 12 }}>{match.vehicleType}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {(role === 'driver' || role === 'company') && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                <Card>
                  <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{tx({ de: 'Neue freie Route', en: 'New free route', tr: 'Yeni boş rota', pl: 'Nowa wolna trasa', nl: 'Nieuwe vrije route', fr: 'Nouveau trajet libre' })}</div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                      <Input value={routeForm.from} onChange={(e) => setRouteForm({ ...routeForm, from: e.target.value })} placeholder={tx({ de: 'Von', en: 'From', tr: 'Nereden', pl: 'Skąd', nl: 'Van', fr: 'De' })} />
                      <Input value={routeForm.to} onChange={(e) => setRouteForm({ ...routeForm, to: e.target.value })} placeholder={tx({ de: 'Nach', en: 'To', tr: 'Nereye', pl: 'Dokąd', nl: 'Naar', fr: 'À' })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 12 }}>
                      <Input value={routeForm.vehicleType} onChange={(e) => setRouteForm({ ...routeForm, vehicleType: e.target.value })} placeholder={tx({ de: 'Fahrzeugtyp', en: 'Vehicle type', tr: 'Araç tipi', pl: 'Typ pojazdu', nl: 'Voertuigtype', fr: 'Type de véhicule' })} />
                      <Input value={routeForm.capacity} onChange={(e) => setRouteForm({ ...routeForm, capacity: e.target.value })} placeholder={tx({ de: 'Freie Kapazität', en: 'Free capacity', tr: 'Boş kapasite', pl: 'Wolna pojemność', nl: 'Vrije capaciteit', fr: 'Capacité libre' })} />
                      <Input value={routeForm.price} onChange={(e) => setRouteForm({ ...routeForm, price: e.target.value })} placeholder={tx({ de: 'Preis / ab', en: 'Price / from', tr: 'Fiyat / başlangıç', pl: 'Cena / od', nl: 'Prijs / vanaf', fr: 'Prix / à partir de' })} />
                    </div>
                    <Btn onClick={submitRoute}>{tx({ de: 'Route speichern', en: 'Save route', tr: 'Rotayı kaydet', pl: 'Zapisz trasę', nl: 'Route opslaan', fr: 'Enregistrer le trajet' })}</Btn>
                  </div>
                </Card>

                <Card>
                  <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{tx({ de: 'Passende offene Anfragen', en: 'Matching open requests', tr: 'Uygun açık talepler', pl: 'Pasujące otwarte zlecenia', nl: 'Passende open aanvragen', fr: 'Demandes ouvertes correspondantes' })}</div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {relevantOpenRequests.length === 0 && <div style={{ color: '#64748b' }}>{tx({ de: 'Noch keine passenden Anfragen vorhanden.', en: 'No matching requests yet.', tr: 'Henüz uygun talep yok.', pl: 'Brak pasujących zleceń.', nl: 'Nog geen passende aanvragen.', fr: 'Aucune demande correspondante pour le moment.' })}</div>}
                    {relevantOpenRequests.map((req) => (
                      <div key={req.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 18, padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{req.from} → {req.to}</div>
                            <div style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>{req.item}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700 }}>{req.estimatedLow}–{req.estimatedHigh} €</div>
                            <div style={{ color: '#64748b', fontSize: 12 }}>{formatStatus(req.status, lang)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </section>
        )}
      </main>

      <footer style={{ width: '100vw', marginTop: 60, marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)', padding: '70px 0 40px', background: '#000000', color: '#ffffff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr 1fr 1fr', gap: 20 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Shipen</div>
            <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 10 }}>{tx({ de: 'Jetzt mit echter Produktlogik im Frontend.', en: 'Now with real product logic in the frontend.', tr: 'Artık ön yüzde gerçek ürün mantığı ile.', pl: 'Teraz z prawdziwą logiką produktu w frontendzie.', nl: 'Nu met echte productlogica in de frontend.', fr: 'Maintenant avec une vraie logique produit dans le frontend.' })}</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>{tx({ de: 'Kernfunktionen', en: 'Core features', tr: 'Temel özellikler', pl: 'Funkcje główne', nl: 'Kernfuncties', fr: 'Fonctions clés' })}</div>
            <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
              <span>{tx({ de: 'Anfragen anlegen', en: 'Create requests', tr: 'Talep oluştur', pl: 'Twórz zlecenia', nl: 'Aanvragen maken', fr: 'Créer des demandes' })}</span>
              <span>{tx({ de: 'Routen anlegen', en: 'Create routes', tr: 'Rota oluştur', pl: 'Twórz trasy', nl: 'Routes maken', fr: 'Créer des trajets' })}</span>
              <span>{tx({ de: 'Matches sehen', en: 'See matches', tr: 'Eşleşmeleri gör', pl: 'Zobacz dopasowania', nl: 'Matches bekijken', fr: 'Voir les correspondances' })}</span>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>{tx({ de: 'Rollen', en: 'Roles', tr: 'Roller', pl: 'Role', nl: 'Rollen', fr: 'Rôles' })}</div>
            <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
              <span>{tx({ de: 'Privatkunde', en: 'Private customer', tr: 'Bireysel müşteri', pl: 'Klient prywatny', nl: 'Particulier', fr: 'Particulier' })}</span>
              <span>{tx({ de: 'Fahrer', en: 'Driver', tr: 'Sürücü', pl: 'Kierowca', nl: 'Chauffeur', fr: 'Chauffeur' })}</span>
              <span>{tx({ de: 'Firma', en: 'Company', tr: 'Şirket', pl: 'Firma', nl: 'Bedrijf', fr: 'Entreprise' })}</span>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>{tx({ de: 'Nächster Schritt', en: 'Next step', tr: 'Sonraki adım', pl: 'Następny krok', nl: 'Volgende stap', fr: 'Étape suivante' })}</div>
            <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
              <span>{tx({ de: 'Supabase verbinden', en: 'Connect Supabase', tr: 'Supabase bağla', pl: 'Połącz Supabase', nl: 'Supabase koppelen', fr: 'Connecter Supabase' })}</span>
              <span>{tx({ de: 'Echte Nutzer speichern', en: 'Store real users', tr: 'Gerçek kullanıcıları kaydet', pl: 'Zapisz prawdziwych użytkowników', nl: 'Echte gebruikers opslaan', fr: 'Enregistrer de vrais utilisateurs' })}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
