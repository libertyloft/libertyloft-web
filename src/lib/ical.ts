const decodeHtmlEntities = (value = "") =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const normalizeText = (value = "") =>
  decodeHtmlEntities(
    value
      .replace(/\\n/g, " ")
      .replace(/\\,/g, ",")
      .replace(/\\;/g, ";")
      .replace(/\s+/g, " ")
      .trim(),
  );

const sanitizeDescription = (value = "") =>
  decodeHtmlEntities(
    value
      .replace(/\\n/g, "\n")
      .replace(/\\,/g, ",")
      .replace(/\\;/g, ";")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();

const parseDateValue = (line: string) => {
  const value = line.split(":").slice(1).join(":").trim();

  if (!value || value.length < 8) {
    return null;
  }

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6)) - 1;
  const day = Number(value.slice(6, 8));
  const hasTime = value.includes("T");
  const isUtc = value.endsWith("Z");

  if (!hasTime) {
    return {
      date: new Date(Date.UTC(year, month, day, 0, 0, 0, 0)),
      allDay: true,
    };
  }

  const hour = Number(value.slice(9, 11));
  const minute = Number(value.slice(11, 13));
  const second = Number(value.slice(13, 15) || "0");

  if (isUtc) {
    return {
      date: new Date(Date.UTC(year, month, day, hour, minute, second, 0)),
      allDay: false,
    };
  }

  return {
    // ICS values without Z are interpreted as local time.
    date: new Date(year, month, day, hour, minute, second, 0),
    allDay: false,
  };
};

const getPropertyValue = (line: string) => {
  const separatorIndex = line.indexOf(":");
  if (separatorIndex === -1) {
    return "";
  }

  return line.slice(separatorIndex + 1);
};

export interface ParsedEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  allDay: boolean;
}

export const parseICS = (icsText: string): ParsedEvent[] => {
  const events: ParsedEvent[] = [];
  const blocks = icsText.split("BEGIN:VEVENT").slice(1);

  for (const rawBlock of blocks) {
    const endIndex = rawBlock.indexOf("END:VEVENT");
    if (endIndex === -1) {
      continue;
    }

    const block = rawBlock.slice(0, endIndex);
    const unfolded = block.replace(/\r?\n[ \t]/g, "");
    const lines = unfolded.split(/\r?\n/);

    let uid = "";
    let title = "";
    let description = "";
    let parsedDate = null;
    let visibility = "PUBLIC";
    let status = "CONFIRMED";

    for (const line of lines) {
      if (line.startsWith("UID:")) {
        uid = line.slice(4).trim();
        continue;
      }

      if (line.startsWith("SUMMARY")) {
        title = normalizeText(getPropertyValue(line));
        continue;
      }

      if (line.startsWith("DESCRIPTION")) {
        description = sanitizeDescription(getPropertyValue(line));
        continue;
      }

      if (line.startsWith("DTSTART")) {
        parsedDate = parseDateValue(line);
        continue;
      }

      if (line.startsWith("CLASS:")) {
        visibility = normalizeText(line.slice(6)).toUpperCase();
        continue;
      }

      if (line.startsWith("X-CALENDARSERVER-ACCESS:")) {
        visibility = normalizeText(line.slice(23)).toUpperCase();
        continue;
      }

      if (line.startsWith("STATUS:")) {
        status = normalizeText(line.slice(7)).toUpperCase();
      }
    }

    if (!title || !parsedDate?.date) {
      continue;
    }

    const titleLooksPrivate = /\b(private|soukrom)\b/i.test(title) || /^busy$/i.test(title);
    const isPrivate =
      visibility.includes("PRIVATE") || visibility.includes("CONFIDENTIAL") || titleLooksPrivate;
    const isCancelled = status === "CANCELLED";

    if (isPrivate || isCancelled) {
      continue;
    }

    events.push({
      id: uid || `${title}-${parsedDate.date.getTime()}`,
      title,
      description,
      date: parsedDate.date.toISOString(),
      allDay: parsedDate.allDay,
    });
  }

  return events;
};
