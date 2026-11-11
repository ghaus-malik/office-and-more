import { useT } from '@/i18n'
import { ButtonLink } from '@/core/ui'

export function NotFound() {
  const { t } = useT()
  return (
    <div className="container-site flex min-h-[50vh] flex-col items-start justify-center py-24">
      <p className="eyebrow">404</p>
      <h1 className="display mt-4 text-[44px] md:text-[64px]">{t('common.notFound.title')}</h1>
      <p className="mt-3 text-lg text-muted">{t('common.notFound.text')}</p>
      <ButtonLink to="/" className="mt-8">
        {t('common.notFound.home')}
      </ButtonLink>
    </div>
  )
}
