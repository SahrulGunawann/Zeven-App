import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
// GoogleAuth removed


@Component({
  selector: 'app-welcome',
  template: `
    <ion-content class="zeven-bg" [scrollEvents]="true">
      <div class="welcome-container">
        <div class="slides-wrapper">
          <swiper-container #swiper (swiperslidechange)="onSlideChange()">
            <swiper-slide>
              <div class="slide-content">
                <div class="logo-box-welcome">
                  <img src="assets/icon/logo_zeven.png" alt="Zeven Logo" class="logo-img-welcome">
                </div>
                <h2>Selamat Datang di Zeven!</h2>
                <p>Terima kasih telah bergabung. Mari mulai perjalanan belanja social commerce Anda bersama kami.</p>
              </div>
            </swiper-slide>
            
            <swiper-slide>
              <div class="slide-content">
                <div class="icon-circle">
                  <ion-icon name="shield-checkmark-outline"></ion-icon>
                </div>
                <h2>Keamanan Terjamin</h2>
                <p>Setiap transaksi di Zeven dilindungi oleh sistem keamanan kami yang canggih untuk kenyamanan Anda.</p>
              </div>
            </swiper-slide>

            <swiper-slide>
              <div class="slide-content full-width-slide">
                <h2 style="margin-top: 20px;">Kebijakan Privasi</h2>
                <p style="font-size: 13px; margin-bottom: 12px;">Harap scroll sampai bawah untuk menyetujui kebijakan privasi kami.</p>
                
                <div class="privacy-scroll-area" (scroll)="onPrivacyScroll($event)">
                  <div class="privacy-text-content">
                    <h4>1. Informasi yang Kami Kumpulkan</h4>
                    <p>Kami mengumpulkan informasi yang Anda berikan langsung kepada kami saat mendaftar, termasuk nama lengkap, alamat email, dan informasi profil lainnya.</p>
                    
                    <h4>2. Penggunaan Informasi</h4>
                    <p>Informasi Anda digunakan untuk memproses transaksi, mengelola akun, memverifikasi identitas, dan meningkatkan layanan platform Zeven.</p>

                    <h4>3. Transaksi & DompetX</h4>
                    <p>Seluruh proses pembayaran dilakukan melalui enkripsi tingkat tinggi oleh <strong>DompetX</strong>. Sistem Zeven tidak pernah menyimpan detail kartu kredit atau debit Anda.</p>

                    <h4>4. Google Sign-In</h4>
                    <p>Kami mengumpulkan informasi dasar yang diizinkan oleh Google (nama, email, foto profil) semata-mata untuk mempermudah pendaftaran dan login akun Anda.</p>

                    <h4>5. Keamanan Data</h4>
                    <p>Kami menerapkan langkah-langkah teknis kuat: enkripsi hashing untuk kata sandi dan proteksi SSL/TLS (HTTPS) untuk seluruh transfer data.</p>

                    <h4>6. Penghapusan Akun & Data</h4>
                    <p>Sesuai ketentuan Google Play Store, Anda berhak meminta penghapusan akun secara permanen melalui email <strong>ubp.event.management@gmail.com</strong>.</p>
                    
                    <h4>7. Perubahan Kebijakan</h4>
                    <p>Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu. Perubahan signifikan akan diberitahukan melalui notifikasi aplikasi atau email resmi.</p>

                    <h4>8. Kontak & Bantuan</h4>
                    <p><strong>ZevenDev</strong><br>Email: ubp.event.management@gmail.com<br>Karawang, Jawa Barat, Indonesia.</p>
                    
                    <div class="scroll-finish-indicator" *ngIf="!hasReadToBottom">
                      <ion-icon name="arrow-down-outline"></ion-icon>
                      Scroll ke bawah untuk lanjut
                    </div>
                  </div>
                </div>
                
                <div class="privacy-accept-box" [class.locked]="!hasReadToBottom">
                  <ion-item lines="none" class="privacy-item">
                    <ion-checkbox slot="start" [(ngModel)]="isPrivacyAccepted" [disabled]="!hasReadToBottom"></ion-checkbox>
                    <ion-label>Saya setuju dengan <b>Kebijakan Privasi</b> Zeven</ion-label>
                  </ion-item>
                  <p class="lock-hint" *ngIf="!hasReadToBottom">Silakan baca dokumen sampai akhir</p>
                </div>
              </div>
            </swiper-slide>
          </swiper-container>
        </div>

        <div class="footer-actions">
          <div class="dots-indicator">
            <span *ngFor="let s of [0,1,2]" class="dot" [class.active]="activeSlide === s"></span>
          </div>
          
          <ion-button *ngIf="activeSlide < 2" expand="block" fill="clear" color="primary" (click)="nextSlide()">
            Lanjut
            <ion-icon name="arrow-forward" slot="end"></ion-icon>
          </ion-button>
          
          <ion-button *ngIf="activeSlide === 2" expand="block" class="zeven-gradient-btn" (click)="finishWelcome()" [disabled]="!isPrivacyAccepted">
            Mulai Belanja
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .welcome-container { height: 100%; display: flex; flex-direction: column; }
    .slides-wrapper { flex: 1; min-height: 0; }
    swiper-container { height: 100%; width: 100%; }
    .slide-content { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; }
    .full-width-slide { padding: 20px; justify-content: flex-start; }
    
    .logo-box-welcome { 
      display: flex; align-items: center; justify-content: center; margin-bottom: 32px;
    }
    .logo-img-welcome {
      width: 120px;
      height: 120px;
      object-fit: contain;
      filter: drop-shadow(0 10px 20px rgba(17,66,50,0.15));
    }

    .icon-circle { width: 120px; height: 120px; border-radius: 60px; background: #F9F6F0; display: flex; align-items: center; justify-content: center; margin-bottom: 32px; font-size: 60px; color: #114232; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
    .slide-content h2 { font-size: 24px; font-weight: 800; color: #114232; margin-bottom: 16px; }
    .slide-content p { font-size: 15px; color: #666; line-height: 1.6; }
    
    .privacy-scroll-area { 
      flex: 1; width: 100%; background: #fdfdfd; border-radius: 20px; border: 1.5px solid #eee; overflow-y: auto; text-align: left; padding: 20px; margin-bottom: 16px; 
    }
    .privacy-text-content h4 { font-size: 14px; font-weight: 800; color: #114232; margin: 16px 0 8px; }
    .privacy-text-content p { font-size: 13px; color: #555; line-height: 1.6; margin-bottom: 0; }
    .scroll-finish-indicator { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: #fff7e6; color: #d48806; font-size: 12px; font-weight: 700; border-radius: 12px; margin-top: 20px; border: 1px dashed #ffd591; }

    .privacy-accept-box { width: 100%; background: white; border-radius: 16px; padding: 8px; border: 1.5px solid #eee; transition: 0.3s; }
    .privacy-accept-box.locked { background: #fafafa; opacity: 0.8; }
    .privacy-item { --padding-start: 4px; font-size: 13px; }
    .lock-hint { font-size: 11px; color: #eb445a; font-weight: 700; margin: 4px 0 0 12px; }
    
    .footer-actions { padding: 20px; padding-bottom: calc(20px + env(safe-area-inset-bottom)); background: white; box-shadow: 0 -10px 20px rgba(0,0,0,0.02); }
    .dots-indicator { display: flex; justify-content: center; gap: 8px; margin-bottom: 20px; }
    .dot { width: 8px; height: 8px; border-radius: 4px; background: #ddd; transition: 0.3s; }
    .dot.active { width: 24px; background: #C68E17; }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WelcomePage {
  @ViewChild('swiper') swiperEl!: ElementRef;
  activeSlide = 0;
  isPrivacyAccepted = false;
  hasReadToBottom = false;

  constructor(private router: Router) { }

  onSlideChange() {
    this.activeSlide = this.swiperEl.nativeElement.swiper.activeIndex;
  }

  onPrivacyScroll(event: any) {
    const element = event.target;
    // Cek jika sudah scroll sampai bawah (toleransi 10px)
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 10) {
      this.hasReadToBottom = true;
    }
  }

  nextSlide() {
    this.swiperEl.nativeElement.swiper.slideNext();
  }

  finishWelcome() {
    if (this.isPrivacyAccepted && this.hasReadToBottom) {
      const user = JSON.parse(localStorage.getItem('current_user') || '{}');
      if (user.id) {
        localStorage.setItem(`has_seen_welcome_${user.id}`, 'true');
      }
      this.router.navigate(['/tabs/home'], { replaceUrl: true });
    }
  }
}

@Component({
  selector: 'app-login',
  template: `
    <ion-content class="zeven-bg">
      <div class="auth-header ion-text-center">
        <div class="logo-container">
          <img src="assets/icon/logo_zeven.png" alt="Zeven Logo" class="auth-logo">
        </div>
        <h1 class="zeven-heading">Selamat Datang</h1>
        <p class="zeven-subheading">Masuk untuk melanjutkan ke Zeven</p>
      </div>

      <div class="auth-form ion-padding">
        <ion-item lines="none" class="zeven-input">
          <ion-icon name="mail-outline" slot="start" color="medium"></ion-icon>
          <ion-input type="email" placeholder="Alamat Email" [(ngModel)]="email"></ion-input>
        </ion-item>

        <ion-item lines="none" class="zeven-input">
          <ion-icon name="lock-closed-outline" slot="start" color="medium"></ion-icon>
          <ion-input [type]="showPassword ? 'text' : 'password'" placeholder="Kata Sandi" [(ngModel)]="password"></ion-input>
          <ion-icon [name]="showPassword ? 'eye-off-outline' : 'eye-outline'" slot="end" color="medium" (click)="togglePassword()"></ion-icon>
        </ion-item>

        <ion-button expand="block" class="zeven-gradient-btn ion-margin-top" (click)="login()" [disabled]="isLoading">
          <ion-spinner name="crescent" *ngIf="isLoading" slot="start"></ion-spinner>
          Masuk
        </ion-button>

        <!-- Tombol Google Dihapus karena permintaan User -->

        <div class="register-link">
          Belum punya akun? <a (click)="goToRegister()">Daftar</a>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .auth-header {
      padding: calc(40px + var(--ion-safe-area-top, 0px)) 24px 20px;
    }
    .logo-container {
      margin-bottom: 20px;
      display: flex;
      justify-content: center;
    }
    .auth-logo {
      width: 80px;
      height: 80px;
      filter: drop-shadow(0 8px 16px rgba(17, 66, 50, 0.15));
    }
    .forgot-password {
      text-align: right;
      margin-top: 8px;
    }
    .forgot-password a {
      color: var(--ion-color-secondary);
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
    }
    .divider {
      text-align: center;
      margin: 30px 0;
      position: relative;
    }
    .divider::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 40%;
      height: 1px;
      background: var(--ion-color-medium);
      opacity: 0.2;
    }
    .divider::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      width: 40%;
      height: 1px;
      background: var(--ion-color-medium);
      opacity: 0.2;
    }
    .divider span {
      background: var(--ion-background-color);
      padding: 0 10px;
      color: var(--ion-color-medium);
      font-size: 14px;
      font-weight: 500;
    }
    .social-login {
      display: flex;
      gap: 16px;
    }
    .social-btn {
      flex: 1;
      --border-radius: 12px;
      --border-color: rgba(0,0,0,0.1);
      --border-width: 1px;
      text-transform: none;
      font-weight: 500;
    }
    .register-link {
      text-align: center;
      margin-top: 40px;
      color: var(--ion-color-medium);
      font-size: 14px;
    }
    .register-link a {
      color: var(--ion-color-primary);
      font-weight: 600;
      cursor: pointer;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginPage {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { 
    console.log('DEBUG: Zeven LoginPage Initialized');
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    if (!this.email || !this.password) {
      this.presentToast('Harap isi semua kolom', 'information-circle-outline');
      return;
    }

    this.isLoading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        // Cek Role: Hanya Buyer yang boleh masuk ke APK
        if (res.user && res.user.role !== 'buyer') {
          this.isLoading = false;
          const roleMsg = res.user.role === 'seller' ? 'Seller' : 'Admin';
          this.presentToast(`Akun Anda adalah ${roleMsg}. Silakan kelola melalui Web Zeven.`, 'information-circle-outline');
          return;
        }

        this.isLoading = false;
        
        const hasSeenWelcome = localStorage.getItem(`has_seen_welcome_${res.user?.id}`);
        
        if (!hasSeenWelcome) {
          this.router.navigate(['/welcome'], { replaceUrl: true });
        } else {
          this.router.navigate(['/tabs/home'], { replaceUrl: true });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login Error:', err);
        const errorMsg = err.error?.message || 'Email atau password salah';
        this.presentToast(errorMsg, 'close-circle-outline');
      }
    });
  }

  // loginWithGoogle dihapus agar tidak terjadi error SDK di APK

  async presentToast(message: string, icon: string = 'checkmark-circle') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'middle',
      icon: icon,
      cssClass: 'zeven-toast'
    });
    toast.present();
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}

@Component({
  selector: 'app-register',
  template: `
    <ion-content class="zeven-bg">
      <div class="auth-header">
        <ion-buttons slot="start" style="margin-bottom: 20px; margin-left: -10px;">
          <ion-button (click)="goBack()">
            <ion-icon name="arrow-back-outline" slot="icon-only" color="dark"></ion-icon>
          </ion-button>
        </ion-buttons>
        <h1 class="zeven-heading">Buat Akun</h1>
        <p class="zeven-subheading">Bergabung dengan marketplace Zeven</p>
      </div>

      <div class="auth-form ion-padding">
        <ion-item lines="none" class="zeven-input">
          <ion-icon name="person-outline" slot="start" color="medium"></ion-icon>
          <ion-input type="text" placeholder="Nama Lengkap" [(ngModel)]="name"></ion-input>
        </ion-item>

        <ion-item lines="none" class="zeven-input">
          <ion-icon name="mail-outline" slot="start" color="medium"></ion-icon>
          <ion-input type="email" placeholder="Alamat Email" [(ngModel)]="email"></ion-input>
        </ion-item>

        <ion-item lines="none" class="zeven-input">
          <ion-icon name="lock-closed-outline" slot="start" color="medium"></ion-icon>
          <ion-input type="password" placeholder="Kata Sandi" [(ngModel)]="password"></ion-input>
        </ion-item>

        <ion-item lines="none" class="zeven-input">
          <ion-icon name="shield-checkmark-outline" slot="start" color="medium"></ion-icon>
          <ion-input type="password" placeholder="Konfirmasi Kata Sandi" [(ngModel)]="confirmPassword"></ion-input>
        </ion-item>

        <ion-button expand="block" class="zeven-gradient-btn ion-margin-top" (click)="register()" [disabled]="isLoading">
          <ion-spinner name="crescent" *ngIf="isLoading" slot="start"></ion-spinner>
          Buat Akun
        </ion-button>

        <div class="register-link">
          Sudah punya akun? <a (click)="goBack()">Masuk</a>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .auth-header {
      padding: calc(40px + var(--ion-safe-area-top, 0px)) 24px 30px;
    }
    .register-link {
      text-align: center;
      margin-top: 40px;
      color: var(--ion-color-medium);
      font-size: 14px;
    }
    .register-link a {
      color: var(--ion-color-primary);
      font-weight: 600;
      cursor: pointer;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RegisterPage {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastCtrl: ToastController
  ) { }

  async register() {
    if (!this.name || !this.email || !this.password) {
      this.presentToast('Harap isi semua kolom', 'information-circle-outline');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.presentToast('Konfirmasi kata sandi tidak cocok', 'lock-open-outline');
      return;
    }

    this.isLoading = true;
    this.authService.registerBuyer(this.name, this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.presentToast('Pendaftaran Berhasil! Silakan masuk.', 'person-add-outline');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Register Error:', err);
        const errorMsg = err.error?.message || 'Pendaftaran gagal. Pastikan email belum terdaftar.';
        this.presentToast(errorMsg, 'close-circle-outline');
      }
    });
  }

  async presentToast(message: string, icon: string = '') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'middle',
      icon: icon,
      cssClass: 'zeven-toast'
    });
    toast.present();
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}
