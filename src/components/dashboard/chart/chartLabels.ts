const TZ = 'America/Bahia';

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: TZ,
});

const timeFmt = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TZ,
});

const fullFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TZ,
});

export const formatShortDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatTime = (iso: string) => timeFmt.format(new Date(iso));
export const formatFullDateTime = (iso: string) => fullFmt.format(new Date(iso));

interface LabelInput {
  point: string;
  datetime: string;
}

/**
 * Gera o rótulo do eixo X:
 * - um único ponto: apenas a data (com hora quando houver mais de uma coleta no dia)
 * - vários pontos: "PONTO · dd/MM"
 */
export const buildAxisLabels = <T extends LabelInput>(items: T[]): string[] => {
  const uniquePoints = new Set(items.map(i => i.point));
  const multiplePoints = uniquePoints.size > 1;

  const dayCounts = new Map<string, number>();
  items.forEach((item) => {
    const key = `${item.point}|${formatShortDate(item.datetime)}`;
    dayCounts.set(key, (dayCounts.get(key) || 0) + 1);
  });

  return items.map((item) => {
    const date = formatShortDate(item.datetime);
    const key = `${item.point}|${date}`;
    const withTime = (dayCounts.get(key) || 0) > 1 ? `${date} ${formatTime(item.datetime)}` : date;
    return multiplePoints ? `${item.point} · ${withTime}` : withTime;
  });
};
