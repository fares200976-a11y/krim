import React, { useState } from 'react';
import { 
  Lock, Calendar, Sparkles, FolderHeart, Users, HeartHandshake, 
  Trash2, Plus, Edit, Check, X, FileAudio, Image as ImageIcon, 
  Search, BarChart3, ArrowUpRight, DollarSign, PlusCircle, LogOut, Download
} from 'lucide-react';
import { motion } from 'motion/react';
import { Dress, Booking, TeamMember, Testimonial, AppSettings, Category } from '../types';

interface AdminPanelProps {
  dresses: Dress[];
  setDresses: React.Dispatch<React.SetStateAction<Dress[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  team: TeamMember[];
  setTeam: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  testimonials: Testimonial[];
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onClose: () => void;
}

export default function AdminPanel({
  dresses, setDresses,
  bookings, setBookings,
  team, setTeam,
  testimonials, setTestimonials,
  settings, setSettings,
  onClose
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Navigation tabs: 'bookings' | 'dresses' | 'settings' | 'team_testimonials'
  const [activeTab, setActiveTab] = useState<'bookings' | 'dresses' | 'settings' | 'team_testimonials'>('bookings');

  // Search and Filter states
  const [bookingSearch, setBookingSearch] = useState('');
  const [dressSearch, setDressSearch] = useState('');

  // Modal forms states
  const [isDressModalOpen, setIsDressModalOpen] = useState(false);
  const [editingDress, setEditingDress] = useState<Dress | null>(null);

  // Dress Form States
  const [dressName, setDressName] = useState('');
  const [dressCategory, setDressCategory] = useState<Category>('Robes de mariée');
  const [dressDesc, setDressDesc] = useState('');
  const [dressPrice, setDressPrice] = useState(15000);
  const [dressDeposit, setDressDeposit] = useState(5000);
  const [dressSizes, setDressSizes] = useState<string[]>(['38', '40']);
  const [dressImages, setDressImages] = useState<string>('');
  const [dressVideo, setDressVideo] = useState('');
  const [dressAvailable, setDressAvailable] = useState(true);

  // Team & Testimonials Modal States
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamMember | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamRole, setTeamRole] = useState('');
  const [teamPhoto, setTeamPhoto] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [teamEmailAlarm, setTeamEmailAlarm] = useState('');

  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [testName, setTestName] = useState('');
  const [testRating, setTestRating] = useState(5);
  const [testComment, setTestComment] = useState('');
  const [testCategory, setTestCategory] = useState('Robes kabyles');

  // App Settings States
  const [settingsBg, setSettingsBg] = useState(settings.homepageBg);
  const [settingsMusicUrl, setSettingsMusicUrl] = useState(settings.backgroundMusicUrl);
  const [settingsMusicTitle, setSettingsMusicTitle] = useState(settings.musicTitle);
  const [settingsUsername, setSettingsUsername] = useState(settings.adminUsername || 'karim2026');
  const [settingsPassword, setSettingsPassword] = useState(settings.adminPasswordHash || 'karim123456');
  const [settingsNotifyEmail, setSettingsNotifyEmail] = useState(settings.notificationEmail || 'karimchabni395@gmail.com');
  const [settingsNotifyWhatsapp, setSettingsNotifyWhatsapp] = useState(settings.notificationWhatsapp || '00213553318195');

  // Authentication logic
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedUser = settings.adminUsername || 'karim2026';
    const expectedPass = settings.adminPasswordHash || 'karim123456';
    
    if (usernameInput.trim().toLowerCase() === expectedUser.toLowerCase() && passwordInput === expectedPass) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError("Nom d'utilisateur ou mot de passe incorrect.");
    }
  };

  // Stats computation
  const totalBookingsCount = bookings.length;
  const confirmedBookingsCount = bookings.filter(b => b.status === 'confirmed').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.depositAmount, 0);

  // Handle Booking Status Updates
  const updateBookingStatus = (id: string, newStatus: 'confirmed' | 'cancelled') => {
    const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
    setBookings(updated);
    localStorage.setItem('boutique_bookings', JSON.stringify(updated));
  };

  const deleteBooking = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette réservation de la base de données ?')) {
      const updated = bookings.filter(b => b.id !== id);
      setBookings(updated);
      localStorage.setItem('boutique_bookings', JSON.stringify(updated));
    }
  };

  // Dress logic
  const openAddDress = () => {
    setEditingDress(null);
    setDressName('');
    setDressCategory('Robes de mariée');
    setDressDesc('');
    setDressPrice(20000);
    setDressDeposit(6000);
    setDressSizes(['36', '38', '40']);
    setDressImages('');
    setDressVideo('');
    setDressAvailable(true);
    setIsDressModalOpen(true);
  };

  const openEditDress = (dress: Dress) => {
    setEditingDress(dress);
    setDressName(dress.name);
    setDressCategory(dress.category);
    setDressDesc(dress.description);
    setDressPrice(dress.pricePerDay);
    setDressDeposit(dress.depositAmount);
    setDressSizes(dress.sizes);
    setDressImages(dress.images.join(', '));
    setDressVideo(dress.videoUrl || '');
    setDressAvailable(dress.available);
    setIsDressModalOpen(true);
  };

  const handleDressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedImages = dressImages
      .split(',')
      .map(img => img.trim())
      .filter(img => img.length > 0);

    const fallbackImage = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80';
    const finalImages = parsedImages.length > 0 ? parsedImages : [fallbackImage];

    if (editingDress) {
      // Modify
      const updated = dresses.map(d => d.id === editingDress.id ? {
        ...d,
        name: dressName,
        category: dressCategory,
        description: dressDesc,
        pricePerDay: Number(dressPrice),
        depositAmount: Number(dressDeposit),
        sizes: dressSizes,
        images: finalImages,
        videoUrl: dressVideo || undefined,
        available: dressAvailable
      } : d);
      setDresses(updated);
      localStorage.setItem('boutique_dresses', JSON.stringify(updated));
    } else {
      // Add
      const newDress: Dress = {
        id: 'dress-' + Date.now(),
        name: dressName,
        category: dressCategory,
        description: dressDesc,
        pricePerDay: Number(dressPrice),
        depositAmount: Number(dressDeposit),
        sizes: dressSizes,
        images: finalImages,
        videoUrl: dressVideo || undefined,
        available: dressAvailable
      };
      const updated = [newDress, ...dresses];
      setDresses(updated);
      localStorage.setItem('boutique_dresses', JSON.stringify(updated));
    }
    setIsDressModalOpen(false);
  };

  const deleteDress = (id: string) => {
    if (window.confirm('Voulez-vous supprimer cette robe définitivement ?')) {
      const updated = dresses.filter(d => d.id !== id);
      setDresses(updated);
      localStorage.setItem('boutique_dresses', JSON.stringify(updated));
    }
  };

  // Team Member Logic
  const openAddTeam = () => {
    setEditingTeam(null);
    setTeamName('');
    setTeamRole('');
    setTeamPhoto('');
    setTeamDesc('');
    setTeamEmailAlarm('');
    setIsTeamModalOpen(true);
  };

  const openEditTeam = (m: TeamMember) => {
    setEditingTeam(m);
    setTeamName(m.name);
    setTeamRole(m.role);
    setTeamPhoto(m.photo);
    setTeamDesc(m.description);
    setTeamEmailAlarm(m.emailAlarm || '');
    setIsTeamModalOpen(true);
  };

  const handleTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fallbackPhoto = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
    const photoUrl = teamPhoto.trim() || fallbackPhoto;

    if (editingTeam) {
      const updated = team.map(t => t.id === editingTeam.id ? {
        ...t,
        name: teamName,
        role: teamRole,
        photo: photoUrl,
        description: teamDesc,
        emailAlarm: teamEmailAlarm
      } : t);
      setTeam(updated);
      localStorage.setItem('boutique_team', JSON.stringify(updated));
    } else {
      const newMember: TeamMember = {
        id: 'team-' + Date.now(),
        name: teamName,
        role: teamRole,
        photo: photoUrl,
        description: teamDesc,
        emailAlarm: teamEmailAlarm
      };
      const updated = [...team, newMember];
      setTeam(updated);
      localStorage.setItem('boutique_team', JSON.stringify(updated));
    }
    setIsTeamModalOpen(false);
  };

  const deleteTeam = (id: string) => {
    if (window.confirm('Retirer ce membre de l\'équipe ?')) {
      const updated = team.filter(t => t.id !== id);
      setTeam(updated);
      localStorage.setItem('boutique_team', JSON.stringify(updated));
    }
  };

  // Testimonial Logic
  const openAddTestimonial = () => {
    setEditingTestimonial(null);
    setTestName('');
    setTestRating(5);
    setTestComment('');
    setTestCategory('Robes de mariée');
    setIsTestimonialModalOpen(true);
  };

  const openEditTestimonial = (test: Testimonial) => {
    setEditingTestimonial(test);
    setTestName(test.name);
    setTestRating(test.rating);
    setTestComment(test.comment);
    setTestCategory(test.dressCategory || 'Robes de mariée');
    setIsTestimonialModalOpen(true);
  };

  const handleTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    if (editingTestimonial) {
      const updated = testimonials.map(t => t.id === editingTestimonial.id ? {
        ...t,
        name: testName,
        rating: Number(testRating),
        comment: testComment,
        dressCategory: testCategory,
        date: t.date // Keep original date
      } : t);
      setTestimonials(updated);
      localStorage.setItem('boutique_testimonials', JSON.stringify(updated));
    } else {
      const newTest: Testimonial = {
        id: 'test-' + Date.now(),
        name: testName,
        rating: Number(testRating),
        comment: testComment,
        dressCategory: testCategory,
        date: dateStr
      };
      const updated = [newTest, ...testimonials];
      setTestimonials(updated);
      localStorage.setItem('boutique_testimonials', JSON.stringify(updated));
    }
    setIsTestimonialModalOpen(false);
  };

  const deleteTestimonial = (id: string) => {
    if (window.confirm('Supprimer ce témoignage ?')) {
      const updated = testimonials.filter(t => t.id !== id);
      setTestimonials(updated);
      localStorage.setItem('boutique_testimonials', JSON.stringify(updated));
    }
  };

  // Save App Settings
  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      ...settings,
      homepageBg: settingsBg,
      backgroundMusicUrl: settingsMusicUrl,
      musicTitle: settingsMusicTitle,
      adminUsername: settingsUsername,
      adminPasswordHash: settingsPassword,
      notificationEmail: settingsNotifyEmail,
      notificationWhatsapp: settingsNotifyWhatsapp
    };
    setSettings(updated);
    localStorage.setItem('boutique_settings', JSON.stringify(updated));
    alert('Paramètres enregistrés avec succès ! Le site et les alarmes ont été mis à jour.');
  };

  const toggleSizeSelection = (size: string) => {
    if (dressSizes.includes(size)) {
      setDressSizes(dressSizes.filter(s => s !== size));
    } else {
      setDressSizes([...dressSizes, size]);
    }
  };

  // Export Bookings to CSV (fully compatible with Microsoft Excel)
  const exportBookingsToCSV = (exportAll: boolean = false) => {
    const listToExport = exportAll ? bookings : filteredBookings;
    
    if (listToExport.length === 0) {
      alert("Il n'y a aucune réservation à exporter.");
      return;
    }

    // UTF-8 BOM to prevent Excel encoding issues with accents
    let csvContent = "\ufeff";
    
    // Headers
    const headers = [
      "ID Réservation",
      "Nom du Client",
      "Téléphone",
      "Adresse E-mail",
      "Tenue / Robe",
      "Date de Location",
      "Date d'Essai (Test)",
      "Taille",
      "Acompte requis (DZD)",
      "Statut de Paiement",
      "Statut Réservation",
      "Notes / Remarques"
    ];
    
    // Use semicolon as separator for French system Excel compatibility
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(";") + "\n";
    
    // Rows
    listToExport.forEach(b => {
      const formattedDate = new Date(b.date).toLocaleDateString('fr-FR');
      const formattedFittingDate = b.fittingDate ? new Date(b.fittingDate).toLocaleDateString('fr-FR') : "Aucun";
      const paymentStatus = b.depositPaid ? "Payé" : "Non payé";
      const reservationStatus = b.status === 'confirmed' ? 'Confirmé' : b.status === 'cancelled' ? 'Annulé' : 'En attente';
      
      const row = [
        b.id,
        b.customerName,
        b.customerPhone,
        b.customerEmail,
        b.dressName,
        formattedDate,
        formattedFittingDate,
        b.size,
        b.depositAmount,
        paymentStatus,
        reservationStatus,
        b.notes || ""
      ];
      
      csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";") + "\n";
    });
    
    // Create download trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const filePrefix = exportAll ? "toutes_les_reservations" : "selection_reservations";
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `${filePrefix}_coup_de_coeur_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Bookings & Dresses based on Search
  const filteredBookings = bookings.filter(b => 
    b.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.dressName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.customerPhone.includes(bookingSearch)
  );

  const filteredDresses = dresses.filter(d =>
    d.name.toLowerCase().includes(dressSearch.toLowerCase()) ||
    d.category.toLowerCase().includes(dressSearch.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div id="admin-login-screen" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/75 backdrop-blur-md p-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-none overflow-hidden border border-bento-gold/25 shadow-2xl p-8"
        >
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="w-14 h-14 rounded-none bg-bento-rose border border-bento-gold/20 flex items-center justify-center text-bento-gold shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-serif font-light text-bento-text uppercase tracking-wide">
              Portail Couture Admin
            </h2>
            <p className="text-xs text-bento-text/60 max-w-xs font-sans">
              Veuillez saisir vos identifiants administrateur pour accéder à la gestion de la boutique.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-bento-text/50 font-bold mb-1.5 font-sans">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Nom d'utilisateur"
                className="w-full text-xs px-4 py-3.5 border border-bento-gold/20 bg-bento-rose/10 rounded-none focus:outline-none focus:border-bento-gold transition-colors font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-bento-text/50 font-bold mb-1.5 font-sans">
                Mot de passe de sécurité
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Mot de passe"
                className="w-full text-xs px-4 py-3.5 border border-bento-gold/20 bg-bento-rose/10 rounded-none focus:outline-none focus:border-bento-gold transition-colors font-sans"
              />
              <span className="text-[10px] text-bento-text/50 mt-1.5 block font-sans text-center">
                Identifiants par défaut : <strong className="text-bento-gold font-bold">karim2026</strong> / <strong className="text-bento-gold font-bold">karim123456</strong>
              </span>
            </div>

            {loginError && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-none font-sans text-center">
                {loginError}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-bento-rose border border-bento-gold/15 text-bento-text hover:bg-white uppercase tracking-widest text-[10px] py-3.5 rounded-none font-bold font-sans transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 bg-bento-gold hover:bg-bento-gold-dark text-white uppercase tracking-widest text-[10px] py-3.5 rounded-none font-bold font-sans transition-all cursor-pointer shadow-sm"
              >
                Déverrouiller
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-full" className="fixed inset-0 z-50 bg-[#FAF7F5] text-bento-text flex flex-col md:flex-row h-screen overflow-hidden font-sans">
      {/* Sidebar navigation */}
      <div className="w-full md:w-64 bg-bento-dark text-white flex flex-col border-r border-bento-gold/15 shrink-0">
        <div className="p-6 border-b border-bento-gold/15 flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-bento-gold flex items-center justify-center font-serif text-white font-bold">
            C
          </div>
          <div>
            <h3 className="font-serif font-light text-xs tracking-wider uppercase">Coup de Cœur</h3>
            <p className="text-[9px] text-bento-gold/75 uppercase tracking-[0.2em] font-sans font-bold">Administration</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full text-left px-4 py-3 rounded-none text-[10px] font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === 'bookings' ? 'bg-bento-gold text-white' : 'text-white/60 hover:bg-bento-gold/15 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Réservations
          </button>

          <button
            onClick={() => setActiveTab('dresses')}
            className={`w-full text-left px-4 py-3 rounded-none text-[10px] font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === 'dresses' ? 'bg-bento-gold text-white' : 'text-white/60 hover:bg-bento-gold/15 hover:text-white'
            }`}
          >
            <FolderHeart className="w-3.5 h-3.5" />
            Gestion des Tenues
          </button>

          <button
            onClick={() => setActiveTab('team_testimonials')}
            className={`w-full text-left px-4 py-3 rounded-none text-[10px] font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === 'team_testimonials' ? 'bg-bento-gold text-white' : 'text-white/60 hover:bg-bento-gold/15 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Équipe & Témoignages
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-3 rounded-none text-[10px] font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === 'settings' ? 'bg-bento-gold text-white' : 'text-white/60 hover:bg-bento-gold/15 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Personnalisation
          </button>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-bento-gold/15 space-y-2">
          <button
            onClick={() => setIsAuthenticated(false)}
            className="w-full text-left px-4 py-2.5 rounded-none text-[9px] uppercase tracking-widest font-sans font-bold text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Déconnexion Admin
          </button>
          <button
            onClick={onClose}
            className="w-full text-center py-2.5 bg-bento-rose hover:bg-bento-gold text-bento-text hover:text-white rounded-none text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer border border-bento-gold/20"
          >
            Retour au Site
          </button>
        </div>
      </div>

      {/* Main Panel Content container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top bar with quick stats */}
        <header className="bg-white border-b border-bento-gold/15 px-8 py-4 shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-serif font-light text-bento-text uppercase tracking-wider">
              {activeTab === 'bookings' && 'Réservations & Calendrier'}
              {activeTab === 'dresses' && 'Collections Haute Couture'}
              {activeTab === 'team_testimonials' && 'Équipe & Témoignages Clients'}
              {activeTab === 'settings' && 'Personnalisation Thème & Musique'}
            </h1>
            <p className="text-[10px] text-bento-text/40 font-sans uppercase tracking-widest">Suivi en direct de votre établissement à Tizi Ouzou</p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-bento-rose border border-bento-gold/20 px-4 py-2 rounded-none flex items-center gap-2.5 text-[10px] font-sans">
              <div className="p-1.5 rounded-none bg-white text-bento-gold border border-bento-gold/15">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-bento-text/50 font-bold uppercase tracking-wider">Réservations</p>
                <p className="font-bold text-bento-text">{totalBookingsCount} ({confirmedBookingsCount} confirmées)</p>
              </div>
            </div>
            <div className="bg-bento-rose border border-bento-gold/20 px-4 py-2 rounded-none flex items-center gap-2.5 text-[10px] font-sans">
              <div className="p-1.5 rounded-none bg-white text-emerald-600 border border-emerald-200/50">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-bento-text/50 font-bold uppercase tracking-wider">Acomptes Perçus</p>
                <p className="font-bold text-emerald-700">{totalRevenue.toLocaleString()} DZD</p>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Viewport */}
        <main className="flex-1 p-8 overflow-y-auto">
          
          {/* TAB 1: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                <Search className="w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom de client, par téléphone ou par robe..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="flex-1 text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-zinc-700"
                />
              </div>

              {/* Bookings table list */}
              <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-serif font-semibold text-zinc-800">Registre des Réservations</h3>
                    <p className="text-[11px] text-zinc-400 font-sans mt-0.5">Visualisez et exportez vos données de commande</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => exportBookingsToCSV(false)}
                      className="px-3.5 py-2 border border-zinc-200 hover:border-bento-gold text-zinc-700 hover:text-bento-gold text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer bg-white shadow-xs"
                      title="Exporter uniquement les réservations filtrées par votre recherche"
                    >
                      <Download className="w-3.5 h-3.5 text-bento-gold" />
                      <span>Exporter la sélection ({filteredBookings.length})</span>
                    </button>
                    
                    <button
                      onClick={() => exportBookingsToCSV(true)}
                      className="px-3.5 py-2 bg-bento-rose border border-bento-gold/25 text-bento-text hover:bg-bento-gold hover:text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                      title="Exporter toutes les réservations de la boutique"
                    >
                      <Download className="w-3.5 h-3.5 animate-pulse" />
                      <span>Tout Exporter ({bookings.length})</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {filteredBookings.length === 0 ? (
                    <div className="py-12 text-center text-zinc-400 space-y-2">
                      <Calendar className="w-8 h-8 mx-auto text-zinc-300" />
                      <p className="text-sm">Aucune réservation ne correspond à vos critères.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 text-zinc-400 text-xs font-semibold uppercase tracking-wider border-b border-zinc-100">
                          <th className="p-4 pl-6">Client</th>
                          <th className="p-4">Robe / Tenue</th>
                          <th className="p-4">Date de Location</th>
                          <th className="p-4">Taille</th>
                          <th className="p-4">Acompte Payé</th>
                          <th className="p-4">Statut</th>
                          <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-sm">
                        {filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                            <td className="p-4 pl-6">
                              <div className="font-medium text-zinc-800">{b.customerName}</div>
                              <div className="text-xs text-zinc-400">{b.customerPhone} | {b.customerEmail}</div>
                              {b.notes && (
                                <div className="text-[11px] text-gold-600 bg-gold-50/50 p-1 px-2 rounded mt-1 italic inline-block">
                                  Note: {b.notes}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2.5">
                                <img src={b.dressImage} alt={b.dressName} className="w-8 h-8 rounded-lg object-cover" />
                                <span className="font-medium text-zinc-700">{b.dressName}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-mono font-medium text-zinc-600">
                                {new Date(b.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>
                              {b.fittingDate && (
                                <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100/50 p-1 px-2 mt-1 rounded inline-block font-sans font-semibold">
                                  👗 Essai: {new Date(b.fittingDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="bg-zinc-100 text-zinc-800 font-bold text-xs px-2 py-0.5 rounded border border-zinc-200">
                                {b.size}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-emerald-600 font-bold">{b.depositAmount.toLocaleString()} DZD</span>
                              <span className="text-[10px] text-zinc-400 block font-sans">{b.depositPaid ? "En ligne (Payé)" : "Non payé"}</span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                b.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                'bg-amber-50 text-amber-600 border border-amber-100'
                              }`}>
                                {b.status === 'confirmed' ? 'Confirmé' : b.status === 'cancelled' ? 'Annulé' : 'En attente'}
                              </span>
                            </td>
                            <td className="p-4 pr-6 text-right space-x-1.5 whitespace-nowrap">
                              {b.status === 'pending' && (
                                <button
                                  onClick={() => updateBookingStatus(b.id, 'confirmed')}
                                  className="p-1 text-emerald-500 hover:bg-emerald-50 rounded border border-emerald-200 transition-colors cursor-pointer"
                                  title="Confirmer la réservation"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {b.status !== 'cancelled' && (
                                <button
                                  onClick={() => updateBookingStatus(b.id, 'cancelled')}
                                  className="p-1 text-rose-500 hover:bg-rose-50 rounded border border-rose-200 transition-colors cursor-pointer"
                                  title="Annuler la réservation"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteBooking(b.id)}
                                className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 rounded transition-colors cursor-pointer"
                                title="Supprimer définitivement"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DRESS CATALOG */}
          {activeTab === 'dresses' && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-zinc-100 shadow-sm w-full sm:max-w-md">
                  <Search className="w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une robe par son nom..."
                    value={dressSearch}
                    onChange={(e) => setDressSearch(e.target.value)}
                    className="flex-1 text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-zinc-700"
                  />
                </div>

                <button
                  onClick={openAddDress}
                  className="bg-gold-gradient text-white px-5 py-2.5 rounded-xl font-serif text-sm font-semibold flex items-center gap-2 hover:opacity-90 shadow-sm cursor-pointer whitespace-nowrap w-full sm:w-auto justify-center"
                >
                  <PlusCircle className="w-4 h-4" />
                  Ajouter une Tenue
                </button>
              </div>

              {/* Grid of Dresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDresses.map((d) => (
                  <div key={d.id} className="bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm flex flex-col hover:shadow-md transition-shadow relative">
                    {/* Badge availability */}
                    <span className={`absolute top-3 left-3 z-10 px-2 py-0.5 rounded text-[10px] font-bold ${
                      d.available ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}>
                      {d.available ? 'Disponible' : 'Indisponible'}
                    </span>

                    {/* Dress Image */}
                    <div className="h-48 relative overflow-hidden bg-zinc-100">
                      <img src={d.images[0]} alt={d.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-zinc-900/70 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded">
                        {d.category}
                      </div>
                    </div>

                    {/* Dress details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-serif font-bold text-zinc-800 line-clamp-1">{d.name}</h4>
                        <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{d.description}</p>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-zinc-100 text-xs">
                        <div className="flex justify-between text-zinc-500">
                          <span>Location / Jour:</span>
                          <span className="font-bold text-zinc-800">{d.pricePerDay.toLocaleString()} DZD</span>
                        </div>
                        <div className="flex justify-between text-gold-600">
                          <span>Acompte requis:</span>
                          <span className="font-bold">{d.depositAmount.toLocaleString()} DZD</span>
                        </div>
                        <div className="flex justify-between text-zinc-500 pt-1">
                          <span>Tailles:</span>
                          <span className="font-medium bg-zinc-100 px-1.5 rounded">{d.sizes.join(', ')}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t border-zinc-100/50">
                        <button
                          onClick={() => openEditDress(d)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 text-zinc-700 hover:bg-zinc-50 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" /> Modifier
                        </button>
                        <button
                          onClick={() => deleteDress(d.id)}
                          className="p-1.5 rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                          title="Supprimer la tenue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PERSONALIZATION & BACKGROUNDS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
              <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-500" />
                <h3 className="font-serif font-bold text-zinc-800 text-lg">Personnaliser le Site</h3>
              </div>

              <form onSubmit={handleSettingsSubmit} className="space-y-5">
                {/* Homepage background */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 font-bold mb-1.5">
                    Image ou Vidéo de Fond (Page d'accueil) - URL ou Téléversement
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={settingsBg}
                      onChange={(e) => setSettingsBg(e.target.value)}
                      className="flex-1 text-sm px-3.5 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:border-gold-300 transition-colors"
                      placeholder="https://images.unsplash.com/..."
                    />
                    <label className="bg-zinc-800 hover:bg-zinc-900 text-white px-3.5 py-2.5 text-xs font-bold flex items-center justify-center cursor-pointer select-none rounded-lg shrink-0">
                      Téléverser
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setSettingsBg(event.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <div className="w-10 h-10 border border-zinc-200 rounded-lg overflow-hidden shrink-0 bg-zinc-100 flex items-center justify-center">
                      {settingsBg.startsWith('data:video/') || settingsBg.includes('.mp4') ? (
                        <span className="text-[9px] font-bold text-zinc-500">Vidéo</span>
                      ) : (
                        <img src={settingsBg} alt="Preview bg" className="w-full h-full object-cover" />
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Copiez/collez une URL d'image/vidéo, ou téléversez un fichier local (image ou vidéo).
                  </span>
                </div>

                {/* Ambient music URL */}
                <div className="space-y-4 pt-4 border-t border-zinc-100">
                  <div className="flex items-center gap-2 text-gold-600">
                    <FileAudio className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-widest font-bold">Musique d'Ambiance de Fond</span>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 font-bold mb-1.5">
                      Titre de la Musique
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsMusicTitle}
                      onChange={(e) => setSettingsMusicTitle(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:border-gold-300 transition-colors"
                      placeholder="Serenade Romantique d'Amour (Instrumental)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 font-bold mb-1.5">
                      Lien direct du fichier audio (MP3, WAV) ou Téléversement
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={settingsMusicUrl}
                        onChange={(e) => setSettingsMusicUrl(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:border-gold-300 transition-colors font-mono text-xs"
                        placeholder="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
                      />
                      <label className="bg-zinc-800 hover:bg-zinc-900 text-white px-3.5 py-2.5 text-xs font-bold flex items-center justify-center cursor-pointer select-none rounded-lg shrink-0">
                        Téléverser MP3
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setSettingsMusicUrl(event.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <span className="text-[11px] text-zinc-400 mt-1 block">
                      Saisissez une URL de fichier audio ou téléversez directement un fichier audio MP3 local.
                    </span>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="space-y-4 pt-4 border-t border-zinc-100">
                  <div className="flex items-center gap-2 text-gold-600">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-widest font-bold">Alarmes de Réservations</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-500 font-bold mb-1.5">
                        Adresse E-mail d'Alarme
                      </label>
                      <input
                        type="email"
                        required
                        value={settingsNotifyEmail}
                        onChange={(e) => setSettingsNotifyEmail(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:border-gold-300 transition-colors font-mono"
                        placeholder="karimchabni395@gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-500 font-bold mb-1.5">
                        Numéro WhatsApp d'Alarme
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsNotifyWhatsapp}
                        onChange={(e) => setSettingsNotifyWhatsapp(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:border-gold-300 transition-colors font-mono"
                        placeholder="00213553318195"
                      />
                    </div>
                  </div>
                </div>

                {/* Admin credentials change */}
                <div className="space-y-4 pt-4 border-t border-zinc-100 font-sans">
                  <div className="flex items-center gap-2 text-gold-600">
                    <Lock className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-widest font-bold">Sécurité d'Administration</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-500 font-bold mb-1.5">
                        Nom d'utilisateur administrateur
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsUsername}
                        onChange={(e) => setSettingsUsername(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:border-gold-300 transition-colors"
                        placeholder="karim"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-500 font-bold mb-1.5">
                        Nouveau mot de passe de sécurité
                      </label>
                      <input
                        type="password"
                        required
                        value={settingsPassword}
                        onChange={(e) => setSettingsPassword(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:border-gold-300 transition-colors"
                        placeholder="karim2026"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-gold-gradient text-white font-serif py-3 rounded-xl hover:opacity-90 transition-all shadow-md cursor-pointer font-medium"
                >
                  Enregistrer les configurations générales & alarmes
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: TEAM & TESTIMONIALS */}
          {activeTab === 'team_testimonials' && (
            <div className="space-y-10">
              {/* SECTION 4A: TEAM */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gold-500" />
                    <h3 className="font-serif font-bold text-zinc-800 text-lg">Notre Équipe</h3>
                  </div>
                  <button
                    onClick={openAddTeam}
                    className="text-xs bg-gold-50 text-gold-600 hover:bg-gold-100 px-3 py-1.5 rounded-lg border border-gold-200 font-semibold cursor-pointer"
                  >
                    Ajouter un collaborateur
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {team.map((m) => (
                    <div key={m.id} className="border border-zinc-100 rounded-xl p-4 flex gap-4 items-start bg-zinc-50/50">
                      <img src={m.photo} alt={m.name} className="w-16 h-16 rounded-full object-cover border border-zinc-200 shrink-0" />
                      <div className="space-y-1 flex-1">
                        <h4 className="font-serif font-bold text-zinc-800">{m.name}</h4>
                        <p className="text-xs text-gold-600 font-medium">{m.role}</p>
                        {m.emailAlarm && (
                          <p className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 inline-block rounded font-mono font-bold">
                            📧 Alarme: {m.emailAlarm}
                          </p>
                        )}
                        <p className="text-xs text-zinc-500 line-clamp-3">{m.description}</p>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => openEditTeam(m)}
                            className="text-[10px] text-zinc-500 hover:text-gold-600 flex items-center gap-0.5 cursor-pointer font-bold"
                          >
                            <Edit className="w-3 h-3" /> Modifier
                          </button>
                          <button
                            onClick={() => deleteTeam(m.id)}
                            className="text-[10px] text-rose-500 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer font-bold"
                          >
                            <Trash2 className="w-3 h-3" /> Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4B: TESTIMONIALS */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-gold-500" />
                    <h3 className="font-serif font-bold text-zinc-800 text-lg">Témoignages Clients</h3>
                  </div>
                  <button
                    onClick={openAddTestimonial}
                    className="text-xs bg-gold-50 text-gold-600 hover:bg-gold-100 px-3 py-1.5 rounded-lg border border-gold-200 font-semibold cursor-pointer"
                  >
                    Ajouter un avis
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map((t) => (
                    <div key={t.id} className="border border-zinc-100 rounded-xl p-4 bg-zinc-50/50 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-zinc-800 text-sm">{t.name}</span>
                          <span className="text-xs text-zinc-400">{t.date}</span>
                        </div>
                        <div className="flex gap-0.5 text-amber-400 text-xs">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                        <p className="text-xs text-zinc-600 italic">"{t.comment}"</p>
                      </div>

                      <div className="pt-3 border-t border-zinc-200/50 mt-3 flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-gold-600">
                          {t.dressCategory || "Avis Boutique"}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditTestimonial(t)}
                            className="text-[10px] text-zinc-500 hover:text-gold-600 cursor-pointer"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => deleteTestimonial(t.id)}
                            className="text-[10px] text-rose-500 hover:text-rose-600 cursor-pointer"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ADD/EDIT DRESS */}
      {isDressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-zinc-900 text-white p-4 flex justify-between items-center shrink-0">
              <h3 className="font-serif font-semibold">{editingDress ? 'Modifier la Tenue' : 'Ajouter une Nouvelle Tenue'}</h3>
              <button onClick={() => setIsDressModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDressSubmit} className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Nom du modèle</label>
                  <input
                    type="text"
                    required
                    value={dressName}
                    onChange={(e) => setDressName(e.target.value)}
                    className="w-full p-2.5 border rounded-lg"
                    placeholder="Robe Sirène Champagne"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Catégorie</label>
                  <select
                    value={dressCategory}
                    onChange={(e) => setDressCategory(e.target.value as Category)}
                    className="w-full p-2.5 border rounded-lg bg-white"
                  >
                    <option value="Robes de mariée">Robes de mariée</option>
                    <option value="Robes kabyles">Robes kabyles</option>
                    <option value="Caftans">Caftans</option>
                    <option value="Robes de soirée">Robes de soirée</option>
                    <option value="Accessoires">Accessoires</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Description détaillée</label>
                <textarea
                  required
                  rows={3}
                  value={dressDesc}
                  onChange={(e) => setDressDesc(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                  placeholder="Écrivez une description luxueuse soulignant la dentelle, les perles, le style..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Prix de Location par Jour (DZD)</label>
                  <input
                    type="number"
                    required
                    value={dressPrice}
                    onChange={(e) => setDressPrice(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Acompte requis pour réservation (DZD)</label>
                  <input
                    type="number"
                    required
                    value={dressDeposit}
                    onChange={(e) => setDressDeposit(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Tailles disponibles</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['34', '36', '38', '40', '42', '44', '46', 'Taille Unique'].map((size) => {
                    const isChecked = dressSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSizeSelection(size)}
                        className={`px-3 py-1.5 rounded-full border text-xs cursor-pointer ${
                          isChecked ? 'bg-gold-500 text-white font-bold border-gold-500' : 'bg-white text-zinc-600 border-zinc-200'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Images (Liens URL ou Téléchargement de fichiers)</label>
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={dressImages}
                    onChange={(e) => setDressImages(e.target.value)}
                    className="w-full p-2.5 border rounded-lg font-mono text-xs"
                    placeholder="https://image1.jpg, https://image2.jpg"
                  />
                  <div className="flex justify-between items-center bg-zinc-50 p-2 border border-dashed rounded-lg">
                    <span className="text-[11px] text-zinc-500 font-sans">Ou sélectionnez une ou plusieurs images locales :</span>
                    <label className="bg-zinc-800 hover:bg-zinc-900 text-white px-3 py-1.5 text-xs font-bold rounded cursor-pointer select-none">
                      Choisir des images
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            const newBase64s: string[] = [];
                            let loadedCount = 0;
                            Array.from(files).forEach((file) => {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  newBase64s.push(event.target.result as string);
                                }
                                loadedCount++;
                                if (loadedCount === files.length) {
                                  const currentImages = dressImages.trim();
                                  const separator = currentImages ? ', ' : '';
                                  setDressImages(currentImages + separator + newBase64s.join(', '));
                                }
                              };
                              reader.readAsDataURL(file as any);
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Collez des liens d'images séparés par des virgules ou importez des fichiers directement de votre appareil.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Vidéo de Démonstration (URL ou Téléchargement MP4)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={dressVideo}
                      onChange={(e) => setDressVideo(e.target.value)}
                      className="flex-1 p-2.5 border rounded-lg font-mono text-xs"
                      placeholder="https://assets.mixkit.co/..."
                    />
                    <label className="bg-zinc-800 hover:bg-zinc-900 text-white px-3 py-2 text-xs font-bold flex items-center justify-center cursor-pointer select-none rounded-lg shrink-0">
                      Téléverser MP4
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setDressVideo(event.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Collez une URL de vidéo MP4 ou téléchargez un fichier vidéo local.
                  </span>
                </div>
                <div className="flex items-center pt-5">
                  <input
                    type="checkbox"
                    id="dress-available-check"
                    checked={dressAvailable}
                    onChange={(e) => setDressAvailable(e.target.checked)}
                    className="w-4 h-4 text-gold-600 border-zinc-300 rounded accent-gold-500"
                  />
                  <label htmlFor="dress-available-check" className="ml-2 block text-xs font-bold text-zinc-600 uppercase cursor-pointer">
                    Disponible immédiatement à la location
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDressModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-700 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gold-gradient text-white rounded-lg hover:opacity-90 transition-opacity font-serif font-medium shadow cursor-pointer"
                >
                  {editingDress ? 'Enregistrer les modifications' : 'Ajouter la tenue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT TEAM MEMBER */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-zinc-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-serif font-semibold">{editingTeam ? 'Modifier l\'Équipier' : 'Ajouter un Équipier'}</h3>
              <button onClick={() => setIsTeamModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTeamSubmit} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Nom Complet</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                  placeholder="Kahina Hamdad"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Rôle / Poste</label>
                <input
                  type="text"
                  required
                  value={teamRole}
                  onChange={(e) => setTeamRole(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                  placeholder="Conseillère styliste"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Photo de Profil (URL ou Téléversement)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={teamPhoto}
                    onChange={(e) => setTeamPhoto(e.target.value)}
                    className="flex-1 p-2.5 border rounded-lg font-mono text-xs"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <label className="bg-zinc-800 hover:bg-zinc-900 text-white px-3 py-2 text-xs font-bold flex items-center justify-center cursor-pointer select-none">
                    Téléverser
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setTeamPhoto(event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <span className="text-[9px] text-zinc-400 mt-0.5 block">Saisissez une adresse URL ou sélectionnez une image locale.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 font-sans">Email pour Alertes / Alarmes</label>
                <input
                  type="email"
                  value={teamEmailAlarm}
                  onChange={(e) => setTeamEmailAlarm(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-xs"
                  placeholder="nom@exemple.com"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block leading-relaxed">
                  Cet équipier recevra une copie des alarmes de réservations par e-mail.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Description / Courte Biographie</label>
                <textarea
                  required
                  rows={3}
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                  placeholder="Parlez de son expérience, ses passions..."
                />
              </div>

              <div className="pt-4 border-t flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="flex-1 py-2 bg-zinc-100 text-zinc-700 rounded-lg cursor-pointer text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gold-gradient text-white rounded-lg cursor-pointer text-xs font-bold"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT TESTIMONIAL */}
      {isTestimonialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-zinc-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-serif font-semibold">{editingTestimonial ? 'Modifier le Témoignage' : 'Ajouter un Témoignage'}</h3>
              <button onClick={() => setIsTestimonialModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTestimonialSubmit} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Nom de la Cliente</label>
                <input
                  type="text"
                  required
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                  placeholder="Amel G."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Note (Étoiles 1-5)</label>
                  <select
                    value={testRating}
                    onChange={(e) => setTestRating(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-lg bg-white"
                  >
                    <option value="5">5 Étoiles (Excellent)</option>
                    <option value="4">4 Étoiles (Très bon)</option>
                    <option value="3">3 Étoiles (Moyen)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Catégorie associée</label>
                  <input
                    type="text"
                    required
                    value={testCategory}
                    onChange={(e) => setTestCategory(e.target.value)}
                    className="w-full p-2.5 border rounded-lg"
                    placeholder="Robes kabyles"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Commentaire / Avis</label>
                <textarea
                  required
                  rows={3}
                  value={testComment}
                  onChange={(e) => setTestComment(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                  placeholder="Partagez l'avis de la cliente..."
                />
              </div>

              <div className="pt-4 border-t flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsTestimonialModalOpen(false)}
                  className="flex-1 py-2 bg-zinc-100 text-zinc-700 rounded-lg cursor-pointer text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gold-gradient text-white rounded-lg cursor-pointer text-xs font-bold"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
