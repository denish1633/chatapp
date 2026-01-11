package com.chatapp.chatapp.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "groups")
public class Group {
    @Id
    private String id;
    private String name;
    private String description;
    private String groupPic;
    private String roomId;
    private String createdBy;
    private LocalDateTime createdAt;
    private List<GroupMember> members = new ArrayList<>();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupMember {
        private String userId;
        private String role; // ADMIN, MEMBER
        private LocalDateTime joinedAt;
    }
}
