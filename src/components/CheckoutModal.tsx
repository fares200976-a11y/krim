import React, { useState } from 'react';
import { CreditCard, ShieldCheck, X, Check, Loader2, Sparkles, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dress, AppSettings, TeamMember } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  dress: Dress;
  bookingDetails: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    date: string;
    endDate?: string;
    fittingDate?: string;
    size: string;
    notes: string;
  } | null;
  onPaymentSuccess: (paymentMethod: string) => void;
  settings?: AppSettings;
  team?: TeamMember[];
}

export default function CheckoutModal({ isOpen, onClose, dress, bookingDetails, onPaymentSuccess, settings, team }: CheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(bookingDetails?.customerName || '');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-format card number (adds spaces every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = value.match(/\d{4,16}/g);
    let match = (matches && matches[0]) || '';
    let parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  // Auto-format expiry date (adds slash)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
    } else {
      setCardExpiry(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    setCardCvv(value.slice(0, 3));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cardNumber.replace(/\s+/g, '').length < 16) {
      setErrorMsg('Numéro de carte invalide. Doit comporter 16 chiffres.');
      return;
    }
    if (cardExpiry.length < 5) {
      setErrorMsg('Date d\'expiration invalide (MM/AA).');
      return;
    }
    if (cardCvv.length < 3) {
      setErrorMsg('Le code CVV doit comporter 3 chiffres.');
      return;
    }
    if (!cardName.trim()) {
      setErrorMsg('Veuillez saisir le nom du titulaire de la carte.');
      return;
    }

    // Process secure fake payment
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2500); // 2.5s simulate payment gateway logic
  };

  const handleComplete = () => {
    onPaymentSuccess('Carte CIB / Visa');
    onClose();
    // Reset state
    setIsSuccess(false);
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
  };

  if (!isOpen || !bookingDetails) return null;

  return (
    <div id="checkout-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-white rounded-none shadow-2xl overflow-hidden border border-bento-gold/25"
        >
          {/* Header */}
          <div className="bg-bento-rose border-b border-bento-gold/15 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4.5 h-4.5 text-bento-gold animate-pulse" />
              <h2 className="text-sm font-serif font-light text-bento-text uppercase tracking-wider">
                Paiement de l'Acompte Sécurisé
              </h2>
            </div>
            {!isProcessing && !isSuccess && (
              <button
                onClick={onClose}
                className="p-1 rounded-none text-bento-text/40 hover:bg-bento-rose hover:text-bento-gold transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6">
            {!isSuccess ? (
              <div className="space-y-5">
                {/* Booking Brief */}
                <div className="bg-bento-rose p-4 rounded-none text-xs space-y-2 border border-bento-gold/15 font-sans">
                  <div className="flex justify-between">
                    <span className="text-bento-text/60">Tenue :</span>
                    <span className="font-bold text-bento-text">{dress.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bento-text/60">Taille choisie :</span>
                    <span className="font-semibold text-bento-gold bg-white px-2 py-0.5 rounded-none border border-bento-gold/15">{bookingDetails.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bento-text/60">Dates réservées :</span>
                    <span className="font-semibold text-bento-text">
                      {bookingDetails.endDate
                        ? `Du ${new Date(bookingDetails.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au ${new Date(bookingDetails.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                        : new Date(bookingDetails.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                      }
                    </span>
                  </div>
                  {bookingDetails.fittingDate && (
                    <div className="flex justify-between bg-emerald-50/70 p-2 border border-emerald-100/50 mt-1 rounded-none">
                      <span className="text-emerald-800 font-bold text-[10px] uppercase tracking-wide">Jour de Test (Essai) :</span>
                      <span className="font-bold text-emerald-800">
                        {new Date(bookingDetails.fittingDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs pt-2 border-t border-bento-gold/15 font-bold text-bento-gold uppercase tracking-wider">
                    <span>Acompte à payer en ligne :</span>
                    <span className="font-serif font-light text-sm">{dress.depositAmount.toLocaleString()} DZD</span>
                  </div>
                </div>

                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <Loader2 className="w-10 h-10 text-bento-gold animate-spin" />
                    <p className="text-xs font-semibold text-bento-text uppercase tracking-widest font-sans">
                      Communication sécurisée avec le serveur bancaire...
                    </p>
                    <p className="text-[10px] text-bento-text/50 font-sans">
                      Veuillez ne pas fermer cette fenêtre.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-bento-text/50 font-bold mb-1.5 font-sans">
                        Nom sur la carte
                      </label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        placeholder="MME. KAHINA HAMDAD"
                        className="w-full text-xs px-3.5 py-3 border border-bento-gold/20 bg-bento-rose/10 rounded-none focus:outline-none focus:border-bento-gold transition-colors font-sans"
                      />
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-bento-text/50 font-bold mb-1.5 font-sans">
                        Numéro de carte (CIB, Visa, Mastercard)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          className="w-full text-xs pl-3.5 pr-20 py-3 border border-bento-gold/20 bg-bento-rose/10 rounded-none focus:outline-none focus:border-bento-gold transition-colors font-mono tracking-wider text-bento-text"
                        />
                        <div className="absolute right-3 top-3 flex gap-1 font-sans">
                          <span className="text-[9px] bg-bento-rose border border-bento-gold/25 px-1.5 py-0.5 rounded-none font-bold text-bento-gold">CIB</span>
                          <span className="text-[9px] bg-bento-dark border border-bento-gold/25 px-1.5 py-0.5 rounded-none font-bold text-white">VISA</span>
                        </div>
                      </div>
                    </div>

                    {/* Expiry and CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-bento-text/50 font-bold mb-1.5 font-sans">
                          Expiration (MM/AA)
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="12/28"
                          maxLength={5}
                          className="w-full text-xs px-3.5 py-3 border border-bento-gold/20 bg-bento-rose/10 rounded-none focus:outline-none focus:border-bento-gold transition-colors font-mono text-bento-text"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-bento-text/50 font-bold mb-1.5 font-sans">
                          Code secret CVV
                        </label>
                        <input
                          type="password"
                          required
                          value={cardCvv}
                          onChange={handleCvvChange}
                          placeholder="•••"
                          maxLength={3}
                          className="w-full text-xs px-3.5 py-3 border border-bento-gold/20 bg-bento-rose/10 rounded-none focus:outline-none focus:border-bento-gold transition-colors font-mono text-bento-text"
                        />
                      </div>
                    </div>

                    {errorMsg && (
                      <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-none font-sans text-center">
                        {errorMsg}
                      </p>
                    )}

                    {/* Pay Button */}
                    <button
                      type="submit"
                      className="w-full mt-2 bg-bento-gold hover:bg-bento-gold-dark text-white font-sans uppercase tracking-[0.2em] text-[10px] py-4 rounded-none shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer font-bold"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Payer l'acompte de {dress.depositAmount.toLocaleString()} DZD
                    </button>

                    <div className="flex items-center justify-center gap-2 pt-2 text-[9px] text-bento-text/50 font-sans uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Connexion cryptée SSL 256 bits • Banque d'Algérie agréée</span>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              /* Success State */
              (() => {
                const adminWhatsapp = settings?.notificationWhatsapp || '00213553318195';
                const cleanWhatsappNumber = adminWhatsapp.replace(/[^0-9]/g, '');
                const formattedDate = bookingDetails 
                  ? (bookingDetails.endDate
                    ? `du ${new Date(bookingDetails.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} au ${new Date(bookingDetails.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                    : `le ${new Date(bookingDetails.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                  )
                  : '';
                const formattedFittingDate = bookingDetails?.fittingDate ? new Date(bookingDetails.fittingDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
                
                const messageText = `🔔 NOUVELLE RÉSERVATION - Coup de Cœur Tizi Ouzou\n\n` +
                  `• Client : ${bookingDetails?.customerName}\n` +
                  `• Téléphone : ${bookingDetails?.customerPhone}\n` +
                  `• Tenue : ${dress.name}\n` +
                  `• Taille : ${bookingDetails?.size}\n` +
                  `• Date de location : ${formattedDate}\n` +
                  (formattedFittingDate ? `• Jour d'Essai (Test) : ${formattedFittingDate}\n` : '') +
                  `• Acompte Payé : ${dress.depositAmount.toLocaleString()} DZD\n\n` +
                  `L'alarme de réservation a été déclenchée.`;
                
                const whatsappLink = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(messageText)}`;

                const adminEmail = settings?.notificationEmail || 'karimchabni395@gmail.com';
                const teamWithAlarms = team?.filter(t => t.emailAlarm) || [];
                const teamEmails = teamWithAlarms.map(t => t.emailAlarm).join(',');
                const ccParam = teamEmails ? `?cc=${teamEmails}` : '';
                
                const emailSubject = `🔔 Alarme Réservation - Coup de Cœur - ${bookingDetails?.customerName}`;
                const emailBody = `Bonjour,\n\n` +
                  `Une nouvelle réservation vient d'être payée en ligne pour la boutique Coup de Cœur à Tizi Ouzou :\n\n` +
                  `• Nom de la cliente : ${bookingDetails?.customerName}\n` +
                  `• Numéro de téléphone : ${bookingDetails?.customerPhone}\n` +
                  `• Adresse e-mail : ${bookingDetails?.customerEmail}\n` +
                  `• Tenue louée : ${dress.name}\n` +
                  `• Taille sélectionnée : ${bookingDetails?.size}\n` +
                  `• Date de location : ${formattedDate}\n` +
                  (formattedFittingDate ? `• Jour d'Essai (Test) en boutique : ${formattedFittingDate}\n` : '') +
                  `• Acompte Réglé : ${dress.depositAmount.toLocaleString()} DZD\n\n` +
                  `Ce message sert d'alarme de réservation automatique pour l'équipe.\n\n` +
                  `Cordialement,\n` +
                  `Boutique Impériale Coup de Cœur`;
                
                const emailLink = `mailto:${adminEmail}${ccParam}${teamEmails ? '&' : '?'}subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

                return (
                  <div className="flex flex-col items-center justify-center text-center py-2 space-y-4">
                    <div className="w-12 h-12 rounded-none bg-bento-rose border border-bento-gold/20 flex items-center justify-center text-bento-gold animate-bounce">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    
                    <div>
                      <h3 className="text-base font-serif font-light text-bento-text flex items-center justify-center gap-1 uppercase tracking-wide">
                        Paiement Réussi <Sparkles className="w-4 h-4 text-bento-gold animate-pulse" />
                      </h3>
                      <p className="text-[11px] text-bento-text/70 mt-0.5 font-sans">
                        Votre acompte de {dress.depositAmount.toLocaleString()} DZD a été prélevé avec succès.
                      </p>
                    </div>

                    {/* Simulated Ticket Receipt */}
                    <div className="w-full bg-bento-rose/40 border border-dashed border-bento-gold/30 p-4 rounded-none text-left text-xs space-y-2 relative">
                      
                      <div className="flex justify-between font-mono text-[9px] text-bento-text/40 pt-1 tracking-wider uppercase font-semibold">
                        <span>REÇU DE TRANSACT°</span>
                        <span>N° {Math.floor(Math.random() * 9000000) + 1000000}</span>
                      </div>

                      <div className="border-t border-bento-gold/15 pt-2 space-y-1 font-sans text-[11px]">
                        <div className="flex justify-between text-bento-text/75">
                          <span>Client :</span>
                          <span className="font-bold text-bento-text">{bookingDetails.customerName}</span>
                        </div>
                        <div className="flex justify-between text-bento-text/75">
                          <span>Tél :</span>
                          <span className="font-semibold text-bento-text">{bookingDetails.customerPhone}</span>
                        </div>
                        <div className="flex justify-between text-bento-text/75">
                          <span>Tenue :</span>
                          <span className="font-semibold text-bento-text">{dress.name}</span>
                        </div>
                        <div className="flex justify-between text-bento-text/75">
                          <span>Taille :</span>
                          <span className="font-bold text-bento-gold bg-white px-2 py-0.5 rounded-none border border-bento-gold/15">{bookingDetails.size}</span>
                        </div>
                        <div className="flex justify-between text-bento-text/75">
                          <span>Date Réservée :</span>
                          <span className="font-bold text-bento-gold">
                            {formattedDate}
                          </span>
                        </div>
                        {formattedFittingDate && (
                          <div className="flex justify-between text-bento-text/75 bg-emerald-50 px-2 py-1 border border-emerald-100/50 mt-1">
                            <span className="text-emerald-800 font-bold uppercase tracking-wide text-[9px]">Jour de Test :</span>
                            <span className="font-bold text-emerald-800">
                              {formattedFittingDate}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-dashed border-bento-gold/30 pt-1.5 flex justify-between items-center text-xs font-sans">
                        <span className="font-bold text-bento-text/70">Acompte Payé :</span>
                        <span className="font-mono font-extrabold text-emerald-600">
                          {dress.depositAmount.toLocaleString()} DZD
                        </span>
                      </div>

                      {/* ALARME BANNER */}
                      <div className="border-t border-dashed border-bento-gold/20 pt-2 space-y-2 font-sans text-[10px]">
                        <div className="bg-emerald-50 text-emerald-800 p-2 border border-emerald-100 flex flex-col gap-1">
                          <p className="font-bold uppercase tracking-wider text-[8.5px] flex items-center gap-1 text-emerald-700">
                            🚨 Alarme de Réservation Activée :
                          </p>
                          <p>
                            • E-mail d'alerte : <strong className="font-bold">{adminEmail}</strong>
                          </p>
                          <p>
                            • WhatsApp d'alerte : <strong className="font-bold">{adminWhatsapp}</strong>
                          </p>
                          {teamWithAlarms.length > 0 && (
                            <p>
                              • Équipe : <strong className="font-bold">{teamWithAlarms.map(t => `${t.name} (${t.emailAlarm})`).join(', ')}</strong>
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 justify-center pt-0.5">
                          <a
                            href={whatsappLink}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-[8px] px-2.5 py-1.5 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            WhatsApp Alerte Administrateur
                          </a>
                          <a
                            href={emailLink}
                            className="bg-[#3D3434] hover:bg-black text-white font-bold uppercase tracking-wider text-[8px] px-2.5 py-1.5 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            E-mail Alerte Équipe
                          </a>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleComplete}
                      className="w-full bg-bento-dark hover:bg-black text-white font-sans uppercase tracking-widest text-[9px] py-3.5 rounded-none shadow-sm cursor-pointer font-bold transition-colors"
                    >
                      Fermer & Terminer la réservation
                    </button>
                  </div>
                );
              })()
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
