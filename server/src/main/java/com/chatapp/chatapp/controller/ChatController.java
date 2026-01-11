package com.chatapp.chatapp.controller;
import com.chatapp.chatapp.model.Message;
import com.chatapp.chatapp.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    
    @MessageMapping("/sendMessage")
    public void sendMessage(@Payload Message message) {
        Message savedMessage = messageService.createMessage(message);
        messagingTemplate.convertAndSend("/topic/room/" + message.getRoomId(), savedMessage);
    }
    
    @MessageMapping("/joinRoom")
    public void joinRoom(@Payload String roomId) {
        messagingTemplate.convertAndSend("/topic/room/" + roomId, "User joined");
    }
}