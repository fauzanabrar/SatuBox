import { redirect } from 'next/navigation'


export default function HomePage() {
  // Must navigate to dashboard
  redirect('/dashboard')  

  return (
    <>halo</>
  )
}
