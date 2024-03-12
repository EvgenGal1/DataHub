// ^^ различные/помошники

// @Injectable()
export class BasicUtils {
  // вычисление общего времени в фомате минуты:секунды
  async sumDurations(duration1, duration2) {
    const [min1, sec1] = duration1.split(':').map(Number);
    const [min2, sec2] = duration2.split(':').map(Number);

    let totalSeconds = (min1 + min2) * 60 + sec1 + sec2;
    const totalMinutes = Math.floor(totalSeconds / 60);
    totalSeconds %= 60;

    const totalTime = `${totalMinutes}:${
      totalSeconds < 10 ? '0' : ''
    }${totalSeconds}`;
    console.log('sumDurations totalTime : ', totalTime);
    return totalTime;
  }
}
