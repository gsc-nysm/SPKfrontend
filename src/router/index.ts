import Agency from '@/views/Pages/Dashboard/Agency.vue';
import AuthLayout from '@/views/Layout/Auth.vue'
import DashboardLayout from '@/views/Layout/Dashboard.vue'
import LandingLayout from '@/views/Layout/Landing.vue'
import Login from '@/views/Pages/Auth/Login.vue'
import Register from '@/views/Pages/Auth/Register.vue'
import Dashboard from '@/views/Pages/Dashboard/Dashboard.vue'
import HomeView from '@/views/Pages/Landing/HomeView.vue'
import { createRouter, createWebHistory, type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router'
import { requireAuth } from './middleware/auth'
import { useAuthStore } from '@/stores/auth'
import UserAgency from '@/views/Pages/Dashboard/UserAgency/UserAgency.vue';
import type { IncomingUser } from '@/models/User';
import { computed } from 'vue';
import NotFound from '@/views/Pages/NotFound.vue';
import RegistrationPeriod from '@/views/Pages/Dashboard/RegistrationPeriod.vue';
import SocialAssistance from '@/views/Pages/Dashboard/SocialAssistance.vue';
import Criteria from '@/views/Pages/Dashboard/Criteria.vue';
import SubCriteria from '@/views/Pages/Dashboard/SubCriteria.vue';
import Submission from '@/views/Pages/Dashboard/Submission/Submission.vue';
import History from '@/views/Pages/Dashboard/Submission/History.vue';
import Manage from '@/views/Pages/Dashboard/Submission/Manage.vue';
import ManagePotentialBeneficiaries from '@/views/Pages/Dashboard/PotentialBeneficiaries/Manage.vue';
import Validate from '@/views/Pages/Dashboard/PotentialBeneficiaries/Validate.vue';
import Evaluation from '@/views/Pages/Dashboard/Evaluation/Evaluation.vue';
import Ranking from '@/views/Pages/Dashboard/Evaluation/Ranking.vue';
import EvaluationHistory from '@/views/Pages/Dashboard/Evaluation/History.vue';
import EvaluationValidator from '@/views/Pages/Dashboard/Evaluation/EvaluationValidator.vue';
import ManageBeneficiary from '@/views/Pages/Dashboard/Beneficiary/Manage.vue';
import Beneficiary from '@/views/Pages/Dashboard/Beneficiary/Beneficiary.vue';
import Validator from '@/views/Pages/Dashboard/Beneficiary/Validator.vue';
import Profil from '@/views/Pages/Dashboard/Setting/Profil.vue';
import Password from '@/views/Pages/Dashboard/Setting/Password.vue';
import Search from '@/views/Pages/Dashboard/Search.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: LandingLayout,
      meta: {requiresAuth: false},
      children: [
        {
          path:'',
          name:'homeview',
          component: HomeView
        }
      ]
    },

    {
      path: '/dashboard',
      component: DashboardLayout,
      name: 'dashboard-parent',
      meta: { title: 'Beranda', icon: 'el-icon-home', requiresAuth: true },
      children: [
        {
          path:'',
          name:'dashboard',
          component: Dashboard,
          meta: { 
            breadcrumbs: [
              { name: 'Dashboard', path: '/dashboard' },
            ], 
            role: 'all', 
            ability:[] 
          },
          beforeEnter: requireAuth,
        },
        {
          path:'/search-beneficiary',
          name:'Cari Penerima Bantuan',
          component: Search,
          meta: { 
            breadcrumbs: [
              { name: 'Cari Penerima Bantuan', path: '/search-beneficiary' },
            ], 
            role: 'all', 
            ability:[] 
          },
        },
        {
          path:'/setting/profile',
          name:'Pengaturan Profile',
          component: Profil,
          meta: { 
            breadcrumbs: [
              { name: 'Pengaturan Profil', path: '/setting' },
            ], 
            role: 'all', 
            ability:[] 
          },
        },
        {
          path:'/setting/change-password',
          name:'Pengaturan Password',
          component: Password,
          meta: { 
            breadcrumbs: [
              { name: 'Pengaturan Password', path: '/setting' },
            ], 
            role: 'all', 
            ability:[] 
          },
        },
        {
          path:'/agency',
          name:'agency',
          meta: { 
            breadcrumbs: [
              { name: 'Dashboard', path: '/dashboard' },
              { name: 'Kelola Instansi', path: '/agency' },
            ], 
            role: ['admin'], 
            ability:['kelola_instansi'] 
          },
          component: Agency
        },
        {
          path:'/user-agency/:id',
          name:'user-agency',
          meta: { 
            breadcrumbs: [
              { name: 'Dashboard', path: '/dashboard' },
              { name: 'Kelola Instansi', path: '/agency' },
              { name: 'Kelola Anggota Instansi', path: '/user-agency/:id' },
            ], 
            role: ['admin'], 
            ability:['kelola_anggota_instansi'] 
          },
          component: UserAgency
        },
        {
          path: '/social-assistance/:id', 
          name: 'social-assistance', // Ubah nama untuk konsistensi
          meta: { 
            breadcrumbs: [
              { name: 'Dashboard', path: '/social-assistance/:id' },
            ],
          role: ['verifikator'], ability: ['kelola_bantuan_sosial'] },
          component: SocialAssistance,
        },
        {
          path: '/social-assistance/:id/criteria', 
          name: 'criteria', // Ubah nama untuk konsistensi
          meta: { 
            breadcrumbs: [
              { name: 'Dashboard', path: '/social-assistance/:id' },
              { name: 'Kriteria Bantuan', path: '/social-assistance/criteria-assistance' },
            ],
            role: ['verifikator'], 
            ability: ['kelola_kriteria_bantuan'] 
          },
          component: Criteria,
        },
        {
          path: '/social-assistance/:id/sub_criteria/:criteria_id', 
          name: 'sub-criteria', // Ubah nama untuk konsistensi
          meta: {  
            breadcrumbs: [
              { name: 'Dashboard', path: '/social-assistance/:id' },
              { name: 'Kriteria Bantuan', path: '/social-assistance/:id/criteria' },
              { name: 'Sub Kriteria', path: '/social-assistance/:id/sub-criteria/:criteria_id' },
            ],
            role: ['verifikator'], 
            ability: ['kelola_sub_kriteria'] 
          },
          component: SubCriteria,
        },
        {
          path:'/social-assistance/:id/manage-submission',
          name:'manage-submission',
          meta: { 
            breadcrumbs: [
              { name: 'Dashboard', path: '/social-assistance/:id' },
              { name: 'Kelola Pengajuan', path: '/social-assistance/:id/manage-submission' },
            ],
            role: ['verifikator'], 
            ability:['verifikasi_pengajuan'] },
          component: Manage
        },
        {
          path:'/social-assistance/:id/manage-submission/:submission_id',
          name:'manage-potential-beneficiary',
          meta: { 
            breadcrumbs: [
              { name: 'Dashboard', path: '/social-assistance/:id' },
              { name: 'Kelola Pengajuan', path: '/social-assistance/:id/manage-submission' },
              { name: 'Kelola Calon Penerima Bantuan', path: '/social-assistance/:id/manage-submission/:submission_id' },
            ], 
            role:['validator','verifikator'], 
            ability:['kelola_calon_penerima'] 
          },
          component: ManagePotentialBeneficiaries
        },
        {
          path:'/social-assistance/:id/manage-submission/:submission_id/person/:potential_beneficiary_id',
          name:'verify-potential-beneficiary',
          meta: { 
            breadcrumbs: [
              { name: 'Dashboard', path: '/social-assistance/:id' },
              { name: 'Kelola Pengajuan', path: '/social-assistance/:id/manage-submission' },
              { name: 'Kelola Calon Penerima Bantuan', path: '/social-assistance/:id/manage-submission/:submission_id' },
              { name: 'Validasi Calon Penerima', path: '/social-assistance/:id/manage-submission/:submission_id/person/:potential_beneficiary_id' },
            ],  
            role:['validator'], 
            ability:['verifikasi_calon_penerima'] 
          },
          component: Validate
        },
        {
          path: '/social-assistance/:id/registration-period', 
          name: 'registration-period', // Ubah nama untuk konsistensi
          meta: { 
            breadcrumbs: [
              { name: 'Dashboard', path: '/social-assistance/:id' },
              { name: 'Kelola Periode Pendaftaran', path: '/social-assistance/:id/registration-period' },
            ],
            role: ['verifikator'], 
            ability: ['kelola_periode_pendaftaran'] 
          },
          component: RegistrationPeriod,
        },
        {
          path:'/evaluation',
          name:'evaluation',
          meta: { 
            breadcrumbs: [
              { name: 'Dashboard', path: '/dashboard' },
              { name: 'Lihat Penilaian', path: '/evaluation' },
            ],
            role:['validator'], 
            ability:['lihat_hasil_akhir'] 
          },
          component: EvaluationValidator
        },
        {
          path:'/social-assistance/:id/manage-evaluation',
          name:'manage-evaluation',
          meta: { 
            breadcrumbs: [
              { name: 'Dashboard', path: '/social-assistance/:id' },
              { name: 'Kelola Penilaian', path: '/social-assistance/:id/manage-evaluation' },
            ],
            role:['verifikator'], 
            ability:['kelola_hasil_sementara'] 
          },
          component: Evaluation
        },
        {
          path:'/social-assistance/:id/manage-beneficiary',
          name:'manage-beneficiary-group',
          meta: { 
            breadcrumbs: [
              { name: 'Dashboard', path: '/social-assistance/:id' },
              { name: 'Kelola Kelompok Penerima', path: '/social-assistance/:id/manage-beneficiary' },
            ],
            role:['verifikator'], 
            ability:['kelola_penerima_bantuan'] 
          },
          component: ManageBeneficiary
        },
        {
          path:'/social-assistance/:id/manage-beneficiary/:beneficiary_group_id',
          name:'manage-beneficiary',
          meta: { 
            breadcrumbs: [
              { name: 'Dashboard', path: '/social-assistance/:id' },
              { name: 'Kelola Kelompok Penerima', path: '/social-assistance/:id/manage-beneficiary' },
              { name: 'Kelola Penerima Bantuan', path: '/social-assistance/:id/manage-beneficiary/:beneficiary_group_id' },
            ],
            role:['verifikator','validator'], 
            ability:['kelola_penerima_bantuan','lihat_penerima_bantuan'] 
          },
          component: Beneficiary
        },
        
        {
          path:'/social-assistance/:id/manage-evaluation/:submission_id',
          name:'ranking-evaluation-potential-beneficiary',
          meta: { 
            breadcrumbs: [
              { name: 'Dashboard', path: '/social-assistance/:id' },
              { name: 'Kelola Penilaian', path: '/social-assistance/:id/manage-evaluation' },
              { name: 'Kelola Calon Penerima', path: '/social-assistance/:id/manage-evaluation/:submission_id' },
            ],
            role:['validator','verifikator'], 
            ability:['kelola_hasil_sementara','lihat_hasil_sementara'] 
          },
          component: Ranking
        },
        {
          path:'/social-assistance/:id/manage-evaluation/:submission_id/history',
          name:'history-evaluation-potential-beneficiary',
          meta: { 
            breadcrumbs: [
              { name: 'Dashboard', path: '/social-assistance/:id' },
              { name: 'Kelola Penilaian', path: '/social-assistance/:id/manage-evaluation' },
              { name: 'Kelola Calon Penerima', path: '/social-assistance/:id/manage-evaluation/:submission_id' },
              { name: 'Riwayat Calon Penerima', path: '/social-assistance/:id/manage-evaluation/:submission_id/history' },
            ],
            role:['validator','verifikator'], 
            ability:['kelola_hasil_sementara','lihat_hasil_sementara'] 
          },
          component: EvaluationHistory
        },
        {
          path:'/submission',
          name:'submission',
          meta: { 
            breadcrumbs: [
              { name: 'Dashboard', path: '/dashboard' },
              { name: 'Pengajuan', path: '/submission' },
            ], 
            role: ['validator'], 
            ability:['lihat_periode_pendaftaran'] 
          },
          component: Submission
        },
        {
          path:'/beneficiary-group',
          name:'beneficiary-group',
          meta: { 
            breadcrumbs: [
              { name: 'Dashboard', path: '/dashboard' },
              { name: 'Lihat Kelompok Penerima', path: '/beneficary-group' },
            ], 
            role: ['validator'], 
            ability:['lihat_penerima_bantuan'] 
          },
          component: Validator
        },
        {
          path:'/submission-history',
          name:'submission-history',
          meta: { 
            breadcrumbs: [
              { name: 'Dashboard', path: '/dashboard' },
              { name: 'Riwayat Pengajuan', path: '/submission-history' },
            ], 
            role: ['validator'], 
            ability:['kelola_pengajuan'] 
          },
          component: History
        },        
      ]
    },

    {
      path:'/auth',
      component: AuthLayout,
      meta: { requiresAuth: false },
      children: [
        {
          path:'login',
          name:'login',
          component: Login,
          meta: { requiresAuth: false },
        },
        {
          path:'register',
          name:'register',
          component: Register,
          meta: { requiresAuth: false },
          
        }
      ]
    },
    {
      path: '/not-found',
      name: 'notfound',
      component: NotFound,
      meta: { title: 'Not Found', icon: 'el-icon-home', role: ['all'] },
    }
  ],
})

router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const authStore = useAuthStore();
  await authStore.checkAuth();

  const auth = computed(() => authStore.user);

  // Default requiresAuth ke true jika tidak didefinisikan
  const requiresAuth = to.meta.requiresAuth !== undefined ? to.meta.requiresAuth : true;

  // Jika rute tidak membutuhkan autentikasi (misalnya login, register, landing, notfound)
  if (!requiresAuth) {
    // Jika pengguna sudah login dan mencoba mengakses login/register, arahkan ke dashboard
    if ((to.name === 'login') && authStore.getIsLoggedIn && from.name !== 'dashboard') {
      next({ name: 'dashboard' });
      return;
    }
    next(); // Lanjutkan ke rute tanpa pengecekan lebih lanjut
    return;
  }

  // Jika rute membutuhkan autentikasi tetapi pengguna belum login, arahkan ke login
  if (requiresAuth && !authStore.getIsLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  // Jika pengguna sudah login, lakukan pengecekan role dan permission
  const userRole = auth.value?.role?.name || '';
  const userAbilities = auth.value?.role?.permissions ? [...auth.value.role.permissions] : [];
  const requiredRoles = Array.isArray(to.meta.role) ? to.meta.role : [to.meta.role];
  const requiredAbilities = Array.isArray(to.meta.ability) ? to.meta.ability : [];

  // Cek apakah user memiliki salah satu role yang diperlukan
  const hasRequiredRole = requiredRoles.includes(userRole) || requiredRoles.includes('all');

  // Cek apakah user memiliki salah satu ability yang diperlukan
  const hasRequiredAbility = !requiredAbilities.length || userAbilities.some((perm) => requiredAbilities.includes(perm));

  // Jika role dan ability sesuai, lanjutkan ke rute
  if (hasRequiredRole && hasRequiredAbility) {
    next();
    return;
  }

  // Jika tidak memiliki role atau ability yang sesuai, arahkan ke notfound
  next({ name: 'notfound' });
});

export default router
