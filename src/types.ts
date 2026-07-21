export type Category = 'Robes de mariée' | 'Robes kabyles' | 'Caftans' | 'Robes de soirée' | 'Accessoires';

export interface Dress {
  id: string;
  name: string;
  description: string;
  category: Category;
  pricePerDay: number;
  depositAmount: number; // Acompte pour réservation en ligne
  sizes: string[];
  images: string[];
  videoUrl?: string;
  available: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  dressId: string;
  dressName: string;
  dressImage: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string; // ISO String (YYYY-MM-DD)
  endDate?: string; // ISO String pour fin de location (YYYY-MM-DD)
  fittingDate?: string; // Date d'essai / test (YYYY-MM-DD)
  size: string;
  status: BookingStatus;
  depositPaid: boolean;
  depositAmount: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string;
  description: string;
  emailAlarm?: string; // Email pour recevoir les alertes de réservation
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  dressCategory?: string;
}

export interface AppSettings {
  homepageBg: string;
  backgroundMusicUrl: string;
  musicTitle: string;
  displayMode?: 'auto' | 'pc' | 'mobile';
  adminUsername?: string; // Nom d'utilisateur de l'admin (karim)
  adminPasswordHash: string; // Hash SHA-256 du mot de passe admin (jamais stocké en clair)
  notificationEmail?: string; // Email d'alarme (karimchabni395@gmail.com)
  notificationWhatsapp?: string; // WhatsApp d'alarme (00213553318195)
}

export interface DefileVideo {
  id: string;
  title: string;
  category: string;
  description: string;
  videoUrl: string;
  coverImage: string;
  aspectRatio?: 'landscape' | 'portrait';
}

