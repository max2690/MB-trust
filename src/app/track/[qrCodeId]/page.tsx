import { redirect } from 'next/navigation'

interface TrackPageProps {
  params: Promise<{ qrCodeId: string }>
  searchParams: Promise<{ url?: string }>
}

export default function TrackPage({ params, searchParams }: TrackPageProps) {
  // Эта страница будет обрабатываться через API route
  // Но на случай прямого обращения, перенаправляем на главную
  redirect('/')
}

