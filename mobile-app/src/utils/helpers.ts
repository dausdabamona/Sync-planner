export function formatDate(date: Date): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentHour(): number {
  return new Date().getHours();
}

export function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

export function getGreeting(): string {
  const hour = getCurrentHour();
  if (hour < 10) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Get current quarter string like "2026-Q1" */
export function getQuarter(date?: Date): string {
  const d = date || new Date();
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `${d.getFullYear()}-Q${q}`;
}

/** Get quarter label like "Q1 2026 (Jan-Mar)" */
export function getQuarterLabel(quarter: string): string {
  const [year, q] = quarter.split('-');
  const ranges: Record<string, string> = { Q1: 'Jan-Mar', Q2: 'Apr-Jun', Q3: 'Jul-Sep', Q4: 'Okt-Des' };
  return `${q} ${year} (${ranges[q] || ''})`;
}

/** Get current month string like "2026-02" */
export function getMonth(date?: Date): string {
  const d = date || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Get month label like "Februari 2026" */
export function getMonthLabel(month: string): string {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const [year, m] = month.split('-');
  return `${months[parseInt(m) - 1]} ${year}`;
}

/** Get Monday of current week as "YYYY-MM-DD" */
export function getWeekStart(date?: Date): string {
  const d = date || new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
}

/** Get week label like "Minggu 6 (3-9 Feb)" */
export function getWeekLabel(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const startOfYear = new Date(start.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((start.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `Minggu ${weekNum} (${start.getDate()}-${end.getDate()} ${months[end.getMonth()]})`;
}

/** Get months in a quarter */
export function getMonthsInQuarter(quarter: string): string[] {
  const [year, q] = quarter.split('-');
  const qNum = parseInt(q.replace('Q', ''));
  const startMonth = (qNum - 1) * 3 + 1;
  return [
    `${year}-${String(startMonth).padStart(2, '0')}`,
    `${year}-${String(startMonth + 1).padStart(2, '0')}`,
    `${year}-${String(startMonth + 2).padStart(2, '0')}`,
  ];
}
