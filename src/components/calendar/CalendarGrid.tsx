"use client";

import { useState, useMemo } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    addMonths,
    subMonths,
    isWeekend,
    isSameDay
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Euro, Check } from "lucide-react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { getFrenchHolidays, getHolidayInfo } from "@/lib/holidays";

export function CalendarGrid() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const { workDays, setWorkDay, removeWorkDay, salaries = {}, setSalary, paidRevenues = {}, setPaidRevenue } = useAppStore();

    const currentMonthStr = format(currentDate, "yyyy-MM");

    // Salaire
    const currentMonthSalary = salaries[currentMonthStr] || 0;
    const [isEditingSalary, setIsEditingSalary] = useState(false);
    const [salaryInput, setSalaryInput] = useState(currentMonthSalary);

    // CA Payé
    const currentMonthPaidRev = paidRevenues[currentMonthStr] || 0;
    const [isEditingPaidRev, setIsEditingPaidRev] = useState(false);
    const [paidRevInput, setPaidRevInput] = useState(currentMonthPaidRev);

    const [tjmInput, setTjmInput] = useState(650);
    const [clientInput, setClientInput] = useState("TF1");

    // Construire une liste unique des clients déjà saisis
    const recentClients = useMemo(() => {
        const clientsSet = new Set<string>();
        clientsSet.add("TF1"); // Toujours proposer TF1 par défaut
        Object.values(workDays).forEach(workDay => {
            if (workDay.clientId && workDay.clientId !== "Non travaillé") {
                clientsSet.add(workDay.clientId);
            }
        });
        return Array.from(clientsSet);
    }, [workDays]);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const holidays = useMemo(() => getFrenchHolidays(currentDate.getFullYear()), [currentDate]);

    const toggleDateSelection = (date: Date) => {
        // Si la date est déjà facturée, on peut proposer de la supprimer
        const dateStr = format(date, 'yyyy-MM-dd');
        if (workDays[dateStr]) {
            if (confirm(`Voulez-vous supprimer la facturation du ${format(date, 'dd/MM/yyyy')} ?`)) {
                removeWorkDay(dateStr);
            }
            return;
        }

        const isSelected = selectedDates.some(d => isSameDay(d, date));
        if (isSelected) {
            setSelectedDates(selectedDates.filter(d => !isSameDay(d, date)));
        } else {
            setSelectedDates([...selectedDates, date]);
            // Scroll down sur mobile au premier clic pour dégager la vue sous le panneau
            if (selectedDates.length === 0 && window.innerWidth < 768) {
                setTimeout(() => {
                    window.scrollBy({ top: 600, behavior: "smooth" });
                }, 100);
            }
        }
    };

    const generateInvoice = () => {
        if (selectedDates.length === 0) return;

        selectedDates.forEach(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            setWorkDay(dateStr, {
                date: dateStr,
                tjm: tjmInput,
                clientId: clientInput,
            });
        });

        setSelectedDates([]);
    };

    const markAsNotWorked = () => {
        if (selectedDates.length === 0) return;

        selectedDates.forEach(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            setWorkDay(dateStr, {
                date: dateStr,
                tjm: 0,
                clientId: "Non travaillé",
            });
        });

        setSelectedDates([]);
    };

    return (
        <div className={cn("flex flex-col md:flex-row md:items-start gap-6 transition-all duration-300", selectedDates.length > 0 ? "pb-[450px] md:pb-4" : "pb-4")}>

            <div className="flex-1 space-y-4">
                {/* Header Mois */}
                <div className="flex items-center justify-between bg-card p-4 rounded-xl shadow-sm border">
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-muted rounded-full">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-lg font-semibold capitalize">
                        {format(currentDate, "MMMM yyyy", { locale: fr })}
                    </span>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-muted rounded-full">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    {/* Bandeau CA Payé */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">CA Payé ({format(currentDate, "MMM yy", { locale: fr })})</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">Montant HT réellement encaissé ce mois-ci.</p>
                        </div>
                        {isEditingPaidRev ? (
                            <div className="flex items-center space-x-2">
                                <input
                                    autoFocus
                                    type="number"
                                    value={paidRevInput}
                                    onChange={(e) => setPaidRevInput(Number(e.target.value))}
                                    className="w-24 text-sm bg-background border rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                                <button
                                    onClick={() => {
                                        setPaidRevenue(currentMonthStr, paidRevInput);
                                        setIsEditingPaidRev(false);
                                    }}
                                    className="bg-emerald-500 text-white p-1.5 rounded-md hover:opacity-90"
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    setPaidRevInput(currentMonthPaidRev);
                                    setIsEditingPaidRev(true);
                                }}
                                className="text-lg font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                            >
                                {currentMonthPaidRev > 0 ? `${currentMonthPaidRev} €` : "0 €"}
                            </button>
                        )}
                    </div>

                    {/* Bandeau Salaire du Mois */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-semibold text-primary">Salaire versé ({format(currentDate, "MMM yy", { locale: fr })})</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">Montant net que vous vous êtes versé ce mois-ci.</p>
                        </div>
                        {isEditingSalary ? (
                            <div className="flex items-center space-x-2">
                                <input
                                    autoFocus
                                    type="number"
                                    value={salaryInput}
                                    onChange={(e) => setSalaryInput(Number(e.target.value))}
                                    className="w-24 text-sm bg-background border rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
                                />
                                <button
                                    onClick={() => {
                                        setSalary(currentMonthStr, salaryInput);
                                        setIsEditingSalary(false);
                                    }}
                                    className="bg-primary text-primary-foreground p-1.5 rounded-md hover:opacity-90"
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    setSalaryInput(currentMonthSalary);
                                    setIsEditingSalary(true);
                                }}
                                className="text-lg font-bold text-primary hover:underline"
                            >
                                {currentMonthSalary > 0 ? `${currentMonthSalary} €` : "0 €"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Grille Jours */}
                <div className="grid grid-cols-7 gap-2">
                    {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-muted-foreground pb-2">
                            {day}
                        </div>
                    ))}

                    {/* Espaces vides avant le premier jour du mois */}
                    {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-14" />
                    ))}

                    {daysInMonth.map((date) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const isSelected = selectedDates.some(d => isSameDay(d, date));
                        const workDay = workDays[dateStr];
                        const isBilled = workDay && workDay.tjm > 0;
                        const isNotWorked = workDay && workDay.tjm === 0;
                        const holidayInfo = getHolidayInfo(date, holidays);
                        const isWkd = isWeekend(date);
                        const isOff = isWkd || !!holidayInfo;

                        // Détermination de la couleur de fond
                        let bgClass = "bg-white dark:bg-zinc-900 border border-border shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800";
                        let textClass = "text-foreground";

                        if (isSelected) {
                            bgClass = "ring-2 ring-primary border-primary bg-primary/20";
                        } else if (isBilled) {
                            bgClass = "bg-emerald-500 border-transparent";
                            textClass = "text-white";
                        } else if (isNotWorked) {
                            bgClass = "bg-red-500 border-transparent";
                            textClass = "text-white";
                        } else if (isOff) {
                            bgClass = "bg-zinc-200 dark:bg-zinc-800 border-transparent";
                            textClass = "text-zinc-900 dark:text-zinc-300";
                        }

                        return (
                            <button
                                key={dateStr}
                                onClick={() => toggleDateSelection(date)}
                                className={cn(
                                    "h-14 rounded-lg flex flex-col items-center justify-center relative transition-colors overflow-hidden",
                                    bgClass,
                                    isToday(date) && !isBilled && !isNotWorked && "ring-1 ring-primary font-bold"
                                )}
                            >
                                <span className={cn(
                                    "text-sm",
                                    textClass,
                                    isToday(date) && isBilled && "underline decoration-emerald-100 decoration-2 underline-offset-2",
                                    (isBilled || isNotWorked) && "font-bold"
                                )}>
                                    {format(date, 'd')}
                                </span>

                                {isBilled && (
                                    <span className="text-[10px] text-emerald-100 font-semibold mt-0.5">
                                        {workDay.tjm}€
                                    </span>
                                )}
                                {isNotWorked && (
                                    <span className="text-[10px] text-red-100 font-bold mt-0.5">
                                        OFF
                                    </span>
                                )}
                                {holidayInfo && !workDay && (
                                    <span className="text-[8px] text-muted-foreground leading-tight px-1 truncate w-full text-center mt-1 opacity-80">
                                        {holidayInfo.name}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Barre d'action de Facturation */}
            {selectedDates.length > 0 && (
                <div className="fixed bottom-20 left-4 right-4 md:static md:bottom-auto md:left-auto md:right-auto md:w-80 md:shrink-0 bg-card shadow-lg rounded-2xl p-4 border animate-in slide-in-from-bottom-5 md:slide-in-from-right-5 md:animate-none z-50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-sm">{selectedDates.length} jour(s) sélectionné(s)</h3>
                        <span className="text-sm font-bold text-primary">{selectedDates.length * tjmInput} €</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-1 gap-3 mb-4">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">TJM HT (€)</label>
                            <input
                                type="number"
                                value={tjmInput}
                                onChange={(e) => setTjmInput(Number(e.target.value))}
                                className="w-full text-sm bg-muted rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Client</label>
                            <div className="relative">
                                <select
                                    value={clientInput}
                                    onChange={(e) => {
                                        if (e.target.value !== "NEW") {
                                            setClientInput(e.target.value);
                                        } else {
                                            const nouv = prompt("Nom du nouveau client :");
                                            if (nouv) setClientInput(nouv);
                                        }
                                    }}
                                    className="w-full text-sm bg-muted rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary appearance-none pr-8"
                                >
                                    {recentClients.map(client => (
                                        <option key={client} value={client}>{client}</option>
                                    ))}
                                    {/* Si le client tapé manuellement (via le prompt) n'est pas dans la liste, on l'affiche quand même ici provisoirement */}
                                    {!recentClients.includes(clientInput) && (
                                        <option value={clientInput}>{clientInput}</option>
                                    )}
                                    <option value="NEW" className="font-bold text-primary">+ Nouveau client...</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={generateInvoice}
                            className="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-3 flex items-center justify-center space-x-2 shadow-sm hover:opacity-90"
                        >
                            <Check className="h-5 w-5" />
                            <span>Valider {selectedDates.length} jour(s)</span>
                        </button>

                        <button
                            onClick={markAsNotWorked}
                            className="w-full bg-secondary text-secondary-foreground text-sm font-semibold rounded-xl py-2 flex items-center justify-center space-x-2 shadow-sm hover:opacity-90"
                        >
                            <span>Marquer comme off ({selectedDates.length} j)</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
