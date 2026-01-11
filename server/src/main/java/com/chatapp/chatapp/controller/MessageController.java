package com.chatapp.chatapp.controller;

import com.chatapp.chatapp.model.Message;
import com.chatapp.chatapp.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/message")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;
    
    @GetMapping("/{roomId}")
    public ResponseEntity<List<Message>> getMessagesByRoomId(@PathVariable String roomId) {
        return ResponseEntity.ok(messageService.getMessagesByRoomId(roomId));
    }
    
    @PostMapping("/new")
    public ResponseEntity<Message> createMessage(@RequestBody Message message) {
        return ResponseEntity.ok(messageService.createMessage(message));
    }
}