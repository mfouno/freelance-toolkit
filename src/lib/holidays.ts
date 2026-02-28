import { format, isSameDay } from "date-fns";

// Easter calculation (Computus)
function getEaster(year: number): Date {
    const f = Math.floor,
        G = year % 19,
        C = f(year / 100),
        H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
        I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
        J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
        L = I - J,
        month = 3 + f((L + 40) / 44),
        day = L + 28 - 31 * f(month / 4);
    return new Date(year, month - 1, day);
}

export function getFrenchHolidays(year: number): { date: Date; name: string }[] {
    const easter = getEaster(year);

    const easterMonday = new Date(easter);
    easterMonday.setDate(easter.getDate() + 1);

    const ascension = new Date(easter);
    ascension.setDate(easter.getDate() + 39);

    const pentecostMonday = new Date(easter);
    pentecostMonday.setDate(easter.getDate() + 50);

    return [
        { date: new Date(year, 0, 1), name: "Jour de l'An" },
        { date: easterMonday, name: "Lundi de Pâques" },
        { date: new Date(year, 4, 1), name: "Fête du Travail" },
        { date: new Date(year, 4, 8), name: "Victoire 1945" },
        { date: ascension, name: "Ascension" },
        { date: pentecostMonday, name: "Lundi de Pentecôte" },
        { date: new Date(year, 6, 14), name: "Fête Nationale" },
        { date: new Date(year, 7, 15), name: "Assomption" },
        { date: new Date(year, 10, 1), name: "Toussaint" },
        { date: new Date(year, 10, 11), name: "Armistice 1918" },
        { date: new Date(year, 11, 25), name: "Noël" },
    ];
}

export function getHolidayInfo(date: Date, holidays: { date: Date; name: string }[]) {
    return holidays.find((h) => isSameDay(h.date, date));
}
