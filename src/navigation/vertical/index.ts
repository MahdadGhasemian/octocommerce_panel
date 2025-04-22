// ** Icon imports
import {
  BookAccountOutline,
  ReceiptTextCheckOutline,
  StoreOutline,
  ShapePlus,
  AccountGroupOutline,
  AccountKeyOutline,
  HomeOutline,
  HomeImportOutline,
  HomeExportOutline,
  HomeSwitchOutline,
  ClipboardListOutline,
  CogOutline,
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
      title: 'تنظیمات سیستم',
      icon: CogOutline,
      path: '/settings',
      disabled: !isInternalUser,
      hidden
    }
  ].filter(nav => !nav.hidden)
}

export default navigation
