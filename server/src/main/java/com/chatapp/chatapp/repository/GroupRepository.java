package com.chatapp.chatapp.repository;


import com.chatapp.chatapp.model.Group;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupRepository extends MongoRepository<Group, String> {
    List<Group> findByMembers_UserId(String userId);
}