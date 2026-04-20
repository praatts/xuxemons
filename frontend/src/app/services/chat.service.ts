import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Message } from '../../../interfaces/message';
import { Conversation } from '../../../interfaces/conversation';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { P } from '@angular/cdk/keycodes';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'http://localhost:8000/api';
  private echo: Echo<any> | null = null;

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private conversationSubject = new BehaviorSubject<Conversation | null>(null);
  private realTimeMessageSubject = new BehaviorSubject<Message | null>(null);
  public messages$;
  public conversation$;
  public realTimeMessage$;

  constructor(private http: HttpClient) { 
    this.messages$ = this.messagesSubject.asObservable();
    this.conversation$ = this.conversationSubject.asObservable();
    this.realTimeMessage$ = this.realTimeMessageSubject.asObservable();
  }

  private initializeEcho(): boolean {
    Pusher.logToConsole = true;
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    if (this.echo) return true;

    (window as any).Pusher = Pusher;
    this.echo = new Echo({
      broadcaster: 'pusher',
      key: '8a9ee89cc6e88037db28',
      cluster: 'eu',
      forceTLS: true,
      authEndpoint: 'http://localhost:8000/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    return true;
  }
  

  //Crea una nova conversa amb un altre usuari i retorna la conversa creada.
  createConversation(reciver_id: number): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/conversations`, { receiver_id: reciver_id });
  }

  //Retorna els missatges d'una conversa concreta.
  getMessages(conversation_id: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/messages`, { params: { conversation_id: conversation_id.toString() } });
  }

  //Envia un missatge a una conversa concreta.
  sendMessage(conversation_id: number, content: string): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/messages`, { conversation_id, content });
  }

  //Actualitza els missatges de la conversa actual.
  setMessages(messages: Message[]) {
    this.messagesSubject.next(messages);
  }

  addMessage(message: Message) {
    const current = this.messagesSubject.value;
    this.messagesSubject.next([...current, message]);
  }

  //Retorna l'estat actual dels missatges de la conversa.
  getMessagesValue(): Message[] {
    return this.messagesSubject.value;
  }

  //Actualitza la conversa actual.
  setConversation(conversation: Conversation | null) {
    this.conversationSubject.next(conversation);
  }

  //Retorna l'estat actual de la conversa.
  getConversationValue(): Conversation | null {
    return this.conversationSubject.value;
  }

  //Mètode per eliminar un missatge concret de la conversa actual.
  deleteMessage(message_id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/messages/${message_id}`);
  }

  //Mètode per editar el contingut d'un missatge concret de la conversa actual.
  editMessage(message_id: number, newContent: string): Observable<Message> {
    return this.http.patch<Message>(`${this.apiUrl}/messages/${message_id}/edit`, { content: newContent });
  }

  //Mètode per escoltar els missatges nous que arriben a la conversa actual.
  subscribeToConversation(conversation_id: number) {
    if (!this.initializeEcho() || !this.echo) {
      return;
    }
    console.log('Subscrivint a la conversa:', conversation_id);
    this.echo.private(`chat.${conversation_id}`)
  .listen('.message.sent', (event: any) => {
    this.realTimeMessageSubject.next(event.message);
  });
  }

  //Mètode per deixar d'escoltar els missatges nous de la conversa actual.
  unsubscribeFromConversation(conversation_id: number) {
    if (!this.echo) {
      return;
    }
    this.echo.leave(`chat.${conversation_id}`);
  }

  getSocketId(): string | null {
    return this.echo?.socketId() ?? null;
  }
}
