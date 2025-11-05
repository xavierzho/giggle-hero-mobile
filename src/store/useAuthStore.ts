import { create } from 'zustand';
import initBg from '@/assets/init.png';
import errorBg from '@/assets/error.png';

interface UserInfo {
  address: string;
  inviter: string | null;
  inviteCode?: string;
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
    set({ userInfo });
    
    // 如果 inviter 为 null,切换到错误背景
    if (userInfo && userInfo.inviter === null) {
      set({ backgroundImage: errorBg });
    } else {
      set({ backgroundImage: initBg });
    }
    
    // 同步到 localStorage
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
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
