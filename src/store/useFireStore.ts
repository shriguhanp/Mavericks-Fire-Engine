import { create } from 'zustand';

interface UserData {
  name: string;
  age: number | string;
  monthlyIncome: number | string;
  monthlyExpenses: number | string;
  currentSavings: number | string;
  retirementAge: number | string;
  desiredMonthlyDraw?: number | string;
  inflationRate?: number | string;
}

interface FireStore {
  userData: UserData;
  firePlan: any | null;
  theme: 'light' | 'dark';
  isCalculating: boolean;
  updateUserData: (data: Partial<UserData>) => void;
  setFirePlan: (plan: any) => void;
  setIsCalculating: (val: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  reset: () => void;
}

const initialState: UserData = {
  name: '',
  age: '',
  monthlyIncome: '',
  monthlyExpenses: '',
  currentSavings: '',
  retirementAge: '',
  desiredMonthlyDraw: '',
  inflationRate: '6',
};

const useFireStore = create<FireStore>((set) => ({
  userData: initialState,
  firePlan: null,
  isCalculating: false,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
  updateUserData: (data) => set((state) => ({ userData: { ...state.userData, ...data } })),
  setFirePlan: (plan) => set({ firePlan: plan }),
  setIsCalculating: (val) => set({ isCalculating: val }),
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    return { theme: newTheme };
  }),
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },
  reset: () => set({ userData: initialState, firePlan: null, isCalculating: false }),
}));

export default useFireStore;
