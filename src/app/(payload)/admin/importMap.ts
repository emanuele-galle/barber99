import { Logo } from '@/components/admin/Logo'
import { Icon } from '@/components/admin/Icon'
import { S3ClientUploadHandler } from '@payloadcms/storage-s3/client'
import WelcomeBanner from '@/components/admin/dashboard/WelcomeBanner'
import QuickStats from '@/components/admin/dashboard/QuickStats'
import QuickActions from '@/components/admin/dashboard/QuickActions'
import DashboardLayout from '@/components/admin/dashboard/DashboardLayout'

export const importMap = {
  '@/components/admin/Logo#Logo': Logo,
  '@/components/admin/Icon#Icon': Icon,
  '@payloadcms/storage-s3/client#S3ClientUploadHandler': S3ClientUploadHandler,
  '@/components/admin/dashboard/WelcomeBanner#default': WelcomeBanner,
  '@/components/admin/dashboard/QuickStats#default': QuickStats,
  '@/components/admin/dashboard/QuickActions#default': QuickActions,
  '@/components/admin/dashboard/DashboardLayout#default': DashboardLayout,
}
