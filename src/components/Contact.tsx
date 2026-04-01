import { MapPin, Mail, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Contact = () => {
  const { t } = useLanguage();

  const address = "LibertyLoft, Papírenská 120/12, 160 00 Praha 6-Bubeneč";
  const googleMapsUrl = "https://maps.app.goo.gl/PNMd8BSVgSQX3f1G6";
  const osmUrl = "https://www.openstreetmap.org/node/13619855846";
  const facebookUrl = "https://www.facebook.com/profile.php?id=61586275214797";
  const embedUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2559.6571727153414!2d14.400103149724785!3d50.111274410771!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470b95c1edc71c1f%3A0x7559ac62925875eb!2sLibertyLoft!5e0!3m2!1sen!2scz!4v1770644920847!5m2!1sen!2scz";

  return (
    <section id="contact" className="section-padding bg-card">
      <div className="container-narrow">
        <h2 className="text-3xl md:text-4xl font-display font-semibold mb-12">
          {t('contact.title')}
        </h2>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <MapPin size={20} className="text-ghost flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium mb-1">{t('contact.address')}</h3>
                <p className="text-muted-foreground">{address}</p>
                <ul className="flex gap-4">
                  <li>
                    <a
                      href={osmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-ghost-bright hover:text-foreground transition-colors mt-2"
                    >
                      OpenStreetMap (OSM)
                      <ExternalLink size={12} />
                    </a>
                  </li>
                  <li>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-ghost-bright hover:text-foreground transition-colors mt-2"
                    >
                      Google Maps
                      <ExternalLink size={12} />
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail size={20} className="text-ghost flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium mb-1">{t('contact.email')}</h3>
                <a
                  href="mailto:libertyloft@proton.me"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  libertyloft@proton.me
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-ghost flex-shrink-0 mt-1">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22.675 0h-21.35C.595 0 0 .595 0 1.326v21.348C0 23.405.595 24 1.326 24H12.82v-9.294H9.692V11.08h3.129V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.626h-3.12V24h6.116C23.405 24 24 23.405 24 22.674V1.326C24 .595 23.405 0 22.675 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">{t('contact.facebook')}</h3>
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Facebook"
                >
                  {t('contact.facebookLink')}
                </a>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="relative overflow-hidden rounded border border-border">

            <iframe
              width="100%"
              height="300"
              src="https://www.openstreetmap.org/export/embed.html?bbox=14.39887046813965%2C50.110382258285334%2C14.40137028694153%2C50.1123276847718&amp;layer=mapnik&amp;marker=50.11135498140767%2C14.400120377540588"
              style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(90%)' }}
            />

          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
