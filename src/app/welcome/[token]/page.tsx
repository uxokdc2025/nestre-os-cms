import { Onboarding } from '@/components/Onboarding'

export const dynamic = 'force-dynamic'

export default async function WelcomePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <Onboarding token={token} />
}
