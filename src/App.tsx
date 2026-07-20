import { useState, useEffect } from 'react';
import { 
  Heart, Phone, MapPin, Instagram, Play, Pause, ChevronLeft, ChevronRight, 
  Sparkles, Calendar, MessageCircle, Star, ShieldCheck, Mail, Lock, 
  Menu, X, ExternalLink, HelpCircle, Film, ShoppingBag, Award, Clock, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Data and types
import { Category, Dress, Booking, TeamMember, Testimonial, AppSettings } from './types';
import { INITIAL_DRESSES, INITIAL_TEAM, INITIAL_TESTIMONIALS, DEFAULT_SETTINGS } from './initialData';

// Components
import AudioPlayer from './components/AudioPlayer';
import DressModal from './components/DressModal';
import CheckoutModal from './components/CheckoutModal';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // --- Persistent States from LocalStorage ---
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Initialize data
  useEffect(() => {
    // Settings
    const localSettings = localStorage.getItem('boutique_settings');
    if (localSettings) {
      try {
        const parsed = JSON.parse(localSettings);
        // Force migration of default credentials if they are old or missing
        if (!parsed.adminUsername || parsed.adminUsername === 'karim' || parsed.adminPasswordHash === 'admin123' || parsed.adminPasswordHash === 'karim2026') {
          parsed.adminUsername = DEFAULT_SETTINGS.adminUsername;
          parsed.adminPasswordHash = DEFAULT_SETTINGS.adminPasswordHash;
        }
        // Ensure notification parameters are also merged
        if (!parsed.notificationEmail) parsed.notificationEmail = DEFAULT_SETTINGS.notificationEmail;
        if (!parsed.notificationWhatsapp) parsed.notificationWhatsapp = DEFAULT_SETTINGS.notificationWhatsapp;
        
        const merged = { ...DEFAULT_SETTINGS, ...parsed };
        setSettings(merged);
        localStorage.setItem('boutique_settings', JSON.stringify(merged));
      } catch (e) {
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem('boutique_settings', JSON.stringify(DEFAULT_SETTINGS));
      }
    } else {
      localStorage.setItem('boutique_settings', JSON.stringify(DEFAULT_SETTINGS));
    }

    // Dresses
    const localDresses = localStorage.getItem('boutique_dresses');
    if (localDresses) {
      setDresses(JSON.parse(localDresses));
    } else {
      setDresses(INITIAL_DRESSES);
      localStorage.setItem('boutique_dresses', JSON.stringify(INITIAL_DRESSES));
    }

    // Bookings
    const localBookings = localStorage.getItem('boutique_bookings');
    if (localBookings) {
      setBookings(JSON.parse(localBookings));
    } else {
      // Empty by default or with a sample
      const sampleBookings: Booking[] = [
        {
          id: 'b-sample-1',
          dressId: 'mari-01',
          dressName: 'Robe Céleste - Princesse Dentelle',
          dressImage: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80',
          customerName: 'Nassima Ait-Said',
          customerPhone: '0555981243',
          customerEmail: 'nassima@gmail.com',
          date: '2026-08-15',
          size: '38',
          status: 'confirmed',
          depositPaid: true,
          depositAmount: 15000,
          createdAt: new Date().toISOString()
        }
      ];
      setBookings(sampleBookings);
      localStorage.setItem('boutique_bookings', JSON.stringify(sampleBookings));
    }

    // Team
    const localTeam = localStorage.getItem('boutique_team');
    if (localTeam) {
      setTeam(JSON.parse(localTeam));
    } else {
      setTeam(INITIAL_TEAM);
      localStorage.setItem('boutique_team', JSON.stringify(INITIAL_TEAM));
    }

    // Testimonials
    const localTestimonials = localStorage.getItem('boutique_testimonials');
    if (localTestimonials) {
      setTestimonials(JSON.parse(localTestimonials));
    } else {
      setTestimonials(INITIAL_TESTIMONIALS);
      localStorage.setItem('boutique_testimonials', JSON.stringify(INITIAL_TESTIMONIALS));
    }
  }, []);

  // --- UI Layout & Navigation States ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Tous'>('Tous');
  
  // Hero slides setup
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=1920&q=80',
      tagline: 'L\'Élégance Royale',
      title: 'Robes de Mariée de Créateurs',
      description: 'Découvrez des designs exclusifs, de la dentelle perlée aux traînes impériales pour briller le jour de votre vie.'
    },
    {
      image: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=1920&q=80',
      tagline: 'Fierté & Tradition de Kabylie',
      title: 'Robes Kabyles Prestigieuses',
      description: 'Célébrez l\'héritage de Tizi Ouzou avec nos créations kabyles rehaussées de broderies fardas de luxe faites main.'
    },
    {
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1920&q=80',
      tagline: 'Héritage Artisanal Impérial',
      title: 'Caftans & Tenues Traditionnelles',
      description: 'Satin de soie, velours royal et sfifa dorée. Louez des pièces d\'exception adaptées à toutes vos cérémonies.'
    }
  ];

  // Auto-play slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlideIdx((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlideIdx((prev) => (prev + 1) % heroSlides.length);
  };

  // --- Modal Overlay Triggers ---
  const [activeDress, setActiveDress] = useState<Dress | null>(null);
  const [isDressOpen, setIsDressOpen] = useState(false);
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutBookingDetails, setCheckoutBookingDetails] = useState<{
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    date: string;
    fittingDate?: string;
    size: string;
    notes: string;
  } | null>(null);

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // --- Active Video Player in Showcase ---
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // --- Smooth Scroll helper ---
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- Trigger Payment Checkout ---
  const handleInitiatePayment = (details: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    date: string;
    fittingDate?: string;
    size: string;
    notes: string;
  }) => {
    setCheckoutBookingDetails(details);
    setIsCheckoutOpen(true);
  };

  // --- Complete Reservation Booking upon Successful Payment ---
  const handlePaymentSuccess = (paymentMethod: string) => {
    if (!activeDress || !checkoutBookingDetails) return;

    const newBooking: Booking = {
      id: 'book-' + Date.now(),
      dressId: activeDress.id,
      dressName: activeDress.name,
      dressImage: activeDress.images[0],
      customerName: checkoutBookingDetails.customerName,
      customerPhone: checkoutBookingDetails.customerPhone,
      customerEmail: checkoutBookingDetails.customerEmail,
      date: checkoutBookingDetails.date,
      fittingDate: checkoutBookingDetails.fittingDate,
      size: checkoutBookingDetails.size,
      status: 'confirmed', // Immediate confirmation on secure online payment
      depositPaid: true,
      depositAmount: activeDress.depositAmount,
      paymentMethod: paymentMethod,
      notes: checkoutBookingDetails.notes,
      createdAt: new Date().toISOString()
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    localStorage.setItem('boutique_bookings', JSON.stringify(updatedBookings));

    // Reset modals
    setIsCheckoutOpen(false);
    setIsDressOpen(false);
    setActiveDress(null);
    setCheckoutBookingDetails(null);

    const fittingMessage = newBooking.fittingDate 
      ? ` et votre séance d'essai/test est planifiée pour le ${new Date(newBooking.fittingDate).toLocaleDateString('fr-FR')}`
      : '';
    alert(`Félicitations ! Votre réservation pour le ${new Date(newBooking.date).toLocaleDateString('fr-FR')} a été confirmée avec succès${fittingMessage}. Notre équipe vous attend à la boutique de Tizi Ouzou !`);
  };

  // --- Filter Dresses ---
  const displayedDresses = dresses.filter((d) => {
    if (selectedCategory === 'Tous') return true;
    return d.category === selectedCategory;
  });

  // Pick up some custom videos of dresses to show in showcase
  const videoShowcaseDresses = dresses.filter((d) => d.videoUrl);

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col font-serif text-[#3D3434] relative antialiased selection:bg-gold-100 selection:text-gold-900">
      
      {/* Floating Ambient Music */}
      <AudioPlayer 
        url={settings.backgroundMusicUrl} 
        title={settings.musicTitle} 
      />

      {/* LUXURIOUS STICKY HEADER */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-bento-gold/30 shadow-xs h-20 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          {/* Logo Brand Brand */}
          <div 
            onClick={() => scrollToSection('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full border border-bento-gold/30 flex items-center justify-center bg-bento-rose text-bento-gold transition-transform group-hover:scale-105 shadow-sm">
              <Heart className="w-5 h-5 fill-current text-bento-gold/70" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-serif font-light text-xl md:text-2xl text-bento-gold tracking-[0.15em] uppercase leading-none">
                Coup de Cœur
              </h1>
              <p className="text-[9px] uppercase tracking-[0.3em] text-bento-text/80 font-sans mt-1">Tizi Ouzou - Haute Couture</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[11px] font-sans uppercase tracking-widest text-bento-text/90">
            <button onClick={() => scrollToSection('home')} className="hover:text-bento-gold transition-colors cursor-pointer">Accueil</button>
            <button onClick={() => scrollToSection('collection')} className="hover:text-bento-gold transition-colors cursor-pointer">Nos Robes</button>
            <button onClick={() => scrollToSection('videos')} className="hover:text-bento-gold transition-colors cursor-pointer">Défilés</button>
            <button onClick={() => scrollToSection('team')} className="hover:text-bento-gold transition-colors cursor-pointer">L'Équipe</button>
            <button onClick={() => scrollToSection('reviews')} className="hover:text-bento-gold transition-colors cursor-pointer">Avis</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-bento-gold transition-colors cursor-pointer">Contact</button>
          </nav>

          {/* Action Buttons Right */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsAdminOpen(true)}
              id="admin-login-btn"
              className="px-6 py-2 text-[10px] uppercase tracking-widest text-bento-gold border border-bento-gold/50 bg-white/40 hover:bg-bento-gold hover:text-white font-sans transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Lock className="w-3 h-3" /> Espace Admin
            </button>
            <a
              href="https://wa.me/213550123456?text=Bonjour%20Boutique%20Coup%20de%20Cœur,%20je%20souhaite%20prendre%20un%20rendez-vous%20de%20retouches%20ou%20de%20location."
              target="_blank"
              referrerPolicy="no-referrer"
              className="bg-bento-gold hover:bg-bento-gold-dark text-white text-[10px] uppercase tracking-widest font-sans px-6 py-2.5 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>

          {/* Mobile hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-bento-text hover:text-bento-gold transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-bento-gold/20 overflow-hidden text-xs"
            >
              <div className="px-6 py-5 space-y-4 flex flex-col font-sans uppercase tracking-widest text-bento-text/95">
                <button onClick={() => scrollToSection('home')} className="text-left py-1 hover:text-bento-gold transition-colors cursor-pointer">Accueil</button>
                <button onClick={() => scrollToSection('collection')} className="text-left py-1 hover:text-bento-gold transition-colors cursor-pointer">Nos Robes</button>
                <button onClick={() => scrollToSection('videos')} className="text-left py-1 hover:text-bento-gold transition-colors cursor-pointer">Défilés</button>
                <button onClick={() => scrollToSection('team')} className="text-left py-1 hover:text-bento-gold transition-colors cursor-pointer">L'Équipe</button>
                <button onClick={() => scrollToSection('reviews')} className="text-left py-1 hover:text-bento-gold transition-colors cursor-pointer">Avis</button>
                <button onClick={() => scrollToSection('contact')} className="text-left py-1 hover:text-bento-gold transition-colors cursor-pointer">Contact</button>
                
                <div className="pt-4 border-t border-bento-gold/10 flex gap-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); setIsAdminOpen(true); }}
                    className="flex-1 py-2 text-center text-[10px] font-sans uppercase tracking-widest text-bento-gold border border-bento-gold/30 rounded-none bg-white/40 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" /> Admin
                  </button>
                  <a
                    href="https://wa.me/213550123456?text=Bonjour%20Boutique%20Coup%20de%20Cœur,%20je%20souhaite%20louer%20une%20robe."
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="flex-1 py-2 text-center text-[10px] font-sans uppercase tracking-widest text-white bg-bento-gold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs rounded-none"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION / SLIDESHOW */}
      <section id="home" className="relative h-[550px] overflow-hidden bg-bento-dark border border-bento-gold/20 shadow-xl bg-rose-gradient rounded-md mx-4 lg:mx-auto max-w-7xl my-6 flex items-center">
        {/* Carousel slides */}
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentSlideIdx === idx ? 'opacity-80 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background image dynamically customized from settings or carousel defaults */}
            <img 
              src={idx === 0 && settings.homepageBg ? settings.homepageBg : slide.image} 
              alt={slide.title} 
              className="w-full h-full object-cover scale-105 transform motion-safe:animate-pulse filter contrast-105" 
              style={{ animationDuration: '12s' }}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-bento-dark/90 via-bento-dark/50 to-transparent" />
          </div>
        ))}

        {/* Hero Copy overlay */}
        <div className="relative z-20 max-w-5xl mx-auto px-6 sm:px-10 text-white space-y-6">
          <motion.div
            key={currentSlideIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <span className="inline-block bg-bento-gold text-white text-[10px] uppercase font-sans tracking-widest px-4 py-1.5 rounded-none shadow-sm">
              {heroSlides[currentSlideIdx].tagline}
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-light leading-tight text-white tracking-tight drop-shadow-md">
              {heroSlides[currentSlideIdx].title}
            </h2>
            <p className="text-white/80 text-xs md:text-sm leading-relaxed font-sans max-w-xl drop-shadow-sm uppercase tracking-wider">
              {heroSlides[currentSlideIdx].description}
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => scrollToSection('collection')}
              className="bg-bento-gold hover:bg-bento-gold-dark text-white font-sans text-[11px] uppercase tracking-[0.2em] px-8 py-3.5 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 rounded-none"
            >
              <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
              Explorer la Collection
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="bg-transparent hover:bg-white/10 text-white border border-white/40 font-sans text-[11px] uppercase tracking-[0.2em] px-8 py-3.5 transition-all cursor-pointer flex items-center gap-2 rounded-none"
            >
              <MapPin className="w-4 h-4 text-bento-gold" />
              Visiter notre Boutique
            </button>
          </div>
        </div>

        {/* Carousel controls buttons */}
        <div className="absolute bottom-8 right-8 z-20 flex gap-2">
          <button
            onClick={handlePrevSlide}
            className="p-3 bg-bento-dark/40 hover:bg-bento-dark/60 text-white border border-white/20 rounded-none backdrop-blur-xs transition-colors cursor-pointer"
            title="Précédent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextSlide}
            className="p-3 bg-bento-dark/40 hover:bg-bento-dark/60 text-white border border-white/20 rounded-none backdrop-blur-xs transition-colors cursor-pointer"
            title="Suivant"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Soft bottom edge transition divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bento-bg to-transparent z-15" />
      </section>

      {/* VALUE ADVANTAGES */}
      <section className="py-12 bg-bento-bg relative z-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white border border-bento-gold/15 p-6 rounded-md shadow-sm text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-bento-rose text-bento-gold flex items-center justify-center mb-1 shadow-xs">
                <Award className="w-6 h-6 text-bento-gold" />
              </div>
              <h4 className="font-serif font-light text-bento-gold italic text-base">Robes Exclusives</h4>
              <p className="text-xs text-bento-text/85 leading-relaxed max-w-[210px] font-sans">Des créations uniques de grands couturiers introuvables ailleurs.</p>
            </div>

            <div className="bg-white border border-bento-gold/15 p-6 rounded-md shadow-sm text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-bento-rose text-bento-gold flex items-center justify-center mb-1 shadow-xs">
                <Clock className="w-6 h-6 text-bento-gold" />
              </div>
              <h4 className="font-serif font-light text-bento-gold italic text-base">Location Facilitée</h4>
              <p className="text-xs text-bento-text/85 leading-relaxed max-w-[210px] font-sans">Réservez en ligne avec acompte et retirez sereinement à la boutique.</p>
            </div>

            <div className="bg-white border border-bento-gold/15 p-6 rounded-md shadow-sm text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-bento-rose text-bento-gold flex items-center justify-center mb-1 shadow-xs">
                <Sparkles className="w-6 h-6 text-bento-gold" />
              </div>
              <h4 className="font-serif font-light text-bento-gold italic text-base">Retouches & Ajustements</h4>
              <p className="text-xs text-bento-text/85 leading-relaxed max-w-[210px] font-sans">Nos couturières professionnelles ajustent chaque robe à vos mensures exactes.</p>
            </div>

            <div className="bg-white border border-bento-gold/15 p-6 rounded-md shadow-sm text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-bento-rose text-bento-gold flex items-center justify-center mb-1 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-bento-gold" />
              </div>
              <h4 className="font-serif font-light text-bento-gold italic text-base">Hygiène Exemplaire</h4>
              <p className="text-xs text-bento-text/85 leading-relaxed max-w-[210px] font-sans">Chaque robe subit un nettoyage à sec premium écologique avant chaque remise.</p>
            </div>

          </div>
        </div>
      </section>

      {/* COLLECTION & GALLERY SHOWCASE */}
      <section id="collection" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3.5 mb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] text-bento-gold font-bold bg-bento-rose border border-bento-gold/25 px-4 py-1.5 inline-block rounded-none">
            Notre Garde-Robe Prestigieuse
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-light text-bento-text uppercase tracking-wide">
            Collections Haute Couture
          </h2>
          <div className="w-16 h-[1px] bg-bento-gold/40 mx-auto" />
          <p className="text-xs md:text-sm text-bento-text/80 max-w-xl mx-auto font-sans leading-relaxed">
            Sélectionnez votre univers et découvrez nos robes de mariée de rêve, nos tenues kabyles d'exception et nos majestueux caftans.
          </p>
        </div>

        {/* Dynamic Category Selector */}
        <div className="flex flex-wrap gap-2.5 justify-center mb-12">
          {(['Tous', 'Robes de mariée', 'Robes kabyles', 'Caftans', 'Robes de soirée', 'Accessoires'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 border text-[10px] uppercase tracking-widest font-sans transition-all cursor-pointer rounded-none ${
                selectedCategory === cat
                  ? 'bg-bento-gold text-white border-bento-gold shadow-sm font-semibold'
                  : 'bg-white text-bento-text border-bento-gold/20 hover:border-bento-gold/50 hover:bg-bento-rose'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dresses Grid */}
        {displayedDresses.length === 0 ? (
          <div className="py-16 text-center text-bento-text/50 space-y-3">
            <Heart className="w-10 h-10 mx-auto text-bento-gold/20" />
            <p className="text-sm font-sans">Aucune tenue n'est présente dans cette catégorie pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedDresses.map((dress, index) => (
              <motion.div
                key={dress.id}
                layoutId={`dress-card-${dress.id}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.16, 1, 0.3, 1], // Luxurious custom cubic-bezier
                  delay: (index % 4) * 0.1 // Elegant staggered animation based on column index
                }}
                onClick={() => {
                  setActiveDress(dress);
                  setIsDressOpen(true);
                }}
                className="bg-white rounded-md overflow-hidden border border-bento-gold/20 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              >
                {/* Media frame */}
                <div className="h-72 overflow-hidden relative bg-bento-bg">
                  <img
                    src={dress.images[0]}
                    alt={dress.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Category overlay */}
                  <span className="absolute top-4 left-4 bg-bento-dark/90 text-white text-[8px] uppercase font-sans tracking-widest px-3 py-1 rounded-none border border-bento-gold/30">
                    {dress.category}
                  </span>
                  
                  {/* Quick-View hover panel */}
                  <div className="absolute inset-0 bg-bento-dark/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-bento-text text-[9px] font-sans uppercase tracking-widest px-4 py-2.5 rounded-none border border-bento-gold/25 shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-transform flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-bento-gold" /> Détails & Réservation
                    </span>
                  </div>
                </div>

                {/* Info and price panel */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-serif font-light text-bento-text text-lg group-hover:text-bento-gold transition-colors line-clamp-1 uppercase tracking-wide">
                      {dress.name}
                    </h3>
                    <p className="text-xs text-bento-text/70 line-clamp-2 leading-relaxed font-sans">
                      {dress.description}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-bento-gold/15 flex items-center justify-between">
                    <div>
                      <p className="text-[8px] text-bento-text/50 uppercase tracking-widest font-sans font-semibold">Location / Jour</p>
                      <p className="font-serif font-light text-bento-gold text-base">
                        {dress.pricePerDay.toLocaleString()} DZD
                      </p>
                    </div>

                    <button className="bg-bento-rose text-bento-gold hover:bg-bento-gold hover:text-white border border-bento-gold/25 px-4 py-2 rounded-none text-[9px] font-sans uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1">
                      <span>Réserver</span> <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* DÉFILÉS / VIDEO SECTION */}
      <section id="videos" className="py-20 bg-bento-dark text-white relative border-y border-bento-gold/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.08),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <div className="text-center space-y-3.5 mb-16">
            <span className="text-[10px] uppercase tracking-[0.3em] text-bento-gold font-bold bg-white/5 border border-bento-gold/25 px-4 py-1.5 inline-block rounded-none">
              La Collection en Mouvement
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-light text-white uppercase tracking-wide">
              Défilés Haute Couture
            </h2>
            <div className="w-16 h-[1px] bg-bento-gold/40 mx-auto" />
            <p className="text-xs md:text-sm text-white/70 max-w-xl mx-auto font-sans leading-relaxed">
              Admirez la fluidité, les reflets et le port altier de nos robes de mariée et de nos créations kabyles de Tizi Ouzou filmées en défilé.
            </p>
          </div>

          {/* Videos Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Custom Interactive Main Video (If any dresses have videos) */}
            {videoShowcaseDresses.slice(0, 2).map((d) => (
              <div key={d.id} className="space-y-4">
                <div className="relative aspect-video rounded-md overflow-hidden shadow-2xl bg-bento-dark group border border-bento-gold/25">
                  {playingVideoId === d.id ? (
                    <video
                      src={d.videoUrl}
                      controls
                      autoPlay
                      loop
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <img src={d.images[0]} alt={d.name} className="w-full h-full object-cover brightness-75" />
                      
                      {/* Play Button Overlay */}
                      <button
                        onClick={() => setPlayingVideoId(d.id)}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/45 transition-colors cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform">
                          <Play className="w-6 h-6 fill-current text-white ml-1" />
                        </div>
                      </button>

                      {/* Info Badge */}
                      <div className="absolute bottom-4 left-4 right-4 bg-bento-dark/95 backdrop-blur-md p-4 rounded-none flex items-center justify-between border border-bento-gold/25">
                        <div className="space-y-0.5">
                          <p className="text-[9px] uppercase tracking-widest font-sans font-bold text-bento-gold">{d.category}</p>
                          <h4 className="font-serif font-light text-sm text-white uppercase tracking-wide">{d.name}</h4>
                        </div>
                        <button
                          onClick={() => {
                            setActiveDress(d);
                            setIsDressOpen(true);
                          }}
                          className="bg-bento-gold hover:bg-bento-gold-dark text-white text-[10px] font-sans uppercase tracking-widest px-4 py-2 rounded-none cursor-pointer transition-colors"
                        >
                          Louer
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Fallback Beautiful Cinematic Video Frame if no uploads are configured yet */}
            {videoShowcaseDresses.length === 0 && (
              <div className="md:col-span-2 text-center py-12 text-zinc-500 space-y-2">
                <Film className="w-10 h-10 mx-auto text-bento-gold/30" />
                <p className="text-sm font-sans">Aucune vidéo de démonstration n'a été mise en ligne par l'administrateur.</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* OUR COUTURE TEAM ("NOTRE ÉQUIPE") */}
      <section id="team" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3.5 mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] text-bento-gold font-bold bg-bento-rose border border-bento-gold/25 px-4 py-1.5 inline-block rounded-none">
            Savoir-Faire & Passion
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-light text-bento-text uppercase tracking-wide">
            Notre Équipe Styliste
          </h2>
          <div className="w-16 h-[1px] bg-bento-gold/40 mx-auto" />
          <p className="text-xs md:text-sm text-bento-text/80 max-w-xl mx-auto font-sans leading-relaxed">
            Des conseillères d'expérience et des fées de la couture pour vous accompagner dans le choix de votre tenue coup de cœur.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member) => (
            <div key={member.id} className="bg-white rounded-md overflow-hidden border border-bento-gold/20 shadow-sm hover:shadow-md transition-all group p-6 text-center flex flex-col justify-between space-y-4">
              
              <div className="space-y-4">
                {/* Photo profiling */}
                <div className="w-32 h-32 rounded-none overflow-hidden mx-auto border border-bento-gold/30 relative group-hover:scale-105 transition-transform bg-bento-bg">
                  <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif font-light text-bento-text text-lg uppercase tracking-wide">{member.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-bento-gold font-semibold">{member.role}</p>
                </div>

                <p className="text-xs text-bento-text/75 leading-relaxed italic max-w-xs mx-auto font-sans">
                  "{member.description}"
                </p>
              </div>

              {/* Tag decoration */}
              <div className="pt-3.5 border-t border-bento-gold/10 flex items-center justify-center gap-1.5 text-[9px] text-bento-text/50 uppercase tracking-widest font-sans font-medium">
                <Sparkles className="w-3.5 h-3.5 text-bento-gold/60" /> Tizi Ouzou Showroom
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="reviews" className="py-20 bg-bento-rose/30 border-y border-bento-gold/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Title Header */}
          <div className="text-center space-y-3.5 mb-16">
            <span className="text-[10px] uppercase tracking-[0.3em] text-bento-gold font-bold bg-white border border-bento-gold/25 px-4 py-1.5 inline-block rounded-none">
              Vos Moments de Bonheur
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-light text-bento-text uppercase tracking-wide">
              Témoignages de nos Mariées
            </h2>
            <div className="w-16 h-[1px] bg-bento-gold/40 mx-auto" />
            <p className="text-xs md:text-sm text-bento-text/80 max-w-xl mx-auto font-sans leading-relaxed">
              Chaque sourire de nos clientes est notre plus belle broderie. Lisez les retours d'expérience de celles qui nous ont fait confiance.
            </p>
          </div>

          {/* Grid of reviews */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white rounded-md p-6 shadow-xs border border-bento-gold/15 flex flex-col justify-between relative group hover:shadow-md transition-shadow">
                
                {/* Quote Icon decorative backdrop */}
                <span className="absolute top-4 right-6 font-serif text-7xl text-bento-gold/10 pointer-events-none font-bold select-none leading-none">“</span>
                
                <div className="space-y-4">
                  {/* Rating stars */}
                  <div className="flex gap-1 text-bento-gold">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current text-bento-gold" />
                    ))}
                  </div>

                  <p className="text-xs text-bento-text/80 leading-relaxed italic relative z-10 font-sans">
                    "{t.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-bento-gold/10 mt-5 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-serif font-light text-bento-text uppercase tracking-wider text-xs font-semibold">{t.name}</h5>
                    <p className="text-[9px] text-bento-text/50 font-sans">{t.date}</p>
                  </div>
                  {t.dressCategory && (
                    <span className="bg-bento-rose text-bento-gold text-[8px] font-sans uppercase tracking-widest px-2.5 py-0.5 rounded-none border border-bento-gold/20">
                      {t.dressCategory}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CONTACT, BOOKING DIRECTIONS & INTERACTIVE MAP */}
      <section id="contact" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Header */}
        <div className="text-center space-y-3.5 mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] text-bento-gold font-bold bg-bento-rose border border-bento-gold/25 px-4 py-1.5 inline-block rounded-none">
            Nous Trouver & Prendre RDV
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-light text-bento-text uppercase tracking-wide">
            Contact & Accès Boutique
          </h2>
          <div className="w-16 h-[1px] bg-bento-gold/40 mx-auto" />
          <p className="text-xs md:text-sm text-bento-text/80 max-w-xl mx-auto font-sans leading-relaxed">
            Notre showroom est situé au cœur de Tizi Ouzou. Passez nous voir ou contactez-nous directement pour vos essayages privés.
          </p>
        </div>

        {/* Contact and Map container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Card 1: Showroom info (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-md p-6 md:p-8 border border-bento-gold/20 shadow-sm flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <h3 className="font-serif font-light text-xl text-bento-text uppercase tracking-wider">
                La Boutique Showroom
              </h3>

              <div className="space-y-4 text-xs text-bento-text/85">
                
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-bento-rose text-bento-gold rounded-none shrink-0 border border-bento-gold/20">
                    <MapPin className="w-4.5 h-4.5 text-bento-gold" />
                  </div>
                  <div>
                    <h5 className="font-serif font-semibold text-bento-text text-xs uppercase tracking-wider">Adresse</h5>
                    <p className="mt-1 leading-relaxed font-sans text-bento-text/80">Boulevard Larbi Ben M'hidi (Près du Centre Commercial), Tizi Ouzou, Algérie</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-bento-rose text-bento-gold rounded-none shrink-0 border border-bento-gold/20">
                    <Phone className="w-4.5 h-4.5 text-bento-gold" />
                  </div>
                  <div>
                    <h5 className="font-serif font-semibold text-bento-text text-xs uppercase tracking-wider">Téléphone / Contact</h5>
                    <p className="mt-1 font-semibold text-bento-text font-sans">0550 12 34 56</p>
                    <p className="text-[10px] text-bento-text/50 font-sans">Fixe: 026 73 45 67</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-bento-rose text-bento-gold rounded-none shrink-0 border border-bento-gold/20">
                    <Mail className="w-4.5 h-4.5 text-bento-gold" />
                  </div>
                  <div>
                    <h5 className="font-serif font-semibold text-bento-text text-xs uppercase tracking-wider">E-mail</h5>
                    <p className="mt-1 font-sans text-bento-text/80">contact@boutiquecoupdecoeur-tizi.com</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-bento-rose text-bento-gold rounded-none shrink-0 border border-bento-gold/20">
                    <Instagram className="w-4.5 h-4.5 text-bento-gold" />
                  </div>
                  <div>
                    <h5 className="font-serif font-semibold text-bento-text text-xs uppercase tracking-wider">Réseaux Sociaux</h5>
                    <p className="mt-1 font-sans text-bento-text/80">@boutique_coup_de_coeur_tizi</p>
                  </div>
                </div>

              </div>
            </div>

            {/* CTA action shortcuts */}
            <div className="space-y-3 pt-6 border-t border-bento-gold/15">
              <a
                href="https://wa.me/213550123456?text=Bonjour,%20je%20souhaite%20prendre%20un%20rendez-vous%20pour%20essayer%20une%20robe."
                target="_blank"
                referrerPolicy="no-referrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white font-sans uppercase tracking-widest text-[10px] py-3.5 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer font-bold rounded-none"
              >
                <MessageCircle className="w-4.5 h-4.5 fill-current text-white" />
                Prendre RDV sur WhatsApp
              </a>
              <a
                href="tel:0550123456"
                className="w-full bg-white hover:bg-bento-rose border border-bento-gold/25 text-bento-text font-sans uppercase tracking-widest text-[10px] py-3.5 transition-all flex items-center justify-center gap-2 cursor-pointer font-bold rounded-none"
              >
                <Phone className="w-3.5 h-3.5 text-bento-gold" /> Appeler la boutique
              </a>
            </div>
          </div>

          {/* Card 2: Interactive High-End Google Maps Mockup (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-md overflow-hidden border border-bento-gold/20 shadow-sm min-h-[400px] flex flex-col justify-between">
            {/* Elegant Map Visual Mockup inside container */}
            <div className="flex-1 bg-bento-rose/25 relative p-8 flex flex-col justify-center items-center text-center space-y-5">
              {/* Outer decorative map markings */}
              <div className="absolute inset-0 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
              
              <div className="relative z-10 w-16 h-16 rounded-none bg-white border border-bento-gold/25 flex items-center justify-center shadow-md">
                <MapPin className="w-8 h-8 text-bento-gold animate-bounce" />
              </div>

              <div className="relative z-10 space-y-2 max-w-sm">
                <h4 className="font-serif font-light text-bento-text text-lg uppercase tracking-wide">
                  Notre Boutique au cœur de Tizi Ouzou
                </h4>
                <p className="text-xs text-bento-text/75 font-sans leading-relaxed">
                  Situé idéalement sur le Grand Boulevard Larbi Ben M'hidi, à proximité directe du Centre Ville et facilement accessible avec stationnement disponible à proximité.
                </p>
              </div>

              {/* Coordinates block */}
              <div className="relative z-10 bg-white/95 border border-bento-gold/20 px-4 py-2 rounded-none text-[9px] font-mono tracking-wider font-semibold text-bento-text/80 shadow-xs flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>36.7118° N, 4.0459° E (Tizi Ouzou Center)</span>
              </div>

              <a
                href="https://maps.google.com/?q=Tizi+Ouzou+Algeria"
                target="_blank"
                referrerPolicy="no-referrer"
                className="relative z-10 bg-bento-gold hover:bg-bento-gold-dark text-white font-sans text-[11px] uppercase tracking-[0.2em] px-8 py-3.5 rounded-none shadow-sm flex items-center gap-2 transition-transform hover:scale-105"
              >
                Ouvrir l'itinéraire Google Maps <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Operating Hours Bar */}
            <div className="bg-bento-dark text-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] uppercase tracking-wider font-sans border-t border-bento-gold/25">
              <span className="font-sans font-semibold text-bento-gold">Horaires d'ouverture :</span>
              <span className="font-sans text-white/90">Samedi au Jeudi : 09h30 - 19h00 (Vendredi : Fermé)</span>
            </div>
          </div>

        </div>
      </section>

      {/* LUXURIOUS FOOTER */}
      <footer className="bg-bento-dark text-white/75 py-12 border-t border-bento-gold/30 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-bento-gold/15">
            
            {/* Col 1: Brand details */}
            <div className="space-y-3 text-center md:text-left">
              <h4 className="font-serif font-light text-white text-lg uppercase tracking-wider">
                Boutique Coup de Cœur
              </h4>
              <p className="text-xs leading-relaxed max-w-sm mx-auto md:mx-0 text-white/70 font-sans">
                Location de robes de mariée de créateurs, robes kabyles d'exception, caftans royaux et robes de soirée à Tizi Ouzou. Votre joie suprême, notre noble passion.
              </p>
              <div className="flex gap-4 justify-center md:justify-start pt-1.5 text-white/60">
                <a href="#" className="hover:text-bento-gold transition-colors"><Instagram className="w-4 h-4" /></a>
                <a href="https://wa.me/213550123456" className="hover:text-bento-gold transition-colors"><MessageCircle className="w-4 h-4" /></a>
                <a href="tel:0550123456" className="hover:text-bento-gold transition-colors"><Phone className="w-4 h-4" /></a>
              </div>
            </div>

            {/* Col 2: Fast Categories links */}
            <div className="space-y-3 text-center md:text-left">
              <h5 className="font-serif font-light text-white text-sm uppercase tracking-wider">Collections</h5>
              <ul className="text-xs space-y-2.5 text-white/70 font-sans">
                <li><button onClick={() => { setSelectedCategory('Robes de mariée'); scrollToSection('collection'); }} className="hover:text-bento-gold transition-colors cursor-pointer text-left">Robes de mariée Princesse & Sirène</button></li>
                <li><button onClick={() => { setSelectedCategory('Robes kabyles'); scrollToSection('collection'); }} className="hover:text-bento-gold transition-colors cursor-pointer text-left">Robes Traditionnelles Kabyles</button></li>
                <li><button onClick={() => { setSelectedCategory('Caftans'); scrollToSection('collection'); }} className="hover:text-bento-gold transition-colors cursor-pointer text-left">Caftans de Tlemcen & Marocains</button></li>
                <li><button onClick={() => { setSelectedCategory('Robes de soirée'); scrollToSection('collection'); }} className="hover:text-bento-gold transition-colors cursor-pointer text-left">Robes de Cocktail & Soirée</button></li>
                <li><button onClick={() => { setSelectedCategory('Accessoires'); scrollToSection('collection'); }} className="hover:text-bento-gold transition-colors cursor-pointer text-left">Parures d'Argent & Diadèmes</button></li>
              </ul>
            </div>

            {/* Col 3: Safe disclaimer */}
            <div className="space-y-3 text-center md:text-left">
              <h5 className="font-serif font-light text-white text-sm uppercase tracking-wider">Informations Légales</h5>
              <p className="text-xs leading-relaxed text-white/70 font-sans">
                Toutes les réservations nécessitent le paiement d'un acompte pour garantir le créneau. Le solde de la location s'effectue en boutique lors du retrait et de la signature du contrat.
              </p>
              <p className="text-[10px] text-white/40 font-sans">
                © {new Date().getFullYear()} Boutique Coup de Cœur - Tizi Ouzou. Tous droits réservés.
              </p>
            </div>

          </div>

          {/* Underlay credits and admin back-door */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span className="text-white/40 font-sans">Conçu de manière artisanale pour les mariées d'Algérie</span>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-white/40 hover:text-bento-gold transition-colors flex items-center gap-1.5 font-sans uppercase tracking-widest text-[9px] font-bold cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-bento-gold" /> Accéder à l'Espace Administration Sécurisé
            </button>
          </div>
        </div>
      </footer>

      {/* --- OVERLAYS & DIALOGS --- */}

      {/* DRESS VIEW & BOOKING CALENDAR DIALOG */}
      {activeDress && (
        <DressModal
          dress={activeDress}
          isOpen={isDressOpen}
          onClose={() => {
            setIsDressOpen(false);
            setActiveDress(null);
          }}
          existingBookings={bookings}
          onInitiatePayment={handleInitiatePayment}
        />
      )}

      {/* SECURE ONLINE DEPOSIT (ACOMPTE) PAYMENT GATEWAY */}
      {activeDress && checkoutBookingDetails && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          dress={activeDress}
          bookingDetails={checkoutBookingDetails}
          onPaymentSuccess={handlePaymentSuccess}
          settings={settings}
          team={team}
        />
      )}

      {/* COUTURE BOUTIQUE MANAGEMENT PANEL (ADMIN PORTAL) */}
      {isAdminOpen && (
        <AdminPanel
          dresses={dresses}
          setDresses={setDresses}
          bookings={bookings}
          setBookings={setBookings}
          team={team}
          setTeam={setTeam}
          testimonials={testimonials}
          setTestimonials={setTestimonials}
          settings={settings}
          setSettings={setSettings}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

    </div>
  );
}
