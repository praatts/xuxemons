import { Component } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../services/auth.service';
import { Message } from '../../../interfaces/message';
import { Conversation } from '../../../interfaces/conversation';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgClass],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  messages: Message[] = [];
  conversation: Conversation | null = null
  messages$;
  conversation$;
  newMessage: string = '';
  subscription = new Subscription();
  sender_id: number = 0;

  constructor(public chatService: ChatService, private authService: AuthService) { 
    this.messages$ = this.chatService.messages$;
    this.conversation$ = this.chatService.conversation$;
  }

  //Al iniciar el component, es subscriu als canvis de la conversa actual i recupera la id del usuari autenticat.
  ngOnInit() {
    //Quan canvia la conversa actual, es carrega els missatges d'aquesta conversa.
    this.subscription.add(
      this.conversation$.subscribe(conversation => {
        if (conversation) {
          this.loadMessages(conversation.id);
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
        this.messages = messages;
      })
    );
  }

  //Al destruir el component, es desubscriu de tots els observables per evitar fuites de memòria.
  ngOnDestroy() {
    this.subscription.unsubscribe();
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
    const conversation = this.chatService.getConversationValue();
    const content = this.newMessage.trim();

    if (conversation && content) {
      this.chatService.sendMessage(conversation.id, content).subscribe({
        next: (message) => {
          const updatedMessages = [...this.chatService.getMessagesValue(), message]; //Afegeix el nou missatge a l'estat actual dels missatges.
          this.chatService.setMessages(updatedMessages); //Actualitza els missatges
          this.newMessage = ''; //Neteja el camp de text després d'enviar el missatge.
        },
        error: (error) => {
          console.error('Error enviant missatge:', error);
        }
      });
    }
  }

  
}
