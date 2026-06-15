import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom" class="custom-tab-bar">
        <ion-tab-button tab="home">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Beranda</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="history">
          <ion-icon name="receipt-outline"></ion-icon>
          <ion-label>Pesanan</ion-label>
        </ion-tab-button>

        <!-- Empty center tab just for spacing -->
        <ion-tab-button tab="cart" class="center-tab-empty">
          <ion-icon name="cart" style="opacity: 0;"></ion-icon>
        </ion-tab-button>

        <ion-tab-button tab="chat-list">
          <ion-icon name="chatbubbles-outline"></ion-icon>
          <ion-label>Chat</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profile">
          <ion-icon name="person-outline"></ion-icon>
          <ion-label>Profil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>

    <!-- Floating Cart Button Outside Tab Bar to Prevent Clipping -->
    <div class="custom-fab-container" (click)="goToCart()">
      <div class="fab-wrapper">
        <ion-icon name="cart"></ion-icon>
      </div>
    </div>
  `,
  styles: [`
    .custom-tab-bar {
      --background: white;
      border-top-left-radius: 24px;
      border-top-right-radius: 24px;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
      border: none;
      height: 65px;
      padding-bottom: env(safe-area-inset-bottom);
    }
    ion-tab-button {
      --color: var(--ion-color-medium);
      --color-selected: var(--ion-color-primary);
    }
    ion-tab-button ion-icon { font-size: 24px; margin-bottom: 4px; }
    ion-tab-button ion-label { font-size: 11px; font-weight: 500; }
    
    .center-tab-empty {
      pointer-events: none; /* Make unclickable as FAB is overlaying */
    }

    .custom-fab-container {
      position: absolute;
      bottom: calc(30px + env(safe-area-inset-bottom));
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999; /* Ensure it's above everything */
      cursor: pointer;
    }

    .fab-wrapper {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #114232 0%, #295546 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4px 15px rgba(17,66,50,0.3);
      border: 5px solid var(--ion-background-color);
      transition: transform 0.2s;
    }

    .fab-wrapper:active {
      transform: scale(0.95);
    }

    .fab-wrapper ion-icon {
      color: white;
      font-size: 28px;
      margin: 0;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TabsPage {
  constructor(private router: Router) { }

  goToCart() {
    this.router.navigate(['/tabs/cart']);
  }
}
