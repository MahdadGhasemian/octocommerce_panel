// ** Type import
import { HeaderDataType } from '@/layouts/types'

const headers = (
  domainName?: string,
  twitterId?: string,
  ogTitle?: string,
  ogDescription?: string,
  ogImageUrl?: string
): HeaderDataType => {
  return {
    routes: [
      {
        title: 'داشبورد',
        path: '/'
      },
      {
        title: 'کاربران',
        path: '/account/list'
      },
      {
        title: 'سطوح دسترسی',
        path: '/access/list'
      },
      {
        title: 'دسته بندی',
        path: '/category/list'
      },
      {
        title: 'هزینه های بسته بندی',
        path: '/packaging-cost/list'
      },
      {
        title: 'روش های ارسال',
        path: '/delivery-method/list'
      },
      {
        title: 'محصولات',
        path: '/product/list',
        description: 'محصولات'
      },
      {
        title: 'نظرات',
        path: '/review/list'
      },
      {
        title: 'پرسش ها',
        path: '/question/list'
      },
      {
        title: 'آدرس ها',
        path: '/contact/list'
      },
      {
        title: 'سفارش ها',
        path: '/invoice/list'
      },
      {
        title: 'سفارش',
        path: '/invoice/view'
      },
      {
        title: 'انبارها',
        path: '/warehouse/management'
      },
      {
        title: 'رسید انبار',
        path: '/warehouse/inventory/input'
      },
      {
        title: 'رسید انبار جدید',
        path: '/warehouse/inventory/input/new'
      },
      {
        title: 'حواله انبار',
        path: '/warehouse/inventory/output'
      },
      {
        title: 'حواله انبار جدید',
        path: '/warehouse/inventory/output/new'
      },
      {
        title: 'انتقال بین انبارها',
        path: '/warehouse/inventory/transfer'
      },
      {
        title: 'انتقال بین انبار جدید',
        path: '/warehouse/inventory/transfer/new'
      },
      {
        title: 'موجودی',
        path: '/warehouse/stock'
      },
      {
        title: 'پیامک',
        path: '/support/sms'
      },
      {
        title: 'تنظیمات کاربری',
        path: '/account-settings'
      },
      {
        title: 'تنظیمات سیستم',
        path: '/settings'
      }
    ],
    generalMeta: [
      { property: 'og:title', content: `${ogTitle}`, key: 'ogtitle' },
      { property: 'og:description', content: `${ogDescription}`, key: 'ogdesc' },
      {
        property: 'og:image',
        content: `${ogImageUrl}`,
        key: 'ogimage'
      },
      {
        property: 'og:image:secure_url',
        content: `${ogImageUrl}`,
        key: 'ogimagesecureurl'
      },
      { property: 'og:image:width', content: '400', key: 'ogimagewidth' },
      { property: 'og:image:height', content: '400', key: 'ogimageheight' },
      { property: 'og:url', content: `https://${domainName}/`, key: 'ogurl' },

      { property: 'og:site_name', content: `${ogTitle}` },
      { property: 'og:type', content: 'website', key: 'website' },
      { property: 'og:locale', content: 'fa_IR' },

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `${ogTitle}` },
      { name: 'twitter:description', content: `${ogDescription}` },
      { name: 'twitter:image', content: `${ogImageUrl}` },
      { name: 'twitter:site', content: `@${twitterId}` },

      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-touch-fullscreen', content: 'yes' },
      { name: 'apple-mobile-web-app-title', content: `${ogTitle}` },
      { name: 'apple-mobile-web-app-capable', content: 'yes' }
    ]
  }
}

export default headers
