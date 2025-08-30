import type { MenuList } from '../interface/layout/menu.interface';
import type { Notice } from '@/interface/layout/notice.interface';
import type { AxiosRequestConfig } from 'axios';

import { request } from './request';

/** 获取菜单列表接口 - Using mock data since backend doesn't have this endpoint */
/** Provides the mock menu list to be shown in the navigation sidebar */
export const getMenuList = (config: AxiosRequestConfig = {}) => {
  // Return mock menu data
  const mockMenu = [
    {
      code: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      path: '/dashboard'
    },
    {
      code: 'tenants',
      label: 'Hotels',
      icon: 'hotel',
      path: '/tenants'
    },
    {
      code: 'rooms',
      label: 'Rooms',
      icon: 'room',
      path: '/rooms'
    },
    {
      code: 'promotions',
      label: 'Promotions',
      icon: 'gift',
      path: '/promotions'
    }
  ];
  
  return Promise.resolve({
    status: true,
    message: 'Success',
    result: mockMenu
  });
};

/** 获取通知列表接口 - Using mock data since backend doesn't have this endpoint */
/** Provides the mock notification list to be shown
 * in the notification dropdown
 */
export const getNoticeList = (config: AxiosRequestConfig = {}) => {
  // Return mock data instead of calling non-existent API
  return Promise.resolve({
    status: true,
    message: 'Success',
    result: []
  });
};
