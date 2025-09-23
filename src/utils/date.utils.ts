import * as moment from 'moment';
import 'moment/locale/ru';
import * as momentTz from 'moment-timezone';

const TIME_ZONE = 'Europe/Moscow';

export class DateUtils {
  private static initLocale(): void {
    moment.locale('ru');
  }

  static today(): Date {
    return momentTz().tz(TIME_ZONE).toDate();
  }

  static subtractMonths(input: Date, months: number): Date {
    const m: moment.Moment = moment(input);
    return m.subtract(months, 'months').toDate();
  }

  static addMonths(input: Date, months: number): Date {
    const m: moment.Moment = moment(input);
    return m.add(months, 'months').toDate();
  }

  static before(days: number): Date {
    const m = momentTz().tz(TIME_ZONE);
    return m.subtract(days, 'days').toDate();
  }

  static beforeDate(days: number, input: Date): Date {
    const m = moment(input).tz(TIME_ZONE);
    return m.subtract(days, 'days').toDate();
  }

  static buildScheduledDate(dayOfMonth: string, time: string): Date {
    const now = momentTz().tz(TIME_ZONE);

    let date: moment.Moment;
    if (dayOfMonth === 'last') {
      date = now.clone().subtract(1, 'month').endOf('month');
    } else {
      const day = parseInt(dayOfMonth, 10);
      if (isNaN(day) || day < 1 || day > 31) {
        throw new Error(`Неправильное значение dayOfMonth: ${dayOfMonth}`);
      }

      const today = now.date();
      if (day < today) {
        date = now.clone().date(day);
      } else {
        date = now.clone().subtract(1, 'month').date(day);
      }

      const daysInMonth = date.daysInMonth();
      if (day > daysInMonth) {
        throw new Error(`В месяце ${date.format('YYYY-MM')} нет дня ${day}`);
      }
    }

    const parts = time.split(':').map((p) => parseInt(p, 10));
    if (parts.length < 2 || parts.some(isNaN)) {
      throw new Error(`Неправильный формат time: ${time}`);
    }
    const [hour, minute, second = 0] = parts;
    date = date.hour(hour).minute(minute).second(second).millisecond(0);

    return date.toDate();
  }

  static parseDateToNative(
    dateStr: string,
    formatPattern?: string,
    timeZone?: string
  ): Date | null {
    let m: moment.Moment;
    if (formatPattern) {
      m = moment(dateStr, formatPattern, 'ru', true);
    } else {
      m = moment(dateStr);
    }

    if (!m.isValid()) {
      return null;
    }

    if (timeZone) {
      m = momentTz.tz(m.format('YYYY-MM-DDTHH:mm:ss'), timeZone);
    }

    return m.toDate();
  }

  static toMoscowDate(input: Date): Date {
    return moment(input).tz('Europe/Moscow').toDate();
  }

  static getMoscowDayRange(input: Date): { startOfDay: Date; endOfDay: Date } {
    const m = moment(input);
    return {
      startOfDay: new Date(m.tz('Europe/Moscow').startOf('day').toISOString()),
      endOfDay: new Date(m.tz('Europe/Moscow').endOf('day').toISOString())
    };
  }

  static formatNativeDate(
    input: Date | moment.Moment | string,
    formatPattern: string = 'DD MMMM YYYY, HH:mm',
    timeZone?: string
  ): string | null {
    this.initLocale();

    let m: moment.Moment;
    if (moment.isMoment(input)) {
      m = input.clone();
    } else {
      m = moment(input);
    }

    if (!m.isValid()) {
      return null;
    }

    if (timeZone) {
      m = m.tz(timeZone);
    }

    return m.format(formatPattern);
  }

  /**
   * Устанавливает день месяца, но если такого дня нет,
   * берёт последний день этого месяца.
   */
  static setDayClamped(input: Date, day: number): Date {
    const m = moment(input);
    const dim = m.daysInMonth();
    const safeDay = Math.min(day, dim);
    return m.date(safeDay).toDate();
  }
}
