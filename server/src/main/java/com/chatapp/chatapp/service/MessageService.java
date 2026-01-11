package com.chatapp.chatapp.service;

import com.chatapp.chatapp.model.Message;
import com.chatapp.chatapp.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    
    public List<Message> getMessagesByRoomId(String roomId) {
        return messageRepository.findByRoomIdOrderByTimestampAsc(roomId);
    }
    
    public Message createMessage(Message message) {
        message.setTimestamp(LocalDateTime.now());
        return messageRepository.save(message);
    }
}
