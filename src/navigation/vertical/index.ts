// ** Icon imports
import {
  AccountCogOutline,
  BookAccountOutline,
  ReceiptTextCheckOutline,
  StoreOutline,
  ShapePlus,
  AccountGroupOutline,
  AccountKeyOutline,
  CalendarCheckOutline,
  HomeOutline,
  HomeImportOutline,
  HomeExportOutline,
  HomeSwitchOutline,
  ClipboardListOutline,
  ClipboardFlowOutline,
  CogOutline,
  WalletOutline,
  WalletGiftcard,
  SelectGroup,
  MessageProcessingOutline,
  TruckCargoContainer
} from 'mdi-material-ui'

// ** Type import
import { VerticalNavItemsType } from '@/layouts/types'
import { QuestionAnswer, ReviewsOutlined } from '@mui/icons-material'

const navigation = (isInternalUser: boolean): VerticalNavItemsType => {
  const hidden = !isInternalUser

  return [
    {
      title: 'داشبورد',
      icon: HomeOutline,
      path: '/'
    },
    {
      title: 'کاربران',
      icon: AccountGroupOutline,
      path: '/account/list',
      disabled: !isInternalUser,
      hidden
    },
    {
      title: 'سطوح دسترسی',
      icon: AccountKeyOutline,
      path: '/access/list',
      disabled: !isInternalUser,
      hidden
    },
    {
      title: 'دسته بندی',
      icon: ShapePlus,
      path: '/category/list',
      disabled: !isInternalUser,
      hidden
    },
    {
      title: 'هزینه های بسته بندی',
      icon: ReceiptTextCheckOutline,
      path: '/packaging-cost/list',
      hidden
    },
    {
      title: 'روش های ارسال',
      icon: TruckCargoContainer,
      path: '/delivery-method/list',
      hidden
    },
    {
      title: 'محصولات',
      icon: StoreOutline,
      path: '/product/list',
      disabled: !isInternalUser,
      hidden
    },
    {
      title: 'نظرات',
      icon: ReviewsOutlined,
      path: '/review/list',
      disabled: !isInternalUser,
      hidden
    },
    {
      title: 'پرسش ها',
      icon: QuestionAnswer,
      path: '/question/list',
      disabled: !isInternalUser,
      hidden
    },
    {
      title: 'آدرس ها',
      icon: BookAccountOutline,
      path: '/contact/list'
    },
    {
      title: 'سفارش ها',
      icon: ReceiptTextCheckOutline,
      path: '/invoice/list'
    },
    {
      sectionTitle: 'انبارداری',
      hidden
    },
    {
      title: 'انبارها',
      icon: HomeOutline,
      path: '/warehouse/management',
      hidden
    },
    {
      title: 'رسید انبار',
      icon: HomeImportOutline,
      path: '/warehouse/inventory/input',
      hidden
    },
    {
      title: 'حواله انبار',
      icon: HomeExportOutline,
      path: '/warehouse/inventory/output',
      hidden
    },
    {
      title: 'انتقال بین انبارها',
      icon: HomeSwitchOutline,
      path: '/warehouse/inventory/transfer',
      hidden
    },
    {
      title: 'موجودی',
      icon: ClipboardListOutline,
      path: '/warehouse/stock',
      hidden
    },
    {
      sectionTitle: 'کارها',
      hidden
    },
    {
      sectionTitle: 'کیف پول'
    },
    {
      title: 'تراکنش ها',
      icon: WalletOutline,
      path: '/wallet/transactions'
    },
    {
      title: 'پاداش خرید',
      icon: WalletGiftcard,
      path: '/bonus/list',
      hidden
    },
    {
      sectionTitle: 'پشتیبانی',
      hidden
    },
    {
      title: 'پیامک',
      icon: MessageProcessingOutline,
      path: '/support/sms',
      hidden
    },
    {
      sectionTitle: 'تنظیمات'
    },
    {
      title: 'تنظیمات کاربری',
      icon: AccountCogOutline,
      path: '/account-settings'
    },
    {
      title: 'تنظیمات سیستم',
      icon: CogOutline,
      path: '/settings',
      disabled: !isInternalUser,
      hidden
    }
  ].filter(nav => !nav.hidden)
}

export default navigation
