export class LocalStorageService {
  private static instance: LocalStorageService;
  private constructor() {}

  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  // User authentication
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as Array<{
      id: string;
      email: string;
      password: string;
      created_at: string;
    }>;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('session', JSON.stringify({ user, expires_at: Date.now() + (24 * 60 * 60 * 1000) }));
      return { data: { user }, error: null };
    }
    return { data: null, error: { message: 'Invalid credentials' } };
  }

  async signUp({ email, password }: { email: string; password: string }) {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as Array<{
      id: string;
      email: string;
      password: string;
      created_at: string;
    }>;
    if (users.some(u => u.email === email)) {
      return { data: null, error: { message: 'Email already exists' } };
    }
    const newUser = { id: Date.now().toString(), email, password, created_at: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return { data: { user: newUser }, error: null };
  }

  async getUser() {
    const session = JSON.parse(localStorage.getItem('session') || 'null');
    if (session && session.expires_at > Date.now()) {
      return { 
        data: {
          id: session.user.id,
          email: session.user.email,
          created_at: session.user.created_at
        }, 
        error: null 
      };
    }
    return { data: null, error: { message: 'No active session' } };
  }

  async signOut() {
    localStorage.removeItem('session');
    return { error: null };
  }

  // Database operations
  async from(table: string) {
    return {
      select: async () => {
        const data = JSON.parse(localStorage.getItem(table) || '[]');
        return { data, error: null };
      },
      insert: async (data: Record<string, any>) => {
        const existingData = JSON.parse(localStorage.getItem(table) || '[]');
        const newData = [...existingData, { ...data, id: Date.now().toString() }];
        localStorage.setItem(table, JSON.stringify(newData));
        return { data: newData, error: null };
      },
      update: async (id: string, updates: Record<string, any>) => {
        const data = JSON.parse(localStorage.getItem(table) || '[]');
        const index = data.findIndex((item: { id: string }) => item.id === id);
        if (index === -1) {
          return { data: null, error: { message: 'Item not found' } };
        }
        data[index] = { ...data[index], ...updates };
        localStorage.setItem(table, JSON.stringify(data));
        return { data, error: null };
      },
      delete: async (id: string) => {
        const data = JSON.parse(localStorage.getItem(table) || '[]');
        const newData = data.filter((item: { id: string }) => item.id !== id);
        localStorage.setItem(table, JSON.stringify(newData));
        return { error: null };
      }
    };
  }

  // RPC operations
  async rpc(method: string, params: Record<string, any>) {
    if (method === 'update_appointment_status') {
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const appointment = appointments.find((a: { id: string }) => a.id === params.appointment_id);
      if (appointment) {
        appointment.status = params.status;
        localStorage.setItem('appointments', JSON.stringify(appointments));
        return { error: null };
      }
      return { error: { message: 'Appointment not found' } };
    }
    return { error: { message: 'Method not found' } };
  }
}
