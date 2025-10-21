import { redirect } from 'next/navigation'

interface TrackPageProps {
  params: {
    qrCodeId: string
  }
  searchParams: {
    url?: string
  }
}

export default function TrackPage({ params, searchParams }: TrackPageProps) {
  // Эта страница будет обрабатываться через API route
  // Но на случай прямого обращения, перенаправляем на главную
  redirect('/')
}

