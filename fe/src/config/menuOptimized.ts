import type { MenuList } from '@/interface/layout/menu.interface';
import { auth } from '@/store/auth';

export const getHotelMenuList = (): MenuList => {
  const authData = auth.get();
  const isSuperAdmin = auth.isSuperAdmin();

  const menuList: MenuList = [
    {
      code: 'dashboard',
      label: {
        zh_CN: 'Dashboard',
        en_US: 'Dashboard',
        vi_VN: 'Tổng quan',
      },
      icon: 'dashboard',
      path: '/dashboard',
    },
  ];

  // Core SaaS Admin Menu - Match với backend endpoints
  if (authData?.user) {
    const coreMenuItems = [
      {
        code: 'rooms',
        label: {
          zh_CN: '房间管理',
          en_US: 'Rooms',
          vi_VN: 'Phòng',
        },
        icon: 'home',
        path: '/admin/rooms',
      },
      {
        code: 'bookings',
        label: {
          zh_CN: '预订管理',
          en_US: 'Bookings',
          vi_VN: 'Đặt phòng',
        },
        icon: 'calendar',
        path: '/admin/bookings',
      },
      {
        code: 'customers',
        label: {
          zh_CN: '客户管理',
          en_US: 'Customers',
          vi_VN: 'Khách hàng',
        },
        icon: 'user',
        path: '/admin/customers',
      },
      {
        code: 'promotions',
        label: {
          zh_CN: '促销管理',
          en_US: 'Promotions',
          vi_VN: 'Khuyến mãi',
        },
        icon: 'gift',
        path: '/admin/promotions',
      },
      {
        code: 'vouchers',
        label: {
          zh_CN: '优惠券',
          en_US: 'Vouchers',
          vi_VN: 'Voucher',
        },
        icon: 'tag',
        path: '/admin/vouchers',
      },
      {
        code: 'services',
        label: {
          zh_CN: '服务管理',
          en_US: 'Services',
          vi_VN: 'Dịch vụ',
        },
        icon: 'tool',
        path: '/admin/services',
      },
    ];

    menuList.push(...coreMenuItems);

    // Super Admin only
    if (isSuperAdmin) {
      menuList.push({
        code: 'tenants',
        label: {
          zh_CN: '租户管理',
          en_US: 'Tenants',
          vi_VN: 'Khách sạn',
        },
        icon: 'apartment',
        path: '/admin/tenants',
      });
    }
  }

  return menuList;
};
