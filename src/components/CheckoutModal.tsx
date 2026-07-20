import React, { useState } from 'react';
import { Store, Copy, Wallet, ShieldCheck, X, Check, Loader2, Sparkles, Award } from 'lucide-react';
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
  
  // Payment option: 'magasin' (Payment in store) or 'baridimob' (Algerian BaridiMob mobile CCP transfer)
  const [selectedMethod, setSelectedMethod] = useState<'magasin' | 'baridimob'>('magasin');
  const [baridiMobTxRef, setBaridiMobTxRef] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("RIP BaridiMob copié avec succès !");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedMethod === 'baridimob' && !baridiMobTxRef.trim()) {
      setErrorMsg("Veuillez saisir votre nom d'expéditeur ou la référence de transfert BaridiMob.");
      return;
    }

    // Process secure validation
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1800); // 1.8s simulation of secure validation logic
  };

  const handleComplete = () => {
    const methodLabel = selectedMethod === 'magasin' 
      ? 'Paiement en magasin' 
      : `BaridiMob (Réf: ${baridiMobTxRef.trim()})`;
    onPaymentSuccess(methodLabel);
    onClose();
    // Reset state
    setIsSuccess(false);
    setBaridiMobTxRef('');
    setSelectedMethod('magasin');
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
              <Wallet className="w-4.5 h-4.5 text-bento-gold animate-pulse" />
              <h2 className="text-sm font-serif font-light text-bento-text uppercase tracking-wider">
                Choix du Règlement de l'Acompte
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
                    <span>Acompte à régler :</span>
                    <span className="font-serif font-light text-sm">{dress.depositAmount.toLocaleString()} DZD</span>
                  </div>
                </div>

                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <Loader2 className="w-10 h-10 text-bento-gold animate-spin" />
                    <p className="text-xs font-semibold text-bento-text uppercase tracking-widest font-sans">
                      Validation de la demande de réservation...
                    </p>
                    <p className="text-[10px] text-bento-text/50 font-sans">
                      Veuillez patienter un court instant.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Method Toggle Buttons */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-bento-text/55 font-bold mb-2 font-sans">
                        Mode de paiement de l'acompte :
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMethod('magasin');
                            setErrorMsg('');
                          }}
                          className={`p-3.5 border flex flex-col items-center justify-center gap-2 rounded-none transition-all cursor-pointer text-center ${
                            selectedMethod === 'magasin'
                              ? 'border-bento-gold bg-bento-rose text-bento-gold font-bold shadow-xs'
                              : 'border-bento-gold/15 bg-white hover:border-bento-gold/40 text-bento-text/70'
                          }`}
                        >
                          <Store className="w-5 h-5 text-bento-gold" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wider">En Magasin</p>
                            <p className="text-[8px] opacity-75 mt-0.5 font-sans">Boutique Tizi Ouzou</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMethod('baridimob');
                            setErrorMsg('');
                          }}
                          className={`p-3.5 border flex flex-col items-center justify-center gap-2 rounded-none transition-all cursor-pointer text-center ${
                            selectedMethod === 'baridimob'
                              ? 'border-bento-gold bg-bento-rose text-bento-gold font-bold shadow-xs'
                              : 'border-bento-gold/15 bg-white hover:border-bento-gold/40 text-bento-text/70'
                          }`}
                        >
                          <Wallet className="w-5 h-5 text-bento-gold" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wider">BaridiMob</p>
                            <p className="text-[8px] opacity-75 mt-0.5 font-sans">Versement CCP instantané</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Conditional Info panels */}
                    {selectedMethod === 'magasin' ? (
                      <div className="bg-bento-rose/40 border border-bento-gold/15 p-4 rounded-none space-y-2 text-xs font-sans">
                        <p className="font-semibold text-bento-text text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-bento-gold" /> Comment régler mon acompte en magasin ?
                        </p>
                        <p className="text-bento-text/75 leading-relaxed">
                          Rendez-vous dans notre boutique <strong className="font-bold text-bento-gold">Coup de Cœur</strong> située à Tizi Ouzou sous 24 heures pour verser l'acompte de <strong>{dress.depositAmount.toLocaleString()} DZD</strong> et bloquer définitivement votre robe.
                        </p>
                        <p className="text-[10px] text-zinc-400 italic">
                          *Passé ce délai de 24h, la tenue sera automatiquement libérée pour d'autres clientes.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-bento-rose/40 border border-bento-gold/15 p-4 rounded-none space-y-3 text-xs font-sans">
                          <p className="font-semibold text-bento-text text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <Wallet className="w-3.5 h-3.5 text-bento-gold" /> Informations de Versement BaridiMob
                          </p>
                          
                          <div className="bg-white border border-bento-gold/10 p-3 space-y-2 font-mono text-[11px]">
                            <div className="flex justify-between items-center text-bento-text/75">
                              <span className="font-sans text-[10px] uppercase tracking-wider text-bento-text/50">Titulaire :</span>
                              <span className="font-bold text-bento-text">HAMDAD KAHINA</span>
                            </div>
                            <div className="flex flex-col gap-1 border-t border-bento-gold/10 pt-2">
                              <span className="font-sans text-[10px] uppercase tracking-wider text-bento-text/50">Numéro RIP :</span>
                              <div className="flex items-center justify-between bg-bento-rose/20 p-2 border border-bento-gold/5 text-bento-text">
                                <span className="font-bold tracking-wider text-[11px] select-all">0079999900234567891245</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard('0079999900234567891245')}
                                  className="p-1 hover:bg-white text-bento-gold hover:text-bento-gold/80 transition-colors cursor-pointer border border-transparent hover:border-bento-gold/20"
                                  title="Copier le RIP"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-bento-text/75 leading-relaxed">
                            Veuillez effectuer un versement de <strong className="font-bold text-bento-gold">{dress.depositAmount.toLocaleString()} DZD</strong> sur l'application BaridiMob, puis saisissez votre nom d'expéditeur ci-dessous pour validation.
                          </p>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-bento-text/50 font-bold mb-1.5 font-sans">
                            Nom de l'expéditeur ou Réf de transfert *
                          </label>
                          <input
                            type="text"
                            required
                            value={baridiMobTxRef}
                            onChange={(e) => setBaridiMobTxRef(e.target.value)}
                            placeholder="Ex: Nom de votre compte BaridiMob"
                            className="w-full text-xs px-3.5 py-3 border border-bento-gold/20 bg-bento-rose/10 rounded-none focus:outline-none focus:border-bento-gold transition-colors font-sans"
                          />
                        </div>
                      </div>
                    )}

                    {errorMsg && (
                      <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-none font-sans text-center">
                        {errorMsg}
                      </p>
                    )}

                    {/* Pay/Reserve Button */}
                    <button
                      type="submit"
                      className="w-full mt-2 bg-bento-gold hover:bg-bento-gold-dark text-white font-sans uppercase tracking-[0.2em] text-[10px] py-4 rounded-none shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer font-bold"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Confirmer ma réservation
                    </button>

                    <div className="flex items-center justify-center gap-2 pt-2 text-[9px] text-bento-text/50 font-sans uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Réseau sécurisé • Coup de Cœur Tizi Ouzou</span>
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
                
                const methodLabel = selectedMethod === 'magasin' ? "En Magasin (Boutique)" : `BaridiMob (${baridiMobTxRef})`;
                
                const messageText = `🔔 NOUVELLE RÉSERVATION - Coup de Cœur Tizi Ouzou\n\n` +
                  `• Client : ${bookingDetails?.customerName}\n` +
                  `• Téléphone : ${bookingDetails?.customerPhone}\n` +
                  `• Tenue : ${dress.name}\n` +
                  `• Taille : ${bookingDetails?.size}\n` +
                  `• Date de location : ${formattedDate}\n` +
                  (formattedFittingDate ? `• Jour d'Essai (Test) : ${formattedFittingDate}\n` : '') +
                  `• Mode de règlement : ${methodLabel}\n` +
                  `• Acompte Requis : ${dress.depositAmount.toLocaleString()} DZD\n\n` +
                  `L'alarme de réservation a été déclenchée.`;
                
                const whatsappLink = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(messageText)}`;

                const adminEmail = settings?.notificationEmail || 'karimchabni395@gmail.com';
                const teamWithAlarms = team?.filter(t => t.emailAlarm) || [];
                const teamEmails = teamWithAlarms.map(t => t.emailAlarm).join(',');
                const ccParam = teamEmails ? `?cc=${teamEmails}` : '';
                
                const emailSubject = `🔔 Alarme Réservation - Coup de Cœur - ${bookingDetails?.customerName}`;
                const emailBody = `Bonjour,\n\n` +
                  `Une nouvelle réservation vient d'être initiée sur le site de la boutique Coup de Cœur à Tizi Ouzou :\n\n` +
                  `• Nom de la cliente : ${bookingDetails?.customerName}\n` +
                  `• Numéro de téléphone : ${bookingDetails?.customerPhone}\n` +
                  `• Adresse e-mail : ${bookingDetails?.customerEmail}\n` +
                  `• Tenue louée : ${dress.name}\n` +
                  `• Taille sélectionnée : ${bookingDetails?.size}\n` +
                  `• Date de location : ${formattedDate}\n` +
                  (formattedFittingDate ? `• Jour d'Essai (Test) en boutique : ${formattedFittingDate}\n` : '') +
                  `• Mode de règlement choisi : ${methodLabel}\n` +
                  `• Acompte à payer : ${dress.depositAmount.toLocaleString()} DZD\n\n` +
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
                        Réservation Enregistrée <Sparkles className="w-4 h-4 text-bento-gold animate-pulse" />
                      </h3>
                      <p className="text-[11px] text-bento-text/70 mt-0.5 font-sans">
                        {selectedMethod === 'magasin' 
                          ? `Acompte de ${dress.depositAmount.toLocaleString()} DZD à régler en boutique sous 24h.`
                          : `Votre acompte de ${dress.depositAmount.toLocaleString()} DZD via BaridiMob est enregistré.`
                        }
                      </p>
                    </div>

                    {/* Simulated Ticket Receipt */}
                    <div className="w-full bg-bento-rose/40 border border-dashed border-bento-gold/30 p-4 rounded-none text-left text-xs space-y-2 relative">
                      
                      <div className="flex justify-between font-mono text-[9px] text-bento-text/40 pt-1 tracking-wider uppercase font-semibold">
                        <span>REÇU DE RÉSERVATION</span>
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
                        <div className="flex justify-between text-bento-text/75 border-t border-bento-gold/10 pt-1.5 mt-1">
                          <span>Règlement :</span>
                          <span className="font-bold text-bento-text">
                            {selectedMethod === 'magasin' ? '🛍️ En Magasin' : '📱 BaridiMob'}
                          </span>
                        </div>
                        {selectedMethod === 'baridimob' && (
                          <div className="flex justify-between text-bento-text/75 text-[10px] bg-white p-1.5 border border-bento-gold/5">
                            <span>Expéditeur :</span>
                            <span className="font-mono text-bento-gold font-bold">{baridiMobTxRef}</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-dashed border-bento-gold/30 pt-1.5 flex justify-between items-center text-xs font-sans">
                        <span className="font-bold text-bento-text/70">Acompte à régler :</span>
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
