import React, { useState } from 'react';
import { Calendar as CalendarIcon, User, Phone, Mail, FileText, CheckCircle, Clock } from 'lucide-react';
import { Dress, Booking } from '../types';
import { motion } from 'motion/react';

interface BookingCalendarProps {
  dress: Dress;
  existingBookings: Booking[];
  onInitiatePayment: (bookingDetails: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    date: string;
    fittingDate?: string;
    size: string;
    notes: string;
  }) => void;
}

export default function BookingCalendar({ dress, existingBookings, onInitiatePayment }: BookingCalendarProps) {
  // Date selection state
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [selectedFittingDateStr, setSelectedFittingDateStr] = useState<string>('');
  const [dateSelectionMode, setDateSelectionMode] = useState<'event' | 'fitting'>('event');
  
  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedSize, setSelectedSize] = useState(dress.sizes[0] || 'M');
  const [notes, setNotes] = useState('');
  
  // Validation message
  const [errorMsg, setErrorMsg] = useState('');

  // Months names in French
  const MONTHS_FR = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Get total days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Check if a date is in the past
  const isDateInPast = (day: number) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    const comparisonDate = new Date();
    comparisonDate.setHours(0, 0, 0, 0);
    return checkDate < comparisonDate;
  };

  // Format date to YYYY-MM-DD
  const formatDateString = (day: number) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${currentYear}-${monthStr}-${dayStr}`;
  };

  // Check if a date is already booked for this specific dress
  const isDateAlreadyBooked = (day: number) => {
    const dateStr = formatDateString(day);
    return existingBookings.some(
      (b) => b.dressId === dress.id && b.date === dateStr && b.status === 'confirmed'
    );
  };

  const handleDateClick = (day: number) => {
    if (isDateInPast(day)) return;
    const dateStr = formatDateString(day);

    if (dateSelectionMode === 'event') {
      if (isDateAlreadyBooked(day)) {
        setErrorMsg('Cette date de location est déjà réservée pour cette tenue.');
        return;
      }
      setSelectedDateStr(dateStr);
    } else {
      setSelectedFittingDateStr(dateStr);
    }
    setErrorMsg('');
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handlePrevMonth = () => {
    const minMonth = today.getMonth();
    const minYear = today.getFullYear();
    
    if (currentYear === minYear && currentMonth === minMonth) {
      // Don't go back further than current month
      return;
    }

    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedDateStr) {
      setErrorMsg('Veuillez sélectionner une date sur le calendrier.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('Veuillez saisir votre nom complet.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('Veuillez saisir un numéro de téléphone valide.');
      return;
    }
    if (!customerEmail.trim()) {
      setErrorMsg('Veuillez saisir une adresse e-mail.');
      return;
    }

    // Call checkout / payment initiation
    onInitiatePayment({
      customerName,
      customerPhone,
      customerEmail,
      date: selectedDateStr,
      fittingDate: selectedFittingDateStr || undefined,
      size: selectedSize,
      notes
    });
  };

  // Generate calendar days
  const calendarCells = [];
  // Empty slots for days of preceding month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="p-2"></div>);
  }

  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDateString(day);
    const isPast = isDateInPast(day);
    const isBooked = isDateAlreadyBooked(day);
    const isSelectedEvent = selectedDateStr === dateStr;
    const isSelectedFitting = selectedFittingDateStr === dateStr;

    let cellClass = "p-2 text-center text-sm rounded-none relative cursor-pointer transition-all duration-200 ";
    
    if (isPast) {
      cellClass += "text-bento-text/25 cursor-not-allowed bg-bento-bg/50";
    } else if (isSelectedEvent) {
      cellClass += "bg-bento-gold text-white font-bold shadow-xs scale-100";
    } else if (isSelectedFitting) {
      cellClass += "bg-emerald-600 text-white font-bold shadow-xs scale-100";
    } else if (isBooked) {
      cellClass += "text-rose-400 bg-rose-50 border border-rose-100 cursor-not-allowed font-medium line-through";
    } else {
      cellClass += "text-bento-text hover:bg-bento-rose hover:text-bento-gold border border-transparent";
    }

    calendarCells.push(
      <button
        key={`day-${day}`}
        type="button"
        disabled={isPast || (dateSelectionMode === 'event' && isBooked)}
        onClick={() => handleDateClick(day)}
        className={cellClass}
      >
        <span>{day}</span>
        {isBooked && !isSelectedFitting && (
          <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-rose-500 rounded-none" />
        )}
        {!isPast && !isBooked && !isSelectedEvent && !isSelectedFitting && (
          <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-none opacity-40" />
        )}
      </button>
    );
  }

  return (
    <div id="booking-calendar-module" className="bg-white p-5 rounded-none border border-bento-gold/20 shadow-sm">
      <h3 className="text-base font-serif font-light text-bento-text uppercase tracking-wider mb-4 flex items-center gap-2">
        <CalendarIcon className="w-4.5 h-4.5 text-bento-gold" /> Réserver cette tenue
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Date Fields and Calendar Selection Mode */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Location Date Field */}
            <button
              type="button"
              onClick={() => setDateSelectionMode('event')}
              className={`p-2.5 text-left border flex flex-col justify-between transition-all rounded-none cursor-pointer ${
                dateSelectionMode === 'event'
                  ? 'border-bento-gold bg-bento-rose shadow-xs'
                  : 'border-bento-gold/15 bg-white hover:border-bento-gold/40'
              }`}
            >
              <span className="text-[9px] uppercase tracking-wider text-bento-text/50 font-bold font-sans">
                📅 Date de Location (Événement) *
              </span>
              <span className="text-xs font-semibold text-bento-text mt-0.5">
                {selectedDateStr 
                  ? new Date(selectedDateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'Cliquez pour choisir'
                }
              </span>
            </button>

            {/* Fitting Date Field */}
            <button
              type="button"
              onClick={() => setDateSelectionMode('fitting')}
              className={`p-2.5 text-left border flex flex-col justify-between transition-all rounded-none cursor-pointer ${
                dateSelectionMode === 'fitting'
                  ? 'border-bento-gold bg-bento-rose shadow-xs'
                  : 'border-bento-gold/15 bg-white hover:border-bento-gold/40'
              }`}
            >
              <span className="text-[9px] uppercase tracking-wider text-bento-text/50 font-bold font-sans flex items-center gap-1">
                👗 Jour d'Essai / de Test <span className="text-[8px] bg-bento-gold/10 text-bento-gold px-1.5 py-0.5 rounded-none font-normal uppercase tracking-normal">Optionnel</span>
              </span>
              <span className="text-xs font-semibold text-bento-text mt-0.5">
                {selectedFittingDateStr 
                  ? new Date(selectedFittingDateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'Cliquez pour choisir'
                }
              </span>
            </button>
          </div>

          <p className="text-[10px] text-bento-text/60 italic font-sans px-1">
            💡 {dateSelectionMode === 'event' 
              ? 'Choisissez le jour de votre événement ou de début de location sur le calendrier.' 
              : 'Choisissez le jour où vous souhaitez venir faire les essais et les mesures en boutique.'}
          </p>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-3 bg-bento-rose p-2.5 rounded-none border border-bento-gold/15">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="px-2 py-1 text-[10px] uppercase tracking-wider text-bento-text hover:text-bento-gold font-sans font-bold transition-colors cursor-pointer"
              >
                Précédent
              </button>
              <span className="font-serif font-light text-bento-text text-sm uppercase tracking-wider">
                {MONTHS_FR[currentMonth]} {currentYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="px-2 py-1 text-[10px] uppercase tracking-wider text-bento-text hover:text-bento-gold font-sans font-bold transition-colors cursor-pointer"
              >
                Suivant
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAYS_FR.map((day) => (
                <span key={day} className="text-[10px] font-semibold text-bento-text/40 uppercase py-1 font-sans">
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 bg-bento-rose/25 p-2 rounded-none border border-bento-gold/15">
              {calendarCells}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-[10px] text-bento-text/60 px-1 font-sans">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-none inline-block" /> Libre
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-rose-400 rounded-none inline-block" /> Réservé
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-bento-gold rounded-none inline-block" /> Date Location
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-600 rounded-none inline-block" /> Jour de Test
              </span>
            </div>
          </div>
        </div>

        {/* Step 2: Size Picker */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-bento-text/55 font-bold mb-2 font-sans">
            Sélectionner la Taille
          </label>
          <div className="flex flex-wrap gap-2">
            {dress.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 text-xs rounded-none border transition-all cursor-pointer font-sans ${
                  selectedSize === size
                    ? 'border-bento-gold bg-bento-rose text-bento-gold font-bold'
                    : 'border-bento-gold/15 text-bento-text hover:border-bento-gold/50 hover:bg-bento-rose'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Customer Details */}
        <div className="space-y-3 pt-4 border-t border-bento-gold/15">
          <label className="block text-[10px] uppercase tracking-widest text-bento-text/55 font-bold font-sans">
            Vos informations de contact
          </label>

          <div className="relative">
            <User className="absolute left-3 top-3.5 w-4 h-4 text-bento-text/40" />
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nom et Prénom complet"
              className="w-full text-xs pl-9 pr-4 py-3 border border-bento-gold/20 rounded-none focus:outline-none focus:border-bento-gold transition-colors font-sans bg-bento-rose/10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-4 h-4 text-bento-text/40" />
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="N° de Téléphone (ex: 0550...)"
                className="w-full text-xs pl-9 pr-4 py-3 border border-bento-gold/20 rounded-none focus:outline-none focus:border-bento-gold transition-colors font-sans bg-bento-rose/10"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-bento-text/40" />
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Adresse e-mail"
                className="w-full text-xs pl-9 pr-4 py-3 border border-bento-gold/20 rounded-none focus:outline-none focus:border-bento-gold transition-colors font-sans bg-bento-rose/10"
              />
            </div>
          </div>

          <div className="relative">
            <FileText className="absolute left-3 top-3.5 w-4 h-4 text-bento-text/40" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes ou ajustements spécifiques (facultatif)"
              rows={2}
              className="w-full text-xs pl-9 pr-4 py-3 border border-bento-gold/20 rounded-none focus:outline-none focus:border-bento-gold transition-colors font-sans bg-bento-rose/10"
            />
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-bento-rose p-4 rounded-none border border-bento-gold/20 text-xs space-y-2 font-sans">
          <div className="flex justify-between text-bento-text/75">
            <span>Prix de la location (par jour) :</span>
            <span className="font-semibold text-bento-text">
              {dress.pricePerDay.toLocaleString()} DZD
            </span>
          </div>
          <div className="flex justify-between text-bento-gold font-bold border-t border-bento-gold/15 pt-2">
            <span className="flex items-center gap-1 uppercase tracking-wider text-[10px]">
              Acompte en ligne requis :
              <span className="group relative">
                <span className="cursor-help text-[10px] text-bento-gold/60 underline font-normal">(?)</span>
                <span className="pointer-events-none absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-bento-dark text-white text-[9px] p-2 rounded-none shadow-md opacity-0 group-hover:opacity-100 transition-opacity w-48 text-center font-normal uppercase tracking-normal">
                  L'acompte valide la réservation. Le solde sera réglé à la boutique lors de la récupération.
                </span>
              </span>
            </span>
            <span className="text-sm font-serif font-light">{dress.depositAmount.toLocaleString()} DZD</span>
          </div>
        </div>

        {/* Submit */}
        {errorMsg && (
          <p className="text-xs text-rose-600 font-semibold text-center bg-rose-50 p-2 rounded-none border border-rose-100 font-sans">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-bento-gold hover:bg-bento-gold-dark text-white font-sans uppercase tracking-[0.2em] text-[10px] py-4 rounded-none shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer font-bold"
        >
          <CheckCircle className="w-4 h-4" />
          Procéder au paiement de l'acompte ({dress.depositAmount.toLocaleString()} DZD)
        </button>
      </form>
    </div>
  );
}
