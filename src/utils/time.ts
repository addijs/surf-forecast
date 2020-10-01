export class TimeUtil {
  public static getUnixTimestampForAFutureDay(days: number): number {
    const currentDay = new Date().getUTCDate();
    return Math.round(new Date().setDate(currentDay + days) / 1000);
  }
}
