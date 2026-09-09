import { describe, it, expect } from 'vitest';
import { parseWeekly, weeklyCron, WEEKDAYS } from './schedule-cron.ts';

/*
 * The editor thinks "суббота, 12:00", not "0 12 * * 6". The screen edits
 * that pair; anything the pair cannot express stays editable as raw cron
 * so a hand-tuned schedule is never silently rewritten.
 */
describe('a weekly schedule read as a day and a time', () => {
  it('reads the saved Saturday-noon schedule', () => {
    expect(parseWeekly('0 12 * * 6')).toEqual({ weekday: 6, time: '12:00' });
  });

  it('pads the hour and minute the way a time input expects', () => {
    expect(parseWeekly('5 9 * * 1')).toEqual({ weekday: 1, time: '09:05' });
  });

  it('reads Sunday written as 0 and as 7', () => {
    expect(parseWeekly('0 8 * * 0')?.weekday).toBe(0);
    expect(parseWeekly('0 8 * * 7')?.weekday).toBe(0);
  });

  it('refuses anything the day/time pair cannot express', () => {
    expect(parseWeekly('*/15 * * * *')).toBeUndefined();
    expect(parseWeekly('0 12 1 * *')).toBeUndefined();
    expect(parseWeekly('0 12 * * 1,4')).toBeUndefined();
    expect(parseWeekly('nonsense')).toBeUndefined();
  });
});

describe('writing the pair back as cron', () => {
  it('produces the crontab the worker matches on', () => {
    expect(weeklyCron(6, '12:00')).toBe('0 12 * * 6');
    expect(weeklyCron(0, '09:05')).toBe('5 9 * * 0');
  });

  it('round-trips every weekday', () => {
    for (const day of WEEKDAYS) {
      expect(parseWeekly(weeklyCron(day.value, '07:30'))).toEqual({
        weekday: day.value,
        time: '07:30',
      });
    }
  });

  it('names the days in the order the editor reads a week', () => {
    expect(WEEKDAYS.map((d) => d.value)).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });
});
