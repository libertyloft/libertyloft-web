import { useEffect, useState } from 'react';
import { Calendar, CalendarPlus, Clock, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { parseICS, ParsedEvent } from '@/lib/ical';

interface CalendarEvent extends Omit<ParsedEvent, 'date'> {
  date: Date;
}


// sanitizeDescription is now handled in the ical parser.

const formatGoogleAllDayDate = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const formatGoogleDateTime = (date: Date) => {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
};

const calendarIcsUrl =
  'https://calendar.google.com/calendar/ical/libertyloft%40proton.me/public/basic.ics';
const wholeCalendarUrl = `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(calendarIcsUrl)}`;
const defaultLocationLabel = 'LibertyLoft, Papírenská 120/12, Praha 6-Bubeneč';
const defaultLocationMapUrl = 'https://maps.app.goo.gl/bW7NzqNAi2ezyweJ6';

const extractEventLocation = (description: string) => {
  const locationMatch = description.match(/(?:^|\n)📍\s*(.+)/);
  return locationMatch?.[1]?.trim() ?? '';
};

const getLocationMapUrl = (location: string) => {
  if (!location) {
    return defaultLocationMapUrl;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
};

const Events = () => {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openCalendarMenuId, setOpenCalendarMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (!target.closest('[data-calendar-menu]')) {
        setOpenCalendarMenuId(null);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchEvents = async () => {
      try {
        const fetchUrl = `https://corsproxy.io/?${encodeURIComponent(calendarIcsUrl)}`;
        const response = await fetch(fetchUrl, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Calendar API returned ${response.status}`);
        }

        const text = await response.text();
        const parsedEvents = parseICS(text);
        
        const now = Date.now();
        const upcomingEvents = parsedEvents
          .map((event) => ({
             ...event,
             date: new Date(event.date),
          }))
          .filter((event) => !Number.isNaN(event.date.getTime()) && event.date.getTime() >= now)
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .slice(0, 6);

        setEvents(upcomingEvents);
        setError(false);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        console.error('Failed to fetch calendar:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    return () => {
      controller.abort();
    };
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(language === 'cs' ? 'cs-CZ' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (event: CalendarEvent) => {
    if (event.allDay) {
      return language === 'cs' ? 'Celý den' : 'All day';
    }

    return new Intl.DateTimeFormat(language === 'cs' ? 'cs-CZ' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(event.date);
  };

  const getAddToCalendarUrl = (event: CalendarEvent) => {
    const endDate = new Date(event.date);
    let dates = '';

    if (event.allDay) {
      endDate.setUTCDate(endDate.getUTCDate() + 1);
      dates = `${formatGoogleAllDayDate(event.date)}/${formatGoogleAllDayDate(endDate)}`;
    } else {
      // Events don't include explicit end time in API, so default duration is 2 hours.
      endDate.setHours(endDate.getHours() + 2);
      dates = `${formatGoogleDateTime(event.date)}/${formatGoogleDateTime(endDate)}`;
    }

    const location = extractEventLocation(event.description);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates,
      details: event.description,
      ctz: 'Europe/Prague',
    });

    if (location) {
      params.set('location', location);
    }

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  if (loading) {
    return (
      <section id="events" className="section-padding">
        <div className="container-narrow">
          <h2 className="text-3xl md:text-4xl font-display font-semibold mb-12">
            {t('events.title')}
          </h2>
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-ghost border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="section-padding">
      <div className="container-narrow">
        <h2 className="text-3xl md:text-4xl font-display font-semibold mb-12">
          {t('events.title')}
        </h2>

        {error && (
          <div className="text-center py-12 border border-border rounded">
            <Calendar size={32} className="mx-auto mb-4 text-ghost" />
            <p className="text-muted-foreground mb-4">
              {language === 'cs' ? 'Nepodařilo se načíst akce.' : 'Unable to load events.'}
            </p>
            <a
              href="https://calendar.google.com/calendar/embed?src=libertyloft%40proton.me&ctz=Europe%2FPrague"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ghost-bright hover:text-foreground transition-colors underline underline-offset-4"
            >
              {language === 'cs' ? 'Zobrazit kalendář' : 'View calendar'}
            </a>
          </div>
        )}

        {!error && events.length === 0 && (
          <div className="text-center py-12 border border-border rounded">
            <Calendar size={32} className="mx-auto mb-4 text-ghost" />
            <p className="text-muted-foreground">{t('events.noEvents')}</p>
          </div>
        )}

        {!error && events.length > 0 && (
          <div className="space-y-4">
            {events.map((event) => {
              const eventLocation = extractEventLocation(event.description);

              return (
                <article
                  key={event.id}
                  className={`relative group p-6 border border-border rounded hover:border-ghost transition-all duration-300 hover-lift ${
                    openCalendarMenuId === event.id ? 'z-40' : 'z-10'
                  }`}
                >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-shrink-0 md:w-32 md:text-right">
                    <div className="flex items-center gap-2 md:justify-end text-ghost-bright text-sm">
                      <Calendar size={14} />
                      <span>{formatDate(event.date).split(',')[0]}</span>
                    </div>
                    <div className="text-lg font-display font-medium mt-1">
                      {formatDate(event.date).split(',').slice(1).join(',')}
                    </div>
                    <div className="flex items-center gap-2 md:justify-end text-muted-foreground text-sm mt-1">
                      <Clock size={12} />
                      <span>{formatTime(event)}</span>
                    </div>
                    <a
                      href={getLocationMapUrl(eventLocation)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={eventLocation || defaultLocationLabel}
                      className="mt-1 inline-flex items-center gap-1.5 text-xs text-ghost-bright hover:text-foreground transition-colors md:justify-end"
                    >
                      <MapPin size={11} />
                      <span>{t('events.mapLink')}</span>
                    </a>
                  </div>

                  <div className="hidden md:block w-px bg-border group-hover:bg-ghost transition-colors self-stretch" />

                  <div className="flex-1">
                    <h3 className="text-xl font-display font-medium mb-2 group-hover:text-ghost-bright transition-colors">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                        {event.description}
                      </p>
                    )}
                    <div className="relative mt-4 inline-block text-left" data-calendar-menu>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-md border border-border/80 bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-ghost hover:bg-muted/40"
                        onClick={() =>
                          setOpenCalendarMenuId((current) => (current === event.id ? null : event.id))
                        }
                        aria-haspopup="menu"
                        aria-controls={`calendar-menu-${event.id}`}
                        aria-expanded={openCalendarMenuId === event.id}
                      >
                        <CalendarPlus size={14} />
                        {t('events.addToCalendar')}
                      </button>

                      {openCalendarMenuId === event.id && (
                        <div
                          id={`calendar-menu-${event.id}`}
                          className="absolute left-0 top-full z-20 mt-2 min-w-56 max-w-[calc(100vw-2rem)] rounded-lg border border-border/80 bg-background/95 p-1.5 shadow-xl backdrop-blur"
                        >
                          <a
                            href={getAddToCalendarUrl(event)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
                            onClick={() => setOpenCalendarMenuId(null)}
                          >
                            {t('events.addSingleEvent')}
                          </a>
                          <a
                            href={wholeCalendarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 block rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
                            onClick={() => setOpenCalendarMenuId(null)}
                          >
                            {t('events.addWholeCalendar')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Events;
