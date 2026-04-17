import { Component } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../services/auth.service';
import { FriendshipService } from '../services/friendship.service';
import { UserService } from '../services/user.service';
import { Message } from '../../../interfaces/message';
import { Conversation } from '../../../interfaces/conversation';
import { Friend } from '../../../interfaces/friend';
import { EMPTY, Subscription, catchError, switchMap, timer } from 'rxjs';
import { NgClass } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  messages: Message[] = [];
  conversation: Conversation | null = null;
  friends: Friend[] = [];
  messages$;
  conversation$;
  newMessage: string = '';
  subscription = new Subscription();
  messagesPollingSubscription: Subscription | null = null;
  sender_id: number | null = null;
  messageControl = new FormControl('');

  constructor(public chatService: ChatService, private authService: AuthService, private friendshipService: FriendshipService, private userService: UserService) { 
    this.messages$ = this.chatService.messages$;
    this.conversation$ = this.chatService.conversation$;
  }

  //Al iniciar el component, es subscriu als canvis de la conversa actual i recupera la id del usuari autenticat.
  ngOnInit() {
    this.getFriends()

    //Quan canvia la conversa actual, es carrega els missatges d'aquesta conversa.
    this.subscription.add(
      this.conversation$.subscribe(conversation => {
        this.conversation = conversation;
        if (conversation) {
          this.startMessagesPolling(conversation.id);
        } else {
          this.stopMessagesPolling();
          this.chatService.setMessages([]);
        }
      })
    );

    //Recupera la id de l'usuari autenticat per identificar qui envia els missatges.
    this.subscription.add(
      this.authService.getUserId().subscribe(user_id => {
        this.sender_id = user_id;
      })
    );

    //Quan canvia l'estat dels missatges, s'actualitza la llista de missatges de la conversa
    this.subscription.add(
      this.messages$.subscribe(messages => {
        this.messages = messages.slice().reverse();
      })
    );
  }

  //Al destruir el component, es desubscriu de tots els observables per evitar fuites de memòria.
  ngOnDestroy() {
    this.stopMessagesPolling();
    this.subscription.unsubscribe();
  }

  //Inicia un refresc periòdic dels missatges per mantenir el xat actualitzat en temps real.
  startMessagesPolling(conversation_id: number) {
    this.stopMessagesPolling();

    //Subscripció que cada 1.5s recupera missatges i actualitza els missatges de la conversa actual. 
    this.messagesPollingSubscription = timer(0, 1500).pipe(
      switchMap(() => this.chatService.getMessages(conversation_id)),
      catchError((error) => {
        return EMPTY; //En cas d'error, no actualitza els missatges
      })
    ).subscribe(messages => {
      this.chatService.setMessages(messages);
    });
  }

  //Mètode per aturar el refresc de missatges periòdic.
  stopMessagesPolling() {
    this.messagesPollingSubscription?.unsubscribe();
    this.messagesPollingSubscription = null;
  }

  //Carrega els missatges d'una conversa concreta i actualitza l'estat dels missatges a través del servei.
  loadMessages(conversation_id: number) {
    this.chatService.getMessages(conversation_id).subscribe({
      next: (messages) => this.chatService.setMessages(messages),
      error: (error) => console.error('Error al carregar missatges:', error)
    });
  }

  //Envia un missatge a la conversa actual i actualitza l'estat dels missatges després d'enviar-lo.
  sendMessage() {
    const currentConversation = this.chatService.getConversationValue();
    const content = this.messageControl.value?.trim();

    if (currentConversation && content) {
      this.chatService.sendMessage(currentConversation.id, content).subscribe({
        next: (message) => {
          const updatedMessages = [...this.chatService.getMessagesValue(), message]; //Afegeix el nou missatge a l'estat actual dels missatges.
          this.chatService.setMessages(updatedMessages); //Actualitza els missatges
          this.messageControl.reset(); //Neteja el camp de text després d'enviar el missatge.
        },
        error: (error) => {
          console.error('Error enviant missatge:', error);
        }
      });
    }
  }

  //Carrega la llista d'amics de l'usuari autenticat.
  getFriends() {
    this.friendshipService.getFriends().subscribe({
      next: (friends) => this.friends = friends,
      error: (error) => console.error('Error al carregar amics:', error)
    });
  }

  selectFriend(friend_id: number) {
    //Quan es selecciona un amic, es crea una nova conversa amb aquest amic i es carrega aquesta conversa com a conversa actual.
    this.chatService.createConversation(friend_id).subscribe({
      next: (conversation) => {
        this.chatService.setConversation(conversation);
      },
      error: (error) => console.error('Error seleccionant amic:', error)
    });
  }
  
  //Mètode per formatar la data de creació amb temps relatiu (ex: "fa 5 minuts", "fa 2 hores", etc.)
  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000); //Calcula la diferència en segons entre la data actual i la data de creació del missatge.
    return this.getRelativeTime(diffInSeconds);
  }

  //Mètode auxiliar per convertir els segons de diferència en un format de temps relatiu llegible.
  getRelativeTime(diffInSeconds: number): string {
    if (diffInSeconds < 60) {
      return `Ara mateix`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `fa ${minutes} minut${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `fa ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `fa ${days} dia${days > 1 ? 's' : ''}`;
    }
  } 

  //Indica si un missatge encara es pot editar/eliminar (només missatges propis i dins del primer minut).
  canModifyMessage(message: Message): boolean {
    if (message.deleted) {
      return false;
    }

    //Comprovació usuari autenticat = remitent del missatge
    if (this.sender_id === null || message.sender_id !== this.sender_id) {
      return false;
    }

    const createdAt = new Date(message.created_at).getTime();
    //Comprovació que la data de creació del missatge és vàlida i té un format de número correcte.
    if (Number.isNaN(createdAt)) {
      return false;
    }

    const difference = Date.now() - createdAt;
    return difference >= 0 && difference < 60000;
  }
  
  //Mètode per eliminar un missatge concret de la conversa actual (temps màxim 1min després de enviar-lo)
  deleteMessage(message_id: number) {
    this.chatService.deleteMessage(message_id).subscribe({
      next: () => {
        //Actualitzem el llistat de missatges, marcant com a 'deleted' el missatge seleccionat.
        const updatedMessages = this.chatService.getMessagesValue().map(msg =>
          msg.id === message_id
            ? { ...msg, deleted: true }
            : msg
        );
        this.chatService.setMessages(updatedMessages);
      },
      error: (error) => {
        console.error('Error eliminant missatge:', error);
      }
    });
  }

  //Mètode per editar el contingut d'un missatge concret de la conversa actual (temps màxim 1min després de enviar-lo)
  editMessage(message_id: number, newContent: string) {
    this.chatService.editMessage(message_id, newContent).subscribe({
      next: (updatedMessage) => {
        //Actualitzem el llistat de missatges, reemplaçant el contingut del missatge editat pel nou contingut.
        const updatedMessages = this.chatService.getMessagesValue().map(msg =>
          msg.id === message_id
            ? { ...msg, content: updatedMessage.content, updated_at: updatedMessage.updated_at }
            : msg
        );
        this.chatService.setMessages(updatedMessages);
      },
      error: (error) => {
        console.error('Error editant missatge:', error);
      }
    });
  }
}
