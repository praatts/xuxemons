import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Message } from '../../../interfaces/message';
import { Conversation } from '../../../interfaces/conversation';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'http://localhost:8000/api';

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private conversationSubject = new BehaviorSubject<Conversation | null>(null);
  public messages$;
  public conversation$;

  constructor(private http: HttpClient) { 
    this.messages$ = this.messagesSubject.asObservable();
    this.conversation$ = this.conversationSubject.asObservable();
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
}




