import { create } from 'zustand';
import initBg from '@/assets/init.png';
import errorBg from '@/assets/error.png';
import successBg from '@/assets/success.png';

interface UserInfo {
  address: string;
  inviter: string | null;
  inviteCode: string | null;
  count?: number;
}

interface AuthState {
  userInfo: UserInfo | null;
  backgroundImage: string;
  setUserInfo: (userInfo: UserInfo | null) => void;
  setBackgroundImage: (image: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userInfo: null,
  backgroundImage: initBg,
  
  setUserInfo: (userInfo) => {
    const normalizedUserInfo = userInfo
      ? {
          ...userInfo,
          inviteCode: userInfo.inviteCode ?? null,
        }
      : null;

    set({ userInfo: normalizedUserInfo });
    
    // 如果没有邀请资格（inviteCode 为空），切换到警示背景
    if (normalizedUserInfo) {
      if (normalizedUserInfo.inviteCode) {
        set({ backgroundImage: successBg });
      } else {
        set({ backgroundImage: errorBg });
      }
    } else {
      set({ backgroundImage: initBg });
    }
    
    // 同步到 localStorage
    if (normalizedUserInfo) {
      localStorage.setItem('userInfo', JSON.stringify(normalizedUserInfo));
    } else {
      localStorage.removeItem('userInfo');
    }
  },
  
  setBackgroundImage: (image) => {
    set({ backgroundImage: image });
  },
  
  logout: () => {
    set({ 
      userInfo: null, 
      backgroundImage: initBg 
    });
    localStorage.removeItem('userInfo');
  },
}));

// 初始化时从 localStorage 读取
const storedUserInfo = localStorage.getItem('userInfo');
if (storedUserInfo) {
  try {
    const userInfo = JSON.parse(storedUserInfo);
    useAuthStore.getState().setUserInfo(userInfo);
  } catch (error) {
    console.error('Failed to parse stored user info:', error);
  }
}
