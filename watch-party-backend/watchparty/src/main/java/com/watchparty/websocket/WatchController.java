package com.watchparty.websocket;

import com.watchparty.model.Room;
import com.watchparty.repository.RoomRepository;
import com.watchparty.service.RoomStateStore;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WatchController {

    private final SimpMessagingTemplate messagingTemplate;
    private final RoomStateStore roomStateStore;
    private final RoomRepository roomRepository;

    @MessageMapping("/watch/{roomCode}")
    public void handleEvent(
            @DestinationVariable String roomCode,
            WatchEvent event,
            Authentication authentication
    ) {
        Room room = roomRepository
                .findByRoomCode(roomCode)
                .orElseThrow();

        String userEmail = authentication.getName();

        // 🚫 Non-host → ignore
        if (!room.getHostEmail().equals(userEmail)) {
            System.out.println("🚫 Non-host tried to control: " + userEmail);
            return;
        }

        // ✅ Persist latest state for late joiners
        roomStateStore.update(roomCode, event);

        // ✅ Broadcast FULL event (INCLUDING videoId)
        messagingTemplate.convertAndSend(
                "/topic/watch/" + roomCode,
                event
        );

        System.out.println("🎬 Host event broadcasted: " + event);
    }

    @MessageMapping("/chat/{roomCode}")
    public void chat(
            @DestinationVariable String roomCode,
            ChatMessage message,
            Authentication auth
    ) {
        // ✅ SAFE sender resolution
        String sender = (auth != null) ? auth.getName() : "Guest";

        message.setSender(sender);
        message.setTimestamp(System.currentTimeMillis());

        messagingTemplate.convertAndSend(
                "/topic/chat/" + roomCode,
                message
        );

        System.out.println("💬 Chat from: " + sender);
    }
}