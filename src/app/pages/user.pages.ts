import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, NavController, ActionSheetController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { OrderService } from '../services/order.service';
import { ProductService } from '../services/product.service';
import { ChatService } from '../services/chat.service';
import { AddressService } from '../services/address.service';
import { VoucherService } from '../services/voucher.service';

@Component({
  selector: 'app-order-tracking',
  template: `
    <ion-content class="zeven-bg">
      <div class="zeven-custom-header" style="padding-top: 40px; padding-bottom: 12px; background: #F9F6F0;">
        <div class="header-content-row" style="display: flex; align-items: center; padding: 0 8px;">
          <ion-button (click)="goBack()" fill="clear">
            <ion-icon name="arrow-back-outline" color="dark" slot="icon-only"></ion-icon>
          </ion-button>
          <h2 class="zeven-heading" style="margin: 0 auto; font-size: 18px; font-weight: 800; color: #114232; transform: translateX(-24px);">Status Pesanan</h2>
        </div>
      </div>
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content pullingIcon="chevron-down-circle-outline" pullingText="Tarik untuk memuat ulang..." refreshingSpinner="crescent" refreshingText="Memuat status terbaru..."></ion-refresher-content>
      </ion-refresher>
      <div class="ion-padding">
      <div *ngIf="isLoading" class="ion-text-center ion-padding">
        <ion-spinner color="primary"></ion-spinner>
      </div>

      <div *ngIf="!isLoading && order">
        <div class="order-id-card">
          <div>
            <span class="label">ID Pesanan</span>
            <h4>#ORD-{{ order.id.toString().padStart(5, '0') }}</h4>
          </div>
          <ion-button fill="clear" color="secondary" size="small" (click)="copyOrderId()">Salin</ion-button>
        </div>

        <div class="tracking-card">
          <div class="track-step" [ngClass]="{'completed': isStepCompleted('pending'), 'active': isStepActive('pending')}">
            <div class="icon-box"><ion-icon name="receipt"></ion-icon></div>
            <div class="step-info">
              <h4>{{ order.status === 'pending' ? 'Menunggu Pembayaran' : 'Pembayaran Berhasil' }}</h4>
              <p>{{ order.status === 'pending' ? 'Silakan selesaikan pembayaran Anda' : 'Pesanan Anda sedang diproses oleh penjual' }}</p>
              <span>{{ order.created_at | date:'MMM d, h:mm a' }}</span>
            </div>
          </div>
          
          <div class="track-step" [ngClass]="{'completed': isStepCompleted('processed'), 'active': isStepActive('processed'), 'pending': !isStepCompleted('processed')}">
            <div class="icon-box"><ion-icon name="cube"></ion-icon></div>
            <div class="step-info">
              <h4>Diproses</h4>
              <p>Penjual sedang menyiapkan paket Anda</p>
            </div>
          </div>
          
          <div class="track-step" [ngClass]="{'completed': isStepCompleted('shipped'), 'active': isStepActive('shipped'), 'pending': !isStepCompleted('shipped')}">
            <div class="icon-box"><ion-icon name="airplane"></ion-icon></div>
            <div class="step-info">
              <h4>Dikirim</h4>
              <p>Paket sedang dalam perjalanan</p>
            </div>
          </div>

          <div class="track-step" [ngClass]="{'completed': isStepCompleted('completed'), 'active': isStepActive('completed'), 'pending': !isStepCompleted('completed')}">
            <div class="icon-box"><ion-icon name="home"></ion-icon></div>
            <div class="step-info">
              <h4>Diterima</h4>
              <p>Paket telah sampai di tujuan</p>
            </div>
          </div>
        </div>

        <div class="delivery-info">
          <h3>Rincian Pembelian</h3>
          <div class="courier" *ngFor="let item of order.items">
            <img [src]="productService.storageUrl + item.product?.image" 
                 onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=100'"
                 style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
            <div>
              <h4>{{ item.product?.name }}</h4>
              <span>{{ item.quantity }} x Rp{{ Number(item.price).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}</span>
            </div>
          </div>
          <div class="divider" style="margin: 12px 0;"></div>
          <div style="display: flex; justify-content: space-between;">
            <span>Total Pembayaran</span>
            <strong class="zeven-price">Rp{{ Number(order.final_price).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}</strong>
          </div>
        </div>

        <div class="delivery-info ion-margin-top">
          <h3>Alamat Pengiriman</h3>
          <p style="font-size: 13px; color: var(--ion-color-medium);">{{ order.shipping_address }}</p>
        </div>
      </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .order-id-card { background: white; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
    .label { font-size: 12px; color: var(--ion-color-medium); }
    .order-id-card h4 { margin: 4px 0 0; font-weight: 700; color: var(--ion-color-primary); }
    
    .tracking-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); margin-bottom: 20px; }
    .track-step { display: flex; gap: 16px; position: relative; padding-bottom: 30px; }
    .track-step:last-child { padding-bottom: 0; }
    .track-step::before { content: ''; position: absolute; left: 24px; top: 48px; bottom: 0; width: 2px; background: #eee; z-index: 1; }
    .track-step:last-child::before { display: none; }
    
    .track-step.completed::before, .track-step.active::before { background: var(--ion-color-primary); }
    
    .icon-box { width: 48px; height: 48px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px; z-index: 2; position: relative; }
    .track-step.completed .icon-box { background: var(--ion-color-primary); color: white; }
    .track-step.active .icon-box { background: var(--ion-color-secondary); color: white; box-shadow: 0 0 0 4px rgba(198,142,23,0.2); }
    .track-step.pending .icon-box { background: #eee; color: var(--ion-color-medium); }
    
    .step-info { flex: 1; padding-top: 4px; }
    .step-info h4 { margin: 0 0 4px; font-size: 15px; font-weight: 600; }
    .step-info p { margin: 0 0 4px; font-size: 13px; color: var(--ion-color-medium); }
    .step-info span { font-size: 11px; color: var(--ion-color-medium); }
    
    .track-step.active .step-info h4 { color: var(--ion-color-secondary); }
    .track-step.pending .step-info { opacity: 0.5; }
    
    .delivery-info { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
    .delivery-info h3 { margin: 0 0 16px; font-size: 16px; font-weight: 700; }
    .courier { display: flex; align-items: center; gap: 12px; }
    .courier ion-icon { font-size: 24px; color: var(--ion-color-primary); background: rgba(17,66,50,0.1); padding: 8px; border-radius: 8px; }
    .courier h4 { margin: 0 0 4px; font-size: 14px; }
    .courier span { font-size: 12px; color: var(--ion-color-medium); }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OrderTrackingPage implements OnInit {
  order: any;
  isLoading = false;
  Number = Number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
    private orderService: OrderService,
    public productService: ProductService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchOrderDetails(parseInt(id));
    }
  }

  fetchOrderDetails(id: number, event?: any) {
    if (!event) this.isLoading = true;
    this.orderService.getOrderDetails(id).subscribe({
      next: (res) => {
        this.order = res;
        this.isLoading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        if (event) event.target.complete();
        this.presentToast('Gagal memuat detail pesanan');
      }
    });
  }

  doRefresh(event: any) {
    if (this.order && this.order.id) {
      this.fetchOrderDetails(this.order.id, event);
    } else {
      event.target.complete();
    }
  }

  isStepCompleted(step: string): boolean {
    if (!this.order) return false;
    const statusOrder = ['pending', 'processed', 'shipped', 'completed', 'cancelled', 'canceled'];
    const currentIdx = statusOrder.indexOf(this.order.status);
    const stepIdx = statusOrder.indexOf(step);
    if (this.order.status === 'cancelled') return false;
    return stepIdx <= currentIdx;
  }

  isStepActive(step: string): boolean {
    return this.order?.status === step;
  }

  copyOrderId() {
    this.presentToast('ID Pesanan disalin!');
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'middle',
      icon: 'copy-outline',
      cssClass: 'zeven-toast'
    });
    toast.present();
  }

  goBack() { window.history.back(); }
}

@Component({
  selector: 'app-chat-list',
  template: `
    <ion-content class="zeven-bg">
      <div class="zeven-custom-header" style="padding-top: 40px; padding-bottom: 12px; background: #F9F6F0;">
        <div class="header-content-row" style="display: flex; align-items: center; padding: 0 16px;">
          <h2 class="zeven-heading" style="margin: 0; font-size: 20px; font-weight: 800; color: #114232;">Kotak Masuk</h2>
        </div>
      </div>
      <div *ngIf="isLoading" class="ion-text-center ion-padding">
        <ion-spinner color="primary"></ion-spinner>
      </div>

      <div *ngIf="!isLoading && chats.length === 0" class="empty-chat ion-padding ion-text-center">
        <ion-icon name="chatbubbles-outline"></ion-icon>
        <h3>Belum ada chat</h3>
        <p>Mulai percakapan dengan penjual untuk bertanya tentang produk.</p>
        <ion-button class="zeven-gradient-btn" (click)="goHome()">Belanja Sekarang</ion-button>
      </div>

      <ion-list lines="full" *ngIf="!isLoading && chats.length > 0">
        <ion-item-sliding *ngFor="let chat of chats">
          <ion-item button (click)="goToChat(chat.id, chat.name, chat.avatar)" class="chat-item">
            <div slot="start" class="chat-avatar">
              <img [src]="authService.getProfileImage(chat.avatar, chat.name)" 
                  (error)="$any($event.target).src = 'https://ui-avatars.com/api/?name=' + chat.name + '&background=114232&color=fff'"
                  alt="PP">
            </div>
            <ion-label>
              <div class="chat-header">
                <h2>{{ chat.name }}</h2>
                <span class="chat-time">{{ chat.last_time }}</span>
              </div>
              <p class="last-message" [ngClass]="{'unread': chat.unread_count > 0}">
                {{ chat.last_message }}
              </p>
            </ion-label>
            <ion-badge slot="end" color="primary" *ngIf="chat.unread_count > 0">
              {{ chat.unread_count }}
            </ion-badge>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="danger" (click)="confirmClear(chat)">
              <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
      <div style="height: 90px; width: 100%;"></div>
    </ion-content>
  `,
  styles: [`
    .empty-chat { margin-top: 100px; }
    .empty-chat ion-icon { font-size: 64px; color: var(--ion-color-medium); opacity: 0.5; }
    .empty-chat h3 { font-weight: 700; margin: 16px 0 8px; }
    .empty-chat p { color: var(--ion-color-medium); font-size: 14px; margin-bottom: 24px; }
    
    .chat-item { --padding-start: 16px; --padding-top: 12px; --padding-bottom: 12px; --background: white; }
    .chat-avatar { width: 50px; height: 50px; border-radius: 50%; background: var(--ion-color-primary); color: white; display: flex; justify-content: center; align-items: center; font-weight: 700; position: relative; overflow: hidden; }
    .chat-avatar img { width: 100%; height: 100%; object-fit: cover; }
    
    .chat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .chat-header h2 { margin: 0; font-size: 16px; font-weight: 700; }
    .chat-time { font-size: 12px; color: var(--ion-color-medium); }
    
    .last-message { margin: 0; font-size: 13px; color: var(--ion-color-medium); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .last-message.unread { color: var(--ion-color-dark); font-weight: 600; }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChatListPage implements OnInit, OnDestroy {
  chats: any[] = [];
  isLoading = false;
  polling: any;
  currentUserId: number | null = null;

  constructor(
    private router: Router,
    private chatService: ChatService,
    public authService: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentUser()?.id;
    this.fetchChats();
    this.polling = setInterval(() => this.fetchChats(), 5000);
  }

  ngOnDestroy() {
    if (this.polling) clearInterval(this.polling);
  }

  fetchChats() {
    const token = this.authService.getToken();
    if (!token) return;

    this.isLoading = this.chats.length === 0;
    this.chatService.getChatList().subscribe({
      next: (res) => {
        // Handle locally hidden chats (they reappear if a NEW message arrives)
        const hiddenMap = JSON.parse(localStorage.getItem('zeven_hidden_chats_v2') || '{}');
        let mapsChanged = false;

        this.chats = res.filter((c: any) => {
          if (hiddenMap[c.id]) {
            // If there's an unread message OR the message text changed, unhide it
            if (c.unread_count > 0 || c.last_message !== hiddenMap[c.id].lastText) {
              delete hiddenMap[c.id];
              mapsChanged = true;
              return true;
            }
            return false;
          }
          return true;
        });

        if (mapsChanged) {
          localStorage.setItem('zeven_hidden_chats_v2', JSON.stringify(hiddenMap));
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  async confirmClear(chat: any) {
    const alert = await this.alertCtrl.create({
      header: 'Bersihkan Obrolan?',
      message: 'Apakah Anda yakin ingin menghapus riwayat obrolan ini dari daftar Anda?',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            this.hideChatLocally(chat);
            this.chats = this.chats.filter(c => c.id !== chat.id);
            this.presentToast('Percakapan telah dibersihkan', 'trash-outline');
          }
        }
      ]
    });
    await alert.present();
  }

  hideChatLocally(chat: any) {
    const hiddenMap = JSON.parse(localStorage.getItem('zeven_hidden_chats_v2') || '{}');
    // Store the clearing timestamp locally for this user
    localStorage.setItem(`cleared_chat_${this.currentUserId}_${chat.id}`, new Date().getTime().toString());

    // Store the current last message so we know when a NEW one arrives
    hiddenMap[chat.id] = {
      lastText: chat.last_message,
      hiddenAt: new Date().getTime()
    };
    localStorage.setItem('zeven_hidden_chats_v2', JSON.stringify(hiddenMap));
  }

  async presentToast(message: string, icon: string = 'checkmark-circle-outline') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'middle',
      icon: icon,
      cssClass: 'zeven-toast'
    });
    toast.present();
  }

  goToChat(id: number, name: string, image: string) {
    this.router.navigate(['/chat', { id, name, image }]);
  }

  goHome() { this.router.navigate(['/tabs/home']); }
}

@Component({
  selector: 'app-chat',
  template: `
    <ion-content class="zeven-bg" #chatContent>
      <div class="zeven-custom-header" style="padding-top: 40px; padding-bottom: 10px; background: white; border-bottom: 1px solid #f0f0f0;">
        <div class="header-content-row" style="display: flex; align-items: center; padding: 0 8px; gap: 8px;">
          <ion-button (click)="goBack()" fill="clear" style="--padding-start: 8px; --padding-end: 8px;">
            <ion-icon name="arrow-back-outline" color="dark" slot="icon-only"></ion-icon>
          </ion-button>
          <div class="chat-header-title" style="display: flex; align-items: center; gap: 10px;">
            <div class="avatar" style="width: 36px; height: 36px; border-radius: 50%; overflow: hidden; background: #eee;">
              <img [src]="authService.getProfileImage(receiverImage, receiverName)" 
                   (error)="$any($event.target).src = 'https://ui-avatars.com/api/?name=' + receiverName + '&background=114232&color=fff'"
                   style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="info">
              <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: #333;">{{ receiverName }}</h4>
              <span [style.color]="getRoleColor(receiverRole)" style="font-size: 10px; font-weight: 700; text-transform: uppercase;">{{ getRoleLabel(receiverRole) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="chat-messages">
        <div class="chat-date" *ngIf="messages.length > 0">Percakapan Dimulai</div>
        
        <div *ngFor="let msg of messages" class="message" [ngClass]="{'sent': msg.sender_id == currentUserId, 'received': msg.sender_id != currentUserId}">
          <div class="bubble" (click)="msg.sender_id == currentUserId && canEdit(msg) ? showMessageOptions(msg) : null" [class.clickable]="msg.sender_id == currentUserId && canEdit(msg)">
            {{ msg.message }}
          </div>
          <div class="msg-footer">
            <span class="edited-tag" *ngIf="msg.is_edited">diedit</span>
            <span class="time">{{ msg.created_at | date:'h:mm a' }}</span>
          </div>
        </div>
      </div>
      <div style="height: 80px; width: 100%;"></div>
    </ion-content>

    <ion-footer class="ion-no-border">
      <div class="chat-input-bar">
        <div class="input-box">
          <input type="text" placeholder="Ketik pesan..." [(ngModel)]="newMessage" (keyup.enter)="send()">
        </div>
        <ion-button class="send-btn" fill="clear" (click)="send()" [disabled]="!newMessage.trim()">
          <ion-icon name="send" color="primary" slot="icon-only"></ion-icon>
        </ion-button>
      </div>
      <div style="height: env(safe-area-inset-bottom); background: white;"></div>
    </ion-footer>
  `,
  styles: [`
    .chat-header-title { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--ion-color-primary); color: white; display: flex; justify-content: center; align-items: center; font-weight: 700; }
    .info h4 { margin: 0; font-size: 15px; font-weight: 600; }
    .info span { font-size: 11px; color: var(--ion-color-success); font-weight: 500; }
    
    .chat-date { text-align: center; font-size: 12px; color: var(--ion-color-medium); margin: 16px 0; }
    
    .message { display: flex; flex-direction: column; margin-bottom: 16px; max-width: 80%; }
    .message.received { align-items: flex-start; }
    .message.sent { align-items: flex-end; margin-left: auto; }
    
    .bubble { padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; }
    .message.received .bubble { background: white; border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); color: var(--ion-color-dark); }
    .message.sent .bubble { background: var(--ion-color-primary); color: white; border-bottom-right-radius: 4px; box-shadow: 0 2px 8px rgba(17,66,50,0.2); }
    
    .time { font-size: 11px; color: var(--ion-color-medium); margin-top: 4px; display: flex; align-items: center; gap: 4px; }
    .msg-footer { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    .edited-tag { font-size: 10px; color: var(--ion-color-medium); font-style: italic; opacity: 0.7; }
    
    .chat-input-bar { background: white; padding: 10px 16px; display: flex; align-items: center; gap: 8px; box-shadow: 0 -2px 10px rgba(0,0,0,0.03); }
    .input-box { flex: 1; background: var(--ion-background-color); border-radius: 20px; padding: 10px 16px; }
    .input-box input { border: none; background: transparent; width: 100%; outline: none; font-size: 14px; }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild(IonicModule ? 'ion-content' : 'ion-content') content: any; // Fallback for ViewChild access
  @ViewChild('messageContainer') private messageContainer: any;
  // Standard Ionic way:
  @ViewChild(IonicModule ? 'ion-content' : 'ion-content', { static: false }) ionContent!: any;
  messages: any[] = [];
  newMessage = '';
  receiverId: number | null = null;
  receiverName = 'Memuat...';
  receiverImage: string | null = null;
  receiverRole: string | null = null;
  currentUserId: number | null = null;
  polling: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private chatService: ChatService,
    public authService: AuthService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentUser()?.id;
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.receiverId = parseInt(params['id']);
        this.receiverName = params['name'] || 'Memuat...';
        this.receiverImage = params['image'] || null;
        this.receiverRole = params['role'] || null;

        // Fetch latest user info to get the role
        this.chatService.getUserInfo(this.receiverId).subscribe({
          next: (res) => {
            this.receiverName = res.name;
            this.receiverImage = res.avatar;
            this.receiverRole = res.role;
          },
          error: () => {
            if (this.receiverName === 'Memuat...') {
              this.receiverName = 'User';
            }
          }
        });

        this.fetchMessages();
      }
    });

    this.polling = setInterval(() => {
      if (this.receiverId) this.fetchMessages();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.polling) clearInterval(this.polling);
  }

  getRoleLabel(role: string | null): string {
    if (!role) return 'Memuat...';
    const lower = role.toLowerCase();
    if (lower === 'admin') return 'Admin';
    if (lower === 'seller') return 'Seller';
    if (lower === 'buyer') return 'Buyer';
    return role;
  }

  getRoleColor(role: string | null): string {
    if (!role) return 'var(--ion-color-medium)';
    const lower = role.toLowerCase();
    if (lower === 'admin') return 'var(--ion-color-secondary)';
    if (lower === 'seller') return 'var(--ion-color-primary)';
    return 'var(--ion-color-medium)';
  }

  fetchMessages() {
    if (!this.currentUserId) {
      this.currentUserId = this.authService.getCurrentUser()?.id;
    }
    if (!this.receiverId || !this.currentUserId) return;
    this.chatService.getMessages(this.receiverId).subscribe({
      next: (res) => {
        // Apply local history clearing (only show messages NEWER than the last clear time)
        const clearedAt = localStorage.getItem(`cleared_chat_${this.currentUserId}_${this.receiverId}`);
        if (clearedAt) {
          const clearedTime = parseInt(clearedAt);
          this.messages = res.filter((m: any) => new Date(m.created_at).getTime() > clearedTime);
        } else {
          this.messages = res;
        }

        if (this.receiverId) {
          this.chatService.markAsRead(this.receiverId).subscribe();
        }

        // Auto scroll to bottom
        setTimeout(() => {
          if (this.content) {
            this.content.scrollToBottom(300);
          }
        }, 100);
      }
    });
  }

  canEdit(msg: any): boolean {
    if (!msg.created_at) return false;
    const sentAt = new Date(msg.created_at).getTime();
    const now = new Date().getTime();
    const diffMinutes = (now - sentAt) / (1000 * 60);
    return diffMinutes <= 5;
  }

  send() {
    if (!this.newMessage.trim() || !this.receiverId) return;
    const msg = this.newMessage;
    this.newMessage = '';

    this.chatService.sendMessage(this.receiverId, msg).subscribe({
      next: (res) => {
        this.fetchMessages();
        setTimeout(() => {
          if (this.content) {
            this.content.scrollToBottom(300);
          }
        }, 200);
      }
    });
  }

  async showMessageOptions(msg: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opsi Pesan',
      buttons: [
        {
          text: 'Edit Pesan',
          icon: 'create-outline',
          handler: () => { this.editMessage(msg); }
        },
        {
          text: 'Hapus Pesan',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => { this.confirmDelete(msg.id); }
        },
        {
          text: 'Batal',
          role: 'cancel',
          icon: 'close-outline'
        }
      ]
    });
    await actionSheet.present();
  }

  async editMessage(msg: any) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Pesan',
      inputs: [
        {
          name: 'message',
          type: 'textarea',
          value: msg.message,
          placeholder: 'Tulis pesan baru...'
        }
      ],
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Simpan',
          handler: (data) => {
            if (!data.message.trim()) return false;
            this.chatService.updateMessage(msg.id, data.message).subscribe({
              next: () => {
                this.fetchMessages();
                this.presentToast('Pesan diperbarui', 'create-outline');
              }
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmDelete(msgId: number) {
    const alert = await this.alertCtrl.create({
      header: 'Hapus Pesan?',
      message: 'Pesan ini akan dihapus untuk semua orang.',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            if (!this.currentUserId) this.currentUserId = this.authService.getCurrentUser()?.id;
            this.chatService.deleteMessage(msgId).subscribe({
              next: () => {
                this.fetchMessages();
                this.presentToast('Pesan dihapus', 'trash-outline');
              },
              error: (err) => {
                console.error('Delete error:', err);
                const msg = err.error?.message || 'Gagal menghapus pesan (Hanya bisa hapus pesan sendiri < 5 menit)';
                this.presentToast(msg);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async presentToast(message: string, icon: string = 'checkmark-circle-outline') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'middle',
      icon: icon,
      cssClass: 'zeven-toast'
    });
    toast.present();
  }

  goBack() { window.history.back(); }
}

@Component({
  selector: 'app-transaction-history',
  template: `
    <ion-content class="zeven-bg">
      <div class="zeven-custom-header" style="padding-top: 40px; padding-bottom: 0; background: #F9F6F0;">
        <div class="header-content-row" style="padding: 0 16px 12px;">
          <h2 class="zeven-heading" style="margin: 0; font-size: 22px; font-weight: 800; color: #114232;">Transaksi</h2>
        </div>
        <div class="tabs" style="background: #F9F6F0;">
          <div class="tab" [class.active]="selectedTab === 'all'" (click)="setTab('all')">Semua</div>
          <div class="tab" [class.active]="selectedTab === 'ongoing'" (click)="setTab('ongoing')">Berlangsung</div>
          <div class="tab" [class.active]="selectedTab === 'completed'" (click)="setTab('completed')">Selesai</div>
        </div>
      </div>
      <div class="ion-padding">
      <div *ngIf="isLoading" class="ion-text-center ion-padding">
        <ion-spinner color="primary"></ion-spinner>
      </div>

      <div *ngIf="!isLoading && filteredOrders.length === 0" class="empty-state">
        <ion-icon name="receipt-outline"></ion-icon>
        <p>Belum ada transaksi</p>
      </div>

      <div class="history-card" *ngFor="let order of filteredOrders">
        <div class="card-header">
          <div class="seller-info">
            <ion-icon name="storefront"></ion-icon>
            <span>{{ order.seller?.name || 'Zeven Store' }}</span>
          </div>
          <span class="status" [ngClass]="order.status">{{ order.status | uppercase }}</span>
        </div>
        
        <div *ngFor="let item of order.items" class="item-wrap">
          <div class="card-body" (click)="goToTracking(order.id)">
            <img [src]="productService.storageUrl + item.product?.image" 
                 onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=100'">
            <div class="details">
              <h4>{{ item.product?.name }}</h4>
              <span class="qty">x{{ item.quantity }}</span>
              <div class="price-mini">Rp{{ Number(item.price).toLocaleString('id-ID') }}</div>
            </div>
          </div>
          
          <div class="card-actions-row">
            <ion-button fill="outline" color="primary" size="small" (click)="goToChat(order.seller_id)">
              <ion-icon name="chatbubble-outline" slot="start"></ion-icon> Hubungi Penjual
            </ion-button>
            <ion-button *ngIf="order.status === 'completed'" 
              fill="outline" 
              color="primary" 
              size="small" 
              (click)="goToReview(order.id, item.product_id)"
              [disabled]="item.is_reviewed">
              <ion-icon [name]="item.is_reviewed ? 'checkmark-circle' : 'star-outline'" slot="start"></ion-icon>
              {{ item.is_reviewed ? 'Sudah Diulas' : 'Beri Ulasan' }}
            </ion-button>
            <ion-button class="zeven-gradient-btn" size="small" (click)="buyAgain(item.product_id)">Beli Lagi</ion-button>
          </div>
        </div>

        <div class="order-total-bar">
          <div class="total-label">Total Pesanan:</div>
          <div class="zeven-price">Rp{{ Number(order.final_price).toLocaleString('id-ID') }}</div>
        </div>
      </div>
      <div style="height: 90px; width: 100%;"></div>
      </div>
    </ion-content>
  `,
  styles: [`
    .tabs { display: flex; padding: 0 16px; gap: 24px; overflow-x: auto;  /* JURUS PAMUNGKAS: Matikan variabel warna sukses di level komponen toast ini */
  --ion-color-success: transparent !important;
  --ion-color-success-rgb: 0,0,0 !important;
  --ion-color-primary: #fff !important;

  &::part(button-group) {
    display: none !important;
  }
}
    .tab { padding: 12px 0; font-size: 14px; color: var(--ion-color-medium); font-weight: 500; white-space: nowrap; position: relative; }
    .tab.active { color: var(--ion-color-primary); font-weight: 700; }
    .tab.active::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: var(--ion-color-primary); border-radius: 3px 3px 0 0; }
    
    .history-card { background: white; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); overflow: hidden; }
    .card-header { padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); }
    .status { font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; }
    .status.completed { background: #E8F5E9; color: #2E7D32; }
    .status.pending { background: #FFF3E0; color: #EF6C00; }
    .status.processed { background: #E3F2FD; color: #1565C0; }
    .status.shipped { background: #F3E5F5; color: #7B1FA2; }
    
    .card-body { padding: 16px; display: flex; gap: 12px; }
    .card-body img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; }
    .details h4 { margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #333; }
    .qty { font-size: 12px; color: #888; }
    .price-mini { font-size: 13px; font-weight: 700; color: #C68E17; margin-top: 4px; }
    
    .card-actions-row { padding: 0 16px 16px; display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
    .card-actions-row ion-button { --border-radius: 8px; margin: 0; text-transform: none; font-weight: 700; font-size: 11px; height: 32px; }
    
    .order-total-bar { padding: 12px 16px; background: #fafafa; display: flex; justify-content: flex-end; align-items: center; gap: 8px; border-top: 1px solid #f0f0f0; }
    .total-label { font-size: 12px; color: #666; }
    
    .empty-state { text-align: center; padding: 60px 20px; color: #999; }
    .empty-state ion-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.3; }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TransactionHistoryPage {
  orders: any[] = [];
  selectedTab = 'all';
  isLoading = false;
  Number = Number;

  constructor(
    private router: Router,
    public authService: AuthService,
    private orderService: OrderService,
    public productService: ProductService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() { this.fetchOrders(); }

  setTab(tab: string) { this.selectedTab = tab; }

  get filteredOrders() {
    if (this.selectedTab === 'all') return this.orders;
    if (this.selectedTab === 'ongoing') return this.orders.filter(o => o.status !== 'completed');
    return this.orders.filter(o => o.status === 'completed');
  }

  fetchOrders() {
    this.isLoading = true;
    this.orderService.getMyOrders().subscribe({
      next: (res) => { this.orders = res; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  goToTracking(id: number) { this.router.navigate(['/order-tracking', id]); }
  goToReview(orderId: number, productId: number) { this.router.navigate(['/review-rating', { order_id: orderId, product_id: productId }]); }
  goToChat(sellerId: number) { this.router.navigate(['/chat', { id: sellerId }]); }
  buyAgain(productId: number) { this.router.navigate(['/product-detail', productId]); }
}

@Component({
  selector: 'app-review-rating',
  template: `
    <ion-content class="zeven-bg">
      <div class="zeven-custom-header" style="padding-top: 40px; padding-bottom: 12px; background: #F9F6F0;">
        <div class="header-content-row" style="display: flex; align-items: center; padding: 0 8px;">
          <ion-button (click)="goBack()" fill="clear">
            <ion-icon name="arrow-back-outline" color="dark" slot="icon-only"></ion-icon>
          </ion-button>
          <h2 class="zeven-heading" style="margin: 0 auto; font-size: 18px; font-weight: 800; color: #114232; transform: translateX(-24px);">Tulis Ulasan</h2>
        </div>
      </div>
      <div class="ion-padding">
      <!-- Loading state -->
      <div *ngIf="isLoadingProduct" class="ion-text-center ion-padding" style="margin-top: 100px;">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
      </div>

      <div *ngIf="!isLoadingProduct" class="fade-in">
        <!-- Product Card -->
        <div class="product-card" *ngIf="product">
          <img [src]="productService.storageUrl + product.image"
               onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=100'"
               class="product-thumb">
          <div class="product-info">
            <h4>{{ product.name }}</h4>
            <p class="product-seller">{{ product.seller?.name || 'Zeven Store' }}</p>
            <div class="product-price">Rp{{ Number(product.price).toLocaleString('id-ID') }}</div>
          </div>
        </div>

        <!-- Already Reviewed -->
        <div class="already-reviewed" *ngIf="alreadyReviewed">
          <div class="success-circle">
            <ion-icon name="checkmark-outline"></ion-icon>
          </div>
          <h3>Ulasan Sudah Dikirim</h3>
          <p>Kamu sudah memberikan ulasan untuk produk ini. Terima kasih!</p>
          <ion-button expand="block" class="zeven-gradient-btn" (click)="goBack()">Kembali</ion-button>
        </div>

        <!-- Form Section -->
        <div *ngIf="!alreadyReviewed">
          <!-- Star Rating -->
          <div class="rating-card">
            <p class="rating-prompt">Bagaimana pengalaman berbelanjamu?</p>
            <div class="star-selector">
              <button *ngFor="let star of [1,2,3,4,5]" 
                      class="star-btn" 
                      [class.active]="rating >= star"
                      (click)="setRating(star)">
                <ion-icon [name]="rating >= star ? 'star' : 'star-outline'"></ion-icon>
              </button>
            </div>
            <div class="rating-label-text" *ngIf="rating > 0">
              <span [ngClass]="'label-' + rating">{{ ratingLabels[rating - 1] }}</span>
            </div>
            <div class="rating-placeholder" *ngIf="rating === 0">Ketuk bintang untuk memberi nilai</div>
          </div>

          <!-- Review Text -->
          <div class="review-form-card">
            <div class="form-header">
              <ion-icon name="create-outline" color="primary"></ion-icon>
              <span>Ceritakan pengalamanmu</span>
            </div>
            <textarea 
              [(ngModel)]="reviewText" 
              placeholder="Bagaimana kualitas produk? Apakah sesuai deskripsi? Bagikan pengalamanmu agar membantu pembeli lain..."
              [class.has-text]="reviewText.length > 0"></textarea>
            <div class="char-count" [class.warn]="reviewText.length > 450">
              {{ reviewText.length }}/500
            </div>
          </div>

          <!-- Tips -->
          <div class="review-tips">
            <div class="tip-item">
              <ion-icon name="checkmark-circle-outline" color="success"></ion-icon>
              <span>Ceritakan kelebihan produk yang kamu suka</span>
            </div>
            <div class="tip-item">
              <ion-icon name="checkmark-circle-outline" color="success"></ion-icon>
              <span>Berikan masukan yang membangun penjual</span>
            </div>
          </div>
        </div>
      </div>
      <div style="height: 120px; width: 100%;"></div>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border" *ngIf="!alreadyReviewed && !isLoadingProduct">
      <div class="footer-submit">
        <div class="submit-info" *ngIf="rating > 0">
          <div class="mini-stars">
            <ion-icon *ngFor="let s of [1,2,3,4,5]" 
              [name]="rating >= s ? 'star' : 'star-outline'"
              [class.filled]="rating >= s"></ion-icon>
          </div>
          <span>{{ ratingLabels[rating - 1] }}</span>
        </div>
        <ion-button 
          expand="block" 
          class="submit-btn" 
          (click)="submitReview()" 
          [disabled]="isLoading || rating === 0">
          <ion-icon name="send-outline" slot="start" *ngIf="!isLoading"></ion-icon>
          <ion-spinner name="crescent" *ngIf="isLoading" style="width:20px;height:20px;margin-right:8px;"></ion-spinner>
          {{ isLoading ? 'Mengirim...' : 'Kirim Ulasan' }}
        </ion-button>
      </div>
    </ion-footer>
  `,
  styles: [`
    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .product-card { background: white; border-radius: 20px; padding: 14px; display: flex; gap: 14px; align-items: center; margin-bottom: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .product-thumb { width: 72px; height: 72px; border-radius: 14px; object-fit: cover; flex-shrink: 0; }
    .product-info h4 { margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #333; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .product-seller { margin: 0 0 4px; font-size: 11px; color: #888; }
    .product-price { font-size: 16px; font-weight: 800; color: #C68E17; }

    .already-reviewed { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
    .success-circle { 
        width: 80px; height: 80px; 
        background: #28ba62; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        margin-bottom: 24px;
        box-shadow: 0 10px 20px rgba(40,186,98,0.2);
    }
    .success-circle ion-icon { font-size: 48px; color: white; --ionicon-stroke-width: 48px; }
    .already-reviewed h3 { font-size: 22px; font-weight: 800; color: #114232; margin: 0 0 10px; }
    .already-reviewed p { font-size: 14px; color: #666; margin: 0 0 32px; max-width: 250px; line-height: 1.5; text-align: center; }

    .rating-card { background: white; border-radius: 24px; padding: 24px; text-align: center; margin-bottom: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
    .rating-prompt { font-size: 15px; font-weight: 600; color: #444; margin: 0 0 20px; }
    .star-selector { display: flex; justify-content: center; gap: 12px; margin-bottom: 16px; }
    .star-btn { background: none; border: none; font-size: 40px; cursor: pointer; transition: transform 0.2s, color 0.2s; color: #ddd; padding: 4px; }
    .star-btn.active { color: #ffc409; transform: scale(1.15); }
    .star-btn:active { transform: scale(0.9); }
    .rating-label-text { font-size: 15px; font-weight: 700; min-height: 24px; }
    .label-1 { color: #eb445a; }
    .label-2 { color: #ff9500; }
    .label-3 { color: #ffc409; }
    .label-4 { color: #2dd36f; }
    .label-5 { color: #114232; }
    .rating-placeholder { font-size: 13px; color: #bbb; min-height: 24px; }

    .review-form-card { background: white; border-radius: 20px; padding: 18px; margin-bottom: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
    .form-header { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; font-size: 14px; font-weight: 700; color: #114232; }
    .form-header ion-icon { font-size: 18px; }
    textarea { width: 100%; min-height: 120px; border: 1.5px solid #eee; border-radius: 14px; padding: 14px; font-family: inherit; font-size: 14px; outline: none; resize: none; background: #fafafa; color: #333; box-sizing: border-box; transition: border-color 0.2s; }
    textarea:focus, textarea.has-text { border-color: #114232; background: #fff; }
    .char-count { text-align: right; font-size: 11px; color: #aaa; margin-top: 6px; }
    .char-count.warn { color: #eb445a; }

    .review-tips { padding: 4px 4px 0; display: flex; flex-direction: column; gap: 8px; }
    .tip-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #888; }
    .tip-item ion-icon { font-size: 16px; flex-shrink: 0; }

    .footer-submit { background: white; padding: 16px 20px; padding-bottom: calc(16px + env(safe-area-inset-bottom)); box-shadow: 0 -10px 30px rgba(0,0,0,0.06); border-radius: 24px 24px 0 0; }
    .submit-info { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
    .mini-stars { display: flex; gap: 2px; }
    .mini-stars ion-icon { font-size: 14px; color: #ddd; }
    .mini-stars ion-icon.filled { color: #ffc409; }
    .submit-info span { font-size: 13px; font-weight: 600; color: #555; }
    .submit-btn { --background: linear-gradient(135deg, #114232 0%, #295546 100%); --border-radius: 16px; font-weight: 800; font-size: 15px; margin: 0; height: 54px; text-transform: none; --box-shadow: 0 8px 20px rgba(17,66,50,0.25); }
    .submit-btn[disabled] { --background: #e0e0e0; --color: #aaa; --box-shadow: none; opacity: 1; }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ReviewRatingPage implements OnInit {
  productId: number | null = null;
  orderId: number | null = null;
  product: any;
  rating: number = 0;
  reviewText: string = '';
  isLoading = false;
  isLoadingProduct = false;
  alreadyReviewed = false;
  Number = Number;
  ratingLabels = ['Sangat Buruk', 'Kurang Bagus', 'Cukup', 'Bagus!', 'Luar Biasa! ✨'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public productService: ProductService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orderId = params['order_id'] ? parseInt(params['order_id']) : null;
      this.productId = params['product_id'] ? parseInt(params['product_id']) : null;
      if (this.productId) this.fetchProduct(this.productId);
    });
  }

  fetchProduct(id: number) {
    this.isLoadingProduct = true;
    this.productService.getProduct(id).subscribe({
      next: (res) => { this.product = res; this.isLoadingProduct = false; },
      error: () => this.isLoadingProduct = false
    });
  }

  setRating(val: number) { this.rating = val; }

  submitReview() {
    if (!this.productId || !this.orderId || this.rating === 0) return;
    this.isLoading = true;
    this.productService.postReview({
      product_id: this.productId,
      order_id: this.orderId,
      rating: this.rating,
      review: this.reviewText.trim()
    }).subscribe({
      next: async () => {
        this.isLoading = false;
        // Bersihkan cache agar bintang langsung terupdate di detail produk
        this.productService.clearCache();
        const toast = await this.toastCtrl.create({
          message: '⭐ Ulasan berhasil dikirim! Terima kasih.',
          duration: 2500,
          color: 'success',
          position: 'top'
        });
        toast.present();
        this.alreadyReviewed = true;
      },
      error: async (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Gagal mengirim ulasan';
        if (msg.includes('sudah direview') || msg.includes('already')) {
          this.alreadyReviewed = true;
        }
        const toast = await this.toastCtrl.create({
          message: msg,
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        toast.present();
      }
    });
  }

  goBack() { window.history.back(); }
}

@Component({
  selector: 'app-profile',
  template: `
    <ion-content class="zeven-bg">
      <div class="profile-header">
        <div class="header-top">
          <h1 class="zeven-heading" style="color: white;">Profil</h1>
          <ion-icon name="settings-outline" class="settings-icon" (click)="goToEditProfile()"></ion-icon>
        </div>
        
        <div class="user-card" *ngIf="user">
          <div class="user-avatar">
            <img [src]="authService.getProfileImage(user.profile_image, user.name)" 
                 (error)="$any($event.target).src = 'https://ui-avatars.com/api/?name=' + user.name + '&background=C68E17&color=fff'"
                 alt="Avatar">
          </div>
          <div class="user-info">
            <h2>{{ user.name }}</h2>
            <p>{{ user.email }}</p>
            <div class="membership-badge">
              <ion-icon name="star"></ion-icon> {{ user.role === 'seller' ? 'Seller Zeven' : 'Buyer Zeven' }}
            </div>
          </div>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-item" (click)="goToOrders()">
          <h3>{{ orderCount }}</h3>
          <span>Pesanan Saya</span>
        </div>
        <div class="divider-v"></div>
        <div class="stat-item" (click)="goToWishlist()">
          <h3>{{ wishlistCount }}</h3>
          <span>Favorit</span>
        </div>
        <div class="divider-v"></div>
        <div class="stat-item" (click)="goToVouchers()">
          <h3>{{ voucherCount }}</h3>
          <span>Voucher</span>
        </div>
      </div>

      <div class="menu-list ion-padding">
        <div class="menu-item" (click)="goToAddressList()">
          <div class="menu-icon"><ion-icon name="location-outline"></ion-icon></div>
          <div class="menu-text">Alamat Pengiriman</div>
          <ion-icon name="chevron-forward" color="medium"></ion-icon>
        </div>
        <div class="menu-item" (click)="goToWishlist()">
          <div class="menu-icon"><ion-icon name="heart-outline"></ion-icon></div>
          <div class="menu-text">Daftar Favorit Saya</div>
          <ion-icon name="chevron-forward" color="medium"></ion-icon>
        </div>
        <div class="menu-item" (click)="goToHelpCenter()">
          <div class="menu-icon"><ion-icon name="help-circle-outline"></ion-icon></div>
          <div class="menu-text">Pusat Bantuan</div>
          <ion-icon name="chevron-forward" color="medium"></ion-icon>
        </div>
        <div class="menu-item" (click)="goToPrivacyPolicy()">
          <div class="menu-icon"><ion-icon name="shield-checkmark-outline"></ion-icon></div>
          <div class="menu-text">Kebijakan Privasi</div>
          <ion-icon name="chevron-forward" color="medium"></ion-icon>
        </div>
        
        <ion-button expand="block" color="danger" fill="outline" class="logout-btn ion-margin-top" (click)="logout()">
          Keluar
        </ion-button>
      </div>
      <div style="height: 90px; width: 100%;"></div>
    </ion-content>
  `,
  styles: [`
    .profile-header { background: linear-gradient(135deg, #114232 0%, #295546 100%); padding: 40px 24px 60px; border-radius: 0 0 32px 32px; position: relative; }
    .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .settings-icon { font-size: 24px; color: white; }
    
    .user-card { display: flex; align-items: center; gap: 16px; }
    .user-avatar img { width: 70px; height: 70px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.3); }
    .user-info h2 { margin: 0 0 4px; color: white; font-size: 20px; font-weight: 700; }
    .user-info p { margin: 0 0 8px; color: rgba(255,255,255,0.8); font-size: 14px; }
    .membership-badge { display: inline-flex; align-items: center; gap: 4px; background: rgba(198,142,23,0.9); color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    
    .stats-row { background: white; margin: -30px 24px 20px; border-radius: 16px; padding: 16px; display: flex; justify-content: space-between; box-shadow: 0 4px 15px rgba(0,0,0,0.05); position: relative; z-index: 2; }
    .stat-item { flex: 1; text-align: center; }
    .stat-item h3 { margin: 0 0 4px; font-size: 18px; font-weight: 700; color: var(--ion-color-dark); }
    .stat-item span { font-size: 12px; color: var(--ion-color-medium); }
    .divider-v { width: 1px; background: rgba(0,0,0,0.05); }
    
    .menu-list { padding-top: 0; }
    .menu-item { display: flex; align-items: center; gap: 16px; background: white; padding: 16px; border-radius: 16px; margin-bottom: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
    .menu-icon { width: 40px; height: 40px; border-radius: 12px; background: var(--ion-background-color); color: var(--ion-color-primary); display: flex; justify-content: center; align-items: center; font-size: 20px; }
    .menu-text { flex: 1; font-weight: 600; font-size: 15px; color: var(--ion-color-dark); }
    
    .logout-btn { --border-radius: 12px; font-weight: 600; margin-top: 24px; }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfilePage implements OnInit {
  user: any;
  wishlistCount: number = 0;
  voucherCount: number = 0;
  orderCount: number = 0;

  constructor(
    private router: Router,
    public authService: AuthService,
    private productService: ProductService,
    private chatService: ChatService,
    private voucherService: VoucherService,
    private orderService: OrderService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private auth: AuthService // Adding alias for service call in delete
  ) { }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.authService.getCurrentUser$().subscribe(user => {
      this.user = user;
      this.fetchWishlistCount();
      this.fetchVoucherCount();
      this.fetchOrderCount();
    });
  }

  ionViewWillEnter() {
    this.fetchWishlistCount();
    this.fetchVoucherCount();
    this.fetchOrderCount();
  }

  fetchWishlistCount() {
    this.productService.getWishlist().subscribe({
      next: (res) => this.wishlistCount = res.length,
      error: () => this.wishlistCount = 0
    });
  }

  fetchVoucherCount() {
    this.voucherService.getVouchers().subscribe({
      next: (res) => this.voucherCount = res.length,
      error: () => this.voucherCount = 0
    });
  }

  fetchOrderCount() {
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        // Hanya hitung pesanan yang sedang berjalan (aktif)
        const activeStatuses = ['pending', 'processed', 'shipped'];
        this.orderCount = res.filter((o: any) => activeStatuses.includes(o.status.toLowerCase())).length;
      },
      error: () => this.orderCount = 0
    });
  }

  goToOrders() {
    this.router.navigate(['/tabs/history']);
  }

  goToVouchers() {
    this.router.navigate(['/voucher-list']);
  }

  goToWishlist() {
    this.router.navigate(['/wishlist']);
  }

  goToEditProfile() {
    this.router.navigate(['/edit-profile']);
  }

  goToAddressList() {
    this.router.navigate(['/address-list']);
  }

  goToHelpCenter() {
    this.chatService.getAdminId().subscribe({
      next: (res) => {
        if (res && res.admin_id) {
          // Hanya kirim ID agar ChatPage otomatis ambil nama & foto asli ke server
          this.router.navigate(['/chat', { id: res.admin_id }]);
        } else {
          this.presentToast('Maaf, pusat bantuan tidak tersedia saat ini.');
        }
      },
      error: () => this.presentToast('Gagal menghubungi pusat bantuan.')
    });
  }

  goToPrivacyPolicy() {
    this.router.navigate(['/privacy-policy']);
  }

  async presentToast(message: string, icon: string = 'checkmark-circle') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2500,
      position: 'middle',
      icon: icon,
      cssClass: 'zeven-toast'
    });
    toast.present();
  }

  async logout() {
    this.authService.logout().subscribe({
      next: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Berhasil keluar',
          duration: 2000,
          position: 'middle',
          icon: 'log-out-outline',
          cssClass: 'zeven-toast'
        });
        toast.present();
        this.router.navigate(['/login']);
      },
      error: async (err) => {
        this.router.navigate(['/login']);
      }
    });
  }

  private deleteAccount() {
    this.authService.deleteAccount().subscribe({
      next: async (res: any) => {
        // Hapus color agar tidak ada border ijo
        const toast = await this.toastCtrl.create({
          message: res.message || 'Akun berhasil dihapus',
          duration: 3000,
          position: 'middle',
          icon: 'checkmark-circle-outline',
          cssClass: 'zeven-toast'
        });
        toast.present();

        localStorage.clear();
        // Beri jeda 500ms agar toast muncul dengan sempurna sebelum pindah page
        setTimeout(() => {
          this.router.navigate(['/login'], { replaceUrl: true });
        }, 500);
      },
      error: async (err) => {
        const msg = err.error?.message || 'Gagal menghapus akun';
        const toast = await this.toastCtrl.create({
          message: msg,
          duration: 3000,
          position: 'middle',
          icon: 'alert-circle-outline',
          cssClass: 'zeven-toast'
        });
        toast.present();
      }
    });
  }
}

@Component({
  selector: 'app-edit-profile',
  template: `
    <ion-content class="zeven-bg">
      <div class="zeven-custom-header" style="padding-top: 40px; padding-bottom: 12px; background: #F9F6F0;">
        <div class="header-content-row" style="display: flex; align-items: center; padding: 0 8px;">
          <ion-button (click)="goBack()" fill="clear">
            <ion-icon name="arrow-back-outline" color="dark" slot="icon-only"></ion-icon>
          </ion-button>
          <h2 class="zeven-heading" style="margin: 0 auto; font-size: 18px; font-weight: 800; color: #114232; transform: translateX(-24px);">Ubah Profil</h2>
        </div>
      </div>

      <div class="ion-padding">
      <div class="avatar-section ion-text-center">
        <div class="avatar-container">
          <img [src]="avatarPreview || authService.getProfileImage(user?.profile_image, user?.name)" 
               (error)="$any($event.target).src = 'https://ui-avatars.com/api/?name=' + user?.name + '&background=C68E17&color=fff'"
               alt="Avatar">
          <label for="avatar-input" class="edit-avatar-btn">
            <ion-icon name="camera"></ion-icon>
          </label>
          <input type="file" id="avatar-input" (change)="onFileSelected($event)" accept="image/*" style="display: none;">
        </div>
        <h3 style="margin-bottom: 8px;">Ganti Foto Profil</h3>
        <ion-button *ngIf="user?.profile_image && !avatarPreview" fill="clear" color="danger" size="small" (click)="confirmDeleteAvatar()" style="margin: 0 auto; display: block; --padding-start: 8px; --padding-end: 8px; height: 28px; font-size: 12px;">
          <ion-icon name="trash-outline" slot="start"></ion-icon>
          Hapus Foto
        </ion-button>
      </div>

      <div class="form-container">
        <div class="input-group">
          <label>Nama Lengkap</label>
          <ion-item lines="none" class="zeven-input-item">
            <ion-input type="text" [(ngModel)]="userData.name" placeholder="Nama Lengkap"></ion-input>
          </ion-item>
        </div>

        <div class="input-group ion-margin-top">
          <label>Email</label>
          <ion-item lines="none" class="zeven-input-item disabled">
            <ion-input type="email" [value]="user?.email" readonly></ion-input>
          </ion-item>
          <span class="hint">Email tidak dapat diubah</span>
        </div>

        <div class="input-group ion-margin-top">
          <label>Nomor Telepon</label>
          <ion-item lines="none" class="zeven-input-item">
            <ion-input type="tel" [(ngModel)]="userData.phone" placeholder="Nomor Telepon"></ion-input>
          </ion-item>
        </div>



        <div class="input-group ion-margin-top">
          <label>Password Lama</label>
          <ion-item lines="none" class="zeven-input-item">
            <ion-input type="password" [(ngModel)]="userData.current_password" placeholder="Wajib jika ingin ganti password"></ion-input>
          </ion-item>
        </div>

        <div class="input-group ion-margin-top">
          <label>Password Baru</label>
          <ion-item lines="none" class="zeven-input-item">
            <ion-input type="password" [(ngModel)]="userData.password" placeholder="Kosongkan jika tidak ingin diubah"></ion-input>
          </ion-item>
        </div>

        <div class="input-group ion-margin-top">
          <label>Konfirmasi Password Baru</label>
          <ion-item lines="none" class="zeven-input-item">
            <ion-input type="password" [(ngModel)]="userData.password_confirmation" placeholder="Ulangi password baru Anda"></ion-input>
          </ion-item>
        </div>

        <div class="delete-account-section ion-margin-top">
           <ion-item lines="none" class="delete-item-btn" (click)="confirmDeleteAccount()">
              <ion-icon name="trash-outline" slot="start" color="danger"></ion-icon>
              <ion-label color="danger">Hapus Akun Permanen</ion-label>
              <ion-icon name="chevron-forward" slot="end" color="medium"></ion-icon>
           </ion-item>
           <p class="delete-hint">Setelah dihapus, semua data akun Anda akan hilang selamanya.</p>
        </div>
      </div>
      </div>
      <div style="height: 100px; width: 100%;"></div>
    </ion-content>

    <ion-footer class="ion-no-border ion-padding" style="padding-bottom: calc(16px + env(safe-area-inset-bottom));">
      <ion-button expand="block" class="zeven-gradient-btn" (click)="saveProfile()" [disabled]="isLoading">
        {{ isLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}
      </ion-button>
    </ion-footer>
  `,
  styles: [`
    .avatar-section { margin: 24px 0 32px; }
    .avatar-container { position: relative; display: inline-block; }
    .avatar-container img { width: 100px; height: 100px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.1); object-fit: cover; }
    .edit-avatar-btn { position: absolute; bottom: 0; right: 0; background: var(--ion-color-secondary); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 3px solid white; cursor: pointer; }
    .avatar-section h3 { font-size: 14px; font-weight: 600; color: var(--ion-color-primary); margin-top: 12px; }
    
    .form-container { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
    .input-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--ion-color-dark); margin-left: 4px; }
    .zeven-input-item { --background: #f8f9fa; --border-radius: 12px; --padding-start: 12px; border: 1px solid rgba(0,0,0,0.05); }
    .zeven-input-item.disabled { opacity: 0.6; }
    .hint { font-size: 11px; color: var(--ion-color-medium); margin-left: 4px; margin-top: 4px; display: block; }

    .delete-account-section { margin-top: 40px; border-top: 1px solid #f0f0f0; padding-top: 20px; }
    .delete-item-btn { --background: #fff1f0; --border-radius: 12px; margin-bottom: 8px; cursor: pointer; --min-height: 54px; }
    .delete-hint { font-size: 11px; color: #999; margin-left: 4px; }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditProfilePage implements OnInit {
  user: any;
  userData = { name: '', email: '', phone: '', password: '', password_confirmation: '', current_password: '' };
  isLoading = false;
  avatarPreview: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private router: Router,
    public authService: AuthService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) { }

  async confirmDeleteAvatar() {
    const alert = await this.alertCtrl.create({
      header: 'Hapus Foto Profil?',
      message: 'Apakah Anda yakin ingin menghapus foto profil Anda dan kembali ke inisial nama default?',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            this.deleteAvatar();
          }
        }
      ]
    });
    await alert.present();
  }

  deleteAvatar() {
    this.isLoading = true;
    this.authService.deleteAvatar().subscribe({
      next: async (res) => {
        this.isLoading = false;
        this.avatarPreview = null;
        this.selectedFile = null;
        this.user = this.authService.getCurrentUser();

        const toast = await this.toastCtrl.create({
          message: 'Foto profil berhasil dihapus!',
          duration: 2000,
          color: 'success',
          position: 'top'
        });
        toast.present();
      },
      error: async (err) => {
        this.isLoading = false;
        const toast = await this.toastCtrl.create({
          message: 'Gagal menghapus foto profil',
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        toast.present();
      }
    });
  }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.userData.name = this.user.name || '';
      this.userData.email = this.user.email || '';
      this.userData.phone = this.user.phone || '';
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    this.isLoading = true;

    // Create payload and filter out password fields if password is not entered
    const payload: any = {
      name: this.userData.name,
      email: this.userData.email,
      phone: this.userData.phone
    };

    if (this.userData.password && this.userData.password.trim() !== '') {
      payload.password = this.userData.password;
      payload.password_confirmation = this.userData.password_confirmation;
      payload.current_password = this.userData.current_password;
    }

    // Mengirim avatar sebagai string Base64 dalam satu payload terpadu
    if (this.avatarPreview) {
      payload.avatar_base64 = this.avatarPreview;
    }

    this.updateInfo(payload);
  }

  private updateInfo(payload: any) {
    this.authService.updateProfile(payload).subscribe({
      next: async (res) => {
        this.isLoading = false;
        const toast = await this.toastCtrl.create({
          message: 'Profil berhasil diperbarui!',
          duration: 2000,
          color: 'success',
          position: 'top'
        });
        toast.present();
        this.router.navigate(['/tabs/profile']);
      },
      error: (err) => this.handleError(err)
    });
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2500,
      position: 'middle',
      color: color,
      cssClass: 'zeven-toast'
    });
    toast.present();
  }

  private async handleError(err: any) {
    this.isLoading = false;
    let errorMsg = 'Gagal memperbarui profil';

    if (err.status === 422 && err.error?.errors) {
      const errors = err.error.errors;
      errorMsg = (Object.values(errors)[0] as any[])[0];
    } else if (err.error?.message) {
      errorMsg = err.error.message;
    }

    this.presentToast(errorMsg, 'danger');
  }

  goBack() { window.history.back(); }

  async confirmDeleteAccount() {
    const alert = await this.alertCtrl.create({
      header: 'Hapus Akun?',
      message: 'Apakah Anda yakin ingin menghapus akun secara permanen? Semua data produk, wishlist, dan alamat Anda akan dihapus dan tidak dapat dikembalikan.',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Ya, Hapus',
          role: 'destructive',
          handler: () => { this.deleteAccount(); }
        }
      ]
    });
    await alert.present();
  }

  private deleteAccount() {
    this.authService.deleteAccount().subscribe({
      next: async (res: any) => {
        this.presentToast(res.message || 'Akun berhasil dihapus');
        localStorage.clear();
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: async (err) => {
        const msg = err.error?.message || 'Gagal menghapus akun';
        this.presentToast(msg, 'danger');
      }
    });
  }
}

@Component({
  selector: 'app-address-list',
  template: `
    <ion-content class="zeven-bg ion-padding">
      <div class="zeven-custom-header" style="padding-top: 40px; padding-bottom: 12px; background: #F9F6F0;">
        <div class="header-content-row" style="display: flex; align-items: center; padding: 0 8px;">
          <ion-button (click)="goBack()" fill="clear">
            <ion-icon name="arrow-back-outline" color="dark" slot="icon-only"></ion-icon>
          </ion-button>
          <h2 class="zeven-heading" style="margin: 0 auto; font-size: 18px; font-weight: 800; color: #114232; transform: translateX(-24px);">Daftar Alamat</h2>
        </div>
      </div>
      <div *ngIf="isLoading" class="ion-text-center ion-padding">
        <ion-spinner color="primary"></ion-spinner>
      </div>

      <div *ngIf="!isLoading && addresses.length === 0" class="empty-state">
        <ion-icon name="location-outline"></ion-icon>
        <p>Belum ada alamat yang disimpan.</p>
      </div>

      <div class="address-grid" *ngIf="!isLoading && addresses.length > 0">
        <div class="address-card" *ngFor="let addr of addresses" [class.main]="addr.is_main">
          <div class="card-header">
            <div class="label-badge">{{ addr.label }}</div>
            <div class="main-badge" *ngIf="addr.is_main">Utama</div>
          </div>
          <div class="receiver-row">
            <h4>{{ addr.receiver_name }}</h4>
            <span class="phone">{{ addr.phone_number }}</span>
          </div>
          <p class="address-text">{{ addr.full_address }}</p>
          
          <div class="card-actions">
            <ion-button fill="clear" size="small" (click)="editAddress(addr)">
              <ion-icon name="create-outline" slot="start"></ion-icon> Ubah
            </ion-button>
            <div class="flex-spacer"></div>
            <ion-button *ngIf="!addr.is_main" fill="clear" color="secondary" size="small" (click)="setMain(addr.id)">
              Set Utama
            </ion-button>
            <ion-button fill="clear" color="danger" size="small" (click)="deleteAddress(addr.id)">
              <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border ion-padding">
      <ion-button expand="block" class="zeven-gradient-btn" (click)="addAddress()">
        Tambah Alamat Baru
      </ion-button>
    </ion-footer>
  `,
  styles: [`
    .empty-state { text-align: center; color: var(--ion-color-medium); margin-top: 100px; }
    .empty-state ion-icon { font-size: 64px; opacity: 0.5; margin-bottom: 16px; }
    
    .address-card { background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 2px solid transparent; transition: 0.3s; }
    .address-card.main { border-color: var(--ion-color-primary); }
    
    .card-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .label-badge { background: var(--ion-background-color); padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; color: var(--ion-color-primary); text-transform: uppercase; }
    .main-badge { background: var(--ion-color-primary); color: white; padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 700; }
    
    .receiver-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
    .receiver-row h4 { margin: 0; font-size: 16px; font-weight: 700; color: var(--ion-color-dark); }
    .phone { font-size: 13px; color: var(--ion-color-medium); }
    
    .address-text { margin: 0 0 16px; font-size: 14px; color: var(--ion-color-medium); line-height: 1.5; }
    .card-actions { display: flex; align-items: center; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 8px; }
    .flex-spacer { flex: 1; }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AddressListPage implements OnInit {
  addresses: any[] = [];
  isLoading = false;

  constructor(
    private router: Router,
    private addressService: AddressService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() { }

  ionViewWillEnter() {
    this.fetchAddresses();
  }

  fetchAddresses() {
    this.isLoading = true;
    this.addressService.getAddresses().subscribe({
      next: (res) => {
        this.addresses = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  setMain(id: number) {
    this.addressService.setMainAddress(id).subscribe({
      next: () => {
        this.presentToast('Alamat utama diperbarui');
        this.fetchAddresses();
      }
    });
  }

  deleteAddress(id: number) {
    this.addressService.deleteAddress(id).subscribe({
      next: () => {
        this.presentToast('Alamat berhasil dihapus');
        this.fetchAddresses();
      }
    });
  }

  addAddress() {
    this.router.navigate(['/address-form']);
  }

  editAddress(addr: any) {
    this.router.navigate(['/address-form'], { state: { address: addr } });
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color: 'success', position: 'top' });
    toast.present();
  }

  goBack() { window.history.back(); }
}

@Component({
  selector: 'app-address-form',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="tertiary" style="--padding-top: 8px; --padding-bottom: 8px;">
        <ion-buttons slot="start">
          <ion-button (click)="goBack()" fill="clear" color="dark">
            <ion-icon name="arrow-back-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title class="zeven-heading" style="font-weight: 800; color: #114232; text-align: center;">{{ isEdit ? 'Ubah' : 'Tambah' }} Alamat</ion-title>
        <div slot="end" style="width: 48px;"></div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="zeven-bg ion-padding">
      <div class="form-container fade-in">
        <div class="form-section-title">Informasi Penerima</div>
        
        <div class="premium-input-group">
          <label>Label Alamat</label>
          <div class="premium-input">
            <ion-icon name="bookmark-outline"></ion-icon>
            <input type="text" [(ngModel)]="formData.label" placeholder="Rumah, Kantor, dll">
          </div>
        </div>

        <div class="premium-input-group">
          <label>Nama Lengkap Penerima</label>
          <div class="premium-input">
            <ion-icon name="person-outline"></ion-icon>
            <input type="text" [(ngModel)]="formData.receiver_name" placeholder="Masukkan nama penerima">
          </div>
        </div>

        <div class="premium-input-group">
          <label>Nomor Telepon</label>
          <div class="premium-input">
            <ion-icon name="call-outline"></ion-icon>
            <input type="tel" [(ngModel)]="formData.phone_number" placeholder="Contoh: 08123456789">
          </div>
        </div>

        <div class="form-section-title" style="margin-top: 24px;">Detail Lokasi</div>
        
        <div class="premium-input-group">
          <label>Alamat Lengkap</label>
          <div class="premium-input textarea-input">
            <ion-icon name="location-outline"></ion-icon>
            <textarea [(ngModel)]="formData.full_address" placeholder="Tuliskan nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, dan kode pos" rows="4"></textarea>
          </div>
        </div>

        <div class="toggle-card">
          <div class="toggle-info">
             <div class="toggle-label">Jadikan Alamat Utama</div>
             <div class="toggle-hint">Gunakan ini sebagai alamat tujuan utama kamu</div>
          </div>
          <ion-toggle color="primary" [(ngModel)]="formData.is_main"></ion-toggle>
        </div>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border ion-padding" style="background: white; border-radius: 24px 24px 0 0; box-shadow: 0 -10px 30px rgba(0,0,0,0.05);">
      <ion-button expand="block" class="zeven-gradient-btn" (click)="submit()" [disabled]="isLoading" style="height: 54px; font-size: 16px; --box-shadow: 0 8px 20px rgba(17,66,50,0.25);">
        {{ isLoading ? 'Menyimpan...' : (isEdit ? 'Ubah Alamat Sekarang' : 'Simpan Alamat Sekarang') }}
      </ion-button>
    </ion-footer>
  `,
  styles: [`
    .form-container { 
      background: white; 
      border-radius: 24px; 
      padding: 20px; 
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
      border: 1px solid #f5f5f5;
    }
    .form-section-title {
      font-size: 12px;
      font-weight: 800;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
      padding-left: 4px;
    }
    
    .premium-input-group { margin-bottom: 20px; }
    .premium-input-group label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: #333;
      margin-bottom: 8px;
      margin-left: 4px;
    }
    .premium-input {
      background: #f8f9fa;
      border-radius: 16px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border: 1px solid #eee;
      transition: 0.3s;
    }
    .premium-input:focus-within {
      background: white;
      border-color: var(--ion-color-primary);
      box-shadow: 0 4px 15px rgba(17,66,50,0.05);
    }
    .premium-input ion-icon { font-size: 20px; color: #114232; opacity: 0.7; }
    .premium-input input, .premium-input textarea {
      border: none;
      outline: none;
      background: transparent;
      flex: 1;
      font-size: 14px;
      color: #333;
      font-family: inherit;
    }
    .textarea-input { align-items: flex-start; }
    .textarea-input ion-icon { margin-top: 2px; }
    
    .toggle-card {
      margin-top: 24px;
      background: #F9F6F0;
      border-radius: 18px;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px dashed #C68E17;
    }
    .toggle-label { font-size: 14px; font-weight: 700; color: #114232; }
    .toggle-hint { font-size: 11px; color: #666; margin-top: 2px; }
    
    .fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AddressFormPage implements OnInit {
  formData = {
    label: '',
    receiver_name: '',
    phone_number: '',
    full_address: '',
    is_main: false
  };
  isLoading = false;
  isEdit = false;
  addressId: number | null = null;

  constructor(
    private router: Router,
    private addressService: AddressService,
    private toastCtrl: ToastController
  ) {
    const nav: any = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.address) {
      const addr = nav.extras.state.address;
      this.formData = { ...addr };
      this.isEdit = true;
      this.addressId = addr.id;
    }
  }

  ngOnInit() { }

  submit() {
    if (!this.formData.label || !this.formData.receiver_name || !this.formData.phone_number || !this.formData.full_address) {
      this.presentToast('Harap lengkapi semua data', 'warning');
      return;
    }

    this.isLoading = true;
    if (this.isEdit && this.addressId) {
      this.addressService.updateAddress(this.addressId, this.formData).subscribe({
        next: () => this.handleSuccess('Alamat berhasil diubah'),
        error: (err) => this.handleError(err)
      });
    } else {
      this.addressService.addAddress(this.formData).subscribe({
        next: () => this.handleSuccess('Alamat berhasil disimpan'),
        error: (err) => this.handleError(err)
      });
    }
  }

  handleSuccess(msg: string) {
    this.isLoading = false;
    this.presentToast(msg, 'success');
    this.router.navigate(['/address-list']);
  }

  async handleError(err: any) {
    this.isLoading = false;
    const msg = err.error?.message || 'Terjadi kesalahan';
    this.presentToast(msg, 'danger');
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color, position: 'top' });
    toast.present();
  }

  goBack() { window.history.back(); }
}

@Component({
  selector: 'app-voucher-list',
  template: `
    <ion-content class="zeven-bg ion-padding">
      <div class="zeven-custom-header" style="padding-top: 40px; padding-bottom: 12px; background: #F9F6F0;">
        <div class="header-content-row" style="display: flex; align-items: center; padding: 0 8px;">
          <ion-button (click)="goBack()" fill="clear">
            <ion-icon name="arrow-back-outline" color="dark" slot="icon-only"></ion-icon>
          </ion-button>
          <h2 class="zeven-heading" style="margin: 0 auto; font-size: 18px; font-weight: 800; color: #114232; transform: translateX(-24px);">Voucher Saya</h2>
        </div>
      </div>
      <div *ngIf="isLoading" class="ion-text-center ion-padding">
        <ion-spinner color="primary"></ion-spinner>
      </div>

      <div *ngIf="!isLoading && vouchers.length === 0" class="empty-state">
        <ion-icon name="ticket-outline"></ion-icon>
        <p>Belum ada voucher tersedia.</p>
      </div>

      <div class="voucher-grid" *ngIf="!isLoading && vouchers.length > 0">
        <div class="voucher-card" *ngFor="let v of vouchers">
          <div class="voucher-left">
            <div class="discount-box">
              <span class="percent">{{ v.discount_percent }}%</span>
              <span class="off">OFF</span>
            </div>
          </div>
          
          <div class="voucher-right">
            <div class="voucher-info">
              <h4>{{ v.code }}</h4>
              <p>Maks. Potongan: Rp{{ Number(v.max_discount).toLocaleString('id-ID') }}</p>
              <div class="expiry">
                <ion-icon name="time-outline"></ion-icon>
                <span>Berakhir: {{ v.end_date | date:'d MMM yyyy' }}</span>
              </div>
            </div>
            <div class="copy-box" (click)="copyCode(v.code)">
              <span>SALIN</span>
              <ion-icon name="copy-outline"></ion-icon>
            </div>
          </div>
          
          <div class="hole top"></div>
          <div class="hole bottom"></div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .empty-state { text-align: center; color: var(--ion-color-medium); margin-top: 100px; }
    .empty-state ion-icon { font-size: 64px; opacity: 0.2; margin-bottom: 16px; }
    .voucher-card { background: white; border-radius: 16px; display: flex; margin-bottom: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.04); position: relative; height: 110px; }
    .voucher-left { width: 30%; background: var(--ion-color-primary); display: flex; justify-content: center; align-items: center; color: white; border-right: 2px dashed #eee; }
    .discount-box { text-align: center; display: flex; flex-direction: column; }
    .percent { font-size: 24px; font-weight: 800; line-height: 1; }
    .off { font-size: 10px; font-weight: 600; opacity: 0.8; letter-spacing: 1px; }
    .voucher-right { flex: 1; padding: 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .voucher-info h4 { margin: 0 0 4px; font-size: 18px; font-weight: 800; color: var(--ion-color-primary); letter-spacing: 0.5px; }
    .voucher-info p { margin: 0 0 8px; font-size: 11px; color: var(--ion-color-medium); font-weight: 600; }
    .expiry { display: flex; align-items: center; gap: 4px; color: #DC3545; font-size: 10px; font-weight: 700; }
    .copy-box { background: rgba(198,142,23,0.1); color: var(--ion-color-secondary); padding: 8px 12px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer; min-width: 60px; }
    .copy-box span { font-size: 9px; font-weight: 800; letter-spacing: 1px; }
    .copy-box ion-icon { font-size: 18px; }
    .hole { position: absolute; width: 20px; height: 20px; background: var(--ion-background-color); border-radius: 50%; left: 30%; transform: translateX(-50%); z-index: 2; }
    .hole.top { top: -10px; }
    .hole.bottom { bottom: -10px; }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VoucherListPage implements OnInit {
  vouchers: any[] = [];
  isLoading = false;
  Number = Number;
  constructor(private voucherService: VoucherService, private toastCtrl: ToastController) { }
  ngOnInit() { this.fetchVouchers(); }
  fetchVouchers() {
    this.isLoading = true;
    this.voucherService.getVouchers().subscribe({
      next: (res) => { this.vouchers = res; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }
  async copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      this.presentToast('Kode voucher disalin!');
    } catch (err) {
      const el = document.createElement('textarea');
      el.value = code; document.body.appendChild(el);
      el.select(); document.execCommand('copy');
      document.body.removeChild(el);
      this.presentToast('Kode voucher disalin!');
    }
  }
  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color: 'dark', position: 'top', mode: 'ios' });
    toast.present();
  }
  goBack() { window.history.back(); }
}

@Component({
  selector: 'app-privacy-policy',
  template: `
    <ion-content class="zeven-bg ion-padding">
      <div class="zeven-custom-header" style="padding-top: 40px; padding-bottom: 12px; background: #F9F6F0;">
        <div class="header-content-row" style="display: flex; align-items: center; padding: 0 8px;">
          <ion-button (click)="goBack()" fill="clear">
            <ion-icon name="arrow-back-outline" color="dark" slot="icon-only"></ion-icon>
          </ion-button>
          <h2 class="zeven-heading" style="margin: 0 auto; font-size: 18px; font-weight: 800; color: #114232; transform: translateX(-24px);">Kebijakan Privasi</h2>
        </div>
      </div>
      <div class="privacy-card-header">
        <h2>Kebijakan Privasi</h2>
        <span class="last-updated">Terakhir Diperbarui: 2 Juni 2026</span>
        <p>
          Selamat datang di Zeven. Kebijakan Privasi ini dirancang untuk membantu Anda memahami bagaimana
          platform Zeven (baik melalui website resmi maupun Aplikasi Mobile/APK Android kami) mengumpulkan,
          menggunakan, menyimpan, dan melindungi informasi pribadi Anda secara aman demi kelancaran ekosistem
          marketplace sosial e-commerce kami. Kebijakan ini berlaku sepenuhnya untuk seluruh pengguna, baik
          sebagai Pembeli (Buyer), Penjual (Seller), maupun Administrator.
        </p>
      </div>

      <div class="sections-list">
        <!-- Section 01 -->
        <div class="privacy-section">
          <div class="section-title">
            <span class="section-number">01</span>
            <h3>Pengumpulan Informasi</h3>
          </div>
          <div class="section-content">
            <p>Kami mengumpulkan informasi yang Anda berikan secara langsung saat menggunakan platform kami, termasuk:</p>
            <ul>
              <li><strong>Informasi Akun</strong>: Nama lengkap, alamat email, nomor telepon, foto profil, dan kata sandi yang dienkripsi.</li>
              <li><strong>Informasi Toko (Seller)</strong>: Nama toko, detail rekening bank untuk keperluan penarikan saldo penjualan.</li>
              <li><strong>Informasi Pengiriman</strong>: Alamat pengiriman lengkap untuk keperluan ekspedisi barang dari Seller ke Buyer.</li>
            </ul>
          </div>
        </div>

        <!-- Section 02 -->
        <div class="privacy-section">
          <div class="section-title">
            <span class="section-number">02</span>
            <h3>Izin Perangkat APK Android</h3>
          </div>
          <div class="section-content">
            <p>Untuk pengguna Aplikasi Mobile / APK Zeven di Android, kami memerlukan beberapa izin perangkat agar fitur dapat berjalan optimal:</p>
            <ul>
              <li><strong>Kamera</strong>: Untuk memotret produk langsung (Seller) dan melampirkan bukti transaksi.</li>
              <li><strong>Galeri & Penyimpanan</strong>: Untuk mengunggah berkas gambar produk dan bukti pembayaran dari galeri.</li>
              <li><strong>Jaringan & Internet</strong>: Untuk sinkronisasi data real-time dengan server Zeven.</li>
            </ul>
          </div>
        </div>

        <!-- Section 03 -->
        <div class="privacy-section">
          <div class="section-title">
            <span class="section-number">03</span>
            <h3>Transaksi & DompetX</h3>
          </div>
          <div class="section-content">
            <div class="divider-mini"></div>
            <p>Seluruh proses pembayaran transaksi belanja dilakukan melalui enkripsi tingkat tinggi oleh <strong>DompetX</strong> selaku partner payment gateway resmi kami.</p>
            <ul>
              <li>Sistem Zeven tidak pernah menyimpan detail kartu kredit, kartu debit, atau pembayaran sensitif Anda di server database kami.</li>
              <li>Seluruh pertukaran data transaksi menggunakan tokenisasi aman yang dilindungi langsung oleh sistem enkripsi DompetX.</li>
            </ul>
          </div>
        </div>

        <!-- Section 04 -->
        <div class="privacy-section">
          <div class="section-title">
            <span class="section-number">04</span>
            <h3>Google Sign-In</h3>
          </div>
          <div class="section-content">
            <p>Platform Zeven mendukung integrasi Google Sign-In untuk mempermudah pendaftaran dan login akun:</p>
            <ul>
              <li>Kami hanya mengumpulkan informasi dasar yang diizinkan oleh Google, seperti nama lengkap, alamat email, dan URL foto profil Anda.</li>
              <li>Informasi ini digunakan semata-mata untuk memverifikasi identitas Anda dan membuat akun Zeven Anda secara instan.</li>
            </ul>
          </div>
        </div>

        <!-- Section 05 -->
        <div class="privacy-section">
          <div class="section-title">
            <span class="section-number">05</span>
            <h3>Keamanan Data</h3>
          </div>
          <div class="section-content">
            <p>Kami menerapkan langkah-langkah teknis dan administratif yang kuat untuk menjaga keamanan data pribadi Anda:</p>
            <ul>
              <li>Semua kata sandi akun dienkripsi menggunakan algoritma hashing modern yang aman.</li>
              <li>Semua transfer data antara web, aplikasi seluler, dan server backend kami dilindungi oleh enkripsi SSL/TLS (HTTPS).</li>
            </ul>
          </div>
        </div>

        <!-- Section 06 -->
        <div class="privacy-section">
          <div class="section-title">
            <span class="section-number">06</span>
            <h3>Penghapusan Akun & Data</h3>
          </div>
          <div class="section-content">
            <p>Sesuai ketentuan Google Play Store, kami memberikan hak penuh kepada pengguna untuk meminta penghapusan akun beserta data pribadi terkait secara permanen:</p>
            <ul>
              <li>Ajukan permohonan penghapusan akun ke email resmi <strong>ubp.event.management@gmail.com</strong>.</li>
              <li>Seluruh data pribadi Anda (nama, email, alamat, dan riwayat chat) akan dihapus secara permanen dari database utama kami dalam waktu 3x24 jam.</li>
            </ul>
          </div>
        </div>

        <!-- Section 07 -->
        <div class="privacy-section">
          <div class="section-title">
            <span class="section-number">07</span>
            <h3>Perubahan Kebijakan</h3>
          </div>
          <div class="section-content">
            <p>Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk menyesuaikan dengan perubahan operasional platform, kepatuhan Play Store, atau regulasi hukum yang berlaku. Jika terdapat perubahan signifikan, kami akan memberitahukan Anda melalui notifikasi aplikasi atau email resmi.</p>
          </div>
        </div>

        <!-- Section 08 -->
        <div class="privacy-section">
          <div class="section-title">
            <span class="section-number">08</span>
            <h3>Kontak & Bantuan</h3>
          </div>
          <div class="section-content">
            <p><strong>Tim Pengembang:</strong> ZevenDev</p>
            <p><strong>Email Bantuan:</strong> ubp.event.management@gmail.com</p>
            <p><strong>Alamat:</strong> Perum Pesona Griya Indah, Jalan sinarbaya indah, Telukjambe Timur, Kab. Karawang, Jawa Barat, Indonesia</p>
          </div>
        </div>
      </div>
      <div style="height: 40px; width: 100%;"></div>
    </ion-content>
  `,
  styles: [`
    .privacy-card-header { background: white; border-radius: 20px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 20px; }
    .privacy-card-header h2 { margin: 0 0 8px; font-size: 22px; font-weight: 800; color: var(--ion-color-primary); }
    .last-updated { font-size: 11px; font-family: monospace; color: var(--ion-color-medium); display: block; margin-bottom: 16px; }
    .privacy-card-header p { font-size: 13px; line-height: 1.6; color: var(--ion-color-medium); margin: 0; }

    .sections-list { display: flex; flex-direction: column; gap: 16px; }
    .privacy-section { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
    .section-title { display: flex; align-items: center; justify-content: flex-start; gap: 12px; margin-bottom: 12px; }
    .section-number { width: 28px; height: 28px; border-radius: 8px; background: rgba(17,66,50,0.08); color: var(--ion-color-primary); font-family: monospace; font-weight: 700; font-size: 13px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }
    .section-title h3 { margin: 0; font-size: 16px; font-weight: 700; color: var(--ion-color-primary); text-align: left; display: inline-block; }
    .section-content { font-size: 13px; line-height: 1.6; color: var(--ion-color-medium); }
    .section-content p { margin: 0 0 8px; }
    .section-content ul { margin: 0; padding-left: 16px; }
    .section-content li { margin-bottom: 6px; }
    .section-content li:last-child { margin-bottom: 0; }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PrivacyPolicyPage {
  constructor() { }
  goBack() { window.history.back(); }
}

