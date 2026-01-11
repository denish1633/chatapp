package com.chatapp.chatapp.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateGroupRequest {
    private String name;
    private String description;
    private String groupPic;
    private List<String> memberIds;
}