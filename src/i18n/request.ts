import { getRequestConfig } from 'next-intl/server';
import { locales } from './routing';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ locale }) => {
  const requestedLocale = locale ?? 'en';

  if (!locales.includes(requestedLocale)) {
    notFound();
  }

  return {
    locale: requestedLocale,
    messages: (await import(`../../messages/${requestedLocale}.json`)).default,
  };
});
