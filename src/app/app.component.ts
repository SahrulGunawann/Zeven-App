import { Component, Optional } from '@angular/core';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { AuthService } from './services/auth.service';
import { PushNotifications } from '@capacitor/push-notifications';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private router: Router,
    private authService: AuthService,
    @Optional() private routerOutlet: IonRouterOutlet
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.handleBackButton();
      this.setupPushNotifications();
      
      // Handle initial redirection
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/tabs/home'], { replaceUrl: true });
      } else {
        this.router.navigate(['/login'], { replaceUrl: true });
      }

      // Hide native splash screen after logic is done
      setTimeout(() => {
        SplashScreen.hide();
      }, 500);
    });
  }

  handleBackButton() {
    this.platform.backButton.subscribeWithPriority(999, () => {
      const url = this.router.url;
      
      if (url === '/login' || url === '/tabs/home' || url === '/') {
        App.exitApp();
      } 
      else if (url.includes('/register')) {
        this.router.navigate(['/login'], { replaceUrl: true });
      }
      else {
        // Cek jika bisa back secara history
        if (window.history.length > 1) {
          window.history.back();
        } else {
          this.router.navigate(['/tabs/home'], { replaceUrl: true });
        }
      }
    });
  }

  async setupPushNotifications() {
    // 1. Cek apakah ini platform native (Android/iOS)
    if (!this.platform.is('capacitor')) {
      return;
    }

    try {
      // 2. Request permission
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        return;
      }

      // 3. Register with Apple / Google to get token
      await PushNotifications.register();

      // 4. Listener saat registrasi berhasil (Dapat token)
      PushNotifications.addListener('registration', (token) => {
        // Nanti di sini kita panggil API Backend untuk simpan token ke DB user
        if (this.authService.isAuthenticated()) {
          this.authService.updateFcmToken(token.value).subscribe();
        }
      });

      // 5. Listener saat registrasi gagal
      PushNotifications.addListener('registrationError', (err) => {
      });

      // 6. Listener saat notifikasi masuk (App sedang terbuka)
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
      });

      // 7. Listener saat notifikasi di-klik oleh user
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        const data = notification.notification.data;
        if (data.type === 'chat') {
          this.router.navigate(['/tabs/chat']);
        }
      });

    } catch (e) {
      console.error('DEBUG: Error setting up push notifications', e);
    }
  }
}
