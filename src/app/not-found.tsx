import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h2 className="mb-4 text-4xl font-bold">404 - Page Not Found</h2>
      <p className="mb-8 text-gray-600">
        The page you are looking for could not be found.
      </p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  )
}
