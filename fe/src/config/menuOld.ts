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
  const hotelManagementItems = [
    {
      code: 'rooms',
      label: {
        zh_CN: '房间管理',
        en_US: 'Room Management',
        vi_VN: 'Quản lý phòng',
      },
      icon: 'home',
      path: '/rooms',
    },
    {
      code: 'promotions',
      label: {
        zh_CN: '促销管理',
        en_US: 'Promotion Management', 
        vi_VN: 'Quản lý khuyến mãi',
      },
      icon: 'gift',
      path: '/promotions',
    },
    {
      code: 'hotel-brands',
      label: {
        zh_CN: '酒店品牌',
        en_US: 'Hotel Brands',
        vi_VN: 'Thương hiệu khách sạn',
      },
      icon: 'shop',
      path: '/hotel-brands',
    },
    {
      code: 'facilities',
      label: {
        zh_CN: '设施管理',
        en_US: 'Facilities',
        vi_VN: 'Tiện ích',
      },
      icon: 'appstore',
      path: '/facilities',
    },
    {
      code: 'customers',
      label: {
        zh_CN: '客户管理',
        en_US: 'Customers',
        vi_VN: 'Khách hàng',
      },
      icon: 'user',
      path: '/customers',
    },
    {
      code: 'vouchers',
      label: {
        zh_CN: '优惠券',
        en_US: 'Vouchers',
        vi_VN: 'Phiếu giảm giá',
      },
      icon: 'tag',
      path: '/vouchers',
    },
    {
      code: 'services',
      label: {
        zh_CN: '服务管理',
        en_US: 'Services',
        vi_VN: 'Dịch vụ',
      },
      icon: 'tool',
      path: '/services',
    },
    {
      code: 'bookings',
      label: {
        zh_CN: '预订管理',
        en_US: 'Bookings',
        vi_VN: 'Quản lý đặt phòng',
      },
      icon: 'calendar',
      path: '/booking-requests',
      children: [
        {
          code: 'booking-requests',
          label: {
            zh_CN: '预订请求',
            en_US: 'Booking Requests',
            vi_VN: 'Yêu cầu đặt phòng',
          },
          path: '/booking-requests',
        },
        {
          code: 'room-stays',
          label: {
            zh_CN: '住宿记录',
            en_US: 'Room Stays',
            vi_VN: 'Lưu trú',
          },
          path: '/room-stays',
        },
      ],
    },
    // {
    //   code: 'facilities',
    //   label: {
    //     zh_CN: '设施管理',
    //     en_US: 'Facilities',
    //     vi_VN: 'Tiện ích',
    //   },
    //   icon: 'appstore',
    //   path: '/facilities',
    // },
    // {
    //   code: 'vouchers',
    //   label: {
    //     zh_CN: '优惠券',
    //     en_US: 'Vouchers',
    //     vi_VN: 'Phiếu giảm giá',
    //   },
    //   icon: 'tag',
    //   path: '/vouchers',
    // },
    // {
    //   code: 'customers',
    //   label: {
    //     zh_CN: '客户管理',
    //     en_US: 'Customers',
    //     vi_VN: 'Khách hàng',
    //   },
    //   icon: 'user',
    //   path: '/customers',
    // },
    // {
    //   code: 'bookings',
    //   label: {
    //     zh_CN: '预订管理',
    //     en_US: 'Bookings',
    //     vi_VN: 'Quản lý đặt phòng',
    //   },
    //   icon: 'calendar',
    //   path: '/bookings',
    //   children: [
    //     {
    //       code: 'room-stays',
    //       label: {
    //         zh_CN: '住宿记录',
    //         en_US: 'Room Stays',
    //         vi_VN: 'Lưu trú',
    //       },
    //       path: '/room-stays',
    //     },
    //     {
    //       code: 'booking-requests',
    //       label: {
    //         zh_CN: '预订请求',
    //         en_US: 'Booking Requests',
    //         vi_VN: 'Yêu cầu đặt phòng',
    //       },
    //       path: '/booking-requests',
    //     },
    //   ],
    // },
    // {
    //   code: 'services',
    //   label: {
    //     zh_CN: '服务管理',
    //     en_US: 'Services',
    //     vi_VN: 'Quản lý dịch vụ',
    //   },
    //   icon: 'setting',
    //   path: '/services',
    //   children: [
    //     {
    //       code: 'services-list',
    //       label: {
    //         zh_CN: '服务列表',
    //         en_US: 'Services List',
    //         vi_VN: 'Danh sách dịch vụ',
    //       },
    //       path: '/services',
    //     },
    //     {
    //       code: 'service-bookings',
    //       label: {
    //         zh_CN: '服务预订',
    //         en_US: 'Service Bookings',
    //         vi_VN: 'Đặt dịch vụ',
    //       },
    //       path: '/service-bookings',
    //     },
    //   ],
    // },
    // {
    //   code: 'games',
    //   label: {
    //     zh_CN: '游戏管理',
    //     en_US: 'Games',
    //     vi_VN: 'Trò chơi',
    //   },
    //   icon: 'rocket',
    //   path: '/games',
    // },
  ];

  // Add hotel management items for all logged in users
  if (authData?.user) {
    menuList.push(...hotelManagementItems);
  }

  // Admin-only menu items (only for super_admin)
  if (isSuperAdmin) {
    const adminItems = [
      // {
      //   code: 'admin',
      //   label: {
      //     zh_CN: '系统管理',
      //     en_US: 'Administration',
      //     vi_VN: 'Quản trị hệ thống',
      //   },
      //   icon: 'setting',
      //   path: '/admin',
      //   children: [
      //     {
      //       code: 'tenants',
      //       label: {
      //         zh_CN: '租户管理',
      //         en_US: 'Tenants',
      //         vi_VN: 'Quản lý khách sạn',
      //       },
      //       path: '/tenants',
      //     },
      //     {
      //       code: 'admin-users',
      //       label: {
      //         zh_CN: '管理员',
      //         en_US: 'Admin Users',
      //         vi_VN: 'Quản trị viên',
      //       },
      //       path: '/admin-users',
      //     },
      //   ],
      // },
    ];

    // menuList.push(...adminItems);
  }

  return menuList;
};
