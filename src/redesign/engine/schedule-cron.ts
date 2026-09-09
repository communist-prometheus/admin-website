/**
 * The dispatch schedule is stored as a 5-field crontab, but the editor
 * sets it as "какой день недели, во сколько". This translates between
 * the two, and refuses (rather than mangles) any crontab the day/time
 * pair cannot express — those stay editable as raw cron.
 */

/** A weekly schedule as the screen edits it. */
export interface Weekly {
  /** 0 = Sunday … 6 = Saturday, matching crontab's day-of-week field. */
  readonly weekday: number;
  /** `HH:MM`, 24-hour, as an `<input type="time">` value. */
  readonly time: string;
}

/** Weekdays in reading order — the week starts on Monday here, not Sunday. */
export const WEEKDAYS: readonly { readonly value: number; readonly label: string }[] = [
  { value: 1, label: 'понедельник' },
  { value: 2, label: 'вторник' },
  { value: 3, label: 'среда' },
  { value: 4, label: 'четверг' },
  { value: 5, label: 'пятница' },
  { value: 6, label: 'суббота' },
  { value: 0, label: 'воскресенье' },
];

const NUM = /^\d{1,2}$/;

const inRange = (raw: string, max: number): number | undefined => {
  if (!NUM.test(raw)) return undefined;
  const n = Number(raw);
  return n <= max ? n : undefined;
};

const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * Read a crontab as a day-of-week + time pair.
 * @param cron 5-field crontab string.
 * @returns The pair, or undefined when the expression is richer than that.
 */
export const parseWeekly = (cron: string): Weekly | undefined => {
  const [min, hour, dom, mon, dow, ...extra] = cron.trim().split(/\s+/);
  if (extra.length > 0 || dow === undefined || dom !== '*' || mon !== '*') return undefined;
  const minute = inRange(min ?? '', 59);
  const h = inRange(hour ?? '', 23);
  const day = inRange(dow, 7);
  if (minute === undefined || h === undefined || day === undefined) return undefined;
  return { weekday: day === 7 ? 0 : day, time: `${pad(h)}:${pad(minute)}` };
};

/**
 * Write a day-of-week + time pair back as a crontab.
 * @param weekday 0 = Sunday … 6 = Saturday.
 * @param time `HH:MM` value from a time input.
 * @returns 5-field crontab string.
 */
export const weeklyCron = (weekday: number, time: string): string => {
  const [h = '0', m = '0'] = time.split(':');
  return `${Number(m)} ${Number(h)} * * ${weekday}`;
};
