import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to English as default for i18n
  redirect('/en');
}